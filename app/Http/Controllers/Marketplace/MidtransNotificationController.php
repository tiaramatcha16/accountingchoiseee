<?php

namespace App\Http\Controllers\Marketplace;

use App\Exceptions\GoogleDriveCopyException;
use App\Mail\OrderPaidDeliveryMail;
use App\Models\Order;
use App\Services\GoogleDriveCopyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Throwable;

class MidtransNotificationController
{
    public function __invoke(Request $request, GoogleDriveCopyService $googleDrive): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'order_id' => ['required', 'string'],
            'status_code' => ['required', 'string'],
            'gross_amount' => ['required', 'string'],
            'signature_key' => ['required', 'string'],
            'transaction_status' => ['required', 'string'],
            'transaction_id' => ['nullable', 'string'],
            'fraud_status' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payload = $validator->validated();
        $serverKey = config('services.midtrans.server_key');
        if (! is_string($serverKey) || $serverKey === '') {
            return response()->json(['message' => 'Payment gateway is not configured.'], 503);
        }

        $expectedSignature = hash(
            'sha512',
            $payload['order_id'].$payload['status_code'].$payload['gross_amount'].$serverKey,
        );

        if (! hash_equals($expectedSignature, strtolower($payload['signature_key']))) {
            return response()->json(['message' => 'Invalid notification signature.'], 403);
        }

        $order = Order::query()->where('order_number', $payload['order_id'])->firstOrFail();

        if ($order->payment_gateway !== 'midtrans') {
            return response()->json(['message' => 'Payment gateway does not match this order.'], 409);
        }

        if (
            ! preg_match('/^\d+(?:\.\d{1,2})?$/D', $payload['gross_amount'])
            || number_format((float) $payload['gross_amount'], 2, '.', '') !== number_format($order->total_amount, 2, '.', '')
        ) {
            return response()->json(['message' => 'Payment amount does not match this order.'], 422);
        }

        $isPaid = $payload['transaction_status'] === 'settlement'
            || ($payload['transaction_status'] === 'capture' && ($payload['fraud_status'] ?? null) === 'accept');
        $isCancelled = in_array($payload['transaction_status'], ['deny', 'cancel', 'expire'], true);

        $order = DB::transaction(function () use ($order, $payload, $isPaid, $isCancelled) {
            $lockedOrder = Order::query()->lockForUpdate()->findOrFail($order->id);
            $updates = [];

            if ($isPaid && $lockedOrder->status !== Order::STATUS_PAID) {
                $updates['status'] = Order::STATUS_PAID;
                $updates['paid_at'] = now();
            } elseif ($isCancelled && $lockedOrder->status === Order::STATUS_PENDING) {
                $updates['status'] = Order::STATUS_CANCELLED;
            }

            if (! empty($payload['transaction_id'])) {
                $updates['payment_reference'] = $payload['transaction_id'];
            }

            if ($updates !== []) {
                $lockedOrder->update($updates);
            }

            return $lockedOrder->fresh();
        });

        if ($order->status === Order::STATUS_PAID) {
            $order->loadMissing('items');

            foreach ($order->items->whereNotNull('google_sheet_id') as $item) {
                $targetEmail = $item->recipient_email ?: $order->customer_email;
                if (! is_string($targetEmail) || $targetEmail === '') {
                    return response()->json(['message' => 'Buyer email is required to share the purchased spreadsheet.'], 422);
                }

                try {
                    $googleDrive->createBuyerCopy($item, $targetEmail, $order->order_number);
                } catch (GoogleDriveCopyException $exception) {
                    Log::error('Paid Google Sheets order could not be copied or shared.', [
                        'order_number' => $order->order_number,
                        'order_item_id' => $item->id,
                        'reason' => $exception->getMessage(),
                    ]);

                    return response()->json(['message' => 'Google Sheets delivery is not ready.'], 503);
                }
            }
        }

        if ($order->status === Order::STATUS_PAID && $order->customer_email !== null) {
            if (in_array(config('mail.default'), ['log', 'array'], true)) {
                Log::error('Midtrans payment is settled, but email delivery is not configured.', [
                    'order_number' => $order->order_number,
                ]);

                return response()->json(['message' => 'Email delivery service is not configured.'], 503);
            }

            $claimed = Order::query()
                ->whereKey($order->id)
                ->whereNull('delivery_email_sent_at')
                ->update(['delivery_email_sent_at' => now()]);

            if ($claimed === 1) {
                $order->load('items.product');

                try {
                    Mail::to($order->customer_email)->send(new OrderPaidDeliveryMail($order));
                } catch (Throwable $exception) {
                    $order->newQuery()
                        ->whereKey($order->id)
                        ->update(['delivery_email_sent_at' => null]);

                    throw $exception;
                }
            }
        }

        return response()->json(['received' => true]);
    }
}

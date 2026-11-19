<?php

namespace App\Services;

use App\Exceptions\MidtransPaymentException;
use App\Models\CartItem;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class MidtransSnapService
{
    public function isConfigured(): bool
    {
        return filled(config('services.midtrans.server_key'));
    }

    /**
     * @param  Collection<int, CartItem>  $cartItems
     * @param  array{name: string, phone: string, email: string}  $customer
     * @return array{token: string, redirect_url: string}
     */
    public function createTransaction(string $orderNumber, int $amount, Collection $cartItems, array $customer): array
    {
        $serverKey = config('services.midtrans.server_key');
        if (! is_string($serverKey) || $serverKey === '') {
            throw new MidtransPaymentException('Midtrans Server Key belum dikonfigurasi.');
        }

        $production = (bool) config('services.midtrans.is_production');
        $baseUrl = $production
            ? 'https://app.midtrans.com'
            : 'https://app.sandbox.midtrans.com';

        $phone = preg_replace('/\D+/', '', $customer['phone']) ?? '';
        if (str_starts_with($phone, '0')) {
            $phone = '62'.substr($phone, 1);
        }

        $payload = [
            'transaction_details' => [
                'order_id' => $orderNumber,
                'gross_amount' => $amount,
            ],
            'enabled_payments' => ['gopay'],
            'item_details' => $cartItems->map(fn (CartItem $cartItem) => [
                'id' => (string) $cartItem->product_id,
                'price' => (int) $cartItem->product->price,
                'quantity' => (int) $cartItem->quantity,
                'name' => mb_substr($cartItem->product->title, 0, 50),
            ])->all(),
            'customer_details' => [
                'first_name' => $customer['name'],
                'email' => $customer['email'],
                'phone' => $phone,
            ],
            'callbacks' => [
                'finish' => route('orders.index'),
            ],
        ];

        try {
            $response = Http::acceptJson()
                ->withBasicAuth($serverKey, '')
                ->timeout(20)
                ->post($baseUrl.'/snap/v1/transactions', $payload);
        } catch (ConnectionException $exception) {
            throw new MidtransPaymentException('Tidak dapat terhubung ke Midtrans.', $exception);
        }

        if (! $response->successful()) {
            throw new MidtransPaymentException('Midtrans menolak pembuatan pembayaran (HTTP '.$response->status().').');
        }

        $data = $response->json();
        $token = is_array($data) ? ($data['token'] ?? null) : null;
        $redirectUrl = is_array($data) ? ($data['redirect_url'] ?? null) : null;
        $redirectHost = is_string($redirectUrl) ? parse_url($redirectUrl, PHP_URL_HOST) : null;
        $expectedHost = parse_url($baseUrl, PHP_URL_HOST);

        if (
            ! is_string($token)
            || $token === ''
            || ! is_string($redirectUrl)
            || ! str_starts_with($redirectUrl, 'https://')
            || $redirectHost !== $expectedHost
        ) {
            throw new MidtransPaymentException('Respons pembayaran Midtrans tidak valid.');
        }

        return [
            'token' => $token,
            'redirect_url' => $redirectUrl,
        ];
    }
}

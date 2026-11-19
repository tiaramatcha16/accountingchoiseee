<?php

namespace App\Http\Controllers\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BuyerOrderController extends Controller
{
    public function index(Request $request, \App\Services\GoogleDriveCopyService $googleDrive): Response
    {
        $orders = Order::query()->where('buyer_id', $request->user()->id)
            ->with([
                'items:id,order_id,product_id,product_title,unit_price,google_sheet_id,recipient_email,delivery_file_id,delivery_url',
                'items.product:id,usage_guide',
            ])
            ->latest()->paginate(15);

        $orders->getCollection()->each(function (Order $order) use ($googleDrive) {
            if ($order->status === Order::STATUS_PAID && $googleDrive->isConfigured()) {
                foreach ($order->items as $item) {
                    if (filled($item->google_sheet_id) && blank($item->delivery_url)) {
                        try {
                            $targetEmail = $item->recipient_email ?: $order->customer_email;
                            $googleDrive->createBuyerCopy($item, $targetEmail, $order->order_number);
                            $item->refresh();
                        } catch (\Throwable $e) {
                            \Illuminate\Support\Facades\Log::warning("Lazy Google Sheets copy creation failed for item {$item->id}: {$e->getMessage()}");
                        }
                    }
                }
            }

            $order->items->each(function (OrderItem $item) {
                $item->setAttribute('guide_available', filled($item->product?->usage_guide));
                $item->unsetRelation('product');
            });
        });

        return Inertia::render('marketplace/orders', [
            'orders' => $orders,
            'status' => $request->session()->get('status'),
        ]);
    }

    public function download(Request $request, Order $order, OrderItem $item): StreamedResponse
    {
        abort_unless($order->buyer_id === $request->user()->id, 404);
        abort_unless($order->status === Order::STATUS_PAID, 403, 'Pesanan belum dibayar.');
        abort_unless($item->order_id === $order->id, 404);

        $product = $item->product;
        $filePath = $item->file_path ?: $product?->file_path;
        $fileName = $item->file_name ?: $product?->original_filename;
        abort_unless(is_string($filePath) && is_string($fileName) && Storage::disk('local')->exists($filePath), 404);

        $product?->increment('download_count');
        $downloadName = preg_replace('/[^A-Za-z0-9._-]/', '-', $fileName) ?: 'template.xlsx';

        return Storage::disk('local')->download($filePath, $downloadName);
    }
}

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
    public function index(Request $request): Response
    {
        $orders = Order::query()->where('buyer_id', $request->user()->id)
            ->with('items:id,order_id,product_id,product_title,unit_price')
            ->latest()->paginate(15);

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
        abort_unless($product && Storage::disk('local')->exists($product->file_path), 404);

        $product->increment('download_count');
        $downloadName = preg_replace('/[^A-Za-z0-9._-]/', '-', $product->original_filename) ?: 'template.xlsx';

        return Storage::disk('local')->download($product->file_path, $downloadName);
    }
}

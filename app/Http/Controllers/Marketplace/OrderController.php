<?php

namespace App\Http\Controllers\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function store(Product $product): RedirectResponse
    {
        abort_unless($product->status === Product::STATUS_PUBLISHED, 404);

        $order = DB::transaction(function () use ($product) {
            $order = Order::query()->create([
                'order_number' => 'XL-'.Str::upper(Str::random(12)),
                'buyer_id' => request()->user()->id,
                'total_amount' => $product->price,
                'status' => Order::STATUS_PENDING,
            ]);

            $order->items()->create([
                'product_id' => $product->id,
                'product_title' => $product->title,
                'unit_price' => $product->price,
            ]);

            return $order;
        });

        return to_route('orders.index')->with('status', 'Pesanan '.$order->order_number.' dibuat dan menunggu pembayaran terverifikasi admin.');
    }
}

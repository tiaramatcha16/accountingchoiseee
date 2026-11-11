<?php

namespace App\Http\Controllers\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BuyerDashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $buyerId = $request->user()->id;

        return Inertia::render('marketplace/dashboard', [
            'stats' => [
                'orders' => Order::query()->where('buyer_id', $buyerId)->count(),
                'pending' => Order::query()->where('buyer_id', $buyerId)->where('status', Order::STATUS_PENDING)->count(),
                'paid' => Order::query()->where('buyer_id', $buyerId)->where('status', Order::STATUS_PAID)->count(),
                'totalSpent' => Order::query()->where('buyer_id', $buyerId)->where('status', Order::STATUS_PAID)->sum('total_amount'),
            ],
            'recentOrders' => Order::query()->where('buyer_id', $buyerId)
                ->with('items:id,order_id,product_title,unit_price')
                ->latest()->limit(5)->get(),
            'featuredProducts' => Product::query()->where('status', Product::STATUS_PUBLISHED)
                ->latest('published_at')->latest('id')->limit(4)
                ->get(['id', 'title', 'slug', 'category', 'description', 'price']),
        ]);
    }
}

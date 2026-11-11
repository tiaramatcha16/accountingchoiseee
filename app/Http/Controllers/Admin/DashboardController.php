<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'products' => Product::count(),
                'published' => Product::where('status', Product::STATUS_PUBLISHED)->count(),
                'orders' => Order::count(),
                'pendingOrders' => Order::where('status', Order::STATUS_PENDING)->count(),
                'revenue' => Order::where('status', Order::STATUS_PAID)->sum('total_amount'),
            ],
            'recentOrders' => Order::with('buyer:id,name,email')->latest()->limit(8)->get(),
            'topProducts' => Product::withCount('orderItems')->orderByDesc('order_items_count')->limit(5)->get(['id', 'title', 'price', 'status']),
        ]);
    }
}

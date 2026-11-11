<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $paidOrders = Order::query()->where('status', Order::STATUS_PAID);
        $monthlyRows = Order::query()->where('status', Order::STATUS_PAID)
            ->where('paid_at', '>=', now()->subMonths(5)->startOfMonth())
            ->get(['paid_at', 'total_amount'])
            ->groupBy(fn (Order $order) => $order->paid_at?->format('Y-m'))
            ->map(fn ($orders, $month) => ['month' => $month, 'total' => $orders->sum('total_amount')])
            ->values();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'products' => Product::count(),
                'published' => Product::where('status', Product::STATUS_PUBLISHED)->count(),
                'drafts' => Product::where('status', Product::STATUS_DRAFT)->count(),
                'orders' => Order::count(),
                'pendingOrders' => Order::where('status', Order::STATUS_PENDING)->count(),
                'cancelledOrders' => Order::where('status', Order::STATUS_CANCELLED)->count(),
                'users' => User::count(),
                'revenue' => $paidOrders->sum('total_amount'),
            ],
            'recentOrders' => Order::with('buyer:id,name,email')->latest()->limit(8)->get(),
            'topProducts' => Product::withCount('orderItems')->orderByDesc('order_items_count')->limit(5)->get(['id', 'title', 'price', 'status']),
            'salesByMonth' => $monthlyRows,
        ]);
    }
}

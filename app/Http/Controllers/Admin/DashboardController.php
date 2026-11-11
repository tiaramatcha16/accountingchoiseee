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
            'salesByMonth' => Order::query()->where('status', Order::STATUS_PAID)
                ->where('paid_at', '>=', now()->subMonths(5)->startOfMonth())
                ->selectRaw('YEAR(paid_at) as year, MONTH(paid_at) as month_number, SUM(total_amount) as total')
                ->groupBy('year', 'month_number')->orderBy('year')->orderBy('month_number')->get(),
        ]);
    }
}

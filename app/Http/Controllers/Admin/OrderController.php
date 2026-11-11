<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->with('buyer:id,name,email', 'items:id,order_id,product_title,unit_price')
            ->when($request->string('status')->toString(), fn ($query, $status) => $query->where('status', $status))
            ->when($request->string('q')->toString(), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('order_number', 'like', '%'.$search.'%')
                        ->orWhereHas('buyer', fn ($buyer) => $buyer->where('name', 'like', '%'.$search.'%')->orWhere('email', 'like', '%'.$search.'%'));
                });
            })
            ->latest()->paginate(20)->withQueryString();

        return Inertia::render('admin/orders', [
            'orders' => $orders,
            'filters' => $request->only('status', 'q'),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in([Order::STATUS_PAID, Order::STATUS_CANCELLED])],
            'payment_reference' => ['nullable', 'string', 'max:255'],
        ]);

        if ($order->status !== Order::STATUS_PENDING) {
            return back()->withErrors(['status' => 'Hanya pesanan pending yang dapat diproses.']);
        }

        DB::transaction(function () use ($order, $validated) {
            $order->update([
                'status' => $validated['status'],
                'payment_reference' => $validated['payment_reference'] ?? null,
                'paid_at' => $validated['status'] === Order::STATUS_PAID ? now() : null,
            ]);
        });

        return back()->with('status', 'Status pesanan diperbarui. Verifikasi pembayaran aktual sebelum menandai lunas.');
    }
}

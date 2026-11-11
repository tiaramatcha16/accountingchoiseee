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
    public function index(): Response
    {
        return Inertia::render('admin/orders', [
            'orders' => Order::query()->with('buyer:id,name,email', 'items:id,order_id,product_title,unit_price')
                ->latest()->paginate(20),
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

        return back()->with('status', 'Status pesanan diperbarui. Pastikan pembayaran sudah diverifikasi sebelum menandai lunas.');
    }
}

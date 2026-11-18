<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\GoogleDriveCopyException;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\GoogleDriveCopyService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function markPaid(Order $order, GoogleDriveCopyService $googleDrive): RedirectResponse
    {
        if ($order->status !== Order::STATUS_PAID) {
            $order->update([
                'status' => Order::STATUS_PAID,
                'paid_at' => now(),
            ]);

            $order->loadMissing('items', 'buyer');
            foreach ($order->items->whereNotNull('google_sheet_id') as $item) {
                $email = $order->customer_email ?: $order->buyer?->email;
                if ($email) {
                    try {
                        $googleDrive->createBuyerCopy($item, $email, $order->order_number);
                    } catch (GoogleDriveCopyException $exception) {
                        Log::error("Gagal membuat salinan Google Sheets untuk pesanan {$order->order_number}: ".$exception->getMessage());
                    }
                }
            }
        }

        return back()->with('status', "Pesanan {$order->order_number} berhasil ditandai Lunas dan salinan Google Sheets siap diakses.");
    }

    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->with('buyer:id,name,email', 'items:id,order_id,product_title,unit_price,google_sheet_id,delivery_url,delivery_file_id')
            ->when($request->string('status')->toString(), fn ($query, $status) => $query->where('status', $status))
            ->when($request->string('q')->toString(), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('order_number', 'like', '%'.$search.'%')
                        ->orWhere('customer_name', 'like', '%'.$search.'%')
                        ->orWhere('customer_email', 'like', '%'.$search.'%')
                        ->orWhere('customer_phone', 'like', '%'.$search.'%')
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
}

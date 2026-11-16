<?php

namespace App\Http\Controllers\Marketplace;

use App\Exceptions\GoogleDriveCopyException;
use App\Exceptions\MidtransPaymentException;
use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Services\GoogleDriveCopyService;
use App\Services\MidtransSnapService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function showCheckout(Request $request, MidtransSnapService $midtrans): Response|RedirectResponse
    {
        $products = $this->cartProducts($request);

        if ($products->isEmpty()) {
            return to_route('catalog.index')->withErrors(['cart' => 'Keranjang belum berisi template yang tersedia.']);
        }

        return Inertia::render('marketplace/checkout', [
            'items' => $products->map(fn (Product $product) => [
                'id' => $product->id,
                'title' => $product->title,
                'category' => $product->category,
                'price' => $product->price,
            ]),
            'total' => $products->sum('price'),
            'customer' => [
                'name' => $request->user()->name,
                'phone' => $request->user()->phone,
                'email' => $request->user()->email,
            ],
            'offlineCheckout' => ! $midtrans->isConfigured()
                && config('services.midtrans.offline_checkout_enabled'),
        ]);
    }

    public function checkout(
        Request $request,
        MidtransSnapService $midtrans,
        GoogleDriveCopyService $googleDrive,
    ): RedirectResponse|\Symfony\Component\HttpFoundation\Response {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:150'],
            'customer_phone' => ['required', 'string', 'max:30', 'regex:/^[0-9+\s()\-]{8,30}$/'],
            'customer_email' => ['required', 'email', 'max:255'],
        ]);

        $products = $this->cartProducts($request);

        if ($products->isEmpty()) {
            throw ValidationException::withMessages([
                'payment' => 'Keranjang kosong atau template yang dipilih sudah tidak tersedia.',
            ]);
        }

        foreach ($products as $product) {
            if ($product->google_sheet_id === null
                && (! is_string($product->file_path) || ! Storage::disk('local')->exists($product->file_path))) {
                throw ValidationException::withMessages([
                    'payment' => 'File salah satu template belum tersedia. Silakan hubungi admin sebelum melakukan pembayaran.',
                ]);
            }
        }

        $totalAmount = (int) $products->sum('price');
        if ($totalAmount < 1) {
            throw ValidationException::withMessages([
                'payment' => 'Total pembayaran harus lebih dari Rp 0 untuk checkout QRIS.',
            ]);
        }

        $usesMidtrans = $midtrans->isConfigured();

        if (
            $usesMidtrans
            && $products->contains(fn (Product $product) => filled($product->google_sheet_id))
            && ! $googleDrive->isConfigured()
        ) {
            throw ValidationException::withMessages([
                'payment' => 'Pengiriman Google Sheets belum dikonfigurasi. Admin perlu menyiapkan koneksi Google Drive sebelum pembayaran dapat dilakukan.',
            ]);
        }

        if ($usesMidtrans) {
            foreach ($products->whereNotNull('google_sheet_id') as $product) {
                try {
                    $googleDrive->validateMaster($product->google_sheet_id);
                } catch (GoogleDriveCopyException $exception) {
                    Log::warning('Google Sheets master failed checkout validation.', [
                        'product_id' => $product->id,
                        'reason' => $exception->getMessage(),
                    ]);

                    throw ValidationException::withMessages([
                        'payment' => 'Salah satu template Google Sheets belum dapat diakses. Admin perlu memeriksa link dan koneksi Google Drive sebelum pembayaran.',
                    ]);
                }
            }
        }

        if (! $usesMidtrans && ! config('services.midtrans.offline_checkout_enabled')) {
            throw ValidationException::withMessages([
                'payment' => 'Pembayaran QRIS belum dikonfigurasi. Silakan coba kembali nanti.',
            ]);
        }

        if ($usesMidtrans && in_array(config('mail.default'), ['log', 'array'], true)) {
            throw ValidationException::withMessages([
                'payment' => 'Pengiriman email belum disiapkan. Silakan coba kembali setelah admin mengaktifkan layanan email.',
            ]);
        }

        $orderNumber = 'XL-'.Str::upper(Str::random(12));
        $payment = null;

        if ($usesMidtrans) {
            try {
                $payment = $midtrans->createTransaction(
                    $orderNumber,
                    $totalAmount,
                    $products,
                    [
                        'name' => $validated['customer_name'],
                        'phone' => $validated['customer_phone'],
                        'email' => $validated['customer_email'],
                    ],
                );
            } catch (MidtransPaymentException $exception) {
                Log::warning('Midtrans Snap transaction creation failed.', [
                    'order_number' => $orderNumber,
                    'reason' => $exception->getMessage(),
                ]);

                throw ValidationException::withMessages([
                    'payment' => 'Pembayaran QRIS belum dapat dibuat. Periksa kembali data atau coba beberapa saat lagi.',
                ]);
            }
        }

        DB::transaction(function () use ($request, $products, $validated, $totalAmount, $orderNumber, $payment) {
            $order = Order::query()->create([
                'order_number' => $orderNumber,
                'buyer_id' => $request->user()->id,
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'customer_email' => mb_strtolower($validated['customer_email']),
                'total_amount' => $totalAmount,
                'status' => Order::STATUS_PENDING,
                'payment_gateway' => $payment === null ? 'offline' : 'midtrans',
                'payment_url' => $payment['redirect_url'] ?? null,
            ]);

            foreach ($products as $product) {
                $order->items()->create([
                    'product_id' => $product->id,
                    'product_title' => $product->title,
                    'unit_price' => $product->price,
                    'file_path' => $product->google_sheet_id === null ? $product->file_path : null,
                    'file_name' => $product->google_sheet_id === null ? $product->original_filename : null,
                    'google_sheet_id' => $product->google_sheet_id,
                ]);
            }

            CartItem::query()
                ->where('user_id', $request->user()->id)
                ->whereIn('product_id', $products->modelKeys())
                ->delete();
        });

        if ($payment !== null) {
            return Inertia::location($payment['redirect_url']);
        }

        return to_route('orders.index')->with(
            'status',
            'Pesanan tersimpan untuk uji coba. Belum ada pembayaran, unduhan, atau pengiriman email.',
        );
    }

    public function store(Request $request, Product $product): RedirectResponse
    {
        abort_unless($product->status === Product::STATUS_PUBLISHED, 404);

        CartItem::query()->firstOrCreate([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
        ]);

        return to_route('checkout.show');
    }

    /**
     * @return Collection<int, Product>
     */
    private function cartProducts(Request $request): Collection
    {
        return Product::query()
            ->whereIn('id', $request->user()->cartItems()->pluck('product_id'))
            ->where('status', Product::STATUS_PUBLISHED)
            ->orderBy('id')
            ->get();
    }
}

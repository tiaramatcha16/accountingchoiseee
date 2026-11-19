<?php

namespace App\Http\Controllers\Marketplace;

use App\Exceptions\GoogleDriveCopyException;
use App\Exceptions\MidtransPaymentException;
use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Services\CartService;
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
        $cartItems = $this->cartItemsWithProducts($request);

        if ($cartItems->isEmpty()) {
            return to_route('catalog.index')->withErrors(['cart' => 'Keranjang belum berisi template yang tersedia.']);
        }

        $checkoutItems = [];
        $total = 0;

        foreach ($cartItems as $cartItem) {
            $product = $cartItem->product;
            if (! $product) {
                continue;
            }
            $quantity = max(1, (int) $cartItem->quantity);
            $total += (int) $product->price * $quantity;

            for ($i = 1; $i <= $quantity; $i++) {
                $checkoutItems[] = [
                    'cart_key' => "{$product->id}_{$i}",
                    'id' => $product->id,
                    'unit_number' => $i,
                    'total_units' => $quantity,
                    'title' => $product->title,
                    'category' => $product->category,
                    'price' => (int) $product->price,
                    'is_google_sheet' => filled($product->google_sheet_id),
                ];
            }
        }

        return Inertia::render('marketplace/checkout', [
            'items' => $checkoutItems,
            'total' => $total,
            'customer' => [
                'name' => $request->user()->name,
                'phone' => $request->user()->phone,
                'email' => $request->user()->email,
            ],
            'offlineCheckout' => ! $midtrans->isConfigured()
                && config('services.midtrans.offline_checkout_enabled'),
            'directSuccess' => (bool) config('services.midtrans.direct_success', false),
        ]);
    }

    public function checkout(
        Request $request,
        MidtransSnapService $midtrans,
        GoogleDriveCopyService $googleDrive,
    ): RedirectResponse|\Symfony\Component\HttpFoundation\Response {
        $itemEmails = $request->input('item_emails');
        if (is_array($itemEmails)) {
            foreach ($itemEmails as $productId => $emails) {
                if (is_string($emails)) {
                    $itemEmails[$productId] = [0 => $emails];
                }
            }

            $request->merge(['item_emails' => $itemEmails]);
        }

        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:150'],
            'customer_phone' => ['required', 'string', 'max:30', 'regex:/^[0-9+\s()\-]{8,30}$/'],
            'customer_email' => ['required', 'email', 'max:255'],
            'item_emails' => ['nullable', 'array'],
            'item_emails.*' => ['nullable', 'array'],
            'item_emails.*.*' => ['nullable', 'email', 'max:255'],
        ]);

        $cartItems = $this->cartItemsWithProducts($request);

        if ($cartItems->isEmpty()) {
            throw ValidationException::withMessages([
                'payment' => 'Keranjang kosong atau template yang dipilih sudah tidak tersedia.',
            ]);
        }

        $products = $cartItems->map->product->filter();

        foreach ($products as $product) {
            if ($product->google_sheet_id === null
                && (! is_string($product->file_path) || ! Storage::disk('local')->exists($product->file_path))) {
                throw ValidationException::withMessages([
                    'payment' => 'File salah satu template belum tersedia. Silakan hubungi admin sebelum melakukan pembayaran.',
                ]);
            }
        }

        $totalAmount = 0;
        foreach ($cartItems as $cartItem) {
            if ($cartItem->product) {
                $totalAmount += (int) $cartItem->product->price * max(1, (int) $cartItem->quantity);
            }
        }

        if ($totalAmount < 1) {
            throw ValidationException::withMessages([
                'payment' => 'Total pembayaran harus lebih dari Rp 0 untuk checkout QRIS.',
            ]);
        }

        $directSuccess = (bool) config('services.midtrans.direct_success', false);
        $usesMidtrans = ! $directSuccess && $midtrans->isConfigured();

        if (
            ($usesMidtrans || $directSuccess)
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

        if (! $usesMidtrans && ! $directSuccess && ! config('services.midtrans.offline_checkout_enabled')) {
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
                    $cartItems,
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

        $order = DB::transaction(function () use ($request, $cartItems, $validated, $totalAmount, $orderNumber, $payment, $directSuccess) {
            $order = Order::query()->create([
                'order_number' => $orderNumber,
                'buyer_id' => $request->user()->id,
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'customer_email' => mb_strtolower($validated['customer_email']),
                'total_amount' => $totalAmount,
                'status' => $directSuccess ? Order::STATUS_PAID : Order::STATUS_PENDING,
                'paid_at' => $directSuccess ? now() : null,
                'payment_gateway' => $directSuccess ? 'direct_test' : ($payment === null ? 'offline' : 'midtrans'),
                'payment_url' => $payment['redirect_url'] ?? null,
            ]);

            foreach ($cartItems as $cartItem) {
                $product = $cartItem->product;
                if (! $product) {
                    continue;
                }
                $quantity = max(1, (int) $cartItem->quantity);

                for ($i = 1; $i <= $quantity; $i++) {
                    $rawEmail = $validated['item_emails'][$product->id] ?? null;
                    $itemEmail = is_array($rawEmail) ? ($rawEmail[$i] ?? ($rawEmail[0] ?? null)) : null;

                    $resolvedEmail = filled($itemEmail)
                        ? mb_strtolower(trim($itemEmail))
                        : mb_strtolower(trim($validated['customer_email']));

                    $order->items()->create([
                        'product_id' => $product->id,
                        'unit_number' => $i,
                        'product_title' => $quantity > 1 ? "{$product->title} (#{$i})" : $product->title,
                        'unit_price' => $product->price,
                        'file_path' => $product->google_sheet_id === null ? $product->file_path : null,
                        'file_name' => $product->google_sheet_id === null ? $product->original_filename : null,
                        'google_sheet_id' => $product->google_sheet_id,
                        'recipient_email' => $resolvedEmail,
                    ]);
                }
            }

            CartItem::query()
                ->where('user_id', $request->user()->id)
                ->delete();

            return $order;
        });

        if ($directSuccess) {
            $order->loadMissing('items');
            foreach ($order->items->whereNotNull('google_sheet_id') as $item) {
                $targetEmail = $item->recipient_email ?: $validated['customer_email'];
                try {
                    $googleDrive->createBuyerCopy($item, $targetEmail, $orderNumber);
                } catch (GoogleDriveCopyException $exception) {
                    Log::error("Direct checkout Google Sheets copy failed: ".$exception->getMessage());
                }
            }

            return to_route('orders.index')->with(
                'status',
                'Pembayaran berhasil disimulasikan! Salinan Google Sheets Anda telah dibuat dan siap dibuka.',
            );
        }

        if ($payment !== null) {
            return Inertia::location($payment['redirect_url']);
        }

        return to_route('orders.index')->with(
            'status',
            'Pesanan tersimpan untuk uji coba. Belum ada pembayaran, unduhan, atau pengiriman email.',
        );
    }

    public function store(Request $request, Product $product, CartService $cart): RedirectResponse
    {
        abort_unless($product->status === Product::STATUS_PUBLISHED, 404);

        $validated = $request->validate([
            'quantity' => ['nullable', 'integer', 'min:1', 'max:'.CartItem::MAX_QUANTITY],
        ]);

        $cart->add(
            (int) $request->user()->id,
            $product,
            (int) ($validated['quantity'] ?? 1),
        );

        return to_route('checkout.show');
    }

    /**
     * @return Collection<int, CartItem>
     */
    private function cartItemsWithProducts(Request $request): Collection
    {
        $cartItems = $request->user()->cartItems()
            ->with('product')
            ->get()
            ->filter(fn ($item) => $item->product !== null && $item->product->status === Product::STATUS_PUBLISHED)
            ->values();

        if ($cartItems->contains(
            fn (CartItem $cartItem) => $cartItem->quantity < 1 || $cartItem->quantity > CartItem::MAX_QUANTITY,
        )) {
            throw ValidationException::withMessages([
                'quantity' => 'Jumlah template di keranjang harus antara 1 dan '.CartItem::MAX_QUANTITY.' unit.',
            ]);
        }

        return $cartItems;
    }
}

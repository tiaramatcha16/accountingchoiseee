<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

test('paid buyer receives guidance grounded in the purchased template guide', function () {
    config([
        'services.gemini.api_key' => 'gemini-guide-test-key',
        'services.gemini.model' => 'gemini-guide-test-model',
    ]);

    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $guide = 'Langkah pertama, buat salinan template. Isi tanggal transaksi pada kolom Tanggal. Total dihitung otomatis.';
    $product = Product::create([
        'created_by' => $seller->id,
        'title' => 'Buku Kas Harian',
        'slug' => 'buku-kas-harian-guide',
        'category' => 'Keuangan',
        'description' => 'Mencatat transaksi harian.',
        'price' => 15000,
        'google_sheet_id' => 'private-master-sheet-id',
        'usage_guide' => $guide,
        'status' => Product::STATUS_PUBLISHED,
        'published_at' => now(),
    ]);
    $order = Order::create([
        'order_number' => 'XL-GUIDE123456',
        'buyer_id' => $buyer->id,
        'total_amount' => 15000,
        'status' => Order::STATUS_PAID,
    ]);
    $item = $order->items()->create([
        'product_id' => $product->id,
        'product_title' => $product->title,
        'unit_price' => 15000,
    ]);

    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [[
                'content' => ['parts' => [[
                    'text' => json_encode([
                        'answer' => 'Mulai dengan mengisi tanggal transaksi pada kolom Tanggal.',
                        'evidence' => 'Isi tanggal transaksi pada kolom Tanggal.',
                    ]),
                ]]],
            ]],
        ]),
    ]);

    $this->actingAs($buyer)->postJson("/my-orders/{$order->id}/items/{$item->id}/guide", [
        'consent' => true,
        'question' => 'Bagian mana untuk tanggal? https://docs.google.com/spreadsheets/d/private-question-sheet/edit',
        'history' => [['role' => 'user', 'content' => 'Saya baru membuka templatenya. https://docs.google.com/spreadsheets/d/private-history-sheet/edit']],
    ])->assertOk()
        ->assertJsonPath('answer', 'Mulai dengan mengisi tanggal transaksi pada kolom Tanggal.')
        ->assertJsonPath('source', 'Isi tanggal transaksi pada kolom Tanggal.')
        ->assertJsonPath('supported', true);

    Http::assertSent(fn (HttpRequest $request) => $request->hasHeader('x-goog-api-key', 'gemini-guide-test-key')
        && str_contains($request->body(), 'Isi tanggal transaksi pada kolom Tanggal.')
        && str_contains($request->body(), 'Bagian mana untuk tanggal?')
        && str_contains($request->body(), 'Saya baru membuka templatenya.')
        && ! str_contains($request->body(), 'private-master-sheet-id')
        && ! str_contains($request->body(), 'private-question-sheet')
        && ! str_contains($request->body(), 'private-history-sheet'));

    $this->get('/my-orders')->assertInertia(fn ($page) => $page
        ->component('marketplace/orders')
        ->where('orders.data.0.items.0.guide_available', true)
        ->missing('orders.data.0.items.0.usage_guide')
        ->missing('orders.data.0.items.0.google_sheet_id'));
});

test('unsupported answers are rejected when Gemini cannot cite the admin guide', function () {
    config(['services.gemini.api_key' => 'gemini-guide-test-key']);

    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $product = Product::create([
        'created_by' => $seller->id,
        'title' => 'Buku Kas',
        'slug' => 'buku-kas-unsupported-guide',
        'category' => 'Keuangan',
        'description' => 'Mencatat transaksi.',
        'price' => 10000,
        'usage_guide' => 'Isi tanggal transaksi pada kolom Tanggal.',
        'status' => Product::STATUS_PUBLISHED,
        'published_at' => now(),
    ]);
    $order = Order::create([
        'order_number' => 'XL-GUIDE234567',
        'buyer_id' => $buyer->id,
        'total_amount' => 10000,
        'status' => Order::STATUS_PAID,
    ]);
    $item = $order->items()->create([
        'product_id' => $product->id,
        'product_title' => $product->title,
        'unit_price' => 10000,
    ]);

    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [[
                'content' => ['parts' => [[
                    'text' => json_encode([
                        'answer' => 'Gunakan rumus laba bersih pada kolom akhir.',
                        'evidence' => 'rumus laba bersih',
                    ]),
                ]]],
            ]],
        ]),
    ]);

    $this->actingAs($buyer)->postJson("/my-orders/{$order->id}/items/{$item->id}/guide", [
        'consent' => true,
        'question' => 'Bagaimana menghitung laba?',
    ])->assertOk()
        ->assertJsonPath('supported', false)
        ->assertJsonPath('source', null)
        ->assertJsonPath('answer', 'Maaf, panduan admin untuk template ini belum memuat jawaban tersebut. Supaya tidak menebak, silakan tanyakan langsung kepada admin.');
});

test('only the owner of a paid order can ask about its purchased template', function () {
    $buyer = User::factory()->create();
    $otherBuyer = User::factory()->create();
    $seller = User::factory()->create();
    $product = Product::create([
        'created_by' => $seller->id,
        'title' => 'Kas Harian',
        'slug' => 'kas-harian-guide-access',
        'category' => 'Keuangan',
        'description' => 'Mencatat transaksi.',
        'price' => 10000,
        'usage_guide' => 'Isi tanggal transaksi pada kolom Tanggal.',
        'status' => Product::STATUS_PUBLISHED,
        'published_at' => now(),
    ]);
    $unpaidOrder = Order::create([
        'order_number' => 'XL-GUIDE345678',
        'buyer_id' => $buyer->id,
        'total_amount' => 10000,
        'status' => Order::STATUS_PENDING,
    ]);
    $unpaidItem = $unpaidOrder->items()->create([
        'product_id' => $product->id,
        'product_title' => $product->title,
        'unit_price' => 10000,
    ]);
    $paidOrder = Order::create([
        'order_number' => 'XL-GUIDE456789',
        'buyer_id' => $buyer->id,
        'total_amount' => 10000,
        'status' => Order::STATUS_PAID,
    ]);
    $paidItem = $paidOrder->items()->create([
        'product_id' => $product->id,
        'product_title' => $product->title,
        'unit_price' => 10000,
    ]);
    Http::fake();

    $this->actingAs($buyer)->postJson("/my-orders/{$unpaidOrder->id}/items/{$unpaidItem->id}/guide", [
        'question' => 'Bagaimana mulai?',
    ])->assertForbidden();
    $this->actingAs($otherBuyer)->postJson("/my-orders/{$paidOrder->id}/items/{$paidItem->id}/guide", [
        'question' => 'Bagaimana mulai?',
    ])->assertNotFound();
    Http::assertNothingSent();
});

test('buyer gets a setup message instead of an AI guess when the admin guide is empty', function () {
    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $product = Product::create([
        'created_by' => $seller->id,
        'title' => 'Template Baru',
        'slug' => 'template-baru-guide-empty',
        'category' => 'Bisnis',
        'description' => 'Template pencatatan.',
        'price' => 10000,
        'status' => Product::STATUS_PUBLISHED,
        'published_at' => now(),
    ]);
    $order = Order::create([
        'order_number' => 'XL-GUIDE567890',
        'buyer_id' => $buyer->id,
        'total_amount' => 10000,
        'status' => Order::STATUS_PAID,
    ]);
    $item = $order->items()->create([
        'product_id' => $product->id,
        'product_title' => $product->title,
        'unit_price' => 10000,
    ]);
    Http::fake();

    $this->actingAs($buyer)->postJson("/my-orders/{$order->id}/items/{$item->id}/guide", [
        'consent' => true,
        'question' => 'Bagaimana cara mulai?',
    ])->assertOk()
        ->assertJsonPath('supported', false)
        ->assertJsonPath('source', null)
        ->assertJsonPath('answer', 'Panduan penggunaan untuk template ini sedang disiapkan admin. Untuk sementara, silakan tanyakan langsung kepada admin.');

    Http::assertNothingSent();
});

test('buyer must consent before sending a question to Gemini', function () {
    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $product = Product::create([
        'created_by' => $seller->id,
        'title' => 'Template Persediaan',
        'slug' => 'template-persediaan-guide-consent',
        'category' => 'Bisnis',
        'description' => 'Pencatatan persediaan.',
        'price' => 10000,
        'usage_guide' => 'Isi nama barang dan jumlah pada kolom yang tersedia.',
        'status' => Product::STATUS_PUBLISHED,
        'published_at' => now(),
    ]);
    $order = Order::create([
        'order_number' => 'XL-GUIDE678901',
        'buyer_id' => $buyer->id,
        'total_amount' => 10000,
        'status' => Order::STATUS_PAID,
    ]);
    $item = $order->items()->create([
        'product_id' => $product->id,
        'product_title' => $product->title,
        'unit_price' => 10000,
    ]);
    Http::fake();

    $this->actingAs($buyer)->postJson("/my-orders/{$order->id}/items/{$item->id}/guide", [
        'question' => 'Bagaimana cara mulai?',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('consent');

    Http::assertNothingSent();
});

test('Gemini configuration errors are reported without sending a request', function () {
    config(['services.gemini.api_key' => null]);

    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $product = Product::create([
        'created_by' => $seller->id,
        'title' => 'Template Persediaan',
        'slug' => 'template-persediaan-guide-no-gemini',
        'category' => 'Bisnis',
        'description' => 'Pencatatan persediaan.',
        'price' => 10000,
        'usage_guide' => 'Isi nama barang dan jumlah pada kolom yang tersedia.',
        'status' => Product::STATUS_PUBLISHED,
        'published_at' => now(),
    ]);
    $order = Order::create([
        'order_number' => 'XL-GUIDE789012',
        'buyer_id' => $buyer->id,
        'total_amount' => 10000,
        'status' => Order::STATUS_PAID,
    ]);
    $item = $order->items()->create([
        'product_id' => $product->id,
        'product_title' => $product->title,
        'unit_price' => 10000,
    ]);
    Http::fake();

    $this->actingAs($buyer)->postJson("/my-orders/{$order->id}/items/{$item->id}/guide", [
        'consent' => true,
        'question' => 'Bagaimana cara mulai?',
    ])->assertStatus(503)
        ->assertJsonPath('message', 'Panduan AI belum tersedia saat ini. Silakan coba kembali atau hubungi admin.');

    Http::assertNothingSent();
});

test('admin cannot publish a product before adding its usage guide', function () {
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $seller = User::factory()->create();
    $product = Product::create([
        'created_by' => $seller->id,
        'title' => 'Template Panduan',
        'slug' => 'template-panduan-draft',
        'category' => 'Bisnis',
        'description' => 'Template uji.',
        'price' => 10000,
        'status' => Product::STATUS_DRAFT,
    ]);

    $this->actingAs($admin)->patch("/admin/products/{$product->id}/status", [
        'status' => Product::STATUS_PUBLISHED,
    ])->assertSessionHasErrors('usage_guide');

    expect($product->fresh()->status)->toBe(Product::STATUS_DRAFT);
});

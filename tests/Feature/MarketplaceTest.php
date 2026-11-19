<?php

use App\Mail\OrderPaidDeliveryMail;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('catalog lists only published products and is searchable', function () {
    $seller = User::factory()->create();
    Product::create(['created_by' => $seller->id, 'title' => 'Budget Bulanan', 'slug' => 'budget-bulanan', 'category' => 'Keuangan', 'description' => 'Anggaran pribadi', 'price' => 25000, 'file_path' => 'excel-templates/budget.xlsx', 'original_filename' => 'budget.xlsx', 'status' => 'published', 'published_at' => now()]);
    Product::create(['created_by' => $seller->id, 'title' => 'Draft Rahasia', 'slug' => 'draft-rahasia', 'category' => 'Keuangan', 'description' => 'Belum tayang', 'price' => 0, 'file_path' => 'excel-templates/draft.xlsx', 'original_filename' => 'draft.xlsx', 'status' => 'draft']);

    $this->get('/templates?q=Budget')->assertOk()->assertSee('Budget Bulanan')->assertDontSee('Draft Rahasia');
});

test('catalog detail is available only for published products', function () {
    $seller = User::factory()->create();
    $published = Product::create(['created_by' => $seller->id, 'title' => 'Cashflow', 'slug' => 'cashflow', 'category' => 'Bisnis', 'description' => 'Template arus kas', 'price' => 30000, 'file_path' => 'excel-templates/cashflow.xlsx', 'original_filename' => 'cashflow.xlsx', 'status' => 'published', 'published_at' => now()]);
    $draft = Product::create(['created_by' => $seller->id, 'title' => 'Draft Rahasia', 'slug' => 'draft-rahasia', 'category' => 'Bisnis', 'description' => 'Belum tayang', 'price' => 0, 'file_path' => 'excel-templates/draft.xlsx', 'original_filename' => 'draft.xlsx', 'status' => 'draft']);

    $this->get("/templates/{$published->slug}")->assertOk()->assertSee('Cashflow');
    $this->get("/templates/{$draft->slug}")->assertNotFound();
});

test('public catalog does not expose private template source paths or master sheet IDs', function () {
    $seller = User::factory()->create();
    Product::create([
        'created_by' => $seller->id,
        'title' => 'Private Master',
        'slug' => 'private-master',
        'category' => 'Bisnis',
        'description' => 'Spreadsheet source must remain private.',
        'price' => 10000,
        'google_sheet_id' => 'secret-master-id',
        'usage_guide' => 'Panduan internal admin yang hanya boleh dipakai untuk pembeli.',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $this->get('/templates')->assertInertia(fn ($page) => $page
        ->component('marketplace/catalog')
        ->missing('products.data.0.google_sheet_id')
        ->missing('products.data.0.file_path')
        ->missing('products.data.0.usage_guide'));
});

test('buyers cannot apply to sell or submit templates for sale', function () {
    $buyer = User::factory()->create();
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

    $this->actingAs($buyer)->get('/become-a-seller')->assertNotFound();
    $this->actingAs($buyer)->post('/become-a-seller', [
        'reason' => 'Saya ingin menjual template pembukuan untuk membantu usaha kecil.',
    ])->assertNotFound();
    $this->actingAs($buyer)->get('/seller/products')->assertForbidden();
    $this->actingAs($buyer)->post('/seller/products', [
        'title' => 'Template ilegal',
        'category' => 'Bisnis',
        'description' => 'Seharusnya tidak bisa diajukan.',
        'price' => 1000,
    ])->assertForbidden();

    $this->assertDatabaseMissing('seller_applications', ['user_id' => $buyer->id]);
    $this->actingAs($admin)->get('/admin/seller-applications')->assertNotFound();
    $this->actingAs($admin)->patch('/admin/seller-applications/1', [
        'status' => 'approved',
    ])->assertNotFound();
});

test('buyer can send a published product to checkout without creating an unpaid order', function () {
    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $product = Product::create(['created_by' => $seller->id, 'title' => 'Cashflow', 'slug' => 'cashflow', 'category' => 'Bisnis', 'description' => 'Cashflow', 'price' => 30000, 'file_path' => 'excel-templates/cashflow.xlsx', 'original_filename' => 'cashflow.xlsx', 'status' => 'published', 'published_at' => now()]);

    $this->actingAs($buyer)->post("/templates/{$product->id}/orders")->assertRedirect('/checkout');
    $this->assertDatabaseHas('cart_items', ['user_id' => $buyer->id, 'product_id' => $product->id]);
    $this->assertDatabaseMissing('orders', ['buyer_id' => $buyer->id]);
});

test('buyer cannot download unpaid order and other buyer cannot access order', function () {
    Storage::fake('local');
    $buyer = User::factory()->create();
    $otherBuyer = User::factory()->create();
    $seller = User::factory()->create();
    $product = Product::create(['created_by' => $seller->id, 'title' => 'Sheet', 'slug' => 'sheet', 'category' => 'Data', 'description' => 'Sheet', 'price' => 1000, 'file_path' => 'excel-templates/sheet.xlsx', 'original_filename' => 'sheet.xlsx', 'status' => 'published', 'published_at' => now()]);
    Storage::disk('local')->put('excel-templates/sheet.xlsx', 'private workbook');
    $order = Order::create(['order_number' => 'XL-TEST123456', 'buyer_id' => $buyer->id, 'total_amount' => 1000, 'status' => 'pending']);
    $item = $order->items()->create(['product_id' => $product->id, 'product_title' => $product->title, 'unit_price' => 1000]);

    $this->actingAs($buyer)->get("/my-orders/{$order->id}/items/{$item->id}/download")->assertForbidden();
    $this->actingAs($otherBuyer)->get("/my-orders/{$order->id}/items/{$item->id}/download")->assertNotFound();
});

test('seller can submit a private excel template for review', function () {
    Storage::fake('local');
    $seller = User::factory()->create(['role' => User::ROLE_SELLER]);
    $file = UploadedFile::fake()->createWithContent('ledger.xlsx', 'excel test content');

    $this->actingAs($seller)->post('/seller/products', ['title' => 'Ledger', 'category' => 'Keuangan', 'description' => 'Ledger template for small business.', 'price' => 5000, 'file' => $file])->assertRedirect('/seller/products');
    $this->assertDatabaseHas('products', ['title' => 'Ledger', 'created_by' => $seller->id, 'status' => 'draft']);
});

test('admin cannot use the seller submission endpoint', function () {
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

    $this->actingAs($admin)->get('/seller/products')->assertForbidden();
    $this->actingAs($admin)->post('/seller/products', [
        'title' => 'Template Admin',
        'category' => 'Bisnis',
        'description' => 'Admin manages products through the admin panel.',
        'price' => 1000,
    ])->assertForbidden();
});

test('buyer can checkout multiple products from cart', function () {
    Storage::fake('local');
    config([
        'services.midtrans.server_key' => 'test-server-key',
        'services.midtrans.is_production' => false,
        'services.midtrans.direct_success' => false,
        'mail.default' => 'smtp',
    ]);
    $paymentUrl = 'https://app.sandbox.midtrans.com/snap/v2/vtweb/test-token';
    Http::fake([
        'https://app.sandbox.midtrans.com/snap/v1/transactions' => Http::response([
            'token' => 'test-token',
            'redirect_url' => $paymentUrl,
        ], 201),
    ]);

    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $prod1 = Product::create(['created_by' => $seller->id, 'title' => 'Product 1', 'slug' => 'prod-1', 'category' => 'Bisnis', 'description' => 'Desc 1', 'price' => 20000, 'file_path' => 'excel-templates/p1.xlsx', 'original_filename' => 'p1.xlsx', 'status' => 'published', 'published_at' => now()]);
    $prod2 = Product::create(['created_by' => $seller->id, 'title' => 'Product 2', 'slug' => 'prod-2', 'category' => 'Pajak', 'description' => 'Desc 2', 'price' => 30000, 'file_path' => 'excel-templates/p2.xlsx', 'original_filename' => 'p2.xlsx', 'status' => 'published', 'published_at' => now()]);
    Storage::disk('local')->put($prod1->file_path, 'workbook one');
    Storage::disk('local')->put($prod2->file_path, 'workbook two');

    $this->actingAs($buyer);
    $this->post('/cart', ['product_id' => $prod1->id])->assertRedirect();
    $this->post('/cart', ['product_id' => $prod2->id])->assertRedirect();

    $this->get('/checkout')->assertInertia(fn ($page) => $page
        ->component('marketplace/checkout')
        ->where('total', 50000)
        ->where('customer.name', $buyer->name)
        ->where('customer.email', $buyer->email));

    $this->get('/')->assertInertia(fn ($page) => $page
        ->component('landing-page/index')
        ->where('cart.count', 2)
        ->where('cart.items.0.id', $prod1->id)
        ->where('cart.items.1.id', $prod2->id));

    $this->actingAs($buyer)->post('/checkout', [
        'customer_name' => 'Nama Pembeli',
        'customer_phone' => '081234567890',
        'customer_email' => 'pembeli@example.com',
    ])->assertRedirect($paymentUrl);

    $this->assertDatabaseHas('orders', [
        'buyer_id' => $buyer->id,
        'customer_name' => 'Nama Pembeli',
        'customer_phone' => '081234567890',
        'customer_email' => 'pembeli@example.com',
        'total_amount' => 50000,
        'status' => Order::STATUS_PENDING,
        'payment_gateway' => 'midtrans',
        'payment_url' => $paymentUrl,
    ]);

    Http::assertSent(fn (HttpRequest $request) => $request->url() === 'https://app.sandbox.midtrans.com/snap/v1/transactions'
        && $request['transaction_details']['gross_amount'] === 50000
        && $request['enabled_payments'] === ['gopay']
        && $request['customer_details']['email'] === 'pembeli@example.com'
        && $request['customer_details']['phone'] === '6281234567890');

    $this->assertDatabaseHas('order_items', ['product_id' => $prod1->id, 'unit_price' => 20000]);
    $this->assertDatabaseHas('order_items', ['product_id' => $prod2->id, 'unit_price' => 30000]);
    $this->assertDatabaseMissing('cart_items', ['user_id' => $buyer->id, 'product_id' => $prod1->id]);
    $this->assertDatabaseMissing('cart_items', ['user_id' => $buyer->id, 'product_id' => $prod2->id]);

    $order = Order::query()->where('buyer_id', $buyer->id)->firstOrFail();

    $this->actingAs($buyer)->get('/my-orders')->assertInertia(fn ($page) => $page
        ->component('marketplace/orders')
        ->where('orders.data.0.order_number', $order->order_number)
        ->where('orders.data.0.status', Order::STATUS_PENDING)
        ->where('orders.data.0.payment_url', $paymentUrl)
        ->where('orders.data.0.items.0.product_title', 'Product 1'));

    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $this->actingAs($admin)->get('/admin/orders')->assertInertia(fn ($page) => $page
        ->component('admin/orders')
        ->where('orders.data.0.order_number', $order->order_number)
        ->where('orders.data.0.buyer.email', $buyer->email));
});

test('Midtrans item details include cart quantities and match the order total', function () {
    Storage::fake('local');
    config([
        'services.midtrans.server_key' => 'test-server-key',
        'services.midtrans.is_production' => false,
        'services.midtrans.direct_success' => false,
        'mail.default' => 'smtp',
    ]);

    $paymentUrl = 'https://app.sandbox.midtrans.com/snap/v2/vtweb/test-token';
    Http::fake([
        'https://app.sandbox.midtrans.com/snap/v1/transactions' => Http::response([
            'token' => 'test-token',
            'redirect_url' => $paymentUrl,
        ], 201),
    ]);

    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $product = Product::create([
        'created_by' => $seller->id,
        'title' => 'Workbook',
        'slug' => 'quantity-workbook',
        'category' => 'Bisnis',
        'description' => 'Workbook for quantity checkout testing.',
        'price' => 12000,
        'file_path' => 'excel-templates/quantity-workbook.xlsx',
        'original_filename' => 'quantity-workbook.xlsx',
        'status' => 'published',
        'published_at' => now(),
    ]);
    Storage::disk('local')->put($product->file_path, 'workbook');

    $this->actingAs($buyer)
        ->post('/cart', ['product_id' => $product->id, 'quantity' => 3])
        ->assertRedirect();

    $this->post('/checkout', [
        'customer_name' => 'Nama Pembeli',
        'customer_phone' => '081234567890',
        'customer_email' => 'pembeli@example.com',
    ])->assertRedirect($paymentUrl);

    Http::assertSent(fn (HttpRequest $request) => $request['transaction_details']['gross_amount'] === 36000
        && $request['item_details'] === [[
            'id' => (string) $product->id,
            'price' => 12000,
            'quantity' => 3,
            'name' => 'Workbook',
        ]]);
    $this->assertDatabaseCount('order_items', 3);
});

test('adding to cart cannot exceed the maximum total quantity per product', function () {
    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $product = Product::create([
        'created_by' => $seller->id,
        'title' => 'Workbook',
        'slug' => 'quantity-limit-workbook',
        'category' => 'Bisnis',
        'description' => 'Workbook for quantity limit testing.',
        'price' => 12000,
        'file_path' => 'excel-templates/quantity-limit-workbook.xlsx',
        'original_filename' => 'quantity-limit-workbook.xlsx',
        'status' => 'published',
        'published_at' => now(),
    ]);
    CartItem::create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => CartItem::MAX_QUANTITY - 1,
    ]);

    $this->actingAs($buyer)
        ->post('/cart', ['product_id' => $product->id, 'quantity' => 2])
        ->assertSessionHasErrors('quantity');

    $this->post("/templates/{$product->id}/orders", ['quantity' => 2])
        ->assertSessionHasErrors('quantity');

    $this->assertDatabaseHas('cart_items', [
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => CartItem::MAX_QUANTITY - 1,
    ]);
});

test('checkout rejects cart quantities above the maximum', function () {
    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $product = Product::create([
        'created_by' => $seller->id,
        'title' => 'Workbook',
        'slug' => 'legacy-quantity-workbook',
        'category' => 'Bisnis',
        'description' => 'Workbook for legacy quantity testing.',
        'price' => 12000,
        'file_path' => 'excel-templates/legacy-quantity-workbook.xlsx',
        'original_filename' => 'legacy-quantity-workbook.xlsx',
        'status' => 'published',
        'published_at' => now(),
    ]);
    CartItem::create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => CartItem::MAX_QUANTITY + 1,
    ]);

    $this->actingAs($buyer)
        ->get('/checkout')
        ->assertSessionHasErrors('quantity');
});

test('checkout rejects invalid recipient emails before creating an order', function () {
    Storage::fake('local');
    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $product = Product::create([
        'created_by' => $seller->id,
        'title' => 'Workbook',
        'slug' => 'invalid-recipient-email-workbook',
        'category' => 'Bisnis',
        'description' => 'Workbook for recipient email validation testing.',
        'price' => 12000,
        'file_path' => 'excel-templates/invalid-recipient-email-workbook.xlsx',
        'original_filename' => 'invalid-recipient-email-workbook.xlsx',
        'status' => 'published',
        'published_at' => now(),
    ]);
    Storage::disk('local')->put($product->file_path, 'workbook');

    $this->actingAs($buyer)
        ->post('/cart', ['product_id' => $product->id])
        ->assertRedirect();

    $this->post('/checkout', [
        'customer_name' => 'Nama Pembeli',
        'customer_phone' => '081234567890',
        'customer_email' => 'pembeli@example.com',
        'item_emails' => [
            $product->id => [1 => 'bukan-email'],
        ],
    ])->assertSessionHasErrors("item_emails.{$product->id}.1");

    $this->assertDatabaseCount('orders', 0);
    $this->assertDatabaseHas('cart_items', [
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => 1,
    ]);
});

test('paid buyer keeps access to the purchased file after admin replaces the product file', function () {
    Storage::fake('local');
    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $originalPath = 'excel-templates/ledger-original.xlsx';
    Storage::disk('local')->put($originalPath, 'original workbook');
    $product = Product::create(['created_by' => $seller->id, 'title' => 'Ledger', 'slug' => 'ledger-snapshot', 'category' => 'Bisnis', 'description' => 'Ledger', 'price' => 10000, 'file_path' => $originalPath, 'original_filename' => 'ledger-original.xlsx', 'status' => 'published', 'published_at' => now()]);
    $order = Order::create([
        'order_number' => 'XL-SNAPSHOT123',
        'buyer_id' => $buyer->id,
        'total_amount' => 10000,
        'status' => Order::STATUS_PAID,
    ]);
    $item = $order->items()->create([
        'product_id' => $product->id,
        'product_title' => $product->title,
        'unit_price' => $product->price,
        'file_path' => $originalPath,
        'file_name' => 'ledger-original.xlsx',
    ]);

    $this->actingAs($admin)->from('/admin/products')->patch("/admin/products/{$product->id}", [
        'title' => 'Ledger',
        'category' => 'Bisnis',
        'description' => 'Ledger',
        'usage_guide' => 'Mulai dengan mengisi tanggal transaksi dan keterangan pada kolom yang tersedia.',
        'price' => 10000,
        'file' => UploadedFile::fake()->createWithContent('ledger-updated.xlsx', 'updated workbook'),
    ])->assertRedirect('/admin/products');

    expect(Storage::disk('local')->exists($originalPath))->toBeTrue();
    $this->actingAs($buyer)
        ->get("/my-orders/{$order->id}/items/{$item->id}/download")
        ->assertDownload('ledger-original.xlsx');
});

test('local offline checkout saves a pending order without charging or delivering files', function () {
    Storage::fake('local');
    Http::fake();
    Mail::fake();
    config([
        'services.midtrans.server_key' => null,
        'services.midtrans.offline_checkout_enabled' => true,
        'services.midtrans.direct_success' => false,
        'mail.default' => 'log',
    ]);

    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $product = Product::create(['created_by' => $seller->id, 'title' => 'Laporan Uji', 'slug' => 'laporan-uji-offline', 'category' => 'Bisnis', 'description' => 'Template uji', 'price' => 15000, 'file_path' => 'excel-templates/laporan-uji.xlsx', 'original_filename' => 'laporan-uji.xlsx', 'status' => 'published', 'published_at' => now()]);
    Storage::disk('local')->put($product->file_path, 'workbook');

    $this->actingAs($buyer)->post('/cart', ['product_id' => $product->id])->assertRedirect();
    $this->get('/checkout')->assertInertia(fn ($page) => $page
        ->component('marketplace/checkout')
        ->where('offlineCheckout', true));

    $this->post('/checkout', [
        'customer_name' => 'Nama Uji',
        'customer_phone' => '081234567890',
        'customer_email' => 'uji@example.com',
    ])->assertRedirect('/my-orders');

    $order = Order::query()->where('buyer_id', $buyer->id)->firstOrFail();
    expect($order->status)->toBe(Order::STATUS_PENDING)
        ->and($order->payment_gateway)->toBe('offline')
        ->and($order->payment_url)->toBeNull()
        ->and($order->paid_at)->toBeNull()
        ->and($order->delivery_email_sent_at)->toBeNull();
    $this->assertDatabaseHas('order_items', ['order_id' => $order->id, 'product_id' => $product->id]);
    $this->assertDatabaseMissing('cart_items', ['user_id' => $buyer->id, 'product_id' => $product->id]);
    Http::assertNothingSent();
    Mail::assertNothingOutgoing();
    $this->get("/my-orders/{$order->id}/items/{$order->items()->first()->id}/download")->assertForbidden();
    $this->get('/my-orders')->assertInertia(fn ($page) => $page
        ->component('marketplace/orders')
        ->where('orders.data.0.payment_gateway', 'offline'));

    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $this->actingAs($admin)->get('/admin/orders')->assertInertia(fn ($page) => $page
        ->component('admin/orders')
        ->where('orders.data.0.order_number', $order->order_number)
        ->where('orders.data.0.status', Order::STATUS_PENDING));
});

test('checkout requires customer contact details before creating a QRIS order', function () {
    Storage::fake('local');
    config([
        'services.midtrans.server_key' => 'test-server-key',
        'services.midtrans.is_production' => false,
        'services.midtrans.direct_success' => false,
    ]);
    Http::fake();

    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $product = Product::create(['created_by' => $seller->id, 'title' => 'Ledger', 'slug' => 'ledger', 'category' => 'Bisnis', 'description' => 'Ledger', 'price' => 10000, 'file_path' => 'excel-templates/ledger.xlsx', 'original_filename' => 'ledger.xlsx', 'status' => 'published', 'published_at' => now()]);
    Storage::disk('local')->put($product->file_path, 'workbook');

    $this->actingAs($buyer)->post('/cart', ['product_id' => $product->id])->assertRedirect();
    $this->post('/checkout', [
        'customer_name' => 'Nama Pembeli',
        'customer_phone' => '081234567890',
    ])->assertSessionHasErrors(['customer_email']);

    $this->assertDatabaseHas('cart_items', ['user_id' => $buyer->id, 'product_id' => $product->id]);
    $this->assertDatabaseMissing('orders', ['buyer_id' => $buyer->id]);
    Http::assertNothingSent();
});

test('checkout does not create a payment until email delivery is configured', function () {
    Storage::fake('local');
    Http::fake();
    config([
        'services.midtrans.server_key' => 'test-server-key',
        'services.midtrans.is_production' => false,
        'services.midtrans.offline_checkout_enabled' => false,
        'services.midtrans.direct_success' => false,
        'mail.default' => 'log',
    ]);

    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $product = Product::create(['created_by' => $seller->id, 'title' => 'Ledger', 'slug' => 'ledger-email', 'category' => 'Bisnis', 'description' => 'Ledger', 'price' => 10000, 'file_path' => 'excel-templates/ledger-email.xlsx', 'original_filename' => 'ledger-email.xlsx', 'status' => 'published', 'published_at' => now()]);
    Storage::disk('local')->put($product->file_path, 'workbook');

    $this->actingAs($buyer)->post('/cart', ['product_id' => $product->id])->assertRedirect();
    $this->post('/checkout', [
        'customer_name' => 'Nama Pembeli',
        'customer_phone' => '081234567890',
        'customer_email' => 'pembeli@example.com',
    ])->assertSessionHasErrors(['payment']);

    $this->assertDatabaseHas('cart_items', ['user_id' => $buyer->id, 'product_id' => $product->id]);
    $this->assertDatabaseMissing('orders', ['buyer_id' => $buyer->id]);
    Http::assertNothingSent();
});

test('verified Midtrans QRIS notification pays order and sends Excel files once', function () {
    Storage::fake('local');
    Mail::fake();
    config([
        'services.midtrans.server_key' => 'test-server-key',
        'mail.default' => 'smtp',
    ]);

    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $product = Product::create(['created_by' => $seller->id, 'title' => 'Laporan', 'slug' => 'laporan', 'category' => 'Bisnis', 'description' => 'Laporan', 'price' => 30000, 'file_path' => 'excel-templates/laporan.xlsx', 'original_filename' => 'laporan.xlsx', 'status' => 'published', 'published_at' => now()]);
    Storage::disk('local')->put($product->file_path, 'workbook');
    $order = Order::create([
        'order_number' => 'XL-MIDTRANS123',
        'buyer_id' => $buyer->id,
        'customer_name' => 'Nama Pembeli',
        'customer_phone' => '081234567890',
        'customer_email' => 'pembeli@example.com',
        'total_amount' => 30000,
        'status' => Order::STATUS_PENDING,
        'payment_gateway' => 'midtrans',
        'payment_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/test-token',
    ]);
    $order->items()->create([
        'product_id' => $product->id,
        'product_title' => $product->title,
        'unit_price' => $product->price,
        'file_path' => $product->file_path,
        'file_name' => $product->original_filename,
    ]);

    $payload = [
        'order_id' => $order->order_number,
        'status_code' => '200',
        'gross_amount' => '30000.00',
        'transaction_status' => 'settlement',
        'transaction_id' => 'midtrans-transaction-1',
        'payment_type' => 'qris',
        'signature_key' => hash('sha512', $order->order_number.'20030000.00test-server-key'),
    ];

    $this->postJson('/payments/midtrans/notification', [...$payload, 'signature_key' => 'invalid'])
        ->assertForbidden();
    $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => Order::STATUS_PENDING]);
    Mail::assertNothingOutgoing();

    $this->postJson('/payments/midtrans/notification', $payload)->assertOk();
    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'status' => Order::STATUS_PAID,
        'payment_reference' => 'midtrans-transaction-1',
    ]);
    expect($order->fresh()->delivery_email_sent_at)->not->toBeNull();
    Mail::assertSent(
        OrderPaidDeliveryMail::class,
        fn (OrderPaidDeliveryMail $mail) => $mail->order->customer_email === 'pembeli@example.com'
            && count($mail->attachments()) === 1,
    );
    Mail::assertSentCount(1);
    $this->actingAs($buyer)->get('/my-orders')->assertInertia(fn ($page) => $page
        ->component('marketplace/orders')
        ->where('orders.data.0.status', Order::STATUS_PAID)
        ->where('orders.data.0.items.0.product_title', 'Laporan'));
    $this->get("/my-orders/{$order->id}/items/{$order->items()->first()->id}/download")
        ->assertDownload('laporan.xlsx');

    $this->postJson('/payments/midtrans/notification', $payload)->assertOk();
    Mail::assertSentCount(1);
});

test('guest cannot add to cart and must login', function () {
    $seller = User::factory()->create();
    $prod = Product::create(['created_by' => $seller->id, 'title' => 'Product 1', 'slug' => 'prod-1', 'category' => 'Bisnis', 'description' => 'Desc 1', 'price' => 20000, 'file_path' => 'excel-templates/p1.xlsx', 'original_filename' => 'p1.xlsx', 'status' => 'published', 'published_at' => now()]);

    $this->post('/cart', ['product_id' => $prod->id])->assertRedirect('/login');
});

test('buyer can add, remove, and persist items in database-backed cart per account', function () {
    $buyerA = User::factory()->create();
    $buyerB = User::factory()->create();
    $seller = User::factory()->create();
    $prod1 = Product::create(['created_by' => $seller->id, 'title' => 'Product 1', 'slug' => 'prod-1', 'category' => 'Bisnis', 'description' => 'Desc 1', 'price' => 20000, 'file_path' => 'excel-templates/p1.xlsx', 'original_filename' => 'p1.xlsx', 'status' => 'published', 'published_at' => now()]);
    $prod2 = Product::create(['created_by' => $seller->id, 'title' => 'Product 2', 'slug' => 'prod-2', 'category' => 'Pajak', 'description' => 'Desc 2', 'price' => 30000, 'file_path' => 'excel-templates/p2.xlsx', 'original_filename' => 'p2.xlsx', 'status' => 'published', 'published_at' => now()]);

    // Buyer A adds prod1
    $this->actingAs($buyerA)->post('/cart', ['product_id' => $prod1->id])->assertRedirect();
    $this->assertDatabaseHas('cart_items', ['user_id' => $buyerA->id, 'product_id' => $prod1->id]);

    // Buyer B has separate cart
    $this->actingAs($buyerB)->post('/cart', ['product_id' => $prod2->id])->assertRedirect();
    $this->assertDatabaseHas('cart_items', ['user_id' => $buyerB->id, 'product_id' => $prod2->id]);
    $this->assertDatabaseMissing('cart_items', ['user_id' => $buyerB->id, 'product_id' => $prod1->id]);

    // Buyer A adds prod2
    $this->actingAs($buyerA)->post('/cart', ['product_id' => $prod2->id])->assertRedirect();
    expect($buyerA->cartItems()->count())->toBe(2);

    // Buyer A removes prod1
    $this->actingAs($buyerA)->delete("/cart/{$prod1->id}")->assertRedirect();
    $this->assertDatabaseMissing('cart_items', ['user_id' => $buyerA->id, 'product_id' => $prod1->id]);
    $this->assertDatabaseHas('cart_items', ['user_id' => $buyerA->id, 'product_id' => $prod2->id]);

    // Buyer B's cart is unaffected
    $this->assertDatabaseHas('cart_items', ['user_id' => $buyerB->id, 'product_id' => $prod2->id]);
});

test('admin can add and manage Google Sheets templates by link', function () {
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

    // Admin adds a private master link.
    $this->actingAs($admin)->post('/admin/products', [
        'title' => 'Laporan Keuangan UMKM 2026',
        'category' => 'UMKM & Bisnis',
        'description' => 'Template laporan keuangan komprehensif',
        'usage_guide' => 'Buat salinan template, lalu isi tanggal dan keterangan transaksi pada kolom yang tersedia.',
        'price' => 50000,
        'spreadsheet_url' => 'https://docs.google.com/spreadsheets/d/master-sheet-123/edit',
        'status' => 'published',
    ])->assertRedirect('/admin/products');

    $this->assertDatabaseHas('products', [
        'title' => 'Laporan Keuangan UMKM 2026',
        'category' => 'UMKM & Bisnis',
        'price' => 50000,
        'google_sheet_id' => 'master-sheet-123',
        'usage_guide' => 'Buat salinan template, lalu isi tanggal dan keterangan transaksi pada kolom yang tersedia.',
        'file_path' => null,
        'status' => 'published',
    ]);

    $product = Product::where('title', 'Laporan Keuangan UMKM 2026')->first();
    $this->actingAs($admin)->get('/admin/products')->assertInertia(fn ($page) => $page
        ->where('products.data.0.google_sheet_id', 'master-sheet-123')
        ->where('products.data.0.usage_guide', 'Buat salinan template, lalu isi tanggal dan keterangan transaksi pada kolom yang tersedia.'));

    // Admin toggles status to draft
    $this->actingAs($admin)->patch("/admin/products/{$product->id}/status", [
        'status' => 'draft',
    ])->assertRedirect();
    expect($product->fresh()->status)->toBe('draft');

    // Admin updates details
    $this->actingAs($admin)->patch("/admin/products/{$product->id}", [
        'title' => 'Laporan Keuangan UMKM 2026 Revisi',
        'category' => 'UMKM & Bisnis',
        'description' => 'Deskripsi update',
        'usage_guide' => 'Mulai dengan mengisi tanggal transaksi dan keterangan pada kolom yang tersedia.',
        'price' => 55000,
        'status' => 'published',
    ])->assertRedirect();
    expect($product->fresh()->price)->toBe(55000);
    expect($product->fresh()->google_sheet_id)->toBe('master-sheet-123');

    // Admin deletes template
    $this->actingAs($admin)->delete("/admin/products/{$product->id}")->assertRedirect();
    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

test('admin cannot add an arbitrary Google Drive link as a Sheets master', function () {
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

    $this->actingAs($admin)->from('/admin/products')->post('/admin/products', [
        'title' => 'Link Tidak Valid',
        'category' => 'Bisnis',
        'description' => 'Uji validasi link',
        'price' => 10000,
        'spreadsheet_url' => 'https://drive.google.com/file/d/master-sheet-123/view',
        'status' => 'draft',
    ])->assertSessionHasErrors(['spreadsheet_url']);

    $this->assertDatabaseMissing('products', ['title' => 'Link Tidak Valid']);
});

test('non admin cannot access admin pages', function () {
    $this->actingAs(User::factory()->create())->get('/admin')->assertForbidden();
});

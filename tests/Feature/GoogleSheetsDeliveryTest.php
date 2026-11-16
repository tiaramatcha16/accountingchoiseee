<?php

use App\Mail\OrderPaidDeliveryMail;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('checkout refuses to charge for Google Sheets when Drive delivery is not configured', function () {
    Http::fake();
    config([
        'services.midtrans.server_key' => 'test-midtrans-server-key',
        'services.midtrans.is_production' => false,
        'services.midtrans.offline_checkout_enabled' => false,
        'services.google_drive.client_id' => null,
        'services.google_drive.client_secret' => null,
        'services.google_drive.refresh_token' => null,
        'mail.default' => 'smtp',
    ]);

    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $product = Product::create([
        'created_by' => $seller->id,
        'title' => 'Anggaran Bulanan',
        'slug' => 'anggaran-bulanan-unconfigured',
        'category' => 'Keuangan',
        'description' => 'Template Google Sheets',
        'price' => 25000,
        'google_sheet_id' => 'master-sheet-id',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $this->actingAs($buyer)->post('/cart', ['product_id' => $product->id])->assertRedirect();
    $this->from('/checkout')->post('/checkout', [
        'customer_name' => 'Pembeli Sheets',
        'customer_phone' => '081234567890',
        'customer_email' => 'buyer@example.com',
    ])->assertRedirect('/checkout')->assertSessionHasErrors(['payment']);

    $this->assertDatabaseMissing('orders', ['buyer_id' => $buyer->id]);
    Http::assertNothingSent();
});

test('checkout refuses to charge when the master sheet cannot be accessed', function () {
    Http::fake(function (HttpRequest $request) {
        $path = parse_url($request->url(), PHP_URL_PATH);

        if ($path === '/token') {
            return Http::response(['access_token' => 'test-google-access-token', 'expires_in' => 3600]);
        }

        if ($path === '/drive/v3/files/master-sheet-id') {
            return Http::response(['error' => 'File not found'], 404);
        }

        return Http::response(['error' => 'Unexpected request'], 500);
    });
    config([
        'services.midtrans.server_key' => 'test-midtrans-server-key',
        'services.midtrans.is_production' => false,
        'services.midtrans.offline_checkout_enabled' => false,
        'services.google_drive.client_id' => 'test-client-id',
        'services.google_drive.client_secret' => 'test-client-secret',
        'services.google_drive.refresh_token' => 'test-refresh-token',
        'mail.default' => 'smtp',
    ]);

    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $product = Product::create([
        'created_by' => $seller->id,
        'title' => 'Anggaran Bulanan',
        'slug' => 'anggaran-bulanan-inaccessible',
        'category' => 'Keuangan',
        'description' => 'Template Google Sheets',
        'price' => 25000,
        'google_sheet_id' => 'master-sheet-id',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $this->actingAs($buyer)->post('/cart', ['product_id' => $product->id])->assertRedirect();
    $this->from('/checkout')->post('/checkout', [
        'customer_name' => 'Pembeli Sheets',
        'customer_phone' => '081234567890',
        'customer_email' => 'buyer@example.com',
    ])->assertRedirect('/checkout')->assertSessionHasErrors(['payment']);

    $this->assertDatabaseMissing('orders', ['buyer_id' => $buyer->id]);
    Http::assertNotSent(fn (HttpRequest $request) => str_contains($request->url(), '/snap/v1/transactions'));
});

test('verified payment creates one Google Sheets copy and shares it with the buyer', function () {
    Storage::fake('local');
    Mail::fake();
    Cache::forget('google-drive-access-token');
    config([
        'services.midtrans.server_key' => 'test-midtrans-server-key',
        'services.midtrans.is_production' => false,
        'services.midtrans.offline_checkout_enabled' => false,
        'services.google_drive.client_id' => 'test-client-id',
        'services.google_drive.client_secret' => 'test-client-secret',
        'services.google_drive.refresh_token' => 'test-refresh-token',
        'services.google_drive.folder_id' => null,
        'mail.default' => 'smtp',
    ]);

    $paymentUrl = 'https://app.sandbox.midtrans.com/snap/v2/vtweb/test-token';
    $copyUrl = 'https://docs.google.com/spreadsheets/d/copied-sheet-id/edit';

    Http::fake(function (HttpRequest $request) use ($paymentUrl, $copyUrl) {
        $path = parse_url($request->url(), PHP_URL_PATH);

        if ($path === '/token') {
            return Http::response(['access_token' => 'test-google-access-token', 'expires_in' => 3600]);
        }

        if (str_contains($request->url(), '/snap/v1/transactions')) {
            return Http::response(['token' => 'test-token', 'redirect_url' => $paymentUrl], 201);
        }

        if ($path === '/drive/v3/files' && $request->method() === 'GET') {
            return Http::response(['files' => []]);
        }

        if ($path === '/drive/v3/files/master-sheet-id' && $request->method() === 'GET') {
            return Http::response([
                'id' => 'master-sheet-id',
                'mimeType' => 'application/vnd.google-apps.spreadsheet',
            ]);
        }

        if ($path === '/drive/v3/files/master-sheet-id/copy' && $request->method() === 'POST') {
            return Http::response([
                'id' => 'copied-sheet-id',
                'mimeType' => 'application/vnd.google-apps.spreadsheet',
                'webViewLink' => $copyUrl,
            ]);
        }

        if ($path === '/drive/v3/files/copied-sheet-id/permissions' && $request->method() === 'GET') {
            return Http::response(['permissions' => []]);
        }

        if ($path === '/drive/v3/files/copied-sheet-id/permissions' && $request->method() === 'POST') {
            return Http::response(['id' => 'buyer-permission-id'], 200);
        }

        return Http::response(['error' => 'Unexpected Google or Midtrans request.'], 500);
    });

    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $product = Product::create([
        'created_by' => $seller->id,
        'title' => 'Anggaran Bulanan',
        'slug' => 'anggaran-bulanan-google',
        'category' => 'Keuangan',
        'description' => 'Template Google Sheets',
        'price' => 25000,
        'google_sheet_id' => 'master-sheet-id',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $this->actingAs($buyer)->post('/cart', ['product_id' => $product->id])->assertRedirect();
    $this->post('/checkout', [
        'customer_name' => 'Pembeli Sheets',
        'customer_phone' => '081234567890',
        'customer_email' => 'buyer@example.com',
    ])->assertRedirect($paymentUrl);

    Http::assertNotSent(fn (HttpRequest $request) => str_contains($request->url(), '/copy'));

    $order = Order::query()->where('buyer_id', $buyer->id)->firstOrFail();
    $item = $order->items()->firstOrFail();
    expect($item->google_sheet_id)->toBe('master-sheet-id')
        ->and($item->file_path)->toBeNull()
        ->and($item->delivery_url)->toBeNull();

    $payload = [
        'order_id' => $order->order_number,
        'status_code' => '200',
        'gross_amount' => '25000.00',
        'transaction_status' => 'settlement',
        'transaction_id' => 'midtrans-sheets-transaction',
        'signature_key' => hash('sha512', $order->order_number.'20025000.00test-midtrans-server-key'),
    ];

    $this->postJson('/payments/midtrans/notification', $payload)->assertOk();
    $this->assertDatabaseHas('order_items', [
        'id' => $item->id,
        'delivery_file_id' => 'copied-sheet-id',
        'delivery_url' => $copyUrl,
    ]);

    $this->actingAs($buyer)->get('/my-orders')->assertInertia(fn ($page) => $page
        ->component('marketplace/orders')
        ->where('orders.data.0.status', Order::STATUS_PAID)
        ->where('orders.data.0.items.0.delivery_type', 'google_sheets')
        ->where('orders.data.0.items.0.delivery_url', $copyUrl)
        ->missing('orders.data.0.items.0.google_sheet_id'));

    Mail::assertSent(
        OrderPaidDeliveryMail::class,
        fn (OrderPaidDeliveryMail $mail) => $mail->attachments() === []
            && $mail->order->items->first()->delivery_url === $copyUrl,
    );
    Mail::assertSentCount(1);

    $this->postJson('/payments/midtrans/notification', $payload)->assertOk();
    Mail::assertSentCount(1);
    Http::assertSentCount(8);
    Http::assertSent(fn (HttpRequest $request) => str_contains($request->url(), '/permissions')
        && $request->method() === 'POST'
        && $request['role'] === 'writer'
        && $request['emailAddress'] === 'buyer@example.com');
});

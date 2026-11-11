<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('catalog lists only published products and is searchable', function () {
    $seller = User::factory()->create();
    Product::create(['created_by' => $seller->id, 'title' => 'Budget Bulanan', 'slug' => 'budget-bulanan', 'category' => 'Keuangan', 'description' => 'Anggaran pribadi', 'price' => 25000, 'file_path' => 'excel-templates/budget.xlsx', 'original_filename' => 'budget.xlsx', 'status' => 'published', 'published_at' => now()]);
    Product::create(['created_by' => $seller->id, 'title' => 'Draft Rahasia', 'slug' => 'draft-rahasia', 'category' => 'Keuangan', 'description' => 'Belum tayang', 'price' => 0, 'file_path' => 'excel-templates/draft.xlsx', 'original_filename' => 'draft.xlsx', 'status' => 'draft']);

    $this->get('/templates?q=Budget')->assertOk()->assertSee('Budget Bulanan')->assertDontSee('Draft Rahasia');
});

test('buyer can create an order for a published product and order price is snapshotted', function () {
    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $product = Product::create(['created_by' => $seller->id, 'title' => 'Cashflow', 'slug' => 'cashflow', 'category' => 'Bisnis', 'description' => 'Cashflow', 'price' => 30000, 'file_path' => 'excel-templates/cashflow.xlsx', 'original_filename' => 'cashflow.xlsx', 'status' => 'published', 'published_at' => now()]);

    $this->actingAs($buyer)->post("/templates/{$product->id}/orders")->assertRedirect('/my-orders');
    $this->assertDatabaseHas('orders', ['buyer_id' => $buyer->id, 'total_amount' => 30000, 'status' => Order::STATUS_PENDING]);
    $this->assertDatabaseHas('order_items', ['product_id' => $product->id, 'product_title' => 'Cashflow', 'unit_price' => 30000]);
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

test('non admin cannot access admin pages', function () {
    $this->actingAs(User::factory()->create())->get('/admin')->assertForbidden();
});

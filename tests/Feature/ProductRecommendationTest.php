<?php

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

test('Gemini recommends only published catalog products and explains with catalog evidence', function () {
    config([
        'services.gemini.api_key' => 'gemini-recommendation-test-key',
        'services.gemini.model' => 'gemini-test-model',
    ]);

    $seller = User::factory()->create();
    $published = Product::create([
        'created_by' => $seller->id,
        'title' => 'Inventaris Toko',
        'slug' => 'inventaris-toko',
        'category' => 'UMKM & Bisnis',
        'description' => 'Mencatat stok dan penjualan toko.',
        'price' => 25000,
        'google_sheet_id' => 'master-sheet-secret-id',
        'status' => Product::STATUS_PUBLISHED,
        'published_at' => now(),
    ]);
    Product::create([
        'created_by' => $seller->id,
        'title' => 'Draft Rahasia',
        'slug' => 'draft-rahasia',
        'category' => 'UMKM & Bisnis',
        'description' => 'Belum boleh dilihat pembeli.',
        'price' => 0,
        'google_sheet_id' => 'draft-master-secret-id',
        'status' => Product::STATUS_DRAFT,
    ]);

    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [[
                'content' => ['parts' => [[
                    'text' => json_encode([
                        'recommendations' => [[
                            'product_id' => $published->id,
                            'evidence' => 'Mencatat stok',
                        ]],
                    ]),
                ]]],
            ]],
        ]),
    ]);

    $this->postJson('/templates/recommendations', [
        'needs' => 'Saya ingin mengelola stok dan penjualan toko.',
    ])->assertOk()
        ->assertJsonCount(1, 'recommendations')
        ->assertJsonPath('recommendations.0.product.id', $published->id)
        ->assertJsonPath('recommendations.0.product.slug', 'inventaris-toko')
        ->assertJsonPath('recommendations.0.reason', 'Aku memilih template ini karena katalog menyebut “Mencatat stok”, yang sesuai dengan kebutuhanmu.');

    Http::assertSent(fn (HttpRequest $request) => str_contains($request->url(), ':generateContent')
        && $request->hasHeader('x-goog-api-key', 'gemini-recommendation-test-key')
        && str_contains($request['contents'][0]['parts'][0]['text'], 'Saya ingin mengelola stok')
        && str_contains($request['contents'][0]['parts'][0]['text'], 'Inventaris Toko')
        && ! str_contains($request['contents'][0]['parts'][0]['text'], 'Draft Rahasia')
        && ! str_contains($request['contents'][0]['parts'][0]['text'], 'master-sheet-secret-id'));
});

test('recommendation response ignores unknown products and unsupported evidence', function () {
    config([
        'services.gemini.api_key' => 'gemini-recommendation-test-key',
        'services.gemini.model' => 'gemini-test-model',
    ]);

    $seller = User::factory()->create();
    $published = Product::create([
        'created_by' => $seller->id,
        'title' => 'Buku Kas Harian',
        'slug' => 'buku-kas-harian',
        'category' => 'Keuangan',
        'description' => 'Mencatat pemasukan dan pengeluaran harian.',
        'price' => 15000,
        'status' => Product::STATUS_PUBLISHED,
        'published_at' => now(),
    ]);
    $draft = Product::create([
        'created_by' => $seller->id,
        'title' => 'Draft Kas',
        'slug' => 'draft-kas',
        'category' => 'Keuangan',
        'description' => 'Draft',
        'price' => 0,
        'status' => Product::STATUS_DRAFT,
    ]);

    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [[
                'content' => ['parts' => [[
                    'text' => json_encode([
                        'recommendations' => [
                            ['product_id' => 99999, 'evidence' => 'paling bagus'],
                            ['product_id' => $draft->id, 'evidence' => 'Draft'],
                            ['product_id' => $published->id, 'evidence' => 'Fitur yang tidak ada'],
                        ],
                    ]),
                ]]],
            ]],
        ]),
    ]);

    $this->postJson('/templates/recommendations', [
        'needs' => 'Saya perlu catatan keuangan sederhana.',
    ])->assertOk()->assertExactJson(['recommendations' => []]);
});

test('recommendation endpoint reports when Gemini is not configured', function () {
    config(['services.gemini.api_key' => null]);
    $seller = User::factory()->create();
    Product::create([
        'created_by' => $seller->id,
        'title' => 'Buku Kas',
        'slug' => 'buku-kas',
        'category' => 'Keuangan',
        'description' => 'Mencatat pemasukan.',
        'price' => 15000,
        'status' => Product::STATUS_PUBLISHED,
        'published_at' => now(),
    ]);
    Http::fake();

    $this->postJson('/templates/recommendations', [
        'needs' => 'Saya perlu catatan keuangan.',
    ])->assertStatus(503)
        ->assertJsonPath('message', 'Pencarian AI belum tersedia saat ini. Kamu tetap bisa mencari template lewat katalog.');

    Http::assertNothingSent();
});

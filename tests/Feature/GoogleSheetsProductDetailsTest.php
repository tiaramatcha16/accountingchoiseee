<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

test('admin can generate editable product details from a bounded Sheets sample', function () {
    Cache::forget('google-drive-access-token');
    config([
        'services.google_drive.client_id' => 'google-client-id',
        'services.google_drive.client_secret' => 'google-client-secret',
        'services.google_drive.refresh_token' => 'google-refresh-token',
        'services.gemini.api_key' => 'gemini-test-key',
        'services.gemini.model' => 'gemini-test-model',
    ]);

    $generatedText = json_encode([
        'title' => 'Anggaran Bulanan Otomatis',
        'description' => 'Template untuk merencanakan arus kas bulanan.',
        'features' => ['Ringkasan pendapatan dan pengeluaran', 'Rumus total otomatis', 'Kolom catatan transaksi'],
    ], JSON_UNESCAPED_UNICODE);

    Http::fake(function (HttpRequest $request) use ($generatedText) {
        $path = parse_url($request->url(), PHP_URL_PATH);

        if ($path === '/token') {
            return Http::response(['access_token' => 'google-access-token', 'expires_in' => 3600]);
        }

        if ($path === '/v4/spreadsheets/master-sheet-id') {
            return Http::response([
                'properties' => ['title' => 'Anggaran Master'],
                'sheets' => [['properties' => ['title' => 'Ringkasan']]],
            ]);
        }

        if (str_contains($request->url(), '/values/')) {
            return Http::response([
                'values' => [
                    ['Kategori', 'Total'],
                    ['Pendapatan', '=SUM(B2:B20)'],
                    ['Kontak', 'contoh@example.com'],
                    ['Telepon', '+62 812-3456-7890'],
                    ['Nilai contoh', '123456'],
                ],
            ]);
        }

        if (str_contains($request->url(), ':generateContent')) {
            return Http::response([
                'candidates' => [[
                    'content' => ['parts' => [['text' => $generatedText]]],
                ]],
            ]);
        }

        return Http::response(['error' => 'Unexpected request'], 500);
    });

    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $this->actingAs($admin)->postJson('/admin/products/generate-details', [
        'spreadsheet_url' => 'https://docs.google.com/spreadsheets/d/master-sheet-id/edit',
    ])->assertOk()
        ->assertJsonPath('title', 'Anggaran Bulanan Otomatis')
        ->assertJsonPath('description', 'Template untuk merencanakan arus kas bulanan.')
        ->assertJsonPath('features.1', 'Rumus total otomatis');

    Http::assertSentCount(4);
    Http::assertSent(fn (HttpRequest $request) => str_contains($request->url(), ':generateContent')
        && $request->hasHeader('x-goog-api-key', 'gemini-test-key')
        && str_contains($request['contents'][0]['parts'][0]['text'], '=SUM(B2:B20)')
        && str_contains($request['contents'][0]['parts'][0]['text'], '[email disamarkan]')
        && str_contains($request['contents'][0]['parts'][0]['text'], '[nomor disamarkan]')
        && ! str_contains($request['contents'][0]['parts'][0]['text'], '123456'));
});

test('admin can generate an editable usage guide from sheet names and first-row headers only', function () {
    Cache::forget('google-drive-access-token');
    config([
        'services.google_drive.client_id' => 'google-client-id',
        'services.google_drive.client_secret' => 'google-client-secret',
        'services.google_drive.refresh_token' => 'google-refresh-token',
        'services.gemini.api_key' => 'gemini-test-key',
        'services.gemini.model' => 'gemini-test-model',
    ]);

    $generatedGuide = json_encode([
        'usage_guide' => "Tujuan: mencatat transaksi.\nLangkah penggunaan:\n1. Isi tanggal dan keterangan transaksi pada tab Transaksi.\n2. Periksa ringkasan pada tab Dashboard.",
    ], JSON_UNESCAPED_UNICODE);

    Http::fake(function (HttpRequest $request) use ($generatedGuide) {
        $path = parse_url($request->url(), PHP_URL_PATH);

        if ($path === '/token') {
            return Http::response(['access_token' => 'google-access-token', 'expires_in' => 3600]);
        }

        if ($path === '/v4/spreadsheets/guide-master-id') {
            return Http::response([
                'properties' => ['title' => 'Panduan Kas'],
                'sheets' => [
                    ['properties' => ['title' => 'Transaksi']],
                    ['properties' => ['title' => 'Dashboard']],
                ],
            ]);
        }

        if (str_contains($request->url(), '/values/')) {
            return Http::response([
                'values' => [
                    ['Tanggal', 'Keterangan', 'Jumlah', 'Kontak admin@example.com'],
                    ['PRIVATE-TRANSACTION-ROW', 'PRIVATE-NAME', '99999999', 'private@example.com'],
                ],
            ]);
        }

        if (str_contains($request->url(), ':generateContent')) {
            return Http::response([
                'candidates' => [[
                    'content' => ['parts' => [['text' => $generatedGuide]]],
                ]],
            ]);
        }

        return Http::response(['error' => 'Unexpected request'], 500);
    });

    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $this->actingAs($admin)->postJson('/admin/products/generate-usage-guide', [
        'title' => 'Template Kas Harian',
        'category' => 'Keuangan',
        'description' => 'Template pencatatan transaksi harian.',
        'admin_notes' => 'Transaksi diisi pada tab Transaksi.',
        'spreadsheet_url' => 'https://docs.google.com/spreadsheets/d/guide-master-id/edit',
    ])->assertOk()
        ->assertJsonPath('usage_guide', "Tujuan: mencatat transaksi.\nLangkah penggunaan:\n1. Isi tanggal dan keterangan transaksi pada tab Transaksi.\n2. Periksa ringkasan pada tab Dashboard.");

    Http::assertSentCount(5);
    Http::assertSent(fn (HttpRequest $request) => str_contains($request->url(), ':generateContent')
        && $request->hasHeader('x-goog-api-key', 'gemini-test-key')
        && str_contains($request->body(), 'Tanggal')
        && str_contains($request->body(), 'Keterangan')
        && str_contains($request->body(), 'Tab Dashboard')
        && str_contains($request->body(), '[email disamarkan]')
        && str_contains($request->body(), 'Template pencatatan transaksi harian.')
        && str_contains($request->body(), 'Transaksi diisi pada tab Transaksi.')
        && ! str_contains($request->body(), 'guide-master-id')
        && ! str_contains($request->body(), 'PRIVATE-TRANSACTION-ROW')
        && ! str_contains($request->body(), 'PRIVATE-NAME')
        && ! str_contains($request->body(), 'private@example.com'));
});

test('admin can generate a guide for file templates using notes without Google Drive access', function () {
    config([
        'services.google_drive.client_id' => null,
        'services.google_drive.client_secret' => null,
        'services.google_drive.refresh_token' => null,
        'services.gemini.api_key' => 'gemini-test-key',
    ]);
    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [[
                'content' => ['parts' => [[
                    'text' => json_encode([
                        'usage_guide' => "Tujuan: mencatat stok.\nLangkah penggunaan:\n1. Isi nama barang dan jumlah pada kolom yang tersedia.",
                    ]),
                ]]],
            ]],
        ]),
    ]);

    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    $this->actingAs($admin)->postJson('/admin/products/generate-usage-guide', [
        'title' => 'Template Stok Excel',
        'category' => 'Bisnis',
        'description' => 'Mencatat jumlah stok barang.',
        'admin_notes' => 'Isi setiap barang pada satu baris.',
    ])->assertOk()
        ->assertJsonPath('usage_guide', "Tujuan: mencatat stok.\nLangkah penggunaan:\n1. Isi nama barang dan jumlah pada kolom yang tersedia.");

    Http::assertSentCount(1);
});

test('only admins can request AI product details', function () {
    Http::fake();
    $buyer = User::factory()->create();

    $this->actingAs($buyer)->postJson('/admin/products/generate-details', [
        'spreadsheet_url' => 'https://docs.google.com/spreadsheets/d/master-sheet-id/edit',
    ])->assertForbidden();
    $this->actingAs($buyer)->postJson('/admin/products/generate-usage-guide', [
        'title' => 'Template',
        'category' => 'Bisnis',
        'description' => 'Deskripsi template.',
    ])->assertForbidden();

    Http::assertNothingSent();
});

test('AI product details endpoint rejects links outside Google Sheets', function () {
    Http::fake();
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

    $this->actingAs($admin)->postJson('/admin/products/generate-details', [
        'spreadsheet_url' => 'https://drive.google.com/file/d/master-sheet-id/view',
    ])->assertUnprocessable()
        ->assertJsonPath('message', 'Masukkan link Google Sheets yang valid.');

    Http::assertNothingSent();
});

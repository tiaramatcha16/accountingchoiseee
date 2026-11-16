<?php

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Http;
use PhpOffice\PhpSpreadsheet\IOFactory;

uses(RefreshDatabase::class);

function analyticsProduct(User $seller, string $title = 'Buku Kas Harian'): Product
{
    return Product::create([
        'created_by' => $seller->id,
        'title' => $title,
        'slug' => str()->slug($title),
        'category' => 'Keuangan',
        'description' => 'Template pencatatan pemasukan dan pengeluaran.',
        'price' => 100,
        'file_path' => 'private/templates/buku-kas.xlsx',
        'original_filename' => 'buku-kas.xlsx',
        'status' => Product::STATUS_PUBLISHED,
        'published_at' => now(),
    ]);
}

function analyticsOrder(User $buyer, string $number, int $amount, string $status, ?string $paidAt): Order
{
    return Order::create([
        'order_number' => $number,
        'buyer_id' => $buyer->id,
        'total_amount' => $amount,
        'status' => $status,
        'paid_at' => $paidAt,
    ]);
}

test('admin analytics compares paid sales and excludes unpaid and cancelled orders', function () {
    $this->travelTo(now()->setDate(2025, 6, 15)->setTime(12, 0));

    $admin = User::factory()->admin()->create();
    $seller = User::factory()->create();
    $buyer = User::factory()->create(['email' => 'buyer-private@example.test']);
    $product = analyticsProduct($seller);

    $today = analyticsOrder($buyer, 'ANALYTICS-TODAY', 100, Order::STATUS_PAID, '2025-06-15 10:30:00');
    OrderItem::create([
        'order_id' => $today->id,
        'product_id' => $product->id,
        'product_title' => $product->title,
        'unit_price' => 100,
    ]);

    $yesterday = analyticsOrder($buyer, 'ANALYTICS-YESTERDAY', 50, Order::STATUS_PAID, '2025-06-14 10:30:00');
    OrderItem::create([
        'order_id' => $yesterday->id,
        'product_id' => $product->id,
        'product_title' => $product->title,
        'unit_price' => 50,
    ]);

    $unpaid = analyticsOrder($buyer, 'ANALYTICS-UNPAID', 900, Order::STATUS_PENDING, null);
    OrderItem::create([
        'order_id' => $unpaid->id,
        'product_id' => $product->id,
        'product_title' => $product->title,
        'unit_price' => 900,
    ]);

    $cancelled = analyticsOrder($buyer, 'ANALYTICS-CANCELLED', 800, Order::STATUS_CANCELLED, '2025-06-15 11:00:00');
    OrderItem::create([
        'order_id' => $cancelled->id,
        'product_id' => $product->id,
        'product_title' => $product->title,
        'unit_price' => 800,
    ]);

    $filters = [
        'chart_preset' => 'custom',
        'chart_start' => '2025-06-15',
        'chart_end' => '2025-06-15',
        'chart_group' => 'day',
        'product_preset' => 'custom',
        'product_start' => '2025-06-15',
        'product_end' => '2025-06-15',
    ];

    $this->actingAs($admin)
        ->get('/admin/analytics?'.http_build_query($filters))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/analytics')
            ->where('report.chart.current.revenue', 100)
            ->where('report.chart.current.orders', 1)
            ->where('report.chart.current.units', 1)
            ->where('report.chart.previous.revenue', 50)
            ->where('report.chart.previous.orders', 1)
            ->where('report.products.topProducts.0.currentUnits', 1)
            ->where('report.products.topProducts.0.previousUnits', 1)
            ->where('report.products.table.data.0.currentRevenue', 100)
            ->where('report.chart.trend.0.currentRevenue', 100)
            ->where('report.chart.trend.0.previousRevenue', 50)
        );
});

test('monthly and yearly analytics compare equivalent elapsed periods', function () {
    $this->travelTo(now()->setDate(2025, 6, 15)->setTime(12, 0));

    $admin = User::factory()->admin()->create();
    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $product = analyticsProduct($seller);

    foreach ([
        ['ANALYTICS-JUNE', 300, '2025-06-05 09:00:00'],
        ['ANALYTICS-MAY', 200, '2025-05-05 09:00:00'],
        ['ANALYTICS-MARCH-2025', 300, '2025-03-05 09:00:00'],
        ['ANALYTICS-MARCH-2024', 190, '2024-03-05 09:00:00'],
    ] as [$number, $amount, $paidAt]) {
        $order = analyticsOrder($buyer, $number, $amount, Order::STATUS_PAID, $paidAt);
        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_title' => $product->title,
            'unit_price' => $amount,
        ]);
    }

    $this->actingAs($admin)
        ->get('/admin/analytics?'.http_build_query([
            'chart_preset' => 'custom',
            'chart_start' => '2025-06-01',
            'chart_end' => '2025-06-15',
            'chart_group' => 'day',
            'product_preset' => 'week',
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('report.chart.current.revenue', 300)
            ->where('report.products.current.revenue', 0)
            ->where('report.products.from', '2025-06-09')
        );

    $this->get('/admin/analytics?'.http_build_query([
        'chart_preset' => 'custom',
        'chart_start' => '2025-06-01',
        'chart_end' => '2025-06-15',
        'chart_group' => 'day',
        'product_preset' => 'month',
    ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('report.chart.current.revenue', 300)
            ->where('report.products.current.revenue', 300)
            ->where('report.products.previous.revenue', 200)
            ->where('report.chart.trend.4.currentRevenue', 300)
        );

    $this->get('/admin/analytics?'.http_build_query([
        'chart_preset' => 'custom',
        'chart_start' => '2025-01-01',
        'chart_end' => '2025-06-15',
        'chart_group' => 'month',
        'product_preset' => 'year',
    ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('report.products.current.revenue', 800)
            ->where('report.products.previous.revenue', 190)
            ->where('report.chart.trend.2.currentRevenue', 300)
        );
});

test('Gemini receives anonymous sales aggregates and recommendations are limited to published products', function () {
    $this->travelTo(now()->setDate(2025, 6, 15)->setTime(12, 0));
    config([
        'services.gemini.api_key' => 'gemini-sales-test-key',
        'services.gemini.model' => 'gemini-test-model',
    ]);

    $admin = User::factory()->admin()->create();
    $seller = User::factory()->create();
    $buyer = User::factory()->create(['email' => 'buyer-private@example.test']);
    $product = analyticsProduct($seller);
    $order = analyticsOrder($buyer, 'ANALYTICS-AI', 100, Order::STATUS_PAID, '2025-06-15 10:30:00');
    OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'product_title' => $product->title,
        'unit_price' => 100,
    ]);

    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [[
                'content' => ['parts' => [[
                    'text' => json_encode([
                        'summary' => 'Gunakan data penjualan toko sebagai dasar uji promosi.',
                        'recommendations' => [
                            [
                                'type' => 'promote',
                                'product_id' => $product->id,
                                'idea' => 'Uji bundel pencatatan keuangan.',
                                'rationale' => 'Template sudah memiliki penjualan pada periode ini.',
                                'action' => 'Uji promosi kecil selama satu minggu.',
                            ],
                            [
                                'type' => 'promote',
                                'product_id' => 99999,
                                'idea' => 'Produk yang tidak tersedia.',
                                'rationale' => 'Tidak didukung katalog.',
                                'action' => 'Jangan ditampilkan.',
                            ],
                            [
                                'type' => 'create',
                                'product_id' => null,
                                'idea' => 'Template arus kas sederhana.',
                                'rationale' => 'Topik ini selinier dengan kategori yang tersedia.',
                                'action' => 'Validasi kebutuhan sebelum membuatnya.',
                            ],
                        ],
                    ], JSON_THROW_ON_ERROR),
                ]]],
            ]],
        ]),
    ]);

    $this->actingAs($admin)
        ->postJson('/admin/analytics/recommendations', [
            'chart_preset' => 'week',
            'product_preset' => 'month',
        ])
        ->assertOk()
        ->assertJsonCount(2, 'recommendations')
        ->assertJsonPath('recommendations.0.product.title', 'Buku Kas Harian')
        ->assertJsonPath('recommendations.0.product.currentUnits', 1)
        ->assertJsonPath('recommendations.1.type', 'create');

    Http::assertSent(fn (HttpRequest $request) => str_contains($request->url(), ':generateContent')
        && $request->hasHeader('x-goog-api-key', 'gemini-sales-test-key')
        && str_contains($request['contents'][0]['parts'][0]['text'], 'Buku Kas Harian')
        && str_contains($request['contents'][0]['parts'][0]['text'], '"units_sold":1')
        && ! str_contains($request['contents'][0]['parts'][0]['text'], 'buyer-private@example.test')
        && ! str_contains($request['contents'][0]['parts'][0]['text'], $buyer->name));
});

test('AI recommendation endpoint reports a clear error when Gemini is unavailable', function () {
    config(['services.gemini.api_key' => null]);
    Http::fake();

    $this->actingAs(User::factory()->admin()->create())
        ->postJson('/admin/analytics/recommendations', [
            'chart_preset' => 'month',
            'product_preset' => 'month',
        ])
        ->assertStatus(503)
        ->assertJsonPath('message', 'Rekomendasi AI belum tersedia saat ini. Laporan penjualan tetap dapat digunakan.');

    Http::assertNothingSent();
});

test('admin can download the filtered report as PDF and a real Excel workbook', function () {
    $this->travelTo(now()->setDate(2025, 6, 15)->setTime(12, 0));
    $admin = User::factory()->admin()->create();
    $seller = User::factory()->create();
    $buyer = User::factory()->create();
    $product = analyticsProduct($seller);
    $order = analyticsOrder($buyer, 'ANALYTICS-EXPORT', 100, Order::STATUS_PAID, '2025-06-15 10:30:00');
    OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'product_title' => $product->title,
        'unit_price' => 100,
    ]);

    $filters = http_build_query([
        'chart_preset' => 'custom',
        'chart_start' => '2025-06-15',
        'chart_end' => '2025-06-15',
        'chart_group' => 'day',
        'product_preset' => 'custom',
        'product_start' => '2025-06-15',
        'product_end' => '2025-06-15',
    ]);

    $pdf = $this->actingAs($admin)
        ->get('/admin/analytics/export/pdf?'.$filters)
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf')
        ->assertDownload();
    expect(substr($pdf->getContent(), 0, 4))->toBe('%PDF');

    $excel = $this->get('/admin/analytics/export/excel?'.$filters)
        ->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        ->assertDownload();

    $excelContent = $excel->streamedContent();
    expect(substr($excelContent, 0, 2))->toBe('PK');

    $temporaryFile = tempnam(sys_get_temp_dir(), 'sales-analytics-');
    if ($temporaryFile === false) {
        throw new RuntimeException('Unable to create a temporary workbook for the export test.');
    }

    file_put_contents($temporaryFile, $excelContent);
    $workbook = null;
    try {
        $workbook = IOFactory::load($temporaryFile);
        expect($workbook->getSheetNames())->toBe(['Ringkasan', 'Tren Pendapatan', 'Per Template']);
        expect($workbook->getSheetByName('Ringkasan')->getStyle('A1')->getFill()->getStartColor()->getRGB())->toBe('064E3B');
        expect($workbook->getSheetByName('Per Template')->getStyle('A4')->getFont()->getBold())->toBeTrue();
    } finally {
        $workbook?->disconnectWorksheets();
        unlink($temporaryFile);
    }
});

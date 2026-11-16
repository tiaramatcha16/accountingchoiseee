<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Laporan Analitik Penjualan</title>
    <style>
        @page { margin: 28px 28px 42px; }
        body { color: #172033; font-family: DejaVu Sans, sans-serif; font-size: 9px; }
        table { border-collapse: collapse; width: 100%; }
        p { margin: 3px 0; }
        .hero { background: #064e3b; color: #fff; padding: 18px 20px; }
        .hero-label { color: #a7f3d0; font-size: 8px; font-weight: bold; letter-spacing: 1.5px; }
        .hero h1 { font-size: 21px; margin: 5px 0; }
        .hero p { color: #d1fae5; }
        .hero-meta { color: #d1fae5; text-align: right; vertical-align: top; white-space: nowrap; }
        .periods { margin-top: 12px; }
        .period-card { background: #f0fdf4; border: 1px solid #d1fae5; padding: 9px 11px; vertical-align: top; }
        .period-card + .period-card { border-left: 5px solid #fff; }
        .period-label { color: #047857; font-size: 8px; font-weight: bold; letter-spacing: .7px; text-transform: uppercase; }
        .period-value { color: #172033; font-size: 10px; font-weight: bold; margin-top: 4px; }
        .period-note { color: #64748b; font-size: 8px; margin-top: 3px; }
        .section-title { border-left: 4px solid #10b981; color: #064e3b; font-size: 13px; margin: 20px 0 8px; padding: 4px 0 4px 8px; }
        .kpis { border-spacing: 7px 0; margin: 0 -7px; width: calc(100% + 14px); }
        .kpi { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; vertical-align: top; }
        .kpi-label { color: #64748b; font-size: 8px; font-weight: bold; text-transform: uppercase; }
        .kpi-value { color: #064e3b; font-size: 15px; font-weight: bold; margin-top: 5px; }
        .kpi-note { color: #64748b; font-size: 8px; margin-top: 4px; }
        .report-table { border: 1px solid #dbe5e1; table-layout: auto; }
        .report-table th { background: #047857; color: #fff; font-size: 8px; padding: 7px 6px; text-align: left; }
        .report-table td { border-bottom: 1px solid #e2e8f0; padding: 6px; vertical-align: top; }
        .report-table tbody tr:nth-child(even) { background: #f0fdf4; }
        .number { text-align: right; white-space: nowrap; }
        .empty { color: #64748b; padding: 14px !important; text-align: center; }
        .footnote { color: #64748b; font-size: 8px; margin-top: 8px; }
        .footer { border-top: 1px solid #dbe5e1; bottom: -25px; color: #64748b; font-size: 8px; left: 0; padding-top: 6px; position: fixed; right: 0; }
        .footer .page { float: right; }
        .footer .page:after { content: "Halaman " counter(page) " / " counter(pages); }
        .section { page-break-inside: avoid; }
        .template-table td:first-child { font-weight: bold; }
        .status { color: #047857; font-weight: bold; text-transform: capitalize; }
    </style>
</head>
<body>
    @php($money = static fn ($amount) => 'Rp '.number_format((int) $amount, 0, ',', '.'))
    <table class="hero">
        <tr>
            <td>
                <div class="hero-label">ACCOUNTINGCHOICE · LAPORAN ADMIN</div>
                <h1>Analitik Penjualan</h1>
                <p>Ringkasan pendapatan, pesanan lunas, dan performa template.</p>
            </td>
            <td class="hero-meta">Dibuat<br><strong>{{ now('UTC')->format('d/m/Y H:i') }} UTC</strong></td>
        </tr>
    </table>

    <table class="periods">
        <tr>
            <td class="period-card" width="50%">
                <div class="period-label">Rentang grafik · {{ $report['chart']['groupLabel'] }}</div>
                <div class="period-value">{{ $report['chart']['label'] }}</div>
                <div class="period-note">{{ $report['chart']['from'] }} s.d. {{ $report['chart']['to'] }} · Pembanding {{ $report['chart']['previousFrom'] }} s.d. {{ $report['chart']['previousTo'] }}</div>
            </td>
            <td class="period-card" width="50%">
                <div class="period-label">Rentang performa template</div>
                <div class="period-value">{{ $report['products']['label'] }}</div>
                <div class="period-note">{{ $report['products']['from'] }} s.d. {{ $report['products']['to'] }} · Pembanding {{ $report['products']['previousFrom'] }} s.d. {{ $report['products']['previousTo'] }}</div>
            </td>
        </tr>
    </table>

    <div class="section">
        <h2 class="section-title">Ikhtisar grafik</h2>
        <table class="kpis">
            <tr>
                <td class="kpi" width="25%">
                    <div class="kpi-label">Pendapatan</div>
                    <div class="kpi-value">{{ $money($report['chart']['current']['revenue']) }}</div>
                    <div class="kpi-note">Pembanding: {{ $money($report['chart']['previous']['revenue']) }}</div>
                </td>
                <td class="kpi" width="25%">
                    <div class="kpi-label">Pesanan lunas</div>
                    <div class="kpi-value">{{ number_format($report['chart']['current']['orders'], 0, ',', '.') }}</div>
                    <div class="kpi-note">Pembanding: {{ number_format($report['chart']['previous']['orders'], 0, ',', '.') }}</div>
                </td>
                <td class="kpi" width="25%">
                    <div class="kpi-label">Template terjual</div>
                    <div class="kpi-value">{{ number_format($report['chart']['current']['units'], 0, ',', '.') }} unit</div>
                    <div class="kpi-note">Pembanding: {{ number_format($report['chart']['previous']['units'], 0, ',', '.') }} unit</div>
                </td>
                <td class="kpi" width="25%">
                    <div class="kpi-label">Rata-rata pesanan</div>
                    <div class="kpi-value">{{ $money($report['chart']['current']['averageOrderValue']) }}</div>
                    <div class="kpi-note">Per pesanan lunas</div>
                </td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2 class="section-title">Tren pendapatan · {{ $report['chart']['groupLabel'] }}</h2>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Periode</th>
                    <th class="number">Pendapatan</th>
                    <th class="number">Pesanan lunas</th>
                    <th class="number">Pendapatan pembanding</th>
                    <th class="number">Pesanan pembanding</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($report['chart']['trend'] as $point)
                    <tr>
                        <td>{{ $point['label'] }}</td>
                        <td class="number">{{ $money($point['currentRevenue']) }}</td>
                        <td class="number">{{ number_format($point['currentOrders'], 0, ',', '.') }}</td>
                        <td class="number">{{ $money($point['previousRevenue']) }}</td>
                        <td class="number">{{ number_format($point['previousOrders'], 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2 class="section-title">Performa template · {{ $report['products']['label'] }}</h2>
        <table class="kpis">
            <tr>
                <td class="kpi" width="33%">
                    <div class="kpi-label">Pendapatan template</div>
                    <div class="kpi-value">{{ $money($report['products']['current']['revenue']) }}</div>
                    <div class="kpi-note">Pembanding: {{ $money($report['products']['previous']['revenue']) }}</div>
                </td>
                <td class="kpi" width="33%">
                    <div class="kpi-label">Unit template terjual</div>
                    <div class="kpi-value">{{ number_format($report['products']['current']['units'], 0, ',', '.') }} unit</div>
                    <div class="kpi-note">Pembanding: {{ number_format($report['products']['previous']['units'], 0, ',', '.') }} unit</div>
                </td>
                <td class="kpi" width="33%">
                    <div class="kpi-label">Template dianalisis</div>
                    <div class="kpi-value">{{ number_format($report['products']['table']['total'], 0, ',', '.') }}</div>
                    <div class="kpi-note">Termasuk template yang belum terjual</div>
                </td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2 class="section-title">Rincian pendapatan per template</h2>
        <table class="report-table template-table">
            <thead>
                <tr>
                    <th>Template</th>
                    <th>Kategori</th>
                    <th>Status</th>
                    <th class="number">Unit terjual</th>
                    <th class="number">Unit pembanding</th>
                    <th class="number">Pendapatan</th>
                    <th class="number">Pendapatan pembanding</th>
                    <th class="number">Porsi omzet</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($report['products']['table']['data'] as $product)
                    <tr>
                        <td>{{ $product['title'] }}</td>
                        <td>{{ $product['category'] }}</td>
                        <td class="status">{{ $product['status'] }}</td>
                        <td class="number">{{ number_format($product['currentUnits'], 0, ',', '.') }}</td>
                        <td class="number">{{ number_format($product['previousUnits'], 0, ',', '.') }}</td>
                        <td class="number">{{ $money($product['currentRevenue']) }}</td>
                        <td class="number">{{ $money($product['previousRevenue']) }}</td>
                        <td class="number">{{ number_format($product['revenueShare'], 1, ',', '.') }}%</td>
                    </tr>
                @empty
                    <tr><td colspan="8" class="empty">Belum ada template pada rentang laporan ini.</td></tr>
                @endforelse
            </tbody>
        </table>
        <p class="footnote">Pendapatan dan jumlah pesanan hanya menghitung pesanan lunas berdasarkan waktu pembayaran. Setiap item pesanan dihitung sebagai satu unit.</p>
    </div>

    <div class="footer">
        AccountingChoice · Laporan analitik penjualan
        <span class="page"></span>
    </div>
</body>
</html>

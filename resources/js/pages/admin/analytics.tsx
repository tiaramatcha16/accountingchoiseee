import AppLayout from '@/layouts/app-layout';
import { getCsrfHeaders } from '@/lib/csrf';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { BarChart3, Download, FileSpreadsheet, Lightbulb, Sparkles, TrendingUp, Wallet } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

type Preset = 'week' | 'month' | 'year' | 'custom';
type ChartGroup = 'day' | 'week' | 'month' | 'year';

interface PeriodStats {
    revenue: number;
    orders: number;
    units: number;
    averageOrderValue: number;
}

interface TrendPoint {
    label: string;
    currentRevenue: number;
    previousRevenue: number;
    currentOrders: number;
    previousOrders: number;
}

interface ProductPerformance {
    id: number;
    title: string;
    category: string;
    status: string;
    currentUnits: number;
    previousUnits: number;
    currentRevenue: number;
    previousRevenue: number;
    revenueShare: number;
}

interface ProductTable {
    data: ProductPerformance[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface ChartReport {
    label: string;
    group: ChartGroup;
    groupLabel: string;
    from: string;
    to: string;
    previousFrom: string;
    previousTo: string;
    current: PeriodStats;
    previous: PeriodStats;
    trend: TrendPoint[];
}

interface ProductReport {
    label: string;
    from: string;
    to: string;
    previousFrom: string;
    previousTo: string;
    current: PeriodStats;
    previous: PeriodStats;
    topProducts: ProductPerformance[];
    table: ProductTable;
}

interface Filters {
    chartPreset: Preset;
    chartStart: string;
    chartEnd: string;
    chartGroup: ChartGroup;
    productPreset: Preset;
    productStart: string;
    productEnd: string;
}

interface Recommendation {
    type: 'promote' | 'create';
    idea: string;
    rationale: string;
    action: string;
    product?: {
        title: string;
        category: string;
        currentUnits: number;
        previousUnits: number;
        currentRevenue: number;
        previousRevenue: number;
    };
}

interface RecommendationResult {
    summary: string;
    recommendations: Recommendation[];
}

const money = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

function comparison(current: number, previous: number): string {
    if (previous === 0) return current === 0 ? 'Belum ada penjualan pada kedua periode' : 'Belum ada pembanding';
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}% dari periode pembanding`;
}

function chartGroupName(group: ChartGroup): string {
    return {
        day: 'harian',
        week: 'mingguan',
        month: 'bulanan',
        year: 'tahunan',
    }[group];
}

function AnalyticsChart({ points }: { points: TrendPoint[] }) {
    const maximum = Math.max(1, ...points.flatMap((point) => [point.currentRevenue, point.previousRevenue]));

    return (
        <div>
            <div className="mb-4 flex flex-wrap gap-4 text-xs text-slate-600">
                <span className="inline-flex items-center gap-2">
                    <i className="size-3 rounded-sm bg-emerald-600" /> Periode terpilih
                </span>
                <span className="inline-flex items-center gap-2">
                    <i className="size-3 rounded-sm bg-slate-300" /> Periode pembanding
                </span>
            </div>
            <div className="overflow-x-auto pb-2">
                <div className="flex h-64 min-w-max items-end gap-2 border-b border-slate-200 px-2">
                    {points.map((point) => (
                        <div key={point.label} className="flex h-full w-12 flex-col items-center justify-end gap-2">
                            <div
                                className="flex h-[82%] w-full items-end justify-center gap-1"
                                role="img"
                                aria-label={`${point.label}: ${money(point.currentRevenue)} periode ini, ${money(point.previousRevenue)} periode pembanding`}
                            >
                                <div
                                    className="w-4 rounded-t bg-emerald-600"
                                    style={{ height: `${point.currentRevenue === 0 ? 0 : Math.max(2, (point.currentRevenue / maximum) * 100)}%` }}
                                    title={`Periode terpilih: ${money(point.currentRevenue)}`}
                                />
                                <div
                                    className="w-4 rounded-t bg-slate-300"
                                    style={{ height: `${point.previousRevenue === 0 ? 0 : Math.max(2, (point.previousRevenue / maximum) * 100)}%` }}
                                    title={`Periode pembanding: ${money(point.previousRevenue)}`}
                                />
                            </div>
                            <span className="text-[10px] whitespace-nowrap text-slate-500">{point.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ProductUnitsChart({ products }: { products: ProductPerformance[] }) {
    const maximum = Math.max(1, ...products.flatMap((product) => [product.currentUnits, product.previousUnits]));

    if (!products.length) return <p className="text-sm text-slate-500">Belum ada template yang diterbitkan.</p>;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                <span className="inline-flex items-center gap-2">
                    <i className="size-3 rounded-sm bg-emerald-600" /> Periode terpilih
                </span>
                <span className="inline-flex items-center gap-2">
                    <i className="size-3 rounded-sm bg-slate-300" /> Periode pembanding
                </span>
            </div>
            {products.map((product) => (
                <div key={product.id}>
                    <div className="mb-1 flex justify-between gap-3 text-xs">
                        <span className="truncate font-medium text-slate-700" title={product.title}>
                            {product.title}
                        </span>
                        <span className="shrink-0 text-slate-500">
                            {product.currentUnits} / {product.previousUnits} unit
                        </span>
                    </div>
                    <div className="space-y-1">
                        <div className="h-2 rounded-full bg-slate-100">
                            <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${(product.currentUnits / maximum) * 100}%` }} />
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                            <div className="h-2 rounded-full bg-slate-300" style={{ width: `${(product.previousUnits / maximum) * 100}%` }} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function filterQuery(filters: Filters) {
    return {
        chart_preset: filters.chartPreset,
        chart_start: filters.chartStart,
        chart_end: filters.chartEnd,
        chart_group: filters.chartGroup,
        product_preset: filters.productPreset,
        product_start: filters.productStart,
        product_end: filters.productEnd,
    };
}

function exportQueryString(filters: Filters, chartStart: string, chartEnd: string, productStart: string, productEnd: string): string {
    return new URLSearchParams({
        chart_preset: 'custom',
        chart_start: chartStart,
        chart_end: chartEnd,
        chart_group: filters.chartGroup,
        product_preset: 'custom',
        product_start: productStart,
        product_end: productEnd,
    }).toString();
}

export default function AdminSalesAnalytics({ report, filters }: { report: { chart: ChartReport; products: ProductReport }; filters: Filters }) {
    const [chartPreset, setChartPreset] = useState<Preset>(filters.chartPreset);
    const [chartStart, setChartStart] = useState(filters.chartStart);
    const [chartEnd, setChartEnd] = useState(filters.chartEnd);
    const [chartGroup, setChartGroup] = useState<ChartGroup>(filters.chartGroup);
    const [productPreset, setProductPreset] = useState<Preset>(filters.productPreset);
    const [productStart, setProductStart] = useState(filters.productStart);
    const [productEnd, setProductEnd] = useState(filters.productEnd);
    const [exportChartStart, setExportChartStart] = useState(report.chart.from);
    const [exportChartEnd, setExportChartEnd] = useState(report.chart.to);
    const [exportProductStart, setExportProductStart] = useState(report.products.from);
    const [exportProductEnd, setExportProductEnd] = useState(report.products.to);
    const [isGenerating, setIsGenerating] = useState(false);
    const [recommendationError, setRecommendationError] = useState<string | null>(null);
    const [recommendationResult, setRecommendationResult] = useState<RecommendationResult | null>(null);
    const today = new Date().toISOString().slice(0, 10);
    const exportReady =
        Boolean(exportChartStart && exportChartEnd && exportProductStart && exportProductEnd) &&
        exportChartStart <= exportChartEnd &&
        exportProductStart <= exportProductEnd &&
        exportChartEnd <= today &&
        exportProductEnd <= today;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Analitik penjualan', href: '/admin/analytics' },
    ];

    useEffect(() => {
        setExportChartStart(report.chart.from);
        setExportChartEnd(report.chart.to);
        setExportProductStart(report.products.from);
        setExportProductEnd(report.products.to);
    }, [report.chart.from, report.chart.to, report.products.from, report.products.to]);

    const cards = [
        {
            label: 'Pendapatan periode grafik',
            value: money(report.chart.current.revenue),
            comparison: comparison(report.chart.current.revenue, report.chart.previous.revenue),
            icon: Wallet,
        },
        {
            label: 'Template terjual',
            value: report.products.current.units.toLocaleString('id-ID'),
            comparison: comparison(report.products.current.units, report.products.previous.units),
            icon: BarChart3,
        },
        {
            label: 'Pesanan lunas periode grafik',
            value: report.chart.current.orders.toLocaleString('id-ID'),
            comparison: comparison(report.chart.current.orders, report.chart.previous.orders),
            icon: TrendingUp,
        },
        {
            label: 'Rata-rata nilai pesanan',
            value: money(report.chart.current.averageOrderValue),
            comparison: comparison(report.chart.current.averageOrderValue, report.chart.previous.averageOrderValue),
            icon: Wallet,
        },
    ];

    function submitChartFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get(
            '/admin/analytics',
            {
                ...filterQuery(filters),
                chart_preset: chartPreset,
                chart_start: chartStart,
                chart_end: chartEnd,
                chart_group: chartGroup,
            },
            { preserveScroll: true, preserveState: true, replace: true },
        );
        setRecommendationResult(null);
        setRecommendationError(null);
    }

    function submitProductFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get(
            '/admin/analytics',
            {
                ...filterQuery(filters),
                product_preset: productPreset,
                product_start: productStart,
                product_end: productEnd,
            },
            { preserveScroll: true, preserveState: true, replace: true },
        );
        setRecommendationResult(null);
        setRecommendationError(null);
    }

    async function generateRecommendations() {
        const csrfHeaders = getCsrfHeaders();
        if (!csrfHeaders) {
            setRecommendationError('Token keamanan tidak ditemukan. Muat ulang halaman lalu coba kembali.');
            return;
        }

        setIsGenerating(true);
        setRecommendationError(null);
        setRecommendationResult(null);
        try {
            const response = await fetch('/admin/analytics/recommendations', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...csrfHeaders,
                },
                body: JSON.stringify({
                    chart_preset: filters.chartPreset,
                    chart_start: filters.chartStart,
                    chart_end: filters.chartEnd,
                    chart_group: filters.chartGroup,
                    product_preset: filters.productPreset,
                    product_start: filters.productStart,
                    product_end: filters.productEnd,
                }),
            });
            const result = (await response.json()) as RecommendationResult & { message?: string };
            if (!response.ok) throw new Error(result.message ?? 'Rekomendasi AI belum dapat dibuat.');
            setRecommendationResult(result);
        } catch (error) {
            setRecommendationError(error instanceof Error ? error.message : 'Rekomendasi AI belum dapat dibuat. Coba lagi.');
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analitik Penjualan Admin" />
            <main className="mx-auto w-full max-w-7xl space-y-6 p-5 md:p-8 lg:p-10">
                <header className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold tracking-widest text-emerald-700 uppercase">Performa marketplace</p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-900">Analitik penjualan</h1>
                        <p className="mt-2 max-w-2xl text-slate-600">
                            Atur rentang grafik dan laporan template secara terpisah, lalu ekspor hasilnya.
                        </p>
                    </div>
                </header>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map(({ label, value, comparison: difference, icon: Icon }) => (
                        <article key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
                                <span>{label}</span>
                                <Icon size={18} className="shrink-0 text-emerald-700" />
                            </div>
                            <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
                            <p className="mt-2 text-xs text-slate-500">{difference}</p>
                        </article>
                    ))}
                </section>

                <section className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-slate-900">Grafik pendapatan</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {report.chart.label}: {report.chart.from} s.d. {report.chart.to} · dibandingkan {report.chart.previousFrom} s.d.{' '}
                            {report.chart.previousTo}
                        </p>
                    </div>
                    <form onSubmit={submitChartFilters} className="mb-6 flex flex-wrap items-end gap-3 rounded-xl bg-slate-50 p-4">
                        <label className="grid gap-1 text-sm font-medium text-slate-700">
                            Periode cepat grafik
                            <select
                                value={chartPreset}
                                onChange={(event) => setChartPreset(event.target.value as Preset)}
                                className="min-w-44 rounded-lg border-slate-300 bg-white"
                            >
                                <option value="week">7 hari terakhir</option>
                                <option value="month">1 bulan terakhir</option>
                                <option value="year">1 tahun terakhir</option>
                                <option value="custom">Atur tanggal sendiri</option>
                            </select>
                        </label>
                        {chartPreset === 'custom' && (
                            <>
                                <label className="grid gap-1 text-sm font-medium text-slate-700">
                                    Dari tanggal
                                    <input
                                        type="date"
                                        value={chartStart}
                                        onChange={(event) => setChartStart(event.target.value)}
                                        required
                                        className="rounded-lg border-slate-300 bg-white"
                                    />
                                </label>
                                <label className="grid gap-1 text-sm font-medium text-slate-700">
                                    Sampai tanggal
                                    <input
                                        type="date"
                                        value={chartEnd}
                                        min={chartStart}
                                        onChange={(event) => setChartEnd(event.target.value)}
                                        required
                                        className="rounded-lg border-slate-300 bg-white"
                                    />
                                </label>
                            </>
                        )}
                        <label className="grid gap-1 text-sm font-medium text-slate-700">
                            Kelompokkan grafik
                            <select
                                value={chartGroup}
                                onChange={(event) => setChartGroup(event.target.value as ChartGroup)}
                                className="min-w-36 rounded-lg border-slate-300 bg-white"
                            >
                                <option value="day">Harian</option>
                                <option value="week">Mingguan</option>
                                <option value="month">Bulanan</option>
                                <option value="year">Tahunan</option>
                            </select>
                        </label>
                        <button type="submit" className="rounded-lg bg-emerald-700 px-5 py-2.5 font-semibold text-white hover:bg-emerald-800">
                            Tampilkan grafik
                        </button>
                    </form>
                    <AnalyticsChart points={report.chart.trend} />
                    <p className="mt-4 text-xs text-slate-500">Pendapatan hanya dari pesanan lunas; tanggal memakai waktu pembayaran.</p>
                </section>

                <section className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-slate-900">Performa template</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {report.products.label}: {report.products.from} s.d. {report.products.to} · dibandingkan {report.products.previousFrom}{' '}
                            s.d. {report.products.previousTo}
                        </p>
                    </div>
                    <form onSubmit={submitProductFilters} className="mb-6 flex flex-wrap items-end gap-3 rounded-xl bg-slate-50 p-4">
                        <label className="grid gap-1 text-sm font-medium text-slate-700">
                            Periode template
                            <select
                                value={productPreset}
                                onChange={(event) => setProductPreset(event.target.value as Preset)}
                                className="min-w-44 rounded-lg border-slate-300 bg-white"
                            >
                                <option value="week">Minggu ini</option>
                                <option value="month">Bulan ini</option>
                                <option value="year">Tahun ini</option>
                                <option value="custom">Atur tanggal sendiri</option>
                            </select>
                        </label>
                        {productPreset === 'custom' && (
                            <>
                                <label className="grid gap-1 text-sm font-medium text-slate-700">
                                    Dari tanggal
                                    <input
                                        type="date"
                                        value={productStart}
                                        onChange={(event) => setProductStart(event.target.value)}
                                        required
                                        className="rounded-lg border-slate-300 bg-white"
                                    />
                                </label>
                                <label className="grid gap-1 text-sm font-medium text-slate-700">
                                    Sampai tanggal
                                    <input
                                        type="date"
                                        value={productEnd}
                                        min={productStart}
                                        onChange={(event) => setProductEnd(event.target.value)}
                                        required
                                        className="rounded-lg border-slate-300 bg-white"
                                    />
                                </label>
                            </>
                        )}
                        <button type="submit" className="rounded-lg bg-emerald-700 px-5 py-2.5 font-semibold text-white hover:bg-emerald-800">
                            Tampilkan template
                        </button>
                    </form>
                    <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
                        <article className="rounded-xl border p-4">
                            <h3 className="mb-4 font-bold text-slate-900">Template terjual (periode ini / pembanding)</h3>
                            <ProductUnitsChart products={report.products.topProducts} />
                            <p className="mt-4 text-xs text-slate-500">Setiap item pada pesanan lunas dihitung sebagai 1 unit.</p>
                        </article>
                        <div className="overflow-hidden rounded-xl border">
                            <div className="border-b bg-slate-50 p-4">
                                <h3 className="font-bold text-slate-900">Pendapatan per template</h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    {report.products.table.total.toLocaleString('id-ID')} template · nilai dari harga item pesanan lunas
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-left text-sm">
                                    <thead className="bg-white text-xs tracking-wide text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-4 py-3">Template</th>
                                            <th className="px-4 py-3 text-right">Terjual (ini / lalu)</th>
                                            <th className="px-4 py-3 text-right">Pendapatan (ini / lalu)</th>
                                            <th className="px-4 py-3 text-right">Porsi omzet</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {report.products.table.data.length ? (
                                            report.products.table.data.map((product) => (
                                                <tr key={product.id} className="hover:bg-slate-50/70">
                                                    <td className="px-4 py-3">
                                                        <p className="font-semibold text-slate-900">{product.title}</p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {product.category} · <span className="capitalize">{product.status}</span>
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3 text-right tabular-nums">
                                                        {product.currentUnits} / {product.previousUnits}
                                                    </td>
                                                    <td className="px-4 py-3 text-right tabular-nums">
                                                        <span className="font-semibold">{money(product.currentRevenue)}</span>
                                                        <p className="mt-1 text-xs text-slate-500">{money(product.previousRevenue)}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-right tabular-nums">{product.revenueShare}%</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                                    Belum ada template di katalog.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex items-center justify-between border-t p-3 text-sm">
                                {report.products.table.prev_page_url ? (
                                    <Link href={report.products.table.prev_page_url} className="font-semibold text-emerald-800">
                                        ← Sebelumnya
                                    </Link>
                                ) : (
                                    <span className="text-slate-400">← Sebelumnya</span>
                                )}
                                <span className="text-slate-500">
                                    Halaman {report.products.table.current_page} / {report.products.table.last_page}
                                </span>
                                {report.products.table.next_page_url ? (
                                    <Link href={report.products.table.next_page_url} className="font-semibold text-emerald-800">
                                        Selanjutnya →
                                    </Link>
                                ) : (
                                    <span className="text-slate-400">Selanjutnya →</span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-5 bg-gradient-to-r from-emerald-950 to-emerald-800 p-5 text-white md:p-6">
                        <div className="flex max-w-2xl gap-3">
                            <span className="rounded-xl bg-white/10 p-2 text-emerald-100">
                                <Download size={20} />
                            </span>
                            <div>
                                <p className="text-xs font-bold tracking-widest text-emerald-200 uppercase">Laporan siap unduh</p>
                                <h2 className="mt-1 text-xl font-bold">Pilih rentang sebelum mengunduh</h2>
                                <p className="mt-1 text-sm text-emerald-100">
                                    Tentukan tanggal langsung di sini. Rentang untuk grafik dan template bisa berbeda; pilihan ini khusus untuk file
                                    unduhan dan tidak mengubah tampilan laporan di atas.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                disabled={!exportReady}
                                onClick={() =>
                                    window.location.assign(
                                        `/admin/analytics/export/pdf?${exportQueryString(filters, exportChartStart, exportChartEnd, exportProductStart, exportProductEnd)}`,
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-emerald-900 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Download size={17} /> Unduh PDF
                            </button>
                            <button
                                type="button"
                                disabled={!exportReady}
                                onClick={() =>
                                    window.location.assign(
                                        `/admin/analytics/export/excel?${exportQueryString(filters, exportChartStart, exportChartEnd, exportProductStart, exportProductEnd)}`,
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <FileSpreadsheet size={17} /> Unduh Excel
                            </button>
                        </div>
                    </div>
                    <div className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
                        <fieldset className="rounded-xl border bg-slate-50 p-4">
                            <legend className="px-1 text-sm font-bold text-slate-800">Rentang grafik pendapatan</legend>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className="grid gap-1 text-sm font-medium text-slate-700">
                                    Dari tanggal
                                    <input
                                        type="date"
                                        value={exportChartStart}
                                        max={exportChartEnd && exportChartEnd < today ? exportChartEnd : today}
                                        onChange={(event) => setExportChartStart(event.target.value)}
                                        required
                                        className="rounded-lg border-slate-300 bg-white"
                                    />
                                </label>
                                <label className="grid gap-1 text-sm font-medium text-slate-700">
                                    Sampai tanggal
                                    <input
                                        type="date"
                                        value={exportChartEnd}
                                        min={exportChartStart || undefined}
                                        max={today}
                                        onChange={(event) => setExportChartEnd(event.target.value)}
                                        required
                                        className="rounded-lg border-slate-300 bg-white"
                                    />
                                </label>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">Grafik dikelompokkan {chartGroupName(filters.chartGroup)}.</p>
                        </fieldset>
                        <fieldset className="rounded-xl border bg-slate-50 p-4">
                            <legend className="px-1 text-sm font-bold text-slate-800">Rentang performa template</legend>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className="grid gap-1 text-sm font-medium text-slate-700">
                                    Dari tanggal
                                    <input
                                        type="date"
                                        value={exportProductStart}
                                        max={exportProductEnd && exportProductEnd < today ? exportProductEnd : today}
                                        onChange={(event) => setExportProductStart(event.target.value)}
                                        required
                                        className="rounded-lg border-slate-300 bg-white"
                                    />
                                </label>
                                <label className="grid gap-1 text-sm font-medium text-slate-700">
                                    Sampai tanggal
                                    <input
                                        type="date"
                                        value={exportProductEnd}
                                        min={exportProductStart || undefined}
                                        max={today}
                                        onChange={(event) => setExportProductEnd(event.target.value)}
                                        required
                                        className="rounded-lg border-slate-300 bg-white"
                                    />
                                </label>
                            </div>
                        </fieldset>
                        <p
                            role="status"
                            aria-live="polite"
                            className={`text-sm md:col-span-2 ${exportReady ? 'text-emerald-800' : 'text-amber-800'}`}
                        >
                            {exportReady
                                ? 'Rentang tanggal sudah valid. PDF dan Excel akan dibuat memakai kedua rentang di atas.'
                                : 'Periksa tanggal: tanggal awal harus sebelum/sama dengan tanggal akhir dan tidak boleh melewati hari ini.'}
                        </p>
                    </div>
                </section>

                <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex gap-3">
                            <span className="rounded-xl bg-white p-2 text-emerald-700 shadow-sm">
                                <Sparkles size={20} />
                            </span>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Rekomendasi AI untuk langkah berikutnya</h2>
                                <p className="mt-1 max-w-3xl text-sm text-slate-600">
                                    Gemini menganalisis agregat penjualan pada rentang template terpilih. Ini tren internal toko, bukan tren internet;
                                    data pembeli tidak dikirim.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={generateRecommendations}
                            disabled={isGenerating}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
                        >
                            <Lightbulb size={17} /> {isGenerating ? 'Sedang menganalisis…' : 'Buat rekomendasi AI'}
                        </button>
                    </div>
                    {recommendationError && (
                        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            {recommendationError}
                        </p>
                    )}
                    {recommendationResult && (
                        <div className="mt-5 space-y-4 border-t border-emerald-200 pt-5">
                            <p className="leading-relaxed font-medium text-slate-800">{recommendationResult.summary}</p>
                            {recommendationResult.recommendations.length ? (
                                <div className="grid gap-3 md:grid-cols-2">
                                    {recommendationResult.recommendations.map((recommendation, index) => (
                                        <article key={`${recommendation.type}-${index}`} className="rounded-xl border bg-white p-4">
                                            <span className="text-xs font-bold tracking-wide text-emerald-800 uppercase">
                                                {recommendation.type === 'promote' ? 'Promosikan template' : 'Ide template baru'}
                                            </span>
                                            <h3 className="mt-2 font-bold text-slate-900">{recommendation.product?.title ?? recommendation.idea}</h3>
                                            {recommendation.product && (
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {recommendation.product.category} · {recommendation.product.currentUnits} unit,{' '}
                                                    {money(recommendation.product.currentRevenue)} pada periode ini
                                                </p>
                                            )}
                                            {recommendation.type === 'promote' && (
                                                <p className="mt-2 text-sm text-slate-600">Ide: {recommendation.idea}</p>
                                            )}
                                            <p className="mt-2 text-sm text-slate-600">{recommendation.rationale}</p>
                                            <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
                                                <strong>Langkah:</strong> {recommendation.action}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-600">Belum ada saran yang cukup didukung data untuk periode ini.</p>
                            )}
                            <p className="text-xs text-slate-500">
                                Gunakan hasil ini sebagai bahan pertimbangan dan validasi ide sebelum diterapkan.
                            </p>
                        </div>
                    )}
                </section>
            </main>
        </AppLayout>
    );
}

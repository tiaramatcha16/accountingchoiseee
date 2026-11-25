import AppLayout from '@/layouts/app-layout';
import { getCsrfHeaders } from '@/lib/csrf';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { BarChart3, Download, FileSpreadsheet, Lightbulb, TrendingUp, Wallet } from 'lucide-react';
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
            <Head title="Analitik Penjualan - AccountingChoice" />
            <main className="mx-auto w-full max-w-7xl space-y-8 p-5 sm:p-6 lg:p-8">
                {/* Header */}
                <header className="border-b border-black/[0.06] pb-6">
                    <span className="inline-flex items-center rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-700 uppercase">
                        Kecerdasan Bisnis & Penjualan
                    </span>
                    <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.035em] text-[#1d1d1f]">
                        Analitik Penjualan & Laporan
                    </h1>
                    <p className="mt-1 text-sm text-[#86868b]">
                        Pantau tren pendapatan, kontribusi omzet per template spreadsheet, dan hasilkan rekomendasi strategis AI.
                    </p>
                </header>

                {/* Stat Cards */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map(({ label, value, comparison: difference, icon: Icon }) => (
                        <article key={label} className="rounded-3xl border border-black/[0.06] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition hover:border-black/[0.12]">
                            <div className="flex items-center justify-between gap-3 text-xs font-medium text-[#86868b]">
                                <span>{label}</span>
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-[#1d1d1f]">
                                    <Icon size={16} />
                                </span>
                            </div>
                            <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">{value}</p>
                            <p className="mt-1 text-xs text-[#86868b]">{difference}</p>
                        </article>
                    ))}
                </section>

                {/* Revenue Chart Section */}
                <section className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                    <div className="mb-4">
                        <h2 className="text-base font-semibold text-[#1d1d1f]">Grafik Tren Pendapatan</h2>
                        <p className="mt-0.5 text-xs text-[#86868b]">
                            {report.chart.label}: {report.chart.from} s.d. {report.chart.to} · dibandingkan {report.chart.previousFrom} s.d.{' '}
                            {report.chart.previousTo}
                        </p>
                    </div>
                    <form onSubmit={submitChartFilters} className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl bg-[#f5f5f7]/60 p-4 border border-black/[0.04]">
                        <label className="grid gap-1 text-xs font-medium text-[#1d1d1f]">
                            Periode Cepat
                            <select
                                value={chartPreset}
                                onChange={(event) => setChartPreset(event.target.value as Preset)}
                                className="min-w-44 rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-xs text-[#1d1d1f] outline-none"
                            >
                                <option value="week">7 Hari Terakhir</option>
                                <option value="month">1 Bulan Terakhir</option>
                                <option value="year">1 Tahun Terakhir</option>
                                <option value="custom">Atur Tanggal Sendiri</option>
                            </select>
                        </label>
                        {chartPreset === 'custom' && (
                            <>
                                <label className="grid gap-1 text-xs font-medium text-[#1d1d1f]">
                                    Dari Tanggal
                                    <input
                                        type="date"
                                        value={chartStart}
                                        onChange={(event) => setChartStart(event.target.value)}
                                        required
                                        className="rounded-xl border border-black/[0.08] bg-white px-3 py-1.5 text-xs text-[#1d1d1f] outline-none"
                                    />
                                </label>
                                <label className="grid gap-1 text-xs font-medium text-[#1d1d1f]">
                                    Sampai Tanggal
                                    <input
                                        type="date"
                                        value={chartEnd}
                                        min={chartStart}
                                        onChange={(event) => setChartEnd(event.target.value)}
                                        required
                                        className="rounded-xl border border-black/[0.08] bg-white px-3 py-1.5 text-xs text-[#1d1d1f] outline-none"
                                    />
                                </label>
                            </>
                        )}
                        <label className="grid gap-1 text-xs font-medium text-[#1d1d1f]">
                            Pengelompokan
                            <select
                                value={chartGroup}
                                onChange={(event) => setChartGroup(event.target.value as ChartGroup)}
                                className="min-w-36 rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-xs text-[#1d1d1f] outline-none"
                            >
                                <option value="day">Harian</option>
                                <option value="week">Mingguan</option>
                                <option value="month">Bulanan</option>
                                <option value="year">Tahunan</option>
                            </select>
                        </label>
                        <button type="submit" className="rounded-full bg-[#1d1d1f] px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#333336] active:scale-95">
                            Tampilkan Grafik
                        </button>
                    </form>
                    <AnalyticsChart points={report.chart.trend} />
                    <p className="mt-4 text-[11px] text-[#86868b]">Pendapatan hanya dari pesanan lunas; tanggal memakai waktu pembayaran terverifikasi.</p>
                </section>

                {/* Template Performance Section */}
                <section className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                    <div className="mb-4">
                        <h2 className="text-base font-semibold text-[#1d1d1f]">Performa Template Spreadsheet</h2>
                        <p className="mt-0.5 text-xs text-[#86868b]">
                            {report.products.label}: {report.products.from} s.d. {report.products.to} · dibandingkan {report.products.previousFrom}{' '}
                            s.d. {report.products.previousTo}
                        </p>
                    </div>
                    <form onSubmit={submitProductFilters} className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl bg-[#f5f5f7]/60 p-4 border border-black/[0.04]">
                        <label className="grid gap-1 text-xs font-medium text-[#1d1d1f]">
                            Periode Template
                            <select
                                value={productPreset}
                                onChange={(event) => setProductPreset(event.target.value as Preset)}
                                className="min-w-44 rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-xs text-[#1d1d1f] outline-none"
                            >
                                <option value="week">Minggu ini</option>
                                <option value="month">Bulan ini</option>
                                <option value="year">Tahun ini</option>
                                <option value="custom">Atur tanggal sendiri</option>
                            </select>
                        </label>
                        {productPreset === 'custom' && (
                            <>
                                <label className="grid gap-1 text-xs font-medium text-[#1d1d1f]">
                                    Dari tanggal
                                    <input
                                        type="date"
                                        value={productStart}
                                        onChange={(event) => setProductStart(event.target.value)}
                                        required
                                        className="rounded-xl border border-black/[0.08] bg-white px-3 py-1.5 text-xs text-[#1d1d1f] outline-none"
                                    />
                                </label>
                                <label className="grid gap-1 text-xs font-medium text-[#1d1d1f]">
                                    Sampai tanggal
                                    <input
                                        type="date"
                                        value={productEnd}
                                        min={productStart}
                                        onChange={(event) => setProductEnd(event.target.value)}
                                        required
                                        className="rounded-xl border border-black/[0.08] bg-white px-3 py-1.5 text-xs text-[#1d1d1f] outline-none"
                                    />
                                </label>
                            </>
                        )}
                        <button type="submit" className="rounded-full bg-[#1d1d1f] px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#333336] active:scale-95">
                            Tampilkan Template
                        </button>
                    </form>
                    <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
                        <article className="rounded-2xl border border-black/[0.06] p-5 bg-[#fbfbfd]">
                            <h3 className="mb-4 text-xs font-semibold text-[#1d1d1f]">Unit Terjual (Periode Ini / Pembanding)</h3>
                            <ProductUnitsChart products={report.products.topProducts} />
                            <p className="mt-4 text-[11px] text-[#86868b]">Setiap item pada pesanan lunas dihitung sebagai 1 unit.</p>
                        </article>
                        <div className="overflow-hidden rounded-2xl border border-black/[0.06]">
                            <div className="border-b border-black/[0.05] bg-[#f5f5f7]/60 p-4">
                                <h3 className="text-xs font-semibold text-[#1d1d1f]">Pendapatan per Template</h3>
                                <p className="mt-0.5 text-[11px] text-[#86868b]">
                                    {report.products.table.total.toLocaleString('id-ID')} template · nilai dari harga item pesanan lunas
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-left text-xs">
                                    <thead className="bg-white text-[10px] tracking-wide text-[#86868b] uppercase border-b border-black/[0.04]">
                                        <tr>
                                            <th className="px-4 py-3">Template</th>
                                            <th className="px-4 py-3 text-right">Terjual (ini / lalu)</th>
                                            <th className="px-4 py-3 text-right">Pendapatan (ini / lalu)</th>
                                            <th className="px-4 py-3 text-right">Porsi Omzet</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/[0.04] text-[#1d1d1f]">
                                        {report.products.table.data.length ? (
                                            report.products.table.data.map((product) => (
                                                <tr key={product.id} className="hover:bg-neutral-50/50 transition">
                                                    <td className="px-4 py-3">
                                                        <p className="font-semibold text-[#1d1d1f]">{product.title}</p>
                                                        <p className="mt-0.5 text-[11px] text-[#86868b]">
                                                            {product.category} · <span className="capitalize">{product.status}</span>
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3 text-right tabular-nums">
                                                        {product.currentUnits} / {product.previousUnits}
                                                    </td>
                                                    <td className="px-4 py-3 text-right tabular-nums">
                                                        <span className="font-semibold">{money(product.currentRevenue)}</span>
                                                        <p className="mt-0.5 text-[10px] text-[#86868b]">{money(product.previousRevenue)}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-right tabular-nums font-semibold">{product.revenueShare}%</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-[#86868b]">
                                                    Belum ada template di katalog.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex items-center justify-between border-t border-black/[0.05] p-3 text-xs bg-[#fbfbfd]">
                                {report.products.table.prev_page_url ? (
                                    <Link href={report.products.table.prev_page_url} className="font-semibold text-[#1d1d1f] hover:underline">
                                        ← Sebelumnya
                                    </Link>
                                ) : (
                                    <span className="text-[#86868b]">← Sebelumnya</span>
                                )}
                                <span className="text-[#86868b]">
                                    Halaman {report.products.table.current_page} / {report.products.table.last_page}
                                </span>
                                {report.products.table.next_page_url ? (
                                    <Link href={report.products.table.next_page_url} className="font-semibold text-[#1d1d1f] hover:underline">
                                        Selanjutnya →
                                    </Link>
                                ) : (
                                    <span className="text-[#86868b]">Selanjutnya →</span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Export Report Card */}
                <section className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                    <div className="flex flex-wrap items-start justify-between gap-5 bg-gradient-to-br from-[#1d1d1f] to-[#333336] p-6 text-white md:p-8">
                        <div className="flex max-w-2xl gap-3.5">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                                <Download size={20} />
                            </span>
                            <div>
                                <span className="text-[11px] font-semibold tracking-wider text-white/60 uppercase">Ekspor Dokumen</span>
                                <h2 className="mt-1 text-xl font-semibold tracking-tight">Unduh Laporan Penjualan</h2>
                                <p className="mt-1 text-xs text-white/70 leading-relaxed">
                                    Unduh rekapan analitik penjualan toko dalam format PDF resmi atau Excel (.xlsx) untuk pembukuan internal.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            <button
                                type="button"
                                disabled={!exportReady}
                                onClick={() =>
                                    window.location.assign(
                                        `/admin/analytics/export/pdf?${exportQueryString(filters, exportChartStart, exportChartEnd, exportProductStart, exportProductEnd)}`,
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-[#1d1d1f] shadow-xs transition hover:bg-neutral-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Download size={14} /> Unduh PDF
                            </button>
                            <button
                                type="button"
                                disabled={!exportReady}
                                onClick={() =>
                                    window.location.assign(
                                        `/admin/analytics/export/excel?${exportQueryString(filters, exportChartStart, exportChartEnd, exportProductStart, exportProductEnd)}`,
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FileSpreadsheet size={14} /> Unduh Excel
                            </button>
                        </div>
                    </div>
                    <div className="grid gap-4 p-5 md:grid-cols-2 md:p-6 bg-[#fbfbfd]">
                        <fieldset className="rounded-2xl border border-black/[0.06] bg-white p-4">
                            <legend className="px-1 text-xs font-semibold text-[#1d1d1f]">Rentang Grafik Pendapatan</legend>
                            <div className="grid gap-3 sm:grid-cols-2 mt-2">
                                <label className="grid gap-1 text-xs font-medium text-[#86868b]">
                                    Dari Tanggal
                                    <input
                                        type="date"
                                        value={exportChartStart}
                                        max={exportChartEnd && exportChartEnd < today ? exportChartEnd : today}
                                        onChange={(event) => setExportChartStart(event.target.value)}
                                        required
                                        className="rounded-xl border border-black/[0.08] bg-[#fbfbfd] px-3 py-1.5 text-xs text-[#1d1d1f]"
                                    />
                                </label>
                                <label className="grid gap-1 text-xs font-medium text-[#86868b]">
                                    Sampai Tanggal
                                    <input
                                        type="date"
                                        value={exportChartEnd}
                                        min={exportChartStart || undefined}
                                        max={today}
                                        onChange={(event) => setExportChartEnd(event.target.value)}
                                        required
                                        className="rounded-xl border border-black/[0.08] bg-[#fbfbfd] px-3 py-1.5 text-xs text-[#1d1d1f]"
                                    />
                                </label>
                            </div>
                        </fieldset>
                        <fieldset className="rounded-2xl border border-black/[0.06] bg-white p-4">
                            <legend className="px-1 text-xs font-semibold text-[#1d1d1f]">Rentang Performa Template</legend>
                            <div className="grid gap-3 sm:grid-cols-2 mt-2">
                                <label className="grid gap-1 text-xs font-medium text-[#86868b]">
                                    Dari Tanggal
                                    <input
                                        type="date"
                                        value={exportProductStart}
                                        max={exportProductEnd && exportProductEnd < today ? exportProductEnd : today}
                                        onChange={(event) => setExportProductStart(event.target.value)}
                                        required
                                        className="rounded-xl border border-black/[0.08] bg-[#fbfbfd] px-3 py-1.5 text-xs text-[#1d1d1f]"
                                    />
                                </label>
                                <label className="grid gap-1 text-xs font-medium text-[#86868b]">
                                    Sampai Tanggal
                                    <input
                                        type="date"
                                        value={exportProductEnd}
                                        min={exportProductStart || undefined}
                                        max={today}
                                        onChange={(event) => setExportProductEnd(event.target.value)}
                                        required
                                        className="rounded-xl border border-black/[0.08] bg-[#fbfbfd] px-3 py-1.5 text-xs text-[#1d1d1f]"
                                    />
                                </label>
                            </div>
                        </fieldset>
                    </div>
                </section>

                {/* AI Recommendations Section */}
                <section className="rounded-3xl border border-black/[0.06] bg-gradient-to-br from-white to-emerald-50/20 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-[#1d1d1f] shadow-xs">
                                <Lightbulb size={20} />
                            </span>
                            <div>
                                <h2 className="text-base font-semibold text-[#1d1d1f]">Rekomendasi Analitik & Bisnis</h2>
                                <p className="mt-1 max-w-3xl text-xs sm:text-sm text-[#86868b] leading-relaxed">
                                    Gemini menganalisis agregat penjualan pada rentang template terpilih untuk menemukan peluang promosi dan ide produk baru.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={generateRecommendations}
                            disabled={isGenerating}
                            className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#333336] active:scale-95 disabled:cursor-wait disabled:opacity-50"
                        >
                            <Lightbulb size={14} /> {isGenerating ? 'Sedang Menganalisis…' : 'Hasilkan Rekomendasi AI'}
                        </button>
                    </div>
                    {recommendationError && (
                        <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                            {recommendationError}
                        </p>
                    )}
                    {recommendationResult && (
                        <div className="mt-6 space-y-4 border-t border-black/[0.06] pt-5">
                            <p className="text-xs sm:text-sm leading-relaxed font-medium text-[#1d1d1f]">{recommendationResult.summary}</p>
                            {recommendationResult.recommendations.length ? (
                                <div className="grid gap-3 md:grid-cols-2 mt-4">
                                    {recommendationResult.recommendations.map((recommendation, index) => (
                                        <article key={`${recommendation.type}-${index}`} className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-xs">
                                            <span className="inline-block rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-600">
                                                {recommendation.type === 'promote' ? 'Promosikan Template' : 'Ide Template Baru'}
                                            </span>
                                            <h3 className="mt-2 text-xs font-semibold text-[#1d1d1f]">{recommendation.product?.title ?? recommendation.idea}</h3>
                                            {recommendation.product && (
                                                <p className="mt-1 text-[11px] text-[#86868b]">
                                                    {recommendation.product.category} · {recommendation.product.currentUnits} unit,{' '}
                                                    {money(recommendation.product.currentRevenue)} pada periode ini
                                                </p>
                                            )}
                                            {recommendation.type === 'promote' && (
                                                <p className="mt-1.5 text-xs text-[#86868b]">Ide: {recommendation.idea}</p>
                                            )}
                                            <p className="mt-1.5 text-xs text-[#86868b] leading-relaxed">{recommendation.rationale}</p>
                                            <p className="mt-3 rounded-xl bg-emerald-50/80 p-2.5 text-xs font-medium text-emerald-900 border border-emerald-200/60">
                                                <strong>Langkah:</strong> {recommendation.action}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-[#86868b]">Belum ada saran yang cukup didukung data untuk periode ini.</p>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </AppLayout>
    );
}

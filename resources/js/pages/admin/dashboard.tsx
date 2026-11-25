import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BarChart3, ClipboardList, FileSpreadsheet, PackageCheck, ShoppingBag, TrendingUp, Users, Wallet } from 'lucide-react';

interface Order {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    buyer: { name: string; email: string };
}

interface Product {
    id: number;
    title: string;
    price: number;
    status: string;
    order_items_count: number;
}

interface MonthSale {
    month: string;
    total: number;
}

const money = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);

export default function AdminDashboard({
    stats,
    recentOrders,
    topProducts,
    salesByMonth,
}: {
    stats: {
        products: number;
        published: number;
        drafts: number;
        orders: number;
        pendingOrders: number;
        cancelledOrders: number;
        users: number;
        revenue: number;
    };
    recentOrders: Order[];
    topProducts: Product[];
    salesByMonth: MonthSale[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Admin', href: '/admin' }];

    const cards = [
        { label: 'Template Terdaftar', value: stats.products, icon: FileSpreadsheet, sub: `${stats.published} tayang · ${stats.drafts} draft` },
        { label: 'Total Pesanan', value: stats.orders, icon: ShoppingBag, sub: `${stats.pendingOrders} perlu verifikasi` },
        { label: 'Pembeli Terdaftar', value: stats.users, icon: Users, sub: 'Akun pelanggan aktif' },
        { label: 'Pendapatan Terverifikasi', value: money(stats.revenue), icon: Wallet, highlight: true },
    ];

    const maxSales = Math.max(1, ...salesByMonth.map((sale) => Number(sale.total)));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin - AccountingChoice" />
            <main className="mx-auto w-full max-w-7xl space-y-8 p-5 sm:p-6 lg:p-8">
                {/* Apple Keynote Style Hero Header */}
                <header className="relative overflow-hidden rounded-3xl border border-black/[0.06] bg-gradient-to-br from-[#ffffff] via-[#fbfbfd] to-[#f5f5f7] p-6 sm:p-8 lg:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-emerald-100/40 blur-3xl"
                    />
                    <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
                        <div className="max-w-2xl">
                            <span className="inline-flex items-center rounded-full border border-black/[0.08] bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#1d1d1f] shadow-xs backdrop-blur-md">
                                Panel Kendali Toko
                            </span>
                            <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-[-0.035em] text-[#1d1d1f] leading-tight">
                                Dashboard Administrator
                            </h1>
                            <p className="mt-2 text-sm sm:text-base text-[#86868b] leading-relaxed">
                                Pantau template spreadsheet, otomatisasi pengiriman Google Drive, transaksi Midtrans QRIS, dan analitik performa toko.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/admin/products"
                                className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#333336] active:scale-95"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                <span>Kelola Template</span>
                            </Link>
                            <Link
                                href="/admin/orders"
                                className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-5 py-2.5 text-xs font-semibold text-[#1d1d1f] shadow-xs transition hover:bg-neutral-50 active:scale-95"
                            >
                                <ShoppingBag className="h-4 w-4 text-[#86868b]" />
                                <span>Pesanan Masuk</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Key Metrics Grid */}
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map(({ label, value, icon: Icon, sub, highlight }) => (
                        <article
                            key={label}
                            className={`rounded-3xl border border-black/[0.06] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition hover:border-black/[0.12] ${
                                highlight ? 'bg-gradient-to-br from-white to-emerald-50/30' : 'bg-white'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-[#86868b]">{label}</span>
                                <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${
                                    highlight ? 'bg-emerald-100/60 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                                }`}>
                                    <Icon className="h-4 w-4" />
                                </span>
                            </div>
                            <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">{value}</p>
                            {sub && <p className="mt-1 text-xs text-[#86868b]">{sub}</p>}
                        </article>
                    ))}
                </section>

                {/* Charts & Top Templates Grid */}
                <section className="grid gap-6 lg:grid-cols-2">
                    {/* Monthly Sales Bar Chart */}
                    <article className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center justify-between border-b border-black/[0.05] pb-4">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-[#1d1d1f]">
                                    <BarChart3 className="h-4 w-4" />
                                </span>
                                <div>
                                    <h2 className="text-base font-semibold text-[#1d1d1f]">Tren Pendapatan Bulanan</h2>
                                    <p className="text-xs text-[#86868b]">Performa enam bulan terakhir</p>
                                </div>
                            </div>
                            <Link href="/admin/analytics" className="text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f] transition">
                                Analitik lengkap →
                            </Link>
                        </div>
                        <div className="mt-6 flex h-48 items-end gap-3 pt-4">
                            {salesByMonth.length ? (
                                salesByMonth.map((sale) => (
                                    <div key={sale.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2 group">
                                        <span className="text-center text-[10px] font-mono text-[#86868b] opacity-0 group-hover:opacity-100 transition">
                                            {money(Number(sale.total))}
                                        </span>
                                        <div
                                            className="w-full rounded-t-xl bg-[#1d1d1f] transition-all group-hover:bg-neutral-700"
                                            style={{ height: `${Math.max(6, (Number(sale.total) / maxSales) * 80)}%` }}
                                        />
                                        <span className="text-[11px] font-medium text-[#86868b]">{sale.month}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="m-auto text-xs text-[#86868b]">Belum ada data pembayaran terverifikasi.</p>
                            )}
                        </div>
                    </article>

                    {/* Top Selling Templates */}
                    <article className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center justify-between border-b border-black/[0.05] p-6 pb-4">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-[#1d1d1f]">
                                    <TrendingUp className="h-4 w-4" />
                                </span>
                                <div>
                                    <h2 className="text-base font-semibold text-[#1d1d1f]">Template Terpopuler</h2>
                                    <p className="text-xs text-[#86868b]">Paling banyak dipesan pelanggan</p>
                                </div>
                            </div>
                            <Link href="/admin/products" className="text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f] transition">
                                Semua template →
                            </Link>
                        </div>
                        <div className="divide-y divide-black/[0.04]">
                            {topProducts.length ? (
                                topProducts.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between gap-3 p-4 px-6 hover:bg-neutral-50/60 transition">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-semibold text-[#1d1d1f]">{product.title}</p>
                                            <p className="mt-0.5 text-[11px] text-[#86868b] capitalize">{product.status} · {money(product.price)}</p>
                                        </div>
                                        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-[#1d1d1f]">
                                            {product.order_items_count} pesanan
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="p-6 text-center text-xs text-[#86868b]">Belum ada template.</p>
                            )}
                        </div>
                    </article>
                </section>

                {/* Recent Orders Section */}
                <section className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center justify-between border-b border-black/[0.05] p-6 pb-4">
                        <div>
                            <h2 className="text-base font-semibold text-[#1d1d1f]">Pesanan Terbaru</h2>
                            <p className="text-xs text-[#86868b]">Transaksi masuk dan status verifikasi Midtrans</p>
                        </div>
                        <Link
                            href="/admin/orders"
                            className="inline-flex items-center gap-1 rounded-full border border-black/[0.08] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1d1d1f] transition hover:bg-neutral-50"
                        >
                            <span>Lihat Semua</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    <div className="divide-y divide-black/[0.04]">
                        {recentOrders.length ? (
                            recentOrders.map((order) => (
                                <div key={order.id} className="flex flex-wrap items-center justify-between gap-4 p-4 px-6 hover:bg-neutral-50/60 transition">
                                    <div>
                                        <span className="font-mono text-xs font-semibold text-[#1d1d1f]">{order.order_number}</span>
                                        <p className="mt-0.5 text-xs text-[#86868b]">
                                            {order.buyer?.name} · <span className="font-mono">{order.buyer?.email}</span> ·{' '}
                                            {new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                        </p>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <p className="text-sm font-semibold text-[#1d1d1f]">{money(order.total_amount)}</p>
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                                                order.status === 'paid'
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                                    : order.status === 'pending'
                                                      ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                                      : 'bg-neutral-100 text-[#86868b]'
                                            }`}
                                        >
                                            {order.status === 'paid' ? 'Lunas' : order.status === 'pending' ? 'Menunggu' : 'Batal'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="p-8 text-center text-xs text-[#86868b]">Belum ada pesanan pembeli.</p>
                        )}
                    </div>
                </section>
            </main>
        </AppLayout>
    );
}

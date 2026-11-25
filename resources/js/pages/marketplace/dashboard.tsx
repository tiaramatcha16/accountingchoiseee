import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Clock3, FileSpreadsheet, ShoppingBag, Wallet } from 'lucide-react';

interface OrderItem {
    id: number;
    product_title: string;
    unit_price: number;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    items: OrderItem[];
}

interface Product {
    id: number;
    title: string;
    slug: string;
    category: string;
    description: string;
    price: number;
}

const money = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

export default function BuyerDashboard({
    stats,
    recentOrders,
    featuredProducts,
}: {
    stats: { orders: number; pending: number; paid: number; totalSpent: number };
    recentOrders: Order[];
    featuredProducts: Product[];
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Pembeli - AccountingChoice" />
            <main className="mx-auto w-full max-w-7xl space-y-8 p-5 sm:p-6 lg:p-8">
                {/* Hero Card */}
                <section className="relative overflow-hidden rounded-3xl border border-black/[0.06] bg-gradient-to-br from-white via-[#fbfbfd] to-[#f5f5f7] p-6 sm:p-8 lg:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-emerald-100/30 blur-3xl"
                    />
                    <div className="relative z-10 max-w-2xl">
                        <span className="inline-flex items-center rounded-full border border-black/[0.08] bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#1d1d1f] shadow-xs backdrop-blur-md">
                            Template Akuntansi Otomatis
                        </span>
                        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-[-0.035em] text-[#1d1d1f] leading-tight">
                            Selamat Datang di Akun Anda.
                        </h1>
                        <p className="mt-2 text-sm sm:text-base text-[#86868b] leading-relaxed">
                            Akses spreadsheet keuangan siap pakai Anda, pantau riwayat pesanan Google Sheets, dan buka panduan penggunaan cerdas di satu tempat.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/#template-list"
                                className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#333336] active:scale-95"
                            >
                                <span>Lihat Semua Template</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                            <Link
                                href="/my-orders"
                                className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-5 py-2.5 text-xs font-semibold text-[#1d1d1f] shadow-xs transition hover:bg-neutral-50 active:scale-95"
                            >
                                <ShoppingBag className="h-3.5 w-3.5 text-[#86868b]" />
                                <span>Pesanan Saya</span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Stat Cards */}
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'Total Pesanan', value: stats.orders, icon: ShoppingBag, sub: 'Semua transaksi' },
                        { label: 'Menunggu Pembayaran', value: stats.pending, icon: Clock3, sub: 'Perlu diselesaikan' },
                        { label: 'Pembelian Berhasil', value: stats.paid, icon: FileSpreadsheet, sub: 'Akses Google Drive aktif' },
                        { label: 'Total Belanja Berhasil', value: money(stats.totalSpent), icon: Wallet, sub: 'Investasi akuntansi', highlight: true },
                    ].map(({ label, value, icon: Icon, sub, highlight }) => (
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
                            <p className="mt-1 text-xs text-[#86868b]">{sub}</p>
                        </article>
                    ))}
                </section>

                {/* Recent Orders & How It Works */}
                <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                    <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center justify-between border-b border-black/[0.05] p-5 px-6">
                            <div>
                                <h2 className="text-base font-semibold text-[#1d1d1f]">Pesanan Terbaru</h2>
                                <p className="text-xs text-[#86868b]">Status pembayaran dan akses spreadsheet</p>
                            </div>
                            <Link href="/my-orders" className="text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f] transition">
                                Semua pesanan →
                            </Link>
                        </div>
                        {recentOrders.length ? (
                            <div className="divide-y divide-black/[0.04]">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 p-4 px-6 hover:bg-neutral-50/50 transition">
                                        <div>
                                            <p className="font-mono text-xs font-semibold text-[#1d1d1f]">{order.order_number}</p>
                                            <p className="mt-0.5 text-xs text-[#86868b]">{order.items.map((item) => item.product_title).join(', ')}</p>
                                            <p className="mt-0.5 text-[10px] text-[#86868b]">{new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                                        </div>
                                        <div className="text-right flex items-center gap-3">
                                            <p className="text-xs font-semibold text-[#1d1d1f]">{money(order.total_amount)}</p>
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
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
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-[#86868b]">
                                    <ShoppingBag className="h-6 w-6" />
                                </div>
                                <h3 className="text-sm font-semibold text-[#1d1d1f]">Belum ada pesanan</h3>
                                <p className="mt-1 text-xs text-[#86868b]">Template yang kamu beli akan tampil di sini.</p>
                                <Link
                                    href="/#template-list"
                                    className="mt-4 inline-flex items-center gap-1 rounded-full bg-[#1d1d1f] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#333336]"
                                >
                                    <span>Mulai Belanja</span>
                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* How It Works Card */}
                    <aside className="rounded-3xl border border-black/[0.06] bg-[#f5f5f7]/60 p-6">
                        <h2 className="text-base font-semibold text-[#1d1d1f]">Panduan Pembelian</h2>
                        <ol className="mt-4 space-y-4 text-xs text-[#86868b]">
                            <li className="flex gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1d1d1f] text-[10px] font-semibold text-white">1</span>
                                <div>
                                    <strong className="text-[#1d1d1f]">Pilih Template Spreadsheet</strong>
                                    <p className="mt-0.5">Pilih spreadsheet yang sesuai kebutuhan UMKM, freelancer, atau pribadi Anda.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1d1d1f] text-[10px] font-semibold text-white">2</span>
                                <div>
                                    <strong className="text-[#1d1d1f]">Checkout & Masukkan Email Google</strong>
                                    <p className="mt-0.5">Setiap lisensi memiliki kolom email tersendiri untuk hak akses Google Drive.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1d1d1f] text-[10px] font-semibold text-white">3</span>
                                <div>
                                    <strong className="text-[#1d1d1f]">Akses Otomatis Instan</strong>
                                    <p className="mt-0.5">Setelah lunas melalui QRIS, Google Drive API menduplikasi spreadsheet baru khusus untuk email Anda.</p>
                                </div>
                            </li>
                        </ol>
                        <Link
                            href="/#template-list"
                            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#333336] active:scale-95"
                        >
                            <span>Jelajahi Katalog Template</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </aside>
                </section>

                {/* Featured Templates */}
                <section>
                    <div className="mb-4 flex items-end justify-between">
                        <div>
                            <span className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">Rekomendasi</span>
                            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#1d1d1f]">Template Pilihan</h2>
                        </div>
                        <Link href="/templates" className="text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f] transition">
                            Semua template →
                        </Link>
                    </div>
                    {featuredProducts.length ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {featuredProducts.map((product) => (
                                <article
                                    key={product.id}
                                    className="flex flex-col rounded-3xl border border-black/[0.06] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition hover:border-black/[0.12]"
                                >
                                    <span className="w-fit rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-600">
                                        {product.category}
                                    </span>
                                    <h3 className="mt-3 text-sm font-semibold text-[#1d1d1f]">{product.title}</h3>
                                    <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-[#86868b]">{product.description}</p>
                                    <div className="mt-4 flex items-center justify-between border-t border-black/[0.05] pt-3">
                                        <span className="text-xs font-semibold text-[#1d1d1f]">{money(product.price)}</span>
                                        <Link
                                            href={`/products/${product.slug}`}
                                            className="text-xs font-semibold text-[#1d1d1f] hover:underline"
                                        >
                                            Detail →
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-dashed border-black/[0.08] p-8 text-center text-xs text-[#86868b]">
                            Template akan tampil di sini setelah admin menerbitkannya.
                        </div>
                    )}
                </section>
            </main>
        </AppLayout>
    );
}

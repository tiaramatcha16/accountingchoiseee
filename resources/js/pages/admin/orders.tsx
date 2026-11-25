import { Head, Link, router, useForm } from '@inertiajs/react';
import { ExternalLink, FileSpreadsheet, Filter, Search, ShieldCheck } from 'lucide-react';
import { type FormEvent } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Buyer {
    name: string;
    email: string;
}

interface Item {
    id: number;
    product_title: string;
    unit_price: number;
    google_sheet_id?: string | null;
    delivery_url?: string | null;
    delivery_file_id?: string | null;
}

interface Order {
    id: number;
    order_number: string;
    status: 'pending' | 'paid' | 'cancelled';
    total_amount: number;
    created_at: string;
    payment_reference: string | null;
    payment_url: string | null;
    customer_name: string | null;
    customer_phone: string | null;
    customer_email: string | null;
    delivery_email_sent_at: string | null;
    buyer: Buyer;
    items: Item[];
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

const money = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);

export default function AdminOrders({
    orders,
    filters,
    status,
}: {
    orders: Paginated<Order>;
    filters: { q?: string; status?: string };
    status?: string;
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Pesanan', href: '/admin/orders' },
    ];
    const { data, setData } = useForm({ q: filters.q ?? '', status: filters.status ?? '' });

    function search(event: FormEvent) {
        event.preventDefault();
        router.get('/admin/orders', data, { preserveState: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Pesanan - AccountingChoice" />
            <main className="mx-auto w-full max-w-7xl space-y-6 p-5 sm:p-6 lg:p-8">
                {/* Header */}
                <header className="border-b border-black/[0.06] pb-6">
                    <span className="inline-flex items-center rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-700 uppercase">
                        Administrasi Transaksi
                    </span>
                    <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.035em] text-[#1d1d1f]">
                        Pesanan Pembeli
                    </h1>
                    <p className="mt-1 text-sm text-[#86868b]">
                        Pantau pembayaran Midtrans QRIS, duplikasi otomatis Google Sheets ke Drive pembeli, dan status pengiriman file.
                    </p>
                </header>

                {status && (
                    <div role="status" className="flex items-center gap-2 rounded-2xl border border-emerald-200/60 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{status}</span>
                    </div>
                )}

                {/* Filter Bar */}
                <form onSubmit={search} className="flex flex-wrap items-center gap-3 rounded-3xl border border-black/[0.06] bg-white p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                    <div className="relative min-w-64 flex-1">
                        <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#86868b]" />
                        <input
                            aria-label="Cari pesanan atau pembeli"
                            placeholder="Cari nomor pesanan, nama, email, nomor HP..."
                            className="w-full rounded-2xl border border-black/[0.08] bg-[#fbfbfd] py-2.5 pr-4 pl-10 text-xs text-[#1d1d1f] outline-none transition focus:border-neutral-300 focus:bg-white focus:ring-1 focus:ring-neutral-200 placeholder:text-[#86868b]"
                            value={data.q}
                            onChange={(event) => setData('q', event.target.value)}
                        />
                    </div>
                    <select
                        aria-label="Filter status"
                        className="rounded-2xl border border-black/[0.08] bg-[#fbfbfd] py-2.5 px-3.5 text-xs font-medium text-[#1d1d1f] outline-none transition focus:border-neutral-300"
                        value={data.status}
                        onChange={(event) => setData('status', event.target.value)}
                    >
                        <option value="">Semua Status</option>
                        <option value="pending">Menunggu Pembayaran</option>
                        <option value="paid">Lunas & Terverifikasi</option>
                        <option value="cancelled">Dibatalkan</option>
                    </select>
                    <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#333336] active:scale-95"
                    >
                        <Filter className="h-3.5 w-3.5" />
                        <span>Filter</span>
                    </button>
                </form>

                {/* Orders Table Card */}
                <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1050px] text-left text-xs">
                            <thead className="border-b border-black/[0.06] bg-[#f5f5f7]/60 text-[#86868b]">
                                <tr>
                                    <th className="py-3.5 px-5 font-semibold">Pesanan</th>
                                    <th className="py-3.5 px-5 font-semibold">Penerima</th>
                                    <th className="py-3.5 px-5 font-semibold">Item Template</th>
                                    <th className="py-3.5 px-5 font-semibold text-right">Total</th>
                                    <th className="py-3.5 px-5 font-semibold">Status Pembayaran</th>
                                    <th className="py-3.5 px-5 font-semibold">Google Drive Delivery</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/[0.04] text-[#1d1d1f]">
                                {orders.data.map((order) => (
                                    <tr key={order.id} className="align-top hover:bg-neutral-50/50 transition">
                                        <td className="py-4 px-5">
                                            <span className="font-mono font-semibold text-[#1d1d1f]">{order.order_number}</span>
                                            <p className="mt-1 text-[11px] text-[#86868b]">
                                                {new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                            </p>
                                        </td>
                                        <td className="py-4 px-5">
                                            <p className="font-semibold">{order.customer_name ?? order.buyer.name}</p>
                                            <p className="font-mono text-[#86868b]">{order.customer_email ?? order.buyer.email}</p>
                                            {order.customer_phone && <p className="text-[11px] text-[#86868b]">{order.customer_phone}</p>}
                                        </td>
                                        <td className="py-4 px-5">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="mb-2 last:mb-0">
                                                    <p className="font-medium text-[#1d1d1f]">{item.product_title}</p>
                                                    {item.delivery_url && (
                                                        <a
                                                            href={item.delivery_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900"
                                                        >
                                                            <FileSpreadsheet className="h-3 w-3" />
                                                            <span>Buka Salinan Google Sheets</span>
                                                            <ExternalLink className="h-2.5 w-2.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="py-4 px-5 text-right font-mono font-semibold text-sm">
                                            {money(order.total_amount)}
                                        </td>
                                        <td className="py-4 px-5">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                                    order.status === 'paid'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                                        : order.status === 'pending'
                                                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                                          : 'bg-neutral-100 text-[#86868b]'
                                                }`}
                                            >
                                                {order.status === 'paid'
                                                    ? 'Lunas'
                                                    : order.status === 'pending'
                                                      ? 'Menunggu QRIS'
                                                      : 'Dibatalkan'}
                                            </span>
                                            {order.payment_reference && (
                                                <p className="mt-1.5 font-mono text-[10px] text-[#86868b]">Ref: {order.payment_reference}</p>
                                            )}
                                            {order.status === 'pending' && (
                                                <button
                                                    type="button"
                                                    onClick={() => router.post(`/admin/orders/${order.id}/mark-paid`)}
                                                    className="mt-2 inline-block rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 transition hover:bg-emerald-100"
                                                >
                                                    Tandai Lunas
                                                </button>
                                            )}
                                            {order.status === 'pending' && order.payment_url && (
                                                <a
                                                    href={order.payment_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-1 block text-[11px] font-semibold text-[#1d1d1f] underline"
                                                >
                                                    Buka tautan pembayaran
                                                </a>
                                            )}
                                        </td>
                                        <td className="py-4 px-5">
                                            {order.delivery_email_sent_at ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                                    Tersalin & Terkirim
                                                </span>
                                            ) : order.status === 'paid' ? (
                                                <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                    Menunggu Proses Salin
                                                </span>
                                            ) : (
                                                <span className="text-[#86868b] text-[11px]">Menunggu pembayaran</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {orders.data.length === 0 && (
                        <p className="p-8 text-center text-xs text-[#86868b]">Belum ada pesanan yang sesuai filter.</p>
                    )}
                </div>

                {/* Pagination */}
                {orders.links.length > 3 && (
                    <nav className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                        {orders.links.map((link, index) =>
                            link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                        link.active
                                            ? 'bg-[#1d1d1f] text-white shadow-xs'
                                            : 'border border-black/[0.08] bg-white text-[#1d1d1f] hover:bg-neutral-50'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : null,
                        )}
                    </nav>
                )}
            </main>
        </AppLayout>
    );
}

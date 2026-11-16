import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock, Download, FileSpreadsheet, Package, ShieldCheck } from 'lucide-react';

import ProductGuideAssistant from '@/components/marketplace/ProductGuideAssistant';
import { Button } from '@/components/ui/button';
import StorefrontLayout from '@/layouts/storefront-layout';

interface Item {
    id: number;
    product_id: number;
    product_title: string;
    unit_price: number;
    delivery_type: 'file' | 'google_sheets';
    delivery_url: string | null;
    guide_available: boolean;
}

interface Order {
    id: number;
    order_number: string;
    status: 'pending' | 'paid' | 'cancelled';
    total_amount: number;
    created_at: string;
    customer_name: string | null;
    customer_phone: string | null;
    customer_email: string | null;
    payment_gateway: string | null;
    payment_url: string | null;
    delivery_email_sent_at: string | null;
    items: Item[];
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);

export default function BuyerOrders({ orders, status }: { orders: Paginated<Order>; status?: string }) {
    return (
        <StorefrontLayout>
            <Head title="Pesanan Saya - AccountingChoice" />

            <main className="mx-auto w-full max-w-5xl space-y-8 p-6 lg:p-10">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold tracking-widest text-emerald-700 uppercase">
                            Riwayat Pembelian
                        </span>
                        <h1 className="font-heading mt-2.5 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Pesanan Saya</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Pantau pembayaran, buka template, dan gunakan Panduan AI untuk setiap pesanan yang sudah lunas.
                        </p>
                    </div>

                    <Button asChild variant="outline" className="gap-2 rounded-xl border-gray-300 text-xs font-bold">
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Toko
                        </Link>
                    </Button>
                </div>

                {/* Status Message */}
                {status && (
                    <div
                        role="status"
                        className="animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 shadow-xs"
                    >
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                        <span>{status}</span>
                    </div>
                )}

                {/* Orders List */}
                {orders.data.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-xs">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                            <Package className="h-7 w-7" />
                        </div>
                        <h3 className="font-heading text-base font-bold text-gray-900">Belum ada pesanan</h3>
                        <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500">
                            Anda belum memiliki riwayat pembelian template. Silakan pilih spreadsheet dari katalog toko kami.
                        </p>
                        <Button asChild className="bg-brand-primary mt-5 rounded-xl text-xs font-bold text-white">
                            <Link href="/#template-list">Lihat Katalog Template</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.data.map((order) => (
                            <article
                                key={order.id}
                                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xs transition hover:border-gray-300"
                            >
                                {/* Order Card Header */}
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/50 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="text-brand-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-xs">
                                            <FileSpreadsheet className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">Nomor Pesanan</span>
                                                <span className="font-mono text-xs font-extrabold text-gray-900">{order.order_number}</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500">
                                                Dibuat pada{' '}
                                                {new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                                            </p>
                                            {order.customer_email && (
                                                <p className="mt-1 text-[11px] text-gray-500">Email penerima: {order.customer_email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        {order.status === 'paid' ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                                <ShieldCheck className="h-3.5 w-3.5" />
                                                Lunas & Siap Diunduh
                                            </span>
                                        ) : order.status === 'pending' ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                                                <Clock className="h-3.5 w-3.5" />
                                                {order.payment_gateway === 'offline'
                                                    ? 'Pesanan Uji Coba - Belum Dibayar'
                                                    : 'Menunggu Pembayaran QRIS'}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                                                Dibatalkan
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="divide-y divide-gray-100 p-5">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex flex-col justify-between gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                                        >
                                            <div>
                                                <h4 className="font-heading text-sm font-bold text-gray-900">{item.product_title}</h4>
                                                <p className="mt-0.5 text-xs text-gray-500">Harga satuan: {formatRupiah(item.unit_price)}</p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                                {order.status === 'paid' ? (
                                                    item.delivery_type === 'google_sheets' ? (
                                                        item.delivery_url ? (
                                                            <a
                                                                href={item.delivery_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="bg-brand-primary hover:bg-brand-primary-dark inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs transition"
                                                            >
                                                                <FileSpreadsheet className="h-3.5 w-3.5" />
                                                                Buka Salinan Google Sheets
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs font-medium text-amber-700">
                                                                Salinan Google Sheets sedang disiapkan
                                                            </span>
                                                        )
                                                    ) : (
                                                        <a
                                                            href={`/my-orders/${order.id}/items/${item.id}/download`}
                                                            className="bg-brand-primary hover:bg-brand-primary-dark inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs transition"
                                                        >
                                                            <Download className="h-3.5 w-3.5" />
                                                            Unduh Template Excel (.xlsx)
                                                        </a>
                                                    )
                                                ) : (
                                                    <span className="text-xs font-medium text-gray-400 italic">Tersedia setelah lunas</span>
                                                )}
                                                {order.status === 'paid' && (
                                                    <ProductGuideAssistant
                                                        orderId={order.id}
                                                        itemId={item.id}
                                                        productTitle={item.product_title}
                                                        guideAvailable={item.guide_available}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Footer & Payment Notice */}
                                <div className="border-t border-gray-100 bg-slate-50/70 p-5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-500">Total Pembayaran</span>
                                        <span className="font-heading text-brand-primary text-base font-extrabold">
                                            {formatRupiah(order.total_amount)}
                                        </span>
                                    </div>

                                    {order.status === 'pending' && order.payment_gateway === 'midtrans' && (
                                        <div className="mt-4 rounded-2xl border border-amber-300/40 bg-amber-50/80 p-4">
                                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                                <div>
                                                    <p className="text-xs font-bold text-amber-900">Selesaikan Pembayaran QRIS</p>
                                                    <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800/80">
                                                        Bayar melalui halaman Midtrans. Status akan diperbarui otomatis setelah pembayaran berhasil,
                                                        lalu file dikirim ke email penerima.
                                                    </p>
                                                </div>
                                                {order.payment_url ? (
                                                    <a
                                                        href={order.payment_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-brand-primary hover:bg-brand-primary-dark inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-xs transition"
                                                    >
                                                        Lanjutkan Pembayaran QRIS
                                                    </a>
                                                ) : (
                                                    <p className="text-xs font-medium text-amber-900">
                                                        Tautan pembayaran belum tersedia. Silakan buat pesanan baru dari keranjang.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {order.status === 'pending' && order.payment_gateway === 'offline' && (
                                        <p className="mt-4 rounded-2xl border border-amber-300/40 bg-amber-50/80 p-4 text-xs leading-5 text-amber-900">
                                            Pesanan ini hanya untuk uji coba database. Pembayaran belum dilakukan, jadi file belum dapat diunduh dan
                                            email belum dikirim.
                                        </p>
                                    )}

                                    {order.status === 'paid' && (
                                        <p className="mt-3 text-xs leading-5 text-emerald-800">
                                            {order.delivery_email_sent_at && order.customer_email
                                                ? `Informasi akses pesanan sudah dikirim ke ${order.customer_email}.`
                                                : 'Pembayaran berhasil. File dapat diunduh melalui tombol di atas.'}{' '}
                                            Periksa juga folder spam pada email.
                                        </p>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {orders.links.length > 3 && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                        {orders.links.map((link, idx) =>
                            link.url ? (
                                <Link
                                    key={idx}
                                    href={link.url}
                                    className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                        link.active
                                            ? 'bg-brand-primary text-white shadow-xs'
                                            : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={idx}
                                    className="rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-400 opacity-60"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ),
                        )}
                    </div>
                )}
            </main>
        </StorefrontLayout>
    );
}

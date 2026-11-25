import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock, Download, FileSpreadsheet, Loader2, Package, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';

import ProductGuideAssistant from '@/components/marketplace/ProductGuideAssistant';
import StorefrontLayout from '@/layouts/storefront-layout';

interface Item {
    id: number;
    product_id: number;
    product_title: string;
    unit_price: number;
    delivery_type: 'file' | 'google_sheets';
    delivery_url: string | null;
    recipient_email?: string | null;
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
    const hasPendingDeliveries = orders.data.some(
        (order) =>
            order.status === 'paid' &&
            order.items.some((item) => item.delivery_type === 'google_sheets' && !item.delivery_url),
    );

    useEffect(() => {
        if (!hasPendingDeliveries) return;

        const timer = setInterval(() => {
            router.reload({ only: ['orders'] });
        }, 3000);

        return () => clearInterval(timer);
    }, [hasPendingDeliveries]);

    return (
        <StorefrontLayout>
            <Head title="Pesanan Saya - AccountingChoice" />

            <main className="mx-auto w-full max-w-5xl space-y-8 px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-black/[0.06] pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <span className="inline-flex items-center rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-700 uppercase">
                            Riwayat Pembelian
                        </span>
                        <h1 className="mt-2.5 text-2xl font-semibold tracking-[-0.035em] text-[#1d1d1f] sm:text-3xl">Pesanan Saya</h1>
                        <p className="mt-1 text-sm text-[#86868b]">
                            Pantau pembayaran, buka template, dan gunakan Panduan AI untuk setiap pesanan yang sudah lunas.
                        </p>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-4 py-2 text-xs font-semibold text-[#1d1d1f] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:bg-neutral-50 active:scale-[0.98]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Toko
                    </Link>
                </div>

                {/* Status Message */}
                {status && (
                    <div
                        role="status"
                        className="animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-2xl border border-emerald-200/60 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
                    >
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                        <span>{status}</span>
                    </div>
                )}

                {/* Orders List */}
                {orders.data.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-black/[0.1] bg-white p-12 text-center">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-[#86868b]">
                            <Package className="h-7 w-7" />
                        </div>
                        <h3 className="text-base font-semibold text-[#1d1d1f]">Belum ada pesanan</h3>
                        <p className="mx-auto mt-1 max-w-sm text-xs text-[#86868b]">
                            Anda belum memiliki riwayat pembelian template. Silakan pilih spreadsheet dari katalog toko kami.
                        </p>
                        <Link
                            href="/#template-list"
                            className="mt-5 inline-flex items-center justify-center rounded-full bg-[#1d1d1f] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#333336] active:scale-[0.98]"
                        >
                            Lihat Katalog Template
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.data.map((order) => (
                            <article
                                key={order.id}
                                className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:border-black/[0.1]"
                            >
                                {/* Order Card Header */}
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] bg-[#f5f5f7]/50 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/[0.06] bg-white text-[#86868b] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                                            <FileSpreadsheet className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-semibold tracking-wider text-[#86868b] uppercase">Nomor Pesanan</span>
                                                <span className="font-mono text-xs font-semibold text-[#1d1d1f]">{order.order_number}</span>
                                            </div>
                                            <p className="text-[11px] text-[#86868b]">
                                                Dibuat pada{' '}
                                                {new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                                            </p>
                                            {order.customer_email && (
                                                <p className="mt-1 text-[11px] text-[#86868b]">Email penerima: {order.customer_email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        {order.status === 'paid' ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                <ShieldCheck className="h-3.5 w-3.5" />
                                                Lunas & Akses Siap
                                            </span>
                                        ) : order.status === 'pending' ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/60 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                                <Clock className="h-3.5 w-3.5" />
                                                {order.payment_gateway === 'offline'
                                                    ? 'Pesanan Uji Coba - Belum Dibayar'
                                                    : 'Menunggu Pembayaran QRIS'}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-neutral-100 px-3 py-1 text-xs font-semibold text-[#86868b]">
                                                Dibatalkan
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="divide-y divide-black/[0.04] p-5">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex flex-col justify-between gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                                        >
                                            <div>
                                                <h4 className="text-sm font-semibold text-[#1d1d1f]">{item.product_title}</h4>
                                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#86868b]">
                                                    <span>Harga satuan: {formatRupiah(item.unit_price)}</span>
                                                    {item.recipient_email && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-[#f5f5f7] px-2 py-0.5 font-medium text-[#1d1d1f]">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                                                            Akses akun: <strong className="font-mono">{item.recipient_email}</strong>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                                {order.status === 'paid' ? (
                                                    item.delivery_type === 'google_sheets' ? (
                                                        item.delivery_url ? (
                                                            <a
                                                                href={item.delivery_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#333336] active:scale-[0.98]"
                                                            >
                                                                <FileSpreadsheet className="h-3.5 w-3.5" />
                                                                Buka Salinan Google Sheets
                                                            </a>
                                                        ) : (
                                                            <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-200/60 bg-amber-50/80 px-3 py-1.5 text-xs font-semibold text-amber-900">
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" />
                                                                <span>Salinan Google Sheets sedang disiapkan...</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => router.reload({ only: ['orders'] })}
                                                                    className="ml-1 text-[11px] font-semibold text-[#1d1d1f] underline hover:text-neutral-600"
                                                                >
                                                                    Cek
                                                                </button>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <a
                                                            href={`/my-orders/${order.id}/items/${item.id}/download`}
                                                            className="inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#333336] active:scale-[0.98]"
                                                        >
                                                            <Download className="h-3.5 w-3.5" />
                                                            Unduh Template Excel (.xlsx)
                                                        </a>
                                                    )
                                                ) : (
                                                    <span className="text-xs font-medium text-[#86868b] italic">Tersedia setelah lunas</span>
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
                                <div className="border-t border-black/[0.06] bg-[#f5f5f7]/50 p-5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-[#86868b]">Total Pembayaran</span>
                                        <span className="text-base font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                                            {formatRupiah(order.total_amount)}
                                        </span>
                                    </div>

                                    {order.status === 'pending' && order.payment_gateway === 'midtrans' && (
                                        <div className="mt-4 rounded-2xl border border-amber-200/60 bg-amber-50/80 p-4">
                                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                                <div>
                                                    <p className="text-xs font-semibold text-amber-900">Selesaikan Pembayaran QRIS</p>
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
                                                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#333336] active:scale-[0.98]"
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
                                        <p className="mt-4 rounded-2xl border border-amber-200/60 bg-amber-50/80 p-4 text-xs leading-5 text-amber-900">
                                            Pesanan ini hanya untuk uji coba database. Pembayaran belum dilakukan, jadi file belum dapat diunduh dan
                                            email belum dikirim.
                                        </p>
                                    )}

                                    {order.status === 'paid' && (
                                        <p className="mt-3 text-xs leading-5 text-emerald-700">
                                            {order.delivery_email_sent_at && order.customer_email
                                                ? `Informasi tautan akses pesanan sudah dikirim ke ${order.customer_email}.`
                                                : 'Pembayaran berhasil. Tautan salinan Google Sheets unik Anda dapat langsung dibuka melalui tombol di atas.'}
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
                                    className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                                        link.active
                                            ? 'bg-[#1d1d1f] text-white shadow-sm'
                                            : 'border border-black/[0.06] bg-white text-[#1d1d1f] hover:bg-neutral-50'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={idx}
                                    className="rounded-full px-3.5 py-2 text-xs font-semibold text-[#86868b] opacity-60"
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

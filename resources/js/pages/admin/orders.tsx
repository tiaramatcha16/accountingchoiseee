import { Head, Link, router, useForm } from '@inertiajs/react';
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
            <Head title="Kelola Pesanan" />
            <main className="mx-auto w-full max-w-7xl space-y-6 p-6 lg:p-10">
                <header>
                    <p className="text-sm font-semibold tracking-widest text-emerald-700 uppercase">Administrasi</p>
                    <h1 className="mt-2 text-3xl font-bold">Pesanan pembeli</h1>
                    <p className="mt-2 text-gray-600">Status pembayaran diperbarui oleh notifikasi gateway setelah pembayaran terverifikasi.</p>
                </header>

                {status && (
                    <div role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-900">
                        {status}
                    </div>
                )}

                <form onSubmit={search} className="flex flex-wrap gap-3 rounded-xl border bg-white p-4">
                    <input
                        aria-label="Cari pesanan atau pembeli"
                        placeholder="Nomor pesanan, nama, email, atau nomor HP"
                        className="min-w-60 flex-1 rounded-lg border-gray-300"
                        value={data.q}
                        onChange={(event) => setData('q', event.target.value)}
                    />
                    <select
                        aria-label="Filter status"
                        className="rounded-lg border-gray-300"
                        value={data.status}
                        onChange={(event) => setData('status', event.target.value)}
                    >
                        <option value="">Semua status</option>
                        <option value="pending">Menunggu pembayaran</option>
                        <option value="paid">Lunas</option>
                        <option value="cancelled">Dibatalkan</option>
                    </select>
                    <button className="rounded-lg bg-emerald-700 px-5 py-2 font-semibold text-white">Filter</button>
                </form>

                <div className="overflow-x-auto rounded-2xl border bg-white">
                    <table className="w-full min-w-[1050px] text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="p-4">Pesanan</th>
                                <th className="p-4">Penerima</th>
                                <th className="p-4">Item</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Pembayaran</th>
                                <th className="p-4">Pengiriman akses</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.data.map((order) => (
                                <tr key={order.id} className="align-top">
                                    <td className="p-4">
                                        <strong>{order.order_number}</strong>
                                        <p className="mt-1 text-xs text-gray-500">{new Date(order.created_at).toLocaleString('id-ID')}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-semibold">{order.customer_name ?? order.buyer.name}</p>
                                        <p className="text-gray-600">{order.customer_email ?? order.buyer.email}</p>
                                        {order.customer_phone && <p className="text-gray-500">{order.customer_phone}</p>}
                                    </td>
                                    <td className="p-4">
                                        {order.items.map((item) => (
                                            <p key={item.id}>{item.product_title}</p>
                                        ))}
                                    </td>
                                    <td className="p-4 font-semibold">{money(order.total_amount)}</td>
                                    <td className="p-4">
                                        <span className="rounded-full bg-gray-100 px-3 py-1">
                                            {order.status === 'paid'
                                                ? 'Lunas'
                                                : order.status === 'pending'
                                                  ? 'Menunggu pembayaran QRIS'
                                                  : 'Dibatalkan'}
                                        </span>
                                        {order.payment_reference && (
                                            <p className="mt-2 text-xs text-gray-500">ID transaksi: {order.payment_reference}</p>
                                        )}
                                        {order.status === 'pending' && (
                                            <button
                                                type="button"
                                                onClick={() => router.post(`/admin/orders/${order.id}/mark-paid`)}
                                                className="mt-2 block rounded-lg border border-emerald-600 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                                            >
                                                Tandai Lunas
                                            </button>
                                        )}
                                        {order.status === 'pending' && order.payment_url && (
                                            <a
                                                href={order.payment_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 block text-xs font-semibold text-emerald-700 underline"
                                            >
                                                Buka pembayaran
                                            </a>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {order.delivery_email_sent_at ? (
                                            <span className="font-semibold text-emerald-700">Akses dikirim</span>
                                        ) : order.status === 'paid' ? (
                                            <span className="text-amber-700">Belum terkirim</span>
                                        ) : (
                                            <span className="text-gray-500">Menunggu pembayaran</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.data.length === 0 && <p className="p-8 text-center text-gray-500">Belum ada pesanan.</p>}
                </div>

                <nav className="flex gap-2">
                    {orders.links.map((link, index) =>
                        link.url ? (
                            <Link
                                key={index}
                                href={link.url}
                                className={`rounded border px-3 py-2 text-sm ${link.active ? 'bg-emerald-700 text-white' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : null,
                    )}
                </nav>
            </main>
        </AppLayout>
    );
}

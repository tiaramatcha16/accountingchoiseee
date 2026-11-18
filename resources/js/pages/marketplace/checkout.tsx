import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CreditCard, Mail, Phone, User } from 'lucide-react';
import { type FormEvent } from 'react';

import StorefrontLayout from '@/layouts/storefront-layout';

interface CheckoutItem {
    id: number;
    title: string;
    category: string;
    price: number;
}

interface CheckoutProps {
    items: CheckoutItem[];
    total: number;
    offlineCheckout: boolean;
    directSuccess?: boolean;
    customer: {
        name: string;
        phone: string | null;
        email: string;
    };
}

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);

export default function CheckoutPage({ items, total, offlineCheckout, directSuccess, customer }: CheckoutProps) {
    const form = useForm({
        customer_name: customer.name ?? '',
        customer_phone: customer.phone ?? '',
        customer_email: customer.email ?? '',
        payment: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(route('checkout.store'));
    };

    return (
        <StorefrontLayout>
            <Head title="Checkout - AccountingChoice" />

            <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <Link href="/" className="text-brand-primary inline-flex items-center gap-2 text-sm font-semibold hover:underline">
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke toko
                </Link>

                <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                        <div className="mb-7">
                            <span className="text-brand-primary text-xs font-bold tracking-widest uppercase">
                                {directSuccess ? 'Mode Uji Coba Langsung Sukses' : offlineCheckout ? 'Mode uji coba' : 'Satu langkah lagi'}
                            </span>
                            <h1 className="font-heading mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">Data penerima template</h1>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                {directSuccess
                                    ? 'Isi data penerima. Pembayaran langsung otomatis diverifikasi sukses dan Google Drive API langsung membuat salinan file spreadsheet khusus untuk email Anda.'
                                    : offlineCheckout
                                      ? 'Isi data untuk menyimpan pesanan uji coba. Belum ada pembayaran atau pengiriman file.'
                                      : 'Isi data yang benar. Akses salinan spreadsheet akan dikirim ke email dan tersedia di Pesanan Saya setelah pembayaran berhasil.'}
                            </p>
                        </div>

                        {form.errors.payment && (
                            <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                                {form.errors.payment}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label htmlFor="customer_name" className="mb-2 block text-sm font-semibold text-slate-800">
                                    Nama lengkap
                                </label>
                                <div className="relative">
                                    <User className="absolute top-3.5 left-3.5 h-4 w-4 text-slate-400" />
                                    <input
                                        id="customer_name"
                                        name="customer_name"
                                        autoComplete="name"
                                        required
                                        maxLength={150}
                                        value={form.data.customer_name}
                                        onChange={(event) => form.setData('customer_name', event.target.value)}
                                        className="w-full rounded-xl border border-slate-300 py-3 pr-4 pl-10 text-sm transition outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                        placeholder="Nama penerima"
                                    />
                                </div>
                                {form.errors.customer_name && <p className="mt-1.5 text-xs text-red-600">{form.errors.customer_name}</p>}
                            </div>

                            <div>
                                <label htmlFor="customer_phone" className="mb-2 block text-sm font-semibold text-slate-800">
                                    Nomor HP aktif
                                </label>
                                <div className="relative">
                                    <Phone className="absolute top-3.5 left-3.5 h-4 w-4 text-slate-400" />
                                    <input
                                        id="customer_phone"
                                        name="customer_phone"
                                        type="tel"
                                        autoComplete="tel"
                                        required
                                        maxLength={30}
                                        value={form.data.customer_phone}
                                        onChange={(event) => form.setData('customer_phone', event.target.value)}
                                        className="w-full rounded-xl border border-slate-300 py-3 pr-4 pl-10 text-sm transition outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </div>
                                {form.errors.customer_phone && <p className="mt-1.5 text-xs text-red-600">{form.errors.customer_phone}</p>}
                            </div>

                            <div>
                                <label htmlFor="customer_email" className="mb-2 block text-sm font-semibold text-slate-800">
                                    Email aktif untuk menerima file
                                </label>
                                <div className="relative">
                                    <Mail className="absolute top-3.5 left-3.5 h-4 w-4 text-slate-400" />
                                    <input
                                        id="customer_email"
                                        name="customer_email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        maxLength={255}
                                        value={form.data.customer_email}
                                        onChange={(event) => form.setData('customer_email', event.target.value)}
                                        className="w-full rounded-xl border border-slate-300 py-3 pr-4 pl-10 text-sm transition outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                        placeholder="nama@email.com"
                                    />
                                </div>
                                {form.errors.customer_email && <p className="mt-1.5 text-xs text-red-600">{form.errors.customer_email}</p>}
                                <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                                    {offlineCheckout
                                        ? 'Email ini disimpan bersama pesanan uji coba. File belum dikirim sampai pembayaran dan layanan email diaktifkan.'
                                        : 'Pastikan email benar dan aktif. Tautan salinan Google Sheets atau file Excel akan dikirim ke email ini setelah pembayaran berhasil. Aksesnya juga tersedia di Pesanan Saya.'}
                                </p>
                            </div>

                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                <div className="flex items-start gap-3">
                                    <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-900">
                                            {directSuccess
                                                ? 'Simulasi Pembayaran Langsung Sukses'
                                                : offlineCheckout
                                                  ? 'Pesanan uji coba tanpa pembayaran'
                                                  : 'Pembayaran QRIS melalui Midtrans'}
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-emerald-800">
                                            {directSuccess
                                                ? 'Pembayaran akan langsung diverifikasi lunas. Google Drive API akan otomatis menduplikasi spreadsheet baru khusus untuk email Anda.'
                                                : offlineCheckout
                                                  ? 'Pesanan akan tersimpan dengan status menunggu pembayaran. Tidak ada pembayaran yang diproses.'
                                                  : 'Kamu akan diarahkan ke halaman pembayaran aman Midtrans. Status pesanan diperbarui otomatis setelah pembayaran terkonfirmasi.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="bg-brand-primary hover:bg-brand-primary-dark flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {form.processing
                                    ? 'Memproses pesanan & duplikasi file...'
                                    : directSuccess
                                      ? 'Selesaikan & Buat Salinan Google Sheets'
                                      : offlineCheckout
                                        ? 'Simpan pesanan uji coba'
                                        : 'Lanjutkan ke pembayaran QRIS'}
                                {!form.processing && <ArrowRight className="h-4 w-4" />}
                            </button>
                        </form>
                    </section>

                    <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-7">
                        <h2 className="font-heading text-lg font-bold text-slate-900">Ringkasan pesanan</h2>
                        <div className="mt-5 divide-y divide-slate-200">
                            {items.map((item) => (
                                <div key={item.id} className="flex justify-between gap-4 py-4 first:pt-0">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                        <p className="mt-1 text-xs text-slate-500">{item.category}</p>
                                    </div>
                                    <p className="shrink-0 text-sm font-bold text-slate-800">{formatRupiah(item.price)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 flex items-center justify-between border-t border-slate-300 pt-5">
                            <span className="text-sm font-semibold text-slate-600">Total</span>
                            <span className="font-heading text-xl font-extrabold text-slate-900">{formatRupiah(total)}</span>
                        </div>
                    </aside>
                </div>
            </main>
        </StorefrontLayout>
    );
}

import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CreditCard, Mail, Phone, User } from 'lucide-react';
import { type FormEvent } from 'react';

import StorefrontLayout from '@/layouts/storefront-layout';

interface CheckoutItem {
    cart_key: string;
    id: number;
    unit_number: number;
    total_units: number;
    title: string;
    category: string;
    price: number;
    is_google_sheet?: boolean;
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
    const initialItemEmails: Record<number, Record<number, string>> = {};
    items.forEach((item) => {
        if (!initialItemEmails[item.id]) {
            initialItemEmails[item.id] = {};
        }
        initialItemEmails[item.id][item.unit_number] = customer.email ?? '';
    });

    const form = useForm({
        customer_name: customer.name ?? '',
        customer_phone: customer.phone ?? '',
        customer_email: customer.email ?? '',
        item_emails: initialItemEmails,
        payment: '',
    });

    const setAllItemEmailsToCustomerEmail = () => {
        const updated: Record<number, Record<number, string>> = {};
        items.forEach((item) => {
            if (!updated[item.id]) {
                updated[item.id] = {};
            }
            updated[item.id][item.unit_number] = form.data.customer_email;
        });
        form.setData('item_emails', updated);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(route('checkout.store'));
    };

    return (
        <StorefrontLayout>
            <Head title="Checkout - AccountingChoice" />

            <main className="mx-auto w-full max-w-6xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#86868b] transition hover:text-[#1d1d1f]">
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke toko
                </Link>

                <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="rounded-3xl border border-black/[0.06] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:p-8">
                        <div className="mb-7">
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                                {directSuccess ? 'Mode Uji Coba Langsung Sukses' : offlineCheckout ? 'Mode uji coba' : 'Satu langkah lagi'}
                            </span>
                            <h1 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#1d1d1f] sm:text-3xl">Data penerima template</h1>
                            <p className="mt-2 text-sm leading-6 text-[#86868b]">
                                {directSuccess
                                    ? 'Isi data penerima. Pembayaran langsung otomatis diverifikasi sukses dan Google Drive API langsung membuat salinan file spreadsheet khusus untuk email Anda.'
                                    : offlineCheckout
                                      ? 'Isi data untuk menyimpan pesanan uji coba. Belum ada pembayaran atau pengiriman file.'
                                      : 'Isi data yang benar. Akses salinan spreadsheet akan dikirim ke email dan tersedia di Pesanan Saya setelah pembayaran berhasil.'}
                            </p>
                        </div>

                        {form.errors.payment && (
                            <div role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                                {form.errors.payment}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label htmlFor="customer_name" className="mb-2 block text-sm font-semibold text-[#1d1d1f]">
                                    Nama lengkap
                                </label>
                                <div className="relative">
                                    <User className="absolute top-3.5 left-3.5 h-4 w-4 text-[#86868b]" />
                                    <input
                                        id="customer_name"
                                        name="customer_name"
                                        autoComplete="name"
                                        required
                                        maxLength={150}
                                        value={form.data.customer_name}
                                        onChange={(event) => form.setData('customer_name', event.target.value)}
                                        className="w-full rounded-2xl border border-black/[0.08] bg-[#fbfbfd] py-3 pr-4 pl-10 text-sm text-[#1d1d1f] transition outline-none focus:border-neutral-300 focus:bg-white focus:ring-2 focus:ring-neutral-200 placeholder:text-[#86868b]"
                                        placeholder="Nama penerima"
                                    />
                                </div>
                                {form.errors.customer_name && <p className="mt-1.5 text-xs text-red-600">{form.errors.customer_name}</p>}
                            </div>

                            <div>
                                <label htmlFor="customer_phone" className="mb-2 block text-sm font-semibold text-[#1d1d1f]">
                                    Nomor HP aktif
                                </label>
                                <div className="relative">
                                    <Phone className="absolute top-3.5 left-3.5 h-4 w-4 text-[#86868b]" />
                                    <input
                                        id="customer_phone"
                                        name="customer_phone"
                                        type="tel"
                                        autoComplete="tel"
                                        required
                                        maxLength={30}
                                        value={form.data.customer_phone}
                                        onChange={(event) => form.setData('customer_phone', event.target.value)}
                                        className="w-full rounded-2xl border border-black/[0.08] bg-[#fbfbfd] py-3 pr-4 pl-10 text-sm text-[#1d1d1f] transition outline-none focus:border-neutral-300 focus:bg-white focus:ring-2 focus:ring-neutral-200 placeholder:text-[#86868b]"
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </div>
                                {form.errors.customer_phone && <p className="mt-1.5 text-xs text-red-600">{form.errors.customer_phone}</p>}
                            </div>

                            <div>
                                <label htmlFor="customer_email" className="mb-2 block text-sm font-semibold text-[#1d1d1f]">
                                    Email utama pemesan (Notifikasi & Bukti Pembayaran)
                                </label>
                                <div className="relative">
                                    <Mail className="absolute top-3.5 left-3.5 h-4 w-4 text-[#86868b]" />
                                    <input
                                        id="customer_email"
                                        name="customer_email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        maxLength={255}
                                        value={form.data.customer_email}
                                        onChange={(event) => form.setData('customer_email', event.target.value)}
                                        className="w-full rounded-2xl border border-black/[0.08] bg-[#fbfbfd] py-3 pr-4 pl-10 text-sm text-[#1d1d1f] transition outline-none focus:border-neutral-300 focus:bg-white focus:ring-2 focus:ring-neutral-200 placeholder:text-[#86868b]"
                                        placeholder="nama@email.com"
                                    />
                                </div>
                                {form.errors.customer_email && <p className="mt-1.5 text-xs text-red-600">{form.errors.customer_email}</p>}
                            </div>

                            {/* Kolom Khusus Email Penerima per Unit Template */}
                            <div className="space-y-4 pt-1">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] pb-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-[#1d1d1f]">Alamat Email Akun Google per Unit / Kuantitas Template</h3>
                                        <p className="mt-0.5 text-xs text-[#86868b]">
                                            Setiap unit pembelian memiliki kolom input email tersendiri. Anda dapat menggunakan email yang sama atau
                                            berbeda untuk setiap unit.
                                        </p>
                                    </div>
                                    {items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={setAllItemEmailsToCustomerEmail}
                                            className="rounded-full border border-black/[0.08] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1d1d1f] shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition hover:bg-neutral-50 active:scale-[0.98]"
                                        >
                                            Samakan semua dengan email pemesan
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {items.map((item, index) => {
                                        const errorKey = `item_emails.${item.id}.${item.unit_number}`;
                                        const errorMessage = form.errors[errorKey as keyof typeof form.errors];

                                        return (
                                            <div
                                                key={item.cart_key}
                                                className="rounded-2xl border border-black/[0.06] bg-[#f5f5f7]/60 p-4 transition focus-within:border-neutral-300 focus-within:bg-white focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                                            >
                                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1d1d1f] text-[11px] font-semibold text-white">
                                                            {index + 1}
                                                        </span>
                                                        <span className="text-sm font-semibold text-[#1d1d1f]">
                                                            {item.title}{' '}
                                                            {item.total_units > 1 &&
                                                                `(Lisensi / Akses #${item.unit_number} dari ${item.total_units})`}
                                                        </span>
                                                    </div>
                                                    <span className="rounded-full border border-black/[0.06] bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#86868b]">
                                                        {item.is_google_sheet ? 'Akses Google Sheets' : 'File Excel'}
                                                    </span>
                                                </div>

                                                <label
                                                    htmlFor={`item_email_${item.id}_${item.unit_number}`}
                                                    className="mb-1.5 block text-xs font-medium text-[#86868b]"
                                                >
                                                    {item.is_google_sheet
                                                        ? `Akun Gmail penerima untuk "${item.title}" #${item.unit_number}:`
                                                        : `Email tujuan pengiriman untuk "${item.title}" #${item.unit_number}:`}
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute top-3 left-3 h-4 w-4 text-[#86868b]" />
                                                    <input
                                                        id={`item_email_${item.id}_${item.unit_number}`}
                                                        type="email"
                                                        required
                                                        value={form.data.item_emails[item.id]?.[item.unit_number] ?? ''}
                                                        onChange={(event) => {
                                                            const currentProductEmails = form.data.item_emails[item.id] || {};
                                                            form.setData('item_emails', {
                                                                ...form.data.item_emails,
                                                                [item.id]: {
                                                                    ...currentProductEmails,
                                                                    [item.unit_number]: event.target.value,
                                                                },
                                                            });
                                                        }}
                                                        className="w-full rounded-2xl border border-black/[0.08] bg-white py-2.5 pr-4 pl-9 text-sm text-[#1d1d1f] transition outline-none focus:border-neutral-300 focus:ring-1 focus:ring-neutral-300 placeholder:text-[#86868b]"
                                                        placeholder="nama.akun@gmail.com"
                                                    />
                                                </div>
                                                {errorMessage && <p className="mt-1 text-xs text-red-600">{errorMessage}</p>}
                                            </div>
                                        );
                                    })}
                                </div>

                                <p className="rounded-2xl border border-amber-200/60 bg-amber-50/80 p-3 text-xs leading-5 text-amber-900">
                                    Pastikan email yang Anda masukkan aktif. Hak akses edit untuk setiap Google Sheets akan dikunci khusus ke akun
                                    Gmail masing-masing unit di atas setelah pesanan lunas.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-black/[0.06] bg-[#f5f5f7]/60 p-4">
                                <div className="flex items-start gap-3">
                                    <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-[#86868b]" />
                                    <div>
                                        <p className="text-sm font-semibold text-[#1d1d1f]">
                                            {directSuccess
                                                ? 'Simulasi Pembayaran Langsung Sukses'
                                                : offlineCheckout
                                                  ? 'Pesanan uji coba tanpa pembayaran'
                                                  : 'Pembayaran QRIS melalui Midtrans'}
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-[#86868b]">
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
                                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#333336] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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

                    <aside className="rounded-3xl border border-black/[0.06] bg-[#f5f5f7]/60 p-5 sm:p-7">
                        <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#1d1d1f]">Ringkasan pesanan</h2>
                        <div className="mt-5 divide-y divide-black/[0.06]">
                            {items.map((item) => (
                                <div key={item.cart_key} className="flex justify-between gap-4 py-4 first:pt-0">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-[#1d1d1f]">
                                            {item.title} {item.total_units > 1 && `(#${item.unit_number})`}
                                        </p>
                                        <p className="mt-1 text-xs text-[#86868b]">{item.category}</p>
                                    </div>
                                    <p className="shrink-0 text-sm font-semibold text-[#1d1d1f]">{formatRupiah(item.price)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 flex items-center justify-between border-t border-black/[0.08] pt-5">
                            <span className="text-sm font-medium text-[#86868b]">Total</span>
                            <span className="text-xl font-semibold tracking-[-0.02em] text-[#1d1d1f]">{formatRupiah(total)}</span>
                        </div>
                    </aside>
                </div>
            </main>
        </StorefrontLayout>
    );
}

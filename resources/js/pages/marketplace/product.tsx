import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, FileSpreadsheet, LockKeyhole, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

import { useCart } from '@/hooks/use-cart';
import StorefrontLayout from '@/layouts/storefront-layout';

interface Product {
    id: number;
    title: string;
    slug: string;
    category: string;
    description: string;
    price: number;
}

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);

export default function ProductDetailPage({ product }: { product: Product }) {
    return (
        <StorefrontLayout>
            <ProductDetailContent product={product} />
        </StorefrontLayout>
    );
}

function ProductDetailContent({ product }: { product: Product }) {
    const { addToCart, isInCart, setIsCartOpen } = useCart();
    const [qty, setQty] = useState(1);
    const inCart = isInCart(product.id);

    return (
        <>
            <Head title={`${product.title} - AccountingChoice`} />
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Link href="/" className="hover:text-brand-primary">
                        Beranda
                    </Link>
                    <span aria-hidden="true">/</span>
                    <Link href="/templates" className="hover:text-brand-primary">
                        Katalog
                    </Link>
                    <span aria-hidden="true">/</span>
                    <span className="max-w-[45vw] truncate text-slate-800">{product.title}</span>
                </nav>

                <section className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
                    <div className="from-brand-deep via-brand-primary to-brand-deeper relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br p-6 sm:min-h-[440px] sm:p-10">
                        <div aria-hidden="true" className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-emerald-400/20 blur-[80px]" />
                        <div className="relative w-full max-w-md rounded-2xl border border-white/80 bg-white p-4 shadow-2xl sm:p-6">
                            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-brand-excel flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                                        <FileSpreadsheet className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">Pratinjau template</p>
                                        <p className="font-mono text-xs font-bold text-slate-700">Lembar Kerja</p>
                                    </div>
                                </div>
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">Excel</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                                {Array.from({ length: 40 }, (_, index) => (
                                    <span
                                        key={index}
                                        className={`h-7 rounded-sm border ${
                                            index < 4
                                                ? 'border-emerald-200 bg-emerald-100'
                                                : index % 4 === 0
                                                  ? 'border-slate-100 bg-slate-50'
                                                  : 'border-slate-100 bg-white'
                                        }`}
                                    />
                                ))}
                            </div>
                            <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
                                <span className="text-xs font-bold text-emerald-900">Ringkasan Otomatis</span>
                                <Check className="h-4 w-4 text-emerald-700" />
                            </div>
                        </div>
                        <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                            <LockKeyhole className="h-3.5 w-3.5" />
                            File digital
                        </span>
                    </div>

                    <div className="pt-1 lg:pt-5">
                        <span className="bg-brand-primary/8 text-brand-primary inline-flex rounded-full px-3 py-1 text-xs font-bold">
                            {product.category}
                        </span>
                        <h1 className="font-heading text-brand-ink mt-4 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
                            {product.title}
                        </h1>
                        <div className="mt-5 border-y border-black/[0.08] py-5">
                            <p className="text-xs font-bold tracking-wide text-black/45 uppercase">Harga</p>
                            <p className="font-heading text-brand-primary mt-1 text-3xl font-extrabold">{formatRupiah(product.price)}</p>
                        </div>

                        <div className="mt-5">
                            <h2 className="font-heading text-base font-bold text-slate-900">Tentang template ini</h2>
                            <p className="mt-2 text-sm leading-7 whitespace-pre-line text-slate-600">{product.description}</p>
                        </div>

                        <ul className="mt-5 space-y-3 text-sm text-slate-600">
                            <li className="flex items-start gap-2.5">
                                <Check className="text-brand-primary mt-0.5 h-4 w-4 shrink-0" />
                                Produk berupa file spreadsheet digital, bukan barang fisik.
                            </li>
                            <li className="flex items-start gap-2.5">
                                <Check className="text-brand-primary mt-0.5 h-4 w-4 shrink-0" />
                                Akses salinan spreadsheet tersedia di Pesanan Saya setelah pembayaran terverifikasi. Informasinya juga dikirim ke email aktif.
                            </li>
                        </ul>

                        <div className="mt-7 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <label className="text-xs font-semibold text-slate-700">Jumlah Template:</label>
                                <div className="inline-flex items-center rounded-xl border border-slate-300 bg-white p-1 shadow-2xs">
                                    <button
                                        type="button"
                                        onClick={() => setQty(Math.max(1, qty - 1))}
                                        disabled={qty <= 1}
                                        aria-label="Kurangi jumlah"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-10 text-center text-sm font-bold text-slate-900">{qty}</span>
                                    <button
                                        type="button"
                                        onClick={() => setQty(Math.min(50, qty + 1))}
                                        aria-label="Tambah jumlah"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <span className="text-xs text-slate-500">
                                    Total: <strong className="text-slate-800">{formatRupiah(product.price * qty)}</strong>
                                </span>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => {
                                        addToCart({ id: product.id, title: product.title }, qty);
                                    }}
                                    className="bg-brand-primary shadow-brand-primary/15 hover:bg-brand-primary-dark inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-md transition"
                                >
                                    <ShoppingBag className="h-4 w-4" />
                                    {inCart ? `Tambah ${qty} Lagi ke Keranjang` : `Tambah ke Keranjang (${qty})`}
                                </button>
                                {inCart && (
                                    <button
                                        type="button"
                                        onClick={() => setIsCartOpen(true)}
                                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-emerald-600 px-5 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition"
                                    >
                                        Lihat Keranjang
                                    </button>
                                )}
                                <Link
                                    href="/templates"
                                    className="hover:border-brand-primary/30 hover:text-brand-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-slate-700 transition"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Kembali ke Katalog
                                </Link>
                            </div>
                        </div>

                        <Link
                            href="/my-orders"
                            className="text-brand-primary mt-5 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                        >
                            Sudah membeli? Lihat Pesanan Saya
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}

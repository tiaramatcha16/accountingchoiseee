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
            <main className="mx-auto w-full max-w-7xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
                <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-xs font-medium text-[#86868b]">
                    <Link href="/" className="transition hover:text-[#1d1d1f]">
                        Beranda
                    </Link>
                    <span aria-hidden="true">/</span>
                    <Link href="/templates" className="transition hover:text-[#1d1d1f]">
                        Katalog
                    </Link>
                    <span aria-hidden="true">/</span>
                    <span className="max-w-[45vw] truncate text-[#1d1d1f]">{product.title}</span>
                </nav>

                <section className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
                    {/* Apple-style Preview Card */}
                    <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-3xl border border-black/[0.06] bg-[#f5f5f7] p-6 sm:min-h-[440px] sm:p-10">
                        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-emerald-100/30 blur-[80px]" />
                        <div className="relative w-full max-w-md rounded-2xl border border-black/[0.08] bg-white p-4 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.08)] sm:p-6">
                            <div className="mb-4 flex items-center justify-between border-b border-black/[0.05] pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                        <FileSpreadsheet className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-[10px] font-semibold tracking-wide text-[#86868b] uppercase">Pratinjau template</p>
                                        <p className="font-mono text-xs font-semibold text-[#1d1d1f]">Lembar Kerja</p>
                                    </div>
                                </div>
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700 border border-emerald-200/60">Excel</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                                {Array.from({ length: 40 }, (_, index) => (
                                    <span
                                        key={index}
                                        className={`h-7 rounded-sm border ${
                                            index < 4
                                                ? 'border-emerald-200/60 bg-emerald-50'
                                                : index % 4 === 0
                                                  ? 'border-black/[0.04] bg-[#f5f5f7]'
                                                  : 'border-black/[0.04] bg-white'
                                        }`}
                                    />
                                ))}
                            </div>
                            <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#f5f5f7] px-4 py-3 border border-black/[0.04]">
                                <span className="text-xs font-semibold text-[#1d1d1f]">Ringkasan Otomatis</span>
                                <Check className="h-4 w-4 text-emerald-600" />
                            </div>
                        </div>
                        <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#86868b] backdrop-blur-md">
                            <LockKeyhole className="h-3.5 w-3.5" />
                            File digital
                        </span>
                    </div>

                    {/* Product Info */}
                    <div className="pt-1 lg:pt-5">
                        <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                            {product.category}
                        </span>
                        <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-[-0.035em] text-[#1d1d1f] sm:text-4xl">
                            {product.title}
                        </h1>
                        <div className="mt-5 border-y border-black/[0.06] py-5">
                            <p className="text-xs font-semibold tracking-wide text-[#86868b] uppercase">Harga</p>
                            <p className="mt-1 text-3xl font-semibold tracking-[-0.02em] text-[#1d1d1f]">{formatRupiah(product.price)}</p>
                        </div>

                        <div className="mt-5">
                            <h2 className="text-base font-semibold text-[#1d1d1f]">Tentang template ini</h2>
                            <p className="mt-2 text-sm leading-7 whitespace-pre-line text-[#86868b]">{product.description}</p>
                        </div>

                        <ul className="mt-5 space-y-3 text-sm text-[#86868b]">
                            <li className="flex items-start gap-2.5">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                Produk berupa file spreadsheet digital, bukan barang fisik.
                            </li>
                            <li className="flex items-start gap-2.5">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                Akses salinan spreadsheet tersedia di Pesanan Saya setelah pembayaran terverifikasi. Informasinya juga dikirim ke
                                email aktif.
                            </li>
                        </ul>

                        <div className="mt-7 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <label className="text-xs font-semibold text-[#1d1d1f]">Jumlah Template:</label>
                                <div className="inline-flex items-center rounded-full border border-black/[0.08] bg-[#f5f5f7] p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setQty(Math.max(1, qty - 1))}
                                        disabled={qty <= 1}
                                        aria-label="Kurangi jumlah"
                                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#86868b] transition hover:bg-white hover:text-[#1d1d1f] hover:shadow-xs disabled:opacity-40"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-10 text-center text-sm font-semibold text-[#1d1d1f]">{qty}</span>
                                    <button
                                        type="button"
                                        onClick={() => setQty(Math.min(50, qty + 1))}
                                        aria-label="Tambah jumlah"
                                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#86868b] transition hover:bg-white hover:text-[#1d1d1f] hover:shadow-xs"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <span className="text-xs text-[#86868b]">
                                    Total: <strong className="text-[#1d1d1f]">{formatRupiah(product.price * qty)}</strong>
                                </span>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => {
                                        addToCart({ id: product.id, title: product.title }, qty);
                                    }}
                                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#333336] hover:shadow-md active:scale-[0.98]"
                                >
                                    <ShoppingBag className="h-4 w-4" />
                                    {inCart ? `Tambah ${qty} Lagi ke Keranjang` : `Tambah ke Keranjang (${qty})`}
                                </button>
                                {inCart && (
                                    <button
                                        type="button"
                                        onClick={() => setIsCartOpen(true)}
                                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-black/[0.08] px-5 py-3 text-sm font-semibold text-[#1d1d1f] transition hover:bg-neutral-50 active:scale-[0.98]"
                                    >
                                        Lihat Keranjang
                                    </button>
                                )}
                                <Link
                                    href="/templates"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-black/[0.08] px-5 py-3 text-sm font-semibold text-[#86868b] transition hover:text-[#1d1d1f] hover:bg-neutral-50 active:scale-[0.98]"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Kembali ke Katalog
                                </Link>
                            </div>
                        </div>

                        <Link
                            href="/my-orders"
                            className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#86868b] transition hover:text-[#1d1d1f]"
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

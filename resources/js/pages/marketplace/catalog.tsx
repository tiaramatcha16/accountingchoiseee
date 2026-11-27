import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, FileSpreadsheet, Search, ShoppingBag } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import AIProductFinder from '@/components/landing-page/AIProductFinder';
import { useCart } from '@/hooks/use-cart';
import StorefrontLayout from '@/layouts/storefront-layout';
import { type SharedData } from '@/types';

interface Product {
    id: number;
    title: string;
    slug: string;
    category: string;
    description: string;
    price: number;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface CatalogProps {
    products: Paginated<Product>;
    categories: string[];
    filters: { q?: string; category?: string };
}

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);

export default function CatalogPage(props: CatalogProps) {
    return (
        <StorefrontLayout>
            <CatalogContent {...props} />
        </StorefrontLayout>
    );
}

function CatalogContent({ products, categories, filters }: CatalogProps) {
    const [query, setQuery] = useState(filters.q ?? '');
    const [category, setCategory] = useState(filters.category ?? '');
    const { auth } = usePage<SharedData>().props;
    const { addToCart, isInCart, setIsCartOpen } = useCart();
    const user = auth?.user;

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/templates', { q: query.trim() || undefined, category: category || undefined }, { preserveState: true });
    }

    return (
        <>
            <Head title="Katalog Template Excel - AccountingChoice" />
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <section className="bg-brand-deep relative overflow-hidden rounded-[2rem] px-5 py-8 text-white sm:px-9 sm:py-10 lg:px-12 lg:py-12">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-32 -right-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-[90px]"
                    />
                    <div className="relative z-10 max-w-3xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wider text-emerald-100 uppercase">
                            <FileSpreadsheet className="h-3.5 w-3.5" />
                            Pasar Template Excel
                        </span>
                        <h1 className="font-heading mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                            Temukan template yang tepat
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
                            Cari file Excel untuk membantu pekerjaan, mengelola usaha, atau merapikan keuangan.
                        </p>

                        <form
                            onSubmit={submitSearch}
                            role="search"
                            className="mt-6 grid gap-2 rounded-2xl bg-white p-2 shadow-xl sm:grid-cols-[1fr_auto_auto]"
                        >
                            <label className="flex min-w-0 items-center gap-2 px-2 text-slate-500">
                                <Search aria-hidden="true" className="h-5 w-5 shrink-0" />
                                <input
                                    aria-label="Cari template"
                                    className="h-11 w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
                                    placeholder="Cari nama atau kebutuhan..."
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                />
                            </label>
                            <select
                                aria-label="Pilih kategori"
                                className="focus:ring-brand-primary/30 h-11 rounded-xl border-0 bg-slate-50 text-sm text-slate-700 focus:ring-2"
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                className="bg-brand-primary hover:bg-brand-primary-dark inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold text-white transition"
                            >
                                Cari Template
                                <Search className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </section>

                <AIProductFinder />

                <section className="pt-9 sm:pt-12">
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="font-heading text-brand-ink text-2xl font-bold sm:text-3xl">Semua Template</h2>
                            <p className="mt-1 text-sm text-black/55">
                                {products.total} template tersedia
                                {filters.q ? ` untuk “${filters.q}”` : ''}
                            </p>
                        </div>
                        {user && (
                            <Link
                                href="/my-orders"
                                className="text-brand-primary inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                            >
                                Pesanan Saya
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        )}
                    </div>

                    {products.data.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                            <FileSpreadsheet className="mx-auto h-10 w-10 text-slate-300" />
                            <h3 className="font-heading mt-4 text-lg font-bold text-slate-800">Template belum ditemukan</h3>
                            <p className="mt-1 text-sm text-slate-500">Coba kata kunci atau kategori yang berbeda.</p>
                            <Link href="/templates" className="text-brand-primary mt-5 inline-flex text-sm font-bold hover:underline">
                                Hapus Filter
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {products.data.map((product) => {
                                const inCart = isInCart(product.id);

                                return (
                                    <article
                                        key={product.id}
                                        className="group hover:border-brand-primary/25 hover:shadow-brand-primary/5 flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                                    >
                                        <Link href={`/templates/${product.slug}`} className="flex flex-1 flex-col">
                                            <div className="from-brand-deep via-brand-primary to-brand-deeper relative flex min-h-48 items-center justify-center overflow-hidden bg-gradient-to-br p-5">
                                                <span className="text-brand-primary absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold">
                                                    {product.category}
                                                </span>
                                                <span className="bg-brand-gold absolute top-4 right-4 rounded-full px-2.5 py-1 text-[10px] font-bold text-black">
                                                    File Excel
                                                </span>
                                                <div className="w-full max-w-[250px] rotate-[-2deg] rounded-xl border border-white/20 bg-white p-3 shadow-2xl transition duration-300 group-hover:rotate-0">
                                                    <div className="mb-2 flex items-center gap-1.5">
                                                        <span className="h-2 w-2 rounded-full bg-rose-400" />
                                                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                                                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                                        <FileSpreadsheet className="text-brand-excel ml-auto h-4 w-4" />
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-1">
                                                        {Array.from({ length: 16 }, (_, index) => (
                                                            <span
                                                                key={index}
                                                                className={`h-5 rounded-sm ${
                                                                    index < 4
                                                                        ? 'bg-emerald-100'
                                                                        : index % 4 === 0
                                                                          ? 'bg-slate-100'
                                                                          : 'bg-emerald-50/60'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="mt-2 truncate font-mono text-[9px] text-slate-500">{product.title}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-1 flex-col p-5">
                                                <h3 className="font-heading group-hover:text-brand-primary text-lg leading-snug font-bold text-slate-900 transition">
                                                    {product.title}
                                                </h3>
                                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{product.description}</p>
                                                <span className="text-brand-primary mt-auto pt-5 text-xs font-semibold">
                                                    Lihat detail template <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                                                </span>
                                            </div>
                                        </Link>

                                        <div className="flex items-center justify-between gap-3 border-t border-black/[0.07] px-5 py-4">
                                            <div>
                                                <span className="block text-[10px] font-bold tracking-wide text-black/40 uppercase">Harga</span>
                                                <span className="font-heading text-brand-primary text-lg font-extrabold">
                                                    {formatRupiah(product.price)}
                                                </span>
                                            </div>
                                            {inCart ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCartOpen(true)}
                                                    className="border-brand-primary/20 bg-brand-primary/5 text-brand-primary hover:bg-brand-primary/10 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold transition cursor-pointer"
                                                >
                                                    <ShoppingBag className="h-4 w-4" />
                                                    Di Keranjang
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        addToCart({
                                                            id: product.id,
                                                            title: product.title,
                                                            category: product.category,
                                                            price: product.price,
                                                            slug: product.slug,
                                                        })
                                                    }
                                                    className="bg-brand-primary hover:bg-brand-primary-dark inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold text-white transition cursor-pointer"
                                                >
                                                    <ShoppingBag className="h-4 w-4" />
                                                    Tambah
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {products.links.length > 3 && (
                        <nav aria-label="Navigasi halaman katalog" className="mt-8 flex flex-wrap justify-center gap-2">
                            {products.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
                                            link.active
                                                ? 'border-brand-primary bg-brand-primary text-white'
                                                : 'hover:border-brand-primary/30 border-black/10 bg-white text-slate-700'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={index}
                                        className="rounded-xl border border-black/5 px-3.5 py-2 text-sm text-slate-400"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ),
                            )}
                        </nav>
                    )}
                </section>
            </main>
        </>
    );
}

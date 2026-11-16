import { Link, usePage } from '@inertiajs/react';
import { Check, FileSpreadsheet, Plus, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

import AIProductFinder from '@/components/landing-page/AIProductFinder';
import { type SharedData } from '@/types';
import { Icon } from '../../../components/landing-page/brand-icon';
import { useCart } from '../../../hooks/use-cart';

const categories = [
    { value: 'Semua', label: 'Semua Template' },
    { value: 'UMKM & Bisnis', label: 'UMKM & Bisnis' },
    { value: 'Keuangan Personal', label: 'Keuangan Pribadi' },
    { value: 'Perpajakan', label: 'Perpajakan' },
    { value: 'Freelancer', label: 'Pekerja Lepas' },
] as const;

type TemplateCategory = (typeof categories)[number]['value'];

export interface TemplateItem {
    id: number;
    title: string;
    category: string;
    price: number;
    description?: string;
    slug: string;
}

function SpreadsheetPreview() {
    return (
        <div aria-hidden="true" className="relative overflow-hidden rounded-xl border border-white/15 bg-white/10 p-2.5">
            <div className="mb-2 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white/50" />
                <span className="h-2 w-2 rounded-full bg-white/50" />
                <span className="h-2 w-2 rounded-full bg-white/50" />
                <span className="ml-2 text-[10px] font-medium text-white/75">Pratinjau Template</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: 12 }, (_, index) => (
                    <span
                        key={index}
                        className={`h-4 rounded-sm ${index < 4 ? 'bg-brand-gold/80' : index % 4 === 0 ? 'bg-white/35' : 'bg-white/15'}`}
                    />
                ))}
            </div>
            <div className="mt-2 flex h-7 items-end gap-2 rounded-lg bg-white/10 px-3 pt-1.5">
                <span className="h-3 w-1/5 rounded-t bg-emerald-200/80" />
                <span className="h-5 w-1/5 rounded-t bg-emerald-200/80" />
                <span className="h-4 w-1/5 rounded-t bg-emerald-200/80" />
                <span className="bg-brand-gold h-7 w-1/5 rounded-t" />
                <span className="h-6 w-1/5 rounded-t bg-emerald-200/80" />
            </div>
        </div>
    );
}

export default function Catalog({ initialProducts }: { initialProducts?: TemplateItem[] }) {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;
    const [activeCategory, setActiveCategory] = useState<TemplateCategory>('Semua');
    const { addToCart, isInCart, setIsCartOpen } = useCart();

    useEffect(() => {
        const handleFilter = (e: Event) => {
            const detail = (e as CustomEvent<string>).detail;
            const matchingCat = categories.find(
                ({ value }) => value.toLowerCase() === detail.toLowerCase() || detail.toLowerCase().includes(value.toLowerCase()),
            );
            if (matchingCat) {
                setActiveCategory(matchingCat.value);
            }
        };
        window.addEventListener('filter-category', handleFilter);
        return () => window.removeEventListener('filter-category', handleFilter);
    }, []);

    const allTemplates = initialProducts ?? [];

    const visibleTemplates =
        activeCategory === 'Semua'
            ? allTemplates
            : allTemplates.filter((template) => template.category.toLowerCase().includes(activeCategory.toLowerCase().replace('keuangan ', '')));

    const formatRupiah = (val: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);

    return (
        <section id="template-list" className="relative scroll-mt-24 py-14 sm:py-16">
            <div className="pointer-events-none absolute inset-x-0 -top-40 bottom-0 z-0 overflow-hidden">
                <div className="via-brand-primary/12 absolute top-1/4 -left-36 h-[600px] w-[460px] rounded-full bg-gradient-to-r from-emerald-400/20 to-transparent blur-[105px]" />
                <div className="via-brand-primary/12 absolute top-1/3 -right-36 h-[600px] w-[460px] rounded-full bg-gradient-to-l from-emerald-400/20 to-transparent blur-[105px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-8 max-w-2xl text-center">
                    <span className="spark-badge mb-3">
                        <Icon name="layers" className="text-brand-primary h-3.5 w-3.5" />
                        Katalog Template Excel
                    </span>
                    <h2 className="font-heading text-3xl font-extrabold tracking-tight text-black sm:text-4xl">Pilih Template yang Kamu Butuhkan</h2>
                    <p className="mt-2.5 text-sm font-normal text-black/60">
                        Jelajahi file Excel untuk membantu pencatatan usaha, keuangan pribadi, dan perpajakan.
                    </p>
                </div>

                <div aria-label="Filter kategori template" className="mb-8 flex gap-2 overflow-x-auto pb-3 text-xs font-bold">
                    {categories.map(({ value, label }) => (
                        <button
                            key={value}
                            aria-pressed={activeCategory === value}
                            className={`shrink-0 rounded-full border px-5 py-2.5 transition ${
                                activeCategory === value
                                    ? 'border-brand-gold/40 bg-brand-primary shadow-brand-primary/20 text-white shadow-md'
                                    : 'border-black/[0.08] bg-white text-black/75 hover:bg-black/[0.03] hover:text-black'
                            }`}
                            onClick={() => setActiveCategory(value)}
                            type="button"
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <AIProductFinder />

                {allTemplates.length === 0 ? (
                    <div className="mx-auto max-w-md rounded-3xl border border-black/[0.08] bg-white p-8 text-center shadow-xs sm:p-10">
                        <div className="bg-brand-primary/10 text-brand-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                            <FileSpreadsheet className="h-7 w-7" />
                        </div>
                        <h3 className="font-heading text-lg font-bold text-black">Belum Ada Template yang Dipublikasikan</h3>
                        <p className="mt-2 text-xs leading-relaxed text-black/60">
                            Template spreadsheet keuangan sedang dipersiapkan oleh toko. Silakan periksa kembali nanti atau tanyakan langsung kepada
                            admin melalui chat.
                        </p>
                        {user?.role === 'admin' && (
                            <div className="mt-6">
                                <Link
                                    href="/admin/products"
                                    className="bg-brand-primary hover:bg-brand-primary-dark inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-xs transition"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Buka Panel Admin & Unggah Template</span>
                                </Link>
                            </div>
                        )}
                    </div>
                ) : visibleTemplates.length === 0 ? (
                    <div className="mx-auto max-w-md rounded-2xl border border-black/[0.08] bg-white p-8 text-center shadow-xs">
                        <p className="font-heading text-sm font-bold text-black">Tidak ada template dalam kategori "{activeCategory}"</p>
                        <p className="mt-1 text-xs text-black/55">Coba pilih kategori lain atau tampilkan semua template.</p>
                        <button
                            type="button"
                            onClick={() => setActiveCategory('Semua')}
                            className="text-brand-primary mt-4 text-xs font-bold hover:underline"
                        >
                            Tampilkan Semua Template
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {visibleTemplates.map((template) => {
                            const inCart = isInCart(template.id);
                            return (
                                <article
                                    key={template.id}
                                    className="group soft-card-shadow soft-card-hover flex flex-col overflow-hidden rounded-2xl border border-black/[0.07] bg-white transition-all duration-300"
                                >
                                    <div className="from-brand-deep-green via-brand-primary to-brand-deeper bg-gradient-to-br p-2.5">
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <span className="text-brand-primary rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold">
                                                {template.category}
                                            </span>
                                            <span className="bg-brand-gold rounded-full px-2.5 py-1 text-[10px] font-bold text-black">
                                                File Excel
                                            </span>
                                        </div>
                                        <SpreadsheetPreview />
                                    </div>

                                    <div className="flex flex-1 flex-col p-4">
                                        <Link
                                            href={`/templates/${template.slug}`}
                                            className="focus-visible:outline-brand-primary rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
                                        >
                                            <h3 className="font-heading group-hover:text-brand-primary text-sm leading-snug font-bold text-black transition sm:text-[15px]">
                                                {template.title}
                                            </h3>
                                        </Link>
                                        {template.description && (
                                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-black/55">{template.description}</p>
                                        )}

                                        <div className="mt-auto flex items-center justify-between gap-2 border-t border-black/[0.07] pt-4">
                                            <div>
                                                <span className="block text-[10px] font-bold text-black/40 uppercase">Harga</span>
                                                <span className="font-heading text-brand-primary text-base font-extrabold">
                                                    {formatRupiah(template.price)}
                                                </span>
                                            </div>

                                            {inCart ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCartOpen(true)}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                    <span>Di Keranjang</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => addToCart(template)}
                                                    className="bg-brand-primary hover:bg-brand-primary-dark inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-xs transition"
                                                >
                                                    <ShoppingBag className="h-3.5 w-3.5" />
                                                    <span>+ Keranjang</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {visibleTemplates.length > 0 && (
                    <div className="mt-8 text-center">
                        <Link
                            href="/templates"
                            className="hover:border-brand-primary hover:text-brand-primary inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-black transition"
                        >
                            Lihat Semua Template
                            <Icon name="arrow-right" className="h-4 w-4" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}

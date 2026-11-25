import { Link, usePage } from '@inertiajs/react';
import { Check, FileSpreadsheet, Plus, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

import { type SharedData } from '@/types';
import { useCart } from '../../../hooks/use-cart';

const categories = [
    { value: 'Semua', label: 'Semua Template' },
    { value: 'UMKM & Bisnis', label: 'UMKM & Bisnis' },
    { value: 'Keuangan Personal', label: 'Keuangan Pribadi' },
    { value: 'Perpajakan', label: 'Perpajakan' },
    { value: 'Freelancer', label: 'Pekerja Lepas' },
] as const;

const previewThemes = [
    { bg: 'bg-emerald-500/10 text-emerald-800', bar: 'bg-emerald-500' },
    { bg: 'bg-sky-500/10 text-sky-800', bar: 'bg-sky-500' },
    { bg: 'bg-amber-500/10 text-amber-900', bar: 'bg-amber-500' },
    { bg: 'bg-purple-500/10 text-purple-800', bar: 'bg-purple-500' },
    { bg: 'bg-rose-500/10 text-rose-800', bar: 'bg-rose-500' },
];

type TemplateCategory = (typeof categories)[number]['value'];

export interface TemplateItem {
    id: number;
    title: string;
    category: string;
    price: number;
    description?: string;
    slug: string;
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
            : allTemplates.filter((template) =>
                  template.category.toLowerCase().includes(activeCategory.toLowerCase().replace('keuangan ', '')),
              );

    const formatRupiah = (val: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);

    return (
        <section id="template-list" className="scroll-mt-20 bg-[#f5f5f7] py-20 sm:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl text-center mb-12">
                    <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.035em] text-[#1d1d1f]">
                        Pilih Template Sesuai Kebutuhan
                    </h2>
                    <p className="mt-3 text-base text-[#86868b]">
                        Semua template kompatibel dengan Google Sheets dan Microsoft Excel (.xlsx).
                    </p>
                </div>

                {/* Apple Segmented Controls Tabs */}
                <div className="flex items-center justify-center mb-10 overflow-x-auto pb-2">
                    <div className="inline-flex items-center gap-1 rounded-full border border-black/[0.08] bg-white/80 p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] backdrop-blur-md">
                        {categories.map(({ value, label }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setActiveCategory(value)}
                                className={`rounded-full px-5 py-2 text-xs font-semibold transition-all duration-200 ${
                                    activeCategory === value
                                        ? 'bg-[#1d1d1f] text-white shadow-xs'
                                        : 'text-[#86868b] hover:text-[#1d1d1f]'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {allTemplates.length === 0 ? (
                    <div className="mx-auto max-w-md rounded-3xl border border-black/[0.08] bg-white p-8 text-center shadow-xs sm:p-10">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600">
                            <FileSpreadsheet className="h-7 w-7" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#1d1d1f]">Belum Ada Template yang Dipublikasikan</h3>
                        <p className="mt-2 text-xs leading-relaxed text-[#86868b]">
                            Template spreadsheet keuangan sedang dipersiapkan oleh toko. Silakan periksa kembali nanti atau tanyakan langsung melalui WhatsApp admin.
                        </p>
                        {user?.role === 'admin' && (
                            <div className="mt-6">
                                <Link
                                    href="/admin/products"
                                    className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#333336]"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Buka Panel Admin & Unggah Template</span>
                                </Link>
                            </div>
                        )}
                    </div>
                ) : visibleTemplates.length === 0 ? (
                    <div className="mx-auto max-w-md rounded-3xl border border-black/[0.08] bg-white p-8 text-center shadow-xs">
                        <p className="text-sm font-semibold text-[#1d1d1f]">Tidak ada template dalam kategori "{activeCategory}"</p>
                        <p className="mt-1 text-xs text-[#86868b]">Coba pilih kategori lain atau tampilkan semua template.</p>
                        <button
                            type="button"
                            onClick={() => setActiveCategory('Semua')}
                            className="mt-4 text-xs font-semibold text-emerald-700 hover:underline"
                        >
                            Tampilkan Semua Template
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {visibleTemplates.map((template, index) => {
                            const inCart = isInCart(template.id);
                            const theme = previewThemes[index % previewThemes.length]!;

                            return (
                                <article
                                    key={template.id}
                                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-black/[0.12] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1"
                                >
                                    <div>
                                        {/* Card Top: Format Info */}
                                        <div className="flex items-center justify-between gap-2 mb-3">
                                            <span className="text-[11px] font-semibold text-emerald-800">
                                                {template.category}
                                            </span>
                                            <span className="text-[10px] font-medium text-neutral-400">
                                                Google Sheets & Excel
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <Link href={`/templates/${template.slug}`} className="block focus:outline-none">
                                            <h3 className="text-lg font-semibold tracking-[-0.015em] text-[#1d1d1f] group-hover:text-emerald-700 transition">
                                                {template.title}
                                            </h3>
                                        </Link>

                                        {/* Description */}
                                        {template.description && (
                                            <p className="mt-2 text-xs text-[#86868b] leading-relaxed line-clamp-2">
                                                {template.description}
                                            </p>
                                        )}

                                        {/* Mini Feature Highlights */}
                                        <div className="mt-5 space-y-1.5 border-t border-black/[0.04] pt-4 text-[11px] text-neutral-600">
                                            <div className="flex items-center gap-1.5">
                                                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                <span>Formula Otomatis & Teruji</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                <span>Akses Google Drive Instan</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer: Price & Add to Cart */}
                                    <div className="mt-6 border-t border-black/[0.05] pt-4 flex items-center justify-between gap-3">
                                        <div>
                                            <span className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Sekali Bayar</span>
                                            <span className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
                                                {formatRupiah(template.price)}
                                            </span>
                                        </div>

                                        {inCart ? (
                                            <button
                                                type="button"
                                                onClick={() => setIsCartOpen(true)}
                                                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                                            >
                                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                <span>Di Keranjang</span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => addToCart(template)}
                                                className="inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all duration-200 hover:bg-[#333336] active:scale-95"
                                            >
                                                <ShoppingBag className="h-3.5 w-3.5" />
                                                <span>+ Keranjang</span>
                                            </button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

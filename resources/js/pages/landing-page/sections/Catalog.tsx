'use client';

import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Check, FileSpreadsheet, Plus, ShoppingBag } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import GlassFolder, { type ArtPreset, type FolderFile } from '@/components/ui/glass-folder';
import { useCart } from '@/hooks/use-cart';
import { type SharedData } from '@/types';

export interface TemplateItem {
    id: number;
    title: string;
    category: string;
    price: number;
    description?: string;
    slug: string;
}

const DEFAULT_TEMPLATES: TemplateItem[] = [
    {
        id: 8,
        title: 'Template Manajemen Inventaris & Stok Barang',
        category: 'UMKM & Bisnis',
        price: 49000,
        description: 'Pantau stok barang masuk, keluar, dan peringatan stok menipis otomatis.',
        slug: 'template-manajemen-inventaris-stok',
    },
    {
        id: 7,
        title: 'Freelancer Income & Invoice Tracker',
        category: 'Pekerja Lepas',
        price: 35000,
        description: 'Catat pemasukan per klien, piutang, dan status pembayaran invoice.',
        slug: 'freelancer-income-invoice-tracker',
    },
    {
        id: 6,
        title: 'Debt Payoff Tracker',
        category: 'Keuangan Pribadi',
        price: 29000,
        description: 'Simulasi pelunasan utang metode snowball & avalanche terencana.',
        slug: 'debt-payoff-tracker',
    },
    {
        id: 5,
        title: 'Template Penghitungan PPh Pasal 21 Karyawan',
        category: 'Perpajakan',
        price: 45000,
        description: 'Hitung pajak gaji karyawan dengan rumus tarif efektif TER terbaru.',
        slug: 'template-penghitungan-pph-pasal-21',
    },
    {
        id: 4,
        title: 'Template Rekapitulasi Pajak UMKM (PPh Final 0.5%)',
        category: 'Perpajakan',
        price: 39000,
        description: 'Rekap omzet bulanan dan hitung PPh final PP 23/55 secara instan.',
        slug: 'template-rekapitulasi-pajak-umkm',
    },
    {
        id: 3,
        title: 'Monthly Budget Planner',
        category: 'Keuangan Pribadi',
        price: 29000,
        description: 'Kelola pos pengeluaran bulanan dan pantau tabungan secara terstruktur.',
        slug: 'monthly-budget-planner',
    },
    {
        id: 2,
        title: 'Template Kalkulator Harga Pokok Penjualan (HPP) & Margin',
        category: 'UMKM & Bisnis',
        price: 35000,
        description: 'Hitung HPP produk dan tetapkan margin keuntungan dengan akurat.',
        slug: 'template-kalkulator-hpp-margin',
    },
    {
        id: 1,
        title: 'Template Laporan Keuangan UMKM 3-in-1',
        category: 'UMKM & Bisnis',
        price: 49000,
        description: 'Laporan laba rugi, neraca, dan arus kas otomatis siap pakai untuk UMKM.',
        slug: 'template-laporan-keuangan-umkm-3-in-1',
    },
];

interface FolderCategoryConfig {
    id: string;
    label: string;
    shortLabel: string;
    art: ArtPreset;
}

const CATEGORY_FOLDERS: FolderCategoryConfig[] = [
    {
        id: 'UMKM & Bisnis',
        label: 'UMKM & Bisnis',
        shortLabel: 'Bisnis',
        art: 'verdant',
    },
    {
        id: 'Keuangan Pribadi',
        label: 'Keuangan Pribadi',
        shortLabel: 'Personal',
        art: 'glacier',
    },
    {
        id: 'Perpajakan',
        label: 'Perpajakan',
        shortLabel: 'Pajak',
        art: 'ember',
    },
    {
        id: 'Pekerja Lepas',
        label: 'Pekerja Lepas',
        shortLabel: 'Freelancer',
        art: 'dusk',
    },
];

function matchCategory(templateCat: string, targetCat: string): boolean {
    const t = templateCat.toLowerCase();
    const q = targetCat.toLowerCase();
    if (q === 'umkm & bisnis') return t.includes('umkm') || t.includes('bisnis');
    if (q === 'keuangan pribadi' || q === 'keuangan personal' || q === 'personal') {
        return t.includes('pribadi') || t.includes('personal');
    }
    if (q === 'perpajakan' || q === 'pajak') return t.includes('pajak');
    if (q === 'pekerja lepas' || q === 'freelancer') return t.includes('lepas') || t.includes('freelance');
    return t.includes(q);
}

export default function Catalog({ initialProducts }: { initialProducts?: TemplateItem[] }) {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;
    const { addToCart, isInCart, setIsCartOpen } = useCart();

    // Gabungkan data produk dari backend dengan default templates
    const allTemplates = useMemo(() => {
        if (!initialProducts || initialProducts.length === 0) {
            return DEFAULT_TEMPLATES;
        }

        const matched = DEFAULT_TEMPLATES.map((def) => {
            const fromDb = initialProducts.find(
                (p) => p.slug === def.slug || p.title.toLowerCase().trim() === def.title.toLowerCase().trim()
            );
            if (fromDb) {
                return {
                    ...def,
                    id: fromDb.id,
                    title: fromDb.title || def.title,
                    price: Number(fromDb.price) || def.price,
                    description: fromDb.description || def.description,
                    slug: fromDb.slug || def.slug,
                };
            }
            return def;
        });

        const extras = initialProducts
            .filter((p) => !DEFAULT_TEMPLATES.some((def) => def.slug === p.slug || def.title.toLowerCase().trim() === p.title.toLowerCase().trim()))
            .map((p) => ({
                id: p.id,
                title: p.title,
                category: p.category || 'UMKM & Bisnis',
                price: Number(p.price) || 35000,
                description: p.description || '',
                slug: p.slug,
            }));

        return [...matched, ...extras];
    }, [initialProducts]);

    // Hanya folder yang aktif/terbuka. Jika null, tampilkan 4 folder.
    const [openedFolderId, setOpenedFolderId] = useState<string | null>(null);
    const [highlightedSlug, setHighlightedSlug] = useState<string | null>(null);

    const fullCatalogRef = useRef<HTMLDivElement>(null);

    // Kategori folder yang sedang aktif
    const activeFolderConfig = useMemo(() => {
        return CATEGORY_FOLDERS.find((c) => c.id === openedFolderId) ?? null;
    }, [openedFolderId]);

    // Template yang keluar dari folder yang sedang aktif
    const activeTemplates = useMemo(() => {
        if (!openedFolderId) return [];
        return allTemplates.filter((tpl) => matchCategory(tpl.category, openedFolderId));
    }, [allTemplates, openedFolderId]);

    // Format Rupiah
    const formatRupiah = (val: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);

    // Listener custom event jika ada komponen lain yang memanggil filter-category
    useEffect(() => {
        const handleFilter = (e: Event) => {
            const detail = (e as CustomEvent<string>).detail;
            const foundCat = CATEGORY_FOLDERS.find(
                (c) =>
                    c.id.toLowerCase() === detail.toLowerCase() ||
                    c.label.toLowerCase().includes(detail.toLowerCase()) ||
                    detail.toLowerCase().includes(c.shortLabel.toLowerCase()),
            );
            if (foundCat) {
                setOpenedFolderId(foundCat.id);
            } else if (detail.toLowerCase() === 'semua' || detail.toLowerCase().includes('semua')) {
                setOpenedFolderId(null);
            }
        };

        window.addEventListener('filter-category', handleFilter);
        return () => window.removeEventListener('filter-category', handleFilter);
    }, []);

    // Handler ketika file sheet di dalam folder diklik
    const handleFileSelect = (file: FolderFile) => {
        const matchingTemplate = allTemplates.find(
            (t) =>
                t.title.toLowerCase().includes(file.name.toLowerCase()) ||
                file.name.toLowerCase().includes(t.title.toLowerCase()),
        );

        if (matchingTemplate) {
            setHighlightedSlug(matchingTemplate.slug);
            const el = document.getElementById(`template-card-${matchingTemplate.slug}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            setTimeout(() => {
                setHighlightedSlug(null);
            }, 3000);
        }
    };

    return (
        <section id="template-list" className="scroll-mt-20 bg-[#f5f5f7] py-16 sm:py-20 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-b from-emerald-100/40 via-sky-100/20 to-transparent blur-3xl"
            />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="mx-auto max-w-3xl text-center mb-2 sm:mb-4">
                    <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.035em] text-[#1d1d1f]">
                        Pilih Template Sesuai Kebutuhan
                    </h2>
                    <p className="mt-2 text-base sm:text-lg text-[#86868b] max-w-2xl mx-auto">
                        Semua template kompatibel dengan Google Sheets dan Microsoft Excel (.xlsx).
                    </p>
                </div>

                {/* Interactive Area */}
                <div ref={fullCatalogRef}>
                    <AnimatePresence mode="wait">
                        {openedFolderId === null ? (
                            /* TAMPILAN AWAL: HANYA 4 FOLDER */
                            <motion.div
                                key="all-folders-view"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-10 justify-items-center items-start pt-0 pb-12"
                            >
                                {CATEGORY_FOLDERS.map((cat, index) => {
                                    const catTemplates = allTemplates.filter((t) => matchCategory(t.category, cat.id));

                                    const folderFiles: FolderFile[] = catTemplates.map((t) => ({
                                        name: t.title,
                                        meta: `${formatRupiah(t.price)} · xlsx`,
                                        art: cat.art,
                                    }));

                                    return (
                                        <div
                                            key={cat.id}
                                            onClick={() => setOpenedFolderId(cat.id)}
                                            className="cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                                        >
                                            <GlassFolder
                                                label={cat.label}
                                                meta={`${catTemplates.length} template`}
                                                art={cat.art}
                                                seed={index * 137 + 19}
                                                width={280}
                                                action="none"
                                                open={false}
                                                files={folderFiles}
                                                appear={true}
                                                appearDelay={index * 90}
                                            />
                                        </div>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            /* TAMPILAN KETIKA SALAH SATU FOLDER DITEKAN: FOLDER LAIN HILANG & ISI TEMPLATE KELUAR */
                            <motion.div
                                key={`active-folder-${openedFolderId}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.35 }}
                                className="flex flex-col items-center"
                            >
                                {/* Tombol Kembali ke Semua Folder */}
                                <div className="w-full max-w-5xl mb-8 flex items-center justify-start">
                                    <button
                                        type="button"
                                        onClick={() => setOpenedFolderId(null)}
                                        className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-4 py-2 text-xs font-semibold text-[#1d1d1f] shadow-xs hover:bg-neutral-50 transition cursor-pointer"
                                    >
                                        <ArrowLeft className="h-3.5 w-3.5" />
                                        <span>Kembali ke Semua Folder</span>
                                    </button>
                                </div>

                                {activeFolderConfig && (
                                    /* Seluruh Kartu Template Saja */
                                    <div className="w-full max-w-5xl">
                                        <div
                                            className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${
                                                activeTemplates.length >= 3
                                                    ? 'lg:grid-cols-3'
                                                    : 'lg:grid-cols-2 max-w-3xl mx-auto'
                                            }`}
                                        >
                                                {activeTemplates.map((template) => {
                                                    const inCart = isInCart(template.id) || (template.slug ? isInCart(template.slug) : false);
                                                    const isHighlighted = highlightedSlug === template.slug;

                                                    return (
                                                        <motion.article
                                                            key={template.id}
                                                            id={`template-card-${template.slug}`}
                                                            initial={{ opacity: 0, y: 16 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1 ${
                                                                isHighlighted
                                                                    ? 'border-emerald-500 ring-4 ring-emerald-500/20 shadow-xl'
                                                                    : 'border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-black/[0.14] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]'
                                                            }`}
                                                        >
                                                            <div>
                                                                {/* Card Header: Category & Format */}
                                                                <div className="flex items-center justify-between gap-2 mb-3">
                                                                    <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                                                                        {template.category}
                                                                    </span>
                                                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-500">
                                                                        <FileSpreadsheet className="h-3 w-3 text-emerald-600" />
                                                                        <span>Google Sheets & Excel</span>
                                                                    </span>
                                                                </div>

                                                                {/* Title */}
                                                                <Link
                                                                    href={`/templates/${template.slug}`}
                                                                    className="block focus:outline-none"
                                                                >
                                                                    <h4 className="text-base sm:text-lg font-semibold tracking-[-0.015em] text-[#1d1d1f] group-hover:text-emerald-700 transition leading-snug">
                                                                        {template.title}
                                                                    </h4>
                                                                </Link>

                                                                {/* Description */}
                                                                {template.description && (
                                                                    <p className="mt-2.5 text-xs text-[#86868b] leading-relaxed line-clamp-3">
                                                                        {template.description}
                                                                    </p>
                                                                )}

                                                                {/* Highlights */}
                                                                <div className="mt-5 space-y-2 border-t border-black/[0.04] pt-4 text-[11px] text-neutral-600">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                                        <span className="font-medium">
                                                                            Formula Otomatis & Teruji
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                                        <span className="font-medium">
                                                                            Akses Google Drive Instan
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Card Footer: Price & Add to Cart */}
                                                            <div className="mt-6 border-t border-black/[0.05] pt-4 flex items-center justify-between gap-3">
                                                                <div>
                                                                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                                                        Sekali Bayar
                                                                    </span>
                                                                    <span className="text-base sm:text-lg font-bold tracking-tight text-[#1d1d1f]">
                                                                        {formatRupiah(template.price)}
                                                                    </span>
                                                                </div>

                                                                {inCart ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setIsCartOpen(true)}
                                                                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 cursor-pointer"
                                                                    >
                                                                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                                        <span>Di Keranjang</span>
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => addToCart(template)}
                                                                        className="inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-200 hover:bg-[#333336] active:scale-95 cursor-pointer"
                                                                    >
                                                                        <ShoppingBag className="h-3.5 w-3.5" />
                                                                        <span>+ Keranjang</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </motion.article>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Admin Shortcut if Admin is logged in */}
                    {user?.role === 'admin' && (
                        <div className="mt-12 text-center">
                            <Link
                                href="/admin/products"
                                className="inline-flex items-center gap-2 rounded-full border border-black/[0.1] bg-white px-5 py-2.5 text-xs font-semibold text-[#1d1d1f] shadow-xs hover:bg-neutral-50"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Buka Panel Admin & Kelola Template</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

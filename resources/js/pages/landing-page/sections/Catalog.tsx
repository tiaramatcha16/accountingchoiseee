import { useState } from 'react';

import { Icon } from '../../../components/landing-page/brand-icon';

const categories = ['Semua', 'UMKM & Bisnis', 'Personal', 'Pajak', 'Freelancer'] as const;

type TemplateCategory = (typeof categories)[number];

const templates: { title: string; category: Exclude<TemplateCategory, 'Semua'> }[] = [
    { title: 'Template Laporan Keuangan UMKM 3-in-1', category: 'UMKM & Bisnis' },
    { title: 'Template Kalkulator Harga Pokok Penjualan (HPP) & Margin', category: 'UMKM & Bisnis' },
    { title: 'Monthly Budget Planner', category: 'Personal' },
    { title: 'Template Rekapitulasi Pajak UMKM (PPh Final 0.5%)', category: 'Pajak' },
    { title: 'Template Penghitungan PPh Pasal 21 Karyawan', category: 'Pajak' },
    { title: 'Debt Payoff Tracker', category: 'Personal' },
    { title: 'Freelancer Income & Invoice Tracker', category: 'Freelancer' },
    { title: 'Template Manajemen Inventaris & Stok Barang', category: 'UMKM & Bisnis' },
];

function SpreadsheetPreview() {
    return (
        <div aria-hidden="true" className="relative overflow-hidden rounded-xl border border-white/15 bg-white/10 p-2.5">
            <div className="mb-2 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white/50" />
                <span className="h-2 w-2 rounded-full bg-white/50" />
                <span className="h-2 w-2 rounded-full bg-white/50" />
                <span className="ml-2 text-[10px] font-medium text-white/75">Spreadsheet Template</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: 12 }, (_, index) => (
                    <span
                        key={index}
                        className={`h-4 rounded-sm ${
                            index < 4 ? 'bg-brand-gold/80' : index % 4 === 0 ? 'bg-white/35' : 'bg-white/15'
                        }`}
                    />
                ))}
            </div>
            <div className="mt-2 flex h-7 items-end gap-2 rounded-lg bg-white/10 px-3 pt-1.5">
                <span className="h-3 w-1/5 rounded-t bg-emerald-200/80" />
                <span className="h-5 w-1/5 rounded-t bg-emerald-200/80" />
                <span className="h-4 w-1/5 rounded-t bg-emerald-200/80" />
                <span className="h-7 w-1/5 rounded-t bg-brand-gold" />
                <span className="h-6 w-1/5 rounded-t bg-emerald-200/80" />
            </div>
        </div>
    );
}

export default function Catalog() {
    const [activeCategory, setActiveCategory] = useState<TemplateCategory>('Semua');
    const visibleTemplates =
        activeCategory === 'Semua' ? templates : templates.filter((template) => template.category === activeCategory);

    return (
        <section id="template-list" className="relative py-14 sm:py-16">
            <div className="pointer-events-none absolute inset-x-0 -top-40 bottom-0 z-0 overflow-hidden">
                <div className="absolute -left-36 top-1/4 h-[600px] w-[460px] rounded-full bg-gradient-to-r from-emerald-400/20 via-brand-primary/12 to-transparent blur-[105px]" />
                <div className="absolute -right-36 top-1/3 h-[600px] w-[460px] rounded-full bg-gradient-to-l from-emerald-400/20 via-brand-primary/12 to-transparent blur-[105px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-8 max-w-2xl text-center">
                    <span className="spark-badge mb-3">
                        <Icon name="layers" className="h-3.5 w-3.5 text-brand-primary" />
                        Rencana Katalog
                    </span>
                    <h2 className="font-heading text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
                        Rencana Template Keuangan
                    </h2>
                    <p className="mt-2.5 text-sm font-normal text-black/60">
                        Delapan template untuk membantu kebutuhan bisnis, pajak, freelancer, dan keuangan pribadi.
                    </p>
                </div>

                <div aria-label="Filter kategori template" className="mb-8 flex gap-2 overflow-x-auto pb-3 text-xs font-bold">
                    {categories.map((category) => (
                        <button
                            key={category}
                            aria-pressed={activeCategory === category}
                            className={`shrink-0 rounded-full border px-5 py-2.5 transition ${
                                activeCategory === category
                                    ? 'border-brand-gold/40 bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                                    : 'border-black/[0.08] bg-white text-black/75 hover:bg-black/[0.03] hover:text-black'
                            }`}
                            onClick={() => setActiveCategory(category)}
                            type="button"
                        >
                            {category === 'Semua' ? 'Semua Template' : category}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {visibleTemplates.map((template) => (
                        <article
                            key={template.title}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.07] bg-white soft-card-shadow soft-card-hover transition-all duration-300"
                        >
                            <div className="bg-gradient-to-br from-brand-deep-green via-brand-primary to-brand-deeper p-2.5">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-brand-primary">
                                        {template.category}
                                    </span>
                                    <span className="rounded-full bg-brand-gold px-2.5 py-1 text-[10px] font-bold text-black">
                                        Direncanakan
                                    </span>
                                </div>
                                <SpreadsheetPreview />
                            </div>

                            <div className="flex flex-1 flex-col p-4">
                                <h3 className="font-heading text-sm font-bold leading-snug text-black transition group-hover:text-brand-primary sm:text-[15px]">
                                    {template.title}
                                </h3>
                                <div className="mt-auto flex items-center gap-2 border-t border-black/[0.07] pt-3 text-[11px] text-black/55">
                                    <Icon name="sheet" className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
                                    Rencana template spreadsheet
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

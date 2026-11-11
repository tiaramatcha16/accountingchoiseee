import { Icon } from '../../../components/landing-page/brand-icon';

const categories = [
    {
        label: 'UMKM & Operasional',
        icon: 'store',
        title: 'Template untuk UMKM',
        description: 'Kelola laporan keuangan, hitung HPP dan margin, serta catat inventaris dan stok barang.',
        templates: 3,
        accents: ['sheet', 'calculator'],
    },
    {
        label: 'Personal & Freelancer',
        icon: 'wallet',
        title: 'Keuangan Personal & Freelancer',
        description: 'Rencanakan anggaran, pantau pelunasan utang, dan kelola pendapatan serta invoice freelance.',
        templates: 3,
        accents: ['zap', 'layers'],
    },
    {
        label: 'Pajak UMKM & Karyawan',
        icon: 'calculator',
        title: 'Template Perpajakan',
        description: 'Siapkan rekapitulasi PPh Final UMKM dan penghitungan PPh Pasal 21 karyawan.',
        templates: 2,
        accents: ['check-circle-2', 'sheet'],
    },
] as const;

export default function Categories() {
    return (
        <section id="pilih-kebutuhan" className="bg-brand-surface py-14 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mx-auto mb-9 max-w-2xl text-center sm:mb-11">
                    <div className="mb-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary sm:text-xs">
                        <span aria-hidden="true" className="h-px w-7 bg-brand-primary" />
                        Pilih berdasarkan kebutuhan
                        <span aria-hidden="true" className="h-px w-7 bg-brand-primary" />
                    </div>
                    <h2 className="font-heading text-3xl font-semibold tracking-tight text-brand-heading sm:text-4xl">
                        Kategori Template Keuangan
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                        Pilih kategori template sesuai kebutuhan bisnis, pribadi, maupun perpajakan.
                    </p>
                </header>

                <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3 lg:gap-5">
                    {categories.map((category) => (
                        <article
                            key={category.label}
                            className="category-card flex h-full flex-col rounded-2xl border bg-white p-3 sm:p-3.5"
                        >
                            <span aria-hidden="true" className="category-card-ring pointer-events-none">
                                <span className="category-card-ring-inner" />
                            </span>
                            <div className="category-art">
                                <span aria-hidden="true" className="category-art-corner" />
                                <span aria-hidden="true" className="category-art-grid" />
                                <span aria-hidden="true" className="category-art-orbit" />
                                <span aria-hidden="true" className="category-art-accent category-art-accent--left">
                                    <Icon name={category.accents[0]} className="h-5 w-5" />
                                </span>
                                <span aria-hidden="true" className="category-art-accent category-art-accent--right">
                                    <Icon name={category.accents[1]} className="h-5 w-5" />
                                </span>
                                <div aria-hidden="true" className="category-laptop">
                                    <div className="category-laptop-screen">
                                        <div className="category-sheet-top">
                                            <span />
                                            <span />
                                            <span />
                                            <Icon name={category.icon} className="category-sheet-symbol" />
                                        </div>
                                        <div className="category-sheet-body">
                                            <div className="category-sheet-rows">
                                                <span />
                                                <span />
                                                <span />
                                            </div>
                                            <div className="category-sheet-chart">
                                                <span />
                                                <span />
                                                <span />
                                                <span />
                                            </div>
                                        </div>
                                    </div>
                                    <span className="category-laptop-base" />
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col items-center px-2 pb-2 pt-1 text-center">
                                <span className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-primary">
                                    {category.label}
                                </span>
                                <h3 className="font-heading text-lg font-semibold tracking-tight text-brand-heading sm:text-xl">
                                    {category.title}
                                </h3>
                                <p className="mt-1.5 max-w-sm text-sm leading-5 text-slate-600">
                                    {category.description}
                                </p>
                                <span className="mt-3 inline-flex items-center gap-2 border-t border-slate-100 pt-2.5 text-[11px] font-medium text-slate-500">
                                    <span className="category-art-dot" />
                                    {category.templates} template tersedia
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

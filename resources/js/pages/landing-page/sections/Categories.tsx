import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, FileSpreadsheet, PiggyBank, ReceiptText, ShieldCheck, Sparkles, Store, TrendingUp, Wallet } from 'lucide-react';

interface CategoryItem {
    id: string;
    label: string;
    targetCategory: string;
    icon: typeof Store;
    badgeIcon: typeof TrendingUp;
    title: string;
    description: string;
    templatesCount: number;
    badgeVariant: 'outline' | 'secondary' | 'default';
    badgeClass: string;
    iconWrapperClass: string;
    iconColor: string;
    sheet: {
        title: string;
        tag: string;
        tagColor: string;
        rows: Array<{
            label: string;
            val: string;
            sub: string;
            subColor: string;
        }>;
        highlight: {
            label: string;
            val: string;
            badge: string;
        };
    };
    features: string[];
    ctaText: string;
}

const categories: CategoryItem[] = [
    {
        id: 'umkm',
        label: 'UMKM & Operasional',
        targetCategory: 'UMKM & Bisnis',
        icon: Store,
        badgeIcon: TrendingUp,
        title: 'Template untuk UMKM',
        description: 'Kelola laporan keuangan, hitung HPP dan margin, serta catat inventaris dan stok barang.',
        templatesCount: 3,
        badgeVariant: 'outline',
        badgeClass: 'border-emerald-200 bg-emerald-50/90 text-emerald-800 font-semibold',
        iconWrapperClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20 group-hover:bg-emerald-700',
        iconColor: 'text-emerald-600',
        sheet: {
            title: 'Laba_Rugi_UMKM_2024.xlsx',
            tag: 'Laba Bersih Otomatis',
            tagColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
            rows: [
                { label: 'Penjualan & Omzet', val: 'Rp 48.500.000', sub: '+18% bulanan', subColor: 'text-emerald-700 bg-emerald-50' },
                { label: 'HPP & Biaya Operasional', val: '-Rp 28.200.000', sub: 'Terkendali', subColor: 'text-slate-600 bg-slate-100' },
            ],
            highlight: { label: 'Laba Bersih Usaha', val: 'Rp 20.300.000', badge: 'Margin 42%' },
        },
        features: ['Laporan Laba Rugi, Neraca, & Arus Kas', 'Kalkulator HPP & Penetapan Margin', 'Kontrol Inventaris Stok & Mutasi'],
        ctaText: 'Lihat Template UMKM',
    },
    {
        id: 'personal',
        label: 'Keuangan Pribadi & Pekerja Lepas',
        targetCategory: 'Keuangan Personal',
        icon: Wallet,
        badgeIcon: PiggyBank,
        title: 'Keuangan Pribadi & Pekerja Lepas',
        description: 'Rencanakan anggaran, pantau pelunasan utang, dan kelola pendapatan serta tagihan pekerja lepas.',
        templatesCount: 3,
        badgeVariant: 'outline',
        badgeClass: 'border-teal-200 bg-teal-50/90 text-teal-800 font-semibold',
        iconWrapperClass: 'bg-teal-600 text-white shadow-md shadow-teal-700/20 group-hover:bg-teal-700',
        iconColor: 'text-teal-600',
        sheet: {
            title: 'Anggaran_Bulanan.xlsx',
            tag: 'Alokasi 50/30/20',
            tagColor: 'bg-teal-100 text-teal-800 border border-teal-200',
            rows: [
                { label: 'Pendapatan Klien (Tagihan)', val: 'Rp 8.500.000', sub: 'Lunas ✓', subColor: 'text-emerald-700 bg-emerald-50' },
                { label: 'Pos Tabungan & Investasi', val: 'Rp 3.000.000', sub: 'Target 20%', subColor: 'text-teal-700 bg-teal-50' },
            ],
            highlight: { label: 'Sisa Arus Kas', val: 'Rp 4.250.000', badge: 'Posisi Sehat' },
        },
        features: ['Anggaran bulanan otomatis (50/30/20)', 'Catatan tagihan dan klien pekerja lepas', 'Simulasi pelunasan utang dan dana darurat'],
        ctaText: 'Lihat Template Keuangan Pribadi',
    },
    {
        id: 'pajak',
        label: 'Pajak UMKM & Karyawan',
        targetCategory: 'Perpajakan',
        icon: ReceiptText,
        badgeIcon: ShieldCheck,
        title: 'Template Perpajakan',
        description: 'Siapkan rekapitulasi PPh Final UMKM dan penghitungan PPh Pasal 21 karyawan.',
        templatesCount: 2,
        badgeVariant: 'outline',
        badgeClass: 'border-amber-200 bg-amber-50/90 text-amber-800 font-semibold',
        iconWrapperClass: 'bg-amber-600 text-white shadow-md shadow-amber-700/20 group-hover:bg-amber-700',
        iconColor: 'text-amber-600',
        sheet: {
            title: 'Kalkulator_PPh_Final_TER.xlsx',
            tag: 'Aturan Pajak 2024',
            tagColor: 'bg-amber-100 text-amber-800 border border-amber-200',
            rows: [
                { label: 'Omzet Peredaran Bruto', val: 'Rp 62.000.000', sub: 'Bulan Berjalan', subColor: 'text-slate-600 bg-slate-100' },
                { label: 'PPh 21 TER Karyawan', val: 'Kategori A/B/C', sub: 'Rumus Otomatis', subColor: 'text-blue-700 bg-blue-50' },
            ],
            highlight: { label: 'PPh Final 0.5% (PP 23/55)', val: 'Rp 310.000', badge: 'Siap Setor' },
        },
        features: ['Rekapitulasi Omzet PPh Final 0.5%', 'PPh 21 TER Sesuai PMK / PP 58 Terbaru', 'Format Terstruktur Siap Lapor SPT'],
        ctaText: 'Lihat Template Perpajakan',
    },
];

export default function Categories() {
    const handleSelectCategory = (targetCategory: string) => {
        window.dispatchEvent(new CustomEvent('filter-category', { detail: targetCategory }));
        const el = document.getElementById('template-list');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section id="pilih-kebutuhan" className="bg-brand-surface border-y border-slate-200/60 py-14 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
                    <div className="border-brand-primary/20 bg-brand-primary/5 text-brand-primary mb-3 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold tracking-wider uppercase shadow-2xs">
                        <Sparkles className="text-brand-primary h-3.5 w-3.5" />
                        <span>PILIH BERDASARKAN KEBUTUHAN</span>
                    </div>
                    <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Kategori Template Keuangan</h2>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                        Pilih kategori template sesuai kebutuhan usaha, pribadi, pekerja lepas, maupun perpajakan.
                    </p>
                </header>

                <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 lg:gap-7">
                    {categories.map((category) => {
                        const IconComponent = category.icon;
                        const BadgeIcon = category.badgeIcon;
                        return (
                            <Card
                                key={category.id}
                                className="group hover:border-brand-primary/40 hover:shadow-brand-primary/10 relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border-slate-200/90 bg-white p-0 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                            >
                                <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
                                    {/* Card Header Top: Icon Badge, Category Badge & Pulsing Ready Counter */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${category.iconWrapperClass}`}
                                            >
                                                <IconComponent className="h-5 w-5" />
                                                <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-slate-700 shadow-2xs">
                                                    <BadgeIcon className="h-2.5 w-2.5" />
                                                </span>
                                            </div>
                                            <Badge variant={category.badgeVariant} className={category.badgeClass}>
                                                {category.label}
                                            </Badge>
                                        </div>
                                        <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200/70 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                            <span className="relative flex h-2 w-2">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                            </span>
                                            {category.templatesCount} template
                                        </div>
                                    </div>

                                    {/* Title & Description */}
                                    <div className="pt-3">
                                        <h3 className="font-heading group-hover:text-brand-primary text-lg font-bold tracking-tight text-slate-900 transition-colors duration-200 sm:text-xl">
                                            {category.title}
                                        </h3>
                                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:text-sm">{category.description}</p>
                                    </div>
                                </CardHeader>

                                <CardContent className="px-5 py-0 sm:px-6">
                                    {/* Spreadsheet Mini Interactive Preview */}
                                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 transition-colors duration-200 group-hover:border-slate-300 group-hover:bg-[#f6f9f7] sm:p-3.5">
                                        {/* Mini Sheet Title Bar */}
                                        <div className="mb-2.5 flex items-center justify-between border-b border-slate-200/70 pb-2 text-[10px]">
                                            <div className="flex items-center gap-1.5">
                                                <span className="h-2 w-2 rounded-full bg-rose-400/80 transition-transform group-hover:scale-110" />
                                                <span className="h-2 w-2 rounded-full bg-amber-400/80 transition-transform group-hover:scale-110" />
                                                <span className="h-2 w-2 rounded-full bg-emerald-400/80 transition-transform group-hover:scale-110" />
                                                <div className="ml-1.5 flex items-center gap-1 font-mono font-medium text-slate-600">
                                                    <FileSpreadsheet className="h-3 w-3 text-emerald-600 transition-transform duration-200 group-hover:scale-110" />
                                                    <span className="max-w-[120px] truncate sm:max-w-none">{category.sheet.title}</span>
                                                </div>
                                            </div>
                                            <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${category.sheet.tagColor}`}>
                                                {category.sheet.tag}
                                            </span>
                                        </div>

                                        {/* Sheet Rows with Interactive Hover */}
                                        <div className="space-y-1.5 font-sans text-xs">
                                            {category.sheet.rows.map((row, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white/95 px-2.5 py-1.5 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-xs"
                                                >
                                                    <span className="text-[11px] text-slate-600">{row.label}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-[11px] font-semibold text-slate-800">{row.val}</span>
                                                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${row.subColor}`}>
                                                            {row.sub}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Summary Highlight Row */}
                                            <div className="flex items-center justify-between rounded-lg border border-emerald-500/25 bg-emerald-50/80 px-2.5 py-2 shadow-2xs transition-all duration-200 hover:bg-emerald-100/60">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600" />
                                                    <span className="text-[11px] font-bold text-emerald-950">{category.sheet.highlight.label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-emerald-900">
                                                        {category.sheet.highlight.val}
                                                    </span>
                                                    <span className="rounded bg-emerald-700 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
                                                        {category.sheet.highlight.badge}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Features Checklist with Micro-Hover Animation */}
                                    <ul className="my-5 space-y-2 text-xs text-slate-600">
                                        {category.features.map((feature, idx) => (
                                            <li
                                                key={idx}
                                                className="group/item flex items-center gap-2 transition-colors duration-150 hover:text-slate-900"
                                            >
                                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 transition-transform duration-200 group-hover/item:scale-125" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>

                                <CardFooter className="p-5 pt-0 sm:p-6 sm:pt-0">
                                    {/* shadcn Button with Dynamic Hover Arrow Slide */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleSelectCategory(category.targetCategory)}
                                        className="hover:border-brand-primary hover:bg-brand-primary group-hover:border-brand-primary/50 w-full justify-center gap-2 border-slate-200 bg-white font-semibold text-slate-800 transition-all duration-300 group-hover:shadow-sm hover:text-white"
                                    >
                                        <span>{category.ctaText}</span>
                                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1.5" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

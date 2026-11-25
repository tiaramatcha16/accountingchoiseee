import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle2, ChevronRight, FileSpreadsheet, Lock, TrendingUp, Zap, ArrowDownRight, ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { ScrubPagination } from '@/components/ui/scrub-pagination';

const PAGE_COUNT = 120;
const PER_PAGE = 3;
const TOTAL = PAGE_COUNT * PER_PAGE;
const CUSTOMERS = [
  "PT Sinar Abadi Makmur", "CV Berkah Jaya Mandiri", "Kopi Kenangan Sejahtera", "Laju Logistik Prima", "Batik Keris Nusantara", "Dapur Sedap Catering", "Klinik Sehat Medika", "Toko Sumber Rezeki",
  "Nusantara Digital Solusi", "Bumi Kreasi Studio", "Sentosa Retail Mart", "Bengkel Otomotif Maju", "Apotek Sehat Bersama", "Penerbit Cipta Media", "Karya Mandiri Teknik", "Pancarona Furniture",
];
type Status = "Lunas" | "Diproses" | "Jatuh Tempo";
type Row = { id: string; customer: string; amount: string; status: Status };

const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

const STATUS_CLASS: Record<Status, string> = {
  Lunas: "bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium",
  Diproses: "bg-amber-50 text-amber-700 border border-amber-200/60 font-medium",
  "Jatuh Tempo": "bg-rose-50 text-rose-700 border border-rose-200/60 font-medium",
};

function rowsFor(page: number): Row[] {
  return Array.from({ length: PER_PAGE }, (_, offset) => {
    const index = (page - 1) * PER_PAGE + offset;
    const seed = (index * 2654435761) >>> 0;
    const customer = CUSTOMERS[seed % CUSTOMERS.length] ?? "PT Sinar Abadi";
    const amount = 1500000 + ((seed >>> 8) % 38500000);
    const bucket = (seed >>> 20) % 10;
    const status: Status = bucket < 6 ? "Lunas" : bucket < 9 ? "Diproses" : "Jatuh Tempo";
    return { id: `INV-${10231 + index}`, customer, amount: formatRupiah(amount), status };
  });
}

// Data sampel Jurnal Umum
const JURNAL_ENTRIES = [
  { no: 'JU-001', date: '24 Nov 2026', account: '1-1001 Kas & Bank Usaha', ref: 'BKK-01', debit: 'Rp 45.000.000', credit: '-', type: 'D' },
  { no: '', date: '', account: '4-1001 Pendapatan Penjualan Template', ref: 'INV-1024', debit: '-', credit: 'Rp 45.000.000', type: 'K' },
  { no: 'JU-002', date: '24 Nov 2026', account: '5-1002 Beban Server & Operasional', ref: 'BKM-04', debit: 'Rp 4.500.000', credit: '-', type: 'D' },
  { no: '', date: '', account: '1-1001 Kas & Bank Usaha', ref: 'BKM-04', debit: '-', credit: 'Rp 4.500.000', type: 'K' },
  { no: 'JU-003', date: '25 Nov 2026', account: '1-1002 Piutang Usaha (B2B)', ref: 'INV-1025', debit: 'Rp 18.250.000', credit: '-', type: 'D' },
  { no: '', date: '', account: '4-1001 Pendapatan Penjualan Jasa', ref: 'INV-1025', debit: '-', credit: 'Rp 18.250.000', type: 'K' },
];

// Data sampel Laba & Rugi (P&L)
const PNL_ITEMS = {
  pendapatan: [
    { label: 'Penjualan Template Digital (Katalog)', amount: 'Rp 138.500.000' },
    { label: 'Pendapatan Layanan Konsultasi & Setup', amount: 'Rp 45.750.000' },
  ],
  hpp: [
    { label: 'Beban Lisensi Software & API AI', amount: 'Rp 14.800.000' },
    { label: 'Biaya Payment Gateway & Transaksi QRIS', amount: 'Rp 4.250.000' },
  ],
  beban: [
    { label: 'Beban Pemasaran & Iklan Digital', amount: 'Rp 22.350.000' },
    { label: 'Beban Operasional, Server & Cloud', amount: 'Rp 12.500.000' },
    { label: 'Beban Administrasi & Legal Usaha', amount: 'Rp 8.500.000' },
  ],
};

export default function Hero() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'jurnal' | 'labarugi'>('dashboard');
    const [page, setPage] = useState(1);
    const rows = rowsFor(page);
    const first = (page - 1) * PER_PAGE + 1;
    const last = Math.min(TOTAL, page * PER_PAGE);

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-[#fbfbfd] via-[#f5f5f7] to-[#ffffff] pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-32">
            {/* Subtle Apple Ambient Glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[900px] rounded-full bg-gradient-to-b from-emerald-100/40 via-sky-50/20 to-transparent blur-3xl"
            />

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
                {/* Apple Large Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-2 text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] text-[#1d1d1f] leading-[1.08]"
                >
                    Laporan Keuangan Rapi.
                    <br />
                    <span className="text-[#86868b]">Tanpa Rumus yang Rumit.</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mx-auto mt-6 max-w-2xl text-base sm:text-lg font-normal text-[#86868b] leading-relaxed tracking-[-0.01em]"
                >
                    Template siap pakai dengan formula otomatis standar akuntansi. Cukup input transaksi harian,
                    laporan laba rugi dan neraca keuangan tersaji instan dalam hitungan detik.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
                >
                    <a
                        href="#template-list"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('template-list')?.scrollIntoView({ behavior: 'smooth' });
                            window.history.pushState(null, '', '#template-list');
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#333336] hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span>Eksplor Katalog Template</span>
                        <ArrowRight className="h-4 w-4" />
                    </a>
                    <a
                        href="#cara-kerja"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('cara-kerja')?.scrollIntoView({ behavior: 'smooth' });
                            window.history.pushState(null, '', '#cara-kerja');
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-black/[0.1] bg-white/90 px-6 py-3.5 text-sm font-semibold text-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-200 hover:bg-neutral-50 hover:border-black/[0.15] active:scale-[0.98]"
                    >
                        <span>Cara Kerja</span>
                        <ChevronRight className="h-4 w-4 text-neutral-400" />
                    </a>
                </motion.div>

                {/* Apple Device Mockup Stage */}
                <motion.div
                    initial={{ opacity: 0, y: 32, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="relative mt-12 sm:mt-16 mx-auto max-w-5xl"
                >
                    {/* Main Showcase Device Canvas */}
                    <div className="overflow-hidden rounded-3xl border border-black/[0.08] bg-white shadow-[0_24px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-300">
                        {/* Interactive iOS-style Segmented Sheet Tabs */}
                        <div className="flex items-center gap-1 border-b border-black/[0.05] bg-[#fafafc] px-4 sm:px-6 py-2 overflow-x-auto text-xs">
                            <button
                                type="button"
                                onClick={() => setActiveTab('dashboard')}
                                className={`rounded-xl px-4 py-1.5 font-semibold transition ${
                                    activeTab === 'dashboard'
                                        ? 'bg-white text-neutral-900 shadow-xs border border-black/[0.06]'
                                        : 'text-neutral-500 hover:text-neutral-800'
                                }`}
                            >
                                Dashboard Eksekutif
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('jurnal')}
                                className={`rounded-xl px-4 py-1.5 font-semibold transition ${
                                    activeTab === 'jurnal'
                                        ? 'bg-white text-neutral-900 shadow-xs border border-black/[0.06]'
                                        : 'text-neutral-500 hover:text-neutral-800'
                                }`}
                            >
                                Jurnal Umum Otomatis
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('labarugi')}
                                className={`rounded-xl px-4 py-1.5 font-semibold transition ${
                                    activeTab === 'labarugi'
                                        ? 'bg-white text-neutral-900 shadow-xs border border-black/[0.06]'
                                        : 'text-neutral-500 hover:text-neutral-800'
                                }`}
                            >
                                Laba & Rugi (P&L)
                            </button>
                        </div>

                        {/* Content Area dengan Dynamic Tabs */}
                        <div className="p-5 sm:p-8 bg-[#ffffff] text-left min-h-[460px]">
                            <AnimatePresence mode="wait">
                                {activeTab === 'dashboard' && (
                                    <motion.div
                                        key="dashboard-tab"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        {/* KPI Metrics Row */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                            <div className="rounded-2xl border border-black/[0.06] bg-[#fbfbfd] p-4 transition hover:border-black/[0.12]">
                                                <span className="text-[11px] font-medium text-neutral-500 block">Total Pendapatan</span>
                                                <div className="mt-1 font-heading text-lg sm:text-2xl font-semibold tracking-tight text-neutral-900">
                                                    Rp 184.250.000
                                                </div>
                                                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                                    <TrendingUp className="h-3 w-3" /> +14.8% bln ini
                                                </span>
                                            </div>

                                            <div className="rounded-2xl border border-black/[0.06] bg-[#fbfbfd] p-4 transition hover:border-black/[0.12]">
                                                <span className="text-[11px] font-medium text-neutral-500 block">Total Pengeluaran</span>
                                                <div className="mt-1 font-heading text-lg sm:text-2xl font-semibold tracking-tight text-neutral-900">
                                                    Rp 62.400.000
                                                </div>
                                                <span className="mt-1 text-[11px] font-medium text-neutral-500">Efisiensi 94%</span>
                                            </div>

                                            <div className="rounded-2xl border border-black/[0.06] bg-[#fbfbfd] p-4 transition hover:border-black/[0.12]">
                                                <span className="text-[11px] font-medium text-neutral-500 block">Laba Bersih Usaha</span>
                                                <div className="mt-1 font-heading text-lg sm:text-2xl font-semibold tracking-tight text-emerald-700">
                                                    Rp 121.850.000
                                                </div>
                                                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                                    Margin 66.1%
                                                </span>
                                            </div>

                                            <div className="rounded-2xl border border-black/[0.06] bg-[#fbfbfd] p-4 transition hover:border-black/[0.12]">
                                                <span className="text-[11px] font-medium text-neutral-500 block">Saldo Kas & Bank</span>
                                                <div className="mt-1 font-heading text-lg sm:text-2xl font-semibold tracking-tight text-neutral-900">
                                                    Rp 98.500.000
                                                </div>
                                                <span className="mt-1 text-[11px] font-semibold text-sky-600">Likuiditas Sehat</span>
                                            </div>
                                        </div>

                                        {/* Invoices Table dengan ScrubPagination (Compact & Pendek) */}
                                        <div className="mt-5 mx-auto max-w-2xl overflow-hidden rounded-2xl bg-card text-card-foreground shadow-sm ring-1 ring-border">
                                            <header className="flex items-end justify-between gap-3 px-4 pt-3.5 pb-2.5 sm:px-5 sm:pt-4 border-b border-border/40">
                                                <div>
                                                    <h2 id="invoices-title" className="text-xs sm:text-sm font-semibold tracking-tight text-foreground">Faktur & Tagihan Usaha</h2>
                                                    <p className="mt-0.5 text-[11px] text-muted-foreground">{TOTAL.toLocaleString("id-ID")} faktur · {PER_PAGE} per halaman</p>
                                                </div>
                                                <p data-range className="text-[11px] tabular-nums text-muted-foreground">Menampilkan {first}–{last} dari {TOTAL.toLocaleString("id-ID")}</p>
                                            </header>
                                            <div className="px-2 sm:px-3">
                                                <div className="grid h-7 grid-cols-[82px_minmax(0,1fr)_100px_84px] items-center gap-2 border-b border-border px-3 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                                    <span>No. Faktur</span>
                                                    <span>Klien / Pembeli</span>
                                                    <span className="text-right">Nominal</span>
                                                    <span className="text-right">Status</span>
                                                </div>
                                                <div data-list className="divide-y divide-border/60">
                                                    {rows.map((row) => (
                                                        <div key={row.id} data-row className="grid h-9 grid-cols-[82px_minmax(0,1fr)_100px_84px] items-center gap-2 px-3 text-xs">
                                                            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{row.id}</span>
                                                            <span className="truncate font-medium text-foreground">{row.customer}</span>
                                                            <span className="text-right tabular-nums font-mono font-medium text-foreground">{row.amount}</span>
                                                            <span className="flex justify-end">
                                                                <span data-status={row.status} className={`inline-flex h-4.5 items-center rounded-full px-2 text-[10px] ${STATUS_CLASS[row.status]}`}>{row.status}</span>
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <footer className="border-t border-border px-4 py-3 sm:px-5 bg-background">
                                                <ScrubPagination
                                                    page={page}
                                                    pageCount={PAGE_COUNT}
                                                    siblingCount={1}
                                                    size="sm"
                                                    showTrack={true}
                                                    showSummary={true}
                                                    labels={{
                                                        previous: "Sebelumnya",
                                                        next: "Berikutnya",
                                                        pageOf: (p, c) => `Halaman ${p} / ${c}`,
                                                        valueText: (p, c) => `Halaman ${p} dari ${c}`,
                                                        page: (p) => `Halaman ${p}`,
                                                        jumpTo: "Loncat ke halaman",
                                                        scrub: "Geser halaman",
                                                        pagination: "Navigasi halaman",
                                                    }}
                                                    onPageChange={(next) => setPage(next)}
                                                    onScrub={(live) => setPage(live)}
                                                />
                                            </footer>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'jurnal' && (
                                    <motion.div
                                        key="jurnal-tab"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.25 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-black/[0.06] pb-3">
                                            <div>
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                                                    <Sparkles className="h-3 w-3 text-emerald-600" />
                                                    Double-entry Otomatis
                                                </span>
                                                <h3 className="mt-1 text-sm sm:text-base font-semibold text-[#1d1d1f]">Buku Jurnal Umum (General Journal)</h3>
                                                <p className="text-xs text-[#86868b]">Setiap transaksi langsung otomatis terposting ke buku besar & neraca saldo.</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="rounded-lg bg-neutral-100 px-3 py-1 font-mono font-semibold text-[#1d1d1f]">
                                                    Status: <span className="text-emerald-700">BALANCE ✓</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-2xs">
                                            <div className="grid grid-cols-12 bg-neutral-50 border-b border-black/[0.06] px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">
                                                <span className="col-span-2">No. Bukti / Tgl</span>
                                                <span className="col-span-5">Nama Akun & Keterangan</span>
                                                <span className="col-span-1 text-center">Ref</span>
                                                <span className="col-span-2 text-right">Debit (Rp)</span>
                                                <span className="col-span-2 text-right">Kredit (Rp)</span>
                                            </div>
                                            <div className="divide-y divide-black/[0.04] text-xs">
                                                {JURNAL_ENTRIES.map((entry, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`grid grid-cols-12 items-center px-4 py-2.5 transition hover:bg-neutral-50/70 ${
                                                            entry.type === 'K' ? 'bg-[#fbfbfd]/40' : ''
                                                        }`}
                                                    >
                                                        <div className="col-span-2 font-mono text-[11px] text-[#86868b]">
                                                            {entry.no && <div className="font-semibold text-[#1d1d1f]">{entry.no}</div>}
                                                            {entry.date && <div>{entry.date}</div>}
                                                        </div>
                                                        <div className={`col-span-5 ${entry.type === 'K' ? 'pl-5 font-normal text-neutral-600' : 'font-semibold text-[#1d1d1f]'}`}>
                                                            {entry.account}
                                                        </div>
                                                        <div className="col-span-1 text-center font-mono text-[11px] text-[#86868b]">
                                                            {entry.ref}
                                                        </div>
                                                        <div className="col-span-2 text-right font-mono font-medium text-[#1d1d1f]">
                                                            {entry.debit}
                                                        </div>
                                                        <div className="col-span-2 text-right font-mono font-medium text-[#1d1d1f]">
                                                            {entry.credit}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-12 items-center bg-emerald-50/70 border-t border-emerald-200/80 px-4 py-3 text-xs font-semibold text-emerald-900">
                                                <span className="col-span-8">TOTAL AKUMULASI (SEIMBANG)</span>
                                                <span className="col-span-2 text-right font-mono font-bold">Rp 67.750.000</span>
                                                <span className="col-span-2 text-right font-mono font-bold">Rp 67.750.000</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'labarugi' && (
                                    <motion.div
                                        key="labarugi-tab"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.25 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-black/[0.06] pb-3">
                                            <div>
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                                    Standar SAK EMKM
                                                </span>
                                                <h3 className="mt-1 text-sm sm:text-base font-semibold text-[#1d1d1f]">Laporan Laba & Rugi Komprehensif</h3>
                                                <p className="text-xs text-[#86868b]">Periode berjalan 1 – 30 November 2026 (Dihitung Real-time dari Jurnal)</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[11px] text-[#86868b] block">Laba Bersih Akhir:</span>
                                                <span className="text-base sm:text-lg font-bold font-mono text-emerald-700">Rp 121.850.000</span>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-black/[0.08] bg-white p-4 sm:p-5 shadow-2xs space-y-4 text-xs">
                                            {/* Bagian Pendapatan */}
                                            <div>
                                                <div className="flex items-center justify-between pb-1.5 border-b border-black/[0.06] font-semibold text-[#1d1d1f]">
                                                    <span className="text-emerald-800">1. PENDAPATAN USAHA (REVENUE)</span>
                                                    <span className="font-mono text-emerald-800">Rp 184.250.000</span>
                                                </div>
                                                <div className="divide-y divide-black/[0.03] pt-1">
                                                    {PNL_ITEMS.pendapatan.map((item, i) => (
                                                        <div key={i} className="flex items-center justify-between py-1.5 text-[#86868b] pl-3">
                                                            <span>• {item.label}</span>
                                                            <span className="font-mono text-[#1d1d1f]">{item.amount}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Bagian HPP */}
                                            <div>
                                                <div className="flex items-center justify-between pb-1.5 border-b border-black/[0.06] font-semibold text-[#1d1d1f]">
                                                    <span className="text-neutral-700">2. HARGA POKOK PENJUALAN (HPP)</span>
                                                    <span className="font-mono text-neutral-700">(Rp 19.050.000)</span>
                                                </div>
                                                <div className="divide-y divide-black/[0.03] pt-1">
                                                    {PNL_ITEMS.hpp.map((item, i) => (
                                                        <div key={i} className="flex items-center justify-between py-1.5 text-[#86868b] pl-3">
                                                            <span>• {item.label}</span>
                                                            <span className="font-mono text-[#1d1d1f]">{item.amount}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Laba Kotor */}
                                            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-neutral-50 font-semibold text-[#1d1d1f]">
                                                <span>LABA KOTOR (GROSS PROFIT)</span>
                                                <span className="font-mono text-emerald-700">Rp 165.200.000</span>
                                            </div>

                                            {/* Bagian Beban Operasional */}
                                            <div>
                                                <div className="flex items-center justify-between pb-1.5 border-b border-black/[0.06] font-semibold text-[#1d1d1f]">
                                                    <span className="text-rose-800">3. BEBAN OPERASIONAL (EXPENSES)</span>
                                                    <span className="font-mono text-rose-800">(Rp 43.350.000)</span>
                                                </div>
                                                <div className="divide-y divide-black/[0.03] pt-1">
                                                    {PNL_ITEMS.beban.map((item, i) => (
                                                        <div key={i} className="flex items-center justify-between py-1.5 text-[#86868b] pl-3">
                                                            <span>• {item.label}</span>
                                                            <span className="font-mono text-[#1d1d1f]">{item.amount}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Laba Bersih */}
                                            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 font-bold text-emerald-950 text-sm">
                                                <span>LABA BERSIH USAHA (NET PROFIT)</span>
                                                <span className="font-mono text-emerald-700 text-base">Rp 121.850.000</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

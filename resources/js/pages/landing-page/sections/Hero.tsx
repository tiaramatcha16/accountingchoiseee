import { Link } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

type SheetTab = 'laba-rugi' | 'neraca' | 'arus-kas';

interface SheetRow {
    account: string;
    type: string;
    total: string;
}

interface SheetInfo {
    tabName: string;
    fileName: string;
    formula: string;
    rows: SheetRow[];
    result: {
        label: string;
        total: string;
    };
}

const SHEET_DATA: Record<SheetTab, SheetInfo> = {
    'laba-rugi': {
        tabName: 'Laba Rugi',
        fileName: 'laporan-keuangan-umkm.xlsx',
        formula: '=D1-D2-D3',
        rows: [
            { account: 'Omzet Penjualan', type: 'Pemasukan', total: 'Rp 65,4 jt' },
            { account: 'HPP & Biaya', type: 'Pengeluaran', total: 'Rp 46,6 jt' },
        ],
        result: { label: 'LABA BERSIH', total: 'Rp 18,8 jt' },
    },
    neraca: {
        tabName: 'Neraca',
        fileName: 'neraca-usaha.xlsx',
        formula: '=C1-C2',
        rows: [
            { account: 'Total Aset', type: 'Aktiva', total: 'Rp 128,5 jt' },
            { account: 'Kewajiban', type: 'Utang', total: 'Rp 35,2 jt' },
        ],
        result: { label: 'EKUITAS / MODAL', total: 'Rp 93,3 jt' },
    },
    'arus-kas': {
        tabName: 'Arus Kas',
        fileName: 'arus-kas-usaha.xlsx',
        formula: '=C1-C2',
        rows: [
            { account: 'Kas Masuk', type: 'Pemasukan', total: 'Rp 52,8 jt' },
            { account: 'Kas Keluar', type: 'Pengeluaran', total: 'Rp 31,4 jt' },
        ],
        result: { label: 'KAS BERSIH', total: 'Rp 21,4 jt' },
    },
};

const tabs: SheetTab[] = ['laba-rugi', 'neraca', 'arus-kas'];

export default function Hero() {
    const [activeTab, setActiveTab] = useState<SheetTab>('laba-rugi');
    const sheet = SHEET_DATA[activeTab];

    return (
        <section id="hero" className="bg-brand-surface relative isolate overflow-hidden">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute top-12 -left-40 h-96 w-96 rounded-full bg-emerald-300/25 blur-[100px]" />
                <div className="absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-amber-200/30 blur-[110px]" />
            </div>

            <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:py-16">
                <div className="relative z-20">
                    <span className="border-brand-primary/15 text-brand-primary mb-5 inline-flex items-center gap-2 rounded-full border bg-white/80 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.12em] uppercase shadow-sm">
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        Pasar Template Excel Indonesia
                    </span>
                    <h1 className="font-heading text-brand-deep max-w-2xl text-4xl leading-[1.06] font-extrabold tracking-tight sm:text-5xl lg:text-[3.6rem]">
                        Kelola keuangan usaha
                        <span className="text-brand-primary mt-1 block">lebih rapi, tanpa ribet.</span>
                    </h1>
                    <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                        Temukan template Excel untuk pencatatan transaksi, stok, arus kas, pajak, dan kebutuhan usaha lainnya. Pesanan yang sudah
                        lunas dapat diunduh melalui akunmu.
                    </p>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/#template-list"
                            className="bg-brand-primary shadow-brand-primary/20 hover:bg-brand-primary-dark inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
                        >
                            Jelajahi Template
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs font-medium text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                            <BadgeCheck className="text-brand-primary h-4 w-4" />
                            File Excel digital
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <ShieldCheck className="text-brand-primary h-4 w-4" />
                            Unduh setelah pembayaran terverifikasi
                        </span>
                    </div>
                </div>

                <div className="relative mx-auto w-full max-w-xl">
                    <div className="relative min-h-[390px] sm:min-h-[480px]">
                        <img
                            src="/images/mascot_hero.png?v=3"
                            alt="Maskot AccountingChoice"
                            className="absolute right-0 bottom-0 z-10 max-h-[390px] w-[67%] object-contain object-bottom drop-shadow-[0_24px_36px_rgba(0,0,0,0.2)] sm:max-h-[470px] sm:w-[70%]"
                        />

                        <div className="absolute top-5 left-0 z-20 w-[min(94%,370px)] rounded-2xl border border-white/80 bg-white p-3.5 shadow-[0_24px_60px_-28px_rgba(2,36,26,0.45)] sm:top-8 sm:left-2 sm:p-4">
                            <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <span className="text-brand-excel flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                                        <FileSpreadsheet className="h-5 w-5" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-[10px] font-bold tracking-wide text-slate-400 uppercase">Pratinjau Template</p>
                                        <p className="truncate font-mono text-xs font-bold text-slate-800">{sheet.fileName}</p>
                                    </div>
                                </div>
                                <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">Contoh</span>
                            </div>

                            <div className="mb-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 font-mono text-[10px]">
                                <span className="font-bold text-slate-400">fx</span>
                                <span className="text-brand-primary truncate">{sheet.formula}</span>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-slate-50 px-3 py-2 text-[9px] font-bold tracking-wide text-slate-400 uppercase">
                                    <span>Rincian</span>
                                    <span>Jenis</span>
                                    <span className="text-right">Total</span>
                                </div>
                                {sheet.rows.map((row) => (
                                    <div
                                        key={row.account}
                                        className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-t border-slate-100 px-3 py-2.5 text-[10px]"
                                    >
                                        <span className="truncate font-medium text-slate-700">{row.account}</span>
                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] text-slate-500">{row.type}</span>
                                        <span className="text-right font-mono font-semibold text-slate-700">{row.total}</span>
                                    </div>
                                ))}
                                <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-emerald-200 bg-emerald-50 px-3 py-3">
                                    <span className="text-[9px] font-extrabold tracking-wide text-emerald-800">{sheet.result.label}</span>
                                    <span className="text-brand-primary font-mono text-xs font-extrabold">{sheet.result.total}</span>
                                </div>
                            </div>

                            <div aria-label="Pilih pratinjau lembar kerja" className="mt-3 flex flex-wrap gap-1.5">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        aria-pressed={activeTab === tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition ${
                                            activeTab === tab ? 'bg-brand-primary text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                        }`}
                                    >
                                        {SHEET_DATA[tab].tabName}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

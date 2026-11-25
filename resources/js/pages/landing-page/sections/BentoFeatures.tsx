import { Check, CheckCircle2, FileSpreadsheet, FolderSync, ShieldCheck, Tag } from 'lucide-react';
import { SlowMonoGradient } from '@/components/ui/slow-mono-gradient';

export default function BentoFeatures() {
    return (
        <SlowMonoGradient className="scroll-mt-20 py-16 sm:py-24 font-sans">
            <section id="fitur" className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-14">
                    <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.035em] text-white leading-tight">
                        Didesain untuk Efisiensi.
                        <br />
                        <span className="text-white/60">Dibuat untuk Pebisnis.</span>
                    </h2>
                    <p className="mt-3.5 text-sm sm:text-base font-normal text-white/70 leading-relaxed max-w-xl mx-auto tracking-[-0.01em]">
                        Kami menyederhanakan siklus akuntansi yang rumit menjadi alur kerja spreadsheet yang rapi, cepat, dan otomatis.
                    </p>
                </div>

                {/* 4 Compact Cards: Clean typography, pure accounting icons, subtle emerald touch */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
                    {/* Card 1: Google Drive */}
                    <div className="md:col-span-7 flex flex-col justify-between rounded-2xl border border-white/10 bg-white p-5 sm:p-6 shadow-sm">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
                                    <FolderSync className="h-4 w-4" />
                                </span>
                                <span className="text-[11px] font-semibold tracking-wide text-emerald-800 uppercase">
                                    Integrasi Google Drive
                                </span>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold tracking-[-0.015em] text-[#1d1d1f]">
                                Salinan Otomatis Langsung ke Drive Akun Anda
                            </h3>
                            <p className="mt-1 text-xs text-[#86868b] leading-relaxed max-w-md">
                                Begitu pembayaran terverifikasi, sistem otomatis membuat salinan spreadsheet baru di Google Drive menggunakan email Anda tanpa perlu download manual.
                            </p>
                        </div>

                        {/* Interactive UI Mock in Card */}
                        <div className="mt-4 rounded-xl border border-black/[0.06] bg-[#fbfbfd] p-3">
                            <div className="flex items-center justify-between text-[11px] font-medium text-neutral-600">
                                <span className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                    <span>Google Drive Delivery Status</span>
                                </span>
                                <span className="font-mono text-emerald-800 font-semibold text-[11px]">Terkirim Seketika</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between rounded-lg bg-white p-2 border border-black/[0.04]">
                                <div className="flex items-center gap-2">
                                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                                    <span className="text-xs font-medium text-neutral-800 truncate">Laporan-Keuangan-Order.xlsx</span>
                                </div>
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200/50 shrink-0">
                                    Akses Editor
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Rumus Otomatis */}
                    <div className="md:col-span-5 flex flex-col justify-between rounded-2xl border border-white/10 bg-white p-5 sm:p-6 shadow-sm">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
                                    <FileSpreadsheet className="h-4 w-4" />
                                </span>
                                <span className="text-[11px] font-semibold tracking-wide text-emerald-800 uppercase">
                                    Formula Akuntansi
                                </span>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold tracking-[-0.015em] text-[#1d1d1f]">
                                100% Rumus Otomatis
                            </h3>
                            <p className="mt-1 text-xs text-[#86868b] leading-relaxed">
                                Cukup catat transaksi harian. Jurnal Umum, Buku Besar, Neraca Saldo, dan Laba Rugi terisi otomatis.
                            </p>
                        </div>

                        <div className="mt-4 space-y-1.5 text-xs pt-1">
                            <div className="flex items-center gap-2 text-neutral-700 font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                                <span className="text-[11px]">Formula Akuntansi Standar IAI</span>
                            </div>
                            <div className="flex items-center gap-2 text-neutral-700 font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                                <span className="text-[11px]">Deteksi Selisih & Balance Check</span>
                            </div>
                            <div className="flex items-center gap-2 text-neutral-700 font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                                <span className="text-[11px]">Grafik Ringkasan Laba Bulanan</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Keamanan & Akses */}
                    <div className="md:col-span-5 rounded-2xl border border-white/10 bg-white p-5 sm:p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
                                <ShieldCheck className="h-4 w-4" />
                            </span>
                            <span className="text-[11px] font-semibold tracking-wide text-emerald-800 uppercase">
                                Privasi & Keamanan
                            </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold tracking-[-0.015em] text-[#1d1d1f]">
                            Akses Eksklusif Email Anda
                        </h3>
                        <p className="mt-1 text-xs text-[#86868b] leading-relaxed">
                            File master asli toko tetap terlindungi. Salinan yang Anda terima adalah berkas mandiri milik Anda seutuhnya di Google Drive Anda.
                        </p>
                    </div>

                    {/* Card 4: Sekali Beli */}
                    <div className="md:col-span-7 rounded-2xl border border-white/10 bg-white p-5 sm:p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
                                <Tag className="h-4 w-4" />
                            </span>
                            <span className="text-[11px] font-semibold tracking-wide text-emerald-800 uppercase">
                                Sekali Beli
                            </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold tracking-[-0.015em] text-[#1d1d1f]">
                            Bebas Biaya Langganan Selamanya
                        </h3>
                        <p className="mt-1 text-xs text-[#86868b] leading-relaxed max-w-md">
                            Tidak ada tagihan bulanan atau tahunan. Setelah transaksi, spreadsheet menjadi aset permanen bisnis Anda dan dapat dipakai tanpa batas waktu.
                        </p>
                    </div>
                </div>
            </section>
        </SlowMonoGradient>
    );
}

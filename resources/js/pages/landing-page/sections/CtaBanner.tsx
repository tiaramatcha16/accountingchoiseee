import { ArrowRight } from 'lucide-react';

export default function CtaBanner() {
    return (
        <section className="bg-[#f5f5f7] py-16 sm:py-24">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl bg-[#1d1d1f] p-8 sm:p-14 text-center text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
                    {/* Background glow */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-emerald-500/20 blur-3xl"
                    />

                    <div className="relative z-10 mx-auto max-w-2xl">
                        <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.035em] text-white leading-tight">
                            Rapikan Laporan Keuangan Bisnis Anda Hari Ini
                        </h2>
                        <p className="mt-4 text-sm sm:text-base text-neutral-400 leading-relaxed">
                            Pilih template terbaik, selesaikan pembayaran QRIS instan, dan buka spreadsheet otomatis langsung di Google Drive Anda.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <a
                                href="#template-list"
                                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#1d1d1f] shadow-sm transition-all duration-200 hover:bg-neutral-100 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span>Pilih Template Sekarang</span>
                                <ArrowRight className="h-4 w-4" />
                            </a>
                            <a
                                href="#faq"
                                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10 active:scale-[0.98]"
                            >
                                <span>Ada Pertanyaan?</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

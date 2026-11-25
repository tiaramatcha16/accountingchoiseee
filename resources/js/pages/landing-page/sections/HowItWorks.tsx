import { CheckCircle2, CreditCard, FileSpreadsheet } from 'lucide-react';

const steps = [
    {
        num: '01',
        title: 'Pilih Template',
        desc: 'Pilih spreadsheet akuntansi atau keuangan yang sesuai dengan kebutuhan bisnis atau pribadi Anda.',
        icon: FileSpreadsheet,
    },
    {
        num: '02',
        title: 'Bayar Cepat via QRIS',
        desc: 'Masukkan alamat email penerima dan lakukan pembayaran aman dalam hitungan detik melalui Midtrans QRIS.',
        icon: CreditCard,
    },
    {
        num: '03',
        title: 'Langsung di Google Drive',
        desc: 'Sistem otomatis menduplikasi file master ke Google Drive Anda dengan hak edit penuh siap pakai.',
        icon: CheckCircle2,
    },
];

export default function HowItWorks() {
    return (
        <section id="cara-kerja" className="scroll-mt-20 bg-[#ffffff] py-20 sm:py-28 border-t border-black/[0.06]">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.035em] text-[#1d1d1f]">
                        Hanya 3 Langkah Mudah
                    </h2>
                    <p className="mt-3 text-base text-[#86868b]">
                        Proses otomatis tanpa repot konfirmasi manual. File Anda langsung aktif seketika.
                    </p>
                </div>

                {/* 3 Steps Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {steps.map((step) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.num}
                                className="relative rounded-3xl border border-black/[0.06] bg-[#fbfbfd] p-8 transition-all duration-300 hover:border-black/[0.12] hover:shadow-[0_12px_32px_rgba(0,0,0,0.04)]"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <span className="font-mono text-xs font-bold text-neutral-400">
                                        LANGKAH {step.num}
                                    </span>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-black/[0.06] text-neutral-900 shadow-2xs">
                                        <Icon className="h-5 w-5 text-emerald-600" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-semibold tracking-[-0.015em] text-[#1d1d1f]">
                                    {step.title}
                                </h3>
                                <p className="mt-3 text-sm text-[#86868b] leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CreditCard, Download, FileSpreadsheet, ShoppingBag, Zap } from 'lucide-react';

const steps = [
    {
        num: '01',
        title: 'Temukan template yang sesuai',
        tag: 'Jelajahi katalog',
        description: 'Baca detail template dan pilih file Excel sesuai kebutuhan usaha atau keuanganmu.',
        icon: FileSpreadsheet,
        iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 group-hover:bg-emerald-600 group-hover:text-white',
        badgeClass: 'border-emerald-200 bg-emerald-50/80 text-emerald-800',
    },
    {
        num: '02',
        title: 'Masukkan ke keranjang',
        tag: 'Perlu masuk akun',
        description: 'Masuk atau buat akun, lalu tambahkan template yang kamu pilih ke keranjang.',
        icon: ShoppingBag,
        iconBg: 'bg-teal-50 text-teal-700 border-teal-200/80 group-hover:bg-teal-600 group-hover:text-white',
        badgeClass: 'border-teal-200 bg-teal-50/80 text-teal-800',
    },
    {
        num: '03',
        title: 'Isi data dan bayar dengan QRIS',
        tag: 'Midtrans',
        description: 'Masukkan nama, nomor HP, dan email aktif, lalu selesaikan pembayaran melalui halaman Midtrans.',
        icon: CreditCard,
        iconBg: 'bg-amber-50 text-amber-700 border-amber-200/80 group-hover:bg-amber-600 group-hover:text-white',
        badgeClass: 'border-amber-200 bg-amber-50/80 text-amber-800',
    },
    {
        num: '04',
        title: 'Terima template melalui email',
        tag: 'Email & Pesanan Saya',
        description: 'Setelah pembayaran berhasil, file dikirim ke email aktif dan tetap tersedia di halaman Pesanan Saya.',
        icon: Download,
        iconBg: 'bg-emerald-50 text-brand-primary border-emerald-300/80 group-hover:bg-brand-primary group-hover:text-white',
        badgeClass: 'border-brand-primary/20 bg-brand-primary/10 text-brand-primary font-bold',
    },
];

export default function HowItWorks() {
    return (
        <div className="space-y-6 lg:col-span-5">
            <div>
                <div className="border-brand-primary/20 bg-brand-primary/5 text-brand-primary mb-3 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold tracking-wider uppercase shadow-2xs">
                    <Zap className="text-brand-primary h-3.5 w-3.5" />
                    <span>CARA BERBELANJA</span>
                </div>
                <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                    Beli template dalam <span className="text-brand-primary">4 langkah</span>
                </h2>
                <p className="mt-2 text-sm leading-relaxed font-normal text-slate-600 sm:text-base">
                    Pembayaran QRIS diproses oleh Midtrans. File dikirim ke email setelah pembayaran berhasil.
                </p>
            </div>

            <div className="relative space-y-3 pt-1">
                {/* Visual timeline connector line on desktop */}
                <div className="to-brand-primary/40 absolute top-6 bottom-6 left-[29px] hidden w-0.5 bg-gradient-to-b from-emerald-500/40 via-teal-500/30 sm:block" />

                {steps.map((step) => {
                    const StepIcon = step.icon;
                    return (
                        <Card
                            key={step.num}
                            className="group hover:border-brand-primary/40 hover:shadow-brand-primary/5 relative flex items-start gap-4 rounded-2xl border-slate-200/90 bg-white p-4 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                        >
                            {/* Step Icon & Number Badge */}
                            <div className="relative z-10 shrink-0">
                                <div
                                    className={`relative flex h-12 w-12 items-center justify-center rounded-xl border shadow-2xs transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${step.iconBg}`}
                                >
                                    <StepIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                                    <span className="font-heading bg-brand-primary absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold text-white shadow-xs transition-colors group-hover:bg-slate-900">
                                        {step.num}
                                    </span>
                                </div>
                            </div>

                            {/* Step Content */}
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-1.5">
                                    <h4 className="font-heading group-hover:text-brand-primary text-sm font-bold text-slate-900 transition-colors sm:text-base">
                                        {step.title}
                                    </h4>
                                    <Badge variant="outline" className={`text-[10px] font-semibold ${step.badgeClass}`}>
                                        {step.tag}
                                    </Badge>
                                </div>
                                <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-xs">{step.description}</p>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

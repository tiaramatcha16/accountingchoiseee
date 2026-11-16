import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, ChevronDown, FileSpreadsheet, HelpCircle, MessageCircle, Store } from 'lucide-react';
import { useState } from 'react';

const questions = [
    {
        icon: FileSpreadsheet,
        tag: 'File Digital',
        question: 'File apa yang saya dapatkan setelah membeli?',
        answer: (
            <>
                Produk berupa file spreadsheet digital. Format file, seperti <span className="font-semibold text-slate-900">.xlsx atau .xls</span>,
                tercantum pada detail masing-masing template.
            </>
        ),
    },
    {
        icon: CheckCircle2,
        tag: 'Unduhan',
        question: 'Kapan saya bisa mengunduh template?',
        answer: (
            <>
                Setelah pembayaran QRIS berhasil, file dikirim ke email checkout. Tombol unduh juga tersedia pada halaman{' '}
                <span className="font-semibold text-slate-900">Pesanan Saya</span>.
            </>
        ),
    },
    {
        icon: CheckCircle2,
        tag: 'Pembayaran',
        question: 'Bagaimana cara membayar dengan QRIS?',
        answer: 'Isi data penerima, lalu pilih Lanjutkan ke pembayaran QRIS. Midtrans menampilkan QR untuk dipindai dan memperbarui status pesanan otomatis setelah pembayaran berhasil.',
    },
    {
        icon: Store,
        tag: 'Penjual',
        question: 'Bagaimana cara menjual template di AccountingChoice?',
        answer: 'Masuk ke akun, ajukan diri sebagai penjual, lalu tunggu pemeriksaan admin. Setelah disetujui, kamu dapat mengunggah file Excel untuk ditinjau sebelum ditampilkan di katalog.',
    },
];

export default function Faq() {
    const [openQuestion, setOpenQuestion] = useState<number | null>(0);

    return (
        <div id="faq" className="space-y-6 lg:col-span-7">
            <div>
                <div className="border-brand-primary/20 bg-brand-primary/5 text-brand-primary mb-3 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold tracking-wider uppercase shadow-2xs">
                    <HelpCircle className="text-brand-primary h-3.5 w-3.5" />
                    <span>PERTANYAAN UMUM</span>
                </div>
                <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                    Pertanyaan yang <span className="text-brand-primary">Sering</span> Ditanyakan
                </h2>
                <p className="mt-2 text-sm leading-relaxed font-normal text-slate-600 sm:text-base">
                    Informasi seputar format file, pembayaran, unduhan, dan penjualan template.
                </p>
            </div>

            <div className="space-y-3 pt-1">
                {questions.map(({ icon: QuestionIcon, tag, question, answer }, index) => {
                    const isOpen = openQuestion === index;

                    return (
                        <Card
                            key={question}
                            className={`group overflow-hidden rounded-2xl border transition-all duration-300 ${
                                isOpen
                                    ? 'border-brand-primary/40 shadow-brand-primary/5 ring-brand-primary/20 bg-white shadow-md ring-1'
                                    : 'border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 hover:shadow-xs'
                            }`}
                        >
                            <button
                                aria-expanded={isOpen}
                                className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
                                onClick={() => setOpenQuestion(isOpen ? null : index)}
                                type="button"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200 ${
                                            isOpen
                                                ? 'text-brand-primary border-emerald-200 bg-emerald-50'
                                                : 'group-hover:text-brand-primary border-slate-200 bg-slate-50 text-slate-500'
                                        }`}
                                    >
                                        <QuestionIcon className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                                        <span className="font-heading group-hover:text-brand-primary text-sm font-bold text-slate-900 transition-colors sm:text-base">
                                            {question}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="hidden border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-600 sm:inline-flex"
                                    >
                                        {tag}
                                    </Badge>
                                    <div
                                        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
                                            isOpen
                                                ? 'bg-brand-primary rotate-180 text-white shadow-xs'
                                                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                                        }`}
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>
                            </button>
                            {isOpen && (
                                <div className="border-t border-slate-100 bg-slate-50/50 px-5 pt-3 pb-4 text-xs leading-relaxed text-slate-600 sm:px-6 sm:text-sm">
                                    {answer}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Bottom support banner */}
            <Card className="rounded-2xl border-emerald-200/80 bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/40 p-4 shadow-2xs sm:p-5">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
                            <MessageCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <h5 className="font-heading text-xs font-bold text-slate-900 sm:text-sm">
                                Masih punya pertanyaan lain seputar template?
                            </h5>
                            <p className="text-[11px] text-slate-600 sm:text-xs">
                                Kirim pertanyaan dan lanjutkan percakapan dengan admin langsung di akun Anda.
                            </p>
                        </div>
                    </div>
                    <Button
                        asChild
                        size="sm"
                        className="shrink-0 rounded-xl bg-emerald-700 font-semibold text-white shadow-xs transition-transform duration-200 hover:scale-[1.02] hover:bg-emerald-800"
                    >
                        <Link href="/chat" className="inline-flex items-center gap-1.5">
                            <span>Chat dengan Admin</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </div>
            </Card>
        </div>
    );
}

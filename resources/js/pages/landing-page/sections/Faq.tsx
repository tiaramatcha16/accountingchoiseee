import { useState } from 'react';

import { Icon } from '../../../components/landing-page/brand-icon';

const questions = [
    {
        question: 'Apakah template ini bisa diunduh ke Microsoft Excel (.xlsx)?',
        answer: (
            <>
                Tentu saja bisa! Anda cukup klik <span className="font-bold text-black">File &gt; Download &gt; Microsoft Excel (.xlsx)</span> di Google Sheets. Seluruh rumus, formatting, dan tabel otomatis akan berfungsi mulus tanpa kendala.
            </>
        ),
    },
    {
        question: 'Apakah saya perlu membayar langganan bulanan?',
        answer: (
            <>
                Tidak ada biaya bulanan sama sekali. Semua template di AccountingChoice berbasis{' '}
                <span className="font-bold text-brand-primary">Sekali Bayar untuk Akses Seumur Hidup (Lifetime Access)</span>{' '}
                termasuk pembaruan rumus versi baru.
            </>
        ),
    },
    {
        question: 'Bagaimana jika rumus formula tidak sengaja terhapus?',
        answer:
            'Seluruh sel perhitungan utama telah diproteksi (locked cells) agar aman dari kekeliruan pengeditan. Selain itu, Anda bebas menduplikasi master file kapan pun untuk membuat lembar baru yang bersih.',
    },
    {
        question: 'Apakah ada panduan penggunaan atau bantuan customer service?',
        answer:
            'Ya, setiap paket dilengkapi instruksi langkah demi langkah di tab pertama, plus Anda mendapatkan dukungan konsultasi tim melalui WhatsApp jika mengalami kesulitan input data.',
    },
];

export default function Faq() {
    const [openQuestion, setOpenQuestion] = useState<number | null>(0);

    return (
        <div id="faq" className="space-y-6 lg:col-span-7">
            <div>
                <span className="spark-badge mb-3">
                    <Icon name="help-circle" className="h-3.5 w-3.5 text-brand-primary" />
                    Frequently Asked Questions
                </span>
                <h2 className="font-heading text-3xl leading-snug font-extrabold tracking-tight text-black">
                    Pertanyaan yang <span className="highlight-pill text-2xl font-bold">Sering</span> Diajukan
                </h2>
                <p className="mt-2 text-sm leading-relaxed font-normal text-black/60">
                    Segala informasi tentang kompatibilitas spreadsheet, hak lisensi, dan garansi rumus.
                </p>
            </div>

            <div className="space-y-3.5 pt-1">
                {questions.map(({ question, answer }, index) => {
                    const isOpen = openQuestion === index;

                    return (
                        <div key={question} className="soft-card-shadow overflow-hidden rounded-2xl border border-black/[0.08] bg-white">
                            <button
                                aria-expanded={isOpen}
                                className="font-heading flex w-full items-center justify-between gap-4 px-6 py-4.5 text-left text-sm font-bold text-black transition hover:text-brand-primary"
                                onClick={() => setOpenQuestion(isOpen ? null : index)}
                                type="button"
                            >
                                <span>{question}</span>
                                <Icon
                                    name="chevron-down"
                                    className={`h-4 w-4 text-black/40 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {isOpen && (
                                <div className="border-t border-black/[0.06] px-6 pt-3.5 pb-4.5 text-xs leading-relaxed font-normal text-black/65">
                                    {answer}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="pt-2">
                <a
                    className="group font-heading flex items-center gap-2 text-xs font-bold text-brand-primary hover:underline"
                    href="https://wa.me/6282264951711"
                    rel="noreferrer"
                    target="_blank"
                >
                    <span>Punya pertanyaan lain? Hubungi Tim Dukungan Kami</span>
                    <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </a>
            </div>
        </div>
    );
}

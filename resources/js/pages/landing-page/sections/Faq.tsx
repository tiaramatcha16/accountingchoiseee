import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const faqs = [
    {
        q: 'Bagaimana cara template dikirimkan ke saya?',
        a: 'Setelah pembayaran QRIS terkonfirmasi otomatis oleh Midtrans, sistem backend kami langsung menduplikasi template master ke Google Drive dan membagikan hak edit ke alamat email penerima yang Anda masukkan saat checkout. Anda juga dapat langsung membukanya di halaman Pesanan Saya.',
    },
    {
        q: 'Apakah saya bisa menggunakan template ini di Microsoft Excel?',
        a: 'Tentu. Anda dapat membuka salinan template di Google Sheets, atau mengunduhnya dalam format .xlsx standar untuk digunakan secara offline di Microsoft Excel 2016, 2019, 2021, maupun Microsoft 365.',
    },
    {
        q: 'Apakah saya perlu menguasai rumus akuntansi yang rumit?',
        a: 'Sama sekali tidak. Seluruh rumus (SUM, VLOOKUP/XLOOKUP, IF, INDEX/MATCH, perhitungan laba rugi, dan neraca saldo) sudah terpasang dan saling terhubung otomatis. Anda hanya perlu menginput transaksi harian pada tabel yang telah disediakan.',
    },
    {
        q: 'Apakah ada biaya langganan bulanan atau tahunan?',
        a: 'Tidak ada sama sekali. Model lisensi kami adalah sekali bayar untuk kepemilikan seumur hidup (lifetime access). Tidak ada tagihan berulang atau biaya tersembunyi.',
    },
    {
        q: 'Bagaimana jika saya memerlukan bantuan saat menggunakan template?',
        a: 'Setiap pesanan dilengkapi dengan petunjuk penggunaan template yang jelas di halaman Pesanan Saya, serta tutorial penggunaan. Tim customer support kami juga siap membantu Anda melalui WhatsApp.',
    },
];

export default function Faq() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="scroll-mt-20 bg-[#ffffff] py-20 sm:py-28 border-t border-black/[0.06]">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.035em] text-[#1d1d1f]">
                        Pertanyaan yang Sering Diajukan
                    </h2>
                    <p className="mt-3 text-base text-[#86868b]">
                        Hal-hal penting seputar pengiriman file, lisensi, dan penggunaan template.
                    </p>
                </div>

                {/* Apple Accordion */}
                <div className="divide-y divide-black/[0.06] border-y border-black/[0.06]">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div key={faq.q} className="py-6">
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="flex w-full items-center justify-between gap-4 text-left font-semibold text-base sm:text-lg text-[#1d1d1f] transition hover:text-emerald-700"
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown
                                        className={`h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-300 ${
                                            isOpen ? 'rotate-180 text-neutral-900' : ''
                                        }`}
                                    />
                                </button>
                                {isOpen && (
                                    <div className="mt-3 text-sm text-[#86868b] leading-relaxed pr-8">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

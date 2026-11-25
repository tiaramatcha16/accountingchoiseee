import { Link } from '@inertiajs/react';
import { ArrowRight, LoaderCircle, Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { getCsrfHeaders } from '@/lib/csrf';

interface Product {
    id: number;
    title: string;
    slug: string;
    category: string;
    description: string;
    price: number;
}

interface ProductRecommendation {
    product: Product;
    reason: string;
}

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);

export default function AIProductFinder() {
    const [buyerNeeds, setBuyerNeeds] = useState('');
    const [consentToGemini, setConsentToGemini] = useState(false);
    const [recommendations, setRecommendations] = useState<ProductRecommendation[] | null>(null);
    const [recommendationError, setRecommendationError] = useState<string | null>(null);
    const [isRecommending, setIsRecommending] = useState(false);

    async function findRecommendations(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!consentToGemini || isRecommending) return;

        const csrfHeaders = getCsrfHeaders();
        if (!csrfHeaders) {
            setRecommendationError('Sesi keamanan tidak ditemukan. Muat ulang halaman lalu coba kembali.');
            return;
        }

        setIsRecommending(true);
        setRecommendationError(null);
        setRecommendations(null);

        try {
            const response = await fetch(route('catalog.recommendations'), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...csrfHeaders,
                },
                body: JSON.stringify({ needs: buyerNeeds.trim() }),
            });
            if (response.status === 419) {
                throw new Error('Sesi keamanan sudah berubah. Muat ulang halaman lalu coba lagi.');
            }

            const result = (await response.json()) as {
                recommendations?: ProductRecommendation[];
                message?: string;
                errors?: { needs?: string[] };
            };
            if (!response.ok) {
                throw new Error(result.errors?.needs?.[0] ?? result.message ?? 'Rekomendasi belum dapat dimuat. Coba lagi.');
            }
            if (!Array.isArray(result.recommendations)) {
                throw new Error('Jawaban rekomendasi belum dapat dibaca. Coba lagi.');
            }

            setRecommendations(result.recommendations);
        } catch (error) {
            setRecommendationError(error instanceof Error ? error.message : 'Rekomendasi belum dapat dimuat. Coba lagi.');
        } finally {
            setIsRecommending(false);
        }
    }

    return (
        <section
            id="ai-template-finder"
            aria-labelledby="ai-template-finder-title"
            className="mb-8 rounded-2xl border border-[#2f5bff]/15 bg-[#d8dfff]/75 p-5 shadow-sm sm:p-7"
        >
            <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-[#2f5bff] shadow-sm">
                    <Search className="h-5 w-5" />
                </span>
                <div>
                    <p className="text-xs font-bold tracking-wide text-[#2f5bff] uppercase">Rekomendasi dengan AI</p>
                    <h2 id="ai-template-finder-title" className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
                        Bingung pilih template?
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                        Ceritakan kebutuhanmu. Gemini akan mencocokkan dengan template yang tersedia di katalog.
                    </p>
                </div>
            </div>

            <form onSubmit={findRecommendations} className="mt-5 space-y-4">
                <label htmlFor="buyer-template-needs" className="sr-only">
                    Ceritakan kebutuhan template
                </label>
                <textarea
                    id="buyer-template-needs"
                    value={buyerNeeds}
                    onChange={(event) => setBuyerNeeds(event.target.value)}
                    maxLength={1500}
                    minLength={8}
                    required
                    rows={3}
                    placeholder="Contoh: Saya punya toko online dan perlu mencatat stok, penjualan, serta keuntungan bulanan."
                    className="w-full rounded-2xl border border-[#c7d0ff] bg-white/80 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2f5bff] focus:bg-white focus:ring-[#2f5bff]"
                />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex max-w-2xl items-start gap-2 text-xs leading-5 text-slate-600">
                        <input
                            type="checkbox"
                            checked={consentToGemini}
                            onChange={(event) => setConsentToGemini(event.target.checked)}
                            className="mt-1 rounded border-slate-300 text-[#2f5bff] focus:ring-[#2f5bff]"
                        />
                        <span>
                            Saya setuju kebutuhan ini diproses Google Gemini untuk mencocokkan katalog. Saya tidak akan memasukkan data pribadi atau
                            rahasia.
                        </span>
                    </label>
                    <button
                        type="submit"
                        disabled={isRecommending || !consentToGemini || buyerNeeds.trim().length < 8}
                        className="landing-primary-button landing-primary-button--compact shrink-0"
                    >
                        {isRecommending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        {isRecommending ? 'Mencari...' : 'Carikan Template'}
                    </button>
                </div>
            </form>

            {recommendationError && (
                <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
                    {recommendationError}
                </p>
            )}
            {recommendations && recommendations.length === 0 && (
                <p role="status" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                    Belum ada template yang cukup cocok. Coba jelaskan kebutuhanmu dengan cara lain atau telusuri template di bagian ini.
                </p>
            )}
            {recommendations && recommendations.length > 0 && (
                <div aria-live="polite" className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {recommendations.map(({ product, reason }) => (
                        <article key={product.id} className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <span className="w-fit rounded-full bg-[#d8dfff] px-2.5 py-1 text-[11px] font-bold text-[#2f5bff]">
                                {product.category}
                            </span>
                            <h3 className="mt-3 text-base font-bold text-slate-900">{product.title}</h3>
                            <p className="mt-1 line-clamp-3 text-sm leading-5 text-slate-600">{product.description}</p>
                            <p className="mt-3 rounded-xl bg-white p-3 text-xs leading-5 text-slate-700">
                                <span className="font-bold text-[#c43ef0]">Kenapa cocok: </span>
                                {reason}
                            </p>
                            <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                                <span className="text-sm font-extrabold text-[#f2541b]">{formatRupiah(product.price)}</span>
                                <Link
                                    href={`/templates/${product.slug}`}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-[#2f5bff] hover:underline"
                                >
                                    Lihat detail <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

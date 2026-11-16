import { Link } from '@inertiajs/react';
import { BookOpen, LoaderCircle, MessageCircleQuestion, Send, Sparkles } from 'lucide-react';
import { FormEvent, KeyboardEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getCsrfHeaders } from '@/lib/csrf';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    source?: string | null;
    supported?: boolean;
}

interface GuideResponse {
    answer?: string;
    source?: string | null;
    supported?: boolean;
    message?: string;
}

interface Props {
    orderId: number;
    itemId: number;
    productTitle: string;
    guideAvailable: boolean;
}

const quickQuestions = ['Bagaimana cara mulai?', 'Bagian mana yang perlu saya isi?'];

export default function ProductGuideAssistant({ orderId, itemId, productTitle, guideAvailable }: Props) {
    const [open, setOpen] = useState(false);
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [sending, setSending] = useState(false);
    const [consented, setConsented] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendQuestion = async (value: string) => {
        const trimmedQuestion = value.trim();
        if (!trimmedQuestion || sending || !guideAvailable || !consented) {
            return;
        }

        const csrfHeaders = getCsrfHeaders();
        if (!csrfHeaders) {
            setError('Token keamanan tidak ditemukan. Muat ulang halaman lalu coba kembali.');
            return;
        }

        setSending(true);
        setError(null);
        setQuestion('');
        try {
            const response = await fetch(route('orders.guide.ask', { order: orderId, item: itemId }), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...csrfHeaders,
                },
                body: JSON.stringify({
                    consent: true,
                    question: trimmedQuestion,
                    history: messages.slice(-8).map(({ role, content }) => ({ role, content })),
                }),
            });
            const result = (await response.json()) as GuideResponse;
            if (!response.ok) {
                throw new Error(result.message ?? 'Panduan AI belum dapat menjawab. Silakan coba kembali.');
            }
            const answer = result.answer;
            const supported = result.supported;
            if (typeof answer !== 'string' || typeof supported !== 'boolean') {
                throw new Error('Jawaban AI tidak dapat digunakan. Silakan coba kembali.');
            }

            setMessages((current) => [
                ...current,
                { role: 'user', content: trimmedQuestion },
                {
                    role: 'assistant',
                    content: answer,
                    source: result.source,
                    supported,
                },
            ]);
        } catch (sendError) {
            setQuestion(trimmedQuestion);
            setError(sendError instanceof Error ? sendError.message : 'Panduan AI belum dapat menjawab. Silakan coba kembali.');
        } finally {
            setSending(false);
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void sendQuestion(question);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void sendQuestion(question);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="h-auto min-h-9 gap-1.5 rounded-xl border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50"
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    Panduan AI
                </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[88vh] max-w-2xl flex-col gap-0 overflow-hidden rounded-3xl bg-white p-0 shadow-xl">
                <DialogHeader className="border-b border-gray-100 bg-emerald-50/70 px-5 py-5 text-left sm:px-6">
                    <div className="flex items-start gap-3 pr-7">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="font-heading text-base font-bold text-gray-900">Panduan Template dengan AI</DialogTitle>
                            <DialogDescription className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">{productTitle}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {guideAvailable ? (
                    <>
                        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
                            <div className="flex items-start gap-2.5">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                                    <Sparkles className="h-3.5 w-3.5" />
                                </span>
                                <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 text-xs leading-5 text-gray-800">
                                    Tanya cara mulai, cara mengisi, atau arti bagian template. Jawaban AI hanya bersumber dari panduan yang disiapkan
                                    admin dan tidak membaca salinan spreadsheet-mu.
                                </div>
                            </div>

                            {messages.map((message, index) => (
                                <div
                                    key={`${index}-${message.role}`}
                                    className={`flex items-start gap-2.5 ${message.role === 'user' ? 'justify-end' : ''}`}
                                >
                                    {message.role === 'assistant' && (
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                                            <Sparkles className="h-3.5 w-3.5" />
                                        </span>
                                    )}
                                    <div
                                        className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-5 ${
                                            message.role === 'user'
                                                ? 'rounded-tr-sm bg-emerald-700 text-white'
                                                : 'rounded-tl-sm bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                        {message.source && (
                                            <div className="mt-2 border-t border-gray-300/70 pt-2 text-[11px] text-gray-600">
                                                <span className="font-bold">Sumber panduan:</span> “{message.source}”
                                            </div>
                                        )}
                                        {message.supported === false && (
                                            <Link href="/chat" className="mt-2 inline-flex items-center gap-1 font-bold text-emerald-800 underline">
                                                <MessageCircleQuestion className="h-3.5 w-3.5" />
                                                Tanya Admin
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {sending && (
                                <div className="flex items-center gap-2 pl-9 text-xs text-gray-500" role="status">
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                    Mencari jawaban di panduan...
                                </div>
                            )}
                        </div>

                        {messages.length === 0 && (
                            <div className="flex flex-wrap gap-2 px-5 pb-3 sm:px-6">
                                {quickQuestions.map((quickQuestion) => (
                                    <button
                                        key={quickQuestion}
                                        type="button"
                                        onClick={() => void sendQuestion(quickQuestion)}
                                        disabled={sending || !consented}
                                        className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-50"
                                    >
                                        {quickQuestion}
                                    </button>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="border-t border-gray-100 bg-white p-4 sm:px-6">
                            <label className="mb-3 flex cursor-pointer items-start gap-2 rounded-xl bg-emerald-50 p-3 text-[11px] leading-5 text-emerald-950">
                                <input
                                    type="checkbox"
                                    checked={consented}
                                    onChange={(event) => setConsented(event.target.checked)}
                                    className="mt-1 h-3.5 w-3.5 shrink-0 rounded border-emerald-300 text-emerald-700 focus:ring-emerald-600"
                                />
                                <span>
                                    Saya setuju pertanyaan dan percakapan ini dikirim ke Gemini agar dijawab berdasarkan panduan admin. Saya tidak
                                    akan memasukkan data pribadi/keuangan, password, atau link spreadsheet.
                                </span>
                            </label>
                            {error && (
                                <p role="alert" className="mb-2 text-xs text-red-600">
                                    {error}
                                </p>
                            )}
                            <div className="flex items-end gap-2">
                                <textarea
                                    value={question}
                                    onChange={(event) => setQuestion(event.target.value)}
                                    onKeyDown={handleKeyDown}
                                    maxLength={1000}
                                    rows={2}
                                    disabled={!consented || sending}
                                    placeholder={
                                        consented ? 'Tulis pertanyaan tentang template ini...' : 'Setujui pemberitahuan di atas untuk bertanya'
                                    }
                                    aria-label="Pertanyaan tentang panduan template"
                                    className="min-h-11 flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-xs leading-5 text-gray-800 transition outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                />
                                <Button
                                    type="submit"
                                    disabled={sending || !consented || !question.trim()}
                                    aria-label="Kirim pertanyaan"
                                    className="h-10 w-10 shrink-0 rounded-xl bg-emerald-700 p-0 text-white hover:bg-emerald-800"
                                >
                                    {sending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </div>
                            <p className="mt-1.5 text-[10px] text-gray-400">Enter untuk mengirim · Shift+Enter untuk baris baru</p>
                        </form>
                    </>
                ) : (
                    <div className="px-6 py-8 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h3 className="mt-3 text-sm font-bold text-gray-900">Panduan sedang disiapkan</h3>
                        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-gray-600">
                            Admin belum menambahkan panduan untuk template ini. AI akan mulai membantu setelah panduan resmi tersedia.
                        </p>
                        <Button asChild className="mt-4 rounded-xl bg-emerald-700 text-xs font-bold text-white hover:bg-emerald-800">
                            <Link href="/chat">
                                <MessageCircleQuestion className="mr-1.5 h-4 w-4" />
                                Tanya Admin
                            </Link>
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

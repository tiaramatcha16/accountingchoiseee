import { Head, router, useForm } from '@inertiajs/react';
import { MessageCircle, Send, Sparkles } from 'lucide-react';
import { FormEvent, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import StorefrontLayout from '@/layouts/storefront-layout';

interface ChatMessage {
    id: number;
    sender_type: 'buyer' | 'admin' | 'ai' | 'system';
    body: string;
    created_at: string;
}

interface Conversation {
    id: number | null;
    status: 'open' | 'needs_admin' | 'waiting_customer';
    messages: ChatMessage[];
}

export default function BuyerChat({ conversation }: { conversation: Conversation }) {
    const { data, setData, post, processing, errors, reset } = useForm({ body: '' });
    const messageEnd = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messageEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation.messages.length]);

    useEffect(() => {
        const timer = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                router.reload({ only: ['conversation'] });
            }
        }, 6000);

        return () => window.clearInterval(timer);
    }, []);

    function send(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post(route('chat.messages.store'), {
            preserveScroll: true,
            onSuccess: () => reset('body'),
        });
    }

    return (
        <StorefrontLayout>
            <Head title="Chat Admin - AccountingChoice" />
            <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
                <header className="mb-6">
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                        <MessageCircle className="h-3.5 w-3.5" />
                        Bantuan Pembeli
                    </span>
                    <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">Chat dengan AccountingChoice</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Tanyakan tentang template, pesanan, atau pembayaran. AI menjawab berdasarkan panduan admin; jika belum ada jawabannya, pesan
                        diteruskan ke admin.
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                        Untuk mencocokkan FAQ, teks pertanyaan dan daftar pertanyaan panduan dikirim ke Google Gemini. Jangan kirim data sensitif.
                    </p>
                </header>

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
                        <div>
                            <h2 className="font-bold text-slate-900">Percakapan Anda</h2>
                            <p className="mt-0.5 text-xs text-slate-500">Riwayat chat tersimpan di akun ini.</p>
                        </div>
                        {conversation.status === 'needs_admin' ? (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Menunggu admin</span>
                        ) : conversation.status === 'waiting_customer' ? (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Admin membalas</span>
                        ) : (
                            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">AI siap membantu</span>
                        )}
                    </div>

                    <div className="flex max-h-[60vh] min-h-[360px] flex-col gap-3 overflow-y-auto p-4 sm:p-6">
                        {conversation.messages.length === 0 && (
                            <div className="m-auto max-w-sm py-12 text-center">
                                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                    <MessageCircle className="h-6 w-6" />
                                </span>
                                <h3 className="mt-4 font-bold text-slate-900">Ada yang ingin ditanyakan?</h3>
                                <p className="mt-1 text-sm text-slate-500">Kirim pertanyaan, kami akan membantu melalui chat ini.</p>
                            </div>
                        )}
                        {conversation.messages.map((message) => {
                            const isBuyer = message.sender_type === 'buyer';
                            const isSystem = message.sender_type === 'system';
                            return (
                                <div key={message.id} className={`flex ${isBuyer ? 'justify-end' : 'justify-start'}`}>
                                    <article
                                        className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                                            isBuyer
                                                ? 'rounded-br-md bg-emerald-700 text-white'
                                                : isSystem
                                                  ? 'border border-amber-200 bg-amber-50 text-amber-900'
                                                  : 'rounded-bl-md bg-slate-100 text-slate-800'
                                        }`}
                                    >
                                        {!isBuyer && (
                                            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold">
                                                {message.sender_type === 'ai' ? (
                                                    <>
                                                        <Sparkles className="h-3.5 w-3.5" /> Asisten AI · dari panduan admin
                                                    </>
                                                ) : isSystem ? (
                                                    'Pemberitahuan'
                                                ) : (
                                                    'Admin'
                                                )}
                                            </p>
                                        )}
                                        <p className="text-sm leading-6 break-words whitespace-pre-wrap">{message.body}</p>
                                        <time
                                            className={`mt-1.5 block text-right text-[10px] ${isBuyer ? 'text-emerald-100' : 'text-slate-400'}`}
                                            dateTime={message.created_at}
                                        >
                                            {new Date(message.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                        </time>
                                    </article>
                                </div>
                            );
                        })}
                        <div ref={messageEnd} />
                    </div>

                    <form onSubmit={send} className="border-t border-slate-100 bg-white p-4 pr-20 sm:p-5">
                        <label htmlFor="buyer-chat-message" className="sr-only">
                            Tulis pertanyaan
                        </label>
                        <div className="flex items-end gap-2">
                            <textarea
                                id="buyer-chat-message"
                                rows={2}
                                maxLength={5000}
                                required
                                value={data.body}
                                onChange={(event) => setData('body', event.target.value)}
                                placeholder="Tulis pertanyaan Anda..."
                                className="min-h-12 flex-1 resize-y rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                            />
                            <Button
                                type="submit"
                                disabled={processing || !data.body.trim()}
                                className="h-12 rounded-2xl bg-emerald-700 px-4 text-white hover:bg-emerald-800"
                            >
                                <Send className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">{processing ? 'Mengirim...' : 'Kirim'}</span>
                            </Button>
                        </div>
                        {errors.body && <p className="mt-2 text-xs text-red-600">{errors.body}</p>}
                    </form>
                </section>
            </main>
        </StorefrontLayout>
    );
}

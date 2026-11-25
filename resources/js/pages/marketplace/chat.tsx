import { Head, router, useForm } from '@inertiajs/react';
import { Bot, CheckCheck, CircleHelp, MessageCircle, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { FormEvent, useEffect, useRef } from 'react';

import StorefrontLayout from '@/layouts/storefront-layout';
import { Bubble, BubbleContent } from '@/components/ui/c-message-3-utils/bubble';
import { Message, MessageContent, MessageFooter, MessageHeader } from '@/components/ui/c-message-3-utils/message';

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
            <main className="mx-auto w-full max-w-4xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-20 lg:px-8">
                <header className="mb-6">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <MessageCircle className="h-3.5 w-3.5" />
                        Bantuan Pembeli
                    </span>
                    <h1 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#1d1d1f] sm:text-3xl">Chat dengan AccountingChoice</h1>
                    <p className="mt-2 text-sm text-[#86868b]">
                        Tanyakan tentang template, pesanan, atau pembayaran. AI menjawab berdasarkan panduan admin; jika belum ada jawabannya, pesan
                        diteruskan ke admin.
                    </p>
                    <p className="mt-2 text-xs text-[#86868b]">
                        Untuk mencocokkan FAQ, teks pertanyaan dan daftar pertanyaan panduan dikirim ke Google Gemini. Jangan kirim data sensitif.
                    </p>
                </header>

                <section className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between border-b border-black/[0.06] bg-[#f5f5f7]/50 px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-[#1d1d1f]">Percakapan Anda</h2>
                            <p className="mt-0.5 text-xs text-[#86868b]">Riwayat chat tersimpan di akun ini.</p>
                        </div>
                        {conversation.status === 'needs_admin' ? (
                            <span className="rounded-full border border-amber-200/60 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Menunggu admin</span>
                        ) : conversation.status === 'waiting_customer' ? (
                            <span className="rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Admin membalas</span>
                        ) : (
                            <span className="rounded-full border border-black/[0.06] bg-neutral-100 px-3 py-1 text-xs font-semibold text-[#86868b]">AI siap membantu</span>
                        )}
                    </div>

                    <div className="flex max-h-[65vh] min-h-[380px] flex-col gap-6 overflow-y-auto bg-slate-50/50 p-4 sm:p-6">
                        {conversation.messages.length === 0 && (
                            <div className="m-auto max-w-sm py-12 text-center">
                                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200/60 text-slate-500">
                                    <MessageCircle className="h-6 w-6" />
                                </span>
                                <h3 className="mt-4 font-semibold text-[#1d1d1f]">Ada yang ingin ditanyakan?</h3>
                                <p className="mt-1 text-sm text-[#86868b]">Kirim pertanyaan, kami akan membantu menjawab kebutuhan template Anda.</p>
                            </div>
                        )}
                        {conversation.messages.map((message) => {
                            const isBuyer = message.sender_type === 'buyer';
                            const isSystem = message.sender_type === 'system';
                            const isAi = message.sender_type === 'ai';
                            const timeString = new Date(message.created_at).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                            });

                            return (
                                <Message key={message.id} align={isBuyer ? 'end' : 'start'}>
                                    <MessageContent>
                                        {!isBuyer && (
                                            <MessageHeader className="gap-1.5 text-[11px] text-slate-500">
                                                {isAi ? (
                                                    <span className="flex items-center gap-1 font-semibold text-emerald-800">
                                                        <Bot className="h-3.5 w-3.5 text-emerald-600" />
                                                        Asisten Otomatis
                                                    </span>
                                                ) : isSystem ? (
                                                    <span className="font-semibold text-amber-700">Pemberitahuan Sistem</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 font-semibold text-slate-900">
                                                        <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                                                        Tim AccountingChoice
                                                    </span>
                                                )}
                                                <span
                                                    aria-hidden="true"
                                                    className="bg-slate-300 size-1 shrink-0 rounded-full"
                                                />
                                                <span className="tabular-nums font-mono text-[10px] text-slate-400">{timeString}</span>
                                            </MessageHeader>
                                        )}

                                        <Bubble
                                            variant={isBuyer ? 'default' : isSystem ? 'system' : 'muted'}
                                            className={
                                                isBuyer
                                                    ? 'bg-[#1d1d1f] text-white shadow-sm'
                                                    : isSystem
                                                    ? 'bg-amber-50/90 border border-amber-200/80 text-amber-900'
                                                    : 'bg-white border border-slate-200/80 text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.03)]'
                                            }
                                        >
                                            <BubbleContent className="text-[13.5px] leading-relaxed">
                                                {message.body}
                                            </BubbleContent>
                                        </Bubble>

                                        {isBuyer && (
                                            <MessageFooter className="gap-1.5 text-[10.5px] text-slate-400 justify-end">
                                                <span className="tabular-nums font-mono">{timeString}</span>
                                                <CheckCheck className="h-3.5 w-3.5 text-emerald-600 inline" />
                                            </MessageFooter>
                                        )}
                                    </MessageContent>
                                </Message>
                            );
                        })}
                        <div ref={messageEnd} />
                    </div>

                    <form onSubmit={send} className="border-t border-black/[0.06] bg-white p-4 sm:p-5">
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
                                className="min-h-12 flex-1 resize-y rounded-2xl border border-black/[0.08] bg-[#fbfbfd] px-4 py-3 text-sm text-[#1d1d1f] outline-none transition focus:border-neutral-300 focus:bg-white focus:ring-1 focus:ring-neutral-300 placeholder:text-[#86868b]"
                            />
                            <button
                                type="submit"
                                disabled={processing || !data.body.trim()}
                                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#1d1d1f] px-4 text-white transition hover:bg-[#333336] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Send className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline text-sm font-semibold">{processing ? 'Mengirim...' : 'Kirim'}</span>
                            </button>
                        </div>
                        {errors.body && <p className="mt-2 text-xs text-red-600">{errors.body}</p>}
                    </form>
                </section>
            </main>
        </StorefrontLayout>
    );
}

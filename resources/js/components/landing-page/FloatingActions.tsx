import { usePage } from '@inertiajs/react';
import { Bot, CheckCheck, CircleHelp, LoaderCircle, MessageCircle, Send, ShieldCheck, X } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

import { getCsrfHeaders } from '@/lib/csrf';
import { type SharedData } from '@/types';
import { Bubble, BubbleContent } from '@/components/ui/c-message-3-utils/bubble';
import { Message, MessageContent, MessageFooter, MessageHeader } from '@/components/ui/c-message-3-utils/message';

interface ChatMessage {
    id: number;
    sender_type: 'buyer' | 'admin' | 'ai' | 'system';
    body: string;
    created_at: string;
}

interface WidgetPayload {
    conversation: { id: number | null; status: string };
    messages: ChatMessage[];
}

export default function FloatingActions() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [status, setStatus] = useState('open');
    const [body, setBody] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [hasNewReply, setHasNewReply] = useState(false);
    const [notificationError, setNotificationError] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const isOpenRef = useRef(false);
    const unreadRef = useRef(0);
    const loadingRef = useRef(false);
    const hasLoadedRef = useRef(false);
    const messagesEnd = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const url = new URL(window.location.href);
        if (url.searchParams.get('openChat') !== '1') return;

        url.searchParams.delete('openChat');
        window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
        setIsOpen(true);
    }, []);

    const loadConversation = useCallback(async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        if (!hasLoadedRef.current) setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(route('chat.widget'), {
                credentials: 'same-origin',
                headers: { Accept: 'application/json' },
            });
            const result = (await response.json()) as WidgetPayload & { message?: string };
            if (!response.ok) throw new Error(result.message ?? 'Chat belum dapat dimuat. Coba lagi.');

            setMessages(result.messages);
            setStatus(result.conversation.status);
            unreadRef.current = 0;
            setUnreadCount(0);
            setHasNewReply(false);
            setNotificationError(false);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Chat belum dapat dimuat. Coba lagi.');
        } finally {
            loadingRef.current = false;
            hasLoadedRef.current = true;
            setIsLoading(false);
        }
    }, []);

    const pollUnread = useCallback(async () => {
        try {
            const response = await fetch(route('chat.unread'), {
                credentials: 'same-origin',
                headers: { Accept: 'application/json' },
            });
            const result = (await response.json()) as { count?: number; message?: string };
            if (!response.ok || typeof result.count !== 'number') {
                throw new Error(result.message ?? 'Notifikasi chat belum dapat diperbarui.');
            }

            setHasNewReply(result.count > 0);
            setNotificationError(false);
            unreadRef.current = result.count;
            setUnreadCount(result.count);
        } catch {
            setNotificationError(true);
        }
    }, []);

    useEffect(() => {
        isOpenRef.current = isOpen;
        if (isOpen) {
            setHasNewReply(false);
            setNotificationError(false);
            void loadConversation();
        }
    }, [isOpen, loadConversation]);

    useEffect(() => {
        if (!user || user.role === 'admin') return;

        const timer = window.setInterval(() => {
            if (document.visibilityState !== 'visible') return;
            if (isOpenRef.current) {
                void loadConversation();
            } else {
                void pollUnread();
            }
        }, 6000);

        void pollUnread();
        return () => window.clearInterval(timer);
    }, [pollUnread, loadConversation, user]);

    useEffect(() => {
        if (isOpen) messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [isOpen, messages]);

    if (!user || user.role === 'admin') return null;

    async function sendMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const message = body.trim();
        if (!message || isSending) return;

        const csrfHeaders = getCsrfHeaders();
        if (!csrfHeaders) {
            setError('Sesi keamanan tidak ditemukan. Muat ulang halaman lalu coba kembali.');
            return;
        }

        setIsSending(true);
        setError(null);
        try {
            const response = await fetch(route('chat.messages.store'), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...csrfHeaders,
                },
                body: JSON.stringify({ body: message }),
            });
            if (response.status === 419) {
                throw new Error('Sesi keamanan sudah berubah. Muat ulang halaman lalu kirim ulang pesan.');
            }
            const result = (await response.json()) as WidgetPayload & {
                message?: string;
                errors?: { body?: string[] };
            };
            if (!response.ok) {
                throw new Error(result.errors?.body?.[0] ?? result.message ?? 'Pesan belum dapat dikirim. Coba lagi.');
            }

            setMessages(result.messages);
            setStatus(result.conversation.status);
            setBody('');
            unreadRef.current = 0;
            setUnreadCount(0);
            setHasNewReply(false);
        } catch (sendError) {
            setError(sendError instanceof Error ? sendError.message : 'Pesan belum dapat dikirim. Coba lagi.');
        } finally {
            setIsSending(false);
        }
    }

    return (
        <>
            {isOpen && (
                <section
                    role="dialog"
                    aria-modal="false"
                    aria-labelledby="buyer-chat-widget-title"
                    className="fixed right-4 bottom-20 z-50 flex h-[min(600px,calc(100dvh-7rem))] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-3xl border border-black/[0.08] bg-[#fbfbfd] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.15)] sm:right-6 sm:bottom-24"
                >
                    <header className="flex items-center justify-between bg-[#1d1d1f] px-4 py-3.5 text-white">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                                <MessageCircle className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 id="buyer-chat-widget-title" className="text-sm font-semibold tracking-[-0.01em]">
                                    Chat dengan Admin
                                </h2>
                                <p className="text-[11px] text-white/60">
                                    {status === 'needs_admin' ? 'Pertanyaan diteruskan ke admin' : 'Admin & CS siap membantu'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Tutup chat"
                            className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </header>

                    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto bg-slate-50/70 p-4">
                        {isLoading && messages.length === 0 && (
                            <div className="m-auto flex items-center gap-2 text-sm text-[#86868b]">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Memuat percakapan...
                            </div>
                        )}
                        {!isLoading && messages.length === 0 && (
                            <div className="m-auto max-w-[270px] py-8 text-center">
                                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-200/60 text-[#86868b]">
                                    <MessageCircle className="h-6 w-6" />
                                </span>
                                <h3 className="mt-4 text-sm font-semibold text-[#1d1d1f]">Ada yang ingin ditanyakan?</h3>
                                <p className="mt-1 text-xs leading-5 text-[#86868b]">
                                    Pertanyaan Anda akan dijawab langsung berdasarkan panduan toko atau diteruskan ke admin.
                                </p>
                            </div>
                        )}
                        {messages.map((message) => {
                            const isBuyer = message.sender_type === 'buyer';
                            const isSystem = message.sender_type === 'system';
                            const isAi = message.sender_type === 'ai';
                            const timeString = new Date(message.created_at).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                            });

                            return (
                                <Message key={message.id} align={isBuyer ? 'end' : 'start'}>
                                    <MessageContent className="max-w-[85%]">
                                        {!isBuyer && (
                                            <MessageHeader className="gap-1.5 text-[11px] text-slate-500">
                                                {isAi ? (
                                                    <span className="flex items-center gap-1 font-semibold text-emerald-800">
                                                        <Bot className="h-3 w-3 text-emerald-600" />
                                                        Asisten Otomatis
                                                    </span>
                                                ) : isSystem ? (
                                                    <span className="font-semibold text-amber-700">Pemberitahuan</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 font-semibold text-slate-900">
                                                        <ShieldCheck className="h-3 w-3 text-blue-600" />
                                                        Admin
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
                                                    ? 'bg-[#1d1d1f] text-white shadow-xs'
                                                    : isSystem
                                                    ? 'bg-amber-50/90 border border-amber-200/80 text-amber-900'
                                                    : 'bg-white border border-slate-200/80 text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
                                            }
                                        >
                                            <BubbleContent className="text-[12.5px] leading-relaxed">
                                                {message.body}
                                            </BubbleContent>
                                        </Bubble>

                                        {isBuyer && (
                                            <MessageFooter className="gap-1.5 text-[10px] text-slate-400 justify-end">
                                                <span className="tabular-nums font-mono">{timeString}</span>
                                                <CheckCheck className="h-3 w-3 text-emerald-600 inline" />
                                            </MessageFooter>
                                        )}
                                    </MessageContent>
                                </Message>
                            );
                        })}
                        <div ref={messagesEnd} />
                    </div>

                    <form onSubmit={sendMessage} className="border-t border-black/[0.06] bg-white p-3">
                        <label htmlFor="chat-widget-message" className="sr-only">
                            Tulis pertanyaan
                        </label>
                        <div className="flex items-end gap-2">
                            <textarea
                                id="chat-widget-message"
                                rows={2}
                                maxLength={5000}
                                required
                                value={body}
                                onChange={(event) => setBody(event.target.value)}
                                placeholder="Tulis pesan..."
                                className="min-h-11 flex-1 resize-none rounded-2xl border border-black/[0.08] bg-[#fbfbfd] px-3 py-2.5 text-xs text-[#1d1d1f] outline-none transition focus:border-neutral-300 focus:bg-white focus:ring-1 focus:ring-neutral-300 placeholder:text-[#86868b]"
                            />
                            <button
                                type="submit"
                                disabled={isSending || !body.trim()}
                                aria-label="Kirim pesan"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1d1d1f] text-white transition hover:bg-[#333336] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </button>
                        </div>
                        {error && (
                            <p role="alert" className="mt-2 text-xs text-red-600">
                                {error}
                            </p>
                        )}
                    </form>
                </section>
            )}

            {!isOpen && (hasNewReply || notificationError) && (
                <div
                    role="status"
                    className="fixed right-4 bottom-[5.5rem] z-50 rounded-2xl border border-black/[0.06] bg-[#1d1d1f] px-4 py-2.5 text-xs font-semibold text-white shadow-lg sm:right-6"
                >
                    {hasNewReply ? 'Ada balasan baru di chat' : 'Notifikasi belum diperbarui. Klik untuk cek chat.'}
                </div>
            )}
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-label={
                    isOpen ? 'Tutup chat admin' : unreadCount > 0 ? `Buka chat admin, ${unreadCount} balasan belum dibaca` : 'Buka chat admin'
                }
                aria-expanded={isOpen}
                className="fixed right-4 bottom-4 z-50 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-4 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition hover:scale-[1.03] hover:bg-[#333336] focus-visible:ring-4 focus-visible:ring-neutral-400 active:scale-[0.98] sm:right-6 sm:bottom-6"
            >
                {isOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <MessageCircle aria-hidden="true" className="h-6 w-6" />}
                <span className="hidden sm:inline">{isOpen ? 'Tutup' : 'Chat Admin'}</span>
                {!isOpen && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>
        </>
    );
}

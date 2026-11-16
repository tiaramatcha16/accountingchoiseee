import { usePage } from '@inertiajs/react';
import { LoaderCircle, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

import { getCsrfHeaders } from '@/lib/csrf';
import { type SharedData } from '@/types';

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
                    className="fixed right-4 bottom-20 z-50 flex h-[min(600px,calc(100dvh-7rem))] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl sm:right-6 sm:bottom-24"
                >
                    <header className="flex items-center justify-between bg-emerald-800 px-4 py-3.5 text-white">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                                <MessageCircle className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 id="buyer-chat-widget-title" className="text-sm font-bold">
                                    Chat dengan Admin
                                </h2>
                                <p className="text-[11px] text-emerald-100">
                                    {status === 'needs_admin' ? 'Pertanyaan diteruskan ke admin' : 'AI dan admin siap membantu'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Tutup chat"
                            className="rounded-full p-2 text-white/90 transition hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </header>

                    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-slate-50 p-4">
                        {isLoading && messages.length === 0 && (
                            <div className="m-auto flex items-center gap-2 text-sm text-slate-500">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Memuat percakapan...
                            </div>
                        )}
                        {!isLoading && messages.length === 0 && (
                            <div className="m-auto max-w-[270px] py-8 text-center">
                                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                                    <MessageCircle className="h-6 w-6" />
                                </span>
                                <h3 className="mt-4 text-sm font-bold text-slate-900">Ada yang ingin ditanyakan?</h3>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    AI menjawab sesuai panduan admin. Jika belum ada jawabannya, pesan akan diteruskan ke admin.
                                </p>
                            </div>
                        )}
                        {messages.map((message) => {
                            const isBuyer = message.sender_type === 'buyer';
                            const isSystem = message.sender_type === 'system';
                            return (
                                <div key={message.id} className={`flex ${isBuyer ? 'justify-end' : 'justify-start'}`}>
                                    <article
                                        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 ${
                                            isBuyer
                                                ? 'rounded-br-md bg-emerald-700 text-white'
                                                : isSystem
                                                  ? 'border border-amber-200 bg-amber-50 text-amber-900'
                                                  : 'rounded-bl-md bg-white text-slate-800 shadow-sm'
                                        }`}
                                    >
                                        {!isBuyer && (
                                            <p className="mb-1 flex items-center gap-1 text-[10px] font-bold">
                                                {message.sender_type === 'ai' ? (
                                                    <>
                                                        <Sparkles className="h-3 w-3" /> Asisten AI · panduan admin
                                                    </>
                                                ) : isSystem ? (
                                                    'Pemberitahuan'
                                                ) : (
                                                    'Admin'
                                                )}
                                            </p>
                                        )}
                                        <p className="text-xs leading-5 break-words whitespace-pre-wrap">{message.body}</p>
                                        <time
                                            dateTime={message.created_at}
                                            className={`mt-1 block text-right text-[9px] ${isBuyer ? 'text-emerald-100' : 'text-slate-400'}`}
                                        >
                                            {new Date(message.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                        </time>
                                    </article>
                                </div>
                            );
                        })}
                        <div ref={messagesEnd} />
                    </div>

                    <form onSubmit={sendMessage} className="border-t border-slate-100 bg-white p-3">
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
                                className="min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 px-3 py-2.5 text-xs focus:border-emerald-600 focus:ring-emerald-600"
                            />
                            <button
                                type="submit"
                                disabled={isSending || !body.trim()}
                                aria-label="Kirim pesan"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="fixed right-4 bottom-[5.5rem] z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg sm:right-6"
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
                className="fixed right-4 bottom-4 z-50 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-950/20 transition hover:scale-[1.03] hover:bg-emerald-800 focus-visible:ring-4 focus-visible:ring-emerald-300 sm:right-6 sm:bottom-6"
            >
                {isOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <MessageCircle aria-hidden="true" className="h-6 w-6" />}
                <span className="hidden sm:inline">{isOpen ? 'Tutup' : 'Chat Admin'}</span>
                {!isOpen && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>
        </>
    );
}

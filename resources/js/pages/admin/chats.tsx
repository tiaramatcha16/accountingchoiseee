import { Head, Link, router, useForm } from '@inertiajs/react';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { FormEvent, useEffect } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface ChatMessage {
    id: number;
    sender_type: 'buyer' | 'admin' | 'ai' | 'system';
    body: string;
    created_at: string;
}

interface ChatConversation {
    id: number;
    buyer_id: number;
    status: 'open' | 'needs_admin' | 'waiting_customer';
    last_message_at: string | null;
    messages_count: number;
    buyer: { id: number; name: string; email: string };
    messages?: ChatMessage[];
}

interface ChatFaq {
    id: number;
    question: string;
    answer: string;
    is_active: boolean;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface Props {
    conversations: Paginated<ChatConversation>;
    selectedConversation: ChatConversation | null;
    faqs: Paginated<ChatFaq>;
    needsReplyCount: number;
    status?: string;
}

function FaqEditor({ faq }: { faq: ChatFaq }) {
    const { data, setData, patch, processing } = useForm({
        question: faq.question,
        answer: faq.answer,
        is_active: faq.is_active,
    });

    function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        patch(route('admin.chat-faqs.update', faq.id), { preserveScroll: true });
    }

    function remove() {
        if (window.confirm('Hapus FAQ ini dari materi jawaban AI?')) {
            router.delete(route('admin.chat-faqs.destroy', faq.id), { preserveScroll: true });
        }
    }

    return (
        <form onSubmit={save} className="space-y-3 rounded-3xl border border-black/[0.06] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between gap-3">
                <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        data.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-neutral-100 text-[#86868b]'
                    }`}
                >
                    {data.is_active ? 'Aktif untuk AI' : 'Nonaktif'}
                </span>
                <button
                    type="button"
                    onClick={remove}
                    className="rounded-full p-1.5 text-[#86868b] transition hover:bg-red-50 hover:text-red-600"
                    aria-label="Hapus FAQ"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
            <div className="space-y-1.5">
                <label htmlFor={`faq-question-${faq.id}`} className="block text-xs font-semibold text-[#1d1d1f]">
                    Pertanyaan yang Sering Diajukan
                </label>
                <input
                    id={`faq-question-${faq.id}`}
                    value={data.question}
                    onChange={(event) => setData('question', event.target.value)}
                    maxLength={1000}
                    required
                    className="w-full rounded-2xl border border-black/[0.08] bg-[#fbfbfd] px-3.5 py-2 text-xs text-[#1d1d1f] outline-none transition focus:border-neutral-300 focus:bg-white"
                />
            </div>
            <div className="space-y-1.5">
                <label htmlFor={`faq-answer-${faq.id}`} className="block text-xs font-semibold text-[#1d1d1f]">
                    Jawaban Resmi Admin
                </label>
                <textarea
                    id={`faq-answer-${faq.id}`}
                    value={data.answer}
                    onChange={(event) => setData('answer', event.target.value)}
                    maxLength={10000}
                    rows={3}
                    required
                    className="w-full rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-3 text-xs text-[#1d1d1f] outline-none transition focus:border-neutral-300 focus:bg-white"
                />
            </div>
            <div className="flex items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2 text-xs text-[#86868b] cursor-pointer">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(event) => setData('is_active', event.target.checked)}
                        className="rounded border-black/[0.15]"
                    />
                    <span>Materi aktif</span>
                </label>
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-full bg-[#1d1d1f] px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#333336] active:scale-95 disabled:opacity-40"
                >
                    Simpan FAQ
                </button>
            </div>
        </form>
    );
}

export default function AdminChats({ conversations, selectedConversation, faqs, needsReplyCount, status }: Props) {
    const { adminChatNeedsReplyCount = 0 } = usePage<SharedData>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin' },
        { title: 'Chat Pembeli', href: '/admin/chats' },
    ];
    const replyForm = useForm({ body: '' });
    const faqForm = useForm({ question: '', answer: '' });

    useEffect(() => {
        const timer = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                router.reload({
                    only: ['conversations', 'selectedConversation', 'needsReplyCount', 'adminChatNeedsReplyCount'],
                });
            }
        }, 8000);
        return () => window.clearInterval(timer);
    }, []);

    function sendReply(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!selectedConversation) return;
        replyForm.post(route('admin.chats.messages.store', selectedConversation.id), {
            preserveScroll: true,
            onSuccess: () => replyForm.reset('body'),
        });
    }

    function addFaq(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        faqForm.post(route('admin.chat-faqs.store'), {
            preserveScroll: true,
            onSuccess: () => faqForm.reset(),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chat Pembeli & Materi AI - AccountingChoice" />
            <main className="mx-auto w-full max-w-7xl space-y-8 p-5 sm:p-6 lg:p-8">
                {/* Header */}
                <header className="border-b border-black/[0.06] pb-6">
                    <span className="inline-flex items-center rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-700 uppercase">
                        Layanan Pelanggan
                    </span>
                    <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.035em] text-[#1d1d1f]">
                        Chat Pembeli & Panduan AI
                    </h1>
                    <p className="mt-1 text-sm text-[#86868b]">
                        Kelola antrean pesan pembeli dan atur basis pengetahuan AI agar dapat menjawab pertanyaan secara akurat 24/7.
                    </p>
                </header>

                {status && (
                    <div role="status" className="rounded-2xl border border-emerald-200/60 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                        {status}
                    </div>
                )}

                {/* Inbox Split View */}
                <section className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] bg-[#f5f5f7]/60 p-5">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-[#1d1d1f]">
                                <MessageCircle className="h-4 w-4" />
                            </span>
                            <div>
                                <h2 className="text-base font-semibold text-[#1d1d1f]">Kotak Masuk Chat</h2>
                                <p className="text-xs text-[#86868b]">{needsReplyCount} percakapan perlu balasan admin</p>
                            </div>
                        </div>
                        {adminChatNeedsReplyCount !== needsReplyCount && (
                            <span className="text-xs text-[#86868b] animate-pulse">Memperbarui antrean...</span>
                        )}
                    </div>
                    <div className="grid min-h-[560px] lg:grid-cols-[320px_1fr]">
                        <aside className="max-h-[70vh] overflow-y-auto border-b border-black/[0.06] lg:border-r lg:border-b-0 divide-y divide-black/[0.04]">
                            {conversations.data.map((conversation) => (
                                <Link
                                    key={conversation.id}
                                    href={route('admin.chats.index', { conversation: conversation.id })}
                                    preserveScroll
                                    className={`block p-4 transition hover:bg-neutral-50/70 ${
                                        selectedConversation?.id === conversation.id ? 'bg-[#f5f5f7]' : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="truncate text-xs font-semibold text-[#1d1d1f]">{conversation.buyer.name}</span>
                                        {conversation.status === 'needs_admin' && (
                                            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500 animate-pulse" aria-label="Perlu balasan" />
                                        )}
                                    </div>
                                    <p className="truncate font-mono text-[11px] text-[#86868b]">{conversation.buyer.email}</p>
                                    <p className="mt-1 text-[10px] text-[#86868b]">
                                        {conversation.messages_count} pesan ·{' '}
                                        {conversation.last_message_at
                                            ? new Date(conversation.last_message_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
                                            : 'Belum ada pesan'}
                                    </p>
                                </Link>
                            ))}
                            {conversations.data.length === 0 && <p className="p-6 text-xs text-[#86868b]">Belum ada chat pembeli.</p>}
                            {conversations.links.length > 3 && (
                                <nav aria-label="Halaman daftar chat" className="flex flex-wrap gap-1 p-3">
                                    {conversations.links.map((link, index) =>
                                        link.url ? (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                preserveScroll
                                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                                                    link.active ? 'bg-[#1d1d1f] text-white' : 'bg-neutral-100 text-[#1d1d1f]'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : null,
                                    )}
                                </nav>
                            )}
                        </aside>

                        <div className="flex min-h-[500px] flex-col bg-[#fbfbfd]">
                            {selectedConversation ? (
                                <>
                                    <div className="border-b border-black/[0.06] bg-white p-4">
                                        <h3 className="text-sm font-semibold text-[#1d1d1f]">{selectedConversation.buyer.name}</h3>
                                        <p className="font-mono text-xs text-[#86868b]">{selectedConversation.buyer.email}</p>
                                        {selectedConversation.status === 'needs_admin' && (
                                            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200/60">
                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                Menunggu balasan admin
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex max-h-[52vh] flex-1 flex-col gap-3 overflow-y-auto p-4">
                                        {selectedConversation.messages?.map((message) => {
                                            const isAdmin = message.sender_type === 'admin';
                                            return (
                                                <div key={message.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                    <article
                                                        className={`max-w-[88%] rounded-2xl px-4 py-2.5 ${
                                                            isAdmin
                                                                ? 'rounded-br-md bg-[#1d1d1f] text-white'
                                                                : message.sender_type === 'system'
                                                                  ? 'border border-amber-200 bg-amber-50 text-amber-900'
                                                                  : 'rounded-bl-md border border-black/[0.06] bg-white text-[#1d1d1f] shadow-xs'
                                                        }`}
                                                    >
                                                        {!isAdmin && (
                                                            <p className="mb-1 text-[10px] font-semibold text-[#86868b]">
                                                                {message.sender_type === 'buyer'
                                                                    ? 'Pembeli'
                                                                    : message.sender_type === 'ai'
                                                                      ? 'Asisten AI'
                                                                      : 'Pemberitahuan'}
                                                            </p>
                                                        )}
                                                        <p className="text-xs leading-5 break-words whitespace-pre-wrap">{message.body}</p>
                                                        <time
                                                            className={`mt-1 block text-right text-[9px] ${
                                                                isAdmin ? 'text-white/50' : 'text-[#86868b]'
                                                            }`}
                                                        >
                                                            {new Date(message.created_at).toLocaleString('id-ID', {
                                                                dateStyle: 'short',
                                                                timeStyle: 'short',
                                                            })}
                                                        </time>
                                                    </article>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <form onSubmit={sendReply} className="border-t border-black/[0.06] bg-white p-3">
                                        <label htmlFor="admin-chat-reply" className="sr-only">
                                            Balas pembeli
                                        </label>
                                        <div className="flex items-end gap-2">
                                            <textarea
                                                id="admin-chat-reply"
                                                rows={2}
                                                maxLength={5000}
                                                required
                                                value={replyForm.data.body}
                                                onChange={(event) => replyForm.setData('body', event.target.value)}
                                                placeholder="Tulis balasan pesan untuk pembeli..."
                                                className="min-h-11 flex-1 resize-none rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-3 text-xs text-[#1d1d1f] outline-none transition focus:border-neutral-300 focus:bg-white"
                                            />
                                            <button
                                                type="submit"
                                                disabled={replyForm.processing || !replyForm.data.body.trim()}
                                                className="flex h-11 items-center gap-1.5 rounded-2xl bg-[#1d1d1f] px-4 text-xs font-semibold text-white transition hover:bg-[#333336] active:scale-95 disabled:opacity-40"
                                            >
                                                <Send className="h-3.5 w-3.5" />
                                                <span>Kirim</span>
                                            </button>
                                        </div>
                                        {replyForm.errors.body && <p className="mt-1 text-xs text-red-600">{replyForm.errors.body}</p>}
                                    </form>
                                </>
                            ) : (
                                <div className="m-auto p-8 text-center text-[#86868b]">
                                    <MessageCircle className="mx-auto h-10 w-10 text-neutral-300" />
                                    <p className="mt-3 text-xs font-semibold text-[#1d1d1f]">Pilih percakapan untuk membaca pesan</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* AI FAQ Knowledge Base Section */}
                <section className="space-y-5">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">
                            Materi Jawaban Bantuan (FAQ)
                        </h2>
                        <p className="mt-1 max-w-3xl text-xs sm:text-sm text-[#86868b] leading-relaxed">
                            Buat daftar pertanyaan dan jawaban resmi untuk menjawab pertanyaan pembeli secara otomatis.
                        </p>
                    </div>

                    {/* Add FAQ Form */}
                    <form onSubmit={addFaq} className="grid gap-4 rounded-3xl border border-black/[0.06] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] md:grid-cols-2">
                        <div className="space-y-1.5">
                            <label htmlFor="new-faq-question" className="block text-xs font-semibold text-[#1d1d1f]">
                                Pertanyaan Baru
                            </label>
                            <input
                                id="new-faq-question"
                                maxLength={1000}
                                required
                                value={faqForm.data.question}
                                onChange={(event) => faqForm.setData('question', event.target.value)}
                                placeholder="Contoh: Bagaimana cara membuka file di Google Sheets?"
                                className="w-full rounded-2xl border border-black/[0.08] bg-[#fbfbfd] px-3.5 py-2.5 text-xs text-[#1d1d1f] outline-none transition focus:border-neutral-300 focus:bg-white"
                            />
                            {faqForm.errors.question && <p className="text-xs text-red-600">{faqForm.errors.question}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="new-faq-answer" className="block text-xs font-semibold text-[#1d1d1f]">
                                Jawaban Resmi AI
                            </label>
                            <textarea
                                id="new-faq-answer"
                                maxLength={10000}
                                required
                                rows={2}
                                value={faqForm.data.answer}
                                onChange={(event) => faqForm.setData('answer', event.target.value)}
                                placeholder="Tulis instruksi atau jawaban resmi yang akan disampaikan AI..."
                                className="w-full rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-3 text-xs text-[#1d1d1f] outline-none transition focus:border-neutral-300 focus:bg-white"
                            />
                            {faqForm.errors.answer && <p className="text-xs text-red-600">{faqForm.errors.answer}</p>}
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={faqForm.processing}
                                className="inline-flex items-center rounded-full bg-[#1d1d1f] px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#333336] active:scale-95 disabled:opacity-40"
                            >
                                <span>Tambah Materi FAQ</span>
                            </button>
                        </div>
                    </form>

                    {/* FAQ List Cards */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        {faqs.data.map((faq) => (
                            <FaqEditor key={faq.id} faq={faq} />
                        ))}
                        {faqs.data.length === 0 && (
                            <p className="rounded-3xl border border-dashed border-black/[0.08] p-8 text-center text-xs text-[#86868b] lg:col-span-2">
                                Belum ada materi FAQ tersimpan.
                            </p>
                        )}
                    </div>
                </section>
            </main>
        </AppLayout>
    );
}

import { Head, Link, router, useForm } from '@inertiajs/react';
import { MessageCircle, Send, Sparkles, Trash2 } from 'lucide-react';
import { FormEvent, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        <form onSubmit={save} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
                <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${data.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}
                >
                    {data.is_active ? 'Aktif untuk AI' : 'Nonaktif'}
                </span>
                <button type="button" onClick={remove} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Hapus FAQ">
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor={`faq-question-${faq.id}`}>Pertanyaan yang sering diajukan</Label>
                <Input
                    id={`faq-question-${faq.id}`}
                    value={data.question}
                    onChange={(event) => setData('question', event.target.value)}
                    maxLength={1000}
                    required
                    className="bg-white text-slate-900 placeholder:text-slate-400"
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor={`faq-answer-${faq.id}`}>Jawaban resmi admin</Label>
                <textarea
                    id={`faq-answer-${faq.id}`}
                    value={data.answer}
                    onChange={(event) => setData('answer', event.target.value)}
                    maxLength={10000}
                    rows={3}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-emerald-600"
                />
            </div>
            <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={data.is_active} onChange={(event) => setData('is_active', event.target.checked)} />
                    Materi aktif
                </label>
                <Button type="submit" size="sm" disabled={processing} className="bg-emerald-700 text-white hover:bg-emerald-800">
                    Simpan FAQ
                </Button>
            </div>
        </form>
    );
}

export default function AdminChats({ conversations, selectedConversation, faqs, needsReplyCount, status }: Props) {
    const { adminChatNeedsReplyCount = 0 } = usePage<SharedData>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin' },
        { title: 'Chat pembeli', href: '/admin/chats' },
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
            <Head title="Chat Pembeli & Materi AI" />
            <div className="min-h-screen w-full bg-slate-50 text-slate-900">
                <main className="mx-auto w-full max-w-7xl space-y-8 p-5 lg:p-10">
                    <header>
                        <p className="text-xs font-extrabold tracking-widest text-emerald-700 uppercase">Layanan Pembeli</p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-900">Chat pembeli</h1>
                        <p className="mt-2 max-w-3xl text-sm text-slate-600">
                            Chat yang tidak terjawab FAQ masuk ke antrean admin. Jawaban AI hanya menggunakan teks FAQ aktif yang Anda setujui.
                        </p>
                    </header>

                    {status && (
                        <div role="status" className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
                            {status}
                        </div>
                    )}

                    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 p-5">
                            <div>
                                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                                    <MessageCircle className="h-5 w-5 text-emerald-700" /> Kotak masuk
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">{needsReplyCount} percakapan perlu balasan admin</p>
                            </div>
                            {adminChatNeedsReplyCount !== needsReplyCount && <span className="text-xs text-slate-500">Memperbarui antrean...</span>}
                        </div>
                        <div className="grid min-h-[560px] lg:grid-cols-[320px_1fr]">
                            <aside className="max-h-[70vh] overflow-y-auto border-b border-slate-100 lg:border-r lg:border-b-0">
                                {conversations.data.map((conversation) => (
                                    <Link
                                        key={conversation.id}
                                        href={route('admin.chats.index', { conversation: conversation.id })}
                                        preserveScroll
                                        className={`block border-b border-slate-100 p-4 hover:bg-slate-50 ${selectedConversation?.id === conversation.id ? 'bg-emerald-50' : ''}`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="truncate font-semibold text-slate-900">{conversation.buyer.name}</span>
                                            {conversation.status === 'needs_admin' && (
                                                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" aria-label="Perlu balasan" />
                                            )}
                                        </div>
                                        <p className="truncate text-xs text-slate-500">{conversation.buyer.email}</p>
                                        <p className="mt-1 text-[11px] text-slate-400">
                                            {conversation.messages_count} pesan ·{' '}
                                            {conversation.last_message_at
                                                ? new Date(conversation.last_message_at).toLocaleString('id-ID')
                                                : 'Belum ada pesan'}
                                        </p>
                                    </Link>
                                ))}
                                {conversations.data.length === 0 && <p className="p-6 text-sm text-slate-500">Belum ada chat pembeli.</p>}
                                {conversations.links.length > 3 && (
                                    <nav aria-label="Halaman daftar chat" className="flex flex-wrap gap-1 p-3">
                                        {conversations.links.map((link, index) =>
                                            link.url ? (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    preserveScroll
                                                    className={`rounded-lg px-2.5 py-1.5 text-xs ${link.active ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ) : null,
                                        )}
                                    </nav>
                                )}
                            </aside>

                            <div className="flex min-h-[500px] flex-col">
                                {selectedConversation ? (
                                    <>
                                        <div className="border-b border-slate-100 p-4">
                                            <h3 className="font-bold text-slate-900">{selectedConversation.buyer.name}</h3>
                                            <p className="text-xs text-slate-500">{selectedConversation.buyer.email}</p>
                                            {selectedConversation.status === 'needs_admin' && (
                                                <p className="mt-2 text-xs font-semibold text-amber-700">Pembeli menunggu balasan admin</p>
                                            )}
                                        </div>
                                        <div className="flex max-h-[52vh] flex-1 flex-col gap-3 overflow-y-auto p-4">
                                            {selectedConversation.messages?.map((message) => {
                                                const isAdmin = message.sender_type === 'admin';
                                                return (
                                                    <div key={message.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                        <article
                                                            className={`max-w-[88%] rounded-2xl px-4 py-3 ${isAdmin ? 'bg-emerald-700 text-white' : message.sender_type === 'system' ? 'border border-amber-200 bg-amber-50 text-amber-900' : 'bg-slate-100 text-slate-800'}`}
                                                        >
                                                            {!isAdmin && (
                                                                <p className="mb-1 text-[11px] font-bold">
                                                                    {message.sender_type === 'buyer'
                                                                        ? 'Pembeli'
                                                                        : message.sender_type === 'ai'
                                                                          ? 'AI'
                                                                          : 'Pemberitahuan'}
                                                                </p>
                                                            )}
                                                            <p className="text-sm leading-6 break-words whitespace-pre-wrap">{message.body}</p>
                                                            <time
                                                                className={`mt-1 block text-right text-[10px] ${isAdmin ? 'text-emerald-100' : 'text-slate-400'}`}
                                                            >
                                                                {new Date(message.created_at).toLocaleString('id-ID')}
                                                            </time>
                                                        </article>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <form onSubmit={sendReply} className="border-t border-slate-100 p-4">
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
                                                    placeholder="Tulis balasan admin..."
                                                    className="min-h-12 flex-1 rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                                                />
                                                <Button
                                                    type="submit"
                                                    disabled={replyForm.processing || !replyForm.data.body.trim()}
                                                    className="h-11 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800"
                                                >
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Balas
                                                </Button>
                                            </div>
                                            {replyForm.errors.body && <p className="mt-2 text-xs text-red-600">{replyForm.errors.body}</p>}
                                        </form>
                                    </>
                                ) : (
                                    <div className="m-auto p-8 text-center text-slate-500">
                                        <MessageCircle className="mx-auto h-10 w-10 text-slate-300" />
                                        <p className="mt-3 font-semibold">Pilih chat untuk membaca pesan</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-5">
                        <div>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                                <Sparkles className="h-5 w-5 text-emerald-700" /> Materi jawaban AI
                            </h2>
                            <p className="mt-1 max-w-3xl text-sm text-slate-600">
                                Buat daftar pertanyaan yang sering masuk beserta jawaban resminya. AI hanya mengirim jawaban yang kamu tulis di sini.
                                Jika tidak menemukan jawaban yang cocok, chat akan diteruskan ke admin.
                            </p>
                            <p className="mt-1 text-xs text-slate-500">{faqs.total} materi tersimpan.</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                            <p className="text-sm font-bold text-slate-800">Cara menambahkan jawaban AI</p>
                            <ol className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                                <li className="flex gap-2">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                                        1
                                    </span>
                                    Tulis pertanyaan yang mungkin ditanyakan pembeli.
                                </li>
                                <li className="flex gap-2">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                                        2
                                    </span>
                                    Tulis jawaban resmi yang ingin diberikan.
                                </li>
                                <li className="flex gap-2">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                                        3
                                    </span>
                                    Tekan Tambah materi FAQ. Pastikan materi aktif.
                                </li>
                            </ol>
                        </div>
                        <form onSubmit={addFaq} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="new-faq-question">Pertanyaan</Label>
                                <Input
                                    id="new-faq-question"
                                    maxLength={1000}
                                    required
                                    value={faqForm.data.question}
                                    onChange={(event) => faqForm.setData('question', event.target.value)}
                                    placeholder="Contoh: Bagaimana cara mendapat salinan template?"
                                    className="bg-white text-slate-900 placeholder:text-slate-400"
                                />
                                {faqForm.errors.question && <p className="text-xs text-red-600">{faqForm.errors.question}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="new-faq-answer">Jawaban admin</Label>
                                <textarea
                                    id="new-faq-answer"
                                    maxLength={10000}
                                    required
                                    rows={3}
                                    value={faqForm.data.answer}
                                    onChange={(event) => faqForm.setData('answer', event.target.value)}
                                    placeholder="Tulis jawaban resmi yang akan dikirim AI..."
                                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-emerald-600"
                                />
                                {faqForm.errors.answer && <p className="text-xs text-red-600">{faqForm.errors.answer}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <Button type="submit" disabled={faqForm.processing} className="rounded-xl bg-emerald-700 text-white">
                                    Tambah materi FAQ
                                </Button>
                            </div>
                        </form>
                        <div className="grid gap-4 lg:grid-cols-2">
                            {faqs.data.map((faq) => (
                                <FaqEditor key={faq.id} faq={faq} />
                            ))}
                            {faqs.data.length === 0 && (
                                <p className="rounded-2xl border border-dashed p-6 text-sm text-slate-500">
                                    Belum ada FAQ. Chat pembeli akan diteruskan ke admin sampai materi ditambahkan.
                                </p>
                            )}
                        </div>
                        {faqs.links.length > 3 && (
                            <nav aria-label="Halaman materi FAQ" className="flex flex-wrap gap-2">
                                {faqs.links.map((link, index) =>
                                    link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            preserveScroll
                                            className={`rounded-lg px-3 py-2 text-xs ${link.active ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : null,
                                )}
                            </nav>
                        )}
                    </section>
                </main>
            </div>
        </AppLayout>
    );
}

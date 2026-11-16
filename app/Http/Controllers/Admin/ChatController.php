<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatConversation;
use App\Models\ChatFaq;
use App\Models\ChatMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index(Request $request): Response
    {
        $conversations = ChatConversation::query()
            ->with('buyer:id,name,email')
            ->withCount('messages')
            ->orderByRaw('CASE WHEN status = ? THEN 0 ELSE 1 END', [ChatConversation::STATUS_NEEDS_ADMIN])
            ->orderByDesc('last_message_at')
            ->paginate(30)
            ->withQueryString();

        $selectedId = $request->integer('conversation');
        $selectedConversation = $selectedId > 0
            ? ChatConversation::query()->with('buyer:id,name,email')->find($selectedId)
            : null;

        if ($selectedConversation !== null) {
            $selectedConversation->setRelation(
                'messages',
                $selectedConversation->messages()->orderByDesc('id')->limit(100)->get()->reverse()->values(),
            );
        }

        return Inertia::render('admin/chats', [
            'conversations' => $conversations,
            'selectedConversation' => $selectedConversation,
            'faqs' => ChatFaq::query()
                ->orderByDesc('id')
                ->paginate(20, ['id', 'question', 'answer', 'is_active'], 'faq_page')
                ->withQueryString(),
            'needsReplyCount' => ChatConversation::query()->where('status', ChatConversation::STATUS_NEEDS_ADMIN)->count(),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function reply(Request $request, ChatConversation $conversation): RedirectResponse
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        DB::transaction(function () use ($request, $conversation, $validated) {
            $lockedConversation = ChatConversation::query()->lockForUpdate()->findOrFail($conversation->id);
            $lockedConversation->messages()->create([
                'sender_type' => ChatMessage::SENDER_ADMIN,
                'sender_id' => $request->user()->id,
                'body' => trim($validated['body']),
            ]);
            $lockedConversation->update([
                'status' => ChatConversation::STATUS_WAITING_CUSTOMER,
                'last_message_at' => now(),
                'needs_admin_at' => null,
            ]);
        });

        return to_route('admin.chats.index', ['conversation' => $conversation->id])
            ->with('status', 'Balasan berhasil dikirim.');
    }

    public function storeFaq(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:1000'],
            'answer' => ['required', 'string', 'max:10000'],
        ]);

        ChatFaq::query()->create([
            ...$validated,
            'created_by' => $request->user()->id,
            'is_active' => true,
        ]);

        return to_route('admin.chats.index')->with('status', 'FAQ ditambahkan sebagai materi jawaban AI.');
    }

    public function updateFaq(Request $request, ChatFaq $faq): RedirectResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:1000'],
            'answer' => ['required', 'string', 'max:10000'],
            'is_active' => ['required', 'boolean'],
        ]);

        $faq->update($validated);

        return to_route('admin.chats.index')->with('status', 'Materi FAQ berhasil diperbarui.');
    }

    public function destroyFaq(ChatFaq $faq): RedirectResponse
    {
        $faq->delete();

        return to_route('admin.chats.index')->with('status', 'FAQ dihapus dari materi jawaban AI.');
    }
}

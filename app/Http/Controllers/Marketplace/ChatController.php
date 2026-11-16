<?php

namespace App\Http\Controllers\Marketplace;

use App\Exceptions\ChatFaqMatchException;
use App\Http\Controllers\Controller;
use App\Models\ChatConversation;
use App\Models\ChatFaq;
use App\Models\ChatMessage;
use App\Services\ChatFaqMatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    public function index(Request $request): RedirectResponse
    {
        abort_if($request->user()->isAdmin(), 403);

        return to_route('home', ['openChat' => 1]);
    }

    public function widget(Request $request): JsonResponse
    {
        abort_if($request->user()->isAdmin(), 403);

        $conversation = ChatConversation::query()->where('buyer_id', $request->user()->id)->first();
        $this->markBuyerRepliesRead($conversation);

        return response()->json($this->conversationPayload($conversation));
    }

    public function unread(Request $request): JsonResponse
    {
        abort_if($request->user()->isAdmin(), 403);

        $count = ChatMessage::query()
            ->whereIn('sender_type', [ChatMessage::SENDER_AI, ChatMessage::SENDER_ADMIN])
            ->whereNull('buyer_read_at')
            ->whereHas('conversation', fn ($query) => $query->where('buyer_id', $request->user()->id))
            ->count();

        return response()->json(['count' => $count]);
    }

    public function store(Request $request, ChatFaqMatcher $matcher): RedirectResponse|JsonResponse
    {
        abort_if($request->user()->isAdmin(), 403);
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $now = now();
        $conversation = DB::transaction(function () use ($request, $validated, $now) {
            $conversation = ChatConversation::query()->firstOrCreate(
                ['buyer_id' => $request->user()->id],
                ['status' => ChatConversation::STATUS_OPEN],
            );
            $conversation->messages()->create([
                'sender_type' => ChatMessage::SENDER_BUYER,
                'sender_id' => $request->user()->id,
                'body' => trim($validated['body']),
            ]);
            $conversation->update([
                'status' => ChatConversation::STATUS_NEEDS_ADMIN,
                'last_message_at' => $now,
                'needs_admin_at' => $conversation->needs_admin_at ?? $now,
            ]);

            return $conversation->fresh();
        });

        $faq = null;
        try {
            $faq = $matcher->match(
                trim($validated['body']),
                ChatFaq::query()->where('is_active', true),
            );
        } catch (ChatFaqMatchException $exception) {
            Log::warning('AI FAQ matching failed; customer chat was escalated to admin.', [
                'conversation_id' => $conversation->id,
                'reason' => $exception->getMessage(),
            ]);
        }

        if ($faq !== null) {
            $conversation->messages()->create([
                'sender_type' => ChatMessage::SENDER_AI,
                'body' => $faq->answer,
            ]);
            $conversation->update([
                'status' => ChatConversation::STATUS_OPEN,
                'last_message_at' => now(),
                'needs_admin_at' => null,
            ]);

            if ($request->expectsJson()) {
                $this->markBuyerRepliesRead($conversation);

                return response()->json($this->conversationPayload($conversation->fresh()));
            }

            return to_route('chat.index');
        }

        $conversation->messages()->create([
            'sender_type' => ChatMessage::SENDER_SYSTEM,
            'body' => 'Pertanyaan ini saya teruskan ke admin agar dibantu langsung. Silakan tunggu balasan di chat ini.',
        ]);
        $conversation->update([
            'status' => ChatConversation::STATUS_NEEDS_ADMIN,
            'last_message_at' => now(),
            'needs_admin_at' => $conversation->needs_admin_at ?? $now,
        ]);

        if ($request->expectsJson()) {
            $this->markBuyerRepliesRead($conversation);

            return response()->json($this->conversationPayload($conversation->fresh()));
        }

        return to_route('chat.index');
    }

    private function markBuyerRepliesRead(?ChatConversation $conversation): void
    {
        $conversation?->messages()
            ->whereIn('sender_type', [ChatMessage::SENDER_AI, ChatMessage::SENDER_ADMIN])
            ->whereNull('buyer_read_at')
            ->update(['buyer_read_at' => now()]);
    }

    /**
     * @return array{conversation: array{id: int|null, status: string}, messages: array<int, array<string, mixed>>}
     */
    private function conversationPayload(?ChatConversation $conversation): array
    {
        $messages = $conversation
            ? $conversation->messages()
                ->orderByDesc('id')
                ->limit(100)
                ->get(['id', 'sender_type', 'body', 'created_at'])
                ->reverse()
                ->values()
                ->all()
            : [];

        return [
            'conversation' => [
                'id' => $conversation?->id,
                'status' => $conversation?->status ?? ChatConversation::STATUS_OPEN,
            ],
            'messages' => $messages,
        ];
    }
}

<?php

use App\Models\ChatConversation;
use App\Models\ChatFaq;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Http;

test('AI replies with an exact admin-approved FAQ answer when it selects a match', function () {
    config([
        'services.gemini.api_key' => 'gemini-chat-test-key',
        'services.gemini.model' => 'gemini-test-model',
    ]);
    Http::fake(function (HttpRequest $request) {
        if (str_contains($request->url(), ':generateContent')) {
            return Http::response([
                'candidates' => [[
                    'content' => ['parts' => [['text' => '{"faq_id":1}']]],
                ]],
            ]);
        }

        return Http::response(['error' => 'Unexpected request'], 500);
    });

    $buyer = User::factory()->create();
    $faq = ChatFaq::create([
        'question' => 'Bagaimana cara mengunduh template?',
        'answer' => 'Buka menu Pesanan Saya setelah pembayaran berhasil.',
        'is_active' => true,
    ]);

    $this->actingAs($buyer)->post('/chat/messages', ['body' => 'Bagaimana saya mendapatkan template yang dibeli?'])
        ->assertRedirect('/chat');

    $conversation = ChatConversation::where('buyer_id', $buyer->id)->firstOrFail();
    expect($conversation->status)->toBe(ChatConversation::STATUS_OPEN)
        ->and($conversation->messages()->count())->toBe(2);
    $this->assertDatabaseHas('chat_messages', [
        'conversation_id' => $conversation->id,
        'sender_type' => ChatMessage::SENDER_AI,
        'body' => $faq->answer,
    ]);

    Http::assertSent(fn (HttpRequest $request) => str_contains($request->url(), ':generateContent')
        && $request->hasHeader('x-goog-api-key', 'gemini-chat-test-key')
        && str_contains($request['contents'][0]['parts'][0]['text'], $faq->question)
        && ! str_contains($request['contents'][0]['parts'][0]['text'], $faq->answer));
});

test('AI matching continues through FAQ batches without imposing a fixed FAQ count', function () {
    config([
        'services.gemini.api_key' => 'gemini-chat-test-key',
        'services.gemini.model' => 'gemini-test-model',
    ]);
    Http::fake(function (HttpRequest $request) {
        $requestText = $request['contents'][0]['parts'][0]['text'];
        $faqBatch = json_decode(substr($requestText, strpos($requestText, "\n") + 1), true);
        $hasLastFaq = collect($faqBatch['approved_faq_questions'] ?? [])->contains('id', 45);

        return Http::response([
            'candidates' => [[
                'content' => ['parts' => [['text' => $hasLastFaq ? '{"faq_id":45}' : '{"faq_id":null}']]],
            ]],
        ]);
    });

    $buyer = User::factory()->create();
    for ($index = 1; $index <= 45; $index++) {
        ChatFaq::create([
            'question' => "Pertanyaan FAQ nomor {$index}",
            'answer' => "Jawaban resmi nomor {$index}",
            'is_active' => true,
        ]);
    }

    $this->actingAs($buyer)->post('/chat/messages', ['body' => 'Apa jawaban FAQ yang terakhir?'])
        ->assertRedirect('/chat');

    $conversation = ChatConversation::where('buyer_id', $buyer->id)->firstOrFail();
    $this->assertDatabaseHas('chat_messages', [
        'conversation_id' => $conversation->id,
        'sender_type' => ChatMessage::SENDER_AI,
        'body' => 'Jawaban resmi nomor 45',
    ]);
    expect($conversation->fresh()->status)->toBe(ChatConversation::STATUS_OPEN);
    Http::assertSentCount(2);
});

test('unmatched buyer question is escalated and admin reply clears the notification', function () {
    config([
        'services.gemini.api_key' => 'gemini-chat-test-key',
        'services.gemini.model' => 'gemini-test-model',
    ]);
    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [['content' => ['parts' => [['text' => '{"faq_id":null}']]]]],
        ]),
    ]);

    $buyer = User::factory()->create();
    $otherBuyer = User::factory()->create();
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    ChatFaq::create([
        'question' => 'Bagaimana cara membayar?',
        'answer' => 'Ikuti petunjuk QRIS saat checkout.',
        'is_active' => true,
    ]);

    $this->actingAs($buyer)->post('/chat/messages', ['body' => 'Apakah file saya bisa dibuka di tablet?'])
        ->assertRedirect('/chat');

    $conversation = ChatConversation::where('buyer_id', $buyer->id)->firstOrFail();
    expect($conversation->status)->toBe(ChatConversation::STATUS_NEEDS_ADMIN);
    $this->assertDatabaseHas('chat_messages', [
        'conversation_id' => $conversation->id,
        'sender_type' => ChatMessage::SENDER_SYSTEM,
        'body' => 'Pertanyaan ini saya teruskan ke admin agar dibantu langsung. Silakan tunggu balasan di chat ini.',
    ]);
    $this->actingAs($otherBuyer)->get('/chat')->assertRedirect(route('home', ['openChat' => 1]));

    $this->actingAs($admin)->get('/admin/chats')->assertInertia(fn ($page) => $page
        ->component('admin/chats')
        ->where('needsReplyCount', 1)
        ->where('adminChatNeedsReplyCount', 1)
        ->where('conversations.data.0.buyer.id', $buyer->id));
    $this->actingAs($admin)->get("/admin/chats?conversation={$conversation->id}")->assertInertia(fn ($page) => $page
        ->where('selectedConversation.id', $conversation->id)
        ->where('selectedConversation.messages.0.sender_type', ChatMessage::SENDER_BUYER));

    $this->actingAs($admin)->post("/admin/chats/{$conversation->id}/messages", [
        'body' => 'Bisa, template dapat dibuka melalui Google Sheets di tablet.',
    ])->assertRedirect(route('admin.chats.index', ['conversation' => $conversation->id]));

    expect($conversation->fresh()->status)->toBe(ChatConversation::STATUS_WAITING_CUSTOMER)
        ->and($conversation->fresh()->needs_admin_at)->toBeNull();
    $this->actingAs($admin)->get('/admin/chats')->assertInertia(fn ($page) => $page
        ->where('needsReplyCount', 0)
        ->where('adminChatNeedsReplyCount', 0));

    $this->actingAs($buyer)->getJson('/chat/unread')->assertOk()->assertExactJson(['count' => 1]);
    $this->actingAs($buyer)->getJson('/chat/widget')->assertOk()->assertJsonPath('messages.2.sender_type', ChatMessage::SENDER_ADMIN)
        ->assertJsonPath('messages.2.body', 'Bisa, template dapat dibuka melalui Google Sheets di tablet.');
    $this->assertDatabaseMissing('chat_messages', [
        'conversation_id' => $conversation->id,
        'sender_type' => ChatMessage::SENDER_ADMIN,
        'buyer_read_at' => null,
    ]);
    $this->actingAs($buyer)->getJson('/chat/unread')->assertOk()->assertExactJson(['count' => 0]);
});

test('chat widget accepts JSON messages and marks an AI reply as read', function () {
    config([
        'services.gemini.api_key' => 'gemini-chat-test-key',
        'services.gemini.model' => 'gemini-test-model',
    ]);
    Http::fake([
        'https://generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [['content' => ['parts' => [['text' => '{"faq_id":1}']]]]],
        ]),
    ]);

    $buyer = User::factory()->create();
    $faq = ChatFaq::create([
        'question' => 'Bagaimana cara mengunduh template?',
        'answer' => 'Buka menu Pesanan Saya.',
        'is_active' => true,
    ]);

    $this->actingAs($buyer)->postJson('/chat/messages', ['body' => 'Bagaimana cara mendapatkan file?'])
        ->assertOk()
        ->assertJsonPath('messages.1.sender_type', ChatMessage::SENDER_AI)
        ->assertJsonPath('messages.1.body', $faq->answer);

    $conversation = ChatConversation::where('buyer_id', $buyer->id)->firstOrFail();
    $this->assertDatabaseMissing('chat_messages', [
        'conversation_id' => $conversation->id,
        'sender_type' => ChatMessage::SENDER_AI,
        'buyer_read_at' => null,
    ]);
    $this->actingAs($buyer)->getJson('/chat/unread')->assertOk()->assertExactJson(['count' => 0]);
});

test('chat messages are escalated when Gemini is unavailable instead of receiving an AI guess', function () {
    config(['services.gemini.api_key' => null]);
    Http::fake();
    $buyer = User::factory()->create();
    ChatFaq::create([
        'question' => 'Apakah template dapat diedit?',
        'answer' => 'Ya, salinan template dapat diedit.',
        'is_active' => true,
    ]);

    $this->actingAs($buyer)->post('/chat/messages', ['body' => 'Apakah template dapat diedit?'])->assertRedirect('/chat');

    $conversation = ChatConversation::where('buyer_id', $buyer->id)->firstOrFail();
    expect($conversation->status)->toBe(ChatConversation::STATUS_NEEDS_ADMIN)
        ->and($conversation->messages()->where('sender_type', ChatMessage::SENDER_AI)->exists())->toBeFalse();
    Http::assertNothingSent();
});

test('only admins can manage the chat FAQ knowledge base', function () {
    Http::fake();
    $buyer = User::factory()->create();
    $faq = ChatFaq::create(['question' => 'FAQ?', 'answer' => 'Jawaban', 'is_active' => true]);

    $this->actingAs($buyer)->post('/admin/chat-faqs', [
        'question' => 'Pertanyaan baru?',
        'answer' => 'Jawaban baru',
    ])->assertForbidden();
    $this->actingAs($buyer)->patch("/admin/chat-faqs/{$faq->id}", [
        'question' => 'Diubah?',
        'answer' => 'Diubah',
        'is_active' => false,
    ])->assertForbidden();
    $this->actingAs($buyer)->delete("/admin/chat-faqs/{$faq->id}")->assertForbidden();

    expect($faq->fresh()->question)->toBe('FAQ?');
    Http::assertNothingSent();
});

test('admins can create, edit, and deactivate approved FAQ answers', function () {
    $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

    $this->actingAs($admin)->post('/admin/chat-faqs', [
        'question' => 'Bagaimana mengakses pesanan?',
        'answer' => 'Buka menu Pesanan Saya.',
    ])->assertRedirect('/admin/chats');

    $faq = ChatFaq::firstOrFail();
    expect($faq->is_active)->toBeTrue();

    $this->actingAs($admin)->patch("/admin/chat-faqs/{$faq->id}", [
        'question' => 'Bagaimana membuka riwayat pesanan?',
        'answer' => 'Pilih Pesanan Saya di menu akun.',
        'is_active' => false,
    ])->assertRedirect('/admin/chats');

    expect($faq->fresh()->question)->toBe('Bagaimana membuka riwayat pesanan?')
        ->and($faq->fresh()->is_active)->toBeFalse();
});

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessage extends Model
{
    public const SENDER_BUYER = 'buyer';

    public const SENDER_ADMIN = 'admin';

    public const SENDER_AI = 'ai';

    public const SENDER_SYSTEM = 'system';

    protected $fillable = ['conversation_id', 'sender_type', 'sender_id', 'body', 'buyer_read_at'];

    protected function casts(): array
    {
        return ['buyer_read_at' => 'datetime'];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(ChatConversation::class, 'conversation_id');
    }
}

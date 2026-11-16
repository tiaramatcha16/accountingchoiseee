<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatConversation extends Model
{
    public const STATUS_OPEN = 'open';

    public const STATUS_NEEDS_ADMIN = 'needs_admin';

    public const STATUS_WAITING_CUSTOMER = 'waiting_customer';

    protected $fillable = ['buyer_id', 'status', 'last_message_at', 'needs_admin_at'];

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
            'needs_admin_at' => 'datetime',
        ];
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'conversation_id');
    }
}

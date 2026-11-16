<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    public const STATUS_DRAFT = 'draft';

    public const STATUS_PUBLISHED = 'published';

    public const STATUS_ARCHIVED = 'archived';

    protected $hidden = ['file_path', 'google_sheet_id', 'usage_guide'];

    protected $fillable = [
        'created_by', 'title', 'slug', 'category', 'description', 'price',
        'file_path', 'original_filename', 'google_sheet_id', 'usage_guide', 'status', 'download_count', 'published_at',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'download_count' => 'integer',
            'published_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}

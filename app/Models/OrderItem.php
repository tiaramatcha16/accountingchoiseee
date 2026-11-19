<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $hidden = ['file_path', 'google_sheet_id', 'delivery_file_id'];

    protected $appends = ['delivery_type'];

    protected $fillable = [
        'order_id', 'product_id', 'unit_number', 'product_title', 'unit_price', 'file_path', 'file_name',
        'google_sheet_id', 'recipient_email', 'delivery_file_id', 'delivery_url',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'integer',
            'unit_number' => 'integer',
        ];
    }

    public function getDeliveryTypeAttribute(): string
    {
        return filled($this->google_sheet_id) ? 'google_sheets' : 'file';
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}

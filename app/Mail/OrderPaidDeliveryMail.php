<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Attachment;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use RuntimeException;

class OrderPaidDeliveryMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Template Excel untuk pesanan '.$this->order->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-paid-delivery',
        );
    }

    public function attachments(): array
    {
        return $this->order->items
            ->filter(fn ($item) => is_string($item->file_path) && $item->file_path !== '')
            ->map(function ($item): Attachment {
                $fileName = $item->file_name ?: $item->product?->original_filename;

                if (! is_string($item->file_path) || ! is_string($fileName)) {
                    throw new RuntimeException('Purchased Excel file snapshot is missing.');
                }

                return Attachment::fromStorageDisk('local', $item->file_path)->as($fileName);
            })
            ->all();
    }
}

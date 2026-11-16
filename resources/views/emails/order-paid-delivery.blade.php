<p>Halo {{ $order->customer_name }},</p>

<p>Pembayaran untuk pesanan <strong>{{ $order->order_number }}</strong> sudah berhasil dikonfirmasi.</p>

<p>Salinan spreadsheet yang Anda beli tersedia melalui tautan di bawah. File Excel terlampir jika produknya berupa file. Anda juga dapat membuka semua item melalui halaman Pesanan Saya.</p>

<ul>
    @foreach ($order->items as $item)
        <li>
            {{ $item->product_title }}:
            @if ($item->delivery_url)
                <a href="{{ $item->delivery_url }}">Buka salinan Google Sheets</a>
            @elseif ($item->file_path)
                File Excel terlampir
            @else
                Salinan sedang disiapkan
            @endif
        </li>
    @endforeach
</ul>

<p>Terima kasih telah berbelanja di AccountingChoice.</p>

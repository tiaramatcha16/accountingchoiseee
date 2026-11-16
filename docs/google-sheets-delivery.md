# Pengiriman template Google Sheets

Admin menyimpan link master Google Sheets. Setelah Midtrans mengonfirmasi pembayaran, aplikasi membuat salinan untuk setiap item pesanan, membagikannya ke email pembeli sebagai editor, lalu mengirim link salinan melalui email dan halaman **Pesanan Saya**. Link dan ID master tidak ditampilkan ke pembeli. Pesanan offline atau yang belum dibayar tidak menghasilkan salinan.

## Konfigurasi Google Drive

1. Aktifkan Google Drive API dan Google Sheets API di project Google Cloud yang akan dipakai.
2. Buat OAuth client dan refresh token dengan scope `https://www.googleapis.com/auth/drive`. Scope ini diperlukan agar aplikasi dapat menyalin spreadsheet yang master-nya dibagikan ke akun Google tersebut.
3. Pastikan akun Google OAuth memiliki akses ke setiap spreadsheet master yang akan dijual. File master harus berupa Google Sheets, bukan file Excel yang hanya disimpan di Drive.
4. Isi variabel berikut di `.env` server. Jangan kirim atau commit nilai rahasia ke repositori:

   ```dotenv
   GOOGLE_DRIVE_CLIENT_ID=
   GOOGLE_DRIVE_CLIENT_SECRET=
   GOOGLE_DRIVE_REFRESH_TOKEN=
   GOOGLE_DRIVE_FOLDER_ID=
   ```

   `GOOGLE_DRIVE_FOLDER_ID` bersifat opsional; jika diisi, salinan pembeli dibuat di folder tersebut.
5. Setelah konfigurasi tersedia, bersihkan cache konfigurasi Laravel saat deploy. Pastikan layanan email dan Midtrans juga telah dikonfigurasi sebelum menerima pembayaran.

Checkout memeriksa akses ke master sebelum membuat transaksi Midtrans agar pembeli tidak membayar untuk template yang tidak dapat dikirim. Jika Google Drive gagal setelah pembayaran terverifikasi, notifikasi Midtrans menerima respons retry dan pesanan tetap berstatus dibayar sampai proses salin dan berbagi berhasil.

Pembeli harus menggunakan alamat email yang dapat menerima undangan Google Drive. Salinan dibagikan sebagai editor ke email checkout, bukan dimasukkan ke Drive milik pembeli.

## Membuat judul dan deskripsi dengan AI

1. Aktifkan Gemini API dan isi `GEMINI_API_KEY` di `.env` server. `GEMINI_MODEL` opsional; nilai bawaan adalah `gemini-2.5-flash`.
2. Pada formulir template admin, masukkan link Google Sheets. Saat formulir baru masih kosong, AI akan mencoba mengisi judul, deskripsi, dan fitur setelah link ditinggalkan; tombol **Buat ... dengan AI** dapat dipakai untuk membuat atau memperbarui hasil kapan saja.
3. Hasilnya masuk ke kolom judul dan deskripsi biasa, jadi admin dapat mengeditnya sebelum menyimpan produk.

Untuk ringkasan, server membaca maksimal 6 tab, masing-masing sampai 40 baris dan 20 kolom. Sampel berisi teks dan rumus; nilai numerik serta pola email dan nomor telepon disisihkan/disamarkan. Sampel tersebut dikirim ke Gemini. Jangan gunakan fitur AI pada master yang berisi informasi rahasia atau data pribadi yang tidak boleh diproses oleh penyedia AI.

## Membuat draft panduan penggunaan dengan AI

Di formulir tambah atau edit template admin, tombol **Buat draft panduan dengan AI** mengisi kolom panduan tanpa menyimpan atau menerbitkan hasil secara otomatis. Admin dapat memberi catatan tambahan, mengedit draft, lalu menyimpannya bersama template. Jika link Google Sheets tersedia, fitur ini hanya meminta nama maksimal 6 tab dan nilai teks pada baris pertama (maksimal 20 kolom per tab); baris transaksi tidak diminta. Email, nomor telepon, dan tautan yang terdeteksi pada materi yang dikirim disamarkan. Untuk template Excel tanpa link Google Sheets, AI menggunakan judul, kategori, deskripsi, dan catatan admin saja.

Materi yang digunakan untuk menyusun draft dikirim ke Gemini. Jangan masukkan rahasia atau data pribadi pada deskripsi maupun catatan. Draft dapat menandai bagian yang perlu dikonfirmasi; admin wajib memeriksa dan mengedit hasilnya sebelum menyimpannya sebagai panduan pembeli.

## Chat pembeli dan materi jawaban AI

Pembeli yang login dapat membuka **Chat Admin** dari menu akun atau tombol chat mengambang yang selalu terlihat di halaman toko. Tombol tersebut membuka popup yang dapat ditutup tanpa menghapus percakapan; balasan AI/admin yang belum dibaca ditandai pada tombol chat dan diperbarui otomatis. Setiap akun memiliki satu percakapan yang tersimpan dan tidak dihapus saat berpindah halaman. AI mencocokkan pertanyaan dengan semua FAQ aktif yang dimasukkan admin secara berkelompok; jumlah FAQ tidak dibatasi oleh aplikasi. Jika Gemini memilih FAQ yang tersedia, pembeli menerima jawaban admin persis seperti ditulis; AI tidak membuat isi jawaban sendiri. Jika tidak ada FAQ yang cocok, Gemini tidak tersedia, atau hasilnya tidak valid, pembeli diberi tahu bahwa pertanyaannya diteruskan ke admin. Percakapan akan muncul dengan badge jumlah balasan yang perlu ditangani di menu **Chat pembeli** admin.

Admin dapat membalas langsung dari inbox dan menambah, mengedit, menonaktifkan, atau menghapus FAQ di halaman yang sama. Pertanyaan pembeli beserta FAQ yang sedang aktif dikirim ke Gemini untuk pencocokan; jawaban FAQ tidak dikirim sebagai konteks AI dan tidak ada pesan yang dikirim jika konfigurasinya kosong. Riwayat ditampilkan dan diperbarui otomatis saat halaman chat terbuka.

## Rekomendasi template dengan AI

Pada katalog **Template**, pembeli dapat menceritakan kebutuhannya dan meminta rekomendasi. Setelah pembeli menyetujui pemberitahuan pemrosesan, server mengirim deskripsi kebutuhan serta metadata produk yang sudah dipublikasikan (judul, kategori, deskripsi, dan harga) ke Gemini. ID master Google Sheets, link salinan pembeli, dan produk draft tidak dikirim. Hasil Gemini hanya diterima jika ID produknya ada di katalog publik dan alasan rekomendasinya mengutip teks yang benar-benar ada di detail produk. Fitur ini dibatasi enam permintaan per menit; jangan minta pembeli memasukkan data pribadi atau rahasia.

## Panduan penggunaan template setelah pembelian

Pada halaman **Pesanan Saya**, setiap pesanan lunas memiliki tombol **Panduan AI** untuk masing-masing template. Admin mengisi materi pada kolom **Panduan Penggunaan untuk AI** ketika menambahkan atau mengedit template. Template baru tidak dapat diterbitkan sebelum panduan minimal 30 karakter disiapkan; template lama perlu dilengkapi melalui halaman **Kelola Template**. Template lama yang belum memiliki materi akan menampilkan status **Perlu diisi** dan AI tidak akan menjawab sampai panduannya tersedia.

Pembeli harus menyetujui pemberitahuan sebelum mengirim pertanyaan dan riwayat percakapan ke Gemini. Server hanya mengirim judul, materi panduan, pertanyaan, dan konteks percakapan; salinan spreadsheet, email, pesanan, dan data pembeli tidak dibaca atau dikirim. Tautan Google Sheets master yang terdeteksi di panduan, pertanyaan, atau riwayat disamarkan sebelum dikirim. Jawaban hanya ditampilkan jika Gemini menyertakan kutipan yang cocok persis dengan panduan; jika tidak, pembeli diarahkan untuk menghubungi admin. Fitur ini dibatasi sepuluh pertanyaan per menit. Admin sebaiknya menulis langkah awal, cara mengisi, arti kolom, dan fitur otomatis tanpa menyertakan data rahasia.

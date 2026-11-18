<?php

$primaryKey = env('GEMINI_API_KEY');
$multiKeys = env('GEMINI_API_KEYS');

$parsedKeys = [];
if (filled($multiKeys)) {
    $parsedKeys = array_map('trim', explode(',', (string) $multiKeys));
}

$allKeys = array_values(array_unique(array_filter([$primaryKey, ...$parsedKeys])));

return [
    /*
    |--------------------------------------------------------------------------
    | Gemini API Keys (Single & Multi-Key / Failover Support)
    |--------------------------------------------------------------------------
    |
    | 1 Tempat Terpusat untuk semua fitur AI di aplikasi (Judul/Deskripsi Produk,
    | Chat FAQ Otomatis, Rekomendasi Produk, Panduan Penggunaan, & Analisis Penjualan).
    |
    | - GEMINI_API_KEY : 1 API key utama.
    | - GEMINI_API_KEYS: Daftar beberapa API key cadangan sekaligus (dipisah koma).
    |   Contoh di .env: GEMINI_API_KEYS=key1,key2,key3
    |
    | Jika satu key terkena limit (HTTP 429 / kuota habis), sistem akan
    | otomatis berpindah ke key cadangan berikutnya tanpa perlu ganti satu-satu!
    |
    */
    'api_key' => $primaryKey,
    'api_keys' => $allKeys,

    /*
    |--------------------------------------------------------------------------
    | Model Default Gemini
    |--------------------------------------------------------------------------
    |
    | Cukup ubah model di sini atau lewat GEMINI_MODEL di .env, semua AI
    | di aplikasi akan otomatis mengikuti model ini.
    |
    */
    'model' => env('GEMINI_MODEL', 'gemini-flash-lite-latest'),

    /*
    |--------------------------------------------------------------------------
    | Pengaturan Endpoint & Timeout
    |--------------------------------------------------------------------------
    */
    'base_url' => env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta/models'),
    'timeout' => (int) env('GEMINI_TIMEOUT', 45),
];


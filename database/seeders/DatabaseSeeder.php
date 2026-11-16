<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adminEmail = config('auth.admin.email', env('ADMIN_EMAIL', 'kutirtiara16@gmail.com'));
        $adminName = config('auth.admin.name', env('ADMIN_NAME', 'admin'));
        $adminPassword = config('auth.admin.password', env('ADMIN_PASSWORD', 'rahasia'));

        // Admin account (configured via .env for store owner)
        $admin = User::firstOrNew(['email' => mb_strtolower(trim($adminEmail))]);
        $admin->fill([
            'name' => $adminName,
            'password' => $adminPassword,
        ]);
        $admin->role = User::ROLE_ADMIN;
        $admin->save();

        // Optional default buyer account for testing
        $buyer = User::firstOrNew(['email' => 'buyer@example.com']);
        $buyer->fill([
            'name' => 'User Buyer',
            'password' => 'password',
        ]);
        $buyer->role = User::ROLE_BUYER;
        $buyer->save();

        // Seed default published digital products if empty
        if (\App\Models\Product::count() === 0) {
            $defaultTemplates = [
                [
                    'title' => 'Template Laporan Keuangan UMKM 3-in-1',
                    'slug' => 'template-laporan-keuangan-umkm-3-in-1',
                    'category' => 'UMKM & Bisnis',
                    'description' => 'Laporan laba rugi, neraca, dan arus kas otomatis siap pakai untuk UMKM.',
                    'price' => 49000,
                ],
                [
                    'title' => 'Template Kalkulator Harga Pokok Penjualan (HPP) & Margin',
                    'slug' => 'template-kalkulator-hpp-margin',
                    'category' => 'UMKM & Bisnis',
                    'description' => 'Hitung HPP produk dan tetapkan margin keuntungan dengan akurat.',
                    'price' => 35000,
                ],
                [
                    'title' => 'Monthly Budget Planner',
                    'slug' => 'monthly-budget-planner',
                    'category' => 'Personal',
                    'description' => 'Kelola pos pengeluaran bulanan dan pantau tabungan secara terstruktur.',
                    'price' => 29000,
                ],
                [
                    'title' => 'Template Rekapitulasi Pajak UMKM (PPh Final 0.5%)',
                    'slug' => 'template-rekapitulasi-pajak-umkm',
                    'category' => 'Pajak',
                    'description' => 'Rekap omzet bulanan dan hitung PPh final PP 23/55 secara instan.',
                    'price' => 39000,
                ],
                [
                    'title' => 'Template Penghitungan PPh Pasal 21 Karyawan',
                    'slug' => 'template-penghitungan-pph-pasal-21',
                    'category' => 'Pajak',
                    'description' => 'Hitung pajak gaji karyawan dengan rumus tarif efektif TER terbaru.',
                    'price' => 45000,
                ],
                [
                    'title' => 'Debt Payoff Tracker',
                    'slug' => 'debt-payoff-tracker',
                    'category' => 'Personal',
                    'description' => 'Simulasi pelunasan utang metode snowball & avalanche terencana.',
                    'price' => 29000,
                ],
                [
                    'title' => 'Freelancer Income & Invoice Tracker',
                    'slug' => 'freelancer-income-invoice-tracker',
                    'category' => 'Freelancer',
                    'description' => 'Catat pemasukan per klien, piutang, dan status pembayaran invoice.',
                    'price' => 35000,
                ],
                [
                    'title' => 'Template Manajemen Inventaris & Stok Barang',
                    'slug' => 'template-manajemen-inventaris-stok',
                    'category' => 'UMKM & Bisnis',
                    'description' => 'Pantau stok barang masuk, keluar, dan peringatan stok menipis otomatis.',
                    'price' => 49000,
                ],
            ];

            foreach ($defaultTemplates as $tpl) {
                \App\Models\Product::create([
                    'created_by' => $admin->id,
                    'title' => $tpl['title'],
                    'slug' => $tpl['slug'],
                    'category' => $tpl['category'],
                    'description' => $tpl['description'],
                    'price' => $tpl['price'],
                    'file_path' => 'excel-templates/sample.xlsx',
                    'original_filename' => 'template.xlsx',
                    'status' => \App\Models\Product::STATUS_PUBLISHED,
                    'published_at' => now(),
                ]);
            }
        }
    }
}

<?php

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $adminEmail = config('auth.admin.email', env('ADMIN_EMAIL', 'kutirtiara16@gmail.com'));
        $adminName = config('auth.admin.name', env('ADMIN_NAME', 'admin'));
        $adminPassword = config('auth.admin.password', env('ADMIN_PASSWORD', 'rahasia'));

        // Ensure admin user exists
        $admin = User::firstOrNew(['email' => mb_strtolower(trim($adminEmail))]);
        $admin->fill([
            'name' => $adminName,
            'password' => $adminPassword,
        ]);
        $admin->role = User::ROLE_ADMIN;
        $admin->save();

        // Seed initial templates if product table is empty
        if (Product::count() === 0) {
            $initialTemplates = [
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
                    'category' => 'Keuangan Personal',
                    'description' => 'Kelola pos pengeluaran bulanan dan pantau tabungan secara terstruktur.',
                    'price' => 29000,
                ],
                [
                    'title' => 'Template Rekapitulasi Pajak UMKM (PPh Final 0.5%)',
                    'slug' => 'template-rekapitulasi-pajak-umkm',
                    'category' => 'Perpajakan',
                    'description' => 'Rekap omzet bulanan dan hitung PPh final PP 23/55 secara instan.',
                    'price' => 39000,
                ],
                [
                    'title' => 'Template Penghitungan PPh Pasal 21 Karyawan',
                    'slug' => 'template-penghitungan-pph-pasal-21',
                    'category' => 'Perpajakan',
                    'description' => 'Hitung pajak gaji karyawan dengan rumus tarif efektif TER terbaru.',
                    'price' => 45000,
                ],
                [
                    'title' => 'Debt Payoff Tracker',
                    'slug' => 'debt-payoff-tracker',
                    'category' => 'Keuangan Personal',
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

            foreach ($initialTemplates as $tpl) {
                Product::create([
                    'created_by' => $admin->id,
                    'title' => $tpl['title'],
                    'slug' => $tpl['slug'],
                    'category' => $tpl['category'],
                    'description' => $tpl['description'],
                    'price' => $tpl['price'],
                    'file_path' => 'excel-templates/sample.xlsx',
                    'original_filename' => 'template-keuangan.xlsx',
                    'status' => Product::STATUS_PUBLISHED,
                    'published_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        // Don't drop data on rollback
    }
};


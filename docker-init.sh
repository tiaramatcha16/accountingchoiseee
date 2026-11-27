#!/usr/bin/env bash
set -e

echo "=========================================================="
echo " 🚀 Menyiapkan & Menjalankan Tiara via Docker"
echo "=========================================================="

# 1. Pastikan .env tersedia
if [ ! -f .env ]; then
    echo "📋 Menyiapkan file .env dari .env.example..."
    cp .env.example .env
fi

# 2. Build dan jalankan container
echo "📦 Membangun dan menjalankan container (tiara_app, tiara_nginx, tiara_vite)..."
docker compose up -d --build

# 3. Tunggu container app siap
echo "⏳ Menunggu container app menginisialisasi dependensi..."
sleep 5

# 4. Inisialisasi Database (Migrasi dan Seeder)
echo "🗄️ Menjalankan migrasi dan seeder..."
docker compose exec app php artisan migrate --force
docker compose exec app php artisan db:seed --force

echo "=========================================================="
echo "🎉 Setup selesai! Proyek telah berjalan di Docker."
echo "=========================================================="
echo "🌐 URL Aplikasi     : http://localhost:8085"
echo "⚡ Vite Dev (HMR)   : http://localhost:5175"
echo "🗄️ MySQL Database   : mysql-global:3306 (DB: tiara)"
echo "👤 Akun Admin       : admin@accountingchoice.com / password"
echo "👤 Akun Buyer       : buyer@example.com / password"
echo "=========================================================="
echo "💡 Perintah praktis:"
echo "   - Pantau logs    : docker compose logs -f"
echo "   - Hentikan       : docker compose down"
echo "   - Helper Makefile: ketik 'make help'"
echo "=========================================================="

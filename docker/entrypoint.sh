#!/bin/sh
set -e

# Pastikan direktori penyimpanan Laravel dan framework tersedia
mkdir -p /var/www/html/storage/app/public \
         /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/bootstrap/cache

# Jika file .env belum ada, copy dari .env.example
if [ ! -f /var/www/html/.env ]; then
    echo "--> Menyiapkan file .env dari .env.example..."
    cp /var/www/html/.env.example /var/www/html/.env
fi

# Instal dependensi composer jika vendor belum ada
if [ ! -f /var/www/html/vendor/autoload.php ]; then
    echo "--> Vendor/autoload.php tidak ditemukan. Menjalankan composer install..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Generate APP_KEY jika belum diset
if ! grep -q "^APP_KEY=base64:" /var/www/html/.env; then
    echo "--> Menghasilkan application key..."
    php artisan key:generate --force
fi

# Buat symlink public storage jika belum ada
if [ ! -L /var/www/html/public/storage ]; then
    echo "--> Membuat symlink public storage..."
    php artisan storage:link || true
fi

echo "--> Container PHP-FPM siap dijalankan!"
exec "$@"

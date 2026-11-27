.PHONY: help up down restart logs build setup migrate seed fresh-seed tinker bash bash-node composer-install npm-build cache-clear

help:
	@echo "=========================================================="
	@echo " Tiara - Docker Helper Commands"
	@echo "=========================================================="
	@echo "  make up               - Jalankan semua container (background)"
	@echo "  make down             - Hentikan container"
	@echo "  make restart          - Restart semua container"
	@echo "  make logs             - Pantau output logs semua container"
	@echo "  make build            - Rebuild image container Docker"
	@echo "  make setup            - Jalankan composer, generate key, migrate & seed"
	@echo "  make migrate          - Jalankan migrasi database"
	@echo "  make seed             - Jalankan database seeders"
	@echo "  make fresh-seed       - Reset database & jalankan seeders (migrate:fresh --seed)"
	@echo "  make tinker           - Masuk ke Laravel Tinker CLI"
	@echo "  make bash             - Masuk terminal container backend (PHP)"
	@echo "  make bash-node        - Masuk terminal container frontend (Vite)"
	@echo "  make composer-install - Jalankan composer install di container"
	@echo "  make npm-build        - Jalankan build frontend produksi (vite build)"
	@echo "  make cache-clear      - Bersihkan cache Laravel (optimize:clear)"
	@echo "=========================================================="

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

build:
	docker compose build

setup:
	docker compose exec app composer install --no-interaction --prefer-dist --optimize-autoloader
	docker compose exec app php artisan key:generate --force
	docker compose exec app php artisan storage:link || true
	docker compose exec app php artisan migrate --force
	docker compose exec app php artisan db:seed --force

migrate:
	docker compose exec app php artisan migrate

seed:
	docker compose exec app php artisan db:seed

fresh-seed:
	docker compose exec app php artisan migrate:fresh --seed

tinker:
	docker compose exec app php artisan tinker

bash:
	docker compose exec app sh

bash-node:
	docker compose exec vite sh

composer-install:
	docker compose exec app composer install

npm-build:
	docker compose exec vite npm run build

cache-clear:
	docker compose exec app php artisan optimize:clear

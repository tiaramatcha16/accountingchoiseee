# Panduan Menjalankan Tiara dengan Docker

Proyek ini telah dikonfigurasi penuh untuk dijalankan menggunakan **Docker Compose** dan terintegrasi dengan shared environment di `shared-docker`.

---

## 🏛️ Arsitektur Layanan

| Layanan | Container Name | Image / Base | Port Host | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| **Backend** | `tiara_app` | PHP 8.4-FPM (Alpine) | Internal (9000) | Menjalankan Laravel 12 & Composer |
| **Web Server** | `tiara_nginx` | Nginx Alpine | `http://localhost:8085` | Reverse proxy FastCGI untuk Laravel |
| **Frontend** | `tiara_vite` | Node 22 (Alpine) | `http://localhost:5175` | Vite Hot Module Replacement (HMR) & React |
| **Database** | `global_mysql_database` | MySQL 8.0 | `3306` (host) / `mysql-global:3306` (docker) | Terhubung via network `shared-docker_global-network` |

---

## 🚀 Cara Menjalankan

### Cara Cepat (Otomatis)

Cukup jalankan script inisialisasi:

```bash
chmod +x docker-init.sh
./docker-init.sh
```

Script ini akan:
1. Menyiapkan file `.env` jika belum ada.
2. Membangun (*build*) dan menyalakan seluruh container (`tiara_app`, `tiara_nginx`, `tiara_vite`).
3. Menginstal dependensi Composer & NPM secara otomatis.
4. Menjalankan migrasi database dan database seeder.

---

### Cara Manual via Makefile / Docker Compose

1. **Jalankan container:**
   ```bash
   make up
   # atau: docker compose up -d --build
   ```

2. **Inisialisasi Database (Migrasi & Seed):**
   ```bash
   make migrate
   make seed
   # atau sekaligus: make fresh-seed
   ```

3. **Buka di Browser:**
   - Aplikasi Web: [http://localhost:8085](http://localhost:8085)
   - Vite Dev Server (HMR): [http://localhost:5175](http://localhost:5175)
   - phpMyAdmin (Global): [http://localhost:8080](http://localhost:8080)

---

## 👤 Akun Pengujian Default

Setelah menjalankan `make seed` atau `./docker-init.sh`, akun berikut dapat digunakan:

- **Admin Store:**
  - Email: `admin@accountingchoice.com`
  - Password: `password`
- **Buyer Demo:**
  - Email: `buyer@example.com`
  - Password: `password`

---

## 🛠️ Perintah Praktis (Makefile)

Gunakan `make help` untuk melihat semua shortcut:

| Perintah | Fungsi |
| :--- | :--- |
| `make up` | Menjalankan seluruh container di background |
| `make down` | Menghentikan semua container |
| `make restart` | Merestart seluruh container |
| `make logs` | Menampilkan logs secara realtime (`docker compose logs -f`) |
| `make build` | Rebuild image docker |
| `make migrate` | Menjalankan migrasi database (`php artisan migrate`) |
| `make seed` | Menjalankan seeder database (`php artisan db:seed`) |
| `make fresh-seed` | Reset database dan jalankan seeder (`migrate:fresh --seed`) |
| `make bash` | Masuk ke terminal container backend PHP (`sh`) |
| `make bash-node` | Masuk ke terminal container frontend Vite (`sh`) |
| `make tinker` | Masuk ke Laravel Tinker CLI |
| `make npm-build` | Menjalankan build frontend aset produksi |
| `make cache-clear` | Membersihkan cache Laravel (`optimize:clear`) |

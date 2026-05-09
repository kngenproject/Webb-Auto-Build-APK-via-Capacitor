# APK Builder with GitHub Actions

Sistem untuk mengubah project website (ZIP) menjadi APK Android menggunakan GitHub Actions sebagai engine build.

## Prasyarat

1. **GitHub Personal Access Token** (classic) dengan scope `repo` dan `workflow`.
2. Repository GitHub tempat workflow `build.yml` akan disimpan (bisa repo terpisah atau repo publik).
3. Node.js 20+ untuk menjalankan backend.

## Langkah Persiapan

### 1. Setup Workflow GitHub
- Buat repository baru (misal `apk-builder-workflow`).
- Buat folder `.github/workflows/` dan letakkan file `build.yml` di dalamnya.
- Push ke branch `main`.

### 2. Setup Backend
- Clone atau buat folder `backend`.
- Install dependencies: `npm install`.
- Salin `.env.example` menjadi `.env` dan isi:
  - `GITHUB_TOKEN`: token Anda
  - `GITHUB_OWNER`: username GitHub Anda
  - `GITHUB_REPO`: nama repo workflow (contoh: `apk-builder-workflow`)
  - `PUBLIC_URL`: jika backend di-deploy, isi dengan URL publik (contoh: `https://backend-kamu.com`)
- Jalankan: `npm start` (atau `npm run dev` untuk development).

### 3. Deploy Frontend
- Buka file `frontend/index.html` dan sesuaikan `BACKEND_URL` dengan alamat backend yang berjalan.
- Bisa dijalankan secara lokal atau di-hosting di GitHub Pages, Netlify, dll.

## Cara Penggunaan
1. Buka halaman frontend.
2. Pilih file ZIP project (harus berisi `capacitor.config.json` dan `package.json`).
3. Masukkan nama repository target (misal `username/nama-apk`). *Catatan: repository ini hanya untuk identifikasi, tidak harus ada.*
4. Klik "Upload & Build". Proses build akan berjalan di GitHub Actions (sekitar 2-5 menit).
5. Klik "Download APK" setelah build selesai (tunggu beberapa menit).

## Catatan Penting
- File ZIP akan dihapus dari server setelah 1 jam.
- APK artifact tersedia selama 7 hari di GitHub Actions.
- Pastikan project Anda memiliki file `capacitor.config.json` yang valid.
- Untuk production, gunakan HTTPS dan proteksi token.

## Troubleshooting
- Jika download gagal, pastikan workflow sudah selesai (cek di GitHub Actions).
- Backend harus memiliki akses internet ke API GitHub.
- Token harus memiliki izin `workflow`.
# APK Builder with GitHub Actions

Sistem untuk mengubah project website (ZIP) menjadi APK Android menggunakan GitHub Actions sebagai engine build.

## Struktur Folder

```
apk_web/
├── frontend/
│   ├── index.html          ← Halaman utama PWA
│   ├── manifest.json       ← PWA manifest
│   ├── sw.js               ← Service Worker
│   └── icon/
│       ├── icon-192.png    ← Icon PWA (letakkan di sini)
│       └── icon-512.png    ← Icon PWA (letakkan di sini)
├── backend/
│   ├── server.js           ← Backend Node.js/Express
│   ├── package.json        ← Dependencies backend
│   └── .env.example        ← Contoh konfigurasi environment
├── .github/
│   └── workflows/
│       └── build.yml       ← GitHub Actions workflow (HARUS di sini)
├── capacitor.config.json   ← Konfigurasi Capacitor untuk build APK
└── README.md
```

## Prasyarat

1. **GitHub Personal Access Token** (classic) dengan scope `repo` dan `workflow`.
2. Repository GitHub tempat workflow `build.yml` akan disimpan (bisa repo terpisah atau repo publik).
3. Node.js 20+ untuk menjalankan backend.

## Langkah Persiapan

### 1. Setup Workflow GitHub
- Buat repository baru (misal `apk-builder-workflow`).
- Upload folder `.github/workflows/` beserta file `build.yml` ke repository tersebut.
- Push ke branch `main`.

### 2. Setup Backend
- Masuk ke folder `backend/`.
- Install dependencies: `npm install`.
- Salin `.env.example` menjadi `.env` dan isi:
  - `GITHUB_TOKEN`: token Anda
  - `GITHUB_OWNER`: username GitHub Anda
  - `GITHUB_REPO`: nama repo workflow (contoh: `apk-builder-workflow`)
  - `PUBLIC_URL`: URL publik backend (contoh: `https://backend-kamu.com`)
- Jalankan: `npm start` (atau `npm run dev` untuk development).

### 3. Deploy Frontend
- Buka file `frontend/index.html` dan sesuaikan `BACKEND_URL` dengan alamat backend yang berjalan.
- Pastikan folder `frontend/icon/` berisi `icon-192.png` dan `icon-512.png`.
- Bisa dijalankan secara lokal atau di-hosting di GitHub Pages, Netlify, dll.

## Cara Penggunaan
1. Buka halaman frontend.
2. Pilih file ZIP project (harus berisi `capacitor.config.json` dan `package.json`).
3. Masukkan nama repository target (misal `username/nama-apk`).
4. Klik "Upload & Build". Proses build akan berjalan di GitHub Actions (sekitar 2-5 menit).
5. Klik "Download APK" setelah build selesai.

## Catatan Penting
- File ZIP akan dihapus dari server setelah 1 jam.
- APK artifact tersedia selama 7 hari di GitHub Actions.
- Pastikan project Anda memiliki file `capacitor.config.json` yang valid.
- Untuk production, gunakan HTTPS dan proteksi token.

## Troubleshooting
- Jika download gagal, pastikan workflow sudah selesai (cek di GitHub Actions).
- Backend harus memiliki akses internet ke API GitHub.
- Token harus memiliki izin `workflow`.

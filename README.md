# APK Builder — No Backend

Build APK dari project website menggunakan GitHub Actions. **Tidak perlu backend/VPS.**

## Struktur Repo

```
repo/
├── .github/
│   └── workflows/
│       └── build.yml         ← engine build APK
├── docs/                     ← GitHub Pages (Settings → Pages → /docs)
│   ├── index.html
│   ├── manifest.json
│   ├── sw.js
│   └── icon/
│       ├── icon-192.png      ← taruh icon kamu di sini
│       └── icon-512.png
└── capacitor.config.json
```

## Setup GitHub Pages
- Settings → Pages → Source: branch `main`, folder `/docs`

## Cara Pakai
1. Buka GitHub Pages URL
2. Masukkan **GitHub Token** (scope: `repo` + `workflow`)
3. Masukkan **Owner/Repo** tempat `build.yml` berada (repo ini sendiri)
4. Pilih **file ZIP project** kamu
5. Klik **Upload & Build** — proses otomatis:
   - ZIP diupload ke GitHub Release
   - GitHub Actions dijalankan
   - APK di-build (~3-5 menit)
6. Klik **Download APK**

## Cara Dapat GitHub Token
1. github.com → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token → centang `repo` dan `workflow`
4. Copy token → paste di form

## Syarat File ZIP Project
ZIP yang diupload harus berisi:
- `capacitor.config.json` — konfigurasi Capacitor
- `package.json` — dependencies project
- File web (HTML/CSS/JS) di folder `src/` atau `dist/`

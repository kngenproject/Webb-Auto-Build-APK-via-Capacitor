# APK Builder — No Backend

Build APK dari project website menggunakan GitHub Actions. **Tidak perlu backend/VPS.**

---

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

---

## Setup GitHub Pages
1. Buka repo → **Settings → Pages**
2. Source: branch `main`, folder `/docs`
3. Save → tunggu beberapa menit sampai aktif

---

## Cara Dapat GitHub Token
1. Buka [github.com](https://github.com) → **Settings**
2. **Developer settings → Personal access tokens → Tokens (classic)**
3. Klik **Generate new token (classic)**
4. Centang scope: `repo` dan `workflow`
5. Klik **Generate token** → copy tokennya

---

## Cara Pakai APK Builder
1. Buka URL GitHub Pages kamu
2. Isi **GitHub Token** → paste token yang sudah dicopy
3. Isi **Owner/Repo** → `username/nama-repo-ini`
4. Pilih **file ZIP project** kamu (lihat syarat di bawah)
5. Isi **Nama App** → bebas, misal `my-app`
6. Klik **⚡ Upload & Build** — proses otomatis:
   - ZIP diupload ke GitHub Release
   - GitHub Actions dijalankan otomatis
   - APK di-build (sekitar 3–5 menit)
7. Setelah status berubah selesai → klik **📦 Download APK**

---

## Syarat File ZIP Project

ZIP yang diupload **wajib** berisi file-file berikut:

```
project.zip
├── capacitor.config.json   ← WAJIB
├── package.json            ← WAJIB
└── dist/                   ← WAJIB (folder file web kamu)
    ├── index.html
    ├── style.css
    └── script.js
```

### 1. `capacitor.config.json`
```json
{
  "appId": "com.nama.app",
  "appName": "Nama Aplikasi",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  }
}
```
> ⚠️ `webDir` harus sama dengan nama folder web kamu (`dist`, `www`, `build`, dll)

### 2. `package.json`
```json
{
  "name": "nama-app",
  "version": "1.0.0",
  "scripts": {
    "build": "node build.js"
  },
  "dependencies": {
    "@capacitor/core": "^5.0.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^5.0.0",
    "@capacitor/android": "^5.0.0"
  }
}
```

### 3. Folder `dist/`
Berisi file HTML, CSS, JS website kamu. Contoh paling sederhana:
```
dist/
└── index.html
```

---

## Contoh Project Siap Pakai

Jika belum punya project, gunakan struktur ini:

```
contoh-app/
├── capacitor.config.json
├── package.json
├── build.js               ← script salin src ke dist
└── src/
    └── index.html         ← taruh file web kamu di sini
```

**`build.js`** — script build sederhana:
```javascript
const fs = require('fs');

if (!fs.existsSync('dist')) fs.mkdirSync('dist');

function copyDir(src, dest) {
  fs.readdirSync(src).forEach(file => {
    const s = src + '/' + file;
    const d = dest + '/' + file;
    if (fs.statSync(s).isDirectory()) {
      if (!fs.existsSync(d)) fs.mkdirSync(d);
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  });
}

copyDir('src', 'dist');
console.log('Build selesai!');
```

ZIP semua file tersebut lalu upload ke APK Builder.

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| Build gagal: `capacitor.config.json not found` | Pastikan file ada di root ZIP, bukan di dalam subfolder |
| Build gagal: `webDir not found` | Pastikan folder `dist/` ada dan nama sesuai `webDir` di config |
| Gagal trigger workflow | Pastikan token punya scope `repo` dan `workflow` |
| Download APK gagal | Pastikan build sudah selesai (status success di GitHub Actions) |
| APK tidak bisa diinstall | Aktifkan "Install dari sumber tidak dikenal" di pengaturan HP |

---

## Catatan
- APK yang dihasilkan adalah **debug APK** (tidak perlu keystore)
- Artifact APK tersedia selama **7 hari** di GitHub Actions
- File ZIP di GitHub Release otomatis berlabel `prerelease`

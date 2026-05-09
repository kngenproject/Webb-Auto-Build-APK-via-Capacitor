require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const tmp = require('tmp');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Pastikan folder temp ada
const TEMP_DIR = path.join(__dirname, 'temp');
fs.ensureDirSync(TEMP_DIR);

// Konfigurasi multer untuk upload file
const upload = multer({ dest: TEMP_DIR });

// Utility: Upload file ke temporary storage (GitHub Gist sebagai contoh gratis)
// Atau bisa pakai S3, tapi kita gunakan simple: simpan di server dan berikan URL publik jika server bisa diakses.
// Untuk production yang serius, gunakan layanan seperti Cloudflare R2 atau Upload to GitHub Release.
// Di sini kita asumsikan server memiliki URL publik (misal menggunakan ngrok atau deploy ke VPS).
// Agar workflow bisa mendownload, kita perlu menyediakan URL sementara.
// Solusi sederhana: simpan file di folder public/temp dan serve secara statis.
app.use('/temp', express.static(TEMP_DIR));

// Helper: Generate temporary public URL (relative)
function getTempUrl(filename) {
  const baseUrl = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
  return `${baseUrl}/temp/${filename}`;
}

// Endpoint upload
app.post('/upload', upload.single('zip'), async (req, res) => {
  try {
    const file = req.file;
    const repo = req.body.repo; // username/repo

    if (!file || !repo) {
      return res.status(400).json({ error: 'File ZIP dan repo diperlukan' });
    }

    // Pindahkan file ke nama permanen
    const ext = path.extname(file.originalname);
    const targetName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
    const targetPath = path.join(TEMP_DIR, targetName);
    await fs.move(file.path, targetPath, { overwrite: true });

    // URL publik file ZIP sementara
    const zipUrl = getTempUrl(targetName);

    // Trigger GitHub Actions via repository_dispatch
    const [owner, repoName] = repo.split('/');
    if (!owner || !repoName) {
      return res.status(400).json({ error: 'Format repo harus username/repo' });
    }

    const dispatchUrl = `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/dispatches`;
    const payload = {
      event_type: 'build-apk',
      client_payload: {
        zip_url: zipUrl,
        repo: repo,
        owner: owner,
        repo_name: repoName
      }
    };

    await axios.post(dispatchUrl, payload, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    // Simpan mapping antara repo dan file ZIP untuk cleanup nanti (opsional)
    // Kita simpan di memory sederhana
    if (!global.uploadedFiles) global.uploadedFiles = {};
    global.uploadedFiles[repo] = targetPath;

    // Hapus file setelah 1 jam (cleanup)
    setTimeout(async () => {
      if (await fs.pathExists(targetPath)) {
        await fs.remove(targetPath);
        delete global.uploadedFiles[repo];
      }
    }, 60 * 60 * 1000);

    res.json({ message: `Build triggered for ${repo}. APK akan tersedia dalam beberapa menit.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal memicu build', detail: error.message });
  }
});

// Endpoint download APK terbaru
app.get('/latest-apk', async (req, res) => {
  const repo = req.query.repo;
  if (!repo) {
    return res.status(400).json({ error: 'Parameter repo diperlukan' });
  }

  const [owner, repoName] = repo.split('/');
  if (!owner || !repoName) {
    return res.status(400).json({ error: 'Format repo salah' });
  }

  try {
    // Cari workflow run terbaru untuk repo target (atau kita gunakan runs dari repo workflow kita)
    // Kita asumsikan workflow disimpan di repo sendiri. Kita perlu mencari artifact dari run yang berhubungan dengan repo tersebut.
    // Karena kita tidak menyimpan mapping run ID, cara sederhana: cari semua artifact dari repo workflow kita, filter berdasarkan nama?
    // Alternatif: kita minta user memasukkan run ID? Tidak praktis.
    // Solusi: setiap trigger, kita simpan run ID ke database. Untuk demo sederhana, kita akan ambil artifact terbaru dari repo workflow.
    // Namun agar lebih tepat, kita akan cari artifact yang mengandung nama repo di dalam namanya? Atau kita simpan mapping di file.
    // Kita gunakan pendekatan: cari semua workflow runs dengan event repository_dispatch, ambil yang terbaru, lalu ambil artifact-nya.
    const runsUrl = `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/actions/runs?event=repository_dispatch&per_page=1`;
    const runsRes = await axios.get(runsUrl, {
      headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    });
    const runs = runsRes.data.workflow_runs;
    if (runs.length === 0) {
      return res.status(404).json({ error: 'Belum ada build' });
    }
    const latestRun = runs[0];
    const artifactsUrl = `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/actions/runs/${latestRun.id}/artifacts`;
    const artifactsRes = await axios.get(artifactsUrl, {
      headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    });
    const artifacts = artifactsRes.data.artifacts;
    if (artifacts.length === 0) {
      return res.status(404).json({ error: 'APK belum selesai diproses' });
    }
    // Ambil artifact pertama (biasanya app-debug)
    const artifact = artifacts[0];
    const downloadUrl = artifact.archive_download_url;
    // Redirect ke download URL (memerlukan token)
    const response = await axios({
      method: 'GET',
      url: downloadUrl,
      headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
      responseType: 'stream'
    });
    res.setHeader('Content-Disposition', `attachment; filename=app-debug-${repo.replace('/', '-')}.zip`);
    response.data.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil APK', detail: error.message });
  }
});

// Cleanup berkala
setInterval(async () => {
  const files = await fs.readdir(TEMP_DIR);
  const now = Date.now();
  for (const file of files) {
    const filePath = path.join(TEMP_DIR, file);
    const stat = await fs.stat(filePath);
    if (now - stat.ctimeMs > 2 * 60 * 60 * 1000) { // lebih dari 2 jam
      await fs.remove(filePath);
    }
  }
}, 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
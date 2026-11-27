# 📜 Development Log (Admin) — EcoMedia RADEC

Log riwayat perubahan kode khusus pada modul admin (`admin/`) aplikasi EcoMedia RADEC.
Catatan disusun secara **descending / Last In First Out (LIFO)** (perubahan terbaru selalu berada di paling atas).

---

### [2026-11-27 10:38:55] — Perbaikan Menu Ecomedia, Rincian DISCUSS/EXPLAIN/ANSWER 10 Soal Wajib, Penilaian NLP Client-Side ('use'), dan Pengaturan Hak Akses Kelas
* **Deskripsi Perubahan:**
  1. **Tugas 1 — Perbaikan Menu Ecomedia (`#panel-tanggapan`):**
     * Mengubah alur menu Ecomedia menjadi 3 sumber hardcode (`Video Ecomedia`, `Infografis`, `Buku atau Kertas`) dengan penghitung siswa aktif kelas, daftar siswa berbaris penuh, rincian 4 lensa dari tabel `ecomedia` (urutan `DESC`), serta ekspor PDF (`downloadTanggapanPdf()`).
  2. **Tugas 2 — Perbaikan Tampilan Rincian `DISCUSS`, `EXPLAIN`, dan `ANSWER`:**
     * Memisahkan rincian kelompok `DISCUSS` & `EXPLAIN` menjadi 3 blok: (1) Pertanyaan Utama & versi jawaban per anggota kelompok (`splitStageRowsMainAndStudent`, mengabaikan baris `id_siswa === null` sebagai jawaban), (2) Pertanyaan dari Siswa (`id_soal.includes('pertanyaan')`) dalam kartu ramping individual, dan (3) Tanggapan `ecomedia_discuss` / `ecomedia_explain` per anggota; disinkronkan ke PDF masing-masing.
     * Menyeragamkan seluruh rincian `DISCUSS`, `EXPLAIN`, dan `ANSWER` (`buildMergedAnswerQuestions`) agar selalu menampilkan seluruh **10 pertanyaan wajib per materi** dari `ANSWER_ESSAY25` (`admin/soal-essay.js`), dengan tampilan kartu ramping `.slim-individual-card` pada menu `ANSWER` beserta ekspor PDF.
  3. **Tugas 3 — Fitur Penilaian Jawaban Siswa dengan NLP Client-Side (`'use'`):**
     * Menambahkan tombol **🤖 Nilai Jawaban Siswa** dan **ℹ️ Keterangan Nilai** (`#nlpRubricModal`) pada header rincian `ANSWER` serta blok keterangan rubrik 4 level pada PDF (`downloadAnswerMateriPdf()`).
     * Mengimplementasikan evaluator NLP browser-side (`getOrLoadAdminUSEModel`, `evaluateCurrentAnswerWithNlp`, `evaluateSingleAnswerWithSelfHealing`) dengan engine **`'use'`** (`@tensorflow/tfjs@4.22.0` & `@tensorflow-models/universal-sentence-encoder@1.3.3`), cache 2 lapis (`indexeddb://eco-use-model` + `eco_use_model_meta` & RAM/WebGL TTL 2 jam + warm-up), *self-healing* bila cache korup / `NaN`, serta pengiriman skor skala `1–4` ke server via `EcoApi.patch('answer', 'id_answer', ...)` hanya untuk soal yang terisi (soal kosong dilewati).
  4. **Tugas 4 — Pengaturan Halaman Hak Akses Kelas (`#panel-akses`):**
     * Mengganti tabel statis dummy pada `#panel-akses` menjadi pengaturan izin akses tingkat **(kelas + sekolah)** aktif sesi guru, lengkap dengan pintasan tombol **🔄 Ganti Kelas**, toggle 5 tahap (`tahap_diizinkan`), 5 materi (`materi_diizinkan`), tombol cepat **🔓 Buka Semua** / **🔒 Kunci Semua**, dan kolom opsional `keterangan`.
     * Mengimplementasikan mekanisme *auto-provision upsert* (`loadHakAksesPanel` → `GET WHERE 'hak_akses'`, otomatis `POST` record default terkunci semua jika belum ada, dan `saveHakAkses` → `PATCH` by `id_akses`) dengan **loading screen (`showLoading` / `hideOverlay`)** pada setiap proses komunikasi server.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `admin/admin.html` — Pembaruan `#panel-tanggapan`, `#panel-akses`, `#answerDetailView` (tombol NLP & Keterangan Nilai), `#discussDetailView`, `#explainDetailView`, serta penambahan modal `#nlpRubricModal`.
  * `admin/admin.css` — Penambahan gaya `.slim-individual-card` (`.theme-green`, `.theme-purple`), `.group-member-answers`, `.answer-detail-actions`, `.eco-modal-rubric`, `.nlp-rubric-list`, serta gaya responsif `#panel-akses`.
  * `admin/admin.js` — Penambahan & pembaruan modul Ecomedia (`tanggapan`), `splitStageRowsMainAndStudent`, `buildMergedAnswerQuestions`, modul NLP (`getOrLoadAdminUSEModel`, `evaluateCurrentAnswerWithNlp`, `openNlpRubricModal`), modul Hak Akses (`loadHakAksesPanel`, `saveHakAkses`, `setAllHakAkses`, `setSectionHakAkses`), serta pembaruan PDF (`downloadAnswerMateriPdf`, `downloadDiscussPdf`, `downloadExplainPdf`, `downloadTanggapanPdf`).

---

### [2026-11-21 02:15:00] — Penambahan Menu Tanggapan Siswa (Ecomedia), Jawaban Siswa (Answer), Aksi Edit & Hapus Siswa, serta Optimalisasi Responsivitas Mobile
* **Deskripsi Perubahan:**
  1. **Implementasi Menu Tanggapan Siswa (Ecomedia) (`#panel-tanggapan`):**
     * Mengembangkan arsitektur 2 sub-view: `#tanggapanListView` (tabel daftar siswa dengan pencarian real-time via `#searchTanggapanSiswaInput` dan badge total siswa) dan `#tanggapanDetailView` (kartu rincian tanggapan siswa).
     * Mengambil data tanggapan secara asinkron dari tabel `ecomedia` via `EcoApi.getWhere('ecomedia', { id_siswa })`.
     * Merender 1 blok kartu Tanggapan Ecomedia terstruktur: Sumber (judul materi referensi), Cerita & Nilai, Siapa yang Berperan, Bahan, Energi, & Limbah, dan Pengalaman Kita (field keterangan disembunyikan sesuai instruksi).
     * Menata ulang blok pertanyaan dan tanggapan pada menu READ menjadi susunan vertikal (atas-bawah) agar nyaman dan rapi di perangkat mobile.
  2. **Implementasi Menu Jawaban Siswa (Answer) (`#panel-answer`):**
     * Mengembangkan arsitektur 2 sub-view: `#answerListView` (tabel daftar siswa dengan pencarian instan via `#searchAnswerSiswaInput`) dan `#answerDetailView` (tampilan kartu jawaban siswa).
     * Menghubungkan pengambilan data jawaban dari tabel database server `answer` via `EcoApi.getWhere('answer', { id_siswa })`.
     * Mengimplementasikan normalisasi dinamis `id_materi` dari angka (contoh `"1"`) menjadi `'materi-' + id_materi`, lalu memetakan ke judul materi lengkap via `getNamaMateri()`.
     * Merender kartu detail jawaban siswa: Jawaban Siswa (`jawaban_siswa`), Tingkat Keyakinan (`confident`), Status Flag Diskusi (`flag_discuss` dengan badge indikator), dan Nilai NLP (`nilai_nlp` dengan badge skor).
  3. **Reaktivasi Kolom Aksi Data Siswa & Modal Interaktif (Edit & Hapus):**
     * Menampilkan kembali kolom `Aksi` pada tabel Data Siswa (`#panel-siswa`) dengan tombol `✏️ Edit` dan `🗑️ Hapus`.
     * **Modal Edit Siswa (`#editSiswaModal`):** Form pengubahan Nama, Nomor Absen, Kelas, dan Asal Sekolah dengan validasi input, serta sinkronisasi update ke database server via `EcoApi.patch('siswa', idSiswa, payload)`.
     * **Modal Konfirmasi Hapus Siswa (`#confirmDeleteSiswaModal`):** Modal dialog peringatan dengan ilustrasi maskot vektor berwajah sedih/khawatir, nama target siswa, dan eksekusi penghapusan data di server via `EcoApi.delete('siswa', idSiswa)`.
  4. **Pemindahan Tombol Ubah Profil Guru:**
     * Memindahkan tombol `✏️ Ubah Profil` dari navbar header (`.eco-admin-header`) ke bagian bawah sidebar (`.eco-sidebar-footer`) tepat di atas tombol `🚪 Keluar`.
  5. **Peningkatan Responsivitas Mobile Komprehensif (~360px & Tablet):**
     * Memperbaiki tata letak halaman Login Admin (`.eco-login-section`): mengubah perilaku `overflow` menjadi scrollable secara vertikal (`overflow-y: auto`) dan `align-items: flex-start` pada mobile sehingga form tidak terpotong pada layar smartphone ~360px.
     * Mengoptimalkan tombol kembali pada seluruh detail view (`.eco-btn-back`) dengan teks responsif (`.back-text-full` vs `.back-text-short`) agar fleksibel pada layar sempit.
     * Mengatur skala padding kartu, tipografi, dan elemen visual di breakpoint `@media (max-width: 600px)`, `(max-width: 480px)`, dan `(max-width: 380px)`.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `admin/admin.html` — Pembaruan sidebar footer (tombol Ubah Profil), penambahan kolom aksi Data Siswa, penambahan modal `#editSiswaModal` dan `#confirmDeleteSiswaModal`, penambahan panel `#panel-tanggapan` dan panel `#panel-answer` beserta tombol kembali responsif `.eco-btn-back`.
  * `admin/admin.css` — Perbaikan responsif layar login (`.eco-login-section`), penambahan gaya `.eco-btn-sidebar-profile`, modal edit siswa & konfirmasi hapus siswa, tombol `.eco-btn-back`, styling kartu `.read-item-card.answer`, serta media query layar kecil.
  * `admin/admin.js` — Penambahan fungsi `openEditSiswaModal()`, `closeEditSiswaModal()`, `saveEditSiswa()`, `openConfirmDeleteSiswaModal()`, `closeConfirmDeleteSiswaModal()`, `executeDeleteSiswa()`, fungsi modul Ecomedia (`loadTanggapanSiswaTable`, `renderTanggapanSiswaTable`, `handleSearchTanggapanSiswa`, `viewDetailTanggapan`, `closeDetailTanggapan`), fungsi modul Answer (`loadAnswerSiswaTable`, `renderAnswerSiswaTable`, `handleSearchAnswerSiswa`, `viewDetailAnswer`, `closeDetailAnswer`), serta pembaruan `switchPanel()` dan `loadDataSiswa()`.

---

### [2026-11-19 13:05:00] — Integrasi Data Siswa, Menu Tahapan RADEC, & Implementasi Menu Pertanyaan Siswa (READ)
* **Deskripsi Perubahan:**
  1. **Tabel Data Siswa Berdasarkan Kelas & Sekolah Guru:**
     * Mengembangkan fungsi `loadDataSiswa()` untuk mengambil data siswa via REST API (`EcoApi.getWhere('siswa', { sekolah })` / `EcoApi.get('siswa')`).
     * Menerapkan pencocokan cerdas menggunakan `sanitasiKelas()` agar variasi format Romawi dan desimal (`V-A`, `5-A`, `5A`) tetap cocok secara konsisten.
     * Mengembangkan fungsi `renderSiswaTable()` untuk merender tabel dinamis lengkap dengan badge absen, kelas, sekolah, serta tombol aksi.
     * Mengimplementasikan pencarian *real-time* multi-kolom (nama dan nomor absen) melalui `#searchSiswaInput` dan bilah ringkasan `#siswaFilterInfo`.
  2. **Penambahan Menu & Sub-Halaman 5 Tahapan RADEC:**
     * Menambahkan 5 menu tahapan RADEC pada navigasi sidebar di bawah Tanggapan Siswa dan di atas Laporan Progres:
       - 📖 Pertanyaan Siswa (READ) (`#panel-read`)
       - ✍️ Jawaban Siswa (Answer) (`#panel-answer`)
       - 🗣️ Diskusi Siswa (Discuss) (`#panel-discuss`)
       - 📢 Penjelasan Siswa (Explain) (`#panel-explain`)
       - 🎨 Karya Siswa (Create) (`#panel-create`)
     * Memperbarui objek `pageMeta` di `admin/admin.js` agar judul dan subjudul header dashboard berganti secara dinamis saat berpindah panel.
     * Menambahkan styling badge warna khas (`.badge-blue`, `.badge-amber`, `.badge-red`) dan aksen `.response-card` untuk tiap tahapan RADEC, serta `overflow-y: auto` pada sidebar agar nyaman diakses di layar mobile.
  3. **Implementasi Lengkap Menu Pertanyaan Siswa (READ):**
     * **Tampilan Tabel Siswa (`#readListView`):** Menyajikan tabel siswa kelas terkait dengan kolom `No`, `Nama`, `Kelas`, `Sekolah`, dan `Opsi` (tombol `👁️ Lihat`).
     * **Pencarian Real-time Siswa READ:** Menambahkan input `#searchReadSiswaInput` yang menyaring daftar siswa secara instan.
     * **Tampilan Detail Siswa (`#readDetailView`):** Menampilkan header dengan tombol kembali `[⬅️ Kembali ke Menu Pertanyaan Siswa (READ)]`, nama siswa, kelas, dan sekolah.
     * **Pengambilan Data Simultan:** Mengambil data pertanyaan (`EcoApi.getWhere('pertanyaan', { id_siswa })`) dan tanggapan tantangan (`EcoApi.getWhere('tantangan', { id_siswa })`) secara paralel.
     * **Blok Pertanyaan Siswa:** Menampilkan kartu pertanyaan dengan nama materi (`id_materi`), label materi, dan teks pertanyaan siswa.
     * **Blok Tanggapan Siswa & Parser Multi-Format:**
       - Mengembangkan fungsi `parseKeteranganTantangan(keterangan, idMateri)` yang fleksibel menangani data bertipe `object` (otomatis didecode dari database/API) maupun `string` (dari `JSON.stringify`), dengan *failsafe* otomatis `"Periksa materi pada {id_materi}"` jika data kosong/tidak valid.
       - Memformat stimulus agar tag penekanan (`<strong>`) tetap ter-render aman, serta memecah butir pilihan opsi (A, B, C, dst.) per baris dengan `white-space: pre-line`.
     * **Tata Letak Vertikal (Atas-Bawah):** Mengubah susunan `.read-detail-grid` menjadi `flex-direction: column` dengan blok pertanyaan di atas dan blok tanggapan di bawah agar tampilan lebih lapang, terstruktur, dan nyaman dibuka di layar mobile.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `admin/admin.html` — Pembaruan navigasi sidebar `#ecoSidebar` (Baris 119–137), struktur `#panel-siswa` (Baris 160–195), struktur `#panel-read` dengan `#readListView` dan `#readDetailView` (Baris 277–370), serta penambahan panel `#panel-answer`, `#panel-discuss`, `#panel-explain`, dan `#panel-create`.
  * `admin/admin.css` — Penambahan gaya filter info & badge siswa (Baris 945–1003), tata letak detail READ `.read-detail-header-card`, `.read-detail-grid`, `.read-block-card`, `.read-item-card` (Baris 1005–1070), dan penyesuaian `.eco-sidebar-nav` (Baris 363–370).
  * `admin/admin.js` — Penambahan fungsi `loadDataSiswa()`, `renderSiswaTable()`, `handleSearchSiswa()`, konstanta `MAP_MATERI`, fungsi `getNamaMateri()`, `parseKeteranganTantangan()`, `formatStimulusText()`, `renderReadSiswaTable()`, `handleSearchReadSiswa()`, `loadReadSiswaTable()`, `viewDetailRead()`, `closeDetailRead()`, serta pembaruan `switchPanel()` dan `pageMeta` (Baris 515–1110).

---

### [2026-11-18 13:54:00] — Integrasi Login Guru ke REST API Server, Sanitasi Kelas Romawi, & Generator id_guru
* **Deskripsi Perubahan:**
  * Mengimplementasikan fungsi `sanitasiKelas(inputKelas)` untuk mengubah angka Romawi (I–XII) menjadi angka desimal (1–12) secara otomatis serta merapikan spasi di sekitar tanda strip `-` (misal `"V - A"` menjadi `"5-A"`).
  * Mengintegrasikan fungsi sanitasi pada event `blur` dan `change` input `#guruClass` agar nilai input langsung terkonversi secara otomatis di antarmuka.
  * Mengimplementasikan generator ID unik `generateIdGuru()` yang menghasilkan 5 karakter acak base64 dengan awalan `"G-"` (contoh: `"G-tUvWX"`).
  * Mengubah alur autentikasi `doAdminLogin()` pada `admin/admin.js` menjadi fungsi asinkron (`async/await`) yang terhubung langsung ke REST API backend (tabel `'guru'`):
    1. Membuka modal overlay `showLoading()` selama komunikasi dengan server.
    2. Mengecek apakah guru sudah terdaftar di database menggunakan `EcoApi.getWhere('guru', criteria)` (`nama_guru`, `kelas_guru`, `sekolah_guru`).
    3. Jika data respons bernilai kosong (`[]`), sistem secara otomatis membuat entri guru baru dengan `id_guru` acak dan mengirimkannya melalui `EcoApi.post('guru', payload)`.
    4. Menyimpan data sesi guru ke `localStorage` pada kunci `KEY_GURU` (`ecoAdminData`) dan kunci baru `KEY_GURU_ID` (`ecoAdminIdGuru`) untuk mempermudah relasi data siswa mendatang.
    5. Menutup modal loading secara otomatis (`hideOverlay()`) saat berhasil login dan beralih ke dashboard admin.
    6. Menangkap kegagalan jaringan atau respons error server dalam blok `catch` dan menampilkannya pada modal error interaktif (`showError()`).
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `admin/admin.js` — Penambahan konstanta `KEY_GURU_ID` (Baris 5), fungsi `sanitasiKelas()` (Baris 7–38), fungsi `generateIdGuru()` (Baris 40–53), event listener input `#guruClass` di `DOMContentLoaded` (Baris 72–81), dan refaktorisasi asinkron `doAdminLogin()` (Baris 180–245).

---

### [2026-11-18 13:04:00] — Pembuatan Komponen Full-Page Overlay (Loading & Error Modal dengan Maskot SVG)
* **Deskripsi Perubahan:**
  * Membangun komponen overlay modal layar penuh (*full-screen modal dialog*) yang dapat digunakan sebagai indikator pemrosesan data (loading) maupun penanganan kegagalan (*error catch*) dari server.
  * **Karakter Maskot Vektor SVG EcoMedia:**
    * Mengimplementasikan maskot vektor bumi mungil (*zero-dependency SVG*) yang ramah pengguna dengan tunas daun dan pipi merona.
    * Memiliki 2 mode ekspresi wajah dinamis:
      1. **Mode Proses (Normal/Loading):** Maskot tersenyum dengan mata berbinar, animasi mengapung lembut (`@keyframes mascotBounce`), dan cincin spinner berputar di sekelilingnya (`@keyframes mascotSpin`).
      2. **Mode Kendala / Error:** Wajah berganti menjadi ekspresi cemas lucu (alis berkerut, mata `> <`, mulut bingung, tetesan keringat dingin) dengan animasi goyang (`@keyframes mascotWobble`).
  * **Logika Pengendali Overlay (`admin/admin.js`):**
    * Fungsi `showLoading(title, subText)`: Menampilkan overlay dengan teks default *"Data anda sedang diproses"*.
    * Fungsi `showError(errorDetails, title)`: Mengubah judul menjadi *"Mohon maaf ada masalah"*, menampilkan kotak detail error, serta memunculkan tombol penutup (*close button*).
    * Fungsi `hideOverlay()` / `hideLoading()`: Menutup modal secara otomatis dengan animasi *fade-out* saat proses berhasil.
    * Integrasi pada fungsi `doAdminLogin()`: Menampilkan overlay loading saat login, otomatis tertutup jika sukses menyimpan sesi, dan menangkap blok `catch` jika terjadi galat.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `admin/admin.html` — Elemen modal `#adminOverlay`, `.eco-overlay-backdrop`, `.eco-overlay-modal`, `#mascotWrapper`, `#overlayTitle`, `#overlaySub`, `#overlayErrorBox`, `#overlayActionArea` (Baris 308–408).
  * `admin/admin.css` — Kelas styling `.eco-overlay-backdrop`, `.eco-overlay-modal`, `.eco-mascot-wrapper`, `.eco-mascot-svg`, `.eco-mascot-spinner`, `.mascot-face-normal`, `.mascot-face-error`, `.eco-overlay-title`, `.eco-overlay-error-box`, `.eco-btn-overlay-close`, serta aturan `.eco-overlay-modal.is-error` (Baris 678–825).
  * `admin/admin.js` — Fungsi `showLoading()`, `showError()`, `hideOverlay()`, pembaruan alur `doAdminLogin()`, serta eksposur fungsi ke objek `window` (Baris 23–140).

---

### [2026-11-18 12:43:00] — Perombakan Visual & Identitas Seksi `#adminLogin`
* **Deskripsi Perubahan:**
  * Menghilangkan tampilan latar belakang putih polos yang terlalu monoton pada seksi `#adminLogin`.
  * Mengadopsi bahasa desain visual dari direktori utama (`welcome.css` & `index.html`):
    * Latar belakang gradien multi-titik bernuansa alam (`radial-gradient` hijau, biru langit, dan kuning mentari lembut).
    * Efek pemandangan mengapung (*eco ambient background*): gelembung transparan berkabut (`.eco-bubble`) dan animasi melayang ikon daun (`🌿`, `🍃`, `🌱`).
  * **Identitas & Keterangan Aplikasi:**
    * Menambahkan badge chip resmi: **`🌱 ECOMEDIA RADEC : BUMI KITA & PERUBAHAN IKLIM`**.
    * Menambahkan penanda peran: **`👨‍🏫 Halaman Guru / Portal Guru & Dashboard Monitoring`**.
    * Menambahkan lencana pendukung: *Siswa Kelas V SD*, *Model RADEC*, *Ecoliteracy*, dan *Evaluasi Pembelajaran*.
  * **Tata Letak 2 Kolom Responsif:**
    * Kolom Kiri: Informasi hero, deskripsi peran guru, dan kartu visual **5 Tahapan Belajar RADEC** (*READ*, *ANSWER*, *DISCUSS*, *EXPLAIN*, *CREATE*).
    * Kolom Kanan: Kartu formulir login bergaya *glassmorphism* (`backdrop-filter: blur(16px)`), bilah aksen 3-warna, ikon sambutan, dan *focus ring* input yang halus.
    * Tampilan otomatis bertumpuk ke tengah pada layar tablet/mobile (`<= 960px`).
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `admin/admin.html` — Struktur seksi `#adminLogin`, `.eco-login-bg`, `.eco-login-container`, `.eco-login-hero`, `.eco-brand-badge`, `.eco-journey-preview`, dan `.eco-login-card` (Baris 13–104).
  * `admin/admin.css` — Aturan gaya `.eco-login-section`, `.eco-login-bg`, `.eco-bubble`, `.eco-leaf`, `.eco-login-container`, `.eco-login-hero`, `.eco-journey-preview`, `.card-accent-bar`, `@keyframes ecoLoginFloat`, serta media query responsif `@media (max-width: 960px)` (Baris 34–240 & 626–652).

---

### [2026-11-18 12:37:00] — Pemisahan Berkas Monolitik admin.html (Modularisasi HTML, CSS, JS)
* **Deskripsi Perubahan:**
  * Memecah berkas tunggal monolitik `admin/admin.html` (783 baris) menjadi 3 berkas modular terpisah sesuai prinsip *Separation of Concerns*:
    1. **`admin/admin.html`** (244 baris): Struktur semantik HTML murni yang menghubungkan stylesheet dan script.
    2. **`admin/admin.css`** (440 baris): Seluruh aturan gaya, token desain, komponen kartu, tabel, sakelar izin akses, dan responsivitas sidebar mobile.
    3. **`admin/admin.js`** (108 baris): Logika Single Page Application (SPA), autentikasi guru, navigasi panel (`switchPanel`), dan interaksi menu mobile (`toggleSidebar`).
  * Memastikan seluruh dependensi terisolasi rapi di dalam sub-folder `admin/` tanpa memengaruhi aplikasi utama di direktori root.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `admin/admin.html` — Pembersihan tag `<style>` dan `<script>` inline; penambahan `<link rel="stylesheet" href="admin.css">` dan `<script src="admin.js"></script>` (Baris 1–244).
  * `admin/admin.css` — Pembuatan berkas stylesheet modular baru (Baris 1–440).
  * `admin/admin.js` — Pembuatan berkas skrip logika modular baru (Baris 1–108).

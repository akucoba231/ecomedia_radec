# 📜 Development Log — EcoMedia RADEC

Log riwayat perubahan kode aplikasi EcoMedia RADEC.
Catatan disusun secara **descending** (perubahan terbaru selalu berada di paling atas).

---

### [2026-11-23 00:30:00] — Tahap DISCUSS: Standarisasi Prefix id_soal Wondering, Pembagian Peran Kelompok, Migrasi Alert ke Overlay Loading, & Integrasi Tabel ecomedia_discuss
* **Deskripsi Perubahan:**
  * **Standarisasi Prefix `id_soal` Pertanyaan Tambahan ([js/discuss.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/discuss.js)):**
    * Mencegah konflik `id_soal` antara soal kurikulum utama (nomor 1..25) dan pertanyaan rasa ingin tahu dari tahap READ (tabel `pertanyaan`).
    * Memastikan fungsi `fetchWonderQuestionsFromDB()` langsung membubuhkan prefix eksplisit `id_soal: 'pertanyaan-' + rawId` sebelum data digabungkan ke daftar pembahasan.
    * Menghapus kueri fallback tanpa prefix di `saveWonderDiscussItem` guna menjamin konsistensi integrasi dengan skema database `discuss.id_soal` ber-tipe `VARCHAR(50)`.
  * **Fitur Pembagian Peran Kelompok (Group Roles) ([index.html](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/index.html), [css/discuss.css](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/css/discuss.css), [js/discuss.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/discuss.js)):**
    * Memindahkan modul pembagian peran ke bawah card Identitas Kelompok sebagai card tersendiri (`.discuss-roles-card`).
    * Menyediakan Modal Pembagian Peran (`#modalPembagianPeran`) dengan antarmuka baris anggota: nama dengan pemangkasan teks (*text-ellipsis*) dan combo-box pemilihan peran (`--Pilih--` [nilai `anggota`], `Ketua`, `Notulis`, `Juru Bicara`, `Penguji Gagasan`, `Anggota`).
    * Menambahkan Modal Info Peran (`#modalInfoPeran`) yang menjelaskan fungsi masing-masing peran secara jelas dan mudah dipahami.
    * Menerapkan tata letak responsif: format satu baris pada desktop dan model dua baris bertumpuk (*stacked*) pada tampilan perangkat bergerak/mobile (`@media (max-width: 640px)`).
    * Menyimpan data pembagian peran via operasi `PATCH` ke tabel `kelompok_discuss` pada kolom `keterangan` dalam format JSON mapping `{ [id_siswa]: role }`, serta merender ulang badge peran pada card secara instan.
  * **Penggantian Pop-up `alert()` ke Loading Overlay Interaktif ([js/discuss.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/discuss.js)):**
    * Mengganti seluruh pop-up browser bawaan (`alert()`) pada alur pembagian peran, validasi nama kelompok, dan penanganan galat server ke modal overlay terpadu `showLoadingError()` dan `showLoadingSuccess()` dari modul [js/loading.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/loading.js).
    * Menyediakan fungsi penolong terpusat `notifyDiscussError(message, title)` dan `notifyDiscussSuccess(title, subtitle)` dengan maskot Bumi Eco Media, pesan penjelasan kendala yang informatif, dan tombol tutup.
  * **Integrasi Tabel `ecomedia_discuss` & Tombol Kirim Jawaban ([index.html](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/index.html), [css/discuss.css](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/css/discuss.css), [js/api.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/api.js), [js/discuss.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/discuss.js), [js/ecomedia-lens.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/ecomedia-lens.js)):**
    * Mendaftarkan tabel `ecomedia_discuss` ke dalam whitelist API `CONFIG.allowedTables` pada [js/api.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/api.js).
    * Menambahkan tombol *"🚀 Kirim Jawaban"* (`#btnSubmitEcoDiscuss`) di kanan bawah card refleksi Lensa Ecomedia (`#ecomedia-discuss-card`) dan status penyimpanan draf otomatis di sebelah kiri (`#ecoDiscussStatus`).
    * Mengimplementasikan fungsi `saveEcoDiscussLens()`, `loadEcoDiscussData(materi, group)`, dan `kirimEcoDiscuss()`:
      * Menyimpan draf lokal di `store`/`localStorage` berdasar kombinasi `id_kelompok` dan `id_materi`.
      * Memeriksa keberadaan data kelompok pada materi aktif di tabel `ecomedia_discuss`; mengeksekusi `POST` jika belum ada atau `PATCH` jika data sudah tersimpan di server.
      * Muat otomatis data refleksi server saat pergantian materi pembelajaran 1 s.d. 5 (`showDiscussAllMaterial`) maupun saat inisialisasi tahap DISCUSS (`initRadecDiscuss`).
  * **Verifikasi & Pengujian Komprehensif ([scratch/test_discuss_workflow.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/scratch/test_discuss_workflow.js)):**
    * Menambahkan Uji 11 (Alur Pembagian Peran Kelompok, Modal, PATCH keterangan, & Modal Info).
    * Menambahkan Uji 12 (Verifikasi seluruh penanganan error & validasi menggunakan `showLoadingError`, tanpa `alert()`).
    * Menambahkan Uji 13 (Integrasi tabel `ecomedia_discuss`, validasi form kosong, transmisi POST/PATCH, sinkronisasi materi, dan pemulihan data).
    * Seluruh 13 skenario pengujian unit lolos 100% (`13/13 PASSED`).
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `index.html` — Card `.discuss-roles-card`, `#modalPembagianPeran`, `#modalInfoPeran`, `.eco-discuss-footer`, tombol `#btnSubmitEcoDiscuss`.
  * `css/discuss.css` — Styling `.discuss-roles-card`, grid roles modal desktop & mobile view, modal info peran, `.eco-discuss-footer`, dan `.btn-eco-discuss-save`.
  * `js/api.js` — Penambahan `'ecomedia_discuss'` pada `CONFIG.allowedTables`.
  * `js/discuss.js` — Standarisasi prefix `fetchWonderQuestionsFromDB`, implementasi peran (`parseGroupRoles`, `renderGroupRolesCard`, `openModalPembagianPeran`, `savePembagianPeran`, `openModalInfoPeran`), jembatan notifikasi overlay (`notifyDiscussError`, `notifyDiscussSuccess`), integrasi lensa ecomedia (`saveEcoDiscussLens`, `loadEcoDiscussData`, `kirimEcoDiscuss`), serta integrasi lazy load materi.
  * `js/ecomedia-lens.js` — Penyelarasan fungsi `saveEcoDiscussLens` dan `loadEcoDiscussLens` dengan konteks materi & kelompok.
  * `scratch/test_discuss_workflow.js` — Penambahan mock DOM/API dan Uji 11 s.d. 13.

---

### [2026-11-21 13:30:00] — Implementasi Persistent Model Cache (IndexedDB + localStorage), Retensi Permanen Opsi B, Self-Healing Failsafe, & Optimisasi Main-Thread Login
* **Deskripsi Perubahan:**
  * **Penyimpanan Persisten Model AI di IndexedDB ([js/answer.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/answer.js)):**
    * Mengintegrasikan skema penyimpanan persisten TensorFlow.js ke media fisik lokal komputer siswa via `model.save('indexeddb://eco-use-model')` dan `indexeddb://eco-use-lite-model`.
    * Model bobot biner (~30 MB) kini tersimpan permanen di media penyimpanan (SSD/HDD) peramban, sehingga tidak hilang saat tab ditutup, browser di-refresh (`Ctrl+R`), ataupun laptop dimatikan.
  * **Metadata Model di `localStorage` ([js/answer.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/answer.js)):**
    * Menambahkan helper `getNlpModelMeta()`, `saveNlpModelMeta()`, dan `clearNlpModelMeta()` dengan kunci penyimpanan `eco_use_model_meta` dan `eco_use_model_meta_<mode>`.
    * Menyimpan struktur data JSON: `{ modelName, modelMode, indexedDbKey, savedAt, version }` untuk verifikasi instan ketersediaan model sebelum menghubungi jaringan eksternal.
  * **Penerapan Kebijakan Retensi Opsi B (Permanen di Disk, 2 Jam di RAM/GPU):**
    * **Di Disk (IndexedDB):** File bobot biner dipertahankan permanen antar-sesi, mengeliminasi kebutuhan mengunduh ulang 30 MB dari CDN setiap kali aplikasi dibuka.
    * **Di Memori Aktif (RAM/VRAM WebGL):** Masa kedaluwarsa 2 jam (`USE_CACHE_DURATION_MS`) difokuskan murni untuk membebaskan alokasi memori RAM/GPU (`destroyUSEModelCache()`) guna mencegah *memory leak* dan *browser freeze* akibat penumpukan *texture* WebGL pada sesi belajar yang panjang.
    * Saat siswa kembali memerlukan evaluasi setelah 2 jam, sistem langsung memuat ulang model dari IndexedDB lokal ke RAM tanpa perlu koneksi internet CDN.
  * **Self-Healing Failsafe & Pemulihan Mandiri (`purgeNlpModelStorage`):**
    * Mengimplementasikan fungsi asinkron `purgeNlpModelStorage(mode)` yang membersihkan cache RAM, menghapus model rusak dari IndexedDB via `tf.io.removeModel()`, dan menghapus metadata di `localStorage`.
    * Pada `periksaJawabanEssay(idx)`, jika evaluasi NLP melempar error atau menghasilkan nilai `NaN`/`null`, sistem secara otomatis memicu pembersihan total ini, mengunduh salinan model segar dari CDN, menyimpannya kembali ke IndexedDB, dan mengulang penilaian secara transparan tanpa mengganggu siswa.
  * **Optimisasi Main-Thread Login (Pencegahan Freeze pada Perangkat Berspesifikasi Rendah):**
    * Berdasarkan analisis performa komputasi prosesor lawas (seperti AMD APU A8-7xxx / arsitektur lawas pra-Gen 10 dengan single-thread IPC terbatas dan iGPU Radeon R5), kompilasi *shader* WebGL dan deserialisasi array Float32Array pada *main thread* JavaScript dapat menyebabkan antarmuka tersendat (*lag/freeze*).
    * **Logika Pasca-Login (`preloadUSEModelBackground`):** Jika model sudah ada di IndexedDB, pramuat latar belakang pasca-login di-*bypass* (0% pemakaian CPU/GPU saat login), menjamin proses login tetap instan dan lancar.
    * **Logika Tahap ANSWER (`initAnswerStage`):**
      * Jika model sudah ada di IndexedDB: Pemuatan dari disk lokal ke GPU dilakukan saat siswa membuka tahap ANSWER disertai tampilan *Loading Screen* edukatif ramah anak selama 1–2 detik.
      * Jika model belum ada di IndexedDB (pertama kali buka): Jika unduhan CDN latar belakang masih berjalan, *Loading Screen* tahap ANSWER secara mulus menyambung (*attach/join*) proses tersebut tanpa membatalkan atau mengulang dari nol.
  * **Verifikasi & Pengujian Unit Komprehensif ([scratch/test_answer_nlp_sync.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/scratch/test_answer_nlp_sync.js)):**
    * Memperluas suite pengujian unit menjadi 19 skenario pengujian lengkap:
      * **Test 15:** Unduh pertama kali dari CDN & penyimpanan otomatis ke IndexedDB + metadata `localStorage`.
      * **Test 16:** Simulasi *Ctrl+R* / browser refresh (RAM dibersihkan, pemuatan cepat dari IndexedDB tanpa menyentuh CDN).
      * **Test 17:** Opsi B (Kedaluwarsa RAM 2 jam membebaskan memori aktif, file IndexedDB tetap permanen).
      * **Test 18:** *Self-healing failsafe* otomatis memulihkan model korup/NaN, menghapus IndexedDB, dan mengunduh ulang model segar.
      * **Test 19 Skenario A:** Model sudah di IndexedDB $\rightarrow$ pramuat pasca-login otomatis di-*bypass* (UI login bebas beban), tahap ANSWER memuat via *Loading Screen*.
      * **Test 19 Skenario B:** Model belum di IndexedDB $\rightarrow$ unduhan CDN latar belakang dilanjutkan secara mulus oleh *Loading Screen* tahap ANSWER.
    * Seluruh 19 skenario pengujian dan seluruh tes regresi autentikasi/overlay berhasil lulus 100%.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `js/answer.js` — Penambahan konstanta `ECO_NLP_MODEL_META_KEY`, fungsi `getIndexedDbModelUrl()`, `getNlpModelMeta()`, `saveNlpModelMeta()`, `clearNlpModelMeta()`, `removeModelFromIndexedDB()`, `purgeNlpModelStorage()`, pembaruan `getOrLoadUSEModel()`, `preloadUSEModelBackground()`, `initAnswerStage()`, `computeSemanticSimilarity()`, `periksaJawabanEssay()`, `getEcoUseModelCacheState()`, serta ekspor modul.
  * `scratch/test_answer_nlp_sync.js` — Penambahan mock TensorFlow.js `tf.io` & in-memory IndexedDB storage, serta penambahan Test 15 s.d. Test 19.

---

### [2026-11-20 22:25:00] — Optimasi Tahap ANSWER: Normalisasi Opsi Confident, Pre-load Model NLP Ramah Anak, Caching 2 Jam, & Auto-Reload Failsafe
* **Deskripsi Perubahan:**
  * **Normalisasi Opsi Nilai Confident ke Bahasa Indonesia ([js/answer.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/answer.js)):**
    * Mengubah nilai tingkat keyakinan yang disimpan pada `answerMetaState[idx].confidence` dan server (tabel `answer`, kolom `confident`) menjadi format Bahasa Indonesia eksplisit: `'belum yakin'`, `'cukup yakin'`, dan `'yakin'` (menggantikan format legacy `'low'`, `'mid'`, `'high'`).
    * Menyediakan normalisasi *backward-compatibility* dua arah pada `renderAnswerEssay()`, `syncAnswerFromServer()`, dan `periksaJawabanEssay()` sehingga data yang sebelumnya tersimpan dengan nilai lama tetap terbaca dan otomatis terpetakan ke format baru.
    * Memperbarui penghitungan progres pada `updateAnswerEssayProgress()` agar mendeteksi keyakinan rendah berbasis `'belum yakin'` maupun legacy `'low'`.
  * **Pre-Load Model Universal Sentence Encoder (USE) saat Buka Halaman ANSWER:**
    * Mengimplementasikan fungsi baru `initAnswerStage(showLoadingOverlay = true)` di [js/answer.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/answer.js).
    * Dipicu otomatis saat siswa membuka tahap ANSWER (`goStep(1)` pada [js/router.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/router.js) maupun via `ecoEnterLearning(1)`).
    * Menampilkan loading screen edukatif yang ramah anak:
      > *"Mempersiapkan Halaman ANSWER..."* — *"Sebentar ya, halaman sedang dipersiapkan untukmu"*
    * Kartu soal langsung dirender (`renderAnswerEssay()`) dan data server disinkronkan (`syncAnswerFromServer()`) terlebih dahulu sebelum pemuatan model sehingga antarmuka tidak terhambat.
  * **Pesan Loading Screen Error Ramah Anak & Resiliensi Pembelajaran:**
    * Jika model NLP gagal dimuat saat pre-load (misal akibat koneksi internet terputus atau CDN diblokir), sistem menampilkan dialog kesalahan yang menenangkan:
      > *"Waduh, ada sedikit kesalahan, tapi kamu masih bisa melanjutkan pembelajaranmu di sini"*
    * Siswa tetap dapat melanjutkan membaca soal esai, menuliskan jawaban, memilih tingkat keyakinan, dan menandai diskusi kelompok secara normal tanpa terganggu.
    * Saat siswa menekan *"Periksa Jawaban"*, sistem akan mencoba memuat ulang model USE atau memanfaatkan engine semantik fallback cerdas berbasis TF-IDF + Jaccard + Kata Kunci.
  * **Sistem Caching Model NLP Selama Maksimal 2 Jam:**
    * Menambahkan konstanta `USE_CACHE_DURATION_MS = 2 * 60 * 60 * 1000` (7.200.000 ms) dan variabel penanda waktu `_ecoUseModelLoadedAt`.
    * Fungsi `getOrLoadUSEModel(forceReload = false)` memeriksa masa berlaku cache; jika model sudah termuat dan belum melewati 2 jam, model langsung digunakan kembali dari memori tanpa melakukan pengunduhan ulang dari jaringan.
    * Menyediakan helper `destroyUSEModelCache()` untuk membersihkan alokasi memori tensor model lama (`dispose()`) dan mereset status cache.
  * **Auto Invalidation & Reload Cache Saat Nilai Evaluasi Gagal / Error:**
    * Pada `periksaJawabanEssay(idx)`, jika komputasi semantik USE melempar galat komputasi tensor atau menghasilkan nilai `NaN`/`null`, sistem secara otomatis memanggil `destroyUSEModelCache()`, memuat ulang model fresh dengan `getOrLoadUSEModel(true)`, memperbarui *timestamp* cache baru, dan mengulang evaluasi.
    * Jika panggilan ulang jaringan tetap gagal, sistem beralih ke komputasi kesamaan fallback cerdas sehingga siswa tidak pernah terhalang untuk menyelesaikan dan menyimpan evaluasi ke server.
  * **Verifikasi & Pengujian:**
    * Memperbarui berkas pengujian [scratch/test_answer_nlp_sync.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/scratch/test_answer_nlp_sync.js) menjadi 10 skenario pengujian komprehensif:
      1. Validasi jawaban kosong (< 5 karakter).
      2. Validasi siswa belum login.
      3. Formula evaluasi NLP (70% semantik + 30% kata kunci).
      4. Skenario POST saat jawaban baru dengan confident `'yakin'`.
      5. Skenario PATCH saat jawaban diperbarui dengan confident `'cukup yakin'`.
      6. Resiliensi saat API server melempar error.
      7. Normalisasi opsi confident (`'belum yakin'`, `'cukup yakin'`, `'yakin'`) dan *backward-compatibility*.
      8. Pre-load loading screen ramah anak & caching model 2 jam tanpa pemanggilan berulang.
      9. Pesan error ramah anak saat pre-load gagal dan ketahanan siswa untuk tetap belajar.
      10. Penghancuran cache lama (`destroyUSEModelCache`) & auto-reload jika evaluasi bernilai tidak valid.
    * Seluruh 10 skenario pengujian lulus 100%.
    * Rangkaian tes regresi aplikasi di `scratch/` tetap berjalan hijau tanpa galat.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `js/answer.js` — Penambahan konstanta `USE_CACHE_DURATION_MS`, variabel `_ecoUseModelLoadedAt`, fungsi `destroyUSEModelCache()`, `getEcoUseModelCacheState()`, `initAnswerStage()`, pembaruan `getOrLoadUSEModel()`, `computeSemanticSimilarity()`, `periksaJawabanEssay()`, `syncAnswerFromServer()`, `renderAnswerEssay()`, `updateAnswerEssayProgress()`, serta ekspor modul.
  * `js/router.js` — Pembaruan fungsi `goStep(1)` untuk memicu `initAnswerStage(true)`.
  * `scratch/test_answer_nlp_sync.js` — Penambahan skenario pengujian unit baru untuk Poin 1 s.d. 6.

---

### [2026-11-20 12:55:00] — Integrasi Penilaian NLP (Universal Sentence Encoder + Keyword Matching) & Sinkronisasi Tabel 'answer', serta Integrasi 4 Lensa Ecomedia (Tabel 'ecomedia')
* **Deskripsi Perubahan:**
  * **Master Data Acuan NLP Soal Esai ([js/data/soal-essay.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/data/soal-essay.js)):**
    * Menambahkan properti identitas eksplisit `id_soal: 1` s.d. `25` pada setiap butir soal di `ANSWER_ESSAY25` untuk memudahkan pemetaan relasional dinamis hingga 50 soal atau lebih.
    * Menyusun dataset baru `KUNCI_JAWABAN_ESSAY` yang memuat 25 butir kunci rujukan dan kata kunci penilaian yang disarikan langsung dari konsep ilmiah bacaan tahap READ ([js/data/materi-read.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/data/materi-read.js)).
    * Struktur data acuan dibuat dinamis: `id_jawaban`, `id_soal`, `jawaban_ideal` (teks rujukan komprehensif), dan `kata_kunci` (array frasa/kata kunci berbobot).
    * Menyediakan helper dinamis `getKunciJawaban(idSoal)` untuk pencarian instan berdasarkan nomor soal, serta mengeksposnya ke `window` dan `module.exports`.
  * **Penyempurnaan Antarmuka Kartu Soal ANSWER ([css/answer.css](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/css/answer.css) & [js/answer.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/answer.js)):**
    * **Radio Box Tingkat Keyakinan (`confident`):** Diubah menjadi radio pill interaktif yang dilengkapi bulatan radio (`.ans-radio-circle`). Saat dipilih, statusnya langsung terlihat sangat kontras dengan aksen warna khusus per tingkat keyakinan (low=jingga/oranye, mid=biru, high=hijau) disertai ring shadow.
    * **Checkbox Penanda Diskusi (`flag_discuss`):** Desain tata letak dipertahankan namun visualisasi status `true` vs `false` dibuat jauh lebih tegas (latar kuning-emas `#fef3c7`, border `#f59e0b`, kotak terisi oranye gelap `#d97706` dengan centang tebal `✓`, serta teks *"✓ Ditandai untuk dibahas saat DISCUSS"* vs status nonaktif abu-abu netral).
    * **Tombol "🔍 Periksa Jawaban":** Ditempatkan di sebelah kanan bawah setiap kartu soal, lengkap dengan wadah status nilai AI di sebelah kirinya (`🎯 Nilai AI: xx/100`).
  * **Engine Evaluasi Jawaban Semantik NLP ([js/answer.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/answer.js)):**
    * Memuat model **TensorFlow.js Universal Sentence Encoder (USE)** langsung di sisi klien peramban (in-browser client-side inference via CDN `@tensorflow/tfjs` & `@tensorflow-models/universal-sentence-encoder`).
    * Mengimplementasikan fungsi asinkron `getOrLoadUSEModel()` dengan arsitektur Singleton caching untuk menjamin efisiensi memori (model hanya dimuat satu kali).
    * **Formula Penilaian Komposit:** `Skor Akhir = (70% × Skor Semantik USE) + (30% × Skor Kata Kunci Kunci Jawaban)`.
    * Dilengkapi algoritma fallback cerdas (TF-IDF vector cosine + Jaccard similarity token + Keyword matching) jika model USE CDN tidak dapat diakses offline/jaringan lambat.
  * **Sinkronisasi Otomatis REST API Tabel `answer` (Post When Not Exist, Patch When Exist):**
    * Mendaftarkan tabel `'answer'` pada whitelist `CONFIG.allowedTables` di [js/api.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/api.js).
    * Mengintegrasikan transmisi data otomatis saat siswa mengklik *"🔍 Periksa Jawaban"*:
      1. Cek keberadaan jawaban via `EcoApi.getWhere('answer', { id_siswa, id_materi, id_soal })`.
      2. Jika belum ada: lakukan `POST` data baru `{ id_answer: '', id_siswa, id_materi, id_soal, jawaban, confident, flag_discuss, nilai, feedback, keterangan: '' }`.
      3. Jika sudah ada: lakukan `PATCH` pembaruan berdasarkan `id_answer`.
    * Mengimplementasikan `syncAnswerFromServer(materi)` yang dipicu otomatis saat siswa membuka tahap ANSWER untuk memulihkan jawaban, status confident, flag diskusi, dan skor AI yang tersimpan di server.
  * **Integrasi Lembar Analisis 4 Lensa Ecomedia ([js/ecomedia-lens.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/ecomedia-lens.js)):**
    * Mengimplementasikan fungsi `kirimEcoLens()` dengan loading overlay interaktif (`showLoading`), tombol kirim responsif, validasi input, serta dukungan dua mode: `append` (selalu `POST` riwayat baru) dan `upsert` (`POST` jika belum ada, `PATCH` jika sudah ada).
    * Payload mencakup: `id_ecomedia`, `id_siswa`, `sumber`, `cerita_nilai`, `siapa_berperan`, `bahan_energi_limbah`, `pengalaman_kita`, dan `keterangan`.
    * Mengimplementasikan `loadEcoLens()` untuk sinkronisasi otomatis dari server dan cache lokal saat membuka tahap READ.
  * **Verifikasi & Pengujian:**
    * Berkas live API test [scratch/test_live_answer_api.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/scratch/test_live_answer_api.js) sukses menguji siklus POST (201), GET WHERE (200), PATCH (200), dan DELETE (200) langsung ke endpoint `https://ecomedia.pjokserver.my.id/public/api/answer`.
    * Berkas live API test [scratch/test_live_ecomedia.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/scratch/test_live_ecomedia.js) sukses menguji endpoint `https://ecomedia.pjokserver.my.id/public/api/ecomedia`.
    * Berkas unit test [scratch/test_soal_essay_rubric.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/scratch/test_soal_essay_rubric.js) lolos seluruh 4 skenario.
    * Berkas unit test [scratch/test_ecomedia_lens_sync.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/scratch/test_ecomedia_lens_sync.js) lolos seluruh 7 skenario.
    * Berkas unit test [scratch/test_answer_nlp_sync.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/scratch/test_answer_nlp_sync.js) lolos seluruh 6 skenario.
    * Seluruh 15 berkas suite pengujian unit aplikasi berjalan sukses dan lolos 100%.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `index.html` — Penambahan script CDN TensorFlow.js & Universal Sentence Encoder (Baris 1297–1300), penambahan tombol submit ecomedia lens (Baris 439–446).
  * `js/data/soal-essay.js` — Penambahan `id_soal: 1..25` pada `ANSWER_ESSAY25`, pembuatan dataset `KUNCI_JAWABAN_ESSAY`, helper `getKunciJawaban()`, dan ekspor modul.
  * `css/answer.css` — Penambahan styling `.ans-selfcheck`, radio pill `.ans-confidence-btn`, checkmark `.ans-discuss-flag`, tombol `.btn-periksa-jawaban`, dan badge `.ans-nlp-badge`.
  * `js/answer.js` — Implementasi `periksaJawabanEssay()`, `getOrLoadUSEModel()`, `computeSemanticSimilarity()`, `computeKeywordScore()`, `computeFallbackSimilarity()`, `syncAnswerFromServer()`, pembaruan template HTML kartu soal, dan ekspor modul.
  * `js/ecomedia-lens.js` — Implementasi `kirimEcoLens()`, `loadEcoLens()`, konstanta konfigurasi `ECOMEDIA_MODE`, dan ekspor modul.
  * `js/router.js` — Pemicu otomatis `loadEcoLens()` pada `step === 0` dan `renderAnswerEssay()` serta `syncAnswerFromServer()` pada `step === 1`.
  * `scratch/test_soal_essay_rubric.js`, `scratch/test_ecomedia_lens_sync.js`, `scratch/test_answer_nlp_sync.js`, `scratch/test_live_answer_api.js`, `scratch/test_live_ecomedia.js` — Berkas pengujian unit dan live API baru.

---

### [2026-11-19 13:05:00] — Integrasi Modal Input Tantangan Berpikir (Tabel 'tantangan') & Sinkronisasi Progress Map RADEC ke Database (Tabel 'progress')
* **Deskripsi Perubahan:**
  * **Modal Input Tantangan Berpikir & Integrasi REST API (Tabel `tantangan`):**
    * Menambahkan elemen dialog modal `#ecoTantanganModal` di [index.html](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/index.html) dengan styling konsisten kartu EcoMedia RADEC dan pembatasan `style="z-index: 10;"` agar tidak menimpa / melebihi loading screen overlay (`z-index: 99999`).
    * Menyediakan tombol silang `✕`, header tantangan, hidden input `#tantanganIdMateri`, label & textarea `#tantanganJawaban` dengan placeholder default: *"Berikan jawabanmu beserta alasannya..."*, elemen status `#tantanganMsg`, tombol aksi **"Batal [Tutup]"** (`#btnCancelTantangan`), dan tombol **"🚀 Kirim"** (`#btnSubmitTantangan`).
    * Menghubungkan div kartu tantangan berpikir (`.read-note`) di [js/read.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/read.js) pada fungsi `renderReadMaterials()` agar dapat diklik langsung oleh siswa via `onclick="event.stopPropagation(); modalInput('${m.id_materi}', event)"`.
    * Mengimplementasikan `modalInput(id_materi, event)` di [js/read.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/read.js): menampilkan loading screen proses (`showLoading`), memeriksa jawaban sebelumnya di server via `EcoApi.getWhere('tantangan', { id_siswa, id_materi })`, memulihkan jawaban siswa ke textarea jika `data.length > 0`, atau mengosongkan textarea dengan placeholder default jika `data.length === 0`.
    * Mengimplementasikan `kirimTantangan()` di [js/read.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/read.js): memvalidasi input kosong, menampilkan loading screen proses (`showLoading`), menjalankan arsitektur **Post When Not Exist, Patch When Exist** (`POST` jika belum ada di database, `PATCH` berdasarkan `id_tantangan` jika sudah ada), menampilkan animasi sukses (`showLoadingSuccess`) atau error (`showLoadingError`), dan mempertahankan dialog modal tetap terbuka (tidak menutup otomatis) agar siswa dapat mereview jawabannya.
    * Menambahkan fungsi `closeTantanganModal()` serta mengekspos seluruh fungsi modal tantangan ke `window` dan `module.exports`.
  * **Sinkronisasi Progress Map RADEC ke Database Server (Tabel `progress`):**
    * Mendaftarkan tabel `'progress'` ke dalam whitelist `CONFIG.allowedTables` pada [js/api.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/api.js).
    * Menambahkan kunci `progressId: 'ecoRadecProgressID'` pada `STORAGE_KEYS` di [js/store.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/store.js) untuk menyimpan ID record progres database.
    * Mengimplementasikan fungsi `syncProgressLogin(studentId)` di [js/tracker.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/tracker.js):
      * Dipanggil otomatis saat siswa login di `finishLogin()` ([js/auth.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/auth.js)) dan saat inisialisasi awal aplikasi di `appInit()` ([js/app.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/app.js)).
      * **Failsafe Siswa Baru (`length === 0`):** Otomatis melakukan `POST` record baru dengan `progress: []` dan `current_step: 0`, sehingga tahap READ di layar awal langsung berstatus *"Sedang dipelajari"* (Kuning), serta menyimpan `id_progress` baru.
      * **Pemulihan Siswa Lama (`length > 0`):** Mengambil data dari server, memulihkan Set `ecoCompleted` dan nilai `currentStep` ke memori dan `localStorage`, lalu memperbarui tampilan visual peta dan dots petualangan.
    * Mengimplementasikan fungsi `syncProgressToServer()` di [js/tracker.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/tracker.js):
      * Terintegrasi langsung di dalam `ecoSaveProgress()`: setiap kali siswa berpindah tahap (`goStep`), menyelesaikan seluruh pembelajaran (`showFinish`), atau mereset progres (`ecoRestartLearning`), sistem menjalankan silent background `PATCH` ke database server untuk kolom `progress` (array JSON urut) dan `current_step`.
      * Dilengkapi mekanisme failsafe auto-recovery bila `id_progress` di cache lokal hilang, serta error-handling silent agar tidak mengganggu antarmuka siswa bila koneksi jaringan terputus (resiliensi offline).
  * **Verifikasi & Pengujian:**
    * Berkas pengujian [scratch/test_tantangan_modal.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/scratch/test_tantangan_modal.js) (7 skenario: buka modal kosong, tutup modal, validasi input, POST jawaban baru, pulihkan jawaban lama, PATCH pembaruan, dan penanganan galat) lolos 100%.
    * Berkas pengujian [scratch/test_progress_db_sync.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/scratch/test_progress_db_sync.js) (6 skenario: login siswa baru failsafe POST, login siswa lama restore DB, silent PATCH saat melangkah, status selesai 0..4 step 5, failsafe cache ID hilang, dan offline resilience) lolos 100%.
    * Seluruh 12 suite pengujian aplikasi (`test_loading_overlay.js`, `test_sanitasi_failsafe.js`, `test_login_api_integration.js`, `test_edit_profile_modal.js`, `test_confirm_class_modal.js`, `test_read_tools.js`, `test_toggle_read_modal.js`, `test_inline_notes.js`, `test_save_wonder.js`, `test_load_pertanyaan_read.js`, `test_tantangan_modal.js`, `test_progress_db_sync.js`) berjalan sukses dan lolos 100%.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `index.html` — Penambahan dialog modal `#ecoTantanganModal` (Baris 1136–1173).
  * `js/read.js` — Penyesuaian `renderReadMaterials()` untuk trigger klik tantangan (Baris 110–132), implementasi `modalInput()`, `closeTantanganModal()`, dan `kirimTantangan()` (Baris 556–756), serta ekspor modul.
  * `js/tracker.js` — Penambahan `syncProgressLogin()` dan `syncProgressToServer()`, integrasi background sync di `ecoSaveProgress()`, serta perbaikan toleransi SSR/Node pada `buildTracker()`.
  * `js/auth.js` — Integrasi `syncProgressLogin()` di dalam `finishLogin()`.
  * `js/store.js` — Penambahan kunci `progressId: 'ecoRadecProgressID'` pada `STORAGE_KEYS`.
  * `js/app.js` — Pemicu background `syncProgressLogin()` saat aplikasi dibuka oleh siswa yang sudah login.
  * `js/api.js` — Penambahan tabel `'progress'` pada whitelist `CONFIG.allowedTables`.
  * `scratch/test_tantangan_modal.js` & `scratch/test_progress_db_sync.js` — Berkas unit test baru.

---

### [2026-11-19 02:05:00] — Penambahan Fungsi `loadPertanyaanRead()` & Pemicu Otomatis Saat Memasuki Tahap READ
* **Deskripsi Perubahan:**
  * **Fungsi Pengambilan & Pengisian Nilai Pertanyaan (`loadPertanyaanRead()`):**
    * Menambahkan fungsi `loadPertanyaanRead()` di [js/read.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/read.js) untuk mengambil data dari tabel `pertanyaan` berdasarkan `id_siswa` aktif via `EcoApi.getWhere('pertanyaan', { id_siswa })`.
    * Mengisi nilai (*value*) elemen `<textarea>` pertanyaan di tahap READ dengan menyeleksi elemen berdasarkan ID `wonder-{id_materi}` (misal: `#wonder-materi-1`, `#wonder-materi-2`, dst.) sesuai data pertanyaan yang diterima dari server.
    * Otomatis mengaktifkan kelas visual `.saved` pada kartu kontainer `.q-wonder`, menampilkan teks konfirmasi *"✓ Pertanyaanmu tersimpan di server."*, serta memperbarui cache `localStorage` (`ecoReadWonderQuestions`) agar data tetap tersinkronisasi.
    * Memiliki toleransi normalisasi failsafe untuk format ID materi baru maupun format legacy (`materi-1` vs `materi1`).
  * **Pemicu Otomatis Saat Memasuki Tahap READ pada Router (`goStep(0)`):**
    * Di [js/router.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/router.js), pada fungsi `goStep(n)`, menambahkan pemanggilan otomatis `loadPertanyaanRead()` saat `n === 0` (tahap READ).
    * Memastikan pertanyaan yang pernah disimpan siswa otomatis tampil di kolom pertanyaan setiap kali siswa masuk ke tahap READ (baik dari Peta Petualangan, navigasi pil atas, maupun saat kembali dari tahap ANSWER).
  * **Integrasi Inisialisasi & Global Export:**
    * Memperbarui `loadWonders()` di [js/read.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/read.js) agar mendelegasikan pemanggilan sinkronisasi ke `loadPertanyaanRead()`.
    * Mengekspos `loadPertanyaanRead` ke objek `window` dan `module.exports`.
  * **Verifikasi & Pengujian:**
    * Berkas pengujian [scratch/test_load_pertanyaan_read.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/scratch/test_load_pertanyaan_read.js) memverifikasi kueri API, pengisian nilai textarea `#wonder-{id_materi}`, aktivasi status `.saved`, dan sinkronisasi cache lokal. Lolos 100%.
    * Seluruh 10 suite pengujian aplikasi lulus 100% tanpa galat.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `js/read.js` — Penambahan fungsi `loadPertanyaanRead()` (Baris 480–537), pembaruan `loadWonders()` (Baris 459–478), dan ekspor global (Baris 545, 566).
  * `js/router.js` — Penambahan pemicu `loadPertanyaanRead()` pada `goStep(0)` (Baris 24–26).
  * `scratch/test_load_pertanyaan_read.js` — Berkas unit test baru.

---

### [2026-11-19 01:25:00] — Integrasi REST API Tabel 'pertanyaan' (Post When Not Exist, Patch When Exist) & Restorasi Catatan Inline READ
* **Deskripsi Perubahan:**
  * **Integrasi REST API Tabel `pertanyaan` pada `saveWonder(id_materi)`:**
    * Mengimplementasikan alur penyimpanan pertanyaan siswa tahap READ ke server REST API backend pada tabel `pertanyaan`.
    * Menggunakan mekanisme arsitektur cerdas: **Post When Not Exist, Patch When Exist**:
      1. Memeriksa tabel `pertanyaan` via `EcoApi.getWhere('pertanyaan', { id_siswa, id_materi })`.
      2. Jika hasil `length <= 0`: melakukan `POST` rekaman baru `{ id_pertanyaan: "", id_siswa, id_materi, pertanyaan, keterangan: "" }` (didukung atribut `AUTO_INCREMENT` pada database).
      3. Jika hasil `length > 0`: melakukan `PATCH` pembaruan rekaman yang sudah ada via `EcoApi.patch('pertanyaan', 'id_pertanyaan', idPertanyaan, { pertanyaan, keterangan: "" })`.
    * Normalisasi parameter `id_materi` (mendukung baik format master data `'materi-1'` maupun fallback legacy `'materi1'`).
    * Indikator status interaktif: feedback proses *"⏳ Menyimpan pertanyaan..."*, pesan sukses *"✓ Pertanyaanmu sudah tersimpan"*, serta validasi input kosong dengan pesan panduan.
    * Failsafe offline: tetap menyimpan ke cache `localStorage` sehingga data pertanyaan siswa aman saat koneksi internet terputus.
  * **Sinkronisasi Otomatis pada `loadWonders()`:**
    * Membaca pertanyaan tersimpan secara instan dari cache lokal saat aplikasi dibuka, lalu menyinkronkan data pertanyaan terkini dari server via `EcoApi.getWhere('pertanyaan', { id_siswa })` jika siswa sudah login.
  * **Restorasi 9 Kotak Tanggapan Inline (.read-note) di Tengah Bacaan:**
    * Memulihkan desain orisinal dari `index.monolith.html` di mana 9 kotak jeda berpikir dan tantangan bernalar (`.read-note`) tersebar langsung di dalam sub-bab/seksi materi bacaan terkait, bukan menumpuk di bagian bawah kartu:
      * Materi 1: Sub-bab *Mengapa pagi cerah...* (Ayo Berpikir), Sub-bab *🌧️ Musim hujan* (Ayo Berpikir Sistem Gampong A vs B), Sub-bab *🌾 Kehidupan petani Pidie* (Tantangan Jemur Gabah Pak Hasan).
      * Materi 2: Sub-bab *Atmosfer: selimut udara...* (Ayo Hubungkan), Sub-bab *Bayangkan dua selimut* (Ayo Berpikir).
      * Materi 3: Sub-bab *🔥 Pembakaran bahan bakar fosil* (Ayo Mengambil Keputusan Lampu Kelas).
      * Materi 4: Sub-bab *🌳 Sejuk di bawah pohon* (Ayo Berpikir Tempat Parkir), Sub-bab *Dari dampak menuju tindakan* (Tantangan Tindakan Sekolah Umar).
      * Materi 5: Sub-bab *10 Tindakan nyata* (⭐ Pesan Penting Ramah Lingkungan).
    * Footer kartu materi kini dikhususkan murni untuk Kotak Pertanyaan Penasaran (`.q-wonder`) dan tombol pengaman gulung materi.
  * **Penyempurnaan Modul Pendukung & DISCUSS Bridge:**
    * Memperbarui `closeTheOther()` di [js/read.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/read.js) menggunakan `querySelectorAll` dengan fallback `getElementsByClassName`.
    * Menambahkan pemetaan kunci `'materi-1'` s.d. `'materi-5'` pada `WONDER_LABELS` di [js/discuss.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/discuss.js) agar pertanyaan siswa di READ terhubung mulus dengan label yang rapi pada tahap DISCUSS.
    * Memastikan tabel `'pertanyaan'` terdaftar dalam `CONFIG.allowedTables` pada [js/api.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/api.js).
  * **Verifikasi & Pengujian:**
    * Berkas pengujian [scratch/test_save_wonder.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/scratch/test_save_wonder.js) (6 skenario alur validasi, POST, PATCH, legacy normalisasi, offline fallback, guest) lolos 100%.
    * Berkas pengujian [scratch/test_inline_notes.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/scratch/test_inline_notes.js) (verifikasi tepat 9 kotak inline tersebar sebelum wondering) lolos 100%.
    * Seluruh 9 suite pengujian regresi aplikasi (`test_loading_overlay.js`, `test_sanitasi_failsafe.js`, `test_login_api_integration.js`, `test_edit_profile_modal.js`, `test_confirm_class_modal.js`, `test_read_tools.js`, `test_toggle_read_modal.js`, `test_inline_notes.js`, `test_save_wonder.js`) lulus 100% tanpa galat.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `js/read.js` — Penyesuaian `renderReadMaterials()` (Baris 109–157), `closeTheOther()` (Baris 241–251), `wonderBox()` & `wonderTouch()` (Baris 319–338), `saveWonder()` (Baris 340–445), `loadWonders()` (Baris 447–492).
  * `js/data/materi-read.js` — Penambahan objek `note` pada seksi-seksi materi 1–5 dan pembersihan array `tanggapan` hanya menyisakan item `penasaran`.
  * `js/api.js` — Pendaftaran tabel `'pertanyaan'` ke `CONFIG.allowedTables` (Baris 28).
  * `js/discuss.js` — Penambahan label kunci materi baru pada `WONDER_LABELS` (Baris 237–248).
  * `scratch/test_save_wonder.js` & `scratch/test_inline_notes.js` — Berkas unit test baru.

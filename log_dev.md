# 📜 Development Log — EcoMedia RADEC

Log riwayat perubahan kode aplikasi EcoMedia RADEC.
Catatan disusun secara **descending** (perubahan terbaru selalu berada di paling atas).

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

---

### [2026-11-18 23:40:00] — Penambahan Modal Konfirmasi Pengaman Gulung Kartu READ (#ecoCloseReadModal) & Tombol "Tampilkan Semua"
* **Deskripsi Perubahan:**
  * **Modal Konfirmasi Pengaman `toggleRead()` (#ecoCloseReadModal):**
    * Mencegah insiden kartu materi bacaan tertutup / menggulung (*collapse*) secara tidak sengaja ketika siswa sedang membaca.
    * Menghadirkan dialog modal responsif di [index.html](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/index.html) menggunakan basis kartu loading overlay `.eco-loading-card` dengan maskot SVG Bumi Cilik memegang buku edukatif biru.
    * Teks konfirmasi dinamis menampilkan nomor dan judul materi yang sedang dibuka.
    * Dua tombol aksi: **"Ya, Tutup Materi"** (`#btnConfirmCloseRead`) untuk menggulung kartu dan **"Lanjut Membaca"** (`#btnCancelCloseRead`) untuk mempertahankan kartu tetap terbuka.
    * Pada [js/read.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/read.js):
      * Saat kartu tertutup: klik langsung membuka kartu (*expand*) seketika tanpa modal.
      * Saat kartu terbuka: interaksi di dalam teks/body materi (`.read-card-body`) tidak akan menutup kartu atau memunculkan modal.
      * Klik header kartu (`.read-card-head`) atau tombol tutup di footer materi memicu modal `#ecoCloseReadModal`.
      * Menambahkan tombol aksi cepat *"🔼 Selesai Membaca & Tutup Materi"* di bagian bawah setiap kartu materi.
  * **Tombol Toolbar "Tampilkan Semua" pada Tahap READ:**
    * Menambahkan tombol **"📚 Tampilkan Semua"** pada toolbar `.read-tool-row` di [index.html](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/index.html).
    * Memperbarui fungsi `openReadTool(kind, btn)` di [js/read.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/read.js) untuk mendukung `kind === 'all'`.
    * Ketika dipilih, ketiga kartu konten (`teks-bacaan-card`, `infografis-card`, `ecomedia-video-card`) tampil secara bersamaan mengalir dari atas ke bawah sesuai urutan dokumen awal: Teks Bacaan ➔ Data Infografis ➔ Ecomedia Video.
    * Failsafe pada `openReadMaterial(n)` untuk otomatis mengaktifkan mode teks bacaan jika sedang tersembunyi.
  * **Penyusunan Dokumen Perencanaan (Arsitektur):**
    * Menyusun [rencana_permission_control.md](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/rencana_permission_control.md) untuk sistem pembatasan materi & tahap RADEC oleh guru.
    * Menyusun [PR_migrasi_progressRADEC.md](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/PR_migrasi_progressRADEC.md) untuk rencana migrasi penyimpanan progres RADEC ke database.
  * **Verifikasi & Pengujian:**
    * Berkas pengujian [scratch/test_toggle_read_modal.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/scratch/test_toggle_read_modal.js) (6 skenario alur buka, klik teks aman, modal tutup, konfirmasi, batal) lolos 100%.
    * Berkas pengujian [scratch/test_read_tools.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/scratch/test_read_tools.js) (4 skenario tab READ dan Tampilkan Semua) lolos 100%.
    * Seluruh 7 suite regresi aplikasi lolos 100%.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `index.html` — Penambahan tombol toolbar *"Tampilkan Semua"* (Baris 337–342), penambahan kontainer dialog modal `#ecoCloseReadModal` (Baris 1060–1136).
  * `js/read.js` — Pembaruan `openReadTool()` untuk opsi `'all'`, penambahan `showCloseReadModal()`, `closeCloseReadModal()`, `confirmCloseRead()`, perbaikan logika `toggleRead()`, penambahan tombol tutup di footer materi pada `renderReadMaterials()`, dan ekspor fungsi ke `window` & `module.exports`.
  * `rencana_permission_control.md` & `PR_migrasi_progressRADEC.md` — Berkas dokumen perencanaan arsitektur.
  * `scratch/test_read_tools.js` & `scratch/test_toggle_read_modal.js` — Berkas pengujian unit otomatis.

---

### [2026-11-18 18:55:00] — Penambahan Modal Konfirmasi Interaktif Konflik Perubahan Kelas saat Login (#ecoConfirmClassModal)
* **Deskripsi Perubahan:**
  * **Perbaikan Alur Konfirmasi (Menggantikan Silent Patching):**
    * Memperbaiki logika `ecoLogin()` di mana sebelumnya perubahan kelas siswa lama tertangani secara otomatis (*silent patch*) tanpa persetujuan siswa.
    * Kini jika siswa login dengan nama, sekolah, dan no. absen yang sama namun kelasnya berbeda, sistem menghentikan loading screen dan menampilkan dialog konfirmasi interaktif `#ecoConfirmClassModal`.
  * **Desain Modal Menarik & Edukatif Serupa Loading Screen Overlay:**
    * Menggunakan layout overlay kartu `.eco-loading-card` yang bersih, ramah anak, dan responsif di [index.html](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/index.html).
    * Dilengkapi karakter maskot SVG Bumi Cilik berekspresi penasaran (`.eco-mascot-curious`) memegang kaca pembesar dan tanda tanya berkilau.
    * Teks konfirmasi dinamis: *"Halo {nama}, kami menemukan data kamu terdaftar di {kelas_lama} ({sekolah}). Apakah kamu ingin mengubah kelasmu menjadi {kelas_baru}?"*.
  * **Dua Opsi Tindakan Tegas & Failsafe:**
    1. **"Ya, Ubah Kelasku"** (`#btnConfirmChangeClass`): Mengirim `EcoApi.patch()` ke server untuk memperbarui kelas siswa. `id_siswa` lama dipertahankan utuh sehingga seluruh riwayat belajar (READ, ANSWER, DISCUSS, EXPLAIN, CREATE) tetap tersambung.
    2. **"Bukan, Buat Akun Baru"** (`#btnConfirmNewAccount`): Mengirim `EcoApi.post()` ke server dengan ID siswa baru (`S-xxxxx`), untuk kasus siswa berbeda yang kebetulan memiliki nama, nomor absen, dan sekolah yang sama.
    3. **Tombol Batal / Tutup** (`#btnConfirmCancel`, `#ecoConfirmCloseBtn`): Menutup modal konfirmasi dan kembali ke formulir login tanpa mengubah apapun di server.
  * **Sentralisasi `finishLogin()`:**
    * Mengekstraksi alur penyimpanan sesi siswa (`localStorage`), inisialisasi state `ecoStudent`, pembaruan UI identitas (`ecoRenderIdentity()`), notifikasi sukses `showLoadingSuccess()`, dan navigasi ke panduan belajar ke dalam fungsi `finishLogin()` di [js/auth.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/auth.js).
  * **Verifikasi & Pengujian:**
    * Berkas pengujian unit [scratch/test_confirm_class_modal.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/scratch/test_confirm_class_modal.js) memverifikasi 4 skenario (exact login langsung tanpa modal, kemunculan modal saat konflik kelas, aksi konfirmasi PATCH mempertahankan ID, dan aksi akun baru POST dengan ID baru). Lolos 100%.
    * Seluruh 5 rangkaian test script terintegrasi (`test_loading_overlay.js`, `test_sanitasi_failsafe.js`, `test_login_api_integration.js`, `test_edit_profile_modal.js`, `test_confirm_class_modal.js`) lulus verifikasi tanpa galat.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `index.html` — Penambahan dialog modal `#ecoConfirmClassModal` beserta karakter SVG Bumi Cilik penasaran (Baris 985–1063).
  * `js/auth.js` — Penambahan fungsi `showConfirmClassModal()`, `closeConfirmClassModal()`, `finishLogin()`, serta pengikatan event handler pada tombol konfirmasi modal.
  * `scratch/test_confirm_class_modal.js` — Berkas pengujian unit alur modal konfirmasi perubahan kelas.
  * `scratch/test_edit_profile_modal.js` — Penyesuaian mock objek modal konfirmasi.

---

### [2026-11-18 18:42:00] — Penambahan Fitur Modal Ubah Profil Siswa (Opsi 3) & Smart Matching Mencegah Akun Ganda
* **Deskripsi Perubahan:**
  * **Tombol & Badge Info Profil di Halaman Orientasi (`#ecoHome`):**
    * Menambahkan tombol **"✏️ Ubah Profilku"** (`.eco-home-edit-btn`) di bawah ucapan selamat datang `h2` pada [index.html](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/index.html) (`.eco-home-welcome`).
    * Menambahkan badge pil informasi siswa (`#ecoHomeProfileBadge`) yang menampilkan ringkasan kelas, no. absen, dan sekolah siswa secara dinamis.
  * **Modal Interaktif Ubah Profil (`#ecoEditProfileModal`):**
    * Menghadirkan dialog modal responsif lengkap dengan maskot SVG Bumi Cilik memegang pensil, formulir 2-kolom (Nama, Kelas, No. Absen, Sekolah), tombol Simpan dan Batal.
    * Terhubung dengan fungsi `openEditProfileModal()`, `closeEditProfileModal()`, dan `saveEditProfile()` di [js/auth.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/auth.js).
    * Pembaruan data dikirim langsung ke server via `EcoApi.patch('siswa', 'id_siswa', studentId, data)` sehingga `id_siswa` dan riwayat progres belajar siswa tidak pernah hilang atau ter-reset.
  * **Smart Matching Pencegahan Akun Ganda di `ecoLogin()` (Opsi 3):**
    * Jika siswa login dari halaman awal dengan mengetik kelas berbeda (misal sebelumnya `5-B` lalu mengetik `5-A`):
      1. Sistem mendeteksi keberadaan siswa yang sama di server berdasarkan kecocokan `nama`, `sekolah`, dan `absen`.
      2. Sistem otomatis memperbarui data kelas siswa via `EcoApi.patch()` ke `id_siswa` yang sudah ada, alih-alih membuat akun baru via `POST`.
      3. Akun di server tetap tunggal (*single account*) dan tidak membebani database guru dengan duplikasi data.
  * **Styling & Verifikasi:**
    * Penambahan aturan CSS pada [css/welcome.css](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/css/welcome.css) untuk badge profil, tombol ubah profil, dan modal dialog kartu.
    * Seluruh 4 pengujian unit pada [scratch/test_edit_profile_modal.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/scratch/test_edit_profile_modal.js) serta seluruh regression test (`test_sanitasi_failsafe.js`, `test_login_api_integration.js`, `test_loading_overlay.js`) terverifikasi lolos 100%.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `index.html` — Penambahan tombol `.eco-home-edit-btn` & `#ecoHomeProfileBadge` (Baris 152–159), kontainer dialog `#ecoEditProfileModal` beserta SVG maskot cilik (Baris 904–982).
  * `css/welcome.css` — Penambahan styling tombol profil home dan modal kartu (Baris 707–855).
  * `js/auth.js` — Penambahan `openEditProfileModal()`, `closeEditProfileModal()`, `saveEditProfile()`, pembaruan `ecoRenderIdentity()`, dan smart matching pada `ecoLogin()`.
  * `scratch/test_edit_profile_modal.js` — Berkas pengujian unit alur modal ubah profil dan smart matching login.

---

### [2026-11-18 18:08:00] — Penyempurnaan Failsafe Sanitasi Kelas (Dukungan Format Tanpa Strip: 5A, VA, Spasi, dsb.)
* **Deskripsi Perubahan:**
  * **Penyempurnaan Fungsi `sanitasiKelas(inputKelas)` di [js/auth.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/auth.js):**
    1. *Failsafe Format Tanpa Strip:* Menambahkan pemecahan pintar (*smart regex parsing*) untuk mengenali input siswa yang tidak menyertakan tanda strip:
       * Angka desimal langsung disambung huruf rombel (contoh: `5A` atau `5a` ➔ otomatis disanitasi menjadi `5-A`).
       * Angka Romawi langsung disambung huruf rombel (contoh: `VA` atau `va` ➔ `5-A`, `VIA` ➔ `6-A`, `IVC` ➔ `4-C`). Menggunakan pengurutan Romawi panjang lebih dahulu agar `VIA` tidak terpotong menjadi `V` dan `IA`.
    2. *Normalisasi Pemisah Alternatif:* Mengubah variasi karakter pemisah yang sering diketik siswa seperti spasi (`5 A`, `V A`), titik (`5.A`, `V.A`), atau slash (`5/B`, `V/B`) menjadi tanda hubung strip `-`.
    3. *Penanganan Angka Romawi Tunggal:* Memastikan input tingkat kelas tanpa huruf rombel tetap terkonversi sempurna (contoh: `V` ➔ `5`, `VI` ➔ `6`, `XII` ➔ `12`).
  * **Verifikasi & Pengujian:**
    * Berkas pengujian [scratch/test_sanitasi_failsafe.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/scratch/test_sanitasi_failsafe.js) menguji 30 variasi input ekstrim (desimal, romawi, spasi, titik, slash, lowercase) dan terverifikasi lolos 100%.
    * Pengujian integrasi alur login `scratch/test_login_api_integration.js` tetap lolos 100%.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `js/auth.js` — Fungsi `sanitasiKelas()` (Baris 27–66).
  * `scratch/test_sanitasi_failsafe.js` — Berkas pengujian unit 30 variasi kasus input kelas.

---

### [2026-11-18 14:05:00] — Integrasi Login Siswa ke REST API Server, Sanitasi Kelas Romawi, & Penanganan id_siswa Acak
* **Deskripsi Perubahan:**
  * **Sanitasi Angka Romawi pada Kelas (`sanitasiKelas`):** Menambahkan fungsi pembersih input kelas di [js/auth.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/auth.js) yang otomatis mengonversi angka Romawi (I s.d. XII) menjadi angka desimal (1 s.d. 12) serta merapikan tanda pemisah strip (misal `V - A` menjadi `5-A`). Dijalankan saat submit login dan saat event `blur` pada input kelas.
  * **Generator ID Siswa Acak (`generateStudentId`):** Menghasilkan ID siswa unik 5 karakter acak base64 dengan awalan `S-` (contoh: `S-tUvWX`) untuk pendaftaran siswa baru.
  * **Kunci Penyimpanan ID Siswa (`ecoRadecStudentID`):** Menambahkan kunci `studentId: 'ecoRadecStudentID'` pada `STORAGE_KEYS` dan `ECO_KEYS` di [js/store.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/store.js) serta membacanya di `ecoReadState()`.
  * **Alur Login Terintegrasi REST API & Loading Screen (`ecoLogin`):**
    1. Mengaktifkan layar loading `showLoading('Data anda sedang diproses', ...)` saat proses validasi form berhasil.
    2. Mencari data siswa pada tabel `siswa` di backend melalui `EcoApi.getWhere('siswa', criteria)`.
    3. Jika data ditemukan, mengambil `id_siswa` yang tersimpan di server.
    4. Jika data kosong (belum terdaftar), otomatis membuat `id_siswa` acak baru dan mengirim pendaftaran data login siswa via `EcoApi.post('siswa', postData)`.
    5. Menyimpan `id_siswa`, nama, kelas, absen, dan sekolah ke `localStorage` dan objek global `ecoStudent`.
    6. Menampilkan notifikasi sukses `showLoadingSuccess()` yang otomatis tertutup dalam 1 detik sebelum membuka halaman panduan belajar.
    7. Menangkap seluruh galat server / jaringan pada blok `catch` dan menampilkannya secara interaktif pada dialog error `showLoadingError()` dengan tombol tutup.
  * **Integrasi UI Profil Siswa:** Menambahkan baris informasi ID Siswa (`#flowProfileId`) pada panel profil `#flowProfileHelp` di [index.html](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/index.html) dan memperbarui fungsi `flowShowProfile()`.
  * **Verifikasi & Pengujian:** Seluruh 6 skenario pengujian pada `scratch/test_login_api_integration.js` terverifikasi lolos 100% dan bebas galat sintaksis.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `js/auth.js` — Penambahan fungsi `sanitasiKelas()`, `generateStudentId()`, pembaruan `ecoLogin()` menjadi async terhubung `EcoApi`, pembaruan `ecoReadState()` dan `flowShowProfile()`.
  * `js/store.js` — Penambahan `studentId: 'ecoRadecStudentID'` pada `STORAGE_KEYS` (Baris 7) dan `ECO_KEYS` (Baris 112).
  * `index.html` — Penambahan elemen `#flowProfileId` pada panel profil pengguna (Baris 44).
  * `scratch/test_login_api_integration.js` — Berkas pengujian unit & integrasi simulasi API login siswa.

---

### [2026-11-18 13:10:00] — Pembuatan Overlay Layar Penuh (Loading Screen, Error Handling, & Maskot SVG Cilik)
* **Deskripsi Perubahan:**
  * **Overlay Layar Penuh (`#ecoLoadingOverlay`):** Menghadirkan dialog layar penuh di tengah layar berlatar *backdrop blur* gelap lembut yang ramah untuk siswa kelas V SD.
  * **Karakter Maskot Lucu (Bumi Cilik Sahabat RADEC):** Menyediakan 3 wujud visual SVG bertema lingkungan yang interaktif dan ramah anak:
    1. *Status Memproses (`ecoMascotLoading`):* Bumi cilik ceria dengan tunas daun bergoyang lembut (*floating animation*) saat data dikirim ke server.
    2. *Status Kendala (`ecoMascotError`):* Bumi cilik cemas dengan plester di kening, tetesan keringat, dan animasi getar (*wobble animation*) saat terjadi galat jaringan atau penolakan server.
    3. *Status Berhasil (`ecoMascotSuccess`):* Bumi cilik tersenyum lebar dengan kerlipan bintang (*pop animation*).
  * **Pesan & Rincian Galat Interaktif:**
    * Teks default pemrosesan: *"Data anda sedang diproses"* dengan animasi tiga titik denyut (*pulse dots*).
    * Penanganan galat otomatis (*catch block*): Judul berubah menjadi *"Mohon maaf ada masalah"*, deskripsi menampilkan rincian error di dalam kotak peringatan (`#ecoLoadingErrorBox`), serta memunculkan tombol **"Tutup Layar Ini ✕"** (`#ecoLoadingCloseBtn`) untuk menutup overlay.
    * Penutupan otomatis (*auto-close*): Berjalan otomatis saat proses berhasil (`hideLoading()` atau `showLoadingSuccess()`).
  * **Modul JavaScript `js/loading.js` & API Debug:**
    * Menyediakan fungsi global `showLoading()`, `hideLoading()`, `showLoadingError()`, `showLoadingSuccess()`, dan `debugLoading()`.
    * Mempermudah pengujian langsung melalui Console Pengembang (DevTools).
  * **Pengujian Unit & Integritas:**
    * Seluruh 5 skenario pengujian pada `scratch/test_loading_overlay.js` terverifikasi lolos 100% dan bebas galat sintaksis `node -c`.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `css/loading.css` — Penambahan aturan styling overlay, dialog card, animasi maskot (float, wobble, pop), display toggle berbasis kelas state (`state-loading`, `state-error`, `state-success`), serta tombol tutup error.
  * `js/loading.js` — Berkas baru berisi fungsi `showLoading`, `hideLoading`, `showLoadingError`, `showLoadingSuccess`, dan `debugLoading`.
  * `index.html` — Penambahan tautan `css/loading.css` (Baris 21), kontainer markup `#ecoLoadingOverlay` beserta SVG maskot cilik, title, desc, dots, error box, dan tombol aksi (Baris 890–1004), serta pemuatan script `js/loading.js` (Baris 1016).
  * `scratch/test_loading_overlay.js` — Berkas pengujian unit simulasi DOM untuk modul overlay loading.

---

### [2026-11-18 12:42:00] — Penambahan Kolom Nomor Absen Siswa (Side-by-Side) dan Validasi Form Login
* **Deskripsi Perubahan:**
  * Menambahkan kolom input No. Absen (`#ecoStudentNumber`) berdampingan di samping Kelas (`#ecoStudentClass`) pada formulir login `#ecoWelcome`.
  * Mengimplementasikan grid layout 2 kolom (`.eco-form-row-2col`) pada [css/welcome.css](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/css/welcome.css) agar posisi field No. Absen tetap berada di samping Kelas secara konsisten, bahkan pada tampilan layar mobile.
  * Menambahkan validasi kekosongan field absen pada fungsi `ecoLogin()` di [js/auth.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/auth.js) dengan animasi *shake* dan pesan peringatan: `Tuliskan nomor absenmu dulu ya, Sahabat Bumi! 🌱`.
  * Menyimpan nomor absen ke `localStorage` dengan kunci `ecoRadecStudentNumber` melalui `STORAGE_KEYS.number` dan `ECO_KEYS.number` pada [js/store.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/store.js).
  * Memperbarui `ecoReadState()` untuk memulihkan nilai `ecoStudent.absen`, `ecoRenderIdentity()` untuk melampirkan nomor absen pada teks poster/ikrar, `flowShowProfile()` untuk menampilkan no. absen pada panel profil, serta pendaftaran event listener Enter pada input absen di `ecoInit()`.
  * Lolos seluruh 7 skenario pengujian unit pada `scratch/test_login_absen.js` dan verifikasi sintaksis `node -c`.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `index.html` — Penambahan field No. Absen berdampingan dengan Kelas (Baris 101–112) dan baris info profil (Baris 43).
  * `css/welcome.css` — Penambahan aturan styling `.eco-form-row-2col` (Baris 361–373).
  * `js/store.js` — Penambahan kunci `number: 'ecoRadecStudentNumber'` pada `STORAGE_KEYS` (Baris 9) dan `ECO_KEYS` (Baris 114).
  * `js/auth.js` — Penambahan `absen` pada `ecoStudent` (Baris 6), validasi & penyimpanan di `ecoLogin()` (Baris 31–75), pemulihan di `ecoReadState()` (Baris 24), dan integrasi profil/listener (Baris 100–190).
  * `informasi_data.md` — Pembaruan kamus data profil siswa.

---

### [2026-11-18 12:20:00] — Inisiasi Pengembangan Bertahap (Sesi per Sesi) & Persiapan Modul Login Siswa
* **Deskripsi Perubahan:**
  * Menyelaraskan roadmap arsitektur pengembangan aplikasi menjadi bertahap **sesi per sesi** dengan fokus utama pada pengalaman siswa (alur *client*), sembari menyiapkan struktur data yang *server-ready* untuk integrasi panel guru/admin di masa depan.
  * **Fokus Sesi 1 (Login & Identitas Siswa):**
    1. Penguatan struktur identitas siswa di [js/auth.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/auth.js) dan [index.html](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/index.html) (`#ecoWelcome`).
    2. Perancangan ID unik siswa (`student_id` / UUID / kode acak berbasis timestamp) agar seluruh jawaban siswa (mulai dari READ, ANSWER, DISCUSS, EXPLAIN, CREATE, hingga EVALUASI) memiliki relasi identitas yang valid dan siap dikirim ke server.
    3. Penyimpanan terstruktur profil siswa (`id`, `name`, `kelas`, `school`, `loginAt`) di `localStorage` melalui [js/store.js](file:///c:/Users/Admin/Documents/Anti%20Gravity%202/Ecomedia%20Radec/js/store.js).
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `log_dev.md` — Pencatatan inisiasi rencana pengembangan bertahap sesi per sesi.
  * Modul target berikutnya: `js/auth.js` (`ecoLogin`, `ecoReadState`, `ecoStudent`), `js/store.js` (`STORAGE_KEYS.studentId`, `ECO_KEYS`), `index.html` (formulir `#ecoWelcome`).

---

### [2026-11-18 12:05:00] — Perbaikan Persistensi Tahap Aktif (Kuning) dan Pengingat Posisi Belajar Siswa
* **Deskripsi Perubahan:**
  * Memperbaiki masalah hilangnya status kuning "sedang dikerjakan" / `.ready` pada tahap ANSWER ketika aplikasi di-refresh atau dibuka kembali setelah pengguna berhenti belajar:
    1. **Penyimpanan Status Tahap Aktif:** Menambahkan kunci penyimpanan `currentStep: 'ecoRadecCurrentStep'` pada `STORAGE_KEYS` dan `ECO_KEYS` di `js/store.js`. Fungsi `goStep(n)` dan `showFinish()` pada `js/router.js` kini secara otomatis menyimpan indeks tahap belajar ke `localStorage`.
    2. **Pemulihan Tahap Belajar Saat Reload:** Menambahkan logika pemulihan `currentStep` tersimpan pada `js/router.js` dan fungsi `trackerReadState()` di `js/tracker.js` agar nilai tahap aktif tidak selalu ter-reset ke `0`.
    3. **Penentuan Pintar `activeStep` di Peta Petualangan:** Memperbaiki fungsi `ecoRenderProgress()` di `js/tracker.js` agar secara cerdas memprioritaskan `firstOpen` (tahap pertama yang belum selesai) jika tahap `currentStep` sudah tuntas diselesaikan (misalnya tahap 0 READ sudah selesai, maka tahap 1 ANSWER otomatis ditandai kuning).
    4. **Penyempurnaan Indikator Header Tracker:** Memperbarui fungsi `buildTracker()` di `js/tracker.js` agar mengecek himpunan `ecoCompleted` secara langsung untuk penandaan tanda centang (`✓`) dan kelas `.t-done`.
  * Seluruh alur transisi dan persistensi teruji lolos 100% pada simulasi siklus hidup browser di `scratch/test_progress_persistence.js` serta bebas galat sintaksis.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `js/store.js` — Penambahan kunci `currentStep` di `STORAGE_KEYS` dan `ECO_KEYS` (Baris 28, 114).
  * `js/router.js` — Inisialisasi awal membaca `savedStep` (Baris 6–19), penyimpanan `currentStep` di `goStep(n)` (Baris 41–44) dan `showFinish()` (Baris 70–73).
  * `js/tracker.js` — Pemulihan `currentStep` di `trackerReadState()` (Baris 21–32), logika pintar penentuan `activeStep` di `ecoRenderProgress()` (Baris 92–109), dan sinkronisasi `ecoCompleted` di `buildTracker()` (Baris 55–61).

---

### [2026-11-17 23:35:00] — Pemisahan Penuh Seluruh Data Hardcoded dari index.html ke Modul Data Dinamis
* **Deskripsi Perubahan:**
  * Memenuhi instruksi pemisahan mutlak data hardcoded dari berkas markup `index.html`: bukan sekadar ekstraksi, melainkan mencabut seluruh blok HTML statis dan menggantinya dengan kontainer target yang dirender secara dinamis oleh JavaScript.
  * Ukuran `index.html` berhasil dipangkas drastis dari **1.607 baris menjadi 908 baris** (~700 baris kode statis dibersihkan).
  * **Peta Petualangan RADEC (`#ecoMap`):** Kartu tahapan petualangan dipisahkan ke `RADEC_ADVENTURE_STAGES` pada `js/data/templates.js` dan dirender dinamis melalui fungsi `renderAdventureMap()` pada `js/router.js`.
  * **Tahap 1 READ (`#sec-0`):** 5 materi bacaan dan 4 data infografis dipisahkan ke `js/data/materi-read.js` dan dirender dinamis via `renderReadMaterials()` dan `renderReadInfographics()` pada `js/read.js`.
  * **Tahap 3 DISCUSS (`#sec-2`):** 4 Peran kelompok (`DISCUSS_ROLES`) dan 3 lensa evaluasi media (`DISCUSS_LENSES`) dipisahkan ke berkas baru `js/data/discuss-data.js` dan dirender dinamis via `renderDiscussRoles()` dan `renderDiscussLenses()` pada `js/discuss.js`.
  * **Tahap 5 CREATE (`#sec-4`):** 6 Prinsip media (`CREATE_PRINCIPLES`), 6 kategori ikrar (`CREATE_PLEDGE_CATS`), 6 kategori aksi (`CREATE_ACTION_CATS`), dan palet emoji (`CREATE_POSTER_EMOJIS`) dipisahkan ke berkas baru `js/data/create-data.js` dan dirender dinamis via `renderCreateComponents()` pada `js/create.js`.
  * **Siklus Hidup Aplikasi (`js/app.js`):** Mengorkestrasi pemanggilan seluruh fungsi render dinamis baru di dalam `appInit()` sebelum inisialisasi modul dan pemuatan status tersimpan.
  * Seluruh fungsi render teruji valid melalui simulasi Node.js dan validasi sintaksis bebas galat (`node -c`).
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `index.html` — Pangkas 699 baris markup hardcoded (Baris 250–267 Peta RADEC, Baris 350–975 READ, Baris 558–585 DISCUSS, Baris 658–775 CREATE) dan pendaftaran skrip data baru.
  * `js/data/materi-read.js` — Master data materi, infografis, dan ecomedia.
  * `js/data/create-data.js` — Master data prinsip, ikrar, aksi, dan emoji create.
  * `js/data/discuss-data.js` — Berkas master data baru untuk peran kelompok dan lensa diskusi.
  * `js/data/templates.js` — Konfigurasi `RADEC_ADVENTURE_STAGES` untuk Peta RADEC.
  * `js/read.js` — Fungsi `renderReadMaterials()` dan `renderReadInfographics()`.
  * `js/discuss.js` — Fungsi `renderDiscussRoles()` dan `renderDiscussLenses()`.
  * `js/create.js` — Fungsi `renderCreatePrinciples()`, `renderPosterEmojis()`, `renderPledgeCategories()`, `renderActionCategories()`, dan `renderCreateComponents()`.
  * `js/router.js` — Fungsi `renderAdventureMap()`.
  * `js/app.js` — Integrasi pemanggilan fungsi render dinamis dalam `appInit()`.
  * `informasi_data.md` — Pembaruan matriks audit komponen dari hardcoded menjadi dinamis 100%.

---

### [2026-11-17 22:30:00] — Pencatatan Daftar Pekerjaan Rumah (PR) Tahap READ
* **Deskripsi Perubahan:**
  * Mendokumentasikan 3 item Pekerjaan Rumah (PR) yang belum dikerjakan terkait interaktivitas dan atribusi profil siswa pada Tahap READ ke dalam berkas `PR_update_READ.md`:
    1. **PR 1:** Ketiadaan formulir input interaktif dan fungsi penyimpanan untuk respon ajakan (*Ayo Berpikir*) dan tantangan (*Tantangan Berpikir/Tantangan Umar*) di materi bacaan.
    2. **PR 2:** Kewajiban penyertaan identitas data siswa (`ecoStudent.name`, `ecoStudent.school`) dan relasi `target_id_materi` pada setiap tanggapan yang disimpan ke `localStorage`.
    3. **PR 3:** Pembaruan fungsi `saveEcoLens()` pada modul Ecomedia (`js/ecomedia-lens.js`) agar tidak hanya menyimpan hasil analisis 4 lensa melainkan juga mengikatkan profil data siswa.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `PR_update_READ.md` — Pembuatan dokumen spesifikasi PR baru (Baris 1–95)
  * Rencana modul terdampak berikutnya: `js/read.js`, `js/ecomedia-lens.js`, `index.html`

---

### [2026-11-17 22:15:00] — Master Data JSON READ & Perombakan UI Tab Navigasi Sub-Bagian
* **Deskripsi Perubahan:**
  * Pembuatan berkas master data baru `js/data/materi-read.js` yang memuat data terstruktur 5 materi teks bacaan (dengan array tanggapan ber-ID target dan jenis respon), 4 metrik numerasi infografis, dan video ecomedia beserta 4 lensa Antonio López.
  * Implementasi sistem Tabbed View eksklusif pada tahap READ: toolbar atas (`openReadTool`) mengaktifkan hanya satu sub-bagian pada satu waktu (Teks Bacaan, Ecomedia, atau Data Infografis) dan menyembunyikan dua sub-bagian lainnya untuk memangkas panjang halaman dan beban kognitif siswa.
  * Penanganan otomatis jeda pemutaran video (`video.pause()`) saat siswa beralih dari tab Ecomedia ke tab lain.
  * Inisialisasi awal tampilan tab ke Teks Bacaan (`initReadSubTabs()`) saat aplikasi dimuat.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `js/data/materi-read.js` — Pembuatan berkas master data baru (Baris 1–567)
  * `js/read.js` — Fungsi `openReadTool(kind, btn)` (Baris 6–46) dan `initReadSubTabs()` (Baris 48–50)
  * `js/app.js` — Fungsi `appInit()` pemanggilan inisialisasi tab READ (Baris 21)
  * `css/read.css` — Selector `.read-tab-active` dan animasi `@keyframes readTabFadeIn` (Baris 6–13)
  * `index.html` — Tag `<script src="js/data/materi-read.js">` (Baris 1584), penandaan kelas aktif tombol & kartu (Baris 336, 344), serta status tersembunyi awal `#infografis-card` (Baris 985) & `#ecomedia-video-card` (Baris 1020)

---

### [2026-11-17 21:15:00] — Penyesuaian Logika Progres Petualangan (In-Progress vs Selesai)
* **Deskripsi Perubahan:**
  * Menyesuaikan alur pedagogis progres belajar: tahap yang sedang dibuka/dipelajari (misalnya READ) berstatus kuning (`.ready` / `.active`, label `🟡 Siap / sedang dipelajari`), bukan langsung berstatus hijau (`✅ Selesai`).
  * Tahap sebelumnya baru ditandai selesai (`ecoCompleted.add(currentStep)`) dan berubah warna menjadi hijau (`.done`) ketika siswa melangkah maju ke tahap berikutnya (melalui `goStep(n)`).
  * Memperbaiki sinkronisasi global `window.currentStep` dan penanganan `showFinish()`.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `js/tracker.js` — Fungsi `ecoRenderProgress()` (Baris 70–109) dan fungsi `ecoOnStep(step)` (Baris 111–117)
  * `js/router.js` — Fungsi `goStep(n)` (Baris 17–26) dan fungsi `showFinish()` (Baris 44–61)

---

### [2026-11-17 19:56:49] — Perbaikan Sinkronisasi Label Warna Progress Map
* **Deskripsi Perubahan:**
  * Memperbaiki pembaruan status titik huruf `R`, `A`, `D`, `E`, `C` dan kartu tahapan petualangan agar menampilkan warna hijau (`.done`) pada tahap selesai dan kuning (`.ready` / `.active`) pada tahap berikutnya yang siap dipelajari.
  * Menambahkan atribut ID `eco-map-progress` pada elemen kontainer progress petualangan.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `js/tracker.js` — Fungsi `ecoRenderProgress()` (Baris ~70–95)
  * `css/adventure-map.css` — Selector `.eco-progress-dots span.done` dan `.eco-progress-dots span.ready` (Baris ~6–10)
  * `css/welcome.css` — Selector `.eco-progress-dots span.ready` (Baris ~36)
  * `index.html` — Elemen `<section id="eco-map-progress" class="eco-map-progress">` (Baris ~242)

---

### [2026-11-17 19:04:46] — Refaktorisasi Modular Aplikasi (HTML, CSS, JS)
* **Deskripsi Perubahan:**
  * Pemecahan berkas monolitik `index.html` (349 KB) menjadi arsitektur modular terpisah: 12 berkas CSS dan 16 berkas JS.
  * Pencadangan berkas monolitik asli ke `index.monolith.html`.
  * Deduplikasi aturan CSS pada soal esai dan konsolidasi modul storage `store.js`.
* **Blok / Fungsi / Elemen yang Terkena Dampak:**
  * `index.html` — Pembersihan style dan script inline menjadi tag `<link>` dan `<script src>` (Baris 1–1606)
  * `css/*.css` — 12 berkas stylesheet baru pada folder `css/`
  * `js/*.js` dan `js/data/*.js` — 16 berkas skrip modular baru pada folder `js/`

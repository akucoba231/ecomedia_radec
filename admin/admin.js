// ==========================================
// LOGIKA SPA: LOGIN GURU & IDENTITAS
// ==========================================
const KEY_GURU = 'ecoAdminData';
const KEY_GURU_ID = 'ecoAdminIdGuru';

/**
 * Sanitasi input kelas dengan deteksi cerdas (Regex & Angka Romawi/Desimal)
 * Mengatasi variasi input: "5A", "VA", "5-A", "V-A", "V - A", "Kelas 5A", "IVB", dll.
 * Selalu mengembalikan format standar: "[Tingkat]-[Rombel]" (misal: "5-A") atau "[Tingkat]" jika tanpa rombel.
 * @param {string} inputKelas
 * @returns {string}
 */
function sanitasiKelas(inputKelas) {
  if (!inputKelas) return '';
  
  let upper = inputKelas.toUpperCase().trim();
  
  // 1. Bersihkan awalan kata 'KELAS' atau 'KLS' jika guru mengetiknya
  upper = upper.replace(/^(KELAS|KLS)\s*\.?\s*/i, '');
  
  // Kamus angka Romawi (SD sampai SMA = 1 sampai 12)
  const romanToNum = {
    'XII': '12', 'XI': '11', 'VIII': '8', 'VII': '7', 'VI': '6',
    'IV': '4', 'IX': '9', 'III': '3', 'II': '2', 'X': '10',
    'V': '5', 'I': '1'
  };

  // 2. Failsafe Kasus A: Diawali angka Romawi (diurutkan dari terpanjang agar 'VIII' tidak tertangkap 'V')
  const romanPattern = /^(XII|XI|VIII|VII|VI|IX|IV|III|II|X|V|I)([\s\-_]*)(.*)$/;
  const romanMatch = upper.match(romanPattern);
  
  if (romanMatch) {
    const tingkat = romanToNum[romanMatch[1]];
    let rombel = romanMatch[3].trim().replace(/^[-_\s]+|[-_\s]+$/g, '').replace(/\s+/g, '-');
    return rombel ? `${tingkat}-${rombel}` : tingkat;
  }

  // 3. Failsafe Kasus B: Diawali angka desimal (1 sampai 12)
  const numPattern = /^(1[0-2]|[1-9])([\s\-_]*)(.*)$/;
  const numMatch = upper.match(numPattern);
  
  if (numMatch) {
    const tingkat = numMatch[1];
    let rombel = numMatch[3].trim().replace(/^[-_\s]+|[-_\s]+$/g, '').replace(/\s+/g, '-');
    return rombel ? `${tingkat}-${rombel}` : tingkat;
  }

  // 4. Fallback jika format di luar pola standar
  return upper.replace(/\s+/g, '-');
}

/**
 * Buat nilai id_guru dari 5 karakter acak base64 dengan awalan "G-"
 * Contoh: "G-tUvWX", "G-9Ak2L"
 * @returns {string}
 */
function generateIdGuru() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `G-${randomPart}`;
}

// Cek sesi saat halaman dimuat & pasang event listener
document.addEventListener('DOMContentLoaded', () => {
  const savedData = JSON.parse(localStorage.getItem(KEY_GURU) || 'null');
  if (savedData && savedData.nama) {
    // Jika sudah pernah login, isi form agar mudah, atau langsung arahkan
    document.getElementById('guruName').value = savedData.nama;
    document.getElementById('guruClass').value = savedData.kelas || '';
    document.getElementById('guruSchool').value = savedData.sekolah || '';
  }
  
  // Aktifkan enter untuk login
  const guruNameEl = document.getElementById('guruName');
  if (guruNameEl) {
    guruNameEl.addEventListener('keydown', e => { if (e.key === 'Enter') doAdminLogin(); });
  }

  // Sanitasi otomatis input kelas saat mengetik / keluar dari input
  const guruClassEl = document.getElementById('guruClass');
  if (guruClassEl) {
    guruClassEl.addEventListener('blur', () => {
      guruClassEl.value = sanitasiKelas(guruClassEl.value);
    });
    guruClassEl.addEventListener('change', () => {
      guruClassEl.value = sanitasiKelas(guruClassEl.value);
    });
  }

  // Sanitasi otomatis input kelas di modal ubah profil
  const editGuruClassEl = document.getElementById('editGuruClass');
  if (editGuruClassEl) {
    editGuruClassEl.addEventListener('blur', () => {
      editGuruClassEl.value = sanitasiKelas(editGuruClassEl.value);
    });
    editGuruClassEl.addEventListener('change', () => {
      editGuruClassEl.value = sanitasiKelas(editGuruClassEl.value);
    });
  }

  // Pasang listener pencarian data siswa realtime
  const searchSiswaEl = document.getElementById('searchSiswaInput');
  if (searchSiswaEl) {
    searchSiswaEl.addEventListener('input', handleSearchSiswa);
  }

  // Pasang listener pencarian siswa pada menu READ
  const searchReadSiswaEl = document.getElementById('searchReadSiswaInput');
  if (searchReadSiswaEl) {
    searchReadSiswaEl.addEventListener('input', handleSearchReadSiswa);
  }

  // Pasang listener pencarian siswa pada menu Tanggapan (Ecomedia)
  const searchTanggapanSiswaEl = document.getElementById('searchTanggapanSiswaInput');
  if (searchTanggapanSiswaEl) {
    searchTanggapanSiswaEl.addEventListener('input', handleSearchTanggapanSiswa);
  }

  // Pasang listener pencarian siswa pada menu Jawaban (ANSWER)
  const searchAnswerSiswaEl = document.getElementById('searchAnswerSiswaInput');
  if (searchAnswerSiswaEl) {
    searchAnswerSiswaEl.addEventListener('input', handleSearchAnswerSiswa);
  }

  // Inisialisasi tombol otomatis scroll ke atas
  initScrollTopButton();
});

// ==========================================
// OVERLAY LOADING & ERROR CONTROLLER
// ==========================================
/**
 * Tampilkan loading screen overlay
 * @param {string} [title="Data anda sedang diproses"]
 * @param {string} [subText="Mohon tunggu sebentar, sistem sedang memproses data..."]
 */
function showLoading(title = 'Data anda sedang diproses', subText = 'Mohon tunggu sebentar, sistem sedang memproses data...') {
  const overlayEl = document.getElementById('adminOverlay');
  const overlayModalEl = document.querySelector('.eco-overlay-modal');
  const overlayTitleEl = document.getElementById('overlayTitle');
  const overlaySubEl = document.getElementById('overlaySub');
  const overlayErrorBoxEl = document.getElementById('overlayErrorBox');
  const overlayActionAreaEl = document.getElementById('overlayActionArea');

  if (!overlayEl) return;

  // Reset ke state Normal / Loading
  if (overlayModalEl) overlayModalEl.classList.remove('is-error');
  if (overlayTitleEl) overlayTitleEl.textContent = title;
  if (overlaySubEl) {
    overlaySubEl.textContent = subText;
    overlaySubEl.style.display = 'block';
  }
  if (overlayErrorBoxEl) overlayErrorBoxEl.style.display = 'none';
  if (overlayActionAreaEl) overlayActionAreaEl.style.display = 'none';

  // Tampilkan overlay dengan transisi halus
  overlayEl.style.display = 'flex';
  void overlayEl.offsetHeight; // trigger reflow
  overlayEl.classList.add('show');
  overlayEl.setAttribute('aria-hidden', 'false');
}

/**
 * Tampilkan error pada overlay jika proses gagal (misal: catch dari server)
 * @param {string} [errorDetails="Terjadi kendala saat menghubungkan ke server."] Keterangan error yang terjadi
 * @param {string} [title="Mohon maaf ada masalah"]
 */
function showError(errorDetails = 'Terjadi kendala saat menghubungkan ke server.', title = 'Mohon maaf ada masalah') {
  const overlayEl = document.getElementById('adminOverlay');
  const overlayModalEl = document.querySelector('.eco-overlay-modal');
  const overlayTitleEl = document.getElementById('overlayTitle');
  const overlaySubEl = document.getElementById('overlaySub');
  const overlayErrorBoxEl = document.getElementById('overlayErrorBox');
  const overlayErrorMsgEl = document.getElementById('overlayErrorMsg');
  const overlayActionAreaEl = document.getElementById('overlayActionArea');

  if (!overlayEl) return;

  // Aktifkan state Error
  if (overlayModalEl) overlayModalEl.classList.add('is-error');
  if (overlayTitleEl) overlayTitleEl.textContent = title;
  if (overlaySubEl) overlaySubEl.style.display = 'none';
  
  if (overlayErrorMsgEl) {
    overlayErrorMsgEl.textContent = errorDetails;
  }
  if (overlayErrorBoxEl) overlayErrorBoxEl.style.display = 'block';
  if (overlayActionAreaEl) overlayActionAreaEl.style.display = 'block';

  // Pastikan overlay terlihat
  overlayEl.style.display = 'flex';
  void overlayEl.offsetHeight;
  overlayEl.classList.add('show');
  overlayEl.setAttribute('aria-hidden', 'false');
}

/**
 * Tutup otomatis loading screen overlay (ketika proses berhasil)
 */
function hideOverlay() {
  const overlayEl = document.getElementById('adminOverlay');
  if (!overlayEl) return;

  overlayEl.classList.remove('show');
  overlayEl.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    if (!overlayEl.classList.contains('show')) {
      overlayEl.style.display = 'none';
    }
  }, 300);
}

// Alias dan helper global agar siap dipanggil oleh proses fetch/server
window.showLoading = showLoading;
window.showError = showError;
window.hideOverlay = hideOverlay;
window.hideLoading = hideOverlay;

async function doAdminLogin() {
  const nameInput = document.getElementById('guruName');
  const classInput = document.getElementById('guruClass');
  const schoolInput = document.getElementById('guruSchool');
  const errorMsg = document.getElementById('loginErrorMsg');

  const nama = nameInput.value.trim();
  // Sanitasi kelas otomatis jika ada input kelas
  if (classInput.value.trim()) {
    classInput.value = sanitasiKelas(classInput.value);
  }
  const kelas = classInput.value.trim();
  const sekolah = schoolInput.value.trim();

  if (!nama) {
    errorMsg.textContent = 'Mohon isi nama Bapak/Ibu Guru terlebih dahulu.';
    nameInput.classList.add('efek-shake');
    setTimeout(() => nameInput.classList.remove('efek-shake'), 400);
    nameInput.focus();
    return;
  }

  errorMsg.textContent = '';

  // 1. Tampilkan overlay proses belajar dengan maskot lucu
  showLoading('Data anda sedang diproses', 'Menghubungkan dan memverifikasi data guru ke server...');

  try {
    // 2. Cari data guru berdasarkan nama_guru
    const responseGet = await EcoApi.getWhere('guru', { nama_guru: nama });

    if (Array.isArray(responseGet) && responseGet.length > 0) {
      // Tahap 1: Cek apakah ada profil yang kelas dan sekolahnya cocok persis (ternormalisasi)
      const exactMatch = responseGet.find(g => {
        const matchKelas = !kelas || sanitasiKelas(g.kelas_guru) === kelas;
        const matchSekolah = !sekolah || !g.sekolah_guru || g.sekolah_guru.trim().toLowerCase() === sekolah.toLowerCase();
        return matchKelas && matchSekolah;
      });

      if (exactMatch) {
        // Profil langsung cocok -> langsung login tanpa konfirmasi
        await completeLogin(exactMatch);
        return;
      }

      // Tahap 2: Ada guru dengan nama sama, tetapi kelas berbeda (atau beda sekolah)
      // Cari kandidat yang sekolahnya sama, atau ambil entri teratas
      const candidate = responseGet.find(g => !sekolah || !g.sekolah_guru || g.sekolah_guru.trim().toLowerCase() === sekolah.toLowerCase()) || responseGet[0];

      // Tutup loading dan tampilkan modal konfirmasi ganti kelas
      hideOverlay();
      promptChangeClassModal(candidate, nama, kelas, sekolah);
      return;
    }

    // 3. Jika nama belum pernah terdaftar sama sekali -> Buat akun guru baru
    await createNewGuruAccount(nama, kelas, sekolah);

  } catch (err) {
    console.error('[doAdminLogin Error]', err);
    // Tampilkan modal error dengan keterangan kendala dari server
    showError(err.message || 'Terjadi kesalahan saat menghubungkan ke server.', 'Gagal Masuk Dashboard');
  }
}

/**
 * Menyelesaikan proses login: simpan sesi dan buka dashboard
 */
async function completeLogin(guruData) {
  const sessionData = {
    id_guru: guruData.id_guru,
    nama: guruData.nama_guru || guruData.nama || '',
    kelas: guruData.kelas_guru || guruData.kelas || '',
    sekolah: guruData.sekolah_guru || guruData.sekolah || ''
  };
  localStorage.setItem(KEY_GURU, JSON.stringify(sessionData));
  localStorage.setItem(KEY_GURU_ID, sessionData.id_guru);

  // Update Header Dashboard
  const profileEl = document.getElementById('profileBadgeName');
  if (profileEl) {
    profileEl.textContent = `👨‍🏫 Halo, ${sessionData.nama}`;
  }

  // SPA Transisi: Sembunyikan Login, Tampilkan Dashboard
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('adminDashboard').style.display = 'flex';

  // Perbarui indikator loading untuk pengambilan data siswa
  showLoading('Memuat Data Siswa...', 'Mengambil daftar siswa kelas Anda dari server...');

  try {
    await loadDataSiswa();
  } catch (err) {
    console.error('[completeLogin] Gagal memuat data siswa:', err);
  } finally {
    hideOverlay();
  }
}

/**
 * Membuat akun guru baru via POST dan langsung masuk dashboard
 */
async function createNewGuruAccount(nama, kelas, sekolah) {
  const newIdGuru = generateIdGuru();
  const newGuruPayload = {
    id_guru: newIdGuru,
    nama_guru: nama,
    kelas_guru: kelas || '',
    sekolah_guru: sekolah || ''
  };

  const postRes = await EcoApi.post('guru', newGuruPayload);
  const createdData = (postRes && postRes.data) ? postRes.data : newGuruPayload;
  await completeLogin(createdData);
}

/**
 * Memunculkan modal konfirmasi apakah ingin mengubah kelas atau membuat akun baru
 */
function promptChangeClassModal(existingGuru, nama, newClass, newSchool) {
  const modal = document.getElementById('confirmClassModal');
  const msgEl = document.getElementById('confirmClassMsg');
  const btnConfirm = document.getElementById('btnConfirmChangeClass');
  const btnCancel = document.getElementById('btnCancelChangeClass');

  if (!modal || !msgEl || !btnConfirm || !btnCancel) return;

  const kelasLama = existingGuru.kelas_guru || 'belum ditentukan';
  const sekolahLama = existingGuru.sekolah_guru || newSchool || 'sekolah Anda';
  const targetKelas = newClass || 'baru';

  msgEl.innerHTML = `Kami menemukan profil Anda di kelas <strong>${kelasLama}</strong> dari <strong>${sekolahLama}</strong>.<br>Apakah Anda ingin mengubah kelas menjadi <strong>${targetKelas}</strong>?`;

  // Opsi A: Konfirmasi ganti kelas (PATCH ke data guru yang sudah ada)
  btnConfirm.onclick = async () => {
    closeConfirmClassModal();
    showLoading('Memperbarui Kelas Guru...', 'Menyimpan perubahan ke server...');
    try {
      const patchPayload = {
        kelas_guru: newClass || existingGuru.kelas_guru,
        sekolah_guru: newSchool || existingGuru.sekolah_guru
      };
      await EcoApi.patch('guru', 'id_guru', existingGuru.id_guru, patchPayload);

      const updatedGuru = {
        ...existingGuru,
        ...patchPayload
      };
      await completeLogin(updatedGuru);
    } catch (err) {
      showError(err.message || 'Gagal memperbarui kelas guru di server.', 'Gagal Mengubah Kelas');
    }
  };

  // Opsi B: Bukan, buat akun baru (POST)
  btnCancel.onclick = async () => {
    closeConfirmClassModal();
    showLoading('Membuat Akun Guru Baru...', 'Menyimpan data ke server...');
    try {
      await createNewGuruAccount(nama, newClass, newSchool);
    } catch (err) {
      showError(err.message || 'Gagal membuat akun guru baru.', 'Gagal Pendaftaran');
    }
  };

  // Tampilkan modal
  modal.style.display = 'flex';
  void modal.offsetHeight;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

function closeConfirmClassModal() {
  const modal = document.getElementById('confirmClassModal');
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    if (!modal.classList.contains('show')) modal.style.display = 'none';
  }, 300);
}

// ==========================================
// MODAL UBAH PROFIL GURU (DI DALAM DASHBOARD)
// ==========================================
function openProfileModal() {
  const modal = document.getElementById('profileEditModal');
  if (!modal) return;

  // Tutup sidebar otomatis di mobile jika sedang terbuka
  const sidebar = document.getElementById('ecoSidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    toggleSidebar();
  }

  const savedData = JSON.parse(localStorage.getItem(KEY_GURU) || '{}');
  document.getElementById('editGuruName').value = savedData.nama || '';
  document.getElementById('editGuruClass').value = savedData.kelas || '';
  document.getElementById('editGuruSchool').value = savedData.sekolah || '';

  const errEl = document.getElementById('editProfileErrorMsg');
  if (errEl) errEl.textContent = '';

  modal.style.display = 'flex';
  void modal.offsetHeight;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

function closeProfileModal() {
  const modal = document.getElementById('profileEditModal');
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    if (!modal.classList.contains('show')) modal.style.display = 'none';
  }, 300);
}

async function saveProfileChanges() {
  const nameEl = document.getElementById('editGuruName');
  const classEl = document.getElementById('editGuruClass');
  const schoolEl = document.getElementById('editGuruSchool');
  const errEl = document.getElementById('editProfileErrorMsg');

  const nama = nameEl.value.trim();
  if (classEl.value.trim()) {
    classEl.value = sanitasiKelas(classEl.value);
  }
  const kelas = classEl.value.trim();
  const sekolah = schoolEl.value.trim();

  if (!nama) {
    if (errEl) errEl.textContent = 'Nama Guru tidak boleh kosong.';
    nameEl.focus();
    return;
  }

  const currentIdGuru = localStorage.getItem(KEY_GURU_ID) || (JSON.parse(localStorage.getItem(KEY_GURU) || '{}')).id_guru;
  if (!currentIdGuru) {
    if (errEl) errEl.textContent = 'ID Guru tidak ditemukan. Silakan login ulang.';
    return;
  }

  closeProfileModal();
  showLoading('Menyimpan Perubahan Profil...', 'Memperbarui data di server...');

  try {
    const patchPayload = {
      nama_guru: nama,
      kelas_guru: kelas,
      sekolah_guru: sekolah
    };

    await EcoApi.patch('guru', 'id_guru', currentIdGuru, patchPayload);

    // Perbarui localStorage
    const sessionData = {
      id_guru: currentIdGuru,
      nama: nama,
      kelas: kelas,
      sekolah: sekolah
    };
    localStorage.setItem(KEY_GURU, JSON.stringify(sessionData));

    // Perbarui tampilan header profil
    const profileEl = document.getElementById('profileBadgeName');
    if (profileEl) {
      profileEl.textContent = `👨‍🏫 Halo, ${nama}`;
    }

    // Perbarui juga form login jika guru nanti logout
    document.getElementById('guruName').value = nama;
    document.getElementById('guruClass').value = kelas;
    document.getElementById('guruSchool').value = sekolah;

    // Perbarui data siswa di tabel sesuai kelas & sekolah baru
    await loadDataSiswa();

    hideOverlay();

  } catch (err) {
    console.error('[saveProfileChanges Error]', err);
    showError(err.message || 'Gagal memperbarui profil guru di server.', 'Gagal Mengubah Profil');
  }
}

// Ekspos controller modal profil ke window
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.saveProfileChanges = saveProfileChanges;
window.closeConfirmClassModal = closeConfirmClassModal;

// ==========================================
// PENGELOLAAN DATA SISWA (PANEL 1)
// ==========================================
let currentSiswaList = [];

/**
 * Utility escape HTML untuk mencegah XSS
 */
function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Mengambil data siswa dari API berdasarkan sekolah dan kelas guru
 * @param {boolean} [isManualRefresh=false]
 */
async function loadDataSiswa(isManualRefresh = false) {
  const tableBody = document.getElementById('siswaTableBody');
  const infoKelas = document.getElementById('siswaInfoKelas');
  const infoSekolah = document.getElementById('siswaInfoSekolah');
  const infoCount = document.getElementById('siswaInfoCount');

  // Ambil sesi guru yang sedang aktif
  const savedGuru = JSON.parse(localStorage.getItem(KEY_GURU) || '{}');
  const guruKelas = (savedGuru.kelas || '').trim();
  const guruSekolah = (savedGuru.sekolah || '').trim();
  const sanitizedGuruKelas = sanitasiKelas(guruKelas);

  // Update header info filter
  if (infoKelas) infoKelas.textContent = guruKelas || 'Semua Kelas';
  if (infoSekolah) infoSekolah.textContent = guruSekolah || 'Semua Sekolah';

  // Tampilkan indikator loading pada tabel
  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 36px 20px; color: var(--text3);">
          <div style="display: inline-block; font-size: 1.8rem; margin-bottom: 8px;">⏳</div>
          <div style="font-weight: 700; color: var(--text2);">Sedang mengambil data siswa dari server...</div>
          <div style="font-size: 0.82rem; margin-top: 4px;">Menyesuaikan dengan kelas ${escapeHtml(guruKelas || '-')} di ${escapeHtml(guruSekolah || '-')}</div>
        </td>
      </tr>
    `;
  }

  try {
    let rawList = [];

    // Lakukan GET pada tabel siswa:
    // Jika guru memasukkan nama sekolah, lakukan GET WHERE { sekolah: guruSekolah }
    if (guruSekolah) {
      try {
        rawList = await EcoApi.getWhere('siswa', { sekolah: guruSekolah });
      } catch (err) {
        console.warn('[loadDataSiswa] Gagal getWhere sekolah, fallback ke EcoApi.get():', err);
        rawList = await EcoApi.get('siswa');
      }
    } else {
      rawList = await EcoApi.get('siswa');
    }

    if (!Array.isArray(rawList)) {
      rawList = [];
    }

    // Filter siswa yang memiliki kelas dan sekolah yang sama dengan guru
    // Gunakan sanitasiKelas agar variasi angka romawi vs desimal (misal: "V-A" vs "5-A") selalu cocok
    const cleanSekolah = guruSekolah.toLowerCase();
    const filtered = rawList.filter(s => {
      const matchKelas = !sanitizedGuruKelas || sanitasiKelas(s.kelas) === sanitizedGuruKelas;
      const matchSekolah = !cleanSekolah || !s.sekolah || s.sekolah.trim().toLowerCase() === cleanSekolah;
      return matchKelas && matchSekolah;
    });

    // Urutkan siswa berdasarkan nomor absen (numerik) jika ada, lalu nama
    filtered.sort((a, b) => {
      const numA = parseInt(a.absen, 10);
      const numB = parseInt(b.absen, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return (a.nama || '').localeCompare(b.nama || '');
    });

    currentSiswaList = filtered;

    // Reset input pencarian jika sedang refresh manual
    const searchInput = document.getElementById('searchSiswaInput');
    if (searchInput && isManualRefresh) {
      searchInput.value = '';
    }

    // Render data ke tabel
    const currentQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (currentQuery) {
      handleSearchSiswa();
    } else {
      renderSiswaTable(currentSiswaList);
    }

    // Sinkronkan juga daftar siswa ke tabel Menu READ, Menu Tanggapan (Ecomedia), dan Menu Jawaban (ANSWER)
    renderReadSiswaTable(currentSiswaList);
    renderTanggapanSiswaTable(currentSiswaList);
    renderAnswerSiswaTable(currentSiswaList);

  } catch (err) {
    console.error('[loadDataSiswa Error]', err);
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 32px 20px; color: #DC2626;">
            <div style="font-size: 1.8rem; margin-bottom: 6px;">⚠️</div>
            <div style="font-weight: 800;">Gagal memuat data siswa dari server.</div>
            <div style="font-size: 0.85rem; color: var(--text3); margin: 6px 0 14px;">${escapeHtml(err.message || 'Koneksi terputus')}</div>
            <button class="eco-btn-secondary" onclick="loadDataSiswa(true)" style="font-size: 0.82rem; padding: 6px 14px;">🔄 Coba Lagi</button>
          </td>
        </tr>
      `;
    }
    if (infoCount) infoCount.textContent = '0';
  }
}

/**
 * Merender baris tabel data siswa ke #siswaTableBody
 * @param {Array} students
 * @param {string} [searchQuery='']
 */
function renderSiswaTable(students, searchQuery = '') {
  const tableBody = document.getElementById('siswaTableBody');
  const infoCount = document.getElementById('siswaInfoCount');

  if (!tableBody) return;

  if (infoCount) {
    infoCount.textContent = students ? students.length : 0;
  }

  if (!students || students.length === 0) {
    if (searchQuery) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="siswa-empty-state">
            <span class="siswa-empty-icon">🔍</span>
            <strong>Tidak ditemukan siswa yang cocok dengan "${escapeHtml(searchQuery)}"</strong>
            <div style="font-size: 0.82rem; color: var(--text3); margin-top: 4px;">Coba gunakan kata kunci nama atau nomor absen lain.</div>
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="siswa-empty-state">
            <span class="siswa-empty-icon">🎒</span>
            <strong>Belum ada siswa yang terdaftar untuk kelas ini.</strong>
            <div style="font-size: 0.85rem; color: var(--text3); margin-top: 4px;">
              Siswa yang masuk ke aplikasi dengan kelas dan sekolah yang sama akan otomatis tampil di sini.
            </div>
          </td>
        </tr>
      `;
    }
    return;
  }

  let htmlRows = '';
  students.forEach((student, index) => {
    const no = index + 1;
    const absen = student.absen ? escapeHtml(student.absen) : '-';
    const nama = escapeHtml(student.nama || 'Tanpa Nama');
    const kelas = escapeHtml(student.kelas || '-');
    const sekolah = escapeHtml(student.sekolah || '-');
    const idSiswa = escapeHtml(student.id_siswa || '');

    htmlRows += `
      <tr data-id-siswa="${idSiswa}">
        <td>${no}</td>
        <td><span class="absen-badge">${absen}</span></td>
        <td><strong>${nama}</strong></td>
        <td><span class="kelas-badge">${kelas}</span></td>
        <td>${sekolah}</td>
        <td style="text-align: center; white-space: nowrap;">
          <button class="btn-action" onclick="openEditSiswaModal('${idSiswa}')" title="Edit Data Siswa">✏️ Edit</button>
          <button class="btn-action delete" onclick="openConfirmDeleteSiswaModal('${idSiswa}')" title="Hapus Siswa">🗑️ Hapus</button>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = htmlRows;
}

/**
 * Filter realtime pada input pencarian nama / absen siswa
 */
function handleSearchSiswa() {
  const searchInput = document.getElementById('searchSiswaInput');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  if (!query) {
    renderSiswaTable(currentSiswaList);
    return;
  }

  const filtered = currentSiswaList.filter(s => {
    const matchNama = (s.nama || '').toLowerCase().includes(query);
    const matchAbsen = (s.absen || '').toString().toLowerCase().includes(query);
    return matchNama || matchAbsen;
  });

  renderSiswaTable(filtered, query);
}

// ==========================================
// PENGELOLAAN MODAL EDIT & HAPUS SISWA
// ==========================================
let pendingDeleteSiswaId = null;

/**
 * Membuka modal edit data siswa dengan mengisi nilai awal dari data yang dipilih
 * @param {string} idSiswa
 */
function openEditSiswaModal(idSiswa) {
  const modal = document.getElementById('editSiswaModal');
  if (!modal) return;

  const student = currentSiswaList.find(s => s.id_siswa === idSiswa);
  if (!student) {
    alert('Data siswa tidak ditemukan.');
    return;
  }

  document.getElementById('editSiswaId').value = student.id_siswa || '';
  document.getElementById('editSiswaNama').value = student.nama || '';
  document.getElementById('editSiswaAbsen').value = student.absen || '';
  document.getElementById('editSiswaKelas').value = student.kelas || '';
  document.getElementById('editSiswaSekolah').value = student.sekolah || '';

  const errEl = document.getElementById('editSiswaErrorMsg');
  if (errEl) errEl.textContent = '';

  modal.style.display = 'flex';
  void modal.offsetHeight;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

/**
 * Menutup modal edit data siswa
 */
function closeEditSiswaModal() {
  const modal = document.getElementById('editSiswaModal');
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    if (!modal.classList.contains('show')) modal.style.display = 'none';
  }, 300);
}

/**
 * Menyimpan pembaruan data siswa ke REST API server
 */
async function saveEditSiswa() {
  const idEl = document.getElementById('editSiswaId');
  const namaEl = document.getElementById('editSiswaNama');
  const absenEl = document.getElementById('editSiswaAbsen');
  const kelasEl = document.getElementById('editSiswaKelas');
  const sekolahEl = document.getElementById('editSiswaSekolah');
  const errEl = document.getElementById('editSiswaErrorMsg');

  const idSiswa = idEl.value.trim();
  const nama = namaEl.value.trim();
  const absen = absenEl.value.trim();
  let kelas = kelasEl.value.trim();
  if (kelas) {
    kelas = sanitasiKelas(kelas);
    kelasEl.value = kelas;
  }
  const sekolah = sekolahEl.value.trim();

  if (!idSiswa) {
    if (errEl) errEl.textContent = 'ID Siswa tidak valid.';
    return;
  }
  if (!nama) {
    if (errEl) errEl.textContent = 'Nama Siswa wajib diisi.';
    namaEl.focus();
    return;
  }
  if (!absen) {
    if (errEl) errEl.textContent = 'Nomor Absen wajib diisi.';
    absenEl.focus();
    return;
  }
  if (!kelas) {
    if (errEl) errEl.textContent = 'Kelas wajib diisi.';
    kelasEl.focus();
    return;
  }

  closeEditSiswaModal();
  showLoading('Menyimpan Perubahan Siswa...', 'Memperbarui data siswa di server...');

  try {
    const patchPayload = {
      nama: nama,
      absen: absen,
      kelas: kelas,
      sekolah: sekolah
    };

    await EcoApi.patch('siswa', 'id_siswa', idSiswa, patchPayload);

    // Muat ulang data siswa dari server agar data dan tabel selalu sinkron
    await loadDataSiswa(true);

    hideOverlay();
  } catch (err) {
    console.error('[saveEditSiswa Error]', err);
    showError(err.message || 'Gagal memperbarui data siswa di server.', 'Gagal Mengubah Siswa');
  }
}

/**
 * Membuka modal konfirmasi hapus siswa
 * @param {string} idSiswa
 */
function openConfirmDeleteSiswaModal(idSiswa) {
  const modal = document.getElementById('confirmDeleteSiswaModal');
  if (!modal) return;

  const student = currentSiswaList.find(s => s.id_siswa === idSiswa);
  if (!student) {
    alert('Data siswa tidak ditemukan.');
    return;
  }

  pendingDeleteSiswaId = idSiswa;

  const targetNameEl = document.getElementById('deleteTargetSiswaName');
  if (targetNameEl) {
    targetNameEl.textContent = `${student.nama || 'Siswa'} (Absen: ${student.absen || '-'}, Kelas: ${student.kelas || '-'})`;
  }

  modal.style.display = 'flex';
  void modal.offsetHeight;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

/**
 * Menutup modal konfirmasi hapus siswa
 */
function closeConfirmDeleteSiswaModal() {
  const modal = document.getElementById('confirmDeleteSiswaModal');
  pendingDeleteSiswaId = null;
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    if (!modal.classList.contains('show')) modal.style.display = 'none';
  }, 300);
}

/**
 * Menghapus data siswa dari REST API server
 */
async function executeDeleteSiswa() {
  if (!pendingDeleteSiswaId) return;
  const targetId = pendingDeleteSiswaId;

  closeConfirmDeleteSiswaModal();
  showLoading('Menghapus Data Siswa...', 'Menghapus data siswa dari server...');

  try {
    await EcoApi.delete('siswa', 'id_siswa', targetId);

    // Muat ulang data siswa dari server
    await loadDataSiswa(true);

    hideOverlay();
  } catch (err) {
    console.error('[executeDeleteSiswa Error]', err);
    showError(err.message || 'Gagal menghapus data siswa dari server.', 'Gagal Menghapus Siswa');
  }
}

// Ekspos controller siswa ke global window
window.loadDataSiswa = loadDataSiswa;
window.renderSiswaTable = renderSiswaTable;
window.handleSearchSiswa = handleSearchSiswa;
window.openEditSiswaModal = openEditSiswaModal;
window.closeEditSiswaModal = closeEditSiswaModal;
window.saveEditSiswa = saveEditSiswa;
window.openConfirmDeleteSiswaModal = openConfirmDeleteSiswaModal;
window.closeConfirmDeleteSiswaModal = closeConfirmDeleteSiswaModal;
window.executeDeleteSiswa = executeDeleteSiswa;

// ==========================================
// PENGELOLAAN MENU PERTANYAAN SISWA (READ)
// ==========================================

const MAP_MATERI = {
  'materi-1': 'Materi 1 · Cuaca, Iklim, dan Musim',
  'materi-2': 'Materi 2 · Efek Rumah Kaca',
  'materi-3': 'Materi 3 · Penyebab Perubahan Iklim',
  'materi-4': 'Materi 4 · Dampak Perubahan Iklim',
  'materi-5': 'Materi 5 · Tindakan Mitigasi & Adaptasi'
};

function getNamaMateri(idMateri) {
  if (!idMateri) return 'Materi Tidak Diketahui';
  return MAP_MATERI[idMateri] || idMateri.replace(/-/g, ' ').toUpperCase();
}

/**
 * Failsafe parser untuk field keterangan tantangan
 * Menangani:
 * 1. Objek langsung (jika response API otomatis decode JSON)
 * 2. String JSON (hasil JSON.stringify)
 * 3. Double-stringified JSON
 * Jika kosong / undefined / gagal parse, Stimulus dan Opsi berisi: "Periksa materi pada {id_materi}"
 */
function parseKeteranganTantangan(keterangan, idMateri) {
  const fallbackText = `Periksa materi pada ${idMateri || 'materi terkait'}`;
  let stimulus = fallbackText;
  let opsi = fallbackText;
  let parsed = null;

  // Kasus A: keterangan sudah berupa Object
  if (keterangan && typeof keterangan === 'object') {
    parsed = keterangan;
  } 
  // Kasus B: keterangan berupa String JSON
  else if (keterangan && typeof keterangan === 'string' && keterangan.trim() !== '') {
    try {
      parsed = JSON.parse(keterangan.trim());
      // Failsafe jika string di-stringify ganda
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed.trim());
        } catch (e2) {}
      }
    } catch (e) {
      parsed = null;
    }
  }

  // Jika berhasil mendapatkan data objek
  if (parsed && typeof parsed === 'object') {
    if (parsed.stimulus !== undefined && parsed.stimulus !== null && String(parsed.stimulus).trim() !== '') {
      stimulus = typeof parsed.stimulus === 'object' ? JSON.stringify(parsed.stimulus) : String(parsed.stimulus);
    }
    if (parsed.opsi !== undefined && parsed.opsi !== null) {
      if (Array.isArray(parsed.opsi)) {
        opsi = parsed.opsi.join('\n');
      } else if (typeof parsed.opsi === 'object') {
        opsi = JSON.stringify(parsed.opsi);
      } else if (String(parsed.opsi).trim() !== '') {
        opsi = String(parsed.opsi);
      }
    }
  }

  return { stimulus, opsi };
}

/**
 * Helper format teks stimulus agar tag penekanan aman (seperti <strong>) tetap ter-render dengan baik
 */
function formatStimulusText(text) {
  if (!text) return '';
  return escapeHtml(text)
    .replace(/&lt;strong&gt;/gi, '<strong>')
    .replace(/&lt;\/strong&gt;/gi, '</strong>')
    .replace(/&lt;b&gt;/gi, '<b>')
    .replace(/&lt;\/b&gt;/gi, '</b>')
    .replace(/&lt;em&gt;/gi, '<em>')
    .replace(/&lt;\/em&gt;/gi, '</em>')
    .replace(/&lt;br\s*\/?&gt;/gi, '<br>');
}

/**
 * Merender daftar siswa pada tabel di Menu Pertanyaan Siswa (READ)
 * Kolom: No, Nama, Kelas, Sekolah, Opsi (Tombol Lihat)
 */
function renderReadSiswaTable(students, searchQuery = '') {
  const tableBody = document.getElementById('readSiswaTableBody');
  const countBadge = document.getElementById('readSiswaCount');

  if (!tableBody) return;

  const listToRender = students || currentSiswaList || [];
  if (countBadge) {
    countBadge.textContent = listToRender.length;
  }

  if (listToRender.length === 0) {
    if (searchQuery) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="siswa-empty-state">
            <span class="siswa-empty-icon">🔍</span>
            <strong>Tidak ditemukan siswa yang cocok dengan "${escapeHtml(searchQuery)}"</strong>
            <div style="font-size: 0.82rem; color: var(--text3); margin-top: 4px;">Coba gunakan kata kunci nama lain.</div>
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="siswa-empty-state">
            <span class="siswa-empty-icon">🎒</span>
            <strong>Belum ada siswa yang terdaftar untuk kelas ini.</strong>
          </td>
        </tr>
      `;
    }
    return;
  }

  let rows = '';
  listToRender.forEach((s, idx) => {
    const no = idx + 1;
    const nama = escapeHtml(s.nama || 'Tanpa Nama');
    const kelas = escapeHtml(s.kelas || '-');
    const sekolah = escapeHtml(s.sekolah || '-');
    const idSiswa = escapeHtml(s.id_siswa || '');

    rows += `
      <tr data-id-siswa="${idSiswa}">
        <td>${no}</td>
        <td><strong>${nama}</strong></td>
        <td><span class="kelas-badge">${kelas}</span></td>
        <td>${sekolah}</td>
        <td style="text-align: center; white-space: nowrap;">
          <button class="btn-action" onclick="viewDetailRead('${idSiswa}')" title="Lihat Pertanyaan & Tantangan Siswa" style="font-weight: 800; color: var(--c-accent-d);">
            👁️ Lihat
          </button>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = rows;
}

/**
 * Filter pencarian realtime untuk tabel siswa di menu READ
 */
function handleSearchReadSiswa() {
  const searchInput = document.getElementById('searchReadSiswaInput');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  if (!query) {
    renderReadSiswaTable(currentSiswaList);
    return;
  }

  const filtered = currentSiswaList.filter(s => {
    return (s.nama || '').toLowerCase().includes(query) || (s.absen || '').toString().toLowerCase().includes(query);
  });

  renderReadSiswaTable(filtered, query);
}

/**
 * Refresh manual tabel siswa di menu READ
 */
async function loadReadSiswaTable(isManualRefresh = false) {
  if (currentSiswaList.length === 0) {
    await loadDataSiswa(isManualRefresh);
  }
  const searchInput = document.getElementById('searchReadSiswaInput');
  if (searchInput && isManualRefresh) {
    searchInput.value = '';
  }
  renderReadSiswaTable(currentSiswaList);
}

/**
 * Mengambil data pertanyaan dan tantangan siswa via API (WHERE id_siswa)
 * dan menampilkan tampilan detail 2 blok card
 * @param {string} idSiswa
 */
async function viewDetailRead(idSiswa) {
  if (!idSiswa) return;

  // Temukan data profil siswa dari memori lokal currentSiswaList
  const student = currentSiswaList.find(s => s.id_siswa === idSiswa) || {
    id_siswa: idSiswa,
    nama: 'Siswa',
    kelas: '-',
    sekolah: '-',
    absen: '-'
  };

  showLoading('Memuat Data Siswa...', 'Mengambil data pertanyaan dan tanggapan siswa...');

  try {
    // 1. Ambil data dari tabel pertanyaan dan tantangan dengan WHERE id_siswa secara paralel
    const [pertanyaanList, tantanganList] = await Promise.all([
      EcoApi.getWhere('pertanyaan', { id_siswa: idSiswa }),
      EcoApi.getWhere('tantangan', { id_siswa: idSiswa })
    ]);

    const validPertanyaan = Array.isArray(pertanyaanList) ? pertanyaanList : [];
    const validTantangan = Array.isArray(tantanganList) ? tantanganList : [];

    // 2. Isi Header Detail
    const nameEl = document.getElementById('readDetailStudentName');
    const metaEl = document.getElementById('readDetailStudentMeta');
    if (nameEl) nameEl.textContent = `👤 ${student.nama}`;
    if (metaEl) {
      const absenText = student.absen ? ` (No. Absen: ${student.absen})` : '';
      metaEl.textContent = `Kelas ${student.kelas} • ${student.sekolah}${absenText}`;
    }

    // 3. Render Blok 1: Daftar Pertanyaan Siswa
    const pertanyaanBadge = document.getElementById('readPertanyaanCountBadge');
    if (pertanyaanBadge) {
      pertanyaanBadge.textContent = `${validPertanyaan.length} Pertanyaan`;
    }

    const pertanyaanContainer = document.getElementById('readPertanyaanList');
    if (pertanyaanContainer) {
      if (validPertanyaan.length === 0) {
        pertanyaanContainer.innerHTML = `
          <div class="siswa-empty-state" style="padding: 24px 10px;">
            <span class="siswa-empty-icon" style="font-size: 1.8rem;">📝</span>
            <div style="font-size: 0.9rem; font-weight: 700;">Belum ada pertanyaan</div>
            <small style="color: var(--text3);">Siswa belum merumuskan pertanyaan mandiri pada tahap READ.</small>
          </div>
        `;
      } else {
        let pCards = '';
        validPertanyaan.forEach((item, idx) => {
          const materiNama = getNamaMateri(item.id_materi);
          const pertanyaanText = item.pertanyaan ? item.pertanyaan : '(Pertanyaan kosong)';

          pCards += `
            <div class="read-item-card pertanyaan">
              <div class="response-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span class="badge badge-blue" style="margin: 0;">${escapeHtml(materiNama)}</span>
                <span style="font-size: 0.75rem; color: var(--text3); font-family: monospace;">#${idx + 1} • ${escapeHtml(item.id_materi || '-')}</span>
              </div>
              <div style="font-size: 0.8rem; font-weight: 800; color: var(--text3); margin-bottom: 4px;">Pertanyaan Siswa:</div>
              <div class="response-box" style="margin-bottom: 0; background: #F0F9FF; border-color: #BAE6FD; color: #0C4A6E; font-weight: 600; font-size: 0.9rem;">
                "${escapeHtml(pertanyaanText)}"
              </div>
            </div>
          `;
        });
        pertanyaanContainer.innerHTML = pCards;
      }
    }

    // 4. Render Blok 2: Daftar Tanggapan Siswa (Tantangan)
    const tantanganBadge = document.getElementById('readTantanganCountBadge');
    if (tantanganBadge) {
      tantanganBadge.textContent = `${validTantangan.length} Tanggapan`;
    }

    const tantanganContainer = document.getElementById('readTantanganList');
    if (tantanganContainer) {
      if (validTantangan.length === 0) {
        tantanganContainer.innerHTML = `
          <div class="siswa-empty-state" style="padding: 24px 10px;">
            <span class="siswa-empty-icon" style="font-size: 1.8rem;">🎯</span>
            <div style="font-size: 0.9rem; font-weight: 700;">Belum ada tanggapan tantangan</div>
            <small style="color: var(--text3);">Siswa belum mengirimkan respon tantangan pada tahap READ.</small>
          </div>
        `;
      } else {
        let tCards = '';
        validTantangan.forEach((item, idx) => {
          const materiNama = getNamaMateri(item.id_materi);
          const { stimulus, opsi } = parseKeteranganTantangan(item.keterangan, item.id_materi);
          const jawabanText = item.jawaban ? item.jawaban : '(Belum ada jawaban)';

          tCards += `
            <div class="read-item-card tanggapan">
              <div class="response-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span class="badge badge-purple" style="margin: 0;">${escapeHtml(materiNama)}</span>
                <span style="font-size: 0.75rem; color: var(--text3); font-family: monospace;">#${idx + 1} • ${escapeHtml(item.id_materi || '-')}</span>
              </div>
              
              <div style="margin-bottom: 10px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--text3); margin-bottom: 3px;">📖 Stimulus:</div>
                <div style="font-size: 0.85rem; color: var(--text2); background: #FAF5FF; padding: 10px 12px; border-radius: 8px; border: 1px solid #E9D5FF; line-height: 1.6;">
                  ${formatStimulusText(stimulus)}
                </div>
              </div>

              <div style="margin-bottom: 10px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--text3); margin-bottom: 3px;">🔘 Opsi:</div>
                <div style="font-size: 0.85rem; color: var(--text2); background: #FAF5FF; padding: 10px 12px; border-radius: 8px; border: 1px solid #E9D5FF; line-height: 1.6; white-space: pre-line;">
                  ${escapeHtml(opsi)}
                </div>
              </div>

              <div>
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--c-accent-d); margin-bottom: 3px;">✍️ Jawaban Siswa:</div>
                <div style="font-size: 0.88rem; font-weight: 700; color: var(--text); background: #F0FDF4; padding: 10px 12px; border-radius: 8px; border: 1px solid #BBF7D0; line-height: 1.5;">
                  ${escapeHtml(jawabanText)}
                </div>
              </div>
            </div>
          `;
        });
        tantanganContainer.innerHTML = tCards;
      }
    }

    // 5. Ganti tampilan ke Detail View
    const listView = document.getElementById('readListView');
    const detailView = document.getElementById('readDetailView');
    if (listView) listView.style.display = 'none';
    if (detailView) {
      detailView.style.display = 'block';
      detailView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    hideOverlay();

  } catch (err) {
    console.error('[viewDetailRead Error]', err);
    showError(err.message || 'Gagal memuat data pertanyaan & tantangan siswa dari server.', 'Gagal Memuat Detail');
  }
}

/**
 * Menutup tampilan detail dan kembali ke tabel daftar siswa di menu READ
 */
function closeDetailRead() {
  const listView = document.getElementById('readListView');
  const detailView = document.getElementById('readDetailView');
  if (detailView) detailView.style.display = 'none';
  if (listView) {
    listView.style.display = 'block';
    renderReadSiswaTable(currentSiswaList);
  }
}

// Ekspos controller READ ke global window
window.renderReadSiswaTable = renderReadSiswaTable;
window.handleSearchReadSiswa = handleSearchReadSiswa;
window.loadReadSiswaTable = loadReadSiswaTable;
window.viewDetailRead = viewDetailRead;
window.closeDetailRead = closeDetailRead;

// ==========================================
// PENGELOLAAN MENU TANGGAPAN SISWA (ECOMEDIA)
// ==========================================

/**
 * Merender daftar siswa pada tabel di Menu Tanggapan Siswa (Ecomedia)
 * Kolom: No, Nama, Kelas, Sekolah, Opsi (Tombol Lihat)
 */
function renderTanggapanSiswaTable(students, searchQuery = '') {
  const tableBody = document.getElementById('tanggapanSiswaTableBody');
  const countBadge = document.getElementById('tanggapanSiswaCount');

  if (!tableBody) return;

  const listToRender = students || currentSiswaList || [];
  if (countBadge) {
    countBadge.textContent = listToRender.length;
  }

  if (listToRender.length === 0) {
    if (searchQuery) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="siswa-empty-state">
            <span class="siswa-empty-icon">🔍</span>
            <strong>Tidak ditemukan siswa yang cocok dengan "${escapeHtml(searchQuery)}"</strong>
            <div style="font-size: 0.82rem; color: var(--text3); margin-top: 4px;">Coba gunakan kata kunci nama lain.</div>
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="siswa-empty-state">
            <span class="siswa-empty-icon">🎒</span>
            <strong>Belum ada siswa yang terdaftar untuk kelas ini.</strong>
          </td>
        </tr>
      `;
    }
    return;
  }

  let rows = '';
  listToRender.forEach((s, idx) => {
    const no = idx + 1;
    const nama = escapeHtml(s.nama || 'Tanpa Nama');
    const kelas = escapeHtml(s.kelas || '-');
    const sekolah = escapeHtml(s.sekolah || '-');
    const idSiswa = escapeHtml(s.id_siswa || '');

    rows += `
      <tr data-id-siswa="${idSiswa}">
        <td>${no}</td>
        <td><strong>${nama}</strong></td>
        <td><span class="kelas-badge">${kelas}</span></td>
        <td>${sekolah}</td>
        <td style="text-align: center; white-space: nowrap;">
          <button class="btn-action" onclick="viewDetailTanggapan('${idSiswa}')" title="Lihat Tanggapan Ecomedia Siswa" style="font-weight: 800; color: #168246;">
            👁️ Lihat
          </button>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = rows;
}

/**
 * Filter pencarian realtime untuk tabel siswa di menu Tanggapan (Ecomedia)
 */
function handleSearchTanggapanSiswa() {
  const searchInput = document.getElementById('searchTanggapanSiswaInput');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  if (!query) {
    renderTanggapanSiswaTable(currentSiswaList);
    return;
  }

  const filtered = currentSiswaList.filter(s => {
    return (s.nama || '').toLowerCase().includes(query) || (s.absen || '').toString().toLowerCase().includes(query);
  });

  renderTanggapanSiswaTable(filtered, query);
}

/**
 * Refresh manual tabel siswa di menu Tanggapan (Ecomedia)
 */
async function loadTanggapanSiswaTable(isManualRefresh = false) {
  if (currentSiswaList.length === 0) {
    await loadDataSiswa(isManualRefresh);
  }
  const searchInput = document.getElementById('searchTanggapanSiswaInput');
  if (searchInput && isManualRefresh) {
    searchInput.value = '';
  }
  renderTanggapanSiswaTable(currentSiswaList);
}

/**
 * Mengambil data tanggapan ecomedia siswa via API (WHERE id_siswa)
 * dan menampilkan tampilan detail 1 blok Ecomedia
 * @param {string} idSiswa
 */
async function viewDetailTanggapan(idSiswa) {
  if (!idSiswa) return;

  // Temukan data profil siswa dari memori lokal currentSiswaList
  const student = currentSiswaList.find(s => s.id_siswa === idSiswa) || {
    id_siswa: idSiswa,
    nama: 'Siswa',
    kelas: '-',
    sekolah: '-',
    absen: '-'
  };

  showLoading('Memuat Data Siswa...', 'Mengambil data tanggapan Ecomedia siswa...');

  try {
    // 1. Ambil data dari tabel ecomedia dengan WHERE id_siswa
    const ecomediaList = await EcoApi.getWhere('ecomedia', { id_siswa: idSiswa });
    const validList = Array.isArray(ecomediaList) ? ecomediaList : [];

    // 2. Isi Header Detail Siswa
    const nameEl = document.getElementById('tanggapanDetailStudentName');
    const metaEl = document.getElementById('tanggapanDetailStudentMeta');
    if (nameEl) nameEl.textContent = `👤 ${student.nama}`;
    if (metaEl) {
      const absenText = student.absen ? ` (No. Absen: ${student.absen})` : '';
      metaEl.textContent = `Kelas ${student.kelas} • ${student.sekolah}${absenText}`;
    }

    // 3. Render 1 Blok Card: Daftar Tanggapan Ecomedia
    const countBadge = document.getElementById('tanggapanCountBadge');
    if (countBadge) {
      countBadge.textContent = `${validList.length} Tanggapan`;
    }

    const container = document.getElementById('tanggapanList');
    if (container) {
      if (validList.length === 0) {
        container.innerHTML = `
          <div class="siswa-empty-state" style="padding: 32px 10px;">
            <span class="siswa-empty-icon" style="font-size: 2rem;">🌱</span>
            <div style="font-size: 0.95rem; font-weight: 700;">Belum ada tanggapan Ecomedia</div>
            <small style="color: var(--text3);">Siswa belum mengirimkan respon analisis media lingkungan (Ecomedia).</small>
          </div>
        `;
      } else {
        let cards = '';
        validList.forEach((item, idx) => {
          const sumber = item.sumber || 'Media Lingkungan';
          const ceritaNilai = item.cerita_nilai || '-';
          const siapaBerperan = item.siapa_berperan || '-';
          const bahanEnergiLimbah = item.bahan_energi_limbah || '-';
          const pengalamanKita = item.pengalaman_kita || '-';
          // item.keterangan disembunyikan sesuai instruksi

          cards += `
            <div class="read-item-card ecomedia" style="border-left: 4.5px solid #168246; margin-bottom: 16px;">
              <div class="response-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="badge badge-green" style="margin: 0; font-size: 0.78rem;">🌱 Sumber Media</span>
                  <h4 style="margin: 0; font-family: 'Sora', sans-serif; font-size: 1.05rem; color: var(--text);">${escapeHtml(sumber)}</h4>
                </div>
                <span style="font-size: 0.75rem; color: var(--text3); font-family: monospace;">#${idx + 1}</span>
              </div>

              <!-- 1. Cerita & Nilai -->
              <div style="margin-bottom: 10px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--text3); margin-bottom: 3px;">📖 Cerita & Nilai:</div>
                <div style="font-size: 0.85rem; color: var(--text2); background: #F0FDF4; padding: 10px 12px; border-radius: 8px; border: 1px solid #BBF7D0; line-height: 1.6; white-space: pre-line;">
                  ${escapeHtml(ceritaNilai)}
                </div>
              </div>

              <!-- 2. Siapa yang Berperan -->
              <div style="margin-bottom: 10px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--text3); margin-bottom: 3px;">👥 Siapa yang Berperan:</div>
                <div style="font-size: 0.85rem; color: var(--text2); background: #F8FAFC; padding: 10px 12px; border-radius: 8px; border: 1px solid #E2E8F0; line-height: 1.6; white-space: pre-line;">
                  ${escapeHtml(siapaBerperan)}
                </div>
              </div>

              <!-- 3. Bahan, Energi, & Limbah -->
              <div style="margin-bottom: 10px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--text3); margin-bottom: 3px;">⚡ Bahan, Energi, & Limbah:</div>
                <div style="font-size: 0.85rem; color: var(--text2); background: #FFFBEB; padding: 10px 12px; border-radius: 8px; border: 1px solid #FDE68A; line-height: 1.6; white-space: pre-line;">
                  ${escapeHtml(bahanEnergiLimbah)}
                </div>
              </div>

              <!-- 4. Pengalaman Kita -->
              <div>
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--c-accent-d); margin-bottom: 3px;">🌍 Pengalaman Kita:</div>
                <div style="font-size: 0.88rem; font-weight: 600; color: var(--text); background: #F0F9FF; padding: 10px 12px; border-radius: 8px; border: 1px solid #BAE6FD; line-height: 1.6; white-space: pre-line;">
                  ${escapeHtml(pengalamanKita)}
                </div>
              </div>
            </div>
          `;
        });
        container.innerHTML = cards;
      }
    }

    // 4. Ganti tampilan ke Detail View
    const listView = document.getElementById('tanggapanListView');
    const detailView = document.getElementById('tanggapanDetailView');
    if (listView) listView.style.display = 'none';
    if (detailView) {
      detailView.style.display = 'block';
      detailView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    hideOverlay();

  } catch (err) {
    console.error('[viewDetailTanggapan Error]', err);
    showError(err.message || 'Gagal memuat data tanggapan ecomedia siswa dari server.', 'Gagal Memuat Detail');
  }
}

/**
 * Menutup tampilan detail dan kembali ke tabel daftar siswa di menu Tanggapan (Ecomedia)
 */
function closeDetailTanggapan() {
  const listView = document.getElementById('tanggapanListView');
  const detailView = document.getElementById('tanggapanDetailView');
  if (detailView) detailView.style.display = 'none';
  if (listView) {
    listView.style.display = 'block';
    renderTanggapanSiswaTable(currentSiswaList);
  }
}

// Ekspos controller Tanggapan ke global window
window.renderTanggapanSiswaTable = renderTanggapanSiswaTable;
window.handleSearchTanggapanSiswa = handleSearchTanggapanSiswa;
window.loadTanggapanSiswaTable = loadTanggapanSiswaTable;
window.viewDetailTanggapan = viewDetailTanggapan;
window.closeDetailTanggapan = closeDetailTanggapan;

// ==========================================
// PENGELOLAAN MENU JAWABAN SISWA (ANSWER)
// ==========================================

/**
 * Merender daftar siswa pada tabel di Menu Jawaban Siswa (ANSWER)
 * Kolom: No, Nama, Kelas, Sekolah, Opsi (Tombol Lihat)
 */
function renderAnswerSiswaTable(students, searchQuery = '') {
  const tableBody = document.getElementById('answerSiswaTableBody');
  const countBadge = document.getElementById('answerSiswaCount');

  if (!tableBody) return;

  const listToRender = students || currentSiswaList || [];
  if (countBadge) {
    countBadge.textContent = listToRender.length;
  }

  if (listToRender.length === 0) {
    if (searchQuery) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="siswa-empty-state">
            <span class="siswa-empty-icon">🔍</span>
            <strong>Tidak ditemukan siswa yang cocok dengan "${escapeHtml(searchQuery)}"</strong>
            <div style="font-size: 0.82rem; color: var(--text3); margin-top: 4px;">Coba gunakan kata kunci nama lain.</div>
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="siswa-empty-state">
            <span class="siswa-empty-icon">✍️</span>
            <strong>Belum ada siswa yang terdaftar.</strong>
            <div style="font-size: 0.85rem; color: var(--text3); margin-top: 4px;">
              Daftar siswa akan otomatis muncul setelah siswa terdaftar di kelas Anda.
            </div>
          </td>
        </tr>
      `;
    }
    return;
  }

  let htmlRows = '';
  listToRender.forEach((student, index) => {
    const no = index + 1;
    const nama = escapeHtml(student.nama || 'Tanpa Nama');
    const kelas = escapeHtml(student.kelas || '-');
    const sekolah = escapeHtml(student.sekolah || '-');
    const idSiswa = escapeHtml(student.id_siswa || '');

    htmlRows += `
      <tr>
        <td>${no}</td>
        <td><strong>${nama}</strong></td>
        <td><span class="kelas-badge">${kelas}</span></td>
        <td>${sekolah}</td>
        <td style="text-align: center;">
          <button type="button" class="btn-action" style="background: #FAF5FF; border-color: #D8B4FE; color: #6B21A8; font-weight: 800;" onclick="viewDetailAnswer('${idSiswa}')" title="Lihat Jawaban Siswa">
            👁️ Lihat
          </button>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = htmlRows;
}

/**
 * Filter realtime pada input pencarian siswa di Menu ANSWER
 */
function handleSearchAnswerSiswa() {
  const searchInput = document.getElementById('searchAnswerSiswaInput');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  if (!query) {
    renderAnswerSiswaTable(currentSiswaList);
    return;
  }

  const filtered = currentSiswaList.filter(s => {
    const matchNama = (s.nama || '').toLowerCase().includes(query);
    const matchSekolah = (s.sekolah || '').toLowerCase().includes(query);
    return matchNama || matchSekolah;
  });

  renderAnswerSiswaTable(filtered, query);
}

/**
 * Refresh manual tabel siswa di menu Jawaban (ANSWER)
 */
async function loadAnswerSiswaTable(isManualRefresh = false) {
  if (currentSiswaList.length === 0) {
    await loadDataSiswa(isManualRefresh);
  }
  const searchInput = document.getElementById('searchAnswerSiswaInput');
  if (searchInput && isManualRefresh) {
    searchInput.value = '';
  }
  renderAnswerSiswaTable(currentSiswaList);
}

/**
 * Mengambil data jawaban siswa via API (WHERE id_siswa) dari tabel 'answer'
 * dan menampilkan tampilan detail blok Jawaban Siswa (ANSWER)
 * @param {string} idSiswa
 */
async function viewDetailAnswer(idSiswa) {
  if (!idSiswa) return;

  // Temukan data profil siswa dari memori lokal currentSiswaList
  const student = currentSiswaList.find(s => s.id_siswa === idSiswa) || {
    id_siswa: idSiswa,
    nama: 'Siswa',
    kelas: '-',
    sekolah: '-',
    absen: '-'
  };

  showLoading('Memuat Data Siswa...', 'Mengambil data jawaban tahap ANSWER siswa...');

  try {
    // 1. Ambil data dari tabel answer dengan WHERE id_siswa
    const answerList = await EcoApi.getWhere('answer', { id_siswa: idSiswa });
    const validList = Array.isArray(answerList) ? answerList : [];

    // 2. Isi Header Detail Siswa
    const nameEl = document.getElementById('answerDetailStudentName');
    const metaEl = document.getElementById('answerDetailStudentMeta');
    if (nameEl) nameEl.textContent = `👤 ${student.nama}`;
    if (metaEl) {
      const absenText = student.absen ? ` (No. Absen: ${student.absen})` : '';
      metaEl.textContent = `Kelas ${student.kelas} • ${student.sekolah}${absenText}`;
    }

    // 3. Render 1 Blok Card: Jawaban Siswa (ANSWER)
    const countBadge = document.getElementById('answerCountBadge');
    if (countBadge) {
      countBadge.textContent = `${validList.length} Jawaban`;
    }

    const container = document.getElementById('answerList');
    if (container) {
      if (validList.length === 0) {
        container.innerHTML = `
          <div class="siswa-empty-state" style="padding: 32px 10px;">
            <span class="siswa-empty-icon" style="font-size: 2rem;">✍️</span>
            <div style="font-size: 0.95rem; font-weight: 700;">Belum ada jawaban</div>
            <small style="color: var(--text3);">Siswa belum mengirimkan respon jawaban pada tahap ANSWER.</small>
          </div>
        `;
      } else {
        let cards = '';
        validList.forEach((item, idx) => {
          // Normalisasi id_materi: jika hanya berisi angka, tambahkan awalan 'materi-'
          const rawMateri = String(item.id_materi !== undefined && item.id_materi !== null ? item.id_materi : '').trim();
          const normalizedMateriId = rawMateri.startsWith('materi-') ? rawMateri : (rawMateri ? 'materi-' + rawMateri : 'materi-1');
          const judulMateri = getNamaMateri(normalizedMateriId);

          const jawabanSiswa = item.jawaban_siswa ? item.jawaban_siswa : '(Belum ada jawaban)';
          const confident = item.confident ? String(item.confident).trim() : '-';
          const flagDiscuss = Number(item.flag_discuss) === 1;
          const nilaiNlp = (item.nilai_nlp !== null && item.nilai_nlp !== undefined && item.nilai_nlp !== '') 
            ? Number(item.nilai_nlp).toFixed(1) 
            : null;
          const idSoal = item.id_soal ? `Soal ${item.id_soal}` : `Soal #${idx + 1}`;

          cards += `
            <div class="read-item-card answer" style="margin-bottom: 16px;">
              <div class="response-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 8px; flex-wrap: wrap;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span class="badge badge-purple" style="margin: 0; font-size: 0.78rem;">${escapeHtml(idSoal)}</span>
                    <h4 style="margin: 0; font-family: 'Sora', sans-serif; font-size: 1.02rem; color: var(--text);">${escapeHtml(judulMateri)}</h4>
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text3); font-family: monospace; margin-top: 3px;">
                    Kode Materi: ${escapeHtml(normalizedMateriId)}
                  </div>
                </div>
                <span class="absen-badge" style="font-size: 0.75rem; background: #FAF5FF; color: #6B21A8; border-color: #DDD6FE;">#${idx + 1}</span>
              </div>

              <!-- Jawaban Siswa -->
              <div style="margin-bottom: 12px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--text3); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em;">📝 Jawaban Siswa:</div>
                <div class="response-box" style="margin-bottom: 0; background: #FAF5FF; border-color: #E9D5FF; color: #3B0764; font-weight: 600; font-size: 0.92rem; line-height: 1.6; white-space: pre-line;">
                  "${escapeHtml(jawabanSiswa)}"
                </div>
              </div>

              <!-- Baris Meta: Confident, Flag Discuss, & Nilai NLP -->
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border);">
                <!-- Tingkat Keyakinan -->
                <span class="status-yakin" style="display: inline-flex; align-items: center; gap: 4px; background: #F5F3FF; border-color: #DDD6FE; color: #5B21B6; font-size: 0.78rem; padding: 4px 10px; border-radius: 99px;">
                  💡 Keyakinan: <strong>${escapeHtml(confident)}</strong>
                </span>

                <!-- Flag Discuss -->
                <span class="badge" style="margin: 0; font-size: 0.76rem; padding: 5px 10px; border-radius: 99px; font-weight: 800; ${flagDiscuss ? 'background: #FEF3C7; color: #92400E; border: 1px solid #FCD34D;' : 'background: #F1F5F9; color: #475569; border: 1px solid #E2E8F0;'}">
                  ${flagDiscuss ? '🗣️ Perlu Diskusi' : '✓ Mandiri'}
                </span>

                <!-- Nilai NLP -->
                <span class="badge" style="margin: 0; font-size: 0.76rem; padding: 5px 10px; border-radius: 99px; font-weight: 800; background: #E0F2FE; color: #0369A1; border: 1px solid #BAE6FD;">
                  🎯 Skor NLP: <strong>${nilaiNlp !== null ? nilaiNlp : '-'}</strong>
                </span>
              </div>
            </div>
          `;
        });
        container.innerHTML = cards;
      }
    }

    // 4. Ganti tampilan ke Detail View
    const listView = document.getElementById('answerListView');
    const detailView = document.getElementById('answerDetailView');
    if (listView) listView.style.display = 'none';
    if (detailView) {
      detailView.style.display = 'block';
      detailView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    hideOverlay();

  } catch (err) {
    console.error('[viewDetailAnswer Error]', err);
    showError(err.message || 'Gagal memuat data jawaban siswa dari server.', 'Gagal Memuat Detail');
  }
}

/**
 * Menutup tampilan detail dan kembali ke tabel daftar siswa di menu Jawaban (ANSWER)
 */
function closeDetailAnswer() {
  const listView = document.getElementById('answerListView');
  const detailView = document.getElementById('answerDetailView');
  if (detailView) detailView.style.display = 'none';
  if (listView) {
    listView.style.display = 'block';
    renderAnswerSiswaTable(currentSiswaList);
  }
}

// Ekspos controller Answer ke global window
window.renderAnswerSiswaTable = renderAnswerSiswaTable;
window.handleSearchAnswerSiswa = handleSearchAnswerSiswa;
window.loadAnswerSiswaTable = loadAnswerSiswaTable;
window.viewDetailAnswer = viewDetailAnswer;
window.closeDetailAnswer = closeDetailAnswer;

function doAdminLogout() {
  // Sembunyikan Dashboard, Tampilkan Login
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('adminLogin').style.display = 'flex';
  
  // Opsi: Hapus memori jika ingin benar-benar logout
  // localStorage.removeItem(KEY_GURU);
  
  // Tutup sidebar jika posisi di mobile
  const sidebar = document.getElementById('ecoSidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    toggleSidebar();
  }
}

// ==========================================
// LOGIKA SPA: NAVIGASI DASHBOARD
// ==========================================
const pageMeta = {
  'siswa': { title: 'Data Siswa', sub: 'Kelola informasi dan akun siswa yang terdaftar.' },
  'akses': { title: 'Izin Akses', sub: 'Berikan atau cabut izin tahapan RADEC untuk setiap siswa.' },
  'tanggapan': { title: 'Tanggapan Siswa (Ecomedia)', sub: 'Tinjau analisis cerita, peran, energi, dan pengalaman siswa terhadap media lingkungan.' },
  'read': { title: 'Pertanyaan Siswa (READ)', sub: 'Daftar pertanyaan mandiri dan rasa ingin tahu yang dirumuskan siswa saat membaca teks materi.' },
  'answer': { title: 'Jawaban Siswa (Answer)', sub: 'Tinjau jawaban pra-konsepsi dan pemahaman awal siswa sebelum tahap diskusi.' },
  'discuss': { title: 'Diskusi Siswa (Discuss)', sub: 'Pantau catatan kesepakatan kelompok, dinamika diskusi, dan pembagian peran siswa.' },
  'explain': { title: 'Penjelasan Siswa (Explain)', sub: 'Tinjau paparan penjelasan konsep dan presentasi hasil pemikiran siswa di depan kelas.' },
  'create': { title: 'Karya Siswa (Create)', sub: 'Tinjau ide karya kreatif, prototipe, poster, dan aksi nyata iklim yang dihasilkan siswa.' },
  'laporan': { title: 'Laporan Progres', sub: 'Lihat ringkasan progres dan unduh hasil belajar kelas.' }
};

function switchPanel(panelId, btnElement) {
  // 1. Ganti State Tombol Aktif di Sidebar
  document.querySelectorAll('.eco-nav-item').forEach(btn => btn.classList.remove('active'));
  if (btnElement) {
    btnElement.classList.add('active');
  }

  // 2. Sembunyikan Semua Panel, Tampilkan yang Sesuai
  document.querySelectorAll('.admin-panel').forEach(panel => panel.classList.remove('active'));
  const targetPanel = document.getElementById('panel-' + panelId);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }

  // 3. Ubah Teks Header secara Dinamis
  if (pageMeta[panelId]) {
    document.getElementById('pageTitle').textContent = pageMeta[panelId].title;
    document.getElementById('pageSub').textContent = pageMeta[panelId].sub;
  }

  // 4. Pengendalian muat data untuk panel siswa, panel read, & panel tanggapan
  if (panelId === 'siswa' && currentSiswaList.length === 0) {
    loadDataSiswa();
  }
  if (panelId === 'read') {
    closeDetailRead();
    if (currentSiswaList.length === 0) {
      loadDataSiswa().then(() => renderReadSiswaTable(currentSiswaList));
    } else {
      renderReadSiswaTable(currentSiswaList);
    }
  }
  if (panelId === 'tanggapan') {
    closeDetailTanggapan();
    if (currentSiswaList.length === 0) {
      loadDataSiswa().then(() => renderTanggapanSiswaTable(currentSiswaList));
    } else {
      renderTanggapanSiswaTable(currentSiswaList);
    }
  }
  if (panelId === 'answer') {
    closeDetailAnswer();
    if (currentSiswaList.length === 0) {
      loadDataSiswa().then(() => renderAnswerSiswaTable(currentSiswaList));
    } else {
      renderAnswerSiswaTable(currentSiswaList);
    }
  }

  // 5. Otomatis Tutup Sidebar Jika di Layar HP
  if (window.innerWidth <= 860) {
    toggleSidebar();
  }

  // 6. Reset posisi scroll ke paling atas saat berpindah panel
  scrollToTop();
}

// Fungsi Buka-Tutup Sidebar (Mobile View)
function toggleSidebar() {
  const sidebar = document.getElementById('ecoSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (sidebar) sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('show');
}

// ==========================================
// TOMBOL OTOMATIS SCROLL KE ATAS (SCROLL TO TOP)
// ==========================================
/**
 * Ambil posisi scroll vertikal tertinggi dari window maupun kontainer yang aktif
 * @returns {number}
 */
function getScrollTop() {
  const isWindowScroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  const adminMain = document.querySelector('.eco-admin-main');
  const mainScroll = adminMain ? adminMain.scrollTop : 0;
  const loginSection = document.querySelector('.eco-login-section');
  const loginScroll = loginSection ? loginSection.scrollTop : 0;

  return Math.max(isWindowScroll, mainScroll, loginScroll);
}

/**
 * Periksa posisi scroll dan tampilkan tombol jika scroll vertikal melebihi 300px
 */
function updateScrollTopButton() {
  const btn = document.getElementById('btnScrollTop');
  if (!btn) return;

  const scrollTop = getScrollTop();
  if (scrollTop > 300) {
    btn.classList.add('show');
  } else {
    btn.classList.remove('show');
  }
}

/**
 * Gulirkan halaman kembali ke atas secara halus (smooth scroll)
 */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (document.documentElement) document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
  if (document.body) document.body.scrollTo({ top: 0, behavior: 'smooth' });

  const adminMain = document.querySelector('.eco-admin-main');
  if (adminMain && adminMain.scrollTop > 0) {
    adminMain.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const loginSection = document.querySelector('.eco-login-section');
  if (loginSection && loginSection.scrollTop > 0) {
    loginSection.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/**
 * Inisialisasi event listener scroll untuk tombol scroll to top
 */
function initScrollTopButton() {
  // Tangkap scroll di level window (dengan capture phase agar mendeteksi scroll child container)
  window.addEventListener('scroll', updateScrollTopButton, { passive: true, capture: true });
  document.addEventListener('scroll', updateScrollTopButton, { passive: true });
  
  const adminMain = document.querySelector('.eco-admin-main');
  if (adminMain) {
    adminMain.addEventListener('scroll', updateScrollTopButton, { passive: true });
  }

  // Panggil sekali untuk sinkronisasi state awal
  updateScrollTopButton();
}

window.scrollToTop = scrollToTop;

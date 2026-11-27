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

  // Pasang listener pencarian kelompok pada menu Diskusi (DISCUSS)
  const searchDiscussGroupEl = document.getElementById('searchDiscussGroupInput');
  if (searchDiscussGroupEl) {
    searchDiscussGroupEl.addEventListener('input', handleSearchDiscussGroup);
  }

  // Pasang listener pencarian kelompok pada menu Penjelasan (EXPLAIN)
  const searchExplainGroupEl = document.getElementById('searchExplainGroupInput');
  if (searchExplainGroupEl) {
    searchExplainGroupEl.addEventListener('input', handleSearchExplainGroup);
  }

  // Pasang listener pencarian siswa pada menu Karya Siswa (CREATE)
  const searchCreateSiswaEl = document.getElementById('searchCreateSiswaInput');
  if (searchCreateSiswaEl) {
    searchCreateSiswaEl.addEventListener('input', handleSearchCreateSiswa);
  }

  // Pasang listener pencarian siswa pada menu Karya Digital Siswa (Bagian B)
  const searchKaryaDigitalSiswaEl = document.getElementById('searchKaryaDigitalSiswaInput');
  if (searchKaryaDigitalSiswaEl) {
    searchKaryaDigitalSiswaEl.addEventListener('input', handleSearchKaryaDigitalSiswa);
  }

  // Pasang listener pencarian siswa pada menu Laporan Progres
  const searchLaporanSiswaEl = document.getElementById('searchLaporanSiswaInput');
  if (searchLaporanSiswaEl) {
    searchLaporanSiswaEl.addEventListener('input', handleSearchLaporanSiswa);
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
    profileEl.textContent = `👨‍🏫 Halo, ${sessionData.nama}${sessionData.kelas ? ` (${sessionData.kelas})` : ''}`;
  }

  // SPA Transisi: Sembunyikan Login, Tampilkan Dashboard
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('adminDashboard').style.display = 'flex';

  // Perbarui indikator loading untuk pengambilan data siswa
  showLoading('Memuat Data Siswa...', 'Mengambil daftar siswa kelas Anda dari server...');

  try {
    await Promise.allSettled([
      loadDataSiswa(),
      typeof loadHakAksesPanel === 'function' ? loadHakAksesPanel(false) : Promise.resolve()
    ]);
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

    // Perbarui data siswa di tabel & sinkronkan hak akses sesuai kelas & sekolah baru
    await Promise.allSettled([
      loadDataSiswa(),
      typeof loadHakAksesPanel === 'function' ? loadHakAksesPanel(false) : Promise.resolve()
    ]);

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
// MODAL GANTI KELAS GURU (BATAS 1 SEKOLAH)
// ==========================================
async function openChangeClassModal() {
  const modal = document.getElementById('changeClassModal');
  if (!modal) return;

  const sidebar = document.getElementById('ecoSidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    toggleSidebar();
  }

  const savedData = JSON.parse(localStorage.getItem(KEY_GURU) || '{}');
  const sekolah = (savedData.sekolah || '').trim();
  const currentKelas = sanitasiKelas(savedData.kelas || '');

  const schoolLabelEl = document.getElementById('changeClassSchoolLabel');
  const inputEl = document.getElementById('changeClassInput');
  const chipsEl = document.getElementById('changeClassQuickChips');
  const errEl = document.getElementById('changeClassErrorMsg');

  if (schoolLabelEl) schoolLabelEl.textContent = sekolah || '(Belum ada sekolah terdaftar)';
  if (inputEl) inputEl.value = currentKelas;
  if (errEl) errEl.textContent = '';

  if (chipsEl) {
    chipsEl.innerHTML = '<span style="font-size: 0.82rem; color: var(--text3);">Memuat daftar kelas di sekolah ini...</span>';
  }

  modal.style.display = 'flex';
  void modal.offsetHeight;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');

  // Ambil daftar kelas unik yang ada pada sekolah yang sama
  try {
    let schoolStudents = [];
    if (sekolah) {
      try {
        schoolStudents = await EcoApi.getWhere('siswa', { sekolah });
      } catch (e) {
        const allSiswa = await EcoApi.get('siswa');
        schoolStudents = Array.isArray(allSiswa)
          ? allSiswa.filter(s => (s.sekolah || '').trim().toLowerCase() === sekolah.toLowerCase())
          : [];
      }
    }

    const classSet = new Set();
    if (currentKelas) classSet.add(currentKelas);
    (Array.isArray(schoolStudents) ? schoolStudents : []).forEach(s => {
      const k = sanitasiKelas(s.kelas || '');
      if (k) classSet.add(k);
    });
    (Array.isArray(currentSiswaList) ? currentSiswaList : []).forEach(s => {
      if (!sekolah || (s.sekolah || '').trim().toLowerCase() === sekolah.toLowerCase()) {
        const k = sanitasiKelas(s.kelas || '');
        if (k) classSet.add(k);
      }
    });

    const sortedClasses = Array.from(classSet).sort((a, b) => a.localeCompare(b, 'id'));
    if (chipsEl) {
      if (sortedClasses.length === 0) {
        chipsEl.innerHTML = '<span style="font-size: 0.82rem; color: var(--text3);">Belum ada kelas terdaftar di server. Ketik nama kelas pada kolom di bawah.</span>';
      } else {
        chipsEl.innerHTML = sortedClasses.map(cls => {
          const isActive = cls === currentKelas;
          return `<button type="button" class="class-chip-btn ${isActive ? 'active' : ''}" onclick="selectQuickClassChip('${escapeHtml(cls)}')">${escapeHtml(cls)}${isActive ? ' ✓' : ''}</button>`;
        }).join('');
      }
    }
  } catch (err) {
    if (chipsEl) {
      chipsEl.innerHTML = '<span style="font-size: 0.82rem; color: var(--text3);">Masukkan kelas tujuan secara manual di bawah.</span>';
    }
  }
}

function closeChangeClassModal() {
  const modal = document.getElementById('changeClassModal');
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    if (!modal.classList.contains('show')) modal.style.display = 'none';
  }, 300);
}

function selectQuickClassChip(className) {
  const inputEl = document.getElementById('changeClassInput');
  if (inputEl) inputEl.value = sanitasiKelas(className);
  document.querySelectorAll('#changeClassQuickChips .class-chip-btn').forEach(btn => {
    const raw = btn.textContent.replace(' ✓', '').trim();
    if (raw === sanitasiKelas(className)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

async function submitChangeClass() {
  const inputEl = document.getElementById('changeClassInput');
  const errEl = document.getElementById('changeClassErrorMsg');
  const rawClass = inputEl ? inputEl.value.trim() : '';

  if (!rawClass) {
    if (errEl) errEl.textContent = 'Nama kelas baru tidak boleh kosong.';
    if (inputEl) inputEl.focus();
    return;
  }

  const newKelas = sanitasiKelas(rawClass);
  if (inputEl) inputEl.value = newKelas;

  const savedData = JSON.parse(localStorage.getItem(KEY_GURU) || '{}');
  const currentIdGuru = localStorage.getItem(KEY_GURU_ID) || savedData.id_guru;
  const sekolah = (savedData.sekolah || '').trim();
  const nama = (savedData.nama || 'Guru').trim();

  if (!currentIdGuru) {
    if (errEl) errEl.textContent = 'ID Guru tidak ditemukan. Silakan login ulang.';
    return;
  }

  closeChangeClassModal();
  showLoading(`Beralih ke Kelas ${newKelas}...`, `Memuat data siswa dan kelompok untuk ${sekolah || 'sekolah Anda'}...`);

  try {
    await EcoApi.patch('guru', 'id_guru', currentIdGuru, {
      nama_guru: nama,
      kelas_guru: newKelas,
      sekolah_guru: sekolah
    });

    const sessionData = {
      id_guru: currentIdGuru,
      nama,
      kelas: newKelas,
      sekolah
    };
    localStorage.setItem(KEY_GURU, JSON.stringify(sessionData));

    const profileEl = document.getElementById('profileBadgeName');
    if (profileEl) {
      profileEl.textContent = `👨‍🏫 Halo, ${nama} (${newKelas})`;
    }
    const guruClassLogin = document.getElementById('guruClass');
    if (guruClassLogin) guruClassLogin.value = newKelas;

    await Promise.allSettled([
      loadDataSiswa(),
      loadDiscussKelompokTable(),
      loadExplainKelompokTable(),
      typeof loadHakAksesPanel === 'function' ? loadHakAksesPanel(false) : Promise.resolve()
    ]);

    if (typeof resetMateriProgressCache === 'function') {
      resetMateriProgressCache();
    }

    hideOverlay();
  } catch (err) {
    console.error('[submitChangeClass Error]', err);
    showError(err.message || 'Gagal mengganti kelas guru di server.', 'Gagal Ganti Kelas');
  }
}

window.openChangeClassModal = openChangeClassModal;
window.closeChangeClassModal = closeChangeClassModal;
window.selectQuickClassChip = selectQuickClassChip;
window.submitChangeClass = submitChangeClass;

// ==========================================
// NAVIGASI MENUJU HALAMAN SISWA (TAB BARU + QUERY PARAMS)
// ==========================================
function buildStudentPageUrl() {
  const savedData = JSON.parse(localStorage.getItem(KEY_GURU) || '{}');
  const nama = String(savedData.nama || '').trim();
  const kelas = sanitasiKelas(savedData.kelas || '');
  const sekolah = String(savedData.sekolah || '').trim();

  const params = new URLSearchParams({
    user: nama,
    kelas,
    sekolah,
    absen: '9999'
  });

  return `../index.html?${params.toString()}`;
}

function openConfirmStudentPageModal() {
  const modal = document.getElementById('confirmStudentPageModal');
  if (!modal) return;

  const sidebar = document.getElementById('ecoSidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    toggleSidebar();
  }

  modal.style.display = 'flex';
  void modal.offsetHeight;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

function closeConfirmStudentPageModal() {
  const modal = document.getElementById('confirmStudentPageModal');
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    if (!modal.classList.contains('show')) {
      modal.style.display = 'none';
    }
  }, 300);
}

function handleConfirmStudentBackdropClick(e) {
  if (e && e.target && e.target.id === 'confirmStudentPageModal') {
    closeConfirmStudentPageModal();
  }
}

function confirmOpenStudentPage() {
  const targetUrl = buildStudentPageUrl();
  closeConfirmStudentPageModal();
  window.open(targetUrl, '_blank', 'noopener,noreferrer');
}

window.buildStudentPageUrl = buildStudentPageUrl;
window.openConfirmStudentPageModal = openConfirmStudentPageModal;
window.closeConfirmStudentPageModal = closeConfirmStudentPageModal;
window.handleConfirmStudentBackdropClick = handleConfirmStudentBackdropClick;
window.confirmOpenStudentPage = confirmOpenStudentPage;

// ==========================================
// PENGATURAN HAK AKSES KELAS (PANEL 2 - TABEL 'hak_akses')
// ==========================================
const HAK_AKSES_TAHAP_KEYS = ['read', 'answer', 'discuss', 'explain', 'create'];
const HAK_AKSES_MATERI_NUMS = [1, 2, 3, 4, 5];

let currentHakAksesRecord = null;
let currentHakAksesId = null;

function getDefaultLockedTahapMap() {
  return { read: false, answer: false, discuss: false, explain: false, create: false };
}

function parseTahapDiizinkan(rawVal) {
  const result = getDefaultLockedTahapMap();
  if (rawVal === undefined || rawVal === null || rawVal === '') return result;

  let parsed = rawVal;
  if (typeof rawVal === 'string') {
    const trimmed = rawVal.trim();
    if (!trimmed) return result;
    try {
      parsed = JSON.parse(trimmed);
    } catch (e) {
      return result;
    }
  }

  if (Array.isArray(parsed)) {
    parsed.forEach(k => {
      const cleanKey = String(k || '').trim().toLowerCase();
      if (HAK_AKSES_TAHAP_KEYS.includes(cleanKey)) {
        result[cleanKey] = true;
      }
    });
    return result;
  }

  if (parsed && typeof parsed === 'object') {
    HAK_AKSES_TAHAP_KEYS.forEach(k => {
      const val = parsed[k];
      result[k] = val === true || val === 1 || val === '1' || String(val).toLowerCase() === 'true';
    });
  }
  return result;
}

function parseMateriDiizinkan(rawVal) {
  const result = [];
  if (rawVal === undefined || rawVal === null || rawVal === '') return result;

  let parsed = rawVal;
  if (typeof rawVal === 'string') {
    const trimmed = rawVal.trim();
    if (!trimmed) return result;
    try {
      parsed = JSON.parse(trimmed);
    } catch (e) {
      return result;
    }
  }

  if (Array.isArray(parsed)) {
    const seen = new Set();
    parsed.forEach(item => {
      const num = parseInt(String(item || '').replace(/\D+/g, ''), 10);
      if (num >= 1 && num <= 5 && !seen.has(num)) {
        seen.add(num);
        result.push(num);
      }
    });
  }
  return result.sort((a, b) => a - b);
}

function getActiveGuruAccessScope() {
  const savedData = JSON.parse(localStorage.getItem(KEY_GURU) || '{}');
  return {
    kelas: sanitasiKelas(savedData.kelas || ''),
    sekolah: String(savedData.sekolah || '').trim()
  };
}

function populateHakAksesMateriTitles() {
  HAK_AKSES_MATERI_NUMS.forEach(num => {
    const titleEl = document.getElementById(`aksesMateriTitle_${num}`);
    if (titleEl) {
      const judul = typeof getNamaMateri === 'function' ? getNamaMateri(`materi-${num}`) : `Materi ${num}`;
      titleEl.textContent = judul;
    }
  });
}

function readHakAksesFormState() {
  const tahap = {};
  HAK_AKSES_TAHAP_KEYS.forEach(k => {
    const el = document.getElementById(`aksesTahap_${k}`);
    tahap[k] = Boolean(el && el.checked);
  });

  const materi = [];
  HAK_AKSES_MATERI_NUMS.forEach(num => {
    const el = document.getElementById(`aksesMateri_${num}`);
    if (el && el.checked) {
      materi.push(num);
    }
  });

  const ketEl = document.getElementById('aksesKeteranganInput');
  const keterangan = ketEl ? ketEl.value.trim() : '';
  return { tahap, materi, keterangan };
}

function applyHakAksesFormState(tahapMap, materiArr, keteranganText = '') {
  const safeTahap = tahapMap || getDefaultLockedTahapMap();
  const safeMateriSet = new Set(Array.isArray(materiArr) ? materiArr.map(n => Number(n)) : []);

  HAK_AKSES_TAHAP_KEYS.forEach(k => {
    const el = document.getElementById(`aksesTahap_${k}`);
    if (el) el.checked = Boolean(safeTahap[k]);
  });

  HAK_AKSES_MATERI_NUMS.forEach(num => {
    const el = document.getElementById(`aksesMateri_${num}`);
    if (el) el.checked = safeMateriSet.has(num);
  });

  const ketEl = document.getElementById('aksesKeteranganInput');
  if (ketEl) ketEl.value = keteranganText ? String(keteranganText) : '';

  updateHakAksesSummaryBadges();
}

function updateHakAksesSummaryBadges() {
  const { tahap, materi } = readHakAksesFormState();
  const openTahapCount = HAK_AKSES_TAHAP_KEYS.filter(k => tahap[k]).length;
  const openMateriCount = materi.length;

  const tBadge = document.getElementById('aksesTahapSummaryBadge');
  const mBadge = document.getElementById('aksesMateriSummaryBadge');
  if (tBadge) tBadge.textContent = `${openTahapCount}/5 Tahap Terbuka`;
  if (mBadge) mBadge.textContent = `${openMateriCount}/5 Materi Terbuka`;
}

function setHakAksesStatusDisplay(pillText, pillClass, syncText) {
  const pill = document.getElementById('aksesRecordBadge');
  const textEl = document.getElementById('aksesSyncStatusText');
  if (pill) {
    pill.textContent = pillText;
    pill.className = `akses-status-pill ${pillClass || ''}`.trim();
  }
  if (textEl && syncText !== undefined) {
    textEl.textContent = syncText;
  }
}

function onHakAksesToggleChange() {
  updateHakAksesSummaryBadges();
  setHakAksesStatusDisplay(
    currentHakAksesId ? `ID Akses: #${currentHakAksesId} • Belum Disimpan` : 'Perubahan Belum Disimpan',
    'is-dirty',
    '⚠️ Ada perubahan hak akses yang belum disimpan ke server. Tekan "Simpan Hak Akses" untuk menerapkan.'
  );
}

function setAllHakAkses(allowAll) {
  const flag = Boolean(allowAll);
  const tahap = {};
  HAK_AKSES_TAHAP_KEYS.forEach(k => { tahap[k] = flag; });
  const materi = flag ? [...HAK_AKSES_MATERI_NUMS] : [];
  const { keterangan } = readHakAksesFormState();
  applyHakAksesFormState(tahap, materi, keterangan);
  onHakAksesToggleChange();
}

function setSectionHakAkses(sectionType, allowSection) {
  const flag = Boolean(allowSection);
  if (sectionType === 'tahap') {
    HAK_AKSES_TAHAP_KEYS.forEach(k => {
      const el = document.getElementById(`aksesTahap_${k}`);
      if (el) el.checked = flag;
    });
  } else if (sectionType === 'materi') {
    HAK_AKSES_MATERI_NUMS.forEach(num => {
      const el = document.getElementById(`aksesMateri_${num}`);
      if (el) el.checked = flag;
    });
  }
  onHakAksesToggleChange();
}

function filterMatchingHakAksesRows(rows, targetKelas, targetSekolah) {
  if (!Array.isArray(rows)) return [];
  const cleanK = sanitasiKelas(targetKelas).toLowerCase();
  const cleanS = String(targetSekolah || '').trim().toLowerCase();
  return rows.filter(r => {
    if (!r || typeof r !== 'object') return false;
    const rowK = sanitasiKelas(r.kelas || '').toLowerCase();
    const rowS = String(r.sekolah || '').trim().toLowerCase();
    return rowK === cleanK && rowS === cleanS;
  });
}

function extractHakAksesId(obj) {
  if (!obj || typeof obj !== 'object') return null;
  const raw = obj.id_akses !== undefined && obj.id_akses !== null && String(obj.id_akses).trim() !== ''
    ? obj.id_akses
    : (obj.id !== undefined && obj.id !== null && String(obj.id).trim() !== ''
      ? obj.id
      : (obj.data ? extractHakAksesId(obj.data) : null));
  return raw !== undefined && raw !== null && String(raw).trim() !== '' ? raw : null;
}

/**
 * Memuat pengaturan hak akses kelas dari server ('hak_akses').
 * Mekanisme auto-provision upsert: jika belum ada record untuk (kelas, sekolah),
 * sistem langsung melakukan POST record baru dengan semua akses diblokir (false / []).
 * @param {boolean} [showLoader=true] - Tampilkan loading screen selama komunikasi server
 */
async function loadHakAksesPanel(showLoader = true) {
  populateHakAksesMateriTitles();
  const { kelas, sekolah } = getActiveGuruAccessScope();

  const schoolLabelEl = document.getElementById('aksesSekolahLabel');
  const classLabelEl = document.getElementById('aksesKelasLabel');
  const btnSave = document.getElementById('btnSaveHakAkses');

  if (schoolLabelEl) schoolLabelEl.textContent = sekolah || '(Belum diisi)';
  if (classLabelEl) classLabelEl.textContent = kelas || '(Belum diisi)';

  if (!kelas || !sekolah) {
    currentHakAksesRecord = null;
    currentHakAksesId = null;
    applyHakAksesFormState(getDefaultLockedTahapMap(), [], '');
    if (btnSave) btnSave.disabled = true;
    setHakAksesStatusDisplay(
      'Identitas Kelas/Sekolah Belum Lengkap',
      'is-error',
      '⚠️ Lengkapi Kelas dan Sekolah pada menu Ubah Profil terlebih dahulu untuk mengatur hak akses.'
    );
    return null;
  }

  if (btnSave) btnSave.disabled = false;

  if (showLoader) {
    showLoading('Memuat Hak Akses Kelas...', `Mengambil data hak akses Kelas ${kelas} (${sekolah}) dari server...`);
  }

  try {
    const rawList = await EcoApi.getWhere('hak_akses', { kelas, sekolah });
    const matchedRows = filterMatchingHakAksesRows(
      Array.isArray(rawList) ? rawList : (rawList && Array.isArray(rawList.data) ? rawList.data : []),
      kelas,
      sekolah
    );

    if (matchedRows.length === 0) {
      // Tidak ditemukan record -> POST otomatis record baru dengan hak akses diblokir semua
      if (showLoader) {
        showLoading('Menyiapkan Hak Akses Awal...', `Belum ada pengaturan untuk Kelas ${kelas}. Menyimpan konfigurasi default (terkunci semua) ke server...`);
      }

      const defaultLockedPayload = {
        id_akses: '',
        kelas,
        sekolah,
        tahap_diizinkan: JSON.stringify(getDefaultLockedTahapMap()),
        materi_diizinkan: JSON.stringify([]),
        keterangan: ''
      };

      const postRes = await EcoApi.post('hak_akses', defaultLockedPayload);
      let createdId = extractHakAksesId(postRes);

      if (!createdId) {
        const recheckList = await EcoApi.getWhere('hak_akses', { kelas, sekolah });
        const recheckMatched = filterMatchingHakAksesRows(
          Array.isArray(recheckList) ? recheckList : (recheckList && Array.isArray(recheckList.data) ? recheckList.data : []),
          kelas,
          sekolah
        );
        if (recheckMatched.length > 0) {
          const newest = recheckMatched[recheckMatched.length - 1];
          createdId = extractHakAksesId(newest);
          currentHakAksesRecord = newest;
        }
      } else {
        currentHakAksesRecord = { ...defaultLockedPayload, id_akses: createdId };
      }

      currentHakAksesId = createdId;
      applyHakAksesFormState(getDefaultLockedTahapMap(), [], '');
      setHakAksesStatusDisplay(
        createdId ? `ID Akses: #${createdId} (Default Terkunci)` : 'Record Default Dibuat',
        'is-new',
        `✓ Record baru berhasil dibuat di server (semua tahap & materi terkunci). Ubah toggle lalu tekan "Simpan Hak Akses".`
      );
    } else {
      // Aplikasi siswa mengambil record terakhir jika > 1 baris
      const activeRow = matchedRows[matchedRows.length - 1];
      currentHakAksesRecord = activeRow;
      currentHakAksesId = extractHakAksesId(activeRow);

      const tahapMap = parseTahapDiizinkan(activeRow.tahap_diizinkan);
      const materiArr = parseMateriDiizinkan(activeRow.materi_diizinkan);
      const ketText = activeRow.keterangan ? String(activeRow.keterangan) : '';

      applyHakAksesFormState(tahapMap, materiArr, ketText);
      setHakAksesStatusDisplay(
        currentHakAksesId ? `ID Akses: #${currentHakAksesId} • Tersinkron` : 'Tersinkron dengan Server',
        'is-synced',
        `✓ Data hak akses Kelas ${kelas} (${sekolah}) berhasil dimuat dari server.`
      );
    }

    if (showLoader) hideOverlay();
    return currentHakAksesRecord;

  } catch (err) {
    console.error('[loadHakAksesPanel Error]', err);
    setHakAksesStatusDisplay(
      'Gagal Memuat Server',
      'is-error',
      `⚠️ Gagal memuat hak akses dari server: ${err.message || 'Kesalahan jaringan'}`
    );
    if (showLoader) {
      showError(err.message || 'Gagal memuat atau membuat data hak akses kelas di server.', 'Gagal Memuat Hak Akses');
    }
    return null;
  }
}

/**
 * Menyimpan perubahan hak akses kelas menggunakan PATCH (berdasarkan id_akses).
 * Dilengkapi failsafe getWhere/POST apabila id_akses belum tersedia.
 */
async function saveHakAkses() {
  const { kelas, sekolah } = getActiveGuruAccessScope();
  if (!kelas || !sekolah) {
    showError('Identitas Kelas dan Sekolah guru wajib diisi sebelum menyimpan hak akses.', 'Data Tidak Lengkap');
    return;
  }

  const { tahap, materi, keterangan } = readHakAksesFormState();
  const payload = {
    kelas,
    sekolah,
    tahap_diizinkan: JSON.stringify(tahap),
    materi_diizinkan: JSON.stringify(materi),
    keterangan
  };

  showLoading('Menyimpan Hak Akses...', `Mengirim pembaruan izin belajar Kelas ${kelas} (${sekolah}) ke server...`);

  try {
    let targetId = currentHakAksesId;

    if (!targetId) {
      const checkList = await EcoApi.getWhere('hak_akses', { kelas, sekolah });
      const matched = filterMatchingHakAksesRows(
        Array.isArray(checkList) ? checkList : (checkList && Array.isArray(checkList.data) ? checkList.data : []),
        kelas,
        sekolah
      );
      if (matched.length > 0) {
        const lastRow = matched[matched.length - 1];
        targetId = extractHakAksesId(lastRow);
      }
    }

    if (targetId) {
      await EcoApi.patch('hak_akses', 'id_akses', targetId, payload);
      currentHakAksesId = targetId;
      currentHakAksesRecord = { ...payload, id_akses: targetId };
    } else {
      const postRes = await EcoApi.post('hak_akses', { id_akses: '', ...payload });
      const newId = extractHakAksesId(postRes);
      currentHakAksesId = newId;
      currentHakAksesRecord = { ...payload, id_akses: newId || '' };
    }

    updateHakAksesSummaryBadges();
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setHakAksesStatusDisplay(
      currentHakAksesId ? `ID Akses: #${currentHakAksesId} • Tersimpan` : 'Tersimpan di Server',
      'is-synced',
      `✓ Hak akses Kelas ${kelas} berhasil diperbarui di server (pukul ${timeNow}). Siswa otomatis menerima perubahan saat membuka Peta RADEC.`
    );

    hideOverlay();
  } catch (err) {
    console.error('[saveHakAkses Error]', err);
    setHakAksesStatusDisplay(
      'Gagal Menyimpan',
      'is-error',
      `⚠️ Gagal menyimpan perubahan hak akses: ${err.message || 'Kesalahan server'}`
    );
    showError(err.message || 'Gagal menyimpan perubahan hak akses kelas ke server.', 'Gagal Menyimpan Hak Akses');
  }
}

window.loadHakAksesPanel = loadHakAksesPanel;
window.saveHakAkses = saveHakAkses;
window.setAllHakAkses = setAllHakAkses;
window.setSectionHakAkses = setSectionHakAkses;
window.onHakAksesToggleChange = onHakAksesToggleChange;

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

    // Sinkronkan juga daftar siswa ke tabel Menu READ, Menu Tanggapan (Ecomedia), Menu Jawaban (ANSWER), Menu Karya (CREATE), Karya Digital, dan Laporan Progres
    renderReadSiswaTable(currentSiswaList);
    renderTanggapanSiswaTable(currentSiswaList);
    renderAnswerSiswaTable(currentSiswaList);
    renderCreateSiswaTable(currentSiswaList);
    if (typeof renderKaryaDigitalSiswaTable === 'function') {
      renderKaryaDigitalSiswaTable(currentSiswaList);
    }
    renderLaporanSiswaTable(currentSiswaList);

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
const materiProgressCache = {
  signature: '',
  stages: {},
  inflight: {}
};

function getCurrentClassProgressSignature() {
  const saved = JSON.parse(localStorage.getItem(KEY_GURU) || '{}');
  return `${sanitasiKelas(saved.kelas || '')}||${String(saved.sekolah || '').trim().toLowerCase()}`;
}

function resetMateriProgressCache(stageKey = null) {
  const sig = getCurrentClassProgressSignature();
  if (!stageKey || materiProgressCache.signature !== sig) {
    materiProgressCache.signature = sig;
    materiProgressCache.stages = {};
    materiProgressCache.inflight = {};
    return;
  }
  delete materiProgressCache.stages[stageKey];
  delete materiProgressCache.inflight[stageKey];
}

function normalizeMateriNum(raw) {
  return String(raw !== undefined && raw !== null ? raw : '').replace(/\D+/g, '') || '1';
}

function normalizeGroupKey(row) {
  if (!row) return '';
  const idK = row.id_kelompok_discuss || row.id_kelompok_explain || row.id_kelompok;
  const nama = String(row.nama_kelompok || '').trim().toLowerCase();
  return nama ? `name:${nama}` : (idK ? `id:${idK}` : '');
}

function parseGroupMembersCount(group) {
  const raw = String((group && (group.nama_anggota || group.id_siswa)) || '')
    .replace(/\s*\(Kamu\)\s*/gi, '')
    .trim();
  if (!raw || raw === '-') return 0;
  return raw.split(',').map(x => x.trim()).filter(Boolean).length;
}

async function ensureStageStatsLoaded(stageKey, forceRefresh = false) {
  const sig = getCurrentClassProgressSignature();
  if (materiProgressCache.signature !== sig) {
    resetMateriProgressCache();
  }
  if (forceRefresh) {
    delete materiProgressCache.stages[stageKey];
    delete materiProgressCache.inflight[stageKey];
  }
  if (materiProgressCache.stages[stageKey]) {
    return materiProgressCache.stages[stageKey];
  }
  if (materiProgressCache.inflight[stageKey]) {
    return materiProgressCache.inflight[stageKey];
  }

  const task = (async () => {
    if (currentSiswaList.length === 0) {
      await loadDataSiswa(false);
    }
    const classIds = new Set(currentSiswaList.map(s => String(s.id_siswa || '').trim()).filter(Boolean));
    const totalStudents = currentSiswaList.length;

    if (stageKey === 'read') {
      const [pRes, kRes, rRes] = await Promise.allSettled([
        EcoApi.get('pertanyaan'),
        EcoApi.get('keterampilan_read'),
        EcoApi.get('tahap_read')
      ]);
      const pList = pRes.status === 'fulfilled' && Array.isArray(pRes.value) ? pRes.value : [];
      const kList = kRes.status === 'fulfilled' && Array.isArray(kRes.value) ? kRes.value : [];
      const rList = rRes.status === 'fulfilled' && Array.isArray(rRes.value) ? rRes.value : [];
      const byMateri = {};
      ['1', '2', '3', '4', '5'].forEach(m => {
        byMateri[m] = { qCounts: new Map(), ideMap: new Map(), durasiMap: new Map(), studentIds: new Set() };
      });
      pList.forEach(item => {
        const sid = String(item.id_siswa || '').trim();
        if (!classIds.has(sid)) return;
        const m = normalizeMateriNum(item.id_materi);
        if (!byMateri[m]) return;
        if (String(item.pertanyaan || '').trim()) {
          byMateri[m].qCounts.set(sid, (byMateri[m].qCounts.get(sid) || 0) + 1);
          byMateri[m].studentIds.add(sid);
        }
      });
      kList.forEach(item => {
        const sid = String(item.id_siswa || '').trim();
        if (!classIds.has(sid)) return;
        const m = normalizeMateriNum(item.id_materi);
        if (!byMateri[m]) return;
        if (String(item.pernyataan || '').trim()) {
          byMateri[m].ideMap.set(sid, 1);
          byMateri[m].studentIds.add(sid);
        }
      });
      rList.forEach(item => {
        const sid = String(item.id_siswa || '').trim();
        if (!classIds.has(sid)) return;
        const m = normalizeMateriNum(item.id_materi);
        if (!byMateri[m]) return;
        const durasiText = String(item.durasi !== undefined && item.durasi !== null ? item.durasi : '').trim();
        const idReadNum = Number(item.id_read !== undefined && item.id_read !== null ? item.id_read : (item.id || 0)) || 0;
        const prev = byMateri[m].durasiMap.get(sid);
        if (!prev || idReadNum > prev.idRead || (idReadNum === prev.idRead && !prev.durasi && durasiText)) {
          byMateri[m].durasiMap.set(sid, { idRead: idReadNum, durasi: durasiText });
        }
        if (durasiText) {
          byMateri[m].studentIds.add(sid);
        }
      });
      const res = { stageKey, totalStudents, byMateri };
      materiProgressCache.stages[stageKey] = res;
      return res;
    }

    if (stageKey === 'answer') {
      let aList = [];
      try { aList = await EcoApi.get('answer'); } catch (e) { aList = []; }
      if (!Array.isArray(aList)) aList = [];
      const byMateri = {};
      ['1', '2', '3', '4', '5'].forEach(m => {
        byMateri[m] = { counts: new Map(), studentIds: new Set() };
      });
      aList.forEach(item => {
        const sid = String(item.id_siswa || '').trim();
        if (!classIds.has(sid)) return;
        const m = normalizeMateriNum(item.id_materi);
        if (!byMateri[m]) return;
        if (String(item.jawaban_siswa || '').trim()) {
          byMateri[m].counts.set(sid, (byMateri[m].counts.get(sid) || 0) + 1);
          byMateri[m].studentIds.add(sid);
        }
      });
      const res = { stageKey, totalStudents, byMateri };
      materiProgressCache.stages[stageKey] = res;
      return res;
    }

    if (stageKey === 'discuss') {
      if (currentDiscussKelompokList.length === 0) {
        await loadDiscussKelompokTable(false);
      }
      let dList = [];
      try { dList = await EcoApi.get('discuss'); } catch (e) { dList = []; }
      if (!Array.isArray(dList)) dList = [];
      const byMateri = {};
      ['1', '2', '3', '4', '5'].forEach(m => {
        byMateri[m] = { groupCount: 0, memberTotal: 0, itemCountsByGroup: new Map(), questionSetsByGroup: new Map(), answeredGroupKeys: new Set() };
      });
      currentDiscussKelompokList.forEach(g => {
        const m = normalizeMateriNum(g.id_materi);
        if (!byMateri[m]) return;
        byMateri[m].groupCount++;
        byMateri[m].memberTotal += parseGroupMembersCount(g);
      });
      dList.forEach(item => {
        if (!hasValidStudentId(item)) return;
        const m = normalizeMateriNum(item.id_materi);
        if (!byMateri[m]) return;
        const key = normalizeGroupKey(item);
        if (!key) return;
        const qKey = item.id_soal ? `s:${item.id_soal}` : `q:${String(item.pertanyaan || '').trim().toLowerCase()}`;
        if (!byMateri[m].questionSetsByGroup.has(key)) byMateri[m].questionSetsByGroup.set(key, new Set());
        byMateri[m].questionSetsByGroup.get(key).add(qKey);
        byMateri[m].itemCountsByGroup.set(key, byMateri[m].questionSetsByGroup.get(key).size);
        if (String(item.jawaban || '').trim()) {
          byMateri[m].answeredGroupKeys.add(key);
        }
      });
      const res = { stageKey, totalStudents, byMateri };
      materiProgressCache.stages[stageKey] = res;
      return res;
    }

    if (stageKey === 'explain') {
      if (currentExplainKelompokList.length === 0) {
        await loadExplainKelompokTable(false);
      }
      let eList = [];
      try { eList = await EcoApi.get('explain'); } catch (e) { eList = []; }
      if (!Array.isArray(eList)) eList = [];
      const byMateri = {};
      ['1', '2', '3', '4', '5'].forEach(m => {
        byMateri[m] = { groupCount: 0, memberTotal: 0, itemCountsByGroup: new Map(), questionSetsByGroup: new Map(), answeredGroupKeys: new Set() };
      });
      currentExplainKelompokList.forEach(g => {
        const m = normalizeMateriNum(g.id_materi);
        if (!byMateri[m]) return;
        byMateri[m].groupCount++;
        byMateri[m].memberTotal += parseGroupMembersCount(g);
      });
      eList.forEach(item => {
        if (!hasValidStudentId(item)) return;
        const m = normalizeMateriNum(item.id_materi);
        if (!byMateri[m]) return;
        const key = normalizeGroupKey(item);
        if (!key) return;
        const qKey = item.id_soal ? `s:${item.id_soal}` : `q:${String(item.pertanyaan || '').trim().toLowerCase()}`;
        if (!byMateri[m].questionSetsByGroup.has(key)) byMateri[m].questionSetsByGroup.set(key, new Set());
        byMateri[m].questionSetsByGroup.get(key).add(qKey);
        byMateri[m].itemCountsByGroup.set(key, byMateri[m].questionSetsByGroup.get(key).size);
        if (String(item.jawaban || '').trim()) {
          byMateri[m].answeredGroupKeys.add(key);
        }
      });
      const res = { stageKey, totalStudents, byMateri };
      materiProgressCache.stages[stageKey] = res;
      return res;
    }

    if (stageKey === 'create' || stageKey === 'karya-digital') {
      let ideList = [];
      try { ideList = await EcoApi.get('ide_create'); } catch (e) { ideList = []; }
      if (!Array.isArray(ideList)) ideList = [];

      const byMateri = {};
      ['1', '2', '3', '4', '5'].forEach(m => {
        byMateri[m] = { counts: new Map(), studentIds: new Set() };
      });
      const byJenis = {};
      ['poster', 'pledge', 'news', 'action'].forEach(j => {
        byJenis[j] = { counts: new Map(), studentIds: new Set() };
      });

      ideList.forEach(row => {
        const sid = String(row.id_siswa || '').trim();
        if (!classIds.has(sid)) return;
        const parsed = parseIdeCreateRow(row);
        if (!parsed.isPartB) {
          const m = normalizeMateriNum(row.id_materi);
          if (byMateri[m]) {
            byMateri[m].counts.set(sid, (byMateri[m].counts.get(sid) || 0) + 1);
            byMateri[m].studentIds.add(sid);
          }
        } else {
          const j = parsed.jenis;
          if (byJenis[j]) {
            byJenis[j].counts.set(sid, (byJenis[j].counts.get(sid) || 0) + 1);
            byJenis[j].studentIds.add(sid);
          }
        }
      });

      materiProgressCache.stages['create'] = { stageKey: 'create', totalStudents, byMateri };
      materiProgressCache.stages['karya-digital'] = { stageKey: 'karya-digital', totalStudents, byJenis };
      return materiProgressCache.stages[stageKey];
    }

    if (stageKey === 'laporan') {
      let evList = [];
      try { evList = await EcoApi.get('evaluasi_refleksi_siswa'); } catch (e) { evList = []; }
      if (!Array.isArray(evList)) evList = [];

      const byMateri = {};
      ['1', '2', '3', '4', '5'].forEach(m => {
        byMateri[m] = { partsByStudent: new Map(), studentIds: new Set(), flagsMap: new Map() };
      });

      evList.forEach(item => {
        const sid = String(item.id_siswa || '').trim();
        if (!classIds.has(sid)) return;
        const m = normalizeMateriNum(item.id_materi);
        if (!byMateri[m]) return;

        const prev = byMateri[m].flagsMap.get(sid) || { t: false, e: false, c: false };
        if (item.tanggapan_siswa && String(item.tanggapan_siswa).trim()) prev.t = true;
        const ecoObj = parseEvaluasiJsonField(item.ekoliterasi_siswa);
        if (ecoObj && (ecoObj.skor || ecoObj.jawaban)) prev.e = true;
        const certObj = parseEvaluasiJsonField(item.sertifikat_siswa);
        if (certObj && (certObj.nama || certObj.judul)) prev.c = true;

        byMateri[m].flagsMap.set(sid, prev);
        const totalParts = (prev.t ? 1 : 0) + (prev.e ? 1 : 0) + (prev.c ? 1 : 0);
        byMateri[m].partsByStudent.set(sid, totalParts);
        if (totalParts > 0) {
          byMateri[m].studentIds.add(sid);
        }
      });

      const res = { stageKey, totalStudents, byMateri };
      materiProgressCache.stages[stageKey] = res;
      return res;
    }

    if (stageKey === 'tanggapan') {
      let ecoList = [];
      try { ecoList = await EcoApi.get('ecomedia'); } catch (e) { ecoList = []; }
      if (!Array.isArray(ecoList)) ecoList = [];

      const bySource = {
        video: { counts: new Map(), studentIds: new Set() },
        infografis: { counts: new Map(), studentIds: new Set() },
        buku: { counts: new Map(), studentIds: new Set() }
      };

      ecoList.forEach(item => {
        const sid = String(item.id_siswa || '').trim();
        if (!classIds.has(sid)) return;
        const srcKey = normalizeEcomediaSourceKey(item.sumber);
        if (!srcKey || !bySource[srcKey]) return;

        const hasContent = Boolean(
          String(item.cerita_nilai || '').trim() ||
          String(item.siapa_berperan || '').trim() ||
          String(item.bahan_energi_limbah || '').trim() ||
          String(item.pengalaman_kita || '').trim()
        );
        if (!hasContent) return;

        bySource[srcKey].counts.set(sid, (bySource[srcKey].counts.get(sid) || 0) + 1);
        bySource[srcKey].studentIds.add(sid);
      });

      const res = { stageKey, totalStudents, bySource };
      materiProgressCache.stages[stageKey] = res;
      return res;
    }

    return null;
  })().finally(() => {
    delete materiProgressCache.inflight[stageKey];
  });

  materiProgressCache.inflight[stageKey] = task;
  return task;
}

/**
 * Helper bersama merender daftar list siswa (pengganti tabel) lengkap dengan jumlah jawaban & tombol Detail
 */
function renderStudentProgressList({
  containerId,
  countId,
  students,
  searchQuery = '',
  emptyIcon = '🎒',
  emptyText = 'Belum ada siswa yang terdaftar untuk kelas ini.',
  badgeTheme = 'green',
  getSummary,
  detailHandlerName
}) {
  const container = document.getElementById(containerId);
  const countBadge = document.getElementById(countId);
  if (!container) return;

  const list = Array.isArray(students) ? [...students] : [...(currentSiswaList || [])];
  if (countBadge) countBadge.textContent = list.length;

  if (list.length === 0) {
    container.innerHTML = searchQuery
      ? `<div class="student-progress-empty"><div style="font-size:1.6rem;margin-bottom:6px;">🔍</div><strong>Tidak ditemukan siswa yang cocok dengan "${escapeHtml(searchQuery)}"</strong><div style="font-size:0.82rem;margin-top:4px;">Coba gunakan kata kunci nama lain.</div></div>`
      : `<div class="student-progress-empty"><div style="font-size:1.6rem;margin-bottom:6px;">${emptyIcon}</div><strong>${escapeHtml(emptyText)}</strong></div>`;
    return;
  }

  // Hitung ringkasan tiap siswa lalu urutkan siswa yang sudah menjawab di atas
  const enriched = list.map((s, origIdx) => {
    const info = typeof getSummary === 'function' ? getSummary(s) : { count: 0, label: '0 Jawaban' };
    return { s, origIdx, info };
  });

  enriched.sort((a, b) => {
    const aHas = (a.info.count || 0) > 0 ? 1 : 0;
    const bHas = (b.info.count || 0) > 0 ? 1 : 0;
    if (aHas !== bHas) return bHas - aHas;
    return a.origIdx - b.origIdx;
  });

  container.innerHTML = enriched.map(({ s, info }, idx) => {
    const nama = escapeHtml(s.nama || 'Tanpa Nama');
    const kelas = escapeHtml(s.kelas || '-');
    const absenText = s.absen ? ` • No. Absen ${escapeHtml(s.absen)}` : '';
    const idSiswa = escapeHtml(s.id_siswa || '');
    const isZero = !info || Number(info.count) <= 0;
    const isMultiline = Boolean(info && info.labelHtml && !isZero);
    const badgeClass = [isZero ? 'muted' : badgeTheme, isMultiline ? 'is-multiline' : ''].filter(Boolean).join(' ');
    const badgeContent = (!isZero && info && info.labelHtml) ? info.labelHtml : escapeHtml(info ? info.label : '');

    return `
      <div class="student-progress-row ${isZero ? 'is-empty-row' : ''}" data-id-siswa="${idSiswa}">
        <div class="student-progress-left">
          <span class="student-progress-index">${idx + 1}</span>
          <div class="student-progress-info">
            <div class="student-progress-name">${nama}</div>
            <div class="student-progress-sub">Kelas ${kelas}${absenText} • ${escapeHtml(s.sekolah || '-')}</div>
          </div>
        </div>
        <div class="student-progress-right">
          <span class="progress-count-badge ${badgeClass}">${badgeContent}</span>
          <button type="button" class="btn-detail-row" onclick="${detailHandlerName}('${idSiswa}')" title="Lihat Rincian & Unduh">
            🔍 Detail
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderReadSiswaTable(students, searchQuery = '') {
  const stats = materiProgressCache.stages['read'];
  const matStats = stats && stats.byMateri ? stats.byMateri[String(selectedReadMateri || '1')] : null;

  renderStudentProgressList({
    containerId: 'readSiswaTableBody',
    countId: 'readSiswaCount',
    students: students || currentSiswaList,
    searchQuery,
    emptyIcon: '📖',
    badgeTheme: 'blue',
    detailHandlerName: 'viewDetailRead',
    getSummary: (s) => {
      if (!matStats) return { count: 0, label: 'Memuat...' };
      const sid = String(s.id_siswa || '').trim();
      const qCount = matStats.qCounts.get(sid) || 0;
      const ideCount = matStats.ideMap.get(sid) || 0;
      const durEntry = matStats.durasiMap ? matStats.durasiMap.get(sid) : null;
      const durasiText = (durEntry && durEntry.durasi) ? durEntry.durasi : '';
      const hasAnyData = qCount > 0 || ideCount > 0 || Boolean(durasiText);

      if (!hasAnyData) return { count: 0, label: 'Belum menjawab' };

      const durasiLabel = durasiText || '-';
      return {
        count: qCount + ideCount + (durasiText ? 1 : 0),
        label: `Waktu Baca : ${durasiLabel} • ${qCount} Pertanyaan • ${ideCount} Ide`,
        labelHtml: `<span>Waktu Baca : ${escapeHtml(durasiLabel)}</span><span>${qCount} Pertanyaan • ${ideCount} Ide</span>`
      };
    }
  });
}

/**
 * Filter pencarian realtime untuk daftar siswa di menu READ
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
 * Refresh manual / muat daftar siswa & statistik READ (termasuk durasi baca dari tabel tahap_read)
 */
async function loadReadSiswaTable(isManualRefresh = false) {
  const needServerFetch = isManualRefresh || currentSiswaList.length === 0 || !materiProgressCache.stages['read'];
  if (needServerFetch) {
    showLoading('Memuat Data READ...', 'Mengambil data waktu baca, pertanyaan, dan ide siswa dari server...');
  }

  try {
    if (currentSiswaList.length === 0 || isManualRefresh) {
      await loadDataSiswa(isManualRefresh);
    }
    const searchInput = document.getElementById('searchReadSiswaInput');
    if (searchInput && isManualRefresh) {
      searchInput.value = '';
    }
    renderReadSiswaTable(currentSiswaList);
    await ensureStageStatsLoaded('read', isManualRefresh);
    handleSearchReadSiswa();
    if (needServerFetch) hideOverlay();
  } catch (err) {
    console.error('[loadReadSiswaTable Error]', err);
    if (needServerFetch) {
      showError(err.message || 'Gagal memuat data READ siswa dari server.', 'Gagal Memuat Data READ');
    }
  }
}

/**
 * Fungsi deduplikasi data keterampilan_read per materi untuk seorang siswa
 * Memastikan maksimal 1 ide kreatif per materi (maksimal 5 materi)
 * @param {Array} list
 * @returns {Array}
 */
function deduplicateKeterampilanRead(list) {
  if (!Array.isArray(list)) return [];
  const map = new Map();

  list.forEach(item => {
    const rawMateri = item.id_materi !== undefined && item.id_materi !== null ? String(item.id_materi).trim() : '1';
    const cleanMat = rawMateri.replace(/\D+/g, '') || '1';
    const key = `mat_${cleanMat}`;

    if (!map.has(key)) {
      map.set(key, { ...item, cleanMat });
    } else {
      const existing = map.get(key);
      const exText = (existing.pernyataan || '').trim();
      const newText = (item.pernyataan || '').trim();

      // Gunakan data yang memiliki isi pernyataan atau id_keterampilan terbaru
      if (!exText && newText) {
        map.set(key, { ...item, cleanMat });
      } else if (newText && exText && (item.id_keterampilan || 0) > (existing.id_keterampilan || 0)) {
        map.set(key, { ...item, cleanMat });
      }
    }
  });

  // Urutkan berdasarkan nomor materi 1..5
  const result = Array.from(map.values());
  result.sort((a, b) => (Number(a.cleanMat) || 0) - (Number(b.cleanMat) || 0));
  return result.slice(0, 5); // Maksimal 5 ide kreatif (1 per materi)
}

let selectedReadMateri = null;
let currentReadPdfPayload = null;

/**
 * Helper bersama merender 5 kartu Pilihan Materi ke dalam container target
 * @param {string} containerId
 * @param {string} handlerFnName
 * @param {string} theme
 * @param {string} ctaText
 */
function renderMateriSelectorGrid(containerId, handlerFnName, theme = 'blue', ctaText = 'Lihat Daftar →', stageKey = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const materiItems = (typeof DAFTAR_MATERI_ANSWER !== 'undefined' && Array.isArray(DAFTAR_MATERI_ANSWER))
    ? DAFTAR_MATERI_ANSWER
    : [
        { id: '1', key: 'materi-1', title: 'Materi 1 · Cuaca, Iklim, dan Musim' },
        { id: '2', key: 'materi-2', title: 'Materi 2 · Efek Rumah Kaca' },
        { id: '3', key: 'materi-3', title: 'Materi 3 · Penyebab Perubahan Iklim' },
        { id: '4', key: 'materi-4', title: 'Materi 4 · Dampak Perubahan Iklim' },
        { id: '5', key: 'materi-5', title: 'Materi 5 · Tindakan Mitigasi & Adaptasi' }
      ];

  const stats = stageKey ? materiProgressCache.stages[stageKey] : null;
  const totalStudents = stats ? stats.totalStudents : currentSiswaList.length;

  container.innerHTML = materiItems.map(m => {
    const cleanTitle = m.title.replace(/^Materi\s*\d+\s*[·\-–]\s*/i, '').trim();
    let pillHtml = '<span class="materi-progress-pill is-loading">⏳ Menghitung...</span>';

    if (stats && stats.byMateri && stats.byMateri[m.id]) {
      const mData = stats.byMateri[m.id];
      if (stageKey === 'discuss' || stageKey === 'explain') {
        const gCount = mData.groupCount || 0;
        const mTotal = mData.memberTotal || 0;
        const unitLabel = stageKey === 'discuss' ? 'Kelompok' : 'Kelompok';
        pillHtml = `<span class="materi-progress-pill ${gCount === 0 ? 'is-empty' : ''}">👥 ${gCount} ${unitLabel}${mTotal > 0 ? ` (${mTotal} Siswa)` : ''}</span>`;
      } else {
        const answered = mData.studentIds ? mData.studentIds.size : 0;
        pillHtml = `<span class="materi-progress-pill ${answered === 0 ? 'is-empty' : ''}">👥 ${answered} / ${totalStudents} Siswa Menjawab</span>`;
      }
    } else if (!stageKey) {
      pillHtml = '';
    }

    return `
      <button type="button" class="materi-selector-card" data-theme="${escapeHtml(theme)}" onclick="${handlerFnName}('${m.id}')">
        <div class="materi-selector-main">
          <div class="materi-selector-top">
            <span class="materi-selector-num">📚 Materi ${m.id}</span>
          </div>
          <h4 class="materi-selector-title">${escapeHtml(cleanTitle)}</h4>
        </div>
        <div class="materi-selector-right">
          ${pillHtml}
          <span class="materi-selector-cta">${escapeHtml(ctaText)}</span>
        </div>
      </button>
    `;
  }).join('');
}

function selectReadMateri(matNum) {
  selectedReadMateri = String(matNum || '1');
  const titleEl = document.getElementById('readSelectedMateriTitle');
  if (titleEl) titleEl.textContent = getNamaMateri('materi-' + selectedReadMateri);

  const materiView = document.getElementById('readMateriView');
  const listView = document.getElementById('readListView');
  const detailView = document.getElementById('readDetailView');
  if (materiView) materiView.style.display = 'none';
  if (detailView) detailView.style.display = 'none';
  if (listView) listView.style.display = 'block';

  loadReadSiswaTable(false);
}

function backToReadMateri() {
  selectedReadMateri = null;
  currentReadPdfPayload = null;
  renderMateriSelectorGrid('readMateriGrid', 'selectReadMateri', 'blue', 'Lihat Siswa →', 'read');
  const materiView = document.getElementById('readMateriView');
  const listView = document.getElementById('readListView');
  const detailView = document.getElementById('readDetailView');
  if (listView) listView.style.display = 'none';
  if (detailView) detailView.style.display = 'none';
  if (materiView) materiView.style.display = 'block';

  ensureStageStatsLoaded('read').then(() => {
    if (document.getElementById('readMateriView')?.style.display !== 'none') {
      renderMateriSelectorGrid('readMateriGrid', 'selectReadMateri', 'blue', 'Lihat Siswa →', 'read');
    }
  });
}

/**
 * Mengambil data pertanyaan, tantangan, dan ide kreatif siswa via API (WHERE id_siswa)
 * dan menampilkan rincian khusus materi yang dipilih (Atas: Pertanyaan, Bawah: Ide Kreatif)
 * @param {string} idSiswa
 */
async function viewDetailRead(idSiswa) {
  if (!idSiswa) return;
  const activeMatNum = String(selectedReadMateri || '1');
  const activeMateriLabel = getNamaMateri('materi-' + activeMatNum);

  // Temukan data profil siswa dari memori lokal currentSiswaList
  const student = currentSiswaList.find(s => s.id_siswa === idSiswa) || {
    id_siswa: idSiswa,
    nama: 'Siswa',
    kelas: '-',
    sekolah: '-',
    absen: '-'
  };

  showLoading('Memuat Data Siswa...', `Mengambil pertanyaan & ide kreatif ${activeMateriLabel}...`);

  try {
    // 1. Ambil data dari tabel pertanyaan, tantangan, dan keterampilan_read secara paralel
    const [pertanyaanRes, tantanganRes, keterampilanRes] = await Promise.allSettled([
      EcoApi.getWhere('pertanyaan', { id_siswa: idSiswa }),
      EcoApi.getWhere('tantangan', { id_siswa: idSiswa }),
      EcoApi.getWhere('keterampilan_read', { id_siswa: idSiswa })
    ]);

    const rawPertanyaan = pertanyaanRes.status === 'fulfilled' && Array.isArray(pertanyaanRes.value) ? pertanyaanRes.value : [];
    const rawTantangan = tantanganRes.status === 'fulfilled' && Array.isArray(tantanganRes.value) ? tantanganRes.value : [];
    let rawKeterampilan = keterampilanRes.status === 'fulfilled' && Array.isArray(keterampilanRes.value) ? keterampilanRes.value : [];

    // Fallback jika getWhere keterampilan_read gagal/kosong
    if (rawKeterampilan.length === 0) {
      try {
        const allKeterampilan = await EcoApi.get('keterampilan_read');
        if (Array.isArray(allKeterampilan)) {
          rawKeterampilan = allKeterampilan.filter(k => k.id_siswa === idSiswa);
        }
      } catch (errKet) {}
    }

    const matchMateriNum = (rawMat) => {
      const cleaned = String(rawMat !== undefined && rawMat !== null ? rawMat : '').replace(/\D+/g, '') || '1';
      return cleaned === activeMatNum;
    };

    const validPertanyaan = rawPertanyaan.filter(item => matchMateriNum(item.id_materi));
    const validTantangan = rawTantangan.filter(item => matchMateriNum(item.id_materi));
    const validKeterampilan = rawKeterampilan.filter(item => matchMateriNum(item.id_materi));

    // 2. Isi Header Detail
    const nameEl = document.getElementById('readDetailStudentName');
    const metaEl = document.getElementById('readDetailStudentMeta');
    if (nameEl) nameEl.textContent = `👨‍🎓👩‍🎓 ${student.nama}`;
    if (metaEl) {
      const absenText = student.absen ? ` (No. Absen: ${student.absen})` : '';
      metaEl.textContent = `${activeMateriLabel} • Kelas ${student.kelas} • ${student.sekolah}${absenText}`;
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

    // 5. Render Blok 3: Ide Kreatif Siswa (keterampilan_read)
    // Maksimal 5 ide kreatif siswa (1 per materi)
    const uniqueKeterampilan = deduplicateKeterampilanRead(validKeterampilan);

    const ideKreatifBadge = document.getElementById('readIdeKreatifCountBadge');
    if (ideKreatifBadge) {
      ideKreatifBadge.textContent = `${uniqueKeterampilan.length} Ide Kreatif`;
    }

    const ideKreatifContainer = document.getElementById('readIdeKreatifList');
    if (ideKreatifContainer) {
      if (uniqueKeterampilan.length === 0) {
        ideKreatifContainer.innerHTML = `
          <div class="siswa-empty-state" style="padding: 24px 10px;">
            <span class="siswa-empty-icon" style="font-size: 1.8rem;">💡</span>
            <div style="font-size: 0.9rem; font-weight: 700;">Belum ada ide kreatif</div>
            <small style="color: var(--text3);">Siswa belum merumuskan ide kreatif pada tabel keterampilan tahap READ.</small>
          </div>
        `;
      } else {
        let kCards = '';
        uniqueKeterampilan.forEach(item => {
          const cleanMatNum = item.cleanMat || '1';
          const normalizedMateriId = 'materi-' + cleanMatNum;
          const namaMateriLengkap = getNamaMateri(normalizedMateriId);
          const keteranganMateri = namaMateriLengkap.replace(/^Materi\s*\d+\s*[·\-–]\s*/i, '').trim();
          const headerText = `Materi ${cleanMatNum} - ${keteranganMateri}`;
          const pernyataanText = item.pernyataan && String(item.pernyataan).trim() ? String(item.pernyataan).trim() : '(Ide kreatif belum diisi)';

          kCards += `
            <div class="read-item-card ide-kreatif">
              <div class="response-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="margin: 0; font-family: 'Sora', sans-serif; font-size: 0.98rem; font-weight: 700; color: var(--text);">
                  💡 ${escapeHtml(headerText)}
                </h4>
                <span class="badge badge-green" style="margin: 0; font-size: 0.75rem;">Materi ${cleanMatNum}</span>
              </div>
              <div class="response-box" style="margin-bottom: 0; background: #F0FDF4; border-color: #86EFAC; color: #064E3B; font-weight: 600; font-size: 0.9rem; line-height: 1.6; white-space: pre-line;">
                "${escapeHtml(pernyataanText)}"
              </div>
            </div>
          `;
        });
        ideKreatifContainer.innerHTML = kCards;
      }
    }

    const tantanganCard = document.getElementById('readTantanganCard');
    if (tantanganCard) {
      tantanganCard.style.display = validTantangan.length > 0 ? 'block' : 'none';
    }

    currentReadPdfPayload = {
      student,
      matNum: activeMatNum,
      materiLabel: activeMateriLabel,
      pertanyaan: validPertanyaan,
      ideKreatif: uniqueKeterampilan,
      tantangan: validTantangan
    };

    const btnPdf = document.getElementById('btnDownloadReadPdf');
    if (btnPdf) {
      const hasAnyData = validPertanyaan.length > 0 || uniqueKeterampilan.length > 0 || validTantangan.length > 0;
      btnPdf.disabled = !hasAnyData;
      btnPdf.title = hasAnyData
        ? `Unduh PDF Tahap READ ${activeMateriLabel}`
        : 'Belum ada data tahap READ pada materi ini';
    }

    // 6. Ganti tampilan ke Detail View
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
 * Mengunduh PDF hasil tahap READ (Pertanyaan Siswa & Ide Kreatif) untuk materi yang dipilih
 */
function downloadReadMateriPdf() {
  if (!currentReadPdfPayload) {
    showError('Data detail READ belum dimuat.', 'Gagal Mengunduh');
    return;
  }

  const { student, matNum, materiLabel, pertanyaan, ideKreatif, tantangan } = currentReadPdfPayload;
  if ((!pertanyaan || pertanyaan.length === 0) && (!ideKreatif || ideKreatif.length === 0) && (!tantangan || tantangan.length === 0)) {
    showError('Belum ada data READ pada materi ini untuk diunduh.', 'Data Kosong');
    return;
  }

  try {
    const doc = createA4PaginatedPdfDoc({
      pageBg: '#F4F9FF',
      gradStart: '#075985',
      gradEnd: '#0284C7',
      pillBg: 'rgba(255,255,255,0.2)',
      pillText: '#E0F2FE',
      subtitleText: '#BAE6FD',
      accent: '#0369A1',
      footerBg: '#0C4A6E',
      footerSub: '#BAE6FD',
      kicker: 'TAHAP 1 · READ · ECOMEDIA RADEC',
      title: materiLabel,
      subtitle: 'Pertanyaan Mandiri dan Ide Kreatif Siswa Tahap READ',
      footerLabel: `📖 ${student.nama || 'Siswa'} · ${materiLabel}`
    });

    const absenText = (student.absen && student.absen !== '-') ? ` (No. Absen: ${student.absen})` : '';
    doc.addInfoBlock('🎒 IDENTITAS SISWA', [
      `Nama Siswa: ${student.nama || 'Siswa'}${absenText}`,
      `Kelas: ${student.kelas || '-'}   ·   Sekolah: ${student.sekolah || '-'}`
    ], {
      bg: '#FFFFFF',
      border: '#BAE6FD',
      accent: '#0369A1',
      titleColor: '#075985'
    });

    doc.addSectionHeading(
      '1. Pertanyaan Siswa (Tahap READ)',
      `${pertanyaan.length} Pertanyaan`,
      '#E0F2FE',
      '#0369A1',
      '#0284C7'
    );

    if (pertanyaan.length === 0) {
      doc.addInfoBlock('PERTANYAAN SISWA', ['(Belum ada pertanyaan yang dirumuskan pada materi ini)'], {
        bg: '#F8FAFC',
        border: '#CBD5E1',
        accent: '#64748B',
        titleColor: '#475569'
      });
    } else {
      pertanyaan.forEach((item, idx) => {
        doc.addQaCard({
          badgeText: `Pertanyaan #${idx + 1}`,
          badgeBg: '#E0F2FE',
          badgeColor: '#0369A1',
          titleText: materiLabel,
          rightMeta: item.id_materi || `materi-${matNum}`,
          aLabel: '❓ RUMUSAN PERTANYAAN SISWA:',
          aText: item.pertanyaan || '(Kosong)',
          aBg: '#F0F9FF',
          aBorder: '#BAE6FD',
          aLabelColor: '#0369A1',
          aColor: '#0C4A6E',
          cardBorder: '#BAE6FD',
          cardAccent: '#0284C7'
        });
      });
    }

    doc.addSectionHeading(
      '2. Ide Kreatif Siswa (Keterampilan READ)',
      `${ideKreatif.length} Ide Kreatif`,
      '#DCFCE7',
      '#166534',
      '#15803D'
    );

    if (ideKreatif.length === 0) {
      doc.addInfoBlock('IDE KREATIF SISWA', ['(Belum ada ide kreatif tercatat pada materi ini)'], {
        bg: '#F8FAFC',
        border: '#CBD5E1',
        accent: '#64748B',
        titleColor: '#475569'
      });
    } else {
      ideKreatif.forEach((item, idx) => {
        doc.addQaCard({
          badgeText: `Ide Kreatif #${idx + 1}`,
          badgeBg: '#DCFCE7',
          badgeColor: '#166534',
          titleText: materiLabel,
          rightMeta: `Materi ${item.cleanMat || matNum}`,
          aLabel: '💡 GAGASAN IDE KREATIF:',
          aText: item.pernyataan || '(Belum diisi)',
          aBg: '#F0FDF4',
          aBorder: '#86EFAC',
          aLabelColor: '#15803D',
          aColor: '#064E3B',
          cardBorder: '#BBF7D0',
          cardAccent: '#15803D'
        });
      });
    }

    if (tantangan && tantangan.length > 0) {
      doc.addSectionHeading(
        '3. Tanggapan Tantangan READ',
        `${tantangan.length} Tanggapan`,
        '#F3E8FF',
        '#6B21A8',
        '#7C3AED'
      );
      tantangan.forEach((item, idx) => {
        const { stimulus } = parseKeteranganTantangan(item.keterangan, item.id_materi);
        doc.addQaCard({
          badgeText: `Tantangan #${idx + 1}`,
          badgeBg: '#F3E8FF',
          badgeColor: '#6B21A8',
          titleText: materiLabel,
          rightMeta: item.id_materi || `materi-${matNum}`,
          qLabel: '📖 STIMULUS:',
          qText: stimulus || '-',
          aLabel: '✍️ JAWABAN SISWA:',
          aText: item.jawaban || '(Belum ada jawaban)',
          aBg: '#F0FDF4',
          aBorder: '#BBF7D0',
          aLabelColor: '#15803D',
          aColor: '#064E3B',
          cardBorder: '#E9D5FF',
          cardAccent: '#7C3AED'
        });
      });
    }

    const studentSlug = buildIdentityFilenameSlug(student.nama, student.kelas, student.sekolah, 'siswa');
    doc.savePdf(`Hasil_read_materi_${matNum}_${studentSlug}.pdf`);
  } catch (err) {
    console.error('[downloadReadMateriPdf Error]', err);
    showError(err.message || 'Gagal menghasilkan file PDF READ.', 'Gagal Mengunduh PDF');
  }
}

/**
 * Menutup tampilan detail dan kembali ke tabel daftar siswa di menu READ
 */
function closeDetailRead() {
  currentReadPdfPayload = null;
  const listView = document.getElementById('readListView');
  const detailView = document.getElementById('readDetailView');
  if (detailView) detailView.style.display = 'none';
  if (listView) {
    listView.style.display = 'block';
    renderReadSiswaTable(currentSiswaList);
  }
}

// Ekspos controller READ ke global window
window.renderMateriSelectorGrid = renderMateriSelectorGrid;
window.selectReadMateri = selectReadMateri;
window.backToReadMateri = backToReadMateri;
window.renderReadSiswaTable = renderReadSiswaTable;
window.handleSearchReadSiswa = handleSearchReadSiswa;
window.loadReadSiswaTable = loadReadSiswaTable;
window.viewDetailRead = viewDetailRead;
window.downloadReadMateriPdf = downloadReadMateriPdf;
window.closeDetailRead = closeDetailRead;

// ==========================================
// PENGELOLAAN MENU TANGGAPAN SISWA (ECOMEDIA)
// ==========================================
const ECOMEDIA_SOURCES = [
  {
    key: 'video',
    icon: '🎬',
    title: 'Video Ecomedia',
    desc: 'Tanggapan 4 lensa analisis terhadap media video pembelajaran lingkungan',
    badge: 'Video',
    theme: 'red'
  },
  {
    key: 'infografis',
    icon: '📊',
    title: 'Infografis',
    desc: 'Tanggapan 4 lensa analisis terhadap sajian infografis perubahan iklim',
    badge: 'Infografis',
    theme: 'blue'
  },
  {
    key: 'buku',
    icon: '📖',
    title: 'Buku atau Kertas',
    desc: 'Tanggapan 4 lensa analisis terhadap bahan bacaan buku atau kertas',
    badge: 'Buku / Kertas',
    theme: 'green'
  }
];

let selectedTanggapanSource = null;
let currentTanggapanPdfPayload = null;

function normalizeEcomediaSourceKey(rawSumber) {
  const low = String(rawSumber || '').trim().toLowerCase();
  if (!low) return '';
  if (low.includes('video')) return 'video';
  if (low.includes('infografis')) return 'infografis';
  if (low.includes('buku') || low.includes('kertas')) return 'buku';
  return '';
}

function renderTanggapanSourceGrid() {
  const container = document.getElementById('tanggapanSourceGrid');
  if (!container) return;

  const stats = materiProgressCache.stages['tanggapan'];
  const totalStudents = stats ? stats.totalStudents : currentSiswaList.length;

  container.innerHTML = ECOMEDIA_SOURCES.map(src => {
    let pillHtml = '<span class="materi-progress-pill is-loading">⏳ Menghitung...</span>';
    if (stats && stats.bySource && stats.bySource[src.key]) {
      const answered = stats.bySource[src.key].studentIds.size;
      pillHtml = `<span class="materi-progress-pill ${answered === 0 ? 'is-empty' : ''}">👥 ${answered} / ${totalStudents} Siswa Menjawab</span>`;
    }

    return `
      <button type="button" class="materi-selector-card" data-theme="${escapeHtml(src.theme)}" onclick="selectTanggapanSource('${escapeHtml(src.key)}')">
        <div class="materi-selector-main">
          <div class="materi-selector-top">
            <span class="materi-selector-num">${src.icon} ${escapeHtml(src.badge)}</span>
          </div>
          <h4 class="materi-selector-title">${escapeHtml(src.title)}</h4>
          <p class="materi-selector-desc">${escapeHtml(src.desc)}</p>
        </div>
        <div class="materi-selector-right">
          ${pillHtml}
          <span class="materi-selector-cta">Lihat Siswa →</span>
        </div>
      </button>
    `;
  }).join('');
}

function selectTanggapanSource(sourceKey) {
  selectedTanggapanSource = String(sourceKey || 'video').toLowerCase();
  const srcMeta = ECOMEDIA_SOURCES.find(s => s.key === selectedTanggapanSource) || ECOMEDIA_SOURCES[0];

  const titleEl = document.getElementById('tanggapanSelectedSourceTitle');
  if (titleEl) titleEl.textContent = `${srcMeta.icon} ${srcMeta.title}`;

  const srcView = document.getElementById('tanggapanSourceView');
  const listView = document.getElementById('tanggapanListView');
  const detailView = document.getElementById('tanggapanDetailView');
  if (srcView) srcView.style.display = 'none';
  if (detailView) detailView.style.display = 'none';
  if (listView) listView.style.display = 'block';

  loadTanggapanSiswaTable(false);
}

function backToTanggapanSource() {
  selectedTanggapanSource = null;
  currentTanggapanPdfPayload = null;
  renderTanggapanSourceGrid();

  const srcView = document.getElementById('tanggapanSourceView');
  const listView = document.getElementById('tanggapanListView');
  const detailView = document.getElementById('tanggapanDetailView');
  if (listView) listView.style.display = 'none';
  if (detailView) detailView.style.display = 'none';
  if (srcView) srcView.style.display = 'block';

  ensureStageStatsLoaded('tanggapan').then(() => {
    if (document.getElementById('tanggapanSourceView')?.style.display !== 'none') {
      renderTanggapanSourceGrid();
    }
  });
}

/**
 * Merender daftar list siswa di Menu Tanggapan Siswa (Ecomedia) beserta jumlah jawaban & tombol Detail
 */
function renderTanggapanSiswaTable(students, searchQuery = '') {
  const stats = materiProgressCache.stages['tanggapan'];
  const srcStats = stats && stats.bySource ? stats.bySource[String(selectedTanggapanSource || 'video')] : null;

  renderStudentProgressList({
    containerId: 'tanggapanSiswaTableBody',
    countId: 'tanggapanSiswaCount',
    students: students || currentSiswaList,
    searchQuery,
    emptyIcon: '💬',
    badgeTheme: 'green',
    detailHandlerName: 'viewDetailTanggapan',
    getSummary: (s) => {
      if (!srcStats) return { count: 0, label: 'Memuat...' };
      const sid = String(s.id_siswa || '').trim();
      const count = srcStats.counts.get(sid) || 0;
      if (count === 0) return { count: 0, label: 'Belum menjawab' };
      return { count, label: `${count} Tanggapan` };
    }
  });
}

/**
 * Filter pencarian realtime untuk daftar siswa di menu Tanggapan (Ecomedia)
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
 * Refresh manual daftar siswa di menu Tanggapan (Ecomedia)
 */
async function loadTanggapanSiswaTable(isManualRefresh = false) {
  if (currentSiswaList.length === 0 || isManualRefresh) {
    await loadDataSiswa(isManualRefresh);
  }
  const searchInput = document.getElementById('searchTanggapanSiswaInput');
  if (searchInput && isManualRefresh) {
    searchInput.value = '';
  }
  renderTanggapanSiswaTable(currentSiswaList);
  await ensureStageStatsLoaded('tanggapan', isManualRefresh);
  handleSearchTanggapanSiswa();
}

/**
 * Mengambil data tanggapan ecomedia siswa via API (WHERE id_siswa)
 * lalu menyaringnya sesuai sumber media terpilih dan menampilkannya secara rinci
 * @param {string} idSiswa
 */
async function viewDetailTanggapan(idSiswa) {
  if (!idSiswa) return;
  const activeSourceKey = String(selectedTanggapanSource || 'video').toLowerCase();
  const srcMeta = ECOMEDIA_SOURCES.find(s => s.key === activeSourceKey) || ECOMEDIA_SOURCES[0];

  const student = currentSiswaList.find(s => s.id_siswa === idSiswa) || {
    id_siswa: idSiswa,
    nama: 'Siswa',
    kelas: '-',
    sekolah: '-',
    absen: '-'
  };

  showLoading('Memuat Tanggapan Ecomedia...', `Mengambil analisis ${srcMeta.title} siswa...`);

  try {
    let rawList = [];
    try {
      rawList = await EcoApi.getWhere('ecomedia', { id_siswa: idSiswa });
    } catch (err) {
      try {
        const allEco = await EcoApi.get('ecomedia');
        if (Array.isArray(allEco)) {
          rawList = allEco.filter(item => item.id_siswa === idSiswa);
        }
      } catch (e2) {
        rawList = [];
      }
    }

    const validList = (Array.isArray(rawList) ? rawList : [])
      .filter(item => normalizeEcomediaSourceKey(item.sumber) === activeSourceKey)
      .sort((a, b) => (Number(b.id_ecomedia) || 0) - (Number(a.id_ecomedia) || 0));

    // Isi Header Detail Siswa
    const nameEl = document.getElementById('tanggapanDetailStudentName');
    const metaEl = document.getElementById('tanggapanDetailStudentMeta');
    if (nameEl) nameEl.textContent = `👨‍🎓👩‍🎓 ${student.nama}`;
    if (metaEl) {
      const absenText = student.absen ? ` (No. Absen: ${student.absen})` : '';
      metaEl.textContent = `${srcMeta.title} • Kelas ${student.kelas} • ${student.sekolah}${absenText}`;
    }

    const headingEl = document.getElementById('tanggapanDetailSourceHeading');
    if (headingEl) headingEl.textContent = `${srcMeta.icon} Tanggapan — ${srcMeta.title}`;

    const countBadge = document.getElementById('tanggapanCountBadge');
    if (countBadge) {
      countBadge.textContent = `${validList.length} Tanggapan`;
    }

    currentTanggapanPdfPayload = {
      student,
      sourceMeta: srcMeta,
      items: validList
    };

    const btnPdf = document.getElementById('btnDownloadTanggapanPdf');
    if (btnPdf) {
      btnPdf.disabled = validList.length === 0;
      btnPdf.title = validList.length === 0
        ? 'Belum ada tanggapan pada sumber ini'
        : `Unduh PDF Analisis ${srcMeta.title}`;
    }

    const container = document.getElementById('tanggapanList');
    if (container) {
      if (validList.length === 0) {
        container.innerHTML = `
          <div class="siswa-empty-state" style="padding: 32px 10px;">
            <span class="siswa-empty-icon" style="font-size: 2rem;">${srcMeta.icon}</span>
            <div style="font-size: 0.95rem; font-weight: 700;">Belum ada tanggapan ${escapeHtml(srcMeta.title)}</div>
            <small style="color: var(--text3);">Siswa belum mengirimkan analisis 4 lensa untuk sumber media ini.</small>
          </div>
        `;
      } else {
        let cards = '';
        validList.forEach((item, idx) => {
          const sumber = item.sumber || srcMeta.title;
          const ceritaNilai = item.cerita_nilai || '-';
          const siapaBerperan = item.siapa_berperan || '-';
          const bahanEnergiLimbah = item.bahan_energi_limbah || '-';
          const pengalamanKita = item.pengalaman_kita || '-';

          cards += `
            <div class="read-item-card ecomedia" style="border-left: 4.5px solid #168246; margin-bottom: 16px;">
              <div class="response-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="badge badge-green" style="margin: 0; font-size: 0.78rem;">${srcMeta.icon} Sumber Media</span>
                  <h4 style="margin: 0; font-family: 'Sora', sans-serif; font-size: 1.05rem; color: var(--text);">${escapeHtml(sumber)}</h4>
                </div>
                <span style="font-size: 0.75rem; color: var(--text3); font-family: monospace;">#${idx + 1}${item.id_ecomedia ? ` • ID #${escapeHtml(String(item.id_ecomedia))}` : ''}</span>
              </div>

              <!-- 1. Cerita & Nilai -->
              <div style="margin-bottom: 10px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--text3); margin-bottom: 3px;">📖 Cerita &amp; Nilai:</div>
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
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--text3); margin-bottom: 3px;">⚡ Bahan, Energi, &amp; Limbah:</div>
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

    // Ganti tampilan ke Detail View
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
 * Mengunduh PDF hasil tanggapan 4 lensa Ecomedia siswa pada sumber yang dipilih
 */
function downloadTanggapanPdf() {
  if (!currentTanggapanPdfPayload || !Array.isArray(currentTanggapanPdfPayload.items) || currentTanggapanPdfPayload.items.length === 0) {
    showError('Belum ada tanggapan Ecomedia pada sumber ini untuk diunduh.', 'Data Kosong');
    return;
  }

  const { student, sourceMeta, items } = currentTanggapanPdfPayload;

  try {
    const doc = createA4PaginatedPdfDoc({
      pageBg: '#F4FBF7',
      gradStart: '#0A3D1F',
      gradEnd: '#15803D',
      pillBg: 'rgba(255,255,255,0.2)',
      pillText: '#DCFCE7',
      subtitleText: '#BBF7D0',
      accent: '#15803D',
      footerBg: '#0A3D1F',
      footerSub: '#BBF7D0',
      kicker: 'ANALISIS ECOMEDIA · 4 LENSA',
      title: sourceMeta.title,
      subtitle: 'Tanggapan Siswa Terhadap Media Lingkungan (Cerita, Peran, Energi, & Pengalaman)',
      footerLabel: `💬 ${student.nama || 'Siswa'} · ${sourceMeta.title}`
    });

    const absenText = (student.absen && student.absen !== '-') ? ` (No. Absen: ${student.absen})` : '';
    doc.addInfoBlock('🎒 IDENTITAS SISWA', [
      `Nama Siswa: ${student.nama || 'Siswa'}${absenText}`,
      `Kelas: ${student.kelas || '-'}   ·   Sekolah: ${student.sekolah || '-'}`
    ], {
      bg: '#FFFFFF',
      border: '#86EFAC',
      accent: '#15803D',
      titleColor: '#166534'
    });

    doc.addSectionHeading(
      `Riwayat Analisis — ${sourceMeta.title}`,
      `${items.length} Tanggapan`,
      '#DCFCE7',
      '#166534',
      '#15803D'
    );

    items.forEach((item, idx) => {
      doc.addEcoCard({
        badgeText: `Tanggapan #${idx + 1}`,
        titleText: item.sumber || sourceMeta.title,
        rightMeta: item.id_ecomedia ? `ID #${item.id_ecomedia}` : `#${idx + 1}`,
        fields: [
          {
            label: '📖 1. CERITA & NILAI:',
            text: item.cerita_nilai || '-',
            bg: '#F0FDF4',
            border: '#BBF7D0',
            textColor: '#064E3B'
          },
          {
            label: '👥 2. SIAPA YANG BERPERAN:',
            text: item.siapa_berperan || '-',
            bg: '#F8FAFC',
            border: '#E2E8F0',
            textColor: '#1E293B'
          },
          {
            label: '⚡ 3. BAHAN, ENERGI, & LIMBAH:',
            text: item.bahan_energi_limbah || '-',
            bg: '#FFFBEB',
            border: '#FDE68A',
            textColor: '#78350F'
          },
          {
            label: '🌍 4. PENGALAMAN KITA:',
            text: item.pengalaman_kita || '-',
            bg: '#F0F9FF',
            border: '#BAE6FD',
            textColor: '#0C4A6E'
          }
        ]
      });
    });

    const studentSlug = buildIdentityFilenameSlug(student.nama, student.kelas, student.sekolah, 'siswa');
    const sourceSlug = sanitizeCreateFilename(sourceMeta.title, 'ecomedia');
    doc.savePdf(`Hasil_ecomedia_${sourceSlug}_${studentSlug}.pdf`);
  } catch (err) {
    console.error('[downloadTanggapanPdf Error]', err);
    showError(err.message || 'Gagal menghasilkan file PDF tanggapan Ecomedia.', 'Gagal Mengunduh PDF');
  }
}

/**
 * Menutup tampilan detail dan kembali ke daftar siswa di menu Tanggapan (Ecomedia)
 */
function closeDetailTanggapan() {
  currentTanggapanPdfPayload = null;
  const listView = document.getElementById('tanggapanListView');
  const detailView = document.getElementById('tanggapanDetailView');
  if (detailView) detailView.style.display = 'none';
  if (listView) {
    listView.style.display = 'block';
    renderTanggapanSiswaTable(currentSiswaList);
  }
}

// Ekspos controller Tanggapan ke global window
window.renderTanggapanSourceGrid = renderTanggapanSourceGrid;
window.selectTanggapanSource = selectTanggapanSource;
window.backToTanggapanSource = backToTanggapanSource;
window.renderTanggapanSiswaTable = renderTanggapanSiswaTable;
window.handleSearchTanggapanSiswa = handleSearchTanggapanSiswa;
window.loadTanggapanSiswaTable = loadTanggapanSiswaTable;
window.viewDetailTanggapan = viewDetailTanggapan;
window.downloadTanggapanPdf = downloadTanggapanPdf;
window.closeDetailTanggapan = closeDetailTanggapan;

// ==========================================
// PENGELOLAAN MENU JAWABAN SISWA (ANSWER)
// ==========================================

/**
 * Merender daftar siswa pada tabel di Menu Jawaban Siswa (ANSWER)
 * Kolom: No, Nama, Kelas, Sekolah, Opsi (Tombol Lihat)
 */
function renderAnswerSiswaTable(students, searchQuery = '') {
  const stats = materiProgressCache.stages['answer'];
  const matStats = stats && stats.byMateri ? stats.byMateri[String(selectedAnswerMateri || '1')] : null;

  renderStudentProgressList({
    containerId: 'answerSiswaTableBody',
    countId: 'answerSiswaCount',
    students: students || currentSiswaList,
    searchQuery,
    emptyIcon: '✍️',
    badgeTheme: 'purple',
    detailHandlerName: 'viewDetailAnswer',
    getSummary: (s) => {
      if (!matStats) return { count: 0, label: 'Memuat...' };
      const sid = String(s.id_siswa || '').trim();
      const count = matStats.counts.get(sid) || 0;
      if (count === 0) return { count: 0, label: 'Belum menjawab' };
      return { count, label: `${count} Jawaban` };
    }
  });
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
 * Refresh manual daftar siswa di menu Jawaban (ANSWER)
 */
async function loadAnswerSiswaTable(isManualRefresh = false) {
  if (currentSiswaList.length === 0 || isManualRefresh) {
    await loadDataSiswa(isManualRefresh);
  }
  const searchInput = document.getElementById('searchAnswerSiswaInput');
  if (searchInput && isManualRefresh) {
    searchInput.value = '';
  }
  renderAnswerSiswaTable(currentSiswaList);
  await ensureStageStatsLoaded('answer', isManualRefresh);
  handleSearchAnswerSiswa();
}

// ==========================================
// TAHAP 2: JAWABAN SISWA (ANSWER) - ACCORDION
// ==========================================
const DAFTAR_MATERI_ANSWER = [
  { id: '1', key: 'materi-1', title: 'Materi 1 · Cuaca, Iklim, dan Musim' },
  { id: '2', key: 'materi-2', title: 'Materi 2 · Efek Rumah Kaca' },
  { id: '3', key: 'materi-3', title: 'Materi 3 · Penyebab Perubahan Iklim' },
  { id: '4', key: 'materi-4', title: 'Materi 4 · Dampak Perubahan Iklim' },
  { id: '5', key: 'materi-5', title: 'Materi 5 · Tindakan Mitigasi & Adaptasi' }
];

let pendingCloseMatKey = null;
let pendingClosePrefix = 'accordion';
let selectedAnswerMateri = null;
let currentAnswerDetailStudent = null;
let currentAnswerGroupedByMateri = {};

function selectAnswerMateri(matNum) {
  selectedAnswerMateri = String(matNum || '1');
  const titleEl = document.getElementById('answerSelectedMateriTitle');
  if (titleEl) titleEl.textContent = getNamaMateri('materi-' + selectedAnswerMateri);

  const materiView = document.getElementById('answerMateriView');
  const listView = document.getElementById('answerListView');
  const detailView = document.getElementById('answerDetailView');
  if (materiView) materiView.style.display = 'none';
  if (detailView) detailView.style.display = 'none';
  if (listView) listView.style.display = 'block';

  loadAnswerSiswaTable(false);
}

function backToAnswerMateri() {
  selectedAnswerMateri = null;
  currentAnswerDetailStudent = null;
  currentAnswerGroupedByMateri = {};
  renderMateriSelectorGrid('answerMateriGrid', 'selectAnswerMateri', 'purple', 'Lihat Siswa →', 'answer');
  const materiView = document.getElementById('answerMateriView');
  const listView = document.getElementById('answerListView');
  const detailView = document.getElementById('answerDetailView');
  if (listView) listView.style.display = 'none';
  if (detailView) detailView.style.display = 'none';
  if (materiView) materiView.style.display = 'block';

  ensureStageStatsLoaded('answer').then(() => {
    if (document.getElementById('answerMateriView')?.style.display !== 'none') {
      renderMateriSelectorGrid('answerMateriGrid', 'selectAnswerMateri', 'purple', 'Lihat Siswa →', 'answer');
    }
  });
}

function downloadAnswerCurrentMateriPdf() {
  downloadAnswerMateriPdf(String(selectedAnswerMateri || '1'));
}

/**
 * Handler klik header accordion materi
 * Jika accordion sedang terbuka (expanded), tampilkan konfirmasi tutup.
 * Jika accordion sedang tertutup (collapsed), langsung buka/expand.
 * @param {string} matKey
 * @param {string} [prefix='accordion']
 */
function handleAccordionHeaderClick(matKey, prefix = 'accordion') {
  const card = document.getElementById(`${prefix}-mat-${matKey}`);
  if (!card) return;

  const isOpen = card.classList.contains('is-open');
  if (isOpen) {
    promptCloseAccordion(matKey, prefix);
  } else {
    openAccordion(matKey, prefix);
  }
}

/**
 * Membuka / expand accordion materi
 * @param {string} matKey
 * @param {string} [prefix='accordion']
 */
function openAccordion(matKey, prefix = 'accordion') {
  const card = document.getElementById(`${prefix}-mat-${matKey}`);
  const body = document.getElementById(`${prefix}Body-mat-${matKey}`);
  const icon = document.getElementById(`${prefix}Icon-mat-${matKey}`);
  if (!card || !body) return;

  card.classList.add('is-open');
  body.style.display = 'block';
  if (icon) icon.textContent = '▲';
}

/**
 * Menutup / collapse accordion materi
 * @param {string} matKey
 * @param {string} [prefix='accordion']
 */
function closeAccordion(matKey, prefix = 'accordion') {
  const card = document.getElementById(`${prefix}-mat-${matKey}`);
  const body = document.getElementById(`${prefix}Body-mat-${matKey}`);
  const icon = document.getElementById(`${prefix}Icon-mat-${matKey}`);
  if (!card || !body) return;

  card.classList.remove('is-open');
  body.style.display = 'none';
  if (icon) icon.textContent = '▼';
}

/**
 * Menampilkan modal konfirmasi menutup materi yang diduplikasi dari tampilan loading screen
 * @param {string} matKey
 * @param {string} [prefix='accordion']
 */
function promptCloseAccordion(matKey, prefix = 'accordion') {
  pendingCloseMatKey = matKey;
  pendingClosePrefix = prefix || 'accordion';
  const modal = document.getElementById('confirmCloseAccordionModal');
  const titleEl = document.getElementById('confirmCloseAccordionTitle');
  const msgEl = document.getElementById('confirmCloseAccordionMsg');
  if (!modal) return;

  const materiItem = DAFTAR_MATERI_ANSWER.find(m => m.id === String(matKey)) || {
    id: matKey,
    title: getNamaMateri('materi-' + matKey)
  };

  if (titleEl) {
    titleEl.textContent = `Tutup Materi ${materiItem.id}?`;
  }
  if (msgEl) {
    msgEl.innerHTML = `Apakah Anda yakin ingin menutup tampilan <strong>${escapeHtml(materiItem.title)}</strong>?`;
  }

  modal.style.display = 'flex';
  void modal.offsetHeight;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

/**
 * Menutup modal konfirmasi tanpa menutup accordion (Batal)
 */
function cancelCloseAccordion() {
  const modal = document.getElementById('confirmCloseAccordionModal');
  pendingCloseMatKey = null;
  pendingClosePrefix = 'accordion';
  if (!modal) return;

  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    if (!modal.classList.contains('show')) modal.style.display = 'none';
  }, 300);
}

/**
 * Menyetujui konfirmasi penutupan accordion (Ya, Tutup Materi)
 */
function confirmCloseAccordion() {
  const matKeyToClose = pendingCloseMatKey;
  const prefixToClose = pendingClosePrefix || 'accordion';
  cancelCloseAccordion();
  if (matKeyToClose) {
    closeAccordion(matKeyToClose, prefixToClose);
  }
}

/**
 * Menggabungkan jawaban server ('answer') dengan 10 pertanyaan wajib dari master ANSWER_ESSAY25
 * untuk materi tertentu (id_materi -> ANSWER_ESSAY25.mat, id_soal -> ANSWER_ESSAY25.id_soal).
 * @param {Array} validList
 * @param {string|number} matNum
 * @returns {Array}
 */
function buildMergedAnswerQuestions(validList, matNum) {
  const cleanMat = normalizeMateriNum(matNum);
  const masterQuestions = getMasterQuestionsForMateri(cleanMat);
  const questionMap = new Map();

  masterQuestions.forEach((mq, mIdx) => {
    const soalIdStr = mq && mq.id_soal !== undefined && mq.id_soal !== null
      ? String(mq.id_soal).trim()
      : String(mIdx + 1);
    if (!soalIdStr) return;

    questionMap.set(soalIdStr, {
      id_materi: cleanMat,
      id_soal: soalIdStr,
      pertanyaan: mq.q || mq.pertanyaan || `Pertanyaan nomor ${soalIdStr}`,
      topic: mq.topic || '',
      jawaban_siswa: '',
      hasAnswer: false,
      confident: '-',
      flag_discuss: 0,
      nilai_nlp: null,
      _pkNum: -1
    });
  });

  const rows = Array.isArray(validList) ? validList : [];
  rows.forEach((item, rawIdx) => {
    if (!item || typeof item !== 'object') return;
    const itemMat = normalizeMateriNum(item.id_materi);
    if (itemMat !== cleanMat) return;

    const rawSoal = item.id_soal !== undefined && item.id_soal !== null
      ? String(item.id_soal).trim()
      : String(rawIdx + 1);
    const ansText = item.jawaban_siswa !== undefined && item.jawaban_siswa !== null
      ? String(item.jawaban_siswa).trim()
      : '';
    const pkNum = Number(item.id_answer || item.id || 0);

    if (!questionMap.has(rawSoal)) {
      questionMap.set(rawSoal, {
        ...item,
        id_materi: cleanMat,
        id_soal: rawSoal,
        pertanyaan: item.pertanyaan ? String(item.pertanyaan).trim() : `Pertanyaan nomor ${rawSoal}`,
        jawaban_siswa: ansText,
        hasAnswer: Boolean(ansText),
        _pkNum: pkNum
      });
      return;
    }

    const existing = questionMap.get(rawSoal);
    const shouldUpdateAns =
      (!existing.hasAnswer && ansText) ||
      (ansText && pkNum >= existing._pkNum) ||
      (!existing.hasAnswer && !ansText && pkNum >= existing._pkNum);

    if (shouldUpdateAns) {
      questionMap.set(rawSoal, {
        ...existing,
        ...item,
        id_materi: cleanMat,
        id_soal: rawSoal,
        // Prioritaskan teks pertanyaan dari master ANSWER_ESSAY25
        pertanyaan: existing.pertanyaan || (item.pertanyaan ? String(item.pertanyaan).trim() : `Pertanyaan nomor ${rawSoal}`),
        jawaban_siswa: ansText,
        hasAnswer: Boolean(ansText),
        _pkNum: pkNum
      });
    }
  });

  return Array.from(questionMap.values()).sort((a, b) => {
    const numA = parseInt(String(a.id_soal || '').replace(/\D+/g, ''), 10) || 0;
    const numB = parseInt(String(b.id_soal || '').replace(/\D+/g, ''), 10) || 0;
    if (numA !== numB) return numA - numB;
    return String(a.id_soal || '').localeCompare(String(b.id_soal || ''));
  });
}

/**
 * Mengambil data jawaban siswa via API (WHERE id_siswa) dari tabel 'answer'
 * dan menampilkan tampilan detail ramping 10 pertanyaan wajib dari ANSWER_ESSAY25 + jawaban siswa
 * @param {string} idSiswa
 */
async function viewDetailAnswer(idSiswa) {
  if (!idSiswa) return;
  const activeMatNum = normalizeMateriNum(selectedAnswerMateri || '1');
  const materiItem = DAFTAR_MATERI_ANSWER.find(m => m.id === activeMatNum) || {
    id: activeMatNum,
    key: 'materi-' + activeMatNum,
    title: getNamaMateri('materi-' + activeMatNum)
  };

  // Temukan data profil siswa dari memori lokal currentSiswaList
  const student = currentSiswaList.find(s => s.id_siswa === idSiswa) || {
    id_siswa: idSiswa,
    nama: 'Siswa',
    kelas: '-',
    sekolah: '-',
    absen: '-'
  };

  showLoading('Memuat Data Siswa...', `Mengambil jawaban ${materiItem.title}...`);

  try {
    // 1. Ambil data dari tabel answer dengan WHERE id_siswa
    const answerList = await EcoApi.getWhere('answer', { id_siswa: idSiswa });
    const validList = Array.isArray(answerList) ? answerList : [];

    // 2. Isi Header Detail Siswa
    const nameEl = document.getElementById('answerDetailStudentName');
    const metaEl = document.getElementById('answerDetailStudentMeta');
    if (nameEl) nameEl.textContent = `👨‍🎓👩‍🎓 ${student.nama}`;
    if (metaEl) {
      const absenText = student.absen ? ` (No. Absen: ${student.absen})` : '';
      metaEl.textContent = `${materiItem.title} • Kelas ${student.kelas} • ${student.sekolah}${absenText}`;
    }

    // Gabungkan jawaban siswa dengan seluruh 10 soal master per materi agar UI & PDF sinkron
    const groupedAnswers = {};
    ['1', '2', '3', '4', '5'].forEach(m => {
      groupedAnswers[m] = buildMergedAnswerQuestions(validList, m);
    });

    currentAnswerDetailStudent = student;
    currentAnswerGroupedByMateri = groupedAnswers;

    const items = groupedAnswers[activeMatNum] || [];
    const answeredCount = items.filter(it => it.hasAnswer).length;

    const headingEl = document.getElementById('answerDetailMateriHeading');
    if (headingEl) headingEl.textContent = `Daftar Jawaban — ${materiItem.title}`;

    const countBadge = document.getElementById('answerCountBadge');
    if (countBadge) countBadge.textContent = `${items.length} Soal · ${answeredCount} Terjawab`;

    const btnPdf = document.getElementById('btnDownloadAnswerPdf');
    if (btnPdf) {
      btnPdf.disabled = items.length === 0;
      btnPdf.title = items.length === 0
        ? 'Belum ada daftar pertanyaan pada materi ini'
        : `Unduh PDF Jawaban ${materiItem.title}`;
    }

    const btnNlp = document.getElementById('btnEvaluateAnswerNlp');
    if (btnNlp) {
      btnNlp.disabled = answeredCount === 0;
      btnNlp.title = answeredCount === 0
        ? 'Siswa belum mengisi jawaban pada materi ini (soal kosong dilewati)'
        : `Nilai ${answeredCount} jawaban terisi pada ${materiItem.title} dengan AI NLP`;
    }

    renderAnswerDetailItemsList(items, materiItem);

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
 * Memformat skor NLP skala 1-4 dengan rapi (bilangan bulat tampil utuh, desimal lama tetap rapi 1 angka di belakang koma)
 */
function formatNlpScoreDisplay(val) {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  if (!Number.isFinite(num)) return null;
  return Number.isInteger(num) ? String(num) : num.toFixed(1);
}

/**
 * Merender daftar kartu ramping 10 soal & jawaban siswa pada halaman rincian ANSWER
 */
function renderAnswerDetailItemsList(items, materiItem) {
  const container = document.getElementById('answerDetailItemsList');
  if (!container) return;

  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = `
      <div class="siswa-empty-state" style="padding: 28px 12px; background: #FFFFFF; border-radius: 10px; border: 1px dashed #E2E8F0;">
        <span class="siswa-empty-icon" style="font-size: 1.8rem;">📝</span>
        <div style="font-size: 0.92rem; font-weight: 700; color: var(--text2);">Belum ada daftar pertanyaan pada materi ini</div>
        <small style="color: var(--text3);">Data master pertanyaan atau jawaban untuk ${escapeHtml((materiItem && materiItem.title) || 'materi ini')} tidak tersedia.</small>
      </div>
    `;
    return;
  }

  const slimCardsHtml = items.map((item, idx) => {
    const idSoalLabel = item.id_soal ? `Soal #${item.id_soal}` : `Soal #${idx + 1}`;
    const pertanyaanText = item.pertanyaan ? String(item.pertanyaan).trim() : `Pertanyaan nomor ${item.id_soal || idx + 1}`;
    const jawabanSiswa = item.hasAnswer ? item.jawaban_siswa : '(Belum menjawab)';
    const nilaiNlp = formatNlpScoreDisplay(item.nilai_nlp);

    return `
      <div class="slim-individual-card theme-purple">
        <div class="slim-individual-head">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span class="badge badge-purple" style="margin: 0; font-size: 0.74rem; padding: 3px 9px;">${escapeHtml(idSoalLabel)}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            ${nilaiNlp !== null ? `<span class="badge" style="margin: 0; font-size: 0.72rem; padding: 2px 8px; border-radius: 99px; font-weight: 800; background: #E0F2FE; color: #0369A1; border: 1px solid #BAE6FD;">🎯 NLP: ${escapeHtml(nilaiNlp)}/4</span>` : ''}
            <span class="slim-individual-meta">#${idx + 1}</span>
          </div>
        </div>
        <div class="slim-individual-row">
          <span class="slim-individual-label">Pertanyaan</span>
          <span class="slim-individual-q">${escapeHtml(pertanyaanText)}</span>
        </div>
        <div class="slim-individual-row">
          <span class="slim-individual-label">Jawaban</span>
          <span class="slim-individual-a ${item.hasAnswer ? '' : 'is-empty'}">${escapeHtml(jawabanSiswa)}</span>
        </div>
      </div>
    `;
  }).join('');
  container.innerHTML = `<div class="slim-individual-list">${slimCardsHtml}</div>`;
}

// ==========================================
// SISTEM PENILAIAN NLP CLIENT-SIDE ('use' + CACHE 2 LAPIS)
// ==========================================
const ADMIN_NLP_ENGINE_MODE = 'use';
const ADMIN_USE_CACHE_DURATION_MS = 2 * 60 * 60 * 1000; // 2 jam RAM/WebGL TTL
const ADMIN_USE_LOAD_TIMEOUT_MS = 60 * 1000; // 60 detik timeout pemuatan model
const ADMIN_ECO_NLP_MODEL_META_KEY = 'eco_use_model_meta';
const ADMIN_USE_INDEXEDDB_URL = 'indexeddb://eco-use-model';
const ADMIN_TFJS_CDN_URL = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
const ADMIN_USE_CDN_URL = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/universal-sentence-encoder@1.3.3/dist/universal-sentence-encoder.min.js';

const NLP_RUBRIC_LEVELS = [
  {
    level: 4,
    label: 'Jawaban Lengkap dan Benar',
    desc: 'Jawaban lengkap dan benar: mendefinisikan cuaca dengan tepat; menyatakan cuaca berlangsung atau berubah dalam waktu singkat; mendefinisikan iklim sebagai pola/rerata cuaca jangka panjang; serta mendefinisikan musim sebagai bagian tahun dengan ciri cuaca tertentu. Hubungan antargagasan runtut, data/perhitungan tepat bila diminta, dan alasan sesuai konteks.'
  },
  {
    level: 3,
    label: 'Jawaban Cukup Tepat Tetapi Belum Utuh',
    desc: 'Jawaban cukup tepat tetapi belum utuh. Memuat dua atau tiga bagian penting, misalnya mendefinisikan cuaca dengan tepat dan menyatakan cuaca berlangsung atau berubah dalam waktu singkat; namun mendefinisikan iklim sebagai pola/rerata cuaca jangka panjang atau mendefinisikan musim sebagai bagian tahun dengan ciri cuaca tertentu belum dijelaskan secara memadai. Masih ada kekurangan pada penalaran atau kelengkapan.'
  },
  {
    level: 2,
    label: 'Jawaban Sangat Terbatas',
    desc: 'Jawaban sangat terbatas. Hanya menunjukkan satu unsur relevan, misalnya mendefinisikan cuaca dengan tepat, tetapi belum mengembangkan penjelasan, perbandingan, langkah, atau manfaat yang diminta. Dapat mengandung kekeliruan atau alasan yang tidak jelas.'
  },
  {
    level: 1,
    label: 'Tidak Diberikan atau Tidak Relevan',
    desc: 'Jawaban tidak diberikan atau tidak relevan dengan pertanyaan; belum menunjukkan pemahaman atau indikator yang dapat dinilai benar.'
  }
];

let _adminUseModel = null;
let _adminUseModelLoadedAt = 0;

function openNlpRubricModal() {
  const listEl = document.getElementById('nlpRubricList');
  if (listEl) {
    listEl.innerHTML = NLP_RUBRIC_LEVELS.map(r => `
      <div class="nlp-rubric-item lvl-${r.level}">
        <div class="nlp-rubric-head">
          <span class="badge" style="margin: 0; font-size: 0.74rem; padding: 3px 9px;">${r.level}</span>
          <span>${escapeHtml(r.label)}</span>
        </div>
        <p class="nlp-rubric-desc">${escapeHtml(r.desc)}</p>
      </div>
    `).join('');
  }

  const modal = document.getElementById('nlpRubricModal');
  if (!modal) return;
  modal.style.display = 'flex';
  void modal.offsetHeight;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

function handleNlpRubricBackdropClick(e) {
  if (e && e.target && e.target.id === 'nlpRubricModal') {
    closeNlpRubricModal();
  }
}

function closeNlpRubricModal() {
  const modal = document.getElementById('nlpRubricModal');
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    if (!modal.classList.contains('show')) {
      modal.style.display = 'none';
    }
  }, 260);
}

function loadAdminScriptDynamic(src) {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') return resolve();
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Gagal mengunduh pustaka AI (${src}). Periksa koneksi internet.`));
    document.head.appendChild(script);
  });
}

function getAdminNlpModelMeta() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(`${ADMIN_ECO_NLP_MODEL_META_KEY}_${ADMIN_NLP_ENGINE_MODE}`) ||
      localStorage.getItem(ADMIN_ECO_NLP_MODEL_META_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? parsed : null;
  } catch (e) {
    return null;
  }
}

function saveAdminNlpModelMeta() {
  try {
    if (typeof localStorage === 'undefined') return;
    const meta = {
      modelName: 'eco-use-model',
      modelMode: ADMIN_NLP_ENGINE_MODE,
      indexedDbKey: ADMIN_USE_INDEXEDDB_URL,
      savedAt: Date.now(),
      version: '1.0.0'
    };
    const serialized = JSON.stringify(meta);
    localStorage.setItem(`${ADMIN_ECO_NLP_MODEL_META_KEY}_${ADMIN_NLP_ENGINE_MODE}`, serialized);
    localStorage.setItem(ADMIN_ECO_NLP_MODEL_META_KEY, serialized);
  } catch (e) {}
}

function clearAdminNlpModelMeta() {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(`${ADMIN_ECO_NLP_MODEL_META_KEY}_${ADMIN_NLP_ENGINE_MODE}`);
    localStorage.removeItem(ADMIN_ECO_NLP_MODEL_META_KEY);
  } catch (e) {}
}

function destroyAdminUSEModelCache() {
  if (_adminUseModel) {
    try {
      if (typeof _adminUseModel.dispose === 'function') {
        _adminUseModel.dispose();
      }
    } catch (e) {}
  }
  _adminUseModel = null;
  _adminUseModelLoadedAt = 0;
}

async function purgeAdminNlpModelStorage() {
  destroyAdminUSEModelCache();
  try {
    if (typeof tf !== 'undefined' && tf.io && typeof tf.io.removeModel === 'function') {
      await tf.io.removeModel(ADMIN_USE_INDEXEDDB_URL);
    }
  } catch (e) {}
  clearAdminNlpModelMeta();
}

async function warmUpAdminUSEModel(model) {
  if (!model || typeof model.embed !== 'function') return;
  const emb = await model.embed(['pemanasan model bahasa indonesia']);
  try {
    const data = await emb.data();
    if (!data || data.length === 0 || Number.isNaN(data[0])) {
      throw new Error('NLP_WARMUP_NAN');
    }
  } finally {
    if (emb && typeof emb.dispose === 'function') emb.dispose();
  }
}

/**
 * Memuat model Universal Sentence Encoder ('use') dengan Cache 2 Lapis (RAM 2 jam + IndexedDB 'eco-use-model')
 * serta Self-Healing bila cache IndexedDB rusak atau gagal.
 */
async function getOrLoadAdminUSEModel(onStatus, forceReload = false) {
  const now = Date.now();
  if (!forceReload && _adminUseModel && (now - _adminUseModelLoadedAt < ADMIN_USE_CACHE_DURATION_MS)) {
    return _adminUseModel;
  }
  if (_adminUseModel && (forceReload || (now - _adminUseModelLoadedAt >= ADMIN_USE_CACHE_DURATION_MS))) {
    destroyAdminUSEModelCache();
  }

  const updateStatus = (title, sub) => {
    if (typeof onStatus === 'function') onStatus(title, sub);
  };

  const loadPipeline = async () => {
    if (typeof tf === 'undefined') {
      updateStatus('Menyiapkan Pustaka AI...', 'Mengunduh TensorFlow.js v4.22.0...');
      await loadAdminScriptDynamic(ADMIN_TFJS_CDN_URL);
    }
    if (typeof use === 'undefined') {
      updateStatus('Menyiapkan Pustaka AI...', 'Mengunduh Universal Sentence Encoder v1.3.3...');
      await loadAdminScriptDynamic(ADMIN_USE_CDN_URL);
    }
    if (typeof use === 'undefined' || typeof use.load !== 'function') {
      throw new Error('Pustaka Universal Sentence Encoder (use) gagal dimuat.');
    }

    let model = null;

    // Lapis 1: Periksa IndexedDB lokal ('indexeddb://eco-use-model')
    if (!forceReload && typeof tf !== 'undefined' && tf.io && typeof tf.io.listModels === 'function') {
      try {
        updateStatus('Memeriksa Cache Model NLP...', 'Mencari model USE di penyimpanan lokal IndexedDB...');
        const models = await tf.io.listModels();
        if (models && models[ADMIN_USE_INDEXEDDB_URL]) {
          updateStatus('Memuat Model NLP Lokal...', 'Memuat Universal Sentence Encoder dari cache IndexedDB (~1–2 detik)...');
          model = await use.load({ modelUrl: ADMIN_USE_INDEXEDDB_URL });
          await warmUpAdminUSEModel(model);
          if (!getAdminNlpModelMeta()) saveAdminNlpModelMeta();
        }
      } catch (idbErr) {
        console.warn('[Admin NLP] Cache IndexedDB gagal/korup, membersihkan cache lokal & memuat ulang dari server:', idbErr);
        await purgeAdminNlpModelStorage();
        model = null;
      }
    }

    // Unduh pertama kali (atau reload bersih) dari CDN/server lalu simpan ke IndexedDB
    if (!model) {
      updateStatus('Memuat Model NLP dari Server...', 'Mengunduh model AI Universal Sentence Encoder (~30 MB) untuk pertama kali. Mohon tunggu...');
      model = await use.load();
      await warmUpAdminUSEModel(model);

      try {
        if (model && typeof model.save === 'function') {
          await model.save(ADMIN_USE_INDEXEDDB_URL);
          saveAdminNlpModelMeta();
        } else if (model && model.model && typeof model.model.save === 'function') {
          await model.model.save(ADMIN_USE_INDEXEDDB_URL);
          saveAdminNlpModelMeta();
        }
      } catch (saveErr) {
        console.warn('[Admin NLP] Model gagal disimpan ke IndexedDB, tetap berjalan dari memori:', saveErr);
      }
    }

    _adminUseModel = model;
    _adminUseModelLoadedAt = Date.now();
    return model;
  };

  let timerId = null;
  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => {
      reject(new Error('Pemuatan model NLP melebihi batas waktu (60 detik). Periksa koneksi internet Anda.'));
    }, ADMIN_USE_LOAD_TIMEOUT_MS);
  });

  try {
    return await Promise.race([loadPipeline(), timeoutPromise]);
  } finally {
    if (timerId) clearTimeout(timerId);
  }
}

async function computeAdminSemanticSimilarity(studentText, idealText, model) {
  if (!studentText || !studentText.trim() || !idealText || !idealText.trim()) return 0;
  const embeddings = await model.embed([studentText.trim(), idealText.trim()]);
  try {
    const data = await embeddings.data();
    const dim = Math.floor(data.length / 2);
    if (!dim) throw new Error('NLP_NAN_EMPTY_DIM');

    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < dim; i++) {
      const a = data[i];
      const b = data[dim + i];
      dot += a * b;
      normA += a * a;
      normB += b * b;
    }

    if (normA <= 0 || normB <= 0 || Number.isNaN(dot) || Number.isNaN(normA) || Number.isNaN(normB)) {
      throw new Error('NLP_NAN_SIMILARITY');
    }

    const cos = dot / (Math.sqrt(normA) * Math.sqrt(normB));
    if (Number.isNaN(cos) || !Number.isFinite(cos)) {
      throw new Error('NLP_NAN_COSINE');
    }
    return Math.max(0, Math.min(1, cos));
  } finally {
    if (embeddings && typeof embeddings.dispose === 'function') {
      embeddings.dispose();
    }
  }
}

function computeAdminKeywordScore(studentText, keywords) {
  if (!Array.isArray(keywords) || keywords.length === 0) return 1.0;
  if (!studentText || !studentText.trim()) return 0.0;

  const textLower = studentText.toLowerCase();
  const stopwords = ['dan', 'yang', 'dari', 'atau', 'pada', 'ke', 'ini', 'itu', 'adalah', 'untuk', 'dengan'];
  let matched = 0;

  keywords.forEach(kw => {
    const kwLower = String(kw || '').toLowerCase().trim();
    if (!kwLower) return;
    if (textLower.includes(kwLower)) {
      matched += 1;
    } else {
      const tokens = kwLower.split(/\s+/).filter(w => w.length >= 3 && !stopwords.includes(w));
      if (tokens.length > 0) {
        const tokenMatches = tokens.filter(tok => textLower.includes(tok)).length;
        if (tokenMatches / tokens.length >= 0.5) {
          matched += 0.8;
        }
      }
    }
  });

  return Math.max(0, Math.min(1, matched / keywords.length));
}

function mapAdminCombinedScoreToLevel(combined0to1) {
  const val = Number(combined0to1);
  if (!Number.isFinite(val)) return 1;
  if (val >= 0.75) return 4;
  if (val >= 0.50) return 3;
  if (val >= 0.25) return 2;
  return 1;
}

/**
 * Mengevaluasi satu jawaban siswa dengan Self-Healing Cache:
 * Jika inferensi menghasilkan NaN / error, bersihkan IndexedDB + RAM cache, muat ulang model bersih dari server, lalu ulangi sekali.
 */
async function evaluateSingleAnswerWithSelfHealing(studentText, refData, modelRef, onStatus) {
  const idealText = (refData && refData.jawaban_ideal) ? String(refData.jawaban_ideal) : '';
  const keywords = (refData && Array.isArray(refData.kata_kunci)) ? refData.kata_kunci : [];

  let semantic = 0;
  try {
    semantic = await computeAdminSemanticSimilarity(studentText, idealText, modelRef.current);
  } catch (evalErr) {
    console.warn('[Admin NLP] Deteksi error / NaN saat inferensi, menjalankan self-healing cache & muat ulang dari server:', evalErr);
    if (typeof onStatus === 'function') {
      onStatus('Memperbaiki Cache Model NLP...', 'Model terdeteksi bermasalah (NaN/corrupt). Membersihkan cache lokal dan memuat ulang dari server...');
    }
    await purgeAdminNlpModelStorage();
    modelRef.current = await getOrLoadAdminUSEModel(onStatus, true);
    semantic = await computeAdminSemanticSimilarity(studentText, idealText, modelRef.current);
  }

  const kwScore = computeAdminKeywordScore(studentText, keywords);
  const combined = (semantic * 0.70) + (kwScore * 0.30);
  if (!Number.isFinite(combined)) {
    throw new Error('Hasil perhitungan skor NLP tidak valid (NaN).');
  }
  return mapAdminCombinedScoreToLevel(combined);
}

/**
 * Menilai seluruh jawaban siswa yang terisi pada materi aktif secara berurutan (hanya PATCH baris yang sudah ada di server)
 */
async function evaluateCurrentAnswerWithNlp() {
  const student = currentAnswerDetailStudent;
  if (!student) {
    showError('Data detail siswa belum dimuat.', 'Gagal Menilai');
    return;
  }

  const activeMatNum = normalizeMateriNum(selectedAnswerMateri || '1');
  const materiItem = DAFTAR_MATERI_ANSWER.find(m => m.id === activeMatNum) || {
    id: activeMatNum,
    key: 'materi-' + activeMatNum,
    title: getNamaMateri('materi-' + activeMatNum)
  };

  const items = currentAnswerGroupedByMateri[activeMatNum] || [];
  const patchTargets = items.filter(it => {
    const pk = it && (it.id_answer !== undefined && it.id_answer !== null && String(it.id_answer).trim() !== '' ? it.id_answer : it.id);
    return it && it.hasAnswer && pk !== undefined && pk !== null && String(pk).trim() !== '';
  });

  if (patchTargets.length === 0) {
    showError('Belum ada jawaban siswa yang terisi pada materi ini (soal yang kosong dilewati agar hanya melakukan PATCH).', 'Tidak Ada Jawaban');
    return;
  }

  const btnNlp = document.getElementById('btnEvaluateAnswerNlp');
  if (btnNlp) btnNlp.disabled = true;

  showLoading('Memuat Model NLP...', 'Memeriksa ketersediaan model Universal Sentence Encoder di IndexedDB...');

  let updatedCount = 0;
  try {
    const modelRef = {
      current: await getOrLoadAdminUSEModel((title, sub) => showLoading(title, sub), false)
    };

    for (let i = 0; i < patchTargets.length; i++) {
      const item = patchTargets[i];
      showLoading(
        `Menilai Jawaban Siswa (${i + 1}/${patchTargets.length})...`,
        `Mengevaluasi Soal #${item.id_soal} dan menyimpan nilai NLP ke server (PATCH)...`
      );

      const refData = (typeof window.getKunciJawaban === 'function' ? window.getKunciJawaban(item.id_soal) : null) || {
        jawaban_ideal: item.pertanyaan || '',
        kata_kunci: []
      };

      const levelScore = await evaluateSingleAnswerWithSelfHealing(
        item.jawaban_siswa,
        refData,
        modelRef,
        (t, s) => showLoading(t, s)
      );

      const pkVal = (item.id_answer !== undefined && item.id_answer !== null && String(item.id_answer).trim() !== '')
        ? item.id_answer
        : item.id;

      await EcoApi.patch('answer', 'id_answer', pkVal, { nilai_nlp: levelScore });
      item.nilai_nlp = levelScore;
      updatedCount += 1;
    }

    renderAnswerDetailItemsList(items, materiItem);
    hideOverlay();
  } catch (err) {
    console.error('[evaluateCurrentAnswerWithNlp Error]', err);
    if (updatedCount > 0) {
      renderAnswerDetailItemsList(items, materiItem);
    }
    showError(
      err.message || 'Gagal memproses penilaian NLP atau menyimpan ke server.',
      updatedCount > 0 ? `Sebagian Tersimpan (${updatedCount}/${patchTargets.length})` : 'Penilaian NLP Gagal'
    );
  } finally {
    if (btnNlp) {
      btnNlp.disabled = patchTargets.length === 0;
    }
  }
}

/**
 * Menutup tampilan detail dan kembali ke tabel daftar siswa di menu Jawaban (ANSWER)
 */
function closeDetailAnswer() {
  currentAnswerDetailStudent = null;
  currentAnswerGroupedByMateri = {};
  const listView = document.getElementById('answerListView');
  const detailView = document.getElementById('answerDetailView');
  if (detailView) detailView.style.display = 'none';
  if (listView) {
    listView.style.display = 'block';
    renderAnswerSiswaTable(currentSiswaList);
  }
  cancelCloseAccordion();
}

// Ekspos controller Answer ke global window
window.selectAnswerMateri = selectAnswerMateri;
window.backToAnswerMateri = backToAnswerMateri;
window.downloadAnswerCurrentMateriPdf = downloadAnswerCurrentMateriPdf;
window.renderAnswerSiswaTable = renderAnswerSiswaTable;
window.handleSearchAnswerSiswa = handleSearchAnswerSiswa;
window.loadAnswerSiswaTable = loadAnswerSiswaTable;
window.viewDetailAnswer = viewDetailAnswer;
window.closeDetailAnswer = closeDetailAnswer;
window.downloadAnswerMateriPdf = downloadAnswerMateriPdf;
window.evaluateCurrentAnswerWithNlp = evaluateCurrentAnswerWithNlp;
window.openNlpRubricModal = openNlpRubricModal;
window.closeNlpRubricModal = closeNlpRubricModal;
window.handleNlpRubricBackdropClick = handleNlpRubricBackdropClick;
window.handleAccordionHeaderClick = handleAccordionHeaderClick;
window.openAccordion = openAccordion;
window.closeAccordion = closeAccordion;
window.promptCloseAccordion = promptCloseAccordion;
window.cancelCloseAccordion = cancelCloseAccordion;
window.confirmCloseAccordion = confirmCloseAccordion;

// ==========================================
// TAHAP 3: DISKUSI SISWA (DISCUSS)
// ==========================================
let currentDiscussKelompokList = [];
let currentDiscussDetailPayload = null;

/**
 * Fungsi deduplikasi daftar kelompok dari tabel 'kelompok_discuss'
 * Menghilangkan nama kelompok yang ganda/duplikat dan menggabungkan anggota jika ada variasi.
 * @param {Array} rawGroups
 * @returns {Array}
 */
function deduplicateKelompokDiscuss(rawGroups) {
  if (!Array.isArray(rawGroups)) return [];
  const map = new Map();

  rawGroups.forEach(g => {
    const rawName = (g.nama_kelompok || '').trim();
    if (!rawName) return;
    const cleanMat = String(g.id_materi !== undefined && g.id_materi !== null ? g.id_materi : '1').replace(/\D+/g, '') || '1';
    const key = `${rawName.toLowerCase()}_mat_${cleanMat}`;

    if (!map.has(key)) {
      map.set(key, { ...g, nama_kelompok: rawName, id_materi: cleanMat });
    } else {
      const existing = map.get(key);
      // Gabungkan nama anggota jika ada anggota baru yang belum tercatat
      if (g.nama_anggota && existing.nama_anggota) {
        const exMembers = existing.nama_anggota.split(',').map(m => m.trim()).filter(Boolean);
        const newMembers = g.nama_anggota.split(',').map(m => m.trim()).filter(Boolean);
        const merged = Array.from(new Set([...exMembers, ...newMembers]));
        existing.nama_anggota = merged.join(', ');
      } else if (!existing.nama_anggota && g.nama_anggota) {
        existing.nama_anggota = g.nama_anggota;
      }

      if (!existing.kelas && g.kelas) existing.kelas = g.kelas;
      if (!existing.sekolah && g.sekolah) existing.sekolah = g.sekolah;
      if (!existing.id_kelompok && g.id_kelompok) existing.id_kelompok = g.id_kelompok;
      if (!existing.keterangan && g.keterangan) {
        existing.keterangan = g.keterangan;
      } else if (g.keterangan && typeof g.keterangan === 'string' && g.keterangan.trim().length > (existing.keterangan ? String(existing.keterangan).trim().length : 0)) {
        existing.keterangan = g.keterangan;
      }
    }
  });

  return Array.from(map.values());
}

/**
 * Mengurai field keterangan kelompok menjadi daftar pasangan { nama, peran }
 * Format target tampilan UI: Nama [Peran] (Tanpa Emoticon)
 * @param {string|object} keterangan - Isi field keterangan dari tabel kelompok_discuss
 * @param {object} group - Objek data kelompok
 * @returns {Array<{ nama: string, peran: string }>}
 */
function parsePembagianPeran(keterangan, group = {}) {
  if (!keterangan) return [];

  let parsed = null;
  if (typeof keterangan === 'object') {
    parsed = keterangan;
  } else if (typeof keterangan === 'string') {
    const trimmed = keterangan.trim();
    if (!trimmed || trimmed === '{}' || trimmed === 'null' || trimmed === '[]') {
      return [];
    }
    try {
      parsed = JSON.parse(trimmed);
    } catch (e) {
      parsed = null;
    }
  }

  // Bangun peta ID siswa -> Nama siswa dari data lokal dan kelompok
  const idToNameMap = {};
  if (Array.isArray(currentSiswaList)) {
    currentSiswaList.forEach(s => {
      if (s.id_siswa) idToNameMap[String(s.id_siswa).trim()] = s.nama;
    });
  }

  let groupIds = [];
  try {
    groupIds = typeof group.id_anggota === 'string' ? JSON.parse(group.id_anggota) : (group.id_anggota || []);
  } catch (e) {
    groupIds = [];
  }
  if (!Array.isArray(groupIds)) groupIds = [];
  if (group.id_siswa && !groupIds.includes(group.id_siswa)) {
    groupIds.unshift(group.id_siswa);
  }

  const groupNames = (group.nama_anggota || '').split(',').map(n => n.replace(/\s*\(Kamu\)\s*/gi, '').trim()).filter(Boolean);
  groupIds.forEach((id, idx) => {
    if (groupNames[idx] && !idToNameMap[id]) {
      idToNameMap[id] = groupNames[idx];
    }
  });

  const roles = [];

  // Kasus 1: Object Key-Value (misal: { "S-123": "Ketua", "S-456": "Notulis" } atau { "Aisyah": "Ketua" })
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    Object.keys(parsed).forEach(key => {
      const rawRole = String(parsed[key] || '').trim();
      if (!rawRole) return;

      const cleanKey = String(key).trim();
      const resolvedName = idToNameMap[cleanKey] || cleanKey;
      roles.push({
        nama: resolvedName,
        peran: rawRole
      });
    });
  }
  // Kasus 2: Array Object (misal: [ { nama: "Aisyah", peran: "Ketua" } ])
  else if (Array.isArray(parsed)) {
    parsed.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        const nama = item.nama || idToNameMap[item.id_siswa] || item.id_siswa || '';
        const peran = item.peran || item.role || '';
        if (nama && peran) roles.push({ nama, peran });
      }
    });
  }
  // Kasus 3: String teks terformat
  else if (typeof keterangan === 'string') {
    const lines = keterangan.split(/[\n,;]+/).map(l => l.trim()).filter(Boolean);
    lines.forEach(line => {
      const bracketMatch = line.match(/^(.+?)\s*\[(.+?)\]$/);
      if (bracketMatch) {
        roles.push({ nama: bracketMatch[1].trim(), peran: bracketMatch[2].trim() });
        return;
      }
      const colonMatch = line.match(/^(.+?)\s*[:=]\s*(.+)$/);
      if (colonMatch) {
        roles.push({ nama: colonMatch[1].trim(), peran: colonMatch[2].trim() });
      }
    });
  }

  return roles;
}

/**
 * Menentukan class warna badge untuk peran tugas (warna-warni agar mudah dikenali)
 * @param {string} peran - Nama peran
 * @returns {string} class css warna peran
 */
function getRoleColorClass(peran) {
  if (!peran) return 'role-default';
  const clean = String(peran).toLowerCase().trim();

  if (clean.includes('ketua')) return 'role-ketua';
  if (clean.includes('notulis') || clean.includes('catat') || clean.includes('tulis')) return 'role-notulis';
  if (clean.includes('bicara') || clean.includes('present') || clean.includes('juru')) return 'role-juru-bicara';
  if (clean.includes('uji') || clean.includes('gagasan') || clean.includes('kritis')) return 'role-penguji-gagasan';
  if (clean.includes('anggota')) return 'role-anggota';

  // Variasi warna untuk peran kustom agar tetap berwarna-warni
  const colors = ['role-teal', 'role-orange', 'role-indigo', 'role-ketua', 'role-notulis'];
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
  }
  const idx = Math.abs(hash) % colors.length;
  return colors[idx];
}

/**
 * Helper untuk menentukan apakah suatu item merupakan pertanyaan yang bukan dari soal asli
 * (misal pertanyaan mandiri siswa dengan id_soal mengandung 'pertanyaan', from_answer == 1, atau sumber == 'siswa')
 * @param {object} item
 * @returns {boolean}
 */
function isPertanyaanBukanSoal(item) {
  if (!item) return false;
  const rawIdSoal = String(item.id_soal || '').toLowerCase();
  const rawSumber = String(item.sumber || '').toLowerCase();
  const isFromAnswer = Number(item.from_answer) === 1;
  return rawIdSoal.includes('pertanyaan') || isFromAnswer || rawSumber === 'siswa';
}

/**
 * Fungsi pembanding (comparator) untuk pengurutan soal & pertanyaan di DISCUSS dan EXPLAIN:
 * 1. Urutkan berdasarkan id_materi (1, 2, 3...)
 * 2. Soal asli (0) harus selalu berada di ATAS pertanyaan siswa / bukan soal (1)
 * 3. Jika jenisnya sama, urutkan berdasarkan angka nomor soal / pertanyaan secara numerik (1, 2, 3...)
 * @param {object} a
 * @param {object} b
 * @returns {number}
 */
function compareSoalDanPertanyaan(a, b) {
  const matA = Number(a.id_materi) || 0;
  const matB = Number(b.id_materi) || 0;
  if (matA !== matB) return matA - matB;

  // Soal asli (0) harus selalu di atas pertanyaan siswa / bukan soal (1)
  const isBukanSoalA = isPertanyaanBukanSoal(a) ? 1 : 0;
  const isBukanSoalB = isPertanyaanBukanSoal(b) ? 1 : 0;
  if (isBukanSoalA !== isBukanSoalB) {
    return isBukanSoalA - isBukanSoalB;
  }

  // Jika jenisnya sama, urutkan berdasarkan angka nomor urutnya
  const numA = parseInt(String(a.id_soal || '').replace(/\D+/g, ''), 10) || 0;
  const numB = parseInt(String(b.id_soal || '').replace(/\D+/g, ''), 10) || 0;
  if (numA !== numB) return numA - numB;

  return String(a.id_soal || '').localeCompare(String(b.id_soal || ''));
}

/**
 * Membangun katalog anggota kelompok terurut dari objek kelompok (id_anggota + nama_anggota)
 * dan data siswa kelas aktif (currentSiswaList).
 * @param {object} group
 * @returns {{ members: Array<{id_siswa: string, nama: string}>, idToName: Map<string, string> }}
 */
function buildGroupMembersCatalog(group) {
  const idToName = new Map();
  if (Array.isArray(currentSiswaList)) {
    currentSiswaList.forEach(s => {
      if (s && s.id_siswa && s.nama) {
        idToName.set(String(s.id_siswa).trim(), String(s.nama).trim());
      }
    });
  }

  let rawIds = [];
  if (group && group.id_anggota) {
    try {
      rawIds = typeof group.id_anggota === 'string' ? JSON.parse(group.id_anggota) : group.id_anggota;
    } catch (e) {
      rawIds = [];
    }
  }
  if (!Array.isArray(rawIds)) rawIds = [];

  let rawNames = [];
  if (group && group.nama_anggota) {
    rawNames = (Array.isArray(group.nama_anggota) ? group.nama_anggota : String(group.nama_anggota).split(','))
      .map(n => String(n).replace(/\s*\(Kamu\)\s*/gi, '').trim())
      .filter(Boolean);
  }

  const members = [];
  const seenIds = new Set();

  if (rawIds.length > 0) {
    rawIds.forEach((id, idx) => {
      const sid = String(id || '').trim();
      if (!sid || seenIds.has(sid)) return;
      seenIds.add(sid);
      const mappedName = (rawNames[idx] && rawNames[idx] !== sid) ? rawNames[idx] : (idToName.get(sid) || rawNames[idx] || sid);
      idToName.set(sid, mappedName);
      members.push({ id_siswa: sid, nama: mappedName });
    });
  }

  if (members.length === 0 && rawNames.length > 0) {
    rawNames.forEach((nm, idx) => {
      const foundSiswa = Array.isArray(currentSiswaList)
        ? currentSiswaList.find(s => (s.nama || '').trim().toLowerCase() === nm.toLowerCase())
        : null;
      const sid = foundSiswa ? String(foundSiswa.id_siswa).trim() : `name:${idx}:${nm.toLowerCase()}`;
      if (!seenIds.has(sid)) {
        seenIds.add(sid);
        idToName.set(sid, nm);
        members.push({ id_siswa: sid, nama: nm });
      }
    });
  }

  if (group && group.id_siswa) {
    const creatorSid = String(group.id_siswa).trim();
    if (creatorSid && !seenIds.has(creatorSid)) {
      seenIds.add(creatorSid);
      const creatorName = idToName.get(creatorSid) || rawNames[0] || creatorSid;
      idToName.set(creatorSid, creatorName);
      members.push({ id_siswa: creatorSid, nama: creatorName });
    }
  }

  return { members, idToName };
}

function hasValidStudentId(row) {
  if (!row || row.id_siswa === null || row.id_siswa === undefined) return false;
  const sid = String(row.id_siswa).trim();
  return sid !== '' && sid.toLowerCase() !== 'null' && sid.toLowerCase() !== 'undefined';
}

function isStudentQuestionId(item) {
  return Boolean(item && String(item.id_soal || '').toLowerCase().includes('pertanyaan'));
}

/**
 * Mengambil daftar master 10 pertanyaan wajib per materi dari soal-essay.js (ANSWER_ESSAY25).
 * @param {string|number} matNum
 * @returns {Array}
 */
function getMasterQuestionsForMateri(matNum) {
  if (matNum === null || matNum === undefined || String(matNum).trim() === '') return [];
  const cleanMat = Number(normalizeMateriNum(matNum));
  if (!cleanMat) return [];

  if (typeof window !== 'undefined' && typeof window.getQuestionsByMaterial === 'function') {
    const res = window.getQuestionsByMaterial(cleanMat);
    if (Array.isArray(res) && res.length > 0) return res;
  }

  const masterList = (typeof window !== 'undefined' && Array.isArray(window.ANSWER_ESSAY25))
    ? window.ANSWER_ESSAY25
    : (typeof ANSWER_ESSAY25 !== 'undefined' && Array.isArray(ANSWER_ESSAY25) ? ANSWER_ESSAY25 : []);

  return masterList.filter(q => Number(q && q.mat) === cleanMat);
}

/**
 * Memisahkan & mengelompokkan baris DISCUSS / EXPLAIN menjadi:
 * 1. mainQuestions: seluruh 10 pertanyaan utama wajib dari master soal-essay.js (plus baris non-pertanyaan-siswa),
 *    tetap ditampilkan meski belum ada jawaban valid (baris id_siswa === null tetap diabaikan sebagai jawaban)
 * 2. studentQuestions: pertanyaan dengan id_soal.includes('pertanyaan') yang ditampilkan individual per siswa
 */
function splitStageRowsMainAndStudent(rows, group, fallbackAnswerText = '(Belum menjawab)', masterMatNum = null) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const catalog = buildGroupMembersCatalog(group);
  const memberOrder = new Map();
  catalog.members.forEach((m, idx) => memberOrder.set(m.id_siswa, idx));

  const mainQMap = new Map();
  const studentQMap = new Map();

  // Pre-seed seluruh 10 pertanyaan utama wajib per materi dari master ANSWER_ESSAY25
  const hasMasterMat = masterMatNum !== null && masterMatNum !== undefined && String(masterMatNum).trim() !== '';
  const cleanMasterMat = hasMasterMat ? normalizeMateriNum(masterMatNum) : '';
  if (cleanMasterMat) {
    const masterQuestions = getMasterQuestionsForMateri(cleanMasterMat);
    masterQuestions.forEach((mq, mIdx) => {
      const soalIdStr = mq && mq.id_soal !== undefined && mq.id_soal !== null ? String(mq.id_soal).trim() : String(mIdx + 1);
      if (!soalIdStr) return;
      const qKey = `mat_${cleanMasterMat}_soal_${soalIdStr}`;
      if (!mainQMap.has(qKey)) {
        mainQMap.set(qKey, {
          id_materi: cleanMasterMat,
          id_soal: soalIdStr,
          pertanyaan: mq.q || mq.pertanyaan || `Pertanyaan nomor ${soalIdStr}`,
          topic: mq.topic || '',
          sumber: 'master',
          answersByStudent: new Map(),
          notesList: []
        });
      }
    });
  }

  safeRows.forEach((item, rawIdx) => {
    if (!item || typeof item !== 'object') return;
    const rawMateri = item.id_materi !== undefined && item.id_materi !== null ? String(item.id_materi).trim() : '';
    const cleanMateri = rawMateri ? normalizeMateriNum(rawMateri) : (cleanMasterMat || '0');
    const rawSoal = item.id_soal !== undefined && item.id_soal !== null ? String(item.id_soal).trim() : '';

    if (isStudentQuestionId(item)) {
      if (!hasValidStudentId(item)) return;
      const sid = String(item.id_siswa).trim();
      const qSubKey = rawSoal || String(item.pertanyaan || rawIdx).trim().toLowerCase();
      const sKey = `stu_mat_${cleanMateri}_q_${qSubKey}_sid_${sid}`;
      const ansText = item.jawaban ? String(item.jawaban).trim() : '';
      const pkNum = Number(item.id_discuss || item.id_explain || 0);

      if (!studentQMap.has(sKey)) {
        studentQMap.set(sKey, {
          ...item,
          id_materi: cleanMateri,
          pertanyaan: item.pertanyaan || 'Pertanyaan dari Siswa',
          jawaban: ansText,
          _hasAnswer: Boolean(ansText),
          _pkNum: pkNum,
          _memberName: catalog.idToName.get(sid) || sid
        });
      } else {
        const ex = studentQMap.get(sKey);
        if ((!ex._hasAnswer && ansText) || (ansText && pkNum >= ex._pkNum)) {
          studentQMap.set(sKey, {
            ...item,
            id_materi: cleanMateri,
            pertanyaan: item.pertanyaan || ex.pertanyaan || 'Pertanyaan dari Siswa',
            jawaban: ansText,
            _hasAnswer: Boolean(ansText),
            _pkNum: pkNum,
            _memberName: ex._memberName
          });
        }
      }
      return;
    }

    // Pertanyaan Utama (Wajib): merge dengan master 10 soal & pertahankan meski belum ada jawaban valid
    const qKey = (cleanMateri && rawSoal)
      ? `mat_${cleanMateri}_soal_${rawSoal}`
      : (item.pertanyaan ? `mat_${cleanMateri}_q_${item.pertanyaan.trim().toLowerCase()}` : `row_${item.id_discuss || item.id_explain || rawIdx}`);

    if (!mainQMap.has(qKey)) {
      mainQMap.set(qKey, {
        ...item,
        id_materi: cleanMateri,
        answersByStudent: new Map(),
        notesList: []
      });
    }

    const qEntry = mainQMap.get(qKey);
    if ((!qEntry.pertanyaan || !String(qEntry.pertanyaan).trim()) && item.pertanyaan) {
      qEntry.pertanyaan = item.pertanyaan;
    }
    if ((!qEntry.sumber || qEntry.sumber === 'master') && item.sumber) qEntry.sumber = item.sumber;
    if (!qEntry.from_answer && item.from_answer) qEntry.from_answer = item.from_answer;

    // Jawaban & catatan hanya diambil dari baris dengan id_siswa valid (id_siswa === null diabaikan)
    if (!hasValidStudentId(item)) return;

    if (item.keterangan && String(item.keterangan).trim()) {
      const ket = String(item.keterangan).trim();
      if (!qEntry.notesList.includes(ket)) qEntry.notesList.push(ket);
    }

    const sid = String(item.id_siswa).trim();
    const newAnswer = item.jawaban ? String(item.jawaban).trim() : '';
    const rowIdNum = Number(item.id_discuss || item.id_explain || 0);
    const prev = qEntry.answersByStudent.get(sid);

    if (!prev) {
      qEntry.answersByStudent.set(sid, { jawaban: newAnswer, rowIdNum });
    } else {
      const shouldReplace = (!prev.jawaban && newAnswer) || (newAnswer && prev.jawaban && (rowIdNum >= prev.rowIdNum || newAnswer.length > prev.jawaban.length));
      if (shouldReplace) {
        qEntry.answersByStudent.set(sid, { jawaban: newAnswer, rowIdNum });
      }
    }
  });

  const mainQuestions = Array.from(mainQMap.values()).map(qEntry => {
    const memberAnswers = [];
    const seenMemberKeys = new Set();

    catalog.members.forEach((m, mIdx) => {
      seenMemberKeys.add(m.id_siswa);
      const ansObj = qEntry.answersByStudent.get(m.id_siswa) || qEntry.answersByStudent.get(`name:${mIdx}:${m.nama.toLowerCase()}`);
      const text = ansObj ? ansObj.jawaban : '';
      memberAnswers.push({
        id_siswa: m.id_siswa,
        nama: m.nama,
        jawaban: text || fallbackAnswerText,
        hasAnswer: Boolean(text)
      });
    });

    qEntry.answersByStudent.forEach((ansObj, sid) => {
      if (seenMemberKeys.has(sid)) return;
      const resolvedName = catalog.idToName.get(sid) || sid;
      const text = ansObj ? ansObj.jawaban : '';
      memberAnswers.push({
        id_siswa: sid,
        nama: resolvedName,
        jawaban: text || fallbackAnswerText,
        hasAnswer: Boolean(text)
      });
    });

    return {
      ...qEntry,
      keterangan: qEntry.notesList.join(' • '),
      memberAnswers
    };
  });

  mainQuestions.sort(compareSoalDanPertanyaan);

  const studentQuestions = Array.from(studentQMap.values());
  studentQuestions.sort((a, b) => {
    const ordA = memberOrder.has(String(a.id_siswa || '').trim()) ? memberOrder.get(String(a.id_siswa || '').trim()) : 999;
    const ordB = memberOrder.has(String(b.id_siswa || '').trim()) ? memberOrder.get(String(b.id_siswa || '').trim()) : 999;
    if (ordA !== ordB) return ordA - ordB;
    const numA = parseInt(String(a.id_soal || '').replace(/\D+/g, ''), 10) || 0;
    const numB = parseInt(String(b.id_soal || '').replace(/\D+/g, ''), 10) || 0;
    return numA - numB;
  });

  return { mainQuestions, studentQuestions };
}

function groupStageRowsByQuestion(rows, group, fallbackAnswerText = '(Belum menjawab)', masterMatNum = null) {
  return splitStageRowsMainAndStudent(rows, group, fallbackAnswerText, masterMatNum).mainQuestions;
}

/**
 * Merender daftar Pertanyaan dari Siswa secara individual dan ramping (compact)
 */
function renderSlimStudentQuestionsHtml(studentQuestions, theme = 'amber') {
  if (!Array.isArray(studentQuestions) || studentQuestions.length === 0) {
    return `
      <div class="siswa-empty-state" style="padding: 20px 10px;">
        <div style="font-size: 0.9rem; font-weight: 700;">Belum ada pertanyaan tambahan dari siswa</div>
        <small style="color: var(--text3);">Siswa belum menambahkan pertanyaan individual pada tahap ini.</small>
      </div>
    `;
  }

  const themeClass = theme === 'green' ? 'theme-green' : '';
  const badgeClass = theme === 'green' ? 'badge-green' : 'badge-amber';

  return studentQuestions.map((item, idx) => {
    const memberName = item._memberName || 'Siswa';
    const rawMateri = String(item.id_materi !== undefined && item.id_materi !== null ? item.id_materi : '1').trim();
    const cleanMat = rawMateri.replace(/\D+/g, '') || '1';
    const qText = item.pertanyaan ? String(item.pertanyaan).trim() : '(Pertanyaan kosong)';
    const aText = item._hasAnswer ? item.jawaban : '(Belum menjawab)';

    return `
      <div class="slim-individual-card ${themeClass}">
        <div class="slim-individual-head">
          <span class="badge ${badgeClass}" style="margin: 0; font-size: 0.76rem; padding: 3px 9px;">👤 ${escapeHtml(memberName)}</span>
          <span class="slim-individual-meta">#${idx + 1} • Materi ${escapeHtml(cleanMat)}</span>
        </div>
        <div class="slim-individual-row">
          <span class="slim-individual-label">❓ Tanya</span>
          <span class="slim-individual-q">${escapeHtml(qText)}</span>
        </div>
        <div class="slim-individual-row">
          <span class="slim-individual-label">💬 Jawab</span>
          <span class="slim-individual-a ${item._hasAnswer ? '' : 'is-empty'}">${escapeHtml(aText)}</span>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Mengelompokkan baris ecomedia_discuss / ecomedia_explain per (materi, id_siswa)
 * sehingga semua anggota yang mengisi tetap ditampilkan dengan nama masing-masing.
 * Baris tanpa id_siswa (id_siswa === null / kosong) diabaikan.
 */
function deduplicateEcomediaByMember(list, group, mode = 'discuss') {
  if (!Array.isArray(list)) return [];
  const catalog = buildGroupMembersCatalog(group);
  const memberOrder = new Map();
  catalog.members.forEach((m, idx) => memberOrder.set(m.id_siswa, idx));

  const map = new Map();
  list.forEach(item => {
    if (!hasValidStudentId(item)) return;
    const rawMateri = item.id_materi !== undefined && item.id_materi !== null ? String(item.id_materi).trim() : '1';
    const cleanMat = rawMateri.replace(/\D+/g, '') || '1';
    const sid = String(item.id_siswa).trim();
    const key = `eco_mat_${cleanMat}_stu_${sid}`;

    const hasContent = mode === 'explain'
      ? Boolean(item.jawaban && String(item.jawaban).trim())
      : Boolean((item.pesan && String(item.pesan).trim()) || (item.siapa && String(item.siapa).trim()) || (item.bahan_energi_limbah && String(item.bahan_energi_limbah).trim()));
    const pkNum = Number(item.id_ecomedia_discuss || item.id_ecomedia_explain || item.id_explain || 0);

    if (!map.has(key)) {
      map.set(key, {
        ...item,
        _hasContent: hasContent,
        _pkNum: pkNum,
        _memberName: catalog.idToName.get(sid) || sid
      });
    } else {
      const existing = map.get(key);
      if ((!existing._hasContent && hasContent) || (hasContent && pkNum >= existing._pkNum)) {
        map.set(key, {
          ...item,
          _hasContent: hasContent,
          _pkNum: pkNum,
          _memberName: existing._memberName
        });
      }
    }
  });

  // Hanya tampilkan anggota yang mengisi (atau baris fallback bila memiliki isi)
  const items = Array.from(map.values()).filter(item => item._hasContent);
  items.sort((a, b) => {
    const matA = Number(String(a.id_materi || '1').replace(/\D+/g, '')) || 1;
    const matB = Number(String(b.id_materi || '1').replace(/\D+/g, '')) || 1;
    if (matA !== matB) return matA - matB;
    const ordA = memberOrder.has(String(a.id_siswa || '').trim()) ? memberOrder.get(String(a.id_siswa || '').trim()) : 999;
    const ordB = memberOrder.has(String(b.id_siswa || '').trim()) ? memberOrder.get(String(b.id_siswa || '').trim()) : 999;
    if (ordA !== ordB) return ordA - ordB;
    return String(a._memberName || '').localeCompare(String(b._memberName || ''));
  });
  return items;
}

/**
 * Merender daftar versi jawaban anggota kelompok dalam 1 kartu soal DISCUSS / EXPLAIN
 */
function renderGroupedMemberAnswersHtml(memberAnswers, theme = 'amber') {
  if (!Array.isArray(memberAnswers) || memberAnswers.length === 0) {
    return `<div class="group-member-answer-row is-empty"><div class="group-member-answer-body">(Belum ada jawaban anggota)</div></div>`;
  }
  const themeClass = theme === 'green' ? 'theme-green' : '';
  return `<div class="group-member-answers">${memberAnswers.map(ma => `
    <div class="group-member-answer-row ${themeClass} ${ma.hasAnswer ? '' : 'is-empty'}">
      <div class="group-member-answer-head">
        <span class="group-member-answer-name">👤 ${escapeHtml(ma.nama)}</span>
      </div>
      <div class="group-member-answer-body">${escapeHtml(ma.jawaban)}</div>
    </div>
  `).join('')}</div>`;
}

/**
 * Fungsi pengelompokan & deduplikasi pertanyaan dan jawaban dari tabel 'discuss' per soal + per anggota
 */
function deduplicateDiscussItems(discussList, group = null) {
  return groupStageRowsByQuestion(discussList, group, '(Belum menjawab)');
}

/**
 * Fungsi deduplikasi data ecomedia_discuss per anggota per materi untuk suatu kelompok
 */
function deduplicateEcomediaDiscuss(list, group = null) {
  return deduplicateEcomediaByMember(list, group, 'discuss');
}

let selectedDiscussMateri = null;

function selectDiscussMateri(matNum) {
  selectedDiscussMateri = String(matNum || '1');
  const titleEl = document.getElementById('discussSelectedMateriTitle');
  if (titleEl) titleEl.textContent = getNamaMateri('materi-' + selectedDiscussMateri);

  const materiView = document.getElementById('discussMateriView');
  const listView = document.getElementById('discussListView');
  const detailView = document.getElementById('discussDetailView');
  if (materiView) materiView.style.display = 'none';
  if (detailView) detailView.style.display = 'none';
  if (listView) listView.style.display = 'block';

  if (currentDiscussKelompokList.length === 0) {
    loadDiscussKelompokTable(false);
  } else {
    applyDiscussFilters();
    ensureStageStatsLoaded('discuss').then(() => applyDiscussFilters());
  }
}

function backToDiscussMateri() {
  selectedDiscussMateri = null;
  currentDiscussDetailPayload = null;
  renderMateriSelectorGrid('discussMateriGrid', 'selectDiscussMateri', 'amber', 'Lihat Kelompok →', 'discuss');
  const materiView = document.getElementById('discussMateriView');
  const listView = document.getElementById('discussListView');
  const detailView = document.getElementById('discussDetailView');
  if (listView) listView.style.display = 'none';
  if (detailView) detailView.style.display = 'none';
  if (materiView) materiView.style.display = 'block';

  ensureStageStatsLoaded('discuss').then(() => {
    if (document.getElementById('discussMateriView')?.style.display !== 'none') {
      renderMateriSelectorGrid('discussMateriGrid', 'selectDiscussMateri', 'amber', 'Lihat Kelompok →', 'discuss');
    }
  });
}

/**
 * Merender daftar kelompok pada menu Diskusi Siswa (DISCUSS) sebagai row list
 * @param {Array} groups
 */
function renderDiscussKelompokTable(groups) {
  const container = document.getElementById('discussKelompokTableBody');
  const countBadge = document.getElementById('discussKelompokCount');

  if (countBadge) {
    countBadge.textContent = Array.isArray(groups) ? groups.length : 0;
  }

  if (!container) return;

  if (!Array.isArray(groups) || groups.length === 0) {
    container.innerHTML = `
      <div class="student-progress-empty">
        <div style="font-size: 1.8rem; margin-bottom: 8px;">🗣️</div>
        <div style="font-weight: 700; color: var(--text2);">Belum ada kelompok diskusi</div>
        <div style="font-size: 0.82rem; margin-top: 4px;">Belum ada kelompok diskusi pada materi ini.</div>
      </div>
    `;
    return;
  }

  const stats = materiProgressCache.stages['discuss'];
  const matStats = stats && stats.byMateri ? stats.byMateri[String(selectedDiscussMateri || '1')] : null;

  container.innerHTML = groups.map((g, index) => {
    const rawMembers = g.nama_anggota || g.id_siswa || '-';
    const cleanMembers = String(rawMembers).replace(/\s*\(Kamu\)\s*/gi, '').trim();
    const originalIndex = currentDiscussKelompokList.indexOf(g) !== -1 ? currentDiscussKelompokList.indexOf(g) : index;
    const gKey = normalizeGroupKey(g);
    const itemCount = matStats ? (matStats.itemCountsByGroup.get(gKey) || 0) : null;
    const isZero = itemCount !== null && itemCount === 0;
    const countLabel = itemCount === null
      ? 'Memuat...'
      : (itemCount > 0 ? `${itemCount} Diskusi` : 'Belum ada diskusi');

    return `
      <div class="student-progress-row ${isZero ? 'is-empty-row' : ''}">
        <div class="student-progress-left">
          <span class="student-progress-index">${index + 1}</span>
          <div class="student-progress-info">
            <div class="student-progress-name">👨‍🎓👩‍🎓 ${escapeHtml(g.nama_kelompok)}</div>
            <div class="student-progress-sub">Anggota: ${escapeHtml(cleanMembers || '-')}</div>
          </div>
        </div>
        <div class="student-progress-right">
          <span class="progress-count-badge ${isZero ? 'muted' : 'amber'}">${escapeHtml(countLabel)}</span>
          <button type="button" class="btn-detail-row" onclick="viewDetailDiscuss(${originalIndex})" title="Lihat Diskusi Kelompok & Unduh">
            🔍 Detail
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Menerapkan filter gabungan (materi terpilih + pencarian kata kunci) pada tabel kelompok DISCUSS
 */
function applyDiscussFilters() {
  const searchInput = document.getElementById('searchDiscussGroupInput');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const selectedMateri = selectedDiscussMateri || 'all';

  let filtered = currentDiscussKelompokList;

  // Filter materi berdasarkan materi yang dipilih pada langkah sebelumnya
  if (selectedMateri && selectedMateri !== 'all') {
    filtered = filtered.filter(g => {
      const gMat = String(g.id_materi !== undefined && g.id_materi !== null ? g.id_materi : '1').replace(/\D+/g, '') || '1';
      return gMat === String(selectedMateri);
    });
  }

  // Filter teks pencarian (nama kelompok atau nama anggota)
  if (query) {
    filtered = filtered.filter(g => {
      const matchName = (g.nama_kelompok || '').toLowerCase().includes(query);
      const matchMembers = (g.nama_anggota || '').toLowerCase().includes(query);
      return matchName || matchMembers;
    });
  }

  renderDiscussKelompokTable(filtered);
}

/**
 * Handler kompatibilitas saat filter materi DISCUSS dipanggil
 */
function handleFilterDiscussMateri() {
  applyDiscussFilters();
}

/**
 * Menangani filter pencarian realtime pada daftar kelompok DISCUSS
 */
function handleSearchDiscussGroup() {
  applyDiscussFilters();
}

/**
 * Mengambil data kelompok dari tabel 'kelompok_discuss' dengan GET WHERE (kelas & sekolah)
 * @param {boolean} [isManualRefresh=false]
 */
async function loadDiscussKelompokTable(isManualRefresh = false) {
  const tableBody = document.getElementById('discussKelompokTableBody');
  const countBadge = document.getElementById('discussKelompokCount');

  const savedGuru = JSON.parse(localStorage.getItem(KEY_GURU) || '{}');
  const guruKelas = (savedGuru.kelas || '').trim();
  const guruSekolah = (savedGuru.sekolah || '').trim();
  const sanitizedGuruKelas = sanitasiKelas(guruKelas);

  if (tableBody) {
    tableBody.innerHTML = `
      <div class="student-progress-empty">
        <div style="display: inline-block; font-size: 1.6rem; margin-bottom: 6px;">⏳</div>
        <div style="font-weight: 700; color: var(--text2);">Memuat data kelompok diskusi...</div>
      </div>
    `;
  }

  try {
    let rawList = [];
    const queryParams = {};
    if (guruKelas) queryParams.kelas = guruKelas;
    if (guruSekolah) queryParams.sekolah = guruSekolah;

    try {
      rawList = await EcoApi.getWhere('kelompok_discuss', queryParams);
    } catch (err) {
      console.warn('[loadDiscussKelompokTable] getWhere kelas & sekolah gagal, fallback ke EcoApi.get():', err);
      try {
        rawList = await EcoApi.get('kelompok_discuss');
      } catch (err2) {
        rawList = [];
      }
    }

    if (!Array.isArray(rawList)) rawList = [];

    // Filter lokal jika kueri mengembalikan data lintas kelas/sekolah
    const cleanSekolah = guruSekolah.toLowerCase();
    const studentIds = currentSiswaList.map(s => s.id_siswa);

    const filtered = rawList.filter(item => {
      // Jika memiliki properti kelas / sekolah
      const matchKelas = !item.kelas || !sanitizedGuruKelas || sanitasiKelas(item.kelas) === sanitizedGuruKelas || item.kelas === guruKelas;
      const matchSekolah = !item.sekolah || !cleanSekolah || item.sekolah.trim().toLowerCase() === cleanSekolah;
      // Jika memiliki id_siswa yang ada di kelas guru
      const matchStudent = item.id_siswa && studentIds.includes(item.id_siswa);

      return (matchKelas && matchSekolah) || matchStudent;
    });

    // Hilangkan duplikasi nama kelompok per materi
    const deduplicated = deduplicateKelompokDiscuss(filtered.length > 0 ? filtered : rawList);

    // Urutkan berdasarkan nomor materi lalu nama kelompok
    deduplicated.sort((a, b) => {
      const matA = Number(String(a.id_materi || '1').replace(/\D+/g, '')) || 1;
      const matB = Number(String(b.id_materi || '1').replace(/\D+/g, '')) || 1;
      if (matA !== matB) return matA - matB;
      return (a.nama_kelompok || '').localeCompare(b.nama_kelompok || '');
    });

    currentDiscussKelompokList = deduplicated;

    const searchInput = document.getElementById('searchDiscussGroupInput');
    if (isManualRefresh) {
      if (searchInput) searchInput.value = '';
    }

    applyDiscussFilters();
    ensureStageStatsLoaded('discuss', isManualRefresh).then(() => {
      if (document.getElementById('discussMateriView')?.style.display !== 'none') {
        renderMateriSelectorGrid('discussMateriGrid', 'selectDiscussMateri', 'amber', 'Lihat Kelompok →', 'discuss');
      }
      applyDiscussFilters();
    });

  } catch (err) {
    console.error('[loadDiscussKelompokTable Error]', err);
    if (tableBody) {
      tableBody.innerHTML = `
        <div class="student-progress-empty" style="color: #DC2626;">
          ⚠️ Gagal memuat data kelompok dari server: ${escapeHtml(err.message || 'Koneksi terputus')}
        </div>
      `;
    }
  }
}

/**
 * Menampilkan detail pertanyaan & jawaban diskusi kelompok (tabel 'discuss')
 * @param {number} groupIndex
 */
async function viewDetailDiscuss(groupIndex) {
  const group = currentDiscussKelompokList[groupIndex];
  if (!group) return;

  const savedGuru = JSON.parse(localStorage.getItem(KEY_GURU) || '{}');
  const guruKelas = (group.kelas || savedGuru.kelas || '-').trim();
  const guruSekolah = (group.sekolah || savedGuru.sekolah || '-').trim();

  showLoading('Memuat Diskusi Kelompok...', 'Mengambil pertanyaan dan jawaban diskusi kelompok dari server...');

  try {
    // 1. Ambil data dari tabel 'discuss' berdasarkan nama_kelompok, kelas, dan sekolah
    let rawDiscuss = [];
    const queryParams = {
      nama_kelompok: group.nama_kelompok
    };
    if (guruKelas && guruKelas !== '-') queryParams.kelas = guruKelas;
    if (guruSekolah && guruSekolah !== '-') queryParams.sekolah = guruSekolah;

    try {
      rawDiscuss = await EcoApi.getWhere('discuss', queryParams);
    } catch (err) {
      console.warn('[viewDetailDiscuss] getWhere nama_kelompok, kelas, sekolah gagal, fallback:', err);
      try {
        rawDiscuss = await EcoApi.getWhere('discuss', { nama_kelompok: group.nama_kelompok });
      } catch (err2) {
        if (group.id_kelompok) {
          rawDiscuss = await EcoApi.getWhere('discuss', { id_kelompok: group.id_kelompok });
        } else {
          rawDiscuss = [];
        }
      }
    }

    if (!Array.isArray(rawDiscuss)) rawDiscuss = [];

    const activeMatDiscuss = String(selectedDiscussMateri || String(group.id_materi || '1').replace(/\D+/g, '') || '1');
    const filteredDiscuss = rawDiscuss.filter(item => {
      if (item.id_materi === undefined || item.id_materi === null || String(item.id_materi).trim() === '') return true;
      return String(item.id_materi).replace(/\D+/g, '') === activeMatDiscuss;
    });

    // 2. Pisahkan Pertanyaan Utama (Wajib - selalu tampilkan 10 soal master) dan Pertanyaan dari Siswa (id_soal.includes('pertanyaan'))
    const { mainQuestions: uniqueDiscuss, studentQuestions: discussStudentQuestions } = splitStageRowsMainAndStudent(filteredDiscuss, group, '(Belum menjawab)', activeMatDiscuss);

    // 3. Render Header 1: Nama Kelompok, Kelas, Sekolah
    const nameEl = document.getElementById('discussDetailGroupName');
    const metaEl = document.getElementById('discussDetailGroupMeta');
    if (nameEl) nameEl.textContent = `👥 ${group.nama_kelompok}`;
    if (metaEl) metaEl.textContent = `Kelas ${guruKelas} • ${guruSekolah}`;

    // 4. Render Header 2: Daftar Nama Anggota Kelompok
    const cleanMembers = String(group.nama_anggota || group.id_siswa || '-').replace(/\s*\(Kamu\)\s*/gi, '').trim();
    const membersEl = document.getElementById('discussDetailGroupMembers');
    if (membersEl) {
      membersEl.textContent = cleanMembers || '(Belum ada anggota tercatat)';
    }

    // 5. Render Sub Header: Pembagian Peran Anggota Kelompok (JIKA field keterangan tidak kosong)
    const rolesCard = document.getElementById('discussRolesCard');
    const rolesList = document.getElementById('discussRolesList');

    let groupKeterangan = group.keterangan;

    // Jika keterangan belum ada di objek memori lokal, coba cari dari database kelompok_discuss
    if (!groupKeterangan || groupKeterangan === '{}' || groupKeterangan === 'null') {
      try {
        const checkGroups = await EcoApi.getWhere('kelompok_discuss', { nama_kelompok: group.nama_kelompok });
        if (Array.isArray(checkGroups)) {
          const foundWithKet = checkGroups.find(cg => cg.keterangan && String(cg.keterangan).trim() && String(cg.keterangan).trim() !== '{}' && String(cg.keterangan).trim() !== 'null');
          if (foundWithKet) {
            groupKeterangan = foundWithKet.keterangan;
            group.keterangan = foundWithKet.keterangan;
          }
        }
      } catch (e) {}
    }

    const parsedRoles = parsePembagianPeran(groupKeterangan, group);

    if (rolesCard && rolesList) {
      if (parsedRoles.length > 0) {
        rolesList.innerHTML = parsedRoles.map(r => {
          const colorClass = getRoleColorClass(r.peran);
          return `
            <div class="discuss-role-chip" title="${escapeHtml(r.nama)} [${escapeHtml(r.peran)}]">
              <span class="role-student-name">${escapeHtml(r.nama)}</span>
              <span class="role-bracket ${colorClass}">[${escapeHtml(r.peran)}]</span>
            </div>
          `;
        }).join('');
        rolesCard.style.display = 'block';
      } else if (groupKeterangan && typeof groupKeterangan === 'string' && groupKeterangan.trim() && groupKeterangan.trim() !== '{}' && groupKeterangan.trim() !== 'null') {
        rolesList.innerHTML = `
          <div class="discuss-role-chip">
            <span class="role-student-name">${escapeHtml(groupKeterangan.trim())}</span>
          </div>
        `;
        rolesCard.style.display = 'block';
      } else {
        rolesCard.style.display = 'none';
        rolesList.innerHTML = '';
      }
    }

    // 6. Render Blok 1: Pertanyaan Utama & Jawaban Anggota
    const countBadge = document.getElementById('discussItemCountBadge');
    if (countBadge) {
      countBadge.textContent = `${uniqueDiscuss.length} Soal`;
    }

    const container = document.getElementById('discussDetailList');
    if (container) {
      if (uniqueDiscuss.length === 0) {
        container.innerHTML = `
          <div class="siswa-empty-state" style="padding: 32px 10px;">
            <span class="siswa-empty-icon" style="font-size: 2rem;">🗣️</span>
            <div style="font-size: 0.95rem; font-weight: 700;">Belum ada hasil diskusi</div>
            <small style="color: var(--text3);">Kelompok belum memiliki daftar pertanyaan utama pada tahap DISCUSS.</small>
          </div>
        `;
      } else {
        let cards = '';
        uniqueDiscuss.forEach((item, idx) => {
          const rawMateri = String(item.id_materi !== undefined && item.id_materi !== null ? item.id_materi : '').trim();
          const normalizedMateriId = rawMateri.startsWith('materi-') ? rawMateri : (rawMateri ? 'materi-' + rawMateri : 'materi-1');
          const judulMateri = getNamaMateri(normalizedMateriId);

          const pertanyaanText = item.pertanyaan ? item.pertanyaan : `Pertanyaan nomor ${item.id_soal || idx + 1}`;
          const idSoalBadge = item.id_soal ? `Soal #${item.id_soal}` : `Soal #${idx + 1}`;
          const memberAnswersHtml = renderGroupedMemberAnswersHtml(item.memberAnswers, 'amber');

          cards += `
            <div class="read-item-card discuss" style="margin-bottom: 16px;">
              <div class="response-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 8px; flex-wrap: wrap;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span class="badge badge-amber" style="margin: 0; font-size: 0.78rem;">${escapeHtml(idSoalBadge)}</span>
                    <h4 style="margin: 0; font-family: 'Sora', sans-serif; font-size: 1.02rem; color: var(--text);">${escapeHtml(judulMateri)}</h4>
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text3); font-family: monospace; margin-top: 3px;">
                    Kode Materi: ${escapeHtml(normalizedMateriId)}
                  </div>
                </div>
                <span class="absen-badge" style="font-size: 0.75rem; background: #FFFBEB; color: #92400E; border-color: #FDE68A;">#${idx + 1}</span>
              </div>

              <!-- Blok Pertanyaan -->
              <div style="margin-bottom: 14px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--text3); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em;">❓ Pertanyaan / Topik Bahasan:</div>
                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; font-weight: 700; color: #1E293B; font-size: 0.92rem; line-height: 1.6;">
                  ${escapeHtml(pertanyaanText)}
                </div>
              </div>

              <!-- Blok Jawaban Masing-Masing Anggota -->
              <div style="margin-bottom: 12px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--text3); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em;">👥 Versi Jawaban Anggota Kelompok:</div>
                ${memberAnswersHtml}
              </div>

              ${item.keterangan ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border); font-size: 0.8rem; color: var(--text3); display: flex; align-items: center; gap: 6px;">
                  <span>📌</span> <em>${escapeHtml(item.keterangan)}</em>
                </div>
              ` : ''}
            </div>
          `;
        });
        container.innerHTML = cards;
      }
    }

    // 6B. Render Blok 2: Pertanyaan dari Siswa (id_soal.includes('pertanyaan') - Individual & Ramping)
    const sqBadge = document.getElementById('discussStudentQuestionsCountBadge');
    if (sqBadge) {
      sqBadge.textContent = `${discussStudentQuestions.length} Pertanyaan`;
    }
    const sqContainer = document.getElementById('discussStudentQuestionsList');
    if (sqContainer) {
      sqContainer.innerHTML = renderSlimStudentQuestionsHtml(discussStudentQuestions, 'amber');
    }

    // 7. Render Blok Card 2: Tanggapan Ecomedia Kelompok (tabel 'ecomedia_discuss')
    let rawEcoDiscuss = [];
    try {
      if (group.id_kelompok) {
        rawEcoDiscuss = await EcoApi.getWhere('ecomedia_discuss', { id_kelompok: group.id_kelompok });
      }
    } catch (e1) {
      console.warn('[viewDetailDiscuss] getWhere ecomedia_discuss id_kelompok failed:', e1);
    }

    if (!Array.isArray(rawEcoDiscuss) || rawEcoDiscuss.length === 0) {
      try {
        rawEcoDiscuss = await EcoApi.getWhere('ecomedia_discuss', { nama_kelompok: group.nama_kelompok });
      } catch (e2) {}
    }

    if (!Array.isArray(rawEcoDiscuss) || rawEcoDiscuss.length === 0) {
      try {
        const allEco = await EcoApi.get('ecomedia_discuss');
        if (Array.isArray(allEco)) {
          rawEcoDiscuss = allEco.filter(item =>
            (group.id_kelompok && String(item.id_kelompok) === String(group.id_kelompok)) ||
            (item.nama_kelompok && String(item.nama_kelompok).trim().toLowerCase() === group.nama_kelompok.trim().toLowerCase())
          );
        }
      } catch (e3) {}
    }
    if (!Array.isArray(rawEcoDiscuss)) rawEcoDiscuss = [];

    const filteredEcoDiscuss = rawEcoDiscuss.filter(item => {
      if (item.id_materi === undefined || item.id_materi === null || String(item.id_materi).trim() === '') return true;
      return String(item.id_materi).replace(/\D+/g, '') === activeMatDiscuss;
    });

    // Deduplikasi ecomedia_discuss per anggota per materi
    const uniqueEcoDiscuss = deduplicateEcomediaDiscuss(filteredEcoDiscuss, group);

    const ecoCountBadge = document.getElementById('discussEcomediaCountBadge');
    if (ecoCountBadge) {
      ecoCountBadge.textContent = `${uniqueEcoDiscuss.length} Tanggapan Anggota`;
    }

    const ecoContainer = document.getElementById('discussEcomediaList');
    if (ecoContainer) {
      if (uniqueEcoDiscuss.length === 0) {
        ecoContainer.innerHTML = `
          <div class="siswa-empty-state" style="padding: 32px 10px;">
            <span class="siswa-empty-icon" style="font-size: 2rem;">🌱</span>
            <div style="font-size: 0.95rem; font-weight: 700;">Belum ada tanggapan Ecomedia kelompok</div>
            <small style="color: var(--text3);">Kelompok belum mengirimkan respon analisis media lingkungan pada tahap DISCUSS.</small>
          </div>
        `;
      } else {
        let ecoCards = '';
        uniqueEcoDiscuss.forEach((item, idx) => {
          const rawMateri = String(item.id_materi !== undefined && item.id_materi !== null ? item.id_materi : '').trim();
          const normalizedMateriId = rawMateri.startsWith('materi-') ? rawMateri : (rawMateri ? 'materi-' + rawMateri : 'materi-1');
          const judulMateri = getNamaMateri(normalizedMateriId);
          const memberName = item._memberName || 'Anggota Kelompok';

          const pesan = item.pesan || '-';
          const siapa = item.siapa || '-';
          const bahanEnergiLimbah = item.bahan_energi_limbah || '-';

          ecoCards += `
            <div class="read-item-card ecomedia" style="border-left: 4.5px solid #168246; margin-bottom: 16px;">
              <div class="response-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span class="badge badge-green" style="margin: 0; font-size: 0.8rem;">👤 ${escapeHtml(memberName)}</span>
                  <h4 style="margin: 0; font-family: 'Sora', sans-serif; font-size: 1.02rem; color: var(--text);">${escapeHtml(judulMateri)}</h4>
                </div>
                <span style="font-size: 0.75rem; color: var(--text3); font-family: monospace;">#${idx + 1} • Materi ${escapeHtml(rawMateri || '1')}</span>
              </div>

              <!-- 1. Cerita & Nilai -->
              <div style="margin-bottom: 10px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--text3); margin-bottom: 3px;">📖 Cerita &amp; Nilai:</div>
                <div style="font-size: 0.85rem; color: var(--text2); background: #F0FDF4; padding: 10px 12px; border-radius: 8px; border: 1px solid #BBF7D0; line-height: 1.6; white-space: pre-line;">
                  ${escapeHtml(pesan)}
                </div>
              </div>

              <!-- 2. Siapa yang Berperan -->
              <div style="margin-bottom: 10px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--text3); margin-bottom: 3px;">👥 Siapa yang Berperan:</div>
                <div style="font-size: 0.85rem; color: var(--text2); background: #F8FAFC; padding: 10px 12px; border-radius: 8px; border: 1px solid #E2E8F0; line-height: 1.6; white-space: pre-line;">
                  ${escapeHtml(siapa)}
                </div>
              </div>

              <!-- 3. Bahan, Energi, & Limbah -->
              <div>
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--text3); margin-bottom: 3px;">⚡ Bahan, Energi, &amp; Limbah:</div>
                <div style="font-size: 0.85rem; color: var(--text2); background: #FFFBEB; padding: 10px 12px; border-radius: 8px; border: 1px solid #FDE68A; line-height: 1.6; white-space: pre-line;">
                  ${escapeHtml(bahanEnergiLimbah)}
                </div>
              </div>
            </div>
          `;
        });
        ecoContainer.innerHTML = ecoCards;
      }
    }

    // Simpan payload detail DISCUSS untuk fitur Unduh PDF
    currentDiscussDetailPayload = {
      group,
      kelas: guruKelas,
      sekolah: guruSekolah,
      members: cleanMembers || '-',
      parsedRoles,
      rawKeterangan: groupKeterangan,
      discussItems: uniqueDiscuss,
      studentQuestions: discussStudentQuestions,
      ecomediaItems: uniqueEcoDiscuss
    };

    // 8. Ganti Tampilan ke Detail View
    const listView = document.getElementById('discussListView');
    const detailView = document.getElementById('discussDetailView');
    if (listView) listView.style.display = 'none';
    if (detailView) {
      detailView.style.display = 'block';
      detailView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    hideOverlay();

  } catch (err) {
    console.error('[viewDetailDiscuss Error]', err);
    showError(err.message || 'Gagal memuat detail hasil diskusi kelompok dari server.', 'Gagal Memuat Detail');
  }
}

/**
 * Menutup tampilan detail dan kembali ke tabel daftar kelompok di menu DISCUSS
 */
function closeDetailDiscuss() {
  currentDiscussDetailPayload = null;
  const listView = document.getElementById('discussListView');
  const detailView = document.getElementById('discussDetailView');
  const rolesCard = document.getElementById('discussRolesCard');
  if (rolesCard) rolesCard.style.display = 'none';
  if (detailView) detailView.style.display = 'none';
  if (listView) {
    listView.style.display = 'block';
    applyDiscussFilters();
  }
}

// Ekspos controller Discuss ke global window
window.selectDiscussMateri = selectDiscussMateri;
window.backToDiscussMateri = backToDiscussMateri;
window.renderDiscussKelompokTable = renderDiscussKelompokTable;
window.handleSearchDiscussGroup = handleSearchDiscussGroup;
window.handleFilterDiscussMateri = handleFilterDiscussMateri;
window.applyDiscussFilters = applyDiscussFilters;
window.loadDiscussKelompokTable = loadDiscussKelompokTable;
window.viewDetailDiscuss = viewDetailDiscuss;
window.closeDetailDiscuss = closeDetailDiscuss;
window.downloadDiscussPdf = downloadDiscussPdf;

// ==========================================
// PENGELOLAAN MENU PENJELASAN SISWA (EXPLAIN)
// ==========================================
let currentExplainKelompokList = [];
let currentExplainDetailPayload = null;

/**
 * Fungsi deduplikasi daftar kelompok dari tabel 'kelompok_explain'
 * Menyatukan kelompok dengan nama yang sama, menggabungkan daftar anggota, serta mempertahankan relasi id_kelompok_discuss.
 * @param {Array} groups
 * @returns {Array}
 */
function deduplicateKelompokExplain(groups) {
  if (!Array.isArray(groups)) return [];
  const map = new Map();

  groups.forEach(g => {
    const rawName = (g.nama_kelompok || '').trim();
    if (!rawName) return;
    const cleanMat = String(g.id_materi !== undefined && g.id_materi !== null ? g.id_materi : '1').replace(/\D+/g, '') || '1';
    const key = `${rawName.toLowerCase()}_mat_${cleanMat}`;

    if (!map.has(key)) {
      map.set(key, { ...g, nama_kelompok: rawName, id_materi: cleanMat });
    } else {
      const existing = map.get(key);
      // Gabungkan nama anggota jika ada anggota baru yang belum tercatat
      if (g.nama_anggota && existing.nama_anggota) {
        const exMembers = existing.nama_anggota.split(',').map(m => m.trim()).filter(Boolean);
        const newMembers = g.nama_anggota.split(',').map(m => m.trim()).filter(Boolean);
        const merged = Array.from(new Set([...exMembers, ...newMembers]));
        existing.nama_anggota = merged.join(', ');
      } else if (!existing.nama_anggota && g.nama_anggota) {
        existing.nama_anggota = g.nama_anggota;
      }

      // Pertahankan kunci relasi id_kelompok_discuss (digunakan untuk relasi ke tabel 'explain' dan 'ecomedia_explain')
      if (!existing.id_kelompok_discuss && g.id_kelompok_discuss) {
        existing.id_kelompok_discuss = g.id_kelompok_discuss;
      }
      if (!existing.id_kelompok_explain && g.id_kelompok_explain) {
        existing.id_kelompok_explain = g.id_kelompok_explain;
      }

      if (!existing.kelas && g.kelas) existing.kelas = g.kelas;
      if (!existing.sekolah && g.sekolah) existing.sekolah = g.sekolah;

      // Pertahankan keterangan peran (prioritaskan yang memiliki isi)
      if (!existing.keterangan && g.keterangan) {
        existing.keterangan = g.keterangan;
      } else if (g.keterangan) {
        const exLen = typeof existing.keterangan === 'object' ? Object.keys(existing.keterangan).length : String(existing.keterangan).trim().length;
        const newLen = typeof g.keterangan === 'object' ? Object.keys(g.keterangan).length : String(g.keterangan).trim().length;
        if (newLen > exLen) {
          existing.keterangan = g.keterangan;
        }
      }
    }
  });

  return Array.from(map.values());
}

/**
 * Fungsi deduplikasi pertanyaan dan pemaparan dari tabel 'explain'
 * Menghilangkan pertanyaan yang berulang dalam kelompok dan mempertahankan jawaban yang paling terisi.
 * @param {Array} explainList
 * @returns {Array}
 */
function deduplicateExplainItems(explainList, group = null) {
  return groupStageRowsByQuestion(explainList, group, '(Belum menjawab)');
}

function deduplicateEcomediaExplain(list, group = null) {
  return deduplicateEcomediaByMember(list, group, 'explain');
}

let selectedExplainMateri = null;

function selectExplainMateri(matNum) {
  selectedExplainMateri = String(matNum || '1');
  const titleEl = document.getElementById('explainSelectedMateriTitle');
  if (titleEl) titleEl.textContent = getNamaMateri('materi-' + selectedExplainMateri);

  const materiView = document.getElementById('explainMateriView');
  const listView = document.getElementById('explainListView');
  const detailView = document.getElementById('explainDetailView');
  if (materiView) materiView.style.display = 'none';
  if (detailView) detailView.style.display = 'none';
  if (listView) listView.style.display = 'block';

  if (currentExplainKelompokList.length === 0) {
    loadExplainKelompokTable(false);
  } else {
    applyExplainFilters();
    ensureStageStatsLoaded('explain').then(() => applyExplainFilters());
  }
}

function backToExplainMateri() {
  selectedExplainMateri = null;
  currentExplainDetailPayload = null;
  renderMateriSelectorGrid('explainMateriGrid', 'selectExplainMateri', 'green', 'Lihat Kelompok →', 'explain');
  const materiView = document.getElementById('explainMateriView');
  const listView = document.getElementById('explainListView');
  const detailView = document.getElementById('explainDetailView');
  if (listView) listView.style.display = 'none';
  if (detailView) detailView.style.display = 'none';
  if (materiView) materiView.style.display = 'block';

  ensureStageStatsLoaded('explain').then(() => {
    if (document.getElementById('explainMateriView')?.style.display !== 'none') {
      renderMateriSelectorGrid('explainMateriGrid', 'selectExplainMateri', 'green', 'Lihat Kelompok →', 'explain');
    }
  });
}

/**
 * Merender daftar kelompok pada menu Penjelasan Siswa (EXPLAIN) sebagai row list
 * @param {Array} groups
 */
function renderExplainKelompokTable(groups) {
  const container = document.getElementById('explainKelompokTableBody');
  const countBadge = document.getElementById('explainKelompokCount');

  if (countBadge) {
    countBadge.textContent = Array.isArray(groups) ? groups.length : 0;
  }

  if (!container) return;

  if (!Array.isArray(groups) || groups.length === 0) {
    container.innerHTML = `
      <div class="student-progress-empty">
        <div style="font-size: 1.8rem; margin-bottom: 8px;">📢</div>
        <div style="font-weight: 700; color: var(--text2);">Belum ada kelompok penjelasan</div>
        <div style="font-size: 0.82rem; margin-top: 4px;">Belum ada kelompok penjelasan pada materi ini.</div>
      </div>
    `;
    return;
  }

  const stats = materiProgressCache.stages['explain'];
  const matStats = stats && stats.byMateri ? stats.byMateri[String(selectedExplainMateri || '1')] : null;

  container.innerHTML = groups.map((g, index) => {
    const rawMembers = g.nama_anggota || g.id_siswa || '-';
    const cleanMembers = String(rawMembers).replace(/\s*\(Kamu\)\s*/gi, '').trim();
    const originalIndex = currentExplainKelompokList.indexOf(g) !== -1 ? currentExplainKelompokList.indexOf(g) : index;
    const gKey = normalizeGroupKey(g);
    const itemCount = matStats ? (matStats.itemCountsByGroup.get(gKey) || 0) : null;
    const isZero = itemCount !== null && itemCount === 0;
    const countLabel = itemCount === null
      ? 'Memuat...'
      : (itemCount > 0 ? `${itemCount} Penjelasan` : 'Belum ada penjelasan');

    return `
      <div class="student-progress-row ${isZero ? 'is-empty-row' : ''}">
        <div class="student-progress-left">
          <span class="student-progress-index">${index + 1}</span>
          <div class="student-progress-info">
            <div class="student-progress-name">👨‍🎓👩‍🎓 ${escapeHtml(g.nama_kelompok)}</div>
            <div class="student-progress-sub">Anggota: ${escapeHtml(cleanMembers || '-')}</div>
          </div>
        </div>
        <div class="student-progress-right">
          <span class="progress-count-badge ${isZero ? 'muted' : 'green'}">${escapeHtml(countLabel)}</span>
          <button type="button" class="btn-detail-row" onclick="viewDetailExplain(${originalIndex})" title="Lihat Penjelasan Kelompok & Unduh">
            🔍 Detail
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Menerapkan filter gabungan (materi terpilih + pencarian kata kunci) pada tabel kelompok EXPLAIN
 */
function applyExplainFilters() {
  const searchInput = document.getElementById('searchExplainGroupInput');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const selectedMateri = selectedExplainMateri || 'all';

  let filtered = currentExplainKelompokList;

  // Filter materi berdasarkan materi yang dipilih pada langkah sebelumnya
  if (selectedMateri && selectedMateri !== 'all') {
    filtered = filtered.filter(g => {
      const gMat = String(g.id_materi !== undefined && g.id_materi !== null ? g.id_materi : '1').replace(/\D+/g, '') || '1';
      return gMat === String(selectedMateri);
    });
  }

  // Filter teks pencarian (nama kelompok atau nama anggota)
  if (query) {
    filtered = filtered.filter(g => {
      const matchName = (g.nama_kelompok || '').toLowerCase().includes(query);
      const matchMembers = (g.nama_anggota || '').toLowerCase().includes(query);
      return matchName || matchMembers;
    });
  }

  renderExplainKelompokTable(filtered);
}

/**
 * Handler kompatibilitas saat filter materi EXPLAIN dipanggil
 */
function handleFilterExplainMateri() {
  applyExplainFilters();
}

/**
 * Menangani filter pencarian realtime pada daftar kelompok EXPLAIN
 */
function handleSearchExplainGroup() {
  applyExplainFilters();
}

/**
 * Mengambil data kelompok dari tabel 'kelompok_explain' dengan GET WHERE (kelas & sekolah)
 * @param {boolean} [isManualRefresh=false]
 */
async function loadExplainKelompokTable(isManualRefresh = false) {
  const tableBody = document.getElementById('explainKelompokTableBody');
  const countBadge = document.getElementById('explainKelompokCount');

  const savedGuru = JSON.parse(localStorage.getItem(KEY_GURU) || '{}');
  const guruKelas = (savedGuru.kelas || '').trim();
  const guruSekolah = (savedGuru.sekolah || '').trim();
  const sanitizedGuruKelas = sanitasiKelas(guruKelas);

  if (tableBody) {
    tableBody.innerHTML = `
      <div class="student-progress-empty">
        <div style="display: inline-block; font-size: 1.6rem; margin-bottom: 6px;">⏳</div>
        <div style="font-weight: 700; color: var(--text2);">Memuat data kelompok penjelasan...</div>
      </div>
    `;
  }

  try {
    let rawList = [];
    const queryParams = {};
    if (guruKelas) queryParams.kelas = guruKelas;
    if (guruSekolah) queryParams.sekolah = guruSekolah;

    try {
      rawList = await EcoApi.getWhere('kelompok_explain', queryParams);
    } catch (err) {
      console.warn('[loadExplainKelompokTable] getWhere kelas & sekolah gagal, fallback ke EcoApi.get():', err);
      try {
        rawList = await EcoApi.get('kelompok_explain');
      } catch (err2) {
        rawList = [];
      }
    }

    if (!Array.isArray(rawList)) rawList = [];

    // Filter lokal jika kueri mengembalikan data lintas kelas/sekolah
    const cleanSekolah = guruSekolah.toLowerCase();
    const studentIds = currentSiswaList.map(s => s.id_siswa);

    const filtered = rawList.filter(item => {
      const matchKelas = !item.kelas || !sanitizedGuruKelas || sanitasiKelas(item.kelas) === sanitizedGuruKelas || item.kelas === guruKelas;
      const matchSekolah = !item.sekolah || !cleanSekolah || item.sekolah.trim().toLowerCase() === cleanSekolah;
      const matchStudent = item.id_siswa && studentIds.includes(item.id_siswa);

      return (matchKelas && matchSekolah) || matchStudent;
    });

    // Hilangkan duplikasi nama kelompok per materi
    const deduplicated = deduplicateKelompokExplain(filtered.length > 0 ? filtered : rawList);

    // Urutkan berdasarkan nomor materi lalu nama kelompok
    deduplicated.sort((a, b) => {
      const matA = Number(String(a.id_materi || '1').replace(/\D+/g, '')) || 1;
      const matB = Number(String(b.id_materi || '1').replace(/\D+/g, '')) || 1;
      if (matA !== matB) return matA - matB;
      return (a.nama_kelompok || '').localeCompare(b.nama_kelompok || '');
    });

    currentExplainKelompokList = deduplicated;

    const searchInput = document.getElementById('searchExplainGroupInput');
    if (isManualRefresh) {
      if (searchInput) searchInput.value = '';
    }

    applyExplainFilters();
    ensureStageStatsLoaded('explain', isManualRefresh).then(() => {
      if (document.getElementById('explainMateriView')?.style.display !== 'none') {
        renderMateriSelectorGrid('explainMateriGrid', 'selectExplainMateri', 'green', 'Lihat Kelompok →', 'explain');
      }
      applyExplainFilters();
    });

  } catch (err) {
    console.error('[loadExplainKelompokTable Error]', err);
    if (tableBody) {
      tableBody.innerHTML = `
        <div class="student-progress-empty" style="color: #DC2626;">
          ⚠️ Gagal memuat data kelompok dari server: ${escapeHtml(err.message || 'Koneksi terputus')}
        </div>
      `;
    }
  }
}

/**
 * Menampilkan detail pertanyaan & pemaparan penjelasan kelompok (tabel 'explain' & 'ecomedia_explain')
 * @param {number} groupIndex
 */
async function viewDetailExplain(groupIndex) {
  const group = currentExplainKelompokList[groupIndex];
  if (!group) return;

  const savedGuru = JSON.parse(localStorage.getItem(KEY_GURU) || '{}');
  const guruKelas = (group.kelas || savedGuru.kelas || '-').trim();
  const guruSekolah = (group.sekolah || savedGuru.sekolah || '-').trim();

  showLoading('Memuat Penjelasan Kelompok...', 'Mengambil pertanyaan dan pemaparan penjelasan kelompok dari server...');

  try {
    // 1. Ambil data dari tabel 'explain'
    // Prioritas: id_kelompok didapat dari relasi id_kelompok_discuss pada tabel kelompok_explain
    let rawExplain = [];
    const relasiIdKelompok = group.id_kelompok_discuss || group.id_kelompok_explain;

    if (relasiIdKelompok) {
      try {
        rawExplain = await EcoApi.getWhere('explain', { id_kelompok: relasiIdKelompok });
      } catch (err1) {
        console.warn('[viewDetailExplain] getWhere explain by id_kelompok gagal:', err1);
      }
    }

    if (!Array.isArray(rawExplain) || rawExplain.length === 0) {
      try {
        const queryParams = { nama_kelompok: group.nama_kelompok };
        if (guruKelas && guruKelas !== '-') queryParams.kelas = guruKelas;
        if (guruSekolah && guruSekolah !== '-') queryParams.sekolah = guruSekolah;
        rawExplain = await EcoApi.getWhere('explain', queryParams);
      } catch (err2) {
        try {
          rawExplain = await EcoApi.getWhere('explain', { nama_kelompok: group.nama_kelompok });
        } catch (err3) {
          rawExplain = [];
        }
      }
    }

    if (!Array.isArray(rawExplain) || rawExplain.length === 0) {
      try {
        const allExplain = await EcoApi.get('explain');
        if (Array.isArray(allExplain)) {
          rawExplain = allExplain.filter(item =>
            (relasiIdKelompok && String(item.id_kelompok) === String(relasiIdKelompok)) ||
            (item.nama_kelompok && String(item.nama_kelompok).trim().toLowerCase() === group.nama_kelompok.trim().toLowerCase())
          );
        }
      } catch (err4) {}
    }

    if (!Array.isArray(rawExplain)) rawExplain = [];

    const activeMatExplain = String(selectedExplainMateri || String(group.id_materi || '1').replace(/\D+/g, '') || '1');
    const filteredExplain = rawExplain.filter(item => {
      if (item.id_materi === undefined || item.id_materi === null || String(item.id_materi).trim() === '') return true;
      return String(item.id_materi).replace(/\D+/g, '') === activeMatExplain;
    });

    // 2. Pisahkan Pertanyaan Utama (Wajib - selalu tampilkan 10 soal master) dan Pertanyaan dari Siswa (id_soal.includes('pertanyaan'))
    const { mainQuestions: uniqueExplain, studentQuestions: explainStudentQuestions } = splitStageRowsMainAndStudent(filteredExplain, group, '(Belum menjawab)', activeMatExplain);

    // 3. Render Header 1: Identitas Kelompok
    const groupNameEl = document.getElementById('explainDetailGroupName');
    const groupMetaEl = document.getElementById('explainDetailGroupMeta');
    if (groupNameEl) groupNameEl.textContent = group.nama_kelompok || 'Nama Kelompok';
    if (groupMetaEl) groupMetaEl.textContent = `Kelas ${guruKelas} • ${guruSekolah}`;

    // 4. Render Header 2: Daftar Nama Anggota Kelompok
    const membersEl = document.getElementById('explainDetailGroupMembers');
    const cleanMembers = String(group.nama_anggota || group.id_siswa || '-')
      .replace(/\s*\(Kamu\)\s*/gi, '')
      .trim();
    if (membersEl) membersEl.textContent = cleanMembers || '-';

    // 5. Render Sub-Header: Pembagian Peran Anggota Kelompok (Hanya jika keterangan ada isinya)
    const parsedRoles = parsePembagianPeran(group.keterangan, group);
    const groupKeterangan = group.keterangan;
    const rolesCard = document.getElementById('explainRolesCard');
    const rolesList = document.getElementById('explainRolesList');
    if (rolesCard && rolesList) {
      if (parsedRoles && parsedRoles.length > 0) {
        rolesList.innerHTML = parsedRoles.map(item => {
          const roleColorClass = getRoleColorClass(item.peran);
          return `
            <div class="discuss-role-chip">
              <span class="role-student-name">${escapeHtml(item.nama)}</span>
              <span class="role-bracket ${roleColorClass}">[${escapeHtml(item.peran)}]</span>
            </div>
          `;
        }).join('');
        rolesCard.style.display = 'block';
      } else if (groupKeterangan && typeof groupKeterangan === 'string' && groupKeterangan.trim() && groupKeterangan.trim() !== '{}' && groupKeterangan.trim() !== 'null') {
        rolesList.innerHTML = `
          <div class="discuss-role-chip">
            <span class="role-student-name">${escapeHtml(groupKeterangan.trim())}</span>
          </div>
        `;
        rolesCard.style.display = 'block';
      } else {
        rolesCard.style.display = 'none';
        rolesList.innerHTML = '';
      }
    }

    // 6. Render Blok 1: Pertanyaan Utama & Pemaparan Anggota Kelompok (explain)
    const countBadge = document.getElementById('explainItemCountBadge');
    if (countBadge) {
      countBadge.textContent = `${uniqueExplain.length} Soal`;
    }

    const container = document.getElementById('explainDetailList');
    if (container) {
      if (uniqueExplain.length === 0) {
        container.innerHTML = `
          <div class="siswa-empty-state" style="padding: 32px 10px;">
            <span class="siswa-empty-icon" style="font-size: 2rem;">📢</span>
            <div style="font-size: 0.95rem; font-weight: 700;">Belum ada hasil pemaparan penjelasan</div>
            <small style="color: var(--text3);">Kelompok belum memiliki daftar pertanyaan utama pada tahap EXPLAIN.</small>
          </div>
        `;
      } else {
        let cards = '';
        uniqueExplain.forEach((item, idx) => {
          const rawMateri = String(item.id_materi !== undefined && item.id_materi !== null ? item.id_materi : '').trim();
          const normalizedMateriId = rawMateri.startsWith('materi-') ? rawMateri : (rawMateri ? 'materi-' + rawMateri : 'materi-1');
          const judulMateri = getNamaMateri(normalizedMateriId);

          const pertanyaanText = item.pertanyaan ? item.pertanyaan : `Pertanyaan nomor ${item.id_soal || idx + 1}`;
          const idSoalBadge = item.id_soal ? `Soal #${item.id_soal}` : `Soal #${idx + 1}`;
          const isEsai = String(item.sumber || '').toLowerCase() === 'esai';
          const memberAnswersHtml = renderGroupedMemberAnswersHtml(item.memberAnswers, 'green');

          cards += `
            <div class="read-item-card explain" style="margin-bottom: 16px;">
              <div class="response-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 8px; flex-wrap: wrap;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span class="badge badge-green" style="margin: 0; font-size: 0.78rem;">${escapeHtml(idSoalBadge)}</span>
                    <h4 style="margin: 0; font-family: 'Sora', sans-serif; font-size: 1.02rem; color: var(--text);">${escapeHtml(judulMateri)}</h4>
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text3); font-family: monospace; margin-top: 3px;">
                    Kode Materi: ${escapeHtml(normalizedMateriId)}
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  ${isEsai ? '<span class="badge" style="background:#E0F2FE; color:#0369A1; border:1px solid #BAE6FD; font-size:0.72rem; margin:0;">📖 Soal Esai</span>' : ''}
                  <span class="absen-badge" style="font-size: 0.75rem; background: #DCFCE7; color: #166534; border-color: #86EFAC;">#${idx + 1}</span>
                </div>
              </div>

              <!-- Blok Pertanyaan -->
              <div style="margin-bottom: 14px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--text3); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em;">❓ Pertanyaan / Konsep yang Dijelaskan:</div>
                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; font-weight: 700; color: #1E293B; font-size: 0.92rem; line-height: 1.6;">
                  ${escapeHtml(pertanyaanText)}
                </div>
              </div>

              <!-- Blok Jawaban Masing-Masing Anggota -->
              <div style="margin-bottom: 12px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--text3); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em;">👥 Versi Penjelasan Anggota Kelompok:</div>
                ${memberAnswersHtml}
              </div>

              ${item.keterangan ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border); font-size: 0.8rem; color: var(--text3); display: flex; align-items: center; gap: 6px;">
                  <span>📌</span> <em>${escapeHtml(item.keterangan)}</em>
                </div>
              ` : ''}
            </div>
          `;
        });
        container.innerHTML = cards;
      }
    }

    // 6B. Render Blok 2: Pertanyaan dari Siswa (id_soal.includes('pertanyaan') - Individual & Ramping)
    const sqExplainBadge = document.getElementById('explainStudentQuestionsCountBadge');
    if (sqExplainBadge) {
      sqExplainBadge.textContent = `${explainStudentQuestions.length} Pertanyaan`;
    }
    const sqExplainContainer = document.getElementById('explainStudentQuestionsList');
    if (sqExplainContainer) {
      sqExplainContainer.innerHTML = renderSlimStudentQuestionsHtml(explainStudentQuestions, 'green');
    }

    // 7. Render Blok Card 2: Tanggapan Ecomedia Kelompok (tabel 'ecomedia_explain')
    let rawEcoExplain = [];
    if (relasiIdKelompok) {
      try {
        rawEcoExplain = await EcoApi.getWhere('ecomedia_explain', { id_kelompok: relasiIdKelompok });
      } catch (e1) {
        console.warn('[viewDetailExplain] getWhere ecomedia_explain relasiIdKelompok failed:', e1);
      }
    }

    if (!Array.isArray(rawEcoExplain) || rawEcoExplain.length === 0) {
      try {
        rawEcoExplain = await EcoApi.getWhere('ecomedia_explain', { nama_kelompok: group.nama_kelompok });
      } catch (e2) {}
    }

    if (!Array.isArray(rawEcoExplain) || rawEcoExplain.length === 0) {
      try {
        const allEco = await EcoApi.get('ecomedia_explain');
        if (Array.isArray(allEco)) {
          rawEcoExplain = allEco.filter(item =>
            (relasiIdKelompok && String(item.id_kelompok) === String(relasiIdKelompok)) ||
            (item.nama_kelompok && String(item.nama_kelompok).trim().toLowerCase() === group.nama_kelompok.trim().toLowerCase())
          );
        }
      } catch (e3) {}
    }
    if (!Array.isArray(rawEcoExplain)) rawEcoExplain = [];

    const filteredEcoExplain = rawEcoExplain.filter(item => {
      if (item.id_materi === undefined || item.id_materi === null || String(item.id_materi).trim() === '') return true;
      return String(item.id_materi).replace(/\D+/g, '') === activeMatExplain;
    });

    // Deduplikasi ecomedia_explain per anggota per materi
    const uniqueEcoExplain = deduplicateEcomediaExplain(filteredEcoExplain, group);

    const ecoCountBadge = document.getElementById('explainEcomediaCountBadge');
    if (ecoCountBadge) {
      ecoCountBadge.textContent = `${uniqueEcoExplain.length} Tanggapan Anggota`;
    }

    const ecoContainer = document.getElementById('explainEcomediaList');
    if (ecoContainer) {
      if (uniqueEcoExplain.length === 0) {
        ecoContainer.innerHTML = `
          <div class="siswa-empty-state" style="padding: 32px 10px;">
            <span class="siswa-empty-icon" style="font-size: 2rem;">🌱</span>
            <div style="font-size: 0.95rem; font-weight: 700;">Belum ada tanggapan Ecomedia kelompok</div>
            <small style="color: var(--text3);">Kelompok belum mengirimkan respon analisis media lingkungan pada tahap EXPLAIN.</small>
          </div>
        `;
      } else {
        let ecoCards = '';
        uniqueEcoExplain.forEach((item, idx) => {
          const rawMateri = String(item.id_materi !== undefined && item.id_materi !== null ? item.id_materi : '').trim();
          const normalizedMateriId = rawMateri.startsWith('materi-') ? rawMateri : (rawMateri ? 'materi-' + rawMateri : 'materi-1');
          const judulMateri = getNamaMateri(normalizedMateriId);
          const memberName = item._memberName || 'Anggota Kelompok';
          const jawaban = item.jawaban || '-';

          ecoCards += `
            <div class="read-item-card ecomedia" style="border-left: 4.5px solid #168246; margin-bottom: 16px;">
              <div class="response-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span class="badge badge-green" style="margin: 0; font-size: 0.8rem;">👤 ${escapeHtml(memberName)}</span>
                  <h4 style="margin: 0; font-family: 'Sora', sans-serif; font-size: 1.02rem; color: var(--text);">${escapeHtml(judulMateri)}</h4>
                </div>
                <span style="font-size: 0.75rem; color: var(--text3); font-family: monospace;">#${idx + 1} • Materi ${escapeHtml(rawMateri || '1')}</span>
              </div>

              <!-- Tanggapan Penjelasan Siswa Ecomedia -->
              <div style="margin-bottom: 6px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--text3); margin-bottom: 4px;">💡 Paparan &amp; Tanggapan Siswa terhadap Media Lingkungan:</div>
                <div style="font-size: 0.88rem; color: #14532D; background: #F0FDF4; padding: 12px 14px; border-radius: 8px; border: 1px solid #BBF7D0; line-height: 1.6; white-space: pre-line; font-weight: 600;">
                  "${escapeHtml(jawaban)}"
                </div>
              </div>

              ${item.keterangan ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border); font-size: 0.8rem; color: var(--text3); display: flex; align-items: center; gap: 6px;">
                  <span>📌</span> <em>${escapeHtml(item.keterangan)}</em>
                </div>
              ` : ''}
            </div>
          `;
        });
        ecoContainer.innerHTML = ecoCards;
      }
    }

    // Simpan payload detail EXPLAIN untuk fitur Unduh PDF
    currentExplainDetailPayload = {
      group,
      kelas: guruKelas,
      sekolah: guruSekolah,
      members: cleanMembers || '-',
      parsedRoles,
      rawKeterangan: groupKeterangan,
      explainItems: uniqueExplain,
      studentQuestions: explainStudentQuestions,
      ecomediaItems: uniqueEcoExplain
    };

    // 8. Ganti Tampilan ke Detail View
    const listView = document.getElementById('explainListView');
    const detailView = document.getElementById('explainDetailView');
    if (listView) listView.style.display = 'none';
    if (detailView) {
      detailView.style.display = 'block';
      scrollToTop();
    }

    hideOverlay();

  } catch (err) {
    console.error('[viewDetailExplain Error]', err);
    showError(err.message || 'Gagal memuat detail hasil penjelasan kelompok dari server.', 'Gagal Memuat Detail');
  }
}

/**
 * Menutup tampilan detail dan kembali ke tabel daftar kelompok di menu EXPLAIN
 */
function closeDetailExplain() {
  currentExplainDetailPayload = null;
  const listView = document.getElementById('explainListView');
  const detailView = document.getElementById('explainDetailView');
  const rolesCard = document.getElementById('explainRolesCard');
  if (rolesCard) rolesCard.style.display = 'none';
  if (detailView) detailView.style.display = 'none';
  if (listView) {
    listView.style.display = 'block';
    applyExplainFilters();
  }
}

// Ekspos controller Explain ke global window
window.selectExplainMateri = selectExplainMateri;
window.backToExplainMateri = backToExplainMateri;
window.renderExplainKelompokTable = renderExplainKelompokTable;
window.handleSearchExplainGroup = handleSearchExplainGroup;
window.handleFilterExplainMateri = handleFilterExplainMateri;
window.applyExplainFilters = applyExplainFilters;
window.loadExplainKelompokTable = loadExplainKelompokTable;
window.viewDetailExplain = viewDetailExplain;
window.closeDetailExplain = closeDetailExplain;
window.downloadExplainPdf = downloadExplainPdf;

// ==========================================
// PENGELOLAAN MENU KARYA SISWA (CREATE)
// ==========================================
let currentCreateKaryaList = [];
let currentCreateDetailStudent = null;

/**
 * Merender daftar siswa pada tabel di Menu Karya Siswa (CREATE)
 * Kolom: No, Nama, Kelas, Sekolah, Opsi (Tombol Lihat)
 * @param {Array} students
 * @param {string} [searchQuery='']
 */
function renderCreateSiswaTable(students, searchQuery = '') {
  const stats = materiProgressCache.stages['create'];
  const matStats = stats && stats.byMateri ? stats.byMateri[String(selectedCreateMateri || '1')] : null;

  renderStudentProgressList({
    containerId: 'createSiswaTableBody',
    countId: 'createSiswaCount',
    students: students || currentSiswaList,
    searchQuery,
    emptyIcon: '🎨',
    badgeTheme: 'red',
    detailHandlerName: 'viewDetailCreate',
    getSummary: (s) => {
      if (!matStats) return { count: 0, label: 'Memuat...' };
      const sid = String(s.id_siswa || '').trim();
      const count = matStats.counts.get(sid) || 0;
      if (count === 0) return { count: 0, label: 'Belum menjawab' };
      return { count, label: `${count} Rencana Ide` };
    }
  });
}

/**
 * Filter pencarian realtime untuk daftar siswa di menu CREATE
 */
function handleSearchCreateSiswa() {
  const searchInput = document.getElementById('searchCreateSiswaInput');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  if (!query) {
    renderCreateSiswaTable(currentSiswaList);
    return;
  }

  const filtered = currentSiswaList.filter(s => {
    return (s.nama || '').toLowerCase().includes(query) || (s.absen || '').toString().toLowerCase().includes(query);
  });

  renderCreateSiswaTable(filtered, query);
}

/**
 * Refresh manual daftar siswa di menu CREATE
 */
async function loadCreateSiswaTable(isManualRefresh = false) {
  if (currentSiswaList.length === 0 || isManualRefresh) {
    await loadDataSiswa(isManualRefresh);
  }
  const searchInput = document.getElementById('searchCreateSiswaInput');
  if (searchInput && isManualRefresh) {
    searchInput.value = '';
  }
  renderCreateSiswaTable(currentSiswaList);
  await ensureStageStatsLoaded('create', isManualRefresh);
  handleSearchCreateSiswa();
}

/**
 * Mem-parse baris data dari tabel 'ide_create' untuk membedakan Bagian A (Ide READ) dan Bagian B (Karya Digital)
 * @param {object} row
 * @returns {{ isPartB: boolean, jenis: string, data: object|null }}
 */
function parseIdeCreateRow(row) {
  const idKet = row && row.id_keterampilan;
  const isPartB = (
    idKet === null ||
    idKet === undefined ||
    String(idKet).trim() === '' ||
    Number(idKet) <= 0
  );

  let payload = null;
  if (isPartB && row && row.karya) {
    try {
      payload = typeof row.karya === 'string' ? JSON.parse(row.karya) : row.karya;
      if (typeof payload === 'string') {
        payload = JSON.parse(payload);
      }
    } catch (e) {
      payload = null;
    }
  }

  const normalizedPayload = (payload && typeof payload === 'object') ? payload : null;
  const jenis = (normalizedPayload && normalizedPayload.jenis)
    ? String(normalizedPayload.jenis).trim().toLowerCase()
    : String((row && row.id_materi) || '').trim().toLowerCase();

  return {
    isPartB,
    jenis,
    data: normalizedPayload
  };
}

/**
 * Merender satu kartu karya siswa dari tabel 'ide_create' (mendukung Bagian A & Bagian B)
 * @param {object} row
 * @param {number} index
 * @returns {string} HTML string
 */
function renderCreateKaryaCard(row, index) {
  const { isPartB, jenis, data } = parseIdeCreateRow(row);
  const idLabel = `#${index + 1} • ID #${escapeHtml(String(row.id_ide || '-'))}`;

  // Bagian A: Rencana Perwujudan Ide READ (id_keterampilan > 0)
  if (!isPartB) {
    const cleanMatNum = String(row.id_materi || '1').replace(/\D+/g, '') || '1';
    const materiNama = getNamaMateri('materi-' + cleanMatNum);
    const ideText = row.pernyataan && String(row.pernyataan).trim() ? String(row.pernyataan).trim() : '(Ide READ tidak tercatat)';
    const langkahText = row.keterangan && String(row.keterangan).trim() ? String(row.keterangan).trim() : '(Belum ada langkah perwujudan)';

    return `
      <div class="read-item-card create-part-a">
        <div class="response-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; gap: 8px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <span class="badge badge-green" style="margin: 0; background: #CCFBF1; color: #0F766E;">💡 Ide dari READ</span>
            <span class="badge badge-blue" style="margin: 0;">${escapeHtml(materiNama)}</span>
          </div>
          <span style="font-size: 0.75rem; color: var(--text3); font-family: monospace;">${idLabel}</span>
        </div>

        <div style="margin-bottom: 10px;">
          <div style="font-size: 0.78rem; font-weight: 800; color: #0F766E; margin-bottom: 4px;">📝 Ide Gagasan (Tahap READ):</div>
          <div style="font-size: 0.88rem; color: #134E4A; background: #F0FDFA; padding: 10px 12px; border-radius: 8px; border: 1px solid #99F6E4; line-height: 1.6; white-space: pre-line; font-weight: 600;">
            ${escapeHtml(ideText)}
          </div>
        </div>

        <div>
          <div style="font-size: 0.78rem; font-weight: 800; color: var(--text3); margin-bottom: 4px;">🛠️ Langkah Perwujudan Siswa:</div>
          <div style="font-size: 0.88rem; color: var(--text); background: #F8FAFC; padding: 10px 12px; border-radius: 8px; border: 1px solid #E2E8F0; line-height: 1.6; white-space: pre-line;">
            ${escapeHtml(langkahText)}
          </div>
        </div>

        <div class="create-card-footer">
          <div class="create-card-meta">
            <span>📚 Sumber: <strong>keterampilan_read</strong></span>
          </div>
          <button type="button" class="create-download-btn pdf" onclick="downloadCreateItem(${index})" title="Unduh Rencana Ide (PDF)">
            📄 Unduh PDF
          </button>
        </div>
      </div>
    `;
  }

  // Bagian B1: Poster Digital (id_materi = 'poster')
  if (jenis === 'poster' && data) {
    return `
      <div class="read-item-card create-poster">
        <div class="response-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 8px; flex-wrap: wrap;">
          <span class="badge badge-red" style="margin: 0; background: #FFE4E6; color: #9F1239;">🖼️ Poster Digital</span>
          <span style="font-size: 0.75rem; color: var(--text3); font-family: monospace;">${idLabel}</span>
        </div>

        <div class="create-poster-box">
          <div class="create-poster-emoji">${escapeHtml(data.emoji || '🌍')}</div>
          <h4 class="create-poster-title">${escapeHtml(data.title || 'Poster Edukasi')}</h4>
          <p class="create-poster-msg">${escapeHtml(data.msg || row.pernyataan || '-')}</p>
          ${data.pledge ? `<div class="create-poster-pledge">💪 "${escapeHtml(data.pledge)}"</div>` : ''}
        </div>

        <div class="create-card-footer">
          <div class="create-card-meta">
            <span>✍️ Pembuat: <strong>${escapeHtml(data.name || '-')}</strong></span>
            <span>📅 ${escapeHtml(data.date || '-')}</span>
          </div>
          <button type="button" class="create-download-btn" onclick="downloadCreateItem(${index})" title="Unduh Poster Digital (PNG)">
            ⬇️ Unduh PNG
          </button>
        </div>
      </div>
    `;
  }

  // Bagian B2: Ikrar Lingkungan (id_materi = 'pledge')
  if (jenis === 'pledge' && data) {
    return `
      <div class="read-item-card create-pledge">
        <div class="response-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 8px; flex-wrap: wrap;">
          <span class="badge badge-green" style="margin: 0;">🤝 Ikrar Lingkungan</span>
          <span style="font-size: 0.75rem; color: var(--text3); font-family: monospace;">${idLabel}</span>
        </div>

        <blockquote class="create-pledge-quote">
          <span style="font-size: 1.25rem; margin-right: 6px;">${escapeHtml(data.emoji || '🌍')}</span>"${escapeHtml(data.text || row.pernyataan || '-')}"
        </blockquote>

        <div class="create-card-footer">
          <div class="create-card-meta">
            <span>✍️ Pengikrar: <strong>${escapeHtml(data.name || '-')}</strong></span>
            <span>📅 ${escapeHtml(data.date || '-')}</span>
          </div>
          <button type="button" class="create-download-btn" onclick="downloadCreateItem(${index})" title="Unduh Kartu Ikrar (PNG)">
            ⬇️ Unduh PNG
          </button>
        </div>
      </div>
    `;
  }

  // Bagian B3: Berita Eco Mini (id_materi = 'news')
  if (jenis === 'news' && data) {
    const authorName = data.author || '-';
    const authorKelas = data.kelas || row.kelas || '-';
    const authorSekolah = data.sekolah || row.sekolah || '-';

    return `
      <div class="read-item-card create-news">
        <div class="response-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 8px; flex-wrap: wrap;">
          <span class="badge badge-blue" style="margin: 0;">📰 Berita Eco Mini</span>
          <span style="font-size: 0.75rem; color: var(--text3); font-family: monospace;">${idLabel}</span>
        </div>

        <article class="create-news-article">
          <h4 class="create-news-headline">${escapeHtml(data.headline || 'Berita Eco Mini')}</h4>
          <div class="create-news-byline">
            ✍️ <strong>${escapeHtml(authorName)}</strong> • Kelas ${escapeHtml(authorKelas)} • ${escapeHtml(authorSekolah)} • 📅 ${escapeHtml(data.date || '-')}
          </div>
          <p class="create-news-body">${escapeHtml(data.body || data.text || row.pernyataan || '-')}</p>
        </article>

        <div class="create-card-footer">
          <div class="create-card-meta">
            <span>📰 Format: <strong>Berita Eco Mini (PDF)</strong></span>
          </div>
          <button type="button" class="create-download-btn pdf" onclick="downloadCreateItem(${index})" title="Unduh Berita Eco Mini (PDF)">
            📄 Unduh PDF
          </button>
        </div>
      </div>
    `;
  }

  // Bagian B4: Aksi Sahabat Bumi (id_materi = 'action')
  if (jenis === 'action' && data) {
    const cat = data.category || {};
    const catEmoji = cat.emoji || '🌱';
    const catLabel = cat.label || 'Aksi Sahabat Bumi';
    const authorName = data.author || '-';
    const authorKelas = data.kelas || row.kelas || '-';
    const authorSekolah = data.sekolah || row.sekolah || '-';

    return `
      <div class="read-item-card create-action">
        <div class="response-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; gap: 8px; flex-wrap: wrap;">
          <span class="badge badge-amber" style="margin: 0;">${escapeHtml(catEmoji)} Proyek Aksi: ${escapeHtml(catLabel)}</span>
          <span style="font-size: 0.75rem; color: var(--text3); font-family: monospace;">${idLabel}</span>
        </div>

        <div class="create-action-meta-row">
          <span class="create-action-chip">📍 ${escapeHtml(data.place || '-')}</span>
          <span class="create-action-chip">⏰ ${escapeHtml(data.when || '-')}</span>
          <span class="create-action-chip">🤝 ${escapeHtml(data.helper || '-')}</span>
        </div>

        <div class="create-action-grid">
          <div class="create-action-field">
            <div class="create-action-field-label">Masalah</div>
            <div class="create-action-field-val">${escapeHtml(data.problem || '-')}</div>
          </div>
          <div class="create-action-field">
            <div class="create-action-field-label">Alasan Penting</div>
            <div class="create-action-field-val">${escapeHtml(data.why || '-')}</div>
          </div>
          <div class="create-action-field">
            <div class="create-action-field-label">Rencana Aksi</div>
            <div class="create-action-field-val">${escapeHtml(data.plan || '-')}</div>
          </div>
          <div class="create-action-field">
            <div class="create-action-field-label">Bukti</div>
            <div class="create-action-field-val">${escapeHtml(data.evidence || '-')}</div>
          </div>
          <div class="create-action-field">
            <div class="create-action-field-label">Perubahan</div>
            <div class="create-action-field-val">${escapeHtml(data.change || '-')}</div>
          </div>
          <div class="create-action-field">
            <div class="create-action-field-label">Langkah Berikutnya</div>
            <div class="create-action-field-val">${escapeHtml(data.next || '-')}</div>
          </div>
        </div>

        <div class="create-card-footer">
          <div class="create-card-meta">
            <span>✍️ Pelaksana: <strong>${escapeHtml(authorName)}</strong> (${escapeHtml(authorKelas)} • ${escapeHtml(authorSekolah)})</span>
            <span>📅 ${escapeHtml(data.date || '-')}</span>
          </div>
          <button type="button" class="create-download-btn pdf" onclick="downloadCreateItem(${index})" title="Unduh Flyer Aksi Sahabat Bumi (PDF)">
            📄 Unduh PDF
          </button>
        </div>
      </div>
    `;
  }

  // Fallback jika Bagian B belum memiliki JSON valid / format lain
  const fallbackLabel = row.keterangan || row.id_materi || 'Karya Siswa';
  const fallbackContent = row.pernyataan || row.karya || '(Data karya kosong)';
  const isFallbackPng = jenis === 'poster' || jenis === 'pledge';
  return `
    <div class="read-item-card create-part-a">
      <div class="response-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; gap: 8px; flex-wrap: wrap;">
        <span class="badge badge-purple" style="margin: 0;">🎨 ${escapeHtml(fallbackLabel)}</span>
        <span style="font-size: 0.75rem; color: var(--text3); font-family: monospace;">${idLabel}</span>
      </div>
      <div class="response-box" style="margin-bottom: 0; white-space: pre-line;">
        ${escapeHtml(fallbackContent)}
      </div>
      <div class="create-card-footer">
        <div class="create-card-meta">
          <span>🎨 Kategori: <strong>${escapeHtml(fallbackLabel)}</strong></span>
        </div>
        <button type="button" class="create-download-btn ${isFallbackPng ? '' : 'pdf'}" onclick="downloadCreateItem(${index})" title="Unduh Karya Siswa">
          ${isFallbackPng ? '⬇️ Unduh PNG' : '📄 Unduh PDF'}
        </button>
      </div>
    </div>
  `;
}

/* ── UTILITAS CANVAS & PDF CLIENT-SIDE UNTUK UNDUH KARYA CREATE ── */
function createCreateOffscreenCanvas(width, height) {
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext ? canvas.getContext('2d') : null;
  if (!ctx) return null;
  return { canvas, ctx };
}

function drawCreateRoundedRect(ctx, x, y, w, h, r, fillStyle, strokeStyle = null, lineWidth = 0) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle && lineWidth > 0) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function wrapCreateCanvasLines(ctx, text, maxWidth) {
  const paragraphs = String(text || '').replace(/\r\n/g, '\n').split('\n');
  const lines = [];
  paragraphs.forEach(para => {
    const trimmed = para.trim();
    if (!trimmed) {
      lines.push('');
      return;
    }
    const words = trimmed.split(/\s+/);
    let current = '';
    words.forEach(word => {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        // Jika satu kata tunggal melebihi maxWidth, pecah per karakter
        if (ctx.measureText(word).width > maxWidth) {
          let part = '';
          for (let i = 0; i < word.length; i++) {
            const nextPart = part + word[i];
            if (ctx.measureText(nextPart).width <= maxWidth) {
              part = nextPart;
            } else {
              if (part) lines.push(part);
              part = word[i];
            }
          }
          current = part;
        } else {
          current = word;
        }
      }
    });
    if (current) lines.push(current);
  });
  return lines;
}

function drawCreateWrappedTextLines(ctx, lines, x, y, lineHeight, align = 'left', maxLines = 0) {
  const hasMore = maxLines > 0 && lines.length > maxLines;
  const list = hasMore
    ? [...lines.slice(0, maxLines - 1), `${lines[maxLines - 1].trimEnd()}…`]
    : lines;
  ctx.textAlign = align;
  let curY = y;
  list.forEach(line => {
    if (line) ctx.fillText(line, x, curY);
    curY += lineHeight;
  });
  return curY;
}

/**
 * Render Poster Digital ke Canvas (1080x1350 -> PNG) sesuai referensi_create.js
 */
function renderCreatePosterToCanvas(data) {
  const res = createCreateOffscreenCanvas(1080, 1350);
  if (!res) return null;
  const { canvas, ctx } = res;

  const grad = ctx.createLinearGradient(0, 0, 1080, 1350);
  grad.addColorStop(0, '#0A3D1F');
  grad.addColorStop(1, '#1B6FB5');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1350);

  drawCreateRoundedRect(ctx, 56, 56, 968, 1238, 34, '#FFFFFF');
  drawCreateRoundedRect(ctx, 310, 106, 460, 48, 24, '#DCFCE7');
  ctx.fillStyle = '#14532D';
  ctx.font = '800 22px Nunito, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌿 POSTER IKLIM ECOMEDIA RADEC', 540, 138);

  ctx.fillStyle = '#111827';
  ctx.font = '800 48px Sora, Arial, sans-serif';
  const titleLines = wrapCreateCanvasLines(ctx, data.title, 840);
  const y = drawCreateWrappedTextLines(ctx, titleLines, 540, 232, 60, 'center', 3);

  ctx.font = '148px Apple Color Emoji, Segoe UI Emoji, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.emoji || '🌍', 540, Math.max(y + 130, 470));

  const boxTop = Math.max(y + 190, 540);
  const boxHeight = 470;
  drawCreateRoundedRect(ctx, 112, boxTop, 856, boxHeight, 26, '#F0FDF4', '#16A34A', 5);

  ctx.fillStyle = '#1F2937';
  ctx.font = '700 32px Nunito, Arial, sans-serif';
  const msgLines = wrapCreateCanvasLines(ctx, data.msg, 760);
  const afterMsgY = drawCreateWrappedTextLines(ctx, msgLines, 540, boxTop + 86, 46, 'center', 5);

  if (data.pledge) {
    ctx.fillStyle = '#14532D';
    ctx.font = '800 30px Nunito, Arial, sans-serif';
    const pledgeLines = wrapCreateCanvasLines(ctx, `💪 "${data.pledge}"`, 760);
    drawCreateWrappedTextLines(ctx, pledgeLines, 540, afterMsgY + 34, 44, 'center', 3);
  }

  ctx.fillStyle = '#6B7280';
  ctx.font = '700 24px Nunito, Arial, sans-serif';
  ctx.textAlign = 'center';
  const meta = data.name ? `— ${data.name} | ${data.date}` : `EcoMedia RADEC · ${data.date}`;
  ctx.fillText(meta, 540, 1215);

  return canvas;
}

/**
 * Render Ikrar Lingkungan ke Canvas (1080x1080 -> PNG) sesuai referensi_create.js
 */
function renderCreatePledgeToCanvas(data) {
  const res = createCreateOffscreenCanvas(1080, 1080);
  if (!res) return null;
  const { canvas, ctx } = res;

  const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
  grad.addColorStop(0, '#1B5E35');
  grad.addColorStop(1, '#0D3E6E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1080);

  drawCreateRoundedRect(ctx, 48, 48, 984, 984, 34, null, 'rgba(255,255,255,0.45)', 4);
  drawCreateRoundedRect(ctx, 290, 96, 500, 50, 25, 'rgba(255,255,255,0.16)', 'rgba(255,255,255,0.35)', 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 22px Nunito, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📜 IKRAR LINGKUNGAN SAHABAT BUMI', 540, 129);

  ctx.font = '132px Apple Color Emoji, Segoe UI Emoji, Arial, sans-serif';
  ctx.fillText(data.emoji || '🌍', 540, 300);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 34px Nunito, Arial, sans-serif';
  const pledgeLines = wrapCreateCanvasLines(ctx, `"${data.text}"`, 820);
  drawCreateWrappedTextLines(ctx, pledgeLines, 540, 420, 52, 'center', 8);

  drawCreateRoundedRect(ctx, 180, 888, 720, 74, 18, 'rgba(255,255,255,0.12)');
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '700 24px Nunito, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`— ${data.name || 'Penjelajah Iklim'} | ${data.date}`, 540, 934);

  return canvas;
}

/**
 * Render Berita Eco Mini ke Canvas (1240x1754 A4 -> PDF) sesuai referensi_create.js (Opsi 3)
 */
function renderCreateNewsCardToCanvas(data) {
  const res = createCreateOffscreenCanvas(1240, 1754);
  if (!res) return null;
  const { canvas, ctx } = res;

  const bg = ctx.createLinearGradient(0, 0, 0, 1754);
  bg.addColorStop(0, '#EFF6FF');
  bg.addColorStop(1, '#F0FDF4');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1240, 1754);

  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 14;
  drawCreateRoundedRect(ctx, 84, 88, 1072, 1578, 34, '#FFFFFF');
  ctx.restore();
  drawCreateRoundedRect(ctx, 84, 88, 1072, 1578, 34, null, '#F3D2D2', 2.5);

  const headGrad = ctx.createLinearGradient(84, 88, 1156, 260);
  headGrad.addColorStop(0, '#DC2626');
  headGrad.addColorStop(1, '#EA580C');
  drawCreateRoundedRect(ctx, 84, 88, 1072, 182, 34, headGrad);
  ctx.fillRect(84, 224, 1072, 46);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 38px Sora, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('📰 BERITA ECO MINI', 136, 174);
  ctx.font = '700 22px Nunito, Arial, sans-serif';
  ctx.fillStyle = '#FFE4E6';
  ctx.fillText('EDISI KARYA SISWA · ECOMEDIA RADEC', 136, 222);

  drawCreateRoundedRect(ctx, 886, 134, 224, 46, 23, 'rgba(255,255,255,0.2)');
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 20px Nunito, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`📅 ${data.date}`, 998, 165);

  drawCreateRoundedRect(ctx, 136, 310, 968, 72, 16, '#FFF5F2', '#FECACA', 1.5);
  ctx.fillStyle = '#991B1B';
  ctx.font = '800 22px Nunito, Arial, sans-serif';
  ctx.textAlign = 'left';
  const authorParts = [data.author || 'Sahabat Bumi', data.kelas ? `Kelas ${data.kelas}` : '', data.sekolah || ''].filter(Boolean);
  ctx.fillText(`✍️ Penulis: ${authorParts.join(' · ')}`, 164, 354);

  ctx.fillStyle = '#111827';
  ctx.font = '800 40px Sora, Arial, sans-serif';
  const headlineLines = wrapCreateCanvasLines(ctx, data.headline || 'Berita Eco Mini Sahabat Bumi', 960);
  let cursorY = drawCreateWrappedTextLines(ctx, headlineLines, 136, 456, 54, 'left', 3);

  drawCreateRoundedRect(ctx, 136, cursorY + 8, 140, 7, 3.5, '#DC2626');
  cursorY += 66;

  ctx.fillStyle = '#334155';
  ctx.font = '600 27px Nunito, Arial, sans-serif';
  const bodyLines = wrapCreateCanvasLines(ctx, data.body || data.text, 960);
  const maxBodyLines = Math.max(8, Math.floor((1448 - cursorY) / 44));
  drawCreateWrappedTextLines(ctx, bodyLines, 136, cursorY, 44, 'left', maxBodyLines);

  drawCreateRoundedRect(ctx, 136, 1474, 968, 132, 20, '#F0FDF4', '#86EFAC', 2);
  ctx.fillStyle = '#14532D';
  ctx.font = '800 22px Nunito, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('📌 Prinsip Berita Ecomedia:', 166, 1520);
  ctx.fillStyle = '#166534';
  ctx.font = '700 21px Nunito, Arial, sans-serif';
  ctx.fillText('✅ Berbasis fakta & sumber data   ·   ✅ Menyertakan solusi   ·   ✅ Mengajak aksi nyata', 166, 1564);

  return canvas;
}

/**
 * Render Flyer Aksi Sahabat Bumi ke Canvas (1240x1754 A4 -> PDF) sesuai referensi_create.js (Opsi 4)
 */
function renderCreateActionFlyerToCanvas(data) {
  const res = createCreateOffscreenCanvas(1240, 1754);
  if (!res) return null;
  const { canvas, ctx } = res;

  ctx.fillStyle = '#F8FCF9';
  ctx.fillRect(0, 0, 1240, 1754);

  const headGrad = ctx.createLinearGradient(0, 0, 1240, 280);
  headGrad.addColorStop(0, '#0A3D1F');
  headGrad.addColorStop(1, '#15803D');
  ctx.fillStyle = headGrad;
  ctx.fillRect(0, 0, 1240, 272);

  drawCreateRoundedRect(ctx, 72, 46, 470, 42, 21, 'rgba(255,255,255,0.18)');
  ctx.fillStyle = '#DCFCE7';
  ctx.font = '800 20px Nunito, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🌱 FLYER AKSI SAHABAT BUMI · ECOMEDIA', 94, 74);

  const cat = data.category || { emoji: '🌱', label: 'Aksi Lingkungan' };
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 50px Sora, Arial, sans-serif';
  ctx.fillText(`${cat.emoji} ${cat.label}`, 72, 162);

  ctx.fillStyle = '#BBF7D0';
  ctx.font = '700 24px Nunito, Arial, sans-serif';
  ctx.fillText('Dari Pengetahuan Menuju Aksi Nyata Menjaga Bumi', 72, 216);

  const ribbons = [
    { label: '📍 TEMPAT', val: data.place || '-' },
    { label: '⏰ WAKTU', val: data.when || '-' },
    { label: '🤝 PEMBANTU', val: data.helper || '-' }
  ];
  ribbons.forEach((item, idx) => {
    const rx = 72 + idx * 372;
    drawCreateRoundedRect(ctx, rx, 304, 352, 98, 18, '#FFFFFF', '#86EFAC', 2);
    ctx.fillStyle = '#15803D';
    ctx.font = '800 18px Nunito, Arial, sans-serif';
    ctx.fillText(item.label, rx + 20, 338);
    ctx.fillStyle = '#1E293B';
    ctx.font = '700 22px Nunito, Arial, sans-serif';
    const valLines = wrapCreateCanvasLines(ctx, item.val, 312);
    ctx.fillText((valLines[0] || '-').slice(0, 28), rx + 20, 376);
  });

  const sections = [
    { icon: '🔍', title: '1. Masalah yang Kulihat', text: data.problem, bg: '#FFF7ED', border: '#FDBA74', accent: '#C2410C', h: 196, maxLines: 3 },
    { icon: '💡', title: '2. Mengapa Masalah Ini Penting?', text: data.why, bg: '#FEFCE8', border: '#FDE047', accent: '#A16207', h: 196, maxLines: 3 },
    { icon: '🚀', title: '3. Aksi yang Kupilih', text: data.plan, bg: '#F0FDF4', border: '#86EFAC', accent: '#15803D', h: 210, maxLines: 3 },
    {
      icon: '✅',
      title: '4. Bukti Tindakan & Perubahan yang Terlihat',
      text: `Bukti: ${data.evidence || '-'}\nPerubahan: ${data.change || '-'}`,
      bg: '#EFF6FF',
      border: '#93C5FD',
      accent: '#1D4ED8',
      h: 244,
      maxLines: 4
    },
    { icon: '🌱', title: '5. Langkah Berikutnya', text: data.next || '-', bg: '#F5F3FF', border: '#C4B5FD', accent: '#6D28D9', h: 196, maxLines: 3 }
  ];

  let curY = 432;
  sections.forEach(sec => {
    drawCreateRoundedRect(ctx, 72, curY, 1096, sec.h, 20, sec.bg, sec.border, 2);
    drawCreateRoundedRect(ctx, 72, curY, 12, sec.h, 6, sec.accent);
    ctx.fillStyle = sec.accent;
    ctx.font = '800 24px Sora, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${sec.icon} ${sec.title}`, 106, curY + 44);

    ctx.fillStyle = '#1E293B';
    ctx.font = '600 23px Nunito, Arial, sans-serif';
    const lines = wrapCreateCanvasLines(ctx, sec.text, 1030);
    drawCreateWrappedTextLines(ctx, lines, 106, curY + 88, 36, 'left', sec.maxLines);
    curY += sec.h + 22;
  });

  drawCreateRoundedRect(ctx, 72, 1602, 1096, 104, 20, '#0A3D1F');
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 23px Nunito, Arial, sans-serif';
  ctx.textAlign = 'left';
  const authorParts = [data.author || 'Sahabat Bumi', data.kelas ? `Kelas ${data.kelas}` : '', data.sekolah || ''].filter(Boolean);
  ctx.fillText(`🎒 Pelaksana: ${authorParts.join(' · ')}`, 104, 1648);
  ctx.fillStyle = '#86EFAC';
  ctx.font = '700 20px Nunito, Arial, sans-serif';
  ctx.fillText(`📅 ${data.date} · EcoMedia RADEC`, 104, 1684);

  return canvas;
}

/**
 * Render Rencana Perwujudan Ide READ (id_keterampilan > 0) ke Canvas (1240x1754 A4 -> PDF)
 * Menyertakan identitas siswa & mengikuti format tampilan Opsi 3 dan Opsi 4 pada referensi_create.js
 */
function renderCreateReadIdeaToCanvas(row, student) {
  const res = createCreateOffscreenCanvas(1240, 1754);
  if (!res) return null;
  const { canvas, ctx } = res;

  const cleanMatNum = String(row.id_materi || '1').replace(/\D+/g, '') || '1';
  const namaMateri = getNamaMateri('materi-' + cleanMatNum);
  const studentName = (student && student.nama) || 'Siswa';
  const studentAbsen = (student && student.absen && student.absen !== '-') ? ` (No. Absen: ${student.absen})` : '';
  const studentKelas = row.kelas || (student && student.kelas) || '-';
  const studentSekolah = row.sekolah || (student && student.sekolah) || '-';
  const dateStr = row.updated_at ? String(row.updated_at).split(' ')[0] : (row.created_at ? String(row.created_at).split(' ')[0] : new Date().toLocaleDateString('id-ID'));

  // Background lembut (mengikuti gaya flyer opsi 4)
  ctx.fillStyle = '#F8FCF9';
  ctx.fillRect(0, 0, 1240, 1754);

  // Header Banner penuh
  const headGrad = ctx.createLinearGradient(0, 0, 1240, 280);
  headGrad.addColorStop(0, '#0A3D1F');
  headGrad.addColorStop(1, '#0D9488');
  ctx.fillStyle = headGrad;
  ctx.fillRect(0, 0, 1240, 272);

  drawCreateRoundedRect(ctx, 72, 44, 540, 42, 21, 'rgba(255,255,255,0.18)');
  ctx.fillStyle = '#CCFBF1';
  ctx.font = '800 20px Nunito, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('💡 RENCANA PERWUJUDAN IDE · ECOMEDIA RADEC', 94, 72);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 40px Sora, Arial, sans-serif';
  const materiTitleLines = wrapCreateCanvasLines(ctx, namaMateri, 1080);
  drawCreateWrappedTextLines(ctx, materiTitleLines, 72, 146, 50, 'left', 2);

  ctx.fillStyle = '#99F6E4';
  ctx.font = '700 22px Nunito, Arial, sans-serif';
  ctx.fillText('Integrasi Ide Tahap READ dan Langkah Perwujudan Tahap CREATE', 72, 244);

  // Kartu Identitas Siswa (mengikuti strip penulis opsi 3 & identitas opsi 4)
  drawCreateRoundedRect(ctx, 72, 304, 1096, 118, 18, '#FFFFFF', '#5EEAD4', 2);
  ctx.fillStyle = '#0F766E';
  ctx.font = '800 20px Nunito, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🎒 IDENTITAS SISWA', 102, 342);

  ctx.fillStyle = '#111827';
  ctx.font = '800 26px Sora, Arial, sans-serif';
  ctx.fillText(`${studentName}${studentAbsen}`, 102, 378);

  ctx.fillStyle = '#475569';
  ctx.font = '700 21px Nunito, Arial, sans-serif';
  ctx.fillText(`🏫 Kelas ${studentKelas}  ·  ${studentSekolah}  ·  📅 ${dateStr}`, 102, 408);

  // Seksi 1: Ide Gagasan (Sumber keterampilan_read)
  drawCreateRoundedRect(ctx, 72, 452, 1096, 510, 20, '#F0FDFA', '#5EEAD4', 2);
  drawCreateRoundedRect(ctx, 72, 452, 12, 510, 6, '#0F766E');
  ctx.fillStyle = '#0F766E';
  ctx.font = '800 25px Sora, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('📝 1. Ide Gagasan Siswa (Tahap READ)', 106, 500);

  ctx.fillStyle = '#134E4A';
  ctx.font = '600 25px Nunito, Arial, sans-serif';
  const ideText = row.pernyataan && String(row.pernyataan).trim() ? String(row.pernyataan).trim() : '(Ide READ tidak tercatat)';
  const ideLines = wrapCreateCanvasLines(ctx, ideText, 1030);
  drawCreateWrappedTextLines(ctx, ideLines, 106, 550, 40, 'left', 10);

  // Seksi 2: Langkah Perwujudan Siswa (Tahap CREATE)
  drawCreateRoundedRect(ctx, 72, 990, 1096, 580, 20, '#EFF6FF', '#93C5FD', 2);
  drawCreateRoundedRect(ctx, 72, 990, 12, 580, 6, '#1D4ED8');
  ctx.fillStyle = '#1D4ED8';
  ctx.font = '800 25px Sora, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🛠️ 2. Rencana & Langkah Perwujudan (Tahap CREATE)', 106, 1038);

  ctx.fillStyle = '#1E293B';
  ctx.font = '600 25px Nunito, Arial, sans-serif';
  const langkahText = row.keterangan && String(row.keterangan).trim() ? String(row.keterangan).trim() : '(Belum ada langkah perwujudan)';
  const langkahLines = wrapCreateCanvasLines(ctx, langkahText, 1030);
  drawCreateWrappedTextLines(ctx, langkahLines, 106, 1088, 40, 'left', 12);

  // Footer Identitas & Rekaman (mengikuti gaya opsi 4)
  drawCreateRoundedRect(ctx, 72, 1602, 1096, 104, 20, '#0A3D1F');
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 23px Nunito, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`🌿 EcoMedia RADEC · ${studentName} (Kelas ${studentKelas})`, 104, 1648);
  ctx.fillStyle = '#99F6E4';
  ctx.font = '700 20px Nunito, Arial, sans-serif';
  ctx.fillText(`📚 Materi ${cleanMatNum} · ID Rekaman #${row.id_ide || '-'} · ID Keterampilan #${row.id_keterampilan || '-'}`, 104, 1684);

  return canvas;
}

function decodeCreateBase64ToBytes(b64) {
  if (typeof atob === 'function') {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  throw new Error('Base64 decoder tidak tersedia');
}

function asciiToCreateBytes(str) {
  const out = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 0xff;
  return out;
}

/**
 * Membentuk file PDF 1.4 multi-halaman dari array gambar JPEG Canvas
 * @param {Array<{ dataUrl: string, width: number, height: number }>} pages
 * @param {number} [pageW=595]
 * @param {number} [pageH=842]
 * @returns {Uint8Array}
 */
function buildMultiPagePdfFromJpegDataUrls(pages, pageW = 595, pageH = 842) {
  const validPages = Array.isArray(pages) ? pages.filter(p => p && p.dataUrl) : [];
  if (validPages.length === 0) {
    throw new Error('Tidak ada halaman PDF yang dapat dibuat.');
  }

  const chunks = [];
  let offset = 0;
  const pushBytes = (arr) => {
    chunks.push(arr);
    offset += arr.length;
  };
  const pushAscii = (str) => pushBytes(asciiToCreateBytes(str));

  pushAscii('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  const offsets = [0];
  offsets.push(offset);
  pushAscii('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  const pageRefs = validPages.map((_, idx) => `${3 + idx * 3} 0 R`).join(' ');
  offsets.push(offset);
  pushAscii(`2 0 obj\n<< /Type /Pages /Kids [${pageRefs}] /Count ${validPages.length} >>\nendobj\n`);

  validPages.forEach((p, idx) => {
    const commaIdx = String(p.dataUrl || '').indexOf(',');
    const b64 = commaIdx >= 0 ? p.dataUrl.slice(commaIdx + 1) : String(p.dataUrl || '');
    const jpgBytes = decodeCreateBase64ToBytes(b64);

    const pageObjId = 3 + idx * 3;
    const imgObjId = 4 + idx * 3;
    const cntObjId = 5 + idx * 3;
    const curPageW = p.pageW || pageW;
    const curPageH = p.pageH || pageH;

    offsets.push(offset);
    pushAscii(`${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /XObject << /Im0 ${imgObjId} 0 R >> >> /MediaBox [0 0 ${curPageW} ${curPageH}] /Contents ${cntObjId} 0 R >>\nendobj\n`);

    offsets.push(offset);
    pushAscii(`${imgObjId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${p.width} /Height ${p.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpgBytes.length} >>\nstream\n`);
    pushBytes(jpgBytes);
    pushAscii('\nendstream\nendobj\n');

    const contentStream = `q\n${curPageW} 0 0 ${curPageH} 0 0 cm\n/Im0 Do\nQ\n`;
    offsets.push(offset);
    pushAscii(`${cntObjId} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`);
  });

  const totalObjects = 2 + validPages.length * 3;
  const xrefOffset = offset;
  pushAscii(`xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`);
  for (let i = 1; i <= totalObjects; i++) {
    pushAscii(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }
  pushAscii(`trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  const merged = new Uint8Array(offset);
  let pos = 0;
  chunks.forEach(chunk => {
    merged.set(chunk, pos);
    pos += chunk.length;
  });
  return merged;
}

function buildCreatePdfFromJpegDataUrl(jpegDataUrl, widthPx, heightPx, pageW = 595, pageH = 842) {
  return buildMultiPagePdfFromJpegDataUrls([{ dataUrl: jpegDataUrl, width: widthPx, height: heightPx }], pageW, pageH);
}

function sanitizeCreateFilename(rawName, fallback) {
  let tmp = fallback;
  // console.log(fallback);
  // console.log(/\d/.test(tmp));
  // console.log(tmp === '');
  let clean = String(rawName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 36);
  if(tmp === '') {
    return (clean || fallback).toUpperCase();
  }
  return clean || fallback;
}

function triggerCreateFileDownload(dataUrlOrBlob, filename) {
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') return false;
  const link = document.createElement('a');
  let objectUrl = '';

  if (typeof Blob !== 'undefined' && dataUrlOrBlob instanceof Blob && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    objectUrl = URL.createObjectURL(dataUrlOrBlob);
    link.href = objectUrl;
  } else {
    link.href = String(dataUrlOrBlob || '');
  }

  link.download = filename;
  if (document.body && typeof document.body.appendChild === 'function') {
    document.body.appendChild(link);
  }
  if (typeof link.click === 'function') link.click();
  if (document.body && typeof document.body.removeChild === 'function') {
    document.body.removeChild(link);
  }
  if (objectUrl && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }
  return true;
}

/**
 * Mengunduh karya siswa dari card di halaman rincian CREATE sesuai aturan:
 * - id_keterampilan not null -> PDF dengan identitas siswa (format opsi 3 & 4)
 * - poster & pledge -> PNG (referensi_create.js)
 * - news & action -> PDF (referensi_create.js)
 * @param {number} index
 */
function downloadCreateItem(index) {
  const row = currentCreateKaryaList[index];
  if (!row) return;

  const student = currentCreateDetailStudent || {
    nama: 'Siswa',
    kelas: row.kelas || '-',
    sekolah: row.sekolah || '-',
    absen: '-'
  };

  try {
    const { isPartB, jenis, data } = parseIdeCreateRow(row);
    const slugNama = sanitizeCreateFilename(student.nama, 'siswa');
    const slugKelas = sanitizeCreateFilename(row.kelas || student.kelas, '');
    const slugSekolah = sanitizeCreateFilename(row.sekolah || student.sekolah, '');
    const studentSlug = [slugNama, slugKelas, slugSekolah].filter(Boolean).join('_');
    const dateFallback = row.updated_at ? String(row.updated_at).split(' ')[0] : (row.created_at ? String(row.created_at).split(' ')[0] : new Date().toLocaleDateString('id-ID'));

    // 1. Jika data berasal dari keterampilan_read (id_keterampilan not null) -> Unduh PDF dengan identitas siswa
    if (!isPartB) {
      const cleanMatNum = String(row.id_materi || '1').replace(/\D+/g, '') || '1';
      const canvas = renderCreateReadIdeaToCanvas(row, student);
      if (!canvas) throw new Error('Canvas tidak tersedia di browser.');
      const jpegUrl = canvas.toDataURL('image/jpeg', 0.92);
      const pdfBytes = buildCreatePdfFromJpegDataUrl(jpegUrl, canvas.width, canvas.height, 595, 842);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const filename = `rencana-ide-materi-${cleanMatNum}-${studentSlug}.pdf`;
      triggerCreateFileDownload(blob, filename);
      return;
    }

    // 2. Karya Digital Bagian B (id_keterampilan null / kosong)
    const safeData = data || {};

    if (jenis === 'poster') {
      const posterData = {
        title: safeData.title || row.keterangan || 'Poster Digital',
        msg: safeData.msg || row.pernyataan || '-',
        emoji: safeData.emoji || '🌍',
        pledge: safeData.pledge || '',
        name: safeData.name || student.nama || '',
        date: safeData.date || dateFallback
      };
      const canvas = renderCreatePosterToCanvas(posterData);
      if (!canvas) throw new Error('Canvas tidak tersedia di browser.');
      const pngUrl = canvas.toDataURL('image/png');
      const filename = `poster-ecomedia-${sanitizeCreateFilename(posterData.title, 'karya')}-${studentSlug}.png`;
      triggerCreateFileDownload(pngUrl, filename);
      return;
    }

    if (jenis === 'pledge') {
      const pledgeData = {
        emoji: safeData.emoji || '🌍',
        text: safeData.text || row.pernyataan || '-',
        name: safeData.name || student.nama || 'Sahabat Bumi',
        date: safeData.date || dateFallback
      };
      const canvas = renderCreatePledgeToCanvas(pledgeData);
      if (!canvas) throw new Error('Canvas tidak tersedia di browser.');
      const pngUrl = canvas.toDataURL('image/png');
      const filename = `ikrar-ecomedia-${studentSlug}.png`;
      triggerCreateFileDownload(pngUrl, filename);
      return;
    }

    if (jenis === 'news') {
      const newsData = {
        headline: safeData.headline || 'Berita Eco Mini Sahabat Bumi',
        body: safeData.body || safeData.text || row.pernyataan || '-',
        text: safeData.text || row.pernyataan || '-',
        author: safeData.author || student.nama || 'Sahabat Bumi',
        kelas: safeData.kelas || row.kelas || student.kelas || '',
        sekolah: safeData.sekolah || row.sekolah || student.sekolah || '',
        date: safeData.date || dateFallback
      };
      const canvas = renderCreateNewsCardToCanvas(newsData);
      if (!canvas) throw new Error('Canvas tidak tersedia di browser.');
      const jpegUrl = canvas.toDataURL('image/jpeg', 0.92);
      const pdfBytes = buildCreatePdfFromJpegDataUrl(jpegUrl, canvas.width, canvas.height, 595, 842);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const filename = `berita-eco-mini-${sanitizeCreateFilename(newsData.headline, 'card')}-${studentSlug}.pdf`;
      triggerCreateFileDownload(blob, filename);
      return;
    }

    if (jenis === 'action') {
      const actionData = {
        category: safeData.category || { emoji: '🌱', label: 'Aksi Sahabat Bumi' },
        place: safeData.place || '-',
        when: safeData.when || '-',
        helper: safeData.helper || '-',
        problem: safeData.problem || row.pernyataan || '-',
        why: safeData.why || '-',
        plan: safeData.plan || '-',
        evidence: safeData.evidence || '-',
        change: safeData.change || '-',
        next: safeData.next || '-',
        author: safeData.author || student.nama || 'Sahabat Bumi',
        kelas: safeData.kelas || row.kelas || student.kelas || '',
        sekolah: safeData.sekolah || row.sekolah || student.sekolah || '',
        date: safeData.date || dateFallback
      };
      const canvas = renderCreateActionFlyerToCanvas(actionData);
      if (!canvas) throw new Error('Canvas tidak tersedia di browser.');
      const jpegUrl = canvas.toDataURL('image/jpeg', 0.92);
      const pdfBytes = buildCreatePdfFromJpegDataUrl(jpegUrl, canvas.width, canvas.height, 595, 842);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const catName = (actionData.category && actionData.category.label) || 'aksi';
      const filename = `flyer-aksi-${sanitizeCreateFilename(catName, 'sahabat-bumi')}-${studentSlug}.pdf`;
      triggerCreateFileDownload(blob, filename);
      return;
    }

    // Fallback PDF untuk jenis tak dikenal
    const fallbackCanvas = renderCreateReadIdeaToCanvas({
      ...row,
      pernyataan: row.pernyataan || row.karya || '-',
      keterangan: row.keterangan || 'Karya Digital Siswa'
    }, student);
    if (!fallbackCanvas) throw new Error('Canvas tidak tersedia di browser.');
    const jpegUrl = fallbackCanvas.toDataURL('image/jpeg', 0.92);
    const pdfBytes = buildCreatePdfFromJpegDataUrl(jpegUrl, fallbackCanvas.width, fallbackCanvas.height, 595, 842);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    triggerCreateFileDownload(blob, `karya-create-${studentSlug}.pdf`);

  } catch (err) {
    console.error('[downloadCreateItem Error]', err);
    showError(err.message || 'Gagal memproses file unduhan karya siswa.', 'Gagal Mengunduh');
  }
}

let selectedCreateMateri = null;

function selectCreateMateri(matNum) {
  selectedCreateMateri = String(matNum || '1');
  const titleEl = document.getElementById('createSelectedMateriTitle');
  if (titleEl) titleEl.textContent = getNamaMateri('materi-' + selectedCreateMateri);

  const materiView = document.getElementById('createMateriView');
  const listView = document.getElementById('createListView');
  const detailView = document.getElementById('createDetailView');
  if (materiView) materiView.style.display = 'none';
  if (detailView) detailView.style.display = 'none';
  if (listView) listView.style.display = 'block';

  loadCreateSiswaTable(false);
}

function backToCreateMateri() {
  selectedCreateMateri = null;
  currentCreateKaryaList = [];
  currentCreateDetailStudent = null;
  renderMateriSelectorGrid('createMateriGrid', 'selectCreateMateri', 'red', 'Lihat Siswa →', 'create');
  const materiView = document.getElementById('createMateriView');
  const listView = document.getElementById('createListView');
  const detailView = document.getElementById('createDetailView');
  if (listView) listView.style.display = 'none';
  if (detailView) detailView.style.display = 'none';
  if (materiView) materiView.style.display = 'block';

  ensureStageStatsLoaded('create').then(() => {
    if (document.getElementById('createMateriView')?.style.display !== 'none') {
      renderMateriSelectorGrid('createMateriGrid', 'selectCreateMateri', 'red', 'Lihat Siswa →', 'create');
    }
  });
}

/**
 * Mengambil rencana perwujudan ide siswa (Bagian A) dari tabel 'ide_create' (mode append + urut DESC)
 * sesuai materi yang dipilih pada menu CREATE
 * @param {string} idSiswa
 */
async function viewDetailCreate(idSiswa) {
  if (!idSiswa) return;
  const activeMatNum = String(selectedCreateMateri || '1');
  const activeMateriLabel = getNamaMateri('materi-' + activeMatNum);

  const student = currentSiswaList.find(s => s.id_siswa === idSiswa) || {
    id_siswa: idSiswa,
    nama: 'Siswa',
    kelas: '-',
    sekolah: '-',
    absen: '-'
  };

  showLoading('Memuat Rencana Ide Siswa...', `Mengambil rencana perwujudan ${activeMateriLabel}...`);

  try {
    // 1. Ambil data dari tabel ide_create berdasarkan id_siswa
    let rawIdeCreate = [];
    try {
      rawIdeCreate = await EcoApi.getWhere('ide_create', { id_siswa: idSiswa });
    } catch (err) {
      console.warn('[viewDetailCreate] getWhere ide_create gagal, fallback ke EcoApi.get():', err);
      try {
        const allIde = await EcoApi.get('ide_create');
        if (Array.isArray(allIde)) {
          rawIdeCreate = allIde.filter(item => item.id_siswa === idSiswa);
        }
      } catch (err2) {
        rawIdeCreate = [];
      }
    }

    // 2. Filter strictly ke Bagian A (id_keterampilan > 0) untuk materi yang dipilih
    let validKarya = (Array.isArray(rawIdeCreate) ? rawIdeCreate : []).filter(row => {
      const parsed = parseIdeCreateRow(row);
      if (parsed.isPartB) return false;
      const cleanMat = String(row.id_materi !== undefined && row.id_materi !== null ? row.id_materi : '1').replace(/\D+/g, '') || '1';
      return cleanMat === activeMatNum;
    });

    // Mode Admin = 'append' + Urutkan DESC berdasarkan id_ide agar terbaru paling atas
    validKarya.sort((a, b) => (Number(b.id_ide) || 0) - (Number(a.id_ide) || 0));

    // Simpan ke state lokal agar tombol unduh per card dapat mengakses datanya
    currentCreateDetailStudent = student;
    currentCreateKaryaList = validKarya;

    // 3. Isi Header Detail Siswa
    const nameEl = document.getElementById('createDetailStudentName');
    const metaEl = document.getElementById('createDetailStudentMeta');
    if (nameEl) nameEl.textContent = `👨‍🎓👩‍🎓 ${student.nama}`;
    if (metaEl) {
      const absenText = student.absen ? ` (No. Absen: ${student.absen})` : '';
      metaEl.textContent = `${activeMateriLabel} • Kelas ${student.kelas} • ${student.sekolah}${absenText}`;
    }

    const headingEl = document.getElementById('createDetailMateriHeading');
    if (headingEl) headingEl.textContent = `Rencana Perwujudan Ide — ${activeMateriLabel}`;

    // 4. Render Blok Karya Siswa
    const countBadge = document.getElementById('createKaryaCountBadge');
    if (countBadge) {
      countBadge.textContent = `${validKarya.length} Rencana`;
    }

    const container = document.getElementById('createKaryaList');
    if (container) {
      if (validKarya.length === 0) {
        container.innerHTML = `
          <div class="siswa-empty-state" style="padding: 32px 10px;">
            <span class="siswa-empty-icon" style="font-size: 2rem;">🎨</span>
            <div style="font-size: 0.95rem; font-weight: 700;">Belum ada rencana perwujudan ide</div>
            <small style="color: var(--text3);">Siswa belum mengirimkan rencana perwujudan ide pada ${escapeHtml(activeMateriLabel)}.</small>
          </div>
        `;
      } else {
        let htmlCards = '';
        validKarya.forEach((row, idx) => {
          htmlCards += renderCreateKaryaCard(row, idx);
        });
        container.innerHTML = htmlCards;
      }
    }

    // 5. Ganti tampilan ke Detail View
    const listView = document.getElementById('createListView');
    const detailView = document.getElementById('createDetailView');
    if (listView) listView.style.display = 'none';
    if (detailView) {
      detailView.style.display = 'block';
      scrollToTop();
    }

    hideOverlay();

  } catch (err) {
    console.error('[viewDetailCreate Error]', err);
    showError(err.message || 'Gagal memuat data karya siswa dari server.', 'Gagal Memuat Detail');
  }
}

/**
 * Menutup tampilan detail dan kembali ke tabel daftar siswa di menu CREATE
 */
function closeDetailCreate() {
  currentCreateKaryaList = [];
  currentCreateDetailStudent = null;
  const listView = document.getElementById('createListView');
  const detailView = document.getElementById('createDetailView');
  if (detailView) detailView.style.display = 'none';
  if (listView) {
    listView.style.display = 'block';
    renderCreateSiswaTable(currentSiswaList);
  }
}

// Ekspos controller Create ke global window
window.selectCreateMateri = selectCreateMateri;
window.backToCreateMateri = backToCreateMateri;
window.renderCreateSiswaTable = renderCreateSiswaTable;
window.handleSearchCreateSiswa = handleSearchCreateSiswa;
window.loadCreateSiswaTable = loadCreateSiswaTable;
window.viewDetailCreate = viewDetailCreate;
window.closeDetailCreate = closeDetailCreate;
window.downloadCreateItem = downloadCreateItem;

// ==========================================
// MENU BARU: KARYA DIGITAL SISWA (CREATE BAGIAN B)
// ==========================================
const KARYA_DIGITAL_TYPES = [
  { key: 'poster', icon: '🖼️', title: 'Poster Digital', desc: 'Poster kampanye pelestarian lingkungan buatan siswa', badge: 'Poster', theme: 'red' },
  { key: 'pledge', icon: '🤝', title: 'Ikrar Lingkungan', desc: 'Kartu ikrar dan komitmen aksi nyata menjaga bumi', badge: 'Ikrar', theme: 'green' },
  { key: 'news', icon: '📰', title: 'Berita Eco Mini', desc: 'Artikel berita singkat seputar perubahan iklim', badge: 'Berita', theme: 'blue' },
  { key: 'action', icon: '🌱', title: 'Aksi Sahabat Bumi', desc: 'Laporan proyek dan bukti aksi lingkungan siswa', badge: 'Aksi Nyata', theme: 'amber' }
];

let selectedKaryaDigitalJenis = null;

function renderKaryaDigitalCategoryGrid() {
  const container = document.getElementById('karyaDigitalCategoryGrid');
  if (!container) return;

  const stats = materiProgressCache.stages['karya-digital'];
  const totalStudents = stats ? stats.totalStudents : currentSiswaList.length;

  container.innerHTML = KARYA_DIGITAL_TYPES.map(cat => {
    let pillHtml = '<span class="materi-progress-pill is-loading">⏳ Menghitung...</span>';
    if (stats && stats.byJenis && stats.byJenis[cat.key]) {
      const answered = stats.byJenis[cat.key].studentIds.size;
      pillHtml = `<span class="materi-progress-pill ${answered === 0 ? 'is-empty' : ''}">👥 ${answered} / ${totalStudents} Siswa Berkarya</span>`;
    }

    return `
      <button type="button" class="materi-selector-card" data-theme="${escapeHtml(cat.theme)}" onclick="selectKaryaDigitalJenis('${escapeHtml(cat.key)}')">
        <div class="materi-selector-main">
          <div class="materi-selector-top">
            <span class="materi-selector-num">${cat.icon} ${escapeHtml(cat.badge)}</span>
          </div>
          <h4 class="materi-selector-title">${escapeHtml(cat.title)}</h4>
          <p class="materi-selector-desc">${escapeHtml(cat.desc)}</p>
        </div>
        <div class="materi-selector-right">
          ${pillHtml}
          <span class="materi-selector-cta">Lihat Siswa →</span>
        </div>
      </button>
    `;
  }).join('');
}

function selectKaryaDigitalJenis(jenisKey) {
  selectedKaryaDigitalJenis = String(jenisKey || 'poster').toLowerCase();
  const catMeta = KARYA_DIGITAL_TYPES.find(c => c.key === selectedKaryaDigitalJenis) || KARYA_DIGITAL_TYPES[0];

  const titleEl = document.getElementById('karyaDigitalSelectedJenisTitle');
  if (titleEl) titleEl.textContent = `${catMeta.icon} ${catMeta.title}`;

  const catView = document.getElementById('karyaDigitalCategoryView');
  const listView = document.getElementById('karyaDigitalListView');
  const detailView = document.getElementById('karyaDigitalDetailView');
  if (catView) catView.style.display = 'none';
  if (detailView) detailView.style.display = 'none';
  if (listView) listView.style.display = 'block';

  loadKaryaDigitalSiswaTable(false);
}

function backToKaryaDigitalJenis() {
  selectedKaryaDigitalJenis = null;
  currentCreateKaryaList = [];
  currentCreateDetailStudent = null;
  renderKaryaDigitalCategoryGrid();

  const catView = document.getElementById('karyaDigitalCategoryView');
  const listView = document.getElementById('karyaDigitalListView');
  const detailView = document.getElementById('karyaDigitalDetailView');
  if (listView) listView.style.display = 'none';
  if (detailView) detailView.style.display = 'none';
  if (catView) catView.style.display = 'block';

  ensureStageStatsLoaded('karya-digital').then(() => {
    if (document.getElementById('karyaDigitalCategoryView')?.style.display !== 'none') {
      renderKaryaDigitalCategoryGrid();
    }
  });
}

function renderKaryaDigitalSiswaTable(students, searchQuery = '') {
  const stats = materiProgressCache.stages['karya-digital'];
  const jenisStats = stats && stats.byJenis ? stats.byJenis[String(selectedKaryaDigitalJenis || 'poster')] : null;

  renderStudentProgressList({
    containerId: 'karyaDigitalSiswaTableBody',
    countId: 'karyaDigitalSiswaCount',
    students: students || currentSiswaList,
    searchQuery,
    emptyIcon: '🖼️',
    badgeTheme: 'purple',
    detailHandlerName: 'viewDetailKaryaDigital',
    getSummary: (s) => {
      if (!jenisStats) return { count: 0, label: 'Memuat...' };
      const sid = String(s.id_siswa || '').trim();
      const count = jenisStats.counts.get(sid) || 0;
      if (count === 0) return { count: 0, label: 'Belum ada karya' };
      return { count, label: `${count} Karya` };
    }
  });
}

function handleSearchKaryaDigitalSiswa() {
  const searchInput = document.getElementById('searchKaryaDigitalSiswaInput');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  if (!query) {
    renderKaryaDigitalSiswaTable(currentSiswaList);
    return;
  }
  const filtered = currentSiswaList.filter(s =>
    (s.nama || '').toLowerCase().includes(query) || (s.absen || '').toString().toLowerCase().includes(query)
  );
  renderKaryaDigitalSiswaTable(filtered, query);
}

async function loadKaryaDigitalSiswaTable(isManualRefresh = false) {
  if (currentSiswaList.length === 0 || isManualRefresh) {
    await loadDataSiswa(isManualRefresh);
  }
  const searchInput = document.getElementById('searchKaryaDigitalSiswaInput');
  if (searchInput && isManualRefresh) {
    searchInput.value = '';
  }
  renderKaryaDigitalSiswaTable(currentSiswaList);
  await ensureStageStatsLoaded('karya-digital', isManualRefresh);
  handleSearchKaryaDigitalSiswa();
}

async function viewDetailKaryaDigital(idSiswa) {
  if (!idSiswa) return;
  const activeJenis = String(selectedKaryaDigitalJenis || 'poster').toLowerCase();
  const catMeta = KARYA_DIGITAL_TYPES.find(c => c.key === activeJenis) || KARYA_DIGITAL_TYPES[0];

  const student = currentSiswaList.find(s => s.id_siswa === idSiswa) || {
    id_siswa: idSiswa,
    nama: 'Siswa',
    kelas: '-',
    sekolah: '-',
    absen: '-'
  };

  showLoading(`Memuat ${catMeta.title}...`, 'Mengambil karya digital siswa dari server...');

  try {
    let rawIdeCreate = [];
    try {
      rawIdeCreate = await EcoApi.getWhere('ide_create', { id_siswa: idSiswa });
    } catch (err) {
      try {
        const allIde = await EcoApi.get('ide_create');
        if (Array.isArray(allIde)) {
          rawIdeCreate = allIde.filter(item => item.id_siswa === idSiswa);
        }
      } catch (err2) {
        rawIdeCreate = [];
      }
    }

    const filteredKarya = (Array.isArray(rawIdeCreate) ? rawIdeCreate : []).filter(row => {
      const parsed = parseIdeCreateRow(row);
      return parsed.isPartB && parsed.jenis === activeJenis;
    });

    filteredKarya.sort((a, b) => (Number(b.id_ide) || 0) - (Number(a.id_ide) || 0));

    // Reuse state agar tombol downloadCreateItem(idx) pada renderCreateKaryaCard bekerja langsung
    currentCreateDetailStudent = student;
    currentCreateKaryaList = filteredKarya;

    const nameEl = document.getElementById('karyaDigitalDetailStudentName');
    const metaEl = document.getElementById('karyaDigitalDetailStudentMeta');
    if (nameEl) nameEl.textContent = `👨‍🎓👩‍🎓 ${student.nama}`;
    if (metaEl) {
      const absenText = student.absen ? ` (No. Absen: ${student.absen})` : '';
      metaEl.textContent = `${catMeta.title} • Kelas ${student.kelas} • ${student.sekolah}${absenText}`;
    }

    const headingEl = document.getElementById('karyaDigitalDetailJenisHeading');
    if (headingEl) headingEl.textContent = `${catMeta.icon} ${catMeta.title} Siswa`;

    const countBadge = document.getElementById('karyaDigitalCountBadge');
    if (countBadge) countBadge.textContent = `${filteredKarya.length} Karya`;

    const container = document.getElementById('karyaDigitalDetailList');
    if (container) {
      if (filteredKarya.length === 0) {
        container.innerHTML = `
          <div class="siswa-empty-state" style="padding: 32px 10px;">
            <span class="siswa-empty-icon" style="font-size: 2rem;">${catMeta.icon}</span>
            <div style="font-size: 0.95rem; font-weight: 700;">Belum ada ${escapeHtml(catMeta.title)}</div>
            <small style="color: var(--text3);">Siswa belum mengirimkan karya pada kategori ${escapeHtml(catMeta.title)}.</small>
          </div>
        `;
      } else {
        container.innerHTML = filteredKarya.map((row, idx) => renderCreateKaryaCard(row, idx)).join('');
      }
    }

    const listView = document.getElementById('karyaDigitalListView');
    const detailView = document.getElementById('karyaDigitalDetailView');
    if (listView) listView.style.display = 'none';
    if (detailView) {
      detailView.style.display = 'block';
      scrollToTop();
    }

    hideOverlay();
  } catch (err) {
    console.error('[viewDetailKaryaDigital Error]', err);
    showError(err.message || 'Gagal memuat karya digital siswa dari server.', 'Gagal Memuat Karya');
  }
}

function closeDetailKaryaDigital() {
  currentCreateKaryaList = [];
  currentCreateDetailStudent = null;
  const listView = document.getElementById('karyaDigitalListView');
  const detailView = document.getElementById('karyaDigitalDetailView');
  if (detailView) detailView.style.display = 'none';
  if (listView) {
    listView.style.display = 'block';
    renderKaryaDigitalSiswaTable(currentSiswaList);
  }
}

window.renderKaryaDigitalCategoryGrid = renderKaryaDigitalCategoryGrid;
window.selectKaryaDigitalJenis = selectKaryaDigitalJenis;
window.backToKaryaDigitalJenis = backToKaryaDigitalJenis;
window.renderKaryaDigitalSiswaTable = renderKaryaDigitalSiswaTable;
window.handleSearchKaryaDigitalSiswa = handleSearchKaryaDigitalSiswa;
window.loadKaryaDigitalSiswaTable = loadKaryaDigitalSiswaTable;
window.viewDetailKaryaDigital = viewDetailKaryaDigital;
window.closeDetailKaryaDigital = closeDetailKaryaDigital;

// ==========================================
// EKSPOR PDF MULTI-HALAMAN (ANSWER, DISCUSS, EXPLAIN)
// ==========================================

/**
 * Membentuk slug nama file dengan format nama_KELAS_SEKOLAH
 * @param {string} nama
 * @param {string} kelas
 * @param {string} sekolah
 * @param {string} [fallback='data']
 * @returns {string}
 */
function buildIdentityFilenameSlug(nama, kelas, sekolah, fallback = 'data') {
  const partNama = sanitizeCreateFilename(nama, fallback);
  const partKelas = sanitizeCreateFilename(kelas, '');
  const partSekolah = sanitizeCreateFilename(sekolah, '');
  return [partNama, partKelas, partSekolah].filter(Boolean).join('_');
}

/**
 * Membuat builder dokumen A4 multi-halaman berbasis HTML5 Canvas (1240x1754 px per halaman)
 * untuk menghasilkan file PDF yang rapi tanpa memotong teks panjang.
 * @param {object} opts
 */
function createA4PaginatedPdfDoc(opts) {
  const W = 1240;
  const H = 1754;
  const marginX = 72;
  const contentW = W - marginX * 2; // 1096
  const bottomSafeY = 1586;

  const theme = Object.assign({
    pageBg: '#F8FCF9',
    gradStart: '#0A3D1F',
    gradEnd: '#15803D',
    pillBg: 'rgba(255,255,255,0.2)',
    pillText: '#DCFCE7',
    subtitleText: '#BBF7D0',
    accent: '#15803D',
    footerBg: '#0A3D1F',
    footerSub: '#BBF7D0',
    kicker: 'ECOMEDIA RADEC',
    title: 'Laporan Respons Siswa',
    subtitle: '',
    footerLabel: 'EcoMedia RADEC'
  }, opts || {});

  const pages = [];
  let curCanvas = null;
  let ctx = null;
  let curY = 0;

  function startNewPage(isFirst) {
    const res = createCreateOffscreenCanvas(W, H);
    if (!res) {
      throw new Error('Canvas tidak tersedia di browser untuk membuat PDF.');
    }
    curCanvas = res.canvas;
    ctx = res.ctx;
    pages.push({ canvas: curCanvas, ctx });

    // Background halaman
    ctx.fillStyle = theme.pageBg;
    ctx.fillRect(0, 0, W, H);

    if (isFirst) {
      // Header Banner penuh halaman pertama
      const headGrad = ctx.createLinearGradient(0, 0, W, 240);
      headGrad.addColorStop(0, theme.gradStart);
      headGrad.addColorStop(1, theme.gradEnd);
      ctx.fillStyle = headGrad;
      ctx.fillRect(0, 0, W, 232);

      // Pill kicker
      ctx.font = '800 19px Nunito, Arial, sans-serif';
      const kickerWidth = Math.min(contentW, ctx.measureText(theme.kicker).width + 44);
      drawCreateRoundedRect(ctx, marginX, 38, kickerWidth, 38, 19, theme.pillBg);
      ctx.fillStyle = theme.pillText;
      ctx.textAlign = 'left';
      ctx.fillText(theme.kicker, marginX + 22, 63);

      // Judul utama
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 38px Sora, Arial, sans-serif';
      const titleLines = wrapCreateCanvasLines(ctx, theme.title, contentW);
      const afterTitleY = drawCreateWrappedTextLines(ctx, titleLines, marginX, 128, 46, 'left', 2);

      // Subjudul
      if (theme.subtitle) {
        ctx.fillStyle = theme.subtitleText;
        ctx.font = '700 22px Nunito, Arial, sans-serif';
        const subLines = wrapCreateCanvasLines(ctx, theme.subtitle, contentW);
        drawCreateWrappedTextLines(ctx, subLines, marginX, Math.max(afterTitleY + 6, 184), 30, 'left', 1);
      }

      curY = 264;
    } else {
      // Header lanjutan ringkas
      const contGrad = ctx.createLinearGradient(0, 0, W, 94);
      contGrad.addColorStop(0, theme.gradStart);
      contGrad.addColorStop(1, theme.gradEnd);
      ctx.fillStyle = contGrad;
      ctx.fillRect(0, 0, W, 94);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 23px Sora, Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Lanjutan · ${theme.title}`, marginX, 56);

      ctx.fillStyle = theme.pillText;
      ctx.font = '700 18px Nunito, Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(theme.kicker, W - marginX, 55);
      ctx.textAlign = 'left';

      curY = 128;
    }
  }

  function ensureSpace(neededHeight) {
    if (!curCanvas) startNewPage(true);
    if (curY + neededHeight > bottomSafeY && curY > 150) {
      startNewPage(false);
    }
  }

  // Inisialisasi halaman pertama
  startNewPage(true);

  /**
   * Menambahkan kartu informasi (Identitas Siswa / Kelompok / Anggota / Peran)
   */
  function addInfoBlock(title, rows, styleOpts = {}) {
    const bg = styleOpts.bg || '#FFFFFF';
    const border = styleOpts.border || '#CBD5E1';
    const accent = styleOpts.accent || theme.accent;
    const titleColor = styleOpts.titleColor || accent;

    ctx.font = '700 22px Nunito, Arial, sans-serif';
    const wrappedRows = [];
    rows.forEach(r => {
      if (!r) return;
      const lines = wrapCreateCanvasLines(ctx, r, contentW - 64);
      lines.forEach(l => wrappedRows.push(l));
    });
    if (wrappedRows.length === 0) return;

    const lineH = 34;
    const totalH = 62 + wrappedRows.length * lineH + 16;
    ensureSpace(totalH);

    drawCreateRoundedRect(ctx, marginX, curY, contentW, totalH, 16, bg, border, 2);
    drawCreateRoundedRect(ctx, marginX, curY, 10, totalH, 5, accent);

    ctx.fillStyle = titleColor;
    ctx.font = '800 19px Nunito, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(title, marginX + 28, curY + 38);

    ctx.fillStyle = '#1E293B';
    ctx.font = '700 22px Nunito, Arial, sans-serif';
    drawCreateWrappedTextLines(ctx, wrappedRows, marginX + 28, curY + 74, lineH, 'left');

    curY += totalH + 18;
  }

  /**
   * Menambahkan judul seksi sebelum daftar kartu
   */
  function addSectionHeading(title, badgeText, badgeBg, badgeColor, accentColor) {
    ensureSpace(74);
    drawCreateRoundedRect(ctx, marginX, curY + 6, 8, 34, 4, accentColor || theme.accent);

    ctx.fillStyle = '#0F172A';
    ctx.font = '800 26px Sora, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(title, marginX + 22, curY + 32);

    if (badgeText) {
      ctx.font = '800 19px Nunito, Arial, sans-serif';
      const bw = Math.max(120, ctx.measureText(badgeText).width + 32);
      drawCreateRoundedRect(ctx, W - marginX - bw, curY + 4, bw, 38, 19, badgeBg || '#F1F5F9');
      ctx.fillStyle = badgeColor || '#334155';
      ctx.textAlign = 'center';
      ctx.fillText(badgeText, W - marginX - bw / 2, curY + 29);
      ctx.textAlign = 'left';
    }

    curY += 58;
  }

  /**
   * Menambahkan kartu soal/pertanyaan & jawaban dengan penanganan multi-halaman otomatis
   */
  function addQaCard(optsCard) {
    const innerW = contentW - 56;
    const textWrapW = innerW - 36;

    ctx.font = '800 23px Sora, Arial, sans-serif';
    const titleLines = optsCard.titleText ? wrapCreateCanvasLines(ctx, optsCard.titleText, innerW - 150) : [];

    ctx.font = '600 21px Nunito, Arial, sans-serif';
    const qLines = optsCard.qText ? wrapCreateCanvasLines(ctx, optsCard.qText, textWrapW) : [];

    ctx.font = '600 22px Nunito, Arial, sans-serif';
    const aLines = wrapCreateCanvasLines(ctx, optsCard.aText || '-', textWrapW);

    ctx.font = 'italic 19px Nunito, Arial, sans-serif';
    const noteLines = optsCard.extraNote ? wrapCreateCanvasLines(ctx, optsCard.extraNote, innerW) : [];

    const headerH = 44 + (titleLines.length > 0 ? titleLines.length * 30 + 6 : 0);
    const qBoxH = qLines.length > 0 ? (46 + qLines.length * 31 + 14) : 0;
    const aBoxH = 46 + Math.max(1, aLines.length) * 33 + 16;
    const noteH = noteLines.length > 0 ? (18 + noteLines.length * 26) : 0;
    const totalH = 22 + headerH + (qBoxH ? qBoxH + 14 : 0) + aBoxH + noteH + 22;

    const maxPageBodyH = bottomSafeY - 140;

    // Jika kartu muat dalam 1 halaman, pastikan tidak terpotong antar halaman
    if (totalH <= maxPageBodyH) {
      ensureSpace(totalH);
      drawSingleQaCard(optsCard, titleLines, qLines, aLines, noteLines, headerH, qBoxH, aBoxH, totalH);
      curY += totalH + 16;
      return;
    }

    // Jika jawaban sangat panjang (> 1 halaman), pecah baris jawaban per chunk agar tetap utuh 100%
    ensureSpace(Math.min(360, 22 + headerH + qBoxH + 140));

    // Gambar blok header + pertanyaan dulu
    const introH = 22 + headerH + (qBoxH ? qBoxH + 14 : 0) + 18;
    drawCreateRoundedRect(ctx, marginX, curY, contentW, introH, 16, '#FFFFFF', optsCard.cardBorder || '#CBD5E1', 2);
    drawCreateRoundedRect(ctx, marginX, curY, 10, introH, 5, optsCard.cardAccent || theme.accent);
    drawCardHeaderAndQuestion(optsCard, titleLines, qLines, headerH, qBoxH);
    curY += introH + 10;

    // Alirkan baris jawaban per halaman
    let lineOffset = 0;
    while (lineOffset < aLines.length) {
      const availH = bottomSafeY - curY - 40;
      const maxChunkLines = Math.max(4, Math.floor((availH - 64) / 33));
      const chunk = aLines.slice(lineOffset, lineOffset + maxChunkLines);
      const chunkBoxH = 46 + chunk.length * 33 + 16;

      drawCreateRoundedRect(ctx, marginX, curY, contentW, chunkBoxH + 20, 14, '#FFFFFF', optsCard.cardBorder || '#CBD5E1', 1.5);
      drawCreateRoundedRect(ctx, marginX + 24, curY + 10, innerW, chunkBoxH, 10, optsCard.aBg || '#F8FAFC', optsCard.aBorder || '#E2E8F0', 1.5);

      ctx.fillStyle = optsCard.aLabelColor || '#475569';
      ctx.font = '800 17px Nunito, Arial, sans-serif';
      ctx.textAlign = 'left';
      const chunkTitle = lineOffset === 0 ? (optsCard.aLabel || 'JAWABAN') : `${optsCard.aLabel || 'JAWABAN'} (Lanjutan)`;
      ctx.fillText(chunkTitle, marginX + 42, curY + 38);

      ctx.fillStyle = optsCard.aColor || '#0F172A';
      ctx.font = '600 22px Nunito, Arial, sans-serif';
      drawCreateWrappedTextLines(ctx, chunk, marginX + 42, curY + 72, 33, 'left');

      lineOffset += chunk.length;
      curY += chunkBoxH + 28;
      if (lineOffset < aLines.length) {
        startNewPage(false);
      }
    }

    if (noteLines.length > 0) {
      ensureSpace(noteLines.length * 28 + 20);
      ctx.fillStyle = '#475569';
      ctx.font = 'italic 19px Nunito, Arial, sans-serif';
      drawCreateWrappedTextLines(ctx, noteLines, marginX + 28, curY + 16, 26, 'left');
      curY += noteLines.length * 26 + 20;
    }
  }

  function drawCardHeaderAndQuestion(optsCard, titleLines, qLines, headerH, qBoxH) {
    const innerW = contentW - 56;
    const bx = marginX + 28;
    let y = curY + 22;

    // Badge kiri
    ctx.font = '800 18px Nunito, Arial, sans-serif';
    const badgeLabel = optsCard.badgeText || 'Item';
    const badgeW = Math.max(90, ctx.measureText(badgeLabel).width + 28);
    drawCreateRoundedRect(ctx, bx, y, badgeW, 34, 17, optsCard.badgeBg || '#F1F5F9');
    ctx.fillStyle = optsCard.badgeColor || '#1E293B';
    ctx.textAlign = 'center';
    ctx.fillText(badgeLabel, bx + badgeW / 2, y + 23);
    ctx.textAlign = 'left';

    // Meta kanan
    if (optsCard.rightMeta) {
      ctx.fillStyle = '#64748B';
      ctx.font = '700 18px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(optsCard.rightMeta, marginX + contentW - 24, y + 23);
      ctx.textAlign = 'left';
    }

    if (titleLines.length > 0) {
      ctx.fillStyle = '#0F172A';
      ctx.font = '800 23px Sora, Arial, sans-serif';
      drawCreateWrappedTextLines(ctx, titleLines, bx, y + 60, 30, 'left');
    }

    y += headerH;

    if (qLines.length > 0) {
      drawCreateRoundedRect(ctx, bx, y, innerW, qBoxH, 10, '#F8FAFC', '#E2E8F0', 1.5);
      ctx.fillStyle = '#475569';
      ctx.font = '800 17px Nunito, Arial, sans-serif';
      ctx.fillText(optsCard.qLabel || 'PERTANYAAN:', bx + 18, y + 28);

      ctx.fillStyle = '#1E293B';
      ctx.font = '600 21px Nunito, Arial, sans-serif';
      drawCreateWrappedTextLines(ctx, qLines, bx + 18, y + 60, 31, 'left');
    }
  }

  function drawSingleQaCard(optsCard, titleLines, qLines, aLines, noteLines, headerH, qBoxH, aBoxH, totalH) {
    const innerW = contentW - 56;
    const bx = marginX + 28;

    drawCreateRoundedRect(ctx, marginX, curY, contentW, totalH, 16, '#FFFFFF', optsCard.cardBorder || '#CBD5E1', 2);
    drawCreateRoundedRect(ctx, marginX, curY, 10, totalH, 5, optsCard.cardAccent || theme.accent);

    drawCardHeaderAndQuestion(optsCard, titleLines, qLines, headerH, qBoxH);

    let y = curY + 22 + headerH + (qBoxH ? qBoxH + 14 : 0);

    // Answer Box
    drawCreateRoundedRect(ctx, bx, y, innerW, aBoxH, 10, optsCard.aBg || '#F0FDF4', optsCard.aBorder || '#BBF7D0', 1.5);
    ctx.fillStyle = optsCard.aLabelColor || '#166534';
    ctx.font = '800 17px Nunito, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(optsCard.aLabel || 'JAWABAN:', bx + 18, y + 28);

    ctx.fillStyle = optsCard.aColor || '#064E3B';
    ctx.font = '600 22px Nunito, Arial, sans-serif';
    drawCreateWrappedTextLines(ctx, aLines, bx + 18, y + 62, 33, 'left');

    y += aBoxH;

    if (noteLines.length > 0) {
      ctx.fillStyle = '#475569';
      ctx.font = 'italic 19px Nunito, Arial, sans-serif';
      drawCreateWrappedTextLines(ctx, noteLines, bx, y + 24, 26, 'left');
    }
  }

  /**
   * Menambahkan kartu tanggapan Ecomedia (1 atau beberapa field teks)
   */
  function addEcoCard(optsEco) {
    const innerW = contentW - 56;
    const textWrapW = innerW - 36;
    const measuredFields = [];

    ctx.font = '600 21px Nunito, Arial, sans-serif';
    (optsEco.fields || []).forEach(f => {
      const fLines = wrapCreateCanvasLines(ctx, f.text || '-', textWrapW);
      const boxH = 44 + Math.max(1, fLines.length) * 31 + 14;
      measuredFields.push({ ...f, lines: fLines, boxH });
    });

    const fieldsTotalH = measuredFields.reduce((acc, f) => acc + f.boxH + 12, 0);
    const totalH = 22 + 54 + fieldsTotalH + 12;

    const cBorder = optsEco.cardBorder || '#86EFAC';
    const cAccent = optsEco.cardAccent || '#168246';
    const bBg = optsEco.badgeBg || '#DCFCE7';
    const bColor = optsEco.badgeColor || '#166534';

    if (totalH <= bottomSafeY - 140) {
      ensureSpace(totalH);
      drawCreateRoundedRect(ctx, marginX, curY, contentW, totalH, 16, '#FFFFFF', cBorder, 2);
      drawCreateRoundedRect(ctx, marginX, curY, 10, totalH, 5, cAccent);

      const bx = marginX + 28;
      let y = curY + 22;

      ctx.font = '800 18px Nunito, Arial, sans-serif';
      const bw = Math.max(100, ctx.measureText(optsEco.badgeText || 'Ecomedia').width + 26);
      drawCreateRoundedRect(ctx, bx, y, bw, 34, 17, bBg);
      ctx.fillStyle = bColor;
      ctx.textAlign = 'center';
      ctx.fillText(optsEco.badgeText || 'Ecomedia', bx + bw / 2, y + 23);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#0F172A';
      ctx.font = '800 22px Sora, Arial, sans-serif';
      ctx.fillText(optsEco.titleText || '', bx + bw + 14, y + 24);

      if (optsEco.rightMeta) {
        ctx.fillStyle = '#64748B';
        ctx.font = '700 18px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(optsEco.rightMeta, marginX + contentW - 24, y + 23);
        ctx.textAlign = 'left';
      }

      y += 52;
      measuredFields.forEach(f => {
        drawCreateRoundedRect(ctx, bx, y, innerW, f.boxH, 10, f.bg || '#F0FDF4', f.border || '#BBF7D0', 1.5);
        ctx.fillStyle = f.labelColor || '#475569';
        ctx.font = '800 17px Nunito, Arial, sans-serif';
        ctx.fillText(f.label, bx + 18, y + 27);

        ctx.fillStyle = f.textColor || '#1E293B';
        ctx.font = '600 21px Nunito, Arial, sans-serif';
        drawCreateWrappedTextLines(ctx, f.lines, bx + 18, y + 58, 31, 'left');
        y += f.boxH + 12;
      });

      curY += totalH + 16;
    } else {
      // Fallback aman bila kartu sangat tinggi: pecah per field antar halaman
      addSectionHeading(optsEco.titleText || 'Tanggapan', optsEco.badgeText, bBg, bColor, cAccent);
      measuredFields.forEach(f => {
        ensureSpace(f.boxH + 24);
        drawCreateRoundedRect(ctx, marginX, curY, contentW, f.boxH + 16, 12, f.bg || '#F0FDF4', f.border || '#BBF7D0', 1.5);
        ctx.fillStyle = f.labelColor || '#475569';
        ctx.font = '800 17px Nunito, Arial, sans-serif';
        ctx.fillText(f.label, marginX + 24, curY + 30);

        ctx.fillStyle = f.textColor || '#1E293B';
        ctx.font = '600 21px Nunito, Arial, sans-serif';
        drawCreateWrappedTextLines(ctx, f.lines, marginX + 24, curY + 62, 31, 'left');
        curY += f.boxH + 24;
      });
    }
  }

  /**
   * Menambahkan blok grafik batang ekoliterasi 3 kategori (Aku tahu, Aku peduli, Aku bertindak)
   */
  function addEkoliterasiChartBlock(skor, umpanBalik = '') {
    const dims = [
      { key: 'tahu', label: 'Aku tahu', color: '#1266AE', val: Math.max(0, Math.min(100, Number(skor && skor.tahu) || 0)) },
      { key: 'peduli', label: 'Aku peduli', color: '#C4213C', val: Math.max(0, Math.min(100, Number(skor && skor.peduli) || 0)) },
      { key: 'aksi', label: 'Aku bertindak', color: '#157F3D', val: Math.max(0, Math.min(100, Number(skor && skor.aksi) || 0)) }
    ];

    ctx.font = '600 20px Nunito, Arial, sans-serif';
    const fbLines = umpanBalik ? wrapCreateCanvasLines(ctx, String(umpanBalik).trim(), contentW - 88) : [];
    const fbBoxH = fbLines.length > 0 ? (34 + fbLines.length * 29 + 18) : 0;
    const totalH = 74 + dims.length * 58 + (fbBoxH ? fbBoxH + 22 : 16);

    ensureSpace(totalH);
    drawCreateRoundedRect(ctx, marginX, curY, contentW, totalH, 16, '#FFFFFF', '#A7F3D0', 2);
    drawCreateRoundedRect(ctx, marginX, curY, 10, totalH, 5, '#059669');

    const bx = marginX + 28;
    let y = curY + 38;
    ctx.fillStyle = '#047857';
    ctx.font = '800 21px Sora, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📊 Grafik Ekoliterasi Siswa (3 Dimensi)', bx, y);
    y += 38;

    const labelW = 190;
    const valW = 84;
    const trackX = bx + labelW + 12;
    const trackW = contentW - 56 - labelW - valW - 24;

    dims.forEach(d => {
      ctx.fillStyle = '#1E293B';
      ctx.font = '800 21px Nunito, Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(d.label, bx, y + 20);

      drawCreateRoundedRect(ctx, trackX, y, trackW, 28, 14, '#EBF2EC', '#DAE7DC', 1.5);
      if (d.val > 0) {
        const fillW = Math.max(28, Math.round((trackW * d.val) / 100));
        drawCreateRoundedRect(ctx, trackX, y, fillW, 28, 14, d.color);
      }

      ctx.fillStyle = d.color;
      ctx.font = '800 22px Sora, Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${d.val}%`, marginX + contentW - 28, y + 21);
      ctx.textAlign = 'left';
      y += 58;
    });

    if (fbLines.length > 0) {
      y += 4;
      drawCreateRoundedRect(ctx, bx, y, contentW - 56, fbBoxH, 12, '#F0FDF4', '#86EFAC', 1.5);
      drawCreateRoundedRect(ctx, bx, y, 6, fbBoxH, 3, '#157F3D');
      ctx.fillStyle = '#0A4A22';
      ctx.font = '600 20px Nunito, Arial, sans-serif';
      drawCreateWrappedTextLines(ctx, fbLines, bx + 20, y + 36, 29, 'left');
    }

    curY += totalH + 18;
  }

  /**
   * Menambahkan footer di semua halaman dan mengunduh file PDF
   */
  function savePdf(filename, extraPages = []) {
    const validExtra = Array.isArray(extraPages) ? extraPages.filter(ep => ep && ep.dataUrl) : [];
    const totalPages = pages.length + validExtra.length;
    const todayStr = new Date().toLocaleDateString('id-ID');

    const jpegPages = pages.map((p, idx) => {
      const pCtx = p.ctx;
      drawCreateRoundedRect(pCtx, marginX, 1624, contentW, 74, 16, theme.footerBg);
      pCtx.fillStyle = '#FFFFFF';
      pCtx.font = '800 20px Nunito, Arial, sans-serif';
      pCtx.textAlign = 'left';
      pCtx.fillText(theme.footerLabel, marginX + 28, 1669);

      pCtx.fillStyle = theme.footerSub;
      pCtx.font = '700 19px Nunito, Arial, sans-serif';
      pCtx.textAlign = 'right';
      pCtx.fillText(`📅 ${todayStr}  ·  Halaman ${idx + 1} dari ${totalPages}`, W - marginX - 28, 1669);
      pCtx.textAlign = 'left';

      return {
        dataUrl: p.canvas.toDataURL('image/jpeg', 0.92),
        width: W,
        height: H,
        pageW: 595,
        pageH: 842
      };
    });

    validExtra.forEach(ep => {
      jpegPages.push({
        dataUrl: ep.dataUrl,
        width: ep.width,
        height: ep.height,
        pageW: ep.pageW || 595,
        pageH: ep.pageH || 842
      });
    });

    const pdfBytes = buildMultiPagePdfFromJpegDataUrls(jpegPages, 595, 842);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    triggerCreateFileDownload(blob, filename);
  }

  return {
    addInfoBlock,
    addSectionHeading,
    addQaCard,
    addEcoCard,
    addEkoliterasiChartBlock,
    savePdf
  };
}

/**
 * Mengunduh PDF jawaban siswa per blok materi pada menu ANSWER (Tahap 2)
 * @param {string} matKey - Nomor materi ('1' s.d. '5')
 */
function downloadAnswerMateriPdf(matKey) {
  const student = currentAnswerDetailStudent;
  if (!student) {
    showError('Data siswa belum dimuat.', 'Gagal Mengunduh');
    return;
  }

  const items = currentAnswerGroupedByMateri[String(matKey)] || [];
  if (!Array.isArray(items) || items.length === 0) {
    showError('Belum ada jawaban siswa pada materi ini untuk diunduh.', 'Data Kosong');
    return;
  }

  const materiObj = DAFTAR_MATERI_ANSWER.find(m => m.id === String(matKey)) || {
    id: String(matKey),
    key: `materi-${matKey}`,
    title: getNamaMateri(`materi-${matKey}`)
  };

  try {
    const doc = createA4PaginatedPdfDoc({
      pageBg: '#FAF8FF',
      gradStart: '#4C1D95',
      gradEnd: '#7C3AED',
      pillBg: 'rgba(255,255,255,0.2)',
      pillText: '#F3E8FF',
      subtitleText: '#EDE9FE',
      accent: '#6D28D9',
      footerBg: '#3B0764',
      footerSub: '#DDD6FE',
      kicker: 'TAHAP 2 · ANSWER · ECOMEDIA RADEC',
      title: materiObj.title,
      subtitle: 'Rekapitulasi Jawaban Pra-Konsepsi Siswa',
      footerLabel: `✍️ ${student.nama || 'Siswa'} · ${materiObj.title}`
    });

    const answeredCount = items.filter(it => it && it.hasAnswer).length;
    const absenText = (student.absen && student.absen !== '-') ? ` (No. Absen: ${student.absen})` : '';
    doc.addInfoBlock('🎒 IDENTITAS SISWA', [
      `Nama Siswa: ${student.nama || 'Siswa'}${absenText}`,
      `Kelas: ${student.kelas || '-'}   ·   Sekolah: ${student.sekolah || '-'}   ·   Terjawab: ${answeredCount} dari ${items.length} Soal`
    ], {
      bg: '#FFFFFF',
      border: '#DDD6FE',
      accent: '#7C3AED',
      titleColor: '#6D28D9'
    });

    doc.addSectionHeading(
      'Daftar Jawaban Siswa',
      `${items.length} Soal · ${answeredCount} Terjawab`,
      '#F3E8FF',
      '#6B21A8',
      '#7C3AED'
    );

    items.forEach((item, idx) => {
      const idSoal = item.id_soal ? `Soal #${item.id_soal}` : `Soal #${idx + 1}`;
      const jawabanSiswa = item.jawaban_siswa ? String(item.jawaban_siswa).trim() : '(Belum menjawab)';
      const formattedNlp = formatNlpScoreDisplay(item.nilai_nlp);
      const nilaiNlp = formattedNlp !== null
        ? `🎯 Skor NLP: ${formattedNlp} / 4`
        : '🎯 Skor NLP: -';

      doc.addQaCard({
        badgeText: idSoal,
        badgeBg: '#F3E8FF',
        badgeColor: '#6B21A8',
        titleText: materiObj.title,
        rightMeta: `#${idx + 1} · ${materiObj.key}`,
        qText: item.pertanyaan ? String(item.pertanyaan).trim() : '',
        qLabel: '❓ PERTANYAAN:',
        aLabel: '📝 JAWABAN SISWA:',
        aText: jawabanSiswa,
        aBg: '#FAF5FF',
        aBorder: '#E9D5FF',
        aLabelColor: '#6B21A8',
        aColor: '#3B0764',
        cardBorder: '#DDD6FE',
        cardAccent: '#7C3AED',
        extraNote: nilaiNlp
      });
    });

    doc.addInfoBlock(
      '📊 KETERANGAN 4 LEVEL NILAI NLP (SKALA 1–4)',
      NLP_RUBRIC_LEVELS.map(r => r.desc ? `(${r.level}) ${r.desc.replace(/^\(\d+\)\s*/i, '')}` : ''),
      {
        bg: '#FFFFFF',
        border: '#DDD6FE',
        accent: '#6D28D9',
        titleColor: '#5B21B6'
      }
    );

    const studentSlug = buildIdentityFilenameSlug(student.nama, student.kelas, student.sekolah, 'siswa');
    const filename = `jawaban-answer-materi-${matKey}-${studentSlug}.pdf`;
    doc.savePdf(filename);

  } catch (err) {
    console.error('[downloadAnswerMateriPdf Error]', err);
    showError(err.message || 'Gagal menghasilkan file PDF jawaban siswa.', 'Gagal Mengunduh PDF');
  }
}

/**
 * Mengunduh PDF hasil diskusi kelompok pada menu DISCUSS (Tahap 3)
 */
function downloadDiscussPdf() {
  const payload = currentDiscussDetailPayload;
  if (!payload || !payload.group) {
    showError('Data diskusi kelompok belum dimuat.', 'Gagal Mengunduh');
    return;
  }

  const { group, kelas, sekolah, members, parsedRoles, rawKeterangan, discussItems, studentQuestions, ecomediaItems } = payload;
  const hasDiscuss = Array.isArray(discussItems) && discussItems.length > 0;
  const hasStudentQ = Array.isArray(studentQuestions) && studentQuestions.length > 0;
  const hasEco = Array.isArray(ecomediaItems) && ecomediaItems.length > 0;

  if (!hasDiscuss && !hasStudentQ && !hasEco) {
    showError('Belum ada data diskusi, pertanyaan siswa, atau tanggapan Ecomedia kelompok untuk diunduh.', 'Data Kosong');
    return;
  }

  try {
    const cleanMatNum = String(group.id_materi || '1').replace(/\D+/g, '') || '1';
    const judulMateriKelompok = getNamaMateri(`materi-${cleanMatNum}`);

    const doc = createA4PaginatedPdfDoc({
      pageBg: '#FFFDF7',
      gradStart: '#92400E',
      gradEnd: '#D97706',
      pillBg: 'rgba(255,255,255,0.2)',
      pillText: '#FEF3C7',
      subtitleText: '#FDE68A',
      accent: '#D97706',
      footerBg: '#78350F',
      footerSub: '#FDE68A',
      kicker: 'TAHAP 3 · DISCUSS · ECOMEDIA RADEC',
      title: `Kelompok ${group.nama_kelompok || '-'}`,
      subtitle: `${judulMateriKelompok} · Kelas ${kelas || '-'} · ${sekolah || '-'}`,
      footerLabel: `🗣️ Kelompok ${group.nama_kelompok || '-'} · Kelas ${kelas || '-'}`
    });

    const infoRows = [
      `Nama Kelompok: ${group.nama_kelompok || '-'}   ·   Materi: ${judulMateriKelompok}`,
      `Kelas: ${kelas || '-'}   ·   Sekolah: ${sekolah || '-'}`,
      `Anggota Kelompok: ${members || '-'}`
    ];

    doc.addInfoBlock('👥 IDENTITAS & ANGGOTA KELOMPOK', infoRows, {
      bg: '#FFFFFF',
      border: '#FDE68A',
      accent: '#D97706',
      titleColor: '#B45309'
    });

    if (Array.isArray(parsedRoles) && parsedRoles.length > 0) {
      const roleLines = parsedRoles.map(r => `• ${r.nama} [${r.peran}]`);
      doc.addInfoBlock('PEMBAGIAN PERAN KELOMPOK', roleLines, {
        bg: '#F0FDF4',
        border: '#86EFAC',
        accent: '#168246',
        titleColor: '#166534'
      });
    } else if (rawKeterangan && typeof rawKeterangan === 'string' && rawKeterangan.trim() && rawKeterangan.trim() !== '{}' && rawKeterangan.trim() !== 'null') {
      doc.addInfoBlock('PEMBAGIAN PERAN KELOMPOK', [rawKeterangan.trim()], {
        bg: '#F0FDF4',
        border: '#86EFAC',
        accent: '#168246',
        titleColor: '#166534'
      });
    }

    if (hasDiscuss) {
      doc.addSectionHeading(
        'Pertanyaan Utama & Jawaban Anggota',
        `${discussItems.length} Soal`,
        '#FEF3C7',
        '#92400E',
        '#D97706'
      );

      discussItems.forEach((item, idx) => {
        const rawMateri = String(item.id_materi !== undefined && item.id_materi !== null ? item.id_materi : '').trim();
        const normalizedMateriId = rawMateri.startsWith('materi-') ? rawMateri : (rawMateri ? 'materi-' + rawMateri : 'materi-1');
        const judulMateri = getNamaMateri(normalizedMateriId);
        const idSoalBadge = item.id_soal ? `Soal #${item.id_soal}` : `Soal #${idx + 1}`;
        const pertanyaanText = item.pertanyaan ? item.pertanyaan : `Pertanyaan nomor ${item.id_soal || idx + 1}`;
        const membersList = Array.isArray(item.memberAnswers) ? item.memberAnswers : [];

        const fields = [
          {
            label: '❓ PERTANYAAN / TOPIK BAHASAN:',
            text: pertanyaanText,
            bg: '#F8FAFC',
            border: '#E2E8F0',
            labelColor: '#475569',
            textColor: '#0F172A'
          }
        ];

        membersList.forEach(ma => {
          fields.push({
            label: `👤 ${ma.nama}:`,
            text: ma.jawaban || '(Belum menjawab)',
            bg: ma.hasAnswer ? '#FFFBEB' : '#F8FAFC',
            border: ma.hasAnswer ? '#FDE68A' : '#E2E8F0',
            labelColor: ma.hasAnswer ? '#92400E' : '#64748B',
            textColor: ma.hasAnswer ? '#78350F' : '#94A3B8'
          });
        });

        if (item.keterangan) {
          fields.push({
            label: '📌 CATATAN:',
            text: item.keterangan,
            bg: '#F8FAFC',
            border: '#E2E8F0',
            labelColor: '#475569',
            textColor: '#475569'
          });
        }

        doc.addEcoCard({
          badgeText: idSoalBadge,
          badgeBg: '#FEF3C7',
          badgeColor: '#92400E',
          cardBorder: '#FDE68A',
          cardAccent: '#D97706',
          titleText: judulMateri,
          rightMeta: `#${idx + 1} · ${normalizedMateriId}`,
          fields
        });
      });
    }

    if (hasStudentQ) {
      doc.addSectionHeading(
        'Pertanyaan dari Siswa (Individual)',
        `${studentQuestions.length} Pertanyaan`,
        '#E0F2FE',
        '#0369A1',
        '#0284C7'
      );

      studentQuestions.forEach((item, idx) => {
        const rawMateri = String(item.id_materi !== undefined && item.id_materi !== null ? item.id_materi : '1').trim();
        const cleanMat = rawMateri.replace(/\D+/g, '') || '1';
        const memberName = item._memberName || 'Siswa';

        doc.addEcoCard({
          badgeText: memberName,
          badgeBg: '#FEF3C7',
          badgeColor: '#92400E',
          cardBorder: '#BAE6FD',
          cardAccent: '#0284C7',
          titleText: `Materi ${cleanMat} · Pertanyaan Individual`,
          rightMeta: `#${idx + 1}`,
          fields: [
            { label: '❓ PERTANYAAN SISWA:', text: item.pertanyaan || '-', bg: '#F8FAFC', border: '#E2E8F0', labelColor: '#475569', textColor: '#0F172A' },
            { label: '💬 JAWABAN:', text: item._hasAnswer ? item.jawaban : '(Belum menjawab)', bg: item._hasAnswer ? '#FFFBEB' : '#F8FAFC', border: item._hasAnswer ? '#FDE68A' : '#E2E8F0', labelColor: item._hasAnswer ? '#92400E' : '#64748B', textColor: item._hasAnswer ? '#78350F' : '#94A3B8' }
          ]
        });
      });
    }

    if (hasEco) {
      doc.addSectionHeading(
        'Analisis Media Lingkungan (Ecomedia)',
        `${ecomediaItems.length} Tanggapan Anggota`,
        '#DCFCE7',
        '#166534',
        '#168246'
      );

      ecomediaItems.forEach((item, idx) => {
        const rawMateri = String(item.id_materi !== undefined && item.id_materi !== null ? item.id_materi : '').trim();
        const normalizedMateriId = rawMateri.startsWith('materi-') ? rawMateri : (rawMateri ? 'materi-' + rawMateri : 'materi-1');
        const judulMateri = getNamaMateri(normalizedMateriId);
        const memberName = item._memberName || 'Anggota Kelompok';

        doc.addEcoCard({
          badgeText: memberName,
          titleText: judulMateri,
          rightMeta: `#${idx + 1} · Materi ${rawMateri || '1'}`,
          fields: [
            { label: '📖 CERITA & NILAI:', text: item.pesan || '-', bg: '#F0FDF4', border: '#BBF7D0', textColor: '#14532D' },
            { label: '👥 SIAPA YANG BERPERAN:', text: item.siapa || '-', bg: '#F8FAFC', border: '#E2E8F0', textColor: '#1E293B' },
            { label: '⚡ BAHAN, ENERGI, & LIMBAH:', text: item.bahan_energi_limbah || '-', bg: '#FFFBEB', border: '#FDE68A', textColor: '#78350F' }
          ]
        });
      });
    }

    const groupSlug = buildIdentityFilenameSlug(`${group.nama_kelompok || 'kelompok'}-materi-${cleanMatNum}`, kelas, sekolah, 'kelompok');
    doc.savePdf(`diskusi-discuss-${groupSlug}.pdf`);

  } catch (err) {
    console.error('[downloadDiscussPdf Error]', err);
    showError(err.message || 'Gagal menghasilkan file PDF diskusi kelompok.', 'Gagal Mengunduh PDF');
  }
}

/**
 * Mengunduh PDF hasil pemaparan penjelasan kelompok pada menu EXPLAIN (Tahap 4)
 */
function downloadExplainPdf() {
  const payload = currentExplainDetailPayload;
  if (!payload || !payload.group) {
    showError('Data penjelasan kelompok belum dimuat.', 'Gagal Mengunduh');
    return;
  }

  const { group, kelas, sekolah, members, parsedRoles, rawKeterangan, explainItems, studentQuestions, ecomediaItems } = payload;
  const hasExplain = Array.isArray(explainItems) && explainItems.length > 0;
  const hasStudentQ = Array.isArray(studentQuestions) && studentQuestions.length > 0;
  const hasEco = Array.isArray(ecomediaItems) && ecomediaItems.length > 0;

  if (!hasExplain && !hasStudentQ && !hasEco) {
    showError('Belum ada data penjelasan, pertanyaan siswa, atau tanggapan Ecomedia kelompok untuk diunduh.', 'Data Kosong');
    return;
  }

  try {
    const cleanMatNum = String(group.id_materi || '1').replace(/\D+/g, '') || '1';
    const judulMateriKelompok = getNamaMateri(`materi-${cleanMatNum}`);

    const doc = createA4PaginatedPdfDoc({
      pageBg: '#F8FCF9',
      gradStart: '#0A3D1F',
      gradEnd: '#059669',
      pillBg: 'rgba(255,255,255,0.2)',
      pillText: '#DCFCE7',
      subtitleText: '#A7F3D0',
      accent: '#059669',
      footerBg: '#0A3D1F',
      footerSub: '#A7F3D0',
      kicker: 'TAHAP 4 · EXPLAIN · ECOMEDIA RADEC',
      title: `Kelompok ${group.nama_kelompok || '-'}`,
      subtitle: `${judulMateriKelompok} · Kelas ${kelas || '-'} · ${sekolah || '-'}`,
      footerLabel: `📢 Kelompok ${group.nama_kelompok || '-'} · Kelas ${kelas || '-'}`
    });

    const infoRows = [
      `Nama Kelompok: ${group.nama_kelompok || '-'}   ·   Materi: ${judulMateriKelompok}`,
      `Kelas: ${kelas || '-'}   ·   Sekolah: ${sekolah || '-'}`,
      `Anggota Kelompok: ${members || '-'}`
    ];

    doc.addInfoBlock('👥 IDENTITAS & ANGGOTA KELOMPOK', infoRows, {
      bg: '#FFFFFF',
      border: '#A7F3D0',
      accent: '#059669',
      titleColor: '#047857'
    });

    if (Array.isArray(parsedRoles) && parsedRoles.length > 0) {
      const roleLines = parsedRoles.map(r => `• ${r.nama} [${r.peran}]`);
      doc.addInfoBlock('PEMBAGIAN PERAN KELOMPOK', roleLines, {
        bg: '#F0FDF4',
        border: '#86EFAC',
        accent: '#168246',
        titleColor: '#166534'
      });
    } else if (rawKeterangan && typeof rawKeterangan === 'string' && rawKeterangan.trim() && rawKeterangan.trim() !== '{}' && rawKeterangan.trim() !== 'null') {
      doc.addInfoBlock('PEMBAGIAN PERAN KELOMPOK', [rawKeterangan.trim()], {
        bg: '#F0FDF4',
        border: '#86EFAC',
        accent: '#168246',
        titleColor: '#166534'
      });
    }

    if (hasExplain) {
      doc.addSectionHeading(
        'Pertanyaan Utama & Penjelasan Anggota',
        `${explainItems.length} Soal`,
        '#DCFCE7',
        '#166534',
        '#059669'
      );

      explainItems.forEach((item, idx) => {
        const rawMateri = String(item.id_materi !== undefined && item.id_materi !== null ? item.id_materi : '').trim();
        const normalizedMateriId = rawMateri.startsWith('materi-') ? rawMateri : (rawMateri ? 'materi-' + rawMateri : 'materi-1');
        const judulMateri = getNamaMateri(normalizedMateriId);
        const idSoalBadge = item.id_soal ? `Soal #${item.id_soal}` : `Soal #${idx + 1}`;
        const pertanyaanText = item.pertanyaan ? item.pertanyaan : `Pertanyaan nomor ${item.id_soal || idx + 1}`;
        const membersList = Array.isArray(item.memberAnswers) ? item.memberAnswers : [];

        const fields = [
          {
            label: '❓ PERTANYAAN / KONSEP YANG DIJELASKAN:',
            text: pertanyaanText,
            bg: '#F8FAFC',
            border: '#E2E8F0',
            labelColor: '#475569',
            textColor: '#0F172A'
          }
        ];

        membersList.forEach(ma => {
          fields.push({
            label: `👤 ${ma.nama}:`,
            text: ma.jawaban || '(Belum menjawab)',
            bg: ma.hasAnswer ? '#ECFDF5' : '#F8FAFC',
            border: ma.hasAnswer ? '#A7F3D0' : '#E2E8F0',
            labelColor: ma.hasAnswer ? '#047857' : '#64748B',
            textColor: ma.hasAnswer ? '#064E3B' : '#94A3B8'
          });
        });

        if (item.keterangan) {
          fields.push({
            label: '📌 CATATAN:',
            text: item.keterangan,
            bg: '#F8FAFC',
            border: '#E2E8F0',
            labelColor: '#475569',
            textColor: '#475569'
          });
        }

        doc.addEcoCard({
          badgeText: idSoalBadge,
          badgeBg: '#DCFCE7',
          badgeColor: '#166534',
          cardBorder: '#A7F3D0',
          cardAccent: '#059669',
          titleText: judulMateri,
          rightMeta: `#${idx + 1} · ${normalizedMateriId}`,
          fields
        });
      });
    }

    if (hasStudentQ) {
      doc.addSectionHeading(
        'Pertanyaan dari Siswa (Individual)',
        `${studentQuestions.length} Pertanyaan`,
        '#E0F2FE',
        '#0369A1',
        '#0284C7'
      );

      studentQuestions.forEach((item, idx) => {
        const rawMateri = String(item.id_materi !== undefined && item.id_materi !== null ? item.id_materi : '1').trim();
        const cleanMat = rawMateri.replace(/\D+/g, '') || '1';
        const memberName = item._memberName || 'Siswa';

        doc.addEcoCard({
          badgeText: memberName,
          badgeBg: '#DCFCE7',
          badgeColor: '#166534',
          cardBorder: '#BAE6FD',
          cardAccent: '#0284C7',
          titleText: `Materi ${cleanMat} · Pertanyaan Individual`,
          rightMeta: `#${idx + 1}`,
          fields: [
            { label: '❓ PERTANYAAN SISWA:', text: item.pertanyaan || '-', bg: '#F8FAFC', border: '#E2E8F0', labelColor: '#475569', textColor: '#0F172A' },
            { label: '💬 JAWABAN:', text: item._hasAnswer ? item.jawaban : '(Belum menjawab)', bg: item._hasAnswer ? '#ECFDF5' : '#F8FAFC', border: item._hasAnswer ? '#A7F3D0' : '#E2E8F0', labelColor: item._hasAnswer ? '#047857' : '#64748B', textColor: item._hasAnswer ? '#064E3B' : '#94A3B8' }
          ]
        });
      });
    }

    if (hasEco) {
      doc.addSectionHeading(
        'Analisis Media Lingkungan (Ecomedia)',
        `${ecomediaItems.length} Tanggapan Anggota`,
        '#DCFCE7',
        '#166534',
        '#168246'
      );

      ecomediaItems.forEach((item, idx) => {
        const rawMateri = String(item.id_materi !== undefined && item.id_materi !== null ? item.id_materi : '').trim();
        const normalizedMateriId = rawMateri.startsWith('materi-') ? rawMateri : (rawMateri ? 'materi-' + rawMateri : 'materi-1');
        const judulMateri = getNamaMateri(normalizedMateriId);
        const memberName = item._memberName || 'Anggota Kelompok';

        const fields = [
          { label: `👤 ${memberName} — 💡 PAPARAN MEDIA LINGKUNGAN:`, text: item.jawaban || '-', bg: '#F0FDF4', border: '#BBF7D0', labelColor: '#166534', textColor: '#14532D' }
        ];
        if (item.keterangan) {
          fields.push({ label: '📌 CATATAN:', text: item.keterangan, bg: '#F8FAFC', border: '#E2E8F0', textColor: '#475569' });
        }

        doc.addEcoCard({
          badgeText: memberName,
          titleText: judulMateri,
          rightMeta: `#${idx + 1} · Materi ${rawMateri || '1'}`,
          fields
        });
      });
    }

    const groupSlug = buildIdentityFilenameSlug(`${group.nama_kelompok || 'kelompok'}-materi-${cleanMatNum}`, kelas, sekolah, 'kelompok');
    doc.savePdf(`penjelasan-explain-${groupSlug}.pdf`);

  } catch (err) {
    console.error('[downloadExplainPdf Error]', err);
    showError(err.message || 'Gagal menghasilkan file PDF penjelasan kelompok.', 'Gagal Mengunduh PDF');
  }
}

// ==========================================
// PENGELOLAAN MENU LAPORAN PROGRES (EVALUASI & REFLEKSI)
// ==========================================
let currentLaporanDetailStudent = null;
let currentLaporanRecordsByMateri = {};

/**
 * Mengurai field JSON (ekoliterasi_siswa / sertifikat_siswa) secara aman
 * @param {string|object} rawVal
 * @returns {object|null}
 */
function parseEvaluasiJsonField(rawVal) {
  if (!rawVal) return null;
  if (typeof rawVal === 'object') return rawVal;
  try {
    let parsed = JSON.parse(String(rawVal));
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }
    return (parsed && typeof parsed === 'object') ? parsed : null;
  } catch (e) {
    return null;
  }
}

/**
 * Merender daftar siswa pada tabel di Menu Laporan Progres
 * Kolom: No, Nama, Kelas, Sekolah, Opsi (Tombol Lihat)
 * @param {Array} students
 * @param {string} [searchQuery='']
 */
function renderLaporanSiswaTable(students, searchQuery = '') {
  const stats = materiProgressCache.stages['laporan'];
  const matStats = stats && stats.byMateri ? stats.byMateri[String(selectedLaporanMateri || '1')] : null;

  renderStudentProgressList({
    containerId: 'laporanSiswaTableBody',
    countId: 'laporanSiswaCount',
    students: students || currentSiswaList,
    searchQuery,
    emptyIcon: '📊',
    badgeTheme: 'green',
    detailHandlerName: 'viewDetailLaporan',
    getSummary: (s) => {
      if (!matStats) return { count: 0, label: 'Memuat...' };
      const sid = String(s.id_siswa || '').trim();
      const parts = matStats.partsByStudent.get(sid) || 0;
      if (parts === 0) return { count: 0, label: 'Belum ada laporan' };
      return { count: parts, label: `${parts}/3 Bagian Terisi` };
    }
  });
}

/**
 * Filter pencarian realtime untuk daftar siswa di menu Laporan Progres
 */
function handleSearchLaporanSiswa() {
  const searchInput = document.getElementById('searchLaporanSiswaInput');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  if (!query) {
    renderLaporanSiswaTable(currentSiswaList);
    return;
  }

  const filtered = currentSiswaList.filter(s => {
    const matchNama = (s.nama || '').toLowerCase().includes(query);
    const matchSekolah = (s.sekolah || '').toLowerCase().includes(query);
    const matchAbsen = (s.absen || '').toString().toLowerCase().includes(query);
    return matchNama || matchSekolah || matchAbsen;
  });

  renderLaporanSiswaTable(filtered, query);
}

/**
 * Refresh manual daftar siswa di menu Laporan Progres
 */
async function loadLaporanSiswaTable(isManualRefresh = false) {
  if (currentSiswaList.length === 0 || isManualRefresh) {
    await loadDataSiswa(isManualRefresh);
  }
  const searchInput = document.getElementById('searchLaporanSiswaInput');
  if (searchInput && isManualRefresh) {
    searchInput.value = '';
  }
  renderLaporanSiswaTable(currentSiswaList);
  await ensureStageStatsLoaded('laporan', isManualRefresh);
  handleSearchLaporanSiswa();
}

let selectedLaporanMateri = null;

function selectLaporanMateri(matNum) {
  selectedLaporanMateri = String(matNum || '1');
  const titleEl = document.getElementById('laporanSelectedMateriTitle');
  if (titleEl) titleEl.textContent = getNamaMateri('materi-' + selectedLaporanMateri);

  const materiView = document.getElementById('laporanMateriView');
  const listView = document.getElementById('laporanListView');
  const detailView = document.getElementById('laporanDetailView');
  if (materiView) materiView.style.display = 'none';
  if (detailView) detailView.style.display = 'none';
  if (listView) listView.style.display = 'block';

  loadLaporanSiswaTable(false);
}

function backToLaporanMateri() {
  selectedLaporanMateri = null;
  currentLaporanDetailStudent = null;
  currentLaporanRecordsByMateri = {};
  renderMateriSelectorGrid('laporanMateriGrid', 'selectLaporanMateri', 'green', 'Lihat Siswa →', 'laporan');
  const materiView = document.getElementById('laporanMateriView');
  const listView = document.getElementById('laporanListView');
  const detailView = document.getElementById('laporanDetailView');
  if (listView) listView.style.display = 'none';
  if (detailView) detailView.style.display = 'none';
  if (materiView) materiView.style.display = 'block';

  ensureStageStatsLoaded('laporan').then(() => {
    if (document.getElementById('laporanMateriView')?.style.display !== 'none') {
      renderMateriSelectorGrid('laporanMateriGrid', 'selectLaporanMateri', 'green', 'Lihat Siswa →', 'laporan');
    }
  });
}

function downloadLaporanCurrentMateriPdf() {
  downloadLaporanMateriPdf(String(selectedLaporanMateri || '1'));
}

/**
 * Mengambil data 'evaluasi_refleksi_siswa' via API (WHERE id_siswa)
 * dan menampilkan langsung 3 bagian materi terpilih (Tanggapan, Grafik Ekoliterasi, & Sertifikat)
 * @param {string} idSiswa
 */
async function viewDetailLaporan(idSiswa) {
  if (!idSiswa) return;
  const activeMatNum = String(selectedLaporanMateri || '1');
  const m = DAFTAR_MATERI_ANSWER.find(item => item.id === activeMatNum) || {
    id: activeMatNum,
    key: 'materi-' + activeMatNum,
    title: getNamaMateri('materi-' + activeMatNum)
  };

  const student = currentSiswaList.find(s => s.id_siswa === idSiswa) || {
    id_siswa: idSiswa,
    nama: 'Siswa',
    kelas: '-',
    sekolah: '-',
    absen: '-'
  };

  showLoading('Memuat Laporan Progres...', `Mengambil data evaluasi & sertifikat ${m.title}...`);

  try {
    // 1. Ambil data dari tabel evaluasi_refleksi_siswa berdasarkan id_siswa
    let rawEvalList = [];
    try {
      rawEvalList = await EcoApi.getWhere('evaluasi_refleksi_siswa', { id_siswa: idSiswa });
    } catch (err) {
      console.warn('[viewDetailLaporan] getWhere evaluasi_refleksi_siswa gagal, fallback ke EcoApi.get():', err);
      try {
        const allEval = await EcoApi.get('evaluasi_refleksi_siswa');
        if (Array.isArray(allEval)) {
          rawEvalList = allEval.filter(item => item.id_siswa === idSiswa);
        }
      } catch (err2) {
        rawEvalList = [];
      }
    }

    const validEvalList = Array.isArray(rawEvalList) ? rawEvalList : [];

    // 2. Isi Header Detail Siswa
    const nameEl = document.getElementById('laporanDetailStudentName');
    const metaEl = document.getElementById('laporanDetailStudentMeta');
    if (nameEl) nameEl.textContent = `👨‍🎓👩‍🎓 ${student.nama}`;
    if (metaEl) {
      const absenText = student.absen ? ` (No. Absen: ${student.absen})` : '';
      metaEl.textContent = `${m.title} • Kelas ${student.kelas} • ${student.sekolah}${absenText}`;
    }

    // 3. Kelompokkan data berdasarkan materi 1 s.d. 5
    const groupedRecords = { '1': null, '2': null, '3': null, '4': null, '5': null };

    validEvalList.forEach(item => {
      const rawMateri = String(item.id_materi !== undefined && item.id_materi !== null ? item.id_materi : '').trim();
      const cleanNum = rawMateri.replace(/\D+/g, '') || '1';
      if (!groupedRecords[cleanNum]) {
        groupedRecords[cleanNum] = { ...item };
      } else {
        const existing = groupedRecords[cleanNum];
        const curId = Number(item.id_evaluasi || 0);
        const exId = Number(existing.id_evaluasi || 0);
        const mergedTanggapan = (item.tanggapan_siswa && String(item.tanggapan_siswa).trim())
          ? (curId >= exId || !String(existing.tanggapan_siswa || '').trim() ? item.tanggapan_siswa : existing.tanggapan_siswa)
          : existing.tanggapan_siswa;
        const mergedEco = (item.ekoliterasi_siswa && String(item.ekoliterasi_siswa).trim())
          ? (curId >= exId || !String(existing.ekoliterasi_siswa || '').trim() ? item.ekoliterasi_siswa : existing.ekoliterasi_siswa)
          : existing.ekoliterasi_siswa;
        const mergedCert = (item.sertifikat_siswa && String(item.sertifikat_siswa).trim())
          ? (curId >= exId || !String(existing.sertifikat_siswa || '').trim() ? item.sertifikat_siswa : existing.sertifikat_siswa)
          : existing.sertifikat_siswa;

        groupedRecords[cleanNum] = {
          ...(curId >= exId ? item : existing),
          tanggapan_siswa: mergedTanggapan || '',
          ekoliterasi_siswa: mergedEco || '',
          sertifikat_siswa: mergedCert || ''
        };
      }
    });

    currentLaporanDetailStudent = student;
    currentLaporanRecordsByMateri = groupedRecords;

    const rec = groupedRecords[m.id] || null;
    const tanggapanText = rec && rec.tanggapan_siswa && String(rec.tanggapan_siswa).trim()
      ? String(rec.tanggapan_siswa).trim()
      : '';
    const ecoObj = rec ? parseEvaluasiJsonField(rec.ekoliterasi_siswa) : null;
    const certObj = rec ? parseEvaluasiJsonField(rec.sertifikat_siswa) : null;

    const hasTanggapan = !!tanggapanText;
    const hasEco = !!(ecoObj && (ecoObj.skor || ecoObj.jawaban));
    const hasCert = !!(certObj && (certObj.nama || certObj.judul));
    const filledParts = (hasTanggapan ? 1 : 0) + (hasEco ? 1 : 0) + (hasCert ? 1 : 0);

    const headingEl = document.getElementById('laporanDetailMateriHeading');
    if (headingEl) headingEl.textContent = `Evaluasi & Refleksi — ${m.title}`;

    const statusBadgeEl = document.getElementById('laporanStatusBadge');
    if (statusBadgeEl) statusBadgeEl.textContent = `${filledParts}/3 Bagian Terisi`;

    const btnPdf = document.getElementById('btnDownloadLaporanPdf');
    if (btnPdf) {
      btnPdf.disabled = filledParts === 0;
      btnPdf.title = filledParts === 0
        ? 'Belum ada data evaluasi pada materi ini'
        : `Unduh PDF Evaluasi & Refleksi ${m.title}`;
    }

    // Bagian 1: Tanggapan Siswa
    const tanggapanHtml = hasTanggapan
      ? `
        <div class="response-box" style="margin-bottom: 0; background: #F0F9FF; border-color: #BAE6FD; color: #0C4A6E; font-weight: 600; font-size: 0.9rem; line-height: 1.65; white-space: pre-line;">
          "${escapeHtml(tanggapanText)}"
        </div>
      `
      : `
        <div class="siswa-empty-state" style="padding: 18px 10px; background: #F8FAFC; border-radius: 10px; border: 1px dashed #CBD5E1;">
          <div style="font-size: 0.86rem; font-weight: 700; color: var(--text3);">Belum ada tanggapan hasil pembelajaran pada materi ini.</div>
        </div>
      `;

    // Bagian 2: Grafik Ekoliterasi Siswa (3 kategori warna berbeda + persentase)
    let ecoHtml = '';
    if (hasEco) {
      const skor = ecoObj.skor || {};
      const dims = [
        { key: 'tahu', label: 'Aku tahu', color: '#1266AE', val: Math.max(0, Math.min(100, Number(skor.tahu) || 0)) },
        { key: 'peduli', label: 'Aku peduli', color: '#C4213C', val: Math.max(0, Math.min(100, Number(skor.peduli) || 0)) },
        { key: 'aksi', label: 'Aku bertindak', color: '#157F3D', val: Math.max(0, Math.min(100, Number(skor.aksi) || 0)) }
      ];
      const barsHtml = dims.map(d => `
        <div class="laporan-eco-bar-row">
          <span class="laporan-eco-bar-name">${d.label}</span>
          <div class="laporan-eco-bar-track" aria-label="${d.label} ${d.val}%">
            <span class="laporan-eco-bar-fill" style="width: ${d.val}%; background: ${d.color};"></span>
          </div>
          <span class="laporan-eco-bar-val" style="color: ${d.color};">${d.val}%</span>
        </div>
      `).join('');

      const umpanBalikHtml = ecoObj.umpan_balik
        ? `<div class="laporan-eco-verdict">${escapeHtml(ecoObj.umpan_balik)}</div>`
        : '';

      ecoHtml = `
        <div class="laporan-eco-bars">
          ${barsHtml}
        </div>
        ${umpanBalikHtml}
      `;
    } else {
      ecoHtml = `
        <div class="siswa-empty-state" style="padding: 18px 10px; background: #F8FAFC; border-radius: 10px; border: 1px dashed #CBD5E1;">
          <div style="font-size: 0.86rem; font-weight: 700; color: var(--text3);">Belum ada data grafik ekoliterasi siswa pada materi ini.</div>
        </div>
      `;
    }

    // Bagian 3: Sertifikat Siswa
    let certHtml = '';
    if (hasCert) {
      const certJudul = certObj.judul || 'SERTIFIKAT PENYELESAIAN';
      const certProgram = certObj.program || 'ECOMEDIA DIGITAL BERBASIS RADEC';
      const certNama = certObj.nama || student.nama || 'Sahabat Bumi';
      const certTopik = certObj.topik || 'Perubahan Iklim';
      const certTahapan = certObj.tahapan || 'Read · Answer · Discuss · Explain · Create';
      const certMeta = certObj.meta || [certObj.kelas || student.kelas, certObj.sekolah || student.sekolah].filter(Boolean).join(' · ') || '-';
      const certDate = certObj.issued_at ? new Date(certObj.issued_at).toLocaleDateString('id-ID') : '';

      certHtml = `
        <div class="laporan-certificate">
          <span class="laporan-cert-pill">${escapeHtml(certJudul)}</span>
          <h3 class="laporan-cert-program">${escapeHtml(certProgram)}</h3>
          <div class="laporan-cert-divider"></div>
          <p class="laporan-cert-desc">Diberikan kepada</p>
          <div class="laporan-cert-name">${escapeHtml(certNama)}</div>
          <p class="laporan-cert-desc">telah menyelesaikan pembelajaran <strong>${escapeHtml(certTopik)}</strong> melalui tahapan</p>
          <div class="laporan-cert-stages">${escapeHtml(certTahapan)}</div>
          <div class="laporan-cert-seal">🌍 🏅 🌱</div>
          <div class="laporan-cert-meta">${escapeHtml(certMeta)}${certDate ? ` · Terbit: ${escapeHtml(certDate)}` : ''}</div>
        </div>
      `;
    } else {
      certHtml = `
        <div class="siswa-empty-state" style="padding: 18px 10px; background: #F8FAFC; border-radius: 10px; border: 1px dashed #CBD5E1;">
          <div style="font-size: 0.86rem; font-weight: 700; color: var(--text3);">Siswa belum menerbitkan sertifikat pada materi ini.</div>
        </div>
      `;
    }

    const contentContainer = document.getElementById('laporanDetailContent');
    if (contentContainer) {
      contentContainer.innerHTML = `
        <div class="admin-card laporan-sub-card tanggapan">
          <div class="laporan-sub-head">
            <h5 class="laporan-sub-title">💬 1. Tanggapan Siswa (Hasil Pembelajaran)</h5>
            <span class="badge ${hasTanggapan ? 'badge-blue' : ''}" style="margin: 0; ${!hasTanggapan ? 'background:#F1F5F9;color:#64748B;' : ''}">
              ${hasTanggapan ? '✓ Terisi' : 'Kosong'}
            </span>
          </div>
          ${tanggapanHtml}
        </div>

        <div class="admin-card laporan-sub-card ekoliterasi">
          <div class="laporan-sub-head">
            <h5 class="laporan-sub-title">📊 2. Grafik Ekoliterasi Siswa</h5>
            <span class="badge ${hasEco ? 'badge-green' : ''}" style="margin: 0; ${!hasEco ? 'background:#F1F5F9;color:#64748B;' : ''}">
              ${hasEco ? '✓ Terisi' : 'Kosong'}
            </span>
          </div>
          ${ecoHtml}
        </div>

        <div class="admin-card laporan-sub-card sertifikat">
          <div class="laporan-sub-head">
            <h5 class="laporan-sub-title">🏅 3. Sertifikat Siswa</h5>
            <span class="badge ${hasCert ? 'badge-amber' : ''}" style="margin: 0; ${!hasCert ? 'background:#F1F5F9;color:#64748B;' : ''}">
              ${hasCert ? '✓ Diterbitkan' : 'Belum Ada'}
            </span>
          </div>
          ${certHtml}
        </div>
      `;
    }

    // 4. Ganti tampilan ke Detail View
    const listView = document.getElementById('laporanListView');
    const detailView = document.getElementById('laporanDetailView');
    if (listView) listView.style.display = 'none';
    if (detailView) {
      detailView.style.display = 'block';
      scrollToTop();
    }

    hideOverlay();

  } catch (err) {
    console.error('[viewDetailLaporan Error]', err);
    showError(err.message || 'Gagal memuat laporan progres siswa dari server.', 'Gagal Memuat Detail');
  }
}

/**
 * Menutup tampilan detail dan kembali ke tabel daftar siswa di menu Laporan Progres
 */
function closeDetailLaporan() {
  currentLaporanDetailStudent = null;
  currentLaporanRecordsByMateri = {};
  const listView = document.getElementById('laporanListView');
  const detailView = document.getElementById('laporanDetailView');
  if (detailView) detailView.style.display = 'none';
  if (listView) {
    listView.style.display = 'block';
    renderLaporanSiswaTable(currentSiswaList);
  }
  cancelCloseAccordion();
}

/**
 * Merender Sertifikat Siswa ke Canvas Portrait A4 (1240x1754 -> 595x842 PDF)
 * agar ukuran lebar halaman seragam dengan halaman evaluasi di atasnya
 */
function renderLaporanCertificateToCanvas(certObj, student) {
  const W = 1240;
  const H = 1754;
  const cx = W / 2; // 620
  const res = createCreateOffscreenCanvas(W, H);
  if (!res) return null;
  const { canvas, ctx } = res;

  const certJudul = (certObj && certObj.judul) || 'SERTIFIKAT PENYELESAIAN';
  const certProgram = (certObj && certObj.program) || 'ECOMEDIA DIGITAL BERBASIS RADEC';
  const certNama = (certObj && certObj.nama) || (student && student.nama) || 'Sahabat Bumi';
  const certTopik = (certObj && certObj.topik) || 'Perubahan Iklim';
  const certTahapan = (certObj && certObj.tahapan) || 'Read · Answer · Discuss · Explain · Create';
  const certMeta = (certObj && certObj.meta) || [
    (certObj && certObj.kelas) || (student && student.kelas),
    (certObj && certObj.sekolah) || (student && student.sekolah)
  ].filter(Boolean).join(' · ') || 'Siswa';
  const certDate = (certObj && certObj.issued_at)
    ? new Date(certObj.issued_at).toLocaleDateString('id-ID')
    : new Date().toLocaleDateString('id-ID');

  // Latar krem resmi sertifikat (Portrait A4)
  ctx.fillStyle = '#FFFDF6';
  ctx.fillRect(0, 0, W, H);

  // Bingkai emas ganda proporsional A4 Portrait
  drawCreateRoundedRect(ctx, 64, 64, W - 128, H - 128, 28, '#FFFEF8', '#B48A1B', 10);
  drawCreateRoundedRect(ctx, 88, 88, W - 176, H - 176, 20, null, '#D9C27C', 3.5);

  // Pill judul atas
  drawCreateRoundedRect(ctx, cx - 250, 174, 500, 50, 25, '#FEF3C7', '#D9C27C', 1.5);
  ctx.fillStyle = '#9A7419';
  ctx.font = '800 22px Nunito, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(certJudul, cx, 207);

  // Nama program
  ctx.fillStyle = '#725214';
  ctx.font = '800 46px Sora, Arial, sans-serif';
  const progLines = wrapCreateCanvasLines(ctx, certProgram, 920);
  const afterProgY = drawCreateWrappedTextLines(ctx, progLines, cx, 304, 58, 'center', 2);

  // Garis hias emas
  drawCreateRoundedRect(ctx, cx - 150, afterProgY + 12, 300, 6, 3, '#D9C27C');

  ctx.fillStyle = '#635D4B';
  ctx.font = '600 30px Nunito, Arial, sans-serif';
  ctx.fillText('Diberikan kepada', cx, afterProgY + 116);

  // Nama siswa menonjol dengan garis bawah emas
  ctx.fillStyle = '#17552F';
  ctx.font = '800 58px Sora, Arial, sans-serif';
  const nameLines = wrapCreateCanvasLines(ctx, certNama, 920);
  const afterNameY = drawCreateWrappedTextLines(ctx, nameLines, cx, afterProgY + 206, 70, 'center', 2);

  drawCreateRoundedRect(ctx, cx - 400, afterNameY - 8, 800, 4, 2, '#D9C27C');

  // Deskripsi pencapaian
  ctx.fillStyle = '#4B5563';
  ctx.font = '600 28px Nunito, Arial, sans-serif';
  const descLines = wrapCreateCanvasLines(ctx, `telah menyelesaikan pembelajaran ${certTopik} melalui tahapan`, 900);
  const afterDescY = drawCreateWrappedTextLines(ctx, descLines, cx, afterNameY + 88, 42, 'center', 3);

  // Tahapan RADEC
  ctx.fillStyle = '#17552F';
  ctx.font = '800 32px Sora, Arial, sans-serif';
  const stageLines = wrapCreateCanvasLines(ctx, certTahapan, 920);
  const afterStagesY = drawCreateWrappedTextLines(ctx, stageLines, cx, afterDescY + 42, 44, 'center', 2);

  // Segel emblem sertifikat
  ctx.font = '110px Apple Color Emoji, Segoe UI Emoji, Arial, sans-serif';
  ctx.fillText('🌍 🏅 🌱', cx, Math.min(afterStagesY + 185, 1320));

  // Kotak metadata identitas & tanggal terbit di bagian bawah
  drawCreateRoundedRect(ctx, 180, 1432, W - 360, 152, 18, '#FFF9E6', '#D9C27C', 2);
  ctx.fillStyle = '#725214';
  ctx.font = '800 26px Nunito, Arial, sans-serif';
  ctx.fillText(certMeta, cx, 1492);

  ctx.fillStyle = '#635D4B';
  ctx.font = '700 22px Nunito, Arial, sans-serif';
  ctx.fillText(`📅 Diterbitkan: ${certDate}  ·  EcoMedia RADEC`, cx, 1542);
  ctx.textAlign = 'left';

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.92),
    width: canvas.width,
    height: canvas.height,
    pageW: 595,
    pageH: 842
  };
}

/**
 * Mengunduh PDF Laporan Evaluasi, Grafik Ekoliterasi, & Sertifikat Siswa per blok materi
 * Format nama file: Hasil_evaluasi_refleksi_siswa_[nama_siswa]_[kelas]_[sekolah].pdf
 * @param {string} matKey
 */
function downloadLaporanMateriPdf(matKey) {
  const student = currentLaporanDetailStudent;
  if (!student) {
    showError('Data siswa belum dimuat.', 'Gagal Mengunduh');
    return;
  }

  const rec = currentLaporanRecordsByMateri[String(matKey)] || null;
  const tanggapanText = rec && rec.tanggapan_siswa && String(rec.tanggapan_siswa).trim()
    ? String(rec.tanggapan_siswa).trim()
    : '';
  const ecoObj = rec ? parseEvaluasiJsonField(rec.ekoliterasi_siswa) : null;
  const certObj = rec ? parseEvaluasiJsonField(rec.sertifikat_siswa) : null;

  const hasTanggapan = !!tanggapanText;
  const hasEco = !!(ecoObj && (ecoObj.skor || ecoObj.jawaban));
  const hasCert = !!(certObj && (certObj.nama || certObj.judul));

  if (!hasTanggapan && !hasEco && !hasCert) {
    showError('Belum ada data evaluasi, ekoliterasi, atau sertifikat pada materi ini.', 'Data Kosong');
    return;
  }

  const materiObj = DAFTAR_MATERI_ANSWER.find(m => m.id === String(matKey)) || {
    id: String(matKey),
    key: `materi-${matKey}`,
    title: getNamaMateri(`materi-${matKey}`)
  };

  try {
    const doc = createA4PaginatedPdfDoc({
      pageBg: '#F8FCF9',
      gradStart: '#0A3D1F',
      gradEnd: '#1B6FB5',
      pillBg: 'rgba(255,255,255,0.2)',
      pillText: '#DCFCE7',
      subtitleText: '#BAE6FD',
      accent: '#15803D',
      footerBg: '#0A3D1F',
      footerSub: '#BBF7D0',
      kicker: 'LAPORAN PROGRES · EVALUASI & REFLEKSI SISWA',
      title: materiObj.title,
      subtitle: 'Tanggapan Pembelajaran, Profil Ekoliterasi, dan Sertifikat Siswa',
      footerLabel: `📊 ${student.nama || 'Siswa'} · ${materiObj.title}`
    });

    const absenText = (student.absen && student.absen !== '-') ? ` (No. Absen: ${student.absen})` : '';
    doc.addInfoBlock('🎒 IDENTITAS SISWA', [
      `Nama Siswa: ${student.nama || 'Siswa'}${absenText}`,
      `Kelas: ${student.kelas || '-'}   ·   Sekolah: ${student.sekolah || '-'}`
    ], {
      bg: '#FFFFFF',
      border: '#BBF7D0',
      accent: '#15803D',
      titleColor: '#166534'
    });

    // 1. Tanggapan Siswa
    doc.addSectionHeading(
      '1. Tanggapan Siswa (Hasil Pembelajaran)',
      hasTanggapan ? 'Terisi' : 'Kosong',
      hasTanggapan ? '#E0F2FE' : '#F1F5F9',
      hasTanggapan ? '#0369A1' : '#64748B',
      '#1B6FB5'
    );

    doc.addQaCard({
      badgeText: `Materi ${matKey}`,
      badgeBg: '#E0F2FE',
      badgeColor: '#0369A1',
      titleText: materiObj.title,
      rightMeta: 'evaluasi_refleksi_siswa',
      aLabel: '💬 TANGGAPAN & REFLEKSI SISWA:',
      aText: tanggapanText || '(Siswa belum mengisi tanggapan pembelajaran pada materi ini)',
      aBg: '#F0F9FF',
      aBorder: '#BAE6FD',
      aLabelColor: '#0369A1',
      aColor: '#0C4A6E',
      cardBorder: '#BAE6FD',
      cardAccent: '#1B6FB5'
    });

    // 2. Grafik Ekoliterasi Siswa (3 warna + persentase)
    doc.addSectionHeading(
      '2. Grafik Ekoliterasi Siswa',
      hasEco ? 'Terisi' : 'Kosong',
      hasEco ? '#DCFCE7' : '#F1F5F9',
      hasEco ? '#166534' : '#64748B',
      '#059669'
    );

    if (hasEco) {
      doc.addEkoliterasiChartBlock(ecoObj.skor || {}, ecoObj.umpan_balik || '');
    } else {
      doc.addInfoBlock('📊 GRAFIK EKOLITERASI SISWA', [
        '(Siswa belum mengisi skala ekoliterasi pada materi ini)'
      ], {
        bg: '#F8FAFC',
        border: '#CBD5E1',
        accent: '#64748B',
        titleColor: '#475569'
      });
    }

    // 3. Sertifikat Siswa (Halaman landscape tersendiri bila sertifikat tersedia)
    const extraPages = [];
    if (hasCert) {
      const certPage = renderLaporanCertificateToCanvas(certObj, student);
      if (certPage) extraPages.push(certPage);
    }

    const studentSlug = buildIdentityFilenameSlug(student.nama, student.kelas, student.sekolah, 'siswa');
    const filename = `Hasil_evaluasi_refleksi_siswa_${studentSlug}.pdf`;
    doc.savePdf(filename, extraPages);

  } catch (err) {
    console.error('[downloadLaporanMateriPdf Error]', err);
    showError(err.message || 'Gagal menghasilkan file PDF laporan progres siswa.', 'Gagal Mengunduh PDF');
  }
}

// Ekspos controller Laporan Progres ke global window
window.selectLaporanMateri = selectLaporanMateri;
window.backToLaporanMateri = backToLaporanMateri;
window.downloadLaporanCurrentMateriPdf = downloadLaporanCurrentMateriPdf;
window.renderLaporanSiswaTable = renderLaporanSiswaTable;
window.handleSearchLaporanSiswa = handleSearchLaporanSiswa;
window.loadLaporanSiswaTable = loadLaporanSiswaTable;
window.viewDetailLaporan = viewDetailLaporan;
window.closeDetailLaporan = closeDetailLaporan;
window.downloadLaporanMateriPdf = downloadLaporanMateriPdf;

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
  'akses': { title: 'Izin Akses Kelas', sub: 'Atur tahapan RADEC dan materi yang diizinkan untuk seluruh siswa pada kelas dan sekolah aktif.' },
  'tanggapan': { title: 'Tanggapan Siswa (Ecomedia)', sub: 'Tinjau analisis cerita, peran, energi, dan pengalaman siswa terhadap media lingkungan.' },
  'read': { title: 'Pertanyaan Siswa (READ)', sub: 'Daftar pertanyaan mandiri dan rasa ingin tahu yang dirumuskan siswa saat membaca teks materi.' },
  'answer': { title: 'Jawaban Siswa (Answer)', sub: 'Tinjau jawaban pra-konsepsi dan pemahaman awal siswa sebelum tahap diskusi.' },
  'discuss': { title: 'Diskusi Siswa (Discuss)', sub: 'Pantau catatan kesepakatan kelompok, dinamika diskusi, dan pembagian peran siswa.' },
  'explain': { title: 'Penjelasan Siswa (Explain)', sub: 'Tinjau paparan penjelasan konsep dan presentasi hasil pemikiran siswa di depan kelas.' },
  'create': { title: 'Karya Siswa (Create)', sub: 'Tinjau rencana perwujudan ide kreatif siswa per materi pada tahap CREATE.' },
  'karya-digital': { title: 'Karya Digital Siswa', sub: 'Tinjau karya poster digital, ikrar lingkungan, berita eco mini, dan aksi sahabat bumi siswa.' },
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

  // 4. Pengendalian muat data per panel (Materi-first untuk READ/ANSWER/DISCUSS/EXPLAIN/CREATE/LAPORAN, Kategori untuk Karya Digital)
  if (panelId === 'siswa' && currentSiswaList.length === 0) {
    loadDataSiswa();
  }
  if (panelId === 'akses') {
    loadHakAksesPanel(true);
  }
  if (panelId === 'read') {
    backToReadMateri();
    if (currentSiswaList.length === 0) loadDataSiswa();
  }
  if (panelId === 'tanggapan') {
    backToTanggapanSource();
    if (currentSiswaList.length === 0) loadDataSiswa();
  }
  if (panelId === 'answer') {
    backToAnswerMateri();
    if (currentSiswaList.length === 0) loadDataSiswa();
  }
  if (panelId === 'discuss') {
    backToDiscussMateri();
    loadDiscussKelompokTable();
  }
  if (panelId === 'explain') {
    backToExplainMateri();
    loadExplainKelompokTable();
  }
  if (panelId === 'create') {
    backToCreateMateri();
    if (currentSiswaList.length === 0) loadDataSiswa();
  }
  if (panelId === 'karya-digital') {
    backToKaryaDigitalJenis();
    if (currentSiswaList.length === 0) loadDataSiswa();
  }
  if (panelId === 'laporan') {
    backToLaporanMateri();
    if (currentSiswaList.length === 0) loadDataSiswa();
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

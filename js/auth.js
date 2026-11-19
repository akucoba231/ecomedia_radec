/**
 * EcoMedia RADEC - Authentication & Student Identity Module
 * Mengelola data profil siswa, proses login/logout terhubung REST API,
 * sanitasi kelas romawi, pembuatan id_siswa acak, dan sinkronisasi identitas ke tampilan.
 */

let ecoStudent = { id_siswa: '', name: '', kelas: '', absen: '', school: '' };
let role_now = 'student';
let ECO_ROLE = role_now;

function shake(el) {
  if (!el) return;
  el.classList.add('efek-shake');
  setTimeout(() => {
    el.classList.remove('efek-shake');
  }, 1000);
}

/**
 * Sanitasi input kelas: mengubah angka Romawi (I s.d. XII) menjadi angka desimal (1 s.d. 12),
 * menambahkan strip pemisah jika siswa menulis tanpa strip (misal: "5A" -> "5-A", "VA" -> "5-A"),
 * serta menormalisasi pemisah alternatif (spasi, titik, slash) menjadi tanda hubung (-).
 * 
 * @param {string} inputKelas
 * @returns {string}
 */
function sanitasiKelas(inputKelas) {
  if (!inputKelas) return '';

  // 1. Ubah ke huruf kapital dan bersihkan spasi di ujung
  let clean = inputKelas.toUpperCase().trim();

  // 2. Normalisasi pemisah alternatif (spasi, titik, slash) menjadi strip
  clean = clean.replace(/[\s\.\/]+/g, '-');

  // Kamus angka Romawi (SD sampai SMA = 1 sampai 12)
  const romanToNum = {
    'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5',
    'VI': '6', 'VII': '7', 'VIII': '8', 'IX': '9', 'X': '10',
    'XI': '11', 'XII': '12'
  };

  // 3. Jika input murni adalah angka Romawi (misal: "VI", "V", "XII")
  if (romanToNum[clean]) {
    return romanToNum[clean];
  }

  // 4. FAILSAFE: Jika input tidak memakai strip sama sekali (misal: "5A", "VA", "6B", "IVC")
  if (!clean.includes('-')) {
    // 3a. Pola angka desimal + huruf rombel (misal: "5A" -> "5" & "A")
    const matchNum = clean.match(/^(\d+)([A-Z]+.*)$/);
    if (matchNum) {
      clean = `${matchNum[1]}-${matchNum[2]}`;
    } else {
      // 3b. Pola Romawi + huruf rombel (misal: "VA" -> "V" & "A", "VIA" -> "VI" & "A")
      // Urutan Romawi panjang lebih dahulu agar "VI" tidak terpotong menjadi "V" dan "I"
      const matchRoman = clean.match(/^(XII|XI|VIII|VII|VI|IX|IV|III|II|X|V|I)([A-Z]+.*)$/);
      if (matchRoman) {
        const num = romanToNum[matchRoman[1]] || matchRoman[1];
        clean = `${num}-${matchRoman[2]}`;
      }
    }
  }

  // 4. Pisahkan teks berdasarkan tanda strip (-)
  let parts = clean.split('-').map(part => part.trim());

  // 5. Jika bagian pertama adalah angka Romawi yang terdaftar, ubah ke angka desimal
  if (parts[0] && romanToNum[parts[0]]) {
    parts[0] = romanToNum[parts[0]];
  }

  // 6. Gabungkan kembali dengan tanda strip dan bersihkan string kosong di akhir
  return parts.filter(part => part !== '').join('-');
}

/**
 * Membuat ID siswa acak sepanjang 5 karakter base64 dengan awalan "S-"
 * Contoh: "S-tUvWX", "S-K9z3B"
 * 
 * @returns {string}
 */
function generateStudentId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let rand = '';
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return 'S-' + rand;
}

function ecoReadState() {
  try {
    const keys = (typeof ECO_KEYS !== 'undefined') ? ECO_KEYS : (typeof window !== 'undefined' && window.ECO_KEYS ? window.ECO_KEYS : {});
    const kId = keys.studentId || 'ecoRadecStudentID';
    const kName = keys.name || 'ecoRadecStudentName';
    const kClass = keys.kelas || 'ecoRadecStudentClass';
    const kNumber = keys.number || 'ecoRadecStudentNumber';
    const kSchool = keys.school || 'ecoRadecStudentSchool';

    ecoStudent.id_siswa = (localStorage.getItem(kId) || '').trim();
    ecoStudent.name = (localStorage.getItem(kName) || '').trim();
    ecoStudent.kelas = (localStorage.getItem(kClass) || '').trim();
    ecoStudent.absen = (localStorage.getItem(kNumber) || '').trim();
    ecoStudent.school = (localStorage.getItem(kSchool) || '').trim();

    if (typeof window !== 'undefined') {
      window.ecoStudent = ecoStudent;
    }
  } catch (e) {
    console.warn('[ecoReadState] Gagal membaca profil siswa:', e);
  }
}

/**
 * Memproses login siswa dengan validasi, sanitasi kelas romawi,
 * serta integrasi REST API server ('siswa') dengan indikator loading screen.
 */
async function ecoLogin() {
  const nameInput = document.getElementById('ecoStudentName');
  const classInput = document.getElementById('ecoStudentClass');
  const numberInput = document.getElementById('ecoStudentNumber');
  const schoolInput = document.getElementById('ecoStudentSchool');
  const msg = document.getElementById('ecoFormMsg');

  const name = nameInput ? nameInput.value.trim() : '';
  let kelas = classInput ? classInput.value.trim() : '';
  const absen = numberInput ? numberInput.value.trim() : '';
  const school = schoolInput ? schoolInput.value.trim() : '';

  // 1. Validasi Nama
  if (!name) {
    shake(msg);
    if (msg) msg.textContent = 'Tuliskan namamu dulu ya, Sahabat Bumi! 🌱';
    if (nameInput) nameInput.focus();
    return;
  }

  // 2. Sanitasi dan Validasi Kelas
  kelas = sanitasiKelas(kelas);
  if (classInput) classInput.value = kelas;

  if (!kelas) {
    shake(msg);
    if (msg) msg.textContent = 'Tuliskan kelasmu dulu ya, Sahabat Bumi! 🌱';
    if (classInput) classInput.focus();
    return;
  }

  // 3. Validasi Nomor Absen
  if (!absen) {
    shake(msg);
    if (msg) msg.textContent = 'Tuliskan nomor absenmu dulu ya, Sahabat Bumi! 🌱';
    if (numberInput) numberInput.focus();
    return;
  }

  // 4. Validasi Sekolah
  if (!school) {
    shake(msg);
    if (msg) msg.textContent = 'Tuliskan sekolahmu dulu ya, Sahabat Bumi! 🌱';
    if (schoolInput) schoolInput.focus();
    return;
  }

  if (msg) msg.textContent = '';

  // 5. Tampilkan Loading Screen
  if (typeof showLoading === 'function') {
    showLoading('Data anda sedang diproses', 'Menghubungkan ke server Ecomedia...');
  }

  try {
    const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
    let finalStudentId = '';

    if (api && typeof api.getWhere === 'function') {
      // 1. Query pencarian eksak: nama + kelas + sekolah (dan nomor absen jika ada)
      const criteria = {
        nama: name,
        kelas: kelas,
        sekolah: school
      };
      if (absen) {
        criteria.absen = absen;
      }

      const existing = await api.getWhere('siswa', criteria);

      if (Array.isArray(existing) && existing.length > 0) {
        // Siswa ditemukan dengan data identitas yang persis sama
        const found = existing[0];
        finishLogin(found.id_siswa || generateStudentId(), name, kelas, absen, school);
        return;
      }

      // 2. Cek apakah ada akun dengan nama + sekolah + absen yang sama namun kelasnya berbeda di server
      if (absen) {
        const altExisting = await api.getWhere('siswa', { nama: name, sekolah: school, absen: absen });
        if (Array.isArray(altExisting) && altExisting.length > 0 && altExisting[0].kelas !== kelas) {
          // Tutup loading screen dan TAMPILKAN MODAL KONFIRMASI kepada siswa!
          if (typeof hideLoading === 'function') hideLoading();
          showConfirmClassModal(altExisting[0], { name, kelas, absen, school });
          return;
        }
      }

      // 3. Siswa baru -> Buat id_siswa baru dan kirim data via POST
      finalStudentId = generateStudentId();
      const postData = {
        id_siswa: finalStudentId,
        nama: name,
        kelas: kelas,
        absen: absen,
        sekolah: school
      };

      if (typeof showLoading === 'function') {
        showLoading('Data anda sedang diproses', 'Mendaftarkan akun baru ke server...');
      }

      const postRes = await api.post('siswa', postData);
      if (postRes && postRes.data && postRes.data.id_siswa) {
        finalStudentId = postRes.data.id_siswa;
      }

      finishLogin(finalStudentId, name, kelas, absen, school);
      return;
    } else {
      // Fallback jika API tidak tersedia / offline
      finalStudentId = ecoStudent.id_siswa || generateStudentId();
      finishLogin(finalStudentId, name, kelas, absen, school);
      return;
    }
  } catch (err) {
    console.error('[ecoLogin] Terjadi kendala saat login:', err);
    if (typeof showLoadingError === 'function') {
      showLoadingError(
        err.message || 'Gagal memproses data login ke server.',
        'Mohon maaf ada masalah'
      );
    } else {
      if (msg) msg.textContent = 'Gagal terhubung ke server: ' + (err.message || err);
    }
  }
}

/**
 * Menyelesaikan proses login, menyimpan data ke localStorage, dan mengarahkan ke halaman home
 */
async function finishLogin(studentId, name, kelas, absen, school) {
  ECO_ROLE = role_now;
  ecoStudent.id_siswa = studentId;
  ecoStudent.name = name;
  ecoStudent.kelas = kelas;
  ecoStudent.absen = absen;
  ecoStudent.school = school;

  if (typeof window !== 'undefined') {
    window.ecoStudent = ecoStudent;
  }

  const keys = (typeof ECO_KEYS !== 'undefined') ? ECO_KEYS : (typeof window !== 'undefined' && window.ECO_KEYS ? window.ECO_KEYS : {});
  const kId = keys.studentId || 'ecoRadecStudentID';
  const kName = keys.name || 'ecoRadecStudentName';
  const kClass = keys.kelas || 'ecoRadecStudentClass';
  const kNumber = keys.number || 'ecoRadecStudentNumber';
  const kSchool = keys.school || 'ecoRadecStudentSchool';

  localStorage.setItem(kId, studentId);
  localStorage.setItem(kName, name);
  localStorage.setItem(kClass, kelas);
  localStorage.setItem(kNumber, absen);
  localStorage.setItem(kSchool, school);

  // Sinkronisasi progres siswa dengan database server (POST jika pertama kali, pulihkan jika sudah ada)
  if (typeof syncProgressLogin === 'function') {
    try {
      await syncProgressLogin(studentId);
    } catch (e) {
      console.warn('[finishLogin] syncProgressLogin gagal:', e);
    }
  }

  ecoRenderIdentity();

  if (typeof showLoadingSuccess === 'function') {
    showLoadingSuccess(`Halo ${name}, selamat datang!`, 1000, () => {
      if (typeof ecoShowHome === 'function') {
        ecoShowHome();
      }
    });
  } else {
    if (typeof hideLoading === 'function') hideLoading();
    if (typeof ecoShowHome === 'function') ecoShowHome();
  }
}

/**
 * Menutup modal konfirmasi pergantian kelas
 */
function closeConfirmClassModal() {
  const modal = document.getElementById('ecoConfirmClassModal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Menampilkan modal dialog konfirmasi pergantian kelas jika ditemukan data akun siswa yang sama
 */
function showConfirmClassModal(existingStudent, newForm) {
  const nameEl = document.getElementById('confirmStudentName');
  const oldClassEl = document.getElementById('confirmOldClass');
  const schoolEl = document.getElementById('confirmSchoolName');
  const newClassEl = document.getElementById('confirmNewClass');

  if (nameEl) nameEl.textContent = newForm.name;
  if (oldClassEl) oldClassEl.textContent = existingStudent.kelas ? `Kelas ${existingStudent.kelas}` : 'Kelas Sebelumnya';
  if (schoolEl) schoolEl.textContent = existingStudent.sekolah || newForm.school;
  if (newClassEl) newClassEl.textContent = newForm.kelas ? `Kelas ${newForm.kelas}` : 'Kelas Baru';

  const btnConfirm = document.getElementById('btnConfirmChangeClass');
  const btnNewAccount = document.getElementById('btnConfirmNewAccount');

  if (btnConfirm) {
    btnConfirm.onclick = async () => {
      closeConfirmClassModal();
      if (typeof showLoading === 'function') {
        showLoading('Memperbarui kelas...', 'Menyimpan perubahan kelasku ke server...');
      }
      try {
        const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
        if (api && typeof api.patch === 'function') {
          await api.patch('siswa', 'id_siswa', existingStudent.id_siswa, {
            kelas: newForm.kelas,
            absen: newForm.absen,
            sekolah: newForm.school
          });
        }
        finishLogin(existingStudent.id_siswa, newForm.name, newForm.kelas, newForm.absen, newForm.school);
      } catch (err) {
        console.error('[confirmChangeClass] Gagal update kelas:', err);
        if (typeof showLoadingError === 'function') {
          showLoadingError(err.message || 'Gagal memperbarui kelas ke server.', 'Mohon maaf ada masalah');
        }
      }
    };
  }

  if (btnNewAccount) {
    btnNewAccount.onclick = async () => {
      closeConfirmClassModal();
      if (typeof showLoading === 'function') {
        showLoading('Mendaftarkan akun baru...', 'Membuat akun siswa baru di server...');
      }
      try {
        const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
        const newId = generateStudentId();
        const postData = {
          id_siswa: newId,
          nama: newForm.name,
          kelas: newForm.kelas,
          absen: newForm.absen,
          sekolah: newForm.school
        };
        if (api && typeof api.post === 'function') {
          await api.post('siswa', postData);
        }
        finishLogin(newId, newForm.name, newForm.kelas, newForm.absen, newForm.school);
      } catch (err) {
        console.error('[confirmNewAccount] Gagal membuat akun baru:', err);
        if (typeof showLoadingError === 'function') {
          showLoadingError(err.message || 'Gagal membuat akun baru di server.', 'Mohon maaf ada masalah');
        }
      }
    };
  }

  const modal = document.getElementById('ecoConfirmClassModal');
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }
}

function ecoRenderIdentity() {
  const studentName = ecoStudent.name || 'Sahabat Bumi';
  document.querySelectorAll('[data-eco-name]').forEach(el => {
    el.textContent = studentName;
  });

  const poster = document.getElementById('posterName');
  const pledge = document.getElementById('pledgeName');
  const labelParts = [ecoStudent.name, ecoStudent.kelas, ecoStudent.absen ? `No. ${ecoStudent.absen}` : ''];
  const label = labelParts.filter(Boolean).join(' · ');

  if (poster && !poster.value) poster.value = label;
  if (pledge && !pledge.value) pledge.value = label;

  // Update badge profil pada halaman orientasi (#ecoHome)
  const badgeClass = document.getElementById('ecoHomeBadgeClass');
  const badgeNum = document.getElementById('ecoHomeBadgeNumber');
  const badgeSch = document.getElementById('ecoHomeBadgeSchool');
  if (badgeClass) badgeClass.textContent = ecoStudent.kelas ? `Kelas ${ecoStudent.kelas}` : 'Kelas -';
  if (badgeNum) badgeNum.textContent = ecoStudent.absen ? `No. ${ecoStudent.absen}` : 'No. -';
  if (badgeSch) badgeSch.textContent = ecoStudent.school ? ecoStudent.school : 'Sekolah -';

  // Update info profil di #flowProfileHelp jika ada
  const flowId = document.getElementById('flowProfileId');
  if (flowId) flowId.textContent = ecoStudent.id_siswa || '-';
}

function ecoEditIdentity() {
  openEditProfileModal();
}

/**
 * Membuka modal dialog "Ubah Profil Siswa"
 */
function openEditProfileModal() {
  const nameInp = document.getElementById('editStudentName');
  const classInp = document.getElementById('editStudentClass');
  const numInp = document.getElementById('editStudentNumber');
  const schInp = document.getElementById('editStudentSchool');
  const msg = document.getElementById('editProfileMsg');

  if (nameInp) nameInp.value = ecoStudent.name || '';
  if (classInp) classInp.value = ecoStudent.kelas || '';
  if (numInp) numInp.value = ecoStudent.absen || '';
  if (schInp) schInp.value = ecoStudent.school || '';
  if (msg) msg.textContent = '';

  const modal = document.getElementById('ecoEditProfileModal');
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  setTimeout(() => {
    if (classInp) classInp.focus();
  }, 100);
}

/**
 * Menutup modal dialog "Ubah Profil Siswa"
 */
function closeEditProfileModal() {
  const modal = document.getElementById('ecoEditProfileModal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Menyimpan perubahan profil siswa langsung via EcoApi.patch() ke server
 */
async function saveEditProfile() {
  const nameInp = document.getElementById('editStudentName');
  const classInp = document.getElementById('editStudentClass');
  const numInp = document.getElementById('editStudentNumber');
  const schInp = document.getElementById('editStudentSchool');
  const msg = document.getElementById('editProfileMsg');

  const name = nameInp ? nameInp.value.trim() : '';
  let kelas = classInp ? classInp.value.trim() : '';
  const absen = numInp ? numInp.value.trim() : '';
  const school = schInp ? schInp.value.trim() : '';

  if (!name) {
    shake(msg);
    if (msg) msg.textContent = 'Nama tidak boleh kosong!';
    if (nameInp) nameInp.focus();
    return;
  }

  kelas = sanitasiKelas(kelas);
  if (classInp) classInp.value = kelas;

  if (!kelas) {
    shake(msg);
    if (msg) msg.textContent = 'Kelas tidak boleh kosong!';
    if (classInp) classInp.focus();
    return;
  }

  if (!absen) {
    shake(msg);
    if (msg) msg.textContent = 'Nomor absen tidak boleh kosong!';
    if (numInp) numInp.focus();
    return;
  }

  if (!school) {
    shake(msg);
    if (msg) msg.textContent = 'Nama sekolah tidak boleh kosong!';
    if (schInp) schInp.focus();
    return;
  }

  if (msg) msg.textContent = '';

  if (typeof showLoading === 'function') {
    showLoading('Menyimpan perubahan profil...', 'Menghubungkan ke server Ecomedia...');
  }

  try {
    const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
    const keys = (typeof ECO_KEYS !== 'undefined') ? ECO_KEYS : (typeof window !== 'undefined' && window.ECO_KEYS ? window.ECO_KEYS : {});
    const studentId = ecoStudent.id_siswa || localStorage.getItem(keys.studentId || 'ecoRadecStudentID') || '';

    if (api && studentId && typeof api.patch === 'function') {
      await api.patch('siswa', 'id_siswa', studentId, {
        nama: name,
        kelas: kelas,
        absen: absen,
        sekolah: school
      });
    }

    // Perbarui data di state lokal & localStorage
    ecoStudent.name = name;
    ecoStudent.kelas = kelas;
    ecoStudent.absen = absen;
    ecoStudent.school = school;
    if (typeof window !== 'undefined') {
      window.ecoStudent = ecoStudent;
    }

    localStorage.setItem(keys.name || 'ecoRadecStudentName', name);
    localStorage.setItem(keys.kelas || 'ecoRadecStudentClass', kelas);
    localStorage.setItem(keys.number || 'ecoRadecStudentNumber', absen);
    localStorage.setItem(keys.school || 'ecoRadecStudentSchool', school);

    ecoRenderIdentity();
    closeEditProfileModal();

    if (typeof showLoadingSuccess === 'function') {
      showLoadingSuccess('Profil berhasil diperbarui!', 1200);
    } else if (typeof hideLoading === 'function') {
      hideLoading();
    }

  } catch (err) {
    console.error('[saveEditProfile] Terjadi kesalahan:', err);
    if (typeof showLoadingError === 'function') {
      showLoadingError(err.message || 'Gagal menyimpan perubahan ke server.', 'Mohon maaf ada masalah');
    } else {
      if (msg) msg.textContent = 'Gagal menyimpan perubahan: ' + (err.message || err);
    }
  }
}

function flowOpenStudentLogin() {
  ECO_ROLE = role_now;
  if (typeof flowHideShellScreens === 'function') flowHideShellScreens();
  if (typeof flowHideLegacyPages === 'function') flowHideLegacyPages();

  const w = document.getElementById('ecoWelcome');
  if (w) w.classList.remove('eco-hidden');
  if (document.body && document.body.classList) document.body.classList.add('eco-locked');

  const nameInput = document.getElementById('ecoStudentName');
  const classInput = document.getElementById('ecoStudentClass');
  const numberInput = document.getElementById('ecoStudentNumber');
  const schoolInput = document.getElementById('ecoStudentSchool');

  if (nameInput) nameInput.value = ecoStudent.name || '';
  if (classInput) classInput.value = ecoStudent.kelas || '';
  if (numberInput) numberInput.value = ecoStudent.absen || '';
  if (schoolInput) schoolInput.value = ecoStudent.school || '';

  setTimeout(() => nameInput && nameInput.focus(), 70);
  window.scrollTo(0, 0);
}

function flowShowProfile() {
  if (typeof flowHideShellScreens === 'function') flowHideShellScreens();
  if (typeof flowHideLegacyPages === 'function') flowHideLegacyPages();

  const profileHelp = document.getElementById('flowProfileHelp');
  if (profileHelp) profileHelp.classList.remove('eco-hidden');
  if (document.body && document.body.classList) document.body.classList.remove('eco-locked');

  const idEl = document.getElementById('flowProfileId');
  const nameEl = document.getElementById('flowProfileName');
  const classEl = document.getElementById('flowProfileClass');
  const numberEl = document.getElementById('flowProfileNumber');
  const schoolEl = document.getElementById('flowProfileSchool');
  const roleEl = document.getElementById('flowProfileRole');

  if (idEl) idEl.textContent = ecoStudent.id_siswa || '-';
  if (nameEl) nameEl.textContent = ecoStudent.name || 'Sahabat Bumi';
  if (classEl) classEl.textContent = ecoStudent.kelas || '-';
  if (numberEl) numberEl.textContent = ecoStudent.absen ? `No. ${ecoStudent.absen}` : '-';
  if (schoolEl) schoolEl.textContent = ecoStudent.school || '-';
  if (roleEl) roleEl.textContent = 'Siswa';

  window.scrollTo(0, 0);
}

function flowLogoutToLanding() {
  ECO_ROLE = role_now;
  if (typeof flowShowLanding === 'function') {
    flowShowLanding();
  }
}

function ecoInit() {
  ecoReadState();
  if (typeof trackerReadState === 'function') trackerReadState();
  if (typeof ecoHideLearning === 'function') ecoHideLearning();
  ecoRenderIdentity();
  if (typeof ecoRenderProgress === 'function') ecoRenderProgress();

  const nameInput = document.getElementById('ecoStudentName');
  const classInput = document.getElementById('ecoStudentClass');
  const numberInput = document.getElementById('ecoStudentNumber');
  const schoolInput = document.getElementById('ecoStudentSchool');

  if (nameInput) {
    nameInput.value = ecoStudent.name || '';
    nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') ecoLogin(); });
  }
  if (classInput) {
    classInput.value = ecoStudent.kelas || '';
    classInput.addEventListener('blur', () => {
      classInput.value = sanitasiKelas(classInput.value);
    });
    classInput.addEventListener('keydown', e => { if (e.key === 'Enter') ecoLogin(); });
  }
  if (numberInput) {
    numberInput.value = ecoStudent.absen || '';
    numberInput.addEventListener('keydown', e => { if (e.key === 'Enter') ecoLogin(); });
  }
  if (schoolInput) {
    schoolInput.value = ecoStudent.school || '';
    schoolInput.addEventListener('keydown', e => { if (e.key === 'Enter') ecoLogin(); });
  }

  // Listener sanitasi untuk input kelas pada modal edit profil
  const editClassInput = document.getElementById('editStudentClass');
  if (editClassInput) {
    editClassInput.addEventListener('blur', () => {
      editClassInput.value = sanitasiKelas(editClassInput.value);
    });
  }

  if (typeof flowHideShellScreens === 'function') flowHideShellScreens();
  const welcome = document.getElementById('ecoWelcome');
  if (welcome) welcome.classList.remove('eco-hidden');
}

// Global window exposure
if (typeof window !== 'undefined') {
  window.ecoStudent = ecoStudent;
  window.ECO_ROLE = ECO_ROLE;
  window.ecoReadState = ecoReadState;
  window.ecoLogin = ecoLogin;
  window.finishLogin = finishLogin;
  window.sanitasiKelas = sanitasiKelas;
  window.generateStudentId = generateStudentId;
  window.ecoRenderIdentity = ecoRenderIdentity;
  window.ecoEditIdentity = ecoEditIdentity;
  window.openEditProfileModal = openEditProfileModal;
  window.closeEditProfileModal = closeEditProfileModal;
  window.saveEditProfile = saveEditProfile;
  window.showConfirmClassModal = showConfirmClassModal;
  window.closeConfirmClassModal = closeConfirmClassModal;
  window.flowOpenStudentLogin = flowOpenStudentLogin;
  window.flowShowProfile = flowShowProfile;
  window.flowLogoutToLanding = flowLogoutToLanding;
  window.ecoInit = ecoInit;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ecoStudent,
    sanitasiKelas,
    generateStudentId,
    ecoReadState,
    ecoLogin,
    finishLogin,
    ecoRenderIdentity,
    ecoEditIdentity,
    openEditProfileModal,
    closeEditProfileModal,
    saveEditProfile,
    showConfirmClassModal,
    closeConfirmClassModal,
    flowShowProfile,
    ecoInit
  };
}

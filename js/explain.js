/**
 * EcoMedia RADEC - EXPLAIN Module (Tahap 4: Penjelasan & Umpan Balik Kelas)
 * Mengelola perbaikan 25 jawaban setelah penjelasan kelas dan refleksi media.
 * Terintegrasi penuh dengan tabel 'kelompok_explain' dan 'explain'
 * sebagai kelanjutan otomatis dari tahap DISCUSS.
 */

let explainAllMaterialV4 = 1;
let explainAllStateV4 = {};
let currentKelompokExplain = null; // { id_kelompok_explain, id_kelompok_discuss, id_siswa, id_anggota, nama_kelompok, nama_anggota, id_materi, kelas, sekolah, keterangan }
let _explainSyncTimers = {};
let _lastExplainStudentId = '';

function getExplainStudentProfile() {
  const student = (typeof window !== 'undefined' && window.ecoStudent) ||
                  (typeof ecoStudent !== 'undefined' ? ecoStudent : {});
  return {
    id_siswa: student.id_siswa ||
              (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID')) || '',
    kelas: student.kelas ||
           (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentClass')) || '',
    school: student.school || student.sekolah ||
            (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentSchool')) || ''
  };
}

function filterRowsForExplainStudent(rows, studentId) {
  const list = Array.isArray(rows) ? rows : [];
  const target = String(studentId || '').trim();
  if (!target) return list;
  return list.filter(r => r && String(r.id_siswa || '').trim() === target);
}

function getExplainAllMaterial() { return explainAllMaterialV4; }
function setExplainAllMaterial(val) {
  explainAllMaterialV4 = val;
  if (typeof window !== 'undefined') window.explainAllMaterialV4 = val;
  return explainAllMaterialV4;
}
function getCurrentKelompokExplain() { return currentKelompokExplain; }
function setCurrentKelompokExplain(val) {
  currentKelompokExplain = val;
  if (typeof window !== 'undefined') window.currentKelompokExplain = val;
  return currentKelompokExplain;
}

/**
 * Notifikasi error terpadu untuk tahap EXPLAIN menggunakan modal overlay showLoadingError
 */
function notifyExplainError(message, title = 'Mohon Maaf Ada Masalah') {
  if (typeof notifyDiscussError === 'function') {
    notifyDiscussError(message, title);
  } else if (typeof window !== 'undefined' && typeof window.notifyDiscussError === 'function') {
    window.notifyDiscussError(message, title);
  } else if (typeof showLoadingError === 'function') {
    showLoadingError(message, title);
  } else if (typeof window !== 'undefined' && typeof window.showLoadingError === 'function') {
    window.showLoadingError(message, title);
  } else {
    console.error(`[${title}] ${message}`);
  }
}

/**
 * Notifikasi sukses terpadu untuk tahap EXPLAIN menggunakan modal overlay notifyDiscussSuccess (auto-close 2s)
 */
function notifyExplainSuccess(title, subtitle) {
  if (typeof notifyDiscussSuccess === 'function') {
    notifyDiscussSuccess(title, subtitle);
  } else if (typeof window !== 'undefined' && typeof window.notifyDiscussSuccess === 'function') {
    window.notifyDiscussSuccess(title, subtitle);
  } else if (typeof showLoadingSuccess === 'function') {
    showLoadingSuccess(title, subtitle);
    if (typeof hideLoading === 'function') {
      setTimeout(() => { hideLoading(); }, 2000);
    }
  } else {
    console.log(`[${title}] ${subtitle}`);
  }
}

function getExplainAnswersStorageKey() {
  const baseKey = typeof RADEC_EXPLAIN_ALL_V4 !== 'undefined' ? RADEC_EXPLAIN_ALL_V4 : 'ecoRadecExplainAllAnswersV4';
  const stuId = getExplainStudentProfile().id_siswa;
  return stuId ? `${baseKey}_${stuId}` : baseKey;
}

function loadExplainAllV4() {
  const studentId = getExplainStudentProfile().id_siswa;
  const explainKey = getExplainAnswersStorageKey();
  if (studentId !== _lastExplainStudentId) {
    _lastExplainStudentId = studentId;
  }

  if (typeof store !== 'undefined' && store.read) {
    explainAllStateV4 = store.read(explainKey, {});
  } else {
    try {
      explainAllStateV4 = JSON.parse(localStorage.getItem(explainKey) || '{}') || {};
    } catch (e) {
      explainAllStateV4 = {};
    }
  }
}

function explainV4Text(i) {
  const rec = explainAllStateV4['q' + i];
  return typeof rec === 'string' ? rec : ((rec && rec.text) || '');
}

function explainV4Done() {
  loadExplainAllV4();
  const questions = window.ANSWER_ESSAY25 || [];
  return questions.filter((q, i) => explainV4Text(i).trim().length >= 5).length;
}

/**
 * Menampilkan informasi kelompok di tahap EXPLAIN
 */
function renderExplainGroupDisplay(group) {
  const container = document.getElementById('explainGroupDisplay');
  const title = document.getElementById('explainGroupDisplayTitle');
  const members = document.getElementById('explainGroupDisplayMembers');
  if (!container) return;

  if (!group || !group.nama_kelompok) {
    container.style.display = 'none';
    return;
  }

  if (title) title.textContent = group.nama_kelompok;
  if (members) {
    let memberList = group.nama_anggota || '-';
    if (typeof memberList === 'string' && memberList.startsWith('[')) {
      try {
        const parsed = JSON.parse(memberList);
        if (Array.isArray(parsed)) memberList = parsed.join(', ');
      } catch (e) {}
    }
    members.textContent = memberList;
  }
  container.style.display = 'flex';
}

/**
 * ═════════════════════════════════════════════════════════════════════════
 * LOGIKA SINKRONISASI KELOMPOK & JAWABAN EXPLAIN
 * ═════════════════════════════════════════════════════════════════════════
 */

/**
 * Memeriksa keberadaan kelompok di tabel 'kelompok_explain'.
 * Failsafe: Jika belum ada di 'kelompok_explain', cari di 'kelompok_discuss'.
 * Jika ditemukan di 'kelompok_discuss', salin ke 'kelompok_explain' dan salin jawaban 'discuss' ke 'explain'.
 * Jika tidak ditemukan di 'kelompok_discuss', tampilkan pesan error bahwa tahap DISCUSS belum diselesaikan.
 */
async function checkOrCreateExplainGroup(materi = explainAllMaterialV4) {
  const student = (typeof window !== 'undefined' && window.ecoStudent) || (typeof ecoStudent !== 'undefined' ? ecoStudent : null);
  const studentId = (student && student.id_siswa) || (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID')) || '';
  const userKelas = (student && student.kelas) || (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentKelas')) || '';
  const userSchool = (student && (student.school || student.sekolah)) || (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentSchool')) || '';

  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!api || !studentId) {
    return null;
  }

  const curMateri = materi || explainAllMaterialV4 || 1;

  try {
    // -------------------------------------------------------------
    // LANGKAH 1: Cari di tabel 'kelompok_explain'
    // -------------------------------------------------------------
    const explainCriteria = { id_materi: curMateri };
    if (userKelas) explainCriteria.kelas = userKelas;
    if (userSchool) explainCriteria.sekolah = userSchool;

    const resExplain = await api.getWhere('kelompok_explain', explainCriteria);
    const listExplain = Array.isArray(resExplain) ? resExplain : (resExplain && Array.isArray(resExplain.data) ? resExplain.data : []);

    let myExplainGroup = listExplain.find(g => {
      if (String(g.id_siswa).trim() === String(studentId).trim()) return true;
      if (g.id_anggota) {
        try {
          const ids = typeof g.id_anggota === 'string' ? JSON.parse(g.id_anggota) : g.id_anggota;
          if (Array.isArray(ids) && ids.map(x => String(x).trim()).includes(String(studentId).trim())) return true;
        } catch (e) {
          if (String(g.id_anggota).includes(studentId)) return true;
        }
      }
      return false;
    });

    if (myExplainGroup) {
      currentKelompokExplain = myExplainGroup;
      if (typeof window !== 'undefined') window.currentKelompokExplain = myExplainGroup;
      renderExplainGroupDisplay(myExplainGroup);
      await loadExplainDataForMaterial(curMateri, myExplainGroup);
      await loadEcoExplainData(curMateri, myExplainGroup);
      return myExplainGroup;
    }

    // -------------------------------------------------------------
    // LANGKAH 2: Failsafe fallback ke tabel 'kelompok_discuss'
    // -------------------------------------------------------------
    const discussCriteria = { id_materi: curMateri };
    if (userKelas) discussCriteria.kelas = userKelas;
    if (userSchool) discussCriteria.sekolah = userSchool;

    const resDiscuss = await api.getWhere('kelompok_discuss', discussCriteria);
    const listDiscuss = Array.isArray(resDiscuss) ? resDiscuss : (resDiscuss && Array.isArray(resDiscuss.data) ? resDiscuss.data : []);

    let myDiscussGroup = listDiscuss.find(g => {
      const idMatches = (String(g.id_siswa).trim() === String(studentId).trim());
      let inMembers = false;
      if (g.id_anggota) {
        try {
          const ids = typeof g.id_anggota === 'string' ? JSON.parse(g.id_anggota) : g.id_anggota;
          if (Array.isArray(ids) && ids.map(x => String(x).trim()).includes(String(studentId).trim())) inMembers = true;
        } catch (e) {
          if (String(g.id_anggota).includes(studentId)) inMembers = true;
        }
      }
      return idMatches || inMembers;
    });

    // -------------------------------------------------------------
    // LANGKAH 3: Jika ditemukan di kelompok_discuss, salin ke kelompok_explain
    // -------------------------------------------------------------
    if (myDiscussGroup) {
      const idKelompokDiscuss = myDiscussGroup.id_kelompok || myDiscussGroup.id;
      const payloadExplainGroup = {
        id_kelompok_discuss: idKelompokDiscuss,
        id_siswa: myDiscussGroup.id_siswa,
        id_anggota: typeof myDiscussGroup.id_anggota === 'object' ? JSON.stringify(myDiscussGroup.id_anggota) : myDiscussGroup.id_anggota,
        nama_kelompok: myDiscussGroup.nama_kelompok,
        nama_anggota: typeof myDiscussGroup.nama_anggota === 'object' ? JSON.stringify(myDiscussGroup.nama_anggota) : myDiscussGroup.nama_anggota,
        id_materi: curMateri,
        kelas: myDiscussGroup.kelas || userKelas,
        sekolah: myDiscussGroup.sekolah || userSchool,
        keterangan: myDiscussGroup.keterangan || ''
      };

      let resPost = await api.post('kelompok_explain', payloadExplainGroup);
      payloadExplainGroup.id_kelompok_explain = (resPost && (resPost.id || resPost.id_kelompok_explain)) || Date.now();
      currentKelompokExplain = payloadExplainGroup;
      if (typeof window !== 'undefined') window.currentKelompokExplain = payloadExplainGroup;

      renderExplainGroupDisplay(currentKelompokExplain);

      // Salin data jawaban dari tabel discuss ke explain
      await copyDiscussToExplain(idKelompokDiscuss, curMateri, myDiscussGroup);
      await loadEcoExplainData(curMateri, currentKelompokExplain);
      return currentKelompokExplain;
    }

    // -------------------------------------------------------------
    // LANGKAH 4: Tidak ditemukan di kelompok_discuss -> Tampilkan pesan error
    // -------------------------------------------------------------
    currentKelompokExplain = null;
    renderExplainGroupDisplay(null);
    notifyExplainError(
      'Kamu belum terdaftar dalam kelompok diskusi pada materi ini. Silakan bentuk kelompok dan selesaikan pembahasan pada tahap DISCUSS terlebih dahulu.',
      'Tahap DISCUSS Belum Diselesaikan'
    );
    return null;

  } catch (err) {
    console.error('[checkOrCreateExplainGroup] Gagal mendeteksi kelompok explain:', err);
    notifyExplainError(err.message || 'Terjadi kendala saat memeriksa kelompok tahap EXPLAIN.', 'Kendala Jaringan');
    return null;
  }
}

/**
 * Menyalin jawaban konsensus dari tabel 'discuss' ke tabel 'explain'
 * jika belum ada rekaman jawaban di tabel 'explain' untuk materi dan kelompok terkait.
 */
async function copyDiscussToExplain(idKelompokDiscuss, materi, group) {
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!api) return;
  const studentProfile = getExplainStudentProfile();
  const studentId = studentProfile.id_siswa;

  // 1. Cek apakah di tabel 'explain' sudah ada record untuk kelompok, materi, dan siswa ini
  let explainList = [];
  try {
    const expCriteria = { id_kelompok: idKelompokDiscuss, id_materi: materi };
    if (studentId) expCriteria.id_siswa = studentId;
    const res = await api.getWhere('explain', expCriteria);
    const rawExp = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
    explainList = filterRowsForExplainStudent(rawExp, studentId);
  } catch (err) {
    console.warn('[copyDiscussToExplain] Kueri tabel explain:', err);
  }

  if (explainList && explainList.length > 0) {
    applyExplainAnswersToUI(explainList, materi);
    return;
  }

  // 2. Jika belum ada di explain, ambil jawaban milik siswa ini dari tabel 'discuss'
  let discussList = [];
  try {
    const discCriteria = { id_kelompok: idKelompokDiscuss, id_materi: materi };
    if (studentId) discCriteria.id_siswa = studentId;
    const resDisc = await api.getWhere('discuss', discCriteria);
    const rawDisc = Array.isArray(resDisc) ? resDisc : (resDisc && Array.isArray(resDisc.data) ? resDisc.data : []);
    discussList = filterRowsForExplainStudent(rawDisc, studentId);
  } catch (errDisc) {
    console.warn('[copyDiscussToExplain] Kueri tabel discuss:', errDisc);
  }

  // 3. Salin setiap baris jawaban discuss milik siswa ini ke tabel 'explain'
  if (discussList && discussList.length > 0) {
    for (const item of discussList) {
      const payloadExplainItem = {
        id_kelompok: idKelompokDiscuss,
        id_materi: materi,
        id_siswa: studentId || item.id_siswa || null,
        sumber: item.sumber || 'esai',
        id_soal: item.id_soal,
        pertanyaan: item.pertanyaan || '',
        jawaban: item.jawaban || '',
        keterangan: item.keterangan || '',
        from_answer: item.from_answer ? 1 : 0,
        nama_kelompok: (group && group.nama_kelompok) || '',
        kelas: studentProfile.kelas || (group && group.kelas) || '',
        sekolah: studentProfile.school || (group && group.sekolah) || ''
      };
      try {
        const postRes = await api.post('explain', payloadExplainItem);
        payloadExplainItem.id_explain = (postRes && (postRes.id || postRes.id_explain)) || Date.now();
        explainList.push(payloadExplainItem);
      } catch (postErr) {
        console.error('[copyDiscussToExplain] Gagal menyalin item discuss ke explain:', postErr);
      }
    }
  }

  applyExplainAnswersToUI(explainList, materi);
}

/**
 * Memuat data jawaban dari tabel 'explain' untuk materi & siswa yang sedang aktif
 */
async function loadExplainDataForMaterial(materi, explainGroup) {
  if (!explainGroup || !explainGroup.id_kelompok_discuss) return;
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!api) return;

  const idKelompokDiscuss = explainGroup.id_kelompok_discuss;
  const studentId = getExplainStudentProfile().id_siswa;
  const explainKey = getExplainAnswersStorageKey();

  if (studentId !== _lastExplainStudentId) {
    _lastExplainStudentId = studentId;
    explainAllStateV4 = {};
    if (typeof store !== 'undefined' && store.write) {
      store.write(explainKey, explainAllStateV4);
    } else {
      try { localStorage.setItem(explainKey, JSON.stringify(explainAllStateV4)); } catch (e) {}
    }
  }

  let explainList = [];
  try {
    const expCriteria = { id_kelompok: idKelompokDiscuss, id_materi: materi };
    if (studentId) expCriteria.id_siswa = studentId;
    const res = await api.getWhere('explain', expCriteria);
    const rawExp = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
    explainList = filterRowsForExplainStudent(rawExp, studentId);
  } catch (err) {
    console.warn('[loadExplainDataForMaterial] Kueri explain:', err);
  }

  if (!explainList || explainList.length === 0) {
    await copyDiscussToExplain(idKelompokDiscuss, materi, explainGroup);
  } else {
    applyExplainAnswersToUI(explainList, materi);
  }
}

/**
 * Memasangkan data jawaban dari tabel 'explain' ke antarmuka kartu soal EXPLAIN
 * dan menyamakan pembaruan/pengosongan seluruh soal materi aktif seperti di DISCUSS.
 */
function applyExplainAnswersToUI(explainList, materi) {
  const explainKey = getExplainAnswersStorageKey();
  const questions = window.ANSWER_ESSAY25 || [];
  const curMateri = materi || explainAllMaterialV4 || 1;
  const materialQuestions = getExplainMaterialQuestions(curMateri);
  const serverAnswersByIdx = {};

  (explainList || []).forEach(item => {
    const isStudentQuestion = item.from_answer || item.sumber === 'siswa' || String(item.id_soal || '').startsWith('pertanyaan-');
    if (!isStudentQuestion && item.id_soal !== null && item.id_soal !== undefined) {
      const qIdx = questions.findIndex((q, idx) => String(q.id_soal !== undefined ? q.id_soal : (idx + 1)) === String(item.id_soal));
      const resolvedIdx = qIdx >= 0 ? qIdx : (Number(item.id_soal) - 1);
      if (!isNaN(resolvedIdx) && resolvedIdx >= 0 && resolvedIdx < questions.length && item.jawaban !== undefined && item.jawaban !== null) {
        serverAnswersByIdx[resolvedIdx] = String(item.jawaban);
        explainAllStateV4['q' + resolvedIdx] = {
          text: item.jawaban,
          updatedAt: item.updated_at || new Date().toISOString(),
          id_explain: item.id_explain
        };
      }
    }
  });

  if (typeof store !== 'undefined' && store.write) {
    store.write(explainKey, explainAllStateV4);
  } else {
    try { localStorage.setItem(explainKey, JSON.stringify(explainAllStateV4)); } catch (e) {}
  }

  materialQuestions.forEach(q => {
    const qIdx = q.idx;
    const val = Object.prototype.hasOwnProperty.call(serverAnswersByIdx, qIdx)
      ? serverAnswersByIdx[qIdx]
      : explainV4Text(qIdx);
    const textarea = document.getElementById('explainResult-' + qIdx);
    if (textarea && textarea.value !== val) {
      textarea.value = val;
    }
    const ok = String(val || '').trim().length >= 5;
    document.getElementById('explainAllCard-' + qIdx)?.classList.toggle('done', ok);
    const st = document.getElementById('explainSave-' + qIdx);
    if (st) {
      st.textContent = ok ? '✓ Hasil EXPLAIN terisi' : String(val || '').length + ' karakter';
      st.classList.toggle('ok', ok);
    }
  });

  updateExplainAllProgress();
}

/**
 * Menyimpan jawaban secara lokal (memory + localStorage terisolasi per id_siswa) saat event oninput
 */
function handleExplainInputLocal(i, val) {
  const explainKey = getExplainAnswersStorageKey();
  const existing = explainAllStateV4['q' + i] || {};
  explainAllStateV4['q' + i] = {
    ...existing,
    text: val,
    updatedAt: new Date().toISOString()
  };

  const textarea = document.getElementById('explainResult-' + i);
  if (textarea && textarea.value !== val) {
    textarea.value = val;
  }

  if (typeof store !== 'undefined' && store.write) {
    store.write(explainKey, explainAllStateV4);
  } else {
    try { localStorage.setItem(explainKey, JSON.stringify(explainAllStateV4)); } catch (e) {}
  }

  const ok = String(val).trim().length >= 5;
  document.getElementById('explainAllCard-' + i)?.classList.toggle('done', ok);
  const st = document.getElementById('explainSave-' + i);
  if (st) {
    st.textContent = ok ? '✓ Hasil EXPLAIN terisi' : String(val).length + ' karakter';
    st.classList.toggle('ok', ok);
  }
  updateExplainAllProgress(false);
}

/**
 * Menjadwalkan sinkronisasi jawaban ke server dengan jitter 0–1000 ms saat onchange
 */
function handleExplainChangeSync(idx, val) {
  handleExplainInputLocal(idx, val);
  scheduleServerExplainSync(idx, val);
}

function scheduleServerExplainSync(idx, text) {
  if (_explainSyncTimers[idx]) {
    clearTimeout(_explainSyncTimers[idx]);
  }
  const jitterMs = Math.floor(Math.random() * 1000);
  _explainSyncTimers[idx] = setTimeout(async () => {
    delete _explainSyncTimers[idx];
    await syncSingleExplainToServer(idx, text);
  }, jitterMs);
}

/**
 * Sinkronisasi satu jawaban hasil EXPLAIN ke tabel 'explain' di server (PATCH/POST)
 */
async function syncSingleExplainToServer(idx, text) {
  if (!currentKelompokExplain || !currentKelompokExplain.id_kelompok_discuss) return;
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!api) return;

  const questions = window.ANSWER_ESSAY25 || [];
  const q = questions[idx];
  if (!q) return;

  const idSoal = q.id_soal !== undefined ? q.id_soal : (idx + 1);
  const idKelompokDiscuss = currentKelompokExplain.id_kelompok_discuss;
  const curMateri = (q && q.mat) || 1;
  const studentProfile = getExplainStudentProfile();
  const studentId = studentProfile.id_siswa;

  const payload = {
    id_kelompok: idKelompokDiscuss,
    id_materi: curMateri,
    id_siswa: studentId || null,
    id_soal: idSoal,
    jawaban: text,
    sumber: 'esai',
    pertanyaan: q.q || '',
    nama_kelompok: currentKelompokExplain.nama_kelompok || '',
    kelas: studentProfile.kelas || currentKelompokExplain.kelas || '',
    sekolah: studentProfile.school || currentKelompokExplain.sekolah || '',
    from_answer: 0
  };

  try {
    const checkCriteria = { id_kelompok: idKelompokDiscuss, id_materi: curMateri, id_soal: idSoal };
    if (studentId) checkCriteria.id_siswa = studentId;
    const res = await api.getWhere('explain', checkCriteria);
    const rawList = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
    const list = filterRowsForExplainStudent(rawList, studentId);
    if (list && list.length > 0) {
      const existing = list[0];
      const idExplain = existing.id_explain || existing.id;
      await api.patch('explain', 'id_explain', idExplain, payload);
    } else {
      await api.post('explain', payload);
    }
  } catch (err) {
    console.warn(`[syncSingleExplainToServer] Gagal sinkronisasi soal #${idSoal}:`, err);
  }
}

/**
 * Kompatibilitas mundur dengan fungsi lama
 */
function saveExplainAllAnswer(i, val) {
  handleExplainInputLocal(i, val);
}

function initRadecExplain() {
  if (!document.getElementById('explainAllMaterialTabs')) return;
  if (typeof loadDiscussAllV4 === 'function') loadDiscussAllV4();
  loadExplainAllV4();
  renderExplainAllV4();
  loadExplainMeta();

  // Deteksi kelompok & sinkronisasi data dari discuss ke explain
  checkOrCreateExplainGroup(explainAllMaterialV4);
}

function showExplainAllMaterial(m) {
  const guardMatFn = (typeof guardMaterialAccess === 'function')
    ? guardMaterialAccess
    : ((typeof window !== 'undefined' && typeof window.guardMaterialAccess === 'function') ? window.guardMaterialAccess : null);
  if (guardMatFn && !guardMatFn(m)) {
    return false;
  }
  explainAllMaterialV4 = m;
  if (typeof window !== 'undefined') window.explainAllMaterialV4 = m;
  renderExplainAllV4();
  loadEcoExplainData(m, currentKelompokExplain);
  setTimeout(() => {
    document.getElementById('explainAllMaterialTitle')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 40);

  // Lazy-loading per materi
  checkOrCreateExplainGroup(m);
}

function getExplainMaterialQuestions(m) {
  if (typeof getQuestionsByMaterial === 'function') return getQuestionsByMaterial(m);
  if (typeof window !== 'undefined' && typeof window.getQuestionsByMaterial === 'function') {
    return window.getQuestionsByMaterial(m);
  }
  const questions = (typeof window !== 'undefined' && window.ANSWER_ESSAY25) || [];
  return questions.map((q, i) => ({ ...q, idx: i })).filter(q => q.mat === Number(m));
}

function renderExplainAllV4() {
  if (typeof loadDiscussAllV4 === 'function') loadDiscussAllV4();
  loadExplainAllV4();

  const tabs = document.getElementById('explainAllMaterialTabs');
  const title = document.getElementById('explainAllMaterialTitle');
  const box = document.getElementById('explainAllAnswersContainer');
  if (!tabs || !box) return;

  const esc = (typeof store !== 'undefined' && store.escapeHtml) ? store.escapeHtml : (v => String(v || ''));
  const questions = window.ANSWER_ESSAY25 || [];
  const isAllowedMatFn = (typeof isMaterialAllowed === 'function')
    ? isMaterialAllowed
    : ((typeof window !== 'undefined' && typeof window.isMaterialAllowed === 'function') ? window.isMaterialAllowed : null);
  const firstAllowedMatFn = (typeof getFirstAllowedMaterial === 'function')
    ? getFirstAllowedMaterial
    : ((typeof window !== 'undefined' && typeof window.getFirstAllowedMaterial === 'function') ? window.getFirstAllowedMaterial : null);

  let hasAnyAllowedMat = true;
  if (isAllowedMatFn && !isAllowedMatFn(explainAllMaterialV4)) {
    const firstAllowed = firstAllowedMatFn ? firstAllowedMatFn() : null;
    if (firstAllowed) {
      explainAllMaterialV4 = firstAllowed;
      if (typeof window !== 'undefined') window.explainAllMaterialV4 = firstAllowed;
    } else {
      hasAnyAllowedMat = false;
    }
  }

  tabs.innerHTML = [1, 2, 3, 4, 5].map(m => {
    const arr = getExplainMaterialQuestions(m);
    const done = arr.filter(x => explainV4Text(x.idx).trim().length >= 5).length;
    const locked = isAllowedMatFn && !isAllowedMatFn(m);
    return `<button type="button" class="exp-mat-btn ${m === explainAllMaterialV4 && hasAnyAllowedMat ? 'active' : ''}${locked ? ' locked' : ''}" onclick="showExplainAllMaterial(${m})">${locked ? '🔒 ' : ''}Materi ${m}<small>${done}/${arr.length} terisi</small></button>`;
  }).join('');

  if (!hasAnyAllowedMat) {
    if (title) {
      title.innerHTML = `<strong>🔒 Akses Materi Dibatasi Guru</strong><br><span>Saat ini belum ada materi yang dibuka oleh guru untuk kelasmu.</span>`;
    }
    box.innerHTML = `<article class="radec-all-answer-card explain"><div class="radec-all-question">🔒 Belum ada materi EXPLAIN yang diizinkan untuk kelasmu.</div></article>`;
    updateExplainAllProgress();
    return;
  }

  const arr = getExplainMaterialQuestions(explainAllMaterialV4);
  if (title && arr.length) {
    title.innerHTML = `<strong>📗 Materi ${explainAllMaterialV4} — ${esc(arr[0].topic)}</strong><br><span>Tuliskan jawaban yang telah diperbaiki setelah penjelasan, klarifikasi, dan umpan balik kelas.</span>`;
  }

  box.innerHTML = arr.map((x,i) => {
    const result = explainV4Text(x.idx);
    const done = result.trim().length >= 5;
    const mediaVisualHtml = (typeof renderQuestionVisualAndMedia === 'function')
      ? renderQuestionVisualAndMedia(x)
      : ((typeof window !== 'undefined' && typeof window.renderQuestionVisualAndMedia === 'function')
        ? window.renderQuestionVisualAndMedia(x)
        : '');
    const stimHtml = (x.stim && String(x.stim).trim())
      ? `<div class="ans-stimulus">${esc(x.stim)}</div>`
      : '';
    return `<article class="radec-all-answer-card explain ${done ? 'done' : ''}" id="explainAllCard-${x.idx}">
      <div class="radec-all-qhead">
        <span class="radec-all-qno">${i + 1}</span>
        <span class="radec-all-chip">Materi ${x.mat}</span>
      </div>
      ${mediaVisualHtml}
      ${stimHtml}
      <div class="radec-all-question">${esc(x.q)}</div>
      <label class="radec-result-label" for="explainResult-${x.idx}">🗣️ Jawaban setelah EXPLAIN</label>
      <textarea id="explainResult-${x.idx}" class="radec-result-textarea" placeholder="Tuliskan jawaban yang sudah diperbaiki setelah penjelasan kelas, alasan, dan umpan balik..." oninput="handleExplainInputLocal(${x.idx},this.value)" onchange="handleExplainChangeSync(${x.idx},this.value)">${esc(result)}</textarea>
      <div class="radec-card-save">
        <span>💾 Tersimpan otomatis</span>
        <span class="${done ? 'ok' : ''}" id="explainSave-${x.idx}">${done ? '✓ Hasil EXPLAIN terisi' : result.length + ' karakter'}</span>
      </div>
    </article>`;
  }).join('');

  updateExplainAllProgress();
}

function updateExplainAllProgress(refresh = true) {
  const n = explainV4Done();
  const questions = window.ANSWER_ESSAY25 || [];
  const totalQ = questions.length || 50;
  const t = document.getElementById('explainAllProgressText');
  const f = document.getElementById('explainAllProgressFill');
  const st = document.getElementById('explainAllStatus');

  if (t) t.textContent = n + ' dari ' + totalQ + ' selesai';
  if (f) f.style.width = (n / totalQ * 100) + '%';
  if (st) {
    st.textContent = n === totalQ
      ? `✅ Semua ${totalQ} hasil EXPLAIN sudah terisi. Kamu siap menuju CREATE.`
      : `Masih ada ${totalQ - n} jawaban hasil EXPLAIN yang belum diisi.`;
  }

  if (refresh) {
    document.querySelectorAll('#explainAllMaterialTabs .exp-mat-btn').forEach((b, k) => {
      const arr = getExplainMaterialQuestions(k + 1);
      const d = arr.filter(x => explainV4Text(x.idx).trim().length >= 5).length;
      const sm = b.querySelector('small');
      if (sm) sm.textContent = d + '/' + arr.length + ' terisi';
    });
  }
}

function findIncompleteExplainAnswer() {
  loadExplainAllV4();
  const questions = window.ANSWER_ESSAY25 || [];
  const totalQ = questions.length || 50;
  const i = questions.findIndex((q, k) => explainV4Text(k).trim().length < 5);
  if (i < 0) {
    notifyExplainSuccess('Semua Soal EXPLAIN Terisi', `Hebat! Semua ${totalQ} jawaban hasil EXPLAIN sudah terisi lengkap.`);
    return;
  }
  explainAllMaterialV4 = (questions[i] && questions[i].mat) || 1;
  renderExplainAllV4();
  setTimeout(() => {
    document.getElementById('explainAllCard-' + i)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 70);
}

/**
 * Memuat data refleksi ecomedia kelompok pada tahap EXPLAIN dari server (tabel 'ecomedia_explain')
 * atau dari cache lokal berdasarkan id_kelompok dan id_materi.
 */
async function loadEcoExplainData(materi = explainAllMaterialV4, group = currentKelompokExplain) {
  const el = document.getElementById('explainEcomediaReflectionAll');
  const statusEl = document.getElementById('explainMetaMsg');
  if (!el) return;

  const idKelompok = group && (group.id_kelompok_discuss || group.id_kelompok || group.id_kelompok_explain);
  const curMateri = materi || explainAllMaterialV4 || 1;
  const studentId = getExplainStudentProfile().id_siswa;
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  let loadedFromServer = false;

  // 1. Coba ambil dari server tabel 'ecomedia_explain' per id_kelompok, id_materi, id_siswa
  if (api && idKelompok && typeof api.getWhere === 'function') {
    try {
      const criteria = { id_kelompok: idKelompok, id_materi: curMateri };
      if (studentId) criteria.id_siswa = studentId;
      const res = await api.getWhere('ecomedia_explain', criteria);
      const rawList = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
      const list = filterRowsForExplainStudent(rawList, studentId);
      if (list && list.length > 0) {
        const row = list[list.length - 1]; // rekaman terbaru milik siswa
        el.value = row.jawaban || '';

        // Sinkronkan ke cache lokal terisolasi per siswa
        const key = `ecoRadecExplainEcomedia_${idKelompok}_m${curMateri}_${studentId || 'guest'}`;
        const cacheData = {
          ecomedia: row.jawaban || '',
          updatedAt: row.updated_at || new Date().toISOString()
        };
        if (typeof store !== 'undefined' && store.write) {
          store.write(key, cacheData);
        } else {
          try { localStorage.setItem(key, JSON.stringify(cacheData)); } catch (e) {}
        }

        loadedFromServer = true;
        if (statusEl) {
          const ok = (row.jawaban || '').trim().length >= 5;
          statusEl.textContent = ok ? '✓ Refleksi ecomedia tersinkronisasi dari server' : '💾 Refleksi tersimpan di server.';
        }
      }
    } catch (err) {
      console.warn('[loadEcoExplainData] Gagal mengambil ecomedia_explain dari server:', err);
    }
  }

  // 2. Jika tidak ada di server, periksa draf lokal milik siswa ini
  if (!loadedFromServer) {
    const key = idKelompok
      ? `ecoRadecExplainEcomedia_${idKelompok}_m${curMateri}_${studentId || 'guest'}`
      : `ecoRadecExplainMetaV4_${studentId || 'guest'}`;
    let d = null;
    if (typeof store !== 'undefined' && store.read) {
      d = store.read(key, null);
    } else {
      try { d = JSON.parse(localStorage.getItem(key)); } catch (e) {}
    }

    if (!d && !studentId && typeof RADEC_EXPLAIN_META_V4 !== 'undefined') {
      try { d = JSON.parse(localStorage.getItem(RADEC_EXPLAIN_META_V4)); } catch (e) {}
    }

    if (d && typeof d.ecomedia === 'string') {
      el.value = d.ecomedia;
      if (statusEl) {
        statusEl.textContent = d.ecomedia.trim().length >= 5 ? '✓ Draf lokal terisi' : '💾 Refleksi tersimpan otomatis.';
      }
    } else {
      el.value = '';
      if (statusEl) statusEl.textContent = '💾 Refleksi tersimpan otomatis.';
    }
  }
}

/**
 * Menyimpan draf lokal refleksi ecomedia pada tahap EXPLAIN saat siswa mengetik (oninput)
 */
function handleExplainEcomediaInputLocal(val) {
  const group = currentKelompokExplain;
  const idKelompok = group && (group.id_kelompok_discuss || group.id_kelompok || group.id_kelompok_explain);
  const curMateri = explainAllMaterialV4 || 1;
  const studentId = getExplainStudentProfile().id_siswa;
  const key = idKelompok
    ? `ecoRadecExplainEcomedia_${idKelompok}_m${curMateri}_${studentId || 'guest'}`
    : `ecoRadecExplainMetaV4_${studentId || 'guest'}`;

  const data = {
    ecomedia: val || '',
    updatedAt: new Date().toISOString()
  };

  if (typeof store !== 'undefined' && store.write) {
    store.write(key, data);
  } else {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
  }

  // Tetap sinkronkan ke metaKey legacy agar kompatibel
  const metaKey = typeof RADEC_EXPLAIN_META_V4 !== 'undefined' ? RADEC_EXPLAIN_META_V4 : 'ecoRadecExplainMetaV4';
  try { localStorage.setItem(metaKey, JSON.stringify(data)); } catch (e) {}

  const statusEl = document.getElementById('explainMetaMsg');
  if (statusEl) {
    statusEl.textContent = String(val).trim().length >= 5 ? '✓ Draf tersimpan di perangkat' : String(val).length + ' karakter';
  }
}

/**
 * Mengirim data refleksi Ecomedia kelompok ke tabel 'ecomedia_explain' di server
 */
async function kirimEcoExplain() {
  const group = currentKelompokExplain;
  const idKelompok = group && (group.id_kelompok_discuss || group.id_kelompok || group.id_kelompok_explain);

  if (!group || !idKelompok) {
    notifyExplainError('Silakan selesaikan tahap DISCUSS terlebih dahulu sebelum mengirim refleksi ecomedia.', 'Kelompok Belum Ditemukan');
    return;
  }

  const el = document.getElementById('explainEcomediaReflectionAll');
  const statusEl = document.getElementById('explainMetaMsg');
  const btn = document.getElementById('btnSubmitEcoExplain');

  const jawaban = el ? el.value.trim() : '';

  if (!jawaban) {
    notifyExplainError('Silakan isi refleksi Ecomedia sebelum mengirim jawaban.', 'Refleksi Masih Kosong');
    if (el) el.focus();
    return;
  }

  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!api) {
    notifyExplainError('Koneksi ke server tidak tersedia.', 'Koneksi Terputus');
    return;
  }

  if (typeof showLoading === 'function') {
    showLoading('Menyimpan Refleksi Ecomedia...', 'Mohon tunggu sebentar, data refleksi kelompok sedang dikirim ke server...');
  }
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ Mengirim...</span>';
  }

  const curMateri = explainAllMaterialV4 || 1;
  const studentId = getExplainStudentProfile().id_siswa;

  const payload = {
    id_kelompok: idKelompok,
    id_materi: curMateri,
    id_siswa: studentId || null,
    jawaban: jawaban,
    keterangan: ''
  };

  try {
    let existingRecord = null;
    try {
      const checkCriteria = { id_kelompok: idKelompok, id_materi: curMateri };
      if (studentId) checkCriteria.id_siswa = studentId;
      const existing = await api.getWhere('ecomedia_explain', checkCriteria);
      const rawList = Array.isArray(existing) ? existing : (existing && Array.isArray(existing.data) ? existing.data : []);
      const list = filterRowsForExplainStudent(rawList, studentId);
      if (list && list.length > 0) {
        existingRecord = list[list.length - 1];
      }
    } catch (errCheck) {
      console.warn('[kirimEcoExplain] Cek data ecomedia_explain:', errCheck);
    }

    if (existingRecord) {
      const pkField = existingRecord.id_ecomedia_discuss !== undefined
        ? 'id_ecomedia_discuss'
        : (existingRecord.id_ecomedia_explain !== undefined
            ? 'id_ecomedia_explain'
            : (existingRecord.id_explain !== undefined ? 'id_explain' : 'id'));
      const pkVal = existingRecord[pkField] || existingRecord.id || existingRecord.id_ecomedia_discuss;
      await api.patch('ecomedia_explain', pkField, pkVal, payload);
    } else {
      await api.post('ecomedia_explain', payload);
    }

    handleExplainEcomediaInputLocal(jawaban);

    if (statusEl) {
      statusEl.textContent = '✓ Refleksi ecomedia tersimpan di server';
    }

    notifyExplainSuccess('Refleksi Ecomedia Berhasil Disimpan', 'Jawaban refleksi ecomedia kelompokmu berhasil tersimpan di server.');
  } catch (err) {
    console.error('[kirimEcoExplain] Gagal menyimpan ke server:', err);
    notifyExplainError('Gagal mengirim refleksi ke server: ' + (err.message || 'Terjadi kesalahan sistem'), 'Gagal Menyimpan');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>🚀 Kirim Jawaban</span>';
    }
  }
}

function saveExplainMeta() {
  const el = document.getElementById('explainEcomediaReflectionAll');
  handleExplainEcomediaInputLocal(el ? el.value : '');
}

function loadExplainMeta() {
  loadEcoExplainData(explainAllMaterialV4, currentKelompokExplain);
}

function explainGoCreate() {
  if (typeof goStep === 'function') {
    goStep(4);
  }
}

// Global window exposure
if (typeof window !== 'undefined') {
  window.explainAllMaterialV4 = explainAllMaterialV4;
  window.explainAllStateV4 = explainAllStateV4;
  window.currentKelompokExplain = currentKelompokExplain;
  window.getExplainAllMaterial = getExplainAllMaterial;
  window.setExplainAllMaterial = setExplainAllMaterial;
  window.getCurrentKelompokExplain = getCurrentKelompokExplain;
  window.setCurrentKelompokExplain = setCurrentKelompokExplain;
  window.loadExplainAllV4 = loadExplainAllV4;
  window.explainV4Text = explainV4Text;
  window.explainV4Done = explainV4Done;
  window.initRadecExplain = initRadecExplain;
  window.showExplainAllMaterial = showExplainAllMaterial;
  window.renderExplainAllV4 = renderExplainAllV4;
  window.saveExplainAllAnswer = saveExplainAllAnswer;
  window.handleExplainInputLocal = handleExplainInputLocal;
  window.handleExplainChangeSync = handleExplainChangeSync;
  window.scheduleServerExplainSync = scheduleServerExplainSync;
  window.syncSingleExplainToServer = syncSingleExplainToServer;
  window.updateExplainAllProgress = updateExplainAllProgress;
  window.findIncompleteExplainAnswer = findIncompleteExplainAnswer;
  window.saveExplainMeta = saveExplainMeta;
  window.loadExplainMeta = loadExplainMeta;
  window.explainGoCreate = explainGoCreate;
  window.renderExplainGroupDisplay = renderExplainGroupDisplay;
  window.checkOrCreateExplainGroup = checkOrCreateExplainGroup;
  window.copyDiscussToExplain = copyDiscussToExplain;
  window.loadExplainDataForMaterial = loadExplainDataForMaterial;
  window.applyExplainAnswersToUI = applyExplainAnswersToUI;
  window.notifyExplainError = notifyExplainError;
  window.notifyExplainSuccess = notifyExplainSuccess;
  window.loadEcoExplainData = loadEcoExplainData;
  window.handleExplainEcomediaInputLocal = handleExplainEcomediaInputLocal;
  window.kirimEcoExplain = kirimEcoExplain;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    explainAllMaterialV4,
    explainAllStateV4,
    currentKelompokExplain,
    getExplainAllMaterial,
    setExplainAllMaterial,
    getCurrentKelompokExplain,
    setCurrentKelompokExplain,
    loadExplainAllV4,
    explainV4Text,
    explainV4Done,
    initRadecExplain,
    showExplainAllMaterial,
    renderExplainAllV4,
    saveExplainAllAnswer,
    handleExplainInputLocal,
    handleExplainChangeSync,
    scheduleServerExplainSync,
    syncSingleExplainToServer,
    updateExplainAllProgress,
    findIncompleteExplainAnswer,
    saveExplainMeta,
    loadExplainMeta,
    explainGoCreate,
    renderExplainGroupDisplay,
    checkOrCreateExplainGroup,
    copyDiscussToExplain,
    loadExplainDataForMaterial,
    applyExplainAnswersToUI,
    notifyExplainError,
    notifyExplainSuccess,
    loadEcoExplainData,
    handleExplainEcomediaInputLocal,
    kirimEcoExplain
  };
}

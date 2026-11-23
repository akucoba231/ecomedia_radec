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

function loadExplainAllV4() {
  const explainKey = typeof RADEC_EXPLAIN_ALL_V4 !== 'undefined' ? RADEC_EXPLAIN_ALL_V4 : 'ecoRadecExplainAllAnswersV4';
  const legacyKey = typeof RADEC_EXPLAIN_KEY !== 'undefined' ? RADEC_EXPLAIN_KEY : 'ecoRadecExplainStructuredRev1';

  if (typeof store !== 'undefined' && store.read) {
    explainAllStateV4 = store.read(explainKey, {});
  } else {
    try {
      explainAllStateV4 = JSON.parse(localStorage.getItem(explainKey) || '{}') || {};
    } catch (e) {
      explainAllStateV4 = {};
    }
  }

  // Migrasi jawaban legacy jika ada
  let legacy = {};
  if (typeof store !== 'undefined' && store.read) {
    legacy = store.read(legacyKey, {});
  } else {
    try {
      legacy = JSON.parse(localStorage.getItem(legacyKey) || '{}') || {};
    } catch (e) {}
  }

  let changed = false;
  const questions = window.ANSWER_ESSAY25 || [];
  questions.forEach((q, i) => {
    const k = 'q' + i;
    const textVal = explainV4Text(i);
    if (!textVal.trim()) {
      const old = legacy[k] || {};
      const val = String(old.revision || old.summary || old.individual || '').trim();
      if (val) {
        explainAllStateV4[k] = { text: val, updatedAt: new Date().toISOString(), migrated: true };
        changed = true;
      }
    }
  });

  if (changed) {
    if (typeof store !== 'undefined' && store.write) {
      store.write(explainKey, explainAllStateV4);
    } else {
      try { localStorage.setItem(explainKey, JSON.stringify(explainAllStateV4)); } catch (e) {}
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

  // 1. Cek apakah di tabel 'explain' sudah ada record untuk kelompok dan materi ini
  let explainList = [];
  try {
    const res = await api.getWhere('explain', { id_kelompok: idKelompokDiscuss, id_materi: materi });
    explainList = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.warn('[copyDiscussToExplain] Kueri tabel explain:', err);
  }

  if (explainList && explainList.length > 0) {
    applyExplainAnswersToUI(explainList, materi);
    return;
  }

  // 2. Jika belum ada di explain, ambil jawaban dari tabel 'discuss'
  let discussList = [];
  try {
    const resDisc = await api.getWhere('discuss', { id_kelompok: idKelompokDiscuss, id_materi: materi });
    discussList = Array.isArray(resDisc) ? resDisc : (resDisc && Array.isArray(resDisc.data) ? resDisc.data : []);
  } catch (errDisc) {
    console.warn('[copyDiscussToExplain] Kueri tabel discuss:', errDisc);
  }

  // 3. Salin setiap baris jawaban discuss ke explain
  if (discussList && discussList.length > 0) {
    for (const item of discussList) {
      const payloadExplainItem = {
        id_kelompok: idKelompokDiscuss,
        id_materi: materi,
        sumber: item.sumber || 'esai',
        id_soal: item.id_soal,
        pertanyaan: item.pertanyaan || '',
        jawaban: item.jawaban || '',
        keterangan: item.keterangan || '',
        from_answer: item.from_answer ? 1 : 0,
        nama_kelompok: (group && group.nama_kelompok) || '',
        kelas: (group && group.kelas) || '',
        sekolah: (group && group.sekolah) || ''
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
 * Memuat data jawaban dari tabel 'explain' untuk materi yang sedang aktif
 */
async function loadExplainDataForMaterial(materi, explainGroup) {
  if (!explainGroup || !explainGroup.id_kelompok_discuss) return;
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!api) return;

  const idKelompokDiscuss = explainGroup.id_kelompok_discuss;

  let explainList = [];
  try {
    const res = await api.getWhere('explain', { id_kelompok: idKelompokDiscuss, id_materi: materi });
    explainList = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
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
 */
function applyExplainAnswersToUI(explainList, materi) {
  const explainKey = typeof RADEC_EXPLAIN_ALL_V4 !== 'undefined' ? RADEC_EXPLAIN_ALL_V4 : 'ecoRadecExplainAllAnswersV4';
  const questions = window.ANSWER_ESSAY25 || [];

  explainList.forEach(item => {
    if (item.id_soal !== null && item.id_soal !== undefined) {
      const numSoal = Number(item.id_soal);
      if (!isNaN(numSoal) && numSoal > 0) {
        const qIdx = numSoal - 1;
        if (qIdx >= 0 && qIdx < questions.length && item.jawaban !== undefined && item.jawaban !== null) {
          explainAllStateV4['q' + qIdx] = {
            text: item.jawaban,
            updatedAt: item.updated_at || new Date().toISOString(),
            id_explain: item.id_explain
          };
          const textarea = document.getElementById('explainResult-' + qIdx);
          if (textarea && textarea.value !== item.jawaban) {
            textarea.value = item.jawaban;
          }
          const ok = String(item.jawaban).trim().length >= 5;
          document.getElementById('explainAllCard-' + qIdx)?.classList.toggle('done', ok);
          const st = document.getElementById('explainSave-' + qIdx);
          if (st) {
            st.textContent = ok ? '✓ Hasil EXPLAIN terisi' : String(item.jawaban).length + ' karakter';
            st.classList.toggle('ok', ok);
          }
        }
      }
    }
  });

  if (typeof store !== 'undefined' && store.write) {
    store.write(explainKey, explainAllStateV4);
  } else {
    try { localStorage.setItem(explainKey, JSON.stringify(explainAllStateV4)); } catch (e) {}
  }

  updateExplainAllProgress();
}

/**
 * Menyimpan jawaban secara lokal (memory + localStorage) saat event oninput
 */
function handleExplainInputLocal(i, val) {
  const explainKey = typeof RADEC_EXPLAIN_ALL_V4 !== 'undefined' ? RADEC_EXPLAIN_ALL_V4 : 'ecoRadecExplainAllAnswersV4';
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

  const payload = {
    id_kelompok: idKelompokDiscuss,
    id_materi: curMateri,
    id_soal: idSoal,
    jawaban: text,
    sumber: 'esai',
    pertanyaan: q.q || '',
    nama_kelompok: currentKelompokExplain.nama_kelompok || '',
    kelas: currentKelompokExplain.kelas || '',
    sekolah: currentKelompokExplain.sekolah || '',
    from_answer: 0
  };

  try {
    const res = await api.getWhere('explain', { id_kelompok: idKelompokDiscuss, id_materi: curMateri, id_soal: idSoal });
    const list = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
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

  tabs.innerHTML = [1, 2, 3, 4, 5].map(m => {
    const arr = getExplainMaterialQuestions(m);
    const done = arr.filter(x => explainV4Text(x.idx).trim().length >= 5).length;
    return `<button type="button" class="exp-mat-btn ${m === explainAllMaterialV4 ? 'active' : ''}" onclick="showExplainAllMaterial(${m})">Materi ${m}<small>${done}/${arr.length} terisi</small></button>`;
  }).join('');

  const arr = getExplainMaterialQuestions(explainAllMaterialV4);
  if (title && arr.length) {
    title.innerHTML = `<strong>📗 Materi ${explainAllMaterialV4} — ${esc(arr[0].topic)}</strong><br><span>Tuliskan jawaban yang telah diperbaiki setelah penjelasan, klarifikasi, dan umpan balik kelas.</span>`;
  }

  box.innerHTML = arr.map((x,i) => {
    const result = explainV4Text(x.idx);
    const done = result.trim().length >= 5;
    return `<article class="radec-all-answer-card explain ${done ? 'done' : ''}" id="explainAllCard-${x.idx}">
      <div class="radec-all-qhead">
        <span class="radec-all-qno">${i + 1}</span>
        <span class="radec-all-chip">Materi ${x.mat}</span>
      </div>
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
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  let loadedFromServer = false;

  // 1. Coba ambil dari server tabel 'ecomedia_explain'
  if (api && idKelompok && typeof api.getWhere === 'function') {
    try {
      const res = await api.getWhere('ecomedia_explain', { id_kelompok: idKelompok, id_materi: curMateri });
      const list = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
      if (list && list.length > 0) {
        const row = list[list.length - 1]; // rekaman terbaru
        el.value = row.jawaban || '';

        // Sinkronkan ke cache lokal
        const key = `ecoRadecExplainEcomedia_${idKelompok}_m${curMateri}`;
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

  // 2. Jika tidak ada di server, periksa draf lokal
  if (!loadedFromServer) {
    const key = idKelompok ? `ecoRadecExplainEcomedia_${idKelompok}_m${curMateri}` : 'ecoRadecExplainMetaV4';
    let d = null;
    if (typeof store !== 'undefined' && store.read) {
      d = store.read(key, null);
    } else {
      try { d = JSON.parse(localStorage.getItem(key)); } catch (e) {}
    }

    if (!d && typeof RADEC_EXPLAIN_META_V4 !== 'undefined') {
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
  const key = idKelompok ? `ecoRadecExplainEcomedia_${idKelompok}_m${curMateri}` : 'ecoRadecExplainMetaV4';

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

  const payload = {
    id_kelompok: idKelompok,
    id_materi: curMateri,
    jawaban: jawaban,
    keterangan: ''
  };

  try {
    let existingRecord = null;
    try {
      const existing = await api.getWhere('ecomedia_explain', { id_kelompok: idKelompok, id_materi: curMateri });
      const list = Array.isArray(existing) ? existing : (existing && Array.isArray(existing.data) ? existing.data : []);
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

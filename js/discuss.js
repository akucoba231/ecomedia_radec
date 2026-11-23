/**
 * EcoMedia RADEC - DISCUSS Module (Tahap 3: Diskusi Kelompok)
 * Mengelola pembahasan 25 soal bersama kelompok, perumusan kesepakatan jawaban,
 * jembatan pembahasan pertanyaan penasaran (Wondering), dan integrasi kelompok dinamis.
 */

let discussAllMaterialV4 = 1;
let discussAllStateV4 = {};
let currentKelompokDiscuss = null; // { id_kelompok, id_siswa, id_anggota, nama_kelompok, nama_anggota, id_materi }
let selectedGroupMembers = [];     // [ { id_siswa, nama, absen, isCreator } ]
let classmatesCache = [];          // [ { id_siswa, nama, kelas, absen, sekolah } ]
let isEditingKelompok = false;
let currentWonderQuestions = [];   // [ { id_pertanyaan, id_siswa, id_materi, pertanyaan, jawaban, id_discuss } ]
let discussEmergentQuestions = []; // [ { id_discuss, id_soal, id_answer, pertanyaan, jawaban, keterangan, from_answer, flaggedCount } ]
let _discussSyncTimers = {};

let currentDiscussGroupName = '';

function getDiscussAllMaterial() { return discussAllMaterialV4; }
function setDiscussAllMaterial(val) { discussAllMaterialV4 = val; if (typeof window !== 'undefined') window.discussAllMaterialV4 = val; return discussAllMaterialV4; }
function getCurrentKelompokDiscuss() { return currentKelompokDiscuss; }
function setCurrentKelompokDiscuss(val) {
  currentKelompokDiscuss = val;
  if (val && val.nama_kelompok) {
    currentDiscussGroupName = val.nama_kelompok;
    if (typeof window !== 'undefined') window.currentDiscussGroupName = val.nama_kelompok;
    try {
      localStorage.setItem('ecoRadecDiscussGroupName', val.nama_kelompok);
    } catch (e) {}
  }
  return currentKelompokDiscuss;
}
function getCurrentDiscussGroupName() {
  if (currentDiscussGroupName) return currentDiscussGroupName;
  if (currentKelompokDiscuss && currentKelompokDiscuss.nama_kelompok) return currentKelompokDiscuss.nama_kelompok;
  if (typeof window !== 'undefined' && window.currentDiscussGroupName) return window.currentDiscussGroupName;
  try {
    return localStorage.getItem('ecoRadecDiscussGroupName') || '';
  } catch (e) {
    return '';
  }
}
function setCurrentDiscussGroupName(val) {
  currentDiscussGroupName = val || '';
  if (typeof window !== 'undefined') window.currentDiscussGroupName = currentDiscussGroupName;
  try {
    localStorage.setItem('ecoRadecDiscussGroupName', currentDiscussGroupName);
  } catch (e) {}
  return currentDiscussGroupName;
}
function getSelectedGroupMembers() { return selectedGroupMembers; }
function setSelectedGroupMembers(val) { selectedGroupMembers = val; return selectedGroupMembers; }
function getCurrentWonderQuestions() { return currentWonderQuestions; }
function getDiscussEmergentQuestions() { return discussEmergentQuestions; }
function getClassmatesCache() { return classmatesCache; }
function setClassmatesCache(val) { classmatesCache = val; return classmatesCache; }

/**
 * Notifikasi error terpadu menggunakan modal overlay showLoadingError
 */
function notifyDiscussError(message, title = 'Mohon Maaf Ada Masalah') {
  if (typeof showLoadingError === 'function') {
    showLoadingError(message, title);
  } else if (typeof window !== 'undefined' && typeof window.showLoadingError === 'function') {
    window.showLoadingError(message, title);
  } else {
    console.error(`[${title}] ${message}`);
  }
}

/**
 * Notifikasi sukses terpadu menggunakan modal overlay showLoadingSuccess
 */
function notifyDiscussSuccess(title, subtitle) {
  if (typeof showLoadingSuccess === 'function') {
    showLoadingSuccess(title, subtitle);

  } else if (typeof window !== 'undefined' && typeof window.showLoadingSuccess === 'function') {
    window.showLoadingSuccess(title, subtitle);
  } else {
    console.log(`[${title}] ${subtitle}`);
  }
  setTimeout(() => {
    if (typeof hideLoading === 'function') {
      hideLoading();
    } else if (typeof window !== 'undefined' && typeof window.hideLoading === 'function') {
      window.hideLoading();
    }
  }, 2000);
}


function loadDiscussAllV4() {
  const discussKey = typeof RADEC_DISCUSS_ALL_V4 !== 'undefined' ? RADEC_DISCUSS_ALL_V4 : 'ecoRadecDiscussAllAnswersV4';
  const legacyKey = typeof RADEC_DISCUSS_KEY !== 'undefined' ? RADEC_DISCUSS_KEY : 'ecoRadecDiscussStructuredRev3';

  if (typeof store !== 'undefined' && store.read) {
    discussAllStateV4 = store.read(discussKey, {});
  } else {
    try {
      discussAllStateV4 = JSON.parse(localStorage.getItem(discussKey) || '{}') || {};
    } catch (e) {
      discussAllStateV4 = {};
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
    const textVal = discussV4Text(i);
    if (!textVal.trim()) {
      const old = String((legacy[k] && legacy[k].consensus) || '').trim();
      if (old) {
        discussAllStateV4[k] = { text: old, updatedAt: new Date().toISOString(), migrated: true };
        changed = true;
      }
    }
  });

  if (changed) {
    if (typeof store !== 'undefined' && store.write) {
      store.write(discussKey, discussAllStateV4);
    } else {
      try { localStorage.setItem(discussKey, JSON.stringify(discussAllStateV4)); } catch (e) {}
    }
  }
}

function discussV4Text(i) {
  const rec = discussAllStateV4['q' + i];
  return typeof rec === 'string' ? rec : ((rec && rec.text) || '');
}

function discussV4Done() {
  loadDiscussAllV4();
  const questions = window.ANSWER_ESSAY25 || [];
  return questions.filter((q, i) => discussV4Text(i).trim().length >= 5).length;
}

function renderDiscussRoles() {
  const container = document.getElementById('discussGroupRoles');
  if (!container) return;
  const roles = window.DISCUSS_ROLES || [];
  container.innerHTML = roles.map(r => `
    <div class="role-badge"><span class="ri">${r.icon}</span><span class="rt">${r.title}</span><span class="rd">${r.desc}</span></div>
  `).join('');
}

function renderDiscussLenses() {
  const container = document.getElementById('discussLensesContainer');
  if (!container) return;
  const lenses = window.DISCUSS_LENSES || [];
  const esc = (typeof store !== 'undefined' && store.escapeHtml) ? store.escapeHtml : (v => String(v || ''));
  container.innerHTML = lenses.map(l => `
    <label><b>${esc(l.title)}</b><span>${esc(l.prompt)}</span><textarea id="${esc(l.id)}" class="disc-textarea" placeholder="${esc(l.placeholder)}" oninput="saveEcoDiscussLens()"></textarea></label>
  `).join('');
}

/**
 * Menyimpan draf refleksi Ecomedia kelompok secara lokal (store / localStorage)
 */
function saveEcoDiscussLens() {
  const curMateri = discussAllMaterialV4 || 1;
  const idKelompok = (currentKelompokDiscuss && currentKelompokDiscuss.id_kelompok) || 'draft';
  const d = {
    message: document.getElementById('ecoDiscussMessage')?.value || '',
    voice: document.getElementById('ecoDiscussVoice')?.value || '',
    footprint: document.getElementById('ecoDiscussFootprint')?.value || ''
  };

  const key = `ecoRadecLopezDiscuss_${idKelompok}_m${curMateri}`;
  if (typeof store !== 'undefined' && store.write) {
    store.write(key, d);
  } else {
    try { localStorage.setItem(key, JSON.stringify(d)); } catch (e) {}
  }

  const n = Object.values(d).filter(v => (v || '').trim().length >= 5).length;
  const m = document.getElementById('ecoDiscussStatus');
  if (m) m.textContent = `💾 Draf tersimpan lokal · ${n}/3 refleksi terisi`;
}

/**
 * Memuat data refleksi ecomedia kelompok dari server (tabel 'ecomedia_discuss')
 * atau dari cache lokal berdasarkan id_kelompok dan id_materi.
 */
async function loadEcoDiscussData(materi = discussAllMaterialV4, group = currentKelompokDiscuss) {
  const elMsg = document.getElementById('ecoDiscussMessage');
  const elVoice = document.getElementById('ecoDiscussVoice');
  const elFootprint = document.getElementById('ecoDiscussFootprint');
  const statusEl = document.getElementById('ecoDiscussStatus');

  if (!elMsg && !elVoice && !elFootprint) return;

  const idKelompok = group && group.id_kelompok;
  const curMateri = materi || discussAllMaterialV4 || 1;
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  let loadedFromServer = false;

  // 1. Coba ambil dari server tabel 'ecomedia_discuss'
  if (api && idKelompok && typeof api.getWhere === 'function') {
    try {
      const res = await api.getWhere('ecomedia_discuss', { id_kelompok: idKelompok, id_materi: curMateri });
      const list = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
      if (list && list.length > 0) {
        const row = list[list.length - 1]; // rekaman terbaru
        if (elMsg) elMsg.value = row.pesan || '';
        if (elVoice) elVoice.value = row.siapa || '';
        if (elFootprint) elFootprint.value = row.bahan_energi_limbah || '';

        // Sinkronkan ke cache lokal
        const key = `ecoRadecLopezDiscuss_${idKelompok}_m${curMateri}`;
        const cacheData = {
          message: row.pesan || '',
          voice: row.siapa || '',
          footprint: row.bahan_energi_limbah || ''
        };
        if (typeof store !== 'undefined' && store.write) {
          store.write(key, cacheData);
        } else {
          try { localStorage.setItem(key, JSON.stringify(cacheData)); } catch (e) {}
        }

        loadedFromServer = true;
        if (statusEl) {
          const n = Object.values(cacheData).filter(v => (v || '').trim().length >= 5).length;
          statusEl.textContent = `✓ Refleksi ecomedia tersinkronisasi dari server (${n}/3 terisi)`;
        }
      }
    } catch (err) {
      console.warn('[loadEcoDiscussData] Gagal mengambil ecomedia_discuss dari server:', err);
    }
  }

  // 2. Jika tidak ada di server, periksa draf lokal
  if (!loadedFromServer) {
    const key = idKelompok ? `ecoRadecLopezDiscuss_${idKelompok}_m${curMateri}` : 'ecoRadecLopezDiscussRev1';
    let d = null;
    if (typeof store !== 'undefined' && store.read) {
      d = store.read(key, null);
    } else {
      try { d = JSON.parse(localStorage.getItem(key)); } catch (e) {}
    }

    if (!d && typeof ECO_DISCUSS_LENS_KEY !== 'undefined') {
      try { d = JSON.parse(localStorage.getItem(ECO_DISCUSS_LENS_KEY)); } catch (e) {}
    }

    if (d) {
      if (elMsg) elMsg.value = d.message || '';
      if (elVoice) elVoice.value = d.voice || '';
      if (elFootprint) elFootprint.value = d.footprint || '';
      if (statusEl) {
        const n = [d.message, d.voice, d.footprint].filter(v => (v || '').trim().length >= 5).length;
        statusEl.textContent = `💾 Draf tersimpan lokal · ${n}/3 refleksi terisi`;
      }
    } else {
      if (elMsg) elMsg.value = '';
      if (elVoice) elVoice.value = '';
      if (elFootprint) elFootprint.value = '';
      if (statusEl) statusEl.textContent = '💾 Refleksi ecomedia tersimpan otomatis.';
    }
  }
}

/**
 * Mengirim data refleksi Ecomedia kelompok ke tabel 'ecomedia_discuss' di server
 */
async function kirimEcoDiscuss() {
  const group = currentKelompokDiscuss;
  if (!group || !group.id_kelompok) {
    notifyDiscussError('Silakan bentuk kelompok terlebih dahulu sebelum mengirim refleksi ecomedia.', 'Kelompok Belum Dibentuk');
    return;
  }

  const elMsg = document.getElementById('ecoDiscussMessage');
  const elVoice = document.getElementById('ecoDiscussVoice');
  const elFootprint = document.getElementById('ecoDiscussFootprint');
  const statusEl = document.getElementById('ecoDiscussStatus');
  const btn = document.getElementById('btnSubmitEcoDiscuss');

  const pesan = elMsg ? elMsg.value.trim() : '';
  const siapa = elVoice ? elVoice.value.trim() : '';
  const bahan_energi_limbah = elFootprint ? elFootprint.value.trim() : '';

  if (!pesan && !siapa && !bahan_energi_limbah) {
    notifyDiscussError('Silakan isi setidaknya salah satu lensa refleksi Ecomedia sebelum mengirim jawaban.', 'Refleksi Masih Kosong');
    if (elMsg) elMsg.focus();
    return;
  }

  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!api) {
    notifyDiscussError('Koneksi ke server tidak tersedia.', 'Koneksi Terputus');
    return;
  }

  if (typeof showLoading === 'function') {
    showLoading('Menyimpan Refleksi Ecomedia...', 'Mohon tunggu sebentar, data refleksi kelompok sedang dikirim ke server...');
  }
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ Mengirim...</span>';
  }

  const curMateri = discussAllMaterialV4 || 1;
  const idKelompok = group.id_kelompok;

  const payload = {
    id_kelompok: idKelompok,
    id_materi: curMateri,
    pesan: pesan,
    siapa: siapa,
    bahan_energi_limbah: bahan_energi_limbah,
    keterangan: ''
  };

  try {
    let existingRecord = null;
    try {
      const existing = await api.getWhere('ecomedia_discuss', { id_kelompok: idKelompok, id_materi: curMateri });
      const list = Array.isArray(existing) ? existing : (existing && Array.isArray(existing.data) ? existing.data : []);
      if (list && list.length > 0) {
        existingRecord = list[list.length - 1];
      }
    } catch (errCheck) {
      console.warn('[kirimEcoDiscuss] Cek data ecomedia_discuss:', errCheck);
    }

    if (existingRecord) {
      const pkField = existingRecord.id_ecomedia_discuss !== undefined
        ? 'id_ecomedia_discuss'
        : (existingRecord.id_discuss !== undefined ? 'id_discuss' : 'id');
      const pkVal = existingRecord[pkField] || existingRecord.id || existingRecord.id_ecomedia_discuss;
      await api.patch('ecomedia_discuss', pkField, pkVal, payload);
    } else {
      await api.post('ecomedia_discuss', payload);
    }

    saveEcoDiscussLens();

    if (statusEl) {
      const n = [pesan, siapa, bahan_energi_limbah].filter(v => v.length >= 5).length;
      statusEl.textContent = `✓ Refleksi ecomedia tersimpan di server (${n}/3 terisi)`;
    }

    if (typeof showLoadingSuccess === 'function') {
      notifyDiscussSuccess('Refleksi Ecomedia Berhasil Disimpan', 'Jawaban diskusi lensa ecomedia kelompokmu berhasil tersimpan di server.');

    } else if (typeof hideLoading === 'function') {
      hideLoading();
    }
  } catch (err) {
    console.error('[kirimEcoDiscuss] Gagal menyimpan refleksi ecomedia:', err);
    notifyDiscussError((err && err.message) ? err.message : 'Terjadi kendala saat menyimpan refleksi ecomedia ke server.', 'Gagal Mengirim Refleksi');
    if (typeof hideLoading === 'function') hideLoading();
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>🚀 Kirim Jawaban</span>';
    }
  }
}

function initRadecDiscuss() {
  if (!document.getElementById('discussAllMaterialTabs')) return;
  loadDiscussAllV4();

  const metaKey = typeof RADEC_DISCUSS_META_V4 !== 'undefined' ? RADEC_DISCUSS_META_V4 : 'ecoRadecDiscussMetaV4';
  const meta = (typeof store !== 'undefined' && store.read) ? store.read(metaKey, {}) : {};
  const group = document.getElementById('discussGroupNameAll');
  if (group && meta.group) group.value = meta.group;

  renderDiscussRoles();
  renderDiscussLenses();
  renderDiscussAllV4();
  if (typeof renderWonderDiscuss === 'function') renderWonderDiscuss();
  loadEcoDiscussData(discussAllMaterialV4, currentKelompokDiscuss);

  // Poin 2 & 3: Cek server tabel 'kelompok_discuss' WHERE id_siswa dan id_materi (default materi 1)
  checkOrCreateGroup(discussAllMaterialV4);
}

function saveDiscussMeta() {
  const metaKey = typeof RADEC_DISCUSS_META_V4 !== 'undefined' ? RADEC_DISCUSS_META_V4 : 'ecoRadecDiscussMetaV4';
  const data = {
    group: document.getElementById('discussGroupNameAll')?.value || '',
    updatedAt: new Date().toISOString()
  };
  if (typeof store !== 'undefined' && store.write) {
    store.write(metaKey, data);
  } else {
    try { localStorage.setItem(metaKey, JSON.stringify(data)); } catch (e) {}
  }
}

function showDiscussAllMaterial(m) {
  discussAllMaterialV4 = m;
  if (typeof window !== 'undefined') window.discussAllMaterialV4 = m;
  renderDiscussAllV4();
  setTimeout(() => {
    document.getElementById('discussAllMaterialTitle')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 40);

  // Poin 2 & 3 (Lazy Loading): Kueri kelompok & data pembahasan materi yang dipilih
  checkOrCreateGroup(m);
}

function getMaterialQuestions(m) {
  if (typeof getQuestionsByMaterial === 'function') return getQuestionsByMaterial(m);
  if (typeof window !== 'undefined' && typeof window.getQuestionsByMaterial === 'function') {
    return window.getQuestionsByMaterial(m);
  }
  const questions = (typeof window !== 'undefined' && window.ANSWER_ESSAY25) || [];
  return questions.map((q, i) => ({ ...q, idx: i })).filter(q => q.mat === Number(m));
}

function renderDiscussAllV4() {
  loadDiscussAllV4();
  const tabs = document.getElementById('discussAllMaterialTabs');
  const title = document.getElementById('discussAllMaterialTitle');
  const box = document.getElementById('discussAllAnswersContainer');
  if (!tabs || !box) return;

  const esc = (typeof store !== 'undefined' && store.escapeHtml) ? store.escapeHtml : (v => String(v || ''));
  const questions = window.ANSWER_ESSAY25 || [];

  tabs.innerHTML = [1, 2, 3, 4, 5].map(m => {
    const arr = getMaterialQuestions(m);
    const done = arr.filter(x => discussV4Text(x.idx).trim().length >= 5).length;
    return `<button type="button" class="discuss-mat-btn ${m === discussAllMaterialV4 ? 'active' : ''}" onclick="showDiscussAllMaterial(${m})">Materi ${m}<small>${done}/${arr.length} terisi</small></button>`;
  }).join('');

  const arr = getMaterialQuestions(discussAllMaterialV4);
  if (title && arr.length) {
    title.innerHTML = `<strong>📘 Materi ${discussAllMaterialV4} — ${esc(arr[0].topic)}</strong><br><span>Bahas ${arr.length} soal berikut dan tuliskan jawaban kelompok setelah mencapai kesepahaman.</span>`;
  }

  box.innerHTML = arr.map((x,i) => {
    const result = discussV4Text(x.idx);
    const done = result.trim().length >= 5;
    return `<article class="radec-all-answer-card ${done ? 'done' : ''}" id="discussAllCard-${x.idx}">
      <div class="radec-all-qhead">
        <span class="radec-all-qno">${i + 1}</span>
        <span class="radec-all-chip">Materi ${x.mat}</span>
      </div>
      <div class="radec-all-question">${esc(x.q)}</div>
      <label class="radec-result-label" for="discussResult-${x.idx}">💬 Jawaban setelah hasil diskusi kelompok</label>
      <textarea id="discussResult-${x.idx}" class="radec-result-textarea" placeholder="Tuliskan jawaban yang telah disepakati kelompok beserta alasan pentingnya..." oninput="handleDiscussInputLocal(${x.idx},this.value)" onchange="handleDiscussChangeSync(${x.idx},this.value)">${esc(result)}</textarea>
      <div class="radec-card-save">
        <span>💾 Tersimpan otomatis</span>
        <span class="${done ? 'ok' : ''}" id="discussSave-${x.idx}">${done ? '✓ Hasil diskusi terisi' : result.length + ' karakter'}</span>
      </div>
    </article>`;
  }).join('');

  updateDiscussAllProgress();
}

/**
 * Menyimpan jawaban secara lokal (memory + localStorage) dan memperbarui tampilan UI seketika
 * saat event oninput (tanpa memicu request jaringan ke server).
 */
function handleDiscussInputLocal(i, val) {
  const discussKey = typeof RADEC_DISCUSS_ALL_V4 !== 'undefined' ? RADEC_DISCUSS_ALL_V4 : 'ecoRadecDiscussAllAnswersV4';
  discussAllStateV4['q' + i] = { text: val, updatedAt: new Date().toISOString() };

  if (typeof store !== 'undefined' && store.write) {
    store.write(discussKey, discussAllStateV4);
  } else {
    try { localStorage.setItem(discussKey, JSON.stringify(discussAllStateV4)); } catch (e) {}
  }

  const ok = String(val).trim().length >= 5;
  document.getElementById('discussAllCard-' + i)?.classList.toggle('done', ok);
  const st = document.getElementById('discussSave-' + i);
  if (st) {
    st.textContent = ok ? '✓ Hasil diskusi terisi' : String(val).length + ' karakter';
    st.classList.toggle('ok', ok);
  }
  updateDiscussAllProgress(false);
}

/**
 * Memicu sinkronisasi ke server dengan jeda jitter acak (0 - 1000 ms) saat event onchange (keluar dari textarea).
 */
function handleDiscussChangeSync(i, val) {
  handleDiscussInputLocal(i, val);
  scheduleServerDiscussSync(i, val);
}

function saveDiscussAllAnswer(i, val) {
  handleDiscussInputLocal(i, val);
  handleDiscussChangeSync(i, val);
}

function updateDiscussAllProgress(refresh = true) {
  const n = discussV4Done();
  const questions = window.ANSWER_ESSAY25 || [];
  const totalQ = questions.length || 50;
  const t = document.getElementById('discussAllProgressText');
  const f = document.getElementById('discussAllProgressFill');
  const st = document.getElementById('discussAllStatus');

  if (t) t.textContent = n + ' dari ' + totalQ + ' selesai';
  if (f) f.style.width = (n / totalQ * 100) + '%';
  if (st) {
    st.textContent = n === totalQ
      ? `✅ Semua ${totalQ} hasil diskusi sudah terisi. Kamu siap menuju EXPLAIN.`
      : `Masih ada ${totalQ - n} jawaban hasil diskusi yang belum diisi.`;
  }

  if (refresh) {
    document.querySelectorAll('#discussAllMaterialTabs .discuss-mat-btn').forEach((b, k) => {
      const arr = getMaterialQuestions(k + 1);
      const d = arr.filter(x => discussV4Text(x.idx).trim().length >= 5).length;
      const sm = b.querySelector('small');
      if (sm) sm.textContent = d + '/' + arr.length + ' terisi';
    });
  }
}

function findIncompleteDiscussAnswer() {
  loadDiscussAllV4();
  const questions = window.ANSWER_ESSAY25 || [];
  const totalQ = questions.length || 50;
  const i = questions.findIndex((q, k) => discussV4Text(k).trim().length < 5);
  if (i < 0) {
    notifyDiscussSuccess('Semua Soal Sudah Dibahas', `Hebat! Semua ${totalQ} jawaban hasil diskusi kelompokmu sudah terisi lengkap.`);
    return;
  }
  discussAllMaterialV4 = (questions[i] && questions[i].mat) || 1;
  renderDiscussAllV4();
  setTimeout(() => {
    document.getElementById('discussAllCard-' + i)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 70);
}

function discussGoExplain() {
  if (typeof goStep === 'function') {
    goStep(3);
  }
}

/* ══════════════════════════════════════════════════
   WONDER-DISCUSS BRIDGE
   Menghubungkan pertanyaan siswa di tahap READ (tabel 'pertanyaan') ke tahap DISCUSS
══════════════════════════════════════════════════ */
const WONDER_SRC = 'ecoReadWonderQuestions';
const WONDER_DST = 'ecoRadecWonderDiscussRev2';
const WONDER_LABELS = {
  materi1: 'Materi 1 · Cuaca, Iklim, dan Musim',
  materi2: 'Materi 2 · Efek Rumah Kaca',
  materi3: 'Materi 3 · Penyebab',
  materi4: 'Materi 4 · Dampak',
  materi5: 'Materi 5 · Tindakan',
  'materi-1': 'Materi 1 · Cuaca, Iklim, dan Musim',
  'materi-2': 'Materi 2 · Efek Rumah Kaca',
  'materi-3': 'Materi 3 · Penyebab',
  'materi-4': 'Materi 4 · Dampak',
  'materi-5': 'Materi 5 · Tindakan',
  video: 'Video Ecomedia',
  ecomedia: 'Video Ecomedia',
  infografis: 'Infografis'
};

/**
 * Mengambil pertanyaan rasa ingin tahu (Wondering) dari tahap READ
 * dari server (tabel 'pertanyaan') dengan WHERE id_materi ("materi-" + ANSWER_ESSAY25.mat)
 * dan id_siswa dari setiap anggota kelompok.
 */
async function fetchWonderQuestionsFromDB(materi = discussAllMaterialV4, group = currentKelompokDiscuss) {
  const curMateri = materi || discussAllMaterialV4 || 1;
  const targetIdMateri = 'materi-' + curMateri;
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  let memberIds = [];
  if (group) {
    try {
      memberIds = typeof group.id_anggota === 'string' ? JSON.parse(group.id_anggota) : (group.id_anggota || []);
    } catch (e) {
      memberIds = [];
    }
    if (!Array.isArray(memberIds)) memberIds = [];
    if (group.id_siswa && !memberIds.includes(group.id_siswa)) {
      memberIds.push(group.id_siswa);
    }
  }

  const student = (typeof window !== 'undefined' && window.ecoStudent) || (typeof ecoStudent !== 'undefined' ? ecoStudent : {});
  if (memberIds.length === 0 && student.id_siswa) {
    memberIds = [student.id_siswa];
  }

  let serverList = [];
  if (api && typeof api.getWhere === 'function') {
    try {
      const res = await api.getWhere('pertanyaan', { id_materi: targetIdMateri });
      const raw = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
      // Filter pertanyaan milik anggota kelompok
      serverList = raw.filter(p => p && p.pertanyaan && String(p.pertanyaan).trim() && (memberIds.length === 0 || memberIds.includes(p.id_siswa)));
    } catch (err) {
      console.warn('[fetchWonderQuestionsFromDB] Gagal kueri tabel pertanyaan:', err);
    }

    // Jika filter berdasarkan id_materi tidak mengembalikan data, coba periksa per id_siswa anggota
    if (serverList.length === 0 && memberIds.length > 0) {
      for (const mId of memberIds) {
        try {
          const res = await api.getWhere('pertanyaan', { id_siswa: mId, id_materi: targetIdMateri });
          const raw = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
          raw.forEach(item => {
            if (item && item.pertanyaan && !serverList.some(s => (s.id_pertanyaan && s.id_pertanyaan === item.id_pertanyaan) || (s.id_siswa === item.id_siswa && s.pertanyaan === item.pertanyaan))) {
              serverList.push(item);
            }
          });
        } catch (e) {}
      }
    }
  }

  // Fallback ke penyimpanan lokal jika server kosong atau offline
  if (serverList.length === 0) {
    const localWonders = (typeof store !== 'undefined' && store.read) ? store.read(WONDER_SRC, {}) : {};
    const localVal = localWonders[targetIdMateri] || localWonders['materi' + curMateri];
    const text = typeof localVal === 'string' ? localVal : (localVal && (localVal.text || localVal.q || localVal.question));
    if (text && String(text).trim()) {
      serverList.push({
        id_pertanyaan: 'LOCAL-' + targetIdMateri,
        id_siswa: student.id_siswa || 'S-LOCAL',
        id_materi: targetIdMateri,
        pertanyaan: String(text).trim(),
        keterangan: ''
      });
    }
  }

  // Standarisasi: Beri prefix 'pertanyaan-[id]' pada id_soal SEBELUM data disatukan atau dipakai
  return serverList.map((item, idx) => {
    const rawId = item.id_pertanyaan !== undefined && item.id_pertanyaan !== null ? item.id_pertanyaan : (item.id || (idx + 1));
    const prefixedId = String(rawId).startsWith('pertanyaan-') ? String(rawId) : ('pertanyaan-' + rawId);
    return {
      ...item,
      id_pertanyaan: rawId,
      id_soal: prefixedId
    };
  });
}

/**
 * Merender daftar pertanyaan rasa ingin tahu dari tahap READ (tabel 'pertanyaan')
 * ke elemen #wonderDiscussList sebagai item-item mandiri, masing-masing dengan textarea
 * dan tombol "Kirim Jawaban" beserta status proses di sampingnya.
 */
async function renderWonderDiscuss(materi = discussAllMaterialV4, group = currentKelompokDiscuss) {
  const box = document.getElementById('wonderDiscussList');
  if (!box) return;

  const curMateri = materi || discussAllMaterialV4 || 1;
  const curGroup = group || currentKelompokDiscuss;
  const memberMap = getKelompokMemberMap(curGroup);
  const esc = (typeof store !== 'undefined' && store.escapeHtml) ? store.escapeHtml : (v => String(v || ''));
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  // Ambil pertanyaan dari tabel 'pertanyaan'
  const qs = await fetchWonderQuestionsFromDB(curMateri, curGroup);
  currentWonderQuestions = qs || [];
  box.innerHTML = '';

  if (!qs || qs.length === 0) {
    box.innerHTML = `<div class="wonder-discuss-empty">Belum ada pertanyaan dari tahap READ untuk Materi ${curMateri} dari anggota kelompokmu. Tuliskan pertanyaan rasa ingin tahu pada materi ini di tahap READ.</div>`;
    return;
  }

  // Ambil jawaban yang sudah pernah tersimpan di tabel 'discuss' untuk kelompok ini
  let existingDiscussMap = {};
  if (api && curGroup && curGroup.id_kelompok) {
    try {
      const resDiscuss = await api.getWhere('discuss', {
        id_kelompok: curGroup.id_kelompok,
        id_materi: curMateri
      });
      const dList = Array.isArray(resDiscuss) ? resDiscuss : (resDiscuss && Array.isArray(resDiscuss.data) ? resDiscuss.data : []);
      dList.forEach(d => {
        if (d.id_soal !== null && d.id_soal !== undefined) {
          existingDiscussMap[String(d.id_soal)] = d;
        }
      });
    } catch (err) {
      console.warn('[renderWonderDiscuss] Gagal memuat jawaban tersimpan discuss:', err);
    }
  }

  // Render per-item mandiri
  box.innerHTML = qs.map((q, idx) => {
    const idPertanyaan = q.id_soal || (String(q.id_pertanyaan).startsWith('pertanyaan-') ? String(q.id_pertanyaan) : ('pertanyaan-' + q.id_pertanyaan));
    const authorName = getNamaSiswaFromId(q.id_siswa, memberMap, curGroup);
    const savedRecord = existingDiscussMap[idPertanyaan];
    const savedText = (savedRecord && savedRecord.jawaban) || q.jawaban || '';
    const isSaved = !!(savedRecord && savedRecord.jawaban && savedRecord.jawaban.trim().length > 0);

    return `
      <div class="wonder-discuss-card" id="wonderCard-${idx}">
        <div class="wd-header">
          <span class="wd-source">Dibuat oleh : ${esc(authorName)}</span>
          <span class="radec-all-chip" style="background:#fef3c7;color:#92400e;">💡 Pertanyaan dari Anggota</span>
        </div>
        <div class="wd-question">${esc(q.pertanyaan)}</div>
        <label class="wd-label" for="wonderDiscussResult-${idx}">💬 Jawaban setelah hasil diskusi kelompok</label>
        <textarea 
          id="wonderDiscussResult-${idx}" 
          class="wonder-item-textarea" 
          placeholder="Tuliskan jawaban kesepakatan kelompok untuk pertanyaan ini..."
        >${esc(savedText)}</textarea>
        <div class="wonder-item-actions">
          <button 
            type="button" 
            class="btn-submit-wonder" 
            id="btnWonderSubmit-${idx}" 
            onclick="saveWonderDiscussItem(${idx})"
          >
            <span>🚀 Kirim Jawaban</span>
          </button>
          <span class="wonder-item-msg ${isSaved ? 'success' : ''}" id="wonderMsg-${idx}" role="status" aria-live="polite">
            ${isSaved ? '✓ Jawaban berhasil disimpan' : ''}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Menyimpan jawaban dari pertanyaan tambahan (tahap READ) ke tabel 'discuss'.
 * id_soal diberi prefix 'pertanyaan-' + id_pertanyaan agar tidak konflik dengan id_soal kurikulum asli,
 * dan from_answer bernilai true.
 */
async function saveWonderDiscussItem(idx) {
  if (!currentWonderQuestions || !currentWonderQuestions[idx]) return;
  const q = currentWonderQuestions[idx];
  const textarea = document.getElementById('wonderDiscussResult-' + idx);
  const text = textarea ? textarea.value.trim() : '';
  const msgEl = document.getElementById('wonderMsg-' + idx);
  const btn = document.getElementById('btnWonderSubmit-' + idx);

  if (!text) {
    if (msgEl) {
      msgEl.className = 'wonder-item-msg error';
      msgEl.textContent = '⚠️ Tuliskan jawaban kelompok terlebih dahulu.';
    }
    if (textarea) textarea.focus();
    return;
  }

  const group = currentKelompokDiscuss;
  if (!group || !group.id_kelompok) {
    if (msgEl) {
      msgEl.className = 'wonder-item-msg error';
      msgEl.textContent = '⚠️ Kelompok belum dibentuk. Silakan bentuk kelompok terlebih dahulu.';
    }
    return;
  }

  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!api) {
    if (msgEl) {
      msgEl.className = 'wonder-item-msg error';
      msgEl.textContent = '⚠️ API server tidak tersedia.';
    }
    return;
  }

  // Tampilkan indikator status proses pengiriman
  if (btn) btn.disabled = true;
  if (msgEl) {
    msgEl.className = 'wonder-item-msg loading';
    msgEl.textContent = 'Jawaban sedang dikirim';
  }

  const curMateri = discussAllMaterialV4 || 1;
  const idKelompok = group.id_kelompok;
  const idPertanyaan = q.id_soal || (String(q.id_pertanyaan).startsWith('pertanyaan-') ? String(q.id_pertanyaan) : ('pertanyaan-' + q.id_pertanyaan));
  const student = (typeof window !== 'undefined' && window.ecoStudent) || (typeof ecoStudent !== 'undefined' ? ecoStudent : {});
  const memberMap = getKelompokMemberMap(group);
  const authorName = getNamaSiswaFromId(q.id_siswa, memberMap, group);

  const payload = {
    id_kelompok: idKelompok,
    id_materi: curMateri,
    nama_kelompok: group.nama_kelompok || '',
    kelas: student.kelas || group.kelas || '',
    sekolah: student.school || group.sekolah || '',
    sumber: 'siswa',
    from_answer: true,
    id_soal: idPertanyaan,
    pertanyaan: q.pertanyaan,
    jawaban: text,
    keterangan: `Dibuat oleh : ${authorName}`
  };

  try {
    const existing = await api.getWhere('discuss', {
      id_kelompok: idKelompok,
      id_materi: curMateri,
      id_soal: idPertanyaan
    });
    const list = Array.isArray(existing) ? existing : (existing && Array.isArray(existing.data) ? existing.data : []);

    if (list.length > 0) {
      const idDiscuss = list[0].id_discuss || list[0].id;
      await api.patch('discuss', 'id_discuss', idDiscuss, {
        jawaban: text,
        id_soal: idPertanyaan,
        nama_kelompok: payload.nama_kelompok,
        kelas: payload.kelas,
        sekolah: payload.sekolah,
        from_answer: true
      });
      q.id_discuss = idDiscuss;
      q.jawaban = text;
    } else {
      const res = await api.post('discuss', payload);
      q.id_discuss = (res && (res.id || res.id_discuss)) || Date.now();
      q.jawaban = text;
    }

    if (msgEl) {
      msgEl.className = 'wonder-item-msg success';
      msgEl.textContent = 'Jawaban berhasil disimpan';
    }
  } catch (err) {
    console.error('[saveWonderDiscussItem] Gagal mengirim jawaban ke server:', err);
    if (msgEl) {
      msgEl.className = 'wonder-item-msg error';
      msgEl.textContent = 'Terjadi kesalahan saat menyimpan jawaban.';
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

function saveWonderDiscuss() {
  // Kompatibilitas mundur
}

function initWonderDiscussListener() {
  renderWonderDiscuss();
}

// ══════════════════════════════════════════════════════════
// INTEGRASI KELOMPOK DISCUSS (TABEL 'kelompok_discuss')
// ══════════════════════════════════════════════════════════

/**
 * Poin 2 & 3: Memeriksa apakah kelompok sudah ada untuk materi yang dibuka.
 * Jika belum ada, memunculkan modal bentukan kelompok.
 * Jika sudah ada, merender nama kelompok & nama anggota secara terpisah.
 */
async function checkOrCreateGroup(materi = discussAllMaterialV4) {
  const student = (typeof window !== 'undefined' && window.ecoStudent) ||
                  (typeof ecoStudent !== 'undefined' ? ecoStudent : {});
  const studentId = student.id_siswa ||
                    (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID')) || '';
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  if (!studentId || !api) {
    renderGroupDisplay(null);
    return null;
  }

  try {
    const criteria = { id_materi: materi };
    const curKelas = student.kelas || '';
    const curSekolah = student.school || student.sekolah || '';
    if (curKelas) criteria.kelas = curKelas;
    if (curSekolah) criteria.sekolah = curSekolah;

    const res = await api.getWhere('kelompok_discuss', criteria);
    const list = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);

    // Filter: cari kelompok di mana siswa menjadi pembuat atau terdaftar di id_anggota
    // Memastikan kelompok sesuai dengan kelas & sekolah siswa jika kolom tersebut terisi
    const myGroup = list.find(g => {
      if (g.kelas && curKelas && String(g.kelas).toUpperCase() !== String(curKelas).toUpperCase()) return false;
      if (g.sekolah && curSekolah && String(g.sekolah).toLowerCase() !== String(curSekolah).toLowerCase()) return false;

      if (g.id_siswa === studentId) return true;
      if (g.id_anggota) {
        try {
          const ids = typeof g.id_anggota === 'string' ? JSON.parse(g.id_anggota) : g.id_anggota;
          if (Array.isArray(ids) && ids.includes(studentId)) return true;
        } catch (e) {
          if (String(g.id_anggota).includes(studentId)) return true;
        }
      }
      return false;
    });

    if (myGroup) {
      setCurrentKelompokDiscuss(myGroup);
      renderGroupDisplay(myGroup);
      // Poin 4: Kueri tabel discuss & deduplikasi pertanyaan
      await loadDiscussDataForMaterial(materi, myGroup);
      return myGroup;
    } else {
      // Poin 3: Belum ada kelompok -> Tampilkan modal isi kelompok
      currentKelompokDiscuss = null;
      renderGroupDisplay(null);
      openModalKelompokDiscuss(false);
      return null;
    }
  } catch (err) {
    console.warn('[checkOrCreateGroup] Gagal memeriksa kelompok di server:', err);
    renderGroupDisplay(null);
    return null;
  }
}

/**
 * Merender informasi nama kelompok dan anggota secara terpisah di bagian atas halaman discuss.
 */
function renderGroupDisplay(group) {
  const titleEl = document.getElementById('discussGroupDisplayTitle');
  const membersEl = document.getElementById('discussGroupDisplayMembers');
  const inputHidden = document.getElementById('discussGroupNameAll');
  const btnEdit = document.getElementById('btnEditDiscussGroup');

  if (group && group.nama_kelompok) {
    if (titleEl) titleEl.textContent = group.nama_kelompok;
    if (membersEl) {
      const cleanMembers = String(group.nama_anggota || group.id_siswa || '-').replace(/\s*\(Kamu\)\s*/gi, '').trim();
      membersEl.textContent = cleanMembers || '-';
    }
    if (inputHidden) inputHidden.value = group.nama_kelompok;
    if (btnEdit) btnEdit.style.display = 'inline-block';
  } else {
    if (titleEl) titleEl.textContent = 'Belum dibentuk';
    if (membersEl) membersEl.textContent = 'Silakan bentuk kelompok terlebih dahulu.';
    if (inputHidden) inputHidden.value = '';
    if (btnEdit) btnEdit.style.display = 'inline-block';
  }

  // Render card pembagian tugas kelompok
  renderGroupRolesCard(group);
}

/* ══════════════════════════════════════════════════
   PEMBAGIAN PERAN (ROLES) KELOMPOK
   ══════════════════════════════════════════════════ */

/**
 * Mendapatkan daftar anggota kelompok dalam bentuk array objek: [{ id_siswa, nama }]
 */
function getGroupMemberList(group = currentKelompokDiscuss) {
  if (!group) return [];
  const memberMap = getKelompokMemberMap(group);
  let ids = [];
  try {
    ids = typeof group.id_anggota === 'string' ? JSON.parse(group.id_anggota) : (group.id_anggota || []);
  } catch (e) {
    ids = [];
  }
  if (!Array.isArray(ids)) ids = [];
  if (group.id_siswa && !ids.includes(group.id_siswa)) {
    ids.unshift(group.id_siswa);
  }
  return ids.map(id => ({
    id_siswa: id,
    nama: memberMap[id] || id
  }));
}

/**
 * Mengurai keterangan kelompok untuk mendapatkan peta peran siswa: { [id_siswa]: roleName }
 */
function parseGroupRoles(keterangan) {
  if (!keterangan) return {};
  if (typeof keterangan === 'object') return keterangan;
  try {
    const parsed = JSON.parse(keterangan);
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch (e) {
    return {};
  }
}

/**
 * Mendapatkan konfigurasi badge (ikon, label, class) untuk suatu peran
 */
function getRoleBadgeConfig(role) {
  const clean = String(role || '').trim();
  switch (clean) {
    case 'Ketua':
      return { icon: '👑', label: 'Ketua', className: 'role-tag-ketua' };
    case 'Notulis':
      return { icon: '✍️', label: 'Notulis', className: 'role-tag-notulis' };
    case 'Juru Bicara':
      return { icon: '📢', label: 'Juru Bicara', className: 'role-tag-juru-bicara' };
    case 'Penguji Gagasan':
      return { icon: '🔍', label: 'Penguji Gagasan', className: 'role-tag-penguji-gagasan' };
    case 'Anggota':
    case 'anggota':
      return { icon: '👤', label: 'Anggota', className: 'role-tag-anggota' };
    default:
      return { icon: '👤', label: clean || 'Anggota', className: 'role-tag-anggota' };
  }
}

/**
 * Merender card pembagian tugas di bawah identitas kelompok
 */
function renderGroupRolesCard(group = currentKelompokDiscuss) {
  const contentEl = document.getElementById('discussRolesContent');
  const btnManage = document.getElementById('btnManageRoles');
  if (!contentEl) return;

  const esc = (typeof store !== 'undefined' && store.escapeHtml) ? store.escapeHtml : (v => String(v || ''));

  if (!group || !group.id_kelompok) {
    contentEl.innerHTML = '<p class="drc-empty-text">Bentuk kelompok terlebih dahulu untuk mengatur pembagian tugas.</p>';
    if (btnManage) btnManage.disabled = true;
    return;
  }

  if (btnManage) btnManage.disabled = false;

  const members = getGroupMemberList(group);
  const roleMap = parseGroupRoles(group.keterangan);

  // Periksa apakah ada anggota yang sudah memiliki peran khusus selain 'anggota'
  const hasAssignedRoles = members.some(m => {
    const r = roleMap[m.id_siswa];
    return r && String(r).toLowerCase() !== 'anggota';
  });

  if (!hasAssignedRoles || members.length === 0) {
    contentEl.innerHTML = '<p class="drc-empty-text">Atur pembagian tugas (Opsional)</p>';
    return;
  }

  // Tampilkan chip anggota beserta perannya
  contentEl.innerHTML = `
    <div class="drc-roles-grid">
      ${members.map(m => {
        const r = roleMap[m.id_siswa] || 'Anggota';
        const cfg = getRoleBadgeConfig(r);
        return `
          <div class="drc-role-chip" title="${esc(m.nama)}: ${esc(cfg.label)}">
            <span class="drc-name">${esc(m.nama)}</span>
            <span class="drc-role-tag ${cfg.className}">${cfg.icon} ${esc(cfg.label)}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Membuka modal pengaturan pembagian tugas
 */
function openModalPembagianPeran() {
  const group = currentKelompokDiscuss;
  if (!group || !group.id_kelompok) {
    notifyDiscussError('Silakan bentuk kelompok terlebih dahulu sebelum mengatur pembagian tugas.', 'Kelompok Belum Dibentuk');
    return;
  }

  const modal = document.getElementById('modalPembagianPeran');
  const container = document.getElementById('rolesMemberListContainer');
  if (!modal || !container) return;

  const esc = (typeof store !== 'undefined' && store.escapeHtml) ? store.escapeHtml : (v => String(v || ''));
  const members = getGroupMemberList(group);
  const roleMap = parseGroupRoles(group.keterangan);

  if (members.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#64748b;padding:16px;">Tidak ada anggota dalam kelompok.</div>';
  } else {
    container.innerHTML = members.map(m => {
      const currentRole = roleMap[m.id_siswa] || 'anggota';
      return `
        <div class="role-assign-row">
          <div class="rar-name" title="${esc(m.nama)}">
            <span class="rar-name-text">${esc(m.nama)}</span>
          </div>
          <div class="rar-select-wrap">
            <select class="discuss-select role-select-input" data-student-id="${esc(m.id_siswa)}">
              <option value="anggota" ${currentRole.toLowerCase() === 'anggota' ? 'selected' : ''}>--Pilih--</option>
              <option value="Ketua" ${currentRole === 'Ketua' ? 'selected' : ''}>Ketua</option>
              <option value="Notulis" ${currentRole === 'Notulis' ? 'selected' : ''}>Notulis</option>
              <option value="Juru Bicara" ${currentRole === 'Juru Bicara' ? 'selected' : ''}>Juru Bicara</option>
              <option value="Penguji Gagasan" ${currentRole === 'Penguji Gagasan' ? 'selected' : ''}>Penguji Gagasan</option>
              <option value="Anggota" ${currentRole === 'Anggota' ? 'selected' : ''}>Anggota</option>
            </select>
          </div>
        </div>
      `;
    }).join('');
  }

  modal.style.display = 'flex';
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('discuss-modal-open');
}

/**
 * Menutup modal pengaturan pembagian tugas
 */
function closeModalPembagianPeran() {
  const modal = document.getElementById('modalPembagianPeran');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
  document.body.classList.remove('discuss-modal-open');
}

/**
 * Menyimpan data pembagian tugas ke tabel 'kelompok_discuss' pada field 'keterangan' (PATCH)
 */
async function savePembagianPeran() {
  if (!currentKelompokDiscuss || !currentKelompokDiscuss.id_kelompok) {
    notifyDiscussError('Data kelompok tidak ditemukan. Silakan bentuk kelompok terlebih dahulu.', 'Kelompok Belum Terdaftar');
    return;
  }

  const btn = document.getElementById('btnSaveRoles');
  const selects = document.querySelectorAll('#rolesMemberListContainer .role-select-input');
  const roleMap = {};

  selects.forEach(sel => {
    const sId = sel.getAttribute('data-student-id');
    if (sId) {
      roleMap[sId] = sel.value;
    }
  });

  const newKeterangan = JSON.stringify(roleMap);
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ Menyimpan Peran...</span>';
  }

  try {
    if (api && typeof api.patch === 'function') {
      await api.patch('kelompok_discuss', 'id_kelompok', currentKelompokDiscuss.id_kelompok, {
        keterangan: newKeterangan
      });
    }

    currentKelompokDiscuss.keterangan = newKeterangan;
    renderGroupRolesCard(currentKelompokDiscuss);
    closeModalPembagianPeran();
  } catch (err) {
    console.error('[savePembagianPeran] Gagal menyimpan peran kelompok:', err);
    notifyDiscussError((err && err.message) ? err.message : 'Gagal menyimpan pembagian tugas ke server. Silakan coba lagi.', 'Kendala Penyimpanan Peran');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>💾 Simpan Pembagian Peran</span>';
    }
  }
}

/**
 * Membuka modal informasi penjelasan peran
 */
function openModalInfoPeran() {
  const modal = document.getElementById('modalInfoPeran');
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('discuss-modal-open');
  }
}

/**
 * Menutup modal informasi penjelasan peran
 */
function closeModalInfoPeran() {
  const modal = document.getElementById('modalInfoPeran');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
  document.body.classList.remove('discuss-modal-open');
}

/**
 * Menyelesaikan nama anggota kelompok dari database siswa, profil, atau nama tersimpan.
 */
function resolveMemberName(id, rawSavedName, isCreator, student) {
  const cleanRaw = String(rawSavedName || '').replace(/\s*\(Kamu\)\s*/gi, '').trim();

  // 1. Jika ini akun siswa aktif sendiri
  if (student && student.id_siswa && id === student.id_siswa) {
    return student.name || cleanRaw || 'Kamu';
  }

  // 2. Cari di cache teman sekelas (nama resmi dari database 'siswa')
  if (Array.isArray(classmatesCache) && classmatesCache.length > 0) {
    const found = classmatesCache.find(c => c.id_siswa === id);
    if (found && (found.nama || found.name)) {
      return found.nama || found.name;
    }
  }

  // 3. Gunakan nama tersimpan jika valid dan bukan sekadar ID
  if (cleanRaw && cleanRaw !== id) {
    return cleanRaw;
  }

  // 4. Jika manual
  if (String(id).startsWith('MANUAL-')) {
    return cleanRaw || 'Teman Manual';
  }

  return cleanRaw || id;
}

/**
 * Memperbarui nama pada chip anggota dari cache siswa setelah data kelas selesai dimuat.
 */
function refreshSelectedMemberNamesFromCache() {
  if (!Array.isArray(classmatesCache) || classmatesCache.length === 0) return;
  let changed = false;
  selectedGroupMembers.forEach(m => {
    if (!m.isCreator && m.id_siswa && !m.id_siswa.startsWith('MANUAL-')) {
      const found = classmatesCache.find(c => c.id_siswa === m.id_siswa);
      if (found && (found.nama || found.name)) {
        const officialName = found.nama || found.name;
        if (m.nama === m.id_siswa || m.nama.startsWith('S-') || m.nama.startsWith('SISWA') || !m.nama) {
          m.nama = officialName;
          changed = true;
        }
        if (found.absen && !m.absen) {
          m.absen = found.absen;
          changed = true;
        }
      }
    }
  });
  if (changed) {
    renderSelectedMembersPills();
  }
}

/**
 * Membuka modal bentukan / ubah kelompok.
 */
function openModalKelompokDiscuss(isEdit = false) {
  isEditingKelompok = isEdit;
  const modal = document.getElementById('modalKelompokDiscuss');
  if (!modal) return;

  const titleEl = document.getElementById('modalKelompokTitle');
  const descEl = document.getElementById('modalKelompokDesc');
  const btnSubmit = document.getElementById('btnSubmitKelompok');
  const materiNo = document.getElementById('modalKelompokMateriNo');
  const searchClassInfo = document.getElementById('searchClassInfo');
  const inputNama = document.getElementById('inputNamaKelompok');

  const curMateri = discussAllMaterialV4 || 1;
  if (materiNo) materiNo.textContent = curMateri;

  const student = (typeof window !== 'undefined' && window.ecoStudent) || (typeof ecoStudent !== 'undefined' ? ecoStudent : {});
  if (searchClassInfo) searchClassInfo.textContent = `Kelas ${student.kelas || '-'}`;

  if (isEdit && currentKelompokDiscuss) {
    if (titleEl) titleEl.textContent = 'Ubah Anggota Kelompok';
    if (descEl) descEl.textContent = `Sesuaikan nama dan anggota Kelompok untuk Materi ${curMateri}.`;
    if (btnSubmit) btnSubmit.innerHTML = '<span>💾 Simpan Perubahan Anggota</span>';
    if (inputNama) inputNama.value = currentKelompokDiscuss.nama_kelompok || '';

    // Isi selectedGroupMembers dari data kelompok yang ada dengan pemetaan 1-ke-1 yang presisi
    let memberIds = [];
    try {
      memberIds = typeof currentKelompokDiscuss.id_anggota === 'string'
        ? JSON.parse(currentKelompokDiscuss.id_anggota)
        : (currentKelompokDiscuss.id_anggota || []);
    } catch (e) {
      memberIds = [];
    }

    const memberNames = (currentKelompokDiscuss.nama_anggota || '')
      .split(',')
      .map(s => s.trim().replace(/\s*\(Kamu\)\s*/gi, ''))
      .filter(Boolean);

    selectedGroupMembers = [];

    const creatorId = currentKelompokDiscuss.id_siswa;
    const isCreatorInMemberIds = memberIds.includes(creatorId);

    // 1. Tambahkan pembuat kelompok (Creator)
    let creatorRawName = '';
    if (isCreatorInMemberIds) {
      const creatorIdx = memberIds.indexOf(creatorId);
      creatorRawName = memberNames[creatorIdx] || '';
    } else {
      creatorRawName = memberNames[0] || '';
    }
    const creatorFinalName = resolveMemberName(creatorId, creatorRawName, true, student);

    selectedGroupMembers.push({
      id_siswa: creatorId,
      nama: creatorFinalName,
      absen: (creatorId === student.id_siswa ? student.absen : '') || '',
      isCreator: true
    });

    // 2. Tambahkan anggota lainnya secara presisi 1-ke-1
    memberIds.forEach((id, idx) => {
      if (id && id !== creatorId && !selectedGroupMembers.some(m => m.id_siswa === id)) {
        let rawName = '';
        if (isCreatorInMemberIds) {
          rawName = memberNames[idx] || '';
        } else {
          rawName = memberNames[idx + 1] || memberNames[idx] || '';
        }

        const finalName = resolveMemberName(id, rawName, false, student);
        const cachedStudent = Array.isArray(classmatesCache) ? classmatesCache.find(c => c.id_siswa === id) : null;

        selectedGroupMembers.push({
          id_siswa: id,
          nama: finalName,
          absen: (cachedStudent && cachedStudent.absen) || '',
          isCreator: false
        });
      }
    });
  } else {
    if (titleEl) titleEl.textContent = 'Bentuk Kelompok Diskusi';
    if (descEl) descEl.textContent = `Pilih teman sekelas untuk mendiskusikan Materi ${curMateri} bersama!`;
    if (btnSubmit) btnSubmit.innerHTML = '<span>🚀 Mulai Diskusi Kelompok</span>';
    if (inputNama) inputNama.value = '';

    const myName = student.name || 'Kamu';
    selectedGroupMembers = [
      { id_siswa: student.id_siswa || '', nama: myName, absen: student.absen || '', isCreator: true }
    ];
  }

  renderSelectedMembersPills();
  loadClassmates();

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');

  if (typeof document !== 'undefined' && document.body && document.body.classList) {
    document.body.classList.add('discuss-modal-open');
  }
}

function closeModalKelompokDiscuss() {
  const modal = document.getElementById('modalKelompokDiscuss');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }

  if (typeof document !== 'undefined' && document.body && document.body.classList) {
    document.body.classList.remove('discuss-modal-open');
  }
}

async function loadClassmates() {
  const container = document.getElementById('classmatesListContainer');
  if (!container) return;

  const student = (typeof window !== 'undefined' && window.ecoStudent) || (typeof ecoStudent !== 'undefined' ? ecoStudent : {});
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  if (!api || !student.kelas || !student.school) {
    container.innerHTML = '<div class="classmates-status-msg">Informasi kelas atau server belum lengkap. Gunakan penambahan manual jika diperlukan.</div>';
    return;
  }

  if (classmatesCache.length === 0) {
    container.innerHTML = '<div class="classmates-loading classmates-status-msg">⏳ Memuat daftar teman sekelas...</div>';
    try {
      const res = await api.getWhere('siswa', { kelas: student.kelas, sekolah: student.school });
      const list = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
      classmatesCache = list.filter(s => s.id_siswa !== student.id_siswa);
    } catch (e) {
      console.warn('[loadClassmates] Gagal memuat siswa sekelas:', e);
      container.innerHTML = '<div class="classmates-status-msg error">Gagal memuat teman sekelas. Tambahkan nama teman secara manual di bawah.</div>';
      return;
    }
  }

  renderClassmatesList(classmatesCache);
  refreshSelectedMemberNamesFromCache();
}

function renderClassmatesList(list) {
  const container = document.getElementById('classmatesListContainer');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '<div class="classmates-status-msg">Tidak ada teman sekelas yang cocok.</div>';
    return;
  }

  const esc = (typeof store !== 'undefined' && store.escapeHtml) ? store.escapeHtml : (v => String(v || ''));
  container.innerHTML = list.map(s => {
    const isSelected = selectedGroupMembers.some(m => m.id_siswa === s.id_siswa);
    const absenText = s.absen ? `No. ${s.absen}` : '';
    return `
      <div class="classmate-item ${isSelected ? 'selected' : ''}">
        <div class="classmate-info">
          ${absenText ? `<span class="classmate-absen">${esc(absenText)}</span>` : ''}
          <strong class="classmate-name">${esc(s.nama || s.name || s.id_siswa)}</strong>
        </div>
        <button type="button" class="btn-toggle-member ${isSelected ? 'active' : ''}" onclick="toggleMemberSelection('${esc(s.id_siswa)}')">
          ${isSelected ? '✓ Terpilih' : '+ Tambah'}
        </button>
      </div>
    `;
  }).join('');
}

function filterClassmatesList(term) {
  const q = String(term || '').toLowerCase().trim();
  if (!q) {
    renderClassmatesList(classmatesCache);
    return;
  }
  const filtered = classmatesCache.filter(s => {
    const name = String(s.nama || s.name || '').toLowerCase();
    const absen = String(s.absen || '').toLowerCase();
    return name.includes(q) || absen.includes(q);
  });
  renderClassmatesList(filtered);
}

function toggleMemberSelection(idSiswa) {
  const s = classmatesCache.find(x => x.id_siswa === idSiswa);
  const existingIdx = selectedGroupMembers.findIndex(m => m.id_siswa === idSiswa);

  if (existingIdx !== -1) {
    if (!selectedGroupMembers[existingIdx].isCreator) {
      selectedGroupMembers.splice(existingIdx, 1);
    }
  } else if (s) {
    selectedGroupMembers.push({
      id_siswa: s.id_siswa,
      nama: s.nama || s.name || s.id_siswa,
      absen: s.absen || '',
      isCreator: false
    });
  }

  renderSelectedMembersPills();
  const searchInput = document.getElementById('inputSearchClassmate');
  filterClassmatesList(searchInput ? searchInput.value : '');
}

function renderSelectedMembersPills() {
  const container = document.getElementById('selectedMembersChips');
  const countEl = document.getElementById('selectedMembersCount');
  if (!container) return;

  if (countEl) {
    countEl.textContent = `${selectedGroupMembers.length} terpilih`;
  }

  const esc = (typeof store !== 'undefined' && store.escapeHtml) ? store.escapeHtml : (v => String(v || ''));
  container.innerHTML = selectedGroupMembers.map((m, idx) => `
    <span class="member-chip ${m.isCreator ? 'creator' : ''}">
      <span>${m.isCreator ? '👑 ' : ''}${esc(m.nama)}</span>
      ${!m.isCreator ? `<button type="button" class="member-chip-remove" onclick="removeMemberByIndex(${idx})" aria-label="Hapus anggota">✕</button>` : ''}
    </span>
  `).join('');
}

function removeMemberByIndex(idx) {
  if (selectedGroupMembers[idx] && !selectedGroupMembers[idx].isCreator) {
    selectedGroupMembers.splice(idx, 1);
    renderSelectedMembersPills();
    const searchInput = document.getElementById('inputSearchClassmate');
    filterClassmatesList(searchInput ? searchInput.value : '');
  }
}

function toggleManualClassmateInput() {
  const form = document.getElementById('manualClassmateForm');
  if (form) {
    form.style.display = (form.style.display === 'none' || !form.style.display) ? 'flex' : 'none';
  }
}

function addManualClassmate() {
  const input = document.getElementById('inputManualName');
  const val = input ? input.value.trim() : '';
  if (!val) return;

  selectedGroupMembers.push({
    id_siswa: `MANUAL-${Date.now()}`,
    nama: val,
    absen: '',
    isCreator: false
  });

  input.value = '';
  toggleManualClassmateInput();
  renderSelectedMembersPills();
}

async function submitKelompokDiscuss() {
  const inputNama = document.getElementById('inputNamaKelompok');
  const namaKelompok = inputNama ? inputNama.value.trim() : '';

  if (namaKelompok.length < 3) {
    notifyDiscussError('Tuliskan nama kelompokmu minimal 3 karakter agar mudah dikenali teman sekelas.', 'Nama Kelompok Terlalu Pendek');
    if (inputNama) inputNama.focus();
    return;
  }

  const student = (typeof window !== 'undefined' && window.ecoStudent) || (typeof ecoStudent !== 'undefined' ? ecoStudent : {});
  const studentId = student.id_siswa || 'S-LOCAL';
  const curMateri = discussAllMaterialV4 || 1;
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  const idAnggotaArray = selectedGroupMembers.map(m => m.id_siswa).filter(Boolean);
  const namaAnggotaStr = selectedGroupMembers
    .map(m => String(m.nama || '').replace(/\s*\(Kamu\)\s*/gi, '').trim())
    .filter(Boolean)
    .join(', ');

  const payload = {
    id_siswa: studentId,
    id_materi: curMateri,
    nama_kelompok: namaKelompok,
    id_anggota: JSON.stringify(idAnggotaArray),
    nama_anggota: namaAnggotaStr,
    kelas: student.kelas || '',
    sekolah: student.school || ''
  };

  const btnSubmit = document.getElementById('btnSubmitKelompok');
  if (btnSubmit) btnSubmit.disabled = true;

  try {
    if (isEditingKelompok && currentKelompokDiscuss && currentKelompokDiscuss.id_kelompok) {
      if (api) {
        await api.patch('kelompok_discuss', 'id_kelompok', currentKelompokDiscuss.id_kelompok, payload);
      }
      setCurrentKelompokDiscuss({ ...currentKelompokDiscuss, ...payload });
    } else {
      if (api) {
        const res = await api.post('kelompok_discuss', payload);
        payload.id_kelompok = (res && (res.id || res.id_kelompok)) || Date.now();
      } else {
        payload.id_kelompok = Date.now();
      }
      setCurrentKelompokDiscuss(payload);
    }

    renderGroupDisplay(currentKelompokDiscuss);
    closeModalKelompokDiscuss();

    // Poin 4, 5, 6: Muat data discuss dan answer untuk materi ini
    await loadDiscussDataForMaterial(curMateri, currentKelompokDiscuss);
  } catch (err) {
    console.error('[submitKelompokDiscuss] Gagal menyimpan kelompok:', err);
    notifyDiscussError((err && err.message) ? err.message : 'Terjadi kendala saat menyimpan kelompok ke server. Silakan coba lagi.', 'Gagal Menyimpan Kelompok');
  } finally {
    if (btnSubmit) btnSubmit.disabled = false;
  }
}

// ══════════════════════════════════════════════════════════
// INTEGRASI DATA PEMBAHASAN & DEDUPLIKASI (TABEL 'discuss')
// ══════════════════════════════════════════════════════════

/**
 * 1. Membuat objek mapping id_siswa : nama_siswa dari anggota kelompok.
 * @param {Object} [group] - Objek kelompok (default: currentKelompokDiscuss)
 * @returns {Object.<string, string>} Objek { [id_siswa]: nama_siswa }
 */
function getKelompokMemberMap(group = currentKelompokDiscuss) {
  const memberMap = {};
  const student = (typeof window !== 'undefined' && window.ecoStudent) || (typeof ecoStudent !== 'undefined' ? ecoStudent : null);

  // 1. Masukkan data dari classmatesCache (tabel 'siswa' yang sudah dimuat)
  if (typeof classmatesCache !== 'undefined' && Array.isArray(classmatesCache)) {
    classmatesCache.forEach(c => {
      if (c && c.id_siswa) {
        const name = c.nama || c.name;
        if (name) memberMap[String(c.id_siswa).trim()] = String(name).trim();
      }
    });
  }

  // 2. Masukkan data dari selectedGroupMembers (anggota yang sedang aktif)
  if (typeof selectedGroupMembers !== 'undefined' && Array.isArray(selectedGroupMembers)) {
    selectedGroupMembers.forEach(m => {
      if (m && m.id_siswa && m.nama) {
        const clean = String(m.nama).replace(/\s*\(Kamu\)\s*/gi, '').trim();
        if (clean && clean !== m.id_siswa) {
          memberMap[String(m.id_siswa).trim()] = clean;
        }
      }
    });
  }

  // 3. Masukkan data dari objek group (tabel 'kelompok_discuss')
  if (group) {
    let ids = [];
    try {
      ids = typeof group.id_anggota === 'string' ? JSON.parse(group.id_anggota) : (group.id_anggota || []);
    } catch (e) {
      ids = [];
    }
    if (!Array.isArray(ids)) ids = [];

    let names = [];
    if (typeof group.nama_anggota === 'string') {
      names = group.nama_anggota.split(',').map(s => s.replace(/\s*\(Kamu\)\s*/gi, '').trim()).filter(Boolean);
    } else if (Array.isArray(group.nama_anggota)) {
      names = group.nama_anggota.map(s => String(s).replace(/\s*\(Kamu\)\s*/gi, '').trim()).filter(Boolean);
    }

    if (ids.length > 0) {
      ids.forEach((id, idx) => {
        const sId = String(id).trim();
        if (names[idx] && names[idx] !== sId) {
          memberMap[sId] = names[idx];
        } else if (!memberMap[sId]) {
          memberMap[sId] = sId;
        }
      });
    }

    if (group.id_siswa) {
      const creatorId = String(group.id_siswa).trim();
      if (!memberMap[creatorId]) {
        if (student && String(student.id_siswa).trim() === creatorId && student.name) {
          memberMap[creatorId] = student.name;
        } else if (names[0]) {
          memberMap[creatorId] = names[0];
        } else {
          memberMap[creatorId] = creatorId;
        }
      }
    }
  }

  // 4. Pastikan profil siswa saat ini selalu terpetakan dengan benar
  if (student && student.id_siswa && student.name) {
    memberMap[String(student.id_siswa).trim()] = student.name;
  }

  return memberMap;
}

/**
 * 2. Menghasilkan nama siswa (return nama_siswa) berdasarkan id_siswa.
 * @param {string|number} idSiswa - ID siswa yang dicari
 * @param {Object} [memberMap] - Map opsional { [id_siswa]: nama_siswa }
 * @param {Object} [group] - Objek kelompok opsional
 * @returns {string} nama_siswa
 */
function getNamaSiswaFromId(idSiswa, memberMap = null, group = currentKelompokDiscuss) {
  if (!idSiswa) return '';
  const sId = String(idSiswa).trim();

  // 1. Cek dari memberMap jika disediakan
  if (memberMap && typeof memberMap === 'object' && memberMap[sId]) {
    const val = String(memberMap[sId]).replace(/\s*\(Kamu\)\s*/gi, '').trim();
    if (val && val !== sId) return val;
  }

  // 2. Jika memberMap belum ada, bangun map dari kelompok
  if (!memberMap) {
    const map = getKelompokMemberMap(group);
    if (map && map[sId]) {
      const val = String(map[sId]).replace(/\s*\(Kamu\)\s*/gi, '').trim();
      if (val && val !== sId) return val;
    }
  }

  // 3. Cek dari profil siswa aktif (login)
  const student = (typeof window !== 'undefined' && window.ecoStudent) || (typeof ecoStudent !== 'undefined' ? ecoStudent : null);
  if (student && student.id_siswa && String(student.id_siswa).trim() === sId && student.name) {
    return student.name;
  }

  // 4. Cek dari classmatesCache
  if (typeof classmatesCache !== 'undefined' && Array.isArray(classmatesCache)) {
    const found = classmatesCache.find(c => String(c.id_siswa).trim() === sId);
    if (found && (found.nama || found.name)) {
      return found.nama || found.name;
    }
  }

  // 5. Cek dari selectedGroupMembers
  if (typeof selectedGroupMembers !== 'undefined' && Array.isArray(selectedGroupMembers)) {
    const found = selectedGroupMembers.find(m => String(m.id_siswa).trim() === sId);
    if (found && found.nama) {
      const val = String(found.nama).replace(/\s*\(Kamu\)\s*/gi, '').trim();
      if (val && val !== sId) return val;
    }
  }

  // 6. Fallback jika nama manual
  if (sId.startsWith('MANUAL-')) {
    return 'Teman Manual';
  }

  // 7. Jika tidak ditemukan nama di sumber mana pun, kembalikan ID
  return sId;
}

/**
 * Poin 4: Memuat data pembahasan materi dari tabel 'discuss'
 * dan menyinkronkan pertanyaan rasa ingin tahu (Wondering) dari tahap READ (tabel 'pertanyaan').
 */
async function loadDiscussDataForMaterial(materi = discussAllMaterialV4, group = currentKelompokDiscuss) {
  if (!group || !group.id_kelompok) return;
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!api) return;

  const idKelompok = group.id_kelompok;

  // 1. Ambil data tersimpan di tabel 'discuss' untuk kelompok dan materi ini
  let discussList = [];
  try {
    const resDiscuss = await api.getWhere('discuss', { id_kelompok: idKelompok, id_materi: materi });
    discussList = Array.isArray(resDiscuss) ? resDiscuss : (resDiscuss && Array.isArray(resDiscuss.data) ? resDiscuss.data : []);
  } catch (err) {
    console.warn('[loadDiscussDataForMaterial] Kueri tabel discuss:', err);
  }

  // Pasang jawaban soal asli kurikulum ke state dan tampilan kartu
  const materialQuestions = getMaterialQuestions(materi);

  discussList.forEach(item => {
    // Pastikan hanya soal kurikulum murni yang dipasang ke kartu 1..5 (bukan pertanyaan tambahan siswa)
    const isStudentQuestion = item.from_answer || item.sumber === 'siswa' || String(item.id_soal || '').startsWith('pertanyaan-');
    if (!isStudentQuestion && item.id_soal !== null && item.id_soal !== undefined) {
      const numSoal = Number(item.id_soal);
      if (!isNaN(numSoal) && numSoal > 0) {
        const qIdx = numSoal - 1;
        if (item.jawaban && qIdx >= 0 && qIdx < questions.length) {
          discussAllStateV4['q' + qIdx] = { text: item.jawaban, updatedAt: item.updated_at || new Date().toISOString() };
          const textarea = document.getElementById('discussResult-' + qIdx);
          if (textarea && textarea.value !== item.jawaban) {
            textarea.value = item.jawaban;
          }
          document.getElementById('discussAllCard-' + qIdx)?.classList.toggle('done', item.jawaban.trim().length >= 5);
        }
      }
    }
  });

  // Bersihkan badge lama jika ada
  materialQuestions.forEach(q => {
    const card = document.getElementById('discussAllCard-' + q.idx);
    if (card) {
      const existingBadge = card.querySelector('.discuss-flag-badge');
      if (existingBadge) existingBadge.remove();
    }
  });

  updateDiscussAllProgress();

  // Pastikan wadah pertanyaan dari answer disembunyikan
  const sec = document.getElementById('discussEmergentSection');
  if (sec) sec.style.display = 'none';

  // 2. Muat dan render pertanyaan dari tahap READ (tabel 'pertanyaan') milik anggota kelompok ke wonderDiscussList
  await renderWonderDiscuss(materi, group);

  // 3. Muat data refleksi ecomedia kelompok untuk materi ini dari tabel 'ecomedia_discuss'
  await loadEcoDiscussData(materi, group);
}

function renderEmergentQuestions(emergentList, materi, idKelompok) {
  const sec = document.getElementById('discussEmergentSection');
  if (sec) sec.style.display = 'none';
}

async function saveEmergentAnswer(emergentIndex, text) {
  // Pertanyaan tambahan dialihkan ke tahap READ (wonderDiscussList)
}

function scheduleServerDiscussSync(idx, text) {
  if (_discussSyncTimers[idx]) {
    clearTimeout(_discussSyncTimers[idx]);
  }
  // Jitter acak antara 0 - 1000 ms (0 s.d. 1 detik) alih-alih debounce tetap
  const jitterMs = Math.floor(Math.random() * 1000);
  _discussSyncTimers[idx] = setTimeout(async () => {
    delete _discussSyncTimers[idx];
    await syncSingleDiscussToServer(idx, text);
  }, jitterMs);
}

async function syncSingleDiscussToServer(idx, text) {
  if (!currentKelompokDiscuss || !currentKelompokDiscuss.id_kelompok) return;
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!api) return;

  const questions = window.ANSWER_ESSAY25 || [];
  const q = questions[idx];
  if (!q) return;

  const idSoal = q.id_soal !== undefined ? q.id_soal : (idx + 1);
  const idMateri = q.mat;
  const idKelompok = currentKelompokDiscuss.id_kelompok;

  const student = (typeof window !== 'undefined' && window.ecoStudent) || (typeof ecoStudent !== 'undefined' ? ecoStudent : {});
  const namaKelompok = currentKelompokDiscuss.nama_kelompok || '';
  const kelas = student.kelas || currentKelompokDiscuss.kelas || '';
  const sekolah = student.school || currentKelompokDiscuss.sekolah || '';

  try {
    const existing = await api.getWhere('discuss', {
      id_kelompok: idKelompok,
      id_materi: idMateri,
      id_soal: idSoal
    });
    const list = Array.isArray(existing) ? existing : (existing && Array.isArray(existing.data) ? existing.data : []);

    const payload = {
      id_kelompok: idKelompok,
      id_materi: idMateri,
      nama_kelompok: namaKelompok,
      kelas: kelas,
      sekolah: sekolah,
      sumber: 'esai',
      from_answer: 0,
      id_soal: idSoal,
      pertanyaan: q.q,
      jawaban: text,
      keterangan: ''
    };

    if (list.length > 0) {
      const idDiscuss = list[0].id_discuss || list[0].id;
      await api.patch('discuss', 'id_discuss', idDiscuss, {
        jawaban: text,
        nama_kelompok: namaKelompok,
        kelas: kelas,
        sekolah: sekolah
      });
    } else {
      await api.post('discuss', payload);
    }
  } catch (err) {
    console.warn(`[syncSingleDiscussToServer] Gagal sinkronisasi soal #${idx + 1}:`, err);
  }
}

// Global window exposure & listeners
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('modalKelompokDiscuss');
      if (modal && modal.classList.contains('active')) {
        closeModalKelompokDiscuss();
      }
    }
  });
}

if (typeof window !== 'undefined') {
  window.discussAllMaterialV4 = discussAllMaterialV4;
  window.discussAllStateV4 = discussAllStateV4;
  window.loadDiscussAllV4 = loadDiscussAllV4;
  window.discussV4Text = discussV4Text;
  window.discussV4Done = discussV4Done;
  window.initRadecDiscuss = initRadecDiscuss;
  window.saveDiscussMeta = saveDiscussMeta;
  window.showDiscussAllMaterial = showDiscussAllMaterial;
  window.renderDiscussAllV4 = renderDiscussAllV4;
  window.saveDiscussAllAnswer = saveDiscussAllAnswer;
  window.updateDiscussAllProgress = updateDiscussAllProgress;
  window.findIncompleteDiscussAnswer = findIncompleteDiscussAnswer;
  window.discussGoExplain = discussGoExplain;
  window.renderWonderDiscuss = renderWonderDiscuss;
  window.saveWonderDiscuss = saveWonderDiscuss;
  window.initWonderDiscussListener = initWonderDiscussListener;
  window.renderDiscussRoles = renderDiscussRoles;
  window.renderDiscussLenses = renderDiscussLenses;
  window.checkOrCreateGroup = checkOrCreateGroup;
  window.renderGroupDisplay = renderGroupDisplay;
  window.openModalKelompokDiscuss = openModalKelompokDiscuss;
  window.closeModalKelompokDiscuss = closeModalKelompokDiscuss;
  window.loadClassmates = loadClassmates;
  window.filterClassmatesList = filterClassmatesList;
  window.toggleMemberSelection = toggleMemberSelection;
  window.renderSelectedMembersPills = renderSelectedMembersPills;
  window.removeMemberByIndex = removeMemberByIndex;
  window.toggleManualClassmateInput = toggleManualClassmateInput;
  window.addManualClassmate = addManualClassmate;
  window.submitKelompokDiscuss = submitKelompokDiscuss;
  window.loadDiscussDataForMaterial = loadDiscussDataForMaterial;
  window.renderEmergentQuestions = renderEmergentQuestions;
  window.saveEmergentAnswer = saveEmergentAnswer;
  window.scheduleServerDiscussSync = scheduleServerDiscussSync;
  window.syncSingleDiscussToServer = syncSingleDiscussToServer;
  window.getDiscussAllMaterial = getDiscussAllMaterial;
  window.setDiscussAllMaterial = setDiscussAllMaterial;
  window.getCurrentKelompokDiscuss = getCurrentKelompokDiscuss;
  window.setCurrentKelompokDiscuss = setCurrentKelompokDiscuss;
  window.getSelectedGroupMembers = getSelectedGroupMembers;
  window.setSelectedGroupMembers = setSelectedGroupMembers;
  window.resolveMemberName = resolveMemberName;
  window.refreshSelectedMemberNamesFromCache = refreshSelectedMemberNamesFromCache;
  window.getKelompokMemberMap = getKelompokMemberMap;
  window.getNamaSiswaFromId = getNamaSiswaFromId;
  window.fetchWonderQuestionsFromDB = fetchWonderQuestionsFromDB;
  window.saveWonderDiscussItem = saveWonderDiscussItem;
  window.getCurrentWonderQuestions = getCurrentWonderQuestions;
  window.getDiscussEmergentQuestions = getDiscussEmergentQuestions;
  window.getClassmatesCache = getClassmatesCache;
  window.setClassmatesCache = setClassmatesCache;
  window.getGroupMemberList = getGroupMemberList;
  window.parseGroupRoles = parseGroupRoles;
  window.getRoleBadgeConfig = getRoleBadgeConfig;
  window.renderGroupRolesCard = renderGroupRolesCard;
  window.openModalPembagianPeran = openModalPembagianPeran;
  window.closeModalPembagianPeran = closeModalPembagianPeran;
  window.savePembagianPeran = savePembagianPeran;
  window.openModalInfoPeran = openModalInfoPeran;
  window.closeModalInfoPeran = closeModalInfoPeran;
}

if (typeof window !== 'undefined') {
  window.saveEcoDiscussLens = saveEcoDiscussLens;
  window.loadEcoDiscussData = loadEcoDiscussData;
  window.kirimEcoDiscuss = kirimEcoDiscuss;
  window.notifyDiscussSuccess = notifyDiscussSuccess;
  window.notifyDiscussError = notifyDiscussError;
  window.getCurrentDiscussGroupName = getCurrentDiscussGroupName;
  window.setCurrentDiscussGroupName = setCurrentDiscussGroupName;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    discussAllMaterialV4,
    discussAllStateV4,
    loadDiscussAllV4,
    discussV4Text,
    discussV4Done,
    initRadecDiscuss,
    saveDiscussMeta,
    showDiscussAllMaterial,
    renderDiscussAllV4,
    handleDiscussInputLocal,
    handleDiscussChangeSync,
    saveDiscussAllAnswer,
    updateDiscussAllProgress,
    findIncompleteDiscussAnswer,
    discussGoExplain,
    renderWonderDiscuss,
    saveWonderDiscuss,
    saveWonderDiscussItem,
    initWonderDiscussListener,
    renderDiscussRoles,
    renderDiscussLenses,
    checkOrCreateGroup,
    renderGroupDisplay,
    openModalKelompokDiscuss,
    closeModalKelompokDiscuss,
    loadClassmates,
    filterClassmatesList,
    toggleMemberSelection,
    renderSelectedMembersPills,
    removeMemberByIndex,
    toggleManualClassmateInput,
    addManualClassmate,
    submitKelompokDiscuss,
    loadDiscussDataForMaterial,
    renderEmergentQuestions,
    saveEmergentAnswer,
    scheduleServerDiscussSync,
    syncSingleDiscussToServer,
    getDiscussAllMaterial,
    setDiscussAllMaterial,
    getCurrentKelompokDiscuss,
    setCurrentKelompokDiscuss,
    getSelectedGroupMembers,
    setSelectedGroupMembers,
    resolveMemberName,
    refreshSelectedMemberNamesFromCache,
    getKelompokMemberMap,
    getNamaSiswaFromId,
    fetchWonderQuestionsFromDB,
    getCurrentWonderQuestions,
    getDiscussEmergentQuestions,
    getClassmatesCache,
    setClassmatesCache,
    getGroupMemberList,
    parseGroupRoles,
    getRoleBadgeConfig,
    renderGroupRolesCard,
    openModalPembagianPeran,
    closeModalPembagianPeran,
    savePembagianPeran,
    openModalInfoPeran,
    closeModalInfoPeran,
    notifyDiscussError,
    notifyDiscussSuccess,
    saveEcoDiscussLens,
    loadEcoDiscussData,
    kirimEcoDiscuss,
    getCurrentDiscussGroupName,
    setCurrentDiscussGroupName
  };
}

/**
 * EcoMedia RADEC - FINISH & EVALUATION Module (Tahap Evaluasi & Refleksi Ekoliterasi)
 * Mengelola skala penilaian diri 3 dimensi ekoliterasi (Tahu, Peduli, Bertindak),
 * pemberian medali penyelesaian, dan refleksi akhir pembelajaran.
 */

let finishEco = {};
let _lastEcoStudentId = '';

const DEFAULT_FINISH_LABELS = {
  tahu: ['Belum bisa', 'Sedikit', 'Bisa', 'Bisa mengajari'],
  peduli: ['Tidak juga', 'Sedikit', 'Cukup', 'Sangat'],
  aksi: ['Belum pernah', 'Kadang', 'Sering', 'Selalu']
};

const DEFAULT_FINISH_DIMS = {
  tahu: { nama: 'Aku tahu', kelas: 'dim-tahu', warna: '#1266AE' },
  peduli: { nama: 'Aku peduli', kelas: 'dim-peduli', warna: '#C4213C' },
  aksi: { nama: 'Aku bertindak', kelas: 'dim-aksi', warna: '#157F3D' }
};

function getEcoStudentId() {
  const st = (typeof window !== 'undefined' && window.ecoStudent) ||
             (typeof ecoStudent !== 'undefined' ? ecoStudent : {});
  return st.id_siswa || (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID')) || '';
}

function setEcoProfileStatus(tone, message) {
  const el = typeof document !== 'undefined' ? document.getElementById('ecoProfileStatus') : null;
  if (!el) return;
  el.textContent = message || '';
  el.className = `eco-profile-msg${tone ? ' ' + tone : ''}`;
}

function setFinishSaveActionStatus(tone, message) {
  const el = typeof document !== 'undefined' ? document.getElementById('finishSaveActionMsg') : null;
  if (!el) return;
  el.textContent = message || '';
  el.className = `finish-action-msg${tone ? ' ' + tone : ''}`;
}

function loadFinishEcoState() {
  const key = typeof FINISH_KEY !== 'undefined' ? FINISH_KEY : 'ecoRadecFinishReflectionV6';
  if (typeof store !== 'undefined' && store.read) {
    finishEco = store.read(key, {});
  } else {
    try {
      finishEco = JSON.parse(localStorage.getItem(key) || '{}') || {};
    } catch (e) {
      finishEco = {};
    }
  }
}

// Inisialisasi awal pembacaan state
loadFinishEcoState();

function selectEcoOption(itemIdx, levelVal, btnEl) {
  if (typeof document !== 'undefined') {
    const group = document.getElementById(`feo-${itemIdx}`);
    if (group && typeof group.querySelectorAll === 'function') {
      group.querySelectorAll('.eco-opt').forEach(x => x.setAttribute('aria-pressed', 'false'));
    }
    if (btnEl && typeof btnEl.setAttribute === 'function') {
      btnEl.setAttribute('aria-pressed', 'true');
    }
  }

  finishEco['e' + itemIdx] = +levelVal;
  if (typeof window !== 'undefined') window.finishEco = finishEco;
  setEcoProfileStatus('', '');

  const key = typeof FINISH_KEY !== 'undefined' ? FINISH_KEY : 'ecoRadecFinishReflectionV6';
  if (typeof store !== 'undefined' && store.write) {
    store.write(key, finishEco);
  } else {
    try { localStorage.setItem(key, JSON.stringify(finishEco)); } catch (e) {}
  }
}

function finishBuildEco() {
  const box = document.getElementById('ecoScale');
  if (!box) return;
  box.innerHTML = '';

  const ecoList = (typeof window !== 'undefined' && window.FINISH_ECO) || [];
  const labels = (typeof window !== 'undefined' && window.FINISH_LABEL) || DEFAULT_FINISH_LABELS;
  const dims = (typeof window !== 'undefined' && window.FINISH_DIM) || DEFAULT_FINISH_DIMS;
  const dimOrder = ['tahu', 'peduli', 'aksi'];

  dimOrder.forEach(dimKey => {
    const groupItems = ecoList
      .map((it, idx) => ({ ...it, idx }))
      .filter(it => it.d === dimKey);
    if (groupItems.length === 0) return;

    const groupEl = document.createElement('section');
    groupEl.className = 'eco-group';
    groupEl.setAttribute('data-eco-group', dimKey);

    const head = document.createElement('div');
    head.className = 'eco-group-head';
    head.innerHTML = `<span class="eco-dim ${dims[dimKey].kelas}">${dims[dimKey].nama}</span><span class="eco-group-count">${groupItems.length} pernyataan · 4 tingkat</span>`;
    groupEl.appendChild(head);

    groupItems.forEach((it) => {
      const d = document.createElement('div');
      d.className = 'eco-item';
      d.id = `ecoItem-${it.idx}`;
      const optButtons = labels[it.d].map((l, j) => {
        const isSelected = finishEco['e' + it.idx] == j + 1;
        return `<button type="button" class="eco-opt" data-fe="${it.idx}" data-v="${j + 1}" aria-pressed="${isSelected ? 'true' : 'false'}" onclick="selectEcoOption(${it.idx}, ${j + 1}, this)">${l}</button>`;
      }).join('');

      d.innerHTML = `<div class="eco-q">${it.q}</div><div class="eco-opts" id="feo-${it.idx}">${optButtons}</div>`;
      groupEl.appendChild(d);
    });

    box.appendChild(groupEl);
  });
}

function finishScores() {
  const sum = { tahu: 0, peduli: 0, aksi: 0 };
  const cnt = { tahu: 0, peduli: 0, aksi: 0 };
  const ecoList = (typeof window !== 'undefined' && window.FINISH_ECO) || [];

  ecoList.forEach((it, i) => {
    const v = finishEco['e' + i];
    if (v) {
      sum[it.d] += v;
      cnt[it.d]++;
    }
  });

  const out = {};
  ['tahu', 'peduli', 'aksi'].forEach(d => {
    out[d] = cnt[d] ? Math.round(((sum[d] / cnt[d]) - 1) / 3 * 100) : 0;
  });
  out.answered = ecoList.filter((_, i) => !!finishEco['e' + i]).length;
  out.total = ecoList.length;
  return out;
}

function buildEcoVerdictMessage(sc) {
  const gap = sc.peduli - sc.aksi;
  const hi = Math.max(sc.tahu, sc.peduli, sc.aksi);

  if (gap >= 25) {
    return '<strong>Kepedulianmu lebih besar daripada tindakanmu.</strong> Pilih satu kebiasaan kecil yang realistis dan jalankan secara konsisten. Aksi kecil yang dilakukan sungguh-sungguh lebih berarti daripada banyak rencana.';
  }
  if (sc.tahu - sc.peduli >= 25) {
    return '<strong>Pengetahuanmu sudah berkembang, tetapi perlu dibuat lebih dekat dengan kehidupanmu.</strong> Amati satu perubahan lingkungan di rumah, sekolah, atau gampong dan hubungkan dengan apa yang sudah kamu pelajari.';
  }
  if (hi >= 70 && sc.aksi >= 60) {
    return '<strong>Pengetahuan, kepedulian, dan tindakanmu berkembang kuat.</strong> Pertahankan satu aksi yang sudah dilakukan dan ajak seorang teman atau anggota keluarga melakukannya bersama.';
  }
  if (hi < 40) {
    return '<strong>Kamu sedang memulai perjalanan.</strong> Pilih satu tindakan yang paling mudah dilakukan minggu ini, catat buktinya, lalu refleksikan perubahan yang kamu lihat.';
  }
  return '<strong>Ketiga bagianmu berkembang cukup seimbang.</strong> Terus hubungkan apa yang kamu tahu dengan keputusan dan tindakan nyata dalam kehidupan sehari-hari.';
}

function buildEkoliterasiPayload(sc, verdictHtml) {
  const ecoList = (typeof window !== 'undefined' && window.FINISH_ECO) || [];
  const labels = (typeof window !== 'undefined' && window.FINISH_LABEL) || DEFAULT_FINISH_LABELS;
  const jawaban = {};
  const detail = ecoList.map((it, i) => {
    const level = Number(finishEco['e' + i] || 0);
    if (level) jawaban['e' + i] = level;
    return {
      index: i,
      dimensi: it.d,
      pertanyaan: it.q,
      level,
      label: level ? (labels[it.d][level - 1] || '') : ''
    };
  });

  const plainFeedback = String(verdictHtml || '').replace(/<[^>]+>/g, '').trim();
  return {
    jawaban,
    skor: {
      tahu: sc.tahu,
      peduli: sc.peduli,
      aksi: sc.aksi,
      answered: sc.answered,
      total: ecoList.length
    },
    detail,
    umpan_balik: plainFeedback,
    updated_at: new Date().toISOString()
  };
}

function renderEcoProfileChartAndVerdict(sc, verdictHtml, shouldScroll = true) {
  const dims = (typeof window !== 'undefined' && window.FINISH_DIM) || DEFAULT_FINISH_DIMS;
  const bars = document.getElementById('ecoBars');
  if (bars) {
    bars.innerHTML = ['tahu', 'peduli', 'aksi'].map(d =>
      `<div class="eco-bar-row"><span class="eco-bar-name">${dims[d].nama}</span><span class="eco-bar-track"><span class="eco-bar-fill" style="width:${sc[d]}%;background:${dims[d].warna}"></span></span><span class="eco-bar-val">${sc[d]}%</span></div>`
    ).join('');
  }

  const res = document.getElementById('ecoResult');
  if (res) {
    res.classList.add('show');
    if (shouldScroll && typeof res.scrollIntoView === 'function') {
      res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  const verdict = document.getElementById('ecoVerdict');
  if (verdict) verdict.innerHTML = verdictHtml;
}

function loadFinishEcoFromServer(recordsMap, activeMateri = 1, studentId = getEcoStudentId()) {
  if (studentId !== _lastEcoStudentId) {
    _lastEcoStudentId = studentId;
    finishEco = {};
    if (typeof window !== 'undefined') window.finishEco = finishEco;
    const resEl = typeof document !== 'undefined' ? document.getElementById('ecoResult') : null;
    if (resEl && resEl.classList) resEl.classList.remove('show');
    const barsEl = typeof document !== 'undefined' ? document.getElementById('ecoBars') : null;
    if (barsEl) barsEl.innerHTML = '';
    const verdEl = typeof document !== 'undefined' ? document.getElementById('ecoVerdict') : null;
    if (verdEl) verdEl.innerHTML = '';
    setEcoProfileStatus('', '');
    setFinishSaveActionStatus('', '');
    finishBuildEco();
  }

  if (!recordsMap || typeof recordsMap !== 'object') return false;

  // Opsi A: Prioritaskan baris sesuai tab materi aktif, lalu fallback ke baris materi lain milik siswa yang terisi
  const matKey = String(activeMateri || 1).trim();
  const primary = recordsMap[matKey];
  const candidate = (primary && primary.ekoliterasi_siswa && String(primary.ekoliterasi_siswa).trim())
    ? primary
    : Object.values(recordsMap).find(r => r && r.ekoliterasi_siswa && String(r.ekoliterasi_siswa).trim());

  if (!candidate) return false;

  let parsed = null;
  try {
    parsed = typeof candidate.ekoliterasi_siswa === 'string'
      ? JSON.parse(candidate.ekoliterasi_siswa)
      : candidate.ekoliterasi_siswa;
  } catch (e) {
    parsed = null;
  }
  if (!parsed || typeof parsed !== 'object') return false;

  if (parsed.jawaban && typeof parsed.jawaban === 'object') {
    finishEco = { ...parsed.jawaban };
    if (typeof window !== 'undefined') window.finishEco = finishEco;
  }

  finishBuildEco();

  const sc = finishScores();
  const ecoList = (typeof window !== 'undefined' && window.FINISH_ECO) || [];
  if (sc.answered >= ecoList.length && ecoList.length > 0) {
    const verdictMsg = buildEcoVerdictMessage(sc);
    renderEcoProfileChartAndVerdict(sc, verdictMsg, false);
    setEcoProfileStatus('ok', '✓ Profil ekoliterasi sudah disimpan');
  }
  return true;
}

async function finishShowProfile() {
  const ecoList = (typeof window !== 'undefined' && window.FINISH_ECO) || [];
  const sc = finishScores();

  if (sc.answered < ecoList.length) {
    const missingCount = ecoList.length - sc.answered;
    setEcoProfileStatus('warn', `⚠️ Masih ada ${missingCount} pernyataan yang belum kamu jawab.`);
    const firstMissing = ecoList.findIndex((_, i) => !finishEco['e' + i]);
    if (firstMissing >= 0 && typeof document !== 'undefined') {
      const targetItem = document.getElementById(`ecoItem-${firstMissing}`);
      if (targetItem && typeof targetItem.scrollIntoView === 'function') {
        targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    return { ok: false, reason: 'validation' };
  }

  const verdictMsg = buildEcoVerdictMessage(sc);
  renderEcoProfileChartAndVerdict(sc, verdictMsg, true);

  const upsertFn = (typeof upsertEvaluasiRefleksiSiswa === 'function')
    ? upsertEvaluasiRefleksiSiswa
    : ((typeof window !== 'undefined' && typeof window.upsertEvaluasiRefleksiSiswa === 'function') ? window.upsertEvaluasiRefleksiSiswa : null);
  const studentId = getEcoStudentId();

  if (!studentId || !upsertFn) {
    setEcoProfileStatus('ok', '✓ Profil ekoliterasi ditampilkan (masuk/login untuk menyimpan ke server).');
    return { ok: true, localOnly: true, skor: sc };
  }

  const activeMat = String(
    (typeof window !== 'undefined' && window.reportMaterialV4) ||
    (typeof reportMaterialV4 !== 'undefined' ? reportMaterialV4 : 1) ||
    1
  ).trim();
  const btn = document.getElementById('btnEco');
  const payload = buildEkoliterasiPayload(sc, verdictMsg);

  if (btn) btn.disabled = true;
  setEcoProfileStatus('info', '⏳ Jawaban sedang diproses...');

  try {
    await upsertFn({ ekoliterasi_siswa: JSON.stringify(payload) }, activeMat);
    setEcoProfileStatus('ok', '✓ Profil ekoliterasi sudah disimpan');
    return { ok: true, id_materi: activeMat, skor: sc, payload };
  } catch (error) {
    console.log(error);
    setEcoProfileStatus('error', 'Ada masalah, coba lagi');
    return { ok: false, error };
  } finally {
    if (btn) btn.disabled = false;
  }
}

function finishRenderMedals() {
  const box = document.getElementById('medals');
  if (!box) return;

  const completed = (typeof window !== 'undefined' && window.ecoCompleted)
    ? window.ecoCompleted
    : ((typeof ecoCompleted !== 'undefined' && ecoCompleted) ? ecoCompleted : new Set());
  const vals = [0, 1, 2, 3, 4].map(i => typeof completed.has === 'function' ? completed.has(i) : false);
  const icons = window.stepIcons || ['📖', '✏️', '💬', '🗣️', '🎨'];
  const names = window.stepLabels || ['READ', 'ANSWER', 'DISCUSS', 'EXPLAIN', 'CREATE'];

  box.innerHTML = names.slice(0, 5).map((n, i) =>
    `<div class="medal${vals[i] ? '' : ' dim'}"><span class="mi">${icons[i]}</span><div class="mn">${n}</div><div class="mv">${vals[i] ? '✓' : '—'}</div></div>`
  ).join('');
}

function finishInit() {
  finishBuildEco();
  finishRenderMedals();
  if (typeof renderLearningReport === 'function') renderLearningReport();

  const be = document.getElementById('btnEco');
  if (be && (!be.dataset || !be.dataset.bound)) {
    if (!be.dataset) be.dataset = {};
    be.dataset.bound = '1';
    be.addEventListener('click', finishShowProfile);
  }

  const bp = document.getElementById('btnPrintAll');
  if (bp && (!bp.dataset || !bp.dataset.bound)) {
    if (!bp.dataset) bp.dataset = {};
    bp.dataset.bound = '1';
    bp.addEventListener('click', () => {
      const printAllFn = (typeof finishPrintFullLearningReport === 'function')
        ? finishPrintFullLearningReport
        : ((typeof window !== 'undefined' && typeof window.finishPrintFullLearningReport === 'function') ? window.finishPrintFullLearningReport : null);
      if (printAllFn) {
        printAllFn();
      } else {
        setFinishSaveActionStatus('error', 'Ada masalah saat menyiapkan pembuat PDF, coba muat ulang halaman.');
      }
    });
  }

  const br = document.getElementById('btnRestart');
  if (br && (!br.dataset || !br.dataset.bound)) {
    if (!br.dataset) br.dataset = {};
    br.dataset.bound = '1';
    br.addEventListener('click', () => {
      setFinishSaveActionStatus('warn', 'Fungsi belum tersedia');
    });
  }

  const bc = document.getElementById('btnClear');
  if (bc && (!bc.dataset || !bc.dataset.bound)) {
    if (!bc.dataset) bc.dataset = {};
    bc.dataset.bound = '1';
    bc.addEventListener('click', () => {
      setFinishSaveActionStatus('warn', 'Fungsi belum tersedia');
    });
  }
}

function saveFinalReflection() {
  const data = {
    before: document.getElementById('reflectBefore')?.value.trim() || '',
    now: document.getElementById('reflectNow')?.value.trim() || '',
    decision: document.getElementById('reflectDecision')?.value.trim() || '',
    action: document.getElementById('reflectAction')?.value.trim() || ''
  };

  const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.finalReflection : 'ecoFinalReflection';
  if (typeof store !== 'undefined' && store.write) {
    store.write(key, data);
  } else {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
  }

  const m = document.getElementById('reflectionMsg');
  if (m) m.style.display = 'block';
}

function loadFinalReflection() {
  const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.finalReflection : 'ecoFinalReflection';
  let d = null;
  if (typeof store !== 'undefined' && store.read) {
    d = store.read(key, null);
  } else {
    try { d = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
  }
  if (!d) return;

  const mapping = [
    ['reflectBefore', 'before'],
    ['reflectNow', 'now'],
    ['reflectDecision', 'decision'],
    ['reflectAction', 'action']
  ];

  mapping.forEach(([id, k]) => {
    const el = document.getElementById(id);
    if (el) el.value = d[k] || '';
  });
}

// Global window exposure
if (typeof window !== 'undefined') {
  window.finishEco = finishEco;
  window.selectEcoOption = selectEcoOption;
  window.setEcoProfileStatus = setEcoProfileStatus;
  window.setFinishSaveActionStatus = setFinishSaveActionStatus;
  window.finishBuildEco = finishBuildEco;
  window.finishScores = finishScores;
  window.buildEcoVerdictMessage = buildEcoVerdictMessage;
  window.buildEkoliterasiPayload = buildEkoliterasiPayload;
  window.loadFinishEcoFromServer = loadFinishEcoFromServer;
  window.finishShowProfile = finishShowProfile;
  window.finishRenderMedals = finishRenderMedals;
  window.finishInit = finishInit;
  window.saveFinalReflection = saveFinalReflection;
  window.loadFinalReflection = loadFinalReflection;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    finishEco,
    selectEcoOption,
    setEcoProfileStatus,
    setFinishSaveActionStatus,
    loadFinishEcoState,
    finishBuildEco,
    finishScores,
    buildEcoVerdictMessage,
    buildEkoliterasiPayload,
    loadFinishEcoFromServer,
    finishShowProfile,
    finishRenderMedals,
    finishInit,
    saveFinalReflection,
    loadFinalReflection
  };
}

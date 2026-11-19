/**
 * EcoMedia RADEC - EXPLAIN Module (Tahap 4: Penjelasan & Umpan Balik Kelas)
 * Mengelola perbaikan 25 jawaban setelah penjelasan kelas dan refleksi media.
 */

let explainAllMaterialV4 = 1;
let explainAllStateV4 = {};

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

function initRadecExplain() {
  if (!document.getElementById('explainAllMaterialTabs')) return;
  if (typeof loadDiscussAllV4 === 'function') loadDiscussAllV4();
  loadExplainAllV4();
  renderExplainAllV4();
  loadExplainMeta();
}

function showExplainAllMaterial(m) {
  explainAllMaterialV4 = m;
  renderExplainAllV4();
  setTimeout(() => {
    document.getElementById('explainAllMaterialTitle')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 40);
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
    const arr = questions.map((q, i) => ({ ...q, idx: i })).filter(q => q.mat === m);
    const done = arr.filter(x => explainV4Text(x.idx).trim().length >= 5).length;
    return `<button type="button" class="exp-mat-btn ${m === explainAllMaterialV4 ? 'active' : ''}" onclick="showExplainAllMaterial(${m})">Materi ${m}<small>${done}/5 terisi</small></button>`;
  }).join('');

  const arr = questions.map((q, i) => ({ ...q, idx: i })).filter(q => q.mat === explainAllMaterialV4);
  if (title && arr.length) {
    title.innerHTML = `<strong>📗 Materi ${explainAllMaterialV4} — ${esc(arr[0].topic)}</strong><br><span>Tuliskan jawaban yang telah diperbaiki setelah penjelasan, klarifikasi, dan umpan balik kelas.</span>`;
  }

  box.innerHTML = arr.map(x => {
    const result = explainV4Text(x.idx);
    const done = result.trim().length >= 5;
    return `<article class="radec-all-answer-card explain ${done ? 'done' : ''}" id="explainAllCard-${x.idx}">
      <div class="radec-all-qhead">
        <span class="radec-all-qno">${x.idx + 1}</span>
        <span class="radec-all-chip">Materi ${x.mat}</span>
      </div>
      <div class="radec-all-question">${esc(x.q)}</div>
      <label class="radec-result-label" for="explainResult-${x.idx}">🗣️ Jawaban setelah EXPLAIN</label>
      <textarea id="explainResult-${x.idx}" class="radec-result-textarea" placeholder="Tuliskan jawaban yang sudah diperbaiki setelah penjelasan kelas, alasan, dan umpan balik..." oninput="saveExplainAllAnswer(${x.idx},this.value)">${esc(result)}</textarea>
      <div class="radec-card-save">
        <span>💾 Tersimpan otomatis</span>
        <span class="${done ? 'ok' : ''}" id="explainSave-${x.idx}">${done ? '✓ Hasil EXPLAIN terisi' : result.length + ' karakter'}</span>
      </div>
    </article>`;
  }).join('');

  updateExplainAllProgress();
}

function saveExplainAllAnswer(i, val) {
  const explainKey = typeof RADEC_EXPLAIN_ALL_V4 !== 'undefined' ? RADEC_EXPLAIN_ALL_V4 : 'ecoRadecExplainAllAnswersV4';
  explainAllStateV4['q' + i] = { text: val, updatedAt: new Date().toISOString() };

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

function updateExplainAllProgress(refresh = true) {
  const n = explainV4Done();
  const t = document.getElementById('explainAllProgressText');
  const f = document.getElementById('explainAllProgressFill');
  const st = document.getElementById('explainAllStatus');

  if (t) t.textContent = n + ' dari 25 selesai';
  if (f) f.style.width = (n / 25 * 100) + '%';
  if (st) {
    st.textContent = n === 25
      ? '✅ Semua 25 hasil EXPLAIN sudah terisi. Kamu siap menuju CREATE.'
      : `Masih ada ${25 - n} jawaban hasil EXPLAIN yang belum diisi.`;
  }

  if (refresh) {
    const questions = window.ANSWER_ESSAY25 || [];
    document.querySelectorAll('#explainAllMaterialTabs .exp-mat-btn').forEach((b, k) => {
      const arr = questions.map((q, i) => ({ ...q, idx: i })).filter(q => q.mat === k + 1);
      const d = arr.filter(x => explainV4Text(x.idx).trim().length >= 5).length;
      const sm = b.querySelector('small');
      if (sm) sm.textContent = d + '/5 terisi';
    });
  }
}

function findIncompleteExplainAnswer() {
  loadExplainAllV4();
  const questions = window.ANSWER_ESSAY25 || [];
  const i = questions.findIndex((q, k) => explainV4Text(k).trim().length < 5);
  if (i < 0) {
    alert('✅ Semua 25 jawaban hasil EXPLAIN sudah terisi.');
    return;
  }
  explainAllMaterialV4 = Math.floor(i / 5) + 1;
  renderExplainAllV4();
  setTimeout(() => {
    document.getElementById('explainAllCard-' + i)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 70);
}

function saveExplainMeta() {
  const metaKey = typeof RADEC_EXPLAIN_META_V4 !== 'undefined' ? RADEC_EXPLAIN_META_V4 : 'ecoRadecExplainMetaV4';
  const data = {
    ecomedia: document.getElementById('explainEcomediaReflectionAll')?.value || '',
    updatedAt: new Date().toISOString()
  };
  if (typeof store !== 'undefined' && store.write) {
    store.write(metaKey, data);
  } else {
    try { localStorage.setItem(metaKey, JSON.stringify(data)); } catch (e) {}
  }
}

function loadExplainMeta() {
  const metaKey = typeof RADEC_EXPLAIN_META_V4 !== 'undefined' ? RADEC_EXPLAIN_META_V4 : 'ecoRadecExplainMetaV4';
  const d = (typeof store !== 'undefined' && store.read) ? store.read(metaKey, {}) : {};
  const el = document.getElementById('explainEcomediaReflectionAll');
  if (el) el.value = d.ecomedia || '';
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
  window.loadExplainAllV4 = loadExplainAllV4;
  window.explainV4Text = explainV4Text;
  window.explainV4Done = explainV4Done;
  window.initRadecExplain = initRadecExplain;
  window.showExplainAllMaterial = showExplainAllMaterial;
  window.renderExplainAllV4 = renderExplainAllV4;
  window.saveExplainAllAnswer = saveExplainAllAnswer;
  window.updateExplainAllProgress = updateExplainAllProgress;
  window.findIncompleteExplainAnswer = findIncompleteExplainAnswer;
  window.saveExplainMeta = saveExplainMeta;
  window.loadExplainMeta = loadExplainMeta;
  window.explainGoCreate = explainGoCreate;
}

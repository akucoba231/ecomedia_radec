/**
 * EcoMedia RADEC - DISCUSS Module (Tahap 3: Diskusi Kelompok)
 * Mengelola pembahasan 25 soal bersama kelompok, perumusan kesepakatan jawaban,
 * serta jembatan pembahasan pertanyaan penasaran (Wondering).
 */

let discussAllMaterialV4 = 1;
let discussAllStateV4 = {};

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
  container.innerHTML = lenses.map(l => `
    <label><b>${l.title}</b><span>${l.prompt}</span><textarea id="${l.id}" class="disc-textarea" placeholder="${l.placeholder}" oninput="saveEcoDiscussLens()"></textarea></label>
  `).join('');
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
  if (typeof loadEcoDiscussLens === 'function') loadEcoDiscussLens();
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
  renderDiscussAllV4();
  setTimeout(() => {
    document.getElementById('discussAllMaterialTitle')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 40);
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
    const arr = questions.map((q, i) => ({ ...q, idx: i })).filter(q => q.mat === m);
    const done = arr.filter(x => discussV4Text(x.idx).trim().length >= 5).length;
    return `<button type="button" class="discuss-mat-btn ${m === discussAllMaterialV4 ? 'active' : ''}" onclick="showDiscussAllMaterial(${m})">Materi ${m}<small>${done}/5 terisi</small></button>`;
  }).join('');

  const arr = questions.map((q, i) => ({ ...q, idx: i })).filter(q => q.mat === discussAllMaterialV4);
  if (title && arr.length) {
    title.innerHTML = `<strong>📘 Materi ${discussAllMaterialV4} — ${esc(arr[0].topic)}</strong><br><span>Bahas kelima soal berikut dan tuliskan jawaban kelompok setelah mencapai kesepahaman.</span>`;
  }

  box.innerHTML = arr.map(x => {
    const result = discussV4Text(x.idx);
    const done = result.trim().length >= 5;
    return `<article class="radec-all-answer-card ${done ? 'done' : ''}" id="discussAllCard-${x.idx}">
      <div class="radec-all-qhead">
        <span class="radec-all-qno">${x.idx + 1}</span>
        <span class="radec-all-chip">Materi ${x.mat}</span>
      </div>
      <div class="radec-all-question">${esc(x.q)}</div>
      <label class="radec-result-label" for="discussResult-${x.idx}">💬 Jawaban setelah hasil diskusi kelompok</label>
      <textarea id="discussResult-${x.idx}" class="radec-result-textarea" placeholder="Tuliskan jawaban yang telah disepakati kelompok beserta alasan pentingnya..." oninput="saveDiscussAllAnswer(${x.idx},this.value)">${esc(result)}</textarea>
      <div class="radec-card-save">
        <span>💾 Tersimpan otomatis</span>
        <span class="${done ? 'ok' : ''}" id="discussSave-${x.idx}">${done ? '✓ Hasil diskusi terisi' : result.length + ' karakter'}</span>
      </div>
    </article>`;
  }).join('');

  updateDiscussAllProgress();
}

function saveDiscussAllAnswer(i, val) {
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

function updateDiscussAllProgress(refresh = true) {
  const n = discussV4Done();
  const t = document.getElementById('discussAllProgressText');
  const f = document.getElementById('discussAllProgressFill');
  const st = document.getElementById('discussAllStatus');

  if (t) t.textContent = n + ' dari 25 selesai';
  if (f) f.style.width = (n / 25 * 100) + '%';
  if (st) {
    st.textContent = n === 25
      ? '✅ Semua 25 hasil diskusi sudah terisi. Kamu siap menuju EXPLAIN.'
      : `Masih ada ${25 - n} jawaban hasil diskusi yang belum diisi.`;
  }

  if (refresh) {
    const questions = window.ANSWER_ESSAY25 || [];
    document.querySelectorAll('#discussAllMaterialTabs .discuss-mat-btn').forEach((b, k) => {
      const arr = questions.map((q, i) => ({ ...q, idx: i })).filter(q => q.mat === k + 1);
      const d = arr.filter(x => discussV4Text(x.idx).trim().length >= 5).length;
      const sm = b.querySelector('small');
      if (sm) sm.textContent = d + '/5 terisi';
    });
  }
}

function findIncompleteDiscussAnswer() {
  loadDiscussAllV4();
  const questions = window.ANSWER_ESSAY25 || [];
  const i = questions.findIndex((q, k) => discussV4Text(k).trim().length < 5);
  if (i < 0) {
    alert('✅ Semua 25 jawaban hasil diskusi sudah terisi.');
    return;
  }
  discussAllMaterialV4 = Math.floor(i / 5) + 1;
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
   Menghubungkan pertanyaan siswa di tahap READ ke tahap DISCUSS
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

function wonderQuestionsList() {
  const r = (typeof store !== 'undefined' && store.read) ? store.read(WONDER_SRC, {}) : {};
  const o = [];
  Object.keys(r).forEach(k => {
    const v = r[k];
    const t = typeof v === 'string' ? v : (v && (v.text || v.question || v.value || v.q)) || '';
    if (String(t).trim()) {
      o.push({ id: k, text: String(t).trim(), source: WONDER_LABELS[k] || k });
    }
  });
  return o;
}

function renderWonderDiscuss() {
  const box = document.getElementById('wonderDiscussList');
  if (!box) return;

  const st = (typeof store !== 'undefined' && store.read) ? store.read(WONDER_DST, {}) : {};
  const qs = wonderQuestionsList();
  box.innerHTML = '';

  if (!qs.length) {
    box.innerHTML = '<div class="wonder-discuss-empty">Belum ada pertanyaan dari READ. Kembali ke READ dan tuliskan minimal satu hal yang benar-benar membuatmu penasaran.</div>';
  } else {
    qs.forEach(q => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'wonder-discuss-item';
      b.setAttribute('aria-pressed', st.selectedId === q.id ? 'true' : 'false');
      b.innerHTML = '<span class="wd-source">' + q.source + '</span>' + q.text;
      b.onclick = () => {
        const x = (typeof store !== 'undefined' && store.read) ? store.read(WONDER_DST, {}) : {};
        x.selectedId = q.id;
        x.selectedText = q.text;
        x.selectedSource = q.source;
        if (typeof store !== 'undefined' && store.write) store.write(WONDER_DST, x);
        renderWonderDiscuss();
      };
      box.appendChild(b);
    });
  }

  const sel = document.getElementById('wonderDiscussSelectedText');
  if (sel) sel.textContent = st.selectedText || 'Belum ada pertanyaan yang dipilih.';

  const note = document.getElementById('wonderDiscussNote');
  if (note && document.activeElement !== note) {
    note.value = st.note || '';
  }
}

function saveWonderDiscuss() {
  const st = (typeof store !== 'undefined' && store.read) ? store.read(WONDER_DST, {}) : {};
  const note = document.getElementById('wonderDiscussNote');
  const msg = document.getElementById('wonder-discuss-msg');

  if (!st.selectedText) {
    if (msg) msg.textContent = 'Pilih satu pertanyaan dari READ terlebih dahulu.';
    return;
  }

  st.note = note ? note.value.trim() : '';
  if (typeof store !== 'undefined' && store.write) {
    store.write(WONDER_DST, st);
  }
  if (msg) {
    msg.textContent = st.note ? 'Hasil diskusimu sudah tersimpan.' : 'Pertanyaan pilihanmu sudah tersimpan.';
  }
}

function initWonderDiscussListener() {
  renderWonderDiscuss();
  const n = document.getElementById('wonderDiscussNote');
  if (n && (!n.dataset || !n.dataset.bound)) {
    if (!n.dataset) n.dataset = {};
    n.dataset.bound = '1';
    n.addEventListener('input', () => {
      const st = (typeof store !== 'undefined' && store.read) ? store.read(WONDER_DST, {}) : {};
      st.note = n.value;
      if (typeof store !== 'undefined' && store.write) store.write(WONDER_DST, st);
    });
  }
}

// Global window exposure
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
}

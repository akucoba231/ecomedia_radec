/**
 * EcoMedia RADEC - CREATE Module (Tahap 5: Kreasi & Aksi Nyata)
 * Mengelola pembuatan poster digital, ikrar lingkungan (pledge), berita mini, dan proyek aksi ekologis.
 */

let selectedEmoji = '🌍';
let selectedCatEmoji = '🌱';
let selectedAction = { emoji: '🌱', label: 'Aksi Lingkungan' };
let msgCount = 1;

/* ── STATE & KONFIGURASI BAGIAN A (SUMBER: keterampilan_read -> TUJUAN: ide_create) ── */
let createReadSelected = '';
let createReadIdeasList = [];
let createIdeRecordsMap = {};

/* ── STATE & KONFIGURASI BAGIAN B (KARYA ALTERNATIF -> TUJUAN: ide_create) ── */
// Mode 'upsert' untuk POST/PATCH (GET WHERE -> POST jika baru / PATCH by id_ide) | 'append' untuk selalu POST baru
let CREATE_PART_B_MODE = 'upsert';
let createPartBRecordsMap = {};

const CREATE_PART_B_MODES = ['poster', 'pledge', 'news', 'action'];
const CREATE_PART_B_LABELS = {
  poster: 'Poster Digital',
  pledge: 'Ikrar Lingkungan',
  news: 'Berita Eco Mini',
  action: 'Aksi Sahabat Bumi'
};
const CREATE_PART_B_UI_IDS = {
  poster: { statusId: 'createPosterStatus', btnId: 'saveCreatePosterBtn', onDark: true },
  pledge: { statusId: 'createPledgeStatus', btnId: 'saveCreatePledgeBtn', onDark: false },
  news: { statusId: 'createNewsStatus', btnId: 'saveCreateNewsBtn', onDark: false },
  action: { statusId: 'createActionStatus', btnId: 'saveCreateActionBtn', onDark: false }
};

function getCreatePartBSaveMode() {
  if (typeof window !== 'undefined' && (window.CREATE_PART_B_SAVE_MODE === 'append' || window.CREATE_PART_B_SAVE_MODE === 'upsert')) {
    return window.CREATE_PART_B_SAVE_MODE;
  }
  return CREATE_PART_B_MODE;
}

function setCreatePartBSaveMode(mode) {
  const next = String(mode || '').trim().toLowerCase() === 'append' ? 'append' : 'upsert';
  CREATE_PART_B_MODE = next;
  if (typeof window !== 'undefined') {
    window.CREATE_PART_B_SAVE_MODE = next;
  }
  return next;
}

function toggleCreatePartBSaveMode() {
  return setCreatePartBSaveMode(getCreatePartBSaveMode() === 'upsert' ? 'append' : 'upsert');
}

function isCreatePartBRow(item) {
  if (!item) return false;
  const ket = item.id_keterampilan;
  const emptyKet = ket === null || ket === undefined || String(ket).trim() === '' || Number(ket) <= 0;
  return emptyKet && CREATE_PART_B_MODES.includes(String(item.id_materi || '').trim());
}

function isCreateRowOwnedByStudent(item, studentId) {
  if (!item) return false;
  const target = String(studentId || '').trim();
  if (!target) return true;
  return String(item.id_siswa || '').trim() === target;
}

function getCreateDefaultIdentityLabel() {
  const st = (typeof window !== 'undefined' && window.ecoStudent) ||
             (typeof ecoStudent !== 'undefined' ? ecoStudent : {});
  const name = st.nama || st.name || '';
  if (!name) return '';
  return [name, st.kelas || '', st.absen ? `No. ${st.absen}` : ''].filter(Boolean).join(' · ');
}

const CREATE_TOPIC_LABELS_FALLBACK = {
  'materi-1': 'Cuaca, Iklim, dan Musim',
  'materi-2': 'Atmosfer, Efek Rumah Kaca, dan Pemanasan Global',
  'materi-3': 'Penyebab Perubahan Iklim',
  'materi-4': 'Dampak Perubahan Iklim',
  'materi-5': 'Tindakan Ramah Lingkungan'
};

const CREATE_IDEA_FORMATS_FALLBACK = {
  poster: 'Poster Digital',
  pledge: 'Ikrar Lingkungan',
  news: 'Berita Eco Mini',
  action: 'Aksi Sahabat Bumi'
};

function normalizeCreateMateriId(rawKey) {
  if (typeof resolveReadMateriId === 'function') {
    return resolveReadMateriId(rawKey);
  }
  const k = String(rawKey || '').trim();
  if (k.startsWith('materi') && !k.includes('-')) {
    return k.replace('materi', 'materi-');
  }
  return k;
}

function extractCreateMateriNum(idMateri) {
  const m = String(idMateri || '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 99;
}

function getCreateStudentProfile() {
  const student = (typeof window !== 'undefined' && window.ecoStudent) ||
                  (typeof ecoStudent !== 'undefined' ? ecoStudent : {});
  return {
    id_siswa: student.id_siswa ||
              (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID')) || '',
    nama: student.nama || student.name ||
          (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentName')) || '',
    kelas: student.kelas ||
           (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentClass')) || '',
    school: student.school ||
            (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentSchool')) || ''
  };
}

function getCreateTopicLabels() {
  return (typeof window !== 'undefined' && window.READ_IDEA_TOPIC_LABELS) ||
         (typeof READ_IDEA_TOPIC_LABELS !== 'undefined' ? READ_IDEA_TOPIC_LABELS : CREATE_TOPIC_LABELS_FALLBACK);
}

function getCreateIdeaFormats() {
  return (typeof window !== 'undefined' && window.READ_IDEA_FALLBACKS) ||
         (typeof READ_IDEA_FALLBACKS !== 'undefined' ? READ_IDEA_FALLBACKS : CREATE_IDEA_FORMATS_FALLBACK);
}

function getSelectedReadIdeaRow(materiKey = createReadSelected) {
  if (!materiKey) return null;
  const norm = normalizeCreateMateriId(materiKey);
  return createReadIdeasList.find(r => r._materiKey === norm || String(r.id_keterampilan) === String(materiKey)) || null;
}

function createCreativeIdeaTouch() {
  const msg = document.getElementById('createCreativeIdeaStatus');
  if (msg) {
    msg.textContent = '';
    msg.className = 'create-idea-msg';
  }
}

function refreshCreateIdeaChoices() {
  const sel = document.getElementById('createReadIdeaSelect');
  if (!sel) return;

  const topicLabels = getCreateTopicLabels();
  const options = [{
    id: '',
    label: createReadIdeasList.length > 0
      ? '— Pilih satu ide yang telah kamu tulis pada READ —'
      : '— Belum ada ide kreatif dari tahap READ —'
  }];

  createReadIdeasList.forEach(row => {
    const matKey = row._materiKey;
    const num = extractCreateMateriNum(matKey);
    const intro = String(row.pernyataan || '').replace(/\s+/g, ' ').trim();
    const shortIntro = intro.length > 60 ? intro.slice(0, 60) + '…' : intro;
    const hasSavedPlan = !!createIdeRecordsMap[String(row.id_keterampilan)];
    const prefix = num < 99 ? `Materi ${num}` : matKey;
    const topicPart = topicLabels[matKey] ? ` · ${topicLabels[matKey]}` : '';
    options.push({
      id: matKey,
      label: `${prefix}${topicPart} — ${shortIntro}${hasSavedPlan ? ' ✓' : ''}`
    });
  });

  if (typeof sel.replaceChildren === 'function') {
    const nodes = options.map(opt => {
      const el = document.createElement('option');
      el.value = opt.id;
      el.textContent = opt.label;
      return el;
    });
    sel.replaceChildren(...nodes);
  } else {
    sel.innerHTML = '';
    options.forEach(opt => {
      const el = document.createElement('option');
      el.value = opt.id;
      el.textContent = opt.label;
      if (typeof sel.appendChild === 'function') sel.appendChild(el);
    });
  }

  const normalizedSelected = normalizeCreateMateriId(createReadSelected);
  const exists = createReadIdeasList.some(r => r._materiKey === normalizedSelected);
  createReadSelected = exists ? normalizedSelected : '';
  sel.value = createReadSelected;

  updateCreateIdeaPresentation();
}

function updateCreateIdeaPresentation() {
  const preview = document.getElementById('createReadIdeaPreview');
  const area = document.getElementById('createCreativeIdea');
  const button = document.getElementById('saveCreateCreativeIdeaButton');
  const msg = document.getElementById('createCreativeIdeaStatus');
  if (!preview || !area || !button) return;

  const selectedRow = getSelectedReadIdeaRow(createReadSelected);
  const topicLabels = getCreateTopicLabels();

  if (!selectedRow) {
    preview.textContent = createReadIdeasList.length > 0
      ? 'Belum ada ide yang dipilih. Pilih salah satu ide pada daftar di atas untuk mulai menyusun langkah perwujudannya.'
      : 'Belum ada ide yang dipilih. Isilah kolom ide di akhir bacaan READ, kemudian pilih idemu di sini.';
    preview.classList.add('placeholder');
    area.value = '';
    area.disabled = true;
    button.disabled = true;
    if (msg) {
      msg.textContent = '';
      msg.className = 'create-idea-msg';
    }
    return;
  }

  const matKey = selectedRow._materiKey;
  preview.classList.remove('placeholder');
  preview.textContent = 'IDE DARI ' + (topicLabels[matKey] || 'READ') + '\n\n' + selectedRow.pernyataan;
  area.disabled = false;
  button.disabled = false;

  const existingPlan = createIdeRecordsMap[String(selectedRow.id_keterampilan)];
  if (existingPlan && typeof existingPlan.keterangan === 'string') {
    area.value = existingPlan.keterangan;
    if (msg) {
      msg.className = existingPlan.keterangan.trim() ? 'create-idea-msg ok' : 'create-idea-msg';
      msg.textContent = existingPlan.keterangan.trim() ? '✓ Jawaban sudah disimpan' : '';
    }
  } else {
    area.value = '';
    if (msg) {
      msg.textContent = '';
      msg.className = 'create-idea-msg';
    }
  }
}

function selectReadIdeaForCreate(material) {
  createReadSelected = material ? normalizeCreateMateriId(material) : '';
  updateCreateIdeaPresentation();

  const row = getSelectedReadIdeaRow(createReadSelected);
  if (!row || !row.pernyataan) return;

  // Persiapan jembatan ke Bagian B: bila ide bantuan READ memilih format karya tertentu, aktifkan tabnya.
  const ideaLower = String(row.pernyataan).toLowerCase();
  const formats = getCreateIdeaFormats();
  const chosenFormat = Object.entries(formats).find(([, title]) =>
    ideaLower.startsWith(('aku ingin membuat ' + title).toLowerCase())
  );
  if (chosenFormat && typeof document !== 'undefined' && document.querySelectorAll) {
    const mode = chosenFormat[0];
    const btns = [...document.querySelectorAll('.create-tab-btn')];
    const btn = btns.find(b => b.getAttribute && b.getAttribute('onclick')?.includes("'" + mode + "'"));
    if (btn) switchCreate(mode, btn);
  }
}

/**
 * Mengambil seluruh ide kreatif siswa dari server (keterampilan_read)
 * dan rencana perwujudan tersimpan (ide_create) untuk mengisi dropdown Bagian A.
 */
async function loadCreateCreativeIdea() {
  const student = getCreateStudentProfile();
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  if (!student.id_siswa || !api || typeof api.getWhere !== 'function') {
    createReadIdeasList = [];
    createIdeRecordsMap = {};
    createPartBRecordsMap = {};
    createReadSelected = '';
    refreshCreateIdeaChoices();
    if (typeof restoreCreatePartBFromServer === 'function') {
      restoreCreatePartBFromServer();
    }
    return;
  }

  try {
    const [readRes, ideRes] = await Promise.allSettled([
      api.getWhere('keterampilan_read', { id_siswa: student.id_siswa }),
      api.getWhere('ide_create', { id_siswa: student.id_siswa })
    ]);

    if (readRes.status === 'fulfilled') {
      const rawRead = readRes.value;
      const list = Array.isArray(rawRead) ? rawRead : (rawRead && Array.isArray(rawRead.data) ? rawRead.data : []);
      const dedupByMateri = new Map();

      list.forEach(item => {
        if (!item || !isCreateRowOwnedByStudent(item, student.id_siswa) || !item.id_materi || !String(item.pernyataan || '').trim()) return;
        const normKey = normalizeCreateMateriId(item.id_materi);
        dedupByMateri.set(normKey, {
          ...item,
          _materiKey: normKey
        });
      });

      createReadIdeasList = [...dedupByMateri.values()].sort(
        (a, b) => extractCreateMateriNum(a._materiKey) - extractCreateMateriNum(b._materiKey)
      );
    } else {
      console.log(readRes.reason);
    }

    if (ideRes.status === 'fulfilled') {
      const rawIde = ideRes.value;
      const list = Array.isArray(rawIde) ? rawIde : (rawIde && Array.isArray(rawIde.data) ? rawIde.data : []);
      const nextMap = {};
      const nextPartBMap = {};

      list.forEach(item => {
        if (!item || !isCreateRowOwnedByStudent(item, student.id_siswa)) return;
        const hasKeterampilan = item.id_keterampilan !== null &&
                                item.id_keterampilan !== undefined &&
                                String(item.id_keterampilan).trim() !== '' &&
                                Number(item.id_keterampilan) > 0;
        if (hasKeterampilan) {
          nextMap[String(item.id_keterampilan)] = item;
        } else if (isCreatePartBRow(item)) {
          const mode = String(item.id_materi).trim();
          const prev = nextPartBMap[mode];
          const currId = Number(item.id_ide || item.id || 0);
          const prevId = prev ? Number(prev.id_ide || prev.id || 0) : -1;
          if (!prev || currId >= prevId) {
            nextPartBMap[mode] = item;
          }
        }
      });

      createIdeRecordsMap = nextMap;
      createPartBRecordsMap = nextPartBMap;
    } else {
      console.log(ideRes.reason);
    }
  } catch (error) {
    console.log(error);
  }

  refreshCreateIdeaChoices();
  if (typeof restoreCreatePartBFromServer === 'function') {
    restoreCreatePartBFromServer();
  }
}

/**
 * Menyimpan rencana perwujudan ide kreatif siswa (Bagian A) ke server (tabel 'ide_create').
 * Alur: GET WHERE { id_siswa, id_keterampilan } -> POST jika baru, PATCH by id_ide jika sudah ada.
 */
async function saveCreateCreativeIdea() {
  const area = document.getElementById('createCreativeIdea');
  const msg = document.getElementById('createCreativeIdeaStatus');
  const button = document.getElementById('saveCreateCreativeIdeaButton');
  const selectedRow = getSelectedReadIdeaRow(createReadSelected);

  if (!area || !selectedRow || selectedRow.id_keterampilan === undefined || selectedRow.id_keterampilan === null || String(selectedRow.id_keterampilan).trim() === '') {
    if (msg) {
      msg.className = 'create-idea-msg warn';
      msg.textContent = 'Pilih salah satu ide dari READ terlebih dahulu.';
    }
    return;
  }

  const val = area.value.trim();
  if (!val) {
    if (msg) {
      msg.className = 'create-idea-msg warn';
      msg.textContent = 'Tuliskan langkah mewujudkan idemu dahulu, ya.';
    }
    if (typeof area.focus === 'function') area.focus();
    return;
  }

  const student = getCreateStudentProfile();
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  if (!student.id_siswa) {
    if (msg) {
      msg.className = 'create-idea-msg warn';
      msg.textContent = 'Silakan masuk/login terlebih dahulu untuk menyimpan jawaban ke server.';
    }
    return;
  }

  if (!api || typeof api.getWhere !== 'function') {
    if (msg) {
      msg.className = 'create-idea-msg error';
      msg.textContent = 'Ada masalah, coba lagi';
    }
    return;
  }

  if (button) button.disabled = true;
  if (msg) {
    msg.className = 'create-idea-msg info';
    msg.textContent = '⏳ Jawaban sedang diproses...';
  }

  const canonicalMateriId = selectedRow._materiKey || selectedRow.id_materi || '';
  const kelasVal = selectedRow.kelas || student.kelas || '';
  const sekolahVal = selectedRow.sekolah || student.school || '';

  try {
    const res = await api.getWhere('ide_create', {
      id_siswa: student.id_siswa,
      id_keterampilan: selectedRow.id_keterampilan
    });
    const rawList = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
    const list = rawList.filter(r => String(r.id_keterampilan) === String(selectedRow.id_keterampilan));

    if (!list || list.length <= 0) {
      const postData = {
        id_ide: '',
        id_keterampilan: selectedRow.id_keterampilan,
        id_siswa: student.id_siswa,
        id_materi: canonicalMateriId,
        kelas: kelasVal,
        sekolah: sekolahVal,
        pernyataan: selectedRow.pernyataan,
        keterangan: val,
        karya: ''
      };
      const postRes = await api.post('ide_create', postData);
      const newId = (postRes && (postRes.id_ide || postRes.id || (postRes.data && (postRes.data.id_ide || postRes.data.id)))) || '';
      createIdeRecordsMap[String(selectedRow.id_keterampilan)] = {
        ...postData,
        id_ide: newId
      };
    } else {
      const existing = list[0];
      const idIde = existing.id_ide !== undefined ? existing.id_ide : existing.id;
      const patchData = {
        id_keterampilan: selectedRow.id_keterampilan,
        id_materi: canonicalMateriId,
        kelas: kelasVal,
        sekolah: sekolahVal,
        pernyataan: selectedRow.pernyataan,
        keterangan: val,
        karya: ''
      };
      await api.patch('ide_create', 'id_ide', idIde, patchData);
      createIdeRecordsMap[String(selectedRow.id_keterampilan)] = {
        ...existing,
        ...patchData,
        id_ide: idIde
      };
    }

    refreshCreateIdeaChoices();

    if (msg) {
      msg.className = 'create-idea-msg ok';
      msg.textContent = '✓ Jawaban sudah disimpan';
    }
  } catch (error) {
    console.log(error);
    if (msg) {
      msg.className = 'create-idea-msg error';
      msg.textContent = 'Ada masalah, coba lagi';
    }
  } finally {
    if (button) button.disabled = false;
  }
}

function switchCreate(mode, btn) {
  document.querySelectorAll('.create-panel').forEach(p => p.classList.remove('show'));
  document.querySelectorAll('.create-tab-btn').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('cp-' + mode);
  if (panel) panel.classList.add('show');
  if (btn) btn.classList.add('active');
}

function setEmoji(e, btn) {
  selectedEmoji = e;
  if (typeof window !== 'undefined') window.selectedEmoji = e;
  if (typeof document !== 'undefined' && document.querySelectorAll) {
    document.querySelectorAll('#posterEmojiPicker .mm-btn').forEach(b => {
      b.classList.toggle('active', btn ? b === btn : (b.textContent || '').trim() === e);
    });
  }
}

function setCreatePartBStatus(mode, tone, message) {
  const cfg = CREATE_PART_B_UI_IDS[mode];
  if (!cfg || typeof document === 'undefined') return;
  const el = document.getElementById(cfg.statusId);
  if (!el) return;
  el.textContent = message || '';
  el.className = `create-partb-msg${cfg.onDark ? ' on-dark' : ''}${tone ? ' ' + tone : ''}`;
}

function parseCreateKaryaJson(rawKarya) {
  if (!rawKarya) return null;
  if (typeof rawKarya === 'object') return rawKarya;
  try {
    const parsed = JSON.parse(String(rawKarya));
    return (parsed && typeof parsed === 'object') ? parsed : null;
  } catch (e) {
    return null;
  }
}

async function saveCreatePartBToServer(mode, summaryText, payloadObj) {
  const cfg = CREATE_PART_B_UI_IDS[mode];
  const btn = (cfg && typeof document !== 'undefined') ? document.getElementById(cfg.btnId) : null;
  const student = getCreateStudentProfile();
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  if (!student.id_siswa) {
    setCreatePartBStatus(mode, 'warn', 'Silakan masuk/login terlebih dahulu untuk menyimpan karya ke server.');
    return { ok: false, reason: 'unauthenticated' };
  }

  if (!api || typeof api.post !== 'function') {
    setCreatePartBStatus(mode, 'error', 'Ada masalah, coba lagi');
    return { ok: false, reason: 'no_api' };
  }

  if (btn) btn.disabled = true;
  setCreatePartBStatus(mode, 'info', '⏳ Jawaban sedang diproses...');

  const saveMode = getCreatePartBSaveMode();
  const body = {
    id_keterampilan: null,
    id_siswa: student.id_siswa,
    id_materi: mode,
    kelas: student.kelas || '',
    sekolah: student.school || '',
    pernyataan: summaryText,
    keterangan: CREATE_PART_B_LABELS[mode] || mode,
    karya: JSON.stringify(payloadObj)
  };

  try {
    let existing = null;
    if (saveMode === 'upsert' && typeof api.getWhere === 'function') {
      const res = await api.getWhere('ide_create', {
        id_siswa: student.id_siswa,
        id_materi: mode
      });
      const rawList = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
      const matches = rawList.filter(r => isCreateRowOwnedByStudent(r, student.id_siswa) && isCreatePartBRow(r) && String(r.id_materi || '').trim() === mode);
      if (matches.length > 0) {
        existing = matches.reduce((best, cur) => {
          const bId = Number(best.id_ide || best.id || 0);
          const cId = Number(cur.id_ide || cur.id || 0);
          return cId >= bId ? cur : best;
        }, matches[0]);
      }
    }

    let savedId = '';
    if (!existing) {
      const postRes = await api.post('ide_create', { id_ide: '', ...body });
      savedId = (postRes && (postRes.id_ide || postRes.id || (postRes.data && (postRes.data.id_ide || postRes.data.id)))) || '';
      createPartBRecordsMap[mode] = { ...body, id_ide: savedId };
    } else {
      savedId = existing.id_ide !== undefined ? existing.id_ide : existing.id;
      await api.patch('ide_create', 'id_ide', savedId, body);
      createPartBRecordsMap[mode] = { ...existing, ...body, id_ide: savedId };
    }

    setCreatePartBStatus(mode, 'ok', '✓ Karya sudah disimpan');
    return { ok: true, saveMode, id_ide: savedId };
  } catch (error) {
    console.log(error);
    setCreatePartBStatus(mode, 'error', 'Ada masalah, coba lagi');
    return { ok: false, error };
  } finally {
    if (btn) btn.disabled = false;
  }
}

function collectPosterData() {
  const student = getCreateStudentProfile();
  return {
    jenis: 'poster',
    title: document.getElementById('posterTitle')?.value.trim() || '',
    msg: document.getElementById('posterMsg')?.value.trim() || '',
    emoji: selectedEmoji || '🌍',
    pledge: document.getElementById('posterPledge')?.value.trim() || '',
    name: document.getElementById('posterName')?.value.trim() || student.nama || '',
    date: new Date().toLocaleDateString('id-ID')
  };
}

function renderPosterPreview(data, shouldScroll = true) {
  const elTitle = document.getElementById('pp-title');
  const elEmo = document.getElementById('pp-emo');
  const elMsg = document.getElementById('pp-msg');
  const elPledge = document.getElementById('pp-pledge');
  const elName = document.getElementById('pp-name');
  const preview = document.getElementById('posterPreview');

  if (elTitle) elTitle.textContent = data.title || '';
  if (elEmo) elEmo.textContent = data.emoji || '🌍';
  if (elMsg) elMsg.textContent = data.msg || '';
  if (elPledge) elPledge.textContent = data.pledge ? '💪 "' + data.pledge + '"' : '';
  if (elName) {
    const labelName = data.name ? '— ' + data.name : '';
    const labelDate = data.date || new Date().toLocaleDateString('id-ID');
    elName.textContent = labelName ? `${labelName} | ${labelDate}` : '';
  }

  if (preview) {
    preview.style.display = 'block';
    if (shouldScroll && typeof preview.scrollIntoView === 'function') {
      preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

async function generatePoster() {
  const data = collectPosterData();
  if (!data.title || !data.msg) {
    setCreatePartBStatus('poster', 'warn', '⚠️ Isi judul dan pesan utama postermu dulu ya! 🖼️');
    return { ok: false, reason: 'validation' };
  }

  renderPosterPreview(data, true);
  const summary = `[Poster Digital] ${data.title} — ${data.msg}`;
  return saveCreatePartBToServer('poster', summary, data);
}

function selectCat(btn, emoji) {
  document.querySelectorAll('#pledgeCatButtons .pcat-btn').forEach(b => b.classList.remove('sel'));
  if (btn) btn.classList.add('sel');
  selectedCatEmoji = emoji;
  if (typeof window !== 'undefined') window.selectedCatEmoji = emoji;
}

function collectPledgeData() {
  const student = getCreateStudentProfile();
  return {
    jenis: 'pledge',
    emoji: selectedCatEmoji || '🌍',
    text: document.getElementById('pledgeText')?.value.trim() || '',
    name: document.getElementById('pledgeName')?.value.trim() || student.nama || '',
    date: new Date().toLocaleDateString('id-ID')
  };
}

function renderPledgePreview(data, shouldScroll = true) {
  const disp = document.getElementById('pledgeDisplay');
  if (disp) disp.style.display = 'block';

  const pdEmo = document.getElementById('pd-emoji');
  const pdText = document.getElementById('pd-text');
  const pdName = document.getElementById('pd-name');

  if (pdEmo) pdEmo.textContent = data.emoji || '🌍';
  if (pdText) pdText.textContent = '"' + (data.text || '') + '"';
  if (pdName) {
    const labelDate = data.date || new Date().toLocaleDateString('id-ID');
    pdName.textContent = '— ' + (data.name || 'Penjelajah Iklim') + ' | ' + labelDate;
  }

  if (disp && shouldScroll && typeof disp.scrollIntoView === 'function') {
    disp.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

async function savePledgeFull() {
  const data = collectPledgeData();
  if (!data.text) {
    setCreatePartBStatus('pledge', 'warn', '⚠️ Tulis ikrarmu dulu ya! ✍️');
    return { ok: false, reason: 'validation' };
  }

  renderPledgePreview(data, true);
  return saveCreatePartBToServer('pledge', data.text, data);
}

function insertTemplate(key) {
  const tmpl = window.templates || window.ECO_TEMPLATES || {};
  const ta = document.getElementById('newsText');
  if (ta && tmpl[key]) {
    ta.value = (ta.value + '\n\n' + tmpl[key]).trim();
  }
}

function collectNewsData() {
  const student = getCreateStudentProfile();
  const rawText = document.getElementById('newsText')?.value.trim() || '';
  const { headline, body } = extractNewsHeadlineAndBody(rawText);
  return {
    jenis: 'news',
    headline,
    body,
    text: rawText,
    author: student.nama || 'Sahabat Bumi',
    kelas: student.kelas || '',
    sekolah: student.school || '',
    date: new Date().toLocaleDateString('id-ID')
  };
}

function extractNewsHeadlineAndBody(rawText) {
  const clean = String(rawText || '').trim();
  if (!clean) return { headline: 'Berita Eco Mini Sahabat Bumi', body: '' };
  const lines = clean.split(/\r?\n/).map(l => l.trim());
  if (lines.length >= 2 && lines[0].length > 0 && lines[0].length <= 90) {
    const title = lines[0].replace(/^\[|\]$/g, '').trim();
    const rest = lines.slice(1).join('\n').trim();
    if (rest) return { headline: title, body: rest };
  }
  return { headline: 'Berita Eco Mini Sahabat Bumi', body: clean };
}

async function saveNews() {
  const data = collectNewsData();
  if (data.text.length < 80) {
    setCreatePartBStatus('news', 'warn', '⚠️ Beritamu terlalu pendek! Tulis minimal 80 karakter (150 kata) agar informasinya lengkap 📰');
    return { ok: false, reason: 'validation' };
  }
  return saveCreatePartBToServer('news', data.text, data);
}

function selectActionCat(btn, emoji, label) {
  document.querySelectorAll('#ecoActionCats .pcat-btn').forEach(b => b.classList.remove('sel'));
  if (btn) btn.classList.add('sel');
  selectedAction = { emoji, label };
  if (typeof window !== 'undefined') window.selectedAction = selectedAction;
}

function collectEcoActionData() {
  const student = getCreateStudentProfile();
  return {
    jenis: 'action',
    category: selectedAction || { emoji: '🌱', label: 'Aksi Lingkungan' },
    problem: document.getElementById('actionProblem')?.value.trim() || '',
    why: document.getElementById('actionWhy')?.value.trim() || '',
    plan: document.getElementById('actionPlan')?.value.trim() || '',
    place: document.getElementById('actionPlace')?.value.trim() || '',
    when: document.getElementById('actionWhen')?.value.trim() || '',
    helper: document.getElementById('actionHelper')?.value.trim() || '',
    evidence: document.getElementById('actionEvidence')?.value.trim() || '',
    change: document.getElementById('actionChange')?.value.trim() || '',
    next: document.getElementById('actionNext')?.value.trim() || '',
    author: student.nama || 'Sahabat Bumi',
    kelas: student.kelas || '',
    sekolah: student.school || '',
    date: new Date().toLocaleDateString('id-ID')
  };
}

function renderEcoActionFeedback(data) {
  const fb = document.getElementById('actionFeedback');
  if (!fb) return;
  const acted = (data.evidence || '').length > 5 || (data.change || '').length > 5;
  const cat = data.category || { emoji: '🌱', label: 'Aksi Lingkungan' };
  fb.style.display = 'block';
  fb.style.background = '#DCFCE7';
  fb.style.color = '#14532D';
  fb.innerHTML = acted
    ? `✅ ${cat.emoji} Proyek <strong>${cat.label}</strong> tersimpan dengan bukti/refleksi. Ini sudah bergerak dari rencana menuju ecological agency.`
    : `📝 Rencana <strong>${cat.label}</strong> tersimpan. Langkah berikutnya: lakukan aksi, lalu kembali untuk mengisi <strong>Bukti tindakan</strong> dan <strong>Apa yang berubah</strong>.`;
}

async function saveEcoAction() {
  const data = collectEcoActionData();
  const fb = document.getElementById('actionFeedback');

  if (!data.problem || !data.why || !data.plan) {
    if (fb) {
      fb.style.display = 'block';
      fb.style.background = '#FEE2E2';
      fb.style.color = '#7F1D1D';
      fb.textContent = '⚠️ Lengkapi dulu masalah, alasan ekologis, dan rencana aksimu.';
    }
    setCreatePartBStatus('action', 'warn', '⚠️ Lengkapi masalah, alasan, dan rencana aksimu dulu ya.');
    return { ok: false, reason: 'validation' };
  }

  renderEcoActionFeedback(data);
  const catLabel = (data.category && data.category.label) || 'Aksi Lingkungan';
  const summary = `[Aksi Sahabat Bumi · ${catLabel}] ${data.plan}`;
  return saveCreatePartBToServer('action', summary, data);
}

function applyEcoActionFields(data) {
  if (!data) return;
  const map = {
    actionProblem: 'problem',
    actionWhy: 'why',
    actionPlan: 'plan',
    actionPlace: 'place',
    actionWhen: 'when',
    actionHelper: 'helper',
    actionEvidence: 'evidence',
    actionChange: 'change',
    actionNext: 'next'
  };
  Object.entries(map).forEach(([id, k]) => {
    const el = document.getElementById(id);
    if (el) el.value = data[k] || '';
  });
  if (data.category && data.category.label) {
    selectedAction = data.category;
    if (typeof document !== 'undefined' && document.querySelectorAll) {
      const btns = [...document.querySelectorAll('#ecoActionCats .pcat-btn')];
      const match = btns.find(b => (b.textContent || '').includes(data.category.label));
      if (match) selectActionCat(match, data.category.emoji, data.category.label);
    }
  }
}

function loadEcoAction() {
  const row = createPartBRecordsMap.action;
  if (row) {
    const parsed = parseCreateKaryaJson(row.karya);
    if (parsed) {
      applyEcoActionFields(parsed);
      return;
    }
  }
  const baseKey = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.actionProject : 'ecoActionProject';
  const studentId = getCreateStudentProfile().id_siswa;
  const key = studentId ? `${baseKey}_${studentId}` : baseKey;
  let data = null;
  if (typeof store !== 'undefined' && store.read) {
    data = store.read(key, null);
  } else {
    try { data = JSON.parse((typeof localStorage !== 'undefined' && localStorage.getItem(key)) || 'null'); } catch (e) {}
  }
  if (data) {
    applyEcoActionFields(data);
  } else {
    resetEcoActionSectionUi();
  }
}

function resetEcoActionSectionUi() {
  applyEcoActionFields({});
  if (typeof document !== 'undefined' && document.querySelectorAll) {
    document.querySelectorAll('#ecoActionCats .pcat-btn').forEach(b => b.classList.remove('sel'));
  }
  selectedAction = { emoji: '🌱', label: 'Aksi Lingkungan' };
  if (typeof window !== 'undefined') window.selectedAction = selectedAction;
  const fb = document.getElementById('actionFeedback');
  if (fb) {
    fb.style.display = 'none';
    fb.innerHTML = '';
  }
  setCreatePartBStatus('action', '', '');
}

function restoreCreatePartBFromServer() {
  if (typeof document === 'undefined') return;
  const defaultIdentityLabel = getCreateDefaultIdentityLabel();

  const posterRow = createPartBRecordsMap.poster;
  if (posterRow) {
    const d = parseCreateKaryaJson(posterRow.karya) || { title: posterRow.pernyataan || '', msg: '' };
    const tEl = document.getElementById('posterTitle');
    const mEl = document.getElementById('posterMsg');
    const pEl = document.getElementById('posterPledge');
    const nEl = document.getElementById('posterName');
    if (tEl) tEl.value = d.title || '';
    if (mEl) mEl.value = d.msg || '';
    if (pEl) pEl.value = d.pledge || '';
    if (nEl) nEl.value = d.name || '';
    if (d.emoji) setEmoji(d.emoji);
    if (d.title || d.msg) renderPosterPreview(d, false);
    setCreatePartBStatus('poster', 'ok', '✓ Karya sudah disimpan');
  } else {
    const tEl = document.getElementById('posterTitle');
    const mEl = document.getElementById('posterMsg');
    const pEl = document.getElementById('posterPledge');
    const nEl = document.getElementById('posterName');
    const prev = document.getElementById('posterPreview');
    const ppTitle = document.getElementById('pp-title');
    const ppMsg = document.getElementById('pp-msg');
    const ppPledge = document.getElementById('pp-pledge');
    const ppName = document.getElementById('pp-name');
    if (tEl) tEl.value = '';
    if (mEl) mEl.value = '';
    if (pEl) pEl.value = '';
    if (nEl) nEl.value = defaultIdentityLabel;
    if (prev) prev.style.display = 'none';
    if (ppTitle) ppTitle.textContent = '';
    if (ppMsg) ppMsg.textContent = '';
    if (ppPledge) ppPledge.textContent = '';
    if (ppName) ppName.textContent = '';
    setEmoji('🌍');
    setCreatePartBStatus('poster', '', '');
  }

  const pledgeRow = createPartBRecordsMap.pledge;
  if (pledgeRow) {
    const d = parseCreateKaryaJson(pledgeRow.karya) || { text: pledgeRow.pernyataan || '' };
    const tEl = document.getElementById('pledgeText');
    const nEl = document.getElementById('pledgeName');
    if (tEl) tEl.value = d.text || pledgeRow.pernyataan || '';
    if (nEl) nEl.value = d.name || '';
    if (d.emoji) {
      const btns = [...(document.querySelectorAll ? document.querySelectorAll('#pledgeCatButtons .pcat-btn') : [])];
      const match = btns.find(b => (b.textContent || '').includes(d.emoji));
      selectCat(match || null, d.emoji);
    }
    if (d.text || pledgeRow.pernyataan) renderPledgePreview({ ...d, text: d.text || pledgeRow.pernyataan }, false);
    setCreatePartBStatus('pledge', 'ok', '✓ Karya sudah disimpan');
  } else {
    const tEl = document.getElementById('pledgeText');
    const nEl = document.getElementById('pledgeName');
    const disp = document.getElementById('pledgeDisplay');
    const pdEmo = document.getElementById('pd-emoji');
    const pdText = document.getElementById('pd-text');
    const pdName = document.getElementById('pd-name');
    if (tEl) tEl.value = '';
    if (nEl) nEl.value = defaultIdentityLabel;
    if (disp) disp.style.display = 'none';
    if (pdEmo) pdEmo.textContent = '🌍';
    if (pdText) pdText.textContent = '';
    if (pdName) pdName.textContent = '';
    selectCat(null, '🌍');
    setCreatePartBStatus('pledge', '', '');
  }

  const newsRow = createPartBRecordsMap.news;
  if (newsRow) {
    const d = parseCreateKaryaJson(newsRow.karya);
    const nEl = document.getElementById('newsText');
    if (nEl) nEl.value = (d && d.text) || newsRow.pernyataan || '';
    setCreatePartBStatus('news', 'ok', '✓ Karya sudah disimpan');
  } else {
    const nEl = document.getElementById('newsText');
    if (nEl) nEl.value = '';
    setCreatePartBStatus('news', '', '');
  }

  const actionRow = createPartBRecordsMap.action;
  if (actionRow) {
    const d = parseCreateKaryaJson(actionRow.karya);
    if (d) {
      applyEcoActionFields(d);
      if (d.problem && d.why && d.plan) renderEcoActionFeedback(d);
      setCreatePartBStatus('action', 'ok', '✓ Karya sudah disimpan');
    } else {
      resetEcoActionSectionUi();
    }
  } else {
    resetEcoActionSectionUi();
  }
}

/* ── CANVAS VISUAL EXPORT (PNG & PDF 1.4 CLIENT-SIDE TANPA LIBRARY EKSTERNAL) ── */
function createOffscreenCanvas(width, height) {
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext ? canvas.getContext('2d') : null;
  if (!ctx) return null;
  return { canvas, ctx };
}

function drawRoundedRect(ctx, x, y, w, h, r, fillStyle, strokeStyle = null, lineWidth = 0) {
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

function wrapCanvasLines(ctx, text, maxWidth) {
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
        current = word;
      }
    });
    if (current) lines.push(current);
  });
  return lines;
}

function drawWrappedTextLines(ctx, lines, x, y, lineHeight, align = 'left', maxLines = 0) {
  const list = maxLines > 0 && lines.length > maxLines
    ? [...lines.slice(0, maxLines - 1), `${lines[maxLines - 1].slice(0, 42)}…`]
    : lines;
  ctx.textAlign = align;
  let curY = y;
  list.forEach(line => {
    if (line) ctx.fillText(line, x, curY);
    curY += lineHeight;
  });
  return curY;
}

function renderPosterToCanvas(data) {
  const res = createOffscreenCanvas(1080, 1350);
  if (!res) return null;
  const { canvas, ctx } = res;

  const grad = ctx.createLinearGradient(0, 0, 1080, 1350);
  grad.addColorStop(0, '#0A3D1F');
  grad.addColorStop(1, '#1B6FB5');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1350);

  drawRoundedRect(ctx, 56, 56, 968, 1238, 34, '#FFFFFF');
  drawRoundedRect(ctx, 310, 106, 460, 48, 24, '#DCFCE7');
  ctx.fillStyle = '#14532D';
  ctx.font = '800 22px Nunito, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌿 POSTER IKLIM ECOMEDIA RADEC', 540, 138);

  ctx.fillStyle = '#111827';
  ctx.font = '800 48px Sora, Arial, sans-serif';
  const titleLines = wrapCanvasLines(ctx, data.title, 840);
  let y = drawWrappedTextLines(ctx, titleLines, 540, 232, 60, 'center', 3);

  ctx.font = '148px Apple Color Emoji, Segoe UI Emoji, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.emoji || '🌍', 540, Math.max(y + 130, 470));

  const boxTop = Math.max(y + 190, 540);
  const boxHeight = 470;
  drawRoundedRect(ctx, 112, boxTop, 856, boxHeight, 26, '#F0FDF4', '#16A34A', 5);

  ctx.fillStyle = '#1F2937';
  ctx.font = '700 32px Nunito, Arial, sans-serif';
  const msgLines = wrapCanvasLines(ctx, data.msg, 760);
  const afterMsgY = drawWrappedTextLines(ctx, msgLines, 540, boxTop + 86, 46, 'center', 5);

  if (data.pledge) {
    ctx.fillStyle = '#14532D';
    ctx.font = '800 30px Nunito, Arial, sans-serif';
    const pledgeLines = wrapCanvasLines(ctx, `💪 "${data.pledge}"`, 760);
    drawWrappedTextLines(ctx, pledgeLines, 540, afterMsgY + 34, 44, 'center', 3);
  }

  ctx.fillStyle = '#6B7280';
  ctx.font = '700 24px Nunito, Arial, sans-serif';
  ctx.textAlign = 'center';
  const meta = data.name ? `— ${data.name} | ${data.date}` : `EcoMedia RADEC · ${data.date}`;
  ctx.fillText(meta, 540, 1215);

  return canvas;
}

function renderPledgeToCanvas(data) {
  const res = createOffscreenCanvas(1080, 1080);
  if (!res) return null;
  const { canvas, ctx } = res;

  const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
  grad.addColorStop(0, '#1B5E35');
  grad.addColorStop(1, '#0D3E6E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1080);

  drawRoundedRect(ctx, 48, 48, 984, 984, 34, null, 'rgba(255,255,255,0.45)', 4);
  drawRoundedRect(ctx, 290, 96, 500, 50, 25, 'rgba(255,255,255,0.16)', 'rgba(255,255,255,0.35)', 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 22px Nunito, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📜 IKRAR LINGKUNGAN SAHABAT BUMI', 540, 129);

  ctx.font = '132px Apple Color Emoji, Segoe UI Emoji, Arial, sans-serif';
  ctx.fillText(data.emoji || '🌍', 540, 300);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 34px Nunito, Arial, sans-serif';
  const pledgeLines = wrapCanvasLines(ctx, `"${data.text}"`, 820);
  drawWrappedTextLines(ctx, pledgeLines, 540, 420, 52, 'center', 8);

  drawRoundedRect(ctx, 180, 888, 720, 74, 18, 'rgba(255,255,255,0.12)');
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '700 24px Nunito, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`— ${data.name || 'Penjelajah Iklim'} | ${data.date}`, 540, 934);

  return canvas;
}

function renderNewsCardToCanvas(data) {
  const res = createOffscreenCanvas(1240, 1754);
  if (!res) return null;
  const { canvas, ctx } = res;

  // Background halaman pastel lembut
  const bg = ctx.createLinearGradient(0, 0, 0, 1754);
  bg.addColorStop(0, '#EFF6FF');
  bg.addColorStop(1, '#F0FDF4');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1240, 1754);

  // Card utama putih elevasi
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 14;
  drawRoundedRect(ctx, 84, 88, 1072, 1578, 34, '#FFFFFF');
  ctx.restore();
  drawRoundedRect(ctx, 84, 88, 1072, 1578, 34, null, '#F3D2D2', 2.5);

  // Header Banner Card
  const headGrad = ctx.createLinearGradient(84, 88, 1156, 260);
  headGrad.addColorStop(0, '#DC2626');
  headGrad.addColorStop(1, '#EA580C');
  drawRoundedRect(ctx, 84, 88, 1072, 182, 34, headGrad);
  ctx.fillRect(84, 224, 1072, 46);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 38px Sora, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('📰 BERITA ECO MINI', 136, 174);
  ctx.font = '700 22px Nunito, Arial, sans-serif';
  ctx.fillStyle = '#FFE4E6';
  ctx.fillText('EDISI KARYA SISWA · ECOMEDIA RADEC', 136, 222);

  drawRoundedRect(ctx, 886, 134, 224, 46, 23, 'rgba(255,255,255,0.2)');
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 20px Nunito, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`📅 ${data.date}`, 998, 165);

  // Strip penulis
  drawRoundedRect(ctx, 136, 310, 968, 72, 16, '#FFF5F2', '#FECACA', 1.5);
  ctx.fillStyle = '#991B1B';
  ctx.font = '800 22px Nunito, Arial, sans-serif';
  ctx.textAlign = 'left';
  const authorParts = [data.author || 'Sahabat Bumi', data.kelas ? `Kelas ${data.kelas}` : '', data.sekolah || ''].filter(Boolean);
  ctx.fillText(`✍️ Penulis: ${authorParts.join(' · ')}`, 164, 354);

  // Judul berita (Card headline)
  ctx.fillStyle = '#111827';
  ctx.font = '800 40px Sora, Arial, sans-serif';
  const headlineLines = wrapCanvasLines(ctx, data.headline || 'Berita Eco Mini Sahabat Bumi', 960);
  let cursorY = drawWrappedTextLines(ctx, headlineLines, 136, 456, 54, 'left', 3);

  // Garis pemisah aksen
  drawRoundedRect(ctx, 136, cursorY + 8, 140, 7, 3.5, '#DC2626');
  cursorY += 66;

  // Isi berita (Card body)
  ctx.fillStyle = '#334155';
  ctx.font = '600 27px Nunito, Arial, sans-serif';
  const bodyLines = wrapCanvasLines(ctx, data.body || data.text, 960);
  const maxBodyLines = Math.max(8, Math.floor((1448 - cursorY) / 44));
  drawWrappedTextLines(ctx, bodyLines, 136, cursorY, 44, 'left', maxBodyLines);

  // Footer tips card
  drawRoundedRect(ctx, 136, 1474, 968, 132, 20, '#F0FDF4', '#86EFAC', 2);
  ctx.fillStyle = '#14532D';
  ctx.font = '800 22px Nunito, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('📌 Prinsip Berita Ecomedia:', 166, 1520);
  ctx.fillStyle = '#166534';
  ctx.font = '700 21px Nunito, Arial, sans-serif';
  ctx.fillText('✅ Berbasis fakta & sumber data   ·   ✅ Menyertakan solusi   ·   ✅ Mengajak aksi nyata', 166, 1564);

  return canvas;
}

function renderActionFlyerToCanvas(data) {
  const res = createOffscreenCanvas(1240, 1754);
  if (!res) return null;
  const { canvas, ctx } = res;

  // Dasar Flyer lembut
  ctx.fillStyle = '#F8FCF9';
  ctx.fillRect(0, 0, 1240, 1754);

  // Header Banner penuh Flyer
  const headGrad = ctx.createLinearGradient(0, 0, 1240, 280);
  headGrad.addColorStop(0, '#0A3D1F');
  headGrad.addColorStop(1, '#15803D');
  ctx.fillStyle = headGrad;
  ctx.fillRect(0, 0, 1240, 272);

  drawRoundedRect(ctx, 72, 46, 470, 42, 21, 'rgba(255,255,255,0.18)');
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

  // Ribbon 3 kolom (Tempat, Waktu, Pendamping)
  const ribbons = [
    { label: '📍 TEMPAT', val: data.place || '-' },
    { label: '⏰ WAKTU', val: data.when || '-' },
    { label: '🤝 PEMBANTU', val: data.helper || '-' }
  ];
  ribbons.forEach((item, idx) => {
    const rx = 72 + idx * 372;
    drawRoundedRect(ctx, rx, 304, 352, 98, 18, '#FFFFFF', '#86EFAC', 2);
    ctx.fillStyle = '#15803D';
    ctx.font = '800 18px Nunito, Arial, sans-serif';
    ctx.fillText(item.label, rx + 20, 338);
    ctx.fillStyle = '#1E293B';
    ctx.font = '700 22px Nunito, Arial, sans-serif';
    const valLines = wrapCanvasLines(ctx, item.val, 312);
    ctx.fillText((valLines[0] || '-').slice(0, 28), rx + 20, 376);
  });

  // 5 Seksi Flyer Berwarna
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
    drawRoundedRect(ctx, 72, curY, 1096, sec.h, 20, sec.bg, sec.border, 2);
    drawRoundedRect(ctx, 72, curY, 12, sec.h, 6, sec.accent);
    ctx.fillStyle = sec.accent;
    ctx.font = '800 24px Sora, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${sec.icon} ${sec.title}`, 106, curY + 44);

    ctx.fillStyle = '#1E293B';
    ctx.font = '600 23px Nunito, Arial, sans-serif';
    const lines = wrapCanvasLines(ctx, sec.text, 1030);
    drawWrappedTextLines(ctx, lines, 106, curY + 88, 36, 'left', sec.maxLines);
    curY += sec.h + 22;
  });

  // Footer Flyer identitas
  drawRoundedRect(ctx, 72, 1602, 1096, 104, 20, '#0A3D1F');
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

function decodeBase64ToBytes(b64) {
  if (typeof atob === 'function') {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(b64, 'base64'));
  }
  throw new Error('Base64 decoder tidak tersedia');
}

function asciiToBytes(str) {
  const out = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 0xff;
  return out;
}

function buildPdfFromJpegPages(pages) {
  const pageList = Array.isArray(pages) ? pages.filter(Boolean) : [];
  if (pageList.length === 0) {
    throw new Error('Tidak ada halaman PDF untuk dibuat');
  }

  const chunks = [];
  let offset = 0;
  const pushBytes = (arr) => {
    chunks.push(arr);
    offset += arr.length;
  };
  const pushAscii = (str) => pushBytes(asciiToBytes(str));

  pushAscii('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  const offsets = [0];
  offsets.push(offset); // Obj 1: Catalog
  pushAscii('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  const kidRefs = pageList.map((_, k) => `${3 + k * 3} 0 R`).join(' ');
  offsets.push(offset); // Obj 2: Pages
  pushAscii(`2 0 obj\n<< /Type /Pages /Kids [${kidRefs}] /Count ${pageList.length} >>\nendobj\n`);

  pageList.forEach((pg, k) => {
    const pageW = pg.pageW || 595;
    const pageH = pg.pageH || 842;
    const widthPx = pg.widthPx || 1240;
    const heightPx = pg.heightPx || 1754;
    const commaIdx = String(pg.dataUrl || '').indexOf(',');
    const b64 = commaIdx >= 0 ? pg.dataUrl.slice(commaIdx + 1) : String(pg.dataUrl || '');
    const jpgBytes = decodeBase64ToBytes(b64);

    const pageObj = 3 + k * 3;
    const imgObj = 4 + k * 3;
    const contentObj = 5 + k * 3;

    offsets.push(offset);
    pushAscii(`${pageObj} 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /XObject << /Im${k} ${imgObj} 0 R >> >> /MediaBox [0 0 ${pageW} ${pageH}] /Contents ${contentObj} 0 R >>\nendobj\n`);

    offsets.push(offset);
    pushAscii(`${imgObj} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${widthPx} /Height ${heightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpgBytes.length} >>\nstream\n`);
    pushBytes(jpgBytes);
    pushAscii('\nendstream\nendobj\n');

    const contentStream = `q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im${k} Do\nQ\n`;
    offsets.push(offset);
    pushAscii(`${contentObj} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`);
  });

  const totalObjs = 2 + pageList.length * 3;
  const xrefOffset = offset;
  pushAscii(`xref\n0 ${totalObjs + 1}\n0000000000 65535 f \n`);
  for (let i = 1; i <= totalObjs; i++) {
    pushAscii(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }
  pushAscii(`trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  const merged = new Uint8Array(offset);
  let pos = 0;
  chunks.forEach(chunk => {
    merged.set(chunk, pos);
    pos += chunk.length;
  });
  return merged;
}

function buildPdfFromJpegDataUrl(jpegDataUrl, widthPx, heightPx, pageW = 595, pageH = 842) {
  return buildPdfFromJpegPages([{ dataUrl: jpegDataUrl, widthPx, heightPx, pageW, pageH }]);
}

function sanitizeCreateFilename(rawName, fallback) {
  const clean = String(rawName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 36);
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

function downloadCreateArtifact(mode) {
  if (!CREATE_PART_B_MODES.includes(mode)) return { ok: false, reason: 'invalid_mode' };

  if (mode === 'poster') {
    const data = collectPosterData();
    if (!data.title || !data.msg) {
      setCreatePartBStatus('poster', 'warn', '⚠️ Isi judul dan pesan utama poster dulu sebelum mengunduh.');
      return { ok: false, reason: 'validation' };
    }
    const canvas = renderPosterToCanvas(data);
    if (!canvas) return { ok: false, reason: 'no_canvas' };
    const pngUrl = canvas.toDataURL('image/png');
    const filename = `poster-ecomedia-${sanitizeCreateFilename(data.title, 'karya')}.png`;
    triggerCreateFileDownload(pngUrl, filename);
    setCreatePartBStatus('poster', 'ok', `⬇️ Poster "${filename}" berhasil diunduh.`);
    return { ok: true, format: 'png', filename };
  }

  if (mode === 'pledge') {
    const data = collectPledgeData();
    if (!data.text) {
      setCreatePartBStatus('pledge', 'warn', '⚠️ Tulis ikrarmu dulu sebelum mengunduh.');
      return { ok: false, reason: 'validation' };
    }
    const canvas = renderPledgeToCanvas(data);
    if (!canvas) return { ok: false, reason: 'no_canvas' };
    const pngUrl = canvas.toDataURL('image/png');
    const filename = `ikrar-ecomedia-${sanitizeCreateFilename(data.name || 'sahabat-bumi', 'ikrar')}.png`;
    triggerCreateFileDownload(pngUrl, filename);
    setCreatePartBStatus('pledge', 'ok', `⬇️ Kartu ikrar "${filename}" berhasil diunduh.`);
    return { ok: true, format: 'png', filename };
  }

  if (mode === 'news') {
    const data = collectNewsData();
    if (data.text.length < 80) {
      setCreatePartBStatus('news', 'warn', '⚠️ Tulis berita minimal 80 karakter dulu sebelum mengunduh PDF.');
      return { ok: false, reason: 'validation' };
    }
    const canvas = renderNewsCardToCanvas(data);
    if (!canvas) return { ok: false, reason: 'no_canvas' };
    const jpegUrl = canvas.toDataURL('image/jpeg', 0.92);
    const pdfBytes = buildPdfFromJpegDataUrl(jpegUrl, canvas.width, canvas.height, 595, 842);
    const blob = typeof Blob !== 'undefined' ? new Blob([pdfBytes], { type: 'application/pdf' }) : pdfBytes;
    const filename = `berita-eco-mini-${sanitizeCreateFilename(data.headline, 'card')}.pdf`;
    triggerCreateFileDownload(blob, filename);
    setCreatePartBStatus('news', 'ok', `📄 Card PDF "${filename}" berhasil diunduh.`);
    return { ok: true, format: 'pdf', filename, pdfBytes };
  }

  if (mode === 'action') {
    const data = collectEcoActionData();
    if (!data.problem || !data.why || !data.plan) {
      setCreatePartBStatus('action', 'warn', '⚠️ Lengkapi masalah, alasan, dan rencana aksi dulu sebelum mengunduh Flyer PDF.');
      return { ok: false, reason: 'validation' };
    }
    const canvas = renderActionFlyerToCanvas(data);
    if (!canvas) return { ok: false, reason: 'no_canvas' };
    const jpegUrl = canvas.toDataURL('image/jpeg', 0.92);
    const pdfBytes = buildPdfFromJpegDataUrl(jpegUrl, canvas.width, canvas.height, 595, 842);
    const blob = typeof Blob !== 'undefined' ? new Blob([pdfBytes], { type: 'application/pdf' }) : pdfBytes;
    const catName = (data.category && data.category.label) || 'aksi';
    const filename = `flyer-aksi-${sanitizeCreateFilename(catName, 'sahabat-bumi')}.pdf`;
    triggerCreateFileDownload(blob, filename);
    setCreatePartBStatus('action', 'ok', `📄 Flyer PDF "${filename}" berhasil diunduh.`);
    return { ok: true, format: 'pdf', filename, pdfBytes };
  }
}

function renderCreatePrinciples() {
  const container = document.getElementById('ecpChecksContainer');
  if (!container) return;
  const list = window.CREATE_PRINCIPLES || [];
  container.innerHTML = list.map(p => `
    <label><input type="checkbox" data-eco-create="${p.id}" onchange="saveEcoCreateChecks()"> ${p.label}</label>
  `).join('');
}

function renderPosterEmojis() {
  const container = document.getElementById('posterEmojiPicker');
  if (!container) return;
  const emojis = window.CREATE_POSTER_EMOJIS || [];
  container.innerHTML = emojis.map(emo => `
    <button type="button" class="mm-btn${emo === selectedEmoji ? ' active' : ''}" onclick="setEmoji('${emo}', this)">${emo}</button>
  `).join('');
}

function renderPledgeCategories() {
  const container = document.getElementById('pledgeCatButtons');
  if (!container) return;
  const cats = window.CREATE_PLEDGE_CATS || [];
  container.innerHTML = cats.map(c => `
    <button type="button" class="pcat-btn" onclick="selectCat(this,'${c.icon}')"><span class="pci">${c.icon}</span>${c.label}</button>
  `).join('');
}

function renderActionCategories() {
  const container = document.getElementById('ecoActionCats');
  if (!container) return;
  const cats = window.CREATE_ACTION_CATS || [];
  container.innerHTML = cats.map(c => `
    <button type="button" class="pcat-btn" onclick="selectActionCat(this,'${c.icon}','${c.label}')"><span class="pci">${c.icon}</span>${c.label}</button>
  `).join('');
}

function renderCreateComponents() {
  renderCreatePrinciples();
  renderPosterEmojis();
  renderPledgeCategories();
  renderActionCategories();
  if (typeof loadEcoCreateChecks === 'function') loadEcoCreateChecks();
}

// Global window exposure
if (typeof window !== 'undefined') {
  window.selectedEmoji = selectedEmoji;
  window.selectedCatEmoji = selectedCatEmoji;
  window.selectedAction = selectedAction;
  window.msgCount = msgCount;
  window.switchCreate = switchCreate;
  window.setEmoji = setEmoji;
  window.generatePoster = generatePoster;
  window.selectCat = selectCat;
  window.savePledgeFull = savePledgeFull;
  window.insertTemplate = insertTemplate;
  window.saveNews = saveNews;
  window.selectActionCat = selectActionCat;
  window.saveEcoAction = saveEcoAction;
  window.loadEcoAction = loadEcoAction;
  window.renderCreatePrinciples = renderCreatePrinciples;
  window.renderPosterEmojis = renderPosterEmojis;
  window.renderPledgeCategories = renderPledgeCategories;
  window.renderActionCategories = renderActionCategories;
  window.renderCreateComponents = renderCreateComponents;
  window.normalizeCreateMateriId = normalizeCreateMateriId;
  window.createCreativeIdeaTouch = createCreativeIdeaTouch;
  window.refreshCreateIdeaChoices = refreshCreateIdeaChoices;
  window.updateCreateIdeaPresentation = updateCreateIdeaPresentation;
  window.selectReadIdeaForCreate = selectReadIdeaForCreate;
  window.loadCreateCreativeIdea = loadCreateCreativeIdea;
  window.saveCreateCreativeIdea = saveCreateCreativeIdea;
  window.getCreatePartBSaveMode = getCreatePartBSaveMode;
  window.setCreatePartBSaveMode = setCreatePartBSaveMode;
  window.toggleCreatePartBSaveMode = toggleCreatePartBSaveMode;
  window.downloadCreateArtifact = downloadCreateArtifact;
  window.buildPdfFromJpegPages = buildPdfFromJpegPages;
  window.buildPdfFromJpegDataUrl = buildPdfFromJpegDataUrl;
  window.createOffscreenCanvas = createOffscreenCanvas;
  window.drawRoundedRect = drawRoundedRect;
  window.wrapCanvasLines = wrapCanvasLines;
  window.drawWrappedTextLines = drawWrappedTextLines;
  window.sanitizeCreateFilename = sanitizeCreateFilename;
  window.triggerCreateFileDownload = triggerCreateFileDownload;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    switchCreate,
    setEmoji,
    generatePoster,
    selectCat,
    savePledgeFull,
    insertTemplate,
    saveNews,
    selectActionCat,
    saveEcoAction,
    loadEcoAction,
    renderCreatePrinciples,
    renderPosterEmojis,
    renderPledgeCategories,
    renderActionCategories,
    renderCreateComponents,
    normalizeCreateMateriId,
    createCreativeIdeaTouch,
    refreshCreateIdeaChoices,
    updateCreateIdeaPresentation,
    selectReadIdeaForCreate,
    loadCreateCreativeIdea,
    saveCreateCreativeIdea,
    getCreatePartBSaveMode,
    setCreatePartBSaveMode,
    toggleCreatePartBSaveMode,
    saveCreatePartBToServer,
    restoreCreatePartBFromServer,
    collectPosterData,
    collectPledgeData,
    collectNewsData,
    collectEcoActionData,
    renderPosterToCanvas,
    renderPledgeToCanvas,
    renderNewsCardToCanvas,
    renderActionFlyerToCanvas,
    buildPdfFromJpegPages,
    buildPdfFromJpegDataUrl,
    downloadCreateArtifact
  };
}

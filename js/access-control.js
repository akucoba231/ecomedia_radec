/**
 * EcoMedia RADEC - Class Access Control Module (Tabel 'hak_akses')
 * Mengatur hak akses tingkat kelas (WHERE kelas AND sekolah) untuk:
 * 1. Tahap belajar: READ, ANSWER, DISCUSS, EXPLAIN, CREATE
 * 2. Materi belajar: 1, 2, 3, 4, 5
 * Default kebijakan: seluruh tahap & materi TERKUNCI sampai dibuka oleh guru.
 */

const ACCESS_STAGE_KEYS = ['read', 'answer', 'discuss', 'explain', 'create'];
const ACCESS_STAGE_LABELS = ['READ', 'ANSWER', 'DISCUSS', 'EXPLAIN', 'CREATE'];
const ACCESS_MATERIAL_LIST = [1, 2, 3, 4, 5];

let classAccessState = {
  loaded: false,
  kelas: '',
  sekolah: '',
  stages: {
    read: false,
    answer: false,
    discuss: false,
    explain: false,
    create: false
  },
  materials: new Set()
};

function getAccessStudentContext() {
  const st = (typeof window !== 'undefined' && window.ecoStudent) ||
             (typeof ecoStudent !== 'undefined' ? ecoStudent : {});
  return {
    kelas: String(
      st.kelas ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentClass')) ||
      ''
    ).trim(),
    sekolah: String(
      st.school ||
      st.sekolah ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentSchool')) ||
      ''
    ).trim()
  };
}

function resetClassAccessToLocked(kelas = '', sekolah = '') {
  classAccessState = {
    loaded: false,
    kelas,
    sekolah,
    stages: {
      read: false,
      answer: false,
      discuss: false,
      explain: false,
      create: false
    },
    materials: new Set()
  };
  return classAccessState;
}

function parseStageAccessField(raw) {
  const stages = {
    read: false,
    answer: false,
    discuss: false,
    explain: false,
    create: false
  };
  if (!raw) return stages;

  let parsed = raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return stages;
    try {
      parsed = JSON.parse(trimmed);
    } catch (e) {
      return stages;
    }
  }

  if (Array.isArray(parsed)) {
    parsed.forEach(item => {
      if (typeof item === 'number' && ACCESS_STAGE_KEYS[item]) {
        stages[ACCESS_STAGE_KEYS[item]] = true;
      } else {
        const key = String(item || '').trim().toLowerCase();
        if (ACCESS_STAGE_KEYS.includes(key)) stages[key] = true;
      }
    });
    return stages;
  }

  if (parsed && typeof parsed === 'object') {
    Object.entries(parsed).forEach(([k, v]) => {
      const normKey = String(k || '').trim().toLowerCase();
      if (ACCESS_STAGE_KEYS.includes(normKey)) {
        stages[normKey] = (v === true || v === 1 || v === '1' || String(v).toLowerCase() === 'true');
      }
    });
  }

  return stages;
}

function parseMaterialAccessField(raw) {
  const allowed = new Set();
  if (!raw) return allowed;

  let parsed = raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return allowed;
    try {
      parsed = JSON.parse(trimmed);
    } catch (e) {
      return allowed;
    }
  }

  const addIfValid = (val) => {
    const m = String(val || '').match(/(\d+)/);
    if (m) {
      const num = parseInt(m[1], 10);
      if (num >= 1 && num <= 5) allowed.add(num);
    }
  };

  if (Array.isArray(parsed)) {
    parsed.forEach(addIfValid);
    return allowed;
  }

  if (parsed && typeof parsed === 'object') {
    Object.entries(parsed).forEach(([k, v]) => {
      const enabled = (v === true || v === 1 || v === '1' || String(v).toLowerCase() === 'true');
      if (enabled) addIfValid(k);
    });
  }

  return allowed;
}

function applyClassAccessRow(row, kelas = '', sekolah = '') {
  if (!row || typeof row !== 'object') {
    return resetClassAccessToLocked(kelas, sekolah);
  }
  classAccessState = {
    loaded: true,
    kelas: row.kelas || kelas,
    sekolah: row.sekolah || sekolah,
    stages: parseStageAccessField(row.tahap_diizinkan),
    materials: parseMaterialAccessField(row.materi_diizinkan)
  };
  return classAccessState;
}

async function syncClassAccessPermissions() {
  const { kelas, sekolah } = getAccessStudentContext();
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  if (!kelas || !sekolah || !api || typeof api.getWhere !== 'function') {
    return resetClassAccessToLocked(kelas, sekolah);
  }

  try {
    const res = await api.getWhere('hak_akses', { kelas, sekolah });
    const rawList = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
    const matched = rawList.filter(r =>
      r &&
      String(r.kelas || '').trim().toLowerCase() === kelas.toLowerCase() &&
      String(r.sekolah || '').trim().toLowerCase() === sekolah.toLowerCase()
    );

    if (matched.length === 0) {
      resetClassAccessToLocked(kelas, sekolah);
      classAccessState.loaded = true;
      return classAccessState;
    }

    const activeRow = matched[matched.length - 1];
    return applyClassAccessRow(activeRow, kelas, sekolah);
  } catch (err) {
    console.warn('[syncClassAccessPermissions] Gagal memuat hak_akses kelas:', err);
    return resetClassAccessToLocked(kelas, sekolah);
  }
}

function isTeacherPreviewAccount() {
  const st = (typeof window !== 'undefined' && window.ecoStudent) ||
             (typeof ecoStudent !== 'undefined' ? ecoStudent : {});
  const absen = String(
    (st && st.absen) ||
    (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentNumber')) ||
    ''
  ).trim();
  return absen === '9999';
}

function isStageAllowed(stageIndex) {
  if (isTeacherPreviewAccount()) return true;
  const idx = Number(stageIndex);
  if (idx === 5) return true; // Tahap 6 memakai validasi progres tersendiri
  const key = ACCESS_STAGE_KEYS[idx];
  if (!key) return false;
  return Boolean(classAccessState.stages[key]);
}

function normalizeAccessMaterialNo(materiInput) {
  if (typeof materiInput === 'number' && Number.isFinite(materiInput)) return Math.floor(materiInput);
  const m = String(materiInput || '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function isMaterialAllowed(materiInput) {
  if (isTeacherPreviewAccount()) return true;
  const num = normalizeAccessMaterialNo(materiInput);
  if (!num || num < 1 || num > 5) return false;
  return classAccessState.materials.has(num);
}

function getAllowedStageLabels() {
  return ACCESS_STAGE_KEYS
    .map((key, idx) => (classAccessState.stages[key] ? ACCESS_STAGE_LABELS[idx] : null))
    .filter(Boolean);
}

function getAllowedMaterialNumbers() {
  return ACCESS_MATERIAL_LIST.filter(m => classAccessState.materials.has(m));
}

function getFirstAllowedMaterial() {
  const list = getAllowedMaterialNumbers();
  return list.length > 0 ? list[0] : null;
}

function recheckClassAccessOnNoticeClose() {
  return syncClassAccessPermissions().catch(err => {
    console.warn('[recheckClassAccessOnNoticeClose] Gagal memperbarui hak_akses:', err);
  });
}

function displayAccessBlockedNotice(msg, title, desc) {
  const noticeFn = (typeof showStageNoticeError === 'function')
    ? showStageNoticeError
    : ((typeof window !== 'undefined' && typeof window.showStageNoticeError === 'function') ? window.showStageNoticeError : null);

  if (noticeFn) {
    noticeFn(msg, title, desc, recheckClassAccessOnNoticeClose);
  } else if (typeof showLoadingError === 'function') {
    showLoadingError(msg, title);
  }
  return msg;
}

function showStageBlockedNotice() {
  const allowed = getAllowedStageLabels();
  const msg = allowed.length > 0
    ? `Kamu hanya bisa membuka ${allowed.join(', ')}`
    : 'Saat ini belum ada tahap yang dibuka oleh guru untuk kelasmu.';
  return displayAccessBlockedNotice(
    msg,
    'Akses Diblokir',
    'Hak akses tahap pembelajaran diatur oleh guru untuk kelasmu:'
  );
}

function showMaterialBlockedNotice() {
  const allowed = getAllowedMaterialNumbers();
  const msg = allowed.length > 0
    ? `Kamu hanya bisa membuka materi ${allowed.join(', ')}`
    : 'Saat ini belum ada materi yang dibuka oleh guru untuk kelasmu.';
  return displayAccessBlockedNotice(
    msg,
    'Akses Diblokir',
    'Hak akses materi diatur oleh guru untuk kelasmu:'
  );
}

function guardStageAccess(stageIndex) {
  if (isStageAllowed(stageIndex)) return true;
  showStageBlockedNotice();
  return false;
}

function guardMaterialAccess(materiInput) {
  if (isMaterialAllowed(materiInput)) return true;
  showMaterialBlockedNotice();
  return false;
}

if (typeof window !== 'undefined') {
  window.ACCESS_STAGE_KEYS = ACCESS_STAGE_KEYS;
  window.ACCESS_STAGE_LABELS = ACCESS_STAGE_LABELS;
  window.ACCESS_MATERIAL_LIST = ACCESS_MATERIAL_LIST;
  window.resetClassAccessToLocked = resetClassAccessToLocked;
  window.applyClassAccessRow = applyClassAccessRow;
  window.syncClassAccessPermissions = syncClassAccessPermissions;
  window.isTeacherPreviewAccount = isTeacherPreviewAccount;
  window.isStageAllowed = isStageAllowed;
  window.isMaterialAllowed = isMaterialAllowed;
  window.getAllowedStageLabels = getAllowedStageLabels;
  window.getAllowedMaterialNumbers = getAllowedMaterialNumbers;
  window.getFirstAllowedMaterial = getFirstAllowedMaterial;
  window.showStageBlockedNotice = showStageBlockedNotice;
  window.showMaterialBlockedNotice = showMaterialBlockedNotice;
  window.guardStageAccess = guardStageAccess;
  window.guardMaterialAccess = guardMaterialAccess;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ACCESS_STAGE_KEYS,
    ACCESS_STAGE_LABELS,
    ACCESS_MATERIAL_LIST,
    parseStageAccessField,
    parseMaterialAccessField,
    resetClassAccessToLocked,
    applyClassAccessRow,
    syncClassAccessPermissions,
    isTeacherPreviewAccount,
    isStageAllowed,
    isMaterialAllowed,
    getAllowedStageLabels,
    getAllowedMaterialNumbers,
    getFirstAllowedMaterial,
    showStageBlockedNotice,
    showMaterialBlockedNotice,
    guardStageAccess,
    guardMaterialAccess
  };
}

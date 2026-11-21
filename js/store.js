/**
 * EcoMedia RADEC - Storage Layer
 * Mengelola semua persistensi localStorage dan escape utility secara terpusat.
 */

const STORAGE_KEYS = {
  studentId: 'ecoRadecStudentID',
  name: 'ecoRadecStudentName',
  kelas: 'ecoRadecStudentClass',
  number: 'ecoRadecStudentNumber',
  school: 'ecoRadecStudentSchool',
  progress: 'ecoRadecProgress',
  progressId: 'ecoRadecProgressID',
  wonder: 'ecoReadWonderQuestions',
  answerEssay: 'ecoRadecAnswerEssay25',
  answerMeta: 'ecoRadecAnswerMetaRev1',
  discussAll: 'ecoRadecDiscussAllAnswersV4',
  discussMeta: 'ecoRadecDiscussMetaV4',
  discussStructured: 'ecoRadecDiscussStructuredRev3',
  discussWonder: 'ecoRadecWonderDiscussRev2',
  explainAll: 'ecoRadecExplainAllAnswersV4',
  explainMeta: 'ecoRadecExplainMetaV4',
  explainStructured: 'ecoRadecExplainStructuredRev1',
  compareReflection: 'ecoRadecDiscussExplainReflectionV4',
  actionProject: 'ecoActionProject',
  finalReflection: 'ecoFinalReflection',
  finishReflection: 'ecoRadecFinishReflectionV6',
  lopezLens: 'ecoRadecLopezLensRev1',
  lopezDiscuss: 'ecoRadecLopezDiscussRev1',
  lopezCreateCheck: 'ecoRadecLopezCreateCheckRev1',
  currentStep: 'ecoRadecCurrentStep'
};

const store = {
  read(key, fallback = {}) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn(`[store.read] Error reading key "${key}":`, e);
      return fallback;
    }
  },

  write(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (e) {
      console.error(`[store.write] Error writing key "${key}":`, e);
      return false;
    }
  },

  readString(key, fallback = '') {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? item : fallback;
    } catch (e) {
      return fallback;
    }
  },

  writeString(key, val) {
    try {
      localStorage.setItem(key, String(val));
      return true;
    } catch (e) {
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  },

  clear() {
    try {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      return true;
    } catch (e) {
      return false;
    }
  },

  escapeHtml(val) {
    return String(val || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};

// Aliases for backward compatibility with legacy scripts
const ecoSafeRead = (k) => store.read(k);
const ecoSafeWrite = (k, v) => store.write(k, v);
const radecV4Read = (k) => store.read(k);
const radecV4Write = (k, v) => store.write(k, v);
const radecV4Esc = (v) => store.escapeHtml(v);
const discussReadStore = (k) => store.read(k);
const discussWriteStore = (k, v) => store.write(k, v);
const explainReadStore = (k) => store.read(k);
const explainWriteStore = (k, v) => store.write(k, v);

// Expose constants to global window
const ECO_KEYS = {
  studentId: STORAGE_KEYS.studentId,
  name: STORAGE_KEYS.name,
  kelas: STORAGE_KEYS.kelas,
  number: STORAGE_KEYS.number,
  school: STORAGE_KEYS.school,
  progress: STORAGE_KEYS.progress,
  currentStep: STORAGE_KEYS.currentStep
};
const ANSWER_ESSAY25_KEY = STORAGE_KEYS.answerEssay;
const ANSWER_META_KEY = STORAGE_KEYS.answerMeta;
const RADEC_DISCUSS_ALL_V4 = STORAGE_KEYS.discussAll;
const RADEC_DISCUSS_META_V4 = STORAGE_KEYS.discussMeta;
const RADEC_DISCUSS_KEY = STORAGE_KEYS.discussStructured;
const RADEC_EXPLAIN_ALL_V4 = STORAGE_KEYS.explainAll;
const RADEC_EXPLAIN_META_V4 = STORAGE_KEYS.explainMeta;
const RADEC_EXPLAIN_KEY = STORAGE_KEYS.explainStructured;
const RADEC_COMPARE_REFLECTION_V4 = STORAGE_KEYS.compareReflection;
const FINISH_KEY = STORAGE_KEYS.finishReflection;
const WONDER_KEY = STORAGE_KEYS.wonder;
const ECO_LOPEZ_LENS_KEY = STORAGE_KEYS.lopezLens;
const ECO_DISCUSS_LENS_KEY = STORAGE_KEYS.lopezDiscuss;
const ECO_CREATE_CHECK_KEY = STORAGE_KEYS.lopezCreateCheck;

if (typeof window !== 'undefined') {
  window.STORAGE_KEYS = STORAGE_KEYS;
  window.store = store;
  window.ecoSafeRead = ecoSafeRead;
  window.ecoSafeWrite = ecoSafeWrite;
  window.radecV4Read = radecV4Read;
  window.radecV4Write = radecV4Write;
  window.radecV4Esc = radecV4Esc;
  window.discussReadStore = discussReadStore;
  window.discussWriteStore = discussWriteStore;
  window.explainReadStore = explainReadStore;
  window.explainWriteStore = explainWriteStore;
  window.ECO_KEYS = ECO_KEYS;
  window.ANSWER_ESSAY25_KEY = ANSWER_ESSAY25_KEY;
  window.ANSWER_META_KEY = ANSWER_META_KEY;
  window.RADEC_DISCUSS_ALL_V4 = RADEC_DISCUSS_ALL_V4;
  window.RADEC_DISCUSS_META_V4 = RADEC_DISCUSS_META_V4;
  window.RADEC_DISCUSS_KEY = RADEC_DISCUSS_KEY;
  window.RADEC_EXPLAIN_ALL_V4 = RADEC_EXPLAIN_ALL_V4;
  window.RADEC_EXPLAIN_META_V4 = RADEC_EXPLAIN_META_V4;
  window.RADEC_EXPLAIN_KEY = RADEC_EXPLAIN_KEY;
  window.RADEC_COMPARE_REFLECTION_V4 = RADEC_COMPARE_REFLECTION_V4;
  window.FINISH_KEY = FINISH_KEY;
  window.WONDER_KEY = WONDER_KEY;
  window.ECO_LOPEZ_LENS_KEY = ECO_LOPEZ_LENS_KEY;
  window.ECO_DISCUSS_LENS_KEY = ECO_DISCUSS_LENS_KEY;
  window.ECO_CREATE_CHECK_KEY = ECO_CREATE_CHECK_KEY;
}

/**
 * EcoMedia RADEC - ANSWER Module (Tahap 2: Menjawab Soal Pra-Pembelajaran)
 * Mengelola 25 soal esai, auto-save jawaban, keyakinan pemahaman, penandaan diskusi kelompok,
 * dan evaluasi NLP berbasis Universal Sentence Encoder (USE) serta Keyword Matching dengan sinkronisasi server (Tabel 'answer').
 */

let answerEssayState = {};
let answerMetaState = {};
let answerNlpState = {}; // { [idx]: { score: number, updatedAt: string } }
let answerSyncState = {}; // { [idx]: { syncedAt: string, id_answer?: any } }
let _answerSyncTimers = {};
let _lastAnswerStudentId = '';
let answerEssayMaterial = 1;

/**
 * ══════════════════════════════════════════════════════════════════════
 * KONFIGURASI ENGINE EVALUASI NLP (PILIHAN MODUL PENILAIAN)
 * ══════════════════════════════════════════════════════════════════════
 * Ubah nilai konstanta NLP_ENGINE_MODE di bawah untuk memilih modul evaluasi:
 * 
 * 1. 'enhanced-js' : [Rekomendasi Utama untuk SD & Sekolah]
 *                    Enhanced JS Engine + Kamus Konsep Sains + Stemmer Bahasa Indonesia
 *                    - Ukuran: ~15 KB (0 MB unduhan eksternal).
 *                    - Waktu Muat: Instan (0 detik), 100% Offline.
 *                    - Nilai Semantik: Tinggi & Terarah (mengenali sinonim konsep 5 materi).
 * 
 * 2. 'use'         : Deep Learning Universal Sentence Encoder Standar
 *                    - Ukuran: ~30 MB (TensorFlow.js CDN).
 *                    - Dilengkapi caching 2 jam dan batas waktu timeout 15 detik.
 * 
 * 3. 'use-lite'    : Deep Learning Universal Sentence Encoder Lite
 *                    - Ukuran: ~12 MB (TensorFlow.js USE Lite CDN).
 *                    - Dilengkapi caching 2 jam dan batas waktu timeout 15 detik.
 * 
 * SIFAT KONSISTENSI (STRICT):
 * Mode yang dipilih berlaku mutlak pada saat pembukaan halaman maupun saat penekanan
 * tombol "Periksa Jawaban", tanpa perpindahan modul otomatis demi menjaga keadilan
 * dan konsistensi penilaian antar-siswa.
 */
window.NLP_ENGINE_MODE = 'use'; // 'use' | 'use-lite' | 'enhanced-js' 
let NLP_ENGINE_MODE = (typeof window !== 'undefined' && window.NLP_ENGINE_MODE) ? window.NLP_ENGINE_MODE : 'use';

/**
 * ══════════════════════════════════════════════════════════
 * PENGATURAN KONTROL PRAMUAT & CACHE NLP:
 * ══════════════════════════════════════════════════════════
 * Anda dapat mengaktifkan kembali fitur ini kapan saja:
 * 
 * 1. ENABLE_NLP_PRELOAD :
 *    - true  : Mengaktifkan pramuat latar belakang (pasca-login & tahap ANSWER).
 *    - false : [NON-AKTIF] Pemuatan murni HANYA saat tombol "Periksa Jawaban" ditekan.
 * 
 * 2. ENABLE_NLP_CACHE :
 *    - true  : Menyimpan model di memori RAM/GPU selama 2 jam.
 *    - false : [NON-AKTIF] Model dibersihkan setelah evaluasi untuk mencegah browser freeze.
 */

let ENABLE_NLP_PRELOAD = (typeof window !== 'undefined' && typeof window.ENABLE_NLP_PRELOAD === 'boolean') ? window.ENABLE_NLP_PRELOAD : false;
let ENABLE_NLP_CACHE = (typeof window !== 'undefined' && typeof window.ENABLE_NLP_CACHE === 'boolean') ? window.ENABLE_NLP_CACHE : false;

const USE_CACHE_DURATION_MS = 2 * 60 * 60 * 1000; // 2 jam (7.200.000 ms)
const USE_LOAD_TIMEOUT_MS = 60 * 1000; // 60 detik timeout pemuatan saat tombol periksa ditekan
const USE_PRELOAD_TIMEOUT_MS = 90 * 1000; // 90 detik timeout pemuatan silent background pasca-login (jika aktif)

let _ecoUseModel = null;
let _ecoUseModelLoadedAt = 0;
let _ecoUseModelMode = '';
let _isModelLoading = false;
let _modelLoadPromise = null;

let _isSilentPreloading = false;
let _silentPreloadCancelToken = null;
let _silentPreloadPromise = null;

function setNlpEngineMode(mode) {
  if (['enhanced-js', 'use', 'use-lite'].includes(mode)) {
    NLP_ENGINE_MODE = mode;
    return true;
  }
  console.warn('[setNlpEngineMode] Mode tidak dikenal:', mode);
  return false;
}

function setNlpPreloadEnabled(enabled) {
  ENABLE_NLP_PRELOAD = !!enabled;
  if (typeof window !== 'undefined') window.ENABLE_NLP_PRELOAD = ENABLE_NLP_PRELOAD;
  return ENABLE_NLP_PRELOAD;
}

function setNlpCacheEnabled(enabled) {
  ENABLE_NLP_CACHE = !!enabled;
  if (typeof window !== 'undefined') window.ENABLE_NLP_CACHE = ENABLE_NLP_CACHE;
  if (!ENABLE_NLP_CACHE) {
    destroyUSEModelCache();
  }
  return ENABLE_NLP_CACHE;
}

function loadAnswerEssayState() {
  const essayKey = typeof ANSWER_ESSAY25_KEY !== 'undefined' ? ANSWER_ESSAY25_KEY : 'ecoRadecAnswerEssay25';
  const metaKey = typeof ANSWER_META_KEY !== 'undefined' ? ANSWER_META_KEY : 'ecoRadecAnswerMetaRev1';
  const nlpKey = typeof ANSWER_NLP_KEY !== 'undefined' ? ANSWER_NLP_KEY : 'ecoRadecAnswerNlpRev1';

  if (typeof store !== 'undefined' && store.read) {
    answerEssayState = store.read(essayKey, {});
    answerMetaState = store.read(metaKey, {});
    answerNlpState = store.read(nlpKey, {});
  } else {
    try {
      answerEssayState = JSON.parse(localStorage.getItem(essayKey) || '{}') || {};
    } catch (e) {
      answerEssayState = {};
    }
    try {
      answerMetaState = JSON.parse(localStorage.getItem(metaKey) || '{}') || {};
    } catch (e) {
      answerMetaState = {};
    }
    try {
      answerNlpState = JSON.parse(localStorage.getItem(nlpKey) || '{}') || {};
    } catch (e) {
      answerNlpState = {};
    }
  }
}

function saveAnswerEssayState() {
  const essayKey = typeof ANSWER_ESSAY25_KEY !== 'undefined' ? ANSWER_ESSAY25_KEY : 'ecoRadecAnswerEssay25';
  const metaKey = typeof ANSWER_META_KEY !== 'undefined' ? ANSWER_META_KEY : 'ecoRadecAnswerMetaRev1';
  const nlpKey = typeof ANSWER_NLP_KEY !== 'undefined' ? ANSWER_NLP_KEY : 'ecoRadecAnswerNlpRev1';

  if (typeof store !== 'undefined' && store.write) {
    store.write(essayKey, answerEssayState);
    store.write(metaKey, answerMetaState);
    store.write(nlpKey, answerNlpState);
  } else {
    try { localStorage.setItem(essayKey, JSON.stringify(answerEssayState)); } catch (e) {}
    try { localStorage.setItem(metaKey, JSON.stringify(answerMetaState)); } catch (e) {}
    try { localStorage.setItem(nlpKey, JSON.stringify(answerNlpState)); } catch (e) {}
  }
  updateAnswerEssayProgress();
}

function answerQuestionPosition(idx) {
  return idx % 5;
}

function answerChallenge(idx) {
  const list = (typeof window !== 'undefined' && window.ANSWER_CHALLENGE) || [
    { label: 'Amati & Hubungkan', cls: '', icon: '🔎' },
    { label: 'Analisis Hubungan', cls: '', icon: '🔗' },
    { label: 'Nilai Gagasan', cls: '', icon: '⚖️' },
    { label: 'Jelaskan Alasan', cls: '', icon: '💭' },
    { label: 'Ide Kreatif', cls: 'creative', icon: '💡' }
  ];
  return list[answerQuestionPosition(idx)] || list[0];
}

function answerSetConfidence(idx, val) {
  answerMetaState[idx] = answerMetaState[idx] || {};
  answerMetaState[idx].confidence = val;
  saveAnswerEssayState();
  renderAnswerEssay();
  scheduleServerAnswerSync(idx, answerEssayState[idx] || '');
}

function answerToggleDiscussFlag(idx) {
  answerMetaState[idx] = answerMetaState[idx] || {};
  answerMetaState[idx].flagged = !answerMetaState[idx].flagged;
  saveAnswerEssayState();
  renderAnswerEssay();
  scheduleServerAnswerSync(idx, answerEssayState[idx] || '');
}

function answerMeta(idx) {
  return answerMetaState[idx] || {};
}

function answerEssayQuestions(m) {
  if (typeof getQuestionsByMaterial === 'function') return getQuestionsByMaterial(m);
  if (typeof window !== 'undefined' && typeof window.getQuestionsByMaterial === 'function') {
    return window.getQuestionsByMaterial(m);
  }
  const questions = (typeof window !== 'undefined' && window.ANSWER_ESSAY25) || [];
  return questions.map((q, i) => ({ ...q, idx: i })).filter(q => q.mat === Number(m));
}

// ══════════════════════════════════════════════════════════
// MODUL 1: ENHANCED JS SEMANTIC ENGINE & KAMUS KONSEP SAINS
// ══════════════════════════════════════════════════════════

/**
 * Stemmer Ringan Bahasa Indonesia
 * Menghasilkan token kata dasar (lemma candidates) untuk menangani variasi afiksasi.
 */
function stemKataIndonesia(kata) {
  if (!kata || kata.length <= 3) return [kata];
  let s = kata.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (s.length <= 3) return [s];

  const results = new Set([s]);

  // Klitis & Sufiks
  const withoutSuffix = s.replace(/(kah|lah|pun|nya|ku|mu)$/, '').replace(/(kan|an|i)$/, '');
  results.add(withoutSuffix);

  // Prefiks
  if (withoutSuffix.startsWith('meng') || withoutSuffix.startsWith('peng')) {
    const r = withoutSuffix.slice(4);
    results.add(r);
    results.add('k' + r);
  } else if (withoutSuffix.startsWith('meny') || withoutSuffix.startsWith('peny')) {
    results.add('s' + withoutSuffix.slice(4));
    results.add(withoutSuffix.slice(4));
  } else if (withoutSuffix.startsWith('mem') || withoutSuffix.startsWith('pem')) {
    const r = withoutSuffix.slice(3);
    results.add(r);
    results.add('p' + r);
  } else if (withoutSuffix.startsWith('men') || withoutSuffix.startsWith('pen')) {
    const r = withoutSuffix.slice(3);
    results.add(r);
    results.add('t' + r);
  } else if (withoutSuffix.startsWith('me') || withoutSuffix.startsWith('pe')) {
    results.add(withoutSuffix.slice(2));
  } else if (withoutSuffix.startsWith('ber') || withoutSuffix.startsWith('per') || withoutSuffix.startsWith('ter')) {
    results.add(withoutSuffix.slice(3));
  } else if (withoutSuffix.startsWith('di') || withoutSuffix.startsWith('ke') || withoutSuffix.startsWith('se')) {
    results.add(withoutSuffix.slice(2));
  }

  return Array.from(results).filter(x => x.length >= 2);
}

/**
 * Kamus Sinonim & Klaster Konsep Sains RADEC (SD Kelas V)
 * Mencakup domain konsep 5 materi: Cuaca/Iklim, Efek Rumah Kaca, Penyebab, Dampak, Mitigasi.
 */
const KAMUS_KONSEP_SAINS = {
  suhu_dingin: ['dingin', 'sejuk', 'adem', 'rendah', 'turun', 'tidak panas', 'kurang panas'],
  suhu_panas: ['panas', 'hangat', 'terik', 'gerah', 'tinggi', 'naik', 'membara', 'menyengat'],
  waktu_singkat: ['singkat', 'sebentar', 'hitungan jam', 'hari ini', 'pagi siang', 'cepat', 'sesaat', 'seketika', 'harian', 'hari sama', 'jam'],
  waktu_lama: ['lama', 'puluhan tahun', 'jangka panjang', 'bertahun', 'tahunan', '30 tahun', 'historis', 'panjang', 'periode lama'],
  cuaca_konsep: ['cuaca', 'harian', 'kondisi sesaat', 'tempat sempit', 'waktu pendek', 'hari itu'],
  iklim_konsep: ['iklim', 'rata-rata', 'jangka panjang', 'wilayah luas', 'puluhan tahun', 'pola umum'],
  resapan_air: ['resap', 'serap', 'infiltrasi', 'masuk tanah', 'pori', 'akar', 'tanah terbuka', 'tampung air'],
  aliran_parit: ['parit', 'got', 'selokan', 'saluran', 'drainase', 'aliran', 'jalan air', 'gorong'],
  tersumbat_halangan: ['sumbat', 'mampet', 'timbun sampah', 'sampah', 'kotoran', 'tertutup beton', 'beton', 'semen', 'buntu', 'halang'],
  surut_lancar: ['surut', 'cepat hilang', 'tidak banjir', 'kering', 'lancar', 'mengalir cepat'],
  genang_banjir: ['genang', 'tergenang', 'banjir', 'becek', 'lama surut', 'air diam', 'meluap'],
  selimut_penahan: ['selimut', 'perangkap', 'jebak', 'tahan panas', 'tahan radiasi', 'pantul kembali', 'tangkap panas'],
  gas_rumah_kaca: ['gas rumah kaca', 'karbon dioksida', 'co2', 'metana', 'uap air', 'emisi', 'asap'],
  fotosintesis_tanaman: ['makanan tanaman', 'fotosintesis', 'masak makanan', 'tumbuh subur', 'klorofil', 'olah nutrisi'],
  bahan_bakar_fosil: ['bensin', 'batu bara', 'minyak bumi', 'solar', 'kendaraan', 'pembangkit', 'listrik', 'asap motor', 'bbm', 'fosil'],
  tebang_pohon: ['tebang', 'babat', 'gundul', 'hilang pohon', 'rusak hutan', 'deforestasi', 'pohon berkurang'],
  bakar_sampah_lahan: ['bakar', 'api', 'asap pembakaran', 'jelaga', 'abu', 'kebakaran'],
  hemat_energi: ['hemat listrik', 'matikan lampu', 'cabut colokan', 'hemat energi', 'sepeda', 'jalan kaki', 'kurangi kendaraan'],
  pupuk_organik: ['kompos', 'organik', 'pupuk kandang', 'sisa sayur', 'daun kering', 'mulsa', 'humus'],
  kelola_sampah: ['plastik', 'anorganik', 'daur ulang', 'pilah sampah', '3r', 'reduce', 'reuse', 'recycle', 'kurangi sampah'],
  cuaca_ekstrem: ['ekstrem', 'deras sekali', 'kemarau panjang', 'kekeringan', 'puting beliung', 'badai', 'tidak menentu', 'musim bergeser']
};

/**
 * Mencari apakah sebuah kata atau kelompok kata memiliki padanan di KAMUS_KONSEP_SAINS
 */
function cariPadananKonsep(kata) {
  const k = kata.toLowerCase().trim();
  for (const daftar of Object.values(KAMUS_KONSEP_SAINS)) {
    if (daftar.some(item => k.includes(item) || item.includes(k))) {
      return daftar;
    }
  }
  return [k];
}

/**
 * Engine Evaluasi Enhanced JS + Kamus Konsep Sains
 * Menilai pemenuhan konsep semantik sains, kata kunci, dan kedalaman elaborasi siswa.
 */
function evaluateEnhancedJSSemantic(studentText, idSoal, refData) {
  if (!studentText || studentText.trim().length < 5) {
    return { score: 0.0, conceptScore: 0.0, keywordScore: 0.0, elaborationScore: 0.0 };
  }
  if (!refData) {
    return { score: 50.0, conceptScore: 50.0, keywordScore: 50.0, elaborationScore: 50.0 };
  }

  const textLower = studentText.toLowerCase();
  const rawWords = textLower.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length >= 2);
  const allCandidateTokens = new Set(rawWords);
  rawWords.forEach(w => {
    stemKataIndonesia(w).forEach(stemmed => allCandidateTokens.add(stemmed));
  });
  const textPool = textLower + ' ' + Array.from(allCandidateTokens).join(' ');

  // 1. Evaluasi Konsep & Sinonim Sains (Bobot 50%)
  const targetConcepts = new Set();
  (refData.kata_kunci || []).forEach(kw => {
    kw.toLowerCase().split(/\s+/).forEach(w => {
      if (w.length >= 3 && !['dan', 'yang', 'dari', 'atau', 'pada', 'ke', 'ini', 'itu'].includes(w)) {
        targetConcepts.add(w);
      }
    });
  });

  let conceptMatched = 0;
  const targetList = Array.from(targetConcepts);
  if (targetList.length > 0) {
    targetList.forEach(target => {
      const synonyms = cariPadananKonsep(target);
      const isFound = synonyms.some(syn => textPool.includes(syn.toLowerCase())) ||
                      Array.from(allCandidateTokens).some(tok => synonyms.includes(tok));
      if (isFound) {
        conceptMatched += 1;
      }
    });
  }
  const conceptScore = targetList.length > 0 ? Math.min(1.0, conceptMatched / targetList.length) : 0.7;

  // 2. Evaluasi Kata Kunci Frasa (Bobot 30%)
  const keywords = refData.kata_kunci || [];
  let keywordMatched = 0;
  if (keywords.length > 0) {
    keywords.forEach(kw => {
      const kwLower = kw.toLowerCase().trim();
      if (textLower.includes(kwLower)) {
        keywordMatched += 1.0;
      } else {
        const tokens = kwLower.split(/\s+/).filter(w => w.length >= 3);
        if (tokens.length > 0) {
          const matchCount = tokens.filter(tok => {
            const padanan = cariPadananKonsep(tok);
            return padanan.some(p => textPool.includes(p));
          }).length;
          if (matchCount / tokens.length >= 0.5) {
            keywordMatched += 0.8;
          }
        }
      }
    });
  }
  const keywordScore = keywords.length > 0 ? Math.min(1.0, keywordMatched / keywords.length) : 0.7;

  // 3. Evaluasi Elaborasi & Kualitas Penalaran (Bobot 20%)
  const conjunctions = ['karena', 'sebab', 'sehingga', 'akibat', 'oleh karena itu', 'sedangkan', 'tetapi', 'namun', 'maka'];
  const hasConjunction = conjunctions.filter(c => textLower.includes(c)).length;
  const lengthScore = rawWords.length >= 20 ? 1.0 : (rawWords.length >= 10 ? 0.75 : rawWords.length / 10);
  const elaborationScore = Math.min(1.0, (lengthScore * 0.6) + (hasConjunction > 0 ? 0.4 : 0.1));

  // Nilai gabungan
  const combined = (conceptScore * 0.50) + (keywordScore * 0.30) + (elaborationScore * 0.20);
  const finalScore = parseFloat((Math.max(0.1, Math.min(1.0, combined)) * 100).toFixed(1));

  return {
    score: finalScore,
    conceptScore: parseFloat((conceptScore * 100).toFixed(1)),
    keywordScore: parseFloat((keywordScore * 100).toFixed(1)),
    elaborationScore: parseFloat((elaborationScore * 100).toFixed(1))
  };
}

// ══════════════════════════════════════════════════════════
// MODUL 2 & 3: DEEP LEARNING USE & USE-LITE (TENSORFLOW.JS)
// ══════════════════════════════════════════════════════════

const ECO_NLP_MODEL_META_KEY = 'eco_use_model_meta';

/**
 * Menghasilkan skema URI IndexedDB sesuai mode model.
 * - 'use'      -> 'indexeddb://eco-use-model'
 * - 'use-lite' -> 'indexeddb://eco-use-lite-model'
 */
function getIndexedDbModelUrl(mode = 'use') {
  return mode === 'use-lite' ? 'indexeddb://eco-use-lite-model' : 'indexeddb://eco-use-model';
}

/**
 * Poin 1: Membaca metadata model NLP dari localStorage.
 * Mengembalikan objek metadata { modelName, modelMode, indexedDbKey, savedAt, version } atau null jika tidak ada.
 */
function getNlpModelMeta(mode = 'use') {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(`${ECO_NLP_MODEL_META_KEY}_${mode}`) || localStorage.getItem(ECO_NLP_MODEL_META_KEY);
    if (!raw) return null;
    const meta = JSON.parse(raw);
    if (meta && typeof meta === 'object') {
      return meta;
    }
    return null;
  } catch (err) {
    console.warn('[getNlpModelMeta] Gagal membaca metadata localStorage:', err);
    return null;
  }
}

/**
 * Poin 1: Menyimpan metadata model NLP ke localStorage saat model berhasil disimpan ke IndexedDB.
 */
function saveNlpModelMeta(mode = 'use') {
  try {
    if (typeof localStorage === 'undefined') return;
    const idbKey = getIndexedDbModelUrl(mode);
    const meta = {
      modelName: mode === 'use-lite' ? 'eco-use-lite-model' : 'eco-use-model',
      modelMode: mode,
      indexedDbKey: idbKey,
      savedAt: Date.now(),
      version: '1.0.0'
    };
    const serialized = JSON.stringify(meta);
    localStorage.setItem(`${ECO_NLP_MODEL_META_KEY}_${mode}`, serialized);
    localStorage.setItem(ECO_NLP_MODEL_META_KEY, serialized);
  } catch (err) {
    console.warn('[saveNlpModelMeta] Gagal menyimpan metadata ke localStorage:', err);
  }
}

/**
 * Poin 5: Menghapus metadata model NLP dari localStorage.
 */
function clearNlpModelMeta(mode = 'use') {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(`${ECO_NLP_MODEL_META_KEY}_${mode}`);
    localStorage.removeItem(ECO_NLP_MODEL_META_KEY);
  } catch (err) {
    console.warn('[clearNlpModelMeta] Gagal menghapus metadata dari localStorage:', err);
  }
}

/**
 * Poin 5: Menghapus model dari IndexedDB secara asinkron menggunakan TensorFlow.js tf.io.removeModel.
 */
async function removeModelFromIndexedDB(mode = 'use') {
  const idbKey = getIndexedDbModelUrl(mode);
  try {
    if (typeof tf !== 'undefined' && tf.io && typeof tf.io.removeModel === 'function') {
      await tf.io.removeModel(idbKey);
      console.log(`[removeModelFromIndexedDB] Sukses menghapus model ${mode} dari IndexedDB (${idbKey}).`);
    }
  } catch (err) {
    console.warn(`[removeModelFromIndexedDB] Catatan: Model tidak ditemukan atau gagal dihapus dari IndexedDB:`, err.message || err);
  }
  clearNlpModelMeta(mode);
}

/**
 * Poin 5 (Self-Healing Failsafe):
 * Mereset total status model (membersihkan RAM/GPU, menghapus IndexedDB, dan menghapus metadata localStorage).
 */
async function purgeNlpModelStorage(mode = NLP_ENGINE_MODE) {
  console.log(`[purgeNlpModelStorage] Menjalankan pembersihan total model ${mode}...`);
  destroyUSEModelCache();
  await removeModelFromIndexedDB(mode);
  clearNlpModelMeta(mode);
}

/**
 * Menghancurkan cache model USE lama (membersihkan memori RAM/GPU & reset timestamp).
 * CATATAN OPSI B: Fungsi ini HANYA membersihkan RAM, TIDAK menghapus file di IndexedDB.
 */
function destroyUSEModelCache() {
  if (_ecoUseModel) {
    try {
      if (typeof _ecoUseModel.dispose === 'function') {
        _ecoUseModel.dispose();
      }
    } catch (e) {
      console.warn('[destroyUSEModelCache] Gagal mendispose model lama:', e);
    }
  }
  _ecoUseModel = null;
  _ecoUseModelLoadedAt = 0;
  _ecoUseModelMode = '';
  _modelLoadPromise = null;
  _isSilentPreloading = false;
  _silentPreloadCancelToken = null;
  _silentPreloadPromise = null;
}

/**
 * Mendapatkan status cache model saat ini (untuk keperluan diagnostik & testing).
 */
function getEcoUseModelCacheState() {
  const meta = getNlpModelMeta(NLP_ENGINE_MODE);
  return {
    mode: NLP_ENGINE_MODE,
    model: _ecoUseModel,
    loadedAt: _ecoUseModelLoadedAt,
    isLoading: _isModelLoading,
    isSilentPreloading: _isSilentPreloading,
    preloadEnabled: ENABLE_NLP_PRELOAD,
    cacheEnabled: ENABLE_NLP_CACHE,
    durationMs: USE_CACHE_DURATION_MS,
    timeoutMs: USE_LOAD_TIMEOUT_MS,
    preloadTimeoutMs: USE_PRELOAD_TIMEOUT_MS,
    metadata: meta,
    hasIndexedDbModel: !!meta
  };
}

/**
 * Memuat model Universal Sentence Encoder (USE / USE-Lite) dengan timeout dan pembatalan (abort).
 * Mendukung arsitektur Persistent Model Cache (IndexedDB + localStorage) dengan Opsi B:
 * - Jika sudah ada di IndexedDB, dimuat instan dari SSD/HDD lokal (1-2s).
 * - Jika belum ada, diunduh sekali dari CDN lalu disimpan permanen di IndexedDB.
 * - Cache memori RAM/GPU dibersihkan setelah 2 jam untuk mencegah freeze/memory leak,
 *   namun file fisik di IndexedDB tetap utuh.
 *
 * @param {string} mode - 'use' atau 'use-lite'
 * @param {boolean} forceReload - Paksa muat ulang model (menghapus IndexedDB & metadata)
 * @param {number} timeoutMs - Batas waktu timeout dalam ms (default 60.000 ms)
 * @param {object} cancelToken - Token pembatalan { isCancelled: boolean }
 */
async function getOrLoadUSEModel(mode = 'use', forceReload = false, timeoutMs = USE_LOAD_TIMEOUT_MS, cancelToken = null) {
  const now = Date.now();

  // 1. Periksa cache RAM yang cocok (hanya jika ENABLE_NLP_CACHE aktif)
  // Opsi B: Memori RAM aktif kedaluwarsa setelah 2 jam untuk mencegah penumpukan texture WebGL / browser freeze
  if (ENABLE_NLP_CACHE && !forceReload && _ecoUseModel && _ecoUseModelMode === mode && (now - _ecoUseModelLoadedAt < USE_CACHE_DURATION_MS)) {
    return _ecoUseModel;
  }

  // 2. Jika force reload atau ganti mode atau cache dinonaktifkan atau RAM sudah melebihi 2 jam:
  if (!ENABLE_NLP_CACHE || forceReload || (_ecoUseModel && (_ecoUseModelMode !== mode || now - _ecoUseModelLoadedAt >= USE_CACHE_DURATION_MS))) {
    destroyUSEModelCache();
    // Jika force reload eksplisit, bersihkan juga dari IndexedDB dan metadata
    if (forceReload) {
      await removeModelFromIndexedDB(mode);
      clearNlpModelMeta(mode);
    }
  }

  if (cancelToken && cancelToken.isCancelled) {
    throw new Error('Operasi pemuatan model dibatalkan.');
  }

  if (_modelLoadPromise) {
    return _modelLoadPromise;
  }

  _modelLoadPromise = (async () => {
    _isModelLoading = true;
    let timerId = null;
    try {
      const loadWithTimeout = async () => {
        if (cancelToken && cancelToken.isCancelled) {
          throw new Error('Operasi pemuatan model dibatalkan.');
        }

        // Script injection jika di browser
        if (typeof window !== 'undefined' && typeof document !== 'undefined' && document.createElement) {
          await loadScriptDynamic('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
          if (cancelToken && cancelToken.isCancelled) throw new Error('Operasi pemuatan model dibatalkan.');
          await loadScriptDynamic('https://cdn.jsdelivr.net/npm/@tensorflow-models/universal-sentence-encoder@1.3.3/dist/universal-sentence-encoder.min.js');
        }

        if (cancelToken && cancelToken.isCancelled) {
          throw new Error('Operasi pemuatan model dibatalkan.');
        }

        let loaded = null;
        const idbUrl = getIndexedDbModelUrl(mode);
        const meta = getNlpModelMeta(mode);

        // ──────────────────────────────────────────────────────────
        // Poin 3 (JALUR CEPAT): Coba Muat dari Disk Lokal (IndexedDB)
        // ──────────────────────────────────────────────────────────
        if (!forceReload && meta && typeof tf !== 'undefined' && tf.io && typeof tf.io.listModels === 'function') {
          try {
            const models = await tf.io.listModels();
            if (models && models[idbUrl]) {
              console.log(`[getOrLoadUSEModel] Menemukan model ${mode} di IndexedDB lokal (${idbUrl}). Memuat langsung dari disk SSD/HDD (1-2s)...`);
              if (typeof use !== 'undefined' && typeof use.load === 'function') {
                loaded = await use.load({ modelUrl: idbUrl });
                console.log(`[getOrLoadUSEModel] Sukses memuat model ${mode} dari IndexedDB secara instan!`);
              }
            }
          } catch (idbErr) {
            console.warn(`[getOrLoadUSEModel] Pemuatan dari IndexedDB (${idbUrl}) terkendala, beralih ke unduh CDN:`, idbErr);
            await removeModelFromIndexedDB(mode);
            clearNlpModelMeta(mode);
            loaded = null;
          }
        }

        // Mock test node jika ada
        if (!loaded && typeof window !== 'undefined' && window.__USE_TEST_MOCK__) {
          if (typeof window.__USE_TEST_MOCK_LOAD_FN__ === 'function') {
            loaded = await window.__USE_TEST_MOCK_LOAD_FN__(cancelToken);
          } else {
            loaded = {
              embed: async (texts) => ({ data: async () => new Float32Array([0.5, 0.5]), dispose: () => {} }),
              dispose: () => {}
            };
          }
        }

        // ──────────────────────────────────────────────────────────
        // Poin 2: Unduh dari CDN (Hanya Jika Belum Tersedia di IndexedDB)
        // ──────────────────────────────────────────────────────────
        if (!loaded) {
          if (typeof use !== 'undefined' && typeof use.load === 'function') {
            if (mode === 'use-lite') {
              try {
                loaded = await use.load({ modelUrl: 'https://tfhub.dev/google/tfjs-model/universal-sentence-encoder-lite/1/default/1' });
              } catch (liteErr) {
                console.warn('[USE-Lite] use.load dengan modelUrl gagal, menggunakan model default:', liteErr);
                loaded = await use.load();
              }
            } else {
              loaded = await use.load();
            }

            if (cancelToken && cancelToken.isCancelled) {
              if (loaded && typeof loaded.dispose === 'function') {
                try { loaded.dispose(); } catch (e) {}
              }
              throw new Error('Operasi pemuatan model dibatalkan.');
            }

            // Simpan model hasil unduhan ke IndexedDB secara permanen (Opsi B)
            if (loaded) {
              try {
                if (typeof loaded.save === 'function') {
                  await loaded.save(idbUrl);
                  saveNlpModelMeta(mode);
                  console.log(`[getOrLoadUSEModel] Model ${mode} berhasil disimpan secara permanen di IndexedDB (${idbUrl}).`);
                } else if (loaded.model && typeof loaded.model.save === 'function') {
                  await loaded.model.save(idbUrl);
                  saveNlpModelMeta(mode);
                  console.log(`[getOrLoadUSEModel] Model Graph ${mode} berhasil disimpan secara permanen di IndexedDB (${idbUrl}).`);
                }
              } catch (saveErr) {
                console.warn(`[getOrLoadUSEModel] Peringatan: Tidak dapat menyimpan model ke IndexedDB (tetap berjalan dari RAM):`, saveErr);
              }
            }
          } else if (!loaded) {
            throw new Error('Pustaka Universal Sentence Encoder (use) tidak tersedia di scope global.');
          }
        }

        if (cancelToken && cancelToken.isCancelled) {
          if (loaded && typeof loaded.dispose === 'function') {
            try { loaded.dispose(); } catch (e) {}
          }
          throw new Error('Operasi pemuatan model dibatalkan.');
        }
        return loaded;
      };

      const effectiveTimeout = (typeof timeoutMs === 'number' && timeoutMs > 0) ? timeoutMs : USE_LOAD_TIMEOUT_MS;
      const timeoutPromise = new Promise((_, reject) => {
        timerId = setTimeout(() => {
          reject(new Error(`Pemuatan model ${mode} melebihi batas waktu (${effectiveTimeout / 1000} detik). Periksa koneksi internet.`));
        }, effectiveTimeout);
      });

      const loadedModel = await Promise.race([loadWithTimeout(), timeoutPromise]);

      if (cancelToken && cancelToken.isCancelled) {
        if (loadedModel && typeof loadedModel.dispose === 'function') {
          try { loadedModel.dispose(); } catch (e) {}
        }
        throw new Error('Operasi pemuatan model dibatalkan.');
      }

      // Perbaikan 1: Lakukan warm-up inferensi semantik (mengompilasi shader WebGL / GPU di latar belakang)
      // agar tidak terjadi jeda cold start 20-30 detik saat siswa pertama kali menekan tombol "Periksa Jawaban"
      if (loadedModel && typeof loadedModel.embed === 'function') {
        try {
          const dummyWarmup = await loadedModel.embed(['pemanasan ekosistem bumi','pemanasan ekosistem bumi']);
          if (dummyWarmup && typeof dummyWarmup.dispose === 'function') {
            dummyWarmup.dispose();
          }
        } catch (warmupErr) {
          console.warn(`[getOrLoadUSEModel] Warm-up shader WebGL ${mode} gagal/dilewati:`, warmupErr);
        }
      }

      _ecoUseModel = loadedModel;
      _ecoUseModelMode = mode;
      _ecoUseModelLoadedAt = Date.now();
      return _ecoUseModel;
    } finally {
      if (timerId) clearTimeout(timerId);
      _isModelLoading = false;
      _modelLoadPromise = null;
    }
  })();

  return _modelLoadPromise;
}

/**
 * Poin 1: Melakukan pramuat (silent background pre-load) model USE setelah siswa login.
 * Berjalan di latar belakang tanpa blocking UI, tanpa menampilkan modal loading,
 * dengan toleransi batas waktu 90 detik.
 *
 * @param {number} timeoutMs - Batas waktu dalam ms (default 90.000 ms = 90 detik)
 * @returns {Promise<any>}
 */
function preloadUSEModelBackground(timeoutMs = USE_PRELOAD_TIMEOUT_MS) {
  // Jika fitur pramuat dinonaktifkan, langsung lewati tanpa proses apa pun
  if (!ENABLE_NLP_PRELOAD) {
    return Promise.resolve(null);
  }

  // Hanya berjalan jika mode aktif membutuhkan model USE / USE-Lite
  if (NLP_ENGINE_MODE === 'enhanced-js') {
    return Promise.resolve(null);
  }

  const now = Date.now();
  // Jika model sudah ada di cache dan masih segar (< 2 jam), tidak perlu load ulang
  if (_ecoUseModel && _ecoUseModelMode === NLP_ENGINE_MODE && (now - _ecoUseModelLoadedAt < USE_CACHE_DURATION_MS)) {
    return Promise.resolve(_ecoUseModel);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // OPTIMISASI LOGIN (Bypass Silent Preload jika Model Sudah Ada di IndexedDB):
  // ──────────────────────────────────────────────────────────────────────────
  // Jika model SUDAH ADA di IndexedDB lokal, jangan lakukan silent preload pasca-login.
  // Ini mencegah kompilasi WebGL shader / pemrosesan tensor membebani CPU/GPU
  // yang bisa membuat tombol dan alur login freeze/stutter.
  // Pemuatan dari IndexedDB akan dilakukan saat siswa membuka tahap ANSWER (1-2 detik)
  // dengan loading screen visual yang jelas.
  const meta = getNlpModelMeta(NLP_ENGINE_MODE);
  if (meta && meta.indexedDbKey) {
    console.log(`[preloadUSEModelBackground] Model ${NLP_ENGINE_MODE} sudah tersimpan di IndexedDB lokal. Melewati pramuat pasca-login agar antarmuka login tetap ringan & responsif.`);
    return Promise.resolve(null);
  }

  // Jika sedang berjalan silent preload (untuk model yang belum pernah diunduh), kembalikan promise yang sedang aktif
  if (_isSilentPreloading && _silentPreloadPromise) {
    return _silentPreloadPromise;
  }

  const cancelToken = { isCancelled: false };
  _silentPreloadCancelToken = cancelToken;
  _isSilentPreloading = true;

  console.log(`[preloadUSEModelBackground] Memulai silent pramuat model ${NLP_ENGINE_MODE} di latar belakang (timeout: ${timeoutMs / 1000}s)...`);

  _silentPreloadPromise = (async () => {
    try {
      const model = await getOrLoadUSEModel(NLP_ENGINE_MODE, false, timeoutMs, cancelToken);
      if (!cancelToken.isCancelled && model) {
        console.log(`[preloadUSEModelBackground] Sukses silent pramuat model ${NLP_ENGINE_MODE} ke memori cache.`);
      }
      return model;
    } catch (err) {
      if (cancelToken.isCancelled) {
        console.log(`[preloadUSEModelBackground] Silent pramuat ${NLP_ENGINE_MODE} dibatalkan (failsafe abort).`);
      } else {
        console.warn(`[preloadUSEModelBackground] Silent pramuat ${NLP_ENGINE_MODE} gagal / timeout:`, err.message || err);
      }
      return null;
    } finally {
      if (_silentPreloadCancelToken === cancelToken) {
        _isSilentPreloading = false;
        _silentPreloadCancelToken = null;
        _silentPreloadPromise = null;
      }
    }
  })();

  return _silentPreloadPromise;
}

/**
 * Failsafe Abort: Membatalkan silent pramuat Poin 1 jika siswa buru-buru menekan tombol tahap ANSWER.
 * Mengembalikan true jika ada proses yang di-abort.
 */
function abortSilentPreload() {
  if (_isSilentPreloading && _silentPreloadCancelToken) {
    console.log('[abortSilentPreload] Siswa membuka tahap ANSWER saat pramuat masih berjalan. Membatalkan silent pramuat...');
    _silentPreloadCancelToken.isCancelled = true;
    _isSilentPreloading = false;
    _silentPreloadCancelToken = null;
    _silentPreloadPromise = null;
    _modelLoadPromise = null;
    _isModelLoading = false;
    return true;
  }
  return false;
}

function isSilentPreloading() {
  return _isSilentPreloading;
}

function loadScriptDynamic(src) {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined' || typeof document.querySelector !== 'function' || typeof document.createElement !== 'function') return resolve();
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    if (document.head && document.head.appendChild) {
      document.head.appendChild(script);
    } else {
      resolve();
    }
  });
}

/**
 * Menghitung kemiripan semantik (Cosine Similarity) antara jawaban siswa dan jawaban ideal.
 * Menggunakan Universal Sentence Encoder (70% bobot).
 */
async function computeSemanticSimilarity(studentText, idealText, model) {
  if (!studentText || !studentText.trim()) return 0.0;
  if (!idealText || !idealText.trim()) return 0.0;

  if (model && !model.isFallback && typeof model.embed === 'function') {
    try {
      const embeddings = await model.embed([studentText, idealText]);
      if (embeddings && typeof embeddings.data === 'function') {
        const data = await embeddings.data();
        const dim = Math.floor(data.length / 2);
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < dim; i++) {
          const a = data[i];
          const b = data[dim + i];
          dot += a * b;
          normA += a * a;
          normB += b * b;
        }
        if (embeddings.dispose) embeddings.dispose();
        if (normA > 0 && normB > 0) {
          const cos = dot / (Math.sqrt(normA) * Math.sqrt(normB));
          if (!isNaN(cos)) {
            return Math.max(0, Math.min(1, cos));
          }
        }
        throw new Error('Hasil komputasi kemiripan semantik USE bernilai NaN atau vektor nol.');
      }
    } catch (err) {
      console.warn('[computeSemanticSimilarity] Terjadi kendala komputasi USE embed:', err);
      throw err;
    }
  }

  return computeFallbackSimilarity(studentText, idealText);
}

/**
 * Menghitung kesesuaian kata kunci (Keyword Match Ratio) (30% bobot)
 */
function computeKeywordScore(studentText, keywords) {
  if (!keywords || !keywords.length) return 1.0;
  if (!studentText || !studentText.trim()) return 0.0;

  const textLower = studentText.toLowerCase();
  let matched = 0;

  keywords.forEach(kw => {
    const kwLower = kw.toLowerCase().trim();
    if (textLower.includes(kwLower)) {
      matched += 1;
    } else {
      const stopwords = ['dan', 'yang', 'dari', 'atau', 'pada', 'ke', 'ini', 'itu', 'adalah'];
      const tokens = kwLower.split(/\s+/).filter(w => w.length >= 3 && !stopwords.includes(w));
      if (tokens.length > 0) {
        const tokenMatches = tokens.filter(tok => textLower.includes(tok)).length;
        if (tokenMatches / tokens.length >= 0.5) {
          matched += 0.8;
        }
      }
    }
  });

  const score = matched / keywords.length;
  return Math.max(0, Math.min(1, score));
}

/**
 * Fallback semantic similarity berbasis TF-IDF dan N-gram overlap
 */
function computeFallbackSimilarity(str1, str2) {
  if (!str1 || !str2) return 0.0;

  const tokenize = s => s.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2);

  const words1 = tokenize(str1);
  const words2 = tokenize(str2);
  if (!words1.length || !words2.length) return 0.0;

  const freq1 = {};
  const freq2 = {};
  const allWords = new Set([...words1, ...words2]);

  words1.forEach(w => freq1[w] = (freq1[w] || 0) + 1);
  words2.forEach(w => freq2[w] = (freq2[w] || 0) + 1);

  let dot = 0, normA = 0, normB = 0;
  allWords.forEach(w => {
    const a = freq1[w] || 0;
    const b = freq2[w] || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  });

  const cos = (normA > 0 && normB > 0) ? (dot / (Math.sqrt(normA) * Math.sqrt(normB))) : 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const jaccard = intersection.size / (set1.size + set2.size - intersection.size);

  return Math.max(0, Math.min(1, (cos * 0.7) + (jaccard * 0.3)));
}

// ══════════════════════════════════════════════════════════
// 3. INISIALISASI TAHAP ANSWER (ROUTER HOOK)
// ══════════════════════════════════════════════════════════

/**
 * Inisialisasi Tahap ANSWER saat siswa membuka halaman ANSWER (goStep(1) / ecoEnterLearning(1))
 * - Jika NLP_ENGINE_MODE === 'enhanced-js', langsung siap seketika (0 detik, tanpa unduh AI).
 * - Jika NLP_ENGINE_MODE === 'use' atau 'use-lite', memuat model AI dengan batas waktu timeout 15 detik.
 */
async function initAnswerStage(showLoadingOverlay = true) {
  if (typeof renderAnswerEssay === 'function') {
    renderAnswerEssay();
  }

  if (typeof syncAnswerFromServer === 'function') {
    syncAnswerFromServer().catch(err => {
      console.warn('[initAnswerStage] Sinkronisasi server latar belakang:', err);
    });
  }

  if (showLoadingOverlay && typeof hideLoading === 'function') {
    hideLoading();
  }
  return { mode: 'server-sync-only' };
}

// ══════════════════════════════════════════════════════════
// 4. FUNGSI AUTO-SAVE JAWABAN & SINKRONISASI SERVER (TABEL 'answer')
// ══════════════════════════════════════════════════════════

function getAnswerStudentId() {
  return (typeof window !== 'undefined' && window.ecoStudent && window.ecoStudent.id_siswa) ||
         (typeof ecoStudent !== 'undefined' && ecoStudent && ecoStudent.id_siswa) ||
         (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID')) || '';
}

function setAnswerSaveStatus(idx, tone, message) {
  const el = typeof document !== 'undefined' ? document.getElementById('ansSaveStatus-' + idx) : null;
  if (!el) return;
  el.textContent = message || '';
  el.className = `ans-save-status${tone ? ' ' + tone : ''}`;
}

function handleAnswerInputLocal(idx, val) {
  const text = String(val !== undefined ? val : '');
  answerEssayState[idx] = text;
  delete answerSyncState[idx];
  saveAnswerEssayState();

  const card = typeof document !== 'undefined' ? document.getElementById('ansEssayCard-' + idx) : null;
  const charEl = card && typeof card.querySelector === 'function' ? card.querySelector('.ans-char') : null;
  if (charEl) charEl.textContent = text.length + ' karakter';

  if (text.trim().length > 0) {
    setAnswerSaveStatus(idx, 'info', '💾 Draf lokal · otomatis kirim saat selesai mengetik');
  } else {
    setAnswerSaveStatus(idx, '', '💾 Tersimpan otomatis');
  }
}

function scheduleServerAnswerSync(idx, val) {
  if (_answerSyncTimers[idx]) {
    clearTimeout(_answerSyncTimers[idx]);
  }
  const rawVal = val !== undefined ? String(val) : String(answerEssayState[idx] || '');
  if (!rawVal.trim()) {
    setAnswerSaveStatus(idx, '', '💾 Tersimpan otomatis');
    return null;
  }

  const studentId = getAnswerStudentId();
  if (!studentId) {
    setAnswerSaveStatus(idx, 'warn', '💾 Draf lokal (masuk/login untuk menyimpan ke server)');
    return null;
  }

  setAnswerSaveStatus(idx, 'info', '⏳ Menjadwalkan simpan ke server...');
  const jitterMs = Math.floor(Math.random() * 1000);
  return new Promise(resolve => {
    _answerSyncTimers[idx] = setTimeout(async () => {
      delete _answerSyncTimers[idx];
      const res = await syncSingleAnswerToServer(idx, rawVal);
      resolve(res);
    }, jitterMs);
  });
}

function handleAnswerChangeSync(idx, val) {
  handleAnswerInputLocal(idx, val);
  return scheduleServerAnswerSync(idx, val);
}

async function syncSingleAnswerToServer(idx, textOverride) {
  const questions = (typeof window !== 'undefined' && window.ANSWER_ESSAY25) || [];
  const q = questions[idx];
  if (!q) return { ok: false, reason: 'invalid_question' };

  const rawVal = String(textOverride !== undefined ? textOverride : (answerEssayState[idx] || '')).trim();
  if (!rawVal) return { ok: false, reason: 'empty' };

  const studentId = getAnswerStudentId();
  if (!studentId) {
    setAnswerSaveStatus(idx, 'warn', '💾 Draf lokal (masuk/login untuk menyimpan ke server)');
    return { ok: false, reason: 'unauthenticated' };
  }

  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!api || typeof api.getWhere !== 'function') {
    setAnswerSaveStatus(idx, 'warn', '💾 Draf lokal (API server belum tersedia)');
    return { ok: false, reason: 'missing_api' };
  }

  const idSoal = q.id_soal !== undefined ? q.id_soal : (idx + 1);
  const idMateri = q.mat;
  const meta = answerMeta(idx);
  let confVal = meta.confidence || 'yakin';
  if (confVal === 'low') confVal = 'belum yakin';
  else if (confVal === 'mid') confVal = 'cukup yakin';
  else if (confVal === 'high') confVal = 'yakin';

  setAnswerSaveStatus(idx, 'info', '⏳ Menyimpan ke server...');

  try {
    const serverData = await api.getWhere('answer', {
      id_siswa: studentId,
      id_soal: idSoal,
      id_materi: idMateri
    });
    const list = Array.isArray(serverData) ? serverData : (serverData && Array.isArray(serverData.data) ? serverData.data : []);
    const existing = (list && list.length > 0) ? list[0] : null;
    const existingIdAnswer = existing ? (existing.id_answer !== undefined ? existing.id_answer : existing.id) : null;

    let savedId = existingIdAnswer || '';
    if (existing && existingIdAnswer !== null && existingIdAnswer !== undefined) {
      await api.patch('answer', 'id_answer', existingIdAnswer, {
        id_siswa: studentId,
        id_materi: idMateri,
        id_soal: idSoal,
        jawaban_siswa: rawVal,
        confident: confVal,
        flag_discuss: Boolean(meta.flagged)
      });
    } else {
      const payload = {
        id_answer: '',
        id_siswa: studentId,
        id_materi: idMateri,
        id_soal: idSoal,
        jawaban_siswa: rawVal,
        confident: confVal,
        flag_discuss: Boolean(meta.flagged),
        keterangan: ''
      };
      const res = await api.post('answer', payload);
      savedId = (res && (res.id_answer || res.id || (res.data && (res.data.id_answer || res.data.id)))) || '';
    }

    answerSyncState[idx] = {
      syncedAt: new Date().toISOString(),
      id_answer: savedId
    };
    setAnswerSaveStatus(idx, 'ok', '✓ Tersimpan di server');
    updateAnswerEssayProgress();
    return { ok: true, id_answer: savedId, id_materi: idMateri, id_soal: idSoal };
  } catch (err) {
    console.warn(`[syncSingleAnswerToServer] Gagal menyimpan soal #${idx + 1} ke server:`, err);
    setAnswerSaveStatus(idx, 'error', 'Ada masalah, coba lagi');
    return { ok: false, error: err };
  }
}

async function periksaJawabanEssay(idx) {
  return syncSingleAnswerToServer(idx);
}

function updateNlpBadgeUI(idx) {
  setAnswerSaveStatus(idx, 'ok', '✓ Tersimpan di server');
}

/**
 * Menyinkronkan jawaban siswa dari tabel 'answer' di server ke browser (dikelompokkan per id_soal/id_materi).
 */
async function syncAnswerFromServer() {
  const studentId = getAnswerStudentId();
  if (!studentId) return;

  if (studentId !== _lastAnswerStudentId) {
    _lastAnswerStudentId = studentId;
    answerEssayState = {};
    answerMetaState = {};
    answerNlpState = {};
    answerSyncState = {};
    saveAnswerEssayState();
  }

  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!api || typeof api.getWhere !== 'function') return;

  try {
    const res = await api.getWhere('answer', { id_siswa: studentId });
    const list = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
    const questions = (typeof window !== 'undefined' && window.ANSWER_ESSAY25) || [];
    const maxQuestions = questions.length || 50;
    if (list && list.length > 0) {
      let changed = false;
      list.forEach(row => {
        let qIdx = questions.findIndex((q, i) => String(q.id_soal !== undefined ? q.id_soal : (i + 1)) === String(row.id_soal));
        if (qIdx < 0) {
          const fallbackIdx = Number(row.id_soal) - 1;
          if (!isNaN(fallbackIdx) && fallbackIdx >= 0 && fallbackIdx < maxQuestions) qIdx = fallbackIdx;
        }
        if (qIdx >= 0 && qIdx < maxQuestions) {
          if (row.jawaban_siswa !== undefined && row.jawaban_siswa !== null) {
            if (!answerEssayState[qIdx] || answerEssayState[qIdx].length <= String(row.jawaban_siswa).length) {
              answerEssayState[qIdx] = String(row.jawaban_siswa);
              changed = true;
            }
            if (String(row.jawaban_siswa).trim().length > 0) {
              answerSyncState[qIdx] = {
                syncedAt: row.updated_at || new Date().toISOString(),
                id_answer: row.id_answer !== undefined ? row.id_answer : row.id
              };
            }
          }
          if (row.confident) {
            answerMetaState[qIdx] = answerMetaState[qIdx] || {};
            let c = row.confident;
            if (c === 'low') c = 'belum yakin';
            else if (c === 'mid') c = 'cukup yakin';
            else if (c === 'high') c = 'yakin';
            answerMetaState[qIdx].confidence = c;
            changed = true;
          }
          if (row.flag_discuss !== undefined && row.flag_discuss !== null) {
            answerMetaState[qIdx] = answerMetaState[qIdx] || {};
            answerMetaState[qIdx].flagged = (row.flag_discuss === true || row.flag_discuss === '1' || row.flag_discuss === 1);
            changed = true;
          }
          if (row.nilai_nlp !== undefined && row.nilai_nlp !== null && row.nilai_nlp !== '') {
            answerNlpState[qIdx] = {
              score: Number(row.nilai_nlp),
              updatedAt: row.updated_at || new Date().toISOString()
            };
            changed = true;
          }
        }
      });
      if (changed) {
        saveAnswerEssayState();
      }
      renderAnswerEssay();
    } else {
      renderAnswerEssay();
    }
  } catch (err) {
    console.warn('[syncAnswerFromServer] Belum dapat menyinkronkan data jawaban dari server:', err);
  }
}

// ══════════════════════════════════════════════════════════
// 3. RENDERING KARTU SOAL & ANTARMUKA JAWABAN
// ══════════════════════════════════════════════════════════

function renderAnswerEssay() {
  loadAnswerEssayState();
  const tabs = document.getElementById('ansMaterialTabs');
  const box = document.getElementById('ansEssayContainer');
  const title = document.getElementById('ansMaterialTitle');
  if (!tabs || !box) return;

  const esc = (typeof store !== 'undefined' && typeof store.escapeHtml === 'function')
    ? store.escapeHtml
    : (s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));

  const isAllowedMatFn = (typeof isMaterialAllowed === 'function')
    ? isMaterialAllowed
    : ((typeof window !== 'undefined' && typeof window.isMaterialAllowed === 'function') ? window.isMaterialAllowed : null);
  const firstAllowedMatFn = (typeof getFirstAllowedMaterial === 'function')
    ? getFirstAllowedMaterial
    : ((typeof window !== 'undefined' && typeof window.getFirstAllowedMaterial === 'function') ? window.getFirstAllowedMaterial : null);

  let hasAnyAllowedMat = true;
  if (isAllowedMatFn && !isAllowedMatFn(answerEssayMaterial)) {
    const firstAllowed = firstAllowedMatFn ? firstAllowedMatFn() : null;
    if (firstAllowed) {
      answerEssayMaterial = firstAllowed;
    } else {
      hasAnyAllowedMat = false;
    }
  }

  tabs.innerHTML = [1, 2, 3, 4, 5].map(m => {
    const arr = answerEssayQuestions(m);
    const done = arr.filter(x => (answerEssayState[x.idx] || '').trim().length >= 10).length;
    const flags = arr.filter(x => answerMeta(x.idx).flagged).length;
    const locked = isAllowedMatFn && !isAllowedMatFn(m);
    return `<button type="button" class="ans-mat-btn ${m === answerEssayMaterial && hasAnyAllowedMat ? 'active' : ''}${locked ? ' locked' : ''}" onclick="showAnswerMaterial(${m})">${locked ? '🔒 ' : ''}Materi ${m}<small>${done}/${arr.length} selesai ${flags ? ` · 🔖 ${flags}` : ''}</small></button>`;
  }).join('');

  if (!hasAnyAllowedMat) {
    if (title) {
      title.innerHTML = `<div><strong>🔒 Akses Materi Dibatasi Guru</strong><br><span>Saat ini belum ada materi yang dibuka oleh guru untuk kelasmu.</span></div><button class="ans-read-back" type="button" onclick="goStep(0)">↩ Kembali</button>`;
    }
    box.innerHTML = `<div class="ans-essay-card"><div class="ans-question">🔒 Belum ada materi yang diizinkan untuk kelasmu. Hubungi guru untuk membuka akses materi.</div></div>`;
    updateAnswerEssayProgress();
    return;
  }

  const arr = answerEssayQuestions(answerEssayMaterial);
  if (title && arr.length > 0) {
    title.innerHTML = `<div><strong>📘 Materi ${answerEssayMaterial} — ${arr[0].topic}</strong><br><span>Jawab setiap pertanyaan secara mandiri. Jawabanmu otomatis tersimpan ke server setelah selesai mengetik.</span></div><button class="ans-read-back" type="button" onclick="goStep(0);setTimeout(()=>openReadMaterial(${answerEssayMaterial}),100)">↩ Buka Materi READ</button>`;
  }

  box.innerHTML = arr.map((x,i) => {
    const mediaVisualHtml = (typeof renderQuestionVisualAndMedia === 'function')
      ? renderQuestionVisualAndMedia(x)
      : ((typeof window !== 'undefined' && typeof window.renderQuestionVisualAndMedia === 'function')
        ? window.renderQuestionVisualAndMedia(x)
        : (x.visual === 'weather'
          ? `<div class="ans-weather-visual"><div class="ans-weather-scene sunny"><span class="ico">☀️</span>07.00 · cerah & hangat</div><div class="ans-weather-scene rainy"><span class="ico">🌧️</span>14.00 · gelap, sejuk & hujan</div></div>`
          : ''));
    const val = answerEssayState[x.idx] || '';
    const meta = answerMeta(x.idx);
    const ch = answerChallenge(x.idx);
    const confidence = meta.confidence || '';
    const syncInfo = answerSyncState[x.idx];
    const saveTone = syncInfo ? 'ok' : (val.trim().length > 0 ? 'info' : '');
    const saveText = syncInfo
      ? '✓ Tersimpan di server'
      : (val.trim().length > 0 ? '💾 Draf lokal · otomatis kirim saat selesai mengetik' : '💾 Tersimpan otomatis');

    return `<article class="ans-essay-card ${meta.flagged ? 'flagged' : ''}" id="ansEssayCard-${x.idx}">
      <div class="ans-q-head">
        <span class="ans-q-no">${i + 1}</span>
        <span class="ans-q-chip green">📘 Materi ${x.mat}</span>
        <span class="ans-q-chip stage ${ch.cls}">${ch.icon} ${ch.label}</span>
      </div>
      ${mediaVisualHtml}
      <div class="ans-stimulus">${x.stim}</div>
      <div class="ans-question">${x.q}</div>
      <textarea class="ans-textarea" placeholder="Tuliskan jawaban dan alasanmu dengan kalimat sendiri berdasarkan pemahamanmu..." oninput="handleAnswerInputLocal(${x.idx},this.value)" onchange="handleAnswerChangeSync(${x.idx},this.value)">${esc(val)}</textarea>
      <div class="ans-save-note">
        <span class="ans-save-status ${saveTone}" id="ansSaveStatus-${x.idx}" role="status" aria-live="polite">${saveText}</span>
        <span class="ans-char">${val.length} karakter</span>
      </div>

      <!-- Self-check: Radio Box Confident & Checkbox Flag Discuss -->
      <div class="ans-selfcheck" style="display:none;">
        <div class="ans-selfcheck-title">Bagaimana keyakinanmu terhadap jawaban ini?</div>
        <div class="ans-confidence-row" role="radiogroup" aria-label="Tingkat Keyakinan">
          <button type="button" class="ans-confidence-btn low ${(confidence === 'belum yakin' || confidence === 'low') ? 'active' : ''}" onclick="answerSetConfidence(${x.idx},'belum yakin')">
            <span class="ans-radio-circle"></span>
            <span>🤔 Belum yakin</span>
          </button>
          <button type="button" class="ans-confidence-btn mid ${(confidence === 'cukup yakin' || confidence === 'mid') ? 'active' : ''}" onclick="answerSetConfidence(${x.idx},'cukup yakin')">
            <span class="ans-radio-circle"></span>
            <span>🙂 Cukup yakin</span>
          </button>
          <button type="button" class="ans-confidence-btn high ${(confidence === 'yakin' || confidence === 'high') ? 'active' : ''}" onclick="answerSetConfidence(${x.idx},'yakin')">
            <span class="ans-radio-circle"></span>
            <span>💡 Yakin</span>
          </button>
        </div>
        <button type="button" class="ans-discuss-flag ${meta.flagged ? 'active' : ''}" onclick="answerToggleDiscussFlag(${x.idx})">
          <span class="flag-box">${meta.flagged ? '✓' : ''}</span>
          <span>${meta.flagged ? '✓ Ditandai untuk dibahas saat DISCUSS' : '🔖 Tandai jika ingin dibahas saat DISCUSS'}</span>
        </button>
      </div>
    </article>`;
  }).join('');

  updateAnswerEssayProgress();
}

function showAnswerMaterial(m) {
  const guardMatFn = (typeof guardMaterialAccess === 'function')
    ? guardMaterialAccess
    : ((typeof window !== 'undefined' && typeof window.guardMaterialAccess === 'function') ? window.guardMaterialAccess : null);
  if (guardMatFn && !guardMatFn(m)) {
    return false;
  }
  answerEssayMaterial = m;
  renderAnswerEssay();
  document.getElementById('ansMaterialTitle')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function updateAnswerEssayProgress() {
  const questions = (typeof window !== 'undefined' && window.ANSWER_ESSAY25) || [];
  const done = questions.map((q, i) => (answerEssayState[i] || '').trim().length >= 10);
  const n = done.filter(Boolean).length;
  const tx = document.getElementById('ansEssayProgressText');
  const fill = document.getElementById('ansEssayProgressFill');
  const st = document.getElementById('ansEssayStatus');
  const flag = document.getElementById('ansFlagCount');

  const totalQ = questions.length || 50;

  if (tx) tx.textContent = n + ' dari ' + totalQ + ' selesai';
  if (fill && fill.style) fill.style.width = (n / totalQ * 100) + '%';
  done.forEach((ok, i) => document.getElementById('ansEssayCard-' + i)?.classList?.toggle('done', ok));

  const flagged = questions.filter((q, i) => answerMeta(i).flagged).length;
  const low = questions.filter((q, i) => {
    const c = answerMeta(i).confidence;
    return c === 'belum yakin' || c === 'low';
  }).length;

  if (flag) flag.textContent = `🔖 ${flagged} soal ditandai untuk DISCUSS`;
  if (st) {
    if (n === totalQ) {
      st.textContent = low > 0
        ? `🎉 Semua jawaban sudah tersimpan. Ada ${low} jawaban yang masih kamu ragukan—bagus, bawa itu ke DISCUSS.`
        : `🎉 Semua ${totalQ} jawaban sudah tersimpan. Kamu siap membandingkan alasanmu pada tahap DISCUSS.`;
    } else {
      st.textContent = `Masih ada ${totalQ - n} soal yang belum selesai. Jawab sesuai pemahamanmu sendiri.`;
    }
  }

  document.querySelectorAll('.ans-mat-btn').forEach((b, k) => {
    const arr = answerEssayQuestions(k + 1);
    const d = arr.filter(x => (answerEssayState[x.idx] || '').trim().length >= 10).length;
    const fl = arr.filter(x => answerMeta(x.idx).flagged).length;
    const sm = b.querySelector('small');
    if (sm) sm.textContent = d + '/' + arr.length + ' selesai' + (fl ? ` · 🔖 ${fl}` : '');
  });
}

function findUnansweredEssay() {
  const questions = (typeof window !== 'undefined' && window.ANSWER_ESSAY25) || [];
  const totalQ = questions.length || 50;
  const i = questions.findIndex((q, k) => (answerEssayState[k] || '').trim().length < 10);
  if (i < 0) {
    alert(`✅ Semua ${totalQ} soal sudah terisi. Kamu siap melanjutkan ke DISCUSS!`);
    return;
  }
  answerEssayMaterial = (questions[i] && questions[i].mat) || 1;
  renderAnswerEssay();
  setTimeout(() => document.getElementById('ansEssayCard-' + i)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
}

function answerGoDiscuss() {
  if (typeof goStep === 'function') {
    goStep(2);
  }
}

// ══════════════════════════════════════════════════════════
// 4. GLOBAL WINDOW & MODULE EXPOSURE
// ══════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  window.answerEssayState = answerEssayState;
  window.answerMetaState = answerMetaState;
  window.answerNlpState = answerNlpState;
  window.answerSyncState = answerSyncState;
  window.answerEssayMaterial = answerEssayMaterial;
  window.getAnswerStudentId = getAnswerStudentId;
  window.setAnswerSaveStatus = setAnswerSaveStatus;
  window.handleAnswerInputLocal = handleAnswerInputLocal;
  window.handleAnswerChangeSync = handleAnswerChangeSync;
  window.scheduleServerAnswerSync = scheduleServerAnswerSync;
  window.syncSingleAnswerToServer = syncSingleAnswerToServer;
  window.loadAnswerEssayState = loadAnswerEssayState;
  window.saveAnswerEssayState = saveAnswerEssayState;
  window.answerQuestionPosition = answerQuestionPosition;
  window.answerChallenge = answerChallenge;
  window.answerSetConfidence = answerSetConfidence;
  window.answerToggleDiscussFlag = answerToggleDiscussFlag;
  window.answerMeta = answerMeta;
  window.answerEssayQuestions = answerEssayQuestions;
  window.renderAnswerEssay = renderAnswerEssay;
  window.showAnswerMaterial = showAnswerMaterial;
  window.updateAnswerEssayProgress = updateAnswerEssayProgress;
  window.findUnansweredEssay = findUnansweredEssay;
  window.answerGoDiscuss = answerGoDiscuss;
  window.periksaJawabanEssay = periksaJawabanEssay;
  window.updateNlpBadgeUI = updateNlpBadgeUI;
  window.syncAnswerFromServer = syncAnswerFromServer;
  window.computeSemanticSimilarity = computeSemanticSimilarity;
  window.computeKeywordScore = computeKeywordScore;
  window.computeFallbackSimilarity = computeFallbackSimilarity;
  window.getOrLoadUSEModel = getOrLoadUSEModel;
  window.preloadUSEModelBackground = preloadUSEModelBackground;
  window.abortSilentPreload = abortSilentPreload;
  window.isSilentPreloading = isSilentPreloading;
  window.destroyUSEModelCache = destroyUSEModelCache;
  window.getEcoUseModelCacheState = getEcoUseModelCacheState;
  window.initAnswerStage = initAnswerStage;
  window.USE_CACHE_DURATION_MS = USE_CACHE_DURATION_MS;
  window.USE_LOAD_TIMEOUT_MS = USE_LOAD_TIMEOUT_MS;
  window.USE_PRELOAD_TIMEOUT_MS = USE_PRELOAD_TIMEOUT_MS;
  window.ENABLE_NLP_PRELOAD = ENABLE_NLP_PRELOAD;
  window.ENABLE_NLP_CACHE = ENABLE_NLP_CACHE;
  window.setNlpPreloadEnabled = setNlpPreloadEnabled;
  window.setNlpCacheEnabled = setNlpCacheEnabled;
  window.NLP_ENGINE_MODE = NLP_ENGINE_MODE;
  window.setNlpEngineMode = setNlpEngineMode;
  window.evaluateEnhancedJSSemantic = evaluateEnhancedJSSemantic;
  window.stemKataIndonesia = stemKataIndonesia;
  window.KAMUS_KONSEP_SAINS = KAMUS_KONSEP_SAINS;
  window.ECO_NLP_MODEL_META_KEY = ECO_NLP_MODEL_META_KEY;
  window.getIndexedDbModelUrl = getIndexedDbModelUrl;
  window.getNlpModelMeta = getNlpModelMeta;
  window.saveNlpModelMeta = saveNlpModelMeta;
  window.clearNlpModelMeta = clearNlpModelMeta;
  window.removeModelFromIndexedDB = removeModelFromIndexedDB;
  window.purgeNlpModelStorage = purgeNlpModelStorage;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    answerEssayState,
    answerMetaState,
    answerNlpState,
    answerSyncState,
    getAnswerStudentId,
    setAnswerSaveStatus,
    handleAnswerInputLocal,
    handleAnswerChangeSync,
    scheduleServerAnswerSync,
    syncSingleAnswerToServer,
    loadAnswerEssayState,
    saveAnswerEssayState,
    periksaJawabanEssay,
    updateNlpBadgeUI,
    syncAnswerFromServer,
    computeSemanticSimilarity,
    computeKeywordScore,
    computeFallbackSimilarity,
    getOrLoadUSEModel,
    preloadUSEModelBackground,
    abortSilentPreload,
    isSilentPreloading,
    destroyUSEModelCache,
    getEcoUseModelCacheState,
    initAnswerStage,
    USE_CACHE_DURATION_MS,
    USE_LOAD_TIMEOUT_MS,
    USE_PRELOAD_TIMEOUT_MS,
    ENABLE_NLP_PRELOAD,
    ENABLE_NLP_CACHE,
    setNlpPreloadEnabled,
    setNlpCacheEnabled,
    NLP_ENGINE_MODE,
    setNlpEngineMode,
    evaluateEnhancedJSSemantic,
    stemKataIndonesia,
    KAMUS_KONSEP_SAINS,
    renderAnswerEssay,
    showAnswerMaterial,
    updateAnswerEssayProgress,
    ECO_NLP_MODEL_META_KEY,
    getIndexedDbModelUrl,
    getNlpModelMeta,
    saveNlpModelMeta,
    clearNlpModelMeta,
    removeModelFromIndexedDB,
    purgeNlpModelStorage
  };
}

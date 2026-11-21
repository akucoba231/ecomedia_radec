/**
 * EcoMedia RADEC - ANSWER Module (Tahap 2: Menjawab Soal Pra-Pembelajaran)
 * Mengelola 25 soal esai, auto-save jawaban, keyakinan pemahaman, penandaan diskusi kelompok,
 * dan evaluasi NLP berbasis Universal Sentence Encoder (USE) serta Keyword Matching dengan sinkronisasi server (Tabel 'answer').
 */

let answerEssayState = {};
let answerMetaState = {};
let answerNlpState = {}; // { [idx]: { score: number, updatedAt: string } }
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

let ENABLE_NLP_PRELOAD = (typeof window !== 'undefined' && typeof window.ENABLE_NLP_PRELOAD === 'boolean') ? window.ENABLE_NLP_PRELOAD : true;
let ENABLE_NLP_CACHE = (typeof window !== 'undefined' && typeof window.ENABLE_NLP_CACHE === 'boolean') ? window.ENABLE_NLP_CACHE : true;

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
}

function answerToggleDiscussFlag(idx) {
  answerMetaState[idx] = answerMetaState[idx] || {};
  answerMetaState[idx].flagged = !answerMetaState[idx].flagged;
  saveAnswerEssayState();
  renderAnswerEssay();
}

function answerMeta(idx) {
  return answerMetaState[idx] || {};
}

function answerEssayQuestions(m) {
  const questions = (typeof window !== 'undefined' && window.ANSWER_ESSAY25) || [];
  return questions.map((q, i) => ({ ...q, idx: i })).filter(q => q.mat === m);
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
  // 1. Render kartu soal esai
  if (typeof renderAnswerEssay === 'function') {
    renderAnswerEssay();
  }

  // 2. Sinkronkan jawaban tersimpan di server
  if (typeof syncAnswerFromServer === 'function') {
    syncAnswerFromServer().catch(err => {
      console.warn('[initAnswerStage] Sinkronisasi server latar belakang:', err);
    });
  }

  // Jika pramuat dinonaktifkan ATAU mesin NLP adalah 'enhanced-js':
  // Halaman ANSWER langsung siap seketika (0 detik) tanpa memuat model AI atau menampilkan overlay.
  // Pemuatan AI murni dilakukan hanya saat tombol "Periksa Jawaban" ditekan.
  if (!ENABLE_NLP_PRELOAD || NLP_ENGINE_MODE === 'enhanced-js') {
    if (showLoadingOverlay && typeof hideLoading === 'function') {
      hideLoading();
    }
    return { isEnhancedJS: NLP_ENGINE_MODE === 'enhanced-js', mode: NLP_ENGINE_MODE };
  }

  // JIKA MODE = 'use' ATAU 'use-lite'
  const targetMode = NLP_ENGINE_MODE;
  const now = Date.now();
  const isCached = _ecoUseModel && _ecoUseModelMode === targetMode && (now - _ecoUseModelLoadedAt < USE_CACHE_DURATION_MS);

  // 1. Jika model sudah ada di cache (pramuat pasca-login sukses): langsung siap 0 detik
  if (isCached) {
    if (showLoadingOverlay && typeof hideLoading === 'function') {
      hideLoading();
    }
    return _ecoUseModel;
  }

  // 2. Perbaikan 2: Jika pramuat login Poin 1 sedang berjalan (siswa buru-buru buka ANSWER):
  // JANGAN DI-ABORT! Sambungkan (attach/join) ke promise pramuat yang sudah berjalan
  // sambil menampilkan loading overlay persiapan ramah anak kepada siswa.
  if (_isSilentPreloading && _silentPreloadPromise) {
    if (showLoadingOverlay && typeof showLoading === 'function') {
      showLoading(
        'Mempersiapkan Halaman ANSWER...',
        'Sebentar ya, modul AI sedang disiapkan untukmu'
      );
    }
    try {
      const model = await _silentPreloadPromise;
      if (showLoadingOverlay && typeof hideLoading === 'function') {
        hideLoading();
      }
      if (model) return model;
    } catch (joinErr) {
      console.warn(`[initAnswerStage] Sambungan pramuat ${targetMode} gagal:`, joinErr);
    }
  }

  // 3. Jika belum ada di cache dan tidak sedang ada pramuat (atau pramuat sempat gagal):
  // Muat model dengan loading overlay dan batas waktu toleran
  if (showLoadingOverlay && typeof showLoading === 'function') {
    showLoading(
      'Mempersiapkan Halaman ANSWER...',
      'Sebentar ya, modul AI sedang disiapkan untukmu'
    );
  }

  try {
    const model = await getOrLoadUSEModel(targetMode, false, USE_LOAD_TIMEOUT_MS);
    if (showLoadingOverlay && typeof hideLoading === 'function') {
      hideLoading();
    }
    return model;
  } catch (err) {
    console.warn(`[initAnswerStage] Pre-load model ${targetMode} gagal:`, err);
    // Tampilkan pesan error ramah anak
    if (showLoadingOverlay && typeof showLoadingError === 'function') {
      showLoadingError('Waduh, ada sedikit kesalahan, tapi kamu masih bisa melanjutkan pembelajaranmu di sini');
    }
    return null;
  }
}

// ══════════════════════════════════════════════════════════
// 4. FUNGSI PERIKSA JAWABAN & SINKRONISASI SERVER (TABEL 'answer')
// ══════════════════════════════════════════════════════════

/**
 * Memeriksa jawaban esai siswa secara STRICT mengikuti modul NLP_ENGINE_MODE yang aktif:
 * - 'enhanced-js' : Menggunakan Enhanced JS + Kamus Konsep Sains + Stemmer Ringan
 * - 'use'         : Menggunakan Deep Learning Universal Sentence Encoder Standar
 * - 'use-lite'    : Menggunakan Deep Learning Universal Sentence Encoder Lite
 * Menampilkan 2 kali loading screen dan mengirim hasil ke tabel 'answer'.
 * @param {number} idx - Indeks soal (0 s.d. 24)
 */
async function periksaJawabanEssay(idx) {
  const questions = (typeof window !== 'undefined' && window.ANSWER_ESSAY25) || [];
  const q = questions[idx];
  if (!q) return;

  const idSoal = q.id_soal !== undefined ? q.id_soal : (idx + 1);
  const idMateri = q.mat;
  const val = (answerEssayState[idx] || '').trim();

  // Validasi: jawaban tidak boleh kosong
  if (val.length < 5) {
    if (typeof showLoadingError === 'function') {
      showLoadingError('Jawaban belum diisi. Tuliskan jawabanmu terlebih dahulu sebelum diperiksa.');
    } else {
      alert('Tuliskan jawabanmu terlebih dahulu sebelum diperiksa.');
    }
    const card = document.getElementById('ansEssayCard-' + idx);
    const textarea = card?.querySelector('.ans-textarea');
    if (textarea) textarea.focus();
    return;
  }

  // Validasi login siswa
  const studentId = (typeof window !== 'undefined' && window.ecoStudent && window.ecoStudent.id_siswa) ||
                    (typeof ecoStudent !== 'undefined' && ecoStudent && ecoStudent.id_siswa) ||
                    (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID')) || '';

  if (!studentId) {
    if (typeof showLoadingError === 'function') {
      showLoadingError('Silakan masuk/login terlebih dahulu untuk menyimpan dan memeriksa jawaban.');
    } else {
      alert('Silakan masuk/login terlebih dahulu.');
    }
    return;
  }

  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!api) {
    alert('Koneksi ke server tidak tersedia.');
    return;
  }

  const btn = document.getElementById('btnPeriksa-' + idx);
  if (btn) btn.disabled = true;

  try {
    // ──────────────────────────────────────────────────────────
    // TAHAP 1 (Loading Screen 1): Cek Server & Siapkan Modul NLP
    // ──────────────────────────────────────────────────────────
    if (typeof showLoading === 'function') {
      showLoading(
        'Menghubungkan ke Sistem Penilai...',
        NLP_ENGINE_MODE === 'enhanced-js'
          ? '1/2: Memeriksa data di server & mengaktifkan penilai semantik...'
          : '1/2: Memeriksa data di server & memuat model AI (' + NLP_ENGINE_MODE.toUpperCase() + ')...'
      );
    }

    // Poin 1 & 3: Periksa server apakah jawaban sudah ada dengan id_siswa, id_soal, id_materi
    const serverData = await api.getWhere('answer', {
      id_siswa: studentId,
      id_soal: idSoal,
      id_materi: idMateri
    });
    const list = Array.isArray(serverData) ? serverData : (serverData && Array.isArray(serverData.data) ? serverData.data : []);
    const isUpdate = (list && list.length > 0);
    const existing = isUpdate ? list[0] : null;
    const existingIdAnswer = existing ? (existing.id_answer !== undefined ? existing.id_answer : existing.id) : null;

    // Persiapkan referensi kunci jawaban
    const getKunciFn = (typeof getKunciJawaban === 'function')
      ? getKunciJawaban
      : ((typeof window !== 'undefined' && window.getKunciJawaban) ? window.getKunciJawaban : null);
    const ref = getKunciFn ? getKunciFn(idSoal) : null;
    const idealText = ref ? ref.jawaban_ideal : '';
    const keywords = ref ? ref.kata_kunci : [];

    let nilai_nlp = null;
    let evalBreakdown = {};

    // ──────────────────────────────────────────────────────────
    // TAHAP 2 (Loading Screen 2): Evaluasi Sesuai Modul Aktif
    // ──────────────────────────────────────────────────────────
    if (typeof showLoading === 'function') {
      showLoading(
        'Mengevaluasi Jawaban Siswa...',
        NLP_ENGINE_MODE === 'enhanced-js'
          ? '2/2: Menganalisis konsep sains & kata kunci jawaban, lalu menyimpan hasil ke server...'
          : '2/2: Penilaian oleh AI, mengirim jawaban ke server...'
      );
    }

    // CABANG STRICT BERDASARKAN NLP_ENGINE_MODE
    if (NLP_ENGINE_MODE === 'enhanced-js') {
      // ── MODUL 1: ENHANCED JS + KAMUS KONSEP SAINS (STRICT) ──
      const res = evaluateEnhancedJSSemantic(val, idSoal, ref);
      nilai_nlp = res.score;
      evalBreakdown = res;
    } else {
      // ── MODUL 2 & 3: USE ATAU USE-LITE (STRICT) ──
      const activeMode = NLP_ENGINE_MODE;
      let model = null;
      try {
        // Poin 3: Tombol periksa jawaban memuat model jika Poin 2 belum berhasil (Retry)
        model = await getOrLoadUSEModel(activeMode, false, USE_LOAD_TIMEOUT_MS);
      } catch (loadErr) {
        console.warn(`[periksaJawabanEssay] Gagal memuat model ${activeMode}:`, loadErr);
        throw new Error(`Gagal terhubung ke model AI (${activeMode}). Periksa koneksi internetmu dan coba klik tombol Periksa Jawaban lagi.`);
      }

      // Evaluasi semantik USE
      try {
        const semScore = await computeSemanticSimilarity(val, idealText, model);
        const kwScore = computeKeywordScore(val, keywords);
        const combined = (semScore * 0.7) + (kwScore * 0.3);
        if (!isNaN(combined) && combined !== null && combined !== undefined) {
          nilai_nlp = parseFloat((combined * 100).toFixed(1));
          evalBreakdown = { semantic: parseFloat((semScore * 100).toFixed(1)), keyword: parseFloat((kwScore * 100).toFixed(1)) };
        }
      } catch (evalErr) {
        console.warn(`[periksaJawabanEssay] Evaluasi pertama ${activeMode} gagal, mencoba reload model:`, evalErr);
        nilai_nlp = null;
      }

      // Poin 5: Failsafe Retry (jika evaluasi pertama gagal atau menghasilkan NaN:
      // lakukan purge IndexedDB, reset metadata localStorage, lalu unduh dan muat ulang)
      if (nilai_nlp === null || isNaN(nilai_nlp)) {
        console.warn(`[periksaJawabanEssay] Evaluasi bernilai null/NaN. Menjalankan Failsafe Poin 5: purge IndexedDB & reload model...`);
        await purgeNlpModelStorage(activeMode);
        try {
          const freshModel = await getOrLoadUSEModel(activeMode, true, USE_LOAD_TIMEOUT_MS);
          const semScore = await computeSemanticSimilarity(val, idealText, freshModel);
          const kwScore = computeKeywordScore(val, keywords);
          const combined = (semScore * 0.7) + (kwScore * 0.3);
          nilai_nlp = parseFloat((combined * 100).toFixed(1));
          evalBreakdown = { semantic: parseFloat((semScore * 100).toFixed(1)), keyword: parseFloat((kwScore * 100).toFixed(1)) };
        } catch (retryErr) {
          console.warn(`[periksaJawabanEssay] Retry model ${activeMode} gagal:`, retryErr);
          throw new Error(`Gagal mengevaluasi jawaban dengan model AI (${activeMode}). Periksa koneksi internetmu dan coba klik tombol Periksa Jawaban lagi.`);
        }
      }

      // Jika cache dinonaktifkan, segera bersihkan model dari memori/GPU
      // agar tidak terjadi akumulasi tensor yang membuat browser freeze
      if (!ENABLE_NLP_CACHE) {
        destroyUSEModelCache();
      }
    }

    if (isNaN(nilai_nlp) || nilai_nlp === null || nilai_nlp === undefined) {
      nilai_nlp = 0.0;
    }

    // Poin 5: Persiapkan data jawaban, confident, flag_discuss, serta nilai_nlp
    const meta = answerMeta(idx);
    let confVal = meta.confidence || 'cukup yakin';
    if (confVal === 'low') confVal = 'belum yakin';
    else if (confVal === 'mid') confVal = 'cukup yakin';
    else if (confVal === 'high') confVal = 'yakin';

    const payload = {
      id_answer: isUpdate ? existingIdAnswer : '',
      id_siswa: studentId,
      id_materi: idMateri,
      id_soal: idSoal,
      jawaban_siswa: val,
      confident: confVal,
      flag_discuss: Boolean(meta.flagged),
      nilai_nlp: nilai_nlp,
      keterangan: ''
    };

    // Poin 6: Gunakan jitter dengan range 1000 milidetik saat melakukan request
    const jitterMs = Math.floor(Math.random() * 1000);
    await new Promise(resolve => setTimeout(resolve, jitterMs));

    // Kirim data ke server (PATCH jika ada, POST jika belum ada)
    if (isUpdate && existingIdAnswer) {
      await api.patch('answer', 'id_answer', existingIdAnswer, payload);
    } else {
      const res = await api.post('answer', payload);
      if (res && (res.id || res.id_answer)) {
        payload.id_answer = res.id || res.id_answer;
      }
    }

    // Simpan status NLP di local state
    answerNlpState[idx] = {
      score: nilai_nlp,
      breakdown: evalBreakdown,
      engine: NLP_ENGINE_MODE,
      updatedAt: new Date().toISOString()
    };
    saveAnswerEssayState();

    // Selesai: Tampilkan loading success
    if (typeof showLoadingSuccess === 'function') {
      showLoadingSuccess(`Jawaban berhasil diperiksa! Nilai AI: ${nilai_nlp}/100`, 1500);
    } else if (typeof hideLoading === 'function') {
      hideLoading();
    }

    // Perbarui badge nilai di antarmuka kartu soal
    updateNlpBadgeUI(idx, nilai_nlp);

  } catch (err) {
    console.error('[periksaJawabanEssay] Galat saat memeriksa jawaban:', err);
    if (typeof showLoadingError === 'function') {
      showLoadingError(err.message || 'Gagal memeriksa jawaban ke server.');
    } else if (typeof hideLoading === 'function') {
      hideLoading();
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

function updateNlpBadgeUI(idx, score) {
  const box = document.getElementById('ansNlpBox-' + idx);
  if (!box) return;
  const gradeClass = score >= 70 ? 'good' : (score >= 50 ? 'medium' : 'low');
  box.innerHTML = `
    <div class="ans-nlp-badge ${gradeClass}">
      <span class="ans-badge-ico">🎯</span>
      <span class="ans-badge-score">Nilai AI: <b>${score}</b>/100</span>
      <span class="ans-badge-time">✓ Tersimpan di server</span>
    </div>
  `;
}

/**
 * Menyinkronkan jawaban dan nilai NLP dari tabel 'answer' di server ke browser.
 */
async function syncAnswerFromServer() {
  const studentId = (typeof window !== 'undefined' && window.ecoStudent && window.ecoStudent.id_siswa) ||
                    (typeof ecoStudent !== 'undefined' && ecoStudent && ecoStudent.id_siswa) ||
                    (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID')) || '';
  if (!studentId) return;

  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!api || typeof api.getWhere !== 'function') return;

  try {
    const res = await api.getWhere('answer', { id_siswa: studentId });
    const list = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
    if (list && list.length > 0) {
      let changed = false;
      list.forEach(row => {
        const qIdx = Number(row.id_soal) - 1;
        if (qIdx >= 0 && qIdx < 25) {
          if (row.jawaban_siswa && (!answerEssayState[qIdx] || answerEssayState[qIdx].length < row.jawaban_siswa.length)) {
            answerEssayState[qIdx] = row.jawaban_siswa;
            changed = true;
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
        renderAnswerEssay();
      }
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

  tabs.innerHTML = [1, 2, 3, 4, 5].map(m => {
    const arr = answerEssayQuestions(m);
    const done = arr.filter(x => (answerEssayState[x.idx] || '').trim().length >= 10).length;
    const flags = arr.filter(x => answerMeta(x.idx).flagged).length;
    return `<button type="button" class="ans-mat-btn ${m === answerEssayMaterial ? 'active' : ''}" onclick="showAnswerMaterial(${m})">Materi ${m}<small>${done}/5 selesai${flags ? ` · 🔖 ${flags}` : ''}</small></button>`;
  }).join('');

  const arr = answerEssayQuestions(answerEssayMaterial);
  if (title && arr.length > 0) {
    title.innerHTML = `<div><strong>📘 Materi ${answerEssayMaterial} — ${arr[0].topic}</strong><br><span>Jawab kelima pertanyaan secara mandiri. Gunakan tombol keyakinan untuk menilai pemahamanmu sendiri, lalu periksa dengan AI.</span></div><button class="ans-read-back" type="button" onclick="goStep(0);setTimeout(()=>openReadMaterial(${answerEssayMaterial}),100)">↩ Buka Materi READ</button>`;
  }

  box.innerHTML = arr.map(x => {
    const visual = x.visual === 'weather'
      ? `<div class="ans-weather-visual"><div class="ans-weather-scene sunny"><span class="ico">☀️</span>07.00 · cerah & hangat</div><div class="ans-weather-scene rainy"><span class="ico">🌧️</span>14.00 · gelap, sejuk & hujan</div></div>`
      : '';
    const val = answerEssayState[x.idx] || '';
    const meta = answerMeta(x.idx);
    const ch = answerChallenge(x.idx);
    const confidence = meta.confidence || '';
    const nlpInfo = answerNlpState[x.idx];

    return `<article class="ans-essay-card ${meta.flagged ? 'flagged' : ''}" id="ansEssayCard-${x.idx}">
      <div class="ans-q-head">
        <span class="ans-q-no">${x.idx + 1}</span>
        <span class="ans-q-chip green">📘 Materi ${x.mat}</span>
        <span class="ans-q-chip stage ${ch.cls}">${ch.icon} ${ch.label}</span>
      </div>
      ${visual}
      <div class="ans-stimulus">${x.stim}</div>
      <div class="ans-question">${x.q}</div>
      <textarea class="ans-textarea" placeholder="Tuliskan jawaban dan alasanmu dengan kalimat sendiri berdasarkan pemahamanmu..." oninput="answerEssayState[${x.idx}]=this.value;saveAnswerEssayState();this.parentElement.querySelector('.ans-char').textContent=this.value.length+' karakter'">${val}</textarea>
      <div class="ans-save-note"><span class="ans-save-state">💾 Tersimpan otomatis</span><span class="ans-char">${val.length} karakter</span></div>

      <!-- Self-check: Radio Box Confident & Checkbox Flag Discuss -->
      <div class="ans-selfcheck">
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

      <!-- Wadah Aksi: Skor AI & Tombol Periksa Jawaban (Kanan Bawah) -->
      <div class="ans-card-actions">
        <div class="ans-nlp-result-box" id="ansNlpBox-${x.idx}">
          ${nlpInfo ? `
            <div class="ans-nlp-badge ${nlpInfo.score >= 70 ? 'good' : (nlpInfo.score >= 50 ? 'medium' : 'low')}">
              <span class="ans-badge-ico">🎯</span>
              <span class="ans-badge-score">Nilai AI: <b>${nlpInfo.score}</b>/100</span>
              <span class="ans-badge-time">✓ Tersimpan di server</span>
            </div>
          ` : `
            <span class="ans-nlp-placeholder">💡 Klik 'Periksa Jawaban' untuk evaluasi AI</span>
          `}
        </div>
        <button type="button" class="btn-periksa-jawaban" id="btnPeriksa-${x.idx}" onclick="periksaJawabanEssay(${x.idx})">
          <span class="btn-icon">🔍</span>
          <span>Periksa Jawaban</span>
        </button>
      </div>
    </article>`;
  }).join('');

  updateAnswerEssayProgress();
}

function showAnswerMaterial(m) {
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

  if (tx) tx.textContent = n + ' dari 25 selesai';
  if (fill && fill.style) fill.style.width = (n / 25 * 100) + '%';
  done.forEach((ok, i) => document.getElementById('ansEssayCard-' + i)?.classList?.toggle('done', ok));

  const flagged = questions.filter((q, i) => answerMeta(i).flagged).length;
  const low = questions.filter((q, i) => {
    const c = answerMeta(i).confidence;
    return c === 'belum yakin' || c === 'low';
  }).length;

  if (flag) flag.textContent = `🔖 ${flagged} soal ditandai untuk DISCUSS`;
  if (st) {
    if (n === 25) {
      st.textContent = low > 0
        ? `🎉 Semua jawaban sudah tersimpan. Ada ${low} jawaban yang masih kamu ragukan—bagus, bawa itu ke DISCUSS.`
        : '🎉 Semua 25 jawaban sudah tersimpan. Kamu siap membandingkan alasanmu pada tahap DISCUSS.';
    } else {
      st.textContent = `Masih ada ${25 - n} soal yang belum selesai. Jawab sesuai pemahamanmu sendiri.`;
    }
  }

  document.querySelectorAll('.ans-mat-btn').forEach((b, k) => {
    const arr = answerEssayQuestions(k + 1);
    const d = arr.filter(x => (answerEssayState[x.idx] || '').trim().length >= 10).length;
    const fl = arr.filter(x => answerMeta(x.idx).flagged).length;
    const sm = b.querySelector('small');
    if (sm) sm.textContent = d + '/5 selesai' + (fl ? ` · 🔖 ${fl}` : '');
  });
}

function findUnansweredEssay() {
  const questions = (typeof window !== 'undefined' && window.ANSWER_ESSAY25) || [];
  const i = questions.findIndex((q, k) => (answerEssayState[k] || '').trim().length < 10);
  if (i < 0) {
    alert('✅ Semua 25 soal sudah terisi. Kamu siap melanjutkan ke DISCUSS!');
    return;
  }
  answerEssayMaterial = Math.floor(i / 5) + 1;
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
  window.answerEssayMaterial = answerEssayMaterial;
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

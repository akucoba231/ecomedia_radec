/**
 * EcoMedia RADEC - Progress Tracker Module
 * Mengelola pelacakan penyelesaian langkah (READ, ANSWER, DISCUSS, EXPLAIN, CREATE, SELESAI).
 */

let ecoCompleted = new Set();
let ecoProgressId = null;

function trackerReadState() {
  try {
    const raw = localStorage.getItem(ECO_KEYS.progress);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        ecoCompleted = new Set(parsed.filter(x => Number.isInteger(x) && x >= 0 && x < 5));
      }
    }
  } catch (e) {
    ecoCompleted = new Set();
  }

  try {
    const stepKey = (typeof ECO_KEYS !== 'undefined' && ECO_KEYS.currentStep) ? ECO_KEYS.currentStep : 'ecoRadecCurrentStep';
    const savedStep = localStorage.getItem(stepKey);
    if (savedStep !== null) {
      const parsedStep = parseInt(savedStep, 10);
      if (Number.isInteger(parsedStep) && parsedStep >= 0 && parsedStep < 6) {
        if (typeof window !== 'undefined') window.currentStep = parsedStep;
        if (typeof currentStep !== 'undefined') currentStep = parsedStep;
      }
    }
  } catch (e) {}

  try {
    const progIdKey = (typeof ECO_KEYS !== 'undefined' && ECO_KEYS.progressId) ? ECO_KEYS.progressId : 'ecoRadecProgressID';
    const savedId = localStorage.getItem(progIdKey);
    ecoProgressId = savedId || null;
    if (typeof window !== 'undefined') window.ecoProgressId = ecoProgressId;
  } catch (e) {}
}

// Inisialisasi awal saat script dimuat
trackerReadState();

function buildTracker() {
  const container = document.getElementById('trackerSteps');
  if (!container) return;
  container.innerHTML = '';

  const colors = (typeof window !== 'undefined' && window.stepColors) || [
    'var(--c-read)', 'var(--c-answer)', 'var(--c-discuss)',
    'var(--c-explain)', 'var(--c-create)', 'var(--c-create)'
  ];
  const labels = (typeof window !== 'undefined' && window.stepLabels) || ['READ', 'ANSWER', 'DISCUSS', 'EXPLAIN', 'CREATE', 'SELESAI'];
  const icons = (typeof window !== 'undefined' && window.stepIcons) || ['📖', '✏️', '💬', '🗣️', '🎨', '🏆'];
  const activeStep = typeof currentStep !== 'undefined' ? currentStep : 0;

  for (let i = 0; i < 5; i++) {
    const d = document.createElement('div');
    d.className = 't-step';
    d.style.setProperty('--step-c', colors[i]);

    if (ecoCompleted.has(i) || i < activeStep) {
      d.classList.add('t-done');
    } else if (i === activeStep) {
      d.classList.add('t-active');
    }

    d.innerHTML = `<div class="t-circle">${(ecoCompleted.has(i) || i < activeStep) ? '✓' : icons[i]}</div><div class="t-label">${labels[i]}</div>`;
    d.onclick = (() => {
      const s = i;
      return () => {
        if (typeof goStep === 'function') goStep(s);
      };
    })();

    container.appendChild(d);
  }
}

function ecoSaveProgress() {
  try {
    localStorage.setItem(ECO_KEYS.progress, JSON.stringify([...ecoCompleted].sort((a, b) => a - b)));
  } catch (e) {
    console.warn('[ecoSaveProgress] Gagal menyimpan progress:', e);
  }
  ecoRenderProgress();

  // Sinkronisasi background silent PATCH ke database server
  if (typeof syncProgressToServer === 'function') {
    setTimeout(syncProgressToServer, 0);
  }
}

function ecoRenderProgress() {
  const count = ecoCompleted.size;
  const pct = Math.round((count / 5) * 100);
  const fill = document.getElementById('ecoProgressFill');
  const txt = document.getElementById('ecoProgressText');

  if (fill) fill.style.width = pct + '%';
  if (txt) txt.textContent = `${count} dari 5 tahap selesai · ${pct}%`;

  // Cari tahap pertama yang belum selesai (0=READ, 1=ANSWER, dst.)
  const firstOpen = [0, 1, 2, 3, 4].find(i => !ecoCompleted.has(i)) ?? 0;

  // Tentukan tahap yang aktif/siap dipelajari:
  let activeStep = firstOpen;
  const candStep = (typeof window !== 'undefined' && typeof window.currentStep === 'number')
    ? window.currentStep
    : ((typeof currentStep === 'number') ? currentStep : null);

  if (candStep !== null && candStep >= 0 && candStep < 5) {
    // Jika candStep belum selesai, itu yang aktif.
    // Jika candStep sudah selesai (misal bernilai 0 tapi READ sudah selesai),
    // maka gunakan firstOpen agar tahap berikutnya yang menyala kuning.
    if (!ecoCompleted.has(candStep)) {
      activeStep = candStep;
    }
  }

  // 1. Update dots pada peta petualangan (#ecoProgressDots) dan welcome screen (.eco-progress-dots)
  document.querySelectorAll('#ecoProgressDots span, .eco-progress-dots span').forEach((d, i) => {
    d.classList.remove('done', 'ready', 'active');
    if (ecoCompleted.has(i)) {
      d.classList.add('done'); // Hijau untuk tahap yang sudah tuntas
    } else if (i === activeStep || (count === 0 && i === 0)) {
      d.classList.add('ready', 'active'); // Kuning untuk tahap yang sedang aktif / siap dipelajari
    }
  });

  // 2. Update kartu tahapan petualangan ([data-eco-stage])
  document.querySelectorAll('[data-eco-stage]').forEach((card) => {
    const i = Number(card.dataset.ecoStage);
    const status = card.querySelector('[data-eco-status]');
    card.classList.remove('done', 'ready');
    if (ecoCompleted.has(i)) {
      card.classList.add('done');
      if (status) status.textContent = '✅ Selesai';
    } else if (i === activeStep || (count === 0 && i === 0)) {
      card.classList.add('ready');
      if (status) status.textContent = '🟡 Siap / sedang dipelajari';
    } else if (status) {
      status.textContent = '⚪ Belum dimulai';
    }
  });
}

function ecoOnStep(step) {
  // Simpan dan sinkronkan visual tanpa langsung menandai tahap saat ini selesai
  if (typeof ecoSaveProgress === 'function') {
    ecoSaveProgress();
  } else {
    ecoRenderProgress();
  }

  const n = (typeof ecoStudent !== 'undefined' && ecoStudent.name) ? ecoStudent.name : 'Sahabat Bumi';
  const gt = document.getElementById('ecoGreetingText');
  const msgs = window.ecoMessages || [];

  if (gt) {
    gt.textContent = (msgs[step] && typeof msgs[step] === 'function')
      ? msgs[step](n)
      : `🌱 Selamat belajar, ${n}!`;
  }

  document.querySelectorAll('.eco-nav-step').forEach((b, i) => {
    b.classList.toggle('active', i === step);
  });

  if (typeof ecoRenderIdentity === 'function') {
    ecoRenderIdentity();
  }
}

function ecoRestartLearning() {
  if (confirm('Ulangi pembelajaran dari tahap READ? Progres tahapan akan direset, tetapi jawaban yang sudah tertulis di halaman tidak otomatis dihapus.')) {
    ecoCompleted.clear();
    ecoSaveProgress();
    if (typeof ecoEnterLearning === 'function') {
      ecoEnterLearning(0);
    }
  }
}

let isSyncingProgress = false;
let pendingProgressSync = false;

/**
 * Menyinkronkan progres siswa ke server secara background (PATCH).
 * Berjalan otomatis setiap ada perubahan progres (ecoSaveProgress).
 */
async function syncProgressToServer() {
  const studentId = (typeof window !== 'undefined' && window.ecoStudent && window.ecoStudent.id_siswa) ||
                    (typeof ecoStudent !== 'undefined' && ecoStudent.id_siswa) ||
                    (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID')) || '';
  if (!studentId) return;

  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!api || typeof api.patch !== 'function') return;

  if (isSyncingProgress) {
    pendingProgressSync = true;
    return;
  }

  isSyncingProgress = true;
  try {
    const activeStep = (typeof window !== 'undefined' && typeof window.currentStep === 'number')
      ? window.currentStep
      : ((typeof currentStep === 'number') ? currentStep : 0);
    const completedList = [...ecoCompleted].sort((a, b) => a - b);

    const progIdKey = (typeof ECO_KEYS !== 'undefined' && ECO_KEYS.progressId) ? ECO_KEYS.progressId : 'ecoRadecProgressID';

    // Cari id_progress dari variabel memori atau localStorage
    if (!ecoProgressId) {
      try {
        ecoProgressId = localStorage.getItem(progIdKey);
      } catch (e) {}
    }

    if (!ecoProgressId) {
      // Jika id_progress belum tercatat, ambil dari server
      const check = await api.getWhere('progress', { id_siswa: studentId });
      const list = Array.isArray(check) ? check : (check && Array.isArray(check.data) ? check.data : []);
      if (list && list.length > 0) {
        ecoProgressId = list[0].id_progress;
        if (typeof window !== 'undefined') window.ecoProgressId = ecoProgressId;
        try {
          localStorage.setItem(progIdKey, String(ecoProgressId));
        } catch (e) {}
      } else {
        // Jika benar-benar belum ada di server (failsafe), lakukan POST
        const postRes = await api.post('progress', {
          id_progress: '',
          id_siswa: studentId,
          progress: completedList,
          current_step: activeStep,
          keterangan: ''
        });
        const createdId = (postRes && postRes.id) || (postRes && postRes.data && postRes.data.id_progress);
        if (createdId) {
          ecoProgressId = createdId;
          if (typeof window !== 'undefined') window.ecoProgressId = ecoProgressId;
          try {
            localStorage.setItem(progIdKey, String(ecoProgressId));
          } catch (e) {}
        }
        return;
      }
    }

    // Melakukan PATCH (UPDATE) pada progress siswa
    await api.patch('progress', 'id_progress', ecoProgressId, {
      progress: completedList,
      current_step: activeStep
    });
  } catch (err) {
    console.warn('[syncProgressToServer] Gagal mengupdate progres ke database:', err);
  } finally {
    isSyncingProgress = false;
    if (pendingProgressSync) {
      pendingProgressSync = false;
      setTimeout(syncProgressToServer, 100);
    }
  }
}

/**
 * Sinkronisasi progres siswa dari/ke database server saat login.
 * Jika siswa belum memiliki data di server (length === 0), lakukan POST (INSERT) failsafe
 * dengan progress kosong [] dan current_step = 0 agar tahap READ berstatus 'Sedang dipelajari'.
 * Jika siswa sudah memiliki data (length > 0), pulihkan state ecoCompleted dan currentStep dari server.
 *
 * @param {string} studentId - ID Siswa yang login
 * @returns {Promise<void>}
 */
async function syncProgressLogin(studentId) {
  if (!studentId) return;

  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!api || typeof api.getWhere !== 'function') return;

  try {
    const serverData = await api.getWhere('progress', { id_siswa: studentId });
    const list = Array.isArray(serverData) ? serverData : (serverData && Array.isArray(serverData.data) ? serverData.data : []);

    const progKey = (typeof ECO_KEYS !== 'undefined' && ECO_KEYS.progress) ? ECO_KEYS.progress : 'ecoRadecProgress';
    const stepKey = (typeof ECO_KEYS !== 'undefined' && ECO_KEYS.currentStep) ? ECO_KEYS.currentStep : 'ecoRadecCurrentStep';
    const progIdKey = (typeof ECO_KEYS !== 'undefined' && ECO_KEYS.progressId) ? ECO_KEYS.progressId : 'ecoRadecProgressID';

    if (list && list.length > 0) {
      // --- SISWA SUDAH MEMILIKI RECORD DI SERVER ---
      const record = list[0];
      ecoProgressId = record.id_progress;
      if (typeof window !== 'undefined') window.ecoProgressId = ecoProgressId;
      try {
        localStorage.setItem(progIdKey, String(ecoProgressId));
      } catch (e) {}

      // 1. Pulihkan ecoCompleted
      let pList = [];
      if (Array.isArray(record.progress)) {
        pList = record.progress;
      } else if (typeof record.progress === 'string') {
        try { pList = JSON.parse(record.progress); } catch (e) { pList = []; }
      }
      ecoCompleted = new Set(pList.filter(x => Number.isInteger(x) && x >= 0 && x < 5));
      if (typeof window !== 'undefined') window.ecoCompleted = ecoCompleted;

      // 2. Pulihkan current_step
      const sStep = parseInt(record.current_step, 10);
      if (Number.isInteger(sStep) && sStep >= 0 && sStep <= 5) {
        currentStep = sStep;
        if (typeof window !== 'undefined') window.currentStep = sStep;
        try {
          localStorage.setItem(stepKey, String(sStep));
        } catch (e) {}
      }

      // 3. Simpan state terpulihkan ke localStorage
      try {
        localStorage.setItem(progKey, JSON.stringify([...ecoCompleted].sort((a, b) => a - b)));
      } catch (e) {}

    } else {
      // --- SISWA PERTAMA KALI LOGIN (Belum ada data di DB) -> Failsafe POST (INSERT) ---
      // Pastikan progress kosong [] dan current_step = 0 agar READ berstatus "Sedang dipelajari"
      const initialCompleted = [];
      const initialStep = 0;

      ecoCompleted = new Set(initialCompleted);
      if (typeof window !== 'undefined') window.ecoCompleted = ecoCompleted;

      currentStep = initialStep;
      if (typeof window !== 'undefined') window.currentStep = initialStep;

      try {
        localStorage.setItem(progKey, JSON.stringify(initialCompleted));
        localStorage.setItem(stepKey, String(initialStep));
      } catch (e) {}

      const postRes = await api.post('progress', {
        id_progress: '',
        id_siswa: studentId,
        progress: initialCompleted,
        current_step: initialStep,
        keterangan: ''
      });

      const newId = (postRes && postRes.id) || (postRes && postRes.data && postRes.data.id_progress);
      if (newId) {
        ecoProgressId = newId;
        if (typeof window !== 'undefined') window.ecoProgressId = newId;
        try {
          localStorage.setItem(progIdKey, String(ecoProgressId));
        } catch (e) {}
      }
    }
  } catch (err) {
    console.warn('[syncProgressLogin] Gagal menyinkronkan progres dengan database:', err);
  } finally {
    if (typeof buildTracker === 'function') buildTracker();
    if (typeof ecoRenderProgress === 'function') ecoRenderProgress();
  }
}

// Global window exposure
if (typeof window !== 'undefined') {
  window.ecoCompleted = ecoCompleted;
  window.ecoProgressId = ecoProgressId;
  window.trackerReadState = trackerReadState;
  window.buildTracker = buildTracker;
  window.ecoSaveProgress = ecoSaveProgress;
  window.ecoRenderProgress = ecoRenderProgress;
  window.ecoOnStep = ecoOnStep;
  window.ecoRestartLearning = ecoRestartLearning;
  window.syncProgressToServer = syncProgressToServer;
  window.syncProgressLogin = syncProgressLogin;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ecoCompleted,
    trackerReadState,
    buildTracker,
    ecoSaveProgress,
    ecoRenderProgress,
    ecoOnStep,
    ecoRestartLearning,
    syncProgressToServer,
    syncProgressLogin
  };
}

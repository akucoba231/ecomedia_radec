/**
 * EcoMedia RADEC - Main Application Entry Point
 * Mengorkestrasi inisialisasi semua modul setelah DOM dan modul-modul lainnya siap.
 */

function appInit() {
  console.log('🌱 [EcoMedia RADEC] Menginisialisasi aplikasi...');

  const urlParams = (typeof getUrlLoginParams === 'function')
    ? getUrlLoginParams(true)
    : ((typeof window !== 'undefined' && typeof window.getUrlLoginParams === 'function') ? window.getUrlLoginParams(true) : null);
  const hasUrlOverride = Boolean(urlParams && urlParams.hasAny);

  // 1. Membaca identitas dan progres tersimpan
  if (typeof ecoReadState === 'function') ecoReadState();
  if (typeof trackerReadState === 'function') trackerReadState();

  // Sinkronisasi progres latar belakang dari database jika sudah login (lewati jika ada login URL dari Admin)
  const savedStudentId = (typeof ecoStudent !== 'undefined' && ecoStudent.id_siswa) ||
                         (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID'));
  if (!hasUrlOverride && savedStudentId && typeof syncProgressLogin === 'function') {
    syncProgressLogin(savedStudentId).catch(err => {
      console.warn('[appInit] Background syncProgressLogin error:', err);
    });
  }
  if (!hasUrlOverride && savedStudentId && typeof syncClassAccessPermissions === 'function') {
    syncClassAccessPermissions().catch(err => {
      console.warn('[appInit] Background syncClassAccessPermissions error:', err);
    });
  }

  // 2. Bangun Tracker & Render Soal
  if (typeof buildTracker === 'function') buildTracker();
  if (typeof renderAnswerEssay === 'function') renderAnswerEssay();

  // 3. Inisialisasi Auth & Tampilan Shell
  if (typeof renderAdventureMap === 'function') renderAdventureMap();
  if (typeof ecoInit === 'function') ecoInit();

  // 4. Muat Data Modul-Modul Fitur
  if (typeof initReadSubTabs === 'function') initReadSubTabs();
  if (typeof loadWonders === 'function') loadWonders();
  if (typeof loadKeterampilanRead === 'function') loadKeterampilanRead();
  if (typeof renderDiscussRoles === 'function') renderDiscussRoles();
  if (typeof renderDiscussLenses === 'function') renderDiscussLenses();
  if (typeof renderCreateComponents === 'function') renderCreateComponents();
  if (typeof loadCreateCreativeIdea === 'function') loadCreateCreativeIdea();
  if (typeof loadEcoAction === 'function') loadEcoAction();
  if (typeof loadFinalReflection === 'function') loadFinalReflection();
  if (typeof loadEcoLens === 'function') loadEcoLens();
  if (typeof loadEcoDiscussLens === 'function') loadEcoDiscussLens();
  if (typeof loadEcoCreateChecks === 'function') loadEcoCreateChecks();
  if (typeof initWonderDiscussListener === 'function') initWonderDiscussListener();
  if (typeof finishInit === 'function') finishInit();
  if (typeof initLearningReportStage === 'function') initLearningReportStage();

  // 5. Auto-login guru jika parameter URL dari Admin lengkap dengan absen=9999
  if (urlParams && urlParams.isTeacherAutoLogin && typeof ecoLogin === 'function') {
    ecoLogin().catch(err => {
      console.warn('[appInit] Auto-login guru (absen=9999) gagal:', err);
    });
  }

  console.log('✅ [EcoMedia RADEC] Aplikasi siap digunakan.');
}

// Jalankan saat dokumen siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', appInit);
} else {
  appInit();
}

if (typeof window !== 'undefined') {
  window.appInit = appInit;
}

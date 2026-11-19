/**
 * EcoMedia RADEC - Main Application Entry Point
 * Mengorkestrasi inisialisasi semua modul setelah DOM dan modul-modul lainnya siap.
 */

function appInit() {
  console.log('🌱 [EcoMedia RADEC] Menginisialisasi aplikasi...');

  // 1. Membaca identitas dan progres tersimpan
  if (typeof ecoReadState === 'function') ecoReadState();
  if (typeof trackerReadState === 'function') trackerReadState();

  // Sinkronisasi progres latar belakang dari database jika sudah login
  const savedStudentId = (typeof ecoStudent !== 'undefined' && ecoStudent.id_siswa) ||
                         (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID'));
  if (savedStudentId && typeof syncProgressLogin === 'function') {
    syncProgressLogin(savedStudentId).catch(err => {
      console.warn('[appInit] Background syncProgressLogin error:', err);
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
  if (typeof renderDiscussRoles === 'function') renderDiscussRoles();
  if (typeof renderDiscussLenses === 'function') renderDiscussLenses();
  if (typeof renderCreateComponents === 'function') renderCreateComponents();
  if (typeof loadEcoAction === 'function') loadEcoAction();
  if (typeof loadFinalReflection === 'function') loadFinalReflection();
  if (typeof loadEcoLens === 'function') loadEcoLens();
  if (typeof loadEcoDiscussLens === 'function') loadEcoDiscussLens();
  if (typeof loadEcoCreateChecks === 'function') loadEcoCreateChecks();
  if (typeof initWonderDiscussListener === 'function') initWonderDiscussListener();
  if (typeof finishInit === 'function') finishInit();

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

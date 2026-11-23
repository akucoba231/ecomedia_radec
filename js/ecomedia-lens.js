/**
 * EcoMedia RADEC - EcoMedia Literacy Lens Module (López Framework)
 * Mengelola 4 lensa analisis ecomedia (budaya, politik, materialitas, ekosistem),
 * refleksi kritis saat DISCUSS, serta checklist prinsip ecomedia saat CREATE.
 */

// mode 'append' untuk selalu POST | gunakan 'upsert' untuk mode PATCH
const ECOMEDIA_MODE = 'append';

function saveEcoLens() {
  const d = {
    object: document.getElementById('ecoObjectSelect')?.value || 'Video Ecomedia',
    culture: document.getElementById('ecoLensCulture')?.value || '',
    politics: document.getElementById('ecoLensPolitics')?.value || '',
    material: document.getElementById('ecoLensMaterial')?.value || '',
    life: document.getElementById('ecoLensLife')?.value || ''
  };

  const key = typeof ECO_LOPEZ_LENS_KEY !== 'undefined' ? ECO_LOPEZ_LENS_KEY : 'ecoRadecLopezLensRev1';
  if (typeof store !== 'undefined' && store.write) {
    store.write(key, d);
  } else {
    try { localStorage.setItem(key, JSON.stringify(d)); } catch (e) {}
  }
  updateEcoLensProgress(d);
}

async function loadEcoLens() {
  const key = typeof ECO_LOPEZ_LENS_KEY !== 'undefined' ? ECO_LOPEZ_LENS_KEY : 'ecoRadecLopezLensRev1';
  const d = (typeof store !== 'undefined' && store.read) ? store.read(key, {}) : {};
  const ids = {
    object: 'ecoObjectSelect',
    culture: 'ecoLensCulture',
    politics: 'ecoLensPolitics',
    material: 'ecoLensMaterial',
    life: 'ecoLensLife'
  };

  // 1. Muat instan dari cache lokal lebih dulu
  Object.entries(ids).forEach(([k, id]) => {
    const el = document.getElementById(id);
    if (el && d[k] != null) el.value = d[k];
  });

  updateEcoLensProgress(d);

  // 2. Sinkronisasi dari database server jika siswa sudah login
  const studentId = (typeof window !== 'undefined' && window.ecoStudent && window.ecoStudent.id_siswa) ||
                    (typeof ecoStudent !== 'undefined' && ecoStudent && ecoStudent.id_siswa) ||
                    (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID')) || '';

  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  if (api && studentId && typeof api.getWhere === 'function') {
    try {
      const serverData = await api.getWhere('ecomedia', { id_siswa: studentId });
      const list = Array.isArray(serverData) ? serverData : (serverData && Array.isArray(serverData.data) ? serverData.data : []);

      if (list && list.length > 0) {
        // Ambil baris terakhir jika ada banyak riwayat pengiriman (append mode)
        const row = list[list.length - 1];
        const sSelect = document.getElementById('ecoObjectSelect');
        const cCult = document.getElementById('ecoLensCulture');
        const cPol = document.getElementById('ecoLensPolitics');
        const cMat = document.getElementById('ecoLensMaterial');
        const cLife = document.getElementById('ecoLensLife');
        const msg = document.getElementById('ecoLensMsg');

        if (sSelect && row.sumber) sSelect.value = row.sumber;
        if (cCult && row.cerita_nilai != null) cCult.value = row.cerita_nilai;
        if (cPol && row.siapa_berperan != null) cPol.value = row.siapa_berperan;
        if (cMat && row.bahan_energi_limbah != null) cMat.value = row.bahan_energi_limbah;
        if (cLife && row.pengalaman_kita != null) cLife.value = row.pengalaman_kita;

        const updated = {
          object: sSelect ? sSelect.value : (row.sumber || 'Video Ecomedia'),
          culture: cCult ? cCult.value : (row.cerita_nilai || ''),
          politics: cPol ? cPol.value : (row.siapa_berperan || ''),
          material: cMat ? cMat.value : (row.bahan_energi_limbah || ''),
          life: cLife ? cLife.value : (row.pengalaman_kita || '')
        };

        if (typeof store !== 'undefined' && store.write) {
          store.write(key, updated);
        } else {
          try { localStorage.setItem(key, JSON.stringify(updated)); } catch (e) {}
        }

        updateEcoLensProgress(updated);

        if (msg) {
          msg.className = 'q-wonder-msg ok';
          msg.textContent = '✓ Analisis ecomedia tersinkronisasi dari server.';
        }
      }
    } catch (err) {
      console.warn('[loadEcoLens] Belum dapat menyinkronkan data ecomedia dari server:', err);
    }
  }
}

/**
 * Mengirimkan data analisis 4 lensa ecomedia ke server (tabel 'ecomedia').
 * Menampilkan loading overlay selama proses pengiriman.
 * Jika pada tabel 'ecomedia' tidak ditemukan id_siswa ini, maka lakukan POST (INSERT).
 * Jika ditemukan maka lakukan PATCH (UPDATE).
 */
async function kirimEcoLens() {
  const selectEl = document.getElementById('ecoObjectSelect');
  const cultureEl = document.getElementById('ecoLensCulture');
  const politicsEl = document.getElementById('ecoLensPolitics');
  const materialEl = document.getElementById('ecoLensMaterial');
  const lifeEl = document.getElementById('ecoLensLife');
  const msg = document.getElementById('ecoLensMsg');
  const btn = document.getElementById('btnSubmitEcoLens');

  const sumber = selectEl ? selectEl.value : 'Video Ecomedia';
  const cerita_nilai = cultureEl ? cultureEl.value.trim() : '';
  const siapa_berperan = politicsEl ? politicsEl.value.trim() : '';
  const bahan_energi_limbah = materialEl ? materialEl.value.trim() : '';
  const pengalaman_kita = lifeEl ? lifeEl.value.trim() : '';

  // Validasi: pastikan setidaknya satu lensa diisi sebelum mengirim
  if (!cerita_nilai && !siapa_berperan && !bahan_energi_limbah && !pengalaman_kita) {
    if (msg) {
      msg.className = 'q-wonder-msg warn';
      msg.textContent = 'Silakan isi setidaknya salah satu lensa analisis sebelum mengirim.';
    }
    if (cultureEl) cultureEl.focus();
    return;
  }

  const studentId = (typeof window !== 'undefined' && window.ecoStudent && window.ecoStudent.id_siswa) ||
                    (typeof ecoStudent !== 'undefined' && ecoStudent && ecoStudent.id_siswa) ||
                    (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID')) || '';

  if (!studentId) {
    if (msg) {
      msg.className = 'q-wonder-msg warn';
      msg.textContent = 'Silakan masuk/login terlebih dahulu untuk mengirimkan jawaban analisis.';
    }
    return;
  }

  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!api) {
    if (msg) {
      msg.className = 'q-wonder-msg warn';
      msg.textContent = 'Koneksi ke server tidak tersedia.';
    }
    return;
  }

  // Tampilkan loading screen selama pengiriman data
  if (typeof showLoading === 'function') {
    showLoading('Menyimpan Analisis Ecomedia...', 'Mohon tunggu sebentar, jawaban analisismu sedang dikirim ke server...');
  }
  if (btn) btn.disabled = true;

  try {
    const activeMode = (typeof window !== 'undefined' && window.ECOMEDIA_MODE) || ECOMEDIA_MODE;

    if (activeMode === 'append') {
      // Mode 'append': selalu POST tanpa pemeriksaan atau PATCH
      const postData = {
        id_ecomedia: '',
        id_siswa: studentId,
        sumber: sumber,
        cerita_nilai: cerita_nilai,
        siapa_berperan: siapa_berperan,
        bahan_energi_limbah: bahan_energi_limbah,
        pengalaman_kita: pengalaman_kita,
        keterangan: ''
      };
      await api.post('ecomedia', postData);
    } else {
      // Mode 'upsert': periksa keberadaan data di server lebih dulu
      const serverData = await api.getWhere('ecomedia', { id_siswa: studentId });
      const list = Array.isArray(serverData) ? serverData : (serverData && Array.isArray(serverData.data) ? serverData.data : []);

      // Evaluasi: length === 0 -> POST (INSERT), length > 0 -> PATCH (UPDATE)
      if (!list || list.length === 0) {
        const postData = {
          id_ecomedia: '',
          id_siswa: studentId,
          sumber: sumber,
          cerita_nilai: cerita_nilai,
          siapa_berperan: siapa_berperan,
          bahan_energi_limbah: bahan_energi_limbah,
          pengalaman_kita: pengalaman_kita,
          keterangan: ''
        };
        await api.post('ecomedia', postData);
      } else {
        const existing = list[list.length - 1] || list[0];
        const idEcomedia = existing.id_ecomedia !== undefined ? existing.id_ecomedia : existing.id;
        const patchData = {
          sumber: sumber,
          cerita_nilai: cerita_nilai,
          siapa_berperan: siapa_berperan,
          bahan_energi_limbah: bahan_energi_limbah,
          pengalaman_kita: pengalaman_kita,
          keterangan: ''
        };
        await api.patch('ecomedia', 'id_ecomedia', idEcomedia, patchData);
      }
    }

    // Perbarui cache lokal
    if (typeof saveEcoLens === 'function') {
      saveEcoLens();
    }

    // Tampilkan animasi sukses
    if (typeof showLoadingSuccess === 'function') {
      showLoadingSuccess('Jawaban analisis ecomedia berhasil disimpan!', 1200);
    } else if (typeof hideLoading === 'function') {
      hideLoading();
    }

    if (msg) {
      msg.className = 'q-wonder-msg ok';
      msg.textContent = '✓ Jawaban analisis ecomedia berhasil disimpan ke server!';
    }
  } catch (err) {
    console.error('[kirimEcoLens] Gagal mengirim analisis ecomedia ke server:', err);
    if (typeof showLoadingError === 'function') {
      showLoadingError(err.message || 'Gagal mengirim analisis ke server.');
    } else if (typeof hideLoading === 'function') {
      hideLoading();
    }

    if (msg) {
      msg.className = 'q-wonder-msg warn';
      msg.textContent = 'Gagal menyimpan: ' + (err.message || err);
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

function updateEcoLensProgress(d) {
  const key = typeof ECO_LOPEZ_LENS_KEY !== 'undefined' ? ECO_LOPEZ_LENS_KEY : 'ecoRadecLopezLensRev1';
  d = d || ((typeof store !== 'undefined' && store.read) ? store.read(key, {}) : {});
  const n = ['culture', 'politics', 'material', 'life'].filter(k => (d[k] || '').trim().length >= 5).length;
  const t = document.getElementById('ecoLensProgress');
  const b = document.getElementById('ecoLensBar');

  if (t) t.textContent = n + '/4 lensa terisi';
  if (b) b.style.width = (n / 4 * 100) + '%';
}

function saveEcoDiscussLens() {
  const curMateri = (typeof window !== 'undefined' && window.discussAllMaterialV4) || 1;
  const group = (typeof window !== 'undefined' && window.currentKelompokDiscuss);
  const idKelompok = (group && group.id_kelompok) || 'draft';
  const d = {
    message: document.getElementById('ecoDiscussMessage')?.value || '',
    voice: document.getElementById('ecoDiscussVoice')?.value || '',
    footprint: document.getElementById('ecoDiscussFootprint')?.value || ''
  };

  const key = idKelompok ? `ecoRadecLopezDiscuss_${idKelompok}_m${curMateri}` : 'ecoRadecLopezDiscussRev1';
  if (typeof store !== 'undefined' && store.write) {
    store.write(key, d);
  } else {
    try { localStorage.setItem(key, JSON.stringify(d)); } catch (e) {}
  }

  const n = Object.values(d).filter(v => (v || '').trim().length >= 5).length;
  const m = document.getElementById('ecoDiscussStatus');
  if (m) m.textContent = `💾 Draf tersimpan lokal · ${n}/3 refleksi terisi`;
}

function loadEcoDiscussLens() {
  if (typeof window !== 'undefined' && typeof window.loadEcoDiscussData === 'function') {
    const curMateri = window.discussAllMaterialV4 || 1;
    const group = window.currentKelompokDiscuss;
    return window.loadEcoDiscussData(curMateri, group);
  }

  const curMateri = (typeof window !== 'undefined' && window.discussAllMaterialV4) || 1;
  const group = (typeof window !== 'undefined' && window.currentKelompokDiscuss);
  const idKelompok = (group && group.id_kelompok) || 'draft';
  const key = idKelompok ? `ecoRadecLopezDiscuss_${idKelompok}_m${curMateri}` : 'ecoRadecLopezDiscussRev1';

  let d = null;
  if (typeof store !== 'undefined' && store.read) {
    d = store.read(key, null);
  } else {
    try { d = JSON.parse(localStorage.getItem(key)); } catch (e) {}
  }
  if (!d && typeof ECO_DISCUSS_LENS_KEY !== 'undefined') {
    try { d = JSON.parse(localStorage.getItem(ECO_DISCUSS_LENS_KEY)); } catch (e) {}
  }
  d = d || {};

  const ids = {
    message: 'ecoDiscussMessage',
    voice: 'ecoDiscussVoice',
    footprint: 'ecoDiscussFootprint'
  };

  Object.entries(ids).forEach(([k, id]) => {
    const el = document.getElementById(id);
    if (el) el.value = d[k] || '';
  });

  saveEcoDiscussLens();
}

function saveEcoCreateChecks() {
  const d = {};
  document.querySelectorAll('[data-eco-create]').forEach(x => {
    d[x.dataset.ecoCreate] = x.checked;
  });

  const key = typeof ECO_CREATE_CHECK_KEY !== 'undefined' ? ECO_CREATE_CHECK_KEY : 'ecoRadecLopezCreateCheckRev1';
  if (typeof store !== 'undefined' && store.write) {
    store.write(key, d);
  } else {
    try { localStorage.setItem(key, JSON.stringify(d)); } catch (e) {}
  }

  updateEcoCreateChecks(d);
}

function loadEcoCreateChecks() {
  const key = typeof ECO_CREATE_CHECK_KEY !== 'undefined' ? ECO_CREATE_CHECK_KEY : 'ecoRadecLopezCreateCheckRev1';
  const d = (typeof store !== 'undefined' && store.read) ? store.read(key, {}) : {};

  document.querySelectorAll('[data-eco-create]').forEach(x => {
    x.checked = !!d[x.dataset.ecoCreate];
  });

  updateEcoCreateChecks(d);
}

function updateEcoCreateChecks(d) {
  const key = typeof ECO_CREATE_CHECK_KEY !== 'undefined' ? ECO_CREATE_CHECK_KEY : 'ecoRadecLopezCreateCheckRev1';
  d = d || ((typeof store !== 'undefined' && store.read) ? store.read(key, {}) : {});
  const vals = Object.values(d);
  const n = vals.filter(Boolean).length;
  const t = document.getElementById('ecoCreateCheckText');
  const b = document.getElementById('ecoCreateCheckBar');

  if (t) t.textContent = n + '/6 prinsip terpenuhi';
  if (b) b.style.width = (n / 6 * 100) + '%';
}

// Global window exposure
if (typeof window !== 'undefined') {
  window.ECOMEDIA_MODE = ECOMEDIA_MODE;
  window.saveEcoLens = saveEcoLens;
  window.loadEcoLens = loadEcoLens;
  window.updateEcoLensProgress = updateEcoLensProgress;
  window.kirimEcoLens = kirimEcoLens;
  window.saveEcoDiscussLens = saveEcoDiscussLens;
  window.loadEcoDiscussLens = loadEcoDiscussLens;
  window.saveEcoCreateChecks = saveEcoCreateChecks;
  window.loadEcoCreateChecks = loadEcoCreateChecks;
  window.updateEcoCreateChecks = updateEcoCreateChecks;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ECOMEDIA_MODE,
    saveEcoLens,
    loadEcoLens,
    updateEcoLensProgress,
    kirimEcoLens,
    saveEcoDiscussLens,
    loadEcoDiscussLens,
    saveEcoCreateChecks,
    loadEcoCreateChecks,
    updateEcoCreateChecks
  };
}

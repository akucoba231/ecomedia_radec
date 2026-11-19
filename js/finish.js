/**
 * EcoMedia RADEC - FINISH & EVALUATION Module (Tahap Evaluasi & Refleksi Ekoliterasi)
 * Mengelola skala penilaian diri 3 dimensi ekoliterasi (Tahu, Peduli, Bertindak),
 * pemberian medali penyelesaian, dan refleksi akhir pembelajaran.
 */

let finishEco = {};

function loadFinishEcoState() {
  const key = typeof FINISH_KEY !== 'undefined' ? FINISH_KEY : 'ecoRadecFinishReflectionV6';
  if (typeof store !== 'undefined' && store.read) {
    finishEco = store.read(key, {});
  } else {
    try {
      finishEco = JSON.parse(localStorage.getItem(key) || '{}') || {};
    } catch (e) {
      finishEco = {};
    }
  }
}

// Inisialisasi awal pembacaan state
loadFinishEcoState();

function finishBuildEco() {
  const box = document.getElementById('ecoScale');
  if (!box) return;
  box.innerHTML = '';

  const ecoList = window.FINISH_ECO || [];
  const labels = window.FINISH_LABEL || {
    tahu: ['Belum bisa', 'Sedikit', 'Bisa', 'Bisa mengajari'],
    peduli: ['Tidak juga', 'Sedikit', 'Cukup', 'Sangat'],
    aksi: ['Belum pernah', 'Kadang', 'Sering', 'Selalu']
  };
  const dims = window.FINISH_DIM || {
    tahu: { nama: 'Aku tahu', kelas: 'dim-tahu', warna: '#1266AE' },
    peduli: { nama: 'Aku peduli', kelas: 'dim-peduli', warna: '#C4213C' },
    aksi: { nama: 'Aku bertindak', kelas: 'dim-aksi', warna: '#157F3D' }
  };

  ecoList.forEach((it, i) => {
    const d = document.createElement('div');
    d.className = 'eco-item';
    const optButtons = labels[it.d].map((l, j) => {
      const isSelected = finishEco['e' + i] == j + 1;
      return `<button type="button" class="eco-opt" data-fe="${i}" data-v="${j + 1}" aria-pressed="${isSelected ? 'true' : 'false'}">${l}</button>`;
    }).join('');

    d.innerHTML = `<span class="eco-dim ${dims[it.d].kelas}">${dims[it.d].nama}</span><div class="eco-q">${it.q}</div><div class="eco-opts" id="feo-${i}">${optButtons}</div>`;
    box.appendChild(d);
  });

  box.querySelectorAll('.eco-opt').forEach(b => {
    b.addEventListener('click', () => {
      const i = b.dataset.fe;
      document.querySelectorAll(`#feo-${i} .eco-opt`).forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      finishEco['e' + i] = +b.dataset.v;

      const key = typeof FINISH_KEY !== 'undefined' ? FINISH_KEY : 'ecoRadecFinishReflectionV6';
      if (typeof store !== 'undefined' && store.write) {
        store.write(key, finishEco);
      } else {
        try { localStorage.setItem(key, JSON.stringify(finishEco)); } catch (e) {}
      }
    });
  });
}

function finishScores() {
  const sum = { tahu: 0, peduli: 0, aksi: 0 };
  const cnt = { tahu: 0, peduli: 0, aksi: 0 };
  const ecoList = window.FINISH_ECO || [];

  ecoList.forEach((it, i) => {
    const v = finishEco['e' + i];
    if (v) {
      sum[it.d] += v;
      cnt[it.d]++;
    }
  });

  const out = {};
  ['tahu', 'peduli', 'aksi'].forEach(d => {
    out[d] = cnt[d] ? Math.round(((sum[d] / cnt[d]) - 1) / 3 * 100) : 0;
  });
  out.answered = ecoList.filter((_, i) => !!finishEco['e' + i]).length;
  return out;
}

function finishShowProfile() {
  const ecoList = window.FINISH_ECO || [];
  const sc = finishScores();
  if (sc.answered < ecoList.length) {
    alert(`Masih ada ${ecoList.length - sc.answered} pernyataan yang belum kamu jawab.`);
    return;
  }

  const dims = window.FINISH_DIM || {
    tahu: { nama: 'Aku tahu', kelas: 'dim-tahu', warna: '#1266AE' },
    peduli: { nama: 'Aku peduli', kelas: 'dim-peduli', warna: '#C4213C' },
    aksi: { nama: 'Aku bertindak', kelas: 'dim-aksi', warna: '#157F3D' }
  };

  const bars = document.getElementById('ecoBars');
  if (bars) {
    bars.innerHTML = ['tahu', 'peduli', 'aksi'].map(d =>
      `<div class="eco-bar-row"><span class="eco-bar-name">${dims[d].nama}</span><span class="eco-bar-track"><span class="eco-bar-fill" style="background:${dims[d].warna}"></span></span><span class="eco-bar-val">${sc[d]}%</span></div>`
    ).join('');
  }

  const res = document.getElementById('ecoResult');
  if (res) res.classList.add('show');

  setTimeout(() => {
    document.querySelectorAll('#ecoBars .eco-bar-fill').forEach((f, i) => {
      f.style.width = sc[['tahu', 'peduli', 'aksi'][i]] + '%';
    });
  }, 50);

  const gap = sc.peduli - sc.aksi;
  const hi = Math.max(sc.tahu, sc.peduli, sc.aksi);
  let msg = '';

  if (gap >= 25) {
    msg = '<strong>Kepedulianmu lebih besar daripada tindakanmu.</strong> Pilih satu kebiasaan kecil yang realistis dan jalankan secara konsisten. Aksi kecil yang dilakukan sungguh-sungguh lebih berarti daripada banyak rencana.';
  } else if (sc.tahu - sc.peduli >= 25) {
    msg = '<strong>Pengetahuanmu sudah berkembang, tetapi perlu dibuat lebih dekat dengan kehidupanmu.</strong> Amati satu perubahan lingkungan di rumah, sekolah, atau gampong dan hubungkan dengan apa yang sudah kamu pelajari.';
  } else if (hi >= 70 && sc.aksi >= 60) {
    msg = '<strong>Pengetahuan, kepedulian, dan tindakanmu berkembang kuat.</strong> Pertahankan satu aksi yang sudah dilakukan dan ajak seorang teman atau anggota keluarga melakukannya bersama.';
  } else if (hi < 40) {
    msg = '<strong>Kamu sedang memulai perjalanan.</strong> Pilih satu tindakan yang paling mudah dilakukan minggu ini, catat buktinya, lalu refleksikan perubahan yang kamu lihat.';
  } else {
    msg = '<strong>Ketiga bagianmu berkembang cukup seimbang.</strong> Terus hubungkan apa yang kamu tahu dengan keputusan dan tindakan nyata dalam kehidupan sehari-hari.';
  }

  const verdict = document.getElementById('ecoVerdict');
  if (verdict) verdict.innerHTML = msg;
  if (res) res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function finishRenderMedals() {
  const box = document.getElementById('medals');
  if (!box) return;

  const completed = (typeof ecoCompleted !== 'undefined') ? ecoCompleted : new Set();
  const vals = [0, 1, 2, 3, 4].map(i => completed.has(i));
  const icons = window.stepIcons || ['📖', '✏️', '💬', '🗣️', '🎨'];
  const names = window.stepLabels || ['READ', 'ANSWER', 'DISCUSS', 'EXPLAIN', 'CREATE'];

  box.innerHTML = names.slice(0, 5).map((n, i) =>
    `<div class="medal${vals[i] ? '' : ' dim'}"><span class="mi">${icons[i]}</span><div class="mn">${n}</div><div class="mv">${vals[i] ? '✓' : '—'}</div></div>`
  ).join('');
}

function finishInit() {
  finishBuildEco();
  finishRenderMedals();
  if (typeof renderLearningReport === 'function') renderLearningReport();

  const be = document.getElementById('btnEco');
  if (be && (!be.dataset || !be.dataset.bound)) {
    if (!be.dataset) be.dataset = {};
    be.dataset.bound = '1';
    be.addEventListener('click', finishShowProfile);
  }

  const bp = document.getElementById('btnPrintAll');
  if (bp && (!bp.dataset || !bp.dataset.bound)) {
    if (!bp.dataset) bp.dataset = {};
    bp.dataset.bound = '1';
    bp.addEventListener('click', () => window.print());
  }

  const br = document.getElementById('btnRestart');
  if (br && (!br.dataset || !br.dataset.bound)) {
    if (!br.dataset) br.dataset = {};
    br.dataset.bound = '1';
    br.addEventListener('click', () => {
      if (typeof ecoRestartLearning === 'function') ecoRestartLearning();
      else location.reload();
    });
  }

  const bc = document.getElementById('btnClear');
  if (bc && (!bc.dataset || !bc.dataset.bound)) {
    if (!bc.dataset) bc.dataset = {};
    bc.dataset.bound = '1';
    let armed = false;
    let timer = null;
    bc.addEventListener('click', () => {
      if (!armed) {
        armed = true;
        bc.textContent = '⚠️ Ketuk sekali lagi untuk menghapus';
        clearTimeout(timer);
        timer = setTimeout(() => {
          armed = false;
          bc.textContent = '🗑️ Hapus semua jawabanku';
        }, 5000);
        return;
      }
      try {
        if (typeof store !== 'undefined' && store.clear) store.clear();
        else localStorage.clear();
      } catch (e) {}
      location.reload();
    });
  }
}

function saveFinalReflection() {
  const data = {
    before: document.getElementById('reflectBefore')?.value.trim() || '',
    now: document.getElementById('reflectNow')?.value.trim() || '',
    decision: document.getElementById('reflectDecision')?.value.trim() || '',
    action: document.getElementById('reflectAction')?.value.trim() || ''
  };

  const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.finalReflection : 'ecoFinalReflection';
  if (typeof store !== 'undefined' && store.write) {
    store.write(key, data);
  } else {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
  }

  const m = document.getElementById('reflectionMsg');
  if (m) m.style.display = 'block';
}

function loadFinalReflection() {
  const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.finalReflection : 'ecoFinalReflection';
  let d = null;
  if (typeof store !== 'undefined' && store.read) {
    d = store.read(key, null);
  } else {
    try { d = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
  }
  if (!d) return;

  const mapping = [
    ['reflectBefore', 'before'],
    ['reflectNow', 'now'],
    ['reflectDecision', 'decision'],
    ['reflectAction', 'action']
  ];

  mapping.forEach(([id, k]) => {
    const el = document.getElementById(id);
    if (el) el.value = d[k] || '';
  });
}

// Global window exposure
if (typeof window !== 'undefined') {
  window.finishEco = finishEco;
  window.finishBuildEco = finishBuildEco;
  window.finishScores = finishScores;
  window.finishShowProfile = finishShowProfile;
  window.finishRenderMedals = finishRenderMedals;
  window.finishInit = finishInit;
  window.saveFinalReflection = saveFinalReflection;
  window.loadFinalReflection = loadFinalReflection;
}

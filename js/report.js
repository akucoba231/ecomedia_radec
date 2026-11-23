/**
 * EcoMedia RADEC - REPORT & CERTIFICATE Module
 * Mengelola laporan perbandingan jawaban (DISCUSS vs EXPLAIN), cetak laporan,
 * serta pembuatan dan pencetakan sertifikat siswa.
 */

let reportMaterialV4 = 1;

function saveCompareReflection() {
  const key = typeof RADEC_COMPARE_REFLECTION_V4 !== 'undefined'
    ? RADEC_COMPARE_REFLECTION_V4
    : 'ecoRadecDiscussExplainReflectionV4';
  const val = document.getElementById('compareReflection')?.value || '';
  const data = { text: val, updatedAt: new Date().toISOString() };

  if (typeof store !== 'undefined' && store.write) {
    store.write(key, data);
  } else {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
  }
}

function loadCompareReflection() {
  const key = typeof RADEC_COMPARE_REFLECTION_V4 !== 'undefined'
    ? RADEC_COMPARE_REFLECTION_V4
    : 'ecoRadecDiscussExplainReflectionV4';
  const d = (typeof store !== 'undefined' && store.read) ? store.read(key, {}) : {};
  const el = document.getElementById('compareReflection');
  if (el) el.value = d.text || '';
}

function showReportMaterial(m) {
  reportMaterialV4 = m;
  renderLearningReport();
}

function renderLearningReport() {
  const tabs = document.getElementById('reportMaterialTabs');
  const box = document.getElementById('learningReportContainer');
  if (!tabs || !box) return;

  if (typeof loadDiscussAllV4 === 'function') loadDiscussAllV4();
  if (typeof loadExplainAllV4 === 'function') loadExplainAllV4();

  const questions = window.ANSWER_ESSAY25 || [];
  const totalQ = questions.length || 50;

  const dc = (typeof discussV4Done === 'function') ? discussV4Done() : 0;
  const ec = (typeof explainV4Done === 'function') ? explainV4Done() : 0;
  const dt = document.getElementById('reportDiscussCount');
  const et = document.getElementById('reportExplainCount');
  if (dt) dt.textContent = dc + '/' + totalQ;
  if (et) et.textContent = ec + '/' + totalQ;

  tabs.innerHTML = [1, 2, 3, 4, 5].map(m =>
    `<button type="button" class="${m === reportMaterialV4 ? 'active' : ''}" onclick="showReportMaterial(${m})">Materi ${m}</button>`
  ).join('');

  const esc = (typeof store !== 'undefined' && store.escapeHtml) ? store.escapeHtml : (v => String(v || ''));
  const arr = (typeof getQuestionsByMaterial === 'function')
    ? getQuestionsByMaterial(reportMaterialV4)
    : ((typeof window !== 'undefined' && typeof window.getQuestionsByMaterial === 'function')
        ? window.getQuestionsByMaterial(reportMaterialV4)
        : questions.map((q, i) => ({ ...q, idx: i })).filter(q => q.mat === reportMaterialV4));

  box.innerHTML = arr.map(x => {
    const d = (typeof discussV4Text === 'function') ? discussV4Text(x.idx) : '';
    const e = (typeof explainV4Text === 'function') ? explainV4Text(x.idx) : '';
    return `<article class="learning-report-item">
      <h4>Soal ${x.idx + 1}. ${esc(x.q)}</h4>
      <div class="learning-report-compare">
        <div class="learning-report-col discuss">
          <b>💬 HASIL DISCUSS</b>
          <p class="${d ? '' : 'empty'}">${d ? esc(d) : 'Belum diisi.'}</p>
        </div>
        <div class="learning-report-col explain">
          <b>🗣️ HASIL EXPLAIN</b>
          <p class="${e ? '' : 'empty'}">${e ? esc(e) : 'Belum diisi.'}</p>
        </div>
      </div>
    </article>`;
  }).join('');

  loadCompareReflection();
}

function finishPrintLearningReport() {
  if (typeof loadDiscussAllV4 === 'function') loadDiscussAllV4();
  if (typeof loadExplainAllV4 === 'function') loadExplainAllV4();

  const key = typeof RADEC_COMPARE_REFLECTION_V4 !== 'undefined'
    ? RADEC_COMPARE_REFLECTION_V4
    : 'ecoRadecDiscussExplainReflectionV4';
  const reflData = (typeof store !== 'undefined' && store.read) ? store.read(key, {}) : {};
  const refl = reflData.text || '';
  const esc = (typeof store !== 'undefined' && store.escapeHtml) ? store.escapeHtml : (v => String(v || ''));

  const name = document.querySelector('[data-eco-name]')?.textContent?.trim() || 'Sahabat Bumi';
  const questions = window.ANSWER_ESSAY25 || [];

  const rows = questions.map((q, i) => {
    const d = (typeof discussV4Text === 'function') ? discussV4Text(i) : '';
    const e = (typeof explainV4Text === 'function') ? explainV4Text(i) : '';
    return `<section>
      <h3>Soal ${i + 1} · Materi ${q.mat}</h3>
      <p><b>Pertanyaan:</b> ${esc(q.q)}</p>
      <div class="cols">
        <div><b>Hasil DISCUSS</b><p>${esc(d || 'Belum diisi.')}</p></div>
        <div><b>Hasil EXPLAIN</b><p>${esc(e || 'Belum diisi.')}</p></div>
      </div>
    </section>`;
  }).join('');

  const w = window.open('', '_blank', 'width=1000,height=800');
  if (!w) {
    alert('Izinkan pop-up untuk mencetak laporan.');
    return;
  }

  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Laporan DISCUSS–EXPLAIN</title><style>body{font-family:Arial,sans-serif;color:#1f2937;max-width:900px;margin:30px auto;padding:0 20px}h1{color:#1f5f3a}section{break-inside:avoid;border:1px solid #dce5df;border-radius:10px;padding:14px;margin:12px 0}h3{margin:0 0 8px;font-size:15px}.cols{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cols>div{border-radius:8px;padding:10px}.cols>div:first-child{background:#fff8e8}.cols>div:last-child{background:#f0fdf4}p{font-size:13px;line-height:1.55;white-space:pre-wrap}.ref{background:#f5f7fb;padding:12px;border-radius:9px}@media print{button{display:none}}@media(max-width:650px){.cols{grid-template-columns:1fr}}</style></head><body><h1>Laporan Hasil Kerja DISCUSS &amp; EXPLAIN</h1><p><b>Nama:</b> ${esc(name)}</p><p>Laporan ini memperlihatkan perubahan jawaban setelah diskusi kelompok dan setelah tahap penjelasan kelas.</p>${rows}<div class="ref"><b>Refleksi Perbandingan</b><p>${esc(refl || 'Belum diisi.')}</p></div><button onclick="window.print()">Cetak</button></body></html>`);
  w.document.close();
}

function flowBuildCertificate() {
  const el = document.getElementById('flowCertificate');
  if (!el) return;

  const student = (typeof ecoStudent !== 'undefined') ? ecoStudent : { name: '', kelas: '', school: '' };
  const nameEl = document.getElementById('flowCertName');
  const metaEl = document.getElementById('flowCertMeta');

  if (nameEl) nameEl.textContent = student.name || 'Sahabat Bumi';
  if (metaEl) metaEl.textContent = [student.kelas, student.school].filter(Boolean).join(' · ') || 'Siswa Kelas V';

  el.classList.add('show');
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function flowPrintCertificate() {
  const c = document.getElementById('flowCertificate');
  if (!c) return;
  flowBuildCertificate();

  const student = (typeof ecoStudent !== 'undefined') ? ecoStudent : { name: '', kelas: '', school: '' };
  const w = window.open('', '_blank', 'width=900,height=650');
  if (!w) {
    alert('Izinkan pop-up untuk mencetak sertifikat.');
    return;
  }

  const name = student.name || 'Sahabat Bumi';
  const meta = [student.kelas, student.school].filter(Boolean).join(' · ');

  w.document.write(`<html><head><title>Sertifikat Ecomedia RADEC</title><style>body{font-family:Arial;padding:40px;background:#f7f7f1}.cert{max-width:760px;margin:auto;border:8px double #b48a1b;padding:48px;text-align:center;background:#fffdf6}.name{font-size:28px;font-weight:bold;color:#17552f;margin:20px}.seal{font-size:48px}</style></head><body><div class="cert"><div>SERTIFIKAT PENYELESAIAN</div><h1>ECOMEDIA DIGITAL BERBASIS RADEC</h1><p>Diberikan kepada</p><div class="name">${name}</div><p>telah menyelesaikan pembelajaran <b>Perubahan Iklim</b> melalui tahapan<br><b>Read · Answer · Discuss · Explain · Create</b></p><div class="seal">🌍 🏅 🌱</div><p>${meta}</p></div><script>window.onload=()=>window.print()<\/script></body></html>`);
  w.document.close();
}

// Global window exposure
if (typeof window !== 'undefined') {
  window.reportMaterialV4 = reportMaterialV4;
  window.saveCompareReflection = saveCompareReflection;
  window.loadCompareReflection = loadCompareReflection;
  window.showReportMaterial = showReportMaterial;
  window.renderLearningReport = renderLearningReport;
  window.finishPrintLearningReport = finishPrintLearningReport;
  window.flowBuildCertificate = flowBuildCertificate;
  window.flowPrintCertificate = flowPrintCertificate;
}

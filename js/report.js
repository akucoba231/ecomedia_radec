/**
 * EcoMedia RADEC - REPORT & CERTIFICATE Module
 * Mengelola laporan perbandingan jawaban (DISCUSS vs EXPLAIN), cetak laporan,
 * serta pembuatan dan pencetakan sertifikat siswa.
 */

let reportMaterialV4 = 1;
let reportDiscussServerMap = {};
let reportExplainServerMap = {};
let reportGroupsByMateri = {};
let latestReportGroup = null;
let evaluasiRecordsByMateri = {};
let currentEvaluasiRecord = null;
let reportEvaluasiStudentId = '';

function reportEscapeHtml(str) {
  if (typeof store !== 'undefined' && typeof store.escapeHtml === 'function') {
    return store.escapeHtml(str);
  }
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getReportStudentProfile() {
  const student = (typeof window !== 'undefined' && window.ecoStudent) ||
                  (typeof ecoStudent !== 'undefined' ? ecoStudent : {});
  return {
    id_siswa: student.id_siswa ||
              (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID')) || '',
    name: student.name || student.nama ||
          (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentName')) || '',
    kelas: student.kelas ||
           (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentClass')) || '',
    school: student.school || student.sekolah ||
            (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentSchool')) || ''
  };
}

function setCompareReflectionStatus(tone, message) {
  const el = typeof document !== 'undefined' ? document.getElementById('compareReflectionStatus') : null;
  if (!el) return;
  el.textContent = message || '';
  el.className = `report-reflection-msg${tone ? ' ' + tone : ''}`;
}

function compareReflectionTouch() {
  setCompareReflectionStatus('', '');
}

function isStudentInGroupRecord(group, studentId) {
  if (!group || !studentId) return false;
  const target = String(studentId).trim();
  if (String(group.id_siswa || '').trim() === target) return true;
  if (!group.id_anggota) return false;
  try {
    const ids = typeof group.id_anggota === 'string' ? JSON.parse(group.id_anggota) : group.id_anggota;
    if (Array.isArray(ids) && ids.map(x => String(x).trim()).includes(target)) return true;
  } catch (e) {
    if (String(group.id_anggota).includes(target)) return true;
  }
  return false;
}

function getReportGroupSummary(materi = reportMaterialV4) {
  const matNum = Number(materi) || Number(reportMaterialV4) || 1;
  const grp = reportGroupsByMateri[matNum] ||
              latestReportGroup ||
              Object.values(reportGroupsByMateri)[0] ||
              (typeof window !== 'undefined' && window.currentKelompokExplain) ||
              (typeof currentKelompokExplain !== 'undefined' ? currentKelompokExplain : null);
  return {
    id_kelompok_discuss: grp && grp.id_kelompok_discuss != null ? grp.id_kelompok_discuss : (grp && grp.id_kelompok != null ? grp.id_kelompok : null),
    id_kelompok_explain: grp && grp.id_kelompok_explain != null ? grp.id_kelompok_explain : null,
    nama_kelompok: (grp && grp.nama_kelompok) || ''
  };
}

function getEvaluasiRecordForMaterial(materi = reportMaterialV4) {
  const matKey = String(materi || reportMaterialV4 || 1).trim();
  return evaluasiRecordsByMateri[matKey] || null;
}

function getReportDiscussText(idx) {
  if (Object.prototype.hasOwnProperty.call(reportDiscussServerMap, idx)) {
    return reportDiscussServerMap[idx] || '';
  }
  return (typeof discussV4Text === 'function') ? discussV4Text(idx) : '';
}

function getReportExplainText(idx) {
  if (Object.prototype.hasOwnProperty.call(reportExplainServerMap, idx)) {
    return reportExplainServerMap[idx] || '';
  }
  return (typeof explainV4Text === 'function') ? explainV4Text(idx) : '';
}

function countReportCompleted(getterFn) {
  const questions = (typeof window !== 'undefined' && window.ANSWER_ESSAY25) || [];
  return questions.filter((_, idx) => String(getterFn(idx) || '').trim().length >= 5).length;
}

function indexQuestionRowsById(rows, targetMap) {
  const questions = (typeof window !== 'undefined' && window.ANSWER_ESSAY25) || [];
  (rows || []).forEach(item => {
    if (!item) return;
    const idSoalStr = String(item.id_soal || '').trim();
    if (!idSoalStr || idSoalStr.includes('pertanyaan') || Number(item.from_answer) === 1) return;

    const qIdx = questions.findIndex((q, idx) => String(q.id_soal !== undefined ? q.id_soal : (idx + 1)) === idSoalStr);
    if (qIdx >= 0) {
      targetMap[qIdx] = String(item.jawaban !== undefined ? item.jawaban : (item.text || ''));
    }
  });
}

async function detectReportGroupsFromServer(student, api) {
  const criteria = {};
  if (student.kelas) criteria.kelas = student.kelas;
  if (student.school) criteria.sekolah = student.school;

  const byMateri = {};
  let latest = null;

  try {
    const res = await api.getWhere('kelompok_explain', criteria);
    const list = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
    list.filter(g => isStudentInGroupRecord(g, student.id_siswa)).forEach(g => {
      const m = Number(g.id_materi) || 1;
      byMateri[m] = g;
      latest = g;
    });
  } catch (err) {
    console.log(err);
  }

  // Failsafe jika tabel kelompok_explain kosong: cek kelompok_discuss
  if (!latest) {
    try {
      const resDisc = await api.getWhere('kelompok_discuss', criteria);
      const listDisc = Array.isArray(resDisc) ? resDisc : (resDisc && Array.isArray(resDisc.data) ? resDisc.data : []);
      listDisc.filter(g => isStudentInGroupRecord(g, student.id_siswa)).forEach(g => {
        const m = Number(g.id_materi) || 1;
        const normalized = {
          ...g,
          id_kelompok_discuss: g.id_kelompok_discuss || g.id_kelompok || g.id || null,
          id_kelompok_explain: null
        };
        byMateri[m] = normalized;
        latest = normalized;
      });
    } catch (err) {
      console.log(err);
    }
  }

  reportGroupsByMateri = byMateri;
  latestReportGroup = latest;
}

async function loadEvaluasiRefleksiFromServer() {
  const student = getReportStudentProfile();
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  const notifyChildStages = (recordsMap, mat, stuId) => {
    const fn = (typeof loadFinishEcoFromServer === 'function')
      ? loadFinishEcoFromServer
      : (typeof window !== 'undefined' ? window.loadFinishEcoFromServer : null);
    if (typeof fn === 'function') {
      fn(recordsMap, mat, stuId);
    }
    if (typeof restoreCertificateFromServer === 'function') {
      restoreCertificateFromServer(recordsMap, mat, stuId);
    }
  };

  if (reportEvaluasiStudentId !== student.id_siswa) {
    evaluasiRecordsByMateri = {};
    currentEvaluasiRecord = null;
    if (typeof window !== 'undefined') {
      window.evaluasiRecordsByMateri = {};
      window.currentEvaluasiRecord = null;
    }
    reportEvaluasiStudentId = student.id_siswa;
    const ta = typeof document !== 'undefined' ? document.getElementById('compareReflection') : null;
    if (ta) ta.value = '';
    setCompareReflectionStatus('', '');
    notifyChildStages({}, reportMaterialV4, student.id_siswa);
  }

  if (!student.id_siswa || !api || typeof api.getWhere !== 'function') {
    return null;
  }

  try {
    const res = await api.getWhere('evaluasi_refleksi_siswa', { id_siswa: student.id_siswa });
    const list = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
    const nextMap = {};

    if (list && list.length > 0) {
      list.forEach(rec => {
        if (!rec) return;
        const key = String(rec.id_materi || '1').trim();
        nextMap[key] = rec;
      });
      evaluasiRecordsByMateri = nextMap;
      currentEvaluasiRecord = nextMap[String(reportMaterialV4)] || list[0];
      if (typeof window !== 'undefined') {
        window.evaluasiRecordsByMateri = evaluasiRecordsByMateri;
        window.currentEvaluasiRecord = currentEvaluasiRecord;
      }
      loadCompareReflection();
      notifyChildStages(evaluasiRecordsByMateri, reportMaterialV4, student.id_siswa);
      return currentEvaluasiRecord;
    } else {
      evaluasiRecordsByMateri = {};
      currentEvaluasiRecord = null;
      if (typeof window !== 'undefined') {
        window.evaluasiRecordsByMateri = {};
        window.currentEvaluasiRecord = null;
      }
      loadCompareReflection();
      notifyChildStages({}, reportMaterialV4, student.id_siswa);
    }
  } catch (error) {
    console.log(error);
  }
  return null;
}

async function upsertEvaluasiRefleksiSiswa(partialFields, idMateri = reportMaterialV4) {
  const student = getReportStudentProfile();
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  if (!student.id_siswa) {
    throw new Error('Silakan masuk/login terlebih dahulu.');
  }
  if (!api || typeof api.getWhere !== 'function') {
    throw new Error('Layanan API tidak tersedia.');
  }

  const matKey = String(idMateri || reportMaterialV4 || 1).trim();
  if (!reportGroupsByMateri[Number(matKey)] && !latestReportGroup) {
    await detectReportGroupsFromServer(student, api);
  }
  const grp = getReportGroupSummary(matKey);

  const res = await api.getWhere('evaluasi_refleksi_siswa', { id_siswa: student.id_siswa, id_materi: matKey });
  const rawList = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
  const list = rawList.filter(r => String(r.id_materi || '').trim() === matKey);

  const commonMeta = {
    id_materi: matKey,
    kelas: student.kelas || '',
    sekolah: student.school || '',
    id_kelompok_discuss: grp.id_kelompok_discuss,
    id_kelompok_explain: grp.id_kelompok_explain,
    nama_kelompok: grp.nama_kelompok || ''
  };

  let savedRec = null;
  if (!list || list.length <= 0) {
    const postPayload = {
      id_evaluasi: '',
      id_siswa: student.id_siswa,
      ...commonMeta,
      tanggapan_siswa: '',
      ekoliterasi_siswa: '',
      sertifikat_siswa: '',
      ...partialFields
    };
    const postRes = await api.post('evaluasi_refleksi_siswa', postPayload);
    const newId = (postRes && (postRes.id_evaluasi || postRes.id || (postRes.data && (postRes.data.id_evaluasi || postRes.data.id)))) || '';
    savedRec = { ...postPayload, id_evaluasi: newId };
  } else {
    const existing = list[0];
    const idEvaluasi = existing.id_evaluasi !== undefined ? existing.id_evaluasi : existing.id;
    const patchPayload = {
      ...commonMeta,
      ...partialFields
    };
    await api.patch('evaluasi_refleksi_siswa', 'id_evaluasi', idEvaluasi, patchPayload);
    savedRec = { ...existing, ...patchPayload, id_evaluasi: idEvaluasi };
  }

  evaluasiRecordsByMateri[matKey] = savedRec;
  currentEvaluasiRecord = savedRec;
  if (typeof window !== 'undefined') {
    window.evaluasiRecordsByMateri = evaluasiRecordsByMateri;
    window.currentEvaluasiRecord = currentEvaluasiRecord;
  }
  return savedRec;
}

async function syncLearningReportFromServer() {
  const student = getReportStudentProfile();
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  if (!student.id_siswa || !api || typeof api.getWhere !== 'function') {
    reportDiscussServerMap = {};
    reportExplainServerMap = {};
    renderLearningReport();
    return;
  }

  await detectReportGroupsFromServer(student, api);

  const nextDiscussMap = {};
  const nextExplainMap = {};
  const fallbackGrp = latestReportGroup || Object.values(reportGroupsByMateri)[0] || null;
  const targetStudentId = String(student.id_siswa || '').trim();
  const filterByStudent = (rows) => (rows || []).filter(r => {
    if (!r) return false;
    const rowStu = String(r.id_siswa || '').trim();
    return !targetStudentId || rowStu === targetStudentId;
  });

  const materialTasks = [1, 2, 3, 4, 5].map(async (m) => {
    const grp = reportGroupsByMateri[m] || fallbackGrp;
    if (!grp) return;

    const idDiscuss = grp.id_kelompok_discuss || grp.id_kelompok || grp.id;
    const idExplain = grp.id_kelompok_explain || null;
    const tasks = [];

    if (idDiscuss) {
      tasks.push(
        api.getWhere('discuss', { id_kelompok: idDiscuss, id_materi: m, id_siswa: targetStudentId })
          .then(res => {
            const rows = filterByStudent(Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []));
            indexQuestionRowsById(rows, nextDiscussMap);
          })
          .catch(err => console.log(err))
      );

      tasks.push(
        api.getWhere('explain', { id_kelompok: idDiscuss, id_materi: m, id_siswa: targetStudentId })
          .then(async (res) => {
            let rows = filterByStudent(Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []));
            if ((!rows || rows.length === 0) && idExplain && String(idExplain) !== String(idDiscuss)) {
              const resAlt = await api.getWhere('explain', { id_kelompok: idExplain, id_materi: m, id_siswa: targetStudentId });
              rows = filterByStudent(Array.isArray(resAlt) ? resAlt : (resAlt && Array.isArray(resAlt.data) ? resAlt.data : []));
            }
            indexQuestionRowsById(rows, nextExplainMap);
          })
          .catch(err => console.log(err))
      );
    } else if (idExplain) {
      tasks.push(
        api.getWhere('explain', { id_kelompok: idExplain, id_materi: m, id_siswa: targetStudentId })
          .then(res => {
            const rows = filterByStudent(Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []));
            indexQuestionRowsById(rows, nextExplainMap);
          })
          .catch(err => console.log(err))
      );
    }

    await Promise.allSettled(tasks);
  });

  await Promise.allSettled([...materialTasks, loadEvaluasiRefleksiFromServer()]);

  reportDiscussServerMap = nextDiscussMap;
  reportExplainServerMap = nextExplainMap;
  renderLearningReport();
}

function initLearningReportStage() {
  renderLearningReport();
  return syncLearningReportFromServer();
}

async function saveCompareReflection() {
  const ta = typeof document !== 'undefined' ? document.getElementById('compareReflection') : null;
  const btn = typeof document !== 'undefined' ? document.getElementById('saveCompareReflectionBtn') : null;
  if (!ta) return { ok: false, reason: 'missing_element' };

  const val = ta.value.trim();
  if (!val) {
    setCompareReflectionStatus('warn', '⚠️ Tuliskan tanggapan perbandinganmu dahulu, ya.');
    if (typeof ta.focus === 'function') ta.focus();
    return { ok: false, reason: 'validation' };
  }

  const student = getReportStudentProfile();
  if (!student.id_siswa) {
    setCompareReflectionStatus('warn', 'Silakan masuk/login terlebih dahulu untuk menyimpan tanggapan ke server.');
    return { ok: false, reason: 'unauthenticated' };
  }

  const matKey = String(reportMaterialV4 || 1);
  if (btn) btn.disabled = true;
  setCompareReflectionStatus('info', '⏳ Jawaban sedang diproses...');

  try {
    await upsertEvaluasiRefleksiSiswa({ tanggapan_siswa: val }, matKey);
    renderLearningReport();
    setCompareReflectionStatus('ok', '✓ Jawaban sudah disimpan');
    return { ok: true, id_materi: matKey };
  } catch (error) {
    console.log(error);
    setCompareReflectionStatus('error', 'Ada masalah, coba lagi');
    return { ok: false, error };
  } finally {
    if (btn) btn.disabled = false;
  }
}

function loadCompareReflection() {
  const el = typeof document !== 'undefined' ? document.getElementById('compareReflection') : null;
  if (!el) return;
  const rec = getEvaluasiRecordForMaterial(reportMaterialV4);
  if (rec && typeof rec.tanggapan_siswa === 'string' && rec.tanggapan_siswa.trim()) {
    el.value = rec.tanggapan_siswa;
    setCompareReflectionStatus('ok', '✓ Jawaban sudah disimpan');
    return;
  }
  el.value = '';
  setCompareReflectionStatus('', '');
}

function showReportMaterial(m) {
  reportMaterialV4 = Number(m) || 1;
  if (typeof window !== 'undefined') window.reportMaterialV4 = reportMaterialV4;
  renderLearningReport();
}

function getReportQuestions(materi) {
  const m = Number(materi) || 1;
  const questions = (typeof window !== 'undefined' && window.ANSWER_ESSAY25) || [];
  if (typeof getQuestionsByMaterial === 'function') return getQuestionsByMaterial(m);
  if (typeof window !== 'undefined' && typeof window.getQuestionsByMaterial === 'function') {
    return window.getQuestionsByMaterial(m);
  }
  return questions.map((q, i) => ({ ...q, idx: i })).filter(q => q.mat === m);
}

function renderLearningReport() {
  const tabs = document.getElementById('reportMaterialTabs');
  const box = document.getElementById('learningReportContainer');
  if (!tabs || !box) return;

  if (Object.keys(reportDiscussServerMap).length === 0 && typeof loadDiscussAllV4 === 'function') {
    loadDiscussAllV4();
  }
  if (Object.keys(reportExplainServerMap).length === 0 && typeof loadExplainAllV4 === 'function') {
    loadExplainAllV4();
  }

  const questions = (typeof window !== 'undefined' && window.ANSWER_ESSAY25) || [];
  const totalQ = questions.length || 50;

  const dc = countReportCompleted(getReportDiscussText);
  const ec = countReportCompleted(getReportExplainText);
  const dt = document.getElementById('reportDiscussCount');
  const et = document.getElementById('reportExplainCount');
  if (dt) dt.textContent = dc + '/' + totalQ;
  if (et) et.textContent = ec + '/' + totalQ;

  tabs.innerHTML = [1, 2, 3, 4, 5].map(m => {
    const rec = getEvaluasiRecordForMaterial(m);
    const hasRefl = !!(rec && rec.tanggapan_siswa && rec.tanggapan_siswa.trim());
    return `<button type="button" class="${m === reportMaterialV4 ? 'active' : ''}" onclick="showReportMaterial(${m})">Materi ${m}${hasRefl ? ' ✓' : ''}</button>`;
  }).join('');

  const arr = getReportQuestions(reportMaterialV4);

  box.innerHTML = arr.map((x, order) => {
    const d = getReportDiscussText(x.idx);
    const e = getReportExplainText(x.idx);
    return `<article class="learning-report-item">
      <h4>Soal ${order + 1}. ${reportEscapeHtml(x.q)}</h4>
      <div class="learning-report-compare">
        <div class="learning-report-col discuss">
          <b>💬 HASIL DISCUSS</b>
          <p class="${d ? '' : 'empty'}">${d ? reportEscapeHtml(d) : 'Belum diisi.'}</p>
        </div>
        <div class="learning-report-col explain">
          <b>🗣️ HASIL EXPLAIN</b>
          <p class="${e ? '' : 'empty'}">${e ? reportEscapeHtml(e) : 'Belum diisi.'}</p>
        </div>
      </div>
    </article>`;
  }).join('');

  loadCompareReflection();
}

function getSharedPdfHelpers() {
  const g = typeof window !== 'undefined' ? window : globalThis;
  const createCanvas = (typeof createOffscreenCanvas === 'function') ? createOffscreenCanvas : g.createOffscreenCanvas;
  const roundRect = (typeof drawRoundedRect === 'function') ? drawRoundedRect : g.drawRoundedRect;
  const wrapLines = (typeof wrapCanvasLines === 'function') ? wrapCanvasLines : g.wrapCanvasLines;
  const drawLines = (typeof drawWrappedTextLines === 'function') ? drawWrappedTextLines : g.drawWrappedTextLines;
  const buildPdf = (typeof buildPdfFromJpegPages === 'function') ? buildPdfFromJpegPages : g.buildPdfFromJpegPages;
  const sanitizeName = (typeof sanitizeCreateFilename === 'function') ? sanitizeCreateFilename : g.sanitizeCreateFilename;
  const triggerDl = (typeof triggerCreateFileDownload === 'function') ? triggerCreateFileDownload : g.triggerCreateFileDownload;

  if (!createCanvas || !roundRect || !wrapLines || !drawLines || !buildPdf || !triggerDl) {
    return null;
  }
  return { createCanvas, roundRect, wrapLines, drawLines, buildPdf, sanitizeName, triggerDl };
}

function drawLearningReportPageHeader(ctx, helpers, opts) {
  const { roundRect, wrapLines, drawLines } = helpers;
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, 1240, 1754);

  if (opts.pageIndex === 0) {
    const headGrad = ctx.createLinearGradient(60, 52, 1180, 222);
    headGrad.addColorStop(0, '#1E3A8A');
    headGrad.addColorStop(1, '#2563EB');
    roundRect(ctx, 60, 52, 1120, 166, 24, headGrad);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 32px Sora, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(opts.reportTitle || '📘 LAPORAN HASIL KERJA: DISCUSS & EXPLAIN', 96, 116);

    ctx.fillStyle = '#DBEAFE';
    ctx.font = '700 22px Nunito, Arial, sans-serif';
    const topicLines = wrapLines(ctx, `Materi ${opts.materi}${opts.topic ? ' — ' + opts.topic : ''}`, 760);
    drawLines(ctx, topicLines, 96, 162, 30, 'left', 2);

    roundRect(ctx, 926, 84, 220, 44, 22, 'rgba(255,255,255,0.18)');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 19px Nunito, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`📅 ${opts.date}`, 1036, 113);

    // Strip identitas siswa & kelompok
    roundRect(ctx, 60, 234, 1120, 108, 16, '#FFFFFF', '#CBD5E1', 2);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1E293B';
    ctx.font = '800 21px Nunito, Arial, sans-serif';
    ctx.fillText(`👤 Siswa: ${opts.studentName}`, 92, 276);
    ctx.fillText(`👥 Kelompok: ${opts.groupName || '-'}`, 640, 276);
    ctx.fillStyle = '#475569';
    ctx.font = '700 19px Nunito, Arial, sans-serif';
    ctx.fillText(`🏫 Kelas / Sekolah: ${opts.schoolMeta || '-'}`, 92, 316);
    ctx.fillText(`📊 Terisi (Materi ${opts.materi}): DISCUSS ${opts.doneDisc}/${opts.totalMat} · EXPLAIN ${opts.doneExp}/${opts.totalMat}`, 640, 316);
    return 364;
  }

  roundRect(ctx, 60, 52, 1120, 70, 16, '#EFF6FF', '#BFDBFE', 2);
  ctx.fillStyle = '#1E3A8A';
  ctx.font = '800 22px Sora, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(opts.continuationTitle || `📘 Lanjutan Laporan DISCUSS & EXPLAIN · Materi ${opts.materi}`, 90, 96);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#1D4ED8';
  ctx.font = '700 19px Nunito, Arial, sans-serif';
  ctx.fillText(`👥 Kelompok: ${opts.groupName || '-'}`, 1148, 96);
  ctx.textAlign = 'left';
  return 146;
}

function renderLearningReportPdfPages(opts, helpers) {
  const { createCanvas, roundRect, wrapLines, drawLines } = helpers;
  const pages = [];
  let pageObj = createCanvas(1240, 1754);
  if (!pageObj) return null;

  let curY = drawLearningReportPageHeader(pageObj.ctx, helpers, { ...opts, pageIndex: 0 });
  const pushAndStartNewPage = () => {
    pages.push(pageObj);
    pageObj = createCanvas(1240, 1754);
    curY = drawLearningReportPageHeader(pageObj.ctx, helpers, { ...opts, pageIndex: pages.length });
  };

  opts.items.forEach((item, order) => {
    const ctx = pageObj.ctx;
    ctx.font = '800 22px Sora, Arial, sans-serif';
    const qLines = wrapLines(ctx, `Soal ${order + 1}. ${item.q}`, 1060).slice(0, 3);
    ctx.font = '600 19px Nunito, Arial, sans-serif';
    const dLines = wrapLines(ctx, item.discuss || 'Belum diisi.', 488).slice(0, 7);
    const eLines = wrapLines(ctx, item.explain || 'Belum diisi.', 488).slice(0, 7);

    const qH = qLines.length * 30;
    const colH = Math.max(104, 48 + Math.max(dLines.length, eLines.length) * 28 + 16);
    const cardH = 20 + qH + 14 + colH + 18;

    if (curY + cardH > 1648) {
      pushAndStartNewPage();
    }

    const activeCtx = pageObj.ctx;
    roundRect(activeCtx, 60, curY, 1120, cardH, 16, '#FFFFFF', '#DCE5DF', 2);

    activeCtx.fillStyle = '#1E293B';
    activeCtx.font = '800 22px Sora, Arial, sans-serif';
    drawLines(activeCtx, qLines, 88, curY + 42, 30, 'left', 3);

    const colsY = curY + 20 + qH + 14;
    // Kolom kiri: DISCUSS
    roundRect(activeCtx, 88, colsY, 522, colH, 12, '#FFF8E9', '#F3D39A', 1.5);
    activeCtx.fillStyle = '#9A5806';
    activeCtx.font = '800 17px Nunito, Arial, sans-serif';
    activeCtx.textAlign = 'left';
    activeCtx.fillText('💬 HASIL DISCUSS', 106, colsY + 30);
    activeCtx.fillStyle = item.discuss ? '#374151' : '#94A3B8';
    activeCtx.font = '600 19px Nunito, Arial, sans-serif';
    drawLines(activeCtx, dLines, 106, colsY + 62, 28, 'left', 7);

    // Kolom kanan: EXPLAIN
    roundRect(activeCtx, 630, colsY, 522, colH, 12, '#F0FDF4', '#BBF7D0', 1.5);
    activeCtx.fillStyle = '#166534';
    activeCtx.font = '800 17px Nunito, Arial, sans-serif';
    activeCtx.textAlign = 'left';
    activeCtx.fillText('🗣️ HASIL EXPLAIN', 648, colsY + 30);
    activeCtx.fillStyle = item.explain ? '#374151' : '#94A3B8';
    activeCtx.font = '600 19px Nunito, Arial, sans-serif';
    drawLines(activeCtx, eLines, 648, colsY + 62, 28, 'left', 7);

    curY += cardH + 14;
  });

  // Kotak Refleksi Perbandingan untuk Materi aktif
  const tmpCtx = pageObj.ctx;
  tmpCtx.font = '600 20px Nunito, Arial, sans-serif';
  const reflLines = wrapLines(tmpCtx, opts.reflection || 'Belum diisi.', 1052).slice(0, 8);
  const reflH = Math.max(118, 66 + reflLines.length * 30 + 20);
  if (curY + reflH > 1648) {
    pushAndStartNewPage();
  }

  const fCtx = pageObj.ctx;
  roundRect(fCtx, 60, curY, 1120, reflH, 16, '#F1F5F9', '#CBD5E1', 2);
  fCtx.fillStyle = '#1E3A8A';
  fCtx.font = '800 20px Sora, Arial, sans-serif';
  fCtx.textAlign = 'left';
  fCtx.fillText(`🔎 Refleksi Perbandingan Siswa (Materi ${opts.materi})`, 88, curY + 40);
  fCtx.fillStyle = '#334155';
  fCtx.font = '600 20px Nunito, Arial, sans-serif';
  drawLines(fCtx, reflLines, 88, curY + 78, 30, 'left', 8);
  curY += reflH + 14;

  // Opsional Bagian 4: Sisipkan Grafik & Umpan Balik Ekoliterasi Siswa
  if (opts.includeEkoliterasi) {
    const eco = opts.ekoliterasi || {};
    const ecoSkor = eco.skor || { tahu: 0, peduli: 0, aksi: 0, answered: 0, total: 0 };
    const ecoFeedbackText = String(eco.umpanBalik || '').trim() || 'Profil ekoliterasi belum diisi oleh siswa.';

    const fbCtx = pageObj.ctx;
    fbCtx.font = '600 19px Nunito, Arial, sans-serif';
    const ecoFeedbackLines = wrapLines(fbCtx, ecoFeedbackText, 1004).slice(0, 5);
    const ecoFeedbackBoxH = Math.max(74, 28 + ecoFeedbackLines.length * 28 + 16);
    const ecoCardH = 92 + (3 * 52) + 18 + ecoFeedbackBoxH + 24;

    if (curY + ecoCardH > 1648) {
      pushAndStartNewPage();
    }

    const eCtx = pageObj.ctx;
    roundRect(eCtx, 60, curY, 1120, ecoCardH, 16, '#FFFFFF', '#A7DFB6', 2);

    eCtx.fillStyle = '#0A4A22';
    eCtx.font = '800 22px Sora, Arial, sans-serif';
    eCtx.textAlign = 'left';
    eCtx.fillText('🌿 Grafik Profil Ekoliterasi Siswa', 88, curY + 42);

    eCtx.fillStyle = eco.available ? '#15803D' : '#B45309';
    eCtx.font = '700 17px Nunito, Arial, sans-serif';
    eCtx.textAlign = 'right';
    const ecoStatusTxt = eco.available
      ? (ecoSkor.total > 0 ? `Terisi ${ecoSkor.answered || ecoSkor.total}/${ecoSkor.total} pernyataan` : 'Profil Ekoliterasi Tersimpan')
      : 'Belum diisi';
    eCtx.fillText(ecoStatusTxt, 1148, curY + 42);
    eCtx.textAlign = 'left';

    const dims = [
      { key: 'tahu', label: 'Aku tahu', color: '#1266AE' },
      { key: 'peduli', label: 'Aku peduli', color: '#C4213C' },
      { key: 'aksi', label: 'Aku bertindak', color: '#157F3D' }
    ];

    let barY = curY + 86;
    const trackX = 278;
    const trackW = 780;
    const trackH = 24;

    dims.forEach(dim => {
      const pct = Math.max(0, Math.min(100, Math.round(Number(ecoSkor[dim.key]) || 0)));
      eCtx.fillStyle = '#1E293B';
      eCtx.font = '800 19px Nunito, Arial, sans-serif';
      eCtx.textAlign = 'left';
      eCtx.fillText(dim.label, 88, barY + 19);

      roundRect(eCtx, trackX, barY, trackW, trackH, 12, '#EBF2EC', '#CBD5E1', 1.5);
      if (pct > 0) {
        const fillW = Math.max(22, Math.round((pct / 100) * trackW));
        roundRect(eCtx, trackX, barY, Math.min(trackW, fillW), trackH, 12, dim.color);
      }

      eCtx.fillStyle = dim.color;
      eCtx.font = '800 19px Nunito, Arial, sans-serif';
      eCtx.textAlign = 'right';
      eCtx.fillText(`${pct}%`, 1148, barY + 19);
      eCtx.textAlign = 'left';

      barY += 52;
    });

    const fbY = barY + 10;
    roundRect(
      eCtx,
      88,
      fbY,
      1064,
      ecoFeedbackBoxH,
      12,
      eco.available ? '#DDF6E4' : '#FEF3C7',
      eco.available ? '#86EFAC' : '#FCD34D',
      1.5
    );
    roundRect(eCtx, 88, fbY, 8, ecoFeedbackBoxH, 4, eco.available ? '#157F3D' : '#D97706');
    eCtx.fillStyle = eco.available ? '#0A4A22' : '#92400E';
    eCtx.font = '600 19px Nunito, Arial, sans-serif';
    drawLines(eCtx, ecoFeedbackLines, 114, fbY + 34, 28, 'left', 5);

    curY += ecoCardH + 14;
  }

  pages.push(pageObj);

  // Footer halaman pada seluruh halaman PDF
  pages.forEach((p, idx) => {
    const pCtx = p.ctx;
    pCtx.fillStyle = '#64748B';
    pCtx.font = '700 17px Nunito, Arial, sans-serif';
    pCtx.textAlign = 'center';
    const footPrefix = opts.footerTitle || `EcoMedia RADEC · Laporan DISCUSS–EXPLAIN Materi ${opts.materi}`;
    pCtx.fillText(`${footPrefix} · Halaman ${idx + 1} dari ${pages.length}`, 620, 1702);
  });

  return pages.map(p => ({
    dataUrl: p.canvas.toDataURL('image/jpeg', 0.92),
    widthPx: p.canvas.width,
    heightPx: p.canvas.height,
    pageW: 595,
    pageH: 842
  }));
}

function resolveEkoliterasiForPdf(materi = reportMaterialV4) {
  const recPrimary = getEvaluasiRecordForMaterial(materi);
  const candidate = (recPrimary && recPrimary.ekoliterasi_siswa && String(recPrimary.ekoliterasi_siswa).trim())
    ? recPrimary
    : Object.values(evaluasiRecordsByMateri).find(r => r && r.ekoliterasi_siswa && String(r.ekoliterasi_siswa).trim());

  if (candidate && candidate.ekoliterasi_siswa) {
    let parsed = null;
    try {
      parsed = typeof candidate.ekoliterasi_siswa === 'string'
        ? JSON.parse(candidate.ekoliterasi_siswa)
        : candidate.ekoliterasi_siswa;
    } catch (e) {
      parsed = null;
    }
    if (parsed && typeof parsed === 'object') {
      const rawSkor = (parsed.skor && typeof parsed.skor === 'object') ? parsed.skor : {};
      return {
        available: true,
        source: 'server',
        skor: {
          tahu: Math.max(0, Math.min(100, Math.round(Number(rawSkor.tahu) || 0))),
          peduli: Math.max(0, Math.min(100, Math.round(Number(rawSkor.peduli) || 0))),
          aksi: Math.max(0, Math.min(100, Math.round(Number(rawSkor.aksi) || 0))),
          answered: Number(rawSkor.answered) || 0,
          total: Number(rawSkor.total) || 0
        },
        umpanBalik: String(parsed.umpan_balik || '').replace(/<[^>]+>/g, '').trim()
      };
    }
  }

  const scoresFn = (typeof finishScores === 'function')
    ? finishScores
    : ((typeof window !== 'undefined' && typeof window.finishScores === 'function') ? window.finishScores : null);
  const verdictFn = (typeof buildEcoVerdictMessage === 'function')
    ? buildEcoVerdictMessage
    : ((typeof window !== 'undefined' && typeof window.buildEcoVerdictMessage === 'function') ? window.buildEcoVerdictMessage : null);

  if (scoresFn) {
    const sc = scoresFn();
    if (sc && Number(sc.answered) > 0) {
      const rawVerdict = verdictFn ? verdictFn(sc) : '';
      return {
        available: true,
        source: 'local',
        skor: {
          tahu: Math.max(0, Math.min(100, Math.round(Number(sc.tahu) || 0))),
          peduli: Math.max(0, Math.min(100, Math.round(Number(sc.peduli) || 0))),
          aksi: Math.max(0, Math.min(100, Math.round(Number(sc.aksi) || 0))),
          answered: Number(sc.answered) || 0,
          total: Number(sc.total) || 0
        },
        umpanBalik: String(rawVerdict || '').replace(/<[^>]+>/g, '').trim()
      };
    }
  }

  return {
    available: false,
    source: 'none',
    skor: { tahu: 0, peduli: 0, aksi: 0, answered: 0, total: 0 },
    umpanBalik: 'Profil ekoliterasi belum diisi oleh siswa pada tahap sebelumnya.'
  };
}

function buildStudentFileIdentitySlug(name, kelas, school, sanitizeFn) {
  const sanitize = typeof sanitizeFn === 'function'
    ? sanitizeFn
    : (raw, fb = '') => {
        const clean = String(raw || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 36);
        return clean || fb;
      };

  const nameSlug = sanitize(name, 'siswa');
  const rawKelasSlug = sanitize(kelas, '');
  const kelasSlug = rawKelasSlug
    ? (rawKelasSlug.startsWith('kelas') ? rawKelasSlug : `kelas-${rawKelasSlug}`)
    : '';
  const schoolSlug = sanitize(school, '');

  return [nameSlug, kelasSlug, schoolSlug].filter(Boolean).join('-');
}

function setReportPdfDownloadStatus(statusTarget, tone, msg) {
  if (statusTarget === 'saveCard') {
    const saveCardFn = (typeof setFinishSaveActionStatus === 'function')
      ? setFinishSaveActionStatus
      : ((typeof window !== 'undefined' && typeof window.setFinishSaveActionStatus === 'function') ? window.setFinishSaveActionStatus : null);
    if (saveCardFn) {
      saveCardFn(tone, msg);
      return;
    }
  }
  setCompareReflectionStatus(tone, msg);
}

function finishPrintLearningReport(options = {}) {
  const includeEkoliterasi = !!(options && options.includeEkoliterasi);
  const statusTarget = (options && options.statusTarget) || (includeEkoliterasi ? 'saveCard' : 'compare');

  const helpers = getSharedPdfHelpers();
  if (!helpers) {
    setReportPdfDownloadStatus(statusTarget, 'error', 'Ada masalah saat menyiapkan pembuat PDF, coba muat ulang halaman.');
    return { ok: false, reason: 'missing_pdf_helpers' };
  }

  const curMateri = Number(reportMaterialV4) || 1;
  const arr = getReportQuestions(curMateri);
  const student = getReportStudentProfile();
  const grp = getReportGroupSummary(curMateri);
  const rec = getEvaluasiRecordForMaterial(curMateri);

  const taVal = document.getElementById('compareReflection')?.value?.trim() || '';
  const refl = taVal || (rec && rec.tanggapan_siswa) || '';
  const studentName = student.name || document.querySelector('[data-eco-name]')?.textContent?.trim() || 'Sahabat Bumi';
  const schoolMeta = [student.kelas ? `Kelas ${student.kelas}` : '', student.school].filter(Boolean).join(' · ');

  const items = arr.map(x => ({
    q: x.q,
    discuss: getReportDiscussText(x.idx),
    explain: getReportExplainText(x.idx)
  }));
  const doneDisc = items.filter(it => String(it.discuss || '').trim().length >= 5).length;
  const doneExp = items.filter(it => String(it.explain || '').trim().length >= 5).length;
  const ekoliterasi = includeEkoliterasi ? resolveEkoliterasiForPdf(curMateri) : null;

  const pageImages = renderLearningReportPdfPages({
    materi: curMateri,
    topic: (arr[0] && arr[0].topic) || '',
    studentName,
    groupName: grp.nama_kelompok || '-',
    schoolMeta,
    doneDisc,
    doneExp,
    totalMat: arr.length,
    items,
    reflection: refl,
    includeEkoliterasi,
    ekoliterasi,
    reportTitle: includeEkoliterasi ? '📘 LAPORAN HASIL BELAJAR & EKOLITERASI' : undefined,
    continuationTitle: includeEkoliterasi ? `📘 Lanjutan Laporan Belajar · Materi ${curMateri}` : undefined,
    footerTitle: includeEkoliterasi ? `EcoMedia RADEC · Laporan Belajar Lengkap Materi ${curMateri}` : undefined,
    date: new Date().toLocaleDateString('id-ID')
  }, helpers);

  if (!pageImages || pageImages.length === 0) {
    setReportPdfDownloadStatus(statusTarget, 'error', 'Ada masalah saat membuat PDF, coba lagi.');
    return { ok: false, reason: 'no_canvas' };
  }

  const pdfBytes = helpers.buildPdf(pageImages);
  const blob = typeof Blob !== 'undefined' ? new Blob([pdfBytes], { type: 'application/pdf' }) : pdfBytes;
  const identitySlug = buildStudentFileIdentitySlug(studentName, student.kelas, student.school, helpers.sanitizeName);
  const filename = includeEkoliterasi
    ? `laporan-belajar-lengkap-materi-${curMateri}-${identitySlug}.pdf`
    : `laporan-discuss-explain-materi-${curMateri}-${identitySlug}.pdf`;
  helpers.triggerDl(blob, filename);

  const successMsg = includeEkoliterasi
    ? `📄 Laporan belajar PDF Materi ${curMateri} ("${filename}") berhasil diunduh.`
    : `📄 Laporan PDF Materi ${curMateri} ("${filename}") berhasil diunduh.`;
  setReportPdfDownloadStatus(statusTarget, 'ok', successMsg);
  return {
    ok: true,
    format: 'pdf',
    includeEkoliterasi,
    ekoliterasi,
    materi: curMateri,
    pageCount: pageImages.length,
    filename,
    pdfBytes
  };
}

function finishPrintFullLearningReport() {
  return finishPrintLearningReport({
    includeEkoliterasi: true,
    statusTarget: 'saveCard'
  });
}

let _lastCertStudentId = '';

function setFlowCertStatus(tone, message) {
  const el = typeof document !== 'undefined' ? document.getElementById('flowCertStatus') : null;
  if (!el) return;
  el.textContent = message || '';
  el.className = `flow-cert-msg${tone ? ' ' + tone : ''}`;
}

function buildCertificateData() {
  const student = getReportStudentProfile();
  const nama = student.name || 'Sahabat Bumi';
  const meta = [student.kelas, student.school].filter(Boolean).join(' · ') || 'Siswa Kelas V';
  return {
    judul: 'SERTIFIKAT PENYELESAIAN',
    program: 'ECOMEDIA DIGITAL BERBASIS RADEC',
    topik: 'Perubahan Iklim',
    tahapan: 'Read · Answer · Discuss · Explain · Create',
    id_siswa: student.id_siswa || '',
    nama,
    kelas: student.kelas || '',
    sekolah: student.school || '',
    meta,
    issued_at: new Date().toISOString()
  };
}

function renderCertificatePreviewDom(certData, shouldScroll = true) {
  const el = typeof document !== 'undefined' ? document.getElementById('flowCertificate') : null;
  if (!el) return;

  const nameEl = document.getElementById('flowCertName');
  const metaEl = document.getElementById('flowCertMeta');
  if (nameEl) nameEl.textContent = certData.nama || 'Sahabat Bumi';
  if (metaEl) metaEl.textContent = certData.meta || 'Siswa Kelas V';

  el.classList.add('show');
  if (shouldScroll && typeof el.scrollIntoView === 'function') {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function restoreCertificateFromServer(recordsMap, activeMateri = reportMaterialV4, studentId = getReportStudentProfile().id_siswa) {
  if (studentId !== _lastCertStudentId) {
    _lastCertStudentId = studentId;
    const certEl = typeof document !== 'undefined' ? document.getElementById('flowCertificate') : null;
    if (certEl && certEl.classList) certEl.classList.remove('show');
    const nameEl = typeof document !== 'undefined' ? document.getElementById('flowCertName') : null;
    if (nameEl) nameEl.textContent = 'Sahabat Bumi';
    const metaEl = typeof document !== 'undefined' ? document.getElementById('flowCertMeta') : null;
    if (metaEl) metaEl.textContent = '';
    setFlowCertStatus('', '');
  }

  if (!recordsMap || typeof recordsMap !== 'object') return false;

  const matKey = String(activeMateri || 1).trim();
  const primary = recordsMap[matKey];
  const candidate = (primary && primary.sertifikat_siswa && String(primary.sertifikat_siswa).trim())
    ? primary
    : Object.values(recordsMap).find(r => r && r.sertifikat_siswa && String(r.sertifikat_siswa).trim());

  if (!candidate) return false;

  let parsed = null;
  try {
    parsed = typeof candidate.sertifikat_siswa === 'string'
      ? JSON.parse(candidate.sertifikat_siswa)
      : candidate.sertifikat_siswa;
  } catch (e) {
    parsed = null;
  }
  if (!parsed || typeof parsed !== 'object') return false;

  renderCertificatePreviewDom(parsed, false);
  setFlowCertStatus('ok', '✓ Sertifikat sudah tersimpan');
  return true;
}

async function flowBuildCertificate() {
  const el = document.getElementById('flowCertificate');
  if (!el) return { ok: false, reason: 'missing_element' };

  const certData = buildCertificateData();
  renderCertificatePreviewDom(certData, true);

  const student = getReportStudentProfile();
  if (!student.id_siswa) {
    setFlowCertStatus('ok', '✓ Sertifikat ditampilkan (masuk/login untuk menyimpan ke server).');
    return { ok: true, localOnly: true, certData };
  }

  const matKey = String(reportMaterialV4 || 1).trim();
  const btn = document.getElementById('flowBuildCertBtn');
  if (btn) btn.disabled = true;
  setFlowCertStatus('info', '⏳ Jawaban sedang diproses...');

  try {
    await upsertEvaluasiRefleksiSiswa({ sertifikat_siswa: JSON.stringify(certData) }, matKey);
    setFlowCertStatus('ok', '✓ Sertifikat sudah disimpan');
    return { ok: true, id_materi: matKey, certData };
  } catch (error) {
    console.log(error);
    setFlowCertStatus('error', 'Ada masalah, coba lagi');
    return { ok: false, error };
  } finally {
    if (btn) btn.disabled = false;
  }
}

function renderCertificateToPdfCanvas(certData, helpers) {
  const { createCanvas, roundRect, wrapLines, drawLines } = helpers;
  const res = createCanvas(1754, 1240);
  if (!res) return null;
  const { canvas, ctx } = res;

  // Latar krem resmi sertifikat
  ctx.fillStyle = '#FFFDF6';
  ctx.fillRect(0, 0, 1754, 1240);

  // Bingkai emas ganda sesuai referensi .flow-certificate
  roundRect(ctx, 56, 56, 1642, 1128, 28, '#FFFEF8', '#B48A1B', 10);
  roundRect(ctx, 78, 78, 1598, 1084, 20, null, '#D9C27C', 3.5);

  // Aksen pita hijau atas & bawah
  roundRect(ctx, 637, 130, 480, 46, 23, '#FEF3C7', '#D9C27C', 1.5);
  ctx.fillStyle = '#9A7419';
  ctx.font = '800 22px Nunito, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(certData.judul || 'SERTIFIKAT PENYELESAIAN', 877, 161);

  ctx.fillStyle = '#725214';
  ctx.font = '800 54px Sora, Arial, sans-serif';
  ctx.fillText(certData.program || 'ECOMEDIA DIGITAL BERBASIS RADEC', 877, 260);

  // Garis hias emas di bawah judul
  roundRect(ctx, 727, 294, 300, 6, 3, '#D9C27C');

  ctx.fillStyle = '#635D4B';
  ctx.font = '600 30px Nunito, Arial, sans-serif';
  ctx.fillText('Diberikan kepada', 877, 386);

  // Nama siswa menonjol dengan garis bawah emas
  ctx.fillStyle = '#17552F';
  ctx.font = '800 62px Sora, Arial, sans-serif';
  const nameLines = wrapLines(ctx, certData.nama || 'Sahabat Bumi', 1320).slice(0, 2);
  const afterNameY = drawLines(ctx, nameLines, 877, 488, 72, 'center', 2);

  roundRect(ctx, 437, afterNameY - 8, 880, 4, 2, '#D9C27C');

  ctx.fillStyle = '#4B5563';
  ctx.font = '600 30px Nunito, Arial, sans-serif';
  ctx.fillText(`telah menyelesaikan pembelajaran ${certData.topik || 'Perubahan Iklim'} melalui tahapan`, 877, afterNameY + 72);

  ctx.fillStyle = '#17552F';
  ctx.font = '800 34px Sora, Arial, sans-serif';
  ctx.fillText(certData.tahapan || 'Read · Answer · Discuss · Explain · Create', 877, afterNameY + 128);

  // Segel emblem sertifikat
  ctx.font = '104px Apple Color Emoji, Segoe UI Emoji, Arial, sans-serif';
  ctx.fillText('🌍 🏅 🌱', 877, afterNameY + 264);

  // Metadata individu (kelas · sekolah)
  ctx.fillStyle = '#635D4B';
  ctx.font = '700 28px Nunito, Arial, sans-serif';
  ctx.fillText(certData.meta || 'Siswa Kelas V', 877, 1084);

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.92),
    widthPx: canvas.width,
    heightPx: canvas.height,
    pageW: 842,
    pageH: 595
  };
}

function flowPrintCertificate() {
  const helpers = getSharedPdfHelpers();
  if (!helpers) {
    setFlowCertStatus('error', 'Ada masalah saat menyiapkan pembuat PDF, coba muat ulang halaman.');
    return { ok: false, reason: 'missing_pdf_helpers' };
  }

  const certData = buildCertificateData();
  renderCertificatePreviewDom(certData, false);

  const pageImg = renderCertificateToPdfCanvas(certData, helpers);
  if (!pageImg) {
    setFlowCertStatus('error', 'Ada masalah saat membuat sertifikat PDF, coba lagi.');
    return { ok: false, reason: 'no_canvas' };
  }

  const pdfBytes = helpers.buildPdf([pageImg]);
  const blob = typeof Blob !== 'undefined' ? new Blob([pdfBytes], { type: 'application/pdf' }) : pdfBytes;
  const identitySlug = buildStudentFileIdentitySlug(certData.nama, certData.kelas, certData.sekolah, helpers.sanitizeName);
  const filename = `sertifikat-ecomedia-radec-${identitySlug}.pdf`;
  helpers.triggerDl(blob, filename);

  setFlowCertStatus('ok', `📄 Sertifikat PDF "${filename}" berhasil diunduh.`);
  return { ok: true, format: 'pdf', filename, pdfBytes };
}

// Global window exposure
if (typeof window !== 'undefined') {
  window.reportMaterialV4 = reportMaterialV4;
  window.compareReflectionTouch = compareReflectionTouch;
  window.saveCompareReflection = saveCompareReflection;
  window.loadCompareReflection = loadCompareReflection;
  window.getEvaluasiRecordForMaterial = getEvaluasiRecordForMaterial;
  window.loadEvaluasiRefleksiFromServer = loadEvaluasiRefleksiFromServer;
  window.upsertEvaluasiRefleksiSiswa = upsertEvaluasiRefleksiSiswa;
  window.syncLearningReportFromServer = syncLearningReportFromServer;
  window.initLearningReportStage = initLearningReportStage;
  window.showReportMaterial = showReportMaterial;
  window.renderLearningReport = renderLearningReport;
  window.resolveEkoliterasiForPdf = resolveEkoliterasiForPdf;
  window.buildStudentFileIdentitySlug = buildStudentFileIdentitySlug;
  window.finishPrintLearningReport = finishPrintLearningReport;
  window.finishPrintFullLearningReport = finishPrintFullLearningReport;
  window.setFlowCertStatus = setFlowCertStatus;
  window.buildCertificateData = buildCertificateData;
  window.restoreCertificateFromServer = restoreCertificateFromServer;
  window.flowBuildCertificate = flowBuildCertificate;
  window.flowPrintCertificate = flowPrintCertificate;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    compareReflectionTouch,
    saveCompareReflection,
    loadCompareReflection,
    getEvaluasiRecordForMaterial,
    getReportGroupSummary,
    loadEvaluasiRefleksiFromServer,
    upsertEvaluasiRefleksiSiswa,
    syncLearningReportFromServer,
    initLearningReportStage,
    showReportMaterial,
    renderLearningReport,
    renderLearningReportPdfPages,
    resolveEkoliterasiForPdf,
    buildStudentFileIdentitySlug,
    finishPrintLearningReport,
    finishPrintFullLearningReport,
    setFlowCertStatus,
    buildCertificateData,
    restoreCertificateFromServer,
    flowBuildCertificate,
    renderCertificateToPdfCanvas,
    flowPrintCertificate,
    getReportDiscussText,
    getReportExplainText
  };
}

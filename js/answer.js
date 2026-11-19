/**
 * EcoMedia RADEC - ANSWER Module (Tahap 2: Menjawab Soal Pra-Pembelajaran)
 * Mengelola 25 soal esai, auto-save jawaban, keyakinan pemahaman, dan penandaan diskusi kelompok.
 */

let answerEssayState = {};
let answerMetaState = {};
let answerEssayMaterial = 1;

function loadAnswerEssayState() {
  const essayKey = typeof ANSWER_ESSAY25_KEY !== 'undefined' ? ANSWER_ESSAY25_KEY : 'ecoRadecAnswerEssay25';
  const metaKey = typeof ANSWER_META_KEY !== 'undefined' ? ANSWER_META_KEY : 'ecoRadecAnswerMetaRev1';

  if (typeof store !== 'undefined' && store.read) {
    answerEssayState = store.read(essayKey, {});
    answerMetaState = store.read(metaKey, {});
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
  }
}

function saveAnswerEssayState() {
  const essayKey = typeof ANSWER_ESSAY25_KEY !== 'undefined' ? ANSWER_ESSAY25_KEY : 'ecoRadecAnswerEssay25';
  const metaKey = typeof ANSWER_META_KEY !== 'undefined' ? ANSWER_META_KEY : 'ecoRadecAnswerMetaRev1';

  if (typeof store !== 'undefined' && store.write) {
    store.write(essayKey, answerEssayState);
    store.write(metaKey, answerMetaState);
  } else {
    try { localStorage.setItem(essayKey, JSON.stringify(answerEssayState)); } catch (e) {}
    try { localStorage.setItem(metaKey, JSON.stringify(answerMetaState)); } catch (e) {}
  }
  updateAnswerEssayProgress();
}

function answerQuestionPosition(idx) {
  return idx % 5;
}

function answerChallenge(idx) {
  const list = window.ANSWER_CHALLENGE || [
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
  const questions = window.ANSWER_ESSAY25 || [];
  return questions.map((q, i) => ({ ...q, idx: i })).filter(q => q.mat === m);
}

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
    title.innerHTML = `<div><strong>📘 Materi ${answerEssayMaterial} — ${arr[0].topic}</strong><br><span>Jawab kelima pertanyaan secara mandiri. Gunakan tombol keyakinan untuk menilai pemahamanmu sendiri.</span></div><button class="ans-read-back" type="button" onclick="goStep(0);setTimeout(()=>openReadMaterial(${answerEssayMaterial}),100)">↩ Buka Materi READ</button>`;
  }

  box.innerHTML = arr.map(x => {
    const visual = x.visual === 'weather'
      ? `<div class="ans-weather-visual"><div class="ans-weather-scene sunny"><span class="ico">☀️</span>07.00 · cerah & hangat</div><div class="ans-weather-scene rainy"><span class="ico">🌧️</span>14.00 · gelap, sejuk & hujan</div></div>`
      : '';
    const val = answerEssayState[x.idx] || '';
    const meta = answerMeta(x.idx);
    const ch = answerChallenge(x.idx);
    const confidence = meta.confidence || '';

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

      <div class="ans-selfcheck">
        <div class="ans-selfcheck-title">Bagaimana keyakinanmu terhadap jawaban ini?</div>
        <div class="ans-confidence-row">
          <button type="button" class="ans-confidence-btn low ${confidence === 'low' ? 'active' : ''}" onclick="answerSetConfidence(${x.idx},'low')">🤔 Belum yakin</button>
          <button type="button" class="ans-confidence-btn mid ${confidence === 'mid' ? 'active' : ''}" onclick="answerSetConfidence(${x.idx},'mid')">🙂 Cukup yakin</button>
          <button type="button" class="ans-confidence-btn high ${confidence === 'high' ? 'active' : ''}" onclick="answerSetConfidence(${x.idx},'high')">💡 Yakin</button>
        </div>
        <button type="button" class="ans-discuss-flag ${meta.flagged ? 'active' : ''}" onclick="answerToggleDiscussFlag(${x.idx})">
          <span class="flag-box">${meta.flagged ? '✓' : ''}</span>
          ${meta.flagged ? 'Ditandai untuk dibahas saat DISCUSS' : '🔖 Tandai jika ingin dibahas saat DISCUSS'}
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
  const questions = window.ANSWER_ESSAY25 || [];
  const done = questions.map((q, i) => (answerEssayState[i] || '').trim().length >= 10);
  const n = done.filter(Boolean).length;
  const tx = document.getElementById('ansEssayProgressText');
  const fill = document.getElementById('ansEssayProgressFill');
  const st = document.getElementById('ansEssayStatus');
  const flag = document.getElementById('ansFlagCount');

  if (tx) tx.textContent = n + ' dari 25 selesai';
  if (fill) fill.style.width = (n / 25 * 100) + '%';
  done.forEach((ok, i) => document.getElementById('ansEssayCard-' + i)?.classList.toggle('done', ok));

  const flagged = questions.filter((q, i) => answerMeta(i).flagged).length;
  const low = questions.filter((q, i) => answerMeta(i).confidence === 'low').length;

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
  const questions = window.ANSWER_ESSAY25 || [];
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

// Global window exposure
if (typeof window !== 'undefined') {
  window.answerEssayState = answerEssayState;
  window.answerMetaState = answerMetaState;
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
}

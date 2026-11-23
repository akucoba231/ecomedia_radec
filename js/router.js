/**
 * EcoMedia RADEC - Router & Screen Navigation Module
 * Mengatur pergantian view (Landing, Welcome, Home, Map, Learning Steps, Selesai).
 */

let currentStep = 0;
try {
  const stepKey = (typeof ECO_KEYS !== 'undefined' && ECO_KEYS.currentStep) ? ECO_KEYS.currentStep : 'ecoRadecCurrentStep';
  const savedStep = localStorage.getItem(stepKey);
  if (savedStep !== null) {
    const s = parseInt(savedStep, 10);
    if (Number.isInteger(s) && s >= 0 && s < 6) {
      currentStep = s;
    }
  }
} catch (e) {}

if (typeof window !== 'undefined') {
  window.currentStep = currentStep;
}

function goStep(n) {
  /* Mode pengecekan produk: semua tahap dapat diakses tanpa syarat pengisian */
  if (n === 0 && typeof loadPertanyaanRead === 'function') {
    setTimeout(loadPertanyaanRead, 0);
  }
  if (n === 0 && typeof loadEcoLens === 'function') {
    setTimeout(loadEcoLens, 0);
  }
  if (n === 1) {
    if (typeof initAnswerStage === 'function') {
      setTimeout(() => initAnswerStage(true), 0);
    } else {
      if (typeof renderAnswerEssay === 'function') setTimeout(renderAnswerEssay, 0);
      if (typeof syncAnswerFromServer === 'function') setTimeout(syncAnswerFromServer, 0);
    }
  }
  if (n === 2 && typeof initRadecDiscuss === 'function') {
    setTimeout(initRadecDiscuss, 0);
  }
  if (n === 3 && typeof initRadecExplain === 'function') {
    setTimeout(initRadecExplain, 0);
  }

  // Jika siswa melangkah maju ke tahap selanjutnya, tandai tahap sebelumnya sebagai selesai
  if (typeof ecoCompleted !== 'undefined' && n > currentStep && currentStep >= 0 && currentStep < 5) {
    ecoCompleted.add(currentStep);
  }

  const totalSteps = (typeof STEPS !== 'undefined') ? STEPS : 6;
  currentStep = Math.max(0, Math.min(n, totalSteps - 1));
  if (typeof window !== 'undefined') {
    window.currentStep = currentStep;
  }
  try {
    const stepKey = (typeof ECO_KEYS !== 'undefined' && ECO_KEYS.currentStep) ? ECO_KEYS.currentStep : 'ecoRadecCurrentStep';
    localStorage.setItem(stepKey, String(currentStep));
  } catch (e) {}

  document.querySelectorAll('.section').forEach(s => s.classList.remove('show'));
  const sec = document.getElementById('sec-' + currentStep);
  if (sec) {
    sec.classList.add('show');
    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.querySelectorAll('.radec-pill').forEach((p, i) => {
    p.classList.toggle('rp-active', i === currentStep);
  });

  if (typeof buildTracker === 'function') buildTracker();
  if (typeof ecoSaveProgress === 'function') ecoSaveProgress();
  if (typeof ecoOnStep === 'function') ecoOnStep(currentStep);
}

function showFinish() {
  currentStep = 5;
  if (typeof window !== 'undefined') {
    window.currentStep = currentStep;
  }
  try {
    const stepKey = (typeof ECO_KEYS !== 'undefined' && ECO_KEYS.currentStep) ? ECO_KEYS.currentStep : 'ecoRadecCurrentStep';
    localStorage.setItem(stepKey, String(currentStep));
  } catch (e) {}
  document.querySelectorAll('.section').forEach(s => s.classList.remove('show'));
  const sec5 = document.getElementById('sec-5');
  if (sec5) sec5.classList.add('show');

  if (typeof ecoCompleted !== 'undefined' && ecoCompleted.add) {
    for (let i = 0; i < 5; i++) ecoCompleted.add(i);
  }
  if (typeof ecoSaveProgress === 'function') ecoSaveProgress();
  if (typeof buildTracker === 'function') buildTracker();
  if (typeof ecoOnStep === 'function') ecoOnStep(5);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function ecoHideLearning() {
  const elements = [
    'ecoLegacyHero',
    'ecoTrackerShell',
    'ecoLearningMain',
    'ecoLegacyFooter',
    'ecoGlobalNav',
    'ecoPersonalGreet'
  ];
  elements.forEach(id => document.getElementById(id)?.classList.add('eco-hidden'));
}

function ecoShowLearning() {
  const elements = [
    'ecoLegacyHero',
    'ecoTrackerShell',
    'ecoLearningMain',
    'ecoLegacyFooter',
    'ecoGlobalNav',
    'ecoPersonalGreet'
  ];
  elements.forEach(id => document.getElementById(id)?.classList.remove('eco-hidden'));
}

function ecoBackToOpening() {
  flowHideShellScreens();
  ecoHideLearning();
  document.getElementById('ecoHome')?.classList.add('eco-hidden');
  document.getElementById('ecoMap')?.classList.add('eco-hidden');
  document.getElementById('ecoWelcome')?.classList.remove('eco-hidden');
  document.body.classList.remove('eco-locked');
  if (typeof ecoRenderIdentity === 'function') ecoRenderIdentity();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function ecoResetOpening() {
  flowHideShellScreens();
  const welcome = document.getElementById('ecoWelcome');
  if (welcome) welcome.classList.remove('eco-hidden');
  const msg = document.getElementById('ecoFormMsg');
  if (msg) msg.textContent = '';
}

function ecoShowHome() {
  flowHideShellScreens();
  document.body.classList.remove('eco-locked');
  document.getElementById('ecoWelcome')?.classList.add('eco-hidden');
  document.getElementById('ecoMap')?.classList.add('eco-hidden');
  document.getElementById('ecoHome')?.classList.remove('eco-hidden');
  ecoHideLearning();
  if (typeof ecoRenderIdentity === 'function') ecoRenderIdentity();
  if (typeof ecoRenderProgress === 'function') ecoRenderProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderAdventureMap() {
  const container = document.getElementById('ecoAdventurePathList');
  if (!container) return;
  const stages = window.RADEC_ADVENTURE_STAGES || [];
  container.innerHTML = stages.map(s => {
    if (s.isEval) {
      return `
        <div class="eco-path-row eco-path-eval-row" style="--mc:${s.color}">
          <article class="eco-path-card eco-path-eval-card" onclick="${s.action}">
            <span class="stage">${s.tag}</span>
            <h3>${s.title}</h3>
            <p>${s.desc}</p>
            <span class="status eco-eval-status">🌱 Refleksi akhir pembelajaran</span>
            <button>${s.btnText}</button>
          </article>
          <div class="eco-path-node eco-path-eval-node">${s.icon}</div>
        </div>
      `;
    }
    return `
      <div class="eco-path-row" style="--mc:${s.color}">
        <article class="eco-path-card" data-eco-stage="${s.stage}" onclick="${s.action}">
          <span class="stage">${s.tag}</span>
          <h3>${s.title}</h3>
          <p>${s.desc}</p>
          <span class="status" data-eco-status="${s.stage}">⚪ Belum dimulai</span>
          <button>${s.btnText}</button>
        </article>
        <div class="eco-path-node">${s.icon}</div>
      </div>
    `;
  }).join('');

  if (typeof ecoRenderProgress === 'function') {
    ecoRenderProgress();
  }
}

function ecoShowMap() {
  flowHideShellScreens();
  document.body.classList.remove('eco-locked');
  document.getElementById('ecoWelcome')?.classList.add('eco-hidden');
  document.getElementById('ecoHome')?.classList.add('eco-hidden');
  document.getElementById('ecoMap')?.classList.remove('eco-hidden');
  ecoHideLearning();
  if (typeof renderAdventureMap === 'function') renderAdventureMap();
  if (typeof ecoRenderIdentity === 'function') ecoRenderIdentity();
  if (typeof ecoRenderProgress === 'function') ecoRenderProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function ecoEnterLearning(step = 0) {
  flowHideShellScreens();
  document.body.classList.remove('eco-locked');
  document.getElementById('ecoWelcome')?.classList.add('eco-hidden');
  document.getElementById('ecoHome')?.classList.add('eco-hidden');
  document.getElementById('ecoMap')?.classList.add('eco-hidden');
  ecoShowLearning();
  goStep(step);
}

function flowHideShellScreens() {
  ['flowLanding', 'flowProfileHelp'].forEach(id => {
    document.getElementById(id)?.classList.add('eco-hidden');
  });
}

function flowHideLegacyPages() {
  document.getElementById('ecoWelcome')?.classList.add('eco-hidden');
  document.getElementById('ecoHome')?.classList.add('eco-hidden');
  document.getElementById('ecoMap')?.classList.add('eco-hidden');
  ecoHideLearning();
}

function flowShowLanding() {
  flowHideShellScreens();
  flowHideLegacyPages();
  const landing = document.getElementById('flowLanding');
  if (landing) landing.classList.remove('eco-hidden');
  document.body.classList.remove('eco-locked');
  window.scrollTo(0, 0);
}

function flowShowStudentMenu() {
  ecoShowHome();
}

function flowOpenEvaluation() {
  flowHideShellScreens();
  document.getElementById('ecoWelcome')?.classList.add('eco-hidden');
  document.getElementById('ecoHome')?.classList.add('eco-hidden');
  document.getElementById('ecoMap')?.classList.add('eco-hidden');
  ecoShowLearning();
  showFinish();
}

// Global window exposure
if (typeof window !== 'undefined') {
  window.currentStep = currentStep;
  window.goStep = goStep;
  window.showFinish = showFinish;
  window.ecoHideLearning = ecoHideLearning;
  window.ecoShowLearning = ecoShowLearning;
  window.ecoBackToOpening = ecoBackToOpening;
  window.ecoResetOpening = ecoResetOpening;
  window.ecoShowHome = ecoShowHome;
  window.ecoShowMap = ecoShowMap;
  window.ecoEnterLearning = ecoEnterLearning;
  window.flowHideShellScreens = flowHideShellScreens;
  window.flowHideLegacyPages = flowHideLegacyPages;
  window.flowShowLanding = flowShowLanding;
  window.flowShowStudentMenu = flowShowStudentMenu;
  window.flowOpenEvaluation = flowOpenEvaluation;
  window.renderAdventureMap = renderAdventureMap;
}

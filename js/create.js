/**
 * EcoMedia RADEC - CREATE Module (Tahap 5: Kreasi & Aksi Nyata)
 * Mengelola pembuatan poster digital, ikrar lingkungan (pledge), berita mini, dan proyek aksi ekologis.
 */

let selectedEmoji = '🌍';
let selectedCatEmoji = '🌱';
let selectedAction = { emoji: '🌱', label: 'Aksi Lingkungan' };
let msgCount = 1;

function switchCreate(mode, btn) {
  document.querySelectorAll('.create-panel').forEach(p => p.classList.remove('show'));
  document.querySelectorAll('.create-tab-btn').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('cp-' + mode);
  if (panel) panel.classList.add('show');
  if (btn) btn.classList.add('active');
}

function setEmoji(e) {
  selectedEmoji = e;
}

function generatePoster() {
  const title = document.getElementById('posterTitle')?.value.trim() || '';
  const msg = document.getElementById('posterMsg')?.value.trim() || '';
  const pledge = document.getElementById('posterPledge')?.value.trim() || '';
  const name = document.getElementById('posterName')?.value.trim() || '';

  if (!title || !msg) {
    alert('Isi judul dan pesan utama postermu dulu ya! 🖼️');
    return;
  }

  const elTitle = document.getElementById('pp-title');
  const elEmo = document.getElementById('pp-emo');
  const elMsg = document.getElementById('pp-msg');
  const elPledge = document.getElementById('pp-pledge');
  const elName = document.getElementById('pp-name');
  const preview = document.getElementById('posterPreview');

  if (elTitle) elTitle.textContent = title;
  if (elEmo) elEmo.textContent = selectedEmoji;
  if (elMsg) elMsg.textContent = msg;
  if (elPledge) elPledge.textContent = pledge ? '💪 "' + pledge + '"' : '';
  if (elName) elName.textContent = name ? '— ' + name + ' | ' + new Date().toLocaleDateString('id-ID') : '';

  if (preview) {
    preview.style.display = 'block';
    preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function selectCat(btn, emoji) {
  document.querySelectorAll('.pcat-btn').forEach(b => b.classList.remove('sel'));
  if (btn) btn.classList.add('sel');
  selectedCatEmoji = emoji;
}

function savePledgeFull() {
  const text = document.getElementById('pledgeText')?.value.trim() || '';
  const name = document.getElementById('pledgeName')?.value.trim() || '';

  if (!text) {
    alert('Tulis ikrarmu dulu ya! ✍️');
    return;
  }

  const disp = document.getElementById('pledgeDisplay');
  if (disp) disp.style.display = 'block';

  const pdEmo = document.getElementById('pd-emoji');
  const pdText = document.getElementById('pd-text');
  const pdName = document.getElementById('pd-name');

  if (pdEmo) pdEmo.textContent = selectedCatEmoji;
  if (pdText) pdText.textContent = '"' + text + '"';
  if (pdName) pdName.textContent = '— ' + (name || 'Penjelajah Iklim') + ' | ' + new Date().toLocaleDateString('id-ID');

  if (disp) disp.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function insertTemplate(key) {
  const tmpl = window.templates || window.ECO_TEMPLATES || {};
  const ta = document.getElementById('newsText');
  if (ta && tmpl[key]) {
    ta.value = (ta.value + '\n\n' + tmpl[key]).trim();
  }
}

function saveNews() {
  const text = document.getElementById('newsText')?.value.trim() || '';
  if (text.length < 80) {
    alert('Beritamu terlalu pendek! Tulis setidaknya 150 kata agar informasinya lengkap 📰');
    return;
  }
  alert('📰 Berita Eco Minimu telah dipublikasikan!\n\nIngat untuk selalu: ✅ Cek sumber fakta · ✅ Sertakan solusi · ✅ Hindari panik berlebihan\n\nBagikan kepada teman dan keluargamu! 🌍');
}

function selectActionCat(btn, emoji, label) {
  document.querySelectorAll('#ecoActionCats .pcat-btn').forEach(b => b.classList.remove('sel'));
  if (btn) btn.classList.add('sel');
  selectedAction = { emoji, label };
}

function saveEcoAction() {
  const data = {
    category: selectedAction,
    problem: document.getElementById('actionProblem')?.value.trim() || '',
    why: document.getElementById('actionWhy')?.value.trim() || '',
    plan: document.getElementById('actionPlan')?.value.trim() || '',
    place: document.getElementById('actionPlace')?.value.trim() || '',
    when: document.getElementById('actionWhen')?.value.trim() || '',
    helper: document.getElementById('actionHelper')?.value.trim() || '',
    evidence: document.getElementById('actionEvidence')?.value.trim() || '',
    change: document.getElementById('actionChange')?.value.trim() || '',
    next: document.getElementById('actionNext')?.value.trim() || ''
  };

  const fb = document.getElementById('actionFeedback');
  if (!data.problem || !data.why || !data.plan) {
    if (fb) {
      fb.style.display = 'block';
      fb.style.background = '#FEE2E2';
      fb.style.color = '#7F1D1D';
      fb.textContent = '⚠️ Lengkapi dulu masalah, alasan ekologis, dan rencana aksimu.';
    }
    return;
  }

  const acted = data.evidence.length > 5 || data.change.length > 5;
  const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.actionProject : 'ecoActionProject';

  if (typeof store !== 'undefined' && store.write) {
    store.write(key, data);
  } else {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
  }

  if (fb) {
    fb.style.display = 'block';
    fb.style.background = '#DCFCE7';
    fb.style.color = '#14532D';
    fb.innerHTML = acted
      ? `✅ ${data.category.emoji} Proyek <strong>${data.category.label}</strong> tersimpan dengan bukti/refleksi. Ini sudah bergerak dari rencana menuju ecological agency.`
      : `📝 Rencana <strong>${data.category.label}</strong> tersimpan. Langkah berikutnya: lakukan aksi, lalu kembali untuk mengisi <strong>Bukti tindakan</strong> dan <strong>Apa yang berubah</strong>.`;
  }
}

function loadEcoAction() {
  const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.actionProject : 'ecoActionProject';
  let data = null;

  if (typeof store !== 'undefined' && store.read) {
    data = store.read(key, null);
  } else {
    try { data = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
  }

  if (!data) return;

  const map = {
    actionProblem: 'problem',
    actionWhy: 'why',
    actionPlan: 'plan',
    actionPlace: 'place',
    actionWhen: 'when',
    actionHelper: 'helper',
    actionEvidence: 'evidence',
    actionChange: 'change',
    actionNext: 'next'
  };

  Object.entries(map).forEach(([id, k]) => {
    const el = document.getElementById(id);
    if (el) el.value = data[k] || '';
  });

  if (data.category) selectedAction = data.category;
}

function renderCreatePrinciples() {
  const container = document.getElementById('ecpChecksContainer');
  if (!container) return;
  const list = window.CREATE_PRINCIPLES || [];
  container.innerHTML = list.map(p => `
    <label><input type="checkbox" data-eco-create="${p.id}" onchange="saveEcoCreateChecks()"> ${p.label}</label>
  `).join('');
}

function renderPosterEmojis() {
  const container = document.getElementById('posterEmojiPicker');
  if (!container) return;
  const emojis = window.CREATE_POSTER_EMOJIS || [];
  container.innerHTML = emojis.map(emo => `
    <button type="button" class="mm-btn" onclick="setEmoji('${emo}')">${emo}</button>
  `).join('');
}

function renderPledgeCategories() {
  const container = document.getElementById('pledgeCatButtons');
  if (!container) return;
  const cats = window.CREATE_PLEDGE_CATS || [];
  container.innerHTML = cats.map(c => `
    <button type="button" class="pcat-btn" onclick="selectCat(this,'${c.icon}')"><span class="pci">${c.icon}</span>${c.label}</button>
  `).join('');
}

function renderActionCategories() {
  const container = document.getElementById('ecoActionCats');
  if (!container) return;
  const cats = window.CREATE_ACTION_CATS || [];
  container.innerHTML = cats.map(c => `
    <button type="button" class="pcat-btn" onclick="selectActionCat(this,'${c.icon}','${c.label}')"><span class="pci">${c.icon}</span>${c.label}</button>
  `).join('');
}

function renderCreateComponents() {
  renderCreatePrinciples();
  renderPosterEmojis();
  renderPledgeCategories();
  renderActionCategories();
  if (typeof loadEcoCreateChecks === 'function') loadEcoCreateChecks();
}

// Global window exposure
if (typeof window !== 'undefined') {
  window.selectedEmoji = selectedEmoji;
  window.selectedCatEmoji = selectedCatEmoji;
  window.selectedAction = selectedAction;
  window.msgCount = msgCount;
  window.switchCreate = switchCreate;
  window.setEmoji = setEmoji;
  window.generatePoster = generatePoster;
  window.selectCat = selectCat;
  window.savePledgeFull = savePledgeFull;
  window.insertTemplate = insertTemplate;
  window.saveNews = saveNews;
  window.selectActionCat = selectActionCat;
  window.saveEcoAction = saveEcoAction;
  window.loadEcoAction = loadEcoAction;
  window.renderCreatePrinciples = renderCreatePrinciples;
  window.renderPosterEmojis = renderPosterEmojis;
  window.renderPledgeCategories = renderPledgeCategories;
  window.renderActionCategories = renderActionCategories;
  window.renderCreateComponents = renderCreateComponents;
}

/**
 * EcoMedia RADEC - READ Module (Tahap 1: Membaca & Mengamati)
 * Mengelola kartu materi bacaan, video ecomedia, infografis, dan pertanyaan penasaran (Wondering).
 */
if (typeof window !== 'undefined') {
  window.stimulus_opsi = window.stimulus_opsi || [];
}

const READ_SESSION_STORAGE_KEY = 'ecoRadecReadSessionsV1';
let _readActiveSessions = {};
let _readStartPromises = {};

function getReadStudentProfile() {
  const student = (typeof window !== 'undefined' && window.ecoStudent) ||
                  (typeof ecoStudent !== 'undefined' ? ecoStudent : {});
  return {
    id_siswa: student.id_siswa ||
              (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID')) || '',
    nama_siswa: student.name || student.nama ||
                (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentName')) || '',
    kelas: student.kelas ||
           (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentClass')) || '',
    sekolah: student.school || student.sekolah ||
             (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentSchool')) || ''
  };
}

function extractMateriNumberFromCard(input) {
  if (input === null || input === undefined) return null;
  if (typeof input === 'number' && Number.isFinite(input) && input > 0) return Math.floor(input);
  const raw = typeof input === 'object' ? (input.id || '') : String(input);
  const m = String(raw).match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

function formatDurasiMenitDetik(startMs, endMs) {
  const elapsedSec = Math.max(0, Math.round((Number(endMs) - Number(startMs)) / 1000));
  const menit = Math.floor(elapsedSec / 60);
  const detik = elapsedSec % 60;
  return `${menit} menit ${detik} detik`;
}

function readSessionsStoreAll() {
  if (typeof store !== 'undefined' && typeof store.read === 'function') {
    return store.read(READ_SESSION_STORAGE_KEY, {}) || {};
  }
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(READ_SESSION_STORAGE_KEY) : '';
    const parsed = raw ? JSON.parse(raw) : {};
    return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
  } catch (e) {
    return {};
  }
}

function writeSessionsStoreAll(map) {
  if (typeof store !== 'undefined' && typeof store.write === 'function') {
    store.write(READ_SESSION_STORAGE_KEY, map || {});
    return;
  }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(READ_SESSION_STORAGE_KEY, JSON.stringify(map || {}));
    }
  } catch (e) {}
}

function saveReadSessionLocal(sessionKey, data) {
  const all = readSessionsStoreAll();
  if (data) all[sessionKey] = data;
  else delete all[sessionKey];
  writeSessionsStoreAll(all);
}

function getReadSessionLocal(sessionKey) {
  const all = readSessionsStoreAll();
  return all[sessionKey] || null;
}

function mulai_baca(materiInput) {
  const idMateri = extractMateriNumberFromCard(materiInput);
  if (!idMateri) return Promise.resolve({ ok: false, reason: 'invalid_materi' });

  const profile = getReadStudentProfile();
  const studentId = profile.id_siswa;
  const sessionKey = `${studentId || 'guest'}:${idMateri}`;
  const startMs = Date.now();
  const prevIdRead = (_readActiveSessions[sessionKey] && _readActiveSessions[sessionKey].id_read) || '';

  const sessionObj = {
    id_read: prevIdRead,
    id_siswa: studentId,
    id_materi: idMateri,
    mulai_baca: startMs,
    finished: false
  };
  _readActiveSessions[sessionKey] = sessionObj;
  saveReadSessionLocal(sessionKey, sessionObj);

  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!studentId || !api || typeof api.getWhere !== 'function') {
    return Promise.resolve({ ok: true, localOnly: true, id_materi: idMateri, mulai_baca: String(startMs) });
  }

  const syncTask = (async () => {
    try {
      const res = await api.getWhere('tahap_read', {
        id_siswa: studentId,
        id_materi: idMateri
      });
      const list = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);

      if (list && list.length > 0) {
        const existing = list[0];
        const idRead = existing.id_read !== undefined ? existing.id_read : existing.id;
        sessionObj.id_read = idRead;
        saveReadSessionLocal(sessionKey, sessionObj);

        if (typeof api.patch === 'function') {
          await api.patch('tahap_read', 'id_read', idRead, {
            id_siswa: studentId,
            id_materi: idMateri,
            kelas: profile.kelas,
            sekolah: profile.sekolah,
            nama_siswa: profile.nama_siswa,
            mulai_baca: String(startMs),
            selesai_baca: '',
            durasi: '',
            keterangan: ''
          });
        }
        return { ok: true, method: 'PATCH', id_read: idRead, id_materi: idMateri, mulai_baca: String(startMs) };
      }

      if (typeof api.post === 'function') {
        const postData = {
          id_read: '',
          id_siswa: studentId,
          id_materi: idMateri,
          kelas: profile.kelas,
          sekolah: profile.sekolah,
          nama_siswa: profile.nama_siswa,
          mulai_baca: String(startMs),
          selesai_baca: '',
          durasi: '',
          keterangan: ''
        };
        const postRes = await api.post('tahap_read', postData);
        const newId = (postRes && (postRes.id_read || postRes.id || (postRes.data && (postRes.data.id_read || postRes.data.id)))) || '';
        sessionObj.id_read = newId;
        saveReadSessionLocal(sessionKey, sessionObj);
        return { ok: true, method: 'POST', id_read: newId, id_materi: idMateri, mulai_baca: String(startMs) };
      }

      return { ok: false, reason: 'missing_post' };
    } catch (err) {
      console.log(err);
      return { ok: false, error: err };
    } finally {
      if (_readStartPromises[sessionKey] === syncTask) {
        delete _readStartPromises[sessionKey];
      }
    }
  })();

  _readStartPromises[sessionKey] = syncTask;
  return syncTask;
}

async function selesai_baca(materiInput) {
  const idMateri = extractMateriNumberFromCard(materiInput);
  if (!idMateri) return { ok: false, reason: 'invalid_materi' };

  const profile = getReadStudentProfile();
  const studentId = profile.id_siswa;
  const sessionKey = `${studentId || 'guest'}:${idMateri}`;

  if (_readStartPromises[sessionKey]) {
    try {
      await _readStartPromises[sessionKey];
    } catch (e) {}
  }

  const session = _readActiveSessions[sessionKey] || getReadSessionLocal(sessionKey);
  if (!session || session.finished || !session.mulai_baca) {
    return { ok: false, reason: 'no_active_session' };
  }

  session.finished = true;
  const endMs = Date.now();
  const startMs = Number(session.mulai_baca) || endMs;
  const durasiText = formatDurasiMenitDetik(startMs, endMs);

  delete _readActiveSessions[sessionKey];
  saveReadSessionLocal(sessionKey, null);

  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!studentId || !api || typeof api.patch !== 'function') {
    return {
      ok: true,
      localOnly: true,
      id_materi: idMateri,
      mulai_baca: String(startMs),
      selesai_baca: String(endMs),
      durasi: durasiText
    };
  }

  try {
    let idRead = session.id_read;
    if (!idRead && typeof api.getWhere === 'function') {
      const res = await api.getWhere('tahap_read', {
        id_siswa: studentId,
        id_materi: idMateri
      });
      const list = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
      if (list && list.length > 0) {
        idRead = list[0].id_read !== undefined ? list[0].id_read : list[0].id;
      }
    }

    if (!idRead) {
      return { ok: false, reason: 'missing_id_read' };
    }

    await api.patch('tahap_read', 'id_read', idRead, {
      id_siswa: studentId,
      id_materi: idMateri,
      kelas: profile.kelas,
      sekolah: profile.sekolah,
      nama_siswa: profile.nama_siswa,
      mulai_baca: String(startMs),
      selesai_baca: String(endMs),
      durasi: durasiText,
      keterangan: ''
    });

    return {
      ok: true,
      method: 'PATCH',
      id_read: idRead,
      id_materi: idMateri,
      mulai_baca: String(startMs),
      selesai_baca: String(endMs),
      durasi: durasiText
    };
  } catch (err) {
    console.log(err);
    return { ok: false, error: err };
  }
}

function finishActiveReadSessions(excludeMateri = null) {
  const exclNum = extractMateriNumberFromCard(excludeMateri);
  const finishedNumbers = new Set();
  const tasks = [];

  if (typeof document !== 'undefined') {
    const expanded = document.querySelectorAll
      ? document.querySelectorAll('.read-card.expanded, .expanded')
      : [];
    expanded.forEach(el => {
      const num = extractMateriNumberFromCard(el);
      if (num && num !== exclNum && String(el.id || '').startsWith('read-materi-')) {
        if (el.classList) el.classList.remove('expanded');
        finishedNumbers.add(num);
      }
    });
  }

  const studentId = getReadStudentProfile().id_siswa;
  const prefix = `${studentId || 'guest'}:`;
  Object.keys(_readActiveSessions).forEach(k => {
    if (k.startsWith(prefix)) {
      const s = _readActiveSessions[k];
      if (s && !s.finished && s.id_materi && s.id_materi !== exclNum) {
        finishedNumbers.add(Number(s.id_materi));
      }
    }
  });

  finishedNumbers.forEach(num => {
    tasks.push(selesai_baca(num));
  });

  return tasks.length ? Promise.allSettled(tasks) : Promise.resolve([]);
}

function openReadTool(kind, btn) {
  const map = {
    text: 'teks-bacaan-card',
    info: 'infografis-card',
    media: 'ecomedia-video-card'
  };

  const isAll = (kind === 'all');
  const targetId = isAll ? 'teks-bacaan-card' : map[kind];
  const target = document.getElementById(targetId);
  if (!target) return;

  // 1. Tampilkan kartu: jika 'all', buka semua kartu dalam urutan dokumen; jika segmen, buka hanya targetId
  Object.values(map).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (isAll || id === targetId) {
        el.style.display = 'block';
        el.classList.add('read-tab-active');
      } else {
        el.style.display = 'none';
        el.classList.remove('read-tab-active');
      }
    }
  });

  // 2. Pause video jika siswa berpindah dari tab media ke tab lain
  const v = document.getElementById('ecomediaVideo');
  if (v) {
    if (kind !== 'media') {
      try { v.pause(); } catch (e) {}
    } else {
      try { v.load(); } catch (e) {}
    }
  }

  // 3. Update kelas aktif pada tombol toolbar
  document.querySelectorAll('.read-tool-btn').forEach(b => b.classList.remove('tool-active'));
  const activeBtn = btn || document.querySelector(`.read-tool-btn[onclick*="'${kind}'"]`);
  if (activeBtn) {
    activeBtn.classList.add('tool-active');
  }

  // 4. Highlight & scroll ke target
  target.classList.add('read-tool-target');
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });

  setTimeout(() => target.classList.remove('read-tool-target'), 900);
}

function renderReadMaterials() {
  const container = document.getElementById('readMaterialsGrid') || document.querySelector('#teks-bacaan-card .read-grid');
  if (!container) return;

  const materials = (typeof window !== 'undefined' && window.READ_MATERIALS) || (typeof READ_MATERIALS !== 'undefined' ? READ_MATERIALS : []);
  if (!materials.length) return;

  container.innerHTML = materials.map(m => {
    let bodyHTML = '';

    (m.sections || []).forEach(s => {
      if (s.subJudul) {
        bodyHTML += `<span class="read-sub-title">${s.subJudul}</span>\n`;
      }
      if (s.paragraf && s.paragraf.length) {
        s.paragraf.forEach(p => {
          bodyHTML += `<p>${p}</p>\n`;
        });
      }
      if (s.alurFlow) {
        bodyHTML += `<p class="read-flow">${s.alurFlow}</p>\n`;
      }
      if (s.alurKomparasi && s.alurKomparasi.length) {
        s.alurKomparasi.forEach(k => {
          bodyHTML += `<p class="read-flow"><strong>${k.label}:</strong><br>${k.alur}</p>\n`;
        });
      }
      if (s.itemDaftar && s.itemDaftar.length) {
        bodyHTML += `<ul>\n${s.itemDaftar.map(it => `  <li>${it}</li>`).join('\n')}\n</ul>\n`;
      }
      if (s.tipe === 'gambar') {
        bodyHTML += `<figure class="read-figure"><img src="${s.src}" alt="${s.alt}" /><figcaption>${s.caption}</figcaption></figure>\n`;
      }
      if (s.tipe === 'tabel') {
        bodyHTML += `<table>\n  <tr>${(s.header || []).map(h => `<th>${h}</th>`).join('')}</tr>\n`;
        (s.baris || []).forEach(r => {
          bodyHTML += `  <tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>\n`;
        });
        bodyHTML += `</table>\n`;
      }
      if (s.tipe === 'miskonsepsi' && s.item) {
        bodyHTML += `<ul class="read-nope">\n`;
        s.item.forEach(it => {
          bodyHTML += `  <li>❌ <em>“${it.salah}”</em><br>✅ ${it.benar}</li>\n`;
        });
        bodyHTML += `</ul>\n`;
      }
      if (s.paragrafSetelah && s.paragrafSetelah.length) {
        s.paragrafSetelah.forEach(p => {
          bodyHTML += `<p>${p}</p>\n`;
        });
      }

      // 8. Tanggapan / Jeda Berpikir di Tengah Bacaan (Ayo Berpikir / Tantangan)
      if (s.note) {
        let cekJenis = (s.note.judul || '').toLowerCase();
        let callModal = cekJenis.includes('tantangan');

        if (typeof window !== 'undefined') {
          if (!window.stimulus_opsi) window.stimulus_opsi = [];
          window.stimulus_opsi[m.id_materi] = {
            stimulus: s.note.stimulus,
            opsi: s.note.opsi
          };
        }

        const clickAttr = callModal ? ` onclick="event.stopPropagation(); modalInput('${m.id_materi}', event)" style="cursor:pointer;"` : '';

        bodyHTML += `<div class="read-note"${clickAttr}><b>${s.note.judul}</b>\n`;
        if (s.note.stimulus) bodyHTML += `<p>${s.note.stimulus}</p>\n`;
        if (s.note.isi && (!s.note.opsi || !s.note.opsi.length)) {
          bodyHTML += `<p>${s.note.isi}</p>\n`;
        }
        if (s.note.opsi && s.note.opsi.length) {
          bodyHTML += `<p style="margin-top:8px;">${s.note.opsi.join('<br>')}</p>\n`;
          if (s.note.isi) {
            bodyHTML += `<p style="margin-top:8px;">${s.note.isi}</p>\n`;
          } else {
            //
          }
          if (callModal === true) {
            bodyHTML += `<p style="margin-top:8px;font-weight:700;color:var(--c-read-d);text-decoration:underline;">✍️ Tekan untuk mengisi jawabanmu</p>\n`;
          }
        }
        bodyHTML += `</div>\n`;
      }
    });

    // 9. Pertanyaan Penasaran (Wondering) di Akhir Materi
    (m.tanggapan || []).forEach(t => {
      if (t.jenis_tanggapan === 'penasaran') {
        const wKey = `materi-${m.nomor}`;
        bodyHTML += `
        <div class="q-wonder" data-wonder="${wKey}" onclick="event.stopPropagation()">
          <div class="q-wonder-head">
            <span class="q-wonder-ico" aria-hidden="true">💭</span>
            <div>
              <h5>${t.judul}</h5>
              <p class="q-wonder-sub">${t.stimulus}</p>
            </div>
          </div>
          <label class="sr-only-q" for="wonder-${wKey}" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;">Tuliskan pertanyaanmu</label>
          <textarea class="q-wonder-area" id="wonder-${wKey}" placeholder="${t.placeholder || 'Aku penasaran, mengapa...'}" oninput="wonderTouch('${wKey}')"></textarea>
          <details class="q-wonder-help">
            <summary>Bingung mau bertanya?</summary>
            <p>Kamu bisa memulai pertanyaanmu dengan kata-kata berikut, lalu lanjutkan dengan kalimatmu sendiri:</p>
            <ul>
              ${(t.panduanKata || []).map(k => `<li>${k}</li>`).join('\n')}
            </ul>
            <p>Pertanyaan terbaik datang dari hal yang benar-benar ingin kamu ketahui.</p>
          </details>
          <div class="q-wonder-actions">
            <button type="button" class="q-wonder-btn" onclick="saveWonder('${wKey}')">💾 Simpan Pertanyaanku</button>
            <span class="q-wonder-msg" id="wonder-msg-${wKey}" role="status" aria-live="polite"></span>
          </div>
        </div>\n`;
      }
    });

    // 10. Modul Keterampilan Siswa (Ide Kreatifku untuk Lingkungan) di Akhir Materi
    if (m.keterampilan) {
      const ideaKey = m.id_materi || `materi-${m.nomor}`;
      const topikText = m.keterampilan.topik || `Materi ${m.nomor}: ${m.judul}`;
      const promptText = m.keterampilan.prompt || '';
      const ariaText = m.keterampilan.ariaLabel || `Ide kreatif pro-lingkungan untuk materi ${m.nomor}`;
      bodyHTML += `
      <div class="read-idea-box" data-read-idea="${ideaKey}" onclick="event.stopPropagation()">
        <div class="read-idea-head">
          <span class="read-idea-icon" aria-hidden="true">🌱</span>
          <div>
            <h5>Ide Kreatifku untuk Lingkungan</h5>
            <p class="read-idea-topic">${topikText}</p>
          </div>
        </div>
        <p class="read-idea-prompt">${promptText}</p>
        <label for="read-idea-${ideaKey}" class="read-idea-label">Cetuskan ide pro-lingkunganmu sendiri dan jelaskan cara melakukannya. Kamu boleh memilih bantuan di bawah jika belum memiliki ide.</label>
        <textarea id="read-idea-${ideaKey}" class="read-idea-textarea" rows="5" placeholder="Tulis ide kreatifmu di sini…" oninput="readIdeaTouch('${ideaKey}')" aria-label="${ariaText}"></textarea>
        <details class="read-idea-support">
          <summary>💡 Belum memiliki ide? Pilih satu bentuk karya atau aksi</summary>
          <p class="read-idea-support-help">Kamu boleh membuat ide sendiri. Jika masih kesulitan, pilih salah satu bentuk berikut, lalu tuliskan gagasanmu sesuai materi yang dibaca.</p>
          <div class="read-idea-support-grid">
            <button type="button" class="read-idea-choice" onclick="chooseReadIdeaSupport('${ideaKey}','poster')">🖼️ Poster Digital<span>Pesan dan ajakan menjaga lingkungan</span></button>
            <button type="button" class="read-idea-choice" onclick="chooseReadIdeaSupport('${ideaKey}','pledge')">📜 Ikrar Lingkungan<span>Janji tindakan yang akan dilakukan</span></button>
            <button type="button" class="read-idea-choice" onclick="chooseReadIdeaSupport('${ideaKey}','news')">📰 Berita Eco Mini<span>Berita singkat tentang masalah dan solusi</span></button>
            <button type="button" class="read-idea-choice" onclick="chooseReadIdeaSupport('${ideaKey}','action')">🌱 Aksi Sahabat Bumi<span>Kegiatan nyata yang bisa dilaksanakan</span></button>
          </div>
          <p class="read-idea-choice-note">Pilihan ini hanya bantuan. Kamu tetap menentukan masalah lingkungan, isi karya atau tindakan, serta cara melakukannya.</p>
        </details>
        <div class="read-idea-actions">
          <button type="button" class="read-idea-save" onclick="saveReadIdea('${ideaKey}')">💾 Simpan Ide Kreatifku</button>
          <span id="read-idea-msg-${ideaKey}" class="read-idea-msg" aria-live="polite" role="status"></span>
        </div>
        <p class="read-idea-footnote">Tidak ada satu jawaban yang harus sama. Pilih ide yang menurutmu bermanfaat dan mungkin dilakukan.</p>
      </div>\n`;
    }

    bodyHTML += `
    <div class="read-card-collapse-wrap" style="margin-top:20px;padding-top:14px;border-top:1.5px dashed rgba(27,111,181,.2);display:flex;justify-content:flex-end;">
      <button type="button" class="btn-collapse-read" style="appearance:none;background:rgba(27,111,181,.08);color:var(--c-read-d);border:1.5px solid rgba(27,111,181,.2);border-radius:20px;font-family:'Nunito',sans-serif;font-size:0.82rem;font-weight:700;padding:6px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:.15s;" onmouseover="this.style.background='rgba(27,111,181,.16)'" onmouseout="this.style.background='rgba(27,111,181,.08)'">
        <span>🔼 Selesai Membaca &amp; Tutup Materi</span>
      </button>
    </div>\n`;

    return `
    <div class="read-card" id="read-materi-${m.nomor}" onclick="toggleRead(this, event)">
      <div class="read-card-head">
        <span class="read-icon">${m.ikon}</span>
        <div>
          <span class="read-card-tag">${m.tag}</span>
          <h4>${m.judul}</h4>
        </div>
      </div>
      <div class="read-card-body">
        ${bodyHTML}
      </div>
    </div>`;
  }).join('\n');
}

function renderReadInfographics() {
  const container = document.getElementById('readInfografisGrid') || document.querySelector('#infografis-card .infografis');
  if (!container) return;

  const items = (typeof window !== 'undefined' && window.READ_INFOGRAFIS) || (typeof READ_INFOGRAFIS !== 'undefined' ? READ_INFOGRAFIS : []);
  if (!items.length) return;

  container.innerHTML = items.map(item => `
    <div class="info-stat">
      <div class="big">${item.nilai_data}</div>
      <div class="lbl">${item.nama_data}</div>
      <div class="info-bar-track" aria-hidden="true"><span class="info-bar-fill" style="--bar:${item.persen_bar}%"></span></div>
      <div class="info-explain">${item.keterangan}</div>
    </div>
  `).join('\n');
}

function initReadSubTabs() {
  renderReadMaterials();
  renderReadInfographics();
  openReadTool('text');
}

let pendingCardToClose = null;
let pendingReadConfirmCallback = null;

/**
 * Menampilkan modal konfirmasi umum pada tahap READ dengan memanfaatkan
 * antarmuka #ecoCloseReadModal.
 */
function showReadConfirmModal(options = {}) {
  const modal = document.getElementById('ecoCloseReadModal');
  const titleEl = document.getElementById('ecoCloseReadTitle');
  const defaultMsgWrap = document.getElementById('ecoCloseReadDefaultMsg');
  const customMsgWrap = document.getElementById('ecoCloseReadCustomMsg');
  const customPrimary = document.getElementById('ecoCloseReadCustomPrimary');
  const customSecondary = document.getElementById('ecoCloseReadCustomSecondary');
  const btnConfirm = document.getElementById('btnConfirmCloseRead');
  const btnCancel = document.getElementById('btnCancelCloseRead');

  pendingCardToClose = null;
  pendingReadConfirmCallback = typeof options.onConfirm === 'function' ? options.onConfirm : null;

  if (titleEl) titleEl.textContent = options.title || 'Konfirmasi';
  if (defaultMsgWrap) defaultMsgWrap.style.display = 'none';
  if (customMsgWrap) customMsgWrap.style.display = 'block';
  if (customPrimary) customPrimary.textContent = options.primaryMsg || '';
  if (customSecondary) {
    customSecondary.textContent = options.secondaryMsg || '';
    customSecondary.style.display = options.secondaryMsg ? 'block' : 'none';
  }
  if (btnConfirm) btnConfirm.innerHTML = `<span>${options.confirmText || '✓ Ya, Lanjutkan'}</span>`;
  if (btnCancel) btnCancel.innerHTML = `<span>${options.cancelText || '↩ Batal'}</span>`;

  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }
}

function showCloseReadModal(card) {
  pendingReadConfirmCallback = null;
  pendingCardToClose = card;
  const modal = document.getElementById('ecoCloseReadModal');
  const titleEl = document.getElementById('ecoCloseReadTitle');
  const defaultMsgWrap = document.getElementById('ecoCloseReadDefaultMsg');
  const customMsgWrap = document.getElementById('ecoCloseReadCustomMsg');
  const nameEl = document.getElementById('closeReadMaterialName');
  const btnConfirm = document.getElementById('btnConfirmCloseRead');
  const btnCancel = document.getElementById('btnCancelCloseRead');

  if (titleEl) titleEl.textContent = 'Tutup Materi Bacaan?';
  if (defaultMsgWrap) defaultMsgWrap.style.display = 'block';
  if (customMsgWrap) customMsgWrap.style.display = 'none';
  if (btnConfirm) btnConfirm.innerHTML = '<span>📖 Ya, Tutup Materi</span>';
  if (btnCancel) btnCancel.innerHTML = '<span>↩ Lanjut Membaca</span>';

  if (nameEl && card) {
    const titleNode = card.querySelector('.read-card-head h4');
    const tagEl = card.querySelector('.read-card-tag');
    const tagText = tagEl ? tagEl.textContent.trim() : '';
    const titleText = titleNode ? titleNode.textContent.trim() : '';
    nameEl.textContent = tagText ? `${tagText}: ${titleText}` : (titleText || 'Materi Bacaan');
  }
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }
}

function closeCloseReadModal() {
  pendingCardToClose = null;
  pendingReadConfirmCallback = null;
  const modal = document.getElementById('ecoCloseReadModal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function confirmCloseRead() {
  if (typeof pendingReadConfirmCallback === 'function') {
    const cb = pendingReadConfirmCallback;
    closeCloseReadModal();
    cb();
    return;
  }
  const closingCard = pendingCardToClose;
  if (closingCard) {
    closingCard.classList.remove('expanded');
    if (typeof closingCard.scrollIntoView === 'function') {
      closingCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    const closingMateri = extractMateriNumberFromCard(closingCard);
    if (closingMateri) {
      selesai_baca(closingMateri);
    }
  }
  closeCloseReadModal();
}

function closeTheOther(){
  if (typeof document === 'undefined') return;
  const materiExpanded = document.querySelectorAll 
    ? document.querySelectorAll('.expanded') 
    : (document.getElementsByClassName ? document.getElementsByClassName('expanded') : []);
  if(materiExpanded.length > 0){
    for(let n = 0; n < materiExpanded.length; n++){
      const el = materiExpanded[n];
      el.classList.remove('expanded');
      if (String(el.id || '').startsWith('read-materi-')) {
        const closingMateri = extractMateriNumberFromCard(el);
        if (closingMateri) selesai_baca(closingMateri);
      }
    }
  }
}

function toggleRead(card, event) {
  if (!card) return;

  // 1. Jika klik terjadi di dalam body materi yang sedang terbuka
  if (event && event.target) {
    const isInsideBody = event.target.closest('.read-card-body');
    if (isInsideBody && card.classList.contains('expanded')) {
      // Jika yang diklik adalah tombol "🔼 Selesai Membaca & Tutup Materi" di bagian bawah kartu
      if (event.target.closest('.btn-collapse-read')) {
        showCloseReadModal(card);
      }
      return; // Jangan tutup jika siswa berinteraksi dengan paragraf, textarea wondering, tabel, dsb.
    }
  }

  // 2. Jika kartu sudah terbuka dan hendak digulung/ditutup (klik header kartu):
  if (card.classList.contains('expanded')) {
    showCloseReadModal(card);
    return;
  }

  // 3. Jika kartu sedang tertutup, periksa hak akses materi lebih dulu
  const targetMateri = extractMateriNumberFromCard(card);
  const guardMatFn = (typeof guardMaterialAccess === 'function')
    ? guardMaterialAccess
    : ((typeof window !== 'undefined' && typeof window.guardMaterialAccess === 'function') ? window.guardMaterialAccess : null);
  if (targetMateri && guardMatFn && !guardMatFn(targetMateri)) {
    return false;
  }

  finishActiveReadSessions(targetMateri);
  closeTheOther();
  card.classList.add('expanded');
  if (typeof card.scrollIntoView === 'function') {
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (targetMateri) {
    mulai_baca(targetMateri);
  }
}

function openReadMaterial(n) {
  const card = document.getElementById('read-materi-' + n);
  const targetMateri = extractMateriNumberFromCard(card) || Number(n);
  const guardMatFn = (typeof guardMaterialAccess === 'function')
    ? guardMaterialAccess
    : ((typeof window !== 'undefined' && typeof window.guardMaterialAccess === 'function') ? window.guardMaterialAccess : null);
  if (targetMateri && guardMatFn && !guardMatFn(targetMateri)) {
    return false;
  }

  const readCard = document.getElementById('teks-bacaan-card');
  if (readCard && readCard.style.display === 'none') {
    openReadTool('text');
  }
  if (!card) return;
  const wasExpanded = card.classList && card.classList.contains('expanded');

  finishActiveReadSessions(targetMateri);

  document.querySelectorAll('.read-card.expanded').forEach(c => {
    if (c !== card) c.classList.remove('expanded');
  });

  card.classList.add('expanded');
  if (typeof card.scrollIntoView === 'function') {
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (!wasExpanded && targetMateri) {
    mulai_baca(targetMateri);
  }
}

function wonderReadAll() {
  const key = typeof WONDER_KEY !== 'undefined' ? WONDER_KEY : 'ecoReadWonderQuestions';
  if (typeof store !== 'undefined' && store.read) {
    return store.read(key, {});
  }
  try {
    const d = JSON.parse(localStorage.getItem(key) || '{}');
    return (d && typeof d === 'object' && !Array.isArray(d)) ? d : {};
  } catch (e) {
    return {};
  }
}

function wonderWriteAll(d) {
  const key = typeof WONDER_KEY !== 'undefined' ? WONDER_KEY : 'ecoReadWonderQuestions';
  if (typeof store !== 'undefined' && store.write) {
    store.write(key, d);
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(d));
  } catch (e) {}
}

function wonderBox(key) {
  let el = document.querySelector('.q-wonder[data-wonder="' + key + '"]');
  if (!el && key && key.startsWith('materi') && !key.includes('-')) {
    el = document.querySelector('.q-wonder[data-wonder="' + key.replace('materi', 'materi-') + '"]');
  }
  return el;
}

function wonderTouch(key) {
  let cleanKey = key;
  let msg = document.getElementById('wonder-msg-' + cleanKey);
  if (!msg && cleanKey && cleanKey.startsWith('materi') && !cleanKey.includes('-')) {
    cleanKey = cleanKey.replace('materi', 'materi-');
    msg = document.getElementById('wonder-msg-' + cleanKey);
  }
  if (msg) {
    msg.textContent = '';
    msg.className = 'q-wonder-msg';
  }
  const box = wonderBox(cleanKey);
  if (box) box.classList.remove('saved');
}

async function saveWonder(id_materi) {
  if (!id_materi) return;

  // Normalisasi id_materi (mendukung baik 'materi-1' maupun 'materi1')
  let key = id_materi;
  let ta = document.getElementById('wonder-' + key);
  if (!ta && key.startsWith('materi') && !key.includes('-')) {
    const altKey = key.replace('materi', 'materi-');
    if (document.getElementById('wonder-' + altKey)) {
      key = altKey;
      ta = document.getElementById('wonder-' + key);
    }
  }

  const msg = document.getElementById('wonder-msg-' + key);
  const box = wonderBox(key);
  const btn = box ? box.querySelector('.q-wonder-btn') : null;
  if (!ta) return;

  const val = ta.value.trim();
  const all = wonderReadAll();

  // 1. Validasi input: jika pertanyaan kosong
  if (!val) {
    delete all[key];
    wonderWriteAll(all);
    if (box) box.classList.remove('saved');
    if (msg) {
      msg.className = 'q-wonder-msg warn';
      msg.textContent = 'Tuliskan dahulu pertanyaanmu, ya.';
    }
    ta.focus();
    return;
  }

  // 2. Simpan ke local cache / storage (failsafe offline)
  all[key] = { q: val, at: new Date().toISOString() };
  wonderWriteAll(all);

  // 3. Ambil data identitas siswa (id_siswa)
  const studentId = (typeof window !== 'undefined' && window.ecoStudent && window.ecoStudent.id_siswa) ||
                    (typeof ecoStudent !== 'undefined' && ecoStudent.id_siswa) ||
                    (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID')) || '';

  // 4. Akses API client
  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  // Jika siswa belum login atau api tidak tersedia
  if (!api || !studentId) {
    if (box) box.classList.add('saved');
    if (msg) {
      msg.className = 'q-wonder-msg ok';
      msg.textContent = studentId
        ? '✓ Pertanyaanmu tersimpan di perangkat.'
        : '✓ Pertanyaanmu tersimpan di perangkat. Masuk/login untuk menyinkronkan ke server kelas.';
    }
    return;
  }

  // Indikator proses simpan ke server
  if (btn) btn.disabled = true;
  if (msg) {
    msg.className = 'q-wonder-msg info';
    msg.textContent = '⏳ Menyimpan pertanyaan ke server...';
  }

  try {
    // Langkah 1: Periksa tabel pertanyaan (GET WHERE) dengan id_siswa dan id_materi
    const res = await api.getWhere('pertanyaan', {
      id_siswa: studentId,
      id_materi: key
    });

    const list = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);

    // Langkah 2: Logika POST when not exist (length <= 0), PATCH when exist
    if (!list || list.length <= 0) {
      // POST: Tambahkan pertanyaan baru
      const postData = {
        id_pertanyaan: "", // Kosong untuk auto_increment di db
        id_siswa: studentId,
        id_materi: key,
        pertanyaan: val,
        keterangan: ""
      };
      await api.post('pertanyaan', postData);
    } else {
      // PATCH: Perbarui data pertanyaan yang sudah ada menggunakan id_pertanyaan
      const existing = list[0];
      const idPertanyaan = existing.id_pertanyaan !== undefined ? existing.id_pertanyaan : existing.id;
      const patchData = {
        pertanyaan: val,
        keterangan: ""
      };

      
      await api.patch('pertanyaan', 'id_pertanyaan', idPertanyaan, patchData);
    }

    if (box) box.classList.add('saved');
    if (msg) {
      msg.className = 'q-wonder-msg ok';
      msg.textContent = '✓ Pertanyaanmu sudah tersimpan. Pertanyaan yang baik dapat membantumu menemukan hal baru!';
    }
  } catch (err) {
    console.error('[saveWonder] Gagal menyimpan pertanyaan ke server:', err);
    if (box) box.classList.add('saved');
    if (msg) {
      msg.className = 'q-wonder-msg warn';
      msg.textContent = '✓ Tersimpan di perangkat (offline). Server sedang tidak dapat dijangkau.';
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function loadWonders() {
  const all = wonderReadAll();
  document.querySelectorAll('.q-wonder').forEach(function (box) {
    const key = box.getAttribute('data-wonder');
    const ta = document.getElementById('wonder-' + key);
    if (!ta) return;

    const rec = all[key];
    const val = (typeof rec === 'string') ? rec : ((rec && rec.q) || '');
    if (val) {
      ta.value = val;
      box.classList.add('saved');
      const msg = document.getElementById('wonder-msg-' + key);
      if (msg) {
        msg.className = 'q-wonder-msg ok';
        msg.textContent = '✓ Pertanyaanmu tersimpan.';
      }
    }
  });

  // Sinkronisasi data pertanyaan dari server jika siswa sudah login
  await loadPertanyaanRead();
}

/**
 * Mengambil data pertanyaan dari server untuk siswa saat ini
 * lalu memasukkan teks pertanyaan ke elemen textarea dengan id `wonder-{id_materi}`.
 */
async function loadPertanyaanRead() {
  const studentId = (typeof window !== 'undefined' && window.ecoStudent && window.ecoStudent.id_siswa) ||
                    (typeof ecoStudent !== 'undefined' && ecoStudent.id_siswa) ||
                    (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID')) || '';

  if (!studentId) {
    console.log('[loadPertanyaanRead] id_siswa belum tersedia, melewati sinkronisasi server.');
    return;
  }

  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!api || typeof api.getWhere !== 'function') {
    console.warn('[loadPertanyaanRead] EcoApi tidak tersedia.');
    return;
  }

  try {
    const serverData = await api.getWhere('pertanyaan', { id_siswa: studentId });
    const list = Array.isArray(serverData) ? serverData : (serverData && Array.isArray(serverData.data) ? serverData.data : []);

    if (!list || list.length === 0) return;

    const all = wonderReadAll();

    list.forEach(item => {
      if (!item.id_materi) return;
      const idMateri = item.id_materi;

      // Seleksi elemen textarea dengan id `wonder-{id_materi}`
      let ta = document.getElementById('wonder-' + idMateri);
      if (!ta && idMateri.startsWith('materi') && !idMateri.includes('-')) {
        ta = document.getElementById('wonder-' + idMateri.replace('materi', 'materi-'));
      }

      // Masukkan jawaban / teks pertanyaan dari database ke value textarea
      if (ta && item.pertanyaan) {
        ta.value = item.pertanyaan;

        const box = wonderBox(idMateri);
        if (box) box.classList.add('saved');

        const msg = document.getElementById('wonder-msg-' + idMateri);
        if (msg) {
          msg.className = 'q-wonder-msg ok';
          msg.textContent = '✓ Pertanyaanmu tersimpan di server.';
        }

        all[idMateri] = { q: item.pertanyaan, at: new Date().toISOString() };
      }
    });

    wonderWriteAll(all);
  } catch (err) {
    console.warn('[loadPertanyaanRead] Belum dapat menyinkronkan pertanyaan dari server:', err);
  }
}

/**
 * Membuka modal input tantangan berpikir, memeriksa jawaban siswa di server (tabel 'tantangan'),
 * dan mengisi value textarea jika sudah ada, atau placeholder default jika belum ada.
 * 
 * @param {string} id_materi - ID materi tantangan (misal: 'materi-1')
 * @param {Event} [event] - Event klik dari elemen div
 */
async function modalInput(id_materi, event) {
  if (event && event.stopPropagation) {
    event.stopPropagation();
  }
  if (!id_materi) return;

  const modal = document.getElementById('ecoTantanganModal');
  const ta = document.getElementById('tantanganJawaban');
  const msg = document.getElementById('tantanganMsg');
  const idMateriInput = document.getElementById('tantanganIdMateri');
  const subtitle = document.getElementById('tantanganSubtitle');

  if (idMateriInput) idMateriInput.value = id_materi;
  if (msg) {
    msg.textContent = '';
    msg.className = 'q-wonder-msg';
  }
  if (subtitle) {
    subtitle.textContent = `Tantangan untuk ${id_materi.replace('-', ' ')}`;
  }

  // Tampilkan loading screen selama proses pemeriksaan data
  if (typeof showLoading === 'function') {
    showLoading('Memeriksa jawaban tantangan...', 'Mohon tunggu sebentar, sedang mengambil data dari server...');
  }

  const studentId = (typeof window !== 'undefined' && window.ecoStudent && window.ecoStudent.id_siswa) ||
                    (typeof ecoStudent !== 'undefined' && ecoStudent.id_siswa) ||
                    (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID')) || '';

  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  try {
    if (api && studentId && typeof api.getWhere === 'function') {
      const serverData = await api.getWhere('tantangan', {
        id_siswa: studentId,
        id_materi: id_materi
      });

      const list = Array.isArray(serverData) ? serverData : (serverData && Array.isArray(serverData.data) ? serverData.data : []);

      // Ingat pemeriksaan data response dari server perlu menggunakan data.length
      if (list && list.length > 0 && list[0].jawaban) {
        if (ta) ta.value = list[0].jawaban;
        if (msg) {
          msg.className = 'q-wonder-msg ok';
          msg.textContent = '✓ Jawabanmu sebelumnya telah dimuat.';
        }
      } else {
        if (ta) {
          ta.value = '';
          ta.placeholder = 'Berikan jawabanmu beserta alasannya...';
        }
      }
    } else {
      if (ta) {
        ta.value = '';
        ta.placeholder = 'Berikan jawabanmu beserta alasannya...';
      }
    }
  } catch (err) {
    console.warn('[modalInput] Gagal memeriksa data tantangan dari server:', err);
    if (ta) {
      ta.value = '';
      ta.placeholder = 'Berikan jawabanmu beserta alasannya...';
    }
  } finally {
    if (typeof hideLoading === 'function') {
      hideLoading();
    }
    // Buka dialog modal input tantangan
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      setTimeout(() => ta && ta.focus(), 80);
    }
  }
}

/**
 * Menutup modal input tantangan berpikir
 */
function closeTantanganModal() {
  const modal = document.getElementById('ecoTantanganModal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Mengirimkan data jawaban tantangan siswa ke server (tabel 'tantangan').
 * Jika data sudah ada maka melakukan PATCH (update), jika belum ada melakukan POST (insert).
 * Setelah selesai, modal input tidak otomatis ditutup.
 */
async function kirimTantangan() {
  const ta = document.getElementById('tantanganJawaban');
  const msg = document.getElementById('tantanganMsg');
  const idMateriInput = document.getElementById('tantanganIdMateri');
  const btnSubmit = document.getElementById('btnSubmitTantangan');

  if (!ta) return;
  const val = ta.value.trim();
  const id_materi = idMateriInput ? idMateriInput.value.trim() : '';

  if (!val) {
    if (msg) {
      msg.className = 'q-wonder-msg warn';
      msg.textContent = 'Tuliskan jawabanmu terlebih dahulu sebelum mengirim.';
    }
    ta.focus();
    return;
  }

  const studentId = (typeof window !== 'undefined' && window.ecoStudent && window.ecoStudent.id_siswa) ||
                    (typeof ecoStudent !== 'undefined' && ecoStudent.id_siswa) ||
                    (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID')) || '';

  if (!studentId) {
    if (msg) {
      msg.className = 'q-wonder-msg warn';
      msg.textContent = 'Silakan masuk/login terlebih dahulu untuk mengirimkan jawaban.';
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

  // Tampilkan loading screen selama proses pengiriman
  if (typeof showLoading === 'function') {
    showLoading('Menyimpan jawaban tantangan...', 'Mohon tunggu sebentar, jawabanmu sedang dikirim ke server...');
  }
  if (btnSubmit) btnSubmit.disabled = true;

  try {
    // 1. Periksa apakah jawaban sudah ada di server (where id_siswa dan id_materi)
    const serverData = await api.getWhere('tantangan', {
      id_siswa: studentId,
      id_materi: id_materi
    });

    const list = Array.isArray(serverData) ? serverData : (serverData && Array.isArray(serverData.data) ? serverData.data : []);

    // 2. Evaluasi: length === 0 -> POST (insert), length > 0 -> PATCH (update)
    if (!list || list.length === 0) {
      // POST: Tambah jawaban baru
      const postData = {
        id_tantangan: '', // auto increment di database
        id_siswa: studentId,
        id_materi: id_materi,
        jawaban: val,
        keterangan: (typeof window !== 'undefined' && window.stimulus_opsi && window.stimulus_opsi[id_materi]) ? window.stimulus_opsi[id_materi] : ''
      };
      await api.post('tantangan', postData);
    } else {
      // PATCH: Perbarui jawaban yang ada
      const existing = list[0];
      const idTantangan = existing.id_tantangan !== undefined ? existing.id_tantangan : existing.id;
      let patchData = {
        jawaban: val,
        keterangan: ''
      };
      if (!existing.keterangan || existing.keterangan === '') {
        if (typeof window !== 'undefined' && window.stimulus_opsi && window.stimulus_opsi[id_materi]) {
          patchData.keterangan = window.stimulus_opsi[id_materi];
        }
        else{
          console.log('masalah variabel')
        }
      }
      else{
        console.log('terbypass')
      }
      await api.patch('tantangan', 'id_tantangan', idTantangan, patchData);
    }

    // 3. Status sukses: modal TIDAK ditutup otomatis
    if (typeof showLoadingSuccess === 'function') {
      showLoadingSuccess('Jawaban tantangan berhasil disimpan!', 1200);
    } else if (typeof hideLoading === 'function') {
      hideLoading();
    }

    if (msg) {
      msg.className = 'q-wonder-msg ok';
      msg.textContent = '✓ Jawabanmu berhasil disimpan ke server!';
    }
  } catch (err) {
    console.error('[kirimTantangan] Gagal mengirim jawaban tantangan ke server:', err);
    if (typeof showLoadingError === 'function') {
      showLoadingError(err.message || 'Gagal mengirim jawaban ke server.');
    } else if (typeof hideLoading === 'function') {
      hideLoading();
    }

    if (msg) {
      msg.className = 'q-wonder-msg warn';
      msg.textContent = 'Gagal menyimpan: ' + (err.message || err);
    }
  } finally {
    if (btnSubmit) btnSubmit.disabled = false;
  }
}

/* ── MODUL KETERAMPILAN SISWA TAHAP READ (TABEL: keterampilan_read) ── */

const DEFAULT_READ_IDEA_FALLBACKS = {
  poster: 'Poster Digital',
  pledge: 'Ikrar Lingkungan',
  news: 'Berita Eco Mini',
  action: 'Aksi Sahabat Bumi'
};

const DEFAULT_READ_IDEA_TOPIC_LABELS = {
  'materi-1': 'Cuaca, Iklim, dan Musim',
  'materi-2': 'Atmosfer, Efek Rumah Kaca, dan Pemanasan Global',
  'materi-3': 'Penyebab Perubahan Iklim',
  'materi-4': 'Dampak Perubahan Iklim',
  'materi-5': 'Tindakan Ramah Lingkungan'
};

/**
 * Menormalkan format key materi (misal 'materi1' -> 'materi-1')
 * dan mencocokkan ke READ_MATERIALS.id_materi bila tersedia.
 */
function resolveReadMateriId(rawKey) {
  let normKey = String(rawKey || '').trim();
  if (normKey.startsWith('materi') && !normKey.includes('-')) {
    normKey = normKey.replace('materi', 'materi-');
  }
  const materials = (typeof window !== 'undefined' && window.READ_MATERIALS) ||
                    (typeof READ_MATERIALS !== 'undefined' ? READ_MATERIALS : []);
  if (Array.isArray(materials) && materials.length > 0) {
    const found = materials.find(m => m.id_materi === normKey || ('materi-' + m.nomor) === normKey);
    if (found && found.id_materi) return found.id_materi;
  }
  return normKey;
}

function readIdeaBox(key) {
  if (typeof document === 'undefined') return null;
  const normKey = resolveReadMateriId(key);
  return document.querySelector('.read-idea-box[data-read-idea="' + normKey + '"]') ||
         document.querySelector('.read-idea-box[data-read-idea="' + key + '"]');
}

function readIdeaTouch(key) {
  const normKey = resolveReadMateriId(key);
  const msg = document.getElementById('read-idea-msg-' + normKey);
  if (msg) {
    msg.textContent = '';
    msg.className = 'read-idea-msg';
  }
  const box = readIdeaBox(normKey);
  if (box) box.classList.remove('saved');
}

function chooseReadIdeaSupport(material, type) {
  const normKey = resolveReadMateriId(material);
  const fallbacks = (typeof window !== 'undefined' && window.READ_IDEA_FALLBACKS) ||
                    (typeof READ_IDEA_FALLBACKS !== 'undefined' ? READ_IDEA_FALLBACKS : DEFAULT_READ_IDEA_FALLBACKS);
  const topicLabels = (typeof window !== 'undefined' && window.READ_IDEA_TOPIC_LABELS) ||
                      (typeof READ_IDEA_TOPIC_LABELS !== 'undefined' ? READ_IDEA_TOPIC_LABELS : DEFAULT_READ_IDEA_TOPIC_LABELS);

  const area = document.getElementById('read-idea-' + normKey);
  if (!area || !fallbacks[type]) return;

  const applyChoice = () => {
    area.value = 'Aku ingin membuat ' + fallbacks[type] + ' tentang ' + (topicLabels[normKey] || 'lingkungan') + '.\nGagasanku dan cara melakukannya: ';
    const box = readIdeaBox(normKey);
    if (box) box.classList.remove('saved');
    if (typeof area.focus === 'function') area.focus();
    if (typeof area.setSelectionRange === 'function') {
      area.setSelectionRange(area.value.length, area.value.length);
    }
    const msg = document.getElementById('read-idea-msg-' + normKey);
    if (msg) {
      msg.className = 'read-idea-msg info';
      msg.textContent = '✓ Pilihan sudah dituliskan. Lengkapi gagasan dan cara melakukannya dengan kata-katamu sendiri, lalu simpan.';
    }
  };

  if (area.value.trim()) {
    showReadConfirmModal({
      title: 'Ganti Ide Kreatif?',
      primaryMsg: 'Kolom ide kreatif untuk materi ini sudah berisi tulisanmu.',
      secondaryMsg: 'Apakah kamu yakin ingin menggantinya dengan pilihan bantuan ini?',
      confirmText: '🔄 Ya, Ganti Ide',
      cancelText: '↩ Batal',
      onConfirm: applyChoice
    });
    return;
  }

  applyChoice();
}

/**
 * Menyimpan jawaban ide kreatif keterampilan siswa ke tabel 'keterampilan_read' di server.
 * Menggunakan alur GET WHERE -> POST jika belum ada, PATCH jika sudah ada.
 */
async function saveReadIdea(id_materi) {
  if (!id_materi) return;

  const idMateri = resolveReadMateriId(id_materi);
  const area = document.getElementById('read-idea-' + idMateri);
  const msg = document.getElementById('read-idea-msg-' + idMateri);
  const box = readIdeaBox(idMateri);
  const btn = box ? box.querySelector('.read-idea-save') : null;
  if (!area) return;

  const val = area.value.trim();

  // 1. Validasi jawaban kosong
  if (!val) {
    if (box) box.classList.remove('saved');
    if (msg) {
      msg.className = 'read-idea-msg warn';
      msg.textContent = 'Tuliskan ide kreatifmu dahulu, ya.';
    }
    if (typeof area.focus === 'function') area.focus();
    return;
  }

  // 2. Ambil identitas siswa dari ecoStudent (dan fallback localStorage bila perlu)
  const student = (typeof window !== 'undefined' && window.ecoStudent) ||
                  (typeof ecoStudent !== 'undefined' ? ecoStudent : {});
  const studentId = student.id_siswa ||
                    (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID')) || '';
  const studentKelas = student.kelas ||
                       (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentClass')) || '';
  const studentSchool = student.school ||
                        (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentSchool')) || '';

  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);

  if (!studentId) {
    if (msg) {
      msg.className = 'read-idea-msg warn';
      msg.textContent = 'Silakan masuk/login terlebih dahulu untuk menyimpan jawaban ke server.';
    }
    return;
  }

  if (!api || typeof api.getWhere !== 'function') {
    if (msg) {
      msg.className = 'read-idea-msg error';
      msg.textContent = 'Ada masalah, coba lagi';
    }
    return;
  }

  // 3. Status proses (mirip saveWonder)
  if (btn) btn.disabled = true;
  if (msg) {
    msg.className = 'read-idea-msg info';
    msg.textContent = '⏳ Jawaban sedang diproses...';
  }

  try {
    const res = await api.getWhere('keterampilan_read', {
      id_siswa: studentId,
      id_materi: idMateri
    });
    const list = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);

    if (!list || list.length <= 0) {
      const postData = {
        id_keterampilan: '',
        id_siswa: studentId,
        id_materi: idMateri,
        kelas: studentKelas,
        sekolah: studentSchool,
        pernyataan: val,
        keterangan: ''
      };
      await api.post('keterampilan_read', postData);
    } else {
      const existing = list[0];
      const idKeterampilan = existing.id_keterampilan !== undefined ? existing.id_keterampilan : existing.id;
      const patchData = {
        kelas: studentKelas,
        sekolah: studentSchool,
        pernyataan: val,
        keterangan: ''
      };
      await api.patch('keterampilan_read', 'id_keterampilan', idKeterampilan, patchData);
    }

    if (box) box.classList.add('saved');
    if (msg) {
      msg.className = 'read-idea-msg ok';
      msg.textContent = '✓ Jawaban sudah disimpan';
    }
  } catch (error) {
    console.log(error);
    if (box) box.classList.remove('saved');
    if (msg) {
      msg.className = 'read-idea-msg error';
      msg.textContent = 'Ada masalah, coba lagi';
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

/**
 * Mengambil data ide kreatif keterampilan siswa dari server (tabel 'keterampilan_read')
 * lalu memasukkan field 'pernyataan' ke elemen textarea #read-idea-{id_materi}.
 */
async function loadKeterampilanRead() {
  const student = (typeof window !== 'undefined' && window.ecoStudent) ||
                  (typeof ecoStudent !== 'undefined' ? ecoStudent : {});
  const studentId = student.id_siswa ||
                    (typeof localStorage !== 'undefined' && localStorage.getItem('ecoRadecStudentID')) || '';

  if (!studentId) return;

  const api = (typeof EcoApi !== 'undefined') ? EcoApi : (typeof window !== 'undefined' ? window.EcoApi : null);
  if (!api || typeof api.getWhere !== 'function') return;

  try {
    const serverData = await api.getWhere('keterampilan_read', { id_siswa: studentId });
    const list = Array.isArray(serverData) ? serverData : (serverData && Array.isArray(serverData.data) ? serverData.data : []);

    if (!list || list.length === 0) return;

    list.forEach(item => {
      if (!item.id_materi) return;
      const normKey = resolveReadMateriId(item.id_materi);
      const ta = document.getElementById('read-idea-' + normKey);
      if (ta && item.pernyataan) {
        ta.value = item.pernyataan;
        const box = readIdeaBox(normKey);
        if (box) box.classList.add('saved');
        const msg = document.getElementById('read-idea-msg-' + normKey);
        if (msg) {
          msg.className = 'read-idea-msg ok';
          msg.textContent = '✓ Jawaban sudah disimpan';
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
}

// Global window exposure
if (typeof window !== 'undefined') {
  window.openReadTool = openReadTool;
  window.initReadSubTabs = initReadSubTabs;
  window.renderReadMaterials = renderReadMaterials;
  window.renderReadInfographics = renderReadInfographics;
  window.toggleRead = toggleRead;
  window.showReadConfirmModal = showReadConfirmModal;
  window.showCloseReadModal = showCloseReadModal;
  window.closeCloseReadModal = closeCloseReadModal;
  window.confirmCloseRead = confirmCloseRead;
  window.openReadMaterial = openReadMaterial;
  window.wonderReadAll = wonderReadAll;
  window.wonderWriteAll = wonderWriteAll;
  window.wonderBox = wonderBox;
  window.wonderTouch = wonderTouch;
  window.saveWonder = saveWonder;
  window.loadWonders = loadWonders;
  window.loadPertanyaanRead = loadPertanyaanRead;
  window.modalInput = modalInput;
  window.closeTantanganModal = closeTantanganModal;
  window.kirimTantangan = kirimTantangan;
  window.resolveReadMateriId = resolveReadMateriId;
  window.readIdeaBox = readIdeaBox;
  window.readIdeaTouch = readIdeaTouch;
  window.chooseReadIdeaSupport = chooseReadIdeaSupport;
  window.saveReadIdea = saveReadIdea;
  window.loadKeterampilanRead = loadKeterampilanRead;
  window.mulai_baca = mulai_baca;
  window.selesai_baca = selesai_baca;
  window.finishActiveReadSessions = finishActiveReadSessions;
  window.formatDurasiMenitDetik = formatDurasiMenitDetik;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    openReadTool,
    initReadSubTabs,
    renderReadMaterials,
    renderReadInfographics,
    toggleRead,
    showReadConfirmModal,
    showCloseReadModal,
    closeCloseReadModal,
    confirmCloseRead,
    openReadMaterial,
    wonderReadAll,
    wonderWriteAll,
    wonderBox,
    wonderTouch,
    saveWonder,
    loadWonders,
    loadPertanyaanRead,
    modalInput,
    closeTantanganModal,
    kirimTantangan,
    resolveReadMateriId,
    readIdeaBox,
    readIdeaTouch,
    chooseReadIdeaSupport,
    saveReadIdea,
    loadKeterampilanRead,
    mulai_baca,
    selesai_baca,
    finishActiveReadSessions,
    formatDurasiMenitDetik
  };
}

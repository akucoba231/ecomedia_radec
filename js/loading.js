/**
 * EcoMedia RADEC - Loading & Processing Overlay Module
 * Menyediakan dialog interaktif layar penuh untuk status loading,
 * error handling (dengan pesan kendala & tombol tutup), dan auto-close saat sukses.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    root.showLoading = exports.showLoading;
    root.hideLoading = exports.hideLoading;
    root.showLoadingError = exports.showLoadingError;
    root.showStageNoticeError = exports.showStageNoticeError;
    root.showLoadingSuccess = exports.showLoadingSuccess;
    root.debugLoading = exports.debugLoading;
    root.ecoLoading = exports;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  let autoCloseTimer = null;
  let pendingCloseCallback = null;

  function getElements() {
    if (typeof document === 'undefined') return null;
    return {
      overlay: document.getElementById('ecoLoadingOverlay'),
      card: document.getElementById('ecoLoadingCard'),
      title: document.getElementById('ecoLoadingTitle'),
      desc: document.getElementById('ecoLoadingDesc'),
      errorBox: document.getElementById('ecoLoadingErrorBox'),
      errorText: document.getElementById('ecoLoadingErrorText'),
      closeBtn: document.getElementById('ecoLoadingCloseBtn')
    };
  }

  /**
   * Menampilkan layar loading overlay ("Data anda sedang diproses")
   * @param {string} [title="Data anda sedang diproses"]
   * @param {string} [subtitle="Mohon tunggu sebentar, sistem sedang memproses data..."]
   */
  function showLoading(title, subtitle) {
    pendingCloseCallback = null;
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }

    const els = getElements();
    if (!els || !els.overlay) return;

    const displayTitle = (typeof title === 'string' && title.trim())
      ? title
      : 'Data anda sedang diproses';
    const displayDesc = (typeof subtitle === 'string')
      ? subtitle
      : 'Mohon tunggu sebentar, sistem sedang memproses data...';

    if (els.title) els.title.textContent = displayTitle;
    if (els.desc) {
      els.desc.textContent = displayDesc;
      els.desc.style.display = displayDesc ? 'block' : 'none';
    }

    if (els.card) {
      els.card.className = 'eco-loading-card state-loading';
    }

    els.overlay.classList.add('active');
    els.overlay.setAttribute('aria-hidden', 'false');
  }

  /**
   * Menutup layar loading overlay
   */
  function hideLoading() {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }

    const els = getElements();
    if (!els || !els.overlay) return;

    els.overlay.classList.remove('active');
    els.overlay.setAttribute('aria-hidden', 'true');

    const cb = pendingCloseCallback;
    pendingCloseCallback = null;
    if (typeof cb === 'function') {
      cb();
    }
  }

  /**
   * Menampilkan status error pada loading overlay
   * @param {string|Error} error - Pesan error atau objek Error
   * @param {string} [customTitle="Mohon maaf ada masalah"]
   */
  function showLoadingError(error, customTitle) {
    pendingCloseCallback = null;
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }

    const els = getElements();
    if (!els || !els.overlay) return;

    const displayTitle = customTitle || 'Mohon maaf ada masalah';
    let errorMessage = 'Terjadi kesalahan sistem yang tidak terduga. Silakan coba beberapa saat lagi.';

    if (typeof error === 'string' && error.trim()) {
      errorMessage = error;
    } else if (error && error.message) {
      errorMessage = error.message;
    }

    if (els.title) els.title.textContent = displayTitle;
    if (els.desc) {
      els.desc.textContent = 'Data tidak dapat diproses karena ada kendala pada koneksi atau sistem:';
      els.desc.style.display = 'block';
    }

    if (els.errorText) {
      els.errorText.textContent = errorMessage;
    }

    if (els.card) {
      els.card.className = 'eco-loading-card state-error';
    }

    els.overlay.classList.add('active');
    els.overlay.setAttribute('aria-hidden', 'false');
  }

  /**
   * Menampilkan pesan error/peringatan alur tahap belajar menggunakan dialog overlay
   * secara mandiri tanpa mengubah perilaku showLoadingError().
   * @param {string|Error} error - Pesan peringatan atau error
   * @param {string} [customTitle="Tahap Belum Dapat Dibuka"] - Judul dialog
   * @param {string} [customDesc="Lengkapi langkah sebelumnya sebelum melanjutkan:"] - Keterangan di bawah judul
   * @param {Function} [onClose] - Callback opsional yang dipanggil sekali saat modal ditutup lewat hideLoading()
   */
  function showStageNoticeError(error, customTitle, customDesc, onClose) {
    pendingCloseCallback = null;
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }

    const els = getElements();
    if (!els || !els.overlay) return;

    pendingCloseCallback = (typeof onClose === 'function') ? onClose : null;

    const displayTitle = customTitle || 'Tahap Belum Dapat Dibuka';
    const displayDesc = (typeof customDesc === 'string' && customDesc.trim())
      ? customDesc
      : 'Perhatikan informasi berikut sebelum melanjutkan:';
    let errorMessage = 'Kamu perlu melalui semua tahapan sebelum masuk ke tahap ini';

    if (typeof error === 'string' && error.trim()) {
      errorMessage = error;
    } else if (error && error.message) {
      errorMessage = error.message;
    }

    if (els.title) els.title.textContent = displayTitle;
    if (els.desc) {
      els.desc.textContent = displayDesc;
      els.desc.style.display = 'block';
    }

    if (els.errorText) {
      els.errorText.textContent = errorMessage;
    }

    if (els.card) {
      els.card.className = 'eco-loading-card state-error';
    }

    els.overlay.classList.add('active');
    els.overlay.setAttribute('aria-hidden', 'false');
  }

  /**
   * Menampilkan status berhasil dan otomatis menutup setelah beberapa saat
   * @param {string} [message="Data berhasil diproses!"]
   * @param {number} [autoCloseMs=1400]
   * @param {Function} [onClosed]
   */
  function showLoadingSuccess(message, autoCloseMs = 1400, onClosed) {
    pendingCloseCallback = null;
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }

    const els = getElements();
    if (!els || !els.overlay) return;

    const displayTitle = message || 'Data berhasil disimpan!';

    if (els.title) els.title.textContent = displayTitle;
    if (els.desc) {
      els.desc.textContent = 'Pembaruan data Anda telah selesai.';
      els.desc.style.display = 'block';
    }

    if (els.card) {
      els.card.className = 'eco-loading-card state-success';
    }

    els.overlay.classList.add('active');
    els.overlay.setAttribute('aria-hidden', 'false');

    if (autoCloseMs > 0) {
      autoCloseTimer = setTimeout(() => {
        hideLoading();
        if (typeof onClosed === 'function') {
          onClosed();
        }
      }, autoCloseMs);
    }
  }

  /**
   * Helper debug yang mudah dipanggil langsung dari Console Browser
   * Contoh pemanggilan:
   *   debugLoading('loading')  -> menampilkan animasi loading "Data anda sedang diproses"
   *   debugLoading('error')    -> menampilkan pesan "Mohon maaf ada masalah" & tombol tutup
   *   debugLoading('success')  -> menampilkan animasi sukses lalu otomatis tertutup
   *   debugLoading('close')    -> menutup overlay seketika
   *
   * @param {string} [scenario='loading']
   * @param {string} [detail]
   */
  function debugLoading(scenario = 'loading', detail) {
    const sc = (scenario || '').toLowerCase().trim();
    console.info(`[EcoMedia Debug] debugLoading('${sc}') dipicu.`);

    if (sc === 'error' || sc === 'err' || sc === 'fail') {
      showLoadingError(
        detail || 'Gagal terhubung ke server (HTTP 500 / Network Timeout). Pastikan server backend sedang aktif.',
        'Mohon maaf ada masalah'
      );
    } else if (sc === 'success' || sc === 'ok' || sc === 'done') {
      showLoadingSuccess(detail || 'Data berhasil diproses dan disimpan!', 1500);
    } else if (sc === 'close' || sc === 'hide' || sc === 'exit') {
      hideLoading();
    } else {
      showLoading(
        detail || 'Data anda sedang diproses',
        'Menghubungkan ke server Ecomedia...'
      );
    }
  }

  return {
    showLoading,
    hideLoading,
    showLoadingError,
    showStageNoticeError,
    showLoadingSuccess,
    debugLoading
  };
});

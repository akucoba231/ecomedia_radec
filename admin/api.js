/**
 * =================================================================================
 * EcoMedia RADEC - API Client Helper (api.js)
 * =================================================================================
 * Modul universal untuk komunikasi data antara antarmuka klien (Siswa & Guru)
 * dengan REST API Backend berbasis Slim Framework 3.
 *
 * Fitur:
 * - Mendukung operasi REST: GET, GET WHERE, POST, PUT, PATCH, DELETE
 * - Otomatis serialisasi query parameters
 * - Penanganan batas waktu (Timeout) 60 detik (1menit) via AbortController
 * - Error handling komprehensif (Network error, HTTP status error, Timeout)
 * - Kompatibel dengan browser (<script>) dan modul CommonJS/Node.js
 * =================================================================================
 */

(function (global) {
  'use strict';

  // Konfigurasi Dasar
  // Catatan: Jika ada typo 'https://https://', otomatis dibersihkan menjadi protokol valid tunggal.
  const RAW_BASE_URL = 'https://ecomedia.pjokserver.my.id/public/api';
  const CLEAN_BASE_URL = RAW_BASE_URL.replace(/^(https?:\/\/)+/i, 'https://').replace(/\/+$/, '');

  const CONFIG = {
    baseUrl: CLEAN_BASE_URL,
    timeoutMs: 60 * 1000, // 60 detik (1 menit)
    allowedTables: ['siswa', 'guru','pertanyaan','tantangan','progress','ecomedia','answer','kelompok_discuss','discuss','ecomedia_discuss','kelompok_explain','explain','ecomedia_explain']
  };

  /**
   * Kelas Custom Error untuk penanganan respons API yang terstruktur
   */
  class ApiError extends Error {
    constructor(message, status = 0, details = null) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.details = details;
    }
  }

  /**
   * Helper internal: Memvalidasi nama tabel sesuai whitelist
   */
  function validateTable(table) {
    if (!table || typeof table !== 'string') {
      throw new ApiError('Nama tabel harus berupa string yang valid.', 400);
    }
    const cleanTable = table.trim().toLowerCase();
    if (!CONFIG.allowedTables.includes(cleanTable)) {
      console.warn(`[EcoApi Warning] Tabel "${cleanTable}" belum terdaftar di whitelist lokal (${CONFIG.allowedTables.join(', ')}).`);
    }
    return cleanTable;
  }

  /**
   * Helper internal: Melakukan HTTP Request dengan timeout dan error handling
   */
  async function request(endpoint, options = {}) {
    const url = `${CONFIG.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, CONFIG.timeoutMs);

    const defaultHeaders = {
      'Accept': 'application/json'
    };

    if (options.body && typeof options.body === 'string') {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const fetchOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      },
      signal: controller.signal
    };

    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      // Coba parse body sebagai JSON
      let responseData = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch (parseErr) {
          responseData = null;
        }
      } else {
        responseData = await response.text();
      }

      // Jika HTTP status bukan 2xx (gagal)
      if (!response.ok) {
        let errorMessage = `Request gagal dengan status ${response.status} (${response.statusText})`;
        if (responseData && typeof responseData === 'object' && responseData.error) {
          errorMessage = responseData.error;
        } else if (responseData && typeof responseData === 'object' && responseData.message) {
          errorMessage = responseData.message;
        } else if (typeof responseData === 'string' && responseData.trim()) {
          errorMessage = responseData.trim();
        }

        throw new ApiError(errorMessage, response.status, responseData);
      }

      return responseData;

    } catch (err) {
      clearTimeout(timeoutId);

      // Tangani kasus timeout (AbortController)
      if (err.name === 'AbortError') {
        const timeoutError = new ApiError(
          `Request ke ${url} melebihi batas waktu (Timeout 60 detik). Server mungkin sibuk memproses data besar.`,
          408,
          { timeout: true, url }
        );
        console.error('[EcoApi Timeout]', timeoutError);
        throw timeoutError;
      }

      // Jika sudah instance dari ApiError, teruskan
      if (err instanceof ApiError) {
        console.error(`[EcoApi Error ${err.status}]`, err.message, err.details);
        throw err;
      }

      // Tangani network error / offline
      const networkError = new ApiError(
        `Koneksi jaringan gagal atau server tidak dapat dijangkau: ${err.message}`,
        0,
        err
      );
      console.error('[EcoApi Network Error]', networkError);
      throw networkError;
    }
  }

  /**
   * Objek Utama: EcoApi
   */
  const EcoApi = {
    // Akses konfigurasi saat ini
    config: CONFIG,

    /**
     * Mengatur ulang konfigurasi (jika sewaktu-waktu URL atau batas tabel berubah)
     */
    configure(newConfig = {}) {
      if (newConfig.baseUrl) {
        CONFIG.baseUrl = newConfig.baseUrl.replace(/^(https?:\/\/)+/i, 'https://').replace(/\/+$/, '');
      }
      if (newConfig.timeoutMs) {
        CONFIG.timeoutMs = Number(newConfig.timeoutMs) || 60000;
      }
      if (Array.isArray(newConfig.allowedTables)) {
        CONFIG.allowedTables = newConfig.allowedTables;
      }
    },

    /**
     * Pengecekan status server (Health Check)
     * GET /api/ping
     */
    async ping() {
      return await request('/ping', { method: 'GET' });
    },

    /**
     * GET: Mengambil semua data dari sebuah tabel
     * @param {string} table - Nama tabel (misal: 'siswa')
     * @returns {Promise<Array>}
     */
    async get(table) {
      const validTable = validateTable(table);
      return await request(`/${validTable}`, { method: 'GET' });
    },

    /**
     * GET WHERE: Mengambil data dengan kriteria filter (Query Parameters)
     * @param {string} table - Nama tabel (misal: 'siswa')
     * @param {Object} criteria - Objek key-value filter (misal: { kelas: '5A', sekolah: 'SD 1' })
     * @returns {Promise<Array>}
     */
    async getWhere(table, criteria = {}) {
      const validTable = validateTable(table);
      const queryParams = new URLSearchParams();

      if (criteria && typeof criteria === 'object') {
        Object.entries(criteria).forEach(([key, val]) => {
          if (val !== undefined && val !== null) {
            queryParams.append(key, val);
          }
        });
      }

      const queryString = queryParams.toString();
      const endpoint = `/${validTable}${queryString ? '?' + queryString : ''}`;
      return await request(endpoint, { method: 'GET' });
    },

    /**
     * POST: Menambahkan data baru ke tabel
     * @param {string} table - Nama tabel (misal: 'siswa')
     * @param {Object} data - Objek data yang ingin disimpan
     * @returns {Promise<Object>} Contoh: { message: "...", id: 1, data: {...} }
     */
    async post(table, data) {
      const validTable = validateTable(table);
      if (!data || typeof data !== 'object') {
        throw new ApiError('Data untuk POST harus berupa objek valid.', 400);
      }

      return await request(`/${validTable}`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    /**
     * PUT: Memperbarui data (Update Penuh / Ganti Total)
     * @param {string} table - Nama tabel (misal: 'siswa')
     * @param {string} idCol - Nama kolom acuan ID (misal: 'id', 'absen', 'student_id')
     * @param {string|number} idVal - Nilai ID yang dicari
     * @param {Object} data - Objek data baru
     * @returns {Promise<Object>}
     */
    async put(table, idCol, idVal, data) {
      const validTable = validateTable(table);
      if (!idCol || idVal === undefined || idVal === null) {
        throw new ApiError('idCol dan idVal wajib diisi untuk melakukan PUT.', 400);
      }
      if (!data || typeof data !== 'object') {
        throw new ApiError('Data untuk PUT harus berupa objek valid.', 400);
      }

      const colEnc = encodeURIComponent(idCol);
      const valEnc = encodeURIComponent(idVal);

      return await request(`/${validTable}/${colEnc}/${valEnc}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    /**
     * PATCH: Memperbarui data secara parsial (Update Kolom Tertentu)
     * @param {string} table - Nama tabel (misal: 'siswa')
     * @param {string} idCol - Nama kolom acuan ID (misal: 'id', 'absen', 'student_id')
     * @param {string|number} idVal - Nilai ID yang dicari
     * @param {Object} data - Objek perubahan data
     * @returns {Promise<Object>}
     */
    async patch(table, idCol, idVal, data) {
      const validTable = validateTable(table);
      if (!idCol || idVal === undefined || idVal === null) {
        throw new ApiError('idCol dan idVal wajib diisi untuk melakukan PATCH.', 400);
      }
      if (!data || typeof data !== 'object') {
        throw new ApiError('Data untuk PATCH harus berupa objek valid.', 400);
      }

      const colEnc = encodeURIComponent(idCol);
      const valEnc = encodeURIComponent(idVal);

      return await request(`/${validTable}/${colEnc}/${valEnc}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },

    /**
     * DELETE: Menghapus data dari tabel berdasarkan kolom kunci
     * @param {string} table - Nama tabel (misal: 'siswa')
     * @param {string} idCol - Nama kolom acuan ID (misal: 'id', 'absen', 'student_id')
     * @param {string|number} idVal - Nilai ID yang akan dihapus
     * @returns {Promise<Object>}
     */
    async delete(table, idCol, idVal) {
      const validTable = validateTable(table);
      if (!idCol || idVal === undefined || idVal === null) {
        throw new ApiError('idCol dan idVal wajib diisi untuk melakukan DELETE.', 400);
      }

      const colEnc = encodeURIComponent(idCol);
      const valEnc = encodeURIComponent(idVal);

      return await request(`/${validTable}/${colEnc}/${valEnc}`, {
        method: 'DELETE'
      });
    }
  };

  // Ekspos ke lingkungan Browser (Window) dan Node.js / CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EcoApi, ApiError };
  }
  
  if (typeof global !== 'undefined') {
    global.EcoApi = EcoApi;
    global.ecoApi = EcoApi; // Alias huruf kecil untuk kemudahan pemanggilan
    global.ApiError = ApiError;
  }

})(typeof window !== 'undefined' ? window : globalThis);

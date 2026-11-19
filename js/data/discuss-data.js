/**
 * EcoMedia RADEC - Master Data: DISCUSS Stage (Peran Kelompok & Lensa Diskusi)
 */

const DISCUSS_ROLES = [
  { icon: "🎯", title: "Ketua", desc: "Menjaga fokus dan kesempatan bicara" },
  { icon: "📝", title: "Notulis", desc: "Mencatat hasil diskusi untuk setiap soal" },
  { icon: "🗣️", title: "Juru Bicara", desc: "Menyiapkan hasil untuk tahap EXPLAIN" },
  { icon: "🔎", title: "Penguji Gagasan", desc: "Menanyakan alasan dan memeriksa bukti" }
];

const DISCUSS_LENSES = [
  {
    id: "ecoDiscussMessage",
    title: "🧠 Pesan yang Dibentuk Media",
    prompt: "Apakah media menonjolkan satu cara melihat masalah? Apa yang mungkin belum ditampilkan?",
    placeholder: "Media lebih menonjolkan... Sementara hal yang belum terlihat adalah..."
  },
  {
    id: "ecoDiscussVoice",
    title: "👥 Suara yang Terdengar / Tidak Terdengar",
    prompt: "Siapa yang dibicarakan atau terdampak? Adakah pihak yang terlewat?",
    placeholder: "Yang terlihat dalam media adalah... Yang belum banyak dibahas..."
  },
  {
    id: "ecoDiscussFootprint",
    title: "🔋 Bahan, Energi & Limbah",
    prompt: "Apa bahan, energi, perangkat, atau limbah yang terkait dengan media yang digunakan?",
    placeholder: "Untuk menggunakan media ini dibutuhkan... Dampaknya bagi lingkungan..."
  }
];

// Global window exposure
if (typeof window !== 'undefined') {
  window.DISCUSS_ROLES = DISCUSS_ROLES;
  window.DISCUSS_LENSES = DISCUSS_LENSES;
}

// CommonJS export untuk Node testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DISCUSS_ROLES,
    DISCUSS_LENSES
  };
}

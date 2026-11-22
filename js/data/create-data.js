/**
 * EcoMedia RADEC - Master Data: CREATE Stage (Prinsip Ecomedia, Ikrar, & Proyek Aksi)
 */

const CREATE_PRINCIPLES = [
  { id: "accurate", label: "Pesanku berdasarkan fakta dan tidak melebih-lebihkan." },
  { id: "voice", label: "Aku memikirkan manusia, tumbuhan, hewan, dan lingkungan yang terdampak." },
  { id: "source", label: "Jika memakai data/gambar, aku menyebutkan sumbernya." },
  { id: "resource", label: "Aku memakai perangkat/bahan yang sudah ada dan menghindari pemborosan." },
  { id: "simple", label: "Aku membuat media secukupnya—tidak membuat file/cetakan yang tidak diperlukan." },
  { id: "action", label: "Pesanku mengajak tindakan yang realistis, bukan hanya menakut-nakuti." }
];

const CREATE_PLEDGE_CATS = [
  { icon: "🌱", label: "Tanam Pohon" },
  { icon: "♻️", label: "Daur Ulang" },
  { icon: "💡", label: "Hemat Energi" },
  { icon: "🚲", label: "Transport Hijau" },
  { icon: "💧", label: "Hemat Air" },
  { icon: "📢", label: "Kampanye" }
];

const CREATE_ACTION_CATS = [
  { icon: "📚", label: "Hemat Kertas" },
  { icon: "💡", label: "Hemat Listrik" },
  { icon: "♻️", label: "Kurangi Sampah" },
  { icon: "💧", label: "Hemat Air" },
  { icon: "🌳", label: "Rawat Tanaman" },
  { icon: "🧹", label: "Bersihkan Lingkungan" }
];

const CREATE_POSTER_EMOJIS = ["🌍", "🌱", "🌊", "♻️", "🌞", "🦋", "🐋", "🌿"];

// Global window exposure
if (typeof window !== 'undefined') {
  window.CREATE_PRINCIPLES = CREATE_PRINCIPLES;
  window.CREATE_PLEDGE_CATS = CREATE_PLEDGE_CATS;
  window.CREATE_ACTION_CATS = CREATE_ACTION_CATS;
  window.CREATE_POSTER_EMOJIS = CREATE_POSTER_EMOJIS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CREATE_PRINCIPLES,
    CREATE_PLEDGE_CATS,
    CREATE_ACTION_CATS,
    CREATE_POSTER_EMOJIS
  };
}

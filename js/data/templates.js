/**
 * EcoMedia RADEC - Master Data: Template Berita & Konfigurasi Tahap Pembelajaran
 */

const STEPS = 6;
const stepColors = [
  'var(--c-read)', 'var(--c-answer)', 'var(--c-discuss)',
  'var(--c-explain)', 'var(--c-create)', 'var(--c-create)'
];
const stepLabels = ['READ','ANSWER','DISCUSS','EXPLAIN','CREATE','SELESAI'];
const stepIcons  = ['📖','✏️','💬','🗣️','🎨','🏆'];


const ecoMessages=[
  n=>`📖 Ayo, ${n}! Saatnya mencari informasi penting dari bacaan, gambar, dan data.`,
  n=>`✏️ Sekarang coba pikirkan jawabannya, ${n}. Gunakan informasi yang sudah kamu pelajari.`,
  n=>`💬 ${n}, dengarkan pendapat teman dan sampaikan idemu dengan alasan yang baik.`,
  n=>`🗣️ Tunjukkan bahwa kamu sudah memahami materi ini, ${n}. Jelaskan dengan kata-katamu sendiri.`,
  n=>`🎨 Saatnya mengubah pengetahuan menjadi aksi nyata, ${n}!`,
  n=>`🏆 Hebat, ${n}! Kamu telah menuntaskan petualangan Sahabat Bumi.`
];


const templates={
  who:"SIAPA: [Tulis siapa yang terlibat — ilmuwan, warga, pemerintah, dst...]",
  what:"APA: [Tulis apa yang terjadi — peristiwa, fenomena, atau fakta sains...]",
  where:"DI MANA: [Tulis lokasi kejadian — nama daerah, negara, atau kawasan...]",
  why:"MENGAPA: [Jelaskan mengapa hal ini terjadi — penyebab ilmiah atau sosial...]",
  how:"BAGAIMANA SOLUSINYA: [Tulis tindakan konkret yang bisa dilakukan...]"
};

const RADEC_ADVENTURE_STAGES = [
  {
    stage: 0,
    tag: "01 · READ",
    color: "var(--c-read)",
    icon: "📖",
    title: "📖 Baca & Amati",
    desc: "Kumpulkan informasi dari bacaan, cerita, gambar, data, dan media lingkungan.",
    btnText: "JELAJAHI READ →",
    action: "ecoEnterLearning(0)"
  },
  {
    stage: 1,
    tag: "02 · ANSWER",
    color: "var(--c-answer)",
    icon: "✏️",
    title: "✏️ Jawab & Berpikir",
    desc: "Gunakan informasi yang telah kamu peroleh untuk menjawab dan memikirkan masalah lingkungan.",
    btnText: "KERJAKAN ANSWER →",
    action: "ecoEnterLearning(1)"
  },
  {
    stage: 2,
    tag: "03 · DISCUSS",
    color: "var(--c-discuss)",
    icon: "💬",
    title: "💬 Bertukar Pikiran",
    desc: "Bandingkan pemikiranmu, dengarkan pendapat teman, dan temukan berbagai sudut pandang.",
    btnText: "MULAI DISCUSS →",
    action: "ecoEnterLearning(2)"
  },
  {
    stage: 3,
    tag: "04 · EXPLAIN",
    color: "var(--c-explain)",
    icon: "🗣️",
    title: "🗣️ Jelaskan Pemahamanmu",
    desc: "Susun kembali pemahamanmu dan jelaskan hubungan sebab-akibat dengan kata-katamu sendiri.",
    btnText: "MASUK EXPLAIN →",
    action: "ecoEnterLearning(3)"
  },
  {
    stage: 4,
    tag: "05 · CREATE",
    color: "var(--c-create)",
    icon: "🎨",
    title: "🎨 Dari Pengetahuan Menjadi Aksi",
    desc: "Gunakan apa yang telah kamu pelajari untuk membuat karya, keputusan, atau aksi menjaga lingkungan.",
    btnText: "MULAI CREATE →",
    action: "ecoEnterLearning(4)"
  },
  {
    stage: 5,
    tag: "SETELAH RADEC · EVALUASI & REFLEKSI",
    color: "#D7952E",
    icon: "🏆",
    title: "🏆 Lihat Perjalanan Belajarmu",
    desc: "Setelah menyelesaikan READ–ANSWER–DISCUSS–EXPLAIN–CREATE, refleksikan perkembangan ecoliterasimu, lihat badge, hasil belajar, dan sertifikat penyelesaian.",
    btnText: "BUKA EVALUASI & REFLEKSI →",
    action: "flowOpenEvaluation()",
    isEval: true
  }
];

// Global window exposure
if (typeof window !== 'undefined') {
  window.STEPS = STEPS;
  window.stepColors = stepColors;
  window.stepLabels = stepLabels;
  window.stepIcons = stepIcons;
  window.ecoMessages = ecoMessages;
  window.templates = templates;
  window.ECO_TEMPLATES = templates;
  window.RADEC_ADVENTURE_STAGES = RADEC_ADVENTURE_STAGES;
  window.STEP_CONFIG = {
    steps: STEPS,
    colors: stepColors,
    labels: stepLabels,
    icons: stepIcons
  };
}

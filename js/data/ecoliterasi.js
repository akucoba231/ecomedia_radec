/**
 * EcoMedia RADEC - Master Data: Refleksi Ekoliterasi & Konfigurasi Dimensi
 */

const FINISH_ECO=[
 {d:'tahu',q:'Aku bisa menjelaskan bedanya cuaca dan iklim kepada orang lain.'},
 {d:'tahu',q:'Aku bisa menjelaskan penyebab utama perubahan iklim dan hubungan sebab-akibatnya.'},
 {d:'tahu',q:'Aku bisa menggunakan bukti dari teks, video, atau infografis untuk menjelaskan masalah lingkungan.'},
 {d:'peduli',q:'Aku merasa perubahan iklim juga masalahku, bukan hanya masalah orang dewasa.'},
 {d:'peduli',q:'Aku ingin tahu lebih banyak tentang keadaan lingkungan di sekitar rumah atau sekolahku.'},
 {d:'peduli',q:'Aku merasa perlu mempertimbangkan dampak tindakanku terhadap manusia, hewan, tumbuhan, dan lingkungan.'},
 {d:'aksi',q:'Aku melakukan tindakan nyata untuk menghemat energi, air, kertas, atau mengurangi sampah.'},
 {d:'aksi',q:'Aku dapat menunjukkan bukti dari aksi lingkungan yang sudah kulakukan.'},
 {d:'aksi',q:'Aku mau melanjutkan satu kebiasaan ramah lingkungan setelah pembelajaran ini selesai.'}
];
const FINISH_LABEL={tahu:['Belum bisa','Sedikit','Bisa','Bisa mengajari'],peduli:['Tidak juga','Sedikit','Cukup','Sangat'],aksi:['Belum pernah','Kadang','Sering','Selalu']};
const FINISH_DIM={tahu:{nama:'Aku tahu',kelas:'dim-tahu',warna:'#1266AE'},peduli:{nama:'Aku peduli',kelas:'dim-peduli',warna:'#C4213C'},aksi:{nama:'Aku bertindak',kelas:'dim-aksi',warna:'#157F3D'}};


// Global window exposure
if (typeof window !== 'undefined') {
  window.FINISH_ECO = FINISH_ECO;
  window.FINISH_LABEL = FINISH_LABEL;
  window.FINISH_DIM = FINISH_DIM;
}

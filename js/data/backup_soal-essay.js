/**
 * EcoMedia RADEC - Master Data: Soal Esai 25 Pertanyaan, Kunci Jawaban Acuan NLP, & Konfigurasi Tantangan
 * 
 * Struktur data dirancang dinamis sehingga siap menampung penambahan soal (misal dari 25 hingga 50 soal).
 * Referensi jawaban ideal dan kata kunci diekstrak langsung dari konsep ilmiah pada js/data/materi-read.js.
 */

// ══════════════════════════════════════════════════════════
// 1. MASTER DATA SOAL ESAI TAHAP ANSWER (25 SOAL PRAPEMBELAJARAN)
// ══════════════════════════════════════════════════════════

const ANSWER_ESSAY25 = [
  // ── MATERI 1: Cuaca, Iklim, dan Musim ──
  {
    id_soal: 1,
    mat: 1,
    topic: "Cuaca, Iklim, dan Musim",
    stim: "Pukul 07.00, Aisyah berangkat ke sekolah saat langit cerah dan udara hangat. Pukul 14.00, langit menjadi gelap, udara terasa lebih sejuk, dan hujan turun. Kedua keadaan itu terjadi pada hari yang sama.",
    q: "Sebutkan dua perubahan antara pagi dan siang itu. Jelaskan mengapa kejadian tersebut menunjukkan perubahan cuaca, bukan perubahan iklim.",
    visual: "weather"
  },
  {
    id_soal: 2,
    mat: 1,
    topic: "Cuaca, Iklim, dan Musim",
    stim: "Di sebuah gampong, ada dua halaman rumah yang terkena hujan sama derasnya. Halaman pertama ditumbuhi pohon, tanahnya tidak ditutup beton, dan paritnya bersih sehingga air hujan cepat surut. Halaman kedua ditutup beton dan paritnya tersumbat sampah sehingga air hujan menggenang lebih lama.",
    q: "Mengapa air hujan lebih lama menggenang di halaman kedua? Jelaskan dengan membandingkan tempat air meresap dan jalan air mengalir di kedua halaman."
  },
  {
    id_soal: 3,
    mat: 1,
    topic: "Cuaca, Iklim, dan Musim",
    stim: "Selama beberapa bulan, hujan lebih sering turun di gampong Umar. Hari ini matahari bersinar cerah. Umar berkata, “Musim hujan sudah berakhir karena hari ini tidak hujan.”",
    q: "Bagaimana pendapatmu tentang kesimpulan Umar? Jelaskan dengan membandingkan kejadian hari ini dan keadaan selama beberapa bulan."
  },
  {
    id_soal: 4,
    mat: 1,
    topic: "Cuaca, Iklim, dan Musim",
    stim: "Ali mencatat cuaca di daerahnya selama tujuh hari. Selama itu, cuaca terasa panas. Ali lalu berkata, “Iklim di daerah kita sudah berubah.” Aisyah menyarankan agar mereka juga memeriksa catatan suhu udara dan hujan selama bertahun-tahun.",
    q: "Mengapa catatan cuaca selama tujuh hari belum cukup untuk mendukung kesimpulan Ali? Jelaskan mengapa mereka perlu melihat catatan suhu udara dan hujan selama bertahun-tahun."
  },
  {
    id_soal: 5,
    mat: 1,
    topic: "Cuaca, Iklim, dan Musim",
    stim: "Saat musim hujan, tanaman di sekolah tumbuh subur karena mendapat cukup air. Ketika memasuki musim kemarau, hujan lebih jarang turun dan tanah mulai kering.",
    q: "Buatlah rencana agar tanaman di sekolah tetap tumbuh subur selama musim kemarau. Tuliskan dua kegiatan yang dapat kamu lakukan dan jelaskan manfaat setiap kegiatan."
  },

  // ── MATERI 2: Efek Rumah Kaca dan Pemanasan Global ──
  {
    id_soal: 6,
    mat: 2,
    topic: "Efek Rumah Kaca dan Pemanasan Global",
    stim: "Gas rumah kaca membantu menahan sebagian panas agar Bumi tetap hangat. Namun, kegiatan manusia, seperti pembakaran bahan bakar pada kendaraan, dapat menambah jumlah gas rumah kaca di udara.",
    q: "Apa yang dapat terjadi pada suhu Bumi jika gas rumah kaca terus bertambah? Jelaskan alasanmu dengan menghubungkan jumlah gas tersebut dan panas yang tertahan."
  },
  {
    id_soal: 7,
    mat: 2,
    topic: "Efek Rumah Kaca dan Pemanasan Global",
    stim: "Umar membaca bahwa suhu rata-rata Bumi semakin meningkat dari tahun ke tahun. Kenaikan suhu ini dapat memengaruhi banyaknya hujan dan waktu datangnya musim hujan atau musim kemarau.",
    q: "Bagaimana pemanasan global dapat memengaruhi hujan dan musim? Jelaskan mengapa perubahan iklim juga berkaitan dengan perubahan hujan dan musim."
  },
  {
    id_soal: 8,
    mat: 2,
    topic: "Efek Rumah Kaca dan Pemanasan Global",
    stim: "Ali berkata, “Agar Bumi tidak semakin panas, semua gas rumah kaca harus dihilangkan.” Namun, Aisyah mengingatkan bahwa gas rumah kaca juga membantu menjaga Bumi tetap hangat.",
    q: "Menurutmu, apakah usulan Ali tepat? Jelaskan apa yang dapat terjadi pada suhu Bumi jika semua gas rumah kaca dihilangkan."
  },
  {
    id_soal: 9,
    mat: 2,
    topic: "Efek Rumah Kaca dan Pemanasan Global",
    stim: "Saat merawat tanaman di halaman sekolah, Umar berkata, “Tanaman membutuhkan karbon dioksida atau CO₂ untuk membuat makanan.” Ali bertanya, “Kalau CO₂ dibutuhkan tanaman, mengapa bertambahnya CO₂ di udara bisa membuat Bumi semakin panas?”",
    q: "Apa penjelasan yang dapat kamu berikan kepada Ali? Jelaskan manfaat CO₂ bagi tanaman dan pengaruh bertambahnya CO₂ terhadap suhu Bumi."
  },
  {
    id_soal: 10,
    mat: 2,
    topic: "Efek Rumah Kaca dan Pemanasan Global",
    stim: "Saat istirahat, Umar dan adik kelasnya berteduh di bawah pohon. Adik kelasnya bertanya, “Kak, kata Bu Guru, Bumi semakin panas. Apakah karena Matahari semakin dekat?” Umar ingin membuat cerita bergambar untuk menjelaskan penyebab pemanasan global.",
    q: "Bantu Umar merencanakan cerita bergambar secara berurut!"
  },

  // ── MATERI 3: Penyebab Perubahan Iklim ──
  {
    id_soal: 11,
    mat: 3,
    topic: "Penyebab Perubahan Iklim",
    stim: "Pagi hari, Ayah mengantar Ali ke sekolah naik sepeda motor berbahan bakar bensin. Di kelas, Ali menyalakan lampu. Bu Guru menjelaskan bahwa listrik untuk menyalakan lampu berasal dari pembangkit listrik yang menggunakan batu bara. Ali bertanya mengapa lampu yang tidak mengeluarkan asap tetap dapat menambah CO₂ di udara.",
    q: "Bantulah Bu Guru menjawab pertanyaan Ali. Jelaskan dari mana gas CO₂ dihasilkan. Mengapa lampu di kelas yang tidak mengeluarkan asap tetap menyebabkan bertambahnya CO₂ di udara? Jelaskan alurnya!"
  },
  {
    id_soal: 12,
    mat: 3,
    topic: "Penyebab Perubahan Iklim",
    stim: "Di sebuah lahan, banyak pohon ditebang. Sisa ranting dan kayunya kemudian dibakar. Umar berpendapat bahwa peristiwa tersebut hanya menghilangkan tempat berteduh.",
    q: "Sebutkan dan jelaskan dua perubahan yang berkaitan dengan gas karbon dioksida (CO₂) akibat: (1) penebangan pohon dan (2) pembakaran kayu serta ranting."
  },
  {
    id_soal: 13,
    mat: 3,
    topic: "Penyebab Perubahan Iklim",
    stim: "Setelah jam istirahat, siswa membuang gelas plastik dan sisa makanan ke tempat sampah. Melihat tempat sampah penuh, Hasan berkata, “Halaman sekolah sudah bersih, berarti masalah sampah sudah selesai.”",
    q: "Jawablah: a) Apakah pendapat Hasan sudah tepat? b) Apa bahaya dari tumpukan sisa makanan tersebut? c) Langkah apa yang diperlukan untuk mengurus sampah tersebut?"
  },
  {
    id_soal: 14,
    mat: 3,
    topic: "Penyebab Perubahan Iklim",
    stim: "Umar memiliki botol minum isi ulang yang masih bagus serta air minum yang cukup di rumah. Namun, ia ingin membeli minuman kemasan botol sekali pakai setiap hari agar praktis dan tidak perlu membawa botol dari rumah.",
    q: "Kebiasaan apa yang sebaiknya dilakukan Umar? Berikan alasanmu dengan mempertimbangkan dampak pembuatan botol serta jumlah sampah yang timbul."
  },
  {
    id_soal: 15,
    mat: 3,
    topic: "Penyebab Perubahan Iklim",
    stim: "Ani menemukan bahwa beberapa buku tulis semester lalu masih tersisa setengahnya. Buku tersebut masih memiliki cukup banyak lembar kosong, tetapi sampulnya sudah sedikit kusam. Ia bingung antara membeli buku baru atau tetap memanfaatkan sisa halaman tersebut.",
    q: "Pilihan mana yang menurutmu paling bijak diambil oleh Ani? Mengapa? Berikan satu ide kreatif untuk memanfaatkan sisa halaman tersebut agar catatan pelajaran baru tetap rapi dan tidak bercampur."
  },

  // ── MATERI 4: Dampak Perubahan Iklim ──
  {
    id_soal: 16,
    mat: 4,
    topic: "Dampak Perubahan Iklim",
    stim: "Hujan sudah lama tidak turun di gampong Umar. Air yang mengalir ke sawah semakin sedikit. Tanaman padi milik Ayah Umar mulai mengering. Keluarga Umar memperoleh penghasilan dari penjualan hasil panen.",
    q: "Bagaimana kekurangan air dapat memengaruhi hasil panen dan penghasilan Ayah Umar? Jelaskan hubungan keduanya."
  },
  {
    id_soal: 17,
    mat: 4,
    topic: "Dampak Perubahan Iklim",
    stim: "Saat suhu rata-rata Bumi naik, air laut menghangat. Sebagian es di daratan juga mencair. Kedua perubahan ini dapat menaikkan permukaan laut dan menambah risiko genangan di pesisir.",
    q: "Jelaskan bagaimana air laut yang menghangat dan es daratan yang mencair sama-sama dapat menaikkan permukaan laut."
  },
  {
    id_soal: 18,
    mat: 4,
    topic: "Dampak Perubahan Iklim",
    stim: "Sudah beberapa minggu hujan tidak turun di gampong Aisyah. Keluarga Aisyah masih memiliki cukup air untuk minum, memasak, dan mandi, sedangkan persediaan air keluarga Umar hampir habis. Bantuan air diantar bergiliran karena kendaraan hanya dapat membawa air untuk satu keluarga dalam sekali perjalanan.",
    q: "Menurutmu, keluarga mana yang perlu menerima bantuan air terlebih dahulu? Jelaskan alasanmu berdasarkan persediaan air kedua keluarga."
  },
  {
    id_soal: 19,
    mat: 4,
    topic: "Dampak Perubahan Iklim",
    stim: "Akibat perubahan iklim, musim kemarau di desa berlangsung jauh lebih lama dan udara terasa makin panas. Tanaman sayur di kebun sekolah mulai layu karena tanahnya sangat kering, sementara air bersih untuk menyiram tanaman sangat terbatas.",
    q: "Tuliskan satu ide kreatif dan sederhana yang bisa kamu dan teman-teman lakukan agar tanaman sayur tetap mendapatkan air tanpa membuang-buang air bersih. Jelaskan bagaimana cara kerja idemu."
  },
  {
    id_soal: 20,
    mat: 4,
    topic: "Dampak Perubahan Iklim",
    stim: "Halaman sekolah sering tergenang setelah hujan deras. Sampah terlihat menutup sebagian parit. Sebagian besar halaman juga tertutup beton. Guru mengajak siswa ikut meuseuraya, yaitu bekerja bersama merawat lingkungan.",
    q: "Usulkan dua langkah yang saling membantu untuk mengurangi genangan. Tuliskan langkah yang dapat dilakukan siswa bersama guru dan jelaskan manfaatnya."
  },

  // ── MATERI 5: Tindakan Ramah Lingkungan ──
  {
    id_soal: 21,
    mat: 5,
    topic: "Tindakan Ramah Lingkungan",
    stim: "Saat mencuci tangan sebelum makan, Umar membiarkan keran tetap terbuka ketika menggosok tangan dengan sabun. Air terus mengalir meskipun belum digunakan untuk membilas. Aisyah mengingatkan Umar agar menghemat air.",
    q: "Apa saranmu agar Umar tetap dapat mencuci tangan sampai bersih tanpa membuang banyak air? Jelaskan kapan keran perlu dibuka dan kapan perlu ditutup."
  },
  {
    id_soal: 22,
    mat: 5,
    topic: "Tindakan Ramah Lingkungan",
    stim: "Pada siang hari, ruang kelas Ali terasa sangat panas sehingga Bu Guru menyalakan kipas angin. Saat pelajaran olahraga dimulai, seluruh siswa dan guru keluar menuju lapangan, tetapi kipas tetap menyala. Ali berkata, “Kalau mau hemat listrik, sebaiknya kita tidak usah memakai kipas angin lagi sama sekali.”",
    q: "Apakah kamu setuju dengan pendapat Ali? Jelaskan aturan penggunaan kipas angin yang paling tepat: kapan kipas sebaiknya dinyalakan dan kapan harus dimatikan?"
  },
  {
    id_soal: 23,
    mat: 5,
    topic: "Tindakan Ramah Lingkungan",
    stim: "Umar menghadiri acara kenduri di gampongnya di Pidie. Beberapa anak mengambil nasi dan lauk sangat banyak sehingga tidak sanggup menghabiskannya dan sisa makanan terbuang.",
    q: "Tuliskan satu ide sederhana yang bisa dilakukan Umar untuk mencegah makanan terbuang. Bagaimana cara melakukan idemu? Mengapa cara tersebut dapat membantu mengurangi sisa makanan?"
  },
  {
    id_soal: 24,
    mat: 5,
    topic: "Tindakan Ramah Lingkungan",
    stim: "Air hujan yang deras menghanyutkan sampah bungkus makanan di halaman sekolah menuju selokan. Selokan mengalir ke sungai, lalu sungai bermuara ke laut. Seorang siswa berpendapat bahwa sampah di sekolah tidak akan sampai mengotori laut karena sekolah sangat jauh dari pantai.",
    q: "Menurutmu, apakah pendapat siswa itu tepat? Jelaskan alur perjalanan sampah dari halaman sekolah hingga sampai ke laut. Sebutkan satu tindakan nyata yang dapat kamu lakukan bersama teman-teman agar sampah plastik tidak mencemari lingkungan perairan."
  },
  {
    id_soal: 25,
    mat: 5,
    topic: "Tindakan Ramah Lingkungan",
    stim: "Setiap jam istirahat, kantin sekolah menyediakan minuman es teh menggunakan gelas plastik sekali pakai lengkap dengan sedotannya. Tempat sampah di dekat kantin selalu penuh dan meluap oleh tumpukan gelas plastik setiap hari.",
    q: "Apa ide sederhana yang dapat kamu usulkan agar siswa tetap bisa membeli es teh tanpa menghasilkan banyak sampah plastik? Jelaskan cara menjalankan idemu dan bagaimana ide itu dapat mengurangi sampah di kantin."
  },
  {
    id_soal: 26,
    mat: 1,
    topic: "Cuaca, Iklim, dan Musim",
    stim: "Pagi itu, Umar berangkat ke sekolah dengan berjalan kaki bersama Ali dan Aisyah. Matahari bersinar cerah dan udara terasa hangat. Namun, ketika waktu istirahat tiba, langit mulai mendung. Angin bertiup lebih kencang dan tidak lama kemudian hujan turun.\n\nSambil menunggu hujan reda, mereka memperhatikan halaman sekolah yang mulai basah. Ali bercerita bahwa beberapa hari terakhir cuaca di desa mereka sering berubah. Terkadang pagi hari cerah, tetapi siang harinya turun hujan. Aisyah juga bercerita bahwa keluarganya biasanya mulai mempersiapkan tanaman di kebun ketika musim hujan tiba.",
    q: "Berdasarkan cerita tersebut, sebutkan apa yang dimaksud dengan cuaca, iklim, dan musim!",
    level: 1,
    source: "lampiran"
  },
  {
    id_soal: 27,
    mat: 1,
    topic: "Cuaca, Iklim, dan Musim",
    stim: "Selama tiga hari, hujan deras turun di Gampong Berenuen. Umar dan Ali memperhatikan air sungai mulai meningkat. Saat berada di sekolah, Ali mengatakan bahwa iklim di desa mereka telah berubah karena hujan turun terus-menerus selama tiga hari.\n\nUmar merasa ragu dengan pernyataan Ali. Ia teringat penjelasan gurunya bahwa cuaca dapat berubah dalam waktu singkat, sedangkan iklim menggambarkan keadaan cuaca dalam jangka waktu yang panjang.",
    q: "Apakah hujan yang turun selama tiga hari sudah cukup untuk menyatakan bahwa iklim di Gampong Berenuen telah berubah? Jelaskan alasanmu",
    level: 2,
    source: "lampiran"
  },
  {
    id_soal: 28,
    mat: 1,
    topic: "Cuaca, Iklim, dan Musim",
    stim: "Musim kemarau telah berlangsung cukup lama. Air sumur di rumah Aisyah mulai berkurang. Ayah Aisyah mengingatkan seluruh anggota keluarga agar menggunakan air dengan hemat karena persediaan air harus mencukupi kebutuhan sehari-hari.\n\nSuatu pagi, Aisyah melihat adiknya membiarkan keran air terbuka ketika sedang menyikat gigi. Di halaman rumah, beberapa tanaman mulai layu karena tanah menjadi kering. Aisyah ingin membantu keluarganya menggunakan air secara bijaksana agar kebutuhan keluarga dan tanaman tetap terpenuhi.",
    q: "Jika kamu menjadi Aisyah, tindakan apa saja yang akan kamu lakukan untuk menghemat air selama musim kemarau? Jelaskan tiga tindakan dan manfaatnya bagi lingkungan!",
    level: 3,
    source: "lampiran"
  },
  {
    id_soal: 29,
    mat: 1,
    topic: "Cuaca, Iklim, dan Musim",
    stim: "Umar tinggal di sebuah desa yang sebagian besar penduduknya bekerja sebagai petani. Biasanya, petani mulai menanam padi ketika hujan sudah cukup untuk mengairi sawah. Namun, selama beberapa tahun pengamatan, jumlah curah hujan di desa tersebut semakin berkurang.\n\nSuatu hari, guru menunjukkan grafik tentang kondisi hujan dan pertanian. Umar melihat bahwa semakin sedikit hujan turun, semakin banyak sawah yang mengalami kekurangan air. Beberapa tanaman padi menguning dan hasil panen petani berkurang.",
    q: "Berdasarkan cerita dan infografis, mengapa berkurangnya curah hujan dapat menyebabkan tanaman padi menguning dan hasil panen menurun? Jelaskan hubungan antara curah hujan, ketersediaan air, pertumbuhan padi, dan kehidupan petani!",
    level: 4,
    source: "lampiran"
  },
  {
    id_soal: 30,
    mat: 1,
    topic: "Cuaca, Iklim, dan Musim",
    stim: "Hujan deras turun selama beberapa hari di Gampong Berenuen. Air sungai meluap hingga menggenangi rumah warga dan halaman sekolah. Setelah banjir surut, Umar, Ali, dan Aisyah berdiskusi tentang cara mengurangi risiko banjir pada musim hujan berikutnya.\n\nAli mengusulkan agar sebagian pohon di dekat sungai ditebang sehingga lahan dapat digunakan untuk membuat saluran air. Umar mengusulkan agar warga menjaga pohon yang masih ada dan menanam pohon baru di daerah hulu. Sementara itu, Aisyah mengusulkan pembuatan saluran air yang lebih baik serta kegiatan membersihkan sampah secara rutin.\n\nGuru kemudian menunjukkan infografis mengenai ketiga usulan tersebut agar siswa dapat mempertimbangkan manfaat dan dampaknya bagi lingkungan.",
    q: "Menurutmu, usulan siapa yang paling tepat untuk mengurangi risiko banjir tanpa merusak lingkungan? Bandingkan manfaat dan dampak ketiga usulan tersebut, kemudian jelaskan alasan pilihanmu!",
    level: 5,
    source: "lampiran"
  },
  {
    id_soal: 31,
    mat: 2,
    topic: "Atmosfer, Efek Rumah Kaca, dan Pemanasan Global",
    stim: "Pagi itu, Umar dan Aisyah berjalan menuju sekolah melewati persawahan di Gampong Berenuen. Udara terasa sejuk, angin bertiup perlahan, dan beberapa burung terlihat terbang di atas pepohonan. Di kejauhan, awan putih bergerak melintasi langit.\n\nSesampainya di sekolah, Umar melihat dua gambar yang dipajang di dinding kelas. Gambar pertama menunjukkan Bumi yang memiliki lautan, pepohonan, dan berbagai makhluk hidup. Sementara itu, gambar kedua menunjukkan permukaan Bulan yang dipenuhi batuan dan kawah.\n\nUmar memperhatikan bahwa meskipun Bumi dan Bulan sama-sama mendapatkan cahaya Matahari, keadaan keduanya sangat berbeda. Bumi memiliki lapisan udara yang disebut atmosfer, sedangkan Bulan hampir tidak memiliki atmosfer. Perbedaan tersebut membuat Umar penasaran mengapa kehidupan dapat berkembang di Bumi, tetapi tidak ditemukan kehidupan di Bulan.",
    q: "Berdasarkan gambar dan cerita tersebut, mengapa atmosfer sangat penting bagi kehidupan di Bumi? Jelaskan apa yang mungkin terjadi pada manusia, hewan, dan tumbuhan jika Bumi tidak memiliki atmosfer!",
    level: 2,
    source: "lampiran"
  },
  {
    id_soal: 32,
    mat: 2,
    topic: "Atmosfer, Efek Rumah Kaca, dan Pemanasan Global",
    stim: "Suatu malam, Umar duduk bersama ayahnya di halaman rumah. Udara terasa lebih dingin dibandingkan siang hari. Umar teringat bahwa pada siang hari sinar Matahari membuat permukaan tanah terasa panas, tetapi setelah Matahari terbenam, suhu udara perlahan menurun.\n\nKeesokan harinya, saat pelajaran IPAS, guru menunjukkan gambar bagaimana sinar Matahari mencapai permukaan Bumi. Guru menjelaskan bahwa Bumi melepaskan sebagian energi panas ke arah angkasa. Namun, gas-gas tertentu di atmosfer menyerap dan memancarkan kembali sebagian energi panas tersebut sehingga Bumi tetap memiliki suhu yang sesuai bagi kehidupan. Peristiwa ini disebut efek rumah kaca.",
    q: "Mengapa efek rumah kaca diperlukan bagi kehidupan di Bumi? Jelaskan apa yang dapat terjadi pada suhu Bumi jika tidak ada efek rumah kaca alami!",
    level: 2,
    source: "lampiran"
  },
  {
    id_soal: 33,
    mat: 2,
    topic: "Atmosfer, Efek Rumah Kaca, dan Pemanasan Global",
    stim: "Sekolah Aisyah akan mengadakan kegiatan peduli lingkungan. Kegiatan tersebut bertujuan mengurangi kebiasaan yang dapat meningkatkan emisi gas rumah kaca. Setiap kelompok diminta mengusulkan kegiatan yang dapat diterapkan secara berkelanjutan di sekolah.\n\nKelompok Ali mengusulkan penanaman pohon di halaman sekolah agar lingkungan menjadi lebih teduh. Kelompok Umar mengusulkan penghematan listrik dengan mematikan lampu dan kipas angin ketika tidak digunakan. Sementara itu, kelompok Aisyah mengusulkan agar siswa yang rumahnya dekat dengan sekolah berjalan kaki atau bersepeda jika kondisi perjalanan aman.\n\nKetiga kelompok yakin bahwa usulan mereka bermanfaat. Namun, sekolah ingin memilih kegiatan yang dapat dilakukan secara rutin dan memberikan dampak positif bagi lingkungan.",
    q: "Jika kamu diminta memilih dua dari tiga kegiatan tersebut untuk diterapkan di sekolah, kegiatan mana yang akan kamu pilih? Bandingkan manfaat ketiganya, kemudian jelaskan alasan pilihanmu berdasarkan pengaruhnya terhadap gas rumah kaca dan pemanasan global!",
    level: 5,
    source: "lampiran"
  },
  {
    id_soal: 34,
    mat: 2,
    topic: "Atmosfer, Efek Rumah Kaca, dan Pemanasan Global",
    stim: "Suatu pagi, aini membaca berita tentang meningkatnya suhu Bumi. Ia mengetahui bahwa karbon dioksida (CO₂) merupakan salah satu gas rumah kaca yang jumlahnya terus meningkat di atmosfer. Gas tersebut antara lain dihasilkan dari pembakaran bahan bakar pada kendaraan bermotor, pabrik, dan pembangkit listrik.\n\nKetika mengikuti pelajaran IPAS, guru menunjukkan infografis yang berisi data jumlah CO₂ di atmosfer Bumi selama lima tahun. aini mengamati angka-angka tersebut dan melihat bahwa jumlah CO₂ tidak sama setiap tahunnya.\n\nAini kemudian mengajak udin dan laila membandingkan data dari tahun ke tahun. Mereka ingin mengetahui seberapa besar peningkatan CO₂, bagaimana kecenderungan perubahannya, dan mengapa peningkatan tersebut perlu diperhatikan.",
    q: "Berdasarkan infografis tersebut, bagaimana perubahan jumlah CO₂ di atmosfer dari tahun 2020 sampai 2024? Hitunglah peningkatan CO₂ dari tahun 2020 ke 2024, kemudian jelaskan hubungan peningkatan CO₂ dengan pemanasan global. Susunlah tiga langkah yang dapat dilakukan untuk membantu mengurangi emisi CO₂ dalam kehidupan sehari-hari!",
    level: 4,
    source: "lampiran"
  },
  {
    id_soal: 35,
    mat: 2,
    topic: "Atmosfer, Efek Rumah Kaca, dan Pemanasan Global",
    stim: "Setiap pagi, Umar dan Ali berangkat ke sekolah melewati jalan raya yang ramai. Mereka melihat banyak orang menggunakan sepeda motor untuk pergi bekerja, berbelanja, dan mengantar anak ke sekolah. Ketika berhenti di persimpangan, Umar mencium bau asap kendaraan yang membuat udara terasa kurang nyaman.\n\nSesampainya di sekolah, guru menunjukkan infografis tentang dampak penggunaan sepeda motor terhadap iklim. Infografis tersebut menggambarkan sebuah kota yang dilalui sekitar 100.000 sepeda motor setiap hari. Kendaraan yang menggunakan bahan bakar bensin menghasilkan karbon dioksida (CO₂), salah satu gas rumah kaca yang berkontribusi terhadap pemanasan global.\n\nUmar kemudian memperhatikan bahwa semakin banyak kendaraan berbahan bakar bensin yang digunakan, semakin besar kemungkinan jumlah emisi CO₂ yang dihasilkan.",
    q: "Berdasarkan infografis tersebut, bagaimana penggunaan sepeda motor dalam jumlah besar dapat berkontribusi terhadap perubahan iklim? Jelaskan hubungan antara pembakaran bensin, peningkatan gas CO₂ di atmosfer, dan pemanasan global! Kemudian, tentukan dua tindakan yang dapat dilakukan masyarakat untuk mengurangi emisi dari penggunaan sepeda motor!",
    level: 4,
    source: "lampiran"
  },
  {
    id_soal: 36,
    mat: 3,
    topic: "Penyebab Perubahan Iklim",
    stim: "Setiap pagi, Umar berjalan menuju sekolah bersama Ali dan Aisyah. Sepanjang perjalanan, mereka melewati jalan yang semakin ramai dilalui kendaraan bermotor. Di dekat persawahan, Umar juga melihat beberapa lahan yang dahulu ditumbuhi pepohonan kini telah berubah menjadi bangunan.\n\nSuatu hari, ketika mengikuti pelajaran IPAS, guru mengajak siswa membicarakan perubahan lingkungan di sekitar tempat tinggal mereka. Guru menjelaskan bahwa kegiatan manusia dapat memengaruhi keadaan atmosfer Bumi. Beberapa kegiatan menghasilkan gas rumah kaca yang dapat mempercepat pemanasan global dan perubahan iklim.",
    q: "Berdasarkan pengetahuanmu, sebutkan tiga kegiatan manusia yang dapat menyebabkan perubahan iklim dan tuliskan gas rumah kaca yang dapat dihasilkan dari kegiatan tersebut!",
    level: 1,
    source: "lampiran-materi-3"
  },
  {
    id_soal: 37,
    mat: 3,
    topic: "Penyebab Perubahan Iklim",
    stim: "Di dekat Gampong Berenuen terdapat kawasan hutan yang dahulu dipenuhi pepohonan. Ketika hujan turun, air mengalir melalui sungai yang melewati desa. Sebagian penduduk memanfaatkan hasil hutan dan lahan di sekitarnya untuk memenuhi kebutuhan sehari-hari.\n\nBeberapa tahun kemudian, sebagian kawasan hutan dibuka untuk pembangunan dan perkebunan. Banyak pohon ditebang sehingga keadaan kawasan tersebut berubah. Ketika mengikuti pelajaran IPAS, Aisyah mengetahui bahwa pepohonan menyerap karbon dioksida (CO₂) dari udara selama proses fotosintesis. Ia kemudian membandingkan keadaan hutan sebelum dan setelah banyak pohon ditebang.",
    q: "Mengapa penebangan pohon dalam jumlah besar dapat memperburuk perubahan iklim? Jelaskan hubungan antara berkurangnya pepohonan, karbon dioksida di atmosfer, dan peningkatan suhu Bumi!",
    level: 2,
    source: "lampiran-materi-3"
  },
  {
    id_soal: 38,
    mat: 3,
    topic: "Penyebab Perubahan Iklim",
    stim: "Pada hari Senin, Umar mendapat tugas piket bersama teman-temannya. Ketika memasuki kelas, ia melihat lampu masih menyala meskipun cahaya Matahari sudah cukup menerangi ruangan. Beberapa kipas angin juga tetap menyala saat kelas kosong.\n\nKetika waktu pulang tiba, Umar melihat banyak orang tua menunggu anak-anaknya dengan sepeda motor yang mesinnya tetap hidup. Di halaman sekolah, beberapa siswa sedang membicarakan kegiatan peduli lingkungan yang akan dilaksanakan minggu depan. Umar ingin mengusulkan kegiatan yang tidak hanya dilakukan selama satu hari, tetapi dapat menjadi kebiasaan seluruh warga sekolah untuk membantu mengurangi emisi gas rumah kaca.",
    q: "Jika kamu menjadi Umar, tentukan tiga kebiasaan yang dapat diterapkan di sekolah untuk membantu mengurangi penyebab perubahan iklim! Jelaskan bagaimana setiap kebiasaan tersebut dapat mengurangi emisi gas rumah kaca!",
    level: 3,
    source: "lampiran-materi-3"
  },
  {
    id_soal: 39,
    mat: 3,
    topic: "Penyebab Perubahan Iklim",
    stim: "Suatu pagi, Ali membaca artikel tentang perubahan iklim di perpustakaan sekolah. Artikel tersebut menjelaskan bahwa penggunaan batu bara, minyak bumi, dan gas alam dalam berbagai kegiatan manusia dapat menghasilkan karbon dioksida (CO₂). Gas tersebut dapat bertahan lama di atmosfer dan berkontribusi terhadap pemanasan global.\n\nKetika pelajaran IPAS dimulai, guru menunjukkan infografis tentang perubahan jumlah CO₂ di atmosfer Bumi. Data tersebut memperlihatkan perbedaan jumlah CO₂ sebelum kegiatan industri berkembang pesat dan pada masa sekarang.",
    q: "Berdasarkan infografis tersebut, berapa peningkatan jumlah CO₂ di atmosfer dari tahun 1750 hingga 2024? Tunjukkan langkah perhitunganmu! Selanjutnya, analisislah bagaimana kegiatan manusia dapat menyebabkan peningkatan CO₂ tersebut dan mengapa peningkatannya dapat mempercepat perubahan iklim!",
    level: 4,
    source: "lampiran-materi-3"
  },
  {
    id_soal: 40,
    mat: 3,
    topic: "Penyebab Perubahan Iklim",
    stim: "Sekolah Aisyah akan mengadakan program peduli lingkungan. Setiap kelompok diminta mengusulkan kegiatan yang dapat membantu mengurangi penyebab perubahan iklim.\n\nKelompok Umar mengusulkan penanaman pohon di halaman sekolah. Kelompok Ali ingin mengadakan kegiatan hemat listrik setiap hari. Sementara itu, kelompok Aisyah mengusulkan agar siswa mengurangi penggunaan kendaraan bermotor untuk perjalanan jarak dekat jika kondisi perjalanan aman.\n\nKetiga kelompok menyampaikan bahwa kegiatan mereka memiliki manfaat bagi lingkungan. Namun, sekolah hanya memiliki biaya dan waktu yang terbatas sehingga tidak semua kegiatan dapat dilaksanakan secara bersamaan.",
    q: "Jika kamu menjadi anggota tim peduli lingkungan sekolah, dua kegiatan manakah yang akan kamu pilih untuk membantu mengurangi penyebab perubahan iklim? Bandingkan manfaat dan tantangan dari ketiga kegiatan tersebut, kemudian jelaskan mengapa dua kegiatan pilihanmu lebih sesuai untuk diterapkan secara berkelanjutan di sekolah!",
    level: 5,
    source: "lampiran-materi-3"
  },
  {
    id_soal: 41,
    mat: 4,
    topic: "Dampak Perubahan Iklim",
    stim: "Pagi itu, Umar menemani ayahnya pergi ke sawah. Sepanjang perjalanan, ia melihat beberapa petak sawah mulai mengering. Tanah terlihat retak dan sebagian tanaman padi mulai menguning.\n\nAyah Umar bercerita bahwa beberapa tahun terakhir para petani semakin sulit menentukan waktu menanam padi. Terkadang hujan datang lebih lambat dari biasanya, tetapi pada waktu lain hujan turun sangat deras hingga menggenangi sawah. Kondisi tersebut membuat para petani harus lebih berhati-hati dalam mengatur kegiatan pertanian.\n\nUmar teringat pelajaran IPAS tentang perubahan iklim yang dapat memengaruhi lingkungan dan kehidupan manusia.",
    q: "Berdasarkan pengetahuanmu, sebutkan tiga dampak perubahan iklim yang dapat terjadi pada lingkungan dan kehidupan manusia!",
    level: 1,
    source: "lampiran"
  },
  {
    id_soal: 42,
    mat: 4,
    topic: "Dampak Perubahan Iklim",
    stim: "Musim kemarau berlangsung lebih lama dari yang diperkirakan. Air sumur di rumah Ali mulai berkurang. Beberapa tanaman di halaman rumah tampak layu karena tanah semakin kering.\n\nSuatu pagi, Ali melihat adiknya membiarkan keran terbuka ketika mencuci tangan. Di halaman rumah, ibunya sedang mengumpulkan air bekas cucian beras untuk menyiram tanaman. Ayah Ali mengingatkan seluruh anggota keluarga agar menggunakan air seperlunya karena persediaan air harus mencukupi kebutuhan sehari-hari.\n\nAli ingin membantu keluarganya menghadapi kekurangan air tanpa mengabaikan kebutuhan manusia, hewan, dan tumbuhan di sekitar rumah.",
    q: "Jika kamu menjadi Ali, tindakan apa saja yang akan kamu lakukan untuk menghadapi kekurangan air akibat musim kemarau? Tuliskan tiga tindakan dan jelaskan bagaimana tindakan tersebut membantu menjaga ketersediaan air serta kelangsungan hidup makhluk hidup di sekitarmu!",
    level: 3,
    source: "lampiran"
  },
  {
    id_soal: 43,
    mat: 4,
    topic: "Dampak Perubahan Iklim",
    stim: "Perhatikan ilustrasi berikut:",
    q: "Berdasarkan cerita dan infografis, jika kamu menjadi anggota tim peduli lingkungan sekolah, dua usulan manakah yang akan kamu pilih untuk mengurangi risiko banjir? Bandingkan manfaat dan kelemahan ketiga usulan tersebut, kemudian jelaskan alasan pilihanmu dengan mempertimbangkan keselamatan warga, kelestarian lingkungan, dan manfaatnya dalam jangka panjang!",
    level: 5,
    source: "lampiran"
  },
  {
    id_soal: 44,
    mat: 4,
    topic: "Dampak Perubahan Iklim",
    stim: "Amatilah infografis berikut!",
    q: "Berdasarkan infografis tersebut, bagaimana perubahan hasil panen padi selama empat musim tanam? Hitunglah selisih hasil panen pada musim pertama dan musim keempat! Kemudian, jelaskan bagaimana kekurangan air akibat perubahan pola hujan dapat memengaruhi hasil panen, penghasilan petani, dan kebutuhan pangan masyarakat!",
    level: 4,
    source: "lampiran"
  },
  {
    id_soal: 45,
    mat: 4,
    topic: "Dampak Perubahan Iklim",
    stim: "Perhatikan data pada gambar berikut:",
    q: "Berdasarkan infografis tersebut, hitunglah jumlah sampah yang dihasilkan Desa Berkah selama satu minggu!. Menurutmu, apa dampaknya terhadap lingkungan jika sampah tersebut tidak dikelola dengan baik?. Tuliskan 2 ide yang kamu miliki untuk mengolah sampah tersebut agar lebih berguna!",
    level: 6,
    source: "lampiran"
  },
  {
    id_soal: 46,
    mat: 5,
    topic: "Tindakan Ramah Lingkungan",
    stim: "Setiap pagi, Umar, Ali, dan Aisyah berjalan menuju sekolah melewati persawahan di Gampong Berenuen. Sepanjang perjalanan, mereka melihat pepohonan, saluran air, dan beberapa tempat sampah yang disediakan warga.\n\nKetika tiba di sekolah, mereka melihat beberapa siswa sedang membersihkan halaman. Ada yang mengumpulkan daun kering, menyapu sampah, dan menyiram tanaman. Setelah kegiatan selesai, guru mengajak siswa memperhatikan keadaan lingkungan sekolah dan kebiasaan sehari-hari yang dapat memengaruhi kebersihannya.",
    q: "Jelaskan apa yang dimaksud dengan Tindakan ramah lingkungan, dan sebutkan 3 contoh prilaku ramah lingkungan dalam kehidupan sehari hari",
    level: 1,
    source: "lampiran"
  },
  {
    id_soal: 47,
    mat: 5,
    topic: "Tindakan Ramah Lingkungan",
    stim: "Sepulang sekolah, Aisyah membantu ibunya membersihkan dapur. Setelah selesai memasak, ia melihat kulit buah, sisa sayuran, dan beberapa bungkus plastik terkumpul di dalam satu tempat sampah. Di halaman rumah, daun-daun kering yang berguguran juga mulai menumpuk.\n\nBiasanya, seluruh sampah tersebut dikumpulkan dalam satu kantong untuk dibuang. Namun, hari itu tempat sampah sudah penuh, sedangkan petugas pengangkut sampah baru akan datang beberapa hari lagi. Aisyah khawatir sampah yang terus menumpuk akan menimbulkan bau tidak sedap dan mengganggu kebersihan lingkungan rumah.",
    q: "Jika kamu menjadi Aisyah, tindakan ramah lingkungan apa yang dapat kamu lakukan untuk mengelola sampah tersebut? Jelaskan langkah-langkah yang akan kamu lakukan serta manfaatnya bagi lingkungan!",
    level: 3,
    source: "lampiran"
  },
  {
    id_soal: 48,
    mat: 5,
    topic: "Tindakan Ramah Lingkungan",
    stim: "Perhatikan infografis berikut ini:",
    q: "Berdasarkan grafik pada infografis, berapa pertambahan jumlah kendaraan bermotor dari tahun 2022 hingga 2026?. Jika kamu menjadi Umar, tindakan ramah lingkungan apa yang akan kamu usulkan untuk mengurangi emisi kendaraan bermotor? Jelaskan dua tindakan beserta alasan dan manfaatnya bagi lingkungan!",
    level: 4,
    source: "lampiran"
  },
  {
    id_soal: 49,
    mat: 5,
    topic: "Tindakan Ramah Lingkungan",
    stim: "Setiap pagi, kamu diantar ayah ke sekolah menggunakan sepeda motor, meskipun jarak rumahmu cukup dekat. Sesampainya di sekolah, kamu melihat banyak siswa lain juga diantar menggunakan sepeda motor sehingga jalan di depan sekolah menjadi ramai.\n\nSaat pelajaran IPAS, kamu mengetahui bahwa kendaraan berbahan bakar bensin menghasilkan gas karbon dioksida (CO₂) yang dapat berkontribusi terhadap pemanasan global.",
    q: "Tindakan apa yang dapat kamu lakukan untuk mengurangi penggunaan kendaraan bermotor saat berangkat ke sekolah! Jelaskan kegiatan yang akan kamu buat, langkah-langkah pelaksanaannya, dan bagaimana cara mengetahui bahwa kegiatan tersebut berhasil mengurangi jumlah kendaraan bermotor serta membantu menjaga lingkungan!",
    level: 6,
    source: "lampiran"
  },
  {
    id_soal: 50,
    mat: 5,
    topic: "Tindakan Ramah Lingkungan",
    stim: "Setiap kali hujan deras turun, kampung Meunasah Usen sering mengalami banjir. Air yang meluap menggenangi rumah dan jalan. Setelah banjir surut, banyak lumpur tertinggal di halaman rumah dan sepanjang jalan desa. Warga harus bekerja keras membersihkan lumpur agar dapat kembali beraktivitas.\n\nMelihat keadaan tersebut, Umar ingin mengajak teman-temannya membantu warga mencari cara agar banjir tidak terus menimbulkan kerusakan lingkungan.",
    q: " Jika kamu menjadi Umar, ide kreatif ramah lingkungan apa yang akan kamu buat untuk membantu mengurangi risiko banjir dan mengatasi lumpur yang tertinggal? Jelaskan langkah-langkah pelaksanaannya serta manfaatnya bagi lingkungan dan masyarakat!",
    level: 6,
    source: "lampiran"
  }
];

// ══════════════════════════════════════════════════════════
// 2. MASTER DATA KUNCI JAWABAN IDEAL & KATA KUNCI ACUAN NLP
// ══════════════════════════════════════════════════════════
// Dirancang berelasi melalui 'id_soal' agar dinamis (mendukung ekspansi hingga 50 soal atau lebih).
// Referensi: Diolah dari teks narasi ilmiah pada js/data/materi-read.js

const KUNCI_JAWABAN_ESSAY = [
  // ── MATERI 1 (Soal 1 s.d. 5) ──
  {
    id_jawaban: 1,
    id_soal: 1,
    jawaban_ideal: "Dua perubahannya adalah keadaan langit yang berubah dari cerah menjadi gelap berawan serta suhu udara yang berubah dari hangat menjadi sejuk disertai turunnya hujan. Kejadian ini merupakan perubahan cuaca karena terjadi pada tempat tertentu dalam rentang waktu yang sangat singkat (hitungan jam di hari yang sama), bukan perubahan iklim yang membutuhkan waktu pengamatan rata-rata puluhan tahun (30 tahun atau lebih).",
    kata_kunci: [
      "langit cerah ke gelap",
      "suhu hangat ke sejuk",
      "turun hujan",
      "waktu singkat",
      "hitungan jam",
      "hari yang sama",
      "bukan iklim puluhan tahun"
    ]
  },
  {
    id_jawaban: 2,
    id_soal: 2,
    jawaban_ideal: "Air hujan menggenang lebih lama di halaman kedua karena tanahnya ditutup beton sehingga air hujan tidak memiliki tempat untuk meresap ke dalam tanah, dan jalan aliran air (parit) tersumbat sampah sehingga air terhambat mengalir keluar. Sebaliknya, pada halaman pertama terdapat tanah terbuka dan akar pepohonan yang menyerap air ke dalam tanah, serta paritnya bersih sehingga sisa air cepat mengalir dan surut.",
    kata_kunci: [
      "tertutup beton",
      "tidak bisa meresap",
      "parit tersumbat sampah",
      "aliran terhambat",
      "tanah terbuka",
      "resapan air",
      "pohon menyerap air",
      "parit bersih cepat surut"
    ]
  },
  {
    id_jawaban: 3,
    id_soal: 3,
    jawaban_ideal: "Kesimpulan Umar kurang tepat. Hari ini yang tidak hujan hanyalah variasi cuaca dalam satu hari. Musim hujan adalah pola cuaca di mana frekuensi hujan lebih sering turun selama rentang waktu beberapa bulan (biasanya Oktober–April di Indonesia). Jadi, satu atau dua hari cerah tidak berarti musim hujan sudah berakhir, melainkan hanya cuaca harian yang sedang cerah di tengah musim hujan.",
    kata_kunci: [
      "kesimpulan tidak tepat",
      "variasi cuaca harian",
      "musim hujan rentang bulan",
      "pola berulang",
      "hari cerah di musim hujan",
      "bukan akhir musim"
    ]
  },
  {
    id_jawaban: 4,
    id_soal: 4,
    jawaban_ideal: "Catatan cuaca selama tujuh hari belum cukup karena tujuh hari hanyalah rentang waktu yang sangat pendek untuk cuaca harian sesaat. Iklim adalah pola rata-rata cuaca jangka panjang yang mencakup wilayah luas dan membutuhkan data pengamatan bertahun-tahun (biasanya minimal 30 tahun). Oleh karena itu, diperlukan catatan bertahun-tahun untuk membuktikan apakah ada pergeseran pola iklim yang konsisten atau hanya variasi cuaca panas sementara.",
    kata_kunci: [
      "tujuh hari terlalu singkat",
      "cuaca sesaat harian",
      "iklim jangka panjang",
      "minimal 30 tahun",
      "pola rata-rata bertahun-tahun",
      "catatan historis"
    ]
  },
  {
    id_jawaban: 5,
    id_soal: 5,
    jawaban_ideal: "Dua kegiatan yang dapat direncanakan adalah: 1) Membuat jadwal penyiraman rutin pada pagi atau sore hari saat matahari tidak terik, manfaatnya agar air menyerap maksimal ke akar tanaman dan tidak cepat menguap karena panas. 2) Memanfaatkan air bekas wudu atau cucian bersih (graywater) dan memberi penutup tanah (mulsa daun kering), manfaatnya untuk menghemat penggunaan air bersih sekaligus menjaga kelembapan tanah agar tidak cepat kering.",
    kata_kunci: [
      "jadwal penyiraman pagi sore",
      "tidak cepat menguap",
      "air bekas wudu atau cucian",
      "hemat air bersih",
      "mulsa daun kering",
      "menjaga kelembapan tanah"
    ]
  },

  // ── MATERI 2 (Soal 6 s.d. 10) ──
  {
    id_jawaban: 6,
    id_soal: 6,
    jawaban_ideal: "Jika gas rumah kaca terus bertambah di atmosfer, suhu rata-rata permukaan Bumi akan semakin panas (mengalami pemanasan global). Hal ini terjadi karena gas rumah kaca bekerja seperti selimut tebal yang menahan radiasi panas; semakin banyak konsentrasi gas tersebut di udara, semakin banyak panas dari permukaan Bumi yang terperangkap dan dipantulkan kembali ke Bumi, sehingga panas yang lolos ke luar angkasa semakin sedikit.",
    kata_kunci: [
      "suhu bumi meningkat",
      "pemanasan global",
      "panas terperangkap",
      "selimut tebal",
      "radiasi panas ditahan",
      "tidak lolos ke luar angkasa"
    ]
  },
  {
    id_jawaban: 7,
    id_soal: 7,
    jawaban_ideal: "Pemanasan global meningkatkan suhu udara dan permukaan laut sehingga laju penguapan air meningkat pesat. Udara yang lebih hangat menampung lebih banyak uap air, yang mengakibatkan hujan turun lebih deras dan ekstrem di beberapa tempat yang memicu banjir, sementara di wilayah lain musim kemarau menjadi jauh lebih panjang dan kering. Hal ini berkaitan dengan perubahan iklim karena siklus air terganggu sehingga jadwal dan pola musim tidak lagi teratur seperti dahulu.",
    kata_kunci: [
      "penguapan air meningkat",
      "udara hangat menampung uap air",
      "hujan deras ekstrem banjir",
      "kemarau lebih panjang kering",
      "pola musim tidak menentu",
      "siklus air terganggu"
    ]
  },
  {
    id_jawaban: 8,
    id_soal: 8,
    jawaban_ideal: "Usulan Ali tidak tepat. Gas rumah kaca alami sebenarnya sangat penting bagi kehidupan di Bumi karena berfungsi menjaga suhu Bumi tetap hangat dan layak huni (rata-rata sekitar 15°C). Jika seluruh gas rumah kaca dihilangkan, Bumi akan menjadi sangat dingin dan beku hingga mencapai sekitar minus 18°C, sehingga lautan akan membeku dan makhluk hidup termasuk manusia tidak dapat bertahan hidup. Yang berbahaya adalah penumpukan berlebih akibat aktivitas manusia, bukan keberadaan alaminya.",
    kata_kunci: [
      "usulan tidak tepat",
      "gas rumah kaca alami dibutuhkan",
      "bumi membeku sangat dingin",
      "minus 18 derajat",
      "makhluk hidup tidak bertahan",
      "yang berbahaya kelebihan gas"
    ]
  },
  {
    id_jawaban: 9,
    id_soal: 9,
    jawaban_ideal: "Penjelasannya adalah: Tanaman memang memanfaatkan gas karbon dioksida (CO₂) sebagai bahan fotosintesis untuk menghasilkan makanan dan oksigen. Namun, jumlah emisi CO₂ yang dihasilkan aktivitas manusia saat ini (kendaraan bermotor, pabrik, pembangkit listrik) jauh melampaui kapasitas tanaman di Bumi untuk menyerapnya, terutama karena banyak hutan ditebang. Akibatnya, kelebihan CO₂ menumpuk di atmosfer dan memerangkap radiasi panas matahari, sehingga memicu pemanasan global.",
    kata_kunci: [
      "fotosintesis menghasilkan makanan",
      "emisi melebihi kapasitas tanaman",
      "hutan ditebang berkurang penyerap",
      "menumpuk di atmosfer",
      "memerangkap panas matahari"
    ]
  },
  {
    id_jawaban: 10,
    id_soal: 10,
    jawaban_ideal: "Rencana cerita bergambar secara berurut: Panel 1: Menunjukkan Matahari menyinari Bumi dengan jarak yang tetap tidak berubah (menepis anggapan matahari mendekat). Panel 2: Menunjukkan kegiatan manusia di Bumi (kendaraan berasap, pabrik, penebangan pohon) melepaskan banyak gas CO₂ ke udara. Panel 3: Menunjukkan gas-gas tersebut membentuk lapisan seperti selimut tebal di sekeliling atmosfer Bumi. Panel 4: Menunjukkan sinar panas Matahari yang masuk tidak bisa keluar kembali karena tertahan selimut gas, sehingga Bumi menjadi semakin gerah dan panas.",
    kata_kunci: [
      "panel 1 jarak matahari tetap",
      "panel 2 asap kendaraan pabrik emisi CO2",
      "panel 3 gas membentuk selimut tebal atmosfer",
      "panel 4 panas terperangkap suhu naik"
    ]
  },

  // ── MATERI 3 (Soal 11 s.d. 15) ──
  {
    id_jawaban: 11,
    id_soal: 11,
    jawaban_ideal: "Gas CO₂ dihasilkan dari proses pembakaran bahan bakar fosil seperti batu bara di pembangkit listrik (PLTU). Lampu di kelas memang tidak mengeluarkan asap secara langsung, tetapi alurnya adalah: lampu membutuhkan energi listrik -> energi listrik dihasilkan dari PLTU -> PLTU membakar berton-ton batu bara untuk memutar turbin -> proses pembakaran batu bara tersebut melepaskan asap tebal yang mengandung banyak gas CO₂ ke atmosfer. Jadi, menyalakan lampu secara tidak langsung menambah gas CO₂ di udara.",
    kata_kunci: [
      "pembakaran batu bara di PLTU",
      "pembangkit listrik tenaga uap",
      "lampu membutuhkan listrik",
      "asap pembakaran menghasilkan CO2",
      "emisi tidak langsung"
    ]
  },
  {
    id_jawaban: 12,
    id_soal: 12,
    jawaban_ideal: "Dua perubahannya adalah: 1) Akibat penebangan pohon: Berkurangnya penyerap CO₂ alami di Bumi, karena pohon hidup berfungsi menyerap CO₂ dari udara untuk fotosintesis. 2) Akibat pembakaran kayu dan ranting: Karbon yang selama ini tersimpan di dalam jaringan batang dan kayu pohon dilepaskan kembali secara langsung ke udara dalam bentuk gas CO₂ melalui asap pembakaran, sehingga konsentrasi gas rumah kaca naik dua kali lipat.",
    kata_kunci: [
      "penebangan menghilangkan penyerap CO2",
      "fotosintesis berkurang",
      "pembakaran melepaskan karbon tersimpan",
      "menjadi gas CO2 di udara",
      "konsentrasi gas rumah kaca naik"
    ]
  },
  {
    id_jawaban: 13,
    id_soal: 13,
    jawaban_ideal: "a) Pendapat Hasan belum tepat, karena memindahkan sampah ke tempat sampah baru langkah awal pembersihan lingkungan dan masalah belum selesai jika sampah hanya ditimbun di TPA. b) Bahaya tumpukan sisa makanan adalah ketika membusuk tanpa udara di tumpukan sampah, sampah organik menghasilkan gas metana (CH₄), yaitu gas rumah kaca yang kekuatannya jauh lebih kuat daripada CO₂ dalam memerangkap panas. c) Langkah yang diperlukan adalah memilah sampah sejak dari sumbernya: sampah organik (sisa makanan) diolah menjadi kompos atau pakan ternak/maggot, sedangkan sampah anorganik (gelas plastik) didaur ulang atau dikurangi penggunaannya.",
    kata_kunci: [
      "pendapat belum tepat",
      "sampah organik membusuk",
      "menghasilkan gas metana CH4",
      "gas rumah kaca sangat kuat",
      "pemilahan sampah",
      "mengolah kompos",
      "daur ulang plastik"
    ]
  },
  {
    id_jawaban: 14,
    id_soal: 14,
    jawaban_ideal: "Umar sebaiknya membiasakan membawa botol minum isi ulang (tumbler) dari rumah. Alasannya: 1) Pembuatan botol plastik sekali pakai membutuhkan ekstraksi minyak bumi, energi pabrik, dan bahan bakar transportasi yang semuanya melepaskan gas rumah kaca (CO₂). 2) Membeli botol sekali pakai setiap hari akan menambah timbunan sampah plastik yang sulit terurai dan mencemari lingkungan. Dengan membawa tumbler, Umar menghemat energi produksi dan mencegah timbulan sampah plastik baru.",
    kata_kunci: [
      "membawa botol isi ulang tumbler",
      "produksi botol butuh minyak bumi energi",
      "emisi karbon pembuatan botol",
      "menumpuk sampah plastik sulit terurai",
      "mencegah timbulan sampah"
    ]
  },
  {
    id_jawaban: 15,
    id_soal: 15,
    jawaban_ideal: "Pilihan yang paling bijak adalah memanfaatkan sisa halaman kosong buku tulis tersebut. Mengapa? Karena setiap lembar kertas dibuat dari serat kayu pohon yang diproses di pabrik dengan energi dan air yang besar; menghemat kertas berarti membantu mencegah penebangan pohon lebih banyak dan mengurangi jejak karbon pabrik kertas. Ide kreatif: Ani dapat membuat pembatas kertas lipat yang diberi label nama mata pelajaran baru, atau menghias sampul buku yang kusam dengan gambar/kertas bekas agar terlihat menarik dan rapi.",
    kata_kunci: [
      "memanfaatkan sisa halaman kosong",
      "kertas berasal dari serat pohon",
      "menghemat energi pabrik dan pohon",
      "membuat pembatas bab pelajaran baru",
      "menghias sampul buku"
    ]
  },

  // ── MATERI 4 (Soal 16 s.d. 20) ──
  {
    id_jawaban: 16,
    id_soal: 16,
    jawaban_ideal: "Hubungan keduanya adalah: Tanaman padi sangat membutuhkan pasokan air yang cukup untuk tumbuh dan menghasilkan bulir padi. Kekurangan air akibat kemarau berkepanjangan membuat tanaman padi mengering, kerdil, bahkan mengalami gagal panen (puso). Jika hasil panen berkurang drastis atau gagal panen terjadi, jumlah gabah/beras yang dapat dijual oleh Ayah Umar menjadi sangat sedikit atau tidak ada sama sekali, yang secara langsung menyebabkan penurunan drastis pada penghasilan keluarga.",
    kata_kunci: [
      "padi butuh air untuk tumbuh",
      "tanaman mengering kerdil",
      "gagal panen puso",
      "gabah yang dijual sedikit",
      "penghasilan keluarga menurun"
    ]
  },
  {
    id_jawaban: 17,
    id_soal: 17,
    jawaban_ideal: "Keduanya menaikkan permukaan laut dengan cara: 1) Air laut yang menghangat mengalami peristiwa pemuaian termal, di mana partikel air laut yang memanas akan mengembang dan menempati volume yang lebih besar sehingga permukaan air naik. 2) Es di daratan (seperti gletser pegunungan dan tudung es kutub) yang mencair akibat kenaikan suhu akan mengalirkan air lelehan baru dari daratan masuk ke dalam samudra, sehingga menambah volume total air di laut.",
    kata_kunci: [
      "pemuaian termal air laut",
      "air memanas mengembang volumenya",
      "es daratan mencair",
      "air lelehan mengalir ke samudra",
      "volume total air bertambah",
      "kenaikan permukaan laut"
    ]
  },
  {
    id_jawaban: 18,
    id_soal: 18,
    jawaban_ideal: "Keluarga yang perlu menerima bantuan air terlebih dahulu adalah keluarga Umar. Alasannya, persediaan air keluarga Umar sudah hampir habis sehingga mereka berada dalam kondisi darurat untuk kebutuhan pokok hidup yang sangat vital (minum, memasak, dan kebersihan). Sementara itu, keluarga Aisyah masih memiliki cadangan air yang cukup untuk bertahan beberapa waktu ke depan. Prinsip keadilan bantuan mengutamakan pihak yang paling rentan dan paling mendesak kebutuhannya.",
    kata_kunci: [
      "keluarga Umar diutamakan",
      "persediaan hampir habis",
      "kebutuhan darurat pokok vital",
      "keluarga Aisyah masih cukup",
      "prioritas yang paling rentan"
    ]
  },
  {
    id_jawaban: 19,
    id_soal: 19,
    jawaban_ideal: "Ide kreatif: Membuat sistem irigasi tetes mandiri dari botol plastik bekas (drip irrigation) menggunakan air bekas cuci tangan atau air wudu. Cara kerjanya: Botol plastik bekas dilubangi kecil pada bagian tutupnya menggunakan jarum, diisi dengan air bekas wudu/cucian yang ditampung, kemudian ditancapkan terbalik di dekat pangkal tanaman sayur. Air akan menetes secara perlahan dan langsung menuju akar tanaman, menjaga tanah tetap lembap sepanjang hari tanpa boros air.",
    kata_kunci: [
      "irigasi tetes botol bekas",
      "air bekas wudu cuci tangan",
      "botol dilubangi kecil",
      "menetes perlahan ke akar",
      "menjaga kelembapan tanah",
      "tanpa membuang air bersih"
    ]
  },
  {
    id_jawaban: 20,
    id_soal: 20,
    jawaban_ideal: "Dua langkah yang saling melengkapi adalah: 1) Membersihkan sampah dan endapan lumpur di parit/saluran air sekolah secara gotong royong (meuseuraya), manfaatnya agar aliran air hujan mengalir lancar menuju pembuangan tanpa terhambat. 2) Membuat lubang resapan biopori atau taman resapan tanah di sudut-sudut halaman beton, manfaatnya agar air hujan dapat meresap langsung ke dalam tanah di bawah halaman dan mengurangi volume air yang menggenang di permukaan.",
    kata_kunci: [
      "membersihkan sampah di parit",
      "aliran air lancar",
      "membuat lubang biopori",
      "taman resapan air",
      "air meresap ke tanah",
      "mengurangi genangan air"
    ]
  },

  // ── MATERI 5 (Soal 21 s.d. 25) ──
  {
    id_jawaban: 21,
    id_soal: 21,
    jawaban_ideal: "Saran saya adalah Umar menerapkan kebiasaan membuka dan menutup keran secara tepat saat mencuci tangan: Keran dibuka sebentar di awal untuk membasahi telapak tangan, kemudian keran harus langsung ditutup saat menggosok tangan menggunakan sabun (selama 20 detik). Setelah tangan disabuni dan dibersihkan dengan baik, keran baru dibuka kembali untuk membilas busa sabun hingga bersih, lalu segera dimatikan kembali. Cara ini menghemat banyak liter air bersih.",
    kata_kunci: [
      "keran dibuka membasahi tangan",
      "keran ditutup saat menyabuni tangan",
      "keran dibuka membilas busa",
      "langsung dimatikan kembali",
      "menghemat air bersih"
    ]
  },
  {
    id_jawaban: 22,
    id_soal: 22,
    jawaban_ideal: "Saya tidak setuju dengan usulan ekstrem Ali. Bersikap ramah lingkungan bukan berarti tidak boleh menggunakan peralatan listrik sama sekali, melainkan menggunakannya dengan bijak sesuai kebutuhan. Aturan penggunaan kipas angin yang tepat adalah: Kipas angin boleh dinyalakan saat ada orang di dalam ruangan dan suhu ruangan memang terasa panas. Kipas angin harus dimatikan saat seluruh siswa dan guru meninggalkan kelas (seperti saat jam olahraga atau istirahat) atau jika jendela kelas sudah cukup terbuka dan udara luar terasa sejuk.",
    kata_kunci: [
      "tidak setuju usulan ekstrem",
      "menggunakan listrik secara bijak",
      "dinyalakan saat ada orang dan panas",
      "dimatikan saat meninggalkan ruangan",
      "memanfaatkan ventilasi jendela"
    ]
  },
  {
    id_jawaban: 23,
    id_soal: 23,
    jawaban_ideal: "Ide sederhana: Menerapkan prinsip 'Ambil Porsi Secukupnya Lebih Dulu'. Cara melakukannya: Umar mengambil nasi dan lauk dalam porsi yang sedang atau secukupnya yang pasti sanggup dihabiskan; jika setelah habis ternyata masih merasa lapar, baru menambah porsi sedikit lagi. Mengapa membantu: Cara ini mencegah makanan terbuang ke tempat sampah karena tidak ada makanan sisa di piring, sehingga menghargai jerih payah petani dan mengurangi pembusukan sampah makanan yang menghasilkan gas metana.",
    kata_kunci: [
      "ambil porsi secukupnya",
      "bisa menambah jika kurang",
      "menghabiskan makanan di piring",
      "mencegah sampah sisa makanan",
      "menghargai jerih payah petani",
      "mengurangi gas metana"
    ]
  },
  {
    id_jawaban: 24,
    id_soal: 24,
    jawaban_ideal: "Pendapat siswa tersebut tidak tepat. Alur perjalanan sampahnya adalah: Sampah plastik yang dibuang sembarangan di halaman sekolah akan tersapu oleh aliran air hujan menuju selokan/parit sekolah -> air selokan mengalir dan bermuara ke sungai terdekat -> arus sungai terus membawa sampah plastik hingga akhirnya bermuara ke lautan lepas, meskipun lokasi sekolah jauh dari pantai. Tindakan nyata yang dapat dilakukan adalah mengadakan piket kebersihan rutin untuk memastikan tidak ada sampah berserakan di halaman sekolah, serta menyediakan tempat sampah bertutup agar sampah tidak tertiup angin atau hanyut saat hujan.",
    kata_kunci: [
      "pendapat tidak tepat",
      "alur selokan ke sungai ke laut",
      "aliran air hujan menghanyutkan sampah",
      "muara pantai laut lepas",
      "piket kebersihan memungut sampah",
      "tempat sampah bertutup"
    ]
  },
  {
    id_jawaban: 25,
    id_soal: 25,
    jawaban_ideal: "Ide sederhana: Gerakan 'Bawa Tumbler Sendiri ke Kantin' (Bring Your Own Cup). Cara menjalankannya: Siswa membawa botol minum/tumbler sendiri saat membeli es teh di kantin, dan pihak kantin memberikan insentif seperti diskon harga Rp500 atau porsi es teh yang sedikit lebih banyak bagi siswa yang membawa wadah sendiri. Bagaimana mengurangi sampah: Ide ini langsung menghentikan penggunaan gelas plastik sekali pakai dan sedotan plastik dari sumbernya, sehingga tempat sampah di kantin tidak lagi dipenuhi limbah plastik setiap hari.",
    kata_kunci: [
      "bawa tumbler atau wadah sendiri",
      "bring your own cup",
      "diskon insentif dari kantin",
      "tanpa gelas dan sedotan plastik",
      "mengurangi sampah dari sumbernya"
    ]
  }
];

// ══════════════════════════════════════════════════════════
// 3. KONFIGURASI TANTANGAN KOGNITIF (ANSWER CHALLENGE)
// ══════════════════════════════════════════════════════════

const ANSWER_CHALLENGE = [
  { label: 'Amati & Hubungkan', cls: '', icon: '🔎' },
  { label: 'Analisis Hubungan', cls: '', icon: '🔗' },
  { label: 'Nilai Gagasan', cls: '', icon: '⚖️' },
  { label: 'Jelaskan Alasan', cls: '', icon: '💭' },
  { label: 'Ide Kreatif', cls: 'creative', icon: '💡' }
];

// ══════════════════════════════════════════════════════════
// 4. HELPER DINAMIS UNTUK MENGAMBIL RUJUKAN NLP
// ══════════════════════════════════════════════════════════

/**
 * Mengambil data kunci rujukan ideal dan kata kunci berdasarkan id_soal
 * @param {number|string} idSoal - ID soal (1 s.d. 25 atau lebih)
 * @returns {object|null} Objek kunci jawaban ideal atau null jika tidak ditemukan
 */
function getKunciJawaban(idSoal) {
  const numId = Number(idSoal);
  return KUNCI_JAWABAN_ESSAY.find(k => k.id_soal === numId) || null;
}

/**
 * Mengembalikan soal untuk materi m lengkap dengan indeks aslinya
 * @param {number|string} m - ID materi (1, 2, 3, 4, 5)
 * @returns {Array<object>} Daftar soal untuk materi m
 */
function getQuestionsByMaterial(m) {
  const questions = (typeof window !== 'undefined' && window.ANSWER_ESSAY25) || (typeof ANSWER_ESSAY25 !== 'undefined' ? ANSWER_ESSAY25 : []);
  return questions.map((q, i) => ({ ...q, idx: i })).filter(q => q.mat === Number(m));
}

// ══════════════════════════════════════════════════════════
// 5. GLOBAL WINDOW & MODULE EXPOSURE
// ══════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  window.ANSWER_ESSAY25 = ANSWER_ESSAY25;
  window.KUNCI_JAWABAN_ESSAY = KUNCI_JAWABAN_ESSAY;
  window.ANSWER_CHALLENGE = ANSWER_CHALLENGE;
  window.getKunciJawaban = getKunciJawaban;
  window.getQuestionsByMaterial = getQuestionsByMaterial;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ANSWER_ESSAY25,
    KUNCI_JAWABAN_ESSAY,
    ANSWER_CHALLENGE,
    getKunciJawaban,
    getQuestionsByMaterial
  };
}

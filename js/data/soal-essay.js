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

// ══════════════════════════════════════════════════════════
// 5. GLOBAL WINDOW & MODULE EXPOSURE
// ══════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  window.ANSWER_ESSAY25 = ANSWER_ESSAY25;
  window.KUNCI_JAWABAN_ESSAY = KUNCI_JAWABAN_ESSAY;
  window.ANSWER_CHALLENGE = ANSWER_CHALLENGE;
  window.getKunciJawaban = getKunciJawaban;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ANSWER_ESSAY25,
    KUNCI_JAWABAN_ESSAY,
    ANSWER_CHALLENGE,
    getKunciJawaban
  };
}

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
  {
    "id_soal": 1,
    "mat": 1,
    "topic": "Cuaca, Iklim, dan Musim",
    "stim": "Pagi itu, Umar berangkat ke sekolah dengan berjalan kaki bersama Ali dan Aisyah. Matahari bersinar cerah dan udara terasa hangat. Namun, ketika waktu istirahat tiba, langit mulai mendung. Angin bertiup lebih kencang dan tidak lama kemudian hujan turun. Sambil menunggu hujan reda, mereka memperhatikan halaman sekolah yang mulai basah. Ali bercerita bahwa beberapa hari terakhir cuaca di desa mereka sering berubah. Terkadang pagi hari cerah, tetapi siang harinya turun hujan. Aisyah juga bercerita bahwa keluarganya biasanya mulai mempersiapkan tanaman di kebun ketika musim hujan tiba.",
    "q": "Berdasarkan cerita tersebut, sebutkan apa yang dimaksud dengan cuaca, iklim, dan musim!",
    "jawaban_ideal": "Cuaca adalah kondisi udara pada tempat dan waktu tertentu, misalnya pagi cerah lalu siang hujan. Iklim adalah rata-rata dan pola keadaan cuaca yang diamati dalam jangka panjang, bukan dalam satu atau dua hari. Musim adalah bagian tahun dengan ciri cuaca yang relatif khas; di banyak wilayah Indonesia dikenal musim hujan dan kemarau. Ketiganya berkaitan, tetapi memiliki cakupan waktu berbeda.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 2,
    "mat": 1,
    "topic": "Cuaca, Iklim, dan Musim",
    "stim": "Pukul 07.00, Aisyah berangkat ke sekolah saat langit cerah dan udara hangat. Pukul 14.00, langit menjadi gelap, udara terasa lebih sejuk, dan hujan turun. Kedua keadaan itu terjadi pada hari yang sama.",
    "q": "Sebutkan dua perubahan antara pagi dan siang itu. Jelaskan mengapa kejadian tersebut menunjukkan perubahan cuaca, bukan perubahan iklim.",
    "jawaban_ideal": "Pagi hari langit cerah dan udara terasa hangat, sedangkan siang hari langit mendung atau turun hujan dan udara berubah lebih sejuk. Perubahan itu terjadi dalam hitungan jam pada hari yang sama, sehingga merupakan perubahan cuaca. Perubahan iklim tidak dapat ditentukan dari satu hari, melainkan dari pola suhu, hujan, dan unsur cuaca lain dalam waktu panjang.",
    "visual": "weather",
    "media": ""
  },
  {
    "id_soal": 3,
    "mat": 1,
    "topic": "Cuaca, Iklim, dan Musim",
    "stim": "Selama tiga hari, hujan deras turun di Gampong Berenuen. Umar dan Ali memperhatikan air sungai mulai meningkat. Saat berada di sekolah, Ali mengatakan bahwa iklim di desa mereka telah berubah karena hujan turun terus-menerus selama tiga hari. Umar merasa ragu dengan pernyataan Ali. Ia teringat penjelasan gurunya bahwa cuaca dapat berubah dalam waktu singkat, sedangkan iklim menggambarkan keadaan cuaca dalam jangka waktu yang panjang.",
    "q": "Apakah hujan yang turun selama tiga hari sudah cukup untuk menyatakan bahwa iklim di Gampong Berenuen telah berubah? Jelaskan alasanmu",
    "jawaban_ideal": "Belum cukup. Hujan deras selama tiga hari merupakan kejadian cuaca, meskipun dapat menyebabkan sungai meluap dan mengganggu kegiatan warga. Untuk menyatakan iklim suatu daerah berubah, diperlukan catatan suhu dan curah hujan selama bertahun-tahun agar dapat dilihat kecenderungan jangka panjang. Jadi, kejadian hujan beberapa hari tidak boleh langsung disamakan dengan perubahan iklim.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 4,
    "mat": 1,
    "topic": "Cuaca, Iklim, dan Musim",
    "stim": "Musim kemarau telah berlangsung cukup lama. Air sumur di rumah Aisyah mulai berkurang. Ayah Aisyah mengingatkan seluruh anggota keluarga agar menggunakan air dengan hemat karena persediaan air harus mencukupi kebutuhan sehari-hari. Suatu pagi, Aisyah melihat adiknya membiarkan keran air terbuka ketika sedang menyikat gigi. Di halaman rumah, beberapa tanaman mulai layu karena tanah menjadi kering. Aisyah ingin membantu keluarganya menggunakan air secara bijaksana agar kebutuhan keluarga dan tanaman tetap terpenuhi.",
    "q": "Jika kamu menjadi Aisyah, tindakan apa saja yang akan kamu lakukan untuk menghemat air selama musim kemarau? Jelaskan tiga tindakan dan manfaatnya bagi lingkungan!",
    "jawaban_ideal": "Aisyah dapat menutup keran ketika tidak dipakai, memakai air seperlunya ketika mandi atau mencuci, dan menggunakan kembali air yang masih aman untuk menyiram tanaman. Ia juga dapat menyiram pada pagi atau sore hari agar air tidak cepat menguap. Kebiasaan itu membuat persediaan air lebih awet, mengurangi pemborosan, dan membantu tanaman tetap tumbuh selama kemarau.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 5,
    "mat": 1,
    "topic": "Cuaca, Iklim, dan Musim",
    "stim": "Di sebuah gampong, ada dua halaman rumah yang terkena hujan sama derasnya. Halaman pertama ditumbuhi pohon, tanahnya tidak ditutup beton, dan paritnya bersih sehingga air hujan cepat surut. Halaman kedua ditutup beton dan paritnya tersumbat sampah sehingga air hujan menggenang lebih lama.",
    "q": "Mengapa air hujan lebih lama menggenang di halaman kedua? Jelaskan dengan membandingkan tempat air meresap dan jalan air mengalir di kedua halaman.",
    "jawaban_ideal": "Pada halaman pertama, tanah yang terbuka dan ditumbuhi tanaman dapat menyerap sebagian air hujan. Pada halaman kedua, permukaan semen mengurangi tempat air masuk ke tanah, sementara saluran yang tersumbat menghambat aliran air keluar. Karena air sulit meresap sekaligus sulit mengalir, genangan di halaman kedua bertahan lebih lama. Penyebabnya bukan semata-mata karena hujan lebih deras.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 6,
    "mat": 1,
    "topic": "Cuaca, Iklim, dan Musim",
    "stim": "Ali mencatat cuaca di daerahnya selama tujuh hari. Selama itu, cuaca terasa panas. Ali lalu berkata, “Iklim di daerah kita sudah berubah.” Aisyah menyarankan agar mereka juga memeriksa catatan suhu udara dan hujan selama bertahun-tahun.",
    "q": "Mengapa catatan cuaca selama tujuh hari belum cukup untuk mendukung kesimpulan Ali? Jelaskan mengapa mereka perlu melihat catatan suhu udara dan hujan selama bertahun-tahun.",
    "jawaban_ideal": "Catatan cuaca panas selama tujuh hari hanya menggambarkan keadaan cuaca dalam satu minggu. Iklim ditentukan dari pola dan variasi cuaca dalam jangka panjang, sehingga kesimpulan Ali tentang perubahan iklim belum didukung bukti. Siswa perlu membandingkan catatan suhu dan hujan dari banyak tahun untuk melihat apakah benar terjadi perubahan yang menetap, bukan perubahan sesaat.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 7,
    "mat": 1,
    "topic": "Cuaca, Iklim, dan Musim",
    "stim": "Umar tinggal di sebuah desa yang sebagian besar penduduknya bekerja sebagai petani. Biasanya, petani mulai menanam padi ketika hujan sudah cukup untuk mengairi sawah. Namun, selama beberapa tahun pengamatan, jumlah curah hujan di desa tersebut semakin berkurang. Suatu hari, guru menunjukkan grafik tentang kondisi hujan dan pertanian. Umar melihat bahwa semakin sedikit hujan turun, semakin banyak sawah yang mengalami kekurangan air. Beberapa tanaman padi menguning dan hasil panen petani berkurang.",
    "q": "Berdasarkan cerita dan infografis, mengapa berkurangnya curah hujan dapat menyebabkan tanaman padi menguning dan hasil panen menurun? Jelaskan hubungan antara curah hujan, ketersediaan air, pertumbuhan padi, dan kehidupan petani!",
    "jawaban_ideal": "Infografis menunjukkan curah hujan yang cenderung berkurang. Jika hujan berkurang pada masa tanaman membutuhkan air, persediaan air di sawah menurun sehingga padi dapat kekurangan air, menguning, dan tumbuh kurang baik. Akibatnya, gabah yang dipanen menjadi lebih sedikit dan penghasilan petani bisa turun. Perubahan produksi juga dapat mengurangi persediaan pangan masyarakat. Faktor pertanian lain tetap perlu dipertimbangkan.",
    "visual": "",
    "media": "./assets/soal_07.png"
  },
  {
    "id_soal": 8,
    "mat": 1,
    "topic": "Cuaca, Iklim, dan Musim",
    "stim": "Selama beberapa bulan, hujan lebih sering turun di gampong Umar. Hari ini matahari bersinar cerah. Umar berkata, “Musim hujan sudah berakhir karena hari ini tidak hujan.”",
    "q": "Bagaimana pendapatmu tentang kesimpulan Umar? Jelaskan dengan membandingkan kejadian hari ini dan keadaan selama beberapa bulan.",
    "jawaban_ideal": "Kesimpulan Umar bahwa musim hujan telah berakhir hanya karena hari ini cerah tidak tepat. Hari cerah adalah keadaan cuaca satu hari, sedangkan musim ditentukan oleh pola cuaca yang berlangsung lebih lama. Jika beberapa bulan sebelumnya sering turun hujan, satu hari tanpa hujan belum menunjukkan pergantian musim. Perlu mengamati kecenderungan curah hujan dan kondisi musim dari waktu ke waktu.",
    "visual": "",
    "media": "./assets/soal_08.png"
  },
  {
    "id_soal": 9,
    "mat": 1,
    "topic": "Cuaca, Iklim, dan Musim",
    "stim": "Hujan deras turun selama beberapa hari di Gampong Berenuen. Air sungai meluap hingga menggenangi rumah warga dan halaman sekolah. Setelah banjir surut, Umar, Ali, dan Aisyah berdiskusi tentang cara mengurangi risiko banjir pada musim hujan berikutnya. Ali mengusulkan agar sebagian pohon di dekat sungai ditebang sehingga lahan dapat digunakan untuk membuat saluran air. Umar mengusulkan agar warga menjaga pohon yang masih ada dan menanam pohon baru di daerah hulu. Sementara itu, Aisyah mengusulkan pembuatan saluran air yang lebih baik serta kegiatan membersihkan sampah secara rutin. Guru kemudian menunjukkan infografis mengenai ketiga usulan tersebut agar siswa dapat mempertimbangkan manfaat dan dampaknya bagi lingkungan.",
    "q": "Menurutmu, usulan siapa yang paling tepat untuk mengurangi risiko banjir tanpa merusak lingkungan? Bandingkan manfaat dan dampak ketiga usulan tersebut, kemudian jelaskan alasan pilihanmu!",
    "jawaban_ideal": "Usulan penebangan pohon untuk membuat saluran perlu dinilai hati-hati karena hilangnya pepohonan dapat mengurangi daya serap tanah dan meningkatkan erosi. Usulan Umar, menjaga serta menanam pohon di daerah hulu, bermanfaat bagi resapan dan kestabilan tanah. Usulan Aisyah, memperbaiki saluran dan membersihkan sampah, juga membantu air mengalir. Solusi yang paling masuk akal adalah menggabungkan perlindungan pohon dengan perbaikan saluran, sambil memperhatikan keselamatan warga.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 10,
    "mat": 1,
    "topic": "Cuaca, Iklim, dan Musim",
    "stim": "Saat musim hujan, tanaman di sekolah tumbuh subur karena mendapat cukup air. Ketika memasuki musim kemarau, hujan lebih jarang turun dan tanah mulai kering.",
    "q": "Buatlah rencana agar tanaman di sekolah tetap tumbuh subur selama musim kemarau. Tuliskan dua kegiatan yang dapat kamu lakukan dan jelaskan manfaat setiap kegiatan.",
    "jawaban_ideal": "Rencana dapat mencakup dua kegiatan yang saling melengkapi. Pertama, menutup permukaan tanah di sekitar tanaman dengan daun kering atau mulsa bersih untuk mengurangi penguapan. Kedua, menyiram tanaman dengan air yang dikumpulkan secara aman dan secukupnya, sebaiknya pagi atau sore hari. Siswa dapat membagi jadwal merawat tanaman dan memeriksa kelembapan tanah. Kedua langkah membantu tanaman tumbuh tanpa memboroskan air.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 11,
    "mat": 2,
    "topic": "Efek Rumah Kaca",
    "stim": "Gas rumah kaca membantu menahan sebagian panas agar Bumi tetap hangat. Namun, kegiatan manusia, seperti pembakaran bahan bakar pada kendaraan, dapat menambah jumlah gas rumah kaca di udara.",
    "q": "Apa yang dapat terjadi pada suhu Bumi jika gas rumah kaca terus bertambah? Jelaskan alasanmu dengan menghubungkan jumlah gas tersebut dan panas yang tertahan.",
    "jawaban_ideal": "Jika jumlah gas rumah kaca di atmosfer terus bertambah, lebih banyak radiasi inframerah yang dilepas permukaan Bumi diserap dan dipancarkan kembali oleh gas-gas itu. Efek rumah kaca menjadi lebih kuat, sehingga keseimbangan energi Bumi berubah dan suhu rata-rata global cenderung meningkat. Perlu dibedakan efek rumah kaca alami, yang penting bagi kehidupan, dengan penambahannya akibat emisi manusia.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 12,
    "mat": 2,
    "topic": "Efek Rumah Kaca",
    "stim": "Saat merawat tanaman di halaman sekolah, Umar berkata, “Tanaman membutuhkan karbon dioksida atau CO₂ untuk membuat makanan.” Ali bertanya, “Kalau CO₂ dibutuhkan tanaman, mengapa bertambahnya CO₂ di udara bisa membuat Bumi semakin panas?”",
    "q": "Apa penjelasan yang dapat kamu berikan kepada Ali? Jelaskan manfaat CO₂ bagi tanaman dan pengaruh bertambahnya CO₂ terhadap suhu Bumi.",
    "jawaban_ideal": "CO₂ dibutuhkan tumbuhan sebagai bahan dalam proses fotosintesis untuk menghasilkan makanan. Namun, CO₂ juga merupakan gas rumah kaca yang menyerap dan memancarkan radiasi panas. Jika konsentrasinya meningkat akibat kegiatan manusia, efek rumah kaca bertambah kuat dan suhu rata-rata Bumi dapat naik. Jadi, manfaat CO₂ untuk tumbuhan tidak berarti peningkatan CO₂ tanpa batas baik bagi iklim.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 13,
    "mat": 2,
    "topic": "Efek Rumah Kaca",
    "stim": "Pagi itu, Umar dan Aisyah berjalan menuju sekolah melewati persawahan di Gampong Berenuen. Udara terasa sejuk, angin bertiup perlahan, dan beberapa burung terlihat terbang di atas pepohonan. Di kejauhan, awan putih bergerak melintasi langit. Sesampainya di sekolah, Umar melihat dua gambar yang dipajang di dinding kelas. Gambar pertama menunjukkan Bumi yang memiliki lautan, pepohonan, dan berbagai makhluk hidup. Sementara itu, gambar kedua menunjukkan permukaan Bulan yang dipenuhi batuan dan kawah. Umar memperhatikan bahwa meskipun Bumi dan Bulan sama-sama mendapatkan cahaya Matahari, keadaan keduanya sangat berbeda. Bumi memiliki lapisan udara yang disebut atmosfer, sedangkan Bulan hampir tidak memiliki atmosfer. Perbedaan tersebut membuat Umar penasaran mengapa kehidupan dapat berkembang di Bumi, tetapi tidak ditemukan kehidupan di Bulan.",
    "q": "Berdasarkan gambar dan cerita tersebut, mengapa atmosfer sangat penting bagi kehidupan di Bumi? Jelaskan apa yang mungkin terjadi pada manusia, hewan, dan tumbuhan jika Bumi tidak memiliki atmosfer!",
    "jawaban_ideal": "Atmosfer adalah lapisan gas yang menyelimuti Bumi. Atmosfer menyediakan oksigen untuk pernapasan, mengandung gas penting lain, membantu mengatur suhu, dan memberi perlindungan dari sebagian radiasi berbahaya. Tanpa atmosfer, permukaan Bumi mengalami kondisi suhu dan radiasi yang jauh lebih ekstrem serta tidak tersedia udara untuk bernapas. Karena itu, manusia, hewan, dan tumbuhan seperti yang kita kenal akan sulit bertahan hidup.",
    "visual": "",
    "media": "./assets/soal_13.png"
  },
  {
    "id_soal": 14,
    "mat": 2,
    "topic": "Efek Rumah Kaca",
    "stim": "Suatu malam, Umar duduk bersama ayahnya di halaman rumah. Udara terasa lebih dingin dibandingkan siang hari. Umar teringat bahwa pada siang hari sinar Matahari membuat permukaan tanah terasa panas, tetapi setelah Matahari terbenam, suhu udara perlahan menurun. Keesokan harinya, saat pelajaran IPAS, guru menunjukkan gambar bagaimana sinar Matahari mencapai permukaan Bumi. Guru menjelaskan bahwa Bumi melepaskan sebagian energi panas ke arah angkasa. Namun, gas-gas tertentu di atmosfer menyerap dan memancarkan kembali sebagian energi panas tersebut sehingga Bumi tetap memiliki suhu yang sesuai bagi kehidupan. Peristiwa ini disebut efek rumah kaca.",
    "q": "Mengapa efek rumah kaca diperlukan bagi kehidupan di Bumi? Jelaskan apa yang dapat terjadi pada suhu Bumi jika tidak ada efek rumah kaca alami!",
    "jawaban_ideal": "Efek rumah kaca alami terjadi saat gas-gas di atmosfer menyerap dan memancarkan kembali sebagian radiasi panas dari permukaan Bumi. Proses ini membantu menjaga suhu Bumi cukup hangat untuk mendukung air cair dan kehidupan. Jika tidak ada efek rumah kaca alami, Bumi akan jauh lebih dingin. Yang menjadi masalah adalah meningkatnya efek rumah kaca akibat tambahan gas dari aktivitas manusia, bukan keberadaan efek alaminya.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 15,
    "mat": 2,
    "topic": "Efek Rumah Kaca",
    "stim": "Umar membaca bahwa suhu rata-rata Bumi semakin meningkat dari tahun ke tahun. Kenaikan suhu ini dapat memengaruhi banyaknya hujan dan waktu datangnya musim hujan atau musim kemarau.",
    "q": "Bagaimana pemanasan global dapat memengaruhi hujan dan musim? Jelaskan mengapa perubahan iklim juga berkaitan dengan perubahan hujan dan musim.",
    "jawaban_ideal": "Pemanasan global dapat meningkatkan penguapan dan mengubah banyaknya uap air serta pergerakan udara di atmosfer. Hal tersebut dapat memengaruhi waktu, intensitas, dan sebaran hujan, sehingga sebagian wilayah mengalami hujan lebih lebat, sementara wilayah lain mengalami kekeringan. Perubahan pola hujan juga dapat mengubah waktu mulai atau lama musim. Dampaknya tidak selalu sama di setiap daerah karena kondisi geografis berbeda.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 16,
    "mat": 2,
    "topic": "Efek Rumah Kaca",
    "stim": "Suatu pagi, aini membaca berita tentang meningkatnya suhu Bumi. Ia mengetahui bahwa karbon dioksida (CO₂) merupakan salah satu gas rumah kaca yang jumlahnya terus meningkat di atmosfer. Gas tersebut antara lain dihasilkan dari pembakaran bahan bakar pada kendaraan bermotor, pabrik, dan pembangkit listrik. Ketika mengikuti pelajaran IPAS, guru menunjukkan infografis yang berisi data jumlah CO₂ di atmosfer Bumi selama lima tahun. aini mengamati angka-angka tersebut dan melihat bahwa jumlah CO₂ tidak sama setiap tahunnya. Aini kemudian mengajak udin dan laila membandingkan data dari tahun ke tahun. Mereka ingin mengetahui seberapa besar peningkatan CO₂, bagaimana kecenderungan perubahannya, dan mengapa peningkatan tersebut perlu diperhatikan.",
    "q": "Berdasarkan infografis tersebut, bagaimana perubahan jumlah CO₂ di atmosfer dari tahun 2020 sampai 2024? Hitunglah peningkatan CO₂ dari tahun 2020 ke 2024, kemudian jelaskan hubungan peningkatan CO₂ dengan pemanasan global. Susunlah tiga langkah yang dapat dilakukan untuk membantu mengurangi emisi CO₂ dalam kehidupan sehari-hari!",
    "jawaban_ideal": "Infografis memperlihatkan kenaikan CO₂ dari sekitar 412 ppm pada 2020 menjadi 423 ppm pada 2024, atau meningkat 11 ppm (423 − 412). CO₂ tambahan memperkuat efek rumah kaca dan ikut meningkatkan suhu rata-rata Bumi. Tindakan yang dapat dilakukan antara lain menghemat listrik, memilih berjalan kaki atau bersepeda untuk jarak dekat jika aman, dan menghindari pembakaran sampah sambil menjaga pohon yang ada.",
    "visual": "",
    "media": "./assets/soal_16.png"
  },
  {
    "id_soal": 17,
    "mat": 2,
    "topic": "Efek Rumah Kaca",
    "stim": "Perhatikan info Grafis berikut:",
    "q": "Berdasarkan infografis tersebut, bagaimana penggunaan sepeda motor dalam jumlah besar dapat berkontribusi terhadap perubahan iklim? Jelaskan hubungan antara pembakaran bensin, peningkatan gas CO₂ di atmosfer, dan pemanasan global! Kemudian, tentukan dua tindakan yang dapat dilakukan masyarakat untuk mengurangi emisi dari penggunaan sepeda motor!",
    "jawaban_ideal": "Gambar menunjukkan ilustrasi sekitar 100.000 sepeda motor per hari. Sepeda motor berbahan bakar bensin mengeluarkan CO₂ saat bensin dibakar. Jika penggunaan kendaraan meningkat, emisi total berpotensi meningkat, sehingga dapat memperkuat efek rumah kaca. Masyarakat dapat mengurangi perjalanan yang tidak perlu, berjalan kaki atau bersepeda pada rute aman, atau berbagi kendaraan. Angka jumlah motor tidak cukup untuk menghitung emisi tepat tanpa data bahan bakar atau jarak tempuh.",
    "visual": "",
    "media": "./assets/soal_17.png"
  },
  {
    "id_soal": 18,
    "mat": 2,
    "topic": "Efek Rumah Kaca",
    "stim": "Ali berkata, “Agar Bumi tidak semakin panas, semua gas rumah kaca harus dihilangkan.” Namun, Aisyah mengingatkan bahwa gas rumah kaca juga membantu menjaga Bumi tetap hangat.",
    "q": "Menurutmu, apakah usulan Ali tepat? Jelaskan apa yang dapat terjadi pada suhu Bumi jika semua gas rumah kaca dihilangkan.",
    "jawaban_ideal": "Usulan menghilangkan semua gas rumah kaca tidak tepat karena efek rumah kaca alami menjaga Bumi cukup hangat untuk kehidupan. Tanpa gas rumah kaca, Bumi akan jauh lebih dingin, bukan otomatis menjadi lebih nyaman. Yang perlu dilakukan adalah mengurangi emisi tambahan dari aktivitas manusia, misalnya melalui penggunaan energi lebih efisien, bukan menghilangkan gas rumah kaca alami sepenuhnya.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 19,
    "mat": 2,
    "topic": "Efek Rumah Kaca",
    "stim": "Sekolah Aisyah akan mengadakan kegiatan peduli lingkungan. Kegiatan tersebut bertujuan mengurangi kebiasaan yang dapat meningkatkan emisi gas rumah kaca. Setiap kelompok diminta mengusulkan kegiatan yang dapat diterapkan secara berkelanjutan di sekolah. Kelompok Ali mengusulkan penanaman pohon di halaman sekolah agar lingkungan menjadi lebih teduh. Kelompok Umar mengusulkan penghematan listrik dengan mematikan lampu dan kipas angin ketika tidak digunakan. Sementara itu, kelompok Aisyah mengusulkan agar siswa yang rumahnya dekat dengan sekolah berjalan kaki atau bersepeda jika kondisi perjalanan aman. Ketiga kelompok yakin bahwa usulan mereka bermanfaat. Namun, sekolah ingin memilih kegiatan yang dapat dilakukan secara rutin dan memberikan dampak positif bagi lingkungan.",
    "q": "Jika kamu diminta memilih dua dari tiga kegiatan tersebut untuk diterapkan di sekolah, kegiatan mana yang akan kamu pilih? Bandingkan manfaat ketiganya, kemudian jelaskan alasan pilihanmu berdasarkan pengaruhnya terhadap gas rumah kaca dan pemanasan global!",
    "jawaban_ideal": "Ketiga pilihan memberi manfaat berbeda: pohon menyerap CO₂ ketika tumbuh dan memberi keteduhan; hemat listrik dapat mengurangi kebutuhan energi dari pembangkit berbahan bakar fosil; berjalan kaki atau bersepeda untuk jarak aman dapat mengurangi pembakaran bensin. Siswa boleh memilih dua yang paling layak bagi sekolahnya, misalnya hemat listrik dan menanam-merawat pohon, asalkan membandingkan ketiganya, mempertimbangkan biaya serta keselamatan, dan menjelaskan pengurangan emisinya.",
    "visual": "",
    "media": "./assets/soal_19.png"
  },
  {
    "id_soal": 20,
    "mat": 2,
    "topic": "Efek Rumah Kaca",
    "stim": "Saat istirahat, Umar dan adik kelasnya berteduh di bawah pohon. Adik kelasnya bertanya, “Kak, kata Bu Guru, Bumi semakin panas. Apakah karena Matahari semakin dekat?” Umar ingin membuat cerita bergambar untuk menjelaskan penyebab pemanasan global.",
    "q": "Bantu Umar merencanakan cerita bergambar secara berurut!",
    "jawaban_ideal": "Cerita bergambar dapat disusun dalam urutan: siswa mendengar anggapan bahwa Matahari mendekat, lalu menunjukkan bahwa hal itu bukan penjelasan pemanasan global saat ini; aktivitas manusia membakar bahan bakar fosil; CO₂ dan gas rumah kaca bertambah; lebih banyak radiasi panas terserap sehingga suhu rata-rata Bumi meningkat; siswa mengajak hemat energi dan mengurangi penggunaan kendaraan bila memungkinkan. Setiap panel memiliki hubungan sebab-akibat yang jelas dan pesan ilmiah yang mudah dipahami.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 21,
    "mat": 3,
    "topic": "Penyebab Perubahan Iklim",
    "stim": "Setiap pagi, Umar berjalan menuju sekolah bersama Ali dan Aisyah. Sepanjang perjalanan, mereka melewati jalan yang semakin ramai dilalui kendaraan bermotor. Di dekat persawahan, Umar juga melihat beberapa lahan yang dahulu ditumbuhi pepohonan kini telah berubah menjadi bangunan. Suatu hari, ketika mengikuti pelajaran IPAS, guru mengajak siswa membicarakan perubahan lingkungan di sekitar tempat tinggal mereka. Guru menjelaskan bahwa kegiatan manusia dapat memengaruhi keadaan atmosfer Bumi. Beberapa kegiatan menghasilkan gas rumah kaca yang dapat mempercepat pemanasan global dan perubahan iklim.",
    "q": "Berdasarkan pengetahuanmu, sebutkan tiga kegiatan manusia yang dapat menyebabkan perubahan iklim dan tuliskan gas rumah kaca yang dapat dihasilkan dari kegiatan tersebut!",
    "jawaban_ideal": "Tiga kegiatan manusia yang dapat menyebabkan perubahan iklim misalnya memakai kendaraan berbahan bakar bensin atau solar (menghasilkan CO₂), membakar batu bara pada pembangkit listrik atau kegiatan industri (menghasilkan CO₂), dan membakar hutan atau lahan (melepaskan CO₂). Contoh lain adalah kegiatan peternakan dan penguraian sampah organik tanpa oksigen yang dapat menghasilkan metana (CH₄). Jenis gas harus sesuai dengan aktivitas yang disebut.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 22,
    "mat": 3,
    "topic": "Penyebab Perubahan Iklim",
    "stim": "Pagi hari, Ayah mengantar Ali ke sekolah naik sepeda motor berbahan bakar bensin. Di kelas, Ali menyalakan lampu. Bu Guru menjelaskan bahwa listrik untuk menyalakan lampu berasal dari pembangkit listrik yang menggunakan batu bara. Ali bertanya mengapa lampu yang tidak mengeluarkan asap tetap dapat menambah CO₂ di udara.",
    "q": "Bantulah Bu Guru menjawab pertanyaan Ali. Jelaskan dari mana gas CO₂ dihasilkan. Mengapa lampu di kelas yang tidak mengeluarkan asap tetap menyebabkan bertambahnya CO₂ di udara? Jelaskan alurnya!",
    "jawaban_ideal": "Sepeda motor menghasilkan CO₂ langsung karena bensin dibakar di mesin. Lampu tidak menghasilkan asap ketika digunakan, tetapi listrik yang menyalakannya bisa berasal dari pembangkit yang membakar batu bara sehingga menghasilkan CO₂. Dengan demikian, kebutuhan listrik dapat menimbulkan emisi tidak langsung: lampu menyala → listrik dipakai → pembangkit menghasilkan listrik → bahan bakar dibakar dan menghasilkan CO₂.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 23,
    "mat": 3,
    "topic": "Penyebab Perubahan Iklim",
    "stim": "Di sebuah lahan, banyak pohon ditebang. Sisa ranting dan kayunya kemudian dibakar. Umar berpendapat bahwa peristiwa tersebut hanya menghilangkan tempat berteduh.",
    "q": "Sebutkan dan jelaskan dua perubahan yang berkaitan dengan gas karbon dioksida (CO₂) akibat: (1) penebangan pohon dan (2) pembakaran kayu serta ranting.",
    "jawaban_ideal": "Pohon menyerap CO₂ dari udara selama fotosintesis. Jika banyak pohon ditebang, kemampuan kawasan itu menyerap CO₂ berkurang. Ketika ranting atau kayu dibakar, karbon yang tersimpan dapat dilepaskan kembali terutama sebagai CO₂. Kedua kegiatan tersebut dapat meningkatkan jumlah CO₂ di atmosfer dan memperkuat efek rumah kaca. Dampaknya bergantung pada skala dan pengelolaan lahan.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 24,
    "mat": 3,
    "topic": "Penyebab Perubahan Iklim",
    "stim": "Di dekat Gampong Berenuen terdapat kawasan hutan yang dahulu dipenuhi pepohonan. Ketika hujan turun, air mengalir melalui sungai yang melewati desa. Sebagian penduduk memanfaatkan hasil hutan dan lahan di sekitarnya untuk memenuhi kebutuhan sehari-hari. Beberapa tahun kemudian, sebagian kawasan hutan dibuka untuk pembangunan dan perkebunan. Banyak pohon ditebang sehingga keadaan kawasan tersebut berubah. Ketika mengikuti pelajaran IPAS, Aisyah mengetahui bahwa pepohonan menyerap karbon dioksida (CO₂) dari udara selama proses fotosintesis. Ia kemudian membandingkan keadaan hutan sebelum dan setelah banyak pohon ditebang.",
    "q": "Mengapa penebangan pohon dalam jumlah besar dapat memperburuk perubahan iklim? Jelaskan hubungan antara berkurangnya pepohonan, karbon dioksida di atmosfer, dan peningkatan suhu Bumi!",
    "jawaban_ideal": "Pembukaan hutan mengurangi jumlah pohon yang menyerap CO₂. Jika pohon atau sisa tumbuhan dibakar atau membusuk, sebagian karbon tersimpan juga dapat dilepaskan ke udara. Bertambahnya CO₂ memperkuat efek rumah kaca sehingga suhu rata-rata Bumi dapat meningkat. Karena itu, menjaga hutan dan menanam kembali pohon yang sesuai merupakan bagian dari upaya membatasi perubahan iklim.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 25,
    "mat": 3,
    "topic": "Penyebab Perubahan Iklim",
    "stim": "Pada hari Senin, Umar mendapat tugas piket bersama teman-temannya. Ketika memasuki kelas, ia melihat lampu masih menyala meskipun cahaya Matahari sudah cukup menerangi ruangan. Beberapa kipas angin juga tetap menyala saat kelas kosong. Ketika waktu pulang tiba, Umar melihat banyak orang tua menunggu anak-anaknya dengan sepeda motor yang mesinnya tetap hidup. Di halaman sekolah, beberapa siswa sedang membicarakan kegiatan peduli lingkungan yang akan dilaksanakan minggu depan. Umar ingin mengusulkan kegiatan yang tidak hanya dilakukan selama satu hari, tetapi dapat menjadi kebiasaan seluruh warga sekolah untuk membantu mengurangi emisi gas rumah kaca.",
    "q": "Jika kamu menjadi Umar, tentukan tiga kebiasaan yang dapat diterapkan di sekolah untuk membantu mengurangi penyebab perubahan iklim! Jelaskan bagaimana setiap kebiasaan tersebut dapat mengurangi emisi gas rumah kaca!",
    "jawaban_ideal": "Umar dapat mengusulkan tiga kebiasaan yang diterapkan terus-menerus: mematikan lampu dan kipas jika tidak diperlukan, meminta orang tua mematikan mesin kendaraan saat menunggu bila aman, serta berjalan kaki, bersepeda, atau berbagi kendaraan untuk perjalanan yang sesuai dan aman. Guru dan siswa dapat membuat jadwal pengingat. Kebiasaan tersebut mengurangi pemborosan energi dan kebutuhan bahan bakar fosil sehingga emisi berpotensi turun.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 26,
    "mat": 3,
    "topic": "Penyebab Perubahan Iklim",
    "stim": "Setelah jam istirahat, siswa membuang gelas plastik dan sisa makanan ke tempat sampah. Melihat tempat sampah penuh, Hasan berkata, “Halaman sekolah sudah bersih, berarti masalah sampah sudah selesai.”",
    "q": "Jawablah: a) Apakah pendapat Hasan sudah tepat? b) Apa bahaya dari tumpukan sisa makanan tersebut? c) Langkah apa yang diperlukan untuk mengurus sampah tersebut?",
    "jawaban_ideal": "Pendapat Hasan bahwa sampah sudah selesai ditangani hanya karena terkumpul di satu tempat belum tepat. Sisa makanan yang menumpuk bisa membusuk, menimbulkan bau, menarik hama, dan dalam kondisi tanpa oksigen dapat menghasilkan metana. Sampah sebaiknya dipilah; sisa makanan yang sesuai diolah menjadi kompos dengan cara benar dan sisa lain diserahkan untuk pengelolaan. Jadi, sampah perlu ditangani setelah dikumpulkan, bukan hanya dipindahkan.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 27,
    "mat": 3,
    "topic": "Penyebab Perubahan Iklim",
    "stim": "Suatu pagi, Ali membaca artikel tentang perubahan iklim di perpustakaan sekolah. Artikel tersebut menjelaskan bahwa penggunaan batu bara, minyak bumi, dan gas alam dalam berbagai kegiatan manusia dapat menghasilkan karbon dioksida (CO₂). Gas tersebut dapat bertahan lama di atmosfer dan berkontribusi terhadap pemanasan global. Ketika pelajaran IPAS dimulai, guru menunjukkan infografis tentang perubahan jumlah CO₂ di atmosfer Bumi. Data tersebut memperlihatkan perbedaan jumlah CO₂ sebelum kegiatan industri berkembang pesat dan pada masa sekarang.",
    "q": "Berdasarkan infografis tersebut, berapa peningkatan jumlah CO₂ di atmosfer dari tahun 1750 hingga 2024? Tunjukkan langkah perhitunganmu! Selanjutnya, analisislah bagaimana kegiatan manusia dapat menyebabkan peningkatan CO₂ tersebut dan mengapa peningkatannya dapat mempercepat perubahan iklim!",
    "jawaban_ideal": "Infografis memperlihatkan CO₂ sekitar 278 ppm pada 1750 dan 424 ppm pada 2024. Selisihnya adalah 424 − 278 = 146 ppm. Penggunaan batu bara, minyak, dan gas serta perubahan hutan berkontribusi menambah CO₂ di atmosfer. Kenaikan gas rumah kaca memperkuat penyerapan radiasi panas dalam sistem Bumi dan memicu pemanasan global. Data ini adalah konsentrasi gas, bukan jumlah emisi sebuah desa.",
    "visual": "",
    "media": "./assets/soal_27.png"
  },
  {
    "id_soal": 28,
    "mat": 3,
    "topic": "Penyebab Perubahan Iklim",
    "stim": "Umar memiliki botol minum isi ulang yang masih bagus serta air minum yang cukup di rumah. Namun, ia ingin membeli minuman kemasan botol sekali pakai setiap hari agar praktis dan tidak perlu membawa botol dari rumah.",
    "q": "Kebiasaan apa yang sebaiknya dilakukan Umar? Berikan alasanmu dengan mempertimbangkan dampak pembuatan botol serta jumlah sampah yang timbul.",
    "jawaban_ideal": "Kebiasaan yang lebih bijak adalah memakai kembali botol minum yang masih layak dan bersih, bukan sering membeli botol plastik sekali pakai. Pembuatan, pengemasan, dan pengangkutan botol baru membutuhkan bahan baku dan energi, sementara botol sekali pakai menjadi sampah sesudah digunakan. Mengisi ulang botol membantu mengurangi kebutuhan botol baru dan sampah plastik. Botol harus tetap dibersihkan dengan aman.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 29,
    "mat": 3,
    "topic": "Penyebab Perubahan Iklim",
    "stim": "Sekolah Aisyah akan mengadakan program peduli lingkungan. Setiap kelompok diminta mengusulkan kegiatan yang dapat membantu mengurangi penyebab perubahan iklim. Kelompok Umar mengusulkan penanaman pohon di halaman sekolah. Kelompok Ali ingin mengadakan kegiatan hemat listrik setiap hari. Sementara itu, kelompok Aisyah mengusulkan agar siswa mengurangi penggunaan kendaraan bermotor untuk perjalanan jarak dekat jika kondisi perjalanan aman. Ketiga kelompok menyampaikan bahwa kegiatan mereka memiliki manfaat bagi lingkungan. Namun, sekolah hanya memiliki biaya dan waktu yang terbatas sehingga tidak semua kegiatan dapat dilaksanakan secara bersamaan.",
    "q": "Jika kamu menjadi anggota tim peduli lingkungan sekolah, dua kegiatan manakah yang akan kamu pilih untuk membantu mengurangi penyebab perubahan iklim? Bandingkan manfaat dan tantangan dari ketiga kegiatan tersebut, kemudian jelaskan mengapa dua kegiatan pilihanmu lebih sesuai untuk diterapkan secara berkelanjutan di sekolah!",
    "jawaban_ideal": "Siswa dapat membandingkan tiga kegiatan: menanam dan merawat pohon (memerlukan lahan dan perawatan), hemat listrik setiap hari (memerlukan kedisiplinan), serta mengurangi perjalanan bermotor untuk jarak dekat bila aman (bergantung pada jarak dan kondisi jalan). Dua pilihan dapat dipilih sesuai kebutuhan sekolah, misalnya hemat listrik dan berjalan kaki untuk siswa yang memungkinkan. Alasan sebaiknya memuat manfaat emisi, biaya, kemudahan pelaksanaan, dan keberlanjutan.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 30,
    "mat": 3,
    "topic": "Penyebab Perubahan Iklim",
    "stim": "Ani menemukan bahwa beberapa buku tulis semester lalu masih tersisa setengahnya. Buku tersebut masih memiliki cukup banyak lembar kosong, tetapi sampulnya sudah sedikit kusam. Ia bingung antara membeli buku baru atau tetap memanfaatkan sisa halaman tersebut.",
    "q": "Pilihan mana yang menurutmu paling bijak diambil oleh Ani? Mengapa? Berikan satu ide kreatif untuk memanfaatkan sisa halaman tersebut agar catatan pelajaran baru tetap rapi dan tidak bercampur.",
    "jawaban_ideal": "Ani sebaiknya memakai halaman buku lama yang masih kosong dan layak sebelum membeli buku baru. Buku dapat dipisahkan menurut pelajaran dengan label, pembatas, atau sampul yang rapi. Siswa juga dapat membuat buku catatan kecil dari halaman kosong yang dikumpulkan secara aman dan tertib. Langkah tersebut menghemat kertas dan biaya sekaligus mengurangi kebutuhan bahan baku, tanpa mengorbankan keteraturan catatan belajar.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 31,
    "mat": 4,
    "topic": "Dampak Perubahan Iklim",
    "stim": "Pagi itu, Umar menemani ayahnya pergi ke sawah. Sepanjang perjalanan, ia melihat beberapa petak sawah mulai mengering. Tanah terlihat retak dan sebagian tanaman padi mulai menguning. Ayah Umar bercerita bahwa beberapa tahun terakhir para petani semakin sulit menentukan waktu menanam padi. Terkadang hujan datang lebih lambat dari biasanya, tetapi pada waktu lain hujan turun sangat deras hingga menggenangi sawah. Kondisi tersebut membuat para petani harus lebih berhati-hati dalam mengatur kegiatan pertanian. Umar teringat pelajaran IPAS tentang perubahan iklim yang dapat memengaruhi lingkungan dan kehidupan manusia.",
    "q": "Berdasarkan pengetahuanmu, sebutkan tiga dampak perubahan iklim yang dapat terjadi pada lingkungan dan kehidupan manusia!",
    "jawaban_ideal": "Dampak perubahan iklim antara lain meningkatnya risiko suhu sangat panas, perubahan pola hujan yang dapat memperberat kekeringan atau banjir di beberapa wilayah, serta terganggunya pertanian sehingga hasil panen berkurang. Dampak lain yang dapat diterima adalah kenaikan permukaan laut dan gangguan ekosistem. Ketiga contoh harus berbeda serta berkaitan dengan lingkungan atau kehidupan manusia.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 32,
    "mat": 4,
    "topic": "Dampak Perubahan Iklim",
    "stim": "Saat suhu rata-rata Bumi naik, air laut menghangat. Sebagian es di daratan juga mencair. Kedua perubahan ini dapat menaikkan permukaan laut dan menambah risiko genangan di pesisir.",
    "q": "Jelaskan bagaimana air laut yang menghangat dan es daratan yang mencair sama-sama dapat menaikkan permukaan laut.",
    "jawaban_ideal": "Air laut yang menghangat memuai sehingga volumenya meningkat walaupun jumlah massanya relatif sama. Selain itu, ketika es yang berada di daratan mencair, airnya mengalir masuk ke laut dan menambah jumlah air laut. Kedua proses tersebut menaikkan tinggi permukaan laut dan dapat meningkatkan risiko genangan atau abrasi di pesisir. Pencairan es laut yang sudah mengapung tidak sama dampaknya dengan es di daratan.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 33,
    "mat": 4,
    "topic": "Dampak Perubahan Iklim",
    "stim": "Musim kemarau berlangsung lebih lama dari yang diperkirakan. Air sumur di rumah Ali mulai berkurang. Beberapa tanaman di halaman rumah tampak layu karena tanah semakin kering. Suatu pagi, Ali melihat adiknya membiarkan keran terbuka ketika mencuci tangan. Di halaman rumah, ibunya sedang mengumpulkan air bekas cucian beras untuk menyiram tanaman. Ayah Ali mengingatkan seluruh anggota keluarga agar menggunakan air seperlunya karena persediaan air harus mencukupi kebutuhan sehari-hari. Ali ingin membantu keluarganya menghadapi kekurangan air tanpa mengabaikan kebutuhan manusia, hewan, dan tumbuhan di sekitar rumah.",
    "q": "Jika kamu menjadi Ali, tindakan apa saja yang akan kamu lakukan untuk menghadapi kekurangan air akibat musim kemarau? Tuliskan tiga tindakan dan jelaskan bagaimana tindakan tersebut membantu menjaga ketersediaan air serta kelangsungan hidup makhluk hidup di sekitarmu!",
    "jawaban_ideal": "Ali dapat menutup keran saat tidak dipakai, menggunakan air secukupnya untuk mandi dan mencuci, serta memakai kembali air yang masih aman untuk menyiram tanaman. Air hujan dapat ditampung secara aman ketika tersedia. Keluarga sebaiknya mengutamakan air untuk minum, memasak, kebersihan, dan kebutuhan makhluk hidup. Cara-cara ini membantu persediaan air bertahan saat musim kemarau lebih panjang.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 34,
    "mat": 4,
    "topic": "Dampak Perubahan Iklim",
    "stim": "Hujan sudah lama tidak turun di gampong Umar. Air yang mengalir ke sawah semakin sedikit. Tanaman padi milik Ayah Umar mulai mengering. Keluarga Umar memperoleh penghasilan dari penjualan hasil panen.",
    "q": "Bagaimana kekurangan air dapat memengaruhi hasil panen dan penghasilan Ayah Umar? Jelaskan hubungan keduanya.",
    "jawaban_ideal": "Jika air sawah berkurang, tanaman padi sulit memperoleh air untuk pertumbuhan sehingga dapat menguning atau menghasilkan lebih sedikit gabah. Saat panen menurun, jumlah gabah yang dapat dimakan atau dijual keluarga juga berkurang. Karena pendapatan petani bergantung pada hasil penjualan panen, penghasilan Ayah Umar bisa turun. Hubungannya adalah kekurangan air → pertumbuhan padi terganggu → produksi turun → pendapatan berkurang.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 35,
    "mat": 4,
    "topic": "Dampak Perubahan Iklim",
    "stim": "Amatilah infografis berikut!",
    "q": "Berdasarkan infografis tersebut, bagaimana perubahan hasil panen padi selama empat musim tanam? Hitunglah selisih hasil panen pada musim pertama dan musim keempat! Kemudian, jelaskan bagaimana kekurangan air akibat perubahan pola hujan dapat memengaruhi hasil panen, penghasilan petani, dan kebutuhan pangan masyarakat!",
    "jawaban_ideal": "Grafik menunjukkan 40 karung pada musim pertama, 35 pada musim kedua, 28 pada musim ketiga, dan 22 pada musim keempat. Produksi terus menurun dengan selisih 40 − 22 = 18 karung. Berkurangnya atau tidak menentunya hujan dapat mengurangi air untuk padi sehingga pertumbuhan terganggu. Hasil panen dan pendapatan petani turun, dan jika terjadi luas, pasokan pangan warga dapat terganggu. Data hanya contoh simulasi.",
    "visual": "",
    "media": "./assets/soal_35.png"
  },
  {
    "id_soal": 36,
    "mat": 4,
    "topic": "Dampak Perubahan Iklim",
    "stim": "Sudah beberapa minggu hujan tidak turun di gampong Aisyah. Keluarga Aisyah masih memiliki cukup air untuk minum, memasak, dan mandi, sedangkan persediaan air keluarga Umar hampir habis. Bantuan air diantar bergiliran karena kendaraan hanya dapat membawa air untuk satu keluarga dalam sekali perjalanan.",
    "q": "Menurutmu, keluarga mana yang perlu menerima bantuan air terlebih dahulu? Jelaskan alasanmu berdasarkan persediaan air kedua keluarga.",
    "jawaban_ideal": "Bantuan air sebaiknya diprioritaskan kepada keluarga Umar jika persediaan airnya hampir habis, terutama untuk minum dan memasak. Keluarga Aisyah yang masih memiliki persediaan mencukupi tetap diperhatikan tetapi tidak lebih mendesak. Keputusan ini menunjukkan pembagian bantuan berdasarkan tingkat kebutuhan, bukan kedekatan atau pilihan pribadi. Penilaian perlu memperhitungkan jumlah anggota keluarga dan kebutuhan khusus jika datanya tersedia.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 37,
    "mat": 4,
    "topic": "Dampak Perubahan Iklim",
    "stim": "Perhatikan ilustrasi berikut:",
    "q": "Berdasarkan cerita dan infografis, jika kamu menjadi anggota tim peduli lingkungan sekolah, dua usulan manakah yang akan kamu pilih untuk mengurangi risiko banjir? Bandingkan manfaat dan kelemahan ketiga usulan tersebut, kemudian jelaskan alasan pilihanmu dengan mempertimbangkan keselamatan warga, kelestarian lingkungan, dan manfaatnya dalam jangka panjang!",
    "jawaban_ideal": "Meninggikan pagar mungkin menahan sebagian aliran masuk ke halaman tetapi tidak menyelesaikan penyebab genangan, bahkan dapat mengalihkan air ke tempat lain. Membersihkan saluran membantu aliran air keluar tetapi harus rutin dan aman. Menjaga pohon serta membuat resapan membantu air masuk ke tanah dalam jangka panjang. Dua pilihan yang baik adalah saluran bersih dan pohon/resapan, dengan mempertimbangkan keselamatan warga, biaya, dan pemeliharaan.",
    "visual": "",
    "media": "./assets/soal_37.png"
  },
  {
    "id_soal": 38,
    "mat": 4,
    "topic": "Dampak Perubahan Iklim",
    "stim": "Akibat perubahan iklim, musim kemarau di desa berlangsung jauh lebih lama dan udara terasa makin panas. Tanaman sayur di kebun sekolah mulai layu karena tanahnya sangat kering, sementara air bersih untuk menyiram tanaman sangat terbatas.",
    "q": "Tuliskan satu ide kreatif dan sederhana yang bisa kamu dan teman-teman lakukan agar tanaman sayur tetap mendapatkan air tanpa membuang-buang air bersih. Jelaskan bagaimana cara kerja idemu.",
    "jawaban_ideal": "Satu ide sederhana adalah membuat penyiraman tetes memakai botol bekas yang bersih dengan lubang kecil, diletakkan aman dekat akar tanaman. Air ditampung atau diisi secukupnya dan dilepaskan perlahan; tanah dapat ditutup mulsa daun kering agar tidak cepat menguap. Siswa membuat jadwal pemeriksaan dan menghindari air kotor yang membahayakan tanaman. Cara ini membantu tanaman mendapat air lebih teratur sambil mengurangi pemborosan.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 39,
    "mat": 4,
    "topic": "Dampak Perubahan Iklim",
    "stim": "Halaman sekolah sering tergenang setelah hujan deras. Sampah terlihat menutup sebagian parit. Sebagian besar halaman juga tertutup beton. Guru mengajak siswa ikut meuseuraya, yaitu bekerja bersama merawat lingkungan.",
    "q": "Usulkan dua langkah yang saling membantu untuk mengurangi genangan. Tuliskan langkah yang dapat dilakukan siswa bersama guru dan jelaskan manfaatnya.",
    "jawaban_ideal": "Dua langkah yang saling membantu adalah membersihkan saluran air dari sampah bersama guru saat kondisi aman, dan menyediakan area tanah berpori atau tanaman untuk menambah resapan. Langkah pertama melancarkan air yang mengalir, sedangkan langkah kedua mengurangi jumlah air yang langsung menggenang. Siswa dapat membagi tugas, melaporkan saluran rusak kepada orang dewasa, dan menghindari bekerja saat banjir. Manfaatnya adalah genangan berkurang tanpa merusak lingkungan.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 40,
    "mat": 4,
    "topic": "Dampak Perubahan Iklim",
    "stim": "Perhatikan data pada gambar berikut:",
    "q": "Berdasarkan infografis tersebut, hitunglah jumlah sampah yang dihasilkan Desa Berkah selama satu minggu!. Menurutmu, apa dampaknya terhadap lingkungan jika sampah tersebut tidak dikelola dengan baik?. Tuliskan 2 ide yang kamu miliki untuk mengolah sampah tersebut agar lebih berguna!",
    "jawaban_ideal": "Menurut informasi desa terdapat 50 rumah dan setiap rumah diperkirakan menghasilkan 2 kg sampah per hari. Produksi desa per hari = 50 × 2 = 100 kg; dalam tujuh hari = 100 × 7 = 700 kg. Jika dibiarkan menumpuk, sampah dapat menimbulkan bau, hama, dan pencemaran. Dua ide pemanfaatan adalah mengolah sampah organik yang sesuai menjadi kompos dan memilah plastik/kertas untuk digunakan kembali atau didaur ulang. Angka merupakan simulasi.",
    "visual": "",
    "media": "./assets/soal_40.png"
  },
  {
    "id_soal": 41,
    "mat": 5,
    "topic": "Tindakan Mitigasi & Adaptasi",
    "stim": "Setiap pagi, Umar, Ali, dan Aisyah berjalan menuju sekolah melewati persawahan di Gampong Berenuen. Sepanjang perjalanan, mereka melihat pepohonan, saluran air, dan beberapa tempat sampah yang disediakan warga. Ketika tiba di sekolah, mereka melihat beberapa siswa sedang membersihkan halaman. Ada yang mengumpulkan daun kering, menyapu sampah, dan menyiram tanaman. Setelah kegiatan selesai, guru mengajak siswa memperhatikan keadaan lingkungan sekolah dan kebiasaan sehari-hari yang dapat memengaruhi kebersihannya.",
    "q": "Jelaskan apa yang dimaksud dengan Tindakan ramah lingkungan, dan sebutkan 3 contoh prilaku ramah lingkungan dalam kehidupan sehari hari",
    "jawaban_ideal": "Tindakan ramah lingkungan adalah kebiasaan yang membantu menjaga lingkungan, menggunakan sumber daya secara bijak, dan mengurangi pencemaran atau kerusakan. Contohnya menutup keran agar air tidak terbuang, mematikan lampu saat tidak dibutuhkan, memilah sampah sesuai jenisnya, serta merawat tanaman. Siswa cukup memberikan tiga contoh yang nyata dan dapat dilakukan sehari-hari.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 42,
    "mat": 5,
    "topic": "Tindakan Mitigasi & Adaptasi",
    "stim": "Saat mencuci tangan sebelum makan, Umar membiarkan keran tetap terbuka ketika menggosok tangan dengan sabun. Air terus mengalir meskipun belum digunakan untuk membilas. Aisyah mengingatkan Umar agar menghemat air.",
    "q": "Apa saranmu agar Umar tetap dapat mencuci tangan sampai bersih tanpa membuang banyak air? Jelaskan kapan keran perlu dibuka dan kapan perlu ditutup.",
    "jawaban_ideal": "Umar membuka keran sebentar untuk membasahi tangan, kemudian menutupnya selama menggosok kedua tangan dengan sabun. Setelah selesai, keran dibuka kembali untuk membilas sampai bersih dan segera ditutup lagi. Cara itu menjaga kebersihan tangan sekaligus mengurangi air yang terbuang karena keran tidak dibiarkan mengalir terus-menerus.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 43,
    "mat": 5,
    "topic": "Tindakan Mitigasi & Adaptasi",
    "stim": "Sepulang sekolah, Aisyah membantu ibunya membersihkan dapur. Setelah selesai memasak, ia melihat kulit buah, sisa sayuran, dan beberapa bungkus plastik terkumpul di dalam satu tempat sampah. Di halaman rumah, daun-daun kering yang berguguran juga mulai menumpuk. Biasanya, seluruh sampah tersebut dikumpulkan dalam satu kantong untuk dibuang. Namun, hari itu tempat sampah sudah penuh, sedangkan petugas pengangkut sampah baru akan datang beberapa hari lagi. Aisyah khawatir sampah yang terus menumpuk akan menimbulkan bau tidak sedap dan mengganggu kebersihan lingkungan rumah.",
    "q": "Jika kamu menjadi Aisyah, tindakan ramah lingkungan apa yang dapat kamu lakukan untuk mengelola sampah tersebut? Jelaskan langkah-langkah yang akan kamu lakukan serta manfaatnya bagi lingkungan!",
    "jawaban_ideal": "Aisyah dapat memisahkan kulit buah, sisa sayuran, dan daun kering dari bungkus plastik. Sampah organik yang sesuai dapat dibuat kompos dengan tempat dan cara yang benar, sementara plastik yang masih bersih dipilah untuk digunakan kembali atau diserahkan ke pengelola daur ulang. Langkahnya dimulai dengan menyiapkan wadah terpisah, memilah, lalu mengolah atau menyerahkan sampah secara teratur. Hasilnya mengurangi sampah menumpuk, bau, dan pencemaran.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 44,
    "mat": 5,
    "topic": "Tindakan Mitigasi & Adaptasi",
    "stim": "Air hujan yang deras menghanyutkan sampah bungkus makanan di halaman sekolah menuju selokan. Selokan mengalir ke sungai, lalu sungai bermuara ke laut. Seorang siswa berpendapat bahwa sampah di sekolah tidak akan sampai mengotori laut karena sekolah sangat jauh dari pantai.",
    "q": "Menurutmu, apakah pendapat siswa itu tepat? Jelaskan alur perjalanan sampah dari halaman sekolah hingga sampai ke laut. Sebutkan satu tindakan nyata yang dapat kamu lakukan bersama teman-teman agar sampah plastik tidak mencemari lingkungan perairan.",
    "jawaban_ideal": "Pendapat bahwa sampah di halaman sekolah akan hilang begitu saja jika tersapu hujan tidak tepat. Sampah dapat terbawa ke selokan, masuk ke sungai, lalu mencapai laut sehingga mencemari air dan membahayakan hewan. Tindakan nyata adalah mengurangi sampah sejak sumbernya, menggunakan wadah pakai ulang, dan memilah sampah di tempat yang sesuai, serta menjaga saluran air tetap bersih.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 45,
    "mat": 5,
    "topic": "Tindakan Mitigasi & Adaptasi",
    "stim": "Perhatikan infografis berikut ini:",
    "q": "Berdasarkan grafik pada infografis, berapa pertambahan jumlah kendaraan bermotor dari tahun 2022 hingga 2026?. Jika kamu menjadi Umar, tindakan ramah lingkungan apa yang akan kamu usulkan untuk mengurangi emisi kendaraan bermotor? Jelaskan dua tindakan beserta alasan dan manfaatnya bagi lingkungan!",
    "jawaban_ideal": "Grafik menunjukkan 600 kendaraan bermotor pada 2022 dan 1.100 pada 2026, sehingga pertambahannya 1.100 − 600 = 500 kendaraan. Jika lebih banyak kendaraan berbahan bakar fosil dipakai, emisi CO₂ berpotensi meningkat. Siswa dapat mengusulkan berjalan kaki atau bersepeda untuk jarak dekat yang aman dan berbagi kendaraan saat diperlukan, disertai alasan penghematan bahan bakar dan pengurangan polusi udara. Grafik merupakan data simulasi.",
    "visual": "",
    "media": "./assets/soal_45.png"
  },
  {
    "id_soal": 46,
    "mat": 5,
    "topic": "Tindakan Mitigasi & Adaptasi",
    "stim": "Pada siang hari, ruang kelas Ali terasa sangat panas sehingga Bu Guru menyalakan kipas angin. Saat pelajaran olahraga dimulai, seluruh siswa dan guru keluar menuju lapangan, tetapi kipas tetap menyala. Ali berkata, “Kalau mau hemat listrik, sebaiknya kita tidak usah memakai kipas angin lagi sama sekali.”",
    "q": "Apakah kamu setuju dengan pendapat Ali? Jelaskan aturan penggunaan kipas angin yang paling tepat: kapan kipas sebaiknya dinyalakan dan kapan harus dimatikan?",
    "jawaban_ideal": "Larangan memakai kipas angin sama sekali kurang tepat karena kipas dapat diperlukan saat ruang kelas panas dan dipakai siswa. Aturan yang lebih bijak ialah menyalakan kipas saat dibutuhkan, memilih penggunaan yang seperlunya, serta mematikannya ketika kelas kosong atau udara sudah nyaman. Tujuannya menjaga kenyamanan belajar sekaligus menghindari listrik terbuang.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 47,
    "mat": 5,
    "topic": "Tindakan Mitigasi & Adaptasi",
    "stim": "Umar menghadiri acara kenduri di gampongnya di Pidie. Beberapa anak mengambil nasi dan lauk sangat banyak sehingga tidak sanggup menghabiskannya dan sisa makanan terbuang.",
    "q": "Tuliskan satu ide sederhana yang bisa dilakukan Umar untuk mencegah makanan terbuang. Bagaimana cara melakukan idemu? Mengapa cara tersebut dapat membantu mengurangi sisa makanan?",
    "jawaban_ideal": "Umar dapat mengusulkan kebiasaan mengambil makanan sesuai porsi ketika kenduri, lalu menambah jika masih lapar. Siswa dapat menyampaikan ajakan sopan kepada teman atau menyediakan pengingat di tempat makan bersama orang dewasa. Dengan mengurangi makanan yang tersisa, energi, air, dan bahan pangan yang digunakan untuk memproduksinya tidak terbuang percuma. Kegiatan dilakukan tanpa memaksa atau mempermalukan orang lain.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 48,
    "mat": 5,
    "topic": "Tindakan Mitigasi & Adaptasi",
    "stim": "Setiap jam istirahat, kantin sekolah menyediakan minuman es teh menggunakan gelas plastik sekali pakai lengkap dengan sedotannya. Tempat sampah di dekat kantin selalu penuh dan meluap oleh tumpukan gelas plastik setiap hari.",
    "q": "Apa ide sederhana yang dapat kamu usulkan agar siswa tetap bisa membeli es teh tanpa menghasilkan banyak sampah plastik? Jelaskan cara menjalankan idemu dan bagaimana ide itu dapat mengurangi sampah di kantin.",
    "jawaban_ideal": "Kantin dapat menyediakan pilihan minuman dalam gelas guna ulang yang bersih atau mengizinkan siswa membawa botol/gelas sendiri. Penjual dan siswa menyepakati tempat pencucian serta aturan kebersihan agar layanan tetap aman. Siswa dapat membuat pengingat atau program penghargaan sederhana. Cara ini mengurangi penggunaan gelas dan sedotan plastik sekali pakai tanpa melarang siswa membeli minuman.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 49,
    "mat": 5,
    "topic": "Tindakan Mitigasi & Adaptasi",
    "stim": "Setiap pagi, kamu diantar ayah ke sekolah menggunakan sepeda motor, meskipun jarak rumahmu cukup dekat. Sesampainya di sekolah, kamu melihat banyak siswa lain juga diantar menggunakan sepeda motor sehingga jalan di depan sekolah menjadi ramai. Saat pelajaran IPAS, kamu mengetahui bahwa kendaraan berbahan bakar bensin menghasilkan gas karbon dioksida (CO₂) yang dapat berkontribusi terhadap pemanasan global.",
    "q": "Tindakan apa yang dapat kamu lakukan untuk mengurangi penggunaan kendaraan bermotor saat berangkat ke sekolah! Jelaskan kegiatan yang akan kamu buat, langkah-langkah pelaksanaannya, dan bagaimana cara mengetahui bahwa kegiatan tersebut berhasil mengurangi jumlah kendaraan bermotor serta membantu menjaga lingkungan!",
    "jawaban_ideal": "Siswa dapat membuat program 'Jalan Aman ke Sekolah' bersama keluarga untuk siswa yang rumahnya dekat, atau mengatur bersepeda dan berbagi kendaraan jika jarak maupun rute memerlukan. Langkahnya memeriksa keselamatan rute, meminta persetujuan orang tua, membuat jadwal, dan mencatat jumlah sepeda motor pengantar sebelum serta sesudah kegiatan. Jika jumlah perjalanan bermotor berkurang, bahan bakar dan emisi CO₂ juga berpotensi berkurang.",
    "visual": "",
    "media": ""
  },
  {
    "id_soal": 50,
    "mat": 5,
    "topic": "Tindakan Mitigasi & Adaptasi",
    "stim": "Setiap kali hujan deras turun, kampung Meunasah Usen sering mengalami banjir. Air yang meluap menggenangi rumah dan jalan. Setelah banjir surut, banyak lumpur tertinggal di halaman rumah dan sepanjang jalan desa. Warga harus bekerja keras membersihkan lumpur agar dapat kembali beraktivitas. Melihat keadaan tersebut, Umar ingin mengajak teman-temannya membantu warga mencari cara agar banjir tidak terus menimbulkan kerusakan lingkungan.",
    "q": "Jika kamu menjadi Umar, ide kreatif ramah lingkungan apa yang akan kamu buat untuk membantu mengurangi risiko banjir dan mengatasi lumpur yang tertinggal? Jelaskan langkah-langkah pelaksanaannya serta manfaatnya bagi lingkungan dan masyarakat!",
    "jawaban_ideal": "Umar dapat mengajak warga dan teman-teman menjaga pohon di daerah resapan, tidak membuang sampah ke saluran air, dan membantu melaporkan saluran tersumbat kepada orang dewasa untuk mengurangi risiko banjir. Setelah banjir surut, lumpur dibersihkan dengan alat pelindung dan pendampingan orang dewasa, lalu ditempatkan di lokasi aman agar tidak kembali menyumbat parit. Usulan harus memuat urutan kegiatan, pembagian tugas, dan manfaat bagi keselamatan warga serta lingkungan.",
    "visual": "",
    "media": ""
  }
]


// ══════════════════════════════════════════════════════════
// 2. MASTER DATA KUNCI JAWABAN IDEAL & KATA KUNCI ACUAN NLP
// ══════════════════════════════════════════════════════════
// Dirancang berelasi melalui 'id_soal' agar dinamis (mendukung ekspansi hingga 50 soal atau lebih).
// Referensi: Diolah dari teks narasi ilmiah pada js/data/materi-read.js

const KUNCI_JAWABAN_ESSAY = [
  {
    "id_jawaban": 1,
    "id_soal": 1,
    "jawaban_ideal": "Cuaca adalah kondisi udara pada tempat dan waktu tertentu, misalnya pagi cerah lalu siang hujan. Iklim adalah rata-rata dan pola keadaan cuaca yang diamati dalam jangka panjang, bukan dalam satu atau dua hari. Musim adalah bagian tahun dengan ciri cuaca yang relatif khas; di banyak wilayah Indonesia dikenal musim hujan dan kemarau. Ketiganya berkaitan, tetapi memiliki cakupan waktu berbeda.",
    "kata_kunci": ["cuaca", "kondisi udara singkat", "iklim", "pola cuaca jangka panjang", "musim", "hujan dan kemarau"]
  },
  {
    "id_jawaban": 2,
    "id_soal": 2,
    "jawaban_ideal": "Pagi hari langit cerah dan udara terasa hangat, sedangkan siang hari langit mendung atau turun hujan dan udara berubah lebih sejuk. Perubahan itu terjadi dalam hitungan jam pada hari yang sama, sehingga merupakan perubahan cuaca. Perubahan iklim tidak dapat ditentukan dari satu hari, melainkan dari pola suhu, hujan, dan unsur cuaca lain dalam waktu panjang.",
    "kata_kunci": ["langit cerah ke mendung/hujan", "udara hangat ke sejuk", "hitungan jam", "perubahan cuaca", "iklim jangka panjang"]
  },
  {
    "id_jawaban": 3,
    "id_soal": 3,
    "jawaban_ideal": "Belum cukup. Hujan deras selama tiga hari merupakan kejadian cuaca, meskipun dapat menyebabkan sungai meluap dan mengganggu kegiatan warga. Untuk menyatakan iklim suatu daerah berubah, diperlukan catatan suhu dan curah hujan selama bertahun-tahun agar dapat dilihat kecenderungan jangka panjang. Jadi, kejadian hujan beberapa hari tidak boleh langsung disamakan dengan perubahan iklim.",
    "kata_kunci": ["belum cukup", "kejadian cuaca", "catatan bertahun-tahun", "suhu dan curah hujan", "kecenderungan jangka panjang"]
  },
  {
    "id_jawaban": 4,
    "id_soal": 4,
    "jawaban_ideal": "Aisyah dapat menutup keran ketika tidak dipakai, memakai air seperlunya ketika mandi atau mencuci, dan menggunakan kembali air yang masih aman untuk menyiram tanaman. Ia juga dapat menyiram pada pagi atau sore hari agar air tidak cepat menguap. Kebiasaan itu membuat persediaan air lebih awet, mengurangi pemborosan, dan membantu tanaman tetap tumbuh selama kemarau.",
    "kata_kunci": ["menutup keran", "pakai air seperlunya", "gunakan kembali air", "siram pagi/sore", "hemat air", "persediaan air awet"]
  },
  {
    "id_jawaban": 5,
    "id_soal": 5,
    "jawaban_ideal": "Pada halaman pertama, tanah yang terbuka dan ditumbuhi tanaman dapat menyerap sebagian air hujan. Pada halaman kedua, permukaan semen mengurangi tempat air masuk ke tanah, sementara saluran yang tersumbat menghambat aliran air keluar. Karena air sulit meresap sekaligus sulit mengalir, genangan di halaman kedua bertahan lebih lama. Penyebabnya bukan semata-mata karena hujan lebih deras.",
    "kata_kunci": ["tanah terbuka menyerap air", "beton/semen mengurangi resapan", "parit tersumbat sampah", "aliran terhambat", "genangan lama"]
  },
  {
    "id_jawaban": 6,
    "id_soal": 6,
    "jawaban_ideal": "Catatan cuaca panas selama tujuh hari hanya menggambarkan keadaan cuaca dalam satu minggu. Iklim ditentukan dari pola dan variasi cuaca dalam jangka panjang, sehingga kesimpulan Ali tentang perubahan iklim belum didukung bukti. Siswa perlu membandingkan catatan suhu dan hujan dari banyak tahun untuk melihat apakah benar terjadi perubahan yang menetap, bukan perubahan sesaat.",
    "kata_kunci": ["tujuh hari tidak cukup", "cuaca sesaat", "pola jangka panjang", "catatan suhu dan hujan", "banyak tahun"]
  },
  {
    "id_jawaban": 7,
    "id_soal": 7,
    "jawaban_ideal": "Infografis menunjukkan curah hujan yang cenderung berkurang. Jika hujan berkurang pada masa tanaman membutuhkan air, persediaan air di sawah menurun sehingga padi dapat kekurangan air, menguning, dan tumbuh kurang baik. Akibatnya, gabah yang dipanen menjadi lebih sedikit dan penghasilan petani bisa turun. Perubahan produksi juga dapat mengurangi persediaan pangan masyarakat. Faktor pertanian lain tetap perlu dipertimbangkan.",
    "kata_kunci": ["curah hujan berkurang", "air sawah menurun", "padi menguning", "hasil panen turun", "penghasilan petani turun"]
  },
  {
    "id_jawaban": 8,
    "id_soal": 8,
    "jawaban_ideal": "Kesimpulan Umar bahwa musim hujan telah berakhir hanya karena hari ini cerah tidak tepat. Hari cerah adalah keadaan cuaca satu hari, sedangkan musim ditentukan oleh pola cuaca yang berlangsung lebih lama. Jika beberapa bulan sebelumnya sering turun hujan, satu hari tanpa hujan belum menunjukkan pergantian musim. Perlu mengamati kecenderungan curah hujan dan kondisi musim dari waktu ke waktu.",
    "kata_kunci": ["tidak tepat", "cuaca satu hari", "pola cuaca lebih lama", "belum pergantian musim", "amati kecenderungan"]
  },
  {
    "id_jawaban": 9,
    "id_soal": 9,
    "jawaban_ideal": "Usulan penebangan pohon untuk membuat saluran perlu dinilai hati-hati karena hilangnya pepohonan dapat mengurangi daya serap tanah dan meningkatkan erosi. Usulan Umar, menjaga serta menanam pohon di daerah hulu, bermanfaat bagi resapan dan kestabilan tanah. Usulan Aisyah, memperbaiki saluran dan membersihkan sampah, juga membantu air mengalir. Solusi yang paling masuk akal adalah menggabungkan perlindungan pohon dengan perbaikan saluran, sambil memperhatikan keselamatan warga.",
    "kata_kunci": ["penebangan pohon kurangi resapan", "menanam pohon di hulu", "perbaiki saluran dan bersihkan sampah", "gabungan solusi", "ramah lingkungan"]
  },
  {
    "id_jawaban": 10,
    "id_soal": 10,
    "jawaban_ideal": "Rencana dapat mencakup dua kegiatan yang saling melengkapi. Pertama, menutup permukaan tanah di sekitar tanaman dengan daun kering atau mulsa bersih untuk mengurangi penguapan. Kedua, menyiram tanaman dengan air yang dikumpulkan secara aman dan secukupnya, sebaiknya pagi atau sore hari. Siswa dapat membagi jadwal merawat tanaman dan memeriksa kelembapan tanah. Kedua langkah membantu tanaman tumbuh tanpa memboroskan air.",
    "kata_kunci": ["mulsa daun kering", "kurangi penguapan", "siram secukupnya", "pagi atau sore", "jadwal merawat tanaman"]
  },
  {
    "id_jawaban": 11,
    "id_soal": 11,
    "jawaban_ideal": "Jika jumlah gas rumah kaca di atmosfer terus bertambah, lebih banyak radiasi inframerah yang dilepas permukaan Bumi diserap dan dipancarkan kembali oleh gas-gas itu. Efek rumah kaca menjadi lebih kuat, sehingga keseimbangan energi Bumi berubah dan suhu rata-rata global cenderung meningkat. Perlu dibedakan efek rumah kaca alami, yang penting bagi kehidupan, dengan penambahannya akibat emisi manusia.",
    "kata_kunci": ["gas rumah kaca bertambah", "radiasi panas tertahan", "efek rumah kaca menguat", "suhu Bumi meningkat", "emisi manusia"]
  },
  {
    "id_jawaban": 12,
    "id_soal": 12,
    "jawaban_ideal": "CO₂ dibutuhkan tumbuhan sebagai bahan dalam proses fotosintesis untuk menghasilkan makanan. Namun, CO₂ juga merupakan gas rumah kaca yang menyerap dan memancarkan radiasi panas. Jika konsentrasinya meningkat akibat kegiatan manusia, efek rumah kaca bertambah kuat dan suhu rata-rata Bumi dapat naik. Jadi, manfaat CO₂ untuk tumbuhan tidak berarti peningkatan CO₂ tanpa batas baik bagi iklim.",
    "kata_kunci": ["fotosintesis", "gas rumah kaca", "menyerap panas", "konsentrasi meningkat", "suhu Bumi naik"]
  },
  {
    "id_jawaban": 13,
    "id_soal": 13,
    "jawaban_ideal": "Atmosfer adalah lapisan gas yang menyelimuti Bumi. Atmosfer menyediakan oksigen untuk pernapasan, mengandung gas penting lain, membantu mengatur suhu, dan memberi perlindungan dari sebagian radiasi berbahaya. Tanpa atmosfer, permukaan Bumi mengalami kondisi suhu dan radiasi yang jauh lebih ekstrem serta tidak tersedia udara untuk bernapas. Karena itu, manusia, hewan, dan tumbuhan seperti yang kita kenal akan sulit bertahan hidup.",
    "kata_kunci": ["lapisan gas", "oksigen", "mengatur suhu", "melindungi dari radiasi", "suhu ekstrem", "sulit bertahan hidup"]
  },
  {
    "id_jawaban": 14,
    "id_soal": 14,
    "jawaban_ideal": "Efek rumah kaca alami terjadi saat gas-gas di atmosfer menyerap dan memancarkan kembali sebagian radiasi panas dari permukaan Bumi. Proses ini membantu menjaga suhu Bumi cukup hangat untuk mendukung air cair dan kehidupan. Jika tidak ada efek rumah kaca alami, Bumi akan jauh lebih dingin. Yang menjadi masalah adalah meningkatnya efek rumah kaca akibat tambahan gas dari aktivitas manusia, bukan keberadaan efek alaminya.",
    "kata_kunci": ["menyerap energi panas", "suhu Bumi hangat", "mendukung kehidupan", "Bumi sangat dingin", "efek alami vs aktivitas manusia"]
  },
  {
    "id_jawaban": 15,
    "id_soal": 15,
    "jawaban_ideal": "Pemanasan global dapat meningkatkan penguapan dan mengubah banyaknya uap air serta pergerakan udara di atmosfer. Hal tersebut dapat memengaruhi waktu, intensitas, dan sebaran hujan, sehingga sebagian wilayah mengalami hujan lebih lebat, sementara wilayah lain mengalami kekeringan. Perubahan pola hujan juga dapat mengubah waktu mulai atau lama musim. Dampaknya tidak selalu sama di setiap daerah karena kondisi geografis berbeda.",
    "kata_kunci": ["penguapan meningkat", "uap air", "pola hujan berubah", "hujan lebat dan kekeringan", "lama musim berubah"]
  },
  {
    "id_jawaban": 16,
    "id_soal": 16,
    "jawaban_ideal": "Infografis memperlihatkan kenaikan CO₂ dari sekitar 412 ppm pada 2020 menjadi 423 ppm pada 2024, atau meningkat 11 ppm (423 − 412). CO₂ tambahan memperkuat efek rumah kaca dan ikut meningkatkan suhu rata-rata Bumi. Tindakan yang dapat dilakukan antara lain menghemat listrik, memilih berjalan kaki atau bersepeda untuk jarak dekat jika aman, dan menghindari pembakaran sampah sambil menjaga pohon yang ada.",
    "kata_kunci": ["CO₂ meningkat", "11 ppm", "efek rumah kaca kuat", "hemat listrik", "jalan kaki/bersepeda", "jaga pohon"]
  },
  {
    "id_jawaban": 17,
    "id_soal": 17,
    "jawaban_ideal": "Gambar menunjukkan ilustrasi sekitar 100.000 sepeda motor per hari. Sepeda motor berbahan bakar bensin mengeluarkan CO₂ saat bensin dibakar. Jika penggunaan kendaraan meningkat, emisi total berpotensi meningkat, sehingga dapat memperkuat efek rumah kaca. Masyarakat dapat mengurangi perjalanan yang tidak perlu, berjalan kaki atau bersepeda pada rute aman, atau berbagi kendaraan. Angka jumlah motor tidak cukup untuk menghitung emisi tepat tanpa data bahan bakar atau jarak tempuh.",
    "kata_kunci": ["pembakaran bensin", "emisi CO₂", "efek rumah kaca", "jalan kaki/bersepeda", "berbagi kendaraan"]
  },
  {
    "id_jawaban": 18,
    "id_soal": 18,
    "jawaban_ideal": "Usulan menghilangkan semua gas rumah kaca tidak tepat karena efek rumah kaca alami menjaga Bumi cukup hangat untuk kehidupan. Tanpa gas rumah kaca, Bumi akan jauh lebih dingin, bukan otomatis menjadi lebih nyaman. Yang perlu dilakukan adalah mengurangi emisi tambahan dari aktivitas manusia, misalnya melalui penggunaan energi lebih efisien, bukan menghilangkan gas rumah kaca alami sepenuhnya.",
    "kata_kunci": ["tidak tepat", "efek rumah kaca alami", "Bumi sangat dingin", "kurangi emisi tambahan", "efisiensi energi"]
  },
  {
    "id_jawaban": 19,
    "id_soal": 19,
    "jawaban_ideal": "Ketiga pilihan memberi manfaat berbeda: pohon menyerap CO₂ ketika tumbuh dan memberi keteduhan; hemat listrik dapat mengurangi kebutuhan energi dari pembangkit berbahan bakar fosil; berjalan kaki atau bersepeda untuk jarak aman dapat mengurangi pembakaran bensin. Siswa boleh memilih dua yang paling layak bagi sekolahnya, misalnya hemat listrik dan menanam-merawat pohon, asalkan membandingkan ketiganya, mempertimbangkan biaya serta keselamatan, dan menjelaskan pengurangan emisinya.",
    "kata_kunci": ["pohon serap CO₂", "hemat listrik", "jalan kaki/bersepeda", "kurangi bahan bakar fosil", "kelayakan dan keselamatan"]
  },
  {
    "id_jawaban": 20,
    "id_soal": 20,
    "jawaban_ideal": "Cerita bergambar dapat disusun dalam urutan: siswa mendengar anggapan bahwa Matahari mendekat, lalu menunjukkan bahwa hal itu bukan penjelasan pemanasan global saat ini; aktivitas manusia membakar bahan bakar fosil; CO₂ dan gas rumah kaca bertambah; lebih banyak radiasi panas terserap sehingga suhu rata-rata Bumi meningkat; siswa mengajak hemat energi dan mengurangi penggunaan kendaraan bila memungkinkan. Setiap panel memiliki hubungan sebab-akibat yang jelas dan pesan ilmiah yang mudah dipahami.",
    "kata_kunci": ["bukan Matahari mendekat", "bahan bakar fosil", "gas rumah kaca bertambah", "panas terserap", "suhu meningkat", "hemat energi"]
  },
  {
    "id_jawaban": 21,
    "id_soal": 21,
    "jawaban_ideal": "Tiga kegiatan manusia yang dapat menyebabkan perubahan iklim misalnya memakai kendaraan berbahan bakar bensin atau solar (menghasilkan CO₂), membakar batu bara pada pembangkit listrik atau kegiatan industri (menghasilkan CO₂), dan membakar hutan atau lahan (melepaskan CO₂). Contoh lain adalah kegiatan peternakan dan penguraian sampah organik tanpa oksigen yang dapat menghasilkan metana (CH₄). Jenis gas harus sesuai dengan aktivitas yang disebut.",
    "kata_kunci": ["kendaraan bermotor", "batu bara/industri", "pembakaran hutan", "CO₂", "peternakan/sampah", "metana (CH₄)"]
  },
  {
    "id_jawaban": 22,
    "id_soal": 22,
    "jawaban_ideal": "Sepeda motor menghasilkan CO₂ langsung karena bensin dibakar di mesin. Lampu tidak menghasilkan asap ketika digunakan, tetapi listrik yang menyalakannya bisa berasal dari pembangkit yang membakar batu bara sehingga menghasilkan CO₂. Dengan demikian, kebutuhan listrik dapat menimbulkan emisi tidak langsung: lampu menyala → listrik dipakai → pembangkit menghasilkan listrik → bahan bakar dibakar dan menghasilkan CO₂.",
    "kata_kunci": ["bensin dibakar", "pembangkit listrik batu bara", "emisi tidak langsung", "alur listrik ke CO₂"]
  },
  {
    "id_jawaban": 23,
    "id_soal": 23,
    "jawaban_ideal": "Pohon menyerap CO₂ dari udara selama fotosintesis. Jika banyak pohon ditebang, kemampuan kawasan itu menyerap CO₂ berkurang. Ketika ranting atau kayu dibakar, karbon yang tersimpan dapat dilepaskan kembali terutama sebagai CO₂. Kedua kegiatan tersebut dapat meningkatkan jumlah CO₂ di atmosfer dan memperkuat efek rumah kaca. Dampaknya bergantung pada skala dan pengelolaan lahan.",
    "kata_kunci": ["fotosintesis", "penebangan kurangi serapan CO₂", "pembakaran lepaskan CO₂", "efek rumah kaca menguat"]
  },
  {
    "id_jawaban": 24,
    "id_soal": 24,
    "jawaban_ideal": "Pembukaan hutan mengurangi jumlah pohon yang menyerap CO₂. Jika pohon atau sisa tumbuhan dibakar atau membusuk, sebagian karbon tersimpan juga dapat dilepaskan ke udara. Bertambahnya CO₂ memperkuat efek rumah kaca sehingga suhu rata-rata Bumi dapat meningkat. Karena itu, menjaga hutan dan menanam kembali pohon yang sesuai merupakan bagian dari upaya membatasi perubahan iklim.",
    "kata_kunci": ["serapan CO₂ berkurang", "karbon dilepaskan", "CO₂ bertambah", "efek rumah kaca", "suhu Bumi meningkat"]
  },
  {
    "id_jawaban": 25,
    "id_soal": 25,
    "jawaban_ideal": "Umar dapat mengusulkan tiga kebiasaan yang diterapkan terus-menerus: mematikan lampu dan kipas jika tidak diperlukan, meminta orang tua mematikan mesin kendaraan saat menunggu bila aman, serta berjalan kaki, bersepeda, atau berbagi kendaraan untuk perjalanan yang sesuai dan aman. Guru dan siswa dapat membuat jadwal pengingat. Kebiasaan tersebut mengurangi pemborosan energi dan kebutuhan bahan bakar fosil sehingga emisi berpotensi turun.",
    "kata_kunci": ["matikan lampu dan kipas", "matikan mesin kendaraan", "jalan kaki/bersepeda", "kurangi pemborosan energi", "emisi turun"]
  },
  {
    "id_jawaban": 26,
    "id_soal": 26,
    "jawaban_ideal": "Pendapat Hasan bahwa sampah sudah selesai ditangani hanya karena terkumpul di satu tempat belum tepat. Sisa makanan yang menumpuk bisa membusuk, menimbulkan bau, menarik hama, dan dalam kondisi tanpa oksigen dapat menghasilkan metana. Sampah sebaiknya dipilah; sisa makanan yang sesuai diolah menjadi kompos dengan cara benar dan sisa lain diserahkan untuk pengelolaan. Jadi, sampah perlu ditangani setelah dikumpulkan, bukan hanya dipindahkan.",
    "kata_kunci": ["belum tepat", "membusuk dan bau", "gas metana", "pilah sampah", "kompos"]
  },
  {
    "id_jawaban": 27,
    "id_soal": 27,
    "jawaban_ideal": "Infografis memperlihatkan CO₂ sekitar 278 ppm pada 1750 dan 424 ppm pada 2024. Selisihnya adalah 424 − 278 = 146 ppm. Penggunaan batu bara, minyak, dan gas serta perubahan hutan berkontribusi menambah CO₂ di atmosfer. Kenaikan gas rumah kaca memperkuat penyerapan radiasi panas dalam sistem Bumi dan memicu pemanasan global. Data ini adalah konsentrasi gas, bukan jumlah emisi sebuah desa.",
    "kata_kunci": ["278 ppm ke 424 ppm", "146 ppm", "bahan bakar fosil", "penyerapan panas", "pemanasan global"]
  },
  {
    "id_jawaban": 28,
    "id_soal": 28,
    "jawaban_ideal": "Kebiasaan yang lebih bijak adalah memakai kembali botol minum yang masih layak dan bersih, bukan sering membeli botol plastik sekali pakai. Pembuatan, pengemasan, dan pengangkutan botol baru membutuhkan bahan baku dan energi, sementara botol sekali pakai menjadi sampah sesudah digunakan. Mengisi ulang botol membantu mengurangi kebutuhan botol baru dan sampah plastik. Botol harus tetap dibersihkan dengan aman.",
    "kata_kunci": ["botol isi ulang", "hemat bahan baku dan energi", "kurangi sampah plastik", "jaga kebersihan botol"]
  },
  {
    "id_jawaban": 29,
    "id_soal": 29,
    "jawaban_ideal": "Siswa dapat membandingkan tiga kegiatan: menanam dan merawat pohon (memerlukan lahan dan perawatan), hemat listrik setiap hari (memerlukan kedisiplinan), serta mengurangi perjalanan bermotor untuk jarak dekat bila aman (bergantung pada jarak dan kondisi jalan). Dua pilihan dapat dipilih sesuai kebutuhan sekolah, misalnya hemat listrik dan berjalan kaki untuk siswa yang memungkinkan. Alasan sebaiknya memuat manfaat emisi, biaya, kemudahan pelaksanaan, dan keberlanjutan.",
    "kata_kunci": ["menanam pohon", "hemat listrik", "kurangi kendaraan bermotor", "biaya dan waktu", "berkelanjutan", "kurangi emisi"]
  },
  {
    "id_jawaban": 30,
    "id_soal": 30,
    "jawaban_ideal": "Ani sebaiknya memakai halaman buku lama yang masih kosong dan layak sebelum membeli buku baru. Buku dapat dipisahkan menurut pelajaran dengan label, pembatas, atau sampul yang rapi. Siswa juga dapat membuat buku catatan kecil dari halaman kosong yang dikumpulkan secara aman dan tertib. Langkah tersebut menghemat kertas dan biaya sekaligus mengurangi kebutuhan bahan baku, tanpa mengorbankan keteraturan catatan belajar.",
    "kata_kunci": ["pakai buku lama", "label atau pembatas", "sampul rapi", "hemat kertas", "kurangi bahan baku"]
  },
  {
    "id_jawaban": 31,
    "id_soal": 31,
    "jawaban_ideal": "Dampak perubahan iklim antara lain meningkatnya risiko suhu sangat panas, perubahan pola hujan yang dapat memperberat kekeringan atau banjir di beberapa wilayah, serta terganggunya pertanian sehingga hasil panen berkurang. Dampak lain yang dapat diterima adalah kenaikan permukaan laut dan gangguan ekosistem. Ketiga contoh harus berbeda serta berkaitan dengan lingkungan atau kehidupan manusia.",
    "kata_kunci": ["suhu panas", "kekeringan atau banjir", "hasil panen berkurang", "kenaikan permukaan laut", "gangguan ekosistem"]
  },
  {
    "id_jawaban": 32,
    "id_soal": 32,
    "jawaban_ideal": "Air laut yang menghangat memuai sehingga volumenya meningkat walaupun jumlah massanya relatif sama. Selain itu, ketika es yang berada di daratan mencair, airnya mengalir masuk ke laut dan menambah jumlah air laut. Kedua proses tersebut menaikkan tinggi permukaan laut dan dapat meningkatkan risiko genangan atau abrasi di pesisir. Pencairan es laut yang sudah mengapung tidak sama dampaknya dengan es di daratan.",
    "kata_kunci": ["air laut memuai", "volume meningkat", "es daratan mencair", "menambah air laut", "permukaan laut naik"]
  },
  {
    "id_jawaban": 33,
    "id_soal": 33,
    "jawaban_ideal": "Ali dapat menutup keran saat tidak dipakai, menggunakan air secukupnya untuk mandi dan mencuci, serta memakai kembali air yang masih aman untuk menyiram tanaman. Air hujan dapat ditampung secara aman ketika tersedia. Keluarga sebaiknya mengutamakan air untuk minum, memasak, kebersihan, dan kebutuhan makhluk hidup. Cara-cara ini membantu persediaan air bertahan saat musim kemarau lebih panjang.",
    "kata_kunci": ["tutup keran", "pakai air secukupnya", "pakai ulang air untuk tanaman", "tampung air hujan", "utamakan kebutuhan pokok"]
  },
  {
    "id_jawaban": 34,
    "id_soal": 34,
    "jawaban_ideal": "Jika air sawah berkurang, tanaman padi sulit memperoleh air untuk pertumbuhan sehingga dapat menguning atau menghasilkan lebih sedikit gabah. Saat panen menurun, jumlah gabah yang dapat dimakan atau dijual keluarga juga berkurang. Karena pendapatan petani bergantung pada hasil penjualan panen, penghasilan Ayah Umar bisa turun. Hubungannya adalah kekurangan air → pertumbuhan padi terganggu → produksi turun → pendapatan berkurang.",
    "kata_kunci": ["air sawah berkurang", "pertumbuhan padi terganggu", "produksi gabah turun", "penghasilan petani turun"]
  },
  {
    "id_jawaban": 35,
    "id_soal": 35,
    "jawaban_ideal": "Grafik menunjukkan 40 karung pada musim pertama, 35 pada musim kedua, 28 pada musim ketiga, dan 22 pada musim keempat. Produksi terus menurun dengan selisih 40 − 22 = 18 karung. Berkurangnya atau tidak menentunya hujan dapat mengurangi air untuk padi sehingga pertumbuhan terganggu. Hasil panen dan pendapatan petani turun, dan jika terjadi luas, pasokan pangan warga dapat terganggu. Data hanya contoh simulasi.",
    "kata_kunci": ["panen menurun", "selisih 18 karung", "kekurangan air", "pendapatan petani turun", "pasokan pangan terganggu"]
  },
  {
    "id_jawaban": 36,
    "id_soal": 36,
    "jawaban_ideal": "Bantuan air sebaiknya diprioritaskan kepada keluarga Umar jika persediaan airnya hampir habis, terutama untuk minum dan memasak. Keluarga Aisyah yang masih memiliki persediaan mencukupi tetap diperhatikan tetapi tidak lebih mendesak. Keputusan ini menunjukkan pembagian bantuan berdasarkan tingkat kebutuhan, bukan kedekatan atau pilihan pribadi. Penilaian perlu memperhitungkan jumlah anggota keluarga dan kebutuhan khusus jika datanya tersedia.",
    "kata_kunci": ["prioritas keluarga Umar", "persediaan hampir habis", "kebutuhan mendesak", "keadilan"]
  },
  {
    "id_jawaban": 37,
    "id_soal": 37,
    "jawaban_ideal": "Meninggikan pagar mungkin menahan sebagian aliran masuk ke halaman tetapi tidak menyelesaikan penyebab genangan, bahkan dapat mengalihkan air ke tempat lain. Membersihkan saluran membantu aliran air keluar tetapi harus rutin dan aman. Menjaga pohon serta membuat resapan membantu air masuk ke tanah dalam jangka panjang. Dua pilihan yang baik adalah saluran bersih dan pohon/resapan, dengan mempertimbangkan keselamatan warga, biaya, dan pemeliharaan.",
    "kata_kunci": ["pagar tinggi tidak atasi penyebab", "saluran air bersih", "pohon dan resapan", "jangka panjang", "keselamatan warga"]
  },
  {
    "id_jawaban": 38,
    "id_soal": 38,
    "jawaban_ideal": "Satu ide sederhana adalah membuat penyiraman tetes memakai botol bekas yang bersih dengan lubang kecil, diletakkan aman dekat akar tanaman. Air ditampung atau diisi secukupnya dan dilepaskan perlahan; tanah dapat ditutup mulsa daun kering agar tidak cepat menguap. Siswa membuat jadwal pemeriksaan dan menghindari air kotor yang membahayakan tanaman. Cara ini membantu tanaman mendapat air lebih teratur sambil mengurangi pemborosan.",
    "kata_kunci": ["penyiraman tetes", "botol bekas berlubang", "mulsa daun kering", "hemat air", "air dilepas perlahan"]
  },
  {
    "id_jawaban": 39,
    "id_soal": 39,
    "jawaban_ideal": "Dua langkah yang saling membantu adalah membersihkan saluran air dari sampah bersama guru saat kondisi aman, dan menyediakan area tanah berpori atau tanaman untuk menambah resapan. Langkah pertama melancarkan air yang mengalir, sedangkan langkah kedua mengurangi jumlah air yang langsung menggenang. Siswa dapat membagi tugas, melaporkan saluran rusak kepada orang dewasa, dan menghindari bekerja saat banjir. Manfaatnya adalah genangan berkurang tanpa merusak lingkungan.",
    "kata_kunci": ["bersihkan saluran air", "area resapan/tanaman", "melancarkan aliran", "kerja sama", "genangan berkurang"]
  },
  {
    "id_jawaban": 40,
    "id_soal": 40,
    "jawaban_ideal": "Menurut informasi desa terdapat 50 rumah dan setiap rumah diperkirakan menghasilkan 2 kg sampah per hari. Produksi desa per hari = 50 × 2 = 100 kg; dalam tujuh hari = 100 × 7 = 700 kg. Jika dibiarkan menumpuk, sampah dapat menimbulkan bau, hama, dan pencemaran. Dua ide pemanfaatan adalah mengolah sampah organik yang sesuai menjadi kompos dan memilah plastik/kertas untuk digunakan kembali atau didaur ulang. Angka merupakan simulasi.",
    "kata_kunci": ["100 kg per hari", "700 kg per minggu", "bau, hama, pencemaran", "kompos organik", "daur ulang plastik/kertas"]
  },
  {
    "id_jawaban": 41,
    "id_soal": 41,
    "jawaban_ideal": "Tindakan ramah lingkungan adalah kebiasaan yang membantu menjaga lingkungan, menggunakan sumber daya secara bijak, dan mengurangi pencemaran atau kerusakan. Contohnya menutup keran agar air tidak terbuang, mematikan lampu saat tidak dibutuhkan, memilah sampah sesuai jenisnya, serta merawat tanaman. Siswa cukup memberikan tiga contoh yang nyata dan dapat dilakukan sehari-hari.",
    "kata_kunci": ["menjaga lingkungan", "bijak sumber daya", "tutup keran", "matikan lampu", "pilah sampah", "rawat tanaman"]
  },
  {
    "id_jawaban": 42,
    "id_soal": 42,
    "jawaban_ideal": "Umar membuka keran sebentar untuk membasahi tangan, kemudian menutupnya selama menggosok kedua tangan dengan sabun. Setelah selesai, keran dibuka kembali untuk membilas sampai bersih dan segera ditutup lagi. Cara itu menjaga kebersihan tangan sekaligus mengurangi air yang terbuang karena keran tidak dibiarkan mengalir terus-menerus.",
    "kata_kunci": ["buka keran untuk membasahi", "tutup saat menyabun", "buka lagi untuk membilas", "hemat air", "tangan bersih"]
  },
  {
    "id_jawaban": 43,
    "id_soal": 43,
    "jawaban_ideal": "Aisyah dapat memisahkan kulit buah, sisa sayuran, dan daun kering dari bungkus plastik. Sampah organik yang sesuai dapat dibuat kompos dengan tempat dan cara yang benar, sementara plastik yang masih bersih dipilah untuk digunakan kembali atau diserahkan ke pengelola daur ulang. Langkahnya dimulai dengan menyiapkan wadah terpisah, memilah, lalu mengolah atau menyerahkan sampah secara teratur. Hasilnya mengurangi sampah menumpuk, bau, dan pencemaran.",
    "kata_kunci": ["pilah organik dan plastik", "buat kompos", "daur ulang plastik", "wadah terpisah", "kurangi bau dan pencemaran"]
  },
  {
    "id_jawaban": 44,
    "id_soal": 44,
    "jawaban_ideal": "Pendapat bahwa sampah di halaman sekolah akan hilang begitu saja jika tersapu hujan tidak tepat. Sampah dapat terbawa ke selokan, masuk ke sungai, lalu mencapai laut sehingga mencemari air dan membahayakan hewan. Tindakan nyata adalah mengurangi sampah sejak sumbernya, menggunakan wadah pakai ulang, dan memilah sampah di tempat yang sesuai, serta menjaga saluran air tetap bersih.",
    "kata_kunci": ["tidak tepat", "selokan ke sungai ke laut", "mencemari perairan", "wadah pakai ulang", "jaga saluran bersih"]
  },
  {
    "id_jawaban": 45,
    "id_soal": 45,
    "jawaban_ideal": "Grafik menunjukkan 600 kendaraan bermotor pada 2022 dan 1.100 pada 2026, sehingga pertambahannya 1.100 − 600 = 500 kendaraan. Jika lebih banyak kendaraan berbahan bakar fosil dipakai, emisi CO₂ berpotensi meningkat. Siswa dapat mengusulkan berjalan kaki atau bersepeda untuk jarak dekat yang aman dan berbagi kendaraan saat diperlukan, disertai alasan penghematan bahan bakar dan pengurangan polusi udara. Grafik merupakan data simulasi.",
    "kata_kunci": ["bertambah 500 kendaraan", "emisi CO₂ meningkat", "jalan kaki/bersepeda", "berbagi kendaraan", "kurangi polusi udara"]
  },
  {
    "id_jawaban": 46,
    "id_soal": 46,
    "jawaban_ideal": "Larangan memakai kipas angin sama sekali kurang tepat karena kipas dapat diperlukan saat ruang kelas panas dan dipakai siswa. Aturan yang lebih bijak ialah menyalakan kipas saat dibutuhkan, memilih penggunaan yang seperlunya, serta mematikannya ketika kelas kosong atau udara sudah nyaman. Tujuannya menjaga kenyamanan belajar sekaligus menghindari listrik terbuang.",
    "kata_kunci": ["kurang tepat", "nyalakan saat panas/dibutuhkan", "matikan saat kelas kosong", "kenyamanan dan hemat listrik"]
  },
  {
    "id_jawaban": 47,
    "id_soal": 47,
    "jawaban_ideal": "Umar dapat mengusulkan kebiasaan mengambil makanan sesuai porsi ketika kenduri, lalu menambah jika masih lapar. Siswa dapat menyampaikan ajakan sopan kepada teman atau menyediakan pengingat di tempat makan bersama orang dewasa. Dengan mengurangi makanan yang tersisa, energi, air, dan bahan pangan yang digunakan untuk memproduksinya tidak terbuang percuma. Kegiatan dilakukan tanpa memaksa atau mempermalukan orang lain.",
    "kata_kunci": ["ambil sesuai porsi", "tambah jika masih lapar", "ajakan sopan/pengingat", "kurangi sisa makanan", "hemat sumber daya pangan"]
  },
  {
    "id_jawaban": 48,
    "id_soal": 48,
    "jawaban_ideal": "Kantin dapat menyediakan pilihan minuman dalam gelas guna ulang yang bersih atau mengizinkan siswa membawa botol/gelas sendiri. Penjual dan siswa menyepakati tempat pencucian serta aturan kebersihan agar layanan tetap aman. Siswa dapat membuat pengingat atau program penghargaan sederhana. Cara ini mengurangi penggunaan gelas dan sedotan plastik sekali pakai tanpa melarang siswa membeli minuman.",
    "kata_kunci": ["gelas guna ulang", "bawa botol/gelas sendiri", "aturan kebersihan", "kurangi sampah plastik sekali pakai"]
  },
  {
    "id_jawaban": 49,
    "id_soal": 49,
    "jawaban_ideal": "Siswa dapat membuat program 'Jalan Aman ke Sekolah' bersama keluarga untuk siswa yang rumahnya dekat, atau mengatur bersepeda dan berbagi kendaraan jika jarak maupun rute memerlukan. Langkahnya memeriksa keselamatan rute, meminta persetujuan orang tua, membuat jadwal, dan mencatat jumlah sepeda motor pengantar sebelum serta sesudah kegiatan. Jika jumlah perjalanan bermotor berkurang, bahan bakar dan emisi CO₂ juga berpotensi berkurang.",
    "kata_kunci": ["jalan kaki/bersepeda", "berbagi kendaraan", "keselamatan rute", "catat jumlah motor sebelum-sesudah", "emisi CO₂ berkurang"]
  },
  {
    "id_jawaban": 50,
    "id_soal": 50,
    "jawaban_ideal": "Umar dapat mengajak warga dan teman-teman menjaga pohon di daerah resapan, tidak membuang sampah ke saluran air, dan membantu melaporkan saluran tersumbat kepada orang dewasa untuk mengurangi risiko banjir. Setelah banjir surut, lumpur dibersihkan dengan alat pelindung dan pendampingan orang dewasa, lalu ditempatkan di lokasi aman agar tidak kembali menyumbat parit. Usulan harus memuat urutan kegiatan, pembagian tugas, dan manfaat bagi keselamatan warga serta lingkungan.",
    "kata_kunci": ["jaga pohon resapan", "jangan buang sampah ke saluran", "bersihkan lumpur dengan aman", "pendampingan orang dewasa", "cegah parit tersumbat"]
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
// 4. HELPER DINAMIS RUJUKAN NLP & RENDER VISUAL / MEDIA SOAL
// ══════════════════════════════════════════════════════════

const ANSWER_VISUAL_BLOCKS = {
  weather: '<div class="ans-weather-visual"><div class="ans-weather-scene sunny"><span class="ico">☀️</span>07.00 · cerah &amp; hangat</div><div class="ans-weather-scene rainy"><span class="ico">🌧️</span>14.00 · gelap, sejuk &amp; hujan</div></div>'
};

function escapeSoalAttr(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Merender blok visual modular jika atribut visual pada soal tidak kosong.
 * @param {string} visualKey - Kunci blok visual (mis. 'weather')
 * @returns {string} HTML blok visual atau string kosong
 */
function renderQuestionVisualHtml(visualKey) {
  const key = String(visualKey || '').trim();
  if (!key) return '';
  if (Object.prototype.hasOwnProperty.call(ANSWER_VISUAL_BLOCKS, key)) {
    return ANSWER_VISUAL_BLOCKS[key];
  }
  return '';
}

/**
 * Merender tag <img> responsif jika atribut media pada soal tidak kosong.
 * @param {string} mediaUrl - Tautan atau path file gambar (.png, dll.)
 * @param {string} [altText] - Teks alternatif gambar
 * @returns {string} HTML figure + img atau string kosong
 */
function renderQuestionMediaHtml(mediaUrl, altText) {
  const src = String(mediaUrl || '').trim();
  if (!src || /^\s*javascript:/i.test(src)) return '';
  const safeSrc = escapeSoalAttr(src);
  const safeAlt = escapeSoalAttr(altText ? `Ilustrasi soal: ${altText}` : 'Ilustrasi gambar soal');
  return `<figure class="ans-media-box"><img class="ans-media-img" src="${safeSrc}" alt="${safeAlt}" loading="lazy" onerror="var b=this.closest&&this.closest('.ans-media-box');if(b)b.style.display='none';"></figure>`;
}

/**
 * Menggabungkan render atribut visual (blok modular) dan media (<img>) secara seragam
 * untuk tahap ANSWER, DISCUSS, dan EXPLAIN.
 * @param {object} questionObj - Objek soal dari ANSWER_ESSAY25
 * @returns {string} HTML gabungan visual & media
 */
function renderQuestionVisualAndMedia(questionObj) {
  if (!questionObj || typeof questionObj !== 'object') return '';
  return `${renderQuestionVisualHtml(questionObj.visual)}${renderQuestionMediaHtml(questionObj.media, questionObj.topic || questionObj.q)}`;
}

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
  window.ANSWER_VISUAL_BLOCKS = ANSWER_VISUAL_BLOCKS;
  window.renderQuestionVisualHtml = renderQuestionVisualHtml;
  window.renderQuestionMediaHtml = renderQuestionMediaHtml;
  window.renderQuestionVisualAndMedia = renderQuestionVisualAndMedia;
  window.getKunciJawaban = getKunciJawaban;
  window.getQuestionsByMaterial = getQuestionsByMaterial;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ANSWER_ESSAY25,
    KUNCI_JAWABAN_ESSAY,
    ANSWER_CHALLENGE,
    ANSWER_VISUAL_BLOCKS,
    renderQuestionVisualHtml,
    renderQuestionMediaHtml,
    renderQuestionVisualAndMedia,
    getKunciJawaban,
    getQuestionsByMaterial
  };
}

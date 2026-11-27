/**
 * EcoMedia RADEC - Master Data: Materi READ (Teks Bacaan, Infografis, & Ecomedia)
 * Memuat master data terstruktur untuk Tahap 1 (READ).
 */

// ══════════════════════════════════════════════════════════
// 1. MASTER DATA TEKS BACAAN (5 MATERI POKOK)
// ══════════════════════════════════════════════════════════

const READ_MATERIALS = [
  {
    id_materi: "materi-1",
    nomor: 1,
    judul: "Cuaca, Iklim, dan Musim",
    ikon: "🌤️",
    tag: "Materi 1",
    ringkasan: "Memahami perbedaan mendasar antara cuaca harian, pola musim berulang di Indonesia, dan iklim tropis jangka panjang melalui peristiwa di Pidie.",
    sections: [
      {
        subJudul: "Pagi yang berubah di Pidie",
        tipe: "narasi",
        paragraf: [
          "Bayangkan kamu tinggal di Gampong Bernuen, Kabupaten Pidie. Pukul 07.00 Aisyah berangkat ke sekolah. Matahari cerah, udara hangat, burung berkicau di pepohonan. <em>“Hari ini sepertinya tidak akan hujan,”</em> pikirnya.",
          "Namun menjelang sekolah usai, langit dipenuhi awan gelap. Angin bertiup kencang, petir terdengar, lalu hujan turun deras. <em>“Mengapa pagi tadi cerah, tetapi siang ini hujan deras?”</em>",
          "Dalam perjalanan pulang, Aisyah melihat air mengalir di parit. Sebagian mengalir lancar, sebagian lagi menggenang karena saluran tertutup daun dan sampah plastik. Di rumah, ayahnya yang bekerja di sawah berkata, <em>“Hujan memang penting untuk sawah kita. Tetapi kalau hujan terlalu deras dan air tidak dapat mengalir dengan baik, sawah dan jalan bisa tergenang.”</em>",
          "Peristiwa sederhana itu menunjukkan satu hal penting: <strong>keadaan udara, air, tanah, tumbuhan, hewan, dan aktivitas manusia saling berhubungan.</strong>"
        ]
      },
      {
        subJudul: "Mengapa pagi cerah, tetapi siang bisa hujan?",
        tipe: "konsep",
        paragraf: [
          "Pagi cerah dan hangat, siang berawan dan berangin, sore hujan — semuanya terjadi dalam satu hari. Keadaan udara pada suatu tempat dan waktu tertentu inilah yang disebut <strong>cuaca</strong>.",
          "<strong>Cuaca adalah keadaan udara pada tempat tertentu dalam waktu yang relatif singkat.</strong> Kita bisa berkata “pagi ini di Pidie cerah”, “siang ini udara terasa panas”, atau “sore ini turun hujan”. Tetapi kita tidak berkata “cuaca Pidie selalu hujan”, karena cuaca dapat berubah dalam hitungan jam bahkan menit."
        ],
        note: {
          judul: "🧠 Ayo Berpikir",
          stimulus: "Jika pukul 07.00 langit cerah, apakah pukul 14.00 pasti cerah juga? <em>Tidak selalu.</em> Inilah bukti bahwa cuaca bersifat mudah berubah."
        }
      },
      {
        subJudul: "Mengenali unsur-unsur cuaca",
        tipe: "daftar",
        itemDaftar: [
          "<strong>Suhu udara</strong> — panas atau dinginnya udara",
          "<strong>Curah hujan</strong> — banyaknya air hujan yang turun",
          "<strong>Angin</strong> — udara yang bergerak",
          "<strong>Kelembapan</strong> — banyaknya uap air di udara",
          "<strong>Awan</strong> — kumpulan titik air di langit"
        ],
        paragrafSetelah: [
          "Siang hari Aisyah merasa lebih panas daripada pagi hari. Energi Matahari memanaskan permukaan Bumi — tanah, jalan, sawah, pepohonan, dan bangunan menerima panas itu, lalu ikut memengaruhi suhu udara di sekitarnya. Karena itu tempat yang terkena sinar Matahari langsung biasanya terasa lebih panas daripada tempat yang teduh. Pohon memberi keteduhan sekaligus melepaskan uap air lewat daunnya, sehingga keberadaan tumbuhan membantu menciptakan lingkungan yang lebih nyaman."
        ]
      },
      {
        tipe: "gambar",
        src: "assets/siklus_hujan.jpg",
        alt: "Infografis siklus air: matahari memanaskan air, uap air naik dan mendingin, terbentuk awan, lalu hujan turun dan air kembali ke laut.",
        caption: "<strong>Dari mana datangnya hujan?</strong> Hujan tidak muncul begitu saja. Air di laut dan sungai menguap karena panas Matahari, naik lalu mendingin menjadi titik-titik air yang berkumpul membentuk awan. Ketika titik air menjadi terlalu berat, jatuhlah hujan. Sebagian air meresap ke tanah, sebagian mengalir ke sungai dan kembali ke laut, lalu menguap lagi. Inilah <strong>siklus air</strong> yang terus berulang — karena itu air di bumi tidak pernah habis, tetapi tetap harus kita jaga agar bersih dan bermanfaat."
      },
      {
        subJudul: "Mengapa ada musim hujan dan musim kemarau?",
        tipe: "narasi",
        paragraf: [
          "Suatu sore, Aisyah melihat ayahnya berdiri di tepi sawah memperhatikan langit yang makin tebal awannya.",
          "<strong>Aisyah:</strong> <em>“Ayah, akhir-akhir ini mengapa sering hujan?”</em><br><strong>Ayah:</strong> <em>“Mungkin kita mulai memasuki periode yang lebih banyak hujannya.”</em><br><strong>Aisyah:</strong> <em>“Berarti sekarang musim hujan?”</em><br><strong>Ayah:</strong> <em>“Bisa jadi. Tetapi musim hujan bukan berarti setiap hari pasti hujan.”</em>",
          "Kemarin sore hujan deras, pagi ini Matahari cerah — itu perubahan <strong>cuaca</strong>. Tetapi bila selama beberapa bulan hujan cenderung lebih sering turun, kita mulai melihat keadaan cuaca yang berulang. <strong>Keadaan cuaca yang berulang selama beberapa bulan dalam satu tahun disebut musim.</strong>",
          "Jadi satu hari hujan belum cukup untuk menentukan musim. Kita perlu memperhatikan keadaan cuaca yang berulang dalam waktu yang lebih lama."
        ],
        alurFlow: "CUACA → keadaan dalam waktu singkat: “Apakah hari ini hujan?”<br>MUSIM → keadaan cuaca yang berulang dalam waktu yang lebih panjang: “Apakah belakangan ini hujan cenderung lebih sering terjadi?”"
      },
      {
        subJudul: "Dua musim utama di Indonesia",
        tipe: "konsep",
        paragraf: [
          "Indonesia adalah negara tropis dan secara umum mengalami dua musim utama: 🌧️ <strong>musim hujan</strong> dan ☀️ <strong>musim kemarau</strong>. Namun waktu datang dan lamanya kedua musim itu tidak selalu sama di setiap wilayah, dan tidak selalu jatuh pada bulan yang sama setiap tahun. Aceh, termasuk Pidie, bahkan dapat memiliki waktu turunnya hujan yang lebih beragam daripada pembagian sederhana Oktober–Maret dan April–September. Karena itu, pahamilah musim dari <strong>seberapa sering hujan turun</strong>, bukan dari hafalan nama bulan."
        ]
      },
      {
        subJudul: "🌧️ Musim hujan",
        tipe: "narasi",
        paragraf: [
          "Pada musim hujan, hujan cenderung turun lebih sering dan jumlah airnya lebih banyak. Langit lebih sering berawan, tanah memperoleh lebih banyak air, air untuk sawah lebih tersedia, dan tumbuhan mendapat air yang dibutuhkan.",
          "Hujan sangat penting bagi kehidupan. Tetapi apakah semakin banyak hujan selalu semakin baik? <strong>Tidak selalu.</strong> Bandingkan dua gampong yang menerima hujan sama derasnya:"
        ],
        alurKomparasi: [
          { label: "Gampong A — banyak pohon dan tanah terbuka, parit bersih", alur: "Hujan turun → sebagian air meresap ke tanah → sebagian mengalir lancar melalui parit" },
          { label: "Gampong B — banyak permukaan tertutup beton, parit penuh sampah", alur: "Hujan turun → sedikit air meresap + aliran terhambat → air lebih mudah menggenang" }
        ],
        note: {
          judul: "🧠 Ayo Berpikir",
          stimulus: "Kedua gampong menerima hujan yang sama. Mengapa dampaknya bisa berbeda? Ternyata hujan bukan satu-satunya penentu genangan: <strong>hujan + kondisi tanah + tumbuhan + saluran air + tindakan manusia</strong> bersama-sama menentukan apa yang terjadi di lingkungan. Inilah cara melihat lingkungan sebagai satu sistem yang saling berhubungan."
        }
      },
      {
        subJudul: "☀️ Musim kemarau",
        tipe: "narasi",
        paragraf: [
          "Beberapa waktu kemudian, hujan mulai jarang turun di Pidie. Hari cerah lebih sering dijumpai, pakaian lebih cepat kering, dan warga memanfaatkan cuaca untuk menjemur hasil pertanian. <strong>Periode ketika hujan cenderung lebih jarang terjadi disebut musim kemarau.</strong>",
          "Musim kemarau juga bermanfaat karena cuaca cerah membantu banyak kegiatan masyarakat. Namun bila hujan sangat jarang dalam waktu cukup lama, ketersediaan air dapat berkurang."
        ],
        alurFlow: "Hujan semakin jarang → air yang masuk ke tanah dan sumber air berkurang → tanah menjadi lebih kering → ketersediaan air bagi tumbuhan dan manusia berkurang"
      },
      {
        subJudul: "🌾 Musim dan kehidupan petani Pidie",
        tipe: "konsep",
        paragraf: [
          "Bagi petani, mengetahui kapan musim hujan dan musim kemarau datang sangat penting. Ia harus mempertimbangkan: apakah air tersedia? Apakah hujan diperkirakan cukup? Apakah sawah justru terlalu banyak air? Kapan waktu yang sesuai untuk menanam, memanen, atau mengeringkan hasil panen? Kegiatan pertanian tidak ditentukan oleh nama bulan saja, melainkan oleh kondisi cuaca, ketersediaan air, jenis tanaman, dan informasi musim."
        ],
        note: {
          judul: "🧠 Tantangan Berpikir",
          stimulus: "Pak Hasan akan menjemur gabah hasil panennya. Pagi hari langit cerah, tetapi informasi cuaca menunjukkan kemungkinan hujan pada sore hari. Menurutmu apa keputusan yang sebaiknya diambil?",
          opsi: [
            "A. Tidak perlu memperhatikan informasi cuaca karena sekarang sedang cerah.",
            "B. Menjemur gabah sambil menyiapkan tempat untuk memindahkannya jika cuaca berubah.",
            "C. Membuang sebagian gabah agar pekerjaan lebih cepat."
          ],
          
        }
      },
      {
        subJudul: "Jangan sampai keliru!",
        tipe: "miskonsepsi",
        item: [
          {
            salah: "Musim hujan berarti setiap hari pasti hujan.",
            benar: "Pada musim hujan, hujan cenderung terjadi lebih sering — hari cerah masih mungkin ada."
          },
          {
            salah: "Musim kemarau berarti sama sekali tidak akan turun hujan.",
            benar: "Pada musim kemarau, hujan cenderung lebih jarang — hujan masih dapat terjadi."
          }
        ]
      },
      {
        subJudul: "Dari musim menuju iklim",
        tipe: "konsep",
        paragraf: [
          "Aisyah kini paham: hari ini hujan berarti berbicara tentang cuaca; hujan lebih sering selama suatu periode berarti berbicara tentang musim. Lalu apa itu iklim?",
          "Bayangkan kita punya catatan cuaca Pidie selama bertahun-tahun — suhu udara, jumlah hujan, angin, dan kelembapan. Bukan hanya hari ini, bukan hanya bulan ini, tetapi dalam jangka waktu yang sangat panjang. Dari catatan itu para ahli menemukan gambaran umum keadaan udara suatu wilayah.",
          "<strong>Iklim adalah gambaran umum keadaan cuaca suatu wilayah dalam jangka waktu yang panjang.</strong> Dalam kajian iklim, para ahli biasanya menggunakan periode sekitar <strong>30 tahun</strong> untuk menggambarkan kondisi iklim suatu wilayah."
        ]
      },
      {
        subJudul: "🔍 Cuaca, musim, atau iklim?",
        tipe: "tabel",
        header: ["Jika kita bertanya…", "Kita sedang mempelajari…"],
        baris: [
          ["“Apakah sore ini akan hujan di Pidie?”", "🌦️ Cuaca"],
          ["“Apakah dalam periode ini hujan sedang lebih sering terjadi?”", "🌧️ Musim"],
          ["“Bagaimana keadaan suhu dan hujan wilayah ini dalam jangka panjang?”", "🌍 Iklim"]
        ],
        alurFlow: "🌦️ CUACA — apa yang terjadi sekarang? → 🌧️ MUSIM — keadaan cuaca apa yang berulang selama beberapa bulan? → 🌍 IKLIM — bagaimana gambaran umum cuaca dalam jangka panjang?"
      },
      {
        subJudul: "🌍 Mengapa Indonesia beriklim tropis?",
        tipe: "konsep",
        paragraf: [
          "Indonesia berada di wilayah tropis, dekat garis khatulistiwa, sehingga menerima sinar Matahari sepanjang tahun dengan perubahan yang tidak seekstrem wilayah yang jauh dari khatulistiwa. Akibatnya Indonesia umumnya memiliki suhu yang relatif hangat sepanjang tahun, kelembapan udara yang cukup tinggi, curah hujan yang cukup tinggi di banyak wilayah, serta kondisi yang mendukung beragam tumbuhan dan hewan. Karena itu kita tidak mengalami musim dingin bersalju seperti di negara yang jauh dari khatulistiwa."
        ]
      },
      {
        subJudul: "🌳 Apa hubungan iklim dengan kehidupan?",
        tipe: "konsep",
        paragraf: [
          "Iklim bukan hanya sesuatu yang terjadi “di langit”. Iklim berhubungan dengan air, tanah, tumbuhan, hewan, dan kehidupan manusia.",
          "Di Aceh kita menemukan hutan, sawah, kebun, sungai, dan pesisir beserta berbagai makhluk hidup di dalamnya. Semuanya saling berhubungan dengan kondisi lingkungan dan iklim."
        ],
        alurFlow: "IKLIM TROPIS → suhu hangat + sinar Matahari + curah hujan relatif tinggi → mendukung PERTUMBUHAN TUMBUHAN → menyediakan makanan dan tempat hidup → mendukung KEANEKARAGAMAN HAYATI"
      },
      {
        subJudul: "Tanda-tanda musim yang mulai berubah",
        tipe: "penutup",
        paragraf: [
          "Belakangan ini banyak warga merasakan hujan datang lebih awal atau justru terlambat, kemarau terasa lebih panjang, dan hujan turun sangat deras dalam waktu singkat. Petani dan nelayan biasanya paling dahulu merasakannya karena pekerjaan mereka bergantung pada waktu datangnya musim hujan dan musim kemarau. Perubahan inilah yang akan kita pelajari lebih jauh pada materi berikutnya."
        ]
      }
    ],
    tanggapan: [
      {
        id_tanggapan: "tanggapan-materi1-penasaran",
        target_id_materi: "materi-1",
        jenis_tanggapan: "penasaran",
        wajib: true,
        judul: "💭 Apa yang Membuatmu Penasaran?",
        stimulus: "Setelah membaca dan mengamati materi tentang cuaca, iklim, dan musim ini, adakah hal yang membuatmu penasaran? Tuliskan pertanyaan yang ingin kamu ketahui jawabannya.",
        tipe_input: "textarea",
        placeholder: "Aku penasaran, mengapa...",
        panduanKata: [
          "Mengapa ...?",
          "Bagaimana ...?",
          "Apa yang terjadi jika ...?",
          "Apa hubungan antara ... dan ...?",
          "Bagaimana jika keadaan ini terus berlangsung?"
        ]
      }
    ],
    keterampilan: {
      id_keterampilan_card: "keterampilan-materi-1",
      topik: "Materi 1: Cuaca, Iklim, dan Musim",
      prompt: "Setelah membaca materi ini, ide kreatif apa yang ingin kamu lakukan untuk membantu menjaga lingkungan ketika cuaca atau musim berubah?",
      ariaLabel: "Ide kreatif pro-lingkungan untuk materi 1"
    }
  },

  {
    id_materi: "materi-2",
    nomor: 2,
    judul: "Atmosfer, Efek Rumah Kaca, dan Pemanasan Global",
    ikon: "🌡️",
    tag: "Materi 2",
    ringkasan: "Memahami peran atmosfer sebagai selimut pelindung Bumi, mekanisme alami efek rumah kaca, dan bagaimana peningkatan emisi memicu pemanasan global.",
    sections: [
      {
        subJudul: "Ayo mengamati: mengapa terasa berbeda?",
        tipe: "narasi",
        paragraf: [
          "Siang itu Aisyah dan Hasan pulang sekolah di sebuah gampong di Pidie. Matahari bersinar terik. Ketika melewati halaman terbuka yang hampir tidak berpohon, Aisyah berkata, <em>“Panas sekali di sini!”</em> Beberapa langkah kemudian mereka berhenti di bawah pohon rindang. <em>“Di sini terasa lebih sejuk,”</em> kata Hasan.",
          "Dalam perjalanan pulang mereka melihat sepeda motor dan mobil berlalu-lalang. Di kejauhan, beberapa rumah menggunakan pendingin ruangan dan berbagai peralatan listrik. Aisyah pun bertanya, <em>“Apakah panas yang kita rasakan hanya berasal dari Matahari?”</em>",
          "Pertanyaan itu membawa kita memahami Matahari, atmosfer, efek rumah kaca, aktivitas manusia, dan pemanasan global — yang ternyata semuanya saling berhubungan."
        ]
      },
      {
        subJudul: "Atmosfer: selimut udara Bumi",
        tipe: "konsep",
        paragraf: [
          "Coba tarik napas perlahan. Udara yang kamu hirup adalah bagian dari lapisan udara yang menyelimuti Bumi. <strong>Lapisan gas yang mengelilingi Bumi disebut atmosfer.</strong> Bayangkan Bumi sebagai rumah besar dan atmosfer sebagai selimut pelindung yang menyelimutinya. Kita tidak dapat melihat seluruh atmosfer dengan mata, tetapi keberadaannya sangat penting bagi kehidupan.",
          "Atmosfer mengandung berbagai gas. Sebagian besar berupa nitrogen dan oksigen, disertai gas lain dalam jumlah lebih sedikit seperti karbon dioksida dan uap air. Atmosfer membantu:",
        ],
        itemDaftar: [
          "menyediakan udara yang dibutuhkan makhluk hidup;",
          "melindungi kehidupan dari sebagian radiasi berbahaya Matahari;",
          "menjadi tempat terjadinya berbagai peristiwa cuaca;",
          "membantu menjaga suhu Bumi agar mendukung kehidupan."
        ],
        paragrafSetelah: [
          "Tanpa atmosfer, kondisi Bumi akan sangat berbeda dari yang kita kenal sekarang."
        ],
        note: {
          judul: "🧠 Ayo Hubungkan",
          stimulus: "ATMOSFER → UDARA → MANUSIA, HEWAN, DAN TUMBUHAN",
          isi: "Artinya, udara bukan sesuatu yang terpisah dari kehidupan kita. Kita hidup <em>di dalam</em> sistem atmosfer Bumi."
        }
      },
      {
        subJudul: "Matahari menghangatkan Bumi",
        tipe: "konsep",
        paragraf: [
          "Dari manakah sebagian besar energi yang menghangatkan permukaan Bumi berasal? Jawabannya adalah <strong>Matahari</strong>. Energi Matahari bergerak menuju Bumi. Sebagian dipantulkan kembali, sebagian lainnya diserap daratan dan lautan sehingga permukaan Bumi menjadi hangat. Permukaan yang telah menerima energi itu kemudian melepaskan kembali sebagian energinya sebagai panas.",
          "Tetapi tidak semua panas langsung lepas ke luar angkasa. Di sinilah atmosfer punya peran penting."
        ],
        alurFlow: "☀️ Matahari → energi mencapai Bumi → permukaan Bumi menjadi hangat → sebagian panas dilepaskan kembali"
      },
      {
        tipe: "gambar",
        src: "assets/efek_rumah_kaca.jpg",
        alt: "Infografis efek rumah kaca: energi Matahari mencapai Bumi, permukaan menyerap lalu melepaskan panas, gas rumah kaca menahan sebagian panas tersebut, sehingga Bumi tetap cukup hangat untuk mendukung kehidupan.",
        caption: "<strong>Bagaimana efek rumah kaca terjadi?</strong> Suhu Bumi yang hangat dan nyaman tidak terjadi begitu saja. Sinar dari Matahari menembus atmosfer dan sebagian besar energinya diserap oleh daratan serta lautan. Bumi yang menghangat kemudian melepaskan kembali sebagian energi ke angkasa sebagai panas. Namun, gas-gas di atmosfer menahan sebagian panas tersebut dan memantulkannya kembali. Inilah efek rumah kaca alami yang terus menjaga suhu planet kita agar tetap ideal bagi kehidupan semua makhluk hidup — karena itu, mari kita jaga Bumi bersama-sama agar tidak terlalu panas!"
      },
      {
        subJudul: "Efek rumah kaca: mengapa sebagian panas dipertahankan?",
        tipe: "konsep",
        paragraf: [
          "Di dalam atmosfer terdapat beberapa gas yang dapat menahan sebagian panas yang dilepaskan Bumi. Gas-gas itu disebut <strong>gas rumah kaca</strong>, contohnya <strong>karbon dioksida (CO₂)</strong>, <strong>metana (CH₄)</strong>, dan <strong>uap air</strong>. Proses ketika gas-gas di atmosfer menahan sebagian panas sehingga Bumi tetap hangat disebut <strong>efek rumah kaca</strong>.",
          "Yang sangat penting dipahami: <strong>efek rumah kaca sebenarnya proses alami dan dibutuhkan oleh kehidupan di Bumi.</strong> Tanpa efek rumah kaca alami, Bumi akan jauh lebih dingin. Jadi efek rumah kaca bukanlah sesuatu yang selalu buruk. Masalah muncul ketika jumlah beberapa gas rumah kaca di atmosfer meningkat karena aktivitas manusia sehingga lebih banyak panas tertahan."
        ],
        alurFlow: "1. ☀️ Energi Matahari mencapai Bumi → 2. 🌍 Permukaan Bumi menyerap sebagian energi dan menjadi hangat → 3. ♨️ Bumi melepaskan kembali sebagian energi sebagai panas → 4. 🌫️ Gas rumah kaca menahan sebagian panas tersebut → 5. 🌍 Bumi tetap cukup hangat untuk mendukung kehidupan"
      },
      {
        subJudul: "Bayangkan dua selimut",
        tipe: "narasi",
        paragraf: [
          "Bayangkan kamu tidur pada malam yang sejuk. Dengan satu selimut, tubuhmu terasa hangat dan nyaman. Bagaimana jika kamu memakai banyak selimut tebal sekaligus? Tubuhmu mungkin menjadi terlalu panas. Atmosfer memang tidak benar-benar sama dengan selimut, tetapi perumpamaan ini membantu kita memahami bahwa perubahan jumlah gas rumah kaca dapat memengaruhi banyaknya panas yang tertahan dalam sistem Bumi."
        ],
        alurKomparasi: [
          { label: "Kondisi alami", alur: "gas rumah kaca dalam jumlah alami → sebagian panas tertahan → Bumi cukup hangat" },
          { label: "Ketika gas rumah kaca meningkat", alur: "lebih banyak gas rumah kaca tertentu → lebih banyak panas tertahan → suhu rata-rata Bumi meningkat" }
        ],
        note: {
          judul: "🧠 Ayo Berpikir",
          stimulus: "Bandingkan keadaan ketika jumlah gas rumah kaca lebih sedikit dan ketika jumlahnya meningkat. Apa yang terjadi terhadap panas yang dapat keluar ke luar angkasa ketika jumlah gas rumah kaca bertambah?"
        }
      },
      {
        subJudul: "Dari mana tambahan gas rumah kaca berasal?",
        tipe: "konsep",
        paragraf: [
          "Gas rumah kaca dapat berasal dari proses alami. Namun aktivitas manusia juga dapat menambah jumlah beberapa gas rumah kaca di atmosfer. Mari fokus pada tiga aktivitas yang dekat dengan kehidupan kita:",
          "<strong>1. Menggunakan kendaraan bermotor.</strong> Setiap pagi banyak kendaraan digunakan untuk pergi ke sekolah, pasar, atau kantor. Kendaraan berbahan bakar bensin atau solar membakar bahan bakar, dan pembakaran itu menghasilkan karbon dioksida. <em>(Kendaraan → bahan bakar dibakar → CO₂ dilepaskan → CO₂ di atmosfer bertambah)</em>",
          "<strong>2. Menggunakan listrik.</strong> Di rumah dan sekolah kita memakai listrik untuk lampu, kipas, televisi, pendingin ruangan, dan komputer. Sebagian listrik masih dihasilkan dari pembangkit yang membakar bahan bakar fosil. <em>(Pemakaian listrik → kebutuhan energi → jika dari bahan bakar fosil → menghasilkan CO₂)</em>",
          "<strong>3. Berkurangnya pepohonan.</strong> Tumbuhan membutuhkan CO₂ untuk berfotosintesis. Ketika pepohonan berkurang, kemampuan lingkungan menyerap sebagian CO₂ melalui tumbuhan juga ikut berkurang.",
          "Kita mulai melihat sebuah hubungan: <strong>energi + kendaraan + tumbuhan + atmosfer + suhu Bumi</strong> semuanya bagian dari satu sistem yang saling memengaruhi."
        ]
      },
      {
        subJudul: "Apa itu pemanasan global?",
        tipe: "konsep",
        paragraf: [
          "Jika konsentrasi gas rumah kaca meningkat, lebih banyak panas tertahan dalam sistem Bumi. Dalam jangka panjang, hal itu menyebabkan peningkatan suhu rata-rata permukaan Bumi. Inilah yang disebut pemanasan global.",
          "🌡️ <strong>Pemanasan global adalah peningkatan suhu rata-rata Bumi dalam jangka panjang, terutama akibat meningkatnya gas rumah kaca dari aktivitas manusia.</strong>"
        ],
        alurFlow: "Aktivitas manusia → emisi gas rumah kaca meningkat → lebih banyak panas tertahan → suhu rata-rata Bumi meningkat → pemanasan global"
      },
      {
        subJudul: "Jangan sampai keliru!",
        tipe: "miskonsepsi",
        item: [
          {
            salah: "Hari ini sangat panas, berarti ini pasti pemanasan global.",
            benar: "Belum tentu. Hari yang panas adalah bagian dari cuaca. Pemanasan global diamati dari perubahan suhu rata-rata Bumi dalam jangka panjang."
          },
          {
            salah: "Efek rumah kaca harus dihilangkan.",
            benar: "Tidak tepat. Efek rumah kaca alami justru diperlukan agar suhu Bumi mendukung kehidupan. Masalahnya adalah menguatnya efek rumah kaca akibat aktivitas manusia."
          },
          {
            salah: "Karbon dioksida selalu buruk.",
            benar: "Tidak tepat. CO₂ adalah bagian alami atmosfer dan dibutuhkan tumbuhan untuk fotosintesis. Masalah timbul saat jumlahnya berlebihan."
          }
        ]
      },
      {
        subJudul: "Hubungan pemanasan global dengan perubahan iklim",
        tipe: "penutup",
        paragraf: [
          "Ketika suhu rata-rata Bumi naik, pola cuaca dan musim di berbagai wilayah ikut bergeser: hujan menjadi sulit diprediksi, kemarau memanjang, dan hujan ekstrem lebih sering terjadi. Pemanasan global adalah kenaikan suhunya, sedangkan <strong>perubahan iklim</strong> adalah perubahan pola cuaca jangka panjang yang mengikutinya."
        ]
      }
    ],
    tanggapan: [
      {
        id_tanggapan: "tanggapan-materi2-penasaran",
        target_id_materi: "materi-2",
        jenis_tanggapan: "penasaran",
        wajib: true,
        judul: "💭 Apa yang Membuatmu Penasaran?",
        stimulus: "Setelah membaca dan mengamati materi tentang efek rumah kaca dan pemanasan global ini, adakah hal yang membuatmu penasaran? Tuliskan pertanyaan yang ingin kamu ketahui jawabannya.",
        tipe_input: "textarea",
        placeholder: "Aku penasaran, mengapa...",
        panduanKata: [
          "Mengapa ...?",
          "Bagaimana ...?",
          "Apa yang terjadi jika ...?",
          "Apa hubungan antara ... dan ...?",
          "Bagaimana jika keadaan ini terus berlangsung?"
        ]
      }
    ],
    keterampilan: {
      id_keterampilan_card: "keterampilan-materi-2",
      topik: "Materi 2: Atmosfer, Efek Rumah Kaca, dan Pemanasan Global",
      prompt: "Setelah membaca materi ini, ide kreatif apa yang dapat kamu lakukan untuk membantu mengurangi peningkatan gas rumah kaca?",
      ariaLabel: "Ide kreatif pro-lingkungan untuk materi 2"
    }
  },

  {
    id_materi: "materi-3",
    nomor: 3,
    judul: "Penyebab Perubahan Iklim",
    ikon: "🏭",
    tag: "Materi 3",
    ringkasan: "Menelusuri keterkaitan pembakaran bahan bakar fosil, deforestasi, serta sampah dan pola konsumsi kita terhadap peningkatan gas rumah kaca dan jejak karbon.",
    sections: [
      {
        subJudul: "Ayo mengamati: dari mana asap itu berasal?",
        tipe: "narasi",
        paragraf: [
          "Pagi hari di sebuah gampong di Pidie, Aisyah berangkat ke sekolah bersama ayahnya. Di jalan banyak sepeda motor dan mobil berlalu-lalang, dan ia melihat asap keluar dari beberapa kendaraan. Sesampainya di sekolah, lampu kelas masih menyala meskipun cahaya Matahari sudah cukup terang. Saat istirahat, ia melihat sampah plastik dan daun kering dibakar di belakang rumah dekat sekolah.",
          "Aisyah pun bertanya, <em>“Apa hubungan kendaraan, listrik, pembakaran sampah, dan pohon dengan perubahan iklim?”</em> Sekilas hal-hal itu terlihat berbeda. Namun jika kita mengikuti ke mana energi digunakan, apa yang dilepaskan ke udara, dan apa yang terjadi setelahnya, ternyata semuanya saling berhubungan."
        ]
      },
      {
        subJudul: "Ingat kembali: mengapa Bumi bisa menjadi lebih hangat?",
        tipe: "konsep",
        paragraf: [
          "Bumi menerima energi dari Matahari. Sebagian diserap permukaan Bumi sehingga daratan dan lautan menjadi hangat, lalu sebagian energi itu dilepaskan kembali sebagai panas. Di atmosfer terdapat gas rumah kaca seperti karbon dioksida dan metana yang menahan sebagian panas tersebut.",
          "🌍 <strong>Perubahan iklim adalah perubahan jangka panjang pada pola iklim Bumi atau suatu wilayah.</strong>",
          "Perubahan iklim dapat terjadi karena <strong>faktor alami</strong>, misalnya letusan gunung api dan siklus alami Bumi. Namun perubahan iklim yang berlangsung cepat saat ini terutama disebabkan oleh aktivitas manusia yang meningkatkan gas rumah kaca."
        ],
        alurFlow: "Aktivitas manusia → gas rumah kaca tertentu meningkat → lebih banyak panas tertahan dalam sistem Bumi → suhu rata-rata Bumi meningkat → sistem iklim berubah"
      },
      {
        tipe: "gambar",
        src: "assets/perubahan_iklim.jpg",
        alt: "Infografis penyebab perubahan iklim: peningkatan gas rumah kaca akibat aktivitas manusia, lebih banyak panas yang tertahan di atmosfer, memicu pemanasan global (suhu Bumi meningkat), hingga menyebabkan sistem iklim berubah dan memicu berbagai bencana alam.",
        caption: "<strong>Kenapa iklim Bumi kita berubah?</strong> Perubahan iklim tidak terjadi tanpa sebab. Aktivitas manusia seperti polusi pabrik, asap kendaraan, dan penebangan hutan membuat jumlah gas rumah kaca di atmosfer meningkat pesat. Gas-gas yang semakin tebal ini bertindak seperti selimut ekstra, menahan hampir semua panas dari Bumi dan tidak membiarkannya lepas ke luar angkasa, sehingga memicu pemanasan global atau naiknya suhu Bumi secara drastis. Akibatnya, sistem iklim pun berubah dan menjadi kacau—menyebabkan es kutub mencair, banjir, kekeringan parah, hingga bencana alam lainnya yang mengancam kehidupan kita."
      },
      {
        subJudul: "🔥 Penyebab 1 — Pembakaran bahan bakar fosil",
        tipe: "konsep",
        paragraf: [
          "Sepeda motor dan mobil membutuhkan energi untuk bergerak, dan banyak di antaranya menggunakan bensin atau solar yang berasal dari <strong>bahan bakar fosil</strong>. Ketika bahan bakar itu dibakar di dalam mesin, dihasilkan energi untuk bergerak — tetapi pembakaran itu juga melepaskan karbon dioksida ke atmosfer.",
          "<strong>Apakah listrik juga berhubungan?</strong> Lampu, kipas, pendingin ruangan, televisi, dan komputer di kelas semuanya menggunakan listrik. Menyalakan lampu tidak langsung menghasilkan CO₂ di kelas, tetapi sebagian besar listrik masih dihasilkan pembangkit yang membakar bahan bakar fosil.",
          "Karena itu, membiarkan lampu atau alat listrik menyala ketika tidak diperlukan berarti membuang energi."
        ],
        alurFlow: "Bahan bakar fosil dibakar → 🏍️ energi gerak / 💡 listrik + 🌫️ CO₂ dilepaskan → konsentrasi gas rumah kaca meningkat",
        note: {
          judul: "🧠 Ayo Mengambil Keputusan",
          stimulus: "Pukul 10 pagi ruang kelas sudah terang karena cahaya Matahari masuk lewat jendela, tetapi semua lampu masih menyala. Apa yang sebaiknya dilakukan?",
          isi: "Bukan sekadar <em>“matikan lampu karena guru menyuruh”</em>, melainkan memahami alasannya: hemat listrik → mengurangi energi yang terbuang → membantu mengurangi kebutuhan energi dari bahan bakar fosil → membantu mengurangi emisi gas rumah kaca. Inilah tindakan berdasarkan <strong>ecoliteracy</strong>."
        }
      },
      {
        subJudul: "🌳 Penyebab 2 — Berkurangnya hutan dan pepohonan",
        tipe: "konsep",
        paragraf: [
          "Pohon memberikan keteduhan, menjadi tempat hidup berbagai makhluk, membantu menjaga tanah, dan menyerap CO₂ dari udara saat berfotosintesis. Karbon tersebut tersimpan dalam jaringan tumbuhan selama ia hidup.",
          "Ketika sebuah kawasan hutan ditebang, timbul dua dampak sekaligus:",
        ],
        itemDaftar: [
          "<strong>Penyerap CO₂ berkurang</strong> — kemampuan vegetasi menyerap karbon dioksida ikut hilang.",
          "<strong>Karbon tersimpan dapat dilepaskan kembali</strong> — jika kayu ditebang lalu dibakar atau membusuk, sebagian karbon di dalamnya kembali ke atmosfer."
        ]
      },
      {
        subJudul: "Hutan bukan hanya tentang karbon",
        tipe: "konsep",
        paragraf: [
          "Jika pepohonan hilang, bukan hanya CO₂ yang terpengaruh. Pepohonan juga berhubungan dengan air, tanah, habitat hewan, suhu lingkungan, siklus air, dan kehidupan manusia. Pohon adalah bagian dari suatu sistem kehidupan."
        ],
        alurFlow: "Pohon berkurang → keteduhan berkurang + habitat berkurang + kondisi tanah berubah → memengaruhi air, makhluk hidup, dan manusia"
      },
      {
        subJudul: "🗑️ Penyebab 3 — Sampah dan pola konsumsi kita",
        tipe: "konsep",
        paragraf: [
          "Sampah tidak menghilang begitu saja setelah dibuang. Sampah harus dikumpulkan, diangkut, dipilah, didaur ulang, atau dibuang — dan semua proses itu membutuhkan energi. Sisa makanan dan bahan organik yang menumpuk tanpa pengelolaan yang tepat juga menghasilkan <strong>metana (CH₄)</strong>, salah satu gas rumah kaca yang kuat. Membakar sampah dan daun kering di halaman pun melepaskan gas rumah kaca sekaligus mengotori udara.",
          "Karena itu masalahnya bukan hanya di mana kita membuang sampah, melainkan: <em>mengapa sampah itu terbentuk?</em>"
        ]
      },
      {
        subJudul: "Membeli → menggunakan → membuang",
        tipe: "narasi",
        paragraf: [
          "Bayangkan sebuah botol minuman sekali pakai. Sebelum sampai ke tangan kita, botol itu telah melalui perjalanan panjang: bahan baku diambil → dibuat di pabrik → diangkut truk → dijual di toko → digunakan → menjadi sampah.",
          "<strong>Masalah lingkungan tidak hanya dimulai ketika kita membuang barang. Masalah dapat dimulai sejak kita memutuskan untuk mengambil, membeli, dan menggunakan sesuatu.</strong>"
        ]
      },
      {
        subJudul: "Kasus dekat dengan kita: buku tulis yang masih tersisa",
        tipe: "narasi",
        paragraf: [
          "Semester baru akan dimulai. Buku tulis Aisyah dari semester sebelumnya masih memiliki banyak halaman kosong. Temannya berkata bahwa semester baru harus serba baru. Aisyah punya dua pilihan: Pilihan A membeli buku baru, atau Pilihan B melanjutkan menggunakan halaman kosong buku lama.",
          "Ikuti perjalanan kertasnya: Pohon → pabrik kertas → pengemasan → pengangkutan → buku → siswa. Semua proses itu butuh energi. <strong>Menggunakan barang sampai manfaatnya benar-benar selesai adalah salah satu bentuk perilaku ramah lingkungan.</strong>"
        ]
      },
      {
        subJudul: "Bagaimana ketiga penyebab ini saling berhubungan?",
        tipe: "konsep",
        paragraf: [
          "Ketiga penyebab tadi saling menguatkan: bahan bakar fosil dibakar + hutan berkurang + konsumsi barang & sampah bertambah. Semuanya meningkatkan emisi gas rumah kaca. Jumlah emisi yang timbul akibat kegiatan sehari-hari kita disebut <strong>jejak karbon</strong>."
        ],
        alurFlow: "GAS RUMAH KACA MENINGKAT → lebih banyak panas tertahan dalam sistem Bumi → 🌡️ PEMANASAN GLOBAL → 🌍 SISTEM IKLIM BERUBAH"
      },
      {
        subJudul: "Apa hubungannya dengan Pidie?",
        tipe: "konsep",
        paragraf: [
          "Masyarakat Pidie bergantung pada berbagai sistem alam: hujan, air sumur dan irigasi, sawah pertanian, pepohonan, sungai, dan pesisir. Jika sistem iklim berubah, pola suhu dan hujan ikut berubah, lalu memengaruhi ketersediaan air, hasil panen, dan kehidupan masyarakat.",
          "Perubahan iklim dipahami bukan dari satu hari yang panas atau satu kali hujan deras, melainkan dengan melihat perubahan pola dalam jangka panjang."
        ]
      },
      {
        subJudul: "🌱 Kita bagian dari masalah atau bagian dari solusi?",
        tipe: "penutup",
        paragraf: [
          "Menjadi anak yang memiliki ecoliteracy bukan sekadar menghafalkan slogan <em>“kita harus hemat energi”</em>, melainkan mampu menjelaskan:",
        ],
        alurFlow: "Apa yang saya lakukan → sumber daya apa yang digunakan → apa akibatnya → siapa yang terdampak → adakah pilihan yang lebih baik?"
      }
    ],
    tanggapan: [
      {
        id_tanggapan: "tanggapan-materi3-penasaran",
        target_id_materi: "materi-3",
        jenis_tanggapan: "penasaran",
        wajib: true,
        judul: "💭 Apa yang Membuatmu Penasaran?",
        stimulus: "Setelah membaca dan mengamati materi tentang penyebab perubahan iklim ini, adakah hal yang membuatmu penasaran? Tuliskan pertanyaan yang ingin kamu ketahui jawabannya.",
        tipe_input: "textarea",
        placeholder: "Aku penasaran, mengapa...",
        panduanKata: [
          "Mengapa ...?",
          "Bagaimana ...?",
          "Apa yang terjadi jika ...?",
          "Apa hubungan antara ... dan ...?",
          "Bagaimana jika keadaan ini terus berlangsung?"
        ]
      }
    ],
    keterampilan: {
      id_keterampilan_card: "keterampilan-materi-3",
      topik: "Materi 3: Penyebab Perubahan Iklim",
      prompt: "Setelah membaca materi ini, ide kreatif apa yang ingin kamu lakukan untuk mengurangi salah satu penyebab perubahan iklim di sekitarmu?",
      ariaLabel: "Ide kreatif pro-lingkungan untuk materi 3"
    }
  },

  {
    id_materi: "materi-4",
    nomor: 4,
    judul: "Dampak Perubahan Iklim",
    ikon: "🌊",
    tag: "Materi 4",
    ringkasan: "Menganalisis dampak nyata perubahan iklim pada suhu, siklus air, pertanian dan pangan, keanekaragaman hayati, wilayah pesisir Aceh, serta aksi mitigasi dan adaptasi.",
    sections: [
      {
        subJudul: "Ayo mengamati: apa yang terjadi ketika iklim Bumi berubah?",
        tipe: "narasi",
        paragraf: [
          "Umar adalah siswa kelas V yang tinggal di Beureunuen, Kabupaten Pidie. Rumahnya tidak jauh dari persawahan. Suatu siang sepulang sekolah Matahari terasa sangat terik, dan Umar berhenti sejenak di bawah pohon rindang. Tidak jauh dari sana, ayahnya sedang memeriksa saluran air parit menuju sawah.",
          "<strong>Ayah:</strong> <em>“Ayah ingin memastikan air untuk sawah cukup. Padi membutuhkan air untuk tumbuh. Kalau hujan terlalu lama tidak turun, air bisa berkurang. Tetapi kalau hujan sangat deras, air yang terlalu banyak juga dapat menimbulkan masalah.”</em>",
          "Umar pun bertanya: <em>“Jika panas, hujan, dan ketersediaan air berubah dalam waktu yang lama, apa yang akan terjadi pada sawah, tumbuhan, hewan, dan kehidupan masyarakat?”</em>"
        ]
      },
      {
        subJudul: "Apa yang dimaksud dengan dampak perubahan iklim?",
        tipe: "konsep",
        paragraf: [
          "<strong>Dampak perubahan iklim adalah berbagai akibat yang terjadi pada alam dan kehidupan karena perubahan sistem iklim dalam jangka panjang.</strong> Perubahan iklim dapat memengaruhi suhu, pola hujan, air, laut, tanah, tumbuhan, hewan, dan kehidupan manusia. Namun dampaknya tidak selalu sama di setiap tempat."
        ]
      },
      {
        tipe: "gambar",
        src: "assets/dampak_perubahan_iklim.jpg",
        alt: "Infografis dampak perubahan iklim pada ketersediaan air: suhu yang meningkat menyebabkan penguapan air lebih tinggi, tanah kehilangan air lebih cepat dan menjadi kering, sehingga tumbuhan membutuhkan lebih banyak ekstra air dan secara keseluruhan kebutuhan air bersih bertambah drastis.",
        caption: "<strong>Apa dampak perubahan iklim bagi ketersediaan air kita?</strong> Saat suhu Bumi terus meningkat, laju penguapan air dari daratan, danau, dan sungai ikut melonjak tajam. Hal ini menyebabkan tanah kehilangan kelembapannya jauh lebih cepat hingga mengering. Akibatnya, tanaman pertanian membutuhkan lebih banyak air untuk bisa bertahan hidup. Pada akhirnya, kebutuhan air bersih bertambah secara keseluruhan di saat persediaannya justru semakin sulit didapat. Mari berhemat air dan lakukan langkah kecil untuk mengerem laju perubahan iklim sebelum kekeringan semakin parah!"
      },
      {
        subJudul: "☀️ Dampak 1 — Suhu yang semakin panas",
        tipe: "konsep",
        paragraf: [
          "Perubahan iklim menyebabkan suhu rata-rata Bumi meningkat dan membuat kejadian panas ekstrem lebih sering terjadi. Panas tidak hanya membuat manusia berkeringat, tetapi juga mempercepat penguapan air di tanah dan tanaman."
        ],
        alurFlow: "🌡️ Suhu meningkat → 💨 penguapan air meningkat → 🌱 tanah kehilangan air lebih cepat → 🌾 tumbuhan butuh lebih banyak air → 💧 kebutuhan air bertambah"
      },
      {
        subJudul: "🌳 Mengapa Umar merasa lebih sejuk di bawah pohon?",
        tipe: "konsep",
        paragraf: [
          "Pohon memberikan keteduhan sehingga tanah di bawahnya menerima lebih sedikit sinar Matahari langsung. Tumbuhan juga melepaskan uap air melalui proses <strong>transpirasi</strong> yang membantu mendinginkan udara sekitar."
        ],
        note: {
          
          judul: "🧠 Ayo Berpikir",
          stimulus: "Sekolah Umar ingin memperluas tempat parkir dengan menebang beberapa pohon. Apakah keputusan itu hanya berpengaruh pada tempat parkir? <em>Tidak.</em>",
          isi: "Pohon berkurang → keteduhan berkurang → suhu sekitar meningkat → kenyamanan siswa berubah. Pohon juga berhubungan dengan karbon, air, tanah, dan tempat hidup makhluk lain. Inilah cara berpikir <strong>ecoliteracy</strong>: melihat satu keputusan sebagai bagian dari sistem yang lebih besar."
        }
      },
      {
        subJudul: "🌧️ Dampak 2 — Perubahan pola hujan dan ketersediaan air",
        tipe: "konsep",
        paragraf: [
          "Perubahan iklim bukan sekadar membuat hujan bertambah atau berkurang, melainkan dapat mengubah pola air yang kita andalkan: periode kering bisa lebih panjang di suatu tempat, sedangkan di tempat lain hujan ekstrem menjadi lebih sering.",
          "Bila hujan jarang dalam waktu lama terjadi <strong>kekeringan</strong>. Sebaliknya bila hujan lebat turun di kawasan yang paritnya tertutup sampah dan tanahnya tertutup beton, genangan air dan banjir lebih mudah terbentuk."
        ]
      },
      {
        subJudul: "🌾 Dampak 3 — Sawah, pangan, dan kehidupan masyarakat",
        tipe: "konsep",
        paragraf: [
          "Padi membutuhkan sinar Matahari, air, tanah, dan suhu yang sesuai. Jika pola suhu dan hujan berubah, hasil panen terpengaruh. Dampaknya menjalar: petani → hasil panen → pasar pangan → makanan keluarga."
        ]
      },
      {
        subJudul: "🐟 Dampak 4 — Tumbuhan dan hewan juga terpengaruh",
        tipe: "konsep",
        paragraf: [
          "Setiap makhluk hidup membutuhkan air, makanan, suhu, dan tempat hidup yang sesuai. Jika kondisi lingkungan berubah terlalu cepat, sebagian hewan dan tumbuhan kesulitan beradaptasi atau kehilangan habitatnya."
        ]
      },
      {
        subJudul: "🌊 Dampak 5 — Laut dan pesisir Aceh",
        tipe: "konsep",
        paragraf: [
          "Saat suhu Bumi meningkat, air laut memuai dan es daratan mencair, menyebabkan kenaikan permukaan laut. Ekosistem <strong>mangrove</strong> di pesisir Aceh menjadi sangat penting karena melindungi pantai dari abrasi gelombang, menjadi tempat hidup ikan, serta menyerap dan menyimpan karbon."
        ]
      },
      {
        subJudul: "Apakah semua orang mengalami dampak yang sama?",
        tipe: "konsep",
        paragraf: [
          "Tidak semua orang memiliki sumber daya yang sama untuk menghadapi bencana atau cuaca ekstrem. Di sinilah pentingnya kepedulian dan keadilan sosial. Dalam masyarakat Aceh terdapat nilai kebersamaan yang disebut <em>meuseuraya</em> (gotong royong), yang dapat kita terapkan saat merawat lingkungan dan membantu sesama."
        ]
      },
      {
        subJudul: "Dari dampak menuju tindakan: Mitigasi vs Adaptasi",
        tipe: "konsep",
        paragraf: [
          "🌱 <strong>1. MITIGASI — mengurangi penyebab.</strong> Tindakan untuk mengurangi emisi gas rumah kaca, seperti hemat listrik, merawat pohon, dan mengurangi sampah.",
          "🛡️ <strong>2. ADAPTASI — menghadapi dampak.</strong> Tindakan menyesuaikan diri agar risiko berkurang, seperti menjaga saluran air bersih, menanam pohon peneduh, dan menggunakan air secara bijak."
        ],
        alurFlow: "MITIGASI → kurangi penyebabnya &nbsp;•&nbsp; ADAPTASI → kurangi dampaknya &nbsp;•&nbsp; keduanya diperlukan",
        note: {
          judul: "🧠 Tantangan Umar: apa yang harus dilakukan sekolah?",
          stimulus: "Ketika hari sangat panas, halaman sekolah terasa terik karena hanya memiliki sedikit pohon. Ketika hujan sangat deras, beberapa bagian halaman tergenang. Sekolah mempunyai dana terbatas dan hanya dapat memilih <strong>dua tindakan</strong> terlebih dahulu.",
          opsi: [
            "A. 🌳 Menanam dan merawat pohon peneduh.",
            "B. 🌧️ Membersihkan dan memperbaiki saluran air.",
            "C. 🧱 Menutup seluruh halaman dengan beton.",
            "D. 💡 Menambah lampu agar sekolah terlihat lebih terang pada siang hari.",
            "E. 💧 Membuat program hemat air dan energi."
          ],
          isi: "Jangan hanya menjawab <em>“saya memilih A dan B karena baik”</em>. Gunakan cara berpikir ini: 👀 <strong>AMATI</strong> apa masalahnya → 🔗 <strong>HUBUNGKAN</strong> apa penyebabnya dan bagian lingkungan apa yang saling memengaruhi → 🔮 <strong>PREDIKSI</strong> apa akibat setiap pilihan → ❤️ <strong>PEDULI</strong> siapa yang mendapat manfaat atau terdampak → 🌱 <strong>PUTUSKAN</strong> pilihan mana yang bermanfaat bagi manusia sekaligus lingkungan."
        }
      }
    ],
    tanggapan: [
      {
        id_tanggapan: "tanggapan-materi4-penasaran",
        target_id_materi: "materi-4",
        jenis_tanggapan: "penasaran",
        wajib: true,
        judul: "💭 Apa yang Membuatmu Penasaran?",
        stimulus: "Setelah membaca dan mengamati materi tentang dampak perubahan iklim ini, adakah hal yang membuatmu penasaran? Tuliskan pertanyaan yang ingin kamu ketahui jawabannya.",
        tipe_input: "textarea",
        placeholder: "Aku penasaran, mengapa...",
        panduanKata: [
          "Mengapa ...?",
          "Bagaimana ...?",
          "Apa yang terjadi jika ...?",
          "Apa hubungan antara ... dan ...?",
          "Bagaimana jika keadaan ini terus berlangsung?"
        ]
      }
    ],
    keterampilan: {
      id_keterampilan_card: "keterampilan-materi-4",
      topik: "Materi 4: Dampak Perubahan Iklim",
      prompt: "Setelah membaca materi ini, ide kreatif apa yang ingin kamu lakukan untuk membantu lingkungan atau warga menghadapi dampak perubahan iklim?",
      ariaLabel: "Ide kreatif pro-lingkungan untuk materi 4"
    }
  },

  {
    id_materi: "materi-5",
    nomor: 5,
    judul: "Tindakan Ramah Lingkungan",
    ikon: "♻️",
    tag: "Materi 5",
    ringkasan: "Mengubah pengetahuan ecoliteracy menjadi aksi nyata bertanggung jawab: bijak memanfaatkan kertas, energi, air, pengelolaan sampah, dan perlindungan ekosistem.",
    sections: [
      {
        subJudul: "Pengantar: Buku IPAS Umar",
        tipe: "narasi",
        paragraf: [
          "Malam sebelum semester baru, Umar membuka buku IPAS-nya dan menemukan hampir setengah halamannya masih kosong. Ayah menawarkan membelikan buku baru. Umar pun berpikir: <em>apakah semester baru selalu berarti semua perlengkapan harus baru?</em> Dari satu pertanyaan kecil itu, Umar mulai menyadari bahwa banyak keputusan hariannya ternyata berhubungan dengan lingkungan."
        ]
      },
      {
        subJudul: "Perjalanan selembar kertas",
        tipe: "konsep",
        paragraf: [
          "Kertas tidak muncul begitu saja di toko. Menghemat kertas bukan berarti kita dilarang memakai kertas — kita tetap membutuhkan buku untuk belajar. Yang perlu kita biasakan adalah menggunakannya secara bijak dan tidak mengambil lebih banyak daripada yang diperlukan. <strong>Gunakan yang masih bisa digunakan sebelum mengambil yang baru.</strong>"
        ],
        alurFlow: "Pohon / serat kayu → diolah dengan air dan energi → kertas → buku → digunakan → digunakan kembali / didaur ulang / sampah"
      },
      {
        subJudul: "Empat pertanyaan sebelum memutuskan",
        tipe: "daftar",
        itemDaftar: [
          "Apakah aku benar-benar membutuhkannya?",
          "Apakah barang yang lama masih dapat digunakan?",
          "Apakah ada pilihan yang menggunakan lebih sedikit sumber daya?",
          "Apa akibat pilihanku bagi lingkungan?"
        ]
      },
      
      {
        tipe: "gambar",
        src: "assets/tindakan_ramah_lingkungan.jpg",
        alt: "Infografis cara bijak peduli lingkungan yang menampilkan empat panduan praktis: bijak menggunakan kertas dengan memanfaatkannya secara hemat, bijak menggunakan listrik dengan mematikan saklar di ruangan kosong, bijak menggunakan air dengan menutup keran saat sikat gigi, dan bijak mengonsumsi barang dengan merawat barang lama yang masih layak pakai.",
        caption: "<strong>Bagaimana cara bijak peduli lingkungan?</strong> Menjaga Bumi tidak berarti kita harus berhenti total menggunakan segala fasilitas yang ada. Kita hanya perlu menggunakannya dengan hemat dan penuh tanggung jawab! Alih-alih melarang penggunaan kertas, listrik, atau air sepenuhnya, mulailah dengan langkah-langkah kecil yang masuk akal: gunakan kertas secara hemat, matikan kipas dan lampu di ruangan yang kosong, tutup keran saat menggosok gigi, dan belilah barang baru hanya jika benar-benar dibutuhkan. Aksi ramah lingkungan ini sangat mudah dilakukan. Yuk, lakukan aksi nyata ini dari rumah kita sendiri!"
      },

      {
        subJudul: "Ramah lingkungan BUKAN berarti...",
        tipe: "miskonsepsi",
        item: [
          { salah: "Tidak boleh menggunakan kertas sama sekali", benar: "Gunakan kertas secara hemat, manfaatkan kedua sisi, dan rawat buku." },
          { salah: "Tidak boleh menggunakan listrik", benar: "Gunakan listrik sesuai kebutuhan, matikan kipas dan lampu di ruangan kosong." },
          { salah: "Tidak boleh menggunakan air", benar: "Tutup keran saat menggosok gigi atau menyabun tangan, laporkan keran bocor." },
          { salah: "Tidak boleh membeli barang baru", benar: "Beli barang baru saat benar-benar dibutuhkan, rawat barang lama yang masih layak." }
        ]
      },
      {
        subJudul: "10 Tindakan nyata yang dapat kamu lakukan",
        tipe: "daftar",
        itemDaftar: [
          "<strong>Kertas dan buku:</strong> pakai sisa halaman kosong, rawat buku agar awet, pilah kertas bekas.",
          "<strong>Listrik:</strong> matikan lampu dan kipas saat meninggalkan kelas atau kamar.",
          "<strong>Air:</strong> tutup keran saat menyabuni tangan, hemat air saat berwudu atau mandi.",
          "<strong>Barang sekali pakai:</strong> bawa botol minum (tumbler) dan kotak bekal sendiri dari rumah.",
          "<strong>Makanan:</strong> ambil porsi makan secukupnya agar tidak bersisa dan terbuang.",
          "<strong>Sampah:</strong> kurangi sampah plastik, gunakan kembali, dan jangan membakar sampah terbuka.",
          "<strong>Perjalanan:</strong> pilih jalan kaki atau sepeda untuk jarak dekat jika aman dan cuaca mendukung.",
          "<strong>Pohon & ruang hijau:</strong> ikut merawat tanaman di sekolah dan rumah, tidak mematahkan dahan sembarangan.",
          "<strong>Saluran air:</strong> jaga parit di depan rumah dan sekolah agar bebas dari sumbatan sampah plastik.",
          "<strong>Laut & mangrove:</strong> tidak membuang sampah ke sungai karena sampah sungai akan bermuara ke laut."
        ],
        note: {
          judul: "⭐ Pesan Penting",
          stimulus: "Ramah lingkungan bukan berarti kita tidak boleh menggunakan kertas, membeli buku, menggunakan listrik, atau memakai sumber daya. Ramah lingkungan berarti menggunakan apa yang kita butuhkan secara bijak, tidak berlebihan, merawat barang yang masih dapat digunakan, serta memikirkan dampak pilihan kita terhadap lingkungan."
        }
      }
    ],
    tanggapan: [
      {
        id_tanggapan: "tanggapan-materi5-penasaran",
        target_id_materi: "materi-5",
        jenis_tanggapan: "penasaran",
        wajib: true,
        judul: "💭 Apa yang Membuatmu Penasaran?",
        stimulus: "Setelah membaca dan mengamati materi tentang tindakan ramah lingkungan ini, adakah hal yang membuatmu penasaran? Tuliskan pertanyaan yang ingin kamu ketahui jawabannya.",
        tipe_input: "textarea",
        placeholder: "Aku penasaran, mengapa...",
        panduanKata: [
          "Mengapa ...?",
          "Bagaimana ...?",
          "Apa yang terjadi jika ...?",
          "Apa hubungan antara ... dan ...?",
          "Bagaimana jika keadaan ini terus berlangsung?"
        ]
      }
    ],
    keterampilan: {
      id_keterampilan_card: "keterampilan-materi-5",
      topik: "Materi 5: Tindakan Ramah Lingkungan",
      prompt: "Setelah membaca materi ini, ide kreatif apa yang dapat kamu rancang dan lakukan untuk menjaga lingkungan rumah, sekolah, atau desamu?",
      ariaLabel: "Ide kreatif pro-lingkungan untuk materi 5"
    }
  }
];

const READ_IDEA_FALLBACKS = {
  poster: 'Poster Digital',
  pledge: 'Ikrar Lingkungan',
  news: 'Berita Eco Mini',
  action: 'Aksi Sahabat Bumi'
};

const READ_IDEA_TOPIC_LABELS = {
  'materi-1': 'Cuaca, Iklim, dan Musim',
  'materi-2': 'Atmosfer, Efek Rumah Kaca, dan Pemanasan Global',
  'materi-3': 'Penyebab Perubahan Iklim',
  'materi-4': 'Dampak Perubahan Iklim',
  'materi-5': 'Tindakan Ramah Lingkungan'
};


// ══════════════════════════════════════════════════════════
// 2. MASTER DATA INFOGRAFIS LINGKUNGAN GLOBAL
// ══════════════════════════════════════════════════════════

const READ_INFOGRAFIS = [
  {
    id_info: "info-suhu-global",
    nama_data: "Suhu Permukaan Global",
    nilai_data: "1,19°C",
    keterangan: "Pada tahun 2025, suhu permukaan global sekitar 1,19°C lebih tinggi dibanding rata-rata periode 1951–1980. Kenaikan suhu ini menunjukkan bahwa Bumi terus mengalami pemanasan dalam jangka panjang.",
    persen_bar: 72,
    data_matriks: []
  },
  {
    id_info: "info-muka-laut",
    nama_data: "Kenaikan Muka Laut Global",
    nilai_data: "100,7 mm",
    keterangan: "Sejak 1993, muka laut global telah naik sekitar 100,7 mm. Kenaikan ini terutama berkaitan dengan mencairnya es di daratan dan memuainya air laut ketika suhu Bumi meningkat.",
    persen_bar: 68,
    data_matriks: []
  },
  {
    id_info: "info-es-arktik",
    nama_data: "Luas Minimum Es Laut Arktik",
    nilai_data: "4,60 juta km²",
    keterangan: "Pada September 2025, luas minimum es laut Arktik sekitar 4,60 juta km². Berkurangnya es laut merupakan salah satu tanda perubahan kondisi iklim di wilayah kutub.",
    persen_bar: 60,
    data_matriks: []
  },
  {
    id_info: "info-spesies-punah",
    nama_data: "Spesies Terancam Punah",
    nilai_data: "≈1 juta",
    keterangan: "Sekitar 1 juta spesies tumbuhan dan hewan diperkirakan terancam punah. Perubahan iklim menjadi salah satu faktor yang memperbesar tekanan terhadap habitat dan kelangsungan hidup berbagai makhluk hidup.",
    persen_bar: 68,
    data_matriks: []
  }
];


// ══════════════════════════════════════════════════════════
// 3. MASTER DATA ECOMEDIA & 4 LENSA ANTONIO LÓPEZ
// ══════════════════════════════════════════════════════════

const READ_ECOMEDIA = [
  {
    id_ecomedia: "eco-video-utama",
    target_id_materi: "", // Dikosongkan terlebih dahulu untuk persiapan video per teks materi
    judul: "Video Pembelajaran Ecomedia: Perubahan Iklim",
    src: "assets/video_pembelajaran.mp4",
    tipe: "video/mp4",
    ariaLabel: "Video edukasi Ecomedia tentang perubahan iklim",
    pengantarLensa: {
      judul: "Setelah Menonton, Amati Video dengan Empat Lensa Ecomedia",
      deskripsi: "Gunakan empat lensa di bawah ini untuk melihat pesan dan nilai dalam video, siapa yang berperan, bahan, energi, dan limbah yang terkait dengan media, serta apa yang kamu rasakan atau ingin lakukan setelah menontonnya."
    },
    lensaList: [
      {
        id_lensa: "culture",
        nama_lensa: "Cerita & Nilai",
        ikon: "📖",
        pertanyaan: "Pesan apa tentang manusia dan alam yang disampaikan media? Nilai apa yang dianggap penting?",
        placeholder: "Media ini membuatku melihat alam sebagai...",
        warna_kelas: "z-culture"
      },
      {
        id_lensa: "politic",
        nama_lensa: "Siapa yang Berperan?",
        ikon: "👥",
        pertanyaan: "Siapa yang membuat keputusan, mendapat manfaat, terkena dampak, atau belum terdengar suaranya?",
        placeholder: "Yang terlihat/terdengar suaranya adalah... Yang belum terlihat...",
        warna_kelas: "z-politic"
      },
      {
        id_lensa: "material",
        nama_lensa: "Bahan, Energi & Limbah",
        ikon: "🔋",
        pertanyaan: "Perangkat dan media ini membutuhkan bahan atau energi apa? Apa yang terjadi ketika perangkat atau bahan tidak dipakai lagi?",
        placeholder: "Untuk menggunakan media ini diperlukan... Dampaknya bagi lingkungan...",
        warna_kelas: "z-material"
      },
      {
        id_lensa: "life",
        nama_lensa: "Pengalaman Kita",
        ikon: "❤️",
        pertanyaan: "Apa yang kamu rasakan, perhatikan, atau ingin lakukan setelah menggunakan media ini?",
        placeholder: "Setelah melihat media ini, aku merasa/menyadari/ingin melakukan...",
        warna_kelas: "z-life"
      }
    ],
    opsi_objek_media: [
      "Video Ecomedia",
      "Infografis",
      "HP/Tablet yang digunakan",
      "Buku atau kertas"
    ]
  }
];


// ══════════════════════════════════════════════════════════
// EXPOSURE KE GLOBAL SCOPE (WINDOW)
// ══════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  window.READ_MATERIALS = READ_MATERIALS;
  window.READ_INFOGRAFIS = READ_INFOGRAFIS;
  window.READ_ECOMEDIA = READ_ECOMEDIA;
  window.READ_IDEA_FALLBACKS = READ_IDEA_FALLBACKS;
  window.READ_IDEA_TOPIC_LABELS = READ_IDEA_TOPIC_LABELS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    READ_MATERIALS,
    READ_INFOGRAFIS,
    READ_ECOMEDIA,
    READ_IDEA_FALLBACKS,
    READ_IDEA_TOPIC_LABELS
  };
}

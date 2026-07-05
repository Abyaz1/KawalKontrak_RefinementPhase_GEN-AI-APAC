/* ============================================================
   KawalKontrak.ai — Legal Knowledge Base untuk RAG
   Sumber: Kompilasi Regulasi Ketenagakerjaan Indonesia
   (UU_Ketenagakerjaan_Embedding.pdf — Panduan_KawalKontrak)

   Berisi pasal-pasal kritis dari:
   - UU No. 6 Tahun 2023 tentang Ketenagakerjaan
   - PP No. 35 Tahun 2021 (PKWT, Alih Daya, Waktu Kerja, PHK)
   - PP No. 36 Tahun 2021 (Pengupahan)

   Struktur mengikuti format JSON yang ditentukan di
   PANDUAN_RAG_KawalKontrak.ai.md (Step 1: Ekstraksi & Preprocessing).

   CATATAN: Teks disederhanakan untuk clarity namun mempertahankan
   akurasi legal. Untuk dokumen resmi, rujuk JDIH Setkab RI
   (https://jdih.setkab.go.id/) atau JDIH Kemenaker
   (https://jdih.kemenaker.go.id/).
   ============================================================ */

/** Satu chunk pasal regulasi dalam knowledge base RAG */
export interface LegalChunk {
  /** ID unik, e.g. 'uu6_2023_pasal_56' */
  id: string;
  /** Nama regulasi sumber */
  sumber: string;
  /** Nomor pasal */
  pasal: string;
  /** Judul / topik pasal */
  judul: string;
  /** Teks lengkap ketentuan pasal */
  teks: string;
  /** Kata kunci topik untuk keyword search */
  topik_keyword: string[];
  /** Area pelanggaran umum yang terkait dengan pasal ini */
  area_pelanggaran: string[];
}

export const legalKnowledgeBase: LegalChunk[] = [
  // ══════════════════════════════════════════════════════════
  // UU No. 6 Tahun 2023 — 1.1 PKWT
  // ══════════════════════════════════════════════════════════
  {
    id: 'uu6_2023_pasal_56',
    sumber: 'UU No. 6 Tahun 2023',
    pasal: '56',
    judul: 'Perjanjian Kerja Waktu Tertentu (PKWT)',
    teks: '(1) Perjanjian Kerja Waktu Tertentu dapat dibuat untuk jangka waktu maksimal 2 (dua) tahun atau 3 (tiga) kali pembaruan. (2) Perjanjian Kerja Waktu Tertentu untuk jangka waktu kurang dari 3 (tiga) bulan dapat dibuat untuk pekerjaan yang bersifat sementara atau pekerjaan khusus. (3) Perjanjian Kerja Waktu Tertentu harus dibuat secara tertulis menggunakan Bahasa Indonesia dan huruf Latin. (4) Perjanjian Kerja Waktu Tertentu yang tidak memenuhi persyaratan menjadi Perjanjian Kerja Waktu Tidak Tertentu.',
    topik_keyword: ['PKWT', 'kontrak', 'jangka waktu', 'durasi kontrak', 'pembaruan kontrak', 'tertulis'],
    area_pelanggaran: ['durasi PKWT berlebihan', 'kontrak lisan', 'kontrak tidak tertulis'],
  },
  {
    id: 'uu6_2023_pasal_57',
    sumber: 'UU No. 6 Tahun 2023',
    pasal: '57',
    judul: 'Isi PKWT dan Klausul yang Dilarang',
    teks: '(1) Perjanjian Kerja Waktu Tertentu harus memuat jenis pekerjaan, jangka waktu, upah, dan kondisi kerja lainnya. (2) Perjanjian Kerja Waktu Tertentu TIDAK BOLEH berisi klausul yang: (a) mengurangi upah karena alasan apapun; (b) menghapus atau mengurangi hak Pekerja; (c) melibatkan pekerjaan dengan risiko tinggi; atau (d) bertentangan dengan norma kemanusiaan.',
    topik_keyword: ['PKWT', 'klausul dilarang', 'pengurangan upah', 'penghapusan hak', 'isi kontrak'],
    area_pelanggaran: ['pengurangan upah sepihak', 'klausul menghapus hak pekerja'],
  },
  {
    id: 'uu6_2023_pasal_58',
    sumber: 'UU No. 6 Tahun 2023',
    pasal: '58',
    judul: 'Perpanjangan PKWT',
    teks: '(1) Apabila pada saat berakhirnya Perjanjian Kerja Waktu Tertentu Pengusaha melakukan perpanjangan, dilakukan dengan jeda waktu paling lama 30 (tiga puluh) hari. (2) Dalam hal Perjanjian Kerja Waktu Tertentu diperpanjang, Pekerja berhak menerima hak-hak kompensasi.',
    topik_keyword: ['perpanjangan PKWT', 'jeda waktu', 'kompensasi perpanjangan'],
    area_pelanggaran: ['perpanjangan tanpa kompensasi'],
  },
  {
    id: 'uu6_2023_pasal_59',
    sumber: 'UU No. 6 Tahun 2023',
    pasal: '59',
    judul: 'Batas Perpanjangan PKWT dan Hak saat Kontrak Berakhir',
    teks: '(1) Perjanjian Kerja Waktu Tertentu dapat diperpanjang untuk 1 (satu) kali atau 2 (dua) kali perpanjangan dengan jangka waktu perpanjangan minimal 1 (satu) bulan. (2) Setelah 3 (tiga) kali perpanjangan atau jangka waktu 2 (dua) tahun, Perjanjian Kerja Waktu Tertentu berubah menjadi Perjanjian Kerja Waktu Tidak Tertentu. (3) Apabila Perjanjian Kerja Waktu Tertentu tidak diperpanjang atau berakhir, Pekerja berhak menerima: upah terakhir, upah pesangon, uang penghargaan masa kerja, dan uang penggantian hak.',
    topik_keyword: ['PKWT menjadi PKWTT', 'perpanjangan maksimal', 'kontrak berakhir', 'pesangon PKWT', 'kompensasi akhir kontrak'],
    area_pelanggaran: ['PKWT diperpanjang terus-menerus', 'kontrak berakhir tanpa pesangon'],
  },

  // ══════════════════════════════════════════════════════════
  // UU No. 6 Tahun 2023 — 1.2 Alih Daya (Outsourcing)
  // ══════════════════════════════════════════════════════════
  {
    id: 'uu6_2023_pasal_64',
    sumber: 'UU No. 6 Tahun 2023',
    pasal: '64',
    judul: 'Alih Daya (Outsourcing)',
    teks: '(1) Alih daya adalah pengalihan sebagian pelaksanaan pekerjaan kepada Pengusaha lain dalam bentuk kontrak. (2) Alih daya hanya dapat dilakukan untuk pekerjaan yang bersifat penunjang atau khusus, BUKAN pekerjaan inti. (3) Hubungan Kerja antara Pekerja dan Penerima Alih Daya adalah hubungan kerja yang sah, dan Penerima Alih Daya menjadi Pengusaha langsung Pekerja.',
    topik_keyword: ['alih daya', 'outsourcing', 'pihak ketiga', 'vendor', 'pekerjaan penunjang'],
    area_pelanggaran: ['outsourcing untuk pekerjaan inti'],
  },
  {
    id: 'uu6_2023_pasal_65',
    sumber: 'UU No. 6 Tahun 2023',
    pasal: '65',
    judul: 'Tanggung Jawab Pemberi Alih Daya',
    teks: '(1) Pengusaha pemberi alih daya TETAP BERTANGGUNG JAWAB atas pemenuhan hak-hak Pekerja yang bekerja pada Penerima Alih Daya sesuai dengan ketentuan peraturan perundang-undangan. (2) Beban biaya terkait dengan pelaksanaan alih daya menjadi beban Pengusaha pemberi alih daya.',
    topik_keyword: ['alih daya', 'outsourcing', 'tanggung jawab pengusaha', 'hak pekerja outsourcing'],
    area_pelanggaran: ['perusahaan lempar tanggung jawab hak pekerja outsourcing'],
  },
  {
    id: 'uu6_2023_pasal_66',
    sumber: 'UU No. 6 Tahun 2023',
    pasal: '66',
    judul: 'Perlindungan Pekerja Alih Daya',
    teks: '(1) Dalam melaksanakan alih daya, Penerima Alih Daya wajib memberikan perlindungan, pemeliharaan kesejahteraan, dan keselamatan kerja kepada Pekerja. (2) Pekerja yang bekerja pada Penerima Alih Daya memiliki hak yang SAMA dengan Pekerja lainnya, termasuk hak mengikuti program kesejahteraan sosial.',
    topik_keyword: ['alih daya', 'outsourcing', 'perlindungan pekerja', 'kesejahteraan', 'keselamatan kerja', 'jaminan sosial'],
    area_pelanggaran: ['pekerja outsourcing tanpa perlindungan', 'tanpa jaminan sosial'],
  },

  // ══════════════════════════════════════════════════════════
  // UU No. 6 Tahun 2023 — 1.3 Waktu Kerja dan Istirahat
  // ══════════════════════════════════════════════════════════
  {
    id: 'uu6_2023_pasal_77',
    sumber: 'UU No. 6 Tahun 2023',
    pasal: '77',
    judul: 'Waktu Kerja',
    teks: '(1) Waktu kerja adalah waktu yang digunakan untuk melakukan pekerjaan atau di tempat kerja dan di bawah perintah atau pengawasan Pengusaha. (2) Waktu kerja setara dengan 8 (delapan) jam per hari atau 40 (empat puluh) jam per minggu atau disesuaikan dalam sistem kerja lainnya. (3) Bagi Pekerja yang bekerja lebih dari waktu kerja, pemberi kerja WAJIB membayar upah kerja lembur.',
    topik_keyword: ['jam kerja', 'waktu kerja', '40 jam', '8 jam', 'lembur wajib dibayar'],
    area_pelanggaran: ['jam kerja melebihi batas', 'lembur tidak dibayar'],
  },
  {
    id: 'uu6_2023_pasal_78',
    sumber: 'UU No. 6 Tahun 2023',
    pasal: '78',
    judul: 'Kerja Lembur dan Upah Lembur',
    teks: '(1) Lembur HANYA dapat dilakukan atas PERSETUJUAN Pekerja. (2) Upah lembur TIDAK BOLEH lebih rendah dari upah kerja biasa ditambah minimal 50% untuk jam lembur pertama sampai jam ke-3, dan 100% untuk jam kerja lembur setelah jam ke-3.',
    topik_keyword: ['lembur', 'upah lembur', 'persetujuan lembur', 'overtime', '1.5 kali', '2 kali'],
    area_pelanggaran: ['lembur wajib tanpa persetujuan', 'lembur tanpa pembayaran', 'upah lembur di bawah standar'],
  },
  {
    id: 'uu6_2023_pasal_79',
    sumber: 'UU No. 6 Tahun 2023',
    pasal: '79',
    judul: 'Istirahat, Cuti, dan Hari Libur',
    teks: '(1) Pengusaha WAJIB memberikan istirahat dan waktu luang kepada Pekerja meliputi: (a) Istirahat mingguan 1 (satu) hari untuk setiap 6 (enam) hari kerja; (b) Cuti tahunan MINIMAL 12 (dua belas) hari kerja setiap tahunnya; (c) Istirahat panjang setelah Pekerja bekerja untuk 6 (enam) tahun berturut-turut; (d) Cuti untuk alasan khusus dan menjalankan ibadah; (e) Libur pada hari-hari resmi nasional dan hari raya keagamaan.',
    topik_keyword: ['cuti tahunan', '12 hari', 'istirahat mingguan', 'hari libur', 'libur nasional', 'cuti ibadah'],
    area_pelanggaran: ['cuti kurang dari 12 hari', 'tanpa hari libur mingguan', 'cuti dipotong gaji'],
  },

  // ══════════════════════════════════════════════════════════
  // UU No. 6 Tahun 2023 — 1.4 Pengupahan
  // ══════════════════════════════════════════════════════════
  {
    id: 'uu6_2023_pasal_88',
    sumber: 'UU No. 6 Tahun 2023',
    pasal: '88',
    judul: 'Kewajiban Membayar Upah dan Larangan bagi Pengusaha',
    teks: '(1) Pengusaha WAJIB membayar upah kepada Pekerja atas dasar: (a) Perjanjian Kerja yang TIDAK BOLEH lebih rendah dari upah minimum; (b) Penilaian kinerja atau hasil kerja; atau (c) Senioritas atau pangkat jabatan. (2) Pembayaran upah dilakukan secara berkala, sekurang-kurangnya 1 (satu) kali dalam 1 (satu) bulan. (3) Pengusaha DILARANG: (a) Membayar upah lebih rendah dari upah minimum; (b) Mengurangi atau menghapus upah yang telah ditetapkan; (c) Membayar upah dengan cara yang bertentangan dengan kesepakatan; (d) Melakukan penyimpanan, pengurangan, dan/atau tidak membayar upah.',
    topik_keyword: ['upah', 'gaji', 'upah minimum', 'UMK', 'pembayaran bulanan', 'potongan gaji', 'pengurangan upah', 'denda'],
    area_pelanggaran: ['upah di bawah minimum', 'pengurangan upah sepihak', 'denda tanpa dasar hukum', 'upah tidak dibayar'],
  },
  {
    id: 'uu6_2023_pasal_88a',
    sumber: 'UU No. 6 Tahun 2023',
    pasal: '88A',
    judul: 'Penetapan Upah Minimum',
    teks: '(1) Upah minimum ditetapkan berdasarkan kebutuhan hidup layak dan dengan mempertimbangkan produktivitas dan pertumbuhan ekonomi. (2) Pemerintah menetapkan kebijakan upah minimum dengan mekanisme yang melibatkan Pengusaha, Pekerja/Serikat Pekerja, Pemerintah, dan pakar ekonomi. (3) Upah minimum berlaku untuk seluruh pekerja di Wilayah Provinsi atau Kabupaten/Kota.',
    topik_keyword: ['upah minimum', 'UMK', 'UMP', 'kebutuhan hidup layak', 'penetapan upah'],
    area_pelanggaran: ['upah di bawah UMK regional'],
  },

  // ══════════════════════════════════════════════════════════
  // UU No. 6 Tahun 2023 — 1.5 PHK dan Kompensasi
  // ══════════════════════════════════════════════════════════
  {
    id: 'uu6_2023_pasal_156',
    sumber: 'UU No. 6 Tahun 2023',
    pasal: '156',
    judul: 'Hak Pekerja saat PHK',
    teks: 'Pekerja yang Perjanjian Kerjanya diputus oleh Pengusaha berhak menerima: (a) Upah terakhir; (b) Uang Pesangon (UP); (c) Uang Penghargaan Masa Kerja (UPMK); dan (d) Uang Penggantian Hak (UPH).',
    topik_keyword: ['PHK', 'pesangon', 'UPMK', 'UPH', 'pemutusan hubungan kerja', 'hak PHK'],
    area_pelanggaran: ['PHK tanpa pesangon', 'PHK tanpa kompensasi'],
  },
  {
    id: 'uu6_2023_pasal_157',
    sumber: 'UU No. 6 Tahun 2023',
    pasal: '157',
    judul: 'Perhitungan Uang Pesangon',
    teks: '(1) Uang Pesangon dihitung berdasarkan: (a) Lama kerja Pekerja: 1 bulan gaji untuk 1 tahun, 2 bulan gaji untuk 2 tahun, dan seterusnya, dengan maksimal 9 bulan gaji untuk masa kerja 9 tahun atau lebih; atau (b) Maksimal 2 (dua) kali upah untuk Pekerja yang masa kerja kurang dari 1 (satu) tahun. (2) Perhitungan Pesangon berdasarkan upah terakhir termasuk tunjangan tetap dan tunjangan tidak tetap.',
    topik_keyword: ['pesangon', 'perhitungan pesangon', 'masa kerja', 'bulan gaji'],
    area_pelanggaran: ['perhitungan pesangon tidak sesuai masa kerja'],
  },
  {
    id: 'uu6_2023_pasal_158',
    sumber: 'UU No. 6 Tahun 2023',
    pasal: '158',
    judul: 'Uang Penghargaan Masa Kerja (UPMK)',
    teks: '(1) Uang Penghargaan Masa Kerja (UPMK) dihitung berdasarkan: (a) 1/12 (satu per dua belas) bulan upah untuk setiap tahun masa kerja untuk masa kerja 1 (satu) tahun atau lebih; (b) MINIMAL 2 (dua) bulan upah untuk Pekerja yang masa kerja kurang dari 1 (satu) tahun.',
    topik_keyword: ['UPMK', 'penghargaan masa kerja', 'perhitungan UPMK'],
    area_pelanggaran: ['UPMK tidak dibayar'],
  },
  {
    id: 'uu6_2023_pasal_160',
    sumber: 'UU No. 6 Tahun 2023',
    pasal: '160',
    judul: 'Uang Penggantian Hak (UPH)',
    teks: '(1) Uang Penggantian Hak (UPH) meliputi penggantian atas: (a) Cuti tahunan yang belum digunakan; (b) Biaya atau iuran Jaminan Sosial Tenaga Kerja; (c) Hak-hak Pekerja lainnya yang belum terpenuhi sesuai dengan peraturan perundang-undangan.',
    topik_keyword: ['UPH', 'penggantian hak', 'cuti belum diambil', 'jaminan sosial'],
    area_pelanggaran: ['cuti belum digunakan tidak diganti', 'iuran jaminan sosial tidak dibayar'],
  },
  {
    id: 'uu6_2023_pasal_161',
    sumber: 'UU No. 6 Tahun 2023',
    pasal: '161',
    judul: 'PHK Tanpa Alasan yang Sah',
    teks: 'Apabila Pengusaha melakukan PHK tanpa alasan yang sah atau bertentangan dengan prosedur, Pengusaha WAJIB membayar: (a) Uang penggantian atas perbuatan melawan hukum; dan (b) Uang santunan minimal 1 (satu) bulan upah atau lebih sesuai kesepakatan.',
    topik_keyword: ['PHK sepihak', 'PHK sewenang-wenang', 'PHK tanpa alasan', 'santunan', 'perbuatan melawan hukum'],
    area_pelanggaran: ['PHK sepihak tanpa prosedur', 'diberhentikan sewaktu-waktu'],
  },

  // ══════════════════════════════════════════════════════════
  // PP No. 35 Tahun 2021 — Kompensasi PKWT
  // ══════════════════════════════════════════════════════════
  {
    id: 'pp35_2021_pasal_15',
    sumber: 'PP No. 35 Tahun 2021',
    pasal: '15',
    judul: 'Kompensasi PKWT',
    teks: 'Pekerja PKWT berhak menerima kompensasi berupa: (a) Uang Pesangon: MINIMAL 1/2 (setengah) bulan gaji untuk 1 (satu) tahun masa kerja, dengan maksimal 9 bulan gaji; (b) Uang Penghargaan Masa Kerja (UPMK): MINIMAL 2 (dua) bulan gaji untuk masa kerja kurang dari 1 tahun, atau 1/12 bulan gaji per tahun untuk masa kerja 1 tahun atau lebih; (c) Uang Penggantian Hak: penggantian atas hak-hak yang belum terpenuhi, termasuk cuti yang belum diambil.',
    topik_keyword: ['kompensasi PKWT', 'pesangon kontrak', 'setengah bulan gaji', 'UPMK', 'UPH'],
    area_pelanggaran: ['PKWT tanpa kompensasi', 'kontrak berakhir tanpa pesangon'],
  },
  {
    id: 'pp35_2021_pasal_16',
    sumber: 'PP No. 35 Tahun 2021',
    pasal: '16',
    judul: 'Dasar Perhitungan Kompensasi PKWT',
    teks: 'Perhitungan kompensasi PKWT menggunakan upah terakhir yang diterima Pekerja, termasuk tunjangan tetap tetapi TIDAK termasuk tunjangan tidak tetap atau bonus insidentil.',
    topik_keyword: ['perhitungan kompensasi', 'upah terakhir', 'tunjangan tetap'],
    area_pelanggaran: ['kompensasi dihitung tanpa tunjangan tetap'],
  },
  {
    id: 'pp35_2021_pasal_17',
    sumber: 'PP No. 35 Tahun 2021',
    pasal: '17',
    judul: 'Batas Waktu Pembayaran Kompensasi PKWT',
    teks: 'Dalam hal Pekerja PKWT tidak diperpanjang atau kontrak berakhir, Pengusaha WAJIB melakukan pembayaran kompensasi paling lama 7 (tujuh) hari kerja setelah kontrak berakhir.',
    topik_keyword: ['pembayaran kompensasi', '7 hari kerja', 'kontrak berakhir'],
    area_pelanggaran: ['kompensasi terlambat dibayar'],
  },
  {
    id: 'pp35_2021_pasal_26_29',
    sumber: 'PP No. 35 Tahun 2021',
    pasal: '26-29',
    judul: 'Perhitungan Upah Lembur',
    teks: 'Upah lembur dihitung berdasarkan upah per jam: Upah Per Jam = (Upah Pokok + Tunjangan Tetap) / 173 jam kerja per bulan. Upah lembur untuk Jam Kerja Lembur ke-1 sampai ke-3 adalah sebesar 1,5 (satu setengah) kali upah per jam. Upah lembur untuk Jam Kerja Lembur setelah jam ke-3 adalah sebesar 2 (dua) kali upah per jam. Contoh: Upah Pokok Rp 4.000.000 + Tunjangan Tetap Rp 500.000 = Rp 4.500.000/bulan. Upah Per Jam = Rp 4.500.000 / 173 = Rp 26.011/jam. Lembur jam 1-3 = Rp 39.017/jam. Lembur jam 4+ = Rp 52.023/jam.',
    topik_keyword: ['upah lembur', 'perhitungan lembur', '1.5 kali', '2 kali', 'upah per jam', '173 jam'],
    area_pelanggaran: ['lembur tidak dibayar', 'upah lembur di bawah standar'],
  },
  {
    id: 'pp35_2021_pasal_40_47',
    sumber: 'PP No. 35 Tahun 2021',
    pasal: '40-47',
    judul: 'Perhitungan Pesangon PHK',
    teks: 'Pengusaha melakukan PHK dengan alasan yang sah (Reorganisasi, Efisiensi): Masa Kerja kurang dari 1 Tahun = 1 bulan gaji, Masa Kerja 1-2 Tahun = 2 bulan gaji, Masa Kerja 2-3 Tahun = 3 bulan gaji, Masa Kerja 3 tahun atau lebih = 4 bulan gaji (maksimal). UPMK: Masa Kerja kurang dari 1 Tahun = 2 bulan gaji (MINIMUM), Masa Kerja 1 tahun atau lebih = 1/12 x masa kerja x gaji setiap tahun.',
    topik_keyword: ['pesangon PHK', 'perhitungan pesangon', 'efisiensi', 'reorganisasi', 'UPMK'],
    area_pelanggaran: ['pesangon tidak sesuai perhitungan', 'PHK efisiensi tanpa pesangon'],
  },
  {
    id: 'pp35_2021_pasal_50_52',
    sumber: 'PP No. 35 Tahun 2021',
    pasal: '50-52',
    judul: 'Uang Penggantian Hak (UPH)',
    teks: 'Uang Penggantian Hak (UPH) meliputi: (a) Cuti tahunan yang belum diambil (upah per hari x hari cuti), (b) Tunjangan Hari Raya (THR) yang belum dibayarkan, (c) Premi jaminan sosial yang belum dibayarkan Pengusaha, (d) Hak-hak lain sesuai kesepakatan.',
    topik_keyword: ['UPH', 'penggantian hak', 'THR', 'cuti belum diambil', 'premi jaminan sosial'],
    area_pelanggaran: ['THR tidak dibayar', 'cuti belum diambil hangus'],
  },

  // ══════════════════════════════════════════════════════════
  // PP No. 36 Tahun 2021 — Pengupahan
  // ══════════════════════════════════════════════════════════
  {
    id: 'pp36_2021_komponen_upah',
    sumber: 'PP No. 36 Tahun 2021',
    pasal: 'Komponen Upah',
    judul: 'Komponen Upah',
    teks: 'Upah terdiri atas: (a) Upah Pokok: upah yang diberikan kepada Pekerja berdasarkan perjanjian kerja; (b) Tunjangan Tetap: tunjangan yang diberikan secara teratur dan pasti setiap bulan; (c) Tunjangan Tidak Tetap: tunjangan yang diberikan secara insidental atau tidak pasti setiap bulan; (d) Bonus: pemberian tambahan berdasarkan kinerja atau hasil kerja.',
    topik_keyword: ['komponen upah', 'upah pokok', 'tunjangan tetap', 'tunjangan tidak tetap', 'bonus'],
    area_pelanggaran: ['komponen upah tidak jelas'],
  },
  {
    id: 'pp36_2021_upah_minimum',
    sumber: 'PP No. 36 Tahun 2021',
    pasal: 'Upah Minimum',
    judul: 'Upah Minimum dan Larangan',
    teks: 'UPAH MINIMUM adalah upah terendah yang diberikan kepada Pekerja selama 1 (satu) bulan penuh untuk melakukan pekerjaan di perusahaan, tanpa dikurangi untuk keperluan apapun. Penetapan Upah Minimum mempertimbangkan: (a) Kebutuhan hidup layak (KHL); (b) Indeks harga konsumen; (c) Pertumbuhan ekonomi; (d) Produktivitas Pekerja. LARANGAN: Pengusaha DILARANG membayar upah kepada Pekerja lebih rendah dari Upah Minimum yang berlaku di Wilayah tempat Pekerja bekerja. Pekerja yang menerima upah lebih rendah dari Upah Minimum dapat mengajukan tuntutan ke Lembaga Penyelesaian Perselisihan Hubungan Industrial (LPPH) atau melalui mekanisme hukum lainnya.',
    topik_keyword: ['upah minimum', 'UMK', 'UMP', 'larangan upah rendah', 'KHL', 'LPPH'],
    area_pelanggaran: ['upah di bawah minimum regional'],
  },
];

/**
 * Format satu chunk menjadi teks referensi untuk dimasukkan ke prompt.
 */
export function formatChunkForPrompt(chunk: LegalChunk): string {
  return `[${chunk.sumber} — Pasal ${chunk.pasal}: ${chunk.judul}]\n${chunk.teks}`;
}

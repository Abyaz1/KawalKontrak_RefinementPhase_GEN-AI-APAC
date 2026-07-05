// =============================================================================
// KawalKontrak.ai — Red Flag Pattern Database
// 20+ Indonesian labor law red flag patterns for contract analysis
// Based on UU 6/2023 (Cipta Kerja), PP 35/2021, PP 36/2021, and related regulations
// =============================================================================

import { RedFlagPattern } from '@/types';

export const redFlagPatterns: RedFlagPattern[] = [
  // =========================================================================
  // RF_001 — PKWT Tanpa Kompensasi
  // =========================================================================
  {
    id: 'RF_001',
    severity: 'CRITICAL',
    category: 'kompensasi',
    keywords: [
      'tanpa kompensasi',
      'tidak berhak pesangon',
      'berakhir demi hukum',
      'tanpa pesangon',
      'tidak mendapat kompensasi',
      'tidak ada kompensasi',
    ],
    description:
      'Kontrak PKWT yang menyatakan pekerja tidak berhak atas kompensasi saat kontrak berakhir. Ini melanggar hak dasar pekerja kontrak.',
    why_dangerous:
      'Berdasarkan UU Cipta Kerja, setiap pekerja PKWT BERHAK mendapatkan uang kompensasi saat kontrak berakhir. Klausul yang menghilangkan hak ini adalah ilegal dan merugikan pekerja secara finansial. Anda bisa kehilangan jutaan rupiah yang seharusnya menjadi hak Anda.',
    pasal_references: [
      {
        peraturan: 'UU 6/2023 (Cipta Kerja)',
        pasal: 'Pasal 61A',
        judul: 'Kompensasi PKWT',
        ketentuan_relevan:
          'Dalam hal perjanjian kerja waktu tertentu berakhir, pengusaha wajib memberikan uang kompensasi kepada pekerja/buruh.',
      },
      {
        peraturan: 'PP 35/2021',
        pasal: 'Pasal 15-16',
        judul: 'Besaran dan Tata Cara Pemberian Kompensasi',
        ketentuan_relevan:
          'Uang kompensasi diberikan kepada pekerja/buruh yang telah mempunyai masa kerja paling sedikit 1 bulan secara terus-menerus.',
      },
    ],
    recommendation:
      'Minta perusahaan menambahkan klausul kompensasi PKWT sesuai PP 35/2021 Pasal 15-16. Besaran kompensasi dihitung proporsional berdasarkan masa kerja. Jika perusahaan menolak, ini adalah pelanggaran hukum yang bisa dilaporkan ke Dinas Ketenagakerjaan.',
    analogy:
      'Bayangkan Anda menyewa rumah selama 2 tahun. Saat kontrak berakhir, pemilik rumah harus mengembalikan deposit Anda. Kompensasi PKWT adalah "deposit" yang dijamin undang-undang — perusahaan wajib membayarnya.',
    email_template: {
      subject: 'Klarifikasi Mengenai Kompensasi PKWT',
      body: `Yth. Bapak/Ibu HRD,

Saya ingin mengklarifikasi mengenai klausul dalam kontrak kerja yang menyatakan bahwa pekerja tidak berhak atas kompensasi saat kontrak berakhir.

Berdasarkan UU 6/2023 Pasal 61A dan PP 35/2021 Pasal 15-16, pengusaha WAJIB memberikan uang kompensasi kepada pekerja PKWT saat kontrak berakhir. Besaran kompensasi dihitung berdasarkan masa kerja.

Saya berharap klausul ini dapat disesuaikan agar sesuai dengan peraturan perundang-undangan yang berlaku.

Terima kasih atas perhatiannya.

Hormat saya,
[Nama Anda]`,
    },
  },

  // =========================================================================
  // RF_002 — Upah di Bawah UMK
  // =========================================================================
  {
    id: 'RF_002',
    severity: 'CRITICAL',
    category: 'upah',
    keywords: [
      'di bawah umk',
      'di bawah minimum',
      'upah minimum',
      'di bawah umr',
      'di bawah ump',
      'kurang dari umk',
      'lebih rendah dari umk',
      'gaji di bawah',
    ],
    description:
      'Kontrak menetapkan upah di bawah Upah Minimum Kabupaten/Kota (UMK). Pengusaha dilarang membayar upah lebih rendah dari upah minimum.',
    why_dangerous:
      'Upah minimum adalah batas terendah yang dijamin hukum. Menerima upah di bawah UMK berarti Anda bekerja dengan bayaran ilegal. Perusahaan yang melanggar bisa dikenai sanksi pidana berupa penjara 1-4 tahun dan/atau denda Rp100 juta - Rp400 juta.',
    pasal_references: [
      {
        peraturan: 'UU 6/2023 (Cipta Kerja)',
        pasal: 'Pasal 88',
        judul: 'Pengupahan',
        ketentuan_relevan:
          'Setiap pekerja/buruh berhak memperoleh penghasilan yang memenuhi penghidupan yang layak bagi kemanusiaan. Pengusaha dilarang membayar upah lebih rendah dari upah minimum.',
      },
      {
        peraturan: 'PP 36/2021',
        pasal: 'Pasal 23',
        judul: 'Upah Minimum',
        ketentuan_relevan:
          'Upah minimum berlaku bagi pekerja/buruh dengan masa kerja kurang dari 1 tahun pada perusahaan yang bersangkutan.',
      },
    ],
    recommendation:
      'Tolak penawaran upah di bawah UMK. Cek UMK terbaru di website Dinas Ketenagakerjaan daerah Anda. Jika perusahaan tetap menawarkan di bawah UMK, laporkan ke Dinas Ketenagakerjaan setempat karena ini merupakan pelanggaran pidana.',
    analogy:
      'UMK itu seperti batas kecepatan minimum di jalan tol — kendaraan (perusahaan) tidak boleh berjalan di bawahnya. Kalau di bawah, itu pelanggaran yang bisa kena tilang (sanksi pidana).',
    email_template: {
      subject: 'Permohonan Penyesuaian Upah Sesuai UMK',
      body: `Yth. Bapak/Ibu HRD,

Saya ingin menyampaikan bahwa upah yang tercantum dalam penawaran kerja berada di bawah Upah Minimum Kabupaten/Kota (UMK) yang berlaku.

Berdasarkan UU 6/2023 Pasal 88, pengusaha dilarang membayar upah lebih rendah dari upah minimum. Pelanggaran terhadap ketentuan ini dapat dikenai sanksi pidana.

Saya berharap besaran upah dapat disesuaikan minimal setara dengan UMK yang berlaku di wilayah kerja.

Terima kasih atas perhatiannya.

Hormat saya,
[Nama Anda]`,
    },
  },

  // =========================================================================
  // RF_003 — PHK Tanpa Pesangon
  // =========================================================================
  {
    id: 'RF_003',
    severity: 'CRITICAL',
    category: 'phk',
    keywords: [
      'phk tanpa pesangon',
      'diberhentikan tanpa kompensasi',
      'putus hubungan kerja tanpa',
      'tanpa uang pesangon',
      'tidak berhak atas pesangon',
      'pemutusan tanpa pesangon',
    ],
    description:
      'Kontrak mengandung klausul yang memungkinkan pemutusan hubungan kerja (PHK) tanpa pembayaran pesangon kepada pekerja.',
    why_dangerous:
      'Pesangon adalah hak pekerja yang dijamin undang-undang saat terjadi PHK. Menandatangani kontrak yang menghilangkan hak ini berarti Anda bisa kehilangan pekerjaan kapan saja tanpa jaring pengaman finansial. Pesangon bisa bernilai puluhan hingga ratusan juta rupiah.',
    pasal_references: [
      {
        peraturan: 'UU 6/2023 (Cipta Kerja)',
        pasal: 'Pasal 156',
        judul: 'Pesangon dan Uang Penghargaan Masa Kerja',
        ketentuan_relevan:
          'Dalam hal terjadi pemutusan hubungan kerja, pengusaha wajib membayar uang pesangon dan/atau uang penghargaan masa kerja dan uang penggantian hak yang seharusnya diterima.',
      },
    ],
    recommendation:
      'Pastikan kontrak mencantumkan hak pesangon sesuai Pasal 156 UU 6/2023. Minta klarifikasi tertulis dari perusahaan mengenai skema pesangon. Jika perusahaan menolak, konsultasikan dengan Serikat Pekerja atau Dinas Ketenagakerjaan.',
    analogy:
      'Pesangon itu seperti parasut saat Anda terjun dari pesawat. Kontrak tanpa pesangon berarti Anda diminta terjun tanpa parasut — sangat berbahaya untuk masa depan finansial Anda.',
    email_template: {
      subject: 'Klarifikasi Hak Pesangon dalam Kontrak Kerja',
      body: `Yth. Bapak/Ibu HRD,

Saya mencermati bahwa kontrak kerja yang ditawarkan tidak mencantumkan ketentuan mengenai pesangon jika terjadi pemutusan hubungan kerja.

Berdasarkan UU 6/2023 Pasal 156, pengusaha wajib membayar uang pesangon dan/atau uang penghargaan masa kerja saat terjadi PHK. Saya mohon agar klausul mengenai hak pesangon ditambahkan sesuai peraturan yang berlaku.

Terima kasih atas perhatiannya.

Hormat saya,
[Nama Anda]`,
    },
  },

  // =========================================================================
  // RF_004 — Lembur Tanpa Pembayaran yang Jelas
  // =========================================================================
  {
    id: 'RF_004',
    severity: 'HIGH',
    category: 'lembur',
    keywords: [
      'lembur',
      'kerja lembur',
      'overtime',
      'di luar jam kerja',
      'tanpa upah lembur',
      'lembur tanpa bayaran',
      'lembur tidak dibayar',
      'kerja di luar jam',
    ],
    description:
      'Kontrak tidak mengatur pembayaran lembur secara jelas, atau menyatakan bahwa lembur sudah termasuk dalam gaji pokok.',
    why_dangerous:
      'Tanpa ketentuan lembur yang jelas, perusahaan bisa memaksa Anda bekerja berjam-jam tanpa kompensasi tambahan. Upah lembur jam pertama minimal 1,5x upah per jam, dan jam berikutnya 2x. Anda bisa kehilangan penghasilan signifikan setiap bulannya.',
    pasal_references: [
      {
        peraturan: 'UU 6/2023 (Cipta Kerja)',
        pasal: 'Pasal 78',
        judul: 'Waktu Kerja Lembur',
        ketentuan_relevan:
          'Pengusaha yang mempekerjakan pekerja/buruh melebihi waktu kerja wajib membayar upah kerja lembur. Waktu kerja lembur paling banyak 4 jam dalam 1 hari dan 18 jam dalam 1 minggu.',
      },
      {
        peraturan: 'PP 35/2021',
        pasal: 'Pasal 26-29',
        judul: 'Upah Kerja Lembur',
        ketentuan_relevan:
          'Perhitungan upah kerja lembur: jam pertama 1,5 kali upah sejam, jam berikutnya 2 kali upah sejam.',
      },
    ],
    recommendation:
      'Minta klausul lembur yang jelas mencakup: (1) batas maksimal jam lembur, (2) formula perhitungan upah lembur sesuai PP 35/2021, dan (3) mekanisme persetujuan lembur secara tertulis. Pastikan lembur bersifat sukarela dengan surat perintah lembur.',
    analogy:
      'Bayangkan Anda pesan ojek online untuk jarak 5 km, tapi ternyata harus mengantar 15 km tanpa tambahan biaya. Lembur tanpa bayaran sama — Anda bekerja ekstra tapi tidak dibayar untuk usaha tambahan itu.',
    email_template: {
      subject: 'Permohonan Kejelasan Ketentuan Lembur',
      body: `Yth. Bapak/Ibu HRD,

Saya ingin meminta klarifikasi mengenai ketentuan kerja lembur dalam kontrak kerja. Saya tidak menemukan rincian yang jelas mengenai:
1. Batas maksimal jam lembur
2. Formula perhitungan upah lembur
3. Mekanisme persetujuan kerja lembur

Berdasarkan UU 6/2023 Pasal 78 dan PP 35/2021 Pasal 26-29, pengusaha wajib membayar upah lembur dengan ketentuan minimal 1,5x upah per jam untuk jam pertama.

Saya berharap ketentuan ini dapat dicantumkan secara jelas dalam kontrak.

Terima kasih.

Hormat saya,
[Nama Anda]`,
    },
  },

  // =========================================================================
  // RF_005 — Jam Kerja Melebihi Batas
  // =========================================================================
  {
    id: 'RF_005',
    severity: 'HIGH',
    category: 'jam_kerja',
    keywords: [
      'lebih dari 40 jam',
      'melebihi 8 jam',
      '7 hari seminggu',
      'tanpa hari libur',
      'tanpa istirahat',
      'kerja 12 jam',
      'kerja setiap hari',
      '6 hari kerja 8 jam',
    ],
    description:
      'Kontrak menetapkan jam kerja yang melebihi batas maksimum yang ditentukan undang-undang, yaitu 40 jam per minggu.',
    why_dangerous:
      'Jam kerja berlebihan berdampak buruk pada kesehatan fisik dan mental Anda. Undang-undang membatasi 40 jam/minggu untuk melindungi pekerja. Bekerja melebihi batas ini tanpa kompensasi lembur adalah eksploitasi.',
    pasal_references: [
      {
        peraturan: 'UU 6/2023 (Cipta Kerja)',
        pasal: 'Pasal 77',
        judul: 'Waktu Kerja',
        ketentuan_relevan:
          'Waktu kerja meliputi: (a) 7 jam sehari dan 40 jam seminggu untuk 6 hari kerja, atau (b) 8 jam sehari dan 40 jam seminggu untuk 5 hari kerja.',
      },
    ],
    recommendation:
      'Pastikan kontrak mencantumkan jam kerja sesuai Pasal 77: maksimal 40 jam per minggu. Jika perusahaan membutuhkan jam kerja lebih, harus ada klausul lembur yang jelas dengan pembayaran sesuai aturan.',
    analogy:
      'Tubuh Anda seperti baterai HP — perlu di-charge (istirahat). Kalau dipaksa nyala terus tanpa charge, baterai cepat rusak. Begitu juga tubuh dan pikiran Anda jika bekerja tanpa batas.',
    email_template: {
      subject: 'Klarifikasi Jam Kerja dalam Kontrak',
      body: `Yth. Bapak/Ibu HRD,

Saya ingin mengklarifikasi ketentuan jam kerja dalam kontrak kerja yang tampaknya melebihi batas 40 jam per minggu.

Berdasarkan UU 6/2023 Pasal 77, waktu kerja dibatasi maksimal 40 jam per minggu (8 jam/hari untuk 5 hari kerja atau 7 jam/hari untuk 6 hari kerja).

Mohon penyesuaian agar sesuai dengan ketentuan undang-undang.

Terima kasih.

Hormat saya,
[Nama Anda]`,
    },
  },

  // =========================================================================
  // RF_006 — Cuti Diambil dari Gaji
  // =========================================================================
  {
    id: 'RF_006',
    severity: 'HIGH',
    category: 'cuti',
    keywords: [
      'cuti dipotong gaji',
      'cuti tanpa upah',
      'potong gaji untuk cuti',
      'tidak dibayar saat cuti',
      'cuti mengurangi gaji',
      'unpaid leave',
      'pemotongan gaji cuti',
    ],
    description:
      'Kontrak menyatakan bahwa pengambilan cuti akan mengakibatkan pemotongan gaji pekerja, padahal cuti tahunan seharusnya tetap dibayar.',
    why_dangerous:
      'Cuti tahunan adalah hak pekerja yang TETAP DIBAYAR. Jika cuti dipotong dari gaji, Anda secara efektif "membayar" untuk beristirahat. Ini membuat banyak pekerja takut mengambil cuti dan akhirnya burn out.',
    pasal_references: [
      {
        peraturan: 'UU 6/2023 (Cipta Kerja)',
        pasal: 'Pasal 79-84',
        judul: 'Waktu Istirahat dan Cuti',
        ketentuan_relevan:
          'Pekerja/buruh yang telah bekerja selama 12 bulan secara terus-menerus berhak atas cuti tahunan paling sedikit 12 hari kerja dengan upah penuh.',
      },
    ],
    recommendation:
      'Minta perusahaan menghapus klausul pemotongan gaji untuk cuti. Tegaskan bahwa cuti tahunan 12 hari adalah hak dengan upah penuh berdasarkan Pasal 79 UU 6/2023. Pastikan ini tercantum secara eksplisit dalam kontrak.',
    analogy:
      'Bayangkan Anda punya 12 tiket bioskop gratis dari kantor. Tapi setiap kali Anda pakai, mereka potong gaji Anda seharga tiket itu. Itu bukan gratis — itu penipuan. Cuti tahunan seharusnya "gratis" — tanpa potongan.',
    email_template: {
      subject: 'Klarifikasi Kebijakan Cuti dan Pemotongan Gaji',
      body: `Yth. Bapak/Ibu HRD,

Saya ingin mengklarifikasi klausul dalam kontrak yang menyebutkan pemotongan gaji saat mengambil cuti.

Berdasarkan UU 6/2023 Pasal 79, pekerja yang telah bekerja 12 bulan berhak atas cuti tahunan minimal 12 hari kerja dengan UPAH PENUH.

Saya mohon klausul ini disesuaikan agar tidak ada pemotongan gaji untuk cuti tahunan yang merupakan hak pekerja.

Terima kasih.

Hormat saya,
[Nama Anda]`,
    },
  },

  // =========================================================================
  // RF_007 — Denda Berlebihan untuk Kesalahan Kerja
  // =========================================================================
  {
    id: 'RF_007',
    severity: 'HIGH',
    category: 'denda',
    keywords: [
      'denda',
      'potongan gaji',
      'sanksi finansial',
      'ganti rugi kesalahan',
      'dipotong dari gaji',
      'sanksi denda',
      'penggantian kerugian',
    ],
    description:
      'Kontrak mengandung klausul denda atau potongan gaji yang berlebihan untuk kesalahan kerja, yang dapat menguras penghasilan pekerja.',
    why_dangerous:
      'Denda berlebihan bisa membuat gaji Anda habis untuk membayar "kesalahan" yang kadang bukan sepenuhnya salah Anda. Undang-undang melindungi pekerja dari potongan upah sewenang-wenang. Perusahaan tidak boleh menjadikan denda sebagai sumber pendapatan.',
    pasal_references: [
      {
        peraturan: 'UU 6/2023 (Cipta Kerja)',
        pasal: 'Pasal 95',
        judul: 'Perlindungan Upah',
        ketentuan_relevan:
          'Pelanggaran yang dilakukan oleh pekerja/buruh karena kesengajaan atau kelalaiannya dapat dikenakan denda. Pemotongan upah oleh pengusaha untuk pihak ketiga hanya dapat dilakukan apabila ada surat kuasa dari pekerja.',
      },
    ],
    recommendation:
      'Negosiasikan batas maksimal denda yang wajar. Minta klarifikasi: (1) jenis kesalahan apa yang kena denda, (2) batas maksimal potongan per bulan, (3) mekanisme banding jika tidak setuju. Pastikan total potongan tidak melebihi 50% gaji.',
    analogy:
      'Bayangkan Anda main game dan setiap kali kalah, koin Anda dipotong lebih banyak dari yang Anda menangkan. Lama-lama koin habis dan Anda game over. Denda berlebihan di kontrak kerja sama — gaji Anda bisa habis untuk bayar denda.',
    email_template: {
      subject: 'Klarifikasi Ketentuan Denda dalam Kontrak Kerja',
      body: `Yth. Bapak/Ibu HRD,

Saya ingin meminta klarifikasi mengenai klausul denda/potongan gaji dalam kontrak kerja. Beberapa pertanyaan saya:

1. Jenis kesalahan apa saja yang dikenakan denda?
2. Berapa batas maksimal potongan per bulan?
3. Apakah ada mekanisme keberatan jika pekerja tidak setuju?

Berdasarkan UU 6/2023 Pasal 95, pemotongan upah harus dilakukan secara proporsional dan wajar.

Mohon penjelasannya.

Terima kasih.

Hormat saya,
[Nama Anda]`,
    },
  },

  // =========================================================================
  // RF_008 — PKWT Melebihi Batas Waktu
  // =========================================================================
  {
    id: 'RF_008',
    severity: 'MEDIUM',
    category: 'kontrak',
    keywords: [
      'pkwt',
      'kontrak waktu tertentu',
      'perpanjangan',
      'diperpanjang',
      'kontrak diperpanjang',
      'perpanjangan kontrak',
      'lebih dari 5 tahun',
    ],
    description:
      'PKWT (Perjanjian Kerja Waktu Tertentu) yang melebihi batas waktu maksimum atau perpanjangan yang tidak sesuai ketentuan.',
    why_dangerous:
      'PKWT yang melebihi batas waktu berpotensi berubah menjadi PKWTT (kontrak tetap) demi hukum. Jika perusahaan terus memperpanjang PKWT tanpa mengangkat Anda sebagai karyawan tetap, Anda kehilangan hak sebagai pekerja tetap seperti pesangon penuh.',
    pasal_references: [
      {
        peraturan: 'UU 6/2023 (Cipta Kerja)',
        pasal: 'Pasal 56-59',
        judul: 'Perjanjian Kerja Waktu Tertentu',
        ketentuan_relevan:
          'PKWT dibuat untuk pekerjaan tertentu yang jenis dan sifat pekerjaannya akan selesai dalam waktu tertentu. PKWT dapat diadakan paling lama 5 tahun termasuk perpanjangan.',
      },
      {
        peraturan: 'PP 35/2021',
        pasal: 'Pasal 4-8',
        judul: 'Jangka Waktu PKWT',
        ketentuan_relevan:
          'PKWT berdasarkan jangka waktu dapat dibuat paling lama 5 tahun. Apabila dilakukan perpanjangan melebihi jangka waktu tersebut, demi hukum berubah menjadi PKWTT.',
      },
    ],
    recommendation:
      'Periksa total durasi PKWT termasuk semua perpanjangan. Jika mendekati atau melebihi 5 tahun, minta pengangkatan sebagai karyawan tetap (PKWTT). Jika perusahaan menolak, PKWT otomatis berubah menjadi PKWTT berdasarkan hukum.',
    analogy:
      'PKWT itu seperti kartu SIM prabayar — ada masa berlakunya. Kalau sudah lewat batas perpanjangan, seharusnya "upgrade" ke pascabayar (PKWTT/tetap). Perusahaan tidak bisa terus-menerus "isi ulang" kontrak sementara.',
    email_template: {
      subject: 'Pertanyaan Mengenai Durasi dan Perpanjangan PKWT',
      body: `Yth. Bapak/Ibu HRD,

Saya ingin mengklarifikasi mengenai durasi PKWT dan rencana perpanjangan kontrak kerja saya.

Berdasarkan UU 6/2023 Pasal 56-59 dan PP 35/2021 Pasal 4-8, PKWT dapat dibuat paling lama 5 tahun termasuk perpanjangan. Apabila melebihi ketentuan tersebut, PKWT demi hukum berubah menjadi PKWTT.

Mohon informasi mengenai total durasi kontrak dan rencana status ketenagakerjaan saya ke depan.

Terima kasih.

Hormat saya,
[Nama Anda]`,
    },
  },

  // =========================================================================
  // RF_009 — Non-Compete Clause Berlebihan
  // =========================================================================
  {
    id: 'RF_009',
    severity: 'MEDIUM',
    category: 'kontrak',
    keywords: [
      'non-compete',
      'non compete',
      'tidak boleh bekerja',
      'larangan bekerja',
      'klausul pengabdian',
      'wajib mengabdi',
      'dilarang bekerja di kompetitor',
      'tidak boleh bergabung',
    ],
    description:
      'Kontrak mengandung klausul non-compete yang terlalu luas atau membatasi hak pekerja untuk bekerja di tempat lain setelah kontrak berakhir.',
    why_dangerous:
      'Klausul non-compete yang berlebihan bisa "menyandera" karier Anda. Anda mungkin tidak bisa bekerja di bidang yang sama selama bertahun-tahun setelah keluar. Di Indonesia, klausul ini tidak secara eksplisit diatur dan sering dianggap bertentangan dengan hak konstitusional untuk bekerja.',
    pasal_references: [
      {
        peraturan: 'UUD 1945',
        pasal: 'Pasal 27 ayat (2)',
        judul: 'Hak Atas Pekerjaan',
        ketentuan_relevan:
          'Tiap-tiap warga negara berhak atas pekerjaan dan penghidupan yang layak bagi kemanusiaan.',
      },
      {
        peraturan: 'UU 6/2023 (Cipta Kerja)',
        pasal: 'Ketentuan Umum Ketenagakerjaan',
        judul: 'Prinsip Kebebasan Bekerja',
        ketentuan_relevan:
          'Tidak ada larangan eksplisit mengenai non-compete, namun klausul yang berlebihan dapat dianggap bertentangan dengan hak konstitusional pekerja.',
      },
    ],
    recommendation:
      'Negosiasikan batasan yang wajar: (1) durasi maksimal 6-12 bulan, (2) cakupan geografis yang terbatas, (3) definisi "kompetitor" yang jelas, (4) kompensasi selama masa non-compete. Jika tidak ada kompensasi, klausul ini sulit ditegakkan secara hukum.',
    analogy:
      'Non-compete berlebihan itu seperti dilarang makan di restoran mana pun setelah keluar dari satu restoran. Anda punya hak untuk makan (bekerja) di mana saja. Batasan yang wajar boleh, tapi larangan total itu tidak adil.',
    email_template: {
      subject: 'Negosiasi Klausul Non-Compete dalam Kontrak',
      body: `Yth. Bapak/Ibu HRD,

Saya ingin mendiskusikan klausul non-compete dalam kontrak kerja. Saya memahami kebutuhan perusahaan untuk melindungi informasi bisnis, namun klausul saat ini terasa terlalu luas.

Saya mengusulkan penyesuaian berikut:
1. Durasi non-compete dibatasi maksimal 6-12 bulan
2. Cakupan geografis yang lebih spesifik
3. Definisi "kompetitor" yang lebih jelas
4. Kompensasi selama masa non-compete

Mohon dapat didiskusikan bersama.

Terima kasih.

Hormat saya,
[Nama Anda]`,
    },
  },

  // =========================================================================
  // RF_010 — Penurunan Status PKWT ke PKWTT Tanpa Benefit
  // =========================================================================
  {
    id: 'RF_010',
    severity: 'MEDIUM',
    category: 'kontrak',
    keywords: [
      'pkwt menjadi pkwtt',
      'diangkat tetap',
      'perubahan status',
      'karyawan tetap tanpa',
      'perubahan kontrak',
      'status berubah',
    ],
    description:
      'Perubahan status dari PKWT (kontrak) ke PKWTT (tetap) tanpa penyesuaian benefit dan hak yang seharusnya menyertai status karyawan tetap.',
    why_dangerous:
      'Menjadi karyawan tetap seharusnya membawa benefit lebih baik: pesangon penuh, jaminan kerja, dan hak lainnya. Jika status berubah tanpa penyesuaian benefit, Anda bisa "naik pangkat" tapi tanpa kenaikan perlindungan.',
    pasal_references: [
      {
        peraturan: 'UU 6/2023 (Cipta Kerja)',
        pasal: 'Pasal 59',
        judul: 'Perubahan Status PKWT ke PKWTT',
        ketentuan_relevan:
          'PKWT yang tidak memenuhi ketentuan demi hukum menjadi PKWTT. Dalam hal PKWT berubah menjadi PKWTT, hak-hak pekerja harus disesuaikan.',
      },
    ],
    recommendation:
      'Saat diangkat menjadi karyawan tetap, pastikan: (1) ada surat pengangkatan resmi, (2) benefit disesuaikan (pesangon, cuti, dll), (3) masa kerja PKWT dihitung dalam masa kerja total. Minta semua perubahan secara tertulis.',
    analogy:
      'Bayangkan Anda dipromosikan dari pemain pengganti menjadi pemain inti, tapi gaji dan fasilitas tetap sama seperti pengganti. Promosi tanpa benefit yang sesuai bukan promosi sesungguhnya.',
    email_template: {
      subject: 'Klarifikasi Benefit Setelah Perubahan Status ke Karyawan Tetap',
      body: `Yth. Bapak/Ibu HRD,

Saya mengapresiasi rencana pengangkatan saya sebagai karyawan tetap (PKWTT). Untuk memastikan transisi berjalan baik, saya ingin mengklarifikasi:

1. Apakah ada surat pengangkatan resmi?
2. Bagaimana penyesuaian benefit sebagai karyawan tetap?
3. Apakah masa kerja PKWT dihitung dalam masa kerja total?

Berdasarkan UU 6/2023 Pasal 59, hak pekerja harus disesuaikan saat status berubah menjadi PKWTT.

Terima kasih.

Hormat saya,
[Nama Anda]`,
    },
  },

  // =========================================================================
  // RF_011 — Alih Daya (Outsourcing) Tanpa Perlindungan
  // =========================================================================
  {
    id: 'RF_011',
    severity: 'HIGH',
    category: 'outsourcing',
    keywords: [
      'alih daya',
      'outsourcing',
      'pihak ketiga',
      'melalui vendor',
      'perusahaan alih daya',
      'tenaga alih daya',
      'pekerja outsourcing',
    ],
    description:
      'Kontrak melalui perusahaan alih daya (outsourcing) tanpa perlindungan hak yang memadai bagi pekerja.',
    why_dangerous:
      'Pekerja outsourcing sering mendapat perlindungan lebih rendah. Tanpa klausul perlindungan yang jelas, Anda bisa tidak mendapat pesangon, THR, atau jaminan sosial yang memadai. Perusahaan pemberi kerja dan penyedia jasa bisa saling melempar tanggung jawab.',
    pasal_references: [
      {
        peraturan: 'UU 6/2023 (Cipta Kerja)',
        pasal: 'Pasal 64-66',
        judul: 'Alih Daya (Outsourcing)',
        ketentuan_relevan:
          'Perusahaan alih daya bertanggung jawab atas pemenuhan hak pekerja. Perlindungan pekerja, upah, kesejahteraan, syarat kerja, serta perselisihan yang timbul dilaksanakan sesuai peraturan perundang-undangan.',
      },
    ],
    recommendation:
      'Pastikan kontrak outsourcing mencantumkan: (1) hak dan benefit yang setara dengan pekerja langsung, (2) kejelasan siapa yang bertanggung jawab atas upah dan jaminan sosial, (3) mekanisme penyelesaian perselisihan. Minta salinan perjanjian antara perusahaan pemberi kerja dan penyedia jasa.',
    analogy:
      'Outsourcing tanpa perlindungan itu seperti titip anak ke babysitter tanpa aturan jelas. Kalau terjadi masalah, siapa yang tanggung jawab? Pastikan ada "aturan pengasuhan" yang jelas di kontrak.',
    email_template: {
      subject: 'Klarifikasi Hak Pekerja Alih Daya',
      body: `Yth. Bapak/Ibu HRD,

Sebagai pekerja melalui skema alih daya, saya ingin memastikan hak-hak saya terlindungi sesuai UU 6/2023 Pasal 64-66:

1. Siapa yang bertanggung jawab atas pembayaran upah dan benefit?
2. Apakah saya terdaftar dalam BPJS Ketenagakerjaan dan Kesehatan?
3. Bagaimana mekanisme penyelesaian jika ada perselisihan?

Mohon penjelasan dan dokumentasi yang relevan.

Terima kasih.

Hormat saya,
[Nama Anda]`,
    },
  },

  // =========================================================================
  // RF_012 — Tidak Ada Jaminan Sosial (BPJS)
  // =========================================================================
  {
    id: 'RF_012',
    severity: 'MEDIUM',
    category: 'jaminan_sosial',
    keywords: [
      'bpjs',
      'jaminan sosial',
      'asuransi kesehatan',
      'jaminan ketenagakerjaan',
      'tidak ada bpjs',
      'tanpa bpjs',
      'tanpa jaminan sosial',
      'tanpa asuransi',
    ],
    description:
      'Kontrak tidak menyebutkan pendaftaran pekerja dalam program jaminan sosial (BPJS Ketenagakerjaan dan BPJS Kesehatan).',
    why_dangerous:
      'BPJS adalah hak dasar setiap pekerja. Tanpa BPJS Kesehatan, Anda menanggung semua biaya kesehatan sendiri. Tanpa BPJS Ketenagakerjaan, Anda tidak punya perlindungan kecelakaan kerja, jaminan hari tua, jaminan pensiun, dan jaminan kematian.',
    pasal_references: [
      {
        peraturan: 'UU 24/2011',
        pasal: 'Pasal 15-17',
        judul: 'Badan Penyelenggara Jaminan Sosial',
        ketentuan_relevan:
          'Pemberi kerja secara bertahap wajib mendaftarkan dirinya dan pekerjanya sebagai peserta kepada BPJS.',
      },
      {
        peraturan: 'UU 6/2023 (Cipta Kerja)',
        pasal: 'Pasal 18',
        judul: 'Jaminan Sosial Ketenagakerjaan',
        ketentuan_relevan:
          'Perusahaan wajib mendaftarkan pekerjanya dalam program jaminan sosial ketenagakerjaan.',
      },
    ],
    recommendation:
      'Minta perusahaan mendaftarkan Anda di BPJS Ketenagakerjaan (JKK, JKM, JHT, JP) dan BPJS Kesehatan. Ini adalah kewajiban hukum perusahaan, bukan benefit tambahan. Perusahaan yang tidak mendaftarkan karyawan bisa dikenai sanksi administratif.',
    analogy:
      'BPJS itu seperti sabuk pengaman di mobil — wajib ada untuk keselamatan Anda. Kerja tanpa BPJS seperti naik mobil tanpa sabuk pengaman: mungkin tidak langsung terasa, tapi saat kecelakaan terjadi, akibatnya sangat fatal.',
    email_template: {
      subject: 'Permohonan Pendaftaran BPJS',
      body: `Yth. Bapak/Ibu HRD,

Saya tidak menemukan informasi mengenai pendaftaran BPJS dalam kontrak kerja. Berdasarkan UU 24/2011 dan UU 6/2023, perusahaan WAJIB mendaftarkan pekerja dalam:

1. BPJS Kesehatan
2. BPJS Ketenagakerjaan (JKK, JKM, JHT, JP)

Mohon informasi mengenai proses pendaftaran dan besaran iuran yang ditanggung perusahaan.

Terima kasih.

Hormat saya,
[Nama Anda]`,
    },
  },

  // =========================================================================
  // RF_013 — Masa Percobaan Tanpa Kejelasan
  // =========================================================================
  {
    id: 'RF_013',
    severity: 'LOW',
    category: 'percobaan',
    keywords: [
      'masa percobaan',
      'probation',
      'masa uji coba',
      'masa penilaian',
      'percobaan kerja',
      'probationary period',
    ],
    description:
      'Kontrak mencantumkan masa percobaan tanpa kejelasan mengenai durasi, kriteria penilaian, dan hak pekerja selama masa percobaan.',
    why_dangerous:
      'Masa percobaan yang tidak jelas bisa digunakan perusahaan untuk memberhentikan Anda sewenang-wenang. Perlu diketahui bahwa masa percobaan hanya berlaku untuk PKWTT (karyawan tetap) dan dilarang untuk PKWT (kontrak). Selama percobaan, upah tidak boleh di bawah upah minimum.',
    pasal_references: [
      {
        peraturan: 'UU 6/2023 (Cipta Kerja)',
        pasal: 'Pasal 60',
        judul: 'Masa Percobaan',
        ketentuan_relevan:
          'Perjanjian kerja waktu tidak tertentu (PKWTT) dapat mensyaratkan masa percobaan paling lama 3 bulan. Dalam masa percobaan, pengusaha dilarang membayar upah di bawah upah minimum yang berlaku.',
      },
    ],
    recommendation:
      'Pastikan: (1) masa percobaan maksimal 3 bulan, (2) upah tidak di bawah UMK selama percobaan, (3) kriteria kelulusan percobaan jelas dan tertulis, (4) jika PKWT, masa percobaan tidak boleh ada. Minta semua ketentuan secara tertulis.',
    analogy:
      'Masa percobaan itu seperti ujian masuk universitas — harus ada soal yang jelas, waktu yang pasti, dan standar kelulusan. Kalau tidak jelas, bagaimana Anda bisa lulus?',
    email_template: {
      subject: 'Klarifikasi Ketentuan Masa Percobaan',
      body: `Yth. Bapak/Ibu HRD,

Saya ingin meminta kejelasan mengenai ketentuan masa percobaan:

1. Berapa lama masa percobaan? (Maks. 3 bulan sesuai UU 6/2023 Pasal 60)
2. Apa kriteria penilaian selama masa percobaan?
3. Apakah upah selama percobaan sesuai UMK?

Mohon informasi tertulis mengenai hal-hal tersebut.

Terima kasih.

Hormat saya,
[Nama Anda]`,
    },
  },

  // =========================================================================
  // RF_014 — Mutasi/Rotasi Tanpa Persetujuan
  // =========================================================================
  {
    id: 'RF_014',
    severity: 'HIGH',
    category: 'mutasi',
    keywords: [
      'mutasi',
      'rotasi',
      'dipindahkan',
      'penempatan',
      'sewaktu-waktu dipindahkan',
      'dipindahtugaskan',
      'relokasi',
      'ditempatkan di mana saja',
    ],
    description:
      'Kontrak memberikan wewenang penuh kepada perusahaan untuk memutasi atau memindahkan pekerja ke lokasi mana pun tanpa persetujuan pekerja.',
    why_dangerous:
      'Klausul mutasi tanpa persetujuan bisa mengubah hidup Anda secara drastis — dipindahkan ke kota lain, provinsi lain, atau bahkan posisi yang berbeda dari yang Anda lamar. Ini bisa mengganggu keluarga, pendidikan anak, dan kehidupan pribadi Anda.',
    pasal_references: [
      {
        peraturan: 'UU 6/2023 (Cipta Kerja)',
        pasal: 'Ketentuan Umum',
        judul: 'Prinsip Hubungan Kerja',
        ketentuan_relevan:
          'Mutasi atau pemindahan kerja harus dilakukan berdasarkan alasan yang wajar dan tidak merugikan pekerja. Perubahan kondisi kerja substansial memerlukan persetujuan kedua belah pihak.',
      },
    ],
    recommendation:
      'Negosiasikan batasan mutasi: (1) hanya dalam kota/provinsi yang sama, (2) memerlukan persetujuan tertulis pekerja, (3) ada tunjangan relokasi jika dipindahkan, (4) posisi harus setara. Minta klausul bahwa mutasi tidak mengurangi gaji dan benefit.',
    analogy:
      'Klausul mutasi tanpa persetujuan itu seperti memesan taksi ke Mall A tapi sopir membawa Anda ke Mall Z tanpa bertanya. Anda punya hak untuk menentukan tujuan (tempat kerja) Anda sendiri.',
    email_template: {
      subject: 'Negosiasi Klausul Mutasi/Penempatan',
      body: `Yth. Bapak/Ibu HRD,

Saya ingin mendiskusikan klausul mutasi/penempatan dalam kontrak yang memberikan kewenangan penuh kepada perusahaan tanpa persetujuan pekerja.

Saya mengusulkan penyesuaian berikut:
1. Mutasi memerlukan persetujuan tertulis dari pekerja
2. Batasan geografis yang jelas
3. Tunjangan relokasi jika dipindahkan ke kota lain
4. Jaminan bahwa posisi dan kompensasi tidak berkurang

Mohon dapat didiskusikan bersama.

Terima kasih.

Hormat saya,
[Nama Anda]`,
    },
  },

  // =========================================================================
  // RF_015 — Klausul Kerahasiaan yang Berlebihan
  // =========================================================================
  {
    id: 'RF_015',
    severity: 'MEDIUM',
    category: 'kerahasiaan',
    keywords: [
      'kerahasiaan',
      'rahasia perusahaan',
      'tidak boleh mengungkapkan',
      'nda',
      'non-disclosure',
      'kerahasiaan tanpa batas',
      'selamanya rahasia',
      'rahasia selamanya',
    ],
    description:
      'Kontrak mengandung klausul kerahasiaan yang terlalu luas, tanpa batas waktu, atau mencakup informasi yang seharusnya bukan rahasia.',
    why_dangerous:
      'NDA yang berlebihan bisa digunakan untuk mengintimidasi pekerja agar tidak melaporkan pelanggaran hukum, kondisi kerja tidak aman, atau ketidakadilan. Klausul ini juga bisa menghambat karier Anda karena pengalaman kerja dianggap "rahasia".',
    pasal_references: [
      {
        peraturan: 'KUHPerdata',
        pasal: 'Pasal 1320-1337',
        judul: 'Syarat Sah Perjanjian',
        ketentuan_relevan:
          'Perjanjian harus dibuat atas dasar sepakat, kecakapan, hal tertentu, dan sebab yang halal. Klausul yang bertentangan dengan ketertiban umum batal demi hukum.',
      },
    ],
    recommendation:
      'Negosiasikan NDA yang wajar: (1) definisi jelas apa yang termasuk "rahasia", (2) batas waktu kerahasiaan (2-3 tahun), (3) pengecualian untuk informasi publik, (4) pengecualian untuk pelaporan pelanggaran hukum (whistleblowing). Pastikan NDA tidak menghalangi Anda menjelaskan pengalaman kerja saat melamar pekerjaan baru.',
    analogy:
      'NDA berlebihan itu seperti dilarang bercerita bahwa Anda pernah memasak nasi goreng, padahal semua orang bisa memasak nasi goreng. Yang boleh dirahasiakan adalah resep spesial, bukan fakta bahwa Anda pernah memasak.',
    email_template: {
      subject: 'Klarifikasi Cakupan Klausul Kerahasiaan (NDA)',
      body: `Yth. Bapak/Ibu HRD,

Saya ingin mendiskusikan cakupan klausul kerahasiaan dalam kontrak:

1. Mohon definisi spesifik informasi yang termasuk "rahasia perusahaan"
2. Berapa lama kewajiban kerahasiaan berlaku setelah kontrak berakhir?
3. Apakah ada pengecualian untuk informasi yang sudah menjadi domain publik?

Saya berkomitmen menjaga rahasia bisnis yang sah, namun cakupan saat ini terasa terlalu luas.

Terima kasih.

Hormat saya,
[Nama Anda]`,
    },
  },

  // =========================================================================
  // RF_016 — Pemutusan Sepihak Tanpa Prosedur
  // =========================================================================
  {
    id: 'RF_016',
    severity: 'CRITICAL',
    category: 'pemutusan',
    keywords: [
      'pemutusan sepihak',
      'diberhentikan sewaktu-waktu',
      'sewenang-wenang',
      'tanpa alasan',
      'dapat diberhentikan kapan saja',
      'phk sewaktu-waktu',
      'tanpa pemberitahuan',
    ],
    description:
      'Kontrak mengandung klausul yang memungkinkan perusahaan memutus hubungan kerja secara sepihak tanpa alasan yang sah dan tanpa prosedur yang benar.',
    why_dangerous:
      'PHK sepihak tanpa prosedur berarti Anda bisa kehilangan pekerjaan kapan saja tanpa peringatan. Undang-undang mengharuskan ada alasan yang sah, prosedur perundingan, dan hak pesangon. Klausul ini merampas semua perlindungan hukum Anda.',
    pasal_references: [
      {
        peraturan: 'UU 6/2023 (Cipta Kerja)',
        pasal: 'Pasal 151-153',
        judul: 'Pemutusan Hubungan Kerja',
        ketentuan_relevan:
          'Pemutusan hubungan kerja dilakukan melalui perundingan antara pengusaha dan pekerja. PHK hanya dapat dilakukan dengan alasan tertentu yang diatur undang-undang. Pengusaha wajib memberitahukan secara tertulis kepada pekerja.',
      },
    ],
    recommendation:
      'Minta penghapusan klausul PHK sepihak dan ganti dengan prosedur PHK yang sesuai undang-undang: (1) harus ada alasan yang sah, (2) pemberitahuan minimal 14 hari sebelumnya, (3) perundingan bipartit, (4) hak pesangon dijamin. Jika perusahaan menolak, ini adalah red flag serius.',
    analogy:
      'Klausul PHK sepihak itu seperti kontrak sewa rumah di mana pemilik bisa mengusir Anda kapan saja tanpa alasan. Tidak ada seorang pun yang mau tinggal di rumah seperti itu. Begitu juga, jangan mau bekerja di perusahaan yang bisa memecat Anda seenaknya.',
    email_template: {
      subject: 'Keberatan atas Klausul Pemutusan Sepihak',
      body: `Yth. Bapak/Ibu HRD,

Saya ingin menyampaikan keberatan mengenai klausul yang memungkinkan pemutusan hubungan kerja secara sepihak tanpa prosedur.

Berdasarkan UU 6/2023 Pasal 151-153, PHK harus:
1. Dilakukan melalui perundingan
2. Berdasarkan alasan yang sah
3. Disampaikan secara tertulis
4. Disertai hak pesangon

Saya mohon klausul ini diubah agar sesuai dengan prosedur yang diatur undang-undang.

Terima kasih.

Hormat saya,
[Nama Anda]`,
    },
  },

  // =========================================================================
  // RF_017 — THR (Tunjangan Hari Raya) Tidak Disebutkan
  // =========================================================================
  {
    id: 'RF_017',
    severity: 'HIGH',
    category: 'thr',
    keywords: [
      'thr',
      'tunjangan hari raya',
      'bonus tahunan',
      'tanpa thr',
      'tidak ada thr',
      'tidak mendapat thr',
    ],
    description:
      'Kontrak tidak menyebutkan pembayaran Tunjangan Hari Raya (THR) keagamaan yang merupakan hak setiap pekerja.',
    why_dangerous:
      'THR adalah hak wajib setiap pekerja, bukan bonus opsional. Pekerja yang telah bekerja minimal 1 bulan berhak mendapat THR. Untuk masa kerja 12 bulan atau lebih, THR sebesar 1 bulan gaji. Tanpa THR, Anda kehilangan penghasilan tambahan yang signifikan.',
    pasal_references: [
      {
        peraturan: 'PP 36/2021',
        pasal: 'Pasal 7-12',
        judul: 'Tunjangan Hari Raya Keagamaan',
        ketentuan_relevan:
          'Pengusaha wajib memberikan THR keagamaan kepada pekerja yang telah mempunyai masa kerja 1 bulan secara terus-menerus. THR diberikan sebesar 1 bulan upah bagi yang memiliki masa kerja 12 bulan atau lebih.',
      },
      {
        peraturan: 'Permenaker 6/2016',
        pasal: 'Pasal 1-7',
        judul: 'THR Keagamaan',
        ketentuan_relevan:
          'THR keagamaan wajib dibayarkan paling lambat 7 hari sebelum hari raya keagamaan.',
      },
    ],
    recommendation:
      'Minta perusahaan menambahkan klausul THR secara eksplisit. THR harus dibayar paling lambat 7 hari sebelum hari raya keagamaan. Jika perusahaan tidak membayar THR, laporkan ke Dinas Ketenagakerjaan melalui posko THR yang biasa dibuka menjelang hari raya.',
    analogy:
      'THR itu seperti angpao saat Lebaran — tapi bukan hadiah sukarela, melainkan KEWAJIBAN yang dijamin hukum. Perusahaan yang tidak membayar THR sama seperti orang tua yang tidak memberikan angpao padahal sudah janji dan diwajibkan.',
    email_template: {
      subject: 'Permohonan Pencantuman THR dalam Kontrak',
      body: `Yth. Bapak/Ibu HRD,

Saya tidak menemukan klausul mengenai Tunjangan Hari Raya (THR) dalam kontrak kerja.

Berdasarkan PP 36/2021 dan Permenaker 6/2016, perusahaan WAJIB memberikan THR keagamaan kepada pekerja yang telah bekerja minimal 1 bulan. THR dibayarkan paling lambat 7 hari sebelum hari raya.

Mohon ketentuan THR ditambahkan dalam kontrak kerja.

Terima kasih.

Hormat saya,
[Nama Anda]`,
    },
  },

  // =========================================================================
  // RF_018 — Hak Cuti Kurang dari Ketentuan
  // =========================================================================
  {
    id: 'RF_018',
    severity: 'MEDIUM',
    category: 'cuti',
    keywords: [
      'cuti tahunan',
      '12 hari',
      'hak cuti',
      'libur',
      'cuti kurang',
      'cuti hanya',
      'jatah cuti',
      'kurang dari 12',
    ],
    description:
      'Kontrak memberikan hak cuti tahunan kurang dari 12 hari kerja yang merupakan ketentuan minimum undang-undang.',
    why_dangerous:
      'Cuti tahunan minimal 12 hari adalah standar minimum yang dijamin undang-undang. Kurang dari itu berarti perusahaan melanggar hak istirahat Anda. Tanpa cuti yang cukup, risiko burnout dan masalah kesehatan meningkat.',
    pasal_references: [
      {
        peraturan: 'UU 6/2023 (Cipta Kerja)',
        pasal: 'Pasal 79',
        judul: 'Cuti Tahunan',
        ketentuan_relevan:
          'Cuti tahunan paling sedikit 12 hari kerja setelah pekerja yang bersangkutan bekerja selama 12 bulan secara terus-menerus.',
      },
    ],
    recommendation:
      'Minta perusahaan menyesuaikan hak cuti minimal 12 hari kerja per tahun sesuai Pasal 79. Hak cuti ini belum termasuk cuti sakit, cuti melahirkan, dan cuti khusus lainnya. Pastikan semua jenis cuti tercantum dalam kontrak.',
    analogy:
      'Cuti tahunan 12 hari itu seperti jatah makan siang di kantor — minimal harus ada. Kalau perusahaan cuma kasih 6 hari, itu seperti cuma dikasih setengah porsi makan. Anda berhak mendapat porsi penuh.',
    email_template: {
      subject: 'Permohonan Penyesuaian Hak Cuti Tahunan',
      body: `Yth. Bapak/Ibu HRD,

Saya mencermati bahwa hak cuti tahunan dalam kontrak kurang dari 12 hari kerja.

Berdasarkan UU 6/2023 Pasal 79, pekerja berhak atas cuti tahunan paling sedikit 12 hari kerja setelah bekerja 12 bulan terus-menerus.

Saya mohon penyesuaian agar sesuai dengan ketentuan undang-undang.

Terima kasih.

Hormat saya,
[Nama Anda]`,
    },
  },

  // =========================================================================
  // RF_019 — Tidak Ada Surat Pengangkatan
  // =========================================================================
  {
    id: 'RF_019',
    severity: 'LOW',
    category: 'surat_pengangkatan',
    keywords: [
      'surat pengangkatan',
      'pengangkatan karyawan',
      'diangkat secara lisan',
      'tanpa surat',
      'kontrak lisan',
      'tidak tertulis',
      'perjanjian lisan',
    ],
    description:
      'Hubungan kerja tidak didukung dengan surat pengangkatan atau perjanjian kerja tertulis yang sah.',
    why_dangerous:
      'Tanpa surat pengangkatan tertulis, Anda tidak memiliki bukti legal mengenai status kerja, hak, dan kewajiban Anda. Jika terjadi perselisihan, akan sangat sulit membuktikan hubungan kerja Anda di pengadilan.',
    pasal_references: [
      {
        peraturan: 'UU 6/2023 (Cipta Kerja)',
        pasal: 'Pasal 63',
        judul: 'Surat Pengangkatan',
        ketentuan_relevan:
          'Dalam hal perjanjian kerja waktu tidak tertentu dibuat secara lisan, pengusaha wajib membuat surat pengangkatan bagi pekerja/buruh yang bersangkutan.',
      },
    ],
    recommendation:
      'Minta surat pengangkatan atau kontrak kerja tertulis yang mencantumkan: (1) nama dan alamat perusahaan, (2) posisi dan deskripsi kerja, (3) upah dan benefit, (4) jam kerja, (5) jangka waktu kontrak. Simpan salinan kontrak dengan aman.',
    analogy:
      'Bekerja tanpa surat pengangkatan itu seperti beli rumah tanpa sertifikat. Anda tinggal di situ tapi tidak punya bukti kepemilikan. Kalau ada masalah, Anda bisa diusir tanpa perlindungan hukum.',
    email_template: {
      subject: 'Permohonan Surat Pengangkatan Tertulis',
      body: `Yth. Bapak/Ibu HRD,

Saya ingin meminta surat pengangkatan atau kontrak kerja tertulis yang mencantumkan:

1. Posisi dan deskripsi pekerjaan
2. Besaran upah dan benefit
3. Jam kerja dan lokasi
4. Jangka waktu kontrak
5. Hak dan kewajiban kedua belah pihak

Berdasarkan UU 6/2023 Pasal 63, pengusaha wajib membuat surat pengangkatan tertulis.

Terima kasih.

Hormat saya,
[Nama Anda]`,
    },
  },

  // =========================================================================
  // RF_020 — Penalti Resign Berlebihan
  // =========================================================================
  {
    id: 'RF_020',
    severity: 'MEDIUM',
    category: 'penalti',
    keywords: [
      'penalti resign',
      'denda mengundurkan diri',
      'biaya keluar',
      'wajib mengganti biaya',
      'penalti pengunduran diri',
      'denda keluar',
      'biaya training',
      'ganti rugi training',
      'ikatan dinas',
    ],
    description:
      'Kontrak mengenakan denda atau penalti yang berlebihan jika pekerja mengundurkan diri, termasuk kewajiban mengganti biaya pelatihan yang tidak proporsional.',
    why_dangerous:
      'Penalti resign berlebihan bisa "menyandera" Anda di perusahaan. Anda mungkin terpaksa bertahan di lingkungan kerja yang buruk karena takut harus membayar puluhan hingga ratusan juta rupiah. Ini membatasi kebebasan Anda untuk mencari pekerjaan yang lebih baik.',
    pasal_references: [
      {
        peraturan: 'UU 6/2023 (Cipta Kerja)',
        pasal: 'Pasal 162',
        judul: 'Pengunduran Diri',
        ketentuan_relevan:
          'Pekerja yang mengundurkan diri atas kemauan sendiri berhak atas uang penggantian hak. Pengunduran diri harus memenuhi syarat: mengajukan permohonan selambatnya 30 hari sebelumnya, tidak terikat ikatan dinas, dan tetap melaksanakan kewajiban sampai tanggal pengunduran diri.',
      },
    ],
    recommendation:
      'Negosiasikan penalti yang proporsional: (1) hanya untuk ikatan dinas yang disertai pelatihan mahal, (2) nilainya menurun seiring masa kerja (prorata), (3) batas maksimal yang wajar. Minta rincian biaya pelatihan yang harus diganti dan formula perhitungannya.',
    analogy:
      'Penalti resign berlebihan itu seperti gym membership yang tidak bisa dibatalkan — Anda terjebak membayar meskipun sudah tidak mau datang. Anda berhak "berhenti langganan" dengan syarat yang wajar.',
    email_template: {
      subject: 'Negosiasi Klausul Penalti Pengunduran Diri',
      body: `Yth. Bapak/Ibu HRD,

Saya ingin mendiskusikan klausul penalti pengunduran diri dalam kontrak kerja. Beberapa poin yang ingin saya klarifikasi:

1. Apa dasar perhitungan besaran penalti?
2. Apakah penalti berkurang seiring masa kerja (prorata)?
3. Dalam kondisi apa saja penalti berlaku?

Saya berharap ketentuan ini dapat disesuaikan agar proporsional dan adil bagi kedua belah pihak.

Terima kasih.

Hormat saya,
[Nama Anda]`,
    },
  },
];

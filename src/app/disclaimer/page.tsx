import { LegalPageContent } from '@/components/LegalPageContent';

export const metadata = {
  title: 'Disclaimer',
  description:
    'Penafian lengkap KawalKontrak.ai: batas pengetahuan hukum, mode kegagalan yang diketahui, dan hal-hal yang tidak boleh Anda putuskan hanya dari hasil analisis AI.',
};

export default function DisclaimerPage() {
  return (
    <LegalPageContent
      slug="disclaimer"
      title={{ en: 'Disclaimer', id: 'Penafian (Disclaimer)' }}
      tagline={{
        en: 'KawalKontrak.ai is a legal literacy tool, not a lawyer. This page states plainly what the service can do, what it cannot do, and every way we know it can be wrong.',
        id: 'KawalKontrak.ai adalah alat bantu melek hukum, bukan pengacara. Halaman ini menyatakan apa adanya: apa yang bisa dilakukan layanan ini, apa yang tidak, dan setiap cara yang kami ketahui di mana ia bisa keliru.',
      }}
      summary={{
        title: { en: '30-second summary', id: 'Ringkasan 30 detik' },
        bullets: [
          {
            en: 'KawalKontrak.ai is a legal literacy tool, not a lawyer.',
            id: 'KawalKontrak.ai adalah alat bantu melek hukum, bukan pengacara.',
          },
          {
            en: 'Its output is AI-generated and can be wrong: it can miss violations, flag lawful clauses, and cite the wrong regulation.',
            id: 'Hasilnya dibuat oleh AI dan bisa salah: melewatkan pelanggaran, menuduh klausul yang sah, atau mengutip pasal yang keliru.',
          },
          {
            en: '"0 findings" does not mean your contract is safe. The analysis may simply have failed.',
            id: '"0 temuan" tidak berarti kontrak Anda aman. Bisa jadi analisisnya yang gagal.',
          },
          {
            en: 'Our entire legal knowledge base is three regulations. No regional rules, no company regulations, no collective agreements, no case law.',
            id: 'Seluruh pengetahuan hukum kami hanya tiga dokumen peraturan. Tidak ada perda, Peraturan Perusahaan, PKB, atau yurisprudensi.',
          },
          {
            en: 'Our minimum wage table holds 2025 figures for 13 regions only.',
            id: 'Tabel upah minimum kami adalah angka 2025 untuk 13 wilayah saja.',
          },
          {
            en: 'We do not flag protections that are missing from your contract.',
            id: 'Kami tidak menandai perlindungan yang hilang dari kontrak Anda.',
          },
          {
            en: 'No licensed advocate has ever reviewed this system.',
            id: 'Tidak ada advokat berizin yang pernah memeriksa sistem ini.',
          },
          {
            en: 'Do not take an irreversible decision on the strength of this output.',
            id: 'Jangan ambil keputusan yang tidak bisa ditarik kembali berdasarkan hasil ini.',
          },
        ],
      }}
      sections={[
        {
          heading: { en: 'What this service is, and what it is not', id: 'Apa layanan ini, dan apa yang bukan' },
          paragraphs: [
            {
              en: 'KawalKontrak.ai reads the text of Indonesian employment agreements and flags clauses that may conflict with Indonesian labour law. It exists to give a worker a starting point for asking questions, not a final answer.',
              id: 'KawalKontrak.ai membaca teks perjanjian kerja Indonesia dan menandai klausul yang mungkin berbenturan dengan hukum ketenagakerjaan Indonesia. Tujuannya memberi pekerja titik awal untuk bertanya, bukan memberi jawaban akhir.',
            },
            { en: 'This service is not:', id: 'Layanan ini bukan:' },
          ],
          bullets: [
            { en: 'legal advice, a legal opinion, or a legal memorandum;', id: 'nasihat hukum, pendapat hukum, atau legal opinion;' },
            {
              en: 'legal services within the meaning of Law No. 18 of 2003 on Advocates;',
              id: 'jasa hukum sebagaimana dimaksud dalam Undang-Undang No. 18 Tahun 2003 tentang Advokat;',
            },
            { en: 'a professional contract review;', id: 'pemeriksaan kontrak (contract review) profesional;' },
            {
              en: 'a substitute for an advocate, mediator, or labour inspector;',
              id: 'pengganti advokat, mediator, atau pegawai pengawas ketenagakerjaan;',
            },
            {
              en: 'a source of evidence: its output is not prepared as evidence and we make no representation that it is admissible in any proceeding.',
              id: 'alat pembuktian: keluarannya tidak disiapkan sebagai alat bukti dan kami tidak menyatakannya layak diajukan dalam proses hukum apa pun.',
            },
          ],
          callouts: [
            {
              tone: 'warning',
              body: {
                en: 'No advocate–client relationship and no professional duty of confidentiality arises between you and us or any member of our team. We are not a law firm. We do not represent you, will not contact your employer, and will not file anything on your behalf.',
                id: 'Tidak ada hubungan advokat–klien maupun kewajiban kerahasiaan profesional yang terbentuk antara Anda dan kami atau anggota tim kami. Kami bukan kantor hukum. Kami tidak mewakili Anda, tidak akan menghubungi perusahaan Anda, dan tidak akan mengajukan dokumen apa pun atas nama Anda.',
              },
            },
          ],
        },

        {
          heading: {
            en: 'How our conclusions are actually produced',
            id: 'Bagaimana kesimpulan kami sebenarnya dibuat',
          },
          paragraphs: [
            {
              en: 'What you see on screen is not the output of a deterministic legal engine. It is a chain of probabilistic language-model judgements.',
              id: 'Hasil di layar bukan keluaran mesin hukum yang pasti, melainkan rangkaian dugaan model bahasa.',
            },
            {
              en: 'Each analysis passes through five sequential AI stages (Extractor → Legal Matcher → Risk Grader → Verifier → Negotiator), each a separate call to a Google Gemini model. Every stage can introduce its own error, and errors introduced early are carried forward and compound.',
              id: 'Setiap analisis melewati lima tahap AI berurutan (Extractor → Legal Matcher → Risk Grader → Verifier → Negotiator), masing-masing merupakan panggilan terpisah ke model Google Gemini. Setiap tahap dapat memasukkan kesalahannya sendiri, dan kesalahan di tahap awal terbawa dan berlipat di tahap berikutnya.',
            },
            {
              en: 'Generative language models are inherently unreliable. They are known to fabricate regulatory citations, misread legal text, and produce confident but incorrect reasoning. The Verifier stage is designed to filter this, but reducing a problem is not the same as eliminating it.',
              id: 'Model bahasa generatif secara inheren tidak dapat diandalkan. Model semacam ini diketahui mengarang kutipan peraturan, salah membaca teks hukum, dan menghasilkan penalaran yang terdengar meyakinkan tetapi keliru. Tahap Verifier dirancang untuk menyaring hal itu, tetapi menguranginya bukan berarti menghilangkannya.',
            },
          ],
        },

        {
          heading: { en: 'The limits of our legal knowledge', id: 'Batas pengetahuan hukum kami' },
          paragraphs: [
            {
              en: 'Our entire legal corpus consists of three documents:',
              id: 'Seluruh basis pengetahuan hukum layanan ini hanya terdiri dari tiga dokumen:',
            },
          ],
          numbered: [
            { en: 'Law No. 6 of 2023 (Job Creation);', id: 'UU No. 6 Tahun 2023 (Cipta Kerja);' },
            {
              en: 'Government Regulation No. 35 of 2021 (fixed-term contracts, outsourcing, working hours, termination);',
              id: 'PP No. 35 Tahun 2021 (PKWT, alih daya, waktu kerja, PHK);',
            },
            { en: 'Government Regulation No. 36 of 2021 (wages).', id: 'PP No. 36 Tahun 2021 (pengupahan).' },
          ],
          subsections: [
            {
              heading: {
                en: 'Not included, and therefore never detected',
                id: 'Tidak termasuk, dan karenanya tidak akan pernah terdeteksi',
              },
              bullets: [
                {
                  en: 'Regional regulations (Perda) and Governor/Regent/Mayor decrees;',
                  id: 'Peraturan Daerah dan Keputusan Gubernur/Bupati/Wali Kota;',
                },
                {
                  en: 'Ministerial regulations beyond those reflected in the three documents above;',
                  id: 'Peraturan Menteri di luar yang tercakup dalam ketiga dokumen di atas;',
                },
                {
                  en: 'Sector-specific rules (mining, shipping, health, education, and others);',
                  id: 'Aturan sektoral (pertambangan, pelayaran, kesehatan, pendidikan, dan lain-lain);',
                },
                {
                  en: 'Company Regulations (PP) and Collective Labour Agreements (PKB) in force at your workplace, even though these often determine your rights directly;',
                  id: 'Peraturan Perusahaan (PP) dan Perjanjian Kerja Bersama (PKB) yang berlaku di tempat kerja Anda, padahal keduanya sering kali menentukan hak Anda secara langsung;',
                },
                {
                  en: 'Case law and Industrial Relations Court (PHI) decisions;',
                  id: 'Yurisprudensi dan putusan Pengadilan Hubungan Industrial;',
                },
                {
                  en: 'The labour law of any other country. This service covers Indonesia only.',
                  id: 'Hukum ketenagakerjaan negara lain. Layanan ini hanya untuk Indonesia.',
                },
              ],
            },
          ],
          callouts: [
            {
              tone: 'info',
              body: {
                en: 'Law also changes. Regulations may be repealed, amended, or struck down by the Constitutional Court after the date of this document. We do not warrant that our corpus is current.',
                id: 'Hukum juga berubah. Peraturan dapat dicabut, diubah, atau dibatalkan Mahkamah Konstitusi setelah tanggal dokumen ini. Kami tidak menjamin korpus kami mutakhir.',
              },
            },
          ],
        },

        {
          heading: { en: 'Known failure modes', id: 'Mode kegagalan yang kami ketahui' },
          paragraphs: [
            {
              en: 'This section sets out real defects we have found in our own system. We state them plainly, because a disclaimer that does not describe the actual failures is worthless to you.',
              id: 'Bagian ini memuat kelemahan nyata yang kami temukan di dalam sistem kami sendiri. Kami menuliskannya apa adanya karena disclaimer yang tidak menyebut kegagalan yang sesungguhnya tidak ada gunanya bagi Anda.',
            },
          ],
          subsections: [
            {
              heading: {
                en: '4.1 A failed analysis can be displayed as a clean bill of health',
                id: '4.1 Analisis yang gagal dapat ditampilkan sebagai "aman"',
              },
              paragraphs: [
                {
                  en: 'This is the most serious defect we know of. When the AI pipeline fails completely, the system may still return a result: zero findings and risk level LOW, badged as though AI analysis ran. A reassuring green screen can therefore appear for a contract that was never analysed at all. Never treat "0 findings" as confirmation that your contract is clean.',
                  id: 'Ini cacat paling serius yang kami ketahui. Ketika rangkaian AI gagal total, sistem tetap dapat mengembalikan sebuah hasil: nol temuan dan tingkat risiko RENDAH, disertai lencana yang menyatakan analisis AI telah dijalankan. Layar hijau yang menenangkan bisa muncul untuk kontrak yang sebenarnya tidak pernah dianalisis sama sekali. Jangan pernah memperlakukan hasil "0 temuan" sebagai konfirmasi bahwa kontrak Anda bersih.',
                },
              ],
            },
            {
              heading: {
                en: '4.2 The anti-hallucination check can switch off without stopping the analysis',
                id: '4.2 Penyaring anti-halusinasi dapat mati tanpa menghentikan analisis',
              },
              paragraphs: [
                {
                  en: 'The Verifier stage removes fabricated or misdirected findings. If that stage fails, the system fails open: every finding is displayed without ever having been audited. Some of what you see may never have passed any quality check. Watch for the on-screen warning when this happens.',
                  id: 'Tahap Verifier bertugas membuang temuan yang dikarang atau salah sasaran. Jika tahap ini gagal, sistem membiarkan hasil lewat begitu saja (fail open): seluruh temuan ditampilkan tanpa pernah diaudit. Sebagian analisis yang Anda lihat mungkin tidak pernah melewati pemeriksaan mutu apa pun. Perhatikan peringatan di layar bila muncul.',
                },
              ],
            },
            {
              heading: {
                en: '4.3 Our minimum wage table is out of date and geographically narrow',
                id: '4.3 Tabel upah minimum kami kedaluwarsa dan sempit',
              },
              bullets: [
                {
                  en: 'The figures are from 2025, while minimum wages are revised annually.',
                  id: 'Angka yang kami pakai adalah angka tahun 2025, sedangkan upah minimum direvisi setiap tahun.',
                },
                {
                  en: 'The table covers only 13 cities/regencies out of Indonesia’s 500-plus: Jakarta, Surabaya, Bandung, Bekasi, Karawang, Depok, Tangerang, Semarang, Medan, Makassar, Yogyakarta, Denpasar, and Batam.',
                  id: 'Tabel kami hanya mencakup 13 kota/kabupaten dari lebih dari 500 di Indonesia: Jakarta, Surabaya, Bandung, Bekasi, Karawang, Depok, Tangerang, Semarang, Medan, Makassar, Yogyakarta, Denpasar, dan Batam.',
                },
                {
                  en: 'The figures have not been re-verified against official Governor’s Decrees.',
                  id: 'Angka-angka tersebut belum diverifikasi ulang terhadap Keputusan Gubernur resmi.',
                },
                {
                  en: 'Consequently: any shortfall we report may be understated; violations outside those 13 regions are not detected at all; and you could be told your salary is lawful when, against the current year’s figure, it is not.',
                  id: 'Akibatnya: selisih kekurangan upah yang kami laporkan bisa lebih kecil dari yang sebenarnya; pelanggaran di luar 13 wilayah itu tidak terdeteksi sama sekali; dan Anda bisa diberi tahu gaji Anda sah padahal terhadap angka tahun berjalan sebenarnya di bawah minimum.',
                },
              ],
            },
            {
              heading: { en: '4.4 We can pick the wrong salary figure', id: '4.4 Angka gaji bisa salah diambil' },
              paragraphs: [
                {
                  en: 'Salary detection relies on text patterns and contextual guesswork to distinguish a salary from a penalty, deduction, or deposit. It can select the wrong number (a bonus, an allowance, or a fine), producing either a false minimum-wage violation or a missed one.',
                  id: 'Sistem mencari angka gaji dengan pola teks dan tebakan konteks, lalu berusaha membedakannya dari denda, potongan, atau uang jaminan. Cara ini bisa memilih angka yang salah (bonus, tunjangan, atau justru nominal denda), sehingga menimbulkan tuduhan pelanggaran upah minimum yang keliru, atau justru melewatkan pelanggaran yang nyata.',
                },
              ],
            },
            {
              heading: { en: '4.5 We do not flag missing clauses', id: '4.5 Kami tidak menandai klausul yang hilang' },
              paragraphs: [
                {
                  en: 'Our system is deliberately forbidden from treating the absence of a clause as a violation, because many users paste only part of their contract and flagging "no leave clause" would generate a flood of false accusations.',
                  id: 'Sistem kami secara sengaja dilarang menandai ketiadaan klausul sebagai pelanggaran. Alasannya praktis: banyak pengguna hanya menempelkan sebagian kontraknya, sehingga menandai "tidak ada pasal cuti" akan menghasilkan tuduhan palsu bertubi-tubi.',
                },
                {
                  en: 'What this means for you, and you would not guess it: if your contract genuinely omits BPJS Ketenagakerjaan and BPJS Kesehatan enrolment, leave entitlement, overtime pay, or end-of-contract (PKWT) compensation, we will not tell you. The absence of a red flag is not evidence that a legally required protection is present. Check for those yourself, one by one.',
                  id: 'Artinya bagi Anda, dan ini tidak akan Anda duga sendiri: jika kontrak Anda benar-benar tidak mencantumkan kepesertaan BPJS Ketenagakerjaan dan BPJS Kesehatan, hak cuti, upah lembur, atau kompensasi akhir PKWT, kami tidak akan memberi tahu Anda. Ketiadaan temuan merah bukan bukti bahwa perlindungan yang diwajibkan hukum benar-benar ada di kontrak Anda. Periksa hal-hal itu sendiri, satu per satu.',
                },
              ],
            },
            {
              heading: { en: '4.6 Long contracts are truncated', id: '4.6 Kontrak panjang dipotong' },
              paragraphs: [
                {
                  en: 'Text beyond 80,000 characters is discarded before analysis. Clauses past that point are never examined. The system flags this in its metadata, but you should still be aware that the end of a long contract can be missed.',
                  id: 'Teks di atas 80.000 karakter dibuang sebelum analisis dimulai. Pasal-pasal setelah batas itu tidak pernah diperiksa. Sistem menandai hal ini di metadata, tetapi Anda tetap perlu sadar bahwa bagian akhir kontrak panjang bisa luput.',
                },
              ],
            },
            {
              heading: { en: '4.7 Results are cached for 24 hours', id: '4.7 Hasil disimpan sementara selama 24 jam' },
              paragraphs: [
                {
                  en: 'Identical contract text returns a stored result for up to 24 hours without re-analysis. If the first analysis was wrong, or if the regulations changed in between, the same error is served to you again.',
                  id: 'Teks kontrak yang identik akan mengembalikan hasil yang tersimpan dari analisis sebelumnya hingga 24 jam, tanpa dianalisis ulang. Jika analisis pertama keliru, atau jika peraturan berubah di sela waktu itu, kekeliruan yang sama akan disajikan kembali kepada Anda.',
                },
              ],
            },
            {
              heading: {
                en: '4.8 Photo transcription can misread your contract',
                id: '4.8 Pembacaan foto bisa meleset',
              },
              paragraphs: [
                {
                  en: 'If you photograph your contract, the image is read by AI and turned into text. One misread digit changes a salary; one misread word changes a clause. We show you the transcription for review first, which reduces but does not remove this risk. Read the transcription carefully before continuing.',
                  id: 'Jika Anda memotret kontrak, gambar itu dibaca oleh AI dan diubah menjadi teks. Satu digit yang salah baca mengubah nilai gaji; satu kata yang salah baca mengubah makna pasal. Kami menampilkan hasil transkripsi agar Anda periksa lebih dulu, dan itu mengurangi risiko, tetapi tidak menghapusnya. Bacalah hasil transkripsi dengan teliti.',
                },
              ],
            },
            {
              heading: { en: '4.9 Degraded mode without AI', id: '4.9 Mode cadangan tanpa AI' },
              paragraphs: [
                {
                  en: 'If our AI backend is unreachable, the system silently falls back to a local pattern engine: 20 fixed keyword rules with pre-written explanations. In this mode there is no AI, no reasoning, and no regulation lookup at all. The interface changes its badge to "Local Pattern Engine (AI unavailable)". If you see that badge, treat the result as the crudest possible indication.',
                  id: 'Jika layanan AI kami tidak dapat dihubungi, sistem beralih ke mesin pola lokal: 20 aturan kata kunci tetap dengan penjelasan yang sudah ditulis sebelumnya. Dalam mode ini tidak ada AI, tidak ada penalaran, dan tidak ada penelusuran peraturan sama sekali. Tampilan akan mengubah lencananya menjadi "Mesin Pola Lokal (AI tidak tersedia)". Jika Anda melihat lencana itu, perlakukan hasilnya sebagai indikasi paling kasar saja.',
                },
              ],
            },
            {
              heading: { en: '4.10 The service may disappear', id: '4.10 Layanan bisa hilang sewaktu-waktu' },
              paragraphs: [
                {
                  en: 'Our rate limiting is weak and easily evaded. This is not a risk to your data, but it means the service may become slow, unavailable, or be discontinued entirely without notice.',
                  id: 'Pembatasan laju permintaan pada layanan ini lemah dan mudah dilewati. Ini bukan risiko bagi keselamatan data Anda, tetapi berarti layanan dapat menjadi lambat, tidak tersedia, atau dihentikan sepenuhnya tanpa pemberitahuan sebelumnya.',
                },
              ],
            },
            {
              heading: { en: '4.11 No professional oversight', id: '4.11 Tidak ada pengawasan profesional' },
              paragraphs: [
                {
                  en: 'No licensed Indonesian advocate has reviewed this system’s legal logic, its 20 fallback pattern rules, the instructions given to the AI, or its output. The regulation corpus was assembled by the student team that built it. This is a competition/hackathon project, not a professionally vetted product.',
                  id: 'Tidak ada advokat berizin di Indonesia yang pernah memeriksa logika hukum sistem ini, 20 aturan pola cadangannya, instruksi yang diberikan kepada AI, atau keluarannya. Korpus peraturan disusun sendiri oleh tim mahasiswa pembuat layanan ini. Layanan ini berstatus proyek kompetisi/hackathon, bukan produk yang telah melalui uji kelayakan profesional.',
                },
              ],
            },
            {
              heading: {
                en: '4.12 Documents other than employment contracts',
                id: '4.12 Dokumen selain kontrak kerja',
              },
              paragraphs: [
                {
                  en: 'If you submit something that is not an Indonesian employment agreement (a partnership agreement, a lease, an offer letter, a freelance contract, or a foreign-language document), the system will still analyse it and will still produce a tidy-looking report. That report is unreliable.',
                  id: 'Jika Anda memasukkan dokumen yang bukan perjanjian kerja Indonesia (perjanjian kemitraan, perjanjian sewa, surat penawaran, kontrak freelance, atau dokumen berbahasa asing), sistem tetap akan menganalisisnya dan tetap menghasilkan laporan yang terlihat rapi. Laporan itu tidak dapat diandalkan.',
                },
              ],
            },
          ],
        },

        {
          heading: {
            en: 'The two most dangerous ways to misread us',
            id: 'Dua kesalahan berpikir yang paling berbahaya',
          },
          callouts: [
            {
              tone: 'critical',
              body: {
                en: '"No red flags, so my contract is safe." Wrong. See §4.1 and §4.5. Zero findings may mean your contract is clean, may mean we missed something, may mean the analysis failed, and never means that legally required protections are actually written into your contract.',
                id: '"Tidak ada temuan merah, berarti kontrak saya aman." Salah. Lihat §4.1 dan §4.5. Nol temuan bisa berarti kontrak Anda bersih, bisa berarti kami melewatkannya, bisa berarti analisisnya gagal, dan tidak pernah berarti perlindungan yang wajib ada sudah benar-benar tertulis.',
              },
            },
            {
              tone: 'critical',
              body: {
                en: '"There’s a red flag, so my employer is breaking the law." Also wrong. Our findings are suspicions. A flagged clause may be lawful because of context we cannot see: company regulations, a collective agreement, the nature of the role, or terms you did not paste. Accusing an employer on the basis of a mistaken suspicion can damage your employment relationship and, in some circumstances, create legal exposure for you.',
                id: '"Ada temuan merah, berarti perusahaan saya melanggar hukum." Juga salah. Temuan kami adalah dugaan. Klausul yang kami tandai bisa jadi sah karena konteks yang tidak kami lihat: Peraturan Perusahaan, PKB, sifat pekerjaannya, atau pengaturan lain yang tidak Anda tempelkan. Menuduh pemberi kerja melanggar hukum berdasarkan dugaan yang keliru dapat merugikan hubungan kerja Anda dan, dalam hal tertentu, menimbulkan tanggung jawab hukum pada diri Anda sendiri.',
              },
            },
          ],
        },

        {
          heading: {
            en: 'Decisions you should not take from this screen alone',
            id: 'Keputusan yang tidak boleh Anda ambil dari layar ini saja',
          },
          paragraphs: [
            {
              en: 'Do not use this analysis as your only basis to:',
              id: 'Jangan menggunakan hasil analisis ini sebagai satu-satunya dasar untuk:',
            },
          ],
          bullets: [
            {
              en: 'sign or refuse to sign an employment agreement;',
              id: 'menandatangani atau menolak menandatangani sebuah perjanjian kerja;',
            },
            { en: 'resign or refuse a work instruction;', id: 'mengundurkan diri atau menolak perintah kerja;' },
            {
              en: 'file a complaint with the Manpower Office, a mediator, or the Industrial Relations Court;',
              id: 'mengajukan pengaduan ke Dinas Ketenagakerjaan, mediator, atau Pengadilan Hubungan Industrial;',
            },
            { en: 'accuse your employer of unlawful conduct;', id: 'menuduh pemberi kerja Anda melakukan pelanggaran hukum;' },
            {
              en: 'refuse, accept, or demand a particular payment;',
              id: 'menolak, menerima, atau menuntut pembayaran tertentu;',
            },
            {
              en: 'take any other step you cannot reverse.',
              id: 'mengambil langkah lain yang tidak dapat Anda tarik kembali.',
            },
          ],
          callouts: [
            {
              tone: 'info',
              body: {
                en: 'For all of the above, have a competent human review your contract first.',
                id: 'Untuk semua hal di atas, mintalah pemeriksaan oleh manusia yang berkompeten terlebih dahulu.',
              },
            },
          ],
        },

        {
          heading: { en: 'Where to get real help', id: 'Ke mana mencari bantuan yang sesungguhnya' },
          table: {
            head: [
              { en: 'Need', id: 'Kebutuhan' },
              { en: 'Where to go', id: 'Ke mana' },
            ],
            rows: [
              [
                { en: 'Free legal aid', id: 'Bantuan hukum gratis' },
                {
                  en: (
                    <>
                      LBH / YLBHI:{' '}
                      <a href="https://bantuanhukum.or.id" target="_blank" rel="noopener noreferrer">
                        bantuanhukum.or.id
                      </a>
                    </>
                  ),
                  id: (
                    <>
                      LBH / YLBHI:{' '}
                      <a href="https://bantuanhukum.or.id" target="_blank" rel="noopener noreferrer">
                        bantuanhukum.or.id
                      </a>
                    </>
                  ),
                },
              ],
              [
                { en: 'Labour complaints and inspection', id: 'Pengaduan & pengawasan ketenagakerjaan' },
                {
                  en: 'Your district Manpower Office (Dinas Ketenagakerjaan)',
                  id: 'Dinas Ketenagakerjaan kabupaten/kota Anda',
                },
              ],
              [
                { en: 'Collective bargaining', id: 'Perundingan kolektif' },
                { en: 'Your workplace trade union', id: 'Serikat pekerja/serikat buruh di tempat kerja Anda' },
              ],
              [
                { en: 'A formal legal opinion', id: 'Pendapat hukum formal' },
                { en: 'A licensed advocate (PERADI)', id: 'Advokat berizin (PERADI)' },
              ],
              [
                { en: 'National policy information', id: 'Informasi kebijakan nasional' },
                {
                  en: (
                    <>
                      Ministry of Manpower:{' '}
                      <a href="https://kemnaker.go.id" target="_blank" rel="noopener noreferrer">
                        kemnaker.go.id
                      </a>
                    </>
                  ),
                  id: (
                    <>
                      Kementerian Ketenagakerjaan:{' '}
                      <a href="https://kemnaker.go.id" target="_blank" rel="noopener noreferrer">
                        kemnaker.go.id
                      </a>
                    </>
                  ),
                },
              ],
              [
                { en: 'Free consultation for workers', id: 'Konsultasi gratis bagi pekerja' },
                {
                  en: 'Court Legal Aid Post (Posbakum PHI) · LBH Jakarta (021) 3145518 · Manpower hotline 1500-630',
                  id: 'Posbakum Pengadilan Hubungan Industrial · LBH Jakarta (021) 3145518 · Hotline Kemnaker 1500-630',
                },
              ],
            ],
          },
        },

        {
          heading: { en: 'No warranty', id: 'Tanpa jaminan' },
          paragraphs: [
            {
              en: 'To the fullest extent permitted by applicable law, the service is provided "as is" and "as available", without warranty of any kind, express or implied, including as to accuracy, completeness, currency, fitness for a particular purpose, or uninterrupted availability.',
              id: 'Sejauh diizinkan hukum yang berlaku, layanan ini disediakan "sebagaimana adanya" (as is) dan "sebagaimana tersedia" (as available), tanpa jaminan dalam bentuk apa pun, baik tersurat maupun tersirat, termasuk namun tidak terbatas pada jaminan atas keakuratan, kelengkapan, kemutakhiran, kesesuaian untuk tujuan tertentu, atau ketersediaan tanpa gangguan.',
            },
            {
              en: 'Limitation of liability, including those matters Indonesian law does not permit us to exclude, is dealt with in Article 11 of the Terms of Service.',
              id: 'Ketentuan mengenai pembatasan tanggung jawab, termasuk hal-hal yang menurut hukum Indonesia tidak dapat kami kesampingkan, diatur dalam Pasal 11 Syarat Layanan.',
            },
          ],
        },

        {
          heading: { en: 'Contact us', id: 'Hubungi kami' },
          paragraphs: [
            {
              en: 'If this service gives you a wrong result, please tell us: your report helps us fix it. KawalKontrak.ai does not yet have a published contact address, so reports currently go through the project repository. A dedicated channel will be listed on this page as soon as one is open.',
              id: 'Jika layanan ini memberi Anda hasil yang keliru, beri tahu kami: laporan Anda membantu kami memperbaikinya. KawalKontrak.ai belum memiliki alamat kontak resmi, sehingga laporan untuk sementara disampaikan lewat repositori proyek. Kanal khusus akan dicantumkan di halaman ini begitu tersedia.',
            },
          ],
        },
      ]}
    />
  );
}

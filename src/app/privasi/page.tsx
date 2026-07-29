import { LegalPageContent } from '@/components/LegalPageContent';
import { LEGAL_CONFIG } from '@/lib/legal';

export const metadata = {
  title: 'Kebijakan Privasi',
  description:
    'Kebijakan Privasi KawalKontrak.ai menurut UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi: data apa yang diproses, ke mana dikirim, berapa lama disimpan, dan hak Anda sebagai Subjek Data.',
};

export default function PrivacyPage() {
  return (
    <LegalPageContent
      slug="privasi"
      contactEmail={LEGAL_CONFIG.privacyEmail}
      title={{ en: 'Privacy Policy', id: 'Kebijakan Privasi' }}
      tagline={{
        en: 'This policy is written to the expectations of Law No. 27 of 2022 on Personal Data Protection ("UU PDP"). It explains exactly what we process, where it goes, how long it stays, and what you can demand from us.',
        id: 'Kebijakan ini disusun mengacu pada Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi ("UU PDP"). Kebijakan ini menjelaskan persis apa yang kami proses, ke mana data itu pergi, berapa lama disimpan, dan apa yang dapat Anda tuntut dari kami.',
      }}
      summary={{
        title: { en: 'Short summary', id: 'Ringkasan singkat' },
        bullets: [
          {
            en: 'The raw text of your contract is never stored in any database.',
            id: 'Teks mentah kontrak Anda tidak pernah kami simpan di basis data mana pun.',
          },
          {
            en: 'It is, however, transmitted to Google (Gemini) for analysis, to servers outside Indonesia.',
            id: 'Namun teks itu dikirim ke Google (Gemini) untuk dianalisis, ke server di luar Indonesia.',
          },
          {
            en: 'Employment contracts contain your personal data, including salary, which is specific personal data under UU PDP. Redact what is unnecessary, especially your national ID (NIK) and bank account numbers.',
            id: 'Kontrak kerja memuat data pribadi Anda, termasuk gaji, yang merupakan data pribadi bersifat spesifik menurut UU PDP. Sensor apa yang tidak perlu, terutama NIK dan nomor rekening.',
          },
          {
            en: 'What is stored is the analysis result, and that result still contains quoted excerpts of clauses from your contract.',
            id: 'Yang tersimpan hanyalah hasil analisis, dan hasil itu masih memuat kutipan potongan pasal dari kontrak Anda.',
          },
          {
            en: 'We do not sell your data, show ads, or use analytics trackers.',
            id: 'Kami tidak menjual data Anda, tidak memasang iklan, dan tidak memakai pelacak analitik.',
          },
          {
            en: 'You have full rights as a data subject. See Section 9.',
            id: 'Anda punya hak penuh sebagai Subjek Data Pribadi. Lihat Bagian 9.',
          },
        ],
      }}
      sections={[
        {
          heading: { en: 'Roles of the parties', id: 'Peran para pihak' },
          table: {
            head: [
              { en: 'Role under UU PDP', id: 'Peran menurut UU PDP' },
              { en: 'Who', id: 'Siapa' },
            ],
            rows: [
              [
                { en: 'Personal data subject', id: 'Subjek Data Pribadi' },
                {
                  en: 'You, and anyone named in the documents you upload',
                  id: 'Anda, dan setiap orang yang namanya tercantum dalam dokumen yang Anda unggah',
                },
              ],
              [
                { en: 'Personal data controller', id: 'Pengendali Data Pribadi' },
                {
                  en: 'The provider named at the top of this page',
                  id: 'Penyelenggara yang disebut di bagian atas halaman ini',
                },
              ],
              [
                { en: 'Personal data processor', id: 'Prosesor Data Pribadi' },
                {
                  en: 'Google LLC (Gemini API, Firebase Authentication, Cloud Firestore, Cloud Run)',
                  id: 'Google LLC (Gemini API, Firebase Authentication, Cloud Firestore, Cloud Run)',
                },
              ],
            ],
          },
          callouts: [
            {
              tone: 'warning',
              body: {
                en: 'Important: if the contract you upload contains other people’s personal data (a manager, a witness, a colleague), you are the one deciding to transmit it, and you are responsible for having a lawful basis to do so.',
                id: 'Perhatian penting: apabila kontrak yang Anda unggah memuat data pribadi orang lain (misalnya nama atasan, saksi, atau rekan kerja), Anda bertindak sebagai pihak yang menentukan pengiriman data tersebut dan bertanggung jawab memastikan Anda memiliki dasar yang sah untuk itu.',
              },
            },
          ],
        },

        {
          heading: { en: 'Personal data we process', id: 'Data pribadi yang kami proses' },
          subsections: [
            {
              heading: { en: '2.1 What you submit directly', id: '2.1 Yang Anda kirimkan langsung' },
              bullets: [
                {
                  en: 'Contract text: full name, address, national ID number (NIK), job title, salary, employer name, contract number, and dates. This is general personal data and also specific personal data (personal financial data).',
                  id: 'Teks kontrak kerja: nama lengkap, alamat, NIK, jabatan, besaran upah, nama pemberi kerja, nomor kontrak, dan tanggal. Ini merupakan data pribadi umum sekaligus data pribadi bersifat spesifik (data keuangan pribadi).',
                },
                {
                  en: 'Contract photograph (if you take one): the whole page, including signatures and possibly a portrait photo.',
                  id: 'Foto kontrak (bila Anda memotret): seluruh isi lembar, termasuk tanda tangan dan kemungkinan foto diri.',
                },
                { en: 'Region selection: e.g. "Jakarta".', id: 'Pilihan wilayah: misalnya "Jakarta".' },
                { en: 'Language and theme preferences.', id: 'Preferensi bahasa dan tema.' },
              ],
            },
            {
              heading: { en: '2.2 Collected automatically', id: '2.2 Yang terkumpul otomatis' },
              bullets: [
                {
                  en: 'IP address: solely for rate limiting (anti-abuse) and security logs.',
                  id: 'Alamat IP: semata-mata untuk pembatasan laju permintaan (anti-penyalahgunaan) dan log keamanan.',
                },
                {
                  en: 'Request logs from our hosting infrastructure: for reliability and security.',
                  id: 'Log permintaan dari infrastruktur hosting: untuk keandalan dan keamanan layanan.',
                },
                {
                  en: 'We use no advertising cookies, no tracking pixels, and no third-party analytics.',
                  id: 'Kami tidak memasang cookie iklan, piksel pelacak, atau alat analitik pihak ketiga.',
                },
              ],
            },
            {
              heading: { en: '2.3 If you sign in with Google', id: '2.3 Bila Anda memilih masuk dengan Google' },
              bullets: [
                {
                  en: 'Email address, display name, profile photo, and UID, from Firebase Authentication.',
                  id: 'Alamat surel, nama tampilan, foto profil, dan UID, dari Firebase Authentication.',
                },
              ],
            },
            {
              heading: { en: '2.4 What we generate', id: '2.4 Yang kami hasilkan' },
              paragraphs: [
                {
                  en: 'Analysis results: findings, risk levels, explanations, recommendations, and email templates. These results contain quoted excerpts of clauses from your contract. So while the full text is not stored, fragments of your contract are stored inside the results.',
                  id: 'Hasil analisis: temuan, tingkat risiko, penjelasan, rekomendasi, dan templat surel. Hasil ini memuat kutipan potongan klausul dari kontrak Anda. Jadi walaupun teks utuh tidak disimpan, serpihan kontrak Anda ikut tersimpan di dalam hasil.',
                },
              ],
            },
          ],
        },

        {
          heading: { en: 'Lawful basis (Article 20 UU PDP)', id: 'Dasar pemrosesan (Pasal 20 UU PDP)' },
          numbered: [
            {
              en: 'Our primary basis is your valid, specific, and expressly stated consent, given at the consent gate before your first analysis.',
              id: 'Dasar utama kami adalah persetujuan Anda yang sah, spesifik, dan dinyatakan secara tegas, yang Anda berikan melalui gerbang persetujuan sebelum analisis pertama.',
            },
            {
              en: 'For specific personal data, including salary as personal financial data, we rely on that same explicit consent.',
              id: 'Untuk data pribadi bersifat spesifik (antara lain data keuangan pribadi berupa besaran upah), kami mendasarkan pemrosesan pada persetujuan eksplisit yang sama.',
            },
            {
              en: 'For IP addresses and security logs we also rely on our legitimate interest in keeping the system secure and available, kept to the minimum necessary.',
              id: 'Untuk alamat IP dan log keamanan, kami juga bersandar pada kepentingan yang sah dalam menjaga keamanan dan ketersediaan sistem, dengan cakupan seminimal mungkin.',
            },
            {
              en: 'You may withdraw your consent at any time (see Section 9).',
              id: 'Anda dapat menarik persetujuan kapan saja (lihat Bagian 9).',
            },
          ],
        },

        {
          heading: { en: 'Purposes of processing', id: 'Tujuan pemrosesan' },
          paragraphs: [
            {
              en: 'We process your personal data solely to:',
              id: 'Kami memproses data pribadi Anda semata-mata untuk:',
            },
          ],
          numbered: [
            { en: 'run the contract analysis you request;', id: 'menjalankan analisis kontrak yang Anda minta;' },
            {
              en: 'compare the salary figure against our minimum wage table;',
              id: 'membandingkan besaran upah terhadap tabel upah minimum;',
            },
            {
              en: 'display and, if you choose, store your analysis history;',
              id: 'menampilkan dan, bila Anda memilihnya, menyimpan riwayat hasil analisis Anda;',
            },
            {
              en: 'prevent abuse of the service and maintain its security;',
              id: 'mencegah penyalahgunaan layanan dan menjaga keamanannya;',
            },
            { en: 'comply with applicable legal obligations.', id: 'memenuhi kewajiban hukum yang berlaku.' },
          ],
          callouts: [
            {
              tone: 'info',
              body: {
                en: 'We do not process your data for marketing, credit scoring, worker assessment, or any purpose outside this list.',
                id: 'Kami tidak memproses data Anda untuk pemasaran, pemeringkatan kredit, penilaian pekerja, atau tujuan lain apa pun di luar daftar tersebut.',
              },
            },
          ],
        },

        {
          heading: { en: 'What we do not do', id: 'Apa yang tidak kami lakukan' },
          bullets: [
            { en: 'We do not sell your personal data.', id: 'Kami tidak menjual data pribadi Anda.' },
            {
              en: 'We do not share your data with your employer, prospective employers, insurers, credit bureaus, or government bodies, except where compelled by valid legal process.',
              id: 'Kami tidak membagikan data Anda kepada pemberi kerja Anda, calon pemberi kerja, perusahaan asuransi, biro kredit, atau lembaga pemerintah, kecuali diwajibkan oleh perintah hukum yang sah.',
            },
            {
              en: 'We show no advertising and use no ad networks.',
              id: 'Kami tidak menampilkan iklan dan tidak memakai jaringan periklanan.',
            },
            {
              en: 'We do not use your contract to train our own AI models.',
              id: 'Kami tidak memakai kontrak Anda untuk melatih model AI milik kami sendiri.',
            },
          ],
        },

        {
          heading: { en: 'What is never stored', id: 'Apa yang tidak pernah disimpan' },
          paragraphs: [
            {
              en: 'The raw text of your contract is never written to any database: not to the server cache, not to browser storage, and not to Firestore. This is a deliberate design decision and a real privacy strength of this service.',
              id: 'Teks mentah kontrak Anda tidak pernah ditulis ke basis data mana pun. Tidak di cache server, tidak di penyimpanan peramban, dan tidak di Firestore. Ini keputusan rancangan yang disengaja dan merupakan kekuatan privasi yang nyata dari layanan ini.',
            },
          ],
          callouts: [
            {
              tone: 'warning',
              body: {
                en: 'But note the nuance: stored analysis results contain quoted excerpts of the problematic clauses. Fragments of your contract therefore persist inside stored results. Do not read the sentence above as a promise that no part of your contract is retained at all.',
                id: 'Namun perhatikan nuansanya: hasil analisis yang disimpan memuat kutipan potongan klausul bermasalah dari kontrak Anda. Jadi serpihan isi kontrak tetap ada di dalam hasil yang tersimpan. Jangan membaca kalimat di atas sebagai janji bahwa tidak ada bagian kontrak Anda yang tersimpan sama sekali.',
              },
            },
          ],
        },

        {
          heading: { en: 'Storage locations and retention', id: 'Tempat penyimpanan dan masa retensi' },
          table: {
            head: [
              { en: 'Where / what', id: 'Tempat / apa yang disimpan' },
              { en: 'Retention', id: 'Masa simpan' },
            ],
            rows: [
              [
                {
                  en: 'Server memory (RAM): analysis results, keyed by a SHA-256 fingerprint of contract text + language',
                  id: 'Memori server (RAM): hasil analisis, diindeks dengan sidik jari SHA-256 dari teks kontrak + bahasa',
                },
                {
                  en: '24 hours, maximum 200 entries, lost on restart',
                  id: '24 jam, maksimal 200 entri, hilang saat server dimulai ulang',
                },
              ],
              [
                {
                  en: 'Your browser localStorage: last 20 analysis results, language and theme preferences, consent record',
                  id: 'localStorage peramban Anda: 20 hasil analisis terakhir, preferensi bahasa & tema, catatan persetujuan',
                },
                {
                  en: 'Until you clear your browser data; it lives entirely on your device',
                  id: 'Sampai Anda menghapus data peramban; seluruhnya ada di perangkat Anda',
                },
              ],
              [
                {
                  en: 'Cloud Firestore (only if signed in): analysis results at users/{uid}/analyses/{id}',
                  id: 'Cloud Firestore (hanya bila Anda masuk): hasil analisis di users/{uid}/analyses/{id}',
                },
                { en: 'Until you delete them', id: 'Sampai Anda menghapusnya' },
              ],
              [
                {
                  en: 'Hosting logs (Cloud Run): IP address, request metadata',
                  id: 'Log hosting (Cloud Run): alamat IP, metadata permintaan',
                },
                {
                  en: 'Per Google Cloud log retention settings for this project',
                  id: 'Sesuai pengaturan retensi log Google Cloud untuk proyek ini',
                },
              ],
            ],
          },
        },

        {
          heading: {
            en: 'Third parties and transfer outside Indonesia',
            id: 'Pihak ketiga dan transfer ke luar wilayah Indonesia',
          },
          subsections: [
            {
              heading: { en: '8.1 Who receives what', id: '8.1 Siapa menerima apa' },
              bullets: [
                {
                  en: 'Google LLC (Gemini API): performs the analysis and photo transcription; receives the full contract text and/or photograph.',
                  id: 'Google LLC (Gemini API): menjalankan analisis dan transkripsi foto; menerima seluruh teks kontrak dan/atau foto kontrak.',
                },
                {
                  en: 'Google LLC (Firebase Authentication): optional Google Sign-In; receives your email, name, profile photo, and UID.',
                  id: 'Google LLC (Firebase Authentication): masuk dengan Google (opsional); menerima surel, nama, foto profil, dan UID.',
                },
                {
                  en: 'Google LLC (Cloud Firestore): optional history sync; receives analysis results.',
                  id: 'Google LLC (Cloud Firestore): sinkronisasi riwayat (opsional); menerima hasil analisis.',
                },
                {
                  en: 'Google LLC (Cloud Run): hosting; receives IP addresses and request logs.',
                  id: 'Google LLC (Cloud Run): hosting; menerima alamat IP dan log permintaan.',
                },
                {
                  en: 'All our infrastructure runs on Google services. There are no ad networks, data brokers, or third-party analytics.',
                  id: 'Seluruh infrastruktur kami berjalan di atas layanan Google. Tidak ada jaringan iklan, pialang data, atau alat analitik pihak ketiga.',
                },
              ],
            },
            {
              heading: {
                en: '8.2 Cross-border transfer (Article 56 UU PDP)',
                id: '8.2 Transfer ke luar negeri (Pasal 56 UU PDP)',
              },
              paragraphs: [
                {
                  en: 'Your contract content is transferred outside the Republic of Indonesia, to Google’s infrastructure. Our basis for that transfer is your express consent, given at the consent gate before your first analysis, together with the data protection terms in Google’s service agreements.',
                  id: 'Isi kontrak Anda dikirim ke luar wilayah Republik Indonesia, yaitu ke infrastruktur Google. Dasar transfer kami adalah persetujuan tegas Anda yang diberikan pada gerbang persetujuan sebelum analisis pertama, disertai ketentuan perlindungan data dalam perjanjian layanan Google.',
                },
                {
                  en: 'If you do not want your contract to leave Indonesian jurisdiction, do not use this service.',
                  id: 'Jika Anda tidak ingin kontrak Anda keluar dari yurisdiksi Indonesia, jangan gunakan layanan ini.',
                },
              ],
            },
            {
              heading: { en: '8.3 Google’s use of the data', id: '8.3 Penggunaan data oleh Google' },
              paragraphs: [
                {
                  en: 'Whether input is used to improve Google’s models depends on the API tier in use. This project uses the paid/enterprise Vertex AI and Gemini API tiers, under which Google states it does not use customer input to train its foundation models. Google’s own terms govern that relationship and may change; we link to them rather than restate them.',
                  id: 'Apakah masukan dipakai untuk meningkatkan model Google bergantung pada tier API yang digunakan. Proyek ini memakai tier berbayar Vertex AI dan Gemini API, yang menurut ketentuan Google tidak menggunakan masukan pelanggan untuk melatih model dasarnya. Ketentuan Google sendiri yang mengatur hubungan tersebut dan dapat berubah; kami merujuk ke ketentuan itu, bukan menggantikannya.',
                },
              ],
            },
          ],
          callouts: [
            {
              tone: 'warning',
              body: {
                en: 'Practical advice: whatever the terms say, the safest step is still yours to take. Redact your national ID number, bank account number, and portrait photo before you submit anything.',
                id: 'Saran praktis: apa pun bunyi ketentuannya, langkah paling aman tetap ada di tangan Anda. Sensor NIK, nomor rekening, dan foto diri sebelum mengirimkan apa pun.',
              },
            },
          ],
        },

        {
          heading: {
            en: 'Your rights as a personal data subject',
            id: 'Hak Anda sebagai Subjek Data Pribadi',
          },
          paragraphs: [
            {
              en: 'Under Articles 5 to 15 UU PDP you have the following rights:',
              id: 'Sesuai Pasal 5 sampai dengan Pasal 15 UU PDP, Anda berhak atas hal-hal berikut:',
            },
          ],
          table: {
            head: [
              { en: 'Right (basis)', id: 'Hak (dasar)' },
              { en: 'What it means', id: 'Artinya' },
            ],
            rows: [
              [
                { en: 'Information (Art. 5)', id: 'Informasi (Ps. 5)' },
                {
                  en: 'To know the controller’s identity, the lawful basis, and the purpose of processing',
                  id: 'Mengetahui kejelasan identitas pengendali, dasar hukum, dan tujuan pemrosesan',
                },
              ],
              [
                { en: 'Completion and correction (Art. 6)', id: 'Melengkapi & memperbaiki (Ps. 6)' },
                {
                  en: 'To ask us to correct inaccurate data about you',
                  id: 'Meminta pembetulan data Anda yang tidak akurat',
                },
              ],
              [
                { en: 'Access and a copy (Art. 7)', id: 'Akses & salinan (Ps. 7)' },
                { en: 'To obtain access to and a copy of your data', id: 'Memperoleh akses dan salinan data Anda' },
              ],
              [
                {
                  en: 'Termination, erasure, destruction (Art. 8)',
                  id: 'Mengakhiri, menghapus, memusnahkan (Ps. 8)',
                },
                { en: 'To request deletion of your data', id: 'Meminta penghapusan data Anda' },
              ],
              [
                { en: 'Withdrawal of consent (Art. 9)', id: 'Menarik persetujuan (Ps. 9)' },
                { en: 'To withdraw your consent at any time', id: 'Mencabut persetujuan kapan saja' },
              ],
              [
                {
                  en: 'Objection to automated decisions (Art. 10)',
                  id: 'Keberatan atas keputusan otomatis (Ps. 10)',
                },
                {
                  en: 'Highly relevant here: our entire analysis is automated processing. You may object to decisions based solely on automated processing',
                  id: 'Sangat relevan di sini: seluruh analisis kami adalah pemrosesan otomatis. Anda berhak keberatan terhadap keputusan yang semata-mata didasarkan pada pemrosesan otomatis',
                },
              ],
              [
                { en: 'Postponement or restriction (Art. 11)', id: 'Menunda atau membatasi pemrosesan (Ps. 11)' },
                { en: 'To ask us to pause processing', id: 'Meminta pemrosesan dihentikan sementara' },
              ],
              [
                { en: 'Compensation (Art. 12)', id: 'Menuntut ganti rugi (Ps. 12)' },
                {
                  en: 'To claim for a breach of personal data protection',
                  id: 'Menuntut atas pelanggaran pelindungan data pribadi',
                },
              ],
              [
                { en: 'Portability (Art. 13)', id: 'Portabilitas (Ps. 13)' },
                {
                  en: 'To receive your data in a transferable form',
                  id: 'Memperoleh data Anda dalam bentuk yang dapat dipindahkan',
                },
              ],
            ],
          },
          subsections: [
            {
              heading: { en: 'How to exercise your rights', id: 'Cara menggunakan hak Anda' },
              bullets: [
                {
                  en: 'Delete local history: delete it from within the app, or clear your browser data. This lives on your device and is entirely under your control.',
                  id: 'Menghapus riwayat lokal: hapus dari dalam aplikasi, atau bersihkan data peramban Anda. Data ini ada di perangkat Anda dan sepenuhnya dalam kendali Anda.',
                },
                {
                  en: 'Delete synced history: delete it from the history list while signed in. Deletion in the app is immediate and does not depend on us, which matters because we do not yet publish a privacy contact address.',
                  id: 'Menghapus riwayat tersinkronisasi: hapus dari daftar riwayat saat Anda masuk. Penghapusan lewat aplikasi berlaku seketika dan tidak bergantung pada kami, dan itu penting karena kami belum mencantumkan alamat kontak privasi.',
                },
                {
                  en: 'Withdraw consent: clear your browser data for this site, which removes the stored consent record and re-triggers the consent gate on your next visit.',
                  id: 'Menarik persetujuan: bersihkan data peramban untuk situs ini, yang akan menghapus catatan persetujuan tersimpan dan menampilkan kembali gerbang persetujuan pada kunjungan berikutnya.',
                },
                {
                  en: 'Anything else: we do not yet publish a privacy contact address, so a request that cannot be completed in the app cannot be actioned by us today. We will add a channel to this page before the service leaves its competition stage. In the meantime, deleting your browser data removes everything held on your device, including your consent record.',
                  id: 'Permintaan lain: kami belum mencantumkan alamat kontak privasi, sehingga permintaan yang tidak dapat diselesaikan langsung di aplikasi belum dapat kami layani saat ini. Kanal kontak akan kami tambahkan di halaman ini sebelum layanan keluar dari tahap kompetisi. Sementara itu, menghapus data peramban akan menghapus seluruh data yang tersimpan di perangkat Anda, termasuk catatan persetujuan.',
                },
                {
                  en: 'Response time: we aim to respond within 7 working days.',
                  id: 'Waktu tanggapan: kami berupaya menanggapi dalam 7 hari kerja.',
                },
                {
                  en: 'Complaints: you may complain to the competent Indonesian personal data protection authority.',
                  id: 'Pengaduan: Anda dapat menyampaikan pengaduan kepada lembaga pelindungan data pribadi yang berwenang di Indonesia.',
                },
              ],
            },
          ],
          callouts: [
            {
              tone: 'info',
              body: {
                en: 'An honest note about the 24-hour cache: server-memory results are keyed by a cryptographic fingerprint of the contract text and expire by themselves within 24 hours. We cannot trace a cache entry back to you as an individual, so we cannot action an individual deletion request against a cache entry; it deletes itself within 24 hours or on server restart.',
                id: 'Catatan jujur tentang cache 24 jam: hasil di memori server diindeks dengan sidik jari kriptografis dari teks kontrak dan hilang dengan sendirinya dalam 24 jam. Kami tidak dapat menelusuri entri cache kembali kepada Anda secara perorangan, sehingga permintaan penghapusan individual atas entri cache tidak dapat kami laksanakan secara langsung; entri tersebut akan terhapus sendiri dalam 24 jam atau saat server dimulai ulang.',
              },
            },
          ],
        },

        {
          heading: { en: 'Security', id: 'Keamanan' },
          paragraphs: [
            {
              en: 'Technical and organisational measures we apply:',
              id: 'Langkah teknis dan organisasi yang kami terapkan:',
            },
          ],
          bullets: [
            { en: 'All traffic is encrypted with HTTPS/TLS.', id: 'Seluruh lalu lintas dienkripsi dengan HTTPS/TLS.' },
            {
              en: 'PDF files are parsed inside your browser: the file itself is never uploaded, only the extracted text.',
              id: 'Berkas PDF diurai di dalam peramban Anda: berkasnya sendiri tidak pernah diunggah, hanya teks hasil uraiannya.',
            },
            {
              en: 'Raw contract text is never written to a database.',
              id: 'Teks mentah kontrak tidak pernah ditulis ke basis data.',
            },
            {
              en: 'Our internal service-to-service calls are protected by a shared secret header.',
              id: 'Komunikasi antar-layanan kami dilindungi header rahasia bersama.',
            },
            {
              en: 'Firestore security rules are deny-by-default and restrict every document to its owner (request.auth.uid == userId).',
              id: 'Aturan keamanan Firestore bersifat tolak-secara-bawaan dan membatasi setiap dokumen hanya kepada pemiliknya (request.auth.uid == userId).',
            },
            { en: 'Rate limiting is applied per IP address.', id: 'Pembatasan laju permintaan diterapkan per alamat IP.' },
          ],
          callouts: [
            {
              tone: 'warning',
              body: {
                en: 'Limitations you should know: our rate limiting is held in each server instance’s memory and reads the client IP from a request header, so it can be evaded. No system is perfectly secure, and this service has not undergone an independent security audit.',
                id: 'Keterbatasan yang perlu Anda ketahui: pembatasan laju permintaan kami disimpan di memori tiap instans server dan membaca alamat IP dari header permintaan, sehingga dapat dilewati. Tidak ada sistem yang sepenuhnya aman, dan layanan ini belum menjalani audit keamanan independen.',
              },
            },
          ],
        },

        {
          heading: { en: 'Data breaches', id: 'Insiden dan kebocoran data' },
          paragraphs: [
            {
              en: 'If a personal data protection failure occurs, we will notify you and the competent authority in writing within 3 × 24 hours of becoming aware of it, in accordance with Article 46 UU PDP, describing the data exposed, when and how it was exposed, and the steps we have taken.',
              id: 'Apabila terjadi kegagalan pelindungan data pribadi, kami akan memberitahukannya secara tertulis kepada Anda dan kepada lembaga yang berwenang paling lambat 3 × 24 jam sejak diketahui, sesuai Pasal 46 UU PDP, disertai keterangan mengenai data yang terungkap, waktu dan cara terungkapnya, serta upaya penanganan yang kami lakukan.',
            },
          ],
        },

        {
          heading: { en: 'Children’s data', id: 'Data anak' },
          paragraphs: [
            {
              en: 'The Service is not intended for children under 15. Processing of a child’s personal data is carried out on the basis of parental or guardian consent under Article 25 UU PDP. If you are a parent or guardian and believe your child has submitted personal data to us, clearing the browser data on the device removes everything stored locally; anything synced to an account can be deleted from the history list inside the app.',
              id: 'Layanan tidak ditujukan bagi anak di bawah 15 tahun. Pemrosesan data pribadi anak dilakukan berdasarkan persetujuan orang tua atau wali sesuai Pasal 25 UU PDP. Jika Anda orang tua atau wali dan mengetahui anak Anda telah mengirimkan data pribadi kepada kami, membersihkan data peramban pada perangkat tersebut akan menghapus seluruh data yang tersimpan secara lokal; data yang tersinkronisasi ke akun dapat dihapus dari daftar riwayat di dalam aplikasi.',
            },
          ],
        },

        {
          heading: { en: 'Data Protection Officer', id: 'Pejabat Pelindungan Data Pribadi' },
          paragraphs: [
            {
              en: 'Article 53 UU PDP requires the appointment of a Data Protection Officer in certain circumstances, including where core activities involve large-scale processing of specific personal data. Because this service routinely processes personal financial data, whether that obligation applies is under assessment as the project moves beyond its competition stage. No officer has been appointed and no privacy contact address is published yet. Both will be added to this page before the service leaves its competition stage.',
              id: 'Pasal 53 UU PDP mewajibkan penunjukan Pejabat Pelindungan Data Pribadi dalam keadaan tertentu, termasuk apabila kegiatan inti berupa pemrosesan data pribadi bersifat spesifik dalam skala besar. Karena layanan ini secara rutin memproses data keuangan pribadi, keberlakuan kewajiban tersebut sedang dinilai seiring proyek ini berkembang di luar tahap kompetisi. Sampai saat ini pejabat tersebut belum ditunjuk dan alamat kontak privasi belum dicantumkan. Keduanya akan ditambahkan pada halaman ini sebelum layanan keluar dari tahap kompetisi.',
            },
          ],
        },

        {
          heading: { en: 'Changes to this policy', id: 'Perubahan kebijakan' },
          paragraphs: [
            {
              en: 'This policy is versioned and dated. For changes that materially affect how we process your data, we will display an in-service notice and, where necessary, ask you to consent again. Previous versions are available on request.',
              id: 'Kebijakan ini bernomor versi dan bertanggal. Untuk perubahan yang berdampak material terhadap cara kami memproses data Anda, kami akan menampilkan pemberitahuan di dalam layanan dan, bila diperlukan, meminta persetujuan ulang Anda. Versi terdahulu tersedia atas permintaan.',
            },
          ],
        },

        {
          heading: { en: 'Contact', id: 'Kontak' },
          paragraphs: [
            {
              en: 'KawalKontrak.ai does not yet operate a monitored privacy address, and we would rather say so than print an address nobody reads. Until one exists, the controls inside the app are the real remedy: delete individual entries or clear your browser data, and everything held about you is gone. To complain to a supervisory authority you do not need to go through us at all.',
              id: 'KawalKontrak.ai belum mengoperasikan alamat privasi yang benar-benar dipantau, dan kami memilih menyatakannya terus terang daripada mencantumkan alamat yang tidak dibaca. Selama itu belum ada, kendali di dalam aplikasi adalah pemulihan yang nyata: hapus entri satu per satu atau bersihkan data peramban, dan seluruh data tentang Anda ikut hilang. Untuk mengadu ke lembaga pengawas, Anda tidak perlu melalui kami sama sekali.',
            },
          ],
        },
      ]}
    />
  );
}

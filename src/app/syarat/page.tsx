import { LegalPageContent } from '@/components/LegalPageContent';

export const metadata = {
  title: 'Syarat Layanan',
  description:
    'Syarat Layanan KawalKontrak.ai: persetujuan pengguna, kelayakan usia, penggunaan yang diperbolehkan, hak atas konten, batas tanggung jawab, dan penyelesaian sengketa menurut hukum Indonesia.',
};

export default function TermsPage() {
  return (
    <LegalPageContent
      slug="syarat"
      autoNumber={false}
      title={{ en: 'Terms of Service', id: 'Syarat Layanan' }}
      tagline={{
        en: 'These Terms govern your use of KawalKontrak.ai. Together with the Disclaimer and the Privacy Policy, they form the whole agreement between you and us.',
        id: 'Syarat Layanan ini mengatur penggunaan KawalKontrak.ai oleh Anda. Bersama Disclaimer dan Kebijakan Privasi, ketiganya merupakan keseluruhan kesepakatan antara Anda dan kami.',
      }}
      summary={{
        title: { en: 'Non-binding summary', id: 'Ringkasan (tidak mengikat)' },
        bullets: [
          {
            en: 'This service is free, built by a student team, powered by AI, and can be wrong.',
            id: 'Layanan ini gratis, dibuat oleh tim mahasiswa, dijalankan oleh AI, dan bisa salah.',
          },
          {
            en: 'It is not legal advice. You use it at your own risk.',
            id: 'Ia bukan nasihat hukum. Anda memakainya atas risiko Anda sendiri.',
          },
          {
            en: 'We limit our liability as far as the law allows, but we do not exclude liability for our own intentional misconduct or gross negligence, because Indonesian law does not permit that.',
            id: 'Kami membatasi tanggung jawab kami sejauh diizinkan hukum, tetapi kami tidak membebaskan diri dari akibat kesengajaan atau kelalaian berat kami, karena hukum Indonesia tidak mengizinkannya.',
          },
          {
            en: 'This summary is for convenience only; only the articles below are binding.',
            id: 'Ringkasan ini hanya untuk memudahkan; yang mengikat adalah pasal-pasal di bawah.',
          },
        ],
      }}
      sections={[
        {
          heading: { en: 'Article 1: Definitions', id: 'Pasal 1: Definisi' },
          numbered: [
            {
              en: '"Service" means the KawalKontrak.ai website and all its features, APIs, and interfaces.',
              id: '"Layanan" berarti situs web KawalKontrak.ai beserta seluruh fitur, API, dan antarmukanya.',
            },
            {
              en: '"We" means the provider named at the top of this page together with its development team, members, and contributors.',
              id: '"Kami" berarti penyelenggara yang disebut di bagian atas halaman ini beserta tim pengembang, anggota, dan kontributornya.',
            },
            {
              en: '"You" or "User" means any person who accesses the Service.',
              id: '"Anda" atau "Pengguna" berarti setiap orang yang mengakses Layanan.',
            },
            {
              en: '"User Content" means the contract text, files, photographs, and other information you submit to the Service.',
              id: '"Konten Pengguna" berarti teks kontrak, berkas, foto, dan informasi lain yang Anda kirimkan ke Layanan.',
            },
            {
              en: '"Output" means the analysis reports, findings, risk levels, explanations, negotiation recommendations, and email templates the Service generates.',
              id: '"Keluaran" berarti laporan analisis, temuan, tingkat risiko, penjelasan, rekomendasi negosiasi, dan templat surel yang dihasilkan Layanan.',
            },
            {
              en: '"Related Documents" means the Disclaimer and the Privacy Policy, which form an integral part of these Terms.',
              id: '"Dokumen Terkait" berarti Disclaimer dan Kebijakan Privasi, yang merupakan bagian tidak terpisahkan dari Syarat Layanan ini.',
            },
          ],
        },

        {
          heading: { en: 'Article 2: Your agreement', id: 'Pasal 2: Persetujuan Anda' },
          numbered: [
            {
              en: 'Before your first analysis, the Service displays a consent gate. You must actively tick the acknowledgement. The Service will not process your contract until you do.',
              id: 'Sebelum analisis pertama Anda, Layanan akan menampilkan gerbang persetujuan. Anda harus secara aktif mencentang pernyataan persetujuan. Layanan tidak akan memproses kontrak Anda sebelum Anda melakukannya.',
            },
            {
              en: 'By ticking it and using the Service, you confirm you have read, understood, and agree to these Terms and the Related Documents.',
              id: 'Dengan mencentang pernyataan tersebut dan menggunakan Layanan, Anda menyatakan telah membaca, memahami, dan menyetujui Syarat Layanan ini beserta Dokumen Terkait.',
            },
            {
              en: 'This electronic consent is valid and binding under Law No. 11 of 2008 on Electronic Information and Transactions, as amended, most recently by Law No. 1 of 2024.',
              id: 'Persetujuan elektronik ini sah dan mengikat berdasarkan Undang-Undang No. 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik sebagaimana telah beberapa kali diubah, terakhir dengan Undang-Undang No. 1 Tahun 2024.',
            },
            {
              en: 'We record the document version, the language, and the time of your consent.',
              id: 'Kami mencatat versi dokumen, bahasa, dan waktu Anda memberikan persetujuan.',
            },
            {
              en: 'If you do not agree, do not use the Service. Declining simply returns you to the home page and carries no consequence for you.',
              id: 'Jika Anda tidak setuju, jangan gunakan Layanan. Menolak hanya akan mengembalikan Anda ke halaman utama dan tidak menimbulkan konsekuensi apa pun bagi Anda.',
            },
          ],
        },

        {
          heading: { en: 'Article 3: Eligibility and age', id: 'Pasal 3: Kelayakan dan usia' },
          numbered: [
            {
              en: 'You must be 18 years of age or older to use the Service on your own.',
              id: 'Anda harus berusia 18 tahun atau lebih untuk menggunakan Layanan secara mandiri.',
            },
            {
              en: 'If you are 15 to 17, you may use the Service only with the knowledge, supervision, and consent of your parent or guardian, who gives consent to these Terms on your behalf.',
              id: 'Jika Anda berusia 15 sampai dengan 17 tahun, Anda hanya boleh menggunakan Layanan dengan sepengetahuan, pendampingan, dan persetujuan orang tua atau wali Anda. Persetujuan atas Syarat Layanan ini diberikan oleh orang tua atau wali tersebut.',
            },
            {
              en: 'The Service is not intended for anyone under 15, and we do not intend to process their personal data. If we learn that we have, we will delete it.',
              id: 'Layanan tidak ditujukan bagi siapa pun yang berusia di bawah 15 tahun dan kami tidak bermaksud memproses data pribadi mereka. Jika kami mengetahui hal itu terjadi, kami akan menghapus data terkait.',
            },
            {
              en: 'You confirm that you have the legal capacity to enter into these Terms.',
              id: 'Anda menyatakan bahwa Anda cakap secara hukum untuk mengikatkan diri pada Syarat Layanan ini.',
            },
            {
              en: 'The Service covers only employment agreements governed by Indonesian labour law.',
              id: 'Layanan hanya ditujukan untuk perjanjian kerja yang tunduk pada hukum ketenagakerjaan Indonesia.',
            },
          ],
        },

        {
          heading: { en: 'Article 4: Nature of the Service', id: 'Pasal 4: Sifat Layanan' },
          numbered: [
            {
              en: 'The Service is provided free of charge. There are no fees, subscriptions, advertising, or data sales.',
              id: 'Layanan disediakan gratis. Tidak ada biaya, langganan, iklan, atau penjualan data.',
            },
            {
              en: 'The Service is a competition/hackathon project built by a student team and does not yet have a registered legal entity. It may change, be suspended, or be discontinued at any time.',
              id: 'Layanan berstatus proyek kompetisi/hackathon yang dibuat oleh tim mahasiswa dan belum berbadan hukum. Layanan dapat berubah, dihentikan sementara, atau dihentikan selamanya sewaktu-waktu.',
            },
            {
              en: 'Because the Service is free and experimental, no service level is promised.',
              id: 'Karena Layanan gratis dan bersifat eksperimental, tidak ada tingkat ketersediaan (service level) yang dijanjikan.',
            },
          ],
        },

        {
          heading: { en: 'Article 5: Not legal advice', id: 'Pasal 5: Bukan nasihat hukum' },
          numbered: [
            {
              en: 'The Output is general information for education and legal literacy, not legal advice, not a legal opinion, and not legal services within the meaning of Law No. 18 of 2003 on Advocates.',
              id: 'Keluaran Layanan adalah informasi umum untuk tujuan edukasi dan literasi hukum, bukan nasihat hukum, bukan pendapat hukum, dan bukan jasa hukum sebagaimana dimaksud dalam Undang-Undang No. 18 Tahun 2003 tentang Advokat.',
            },
            {
              en: 'No advocate–client relationship arises, and no professional duty of confidentiality applies between you and us.',
              id: 'Tidak ada hubungan advokat–klien yang terbentuk. Tidak ada kewajiban kerahasiaan profesional yang berlaku antara Anda dan Kami.',
            },
            {
              en: 'We do not represent you and will not act on your behalf towards any party.',
              id: 'Kami tidak mewakili Anda dan tidak akan bertindak atas nama Anda terhadap pihak mana pun.',
            },
            {
              en: 'The Service’s limitations and failure modes are set out in detail in the Disclaimer, which you must read before relying on any Output.',
              id: 'Batasan, kelemahan, dan mode kegagalan Layanan diuraikan secara rinci di dalam Disclaimer, yang wajib Anda baca sebelum mengandalkan Keluaran apa pun.',
            },
          ],
        },

        {
          heading: { en: 'Article 6: Optional accounts and history', id: 'Pasal 6: Akun (opsional) dan riwayat' },
          numbered: [
            { en: 'You may use the Service without creating an account.', id: 'Anda dapat menggunakan Layanan tanpa membuat akun.' },
            {
              en: 'If you choose to sign in with Google (Firebase Authentication), your analysis history may be synced to Cloud Firestore and is accessible only by your own account.',
              id: 'Jika Anda memilih masuk dengan Google (Firebase Authentication), riwayat hasil analisis Anda dapat disinkronkan ke Cloud Firestore dan hanya dapat diakses oleh akun Anda sendiri.',
            },
            {
              en: 'Demo mode. In deployments where Firebase is not configured, "signing in" is a local simulation: you are not actually authenticated and nothing is synced. The Service must display a demo-mode indicator in that state. Do not assume your history is stored on a server in that case.',
              id: 'Mode demo. Pada penerapan tertentu di mana Firebase tidak dikonfigurasi, fitur "masuk" adalah simulasi lokal: Anda tidak benar-benar terautentikasi dan tidak ada data yang tersinkronisasi. Layanan wajib menampilkan penanda mode demo bila keadaan ini berlaku. Jangan menganggap riwayat Anda tersimpan di server dalam keadaan tersebut.',
            },
            {
              en: 'You are responsible for the security of the Google account you use to sign in.',
              id: 'Anda bertanggung jawab menjaga keamanan akun Google yang Anda pakai untuk masuk.',
            },
          ],
        },

        {
          heading: { en: 'Article 7: Acceptable use', id: 'Pasal 7: Penggunaan yang diperbolehkan dan dilarang' },
          paragraphs: [{ en: 'You agree not to:', id: 'Anda setuju tidak untuk:' }],
          numbered: [
            {
              en: 'upload documents that are not yours, that you have no right to process, or that are subject to a confidentiality obligation binding on you;',
              id: 'mengunggah dokumen yang bukan milik Anda dan tidak Anda miliki hak untuk memprosesnya, atau yang tunduk pada kewajiban kerahasiaan yang mengikat Anda;',
            },
            {
              en: 'upload another person’s personal data without a lawful basis;',
              id: 'mengunggah data pribadi orang lain tanpa dasar yang sah;',
            },
            {
              en: 'submit personal data unnecessary to the analysis: we ask you to redact your national ID (NIK), bank account, passport number, health data, and portrait photograph before sending;',
              id: 'mengirimkan data pribadi yang tidak diperlukan untuk analisis: kami meminta Anda menyensor NIK, nomor rekening, nomor paspor, data kesehatan, dan foto diri sebelum mengirim;',
            },
            {
              en: 'use the Service to provide paid legal services to third parties as though our Output were a professional review;',
              id: 'menggunakan Layanan untuk memberikan jasa hukum berbayar kepada pihak ketiga seolah-olah Keluaran kami adalah hasil pemeriksaan profesional;',
            },
            {
              en: 'present Output to third parties without the accompanying warning that it is AI-generated and may be wrong;',
              id: 'menyajikan Keluaran kepada pihak ketiga tanpa menyertakan peringatan bahwa Keluaran dihasilkan AI dan dapat keliru;',
            },
            {
              en: 'scrape, crawl, or otherwise automate access to the Service beyond ordinary human use;',
              id: 'mengambil, menyalin, atau menyerap Layanan secara otomatis (scraping, crawling, bot) di luar penggunaan wajar oleh manusia;',
            },
            {
              en: 'circumvent or attempt to circumvent rate limits, security checks, or access controls;',
              id: 'melewati atau berupaya melewati pembatasan laju permintaan, pemeriksaan keamanan, atau kontrol akses;',
            },
            {
              en: 'reverse engineer, decompile, or attempt to extract model instructions, keys, or system secrets;',
              id: 'melakukan rekayasa balik, membongkar, atau berupaya mengekstraksi instruksi model, kunci, atau rahasia sistem;',
            },
            {
              en: 'attack, overload, or disrupt the Service or the third-party infrastructure we use;',
              id: 'menyerang, membebani, atau mengganggu Layanan atau infrastruktur pihak ketiga yang kami gunakan;',
            },
            { en: 'upload malware or unlawful content;', id: 'mengunggah perangkat lunak berbahaya atau konten melawan hukum;' },
            {
              en: 'use the Service for any purpose contrary to the law of the Republic of Indonesia.',
              id: 'menggunakan Layanan untuk tujuan yang melanggar hukum Republik Indonesia.',
            },
          ],
        },

        {
          heading: {
            en: 'Article 8: User Content and limited licence',
            id: 'Pasal 8: Konten Pengguna dan lisensi terbatas',
          },
          numbered: [
            {
              en: 'User Content remains yours. We claim no ownership of your contract.',
              id: 'Konten Pengguna tetap milik Anda. Kami tidak mengklaim kepemilikan atas kontrak Anda.',
            },
            {
              en: 'You grant us a non-exclusive, limited, royalty-free licence for the duration of processing only, solely to receive, parse, and transmit User Content to the third-party processors named in the Privacy Policy in order to generate Output for you.',
              id: 'Anda memberikan kepada Kami lisensi non-eksklusif, terbatas, bebas royalti, dan berjangka waktu selama pemrosesan berlangsung, semata-mata untuk menerima, mengurai, dan meneruskan Konten Pengguna kepada pemroses pihak ketiga yang disebut dalam Kebijakan Privasi, guna menghasilkan Keluaran untuk Anda.',
            },
            {
              en: 'That licence ends when processing completes and the retention periods described in the Privacy Policy expire.',
              id: 'Lisensi ini berakhir ketika pemrosesan selesai dan masa simpan yang diuraikan dalam Kebijakan Privasi berakhir.',
            },
            {
              en: 'We do not use User Content for advertising, sale, or to train our own models.',
              id: 'Kami tidak menggunakan Konten Pengguna untuk iklan, penjualan, atau untuk melatih model kami sendiri.',
            },
            {
              en: 'Google’s use of User Content as a processor is addressed in Section 8 of the Privacy Policy.',
              id: 'Mengenai penggunaan Konten Pengguna oleh Google sebagai pemroses, berlaku ketentuan dalam Kebijakan Privasi Bagian 8.',
            },
            {
              en: 'You represent and warrant that you are entitled to submit the User Content you submit.',
              id: 'Anda menyatakan dan menjamin bahwa Anda berhak mengirimkan Konten Pengguna yang Anda kirimkan.',
            },
          ],
        },

        {
          heading: { en: 'Article 9: Intellectual property', id: 'Pasal 9: Hak kekayaan intelektual' },
          numbered: [
            {
              en: 'The Service, its source code, interface, knowledge-base structure, AI prompt design, marks, logo, and the name "KawalKontrak.ai" belong to us or our licensors, except where stated otherwise.',
              id: 'Layanan, kode sumber, antarmuka, susunan basis pengetahuan, rancangan instruksi AI, merek, logo, dan nama "KawalKontrak.ai" adalah milik Kami atau pemberi lisensi Kami, kecuali dinyatakan lain.',
            },
            {
              en: 'We claim no copyright in the text of Indonesian legislation.',
              id: 'Teks peraturan perundang-undangan Republik Indonesia bukan objek hak cipta yang kami klaim.',
            },
            {
              en: 'Output generated for you may be used, stored, printed, and shared for your personal purposes and for negotiating with your employer, free of charge, provided you do not remove or obscure the accompanying warnings.',
              id: 'Keluaran yang dihasilkan untuk Anda boleh Anda gunakan, simpan, cetak, dan bagikan untuk keperluan pribadi maupun untuk berunding dengan pemberi kerja Anda, secara gratis, dengan syarat Anda tidak menghapus atau menyembunyikan peringatan yang menyertainya.',
            },
            {
              en: 'You may not use our marks or logo in a way suggesting that we endorse, verify, or guarantee your work or that of any third party.',
              id: 'Anda dilarang menggunakan merek dan logo Kami dengan cara yang menimbulkan kesan bahwa Kami mendukung, memverifikasi, atau menjamin hasil kerja Anda atau pihak ketiga.',
            },
          ],
        },

        {
          heading: { en: 'Article 10: No warranty', id: 'Pasal 10: Tanpa jaminan' },
          numbered: [
            {
              en: 'The Service is provided "as is" and "as available".',
              id: 'Layanan disediakan "sebagaimana adanya" dan "sebagaimana tersedia".',
            },
            {
              en: 'To the extent permitted by law, we make no warranty, express or implied, as to the accuracy, completeness, currency, or reliability of the Output; its fitness for your legal situation; uninterrupted or error-free availability; or the absolute security of any system.',
              id: 'Sejauh diizinkan hukum, Kami tidak memberikan jaminan apa pun, tersurat maupun tersirat, mengenai keakuratan, kelengkapan, kemutakhiran, atau keandalan Keluaran; kesesuaian Keluaran dengan keadaan hukum Anda; ketersediaan Layanan tanpa gangguan atau kesalahan; atau keamanan mutlak dari sistem mana pun.',
            },
            {
              en: 'In particular, we do not warrant that the Service will find every problem in your contract, nor that anything it flags is in fact unlawful.',
              id: 'Kami secara khusus tidak menjamin bahwa Layanan akan menemukan seluruh masalah di dalam kontrak Anda, maupun bahwa hal yang ditandai Layanan benar melanggar hukum.',
            },
            {
              en: 'This article must be read together with the Disclaimer, which sets out the failure modes we already know about.',
              id: 'Pasal ini harus dibaca bersama Disclaimer, yang menguraikan mode kegagalan yang telah kami ketahui.',
            },
          ],
        },

        {
          heading: { en: 'Article 11: Liability', id: 'Pasal 11: Tanggung jawab' },
          callouts: [
            {
              tone: 'info',
              body: {
                en: 'This article is drafted to remain enforceable under Law No. 8 of 1999 on Consumer Protection, which limits how far a provider may shift its responsibility through standard-form clauses.',
                id: 'Pasal ini disusun agar tetap dapat diberlakukan menurut Undang-Undang No. 8 Tahun 1999 tentang Perlindungan Konsumen, yang membatasi sejauh mana penyedia dapat mengalihkan tanggung jawabnya melalui klausula baku.',
              },
            },
          ],
          subsections: [
            {
              heading: { en: '11.1 What we do not exclude', id: '11.1 Yang tidak Kami kesampingkan' },
              paragraphs: [
                {
                  en: 'Nothing in these Terms limits or excludes our liability for:',
                  id: 'Tidak ada satu pun ketentuan dalam Syarat Layanan ini yang membatasi atau meniadakan tanggung jawab Kami atas:',
                },
              ],
              bullets: [
                {
                  en: 'our intentional misconduct (opzet) or gross negligence (culpa lata);',
                  id: 'kesengajaan (opzet) atau kelalaian berat (culpa lata) Kami;',
                },
                { en: 'death or personal injury caused by us;', id: 'kematian atau cedera badan yang disebabkan oleh Kami;' },
                {
                  en: 'our breach of Law No. 27 of 2022 on Personal Data Protection; and',
                  id: 'pelanggaran Kami atas Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi; dan',
                },
                {
                  en: 'anything else that applicable law does not permit us to exclude, including Article 18 of Law No. 8 of 1999.',
                  id: 'hal-hal lain yang menurut hukum yang berlaku tidak dapat dikesampingkan, termasuk Pasal 18 Undang-Undang No. 8 Tahun 1999.',
                },
              ],
            },
            {
              heading: { en: '11.2 Otherwise', id: '11.2 Di luar hal-hal pada ayat (1)' },
              paragraphs: [
                {
                  en: 'So far as the law allows, we are not liable for:',
                  id: 'Sejauh diizinkan hukum, Kami tidak bertanggung jawab atas:',
                },
              ],
              bullets: [
                {
                  en: 'decisions you take in reliance on the Output;',
                  id: 'keputusan yang Anda ambil dengan mengandalkan Keluaran;',
                },
                {
                  en: 'indirect or consequential loss, lost profits, lost employment opportunity, or reputational harm;',
                  id: 'kerugian tidak langsung, kerugian turunan, kehilangan keuntungan, kehilangan kesempatan kerja, atau kerugian atas reputasi;',
                },
                {
                  en: 'interruption, delay, or unavailability of the Service;',
                  id: 'gangguan, kelambatan, atau ketidaktersediaan Layanan;',
                },
                {
                  en: 'acts or omissions of third-party processors outside our reasonable control;',
                  id: 'tindakan atau kelalaian pemroses pihak ketiga yang berada di luar kendali wajar Kami;',
                },
                {
                  en: 'use of the Service on documents that are not Indonesian employment contracts.',
                  id: 'penggunaan Layanan atas dokumen yang bukan perjanjian kerja Indonesia.',
                },
              ],
            },
            {
              heading: { en: '11.3 Allocation of responsibility', id: '11.3 Pembagian tanggung jawab' },
              paragraphs: [
                {
                  en: 'You acknowledge that the Service states clearly and repeatedly that the Output may be wrong and must not be your sole basis for a decision. To the extent you nonetheless take an irreversible step without competent verification, that is your own choice.',
                  id: 'Anda mengakui bahwa Layanan telah menyatakan secara jelas dan berulang bahwa Keluaran dapat keliru dan tidak boleh menjadi satu-satunya dasar pengambilan keputusan. Sejauh Anda tetap mengambil keputusan yang tidak dapat ditarik kembali tanpa memverifikasinya kepada pihak yang berkompeten, hal itu merupakan pilihan Anda sendiri.',
                },
              ],
            },
            {
              heading: { en: '11.4 Cap on liability', id: '11.4 Batas nilai tanggung jawab' },
              paragraphs: [
                {
                  en: 'The Service is provided at no charge. Accordingly, so far as the law allows, our aggregate liability is limited to the amount a competent court determines to be reasonable in the circumstances. We do not stipulate a fixed monetary cap, because a cap imposed on a consumer through a standard-form clause may itself be unenforceable under Article 18 of Law No. 8 of 1999.',
                  id: 'Layanan diberikan tanpa biaya. Karena itu, sejauh diizinkan hukum, tanggung jawab Kami secara keseluruhan dibatasi pada jumlah yang ditetapkan pengadilan yang berwenang sebagai layak menurut keadaan. Kami tidak mencantumkan batas nominal tetap, karena pembatasan yang dibebankan kepada konsumen melalui klausula baku justru berisiko tidak dapat diberlakukan menurut Pasal 18 Undang-Undang No. 8 Tahun 1999.',
                },
              ],
            },
            {
              heading: { en: '11.5 Scope', id: '11.5 Ruang lingkup' },
              paragraphs: [
                {
                  en: 'This article applies to claims in contract (wanprestasi) and in tort (Article 1365 of the Indonesian Civil Code) alike.',
                  id: 'Ketentuan ini berlaku baik terhadap tuntutan berdasarkan wanprestasi maupun perbuatan melawan hukum (Pasal 1365 KUH Perdata).',
                },
              ],
            },
          ],
        },

        {
          heading: { en: 'Article 12: Indemnity', id: 'Pasal 12: Ganti rugi dari Anda' },
          numbered: [
            {
              en: 'You agree to indemnify us against third-party claims arising directly from: uploading documents you had no right to process; uploading another person’s personal data without a lawful basis; presenting Output to third parties without its accompanying warnings or as though it were professional review; or your breach of Article 7.',
              id: 'Anda setuju untuk membebaskan dan mengganti kerugian Kami dari tuntutan pihak ketiga yang timbul secara langsung dari: pengunggahan dokumen yang tidak berhak Anda proses; pengunggahan data pribadi orang lain tanpa dasar yang sah; penyajian Keluaran kepada pihak ketiga tanpa peringatan yang menyertainya atau seolah-olah pemeriksaan profesional; atau pelanggaran Anda atas Pasal 7.',
            },
            {
              en: 'This obligation does not apply to the extent the loss was caused by our own fault, and is limited to demonstrable actual loss.',
              id: 'Kewajiban pada ayat (1) tidak berlaku sejauh kerugian tersebut disebabkan oleh kesalahan Kami sendiri, dan dibatasi pada kerugian nyata yang dapat dibuktikan.',
            },
            {
              en: 'We will notify you of any such claim and give you a reasonable opportunity to participate in the response.',
              id: 'Kami akan memberi tahu Anda tentang tuntutan tersebut dan memberi Anda kesempatan wajar untuk turut menanggapinya.',
            },
          ],
        },

        {
          heading: { en: 'Article 13: Suspension and termination', id: 'Pasal 13: Penangguhan dan penghentian' },
          numbered: [
            {
              en: 'You may stop using the Service at any time, without notice.',
              id: 'Anda dapat berhenti menggunakan Layanan kapan saja tanpa pemberitahuan.',
            },
            {
              en: 'We may suspend or terminate your access if you breach Article 7, where necessary to protect the Service or other users, or where required by law.',
              id: 'Kami dapat menangguhkan atau menghentikan akses Anda apabila Anda melanggar Pasal 7, apabila diperlukan untuk melindungi Layanan atau Pengguna lain, atau apabila diwajibkan oleh hukum.',
            },
            {
              en: 'Except in urgent cases or where prohibited by law, we will give reasons and a reasonable opportunity to respond through whichever contact channel is published on this page at the time.',
              id: 'Kecuali dalam keadaan mendesak atau ketika dilarang hukum, Kami akan menyampaikan alasan penangguhan dan memberi Anda kesempatan untuk menanggapi melalui kanal kontak yang saat itu dicantumkan pada halaman ini.',
            },
            {
              en: 'We may discontinue the Service entirely at any time. Where feasible, we will announce this at least 30 days in advance so you can export your history.',
              id: 'Kami dapat menghentikan seluruh Layanan sewaktu-waktu. Bila memungkinkan, Kami akan mengumumkannya sekurang-kurangnya 30 hari sebelumnya agar Anda dapat mengunduh riwayat Anda.',
            },
          ],
        },

        {
          heading: { en: 'Article 14: Changes to these Terms', id: 'Pasal 14: Perubahan Syarat Layanan' },
          numbered: [
            {
              en: 'We may amend these Terms. Each version carries a version number and an effective date, both shown at the top of this page.',
              id: 'Kami dapat mengubah Syarat Layanan ini. Setiap versi memiliki nomor versi dan tanggal berlaku, keduanya ditampilkan di bagian atas halaman ini.',
            },
            {
              en: 'For changes that are materially adverse to you, we will display an in-service notice and ask you to consent again before your next analysis.',
              id: 'Untuk perubahan yang merugikan Anda secara material, Kami akan menampilkan pemberitahuan di dalam Layanan dan meminta persetujuan ulang Anda sebelum analisis berikutnya.',
            },
            {
              en: 'For non-material changes, notice on this page is sufficient.',
              id: 'Untuk perubahan yang tidak material, pemberitahuan melalui halaman ini sudah cukup.',
            },
            {
              en: 'If you do not accept a change, stop using the Service; you may request deletion of your data under the Privacy Policy.',
              id: 'Jika Anda tidak menyetujui perubahan, hentikan penggunaan Layanan; Anda dapat meminta penghapusan data Anda sesuai Kebijakan Privasi.',
            },
          ],
        },

        {
          heading: { en: 'Article 15: Force majeure', id: 'Pasal 15: Keadaan kahar' },
          paragraphs: [
            {
              en: 'We are not liable for failures of performance caused by events beyond our reasonable control, including natural disaster, network or power failure, cloud provider outage, government action, or cyber-attack.',
              id: 'Kami tidak bertanggung jawab atas kegagalan pelaksanaan yang disebabkan keadaan di luar kendali wajar Kami, termasuk bencana alam, gangguan jaringan atau listrik, kegagalan penyedia layanan awan, tindakan pemerintah, atau serangan siber.',
            },
          ],
        },

        {
          heading: {
            en: 'Article 16: Governing law and dispute resolution',
            id: 'Pasal 16: Hukum yang berlaku dan penyelesaian sengketa',
          },
          numbered: [
            {
              en: 'These Terms are governed by and construed in accordance with the law of the Republic of Indonesia.',
              id: 'Syarat Layanan ini tunduk pada dan ditafsirkan menurut hukum Republik Indonesia.',
            },
            {
              en: 'First stage: amicable settlement. Send your complaint through the contact channel published on this page. We will respond within 14 working days and try to resolve the matter amicably within 30 calendar days. Where no channel is published yet, this stage does not bar you from going straight to the second stage.',
              id: 'Tahap pertama: musyawarah. Sampaikan keluhan Anda melalui kanal kontak yang dicantumkan pada halaman ini. Kami akan menanggapi dalam 14 (empat belas) hari kerja dan berupaya menyelesaikannya secara musyawarah dalam 30 (tiga puluh) hari kalender. Selama belum ada kanal yang dicantumkan, tahap ini tidak menghalangi Anda menempuh tahap kedua secara langsung.',
            },
            {
              en: 'Second stage. If that fails, you may choose either the Consumer Dispute Settlement Body (BPSK) in your area of residence, or a claim before the competent District Court.',
              id: 'Tahap kedua. Apabila musyawarah tidak mencapai kesepakatan, Anda dapat memilih penyelesaian melalui Badan Penyelesaian Sengketa Konsumen (BPSK) di wilayah tempat tinggal Anda, atau gugatan melalui Pengadilan Negeri yang berwenang.',
            },
            {
              en: 'We do not restrict your right to sue in the court of your own domicile, nor your right to complain to the personal data protection supervisory authority or any other competent body.',
              id: 'Kami tidak membatasi hak Anda untuk mengajukan gugatan pada pengadilan di tempat kedudukan hukum Anda, maupun hak Anda menyampaikan pengaduan kepada lembaga pengawas pelindungan data pribadi atau instansi berwenang lainnya.',
            },
          ],
          callouts: [
            {
              tone: 'info',
              body: {
                en: 'An exclusive-forum clause forcing a consumer into one specified court risks being treated as a prohibited standard clause under Indonesian consumer law. The wording above deliberately leaves the choice with you.',
                id: 'Klausul forum yang memaksa konsumen ke satu pengadilan tertentu berisiko dinilai sebagai klausula baku yang dilarang menurut hukum perlindungan konsumen Indonesia. Rumusan di atas sengaja dibuat memberi pilihan kepada Anda.',
              },
            },
          ],
        },

        {
          heading: { en: 'Article 17: General', id: 'Pasal 17: Ketentuan lain' },
          numbered: [
            {
              en: 'Severability. If any provision is held void, invalid, or unenforceable by a court or competent authority, it is deemed modified to the minimum extent necessary to be valid, and the remaining provisions continue in full force.',
              id: 'Keterpisahan. Apabila suatu ketentuan dinyatakan batal, tidak sah, atau tidak dapat dilaksanakan oleh pengadilan atau lembaga berwenang, ketentuan tersebut dianggap diubah seminimal mungkin agar sah, dan ketentuan lainnya tetap berlaku penuh.',
            },
            {
              en: 'No waiver. Our failure to enforce a provision is not a waiver of it.',
              id: 'Tidak ada pengesampingan. Kelalaian Kami menegakkan suatu ketentuan tidak berarti Kami melepaskan hak atas ketentuan tersebut.',
            },
            {
              en: 'Entire agreement. These Terms, together with the Disclaimer and the Privacy Policy, constitute the whole agreement between you and us about the Service.',
              id: 'Keseluruhan perjanjian. Syarat Layanan ini bersama Disclaimer dan Kebijakan Privasi merupakan keseluruhan kesepakatan antara Anda dan Kami mengenai Layanan.',
            },
            {
              en: 'Assignment. You may not assign your rights and obligations. We may assign them to a successor entity, on notice to you.',
              id: 'Pengalihan. Anda tidak dapat mengalihkan hak dan kewajiban Anda. Kami dapat mengalihkannya kepada badan hukum penerus, dengan pemberitahuan kepada Anda.',
            },
            {
              en: 'Prevailing language. These Terms exist in Indonesian and English. Under Law No. 24 of 2009 and Presidential Regulation No. 63 of 2019, the Indonesian version prevails in case of any difference of interpretation.',
              id: 'Bahasa yang berlaku. Syarat Layanan ini dibuat dalam Bahasa Indonesia dan Bahasa Inggris. Sesuai Undang-Undang No. 24 Tahun 2009 dan Peraturan Presiden No. 63 Tahun 2019, versi Bahasa Indonesia yang berlaku apabila terdapat perbedaan penafsiran.',
            },
            {
              en: 'Electronic system operator compliance. We seek to meet our obligations as an Electronic System Operator under Government Regulation No. 71 of 2019. Private-scope PSE registration is an outstanding action for this project.',
              id: 'Kepatuhan penyelenggara sistem elektronik. Kami berupaya memenuhi kewajiban sebagai Penyelenggara Sistem Elektronik menurut Peraturan Pemerintah No. 71 Tahun 2019. Pendaftaran PSE Lingkup Privat masih menjadi tindak lanjut yang belum diselesaikan pada proyek ini.',
            },
          ],
        },

        {
          heading: { en: 'Article 18: Contact', id: 'Pasal 18: Kontak' },
          paragraphs: [
            {
              en: 'The provider and address for all matters under these Terms are shown in the document details at the top of this page. KawalKontrak.ai is a student project and does not yet operate a monitored email address; rather than publish one that nobody reads, we will add a contact channel here once it genuinely exists. For anything urgent about your own employment, contact LBH, your district Manpower Office, your union, or an advocate.',
              id: 'Penyelenggara dan alamat untuk seluruh urusan berdasarkan Syarat Layanan ini tercantum pada rincian dokumen di bagian atas halaman ini. KawalKontrak.ai adalah proyek mahasiswa dan belum mengoperasikan alamat surel yang benar-benar dipantau; daripada mencantumkan alamat yang tidak dibaca siapa pun, kanal kontak akan kami tambahkan di sini begitu benar-benar ada. Untuk hal mendesak menyangkut hubungan kerja Anda sendiri, hubungi LBH, Dinas Ketenagakerjaan kabupaten/kota Anda, serikat pekerja Anda, atau advokat.',
            },
          ],
        },
      ]}
    />
  );
}

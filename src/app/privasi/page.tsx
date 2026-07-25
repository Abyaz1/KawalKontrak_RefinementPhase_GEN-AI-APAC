import { LegalPageContent } from '@/components/LegalPageContent';

export const metadata = {
  title: 'Privacy Policy | KawalKontrak.ai',
};

export default function PrivacyPage() {
  return (
    <LegalPageContent
      title={{ en: 'Privacy Policy', id: 'Kebijakan Privasi' }}
      sections={[
        {
          heading: { en: 'Data Collection and Usage', id: 'Pengumpulan dan Penggunaan Data' },
          body: {
            en: 'We take your privacy seriously. The employment contracts and documents you upload or paste for analysis are processed securely. We only use the provided text to perform the requested analysis against labor regulations.',
            id: 'Kami menjaga privasi Anda dengan serius. Kontrak kerja dan dokumen yang Anda unggah atau tempel untuk dianalisis diproses secara aman. Kami hanya menggunakan teks yang Anda berikan untuk melakukan analisis yang diminta terhadap peraturan ketenagakerjaan.',
          },
        },
        {
          heading: { en: 'Data Storage', id: 'Penyimpanan Data' },
          body: {
            en: 'Unless you are logged into your account and explicitly save your analysis history, the text you submit is not stored permanently on our servers. Your contract data is processed in-memory or via secure APIs and is discarded after the analysis is complete. For logged-in users, analysis history is securely stored in Firebase and can be deleted by you at any time.',
            id: 'Kecuali Anda masuk ke akun dan secara eksplisit menyimpan riwayat analisis, teks yang Anda kirimkan tidak disimpan secara permanen di server kami. Data kontrak Anda diproses di memori atau melalui API yang aman dan dihapus setelah analisis selesai. Bagi pengguna yang masuk, riwayat analisis disimpan dengan aman di Firebase dan dapat Anda hapus kapan saja.',
          },
        },
        {
          heading: { en: 'Third-Party Services', id: 'Layanan Pihak Ketiga' },
          body: {
            en: 'We utilize Google Gemini AI to process and analyze the contracts. Your text is transmitted securely to their API. We do not sell, rent, or share your personal data or contract contents with any other third parties for marketing purposes.',
            id: 'Kami menggunakan Google Gemini AI untuk memproses dan menganalisis kontrak. Teks Anda dikirimkan secara aman ke API mereka. Kami tidak menjual, menyewakan, atau membagikan data pribadi maupun isi kontrak Anda kepada pihak ketiga lain untuk tujuan pemasaran.',
          },
        },
        {
          heading: { en: 'Cookies and Local Storage', id: 'Cookie dan Penyimpanan Lokal' },
          body: {
            en: 'We use local storage in your browser to save your language preference, theme settings, and recent analysis history (if not logged in) to provide a better user experience. You can clear this data at any time by clearing your browser data.',
            id: 'Kami menggunakan penyimpanan lokal (local storage) di peramban Anda untuk menyimpan preferensi bahasa, pengaturan tema, dan riwayat analisis terbaru (jika Anda tidak masuk) demi pengalaman pengguna yang lebih baik. Anda dapat menghapus data ini kapan saja dengan membersihkan data peramban Anda.',
          },
        },
      ]}
    />
  );
}

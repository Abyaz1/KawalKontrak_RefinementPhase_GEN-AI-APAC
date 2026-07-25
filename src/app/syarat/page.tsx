import { LegalPageContent } from '@/components/LegalPageContent';

export const metadata = {
  title: 'Terms of Service | KawalKontrak.ai',
};

export default function TermsPage() {
  return (
    <LegalPageContent
      title={{ en: 'Terms of Service', id: 'Ketentuan Layanan' }}
      sections={[
        {
          heading: { en: 'Acceptance of Terms', id: 'Penerimaan Ketentuan' },
          body: {
            en: 'By accessing and using KawalKontrak.ai, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.',
            id: 'Dengan mengakses dan menggunakan KawalKontrak.ai, Anda menerima dan setuju untuk terikat oleh syarat dan ketentuan dalam perjanjian ini. Jika Anda tidak setuju untuk mematuhi ketentuan ini, mohon untuk tidak menggunakan layanan ini.',
          },
        },
        {
          heading: { en: 'Service Description', id: 'Deskripsi Layanan' },
          body: {
            en: 'KawalKontrak.ai provides an AI-powered tool to analyze employment contracts against Indonesian labor laws. The service is provided "as is" and is intended for informational and educational purposes.',
            id: 'KawalKontrak.ai menyediakan alat berbasis AI untuk menganalisis kontrak kerja terhadap hukum ketenagakerjaan Indonesia. Layanan ini disediakan "sebagaimana adanya" dan ditujukan untuk keperluan informasi dan edukasi.',
          },
        },
        {
          heading: { en: 'User Conduct', id: 'Perilaku Pengguna' },
          body: {
            en: 'You agree not to use the service for any unlawful purpose or in any way that might harm, damage, or disparage any other party. You must not submit sensitive personal information (such as ID numbers or banking details) if it is not necessary for the analysis.',
            id: 'Anda setuju untuk tidak menggunakan layanan ini untuk tujuan yang melanggar hukum atau dengan cara apa pun yang dapat merugikan, merusak, atau mencemarkan nama baik pihak lain. Anda tidak boleh mengirimkan informasi pribadi yang sensitif (seperti nomor identitas atau data perbankan) jika tidak diperlukan untuk analisis.',
          },
        },
        {
          heading: { en: 'Modifications', id: 'Perubahan' },
          body: {
            en: 'We reserve the right to modify or discontinue the service with or without notice to the user. We shall not be liable to you or any third party should we exercise our right to modify or discontinue the service.',
            id: 'Kami berhak mengubah atau menghentikan layanan dengan atau tanpa pemberitahuan kepada pengguna. Kami tidak bertanggung jawab kepada Anda atau pihak ketiga mana pun apabila kami menggunakan hak kami untuk mengubah atau menghentikan layanan.',
          },
        },
        {
          heading: { en: 'Governing Law', id: 'Hukum yang Berlaku' },
          body: {
            en: 'These Terms shall be governed and construed in accordance with the laws of Indonesia, without regard to its conflict of law provisions.',
            id: 'Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum Indonesia, tanpa memperhatikan ketentuan konflik hukumnya.',
          },
        },
      ]}
    />
  );
}

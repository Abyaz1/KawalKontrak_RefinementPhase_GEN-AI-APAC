import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kawalkontrak.ai";
const SITE_NAME = "KawalKontrak.ai";
const SITE_DESCRIPTION =
  "Analisis kontrak kerja Anda secara gratis dengan AI. Deteksi klausul berbahaya dalam hitungan detik berdasarkan UU Ketenagakerjaan Indonesia. Protect your employment rights.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Lindungi Hak Kerja Anda dengan AI`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "kontrak kerja",
    "analisis kontrak",
    "hak pekerja",
    "UU Ketenagakerjaan",
    "UU Cipta Kerja",
    "PKWT",
    "PKWTT",
    "pesangon",
    "red flag kontrak",
    "AI hukum",
    "Indonesia",
    "employment contract",
    "labor law",
  ],
  authors: [{ name: "KawalKontrak.ai Team" }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "id_ID",
    alternateLocale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Lindungi Hak Kerja Anda dengan AI`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KawalKontrak.ai — AI-Powered Employment Contract Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Lindungi Hak Kerja Anda dengan AI`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Inline script to prevent dark mode flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('kk-theme');
                  if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  document.documentElement.setAttribute('data-theme', t);
                } catch(e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: SITE_NAME,
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              applicationCategory: "LegalService",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
              inLanguage: ["id", "en"],
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <a href="#main-content" className="sr-only">
          Langsung ke konten utama
        </a>
        <Providers>
          <div id="main-content">{children}</div>
        </Providers>
      </body>
    </html>
  );
}

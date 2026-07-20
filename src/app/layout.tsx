import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pdf-super-app.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Layanan Dokumen PDF - Edit, Kompres, & Konversi PDF Gratis",
    template: "%s | Layanan Dokumen PDF",
  },
  description: "Aplikasi pengelola PDF gratis terbaik. Kompres PDF, ubah JPG ke PDF, gabungkan, pisahkan, dan edit dokumen PDF dengan mudah tanpa batas ukuran harian langsung di browser Anda.",
  keywords: ["pdf", "edit pdf", "kompres pdf", "gabung pdf", "jpg ke pdf", "pdf ke word", "pdf tools", "pdf online gratis", "pdf indonesia"],
  authors: [{ name: "Layanan Dokumen PDF Team" }],
  creator: "Layanan Dokumen PDF",
  publisher: "Layanan Dokumen PDF",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Layanan Dokumen PDF - Edit, Kompres, & Konversi PDF Gratis",
    description: "Kelola file PDF Anda dengan mudah dan cepat sepenuhnya di dalam browser Anda, tanpa upload ke server. Aman, cepat, dan 100% gratis.",
    url: siteUrl,
    siteName: "Layanan Dokumen PDF",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Layanan Dokumen PDF - Edit & Konversi PDF Gratis",
    description: "Platform lengkap untuk memanipulasi file PDF langsung di browser Anda.",
    creator: "@pdfsuperapp",
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2563eb", // blue-600
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Layanan Dokumen PDF",
    "url": siteUrl,
    "description": "Platform online komprehensif untuk mengelola, mengedit, mengkonversi, dan mengompres file PDF secara gratis dan aman sepenuhnya di browser.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IDR"
    }
  };

  return (
    <html lang="id">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
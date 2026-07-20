import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF ke HTML Online Gratis",
  description: "Konversi dokumen PDF menjadi halaman web HTML yang responsif.",
  keywords: ["pdf ke html", "pdf ke html online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/pdf-to-html',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PDF ke HTML - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/pdf-to-html",
    "description": "Konversi dokumen PDF menjadi halaman web HTML yang responsif.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IDR"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}

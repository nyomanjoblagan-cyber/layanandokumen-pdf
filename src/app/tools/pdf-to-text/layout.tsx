import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF ke Teks Online Gratis",
  description: "Ekstrak semua tulisan dari file PDF menjadi format teks (TXT).",
  keywords: ["pdf ke teks", "pdf ke teks online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/pdf-to-text',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PDF ke Teks - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/pdf-to-text",
    "description": "Ekstrak semua tulisan dari file PDF menjadi format teks (TXT).",
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

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kompres PDF Online Gratis",
  description: "Kecilkan ukuran file PDF tanpa mengurangi kualitas secara signifikan.",
  keywords: ["kompres pdf", "kompres pdf online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/compress-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Kompres PDF - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/compress-pdf",
    "description": "Kecilkan ukuran file PDF tanpa mengurangi kualitas secara signifikan.",
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

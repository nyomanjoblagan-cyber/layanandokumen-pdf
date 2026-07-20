import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Putar PDF Online Gratis",
  description: "Putar halaman PDF yang terbalik ke posisi yang benar.",
  keywords: ["putar pdf", "putar pdf online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/rotate-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Putar PDF - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/rotate-pdf",
    "description": "Putar halaman PDF yang terbalik ke posisi yang benar.",
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

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ubah Ukuran Online Gratis",
  description: "Ubah dimensi halaman PDF (contoh: A4 ke Letter atau custom).",
  keywords: ["ubah ukuran", "ubah ukuran online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/resize-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Ubah Ukuran - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/resize-pdf",
    "description": "Ubah dimensi halaman PDF (contoh: A4 ke Letter atau custom).",
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

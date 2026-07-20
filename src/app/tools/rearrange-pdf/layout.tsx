import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Susun Ulang Online Gratis",
  description: "Ubah urutan halaman dalam file PDF dengan metode drag & drop.",
  keywords: ["susun ulang", "susun ulang online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/rearrange-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Susun Ulang - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/rearrange-pdf",
    "description": "Ubah urutan halaman dalam file PDF dengan metode drag & drop.",
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

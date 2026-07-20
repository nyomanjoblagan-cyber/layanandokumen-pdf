import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit PDF Online Gratis",
  description: "Tambahkan teks, bentuk, gambar, dan coretan bebas pada PDF Anda.",
  keywords: ["edit pdf", "edit pdf online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/edit-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Edit PDF - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/edit-pdf",
    "description": "Tambahkan teks, bentuk, gambar, dan coretan bebas pada PDF Anda.",
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

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watermark PDF Online Gratis",
  description: "Tambahkan cap air teks atau gambar ke PDF Anda untuk keamanan.",
  keywords: ["watermark pdf", "watermark pdf online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/watermark-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Watermark PDF - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/watermark-pdf",
    "description": "Tambahkan cap air teks atau gambar ke PDF Anda untuk keamanan.",
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

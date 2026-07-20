import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tambah Gambar Online Gratis",
  description: "Sisipkan gambar (logo/foto) ke dalam halaman PDF Anda.",
  keywords: ["tambah gambar", "tambah gambar online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/add-image-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Tambah Gambar - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/add-image-pdf",
    "description": "Sisipkan gambar (logo/foto) ke dalam halaman PDF Anda.",
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

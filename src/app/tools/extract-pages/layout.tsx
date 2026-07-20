import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ekstrak Halaman Online Gratis",
  description: "Ambil halaman tertentu dan simpan sebagai file PDF baru.",
  keywords: ["ekstrak halaman", "ekstrak halaman online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/extract-pages',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Ekstrak Halaman - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/extract-pages",
    "description": "Ambil halaman tertentu dan simpan sebagai file PDF baru.",
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

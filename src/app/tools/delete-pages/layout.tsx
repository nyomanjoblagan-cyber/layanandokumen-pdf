import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hapus Halaman Online Gratis",
  description: "Hapus halaman tertentu dari dokumen PDF Anda.",
  keywords: ["hapus halaman", "hapus halaman online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/delete-pages',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Hapus Halaman - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/delete-pages",
    "description": "Hapus halaman tertentu dari dokumen PDF Anda.",
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

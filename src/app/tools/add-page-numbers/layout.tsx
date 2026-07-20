import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nomor Halaman Online Gratis",
  description: "Tambahkan nomor halaman pada dokumen PDF Anda.",
  keywords: ["nomor halaman", "nomor halaman online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/add-page-numbers',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Nomor Halaman - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/add-page-numbers",
    "description": "Tambahkan nomor halaman pada dokumen PDF Anda.",
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

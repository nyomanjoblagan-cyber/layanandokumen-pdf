import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF ke PNG Online Gratis",
  description: "Ekstrak halaman PDF menjadi gambar PNG dengan latar transparan.",
  keywords: ["pdf ke png", "pdf ke png online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/pdf-to-png',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PDF ke PNG - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/pdf-to-png",
    "description": "Ekstrak halaman PDF menjadi gambar PNG dengan latar transparan.",
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

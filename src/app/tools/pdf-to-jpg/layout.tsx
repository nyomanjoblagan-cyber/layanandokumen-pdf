import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF ke JPG Online Gratis",
  description: "Ubah setiap halaman PDF menjadi gambar JPG kualitas tinggi.",
  keywords: ["pdf ke jpg", "pdf ke jpg online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/pdf-to-jpg',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PDF ke JPG - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/pdf-to-jpg",
    "description": "Ubah setiap halaman PDF menjadi gambar JPG kualitas tinggi.",
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

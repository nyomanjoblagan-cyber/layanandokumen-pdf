import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ratakan PDF Online Gratis",
  description: "Ubah PDF form/interaktif menjadi PDF datar agar tidak bisa diubah.",
  keywords: ["ratakan pdf", "ratakan pdf online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/flatten-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Ratakan PDF - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/flatten-pdf",
    "description": "Ubah PDF form/interaktif menjadi PDF datar agar tidak bisa diubah.",
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

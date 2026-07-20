import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kunci PDF Online Gratis",
  description: "Tambahkan password untuk mengamankan file PDF rahasia Anda.",
  keywords: ["kunci pdf", "kunci pdf online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/protect-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Kunci PDF - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/protect-pdf",
    "description": "Tambahkan password untuk mengamankan file PDF rahasia Anda.",
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

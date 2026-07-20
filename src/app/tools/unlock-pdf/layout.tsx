import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buka PDF Online Gratis",
  description: "Hapus password dan perlindungan dari file PDF.",
  keywords: ["buka pdf", "buka pdf online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/unlock-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Buka PDF - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/unlock-pdf",
    "description": "Hapus password dan perlindungan dari file PDF.",
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

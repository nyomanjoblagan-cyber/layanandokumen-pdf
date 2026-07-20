import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PNG ke PDF Online Gratis",
  description: "Konversi gambar PNG transparan menjadi dokumen PDF.",
  keywords: ["png ke pdf", "png ke pdf online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/png-to-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PNG ke PDF - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/png-to-pdf",
    "description": "Konversi gambar PNG transparan menjadi dokumen PDF.",
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

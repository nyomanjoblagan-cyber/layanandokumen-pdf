import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scan ke PDF Online Gratis",
  description: "Gunakan kamera untuk memindai dokumen fisik menjadi file PDF.",
  keywords: ["scan ke pdf", "scan ke pdf online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/scan-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Scan ke PDF - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/scan-pdf",
    "description": "Gunakan kamera untuk memindai dokumen fisik menjadi file PDF.",
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

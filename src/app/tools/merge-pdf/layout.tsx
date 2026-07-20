import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gabungkan PDF Online Gratis",
  description: "Gabungkan beberapa file PDF menjadi satu dokumen berurutan.",
  keywords: ["gabungkan pdf", "gabungkan pdf online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/merge-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Gabungkan PDF - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/merge-pdf",
    "description": "Gabungkan beberapa file PDF menjadi satu dokumen berurutan.",
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

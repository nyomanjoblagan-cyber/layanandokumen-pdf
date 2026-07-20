import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Isi Formulir Online Gratis",
  description: "Isi formulir PDF interaktif secara langsung di dalam browser.",
  keywords: ["isi formulir", "isi formulir online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/fill-form',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Isi Formulir - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/fill-form",
    "description": "Isi formulir PDF interaktif secara langsung di dalam browser.",
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

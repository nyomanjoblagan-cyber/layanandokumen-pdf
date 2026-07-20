import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JPG ke PDF Online Gratis",
  description: "Ubah gambar JPG/PNG menjadi dokumen PDF dengan mudah dan cepat.",
  keywords: ["jpg ke pdf", "jpg ke pdf online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/jpg-to-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "JPG ke PDF - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/jpg-to-pdf",
    "description": "Ubah gambar JPG/PNG menjadi dokumen PDF dengan mudah dan cepat.",
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

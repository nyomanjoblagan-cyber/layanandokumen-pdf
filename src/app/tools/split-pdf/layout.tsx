import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pisahkan PDF Online Gratis",
  description: "Ekstrak satu atau beberapa halaman dari file PDF Anda.",
  keywords: ["pisahkan pdf", "pisahkan pdf online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/split-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Pisahkan PDF - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/split-pdf",
    "description": "Ekstrak satu atau beberapa halaman dari file PDF Anda.",
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

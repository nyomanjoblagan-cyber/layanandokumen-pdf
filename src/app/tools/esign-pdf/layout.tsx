import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tanda Tangan Online Gratis",
  description: "Buat dan bubuhkan tanda tangan elektronik pada dokumen PDF.",
  keywords: ["tanda tangan", "tanda tangan online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: 'https://pdf-super-app.vercel.app/tools/esign-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Tanda Tangan - Layanan Dokumen PDF",
    "url": "https://pdf-super-app.vercel.app/tools/esign-pdf",
    "description": "Buat dan bubuhkan tanda tangan elektronik pada dokumen PDF.",
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

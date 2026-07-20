const fs = require('fs');
const path = require('path');

const toolsInfo = {
  'jpg-to-pdf': { name: 'JPG ke PDF', desc: 'Ubah gambar JPG/PNG menjadi dokumen PDF dengan mudah dan cepat.' },
  'merge-pdf': { name: 'Gabungkan PDF', desc: 'Gabungkan beberapa file PDF menjadi satu dokumen berurutan.' },
  'compress-pdf': { name: 'Kompres PDF', desc: 'Kecilkan ukuran file PDF tanpa mengurangi kualitas secara signifikan.' },
  'split-pdf': { name: 'Pisahkan PDF', desc: 'Ekstrak satu atau beberapa halaman dari file PDF Anda.' },
  'pdf-to-jpg': { name: 'PDF ke JPG', desc: 'Ubah setiap halaman PDF menjadi gambar JPG kualitas tinggi.' },
  'edit-pdf': { name: 'Edit PDF', desc: 'Tambahkan teks, bentuk, gambar, dan coretan bebas pada PDF Anda.' },
  'watermark-pdf': { name: 'Watermark PDF', desc: 'Tambahkan cap air teks atau gambar ke PDF Anda untuk keamanan.' },
  'rotate-pdf': { name: 'Putar PDF', desc: 'Putar halaman PDF yang terbalik ke posisi yang benar.' },
  'delete-pages': { name: 'Hapus Halaman', desc: 'Hapus halaman tertentu dari dokumen PDF Anda.' },
  'rearrange-pdf': { name: 'Susun Ulang', desc: 'Ubah urutan halaman dalam file PDF dengan metode drag & drop.' },
  'protect-pdf': { name: 'Kunci PDF', desc: 'Tambahkan password untuk mengamankan file PDF rahasia Anda.' },
  'unlock-pdf': { name: 'Buka PDF', desc: 'Hapus password dan perlindungan dari file PDF.' },
  'add-page-numbers': { name: 'Nomor Halaman', desc: 'Tambahkan nomor halaman pada dokumen PDF Anda.' },
  'scan-pdf': { name: 'Scan ke PDF', desc: 'Gunakan kamera untuk memindai dokumen fisik menjadi file PDF.' },
  'pdf-to-text': { name: 'PDF ke Teks', desc: 'Ekstrak semua tulisan dari file PDF menjadi format teks (TXT).' },
  'pdf-to-html': { name: 'PDF ke HTML', desc: 'Konversi dokumen PDF menjadi halaman web HTML yang responsif.' },
  'png-to-pdf': { name: 'PNG ke PDF', desc: 'Konversi gambar PNG transparan menjadi dokumen PDF.' },
  'pdf-to-png': { name: 'PDF ke PNG', desc: 'Ekstrak halaman PDF menjadi gambar PNG dengan latar transparan.' },
  'esign-pdf': { name: 'Tanda Tangan', desc: 'Buat dan bubuhkan tanda tangan elektronik pada dokumen PDF.' },
  'flatten-pdf': { name: 'Ratakan PDF', desc: 'Ubah PDF form/interaktif menjadi PDF datar agar tidak bisa diubah.' },
  'resize-pdf': { name: 'Ubah Ukuran', desc: 'Ubah dimensi halaman PDF (contoh: A4 ke Letter atau custom).' },
  'extract-pages': { name: 'Ekstrak Halaman', desc: 'Ambil halaman tertentu dan simpan sebagai file PDF baru.' },
  'fill-form': { name: 'Isi Formulir', desc: 'Isi formulir PDF interaktif secara langsung di dalam browser.' },
  'add-image-pdf': { name: 'Tambah Gambar', desc: 'Sisipkan gambar (logo/foto) ke dalam halaman PDF Anda.' },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pdf-super-app.vercel.app';

for (const [slug, info] of Object.entries(toolsInfo)) {
  const dirPath = path.join(__dirname, '..', 'src', 'app', 'tools', slug);
  if (fs.existsSync(dirPath)) {
    const layoutContent = `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${info.name} Online Gratis",
  description: "${info.desc}",
  keywords: ["${info.name.toLowerCase()}", "${info.name.toLowerCase()} online", "pdf tool", "pdf online gratis"],
  alternates: {
    canonical: '${siteUrl}/tools/${slug}',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "${info.name} - Layanan Dokumen PDF",
    "url": "${siteUrl}/tools/${slug}",
    "description": "${info.desc}",
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
`;
    fs.writeFileSync(path.join(dirPath, 'layout.tsx'), layoutContent);
    console.log(`Generated layout for ${slug}`);
  }
}

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white p-8 md:p-16 max-w-4xl mx-auto text-slate-800 font-sans">
      <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold mb-8 hover:underline"><ArrowLeft size={16}/> Kembali ke Beranda</Link>
      <h1 className="text-3xl font-black mb-6">Kebijakan Privasi (Privacy Policy)</h1>
      <div className="prose prose-slate">
        <p>Terakhir diperbarui: Januari 2026</p>
        <p>Di <strong>LayananDokumen.com</strong>, privasi pengunjung adalah prioritas utama kami. Dokumen Kebijakan Privasi ini berisi jenis informasi yang dikumpulkan dan dicatat oleh LayananDokumen.com dan bagaimana kami menggunakannya.</p>
        
        <h3>1. Informasi yang Kami Kumpulkan</h3>
        <p>Kami tidak mewajibkan pendaftaran akun. Kami tidak menyimpan file PDF yang Anda unggah ke server kami. Semua proses pengolahan dokumen dilakukan secara <strong>lokal di browser Anda (Client-Side)</strong>. File Anda tidak pernah meninggalkan perangkat Anda.</p>

        <h3>2. Iklan Pihak Ketiga</h3>
        <p>Kami menggunakan layanan iklan pihak ketiga (seperti Adsterra/Google AdSense) untuk menayangkan iklan saat Anda mengunjungi situs web kami. Perusahaan-perusahaan ini mungkin menggunakan informasi (tidak termasuk nama, alamat, alamat email, atau nomor telepon Anda) tentang kunjungan Anda ke situs ini untuk menyediakan iklan tentang barang dan jasa yang menarik bagi Anda.</p>

        <h3>3. Log Files</h3>
        <p>LayananDokumen.com mengikuti prosedur standar menggunakan file log. File-file ini mencatat pengunjung ketika mereka mengunjungi situs web. Semua perusahaan hosting melakukan ini dan merupakan bagian dari analisis layanan hosting.</p>
      </div>
    </div>
  );
}
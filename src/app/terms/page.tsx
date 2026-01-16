import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white p-8 md:p-16 max-w-4xl mx-auto text-slate-800 font-sans">
      <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold mb-8 hover:underline"><ArrowLeft size={16}/> Kembali ke Beranda</Link>
      <h1 className="text-3xl font-black mb-6">Syarat & Ketentuan (Terms)</h1>
      <div className="prose prose-slate">
        <p>Dengan mengakses situs web ini, Anda setuju untuk terikat dengan syarat dan ketentuan penggunaan ini.</p>
        
        <h3>1. Penggunaan Lisensi</h3>
        <p>LayananDokumen.com memberikan izin untuk menggunakan alat PDF secara gratis untuk keperluan pribadi maupun komersial ringan. Anda dilarang mencoba merekayasa balik (reverse engineer) kode sumber situs ini.</p>

        <h3>2. Batasan</h3>
        <p>Dalam keadaan apa pun LayananDokumen.com tidak bertanggung jawab atas kerusakan apa pun (termasuk, tanpa batasan, kerusakan karena hilangnya data atau keuntungan) yang timbul dari penggunaan atau ketidakmampuan untuk menggunakan materi di situs web ini.</p>
      </div>
    </div>
  );
}
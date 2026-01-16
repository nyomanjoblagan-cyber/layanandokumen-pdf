import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-white p-8 md:p-16 max-w-4xl mx-auto text-slate-800 font-sans">
      <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold mb-8 hover:underline"><ArrowLeft size={16}/> Kembali ke Beranda</Link>
      <h1 className="text-3xl font-black mb-6">Penafian (Disclaimer)</h1>
      <div className="prose prose-slate">
        <p>Semua informasi di situs web ini - <strong>LayananDokumen.com</strong> - diterbitkan dengan itikad baik dan hanya untuk tujuan informasi umum.</p>
        
        <h3>1. Keamanan Dokumen</h3>
        <p>Meskipun kami menggunakan teknologi pemrosesan sisi klien (Client-Side) untuk memastikan keamanan file Anda, kami tidak bertanggung jawab atas kehilangan data atau kerusakan file yang mungkin terjadi akibat penggunaan alat kami. Pengguna disarankan untuk selalu memiliki cadangan file asli.</p>

        <h3>2. Tautan Eksternal</h3>
        <p>Dari situs web kami, Anda dapat mengunjungi situs web lain dengan mengikuti tautan ke situs eksternal tersebut (seperti LatihanOnline.com). Meskipun kami berupaya menyediakan hanya tautan berkualitas, kami tidak memiliki kendali atas konten dan sifat situs-situs tersebut.</p>
      </div>
    </div>
  );
}
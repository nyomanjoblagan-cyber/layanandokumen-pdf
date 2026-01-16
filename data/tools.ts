import { 
  Scissors, Combine, RefreshCcw, Image, 
  Lock, Unlock, PenTool, FileText, 
  Minimize, Layers, Trash2,
  FileSignature, BookOpen, 
  FileImage, BadgeCheck, 
  Maximize, FileUp, Camera, FilePenLine, Stamp, Hash, 
  FileDown, FileType, Layout, FileCode
} from 'lucide-react';

// Tipe Data
export type Language = 'id' | 'en';

// UI Text
export const UI_TEXT = {
  header_login: { id: 'Masuk', en: 'Log in' },
  header_btn: { id: 'MULAI GRATIS', en: 'GET STARTED' },
  hero_title: { id: 'Solusi PDF Lengkap & Gratis', en: 'Every tool you need for PDF' },
  hero_desc: { id: 'Kumpulan alat pengelola dokumen yang 100% aman. Semua proses dilakukan di browser Anda (Tanpa Upload Server).', en: 'Secure document management tools. All processing happens in your browser (No Server Uploads).' },
  search_placeholder: { id: 'Cari alat (misal: Gabung, JPG ke PDF)...', en: 'Search tools (e.g. Merge, JPG to PDF)...' },
  no_result: { id: 'Alat tidak ditemukan', en: 'No tools found' },
  footer: { id: 'Dibuat untuk Produktivitas Indonesia', en: 'Built for Productivity' }
};

// DATA TOOLS (ID disesuaikan 100% dengan struktur folder Mas)
export const TOOLS = [
  // --- 1. POPULER (FOLDER MAS) ---
  { 
    id: 'jpg-to-pdf', 
    title: { id: 'JPG ke PDF', en: 'JPG to PDF' }, 
    desc: { id: 'Ubah foto (JPG/PNG) menjadi dokumen PDF.', en: 'Convert photos to PDF documents.' }, 
    icon: Image, 
    category: { id: 'Populer', en: 'Popular' }, 
    color: 'text-orange-600', bg: 'bg-orange-50' 
  },
  { 
    id: 'merge-pdf', 
    title: { id: 'Gabung PDF', en: 'Merge PDF' }, 
    desc: { id: 'Satukan banyak file PDF menjadi satu.', en: 'Combine multiple PDFs into one file.' }, 
    icon: Combine, 
    category: { id: 'Populer', en: 'Popular' }, 
    color: 'text-red-600', bg: 'bg-red-50' 
  },
  { 
    id: 'compress-pdf', 
    title: { id: 'Kompres PDF', en: 'Compress PDF' }, 
    desc: { id: 'Kecilkan ukuran file PDF Anda.', en: 'Reduce PDF file size.' }, 
    icon: Minimize, 
    category: { id: 'Populer', en: 'Popular' }, 
    color: 'text-green-600', bg: 'bg-green-50' 
  },
  { 
    id: 'split-pdf', 
    title: { id: 'Pisah PDF', en: 'Split PDF' }, 
    desc: { id: 'Ambil halaman tertentu dari PDF.', en: 'Separate specific pages from PDF.' }, 
    icon: Scissors, 
    category: { id: 'Populer', en: 'Popular' }, 
    color: 'text-red-500', bg: 'bg-red-50' 
  },
  { 
    id: 'edit-pdf', 
    title: { id: 'Edit PDF (Teks)', en: 'Edit PDF (Text)' }, 
    desc: { id: 'Tambahkan teks manual atau isi formulir PDF.', en: 'Add manual text or fill PDF forms.' }, 
    icon: FilePenLine, 
    category: { id: 'Populer', en: 'Popular' }, 
    color: 'text-indigo-600', bg: 'bg-indigo-50' 
  },
  { 
    id: 'scan-pdf', 
    title: { id: 'Scan PDF (Kamera)', en: 'Scan PDF (Camera)' }, 
    desc: { id: 'Gunakan kamera HP untuk scan dokumen ke PDF.', en: 'Use phone camera to scan docs to PDF.' }, 
    icon: Camera, 
    category: { id: 'Populer', en: 'Popular' }, 
    color: 'text-blue-600', bg: 'bg-blue-50' 
  },

  // --- 2. KONVERSI (FOLDER MAS + BARU) ---
  { 
    id: 'pdf-to-jpg', 
    title: { id: 'PDF ke JPG', en: 'PDF to JPG' }, 
    desc: { id: 'Simpan halaman PDF menjadi gambar JPG.', en: 'Extract PDF pages as JPG images.' }, 
    icon: Image, 
    category: { id: 'Konversi', en: 'Convert' }, 
    color: 'text-yellow-600', bg: 'bg-yellow-50' 
  },
  { 
    id: 'pdf-to-png', 
    title: { id: 'PDF ke PNG', en: 'PDF to PNG' }, 
    desc: { id: 'Ubah PDF jadi gambar PNG transparan.', en: 'Convert PDF to PNG images.' }, 
    icon: FileImage, 
    category: { id: 'Konversi', en: 'Convert' }, 
    color: 'text-teal-600', bg: 'bg-teal-50' 
  },
  { 
    id: 'pdf-to-text', 
    title: { id: 'PDF ke Text', en: 'PDF to Text' }, 
    desc: { id: 'Salin tulisan dari PDF ke Notepad.', en: 'Extract raw text from PDF.' }, 
    icon: FileText, 
    category: { id: 'Konversi', en: 'Convert' }, 
    color: 'text-slate-600', bg: 'bg-slate-50' 
  },
  { 
    id: 'png-to-pdf', 
    title: { id: 'PNG ke PDF', en: 'PNG to PDF' }, 
    desc: { id: 'Gabungkan gambar PNG jadi satu PDF.', en: 'Turn PNG images into PDF.' }, 
    icon: FileImage, 
    category: { id: 'Konversi', en: 'Convert' }, 
    color: 'text-blue-500', bg: 'bg-blue-50' 
  },
{ 
    id: 'flatten-pdf',  // <-- GANTI ID
    title: { id: 'Ratakan PDF', en: 'Flatten PDF' }, // <-- GANTI JUDUL
    desc: { id: 'Kunci formulir & anotasi agar permanen.', en: 'Make forms & annotations permanent.' }, 
    icon: Layers, // <-- Import 'Layers' dari lucide-react jika belum
    category: { id: 'Konversi', en: 'Convert' }, 
    color: 'text-slate-700', bg: 'bg-slate-100' 
  },

  // --- 3. EDIT & ORGANISIR (FOLDER MAS + BARU) ---
  { 
    id: 'rotate-pdf', 
    title: { id: 'Putar PDF', en: 'Rotate PDF' }, 
    desc: { id: 'Perbaiki posisi halaman (Landscape/Portrait).', en: 'Rotate PDF pages properly.' }, 
    icon: RefreshCcw, 
    category: { id: 'Edit & Atur', en: 'Organize' }, 
    color: 'text-indigo-600', bg: 'bg-indigo-50' 
  },
  { 
    id: 'delete-pages', 
    title: { id: 'Hapus Halaman', en: 'Delete Pages' }, 
    desc: { id: 'Buang halaman yang tidak diinginkan.', en: 'Remove unwanted pages.' }, 
    icon: Trash2, 
    category: { id: 'Edit & Atur', en: 'Organize' }, 
    color: 'text-red-500', bg: 'bg-red-50' 
  },
  { 
    id: 'rearrange-pdf', 
    title: { id: 'Urutkan Halaman', en: 'Rearrange' }, 
    desc: { id: 'Geser dan atur ulang urutan halaman.', en: 'Reorder pages in your PDF.' }, 
    icon: Layers, 
    category: { id: 'Edit & Atur', en: 'Organize' }, 
    color: 'text-blue-500', bg: 'bg-blue-50' 
  },
  { 
    id: 'extract-pages', 
    title: { id: 'Ambil Halaman', en: 'Extract Pages' }, 
    desc: { id: 'Simpan halaman tertentu jadi file baru.', en: 'Extract pages into new PDF.' }, 
    icon: FileUp, 
    category: { id: 'Edit & Atur', en: 'Organize' }, 
    color: 'text-cyan-600', bg: 'bg-cyan-50' 
  },
  { 
    id: 'add-page-numbers', 
    title: { id: 'Nomor Halaman', en: 'Page Numbers' }, 
    desc: { id: 'Sisipkan nomor halaman otomatis.', en: 'Add page numbers to PDF.' }, 
    icon: BookOpen, 
    category: { id: 'Edit & Atur', en: 'Organize' }, 
    color: 'text-slate-600', bg: 'bg-slate-50' 
  },
  { 
    id: 'resize-pdf', 
    title: { id: 'Ubah Ukuran', en: 'Resize PDF' }, 
    desc: { id: 'Ganti ukuran kertas (A4, F4, Letter).', en: 'Change PDF page size.' }, 
    icon: Maximize, 
    category: { id: 'Edit & Atur', en: 'Organize' }, 
    color: 'text-pink-600', bg: 'bg-pink-50' 
  },
  { 
    id: 'add-image-pdf', 
    title: { id: 'Tambah Gambar', en: 'Add Image' }, 
    desc: { id: 'Sisipkan foto/logo ke halaman PDF.', en: 'Insert image into PDF page.' }, 
    icon: FileImage, 
    category: { id: 'Edit & Atur', en: 'Organize' }, 
    color: 'text-green-600', bg: 'bg-green-50' 
  },

  // --- 4. KEAMANAN (FOLDER MAS) ---
  { 
    id: 'protect-pdf', 
    title: { id: 'Kunci PDF', en: 'Protect PDF' }, 
    desc: { id: 'Pasang password agar PDF aman.', en: 'Encrypt PDF with password.' }, 
    icon: Lock, 
    category: { id: 'Keamanan', en: 'Security' }, 
    color: 'text-slate-800', bg: 'bg-slate-100' 
  },
  { 
    id: 'unlock-pdf', 
    title: { id: 'Buka Password', en: 'Unlock PDF' }, 
    desc: { id: 'Hapus password PDF (jika tahu sandinya).', en: 'Remove PDF password security.' }, 
    icon: Unlock, 
    category: { id: 'Keamanan', en: 'Security' }, 
    color: 'text-pink-600', bg: 'bg-pink-50' 
  },
  { 
    id: 'watermark-pdf', 
    title: { id: 'Watermark', en: 'Watermark' }, 
    desc: { id: 'Tempel cap/logo transparan.', en: 'Stamp text/image over PDF.' }, 
    icon: BadgeCheck, 
    category: { id: 'Keamanan', en: 'Security' }, 
    color: 'text-red-600', bg: 'bg-red-50' 
  },
  { 
    id: 'esign-pdf', 
    title: { id: 'Tanda Tangan', en: 'eSign PDF' }, 
    desc: { id: 'Buat & tempel tanda tangan digital.', en: 'Sign documents digitally.' }, 
    icon: FileSignature, 
    category: { id: 'Keamanan', en: 'Security' }, 
    color: 'text-blue-800', bg: 'bg-blue-100' 
  },
  { 
    id: 'fill-form', 
    title: { id: 'Isi Formulir', en: 'Fill Forms' }, 
    desc: { id: 'Isi kolom formulir PDF.', en: 'Fill out PDF forms online.' }, 
    icon: PenTool, 
    category: { id: 'Edit & Atur', en: 'Organize' }, 
    color: 'text-indigo-600', bg: 'bg-indigo-50' 
  },
  { 
    id: 'pdf-to-html', 
    title: { id: 'PDF ke HTML', en: 'PDF to HTML' }, 
    desc: { id: 'Ubah PDF menjadi file web HTML.', en: 'Convert PDF to HTML web file.' }, 
    icon: FileCode, 
    category: { id: 'Konversi', en: 'Convert' }, 
    color: 'text-purple-500', bg: 'bg-purple-50' 
  }
];
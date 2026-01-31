'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Menu, X, Globe, FileText, ArrowRight, Shield,
  Scissors, Combine, RefreshCcw, Image, Lock, Unlock, PenTool, 
  Minimize, Layers, Trash2, FileSignature, BookOpen, FileImage, 
  BadgeCheck, Maximize, FileUp, Camera, FilePenLine, Stamp, 
  FileDown, FileType, Layout, FileCode, CheckCircle2, ExternalLink,
  ShieldCheck, Wand2, Plus, GripVertical, TrendingUp, Zap, Heart
} from 'lucide-react';
import AdsterraBanner from '@/components/AdsterraBanner';

// --- TYPE DEFINITION ---
type Language = 'id' | 'en';

// --- DATA TOOLS ---
const TOOLS = [
  // 1. POPULER
  { id: 'jpg-to-pdf', title: { id: 'JPG ke PDF', en: 'JPG to PDF' }, desc: { id: 'Ubah foto/gambar menjadi dokumen PDF.', en: 'Convert photos/images to PDF documents.' }, icon: Image, category: 'Populer', color: 'text-orange-600', bg: 'bg-orange-50', border: 'hover:border-orange-200' },
  { id: 'merge-pdf', title: { id: 'Gabung PDF', en: 'Merge PDF' }, desc: { id: 'Satukan banyak file PDF jadi satu.', en: 'Combine multiple PDFs into one file.' }, icon: Combine, category: 'Populer', color: 'text-purple-600', bg: 'bg-purple-50', border: 'hover:border-purple-200' },
  { id: 'compress-pdf', title: { id: 'Kompres PDF', en: 'Compress PDF' }, desc: { id: 'Kecilkan ukuran file PDF agar ringan.', en: 'Reduce PDF file size for sharing.' }, icon: Minimize, category: 'Populer', color: 'text-green-600', bg: 'bg-green-50', border: 'hover:border-green-200' },
  { id: 'split-pdf', title: { id: 'Pisah PDF', en: 'Split PDF' }, desc: { id: 'Ambil halaman tertentu atau pecah file.', en: 'Extract pages or split documents.' }, icon: Scissors, category: 'Populer', color: 'text-red-500', bg: 'bg-red-50', border: 'hover:border-red-200' },
  { id: 'scan-pdf', title: { id: 'Scan PDF', en: 'Scan PDF' }, desc: { id: 'Scan dokumen fisik pakai kamera HP.', en: 'Scan physical docs via phone camera.' }, icon: Camera, category: 'Populer', color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-200' },
  { id: 'edit-pdf', title: { id: 'Edit PDF', en: 'Edit PDF' }, desc: { id: 'Tambahkan teks, coretan, atau tanda.', en: 'Add text, shapes, or annotations.' }, icon: FilePenLine, category: 'Populer', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'hover:border-indigo-200' },

  // 2. KONVERSI
  { id: 'pdf-to-jpg', title: { id: 'PDF ke JPG', en: 'PDF to JPG' }, desc: { id: 'Simpan halaman PDF jadi gambar JPG.', en: 'Save PDF pages as JPG images.' }, icon: Image, category: 'Konversi', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'hover:border-yellow-200' },
  { id: 'pdf-to-png', title: { id: 'PDF ke PNG', en: 'PDF to PNG' }, desc: { id: 'Simpan halaman PDF jadi gambar PNG.', en: 'Convert PDF pages to PNG images.' }, icon: FileImage, category: 'Konversi', color: 'text-teal-600', bg: 'bg-teal-50', border: 'hover:border-teal-200' },
  { id: 'pdf-to-text', title: { id: 'PDF ke Text', en: 'PDF to Text' }, desc: { id: 'Ekstrak tulisan dari PDF ke Notepad.', en: 'Extract text content to Notepad.' }, icon: FileText, category: 'Konversi', color: 'text-slate-600', bg: 'bg-slate-50', border: 'hover:border-slate-200' },
  { id: 'png-to-pdf', title: { id: 'PNG ke PDF', en: 'PNG to PDF' }, desc: { id: 'Gabungkan gambar PNG jadi PDF.', en: 'Merge PNG images into PDF.' }, icon: FileImage, category: 'Konversi', color: 'text-blue-500', bg: 'bg-blue-50', border: 'hover:border-blue-200' },
  { id: 'flatten-pdf', title: { id: 'Ratakan PDF', en: 'Flatten PDF' }, desc: { id: 'Kunci form & elemen interaktif.', en: 'Lock forms & interactive elements.' }, icon: Layers, category: 'Konversi', color: 'text-slate-700', bg: 'bg-slate-100', border: 'hover:border-slate-200' },
  { id: 'pdf-to-html', title: { id: 'PDF ke HTML', en: 'PDF to HTML' }, desc: { id: 'Konversi PDF jadi halaman web.', en: 'Convert PDF to web page.' }, icon: FileCode, category: 'Konversi', color: 'text-pink-500', bg: 'bg-pink-50', border: 'hover:border-pink-200' },

  // 3. EDIT & ATUR
  { id: 'rotate-pdf', title: { id: 'Putar PDF', en: 'Rotate PDF' }, desc: { id: 'Putar orientasi halaman PDF.', en: 'Rotate page orientation.' }, icon: RefreshCcw, category: 'Edit', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'hover:border-indigo-200' },
  { id: 'delete-pages', title: { id: 'Hapus Halaman', en: 'Delete Pages' }, desc: { id: 'Buang halaman yang tidak perlu.', en: 'Remove unwanted pages.' }, icon: Trash2, category: 'Edit', color: 'text-red-500', bg: 'bg-red-50', border: 'hover:border-red-200' },
  { id: 'rearrange-pdf', title: { id: 'Urutkan Halaman', en: 'Rearrange' }, desc: { id: 'Geser posisi urutan halaman.', en: 'Reorder page positions.' }, icon: Layers, category: 'Edit', color: 'text-blue-500', bg: 'bg-blue-50', border: 'hover:border-blue-200' },
  { id: 'extract-pages', title: { id: 'Ambil Halaman', en: 'Extract Pages' }, desc: { id: 'Simpan halaman pilihan saja.', en: 'Save only selected pages.' }, icon: FileUp, category: 'Edit', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'hover:border-cyan-200' },
  { id: 'add-page-numbers', title: { id: 'Nomor Halaman', en: 'Page Numbers' }, desc: { id: 'Sisipkan nomor halaman otomatis.', en: 'Insert automatic page numbers.' }, icon: BookOpen, category: 'Edit', color: 'text-slate-600', bg: 'bg-slate-50', border: 'hover:border-slate-200' },
  { id: 'resize-pdf', title: { id: 'Ubah Ukuran', en: 'Resize PDF' }, desc: { id: 'Ganti ukuran kertas (A4/Letter).', en: 'Change paper size (A4/Letter).' }, icon: Maximize, category: 'Edit', color: 'text-pink-600', bg: 'bg-pink-50', border: 'hover:border-pink-200' },
  { id: 'add-image-pdf', title: { id: 'Tambah Gambar', en: 'Add Image' }, desc: { id: 'Sisipkan logo atau foto ke PDF.', en: 'Insert logo or photo into PDF.' }, icon: FileImage, category: 'Edit', color: 'text-green-600', bg: 'bg-green-50', border: 'hover:border-green-200' },
  { id: 'fill-form', title: { id: 'Isi Formulir', en: 'Fill Forms' }, desc: { id: 'Isi kolom formulir digital.', en: 'Fill digital form fields.' }, icon: PenTool, category: 'Edit', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'hover:border-indigo-200' },

  // 4. KEAMANAN
  { id: 'protect-pdf', title: { id: 'Kunci PDF', en: 'Protect PDF' }, desc: { id: 'Enkripsi PDF dengan password.', en: 'Encrypt PDF with password.' }, icon: Lock, category: 'Keamanan', color: 'text-slate-800', bg: 'bg-slate-100', border: 'hover:border-slate-200' },
  { id: 'unlock-pdf', title: { id: 'Buka Password', en: 'Unlock PDF' }, desc: { id: 'Hapus proteksi password.', en: 'Remove password protection.' }, icon: Unlock, category: 'Keamanan', color: 'text-pink-600', bg: 'bg-pink-50', border: 'hover:border-pink-200' },
  { id: 'watermark-pdf', title: { id: 'Watermark', en: 'Watermark' }, desc: { id: 'Tempel cap teks transparan.', en: 'Add transparent text stamp.' }, icon: BadgeCheck, category: 'Keamanan', color: 'text-red-600', bg: 'bg-red-50', border: 'hover:border-red-200' },
  { id: 'esign-pdf', title: { id: 'Tanda Tangan', en: 'eSign PDF' }, desc: { id: 'Buat tanda tangan digital.', en: 'Create digital signature.' }, icon: FileSignature, category: 'Keamanan', color: 'text-blue-800', bg: 'bg-blue-100', border: 'hover:border-blue-200' },
];

const TAB_CATEGORIES = [
  { name: 'All', label: { id: 'Semua', en: 'All' }, icon: null },
  { name: 'Populer', label: { id: 'Populer', en: 'Popular' }, icon: TrendingUp },
  { name: 'Konversi', label: { id: 'Konversi', en: 'Convert' }, icon: FileText },
  { name: 'Edit', label: { id: 'Edit & Atur', en: 'Edit & Sort' }, icon: Layers },
  { name: 'Keamanan', label: { id: 'Keamanan', en: 'Security' }, icon: ShieldCheck },
];

const UI_TEXT = {
  brand: { id: 'LayananPDF', en: 'PDFServices' },
  home: { id: 'Beranda', en: 'Home' },
  tools_menu: { id: 'Semua Alat', en: 'All Tools' },
  hero_title: { id: 'Kelola Dokumen PDF Jadi Lebih Mudah', en: 'Manage PDF Documents Made Easy' },
  hero_desc: { id: 'Platform lengkap untuk mengubah, mengedit, dan mengatur file PDF Anda. Tanpa instalasi, tanpa daftar, dan privasi terjaga karena file diproses langsung di browser Anda.', en: 'Complete platform to convert, edit, and organize your PDF files. No installation, no registration, and privacy preserved as files are processed directly in your browser.' },
  search_placeholder: { id: 'Cari alat (misal: Gabung, JPG)...', en: 'Search tools (e.g. Merge, JPG)...' },
  no_result: { id: 'Alat tidak ditemukan', en: 'No tools found' },
  most_used: { id: 'Akses Cepat', en: 'Quick Access' },
  all_tools: { id: 'Semua Alat PDF', en: 'All PDF Tools' },
  result_title: { id: 'Hasil Pencarian', en: 'Search Results' },
  sponsored: { id: 'Disponsori', en: 'Sponsored' },
  change_lang: { id: 'Ganti Bahasa', en: 'Change Language' },
  free: { id: 'Gratis', en: 'Free' },
  tag_safe: { id: 'Aman & Privat', en: 'Secure & Private' },
  
  promo_title: { id: 'Layanan Kami Lainnya', en: 'Our Other Services' },
  footer_desc: { id: 'LayananPDF berkomitmen menyediakan alat produktivitas dokumen yang bisa diakses siapa saja, kapan saja, tanpa biaya.', en: 'LayananPDF is committed to providing document productivity tools accessible to anyone, anytime, at no cost.' },
  footer_quick: { id: 'Menu', en: 'Menu' },
  footer_legal: { id: 'Legalitas', en: 'Legal' },
  privacy: { id: 'Kebijakan Privasi', en: 'Privacy Policy' },
  terms: { id: 'Syarat & Ketentuan', en: 'Terms & Conditions' },
  disclaimer: { id: 'Penafian', en: 'Disclaimer' },
  copyright: { id: 'Hak Cipta', en: 'Copyright' }
};

const OTHER_WEBSITES = [
  {
    name: 'LatihanOnline.com',
    url: 'https://www.latihanonline.com',
    desc: { id: 'Bank Soal & Ujian Sekolah Gratis. Pusat latihan soal online terlengkap untuk SD, SMP, SMA, dan Umum.', en: 'Free School Exam & Question Bank. Complete online practice center for all levels.' },
    color: 'text-orange-700', border: 'hover:border-orange-300', bg_icon: 'bg-orange-100 text-orange-600',
    icon: BookOpen
  },
  {
    name: 'LayananDokumen.com',
    url: 'https://www.layanandokumen.com',
    desc: { id: 'Pusat Administrasi & Surat Resmi. Buat invoice, surat lamaran, dan dokumen legalitas dengan mudah.', en: 'Administrative & Official Letter Center. Create invoices, cover letters, and legal documents easily.' },
    color: 'text-blue-700', border: 'hover:border-blue-300', bg_icon: 'bg-blue-100 text-blue-600',
    icon: FileText
  }
];

export default function Home() {
  const [lang, setLang] = useState<Language>('id');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user-lang') as Language;
    if (saved) setLang(saved);
    setIsLoaded(true);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'id' ? 'en' : 'id';
    setLang(newLang);
    localStorage.setItem('user-lang', newLang);
    window.location.reload();
  };

  const getTool = (id: string) => TOOLS.find(t => t.id === id);
  const jpgTool = getTool('jpg-to-pdf');
  const mergeTool = getTool('merge-pdf');
  const compressTool = getTool('compress-pdf');
  const splitTool = getTool('split-pdf');

  // Filter Logic
  const filteredTools = TOOLS.filter(tool => {
    const title = tool.title[lang].toLowerCase();
    const desc = tool.desc[lang].toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch = title.includes(query) || desc.includes(query);
    let matchesTab = true;
    if (activeTab !== 'All') matchesTab = tool.category === activeTab;
    return matchesSearch && matchesTab;
  });

  // Render Grid with Ads Injection
  const renderGridItems = () => {
    const items: React.ReactNode[] = [];
    const tools = [...filteredTools];
    let toolIndex = 0;
    
    while (toolIndex < tools.length) {
      const currentSlot = items.length; 
      
      // Inject Ad Slot every 6 items (responsive logic handled by CSS)
      if (activeTab === 'All' && !search) {
         if (currentSlot === 4 || currentSlot === 10 || currentSlot === 16 || currentSlot === 22) {
            items.push(
              <div key={`ad-slot-${currentSlot}`} className="h-[220px] col-span-2 md:col-span-1 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
                 <div className="absolute top-2 right-2 px-2 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-400 uppercase tracking-wider z-10">Ad</div>
                 <div className="scale-75 origin-center z-10">
                    <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                 </div>
              </div>
            );
            continue;
         }
      }

      const tool = tools[toolIndex];
      items.push(
        <Link href={`/tools/${tool.id}`} key={tool.id} className="block h-[220px]">
          <div className={`group h-full p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative cursor-pointer overflow-hidden ${tool.border}`}>
            {/* Background Icon (Subtle) */}
            <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
               <tool.icon className="w-32 h-32" />
            </div>

            <div>
              <div className={`w-10 h-10 flex items-center justify-center rounded-xl mb-4 transition-all duration-300 ${tool.bg} ${tool.color}`}>
                <tool.icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <h3 className={`font-bold text-base text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors`}>{tool.title[lang]}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium line-clamp-3">{tool.desc[lang]}</p>
            </div>
            
            <div className="flex items-center justify-end mt-2">
               <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </Link>
      );
      toolIndex++;
    }
    return items;
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-[#F8FAFC] selection:bg-blue-100 selection:text-blue-700 flex flex-col overflow-x-hidden relative">
      
      {/* BACKGROUND DECORATION (Subtle Blobs) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-3xl opacity-50"></div>
         <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-100/40 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 shrink-0 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-slate-900 text-white p-1.5 rounded-lg shadow-md group-hover:scale-105 transition-transform">
              <FileImage className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 uppercase">
              Layanan<span className="text-blue-600">Dokumen</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {jpgTool && <Link href={`/tools/${jpgTool.id}`} className="hover:text-blue-600 transition-colors font-bold">{jpgTool.title[lang]}</Link>}
            {mergeTool && <Link href={`/tools/${mergeTool.id}`} className="hover:text-blue-600 transition-colors font-bold">{mergeTool.title[lang]}</Link>}
            <div className="h-4 w-px bg-slate-200"></div>
            <button onClick={toggleLang} className="flex items-center gap-1 hover:text-blue-600 font-bold px-3 py-1.5 rounded-full border border-slate-200 text-xs bg-white">
               <Globe size={12} /> {lang.toUpperCase()}
            </button>
          </nav>
          
          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 p-4 shadow-xl animate-in slide-in-from-top-2 z-50">
                {jpgTool && <Link href={`/tools/${jpgTool.id}`} className="block py-3 font-bold text-slate-700 border-b border-slate-100">{jpgTool.title[lang]}</Link>}
                {mergeTool && <Link href={`/tools/${mergeTool.id}`} className="block py-3 font-bold text-slate-700 border-b border-slate-100">{mergeTool.title[lang]}</Link>}
                <button onClick={() => { toggleLang(); setIsMobileMenuOpen(false); }} className="w-full text-left py-3 font-bold text-slate-700 flex items-center gap-2">
                    <Globe size={16}/> {UI_TEXT.change_lang[lang]} ({lang.toUpperCase()})
                </button>
            </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-10 pb-12 border-b border-slate-200/60 bg-white/60 backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* LEFT: TEXT & SEARCH */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left pt-4">
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md mb-2">
               <Shield size={12} className="text-green-400 fill-green-400"/> {UI_TEXT.tag_safe[lang]}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-blue-700 tracking-tight leading-[1.2]">
              {UI_TEXT.hero_title[lang]}
            </h1>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
              {UI_TEXT.hero_desc[lang]}
            </p>
            
            {/* SEARCH BAR */}
            <div className="max-w-lg mx-auto lg:mx-0 relative group pt-2">
               <div className="absolute inset-0 bg-blue-200 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
               <div className="relative bg-white rounded-2xl flex items-center p-2 border-2 border-slate-200 group-focus-within:border-blue-500 transition-all shadow-sm">
                  <Search className="text-slate-400 ml-3 shrink-0 group-focus-within:text-blue-500" size={22} />
                  <input 
                    type="text" 
                    placeholder={UI_TEXT.search_placeholder[lang]}
                    className="w-full p-3 outline-none text-slate-800 font-bold bg-transparent text-sm placeholder:text-slate-400"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
               </div>
            </div>

            {/* CATEGORY TABS */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-4">
              {TAB_CATEGORIES.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] uppercase font-bold transition-all border tracking-wider ${activeTab === tab.name ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900'}`}
                >
                  {tab.icon && <tab.icon className="w-3 h-3" />}
                  {tab.label[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: QUICK ACCESS (4 ITEMS) */}
          <div className="lg:col-span-5 w-full">
             <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-100/50">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Zap size={14} className="text-amber-500 fill-amber-500"/> {UI_TEXT.most_used[lang]}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {[jpgTool, mergeTool, compressTool, splitTool].map((tool) => (
                      tool && (
                        <Link href={`/tools/${tool.id}`} key={tool.id} className="group flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer">
                           <div className={`p-2.5 rounded-lg ${tool.bg} ${tool.color} group-hover:scale-110 transition-transform`}>
                              <tool.icon size={18}/>
                           </div>
                           <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">{tool.title[lang]}</p>
                              <p className="text-[10px] text-slate-400 truncate">Free & Online</p>
                           </div>
                        </Link>
                      )
                   ))}
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* --- IKLAN TENGAH (PC) --- */}
      <div className="hidden lg:flex w-full justify-center py-8 bg-slate-50/50 border-b border-slate-100 relative z-10">
         <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
      </div>

      {/* --- GRID AREA --- */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 py-10 flex gap-8 relative z-10">
        
        {/* SKYSCRAPER KIRI */}
        <div className="hidden xl:block w-[160px] sticky top-24 h-fit">
           <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col gap-10 min-w-0">
            {/* Iklan Mobile Top */}
            <div className="md:hidden flex justify-center">
                 <AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
            </div>

            <main className="min-h-[400px]">
              {filteredTools.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {renderGridItems()}
                </div>
              ) : (
                <div className="text-center py-16 bg-white border-2 border-dashed border-slate-300 rounded-3xl">
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{UI_TEXT.no_result[lang]}</p>
                </div>
              )}
            </main>

            {/* Iklan Bawah */}
            <div className="w-full flex justify-center mt-auto">
              <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
            </div>
        </div>

        {/* SKYSCRAPER KANAN */}
        <div className="hidden xl:block w-[160px] sticky top-24 h-fit">
           <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
        </div>

      </div>

      {/* --- CROSS PROMOTION --- */}
      <section className="py-16 px-4 bg-white border-t border-slate-200 mt-10 relative z-10">
          <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                  <h3 className="text-2xl font-black text-slate-800 mb-2">{UI_TEXT.promo_title[lang]}</h3>
                  <div className="h-1 w-16 bg-blue-600 mx-auto rounded-full"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                  {OTHER_WEBSITES.map((site, idx) => (
                      <a href={site.url} target="_blank" rel="noopener noreferrer" key={idx} className={`group block p-6 rounded-2xl border-2 border-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-blue-200 bg-slate-50 hover:bg-white`}>
                          <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-xl bg-white shadow-sm ${site.color}`}>
                                  <site.icon size={32} />
                              </div>
                              <div>
                                  <h4 className={`font-bold text-lg text-slate-900 flex items-center gap-2 ${site.color}`}>
                                      {site.name} <ExternalLink size={14} className="opacity-50"/>
                                  </h4>
                                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{site.desc[lang]}</p>
                              </div>
                          </div>
                      </a>
                  ))}
              </div>
          </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
           <div className="md:col-span-2">
               <div className="font-black text-slate-900 text-xl mb-4 flex items-center gap-2">
                   <div className="bg-slate-900 text-white p-1 rounded"><FileText size={18}/></div>
                   {UI_TEXT.brand[lang]}<span className="text-blue-600">.com</span>
               </div>
               <p className="text-slate-500 text-sm leading-relaxed max-w-sm">{UI_TEXT.footer_desc[lang]}</p>
           </div>
           
           <div>
               <h4 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-widest">{UI_TEXT.footer_quick[lang]}</h4>
               <ul className="space-y-2 text-sm text-slate-500">
                   <li><Link href="/" className="hover:text-blue-600 transition-colors">{UI_TEXT.home[lang]}</Link></li>
                   <li><Link href="#" className="hover:text-blue-600 transition-colors">{UI_TEXT.tools_menu[lang]}</Link></li>
                   <li><a href="https://www.latihanonline.com" target="_blank" className="hover:text-blue-600 transition-colors">LatihanOnline</a></li>
               </ul>
           </div>

           <div>
               <h4 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-widest">{UI_TEXT.footer_legal[lang]}</h4>
               <ul className="space-y-2 text-sm text-slate-500">
                   <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">{UI_TEXT.privacy[lang]}</Link></li>
                   <li><Link href="/terms" className="hover:text-blue-600 transition-colors">{UI_TEXT.terms[lang]}</Link></li>
                   <li><Link href="/disclaimer" className="hover:text-blue-600 transition-colors">{UI_TEXT.disclaimer[lang]}</Link></li>
               </ul>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-200 text-center text-xs text-slate-400 font-bold tracking-widest flex flex-col md:flex-row justify-between items-center gap-2">
            <span>© 2026 {UI_TEXT.brand[lang]}. {UI_TEXT.copyright[lang]}.</span>
            <span className="flex items-center gap-1">Made with <Heart size={10} className="text-red-500 fill-red-500"/> in Indonesia</span>
        </div>
      </footer>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Menu, X, Globe, FileText, ArrowRight, ShieldCheck,
  Scissors, Combine, RefreshCcw, Image, Lock, Unlock, PenTool, 
  Minimize, Layers, Trash2, FileSignature, BookOpen, FileImage, 
  BadgeCheck, Maximize, FileUp, Camera, FilePenLine, Stamp, 
  Layout, FileCode, ExternalLink, Zap, Star
} from 'lucide-react';
import AdsterraBanner from '@/components/AdsterraBanner';

// --- TYPE ---
type Language = 'id' | 'en';

// --- DATA ---
const TOOLS = [
  // 1. POPULER (Urutan Prioritas)
  { id: 'jpg-to-pdf', title: { id: 'JPG ke PDF', en: 'JPG to PDF' }, desc: { id: 'Ubah file gambar menjadi dokumen PDF.', en: 'Convert image files to PDF documents.' }, icon: Image, category: 'Populer', color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'merge-pdf', title: { id: 'Gabung PDF', en: 'Merge PDF' }, desc: { id: 'Satukan banyak file PDF menjadi satu.', en: 'Combine multiple PDFs into one file.' }, icon: Combine, category: 'Populer', color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'compress-pdf', title: { id: 'Kompres PDF', en: 'Compress PDF' }, desc: { id: 'Kecilkan ukuran file agar mudah dikirim.', en: 'Reduce file size for easy sharing.' }, icon: Minimize, category: 'Populer', color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'split-pdf', title: { id: 'Pisah PDF', en: 'Split PDF' }, desc: { id: 'Ambil halaman tertentu atau pecah file.', en: 'Extract pages or split documents.' }, icon: Scissors, category: 'Populer', color: 'text-red-600', bg: 'bg-red-50' },
  { id: 'edit-pdf', title: { id: 'Edit PDF', en: 'Edit PDF' }, desc: { id: 'Tambahkan teks, tanda, dan coretan.', en: 'Add text, shapes, and annotations.' }, icon: FilePenLine, category: 'Populer', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'scan-pdf', title: { id: 'Scan PDF', en: 'Scan PDF' }, desc: { id: 'Scan dokumen fisik menggunakan kamera.', en: 'Scan physical docs using camera.' }, icon: Camera, category: 'Populer', color: 'text-blue-600', bg: 'bg-blue-50' },

  // 2. KONVERSI
  { id: 'pdf-to-jpg', title: { id: 'PDF ke JPG', en: 'PDF to JPG' }, desc: { id: 'Simpan halaman PDF jadi gambar JPG.', en: 'Save PDF pages as JPG images.' }, icon: Image, category: 'Konversi', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { id: 'pdf-to-png', title: { id: 'PDF ke PNG', en: 'PDF to PNG' }, desc: { id: 'Simpan halaman PDF jadi gambar PNG.', en: 'Convert PDF pages to PNG images.' }, icon: FileImage, category: 'Konversi', color: 'text-teal-600', bg: 'bg-teal-50' },
  { id: 'pdf-to-text', title: { id: 'PDF ke Text', en: 'PDF to Text' }, desc: { id: 'Ekstrak tulisan dari PDF ke Notepad.', en: 'Extract text content to Notepad.' }, icon: FileText, category: 'Konversi', color: 'text-slate-600', bg: 'bg-slate-50' },
  { id: 'png-to-pdf', title: { id: 'PNG ke PDF', en: 'PNG to PDF' }, desc: { id: 'Gabungkan gambar PNG jadi PDF.', en: 'Merge PNG images into PDF.' }, icon: FileImage, category: 'Konversi', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { id: 'flatten-pdf', title: { id: 'Ratakan PDF', en: 'Flatten PDF' }, desc: { id: 'Kunci form & elemen interaktif.', en: 'Lock forms & interactive elements.' }, icon: Layers, category: 'Konversi', color: 'text-gray-700', bg: 'bg-gray-100' },
  { id: 'pdf-to-html', title: { id: 'PDF ke HTML', en: 'PDF to HTML' }, desc: { id: 'Konversi PDF jadi halaman web.', en: 'Convert PDF to web page.' }, icon: FileCode, category: 'Konversi', color: 'text-pink-600', bg: 'bg-pink-50' },

  // 3. EDIT & ATUR
  { id: 'rotate-pdf', title: { id: 'Putar PDF', en: 'Rotate PDF' }, desc: { id: 'Perbaiki orientasi halaman PDF.', en: 'Fix PDF page orientation.' }, icon: RefreshCcw, category: 'Edit', color: 'text-violet-600', bg: 'bg-violet-50' },
  { id: 'delete-pages', title: { id: 'Hapus Halaman', en: 'Delete Pages' }, desc: { id: 'Buang halaman yang tidak diinginkan.', en: 'Remove unwanted pages.' }, icon: Trash2, category: 'Edit', color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'rearrange-pdf', title: { id: 'Urutkan Halaman', en: 'Rearrange' }, desc: { id: 'Geser posisi urutan halaman.', en: 'Reorder page positions.' }, icon: Layout, category: 'Edit', color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'extract-pages', title: { id: 'Ambil Halaman', en: 'Extract Pages' }, desc: { id: 'Simpan halaman pilihan saja.', en: 'Save only selected pages.' }, icon: FileUp, category: 'Edit', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'add-page-numbers', title: { id: 'Nomor Halaman', en: 'Page Numbers' }, desc: { id: 'Sisipkan nomor halaman otomatis.', en: 'Insert automatic page numbers.' }, icon: BookOpen, category: 'Edit', color: 'text-slate-600', bg: 'bg-slate-50' },
  { id: 'resize-pdf', title: { id: 'Ubah Ukuran', en: 'Resize PDF' }, desc: { id: 'Ganti ukuran kertas (A4/Letter).', en: 'Change paper size (A4/Letter).' }, icon: Maximize, category: 'Edit', color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
  { id: 'add-image-pdf', title: { id: 'Tambah Gambar', en: 'Add Image' }, desc: { id: 'Sisipkan logo atau foto ke PDF.', en: 'Insert logo or photo into PDF.' }, icon: FileImage, category: 'Edit', color: 'text-lime-600', bg: 'bg-lime-50' },
  { id: 'fill-form', title: { id: 'Isi Formulir', en: 'Fill Forms' }, desc: { id: 'Isi kolom formulir digital.', en: 'Fill digital form fields.' }, icon: PenTool, category: 'Edit', color: 'text-indigo-600', bg: 'bg-indigo-50' },

  // 4. KEAMANAN
  { id: 'protect-pdf', title: { id: 'Kunci PDF', en: 'Protect PDF' }, desc: { id: 'Enkripsi PDF dengan password.', en: 'Encrypt PDF with password.' }, icon: Lock, category: 'Keamanan', color: 'text-slate-800', bg: 'bg-slate-200' },
  { id: 'unlock-pdf', title: { id: 'Buka Password', en: 'Unlock PDF' }, desc: { id: 'Hapus proteksi password PDF.', en: 'Remove PDF password protection.' }, icon: Unlock, category: 'Keamanan', color: 'text-pink-600', bg: 'bg-pink-50' },
  { id: 'watermark-pdf', title: { id: 'Watermark', en: 'Watermark' }, desc: { id: 'Tempel cap teks transparan.', en: 'Add transparent text stamp.' }, icon: BadgeCheck, category: 'Keamanan', color: 'text-red-700', bg: 'bg-red-50' },
  { id: 'esign-pdf', title: { id: 'Tanda Tangan', en: 'eSign PDF' }, desc: { id: 'Buat tanda tangan digital.', en: 'Create digital signature.' }, icon: FileSignature, category: 'Keamanan', color: 'text-blue-800', bg: 'bg-blue-100' },
];

const TAB_CATEGORIES = [
  { name: 'All', label: { id: 'Semua Alat', en: 'All Tools' }, icon: null },
  { name: 'Populer', label: { id: 'Paling Populer', en: 'Most Popular' }, icon: Zap },
  { name: 'Konversi', label: { id: 'Konversi', en: 'Convert' }, icon: FileText },
  { name: 'Edit', label: { id: 'Edit & Atur', en: 'Edit & Organize' }, icon: Layers },
  { name: 'Keamanan', label: { id: 'Keamanan', en: 'Security' }, icon: ShieldCheck },
];

const UI_TEXT = {
  brand: { id: 'LayananPDF', en: 'PDFServices' },
  home: { id: 'Beranda', en: 'Home' },
  tools_menu: { id: 'Alat', en: 'Tools' },
  
  hero_title: { id: 'Kelola Dokumen PDF Jadi Mudah', en: 'Manage PDF Documents Easily' },
  hero_desc: { id: 'Platform lengkap untuk mengubah, mengedit, dan mengatur file PDF Anda. Tanpa instalasi, gratis, dan aman karena file diproses di browser Anda.', en: 'Complete platform to convert, edit, and organize your PDF files. No installation, free, and secure as files are processed in your browser.' },
  
  search_placeholder: { id: 'Cari alat (misal: Gabung, JPG)...', en: 'Search tools (e.g. Merge, JPG)...' },
  no_result: { id: 'Alat tidak ditemukan', en: 'No tools found' },
  most_used: { id: 'Sering Digunakan', en: 'Quick Access' },
  
  sponsored: { id: 'Iklan', en: 'Ad' },
  change_lang: { id: 'Bahasa', en: 'Language' },
  
  promo_title: { id: 'Layanan Kami Lainnya', en: 'Our Other Services' },
  footer_desc: { id: 'LayananPDF menyediakan alat produktivitas dokumen yang aman, cepat, dan gratis untuk semua orang.', en: 'LayananPDF provides secure, fast, and free document productivity tools for everyone.' },
  footer_links: { id: 'Tautan', en: 'Links' },
  footer_legal: { id: 'Legal', en: 'Legal' },
  privacy: { id: 'Privasi', en: 'Privacy' },
  terms: { id: 'Syarat', en: 'Terms' },
  disclaimer: { id: 'Penafian', en: 'Disclaimer' },
  copyright: { id: 'Hak Cipta', en: 'Copyright' }
};

const OTHER_WEBSITES = [
  {
    name: 'LatihanOnline.com',
    url: 'https://www.latihanonline.com',
    desc: { id: 'Bank Soal & Ujian Sekolah Gratis (SD-SMK).', en: 'Free School Exam & Question Bank.' },
    color: 'text-orange-600', bg_hover: 'hover:bg-orange-50', border_hover: 'hover:border-orange-200',
    icon: BookOpen
  },
  {
    name: 'LayananDokumen.com',
    url: 'https://www.layanandokumen.com',
    desc: { id: 'Buat Surat Resmi & Invoice Otomatis.', en: 'Create Official Letters & Invoices Automatically.' },
    color: 'text-blue-600', bg_hover: 'hover:bg-blue-50', border_hover: 'hover:border-blue-200',
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

  const filteredTools = TOOLS.filter(tool => {
    const title = tool.title[lang].toLowerCase();
    const desc = tool.desc[lang].toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch = title.includes(query) || desc.includes(query);
    let matchesTab = true;
    if (activeTab !== 'All') matchesTab = tool.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const renderGridItems = () => {
    const items: React.ReactNode[] = [];
    const tools = [...filteredTools];
    let toolIndex = 0;
    
    while (toolIndex < tools.length) {
      const currentSlot = items.length; 
      
      // IKLAN TIAP 6 ITEM (Sesuai request agar rapi)
      if (activeTab === 'All' && !search) {
         if (currentSlot === 4 || currentSlot === 10 || currentSlot === 16 || currentSlot === 22) {
            items.push(
              <div key={`ad-slot-${currentSlot}`} className="h-[180px] col-span-2 md:col-span-1 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
                 <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-slate-200 rounded text-[9px] font-bold text-slate-500 uppercase tracking-wider z-10">{UI_TEXT.sponsored[lang]}</div>
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
        <Link href={`/tools/${tool.id}`} key={tool.id} className="block h-[180px]">
          <div className="group h-full p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between relative cursor-pointer">
            <div>
              <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${tool.bg} ${tool.color}`}>
                    <tool.icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="font-bold text-base text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{tool.title[lang]}</h3>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{tool.desc[lang]}</p>
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
    <div className="min-h-screen font-sans text-slate-800 bg-[#F8FAFC] flex flex-col overflow-x-hidden">
      
      {/* HEADER SIMPLE & PROFESSIONAL */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 h-16 shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-slate-900 text-white p-1.5 rounded-lg">
              <FileImage className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">
              Layanan<span className="text-blue-600">Dokumen</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {jpgTool && <Link href={`/tools/${jpgTool.id}`} className="hover:text-blue-600 transition-colors">{jpgTool.title[lang]}</Link>}
            {mergeTool && <Link href={`/tools/${mergeTool.id}`} className="hover:text-blue-600 transition-colors">{mergeTool.title[lang]}</Link>}
            <button onClick={toggleLang} className="flex items-center gap-1 hover:text-blue-600 font-bold px-3 py-1.5 rounded bg-slate-50 text-xs uppercase tracking-wide">
               <Globe size={12} /> {lang}
            </button>
          </nav>
          
          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 p-4 shadow-xl z-50">
                {jpgTool && <Link href={`/tools/${jpgTool.id}`} className="block py-3 font-medium text-slate-700 border-b border-slate-100">{jpgTool.title[lang]}</Link>}
                {mergeTool && <Link href={`/tools/${mergeTool.id}`} className="block py-3 font-medium text-slate-700 border-b border-slate-100">{mergeTool.title[lang]}</Link>}
                <button onClick={() => { toggleLang(); setIsMobileMenuOpen(false); }} className="w-full text-left py-3 font-medium text-slate-700 flex items-center gap-2">
                    <Globe size={16}/> {UI_TEXT.change_lang[lang]} ({lang.toUpperCase()})
                </button>
            </div>
        )}
      </header>

      {/* HERO SECTION - SPLIT LAYOUT (Balanced) */}
      <section className="bg-white border-b border-slate-200 pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT: Intro & Search */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {UI_TEXT.hero_title[lang]}
            </h1>
            <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {UI_TEXT.hero_desc[lang]}
            </p>
            
            {/* SEARCH BAR (Big & Clear) */}
            <div className="max-w-lg mx-auto lg:mx-0 relative pt-2">
               <div className="relative flex items-center p-1 border-2 border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 transition-all bg-white">
                  <Search className="text-slate-400 ml-3 shrink-0" size={20} />
                  <input 
                    type="text" 
                    placeholder={UI_TEXT.search_placeholder[lang]}
                    className="w-full p-3 outline-none text-slate-800 font-medium bg-transparent text-sm placeholder:text-slate-400"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
               </div>
            </div>

            {/* TABS */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-4">
              {TAB_CATEGORIES.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${activeTab === tab.name ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                  {tab.icon && <tab.icon className="w-3 h-3" />}
                  {tab.label[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Quick Access (Compact Card) */}
          <div className="lg:col-span-5 w-full">
             <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Star size={12} className="text-orange-500 fill-orange-500"/> {UI_TEXT.most_used[lang]}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {[jpgTool, mergeTool, compressTool, splitTool].map((tool) => (
                      tool && (
                        <Link href={`/tools/${tool.id}`} key={tool.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group">
                           <div className={`p-2 rounded-md ${tool.bg} ${tool.color}`}>
                              <tool.icon size={16}/>
                           </div>
                           <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 truncate">{tool.title[lang]}</p>
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
      <div className="hidden lg:flex w-full justify-center py-8 bg-[#F8FAFC] border-b border-slate-200">
         <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
      </div>

      {/* --- MAIN TOOLS GRID --- */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 flex gap-8">
        
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
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {renderGridItems()}
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
                  <p className="text-slate-400 text-sm font-bold">{UI_TEXT.no_result[lang]}</p>
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
      <section className="py-12 px-6 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-slate-800">{UI_TEXT.promo_title[lang]}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                  {OTHER_WEBSITES.map((site, idx) => (
                      <a href={site.url} target="_blank" rel="noopener noreferrer" key={idx} className={`group flex items-start gap-4 p-4 rounded-xl border border-slate-200 transition-all hover:shadow-md ${site.bg_hover} ${site.border_hover}`}>
                          <div className={`p-3 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-white group-hover:${site.color}`}>
                              <site.icon size={24} />
                          </div>
                          <div>
                              <h4 className={`font-bold text-base text-slate-800 group-hover:${site.color} flex items-center gap-2`}>
                                  {site.name} <ExternalLink size={12} className="opacity-50"/>
                              </h4>
                              <p className="text-xs text-slate-500 mt-1">{site.desc[lang]}</p>
                          </div>
                      </a>
                  ))}
              </div>
          </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
           <div className="md:col-span-2">
               <div className="font-bold text-slate-900 text-lg mb-3 flex items-center gap-2">
                   <div className="bg-slate-800 text-white p-1 rounded"><FileText size={16}/></div>
                   {UI_TEXT.brand[lang]}
               </div>
               <p className="text-slate-500 text-xs leading-relaxed max-w-sm">{UI_TEXT.footer_desc[lang]}</p>
           </div>
           
           <div>
               <h4 className="font-bold text-slate-900 mb-3 text-sm">{UI_TEXT.footer_links[lang]}</h4>
               <ul className="space-y-2 text-xs text-slate-500">
                   <li><Link href="/" className="hover:text-blue-600 transition-colors">{UI_TEXT.home[lang]}</Link></li>
                   <li><a href="https://www.latihanonline.com" target="_blank" className="hover:text-blue-600 transition-colors">LatihanOnline</a></li>
               </ul>
           </div>

           <div>
               <h4 className="font-bold text-slate-900 mb-3 text-sm">{UI_TEXT.footer_legal[lang]}</h4>
               <ul className="space-y-2 text-xs text-slate-500">
                   <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">{UI_TEXT.privacy[lang]}</Link></li>
                   <li><Link href="/terms" className="hover:text-blue-600 transition-colors">{UI_TEXT.terms[lang]}</Link></li>
                   <li><Link href="/disclaimer" className="hover:text-blue-600 transition-colors">{UI_TEXT.disclaimer[lang]}</Link></li>
               </ul>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-8 pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            © 2026 {UI_TEXT.brand[lang]}. {UI_TEXT.copyright[lang]}.
        </div>
      </footer>
    </div>
  );
}

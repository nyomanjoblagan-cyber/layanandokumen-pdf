'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Menu, X, Globe, FileText, ArrowRight, ShieldCheck,
  Scissors, Combine, RefreshCcw, Image, Lock, Unlock, PenTool, 
  Minimize, Layers, Trash2, FileSignature, BookOpen, FileImage, 
  BadgeCheck, Maximize, FileUp, Camera, FilePenLine, Stamp, 
  Layout, FileCode, ExternalLink, Zap, Star, SearchX, Grid3x3, Shield, Edit3, GitMerge
} from 'lucide-react';
import AdsterraBanner from '@/components/AdsterraBanner';

// --- TYPE ---
type Language = 'id' | 'en';

// --- DATA TOOLS LENGKAP 24 ---
const TOOLS = [
  // POPULER (6 tools)
  { 
    id: 'jpg-to-pdf', 
    title: { id: 'JPG ke PDF', en: 'JPG to PDF' }, 
    desc: { id: 'Ubah foto menjadi PDF.', en: 'Convert photos to PDF.' }, 
    icon: Image, category: 'Populer', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', border_hover: 'hover:border-orange-300', badge: 'from-orange-500 to-amber-400'
  },
  { 
    id: 'merge-pdf', 
    title: { id: 'Gabung PDF', en: 'Merge PDF' }, 
    desc: { id: 'Satukan banyak file PDF.', en: 'Combine multiple PDFs.' }, 
    icon: Combine, category: 'Populer', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', border_hover: 'hover:border-purple-300', badge: 'from-purple-500 to-pink-400'
  },
  { 
    id: 'compress-pdf', 
    title: { id: 'Kompres PDF', en: 'Compress PDF' }, 
    desc: { id: 'Kecilkan ukuran file PDF.', en: 'Reduce PDF file size.' }, 
    icon: Minimize, category: 'Populer', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', border_hover: 'hover:border-emerald-300', badge: 'from-emerald-500 to-teal-400'
  },
  { 
    id: 'split-pdf', 
    title: { id: 'Pisah PDF', en: 'Split PDF' }, 
    desc: { id: 'Ambil halaman tertentu.', en: 'Separate specific pages.' }, 
    icon: Scissors, category: 'Populer', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', border_hover: 'hover:border-rose-300', badge: 'from-rose-500 to-pink-400'
  },
  { 
    id: 'edit-pdf', 
    title: { id: 'Edit PDF', en: 'Edit PDF' }, 
    desc: { id: 'Tambahkan teks manual.', en: 'Add manual text.' }, 
    icon: FilePenLine, category: 'Populer', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', border_hover: 'hover:border-indigo-300', badge: 'from-indigo-500 to-blue-400'
  },
  { 
    id: 'scan-pdf', 
    title: { id: 'Scan PDF', en: 'Scan PDF' }, 
    desc: { id: 'Scan dokumen pakai kamera.', en: 'Scan docs via camera.' }, 
    icon: Camera, category: 'Populer', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', border_hover: 'hover:border-blue-300', badge: 'from-blue-500 to-cyan-400'
  },

  // KONVERSI
  { id: 'pdf-to-jpg', title: { id: 'PDF ke JPG', en: 'PDF to JPG' }, desc: { id: 'Simpan halaman jadi gambar.', en: 'Save pages as images.' }, icon: Image, category: 'Konversi', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', border_hover: 'hover:border-amber-300', badge: 'from-amber-500 to-yellow-400' },
  { id: 'pdf-to-png', title: { id: 'PDF ke PNG', en: 'PDF to PNG' }, desc: { id: 'Simpan PDF jadi PNG.', en: 'Convert PDF to PNG.' }, icon: FileImage, category: 'Konversi', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100', border_hover: 'hover:border-teal-300', badge: 'from-teal-500 to-emerald-400' },
  { id: 'pdf-to-text', title: { id: 'PDF ke Text', en: 'PDF to Text' }, desc: { id: 'Salin tulisan dari PDF.', en: 'Extract text from PDF.' }, icon: FileText, category: 'Konversi', color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-100', border_hover: 'hover:border-slate-300', badge: 'from-slate-600 to-gray-500' },
  { id: 'png-to-pdf', title: { id: 'PNG ke PDF', en: 'PNG to PDF' }, desc: { id: 'Gambar PNG jadi PDF.', en: 'Turn PNG into PDF.' }, icon: FileImage, category: 'Konversi', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100', border_hover: 'hover:border-cyan-300', badge: 'from-cyan-500 to-sky-400' },
  { id: 'flatten-pdf', title: { id: 'Ratakan PDF', en: 'Flatten PDF' }, desc: { id: 'Kunci elemen interaktif.', en: 'Lock interactive elements.' }, icon: Layers, category: 'Konversi', color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-100', border_hover: 'hover:border-gray-300', badge: 'from-gray-600 to-slate-500' },
  { id: 'pdf-to-html', title: { id: 'PDF ke HTML', en: 'PDF to HTML' }, desc: { id: 'PDF jadi halaman web.', en: 'PDF to web page.' }, icon: FileCode, category: 'Konversi', color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100', border_hover: 'hover:border-pink-300', badge: 'from-pink-500 to-rose-400' },

  // EDIT
  { id: 'rotate-pdf', title: { id: 'Putar PDF', en: 'Rotate PDF' }, desc: { id: 'Perbaiki orientasi halaman.', en: 'Fix page orientation.' }, icon: RefreshCcw, category: 'Edit', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', border_hover: 'hover:border-violet-300', badge: 'from-violet-500 to-purple-400' },
  { id: 'delete-pages', title: { id: 'Hapus Halaman', en: 'Delete Pages' }, desc: { id: 'Buang halaman.', en: 'Remove pages.' }, icon: Trash2, category: 'Edit', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', border_hover: 'hover:border-rose-300', badge: 'from-rose-500 to-red-400' },
  { id: 'rearrange-pdf', title: { id: 'Urutkan Halaman', en: 'Rearrange PDF' }, desc: { id: 'Geser urutan halaman.', en: 'Reorder pages.' }, icon: Layout, category: 'Edit', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', border_hover: 'hover:border-blue-300', badge: 'from-blue-400 to-sky-300' },
  { id: 'extract-pages', title: { id: 'Ambil Halaman', en: 'Extract Pages' }, desc: { id: 'Simpan halaman pilihan.', en: 'Save selected pages.' }, icon: FileUp, category: 'Edit', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', border_hover: 'hover:border-emerald-300', badge: 'from-emerald-500 to-green-400' },
  { id: 'add-page-numbers', title: { id: 'Nomor Halaman', en: 'Page Numbers' }, desc: { id: 'Sisipkan nomor otomatis.', en: 'Insert page numbers.' }, icon: BookOpen, category: 'Edit', color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-100', border_hover: 'hover:border-slate-300', badge: 'from-slate-600 to-gray-500' },
  { id: 'resize-pdf', title: { id: 'Ubah Ukuran PDF', en: 'Resize PDF' }, desc: { id: 'Ganti ukuran kertas (A4).', en: 'Change page size (A4).' }, icon: Maximize, category: 'Edit', color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', border: 'border-fuchsia-100', border_hover: 'hover:border-fuchsia-300', badge: 'from-fuchsia-500 to-pink-400' },
  { id: 'add-image-pdf', title: { id: 'Tambah Gambar', en: 'Add Image to PDF' }, desc: { id: 'Sisipkan logo/foto.', en: 'Insert logo/photo.' }, icon: FileImage, category: 'Edit', color: 'text-lime-600', bg: 'bg-lime-50', border: 'border-lime-100', border_hover: 'hover:border-lime-300', badge: 'from-lime-500 to-green-400' },
  { id: 'fill-form', title: { id: 'Isi Formulir', en: 'Fill PDF Forms' }, desc: { id: 'Isi kolom formulir PDF.', en: 'Fill PDF form fields.' }, icon: PenTool, category: 'Edit', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', border_hover: 'hover:border-indigo-300', badge: 'from-indigo-500 to-blue-400' },

  // KEAMANAN
  { id: 'protect-pdf', title: { id: 'Kunci PDF', en: 'Protect PDF' }, desc: { id: 'Pasang password.', en: 'Set password.' }, icon: Lock, category: 'Keamanan', color: 'text-slate-800', bg: 'bg-slate-100', border: 'border-slate-200', border_hover: 'hover:border-slate-400', badge: 'from-slate-700 to-gray-600' },
  { id: 'unlock-pdf', title: { id: 'Buka PDF', en: 'Unlock PDF' }, desc: { id: 'Hapus password.', en: 'Remove password.' }, icon: Unlock, category: 'Keamanan', color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100', border_hover: 'hover:border-pink-300', badge: 'from-pink-500 to-rose-400' },
  { id: 'watermark-pdf', title: { id: 'Watermark PDF', en: 'Watermark PDF' }, desc: { id: 'Tempel cap transparan.', en: 'Add transparent stamp.' }, icon: BadgeCheck, category: 'Keamanan', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100', border_hover: 'hover:border-red-300', badge: 'from-red-600 to-orange-500' },
  { id: 'esign-pdf', title: { id: 'Tanda Tangan PDF', en: 'eSign PDF' }, desc: { id: 'Tanda tangan digital.', en: 'Digital signature.' }, icon: FileSignature, category: 'Keamanan', color: 'text-blue-800', bg: 'bg-blue-100', border: 'border-blue-100', border_hover: 'hover:border-blue-300', badge: 'from-blue-600 to-cyan-500' }
];

const TAB_CATEGORIES = [
  { name: 'All', label: { id: 'Semua Alat', en: 'All Tools' }, icon: Grid3x3, color: 'from-slate-600 to-gray-500' },
  { name: 'Populer', label: { id: 'Populer', en: 'Popular' }, icon: Zap, color: 'from-orange-500 to-amber-400' },
  { name: 'Konversi', label: { id: 'Konversi', en: 'Convert' }, icon: GitMerge, color: 'from-emerald-500 to-teal-400' },
  { name: 'Edit', label: { id: 'Edit', en: 'Edit' }, icon: Edit3, color: 'from-blue-500 to-indigo-400' },
  { name: 'Keamanan', label: { id: 'Keamanan', en: 'Security' }, icon: Shield, color: 'from-slate-700 to-gray-600' },
];

const UI_TEXT = {
  brand: { id: 'LayananPDF', en: 'PDFServices' },
  home: { id: 'Beranda', en: 'Home' },
  hero_title: { id: 'Kelola Dokumen PDF Jadi Mudah', en: 'Manage PDF Documents Easily' },
  hero_desc: { 
    id: 'Platform lengkap untuk mengubah, mengedit, dan mengatur file PDF Anda. Tanpa instalasi, gratis, dan aman karena file diproses di browser Anda.', 
    en: 'Complete platform to convert, edit, and organize your PDF files. No installation, free, and secure as files are processed in your browser.' 
  },
  search_placeholder: { id: 'Cari alat PDF...', en: 'Search PDF tools...' },
  no_result: { id: 'Alat tidak ditemukan', en: 'No tools found' },
  most_used: { id: 'Akses Cepat', en: 'Quick Access' },
  search_result_hero: { id: 'Hasil Pencarian', en: 'Search Results' },
  sponsored: { id: 'Iklan', en: 'Ad' },
  change_lang: { id: 'Bahasa', en: 'Language' },
  promo_title: { id: 'Layanan Kami Lainnya', en: 'Our Other Services' },
  footer_desc: { id: 'LayananPDF menyediakan solusi pengelolaan dokumen digital yang aman dan efisien.', en: 'LayananPDF provides secure and efficient digital document solutions.' },
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
    color: 'text-orange-600', bg_hover: 'hover:bg-orange-50', border_hover: 'hover:border-orange-200', bg_icon: 'bg-orange-100', icon: BookOpen
  },
  {
    name: 'LayananDokumen.com',
    url: 'https://www.layanandokumen.com',
    desc: { id: 'Generator dokumen resmi otomatis.', en: 'Automatic official document generator.' },
    color: 'text-blue-600', bg_hover: 'hover:bg-blue-50', border_hover: 'hover:border-blue-200', bg_icon: 'bg-blue-100', icon: FileText
  }
];

// Skeleton Component
const ToolCardSkeleton = () => (
  <div className="h-[180px] p-5 rounded-lg bg-white border border-slate-200 flex flex-col justify-between relative animate-pulse">
    <div>
      <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-slate-200"></div>
          <div className="w-4 h-4 rounded bg-slate-200"></div>
      </div>
      <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-slate-200 rounded w-full mb-1"></div>
      <div className="h-3 bg-slate-200 rounded w-2/3"></div>
    </div>
  </div>
);

export default function Home() {
  const [lang, setLang] = useState<Language>('id');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user-lang') as Language;
    if (saved) setLang(saved);
    setTimeout(() => setIsLoaded(true), 100); 
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'id' ? 'en' : 'id';
    setLang(newLang);
    localStorage.setItem('user-lang', newLang);
  };

  const getTool = (id: string) => TOOLS.find(t => t.id === id);
  const jpgTool = getTool('jpg-to-pdf');
  const mergeTool = getTool('merge-pdf');
  const compressTool = getTool('compress-pdf');
  const splitTool = getTool('split-pdf');

  // Filter Logic
  const filteredTools = TOOLS.filter(tool => {
    if (!tool) return false;
    const title = tool.title[lang].toLowerCase();
    const desc = tool.desc[lang].toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch = title.includes(query) || desc.includes(query);
    let matchesTab = true;
    if (activeTab !== 'All') matchesTab = tool.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const quickAccessTools = search 
    ? filteredTools.slice(0, 6) 
    : [jpgTool, mergeTool, compressTool, splitTool].filter(t => t);

  const renderGridItems = () => {
    const items: React.ReactNode[] = [];
    const tools = [...filteredTools];
    let toolIndex = 0;
    
    while (toolIndex < tools.length) {
      const currentSlot = items.length; 
      
      // IKLAN
      if (activeTab === 'All' && !search) {
         if (currentSlot === 4 || currentSlot === 10 || currentSlot === 16 || currentSlot === 22) {
            items.push(
              <div key={`ad-slot-${currentSlot}`} className="h-[180px] col-span-2 md:col-span-1 rounded-lg border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden bg-white">
                 <div className="absolute top-2 right-2 px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600 uppercase tracking-wide z-10">
                   {UI_TEXT.sponsored[lang]}
                 </div>
                 <div className="scale-75 origin-center z-10">
                    <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                 </div>
              </div>
            );
            continue;
         }
      }

      const tool = tools[toolIndex];
      if (tool) {
        items.push(
            <Link href={`/tools/${tool.id}`} key={tool.id} className="block h-[180px] group">
            <div className={`h-full p-5 rounded-lg border ${tool.border} ${tool.border_hover} transition-all duration-200 flex flex-col justify-between relative cursor-pointer ${tool.bg}`}>
                
                {/* DEKORASI: IKON TRANSPARAN */}
                <div className="absolute -bottom-4 -right-4 pointer-events-none">
                    <tool.icon className={`w-24 h-24 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-300 ${tool.color}`} />
                </div>

                <div className="relative z-10">
                    {/* Category Badge */}
                    <div className={`absolute -top-1 -right-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${tool.badge} opacity-0 group-hover:opacity-100 transition-opacity`}>
                        {tool.category}
                    </div>

                    <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-lg shadow-sm bg-white ${tool.color} group-hover:scale-105 transition-transform duration-200`}>
                            <tool.icon className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>

                    <div>
                        <h3 className="font-bold text-base text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                            {tool.title[lang]}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                            {tool.desc[lang]}
                        </p>
                    </div>
                </div>
            </div>
            </Link>
        );
      }
      toolIndex++;
    }
    return items;
  };

  // --- BACKGROUND KOTAK-KOTAK KECIL ---
  const backgroundPattern = {
    backgroundImage: `linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)`,
    backgroundSize: '16px 16px', // Ukuran kotak kecil 16px
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-white flex flex-col overflow-x-hidden" style={backgroundPattern}>
      
      {/* FLOATING NAVBAR (MELAYANG) */}
      <header className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4 md:px-6">
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl h-16 shadow-sm flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-slate-900 text-white p-1.5 rounded-lg shadow-sm">
              <FileImage className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">
              Layanan<span className="text-blue-600">Dokumen</span>
            </span>
          </Link>

          {/* Links Cleaned Up */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button onClick={toggleLang} className="flex items-center gap-1 hover:text-blue-600 font-bold px-3 py-1.5 rounded bg-slate-50 border border-slate-200 text-xs uppercase tracking-wide transition-colors">
               <Globe size={12} /> {lang}
            </button>
          </nav>
          
          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
            <div className="md:hidden absolute top-20 left-4 right-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-50">
                <button onClick={() => { toggleLang(); setIsMobileMenuOpen(false); }} className="w-full text-left py-3 font-medium text-slate-700 flex items-center gap-2">
                    <Globe size={16}/> {UI_TEXT.change_lang[lang]} ({lang.toUpperCase()})
                </button>
            </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="pt-32 pb-16 border-b border-slate-200 bg-white/50 backdrop-blur-[1px]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Intro & Search */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {!isLoaded ? (
                <div className="space-y-4 animate-pulse">
                    <div className="h-10 bg-slate-200 rounded-lg w-3/4 mx-auto lg:mx-0"></div>
                    <div className="h-4 bg-slate-200 rounded w-full mx-auto lg:mx-0"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3 mx-auto lg:mx-0"></div>
                    <div className="h-12 bg-slate-200 rounded-xl w-full max-w-lg mx-auto lg:mx-0 mt-6"></div>
                </div>
            ) : (
                <>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    {UI_TEXT.hero_title[lang]}
                    </h1>
                    <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                    {UI_TEXT.hero_desc[lang]}
                    </p>
                    
                    {/* SEARCH BAR */}
                    <div className="max-w-lg mx-auto lg:mx-0 relative pt-2">
                    <div className="relative flex items-center p-1 border-2 border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50/50 transition-all bg-white shadow-sm">
                        <Search className="text-slate-400 ml-3 shrink-0" size={20} />
                        <input 
                            type="text" 
                            placeholder={UI_TEXT.search_placeholder[lang]}
                            className="w-full p-3 outline-none text-slate-800 font-medium bg-transparent text-sm placeholder:text-slate-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                <X size={18}/>
                            </button>
                        )}
                    </div>
                    </div>

                    {/* TABS */}
                    <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-4">
                    {TAB_CATEGORIES.map((tab) => (
                        <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border shadow-sm ${activeTab === tab.name ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}
                        >
                        {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                        {tab.label[lang]}
                        </button>
                    ))}
                    </div>
                </>
            )}
          </div>

          {/* RIGHT: Quick Access */}
          <div className="lg:col-span-5 w-full">
             <div className={`bg-white/80 border border-slate-200 rounded-2xl p-6 shadow-sm backdrop-blur-sm transition-all ${search ? 'ring-2 ring-blue-100 bg-blue-50/30' : ''}`}>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   {search ? (
                       <><Search size={14} className="text-blue-500"/> {UI_TEXT.search_result_hero[lang]}</>
                   ) : (
                       <><Star size={12} className="text-orange-500 fill-orange-500"/> {UI_TEXT.most_used[lang]}</>
                   )}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                   {!isLoaded ? (
                       [1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse border border-slate-200"></div>)
                   ) : quickAccessTools.length > 0 ? (
                       quickAccessTools.map((tool) => (
                        tool && (
                            <Link href={`/tools/${tool.id}`} key={tool.id} className="group flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer">
                            <div className={`p-2.5 rounded-lg shadow-sm bg-white ${tool.color} group-hover:scale-110 transition-transform shrink-0`}>
                                <tool.icon size={18} strokeWidth={2}/>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate transition-colors">{tool.title[lang]}</p>
                                <p className="text-[10px] text-slate-400 truncate">{tool.category}</p>
                            </div>
                            </Link>
                        )
                       ))
                   ) : (
                       <div className="col-span-2 text-center py-8 text-slate-400 text-xs font-bold uppercase">
                           <SearchX size={24} className="mx-auto mb-2 opacity-50"/>
                           {UI_TEXT.no_result[lang]}
                       </div>
                   )}
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* --- IKLAN TENGAH (PC) --- */}
      <div className="hidden lg:flex w-full justify-center py-8 border-b border-slate-200 bg-slate-50/30">
         <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
      </div>

      {/* --- MAIN TOOLS GRID --- */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex gap-8">
        
        {/* SKYSCRAPER KIRI */}
        <aside className="hidden xl:block w-[160px] sticky top-24 h-fit">
           <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
        </aside>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col gap-12 min-w-0">
            <div className="md:hidden flex justify-center">
                 <AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
            </div>

            <main className="min-h-[400px]">
              {!isLoaded ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {[1,2,3,4,5,6,7,8].map(i => <ToolCardSkeleton key={i} />)}
                  </div>
              ) : filteredTools.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {renderGridItems()}
                </div>
              ) : (
                <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                  <SearchX size={48} className="mx-auto mb-4 text-slate-300"/>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{UI_TEXT.no_result[lang]}</p>
                </div>
              )}
            </main>

            <div className="w-full flex justify-center mt-auto pt-4 border-t border-slate-200">
              <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
            </div>
        </div>

        {/* SKYSCRAPER KANAN */}
        <aside className="hidden xl:block w-[160px] sticky top-24 h-fit">
           <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
        </aside>

      </div>

      {/* --- CROSS PROMOTION --- */}
      <section className="py-16 px-6 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                  <h3 className="text-xl font-black text-slate-800 mb-2">{UI_TEXT.promo_title[lang]}</h3>
                  <div className="h-1 w-12 bg-blue-600 mx-auto rounded-full"></div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                  {OTHER_WEBSITES.map((site, idx) => (
                      <a href={site.url} target="_blank" rel="noopener noreferrer" key={idx} className={`group flex items-start gap-5 p-5 rounded-2xl border border-slate-200 transition-all hover:shadow-lg hover:-translate-y-0.5 bg-white hover:border-blue-300 relative overflow-hidden`}>
                          <div className={`p-3 rounded-xl shadow-sm ${site.bg_icon} shrink-0`}>
                              <site.icon size={28} strokeWidth={2} />
                          </div>
                          <div>
                              <h4 className={`font-bold text-base text-slate-900 group-hover:text-blue-700 flex items-center gap-2 transition-colors`}>
                                  {site.name} <ExternalLink size={14} className="opacity-40 group-hover:opacity-100"/>
                              </h4>
                              <p className="text-sm text-slate-600 mt-2 leading-relaxed font-medium">{site.desc[lang]}</p>
                          </div>
                      </a>
                  ))}
              </div>
          </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
           <div className="md:col-span-2">
               <div className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
                   <div className="bg-slate-800 text-white p-1 rounded-lg shadow-sm"><FileText size={18}/></div>
                   {UI_TEXT.brand[lang]}
               </div>
               <p className="text-slate-500 text-sm leading-relaxed max-w-sm font-medium">{UI_TEXT.footer_desc[lang]}</p>
           </div>
           
           <div>
               <h4 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-widest">{UI_TEXT.footer_links[lang]}</h4>
               <ul className="space-y-2.5 text-sm text-slate-500 font-medium">
                   <li><Link href="/" className="hover:text-blue-600 transition-colors">{UI_TEXT.home[lang]}</Link></li>
                   <li><a href="https://www.latihanonline.com" target="_blank" className="hover:text-blue-600 transition-colors">LatihanOnline</a></li>
               </ul>
           </div>

           <div>
               <h4 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-widest">{UI_TEXT.footer_legal[lang]}</h4>
               <ul className="space-y-2.5 text-sm text-slate-500 font-medium">
                   <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">{UI_TEXT.privacy[lang]}</Link></li>
                   <li><Link href="/terms" className="hover:text-blue-600 transition-colors">{UI_TEXT.terms[lang]}</Link></li>
                   <li><Link href="/disclaimer" className="hover:text-blue-600 transition-colors">{UI_TEXT.disclaimer[lang]}</Link></li>
               </ul>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            © 2026 {UI_TEXT.brand[lang]}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

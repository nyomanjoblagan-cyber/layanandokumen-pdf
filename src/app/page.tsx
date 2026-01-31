'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Menu, X, Globe, FileText, ArrowRight, ShieldCheck,
  Scissors, Combine, RefreshCcw, Image, Lock, Unlock, PenTool, 
  Minimize, Layers, Trash2, FileSignature, BookOpen, FileImage, 
  BadgeCheck, Maximize, FileUp, Camera, FilePenLine, Stamp, 
  Layout, FileCode, ExternalLink, Zap, Star, SearchX, Sparkles,
  Palette, Grid3x3, Zap as Bolt, Shield, Edit3, GitMerge, CheckCircle
} from 'lucide-react';
import AdsterraBanner from '@/components/AdsterraBanner';

// --- TYPE ---
type Language = 'id' | 'en';

// --- Warna Theme ---
const COLORS = {
  primary: {
    gradient: 'from-blue-600 to-purple-600',
  },
  background: {
    light: 'bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/20',
  }
};

// --- DATA TOOLS ---
const TOOLS = [
  // 1. POPULER
  { 
    id: 'jpg-to-pdf', 
    title: { id: 'JPG ke PDF', en: 'JPG to PDF' }, 
    desc: { 
      id: 'Konversi gambar JPG, JPEG menjadi dokumen PDF berkualitas tinggi dengan ukuran yang optimal.', 
      en: 'Convert JPG, JPEG images to high-quality PDF documents with optimized file size.' 
    }, 
    icon: Image, 
    category: 'Populer', 
    color: 'text-orange-600', 
    bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
    border: 'border-orange-100',
    border_hover: 'hover:border-orange-200',
    badge: 'bg-gradient-to-r from-orange-500 to-amber-400'
  },
  { 
    id: 'merge-pdf', 
    title: { id: 'Gabung PDF', en: 'Merge PDF' }, 
    desc: { 
      id: 'Gabungkan beberapa file PDF menjadi satu dokumen dengan urutan halaman sesuai keinginan.', 
      en: 'Combine multiple PDF files into a single document with customizable page order.' 
    }, 
    icon: Combine, 
    category: 'Populer', 
    color: 'text-purple-600', 
    bg: 'bg-gradient-to-br from-purple-50 to-violet-50',
    border: 'border-purple-100',
    border_hover: 'hover:border-purple-200',
    badge: 'bg-gradient-to-r from-purple-500 to-pink-400'
  },
  { 
    id: 'compress-pdf', 
    title: { id: 'Kompres PDF', en: 'Compress PDF' }, 
    desc: { 
      id: 'Perkecil ukuran file PDF tanpa mengurangi kualitas untuk memudahkan berbagi dan penyimpanan.', 
      en: 'Reduce PDF file size without quality loss for easy sharing and storage.' 
    }, 
    icon: Minimize, 
    category: 'Populer', 
    color: 'text-emerald-600', 
    bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
    border: 'border-emerald-100',
    border_hover: 'hover:border-emerald-200',
    badge: 'bg-gradient-to-r from-emerald-500 to-teal-400'
  },
  { 
    id: 'split-pdf', 
    title: { id: 'Pisah PDF', en: 'Split PDF' }, 
    desc: { 
      id: 'Pisahkan PDF berdasarkan halaman atau ekstrak halaman tertentu menjadi file terpisah.', 
      en: 'Split PDF by pages or extract specific pages into separate files.' 
    }, 
    icon: Scissors, 
    category: 'Populer', 
    color: 'text-rose-600', 
    bg: 'bg-gradient-to-br from-rose-50 to-pink-50',
    border: 'border-rose-100',
    border_hover: 'hover:border-rose-200',
    badge: 'bg-gradient-to-r from-rose-500 to-pink-400'
  },
  { 
    id: 'edit-pdf', 
    title: { id: 'Edit PDF', en: 'Edit PDF' }, 
    desc: { 
      id: 'Edit dokumen PDF: tambah teks, gambar, bentuk, tandai teks, dan anotasi lainnya.', 
      en: 'Edit PDF documents: add text, images, shapes, highlight text, and other annotations.' 
    }, 
    icon: FilePenLine, 
    category: 'Populer', 
    color: 'text-indigo-600', 
    bg: 'bg-gradient-to-br from-indigo-50 to-blue-50',
    border: 'border-indigo-100',
    border_hover: 'hover:border-indigo-200',
    badge: 'bg-gradient-to-r from-indigo-500 to-blue-400'
  },
  { 
    id: 'scan-pdf', 
    title: { id: 'Scan PDF', en: 'Scan PDF' }, 
    desc: { 
      id: 'Scan dokumen fisik menggunakan kamera smartphone dan simpan langsung sebagai PDF.', 
      en: 'Scan physical documents using smartphone camera and save directly as PDF.' 
    }, 
    icon: Camera, 
    category: 'Populer', 
    color: 'text-blue-600', 
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    border: 'border-blue-100',
    border_hover: 'hover:border-blue-200',
    badge: 'bg-gradient-to-r from-blue-500 to-cyan-400'
  },

  // 2. KONVERSI
  { 
    id: 'pdf-to-jpg', 
    title: { id: 'PDF ke JPG', en: 'PDF to JPG' }, 
    desc: { 
      id: 'Konversi halaman PDF menjadi gambar JPG dengan resolusi tinggi dan kualitas optimal.', 
      en: 'Convert PDF pages to high-resolution JPG images with optimal quality.' 
    }, 
    icon: Image, 
    category: 'Konversi', 
    color: 'text-amber-600', 
    bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
    border: 'border-amber-100',
    border_hover: 'hover:border-amber-200',
    badge: 'bg-gradient-to-r from-amber-500 to-yellow-400'
  },
  { 
    id: 'pdf-to-png', 
    title: { id: 'PDF ke PNG', en: 'PDF to PNG' }, 
    desc: { 
      id: 'Ubah halaman PDF menjadi gambar PNG dengan background transparan jika diperlukan.', 
      en: 'Convert PDF pages to PNG images with transparent background if needed.' 
    }, 
    icon: FileImage, 
    category: 'Konversi', 
    color: 'text-teal-600', 
    bg: 'bg-gradient-to-br from-teal-50 to-emerald-50',
    border: 'border-teal-100',
    border_hover: 'hover:border-teal-200',
    badge: 'bg-gradient-to-r from-teal-500 to-emerald-400'
  },
  { 
    id: 'pdf-to-text', 
    title: { id: 'PDF ke Teks', en: 'PDF to Text' }, 
    desc: { 
      id: 'Ekstrak teks dari dokumen PDF ke format TXT atau dokumen Word yang bisa diedit.', 
      en: 'Extract text from PDF documents to editable TXT or Word format.' 
    }, 
    icon: FileText, 
    category: 'Konversi', 
    color: 'text-slate-700', 
    bg: 'bg-gradient-to-br from-slate-50 to-gray-50',
    border: 'border-slate-100',
    border_hover: 'hover:border-slate-200',
    badge: 'bg-gradient-to-r from-slate-600 to-gray-500'
  },
  // ... (tools lainnya dengan deskripsi diperpanjang)
];

// Kategori dengan icon
const TAB_CATEGORIES = [
  { name: 'All', label: { id: 'Semua Alat', en: 'All Tools' }, icon: Grid3x3, color: 'from-slate-600 to-gray-500' },
  { name: 'Populer', label: { id: 'Populer', en: 'Popular' }, icon: Zap, color: 'from-orange-500 to-amber-400' },
  { name: 'Konversi', label: { id: 'Konversi', en: 'Convert' }, icon: GitMerge, color: 'from-emerald-500 to-teal-400' },
  { name: 'Edit', label: { id: 'Edit', en: 'Edit' }, icon: Edit3, color: 'from-blue-500 to-indigo-400' },
  { name: 'Keamanan', label: { id: 'Keamanan', en: 'Security' }, icon: Shield, color: 'from-slate-700 to-gray-600' },
];

// UI Text yang lebih profesional
const UI_TEXT = {
  brand: { id: 'PDFMagic', en: 'PDFMagic' },
  hero_title: { id: 'Alat PDF Online Terlengkap', en: 'Complete Online PDF Tools' },
  hero_desc: { 
    id: 'Platform profesional untuk mengelola dokumen PDF secara online. Konversi, edit, kompres, dan lindungi file PDF Anda dengan mudah, aman, dan gratis.', 
    en: 'Professional platform for managing PDF documents online. Convert, edit, compress, and protect your PDF files easily, securely, and free.' 
  },
  search_placeholder: { id: 'Cari alat PDF...', en: 'Search PDF tools...' },
  no_result: { id: 'Alat tidak ditemukan', en: 'No tools found' },
  most_used: { id: 'Akses Cepat', en: 'Quick Access' },
  search_result_hero: { id: 'Hasil Pencarian', en: 'Search Results' },
  sponsored: { id: 'Iklan', en: 'Ad' },
  change_lang: { id: 'Ganti Bahasa', en: 'Change Language' },
  promo_title: { id: 'Layanan Terkait', en: 'Related Services' },
  footer_desc: { 
    id: 'PDFMagic menyediakan solusi pengelolaan dokumen digital yang aman, efisien, dan gratis untuk kebutuhan pribadi maupun profesional.', 
    en: 'PDFMagic provides secure, efficient, and free digital document solutions for personal and professional needs.' 
  },
};

const OTHER_WEBSITES = [
  {
    name: 'LatihanOnline.com',
    url: 'https://www.latihanonline.com',
    desc: { 
      id: 'Platform pembelajaran online dengan bank soal lengkap untuk semua jenjang pendidikan, dari SD hingga SMA/SMK.', 
      en: 'Online learning platform with complete question bank for all education levels, from elementary to high school.' 
    },
    color: 'text-orange-600', 
    bg_hover: 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50',
    border_hover: 'hover:border-orange-200',
    bg_icon: 'bg-gradient-to-r from-orange-100 to-amber-100',
    icon: BookOpen,
    gradient: 'from-orange-400 to-amber-300'
  },
  {
    name: 'LayananDokumen.com',
    url: 'https://www.layanandokumen.com',
    desc: { 
      id: 'Generator dokumen resmi otomatis: surat, invoice, kontrak, dan formulir dengan template profesional.', 
      en: 'Automatic official document generator: letters, invoices, contracts, and forms with professional templates.' 
    },
    color: 'text-blue-600', 
    bg_hover: 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50',
    border_hover: 'hover:border-blue-200',
    bg_icon: 'bg-gradient-to-r from-blue-100 to-cyan-100',
    icon: FileText,
    gradient: 'from-blue-400 to-cyan-300'
  }
];

// Skeleton Component
const ToolCardSkeleton = () => (
  <div className="h-[180px] p-5 rounded-lg bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-200 flex flex-col justify-between relative animate-pulse">
    <div>
      <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-slate-200 to-slate-300"></div>
          <div className="w-4 h-4 rounded bg-gradient-to-r from-slate-200 to-slate-300"></div>
      </div>
      <div className="h-5 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-full mb-1"></div>
      <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-2/3"></div>
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
    setTimeout(() => setIsLoaded(true), 300);
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
      
      // IKLAN - HILANGKAN GARIS PUTUS-PUTUS
      if (activeTab === 'All' && !search) {
         if (currentSlot === 4 || currentSlot === 10 || currentSlot === 16 || currentSlot === 22) {
            items.push(
              <div key={`ad-slot-${currentSlot}`} className="h-[180px] col-span-2 md:col-span-1 rounded-lg border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden bg-white">
                 <div className="absolute top-2 right-2 px-2 py-1 bg-slate-100 rounded text-[10px] font-semibold text-slate-500 uppercase tracking-wide z-10">
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
      items.push(
        <Link href={`/tools/${tool.id}`} key={tool.id} className="block h-[180px] group">
          <div className={`h-full p-5 rounded-lg border ${tool.border} ${tool.border_hover} transition-all duration-200 flex flex-col justify-between relative cursor-pointer ${tool.bg}`}>
            
            {/* Category Badge - lebih kecil */}
            <div className={`absolute top-3 right-3 text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full text-white ${tool.badge}`}>
              {tool.category}
            </div>

            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${tool.bg} ${tool.color} group-hover:scale-105 transition-transform duration-200`}>
                  <tool.icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>

            <div>
              {/* Judul lebih kecil */}
              <h3 className="font-semibold text-[15px] text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                {tool.title[lang]}
              </h3>
              {/* Deskripsi lebih panjang, font lebih kecil */}
              <p className="text-[12px] text-slate-600 leading-relaxed line-clamp-3">
                {tool.desc[lang]}
              </p>
            </div>
          </div>
        </Link>
      );
      toolIndex++;
    }
    return items;
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 flex flex-col overflow-x-hidden bg-gradient-to-br from-blue-50/20 via-white to-purple-50/10">
      
      {/* Background Elements lebih subtle */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-100/5 rounded-full blur-3xl"></div>
      </div>

      {/* HEADER - lebih profesional */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-1.5 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">
              PDF<span className="text-blue-600">Magic</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <button 
              onClick={toggleLang}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm font-medium"
            >
              <Globe size={14} /> 
              {lang === 'id' ? 'EN' : 'ID'}
            </button>
          </nav>
          
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 p-4 shadow-lg">
            <button 
              onClick={() => { toggleLang(); setIsMobileMenuOpen(false); }}
              className="w-full text-left py-2.5 font-medium text-slate-700 flex items-center gap-3"
            >
              <Globe size={16}/> 
              {UI_TEXT.change_lang[lang]} ({lang.toUpperCase()})
            </button>
          </div>
        )}
      </header>

      {/* HERO SECTION - font size lebih profesional */}
      <section className="pt-24 pb-16 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Intro & Search */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {!isLoaded ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-9 bg-slate-200 rounded w-3/4 mx-auto lg:mx-0"></div>
                <div className="h-4 bg-slate-200 rounded w-full mx-auto lg:mx-0"></div>
              </div>
            ) : (
              <>
                {/* Judul lebih kecil */}
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
                  {UI_TEXT.hero_title[lang]}
                </h1>
                
                {/* Deskripsi lebih panjang, font lebih kecil */}
                <p className="text-[15px] text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  {UI_TEXT.hero_desc[lang]}
                </p>
                
                {/* SEARCH BAR */}
                <div className="max-w-lg mx-auto lg:mx-0 pt-2">
                  <div className="relative flex items-center p-1 border border-slate-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white">
                    <Search className="text-slate-400 ml-3" size={18} />
                    <input 
                      type="text" 
                      placeholder={UI_TEXT.search_placeholder[lang]}
                      className="w-full p-3 outline-none text-slate-800 bg-transparent text-sm placeholder:text-slate-400"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button 
                        onClick={() => setSearch('')}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X size={16}/>
                      </button>
                    )}
                  </div>
                </div>

                {/* TABS - lebih kecil */}
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-4">
                  {TAB_CATEGORIES.map((tab) => (
                    <button
                      key={tab.name}
                      onClick={() => setActiveTab(tab.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium uppercase tracking-wide transition-colors ${
                        activeTab === tab.name 
                          ? `text-white bg-gradient-to-r ${tab.color}` 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.icon && <tab.icon className="w-3 h-3" />}
                      {tab.label[lang]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* RIGHT: Quick Access */}
          <div className="lg:col-span-5 w-full">
            <div className={`bg-white border border-slate-200 rounded-lg p-5 shadow-sm transition-all ${
              search ? 'border-blue-200 bg-blue-50/30' : ''
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  {search ? (
                    <><Search size={12} /> {UI_TEXT.search_result_hero[lang]}</>
                  ) : (
                    <><Star size={12} className="text-amber-500" /> {UI_TEXT.most_used[lang]}</>
                  )}
                </h3>
                <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {quickAccessTools.length}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
                {!isLoaded ? (
                  [1,2,3,4].map(i => (
                    <div key={i} className="h-14 bg-slate-100 rounded animate-pulse border border-slate-200"></div>
                  ))
                ) : quickAccessTools.length > 0 ? (
                  quickAccessTools.map((tool) => (
                    tool && (
                      <Link 
                        href={`/tools/${tool.id}`} 
                        key={tool.id} 
                        className="group flex items-center gap-2.5 p-2.5 bg-white rounded border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                      >
                        <div className={`p-1.5 rounded ${tool.bg} ${tool.color}`}>
                          <tool.icon size={14} strokeWidth={2}/>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-medium text-slate-800 group-hover:text-blue-600 truncate">
                            {tool.title[lang]}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{tool.category}</p>
                        </div>
                      </Link>
                    )
                  ))
                ) : (
                  <div className="col-span-2 text-center py-6">
                    <SearchX size={20} className="mx-auto mb-2 text-slate-300"/>
                    <p className="text-slate-400 text-[11px] font-medium">{UI_TEXT.no_result[lang]}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IKLAN TENGAH - tanpa garis putus-putus */}
      <div className="hidden lg:flex w-full justify-center py-6 bg-slate-50 border-y border-slate-200">
        <div className="bg-white border border-slate-200 rounded p-2">
          <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
        </div>
      </div>

      {/* MAIN TOOLS GRID */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 flex gap-8">
        
        {/* SIDEBAR KIRI */}
        <aside className="hidden xl:block w-[160px] sticky top-24 h-fit">
          <div className="bg-white border border-slate-200 rounded p-1">
            <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
          </div>
        </aside>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col gap-10 min-w-0">
          {/* Mobile Ad */}
          <div className="md:hidden flex justify-center py-2">
            <div className="bg-white border border-slate-200 rounded p-1">
              <AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
            </div>
          </div>

          {/* Grid Title */}
          <div className="text-center mb-2">
            <h2 className="text-lg font-semibold text-slate-800 mb-1">
              {search ? 'Hasil Pencarian' : 'Alat PDF Tersedia'}
            </h2>
            <p className="text-[13px] text-slate-500">
              {filteredTools.length} alat • {search ? `"${search}"` : 'Pilih kategori'}
            </p>
          </div>

          {/* Main Grid */}
          <main className="min-h-[400px]">
            {!isLoaded ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1,2,3,4,5,6,7,8].map(i => <ToolCardSkeleton key={i} />)}
              </div>
            ) : filteredTools.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {renderGridItems()}
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-lg">
                <SearchX size={32} className="mx-auto mb-3 text-slate-300"/>
                <p className="text-slate-400 text-sm font-medium mb-1">{UI_TEXT.no_result[lang]}</p>
                <p className="text-slate-300 text-[12px]">Coba kata kunci lain</p>
              </div>
            )}
          </main>

          {/* Bottom Ad */}
          <div className="w-full flex justify-center mt-auto pt-6 border-t border-slate-200">
            <div className="bg-white border border-slate-200 rounded p-2">
              <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
            </div>
          </div>
        </div>

        {/* SIDEBAR KANAN */}
        <aside className="hidden xl:block w-[160px] sticky top-24 h-fit">
          <div className="bg-white border border-slate-200 rounded p-1">
            <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
          </div>
        </aside>
      </div>

      {/* CROSS PROMOTION */}
      <section className="py-12 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">{UI_TEXT.promo_title[lang]}</h3>
            <div className="h-0.5 w-16 bg-blue-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {OTHER_WEBSITES.map((site, idx) => (
              <a 
                href={site.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                key={idx} 
                className="group flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className={`p-2.5 rounded ${site.bg_icon} shrink-0`}>
                  <site.icon size={20} strokeWidth={2} className={site.color} />
                </div>
                <div>
                  <h4 className={`text-[15px] font-semibold ${site.color} mb-1 flex items-center gap-1.5`}>
                    {site.name}
                    <ExternalLink size={12} className="opacity-60 group-hover:opacity-100"/>
                  </h4>
                  <p className="text-[13px] text-slate-600 leading-relaxed">{site.desc[lang]}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-1 rounded">
                <FileText size={16}/>
              </div>
              {UI_TEXT.brand[lang]}
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed max-w-lg">
              {UI_TEXT.footer_desc[lang]}
            </p>
            <div className="flex gap-2 mt-3">
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <CheckCircle size={10} className="text-emerald-500"/> Aman
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <CheckCircle size={10} className="text-emerald-500"/> Gratis
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <CheckCircle size={10} className="text-emerald-500"/> Online
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-3">Tautan</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-[13px] text-slate-600 hover:text-blue-600 transition-colors">Beranda</Link></li>
              <li><a href="https://www.latihanonline.com" target="_blank" className="text-[13px] text-slate-600 hover:text-orange-600 transition-colors">LatihanOnline</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-8 pt-6 border-t border-slate-200 text-center">
          <div className="text-[10px] text-slate-400 font-medium">
            © 2024 {UI_TEXT.brand[lang]}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

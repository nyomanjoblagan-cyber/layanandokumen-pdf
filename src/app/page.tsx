'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Menu, X, Globe, FileText, ArrowRight, Star,
  Scissors, Combine, RefreshCcw, Image, Lock, Unlock, PenTool, 
  Minimize, Layers, Trash2, FileSignature, BookOpen, FileImage, 
  BadgeCheck, Maximize, FileUp, Camera, FilePenLine, Stamp, 
  FileDown, FileType, Layout, FileCode, CheckCircle2, ExternalLink,
  ShieldCheck, Wand2, Plus, GripVertical, TrendingUp, Zap
} from 'lucide-react';
import AdsterraBanner from '@/components/AdsterraBanner';

// --- TYPE DEFINITION ---
type Language = 'id' | 'en';

// --- DATA TOOLS CONFIGURATION ---
const TOOLS = [
  // 1. POPULER
  { id: 'jpg-to-pdf', title: { id: 'JPG ke PDF', en: 'JPG to PDF' }, desc: { id: 'Ubah foto menjadi PDF.', en: 'Convert photos to PDF.' }, icon: Image, category: 'Populer', color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'merge-pdf', title: { id: 'Gabung PDF', en: 'Merge PDF' }, desc: { id: 'Satukan banyak file PDF.', en: 'Combine multiple PDFs.' }, icon: Combine, category: 'Populer', color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'compress-pdf', title: { id: 'Kompres PDF', en: 'Compress PDF' }, desc: { id: 'Kecilkan ukuran file PDF.', en: 'Reduce PDF file size.' }, icon: Minimize, category: 'Populer', color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'split-pdf', title: { id: 'Pisah PDF', en: 'Split PDF' }, desc: { id: 'Ambil halaman tertentu.', en: 'Separate specific pages.' }, icon: Scissors, category: 'Populer', color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'scan-pdf', title: { id: 'Scan PDF', en: 'Scan PDF' }, desc: { id: 'Scan dokumen pakai kamera.', en: 'Scan docs via camera.' }, icon: Camera, category: 'Populer', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'edit-pdf', title: { id: 'Edit PDF', en: 'Edit PDF' }, desc: { id: 'Tambahkan teks manual.', en: 'Add manual text.' }, icon: FilePenLine, category: 'Populer', color: 'text-indigo-600', bg: 'bg-indigo-50' },

  // 2. KONVERSI
  { id: 'pdf-to-jpg', title: { id: 'PDF ke JPG', en: 'PDF to JPG' }, desc: { id: 'Simpan halaman jadi gambar.', en: 'Save pages as images.' }, icon: Image, category: 'Konversi', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { id: 'pdf-to-png', title: { id: 'PDF ke PNG', en: 'PDF to PNG' }, desc: { id: 'Simpan PDF jadi PNG.', en: 'Convert PDF to PNG.' }, icon: FileImage, category: 'Konversi', color: 'text-teal-600', bg: 'bg-teal-50' },
  { id: 'pdf-to-text', title: { id: 'PDF ke Text', en: 'PDF to Text' }, desc: { id: 'Salin tulisan dari PDF.', en: 'Extract text from PDF.' }, icon: FileText, category: 'Konversi', color: 'text-slate-600', bg: 'bg-slate-50' },
  { id: 'png-to-pdf', title: { id: 'PNG ke PDF', en: 'PNG to PDF' }, desc: { id: 'Gambar PNG jadi PDF.', en: 'Turn PNG into PDF.' }, icon: FileImage, category: 'Konversi', color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'flatten-pdf', title: { id: 'Ratakan PDF', en: 'Flatten PDF' }, desc: { id: 'Kunci elemen interaktif.', en: 'Lock interactive elements.' }, icon: Layers, category: 'Konversi', color: 'text-slate-700', bg: 'bg-slate-100' },
  { id: 'pdf-to-html', title: { id: 'PDF ke HTML', en: 'PDF to HTML' }, desc: { id: 'PDF jadi halaman web.', en: 'PDF to web page.' }, icon: FileCode, category: 'Konversi', color: 'text-pink-500', bg: 'bg-pink-50' },

  // 3. EDIT & ATUR
  { id: 'rotate-pdf', title: { id: 'Putar PDF', en: 'Rotate PDF' }, desc: { id: 'Perbaiki orientasi halaman.', en: 'Fix page orientation.' }, icon: RefreshCcw, category: 'Edit', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'delete-pages', title: { id: 'Hapus Halaman', en: 'Delete Pages' }, desc: { id: 'Buang halaman.', en: 'Remove pages.' }, icon: Trash2, category: 'Edit', color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'rearrange-pdf', title: { id: 'Urutkan Halaman', en: 'Rearrange' }, desc: { id: 'Geser urutan halaman.', en: 'Reorder pages.' }, icon: Layers, category: 'Edit', color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'extract-pages', title: { id: 'Ambil Halaman', en: 'Extract Pages' }, desc: { id: 'Simpan halaman pilihan.', en: 'Save selected pages.' }, icon: FileUp, category: 'Edit', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { id: 'add-page-numbers', title: { id: 'Nomor Halaman', en: 'Page Numbers' }, desc: { id: 'Sisipkan nomor otomatis.', en: 'Insert page numbers.' }, icon: BookOpen, category: 'Edit', color: 'text-slate-600', bg: 'bg-slate-50' },
  { id: 'resize-pdf', title: { id: 'Ubah Ukuran', en: 'Resize PDF' }, desc: { id: 'Ganti ukuran kertas (A4).', en: 'Change page size (A4).' }, icon: Maximize, category: 'Edit', color: 'text-pink-600', bg: 'bg-pink-50' },
  { id: 'add-image-pdf', title: { id: 'Tambah Gambar', en: 'Add Image' }, desc: { id: 'Sisipkan logo/foto.', en: 'Insert logo/photo.' }, icon: FileImage, category: 'Edit', color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'fill-form', title: { id: 'Isi Formulir', en: 'Fill Forms' }, desc: { id: 'Isi kolom formulir PDF.', en: 'Fill PDF form fields.' }, icon: PenTool, category: 'Edit', color: 'text-indigo-600', bg: 'bg-indigo-50' },

  // 4. KEAMANAN
  { id: 'protect-pdf', title: { id: 'Kunci PDF', en: 'Protect PDF' }, desc: { id: 'Pasang password.', en: 'Set password.' }, icon: Lock, category: 'Keamanan', color: 'text-slate-800', bg: 'bg-slate-100' },
  { id: 'unlock-pdf', title: { id: 'Buka Password', en: 'Unlock PDF' }, desc: { id: 'Hapus password.', en: 'Remove password.' }, icon: Unlock, category: 'Keamanan', color: 'text-pink-600', bg: 'bg-pink-50' },
  { id: 'watermark-pdf', title: { id: 'Watermark', en: 'Watermark' }, desc: { id: 'Tempel cap transparan.', en: 'Add transparent stamp.' }, icon: BadgeCheck, category: 'Keamanan', color: 'text-red-600', bg: 'bg-red-50' },
  { id: 'esign-pdf', title: { id: 'Tanda Tangan', en: 'eSign PDF' }, desc: { id: 'Tanda tangan digital.', en: 'Digital signature.' }, icon: FileSignature, category: 'Keamanan', color: 'text-blue-800', bg: 'bg-blue-100' },
];

const TAB_CATEGORIES = [
  { name: 'All', label: { id: 'Semua', en: 'All' }, icon: null },
  { name: 'Populer', label: { id: 'Populer', en: 'Popular' }, icon: TrendingUp },
  { name: 'Konversi', label: { id: 'Konversi', en: 'Convert' }, icon: FileText },
  { name: 'Edit', label: { id: 'Edit & Atur', en: 'Edit & Sort' }, icon: Layers },
  { name: 'Keamanan', label: { id: 'Keamanan', en: 'Security' }, icon: ShieldCheck },
];

const COLOR_THEMES = [
  { border: 'border-blue-200 hover:border-blue-500', bg_grad: 'bg-white hover:bg-blue-50', icon_box: 'bg-white border-blue-100 text-blue-600', icon_hover: 'group-hover:bg-blue-600 group-hover:text-white', title_hover: 'group-hover:text-blue-700', btn_bg: 'text-blue-500 group-hover:bg-blue-600', watermark: 'text-blue-200' },
  { border: 'border-emerald-200 hover:border-emerald-500', bg_grad: 'bg-white hover:bg-emerald-50', icon_box: 'bg-white border-emerald-100 text-emerald-600', icon_hover: 'group-hover:bg-emerald-600 group-hover:text-white', title_hover: 'group-hover:text-emerald-700', btn_bg: 'text-emerald-500 group-hover:bg-emerald-600', watermark: 'text-emerald-200' },
  { border: 'border-violet-200 hover:border-violet-500', bg_grad: 'bg-white hover:bg-violet-50', icon_box: 'bg-white border-violet-100 text-violet-600', icon_hover: 'group-hover:bg-violet-600 group-hover:text-white', title_hover: 'group-hover:text-violet-700', btn_bg: 'text-violet-500 group-hover:bg-violet-600', watermark: 'text-violet-200' },
  { border: 'border-amber-200 hover:border-amber-500', bg_grad: 'bg-white hover:bg-amber-50', icon_box: 'bg-white border-amber-100 text-amber-600', icon_hover: 'group-hover:bg-amber-600 group-hover:text-white', title_hover: 'group-hover:text-amber-700', btn_bg: 'text-amber-500 group-hover:bg-amber-600', watermark: 'text-amber-200' },
];

const UI_TEXT = {
  brand: { id: 'LayananPDF', en: 'PDFServices' },
  home: { id: 'Beranda', en: 'Home' },
  tools_menu: { id: 'Semua Alat', en: 'All Tools' },
  hero_title: { id: 'Solusi PDF Lengkap & Gratis', en: 'All-in-One PDF Solution' },
  hero_desc: { id: 'Kumpulan alat pengelola dokumen yang 100% aman. Semua proses dilakukan di browser Anda (Tanpa Upload Server).', en: 'Secure document management tools. All processing happens in your browser (No Server Uploads).' },
  search_placeholder: { id: 'Cari alat (misal: Gabung, JPG ke PDF)...', en: 'Search tools (e.g. Merge, JPG to PDF)...' },
  no_result: { id: 'Alat tidak ditemukan', en: 'No tools found' },
  most_used: { id: 'Paling Sering Digunakan', en: 'Most Popular Tools' },
  all_tools: { id: 'Semua Alat PDF', en: 'All PDF Tools' },
  result_title: { id: 'Hasil Pencarian', en: 'Search Results' },
  sponsored: { id: 'Disponsori', en: 'Sponsored' },
  change_lang: { id: 'Ganti Bahasa', en: 'Change Language' },
  free: { id: 'Gratis', en: 'Free' },
  
  promo_title: { id: 'Layanan Kami Lainnya', en: 'Our Other Services' },
  footer_desc: { id: 'LayananPDF adalah platform pengelola dokumen gratis, aman, dan tanpa batasan. Proses lokal di browser menjamin privasi Anda.', en: 'LayananPDF is a free, secure, and unlimited document management platform. Local browser processing ensures your privacy.' },
  footer_quick: { id: 'Menu Cepat', en: 'Quick Links' },
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
    desc: { id: 'Bank Soal & Ujian Sekolah Gratis (SD-SMK). Pusat latihan soal online terlengkap dengan pembahasan materi & jawaban.', en: 'Free School Exam & Question Bank. Complete online practice center with materials & answers.' },
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    icon: BookOpen
  },
  {
    name: 'LayananDokumen.com',
    url: 'https://www.layanandokumen.com',
    desc: { id: 'Pusat Administrasi & Surat Resmi. Platform penyusunan dokumen administratif, invoice UMKM, dan legalitas dasar.', en: 'Administrative & Official Letter Center. Platform for drafting administrative documents, invoices, and basic legality.' },
    color: 'bg-blue-50 border-blue-200 text-blue-700',
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

  const filteredTools = TOOLS.filter(tool => {
    const title = tool.title[lang].toLowerCase();
    const desc = tool.desc[lang].toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch = title.includes(query) || desc.includes(query);

    let matchesTab = true;
    if (activeTab !== 'All') {
      matchesTab = tool.category === activeTab;
    }
    return matchesSearch && matchesTab;
  });

  const renderGridItems = () => {
    const items: React.ReactNode[] = [];
    const tools = [...filteredTools];
    let toolIndex = 0;
    
    while (toolIndex < tools.length) {
      const currentSlot = items.length; 
      
      if (activeTab === 'All' && !search) {
         if (currentSlot === 4 || currentSlot === 10 || currentSlot === 16 || currentSlot === 22) {
            items.push(
              <div key={`ad-slot-${currentSlot}`} className="h-[200px] md:h-[280px] col-span-2 md:col-span-1 bg-white/50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center relative overflow-hidden shadow-sm backdrop-blur-sm">
                 <div className="absolute top-2 right-2 px-2 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-400 uppercase tracking-wider z-10">Ad</div>
                 <div className="scale-75 md:scale-90 origin-center z-10">
                    <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 z-10">{UI_TEXT.sponsored[lang]}</p>
              </div>
            );
            continue;
         }
      }

      const tool = tools[toolIndex];
      const theme = COLOR_THEMES[toolIndex % COLOR_THEMES.length];

      items.push(
        <Link href={`/tools/${tool.id}`} key={tool.id} className="block h-[200px] md:h-[280px]">
          <div className={`group h-full p-4 md:p-6 rounded-2xl border ${theme.border} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative cursor-pointer overflow-hidden ${theme.bg_grad}`}>
            <div className="absolute -bottom-4 -right-4 md:-bottom-10 md:-right-10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12">
               <tool.icon strokeWidth={1} className={`w-24 h-24 md:w-48 md:h-48 opacity-10 md:opacity-20 ${theme.watermark}`} />
            </div>
            <div className="relative z-10">
              <div className={`w-8 h-8 md:w-12 md:h-12 flex items-center justify-center border rounded-lg md:rounded-xl mb-3 md:mb-4 transition-all duration-300 shadow-sm ${theme.icon_box} ${theme.icon_hover}`}>
                <tool.icon className="w-4 h-4 md:w-6 md:h-6" strokeWidth={2} />
              </div>
              <h3 className={`font-bold text-sm md:text-lg text-slate-800 mb-1 md:mb-2 line-clamp-2 ${theme.title_hover}`}>{tool.title[lang]}</h3>
              <p className="text-[10px] md:text-xs text-slate-600 leading-relaxed font-medium line-clamp-2 md:line-clamp-none">{tool.desc[lang]}</p>
            </div>
            <div className="relative z-10 flex items-center justify-between mt-2 pt-2 md:pt-4 border-t border-slate-200/50">
               <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 bg-white/60 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full backdrop-blur-sm border border-slate-100">
                 <Zap size={10} className="text-amber-500 fill-amber-500"/> {UI_TEXT.free[lang]}
               </span>
               <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center group-hover:text-white transition-all shadow-sm ${theme.btn_bg}`}>
                  <ArrowRight size={14} />
               </div>
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
      
      {/* --- BACKGROUND PATTERN (KOTAK-KOTAK BIRU TEGAS) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#bfdbfe_1px,transparent_1px),linear-gradient(to_bottom,#bfdbfe_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_0%,#000_80%,transparent_100%)] opacity-70"></div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 shrink-0 shadow-sm relative">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
              <FileImage className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 italic uppercase">
              Layanan<span className="text-blue-600">Dokumen</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {jpgTool && (
                <Link href={`/tools/${jpgTool.id}`} className="hover:text-blue-600 transition-colors font-bold tracking-tight">
                    {jpgTool.title[lang]}
                </Link>
            )}
            {mergeTool && (
                <Link href={`/tools/${mergeTool.id}`} className="hover:text-blue-600 transition-colors font-bold tracking-tight">
                    {mergeTool.title[lang]}
                </Link>
            )}
            <div className="h-4 w-px bg-slate-200"></div>
            <button onClick={toggleLang} className="flex items-center gap-1 hover:text-blue-600 font-bold px-3 py-1.5 rounded-full border border-slate-200 text-xs bg-white">
               <Globe size={12} /> {lang.toUpperCase()}
            </button>
          </nav>
          
          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 p-4 shadow-xl animate-in slide-in-from-top-2 z-50">
                {jpgTool && (
                    <Link href={`/tools/${jpgTool.id}`} className="block py-3 font-bold text-slate-700 border-b border-slate-100">
                        {jpgTool.title[lang]}
                    </Link>
                )}
                {mergeTool && (
                    <Link href={`/tools/${mergeTool.id}`} className="block py-3 font-bold text-slate-700 border-b border-slate-100">
                        {mergeTool.title[lang]}
                    </Link>
                )}
                <button onClick={() => { toggleLang(); setIsMobileMenuOpen(false); }} className="w-full text-left py-3 font-bold text-slate-700 flex items-center gap-2">
                    <Globe size={16}/> {UI_TEXT.change_lang[lang]} ({lang.toUpperCase()})
                </button>
            </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-8 pb-10 border-b border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100 mb-2">
               <Star size={12} fill="currentColor"/> #1 Free PDF Tools
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.2]">
              {UI_TEXT.hero_title[lang]}
            </h1>
            <p className="text-slate-600 text-sm md:text-lg leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
              {UI_TEXT.hero_desc[lang]}
            </p>
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-2">
              {TAB_CATEGORIES.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] uppercase font-black transition-all border tracking-wider ${activeTab === tab.name ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900'}`}
                >
                  {tab.icon && <tab.icon className="w-3 h-3" />}
                  {tab.label[lang]}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
             <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg shadow-slate-100">
                <div className="relative group mb-6">
                   <div className="relative bg-white rounded-xl flex items-center p-2 border-2 border-slate-200 group-focus-within:border-blue-500 transition-colors shadow-sm">
                      <Search className="text-slate-400 ml-2 shrink-0 group-focus-within:text-blue-500" size={20} />
                      <input 
                        type="text" 
                        placeholder={UI_TEXT.search_placeholder[lang]}
                        className="w-full p-2 outline-none text-slate-800 font-medium bg-transparent text-sm placeholder:text-slate-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                   </div>
                </div>

                <div>
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <TrendingUp size={14} className="text-blue-500"/> {UI_TEXT.most_used[lang]}
                   </h3>
                   <div className="space-y-2">
                      {jpgTool && (
                          <Link href={`/tools/${jpgTool.id}`} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
                             <div className="flex items-center gap-3">
                                <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><FileImage size={18}/></div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600">{jpgTool.title[lang]}</p>
                                    <p className="text-[10px] text-slate-400">{jpgTool.desc[lang]}</p>
                                </div>
                             </div>
                             <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500"/>
                          </Link>
                      )}

                      {mergeTool && (
                          <Link href={`/tools/${mergeTool.id}`} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
                             <div className="flex items-center gap-3">
                                <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Layers size={18}/></div>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600">{mergeTool.title[lang]}</p>
                                    <p className="text-[10px] text-slate-400">{mergeTool.desc[lang]}</p>
                                </div>
                             </div>
                             <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500"/>
                          </Link>
                      )}
                   </div>
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* --- IKLAN TENGAH (PC ONLY) --- */}
      <div className="hidden lg:flex w-full justify-center py-6 bg-slate-50/50 border-b border-slate-100 relative z-10">
         <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
      </div>

      {/* --- GRID AREA --- */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 py-8 flex gap-8 relative z-10">
        
        {/* SKYSCRAPER KIRI */}
        <div className="hidden xl:block w-[160px] sticky top-24 h-fit">
           <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
            {/* Iklan Mobile Top */}
            <div className="md:hidden flex justify-center">
                 <AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
            </div>

            <main className="min-h-[400px]">
              {filteredTools.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                  {renderGridItems()}
                </div>
              ) : (
                <div className="text-center py-10 bg-white border border-dashed border-slate-300 rounded-2xl">
                  <p className="text-slate-400 text-sm font-bold uppercase">{UI_TEXT.no_result[lang]}</p>
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
      <section className="py-16 px-4 bg-gradient-to-b from-[#F8FAFC] to-white border-t border-slate-200 mt-16 relative z-10">
          <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                  <h3 className="text-2xl font-black text-slate-800 mb-2">{UI_TEXT.promo_title[lang]}</h3>
                  <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                  {OTHER_WEBSITES.map((site, idx) => (
                      <a href={site.url} target="_blank" rel="noopener noreferrer" key={idx} className={`group block p-6 rounded-2xl border-2 transition-all hover:-translate-y-1 hover:shadow-xl ${site.color} hover:bg-white bg-white`}>
                          <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-xl ${site.color} bg-opacity-20`}>
                                  <site.icon size={32} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 flex items-center gap-2">
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
      <footer className="bg-white border-t border-slate-200 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
           <div className="md:col-span-2">
               <div className="font-black text-slate-900 text-xl mb-4 flex items-center gap-2">
                   <div className="bg-blue-600 text-white p-1 rounded"><FileText size={18}/></div>
                   {UI_TEXT.brand[lang]}<span className="text-blue-600">.com</span>
               </div>
               <p className="text-slate-500 text-sm leading-relaxed max-w-sm">{UI_TEXT.footer_desc[lang]}</p>
           </div>
           
           <div>
               <h4 className="font-bold text-slate-900 mb-4">{UI_TEXT.footer_quick[lang]}</h4>
               <ul className="space-y-2 text-sm text-slate-500">
                   <li><Link href="/" className="hover:text-blue-600 transition-colors">{UI_TEXT.home[lang]}</Link></li>
                   <li><Link href="#all-tools" className="hover:text-blue-600 transition-colors">{UI_TEXT.tools_menu[lang]}</Link></li>
                   <li><a href="https://www.latihanonline.com" target="_blank" className="hover:text-blue-600 transition-colors">LatihanOnline</a></li>
               </ul>
           </div>

           <div>
               <h4 className="font-bold text-slate-900 mb-4">{UI_TEXT.footer_legal[lang]}</h4>
               <ul className="space-y-2 text-sm text-slate-500">
                   <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">{UI_TEXT.privacy[lang]}</Link></li>
                   <li><Link href="/terms" className="hover:text-blue-600 transition-colors">{UI_TEXT.terms[lang]}</Link></li>
                   <li><Link href="/disclaimer" className="hover:text-blue-600 transition-colors">{UI_TEXT.disclaimer[lang]}</Link></li>
               </ul>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-100 text-center text-xs text-slate-400 font-bold tracking-widest">
            © 2026 {UI_TEXT.brand[lang]}. {UI_TEXT.copyright[lang]}.
        </div>
      </footer>
    </div>
  );
}
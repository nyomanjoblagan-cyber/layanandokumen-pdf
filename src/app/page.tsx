'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Menu, X, Globe, FileText, ArrowRight, ShieldCheck,
  Scissors, Combine, RefreshCcw, Image, Lock, Unlock, PenTool, 
  Minimize, Layers, Trash2, FileSignature, BookOpen, FileImage, 
  BadgeCheck, Maximize, FileUp, Camera, FilePenLine, Stamp, 
  Layout, FileCode, ExternalLink, Zap, Star, SearchX, Sparkles,
  Palette, Grid3x3, Zap as Bolt, Shield, Edit3, GitMerge
} from 'lucide-react';
import AdsterraBanner from '@/components/AdsterraBanner';

// --- TYPE ---
type Language = 'id' | 'en';

// --- Warna Theme Baru ---
const COLORS = {
  primary: {
    blue: 'from-blue-500 to-cyan-400',
    purple: 'from-purple-500 to-pink-400',
    gradient: 'from-blue-600 to-purple-600',
  },
  background: {
    light: 'bg-gradient-to-br from-blue-50/40 via-white to-cyan-50/30',
    card: 'bg-gradient-to-br from-white to-slate-50/80',
    section: 'bg-gradient-to-b from-white to-blue-50/20',
  },
  category: {
    populer: 'from-orange-500 to-amber-400',
    konversi: 'from-emerald-500 to-teal-400',
    edit: 'from-blue-500 to-indigo-400',
    keamanan: 'from-slate-700 to-gray-600',
  }
};

// --- DATA TOOLS dengan Warna Baru ---
const TOOLS = [
  // 1. POPULER
  { 
    id: 'jpg-to-pdf', 
    title: { id: 'JPG ke PDF', en: 'JPG to PDF' }, 
    desc: { id: 'Ubah file gambar menjadi dokumen PDF.', en: 'Convert image files to PDF documents.' }, 
    icon: Image, 
    category: 'Populer', 
    color: 'text-orange-600', 
    bg: 'bg-gradient-to-br from-orange-100 to-amber-50',
    border: 'border-orange-100',
    border_hover: 'hover:border-orange-300 hover:shadow-orange-100',
    badge: 'bg-gradient-to-r from-orange-500 to-amber-400'
  },
  { 
    id: 'merge-pdf', 
    title: { id: 'Gabung PDF', en: 'Merge PDF' }, 
    desc: { id: 'Satukan banyak file PDF menjadi satu.', en: 'Combine multiple PDFs into one file.' }, 
    icon: Combine, 
    category: 'Populer', 
    color: 'text-purple-600', 
    bg: 'bg-gradient-to-br from-purple-100 to-violet-50',
    border: 'border-purple-100',
    border_hover: 'hover:border-purple-300 hover:shadow-purple-100',
    badge: 'bg-gradient-to-r from-purple-500 to-pink-400'
  },
  { 
    id: 'compress-pdf', 
    title: { id: 'Kompres PDF', en: 'Compress PDF' }, 
    desc: { id: 'Kecilkan ukuran file agar mudah dikirim.', en: 'Reduce file size for easy sharing.' }, 
    icon: Minimize, 
    category: 'Populer', 
    color: 'text-emerald-600', 
    bg: 'bg-gradient-to-br from-emerald-100 to-green-50',
    border: 'border-emerald-100',
    border_hover: 'hover:border-emerald-300 hover:shadow-emerald-100',
    badge: 'bg-gradient-to-r from-emerald-500 to-teal-400'
  },
  { 
    id: 'split-pdf', 
    title: { id: 'Pisah PDF', en: 'Split PDF' }, 
    desc: { id: 'Ambil halaman tertentu atau pecah file.', en: 'Extract pages or split documents.' }, 
    icon: Scissors, 
    category: 'Populer', 
    color: 'text-rose-600', 
    bg: 'bg-gradient-to-br from-rose-100 to-pink-50',
    border: 'border-rose-100',
    border_hover: 'hover:border-rose-300 hover:shadow-rose-100',
    badge: 'bg-gradient-to-r from-rose-500 to-pink-400'
  },
  { 
    id: 'edit-pdf', 
    title: { id: 'Edit PDF', en: 'Edit PDF' }, 
    desc: { id: 'Tambahkan teks, tanda, dan coretan.', en: 'Add text, shapes, and annotations.' }, 
    icon: FilePenLine, 
    category: 'Populer', 
    color: 'text-indigo-600', 
    bg: 'bg-gradient-to-br from-indigo-100 to-blue-50',
    border: 'border-indigo-100',
    border_hover: 'hover:border-indigo-300 hover:shadow-indigo-100',
    badge: 'bg-gradient-to-r from-indigo-500 to-blue-400'
  },
  { 
    id: 'scan-pdf', 
    title: { id: 'Scan PDF', en: 'Scan PDF' }, 
    desc: { id: 'Scan dokumen fisik menggunakan kamera.', en: 'Scan physical docs using camera.' }, 
    icon: Camera, 
    category: 'Populer', 
    color: 'text-blue-600', 
    bg: 'bg-gradient-to-br from-blue-100 to-cyan-50',
    border: 'border-blue-100',
    border_hover: 'hover:border-blue-300 hover:shadow-blue-100',
    badge: 'bg-gradient-to-r from-blue-500 to-cyan-400'
  },

  // 2. KONVERSI
  { 
    id: 'pdf-to-jpg', 
    title: { id: 'PDF ke JPG', en: 'PDF to JPG' }, 
    desc: { id: 'Simpan halaman PDF jadi gambar JPG.', en: 'Save PDF pages as JPG images.' }, 
    icon: Image, 
    category: 'Konversi', 
    color: 'text-amber-600', 
    bg: 'bg-gradient-to-br from-amber-100 to-yellow-50',
    border: 'border-amber-100',
    border_hover: 'hover:border-amber-300 hover:shadow-amber-100',
    badge: 'bg-gradient-to-r from-amber-500 to-yellow-400'
  },
  { 
    id: 'pdf-to-png', 
    title: { id: 'PDF ke PNG', en: 'PDF to PNG' }, 
    desc: { id: 'Simpan halaman PDF jadi gambar PNG.', en: 'Convert PDF pages to PNG images.' }, 
    icon: FileImage, 
    category: 'Konversi', 
    color: 'text-teal-600', 
    bg: 'bg-gradient-to-br from-teal-100 to-emerald-50',
    border: 'border-teal-100',
    border_hover: 'hover:border-teal-300 hover:shadow-teal-100',
    badge: 'bg-gradient-to-r from-teal-500 to-emerald-400'
  },
  { 
    id: 'pdf-to-text', 
    title: { id: 'PDF ke Text', en: 'PDF to Text' }, 
    desc: { id: 'Ekstrak tulisan dari PDF ke Notepad.', en: 'Extract text content to Notepad.' }, 
    icon: FileText, 
    category: 'Konversi', 
    color: 'text-slate-700', 
    bg: 'bg-gradient-to-br from-slate-100 to-gray-50',
    border: 'border-slate-100',
    border_hover: 'hover:border-slate-300 hover:shadow-slate-100',
    badge: 'bg-gradient-to-r from-slate-600 to-gray-500'
  },
  { 
    id: 'png-to-pdf', 
    title: { id: 'PNG ke PDF', en: 'PNG to PDF' }, 
    desc: { id: 'Gabungkan gambar PNG jadi PDF.', en: 'Merge PNG images into PDF.' }, 
    icon: FileImage, 
    category: 'Konversi', 
    color: 'text-cyan-600', 
    bg: 'bg-gradient-to-br from-cyan-100 to-sky-50',
    border: 'border-cyan-100',
    border_hover: 'hover:border-cyan-300 hover:shadow-cyan-100',
    badge: 'bg-gradient-to-r from-cyan-500 to-sky-400'
  },
  { 
    id: 'flatten-pdf', 
    title: { id: 'Ratakan PDF', en: 'Flatten PDF' }, 
    desc: { id: 'Kunci form & elemen interaktif.', en: 'Lock forms & interactive elements.' }, 
    icon: Layers, 
    category: 'Konversi', 
    color: 'text-gray-700', 
    bg: 'bg-gradient-to-br from-gray-100 to-slate-50',
    border: 'border-gray-100',
    border_hover: 'hover:border-gray-300 hover:shadow-gray-100',
    badge: 'bg-gradient-to-r from-gray-600 to-slate-500'
  },
  { 
    id: 'pdf-to-html', 
    title: { id: 'PDF ke HTML', en: 'PDF to HTML' }, 
    desc: { id: 'Konversi PDF jadi halaman web.', en: 'Convert PDF to web page.' }, 
    icon: FileCode, 
    category: 'Konversi', 
    color: 'text-pink-600', 
    bg: 'bg-gradient-to-br from-pink-100 to-rose-50',
    border: 'border-pink-100',
    border_hover: 'hover:border-pink-300 hover:shadow-pink-100',
    badge: 'bg-gradient-to-r from-pink-500 to-rose-400'
  },

  // 3. EDIT & ATUR
  { 
    id: 'rotate-pdf', 
    title: { id: 'Putar PDF', en: 'Rotate PDF' }, 
    desc: { id: 'Perbaiki orientasi halaman PDF.', en: 'Fix PDF page orientation.' }, 
    icon: RefreshCcw, 
    category: 'Edit', 
    color: 'text-violet-600', 
    bg: 'bg-gradient-to-br from-violet-100 to-purple-50',
    border: 'border-violet-100',
    border_hover: 'hover:border-violet-300 hover:shadow-violet-100',
    badge: 'bg-gradient-to-r from-violet-500 to-purple-400'
  },
  { 
    id: 'delete-pages', 
    title: { id: 'Hapus Halaman', en: 'Delete Pages' }, 
    desc: { id: 'Buang halaman yang tidak diinginkan.', en: 'Remove unwanted pages.' }, 
    icon: Trash2, 
    category: 'Edit', 
    color: 'text-rose-600', 
    bg: 'bg-gradient-to-br from-rose-100 to-red-50',
    border: 'border-rose-100',
    border_hover: 'hover:border-rose-300 hover:shadow-rose-100',
    badge: 'bg-gradient-to-r from-rose-500 to-red-400'
  },
  { 
    id: 'rearrange-pdf', 
    title: { id: 'Urutkan Halaman', en: 'Rearrange' }, 
    desc: { id: 'Geser posisi urutan halaman.', en: 'Reorder page positions.' }, 
    icon: Layout, 
    category: 'Edit', 
    color: 'text-blue-500', 
    bg: 'bg-gradient-to-br from-blue-100 to-sky-50',
    border: 'border-blue-100',
    border_hover: 'hover:border-blue-300 hover:shadow-blue-100',
    badge: 'bg-gradient-to-r from-blue-400 to-sky-300'
  },
  { 
    id: 'extract-pages', 
    title: { id: 'Ambil Halaman', en: 'Extract Pages' }, 
    desc: { id: 'Simpan halaman pilihan saja.', en: 'Save only selected pages.' }, 
    icon: FileUp, 
    category: 'Edit', 
    color: 'text-emerald-600', 
    bg: 'bg-gradient-to-br from-emerald-100 to-green-50',
    border: 'border-emerald-100',
    border_hover: 'hover:border-emerald-300 hover:shadow-emerald-100',
    badge: 'bg-gradient-to-r from-emerald-500 to-green-400'
  },
  { 
    id: 'add-page-numbers', 
    title: { id: 'Nomor Halaman', en: 'Page Numbers' }, 
    desc: { id: 'Sisipkan nomor halaman otomatis.', en: 'Insert automatic page numbers.' }, 
    icon: BookOpen, 
    category: 'Edit', 
    color: 'text-slate-700', 
    bg: 'bg-gradient-to-br from-slate-100 to-gray-50',
    border: 'border-slate-100',
    border_hover: 'hover:border-slate-300 hover:shadow-slate-100',
    badge: 'bg-gradient-to-r from-slate-600 to-gray-500'
  },
  { 
    id: 'resize-pdf', 
    title: { id: 'Ubah Ukuran', en: 'Resize PDF' }, 
    desc: { id: 'Ganti ukuran kertas (A4/Letter).', en: 'Change paper size (A4/Letter).' }, 
    icon: Maximize, 
    category: 'Edit', 
    color: 'text-fuchsia-600', 
    bg: 'bg-gradient-to-br from-fuchsia-100 to-pink-50',
    border: 'border-fuchsia-100',
    border_hover: 'hover:border-fuchsia-300 hover:shadow-fuchsia-100',
    badge: 'bg-gradient-to-r from-fuchsia-500 to-pink-400'
  },
  { 
    id: 'add-image-pdf', 
    title: { id: 'Tambah Gambar', en: 'Add Image' }, 
    desc: { id: 'Sisipkan logo atau foto ke PDF.', en: 'Insert logo or photo into PDF.' }, 
    icon: FileImage, 
    category: 'Edit', 
    color: 'text-lime-600', 
    bg: 'bg-gradient-to-br from-lime-100 to-green-50',
    border: 'border-lime-100',
    border_hover: 'hover:border-lime-300 hover:shadow-lime-100',
    badge: 'bg-gradient-to-r from-lime-500 to-green-400'
  },
  { 
    id: 'fill-form', 
    title: { id: 'Isi Formulir', en: 'Fill Forms' }, 
    desc: { id: 'Isi kolom formulir digital.', en: 'Fill digital form fields.' }, 
    icon: PenTool, 
    category: 'Edit', 
    color: 'text-indigo-600', 
    bg: 'bg-gradient-to-br from-indigo-100 to-blue-50',
    border: 'border-indigo-100',
    border_hover: 'hover:border-indigo-300 hover:shadow-indigo-100',
    badge: 'bg-gradient-to-r from-indigo-500 to-blue-400'
  },

  // 4. KEAMANAN
  { 
    id: 'protect-pdf', 
    title: { id: 'Kunci PDF', en: 'Protect PDF' }, 
    desc: { id: 'Enkripsi PDF dengan password.', en: 'Encrypt PDF with password.' }, 
    icon: Lock, 
    category: 'Keamanan', 
    color: 'text-slate-800', 
    bg: 'bg-gradient-to-br from-slate-200 to-gray-100',
    border: 'border-slate-200',
    border_hover: 'hover:border-slate-400 hover:shadow-slate-200',
    badge: 'bg-gradient-to-r from-slate-700 to-gray-600'
  },
  { 
    id: 'unlock-pdf', 
    title: { id: 'Buka Password', en: 'Unlock PDF' }, 
    desc: { id: 'Hapus proteksi password PDF.', en: 'Remove PDF password protection.' }, 
    icon: Unlock, 
    category: 'Keamanan', 
    color: 'text-pink-600', 
    bg: 'bg-gradient-to-br from-pink-100 to-rose-50',
    border: 'border-pink-100',
    border_hover: 'hover:border-pink-300 hover:shadow-pink-100',
    badge: 'bg-gradient-to-r from-pink-500 to-rose-400'
  },
  { 
    id: 'watermark-pdf', 
    title: { id: 'Watermark', en: 'Watermark' }, 
    desc: { id: 'Tempel cap teks transparan.', en: 'Add transparent text stamp.' }, 
    icon: BadgeCheck, 
    category: 'Keamanan', 
    color: 'text-red-700', 
    bg: 'bg-gradient-to-br from-red-100 to-orange-50',
    border: 'border-red-100',
    border_hover: 'hover:border-red-300 hover:shadow-red-100',
    badge: 'bg-gradient-to-r from-red-600 to-orange-500'
  },
  { 
    id: 'esign-pdf', 
    title: { id: 'Tanda Tangan', en: 'eSign PDF' }, 
    desc: { id: 'Buat tanda tangan digital.', en: 'Create digital signature.' }, 
    icon: FileSignature, 
    category: 'Keamanan', 
    color: 'text-blue-800', 
    bg: 'bg-gradient-to-br from-blue-100 to-cyan-50',
    border: 'border-blue-100',
    border_hover: 'hover:border-blue-300 hover:shadow-blue-100',
    badge: 'bg-gradient-to-r from-blue-600 to-cyan-500'
  },
];

// Kategori dengan icon dan warna baru
const TAB_CATEGORIES = [
  { name: 'All', label: { id: 'Semua Alat', en: 'All Tools' }, icon: Grid3x3, color: 'from-slate-600 to-gray-500' },
  { name: 'Populer', label: { id: 'Paling Populer', en: 'Most Popular' }, icon: Zap, color: 'from-orange-500 to-amber-400' },
  { name: 'Konversi', label: { id: 'Konversi', en: 'Convert' }, icon: GitMerge, color: 'from-emerald-500 to-teal-400' },
  { name: 'Edit', label: { id: 'Edit & Atur', en: 'Edit & Organize' }, icon: Edit3, color: 'from-blue-500 to-indigo-400' },
  { name: 'Keamanan', label: { id: 'Keamanan', en: 'Security' }, icon: Shield, color: 'from-slate-700 to-gray-600' },
];

// UI Text sama

const OTHER_WEBSITES = [
  {
    name: 'LatihanOnline.com',
    url: 'https://www.latihanonline.com',
    desc: { id: 'Bank Soal & Ujian Sekolah Gratis (SD-SMK).', en: 'Free School Exam & Question Bank.' },
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
    desc: { id: 'Buat Surat Resmi & Invoice Otomatis.', en: 'Create Official Letters & Invoices Automatically.' },
    color: 'text-blue-600', 
    bg_hover: 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50',
    border_hover: 'hover:border-blue-200',
    bg_icon: 'bg-gradient-to-r from-blue-100 to-cyan-100',
    icon: FileText,
    gradient: 'from-blue-400 to-cyan-300'
  }
];

// --- Skeleton Component dengan gradient ---
const ToolCardSkeleton = () => (
  <div className="h-[180px] p-5 rounded-xl bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-200 flex flex-col justify-between relative animate-pulse">
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
      
      if (activeTab === 'All' && !search) {
         if (currentSlot === 4 || currentSlot === 10 || currentSlot === 16 || currentSlot === 22) {
            items.push(
              <div key={`ad-slot-${currentSlot}`} className="h-[180px] col-span-2 md:col-span-1 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100">
                 <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-gradient-to-r from-slate-200 to-slate-300 rounded text-[9px] font-bold text-slate-600 uppercase tracking-wider z-10">Sponsored</div>
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
          <div className={`h-full p-5 rounded-xl border ${tool.border} ${tool.border_hover} transition-all duration-300 flex flex-col justify-between relative cursor-pointer overflow-hidden ${tool.bg}`}>
            
            {/* --- Floating Badge --- */}
            <div className={`absolute top-3 right-3 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white ${tool.badge}`}>
              {tool.category}
            </div>

            {/* --- Ikon dengan Shadow --- */}
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${tool.bg} shadow-sm ${tool.color} group-hover:scale-110 transition-transform duration-300`}>
                  <tool.icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>

            <div>
              <h3 className="font-black text-lg text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">{tool.title[lang]}</h3>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-medium">{tool.desc[lang]}</p>
            </div>

            {/* --- Bottom Gradient Line --- */}
            <div className={`h-1 w-full mt-4 rounded-full bg-gradient-to-r ${tool.badge} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          </div>
        </Link>
      );
      toolIndex++;
    }
    return items;
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 flex flex-col overflow-x-hidden bg-gradient-to-br from-blue-50/40 via-white to-purple-50/30">
      
      {/* --- ANIMATED BACKGROUND ELEMENTS --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-200/10 rounded-full blur-3xl"></div>
      </div>

      {/* FLOATING NAVBAR dengan Glass Effect */}
      <header className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4 md:px-6">
        <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl h-16 flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              PDF<span className="text-slate-900">Magic</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <button onClick={toggleLang} className="flex items-center gap-2 font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-slate-100 to-gray-100 border border-slate-200 text-slate-700 hover:from-slate-200 hover:to-gray-200 transition-all shadow-sm">
               <Globe size={14} /> {lang.toUpperCase()}
            </button>
          </nav>
          
          <button className="md:hidden p-2 text-slate-600 bg-white/50 rounded-lg backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
            <div className="md:hidden absolute top-20 left-4 right-4 bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-2xl z-50">
                <button onClick={() => { toggleLang(); setIsMobileMenuOpen(false); }} className="w-full text-left py-3 font-bold text-slate-700 flex items-center gap-3 rounded-lg hover:bg-slate-100/50 px-3">
                    <Globe size={18}/> {lang === 'id' ? 'English' : 'Indonesia'} ({lang.toUpperCase()})
                </button>
            </div>
        )}
      </header>

      {/* HERO SECTION dengan Gradient */}
      <section className="pt-32 pb-20 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10">
          
          {/* LEFT: Intro & Search */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {!isLoaded ? (
                <div className="space-y-4 animate-pulse">
                    <div className="h-10 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-3/4 mx-auto lg:mx-0"></div>
                    <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-full mx-auto lg:mx-0"></div>
                </div>
            ) : (
                <>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                      Kelola <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">PDF</span> dengan Mudah
                    </h1>
                    <p className="text-slate-600 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                      Platform lengkap untuk mengubah, mengedit, dan mengatur file PDF Anda. 
                      <span className="block text-blue-600 font-bold mt-2">Tanpa instalasi • 100% Gratis • Proses di Browser</span>
                    </p>
                    
                    {/* SEARCH BAR dengan Glass Effect */}
                    <div className="max-w-lg mx-auto lg:mx-0 relative pt-2">
                    <div className="relative flex items-center p-1 border-2 border-slate-300 rounded-xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all bg-white/80 backdrop-blur-sm shadow-lg">
                        <Search className="text-blue-500 ml-3 shrink-0" size={20} />
                        <input 
                            type="text" 
                            placeholder="Cari alat PDF (contoh: Gabung, Kompres, Edit)..."
                            className="w-full p-3 outline-none text-slate-800 font-bold bg-transparent text-sm placeholder:text-slate-400"
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

                    {/* TABS dengan Gradient */}
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-6">
                    {TAB_CATEGORIES.map((tab) => (
                        <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg ${activeTab === tab.name 
                            ? `text-white bg-gradient-to-r ${tab.color} border-transparent` 
                            : 'bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 hover:shadow-xl'
                        }`}
                        >
                        {tab.icon && <tab.icon className="w-4 h-4" />}
                        {tab.label[lang]}
                        </button>
                    ))}
                    </div>
                </>
            )}
          </div>

          {/* RIGHT: Quick Access Card dengan Glass Effect */}
          <div className="lg:col-span-5 w-full">
             <div className={`bg-white/90 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-2xl transition-all duration-300 ${search ? 'ring-2 ring-blue-200 bg-gradient-to-br from-blue-50/80 to-cyan-50/60' : 'bg-gradient-to-br from-white to-slate-50/80'}`}>
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      {search ? (
                          <><Search size={16} className="text-blue-500"/> HASIL PENCARIAN</>
                      ) : (
                          <><Star size={14} className="text-amber-500 fill-amber-500"/> AKSES CEPAT</>
                      )}
                   </h3>
                   <div className="text-xs font-bold text-slate-400 bg-slate-100/50 px-2 py-1 rounded-lg">
                     {quickAccessTools.length} Alat
                   </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                   {!isLoaded ? (
                       [1,2,3,4].map(i => (
                         <div key={i} className="h-16 bg-gradient-to-r from-slate-100 to-gray-100 rounded-xl animate-pulse border border-slate-200"></div>
                       ))
                   ) : quickAccessTools.length > 0 ? (
                       quickAccessTools.map((tool) => (
                        tool && (
                            <Link href={`/tools/${tool.id}`} key={tool.id} className="group flex items-center gap-3 p-3 bg-gradient-to-r from-white to-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all cursor-pointer shadow-sm hover:shadow-md">
                            <div className={`p-2.5 rounded-lg ${tool.bg} ${tool.color} group-hover:scale-110 transition-transform`}>
                                <tool.icon size={18} strokeWidth={2}/>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-black text-slate-800 group-hover:text-blue-700 truncate transition-colors">{tool.title[lang]}</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] text-slate-400 truncate">{tool.category}</p>
                                  <ArrowRight size={10} className="text-slate-300 group-hover:text-blue-500 transition-colors"/>
                                </div>
                            </div>
                            </Link>
                        )
                       ))
                   ) : (
                       <div className="col-span-2 text-center py-8">
                           <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-slate-100 to-gray-200 flex items-center justify-center">
                               <SearchX size={24} className="text-slate-400"/>
                           </div>
                           <p className="text-slate-400 text-sm font-bold uppercase">Tidak ditemukan</p>
                           <p className="text-slate-300 text-xs mt-1">Coba kata kunci lain</p>
                       </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- IKLAN TENGAH dengan Glass Effect --- */}
      <div className="hidden lg:flex w-full justify-center py-8 relative z-10">
         <div className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-4 shadow-xl">
            <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
         </div>
      </div>

      {/* --- MAIN TOOLS GRID --- */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex gap-8 relative z-10">
        
        {/* SIDEBAR KIRI */}
        <aside className="hidden xl:block w-[160px] sticky top-24 h-fit">
           <div className="bg-white/90 backdrop-blur-lg border border-white/30 rounded-2xl p-2 shadow-xl">
              <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
           </div>
        </aside>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col gap-12 min-w-0">
            {/* Mobile Ad */}
            <div className="md:hidden flex justify-center">
                 <div className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl p-2 shadow-lg">
                    <AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
                 </div>
            </div>

            {/* Tools Grid Title */}
            <div className="text-center mb-4">
                <h2 className="text-2xl font-black text-slate-900 mb-2">
                  {search ? 'Hasil Pencarian' : 'Semua Alat PDF'}
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                  {filteredTools.length} alat tersedia • {search ? 'Filter: "' + search + '"' : 'Pilih kategori di atas'}
                </p>
            </div>

            {/* Main Grid */}
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
                <div className="text-center py-20 bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-sm border-2 border-dashed border-slate-300 rounded-3xl shadow-inner">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-slate-100 to-gray-200 flex items-center justify-center">
                    <SearchX size={32} className="text-slate-400"/>
                  </div>
                  <p className="text-slate-400 text-sm font-black uppercase tracking-widest mb-2">TIDAK DITEMUKAN</p>
                  <p className="text-slate-300 text-sm max-w-sm mx-auto">Coba cari dengan kata kunci lain atau pilih kategori berbeda</p>
                </div>
              )}
            </main>

            {/* Bottom Ad */}
            <div className="w-full flex justify-center mt-auto pt-8 border-t border-slate-300/50">
              <div className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-4 shadow-xl">
                <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
              </div>
            </div>
        </div>

        {/* SIDEBAR KANAN */}
        <aside className="hidden xl:block w-[160px] sticky top-24 h-fit">
           <div className="bg-white/90 backdrop-blur-lg border border-white/30 rounded-2xl p-2 shadow-xl">
              <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
           </div>
        </aside>
      </div>

      {/* --- CROSS PROMOTION dengan Gradient Cards --- */}
      <section className="py-16 px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                  <h3 className="text-2xl font-black text-slate-900 mb-3">Layanan Kami Lainnya</h3>
                  <div className="h-1.5 w-20 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                  <p className="text-slate-500 mt-4 text-sm font-medium max-w-lg mx-auto">Temukan layanan produktivitas lainnya dari tim kami</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                  {OTHER_WEBSITES.map((site, idx) => (
                      <a href={site.url} target="_blank" rel="noopener noreferrer" key={idx} className={`group flex items-start gap-5 p-6 rounded-2xl border border-white/50 bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-sm transition-all hover:shadow-2xl hover:-translate-y-1 hover:border-blue-200 relative overflow-hidden shadow-lg ${site.bg_hover}`}>
                          {/* Background Gradient */}
                          <div className={`absolute inset-0 bg-gradient-to-r ${site.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                          
                          <div className={`p-4 rounded-xl shadow-lg ${site.bg_icon} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                              <site.icon size={28} strokeWidth={2} className={site.color} />
                          </div>
                          <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                  <h4 className={`font-black text-lg ${site.color} group-hover:scale-105 transition-transform inline-block`}>
                                      {site.name}
                                  </h4>
                                  <ExternalLink size={14} className={`${site.color} opacity-60 group-hover:opacity-100 transition-opacity`}/>
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed font-medium">{site.desc[lang]}</p>
                              <div className="mt-4 flex items-center text-xs font-bold text-slate-400">
                                  <span className="px-2 py-1 rounded-lg bg-slate-100/50">Kunjungi →</span>
                              </div>
                          </div>
                      </a>
                  ))}
              </div>
          </div>
      </section>

      {/* --- FOOTER dengan Gradient --- */}
      <footer className="bg-gradient-to-b from-white to-slate-100 border-t border-slate-300/50 pt-12 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
           <div className="md:col-span-2">
               <div className="font-black text-slate-900 text-xl mb-4 flex items-center gap-3">
                   <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg shadow-lg">
                       <Sparkles size={20}/>
                   </div>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                       PDF<span className="text-slate-900">Magic</span>
                   </span>
               </div>
               <p className="text-slate-600 text-sm leading-relaxed max-w-sm font-medium">
                   Platform alat PDF terlengkap yang aman, cepat, dan 100% gratis untuk semua kebutuhan dokumen Anda.
               </p>
               <div className="flex gap-3 mt-4">
                   <div className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg text-xs font-bold text-blue-700">✓ Tanpa Install</div>
                   <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg text-xs font-bold text-emerald-700">✓ 100% Gratis</div>
                   <div className="px-3 py-1.5 bg-gradient-to-r from-slate-100 to-gray-100 rounded-lg text-xs font-bold text-slate-700">✓ Aman</div>
               </div>
           </div>
           
           <div>
               <h4 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-widest">TAUTAN CEPAT</h4>
               <ul className="space-y-2.5">
                   <li><Link href="/" className="text-sm text-slate-600 font-medium hover:text-blue-600 transition-colors flex items-center gap-2 hover:translate-x-1 transition-transform">→ Beranda</Link></li>
                   <li><a href="https://www.latihanonline.com" target="_blank" className="text-sm text-slate-600 font-medium hover:text-orange-600 transition-colors flex items-center gap-2 hover:translate-x-1 transition-transform">→ LatihanOnline</a></li>
               </ul>
           </div>

           <div>
               <h4 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-widest">LEGAL</h4>
               <ul className="space-y-2.5">
                   <li><Link href="/privacy" className="text-sm text-slate-600 font-medium hover:text-blue-600 transition-colors">Privasi</Link></li>
                   <li><Link href="/terms" className="text-sm text-slate-600 font-medium hover:text-blue-600 transition-colors">Syarat</Link></li>
                   <li><Link href="/disclaimer" className="text-sm text-slate-600 font-medium hover:text-blue-600 transition-colors">Penafian</Link></li>
               </ul>
           </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-slate-300/50 text-center">
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">
                © 2024 PDFMagic. All rights reserved.
            </div>
            <div className="text-[9px] text-slate-300 font-medium">
                Dibuat dengan ❤️ untuk produktivitas digital Indonesia
            </div>
        </div>
      </footer>

      {/* Custom CSS untuk Scrollbar */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  );
}

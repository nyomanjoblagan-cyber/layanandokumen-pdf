'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Menu, X, Zap, 
  Layers, ShieldCheck, FileText, 
  Github, Twitter, Mail, MapPin, ArrowRight,
  TrendingUp, Star, FileImage, Globe
} from 'lucide-react';
import { TOOLS, Language } from '@/data/tools';

export default function Home() {
  const [lang, setLang] = useState<Language>('id');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLang = () => setLang((prev) => (prev === 'id' ? 'en' : 'id'));

  const TEXT = {
    hero_title: {
      id: "Solusi LayananDokumen PDF Lengkap & Aman.",
      en: "The Complete & Secure LayananDokumen PDF Solution."
    },
    hero_desc: {
      id: "Kelola dokumen digital Anda tanpa batasan. Konversi foto ke PDF, gabungkan, pisahkan, dan kompres dokumen dalam hitungan detik. Proses dilakukan di browser (Client-Side), privasi data terjamin 100%.",
      en: "Manage your digital documents without limits. Convert photos to PDF, merge, split, and compress documents in seconds. Processed in-browser (Client-Side), 100% data privacy guaranteed."
    },
    search_placeholder: {
      id: "Cari alat (misal: JPG ke PDF, Gabung)...",
      en: "Search tools (e.g. JPG to PDF, Merge)..."
    }
  };

  const TAB_CATEGORIES = [
    { name: 'All', label: { id: 'Semua', en: 'All' }, icon: null },
    { name: 'Organize', label: { id: 'Atur', en: 'Organize' }, match: ['Populer', 'Edit'], icon: Layers },
    { name: 'Convert', label: { id: 'Konversi', en: 'Convert' }, match: ['Konversi'], icon: FileText },
    { name: 'Security', label: { id: 'Keamanan', en: 'Security' }, match: ['Keamanan'], icon: ShieldCheck },
  ];

  const filteredTools = TOOLS.filter(tool => {
    const title = tool.title[lang].toLowerCase();
    const desc = tool.desc[lang].toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = title.includes(query) || desc.includes(query);

    let matchesTab = true;
    if (activeTab !== 'All') {
      const currentTabConfig = TAB_CATEGORIES.find(t => t.name === activeTab);
      const keywords = currentTabConfig?.match || [];
      matchesTab = keywords.some(k => 
        (typeof tool.category === 'object' ? tool.category.id : tool.category).includes(k) ||
        (typeof tool.category === 'object' ? tool.category.en : tool.category).includes(k)
      );
    }
    return matchesSearch && matchesTab;
  });

  const renderContent = () => {
    const items: React.ReactNode[] = [];
    let adsRendered = 0;
    
    filteredTools.forEach((tool, index) => {
      items.push(
        <Link href={`/tools/${tool.id}`} key={tool.id} className="h-full">
          <div className="group h-full bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-1 transition-all duration-200 flex flex-col items-start gap-3 relative cursor-pointer overflow-hidden">
            <div className={`relative z-10 bg-blue-50 border border-blue-100 text-blue-600 p-2.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all`}>
              <tool.icon className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="w-full relative z-10">
              <h3 className="font-bold text-sm text-slate-800 group-hover:text-blue-700 mb-1.5 truncate">
                {tool.title[lang]}
              </h3>
              <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                {tool.desc[lang]}
              </p>
            </div>
            <ArrowRight className="absolute bottom-3 right-3 w-3.5 h-3.5 text-blue-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </div>
        </Link>
      );

      if (activeTab === 'All' && (index + 1) % 7 === 0 && adsRendered < 4) {
        items.push(
          <div key={`ad-insert-${adsRendered}`} className="group h-full bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed hover:border-blue-400 transition-all duration-200 flex flex-col items-start gap-3 relative cursor-pointer overflow-hidden">
             <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ad</div>
             <div className="relative z-10 text-yellow-500 bg-white border border-slate-200 p-2.5 rounded-lg shadow-sm">
                <Star className="w-5 h-5 fill-current" strokeWidth={2} />
             </div>
             <div className="w-full flex-1 flex items-center justify-center min-h-[50px] text-center">
                <div>
                   <p className="text-xs font-bold text-slate-700 uppercase italic">Sponsor</p>
                   <p className="text-[10px] text-slate-500">Space Iklan</p>
                </div>
             </div>
          </div>
        );
        adsRendered++;
      }
    });

    return items;
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-[#F8FAFC] selection:bg-blue-100 selection:text-blue-700">
      
      {/* BACKGROUND GRID (Biru Samar) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f61a_1px,transparent_1px),linear-gradient(to_bottom,#3b82f61a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         <div className="absolute left-0 right-0 top-[-20%] -z-10 m-auto h-[500px] w-[500px] rounded-full bg-blue-500 opacity-[0.1] blur-[120px]"></div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 transition-all">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform">
              <FileImage className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 italic uppercase">
                Layanan<span className="text-blue-600">Dokumen</span> <span className="text-slate-400 font-black">PDF</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/tools/jpg-to-pdf" className="hover:text-blue-600 transition-colors font-bold tracking-tight">JPG ke PDF</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors font-bold tracking-tight">Gabung PDF</Link>
            <div className="h-4 w-px bg-slate-200"></div>
            {/* TOMBOL LOGIN DIHAPUS, DIGANTI BAHASA SAJA */}
            <button onClick={toggleLang} className="flex items-center gap-1 hover:text-blue-600 font-bold px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-200 transition-all text-xs bg-white">
               <Globe size={12} /> {lang.toUpperCase()}
            </button>
          </nav>
          
          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-14 pb-12 px-6 border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
              {TEXT.hero_title[lang]}
            </h1>
            <p className="text-slate-600 text-base leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
              {TEXT.hero_desc[lang]}
            </p>
            
            <div className="flex flex-wrap gap-2 pt-2 justify-center lg:justify-start">
              {TAB_CATEGORIES.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`
                    flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[10px] uppercase font-black transition-all border tracking-wider
                    ${activeTab === tab.name 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'}
                  `}
                >
                  {tab.icon && <tab.icon className="w-3 h-3" />}
                  {tab.label[lang]}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
             <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/50">
                <div className="relative group mb-6">
                   <div className="relative bg-blue-50/50 rounded-lg flex items-center p-1.5 border border-slate-200 group-focus-within:border-blue-400 transition-colors">
                      <Search className="text-blue-500 ml-3 shrink-0" size={18} />
                      <input 
                        type="text" 
                        placeholder={TEXT.search_placeholder[lang]}
                        className="w-full p-2 outline-none text-slate-800 font-medium bg-transparent text-sm placeholder:text-blue-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                   </div>
                </div>

                <div>
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                      <TrendingUp size={14}/> {lang === 'id' ? 'POPULER MINGGU INI' : 'POPULAR THIS WEEK'}
                   </h3>
                   <div className="space-y-2">
                      <Link href="/tools/jpg-to-pdf" className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-all group">
                         <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-1.5 rounded border border-blue-100 text-blue-600 shadow-sm"><FileImage size={16}/></div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">JPG ke PDF</span>
                         </div>
                         <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500"/>
                      </Link>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* TOOLS GRID */}
      <main className="max-w-6xl mx-auto px-4 py-12 pb-24 relative z-10">
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {renderContent()}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-2xl max-w-lg mx-auto">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{lang === 'id' ? 'Tidak Ditemukan' : 'Not Found'}</p>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 pt-10 pb-6 text-xs relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-8">
            <div className="col-span-2 md:col-span-1 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-md">
                    <FileImage className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-lg text-slate-900 italic uppercase tracking-tighter">Layanan<span className="text-blue-600">Dokumen</span> <span className="text-slate-300">PDF</span></span>
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px] font-medium">
                  Solusi dokumen PDF gratis, aman, dan cepat. Membantu produktivitas harian Anda tanpa upload file ke server.
                </p>
            </div>
            <div>
              <h4 className="font-black text-slate-900 mb-3 uppercase tracking-[0.2em] text-[10px]">Alat Populer</h4>
              <ul className="space-y-2 text-slate-500 font-medium">
                <li><Link href="/tools/jpg-to-pdf" className="hover:text-blue-600 transition-colors">JPG ke PDF</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Gabung PDF</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-slate-900 mb-3 uppercase tracking-[0.2em] text-[10px]">Kebijakan</h4>
              <ul className="space-y-2 text-slate-500 font-medium">
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-slate-900 mb-3 uppercase tracking-[0.2em] text-[10px]">Hubungi</h4>
              <ul className="space-y-2 text-slate-500 font-medium">
                <li className="flex items-center gap-2"><Mail size={12}/> info@layanandokumen.com</li>
                <li className="flex gap-4 pt-2">
                   <Twitter size={14} className="hover:text-blue-500 cursor-pointer transition-colors"/>
                   <Github size={14} className="hover:text-black cursor-pointer transition-colors"/>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 font-bold uppercase tracking-widest text-[9px]">
             <p>&copy; 2026 LayananDokumen PDF</p>
             <div className="flex items-center gap-2">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-tighter">
                   Browser Secure Verified
                </span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
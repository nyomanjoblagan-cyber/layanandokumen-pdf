import React, { ReactNode } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

interface ToolLayoutProps {
  children: ReactNode;
  lang: 'id' | 'en';
  toggleLang: () => void;
  titleDesktop: ReactNode;
  titleMobile?: ReactNode;
  icon: ReactNode;
  iconBgColor?: string;
  selectionClass?: string;
}

export default function ToolLayout({
  children,
  lang,
  toggleLang,
  titleDesktop,
  titleMobile,
  icon,
  iconBgColor = 'bg-blue-600',
  selectionClass = 'selection:bg-blue-100 selection:text-blue-700',
}: ToolLayoutProps) {
  const cancelText = lang === 'id' ? 'Tutup' : 'Close';

  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-slate-800 font-sans relative ${selectionClass} flex flex-col overflow-x-hidden`}>
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className={`${iconBgColor} text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform`}>
            {icon}
          </div>
          <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900 italic uppercase">
              {titleMobile && <span className="md:hidden">{titleMobile}</span>}
              <span className={titleMobile ? "hidden md:inline" : ""}>{titleDesktop}</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
           <button onClick={toggleLang} className="text-[10px] font-bold px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all uppercase tracking-widest text-slate-600">
             {lang}
           </button>
           <Link href="/" className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-500 transition-colors bg-red-50 px-4 py-2 rounded-lg border border-slate-100">
              <X size={16} /> {cancelText}
           </Link>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative z-10 flex flex-col h-[calc(100dvh-64px)] md:h-auto overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

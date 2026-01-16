'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  FileUp, FileText, CheckCircle2, Download, Globe, 
  X, ArrowLeft, Loader2, CheckSquare, Square, MousePointerClick, Info, Layers
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// 1. WORKER STABIL (Wajib)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export default function ExtractPagesPage() {
  // STATE UTAMA
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]); // Array index halaman yang DIPILIH
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // UI & BAHASA
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [isLoaded, setIsLoaded] = useState(false); 
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 2. LOGIKA BAHASA ---
  useEffect(() => {
    const saved = localStorage.getItem('user-lang') as 'id' | 'en';
    if (saved) setLang(saved);
    setIsLoaded(true);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'id' ? 'en' : 'id';
    setLang(newLang);
    localStorage.setItem('user-lang', newLang);
  };

  // --- 3. KAMUS ---
  const T = {
    hero_title: { id: 'Ambil Halaman PDF', en: 'Extract PDF Pages' },
    hero_desc: { 
      id: 'Pilih halaman-halaman penting dari dokumen PDF Anda dan simpan menjadi satu file baru yang lebih ringkas.', 
      en: 'Select important pages from your PDF document and save them as a new, concise file.' 
    },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    drop_text: { id: 'atau tarik file ke sini', en: 'or drop file here' },
    
    // Editor UI
    preview_title: { id: 'Pilih Halaman', en: 'Select Pages' },
    selected_count: { id: 'dipilih', en: 'selected' },
    
    // Actions
    btn_extract: { id: 'Ambil Halaman', en: 'Extract Pages' },
    btn_select_all: { id: 'Pilih Semua', en: 'Select All' },
    btn_reset: { id: 'Reset', en: 'Reset' },
    
    // Info
    info_text: { id: 'Klik pada halaman yang ingin Anda AMBIL. Halaman yang tidak dipilih akan ditinggalkan.', en: 'Click on pages you want to KEEP. Unselected pages will be left behind.' },

    // Status
    processing: { id: 'MEMUAT...', en: 'LOADING...' },
    extracting: { id: 'MEMPROSES...', en: 'PROCESSING...' },
    
    // Success
    success_title: { id: 'Berhasil Diambil!', en: 'Extraction Success!' },
    success_desc: { id: 'Halaman pilihan Anda telah disatukan menjadi PDF baru.', en: 'Your selected pages have been merged into a new PDF.' },
    download_btn: { id: 'Download PDF', en: 'Download PDF' },
    back_home: { id: 'Ambil Lagi', en: 'Extract Again' },
    cancel: { id: 'Tutup', en: 'Close' },
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  // --- 4. RENDER THUMBNAIL ---
  const processFile = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') {
        alert("Mohon pilih file PDF.");
        return;
    }
    setFile(uploadedFile);
    setIsProcessing(true);
    setThumbnails([]);
    setSelectedPages([]);
    setPdfUrl(null);

    try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;
        const thumbs: string[] = [];

        // Limit preview max 50 halaman agar performa browser aman
        const limit = Math.min(totalPages, 50); 

        for (let i = 1; i <= limit; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.25 }); // Low res thumbnail
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport } as any).promise;
                thumbs.push(canvas.toDataURL());
            }
        }
        setThumbnails(thumbs);
        setSelectedPages([]); 

    } catch (error) {
        console.error(error);
        alert("Gagal membaca file PDF.");
        setFile(null);
    } finally {
        setIsProcessing(false);
    }
  };

  // --- 5. LOGIKA SELEKSI ---
  const togglePage = (index: number) => {
    if (selectedPages.includes(index)) {
        setSelectedPages(selectedPages.filter(id => id !== index));
    } else {
        // Urutkan halaman agar hasil PDF rapi sesuai urutan asli (ascending)
        setSelectedPages([...selectedPages, index].sort((a, b) => a - b));
    }
  };

  const selectAll = () => setSelectedPages(thumbnails.map((_, i) => i));
  const deselectAll = () => setSelectedPages([]);

  // --- 6. EXTRACT ENGINE ---
  const handleExtract = async () => {
    if (!file || selectedPages.length === 0) {
        alert(lang === 'id' ? "Pilih minimal 1 halaman." : "Select at least 1 page.");
        return;
    }
    setIsExtracting(true);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const newPdf = await PDFDocument.create();
        
        // Copy hanya halaman yang dipilih
        const copiedPages = await newPdf.copyPages(pdfDoc, selectedPages);
        copiedPages.forEach((page) => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        
        // FIX BLOB ERROR
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);

    } catch (error) {
        console.error(error);
        alert("Gagal memproses PDF.");
    } finally {
        setIsExtracting(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setThumbnails([]);
    setPdfUrl(null);
    setSelectedPages([]);
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans relative selection:bg-blue-100 selection:text-blue-700 flex flex-col overflow-hidden">
      
      {/* NAVBAR */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-cyan-600 text-white p-1 md:p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><FileUp size={18} /></div>
          <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900 italic uppercase">
              <span className="md:hidden">Extract<span className="text-cyan-600">PDF</span></span>
              <span className="hidden md:inline">Layanan<span className="text-cyan-600">Dokumen</span> <span className="text-slate-300 font-black">PDF</span></span>
          </span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
           <button onClick={toggleLang} className="flex items-center gap-1 font-bold bg-slate-100 px-2 py-1 rounded text-[10px] text-slate-600 hover:bg-cyan-50 hover:text-cyan-600 transition-colors">
             <Globe size={12} /> {lang.toUpperCase()}
           </button>
           <Link href="/" className="text-[10px] md:text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-[0.2em] transition-colors flex items-center gap-1">
              <X size={18} /> <span className="hidden md:inline">{T.cancel[lang]}</span>
           </Link>
        </div>
      </nav>

      <main className="flex-1 relative z-10 flex flex-col h-[calc(100dvh-56px)] md:h-auto">
        
        {/* STATE 1: LANDING */}
        {!file && (
          <div 
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-all overflow-y-auto ${isDraggingOver ? 'bg-cyan-50/50' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
          >
             <div className="w-full max-w-[1400px] flex gap-4 xl:gap-8 justify-center items-start pt-4 md:pt-10">
                <div className="hidden xl:block sticky top-20">
                   <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
                </div>
                
                <div className="flex-1 max-w-4xl space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="mb-8 flex justify-center">
                       <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
                    </div>
                    
                    <div className="space-y-4 px-4">
                      <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">{T.hero_title[lang]}</h1>
                      <p className="text-sm md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">{T.hero_desc[lang]}</p>
                    </div>

                    <div className="flex flex-col items-center gap-6 py-4">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-700 text-white text-lg md:text-xl font-bold py-5 md:py-6 px-10 md:px-16 rounded-xl shadow-xl shadow-cyan-200 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                           {isProcessing ? <Loader2 className="animate-spin" size={24}/> : <FileUp size={24} />} 
                           {isProcessing ? T.processing[lang] : T.select_btn[lang]}
                        </button>
                        <p className="text-slate-400 text-xs md:text-sm font-bold tracking-wide">{T.drop_text[lang]}</p>
                    </div>
                    
                    <div className="mt-10 flex justify-center">
                       <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                    </div>
                    <input type="file" accept="application/pdf" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                 </div>

                <div className="hidden xl:block sticky top-20">
                   <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
                </div>
             </div>
          </div>
        )}

        {/* STATE 2: SUCCESS */}
        {pdfUrl && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white overflow-y-auto">
             <div className="w-full max-w-5xl flex gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20">
                   <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
                </div>
                
                <div className="flex-1 max-w-xl space-y-8 animate-in slide-in-from-bottom duration-500">
                    <div className="mb-8">
                       <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
                    </div>
                    
                    <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-2xl shadow-blue-100 text-center">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                           <CheckCircle2 size={40} strokeWidth={3} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">{T.success_title[lang]}</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">{T.success_desc[lang]}</p>
                        
                        <div className="flex flex-col gap-4">
                           <a href={pdfUrl} download={`Extracted_${file?.name}`} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-cyan-200 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
                              <Download size={24} /> {T.download_btn[lang]}
                           </a>
                           <button onClick={resetAll} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider">
                              <ArrowLeft size={16} /> {T.back_home[lang]}
                           </button>
                        </div>
                    </div>
                    
                    <div className="mt-10 flex justify-center">
                       <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                    </div>
                </div>
                
                <div className="hidden xl:block sticky top-20">
                   <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
                </div>
             </div>
          </div>
        )}

        {/* STATE 3: EDITOR (GRID SELECTION) */}
        {file && !pdfUrl && (
          <div className="w-full max-w-[1400px] mx-auto flex gap-6 px-0 md:px-4 lg:px-8 h-[calc(100vh-64px)] md:h-auto">
            
            {/* Iklan Kiri Desktop */}
            <div className="hidden xl:block sticky top-20 h-fit pt-6">
                <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
            </div>

            <div className="flex-1 flex flex-col h-full bg-slate-50 md:bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 overflow-hidden">
                {/* TOOLBAR */}
                <div className="p-4 md:p-6 border-b border-slate-100 bg-white sticky top-0 z-20 flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div>
                            <h3 className="font-bold text-sm md:text-lg text-slate-800 flex items-center gap-2">
                               <MousePointerClick className="text-cyan-600" size={20}/> {T.preview_title[lang]}
                            </h3>
                            <p className="text-[10px] md:text-xs text-slate-400 font-bold mt-1">
                                <span className="text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded">{selectedPages.length}</span> {T.selected_count[lang]}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar">
                         <button onClick={selectAll} className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] md:text-xs flex items-center gap-2 whitespace-nowrap transition-colors">
                            <CheckSquare size={14}/> {T.btn_select_all[lang]}
                         </button>
                         <button onClick={deselectAll} className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] md:text-xs flex items-center gap-2 whitespace-nowrap transition-colors">
                            <Square size={14}/> {T.btn_reset[lang]}
                         </button>
                         
                         {/* Desktop Button */}
                         <button onClick={handleExtract} disabled={selectedPages.length === 0 || isExtracting} className="hidden md:flex px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold text-xs shadow-lg shadow-cyan-200 active:scale-95 transition-all items-center gap-2">
                            {isExtracting ? <Loader2 className="animate-spin" size={16}/> : <FileUp size={16}/>}
                            {T.btn_extract[lang]}
                         </button>
                    </div>
                </div>

                {/* GRID CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 pb-32 md:pb-6">
                    {/* INFO BOX */}
                    <div className="mb-4 bg-cyan-50 border border-cyan-100 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                        <Info className="text-cyan-600 shrink-0 mt-0.5" size={20} />
                        <div className="text-xs md:text-sm text-cyan-700 font-medium">
                            {T.info_text[lang]}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
                        {thumbnails.map((thumb, idx) => {
                            const isSelected = selectedPages.includes(idx);
                            return (
                                <div key={idx} onClick={() => togglePage(idx)} className={`group relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 transform md:hover:scale-[1.02] ${isSelected ? 'border-cyan-500 shadow-lg shadow-cyan-100 ring-2 ring-cyan-200' : 'border-slate-200 hover:border-cyan-300 opacity-60 hover:opacity-100'}`}>
                                    <div className="aspect-[3/4] bg-white">
                                        <img src={thumb} alt={`page ${idx}`} className="w-full h-full object-contain" />
                                    </div>
                                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-all ${isSelected ? 'bg-cyan-600 text-white scale-110' : 'bg-slate-200 text-slate-400'}`}>
                                        {isSelected ? <CheckSquare size={14}/> : idx + 1}
                                    </div>
                                    <div className={`absolute bottom-0 inset-x-0 py-1 text-center text-[8px] md:text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-400 border-t border-slate-200'}`}>
                                        {isSelected ? 'AMBIL' : '---'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Iklan Kanan Desktop */}
            <div className="hidden xl:block sticky top-20 h-fit pt-6">
                <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
            </div>

            {/* FAB Mobile */}
            <div className="md:hidden fixed bottom-6 right-6 z-50">
                <button 
                    onClick={handleExtract} 
                    disabled={selectedPages.length === 0 || isExtracting}
                    className="h-14 w-14 rounded-full bg-cyan-600 text-white shadow-2xl shadow-cyan-400/50 flex items-center justify-center active:scale-90 transition-transform disabled:bg-slate-400 disabled:shadow-none"
                >
                    {isExtracting ? <Loader2 className="animate-spin" size={24}/> : <Layers size={24}/>}
                </button>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
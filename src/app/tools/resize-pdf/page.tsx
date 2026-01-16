'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, PageSizes } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  Maximize, CheckCircle2, Download, Globe, 
  X, ArrowLeft, Loader2, Settings2, Scaling, FileText, Ruler
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// 1. WORKER STABIL (Wajib)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export default function ResizePdfPage() {
  // STATE UTAMA
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // SETTINGS
  const [pageSize, setPageSize] = useState<'A4' | 'A3' | 'Letter' | 'Legal' | 'Tabloid'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [fitContent, setFitContent] = useState(true); // Scale content to fit new size

  // UI & BAHASA
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [mobileTab, setMobileTab] = useState<0 | 1>(1); 
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
    hero_title: { id: 'Ubah Ukuran PDF', en: 'Resize PDF' },
    hero_desc: { 
      id: 'Ganti ukuran kertas dokumen PDF (A4, F4, Letter, dll) dan sesuaikan skala kontennya.', 
      en: 'Change PDF page size (A4, Letter, etc) and scale content to fit.' 
    },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    drop_text: { id: 'atau tarik file ke sini', en: 'or drop file here' },
    
    // Tabs
    tab_info: { id: 'Info File', en: 'File Info' },
    tab_settings: { id: 'Pengaturan', en: 'Settings' },
    
    // Settings
    label_size: { id: 'Ukuran Kertas', en: 'Page Size' },
    label_orient: { id: 'Orientasi', en: 'Orientation' },
    label_fit: { id: 'Sesuaikan Konten', en: 'Fit Content' },
    fit_desc: { id: 'Kecilkan/Besarkan isi agar muat di ukuran baru', en: 'Scale content to fit new page size' },
    
    // Actions
    save_btn: { id: 'Ubah Ukuran', en: 'Resize PDF' },
    
    // Status
    processing: { id: 'MEMUAT...', en: 'LOADING...' },
    saving: { id: 'MEMPROSES...', en: 'PROCESSING...' },
    
    // Success
    success_title: { id: 'Berhasil Diubah!', en: 'Resize Success!' },
    success_desc: { id: 'Ukuran halaman PDF telah diperbarui.', en: 'PDF page size has been updated.' },
    download_btn: { id: 'Download PDF', en: 'Download PDF' },
    back_home: { id: 'Ubah Lagi', en: 'Resize Another' },
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

  const processFile = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') {
        alert("Mohon pilih file PDF.");
        return;
    }
    setFile(uploadedFile);
    setPdfUrl(null);
  };

  // --- 4. ENGINE RESIZE ---
  const handleResize = async () => {
    if (!file) return;
    setIsSaving(true);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();

        // Tentukan Ukuran Target (Point)
        // 1 inch = 72 points
        // A4 = 595.28 x 841.89
        let targetWidth = 0;
        let targetHeight = 0;

        switch (pageSize) {
            case 'A4': [targetWidth, targetHeight] = PageSizes.A4; break;
            case 'A3': [targetWidth, targetHeight] = PageSizes.A3; break;
            case 'Letter': [targetWidth, targetHeight] = PageSizes.Letter; break;
            case 'Legal': [targetWidth, targetHeight] = PageSizes.Legal; break;
            case 'Tabloid': [targetWidth, targetHeight] = PageSizes.Tabloid; break;
            default: [targetWidth, targetHeight] = PageSizes.A4;
        }

        // Swap jika Landscape
        if (orientation === 'landscape') {
            [targetWidth, targetHeight] = [targetHeight, targetWidth];
        }

        pages.forEach((page) => {
            const { width: originalWidth, height: originalHeight } = page.getSize();
            
            // Set Ukuran Baru
            page.setSize(targetWidth, targetHeight);

            if (fitContent) {
                // Hitung Scale Factor agar konten muat (proporsional)
                const widthRatio = targetWidth / originalWidth;
                const heightRatio = targetHeight / originalHeight;
                const scale = Math.min(widthRatio, heightRatio);

                // Konten di PDF-Lib tidak otomatis scaling saat setSize
                // Kita harus melakukan scaling manual pada elemen (agak kompleks di pdf-lib murni)
                // pdf-lib `page.scaleContent` adalah helper method
                
                page.scaleContent(scale, scale);
                
                // Center content (Opsional, logika sederhana)
                // page.translateContent(x, y) - skip untuk simplifikasi agar tidak error posisi
            }
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);

    } catch (error) {
        console.error(error);
        alert("Gagal mengubah ukuran PDF.");
    } finally {
        setIsSaving(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPdfUrl(null);
    setMobileTab(1);
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans relative selection:bg-blue-100 selection:text-blue-700 flex flex-col overflow-hidden">
      
      {/* NAVBAR */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-pink-600 text-white p-1 md:p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><Maximize size={18} /></div>
          <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900 italic uppercase">
              <span className="md:hidden">Resize<span className="text-pink-600">PDF</span></span>
              <span className="hidden md:inline">Layanan<span className="text-pink-600">Dokumen</span> <span className="text-slate-300 font-black">PDF</span></span>
          </span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
           <button onClick={toggleLang} className="flex items-center gap-1 font-bold bg-slate-100 px-2 py-1 rounded text-[10px] text-slate-600 hover:bg-pink-50 hover:text-pink-600 transition-colors">
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
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-all overflow-y-auto ${isDraggingOver ? 'bg-pink-50/50' : ''}`}
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
                          className="w-full md:w-auto bg-pink-600 hover:bg-pink-700 text-white text-lg md:text-xl font-bold py-5 md:py-6 px-10 md:px-16 rounded-xl shadow-xl shadow-pink-200 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                           {isProcessing ? <Loader2 className="animate-spin" size={24}/> : <Maximize size={24} />} 
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
                           <a href={pdfUrl} download={`Resized_${file?.name}`} className="w-full bg-pink-600 hover:bg-pink-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
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

        {/* STATE 3: SETTINGS EDITOR */}
        {file && !pdfUrl && (
          <div className="flex flex-col h-full md:flex-row md:p-6 md:gap-6 max-w-7xl mx-auto w-full">
            
            {/* MOBILE TABS */}
            <div className="md:hidden flex border-b border-slate-200 bg-white sticky top-0 z-20 shrink-0">
               <button onClick={() => setMobileTab(0)} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${mobileTab === 0 ? 'border-pink-600 text-pink-600' : 'border-transparent text-slate-400'}`}>
                  {T.tab_info[lang]}
               </button>
               <button onClick={() => setMobileTab(1)} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${mobileTab === 1 ? 'border-pink-600 text-pink-600' : 'border-transparent text-slate-400'}`}>
                  {T.tab_settings[lang]}
               </button>
            </div>

            {/* INFO AREA */}
            <div className={`flex-1 flex flex-col h-full bg-slate-100 md:bg-white md:rounded-2xl md:shadow-xl md:border border-slate-200 md:p-8 overflow-hidden relative ${mobileTab === 0 ? 'flex' : 'hidden md:flex'}`}>
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <div className="bg-white p-8 rounded-full shadow-lg mb-6">
                        <FileText size={64} className="text-pink-300"/>
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2 max-w-md truncate">{file.name}</h3>
                    <p className="text-slate-400 font-bold bg-slate-200 px-3 py-1 rounded-full text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                
                <div className="flex justify-center mt-4 shrink-0 overflow-hidden px-4 mb-4">
                   <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                   <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>
            </div>

            {/* SETTINGS PANEL */}
            <div className={`w-full md:w-96 bg-white md:rounded-2xl md:shadow-xl md:border border-slate-200 p-6 overflow-y-auto md:h-fit shrink-0 ${mobileTab === 1 ? 'block' : 'hidden md:block'}`}>
                <h3 className="font-bold text-xs text-slate-400 uppercase mb-6 tracking-widest flex items-center gap-2"><Settings2 size={14}/> {T.tab_settings[lang]}</h3>
                
                <div className="space-y-6">
                    {/* Size Selector */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase flex items-center gap-1"><Ruler size={12}/> {T.label_size[lang]}</label>
                        <select 
                            value={pageSize}
                            onChange={(e) => setPageSize(e.target.value as any)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:border-pink-500 transition-colors cursor-pointer"
                        >
                            <option value="A4">A4 (210 x 297 mm)</option>
                            <option value="A3">A3 (297 x 420 mm)</option>
                            <option value="Letter">Letter (216 x 279 mm)</option>
                            <option value="Legal">Legal (216 x 356 mm)</option>
                            <option value="Tabloid">Tabloid (279 x 432 mm)</option>
                        </select>
                    </div>

                    {/* Orientation */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase">{T.label_orient[lang]}</label>
                        <div className="flex gap-2">
                           <button onClick={() => setOrientation('portrait')} className={`flex-1 p-3 rounded-xl border-2 text-[10px] font-bold transition-all uppercase tracking-wider ${orientation === 'portrait' ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-slate-100 text-slate-400 hover:border-pink-200'}`}>Portrait</button>
                           <button onClick={() => setOrientation('landscape')} className={`flex-1 p-3 rounded-xl border-2 text-[10px] font-bold transition-all uppercase tracking-wider ${orientation === 'landscape' ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-slate-100 text-slate-400 hover:border-pink-200'}`}>Landscape</button>
                        </div>
                    </div>

                    {/* Fit Content Toggle */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-blue-700 flex items-center gap-2"><Scaling size={14}/> {T.label_fit[lang]}</span>
                            <div 
                                onClick={() => setFitContent(!fitContent)}
                                className={`w-10 h-5 rounded-full cursor-pointer relative transition-colors ${fitContent ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${fitContent ? 'left-6' : 'left-1'}`}/>
                            </div>
                        </div>
                        <p className="text-[10px] text-blue-500 leading-relaxed">{T.fit_desc[lang]}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-center">
                        <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                    </div>

                    <button onClick={handleResize} disabled={isSaving} className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-slate-300 disabled:text-slate-400 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 uppercase text-xs tracking-widest">
                        {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Maximize size={18}/>} 
                        {isSaving ? T.saving[lang] : T.save_btn[lang]}
                    </button>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
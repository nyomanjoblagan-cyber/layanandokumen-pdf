'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { 
  Scissors, FileText, CheckCircle2, Download, Globe, 
  X, ArrowLeft, Loader2, MousePointerClick, CheckSquare, Square
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// Worker Setup
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
}

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // UI
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [enabled, setEnabled] = useState(false); 
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => { cancelAnimationFrame(animation); setEnabled(false); };
  }, []);

  const T = {
    hero_title: { id: 'Pisah Halaman PDF', en: 'Split PDF Pages' },
    hero_desc: { 
      id: 'Pilih dan ambil halaman tertentu dari file PDF Anda. Klik halaman yang ingin disimpan.', 
      en: 'Select and extract specific pages from your PDF file. Click pages you want to save.' 
    },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    drop_text: { id: 'atau tarik file PDF ke sini', en: 'or drop PDF file here' },
    
    preview_title: { id: 'Pilih Halaman', en: 'Select Pages' },
    select_all: { id: 'Pilih Semua', en: 'Select All' },
    deselect_all: { id: 'Batal Semua', en: 'Deselect All' },
    selected_count: { id: 'halaman dipilih', en: 'pages selected' },
    
    split_btn: { id: 'Pisahkan PDF', en: 'Split PDF' },
    processing: { id: 'Memuat Halaman...', en: 'Loading Pages...' },
    
    success_title: { id: 'PDF Berhasil Dipisah!', en: 'PDF Split Successfully!' },
    success_desc: { id: 'Halaman yang Anda pilih telah disatukan ke file baru.', en: 'Selected pages have been saved to a new file.' },
    download_btn: { id: 'Download PDF Baru', en: 'Download New PDF' },
    back_home: { id: 'Pisah Lagi', en: 'Split Another' },
    cancel: { id: 'BATAL', en: 'CANCEL' },
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  // --- 1. LOAD & GENERATE THUMBNAILS ---
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
        const bufferClone = arrayBuffer.slice(0); // Clone buffer aman
        
        const loadingTask = pdfjsLib.getDocument({ data: bufferClone });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;
        const thumbs: string[] = [];

        // Loop render setiap halaman jadi gambar kecil
        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.3 }); // Kecil aja biar ringan
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport: viewport } as any).promise;
                thumbs.push(canvas.toDataURL());
            }
        }
        setThumbnails(thumbs);
        // Default: Pilih semua halaman di awal? Atau kosong? Kosong aja biar user milih.
        // setSelectedPages(thumbs.map((_, i) => i)); 

    } catch (error) {
        console.error(error);
        alert("Gagal membaca file PDF.");
        setFile(null);
    } finally {
        setIsProcessing(false);
    }
  };

  // --- 2. INTERAKSI PILIH HALAMAN ---
  const togglePage = (index: number) => {
    if (selectedPages.includes(index)) {
        setSelectedPages(selectedPages.filter(id => id !== index));
    } else {
        // Urutkan biar pas di-merge halamannya urut
        setSelectedPages([...selectedPages, index].sort((a, b) => a - b));
    }
  };

  const toggleSelectAll = () => {
    if (selectedPages.length === thumbnails.length) {
        setSelectedPages([]);
    } else {
        setSelectedPages(thumbnails.map((_, i) => i));
    }
  };

  // --- 3. EKSEKUSI SPLIT (PDF-LIB) ---
  const handleSplit = async () => {
    if (!file || selectedPages.length === 0) return;
    setIsGenerating(true);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        // Buat PDF Baru
        const newPdf = await PDFDocument.create();
        
        // Copy halaman yang dipilih (ingat: index array mulai dari 0, di pdf-lib juga 0-based)
        const copiedPages = await newPdf.copyPages(pdfDoc, selectedPages);
        
        // Masukkan ke PDF baru
        copiedPages.forEach((page) => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);

    } catch (error) {
        console.error(error);
        alert("Gagal memisahkan PDF.");
    } finally {
        setIsGenerating(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setThumbnails([]);
    setSelectedPages([]);
    setPdfUrl(null);
  };

  if (!enabled) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans relative selection:bg-blue-100 selection:text-blue-700 flex flex-col">
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f61a_1px,transparent_1px),linear-gradient(to_bottom,#3b82f61a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><Scissors size={18} /></div>
          <span className="font-bold text-xl tracking-tight text-slate-900 italic uppercase">
             Layanan<span className="text-blue-600">Dokumen</span> <span className="text-slate-300 font-black">PDF</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
           <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} className="flex items-center gap-1.5 text-[10px] font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all">
             <Globe size={13} /> {lang.toUpperCase()}
           </button>
           <Link href="/" className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-[0.2em] transition-colors flex items-center gap-1">
              <X size={14} /> {T.cancel[lang]}
           </Link>
        </div>
      </nav>

      <main className="flex-1 relative z-10 flex flex-col">
        {/* STATE 1: LANDING */}
        {!file && (
          <div 
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-all ${isDraggingOver ? 'bg-blue-50/50' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
          >
             <div className="w-full max-w-[1400px] flex gap-4 xl:gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20">
                   <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
                </div>
                <div className="flex-1 max-w-4xl space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="mb-8">
                       <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
                    </div>
                    <div className="space-y-4">
                      <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{T.hero_title[lang]}</h1>
                      <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">{T.hero_desc[lang]}</p>
                    </div>
                    <div className="flex flex-col items-center gap-6 py-4">
                       <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-6 px-16 rounded-xl shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3"
                       >
                          {isProcessing ? <Loader2 className="animate-spin" size={32}/> : <Scissors size={32} />}
                          {isProcessing ? T.processing[lang] : T.select_btn[lang]}
                       </button>
                       <p className="text-slate-400 text-sm font-bold tracking-wide">{T.drop_text[lang]}</p>
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

        {/* STATE 2: SUCCESS / DOWNLOAD */}
        {pdfUrl && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
             <div className="w-full max-w-[1400px] flex gap-4 xl:gap-8 justify-center items-start pt-10">
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
                           <a href={pdfUrl} download={`Split_${file?.name}`} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
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

        {/* STATE 3: SELECT PAGES GRID */}
        {file && !pdfUrl && (
          <div className="w-full max-w-7xl mx-auto py-6 px-4 md:px-6">
            <div className="mb-6 flex justify-center">
              <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-blue-100/50 overflow-hidden flex flex-col h-[80vh] animate-in slide-in-from-bottom duration-500">
                {/* Header Toolbar */}
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-20">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                           <MousePointerClick className="text-blue-500" size={20}/> {T.preview_title[lang]}
                        </h3>
                        <p className="text-xs text-slate-400 font-bold mt-1">
                            {selectedPages.length} {T.selected_count[lang]}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                         <button onClick={toggleSelectAll} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center gap-2 transition-colors">
                            {selectedPages.length === thumbnails.length ? <><Square size={14}/> {T.deselect_all[lang]}</> : <><CheckSquare size={14}/> {T.select_all[lang]}</>}
                         </button>
                         <button onClick={handleSplit} disabled={selectedPages.length === 0 || isGenerating} className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold text-sm shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center gap-2">
                            {isGenerating ? <Loader2 className="animate-spin" size={16}/> : <Scissors size={16}/>}
                            {T.split_btn[lang]}
                         </button>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {thumbnails.map((thumb, idx) => {
                            const isSelected = selectedPages.includes(idx);
                            return (
                                <div key={idx} onClick={() => togglePage(idx)} className={`group relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 transform hover:scale-[1.02] ${isSelected ? 'border-blue-500 shadow-lg shadow-blue-200 ring-2 ring-blue-200 ring-offset-2' : 'border-slate-200 hover:border-blue-300'}`}>
                                    <div className="aspect-[3/4] bg-white">
                                        <img src={thumb} alt={`page ${idx}`} className="w-full h-full object-contain" />
                                    </div>
                                    {/* Overlay & Number */}
                                    <div className={`absolute inset-0 transition-colors ${isSelected ? 'bg-blue-500/20' : 'group-hover:bg-slate-900/5'}`}></div>
                                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${isSelected ? 'bg-blue-600 text-white scale-110' : 'bg-slate-100 text-slate-500 group-hover:bg-white'}`}>
                                        {isSelected ? <CheckCircle2 size={14}/> : idx + 1}
                                    </div>
                                    {/* Label bawah */}
                                    <div className={`absolute bottom-0 inset-x-0 py-1.5 text-center text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border-t border-slate-100'}`}>
                                        {isSelected ? 'Dipilih' : 'Halaman ' + (idx + 1)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 text-center bg-white/50 border-t border-slate-100 mt-auto">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">© 2026 LayananDokumen PDF</p>
      </footer>
    </div>
  );
}
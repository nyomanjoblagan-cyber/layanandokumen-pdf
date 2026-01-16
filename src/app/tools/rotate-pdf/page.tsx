'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  RefreshCcw, RefreshCw, CheckCircle2, Download, Globe, 
  X, ArrowLeft, Loader2, RotateCw, Save
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// 1. WORKER STABIL (Wajib)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export default function RotatePdfPage() {
  // STATE UTAMA
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [rotations, setRotations] = useState<number[]>([]); // Array rotasi per halaman (0, 90, 180, 270)
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
    hero_title: { id: 'Putar Halaman PDF', en: 'Rotate PDF Pages' },
    hero_desc: { 
      id: 'Perbaiki orientasi halaman PDF Anda. Putar satu per satu atau sekaligus.', 
      en: 'Fix your PDF page orientation. Rotate individually or all at once.' 
    },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    drop_text: { id: 'atau tarik file ke sini', en: 'or drop file here' },
    
    // Editor
    preview_title: { id: 'Atur Posisi', en: 'Adjust Orientation' },
    rotate_left: { id: 'Kiri', en: 'Left' },
    rotate_right: { id: 'Kanan', en: 'Right' },
    rotate_all_left: { id: 'Semua Kiri', en: 'All Left' },
    rotate_all_right: { id: 'Semua Kanan', en: 'All Right' },
    
    // Actions
    save_btn: { id: 'Simpan PDF', en: 'Save PDF' },
    
    // Status
    processing: { id: 'MEMUAT...', en: 'LOADING...' },
    saving: { id: 'MENYIMPAN...', en: 'SAVING...' },
    
    // Success
    success_title: { id: 'PDF Berhasil Diputar!', en: 'PDF Rotated Successfully!' },
    success_desc: { id: 'Dokumen Anda sudah rapi sekarang.', en: 'Your document is now organized.' },
    download_btn: { id: 'Download Hasil', en: 'Download Result' },
    back_home: { id: 'Putar Lagi', en: 'Rotate Another' },
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

  // --- 4. RENDER THUMBNAILS ---
  const processFile = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') {
        alert("Mohon pilih file PDF.");
        return;
    }
    setFile(uploadedFile);
    setIsProcessing(true);
    setThumbnails([]);
    setRotations([]);
    setPdfUrl(null);

    try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;
        const thumbs: string[] = [];
        const initialRotations: number[] = [];

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.3 }); // Thumbnail kecil
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport } as any).promise;
                thumbs.push(canvas.toDataURL());
                initialRotations.push(0); // Default rotasi 0 derajat
            }
        }
        setThumbnails(thumbs);
        setRotations(initialRotations);

    } catch (error) {
        console.error(error);
        alert("Gagal membaca file PDF.");
        setFile(null);
    } finally {
        setIsProcessing(false);
    }
  };

  // --- 5. LOGIKA ROTASI ---
  const rotatePage = (index: number, direction: 'left' | 'right') => {
    const newRotations = [...rotations];
    const current = newRotations[index];
    // Rotasi: 0 -> 90 -> 180 -> 270 -> 0
    newRotations[index] = direction === 'right' ? current + 90 : current - 90;
    setRotations(newRotations);
  };

  const rotateAll = (direction: 'left' | 'right') => {
    const newRotations = rotations.map(r => direction === 'right' ? r + 90 : r - 90);
    setRotations(newRotations);
  };

  // --- 6. SAVE PDF ---
  const handleSave = async () => {
    if (!file) return;
    setIsSaving(true);
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        
        pages.forEach((page, idx) => {
            const userRotation = rotations[idx] || 0;
            const currentRotation = page.getRotation().angle;
            // Tambahkan rotasi user ke rotasi asli halaman
            page.setRotation(degrees(currentRotation + userRotation));
        });

        const pdfBytes = await pdfDoc.save();
        // Fix Blob Type
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
    } catch (error) {
        console.error(error);
        alert("Gagal menyimpan PDF.");
    } finally {
        setIsSaving(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setThumbnails([]);
    setRotations([]);
    setPdfUrl(null);
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans relative selection:bg-blue-100 selection:text-blue-700 flex flex-col overflow-hidden">
      
      {/* NAVBAR */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 text-white p-1 md:p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><RotateCw size={18} /></div>
          <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900 italic uppercase">
              <span className="md:hidden">Rotate<span className="text-blue-600">PDF</span></span>
              <span className="hidden md:inline">Layanan<span className="text-blue-600">Dokumen</span> <span className="text-slate-300 font-black">PDF</span></span>
          </span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
           <button onClick={toggleLang} className="flex items-center gap-1 font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors text-[10px] md:text-xs">
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
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-all overflow-y-auto ${isDraggingOver ? 'bg-blue-50/50' : ''}`}
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
                          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white text-lg md:text-xl font-bold py-5 md:py-6 px-10 md:px-16 rounded-xl shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                           {isProcessing ? <Loader2 className="animate-spin" size={24}/> : <RotateCw size={24} />} 
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
                           <a href={pdfUrl} download={`Rotated_${file?.name}`} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
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

        {/* STATE 3: EDITOR (RESPONSIVE GRID) */}
        {file && !pdfUrl && (
          <div className="flex flex-col h-full md:flex-row md:h-auto md:p-6 md:gap-6 max-w-7xl mx-auto w-full">
            
            {/* MAIN EDITOR AREA */}
            <div className="flex-1 flex flex-col h-full bg-slate-50 md:bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 overflow-hidden">
                
                {/* TOOLBAR */}
                <div className="p-4 md:p-6 border-b border-slate-100 bg-white sticky top-0 z-20 flex items-center justify-between shrink-0 shadow-sm">
                    <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar max-w-[60%] md:max-w-none">
                        <div className="hidden md:block">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                               <RotateCw className="text-blue-500" size={20}/> {T.preview_title[lang]}
                            </h3>
                            <p className="text-xs text-slate-400 font-bold mt-1 truncate max-w-[150px]">{file.name}</p>
                        </div>

                        {/* Mobile Title (Simple) */}
                        <div className="md:hidden">
                            <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{file.name}</p>
                        </div>

                        <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>

                        {/* Rotate All Buttons */}
                        <div className="flex gap-2">
                            <button onClick={() => rotateAll('left')} className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] md:text-xs flex items-center gap-2 transition-colors whitespace-nowrap">
                                <RefreshCcw size={14}/> 
                                <span className="hidden md:inline">{T.rotate_all_left[lang]}</span>
                                <span className="md:hidden">All Left</span>
                            </button>
                            <button onClick={() => rotateAll('right')} className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] md:text-xs flex items-center gap-2 transition-colors whitespace-nowrap">
                                <RefreshCw size={14}/> 
                                <span className="hidden md:inline">{T.rotate_all_right[lang]}</span>
                                <span className="md:hidden">All Right</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Desktop Save Button */}
                    <button onClick={handleSave} disabled={isSaving} className="hidden md:flex px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold text-sm shadow-lg shadow-blue-200 active:scale-95 transition-all items-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                        {T.save_btn[lang]}
                    </button>
                </div>

                {/* GRID CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 pb-24 md:pb-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                        {thumbnails.map((thumb, idx) => (
                            <div key={idx} className="group flex flex-col gap-2 md:gap-3 bg-white p-2 md:p-4 rounded-xl border border-slate-200 shadow-sm md:shadow-none hover:shadow-md transition-all">
                                <div className="aspect-[3/4] flex items-center justify-center overflow-hidden transition-all duration-300 ease-out bg-slate-50 rounded-lg relative">
                                    <img 
                                        src={thumb} 
                                        alt={`page ${idx}`} 
                                        className="w-full h-full object-contain transition-transform duration-300"
                                        style={{ transform: `rotate(${rotations[idx]}deg)` }}
                                    />
                                    {/* Number Badge */}
                                    <div className="absolute top-2 left-2 w-6 h-6 bg-slate-800 text-white text-[10px] font-bold rounded-lg flex items-center justify-center shadow-md">{idx + 1}</div>
                                </div>
                                <div className="flex justify-between items-center bg-slate-50 rounded-lg p-1">
                                    <button onClick={() => rotatePage(idx, 'left')} className="p-2 text-slate-400 hover:text-blue-600 active:bg-blue-100 rounded-md transition-all" title={T.rotate_left[lang]}>
                                        <RefreshCcw size={14} />
                                    </button>
                                    <button onClick={() => rotatePage(idx, 'right')} className="p-2 text-slate-400 hover:text-blue-600 active:bg-blue-100 rounded-md transition-all" title={T.rotate_right[lang]}>
                                        <RefreshCw size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* IKLAN KANAN (DESKTOP) */}
            <div className="hidden xl:block w-[160px] shrink-0 sticky top-20 h-fit pt-6">
                <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
            </div>

            {/* FAB (Mobile Only Save) */}
            <div className="md:hidden fixed bottom-6 right-6 z-50">
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="h-14 w-14 rounded-full bg-blue-600 text-white shadow-2xl shadow-blue-400/50 flex items-center justify-center active:scale-90 transition-transform disabled:bg-slate-400"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={24}/> : <Save size={24}/>}
                </button>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
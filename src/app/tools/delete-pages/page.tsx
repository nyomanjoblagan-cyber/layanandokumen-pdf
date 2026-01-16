'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  Trash2, FileText, CheckCircle2, Download, Globe, 
  X, ArrowLeft, Loader2, MousePointerClick, Undo2, PieChart
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// 1. WORKER STABIL (WAJIB)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export default function DeletePdfPages() {
  // STATE UTAMA
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  
  // BAHASA & PERSISTENCE
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [isLoaded, setIsLoaded] = useState(false);
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

  // --- 3. KAMUS (Updated) ---
  const T = {
    hero_title: { id: 'Hapus Halaman PDF', en: 'Delete PDF Pages' },
    hero_desc: { id: 'Klik halaman yang tidak diinginkan untuk menghapusnya. Cepat & Aman.', en: 'Click unwanted pages to remove them. Fast & Secure.' },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    drop_text: { id: 'atau tarik file ke sini', en: 'or drop file here' },
    
    // Editor Header
    preview_title: { id: 'Pilih Halaman', en: 'Select Pages' },
    selected_count: { id: 'dipilih', en: 'selected' },
    reset_btn: { id: 'Reset', en: 'Reset' },
    
    // Sidebar Summary (FIXED)
    summary_title: { id: 'Ringkasan', en: 'Summary' },
    summary_total: { id: 'Total Halaman', en: 'Total Pages' },
    summary_delete: { id: 'Akan Dihapus', en: 'To Delete' },
    summary_remain: { id: 'Sisa Halaman', en: 'Remaining' },
    
    // Actions
    delete_btn: { id: 'Hapus Halaman', en: 'Delete Pages' },
    loading: { id: 'MEMUAT...', en: 'LOADING...' },
    processing: { id: 'MEMPROSES...', en: 'PROCESSING...' },
    
    // Success
    success_title: { id: 'Berhasil Dihapus!', en: 'Successfully Deleted!' },
    success_desc: { id: 'Halaman yang dipilih telah dibuang dari dokumen.', en: 'Selected pages have been removed from the document.' },
    download_btn: { id: 'Download PDF Baru', en: 'Download New PDF' },
    back_home: { id: 'Hapus File Lain', en: 'Delete Another' },
    cancel: { id: 'Tutup', en: 'Close' },
    
    // Card Overlay
    overlay_del: { id: 'HAPUS', en: 'DELETE' },
    overlay_keep: { id: 'SIMPAN', en: 'KEEP' }
  };

  // --- 4. RENDER THUMBNAIL ---
  const processFile = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') { alert("Mohon pilih file PDF."); return; }
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

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.3 });
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
    } catch (error) { 
        alert("Gagal membaca file PDF."); 
        setFile(null); 
    } finally { 
        setIsProcessing(false); 
    }
  };

  // --- 5. HAPUS HALAMAN ---
  const handleDelete = async () => {
    if (!file || selectedPages.length === 0) return;
    
    if (selectedPages.length === thumbnails.length) { 
        alert(lang === 'id' ? "Tidak bisa menghapus semua halaman!" : "Cannot delete all pages!"); 
        return; 
    }

    setIsGenerating(true);
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const newPdf = await PDFDocument.create();
        
        const pagesToKeep = thumbnails.map((_, i) => i).filter(i => !selectedPages.includes(i));
        const copiedPages = await newPdf.copyPages(pdfDoc, pagesToKeep);
        copiedPages.forEach((page) => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        setPdfUrl(URL.createObjectURL(blob));
    } catch (error) { alert("Gagal memproses PDF."); } finally { setIsGenerating(false); }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col overflow-hidden">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-red-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><Trash2 size={20} /></div>
          <span className="font-bold text-xl tracking-tight text-slate-900 italic uppercase">Layanan<span className="text-red-600">Dokumen</span></span>
        </Link>
        <div className="flex items-center gap-4">
           <button onClick={toggleLang} className="text-[10px] font-bold px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all uppercase tracking-widest text-slate-600">{lang}</button>
           <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
              <X size={16} /> {T.cancel[lang]}
           </Link>
        </div>
      </nav>

      <main className="flex-1 relative z-10 flex flex-col h-[calc(100dvh-56px)] md:h-auto overflow-y-auto">
        
        {/* VIEW 1: UPLOAD */}
        {!file && (
          <div className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-colors ${isDraggingOver ? 'bg-red-50' : 'bg-[#F8FAFC]'}`} 
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }} 
            onDragLeave={() => setIsDraggingOver(false)} 
            onDrop={(e) => { e.preventDefault(); setIsDraggingOver(false); if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); }}
          >
             <div className="w-full max-w-5xl flex gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
                
                <div className="flex-1 max-w-2xl space-y-10 animate-in fade-in zoom-in duration-500 py-10">
                    <div className="flex justify-center"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                    
                    <div className="space-y-4 px-4">
                      <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{T.hero_title[lang]}</h1>
                      <p className="text-slate-500 font-medium text-lg leading-relaxed">{T.hero_desc[lang]}</p>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                        <button onClick={() => fileInputRef.current?.click()} className="group relative bg-red-600 hover:bg-red-700 text-white text-lg font-bold py-5 px-16 rounded-2xl shadow-xl shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto uppercase tracking-widest">
                           {isProcessing ? <Loader2 className="animate-spin" size={24}/> : <Trash2 size={24} />} {isProcessing ? T.loading[lang] : T.select_btn[lang]}
                        </button>
                        <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">{T.drop_text[lang]}</p>
                    </div>
                    
                    <div className="flex justify-center mt-8"><AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" /></div>
                    <input type="file" accept="application/pdf" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} className="hidden" />
                 </div>

                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
             </div>
          </div>
        )}

        {/* VIEW 2: DOWNLOAD */}
        {pdfUrl && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white overflow-y-auto">
             <div className="w-full max-w-5xl flex gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
                
                <div className="flex-1 max-w-lg space-y-8 animate-in slide-in-from-bottom duration-500">
                    <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
                    
                    <div className="bg-white border border-slate-200 rounded-[30px] p-10 text-center shadow-2xl relative overflow-hidden">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"><CheckCircle2 size={40} strokeWidth={3} /></div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">{T.success_title[lang]}</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">{T.success_desc[lang]}</p>
                        
                        <div className="flex flex-col gap-4">
                           <a href={pdfUrl} download={`Trimmed_${file?.name}`} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-widest text-sm"><Download size={20} /> {T.download_btn[lang]}</a>
                           <button onClick={() => { setFile(null); setPdfUrl(null); setThumbnails([]); setSelectedPages([]); }} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"><ArrowLeft size={16} /> {T.back_home[lang]}</button>
                        </div>
                    </div>
                    
                    <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                </div>
                
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
             </div>
          </div>
        )}

        {/* VIEW 3: EDITOR GRID */}
        {file && !pdfUrl && (
          <div className="flex flex-col h-full md:p-6 md:gap-6 max-w-[1600px] mx-auto w-full">
            {/* ADS EDITOR TOP */}
            <div className="flex justify-center mb-2 shrink-0 overflow-hidden px-4">
               <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
               <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
                {/* GRID AREA */}
                <div className="flex-1 bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 flex flex-col overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="bg-red-50 text-red-500 p-2 rounded-lg hidden md:block"><MousePointerClick size={20}/></div>
                            <div>
                                <h3 className="font-black text-sm md:text-lg text-slate-800 uppercase tracking-tight">{T.preview_title[lang]}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase"><span className="text-red-600 text-sm">{selectedPages.length}</span> {T.selected_count[lang]}</p>
                            </div>
                        </div>
                        {selectedPages.length > 0 && (
                            <button onClick={() => setSelectedPages([])} className="text-xs font-bold text-slate-400 hover:text-blue-600 uppercase flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg transition-colors border border-slate-100">
                                <Undo2 size={14}/> {T.reset_btn[lang]}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {thumbnails.map((thumb, idx) => {
                                const isSelected = selectedPages.includes(idx);
                                return (
                                    <div key={idx} onClick={() => {
                                        if (isSelected) setSelectedPages(selectedPages.filter(id => id !== idx));
                                        else setSelectedPages([...selectedPages, idx]);
                                    }} className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all group shadow-sm hover:shadow-md ${isSelected ? 'border-red-500 ring-4 ring-red-100 opacity-80' : 'border-white hover:border-red-200'}`}>
                                        
                                        <div className="aspect-[3/4] bg-white relative">
                                            <img src={thumb} alt={`page ${idx}`} className={`w-full h-full object-contain transition-all ${isSelected ? 'grayscale blur-[1px]' : ''}`} />
                                            <div className={`absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shadow-sm ${isSelected ? 'bg-red-600 text-white scale-110' : 'bg-white text-slate-700 border border-slate-100'}`}>
                                                {idx + 1}
                                            </div>
                                            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isSelected ? 'opacity-100 bg-red-900/10' : 'opacity-0 group-hover:opacity-100 bg-black/5'}`}>
                                                <Trash2 size={40} className={`${isSelected ? 'text-red-600 scale-110' : 'text-slate-400 scale-90'} drop-shadow-lg transition-transform duration-200`} />
                                            </div>
                                        </div>
                                        
                                        <div className={`py-1.5 text-center text-[9px] font-black uppercase tracking-widest ${isSelected ? 'bg-red-600 text-white' : 'bg-white border-t border-slate-100 text-slate-400'}`}>
                                            {isSelected ? T.overlay_del[lang] : T.overlay_keep[lang]}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* SIDEBAR SUMMARY (BAHASA FIXED) */}
                <div className="w-full md:w-80 space-y-6 shrink-0 pb-20 md:pb-0">
                    <div className="bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 p-6 flex flex-col h-full md:h-auto">
                        <div className="mb-6">
                            <h3 className="font-black text-[10px] text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2"><PieChart size={14}/> {T.summary_title[lang]}</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold text-slate-600 border-b border-slate-50 pb-2">
                                    <span>{T.summary_total[lang]}</span>
                                    <span>{thumbnails.length}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-red-600 border-b border-slate-50 pb-2">
                                    <span>{T.summary_delete[lang]}</span>
                                    <span>{selectedPages.length}</span>
                                </div>
                                <div className="flex justify-between text-xs font-black text-green-600 pt-1">
                                    <span>{T.summary_remain[lang]}</span>
                                    <span>{thumbnails.length - selectedPages.length}</span>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleDelete} disabled={selectedPages.length === 0 || isGenerating} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-100 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                            {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <Trash2 size={18}/>} {isGenerating ? T.processing[lang] : T.delete_btn[lang]}
                        </button>
                        
                        <div className="mt-auto pt-6 flex justify-center">
                            <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
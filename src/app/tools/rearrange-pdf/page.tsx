'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  Layout, CheckCircle2, Download, Globe, 
  X, ArrowLeft, Loader2, RotateCw, Trash2, GripVertical, 
  RefreshCcw, Save, MousePointer2, Info
} from 'lucide-react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import AdsterraBanner from '@/components/AdsterraBanner';

// 1. SETUP WORKER STABIL (Wajib)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

// Tipe Data Halaman
interface PageItem {
  id: string;          
  originalIndex: number; 
  rotation: number;      
  thumb: string;         
}

export default function OrganizePdfPage() {
  // STATE UTAMA
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
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
    hero_title: { id: 'Atur & Urutkan PDF', en: 'Organize & Sort PDF' },
    hero_desc: { 
      id: 'Geser untuk mengurutkan, putar, atau hapus halaman PDF sesuka hati. Kontrol penuh atas dokumen Anda.', 
      en: 'Drag to reorder, rotate, or delete PDF pages as you wish. Full control over your document.' 
    },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    drop_text: { id: 'atau tarik file ke sini', en: 'or drop file here' },
    
    // Editor
    editor_title: { id: 'Editor Halaman', en: 'Page Editor' },
    total_pages: { id: 'Total Halaman', en: 'Total Pages' },
    info_drag: { id: 'Tips: Geser kartu untuk ubah urutan.', en: 'Tip: Drag cards to reorder.' },
    info_actions: { id: 'Gunakan tombol di bawah halaman untuk Putar/Hapus.', en: 'Use buttons below page to Rotate/Delete.' },
    
    // Actions
    save_btn: { id: 'Simpan PDF', en: 'Save PDF' },
    
    // Status
    processing: { id: 'MEMUAT...', en: 'LOADING...' },
    saving: { id: 'MENYIMPAN...', en: 'SAVING...' },
    
    // Success
    success_title: { id: 'Dokumen Siap!', en: 'Document Ready!' },
    success_desc: { id: 'PDF berhasil disusun ulang sesuai keinginan Anda.', en: 'PDF has been reorganized successfully.' },
    download_btn: { id: 'Download Hasil', en: 'Download Result' },
    back_home: { id: 'Atur File Lain', en: 'Organize Another' },
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

  // --- 4. RENDER PDF ---
  const processFile = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') {
        alert("Mohon pilih file PDF.");
        return;
    }
    setFile(uploadedFile);
    setIsProcessing(true);
    setPages([]);
    setPdfUrl(null);

    try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;
        const newPages: PageItem[] = [];

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.3 }); // Thumbnail scale
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport } as any).promise;
                
                newPages.push({
                    id: `page-${i}-${Math.random().toString(36).substr(2,9)}`, 
                    originalIndex: i - 1, 
                    rotation: 0,
                    thumb: canvas.toDataURL()
                });
            }
        }
        setPages(newPages);

    } catch (error) {
        console.error(error);
        alert("Gagal membaca file PDF.");
        setFile(null);
    } finally {
        setIsProcessing(false);
    }
  };

  // --- 5. EDITOR ACTIONS ---
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(pages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPages(items);
  };

  const rotatePage = (id: string, direction: 'cw' | 'ccw') => {
    setPages(prev => prev.map(p => {
        if (p.id === id) {
            const newRot = direction === 'cw' ? p.rotation + 90 : p.rotation - 90;
            return { ...p, rotation: newRot };
        }
        return p;
    }));
  };

  const deletePage = (id: string) => {
    if (pages.length <= 1) {
        alert(lang === 'id' ? "Minimal harus tersisa 1 halaman." : "At least 1 page required.");
        return;
    }
    setPages(prev => prev.filter(p => p.id !== id));
  };

  // --- 6. SAVE PDF ---
  const handleSave = async () => {
    if (!file || pages.length === 0) return;
    setIsSaving(true);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const newPdf = await PDFDocument.create();

        for (const p of pages) {
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [p.originalIndex]);
            const currentRotation = copiedPage.getRotation().angle;
            copiedPage.setRotation(degrees(currentRotation + p.rotation));
            newPdf.addPage(copiedPage);
        }

        const pdfBytes = await newPdf.save();
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
    setPages([]);
    setPdfUrl(null);
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans relative selection:bg-blue-100 selection:text-blue-700 flex flex-col overflow-hidden">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 h-14 md:h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 text-white p-1 md:p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><Layout size={18} /></div>
          <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900 italic uppercase">
              <span className="md:hidden">Atur<span className="text-blue-600">PDF</span></span>
              <span className="hidden md:inline">Layanan<span className="text-blue-600">Dokumen</span> <span className="text-slate-300 font-black">PDF</span></span>
          </span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
           <button onClick={toggleLang} className="flex items-center gap-1 font-bold bg-slate-100 px-2 py-1 rounded text-[10px] text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
             <Globe size={12} /> {lang.toUpperCase()}
           </button>
           <Link href="/" className="text-[10px] md:text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-[0.2em] transition-colors flex items-center gap-1">
              <X size={18} /> <span className="hidden md:inline">{T.cancel[lang]}</span>
           </Link>
        </div>
      </nav>

      <main className="flex-1 relative z-10 flex flex-col h-[calc(100dvh-56px)] md:h-auto overflow-y-auto">
        
        {/* STATE 1: LANDING */}
        {!file && (
          <div 
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-all ${isDraggingOver ? 'bg-blue-50/50' : ''}`}
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
                           {isProcessing ? <Loader2 className="animate-spin" size={24}/> : <Layout size={24} />} 
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
                           <a href={pdfUrl} download={`Organized_${file?.name}`} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
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

        {/* STATE 3: EDITOR (DRAG & DROP) */}
        {file && !pdfUrl && (
          <div className="flex flex-col h-full md:flex-row md:h-auto md:p-6 md:gap-6 max-w-7xl mx-auto w-full">
            
            <div className="flex-1 flex flex-col h-full bg-slate-50 md:bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 overflow-hidden">
                
                {/* TOOLBAR */}
                <div className="p-4 md:p-6 border-b border-slate-100 bg-white sticky top-0 z-20 flex items-center justify-between shrink-0 shadow-sm">
                    <div>
                        <h3 className="font-bold text-sm md:text-lg text-slate-800 flex items-center gap-2">
                           <MousePointer2 className="text-blue-500" size={20}/> {T.editor_title[lang]}
                        </h3>
                        <p className="text-[10px] md:text-xs text-slate-400 font-bold mt-1">
                           {pages.length} {T.total_pages[lang]}
                        </p>
                    </div>
                    
                    <button onClick={handleSave} disabled={isSaving} className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold text-sm shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                        {T.save_btn[lang]}
                    </button>
                </div>

                {/* GRID CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    
                    {/* INFO BOX */}
                    <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                        <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
                        <div className="text-xs md:text-sm text-blue-700 space-y-1">
                            <p className="font-bold">{T.info_drag[lang]}</p>
                            <p className="opacity-90">{T.info_actions[lang]}</p>
                        </div>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="pages-grid" direction="horizontal">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 pb-24">
                                    {pages.map((page, idx) => (
                                        <Draggable key={page.id} draggableId={page.id} index={idx}>
                                            {(provided, snapshot) => (
                                                <div 
                                                    ref={provided.innerRef} 
                                                    {...provided.draggableProps} 
                                                    {...provided.dragHandleProps}
                                                    className={`group relative bg-white rounded-xl border-2 overflow-hidden flex flex-col transition-all ${snapshot.isDragging ? 'z-50 border-blue-500 shadow-2xl scale-105 rotate-2' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'}`}
                                                >
                                                    {/* Page Preview */}
                                                    <div className="aspect-[3/4] bg-slate-50 relative overflow-hidden p-2">
                                                        <img 
                                                            src={page.thumb} 
                                                            alt={`Page ${idx + 1}`} 
                                                            className="w-full h-full object-contain transition-transform duration-300"
                                                            style={{ transform: `rotate(${page.rotation}deg)` }}
                                                        />
                                                        {/* Number Badge */}
                                                        <div className="absolute top-2 left-2 w-6 h-6 bg-slate-800 text-white text-[10px] font-bold rounded-lg flex items-center justify-center shadow-md z-10">
                                                            {idx + 1}
                                                        </div>
                                                        {/* Drag Handle */}
                                                        <div className="absolute top-2 right-2 p-1 text-slate-300 bg-white/80 rounded-md backdrop-blur-sm border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <GripVertical size={14} />
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex divide-x divide-slate-100 border-t border-slate-100 bg-white">
                                                        <button 
                                                            onClick={() => rotatePage(page.id, 'ccw')} 
                                                            className="flex-1 py-3 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                            title="Putar Kiri"
                                                        >
                                                            <RefreshCcw size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => deletePage(page.id)} 
                                                            className="flex-1 py-3 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => rotatePage(page.id, 'cw')} 
                                                            className="flex-1 py-3 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                            title="Putar Kanan"
                                                        >
                                                            <RotateCw size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>

            {/* IKLAN KANAN (DESKTOP) */}
            <div className="hidden xl:block w-[160px] shrink-0 sticky top-20 h-fit pt-6">
                <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
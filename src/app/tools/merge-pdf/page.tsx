'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  FileImage, Layers, Settings2, Download, Globe,
  Plus, GripVertical, CheckCircle2, X, ArrowLeft, FileCheck, Loader2, FileText
} from 'lucide-react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import AdsterraBanner from '@/components/AdsterraBanner';

// 1. SETUP WORKER STABIL (Wajib)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export default function MergePdfPage() {
  // STATE UTAMA
  const [files, setFiles] = useState<{id: string, file: File, name: string, size: string, thumbnail: string | null}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // SETTINGS
  const [quality, setQuality] = useState(0.8); // Placeholder untuk future feature
  
  // UI & BAHASA
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [mobileTab, setMobileTab] = useState<0 | 1>(0); 
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
    hero_title: { id: 'Gabung File PDF', en: 'Merge PDF Files' },
    hero_desc: { id: 'Gabungkan banyak file PDF menjadi satu dokumen urut dan rapi.', en: 'Combine multiple PDF files into one ordered and neat document.' },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF Files' },
    drop_text: { id: 'atau tarik file ke sini', en: 'or drop files here' },
    
    // Tabs
    tab_files: { id: 'Urutan File', en: 'File Order' },
    tab_settings: { id: 'Opsi', en: 'Options' },
    
    // Settings
    setting_title: { id: 'Pengaturan', en: 'Settings' },
    quality_label: { id: 'Mode Penggabungan', en: 'Merge Mode' },
    mode_fast: { id: 'Cepat (Tanpa Kompresi)', en: 'Fast (No Compression)' },
    mode_safe: { id: 'Aman (Flatten Form)', en: 'Safe (Flatten Form)' },
    
    // List
    list_title: { id: 'Daftar File', en: 'File List' },
    add_more: { id: 'Tambah', en: 'Add' },
    clear_all: { id: 'Reset', en: 'Reset' },
    
    // Actions
    btn_merge: { id: 'Gabungkan PDF', en: 'Merge PDF' },
    
    // Status
    gen_thumb: { id: 'Memuat Thumbnail...', en: 'Loading Thumbnails...' },
    processing: { id: 'Menggabungkan...', en: 'Merging...' },
    success_title: { id: 'Berhasil Digabung!', en: 'Merge Success!' },
    success_desc: { id: 'File PDF Anda telah disatukan dan siap diunduh.', en: 'Your PDF files have been combined and are ready for download.' },
    download_btn: { id: 'Download PDF', en: 'Download PDF' },
    back_home: { id: 'Gabung Lagi', en: 'Merge Another' },
    cancel: { id: 'Tutup', en: 'Close' },
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --- 4. THUMBNAIL GENERATOR ---
  const generateThumbnail = async (file: File): Promise<string | null> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }); // Slice untuk safety
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1); // Ambil halaman 1 saja

      const viewport = page.getViewport({ scale: 0.3 }); // Skala kecil untuk thumbnail
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) return null;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      return canvas.toDataURL();
    } catch (error) {
      console.error("Thumb error:", error);
      return null;
    }
  };

  // --- 5. HANDLE FILES ---
  const processFiles = async (newFiles: File[]) => {
    const validFiles = newFiles.filter(f => f.type === 'application/pdf');
    if (validFiles.length === 0) { alert("Hanya file PDF yang diperbolehkan."); return; }

    setIsGeneratingThumb(true);
    
    const processed: any[] = [];
    for (const file of validFiles) {
        const thumb = await generateThumbnail(file);
        processed.push({
            id: `pdf-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            file,
            name: file.name,
            size: formatSize(file.size),
            thumbnail: thumb
        });
    }

    setFiles(prev => [...prev, ...processed]);
    setIsGeneratingThumb(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files) processFiles(Array.from(e.dataTransfer.files));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFiles(items);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // --- 6. MERGE ENGINE ---
  const handleMerge = async () => {
    if (files.length < 2) { alert("Minimal 2 file untuk digabungkan."); return; }
    setIsProcessing(true);
    
    try {
        const mergedPdf = await PDFDocument.create();

        for (const fileObj of files) {
            const fileBuffer = await fileObj.file.arrayBuffer();
            const pdf = await PDFDocument.load(fileBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const pdfBytes = await mergedPdf.save();
        // Fix Blob Type Error
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        setPdfUrl(URL.createObjectURL(blob));
    } catch (e) { 
        console.error(e);
        alert("Gagal menggabungkan PDF. Pastikan file tidak dipassword."); 
    } finally { 
        setIsProcessing(false); 
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col overflow-hidden">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><Layers size={20} /></div>
          <span className="font-bold text-xl tracking-tight text-slate-900 italic uppercase">Merge<span className="text-blue-600">PDF</span></span>
        </Link>
        <div className="flex items-center gap-4">
           <button onClick={toggleLang} className="text-[10px] font-bold px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all uppercase tracking-widest text-slate-600">{lang}</button>
           <Link href="/" className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-500 transition-colors bg-red-50 px-4 py-2 rounded-lg border border-slate-100">
              <X size={16} /> {T.cancel[lang]}
           </Link>
        </div>
      </nav>

      <main className="flex-1 relative z-10 flex flex-col h-[calc(100dvh-56px)] md:h-auto overflow-y-auto">
        
        {/* VIEW 1: UPLOAD */}
        {files.length === 0 ? (
          <div 
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-colors ${isDraggingOver ? 'bg-blue-50' : 'bg-[#F8FAFC]'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
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
                        <button onClick={() => fileInputRef.current?.click()} disabled={isGeneratingThumb} className="group relative bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-5 px-16 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto uppercase tracking-widest disabled:bg-slate-400">
                           {isGeneratingThumb ? <Loader2 className="animate-spin" size={24}/> : <Layers size={24} />} 
                           {isGeneratingThumb ? T.gen_thumb[lang] : T.select_btn[lang]}
                        </button>
                        <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">{T.drop_text[lang]}</p>
                    </div>
                    
                    <div className="flex justify-center mt-8"><AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" /></div>
                    <input type="file" multiple accept="application/pdf" ref={fileInputRef} onChange={(e) => e.target.files && processFiles(Array.from(e.target.files))} className="hidden" />
                 </div>

                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
             </div>
          </div>
        ) : pdfUrl ? (
          // VIEW 2: DOWNLOAD
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white overflow-y-auto">
             <div className="w-full max-w-5xl flex gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
                
                <div className="flex-1 max-w-lg space-y-8 animate-in slide-in-from-bottom duration-500">
                    <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
                    
                    <div className="bg-white border border-slate-200 rounded-[30px] p-10 text-center shadow-2xl relative overflow-hidden">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"><FileCheck size={40} strokeWidth={3} /></div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">{T.success_title[lang]}</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">{T.success_desc[lang]}</p>
                        
                        <div className="flex flex-col gap-4">
                           <a href={pdfUrl} download="Merged_Document.pdf" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-widest text-sm"><Download size={20} /> {T.download_btn[lang]}</a>
                           <button onClick={() => { setFiles([]); setPdfUrl(null); }} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"><ArrowLeft size={16} /> {T.back_home[lang]}</button>
                        </div>
                    </div>
                    
                    <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                </div>
                
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
             </div>
          </div>
        ) : (
          // VIEW 3: EDITOR LIST
          <div className="flex flex-col h-full md:flex-row md:p-6 md:gap-6 max-w-[1600px] mx-auto w-full">
            {/* MOBILE TABS */}
            <div className="md:hidden flex border-b border-slate-200 bg-white sticky top-0 z-20 shrink-0">
               <button onClick={() => setMobileTab(0)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 0 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{T.tab_files[lang]}</button>
               <button onClick={() => setMobileTab(1)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 1 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{T.tab_settings[lang]}</button>
            </div>

            {/* LIST AREA (LEFT) */}
            <div className={`flex-1 flex flex-col h-full bg-slate-100 md:bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 md:p-8 overflow-hidden relative ${mobileTab === 0 ? 'flex' : 'hidden md:flex'}`}>
                {/* Header List */}
                <div className="hidden md:flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                    <h3 className="font-black text-sm text-slate-800 uppercase tracking-tight flex items-center gap-2"><Layers size={18} className="text-blue-500"/> {T.list_title[lang]}</h3>
                    <div className="flex gap-2">
                        <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-bold text-blue-500 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1 uppercase tracking-wider"><Plus size={12}/> {T.add_more[lang]}</button>
                        <button onClick={() => setFiles([])} className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 uppercase tracking-wider">{T.clear_all[lang]}</button>
                    </div>
                </div>

                {/* ADS TOP */}
                <div className="flex justify-center mb-4 shrink-0 overflow-hidden px-4 md:hidden">
                   <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 md:p-0">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="pdf-list" direction="vertical">
                            {(prov) => (
                                <div {...prov.droppableProps} ref={prov.innerRef} className="space-y-3">
                                    {files.map((file, i) => (
                                        <Draggable key={file.id} draggableId={file.id} index={i}>
                                            {(p, s) => (
                                                <div ref={p.innerRef} {...p.draggableProps} className={`flex items-center gap-4 p-3 bg-white rounded-xl border transition-all ${s.isDragging ? 'border-blue-500 shadow-xl z-50 scale-105' : 'border-slate-200 hover:border-blue-300'}`}>
                                                    <div {...p.dragHandleProps} className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing p-1"><GripVertical size={20}/></div>
                                                    
                                                    {/* Thumbnail Container */}
                                                    <div className="w-10 h-14 bg-slate-50 border border-slate-100 rounded flex items-center justify-center shrink-0 overflow-hidden relative">
                                                        {file.thumbnail ? <img src={file.thumbnail} className="w-full h-full object-contain" alt="thumb"/> : <FileText size={20} className="text-slate-300"/>}
                                                        <div className="absolute bottom-0 right-0 bg-slate-800 text-white text-[8px] px-1 font-bold rounded-tl">{i+1}</div>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                                                        <p className="text-[10px] font-medium text-slate-400">{file.size}</p>
                                                    </div>

                                                    <button onClick={() => removeFile(file.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><X size={16}/></button>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {prov.placeholder}
                                    
                                    {/* Mobile Add Button */}
                                    <div onClick={() => fileInputRef.current?.click()} className="md:hidden border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-slate-400">
                                        <Plus size={24}/> <span className="text-[10px] font-bold uppercase tracking-widest">{T.add_more[lang]}</span>
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>

                {/* ADS BOTTOM */}
                <div className="flex justify-center mt-4 shrink-0 overflow-hidden px-4">
                   <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                   <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>
            </div>

            {/* SIDEBAR (RIGHT) */}
            <div className={`w-full md:w-80 bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 p-6 overflow-y-auto shrink-0 ${mobileTab === 1 ? 'block' : 'hidden md:block'}`}>
                <h3 className="font-black text-[10px] text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2"><Settings2 size={14}/> {T.setting_title[lang]}</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-widest">{T.quality_label[lang]}</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs font-bold text-slate-600 outline-none focus:border-blue-500 transition-colors">
                             <option value={0.8}>{T.mode_fast[lang]}</option>
                             <option value={0.8}>{T.mode_safe[lang]}</option>
                        </select>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-center">
                        <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                    </div>

                    <button onClick={handleMerge} disabled={isProcessing || isGeneratingThumb || files.length < 2} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-400 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 uppercase text-xs tracking-widest">
                        {isProcessing ? <Loader2 className="animate-spin" size={18}/> : <Layers size={18}/>} 
                        {(isProcessing || isGeneratingThumb) ? T.processing[lang] : T.btn_merge[lang]}
                    </button>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
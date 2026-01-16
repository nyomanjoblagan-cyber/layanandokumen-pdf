'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  Camera, FileText, CheckCircle2, Download, Globe, 
  X, ArrowLeft, Loader2, Settings2, Plus, Trash2, ImagePlus, Wand2
} from 'lucide-react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import AdsterraBanner from '@/components/AdsterraBanner';

export default function ScanPdfPage() {
  // STATE UTAMA
  const [files, setFiles] = useState<{id: string, file: File, preview: string, filter: string}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // SETTINGS
  const [globalFilter, setGlobalFilter] = useState<'original' | 'grayscale' | 'contrast'>('original');
  
  // UI & BAHASA
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [mobileTab, setMobileTab] = useState<0 | 1>(0); 
  const [isLoaded, setIsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // --- 1. LOGIKA BAHASA ---
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

  // --- 2. KAMUS ---
  const T = {
    hero_title: { id: 'Scan Dokumen (Kamera)', en: 'Scan Document (Camera)' },
    hero_desc: { id: 'Gunakan kamera HP untuk scan dokumen menjadi PDF jernih.', en: 'Use phone camera to scan documents into clear PDF.' },
    btn_cam: { id: 'Buka Kamera', en: 'Open Camera' },
    btn_gal: { id: 'Dari Galeri', en: 'Gallery' },
    
    // Tabs
    tab_scans: { id: 'Hasil Scan', en: 'Scanned' },
    tab_settings: { id: 'Opsi', en: 'Settings' },
    
    // Filters
    f_orig: { id: 'Asli', en: 'Original' },
    f_bw: { id: 'Hitam Putih', en: 'B & W' },
    f_magic: { id: 'Teks Tajam', en: 'Magic' },
    
    // Actions
    btn_save: { id: 'Simpan PDF', en: 'Save PDF' },
    
    // Status
    success_title: { id: 'Berhasil!', en: 'Success!' },
    download_btn: { id: 'Download PDF', en: 'Download PDF' },
    cancel: { id: 'Tutup', en: 'Close' },
  };

  // --- 3. HANDLE FILES ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/')).map(f => ({
        id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        file: f,
        preview: URL.createObjectURL(f),
        filter: globalFilter
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const resetAll = () => {
    setFiles([]);
    setPdfUrl(null);
    setMobileTab(0);
  };

  // --- 4. DRAG & DROP ---
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFiles(items);
  };

  // --- 5. CONVERT ENGINE (WITH FILTERS) ---
  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    
    try {
        const pdfDoc = await PDFDocument.create();
        
        for (const fileObj of files) {
            // Proses Filter via Canvas
            await new Promise<void>((resolve) => {
                const img = new Image();
                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d')!;
                    
                    // Apply Filter
                    if (globalFilter === 'grayscale') {
                        ctx.filter = 'grayscale(100%) contrast(120%) brightness(110%)';
                    } else if (globalFilter === 'contrast') {
                        ctx.filter = 'contrast(150%) brightness(110%) saturate(0)';
                    }
                    
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    // Convert Canvas to Blob/Buffer
                    const imgData = canvas.toDataURL('image/jpeg', 0.75);
                    const imgBytes = await fetch(imgData).then(res => res.arrayBuffer());
                    
                    const embedded = await pdfDoc.embedJpg(imgBytes);
                    
                    // A4 Standard
                    const page = pdfDoc.addPage([595.28, 841.89]);
                    const { width, height } = page.getSize();
                    
                    // Fit Image (Margin 20)
                    const availW = width - 40;
                    const availH = height - 40;
                    const scale = Math.min(availW / embedded.width, availH / embedded.height);
                    const dims = embedded.scale(scale);
                    
                    page.drawImage(embedded, {
                        x: (width - dims.width) / 2,
                        y: (height - dims.height) / 2,
                        width: dims.width,
                        height: dims.height
                    });
                    resolve();
                };
                img.src = fileObj.preview;
            });
        }
        
        const pdfBytes = await pdfDoc.save();
        // Fix Blob Type Error
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        setPdfUrl(URL.createObjectURL(blob));

    } catch (e) { 
        alert("Gagal memproses gambar."); 
    } finally { 
        setIsProcessing(false); 
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col overflow-hidden text-slate-800 font-sans">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><Camera size={20} /></div>
          <span className="font-bold text-xl tracking-tight text-slate-900 italic uppercase">Scan<span className="text-blue-600">PDF</span></span>
        </Link>
        <div className="flex items-center gap-4">
           <button onClick={toggleLang} className="text-[10px] font-bold px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all uppercase tracking-widest text-slate-600">{lang}</button>
           <Link href="/" className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-500 transition-colors bg-red-50 px-4 py-2 rounded-lg border border-slate-100">
              <X size={16} /> {T.cancel[lang]}
           </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden relative">
        
        {/* VIEW 1: LANDING */}
        {files.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#F8FAFC]">
             <div className="w-full max-w-5xl flex gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
                
                <div className="flex-1 max-w-2xl space-y-10 animate-in fade-in zoom-in duration-500 py-10">
                    <div className="flex justify-center"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                    
                    <div className="space-y-4 px-4">
                      <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{T.hero_title[lang]}</h1>
                      <p className="text-slate-500 font-medium text-lg">{T.hero_desc[lang]}</p>
                    </div>

                    <div className="flex flex-col md:flex-row justify-center gap-4 py-4 w-full max-w-md mx-auto">
                       <button onClick={() => cameraInputRef.current?.click()} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                          <Camera size={20} /> {T.btn_cam[lang]}
                       </button>
                       <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-white border-2 border-slate-200 hover:border-blue-400 text-slate-600 font-bold py-4 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                          <ImagePlus size={20} /> {T.btn_gal[lang]}
                       </button>
                    </div>
                    
                    <div className="flex justify-center mt-8"><AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" /></div>
                    
                    {/* Input Kamera & File */}
                    <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />
                    <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                 </div>

                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
             </div>
          </div>
        ) : pdfUrl ? (
          // VIEW 2: DOWNLOAD
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white overflow-y-auto">
             <div className="w-full max-w-5xl flex gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
                
                <div className="flex-1 max-w-xl space-y-8 animate-in slide-in-from-bottom duration-500">
                    <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
                    
                    <div className="bg-white border border-slate-200 rounded-[30px] p-10 text-center shadow-2xl relative overflow-hidden">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"><CheckCircle2 size={40} strokeWidth={3} /></div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">{T.success_title[lang]}</h2>
                        
                        <div className="flex flex-col gap-4 mt-8">
                           <a href={pdfUrl} download="Scanned_Document.pdf" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-widest text-sm"><Download size={20} /> {T.download_btn[lang]}</a>
                           <button onClick={resetAll} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"><ArrowLeft size={16} /> Ulangi</button>
                        </div>
                    </div>
                    <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                </div>
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
             </div>
          </div>
        ) : (
          // VIEW 3: EDITOR
          <div className="flex flex-col h-full md:flex-row md:p-6 md:gap-6 max-w-[1600px] mx-auto w-full">
            {/* MOBILE TABS */}
            <div className="md:hidden flex border-b border-slate-200 bg-white sticky top-0 z-20 shrink-0">
               <button onClick={() => setMobileTab(0)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 0 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{T.tab_scans[lang]}</button>
               <button onClick={() => setMobileTab(1)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 1 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{T.tab_settings[lang]}</button>
            </div>

            {/* PREVIEW GRID (LEFT) */}
            <div className={`flex-1 flex flex-col h-full bg-slate-100 md:bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 md:p-8 overflow-hidden relative ${mobileTab === 0 ? 'flex' : 'hidden md:flex'}`}>
                <div className="flex justify-center mb-4 shrink-0 overflow-hidden px-4">
                   <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                   <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 md:p-0">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="scans" direction="horizontal">
                            {(prov) => (
                                <div {...prov.droppableProps} ref={prov.innerRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {files.map((f, i) => (
                                        <Draggable key={f.id} draggableId={f.id} index={i}>
                                            {(p, s) => (
                                                <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} className={`relative aspect-[3/4] bg-white rounded-xl border-2 transition-all ${s.isDragging ? 'border-blue-500 z-50 shadow-2xl scale-105' : 'border-white shadow-sm hover:border-blue-200'}`}>
                                                    <img 
                                                      src={f.preview} 
                                                      className="w-full h-full object-cover rounded-lg" 
                                                      style={{ filter: globalFilter === 'grayscale' ? 'grayscale(100%) contrast(120%)' : globalFilter === 'contrast' ? 'contrast(150%) saturate(0)' : 'none' }}
                                                    />
                                                    <div className="absolute top-2 left-2 w-6 h-6 bg-slate-900/70 text-white text-[10px] font-bold rounded flex items-center justify-center">{i+1}</div>
                                                    <button onClick={() => removeFile(f.id)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded shadow-sm hover:bg-red-600 transition-colors"><Trash2 size={12}/></button>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {prov.placeholder}
                                    <div onClick={() => cameraInputRef.current?.click()} className="aspect-[3/4] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white hover:border-blue-400 transition-all text-slate-400 hover:text-blue-500">
                                        <Plus size={24}/> <span className="text-[10px] font-bold uppercase tracking-widest">Scan</span>
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>

                <div className="flex justify-center mt-4 shrink-0 overflow-hidden px-4">
                   <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                   <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>
            </div>

            {/* SIDEBAR (RIGHT) */}
            <div className={`w-full md:w-80 bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 p-6 overflow-y-auto shrink-0 ${mobileTab === 1 ? 'block' : 'hidden md:block'}`}>
                <h3 className="font-black text-[10px] text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2"><Settings2 size={14}/> {T.tab_settings[lang]}</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-widest"><Wand2 size={12} className="inline mr-1"/> Filter Gambar</label>
                        <div className="flex flex-col gap-2">
                           {[
                             {id: 'original', label: T.f_orig[lang]},
                             {id: 'grayscale', label: T.f_bw[lang]},
                             {id: 'contrast', label: T.f_magic[lang]}
                           ].map(f => (
                             <button 
                               key={f.id} 
                               onClick={() => setGlobalFilter(f.id as any)} 
                               className={`p-3 rounded-xl border-2 text-xs font-bold transition-all text-left ${globalFilter === f.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                             >
                               {f.label}
                             </button>
                           ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-center">
                        <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                    </div>

                    <button onClick={handleConvert} disabled={isProcessing || files.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-400 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 uppercase text-xs tracking-widest">
                        {isProcessing ? <Loader2 className="animate-spin" size={18}/> : <FileText size={18}/>} {T.btn_save[lang]}
                    </button>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
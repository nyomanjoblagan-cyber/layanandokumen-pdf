'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  FileImage, FileText, CheckCircle2, Download, Globe, 
  X, ArrowLeft, Loader2, Settings2, Plus, Trash2, ImagePlus, GripVertical
} from 'lucide-react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import AdsterraBanner from '@/components/AdsterraBanner';

export default function PngToPdfPage() {
  // STATE UTAMA
  const [files, setFiles] = useState<{id: string, file: File, preview: string}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // SETTINGS
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<number>(20);

  // UI & BAHASA
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [mobileTab, setMobileTab] = useState<0 | 1>(0); 
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    hero_title: { id: 'PNG ke PDF', en: 'PNG to PDF' },
    hero_desc: { id: 'Ubah gambar PNG menjadi dokumen PDF dengan mudah. Mendukung transparansi dan pengaturan tata letak.', en: 'Convert PNG images to PDF documents easily. Supports transparency and layout settings.' },
    select_btn: { id: 'Pilih Gambar PNG', en: 'Select PNG Images' },
    drop_text: { id: 'atau tarik file PNG ke sini', en: 'or drop PNG files here' },
    
    // Tabs
    tab_files: { id: 'Daftar Gambar', en: 'Images List' },
    tab_settings: { id: 'Pengaturan', en: 'Settings' },
    
    // Settings
    label_orient: { id: 'Orientasi', en: 'Orientation' },
    label_margin: { id: 'Margin', en: 'Margin' },
    
    // Actions
    btn_save: { id: 'Buat PDF', en: 'Create PDF' },
    btn_add: { id: 'Tambah', en: 'Add' },
    
    // Status
    loading: { id: 'MEMPROSES...', en: 'PROCESSING...' },
    success_title: { id: 'PDF Siap!', en: 'PDF Ready!' },
    success_desc: { id: 'Gambar PNG Anda telah disatukan menjadi PDF.', en: 'Your PNG images have been merged into a PDF.' },
    download_btn: { id: 'Download PDF', en: 'Download PDF' },
    back_home: { id: 'Konversi Lagi', en: 'Convert Again' },
    cancel: { id: 'Tutup', en: 'Close' },
  };

  // --- 3. HANDLE FILES ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
        .filter(f => f.type === 'image/png') // Strict PNG check, or allow image/*
        .map(f => ({
          id: `png-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file: f,
          preview: URL.createObjectURL(f)
        }));
      setFiles(prev => [...prev, ...newFiles]);
    }
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // --- 4. DRAG & DROP REORDER ---
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFiles(items);
  };

  // --- 5. CONVERT ENGINE ---
  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    
    try {
        const pdfDoc = await PDFDocument.create();
        
        for (let i = 0; i < files.length; i++) {
            const fileObj = files[i];
            setProgress(Math.round(((i) / files.length) * 100));

            const imageBytes = await fileObj.file.arrayBuffer();
            let embeddedImage;
            
            try {
                // Khusus PNG
                embeddedImage = await pdfDoc.embedPng(imageBytes);
            } catch (err) {
                // Fallback jika user rename JPG jadi PNG (error handling)
                try {
                    embeddedImage = await pdfDoc.embedJpg(imageBytes);
                } catch (e) {
                    console.error("Gagal embed gambar:", fileObj.file.name);
                    continue; 
                }
            }

            // Hitung Ukuran Halaman (A4)
            const A4_W = 595.28;
            const A4_H = 841.89;
            const pageWidth = orientation === 'portrait' ? A4_W : A4_H;
            const pageHeight = orientation === 'portrait' ? A4_H : A4_W;
            
            const page = pdfDoc.addPage([pageWidth, pageHeight]);

            // Hitung Skala Gambar (Fit to Page)
            const availW = pageWidth - (margin * 2);
            const availH = pageHeight - (margin * 2);
            
            const scale = Math.min(availW / embeddedImage.width, availH / embeddedImage.height);
            const dims = embeddedImage.scale(scale);

            page.drawImage(embeddedImage, {
                x: (pageWidth - dims.width) / 2,
                y: (pageHeight - dims.height) / 2,
                width: dims.width,
                height: dims.height
            });
        }
        
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        setPdfUrl(URL.createObjectURL(blob));
        setProgress(100);
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
          <div className="bg-teal-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><FileImage size={20} /></div>
          <span className="font-bold text-xl tracking-tight text-slate-900 italic uppercase">PNG<span className="text-teal-600">2PDF</span></span>
        </Link>
        <div className="flex items-center gap-4">
           <button onClick={toggleLang} className="text-[10px] font-bold px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all uppercase tracking-widest text-slate-600">{lang}</button>
           <Link href="/" className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-500 transition-colors bg-red-50 px-4 py-2 rounded-lg border border-slate-100">
              <X size={16} /> {T.cancel[lang]}
           </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden relative">
        
        {/* VIEW 1: UPLOAD */}
        {files.length === 0 ? (
          <div 
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-colors ${isDraggingOver ? 'bg-teal-50' : 'bg-[#F8FAFC]'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                if (e.dataTransfer.files) {
                    const newFiles = Array.from(e.dataTransfer.files)
                        .filter(f => f.type === 'image/png')
                        .map(f => ({
                            id: `png-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            file: f,
                            preview: URL.createObjectURL(f)
                        }));
                    setFiles(prev => [...prev, ...newFiles]);
                }
            }}
          >
             <div className="w-full max-w-5xl flex gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
                
                <div className="flex-1 max-w-2xl space-y-10 animate-in fade-in zoom-in duration-500 py-10">
                    <div className="flex justify-center"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                    
                    <div className="space-y-4 px-4">
                      <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{T.hero_title[lang]}</h1>
                      <p className="text-slate-500 font-medium text-lg">{T.hero_desc[lang]}</p>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                        <button onClick={() => fileInputRef.current?.click()} className="group relative bg-teal-600 hover:bg-teal-700 text-white text-lg font-bold py-5 px-16 rounded-2xl shadow-xl shadow-teal-200 transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto uppercase tracking-widest">
                           <ImagePlus size={24} /> {T.select_btn[lang]}
                        </button>
                        <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">{T.drop_text[lang]}</p>
                    </div>
                    
                    <div className="flex justify-center mt-8"><AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" /></div>
                    <input type="file" multiple accept="image/png" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
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
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"><CheckCircle2 size={40} strokeWidth={3} /></div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">{T.success_title[lang]}</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">{T.success_desc[lang]}</p>
                        
                        <div className="flex flex-col gap-4">
                           <a href={pdfUrl} download="Converted_PNG.pdf" className="w-full bg-teal-600 hover:bg-teal-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-widest text-sm"><Download size={20} /> {T.download_btn[lang]}</a>
                           <button onClick={() => { setFiles([]); setPdfUrl(null); }} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"><ArrowLeft size={16} /> {T.back_home[lang]}</button>
                        </div>
                    </div>
                    
                    <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                </div>
                
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
             </div>
          </div>
        ) : (
          // VIEW 3: EDITOR GRID
          <div className="flex flex-col h-full md:flex-row md:p-6 md:gap-6 max-w-[1600px] mx-auto w-full">
            {/* MOBILE TABS */}
            <div className="md:hidden flex border-b border-slate-200 bg-white sticky top-0 z-20 shrink-0">
               <button onClick={() => setMobileTab(0)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 0 ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-400'}`}>{T.tab_files[lang]}</button>
               <button onClick={() => setMobileTab(1)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 1 ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-400'}`}>{T.tab_settings[lang]}</button>
            </div>

            {/* GRID AREA (LEFT) */}
            <div className={`flex-1 flex flex-col h-full bg-slate-100 md:bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 md:p-8 overflow-hidden relative ${mobileTab === 0 ? 'flex' : 'hidden md:flex'}`}>
                {/* ADS TOP */}
                <div className="flex justify-center mb-4 shrink-0 overflow-hidden px-4">
                   <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                   <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 md:p-0">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="images" direction="horizontal">
                            {(prov) => (
                                <div {...prov.droppableProps} ref={prov.innerRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {files.map((f, i) => (
                                        <Draggable key={f.id} draggableId={f.id} index={i}>
                                            {(p, s) => (
                                                <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} className={`relative aspect-[3/4] bg-white rounded-xl border-2 transition-all group overflow-hidden ${s.isDragging ? 'border-teal-500 z-50 shadow-2xl scale-105 rotate-2' : 'border-white shadow-sm hover:border-teal-200'}`}>
                                                    <img src={f.preview} alt="Thumb" className="w-full h-full object-contain p-2" />
                                                    <div className="absolute top-2 left-2 w-6 h-6 bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold rounded flex items-center justify-center border border-white/20">{i+1}</div>
                                                    <button onClick={() => removeFile(f.id)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded shadow-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                                                    <div className="absolute bottom-2 right-2 p-1 bg-black/20 rounded text-white opacity-0 group-hover:opacity-100"><GripVertical size={12}/></div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {prov.placeholder}
                                    <div onClick={() => fileInputRef.current?.click()} className="aspect-[3/4] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white hover:border-teal-400 transition-all text-slate-400 group">
                                        <div className="p-3 bg-slate-100 rounded-full group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors"><Plus size={24}/></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{T.btn_add[lang]}</span>
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
                <h3 className="font-black text-[10px] text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2"><Settings2 size={14}/> {T.tab_settings[lang]}</h3>
                
                <div className="space-y-6">
                    {/* ORIENTATION */}
                    <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-widest">{T.label_orient[lang]}</label>
                        <div className="flex gap-2">
                           <button onClick={() => setOrientation('portrait')} className={`flex-1 p-3 rounded-xl border-2 text-[10px] font-bold transition-all uppercase tracking-wider ${orientation === 'portrait' ? 'border-teal-600 bg-teal-50 text-teal-600' : 'border-slate-100 text-slate-400 hover:border-teal-200'}`}>Portrait</button>
                           <button onClick={() => setOrientation('landscape')} className={`flex-1 p-3 rounded-xl border-2 text-[10px] font-bold transition-all uppercase tracking-wider ${orientation === 'landscape' ? 'border-teal-600 bg-teal-50 text-teal-600' : 'border-slate-100 text-slate-400 hover:border-teal-200'}`}>Landscape</button>
                        </div>
                    </div>

                    {/* MARGIN */}
                    <div>
                        <div className="flex justify-between text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest"><span>{T.label_margin[lang]}</span><span>{margin}px</span></div>
                        <input type="range" min="0" max="100" step="10" value={margin} onChange={(e) => setMargin(parseInt(e.target.value))} className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer" />
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-center">
                        <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                    </div>

                    <button onClick={handleConvert} disabled={isProcessing || files.length === 0} className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:text-slate-400 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 uppercase text-xs tracking-widest">
                        {isProcessing ? <div className="flex items-center gap-2"><Loader2 className="animate-spin" size={18}/> {progress}%</div> : <><FileText size={18}/> {T.btn_save[lang]}</>}
                    </button>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
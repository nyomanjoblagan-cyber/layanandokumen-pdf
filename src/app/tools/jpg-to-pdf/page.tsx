'use client';

import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { 
  UploadCloud, Trash2, FileImage, 
  MoveLeft, MoveRight, ImageIcon, Settings2, Download, Globe,
  Maximize2, Layout, Plus, GripVertical, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export default function JpgToPdfPage() {
  const [images, setImages] = useState<{id: string, file: File, preview: string}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [quality, setQuality] = useState(0.5); 
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('fit'); 
  const [orientation, setOrientation] = useState<'p' | 'l' | 'auto'>('auto');
  const [enabled, setEnabled] = useState(false); 
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => { cancelAnimationFrame(animation); setEnabled(false); };
  }, []);

  const T = {
    hero_title: { id: 'Konversi JPG ke PDF', en: 'Convert JPG to PDF' },
    hero_desc: { 
      id: 'Ubah gambar JPG ke PDF dalam hitungan detik. Atur orientasi dan margin dengan mudah.', 
      en: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.' 
    },
    select_btn: { id: 'Pilih Gambar JPG', en: 'Select JPG Images' },
    drop_text: { id: 'atau tarik gambar JPG ke sini', en: 'or drop JPG images here' },
    
    // UI Workspace
    setting: { id: 'Pengaturan Dokumen', en: 'Document Settings' },
    add: { id: 'Tambah', en: 'Add Files' },
    convert: { id: 'Konversi ke PDF', en: 'Convert to PDF' },
    clear: { id: 'Reset', en: 'Reset' },
    preview: { id: 'Preview', en: 'Preview' },
    cancel: { id: 'BATAL', en: 'CANCEL' },
    quality_label: { id: 'Kualitas', en: 'Quality' },
    ori_label: { id: 'Orientasi', en: 'Orientation' },
    size_label: { id: 'Kertas', en: 'Paper Size' },
    portrait: { id: 'Potrait', en: 'Portrait' },
    landscape: { id: 'Landscape', en: 'Landscape' },
    auto: { id: 'Auto', en: 'Auto' },
    fit_label: { id: 'Fit', en: 'Fit' },
    high: { id: 'Tinggi', en: 'High' },
    med: { id: 'Sedang', en: 'Medium' },
    low: { id: 'Rendah', en: 'Low' }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setImages(items);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files) processFiles(Array.from(e.dataTransfer.files));
  };

  const processFiles = (files: File[]) => {
    const validFiles = files.filter(f => f.type.startsWith('image/'));
    const newImages = validFiles.map(file => ({
      id: `img-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const moveManual = (index: number, dir: 'left' | 'right') => {
    const items = [...images];
    if (dir === 'left' && index > 0) [items[index], items[index-1]] = [items[index-1], items[index]];
    if (dir === 'right' && index < items.length-1) [items[index], items[index+1]] = [items[index+1], items[index]];
    setImages(items);
  };

  const removeImage = (id: string) => setImages(prev => prev.filter(img => img.id !== id));

  const convertToPdf = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    try {
      let doc: jsPDF | null = null;
      for (let i = 0; i < images.length; i++) {
        const dataUrl = await new Promise<string>((resolve) => {
          const img = new Image();
          img.src = images[i].preview;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width, h = img.height;
            const max = 1500; 
            if (w > h && w > max) { h *= max / w; w = max; } else if (h > max) { w *= max / h; h = max; }
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (ctx) { ctx.fillStyle = 'white'; ctx.fillRect(0,0,w,h); ctx.drawImage(img, 0, 0, w, h); resolve(canvas.toDataURL('image/jpeg', quality)); }
          };
        });
        const imgSize = await new Promise<{w:number, h:number}>(r => {
           const im = new Image();
           im.onload = () => r({w: im.width * 0.264583, h: im.height * 0.264583});
           im.src = dataUrl;
        });
        let finalOri: 'p' | 'l' = orientation === 'auto' ? (imgSize.w > imgSize.h ? 'l' : 'p') : orientation;
        const format = pageSize === 'fit' ? [imgSize.w, imgSize.h] : pageSize;
        if (i === 0) doc = new jsPDF({ orientation: finalOri, unit: 'mm', format });
        else doc?.addPage(format, finalOri);
        if (pageSize === 'fit') doc?.addImage(dataUrl, 'JPEG', 0, 0, imgSize.w, imgSize.h, undefined, 'FAST');
        else {
            const pW = finalOri === 'p' ? (pageSize === 'a4' ? 210 : 215.9) : (pageSize === 'a4' ? 297 : 279.4);
            const pH = finalOri === 'p' ? (pageSize === 'a4' ? 297 : 279.4) : (pageSize === 'a4' ? 210 : 215.9);
            let dW = imgSize.w, dH = imgSize.h;
            const mW = pW - 20, mH = pH - 20;
            if (dW > mW) { dH *= mW/dW; dW = mW; } if (dH > mH) { dW *= mH/dH; dH = mH; }
            doc?.addImage(dataUrl, 'JPEG', (pW-dW)/2, (pH-dH)/2, dW, dH, undefined, 'FAST');
        }
      }
      doc?.save('LayananDokumen_PDF.pdf');
    } catch (e) { alert("Gagal!"); } finally { setIsProcessing(false); }
  };

  if (!enabled) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans relative selection:bg-blue-100 selection:text-blue-700 flex flex-col">
      
      {/* BACKGROUND (Grid Biru Samar) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f61a_1px,transparent_1px),linear-gradient(to_bottom,#3b82f61a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><FileImage size={18} /></div>
          <span className="font-bold text-xl tracking-tight text-slate-900 italic uppercase">
             Layanan<span className="text-blue-600">Dokumen</span> <span className="text-slate-300 font-black">PDF</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
           <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} className="flex items-center gap-1.5 text-[10px] font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all">
             <Globe size={13} /> {lang.toUpperCase()}
           </button>
           <Link href="/" className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-[0.2em] transition-colors">
              {T.cancel[lang]}
           </Link>
        </div>
      </nav>

      <main className="flex-1 relative z-10 flex flex-col">
        
        {images.length === 0 ? (
          /* ================= LANDING MODE (Blue Theme) ================= */
          <div 
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-all ${isDraggingOver ? 'bg-blue-50/50' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
          >
             <div className="w-full max-w-[1400px] flex gap-8 justify-center items-center">
                {/* IKLAN KIRI */}
                <div className="hidden 2xl:flex w-40 h-[600px] bg-white border border-dashed border-slate-200 rounded-xl items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-widest vertical-text">
                   Iklan Skyscraper
                </div>

                <div className="flex-1 max-w-4xl space-y-8 animate-in fade-in zoom-in duration-500">
                    {/* IKLAN BANNER */}
                    <div className="w-full h-24 bg-white border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                       Space Iklan Leaderboard (728x90)
                    </div>

                    <div className="space-y-4 py-4">
                      <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{T.hero_title[lang]}</h1>
                      <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">{T.hero_desc[lang]}</p>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                       <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-6 px-16 rounded-xl shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3"
                       >
                          <UploadCloud size={32} />
                          {T.select_btn[lang]}
                       </button>
                       <p className="text-slate-400 text-sm font-bold tracking-wide">{T.drop_text[lang]}</p>
                    </div>

                    {/* IKLAN BOX */}
                    <div className="w-full max-w-lg mx-auto h-64 bg-white border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase tracking-widest shadow-sm mt-8">
                       Space Iklan Rectangle (336x280)
                    </div>

                    <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                 </div>

                 {/* IKLAN KANAN */}
                 <div className="hidden 2xl:flex w-40 h-[600px] bg-white border border-dashed border-slate-200 rounded-xl items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-widest vertical-text">
                   Iklan Skyscraper
                </div>
             </div>
          </div>
        ) : (
          /* ================= WORKSPACE MODE (Blue Theme) ================= */
          <div className="w-full max-w-7xl mx-auto py-6 px-4 md:px-6">
            <div className="w-full h-20 bg-white border border-dashed border-slate-200 rounded-xl mb-6 flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase tracking-widest shadow-sm">Iklan Banner Atas</div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-80 space-y-4 shrink-0">
                  <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-100/50 border border-slate-200 animate-in slide-in-from-left duration-500">
                    <h3 className="font-bold text-[11px] text-slate-400 uppercase mb-5 tracking-[0.1em] flex items-center gap-2"><Settings2 size={14}/> {T.setting[lang]}</h3>
                    <div className="space-y-6">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block mb-2">{T.ori_label[lang]}</span>
                          <div className="grid grid-cols-3 gap-1">
                              {[{id: 'auto', l: T.auto[lang]}, {id: 'p', l: T.portrait[lang]}, {id: 'l', l: T.landscape[lang]}].map(o => (
                                <button key={o.id} onClick={() => setOrientation(o.id as any)} className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${orientation === o.id ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-300'}`}>{o.l}</button>
                              ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block mb-2">{T.size_label[lang]}</span>
                          <div className="grid grid-cols-1 gap-1.5">
                              {[{id: 'fit', l: T.fit_label[lang], i: Maximize2}, {id: 'a4', l: 'A4 (210x297mm)', i: Layout}, {id: 'letter', l: 'Letter (215x279mm)', i: FileImage}].map(opt => (
                                <button key={opt.id} onClick={() => setPageSize(opt.id as any)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold border transition-all ${pageSize === opt.id ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-300'}`}><opt.i size={14}/> {opt.l}</button>
                              ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block mb-2">{T.quality_label[lang]}</span>
                          <select value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold text-slate-600 outline-none focus:border-blue-500 transition-colors cursor-pointer">
                              <option value={0.8}>{T.high[lang]}</option>
                              <option value={0.5}>{T.med[lang]}</option>
                              <option value={0.2}>{T.low[lang]}</option>
                          </select>
                        </div>
                    </div>
                    <button onClick={convertToPdf} disabled={images.length === 0 || isProcessing} className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 text-xs active:scale-95 transition-all flex items-center justify-center gap-2">
                        {isProcessing ? 'PROSES...' : <><Download size={16}/> {T.convert[lang]}</>}
                    </button>
                  </div>
                  <div className="w-full h-64 bg-white border border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center px-6 shadow-sm">Iklan Sidebar</div>
              </div>

              <div className="flex-1 bg-white rounded-2xl shadow-xl shadow-blue-100/50 border border-slate-200 p-8 min-h-[600px] relative animate-in slide-in-from-bottom duration-500">
                  <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-5">
                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 tracking-wide"><ImageIcon size={18} className="text-blue-500" /> {T.preview[lang]} <span className="text-blue-600 text-[10px] font-black ml-1 bg-blue-50 px-2 py-0.5 rounded-full">({images.length})</span></h3>
                    {images.length > 0 && <button onClick={() => setImages([])} className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-widest">{T.clear[lang]}</button>}
                  </div>

                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="images-grid" direction="horizontal">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                          {images.map((img, idx) => (
                            <Draggable key={img.id} draggableId={img.id} index={idx}>
                              {(provided, snapshot) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`group relative flex flex-col gap-2 ${snapshot.isDragging ? 'z-50' : ''}`}>
                                    <div className={`relative bg-slate-50 rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-sm
                                      ${snapshot.isDragging ? 'border-blue-500 shadow-2xl scale-105' : 'border-slate-200'}
                                      ${(orientation === 'l' || (orientation === 'auto' && pageSize === 'fit')) ? 'aspect-video' : 'aspect-[3/4]'} mx-auto w-full`}>
                                      <img src={img.preview} className="w-full h-full object-contain pointer-events-none" alt="preview" />
                                      <div className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-lg font-bold shadow-lg backdrop-blur-md">{idx + 1}</div>
                                      <div className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity border border-slate-100 shadow-sm"><GripVertical size={16} /></div>
                                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all backdrop-blur-[1px]">
                                          <button onClick={(e) => {e.stopPropagation(); moveManual(idx, 'left');}} className="p-2.5 bg-white text-slate-900 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-lg"><MoveLeft size={16}/></button>
                                          <button onClick={(e) => {e.stopPropagation(); removeImage(img.id);}} className="p-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg"><Trash2 size={16}/></button>
                                          <button onClick={(e) => {e.stopPropagation(); moveManual(idx, 'right');}} className="p-2.5 bg-white text-slate-900 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-lg"><MoveRight size={16}/></button>
                                      </div>
                                    </div>
                                    <span className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hal {idx + 1}</span>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          <div onClick={() => fileInputRef.current?.click()} className={`relative border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-400 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group ${(orientation === 'l' || (orientation === 'auto' && pageSize === 'fit')) ? 'aspect-video' : 'aspect-[3/4]'} w-full`}>
                              <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                              <div className="bg-white p-4 rounded-full shadow-sm text-blue-500 group-hover:scale-110 transition-transform border border-blue-100"><Plus size={32} /></div>
                              <span className="mt-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-blue-600">{T.add[lang]}</span>
                          </div>
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
              </div>
            </div>
            <div className="w-full h-24 bg-white border border-dashed border-slate-200 rounded-xl mt-8 flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase tracking-widest shadow-sm">Iklan Banner Bawah</div>
          </div>
        )}
      </main>

      <footer className="py-8 text-center bg-white/50 border-t border-slate-100 mt-auto">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">© 2026 LayananDokumen PDF</p>
      </footer>
    </div>
  );
}
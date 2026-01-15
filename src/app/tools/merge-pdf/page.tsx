'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
// PERBAIKAN IMPORT: Ambil langsung dari folder build agar tidak error DOMMatrix
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { 
  UploadCloud, Trash2, FileText, FileImage, 
  Layers, Settings2, Download, Globe,
  Plus, GripVertical, CheckCircle2, X, ArrowLeft, FileCheck, Loader2, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import AdsterraBanner from '@/components/AdsterraBanner';

// SET WORKER (Versi 3.11.174)
// Kita gunakan trik typeof window agar tidak error saat build server
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

export default function MergePdfPage() {
  const [files, setFiles] = useState<{id: string, file: File, name: string, size: string, thumbnail: string | null}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [quality, setQuality] = useState(0.8);
  const [enabled, setEnabled] = useState(false); 
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => { cancelAnimationFrame(animation); setEnabled(false); };
  }, []);

  const T = {
    hero_title: { id: 'Gabung File PDF', en: 'Merge PDF Files' },
    hero_desc: { 
      id: 'Gabungkan beberapa file PDF menjadi satu dokumen. Tarik file untuk mengatur urutan.', 
      en: 'Combine multiple PDF files into one document. Drag files to reorder.' 
    },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF Files' },
    drop_text: { id: 'atau tarik file PDF ke sini', en: 'or drop PDF files here' },
    setting: { id: 'Pengaturan', en: 'Settings' },
    add: { id: 'Tambah', en: 'Add Files' },
    convert: { id: 'Gabungkan PDF', en: 'Merge PDF' },
    clear: { id: 'Reset', en: 'Reset' },
    preview: { id: 'Daftar File', en: 'File List' },
    cancel: { id: 'BATAL', en: 'CANCEL' },
    quality_label: { id: 'Kualitas Output', en: 'Output Quality' },
    
    // Opsi Kualitas
    high: { id: 'Tinggi (Asli)', en: 'High (Original)' },
    med: { id: 'Sedang (Kompresi)', en: 'Medium (Compressed)' },
    low: { id: 'Rendah (Web)', en: 'Low (Web)' },

    success_title: { id: 'PDF Berhasil Digabung!', en: 'PDF Merged Successfully!' },
    success_desc: { id: 'Dokumen PDF Anda telah disatukan. Siap untuk diunduh.', en: 'Your PDF documents have been combined. Ready for download.' },
    download_btn: { id: 'Download PDF Gabungan', en: 'Download Merged PDF' },
    back_home: { id: 'Gabung Lagi', en: 'Merge Another' },
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFiles(items);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files) processFiles(Array.from(e.dataTransfer.files));
  };

  // --- GENERATE THUMBNAIL ---
  const generateThumbnail = async (file: File): Promise<string | null> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Clone buffer agar tidak conflict dengan library lain
      const bufferClone = arrayBuffer.slice(0);
      
      const loadingTask = pdfjsLib.getDocument({ data: bufferClone });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1); 

      const viewport = page.getViewport({ scale: 0.3 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) return null;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ 
        canvasContext: context, 
        viewport: viewport 
      } as any).promise;
      
      return canvas.toDataURL(); 
    } catch (error) {
      console.error("Gagal render thumbnail:", error);
      return null; 
    }
  };

  const processFiles = async (newFiles: File[]) => {
    const validFiles = newFiles.filter(f => f.type === 'application/pdf');
    if (validFiles.length === 0 && newFiles.length > 0) {
        alert("Mohon pilih file PDF saja.");
        return;
    }

    setIsGeneratingThumb(true); 
    
    const processedFiles: {id: string, file: File, name: string, size: string, thumbnail: string | null}[] = [];
    
    for (const file of validFiles) {
       const thumb = await generateThumbnail(file);
       processedFiles.push({
          id: `pdf-${Math.random().toString(36).substr(2, 9)}`,
          file,
          name: file.name,
          size: formatSize(file.size),
          thumbnail: thumb
       });
    }

    setFiles(prev => [...prev, ...processedFiles]);
    setIsGeneratingThumb(false); 
  };

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  const resetAll = () => {
    setFiles([]);
    setPdfUrl(null);
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
        alert("Minimal 2 file PDF untuk digabungkan.");
        return;
    }
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
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

    } catch (e) { 
        console.error(e);
        alert("Gagal menggabungkan PDF. Pastikan file tidak terkunci password."); 
    } finally { 
        setIsProcessing(false); 
    }
  };

  if (!enabled) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans relative selection:bg-blue-100 selection:text-blue-700 flex flex-col">
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f61a_1px,transparent_1px),linear-gradient(to_bottom,#3b82f61a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

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
           <Link href="/" className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-[0.2em] transition-colors flex items-center gap-1">
              <X size={14} /> {T.cancel[lang]}
           </Link>
        </div>
      </nav>

      <main className="flex-1 relative z-10 flex flex-col">
        {files.length === 0 ? (
          /* --- LANDING --- */
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
                          {isGeneratingThumb ? <Loader2 className="animate-spin" size={32}/> : <Layers size={32} />}
                          {T.select_btn[lang]}
                       </button>
                       <p className="text-slate-400 text-sm font-bold tracking-wide">{T.drop_text[lang]}</p>
                    </div>
                    <div className="mt-10 flex justify-center">
                       <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                    </div>
                    <input type="file" multiple accept="application/pdf" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                 </div>
                 <div className="hidden xl:block sticky top-20">
                   <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
                </div>
             </div>
          </div>
        ) : pdfUrl ? (
          /* --- SUCCESS --- */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
             <div className="w-full max-w-[1400px] flex gap-4 xl:gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20">
                   <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
                </div>

                <div className="flex-1 max-w-4xl space-y-8 animate-in slide-in-from-bottom duration-500">
                    <div className="mb-8">
                       <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-2xl shadow-blue-100 max-w-xl mx-auto">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                           <FileCheck size={40} strokeWidth={3} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">{T.success_title[lang]}</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                          {T.success_desc[lang]}
                        </p>

                        <div className="flex flex-col gap-4">
                           <a 
                              href={pdfUrl}
                              download="LayananDokumen_Merged.pdf"
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                           >
                              <Download size={24} /> {T.download_btn[lang]}
                           </a>

                           <button 
                              onClick={resetAll}
                              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                           >
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
        ) : (
          /* --- EDITOR --- */
          <div className="w-full max-w-7xl mx-auto py-6 px-4 md:px-6">
            <div className="mb-6 flex justify-center">
              <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-80 space-y-4 shrink-0">
                  <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-100/50 border border-slate-200 animate-in slide-in-from-left duration-500">
                    <h3 className="font-bold text-[11px] text-slate-400 uppercase mb-5 tracking-[0.1em] flex items-center gap-2"><Settings2 size={14}/> {T.setting[lang]}</h3>
                    
                    {/* DROP DOWN QUALITY (VISUAL SAJA UNTUK MERGE) */}
                    <div className="mb-6">
                       <span className="text-[10px] font-bold text-slate-500 block mb-2">{T.quality_label[lang]}</span>
                       <select value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold text-slate-600 outline-none focus:border-blue-500 transition-colors cursor-pointer">
                            <option value={0.8}>{T.high[lang]}</option>
                            <option value={0.5}>{T.med[lang]}</option>
                            <option value={0.3}>{T.low[lang]}</option>
                       </select>
                    </div>

                    <p className="text-xs text-slate-500 mb-6">
                        {lang === 'id' ? 'Tarik dan lepas file di daftar sebelah kanan untuk mengatur urutan PDF.' : 'Drag and drop files in the list on the right to reorder PDF.'}
                    </p>
                    
                    <button onClick={mergePdfs} disabled={files.length < 2 || isProcessing || isGeneratingThumb} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 text-xs active:scale-95 transition-all flex items-center justify-center gap-2">
                        {(isProcessing || isGeneratingThumb) ? 'LOADING...' : <><Layers size={16}/> {T.convert[lang]}</>}
                    </button>
                  </div>
                  <div className="flex justify-center bg-white border border-dashed border-slate-200 rounded-2xl p-4 shadow-sm">
                     <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                  </div>
              </div>

              <div className="flex-1 bg-white rounded-2xl shadow-xl shadow-blue-100/50 border border-slate-200 p-8 min-h-[600px] relative animate-in slide-in-from-bottom duration-500">
                  <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-5">
                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 tracking-wide"><FileText size={18} className="text-blue-500" /> {T.preview[lang]} <span className="text-blue-600 text-[10px] font-black ml-1 bg-blue-50 px-2 py-0.5 rounded-full">({files.length})</span></h3>
                    <div className="flex items-center gap-2">
                       <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-bold text-blue-500 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-widest border border-blue-100 flex items-center gap-1">
                          <Plus size={12}/> {T.add[lang]}
                       </button>
                       {files.length > 0 && <button onClick={() => setFiles([])} className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-widest">{T.clear[lang]}</button>}
                    </div>
                  </div>

                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="files-list" direction="vertical">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                          {files.map((file, idx) => (
                            <Draggable key={file.id} draggableId={file.id} index={idx}>
                              {(provided, snapshot) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} 
                                    className={`flex items-center gap-4 p-4 bg-slate-50 border rounded-xl transition-all group select-none
                                    ${snapshot.isDragging ? 'border-blue-500 shadow-xl bg-white z-50' : 'border-slate-200 hover:border-blue-300'}`}>
                                    <div className="text-slate-300 cursor-grab active:cursor-grabbing"><GripVertical size={18}/></div>
                                    <div className="w-12 h-16 bg-white rounded border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                                        {/* Tampilkan Preview */}
                                        {file.thumbnail ? (
                                           <img src={file.thumbnail} alt="preview" className="w-full h-full object-contain" />
                                        ) : (
                                           <FileText size={20} className="text-slate-300"/>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{file.size}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-6 h-6 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-[10px] font-bold mr-2">{idx + 1}</div>
                                        <button onClick={() => removeFile(file.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          <div onClick={() => fileInputRef.current?.click()} className="relative border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-400 rounded-xl p-6 flex items-center justify-center gap-3 cursor-pointer transition-all group mt-4">
                              <input type="file" multiple accept="application/pdf" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                              <div className="bg-white p-2 rounded-full shadow-sm text-blue-500 group-hover:scale-110 transition-transform border border-blue-100"><Plus size={20} /></div>
                              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest group-hover:text-blue-600">{T.add[lang]}</span>
                          </div>
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
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
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { 
  Minimize, FileText, Settings2, Download, Globe, 
  CheckCircle2, X, ArrowLeft, Loader2, Gauge, HardDrive
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// Worker Setup
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
}

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<string | null>(null);
  
  // Settings
  const [quality, setQuality] = useState(0.5); // 0.1 - 1.0
  
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
    hero_title: { id: 'Kompres Ukuran PDF', en: 'Compress PDF Size' },
    hero_desc: { 
      id: 'Kecilkan ukuran file PDF Anda agar mudah diupload. Hemat kuota dan penyimpanan.', 
      en: 'Reduce your PDF file size for easy upload. Save data and storage.' 
    },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    drop_text: { id: 'atau tarik file PDF ke sini', en: 'or drop PDF file here' },
    level_label: { id: 'Tingkat Kompresi', en: 'Compression Level' },
    level_extreme: { id: 'Ekstrem (Kualitas Rendah)', en: 'Extreme (Low Quality)' },
    level_rec: { id: 'Disarankan (Standar)', en: 'Recommended (Standard)' },
    level_high: { id: 'Ringan (Kualitas Tinggi)', en: 'Low (High Quality)' },
    compress_btn: { id: 'Kompres PDF', en: 'Compress PDF' },
    success_title: { id: 'Ukuran Berhasil Dikecilkan!', en: 'Size Reduced Successfully!' },
    success_desc: { id: 'File PDF Anda sekarang lebih ringan.', en: 'Your PDF file is now lighter.' },
    download_btn: { id: 'Download Hasil', en: 'Download Result' },
    back_home: { id: 'Kompres Lain', en: 'Compress Another' },
    cancel: { id: 'BATAL', en: 'CANCEL' },
    orig_size: { id: 'Ukuran Asli', en: 'Original Size' },
    new_size: { id: 'Ukuran Baru', en: 'New Size' }
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

  const processFile = (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') {
        alert("Mohon pilih file PDF.");
        return;
    }
    setFile(uploadedFile);
    setPdfUrl(null);
    setCompressedSize(null);
    setProgress(0);
  };

  // --- LOGIKA UTAMA: COMPRESS (RESAMPLE) ---
  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const bufferClone = arrayBuffer.slice(0);

        // 1. Load PDF
        const loadingTask = pdfjsLib.getDocument({ data: bufferClone });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;

        // 2. Setup jsPDF
        const doc = new jsPDF({ orientation: 'p', unit: 'mm' });
        doc.deletePage(1);

        // 3. Loop & Resize
        for (let i = 1; i <= totalPages; i++) {
            setProgress(Math.round((i / totalPages) * 100));

            const page = await pdf.getPage(i);
            
            // Trik: Scale viewport lebih kecil jika kompresi ekstrem
            // Quality < 0.4 -> scale 1.0 (agak buram tapi kecil)
            // Quality > 0.4 -> scale 1.5 (tajam)
            const scale = quality < 0.4 ? 1.0 : 1.5;
            
            const viewport = page.getViewport({ scale: scale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport: viewport } as any).promise;
                
                // INI KUNCINYA: quality parameter (0.1 - 1.0)
                const imgData = canvas.toDataURL('image/jpeg', quality);
                
                const imgWidth = viewport.width * 0.264583; // px to mm
                const imgHeight = viewport.height * 0.264583;

                // Hitung rasio untuk menyesuaikan kertas A4 jika perlu (optional)
                // Disini kita ikut ukuran asli gambar saja biar aman
                doc.addPage([imgWidth, imgHeight]);
                doc.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            }
        }

        const pdfOutput = doc.output('blob');
        
        // Hitung ukuran baru
        setCompressedSize(formatSize(pdfOutput.size));
        
        const url = URL.createObjectURL(pdfOutput);
        setPdfUrl(url);

    } catch (error) {
        console.error("Compression failed:", error);
        alert("Gagal memproses file.");
    } finally {
        setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPdfUrl(null);
    setCompressedSize(null);
    setProgress(0);
  };

  if (!enabled) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans relative selection:bg-blue-100 selection:text-blue-700 flex flex-col">
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f61a_1px,transparent_1px),linear-gradient(to_bottom,#3b82f61a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><Minimize size={18} /></div>
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
                          <Minimize size={32} />
                          {T.select_btn[lang]}
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

        {/* STATE 2: EDITOR & SUCCESS */}
        {file && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
             <div className="w-full max-w-[1400px] flex gap-4 xl:gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20">
                   <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
                </div>

                <div className="flex-1 max-w-xl space-y-8 animate-in slide-in-from-bottom duration-500">
                    <div className="mb-8">
                       <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
                    </div>

                    {!pdfUrl ? (
                        /* --- EDITOR MODE --- */
                        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl shadow-blue-100/50 text-left">
                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center border border-green-100">
                                    <FileText size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-800 truncate">{file.name}</h3>
                                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                        <HardDrive size={10} /> {formatSize(file.size)}
                                    </p>
                                </div>
                                <button onClick={resetAll} className="text-slate-400 hover:text-red-500 transition-colors"><X size={20}/></button>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Gauge size={14}/> {T.level_label[lang]}
                                </label>
                                
                                <div className="grid grid-cols-1 gap-3">
                                    {/* Extreme */}
                                    <div onClick={() => setQuality(0.3)} className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between ${quality === 0.3 ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                        <span className="text-xs font-bold text-slate-700">{T.level_extreme[lang]}</span>
                                        {quality === 0.3 && <CheckCircle2 size={16} className="text-blue-600"/>}
                                    </div>
                                    {/* Recommended */}
                                    <div onClick={() => setQuality(0.5)} className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between ${quality === 0.5 ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                        <span className="text-xs font-bold text-slate-700">{T.level_rec[lang]}</span>
                                        {quality === 0.5 && <CheckCircle2 size={16} className="text-blue-600"/>}
                                    </div>
                                    {/* High Quality */}
                                    <div onClick={() => setQuality(0.8)} className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between ${quality === 0.8 ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                        <span className="text-xs font-bold text-slate-700">{T.level_high[lang]}</span>
                                        {quality === 0.8 && <CheckCircle2 size={16} className="text-blue-600"/>}
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleCompress} 
                                disabled={isProcessing} 
                                className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={18}/> 
                                        {progress > 0 ? `PROSES ${progress}%` : 'KOMPRES...'}
                                    </div>
                                ) : (
                                    <><Minimize size={18}/> {T.compress_btn[lang]}</>
                                )}
                            </button>
                        </div>
                    ) : (
                        /* --- SUCCESS MODE --- */
                        <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-2xl shadow-blue-100 text-center">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                               <CheckCircle2 size={40} strokeWidth={3} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-3">{T.success_title[lang]}</h2>
                            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                              {T.success_desc[lang]}
                            </p>

                            {/* PERBANDINGAN UKURAN */}
                            <div className="flex justify-center gap-8 mb-8 border-t border-b border-slate-100 py-4">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{T.orig_size[lang]}</p>
                                    <p className="text-lg font-bold text-slate-600 line-through">{formatSize(file.size)}</p>
                                </div>
                                <div className="w-px bg-slate-200"></div>
                                <div>
                                    <p className="text-[10px] text-blue-500 uppercase tracking-widest mb-1 font-bold">{T.new_size[lang]}</p>
                                    <p className="text-2xl font-black text-blue-600">{compressedSize}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                               <a 
                                  href={pdfUrl}
                                  download={`Compressed_${file.name}`}
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
                    )}

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
      </main>

      <footer className="py-8 text-center bg-white/50 border-t border-slate-100 mt-auto">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">© 2026 LayananDokumen PDF</p>
      </footer>
    </div>
  );
}
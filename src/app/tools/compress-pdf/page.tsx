'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  Minimize2, FileText, CheckCircle2, Download, Globe, 
  X, ArrowLeft, Loader2, Settings2, BarChart3, AlertCircle, ArrowDown
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// 1. SETUP WORKER STABIL (Wajib)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export default function CompressPdfPage() {
  // STATE UTAMA
  const [file, setFile] = useState<File | null>(null);
  const [fileSize, setFileSize] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string>('');
  const [savings, setSavings] = useState<string>('');
  
  // SETTINGS
  const [compressionLevel, setCompressionLevel] = useState<'extreme' | 'recommended' | 'less'>('recommended');
  
  // UI & BAHASA
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [mobileTab, setMobileTab] = useState<0 | 1>(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
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

  // --- 3. KAMUS ---
  const T = {
    hero_title: { id: 'Kompres PDF Pro', en: 'Compress PDF Pro' },
    hero_desc: { id: 'Kecilkan ukuran file PDF secara drastis langsung di browser.', en: 'Drastically reduce PDF file size directly in your browser.' },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    drop_text: { id: 'atau tarik file ke sini', en: 'or drop file here' },
    
    // Tabs & Sidebar
    tab_stats: { id: 'Statistik', en: 'Stats' },
    tab_settings: { id: 'Pengaturan', en: 'Settings' },
    level_label: { id: 'Level Kompresi', en: 'Compression Level' },
    
    // Levels
    level_extreme: { id: 'Ekstrem', en: 'Extreme' },
    level_extreme_desc: { id: 'Ukuran terkecil, kualitas rendah (72 DPI)', en: 'Smallest size, low quality (72 DPI)' },
    level_rec: { id: 'Disarankan', en: 'Recommended' },
    level_rec_desc: { id: 'Keseimbangan terbaik (144 DPI)', en: 'Best balance (144 DPI)' },
    level_less: { id: 'Rendah', en: 'Low' },
    level_less_desc: { id: 'Kualitas tinggi, kompresi dikit (200 DPI)', en: 'High quality, less compression (200 DPI)' },
    
    // Info
    info_title: { id: 'Cara Kerja', en: 'How it works' },
    info_text: { id: 'Dokumen akan dikonversi ulang untuk membuang data sampah dan mengoptimalkan gambar.', en: 'Document will be reconverted to remove junk data and optimize images.' },
    
    // Actions
    btn_compress: { id: 'Mulai Kompres', en: 'Start Compress' },
    btn_download: { id: 'Download PDF', en: 'Download PDF' },
    btn_repeat: { id: 'Kompres Lain', en: 'Compress Another' },
    btn_cancel: { id: 'Tutup', en: 'Close' },
    
    // Status
    processing: { id: 'Mengoptimalkan...', en: 'Optimizing...' },
    success_title: { id: 'Berhasil Dikecilkan!', en: 'Successfully Reduced!' },
    success_desc: { id: 'File Anda kini lebih ringan dan siap dikirim.', en: 'Your file is now lighter and ready to send.' },
    stat_before: { id: 'Sebelum', en: 'Before' },
    stat_after: { id: 'Sesudah', en: 'After' },
    stat_save: { id: 'Hemat', en: 'Saved' },
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') { alert("Mohon pilih file PDF."); return; }
    setFile(uploadedFile);
    setFileSize(formatSize(uploadedFile.size));
    setResultUrl(null);
    setProgress(0);
  };

  // --- 4. ENGINE KOMPRESI (Rasterization Method) ---
  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);

    // Konfigurasi Level
    let scale = 1.0; 
    let quality = 0.7;
    
    if (compressionLevel === 'extreme') { 
        scale = 0.8; // Perkecil resolusi
        quality = 0.4; // Kualitas JPEG rendah
    } else if (compressionLevel === 'less') { 
        scale = 1.5; // Resolusi tajam
        quality = 0.85; // Kualitas JPEG tinggi
    } else {
        scale = 1.0; // Standar
        quality = 0.6; // Standar
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;
        
        // Buat PDF Baru
        const newPdf = await PDFDocument.create();

        for (let i = 1; i <= totalPages; i++) {
            // Update Progress
            setProgress(Math.round(((i - 1) / totalPages) * 100));
            
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: scale });
            
            // Render ke Canvas (Membuat ulang halaman sebagai gambar)
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                
                // Konversi ke JPEG (Kompresi terjadi di sini)
                const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
                const img = await newPdf.embedJpg(imgDataUrl);
                
                // Tambah halaman ke PDF baru
                const newPage = newPdf.addPage([img.width, img.height]);
                newPage.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
            }
        }

        const pdfBytes = await newPdf.save();
        
        // FIX TYPESCRIPT ERROR: Pakai 'as any'
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        
        setResultSize(formatSize(blob.size));
        const savedBytes = file.size - blob.size;
        const savedPercent = (savedBytes / file.size) * 100;
        
        setSavings(savedBytes > 0 ? `${savedPercent.toFixed(1)}%` : '0%');
        setResultUrl(URL.createObjectURL(blob));
        setProgress(100);

    } catch (error) { 
        console.error(error);
        alert("Gagal mengompres PDF. Coba level kompresi lain."); 
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
          <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><Minimize2 size={20} /></div>
          <span className="font-bold text-xl tracking-tight text-slate-900 italic uppercase">Layanan<span className="text-blue-600">Dokumen</span></span>
        </Link>
        <div className="flex items-center gap-4">
           <button onClick={toggleLang} className="text-[10px] font-bold px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all uppercase tracking-widest text-slate-600">{lang}</button>
           <Link href="/" className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-500 transition-colors bg-red-50 px-4 py-2 rounded-lg">
              <X size={16} /> {T.btn_cancel[lang]}
           </Link>
        </div>
      </nav>

      <main className="flex-1 relative z-10 flex flex-col h-[calc(100dvh-56px)] md:h-auto overflow-y-auto">
        {/* VIEW 1: UPLOAD */}
        {!file && (
          <div 
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-colors ${isDraggingOver ? 'bg-blue-50' : 'bg-[#F8FAFC]'}`} 
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }} 
            onDragLeave={() => setIsDraggingOver(false)} 
            onDrop={(e) => { e.preventDefault(); setIsDraggingOver(false); if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]); }}
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
                        <button onClick={() => fileInputRef.current?.click()} className="group relative bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-5 px-16 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto uppercase tracking-widest">
                           <Minimize2 size={24} /> {T.select_btn[lang]}
                        </button>
                        <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">{T.drop_text[lang]}</p>
                    </div>
                    
                    <div className="flex justify-center mt-8"><AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" /></div>
                    <input type="file" accept="application/pdf" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} className="hidden" />
                 </div>

                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
             </div>
          </div>
        )}

        {/* VIEW 2: RESULT */}
        {resultUrl && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white overflow-y-auto">
             <div className="w-full max-w-5xl flex gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
                
                <div className="flex-1 max-w-xl space-y-8 animate-in slide-in-from-bottom duration-500">
                    <div className="mb-4"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                    
                    <div className="bg-white border border-slate-200 rounded-[30px] p-10 shadow-2xl shadow-blue-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-green-400"/>
                        
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200"><CheckCircle2 size={40} strokeWidth={3} /></div>
                        
                        <h2 className="text-3xl font-black text-slate-900 mb-2">{T.success_title[lang]}</h2>
                        <p className="text-slate-500 font-medium mb-8">{T.success_desc[lang]}</p>
                        
                        <div className="flex justify-center gap-4 mb-8">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[100px]">
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">{T.stat_before[lang]}</p>
                                <p className="text-lg font-black text-slate-700">{fileSize}</p>
                            </div>
                            <div className="flex items-center text-slate-300"><ArrowDown className="-rotate-90" size={24}/></div>
                            <div className="bg-green-50 p-4 rounded-2xl border border-green-100 min-w-[100px]">
                                <p className="text-[10px] uppercase font-bold text-green-600 tracking-wider mb-1">{T.stat_after[lang]}</p>
                                <p className="text-lg font-black text-green-700">{resultSize}</p>
                            </div>
                        </div>
                        
                        <div className="mb-8 inline-block px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                           {T.stat_save[lang]} {savings} 🔥
                        </div>
                        
                        <div className="flex flex-col gap-3">
                           <a href={resultUrl} download={`Compressed_${file?.name}`} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-widest text-sm"><Download size={20} /> {T.btn_download[lang]}</a>
                           <button onClick={() => { setFile(null); setResultUrl(null); }} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"><ArrowLeft size={16} /> {T.btn_repeat[lang]}</button>
                        </div>
                    </div>
                    
                    <div className="flex justify-center"><AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" /></div>
                </div>
                
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
             </div>
          </div>
        )}

        {/* VIEW 3: SETTINGS & PROCESS */}
        {file && !resultUrl && (
          <div className="flex flex-col h-full md:flex-row md:h-auto md:p-6 md:gap-6 max-w-7xl mx-auto w-full">
            {/* MOBILE TABS */}
            <div className="md:hidden flex border-b border-slate-200 bg-white sticky top-0 z-20 shrink-0">
               <button onClick={() => setMobileTab(0)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 0 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{T.tab_stats[lang]}</button>
               <button onClick={() => setMobileTab(1)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 1 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{T.tab_settings[lang]}</button>
            </div>

            {/* KIRI: FILE INFO */}
            <div className={`flex-1 flex flex-col h-full bg-slate-100 md:bg-white md:rounded-2xl md:shadow-xl md:border border-slate-200 md:p-8 overflow-hidden relative ${mobileTab === 0 ? 'flex' : 'hidden md:flex'}`}>
                {/* IKLAN ATAS */}
                <div className="flex justify-center mb-6 shrink-0">
                   <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                   <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
                    <div className="w-24 h-24 bg-red-100 text-red-500 rounded-3xl flex items-center justify-center shadow-lg shadow-red-100 rotate-3"><FileText size={48} /></div>
                    <div className="text-center">
                        <h3 className="text-xl font-black text-slate-800 mb-2 truncate max-w-[280px] mx-auto uppercase tracking-tight">{file.name}</h3>
                        <span className="text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1 rounded-full">{fileSize}</span>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 max-w-md mx-auto text-left">
                        <h4 className="flex items-center gap-2 text-[10px] font-black text-blue-600 mb-2 uppercase tracking-widest"><AlertCircle size={14}/> {T.info_title[lang]}</h4>
                        <p className="text-xs text-blue-800 leading-relaxed font-medium">{T.info_text[lang]}</p>
                    </div>
                </div>

                {/* IKLAN BAWAH */}
                <div className="flex justify-center mt-6 shrink-0">
                   <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                   <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>
            </div>

            {/* KANAN: SETTINGS */}
            <div className={`w-full md:w-96 bg-white md:rounded-2xl md:shadow-xl md:border border-slate-200 p-6 overflow-y-auto md:h-fit shrink-0 ${mobileTab === 1 ? 'block' : 'hidden md:block'}`}>
                <h3 className="font-black text-[10px] text-slate-400 uppercase mb-6 tracking-widest flex items-center gap-2"><Settings2 size={14}/> {T.tab_settings[lang]}</h3>
                
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 block uppercase flex items-center gap-1 tracking-widest"><BarChart3 size={12}/> {T.level_label[lang]}</label>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => setCompressionLevel('extreme')} className={`p-4 rounded-xl border-2 text-left transition-all group ${compressionLevel === 'extreme' ? 'bg-red-50 border-red-500 shadow-md' : 'bg-white border-slate-100 hover:border-red-200'}`}>
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-xs font-black uppercase ${compressionLevel === 'extreme' ? 'text-red-600' : 'text-slate-700'}`}>{T.level_extreme[lang]}</span>
                                {compressionLevel === 'extreme' && <CheckCircle2 size={16} className="text-red-500"/>}
                            </div>
                            <span className="text-[10px] font-medium text-slate-400">{T.level_extreme_desc[lang]}</span>
                        </button>
                        
                        <button onClick={() => setCompressionLevel('recommended')} className={`p-4 rounded-xl border-2 text-left transition-all group ${compressionLevel === 'recommended' ? 'bg-blue-50 border-blue-500 shadow-md' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-xs font-black uppercase ${compressionLevel === 'recommended' ? 'text-blue-600' : 'text-slate-700'}`}>{T.level_rec[lang]}</span>
                                {compressionLevel === 'recommended' && <CheckCircle2 size={16} className="text-blue-500"/>}
                            </div>
                            <span className="text-[10px] font-medium text-slate-400">{T.level_rec_desc[lang]}</span>
                        </button>
                        
                        <button onClick={() => setCompressionLevel('less')} className={`p-4 rounded-xl border-2 text-left transition-all group ${compressionLevel === 'less' ? 'bg-green-50 border-green-500 shadow-md' : 'bg-white border-slate-100 hover:border-green-200'}`}>
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-xs font-black uppercase ${compressionLevel === 'less' ? 'text-green-600' : 'text-slate-700'}`}>{T.level_less[lang]}</span>
                                {compressionLevel === 'less' && <CheckCircle2 size={16} className="text-green-500"/>}
                            </div>
                            <span className="text-[10px] font-medium text-slate-400">{T.level_less_desc[lang]}</span>
                        </button>
                    </div>
                </div>

                {/* PROGRESS BAR */}
                {isProcessing && (
                    <div className="mt-8 bg-slate-50 p-4 rounded-xl border border-slate-200 animate-pulse">
                        <div className="flex justify-between text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">
                            <span>{T.processing[lang]}</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-blue-600 h-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                )}

                <div className="mt-6 flex justify-center"><AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" /></div>

                <button onClick={handleCompress} disabled={isProcessing} className="w-full mt-6 bg-slate-900 hover:bg-blue-600 disabled:bg-slate-300 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                    {isProcessing ? <Loader2 className="animate-spin" size={18}/> : <Minimize2 size={18}/>} {isProcessing ? T.processing[lang] : T.btn_compress[lang]}
                </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
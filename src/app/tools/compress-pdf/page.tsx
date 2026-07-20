'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  Minimize2, CheckCircle2, Download, 
  ArrowLeft, Loader2, Settings2, BarChart3, ArrowDown,
  Info, Eye, AlertTriangle
} from 'lucide-react';
import AdsterraBanner from '@/components/AdsterraBanner';
import ToolLayout from '@/components/ToolLayout';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileSize, setFileSize] = useState<string>('');
  
  const [inputPreview, setInputPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<string>('');
  const [savings, setSavings] = useState<string>('');
  
  const [compressionLevel, setCompressionLevel] = useState<'extreme' | 'recommended' | 'less'>('recommended');
  
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [mobileTab, setMobileTab] = useState<0 | 1>(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user-lang') as 'id' | 'en';
    if (saved) setLang(saved);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    return () => {
      if (inputPreview) URL.revokeObjectURL(inputPreview);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [inputPreview, resultUrl]);

  const toggleLang = () => {
    const newLang = lang === 'id' ? 'en' : 'id';
    setLang(newLang);
    localStorage.setItem('user-lang', newLang);
  };

  const T = {
    hero_title: { id: 'Kompres PDF Pro', en: 'Compress PDF Pro' },
    hero_desc: { id: 'Kecilkan ukuran file PDF secara signifikan dengan merasterisasi konten menjadi gambar berukuran kecil.', en: 'Reduce PDF size significantly by rasterizing content into compressed images.' },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    drop_text: { id: 'atau tarik file ke sini', en: 'or drop file here' },
    tab_stats: { id: 'Preview', en: 'Preview' },
    tab_settings: { id: 'Pengaturan', en: 'Settings' },
    level_label: { id: 'Pilih Tingkat Kompresi', en: 'Choose Compression Level' },
    level_extreme: { id: 'Ekstrem (Web)', en: 'Extreme (Web)' },
    level_extreme_desc: { id: 'Ukuran terkecil. Teks mungkin sedikit buram.', en: 'Smallest size. Text might be slightly blurry.' },
    level_rec: { id: 'Standar (Disarankan)', en: 'Standard (Recommended)' },
    level_rec_desc: { id: 'Keseimbangan terbaik. Teks tetap terbaca jelas.', en: 'Best balance. Text remains clear.' },
    level_less: { id: 'Kualitas Tinggi', en: 'High Quality' },
    level_less_desc: { id: 'Ukuran file berkurang sedikit, kualitas bagus.', en: 'Slight file size reduction, good quality.' },
    info_title: { id: 'File Terpilih', en: 'Selected File' },
    info_change: { id: 'Ganti File', en: 'Change File' },
    btn_compress: { id: 'Kompres PDF Sekarang', en: 'Compress PDF Now' },
    btn_download: { id: 'Download Hasil', en: 'Download Result' },
    btn_repeat: { id: 'Kompres Lagi', en: 'Compress Again' },
    processing: { id: 'Sedang memproses', en: 'Processing' },
    finalizing: { id: 'Menyusun ulang PDF...', en: 'Rebuilding PDF...' },
    success_title: { id: 'Kompresi Berhasil!', en: 'Compression Success!' },
    success_desc: { id: 'Lihat perbedaannya di bawah ini.', en: 'See the difference below.' },
    stat_before: { id: 'Asli', en: 'Original' },
    stat_after: { id: 'Hasil', en: 'Result' },
    stat_save: { id: 'Hemat', en: 'Saved' },
    warning_raster: { id: 'Peringatan: Metode ini merubah PDF menjadi format gambar rata (flattened). Teks tidak bisa lagi di-copy-paste.', en: 'Warning: This method flattens the PDF into images. Text will no longer be selectable.' }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generateThumbnail = async (file: File) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        const viewport = page.getViewport({ scale: 0.6 }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport }).promise;
            
            canvas.toBlob((blob) => {
                if (blob) setInputPreview(URL.createObjectURL(blob));
            }, 'image/jpeg', 0.5);
        }
    } catch (e) {
        console.error("Gagal membuat preview:", e);
        setInputPreview(null);
    }
  };

  const handleFileSelect = (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') { alert("Mohon pilih file PDF."); return; }
    setFile(uploadedFile);
    setFileSize(formatSize(uploadedFile.size));
    setResultUrl(null);
    setProgress(0);
    setInputPreview(null);
    generateThumbnail(uploadedFile);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);

    let scale = 1.5; 
    let quality = 0.7;
    
    if (compressionLevel === 'extreme') { 
        scale = 1.0; 
        quality = 0.5; 
    } else if (compressionLevel === 'less') { 
        scale = 3.0; 
        quality = 0.85; 
    } else {
        scale = 2.0; 
        quality = 0.65; 
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;
        const newPdf = await PDFDocument.create();

        for (let i = 1; i <= totalPages; i++) {
            setStatusText(`${T.processing[lang]} ${i}/${totalPages}`);
            setProgress(Math.round(((i - 1) / totalPages) * 100));
            
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: scale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                
                // Di sini kita memang harus pake Data URL untuk diberikan ke pdf-lib embedJpg
                // Karena PDFDocument tidak menerima URL.createObjectURL secara langsung.
                // Tapi kita hapus string sesegera mungkin dari iterasi.
                const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
                const img = await newPdf.embedJpg(imgDataUrl);
                const pageDims = page.getViewport({ scale: 1.0 });
                const newPage = newPdf.addPage([pageDims.width, pageDims.height]);
                
                newPage.drawImage(img, { x: 0, y: 0, width: pageDims.width, height: pageDims.height });
            }
        }

        setStatusText(T.finalizing[lang]);
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        
        setResultSize(formatSize(blob.size));
        const savedBytes = file.size - blob.size;
        const savedPercent = (savedBytes / file.size) * 100;
        
        setSavings(savedBytes > 0 ? `${savedPercent.toFixed(1)}%` : '0%');
        setResultUrl(URL.createObjectURL(blob));
        setProgress(100);

    } catch (error) { 
        console.error(error);
        alert("Terjadi kesalahan. PDF mungkin dipassword atau korup."); 
    } finally { 
        setIsProcessing(false); 
    }
  };

  const resetAll = () => {
      if (inputPreview) URL.revokeObjectURL(inputPreview);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setFile(null);
      setResultUrl(null);
      setInputPreview(null);
  }

  if (!isLoaded) return null;

  return (
    <ToolLayout
      lang={lang}
      toggleLang={toggleLang}
      titleDesktop={<>Kompres<span className="text-blue-600">PDF</span></>}
      titleMobile={<>Kompres <span className="text-blue-600">PDF</span></>}
      icon={<Minimize2 size={18} />}
      iconBgColor="bg-blue-600"
      selectionClass="selection:bg-blue-100 selection:text-blue-700"
    >
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
                           <button onClick={resetAll} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"><ArrowLeft size={16} /> {T.btn_repeat[lang]}</button>
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
            <div className="md:hidden flex border-b border-slate-200 bg-white sticky top-0 z-20 shrink-0">
               <button onClick={() => setMobileTab(0)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 0 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{T.tab_stats[lang]}</button>
               <button onClick={() => setMobileTab(1)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 1 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{T.tab_settings[lang]}</button>
            </div>

            <div className={`flex-1 flex flex-col h-full bg-slate-100 md:bg-white md:rounded-2xl md:shadow-xl md:border border-slate-200 md:p-8 overflow-hidden relative ${mobileTab === 0 ? 'flex' : 'hidden md:flex'}`}>
                <div className="flex justify-center mb-6 shrink-0">
                   <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                   <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
                    <div className="relative group">
                        <div className="w-48 aspect-[1/1.41] bg-white rounded shadow-lg border border-slate-200 overflow-hidden flex items-center justify-center relative">
                            {inputPreview ? (
                                <img src={inputPreview} alt="Preview" className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-slate-300 flex flex-col items-center gap-2">
                                    <Loader2 className="animate-spin" size={32} />
                                    <span className="text-[10px] font-bold">Rendering...</span>
                                </div>
                            )}
                        </div>
                        <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-blue-600 transition-colors flex items-center gap-2 whitespace-nowrap opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-200">
                            <Eye size={12} /> {T.info_change[lang]}
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <h3 className="text-lg font-black text-slate-800 mb-1 truncate max-w-[280px] mx-auto uppercase tracking-tight">{file.name}</h3>
                        <span className="text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1 rounded-full">{fileSize}</span>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 max-w-sm mx-auto text-left w-full">
                        <h4 className="flex items-center gap-2 text-[10px] font-black text-yellow-700 mb-2 uppercase tracking-widest"><AlertTriangle size={14}/> {T.info_title[lang]}</h4>
                        <p className="text-[11px] text-yellow-800 font-medium">{T.warning_raster[lang]}</p>
                    </div>
                </div>

                <div className="flex justify-center mt-6 shrink-0">
                   <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                   <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>
            </div>

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

                {isProcessing && (
                    <div className="mt-8 bg-slate-50 p-4 rounded-xl border border-slate-200 animate-pulse">
                        <div className="flex justify-between text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">
                            <span>{statusText || T.processing[lang]}</span>
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
    </ToolLayout>
  );
}
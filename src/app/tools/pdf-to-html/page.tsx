'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  FileCode, FileText, CheckCircle2, Download, Globe, 
  X, ArrowLeft, Loader2, Code2, Monitor
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// 1. WORKER STABIL (Wajib)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export default function PdfToHtmlPage() {
  // STATE UTAMA
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [htmlUrl, setHtmlUrl] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  
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
    hero_title: { id: 'Konversi PDF ke HTML', en: 'Convert PDF to HTML' },
    hero_desc: { 
      id: 'Ubah dokumen PDF menjadi halaman web (HTML) sederhana. Ringan dan responsif.', 
      en: 'Convert PDF documents into simple web pages (HTML). Lightweight and responsive.' 
    },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    drop_text: { id: 'atau tarik file ke sini', en: 'or drop file here' },
    
    // UI
    preview_title: { id: 'Kode HTML (Preview)', en: 'HTML Code (Preview)' },
    
    // Actions
    btn_convert: { id: 'Konversi ke HTML', en: 'Convert to HTML' },
    btn_download: { id: 'Download .html', en: 'Download .html' },
    
    // Status
    processing: { id: 'MEMPROSES...', en: 'PROCESSING...' },
    
    // Success
    success_title: { id: 'Selesai!', en: 'Done!' },
    success_desc: { id: 'PDF Anda telah diubah menjadi HTML.', en: 'Your PDF has been converted to HTML.' },
    back_home: { id: 'Konversi Lagi', en: 'Convert Another' },
    cancel: { id: 'Tutup', en: 'Close' },
    
    // Info
    info_limit: { id: 'Versi Basic: Hanya mengekstrak teks dan struktur dasar. Gambar tidak disertakan.', en: 'Basic Version: Extracts text and basic structure only. Images are not included.' }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const processFile = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') {
        alert("Mohon pilih file PDF.");
        return;
    }
    setFile(uploadedFile);
    setHtmlUrl(null);
    setPreviewHtml('');
  };

  // --- 4. ENGINE PDF TO HTML (BASIC TEXT BASED) ---
  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;
        
        let bodyContent = '';

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            // Mengambil item teks dan menyusunnya
            const pageItems = textContent.items.map((item: any) => {
                // Sederhana: bungkus setiap baris teks dalam <p>
                // Versi pro butuh kalkulasi posisi Y (top) untuk layout akurat
                return `<p>${item.str}</p>`;
            }).join('');
            
            bodyContent += `
            <div class="pdf-page" id="page-${i}">
                <div class="page-number">Page ${i}</div>
                <div class="page-content">
                    ${pageItems}
                </div>
            </div>
            <hr class="page-break">
            `;
        }

        // Template HTML Standar
        const finalHtml = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${file.name.replace('.pdf', '')}</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-radius: 8px; }
        .pdf-page { margin-bottom: 30px; }
        .page-number { font-size: 0.8em; color: #999; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
        .page-break { border: 0; border-top: 1px dashed #ccc; margin: 40px 0; }
        p { margin-bottom: 10px; min-height: 1em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${file.name}</h1>
        ${bodyContent}
    </div>
</body>
</html>`;

        setPreviewHtml(finalHtml);
        
        const blob = new Blob([finalHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setHtmlUrl(url);

    } catch (error) {
        console.error(error);
        alert("Gagal mengonversi PDF.");
    } finally {
        setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setHtmlUrl(null);
    setPreviewHtml('');
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans relative selection:bg-blue-100 selection:text-blue-700 flex flex-col overflow-hidden">
      
      {/* NAVBAR */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-purple-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><FileCode size={18} /></div>
          <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900 italic uppercase">
              <span className="md:hidden">PDF to <span className="text-purple-600">HTML</span></span>
              <span className="hidden md:inline">PDF<span className="text-purple-600">2HTML</span> Pro</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
           <button onClick={toggleLang} className="flex items-center gap-1 font-bold bg-slate-100 px-2 py-1 rounded text-[10px] text-slate-600 hover:bg-purple-50 hover:text-purple-600 transition-colors">
             <Globe size={12} /> {lang.toUpperCase()}
           </button>
           <Link href="/" className="text-[10px] md:text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-[0.2em] transition-colors flex items-center gap-1">
              <X size={18} /> <span className="hidden md:inline">{T.cancel[lang]}</span>
           </Link>
        </div>
      </nav>

      <main className="flex-1 relative z-10 flex flex-col h-[calc(100dvh-56px)] md:h-auto">
        
        {/* STATE 1: LANDING */}
        {!file && (
          <div 
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-all overflow-y-auto ${isDraggingOver ? 'bg-purple-50/50' : ''}`}
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
                          className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white text-lg md:text-xl font-bold py-5 md:py-6 px-10 md:px-16 rounded-xl shadow-xl shadow-purple-200 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                           {isProcessing ? <Loader2 className="animate-spin" size={24}/> : <FileCode size={24} />} 
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

        {/* STATE 2: SUCCESS / RESULT */}
        {file && (
          <div className="flex flex-col h-full md:p-6 md:gap-6 max-w-7xl mx-auto w-full">
            
            {/* ADS TOP */}
            <div className="flex justify-center mb-4 shrink-0 overflow-hidden px-4">
               <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
               <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
                
                {/* PREVIEW CODE (LEFT) */}
                <div className="flex-1 bg-slate-900 md:rounded-3xl md:shadow-xl md:border border-slate-700 flex flex-col overflow-hidden order-2 lg:order-1">
                    <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
                        <h3 className="font-bold text-sm md:text-base text-slate-300 flex items-center gap-2">
                           <Code2 className="text-purple-400" size={18}/> {T.preview_title[lang]}
                        </h3>
                    </div>
                    
                    <div className="flex-1 relative overflow-auto custom-scrollbar p-4">
                        {isProcessing ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Loader2 className="animate-spin text-purple-500 mb-4" size={40}/>
                                <p className="text-slate-400 text-xs font-bold animate-pulse uppercase tracking-widest">{T.processing[lang]}</p>
                            </div>
                        ) : previewHtml ? (
                            <pre className="text-xs md:text-sm font-mono text-green-400 whitespace-pre-wrap">
                                {previewHtml}
                            </pre>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-600">
                                <Monitor size={48} className="mb-2 opacity-50"/>
                                <p className="text-xs uppercase tracking-widest">Siap dikonversi</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* SIDEBAR (ACTIONS) */}
                <div className="w-full lg:w-80 space-y-6 shrink-0 order-1 lg:order-2 px-4 lg:px-0">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
                        <div className="mb-6 pb-6 border-b border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">File</p>
                            <p className="font-bold text-slate-700 truncate text-sm flex items-center gap-2">
                                <FileText size={16} className="text-purple-500"/> {file.name}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {!htmlUrl ? (
                                <button 
                                    onClick={handleConvert} 
                                    disabled={isProcessing}
                                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin" size={16}/> : <FileCode size={16}/>}
                                    {T.btn_convert[lang]}
                                </button>
                            ) : (
                                <a 
                                    href={htmlUrl} 
                                    download={`${file.name.replace('.pdf', '')}.html`}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer block text-center"
                                >
                                    <Download size={16}/> {T.btn_download[lang]}
                                </a>
                            )}
                            
                            <button 
                                onClick={resetAll} 
                                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <ArrowLeft size={16} /> {T.back_home[lang]}
                            </button>
                        </div>

                        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-[10px] text-blue-600 leading-relaxed font-medium">
                                <strong>Info:</strong> {T.info_limit[lang]}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                    </div>
                </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
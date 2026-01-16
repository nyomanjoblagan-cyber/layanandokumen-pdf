'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  FileText, Copy, Check, Download, Globe, 
  X, ArrowLeft, Loader2, AlignLeft, Trash2, FileType
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// 1. WORKER STABIL (Wajib)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export default function PdfToTextPage() {
  // STATE UTAMA
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
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
    hero_title: { id: 'Konversi PDF ke Teks', en: 'Convert PDF to Text' },
    hero_desc: { 
      id: 'Ekstrak tulisan dari file PDF menjadi teks biasa (.txt) yang bisa diedit dan disalin.', 
      en: 'Extract text from PDF files into plain text (.txt) that can be edited and copied.' 
    },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    drop_text: { id: 'atau tarik file ke sini', en: 'or drop file here' },
    
    // Editor UI
    result_title: { id: 'Hasil Ekstraksi', en: 'Extraction Result' },
    placeholder_result: { id: 'Teks akan muncul di sini...', en: 'Text will appear here...' },
    
    // Actions
    btn_copy: { id: 'Salin Teks', en: 'Copy Text' },
    btn_copied: { id: 'Tersalin!', en: 'Copied!' },
    btn_download: { id: 'Download .txt', en: 'Download .txt' },
    
    // Status
    processing: { id: 'MENGEKSTRAK...', en: 'EXTRACTING...' },
    
    // Success
    success_title: { id: 'Selesai!', en: 'Done!' },
    back_home: { id: 'Konversi Lagi', en: 'Convert Another' },
    cancel: { id: 'Tutup', en: 'Close' },
    
    // Info
    info_limit: { id: 'Hanya bisa membaca PDF berbasis teks (bukan hasil scan gambar).', en: 'Only works with text-based PDFs (not scanned images).' }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  // --- 4. ENGINE EKSTRAKSI TEKS ---
  const processFile = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') {
        alert("Mohon pilih file PDF.");
        return;
    }
    setFile(uploadedFile);
    setIsProcessing(true);
    setExtractedText('');

    try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;
        
        let fullText = '';

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            // Menggabungkan item teks
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            
            fullText += `--- Page ${i} ---\n\n${pageText}\n\n`;
        }

        if (!fullText.trim()) {
            fullText = lang === 'id' 
                ? "[Tidak ada teks ditemukan. PDF ini mungkin berisi gambar scan.]" 
                : "[No text found. This PDF might contain scanned images.]";
        }

        setExtractedText(fullText);

    } catch (error) {
        console.error(error);
        alert("Gagal membaca file PDF.");
        setFile(null);
    } finally {
        setIsProcessing(false);
    }
  };

  // --- 5. ACTIONS ---
  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadText = () => {
    const element = document.createElement("a");
    const fileBlob = new Blob([extractedText], {type: 'text/plain'});
    element.href = URL.createObjectURL(fileBlob);
    element.download = `${file?.name.replace('.pdf', '')}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const resetAll = () => {
    setFile(null);
    setExtractedText('');
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans relative selection:bg-blue-100 selection:text-blue-700 flex flex-col overflow-hidden">
      
      {/* NAVBAR */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-slate-700 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><FileText size={18} /></div>
          <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900 italic uppercase">
              <span className="md:hidden">PDF to <span className="text-slate-600">Text</span></span>
              <span className="hidden md:inline">PDF<span className="text-slate-600">2Text</span> Pro</span>
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

      <main className="flex-1 relative z-10 flex flex-col h-[calc(100dvh-56px)] md:h-auto">
        
        {/* STATE 1: LANDING */}
        {!file && (
          <div 
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-all overflow-y-auto ${isDraggingOver ? 'bg-slate-100' : 'bg-[#F8FAFC]'}`}
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
                          className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white text-lg md:text-xl font-bold py-5 md:py-6 px-10 md:px-16 rounded-xl shadow-xl shadow-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                           {isProcessing ? <Loader2 className="animate-spin" size={24}/> : <FileText size={24} />} 
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

        {/* STATE 2: RESULT EDITOR */}
        {file && (
          <div className="flex flex-col h-full md:p-6 md:gap-6 max-w-7xl mx-auto w-full">
            
            <div className="flex justify-center mb-4 shrink-0 overflow-hidden px-4">
               <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
               <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
                
                {/* TEXT AREA (MAIN) */}
                <div className="flex-1 bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 flex flex-col overflow-hidden order-2 lg:order-1">
                    <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                        <h3 className="font-bold text-sm md:text-lg text-slate-800 flex items-center gap-2">
                           <AlignLeft className="text-slate-500" size={20}/> {T.result_title[lang]}
                        </h3>
                        <div className="flex gap-2">
                            <button 
                                onClick={copyToClipboard} 
                                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${isCopied ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {isCopied ? <Check size={14}/> : <Copy size={14}/>}
                                {isCopied ? T.btn_copied[lang] : T.btn_copy[lang]}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 relative">
                        {isProcessing ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20">
                                <Loader2 className="animate-spin text-slate-300 mb-4" size={40}/>
                                <p className="text-slate-400 text-xs font-bold animate-pulse uppercase tracking-widest">{T.processing[lang]}</p>
                            </div>
                        ) : (
                            <textarea 
                                className="w-full h-full p-4 md:p-6 resize-none outline-none text-sm md:text-base font-mono text-slate-700 leading-relaxed"
                                value={extractedText}
                                onChange={(e) => setExtractedText(e.target.value)}
                                placeholder={T.placeholder_result[lang]}
                            />
                        )}
                    </div>
                </div>

                {/* SIDEBAR (ACTIONS) */}
                <div className="w-full lg:w-80 space-y-6 shrink-0 order-1 lg:order-2 px-4 lg:px-0">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
                        <div className="mb-6 pb-6 border-b border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">File</p>
                            <p className="font-bold text-slate-700 truncate text-sm flex items-center gap-2">
                                <FileType size={16} className="text-red-500"/> {file.name}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button 
                                onClick={downloadText} 
                                disabled={isProcessing || !extractedText}
                                className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <Download size={16}/> {T.btn_download[lang]}
                            </button>
                            
                            <button 
                                onClick={resetAll} 
                                className="w-full bg-red-50 hover:bg-red-100 text-red-500 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <Trash2 size={16} /> {T.back_home[lang]}
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
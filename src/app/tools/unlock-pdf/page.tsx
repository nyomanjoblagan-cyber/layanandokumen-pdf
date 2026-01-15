'use client';

import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { 
  Unlock, Lock, FileText, 
  Settings2, Download, Globe, Eye, EyeOff,
  CheckCircle2, X, ArrowLeft, ShieldAlert, KeyRound, Loader2, FileCheck
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// Worker Setup (Wajib)
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
}

export default function UnlockPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0); // Indikator progress
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // State UI
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [enabled, setEnabled] = useState(false); 
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => { cancelAnimationFrame(animation); setEnabled(false); };
  }, []);

  const T = {
    hero_title: { id: 'Hapus Password PDF', en: 'Unlock PDF' },
    hero_desc: { 
      id: 'Hapus keamanan password dari file PDF Anda agar bisa dibuka dan diedit tanpa sandi.', 
      en: 'Remove password security from your PDF files so they can be opened and edited without a password.' 
    },
    select_btn: { id: 'Pilih PDF Terkunci', en: 'Select Locked PDF' },
    drop_text: { id: 'atau tarik file PDF ke sini', en: 'or drop PDF file here' },
    pass_label: { id: 'Password File Ini', en: 'File Password' },
    pass_placeholder: { id: 'Masukkan password asli file...', en: 'Enter original file password...' },
    unlock_btn: { id: 'Buka Kunci PDF', en: 'Unlock PDF' },
    success_title: { id: 'Password Dihapus!', en: 'Password Removed!' },
    success_desc: { id: 'File PDF Anda sekarang sudah bebas password.', en: 'Your PDF file is now password-free.' },
    download_btn: { id: 'Download PDF Terbuka', en: 'Download Unlocked PDF' },
    back_home: { id: 'Buka File Lain', en: 'Unlock Another' },
    cancel: { id: 'BATAL', en: 'CANCEL' },
    error_wrong: { id: 'Password Salah!', en: 'Wrong Password!' },
    error_generic: { id: 'Gagal memproses file.', en: 'Failed to process file.' },
    processing_page: { id: 'Memproses Halaman', en: 'Processing Page' }
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
    setErrorMessage(null);
    setPassword('');
    setProgress(0);
  };

  // --- LOGIKA UTAMA: UNLOCK PDF (METODE RE-PRINT) ---
  const handleUnlock = async () => {
    if (!file || !password) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setProgress(0);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const bufferClone = arrayBuffer.slice(0); // Clone buffer

        // 1. Coba Buka dengan Password pakai PDF.js (Lebih Kuat)
        const loadingTask = pdfjsLib.getDocument({ 
            data: bufferClone, 
            password: password 
        });

        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;

        // 2. Siapkan Wadah PDF Baru
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm'
        });
        doc.deletePage(1); // Hapus halaman kosong default

        // 3. Loop Halaman -> Render Gambar -> Masukkan ke PDF Baru
        for (let i = 1; i <= totalPages; i++) {
            setProgress(Math.round((i / totalPages) * 100)); // Update Progress

            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 }); // High Quality
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport: viewport } as any).promise;
                
                const imgData = canvas.toDataURL('image/jpeg', 0.85);
                const imgWidth = viewport.width * 0.264583; // px to mm
                const imgHeight = viewport.height * 0.264583;

                doc.addPage([imgWidth, imgHeight]);
                doc.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            }
        }

        // 4. Save Result
        const pdfOutput = doc.output('blob');
        const url = URL.createObjectURL(pdfOutput);
        setPdfUrl(url);

    } catch (error: any) {
        console.error("Unlock failed:", error);
        
        // Deteksi Password Salah dari PDF.js
        if (error.name === 'PasswordException' || (error.message && error.message.includes('Password'))) {
            setErrorMessage(T.error_wrong[lang]);
        } else {
            setErrorMessage(T.error_generic[lang]);
        }
    } finally {
        setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPdfUrl(null);
    setPassword('');
    setErrorMessage(null);
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
          <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><Unlock size={18} /></div>
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
                          <Unlock size={32} />
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
                                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center border border-red-100">
                                    <Lock size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-800 truncate">{file.name}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{formatSize(file.size)}</p>
                                </div>
                                <button onClick={resetAll} className="text-slate-400 hover:text-red-500 transition-colors"><X size={20}/></button>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">{T.pass_label[lang]}</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <KeyRound size={20} />
                                    </div>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setErrorMessage(null); // Reset error pas ngetik
                                        }}
                                        placeholder={T.pass_placeholder[lang]}
                                        className={`w-full bg-slate-50 border rounded-xl py-4 pl-12 pr-12 font-bold text-slate-700 outline-none focus:bg-white transition-all
                                        ${errorMessage ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-slate-200 focus:border-blue-500'}`}
                                    />
                                    <button 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
                                    >
                                        {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                                    </button>
                                </div>
                                
                                {errorMessage ? (
                                    <div className="text-[10px] text-red-600 font-bold flex items-center gap-1 animate-pulse">
                                        <ShieldAlert size={12} /> {errorMessage}
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-slate-400 leading-relaxed">*Masukkan password asli file tersebut untuk membuka kuncinya.</p>
                                )}
                            </div>

                            <button 
                                onClick={handleUnlock} 
                                disabled={!password || isProcessing} 
                                className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={18}/> 
                                        {progress > 0 ? `PROSES ${progress}%` : 'MEMBUKA...'}
                                    </div>
                                ) : (
                                    <><Unlock size={18}/> {T.unlock_btn[lang]}</>
                                )}
                            </button>
                        </div>
                    ) : (
                        /* --- SUCCESS MODE --- */
                        <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-2xl shadow-blue-100 text-center">
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
                                  download={`Unlocked_${file.name}`}
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
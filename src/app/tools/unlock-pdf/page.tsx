'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  Unlock, FileText, CheckCircle2, Download, Globe, 
  X, ArrowLeft, Loader2, KeyRound, AlertCircle, ShieldOff
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// 1. WORKER STABIL (Wajib)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export default function UnlockPdfPage() {
  // STATE UTAMA
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // STATE UNLOCK
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    hero_title: { id: 'Buka Kunci PDF', en: 'Unlock PDF' },
    hero_desc: { 
      id: 'Hapus password dan enkripsi dari file PDF Anda. Dapatkan kembali akses penuh ke dokumen.', 
      en: 'Remove password and encryption from your PDF file. Regain full access to your documents.' 
    },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    drop_text: { id: 'atau tarik file ke sini', en: 'or drop file here' },
    
    // Unlock UI
    title_locked: { id: 'File Ini Terkunci', en: 'This File is Locked' },
    desc_locked: { id: 'Masukkan password yang benar untuk menghapus proteksinya.', en: 'Enter the correct password to remove protection.' },
    input_label: { id: 'Password Dokumen', en: 'Document Password' },
    input_placeholder: { id: 'Masukkan password...', en: 'Enter password...' },
    btn_unlock: { id: 'Buka Kunci', en: 'Unlock PDF' },
    
    // Errors
    error_pass: { id: 'Password salah. Coba lagi.', en: 'Incorrect password. Try again.' },
    error_generic: { id: 'Gagal membuka file.', en: 'Failed to unlock file.' },
    
    // Status
    processing: { id: 'Mengecek...', en: 'Checking...' },
    unlocking: { id: 'Membuka...', en: 'Unlocking...' },
    
    // Success
    success_title: { id: 'Berhasil Dibuka!', en: 'Unlocked Successfully!' },
    success_desc: { id: 'Password telah dihapus. File Anda sekarang bebas akses.', en: 'Password has been removed. Your file is now free to access.' },
    download_btn: { id: 'Download PDF', en: 'Download PDF' },
    back_home: { id: 'Buka File Lain', en: 'Unlock Another' },
    cancel: { id: 'Tutup', en: 'Close' },
    
    // Info
    info_secure: { id: 'Tenang, password Anda diproses lokal dan tidak kami simpan.', en: 'Relax, your password is processed locally and never stored.' }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  // --- 4. DETEKSI ENKRIPSI ---
  const processFile = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') {
        alert("Mohon pilih file PDF.");
        return;
    }
    setFile(uploadedFile);
    setIsProcessing(true);
    setPdfUrl(null);
    setPassword('');
    setErrorMsg('');
    setIsEncrypted(false);

    try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        
        // Coba load dokumen. Jika terpassword, ini akan throw error.
        try {
            await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
            
            // Jika berhasil load tanpa password, berarti TIDAK terkunci
            // Tapi kita bisa "force" unlock mode kalau user ingin memastikan
            alert(lang === 'id' ? "File ini tidak dikunci password!" : "This file is not password protected!");
            // Reset karena tidak perlu di-unlock
            setFile(null); 
        } catch (e) {
            // Jika error, asumsikan terkunci password
            setIsEncrypted(true);
        }

    } catch (error) {
        console.error(error);
        alert("Gagal membaca file.");
        setFile(null);
    } finally {
        setIsProcessing(false);
    }
  };

  // --- 5. ENGINE UNLOCK (DECRYPT) ---
  const handleUnlock = async () => {
    if (!file || !password) {
        setErrorMsg(T.input_placeholder[lang]);
        return;
    }
    setIsUnlocking(true);
    setErrorMsg('');

    try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Coba load dengan password user
        // Gunakan 'any' casting untuk parameter password karena library strict
        const pdfDoc = await PDFDocument.load(arrayBuffer, { password } as any);
        
        // Jika berhasil load, simpan ulang tanpa enkripsi
        const pdfBytes = await pdfDoc.save();
        
        // Fix Blob Type Error
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);

    } catch (error) {
        console.error(error);
        // Error biasanya karena password salah
        setErrorMsg(T.error_pass[lang]);
    } finally {
        setIsUnlocking(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPdfUrl(null);
    setPassword('');
    setIsEncrypted(false);
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans relative selection:bg-blue-100 selection:text-blue-700 flex flex-col overflow-hidden">
      
      {/* NAVBAR */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 h-14 md:h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 text-white p-1 md:p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><Unlock size={18} /></div>
          <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900 italic uppercase">
              <span className="md:hidden">Unlock<span className="text-blue-600">PDF</span></span>
              <span className="hidden md:inline">Layanan<span className="text-blue-600">Dokumen</span> <span className="text-slate-300 font-black">PDF</span></span>
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

      <main className="flex-1 relative z-10 flex flex-col h-[calc(100dvh-56px)] md:h-auto overflow-y-auto">
        
        {/* STATE 1: LANDING */}
        {!file && (
          <div 
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-all ${isDraggingOver ? 'bg-blue-50/50' : ''}`}
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
                          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white text-lg md:text-xl font-bold py-5 md:py-6 px-10 md:px-16 rounded-xl shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                           {isProcessing ? <Loader2 className="animate-spin" size={24}/> : <Unlock size={24} />} 
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

        {/* STATE 2: SUCCESS (UNLOCKED) */}
        {pdfUrl && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white overflow-y-auto">
             <div className="w-full max-w-5xl flex gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20">
                   <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
                </div>
                
                <div className="flex-1 max-w-xl space-y-8 animate-in slide-in-from-bottom duration-500">
                    <div className="mb-8">
                       <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
                    </div>
                    
                    <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-2xl shadow-blue-100 text-center relative overflow-hidden">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                           <ShieldOff size={40} strokeWidth={3} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">{T.success_title[lang]}</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">{T.success_desc[lang]}</p>
                        
                        <div className="flex flex-col gap-4">
                           <a href={pdfUrl} download={`Unlocked_${file?.name}`} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
                              <Download size={24} /> {T.download_btn[lang]}
                           </a>
                           <button onClick={resetAll} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider">
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
        )}

        {/* STATE 3: INPUT PASSWORD (LOCKED) */}
        {file && !pdfUrl && isEncrypted && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50 overflow-y-auto">
             <div className="max-w-md w-full animate-in zoom-in-95 duration-500">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl shadow-blue-100 relative overflow-hidden">
                    {/* Top Glow */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-orange-400"/>

                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-4 ring-red-50/50">
                        <KeyRound size={32} />
                    </div>
                    
                    <h2 className="text-xl font-black text-slate-800 mb-2">{T.title_locked[lang]}</h2>
                    <p className="text-xs md:text-sm text-slate-500 mb-6 px-4 font-medium leading-relaxed">{T.desc_locked[lang]}</p>
                    
                    <div className="text-left space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">{T.input_label[lang]}</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-colors pr-14 ${errorMsg ? 'border-red-500 bg-red-50 text-red-900' : 'border-slate-200 focus:border-blue-500 bg-slate-50 focus:bg-white'}`}
                                    placeholder={T.input_placeholder[lang]}
                                    autoFocus
                                />
                                <button 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-bold bg-white border border-slate-200 px-2 py-1 rounded transition-colors uppercase"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {errorMsg && (
                                <div className="mt-2 flex items-center gap-2 text-red-600 text-xs font-bold animate-pulse bg-red-50 p-2 rounded-lg border border-red-100">
                                    <AlertCircle size={14}/> {errorMsg}
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleUnlock} 
                            disabled={isUnlocking || !password}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 text-sm active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 uppercase tracking-widest"
                        >
                            {isUnlocking ? <Loader2 className="animate-spin" size={18}/> : <Unlock size={18}/>}
                            {isUnlocking ? T.unlocking[lang] : T.btn_unlock[lang]}
                        </button>
                        
                        <button 
                            onClick={resetAll} 
                            className="w-full py-3 text-slate-400 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                        >
                            <X size={14}/> {T.cancel[lang]}
                        </button>
                    </div>
                </div>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold bg-white/50 py-2 px-4 rounded-full w-fit mx-auto border border-slate-100">
                    <CheckCircle2 size={12} className="text-green-500"/> {T.info_secure[lang]}
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
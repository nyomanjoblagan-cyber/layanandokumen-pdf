'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  ShieldCheck, FileText, CheckCircle2, Download, Globe, 
  X, ArrowLeft, Loader2, Settings2, Lock, Eye, EyeOff, KeyRound
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// 1. WORKER STABIL (Wajib)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export default function ProtectPdfPage() {
  // STATE UTAMA
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // PASSWORD SETTINGS
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // UI & BAHASA
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [mobileTab, setMobileTab] = useState<0 | 1>(1); 
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
    hero_title: { id: 'Lindungi PDF (Password)', en: 'Protect PDF (Password)' },
    hero_desc: { 
      id: 'Enkripsi file PDF Anda dengan password. Aman, proses dilakukan di browser Anda.', 
      en: 'Encrypt your PDF file with a password. Secure, processed locally in your browser.' 
    },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    drop_text: { id: 'atau tarik file ke sini', en: 'or drop file here' },
    
    // Tabs
    tab_preview: { id: 'Pratinjau', en: 'Preview' },
    tab_settings: { id: 'Atur Password', en: 'Set Password' },
    
    // Form Labels
    label_pass: { id: 'Password Baru', en: 'New Password' },
    label_confirm: { id: 'Ulangi Password', en: 'Confirm Password' },
    placeholder_pass: { id: 'Ketik password rahasia...', en: 'Type secret password...' },
    
    // Errors
    match_error: { id: 'Password tidak sama!', en: 'Passwords do not match!' },
    empty_error: { id: 'Password wajib diisi.', en: 'Password is required.' },
    
    // Actions
    save_btn: { id: 'Kunci PDF', en: 'Lock PDF' },
    
    // Status
    loading: { id: 'MEMUAT...', en: 'LOADING...' },
    saving: { id: 'MENGENKRIPSI...', en: 'ENCRYPTING...' },
    
    // Success
    success_title: { id: 'File Terkunci!', en: 'File Locked!' },
    success_desc: { id: 'Dokumen PDF Anda sekarang terlindungi password.', en: 'Your PDF document is now password protected.' },
    download_btn: { id: 'Download PDF', en: 'Download PDF' },
    back_home: { id: 'Proteksi Lagi', en: 'Protect Another' },
    cancel: { id: 'Tutup', en: 'Close' },
    
    // Info
    info_secure: { id: 'Proses Lokal: Password tidak dikirim ke server.', en: 'Local Process: Password is never sent to server.' }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  // --- 4. RENDER PREVIEW ---
  const processFile = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') {
        alert("Mohon pilih file PDF.");
        return;
    }
    setFile(uploadedFile);
    setIsProcessing(true);
    setPreviewImage(null);
    setPdfUrl(null);
    setPassword('');
    setConfirmPassword('');
    setErrorMsg('');

    try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        const viewport = page.getViewport({ scale: 0.6 }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            setPreviewImage(canvas.toDataURL());
        }
        setMobileTab(1); // Auto switch ke tab password di mobile

    } catch (error) {
        console.error(error);
        alert("Gagal membaca file PDF (Mungkin file sudah terkunci).");
        setFile(null);
    } finally {
        setIsProcessing(false);
    }
  };

  // --- 5. ENGINE ENKRIPSI ---
  const handleProtect = async () => {
    if (!file) return;
    
    if (!password) {
        setErrorMsg(T.empty_error[lang]);
        return;
    }
    if (password !== confirmPassword) {
        setErrorMsg(T.match_error[lang]);
        return;
    }
    setErrorMsg('');
    setIsSaving(true);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        // ENKRIPSI DOKUMEN
        // Kita gunakan 'any' casting karena method encrypt() ada tapi tipe-nya ketat
        const encryptionOptions = {
            userPassword: password,
            ownerPassword: password, // Owner password sama biar gampang
            permissions: {
                printing: 'highResolution',
                modifying: false,
                copying: false,
                annotating: false,
                fillingForms: false,
                contentAccessibility: false,
                documentAssembly: false,
            },
        };

        (pdfDoc as any).encrypt(encryptionOptions);

        const pdfBytes = await pdfDoc.save();
        
        // FIX BLOB ERROR
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);

    } catch (error) {
        console.error(error);
        alert("Gagal memproses PDF.");
    } finally {
        setIsSaving(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPreviewImage(null);
    setPdfUrl(null);
    setPassword('');
    setConfirmPassword('');
    setMobileTab(1);
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans relative selection:bg-blue-100 selection:text-blue-700 flex flex-col overflow-hidden">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><ShieldCheck size={20} /></div>
          <span className="font-bold text-xl tracking-tight text-slate-900 italic uppercase">Lock<span className="text-blue-600">PDF</span></span>
        </Link>
        <div className="flex items-center gap-4">
           <button onClick={toggleLang} className="text-[10px] font-bold px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all uppercase tracking-widest text-slate-600">{lang}</button>
           <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
              <X size={16} /> {T.cancel[lang]}
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
                           {isProcessing ? <Loader2 className="animate-spin" size={24}/> : <ShieldCheck size={24} />} 
                           {isProcessing ? T.loading[lang] : T.select_btn[lang]}
                        </button>
                        <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">{T.drop_text[lang]}</p>
                    </div>
                    
                    <div className="flex justify-center mt-8"><AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" /></div>
                    <input type="file" accept="application/pdf" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                 </div>

                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
             </div>
          </div>
        )}

        {/* STATE 2: SUCCESS */}
        {pdfUrl && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white overflow-y-auto">
             <div className="w-full max-w-5xl flex gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
                
                <div className="flex-1 max-w-xl space-y-8 animate-in slide-in-from-bottom duration-500">
                    <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
                    
                    <div className="bg-white border border-slate-200 rounded-[30px] p-10 shadow-2xl shadow-blue-100 text-center relative overflow-hidden">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                           <Lock size={40} strokeWidth={3} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">{T.success_title[lang]}</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">{T.success_desc[lang]}</p>
                        
                        <div className="flex flex-col gap-4">
                           <a href={pdfUrl} download={`Protected_${file?.name}`} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-widest text-sm cursor-pointer">
                              <Download size={20} /> {T.download_btn[lang]}
                           </a>
                           <button onClick={resetAll} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
                              <ArrowLeft size={16} /> {T.back_home[lang]}
                           </button>
                        </div>
                    </div>
                    
                    <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                </div>
                
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
             </div>
          </div>
        )}

        {/* STATE 3: EDITOR (SPLIT LAYOUT) */}
        {file && !pdfUrl && (
          <div className="flex flex-col h-full md:flex-row md:p-6 md:gap-6 max-w-[1600px] mx-auto w-full">
            
            {/* MOBILE TABS */}
            <div className="md:hidden flex border-b border-slate-200 bg-white sticky top-0 z-20 shrink-0">
               <button onClick={() => setMobileTab(1)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 1 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{T.tab_settings[lang]}</button>
               <button onClick={() => setMobileTab(0)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 0 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{T.tab_preview[lang]}</button>
            </div>

            {/* PREVIEW AREA (LEFT) */}
            <div className={`flex-1 flex flex-col h-full bg-slate-100 md:bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 md:p-8 overflow-hidden relative ${mobileTab === 0 ? 'flex' : 'hidden md:flex'}`}>
                {/* ADS TOP */}
                <div className="flex justify-center mb-4 shrink-0 overflow-hidden px-4">
                   <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                   <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>

                <div className="flex-1 flex items-center justify-center p-4 overflow-auto min-h-[400px]">
                    <div className="relative shadow-2xl border-4 border-white bg-white max-w-full">
                        {previewImage ? (
                           <img src={previewImage} alt="Preview" className="max-w-full max-h-[50vh] md:max-h-[600px] object-contain blur-[2px] transition-all duration-500 block" />
                        ) : (
                           <div className="w-[400px] h-[600px] flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={40}/></div>
                        )}
                        
                        {/* LOCK OVERLAY */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-sm">
                            <div className="bg-white p-4 rounded-full shadow-2xl mb-4 animate-bounce">
                                <Lock size={40} className="text-blue-600" />
                            </div>
                            <p className="text-xs font-black text-slate-800 bg-white/90 px-4 py-2 rounded-lg shadow-sm uppercase tracking-wider">
                                {file.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ADS BOTTOM */}
                <div className="flex justify-center mt-4 shrink-0 overflow-hidden px-4">
                   <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                   <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>
                
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase mt-4 mb-2 flex items-center justify-center gap-2">
                    <ShieldCheck size={14}/> {T.info_secure[lang]}
                </p>
            </div>

            {/* SIDEBAR (RIGHT) */}
            <div className={`w-full md:w-96 bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 p-6 overflow-y-auto shrink-0 ${mobileTab === 1 ? 'block' : 'hidden md:block'}`}>
                <h3 className="font-black text-[10px] text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2"><Settings2 size={14}/> {T.tab_settings[lang]}</h3>
                
                <div className="space-y-6">
                    {/* Password Field */}
                    <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase flex items-center gap-2"><KeyRound size={12}/> {T.label_pass[lang]}</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all pr-10"
                                placeholder={T.placeholder_pass[lang]}
                            />
                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Field */}
                    <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase flex items-center gap-2"><CheckCircle2 size={12}/> {T.label_confirm[lang]}</label>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(''); }}
                            className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all ${errorMsg ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-blue-500'}`}
                            placeholder={T.placeholder_pass[lang]}
                        />
                        {errorMsg && <p className="text-red-500 text-[10px] font-bold mt-2 flex items-center gap-1 uppercase tracking-wide"><X size={12}/> {errorMsg}</p>}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-center">
                        <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                    </div>

                    <button onClick={handleProtect} disabled={isSaving || !password} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-400 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 uppercase text-xs tracking-widest">
                        {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Lock size={18}/>} 
                        {isSaving ? T.saving[lang] : T.save_btn[lang]}
                    </button>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
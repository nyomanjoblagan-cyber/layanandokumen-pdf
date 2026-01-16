'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  Stamp, CheckCircle2, Download, Globe, 
  X, ArrowLeft, Loader2, Settings2, Type, Palette, LayoutGrid, RotateCw
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// 1. WORKER STABIL
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export default function WatermarkPdfPage() {
  // STATE UTAMA
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // SETTINGS WATERMARK
  const [text, setText] = useState('RAHASIA');
  const [fontSize, setFontSize] = useState(50);
  const [opacity, setOpacity] = useState(0.5);
  const [rotation, setRotation] = useState(-45);
  const [color, setColor] = useState('#FF0000');
  const [position, setPosition] = useState<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('center');

  // UI & BAHASA
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [mobileTab, setMobileTab] = useState<0 | 1>(0); 
  const [isLoaded, setIsLoaded] = useState(false); 
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LOGIKA BAHASA
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

  // --- KAMUS (SUDAH DIPERBAIKI) ---
  const T = {
    hero_title: { id: 'Watermark PDF', en: 'Watermark PDF' },
    hero_desc: { 
      id: 'Tambahkan teks tanda air (watermark) ke dokumen PDF Anda. Atur posisi, warna, dan transparansi.', 
      en: 'Add text watermark to your PDF documents. Customize position, color, and transparency.' 
    },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    drop_text: { id: 'atau tarik file ke sini', en: 'or drop file here' },
    
    // Tabs
    tab_preview: { id: 'Pratinjau', en: 'Preview' },
    tab_settings: { id: 'Pengaturan', en: 'Settings' },
    
    // Labels
    label_text: { id: 'Teks Watermark', en: 'Watermark Text' },
    label_style: { id: 'Gaya & Warna', en: 'Style & Color' },
    label_pos: { id: 'Posisi & Rotasi', en: 'Position & Rotation' },
    
    // Actions
    save_btn: { id: 'Pasang Watermark', en: 'Apply Watermark' },
    
    // Status (INI YANG TADI ERROR, SEKARANG SUDAH ADA)
    processing: { id: 'MEMUAT...', en: 'LOADING...' }, 
    saving: { id: 'MEMPROSES...', en: 'PROCESSING...' },
    
    // Success
    success_title: { id: 'Berhasil!', en: 'Success!' },
    success_desc: { id: 'Watermark telah ditambahkan ke dokumen.', en: 'Watermark has been added to document.' },
    download_btn: { id: 'Download PDF', en: 'Download PDF' },
    back_home: { id: 'Watermark Lagi', en: 'Watermark Another' },
    cancel: { id: 'Tutup', en: 'Close' },
  };

  // --- LOGIKA UTAMA ---
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
    setIsProcessing(true);
    setPreviewImage(null);
    setPdfUrl(null);

    try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        const viewport = page.getViewport({ scale: 0.8 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport } as any).promise;
            setPreviewImage(canvas.toDataURL());
        }
    } catch (error) {
        alert("Gagal membaca file PDF.");
        setFile(null);
    } finally {
        setIsProcessing(false);
    }
  };

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b };
  };

  const handleSave = async () => {
    if (!file) return;
    setIsSaving(true);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const { r, g, b } = hexToRgb(color);

        pages.forEach((page) => {
            const { width, height } = page.getSize();
            const textWidth = font.widthOfTextAtSize(text, fontSize);
            const textHeight = font.heightAtSize(fontSize);

            let x = 0, y = 0;

            switch (position) {
                case 'center':
                    x = width / 2 - textWidth / 2;
                    y = height / 2 - textHeight / 2;
                    break;
                case 'top-left':
                    x = 50; y = height - 100;
                    break;
                case 'top-right':
                    x = width - textWidth - 50; y = height - 100;
                    break;
                case 'bottom-left':
                    x = 50; y = 100;
                    break;
                case 'bottom-right':
                    x = width - textWidth - 50; y = 100;
                    break;
            }

            page.drawText(text, {
                x, y, size: fontSize, font,
                color: rgb(r, g, b),
                opacity,
                rotate: degrees(rotation),
            });
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        setPdfUrl(URL.createObjectURL(blob));

    } catch (error) {
        alert("Gagal menyimpan PDF.");
    } finally {
        setIsSaving(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPreviewImage(null);
    setPdfUrl(null);
    setText('CONFIDENTIAL');
    setMobileTab(0);
  };

  const getPreviewStyle = () => {
    let justify = 'center', align = 'center';
    if (position.includes('top')) align = 'flex-start';
    if (position.includes('bottom')) align = 'flex-end';
    if (position.includes('left')) justify = 'flex-start';
    if (position.includes('right')) justify = 'flex-end';

    return {
        display: 'flex',
        justifyContent: justify,
        alignItems: align,
        padding: '40px'
    };
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans relative selection:bg-blue-100 selection:text-blue-700 flex flex-col overflow-hidden">
      
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 text-white p-1 md:p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><Stamp size={18} /></div>
          <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900 italic uppercase">
              <span className="md:hidden">Watermark<span className="text-blue-600">PDF</span></span>
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

      <main className="flex-1 relative z-10 flex flex-col h-[calc(100dvh-56px)] md:h-auto">
        
        {/* STATE 1: UPLOAD */}
        {!file && (
          <div 
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-all overflow-y-auto ${isDraggingOver ? 'bg-blue-50/50' : ''}`}
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
                           {isProcessing ? <Loader2 className="animate-spin" size={24}/> : <Stamp size={24} />} 
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

        {/* STATE 2: SUCCESS */}
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
                    <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-2xl shadow-blue-100 text-center">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                           <CheckCircle2 size={40} strokeWidth={3} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">{T.success_title[lang]}</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">{T.success_desc[lang]}</p>
                        <div className="flex flex-col gap-4">
                           <a href={pdfUrl} download={`Watermarked_${file?.name}`} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
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

        {/* STATE 3: EDITOR */}
        {file && !pdfUrl && (
          <div className="flex flex-col h-full md:flex-row md:h-auto md:p-6 md:gap-6 max-w-7xl mx-auto w-full">
            
            <div className="md:hidden flex border-b border-slate-200 bg-white sticky top-0 z-20 shrink-0">
               <button onClick={() => setMobileTab(0)} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${mobileTab === 0 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{T.tab_preview[lang]}</button>
               <button onClick={() => setMobileTab(1)} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${mobileTab === 1 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{T.tab_settings[lang]}</button>
            </div>

            {/* PREVIEW */}
            <div className={`flex-1 flex flex-col h-full bg-slate-100 md:bg-white md:rounded-2xl md:shadow-xl md:border border-slate-200 md:p-8 overflow-hidden relative ${mobileTab === 0 ? 'flex' : 'hidden md:flex'}`}>
                <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                    <div className="relative shadow-2xl border-4 border-white bg-white max-w-full max-h-full">
                        {previewImage && <img src={previewImage} alt="Preview" className="max-w-full max-h-[60vh] md:max-h-[600px] object-contain" />}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={getPreviewStyle() as any}>
                            <div style={{ transform: `rotate(${rotation}deg)`, opacity, color, fontSize: `${Math.max(10, fontSize / 2)}px`, fontWeight: 'bold', whiteSpace: 'nowrap', fontFamily: 'Helvetica, sans-serif' }}>
                                {text || 'WATERMARK'}
                            </div>
                        </div>
                    </div>
                </div>
                <p className="hidden md:block text-center text-xs text-slate-400 font-bold uppercase tracking-widest mt-4">Preview Halaman 1</p>
            </div>

            {/* SETTINGS */}
            <div className={`w-full md:w-96 bg-white md:rounded-2xl md:shadow-xl md:border border-slate-200 p-6 overflow-y-auto md:h-fit shrink-0 ${mobileTab === 1 ? 'block' : 'hidden md:block'}`}>
                <h3 className="font-bold text-xs text-slate-400 uppercase mb-6 tracking-widest flex items-center gap-2"><Settings2 size={14}/> {T.tab_settings[lang]}</h3>
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase flex items-center gap-1"><Type size={12}/> {T.label_text[lang]}</label>
                        <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors" placeholder="Contoh: RAHASIA" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase flex items-center gap-1"><Palette size={12}/> {T.label_style[lang]}</label>
                        <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="flex gap-2 justify-between">
                                {['#FF0000', '#000000', '#0000FF', '#008000', '#808080'].map(c => (
                                    <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                                ))}
                                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded-full overflow-hidden cursor-pointer" />
                            </div>
                            <div className="pt-2">
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1"><span>Transparan</span><span>Jelas</span></div>
                                <input type="range" min="0.1" max="1" step="0.1" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1"><span>Kecil</span><span>Besar</span></div>
                                <input type="range" min="20" max="150" step="5" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase flex items-center gap-1"><LayoutGrid size={12}/> {T.label_pos[lang]}</label>
                        <div className="flex gap-4">
                            <div className="grid grid-cols-3 gap-1 w-24 h-24 bg-slate-100 p-1 rounded-lg">
                                {['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'].map((pos) => (
                                    <button key={pos} onClick={() => setPosition(pos as any)} disabled={['top', 'left', 'right', 'bottom'].includes(pos)} className={`rounded hover:bg-blue-100 transition-colors ${position === pos ? 'bg-blue-600 shadow-md' : 'bg-white'} ${['top', 'left', 'right', 'bottom'].includes(pos) ? 'opacity-30 cursor-not-allowed' : ''}`} />
                                ))}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase"><RotateCw size={10}/> Rotasi</div>
                                <div className="flex flex-col gap-2">
                                    {[0, -45, 45, 90].map(deg => (
                                        <button key={deg} onClick={() => setRotation(deg)} className={`py-1.5 text-[10px] font-bold rounded-lg border ${rotation === deg ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}>{deg}°</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-center">
                    <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                </div>
                <button onClick={handleSave} disabled={isSaving} className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 text-sm active:scale-95 transition-all flex items-center justify-center gap-2">
                    {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Stamp size={18}/>} {isSaving ? T.saving[lang] : T.save_btn[lang]}
                </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
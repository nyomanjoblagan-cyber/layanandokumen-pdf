'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  Hash, CheckCircle2, Download, Globe, 
  X, ArrowLeft, Loader2, Settings2, LayoutTemplate, 
  ArrowDownUp, Move, Palette, Type, MoveVertical
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// 1. SETUP WORKER STABIL (Wajib agar preview tampil)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export default function PageNumbersPage() {
  // STATE UTAMA
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // SETTINGS NOMOR
  const [startNumber, setStartNumber] = useState(1);
  const [fontSize, setFontSize] = useState(12);
  const [margin, setMargin] = useState(20); 
  const [color, setColor] = useState('#000000'); 
  const [fontFamily, setFontFamily] = useState<string>(StandardFonts.Helvetica);
  const [position, setPosition] = useState<'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'>('bottom-center');

  // UI STATE & BAHASA
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [mobileTab, setMobileTab] = useState<0 | 1>(0);
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
    hero_title: { id: 'Nomor Halaman PDF', en: 'PDF Page Numbers' },
    hero_desc: { id: 'Tambahkan penomoran halaman otomatis ke dokumen PDF Anda. Cepat, rapi, dan gratis.', en: 'Add automatic page numbering to your PDF documents. Fast, neat, and free.' },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    
    // Tabs Mobile
    tab_preview: { id: 'Pratinjau', en: 'Preview' },
    tab_settings: { id: 'Pengaturan', en: 'Settings' },
    
    // Sidebar Labels
    lbl_font: { id: 'Jenis Font', en: 'Font Family' },
    lbl_start: { id: 'Mulai Dari', en: 'Start From' },
    lbl_color: { id: 'Warna', en: 'Color' },
    lbl_style: { id: 'Ukuran & Margin', en: 'Size & Margin' },
    lbl_pos: { id: 'Posisi', en: 'Position' },
    
    // Actions
    btn_add: { id: 'Tambahkan Nomor', en: 'Add Numbers' },
    btn_download: { id: 'Download PDF', en: 'Download PDF' },
    btn_repeat: { id: 'Ulangi', en: 'Repeat' },
    btn_cancel: { id: 'Tutup', en: 'Close' },
    
    // Status
    loading: { id: 'MEMUAT...', en: 'LOADING...' },
    saving: { id: 'MEMPROSES...', en: 'PROCESSING...' },
    success_title: { id: 'Selesai!', en: 'Done!' },
    success_desc: { id: 'Nomor halaman berhasil ditambahkan.', en: 'Page numbers successfully added.' },
  };

  // --- 4. RENDER PREVIEW (DIJAMIN TAMPIL) ---
  const processFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsProcessing(true);
    setPdfUrl(null);
    try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        // Render High Quality
        const viewport = page.getViewport({ scale: 1.5 }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            setPreviewImage(canvas.toDataURL('image/png'));
        }
    } catch (error) { 
        alert("Gagal membaca file PDF."); 
        setFile(null); 
    } finally { 
        setIsProcessing(false); 
    }
  };

  // --- 5. LOGIKA BAKE NUMBER KE PDF ---
  const handleSave = async () => {
    if (!file) return;
    setIsSaving(true);
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        
        // Embed Font
        let font;
        if (fontFamily === StandardFonts.TimesRoman) font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        else if (fontFamily === StandardFonts.Courier) font = await pdfDoc.embedFont(StandardFonts.Courier);
        else font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Parse Warna
        const r = parseInt(color.slice(1, 3), 16) / 255;
        const g = parseInt(color.slice(3, 5), 16) / 255;
        const b = parseInt(color.slice(5, 7), 16) / 255;

        pages.forEach((page, idx) => {
            const { width, height } = page.getSize();
            const numText = `${startNumber + idx}`;
            
            // Hitung Posisi
            const textWidth = font.widthOfTextAtSize(numText, fontSize);
            const textHeight = font.heightAtSize(fontSize);
            
            let x = 0, y = 0;
            const m = margin; // Margin value

            // Y Position (Top/Bottom)
            if (position.includes('top')) {
                y = height - m - textHeight;
            } else {
                y = m;
            }

            // X Position (Left/Center/Right)
            if (position.includes('left')) {
                x = m;
            } else if (position.includes('center')) {
                x = (width / 2) - (textWidth / 2);
            } else {
                x = width - m - textWidth;
            }

            page.drawText(numText, { x, y, size: fontSize, font, color: rgb(r, g, b) });
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        setPdfUrl(URL.createObjectURL(blob));
    } catch (error) { alert("Gagal menyimpan PDF."); } finally { setIsSaving(false); }
  };

  // --- 6. STYLE PREVIEW NOMOR (REAL-TIME) ---
  const getPreviewNumberStyle = () => {
    // Simulasi posisi di atas gambar preview
    const style: React.CSSProperties = {
        position: 'absolute', 
        fontSize: `${Math.max(10, fontSize)}px`, // Min 10px biar kebaca di preview
        fontWeight: 'bold', 
        color: color,
        fontFamily: fontFamily.includes('Times') ? 'serif' : fontFamily.includes('Courier') ? 'monospace' : 'sans-serif',
        lineHeight: 1,
        pointerEvents: 'none'
    };
    
    // Margin simulasi (skala kecil karena preview gambar kecil)
    const m = `${margin / 3}%`; 

    if (position.includes('top')) style.top = m; else style.bottom = m;
    
    if (position.includes('left')) style.left = m;
    else if (position.includes('right')) style.right = m;
    else {
        style.left = '50%'; 
        style.transform = 'translateX(-50%)';
    }
    
    return style;
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col overflow-hidden">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><Hash size={20} /></div>
          <span className="font-bold text-xl tracking-tight text-slate-900 italic uppercase">Layanan<span className="text-blue-600">Dokumen</span></span>
        </Link>
        <div className="flex items-center gap-4">
           <button onClick={toggleLang} className="text-[10px] font-bold px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all uppercase tracking-widest text-slate-600">{lang}</button>
           <Link href="/" className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-500 transition-colors bg-red-50 px-4 py-2 rounded-lg">
              <X size={16} /> {T.btn_cancel[lang]}
           </Link>
        </div>
      </nav>

      <main className="flex-1 relative z-10 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        
        {/* VIEW 1: UPLOAD */}
        {!file && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#F8FAFC] overflow-y-auto">
             <div className="w-full max-w-5xl flex gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
                
                <div className="flex-1 max-w-2xl space-y-10 animate-in fade-in zoom-in duration-500 py-10">
                    <div className="flex justify-center"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                    
                    <div className="space-y-4">
                      <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{T.hero_title[lang]}</h1>
                      <p className="text-slate-500 font-medium text-lg">{T.hero_desc[lang]}</p>
                    </div>

                    <button onClick={() => fileInputRef.current?.click()} className="group relative bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-5 px-12 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto uppercase tracking-widest">
                       <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl"/>
                       {isProcessing ? <Loader2 className="animate-spin" size={24}/> : <Hash size={24} />} {isProcessing ? T.loading[lang] : T.select_btn[lang]}
                    </button>
                    
                    <div className="flex justify-center"><AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" /></div>
                    <input type="file" accept="application/pdf" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} className="hidden" />
                 </div>

                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
             </div>
          </div>
        )}

        {/* VIEW 2: DOWNLOAD */}
        {pdfUrl && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white overflow-y-auto">
             <div className="w-full max-w-5xl flex gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
                
                <div className="flex-1 max-w-lg space-y-8 animate-in slide-in-from-bottom duration-500">
                    <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
                    
                    <div className="bg-white border border-slate-200 rounded-[30px] p-10 text-center shadow-2xl">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><CheckCircle2 size={40} /></div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">{T.success_title[lang]}</h2>
                        <p className="text-slate-500 font-medium mb-8">{T.success_desc[lang]}</p>
                        
                        <div className="flex flex-col gap-4">
                           <a href={pdfUrl} download={`Numbered_${file?.name}`} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-widest text-sm"><Download size={20} /> {T.btn_download[lang]}</a>
                           <button onClick={() => { setFile(null); setPdfUrl(null); }} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"><ArrowLeft size={16} /> {T.btn_repeat[lang]}</button>
                        </div>
                    </div>
                    
                    <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                </div>
                
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
             </div>
          </div>
        )}

        {/* VIEW 3: EDITOR WORKSPACE */}
        {file && !pdfUrl && (
          <div className="flex flex-col h-full md:flex-row w-full bg-slate-50">
            {/* MOBILE TABS */}
            <div className="md:hidden flex border-b border-slate-200 bg-white shrink-0">
               <button onClick={() => setMobileTab(0)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 0 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{T.tab_preview[lang]}</button>
               <button onClick={() => setMobileTab(1)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 1 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{T.tab_settings[lang]}</button>
            </div>

            {/* KIRI: PREVIEW AREA */}
            <div className={`flex-1 flex flex-col h-full bg-slate-100/50 relative overflow-hidden ${mobileTab === 0 ? 'flex' : 'hidden md:flex'}`}>
                {/* IKLAN ATAS */}
                <div className="flex justify-center p-4 shrink-0">
                   <div className="hidden md:block shadow-lg rounded-xl overflow-hidden bg-white"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                   <div className="md:hidden shadow-lg rounded-xl overflow-hidden bg-white"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>
                
                {/* CANVAS */}
                <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-auto">
                    <div className="relative shadow-2xl border-8 border-white bg-white select-none max-w-full max-h-full transition-all duration-300">
                        {previewImage ? (
                           <img src={previewImage} alt="Preview" className="max-w-full max-h-[50vh] md:max-h-[600px] object-contain block" />
                        ) : (
                           <div className="w-[400px] h-[600px] flex items-center justify-center bg-white text-slate-300"><Loader2 className="animate-spin" size={40}/></div>
                        )}
                        {/* NOMOR PREVIEW (REAL-TIME) */}
                        <div style={getPreviewNumberStyle()}>{startNumber}</div>
                    </div>
                </div>

                {/* IKLAN BAWAH */}
                <div className="flex justify-center p-4 shrink-0">
                   <div className="hidden md:block shadow-lg rounded-xl overflow-hidden bg-white"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>
            </div>

            {/* KANAN: SIDEBAR SETTINGS */}
            <div className={`w-full md:w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 z-40 shadow-2xl ${mobileTab === 1 ? 'flex h-full' : 'hidden md:flex h-full'}`}>
                <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                   <Settings2 size={16} className="text-slate-400"/>
                   <h3 className="font-black text-xs text-slate-500 uppercase tracking-widest">{T.tab_settings[lang]}</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* FONT */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Type size={12}/> {T.lbl_font[lang]}</label>
                        <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer">
                              <option value={StandardFonts.Helvetica}>Sans Serif (Helvetica)</option>
                              <option value={StandardFonts.TimesRoman}>Serif (Times)</option>
                              <option value={StandardFonts.Courier}>Monospace (Courier)</option>
                        </select>
                    </div>

                    {/* START NUMBER */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><ArrowDownUp size={12}/> {T.lbl_start[lang]}</label>
                        <input type="number" min="1" value={startNumber} onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 text-center" />
                    </div>

                    {/* COLOR */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Palette size={12}/> {T.lbl_color[lang]}</label>
                        <div className="flex gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                            {['#000000', '#EF4444', '#3B82F6', '#10B981'].map(c => (
                                <button key={c} onClick={() => setColor(c)} className={`flex-1 h-8 rounded-lg border-2 transition-all ${color === c ? 'border-slate-800 scale-105 shadow-sm' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c }} />
                            ))}
                            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 p-0 bg-transparent border-none cursor-pointer" />
                        </div>
                    </div>

                    {/* SIZE & MARGIN */}
                    <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2"><span>SIZE</span><span>{fontSize}px</span></div>
                            <input type="range" min="8" max="48" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-full cursor-pointer" />
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2"><span>MARGIN</span><span>{margin}px</span></div>
                            <input type="range" min="10" max="100" step="5" value={margin} onChange={(e) => setMargin(parseInt(e.target.value))} className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-full cursor-pointer" />
                        </div>
                    </div>

                    {/* POSITION GRID */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><LayoutTemplate size={12}/> {T.lbl_pos[lang]}</label>
                        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                            {['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'].map((pos) => (
                                <button key={pos} onClick={() => setPosition(pos as any)} className={`h-10 rounded-lg border-2 transition-all hover:bg-white flex items-center justify-center ${position === pos ? 'bg-blue-600 border-blue-600 shadow-md text-white' : 'bg-white border-slate-100 text-slate-300'}`}>
                                   <div className={`w-1.5 h-1.5 rounded-full ${position === pos ? 'bg-white' : 'bg-slate-300'}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-center border-t border-slate-100"><AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" /></div>
                </div>

                <div className="p-6 border-t border-slate-200 bg-white">
                    <button onClick={handleSave} disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Hash size={18}/>} {isSaving ? T.saving[lang] : T.btn_add[lang]}
                    </button>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
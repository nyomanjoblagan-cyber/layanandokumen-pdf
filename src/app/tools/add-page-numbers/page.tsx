'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  Hash, CheckCircle2, Download, 
  X, ArrowLeft, Loader2, Settings2, LayoutTemplate, 
  ArrowDownUp, Palette, Type, Plus, Trash2,
  ChevronLeft, ChevronRight, Layers
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// 1. SETUP WORKER
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

type Position = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
type NumberStyle = '1' | 'i' | 'I' | 'a' | 'A';

// TIPE DATA FLEXIBLE RANGE
interface PageRange {
  id: string;
  startPage: number; // Halaman Fisik Mulai
  endPage: number;   // Halaman Fisik Akhir
  numberStyle: NumberStyle;
  startFrom: number; // Mulai hitung dari angka berapa?
  position: Position;
  fontSize: number;
}

export default function PageNumbersPage() {
  // STATE UTAMA
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // STATE PDF
  const [pdfDocProxy, setPdfDocProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0); 
  const [currPage, setCurrPage] = useState(1);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // --- GOD MODE SETTINGS (RANGES) ---
  const [ranges, setRanges] = useState<PageRange[]>([]);
  
  // Global Settings (Biar gak setting satu2 kalau mau sama semua)
  const [fontFamily, setFontFamily] = useState<string>(StandardFonts.TimesRoman); 
  const [color, setColor] = useState('#000000'); 
  const [margin, setMargin] = useState(20);

  // UI STATE
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [mobileTab, setMobileTab] = useState<0 | 1>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const T = {
    hero_title: { id: 'Master Nomor Halaman PDF', en: 'Master PDF Page Numbers' },
    hero_desc: { id: 'Kontrol penuh. Atur bagian Romawi, lalu pindah ke Arab, ganti posisi tiap bab. Tanpa batas.', en: 'Full control. Set Roman sections, switch to Arabic, change position per chapter. Limitless.' },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    tab_preview: { id: 'Pratinjau', en: 'Preview' },
    tab_settings: { id: 'Aturan Halaman', en: 'Page Rules' },
    
    lbl_font: { id: 'Jenis Font', en: 'Font Family' },
    lbl_color: { id: 'Warna Teks', en: 'Text Color' },
    
    btn_add_range: { id: 'Tambah Bagian', en: 'Add Section' },
    btn_add: { id: 'Proses PDF', en: 'Process PDF' },
    btn_download: { id: 'Download PDF', en: 'Download PDF' },
    btn_repeat: { id: 'Ulangi', en: 'Repeat' },
    btn_cancel: { id: 'Tutup', en: 'Close' },
    
    loading: { id: 'MEMUAT...', en: 'LOADING...' },
    saving: { id: 'MEMPROSES...', en: 'PROCESSING...' },
    success_title: { id: 'Selesai!', en: 'Done!' },
    success_desc: { id: 'Dokumen Anda siap diunduh.', en: 'Your document is ready to download.' },
    page: { id: 'Hal', en: 'Page' },
    to: { id: 's/d', en: 'to' }
  };

  // --- LOGIC RANGE MANAGEMENT ---
  const addRange = () => {
      // Otomatis deteksi halaman selanjutnya yang belum tercover
      const lastRange = ranges[ranges.length - 1];
      const newStart = lastRange ? lastRange.endPage + 1 : 1;
      
      if (newStart > totalPages) {
          alert("Semua halaman sudah tercover!");
          return;
      }

      const newRange: PageRange = {
          id: Date.now().toString(),
          startPage: newStart,
          endPage: totalPages, // Default sampai akhir
          numberStyle: '1',
          startFrom: 1,
          position: 'bottom-center',
          fontSize: 12
      };
      setRanges([...ranges, newRange]);
  };

  const updateRange = (id: string, field: keyof PageRange, value: any) => {
      setRanges(ranges.map(r => {
          if (r.id !== id) return r;
          
          // Validasi agar Start tidak melebihi End
          if (field === 'startPage' && value > r.endPage) return r;
          // Validasi agar End tidak melebihi Total Pages
          if (field === 'endPage' && value > totalPages) value = totalPages;

          return { ...r, [field]: value };
      }));
  };

  const removeRange = (id: string) => {
      setRanges(ranges.filter(r => r.id !== id));
  };

  // --- HELPER: FORMATTER ---
  const toRoman = (num: number): string => {
    if (num < 1) return "";
    const lookup: { [key: string]: number } = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
    let roman = '', i;
    for ( i in lookup ) {
      while ( num >= lookup[i] ) {
        roman += i;
        num -= lookup[i];
      }
    }
    return roman.toLowerCase();
  }

  const toAlpha = (num: number): string => {
    let s = '';
    while (num > 0) {
      num--;
      s = String.fromCharCode(97 + (num % 26)) + s;
      num = Math.floor(num / 26);
    }
    return s;
  }

  const formatNumber = (num: number, style: NumberStyle): string => {
      switch (style) {
          case '1': return num.toString();
          case 'i': return toRoman(num);
          case 'I': return toRoman(num).toUpperCase();
          case 'a': return toAlpha(num);
          case 'A': return toAlpha(num).toUpperCase();
          default: return num.toString();
      }
  }

  // --- LOGIC: FIND ACTIVE CONFIG FOR PAGE ---
  const getPageConfig = (pageIndex: number) => {
      const physPage = pageIndex + 1;
      // Cari range yang mencakup halaman ini
      // Kita pakai Array.findLast atau find biasa tapi pastikan urutan benar. 
      // Karena user bisa bikin range tumpang tindih (walau sebaiknya jangan), kita ambil yang terakhir cocok.
      const range = ranges.find(r => physPage >= r.startPage && physPage <= r.endPage);
      
      if (!range) return null; // Tidak ada nomor di halaman ini

      // Hitung angka relatif
      // Contoh: Range Hal 4-10, Start From 1.
      // Jika kita di Hal 4 -> (4 - 4) + 1 = 1
      const relativeNum = (physPage - range.startPage) + range.startFrom;
      
      return {
          text: formatNumber(relativeNum, range.numberStyle),
          pos: range.position,
          size: range.fontSize
      };
  }

  // --- PREVIEW RENDER ---
  const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNumber: number) => {
    try {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            setPreviewImage(canvas.toDataURL('image/png'));
        }
    } catch (e) { console.error(e); }
  };

  const processFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsProcessing(true);
    setPdfUrl(null);
    setCurrPage(1);
    try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setPdfDocProxy(pdf);
        const pagesCount = pdf.numPages;
        setTotalPages(pagesCount);
        
        // AUTO CREATE DEFAULT RANGE (1 - End)
        setRanges([{
            id: 'default',
            startPage: 1,
            endPage: pagesCount,
            numberStyle: '1',
            startFrom: 1,
            position: 'bottom-center',
            fontSize: 12
        }]);

        await renderPage(pdf, 1); 
    } catch (error) { alert("Gagal membaca file PDF."); setFile(null); } finally { setIsProcessing(false); }
  };

  const changePage = (offset: number) => {
      if (!pdfDocProxy) return;
      const newPage = currPage + offset;
      if (newPage >= 1 && newPage <= totalPages) {
          setCurrPage(newPage);
          renderPage(pdfDocProxy, newPage);
      }
  };

  // --- SAVE LOGIC ---
  const handleSave = async () => {
    if (!file) return;
    setIsSaving(true);
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();

        let font;
        if (fontFamily === StandardFonts.TimesRoman) font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        else if (fontFamily === StandardFonts.Courier) font = await pdfDoc.embedFont(StandardFonts.Courier);
        else font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const r = parseInt(color.slice(1, 3), 16) / 255;
        const g = parseInt(color.slice(3, 5), 16) / 255;
        const b = parseInt(color.slice(5, 7), 16) / 255;

        pages.forEach((page, idx) => {
            const config = getPageConfig(idx);
            
            if (config) {
                const { width, height } = page.getSize();
                const textWidth = font.widthOfTextAtSize(config.text, config.size);
                const textHeight = font.heightAtSize(config.size);
                
                let x = 0, y = 0;
                const m = margin; 

                if (config.pos.includes('top')) y = height - m - textHeight + (textHeight / 4); 
                else y = m;

                if (config.pos.includes('left')) x = m;
                else if (config.pos.includes('center')) x = (width / 2) - (textWidth / 2);
                else x = width - m - textWidth;

                page.drawText(config.text, { x, y, size: config.size, font, color: rgb(r, g, b) });
            }
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        setPdfUrl(URL.createObjectURL(blob));
    } catch (error) { alert("Gagal menyimpan PDF."); } finally { setIsSaving(false); }
  };

  // --- PREVIEW STYLE ---
  const getPreviewData = () => {
      return getPageConfig(currPage - 1);
  };

  const getPreviewStyle = (pos: Position, fontSize: number) => {
    const style: React.CSSProperties = {
        position: 'absolute', 
        fontSize: `${Math.max(10, fontSize)}px`,
        fontWeight: 'normal', 
        color: color,
        fontFamily: fontFamily.includes('Times') ? 'serif' : fontFamily.includes('Courier') ? 'monospace' : 'sans-serif',
        lineHeight: 1,
        pointerEvents: 'none',
        whiteSpace: 'nowrap'
    };
    const mPct = (margin / 6) + '%'; 
    if (pos.includes('top')) style.top = mPct; else style.bottom = mPct;
    if (pos.includes('left')) style.left = mPct;
    else if (pos.includes('right')) style.right = mPct;
    else { style.left = '50%'; style.transform = 'translateX(-50%)'; }
    return style;
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col overflow-hidden">
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
                           <button onClick={() => { setFile(null); setPdfUrl(null); setCurrPage(1); setRanges([]); }} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"><ArrowLeft size={16} /> {T.btn_repeat[lang]}</button>
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
            <div className="md:hidden flex border-b border-slate-200 bg-white shrink-0">
               <button onClick={() => setMobileTab(0)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 0 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{T.tab_preview[lang]}</button>
               <button onClick={() => setMobileTab(1)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 1 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{T.tab_settings[lang]}</button>
            </div>

            {/* PREVIEW */}
            <div className={`flex-1 flex flex-col h-full bg-slate-100/50 relative overflow-hidden ${mobileTab === 0 ? 'flex' : 'hidden md:flex'}`}>
                <div className="flex justify-center p-4 shrink-0">
                   <div className="hidden md:block shadow-lg rounded-xl overflow-hidden bg-white"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                   <div className="md:hidden shadow-lg rounded-xl overflow-hidden bg-white"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>

                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-white/90 backdrop-blur p-1.5 rounded-full shadow-lg border border-slate-200 items-center">
                     <button onClick={() => changePage(-1)} disabled={currPage <= 1} className="p-1.5 hover:bg-white rounded-full text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"><ChevronLeft size={16}/></button>
                     <span className="text-[10px] font-bold text-slate-500 w-24 text-center">{T.page[lang]} {currPage} / {totalPages}</span>
                     <button onClick={() => changePage(1)} disabled={currPage >= totalPages} className="p-1.5 hover:bg-white rounded-full text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"><ChevronRight size={16}/></button>
                </div>
                
                <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-auto">
                    <div className="relative shadow-2xl border-8 border-white bg-white select-none max-w-full max-h-full transition-all duration-300">
                        {previewImage ? (
                           <img src={previewImage} alt="Preview" className="max-w-full max-h-[50vh] md:max-h-[600px] object-contain block" />
                        ) : (
                           <div className="w-[400px] h-[600px] flex items-center justify-center bg-white text-slate-300"><Loader2 className="animate-spin" size={40}/></div>
                        )}
                        
                        {/* REAL TIME PREVIEW OVERLAY */}
                        {getPreviewData() && (
                            <div style={getPreviewStyle(getPreviewData()!.pos, getPreviewData()!.size)}>
                                {getPreviewData()!.text}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-center p-4 shrink-0">
                   <div className="hidden md:block shadow-lg rounded-xl overflow-hidden bg-white"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>
            </div>

            {/* SETTINGS - THE RANGE LIST */}
            <div className={`w-full md:w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 z-40 shadow-2xl ${mobileTab === 1 ? 'flex h-full' : 'hidden md:flex h-full'}`}>
                <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                   <Settings2 size={16} className="text-slate-400"/>
                   <h3 className="font-black text-xs text-slate-500 uppercase tracking-widest">{T.tab_settings[lang]}</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {/* GLOBAL STYLE */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Type size={12}/> {T.lbl_font[lang]}</label>
                             <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold text-slate-700 outline-none">
                                <option value={StandardFonts.TimesRoman}>Times</option>
                                <option value={StandardFonts.Helvetica}>Arial</option>
                                <option value={StandardFonts.Courier}>Courier</option>
                             </select>
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Palette size={12}/> {T.lbl_color[lang]}</label>
                             <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-[38px] bg-slate-50 border border-slate-200 rounded-lg p-1 cursor-pointer" />
                        </div>
                    </div>

                    {/* RANGE LIST */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2"><Layers size={12}/> Bagian Halaman (Ranges)</label>
                            <button onClick={addRange} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-blue-100 transition-colors">
                                <Plus size={12}/> {T.btn_add_range[lang]}
                            </button>
                        </div>

                        {ranges.map((range, idx) => (
                            <div key={range.id} className="bg-white border-2 border-slate-100 rounded-xl p-3 shadow-sm hover:border-blue-200 transition-all space-y-3 relative group">
                                {/* Delete Btn */}
                                {ranges.length > 1 && (
                                    <button onClick={() => removeRange(range.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                                )}
                                
                                <div className="flex items-center gap-2">
                                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded">#{idx + 1}</span>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                        <span>Hal</span>
                                        <input type="number" value={range.startPage} onChange={(e) => updateRange(range.id, 'startPage', parseInt(e.target.value))} className="w-12 bg-slate-50 border border-slate-200 rounded px-1 py-1 text-center" />
                                        <span>{T.to[lang]}</span>
                                        <input type="number" value={range.endPage} onChange={(e) => updateRange(range.id, 'endPage', parseInt(e.target.value))} className="w-12 bg-slate-50 border border-slate-200 rounded px-1 py-1 text-center" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {/* Number Style */}
                                    <div>
                                        <label className="text-[9px] font-bold text-slate-400 block mb-1">GAYA</label>
                                        <select value={range.numberStyle} onChange={(e) => updateRange(range.id, 'numberStyle', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 outline-none">
                                            <option value="1">1, 2, 3</option>
                                            <option value="i">i, ii, iii</option>
                                            <option value="I">I, II, III</option>
                                            <option value="a">a, b, c</option>
                                            <option value="A">A, B, C</option>
                                        </select>
                                    </div>
                                    {/* Start From */}
                                    <div>
                                        <label className="text-[9px] font-bold text-slate-400 block mb-1">MULAI DARI</label>
                                        <input type="number" value={range.startFrom} onChange={(e) => updateRange(range.id, 'startFrom', parseInt(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 outline-none text-center" />
                                    </div>
                                </div>

                                {/* Position Grid Mini */}
                                <div>
                                    <label className="text-[9px] font-bold text-slate-400 block mb-1">POSISI</label>
                                    <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                                        {['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'].map((pos) => (
                                            <button key={pos} onClick={() => updateRange(range.id, 'position', pos as Position)} className={`h-6 rounded border flex items-center justify-center ${range.position === pos ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200 hover:bg-slate-100'}`}>
                                            <div className={`w-1 h-1 rounded-full ${range.position === pos ? 'bg-white' : 'bg-slate-300'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
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
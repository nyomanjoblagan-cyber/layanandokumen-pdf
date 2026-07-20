'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  FilePenLine, CheckCircle2, Download, X, ArrowLeft, Loader2, Settings2, 
  Type, Palette, Trash2, ZoomIn, ZoomOut, Maximize2, 
  Bold, Italic, MousePointer2, Hand, Scaling
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// 1. WORKER STABIL
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

interface TextElement {
  id: string; 
  text: string; 
  x: number; 
  y: number; 
  fontSize: number; 
  color: string; 
  fontFamily: string; 
  isBold: boolean; 
  isItalic: boolean;
}

export default function EditPdfPage() {
  // --- STATE ---
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputFocusRef = useRef<HTMLInputElement>(null);

  const [elements, setElements] = useState<TextElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // VIEWPORT
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // INTERACTION REFS
  const dragItem = useRef<{ id: string, startX: number, startY: number, initialX: number, initialY: number } | null>(null);
  const resizeItem = useRef<{ id: string, startY: number, initialSize: number } | null>(null);
  const panStart = useRef<{ x: number, y: number } | null>(null);

  // DEFAULTS
  const [currentFontSize, setCurrentFontSize] = useState(20);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentFont, setCurrentFont] = useState('Helvetica');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  // LANG
  const [lang, setLang] = useState<'id' | 'en'>('id'); 
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user-lang') as 'id' | 'en';
    if (saved) setLang(saved);
    setIsLoaded(true);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' && !editingId) {
            e.preventDefault(); 
            setIsSpacePressed(true);
        }
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !editingId) {
            setElements(prev => prev.filter(el => el.id !== selectedId));
            setSelectedId(null);
        }
        if (e.key === 'Enter' && editingId) {
            setEditingId(null); 
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'Space') setIsSpacePressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedId, editingId]);

  // Auto focus input
  useEffect(() => {
      if (editingId && inputFocusRef.current) {
          inputFocusRef.current.focus();
          inputFocusRef.current.select();
      }
  }, [editingId]);

  const toggleLang = () => {
    const newLang = lang === 'id' ? 'en' : 'id';
    setLang(newLang);
    localStorage.setItem('user-lang', newLang);
  };

  const T = {
    title: { id: 'Studio Editor PDF', en: 'PDF Studio Editor' },
    desc: { id: 'Editor kelas profesional. Klik 2x untuk ngetik, Tarik titik pojok untuk resize.', en: 'Professional editor. Double click to type, Drag corner dot to resize.' },
    btn_upload: { id: 'Buka File PDF', en: 'Open PDF File' },
    btn_save: { id: 'Simpan PDF', en: 'Save PDF' },
    btn_download: { id: 'Download Hasil', en: 'Download Result' },
    btn_cancel: { id: 'Keluar', en: 'Exit' },
    loading: { id: 'MEMPROSES...', en: 'PROCESSING...' },
    btn_save_lbl: { id: 'Simpan', en: 'Save' },
    success: { id: 'Selesai!', en: 'Done!' },
    lbl_font: { id: 'Jenis Font', en: 'Font Family' },
    lbl_style: { id: 'Gaya Teks', en: 'Text Style' },
    lbl_size: { id: 'Ukuran', en: 'Size' },
    lbl_color: { id: 'Warna', en: 'Color' },
    hint_pan: { id: 'Tahan SPASI + Klik Geser', en: 'Hold SPACE + Drag' },
    hint_edit: { id: 'Mode Edit Aktif', en: 'Edit Mode Active' },
  };

  // --- PROCESS PDF ---
  const processFile = async (f: File) => {
    setFile(f);
    setIsProcessing(true);
    setElements([]); setPdfUrl(null); setZoom(0.8); setPan({ x: 0, y: 0 });

    try {
        const arrayBuffer = await f.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            setPreviewImage(canvas.toDataURL('image/png'));
        }
    } catch (e) { alert("Gagal memuat PDF."); setFile(null); } finally { setIsProcessing(false); }
  };

  // --- MOUSE INTERACTION (GLOBAL LISTENER) ---
  useEffect(() => {
      const handleGlobalMove = (e: MouseEvent) => {
          // 1. PANNING
          if (panStart.current) {
              const dx = e.clientX - panStart.current.x;
              const dy = e.clientY - panStart.current.y;
              setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
              panStart.current = { x: e.clientX, y: e.clientY };
              return;
          }

          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();

          // 2. DRAGGING (MOVE TEXT)
          if (dragItem.current) {
              const { id, startX, startY, initialX, initialY } = dragItem.current;
              const deltaXPixel = e.clientX - startX;
              const deltaYPixel = e.clientY - startY;
              const deltaXPercent = (deltaXPixel / rect.width) * 100;
              const deltaYPercent = (deltaYPixel / rect.height) * 100;

              setElements(prev => prev.map(el => {
                  if (el.id !== id) return el;
                  return { ...el, x: initialX + deltaXPercent, y: initialY + deltaYPercent };
              }));
          }

          // 3. RESIZING (SCALE TEXT)
          if (resizeItem.current) {
              const { id, startY, initialSize } = resizeItem.current;
              const deltaY = e.clientY - startY;
              const newSize = Math.max(8, initialSize + (deltaY * 0.5));
              setElements(prev => prev.map(el => el.id === id ? { ...el, fontSize: newSize } : el));
          }
      };

      const handleGlobalUp = () => {
          dragItem.current = null;
          resizeItem.current = null;
          panStart.current = null;
      };

      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', handleGlobalUp);
      return () => {
          window.removeEventListener('mousemove', handleGlobalMove);
          window.removeEventListener('mouseup', handleGlobalUp);
      };
  }, []);

  // --- HANDLERS ---
  const onMouseDownContainer = (e: React.MouseEvent) => {
      if (isSpacePressed) {
          panStart.current = { x: e.clientX, y: e.clientY };
          return;
      }
      if (!(e.target as HTMLElement).closest('.text-wrapper')) {
          setSelectedId(null);
          setEditingId(null);
      }
  };

  const onDoubleClickContainer = (e: React.MouseEvent) => {
      if (isSpacePressed || (e.target as HTMLElement).closest('.text-wrapper')) return;
      
      const rect = containerRef.current!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const newId = `txt-${Date.now()}`;
      setElements(prev => [...prev, { 
        id: newId, text: 'Teks...', x, y, 
        fontSize: currentFontSize, color: currentColor, 
        fontFamily: currentFont, isBold, isItalic 
      }]);
      
      setSelectedId(newId);
      setEditingId(newId); 
  };

  const onMouseDownElement = (e: React.MouseEvent, el: TextElement) => {
      e.stopPropagation();
      if (isSpacePressed) return; 
      if (editingId === el.id) return; 

      setSelectedId(el.id);
      dragItem.current = {
          id: el.id,
          startX: e.clientX,
          startY: e.clientY,
          initialX: el.x,
          initialY: el.y
      };
  };

  const onDoubleClickElement = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setEditingId(id);
      setSelectedId(id);
  };

  const onMouseDownResize = (e: React.MouseEvent, el: TextElement) => {
      e.stopPropagation();
      // Reset drag item to avoid conflict
      dragItem.current = null;
      
      resizeItem.current = {
          id: el.id,
          startY: e.clientY,
          initialSize: el.fontSize
      };
  };

  const updateSelected = (field: keyof TextElement, value: any) => {
      if (selectedId) {
          setElements(prev => prev.map(el => el.id === selectedId ? { ...el, [field]: value } : el));
      } else {
          if (field === 'fontSize') setCurrentFontSize(value);
          if (field === 'color') setCurrentColor(value);
          if (field === 'fontFamily') setCurrentFont(value);
          if (field === 'isBold') setIsBold(value);
          if (field === 'isItalic') setIsItalic(value);
      }
  };

  const handleSave = async () => {
    if (!file) return;
    setIsSaving(true);
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const page = pdfDoc.getPages()[0];
        const { width, height } = page.getSize();

        for (const el of elements) {
            let fS = StandardFonts.Helvetica;
            if (el.fontFamily === 'Times') fS = el.isBold ? (el.isItalic ? StandardFonts.TimesRomanBoldItalic : StandardFonts.TimesRomanBold) : (el.isItalic ? StandardFonts.TimesRomanItalic : StandardFonts.TimesRoman);
            else if (el.fontFamily === 'Courier') fS = el.isBold ? (el.isItalic ? StandardFonts.CourierBoldOblique : StandardFonts.CourierBold) : (el.isItalic ? StandardFonts.CourierOblique : StandardFonts.Courier);
            else fS = el.isBold ? (el.isItalic ? StandardFonts.HelveticaBoldOblique : StandardFonts.HelveticaBold) : (el.isItalic ? StandardFonts.HelveticaOblique : StandardFonts.Helvetica);
            
            const font = await pdfDoc.embedFont(fS);
            const r = parseInt(el.color.slice(1,3), 16)/255;
            const g = parseInt(el.color.slice(3,5), 16)/255;
            const b = parseInt(el.color.slice(5,7), 16)/255;

            page.drawText(el.text, {
                x: (el.x / 100) * width - (font.widthOfTextAtSize(el.text, el.fontSize)/2), 
                y: height - ((el.y / 100) * height) - (el.fontSize / 3), 
                size: el.fontSize,
                font,
                color: rgb(r, g, b),
            });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        setPdfUrl(URL.createObjectURL(blob));
    } catch (e) { alert("Error saat menyimpan."); } finally { setIsSaving(false); }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans flex flex-col overflow-hidden">
      {/* NAVBAR */}
      <nav className="h-16 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between px-6 z-50 shrink-0 shadow-lg">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-blue-500/20 shadow-lg"><FilePenLine size={20} /></div>
          <span className="font-bold text-lg tracking-wide uppercase">Studio<span className="text-blue-500">PDF</span></span>
        </Link>
        <div className="flex items-center gap-4">
           <button onClick={toggleLang} className="text-[10px] font-bold px-3 py-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all uppercase tracking-widest text-slate-300 border border-slate-700">{lang}</button>
           <Link href="/" className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 transition-colors bg-red-900/10 hover:bg-red-900/30 border border-red-900/20 px-4 py-2 rounded-lg">
              <X size={16} /> {T.btn_cancel[lang]}
           </Link>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden relative">
        {!file ? (
          // UPLOAD VIEW
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0F172A]">
             <div className="w-full max-w-5xl flex gap-8 justify-center items-start">
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
                <div className="flex-1 max-w-2xl text-center space-y-10 animate-in fade-in zoom-in duration-500 py-10">
                    <div className="flex justify-center"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                    <div className="space-y-4">
                      <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-2xl">{T.title[lang]}</h1>
                      <p className="text-slate-400 text-lg">{T.desc[lang]}</p>
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="group relative bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 px-12 rounded-2xl shadow-2xl shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-4 mx-auto uppercase tracking-widest text-sm overflow-hidden border border-blue-400/20">
                        {isProcessing ? <Loader2 className="animate-spin" size={24}/> : <FilePenLine size={24} />} {isProcessing ? T.loading[lang] : T.btn_upload[lang]}
                    </button>
                    <div className="flex justify-center"><AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" /></div>
                    <input type="file" accept="application/pdf" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} className="hidden" />
                 </div>
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
             </div>
          </div>
        ) : pdfUrl ? (
          // SUCCESS VIEW
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0F172A] overflow-y-auto">
             <div className="w-full max-w-5xl flex gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
                <div className="flex-1 max-w-lg space-y-8 animate-in slide-in-from-bottom">
                    <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-[30px] p-10 text-center shadow-2xl">
                        <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                           <CheckCircle2 size={40} strokeWidth={3} />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-8">{T.success[lang]}</h2>
                        <a href={pdfUrl} download="Edited_Document.pdf" className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-sm uppercase tracking-widest mb-4">
                           {T.btn_download[lang]}
                        </a>
                        <button onClick={() => window.location.reload()} className="text-slate-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                           <ArrowLeft size={14}/> Edit File Lain
                        </button>
                    </div>
                    <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                </div>
                <div className="hidden xl:block"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
             </div>
          </div>
        ) : (
          // EDITOR VIEW
          <div className="flex flex-col h-full md:flex-row w-full bg-[#1E293B]">
            {/* CANVAS AREA */}
            <div 
              className={`flex-1 relative overflow-hidden h-full bg-[#0F172A] ${isSpacePressed ? 'cursor-grab' : ''}`}
              onMouseDown={onMouseDownContainer}
            >
                {/* FLOATING TOOLBAR */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 w-full pointer-events-none">
                    <div className="flex gap-2 bg-slate-800/90 backdrop-blur border border-slate-700 p-2 rounded-2xl shadow-2xl pointer-events-auto">
                        <button onClick={() => setZoom(Math.max(0.4, zoom - 0.2))} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300"><ZoomOut size={18}/></button>
                        <span className="text-xs font-bold text-white min-w-[50px] flex items-center justify-center bg-slate-900 rounded-md select-none">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(Math.min(3, zoom + 0.2))} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300"><ZoomIn size={18}/></button>
                        <div className="w-px h-6 bg-slate-700 my-auto mx-1" />
                        <button onClick={() => { setZoom(0.8); setPan({x:0, y:0}); }} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300"><Maximize2 size={18}/></button>
                    </div>
                    <div className="bg-slate-800/80 backdrop-blur px-4 py-1.5 rounded-full border border-slate-700/50 shadow-lg pointer-events-none">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           {isSpacePressed ? <Hand size={12} className="animate-pulse text-blue-400"/> : <MousePointer2 size={12}/>} 
                           {isSpacePressed ? T.hint_pan[lang] : T.hint_edit[lang]}
                       </p>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center relative w-full h-full">
                    <div 
                        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transition: isSpacePressed ? 'none' : 'transform 0.1s ease-out' }}
                        className="origin-center"
                    >
                        <div ref={containerRef} onDoubleClick={onDoubleClickContainer} className="relative shadow-2xl bg-white select-none ring-1 ring-slate-700 cursor-text">
                            {previewImage ? (
                              <img src={previewImage} alt="PDF" className="max-w-none pointer-events-none block" />
                            ) : (
                              <div className="w-[600px] h-[800px] bg-white flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={48} /></div>
                            )}
                            
                            {/* TEXT ELEMENTS */}
                            {elements.map(el => (
                                <div key={el.id} 
                                  onMouseDown={(e) => onMouseDownElement(e, el)} 
                                  onDoubleClick={(e) => onDoubleClickElement(e, el.id)}
                                  className={`text-wrapper absolute whitespace-nowrap px-2 py-1 border-2 transition-all rounded group ${selectedId === el.id ? 'border-blue-500 bg-blue-500/10 z-50' : 'border-transparent z-10 hover:border-slate-300/50'}`}
                                  style={{ 
                                    left: `${el.x}%`, top: `${el.y}%`, 
                                    fontSize: `${el.fontSize}px`, color: el.color, 
                                    transform: 'translate(-50%, -50%)', 
                                    fontFamily: el.fontFamily === 'Times' ? 'serif' : el.fontFamily === 'Courier' ? 'monospace' : 'sans-serif', 
                                    fontWeight: el.isBold ? 'bold' : 'normal', 
                                    fontStyle: el.isItalic ? 'italic' : 'normal',
                                    cursor: isSpacePressed ? 'grab' : (editingId === el.id ? 'text' : 'move')
                                  }}
                                >
                                    {editingId === el.id ? (
                                       <input 
                                          ref={inputFocusRef}
                                          value={el.text} 
                                          onChange={(e) => setElements(prev => prev.map(i => i.id === el.id ? {...i, text: e.target.value} : i))} 
                                          onBlur={() => setEditingId(null)}
                                          className="bg-transparent border-none outline-none w-fit min-w-[20px] text-center p-0 m-0"
                                          style={{ fontSize: 'inherit', color: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit', fontStyle: 'inherit' }}
                                       />
                                    ) : ( <span>{el.text}</span> )}

                                    {/* RESIZE HANDLE (TITIK BULAT PUTIH) */}
                                    {selectedId === el.id && (
                                        <div 
                                            onMouseDown={(e) => onMouseDownResize(e, el)}
                                            className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform z-50"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* SIDEBAR PROPERTIES */}
            <div className="w-full md:w-80 bg-[#1E293B] border-l border-slate-700 flex flex-col z-40 shadow-2xl h-[40vh] md:h-full">
                <div className="p-6 border-b border-slate-700 flex items-center justify-between shrink-0">
                   <h3 className="font-black text-xs text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><Settings2 size={14}/> Properties</h3>
                   {selectedId && <button onClick={() => { setElements(prev => prev.filter(el => el.id !== selectedId)); setSelectedId(null); }} className="text-red-400 hover:bg-red-500/20 p-2 rounded-lg transition-all" title="Delete"><Trash2 size={16}/></button>}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* FONT FAMILY */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Type size={12}/> {T.lbl_font[lang]}</label>
                        <select 
                            value={selectedId ? (elements.find(el => el.id === selectedId)?.fontFamily || currentFont) : currentFont} 
                            onChange={(e) => updateSelected('fontFamily', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="Helvetica">Helvetica (Sans)</option>
                            <option value="Times">Times New Roman</option>
                            <option value="Courier">Courier (Mono)</option>
                        </select>
                    </div>

                    {/* STYLE TOGGLES */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Palette size={12}/> {T.lbl_style[lang]}</label>
                        <div className="flex gap-2">
                           <button onClick={() => updateSelected('isBold', selectedId ? !elements.find(el => el.id === selectedId)?.isBold : !isBold)} className={`flex-1 py-3 rounded-xl border flex items-center justify-center transition-all ${ (selectedId ? elements.find(el => el.id === selectedId)?.isBold : isBold) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700' }`}><Bold size={16}/></button>
                           <button onClick={() => updateSelected('isItalic', selectedId ? !elements.find(el => el.id === selectedId)?.isItalic : !isItalic)} className={`flex-1 py-3 rounded-xl border flex items-center justify-center transition-all ${ (selectedId ? elements.find(el => el.id === selectedId)?.isItalic : isItalic) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700' }`}><Italic size={16}/></button>
                        </div>
                    </div>

                    {/* SIZE & COLOR */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{T.lbl_size[lang]}</label>
                            <input type="number" min="8" max="72" value={Math.round(selectedId ? (elements.find(el => el.id === selectedId)?.fontSize || currentFontSize) : currentFontSize)} onChange={(e) => updateSelected('fontSize', parseInt(e.target.value))} className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-center font-bold text-white outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{T.lbl_color[lang]}</label>
                            <div className="flex items-center gap-2 h-[46px] bg-slate-800 border border-slate-600 rounded-xl px-2">
                                <input type="color" value={selectedId ? (elements.find(el => el.id === selectedId)?.color || currentColor) : currentColor} onChange={(e) => updateSelected('color', e.target.value)} className="w-8 h-8 bg-transparent border-none cursor-pointer" />
                                <span className="text-xs text-slate-400 uppercase">{selectedId ? (elements.find(el => el.id === selectedId)?.color || currentColor) : currentColor}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-700 flex justify-center"><AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" /></div>
                </div>

                <div className="p-6 border-t border-slate-700 bg-slate-800/50">
                    <button onClick={handleSave} disabled={isSaving || (elements.length === 0 && !file)} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" size={18}/> : T.btn_save_lbl[lang]}
                    </button>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
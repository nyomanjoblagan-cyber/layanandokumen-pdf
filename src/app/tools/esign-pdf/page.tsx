'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  PenTool, CheckCircle2, Download, Globe, 
  X, ArrowLeft, Loader2, Settings2, Eraser, Scaling, Move
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// 1. WORKER STABIL (Wajib)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

type Point = { x: number; y: number };
type Stroke = Point[];

export default function SignPdfPage() {
  // STATE UTAMA
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // SIGNATURE STATE
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); 
  const strokes = useRef<Stroke[]>([]); 
  const currentStroke = useRef<Stroke>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  
  // SETTINGS
  const [penColor, setPenColor] = useState('#000000'); 
  const [penWidth, setPenWidth] = useState(3);
  
  // POSITIONING (Drag & Drop Logic Baru)
  const [sigScale, setSigScale] = useState(30); 
  const [sigX, setSigX] = useState(50); 
  const [sigY, setSigY] = useState(50); 
  const [interactionMode, setInteractionMode] = useState<'none' | 'drag' | 'resize'>('none');
  
  // OFFSET (Supaya gak loncat saat di-klik)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // UI & BAHASA
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [mobileTab, setMobileTab] = useState<0 | 1>(1); 
  const [isLoaded, setIsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LOGIKA BAHASA ---
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

  useEffect(() => {
    if (hasSignature) redrawCanvas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [penColor, penWidth]);

  const T = {
    hero_title: { id: 'Tanda Tangan PDF', en: 'Sign PDF' },
    hero_desc: { id: 'Buat tanda tangan digital dan tempelkan langsung ke dokumen PDF Anda.', en: 'Create digital signature and place it directly onto your PDF document.' },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    tab_sign: { id: 'Buat Tanda Tangan', en: 'Create Signature' },
    tab_preview: { id: 'Pratinjau', en: 'Preview' },
    draw_hint: { id: 'Gambar tanda tangan di sini', en: 'Draw signature here' },
    clear_btn: { id: 'Hapus', en: 'Clear' },
    lbl_color: { id: 'Warna Pena', en: 'Pen Color' },
    lbl_width: { id: 'Ketebalan', en: 'Thickness' },
    lbl_size: { id: 'Ukuran', en: 'Size' },
    save_btn: { id: 'Simpan PDF', en: 'Save PDF' },
    download_btn: { id: 'Download PDF', en: 'Download PDF' },
    back_home: { id: 'Tanda Tangan Lagi', en: 'Sign Another' },
    cancel: { id: 'Tutup', en: 'Close' },
    loading: { id: 'MEMUAT...', en: 'LOADING...' },
    saving: { id: 'MENYIMPAN...', en: 'SAVING...' },
    success_title: { id: 'Berhasil!', en: 'Success!' },
    drag_hint: { id: 'Tekan & Tahan tanda tangan untuk memindahkan', en: 'Press & Hold signature to move' }
  };

  const processFile = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') { alert("Harus file PDF"); return; }
    setFile(uploadedFile);
    setIsProcessing(true);
    setPdfUrl(null);
    try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            setPreviewImage(canvas.toDataURL('image/png'));
        }
    } catch (e) { alert("Gagal muat PDF"); setFile(null); } finally { setIsProcessing(false); }
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor; ctx.lineWidth = penWidth;
    strokes.current.forEach(stroke => {
        if (stroke.length < 1) return;
        ctx.beginPath(); ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
        ctx.stroke();
    });
    setSignatureImage(canvas.toDataURL());
  };

  // --- LOGIKA DRAG & DROP BARU (CLICK & HOLD) ---
  
  // 1. Mulai Drag (Mouse Down)
  const handleStartInteraction = (e: React.MouseEvent | React.TouchEvent, type: 'drag' | 'resize') => {
    e.stopPropagation(); // Jangan tembus ke container
    // e.preventDefault(); // (Opsional, kadang block scroll di mobile)

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Posisi Mouse/Touch Absolut
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    if (type === 'drag') {
        // Hitung Offset: Jarak antara cursor dengan titik pusat tanda tangan saat ini
        // Tujuannya supaya gambar gak 'loncat' ke tengah cursor pas diklik
        const currentXPx = (sigX / 100) * rect.width;
        const currentYPx = (sigY / 100) * rect.height;
        const mouseXRel = clientX - rect.left;
        const mouseYRel = clientY - rect.top;

        setDragOffset({
            x: mouseXRel - currentXPx,
            y: mouseYRel - currentYPx
        });
    }

    setInteractionMode(type);
  };

  // 2. Sedang Drag (Mouse Move - Global di Container Utama)
  const handleInteractionMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (interactionMode === 'none' || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    // Posisi Mouse relatif terhadap Container
    const mouseXRel = clientX - rect.left;
    const mouseYRel = clientY - rect.top;

    if (interactionMode === 'drag') {
        // Posisi baru = Posisi Mouse - Offset Awal
        let newXPx = mouseXRel - dragOffset.x;
        let newYPx = mouseYRel - dragOffset.y;

        // Konversi ke Persen
        let newXPercent = (newXPx / rect.width) * 100;
        let newYPercent = (newYPx / rect.height) * 100;

        // Clamp (Supaya gak keluar layar)
        newXPercent = Math.max(0, Math.min(100, newXPercent));
        newYPercent = Math.max(0, Math.min(100, newYPercent));

        setSigX(newXPercent);
        setSigY(newYPercent);

    } else if (interactionMode === 'resize') {
        // Logic Resize
        const centerX = rect.left + (sigX / 100) * rect.width;
        const dist = Math.abs(clientX - centerX);
        const newScale = (dist * 2 / rect.width) * 100;
        setSigScale(Math.max(5, Math.min(80, newScale)));
    }
  };

  // 3. Selesai Drag (Mouse Up)
  const handleEndInteraction = () => {
    setInteractionMode('none');
  };

  const handleSave = async () => {
    if (!file || !signatureImage) return;
    setIsSaving(true);
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const page = pdfDoc.getPages()[0];
        const pngImage = await pdfDoc.embedPng(signatureImage);
        const { width, height } = page.getSize();
        
        const tWidth = (sigScale / 100) * width;
        const tHeight = pngImage.height * (tWidth / pngImage.width);
        const pdfX = (sigX / 100) * width - (tWidth / 2);
        const pdfY = height - ((sigY / 100) * height) - (tHeight / 2);

        page.drawImage(pngImage, { x: pdfX, y: pdfY, width: tWidth, height: tHeight });
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        setPdfUrl(URL.createObjectURL(blob));
    } catch (e) { alert("Gagal simpan"); } finally { setIsSaving(false); }
  };

  if (!isLoaded) return null;

  return (
    <div 
      className="min-h-screen bg-[#F8FAFC] flex flex-col overflow-hidden text-slate-800 font-sans"
      // Event Handler Global untuk Move & Up (Supaya kalau mouse keluar elemen, drag tetap jalan)
      onMouseMove={handleInteractionMove} 
      onTouchMove={handleInteractionMove} 
      onMouseUp={handleEndInteraction} 
      onTouchEnd={handleEndInteraction}
    >
      <nav className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><PenTool size={20} /></div>
          <span className="font-bold text-xl tracking-tight text-slate-900 italic uppercase">Sign<span className="text-blue-600">PDF</span></span>
        </Link>
        <div className="flex items-center gap-4">
           <button onClick={toggleLang} className="text-[10px] font-bold px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all uppercase tracking-widest text-slate-600">{lang}</button>
           <Link href="/" className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-500 transition-colors bg-red-50 px-4 py-2 rounded-lg border border-slate-100">
              <X size={16} /> {T.cancel[lang]}
           </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden relative">
        {!file ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#F8FAFC]">
             <div className="w-full max-w-5xl flex gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
                <div className="flex-1 max-w-2xl space-y-10 animate-in fade-in zoom-in duration-500 py-10">
                    <div className="flex justify-center"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                    <div className="space-y-4 px-4">
                      <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{T.hero_title[lang]}</h1>
                      <p className="text-slate-500 font-medium text-lg">{T.hero_desc[lang]}</p>
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="group relative bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-5 px-12 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto uppercase tracking-widest">
                       {isProcessing ? <Loader2 className="animate-spin" size={24}/> : <PenTool size={24} />} {isProcessing ? T.loading[lang] : T.select_btn[lang]}
                    </button>
                    <div className="flex justify-center mt-8"><AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" /></div>
                    <input type="file" accept="application/pdf" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} className="hidden" />
                 </div>
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
             </div>
          </div>
        ) : pdfUrl ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white overflow-y-auto">
             <div className="w-full max-w-5xl flex gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
                <div className="flex-1 max-w-lg space-y-8 animate-in slide-in-from-bottom duration-500">
                    <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
                    <div className="bg-white border border-slate-200 rounded-[30px] p-10 text-center shadow-2xl relative overflow-hidden">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"><CheckCircle2 size={40} strokeWidth={3} /></div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">{T.success_title[lang]}</h2>
                        <div className="flex flex-col gap-4 mt-8">
                           <a href={pdfUrl} download={`Signed_${file?.name}`} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-widest text-sm"><Download size={20} /> {T.download_btn[lang]}</a>
                           <button onClick={() => { setFile(null); setPdfUrl(null); setHasSignature(false); setSignatureImage(null); strokes.current = []; }} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"><ArrowLeft size={16} /> {T.back_home[lang]}</button>
                        </div>
                    </div>
                    <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                </div>
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
             </div>
          </div>
        ) : (
          <div className="flex flex-col h-full md:flex-row md:p-6 md:gap-6 max-w-[1600px] mx-auto w-full">
            <div className="md:hidden flex border-b border-slate-200 bg-white sticky top-0 z-20 shrink-0">
               <button onClick={() => setMobileTab(1)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 1 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{T.tab_sign[lang]}</button>
               <button onClick={() => setMobileTab(0)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 0 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{T.tab_preview[lang]}</button>
            </div>

            {/* PREVIEW AREA (LEFT) */}
            <div className={`flex-1 flex flex-col h-full bg-slate-100 md:bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 md:p-8 overflow-hidden relative ${mobileTab === 0 ? 'flex' : 'hidden md:flex'}`}>
                <div className="flex justify-center mb-4 shrink-0 overflow-hidden px-4">
                   <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                   <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>

                <div className="flex-1 flex items-center justify-center p-4 overflow-auto min-h-[400px]">
                    <div ref={containerRef} className="relative shadow-2xl border-4 border-white bg-white max-w-full select-none">
                        {previewImage ? (
                           <img src={previewImage} alt="Preview" className="max-w-full max-h-[50vh] md:max-h-[600px] object-contain pointer-events-none block" />
                        ) : (
                           <div className="w-[400px] h-[600px] flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={40}/></div>
                        )}
                        
                        {/* SIGNATURE OVERLAY (DRAGGABLE) */}
                        {signatureImage && (
                            <div 
                              // HANDLER DI SINI UNTUK START DRAG
                              onMouseDown={(e) => handleStartInteraction(e, 'drag')}
                              onTouchStart={(e) => handleStartInteraction(e, 'drag')}
                              className={`absolute group touch-none ${interactionMode === 'drag' ? 'cursor-grabbing' : 'cursor-grab'}`} 
                              style={{ 
                                left: `${sigX}%`, 
                                top: `${sigY}%`, 
                                width: `${sigScale}%`, 
                                transform: 'translate(-50%, -50%)', 
                              }}
                            >
                                <img src={signatureImage} alt="Sig" className="w-full border-2 border-dashed border-blue-400/0 group-hover:border-blue-400 rounded p-1 transition-all pointer-events-none" />
                                {/* Resize Handle */}
                                <div 
                                  onMouseDown={(e) => handleStartInteraction(e, 'resize')}
                                  onTouchStart={(e) => handleStartInteraction(e, 'resize')}
                                  className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-600 rounded-full border-2 border-white cursor-nwse-resize shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                   <Scaling size={12} className="text-white"/>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-center mt-4 shrink-0 overflow-hidden px-4">
                   <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                   <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>

                <p className="text-center text-[10px] text-blue-600 font-black uppercase mt-4 mb-2 bg-blue-50 py-2 px-4 rounded-full mx-auto w-fit border border-blue-100 animate-pulse">{T.drag_hint[lang]}</p>
            </div>

            {/* SIDEBAR (RIGHT) */}
            <div className={`w-full md:w-96 bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 p-6 overflow-y-auto shrink-0 ${mobileTab === 1 ? 'block' : 'hidden md:block'}`}>
                <h3 className="font-black text-[10px] text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2"><Settings2 size={14}/> {T.tab_sign[lang]}</h3>
                
                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl overflow-hidden relative mb-6 shadow-inner">
                    <canvas 
                      ref={canvasRef} width={600} height={300} 
                      className="w-full h-48 touch-none cursor-crosshair bg-white" 
                      onMouseDown={(e: any) => { setIsDrawing(true); const r = canvasRef.current!.getBoundingClientRect(); currentStroke.current = [{x: (e.clientX - r.left)*(600/r.width), y: (e.clientY - r.top)*(300/r.height)}]; }}
                      onMouseMove={(e: any) => { if(!isDrawing) return; const r = canvasRef.current!.getBoundingClientRect(); const p = {x: (e.clientX - r.left)*(600/r.width), y: (e.clientY - r.top)*(300/r.height)}; currentStroke.current.push(p); redrawCanvas(); }}
                      onMouseUp={() => { if(!isDrawing) return; setIsDrawing(false); strokes.current.push([...currentStroke.current]); setHasSignature(true); redrawCanvas(); }}
                      onMouseLeave={() => setIsDrawing(false)}
                      onTouchStart={(e: any) => { setIsDrawing(true); const r = canvasRef.current!.getBoundingClientRect(); currentStroke.current = [{x: (e.touches[0].clientX - r.left)*(600/r.width), y: (e.touches[0].clientY - r.top)*(300/r.height)}]; }}
                      onTouchMove={(e: any) => { if(!isDrawing) return; e.preventDefault(); const r = canvasRef.current!.getBoundingClientRect(); const p = {x: (e.touches[0].clientX - r.left)*(600/r.width), y: (e.touches[0].clientY - r.top)*(300/r.height)}; currentStroke.current.push(p); redrawCanvas(); }}
                      onTouchEnd={() => { if(!isDrawing) return; setIsDrawing(false); strokes.current.push([...currentStroke.current]); setHasSignature(true); redrawCanvas(); }}
                    />
                    {!hasSignature && <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 font-bold uppercase tracking-widest text-sm">{T.draw_hint[lang]}</div>}
                    <button onClick={() => { strokes.current = []; setHasSignature(false); setSignatureImage(null); canvasRef.current!.getContext('2d')!.clearRect(0,0,600,300); }} className="absolute top-2 right-2 bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-lg border border-red-100 transition-colors"><Eraser size={16}/></button>
                </div>

                <div className="space-y-6">
                    <div className="flex gap-4 items-center">
                        <div className="flex gap-2">
                            {['#000000', '#0000FF', '#FF0000', '#008000'].map(c => (
                                <button key={c} onClick={() => setPenColor(c)} style={{backgroundColor: c}} className={`w-8 h-8 rounded-full border-2 transition-all ${penColor === c ? 'border-slate-800 scale-110 shadow-sm' : 'border-transparent'}`} />
                            ))}
                        </div>
                        <div className="flex-1">
                            <input type="range" min="1" max="10" value={penWidth} onChange={(e) => setPenWidth(parseInt(e.target.value))} className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-full cursor-pointer" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-widest flex items-center gap-2"><Scaling size={12}/> {T.lbl_size[lang]}</label>
                        <input type="range" min="5" max="80" value={sigScale} onChange={(e) => setSigScale(parseInt(e.target.value))} className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-full cursor-pointer" />
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-center">
                        <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                    </div>

                    <button onClick={handleSave} disabled={isSaving || !hasSignature} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-400 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 uppercase text-xs tracking-widest">
                        {isSaving ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18}/>} {T.save_btn[lang]}
                    </button>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
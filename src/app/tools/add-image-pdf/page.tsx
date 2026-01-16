'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  ImagePlus, FileText, CheckCircle2, Download, Globe, 
  X, ArrowLeft, Loader2, Settings2, Scaling, Move, Plus, Image as IconImage
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// 1. WORKER STABIL (Wajib)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export default function AddImagePdfPage() {
  // STATE UTAMA
  const [file, setFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // POSITIONING STATE
  const [imgScale, setImgScale] = useState(30); 
  const [imgX, setImgX] = useState(50); 
  const [imgY, setImgY] = useState(50); 
  const [imgOpacity, setImgOpacity] = useState(1);
  const [interactionMode, setInteractionMode] = useState<'none' | 'drag' | 'resize'>('none');
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // UI & BAHASA
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [mobileTab, setMobileTab] = useState<0 | 1>(0); 
  const [isLoaded, setIsLoaded] = useState(false); 
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  
  // Refs
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

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
    hero_title: { id: 'Tambah Gambar ke PDF', en: 'Add Image to PDF' },
    hero_desc: { 
      id: 'Sisipkan foto, logo, atau stempel ke dalam dokumen PDF Anda. Atur posisi dan transparansi.', 
      en: 'Insert photos, logos, or stamps into your PDF document. Adjust position and transparency.' 
    },
    select_pdf: { id: 'Pilih File PDF', en: 'Select PDF File' },
    select_img: { id: 'Pilih Gambar', en: 'Select Image' },
    drop_text: { id: 'atau tarik file ke sini', en: 'or drop file here' },
    
    // Tabs
    tab_editor: { id: 'Editor', en: 'Editor' },
    tab_settings: { id: 'Pengaturan', en: 'Settings' },
    
    // Settings
    label_size: { id: 'Ukuran Gambar', en: 'Image Size' },
    label_opacity: { id: 'Transparansi', en: 'Opacity' },
    
    // Actions
    save_btn: { id: 'Simpan PDF', en: 'Save PDF' },
    change_img: { id: 'Ganti Gambar', en: 'Change Image' },
    
    // Status
    loading: { id: 'MEMUAT...', en: 'LOADING...' },
    saving: { id: 'MENYIMPAN...', en: 'SAVING...' },
    
    // Success
    success_title: { id: 'Berhasil!', en: 'Success!' },
    success_desc: { id: 'Gambar berhasil disisipkan ke PDF.', en: 'Image successfully inserted into PDF.' },
    download_btn: { id: 'Download PDF', en: 'Download PDF' },
    back_home: { id: 'Edit Lagi', en: 'Edit Another' },
    cancel: { id: 'Tutup', en: 'Close' },
    
    drag_hint: { id: 'Tekan & Tahan gambar untuk memindahkan', en: 'Press & Hold image to move' }
  };

  // --- 4. HANDLE UPLOAD PDF ---
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processPdf(e.target.files[0]);
  };

  const processPdf = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') { alert("Mohon pilih file PDF."); return; }
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
            await page.render({ canvasContext: context, viewport }).promise;
            setPdfPreview(canvas.toDataURL());
        }
    } catch (e) { alert("Gagal memuat PDF."); setFile(null); } finally { setIsProcessing(false); }
  };

  // --- 5. HANDLE UPLOAD IMAGE ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const img = e.target.files[0];
        if (!img.type.startsWith('image/')) { alert("File harus berupa gambar."); return; }
        setImageFile(img);
        setImagePreview(URL.createObjectURL(img));
    }
  };

  // --- 6. DRAG & DROP LOGIC (SAMA SEPERTI SIGNATURE) ---
  const handleStartInteraction = (e: React.MouseEvent | React.TouchEvent, type: 'drag' | 'resize') => {
    e.stopPropagation();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    if (type === 'drag') {
        const currentXPx = (imgX / 100) * rect.width;
        const currentYPx = (imgY / 100) * rect.height;
        setDragOffset({
            x: (clientX - rect.left) - currentXPx,
            y: (clientY - rect.top) - currentYPx
        });
    }
    setInteractionMode(type);
  };

  const handleInteractionMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (interactionMode === 'none' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    if (interactionMode === 'drag') {
        let newX = ((clientX - rect.left - dragOffset.x) / rect.width) * 100;
        let newY = ((clientY - rect.top - dragOffset.y) / rect.height) * 100;
        newX = Math.max(0, Math.min(100, newX));
        newY = Math.max(0, Math.min(100, newY));
        setImgX(newX);
        setImgY(newY);
    } else if (interactionMode === 'resize') {
        const centerX = rect.left + (imgX / 100) * rect.width;
        const dist = Math.abs(clientX - centerX);
        const newScale = (dist * 2 / rect.width) * 100;
        setImgScale(Math.max(5, Math.min(90, newScale)));
    }
  };

  const handleEndInteraction = () => setInteractionMode('none');

  // --- 7. SAVE PDF ---
  const handleSave = async () => {
    if (!file || !imageFile) return;
    setIsSaving(true);

    try {
        const pdfBuffer = await file.arrayBuffer();
        const imgBuffer = await imageFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        
        let embeddedImage;
        if (imageFile.type === 'image/png') {
            embeddedImage = await pdfDoc.embedPng(imgBuffer);
        } else {
            embeddedImage = await pdfDoc.embedJpg(imgBuffer);
        }

        const pages = pdfDoc.getPages();
        // Terapkan ke halaman 1 (bisa dikembangkan ke all pages)
        const page = pages[0]; 
        const { width, height } = page.getSize();

        const tWidth = (imgScale / 100) * width;
        const tHeight = embeddedImage.height * (tWidth / embeddedImage.width);
        const pdfX = (imgX / 100) * width - (tWidth / 2);
        const pdfY = height - ((imgY / 100) * height) - (tHeight / 2);

        page.drawImage(embeddedImage, {
            x: pdfX, y: pdfY, width: tWidth, height: tHeight, opacity: imgOpacity
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        setPdfUrl(URL.createObjectURL(blob));

    } catch (e) { alert("Gagal menyimpan."); } finally { setIsSaving(false); }
  };

  const resetAll = () => {
    setFile(null);
    setImageFile(null);
    setPdfUrl(null);
    setPdfPreview(null);
    setImagePreview(null);
  };

  if (!isLoaded) return null;

  return (
    <div 
      className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col overflow-hidden"
      onMouseMove={handleInteractionMove} 
      onTouchMove={handleInteractionMove} 
      onMouseUp={handleEndInteraction} 
      onTouchEnd={handleEndInteraction}
    >
      <nav className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-green-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><ImagePlus size={20} /></div>
          <span className="font-bold text-xl tracking-tight text-slate-900 italic uppercase">Add<span className="text-green-600">Image</span></span>
        </Link>
        <div className="flex items-center gap-4">
           <button onClick={toggleLang} className="text-[10px] font-bold px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all uppercase tracking-widest text-slate-600">{lang}</button>
           <Link href="/" className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-500 transition-colors bg-red-50 px-4 py-2 rounded-lg border border-slate-100">
              <X size={16} /> {T.cancel[lang]}
           </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden relative">
        
        {/* STATE 1: UPLOAD PDF */}
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
                    <div className="flex flex-col items-center gap-6">
                        <button onClick={() => pdfInputRef.current?.click()} className="group relative bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-5 px-16 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
                           {isProcessing ? <Loader2 className="animate-spin" size={24}/> : <FileText size={24} />} {isProcessing ? T.loading[lang] : T.select_pdf[lang]}
                        </button>
                        <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">{T.drop_text[lang]}</p>
                    </div>
                    <div className="flex justify-center mt-8"><AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" /></div>
                    <input type="file" accept="application/pdf" ref={pdfInputRef} onChange={handlePdfUpload} className="hidden" />
                 </div>

                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
             </div>
          </div>
        ) : pdfUrl ? (
          // STATE 3: SUCCESS
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white overflow-y-auto">
             <div className="w-full max-w-5xl flex gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
                <div className="flex-1 max-w-lg space-y-8 animate-in slide-in-from-bottom duration-500">
                    <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
                    <div className="bg-white border border-slate-200 rounded-[30px] p-10 text-center shadow-2xl relative overflow-hidden">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"><CheckCircle2 size={40} strokeWidth={3} /></div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">{T.success_title[lang]}</h2>
                        <p className="text-slate-500 font-medium mb-8">{T.success_desc[lang]}</p>
                        <div className="flex flex-col gap-4">
                           <a href={pdfUrl} download={`ImageAdded_${file?.name}`} className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-widest text-sm"><Download size={20} /> {T.download_btn[lang]}</a>
                           <button onClick={resetAll} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"><ArrowLeft size={16} /> {T.back_home[lang]}</button>
                        </div>
                    </div>
                    <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                </div>
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
             </div>
          </div>
        ) : (
          // STATE 2: EDITOR (UPLOAD IMAGE & DRAG)
          <div className="flex flex-col h-full md:flex-row md:p-6 md:gap-6 max-w-[1600px] mx-auto w-full">
            
            {/* MOBILE TABS */}
            <div className="md:hidden flex border-b border-slate-200 bg-white sticky top-0 z-20 shrink-0">
               <button onClick={() => setMobileTab(0)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 0 ? 'border-green-600 text-green-600' : 'border-transparent text-slate-400'}`}>{T.tab_editor[lang]}</button>
               <button onClick={() => setMobileTab(1)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 1 ? 'border-green-600 text-green-600' : 'border-transparent text-slate-400'}`}>{T.tab_settings[lang]}</button>
            </div>

            {/* PREVIEW AREA (LEFT) */}
            <div className={`flex-1 flex flex-col h-full bg-slate-100 md:bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 md:p-8 overflow-hidden relative ${mobileTab === 0 ? 'flex' : 'hidden md:flex'}`}>
                <div className="flex justify-center mb-4 shrink-0 overflow-hidden px-4">
                   <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                   <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>

                <div className="flex-1 flex items-center justify-center p-4 overflow-auto min-h-[400px]">
                    <div ref={containerRef} className="relative shadow-2xl border-4 border-white bg-white max-w-full select-none">
                        {pdfPreview ? (
                           <img src={pdfPreview} alt="Preview" className="max-w-full max-h-[50vh] md:max-h-[600px] object-contain pointer-events-none block" />
                        ) : (
                           <div className="w-[400px] h-[600px] flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={40}/></div>
                        )}
                        
                        {/* IMAGE OVERLAY */}
                        {imagePreview && (
                            <div 
                              onMouseDown={(e) => handleStartInteraction(e, 'drag')} 
                              onTouchStart={(e) => handleStartInteraction(e, 'drag')} 
                              className={`absolute cursor-move group touch-none ${interactionMode === 'drag' ? 'cursor-grabbing' : 'cursor-grab'}`} 
                              style={{ 
                                left: `${imgX}%`, 
                                top: `${imgY}%`, 
                                width: `${imgScale}%`, 
                                transform: 'translate(-50%, -50%)', 
                                opacity: imgOpacity
                              }}
                            >
                                <img src={imagePreview} alt="Overlay" className="w-full border-2 border-dashed border-blue-400/0 group-hover:border-blue-400 rounded p-1 transition-all pointer-events-none" />
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

                {imagePreview && <p className="text-center text-[10px] text-blue-600 font-black uppercase mt-4 mb-2 bg-blue-50 py-2 px-4 rounded-full mx-auto w-fit border border-blue-100 animate-pulse">{T.drag_hint[lang]}</p>}
            </div>

            {/* SIDEBAR (RIGHT) */}
            <div className={`w-full md:w-96 bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 p-6 overflow-y-auto shrink-0 ${mobileTab === 1 ? 'block' : 'hidden md:block'}`}>
                <h3 className="font-black text-[10px] text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2"><Settings2 size={14}/> {T.tab_settings[lang]}</h3>
                
                {/* UPLOAD IMAGE BUTTON */}
                <div className="mb-6">
                    <button onClick={() => imgInputRef.current?.click()} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all gap-2 group">
                        {imagePreview ? <img src={imagePreview} className="h-16 object-contain" /> : <IconImage size={24}/>}
                        <span className="text-[10px] font-bold uppercase tracking-widest">{imagePreview ? T.change_img[lang] : T.select_img[lang]}</span>
                    </button>
                    <input type="file" accept="image/*" ref={imgInputRef} onChange={handleImageUpload} className="hidden" />
                </div>

                {imagePreview && (
                    <div className="space-y-6">
                        {/* Size Slider */}
                        <div>
                            <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-widest flex items-center gap-2"><Scaling size={12}/> {T.label_size[lang]}</label>
                            <input type="range" min="5" max="80" value={imgScale} onChange={(e) => setImgScale(parseInt(e.target.value))} className="w-full accent-green-600 h-1.5 bg-slate-200 rounded-full cursor-pointer" />
                        </div>

                        {/* Opacity Slider */}
                        <div>
                            <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-widest flex items-center gap-2"><Globe size={12}/> {T.label_opacity[lang]}</label>
                            <input type="range" min="0.1" max="1" step="0.1" value={imgOpacity} onChange={(e) => setImgOpacity(parseFloat(e.target.value))} className="w-full accent-green-600 h-1.5 bg-slate-200 rounded-full cursor-pointer" />
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-center">
                            <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                        </div>

                        <button onClick={handleSave} disabled={isSaving} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:text-slate-400 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 uppercase text-xs tracking-widest">
                            {isSaving ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18}/>} {T.save_btn[lang]}
                        </button>
                    </div>
                )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
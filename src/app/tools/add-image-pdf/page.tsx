'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  ImagePlus, FileText, CheckCircle2, Download, Globe, 
  X, Loader2, Settings2, Scaling, RotateCw, Trash2, Copy, Layers,
  ChevronUp, ChevronDown, ArrowLeft, MousePointer2, ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// --- TIPE DATA ---
interface AddedImage {
  id: string;
  file: File;
  preview: string;
  x: number;      
  y: number;      
  scale: number;  
  opacity: number;
  rotation: number;
  aspectRatio: number;
  page: number; 
}

// 1. WORKER STABIL
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export default function AddImagePdfPage() {
  // --- STATE UTAMA ---
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<AddedImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // PDF Preview State
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageRotation, setPageRotation] = useState(0); 
  
  // MULTI-PAGE STATE
  const [numPages, setNumPages] = useState(0);
  const [currPage, setCurrPage] = useState(1); 

  // System State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // --- LOGIKA DRAG ---
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); 
  const [initialImgPos, setInitialImgPos] = useState({ x: 0, y: 0, scale: 0 }); 

  const containerRef = useRef<HTMLDivElement>(null);
  const interactionType = useRef<'none' | 'drag' | 'resize'>('none');

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  // UI State
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [mobileTab, setMobileTab] = useState<0 | 1>(0); 
  const [isLoaded, setIsLoaded] = useState(false); 

  // --- INIT ---
  useEffect(() => {
    const saved = localStorage.getItem('user-lang') as 'id' | 'en';
    if (saved) setLang(saved);
    setIsLoaded(true);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        removeImage(selectedId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  const toggleLang = () => {
    const newLang = lang === 'id' ? 'en' : 'id';
    setLang(newLang);
    localStorage.setItem('user-lang', newLang);
  };

  const T = {
    hero_title: { id: 'Tambah Gambar ke PDF', en: 'Add Image to PDF' },
    hero_desc: { id: 'Sisipkan foto, logo, atau stempel. Mendukung banyak halaman.', en: 'Insert photos, logos, or stamps. Supports multi-page PDFs.' },
    select_pdf: { id: 'Pilih File PDF', en: 'Select PDF File' },
    tab_editor: { id: 'Editor', en: 'Editor' },
    tab_settings: { id: 'Pengaturan', en: 'Settings' },
    add_img: { id: 'Tambah Gambar', en: 'Add Image' },
    layers: { id: 'Urutan Layer', en: 'Layer Order' },
    opacity: { id: 'Transparansi', en: 'Opacity' },
    scale: { id: 'Ukuran', en: 'Size' },
    rotate_img: { id: 'Putar Gambar', en: 'Rotate Image' },
    rotate_pdf: { id: 'Putar Tampilan', en: 'Rotate View' },
    save_btn: { id: 'Simpan PDF', en: 'Save PDF' },
    delete: { id: 'Hapus', en: 'Remove' },
    duplicate: { id: 'Duplikat', en: 'Duplicate' },
    loading: { id: 'MEMUAT...', en: 'LOADING...' },
    saving: { id: 'MENYIMPAN...', en: 'SAVING...' },
    success_title: { id: 'Berhasil!', en: 'Success!' },
    success_desc: { id: 'Gambar berhasil disisipkan.', en: 'Image successfully inserted.' },
    download_btn: { id: 'Download PDF', en: 'Download PDF' },
    back_home: { id: 'Edit Lagi', en: 'Edit Another' },
    cancel: { id: 'Tutup', en: 'Close' },
    no_selection: { id: 'Klik gambar untuk mengedit', en: 'Click image to edit' },
    page: { id: 'Hal', en: 'Page' }
  };

  // --- PDF RENDER ---
  const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNumber: number, rotation: number) => {
    try {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5, rotation: rotation }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport }).promise;
            setPdfPreview(canvas.toDataURL());
        }
    } catch (error) {
        console.error("Error rendering page:", error);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processPdf(e.target.files[0]);
  };

  const processPdf = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') { alert("Harus file PDF!"); return; }
    setFile(uploadedFile);
    setIsProcessing(true);
    setPdfUrl(null);
    setPageRotation(0);
    setImages([]); 
    setPdfPreview(null);
    setCurrPage(1); 

    try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setPdfDocProxy(pdf);
        setNumPages(pdf.numPages); 
        await renderPage(pdf, 1, 0); 
    } catch (e) { alert("Gagal memuat PDF."); setFile(null); } finally { setIsProcessing(false); }
  };

  // --- PAGE NAVIGATION ---
  const changePage = (offset: number) => {
      if (!pdfDocProxy) return;
      const newPage = currPage + offset;
      if (newPage >= 1 && newPage <= numPages) {
          setCurrPage(newPage);
          setSelectedId(null); 
          renderPage(pdfDocProxy, newPage, pageRotation);
      }
  };

  const rotatePdf = () => {
    if (!pdfDocProxy) return;
    const newRotation = (pageRotation + 90) % 360;
    setPageRotation(newRotation);
    renderPage(pdfDocProxy, currPage, newRotation);
  };

  // --- IMAGE LOGIC ---
  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const imgFile = e.target.files[0];
        const previewUrl = URL.createObjectURL(imgFile);
        const img = new Image();
        img.src = previewUrl;
        img.onload = () => {
            const aspectRatio = img.width / img.height;
            const newImage: AddedImage = {
                id: Date.now().toString(), 
                file: imgFile, 
                preview: previewUrl, 
                x: 50, y: 50, scale: 30, opacity: 1, rotation: 0, 
                aspectRatio: aspectRatio,
                page: currPage 
            };
            setImages(prev => [...prev, newImage]);
            setSelectedId(newImage.id); 
            setMobileTab(1); 
            if (imgInputRef.current) imgInputRef.current.value = '';
        };
    }
  };

  const updateSelectedImage = (field: keyof AddedImage, value: any) => {
    if (!selectedId) return;
    setImages(prev => prev.map(img => img.id === selectedId ? { ...img, [field]: value } : img));
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateImage = (id: string) => {
    const target = images.find(img => img.id === id);
    if (target) {
        const newImage = { 
            ...target, 
            id: Date.now().toString(), 
            x: target.x + 5, y: target.y + 5,
            page: currPage 
        };
        setImages(prev => [...prev, newImage]);
        setSelectedId(newImage.id);
    }
  };

  // --- LAYER LOGIC ---
  const moveLayer = (direction: 'up' | 'down') => {
    if (!selectedId) return;
    const index = images.findIndex(img => img.id === selectedId);
    if (index === -1) return;
    
    const newImages = [...images];
    if (direction === 'up' && index < newImages.length - 1) {
        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    } else if (direction === 'down' && index > 0) {
        [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
    }
    setImages(newImages);
  };

  // --- LOGIKA DRAG ---
  const handleStartInteraction = (e: React.MouseEvent | React.TouchEvent, type: 'drag' | 'resize', id: string) => {
    e.stopPropagation();
    if (e.type !== 'touchstart') e.preventDefault(); 
    
    setSelectedId(id);
    const img = images.find(i => i.id === id);
    if (!img) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    setIsDragging(type === 'drag');
    setDragStart({ x: clientX, y: clientY });
    setInitialImgPos({ x: img.x, y: img.y, scale: img.scale });
    interactionType.current = type;
  };

  const handleInteractionMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (interactionType.current === 'none' || !selectedId || !containerRef.current) return;
    e.preventDefault(); 

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;

    if (interactionType.current === 'drag') {
        const deltaXPercent = (deltaX / rect.width) * 100;
        const deltaYPercent = (deltaY / rect.height) * 100;
        let newX = initialImgPos.x + deltaXPercent;
        let newY = initialImgPos.y + deltaYPercent;
        newX = Math.max(-20, Math.min(120, newX));
        newY = Math.max(-20, Math.min(120, newY));
        setImages(prev => prev.map(img => img.id === selectedId ? { ...img, x: newX, y: newY } : img));

    } else if (interactionType.current === 'resize') {
        const deltaScale = (deltaX / rect.width) * 100;
        let newScale = initialImgPos.scale + deltaScale;
        newScale = Math.max(5, Math.min(150, newScale));
        setImages(prev => prev.map(img => img.id === selectedId ? { ...img, scale: newScale } : img));
    }
  };

  const handleEndInteraction = () => {
    interactionType.current = 'none';
    setIsDragging(false);
  };

  // --- SAVE LOGIC (FIXED TYPESCRIPT ERROR) ---
  const handleSave = async () => {
    if (!file || images.length === 0) return;
    setIsSaving(true);
    try {
        const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
        const pages = pdfDoc.getPages(); 
        
        for (let i = 0; i < pages.length; i++) {
            const pageIndex = i + 1;
            const page = pages[i];
            
            const imagesOnThisPage = images.filter(img => img.page === pageIndex);
            
            if (imagesOnThisPage.length > 0) {
                 if (pageRotation !== 0) {
                    const currentRotation = page.getRotation().angle;
                    page.setRotation(degrees(currentRotation + pageRotation));
                 }

                 const { width, height } = page.getSize();
                 let effectiveWidth = width;
                 let effectiveHeight = height;
                 
                 if (pageRotation === 90 || pageRotation === 270) {
                      effectiveWidth = height;
                      effectiveHeight = width;
                 }

                 for (const imgData of imagesOnThisPage) {
                    const imgBuffer = await imgData.file.arrayBuffer();
                    let embeddedImage;
                    if (imgData.file.type === 'image/png') embeddedImage = await pdfDoc.embedPng(imgBuffer);
                    else embeddedImage = await pdfDoc.embedJpg(imgBuffer);

                    const tWidth = (imgData.scale / 100) * effectiveWidth;
                    const tHeight = tWidth / imgData.aspectRatio;
                    const pdfX = (imgData.x / 100) * effectiveWidth;
                    const pdfY = effectiveHeight - ((imgData.y / 100) * effectiveHeight);
                    
                    page.drawImage(embeddedImage, {
                        x: pdfX - (tWidth / 2),
                        y: pdfY - (tHeight / 2), 
                        width: tWidth, height: tHeight, opacity: imgData.opacity,
                        rotate: degrees(-imgData.rotation) 
                    });
                 }
            }
        }
        
        const pdfBytes = await pdfDoc.save();
        // FIX: Cast to any to avoid TypeScript strictness error
        setPdfUrl(URL.createObjectURL(new Blob([pdfBytes as any], { type: 'application/pdf' })));
    } catch (e) { alert("Error saving."); } finally { setIsSaving(false); }
  };

  const resetAll = () => {
    setFile(null); setImages([]); setPdfUrl(null); setPdfPreview(null); setPageRotation(0); setCurrPage(1);
  };

  const handleBackgroundClick = () => {
      setSelectedId(null);
  };

  if (!isLoaded) return null;

  return (
    <div 
      className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col overflow-hidden select-none"
      onMouseMove={handleInteractionMove} 
      onTouchMove={handleInteractionMove} 
      onMouseUp={handleEndInteraction} 
      onTouchEnd={handleEndInteraction}
    >
      <nav className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-green-600 text-white p-1.5 rounded-lg group-hover:scale-105 transition-transform"><ImagePlus size={20} /></div>
          <span className="font-bold text-xl tracking-tight text-slate-900 italic uppercase">Add<span className="text-green-600">Image</span></span>
        </Link>
        <div className="flex items-center gap-3">
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
                    <div className="flex flex-col items-center gap-6">
                        <button onClick={() => pdfInputRef.current?.click()} className="group relative bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-5 px-16 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
                           {isProcessing ? <Loader2 className="animate-spin" size={24}/> : <FileText size={24} />} {isProcessing ? T.loading[lang] : T.select_pdf[lang]}
                        </button>
                    </div>
                    <div className="flex justify-center mt-8"><AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" /></div>
                    <input type="file" accept="application/pdf" ref={pdfInputRef} onChange={handlePdfUpload} className="hidden" />
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
                        <div className="flex flex-col gap-4">
                           <a href={pdfUrl} download={`ImageAdded_${file?.name}`} className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"><Download size={20} /> {T.download_btn[lang]}</a>
                           <button onClick={resetAll} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"><ArrowLeft size={16} /> {T.back_home[lang]}</button>
                        </div>
                    </div>
                    <div className="flex justify-center mt-8"><AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" /></div>
                </div>
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
              </div>
          </div>
        ) : (
          <div className="flex flex-col h-full md:flex-row md:p-6 md:gap-6 max-w-[1600px] mx-auto w-full">
            <div className="md:hidden flex border-b border-slate-200 bg-white sticky top-0 z-20 shrink-0">
               <button onClick={() => setMobileTab(0)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 0 ? 'border-green-600 text-green-600' : 'border-transparent text-slate-400'}`}>{T.tab_editor[lang]}</button>
               <button onClick={() => setMobileTab(1)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 1 ? 'border-green-600 text-green-600' : 'border-transparent text-slate-400'}`}>{T.tab_settings[lang]}</button>
            </div>

            <div 
                className={`flex-1 bg-slate-100 md:bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 md:p-8 flex flex-col relative overflow-hidden ${mobileTab === 0 ? 'flex' : 'hidden md:flex'}`}
                onClick={handleBackgroundClick}
            >
                <div className="flex justify-center mb-4 shrink-0 overflow-hidden px-4">
                   <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                   <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>

                {/* TOP TOOLBAR: PAGINATION & ROTATION */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-white/90 backdrop-blur p-1.5 rounded-full shadow-lg border border-slate-200 items-center">
                     {/* Pagination Controls */}
                     <div className="flex items-center gap-1 bg-slate-100 rounded-full px-1">
                        <button 
                            onClick={(e) => {e.stopPropagation(); changePage(-1);}} 
                            disabled={currPage <= 1}
                            className="p-1.5 hover:bg-white rounded-full text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            <ChevronLeft size={16}/>
                        </button>
                        <span className="text-[10px] font-bold text-slate-500 w-16 text-center">{T.page[lang]} {currPage} / {numPages}</span>
                        <button 
                            onClick={(e) => {e.stopPropagation(); changePage(1);}} 
                            disabled={currPage >= numPages}
                            className="p-1.5 hover:bg-white rounded-full text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            <ChevronRight size={16}/>
                        </button>
                     </div>

                     <div className="w-px bg-slate-300 mx-1 h-4"></div>
                     <button onClick={(e) => {e.stopPropagation(); rotatePdf();}} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 tooltip" title={T.rotate_pdf[lang]}><RotateCw size={18}/></button>
                     <div className="w-px bg-slate-300 mx-1 h-4"></div>
                     <button onClick={(e) => {e.stopPropagation(); setImages([]);}} className="p-2 hover:bg-red-50 text-red-500 rounded-full" title="Clear All"><Trash2 size={18}/></button>
                </div>

                <div className="flex-1 overflow-auto flex items-center justify-center p-4">
                    <div 
                        ref={containerRef} 
                        className="relative shadow-2xl border-4 border-white bg-white select-none transition-all duration-200"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        {pdfPreview ? (
                           <img src={pdfPreview} className="max-h-[50vh] md:max-h-[600px] object-contain pointer-events-none block" draggable={false} />
                        ) : (
                           <div className="w-[300px] h-[400px] flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={40}/></div>
                        )}
                        
                        {/* HANYA RENDER GAMBAR YANG ADA DI HALAMAN INI */}
                        {images.filter(img => img.page === currPage).map((img, index) => (
                            <div 
                              key={img.id}
                              onMouseDown={(e) => handleStartInteraction(e, 'drag', img.id)}
                              onTouchStart={(e) => handleStartInteraction(e, 'drag', img.id)}
                              onClick={(e) => e.stopPropagation()} 
                              className="absolute cursor-move group touch-none" 
                              style={{ 
                                left: `${img.x}%`, 
                                top: `${img.y}%`, 
                                width: `${img.scale}%`, 
                                transform: `translate(-50%, -50%) rotate(${img.rotation}deg)`, 
                                opacity: img.opacity,
                                aspectRatio: `${img.aspectRatio}/1`,
                                zIndex: 10 + index 
                              }}
                            >
                                <img 
                                    src={img.preview} 
                                    className={`w-full h-full object-contain pointer-events-none transition-all select-none ${selectedId === img.id ? 'border-2 border-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.2)]' : 'border border-transparent hover:border-green-300/50'}`} 
                                    draggable={false}
                                />
                                {selectedId === img.id && (
                                    <div className="absolute -top-3 -left-3 bg-green-600 text-white text-[8px] px-1.5 py-0.5 rounded shadow z-50 whitespace-nowrap">
                                        Layer {index + 1}
                                    </div>
                                )}
                                {selectedId === img.id && (
                                    <div 
                                        onMouseDown={(e) => handleStartInteraction(e, 'resize', img.id)}
                                        onTouchStart={(e) => handleStartInteraction(e, 'resize', img.id)}
                                        className="absolute -bottom-3 -right-3 w-8 h-8 bg-green-600 rounded-full border-2 border-white cursor-nwse-resize shadow-lg flex items-center justify-center z-[999] hover:scale-125 transition-transform touch-none"
                                    >
                                        <Scaling size={14} className="text-white"/>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={`w-full md:w-96 bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 p-6 overflow-y-auto shrink-0 ${mobileTab === 1 ? 'block' : 'hidden md:block'}`}>
                <h3 className="font-black text-[10px] text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2"><Settings2 size={14}/> {T.tab_settings[lang]}</h3>

                <div className="space-y-6">
                    <button onClick={() => imgInputRef.current?.click()} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all gap-2 group font-bold">
                        <ImagePlus size={20}/> {T.add_img[lang]}
                    </button>
                    <input type="file" multiple accept="image/*" ref={imgInputRef} onChange={handleAddImage} className="hidden" />

                    {selectedId ? (
                        <div className="space-y-6 animate-in slide-in-from-right duration-200">
                             <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                <img src={images.find(i => i.id === selectedId)?.preview} className="w-12 h-12 rounded bg-slate-100 object-cover border border-slate-200"/>
                                <div>
                                    <p className="text-xs font-bold text-slate-700 uppercase">Layer Selected</p>
                                    <p className="text-[10px] text-slate-400">On Page {currPage}</p>
                                </div>
                                <div className="ml-auto flex gap-1">
                                    <button onClick={() => duplicateImage(selectedId)} className="p-2 hover:bg-green-50 text-green-600 rounded-lg border border-slate-100 hover:border-green-200"><Copy size={16}/></button>
                                    <button onClick={() => removeImage(selectedId)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg border border-slate-100 hover:border-red-200"><Trash2 size={16}/></button>
                                </div>
                             </div>

                             <div>
                                <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-widest flex items-center gap-2 justify-between">
                                    <span className="flex gap-2 items-center"><Globe size={12}/> {T.opacity[lang]}</span>
                                    <span>{Math.round((images.find(i => i.id === selectedId)?.opacity || 1) * 100)}%</span>
                                </label>
                                <input 
                                    type="range" min="0.1" max="1" step="0.1" 
                                    value={images.find(i => i.id === selectedId)?.opacity || 1} 
                                    onChange={(e) => updateSelectedImage('opacity', parseFloat(e.target.value))} 
                                    className="w-full accent-green-600 h-1.5 bg-slate-200 rounded-full" 
                                />
                             </div>

                             <div>
                                <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-widest flex items-center gap-2"><Scaling size={12}/> {T.scale[lang]}</label>
                                <input 
                                    type="range" min="5" max="150" 
                                    value={images.find(i => i.id === selectedId)?.scale || 30} 
                                    onChange={(e) => updateSelectedImage('scale', parseInt(e.target.value))} 
                                    className="w-full accent-green-600 h-1.5 bg-slate-200 rounded-full" 
                                />
                             </div>

                             <div>
                                <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-widest flex items-center gap-2 justify-between">
                                    <span className="flex gap-2 items-center"><RotateCw size={12}/> {T.rotate_img[lang]}</span>
                                    <span>{images.find(i => i.id === selectedId)?.rotation || 0}°</span>
                                </label>
                                <input 
                                    type="range" min="0" max="360" step="5" 
                                    value={images.find(i => i.id === selectedId)?.rotation || 0} 
                                    onChange={(e) => updateSelectedImage('rotation', parseInt(e.target.value))} 
                                    className="w-full accent-green-600 h-1.5 bg-slate-200 rounded-full" 
                                />
                             </div>

                             <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">{T.layers[lang]}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => moveLayer('up')} className="flex-1 py-2 bg-white border border-slate-200 rounded hover:bg-slate-50 flex justify-center text-slate-600 gap-2 text-xs font-bold hover:text-green-600"><ChevronUp size={16}/> Ke Depan</button>
                                    <button onClick={() => moveLayer('down')} className="flex-1 py-2 bg-white border border-slate-200 rounded hover:bg-slate-50 flex justify-center text-slate-600 gap-2 text-xs font-bold hover:text-green-600"><ChevronDown size={16}/> Ke Belakang</button>
                                </div>
                             </div>
                        </div>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-center p-4">
                            <MousePointer2 size={32} className="mb-2 opacity-20"/>
                            <p className="text-xs font-medium text-slate-400">{T.no_selection[lang]}</p>
                            <p className="text-[10px] text-slate-300 mt-1">Klik latar belakang untuk membatalkan pilihan</p>
                        </div>
                    )}
                    <div className="pt-4 border-t border-slate-100 flex justify-center">
                        <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                    </div>
                    <button onClick={handleSave} disabled={isSaving || images.length === 0} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
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

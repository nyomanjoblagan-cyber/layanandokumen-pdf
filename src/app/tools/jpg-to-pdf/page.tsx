'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  Image as ImageIcon, FileText, CheckCircle2, Download, Globe, 
  X, ArrowLeft, Loader2, Settings2, Plus, Trash2, ImagePlus, 
  GripVertical, BarChart3, Maximize2, Minimize2
} from 'lucide-react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import AdsterraBanner from '@/components/AdsterraBanner';

export default function JpgToPdfPage() {
  // STATE UTAMA
  const [files, setFiles] = useState<{id: string, file: File, preview: string, width: number, height: number}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // SETTINGS
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<number>(20);
  const [quality, setQuality] = useState<'original' | 'medium' | 'low'>('original');

  // UI & BAHASA
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [mobileTab, setMobileTab] = useState<0 | 1>(0); 
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. LOGIKA BAHASA ---
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

  // --- 2. KAMUS ---
  const T = {
    hero_title: { id: 'JPG ke PDF', en: 'JPG to PDF' },
    hero_desc: { id: 'Ubah foto jadi PDF dengan live preview orientasi.', en: 'Convert photos to PDF with live orientation preview.' },
    select_btn: { id: 'Pilih Gambar', en: 'Select Images' },
    drop_text: { id: 'atau tarik foto ke sini', en: 'or drop photos here' },
    
    // Tabs
    tab_files: { id: 'Daftar Foto', en: 'Photo List' },
    tab_settings: { id: 'Pengaturan', en: 'Settings' },
    
    // Settings
    label_orient: { id: 'Orientasi Halaman', en: 'Page Orientation' },
    label_margin: { id: 'Margin', en: 'Margin' },
    label_quality: { id: 'Kualitas Gambar', en: 'Image Quality' },
    
    // Quality Options
    q_original: { id: 'Asli', en: 'Original' },
    q_medium: { id: 'Sedang', en: 'Medium' },
    q_low: { id: 'Rendah', en: 'Low' },
    q_desc: { id: 'Pilih kualitas untuk mengatur ukuran file PDF.', en: 'Select quality to manage PDF file size.' },

    // Actions
    btn_save: { id: 'Konversi PDF', en: 'Convert PDF' },
    btn_add: { id: 'Tambah', en: 'Add' },
    
    // Status
    loading: { id: 'MEMPROSES...', en: 'PROCESSING...' },
    success_title: { id: 'Selesai!', en: 'Success!' },
    success_desc: { id: 'Foto berhasil disatukan ke PDF.', en: 'Photos merged into PDF successfully.' },
    download_btn: { id: 'Download PDF', en: 'Download PDF' },
    back_home: { id: 'Ulangi', en: 'Repeat' },
    cancel: { id: 'Tutup', en: 'Close' },
  };

  // --- 3. HANDLE FILES dengan DIMENSI ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFilesPromises = Array.from(e.target.files)
        .filter(f => f.type.startsWith('image/'))
        .map(f => {
          return new Promise<{id: string, file: File, preview: string, width: number, height: number}>((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(f);
            img.onload = () => {
              resolve({
                id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                file: f,
                preview: img.src,
                width: img.width,
                height: img.height
              });
            };
            img.onerror = () => {
              // Fallback jika gagal load dimensi
              resolve({
                id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                file: f,
                preview: URL.createObjectURL(f),
                width: 800,
                height: 600
              });
            };
          });
        });

      Promise.all(newFilesPromises).then(newFiles => {
        setFiles(prev => [...prev, ...newFiles]);
      });
    }
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // --- 4. FUNGSI UNTUK LIVE PREVIEW ORIENTATION ---
  const getPreviewStyle = (imgWidth: number, imgHeight: number) => {
    // A4 ratio: 1:1.414 (portrait) atau 1.414:1 (landscape)
    const A4_RATIO = 1.414; // height/width ratio for A4 portrait
    
    let containerWidth, containerHeight;
    
    if (orientation === 'portrait') {
      // Container portrait: tinggi > lebar
      containerWidth = 100; // relative width
      containerHeight = containerWidth * A4_RATIO; // 141.4% dari width
    } else {
      // Container landscape: lebar > tinggi  
      containerHeight = 100; // relative height
      containerWidth = containerHeight * A4_RATIO; // 141.4% dari height
    }
    
    // Hitung skala untuk gambar dalam container
    const containerAspect = containerWidth / containerHeight;
    const imageAspect = imgWidth / imgHeight;
    
    let scale, top, left;
    
    if (imageAspect > containerAspect) {
      // Gambar lebih lebar, fit to width
      scale = containerWidth / 100; // konversi ke persen
      left = '0%';
      top = `${50 - ((containerHeight * scale) / 2)}%`;
    } else {
      // Gambar lebih tinggi, fit to height
      scale = containerHeight / 100;
      top = '0%';
      left = `${50 - ((containerWidth * scale) / 2)}%`;
    }
    
    return {
      container: {
        width: `${containerWidth}%`,
        height: `${containerHeight}%`,
        aspectRatio: containerWidth / containerHeight
      },
      image: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        position: 'absolute' as const,
        top,
        left
      }
    };
  };

  // --- 5. DRAG & DROP REORDER ---
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFiles(items);
  };

  // --- 6. HELPER: COMPRESS IMAGE TO BUFFER ---
  const compressImage = (file: File, qualityValue: number): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject("Canvas error"); return; }
        
        // Fill white background (for PNG transparency)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // Convert to JPEG with quality
        canvas.toBlob((blob) => {
          if (blob) {
            blob.arrayBuffer().then(resolve).catch(reject);
          } else {
            reject("Compression failed");
          }
        }, 'image/jpeg', qualityValue);
      };
      img.onerror = reject;
    });
  };

  // --- 7. CONVERT ENGINE ---
  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    
    try {
        const pdfDoc = await PDFDocument.create();
        
        for (let i = 0; i < files.length; i++) {
            const fileObj = files[i];
            // Update Progress
            setProgress(Math.round(((i) / files.length) * 100));

            let imageBytes: ArrayBuffer;
            let embeddedImage;

            // Logika Kompresi & Embed
            if (quality === 'original') {
               // Coba embed langsung dulu
               imageBytes = await fileObj.file.arrayBuffer();
               
               try {
                   if (fileObj.file.type === 'image/png') {
                       try {
                           embeddedImage = await pdfDoc.embedPng(imageBytes);
                       } catch (pngErr) {
                           console.warn("PNG embed gagal, convert ke JPEG...");
                           imageBytes = await compressImage(fileObj.file, 0.95);
                           embeddedImage = await pdfDoc.embedJpg(imageBytes);
                       }
                   } else {
                       embeddedImage = await pdfDoc.embedJpg(imageBytes);
                   }
               } catch (err) {
                   console.error("Embed error, fallback ke canvas:", err);
                   imageBytes = await compressImage(fileObj.file, 0.9);
                   embeddedImage = await pdfDoc.embedJpg(imageBytes);
               }
            } else {
               // Kompresi (Medium 0.7, Low 0.4)
               const qValue = quality === 'medium' ? 0.7 : 0.4;
               imageBytes = await compressImage(fileObj.file, qValue);
               embeddedImage = await pdfDoc.embedJpg(imageBytes);
            }

            // Hitung Ukuran Halaman (A4)
            const A4_PORTRAIT_WIDTH = 595.28;
            const A4_PORTRAIT_HEIGHT = 841.89;
            
            let pageWidth, pageHeight;
            
            if (orientation === 'portrait') {
                pageWidth = A4_PORTRAIT_WIDTH;
                pageHeight = A4_PORTRAIT_HEIGHT;
            } else {
                pageWidth = A4_PORTRAIT_HEIGHT; // Lebar jadi tinggi
                pageHeight = A4_PORTRAIT_WIDTH; // Tinggi jadi lebar
            }

            const page = pdfDoc.addPage([pageWidth, pageHeight]);

            // Hitung Skala & Posisi
            const availW = pageWidth - (margin * 2);
            const availH = pageHeight - (margin * 2);
            const scale = Math.min(availW / embeddedImage.width, availH / embeddedImage.height);
            const dims = embeddedImage.scale(scale);

            page.drawImage(embeddedImage, {
                x: (pageWidth - dims.width) / 2,
                y: (pageHeight - dims.height) / 2,
                width: dims.width,
                height: dims.height
            });
        }
        
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        setPdfUrl(URL.createObjectURL(blob));
        setProgress(100);
    } catch (e) { 
        console.error("Conversion error:", e);
        alert("Gagal memproses. Coba kurangi jumlah foto atau periksa format gambar."); 
    } finally { 
        setIsProcessing(false); 
    }
  };

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      files.forEach(f => URL.revokeObjectURL(f.preview));
    };
  }, [files]);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col overflow-hidden text-slate-800 font-sans">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-orange-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><ImageIcon size={20} /></div>
          <span className="font-bold text-xl tracking-tight text-slate-900 italic uppercase">JPG<span className="text-orange-600">2PDF</span></span>
        </Link>
        <div className="flex items-center gap-4">
           <button onClick={toggleLang} className="text-[10px] font-bold px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all uppercase tracking-widest text-slate-600">{lang}</button>
           <Link href="/" className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-500 transition-colors bg-red-50 px-4 py-2 rounded-lg border border-slate-100">
             <X size={16} /> {T.cancel[lang]}
           </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden relative">
        {/* INPUT FILE YANG BISA DIAKSES DARI SEMUA VIEW */}
        <input 
          type="file" 
          multiple 
          accept="image/jpeg,image/png,image/webp" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        {/* VIEW 1: UPLOAD */}
        {files.length === 0 ? (
          <div 
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-colors ${isDraggingOver ? 'bg-orange-50' : 'bg-[#F8FAFC]'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                if (e.dataTransfer.files) {
                    const filesArray = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                    const newFilesPromises = filesArray.map(f => {
                      return new Promise<{id: string, file: File, preview: string, width: number, height: number}>((resolve) => {
                        const img = new Image();
                        img.src = URL.createObjectURL(f);
                        img.onload = () => {
                          resolve({
                            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            file: f,
                            preview: img.src,
                            width: img.width,
                            height: img.height
                          });
                        };
                      });
                    });
                    
                    Promise.all(newFilesPromises).then(newFiles => {
                      setFiles(prev => [...prev, ...newFiles]);
                    });
                }
            }}
          >
             {/* ... Kode upload view sama seperti sebelumnya ... */}
          </div>
        ) : pdfUrl ? (
          // VIEW 2: DOWNLOAD
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white overflow-y-auto">
             {/* ... Kode download view sama seperti sebelumnya ... */}
          </div>
        ) : (
          // VIEW 3: EDITOR GRID & SETTINGS DENGAN LIVE PREVIEW
          <div className="flex flex-col h-full md:flex-row md:p-6 md:gap-6 max-w-[1600px] mx-auto w-full">
            {/* MOBILE TABS */}
            <div className="md:hidden flex border-b border-slate-200 bg-white sticky top-0 z-20 shrink-0">
               <button onClick={() => setMobileTab(0)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 0 ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-400'}`}>{T.tab_files[lang]}</button>
               <button onClick={() => setMobileTab(1)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${mobileTab === 1 ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-400'}`}>{T.tab_settings[lang]}</button>
            </div>

            {/* GRID AREA (Left) DENGAN LIVE PREVIEW */}
            <div className={`flex-1 flex flex-col h-full bg-slate-100 md:bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 md:p-8 overflow-hidden relative ${mobileTab === 0 ? 'flex' : 'hidden md:flex'}`}>
                {/* ADS TOP */}
                <div className="flex justify-center mb-4 shrink-0 overflow-hidden px-4">
                   <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                   <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 md:p-0">
                    {/* ORIENTATION INDICATOR */}
                    <div className="mb-4 flex items-center justify-center gap-2">
                        <div className={`text-xs font-bold px-3 py-1 rounded-full ${orientation === 'portrait' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                            {orientation === 'portrait' ? '📐 PORTRAIT' : '🌄 LANDSCAPE'}
                        </div>
                        <div className="text-xs text-slate-500">
                            {files.length} gambar • Preview aktif
                        </div>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="images" direction="horizontal">
                            {(prov) => (
                                <div {...prov.droppableProps} ref={prov.innerRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {files.map((f, i) => {
                                        const previewStyle = getPreviewStyle(f.width, f.height);
                                        
                                        return (
                                            <Draggable key={f.id} draggableId={f.id} index={i}>
                                                {(p, s) => (
                                                    <div 
                                                        ref={p.innerRef} 
                                                        {...p.draggableProps} 
                                                        {...p.dragHandleProps} 
                                                        className={`relative bg-white rounded-2xl border-2 transition-all group overflow-hidden shadow-lg ${
                                                            s.isDragging ? 'border-orange-500 z-50 shadow-2xl scale-105 rotate-2' : 
                                                            orientation === 'portrait' ? 'border-blue-200' : 'border-green-200'
                                                        }`}
                                                        style={{
                                                            aspectRatio: previewStyle.container.aspectRatio
                                                        }}
                                                    >
                                                        {/* PAGE SIMULATION */}
                                                        <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50 rounded-2xl"></div>
                                                        
                                                        {/* PAGE BORDER */}
                                                        <div className={`absolute inset-0.5 rounded-[15px] border ${orientation === 'portrait' ? 'border-blue-100' : 'border-green-100'}`}></div>
                                                        
                                                        {/* IMAGE PREVIEW */}
                                                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
                                                            <div 
                                                                className="relative"
                                                                style={previewStyle.container}
                                                            >
                                                                <img 
                                                                    src={f.preview} 
                                                                    alt="Preview" 
                                                                    className="absolute max-w-none"
                                                                    style={previewStyle.image}
                                                                />
                                                            </div>
                                                        </div>
                                                        
                                                        {/* PAGE MARGIN VISUALIZATION */}
                                                        <div 
                                                            className="absolute inset-0 border-2 border-dashed border-slate-300/50 rounded-2xl pointer-events-none"
                                                            style={{
                                                                margin: `${margin / 2}px`
                                                            }}
                                                        ></div>
                                                        
                                                        {/* CONTROLS */}
                                                        <div className="absolute top-2 left-2 w-7 h-7 bg-slate-900/90 backdrop-blur text-white text-xs font-bold rounded-full flex items-center justify-center border border-white/20">
                                                            {i+1}
                                                        </div>
                                                        
                                                        <button 
                                                            onClick={() => removeFile(f.id)} 
                                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={14}/>
                                                        </button>
                                                        
                                                        <div className="absolute bottom-2 right-2 p-1.5 bg-black/30 rounded-full text-white opacity-0 group-hover:opacity-100">
                                                            <GripVertical size={14}/>
                                                        </div>
                                                        
                                                        {/* ORIENTATION BADGE */}
                                                        <div className={`absolute bottom-2 left-2 px-2 py-1 rounded-full text-[9px] font-bold uppercase ${
                                                            orientation === 'portrait' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                                                        }`}>
                                                            {orientation === 'portrait' ? 'P' : 'L'}
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {prov.placeholder}
                                    
                                    {/* TOMBOL TAMBAH GAMBAR */}
                                    <div 
                                      onClick={() => fileInputRef.current?.click()} 
                                      className="border-3 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white hover:border-orange-400 transition-all text-slate-400 group bg-gradient-to-b from-slate-50 to-white"
                                      style={{
                                        aspectRatio: orientation === 'portrait' ? 1/1.414 : 1.414/1
                                      }}
                                    >
                                        <div className="p-4 bg-slate-100 rounded-full group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                          <Plus size={28}/>
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-widest">
                                          {T.btn_add[lang]}
                                        </span>
                                        <span className="text-[10px] text-slate-300">
                                          {orientation === 'portrait' ? 'Portrait' : 'Landscape'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>

                {/* ADS BOTTOM */}
                <div className="flex justify-center mt-4 shrink-0 overflow-hidden px-4">
                   <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                   <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                </div>
            </div>

            {/* SIDEBAR (Right) */}
            <div className={`w-full md:w-80 bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 p-6 overflow-y-auto shrink-0 ${mobileTab === 1 ? 'block' : 'hidden md:block'}`}>
                <h3 className="font-black text-[10px] text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2"><Settings2 size={14}/> {T.tab_settings[lang]}</h3>
                
                <div className="space-y-6">
                    {/* ORIENTATION - DENGAN LIVE FEEDBACK */}
                    <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-widest">{T.label_orient[lang]}</label>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => setOrientation('portrait')} 
                             className={`flex-1 p-3 rounded-xl border-2 text-[10px] font-bold transition-all uppercase tracking-wider flex flex-col items-center justify-center gap-2 ${orientation === 'portrait' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:border-blue-200'}`}
                           >
                             <div className={`w-6 h-8 border-2 ${orientation === 'portrait' ? 'border-blue-600' : 'border-slate-300'} rounded`}></div>
                             <span>Portrait</span>
                           </button>
                           
                           <button 
                             onClick={() => setOrientation('landscape')} 
                             className={`flex-1 p-3 rounded-xl border-2 text-[10px] font-bold transition-all uppercase tracking-wider flex flex-col items-center justify-center gap-2 ${orientation === 'landscape' ? 'border-green-600 bg-green-50 text-green-600' : 'border-slate-100 text-slate-400 hover:border-green-200'}`}
                           >
                             <div className={`w-8 h-6 border-2 ${orientation === 'landscape' ? 'border-green-600' : 'border-slate-300'} rounded`}></div>
                             <span>Landscape</span>
                           </button>
                        </div>
                        
                        {/* LIVE PREVIEW FEEDBACK */}
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">Live Preview:</p>
                            <p className="text-[10px] text-slate-500">
                                Semua thumbnail akan menyesuaikan bentuk {orientation === 'portrait' ? 'portrait (tinggi > lebar)' : 'landscape (lebar > tinggi)'}
                            </p>
                        </div>
                    </div>

                    {/* MARGIN */}
                    <div>
                        <div className="flex justify-between text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">
                          <span>{T.label_margin[lang]}</span>
                          <span className={`${margin === 0 ? 'text-red-500' : 'text-blue-500'}`}>{margin}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          step="10" 
                          value={margin} 
                          onChange={(e) => setMargin(parseInt(e.target.value))} 
                          className="w-full accent-orange-600 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer" 
                        />
                        <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                            <span>Tidak ada</span>
                            <span>Sedang</span>
                            <span>Besar</span>
                        </div>
                    </div>

                    {/* QUALITY */}
                    <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-widest flex items-center gap-2">
                          <BarChart3 size={12}/> {T.label_quality[lang]}
                        </label>
                        <div className="flex flex-col gap-2">
                           <button onClick={() => setQuality('original')} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${quality === 'original' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                              <span className="text-xs font-bold uppercase">{T.q_original[lang]}</span>
                              {quality === 'original' && <CheckCircle2 size={14} className="text-orange-500"/>}
                           </button>
                           <button onClick={() => setQuality('medium')} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${quality === 'medium' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                              <span className="text-xs font-bold uppercase">{T.q_medium[lang]}</span>
                              {quality === 'medium' && <CheckCircle2 size={14} className="text-orange-500"/>}
                           </button>
                           <button onClick={() => setQuality('low')} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${quality === 'low' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                              <span className="text-xs font-bold uppercase">{T.q_low[lang]}</span>
                              {quality === 'low' && <CheckCircle2 size={14} className="text-orange-500"/>}
                           </button>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-2 font-medium">{T.q_desc[lang]}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-center">
                        <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                    </div>

                    <button 
                      onClick={handleConvert} 
                      disabled={isProcessing || files.length === 0} 
                      className="w-full bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600 disabled:from-slate-300 disabled:to-slate-400 disabled:text-slate-400 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 uppercase text-xs tracking-widest"
                    >
                        {isProcessing ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={18}/> 
                            {progress}%
                          </div>
                        ) : (
                          <>
                            <FileText size={18}/> 
                            {T.btn_save[lang]}
                          </>
                        )}
                    </button>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

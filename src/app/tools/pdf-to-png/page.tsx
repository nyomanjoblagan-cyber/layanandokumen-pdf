'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { 
  FileImage, Settings2, Download, Globe,
  CheckCircle2, X, ArrowLeft, Loader2, Image as ImageIcon, Trash2
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// 1. WORKER STABIL (Wajib)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export default function PdfToPngPage() {
  // STATE UTAMA
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<string[]>([]); // Array Base64 PNG Images
  const [isProcessing, setIsProcessing] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  
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
    hero_title: { id: 'Konversi PDF ke PNG', en: 'Convert PDF to PNG' },
    hero_desc: { 
      id: 'Ubah halaman PDF menjadi gambar PNG berkualitas tinggi (Lossless). Cocok untuk grafis dan teks tajam.', 
      en: 'Turn PDF pages into high-quality PNG images (Lossless). Perfect for graphics and sharp text.' 
    },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    drop_text: { id: 'atau tarik file PDF ke sini', en: 'or drop PDF file here' },
    
    // Status
    converting: { id: 'Mengekstrak PNG...', en: 'Extracting PNG...' },
    preview: { id: 'Galeri PNG', en: 'PNG Gallery' },
    
    // Actions
    download_zip: { id: 'Download Semua (ZIP)', en: 'Download All (ZIP)' },
    download_single: { id: 'Simpan', en: 'Save' },
    back_home: { id: 'Konversi Lagi', en: 'Convert Another' },
    cancel: { id: 'Tutup', en: 'Close' },
    
    // Info
    info: { id: 'Info File', en: 'File Info' },
    pages_count: { id: 'Halaman', en: 'Pages' }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  // --- 4. ENGINE KONVERSI (PDF -> CANVAS -> PNG) ---
  const processFile = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') {
        alert("Mohon pilih file PDF.");
        return;
    }

    setFile(uploadedFile);
    setIsProcessing(true);
    setPages([]);
    setZipUrl(null);

    try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        const totalPages = pdf.numPages;
        const extractedImages: string[] = [];

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            
            // Scale 1.5 = Kualitas Tajam
            const viewport = page.getViewport({ scale: 1.5 });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                // Perbedaan utama dengan JPG: Menggunakan 'image/png'
                extractedImages.push(canvas.toDataURL('image/png'));
            }
        }

        setPages(extractedImages);
        
        // Auto Generate ZIP
        if (extractedImages.length > 0) {
            generateZip(extractedImages, uploadedFile.name);
        }

    } catch (e) {
        console.error(e);
        alert("Gagal memproses PDF.");
        setFile(null);
    } finally {
        setIsProcessing(false);
    }
  };

  // --- 5. ZIP GENERATOR ---
  const generateZip = async (images: string[], filename: string) => {
    const zip = new JSZip();
    
    images.forEach((imgData, idx) => {
        const data = imgData.split(',')[1];
        zip.file(`page_${idx + 1}.png`, data, { base64: true });
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    setZipUrl(url);
  };

  const resetAll = () => {
    setFile(null);
    setPages([]);
    setZipUrl(null);
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans relative selection:bg-blue-100 selection:text-blue-700 flex flex-col overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-teal-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><FileImage size={18} /></div>
          <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900 italic uppercase">
              <span className="md:hidden">PDF to <span className="text-teal-600">PNG</span></span>
              <span className="hidden md:inline">PDF<span className="text-teal-600">2PNG</span> Pro</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
           <button onClick={toggleLang} className="text-[10px] font-bold px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all uppercase tracking-widest text-slate-600">{lang}</button>
           <Link href="/" className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-500 transition-colors bg-red-50 px-4 py-2 rounded-lg border border-slate-100">
              <X size={16} /> {T.cancel[lang]}
           </Link>
        </div>
      </nav>

      <main className="flex-1 relative z-10 flex flex-col h-[calc(100dvh-64px)] md:h-auto overflow-y-auto">
        
        {/* VIEW 1: UPLOAD */}
        {!file && (
          <div 
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-all ${isDraggingOver ? 'bg-teal-50/50' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
          >
             <div className="w-full max-w-[1400px] flex gap-4 xl:gap-8 justify-center items-start pt-4 md:pt-10">
                <div className="hidden xl:block sticky top-20"><AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" /></div>
                
                <div className="flex-1 max-w-2xl space-y-10 animate-in fade-in zoom-in duration-500 py-10">
                    <div className="flex justify-center"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
                    
                    <div className="space-y-4 px-4">
                      <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{T.hero_title[lang]}</h1>
                      <p className="text-slate-500 font-medium text-lg leading-relaxed">{T.hero_desc[lang]}</p>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                        <button onClick={() => fileInputRef.current?.click()} className="group relative bg-teal-600 hover:bg-teal-700 text-white text-lg font-bold py-5 px-16 rounded-2xl shadow-xl shadow-teal-200 transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto uppercase tracking-widest">
                           <FileImage size={24} /> {T.select_btn[lang]}
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

        {/* VIEW 2: PROCESSING & RESULT */}
        {file && (
          <div className="flex flex-col h-full md:p-6 md:gap-6 max-w-[1600px] mx-auto w-full">
            {/* ADS TOP */}
            <div className="flex justify-center mb-4 shrink-0 overflow-hidden px-4">
               <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
               <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
                
                {/* SIDEBAR (INFO & ACTION) */}
                <div className="w-full lg:w-80 space-y-6 shrink-0 order-1 lg:order-1 px-4 lg:px-0">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
                        <h3 className="font-black text-[10px] text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2"><Settings2 size={14}/> {T.info[lang]}</h3>
                        
                        <div className="mb-6">
                            <p className="font-bold text-slate-700 truncate mb-1 text-sm">{file.name}</p>
                            <span className="text-[10px] bg-teal-50 text-teal-600 px-2 py-1 rounded font-bold uppercase tracking-wide">
                                {isProcessing ? T.converting[lang] : `${pages.length} ${T.pages_count[lang]}`}
                            </span>
                        </div>

                        {isProcessing ? (
                            <div className="flex flex-col items-center justify-center py-4 text-teal-500">
                                <Loader2 className="animate-spin mb-2" size={24} />
                                <span className="text-[10px] font-bold animate-pulse text-center uppercase tracking-widest">{T.converting[lang]}</span>
                            </div>
                        ) : (
                            zipUrl && (
                                <a href={zipUrl} download={`${file.name.replace('.pdf', '')}_png_images.zip`} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 text-xs active:scale-95 transition-all flex items-center justify-center gap-2 mb-4 cursor-pointer uppercase tracking-widest">
                                    <Download size={16}/> {T.download_zip[lang]}
                                </a>
                            )
                        )}

                        {!isProcessing && (
                             <button onClick={resetAll} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                                <Trash2 size={14} /> {T.back_home[lang]}
                             </button>
                        )}
                    </div>
                    
                    <div className="flex justify-center pt-2">
                        <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                    </div>
                </div>

                {/* MAIN GALLERY */}
                <div className="flex-1 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 md:p-8 overflow-y-auto min-h-[400px] order-2 lg:order-2">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                        <h3 className="font-black text-sm text-slate-800 flex items-center gap-2 uppercase tracking-wide"><ImageIcon size={16} className="text-teal-500" /> {T.preview[lang]}</h3>
                    </div>

                    {isProcessing ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                            <Loader2 className="animate-spin mb-4" size={48} />
                            <p className="font-bold text-xs uppercase tracking-widest">{T.converting[lang]}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {pages.map((img, idx) => (
                                <div key={idx} className="group relative bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all">
                                    <div className="aspect-[3/4] p-2">
                                        <img src={img} alt={`page ${idx+1}`} className="w-full h-full object-contain" />
                                    </div>
                                    {/* Overlay Download */}
                                    <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm p-4">
                                        <span className="text-white font-black text-lg">#{idx + 1}</span>
                                        <a href={img} download={`page_${idx+1}.png`} className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-[10px] flex items-center gap-2 hover:bg-teal-50 transition-colors uppercase tracking-widest w-full justify-center">
                                            <Download size={14}/> PNG
                                        </a>
                                    </div>
                                    {/* Mobile Badge */}
                                    <div className="md:hidden absolute top-2 right-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded">#{idx+1}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
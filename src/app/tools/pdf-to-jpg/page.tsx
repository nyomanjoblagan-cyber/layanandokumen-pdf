'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { 
  FileImage, Settings2, Download,
  CheckCircle2, X, ArrowLeft, FileCheck, Loader2, Image as ImageIcon, Trash2
} from 'lucide-react';
import AdsterraBanner from '@/components/AdsterraBanner';
import ToolLayout from '@/components/ToolLayout';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<string[]>([]); // Array Blob URLs
  const [isProcessing, setIsProcessing] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user-lang') as 'id' | 'en';
    if (saved) setLang(saved);
    setIsLoaded(true);
  }, []);

  // Cleanup object URLs on unmount or pages change to prevent memory leaks
  useEffect(() => {
    return () => {
      pages.forEach(url => URL.revokeObjectURL(url));
      if (zipUrl) URL.revokeObjectURL(zipUrl);
    };
  }, [pages, zipUrl]);

  const toggleLang = () => {
    const newLang = lang === 'id' ? 'en' : 'id';
    setLang(newLang);
    localStorage.setItem('user-lang', newLang);
  };

  const T = {
    hero_title: { id: 'Konversi PDF ke JPG', en: 'Convert PDF to JPG' },
    hero_desc: { 
      id: 'Ubah setiap halaman PDF menjadi gambar JPG berkualitas tinggi. Unduh per halaman atau sekaligus (ZIP). (Dioptimalkan untuk memori)', 
      en: 'Turn every PDF page into a high-quality JPG image. Download individually or all at once (ZIP). (Memory optimized)' 
    },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    drop_text: { id: 'atau tarik file PDF ke sini', en: 'or drop PDF file here' },
    converting: { id: 'Mengekstrak Gambar...', en: 'Extracting Images...' },
    preview: { id: 'Galeri Halaman', en: 'Page Gallery' },
    download_zip: { id: 'Download Semua (ZIP)', en: 'Download All (ZIP)' },
    download_single: { id: 'Simpan', en: 'Save' },
    back_home: { id: 'Konversi Lagi', en: 'Convert Another' },
    cancel: { id: 'Tutup', en: 'Close' },
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

                // Memori Optimization: Gunakan Blob URL daripada Base64
                const blobUrl = await new Promise<string>((resolve) => {
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(URL.createObjectURL(blob));
                        }
                    }, 'image/jpeg', 0.8);
                });
                
                extractedImages.push(blobUrl);
            }
        }

        setPages(extractedImages);
        
        if (extractedImages.length > 0) {
            await generateZip(extractedImages, uploadedFile.name);
        }

    } catch (e) {
        console.error(e);
        alert("Gagal memproses PDF. File mungkin rusak atau terpassword.");
        setFile(null);
    } finally {
        setIsProcessing(false);
    }
  };

  const generateZip = async (images: string[], filename: string) => {
    const zip = new JSZip();
    
    for (let idx = 0; idx < images.length; idx++) {
        const url = images[idx];
        const response = await fetch(url);
        const blob = await response.blob();
        zip.file(`page_${idx + 1}.jpg`, blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    setZipUrl(url);
  };

  const resetAll = () => {
    pages.forEach(url => URL.revokeObjectURL(url));
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    setFile(null);
    setPages([]);
    setZipUrl(null);
  };

  if (!isLoaded) return null;

  return (
    <ToolLayout
      lang={lang}
      toggleLang={toggleLang}
      titleDesktop={<>PDF<span className="text-blue-600">2JPG</span> Pro</>}
      titleMobile={<>PDF to <span className="text-blue-600">JPG</span></>}
      icon={<FileImage size={18} />}
      iconBgColor="bg-blue-600"
      selectionClass="selection:bg-blue-100 selection:text-blue-700"
    >
        {/* VIEW 1: UPLOAD */}
        {!file && (
          <div 
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-all ${isDraggingOver ? 'bg-blue-50/50' : ''}`}
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
                        <button onClick={() => fileInputRef.current?.click()} className="group relative bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-5 px-16 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto uppercase tracking-widest">
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
            <div className="flex justify-center mb-4 shrink-0 overflow-hidden px-4">
               <div className="hidden md:block"><AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
               <div className="md:hidden"><AdsterraBanner height={50} width={320} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" /></div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
                <div className="w-full lg:w-80 space-y-6 shrink-0 order-1 lg:order-1 px-4 lg:px-0">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
                        <h3 className="font-black text-[10px] text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2"><Settings2 size={14}/> {T.info[lang]}</h3>
                        
                        <div className="mb-6">
                            <p className="font-bold text-slate-700 truncate mb-1 text-sm">{file.name}</p>
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase tracking-wide">
                                {isProcessing ? T.converting[lang] : `${pages.length} ${T.pages_count[lang]}`}
                            </span>
                        </div>

                        {isProcessing ? (
                            <div className="flex flex-col items-center justify-center py-4 text-blue-500">
                                <Loader2 className="animate-spin mb-2" size={24} />
                                <span className="text-[10px] font-bold animate-pulse text-center uppercase tracking-widest">{T.converting[lang]}</span>
                            </div>
                        ) : (
                            zipUrl && (
                                <a href={zipUrl} download={`${file.name.replace('.pdf', '')}_images.zip`} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 text-xs active:scale-95 transition-all flex items-center justify-center gap-2 mb-4 cursor-pointer uppercase tracking-widest">
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

                <div className="flex-1 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 md:p-8 overflow-y-auto min-h-[400px] order-2 lg:order-2">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                        <h3 className="font-black text-sm text-slate-800 flex items-center gap-2 uppercase tracking-wide"><ImageIcon size={16} className="text-blue-500" /> {T.preview[lang]}</h3>
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
                                    <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm p-4">
                                        <span className="text-white font-black text-lg">#{idx + 1}</span>
                                        <a href={img} download={`page_${idx+1}.jpg`} className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-[10px] flex items-center gap-2 hover:bg-blue-50 transition-colors uppercase tracking-widest w-full justify-center">
                                            <Download size={14}/> JPG
                                        </a>
                                    </div>
                                    <div className="md:hidden absolute top-2 right-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded">#{idx+1}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          </div>
        )}
    </ToolLayout>
  );
}
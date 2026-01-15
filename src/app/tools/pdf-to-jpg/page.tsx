'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver'; // Biasanya JSZip butuh ini, tapi kita pakai trik Blob URL native saja biar hemat
import { 
  UploadCloud, FileImage, Settings2, Download, Globe,
  CheckCircle2, X, ArrowLeft, FileCheck, Loader2, Image as ImageIcon, Trash2
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// Worker Setup (Dinamis)
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
}

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<string[]>([]); // Array Base64 Images
  const [isProcessing, setIsProcessing] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [enabled, setEnabled] = useState(false); 
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => { cancelAnimationFrame(animation); setEnabled(false); };
  }, []);

  const T = {
    hero_title: { id: 'Konversi PDF ke JPG', en: 'Convert PDF to JPG' },
    hero_desc: { 
      id: 'Ubah setiap halaman PDF menjadi gambar JPG berkualitas tinggi. Unduh per halaman atau sekaligus (ZIP).', 
      en: 'Turn every PDF page into a high-quality JPG image. Download individually or all at once (ZIP).' 
    },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    drop_text: { id: 'atau tarik file PDF ke sini', en: 'or drop PDF file here' },
    converting: { id: 'Sedang Mengekstrak Gambar...', en: 'Extracting Images...' },
    preview: { id: 'Hasil Konversi', en: 'Conversion Result' },
    download_zip: { id: 'Download Semua (ZIP)', en: 'Download All (ZIP)' },
    download_single: { id: 'Simpan', en: 'Save' },
    back_home: { id: 'Konversi Lagi', en: 'Convert Another' },
    cancel: { id: 'BATAL', en: 'CANCEL' },
    success_title: { id: 'Selesai!', en: 'Finished!' },
    success_desc: { id: 'PDF berhasil diubah menjadi gambar.', en: 'PDF successfully converted to images.' },
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  // LOGIKA UTAMA: RENDER PDF TO IMAGES
  const processFile = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') {
        alert("Mohon pilih file PDF.");
        return;
    }

    setFile(uploadedFile);
    setIsProcessing(true);
    setPages([]);

    try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        // Clone buffer agar aman
        const bufferClone = arrayBuffer.slice(0);
        
        const loadingTask = pdfjsLib.getDocument({ data: bufferClone });
        const pdf = await loadingTask.promise;
        
        const totalPages = pdf.numPages;
        const extractedImages: string[] = [];

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            // Scale 1.5 biar tajam (High Quality)
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                } as any).promise;

                // Convert ke JPG
                extractedImages.push(canvas.toDataURL('image/jpeg', 0.8));
            }
        }

        setPages(extractedImages);
        
        // Auto Generate ZIP jika halaman > 1
        if (extractedImages.length > 0) {
            generateZip(extractedImages, uploadedFile.name);
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
    const folderName = filename.replace('.pdf', '') + '_images';
    const folder = zip.folder(folderName);

    images.forEach((imgData, idx) => {
        // Hapus header data:image/jpeg;base64,
        const data = imgData.split(',')[1];
        folder?.file(`page_${idx + 1}.jpg`, data, { base64: true });
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

  if (!enabled) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans relative selection:bg-blue-100 selection:text-blue-700 flex flex-col">
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f61a_1px,transparent_1px),linear-gradient(to_bottom,#3b82f61a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><FileImage size={18} /></div>
          <span className="font-bold text-xl tracking-tight text-slate-900 italic uppercase">
             Layanan<span className="text-blue-600">Dokumen</span> <span className="text-slate-300 font-black">PDF</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
           <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} className="flex items-center gap-1.5 text-[10px] font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all">
             <Globe size={13} /> {lang.toUpperCase()}
           </button>
           <Link href="/" className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-[0.2em] transition-colors flex items-center gap-1">
              <X size={14} /> {T.cancel[lang]}
           </Link>
        </div>
      </nav>

      <main className="flex-1 relative z-10 flex flex-col">
        {/* STATE 1: LANDING */}
        {!file && (
          <div 
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-all ${isDraggingOver ? 'bg-blue-50/50' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
          >
             <div className="w-full max-w-[1400px] flex gap-4 xl:gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20">
                   <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
                </div>
                <div className="flex-1 max-w-4xl space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="mb-8">
                       <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
                    </div>
                    <div className="space-y-4">
                      <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{T.hero_title[lang]}</h1>
                      <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">{T.hero_desc[lang]}</p>
                    </div>
                    <div className="flex flex-col items-center gap-6 py-4">
                       <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-6 px-16 rounded-xl shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3"
                       >
                          <FileImage size={32} />
                          {T.select_btn[lang]}
                       </button>
                       <p className="text-slate-400 text-sm font-bold tracking-wide">{T.drop_text[lang]}</p>
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

        {/* STATE 2: PROCESSING & RESULT */}
        {file && (
          <div className="w-full max-w-7xl mx-auto py-6 px-4 md:px-6">
            <div className="mb-6 flex justify-center">
              <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* SIDEBAR: INFO & DOWNLOAD ZIP */}
              <div className="w-full lg:w-80 space-y-4 shrink-0">
                  <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-100/50 border border-slate-200 animate-in slide-in-from-left duration-500">
                    <h3 className="font-bold text-[11px] text-slate-400 uppercase mb-5 tracking-[0.1em] flex items-center gap-2"><Settings2 size={14}/> INFO FILE</h3>
                    
                    <div className="mb-6">
                        <p className="font-bold text-slate-700 truncate mb-1">{file.name}</p>
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">
                            {isProcessing ? 'Memproses...' : `${pages.length} Halaman`}
                        </span>
                    </div>

                    {isProcessing ? (
                        <div className="flex flex-col items-center justify-center py-8 text-blue-500">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            <span className="text-xs font-bold animate-pulse">{T.converting[lang]}</span>
                        </div>
                    ) : (
                        zipUrl && (
                            <a href={zipUrl} download={`${file.name.replace('.pdf', '')}_images.zip`} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 text-xs active:scale-95 transition-all flex items-center justify-center gap-2 mb-4 cursor-pointer">
                                <Download size={16}/> {T.download_zip[lang]}
                            </a>
                        )
                    )}

                    {!isProcessing && (
                         <button onClick={resetAll} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
                            <Trash2 size={14} /> {T.back_home[lang]}
                         </button>
                    )}
                  </div>
                  <div className="flex justify-center bg-white border border-dashed border-slate-200 rounded-2xl p-4 shadow-sm">
                     <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                  </div>
              </div>

              {/* GRID HASIL GAMBAR */}
              <div className="flex-1 bg-white rounded-2xl shadow-xl shadow-blue-100/50 border border-slate-200 p-8 min-h-[600px] relative animate-in slide-in-from-bottom duration-500">
                  <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-5">
                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 tracking-wide"><ImageIcon size={18} className="text-blue-500" /> {T.preview[lang]}</h3>
                  </div>

                  {isProcessing ? (
                      <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                          <Loader2 className="animate-spin mb-4" size={48} />
                          <p className="font-bold text-sm">Mohon tunggu sebentar...</p>
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {pages.map((img, idx) => (
                              <div key={idx} className="group relative bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all">
                                  <div className="aspect-[3/4] p-2">
                                      <img src={img} alt={`page ${idx+1}`} className="w-full h-full object-contain" />
                                  </div>
                                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                                      <span className="text-white font-bold text-lg">Hal {idx + 1}</span>
                                      <a href={img} download={`page_${idx+1}.jpg`} className="bg-white text-blue-600 px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-blue-50 transition-colors">
                                          <Download size={14}/> JPG
                                      </a>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 text-center bg-white/50 border-t border-slate-100 mt-auto">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">© 2026 LayananDokumen PDF</p>
      </footer>
    </div>
  );
}
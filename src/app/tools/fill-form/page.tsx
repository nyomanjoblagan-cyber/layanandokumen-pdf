'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  PenTool, CheckCircle2, Download, Globe, 
  X, ArrowLeft, Loader2, Settings2, FormInput, FileText, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import AdsterraBanner from '@/components/AdsterraBanner';

// 1. WORKER STABIL (Wajib)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

// Tipe Data Field
type FormField = {
  name: string;
  type: 'Text' | 'CheckBox' | 'Dropdown' | 'Radio' | 'Unknown';
  value: string | boolean;
  options?: string[]; // Untuk Dropdown/Radio
};

export default function FillFormPage() {
  // STATE UTAMA
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // FORM STATE
  const [fields, setFields] = useState<FormField[]>([]);
  const [hasForm, setHasForm] = useState<boolean | null>(null); // null = belum cek

  // UI & BAHASA
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const [mobileTab, setMobileTab] = useState<0 | 1>(1); 
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
    hero_title: { id: 'Isi Formulir PDF', en: 'Fill PDF Forms' },
    hero_desc: { 
      id: 'Isi formulir PDF interaktif (AcroForm) dengan mudah dan cepat. Otomatis deteksi kolom.', 
      en: 'Fill interactive PDF forms (AcroForm) easily and quickly. Automatic field detection.' 
    },
    select_btn: { id: 'Pilih File PDF', en: 'Select PDF File' },
    drop_text: { id: 'atau tarik file ke sini', en: 'or drop file here' },
    
    // Tabs
    tab_preview: { id: 'Preview Dokumen', en: 'Document Preview' },
    tab_form: { id: 'Isi Data', en: 'Fill Data' },
    
    // Form UI
    no_form_title: { id: 'Tidak Ada Formulir', en: 'No Form Fields' },
    no_form_desc: { id: 'PDF ini tidak memiliki kolom interaktif. Gunakan menu "Edit PDF" untuk menambah teks manual.', en: 'This PDF has no interactive fields. Use "Edit PDF" to add text manually.' },
    btn_goto_edit: { id: 'Buka Edit PDF', en: 'Go to Edit PDF' },
    form_detected: { id: 'Kolom Terdeteksi', en: 'Fields Detected' },
    
    // Actions
    save_btn: { id: 'Simpan Formulir', en: 'Save Form' },
    
    // Status
    processing: { id: 'MEMUAT...', en: 'LOADING...' },
    saving: { id: 'MENYIMPAN...', en: 'SAVING...' },
    
    // Success
    success_title: { id: 'Formulir Tersimpan!', en: 'Form Saved!' },
    success_desc: { id: 'Data Anda telah tersimpan di dalam PDF.', en: 'Your data has been saved into the PDF.' },
    download_btn: { id: 'Download PDF', en: 'Download PDF' },
    back_home: { id: 'Isi Lainnya', en: 'Fill Another' },
    cancel: { id: 'Tutup', en: 'Close' },
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  // --- 4. ENGINE: DETEKSI & PARSING FORM ---
  const processFile = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf') {
        alert("Mohon pilih file PDF.");
        return;
    }
    setFile(uploadedFile);
    setIsProcessing(true);
    setPdfUrl(null);
    setFields([]);
    setHasForm(null);

    try {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        
        // 1. Load PDF-Lib untuk Deteksi Form
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const form = pdfDoc.getForm();
        const rawFields = form.getFields();

        if (rawFields.length === 0) {
            setHasForm(false);
        } else {
            setHasForm(true);
            const extractedFields: FormField[] = rawFields.map(f => {
                const name = f.getName();
                let type: FormField['type'] = 'Unknown';
                let value: string | boolean = '';
                let options: string[] = [];

                if (f instanceof PDFTextField) {
                    type = 'Text';
                    value = f.getText() || '';
                } else if (f instanceof PDFCheckBox) {
                    type = 'CheckBox';
                    value = f.isChecked();
                } else if (f instanceof PDFDropdown) {
                    type = 'Dropdown';
                    value = f.getSelected()[0] || '';
                    options = f.getOptions();
                } else if (f instanceof PDFRadioGroup) {
                    type = 'Radio';
                    value = f.getSelected() || '';
                    options = f.getOptions();
                }

                return { name, type, value, options };
            });
            setFields(extractedFields);
        }

        // 2. Render Preview (PDF.js)
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport }).promise;
            setPreviewImage(canvas.toDataURL());
        }

    } catch (error) {
        console.error(error);
        alert("Gagal memproses PDF.");
        setFile(null);
    } finally {
        setIsProcessing(false);
    }
  };

  // --- 5. HANDLE INPUT CHANGE ---
  const updateField = (index: number, newValue: string | boolean) => {
    setFields(prev => {
        const updated = [...prev];
        updated[index].value = newValue;
        return updated;
    });
  };

  // --- 6. SAVE (FILL) PDF ---
  const handleSave = async () => {
    if (!file) return;
    setIsSaving(true);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const form = pdfDoc.getForm();

        fields.forEach(f => {
            try {
                const field = form.getField(f.name);
                if (f.type === 'Text' && field instanceof PDFTextField) {
                    field.setText(f.value as string);
                } else if (f.type === 'CheckBox' && field instanceof PDFCheckBox) {
                    if (f.value === true) field.check();
                    else field.uncheck();
                } else if (f.type === 'Dropdown' && field instanceof PDFDropdown) {
                    field.select(f.value as string);
                } else if (f.type === 'Radio' && field instanceof PDFRadioGroup) {
                    field.select(f.value as string);
                }
            } catch (e) {
                console.warn(`Gagal mengisi field: ${f.name}`, e);
            }
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);

    } catch (error) {
        alert("Gagal menyimpan Formulir.");
    } finally {
        setIsSaving(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPdfUrl(null);
    setFields([]);
    setMobileTab(1);
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans relative selection:bg-blue-100 selection:text-blue-700 flex flex-col overflow-hidden">
      
      {/* NAVBAR */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 text-white p-1 md:p-1.5 rounded-lg shadow-sm group-hover:scale-105 transition-transform"><PenTool size={18} /></div>
          <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900 italic uppercase">
              <span className="md:hidden">Fill<span className="text-indigo-600">Form</span></span>
              <span className="hidden md:inline">Layanan<span className="text-indigo-600">Dokumen</span> <span className="text-slate-300 font-black">PDF</span></span>
          </span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
           <button onClick={toggleLang} className="flex items-center gap-1 font-bold bg-slate-100 px-2 py-1 rounded text-[10px] text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
             <Globe size={12} /> {lang.toUpperCase()}
           </button>
           <Link href="/" className="text-[10px] md:text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-[0.2em] transition-colors flex items-center gap-1">
              <X size={18} /> <span className="hidden md:inline">{T.cancel[lang]}</span>
           </Link>
        </div>
      </nav>

      <main className="flex-1 relative z-10 flex flex-col h-[calc(100dvh-56px)] md:h-auto overflow-y-auto">
        
        {/* STATE 1: LANDING */}
        {!file && (
          <div 
            className={`flex-1 flex flex-col items-center justify-center p-6 text-center transition-all ${isDraggingOver ? 'bg-indigo-50/50' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
          >
             <div className="w-full max-w-[1400px] flex gap-4 xl:gap-8 justify-center items-start pt-4 md:pt-10">
                <div className="hidden xl:block sticky top-20">
                   <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
                </div>
                
                <div className="flex-1 max-w-4xl space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="mb-8 flex justify-center">
                       <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
                    </div>
                    
                    <div className="space-y-4 px-4">
                      <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">{T.hero_title[lang]}</h1>
                      <p className="text-sm md:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">{T.hero_desc[lang]}</p>
                    </div>

                    <div className="flex flex-col items-center gap-6 py-4">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-lg md:text-xl font-bold py-5 md:py-6 px-10 md:px-16 rounded-xl shadow-xl shadow-indigo-200 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                           {isProcessing ? <Loader2 className="animate-spin" size={24}/> : <PenTool size={24} />} 
                           {isProcessing ? T.processing[lang] : T.select_btn[lang]}
                        </button>
                        <p className="text-slate-400 text-xs md:text-sm font-bold tracking-wide">{T.drop_text[lang]}</p>
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

        {/* STATE 2: SUCCESS */}
        {pdfUrl && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white overflow-y-auto">
             <div className="w-full max-w-5xl flex gap-8 justify-center items-start pt-10">
                <div className="hidden xl:block sticky top-20">
                   <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
                </div>
                
                <div className="flex-1 max-w-xl space-y-8 animate-in slide-in-from-bottom duration-500">
                    <div className="mb-8">
                       <AdsterraBanner height={90} width={728} data_key="c0fd3ef02cfd2ffa7fda180dcda83f73" />
                    </div>
                    
                    <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-2xl shadow-blue-100 text-center">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                           <CheckCircle2 size={40} strokeWidth={3} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">{T.success_title[lang]}</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">{T.success_desc[lang]}</p>
                        
                        <div className="flex flex-col gap-4">
                           <a href={pdfUrl} download={`Filled_${file?.name}`} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
                              <Download size={24} /> {T.download_btn[lang]}
                           </a>
                           <button onClick={resetAll} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider">
                              <ArrowLeft size={16} /> {T.back_home[lang]}
                           </button>
                        </div>
                    </div>
                    
                    <div className="mt-10 flex justify-center">
                       <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                    </div>
                </div>
                
                <div className="hidden xl:block sticky top-20">
                   <AdsterraBanner height={600} width={160} data_key="cd8a6750a2f2844ce836653aab3c7a96" />
                </div>
             </div>
          </div>
        )}

        {/* STATE 3: FORM EDITOR (SPLIT) */}
        {file && !pdfUrl && (
          <div className="flex flex-col h-full md:flex-row md:h-auto md:p-6 md:gap-6 max-w-7xl mx-auto w-full">
            
            {/* MOBILE TABS */}
            <div className="md:hidden flex border-b border-slate-200 bg-white sticky top-0 z-20 shrink-0">
               <button onClick={() => setMobileTab(0)} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${mobileTab === 0 ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>
                  {T.tab_preview[lang]}
               </button>
               <button onClick={() => setMobileTab(1)} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${mobileTab === 1 ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>
                  {T.tab_form[lang]}
               </button>
            </div>

            {/* PREVIEW AREA */}
            <div className={`flex-1 flex flex-col h-full bg-slate-100 md:bg-white md:rounded-2xl md:shadow-xl md:border border-slate-200 md:p-8 overflow-hidden relative ${mobileTab === 0 ? 'flex' : 'hidden md:flex'}`}>
                <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                    <div className="relative shadow-2xl border-4 border-white bg-white max-w-full max-h-full">
                        {previewImage ? (
                           <img src={previewImage} alt="Preview" className="max-w-full max-h-[60vh] md:max-h-[600px] object-contain" />
                        ) : (
                           <div className="w-[400px] h-[600px] flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" size={40}/></div>
                        )}
                    </div>
                </div>
                <p className="hidden md:block text-center text-xs text-slate-400 font-bold uppercase tracking-widest mt-4">Preview Halaman 1 (Statis)</p>
            </div>

            {/* FORM SIDEBAR */}
            <div className={`w-full md:w-96 bg-white md:rounded-2xl md:shadow-xl md:border border-slate-200 p-6 overflow-y-auto md:h-fit shrink-0 ${mobileTab === 1 ? 'block' : 'hidden md:block'}`}>
                <h3 className="font-bold text-xs text-slate-400 uppercase mb-6 tracking-widest flex items-center gap-2"><Settings2 size={14}/> {T.tab_form[lang]}</h3>
                
                {hasForm === false ? (
                    // IF NO FORM
                    <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3"/>
                        <h4 className="font-bold text-slate-700 mb-2">{T.no_form_title[lang]}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">{T.no_form_desc[lang]}</p>
                        <Link href="/tools/edit-pdf" className="inline-block w-full bg-white border border-red-200 text-red-600 font-bold py-3 rounded-lg text-xs hover:bg-red-50 uppercase tracking-wider">
                            {T.btn_goto_edit[lang]}
                        </Link>
                    </div>
                ) : (
                    // IF FORM EXISTS
                    <div className="space-y-4">
                        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-600 flex items-center gap-2"><FormInput size={14}/> {T.form_detected[lang]}</span>
                            <span className="bg-white text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full">{fields.length}</span>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                            {fields.map((field, idx) => (
                                <div key={idx} className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate block" title={field.name}>{field.name}</label>
                                    
                                    {field.type === 'Text' && (
                                        <input 
                                            type="text" 
                                            value={field.value as string}
                                            onChange={(e) => updateField(idx, e.target.value)}
                                            className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-colors"
                                        />
                                    )}

                                    {field.type === 'CheckBox' && (
                                        <div 
                                            onClick={() => updateField(idx, !field.value)}
                                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${field.value ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                                        >
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${field.value ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 bg-white'}`}>
                                                {field.value && <CheckCircle2 size={14} className="text-white"/>}
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">{field.value ? 'Selected' : 'Unselected'}</span>
                                        </div>
                                    )}

                                    {(field.type === 'Dropdown' || field.type === 'Radio') && (
                                        <select 
                                            value={field.value as string}
                                            onChange={(e) => updateField(idx, e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
                                        >
                                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-center">
                            <AdsterraBanner height={250} width={300} data_key="56cc493f61de5edcff82fc45841616e5" />
                        </div>

                        <button onClick={handleSave} disabled={isSaving} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-400 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 uppercase text-xs tracking-widest">
                            {isSaving ? <Loader2 className="animate-spin" size={18}/> : <FileText size={18}/>} 
                            {isSaving ? T.saving[lang] : T.save_btn[lang]}
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
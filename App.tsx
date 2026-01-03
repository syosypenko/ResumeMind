
import React, { useState, useEffect, useRef } from 'react';
import { ResumeData } from './types';
import { INITIAL_DATA, ICONS } from './constants';
import ResumeForm from './components/ResumeForm';
import ResumePreview from './components/ResumePreview';
import { parseLinkedInText } from './services/geminiService';
import { generateDocx } from './services/docxService';

// Tell TypeScript about html2pdf global from the script tag
declare var html2pdf: any;

const App: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_DATA);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [liText, setLiText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('resume-preview');
    if (!element) return;

    setIsExportingPdf(true);
    
    const opt = {
      margin: 0,
      filename: `resume-${resumeData.personal.fullName.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF Export error:", error);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    setIsExportingDocx(true);
    try {
      const blob = await generateDocx(resumeData);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resume-${resumeData.personal.fullName.replace(/\s+/g, '-').toLowerCase()}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export Word document.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(resumeData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `resume-${resumeData.personal.fullName.replace(/\s+/g, '-').toLowerCase()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.personal && Array.isArray(json.experiences) && Array.isArray(json.education)) {
          setResumeData(json);
        } else {
          alert('Invalid file format.');
        }
      } catch (err) {
        alert('Error parsing the file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLinkedInImport = async () => {
    if (!liText.trim()) return;
    setIsParsing(true);
    try {
      const parsedData = await parseLinkedInText(liText);
      setResumeData(prev => ({
        ...prev,
        ...parsedData,
        personal: { ...prev.personal, ...parsedData.personal },
        experiences: parsedData.experiences ? [...parsedData.experiences as any] : (parsedData.experiences === undefined ? prev.experiences : []),
        education: parsedData.education ? [...parsedData.education as any] : (parsedData.education === undefined ? prev.education : []),
        skills: parsedData.skills ? [...parsedData.skills as any] : (parsedData.skills === undefined ? prev.skills : []),
      }));
      setShowLinkedInModal(false);
      setLiText('');
    } catch (err) {
      alert('Failed to parse text.');
    } finally {
      setIsParsing(false);
    }
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportJSON} 
        accept=".json" 
        className="hidden" 
      />

      {/* LinkedIn Modal */}
      {showLinkedInModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ICONS.LinkedIn />
                <h3 className="text-xl font-bold">LinkedIn Magic Import</h3>
              </div>
              <button onClick={() => !isParsing && setShowLinkedInModal(false)} className="hover:opacity-70">✕</button>
            </div>
            <div className="p-8">
              <textarea 
                className="w-full h-64 p-4 border-2 border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-sans text-sm resize-none mb-6"
                placeholder="Paste your copied LinkedIn profile content here..."
                value={liText}
                onChange={(e) => setLiText(e.target.value)}
                disabled={isParsing}
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowLinkedInModal(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50" disabled={isParsing}>Cancel</button>
                <button onClick={handleLinkedInImport} disabled={isParsing || !liText.trim()} className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all">
                  {isParsing ? 'Processing...' : 'Process Text'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 transition-all no-print ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-2' : 'bg-slate-900 text-white py-4'}`}>
        <div className="max-w-[1600px] mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white"><ICONS.Magic /></div>
            <div>
              <h1 className={`font-bold tracking-tight text-xl ${isScrolled ? 'text-slate-900' : 'text-white'}`}>ResumeMind</h1>
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Professional Intelligence</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowLinkedInModal(true)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${isScrolled ? 'border-[#0077b5] bg-white text-[#0077b5]' : 'border-[#0077b5] bg-[#0077b5] text-white'}`}>
              <ICONS.LinkedIn /> <span className="hidden xl:inline">LinkedIn Import</span>
            </button>
            <button onClick={triggerImport} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${isScrolled ? 'border-slate-200 bg-white text-slate-600' : 'border-slate-700 bg-slate-800 text-slate-300'}`}>
              <ICONS.Upload /> <span className="hidden xl:inline">Restore</span>
            </button>
            <button onClick={handleDownloadJSON} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${isScrolled ? 'border-slate-200 bg-white text-slate-600' : 'border-slate-700 bg-slate-800 text-slate-300'}`}>
              <ICONS.Download /> <span className="hidden xl:inline">Backup</span>
            </button>

            {/* Dynamic Primary Action Button */}
            {resumeData.template === 'alpine' ? (
              <button 
                onClick={handleDownloadPDF} 
                disabled={isExportingPdf}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition-all transform hover:-translate-y-0.5"
              >
                {isExportingPdf ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ICONS.Download />}
                {isExportingPdf ? 'Generating PDF...' : 'Download PDF'}
              </button>
            ) : (
              <button 
                onClick={handleDownloadDocx} 
                disabled={isExportingDocx}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition-all transform hover:-translate-y-0.5"
              >
                {isExportingDocx ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ICONS.Word />}
                {isExportingDocx ? 'Generating Word...' : 'Download Word'}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Area */}
      <main className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        <aside className="w-full lg:w-[450px] xl:w-[500px] 2xl:w-[600px] flex flex-col p-4 lg:p-6 lg:sticky lg:top-[68px] lg:h-[calc(100vh-68px)] no-print">
          <ResumeForm data={resumeData} onChange={setResumeData} />
          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100 flex gap-3">
            <div className="text-amber-500"><ICONS.Magic /></div>
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Professional Export:</strong> {resumeData.template === 'alpine' ? 'The Alpine layout is optimized for direct PDF download to preserve its sidebar design.' : 'Modern and Balanced layouts are fully compatible with Microsoft Word export.'}
            </p>
          </div>
        </aside>

        <section className="flex-1 bg-slate-100 p-4 lg:p-12 overflow-y-auto">
          <div className="max-w-[900px] mx-auto">
            <div className="mb-6 flex justify-between items-center no-print">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Professional Preview</h2>
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="w-3 h-3 rounded-full bg-green-400"></span>
              </div>
            </div>
            <ResumePreview data={resumeData} />
            <footer className="mt-12 text-center text-slate-400 text-xs no-print pb-12">
              <p>&copy; 2026 ResumeMind. Designed for modern professionals.</p>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;

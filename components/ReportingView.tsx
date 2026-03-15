
import React, { useState } from 'react';
import { mockGeneratedReports, mockScheduledReports } from '../services/mockData';
import { GeneratedReport } from '../types';
import { 
  FileText, Calendar, Download, RefreshCw, Trash2, Plus, XCircle, Clock,
  Share2, Shield, Loader2, Hash, Send
} from 'lucide-react';

const ReportingView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GENERATED' | 'SCHEDULED'>('GENERATED');
  const [reports, setReports] = useState<GeneratedReport[]>(mockGeneratedReports);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showInspector, setShowInspector] = useState<GeneratedReport | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const handleDelete = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    showToast(`Report ${id} has been deleted.`);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowGenerator(false);
    
    const newReport: GeneratedReport = {
      id: `rep-${Date.now()}`,
      name: 'Q4 Ad-hoc Settlement',
      author: 'Super Admin',
      type: 'FINANCIAL',
      generatedAt: new Date().toISOString(),
      format: 'PDF',
      size: '...',
      status: 'PROCESSING',
      hash: 'calculating...',
    };
    setReports(prev => [newReport, ...prev]);

    setTimeout(() => {
       setReports(prev => prev.map(r => r.id === newReport.id ? { 
         ...r, 
         status: 'READY', 
         size: '3.1 MB',
         hash: `sha256:${Math.random().toString(16).slice(2)}`
        } : r));
    }, 3000);
  };
  
  const triggerScheduled = (jobName: string) => {
    const newReport: GeneratedReport = {
      id: `rep-${Date.now()}`,
      name: jobName,
      author: 'SYSTEM',
      type: 'COMPLIANCE',
      generatedAt: new Date().toISOString(),
      format: 'CSV',
      size: '...',
      status: 'PROCESSING',
      hash: 'calculating...',
    };
    setReports(prev => [newReport, ...prev]);
    setActiveTab('GENERATED');
    showToast(`${jobName} triggered successfully.`);

    setTimeout(() => {
       setReports(prev => prev.map(r => r.id === newReport.id ? { 
         ...r, 
         status: 'READY', 
         size: '12.8 MB',
         hash: `sha256:${Math.random().toString(16).slice(2)}`
        } : r));
    }, 4000);
  };

  return (
    <div className="space-y-6 relative">
       {toast && (
        <div className="fixed top-20 right-8 z-[200] bg-slate-900 border border-indigo-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right">
           <Send size={18} className="text-indigo-400" />
           <p className="text-xs font-black uppercase tracking-widest">{toast}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Reporting_Engine</h2>
          <p className="text-slate-500 font-medium">Financial statements, operational insights, and compliance exports.</p>
        </div>
        <button onClick={() => setShowGenerator(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center shadow-lg shadow-indigo-100 active:scale-95">
           <Plus className="h-4 w-4 mr-2" /> New Report
        </button>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8"><button onClick={() => setActiveTab('GENERATED')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'GENERATED' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Generated</button><button onClick={() => setActiveTab('SCHEDULED')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'SCHEDULED' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Scheduled</button></nav>
      </div>

      {activeTab === 'GENERATED' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
           <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Exports</h3></div>
           <table className="min-w-full divide-y divide-slate-100">
             <thead className="bg-white"><tr className="text-[10px] font-black uppercase tracking-widest text-slate-400"><th className="px-6 py-4 text-left">Report</th><th className="px-6 py-4 text-left">Generated</th><th className="px-6 py-4 text-left">Status</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
             <tbody className="bg-white divide-y divide-slate-100">
               {reports.map((r) => (
                 <tr key={r.id} onClick={() => r.status === 'READY' && setShowInspector(r)} className={`group transition-colors ${r.status === 'READY' ? 'hover:bg-indigo-50/50 cursor-pointer' : ''}`}>
                   <td className="px-6 py-4"><div className="flex items-center"><div className={`p-3 rounded-xl mr-4 ${r.format === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}><FileText className="h-5 w-5" /></div><div><div className="text-sm font-bold text-slate-900">{r.name}</div><div className="text-xs text-slate-500 font-mono">{r.id}</div></div></div></td>
                   <td className="px-6 py-4 text-xs text-slate-500"><div>{new Date(r.generatedAt).toLocaleString()}</div><div className="font-bold text-slate-700">by {r.author}</div></td>
                   <td className="px-6 py-4">{r.status==='READY'?(<span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800">{r.size}</span>):(<span className="inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-800"><Loader2 className="h-3 w-3 animate-spin"/>PROCESSING</span>)}</td>
                   <td className="px-6 py-4 text-right space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"><button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" disabled={r.status!=='READY'}><Download className="h-4 w-4" /></button><button onClick={(e)=>{e.stopPropagation();handleDelete(r.id)}} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button></td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      )}

      {activeTab === 'SCHEDULED' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
            {mockScheduledReports.map((job) => (<div key={job.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"><div className="flex justify-between items-start mb-4"><div className="p-3 bg-indigo-50 rounded-xl"><Calendar className="h-6 w-6 text-indigo-600" /></div><span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full uppercase">{job.frequency}</span></div><div><h3 className="text-lg font-bold text-slate-900 mb-1">{job.name}</h3><p className="text-sm text-slate-500 mb-4 flex items-center"><Clock size={14} className="mr-1.5"/>Next run: <span className="text-slate-800 font-medium ml-1">{job.nextRun}</span></p></div><div className="flex space-x-3 pt-4 border-t border-slate-100"><button className="flex-1 px-3 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">Edit</button><button onClick={() => triggerScheduled(job.name)} className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100">Trigger Now</button></div></div>))}
            <button onClick={() => setShowGenerator(true)} className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer group"><div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100"><Plus className="h-6 w-6 text-slate-400 group-hover:text-indigo-600" /></div><h3 className="text-base font-semibold text-slate-900">Schedule a New Report</h3><p className="text-sm text-slate-500 mt-1 max-w-xs">Automate recurring financial or operational data exports.</p></button>
         </div>
      )}
      
      {showGenerator && (
        <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-in zoom-in-95"><div className="p-6 flex justify-between items-center border-b border-slate-200"><h3 className="text-lg font-bold text-slate-900">Generate New Report</h3><button onClick={()=>setShowGenerator(false)} className="text-slate-400 hover:text-slate-600"><XCircle /></button></div><form onSubmit={handleGenerate} className="p-8 space-y-4"><div><label className="text-sm font-medium text-slate-700">Report Type</label><select className="w-full mt-1 p-2 border border-slate-300 rounded-lg"><option>Settlement Reconciliation</option><option>AML Compliance Summary</option></select></div><div><label className="text-sm font-medium text-slate-700">Date Range</label><input type="date" defaultValue="2024-10-01" className="w-full mt-1 p-2 border border-slate-300 rounded-lg"/></div><div><label className="text-sm font-medium text-slate-700">Format</label><div className="flex gap-2 mt-1"><button type="button" className="flex-1 py-2 border-2 border-indigo-500 bg-indigo-50 rounded-lg text-sm font-bold">PDF</button><button type="button" className="flex-1 py-2 border border-slate-300 rounded-lg text-sm">CSV</button></div></div><button type="submit" className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-indigo-700"><RefreshCw size={14}/>Generate Report</button></form></div></div>
      )}

      {showInspector && (
        <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-slate-900 text-white rounded-2xl max-w-2xl w-full shadow-2xl animate-in zoom-in-95 border border-slate-800"><div className="p-6 flex justify-between items-center border-b border-slate-800"><div className="flex items-center gap-3"><FileText size={18} className="text-indigo-400" /><h3 className="text-lg font-bold">Report Inspector</h3></div><button onClick={()=>setShowInspector(null)} className="text-slate-400 hover:text-white"><XCircle /></button></div><div className="p-8 space-y-6"><div className="grid grid-cols-2 gap-4"><div className="p-4 bg-slate-950 rounded-lg border border-slate-800"> <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Report ID</p><p className="text-xs font-mono text-indigo-400">{showInspector.id}</p></div><div className="p-4 bg-slate-950 rounded-lg border border-slate-800"><p className="text-[10px] font-black text-slate-500 uppercase mb-1">Author</p><p className="text-xs font-mono text-white">{showInspector.author}</p></div></div><div className="p-4 bg-black rounded-lg border border-slate-800"><p className="text-[10px] font-black text-slate-500 uppercase mb-1 flex items-center gap-2"><Hash size={10}/>Integrity Hash</p><p className="text-xs font-mono text-slate-400 break-all">{showInspector.hash}</p></div><div className="h-40 bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 font-bold border border-slate-700">PREVIEW (PDF)</div><div className="flex gap-3"><button onClick={() => showToast('Secure link copied to clipboard.')} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-xs font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2"><Share2 size={14}/>Share Link</button><button onClick={() => showToast('Report sent to Compliance Officer.')} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-xs font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2"><Shield size={14}/>Send to CCO</button></div></div></div></div>
      )}
    </div>
  );
};

export default ReportingView;

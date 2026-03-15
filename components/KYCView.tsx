
import React, { useState } from 'react';
import { mockKYCApps } from '../services/mockData';
import { KYCApplication } from '../types';
// Added missing icon imports: RefreshCw, Plus, Loader2, Archive, Globe
import { 
  FileText, Briefcase, User, Clock, AlertCircle, CheckCircle, 
  XCircle, MoreHorizontal, ShieldCheck, Download, Eye, 
  ArrowRight, Search, Zap, CheckCircle2, History, UserCheck, 
  SearchCode, FileSearch, ShieldAlert, RefreshCw, Plus, Loader2, Archive, Globe
} from 'lucide-react';

const KYCView: React.FC = () => {
  const [apps, setApps] = useState<KYCApplication[]>(mockKYCApps);
  const [selectedApp, setSelectedApp] = useState<KYCApplication | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const columns: { id: KYCApplication['status']; label: string; color: string; bg: string; icon: any }[] = [
    { id: 'INCOMING', label: 'Incoming', color: 'border-indigo-400', bg: 'bg-indigo-500', icon: Zap },
    { id: 'UNDER_REVIEW', label: 'Analysis', color: 'border-amber-400', bg: 'bg-amber-500', icon: SearchCode },
    { id: 'ACTION_REQUIRED', label: 'Follow Up', color: 'border-red-400', bg: 'bg-red-500', icon: ShieldAlert },
    { id: 'APPROVED', label: 'Verified', color: 'border-green-400', bg: 'bg-green-500', icon: UserCheck },
  ];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const moveApp = (id: string, newStatus: KYCApplication['status']) => {
    setProcessingId(id);
    setTimeout(() => {
      setApps(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      setProcessingId(null);
      showToast(`Entity ${id} moved to ${newStatus.replace('_', ' ')} protocol.`);
      if (selectedApp?.id === id) setSelectedApp(null);
    }, 1200);
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'HIGH': return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-700 tracking-widest border border-red-200">HIGH_RISK</span>;
      case 'MEDIUM': return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-orange-100 text-orange-700 tracking-widest border border-orange-200">MEDIUM</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-green-100 text-green-700 tracking-widest border border-green-200">LOW_RISK</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2">
        <div>
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Identity_Verification_Pipeline</h3>
           <p className="text-sm text-slate-400 font-medium">Automated flow for KYB/KYC document validation and risk scoring.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => showToast("Scanning for document integrity...")} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all shadow-sm">
              <RefreshCw size={18} />
           </button>
           <button className="px-6 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center gap-2">
              <Plus size={14} /> New Application
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {columns.map((col) => {
          const items = apps.filter(app => app.status === col.id);
          return (
            <div key={col.id} className="flex flex-col bg-slate-50/50 dark:bg-slate-900/50 rounded-[40px] border border-slate-200/60 dark:border-slate-800 h-[650px] shadow-inner overflow-hidden">
              <div className={`p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center`}>
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${col.bg} text-white`}>
                       <col.icon size={16} />
                    </div>
                    <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest italic">{col.label}</h3>
                 </div>
                 <span className="bg-slate-900 dark:bg-white dark:text-slate-950 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                   {items.length}
                 </span>
              </div>
              
              <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                 {items.map((app) => (
                   <div 
                      key={app.id} 
                      onClick={() => setSelectedApp(app)}
                      className={`bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:border-indigo-500/30 transition-all cursor-pointer group relative overflow-hidden`}
                   >
                      {processingId === app.id && (
                          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-10 backdrop-blur-sm">
                              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                          </div>
                      )}

                      <div className="flex justify-between items-start mb-4">
                         <span className="text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700 uppercase tracking-widest">{app.id}</span>
                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); moveApp(app.id, 'APPROVED'); }} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg"><CheckCircle2 size={16} /></button>
                              <button onClick={(e) => { e.stopPropagation(); moveApp(app.id, 'ACTION_REQUIRED'); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><XCircle size={16} /></button>
                         </div>
                      </div>
                      
                      <div className="flex items-start mb-6">
                         <div className={`p-3 rounded-2xl mr-4 ${app.type === 'BUSINESS' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'} border border-slate-100 dark:border-slate-800`}>
                            {app.type === 'BUSINESS' ? <Briefcase size={20} /> : <User size={20} />}
                         </div>
                         <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight mb-2 tracking-tighter italic uppercase">{app.entityName}</h4>
                            {getRiskBadge(app.riskLevel)}
                         </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-black text-slate-400 pt-4 border-t border-slate-50 dark:border-slate-800 uppercase tracking-widest italic">
                         <div className="flex items-center">
                            <FileSearch size={14} className="mr-2 text-indigo-400" /> Docs: {app.documentsCount}
                         </div>
                         <div className="flex items-center">
                            <Clock size={14} className="mr-2" /> {app.submissionDate}
                         </div>
                      </div>
                   </div>
                 ))}
                 {items.length === 0 && (
                   <div className="text-center py-20 opacity-30 flex flex-col items-center gap-3">
                      <Archive size={32} />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Queue_Empty</p>
                   </div>
                 )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-[250] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-[50px] max-w-6xl w-full shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="p-10 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <UserCheck size={250} />
                 </div>
                 <div className="relative z-10 flex items-center gap-8">
                    <div className="h-20 w-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/50 transform rotate-3">
                       <ShieldCheck size={40} />
                    </div>
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{selectedApp.entityName}</h3>
                            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-900/40 px-4 py-1.5 rounded-full border border-indigo-500/30">{selectedApp.id}</span>
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                           <Globe size={12}/> Global Registry Check • Entity_Type: {selectedApp.type}
                        </p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedApp(null)} className="text-slate-500 hover:text-white p-3 relative z-10 bg-slate-800 rounded-full transition-all hover:scale-110 active:scale-90"><XCircle size={32} /></button>
              </div>

              <div className="grid grid-cols-12 h-[65vh] overflow-hidden">
                 <div className="col-span-8 p-12 overflow-y-auto custom-scrollbar space-y-10 bg-slate-50/50 dark:bg-slate-900/50">
                    <section>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 border-l-4 border-indigo-500 pl-4">
                           Document_Evidence_Matrix
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {['Article of Association', 'Director ID - Passport', 'Proof of Address', 'UBO Declaration', 'Tax Certificate'].map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm group hover:border-indigo-500/50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-all">
                                            <FileText size={20} className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{doc}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Verified: 14 Oct 2024</p>
                                        </div>
                                    </div>
                                    <button className="p-3 text-slate-300 hover:text-indigo-600 transition-colors"><Eye size={20} /></button>
                                </div>
                            ))}
                        </div>
                    </section>
                 </div>

                 <div className="col-span-4 p-12 border-l border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
                    <div className="space-y-10 flex-1">
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Threat_Assessment</h4>
                            <div className="p-8 bg-slate-900 dark:bg-black rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                   <Zap size={80} />
                                </div>
                                <div className="flex justify-between items-center mb-8 relative z-10">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confidence Index</span>
                                    <span className="text-xs font-bold text-indigo-400 font-mono italic">Sentinel_AI</span>
                                </div>
                                <div className="flex items-end gap-3 mb-10 relative z-10">
                                    <span className="text-6xl font-black italic tracking-tighter">98<span className="text-2xl text-slate-500">/100</span></span>
                                    <div className="flex flex-col mb-2">
                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1"><CheckCircle size={10}/> NOMINAL</span>
                                        <div className="h-1.5 w-20 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                                            <div className="h-full bg-green-500 w-[98%] shadow-[0_0_12px_#22c55e]"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 pt-6 border-t border-slate-800 relative z-10">
                                    <div className="flex justify-between text-[10px] font-black uppercase">
                                        <span className="text-slate-500">Blacklist Check:</span>
                                        <span className="text-green-500">CLEARED</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black uppercase">
                                        <span className="text-slate-500">PEP Monitoring:</span>
                                        <span className="text-green-500">NO MATCH</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Dispatch_Decisions</h4>
                            <div className="grid grid-cols-1 gap-3">
                                <button 
                                  onClick={() => moveApp(selectedApp.id, 'APPROVED')}
                                  className="py-5 bg-green-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-3xl hover:bg-green-700 shadow-xl shadow-green-100 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                   <CheckCircle size={18} /> Approve Identity
                                </button>
                                <button 
                                  onClick={() => moveApp(selectedApp.id, 'ACTION_REQUIRED')}
                                  className="py-5 bg-amber-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-3xl hover:bg-amber-600 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                   <AlertCircle size={18} /> Request Proof
                                </button>
                                <button 
                                  onClick={() => moveApp(selectedApp.id, 'INCOMING')}
                                  className="py-5 bg-slate-900 dark:bg-slate-800 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-3xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                   <XCircle size={18} /> Blacklist Entry
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <p className="mt-8 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase leading-relaxed tracking-widest text-center border-t border-slate-100 dark:border-slate-800 pt-6">
                       Verified by AetherOS Core Identity Protocol. Cryptographic signature will be appended to the merchant ledger.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default KYCView;
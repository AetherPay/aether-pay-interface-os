
import React, { useState } from 'react';
import { 
  Lock, ShieldCheck, FileCheck, Archive, AlertTriangle, 
  Download, RefreshCw, Eye, Zap, Search, ShieldAlert, Scale, 
  History, Fingerprint, Database, ShieldX, Terminal, FileSpreadsheet, 
  Plus, Shield, UserX, Globe, CheckCircle2, MoreHorizontal, FileText,
  Clock, Hash, Send, ChevronRight, Gavel, SearchCode, FileSearch
} from 'lucide-react';
import { mockAMLEvents, mockMerchants, mockAuditLogs, mockComplianceReports } from '../services/mockData';
import { ViewState, Merchant, AMLEvent } from '../types';
import KYCView from './KYCView';

interface ComplianceViewProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const ComplianceView: React.FC<ComplianceViewProps> = ({ currentView, setView }) => {
  const [toast, setToast] = useState<string | null>(null);
  const [sanctionsSearch, setSanctionsSearch] = useState("");
  const [isScanningSanctions, setIsScanningSanctions] = useState(false);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const AMLMonitoring = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-red-600 rounded-xl text-white shadow-lg"><ShieldAlert size={20}/></div>
             <div>
                <h3 className="text-sm font-black text-red-900 dark:text-red-400 uppercase italic">Critical AML Alert</h3>
                <p className="text-xs text-red-700 dark:text-red-500 font-medium">Potential layering detected on Merchant ID: Netflix_SN_01</p>
             </div>
          </div>
          <button onClick={() => showToast("Escalated to Compliance Director.")} className="px-6 py-2 bg-red-600 text-white text-[9px] font-black uppercase rounded-lg hover:bg-red-700 transition-all active:scale-95">Immediate Action</button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockAMLEvents.map(e => (
             <div key={e.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl group hover:shadow-lg transition-all border-l-4 border-l-red-500">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black font-mono text-indigo-500">{e.id}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">{e.timestamp}</span>
                   </div>
                   <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      e.status === 'NEW' ? 'bg-indigo-100 text-indigo-700' : 
                      e.status === 'INVESTIGATING' ? 'bg-amber-100 text-amber-700' :
                      e.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                   }`}>
                      {e.status}
                   </span>
                </div>
                <h3 className="text-base font-black italic uppercase tracking-tight truncate text-slate-900 dark:text-white mb-2">{e.merchantName}</h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl mb-6">
                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Reason for Trigger</p>
                   <p className="text-xs font-bold text-slate-700 dark:text-slate-300 italic">{e.triggerReason}</p>
                </div>
                <div className="flex justify-between items-center mb-6">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Score</span>
                   <span className={`text-xl font-black italic tracking-tighter ${e.riskScore > 80 ? 'text-red-600' : 'text-amber-600'}`}>{e.riskScore}</span>
                </div>
                <button onClick={() => showToast(`Investigation opened for ${e.id}`)} className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-white text-[9px] font-black uppercase rounded-lg hover:bg-black transition-all flex items-center justify-center gap-2">
                   <Search size={14} /> Analyze Case
                </button>
             </div>
          ))}
       </div>
    </div>
  );

  const AuditTrail = () => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-in slide-in-from-top-4 duration-500">
       <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3"><Terminal size={14} className="text-indigo-500"/><h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Forensic Audit Log (Immutable)</h3></div>
          <button onClick={() => showToast("Downloading full audit trail...")} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all text-slate-400"><FileSpreadsheet size={16}/></button>
       </div>
       <table className="w-full text-left">
          <thead className="bg-white dark:bg-slate-900"><tr className="text-[9px] font-black text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800"><th className="px-6 py-4">Timestamp</th><th className="px-6 py-4">Actor</th><th className="px-6 py-4">Action</th><th className="px-6 py-4">Target Node</th><th className="px-6 py-4">Hash</th></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[9px]">
             {mockAuditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                   <td className="px-6 py-4 text-slate-400">{log.timestamp}</td>
                   <td className="px-6 py-4 font-bold text-slate-900 dark:text-white uppercase italic">{log.actor}</td>
                   <td className="px-6 py-4"><span className={`px-1.5 py-0.5 rounded font-black ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{log.action}</span></td>
                   <td className="px-6 py-4 text-slate-500">{log.target}</td>
                   <td className="px-6 py-4 text-indigo-400 truncate max-w-[150px]">sha256:{Math.random().toString(36).substr(2, 10)}</td>
                </tr>
             ))}
          </tbody>
       </table>
    </div>
  );

  const MerchantStatusMatrix = () => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-500">
       <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Globe size={12} className="text-indigo-500" /> Compliance Status Matrix
          </h3>
          <div className="flex gap-2">
             <div className="relative"><input type="text" placeholder="Filter merchants..." className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none" /><Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" /></div>
          </div>
       </div>
       <table className="w-full text-left">
          <thead className="bg-white dark:bg-slate-900"><tr className="text-[9px] font-black text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800"><th className="px-6 py-4">Merchant Node</th><th className="px-6 py-4 text-center">Health Score</th><th className="px-6 py-4 text-center">Tier</th><th className="px-6 py-4 text-center">Compliance Status</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
             {mockMerchants.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                   <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic">{m.name}</p>
                      <p className="text-[9px] font-mono text-slate-400 uppercase">{m.country} • {m.id}</p>
                   </td>
                   <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                         <span className={`text-xs font-black italic tracking-tighter ${m.healthScore > 80 ? 'text-green-600' : 'text-red-600'}`}>{m.healthScore}%</span>
                         <div className="h-1 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${m.healthScore > 80 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${m.healthScore}%` }}></div>
                         </div>
                      </div>
                   </td>
                   <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded ${m.tier === 'VIP' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>{m.tier}</span>
                   </td>
                   <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                         m.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 
                         m.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                      }`}>{m.status}</span>
                   </td>
                   <td className="px-6 py-4 text-right">
                      <button onClick={() => showToast(`Reviewing merchant profile for ${m.name}...`)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-all"><Eye size={16}/></button>
                   </td>
                </tr>
             ))}
          </tbody>
       </table>
    </div>
  );

  const SanctionsTerminal = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
       <div className="bg-slate-950 p-12 rounded-[32px] border border-slate-800 text-center relative overflow-hidden shadow-2xl min-h-[500px] flex flex-col items-center justify-center">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}></div>
          <div className="absolute top-0 right-0 p-12 opacity-5"><SearchCode size={200} className="text-indigo-500" /></div>
          
          <div className="relative z-10 w-full max-w-2xl">
             <div className="h-20 w-20 bg-indigo-600 rounded-[28px] mx-auto flex items-center justify-center text-white shadow-[0_0_40px_rgba(99,102,241,0.4)] mb-8 animate-pulse-slow">
                <ShieldCheck size={40}/>
             </div>
             <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none">AetherOS Sentinel</h3>
             <p className="text-sm text-slate-400 font-medium mb-10 max-w-lg mx-auto">Cross-referencing Global Sanction Lists, Interpol Red Notices, and Regional PEP Databases.</p>
             
             <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-10 text-left backdrop-blur-md">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4 block italic">Entity Investigation Entry</label>
                <div className="relative">
                   <Search className="absolute left-4 top-4 h-5 w-5 text-indigo-500" />
                   <input 
                      type="text" 
                      value={sanctionsSearch}
                      onChange={(e) => setSanctionsSearch(e.target.value)}
                      placeholder="Enter individual name, company ID, or bank node..." 
                      className="w-full pl-12 pr-4 py-4 bg-black border border-slate-800 rounded-xl text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                     setIsScanningSanctions(true);
                     setTimeout(() => {
                        setIsScanningSanctions(false);
                        showToast(`Scan complete. No matching records found in OFAC/EU lists.`);
                     }, 2000);
                  }}
                  disabled={!sanctionsSearch || isScanningSanctions}
                  className="py-4 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/10 disabled:opacity-50"
                >
                   {isScanningSanctions ? <RefreshCw className="animate-spin" size={16}/> : <Zap size={16}/>} 
                   {isScanningSanctions ? "Analyzing..." : "Deep Scan Database"}
                </button>
                <button className="py-4 bg-slate-800 text-white text-[10px] font-black uppercase rounded-xl hover:bg-slate-700 transition-all flex items-center justify-center gap-3">
                   <FileSearch size={16}/> Manual Review File
                </button>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
             { label: 'OFAC Sanctions', count: '14,204', status: 'SYNCED', color: 'text-indigo-400' },
             { label: 'EU List', count: '8,992', status: 'SYNCED', color: 'text-indigo-400' },
             { label: 'BCEAO Watchlist', count: '1,201', status: 'SYNCED', color: 'text-indigo-400' }
          ].map(db => (
             <div key={db.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex justify-between items-center shadow-sm">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{db.label}</p>
                   <p className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white mt-1">{db.count}</p>
                </div>
                <div className="flex flex-col items-end">
                   <div className="flex h-2 w-2 relative mb-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                   </div>
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{db.status}</span>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  const RegulatoryReports = () => (
    <div className="space-y-6 animate-in zoom-in-95 duration-500">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 flex flex-col">
             <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8"><Gavel size={28}/></div>
             <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Génération de Rapport Réglementaire</h3>
             <p className="text-xs text-indigo-100 font-medium leading-relaxed mb-10 flex-1">Préparez les soumissions périodiques pour la BCEAO ou les autorités nationales. Validation multi-signatures requise.</p>
             <button onClick={() => showToast("Initializing Regulatory Dispatch flow...")} className="w-full py-4 bg-white text-indigo-600 text-[10px] font-black uppercase rounded-2xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                Nouveau Rapport <Plus size={16}/>
             </button>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col">
             <div className="flex justify-between items-center mb-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Derniers Rapports Soumis</h4>
                <div className="flex gap-2">
                   <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"><RefreshCw size={14} className="text-slate-400"/></button>
                </div>
             </div>
             
             <div className="space-y-4 flex-1">
                {mockComplianceReports.map(rep => (
                   <div key={rep.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                      <div className="flex items-center gap-4">
                         <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${rep.format === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            <FileText size={20}/>
                         </div>
                         <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{rep.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{rep.generatedAt} • {rep.size}</p>
                         </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => showToast(`Downloading ${rep.id}...`)} className="p-2 text-indigo-600 hover:bg-white dark:hover:bg-slate-900 rounded-lg shadow-sm"><Download size={16}/></button>
                         <button onClick={() => showToast(`Report ${rep.id} audit trail accessed.`)} className="p-2 text-slate-400 hover:bg-white dark:hover:bg-slate-900 rounded-lg shadow-sm"><History size={16}/></button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="relative min-h-[85vh]">
      {toast && (
        <div className="fixed top-24 right-8 z-[200] bg-slate-950 border border-indigo-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right backdrop-blur-xl">
           <Zap size={14} className="text-indigo-400 animate-pulse" />
           <p className="text-[10px] font-black uppercase tracking-widest italic">{toast}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/40">
                <Scale className="text-white h-4 w-4" />
             </div>
             <h1 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase">
                Compliance<span className="text-indigo-600">.Matrix</span>
             </h1>
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Regulatory Infrastructure • Node Integrity: CLEAR</p>
        </div>
      </div>

      <div className="relative">
         {currentView === 'COMPLIANCE_KYC_REVIEW' && <KYCView />}
         {currentView === 'COMPLIANCE_MERCHANT_STATUS' && <MerchantStatusMatrix />}
         {currentView === 'COMPLIANCE_AML_MONITORING' && <AMLMonitoring />}
         {currentView === 'COMPLIANCE_PEP_SANCTIONS' && <SanctionsTerminal />}
         {currentView === 'COMPLIANCE_AUDIT_LOGS' && <AuditTrail />}
         {currentView === 'COMPLIANCE_REGULATORY_REPORTS' && <RegulatoryReports />}
      </div>
    </div>
  );
};

export default ComplianceView;

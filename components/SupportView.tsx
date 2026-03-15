
import React, { useState } from 'react';
import { 
  Search, Eye, Zap, Headphones, ShieldAlert, History, Clock, BrainCircuit, Plus, 
  Copy, Globe, TrendingUp, ShieldCheck, Mail, Phone, Activity, UserPlus, Ghost, X,
  Filter, MoreHorizontal, MessageSquare, ChevronRight, AlertCircle, CheckCircle2,
  ExternalLink, BarChart3, RefreshCw, Trash2, Power
} from 'lucide-react';
import { mockMerchants, mockTickets, mockAetherLinks } from '../services/mockData';
import { ViewState, SupportTicket, AetherLink } from '../types';

interface SupportViewProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  setImpersonating: (isImpersonating: boolean) => void;
}

const SupportView: React.FC<SupportViewProps> = ({ currentView, setView, setImpersonating }) => {
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
  const [links, setLinks] = useState<AetherLink[]>(mockAetherLinks);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredMerchants = mockMerchants.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  const MerchantDirectory = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 shadow-sm">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search merchants by name, ID or region..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" /></div>
          <button className="px-6 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl flex items-center gap-2"><UserPlus size={14}/> Add Merchant</button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMerchants.map(m => (
             <div key={m.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl group hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                   <div className="h-12 w-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:text-indigo-600 transition-all">{m.name.charAt(0)}</div>
                   <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${m.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{m.status}</span>
                </div>
                <h3 className="text-base font-black italic uppercase tracking-tight truncate">{m.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 mb-6">{m.country} • {m.industry}</p>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                   <button onClick={() => triggerToast(`Navigating to ${m.name} 360 profile...`)} className="py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-[9px] font-black uppercase rounded-lg hover:bg-slate-100 transition-all">Profile</button>
                   <button onClick={() => { triggerToast(`Stealth Session Initialized for ${m.name}`); setImpersonating(true); }} className="py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 text-[9px] font-black uppercase rounded-lg hover:bg-indigo-100 transition-all flex items-center justify-center gap-1"><Ghost size={12}/> Proxy</button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  const ImpersonationCenter = () => (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-12 text-center animate-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden">
       <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Ghost size={200} /></div>
       <div className="max-w-xl mx-auto">
          <div className="h-20 w-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl shadow-indigo-500/50 mb-8"><Ghost size={40}/></div>
          <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">AetherOS Stealth Proxy</h3>
          <p className="text-sm text-slate-400 mb-10 leading-relaxed font-medium">Access any merchant account in "View-Only" mode. All interactions are logged in the forensic audit trail for security compliance.</p>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-10 text-left">
             <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block italic">Authorized Proxy Entry Point</label>
             <div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500"/><input type="text" placeholder="Merchant UID or ID..." className="w-full pl-10 pr-4 py-3 bg-black border border-slate-700 rounded-xl text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          </div>
          <button onClick={() => { triggerToast("Stealth handshake successful."); setImpersonating(true); }} className="w-full py-4 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95">Initiate Secure Impersonation</button>
       </div>
    </div>
  );

  const TicketHub = () => (
    <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
             { label: 'Unassigned', count: 12, color: 'text-indigo-600' },
             { label: 'Critical', count: 4, color: 'text-red-600' },
             { label: 'Waiting Partner', count: 8, color: 'text-amber-600' },
             { label: 'Resolved Today', count: 24, color: 'text-green-600' }
          ].map(stat => (
             <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className={`text-2xl font-black italic tracking-tighter mt-1 ${stat.color}`}>{stat.count}</p>
             </div>
          ))}
       </div>

       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={12} className="text-indigo-500" /> Support Dispatch Queue
             </h3>
             <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Filter size={14}/></button>
             </div>
          </div>
          <table className="w-full text-left">
             <thead className="bg-white dark:bg-slate-900"><tr className="text-[9px] font-black text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800"><th className="px-6 py-4">Ticket ID</th><th className="px-6 py-4">Issue Subject</th><th className="px-6 py-4">Merchant</th><th className="px-6 py-4">SLA Clock</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tickets.map(t => (
                   <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <span className={`h-2 w-2 rounded-full ${t.priority === 'CRITICAL' ? 'bg-red-500 animate-pulse' : t.priority === 'NORMAL' ? 'bg-amber-500' : 'bg-slate-300'}`}></span>
                            <span className="text-[10px] font-black font-mono text-indigo-500">{t.id}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <p className="text-xs font-bold text-slate-900 dark:text-white uppercase italic truncate max-w-xs">{t.subject}</p>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{t.category} • {t.status}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-black text-slate-500 uppercase">{t.customerName}</td>
                      <td className="px-6 py-4 text-xs font-mono font-bold text-red-600">{t.slaDue}</td>
                      <td className="px-6 py-4 text-right">
                         <button onClick={() => triggerToast(`Claiming ticket ${t.id}...`)} className="px-4 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg hover:bg-indigo-700 transition-all">Claim</button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  const AetherLinkManager = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
       <div className="flex justify-between items-center mb-6">
          <div>
             <h3 className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">AetherLinks.Bridge</h3>
             <p className="text-xs text-slate-400 font-medium">Manage instant payment bridge URLs and conversion tunnels.</p>
          </div>
          <button onClick={() => triggerToast("Initializing Link Forge...")} className="px-6 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-2xl flex items-center gap-2 shadow-xl shadow-indigo-500/20"><Plus size={16}/> Create Bridge</button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {links.map(link => (
             <div key={link.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-6">
                   <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl"><ExternalLink size={20}/></div>
                   <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${link.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{link.status}</div>
                </div>
                <h3 className="text-sm font-black italic uppercase tracking-tight text-slate-900 dark:text-white mb-1 truncate">{link.alias}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">{link.merchantName}</p>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl mb-6">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Clicks</span>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{link.clicks.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase">GTV</span>
                      <span className="text-xs font-mono font-bold text-indigo-600">{link.volume.toLocaleString()} {link.currency}</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => { navigator.clipboard.writeText(link.url); triggerToast("Bridge URL copied to clipboard."); }} className="py-2 bg-slate-900 text-white text-[9px] font-black uppercase rounded-lg hover:bg-black transition-all flex items-center justify-center gap-2"><Copy size={12}/> Copy</button>
                   <button onClick={() => triggerToast(`Deactivating bridge ${link.id}...`)} className="py-2 bg-red-50 text-red-600 text-[9px] font-black uppercase rounded-lg hover:bg-red-100 transition-all flex items-center justify-center gap-2"><Power size={12}/> Kill</button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  return (
    <div className="relative min-h-[85vh]">
      {toast && (
        <div className="fixed top-24 right-8 z-[500] bg-slate-950 border border-indigo-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right backdrop-blur-xl">
           <Zap size={14} className="text-indigo-400 animate-pulse" />
           <p className="text-[10px] font-black uppercase tracking-widest italic">{toast}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/40">
                <Headphones className="text-white h-4 w-4" />
             </div>
             <h1 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase">
                Ops<span className="text-indigo-600">.Success</span>
             </h1>
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Merchant Success Portal • L3 Support Node Active</p>
        </div>
      </div>

      <div className="relative">
         {currentView === 'OPS_MERCHANT_DIRECTORY' && <MerchantDirectory />}
         {currentView === 'OPS_IMPERSONATION' && <ImpersonationCenter />}
         {currentView === 'OPS_TICKET_HUB' && <TicketHub />}
         {currentView === 'OPS_AETHERLINK' && <AetherLinkManager />}
      </div>
    </div>
  );
};

export default SupportView;

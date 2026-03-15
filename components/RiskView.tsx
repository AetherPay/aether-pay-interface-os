
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ShieldAlert, ShieldCheck, ShieldX, Zap, Search, 
  Terminal, Activity, Lock, Globe, ListX, 
  Check, X, AlertTriangle, Eye, History, 
  Play, Pause, Sliders, Fingerprint, UserX,
  CheckCircle2, BarChart3, TrendingUp, Filter, Trash2, ShieldPlus
} from 'lucide-react';
import { mockRiskRules, mockQuarantinedTransactions, mockThreatLogs, generateTransactions, chartData } from '../services/mockData';
import { QuarantinedTransaction, ViewState, Transaction } from '../types';

interface RiskViewProps {
  currentView: ViewState;
}

const RiskView: React.FC<RiskViewProps> = ({ currentView }) => {
  const [rules, setRules] = useState(mockRiskRules);
  const [quarantined, setQuarantined] = useState<QuarantinedTransaction[]>(mockQuarantinedTransactions);
  const [threatLogs, setThreatLogs] = useState(mockThreatLogs);
  const [toast, setToast] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [riskTxns, setRiskTxns] = useState<Transaction[]>(generateTransactions(10).filter(t => t.riskScore > 60));

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      triggerToast("Sentinel scan: 14,204 packets inspected. 0 threats detected.");
    }, 1500);
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : r));
    triggerToast(`Rule ${id} status updated.`);
  };

  const handleQuarantineAction = (id: string, action: 'RELEASE' | 'BLOCK') => {
    setQuarantined(prev => prev.filter(q => q.id !== id));
    triggerToast(`Transaction ${id} manually ${action.toLowerCase()}d.`);
  };

  const RiskRadar = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 p-6 relative overflow-hidden flex flex-col shadow-2xl h-[400px]">
           <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           <div className="flex justify-between items-start relative z-10 mb-8">
              <div>
                 <h3 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
                    <Activity size={12} className="animate-pulse" /> Sentinel Radar
                 </h3>
                 <p className="text-xl font-black text-white italic tracking-tighter uppercase">Detection Matrix</p>
              </div>
              <button onClick={handleRunScan} disabled={isScanning} className="px-4 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2">
                 {isScanning ? <History size={12} className="animate-spin" /> : <Zap size={12} />} 
                 {isScanning ? 'Scanning...' : 'Run Scan'}
              </button>
           </div>
           <div className="flex-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                    <defs>
                       <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="volume" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#riskGradient)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-sm h-[400px]">
           <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Terminal size={12} className="text-indigo-500" /> Threat Intelligence Logs
              </h3>
           </div>
           <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
              {threatLogs.map(log => (
                 <div key={log.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 shadow-sm shrink-0">
                       {log.status === 'BLOCKED' ? <ShieldX size={12} className="text-red-600"/> : <ShieldCheck size={12} className="text-green-600"/>}
                    </div>
                    <div className="min-w-0">
                       <p className="text-[8px] font-black text-slate-400 uppercase truncate">{log.time} • {log.target}</p>
                       <p className="text-[10px] font-bold text-slate-800 dark:text-white truncate italic">{log.event}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );

  const QuarantineCenter = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500">
       {quarantined.map(item => (
          <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl group hover:shadow-lg transition-all">
             <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] font-black text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded uppercase tracking-widest border border-amber-200 dark:border-amber-800">Quarantined</span>
                <span className="text-[9px] font-mono text-slate-400">{item.id}</span>
             </div>
             <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase italic truncate mb-2">{item.customerName}</h3>
             <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-6">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Trigger Reason</p>
                <p className="text-xs font-bold text-red-600 dark:text-red-400 italic">{item.reason}</p>
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                   <span className="text-xs font-black text-slate-900 dark:text-white">{item.amount.toLocaleString()} {item.currency}</span>
                   <span className="text-[9px] font-bold text-slate-400">{item.quarantinedAt}</span>
                </div>
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={() => handleQuarantineAction(item.id, 'RELEASE')}
                  className="flex-1 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Play size={10} /> Release
                </button>
                <button 
                  onClick={() => handleQuarantineAction(item.id, 'BLOCK')}
                  className="flex-1 py-2 bg-red-50 text-red-600 text-[9px] font-black uppercase rounded-lg hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldX size={10} /> Permanent Block
                </button>
             </div>
          </div>
       ))}
       {quarantined.length === 0 && (
         <div className="col-span-full py-24 text-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <CheckCircle2 size={40} className="mx-auto text-green-500 mb-4 opacity-50" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Quarantine Vault Clear.</p>
         </div>
       )}
    </div>
  );

  const RuleEngine = () => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden animate-in duration-500 shadow-sm">
       <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Sliders size={12} className="text-indigo-500" /> Active Security Protocols
          </h3>
          <button onClick={() => triggerToast("Launching Rule Creator Wizard...")} className="px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg">Create New Rule</button>
       </div>
       <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800">
             <tr className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4">Protocol Identification</th>
                <th className="px-6 py-4 text-center">Hits (24h)</th>
                <th className="px-6 py-4 text-center">Operational Status</th>
                <th className="px-6 py-4 text-right">Dispatch Control</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
             {rules.map(rule => (
                <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                   <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic">{rule.name}</p>
                      <p className="text-[9px] font-mono text-slate-400">{rule.id}</p>
                   </td>
                   <td className="px-6 py-4 text-center text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{rule.triggerCount24h}</td>
                   <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded ${rule.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>{rule.status}</span>
                   </td>
                   <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                         <button onClick={() => toggleRule(rule.id)} className={`p-1.5 rounded-lg transition-all ${rule.status === 'ACTIVE' ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'}`}>
                            {rule.status === 'ACTIVE' ? <Pause size={16} /> : <Play size={16} />}
                         </button>
                         <button onClick={() => triggerToast(`Editing configuration for ${rule.id}...`)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all">
                            <Sliders size={16} />
                         </button>
                      </div>
                   </td>
                </tr>
             ))}
          </tbody>
       </table>
    </div>
  );

  const RiskTransactionsList = () => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden animate-in fade-in duration-500 shadow-sm">
       <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">High-Risk Transaction Queue</h3>
          <div className="flex gap-2">
             <div className="relative"><input type="text" placeholder="Filter ID..." className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none" /><Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" /></div>
          </div>
       </div>
       <table className="w-full text-left">
          <thead className="bg-white dark:bg-slate-900">
             <tr className="text-[9px] font-black text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">TXN ID</th>
                <th className="px-6 py-4">Merchant</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-center">Score</th>
                <th className="px-6 py-4 text-right">Action</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
             {riskTxns.map(txn => (
                <tr key={txn.id} className="hover:bg-red-50/30 dark:hover:bg-red-500/5 transition-colors">
                   <td className="px-6 py-4 font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">{txn.id}</td>
                   <td className="px-6 py-4 font-bold text-xs text-slate-900 dark:text-slate-200">{txn.customerName}</td>
                   <td className="px-6 py-4 text-xs font-black text-slate-900 dark:text-slate-200">{txn.amount.toLocaleString()} {txn.currency}</td>
                   <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${txn.riskScore > 80 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{txn.riskScore}</span>
                   </td>
                   <td className="px-6 py-4 text-right">
                      <button onClick={() => triggerToast(`Transaction ${txn.id} flagged for review.`)} className="p-1.5 text-slate-400 hover:text-red-600 transition-all"><AlertTriangle size={14} /></button>
                   </td>
                </tr>
             ))}
          </tbody>
       </table>
    </div>
  );

  const BlacklistManager = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
       {[
          { label: 'Blocked IPs', count: 1242, icon: Globe, color: 'text-indigo-500' },
          { label: 'Blocked Cards', count: 88, icon: Sliders, color: 'text-red-500' },
          { label: 'Blocked Domains', count: 15, icon: ShieldX, color: 'text-amber-500' }
       ].map(item => (
          <div key={item.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
             <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 ${item.color}`}><item.icon size={20}/></div>
                <button onClick={() => triggerToast(`Adding new entry to ${item.label}...`)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"><ShieldPlus size={16}/></button>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
             <h3 className="text-3xl font-black italic tracking-tighter mt-1 text-slate-900 dark:text-white">{item.count.toLocaleString()}</h3>
             <button onClick={() => triggerToast(`Accessing list entries for ${item.label}...`)} className="w-full mt-6 py-2 bg-slate-900 dark:bg-slate-800 text-white text-[9px] font-black uppercase rounded-lg hover:bg-black transition-all">Manage Entries</button>
          </div>
       ))}
    </div>
  );

  return (
    <div className="relative min-h-[80vh]">
      {toast && (
        <div className="fixed top-20 right-8 z-[200] bg-slate-950 border border-red-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right backdrop-blur-md">
           <ShieldAlert size={14} className="text-red-500 animate-pulse" />
           <p className="text-[10px] font-black uppercase tracking-widest">{toast}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-red-600 rounded-xl shadow-lg shadow-red-500/20">
                <ShieldAlert className="text-white h-4 w-4" />
             </div>
             <h1 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase leading-none">
                Risk<span className="text-red-600">.Radar</span>
             </h1>
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Sentinel Deep Packet Inspection Active</p>
        </div>
      </div>

      <div className="relative">
         {currentView === 'RISK_DASHBOARD' && <RiskRadar />}
         {currentView === 'RISK_TRANSACTIONS' && <RiskTransactionsList />}
         {currentView === 'RISK_QUARANTINE' && <QuarantineCenter />}
         {currentView === 'RISK_RULE_ENGINE' && <RuleEngine />}
         {currentView === 'RISK_BLACKLISTS' && <BlacklistManager />}
      </div>
    </div>
  );
};

export default RiskView;

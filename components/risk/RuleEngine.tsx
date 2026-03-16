import React, { useState } from 'react';
import { Sliders, Play, Pause, Zap } from 'lucide-react';
import { mockRiskRules } from '../../services/mockData';

const RuleEngine: React.FC = () => {
  const [rules, setRules] = useState(mockRiskRules);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map((r: any) => r.id === id ? { ...r, status: r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : r));
    triggerToast(`Rule ${id} status updated.`);
  };

  return (
    <>
      {toast && (
        <div className="fixed top-20 right-8 z-[200] bg-slate-950 border border-red-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right backdrop-blur-md">
          <Zap size={14} className="text-red-500 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-widest">{toast}</p>
        </div>
      )}
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
            {rules.map((rule: any) => (
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
    </>
  );
};

export default RuleEngine;

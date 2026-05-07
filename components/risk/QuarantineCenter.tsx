import React, { useState } from 'react';
import { Play, ShieldX, CheckCircle2, Zap } from 'lucide-react';
import { mockQuarantinedTransactions } from '../../services/mockData';
import { QuarantinedTransaction } from '../../types';

const QuarantineCenter: React.FC = () => {
  const [quarantined, setQuarantined] = useState<QuarantinedTransaction[]>(mockQuarantinedTransactions);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleQuarantineAction = (id: string, action: 'RELEASE' | 'BLOCK') => {
    setQuarantined(prev => prev.filter(q => q.id !== id));
    triggerToast(`Transaction ${id} manually ${action.toLowerCase()}d.`);
  };

  return (
    <>
      {toast && (
        <div className="fixed top-20 right-8 z-[200] bg-slate-950 border border-red-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right backdrop-blur-md">
          <Zap size={14} className="text-red-500 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-widest">{toast}</p>
        </div>
      )}
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
    </>
  );
};

export default QuarantineCenter;

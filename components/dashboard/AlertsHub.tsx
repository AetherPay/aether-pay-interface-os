import React, { useState } from 'react';
import { ShieldCheck, Zap } from 'lucide-react';
import { mockIncidents as initialIncidents } from '../../services/mockData';

const AlertsHub: React.FC = () => {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      {toast && (
        <div className="fixed top-20 right-8 z-[200] bg-slate-950 border border-indigo-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right backdrop-blur-md">
          <Zap size={14} className="text-indigo-400 fill-indigo-400 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-widest">{toast}</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
        {incidents.map((inc) => (
          <div
            key={inc.id}
            className={`bg-white dark:bg-slate-900 border ${inc.severity === 'CRITICAL' ? 'border-red-500 shadow-md' : 'border-slate-200 dark:border-slate-800'} p-5 rounded-xl`}
          >
            <div className="flex justify-between items-start mb-3">
              <span
                className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest ${
                  inc.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {inc.severity}
              </span>
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-400 font-mono italic">{inc.id}</span>
                <span className="text-[8px] text-slate-400 mt-1">{inc.timestamp}</span>
              </div>
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight mb-6">{inc.title}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIncidents((p) => p.filter((i) => i.id !== inc.id));
                  triggerToast(`Incident ${inc.id} acknowledged.`);
                }}
                className="flex-1 py-2 bg-slate-900 dark:bg-slate-800 text-white text-[9px] font-black uppercase rounded-lg hover:bg-black transition-colors"
              >
                Ack
              </button>
              <button
                onClick={() => triggerToast(`Incident ${inc.id} escalated to L3.`)}
                className="flex-1 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Escalate
              </button>
            </div>
          </div>
        ))}
        {incidents.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <ShieldCheck size={40} className="mx-auto text-green-500 mb-4 opacity-50" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No active incidents. All systems nominal.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default AlertsHub;

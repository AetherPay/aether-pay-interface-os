import React, { useState } from 'react';
import { Globe, Sliders, ShieldX, ShieldPlus, Zap } from 'lucide-react';

const BlacklistManager: React.FC = () => {
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      {toast && (
        <div className="fixed top-20 right-8 z-[200] bg-slate-950 border border-red-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right backdrop-blur-md">
          <Zap size={14} className="text-red-500 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-widest">{toast}</p>
        </div>
      )}
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
    </>
  );
};

export default BlacklistManager;

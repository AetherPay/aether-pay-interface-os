import React, { useState } from 'react';
import { Server, Activity, Zap, Cpu, RefreshCw } from 'lucide-react';
import { mockServices } from '../../services/mockData';
import { Service } from '../../types';

const ServiceGrid: React.FC = () => {
  const [services] = useState<Service[]>(mockServices);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      {toast && (
        <div className="fixed top-24 right-8 z-[500] bg-slate-950 border border-indigo-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right backdrop-blur-xl border-l-4 border-l-indigo-600">
          <Zap size={14} className="text-indigo-400 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-widest italic">{toast}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
        {services.map(svc => (
          <div key={svc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[32px] group hover:shadow-xl transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <Cpu size={150} />
            </div>

            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-500">
                <Server size={32}/>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center h-4 relative mb-1 gap-2">
                  <span className={`text-[8px] font-black uppercase ${
                    svc.status === 'HEALTHY' ? 'text-green-500' : svc.status === 'DEGRADED' ? 'text-amber-500' : 'text-red-500'
                  }`}>{svc.status}</span>
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      svc.status === 'HEALTHY' ? 'bg-green-400' : svc.status === 'DEGRADED' ? 'bg-amber-400' : 'bg-red-400'
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                      svc.status === 'HEALTHY' ? 'bg-green-500' : svc.status === 'DEGRADED' ? 'bg-amber-500' : 'bg-red-500'
                    }`}></span>
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest">Uptime: {svc.uptime}</p>
              </div>
            </div>

            <div className="mb-10 relative z-10">
              <h3 className="text-2xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter mb-2">{svc.name}</h3>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest">{svc.version}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase italic flex items-center gap-1">
                  <Zap size={10}/> {svc.instances} Instances Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-50 dark:border-slate-800 pt-8 relative z-10">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">CPU Load</p>
                <div className="flex items-center gap-3">
                  <p className={`text-lg font-black italic ${svc.cpu > 70 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{svc.cpu}%</p>
                  <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden max-w-[80px]">
                    <div className={`h-full ${svc.cpu > 70 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${svc.cpu}%` }}></div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Memory Matrix</p>
                <p className="text-lg font-black italic text-slate-900 dark:text-white uppercase tracking-tighter">{svc.memory}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-8">
              <button onClick={() => triggerToast(`Restarting ${svc.id} cluster...`)} className="py-3 bg-slate-950 text-white text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all">
                <RefreshCw size={14} /> Bounce Nodes
              </button>
              <button onClick={() => triggerToast(`Scaling ${svc.id} horizontally...`)} className="py-3 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <Activity size={14} /> Scale
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ServiceGrid;

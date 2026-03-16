import React, { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, History, Hash, Zap } from 'lucide-react';
import { mockDeployments } from '../../services/mockData';
import { Deployment } from '../../types';

const DeploymentLog: React.FC = () => {
  const [deployments] = useState<Deployment[]>(mockDeployments);
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
      <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
        <div className="grid grid-cols-1 gap-4">
          {deployments.map(dep => (
            <div key={dep.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                    dep.status === 'SUCCESS' ? 'bg-green-600' : dep.status === 'FAILED' ? 'bg-red-600' : 'bg-indigo-600 animate-pulse'
                  }`}>
                    {dep.status === 'SUCCESS' ? <CheckCircle2 size={24}/> : dep.status === 'FAILED' ? <XCircle size={24}/> : <RefreshCw size={24} className="animate-spin"/>}
                  </div>
                  <div>
                    <h4 className="text-base font-black italic text-slate-900 dark:text-white uppercase tracking-tighter">{dep.service}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded uppercase">{dep.environment}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{dep.timestamp} by {dep.author}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 rounded-2xl flex items-center gap-8">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Version</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{dep.version}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Git Trace</p>
                    <div className="flex items-center gap-2 text-indigo-500 font-mono text-xs font-bold">
                      <Hash size={12}/> {dep.hash}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => triggerToast(`Viewing logs for deployment ${dep.id}...`)} className="px-4 py-2 bg-slate-950 text-white text-[9px] font-black uppercase rounded-xl hover:bg-black transition-all">Logs</button>
                  {dep.status === 'SUCCESS' && (
                    <button onClick={() => triggerToast(`Initializing automated rollback for ${dep.service}...`)} className="px-4 py-2 bg-red-50 text-red-600 text-[9px] font-black uppercase rounded-xl hover:bg-red-100 transition-all flex items-center gap-2">
                      <History size={12}/> Rollback
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DeploymentLog;

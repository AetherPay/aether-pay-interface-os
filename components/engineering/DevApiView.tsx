import React, { useState } from 'react';
import { Rocket, RefreshCw, Zap } from 'lucide-react';
import ServiceGrid from './ServiceGrid';
import WebhookMonitor from './WebhookMonitor';
import DeploymentLog from './DeploymentLog';
import APIStats from './APIStats';

interface DevApiViewProps {
  currentView: any;
}

const DevApiView: React.FC<DevApiViewProps> = ({ currentView }) => {
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="relative min-h-[85vh]">
      {toast && (
        <div className="fixed top-24 right-8 z-[500] bg-slate-950 border border-indigo-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right backdrop-blur-xl border-l-4 border-l-indigo-600">
          <Zap size={14} className="text-indigo-400 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-widest italic">{toast}</p>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-slate-950 rounded-xl shadow-lg">
              <Rocket className="text-white h-4 w-4" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase leading-none">
              Aether<span className="text-indigo-600">.Engine</span>
            </h1>
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Node Health & Infrastructure Control Center</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => triggerToast("Initializing infrastructure re-sync...")} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase rounded-xl flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <RefreshCw size={14}/> Node Sync
          </button>
        </div>
      </div>
      <div className="relative">
        {currentView === 'ENG_SERVICES_HEALTH'  && <ServiceGrid />}
        {currentView === 'ENG_API_ANALYTICS'    && <APIStats />}
        {currentView === 'ENG_WEBHOOK_MONITOR'  && <WebhookMonitor />}
        {currentView === 'ENG_DEPLOYMENTS'      && <DeploymentLog />}
      </div>
    </div>
  );
};

export default DevApiView;

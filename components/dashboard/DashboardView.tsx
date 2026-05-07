import React, { useState } from 'react';
import { Terminal, MapPin, Cpu, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import { ViewState } from '../../types';
import GlobalOverview from './GlobalOverview';
import LiveTransactionMap from './LiveTransactionMap';
import ZoneFlux from './ZoneFlux';
import AlertsHub from './AlertsHub';
import ExecutiveReports from './ExecutiveReports';

interface DashboardViewProps {
  setView: (view: ViewState) => void;
  currentView: ViewState;
}

const DashboardView: React.FC<DashboardViewProps> = ({ setView, currentView }) => {
  const [showToast, setShowToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  return (
    <div className="relative min-h-[80vh]">
      {showToast && (
        <div className="fixed top-20 right-8 z-[200] bg-slate-950 border border-indigo-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right backdrop-blur-md">
          <Zap size={14} className="text-indigo-400 fill-indigo-400 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-widest">{showToast}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Terminal className="text-white h-4 w-4" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase">
              {currentView.replace(/COMMAND_|TREASURY_|RISK_|ENG_|OPS_|SEC_|COMPLIANCE_/g, '').replace(/_/g, ' ')}
              <span className="text-indigo-600">.CORE</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
            <span className="flex items-center gap-1"><MapPin size={10} /> Alpha-01</span>
            <span className="flex items-center gap-1"><Cpu size={10} /> AetherOS v2.5</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => triggerToast('Synchronisation en cours...')}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase rounded-xl flex items-center gap-2"
          >
            <RefreshCw size={12} /> Sync
          </button>
          <button className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase rounded-xl flex items-center gap-2">
            <ShieldCheck size={12} /> Secure
          </button>
        </div>
      </div>

      <div className="relative">
        {currentView === 'COMMAND_GLOBAL_OVERVIEW' && <GlobalOverview setView={setView} />}
        {currentView === 'COMMAND_LIVE_MAP' && <LiveTransactionMap />}
        {currentView === 'COMMAND_ZONE_FLUX' && <ZoneFlux />}
        {currentView === 'COMMAND_ALERTS' && <AlertsHub />}
        {currentView === 'COMMAND_EXECUTIVE_REPORTS' && <ExecutiveReports />}
        {!currentView.startsWith('COMMAND_') && <GlobalOverview setView={setView} />}
      </div>
    </div>
  );
};

export default DashboardView;

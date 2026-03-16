import React, { useState } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Terminal, ShieldX, ShieldCheck, History } from 'lucide-react';
import { chartData, mockThreatLogs } from '../../services/mockData';

const RiskRadar: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [threatLogs] = useState(mockThreatLogs);

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

  return (
    <>
      {toast && (
        <div className="fixed top-20 right-8 z-[200] bg-slate-950 border border-red-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right backdrop-blur-md">
          <Zap size={14} className="text-red-500 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-widest">{toast}</p>
        </div>
      )}
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
              {threatLogs.map((log: any) => (
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
    </>
  );
};

export default RiskRadar;

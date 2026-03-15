
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  Zap, Globe, Activity, ShieldCheck, 
  BrainCircuit, Radio, Terminal, 
  ArrowUpRight, Cpu, Network, CheckCircle2, XCircle,
  History, AlertTriangle, Download, Filter, MousePointer2,
  TrendingUp, MapPin, Eye, AlertCircle
} from 'lucide-react';
import { KPI, FeedItem, Transaction, ViewState } from '../types';
import { cortexInsights, mockIncidents as initialIncidents } from '../services/mockData';
import TransactionTable from './TransactionTable';
import LiveFeed from './LiveFeed';

interface DashboardViewProps {
  kpis: KPI[];
  chartData: any[];
  liveFeedData: FeedItem[];
  transactions: Transaction[];
  setView: (view: ViewState) => void;
  currentView: ViewState;
}

const DashboardView: React.FC<DashboardViewProps> = ({ kpis, chartData, liveFeedData, transactions, setView, currentView }) => {
  const [showToast, setShowToast] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [incidents, setIncidents] = useState(initialIncidents);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      triggerToast("Command Center data synchronized with nodes.");
    }, 1200);
  };

  const handleAckIncident = (id: string) => {
    setIncidents(prev => prev.filter(inc => inc.id !== id));
    triggerToast(`Incident ${id} acknowledged and moved to triage.`);
  };

  const handleEscalateIncident = (id: string) => {
    triggerToast(`Incident ${id} escalated to L3 Engineering Team.`);
  };

  const GlobalOverview = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{kpi.label}</span>
              <div className={`p-1 rounded-lg ${kpi.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {kpi.trend === 'up' ? <TrendingUp size={12}/> : <TrendingUp size={12} className="rotate-180"/>}
              </div>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white italic">{kpi.value}</h3>
              <span className={`text-[10px] font-bold mb-1 ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest italic flex items-center gap-2">
              <Activity size={14} className="text-indigo-500"/> Real-time Throughput
            </h3>
            <div className="flex gap-1">
               <button className="px-2 py-0.5 text-[9px] font-black bg-indigo-50 text-indigo-600 rounded">24H</button>
               <button className="px-2 py-0.5 text-[9px] font-black text-slate-400 rounded">7D</button>
            </div>
          </div>
          <div className="flex-1 min-h-[300px] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '9px', color: '#fff' }}
                  itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorVol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-xl shadow-indigo-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <BrainCircuit size={80} />
            </div>
            <h3 className="text-[9px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
              <Zap size={12} className="text-indigo-200 fill-indigo-200" /> Cortex
            </h3>
            <p className="text-xs font-bold leading-relaxed mb-4 italic">
              "Liquidity imbalance detected in XOF pool. High inflow suggests routing shift."
            </p>
            <button 
              onClick={() => setView("TREASURY_POOLS")}
              className="w-full py-2 bg-white text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
            >
              Action <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="flex-1">
             <LiveFeed feed={liveFeedData} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
         <TransactionTable transactions={transactions} />
      </div>
    </div>
  );

  const LiveMap = () => (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-slate-950 rounded-2xl border border-slate-800 h-[500px] relative overflow-hidden flex flex-col lg:flex-row shadow-2xl">
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
         <div className="flex-1 relative p-8 flex items-center justify-center">
            <Globe className="h-24 w-24 text-indigo-500/20 animate-pulse-slow" />
         </div>
         <div className="w-full lg:w-80 border-l border-slate-800 bg-slate-950/50 p-4 flex flex-col">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Radio size={12} className="text-indigo-500 animate-pulse" /> Live Tape
            </h3>
            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
               {transactions.map(txn => (
                  <div key={txn.id} className="p-2 bg-slate-900/50 border border-slate-800 rounded-lg flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                     <div className="min-w-0">
                        <p className="text-[9px] font-black text-indigo-400 font-mono italic truncate">{txn.id}</p>
                        <p className="text-[10px] font-bold text-white truncate">{txn.customerName}</p>
                     </div>
                     <div className="text-right shrink-0">
                        <p className="text-[10px] font-black text-white">{txn.amount.toLocaleString()}</p>
                        <p className="text-[8px] font-bold text-green-500">AUTH</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );

  const AlertsHub = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
       {incidents.map(inc => (
          <div key={inc.id} className={`bg-white dark:bg-slate-900 border ${inc.severity === 'CRITICAL' ? 'border-red-500 shadow-md' : 'border-slate-200 dark:border-slate-800'} p-5 rounded-xl`}>
             <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest ${inc.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-700'}`}>
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
                  onClick={() => handleAckIncident(inc.id)}
                  className="flex-1 py-2 bg-slate-900 dark:bg-slate-800 text-white text-[9px] font-black uppercase rounded-lg hover:bg-black transition-colors"
                >
                  Ack
                </button>
                <button 
                  onClick={() => handleEscalateIncident(inc.id)}
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
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No active incidents detected. All systems nominal.</p>
         </div>
       )}
    </div>
  );

  const ExecutiveReports = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-500">
       {['Q4 Financials', 'Compliance Audit', 'Operational SLA', 'Risk Exposure'].map(report => (
          <div key={report} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center">
             <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Download size={20} />
             </div>
             <h3 className="text-xs font-black uppercase italic mb-1">{report}</h3>
             <p className="text-[9px] text-slate-400 font-bold mb-4">OCT 15 • PDF</p>
             <button className="w-full py-2 bg-slate-950 text-white text-[9px] font-black uppercase rounded-lg">Download</button>
          </div>
       ))}
    </div>
  );

  return (
    <div className="relative min-h-[80vh]">
      {showToast && (
        <div className="fixed top-20 right-8 z-[200] bg-slate-950 border border-indigo-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right backdrop-blur-md">
           <Zap size={14} className="text-indigo-400 fill-indigo-400 animate-pulse" />
           <p className="text-[10px] font-black uppercase tracking-widest">{showToast}</p>
        </div>
      )}

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
             <span className="flex items-center gap-1"><MapPin size={10}/> Alpha-01</span>
             <span className="flex items-center gap-1"><Cpu size={10}/> Load: 14%</span>
          </div>
        </div>

        <div className="flex gap-2">
           <button onClick={handleManualRefresh} disabled={isRefreshing} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase rounded-xl">
              <History size={12} className={isRefreshing ? 'animate-spin' : ''} /> Sync
           </button>
           <button className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase rounded-xl">
              <ShieldCheck size={12} /> Secure
           </button>
        </div>
      </div>

      <div className="relative">
         {currentView === 'COMMAND_GLOBAL_OVERVIEW' && <GlobalOverview />}
         {currentView === 'COMMAND_LIVE_MAP' && <LiveMap />}
         {currentView === 'COMMAND_ALERTS' && <AlertsHub />}
         {currentView === 'COMMAND_EXECUTIVE_REPORTS' && <ExecutiveReports />}
         {!currentView.startsWith('COMMAND_') && <GlobalOverview />}
      </div>
    </div>
  );
};

export default DashboardView;

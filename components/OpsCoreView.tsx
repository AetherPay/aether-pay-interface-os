
import React, { useState } from 'react';
import { mockLiquidityPools, mockRailStatus } from '../services/mockData';
import { Rail, ViewState } from '../types';
import { Activity, AlertTriangle, ArrowRightLeft, DollarSign, PauseCircle, PlayCircle, RefreshCw, Server, TrendingDown, TrendingUp, XCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface OpsCoreViewProps {
  setView: (view: ViewState) => void;
}

const OpsCoreView: React.FC<OpsCoreViewProps> = ({ setView }) => {
  const [rails, setRails] = useState<Rail[]>(mockRailStatus);
  const [liquidityPools, setLiquidityPools] = useState(mockLiquidityPools);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showMismatch, setShowMismatch] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const sparkData = [
    { v: 120 }, { v: 130 }, { v: 125 }, { v: 400 }, { v: 800 }, { v: 200 }, { v: 120 }
  ];

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const handleToggleRailStatus = (id: string) => {
    setRails(prevRails =>
      prevRails.map(rail => {
        if (rail.id === id) {
          const newStatus = rail.status === 'UP' || rail.status === 'DEGRADED' ? 'MAINTENANCE' : 'UP';
          showToast(`Rail ${rail.name} status set to ${newStatus}.`);
          return { ...rail, status: newStatus };
        }
        return rail;
      })
    );
  };
  
  const handleRefreshStats = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLiquidityPools(prev => prev.map(p => ({ ...p, amount: p.amount * (1 + (Math.random() - 0.5) * 0.1) })));
      setIsRefreshing(false);
      showToast("Liquidity data refreshed.");
    }, 1500);
  };

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className="fixed top-20 right-8 z-[200] bg-slate-900 border border-indigo-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right">
           <CheckCircle2 size={18} className="text-indigo-400" />
           <p className="text-xs font-black uppercase tracking-widest">{toast}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Liquidity Operations Core</h2>
          <p className="text-slate-500 font-medium">Real-time rail monitoring, liquidity provisioning & settlement.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={handleRefreshStats} disabled={isRefreshing} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm flex items-center disabled:opacity-50">
             <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
             {isRefreshing ? 'Refreshing...' : 'Refresh Stats'}
          </button>
          <button onClick={() => setShowAddFunds(true)} className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 shadow-sm flex items-center">
             <DollarSign className="h-4 w-4 mr-2" />
             Add Funds
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-opacity ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
        {liquidityPools.map((pool, idx) => {
          const percentage = (pool.amount / pool.capacity) * 100;
          const statusColor = pool.status === 'OK' ? 'bg-indigo-600' : pool.status === 'LOW' ? 'bg-orange-500' : 'bg-red-600';

          return (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{pool.provider}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {Math.round(pool.amount).toLocaleString()} <span className="text-sm text-slate-400">{pool.currency}</span>
                  </h3>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold bg-opacity-10 ${statusColor.replace('bg-', 'text-')} ${statusColor.replace('bg-', 'bg-')}`}>
                  {pool.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-900 flex items-center">
            <Server className="h-5 w-5 mr-2 text-slate-500" />
            Active Rails Status
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {rails.map((rail) => (
            <div key={rail.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
              <div className="flex items-center w-1/4">
                <div className={`h-3 w-3 rounded-full mr-4 ${
                  rail.status === 'UP' ? 'bg-green-500 animate-pulse' : 
                  rail.status === 'DEGRADED' ? 'bg-orange-500' : 
                  rail.status === 'MAINTENANCE' ? 'bg-slate-400' : 'bg-red-600'
                }`}></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{rail.name}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">{rail.provider}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
           <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center">
                 <ArrowRightLeft className="h-5 w-5 mr-2 text-indigo-500" />
                 Settlement Reconciliation
              </h3>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Matched: 99.8%</span>
           </div>
           <div className="space-y-4">
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg flex justify-between items-center">
                 <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                    <div>
                       <p className="text-sm font-bold text-red-900">Mismatch Detected</p>
                       <p className="text-xs text-red-700">MTN Settlement Batch 9921 • Gap: 15,000 XOF</p>
                    </div>
                 </div>
                 <button onClick={() => setShowMismatch(true)} className="text-xs bg-white border border-red-300 text-red-700 px-3 py-1.5 rounded font-medium hover:bg-red-50">
                    Investigate
                 </button>
              </div>
           </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-center items-center text-center">
           <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <DollarSign className="h-6 w-6 text-slate-400" />
           </div>
           <h3 className="text-slate-900 font-medium">Payouts Queue</h3>
           <p className="text-sm text-slate-500 mt-1">12 Payouts waiting for approval</p>
           <button onClick={() => setView('PROTOCOL_MAKER_CHECKER')} className="mt-4 text-indigo-600 text-sm font-medium hover:underline">View Signatory Queue</button>
        </div>
      </div>
    </div>
  );
};

export default OpsCoreView;


import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, LineChart, Line, BarChart, Bar, Legend 
} from 'recharts';
import { 
  Landmark, Zap, Wallet, Coins, RefreshCw, Layers, ShieldCheck, 
  Plus, AlertTriangle, Calendar, ArrowUpCircle, ArrowDownCircle, 
  TrendingUp, DollarSign, Search, CheckCircle2, History,
  ArrowRightLeft, FileText, ChevronRight, Scale, Clock, ArrowRight,
  TrendingDown, Sliders
} from 'lucide-react';
import { 
  mockLiquidityPools, mockForecastData, mockSettlementQueue, 
  mockReconciliationPairs, mockTreasuryStats, mockFxRates 
} from '../services/mockData';
import { ViewState, FXRate } from '../types';

interface TreasuryViewProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const TreasuryView: React.FC<TreasuryViewProps> = ({ currentView, setView }) => {
  const [toast, setToast] = useState<string | null>(null);
  const [settlements, setSettlements] = useState(mockSettlementQueue);
  const [rates, setRates] = useState<FXRate[]>(mockFxRates);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleApproveSettlement = (id: string) => {
    setSettlements(prev => prev.filter(s => s.id !== id));
    triggerToast(`Settlement ${id} authorized for broadcast.`);
  };

  const handleSpreadChange = (pair: string, newSpread: number) => {
    setRates(prev => prev.map(r => r.pair === pair ? { ...r, spreadPct: newSpread } : r));
    triggerToast(`Spread for ${pair} adjusted to ${newSpread}%`);
  };

  const LiquidityOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockTreasuryStats.map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black italic tracking-tighter mt-1 text-slate-900 dark:text-white">{stat.value}</h3>
            <p className="text-[10px] font-bold text-indigo-500 mt-2 uppercase">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8">
           <div>
              <h3 className="text-sm font-black italic uppercase tracking-tight text-slate-900 dark:text-white">Global Liquidity Curve</h3>
              <p className="text-xs text-slate-400">Total treasury health across all digital rails.</p>
           </div>
           <div className="flex gap-2">
              <button className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded uppercase">7 Days</button>
              <button className="px-3 py-1 text-slate-400 text-[10px] font-black rounded uppercase">30 Days</button>
           </div>
        </div>
        <div className="h-[300px]">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockForecastData}>
                 <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="day" hide />
                 <YAxis hide />
                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} />
                 <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const LiquidityPools = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
       {mockLiquidityPools.map(pool => (
          <div key={pool.provider} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
             <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-black text-indigo-600">{pool.provider}</div>
                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${pool.status === 'OK' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{pool.status}</div>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Balance</p>
             <h3 className="text-2xl font-black italic tracking-tighter mt-1 text-slate-900 dark:text-white">{pool.amount.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{pool.currency}</span></h3>
             <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${(pool.amount/pool.capacity)*100}%` }}></div>
             </div>
             <div className="grid grid-cols-2 gap-2 mt-8">
                <button onClick={() => triggerToast(`Minting protocol initiated for ${pool.currency}`)} className="flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg hover:bg-indigo-700 transition-all"><ArrowUpCircle size={14}/> Mint</button>
                <button onClick={() => triggerToast(`Burning protocol initiated for ${pool.currency}`)} className="flex items-center justify-center gap-2 py-2.5 bg-slate-900 dark:bg-slate-800 text-white text-[9px] font-black uppercase rounded-lg hover:bg-black transition-all"><ArrowDownCircle size={14}/> Burn</button>
             </div>
          </div>
       ))}
    </div>
  );

  const FXTerminal = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
             <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950">
                <h3 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   <RefreshCw size={14} className="text-indigo-500" /> Live FX Core Dispatch
                </h3>
                <span className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest italic">
                   <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span> Rates Live
                </span>
             </div>
             <table className="w-full text-left">
                <thead>
                   <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                      <th className="px-8 py-4">Currency Pair</th>
                      <th className="px-8 py-4">Mid Rate</th>
                      <th className="px-8 py-4">Current Spread</th>
                      <th className="px-8 py-4 text-right">Aether Rate</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                   {rates.map(r => (
                      <tr key={r.pair} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group">
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-[10px] font-black text-white italic">
                                  {r.pair.split('/')[0]}
                               </div>
                               <div>
                                  <p className="text-sm font-black italic tracking-tighter uppercase">{r.pair}</p>
                                  <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest">{r.lastUpdate}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                            {r.midRate.toFixed(2)}
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex flex-col gap-2 w-32">
                               <div className="flex justify-between items-center text-[10px] font-black text-indigo-500">
                                  <span>{r.spreadPct}%</span>
                                  <Sliders size={10} />
                               </div>
                               <input 
                                  type="range" 
                                  min="0" 
                                  max="10" 
                                  step="0.1" 
                                  value={r.spreadPct}
                                  onChange={(e) => handleSpreadChange(r.pair, parseFloat(e.target.value))}
                                  className="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                               />
                            </div>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <div className="flex flex-col items-end">
                               <p className="text-base font-black italic tracking-tighter text-indigo-600 dark:text-indigo-400">
                                  {(r.midRate * (1 + r.spreadPct/100)).toFixed(2)}
                               </p>
                               <span className={`flex items-center gap-1 text-[9px] font-black ${r.trend === 'UP' ? 'text-green-500' : r.trend === 'DOWN' ? 'text-red-500' : 'text-slate-400'}`}>
                                  {r.trend === 'UP' ? <TrendingUp size={10}/> : r.trend === 'DOWN' ? <TrendingDown size={10}/> : <Clock size={10}/>} {r.trend}
                               </span>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>

          <div className="lg:col-span-1 space-y-6">
             <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                   <ArrowRightLeft size={100} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                   <Zap size={14} className="text-indigo-200 fill-indigo-200" /> FX Strategy Core
                </h3>
                <p className="text-xl font-black italic tracking-tighter leading-tight mb-8">
                   "Market volatility in NGN pair is high. Automatic spread adjustment (HFT) recommended to mitigate arbitrage risk."
                </p>
                <button onClick={() => triggerToast("Launching HFT FX Optimizer...")} className="w-full py-4 bg-white text-indigo-600 text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-700/20">
                   Execute Optimization <ChevronRight size={14} />
                </button>
             </div>

             <div className="bg-slate-950 rounded-3xl p-8 text-white border border-slate-800 shadow-2xl">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Currency Exposure</h3>
                <div className="space-y-6">
                   {[
                      { pair: 'XOF Pool', exposure: '45.2M', risk: 'LOW', color: 'bg-green-500' },
                      { pair: 'USD Reserve', exposure: '1.2M', risk: 'MODERATE', color: 'bg-amber-500' },
                      { pair: 'NGN Payouts', exposure: '840k', risk: 'HIGH', color: 'bg-red-500' }
                   ].map(ex => (
                      <div key={ex.pair} className="flex justify-between items-center pb-6 border-b border-slate-800 last:border-0 last:pb-0">
                         <div>
                            <p className="text-xs font-black italic uppercase tracking-tighter">{ex.pair}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Total Liability</p>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-black italic">{ex.exposure}</p>
                            <div className="flex items-center gap-1.5 justify-end mt-1">
                               <div className={`h-1.5 w-1.5 rounded-full ${ex.color}`}></div>
                               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{ex.risk}</span>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const SettlementQueue = () => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-500">
       <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <History size={12} className="text-indigo-500" /> Pending Merchant Payouts
          </h3>
          <button onClick={() => triggerToast("Bulk broadcasting initiated...")} className="px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg">Broadcast All</button>
       </div>
       <table className="w-full text-left">
          <thead className="bg-white dark:bg-slate-900">
             <tr className="text-[9px] font-black text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Beneficiary</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-center">Bank Node</th>
                <th className="px-6 py-4 text-right">Actions</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
             {settlements.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                   <td className="px-6 py-4 font-mono text-[10px] text-indigo-500">{s.id}</td>
                   <td className="px-6 py-4 font-bold text-xs text-slate-900 dark:text-slate-200">{s.merchant}</td>
                   <td className="px-6 py-4 text-xs font-black text-slate-900 dark:text-slate-200">{s.amount.toLocaleString()} {s.currency}</td>
                   <td className="px-6 py-4 text-center"><span className="text-[10px] font-black uppercase text-slate-400">{s.bank}</span></td>
                   <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                         <button onClick={() => handleApproveSettlement(s.id)} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><ShieldCheck size={16}/></button>
                         <button onClick={() => triggerToast(`Settlement ${s.id} held for verification.`)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><AlertTriangle size={16}/></button>
                      </div>
                   </td>
                </tr>
             ))}
          </tbody>
       </table>
    </div>
  );

  const ReconciliationHub = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><ArrowRightLeft size={100}/></div>
             <h3 className="text-xl font-black italic uppercase tracking-tight mb-4">Bank Statement Sync</h3>
             <p className="text-xs text-slate-500 mb-8">Matching MT940/CAMT files against internal ledger nodes.</p>
             <button onClick={() => triggerToast("Ingesting bank feeds...")} className="w-full py-4 bg-white text-slate-950 text-[10px] font-black uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all shadow-xl shadow-indigo-500/10"><RefreshCw size={14}/> Trigger Manual Match</button>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-center items-center text-center">
             <div className="h-14 w-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl flex items-center justify-center mb-4"><Scale size={24}/></div>
             <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">Matching Integrity: 99.4%</h3>
             <p className="text-xs text-slate-400 max-w-xs mt-1">2 transactions require manual reconciliation in the West African cluster.</p>
          </div>
       </div>

       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
             <thead className="bg-slate-50 dark:bg-slate-950"><tr className="text-[9px] font-black text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800"><th className="px-6 py-4">ID</th><th className="px-6 py-4">Bank Ref</th><th className="px-6 py-4">Aether Ref</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Match</th></tr></thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockReconciliationPairs.map(p => (
                   <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4 font-mono text-[9px] text-slate-400">{p.id}</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300">{p.bankRef}</td>
                      <td className="px-6 py-4 text-xs font-bold text-indigo-500">{p.ledgerRef}</td>
                      <td className="px-6 py-4 text-xs font-black">{p.amount.toLocaleString()} XOF</td>
                      <td className="px-6 py-4">
                         <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${p.status === 'MATCHED' ? 'bg-green-50 text-green-600' : p.status === 'MISMATCH' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>{p.status}</span>
                         {p.diff && <span className="ml-2 text-[8px] font-mono text-red-400">{p.diff} XOF</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button onClick={() => triggerToast("Manual pairing authorized.")} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-all"><CheckCircle2 size={16}/></button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  const ForecastView = () => (
    <div className="space-y-6 animate-in zoom-in-95 duration-500">
       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
             <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">Cash Flow Projections</h3>
                <p className="text-xs text-slate-400">Projected inflows vs outflows for the West African cluster.</p>
             </div>
             <div className="flex gap-4">
                <div className="flex items-center gap-2">
                   <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Inflow</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Outflow</span>
                </div>
             </div>
          </div>
          <div className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockForecastData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                   <YAxis hide />
                   <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                   <Bar dataKey="inflow" fill="#22c55e" radius={[4, 4, 0, 0]} />
                   <Bar dataKey="outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20">
             <div className="flex items-center gap-3 mb-6">
                <Zap size={20} className="text-indigo-200 fill-indigo-200" />
                <h3 className="text-xs font-black uppercase tracking-widest">Cortex AI Recommendation</h3>
             </div>
             <p className="text-lg font-black italic tracking-tight leading-snug mb-6">"Probability of XOF liquidity shortage in MTN pool within 48h is 84%. Advise minting 150M XOF from reserve."</p>
             <button onClick={() => triggerToast("Executing AI-Optimized Minting...")} className="w-full py-3 bg-white text-indigo-600 text-[10px] font-black uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all">Execute Advice <ChevronRight size={14}/></button>
          </div>
          <div className="bg-slate-950 rounded-2xl p-6 text-white border border-slate-800">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Reserve Health Node</h3>
             <div className="space-y-6">
                {[
                   { label: 'Stable Reserve', val: '92%', status: 'NOMINAL' },
                   { label: 'Market Volatility', val: 'Moderate', status: 'STABLE' },
                   { label: 'Stress Capacity', val: '14.5x', status: 'OPTIMAL' }
                ].map(item => (
                   <div key={item.label} className="flex justify-between items-center border-b border-slate-800 pb-4">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.label}</span>
                      <div className="text-right">
                         <p className="text-sm font-black italic">{item.val}</p>
                         <p className="text-[8px] font-black text-indigo-400">{item.status}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="relative min-h-[80vh]">
      {toast && (
        <div className="fixed top-20 right-8 z-[200] bg-slate-950 border border-indigo-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right backdrop-blur-md">
           <Landmark size={14} className="text-indigo-400 animate-pulse" />
           <p className="text-[10px] font-black uppercase tracking-widest">{toast}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-amber-600 rounded-xl shadow-lg shadow-amber-500/20">
                <Landmark className="text-white h-4 w-4" />
             </div>
             <h1 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase leading-none">
                Treasury<span className="text-amber-600">.Vault</span>
             </h1>
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">AetherBridge Core • Liquidity Rails Status: NOMINAL</p>
        </div>
      </div>

      <div className="relative">
         {currentView === 'TREASURY_OVERVIEW' && <LiquidityOverview />}
         {currentView === 'TREASURY_POOLS' && <LiquidityPools />}
         {currentView === 'TREASURY_FX' && <FXTerminal />}
         {currentView === 'TREASURY_FORECAST' && <ForecastView />}
         {currentView === 'TREASURY_SETTLEMENT' && <SettlementQueue />}
         {currentView === 'TREASURY_RECONCILIATION' && <ReconciliationHub />}
      </div>
    </div>
  );
};

export default TreasuryView;

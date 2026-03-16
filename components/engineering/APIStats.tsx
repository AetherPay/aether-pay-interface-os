import React from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Activity, ShieldCheck, Globe } from 'lucide-react';
import { chartData } from '../../services/mockData';

const APIStats: React.FC = () => (
  <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[40px] shadow-sm h-[400px] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global API Latency (p95)</h3>
            <p className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white">142ms <span className="text-xs text-green-500 font-normal ml-2">NOMINAL</span></p>
          </div>
          <div className="flex gap-1">
            <button className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded uppercase">Live</button>
            <button className="px-2 py-0.5 text-slate-400 text-[9px] font-black rounded uppercase">24h</button>
          </div>
        </div>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '9px', fontWeight: 'bold' }} />
              <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorLat)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="lg:col-span-4 space-y-4">
        {[
          { label: 'Total RPM', value: '4.5k', status: 'HEALTHY', icon: Activity, color: 'text-indigo-400' },
          { label: 'Error Rate', value: '0.02%', status: 'NOMINAL', icon: ShieldCheck, color: 'text-green-400' },
          { label: 'Active Endpoints', value: '14', status: 'READY', icon: Globe, color: 'text-indigo-400' }
        ].map(stat => (
          <div key={stat.label} className="bg-slate-950 p-6 rounded-[32px] border border-slate-800 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform"><stat.icon size={60}/></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2"><stat.icon size={12} className={stat.color} /> {stat.label}</p>
            <div className="flex justify-between items-end">
              <h3 className="text-2xl font-black italic tracking-tighter">{stat.value}</h3>
              <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${stat.color.replace('text-', 'text-').replace('text-', 'border-')}`}>{stat.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default APIStats;

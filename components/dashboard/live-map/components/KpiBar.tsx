import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Gateway } from '../types';
import { getStatus } from '../utils';
interface KpiBarProps { gateways: Gateway[]; isLive?: boolean; }
const KpiBar: React.FC<KpiBarProps> = ({ gateways, isLive = false }) => {
  const up       = gateways.filter(g => getStatus(g.currentRtt) === 'UP').length;
  const degraded = gateways.filter(g => getStatus(g.currentRtt) === 'DEGRADED').length;
  const avgRtt   = Math.round(gateways.reduce((s, g) => s + g.currentRtt, 0) / gateways.length);
  const kpis = [
    { icon: <Activity size={14} />,      label: 'Passerelles',     value: gateways.length, color: 'text-slate-300',   border: 'border-slate-800'     },
    { icon: <CheckCircle2 size={14} />,  label: 'Opérationnelles', value: up,              color: 'text-emerald-400', border: 'border-emerald-900/40' },
    { icon: <AlertTriangle size={14} />, label: 'Dégradées',       value: degraded,        color: 'text-amber-400',   border: 'border-amber-900/40'   },
    { icon: <XCircle size={14} />,       label: 'RTT Moyen',       value: `${avgRtt}ms`,   color: 'text-indigo-400',  border: 'border-indigo-900/40'  },
  ];
  return (
    <div className="space-y-3">
    <div className="flex items-center justify-end">
      {isLive ? (
        <span className="flex items-center gap-1.5 text-[8px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-900/40 px-2.5 py-1 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Données réelles · API backend
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-[8px] font-black uppercase text-amber-400 bg-amber-500/10 border border-amber-900/40 px-2.5 py-1 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Simulation · Backend indisponible
        </span>
      )}
    </div>
    <div className="grid grid-cols-4 gap-4">
      {kpis.map(k => (
        <div key={k.label} className={`bg-slate-950 border ${k.border} rounded-2xl p-4`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{k.label}</p>
            <span className={`${k.color} opacity-60`}>{k.icon}</span>
          </div>
          <p className={`text-3xl font-black tracking-tighter font-mono ${k.color}`}>{k.value}</p>
        </div>
      ))}
    </div>
    </div>
  );
};
export default KpiBar;

import React from 'react';
import { X, Wifi } from 'lucide-react';
import { Gateway } from '../types';
import { getStatus, getRttColor } from '../utils';
import { PROVIDER_META, STATUS_META } from '../constants';
import Sparkline from './Sparkline';
interface DetailPanelProps { gateway: Gateway | null; onClose: () => void; }
const DetailPanel: React.FC<DetailPanelProps> = ({ gateway, onClose }) => {
  if (!gateway) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center">
          <Wifi size={22} className="text-slate-600" />
        </div>
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Cliquez sur un nœud</p>
        <p className="text-[9px] text-slate-700">pour voir les statistiques de santé</p>
      </div>
    );
  }
  const status   = getStatus(gateway.currentRtt);
  const rttColor = getRttColor(gateway.currentRtt);
  const provMeta = PROVIDER_META[gateway.provider];
  const statMeta = STATUS_META[status];
  return (
    <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded" style={{ backgroundColor: `${provMeta.color}22`, color: provMeta.color }}>
            {provMeta.label}
          </span>
          <p className="text-xs font-black text-white mt-1.5 uppercase tracking-tight">{gateway.location}</p>
        </div>
        <button onClick={onClose} className="p-1 text-slate-600 hover:text-slate-400 transition-colors"><X size={14} /></button>
      </div>
      <div className="bg-slate-900 rounded-2xl p-4 text-center">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Latence RTT</p>
        <p className="text-4xl font-black tracking-tighter font-mono" style={{ color: rttColor }}>
          {gateway.currentRtt}<span className="text-lg">ms</span>
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: statMeta.color }} />
          <span className="text-[8px] font-black uppercase" style={{ color: statMeta.color }}>{statMeta.label}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Uptime',       value: `${gateway.uptime}%`,      color: 'text-emerald-400' },
          { label: 'Taux succès',  value: `${gateway.successRate}%`, color: 'text-indigo-400'  },
          { label: 'Latence base', value: `${gateway.baseRtt}ms`,    color: 'text-slate-300'   },
          { label: 'Provider',     value: provMeta.label,            color: 'text-slate-400'   },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 rounded-xl p-3">
            <p className="text-[8px] font-black text-slate-600 uppercase mb-1">{s.label}</p>
            <p className={`text-xs font-black ${s.color} truncate`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-slate-900 rounded-2xl p-3">
        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Historique RTT (24 pts)</p>
        <Sparkline data={gateway.history} color={rttColor} />
        <div className="flex justify-between mt-1">
          <span className="text-[7px] font-mono text-slate-600">min {Math.min(...gateway.history)}ms</span>
          <span className="text-[7px] font-mono text-slate-600">max {Math.max(...gateway.history)}ms</span>
        </div>
      </div>
      <p className="text-[8px] font-mono text-slate-700 text-center">{gateway.id}</p>
    </div>
  );
};
export default DetailPanel;

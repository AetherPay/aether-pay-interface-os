import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { HubNodeType } from '../types';

const HubNode: React.FC<NodeProps<HubNodeType>> = ({ data }) => {
  const { upCount, degradedCount, downCount, total } = data;
  return (
    <>
      <Handle type="target" position={Position.Left}   style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Right}  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Top}    style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
      <div className="w-52 rounded-2xl border-2 border-indigo-500/50 bg-slate-950 shadow-2xl shadow-indigo-500/15 overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600" />
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/40 shrink-0">
              <Zap size={15} className="text-white fill-white" />
            </div>
            <div>
              <p className="text-[11px] font-black text-white uppercase tracking-wider leading-tight">AetherPay</p>
              <p className="text-[8px] text-indigo-400 font-bold uppercase tracking-widest">Gateway Hub</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {[
              { label: 'UP',   value: upCount,       color: '#10b981', bg: 'bg-emerald-500/10 border-emerald-900/50' },
              { label: 'DEG',  value: degradedCount, color: '#f59e0b', bg: 'bg-amber-500/10 border-amber-900/50'   },
              { label: 'DOWN', value: downCount,      color: '#ef4444', bg: 'bg-rose-500/10 border-rose-900/50'    },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border rounded-lg p-2 text-center`}>
                <p className="text-xl font-black leading-none" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[7px] font-black text-slate-600 mt-0.5 uppercase">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-[7px] text-slate-700 font-mono">{total} passerelles actives</p>
        </div>
      </div>
    </>
  );
};

export default HubNode;

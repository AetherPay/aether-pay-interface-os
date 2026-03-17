import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { GatewayNodeType } from '../types';
import { getStatus, getRttColor } from '../utils';
import { PROVIDER_META, STATUS_META } from '../constants';

const GatewayNode: React.FC<NodeProps<GatewayNodeType>> = ({ data }) => {
  const { gateway, isSelected } = data;
  const { provider, providerLabel, location, currentRtt, uptime } = gateway;

  const status   = getStatus(currentRtt);
  const rttColor = getRttColor(currentRtt);
  const provMeta = PROVIDER_META[provider];
  const statMeta = STATUS_META[status];

  return (
    <>
      <Handle type="source" position={Position.Right} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Right} style={{ opacity: 0, pointerEvents: 'none' }} />

      <div
        className={`
          relative w-44 rounded-xl border bg-slate-950 overflow-hidden
          transition-all duration-200 cursor-pointer select-none
          ${isSelected
            ? 'border-indigo-500 shadow-xl shadow-indigo-500/25'
            : 'border-slate-800 hover:border-slate-600 hover:shadow-lg hover:shadow-black/40'
          }
        `}
      >
        <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: provMeta.color }} />
        <div className="pl-3.5 pr-3 py-2.5">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] font-black uppercase tracking-wider truncate" style={{ color: provMeta.color }}>
              {providerLabel}
            </span>
            <span className="flex items-center gap-1 shrink-0 ml-1" style={{ color: statMeta.color }}>
              <span className={`w-1.5 h-1.5 rounded-full ${status === 'UP' ? 'animate-pulse' : ''}`} style={{ backgroundColor: statMeta.color }} />
              <span className="text-[8px] font-black uppercase">{statMeta.label}</span>
            </span>
          </div>
          <p className="text-[8px] text-slate-500 mb-2 truncate">{location}</p>
          <div className="flex items-end justify-between">
            <p className="font-black font-mono leading-none" style={{ color: rttColor }}>
              <span className="text-2xl">{currentRtt}</span>
              <span className="text-[10px] ml-0.5">ms</span>
            </p>
            <span className="text-[8px] font-mono text-slate-500">{uptime}%</span>
          </div>
          <div className="mt-2 h-[2px] bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${uptime}%`, backgroundColor: provMeta.color }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default GatewayNode;

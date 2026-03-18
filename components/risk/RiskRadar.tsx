import React from 'react';
import { BrainCircuit, Construction } from 'lucide-react';

const RiskRadar: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-32 gap-6 animate-in fade-in">
    <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl">
      <BrainCircuit className="w-10 h-10 text-red-500" />
    </div>
    <div className="text-center space-y-2">
      <p className="text-sm font-black text-white uppercase tracking-widest">Risk Radar · IA Cortex</p>
      <p className="text-[10px] font-bold text-slate-500 max-w-sm">
        Scoring de risque par Machine Learning, jauges de menace par région, et détection de fraude en temps réel.
      </p>
    </div>
    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl">
      <Construction size={12} className="text-amber-400" />
      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">En construction · Cortex ML</span>
    </div>
  </div>
);

export default RiskRadar;

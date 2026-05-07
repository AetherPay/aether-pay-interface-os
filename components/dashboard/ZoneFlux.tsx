import React, { useMemo, useState, useEffect } from 'react';
import { ResponsiveSankey } from '@nivo/sankey';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { dashboardApi } from '../../services/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Corridor {
  id: string;
  label: string;
  color: string;
  volume: number;
  feeRate: number;
  marginRate: number;
}

// ─── Static fallback data ──────────────────────────────────────────────────────

const FALLBACK_CORRIDORS: Corridor[] = [
  { id: 'card',         label: 'Stripe · Card',  color: '#6366f1', volume: 45200, feeRate: 0.029, marginRate: 0.002 },
  { id: 'mtn_money',    label: 'MTN MoMo',       color: '#f59e0b', volume: 12800, feeRate: 0.015, marginRate: 0.005 },
  { id: 'orange_money', label: 'Orange Money',   color: '#f97316', volume:  8400, feeRate: 0.015, marginRate: 0.005 },
  { id: 'wave',         label: 'Wave',           color: '#10b981', volume:  6200, feeRate: 0.010, marginRate: 0.003 },
  { id: 'usdc',         label: 'USDC · Circle',  color: '#3b82f6', volume:  3800, feeRate: 0.010, marginRate: 0.003 },
];

const METHOD_META: Record<string, { label: string; color: string }> = {
  card:         { label: 'Stripe · Card',  color: '#6366f1' },
  mtn_money:    { label: 'MTN MoMo',       color: '#f59e0b' },
  orange_money: { label: 'Orange Money',   color: '#f97316' },
  wave:         { label: 'Wave',           color: '#10b981' },
  usdc:         { label: 'USDC · Circle',  color: '#3b82f6' },
};

const fmt = (v: number): string =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M`
  : v >= 1_000   ? `${(v / 1_000).toFixed(1)}k`
  : v.toFixed(0);

// ─── Build Nivo Sankey data ────────────────────────────────────────────────────

function buildSankeyData(corridors: Corridor[]) {
  const nodes = [
    ...corridors.map(c => ({ id: c.id, label: c.label, nodeColor: c.color })),
    { id: 'merchant', label: 'Net Marchand',    nodeColor: '#10b981' },
    { id: 'fees',     label: 'Frais Réseau',     nodeColor: '#ef4444' },
    { id: 'margin',   label: 'Marge AetherPay',  nodeColor: '#6366f1' },
  ];

  const links: { source: string; target: string; value: number }[] = [];
  corridors.forEach(c => {
    links.push({ source: c.id, target: 'merchant', value: Math.round(c.volume * (1 - c.feeRate - c.marginRate)) });
    links.push({ source: c.id, target: 'fees',     value: Math.round(c.volume * c.feeRate) });
    links.push({ source: c.id, target: 'margin',   value: Math.round(c.volume * c.marginRate) });
  });

  return { nodes, links };
}

// ─── Component ─────────────────────────────────────────────────────────────────

const ZoneFlux: React.FC = () => {
  const [corridors, setCorridors] = useState<Corridor[]>(FALLBACK_CORRIDORS);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    dashboardApi.getFlux()
      .then(data => {
        if (!data || data.length === 0) return;
        const live: Corridor[] = data.map((d: any) => {
          const meta = METHOD_META[d.method] ?? { label: d.method, color: '#6366f1' };
          return {
            id: d.method,
            label: meta.label,
            color: meta.color,
            volume: d.volume,
            feeRate: d.feeRate,
            marginRate: d.marginRate,
          };
        }).filter((c: Corridor) => c.volume > 0);
        if (live.length > 0) { setCorridors(live); setIsLive(true); }
      })
      .catch(() => { /* fallback déjà en place */ });
  }, []);

  const sankeyData = useMemo(() => buildSankeyData(corridors), [corridors]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkTooltip = ({ link }: any) => {
    const src = link.source as { id: string; label: string };
    const tgt = link.target as { id: string; label: string };
    const corridor = corridors.find(c => c.id === src.id);
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl text-[8px] min-w-[180px]">
        <p className="font-black text-white uppercase mb-2">
          {src.label} <span className="text-slate-500">→</span> {tgt.label}
        </p>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Montant</span>
            <span className="font-black text-white font-mono">€{fmt(link.value)}</span>
          </div>
          {corridor && tgt.id === 'fees' && (
            <div className="flex justify-between">
              <span className="text-slate-500">Commission</span>
              <span className={`font-black ${corridor.feeRate >= 0.02 ? 'text-amber-400' : 'text-slate-300'}`}>
                {(corridor.feeRate * 100).toFixed(1)}%
              </span>
            </div>
          )}
          {corridor && tgt.id === 'margin' && (
            <div className="flex justify-between">
              <span className="text-slate-500">Marge</span>
              <span className="font-black text-indigo-400">{(corridor.marginRate * 100).toFixed(1)}%</span>
            </div>
          )}
          {corridor && tgt.id === 'merchant' && (
            <div className="flex justify-between">
              <span className="text-slate-500">Efficacité</span>
              <span className="font-black text-emerald-400">
                {((1 - corridor.feeRate - corridor.marginRate) * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const totalVol    = corridors.reduce((s, c) => s + c.volume, 0);
  const totalFees   = corridors.reduce((s, c) => s + c.volume * c.feeRate, 0);
  const totalMargin = corridors.reduce((s, c) => s + c.volume * c.marginRate, 0);
  const totalNet    = totalVol - totalFees - totalMargin;

  const problemCorridors = corridors.filter(c => c.feeRate >= 0.02);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Volume Total',    value: `€${fmt(totalVol)}`,    icon: <DollarSign size={14} />,   color: 'text-slate-300',   border: 'border-slate-800',      glyph: '' },
          { label: 'Net Marchands',   value: `€${fmt(totalNet)}`,    icon: <TrendingUp size={14} />,   color: 'text-emerald-400', border: 'border-emerald-900/40', glyph: `${((totalNet / totalVol) * 100).toFixed(1)}%` },
          { label: 'Frais Réseau',    value: `€${fmt(totalFees)}`,   icon: <TrendingDown size={14} />, color: 'text-rose-400',    border: 'border-rose-900/40',    glyph: `${((totalFees / totalVol) * 100).toFixed(1)}%` },
          { label: 'Marge AetherPay', value: `€${fmt(totalMargin)}`, icon: <TrendingUp size={14} />,   color: 'text-indigo-400',  border: 'border-indigo-900/40',  glyph: `${((totalMargin / totalVol) * 100).toFixed(1)}%` },
        ].map((s) => (
          <div key={s.label} className={`bg-slate-950 border ${s.border} rounded-2xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
              <span className={`${s.color} opacity-60`}>{s.icon}</span>
            </div>
            <p className={`text-3xl font-black tracking-tighter ${s.color} font-mono`}>{s.value}</p>
            {s.glyph && <p className="text-[8px] font-black text-slate-600 mt-1">{s.glyph} du volume</p>}
          </div>
        ))}
      </div>

      {/* Sankey diagram */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Répartition de la valeur · Zone Flux</p>
            <p className="text-[8px] text-slate-700 mt-0.5">Survolez un flux pour voir le détail des commissions</p>
          </div>
          <div className="flex items-center gap-3">
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
          {problemCorridors.length > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                <AlertTriangle size={10} className="text-amber-400" />
                <span className="text-[8px] font-black text-amber-400 uppercase">
                  {problemCorridors.map(c => c.label).join(', ')} · frais élevés
                </span>
              </div>
            )}
          </div>
        </div>

        <div style={{ height: 420 }} className="px-4 pb-5">
          <ResponsiveSankey
            data={sankeyData}
            margin={{ top: 10, right: 160, bottom: 10, left: 160 }}
            align="justify"
            colors={node => (node as unknown as { nodeColor: string }).nodeColor}
            nodeOpacity={1}
            nodeThickness={18}
            nodeInnerPadding={3}
            nodeSpacing={24}
            nodeBorderWidth={0}
            nodeBorderRadius={3}
            linkOpacity={0.35}
            linkHoverOpacity={0.7}
            linkBlendMode="normal"
            enableLinkGradient
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={14}
            labelTextColor={{ from: 'color', modifiers: [['brighter', 1]] }}
            linkTooltip={linkTooltip}
            theme={{
              text: { fill: '#64748b', fontSize: 9, fontWeight: 700 },
            }}
          />
        </div>
      </div>

      {/* Corridor efficiency table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Analyse d'efficacité par corridor</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-900">
              {['Corridor', 'Volume', 'Frais Provider', 'Marge AetherPay', 'Net Marchand', 'Efficacité'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-[8px] font-black text-slate-600 uppercase tracking-wider text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {corridors.map((c) => {
              const fees      = c.volume * c.feeRate;
              const margin    = c.volume * c.marginRate;
              const net       = c.volume - fees - margin;
              const eff       = net / c.volume;
              const isProblem = c.feeRate >= 0.02;
              return (
                <tr key={c.id} className="border-b border-slate-900/40 hover:bg-slate-900/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-[9px] font-black" style={{ color: c.color }}>{c.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[9px] font-mono text-slate-300">€{fmt(c.volume)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[9px] font-black ${isProblem ? 'text-amber-400' : 'text-slate-400'}`}>
                      €{fmt(fees)}{' '}
                      <span className={`${isProblem ? 'bg-amber-500/15 text-amber-400' : 'text-slate-600'} px-1 py-0.5 rounded text-[8px]`}>
                        {(c.feeRate * 100).toFixed(1)}%
                      </span>
                      {isProblem && <AlertTriangle size={9} className="inline ml-1 text-amber-400" />}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[9px] text-indigo-400 font-mono">
                    €{fmt(margin)}{' '}
                    <span className="text-slate-600 text-[8px]">{(c.marginRate * 100).toFixed(1)}%</span>
                  </td>
                  <td className="px-4 py-3 text-[9px] text-emerald-400 font-mono">€{fmt(net)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${eff * 100}%`, backgroundColor: c.color }} />
                      </div>
                      <span className="text-[8px] font-black text-slate-400 w-10 text-right">{(eff * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ZoneFlux;

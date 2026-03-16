import React, { useState, useMemo, useRef } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Corridor {
  id: string;
  label: string;
  color: string;
  volume: number;   // EUR equivalent
  feeRate: number;  // provider fee (e.g. 0.029 = 2.9%)
  marginRate: number; // AetherPay take
}

interface SrcNode extends Corridor {
  y: number;
  h: number;
}

interface DstNode {
  id: DestId;
  label: string;
  color: string;
  val: number;
  y: number;
  h: number;
}

type DestId = 'merchant' | 'fees' | 'margin';

interface FlowSegment {
  corridorId: string;
  corridorLabel: string;
  srcColor: string;
  destId: DestId;
  destLabel: string;
  destColor: string;
  value: number;
  feeRate: number;
  marginRate: number;
  pct: number;      // % of corridor volume
  sy0: number; sy1: number;
  dy0: number; dy1: number;
}

// ─── Static data ───────────────────────────────────────────────────────────────

const CORRIDORS: Corridor[] = [
  { id: 'stripe',  label: 'Stripe EU',     color: '#6366f1', volume: 45200, feeRate: 0.029, marginRate: 0.002 },
  { id: 'mtn',     label: 'MTN MoMo',      color: '#f59e0b', volume: 12800, feeRate: 0.015, marginRate: 0.005 },
  { id: 'orange',  label: 'Orange Money',  color: '#f97316', volume:  8400, feeRate: 0.015, marginRate: 0.005 },
  { id: 'wave',    label: 'Wave',          color: '#10b981', volume:  6200, feeRate: 0.010, marginRate: 0.003 },
  { id: 'usdc',    label: 'USDC · Circle', color: '#3b82f6', volume:  3800, feeRate: 0.010, marginRate: 0.003 },
];

const DESTS: { id: DestId; label: string; color: string }[] = [
  { id: 'merchant', label: 'Net Marchand',   color: '#10b981' },
  { id: 'fees',     label: 'Frais Réseau',    color: '#ef4444' },
  { id: 'margin',   label: 'Marge AetherPay', color: '#6366f1' },
];

// ─── SVG layout constants ──────────────────────────────────────────────────────

const W = 740;
const H = 380;
const NODE_W = 18;
const CHART_H = 280;
const Y_TOP = 50;
const SRC_X = 130;   // left edge of source node
const DST_X = 592;   // left edge of dest node
const FLOW_X0 = SRC_X + NODE_W;
const FLOW_X1 = DST_X;
const SRC_LABEL_X = SRC_X - 8;
const DST_LABEL_X = DST_X + NODE_W + 8;
const GAP = 6;

// ─── Layout computation ────────────────────────────────────────────────────────

function computeLayout(corridors: Corridor[]) {
  const totalVol = corridors.reduce((s, c) => s + c.volume, 0);
  const srcScale = (CHART_H - GAP * (corridors.length - 1)) / totalVol;

  // Source nodes
  let y = Y_TOP;
  const srcNodes: SrcNode[] = corridors.map(c => {
    const h = Math.max(c.volume * srcScale, 4);
    const node: SrcNode = { ...c, y, h };
    y += h + GAP;
    return node;
  });

  // Destination values
  const destVals: Record<DestId, number> = { merchant: 0, fees: 0, margin: 0 };
  corridors.forEach(c => {
    destVals.fees     += c.volume * c.feeRate;
    destVals.margin   += c.volume * c.marginRate;
    destVals.merchant += c.volume * (1 - c.feeRate - c.marginRate);
  });

  // Destination nodes
  const dstScale = (CHART_H - GAP * 2) / totalVol;
  let dy = Y_TOP;
  const dstNodes: DstNode[] = DESTS.map(d => {
    const val = destVals[d.id];
    const h = Math.max(val * dstScale, 4);
    const node: DstNode = { ...d, val, y: dy, h };
    dy += h + GAP;
    return node;
  });

  // Flows: per destination × per corridor (order: merchant flows first, then fees, then margin)
  const srcOffsets = srcNodes.map(n => n.y);  // track used y within each source node
  const dstOffsets = dstNodes.map(n => n.y);  // track used y within each dest node

  const flows: FlowSegment[] = [];

  DESTS.forEach((dest, dIdx) => {
    corridors.forEach((c, cIdx) => {
      let val: number;
      if (dest.id === 'merchant') val = c.volume * (1 - c.feeRate - c.marginRate);
      else if (dest.id === 'fees') val = c.volume * c.feeRate;
      else val = c.volume * c.marginRate;

      const h_src = val * srcScale;
      const h_dst = val * dstScale;

      const sy0 = srcOffsets[cIdx];
      const sy1 = sy0 + h_src;
      srcOffsets[cIdx] = sy1;

      const dy0 = dstOffsets[dIdx];
      const dy1 = dy0 + h_dst;
      dstOffsets[dIdx] = dy1;

      flows.push({
        corridorId: c.id,
        corridorLabel: c.label,
        srcColor: c.color,
        destId: dest.id,
        destLabel: dest.label,
        destColor: dest.color,
        value: val,
        feeRate: c.feeRate,
        marginRate: c.marginRate,
        pct: val / c.volume,
        sy0, sy1, dy0, dy1,
      });
    });
  });

  return { srcNodes, dstNodes, destVals, flows, totalVol };
}

// ─── Path builder ──────────────────────────────────────────────────────────────

function flowPath(sy0: number, sy1: number, dy0: number, dy1: number): string {
  const cx = (FLOW_X0 + FLOW_X1) / 2;
  return (
    `M ${FLOW_X0} ${sy0} ` +
    `C ${cx} ${sy0}, ${cx} ${dy0}, ${FLOW_X1} ${dy0} ` +
    `L ${FLOW_X1} ${dy1} ` +
    `C ${cx} ${dy1}, ${cx} ${sy1}, ${FLOW_X0} ${sy1} Z`
  );
}

// ─── Formatters ────────────────────────────────────────────────────────────────

const fmt = (v: number): string =>
  v >= 1_000_000
    ? `${(v / 1_000_000).toFixed(2)}M`
    : v >= 1_000
    ? `${(v / 1_000).toFixed(1)}k`
    : v.toFixed(0);

// ─── Component ─────────────────────────────────────────────────────────────────

const ZoneFlux: React.FC = () => {
  const [hovered, setHovered] = useState<FlowSegment | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const layout = useMemo(() => computeLayout(CORRIDORS), []);
  const { srcNodes, dstNodes, flows, totalVol } = layout;

  const totalFees   = CORRIDORS.reduce((s, c) => s + c.volume * c.feeRate, 0);
  const totalMargin = CORRIDORS.reduce((s, c) => s + c.volume * c.marginRate, 0);
  const totalNet    = totalVol - totalFees - totalMargin;

  const problemCorridors = CORRIDORS.filter(c => c.feeRate >= 0.02);

  const handleMouseEnter = (f: FlowSegment, e: React.MouseEvent<SVGPathElement>) => {
    setHovered(f);
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGPathElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Volume Total',     value: `€${fmt(totalVol)}`,    icon: <DollarSign size={14} />,  color: 'text-slate-300',  border: 'border-slate-800',     glyph: '' },
          { label: 'Net Marchands',    value: `€${fmt(totalNet)}`,    icon: <TrendingUp size={14} />,  color: 'text-emerald-400', border: 'border-emerald-900/40', glyph: `${((totalNet / totalVol) * 100).toFixed(1)}%` },
          { label: 'Frais Réseau',     value: `€${fmt(totalFees)}`,   icon: <TrendingDown size={14} />,color: 'text-rose-400',    border: 'border-rose-900/40',   glyph: `${((totalFees / totalVol) * 100).toFixed(1)}%` },
          { label: 'Marge AetherPay',  value: `€${fmt(totalMargin)}`, icon: <TrendingUp size={14} />,  color: 'text-indigo-400',  border: 'border-indigo-900/40', glyph: `${((totalMargin / totalVol) * 100).toFixed(1)}%` },
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
          {problemCorridors.length > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
              <AlertTriangle size={10} className="text-amber-400" />
              <span className="text-[8px] font-black text-amber-400 uppercase">
                {problemCorridors.map(c => c.label).join(', ')} · frais élevés
              </span>
            </div>
          )}
        </div>

        <div className="relative px-4 pb-5">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ maxHeight: 380 }}
          >
            {/* ── Flows ── */}
            {flows.map((f, i) => (
              <path
                key={i}
                d={flowPath(f.sy0, f.sy1, f.dy0, f.dy1)}
                fill={f.srcColor}
                opacity={hovered ? (hovered === f ? 0.72 : 0.12) : 0.38}
                onMouseEnter={(e) => handleMouseEnter(f, e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
              />
            ))}

            {/* ── Source nodes ── */}
            {srcNodes.map((n) => {
              const mid = n.y + n.h / 2;
              return (
                <g key={n.id}>
                  <rect x={SRC_X} y={n.y} width={NODE_W} height={n.h} fill={n.color} rx="3" />
                  <text x={SRC_LABEL_X} y={mid - 3} textAnchor="end" fontSize="8.5" fontWeight="700" fill={n.color}>
                    {n.label}
                  </text>
                  <text x={SRC_LABEL_X} y={mid + 10} textAnchor="end" fontSize="7.5" fill="#475569">
                    €{fmt(n.volume)} · {((n.volume / totalVol) * 100).toFixed(1)}%
                  </text>
                </g>
              );
            })}

            {/* ── Destination nodes ── */}
            {dstNodes.map((n) => {
              const mid = n.y + n.h / 2;
              return (
                <g key={n.id}>
                  <rect x={DST_X} y={n.y} width={NODE_W} height={n.h} fill={n.color} rx="3" />
                  <text x={DST_LABEL_X} y={mid - 3} textAnchor="start" fontSize="8.5" fontWeight="700" fill={n.color}>
                    {n.label}
                  </text>
                  <text x={DST_LABEL_X} y={mid + 10} textAnchor="start" fontSize="7.5" fill="#475569">
                    €{fmt(n.val)} · {((n.val / totalVol) * 100).toFixed(1)}%
                  </text>
                </g>
              );
            })}

            {/* ── Column headers ── */}
            <text x={SRC_X + NODE_W / 2} y={Y_TOP - 22} textAnchor="middle" fontSize="8" fontWeight="900" fill="#334155" letterSpacing="0.1em">
              SOURCES
            </text>
            <text x={DST_X + NODE_W / 2} y={Y_TOP - 22} textAnchor="middle" fontSize="8" fontWeight="900" fill="#334155" letterSpacing="0.1em">
              DESTINATIONS
            </text>
          </svg>

          {/* Tooltip */}
          {hovered && (
            <div
              className="absolute z-50 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl pointer-events-none"
              style={{
                left: Math.min(tooltipPos.x + 14, (svgRef.current?.getBoundingClientRect().width ?? 600) - 200),
                top: Math.max(tooltipPos.y - 60, 4),
                minWidth: 200,
              }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hovered.srcColor }} />
                <p className="text-[9px] font-black text-white uppercase tracking-wide">
                  {hovered.corridorLabel} <span className="text-slate-500">→</span>{' '}
                  <span style={{ color: hovered.destColor }}>{hovered.destLabel}</span>
                </p>
              </div>
              <div className="space-y-1.5">
                <Row label="Montant transféré" value={`€${fmt(hovered.value)}`} />
                <Row label="Part du corridor" value={`${(hovered.pct * 100).toFixed(1)}%`} highlight="indigo" />
                {hovered.destId === 'fees' && (
                  <Row
                    label="Commission fournisseur"
                    value={`${(hovered.feeRate * 100).toFixed(1)}%`}
                    highlight={hovered.feeRate >= 0.02 ? 'amber' : 'emerald'}
                    warn={hovered.feeRate >= 0.02}
                  />
                )}
                {hovered.destId === 'margin' && (
                  <Row label="Marge AetherPay" value={`${(hovered.marginRate * 100).toFixed(1)}%`} highlight="indigo" />
                )}
                {hovered.destId === 'merchant' && (
                  <Row
                    label="Efficacité corridor"
                    value={`${((1 - hovered.feeRate - hovered.marginRate) * 100).toFixed(1)}%`}
                    highlight="emerald"
                  />
                )}
              </div>
            </div>
          )}
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
                <th key={h} className="px-4 py-2.5 text-[8px] font-black text-slate-600 uppercase tracking-wider text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CORRIDORS.map((c) => {
              const fees   = c.volume * c.feeRate;
              const margin = c.volume * c.marginRate;
              const net    = c.volume - fees - margin;
              const eff    = net / c.volume;
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
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${eff * 100}%`, backgroundColor: c.color }}
                        />
                      </div>
                      <span className="text-[8px] font-black text-slate-400 w-10 text-right">
                        {(eff * 100).toFixed(1)}%
                      </span>
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

// ─── Tooltip row helper ────────────────────────────────────────────────────────

const Row: React.FC<{
  label: string;
  value: string;
  highlight?: 'indigo' | 'emerald' | 'amber';
  warn?: boolean;
}> = ({ label, value, highlight, warn }) => {
  const cls = highlight === 'indigo'
    ? 'text-indigo-300'
    : highlight === 'emerald'
    ? 'text-emerald-400'
    : highlight === 'amber'
    ? 'text-amber-400'
    : 'text-white';
  return (
    <div className="flex justify-between items-center">
      <span className="text-[8px] text-slate-500">{label}</span>
      <span className={`text-[8px] font-black ${cls} flex items-center gap-1`}>
        {warn && <AlertTriangle size={8} />}
        {value}
      </span>
    </div>
  );
};

export default ZoneFlux;

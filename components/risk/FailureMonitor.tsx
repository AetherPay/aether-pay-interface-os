import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  ShieldX, ShieldCheck, AlertTriangle, TrendingDown,
  Loader2, AlertCircle, RefreshCw,
} from 'lucide-react';
import { dashboardApi } from '../../services/api';

const METHOD_LABELS: Record<string, { label: string; color: string }> = {
  card:         { label: 'Stripe · Card',  color: '#6366f1' },
  mtn_money:    { label: 'MTN MoMo',       color: '#f59e0b' },
  orange_money: { label: 'Orange Money',   color: '#f97316' },
  wave:         { label: 'Wave',           color: '#10b981' },
  usdc:         { label: 'USDC · Circle',  color: '#3b82f6' },
};

const fmt = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(2)}M`
  : v >= 1_000   ? `${(v / 1_000).toFixed(1)}k`
  : v.toFixed(0);

const FailureMonitor: React.FC = () => {
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await dashboardApi.getRiskDashboard();
      setData(d);
    } catch (e: any) {
      setError(e.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4 animate-in fade-in">
      <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Analyse des échecs en cours...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <p className="text-sm font-bold text-red-500">{error}</p>
      <button onClick={load} className="px-4 py-2 bg-red-600 text-white text-xs font-black uppercase rounded-lg">
        Réessayer
      </button>
    </div>
  );

  if (!data) return null;

  const { overview, dailyFailures, byMethod, recentFailures } = data;

  const riskLevel =
    overview.failureRate >= 5  ? { label: 'CRITIQUE', color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30'    } :
    overview.failureRate >= 2  ? { label: 'ÉLEVÉ',    color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30'  } :
    overview.failureRate >= 1  ? { label: 'MODÉRÉ',   color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' } :
                                 { label: 'NOMINAL',   color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/30'};

  const chartData = dailyFailures.map((d: any) => ({
    name: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    taux: d.failureRate,
    failed: d.failed,
    total: d.total,
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`lg:col-span-1 ${riskLevel.bg} border ${riskLevel.border} rounded-2xl p-4 flex flex-col justify-between`}>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Niveau de Risque</p>
          <p className={`text-2xl font-black tracking-tighter font-mono ${riskLevel.color}`}>{riskLevel.label}</p>
          <p className="text-[8px] font-black text-slate-600 mt-1">Seuil critique : 5%</p>
        </div>

        {[
          {
            label: 'Taux d\'échec',
            value: `${overview.failureRate.toFixed(2)}%`,
            sub: `${overview.failedCount} / ${overview.totalTransactions} tx`,
            color: overview.failureRate >= 2 ? 'text-amber-400' : 'text-emerald-400',
            border: overview.failureRate >= 2 ? 'border-amber-900/40' : 'border-emerald-900/40',
            icon: <TrendingDown size={14} />,
          },
          {
            label: 'Transactions échouées',
            value: overview.failedCount.toLocaleString(),
            sub: 'toutes périodes',
            color: 'text-red-400',
            border: 'border-red-900/40',
            icon: <ShieldX size={14} />,
          },
          {
            label: 'Montant à risque',
            value: `€${fmt(overview.amountAtRisk)}`,
            sub: 'cumul des échecs',
            color: 'text-rose-400',
            border: 'border-rose-900/40',
            icon: <AlertTriangle size={14} />,
          },
          {
            label: 'Bloquées aujourd\'hui',
            value: overview.blockedToday.toLocaleString(),
            sub: 'transactions',
            color: overview.blockedToday > 0 ? 'text-amber-400' : 'text-slate-400',
            border: overview.blockedToday > 0 ? 'border-amber-900/40' : 'border-slate-800',
            icon: <ShieldCheck size={14} />,
          },
        ].map(k => (
          <div key={k.label} className={`bg-slate-950 border ${k.border} rounded-2xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{k.label}</p>
              <span className={`${k.color} opacity-60`}>{k.icon}</span>
            </div>
            <p className={`text-3xl font-black tracking-tighter font-mono ${k.color}`}>{k.value}</p>
            <p className="text-[8px] font-black text-slate-600 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart + By method */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Taux d'échec 30j */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest italic flex items-center gap-2">
              <TrendingDown size={14} className="text-red-500" /> Taux d'échec · 30 derniers jours
            </h3>
            <button onClick={load} className="p-1.5 text-slate-500 hover:text-white transition-colors">
              <RefreshCw size={12} />
            </button>
          </div>
          <div className="flex-1 min-h-[260px] p-3">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 text-xs font-bold">
                Aucune donnée sur 30 jours
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', fontSize: '10px', color: '#fff' }}
                    formatter={(v: number, name: string) => [
                      name === 'taux' ? `${v.toFixed(2)}%` : v,
                      name === 'taux' ? 'Taux d\'échec' : name,
                    ]}
                    labelStyle={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', fontSize: '9px' }}
                  />
                  <Area type="monotone" dataKey="taux" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#failGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Échecs par méthode */}
        <div className="lg:col-span-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl p-5 flex flex-col">
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest italic mb-4 flex items-center gap-2">
            <ShieldX size={14} className="text-red-500" /> Échecs par corridor
          </h3>
          {byMethod.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-600 text-xs font-bold">Aucune donnée</div>
          ) : (
            <div className="space-y-3 flex-1">
              {byMethod.sort((a: any, b: any) => b.failureRate - a.failureRate).map((m: any) => {
                const meta = METHOD_LABELS[m.method] ?? { label: m.method, color: '#6366f1' };
                return (
                  <div key={m.method} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
                        <span className="text-xs font-bold text-slate-300">{meta.label}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-black font-mono ${m.failureRate >= 5 ? 'text-red-400' : m.failureRate >= 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {m.failureRate.toFixed(1)}%
                        </span>
                        <span className="text-[9px] text-slate-600 ml-1">({m.failed}/{m.total})</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(m.failureRate * 10, 100)}%`, backgroundColor: m.failureRate >= 5 ? '#ef4444' : m.failureRate >= 2 ? '#f59e0b' : '#10b981' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Transactions échouées récentes */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
            <ShieldX size={12} className="text-red-500" /> Échecs récents
          </h3>
          <span className="text-[9px] font-mono text-slate-500">10 derniers</span>
        </div>
        {recentFailures.length === 0 ? (
          <div className="py-16 text-center text-slate-600 text-sm font-medium">Aucune transaction échouée.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-900">
                <tr className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  <th className="px-5 py-3 text-left">Marchand</th>
                  <th className="px-5 py-3 text-left">Méthode</th>
                  <th className="px-5 py-3 text-right">Montant</th>
                  <th className="px-5 py-3 text-left">Raison</th>
                  <th className="px-5 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentFailures.map((t: any) => {
                  const meta = METHOD_LABELS[t.paymentMethod] ?? { label: t.paymentMethod, color: '#6366f1' };
                  return (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-bold text-white">{t.merchantName}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                          <span className="text-[9px] font-black" style={{ color: meta.color }}>{meta.label}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-sm font-black font-mono text-red-400">
                          {Number(t.amount).toLocaleString('fr-FR')} {t.currency}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[9px] text-slate-500 font-mono">{t.failureReason || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-[10px] font-mono text-slate-500 whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                        <span className="ml-1 text-slate-600">
                          {new Date(t.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default FailureMonitor;


import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Zap, Globe, Activity, ShieldCheck,
  BrainCircuit, Radio, Terminal,
  ArrowUpRight, Cpu, Network, CheckCircle2, XCircle,
  History, AlertTriangle, Download, Filter, MousePointer2,
  TrendingUp, MapPin, Eye, AlertCircle, Loader2, RefreshCw,
  CreditCard, Smartphone, Waves
} from 'lucide-react';
import { FeedItem, ViewState } from '../types';
import { cortexInsights, mockIncidents as initialIncidents } from '../services/mockData';
import LiveFeed from './LiveFeed';
import { dashboardApi, transactionsApi } from '../services/api';

// ─── helpers ────────────────────────────────────────────────────────────────

const fmtVolume = (v: number) =>
  v >= 1_000_000
    ? `${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000
    ? `${(v / 1_000).toFixed(0)}k`
    : String(Math.round(v));

const METHOD_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  card:         { label: 'Visa / Mastercard', color: '#6366f1', bg: 'bg-indigo-100 text-indigo-600', icon: <CreditCard size={12} /> },
  stripe:       { label: 'Visa / Mastercard', color: '#6366f1', bg: 'bg-indigo-100 text-indigo-600', icon: <CreditCard size={12} /> },
  mtn_money:    { label: 'MTN MoMo',          color: '#f59e0b', bg: 'bg-amber-100 text-amber-600',   icon: <Smartphone size={12} /> },
  orange_money: { label: 'Orange Money',      color: '#f97316', bg: 'bg-orange-100 text-orange-600', icon: <Smartphone size={12} /> },
  wave:         { label: 'Wave',              color: '#10b981', bg: 'bg-emerald-100 text-emerald-600', icon: <Waves size={12} /> },
  usdc:         { label: 'USDC',              color: '#3b82f6', bg: 'bg-blue-100 text-blue-600',     icon: <CreditCard size={12} /> },
};

const TX_STATUS: Record<string, { label: string; cls: string }> = {
  completed: { label: 'Complété', cls: 'bg-green-100 text-green-700' },
  failed:    { label: 'Échoué',   cls: 'bg-red-100 text-red-700' },
  pending:   { label: 'En cours', cls: 'bg-amber-100 text-amber-700' },
};

// ─── types ───────────────────────────────────────────────────────────────────

interface DashboardData {
  merchants: { total: number; active: number };
  transactions: { total: number; completedVolume: number };
  settlements: { pending: number };
  payouts: { pending: number };
  byMethod: { method: string; count: number; volume: number }[];
  recentTransactions: {
    id: string; merchantName: string; amount: number; currency: string;
    paymentMethod: string; status: string; reference: string;
    customerName: string | null; createdAt: string;
  }[];
  dailyVolume: { date: string; count: number; volume: number }[];
}

// ─── live map ────────────────────────────────────────────────────────────────

interface LiveTx {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  merchantName: string;
  customerName: string | null;
  createdAt: string;
  reference: string;
}

const CURRENCY_COUNTRIES: Record<string, string[]> = {
  XOF: ['SN', 'ML', 'BF', 'CI', 'TG', 'BJ'],
  XAF: ['CM', 'GA', 'CG'],
  GHS: ['GH'],
  NGN: ['NG'],
  KES: ['KE'],
  EUR: ['FR'],
  USD: ['US'],
};

// Approximate SVG positions on Africa-centered map (viewBox 0 0 480 380)
const COUNTRY_NODES = [
  // North Africa (dim — background context)
  { id: 'MA', name: 'Maroc',       x: 105, y: 68,  dim: true  },
  { id: 'DZ', name: 'Algérie',     x: 162, y: 64,  dim: true  },
  { id: 'LY', name: 'Libye',       x: 218, y: 70,  dim: true  },
  { id: 'EG', name: 'Égypte',      x: 275, y: 76,  dim: true  },
  // West Africa — XOF zone
  { id: 'SN', name: 'Sénégal',     x: 55,  y: 148, dim: false },
  { id: 'ML', name: 'Mali',        x: 118, y: 138, dim: false },
  { id: 'BF', name: 'Burkina',     x: 148, y: 158, dim: false },
  { id: 'CI', name: "Côte d'Iv",  x: 110, y: 188, dim: false },
  { id: 'TG', name: 'Togo',        x: 158, y: 180, dim: false },
  { id: 'BJ', name: 'Bénin',       x: 172, y: 172, dim: false },
  // Ghana
  { id: 'GH', name: 'Ghana',       x: 138, y: 184, dim: false },
  // Nigeria
  { id: 'NG', name: 'Nigeria',     x: 195, y: 168, dim: false },
  // Central Africa — XAF zone
  { id: 'CM', name: 'Cameroun',    x: 222, y: 190, dim: false },
  { id: 'GA', name: 'Gabon',       x: 205, y: 220, dim: false },
  { id: 'CG', name: 'Congo',       x: 228, y: 232, dim: false },
  { id: 'CD', name: 'RD Congo',    x: 262, y: 232, dim: true  },
  // East Africa
  { id: 'ET', name: 'Éthiopie',    x: 322, y: 162, dim: true  },
  { id: 'KE', name: 'Kenya',       x: 338, y: 205, dim: false },
  { id: 'TZ', name: 'Tanzanie',    x: 325, y: 245, dim: true  },
  // Southern Africa (for completeness)
  { id: 'ZA', name: 'Afr. Sud',    x: 248, y: 342, dim: true  },
  { id: 'MZ', name: 'Mozam.',      x: 302, y: 298, dim: true  },
  // Europe (off-map top — diaspora payments)
  { id: 'FR', name: 'France',      x: 148, y: 22,  dim: false },
  // Americas (off-map left)
  { id: 'US', name: 'États-Unis',  x: 18,  y: 88,  dim: false },
];

// Thin connection lines between countries
const MAP_CONNECTIONS: [string, string][] = [
  // XOF zone
  ['SN', 'ML'], ['ML', 'BF'], ['BF', 'CI'], ['BF', 'TG'], ['TG', 'BJ'], ['BJ', 'NG'],
  ['SN', 'CI'], ['CI', 'GH'], ['GH', 'TG'],
  // XAF zone
  ['CM', 'GA'], ['GA', 'CG'], ['CM', 'CG'],
  // Cross-region
  ['NG', 'CM'],
  // East
  ['ET', 'KE'],
  // Trans-continental (long, subtle)
  ['SN', 'FR'], ['NG', 'FR'], ['FR', 'US'],
];

const LiveTransactionMap: React.FC = () => {
  const [liveTxns, setLiveTxns] = useState<LiveTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCurrencies, setActiveCurrencies] = useState<Set<string>>(new Set());
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const prevIdsRef = useRef<Set<string>>(new Set());
  const rippleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTxns = useCallback(async () => {
    try {
      const data = await transactionsApi.list({ limit: 25 }) as any;
      const raw: any[] = data?.transactions ?? data?.items ?? (Array.isArray(data) ? data : []);
      const txns: LiveTx[] = raw.map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        currency: t.currency,
        paymentMethod: t.paymentMethod,
        status: t.status,
        merchantName: t.merchantName ?? '—',
        customerName: t.customerName ?? null,
        createdAt: t.createdAt,
        reference: t.reference ?? t.id.slice(0, 10),
      }));

      // Detect new transactions for ripple animation (skip on initial load)
      if (prevIdsRef.current.size > 0) {
        const newCurrencies = new Set<string>(
          txns.filter((t) => !prevIdsRef.current.has(t.id)).map((t) => t.currency)
        );
        if (newCurrencies.size > 0) {
          setActiveCurrencies(newCurrencies);
          if (rippleTimerRef.current) clearTimeout(rippleTimerRef.current);
          rippleTimerRef.current = setTimeout(() => setActiveCurrencies(new Set()), 2500);
        }
      }
      prevIdsRef.current = new Set(txns.map((t) => t.id));
      setLiveTxns(txns);
      setLastRefresh(new Date());
    } catch {
      // silent — map stays with previous data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTxns();
    const interval = setInterval(fetchTxns, 15_000);
    return () => {
      clearInterval(interval);
      if (rippleTimerRef.current) clearTimeout(rippleTimerRef.current);
    };
  }, [fetchTxns]);

  const activeCountryIds = useMemo(() => {
    const ids = new Set<string>();
    activeCurrencies.forEach((cur) => (CURRENCY_COUNTRIES[cur] ?? []).forEach((id) => ids.add(id)));
    return ids;
  }, [activeCurrencies]);

  const txCountByCurrency = useMemo(() => {
    const m = new Map<string, number>();
    liveTxns.forEach((t) => m.set(t.currency, (m.get(t.currency) ?? 0) + 1));
    return m;
  }, [liveTxns]);

  const nodeMap = useMemo(() => {
    const m = new Map<string, typeof COUNTRY_NODES[0]>();
    COUNTRY_NODES.forEach((n) => m.set(n.id, n));
    return m;
  }, []);

  const completed = liveTxns.filter((t) => t.status === 'completed').length;
  const pending   = liveTxns.filter((t) => t.status === 'pending').length;
  const failed    = liveTxns.filter((t) => t.status === 'failed').length;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Complétées',  value: completed, color: 'text-emerald-400', border: 'border-emerald-900/40' },
          { label: 'En cours',    value: pending,   color: 'text-amber-400',   border: 'border-amber-900/40'   },
          { label: 'Échecs',      value: failed,    color: 'text-rose-400',    border: 'border-rose-900/40'    },
        ].map((s) => (
          <div key={s.label} className={`bg-slate-950 border ${s.border} rounded-2xl p-4 text-center`}>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-4xl font-black tracking-tighter ${s.color}`}>
              {loading ? '—' : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Map + Live Tape */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col lg:flex-row shadow-2xl">

        {/* SVG map */}
        <div className="flex-1 relative flex items-center justify-center p-4 min-h-[380px]"
          style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '22px 22px' }}>
        </div>

        {/* Live Tape */}
        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-slate-800 bg-black/30 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Radio size={12} className="text-indigo-500 animate-pulse" /> Live Tape
            </h3>
            <div className="flex items-center gap-2">
              {loading && <Loader2 size={10} className="text-slate-600 animate-spin" />}
              {lastRefresh && (
                <span className="text-[8px] font-mono text-slate-600">
                  {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 360 }}>
            {liveTxns.length === 0 && !loading && (
              <div className="py-10 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                Aucune transaction
              </div>
            )}
            {liveTxns.map((txn) => {
              const isNew = activeCurrencies.has(txn.currency);
              const statusCls =
                txn.status === 'completed' ? 'text-emerald-400' :
                txn.status === 'failed' ? 'text-rose-400' : 'text-amber-400';
              const method = METHOD_META[txn.paymentMethod] ?? {
                label: txn.paymentMethod, bg: 'bg-slate-800 text-slate-400', icon: <CreditCard size={10} />,
              };
              return (
                <div
                  key={txn.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all duration-500 ${
                    isNew
                      ? 'bg-indigo-950/60 border-indigo-500/40'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black font-mono text-indigo-400 truncate">{txn.reference}</p>
                    <p className="text-[10px] font-bold text-white truncate">{txn.merchantName}</p>
                    <span className={`text-[8px] font-black uppercase ${statusCls}`}>
                      {txn.status === 'completed' ? 'Complété' : txn.status === 'failed' ? 'Échec' : 'En cours'}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-black text-white font-mono">
                      {txn.amount.toLocaleString('fr-FR')}
                    </p>
                    <p className="text-[8px] font-bold text-slate-500">{txn.currency}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── component ───────────────────────────────────────────────────────────────

interface DashboardViewProps {
  setView: (view: ViewState) => void;
  currentView: ViewState;
}

const DashboardView: React.FC<DashboardViewProps> = ({ setView, currentView }) => {
  const [showToast, setShowToast] = useState<string | null>(null);
  const [incidents, setIncidents] = useState(initialIncidents);

  // Real data state
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getKPIs() as any;
      setDashData(data);
    } catch (e: any) {
      setError(e.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentView === 'COMMAND_GLOBAL_OVERVIEW') {
      fetchDashboard();
    }
  }, [currentView, fetchDashboard]);

  // ── KPI cards ───────────────────────────────────────────────────────────────

  const kpis = dashData
    ? [
        {
          id: 'merchants',
          label: 'Marchands Actifs',
          value: dashData.merchants.active.toLocaleString(),
          sub: `/ ${dashData.merchants.total} total`,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
          icon: <Network size={16} />,
        },
        {
          id: 'transactions',
          label: 'Transactions',
          value: dashData.transactions.total.toLocaleString(),
          sub: 'toutes devises',
          color: 'text-violet-600',
          bg: 'bg-violet-50',
          icon: <Activity size={16} />,
        },
        {
          id: 'volume',
          label: 'Volume Complété',
          value: fmtVolume(dashData.transactions.completedVolume),
          sub: '30 derniers jours',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          icon: <TrendingUp size={16} />,
        },
        {
          id: 'pending',
          label: 'Actions en Attente',
          value: (dashData.settlements.pending + dashData.payouts.pending).toLocaleString(),
          sub: `${dashData.settlements.pending} règl. · ${dashData.payouts.pending} virt.`,
          color: dashData.settlements.pending + dashData.payouts.pending > 0 ? 'text-amber-600' : 'text-slate-400',
          bg: dashData.settlements.pending + dashData.payouts.pending > 0 ? 'bg-amber-50' : 'bg-slate-50',
          icon: <AlertCircle size={16} />,
        },
      ]
    : [];

  // ── chart data ──────────────────────────────────────────────────────────────

  const chartData = (dashData?.dailyVolume ?? []).map((d) => ({
    name: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    volume: d.volume,
    count: d.count,
  }));

  // ── method breakdown ────────────────────────────────────────────────────────

  const totalMethodCount = (dashData?.byMethod ?? []).reduce((s, m) => s + m.count, 0) || 1;

  // ────────────────────────────────────────────────────────────────────────────

  const GlobalOverview = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-32 gap-4 animate-in fade-in">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Chargement des données...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-sm font-bold text-red-500">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-black uppercase rounded-lg"
          >
            Réessayer
          </button>
        </div>
      );
    }

    if (!dashData) return null;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {kpi.label}
                </span>
                <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color}`}>{kpi.icon}</div>
              </div>
              <p className={`text-2xl font-black italic tracking-tighter ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Chart + Method Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* 30-day volume chart */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest italic flex items-center gap-2">
                <Activity size={14} className="text-indigo-500" /> Volume · 30 derniers jours
              </h3>
              <span className="text-[9px] font-black text-slate-400 font-mono">
                {chartData.length} jours · {fmtVolume(dashData.transactions.completedVolume)} total
              </span>
            </div>
            <div className="flex-1 min-h-[260px] p-3">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-300 text-xs font-bold">
                  Aucune transaction sur les 30 derniers jours
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '10px',
                        fontSize: '10px',
                        color: '#fff',
                      }}
                      formatter={(v: number) => [fmtVolume(v), 'Volume']}
                      labelStyle={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', fontSize: '9px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorVol)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Payment method breakdown */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col">
            <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest italic mb-4 flex items-center gap-2">
              <Zap size={14} className="text-indigo-500" /> Répartition Méthodes
            </h3>
            {dashData.byMethod.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-300 text-xs font-bold">
                Aucune donnée
              </div>
            ) : (
              <div className="space-y-3 flex-1">
                {dashData.byMethod
                  .sort((a, b) => b.count - a.count)
                  .map((m) => {
                    const meta = METHOD_META[m.method] || {
                      label: m.method,
                      color: '#6366f1',
                      bg: 'bg-slate-100 text-slate-500',
                      icon: <CreditCard size={12} />,
                    };
                    const pct = Math.round((m.count / totalMethodCount) * 100);
                    return (
                      <div key={m.method} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`p-1 rounded-md text-[10px] ${meta.bg}`}>{meta.icon}</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{meta.label}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-black text-slate-900 dark:text-white font-mono">{m.count}</span>
                            <span className="text-[9px] text-slate-400 ml-1">({pct}%)</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: meta.color }}
                          />
                        </div>
                        <p className="text-[9px] font-mono text-slate-400">{fmtVolume(m.volume)} vol.</p>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <History size={12} className="text-indigo-500" /> Transactions Récentes
            </h3>
            <span className="text-[9px] font-mono text-slate-400">10 dernières</span>
          </div>
          {dashData.recentTransactions.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm font-medium">
              Aucune transaction enregistrée.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                <thead className="bg-white dark:bg-slate-900">
                  <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-5 py-3 text-left">Référence</th>
                    <th className="px-5 py-3 text-left">Marchand</th>
                    <th className="px-5 py-3 text-left">Client</th>
                    <th className="px-5 py-3 text-left">Méthode</th>
                    <th className="px-5 py-3 text-right">Montant</th>
                    <th className="px-5 py-3 text-left">Statut</th>
                    <th className="px-5 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {dashData.recentTransactions.map((t) => {
                    const st = TX_STATUS[t.status] ?? { label: t.status, cls: 'bg-slate-100 text-slate-600' };
                    const method = METHOD_META[t.paymentMethod] ?? {
                      label: t.paymentMethod,
                      bg: 'bg-slate-100 text-slate-500',
                      icon: <CreditCard size={10} />,
                    };
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="text-[10px] font-black font-mono text-indigo-600">{t.reference}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{t.merchantName}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-xs text-slate-500">{t.customerName || '—'}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black ${method.bg}`}>
                            {method.icon} {method.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                            {t.amount.toLocaleString('fr-FR')} {t.currency}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wide ${st.cls}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-[10px] font-mono text-slate-400 whitespace-nowrap">
                          {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                          <span className="ml-1 text-slate-300">
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

  const AlertsHub = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
      {incidents.map((inc) => (
        <div
          key={inc.id}
          className={`bg-white dark:bg-slate-900 border ${inc.severity === 'CRITICAL' ? 'border-red-500 shadow-md' : 'border-slate-200 dark:border-slate-800'} p-5 rounded-xl`}
        >
          <div className="flex justify-between items-start mb-3">
            <span
              className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest ${
                inc.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {inc.severity}
            </span>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-400 font-mono italic">{inc.id}</span>
              <span className="text-[8px] text-slate-400 mt-1">{inc.timestamp}</span>
            </div>
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight mb-6">{inc.title}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIncidents((p) => p.filter((i) => i.id !== inc.id));
                triggerToast(`Incident ${inc.id} acknowledged.`);
              }}
              className="flex-1 py-2 bg-slate-900 dark:bg-slate-800 text-white text-[9px] font-black uppercase rounded-lg hover:bg-black transition-colors"
            >
              Ack
            </button>
            <button
              onClick={() => triggerToast(`Incident ${inc.id} escalated to L3.`)}
              className="flex-1 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Escalate
            </button>
          </div>
        </div>
      ))}
      {incidents.length === 0 && (
        <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <ShieldCheck size={40} className="mx-auto text-green-500 mb-4 opacity-50" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No active incidents. All systems nominal.</p>
        </div>
      )}
    </div>
  );

  const ExecutiveReports = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-500">
      {['Q4 Financials', 'Compliance Audit', 'Operational SLA', 'Risk Exposure'].map((report) => (
        <div
          key={report}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center"
        >
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <Download size={20} />
          </div>
          <h3 className="text-xs font-black uppercase italic mb-1">{report}</h3>
          <p className="text-[9px] text-slate-400 font-bold mb-4">OCT 2025 · PDF</p>
          <button className="w-full py-2 bg-slate-950 text-white text-[9px] font-black uppercase rounded-lg">Download</button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative min-h-[80vh]">
      {showToast && (
        <div className="fixed top-20 right-8 z-[200] bg-slate-950 border border-indigo-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right backdrop-blur-md">
          <Zap size={14} className="text-indigo-400 fill-indigo-400 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-widest">{showToast}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Terminal className="text-white h-4 w-4" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase">
              {currentView.replace(/COMMAND_|TREASURY_|RISK_|ENG_|OPS_|SEC_|COMPLIANCE_/g, '').replace(/_/g, ' ')}
              <span className="text-indigo-600">.CORE</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
            <span className="flex items-center gap-1"><MapPin size={10} /> Alpha-01</span>
            <span className="flex items-center gap-1"><Cpu size={10} /> AetherOS v2.5</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (currentView === 'COMMAND_GLOBAL_OVERVIEW') fetchDashboard();
              triggerToast('Synchronisation en cours...');
            }}
            disabled={loading}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase rounded-xl flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Sync
          </button>
          <button className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase rounded-xl flex items-center gap-2">
            <ShieldCheck size={12} /> Secure
          </button>
        </div>
      </div>

      <div className="relative">
        {currentView === 'COMMAND_GLOBAL_OVERVIEW' && <GlobalOverview />}
        {currentView === 'COMMAND_LIVE_MAP' && <LiveTransactionMap />}
        {currentView === 'COMMAND_ALERTS' && <AlertsHub />}
        {currentView === 'COMMAND_EXECUTIVE_REPORTS' && <ExecutiveReports />}
        {!currentView.startsWith('COMMAND_') && <GlobalOverview />}
      </div>
    </div>
  );
};

export default DashboardView;

import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  Zap,
  Network,
  TrendingUp,
  AlertCircle,
  Loader2,
  History,
  CreditCard,
} from "lucide-react";
import { dashboardApi } from "../../services/api";
import { ViewState } from "../../types";
import {
  METHOD_META,
  TX_STATUS,
  fmtVolume,
} from "../../constants/paymentMethods";

interface DashboardData {
  merchants: { total: number; active: number };
  transactions: { total: number; completedVolume: number };
  settlements: { pending: number };
  payouts: { pending: number };
  byMethod: { method: string; count: number; volume: number }[];
  recentTransactions: {
    id: string;
    merchantName: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: string;
    reference: string;
    customerName: string | null;
    createdAt: string;
  }[];
  dailyVolume: { date: string; count: number; volume: number }[];
}

interface GlobalOverviewProps {
  setView: (view: ViewState) => void;
}

const GlobalOverview: React.FC<GlobalOverviewProps> = ({ setView }) => {
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await dashboardApi.getKPIs()) as any;
      console.log("Dashboard data:", data);
      setDashData(data);
    } catch (e: any) {
      setError(e.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 animate-in fade-in">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Chargement des données...
        </p>
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

  // ── KPI cards ───────────────────────────────────────────────────────────────

  const kpis = [
    {
      id: "merchants",
      label: "Marchands Actifs",
      value: dashData.merchants.active.toLocaleString(),
      sub: `/ ${dashData.merchants.total} total`,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      icon: <Network size={16} />,
    },
    {
      id: "transactions",
      label: "Transactions",
      value: dashData.transactions.total.toLocaleString(),
      sub: "toutes devises",
      color: "text-violet-600",
      bg: "bg-violet-50",
      icon: <Activity size={16} />,
    },
    {
      id: "volume",
      label: "Volume Complété",
      value: fmtVolume(dashData.transactions.completedVolume),
      sub: "30 derniers jours",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      icon: <TrendingUp size={16} />,
    },
    {
      id: "pending",
      label: "Actions en Attente",
      value: (
        dashData.settlements.pending + dashData.payouts.pending
      ).toLocaleString(),
      sub: `${dashData.settlements.pending} règl. · ${dashData.payouts.pending} virt.`,
      color:
        dashData.settlements.pending + dashData.payouts.pending > 0
          ? "text-amber-600"
          : "text-slate-400",
      bg:
        dashData.settlements.pending + dashData.payouts.pending > 0
          ? "bg-amber-50"
          : "bg-slate-50",
      icon: <AlertCircle size={16} />,
    },
  ];

  // ── chart data ──────────────────────────────────────────────────────────────

  const chartData = (dashData?.dailyVolume ?? []).map((d) => ({
    name: new Date(d.date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    }),
    volume: d.volume,
    count: d.count,
  }));

  // ── method breakdown ────────────────────────────────────────────────────────

  const totalMethodCount =
    (dashData?.byMethod ?? []).reduce((s, m) => s + m.count, 0) || 1;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.slice(0, 3).map((kpi) => (
          <div
            key={kpi.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {kpi.label}
              </span>
              <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color}`}>
                {kpi.icon}
              </div>
            </div>
            <p
              className={`text-2xl font-black italic tracking-tighter ${kpi.color}`}
            >
              {kpi.value}
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-1">
              {kpi.sub}
            </p>
          </div>
        ))}

        {/* Actions en attente — split view */}
        {(() => {
          const s = dashData.settlements.pending;
          const p = dashData.payouts.pending;
          const hasAny = s + p > 0;
          return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Actions en Attente
                </span>
                <div
                  className={`p-1.5 rounded-lg ${hasAny ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400"}`}
                >
                  <AlertCircle size={16} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <div>
                  <p
                    className={`text-2xl font-black italic tracking-tighter ${s > 0 ? "text-amber-600" : "text-slate-400"}`}
                  >
                    {s.toLocaleString()}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                    Règlements
                  </p>
                </div>
                <div>
                  <p
                    className={`text-2xl font-black italic tracking-tighter ${p > 0 ? "text-amber-600" : "text-slate-400"}`}
                  >
                    {p.toLocaleString()}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                    Virements demandés
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Chart + Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 30-day volume chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest italic flex items-center gap-2">
              <Activity size={14} className="text-indigo-500" /> Volume · 30
              derniers jours
            </h3>
            <span className="text-[9px] font-black text-slate-400 font-mono">
              {chartData.length} jours ·{" "}
              {fmtVolume(dashData.transactions.completedVolume)} total
            </span>
          </div>
          <div className="flex-1 min-h-[260px] p-3">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-300 text-xs font-bold">
                Aucune transaction sur les 30 derniers jours
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#6366f1"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "10px",
                      fontSize: "10px",
                      color: "#fff",
                    }}
                    formatter={(v: number) => [fmtVolume(v), "Volume"]}
                    labelStyle={{
                      color: "#94a3b8",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      fontSize: "9px",
                    }}
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
                    color: "#6366f1",
                    bg: "bg-slate-100 text-slate-500",
                    icon: <CreditCard size={12} />,
                  };
                  const pct = Math.round((m.count / totalMethodCount) * 100);
                  return (
                    <div key={m.method} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`p-1 rounded-md text-[10px] ${meta.bg}`}
                          >
                            {meta.icon}
                          </span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {meta.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black text-slate-900 dark:text-white font-mono">
                            {m.count}
                          </span>
                          <span className="text-[9px] text-slate-400 ml-1">
                            ({pct}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: meta.color,
                          }}
                        />
                      </div>
                      <p className="text-[9px] font-mono text-slate-400">
                        {fmtVolume(m.volume)} vol.
                      </p>
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
            <History size={12} className="text-indigo-500" /> Transactions
            Récentes
          </h3>
          <span className="text-[9px] font-mono text-slate-400">
            10 dernières
          </span>
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
                  const st = TX_STATUS[t.status] ?? {
                    label: t.status,
                    cls: "bg-slate-100 text-slate-600",
                  };
                  const method = METHOD_META[t.paymentMethod] ?? {
                    label: t.paymentMethod,
                    bg: "bg-slate-100 text-slate-500",
                    icon: <CreditCard size={10} />,
                  };
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] font-black font-mono text-indigo-600">
                          {t.reference}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {t.merchantName}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs text-slate-500">
                          {t.customerName || "—"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black ${method.bg}`}
                        >
                          {method.icon} {method.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                          {t.amount.toLocaleString("fr-FR")} {t.currency}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wide ${st.cls}`}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-[10px] font-mono text-slate-400 whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString("fr-FR")}
                        <span className="ml-1 text-slate-300">
                          {new Date(t.createdAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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

export default GlobalOverview;

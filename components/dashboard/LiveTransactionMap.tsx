import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Radio, Loader2, CreditCard } from 'lucide-react';
import { CURRENCY_COUNTRIES, COUNTRY_NODES, MAP_CONNECTIONS } from '../../constants/mapData';
import { METHOD_META } from '../../constants/paymentMethods';
import { transactionsApi } from '../../services/api';

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

export default LiveTransactionMap;

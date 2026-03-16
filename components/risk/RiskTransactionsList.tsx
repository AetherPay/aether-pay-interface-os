import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { transactionsApi } from '../../services/api';

interface RealTransaction {
  id: string;
  reference: string;
  merchantName: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  failureReason: string | null;
  createdAt: string;
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  completed:  { label: 'Complété',  cls: 'bg-green-50 text-green-700' },
  pending:    { label: 'En attente', cls: 'bg-amber-50 text-amber-700' },
  failed:     { label: 'Échoué',    cls: 'bg-red-100 text-red-700' },
  cancelled:  { label: 'Annulé',    cls: 'bg-slate-100 text-slate-500' },
};

const METHOD_LABEL: Record<string, string> = {
  card: 'Card', stripe: 'Card', mtn_money: 'MTN MoMo',
  orange_money: 'Orange', wave: 'Wave', usdc: 'USDC',
};

const RiskTransactionsList: React.FC = () => {
  const [riskTxns, setRiskTxns] = useState<RealTransaction[]>([]);
  const [riskTotal, setRiskTotal] = useState(0);
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState<string | null>(null);
  const [riskStatusFilter, setRiskStatusFilter] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => loadRiskTransactions(), 300);
    return () => clearTimeout(timer);
  }, [riskStatusFilter]);

  const loadRiskTransactions = async () => {
    setRiskLoading(true);
    setRiskError(null);
    try {
      const res = await transactionsApi.list({ status: riskStatusFilter || undefined, limit: 50 });
      setRiskTxns(res.transactions ?? []);
      setRiskTotal(res.total ?? 0);
    } catch (err) {
      setRiskError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setRiskLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden animate-in fade-in duration-500 shadow-sm">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 justify-between items-center bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-3">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            File de surveillance
          </h3>
          <span className="text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            {riskTotal} transaction{riskTotal !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={riskStatusFilter}
            onChange={(e) => setRiskStatusFilter(e.target.value)}
            className="text-[10px] font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none uppercase"
          >
            <option value="failed">Échoués</option>
            <option value="pending">En attente</option>
            <option value="">Tous</option>
          </select>
          <button
            onClick={loadRiskTransactions}
            className="p-1.5 text-slate-400 hover:text-indigo-600 transition-all"
          >
            <RefreshCw size={14} className={riskLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {riskError && (
        <div className="p-6 text-center">
          <p className="text-xs text-red-500 font-mono mb-3">{riskError}</p>
          <button onClick={loadRiskTransactions} className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl">
            Réessayer
          </button>
        </div>
      )}

      {!riskError && (
        <table className="w-full text-left">
          <thead className="bg-white dark:bg-slate-900">
            <tr className="text-[9px] font-black text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-4">Référence</th>
              <th className="px-6 py-4">Marchand</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Méthode</th>
              <th className="px-6 py-4">Montant</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4">Raison</th>
              <th className="px-6 py-4 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {riskLoading && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-xs text-slate-400">
                  <RefreshCw size={16} className="animate-spin mx-auto mb-2" />
                  Chargement...
                </td>
              </tr>
            )}
            {!riskLoading && riskTxns.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <CheckCircle2 size={32} className="mx-auto text-green-500 mb-3 opacity-50" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Aucune transaction
                  </p>
                </td>
              </tr>
            )}
            {!riskLoading && riskTxns.map((txn) => {
              const statusMeta = STATUS_META[txn.status] ?? { label: txn.status, cls: 'bg-slate-100 text-slate-500' };
              return (
                <tr key={txn.id} className="hover:bg-red-50/30 dark:hover:bg-red-500/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                    {txn.reference}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-slate-200">
                    {txn.merchantName}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-200">{txn.customerName}</p>
                    <p className="text-[9px] text-slate-400">{txn.customerEmail}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded uppercase">
                      {METHOD_LABEL[txn.paymentMethod] ?? txn.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-black text-slate-900 dark:text-slate-200 whitespace-nowrap">
                    {txn.amount.toLocaleString()} {txn.currency}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${statusMeta.cls}`}>
                      {statusMeta.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[9px] text-slate-400 max-w-[140px] truncate">
                    {txn.failureReason ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-[9px] font-mono text-slate-400 whitespace-nowrap">
                    {new Date(txn.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RiskTransactionsList;

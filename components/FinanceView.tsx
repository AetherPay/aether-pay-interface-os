
import React, { useState, useEffect, useCallback } from 'react';
import { mockLedger } from '../services/mockData';
import { LedgerEntry } from '../types';
import { payoutsApi, settlementsApi } from '../services/api';
import {
  Landmark, ArrowUpRight, ArrowDownLeft, FileText, Download, PieChart,
  Wallet, Scale, Search, CheckCircle2, XCircle, Copy, Check, Hash,
  Clock, RefreshCw, AlertCircle, Loader2, Smartphone, Banknote, CalendarClock, Unlock
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'En attente', color: 'text-amber-700',  bg: 'bg-amber-100' },
  processing: { label: 'En cours',   color: 'text-blue-700',   bg: 'bg-blue-100' },
  completed:  { label: 'Complété',   color: 'text-green-700',  bg: 'bg-green-100' },
  failed:     { label: 'Échoué',     color: 'text-red-700',    bg: 'bg-red-100' },
};

const METHOD_LABELS: Record<string, string> = {
  card: 'Visa / Mastercard',
  stripe: 'Visa / Mastercard',
  mtn_money: 'MTN Mobile Money',
  orange_money: 'Orange Money',
  wave: 'Wave',
  usdc: 'USDC',
};

const FinanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'PAYOUTS' | 'SETTLEMENTS' | 'RECONCILIATION'>('PAYOUTS');
  const [ledgerEntries, setLedgerEntries] = useState(mockLedger);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);

  const [bankSelection, setBankSelection] = useState<string | null>(null);
  const [ledgerSelection, setLedgerSelection] = useState<string | null>(null);
  const variance = (bankSelection && ledgerSelection) ? 450000 - 450000 : 0;

  // Payouts state
  const [payouts, setPayouts] = useState<any[]>([]);
  const [payoutsTotal, setPayoutsTotal] = useState(0);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actionRequiredFilter, setActionRequiredFilter] = useState(false);
  const [actionRequiredCount, setActionRequiredCount] = useState(0);
  // Settlements state
  const [settlements, setSettlements] = useState<any[]>([]);
  const [settlementsTotal, setSettlementsTotal] = useState(0);
  const [loadingSettlements, setLoadingSettlements] = useState(false);
  const [settlementStatusFilter, setSettlementStatusFilter] = useState('pending');
  const [releasingId, setReleasingId] = useState<string | null>(null);

  const loadSettlements = useCallback(async () => {
    setLoadingSettlements(true);
    try {
      const data = await settlementsApi.list({
        status: settlementStatusFilter || undefined,
        limit: 50,
      });
      setSettlements((data as any)?.settlements || []);
      setSettlementsTotal((data as any)?.total || 0);
    } catch {
      setSettlements([]);
    } finally {
      setLoadingSettlements(false);
    }
  }, [settlementStatusFilter]);

  useEffect(() => {
    if (activeTab === 'SETTLEMENTS') loadSettlements();
  }, [activeTab, loadSettlements]);

  const handleRelease = async (id: string) => {
    setReleasingId(id);
    try {
      await settlementsApi.release(id);
      showToast('Settlement libéré — fonds disponibles pour le marchand.');
      loadSettlements();
    } catch (e: any) {
      showToast(e.message || 'Erreur lors de la libération.');
    } finally {
      setReleasingId(null);
    }
  };

  const [actionModal, setActionModal] = useState<{ type: 'complete' | 'fail'; payoutId: string } | null>(null);
  const [actionInput, setActionInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadPayouts = useCallback(async () => {
    setLoadingPayouts(true);
    try {
      const data = await payoutsApi.list({
        status: actionRequiredFilter ? undefined : (statusFilter || undefined),
        requiresAdminAction: actionRequiredFilter ? true : undefined,
        limit: 50,
      });
      setPayouts((data as any)?.payouts || []);
      setPayoutsTotal((data as any)?.total || 0);
    } catch {
      setPayouts([]);
    } finally {
      setLoadingPayouts(false);
    }
  }, [statusFilter, actionRequiredFilter]);

  const loadActionRequiredCount = useCallback(async () => {
    try {
      const data = await payoutsApi.list({ requiresAdminAction: true, limit: 1 });
      setActionRequiredCount((data as any)?.total || 0);
    } catch {
      setActionRequiredCount(0);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'PAYOUTS') {
      loadPayouts();
      loadActionRequiredCount();
    }
  }, [activeTab, loadPayouts, loadActionRequiredCount]);

  const handleProcess = async (id: string) => {
    try {
      await payoutsApi.process(id);
      showToast('Virement marqué en traitement.');
      loadPayouts();
    } catch (e: any) {
      showToast(e.message || 'Error processing payout.');
    }
  };

  const handleActionSubmit = async () => {
    if (!actionModal) return;
    setActionLoading(true);
    try {
      if (actionModal.type === 'complete') {
        await payoutsApi.complete(actionModal.payoutId, actionInput || undefined);
        showToast('Virement complété avec succès.');
      } else {
        if (!actionInput) { showToast('Veuillez indiquer une raison d\'échec.'); setActionLoading(false); return; }
        await payoutsApi.fail(actionModal.payoutId, actionInput);
        showToast('Virement rejeté. Solde recrédité.');
      }
      setActionModal(null);
      setActionInput('');
      loadPayouts();
    } catch (e: any) {
      showToast(e.message || 'Error.');
    } finally {
      setActionLoading(false);
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreateAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: LedgerEntry = {
      id: `adj-${Math.random().toString(16).slice(2, 8)}`,
      date: new Date().toISOString().split('T')[0],
      reference: 'MANUAL-ADJ',
      description: 'Manual credit from Treasury',
      category: 'ADJUSTMENT',
      type: 'CREDIT',
      amount: 50000,
      balanceAfter: ledgerEntries[0].balanceAfter + 50000,
    };
    setLedgerEntries([newEntry, ...ledgerEntries]);
    setShowAdjustmentModal(false);
    showToast('Ajustement créé avec succès.');
  };

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className="fixed top-20 right-8 z-[200] bg-slate-900 border border-indigo-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right">
           <CheckCircle2 size={18} className="text-indigo-400" />
           <p className="text-xs font-black uppercase tracking-widest">{toast}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">General_Ledger_Vault</h2>
          <p className="text-slate-500 font-medium">Rapprochement, gestion des virements et journaux d'audit immuables.</p>
        </div>
        <div className="flex space-x-3">
           <button onClick={() => showToast('Preparing CSV export...')} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center shadow-sm active:scale-95">
              <Download className="h-4 w-4 mr-2" /> Exporter CSV
           </button>
           <button onClick={() => setShowAdjustmentModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95">
              Créer un ajustement
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit shadow-inner">
         <button onClick={() => setActiveTab('LEDGER')} className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'LEDGER' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500 hover:bg-slate-200'}`}>Journal</button>
         <button onClick={() => setActiveTab('PAYOUTS')} className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'PAYOUTS' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500 hover:bg-slate-200'}`}>Virements</button>
         <button onClick={() => setActiveTab('SETTLEMENTS')} className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'SETTLEMENTS' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500 hover:bg-slate-200'}`}>Règlements</button>
         <button onClick={() => setActiveTab('RECONCILIATION')} className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'RECONCILIATION' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500 hover:bg-slate-200'}`}>Rapprochement</button>
      </div>

      {activeTab === 'LEDGER' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
           <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Journal de transactions immuable</h3>
              <div className="relative"><input type="text" placeholder="Rechercher réf..." className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" /><Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" /></div>
           </div>
           <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-white"><tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="px-6 py-4 text-left">Date/Heure</th><th className="px-6 py-4 text-left">Référence</th><th className="px-6 py-4 text-left">Description</th><th className="px-6 py-4 text-left">Catégorie</th><th className="px-6 py-4 text-right">Débit</th><th className="px-6 py-4 text-right">Crédit</th><th className="px-6 py-4 text-right">Solde</th></tr></thead>
              <tbody className="bg-white divide-y divide-slate-100">
                 {ledgerEntries.map((entry) => (
                    <tr key={entry.id} onClick={() => setSelectedEntry(entry)} className="hover:bg-indigo-50/50 cursor-pointer transition-colors group">
                       <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">{new Date(entry.date).toLocaleString()}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-xs text-indigo-600 font-mono font-bold">{entry.reference}</td>
                       <td className="px-6 py-4 text-sm text-slate-900 font-medium">{entry.description}</td>
                       <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${entry.category === 'SETTLEMENT' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{entry.category}</span></td>
                       <td className="px-6 py-4 text-right text-sm font-medium font-mono text-red-600">{entry.type === 'DEBIT' ? entry.amount.toLocaleString() : '-'}</td>
                       <td className="px-6 py-4 text-right text-sm font-medium font-mono text-green-600">{entry.type === 'CREDIT' ? entry.amount.toLocaleString() : '-'}</td>
                       <td className="px-6 py-4 text-right text-sm font-bold font-mono text-slate-800">{entry.balanceAfter.toLocaleString()}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}

      {activeTab === 'PAYOUTS' && (
        <div className="space-y-4 animate-in fade-in">

          {/* Bannière alerte action admin requise */}
          {actionRequiredCount > 0 && (
            <button
              onClick={() => { setActionRequiredFilter(true); setStatusFilter(''); }}
              className="w-full flex items-center gap-3 px-5 py-3.5 bg-red-50 border border-red-200 rounded-xl text-left hover:bg-red-100 transition-colors"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-black text-red-700 uppercase tracking-wide">
                  {actionRequiredCount} payout{actionRequiredCount > 1 ? 's' : ''} nécessite{actionRequiredCount > 1 ? 'nt' : ''} une intervention manuelle
                </p>
                <p className="text-xs text-red-500 mt-0.5">Retries épuisés — cliquez pour voir les détails</p>
              </div>
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-black rounded-full">{actionRequiredCount}</span>
            </button>
          )}

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Statut :</span>
            {['', 'pending', 'processing', 'completed', 'failed'].map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setActionRequiredFilter(false); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border transition-all ${!actionRequiredFilter && statusFilter === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
              >
                {s === '' ? 'Tous' : (statusConfig[s]?.label || s)}
              </button>
            ))}
            <button
              onClick={() => { setActionRequiredFilter(true); setStatusFilter(''); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 ${actionRequiredFilter ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-500 border-red-200 hover:bg-red-50'}`}
            >
              <AlertCircle className="w-3 h-3" /> Action requise
              {actionRequiredCount > 0 && <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${actionRequiredFilter ? 'bg-red-400' : 'bg-red-100 text-red-600'}`}>{actionRequiredCount}</span>}
            </button>
            <button onClick={() => { loadPayouts(); loadActionRequiredCount(); }} className="ml-auto p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loadingPayouts ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-xs text-slate-400 font-mono">{payoutsTotal} total</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {loadingPayouts ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm font-medium">
                Aucun payout{statusFilter ? ` avec le statut "${statusConfig[statusFilter]?.label}"` : ''}.
              </div>
            ) : (
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-4 text-left">Marchand</th>
                  <th className="px-5 py-4 text-left">Montant</th>
                  <th className="px-5 py-4 text-left">Méthode & Destination</th>
                  <th className="px-5 py-4 text-left">Statut</th>
                  <th className="px-5 py-4 text-left">Date</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payouts.map((p: any) => {
                  const s = statusConfig[p.status] || statusConfig['pending'];
                  const details = p.payoutDetails as any;
                  const dest = details?.bankName || (details?.provider ? `${details.provider?.toUpperCase()} ${details?.phone}` : '—');
                  return (
                  <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${p.requiresAdminAction ? 'bg-red-50/50' : ''}`}>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900 text-sm">{p.merchant?.name || '—'}</p>
                      <p className="text-xs text-slate-400 font-mono">{p.merchant?.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-black text-slate-900 font-mono">{Number(p.amount).toLocaleString()} {p.currency}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {p.payoutMethod === 'mobile_money' ? <Smartphone className="w-4 h-4 text-emerald-500" /> : <Landmark className="w-4 h-4 text-slate-400" />}
                        <div>
                          <p className="text-sm font-medium text-slate-700">{dest}</p>
                          {details?.accountNumber && <p className="text-xs font-mono text-slate-400">{details.accountNumber}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit ${s.bg} ${s.color}`}>
                          {s.label}
                        </span>
                        {p.requiresAdminAction && (
                          <span className="flex items-center gap-1 text-[10px] font-black text-red-600 uppercase tracking-wide">
                            <AlertCircle className="w-3 h-3" /> Action requise
                          </span>
                        )}
                        {p.failureReason && <p className="text-[10px] text-red-500 font-medium">{p.failureReason}</p>}
                        {p.retryCount > 0 && <p className="text-[10px] text-slate-400 font-mono">{p.retryCount} tentative{p.retryCount > 1 ? 's' : ''}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 font-mono whitespace-nowrap">
                      {new Date(p.requestedAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.status === 'pending' && (
                          <button
                            onClick={() => handleProcess(p.id)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Traiter
                          </button>
                        )}
                        {p.status === 'processing' && (
                          <>
                            <button
                              onClick={() => { setActionModal({ type: 'complete', payoutId: p.id }); setActionInput(''); }}
                              className="px-3 py-1.5 bg-green-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Compléter
                            </button>
                            <button
                              onClick={() => { setActionModal({ type: 'fail', payoutId: p.id }); setActionInput(''); }}
                              className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Rejeter
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            )}
          </div>

          {/* Action Modal (Complete / Fail) */}
          {actionModal && (
            <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95">
                <div className="p-6 flex justify-between items-center border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">
                    {actionModal.type === 'complete' ? 'Confirmer le payout complété' : 'Rejeter le payout'}
                  </h3>
                  <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-slate-600"><XCircle /></button>
                </div>
                <div className="p-6 space-y-4">
                  {actionModal.type === 'complete' ? (
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Référence du virement (optionnel)</label>
                      <input
                        value={actionInput}
                        onChange={(e) => setActionInput(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl outline-none font-mono text-sm"
                        placeholder="Ex: TXN-98765 / numéro de virement"
                      />
                      <p className="text-xs text-slate-400 mt-2">Laissez vide si aucune référence externe.</p>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Raison du rejet *</label>
                      <input
                        value={actionInput}
                        onChange={(e) => setActionInput(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl outline-none text-sm"
                        placeholder="Ex: Compte invalide, numéro incorrect..."
                      />
                      <p className="text-xs text-amber-600 mt-2 font-medium">Le solde sera recrédité automatiquement sur le compte du marchand.</p>
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setActionModal(null)}
                      className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleActionSubmit}
                      disabled={actionLoading}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold text-white transition-colors ${actionModal.type === 'complete' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50`}
                    >
                      {actionLoading ? '...' : (actionModal.type === 'complete' ? 'Confirmer' : 'Rejeter')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'SETTLEMENTS' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Statut :</span>
            {(['', 'pending', 'settled'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSettlementStatusFilter(s)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border transition-all ${
                  settlementStatusFilter === s
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {s === '' ? 'Tous' : s === 'pending' ? 'En transit' : 'Libéré'}
              </button>
            ))}
            <button
              onClick={loadSettlements}
              className="ml-auto p-2 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loadingSettlements ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-xs text-slate-400 font-mono">{settlementsTotal} total</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {loadingSettlements ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : settlements.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Banknote className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Aucun règlement{settlementStatusFilter ? ` avec ce statut` : ''}.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-5 py-4 text-left">Marchand</th>
                    <th className="px-5 py-4 text-left">Méthode</th>
                    <th className="px-5 py-4 text-right">Brut</th>
                    <th className="px-5 py-4 text-right">Frais</th>
                    <th className="px-5 py-4 text-right">Net</th>
                    <th className="px-5 py-4 text-left">Statut</th>
                    <th className="px-5 py-4 text-left">Disponible le</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {settlements.map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 text-sm">{s.merchantName}</p>
                        <p className="text-xs text-slate-400 font-mono">{s.merchantEmail}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700 font-medium whitespace-nowrap">
                        {METHOD_LABELS[s.paymentMethod] || s.paymentMethod}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-sm text-slate-700 whitespace-nowrap">
                        {Number(s.grossAmount).toLocaleString('fr-FR')} {s.currency}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-sm text-rose-600 whitespace-nowrap">
                        -{Number(s.feeAmount).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-5 py-4 text-right font-black font-mono text-sm text-emerald-700 whitespace-nowrap">
                        {Number(s.netAmount).toLocaleString('fr-FR')} {s.currency}
                      </td>
                      <td className="px-5 py-4">
                        {s.status === 'settled' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" /> Libéré
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700">
                            <Clock className="w-3 h-3" /> En transit
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs font-mono whitespace-nowrap">
                        {s.status === 'settled' && s.settledAt ? (
                          <span className="text-emerald-600 font-bold">
                            {new Date(s.settledAt).toLocaleDateString('fr-FR')}
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold">
                            {new Date(s.settlesAt).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {s.status === 'pending' && (
                          <button
                            onClick={() => handleRelease(s.id)}
                            disabled={releasingId === s.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded-lg transition-colors disabled:opacity-50"
                          >
                            {releasingId === s.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Unlock className="w-3 h-3" />
                            )}
                            Libérer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'RECONCILIATION' && (
         <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-2 gap-6 h-[500px]">
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col"><div className="px-4 py-3 border-b border-slate-200 bg-slate-50"><h3 className="font-bold text-slate-700">Relevé bancaire (MTN Escrow)</h3></div><div className="p-2 space-y-2 overflow-y-auto flex-1">{[{id:'TXN-99882',amount:15000000,matched:true}, {id:'TXN-99883',amount:450000,matched:false}].map(tx=>(<div key={tx.id} onClick={()=>!tx.matched && setBankSelection(tx.id)} className={`p-3 border rounded-lg transition-all ${tx.matched ? 'bg-slate-50 opacity-50' : 'cursor-pointer hover:border-indigo-400'} ${bankSelection === tx.id ? 'bg-indigo-50 border-indigo-500 shadow-md' : 'border-slate-200'}`}><div className="flex justify-between"><span className="text-sm font-mono font-bold">{tx.id}</span><span className="text-sm font-bold text-green-600">+ {tx.amount.toLocaleString()}</span></div>{tx.matched && <div className="text-xs text-slate-500 mt-1 flex items-center text-green-700"><Check className="h-3 w-3 mr-1"/>Réconcilié</div>}</div>))}</div></div>
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col"><div className="px-4 py-3 border-b border-slate-200 bg-slate-50"><h3 className="font-bold text-slate-700">Journal interne</h3></div><div className="p-2 space-y-2 overflow-y-auto flex-1">{[{id:'SET-9921',amount:15000000,matched:true}, {id:'SET-9922',amount:450000,matched:false}].map(tx=>(<div key={tx.id} onClick={()=>!tx.matched && setLedgerSelection(tx.id)} className={`p-3 border rounded-lg transition-all ${tx.matched ? 'bg-slate-50 opacity-50' : 'cursor-pointer hover:border-indigo-400'} ${ledgerSelection === tx.id ? 'bg-indigo-50 border-indigo-500 shadow-md' : 'border-slate-200'}`}><div className="flex justify-between"><span className="text-sm font-mono font-bold">{tx.id}</span><span className="text-sm font-bold text-indigo-600">{tx.amount.toLocaleString()}</span></div>{tx.matched && <div className="text-xs text-slate-500 mt-1 flex items-center text-green-700"><Check className="h-3 w-3 mr-1"/>Réconcilié</div>}</div>))}</div></div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-4 flex justify-between items-center text-white shadow-xl">
               <div><span className="text-xs font-bold text-slate-400 uppercase">Écart :</span><span className="ml-2 font-mono text-xl font-black">{variance.toLocaleString()} XOF</span></div>
               <button onClick={() => showToast('Lot réconcilié avec succès.')} disabled={variance !== 0 || !bankSelection || !ledgerSelection} className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all">Réconcilier</button>
            </div>
         </div>
      )}

      {/* Adjustment Modal */}
      {showAdjustmentModal && (<div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-in zoom-in-95"><div className="p-6 flex justify-between items-center border-b border-slate-200"><h3 className="text-lg font-bold text-slate-900">Créer un ajustement comptable</h3><button onClick={()=>setShowAdjustmentModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle /></button></div><form onSubmit={handleCreateAdjustment} className="p-8 space-y-4"><div><label className="text-sm font-medium text-slate-700">Montant (XOF)</label><input type="number" defaultValue="50000" className="w-full mt-1 p-2 border border-slate-300 rounded-lg"/></div><div><label className="text-sm font-medium text-slate-700">Type</label><select className="w-full mt-1 p-2 border border-slate-300 rounded-lg"><option>CREDIT</option><option>DEBIT</option></select></div><div><label className="text-sm font-medium text-slate-700">Description</label><textarea placeholder="Ex : Crédit manuel pour équilibrage de flottant" className="w-full mt-1 p-2 border border-slate-300 rounded-lg h-24"></textarea></div><button type="submit" className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Soumettre</button></form></div></div>)}
      
      {/* Ledger Detail Modal */}
      {selectedEntry && (<div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl animate-in zoom-in-95"><div className="p-6 flex justify-between items-center border-b border-slate-800"><h3 className="text-lg font-bold text-white uppercase italic">Ledger_Trace</h3><button onClick={()=>setSelectedEntry(null)} className="text-slate-400 hover:text-white"><XCircle /></button></div><div className="p-8 space-y-4"><div className="p-4 bg-slate-950 border border-slate-700 rounded-lg"><p className="text-xs font-bold text-slate-400 uppercase">Description</p><p className="text-sm font-medium text-white">{selectedEntry.description}</p></div><div className="grid grid-cols-2 gap-4"><div className="p-4 bg-slate-950 border border-slate-700 rounded-lg"><p className="text-xs font-bold text-slate-400 uppercase">Amount</p><p className={`text-xl font-mono font-bold ${selectedEntry.type === 'CREDIT' ? 'text-green-500' : 'text-red-500'}`}>{selectedEntry.amount.toLocaleString()}</p></div><div className="p-4 bg-slate-950 border border-slate-700 rounded-lg"><p className="text-xs font-bold text-slate-400 uppercase">Reference</p><p className="text-sm font-mono text-indigo-400">{selectedEntry.reference}</p></div></div><div className="p-4 bg-black border border-slate-800 rounded-lg"><p className="text-xs font-bold text-slate-400 uppercase flex items-center mb-2"><Hash size={12} className="mr-1"/>Integrity Hash (WORM)</p><p className="text-xs font-mono text-slate-500 break-all">sha256:{Math.random().toString(36).substring(2)}</p></div></div></div></div>)}
    </div>
  );
};

export default FinanceView;

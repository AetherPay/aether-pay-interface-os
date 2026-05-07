import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, ArrowUpRight, CheckCircle2, Package, Star, Crown,
  X, AlertCircle, RefreshCw, Users, CreditCard,
  PauseCircle, PlayCircle, ChevronDown, Loader2,
  Zap, Shield, Globe, Box, Gem, Flame, Sparkles,
} from 'lucide-react';
import api from '../services/api';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface PlanData {
  id: string;
  name: string;
  slug: string;
  price: number;
  color: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
}

interface MerchantSubscription {
  id: string;
  planId: string;
  status: string;
  billingCycle: string;
  startDate: string;
  renewalDate: string | null;
}

interface MerchantRow {
  id: string;
  name: string;
  email: string;
  status: string;
  subscription: MerchantSubscription | null;
}

type ModalMode = 'change' | 'suspend' | 'activate' | null;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Package, Star, Crown, Zap, Shield, Globe, Box, Gem, Flame, Sparkles,
};

function getIcon(name: string): React.ElementType {
  return ICON_MAP[name] ?? Package;
}

function getPlanDisplayColors(color: string): { text: string; bg: string } {
  if (color.includes('sky') || color.includes('blue'))
    return { text: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-50 dark:bg-sky-900/20' };
  if (color.includes('indigo') || color.includes('primary') || color.includes('violet') || color.includes('purple'))
    return { text: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-500/20' };
  if (color.includes('amber') || color.includes('orange') || color.includes('yellow'))
    return { text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-500/20' };
  if (color.includes('emerald') || color.includes('green') || color.includes('teal'))
    return { text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-500/20' };
  if (color.includes('rose') || color.includes('red') || color.includes('pink'))
    return { text: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-500/20' };
  return { text: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-800/50' };
}

function formatRenewalDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const SUB_STATUS_CONFIG: Record<string, { dot: string; text: string; label: string }> = {
  active:    { dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', label: 'Actif'    },
  suspended: { dot: 'bg-rose-500',    text: 'text-rose-600 dark:text-rose-400',       label: 'Suspendu' },
  trial:     { dot: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400',     label: 'Essai'    },
  expired:   { dot: 'bg-slate-400',   text: 'text-slate-500 dark:text-slate-400',     label: 'Expiré'   },
  cancelled: { dot: 'bg-slate-400',   text: 'text-slate-500 dark:text-slate-400',     label: 'Annulé'   },
};

const SUSPEND_REASONS = [
  "Non-paiement",
  "Violation des conditions d'utilisation",
  "Activité suspecte / fraude",
  "Demande du marchand",
  "Contrôle de conformité (KYB/KYC)",
  "Autre",
];

// ─── Composant principal ───────────────────────────────────────────────────────
const MerchantPlansView: React.FC = () => {
  const [merchants, setMerchants]       = useState<MerchantRow[]>([]);
  const [plans, setPlans]               = useState<PlanData[]>([]);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const [search, setSearch]             = useState('');
  const [filterPlan, setFilterPlan]     = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal state
  const [modalMode, setModalMode]             = useState<ModalMode>(null);
  const [targetMerchant, setTargetMerchant]   = useState<MerchantRow | null>(null);
  const [selectedNewPlan, setSelectedNewPlan] = useState('');
  const [selectedBillingCycle, setSelectedBillingCycle] = useState('monthly');
  const [suspendReason, setSuspendReason]     = useState('');
  const [suspendNote, setSuspendNote]         = useState('');

  // Toast
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);
  const showToast = (msg: string, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch data ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [merchantsData, plansData] = await Promise.all([
        api.merchantSubscriptions.list(),
        api.plans.list(),
      ]);
      setMerchants(merchantsData);
      setPlans(plansData);
    } catch (e: any) {
      setError(e.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getPlan = (slug: string | null | undefined) =>
    plans.find(p => p.slug === slug) ?? null;

  const openModal = (merchant: MerchantRow, mode: ModalMode) => {
    setTargetMerchant(merchant);
    setSelectedNewPlan(merchant.subscription?.planId ?? '');
    setSelectedBillingCycle(merchant.subscription?.billingCycle ?? 'monthly');
    setSuspendReason('');
    setSuspendNote('');
    setModalMode(mode);
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleChangePlan = async () => {
    if (!targetMerchant || !selectedNewPlan) return;
    setActionLoading(true);
    try {
      await api.merchantSubscriptions.changePlan(
        targetMerchant.id, selectedNewPlan, selectedBillingCycle,
      );
      const plan = getPlan(selectedNewPlan);
      showToast(`Plan de ${targetMerchant.name} mis à jour → ${plan?.name ?? selectedNewPlan}`);
      setModalMode(null);
      await fetchData();
    } catch (e: any) {
      showToast(e.message || 'Erreur lors du changement de plan', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!targetMerchant || !suspendReason) return;
    setActionLoading(true);
    try {
      await api.merchantSubscriptions.suspend(targetMerchant.id, suspendReason, suspendNote || undefined);
      showToast(`Abonnement de ${targetMerchant.name} suspendu.`);
      setModalMode(null);
      await fetchData();
    } catch (e: any) {
      showToast(e.message || 'Erreur lors de la suspension', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!targetMerchant) return;
    setActionLoading(true);
    try {
      await api.merchantSubscriptions.activate(targetMerchant.id);
      showToast(`Abonnement de ${targetMerchant.name} réactivé.`);
      setModalMode(null);
      await fetchData();
    } catch (e: any) {
      showToast(e.message || 'Erreur lors de la réactivation', true);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Filtres ────────────────────────────────────────────────────────────────
  const filtered = merchants.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
      || m.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan   = filterPlan === 'all' || m.subscription?.planId === filterPlan;
    const matchStatus = filterStatus === 'all' || (m.subscription?.status ?? 'none') === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  const suspendedCount = merchants.filter(m => m.subscription?.status === 'suspended').length;

  // Count per plan
  const planCounts = plans.reduce((acc, p) => {
    acc[p.slug] = merchants.filter(m => m.subscription?.planId === p.slug).length;
    return acc;
  }, {} as Record<string, number>);

  // ── Loading / Error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm font-bold uppercase tracking-widest">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-rose-400">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm font-bold">{error}</p>
        <button onClick={fetchData} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 ${toast.error ? 'bg-rose-500' : 'bg-emerald-500'} text-white rounded-2xl shadow-2xl animate-in slide-in-from-top-2 duration-300 font-black text-sm`}>
          {toast.error ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/40">
              <CreditCard className="text-white h-4 w-4" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase">
              Merchant<span className="text-indigo-600 dark:text-indigo-400">.Plans</span>
            </h1>
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
            Plan Assignment · {merchants.length} marchands · {suspendedCount > 0 ? `${suspendedCount} suspendu${suspendedCount > 1 ? 's' : ''}` : 'Aucune suspension active'}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Rafraîchir
        </button>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-slate-400" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total marchands</p>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{merchants.length}</p>
        </div>
        {plans.slice(0, 3).map(plan => {
          const Icon = getIcon(plan.icon);
          const { text } = getPlanDisplayColors(plan.color);
          return (
            <div key={plan.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${text}`} />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{plan.name}</p>
              </div>
              <p className={`text-2xl font-black ${text}`}>{planCounts[plan.slug] ?? 0}</p>
            </div>
          );
        })}
      </div>

      {/* ── Filtres ── */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400"
            placeholder="Rechercher un marchand..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filtre plan — dynamique */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterPlan('all')}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filterPlan === 'all'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            Tous
          </button>
          {plans.map(plan => (
            <button key={plan.slug}
              onClick={() => setFilterPlan(plan.slug)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterPlan === plan.slug
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {plan.name}
            </button>
          ))}
        </div>

        {/* Filtre statut */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'suspended', 'trial'] as const).map(key => (
            <button key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterStatus === key
                  ? key === 'suspended' ? 'bg-rose-600 text-white shadow-lg' : key === 'trial' ? 'bg-amber-500 text-white shadow-lg' : key === 'active' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {key === 'all' ? 'Tous statuts' : SUB_STATUS_CONFIG[key]?.label ?? key}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <tr>
                {['Marchand', 'Plan', 'Statut', 'Renouvellement', 'Cycle', ''].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filtered.map(m => {
                const plan       = getPlan(m.subscription?.planId);
                const subStatus  = m.subscription?.status ?? 'none';
                const statusCfg  = SUB_STATUS_CONFIG[subStatus] ?? SUB_STATUS_CONFIG['expired'];
                const isSuspended = subStatus === 'suspended';
                const PlanIcon  = plan ? getIcon(plan.icon) : Package;
                const planColors = plan ? getPlanDisplayColors(plan.color) : { text: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800' };

                return (
                  <tr key={m.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group ${isSuspended ? 'opacity-70' : ''}`}>
                    {/* Marchand */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-700 dark:text-white font-black text-xs border border-slate-200 dark:border-slate-700 shrink-0">
                          {m.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">{m.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Plan */}
                    <td className="px-6 py-4">
                      {plan ? (
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${planColors.bg}`}>
                          <PlanIcon className={`w-3.5 h-3.5 ${planColors.text}`} />
                          <span className={`text-[10px] font-black uppercase tracking-wider ${planColors.text}`}>{plan.name}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">—</span>
                      )}
                    </td>
                    {/* Statut */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                        <span className={`text-[10px] font-black uppercase ${statusCfg.text}`}>{statusCfg.label}</span>
                      </div>
                    </td>
                    {/* Renouvellement */}
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-medium whitespace-nowrap">
                      {formatRenewalDate(m.subscription?.renewalDate)}
                    </td>
                    {/* Cycle */}
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-medium">
                      {m.subscription?.billingCycle === 'yearly' ? 'Annuel' : m.subscription?.billingCycle === 'monthly' ? 'Mensuel' : '—'}
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => openModal(m, 'change')}
                          className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 text-slate-500 dark:text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                          title="Changer de plan"
                        >
                          <ArrowUpRight className="w-3 h-3" /> Plan
                        </button>
                        {isSuspended ? (
                          <button
                            onClick={() => openModal(m, 'activate')}
                            className="flex items-center gap-1 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                          >
                            <PlayCircle className="w-3 h-3" /> Activer
                          </button>
                        ) : (
                          <button
                            onClick={() => openModal(m, 'suspend')}
                            className="flex items-center gap-1 px-3 py-2 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                          >
                            <PauseCircle className="w-3 h-3" /> Suspendre
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-bold text-sm">
                    Aucun marchand trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL CHANGER DE PLAN
      ══════════════════════════════════════════════════════════════════════════ */}
      {modalMode === 'change' && targetMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !actionLoading && setModalMode(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Changer de plan</h2>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{targetMerchant.name}</p>
              </div>
              <button onClick={() => !actionLoading && setModalMode(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {/* Plan selector */}
              {plans.map(plan => {
                const Icon = getIcon(plan.icon);
                const colors = getPlanDisplayColors(plan.color);
                const isSelected = selectedNewPlan === plan.slug;
                const isCurrent  = targetMerchant.subscription?.planId === plan.slug;
                return (
                  <button key={plan.slug} onClick={() => setSelectedNewPlan(plan.slug)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${colors.bg}`}><Icon className={`w-5 h-5 ${colors.text}`} /></div>
                    <div className="flex-1">
                      <p className={`text-sm font-black ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{plan.name}</p>
                      {isCurrent && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Plan actuel</p>}
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
                  </button>
                );
              })}

              {/* Billing cycle */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Cycle de facturation</label>
                <div className="flex gap-2">
                  {['monthly', 'yearly'].map(cycle => (
                    <button key={cycle}
                      onClick={() => setSelectedBillingCycle(cycle)}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                        selectedBillingCycle === cycle
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      {cycle === 'monthly' ? 'Mensuel' : 'Annuel'}
                    </button>
                  ))}
                </div>
              </div>

              {selectedNewPlan !== targetMerchant.subscription?.planId && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Ce changement prend effet immédiatement et met à jour les accès du marchand en temps réel.</p>
                </div>
              )}
            </div>
            <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button onClick={() => !actionLoading && setModalMode(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                Annuler
              </button>
              <button onClick={handleChangePlan}
                disabled={actionLoading || selectedNewPlan === targetMerchant.subscription?.planId}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL SUSPENSION
      ══════════════════════════════════════════════════════════════════════════ */}
      {modalMode === 'suspend' && targetMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !actionLoading && setModalMode(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-xl">
                  <PauseCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Suspendre le plan</h2>
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-0.5">
                    {targetMerchant.name} · {getPlan(targetMerchant.subscription?.planId)?.name ?? '—'}
                  </p>
                </div>
              </div>
              <button onClick={() => !actionLoading && setModalMode(null)} className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl">
                <X className="w-4 h-4 text-rose-400" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-700 dark:text-rose-300 font-medium leading-relaxed">
                  La suspension gèle immédiatement les accès du marchand. Le plan est conservé — la réactivation rétablit tous les droits sans perte de données.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  Motif de suspension <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={suspendReason}
                    onChange={e => setSuspendReason(e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-bold text-sm outline-none focus:border-rose-500 transition-colors appearance-none ${
                      !suspendReason ? 'border-slate-200 dark:border-slate-700' : 'border-rose-400 dark:border-rose-600'
                    }`}
                  >
                    <option value="">— Sélectionner un motif —</option>
                    {SUSPEND_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Note interne (optionnel)</label>
                <textarea
                  value={suspendNote}
                  onChange={e => setSuspendNote(e.target.value)}
                  rows={3}
                  placeholder="Contexte additionnel visible uniquement par l'équipe admin..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium outline-none focus:border-rose-500 transition-colors resize-none placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button onClick={() => !actionLoading && setModalMode(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                Annuler
              </button>
              <button onClick={handleSuspend} disabled={!suspendReason || actionLoading}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PauseCircle className="w-4 h-4" />}
                Suspendre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL RÉACTIVATION
      ══════════════════════════════════════════════════════════════════════════ */}
      {modalMode === 'activate' && targetMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !actionLoading && setModalMode(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
                  <PlayCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Réactiver le plan</h2>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                    {targetMerchant.name} · {getPlan(targetMerchant.subscription?.planId)?.name ?? '—'}
                  </p>
                </div>
              </div>
              <button onClick={() => !actionLoading && setModalMode(null)} className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl">
                <X className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
                  La réactivation rétablit immédiatement tous les accès du marchand correspondant à son plan <strong>{getPlan(targetMerchant.subscription?.planId)?.name ?? '—'}</strong>, sans perte de données ni de configuration.
                </p>
              </div>
            </div>
            <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button onClick={() => !actionLoading && setModalMode(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                Annuler
              </button>
              <button onClick={handleActivate} disabled={actionLoading}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                Réactiver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantPlansView;

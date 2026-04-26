import React, { useState } from 'react';
import {
  Search, ArrowUpRight, CheckCircle2, Package, Star, Crown,
  X, AlertCircle, RefreshCw, Users, CreditCard,
  PauseCircle, PlayCircle, ChevronDown, Loader2
} from 'lucide-react';
import { useApi, useMutation } from '../hooks/useApi';
import { subscriptionsAdminApi, plansApi, merchantsApi } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SubscriptionRow {
  id: string;
  merchantId: string;
  planId: string;
  status: string; // 'active' | 'suspended' | 'trial' | 'cancelled'
  billingCycle: string;
  currentPeriodEnd: string;
  suspendReason: string | null;
  createdAt: string;
  plan: { id: string; name: string; slug: string; price: number; currency: string };
  merchant: { id: string; name: string; email: string; status: string };
}

interface PlanOption {
  id: string;
  name: string;
  slug: string;
}

type ModalMode = 'change' | 'suspend' | 'activate' | null;

// ─── Config display ───────────────────────────────────────────────────────────
const PLANS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  standard: { label: 'Standard', color: 'text-sky-700 dark:text-sky-300',       bg: 'bg-sky-50 dark:bg-sky-900/20',       icon: Package },
  premium:  { label: 'Premium',  color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-500/20', icon: Star    },
  vip:      { label: 'VIP',      color: 'text-amber-700 dark:text-amber-300',   bg: 'bg-amber-50 dark:bg-amber-500/20',   icon: Crown   },
};

const STATUS_CONFIG: Record<string, { dot: string; text: string; label: string }> = {
  active:    { dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', label: 'Actif'    },
  suspended: { dot: 'bg-rose-500',    text: 'text-rose-600 dark:text-rose-400',       label: 'Suspendu' },
  trial:     { dot: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400',     label: 'Essai'    },
  cancelled: { dot: 'bg-slate-400',   text: 'text-slate-500 dark:text-slate-500',     label: 'Annulé'   },
};

const SUSPEND_REASONS = [
  'Non-paiement',
  "Violation des conditions d'utilisation",
  'Activité suspecte / fraude',
  'Demande du marchand',
  'Contrôle de conformité (KYB/KYC)',
  'Autre',
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl ${className}`} />
);

function formatDate(iso: string) {
  if (!iso || iso === '—') return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Composant principal ──────────────────────────────────────────────────────
const MerchantPlansView: React.FC = () => {
  const [search, setSearch]             = useState('');
  const [filterPlan, setFilterPlan]     = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [modalMode, setModalMode]       = useState<ModalMode>(null);
  const [targetSub, setTargetSub]       = useState<SubscriptionRow | null>(null);
  const [selectedNewPlanId, setSelectedNewPlanId] = useState('');
  const [suspendReason, setSuspendReason]         = useState('');
  const [suspendNote, setSuspendNote]             = useState('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch abonnements ─────────────────────────────────────────────────────
  const buildFilters = () => {
    const f: any = { limit: 100 };
    if (filterPlan !== 'all') {
      // on filtre par planId côté frontend car l'API filtre par planId UUID
    }
    if (filterStatus !== 'all') f.status = filterStatus.toLowerCase();
    if (search) f.search = search;
    return f;
  };

  const {
    data: subsData,
    loading: loadingSubs,
    error: errorSubs,
    refetch,
  } = useApi(
    () => subscriptionsAdminApi.list({ limit: 100 }),
    undefined,
    // redéclenche quand les filtres changent (on filtre en local pour la réactivité)
    [],
  );

  // ── Fetch plans disponibles (pour le modal changement) ────────────────────
  const { data: plansData } = useApi(() => plansApi.list() as Promise<PlanOption[]>);
  const planOptions: PlanOption[] = (plansData as any) ?? [];

  const rawSubs: SubscriptionRow[] = (subsData as any)?.data ?? [];

  // Filtre local (plus réactif que requêtes API à chaque frappe)
  const filtered = rawSubs.filter(s => {
    const matchSearch = !search || (
      s.merchant.name.toLowerCase().includes(search.toLowerCase()) ||
      s.merchant.email.toLowerCase().includes(search.toLowerCase())
    );
    const matchPlan   = filterPlan === 'all' || s.plan.slug === filterPlan;
    const matchStatus = filterStatus === 'all' || s.status === filterStatus.toLowerCase();
    return matchSearch && matchPlan && matchStatus;
  });

  // KPI counts
  const counts = ['standard', 'premium', 'vip'].reduce((acc, slug) => {
    acc[slug] = rawSubs.filter(s => s.plan.slug === slug).length;
    return acc;
  }, {} as Record<string, number>);
  const suspendedCount = rawSubs.filter(s => s.status === 'suspended').length;

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { mutate: changePlan, loading: changingPlan } = useMutation(
    ({ merchantId, planId }: { merchantId: string; planId: string }) =>
      subscriptionsAdminApi.changeMerchantPlan(merchantId, { planId }),
  );
  const { mutate: suspendPlan, loading: suspending } = useMutation(
    ({ merchantId, reason, note }: { merchantId: string; reason: string; note?: string }) =>
      subscriptionsAdminApi.suspendMerchantPlan(merchantId, { reason, note }),
  );
  const { mutate: activatePlan, loading: activating } = useMutation(
    (merchantId: string) => subscriptionsAdminApi.activateMerchantPlan(merchantId),
  );

  const isActioning = changingPlan || suspending || activating;

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openModal = (sub: SubscriptionRow, mode: ModalMode) => {
    setTargetSub(sub);
    setSelectedNewPlanId(sub.planId);
    setSuspendReason('');
    setSuspendNote('');
    setModalMode(mode);
  };
  const closeModal = () => { setModalMode(null); setTargetSub(null); };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChangePlan = async () => {
    if (!targetSub || !selectedNewPlanId || selectedNewPlanId === targetSub.planId) return;
    const result = await changePlan({ merchantId: targetSub.merchantId, planId: selectedNewPlanId });
    if (result) {
      showToast(`Plan de ${targetSub.merchant.name} mis à jour.`);
      closeModal();
      refetch();
    } else {
      showToast('Erreur lors du changement de plan.', false);
    }
  };

  const handleSuspend = async () => {
    if (!targetSub || !suspendReason) return;
    const result = await suspendPlan({
      merchantId: targetSub.merchantId,
      reason: suspendReason,
      note: suspendNote || undefined,
    });
    if (result) {
      showToast(`Plan de ${targetSub.merchant.name} suspendu.`);
      closeModal();
      refetch();
    } else {
      showToast('Erreur lors de la suspension.', false);
    }
  };

  const handleActivate = async () => {
    if (!targetSub) return;
    const result = await activatePlan(targetSub.merchantId);
    if (result) {
      showToast(`Plan de ${targetSub.merchant.name} réactivé.`);
      closeModal();
      refetch();
    } else {
      showToast('Erreur lors de la réactivation.', false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-2 duration-300 font-black text-sm text-white ${toast.ok ? 'bg-emerald-500' : 'bg-rose-600'}`}>
          {toast.ok ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
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
            Plan Assignment · {rawSubs.length} abonnements · {suspendedCount > 0 ? `${suspendedCount} suspendus` : 'Aucune suspension active'}
          </p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-all">
          <RefreshCw className={`w-3.5 h-3.5 ${loadingSubs ? 'animate-spin' : ''}`} /> Actualiser
        </button>
      </div>

      {/* Erreur */}
      {errorSubs && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">{errorSubs}</p>
          <button onClick={() => refetch()} className="ml-auto text-[10px] font-black text-rose-600 uppercase hover:underline">Réessayer</button>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-slate-400" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total abonnements</p>
          </div>
          {loadingSubs ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-black text-slate-900 dark:text-white">{rawSubs.length}</p>}
        </div>
        {['standard', 'premium', 'vip'].map(slug => {
          const cfg = PLANS_CONFIG[slug];
          const Icon = cfg.icon;
          return (
            <div key={slug} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${cfg.color}`} />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{cfg.label}</p>
              </div>
              {loadingSubs ? <Skeleton className="h-8 w-10" /> : <p className={`text-2xl font-black ${cfg.color}`}>{counts[slug] || 0}</p>}
            </div>
          );
        })}
      </div>

      {/* Filtres */}
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
        <div className="flex gap-2 flex-wrap">
          {(['all', 'standard', 'premium', 'vip'] as const).map(key => (
            <button key={key} onClick={() => setFilterPlan(key)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterPlan === key
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}>
              {key === 'all' ? 'Tous' : PLANS_CONFIG[key]?.label ?? key}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'suspended', 'trial', 'cancelled'] as const).map(key => (
            <button key={key} onClick={() => setFilterStatus(key)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterStatus === key
                  ? key === 'suspended' ? 'bg-rose-600 text-white'
                    : key === 'trial' ? 'bg-amber-500 text-white'
                    : key === 'cancelled' ? 'bg-slate-600 text-white'
                    : 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}>
              {key === 'all' ? 'Tous statuts' : STATUS_CONFIG[key]?.label ?? key}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <tr>
                {['Marchand', 'Plan', 'Statut', 'Renouvellement', ''].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {loadingSubs && rawSubs.length === 0 ? (
                [1, 2, 3, 4].map(i => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-10 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-7 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-32" /></td>
                  </tr>
                ))
              ) : filtered.map(sub => {
                const planCfg   = PLANS_CONFIG[sub.plan.slug] ?? PLANS_CONFIG['standard'];
                const statusCfg = STATUS_CONFIG[sub.status]   ?? STATUS_CONFIG['active'];
                const PlanIcon  = planCfg.icon;
                const isSuspended = sub.status === 'suspended';

                return (
                  <tr key={sub.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group ${isSuspended ? 'opacity-70' : ''}`}>
                    {/* Marchand */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-700 dark:text-white font-black text-xs border border-slate-200 dark:border-slate-700 shrink-0">
                          {sub.merchant.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">{sub.merchant.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{sub.merchant.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Plan */}
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${planCfg.bg}`}>
                        <PlanIcon className={`w-3.5 h-3.5 ${planCfg.color}`} />
                        <span className={`text-[10px] font-black uppercase tracking-wider ${planCfg.color}`}>{sub.plan.name}</span>
                      </div>
                    </td>
                    {/* Statut */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                        <span className={`text-[10px] font-black uppercase ${statusCfg.text}`}>{statusCfg.label}</span>
                      </div>
                      {isSuspended && sub.suspendReason && (
                        <p className="text-[9px] text-slate-400 mt-1 font-medium truncate max-w-[140px]" title={sub.suspendReason}>
                          {sub.suspendReason}
                        </p>
                      )}
                    </td>
                    {/* Renouvellement */}
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-medium whitespace-nowrap">
                      {sub.status === 'suspended' ? '—' : formatDate(sub.currentPeriodEnd)}
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openModal(sub, 'change')}
                          className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 text-slate-500 dark:text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                          <ArrowUpRight className="w-3 h-3" /> Plan
                        </button>
                        {isSuspended ? (
                          <button onClick={() => openModal(sub, 'activate')}
                            className="flex items-center gap-1 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                            <PlayCircle className="w-3 h-3" /> Activer
                          </button>
                        ) : (
                          <button onClick={() => openModal(sub, 'suspend')}
                            className="flex items-center gap-1 px-3 py-2 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                            <PauseCircle className="w-3 h-3" /> Suspendre
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loadingSubs && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-bold text-sm">Aucun abonnement trouvé.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ MODAL CHANGER DE PLAN ══════════════════════════════════════════════ */}
      {modalMode === 'change' && targetSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !isActioning && closeModal()} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Changer de plan</h2>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{targetSub.merchant.name}</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {planOptions.map((plan: PlanOption) => {
                const cfg = PLANS_CONFIG[plan.slug] ?? PLANS_CONFIG['standard'];
                const Icon = cfg.icon;
                const isSelected = selectedNewPlanId === plan.id;
                const isCurrent  = targetSub.planId === plan.id;
                return (
                  <button key={plan.id} onClick={() => setSelectedNewPlanId(plan.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}>
                    <div className={`p-2 rounded-xl ${cfg.bg}`}><Icon className={`w-5 h-5 ${cfg.color}`} /></div>
                    <div className="flex-1">
                      <p className={`text-sm font-black ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{plan.name}</p>
                      {isCurrent && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Plan actuel</p>}
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
                  </button>
                );
              })}
              {selectedNewPlanId !== targetSub.planId && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Changement immédiat — accès mis à jour en temps réel.</p>
                </div>
              )}
            </div>
            <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button onClick={closeModal} disabled={isActioning}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50">
                Annuler
              </button>
              <button onClick={handleChangePlan} disabled={isActioning || selectedNewPlanId === targetSub.planId}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2">
                {changingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {changingPlan ? 'En cours…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL SUSPENSION ══════════════════════════════════════════════════ */}
      {modalMode === 'suspend' && targetSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !isActioning && closeModal()} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-xl">
                  <PauseCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Suspendre le plan</h2>
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-0.5">{targetSub.merchant.name} · {targetSub.plan.name}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl">
                <X className="w-4 h-4 text-rose-400" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-700 dark:text-rose-300 font-medium leading-relaxed">
                  La suspension gèle immédiatement les accès. Le plan est conservé — la réactivation rétablit tout sans perte.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  Motif <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select value={suspendReason} onChange={e => setSuspendReason(e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-white font-bold text-sm outline-none focus:border-rose-500 transition-colors appearance-none ${!suspendReason ? 'border-slate-200 dark:border-slate-700' : 'border-rose-400 dark:border-rose-600'}`}>
                    <option value="">— Sélectionner un motif —</option>
                    {SUSPEND_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Note interne (optionnel)</label>
                <textarea value={suspendNote} onChange={e => setSuspendNote(e.target.value)} rows={3}
                  placeholder="Contexte visible uniquement par l'équipe admin..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium outline-none focus:border-rose-500 transition-colors resize-none placeholder:text-slate-400" />
              </div>
            </div>
            <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button onClick={closeModal} disabled={isActioning}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50">
                Annuler
              </button>
              <button onClick={handleSuspend} disabled={!suspendReason || isActioning}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2">
                {suspending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PauseCircle className="w-4 h-4" />}
                {suspending ? 'En cours…' : 'Suspendre'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL RÉACTIVATION ════════════════════════════════════════════════ */}
      {modalMode === 'activate' && targetSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !isActioning && closeModal()} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
                  <PlayCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Réactiver le plan</h2>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">{targetSub.merchant.name} · {targetSub.plan.name}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl">
                <X className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
                  La réactivation rétablit immédiatement tous les accès correspondant au plan <strong>{targetSub.plan.name}</strong>, sans perte de données.
                </p>
              </div>
            </div>
            <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button onClick={closeModal} disabled={isActioning}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50">
                Annuler
              </button>
              <button onClick={handleActivate} disabled={isActioning}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2">
                {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                {activating ? 'En cours…' : 'Réactiver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantPlansView;
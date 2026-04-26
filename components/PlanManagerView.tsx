import React, { useState } from 'react';
import {
  Plus, Edit2, Trash2, CheckCircle2, X,
  Star, Crown, Package, ToggleLeft, ToggleRight, Save,
  LayoutGrid, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';
import { useApi, useMutation } from '../hooks/useApi';
import { plansApi, CreatePlanPayload, UpdatePlanPayload } from '../services/api';

// ─── Types locaux ─────────────────────────────────────────────────────────────
interface PlanFeature { key: string; label: string; group: string; }

// Plan tel que retourné par le backend (+ _count injecté par Prisma)
interface ApiPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  billingCycle: string;
  features: string[];
  limits: { collaborators: number; transactions: number; links: number };
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: { subscriptions: number };
}

// Plan en cours d'édition dans le modal (état local)
interface EditingPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  features: string[];
  limits: { collaborators: number; transactions: number; links: number };
  isActive: boolean;
  sortOrder: number;
}

// ─── Catalogue features ───────────────────────────────────────────────────────
const ALL_FEATURES: PlanFeature[] = [
  { key: 'home',          label: "Vue d'ensemble",         group: 'Opérations'          },
  { key: 'transactions',  label: 'Transactions',            group: 'Opérations'          },
  { key: 'balances',      label: 'Soldes & Flux',           group: 'Opérations'          },
  { key: 'settlements',   label: 'Settlements',             group: 'Opérations'          },
  { key: 'linkpro',       label: 'AetherLink Pro',          group: 'Commerce Pro'        },
  { key: 'aethercard',    label: 'AetherCard',              group: 'Commerce Pro'        },
  { key: 'ussd',          label: 'USSD Gateway',            group: 'Commerce Pro'        },
  { key: 'subscriptions', label: 'Abonnements récurrents',  group: 'Commerce Pro'        },
  { key: 'payouts',       label: 'Retraits',                group: 'Finance & Compliance'},
  { key: 'billing',       label: 'Facturation',             group: 'Finance & Compliance'},
  { key: 'taxes',         label: 'Compliance KYB',          group: 'Finance & Compliance'},
  { key: 'forex',         label: 'Forex Pro Hub',           group: 'Finance & Compliance'},
  { key: 'insights',      label: 'Insights AI',             group: 'Finance & Compliance'},
  { key: 'developers',    label: 'Clés API',                group: 'Développeurs'        },
  { key: 'webhooks',      label: 'Webhooks',                group: 'Développeurs'        },
  { key: 'team',          label: "Gestion d'équipe",        group: 'Management'          },
  { key: 'fraud',         label: 'AetherShield (Fraude)',   group: 'Management'          },
  { key: 'bridge',        label: 'Bridge Stablecoins',      group: 'Avancé'              },
  { key: 'escrow',        label: 'Escrow / Jalons',         group: 'Avancé'              },
  { key: 'logistics',     label: 'Logistique',              group: 'Avancé'              },
];

const FEATURE_GROUPS = Array.from(new Set(ALL_FEATURES.map(f => f.group)));

// Gradient par slug — défini côté frontend uniquement (pas stocké en BDD)
const PLAN_COLOR: Record<string, string> = {
  standard: 'from-sky-600 to-blue-700',
  premium:  'from-indigo-500 to-indigo-600',
  vip:      'from-amber-500 to-orange-500',
};
const PLAN_ICON: Record<string, React.ElementType> = {
  standard: Package,
  premium:  Star,
  vip:      Crown,
};
const defaultColor = 'from-slate-500 to-slate-600';

const EMPTY_EDITING: EditingPlan = {
  id: '', name: '', slug: '', price: 0, currency: 'XOF',
  features: ['home', 'transactions', 'balances'],
  limits: { collaborators: 1, transactions: 500, links: 1 },
  isActive: true, sortOrder: 0,
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-slate-800/60 rounded-2xl ${className}`} />
);

// ─── Composant principal ──────────────────────────────────────────────────────
const PlanManagerView: React.FC = () => {
  const [editingPlan, setEditingPlan]   = useState<EditingPlan | null>(null);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data: rawPlans, loading, error, refetch } = useApi<ApiPlan[]>(
    () => plansApi.list() as Promise<ApiPlan[]>,
  );
  const plans: ApiPlan[] = rawPlans ?? [];

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { mutate: createPlan, loading: creating } = useMutation(
    (dto: CreatePlanPayload) => plansApi.create(dto),
  );
  const { mutate: updatePlan, loading: updating } = useMutation(
    ({ id, dto }: { id: string; dto: UpdatePlanPayload }) => plansApi.update(id, dto),
  );
  const { mutate: deletePlan, loading: deleting } = useMutation(
    (id: string) => plansApi.delete(id),
  );

  const isSaving = creating || updating;

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingPlan({ ...EMPTY_EDITING });
    setIsModalOpen(true);
  };

  const openEdit = (plan: ApiPlan) => {
    setEditingPlan({
      id:       plan.id,
      name:     plan.name,
      slug:     plan.slug,
      price:    Number(plan.price),
      currency: plan.currency,
      features: [...plan.features],
      limits:   { ...plan.limits },
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingPlan(null); };

  const toggleFeature = (key: string) => {
    if (!editingPlan) return;
    const has = editingPlan.features.includes(key);
    setEditingPlan({
      ...editingPlan,
      features: has
        ? editingPlan.features.filter(f => f !== key)
        : [...editingPlan.features, key],
    });
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!editingPlan || !editingPlan.name.trim()) return;

    const payload = {
      name:      editingPlan.name,
      slug:      editingPlan.id ? undefined : editingPlan.slug || editingPlan.name.toLowerCase().replace(/\s+/g, '-'),
      price:     editingPlan.price,
      currency:  editingPlan.currency,
      features:  editingPlan.features,
      limits:    editingPlan.limits,
      isActive:  editingPlan.isActive,
      sortOrder: editingPlan.sortOrder,
    };

    let result: any = null;

    if (editingPlan.id) {
      result = await updatePlan({ id: editingPlan.id, dto: payload as UpdatePlanPayload });
    } else {
      result = await createPlan({ ...payload, slug: payload.slug! } as CreatePlanPayload);
    }

    if (result) {
      showToast(editingPlan.id ? 'Plan mis à jour avec succès.' : 'Plan déployé avec succès.');
      closeModal();
      refetch();
    } else {
      showToast('Une erreur est survenue.', false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const result = await deletePlan(id);
    if (result !== null) {
      showToast('Plan supprimé.');
      setDeleteConfirm(null);
      refetch();
    } else {
      showToast('Suppression impossible (marchands actifs sur ce plan).', false);
      setDeleteConfirm(null);
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
              <LayoutGrid className="text-white h-4 w-4" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase">
              Plans<span className="text-indigo-600 dark:text-indigo-400">.Manager</span>
            </h1>
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
            Subscription Engine · {plans.length} plans · {plans.filter(p => p.isActive).length} actifs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()} className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all" title="Rafraîchir">
            <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/40 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Nouveau Plan
          </button>
        </div>
      </div>

      {/* Erreur API */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">{error}</p>
          <button onClick={() => refetch()} className="ml-auto text-[10px] font-black text-rose-600 uppercase hover:underline">Réessayer</button>
        </div>
      )}

      {/* Grille */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && plans.length === 0 ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-80" />)
        ) : (
          plans.map(plan => {
            const color = PLAN_COLOR[plan.slug] ?? defaultColor;
            const Icon  = PLAN_ICON[plan.slug] ?? Package;
            const merchantCount = plan._count?.subscriptions ?? 0;

            return (
              <div key={plan.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl transition-all group">
                {/* Header gradient */}
                <div className={`p-6 bg-gradient-to-br ${color} relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }} />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-5 h-5 text-white/80" />
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${plan.isActive ? 'bg-white/20 text-white' : 'bg-black/20 text-white/60'}`}>
                          {plan.isActive ? 'ACTIF' : 'INACTIF'}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                      <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">{merchantCount} marchands</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-white">
                        {Number(plan.price) === 0 ? 'Gratuit' : Number(plan.price).toLocaleString()}
                      </p>
                      {Number(plan.price) > 0 && <p className="text-white/60 text-[10px] font-bold uppercase">{plan.currency} / mois</p>}
                    </div>
                  </div>
                </div>

                {/* Corps */}
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      {plan.features.length} / {ALL_FEATURES.length} fonctionnalités
                    </p>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                      <div className={`h-full bg-gradient-to-r ${color}`} style={{ width: `${(plan.features.length / ALL_FEATURES.length) * 100}%` }} />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.features.slice(0, 8).map(fKey => {
                        const feat = ALL_FEATURES.find(f => f.key === fKey);
                        return feat ? (
                          <span key={fKey} className="text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg">
                            {feat.label}
                          </span>
                        ) : null;
                      })}
                      {plan.features.length > 8 && (
                        <span className="text-[9px] font-black uppercase bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg">
                          +{plan.features.length - 8} autres
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {[
                      { label: 'Collabs',   val: plan.limits.collaborators >= 999999 ? '∞' : plan.limits.collaborators },
                      { label: 'Txns/mois', val: plan.limits.transactions  >= 999999 ? '∞' : plan.limits.transactions.toLocaleString() },
                      { label: 'Liens',     val: plan.limits.links         >= 999    ? '∞' : plan.limits.links },
                    ].map((l, i) => (
                      <div key={i} className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{l.val}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{l.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => openEdit(plan)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                      <Edit2 className="w-3.5 h-3.5" /> Éditer
                    </button>
                    {deleteConfirm === plan.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(plan.id)} disabled={deleting}
                          className="px-3 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1">
                          {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Confirmer
                        </button>
                        <button onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-xl transition-all">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(plan.id)}
                        disabled={merchantCount > 0}
                        className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title={merchantCount > 0 ? `${merchantCount} marchands actifs` : 'Supprimer'}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {merchantCount > 0 && deleteConfirm !== plan.id && (
                    <p className="text-[9px] text-slate-400 text-center font-bold">Suppression désactivée — {merchantCount} marchands</p>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Carte créer */}
        {!loading && (
          <button onClick={openCreate}
            className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-900 rounded-3xl flex flex-col items-center justify-center gap-4 p-12 transition-all group min-h-[300px]">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 flex items-center justify-center transition-all">
              <Plus className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 uppercase tracking-widest transition-colors">Créer un plan</p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Configurez un nouveau niveau d'abonnement</p>
            </div>
          </button>
        )}
      </div>

      {/* ── Modal Création / Édition ── */}
      {isModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !isSaving && closeModal()} />
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  {editingPlan.id ? 'Éditer le plan' : 'Nouveau plan'}
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Configurez les accès et les limites</p>
              </div>
              <button onClick={() => !isSaving && closeModal()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-8 space-y-8 custom-scrollbar">

              {/* Infos de base */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nom du plan *</label>
                  <input type="text"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-sm outline-none focus:border-indigo-500 transition-colors"
                    value={editingPlan.name}
                    onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    placeholder="Ex: Premium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Prix (XOF / mois)</label>
                  <input type="number" min={0}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-sm outline-none focus:border-indigo-500 transition-colors"
                    value={editingPlan.price}
                    onChange={e => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                  />
                </div>
                {/* Slug — visible uniquement en création */}
                {!editingPlan.id && (
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Slug (identifiant unique)
                      <span className="ml-2 text-slate-400 normal-case font-medium">— auto-généré si vide</span>
                    </label>
                    <input type="text"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-sm outline-none focus:border-indigo-500 transition-colors font-mono"
                      value={editingPlan.slug}
                      onChange={e => setEditingPlan({ ...editingPlan, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="ex: premium-annuel"
                    />
                  </div>
                )}
              </div>

              {/* Limites */}
              <div>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Limites quantitatives</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: 'collaborators', label: 'Collaborateurs max' },
                    { key: 'transactions',  label: 'Transactions / mois' },
                    { key: 'links',         label: 'Liens de paiement' },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                      <input type="number" min={0}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-sm outline-none focus:border-indigo-500 transition-colors"
                        value={(editingPlan.limits as any)[key]}
                        onChange={e => setEditingPlan({ ...editingPlan, limits: { ...editingPlan.limits, [key]: Number(e.target.value) } })}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">Astuce : utilisez 999999 pour les limites illimitées (∞).</p>
              </div>

              {/* Features */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Fonctionnalités incluses</p>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingPlan({ ...editingPlan, features: ALL_FEATURES.map(f => f.key) })}
                      className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg transition-all">
                      Tout sélectionner
                    </button>
                    <button onClick={() => setEditingPlan({ ...editingPlan, features: [] })}
                      className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg transition-all">
                      Tout vider
                    </button>
                  </div>
                </div>
                <div className="space-y-6">
                  {FEATURE_GROUPS.map(group => (
                    <div key={group}>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />{group}<span className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {ALL_FEATURES.filter(f => f.group === group).map(feat => {
                          const isSelected = editingPlan.features.includes(feat.key);
                          return (
                            <button key={feat.key} onClick={() => toggleFeature(feat.key)}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300'
                                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-300'
                              }`}>
                              <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </div>
                              <span className="text-[11px] font-bold uppercase tracking-wide">{feat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggle actif */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">Plan actif</p>
                  <p className="text-[10px] text-slate-500 font-medium">Visible et sélectionnable par les marchands</p>
                </div>
                <button onClick={() => setEditingPlan({ ...editingPlan, isActive: !editingPlan.isActive })}>
                  {editingPlan.isActive
                    ? <ToggleRight className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                    : <ToggleLeft className="w-8 h-8 text-slate-400 dark:text-slate-600" />}
                </button>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 shrink-0 flex gap-3">
              <button onClick={closeModal} disabled={isSaving}
                className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50">
                Annuler
              </button>
              <button onClick={handleSave} disabled={isSaving || !editingPlan.name.trim()}
                className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/40">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'En cours…' : editingPlan.id ? 'Enregistrer' : 'Déployer le plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManagerView;
import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, CheckCircle2, X,
  Star, Crown, Package, ToggleLeft, ToggleRight, Save,
  LayoutGrid, Lock, Globe, Users, Loader2, Search,
} from 'lucide-react';
import { api } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PlanFeature { key: string; label: string; group: string; }

interface Plan {
  id: string; name: string; slug: string;
  price: number; currency: string;
  color: string; icon: string;
  features: string[]; billingCycles: string[];
  limitCollabs: number; limitTxns: number; limitLinks: number;
  visibility: 'public' | 'private';
  isActive: boolean; sortOrder: number;
  merchantCount: number; merchantIds: string[];
}

interface PlanForm {
  id: string; name: string; slug: string;
  price: number; currency: string;
  color: string; icon: string;
  features: string[]; billingCycles: string[];
  limitCollabs: number; limitTxns: number; limitLinks: number;
  visibility: 'public' | 'private';
  isActive: boolean; sortOrder: number;
  merchantIds: string[];
}

// ─── Catalogue features ───────────────────────────────────────────────────────
const ALL_FEATURES: PlanFeature[] = [
  { key: 'home',          label: "Vue d'ensemble",         group: 'Opérations' },
  { key: 'transactions',  label: 'Transactions',            group: 'Opérations' },
  { key: 'balances',      label: 'Soldes & Flux',           group: 'Opérations' },
  { key: 'settlements',   label: 'Settlements',             group: 'Opérations' },
  { key: 'linkpro',       label: 'AetherLink Pro',          group: 'Commerce Pro' },
  { key: 'aethercard',    label: 'AetherCard',              group: 'Commerce Pro' },
  { key: 'ussd',          label: 'USSD Gateway',            group: 'Commerce Pro' },
  { key: 'subscriptions', label: 'Abonnements récurrents',  group: 'Commerce Pro' },
  { key: 'payouts',       label: 'Retraits',                group: 'Finance & Compliance' },
  { key: 'billing',       label: 'Facturation',             group: 'Finance & Compliance' },
  { key: 'taxes',         label: 'Compliance KYB',          group: 'Finance & Compliance' },
  { key: 'forex',         label: 'Forex Pro Hub',           group: 'Finance & Compliance' },
  { key: 'insights',      label: 'Insights AI',             group: 'Finance & Compliance' },
  { key: 'developers',    label: 'Clés API',                group: 'Développeurs' },
  { key: 'webhooks',      label: 'Webhooks',                group: 'Développeurs' },
  { key: 'team',          label: "Gestion d'équipe",        group: 'Management' },
  { key: 'fraud',         label: 'AetherShield (Fraude)',   group: 'Management' },
  { key: 'bridge',        label: 'Bridge Stablecoins',      group: 'Avancé' },
  { key: 'escrow',        label: 'Escrow / Jalons',         group: 'Avancé' },
  { key: 'logistics',     label: 'Logistique',              group: 'Avancé' },
];

const FEATURE_GROUPS = Array.from(new Set(ALL_FEATURES.map(f => f.group)));

const COLOR_OPTIONS = [
  { label: 'Sky → Blue',    value: 'from-sky-600 to-blue-700'      },
  { label: 'Indigo',        value: 'from-indigo-500 to-indigo-600' },
  { label: 'Amber → Orange',value: 'from-amber-500 to-orange-500'  },
  { label: 'Emerald',       value: 'from-emerald-500 to-teal-600'  },
  { label: 'Rose',          value: 'from-rose-500 to-pink-600'     },
  { label: 'Violet',        value: 'from-violet-500 to-purple-600' },
];

const EMPTY_FORM: PlanForm = {
  id: '', name: '', slug: '', price: 0, currency: 'XOF',
  color: 'from-indigo-500 to-indigo-600', icon: 'Star',
  features: ['home', 'transactions', 'balances'],
  billingCycles: ['monthly'],
  limitCollabs: 1, limitTxns: 500, limitLinks: 1,
  visibility: 'public', isActive: true, sortOrder: 0,
  merchantIds: [],
};

// ─── Composant ────────────────────────────────────────────────────────────────
const PlanManagerView: React.FC = () => {
  const [plans, setPlans]               = useState<Plan[]>([]);
  const [merchants, setMerchants]       = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [editingPlan, setEditingPlan]   = useState<PlanForm | null>(null);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [merchantSearch, setMerchantSearch] = useState('');

  // ── Fetch plans ────────────────────────────────────────────────────────────
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.plans.list();
      setPlans(data ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch merchants pour le sélecteur plans privés
  const fetchMerchants = useCallback(async () => {
    try {
      const data = await api.merchants.list({ limit: 200 });
      setMerchants(Array.isArray(data) ? data : (data as any)?.merchants ?? []);
    } catch { /* silencieux */ }
  }, []);

  useEffect(() => {
    fetchPlans();
    fetchMerchants();
  }, [fetchPlans, fetchMerchants]);

  // ── Modal ──────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingPlan({ ...EMPTY_FORM });
    setIsModalOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan({
      id: plan.id, name: plan.name, slug: plan.slug,
      price: plan.price, currency: plan.currency,
      color: plan.color, icon: plan.icon,
      features: [...plan.features],
      billingCycles: [...(plan.billingCycles ?? ['monthly'])],
      limitCollabs: plan.limitCollabs, limitTxns: plan.limitTxns, limitLinks: plan.limitLinks,
      visibility: plan.visibility, isActive: plan.isActive, sortOrder: plan.sortOrder,
      merchantIds: [...(plan.merchantIds ?? [])],
    });
    setIsModalOpen(true);
  };

  const toggleFeature = (key: string) => {
    if (!editingPlan) return;
    const has = editingPlan.features.includes(key);
    setEditingPlan({
      ...editingPlan,
      features: has ? editingPlan.features.filter(f => f !== key) : [...editingPlan.features, key],
    });
  };

  const toggleBillingCycle = (cycle: string) => {
    if (!editingPlan) return;
    const has = editingPlan.billingCycles.includes(cycle);
    setEditingPlan({
      ...editingPlan,
      billingCycles: has
        ? editingPlan.billingCycles.filter(c => c !== cycle)
        : [...editingPlan.billingCycles, cycle],
    });
  };

  const toggleMerchant = (merchantId: string) => {
    if (!editingPlan) return;
    const has = editingPlan.merchantIds.includes(merchantId);
    setEditingPlan({
      ...editingPlan,
      merchantIds: has
        ? editingPlan.merchantIds.filter(id => id !== merchantId)
        : [...editingPlan.merchantIds, merchantId],
    });
  };

  const handleSave = async () => {
    if (!editingPlan) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: editingPlan.name,
        slug: editingPlan.slug,
        price: Number(editingPlan.price),
        currency: editingPlan.currency,
        color: editingPlan.color,
        icon: editingPlan.icon,
        features: editingPlan.features,
        billingCycles: editingPlan.billingCycles,
        limitCollabs: editingPlan.limitCollabs,
        limitTxns: editingPlan.limitTxns,
        limitLinks: editingPlan.limitLinks,
        visibility: editingPlan.visibility,
        isActive: editingPlan.isActive,
        sortOrder: editingPlan.sortOrder,
        merchantIds: editingPlan.visibility === 'private' ? editingPlan.merchantIds : [],
      };

      if (editingPlan.id) {
        await api.plans.update(editingPlan.id, payload);
      } else {
        await api.plans.create(payload);
      }

      setIsModalOpen(false);
      setEditingPlan(null);
      await fetchPlans();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.plans.delete(id);
      setDeleteConfirm(null);
      await fetchPlans();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la suppression.');
      setDeleteConfirm(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Header ── */}
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
            Subscription Engine · {plans.length} plans configurés · {plans.filter(p => p.isActive).length} actifs
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/40 active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Nouveau Plan
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-medium">
          {error}
        </div>
      )}

      {/* ── Grille des plans ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl transition-all group">
              <div className={`p-6 bg-gradient-to-br ${plan.color} relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }} />
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${plan.isActive ? 'bg-white/20 text-white' : 'bg-black/20 text-white/60'}`}>
                        {plan.isActive ? 'ACTIF' : 'INACTIF'}
                      </span>
                      {plan.visibility === 'private' && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-black/20 text-white/80">
                          <Lock className="w-2.5 h-2.5" /> Privé
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">{plan.merchantCount} marchands</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-white">{plan.price === 0 ? 'Gratuit' : Number(plan.price).toLocaleString()}</p>
                    {plan.price > 0 && <p className="text-white/60 text-[10px] font-bold uppercase">{plan.currency} / mois</p>}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    {plan.features.length} / {ALL_FEATURES.length} fonctionnalités
                  </p>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div className={`h-full bg-gradient-to-r ${plan.color}`} style={{ width: `${(plan.features.length / ALL_FEATURES.length) * 100}%` }} />
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
                    { label: 'Collabs',    val: plan.limitCollabs >= 999999 ? '∞' : plan.limitCollabs },
                    { label: 'Txns/mois',  val: plan.limitTxns    >= 999999 ? '∞' : plan.limitTxns.toLocaleString() },
                    { label: 'Liens',      val: plan.limitLinks   >= 999    ? '∞' : plan.limitLinks },
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
                      <button onClick={() => handleDelete(plan.id)} className="px-3 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase transition-all">Confirmer</button>
                      <button onClick={() => setDeleteConfirm(null)} className="px-3 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-xl transition-all"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(plan.id)}
                      disabled={plan.merchantCount > 0}
                      className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {plan.merchantCount > 0 && deleteConfirm !== plan.id && (
                  <p className="text-[9px] text-slate-400 text-center font-bold">Suppression désactivée — {plan.merchantCount} marchands actifs</p>
                )}
              </div>
            </div>
          ))}

          {/* Créer un plan */}
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
        </div>
      )}

      {/* ── Modal ── */}
      {isModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">{editingPlan.id ? 'Éditer le plan' : 'Nouveau plan'}</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Configurez les accès et les limites</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-8 space-y-8 custom-scrollbar">

              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Infos de base */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Nom du plan', key: 'name', type: 'text', placeholder: 'Ex: Enterprise' },
                  { label: 'Slug (identifiant unique)', key: 'slug', type: 'text', placeholder: 'ex: enterprise' },
                  { label: 'Prix (XOF / mois)', key: 'price', type: 'number', placeholder: '0' },
                  { label: 'Ordre d\'affichage', key: 'sortOrder', type: 'number', placeholder: '0' },
                ].map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{field.label}</label>
                    <input
                      type={field.type}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-sm outline-none focus:border-indigo-500 transition-colors"
                      value={(editingPlan as any)[field.key]}
                      onChange={e => setEditingPlan({ ...editingPlan, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                      placeholder={field.placeholder}
                      disabled={field.key === 'slug' && !!editingPlan.id}
                    />
                  </div>
                ))}
              </div>

              {/* Couleur */}
              <div>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Couleur du plan</p>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setEditingPlan({ ...editingPlan, color: opt.value })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black uppercase transition-all ${editingPlan.color === opt.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                      <div className={`w-4 h-4 rounded-md bg-gradient-to-br ${opt.value}`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cycles de facturation */}
              <div>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Cycles de facturation</p>
                <div className="flex gap-3">
                  {['monthly', 'yearly'].map(cycle => (
                    <button key={cycle} onClick={() => toggleBillingCycle(cycle)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        editingPlan.billingCycles.includes(cycle)
                          ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}>
                      <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center ${editingPlan.billingCycles.includes(cycle) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                        {editingPlan.billingCycles.includes(cycle) && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      {cycle === 'monthly' ? 'Mensuel' : 'Annuel'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Limites */}
              <div>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Limites quantitatives</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: 'limitCollabs', label: 'Collaborateurs max' },
                    { key: 'limitTxns',    label: 'Transactions / mois' },
                    { key: 'limitLinks',   label: 'Liens de paiement' },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                      <input type="number"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-sm outline-none focus:border-indigo-500 transition-colors"
                        value={(editingPlan as any)[key]}
                        onChange={e => setEditingPlan({ ...editingPlan, [key]: Number(e.target.value) })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Fonctionnalités incluses</p>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingPlan({ ...editingPlan, features: ALL_FEATURES.map(f => f.key) })}
                      className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                      Tout sélectionner
                    </button>
                    <button onClick={() => setEditingPlan({ ...editingPlan, features: [] })}
                      className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
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
                                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                              }`}>
                              <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
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

              {/* Visibilité */}
              <div>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Visibilité</p>
                <div className="flex gap-3">
                  {[
                    { value: 'public',  label: 'Public', icon: Globe, desc: 'Visible par tous les marchands' },
                    { value: 'private', label: 'Privé',  icon: Lock,  desc: 'Visible par les marchands sélectionnés uniquement' },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => setEditingPlan({ ...editingPlan, visibility: opt.value as any })}
                      className={`flex-1 flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                        editingPlan.visibility === opt.value
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                      }`}>
                      <opt.icon className={`w-4 h-4 mt-0.5 shrink-0 ${editingPlan.visibility === opt.value ? 'text-indigo-500' : 'text-slate-400'}`} />
                      <div>
                        <p className={`text-xs font-black uppercase tracking-widest ${editingPlan.visibility === opt.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>{opt.label}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Sélecteur marchands pour plans privés */}
                {editingPlan.visibility === 'private' && (
                  <div className="mt-4">
                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                      <Users className="w-3.5 h-3.5" /> Marchands autorisés ({editingPlan.merchantIds.length})
                    </p>
                    {merchants.length === 0 ? (
                      <p className="text-xs text-slate-400 font-medium py-4 text-center">Aucun marchand disponible.</p>
                    ) : (
                      <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                        {/* Barre de recherche */}
                        <div className="relative border-b border-slate-200 dark:border-slate-700">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Rechercher un marchand..."
                            value={merchantSearch}
                            onChange={e => setMerchantSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium outline-none placeholder:text-slate-400"
                          />
                        </div>
                        {/* Liste filtrée */}
                        <div className="max-h-48 overflow-y-auto space-y-1 p-2">
                          {merchants
                            .filter((m: any) =>
                              m.name.toLowerCase().includes(merchantSearch.toLowerCase()) ||
                              m.email.toLowerCase().includes(merchantSearch.toLowerCase())
                            )
                            .map((m: any) => {
                              const isSelected = editingPlan.merchantIds.includes(m.id);
                              return (
                                <button key={m.id} onClick={() => toggleMerchant(m.id)}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                                    isSelected
                                      ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30'
                                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                                  }`}>
                                  <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                    {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{m.name}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{m.email}</p>
                                  </div>
                                </button>
                              );
                            })}
                          {merchants.filter((m: any) =>
                            m.name.toLowerCase().includes(merchantSearch.toLowerCase()) ||
                            m.email.toLowerCase().includes(merchantSearch.toLowerCase())
                          ).length === 0 && (
                            <p className="text-xs text-slate-400 text-center py-4 font-medium">Aucun résultat pour "{merchantSearch}"</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
              <button onClick={() => setIsModalOpen(false)} disabled={saving}
                className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/40 disabled:opacity-70">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingPlan.id ? 'Enregistrer les modifications' : 'Déployer le plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManagerView;

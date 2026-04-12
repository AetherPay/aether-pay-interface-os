import React, { useState } from 'react';
import {
  Search, ArrowUpRight, CheckCircle2, Package, Star, Crown,
  X, AlertCircle, RefreshCw, Users, CreditCard,
  PauseCircle, PlayCircle, ChevronDown
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MerchantRow {
  id: string; name: string; email: string; country: string;
  currentPlan: string; planStatus: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
  joinedAt: string; monthlyVolume: number; collaborators: number;
  renewalDate: string;
}

type ModalMode = 'change' | 'suspend' | 'activate' | null;

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_MERCHANTS: MerchantRow[] = [
  { id: 'm1', name: 'Diallo Commerce',     email: 'admin@diallo.sn',        country: 'SN', currentPlan: 'standard', planStatus: 'ACTIVE',    status: 'ACTIVE',    joinedAt: '12 Jan 2024',  monthlyVolume: 1200000,  collaborators: 1,  renewalDate: '01 Fév 2026' },
  { id: 'm2', name: 'TechHub Abidjan',     email: 'ops@techhub.ci',         country: 'CI', currentPlan: 'premium',  planStatus: 'ACTIVE',    status: 'ACTIVE',    joinedAt: '03 Mar 2024',  monthlyVolume: 8400000,  collaborators: 4,  renewalDate: '03 Avr 2026' },
  { id: 'm3', name: 'Kigali Fresh Foods',  email: 'finance@kigalifresh.rw', country: 'RW', currentPlan: 'vip',      planStatus: 'ACTIVE',    status: 'ACTIVE',    joinedAt: '19 Nov 2023',  monthlyVolume: 42000000, collaborators: 11, renewalDate: '19 Déc 2025' },
  { id: 'm4', name: 'Lomé Auto Parts',     email: 'contact@lomeauto.tg',    country: 'TG', currentPlan: 'standard', planStatus: 'TRIAL',     status: 'TRIAL',     joinedAt: '01 Juil 2024', monthlyVolume: 340000,   collaborators: 0,  renewalDate: '15 Juil 2026' },
  { id: 'm5', name: 'Global Export Group', email: 'ceo@globalexport.ng',    country: 'NG', currentPlan: 'premium',  planStatus: 'SUSPENDED', status: 'SUSPENDED', joinedAt: '22 Avr 2024',  monthlyVolume: 0,        collaborators: 3,  renewalDate: '—' },
  { id: 'm6', name: 'Bamako Digital',      email: 'hello@bamako.ml',        country: 'ML', currentPlan: 'standard', planStatus: 'ACTIVE',    status: 'ACTIVE',    joinedAt: '08 Fév 2024',  monthlyVolume: 2100000,  collaborators: 1,  renewalDate: '08 Mar 2026' },
  { id: 'm7', name: 'Douala Logistics',    email: 'ops@doualal.cm',         country: 'CM', currentPlan: 'premium',  planStatus: 'ACTIVE',    status: 'ACTIVE',    joinedAt: '14 Mai 2024',  monthlyVolume: 15000000, collaborators: 7,  renewalDate: '14 Jun 2026' },
  { id: 'm8', name: 'Nairobi Fintech Ltd', email: 'cto@nairobi.ke',         country: 'KE', currentPlan: 'vip',      planStatus: 'ACTIVE',    status: 'ACTIVE',    joinedAt: '29 Oct 2023',  monthlyVolume: 98000000, collaborators: 18, renewalDate: '29 Nov 2025' },
];

// ─── Config plans ─────────────────────────────────────────────────────────────
const PLANS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  standard: { label: 'Standard', color: 'text-sky-700 dark:text-sky-300',       bg: 'bg-sky-50 dark:bg-sky-900/20',       icon: Package },
  premium:  { label: 'Premium',  color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-500/20', icon: Star    },
  vip:      { label: 'VIP',      color: 'text-amber-700 dark:text-amber-300',   bg: 'bg-amber-50 dark:bg-amber-500/20',   icon: Crown   },
};

const PLAN_STATUS_CONFIG: Record<string, { dot: string; text: string; label: string }> = {
  ACTIVE:    { dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', label: 'Actif'    },
  SUSPENDED: { dot: 'bg-rose-500',    text: 'text-rose-600 dark:text-rose-400',       label: 'Suspendu' },
  TRIAL:     { dot: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400',     label: 'Essai'    },
};

const SUSPEND_REASONS = [
  'Non-paiement',
  'Violation des conditions d\'utilisation',
  'Activité suspecte / fraude',
  'Demande du marchand',
  'Contrôle de conformité (KYB/KYC)',
  'Autre',
];

// ─── Composant principal ──────────────────────────────────────────────────────
const MerchantPlansView: React.FC = () => {
  const [merchants, setMerchants]       = useState<MerchantRow[]>(MOCK_MERCHANTS);
  const [search, setSearch]             = useState('');
  const [filterPlan, setFilterPlan]     = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal state
  const [modalMode, setModalMode]       = useState<ModalMode>(null);
  const [targetMerchant, setTargetMerchant] = useState<MerchantRow | null>(null);
  const [selectedNewPlan, setSelectedNewPlan] = useState('');
  const [suspendReason, setSuspendReason]     = useState('');
  const [suspendNote, setSuspendNote]         = useState('');

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // ── Actions ──────────────────────────────────────────────────────────────────
  const openModal = (merchant: MerchantRow, mode: ModalMode) => {
    setTargetMerchant(merchant);
    setSelectedNewPlan(merchant.currentPlan);
    setSuspendReason('');
    setSuspendNote('');
    setModalMode(mode);
  };

  const handleChangePlan = () => {
    if (!targetMerchant || !selectedNewPlan) return;
    setMerchants(prev => prev.map(m => m.id === targetMerchant.id ? { ...m, currentPlan: selectedNewPlan } : m));
    showToast(`Plan de ${targetMerchant.name} mis à jour → ${PLANS_CONFIG[selectedNewPlan].label}`);
    setModalMode(null);
  };

  const handleSuspend = () => {
    if (!targetMerchant || !suspendReason) return;
    setMerchants(prev => prev.map(m => m.id === targetMerchant.id ? { ...m, planStatus: 'SUSPENDED' } : m));
    showToast(`Plan de ${targetMerchant.name} suspendu.`);
    setModalMode(null);
  };

  const handleActivate = () => {
    if (!targetMerchant) return;
    setMerchants(prev => prev.map(m => m.id === targetMerchant.id ? { ...m, planStatus: 'ACTIVE' } : m));
    showToast(`Plan de ${targetMerchant.name} réactivé.`);
    setModalMode(null);
  };

  // ── Filtres ──────────────────────────────────────────────────────────────────
  const filtered = merchants.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan   = filterPlan === 'all'   || m.currentPlan === filterPlan;
    const matchStatus = filterStatus === 'all' || m.planStatus === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  const counts = Object.keys(PLANS_CONFIG).reduce((acc, key) => {
    acc[key] = merchants.filter(m => m.currentPlan === key).length;
    return acc;
  }, {} as Record<string, number>);

  const suspendedCount = merchants.filter(m => m.planStatus === 'SUSPENDED').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 bg-emerald-500 text-white rounded-2xl shadow-2xl animate-in slide-in-from-top-2 duration-300 font-black text-sm">
          <CheckCircle2 className="w-5 h-5" /> {toast}
        </div>
      )}

      {/* ── Header style OPS ── */}
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
            Plan Assignment · {merchants.length} marchands · {suspendedCount > 0 ? `${suspendedCount} suspendus` : 'Aucune suspension active'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <RefreshCw className="w-3.5 h-3.5" /> Live sync
        </div>
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
        {Object.entries(PLANS_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={key} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${cfg.color}`} />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{cfg.label}</p>
              </div>
              <p className={`text-2xl font-black ${cfg.color}`}>{counts[key] || 0}</p>
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

        {/* Filtre plan */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'standard', 'premium', 'vip'] as const).map(key => (
            <button key={key}
              onClick={() => setFilterPlan(key)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterPlan === key
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {key === 'all' ? 'Tous' : PLANS_CONFIG[key].label}
            </button>
          ))}
        </div>

        {/* Filtre statut plan */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'ACTIVE', 'SUSPENDED', 'TRIAL'] as const).map(key => (
            <button key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterStatus === key
                  ? key === 'SUSPENDED' ? 'bg-rose-600 text-white' : key === 'TRIAL' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
              } ${filterStatus !== key ? '' : 'shadow-lg'}`}
            >
              {key === 'all' ? 'Tous statuts' : PLAN_STATUS_CONFIG[key]?.label ?? key}
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
                {['Marchand', 'Plan', 'Statut plan', 'Volume / mois', 'Renouvellement', 'Collabs', ''].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filtered.map(m => {
                const planCfg   = PLANS_CONFIG[m.currentPlan];
                const statusCfg = PLAN_STATUS_CONFIG[m.planStatus];
                const PlanIcon  = planCfg.icon;
                const isSuspended = m.planStatus === 'SUSPENDED';
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
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${planCfg.bg}`}>
                        <PlanIcon className={`w-3.5 h-3.5 ${planCfg.color}`} />
                        <span className={`text-[10px] font-black uppercase tracking-wider ${planCfg.color}`}>{planCfg.label}</span>
                      </div>
                    </td>
                    {/* Statut plan */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot} ${isSuspended ? '' : 'shadow-[0_0_6px_currentColor]'}`} />
                        <span className={`text-[10px] font-black uppercase ${statusCfg.text}`}>{statusCfg.label}</span>
                      </div>
                    </td>
                    {/* Volume */}
                    <td className="px-6 py-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {m.monthlyVolume === 0 ? '—' : `${(m.monthlyVolume / 1000000).toFixed(1)}M XOF`}
                    </td>
                    {/* Renouvellement */}
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-medium whitespace-nowrap">{m.renewalDate}</td>
                    {/* Collabs */}
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-bold text-center">{m.collaborators}</td>
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        {/* Changer de plan */}
                        <button
                          onClick={() => openModal(m, 'change')}
                          className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 text-slate-500 dark:text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                          title="Changer de plan"
                        >
                          <ArrowUpRight className="w-3 h-3" /> Plan
                        </button>
                        {/* Suspendre / Réactiver */}
                        {isSuspended ? (
                          <button
                            onClick={() => openModal(m, 'activate')}
                            className="flex items-center gap-1 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                            title="Réactiver le plan"
                          >
                            <PlayCircle className="w-3 h-3" /> Activer
                          </button>
                        ) : (
                          <button
                            onClick={() => openModal(m, 'suspend')}
                            className="flex items-center gap-1 px-3 py-2 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                            title="Suspendre le plan"
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
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400 font-bold text-sm">Aucun marchand trouvé.</td>
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
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalMode(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Changer de plan</h2>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{targetMerchant.name}</p>
              </div>
              <button onClick={() => setModalMode(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {Object.entries(PLANS_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const isSelected = selectedNewPlan === key;
                const isCurrent  = targetMerchant.currentPlan === key;
                return (
                  <button key={key} onClick={() => setSelectedNewPlan(key)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${cfg.bg}`}><Icon className={`w-5 h-5 ${cfg.color}`} /></div>
                    <div className="flex-1">
                      <p className={`text-sm font-black ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{cfg.label}</p>
                      {isCurrent && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Plan actuel</p>}
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
                  </button>
                );
              })}
              {selectedNewPlan !== targetMerchant.currentPlan && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Ce changement prend effet immédiatement et met à jour les accès du marchand en temps réel.</p>
                </div>
              )}
            </div>
            <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button onClick={() => setModalMode(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                Annuler
              </button>
              <button onClick={handleChangePlan} disabled={selectedNewPlan === targetMerchant.currentPlan}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/40">
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
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalMode(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header rouge */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-xl">
                  <PauseCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Suspendre le plan</h2>
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-0.5">{targetMerchant.name} · {PLANS_CONFIG[targetMerchant.currentPlan].label}</p>
                </div>
              </div>
              <button onClick={() => setModalMode(null)} className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl">
                <X className="w-4 h-4 text-rose-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Avertissement */}
              <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-700 dark:text-rose-300 font-medium leading-relaxed">
                  La suspension gèle immédiatement les accès du marchand. Le plan est conservé — la réactivation rétablit tous les droits sans perte de données.
                </p>
              </div>

              {/* Motif — obligatoire */}
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

              {/* Note optionnelle */}
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
              <button onClick={() => setModalMode(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                Annuler
              </button>
              <button onClick={handleSuspend} disabled={!suspendReason}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2">
                <PauseCircle className="w-4 h-4" /> Suspendre
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
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalMode(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
                  <PlayCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Réactiver le plan</h2>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">{targetMerchant.name} · {PLANS_CONFIG[targetMerchant.currentPlan].label}</p>
                </div>
              </div>
              <button onClick={() => setModalMode(null)} className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl">
                <X className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
                  La réactivation rétablit immédiatement tous les accès du marchand correspondant à son plan <strong>{PLANS_CONFIG[targetMerchant.currentPlan].label}</strong>, sans perte de données ni de configuration.
                </p>
              </div>
            </div>
            <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button onClick={() => setModalMode(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                Annuler
              </button>
              <button onClick={handleActivate}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2">
                <PlayCircle className="w-4 h-4" /> Réactiver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantPlansView;
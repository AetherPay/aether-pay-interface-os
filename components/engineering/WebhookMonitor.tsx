import React, { useState, useEffect } from 'react';
import { Radio, RefreshCw, History, CheckCircle2, Zap } from 'lucide-react';
import { webhooksApi } from '../../services/api';

interface RealWebhookEvent {
  id: string;
  eventType: string;
  status: string;
  attempts: number;
  lastAttempt: string | null;
  nextRetry: string | null;
  createdAt: string;
  siteId: string;
  siteName: string;
  webhookUrl: string | null;
  merchantId: string;
  merchantName: string;
}

const WEBHOOK_STATUS_META: Record<string, { label: string; cls: string }> = {
  delivered: { label: 'Livré',      cls: 'bg-green-50 text-green-600' },
  failed:    { label: 'Échec',      cls: 'bg-red-50 text-red-600 animate-pulse' },
  pending:   { label: 'En attente', cls: 'bg-amber-50 text-amber-600' },
};

const WebhookMonitor: React.FC = () => {
  const [webhooks, setWebhooks] = useState<RealWebhookEvent[]>([]);
  const [webhooksTotal, setWebhooksTotal] = useState(0);
  const [webhooksLoading, setWebhooksLoading] = useState(false);
  const [webhooksError, setWebhooksError] = useState<string | null>(null);
  const [webhookStatusFilter, setWebhookStatusFilter] = useState('');
  const [replayingId, setReplayingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadWebhooks();
  }, [webhookStatusFilter]);

  const loadWebhooks = async () => {
    setWebhooksLoading(true);
    setWebhooksError(null);
    try {
      const res = await webhooksApi.list({ status: webhookStatusFilter || undefined, limit: 50 });
      setWebhooks(res.events ?? []);
      setWebhooksTotal(res.total ?? 0);
    } catch (err) {
      setWebhooksError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setWebhooksLoading(false);
    }
  };

  const handleReplay = async (id: string) => {
    setReplayingId(id);
    try {
      await webhooksApi.replay(id);
      triggerToast(`Webhook ${id.slice(0, 8)}… rejoué avec succès.`);
      await loadWebhooks();
    } catch (err) {
      triggerToast(`Échec du replay : ${err instanceof Error ? err.message : 'Erreur'}`);
    } finally {
      setReplayingId(null);
    }
  };

  return (
    <>
      {toast && (
        <div className="fixed top-24 right-8 z-[500] bg-slate-950 border border-indigo-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right backdrop-blur-xl border-l-4 border-l-indigo-600">
          <Zap size={14} className="text-indigo-400 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-widest italic">{toast}</p>
        </div>
      )}
      <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-wrap gap-3 justify-between items-center">
            <div className="flex items-center gap-3">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic flex items-center gap-2">
                <Radio size={14} className="text-indigo-500 animate-pulse" /> Outbound Dispatch Trace
              </h3>
              <span className="text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {webhooksTotal} événement{webhooksTotal !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={webhookStatusFilter}
                onChange={(e) => setWebhookStatusFilter(e.target.value)}
                className="text-[10px] font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none uppercase"
              >
                <option value="">Tous</option>
                <option value="failed">Échecs</option>
                <option value="delivered">Livrés</option>
                <option value="pending">En attente</option>
              </select>
              <button
                onClick={loadWebhooks}
                className="p-2 text-slate-400 hover:text-indigo-600 transition-all"
              >
                <RefreshCw size={14} className={webhooksLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {webhooksError && (
            <div className="p-6 text-center">
              <p className="text-xs text-red-500 font-mono mb-3">{webhooksError}</p>
              <button onClick={loadWebhooks} className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl">
                Réessayer
              </button>
            </div>
          )}

          {!webhooksError && (
            <table className="w-full text-left">
              <thead className="bg-white dark:bg-slate-900">
                <tr className="text-[9px] font-black text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Marchand / Site</th>
                  <th className="px-6 py-4">Événement paiement</th>
                  <th className="px-6 py-4">Envoi webhook</th>
                  <th className="px-6 py-4 text-center">Tentatives</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Replay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {webhooksLoading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-slate-400">
                      <RefreshCw size={16} className="animate-spin mx-auto mb-2" />
                      Chargement...
                    </td>
                  </tr>
                )}
                {!webhooksLoading && webhooks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <CheckCircle2 size={32} className="mx-auto text-green-500 mb-3 opacity-50" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Aucun événement webhook
                      </p>
                    </td>
                  </tr>
                )}
                {!webhooksLoading && webhooks.map((evt) => {
                  const statusMeta = WEBHOOK_STATUS_META[evt.status] ?? { label: evt.status, cls: 'bg-slate-100 text-slate-500' };
                  const paymentOk = evt.eventType.includes('completed');
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{evt.merchantName}</p>
                        <p className="text-[9px] font-mono text-indigo-400">{evt.siteName}</p>
                        <p className="text-[8px] text-slate-400 truncate max-w-[180px] mt-0.5">{evt.webhookUrl ?? '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${paymentOk ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                          {evt.eventType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${statusMeta.cls}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-xs font-black italic ${evt.attempts > 1 ? 'text-amber-500' : 'text-slate-400'}`}>
                          #{evt.attempts}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[9px] font-mono text-slate-400">
                        {new Date(evt.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleReplay(evt.id)}
                          disabled={replayingId === evt.id || evt.status === 'delivered'}
                          title={evt.status === 'delivered' ? 'Déjà livré' : 'Rejouer'}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {replayingId === evt.id
                            ? <RefreshCw size={14} className="animate-spin" />
                            : <History size={14} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default WebhookMonitor;

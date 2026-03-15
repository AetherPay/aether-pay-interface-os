
import React, { useState } from 'react';
import { 
  Map, Package, Server, AlertTriangle, CheckCircle, Truck, Sliders, Zap, 
  Search, Globe, ShieldAlert, History, Activity, ExternalLink, RefreshCw, 
  Navigation, CheckCircle2, MoreHorizontal, Clock, ArrowRight, BarChart3,
  Box, MapPin, Gauge
} from 'lucide-react';
import { mockLogisticsPartners, mockLogisticsIncidents } from '../services/mockData';
import { ViewState, LogisticsPartner, LogisticsIncident } from '../types';

interface AetherShipViewProps {
  currentView: ViewState;
}

const AetherShipView: React.FC<AetherShipViewProps> = ({ currentView }) => {
  const [partners, setPartners] = useState<LogisticsPartner[]>(mockLogisticsPartners);
  const [incidents, setIncidents] = useState<LogisticsIncident[]>(mockLogisticsIncidents);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const DeliveryDashboard = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
             { label: 'Active Shipments', value: '1,402', change: '+12%', trend: 'up', color: 'text-indigo-600', icon: Box },
             { label: 'Avg Delivery Time', value: '1.8 Days', change: '-4h', trend: 'up', color: 'text-green-600', icon: Clock },
             { label: 'Critical Incidents', value: '14', change: '+2', trend: 'down', color: 'text-red-600', icon: ShieldAlert },
             { label: 'Partner Efficiency', value: '94.2%', change: '+1.5%', trend: 'up', color: 'text-indigo-600', icon: Gauge },
          ].map(stat => (
             <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-1">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                   <stat.icon size={14} className="text-slate-300" />
                </div>
                <div className="flex items-end gap-2">
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">{stat.value}</h3>
                   <span className={`text-[10px] font-bold mb-1 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>{stat.change}</span>
                </div>
             </div>
          ))}
       </div>

       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic flex items-center gap-2">
                <Truck size={14} className="text-indigo-500" /> Live Delivery Dispatch
             </h3>
             <div className="flex gap-2">
                <div className="relative">
                   <input type="text" placeholder="Tracking ID..." className="pl-8 pr-3 py-1.5 text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none" />
                   <Search className="absolute left-2.5 top-2 h-3 w-3 text-slate-400" />
                </div>
             </div>
          </div>
          <table className="w-full text-left">
             <thead className="bg-white dark:bg-slate-900"><tr className="text-[9px] font-black text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800"><th className="px-6 py-4">Tracking Node</th><th className="px-6 py-4">Beneficiary</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-center">Partner</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                   { id: 'AWB-9910', merchant: 'Uber Africa', status: 'IN_TRANSIT', partner: 'DHL', location: 'Dakar Hub' },
                   { id: 'AWB-9911', merchant: 'Jumia CI', status: 'OUT_FOR_DELIVERY', partner: 'Paps', location: 'Abidjan Plateau' },
                   { id: 'AWB-9912', merchant: 'Boutique Alpha', status: 'DELIVERED', partner: 'Bolloré', location: 'Lagos Island' },
                ].map(item => (
                   <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                         <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{item.id}</p>
                         <p className="text-[9px] font-mono text-indigo-400 uppercase">Last Ping: 2m ago</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-xs text-slate-500 uppercase">{item.merchant}</td>
                      <td className="px-6 py-4">
                         <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            item.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600'
                         }`}>{item.status.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="px-6 py-4 text-center"><span className="text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{item.partner}</span></td>
                      <td className="px-6 py-4 text-right">
                         <button onClick={() => showToast(`Tracing ${item.id}...`)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-all"><Navigation size={16}/></button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  const DeliveryHeatmap = () => (
    <div className="space-y-6 animate-in zoom-in-95 duration-500">
       <div className="bg-slate-950 rounded-[40px] border border-slate-800 h-[600px] relative overflow-hidden shadow-2xl flex flex-col items-center justify-center p-12 text-center">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}></div>
          <div className="relative z-10">
             <div className="h-32 w-32 bg-indigo-600 rounded-[40px] flex items-center justify-center text-white shadow-[0_0_60px_rgba(99,102,241,0.5)] mx-auto mb-10 animate-pulse-slow">
                <MapPin size={60} />
             </div>
             <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-6">Geospatial Logistics Matrix</h3>
             <p className="text-slate-400 text-sm max-w-lg mx-auto font-medium mb-12 leading-relaxed">Visualizing live distribution density across 14 African shipping corridors. Node health: NOMINAL.</p>
             
             <div className="flex gap-4 justify-center">
                {['Dakar', 'Abidjan', 'Lagos', 'Accra'].map(city => (
                   <div key={city} className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-3xl text-white">
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">{city}</p>
                      <p className="text-xl font-black italic tracking-tighter">{(Math.random() * 100).toFixed(0)}% Load</p>
                   </div>
                ))}
             </div>
          </div>
          <div className="absolute bottom-8 left-8 flex gap-6 text-white text-[9px] font-black uppercase tracking-widest">
             <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500"></span> Overloaded</div>
             <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500"></span> Optimal</div>
             <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-500"></span> Stable</div>
          </div>
       </div>
    </div>
  );

  const PartnerIntegrations = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-500">
       {partners.map(p => (
          <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[32px] group hover:shadow-xl transition-all relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <Globe size={150} />
             </div>
             <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-xl text-indigo-600 italic">
                   {p.name.charAt(0)}
                </div>
                <div className="flex flex-col items-end">
                   <div className="flex items-center h-4 relative mb-1 gap-2">
                      <span className={`text-[8px] font-black uppercase ${p.status === 'CONNECTED' ? 'text-green-500' : 'text-amber-500'}`}>{p.status}</span>
                      <span className="relative flex h-2 w-2">
                         <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${p.status === 'CONNECTED' ? 'bg-green-400' : 'bg-amber-400'}`}></span>
                         <span className={`relative inline-flex rounded-full h-2 w-2 ${p.status === 'CONNECTED' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                      </span>
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest">API Health: {p.apiHealth}%</p>
                </div>
             </div>
             
             <div className="mb-10 relative z-10">
                <h3 className="text-2xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter mb-2">{p.name}</h3>
                <div className="flex flex-wrap gap-2">
                   {p.coverage.map(c => <span key={c} className="text-[9px] font-black bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 px-2 py-0.5 rounded uppercase tracking-widest">{c}</span>)}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 border-t border-slate-50 dark:border-slate-800 pt-8 relative z-10">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Active Queue</p>
                   <p className="text-lg font-black italic text-slate-900 dark:text-white">{p.activeDeliveries.toLocaleString()}</p>
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Avg SLA</p>
                   <p className="text-lg font-black italic text-slate-900 dark:text-white">{p.avgDeliveryTime}</p>
                </div>
             </div>

             <button onClick={() => showToast(`Opening API controls for ${p.id}...`)} className="w-full mt-8 py-4 bg-slate-950 text-white text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all">
                <RefreshCw size={14} /> Synchronize Endpoints
             </button>
          </div>
       ))}
    </div>
  );

  const LogisticsIncidents = () => (
    <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
       <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-6 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg">
                <ShieldAlert size={20} />
             </div>
             <div>
                <h4 className="text-sm font-black text-red-900 dark:text-red-400 uppercase italic">Exception Alert Matrix</h4>
                <p className="text-[10px] font-bold text-red-700 dark:text-red-500 uppercase tracking-widest mt-1">3 Critical delivery failures requiring manual intervention.</p>
             </div>
          </div>
          <button className="px-6 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-red-700 transition-all active:scale-95">Triage All</button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {incidents.map(inc => (
             <div key={inc.id} className={`bg-white dark:bg-slate-900 border ${inc.severity === 'CRITICAL' ? 'border-red-500 border-l-8' : 'border-slate-200 dark:border-slate-800'} p-6 rounded-3xl shadow-sm group hover:shadow-lg transition-all`}>
                <div className="flex justify-between items-start mb-6">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black font-mono text-indigo-500">{inc.id}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">{inc.timestamp}</span>
                   </div>
                   <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      inc.status === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                   }`}>{inc.status}</span>
                </div>
                <h3 className="text-base font-black italic uppercase tracking-tight text-slate-900 dark:text-white mb-2">{inc.type.replace(/_/g, ' ')}</h3>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl mb-8">
                   <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest italic">Merchant: {inc.merchantName}</p>
                   <p className="text-xs font-bold text-slate-700 dark:text-slate-300 italic line-clamp-3 leading-relaxed">"{inc.description}"</p>
                </div>
                <div className="flex items-center justify-between mb-8">
                   <span className="text-[9px] font-black text-slate-400 uppercase">Tracking ID</span>
                   <span className="text-xs font-mono font-bold text-indigo-600">{inc.trackingId}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => showToast(`Escalating ${inc.id}...`)} className="py-3 bg-slate-900 dark:bg-slate-800 text-white text-[9px] font-black uppercase rounded-xl hover:bg-black transition-all">Escalate</button>
                   <button onClick={() => showToast(`Reviewing dispatch for ${inc.id}...`)} className="py-3 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                      <ExternalLink size={12} /> Resolve
                   </button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  return (
    <div className="relative min-h-[85vh]">
       {toast && (
        <div className="fixed top-24 right-8 z-[500] bg-slate-950 border border-indigo-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right backdrop-blur-xl">
           <Zap size={14} className="text-indigo-400 animate-pulse" />
           <p className="text-[10px] font-black uppercase tracking-widest italic">{toast}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-indigo-600 rounded-xl shadow-lg">
                <Truck className="text-white h-4 w-4" />
             </div>
             <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase">
                   Logistics<span className="text-indigo-600">.Center</span>
                </h1>
             </div>
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Last Mile Infrastructure • Monitoring Active</p>
        </div>
      </div>

      <div className="relative">
         {currentView === 'SHIP_DASHBOARD' && <DeliveryDashboard />}
         {currentView === 'SHIP_HEATMAP' && <DeliveryHeatmap />}
         {currentView === 'SHIP_PARTNERS' && <PartnerIntegrations />}
         {currentView === 'SHIP_INCIDENTS' && <LogisticsIncidents />}
      </div>
    </div>
  );
};

export default AetherShipView;

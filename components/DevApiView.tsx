import React, { useState } from 'react';
import { 
  Server, Activity, Zap, Terminal, GitBranch, Cpu, Database, 
  Search, ShieldCheck, Play, Power, Rocket, RefreshCw, BarChart3, Globe,
  CheckCircle2, AlertTriangle, XCircle, MoreHorizontal, Clock, Filter,
  History, Hash, ExternalLink, Code, Radio
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { mockServices, chartData, mockDeployments, mockWebhookLogs } from '../services/mockData';
import { Service, WebhookLog, Deployment } from '../types';

interface DevApiViewProps {
  currentView: any;
}

const DevApiView: React.FC<DevApiViewProps> = ({ currentView }) => {
  const [toast, setToast] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>(mockServices);
  const [webhooks, setWebhooks] = useState<WebhookLog[]>(mockWebhookLogs);
  const [deployments, setDeployments] = useState<Deployment[]>(mockDeployments);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const ServiceGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
       {services.map(svc => (
          <div key={svc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[32px] group hover:shadow-xl transition-all relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <Cpu size={150} />
             </div>
             
             <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-500">
                   <Server size={32}/>
                </div>
                <div className="flex flex-col items-end">
                   <div className="flex items-center h-4 relative mb-1 gap-2">
                      <span className={`text-[8px] font-black uppercase ${
                        svc.status === 'HEALTHY' ? 'text-green-500' : svc.status === 'DEGRADED' ? 'text-amber-500' : 'text-red-500'
                      }`}>{svc.status}</span>
                      <span className="relative flex h-2 w-2">
                         <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                           svc.status === 'HEALTHY' ? 'bg-green-400' : svc.status === 'DEGRADED' ? 'bg-amber-400' : 'bg-red-400'
                         }`}></span>
                         <span className={`relative inline-flex rounded-full h-2 w-2 ${
                           svc.status === 'HEALTHY' ? 'bg-green-500' : svc.status === 'DEGRADED' ? 'bg-amber-500' : 'bg-red-500'
                         }`}></span>
                      </span>
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest">Uptime: {svc.uptime}</p>
                </div>
             </div>

             <div className="mb-10 relative z-10">
                <h3 className="text-2xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter mb-2">{svc.name}</h3>
                <div className="flex items-center gap-3">
                   <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest">{svc.version}</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase italic flex items-center gap-1">
                      <Zap size={10}/> {svc.instances} Instances Active
                   </span>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 border-t border-slate-50 dark:border-slate-800 pt-8 relative z-10">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">CPU Load</p>
                   <div className="flex items-center gap-3">
                      <p className={`text-lg font-black italic ${svc.cpu > 70 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{svc.cpu}%</p>
                      <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden max-w-[80px]">
                         <div className={`h-full ${svc.cpu > 70 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${svc.cpu}%` }}></div>
                      </div>
                   </div>
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Memory Matrix</p>
                   <p className="text-lg font-black italic text-slate-900 dark:text-white uppercase tracking-tighter">{svc.memory}</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3 mt-8">
                <button onClick={() => triggerToast(`Restarting ${svc.id} cluster...`)} className="py-3 bg-slate-950 text-white text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all">
                   <RefreshCw size={14} /> Bounce Nodes
                </button>
                <button onClick={() => triggerToast(`Scaling ${svc.id} horizontally...`)} className="py-3 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                   <Activity size={14} /> Scale
                </button>
             </div>
          </div>
       ))}
    </div>
  );

  const WebhookMonitor = () => (
    <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic flex items-center gap-2">
                <Radio size={14} className="text-indigo-500 animate-pulse" /> Outbound Dispatch Trace
             </h3>
             <div className="flex gap-2">
                <div className="relative">
                   <input type="text" placeholder="Search merchant or event..." className="pl-8 pr-3 py-1.5 text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none" />
                   <Search className="absolute left-2.5 top-2 h-3 w-3 text-slate-400" />
                </div>
                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Filter size={14}/></button>
             </div>
          </div>
          <table className="w-full text-left">
             <thead className="bg-white dark:bg-slate-900"><tr className="text-[9px] font-black text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800"><th className="px-6 py-4">Trace Node</th><th className="px-6 py-4">Event Type</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-center">Attempt</th><th className="px-6 py-4 text-right">Dispatch</th></tr></thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {webhooks.map(log => (
                   <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                         <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{log.merchantName}</p>
                         <p className="text-[9px] font-mono text-indigo-400 uppercase">{log.id} • {log.timestamp}</p>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-[10px] font-black font-mono text-slate-500 dark:text-slate-400">{log.event}</span>
                         <p className="text-[8px] text-slate-400 truncate max-w-[200px] mt-1">{log.url}</p>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            log.status >= 200 && log.status < 300 ? 'bg-green-50 text-green-600' : 
                            log.status >= 500 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-amber-50 text-amber-600'
                         }`}>{log.status}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`text-xs font-black italic ${log.attempt > 1 ? 'text-amber-500' : 'text-slate-400'}`}>#{log.attempt}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button onClick={() => triggerToast(`Inspecting payload for ${log.id}...`)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-all"><Terminal size={16}/></button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  const DeploymentLog = () => (
    <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
       <div className="grid grid-cols-1 gap-4">
          {deployments.map(dep => (
             <div key={dep.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                   <div className="flex items-center gap-5">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                         dep.status === 'SUCCESS' ? 'bg-green-600' : dep.status === 'FAILED' ? 'bg-red-600' : 'bg-indigo-600 animate-pulse'
                      }`}>
                         {dep.status === 'SUCCESS' ? <CheckCircle2 size={24}/> : dep.status === 'FAILED' ? <XCircle size={24}/> : <RefreshCw size={24} className="animate-spin"/>}
                      </div>
                      <div>
                         <h4 className="text-base font-black italic text-slate-900 dark:text-white uppercase tracking-tighter">{dep.service}</h4>
                         <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded uppercase">{dep.environment}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{dep.timestamp} by {dep.author}</span>
                         </div>
                      </div>
                   </div>

                   <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 rounded-2xl flex items-center gap-8">
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Version</p>
                         <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{dep.version}</p>
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Git Trace</p>
                         <div className="flex items-center gap-2 text-indigo-500 font-mono text-xs font-bold">
                            <Hash size={12}/> {dep.hash}
                         </div>
                      </div>
                   </div>

                   <div className="flex gap-2">
                      <button onClick={() => triggerToast(`Viewing logs for deployment ${dep.id}...`)} className="px-4 py-2 bg-slate-950 text-white text-[9px] font-black uppercase rounded-xl hover:bg-black transition-all">Logs</button>
                      {dep.status === 'SUCCESS' && (
                         <button onClick={() => triggerToast(`Initializing automated rollback for ${dep.service}...`)} className="px-4 py-2 bg-red-50 text-red-600 text-[9px] font-black uppercase rounded-xl hover:bg-red-100 transition-all flex items-center gap-2">
                            <History size={12}/> Rollback
                         </button>
                      )}
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  const APIStats = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[40px] shadow-sm h-[400px] flex flex-col overflow-hidden">
             <div className="flex justify-between items-center mb-8">
                <div><h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global API Latency (p95)</h3><p className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white">142ms <span className="text-xs text-green-500 font-normal ml-2">NOMINAL</span></p></div>
                <div className="flex gap-1"><button className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded uppercase">Live</button><button className="px-2 py-0.5 text-slate-400 text-[9px] font-black rounded uppercase">24h</button></div>
             </div>
             <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData}>
                      <defs><linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                      <XAxis dataKey="name" hide /><YAxis hide />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '9px', fontWeight: 'bold' }} />
                      <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorLat)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
          <div className="lg:col-span-4 space-y-4">
             {[
                { label: 'Total RPM', value: '4.5k', status: 'HEALTHY', icon: Activity, color: 'text-indigo-400' },
                { label: 'Error Rate', value: '0.02%', status: 'NOMINAL', icon: ShieldCheck, color: 'text-green-400' },
                { label: 'Active Endpoints', value: '14', status: 'READY', icon: Globe, color: 'text-indigo-400' }
             ].map(stat => (
                <div key={stat.label} className="bg-slate-950 p-6 rounded-[32px] border border-slate-800 text-white shadow-xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform"><stat.icon size={60}/></div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2"><stat.icon size={12} className={stat.color} /> {stat.label}</p>
                   <div className="flex justify-between items-end">
                      <h3 className="text-2xl font-black italic tracking-tighter">{stat.value}</h3>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${stat.color.replace('text-', 'text-').replace('text-', 'border-')}`}>{stat.status}</span>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );

  return (
    <div className="relative min-h-[85vh]">
      {toast && (
        <div className="fixed top-24 right-8 z-[500] bg-slate-950 border border-indigo-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right backdrop-blur-xl border-l-4 border-l-indigo-600">
           <Zap size={14} className="text-indigo-400 animate-pulse" />
           <p className="text-[10px] font-black uppercase tracking-widest italic">{toast}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-slate-950 rounded-xl shadow-lg">
                <Rocket className="text-white h-4 w-4" />
             </div>
             <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase leading-none">
                   Aether<span className="text-indigo-600">.Engine</span>
                </h1>
             </div>
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Node Health & Infrastructure Control Center</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => triggerToast("Initializing infrastructure re-sync...")} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase rounded-xl flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <RefreshCw size={14}/> Node Sync
           </button>
        </div>
      </div>

      <div className="relative">
         {currentView === 'ENG_SERVICES_HEALTH' && <ServiceGrid />}
         {currentView === 'ENG_API_ANALYTICS' && <APIStats />}
         {currentView === 'ENG_WEBHOOK_MONITOR' && <WebhookMonitor />}
         {currentView === 'ENG_DEPLOYMENTS' && <DeploymentLog />}
      </div>
    </div>
  );
};

export default DevApiView;
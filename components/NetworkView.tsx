
import React, { useState, useMemo } from 'react';
import { mockAgents } from '../services/mockData';
import { Agent, ViewState } from '../types';
import { Search, MapPin, Filter, Navigation, XCircle, Zap, Shield, Landmark, Radio, CheckCircle2 } from 'lucide-react';

interface NetworkViewProps {
  setView: (view: ViewState) => void;
}

const NetworkView: React.FC<NetworkViewProps> = ({ setView }) => {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [filter, setFilter] = useState<'ALL' | Agent['status']>('ALL');
  const [showDeploy, setShowDeploy] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filteredAgents = useMemo(() => {
    if (filter === 'ALL') return agents;
    return agents.filter(a => a.status === filter);
  }, [agents, filter]);
  
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  const handleDeploy = () => {
    const newAgent: Agent = { id: `ag-${Date.now()}`, name: "Marcory Kiosk", locationName: 'Marcory, Abidjan', status: 'ACTIVE', floatBalance: 500000, currency: 'XOF', coordinates: { x: 55, y: 65 } };
    setAgents(prev => [...prev, newAgent]);
    setShowDeploy(false);
    showToast("New agent deployed successfully.");
  }
  
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col relative">
      {toast && ( <div className="fixed top-20 right-8 z-[200] bg-slate-900 border border-indigo-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right"><CheckCircle2 size={18} className="text-indigo-400" /><p className="text-xs font-black uppercase tracking-widest">{toast}</p></div> )}
      
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <div><h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Geospatial_Agent_Network</h2><p className="text-slate-500 font-medium">Real-time geolocation, float monitoring and status.</p></div>
        <button onClick={() => setShowDeploy(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95">Deploy Agent</button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className="w-96 bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm overflow-hidden">
           <div className="p-4 border-b border-slate-200"><div className="relative"><input type="text" placeholder="Search agents..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50" /><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /></div></div>
           <div className="p-2 flex justify-around bg-slate-50/50 border-b border-slate-200">
             {(['ALL', 'ACTIVE', 'LOW_FLOAT', 'OFFLINE'] as const).map(f => <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-200'}`}>{f.replace('_',' ')}</button>)}
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
              {filteredAgents.map(agent => (
                <div key={agent.id} onClick={() => setSelectedAgent(agent)} className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${selectedAgent?.id === agent.id ? 'bg-indigo-50' : ''}`}><div className="flex justify-between items-start mb-1"><h4 className="font-bold text-sm text-slate-800">{agent.name}</h4><span className={`h-2 w-2 rounded-full mt-1 ${agent.status === 'ACTIVE' ? 'bg-green-500' : agent.status === 'LOW_FLOAT' ? 'bg-orange-500 animate-pulse' : 'bg-slate-400'}`}></span></div><p className="text-xs text-slate-500 flex items-center mb-2"><MapPin size={12} className="mr-1" /> {agent.locationName}</p><div className="flex justify-between items-center bg-slate-100 rounded px-2 py-1"><span className="text-xs text-slate-500">Float</span><span className={`text-sm font-mono font-medium ${agent.status === 'LOW_FLOAT' ? 'text-orange-600' : 'text-slate-700'}`}>{agent.floatBalance.toLocaleString()} {agent.currency}</span></div></div>
              ))}
           </div>
        </div>

        <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden shadow-inner group">
           <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px), radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px'}}></div>
           {filteredAgents.map(agent => (
             <div key={agent.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-125 hover:z-50" style={{ top: `${agent.coordinates.y}%`, left: `${agent.coordinates.x}%` }} onClick={() => setSelectedAgent(agent)}>
                <div className={`h-4 w-4 rounded-full border-2 border-slate-900 shadow-lg ${agent.status === 'ACTIVE' ? 'bg-green-500 shadow-green-500/50' : agent.status === 'LOW_FLOAT' ? 'bg-orange-500 shadow-orange-500/50 animate-pulse' : 'bg-slate-500'}`}></div>
             </div>
           ))}
           {selectedAgent && (
             <div className="absolute top-6 left-6 w-80 bg-slate-950/80 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-800 p-6 animate-in slide-in-from-left-10 fade-in duration-200 text-white">
                <div className="flex justify-between items-start mb-4"><h3 className="font-bold text-lg text-white">{selectedAgent.name}</h3><button onClick={(e) => { e.stopPropagation(); setSelectedAgent(null); }} className="text-slate-400 hover:text-white">×</button></div>
                <div className="space-y-4">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800"><p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Current Float</p><p className="text-xl font-mono font-bold text-white">{selectedAgent.floatBalance.toLocaleString()} {selectedAgent.currency}</p></div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold uppercase tracking-widest">
                     <button onClick={() => setShowTopUp(true)} className="p-2 bg-indigo-600 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700">Top Up</button>
                     <button onClick={() => setView('TREASURY_RECONCILIATION')} className="p-2 bg-slate-800 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-700"><Landmark size={12}/>Ledger</button>
                     <button onClick={() => showToast(`Pinging ${selectedAgent.name}...`)} className="p-2 bg-slate-800 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-700"><Radio size={12}/>Ping</button>
                     <button onClick={() => showToast(`${selectedAgent.name} device locked.`)} className="p-2 bg-red-900/50 text-red-300 rounded-lg flex items-center justify-center gap-2 hover:bg-red-900"><Shield size={12}/>Lock</button>
                  </div>
                </div>
             </div>
           )}
        </div>
      </div>
      
      {showDeploy && (<div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-in zoom-in-95"><div className="p-6 flex justify-between items-center border-b border-slate-200"><h3 className="text-lg font-bold text-slate-900">Deploy New Agent</h3><button onClick={() => setShowDeploy(false)} className="text-slate-400 hover:text-slate-600"><XCircle /></button></div><div className="p-8 space-y-4"><div><label className="text-sm font-medium text-slate-700">Agent Name</label><input type="text" defaultValue="Marcory Kiosk" className="w-full mt-1 p-2 border border-slate-300 rounded-lg"/></div><div><label className="text-sm font-medium text-slate-700">Initial Float (XOF)</label><input type="number" defaultValue="500000" className="w-full mt-1 p-2 border border-slate-300 rounded-lg"/></div><button onClick={handleDeploy} className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-indigo-700"><Zap size={16}/>Deploy</button></div></div></div>)}
      {showTopUp && (<div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-in zoom-in-95"><div className="p-6 flex justify-between items-center border-b border-slate-200"><h3 className="text-lg font-bold text-slate-900">Top Up Agent Float</h3><button onClick={() => setShowTopUp(false)} className="text-slate-400 hover:text-slate-600"><XCircle /></button></div><div className="p-8 space-y-4"><div><label className="text-sm font-medium text-slate-700">Amount (XOF)</label><input type="number" defaultValue="250000" className="w-full mt-1 p-2 border border-slate-300 rounded-lg"/></div><button onClick={() => {setShowTopUp(false); showToast('Top-up request sent to Core Protocol.')}} className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Submit for Approval</button></div></div></div>)}
    </div>
  );
};

export default NetworkView;

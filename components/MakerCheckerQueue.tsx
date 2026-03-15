
import React, { useState } from 'react';
import { MakerCheckerTask } from '../types';
import { mockMakerCheckerTasks } from '../services/mockData';
import { 
  UserCheck, Clock, ShieldAlert, Check, X, FileSearch, 
  Terminal, Fingerprint, Cpu, Lock, ShieldCheck, Copy, AlertCircle
} from 'lucide-react';

const MakerCheckerQueue: React.FC = () => {
  const [tasks, setTasks] = useState<MakerCheckerTask[]>(mockMakerCheckerTasks);
  const [inspectingTask, setInspectingTask] = useState<MakerCheckerTask | null>(null);
  const [signingTask, setSigningTask] = useState<string | null>(null);
  const [signProgress, setSignProgress] = useState(0);
  const [rejectingTask, setRejectingTask] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = (id: string) => {
    setSigningTask(id);
    setSignProgress(0);
    const interval = setInterval(() => {
      setSignProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setTasks(current => current.filter(t => t.id !== id));
            setSigningTask(null);
          }, 800);
          return 100;
        }
        return prev + 5;
      });
    }, 50);
  };

  const handleReject = (id: string) => {
    setTasks(current => current.filter(t => t.id !== id));
    setRejectingTask(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Protocol_Signatory_Queue</h2>
          <p className="text-slate-500 font-medium">Secondary administrative validation required for sensitive operations.</p>
        </div>
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black border border-slate-700 flex items-center gap-3 shadow-lg">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
              PENDING_AUTH: {tasks.length}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tasks.map(task => (
          <div key={task.id} className={`relative bg-white rounded-2xl border ${task.priority === 'CRITICAL' ? 'border-red-200' : 'border-slate-200'} shadow-sm overflow-hidden flex flex-col lg:flex-row group transition-all hover:shadow-md`}>
            <div className={`w-1.5 lg:w-2 ${task.priority === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'} transition-all group-hover:w-3`}></div>
            
            <div className="flex-1 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
               <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                     <span className="text-[10px] font-black font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{task.id}</span>
                     <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase ${
                        task.priority === 'CRITICAL' ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-amber-100 text-amber-700'
                     }`}>
                        {task.priority}
                     </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 italic uppercase tracking-tight">{task.type.replace(/_/g, ' ')}</h3>
                  <div className="flex flex-wrap items-center text-xs text-slate-500 gap-6">
                     <span className="flex items-center gap-2"><Clock size={14} className="text-slate-400" /> {task.createdAt}</span>
                     <span className="flex items-center gap-2"><Fingerprint size={14} className="text-indigo-500" /> Maker: <span className="font-bold text-slate-900">{task.maker}</span></span>
                  </div>
               </div>

               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex-1 max-w-md group/payload relative">
                  <div className="absolute top-2 right-2 opacity-0 group-hover/payload:opacity-100 transition-opacity">
                     <button className="text-slate-500 hover:text-indigo-400 p-1"><Copy size={12} /></button>
                  </div>
                  <p className="text-[10px] font-black text-slate-600 uppercase mb-2 flex items-center gap-2">
                     <Cpu size={10} /> Data_Payload
                  </p>
                  <pre className="text-[11px] font-mono text-indigo-300 overflow-hidden whitespace-pre-wrap leading-tight">
                    {JSON.stringify(task.payload, null, 1)}
                  </pre>
               </div>

               <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => setInspectingTask(task)}
                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                     <FileSearch size={14} /> Inspect
                  </button>
                  <button 
                    onClick={() => setRejectingTask(task.id)}
                    className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-black uppercase hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                     <X size={14} /> Reject
                  </button>
                  <button 
                    onClick={() => handleApprove(task.id)}
                    disabled={signingTask !== null}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 min-w-[140px]"
                  >
                     {signingTask === task.id ? (
                        <>
                           <div className="h-3 w-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                           Signing...
                        </>
                     ) : (
                        <>
                           <Check size={14} /> Authorize
                        </>
                     )}
                  </button>
               </div>
            </div>

            {/* Signing Progress Bar */}
            {signingTask === task.id && (
              <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-75 shadow-[0_0_10px_#6366f1]" style={{ width: `${signProgress}%` }}></div>
            )}
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
             <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="text-slate-300 h-8 w-8" />
             </div>
             <h3 className="text-lg font-bold text-slate-900">Signatory Queue Empty</h3>
             <p className="text-sm text-slate-400 mt-1">All high-sensitivity operations have been cleared.</p>
          </div>
        )}
      </div>

      {/* INSPECTION MODAL */}
      {inspectingTask && (
        <div className="fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                 <div className="flex items-center gap-3">
                    <Terminal className="text-indigo-500" size={20} />
                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Payload_Inspector</h3>
                 </div>
                 <button onClick={() => setInspectingTask(null)} className="text-slate-500 hover:text-white"><X /></button>
              </div>
              <div className="p-8">
                 <div className="bg-black rounded-xl p-6 font-mono text-sm border border-slate-800 max-h-[400px] overflow-auto custom-scrollbar">
                    <div className="text-slate-500 mb-4 font-bold text-[10px] uppercase tracking-widest border-b border-slate-800 pb-2">
                       Aether_Cortex Trace: {inspectingTask.id}
                    </div>
                    <pre className="text-indigo-400">
                       {JSON.stringify(inspectingTask, null, 2)}
                    </pre>
                 </div>
                 <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                       <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Hash Status</p>
                       <p className="text-xs text-green-500 font-mono font-bold">VERIFIED_IMMUTABLE</p>
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                       <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Policy Check</p>
                       <p className="text-xs text-indigo-400 font-mono font-bold">COMPLIANT (BCEAO-L1)</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setInspectingTask(null)} 
                   className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg"
                 >
                    Close Inspector
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {rejectingTask && (
        <div className="fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="text-lg font-black text-slate-900 uppercase italic">Reject_Operation</h3>
                 <button onClick={() => setRejectingTask(null)} className="text-slate-400 hover:text-slate-600"><X /></button>
              </div>
              <div className="p-8">
                 <p className="text-sm text-slate-600 mb-6 font-medium">Please provide a valid reason for the rejection. This will be logged in the immutable audit trail.</p>
                 <textarea 
                   value={rejectReason}
                   onChange={(e) => setRejectReason(e.target.value)}
                   placeholder="e.g. Risk score mismatch, Missing documentation..."
                   className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all mb-6"
                 ></textarea>
                 <div className="flex gap-3">
                    <button 
                      onClick={() => setRejectingTask(null)} 
                      className="flex-1 py-3 bg-slate-100 text-slate-600 font-black uppercase text-xs rounded-xl hover:bg-slate-200 transition-all"
                    >
                       Cancel
                    </button>
                    <button 
                      onClick={() => handleReject(rejectingTask)}
                      disabled={!rejectReason}
                      className="flex-1 py-3 bg-red-600 text-white font-black uppercase text-xs rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
                    >
                       Confirm Rejection
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* FOOTER INFO */}
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-2xl shadow-sm">
         <div className="flex gap-4">
            <div className="bg-indigo-500 text-white p-2 rounded-lg h-fit">
               <ShieldAlert size={20} />
            </div>
            <div>
               <h4 className="text-sm font-black text-indigo-900 uppercase italic mb-1 tracking-tight">Security_Policy_Notice</h4>
               <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                 All actions in this queue are subject to the <span className="font-bold underline">Multi-Signature Core Protocol</span>. Approvals generate a unique cryptographic proof linked to your departmental IP and timestamp. 
                 Attempting to bypass this protocol will trigger an immediate System-Lock.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default MakerCheckerQueue;

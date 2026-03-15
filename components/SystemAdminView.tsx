
import React, { useState } from 'react';
import { 
  Shield, ShieldCheck, Lock, UserPlus, Fingerprint, 
  Key, Smartphone, Laptop, XCircle, Search, 
  CheckCircle2, RefreshCw, UserX, Activity, Zap, Eye, Power, AlertTriangle, Layers,
  Check, X, ChevronRight, Info
} from 'lucide-react';
import { mockUsers, mockAuditLogs, mockPermissionsMatrix } from '../services/mockData';
import { ViewState, User } from '../types';

interface SystemAdminViewProps {
  currentView: ViewState;
}

const SystemAdminView: React.FC<SystemAdminViewProps> = ({ currentView }) => {
  const [toast, setToast] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const UserDirectory = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/>
             <input type="text" placeholder="Search identities..." className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button onClick={() => triggerToast("Initializing User Provisioning flow...")} className="px-6 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">Provision User</button>
       </div>
       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
             <thead className="bg-slate-50/50 dark:bg-slate-800/50"><tr className="text-[9px] font-black text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800"><th className="px-6 py-4">Identity</th><th className="px-6 py-4">Departmental Role</th><th className="px-6 py-4 text-center">MFA</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map(u => (
                   <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-slate-950 rounded-xl flex items-center justify-center font-black text-xs text-indigo-400 italic uppercase border border-slate-800 shadow-md group-hover:scale-105 transition-transform">
                               {u.name.charAt(0)}
                            </div>
                            <div>
                               <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{u.name}</p>
                               <p className="text-[10px] text-slate-400 font-mono italic">{u.email}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-[10px] font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded uppercase tracking-wider italic">
                            {u.role.replace(/_/g, ' ')}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         {u.mfaEnabled ? 
                            <ShieldCheck size={16} className="mx-auto text-green-500" /> : 
                            <Shield size={16} className="mx-auto text-slate-300" />
                         }
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${u.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{u.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2">
                            <button onClick={() => triggerToast(`Locking identity: ${u.name}`)} className="p-2 text-slate-400 hover:text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Deactivate"><Power size={14}/></button>
                            <button onClick={() => triggerToast(`Opening access matrix for ${u.name}`)} className="p-2 text-slate-400 hover:text-indigo-600 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg" title="Permissions"><Key size={14}/></button>
                         </div>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  const MFACenter = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
       <div className="bg-slate-950 p-10 rounded-[32px] border border-slate-800 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Smartphone size={200}/></div>
          <div>
             <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mb-8"><Smartphone size={28}/></div>
             <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4 leading-none">MFA Policy Hub</h3>
             <p className="text-sm text-slate-400 font-medium mb-10 leading-relaxed">Global administrative policy override. Force hardware-based multi-factor authentication across all regional cluster nodes.</p>
          </div>
          
          <div className="space-y-4">
             <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center group hover:border-indigo-500/50 transition-all">
                <div>
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic">Policy_Status</p>
                   <p className="text-lg font-black uppercase italic tracking-tighter">Enforced: <span className="text-green-500">ACTIVE</span></p>
                </div>
                <button onClick={() => triggerToast("Security Alert: Global MFA Override sequence started...")} className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all active:scale-90 shadow-lg shadow-red-600/20"><AlertTriangle size={24}/></button>
             </div>
             <button onClick={() => triggerToast("Regenerating global cryptographic sync matrix...")} className="w-full py-4 bg-white text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all active:scale-95 shadow-xl">Re-Sync MFA Matrix</button>
          </div>
       </div>

       <div className="bg-white dark:bg-slate-900 p-10 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="h-24 w-24 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-[32px] flex items-center justify-center mb-8 animate-pulse-slow">
             <ShieldCheck size={48}/>
          </div>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-slate-900 dark:text-white">Audit_Status: NOMINAL</h3>
          <p className="text-sm text-slate-400 max-w-sm font-medium leading-relaxed">
             98.4% of departmental internal sessions are authenticated via <span className="text-slate-900 dark:text-white font-bold underline decoration-indigo-500">Hardware YubiKeys</span>. Unauthenticated outliers have been flagged for automated lockout.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-12 w-full max-w-xs">
             <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Active Keys</p>
                <p className="text-xl font-black italic text-slate-900 dark:text-white">142</p>
             </div>
             <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Alerts</p>
                <p className="text-xl font-black italic text-red-500">02</p>
             </div>
          </div>
          <button className="mt-10 text-indigo-600 text-[10px] font-black uppercase tracking-widest border-b-2 border-indigo-600 pb-1 hover:text-indigo-700 hover:border-indigo-700 transition-all">View Forensic Audit Trail</button>
       </div>
    </div>
  );

  const PermissionsMatrix = () => {
    // Select subset of roles for visibility
    const visibleRoles = ['SUPER_ADMIN', 'CCO', 'CTO', 'RISK_ANALYST', 'TREASURER', 'L1_SUPPORT_AGENT'];

    return (
       <div className="space-y-8 animate-in zoom-in-95 duration-500">
          <div className="flex justify-between items-center">
             <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">Access_Control_Matrix</h3>
                <p className="text-xs text-slate-400 font-medium">RBAC Policy definitions for departmental resource consumption.</p>
             </div>
             <div className="flex gap-2">
                <button onClick={() => triggerToast("Synchronizing matrix with Auth0/LDAP...")} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase rounded-xl flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                   <RefreshCw size={12}/> LDAP Sync
                </button>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-xl overflow-x-auto custom-scrollbar">
             <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                   <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-80">Resource / Permission</th>
                      {visibleRoles.map(role => (
                         <th key={role} className="px-4 py-6 text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap mb-1">{role.replace(/_/g, ' ')}</p>
                            <div className="h-1 w-8 bg-indigo-500 mx-auto rounded-full"></div>
                         </th>
                      ))}
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                   {mockPermissionsMatrix.map(category => (
                      <React.Fragment key={category.category}>
                         <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                            <td colSpan={visibleRoles.length + 1} className="px-8 py-3 text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em] italic bg-indigo-50/10">
                               {category.category}
                            </td>
                         </tr>
                         {category.permissions.map(perm => (
                            <tr key={perm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group">
                               <td className="px-8 py-5">
                                  <div className="flex items-center gap-3">
                                     <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-indigo-600 transition-colors">
                                        <Layers size={14} className="text-slate-400 group-hover:text-white" />
                                     </div>
                                     <div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white uppercase italic">{perm.label}</p>
                                        <p className="text-[9px] font-mono text-slate-400 tracking-tighter">{perm.id}</p>
                                     </div>
                                  </div>
                               </td>
                               {visibleRoles.map(role => {
                                  const hasAccess = perm.roles.includes(role);
                                  return (
                                     <td key={role} className="px-4 py-5 text-center">
                                        <div className="flex items-center justify-center">
                                           {hasAccess ? (
                                              <div className="h-6 w-6 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 flex items-center justify-center shadow-sm">
                                                 <Check size={12} className="text-green-600" />
                                              </div>
                                           ) : (
                                              <div className="h-6 w-6 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-center opacity-30">
                                                 <X size={10} className="text-slate-400" />
                                              </div>
                                           )}
                                        </div>
                                     </td>
                                  );
                               })}
                            </tr>
                         ))}
                      </React.Fragment>
                   ))}
                </tbody>
             </table>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 p-6 rounded-3xl flex items-start gap-4">
             <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0"><Info size={18}/></div>
             <div>
                <h4 className="text-sm font-black text-indigo-900 dark:text-indigo-400 uppercase italic mb-1">Administrative Note</h4>
                <p className="text-[10px] text-indigo-700 dark:text-indigo-500 font-medium leading-relaxed">
                   Permissions are governed by the **Protocol Zero** engine. Manual overrides are disabled. To modify roles, initiate a **Maker-Checker Security Task** from the Protocol Management center.
                </p>
             </div>
          </div>
       </div>
    );
  };

  return (
    <div className="relative min-h-[85vh]">
      {toast && (
        <div className="fixed top-24 right-8 z-[500] bg-slate-950 border border-indigo-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right backdrop-blur-xl border-l-4 border-l-indigo-600">
           <Zap size={14} className="text-indigo-400 animate-pulse" />
           <p className="text-[10px] font-black uppercase tracking-widest italic">{toast}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
             <div className="p-2.5 bg-slate-950 dark:bg-indigo-600 rounded-2xl shadow-xl">
                <Shield className="text-white h-5 w-5" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase leading-none">
                   Security<span className="text-indigo-600">.Matrix</span>
                </h1>
             </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic flex items-center gap-2">
             Identity Hub • Regional Auth Nodes: <span className="text-green-500">SECURE</span> • Last Audit: 12m ago
          </p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => triggerToast("Initializing global system lockout protocol...")} className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase rounded-xl flex items-center gap-2 hover:bg-red-100 transition-all active:scale-95 shadow-sm">
              <Lock size={14}/> Panic Mode
           </button>
        </div>
      </div>

      <div className="relative">
         {currentView === 'SEC_USERS_ROLES' && <UserDirectory />}
         {currentView === 'SEC_AUTH_MFA' && <MFACenter />}
         {currentView === 'SEC_MATRIX' && <PermissionsMatrix />}
      </div>
    </div>
  );
};

export default SystemAdminView;

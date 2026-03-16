
import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldAlert, Landmark, Headphones, Server, ClipboardList, Settings,
  Zap, UserCheck, FileCheck, Scale, Globe, Code, BarChart3, ShieldCheck, 
  User as UserIcon, Package, LogOut, ChevronDown, Users, ChevronLeft, 
  ChevronRight, Truck, Fingerprint, Rocket, Link as LinkIcon, Radio, BrainCircuit
} from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, toggleSidebar }) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const departments = [
    { 
      group: 'Command Center', id: 'COMMAND', icon: Activity,
      items: [
        { id: 'COMMAND_GLOBAL_OVERVIEW', label: 'Global Overview' },
        { id: 'COMMAND_LIVE_MAP', label: 'Live Transaction Map' },
        { id: 'COMMAND_ZONE_FLUX', label: 'Zone Flux' },
        { id: 'COMMAND_ALERTS', label: 'Alerts & Incidents' },
        { id: 'COMMAND_EXECUTIVE_REPORTS', label: 'Executive Reports' },
      ]
    },
    {
      group: 'Risk & Fraud', id: 'RISK', icon: ShieldAlert,
      items: [
        { id: 'RISK_DASHBOARD', label: 'Risk Radar' },
        { id: 'RISK_TRANSACTIONS', label: 'Transactions at Risk' },
        { id: 'RISK_QUARANTINE', label: 'Quarantine Center' },
        { id: 'RISK_RULE_ENGINE', label: 'Rule Engine' },
        { id: 'RISK_BLACKLISTS', label: 'Intelligence Base' },
      ]
    },
    { 
      group: 'Treasury & FX', id: 'TREASURY', icon: Landmark,
      items: [
        { id: 'TREASURY_OVERVIEW', label: 'Liquidity Overview' },
        { id: 'TREASURY_POOLS', label: 'Liquidity Pools' },
        { id: 'TREASURY_FX', label: 'FX Rates & Spread' },
        { id: 'TREASURY_SETTLEMENT', label: 'File de règlements' },
        { id: 'TREASURY_RECONCILIATION', label: 'Reconciliation Hub' },
        { id: 'TREASURY_FORECAST', label: 'Treasury Forecast' },
        { id: 'TREASURY_PAYOUTS', label: 'Merchant Payouts' },
      ]
    },
    { 
      group: 'Compliance', id: 'COMPLIANCE', icon: Scale,
      items: [
        { id: 'COMPLIANCE_KYC_REVIEW', label: 'KYB KYC Review' },
        { id: 'COMPLIANCE_MERCHANT_STATUS', label: 'Merchant Status' },
        { id: 'COMPLIANCE_PEP_SANCTIONS', label: 'PEP & Sanctions' },
        { id: 'COMPLIANCE_AML_MONITORING', label: 'AML Monitoring' },
        { id: 'COMPLIANCE_AUDIT_LOGS', label: 'Audit Logs' },
        { id: 'COMPLIANCE_REGULATORY_REPORTS', label: 'Regulatory Reports' },
      ]
    },
    {
      group: 'Ops & Support', id: 'OPS', icon: Headphones,
      items: [
        { id: 'OPS_MERCHANT_DIRECTORY', label: 'Merchant Directory' },
        { id: 'OPS_IMPERSONATION', label: 'Impersonation Sessions' },
        { id: 'OPS_TICKET_HUB', label: 'Ticket Hub' },
        { id: 'OPS_AETHERLINK', label: 'AetherLink Manager' },
      ]
    },
    {
      group: 'Logistics', id: 'SHIP', icon: Truck,
      items: [
        { id: 'SHIP_DASHBOARD', label: 'Delivery Dashboard' },
        { id: 'SHIP_HEATMAP', label: 'Delivery Heatmap' },
        { id: 'SHIP_PARTNERS', label: 'Partner Integrations' },
        { id: 'SHIP_INCIDENTS', label: 'Logistics Incidents' },
      ]
    },
    {
      group: 'Engineering', id: 'ENGINEERING', icon: Code,
      items: [
        { id: 'ENG_SERVICES_HEALTH', label: 'Services Health' },
        { id: 'ENG_API_ANALYTICS', label: 'API Analytics' },
        { id: 'ENG_WEBHOOK_MONITOR', label: 'Webhook Monitor' },
        { id: 'ENG_DEPLOYMENTS', label: 'Deployments & Versions' },
      ]
    },
    {
      group: 'Security', id: 'SECURITY', icon: Server,
      items: [
        { id: 'SEC_USERS_ROLES', label: 'Users & Roles' },
        { id: 'SEC_AUTH_MFA', label: 'Auth & MFA' },
        { id: 'SEC_MATRIX', label: 'Permissions Matrix' },
      ]
    },
  ];
  
  useEffect(() => {
    const activeGroup = departments.find(d => currentView.startsWith(d.id));
    if (activeGroup && isOpen) {
      setExpandedGroup(activeGroup.id);
    }
  }, [currentView, isOpen]);

  const toggleGroup = (groupId: string) => {
    if (!isOpen) {
      toggleSidebar();
      setExpandedGroup(groupId);
      return;
    }
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col
      ${isOpen ? 'w-64' : 'w-20'}
    `}>
      <div className="absolute -right-3 top-20 z-50">
        <button 
          onClick={toggleSidebar}
          className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-lg hover:text-indigo-600 transition-all"
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      <div className={`flex items-center h-16 border-b border-slate-200 dark:border-slate-800 shrink-0 transition-all duration-300 ${isOpen ? 'px-6' : 'justify-center'}`}>
        <Zap className={`text-indigo-500 dark:text-indigo-400 transition-all ${isOpen ? 'h-6 w-6 mr-3' : 'h-8 w-8'} shadow-[0_0_10px_rgba(99,102,241,0.5)]`} />
        {isOpen && (
          <span className="text-slate-900 dark:text-white font-black tracking-tighter text-xl italic uppercase">
            Aether<span className="text-indigo-500 dark:text-indigo-400">OS</span>
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        <nav className={`space-y-1 transition-all duration-300 ${isOpen ? 'px-3' : 'px-2'}`}>
        {departments.map((dept) => {
          const isExpanded = expandedGroup === dept.id;
          const isGroupActive = currentView.startsWith(dept.id);
          return (
            <div key={dept.id} className="relative group">
              <button
                onClick={() => toggleGroup(dept.id)}
                className={`
                  relative flex items-center w-full rounded-xl transition-all duration-200
                  ${isOpen ? 'px-4 py-2.5' : 'p-3 justify-center'}
                  ${isGroupActive 
                    ? 'bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white' 
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                `}
              >
                <dept.icon className={`transition-all duration-300 ${isOpen ? 'mr-3 h-4 w-4' : 'h-6 w-6'} ${isGroupActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {isOpen && (
                  <>
                    <span className="text-[11px] font-black uppercase tracking-widest flex-1 text-left">{dept.group}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              {isOpen && isExpanded && (
                <div className="mt-1 ml-6 space-y-1 border-l border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
                  {dept.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setView(item.id as ViewState)}
                      className={`
                        w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-tight transition-all
                        ${currentView === item.id 
                          ? 'text-indigo-600 dark:text-indigo-400 font-black italic' 
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}
                      `}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        </nav>
      </div>

      <div className={`border-t border-slate-100 dark:border-slate-800 shrink-0 p-4`}>
        <div 
          className={`flex items-center cursor-pointer group rounded-2xl transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isOpen ? 'p-3' : 'justify-center p-1'}`}
          onClick={() => setView('PROFILE')}
        >
          <div className="relative">
            <div className={`rounded-lg bg-slate-900 dark:bg-slate-800 flex items-center justify-center font-black text-indigo-400 border border-slate-700 shadow-md ${isOpen ? 'h-8 w-8 text-[10px]' : 'h-10 w-10 text-xs'}`}>
              SA
            </div>
            <span className={`absolute bottom-0 right-0 block rounded-full bg-green-500 border-2 border-white dark:border-slate-950 h-2.5 w-2.5`}></span>
          </div>
          {isOpen && (
            <div className="ml-3">
              <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase">Super Admin</p>
              <p className="text-[9px] text-slate-500 font-mono uppercase italic">Primary</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

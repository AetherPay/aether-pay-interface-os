import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { ViewState } from '../../types';
import RiskRadar from './RiskRadar';
import RiskTransactionsList from './RiskTransactionsList';
import QuarantineCenter from './QuarantineCenter';
import RuleEngine from './RuleEngine';
import BlacklistManager from './BlacklistManager';

interface RiskViewProps {
  currentView: ViewState;
}

const RiskView: React.FC<RiskViewProps> = ({ currentView }) => (
  <div className="relative min-h-[80vh]">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-red-600 rounded-xl shadow-lg shadow-red-500/20">
            <ShieldAlert className="text-white h-4 w-4" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase leading-none">
            Risk<span className="text-red-600">.Radar</span>
          </h1>
        </div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Sentinel Deep Packet Inspection Active</p>
      </div>
    </div>
    <div className="relative">
      {currentView === 'RISK_DASHBOARD'     && <RiskRadar />}
      {currentView === 'RISK_TRANSACTIONS'  && <RiskTransactionsList />}
      {currentView === 'RISK_QUARANTINE'    && <QuarantineCenter />}
      {currentView === 'RISK_RULE_ENGINE'   && <RuleEngine />}
      {currentView === 'RISK_BLACKLISTS'    && <BlacklistManager />}
    </div>
  </div>
);

export default RiskView;


import React, { useState, useEffect } from 'react';
import { ViewState } from './types';

// Layout Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AuthLogin from './components/AuthLogin';

// OS Pillars
import DashboardView from './components/DashboardView'; 
import RiskView from './components/RiskView'; 
import KYCView from './components/KYCView';
import ComplianceView from './components/ComplianceView';
import SupportView from './components/SupportView';
import NetworkView from './components/NetworkView';
import FinanceView from './components/FinanceView';
import ReportingView from './components/ReportingView';
import SystemAdminView from './components/SystemAdminView';
import Checklist from './components/ArchitectureChecklist';
import SettingsView from './components/SettingsView';
import ProfileView from './components/ProfileView';
import MakerCheckerQueue from './components/MakerCheckerQueue';
import TreasuryView from './components/TreasuryView';
import AetherShipView from './components/AetherShipView';

// Data
import { architectureChecklist } from './services/mockData';
import { AlertTriangle, X } from 'lucide-react';
import DevApiView from './components/engineering/DevApiView';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('aetherpay:auth') === 'true'
  );
  const [currentView, setView] = useState<ViewState>('COMMAND_GLOBAL_OVERVIEW');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isImpersonating, setImpersonating] = useState(false);
  const [isDarkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));


  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleDarkMode = () => {
    const newDarkModeState = !isDarkMode;
    setDarkMode(newDarkModeState);
    if (newDarkModeState) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('aether_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aether_dark_mode', 'false');
    }
  };

  if (!isAuthenticated) {
    return <AuthLogin onAuthenticated={() => { localStorage.setItem('aetherpay:auth', 'true'); setIsAuthenticated(true); }} />;
  }
  
  const renderContent = () => {
    if (currentView.startsWith('COMMAND_')) {
      return <DashboardView setView={setView} currentView={currentView} />;
    }

    if (currentView.startsWith('RISK_')) return <RiskView currentView={currentView} />;

    if (currentView === 'TREASURY_PAYOUTS') {
      return <FinanceView />;
    }

    if (currentView.startsWith('TREASURY_')) {
      return <TreasuryView currentView={currentView} setView={setView} />;
    }

    if (currentView.startsWith('COMPLIANCE_')) {
      return <ComplianceView currentView={currentView} setView={setView} />;
    }

    if (currentView.startsWith('OPS_')) {
       return <SupportView currentView={currentView} setView={setView} setImpersonating={setImpersonating} />;
    }

    if (currentView.startsWith('SHIP_')) return <AetherShipView currentView={currentView} />;
    
    if (currentView.startsWith('ENG_')) return <DevApiView currentView={currentView} />;
    
    if (currentView.startsWith('SEC_')) return <SystemAdminView currentView={currentView} />;
    
    if (currentView.startsWith('AGENT_NETWORK_')) return <NetworkView setView={setView} />;
    
    if (currentView.startsWith('PROTOCOL_')) return <MakerCheckerQueue />;

    switch (currentView) {
      case 'SETTINGS': return <SettingsView />;
      case 'PROFILE': return <ProfileView />;
      case 'CHECKLIST': return <Checklist items={architectureChecklist as any} />;
      default: return <DashboardView setView={setView} currentView={currentView} />;
    }
  };


  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-900 dark:text-slate-200 selection:bg-indigo-100 dark:selection:bg-indigo-500/50 transition-colors duration-500`}>
      <Sidebar currentView={currentView} setView={setView} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        {isImpersonating && (
          <div className="absolute top-0 left-0 w-full bg-red-600 text-white px-6 py-2 z-50 flex justify-between items-center shadow-2xl">
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} />
              <span className="text-xs font-black uppercase tracking-widest">Impersonation Protocol Active - All actions are being logged.</span>
            </div>
            <button onClick={() => setImpersonating(false)} className="flex items-center gap-2 text-xs font-bold bg-red-700/50 px-3 py-1 rounded-md hover:bg-red-700">
              <X size={14} /> Exit
            </button>
          </div>
        )}
        
        <Header 
          toggleSidebar={toggleSidebar} 
          setView={setView} 
          currentView={currentView}
          logout={() => { localStorage.removeItem('aetherpay:auth'); setIsAuthenticated(false); }}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />

        <main className={`flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth custom-scrollbar ${isImpersonating ? 'pt-12' : ''}`}>
          <div className="max-w-[1600px] mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

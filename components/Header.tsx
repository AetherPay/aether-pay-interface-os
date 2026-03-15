
import React, { useState } from 'react';
import { Menu, Search, Bell, User, Settings, LogOut, CheckCircle, Moon, Sun } from 'lucide-react';
import { ViewState } from '../types';

interface HeaderProps {
  toggleSidebar: () => void;
  setView: (view: ViewState) => void;
  currentView: ViewState;
  logout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, setView, currentView, logout, isDarkMode, toggleDarkMode }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-6 z-40 shrink-0">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none mr-2"
          >
            <Menu size={20} />
          </button>
          <div className="hidden md:flex items-center text-sm font-bold text-slate-800 dark:text-slate-200">
            <span className="uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider text-xs">{currentView.replace(/_/g, ' ')}</span>
          </div>
        </div>

        <div className="flex-1 max-w-xs lg:max-w-md mx-6">
          <div className="relative" onClick={() => setSearchOpen(true)}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <div className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 sm:text-sm cursor-pointer hover:bg-white dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm">
               Search...
            </div>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 bg-white dark:bg-slate-900">CTRL K</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative">
            <button onClick={() => setNotificationsOpen(p => !p)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors relative rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
            </button>
            {notificationsOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-2xl z-50 animate-slide-in-down overflow-hidden">
                 <div className="p-4 border-b dark:border-slate-700"><h3 className="text-sm font-bold dark:text-white">Notifications</h3></div>
                 <div className="py-2"><a href="#" className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50"><CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" /><p className="text-xs text-slate-600 dark:text-slate-300"><strong>Batch #9921</strong> reconciled successfully.</p></a></div>
                 <div className="p-2 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center"><a href="#" className="text-xs font-bold text-indigo-600 dark:text-indigo-400">View All</a></div>
              </div>
            )}
          </div>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

          <div className="relative">
            <button onClick={() => setProfileOpen(p => !p)} className="flex items-center space-x-3 group">
              <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform">
                SA
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Super Admin</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">root@aetheros.io</p>
              </div>
            </button>
            {profileOpen && (
               <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-2xl z-50 animate-slide-in-down overflow-hidden">
                  <div className="p-2">
                     <button onClick={() => { setView('PROFILE'); setProfileOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"><User size={14}/> Profile</button>
                     <button onClick={() => { setView('SETTINGS'); setProfileOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"><Settings size={14}/> Settings</button>
                     <div className="w-full flex justify-between items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 rounded-md">
                        <div className="flex items-center gap-2">
                          {isDarkMode ? <Moon size={14}/> : <Sun size={14}/>} Dark Mode
                        </div>
                        <button onClick={toggleDarkMode} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                     </div>
                     <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                     <button onClick={logout} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10"><LogOut size={14}/> Logout</button>
                  </div>
               </div>
            )}
          </div>
        </div>
      </header>
      
      {searchOpen && (
        <div className="fixed inset-0 z-50 animate-fade-in" onClick={() => setSearchOpen(false)}>
           <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
           <div className="relative pt-24" onClick={e => e.stopPropagation()}>
             <div className="mx-auto max-w-xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-2 border dark:border-slate-700">
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Search className="h-5 w-5 text-indigo-500" />
                  </div>
                  <input type="text" autoFocus placeholder="Search anything..." className="w-full bg-transparent pl-12 pr-4 py-4 text-lg outline-none text-slate-900 dark:text-white" />
               </div>
             </div>
           </div>
        </div>
      )}
    </>
  );
};

export default Header;
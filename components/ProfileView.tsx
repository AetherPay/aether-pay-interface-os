
import React, { useState } from 'react';
import { User, AuditLog } from '../types';
import { mockUsers, mockAuditLogs } from '../services/mockData';
import { 
  User as UserIcon, Shield, Key, History, Smartphone, 
  LogOut, Laptop, CheckCircle, Mail, Briefcase, Lock,
  Edit2, Camera
} from 'lucide-react';

const ProfileView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SECURITY' | 'ACTIVITY'>('OVERVIEW');
  const currentUser: User = mockUsers[0]; // Assuming Super Admin (u1) is logged in

  const activeSessions = [
    { id: 1, device: 'MacBook Pro 16"', location: 'Abidjan, Ivory Coast', ip: '102.14.22.1', lastActive: 'Current Session', status: 'ACTIVE', icon: Laptop },
    { id: 2, device: 'iPhone 13 Pro', location: 'Abidjan, Ivory Coast', ip: '102.14.22.15', lastActive: '2 hours ago', status: 'IDLE', icon: Smartphone },
  ];

  const userLogs = mockAuditLogs.filter(log => log.actor === currentUser.name || log.actor === 'Super Admin');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="relative flex flex-col sm:flex-row items-end sm:items-center pt-12 sm:pt-4 px-4">
           <div className="relative">
             <div className="h-24 w-24 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500 shadow-md">
               {currentUser.name.charAt(0)}
             </div>
             <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full border border-slate-200 shadow-sm text-slate-500 hover:text-indigo-600">
                <Camera className="h-4 w-4" />
             </button>
           </div>
           
           <div className="mt-4 sm:mt-16 sm:ml-6 flex-1">
              <h2 className="text-2xl font-bold text-slate-900">{currentUser.name}</h2>
              <div className="flex items-center text-sm text-slate-500 mt-1">
                 <Mail className="h-4 w-4 mr-1.5" /> {currentUser.email}
                 <span className="mx-2">•</span>
                 <Briefcase className="h-4 w-4 mr-1.5" /> {currentUser.role.replace('_', ' ')}
              </div>
           </div>

           <div className="mt-4 sm:mt-16 flex space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${currentUser.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                 {currentUser.status}
              </span>
           </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="flex flex-col lg:flex-row gap-6">
         {/* Sidebar Navigation */}
         <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
            <button 
              onClick={() => setActiveTab('OVERVIEW')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'OVERVIEW' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}
            >
               <UserIcon className="h-4 w-4 mr-3" /> Personal Info
            </button>
            <button 
              onClick={() => setActiveTab('SECURITY')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'SECURITY' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}
            >
               <Shield className="h-4 w-4 mr-3" /> Login & Security
            </button>
            <button 
              onClick={() => setActiveTab('ACTIVITY')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ACTIVITY' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}
            >
               <History className="h-4 w-4 mr-3" /> Activity Log
            </button>
         </div>

         {/* Tab Content */}
         <div className="flex-1">
            
            {activeTab === 'OVERVIEW' && (
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                     <h3 className="text-lg font-bold text-slate-900">Profile Details</h3>
                     <button className="text-sm text-indigo-600 font-medium hover:underline flex items-center">
                        <Edit2 className="h-3 w-3 mr-1" /> Edit
                     </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                        <input type="text" value={currentUser.name} readOnly className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none" />
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                        <input type="email" value={currentUser.email} readOnly className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none" />
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Role</label>
                        <input type="text" value={currentUser.role} readOnly className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm focus:outline-none cursor-not-allowed" />
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                        <input type="text" value="Executive / Admin" readOnly className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none" />
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'SECURITY' && (
               <div className="space-y-6">
                  {/* Password Change */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                     <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                        <Key className="h-5 w-5 mr-2 text-indigo-500" /> Password
                     </h3>
                     <div className="space-y-4 max-w-md">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                           <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                           <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                        <div className="pt-2">
                           <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">Update Password</button>
                        </div>
                     </div>
                  </div>

                  {/* MFA Status */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex justify-between items-center">
                     <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center">
                           Multi-Factor Authentication
                           {currentUser.mfaEnabled && <CheckCircle className="h-4 w-4 ml-2 text-green-500" />}
                        </h3>
                        <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
                     </div>
                     <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
                        Manage MFA
                     </button>
                  </div>

                  {/* Active Sessions */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                     <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                        <h3 className="font-semibold text-slate-900">Active Sessions</h3>
                     </div>
                     <div className="divide-y divide-slate-100">
                        {activeSessions.map(session => (
                           <div key={session.id} className="p-4 flex items-center justify-between">
                              <div className="flex items-center">
                                 <div className="p-2 bg-slate-100 rounded-full mr-4">
                                    <session.icon className="h-5 w-5 text-slate-500" />
                                 </div>
                                 <div>
                                    <p className="text-sm font-medium text-slate-900">{session.device}</p>
                                    <p className="text-xs text-slate-500">{session.location} • {session.ip}</p>
                                 </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                 {session.status === 'ACTIVE' ? (
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Current</span>
                                 ) : (
                                    <span className="text-xs text-slate-400">{session.lastActive}</span>
                                 )}
                                 {session.status !== 'ACTIVE' && (
                                    <button className="text-slate-400 hover:text-red-600" title="Revoke">
                                       <LogOut className="h-4 w-4" />
                                    </button>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'ACTIVITY' && (
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                     <h3 className="font-semibold text-slate-900">Recent Activity</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                     {userLogs.length > 0 ? userLogs.map(log => (
                        <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                           <div className="flex justify-between items-start">
                              <div>
                                 <p className="text-sm font-medium text-slate-900">{log.action.replace('_', ' ')}</p>
                                 <p className="text-xs text-slate-500 mt-0.5">{log.target}</p>
                              </div>
                              <span className="text-xs text-slate-400 font-mono">{log.timestamp}</span>
                           </div>
                           <div className="mt-2 flex items-center text-xs">
                              <span className={`px-1.5 py-0.5 rounded font-bold mr-2 ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                 {log.status}
                              </span>
                              <span className="text-slate-400">IP: {log.ip}</span>
                           </div>
                        </div>
                     )) : (
                        <div className="p-8 text-center text-slate-500 text-sm">No activity recorded recently.</div>
                     )}
                  </div>
               </div>
            )}

         </div>
      </div>
    </div>
  );
};

export default ProfileView;

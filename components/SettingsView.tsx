
import React, { useState } from 'react';
import { mockSystemSettings } from '../services/mockData';
import { 
  Settings, Shield, Globe, Lock, Bell, Save, AlertTriangle, 
  CheckCircle, Zap, ToggleLeft, ToggleRight, Server
} from 'lucide-react';

const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'SECURITY' | 'INTEGRATIONS' | 'NOTIFICATIONS'>('GENERAL');
  const [settings, setSettings] = useState(mockSystemSettings);

  const toggleMaintenance = () => {
    setSettings(prev => ({
      ...prev,
      general: { ...prev.general, maintenanceMode: !prev.general.maintenanceMode }
    }));
  };

  const toggleMFA = () => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, mfaEnforced: !prev.security.mfaEnforced }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Configuration</h2>
          <p className="text-slate-500">Global platform settings, environment controls and third-party keys.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center shadow-sm">
           <Save className="h-4 w-4 mr-2" />
           Save Changes
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation for Settings */}
        <div className="w-full md:w-64 flex-shrink-0">
           <nav className="space-y-1">
              {[
                { id: 'GENERAL', label: 'General', icon: Settings },
                { id: 'SECURITY', label: 'Security & Access', icon: Lock },
                { id: 'INTEGRATIONS', label: 'Integrations', icon: Zap },
                { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell },
              ].map((item) => (
                 <button
                   key={item.id}
                   onClick={() => setActiveTab(item.id as any)}
                   className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                     activeTab === item.id 
                       ? 'bg-indigo-50 text-indigo-700' 
                       : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                   }`}
                 >
                    <item.icon className={`mr-3 h-5 w-5 ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {item.label}
                 </button>
              ))}
           </nav>
           
           <div className="mt-8 p-4 bg-slate-100 rounded-xl border border-slate-200">
              <div className="flex items-center mb-2">
                 <Server className="h-4 w-4 text-slate-500 mr-2" />
                 <span className="text-xs font-bold text-slate-500 uppercase">Environment</span>
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-sm font-medium text-slate-900">{settings.general.environment}</span>
                 <span className="h-2 w-2 rounded-full bg-green-500"></span>
              </div>
              <p className="text-xs text-slate-400 mt-2">v2.4.0 (Build 9921)</p>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 min-h-[500px]">
           
           {activeTab === 'GENERAL' && (
              <div className="space-y-6">
                 <div className="border-b border-slate-100 pb-4 mb-4">
                    <h3 className="text-lg font-bold text-slate-900">General Information</h3>
                    <p className="text-sm text-slate-500">Basic platform identity and support routing.</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Platform Name</label>
                       <input 
                         type="text" 
                         value={settings.general.platformName}
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Support Email (Reply-To)</label>
                       <input 
                         type="email" 
                         value={settings.general.supportEmail}
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Default Currency</label>
                       <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                          <option value="XOF">XOF (West African CFA)</option>
                          <option value="USD">USD (US Dollar)</option>
                          <option value="EUR">EUR (Euro)</option>
                       </select>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Danger Zone</h3>
                    <div className="flex items-center justify-between bg-red-50 p-4 rounded-lg border border-red-100">
                       <div className="flex items-start">
                          <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                          <div>
                             <h4 className="text-sm font-bold text-red-900">Maintenance Mode</h4>
                             <p className="text-xs text-red-700 mt-1">
                                Disables all public-facing APIs and puts the user dashboard in read-only mode.
                             </p>
                          </div>
                       </div>
                       <button onClick={toggleMaintenance} className="text-red-600 hover:text-red-800 transition-colors">
                          {settings.general.maintenanceMode ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
                       </button>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'SECURITY' && (
              <div className="space-y-6">
                 <div className="border-b border-slate-100 pb-4 mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Security Policies</h3>
                    <p className="text-sm text-slate-500">Authentication rules and network access control.</p>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                       <h4 className="text-sm font-bold text-slate-900">Enforce Multi-Factor Authentication (MFA)</h4>
                       <p className="text-xs text-slate-500 mt-1">Require all admins to use 2FA app for login.</p>
                    </div>
                    <button onClick={toggleMFA} className="text-indigo-600 hover:text-indigo-800 transition-colors">
                       {settings.security.mfaEnforced ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Session Timeout (Minutes)</label>
                       <input 
                         type="number" 
                         value={settings.security.sessionTimeoutMinutes}
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Password Rotation (Days)</label>
                       <input 
                         type="number" 
                         value={settings.security.passwordRotationDays}
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                       />
                    </div>
                 </div>

                 <div className="pt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">IP Whitelist (CIDR Format)</label>
                    <textarea 
                       className="w-full h-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                       defaultValue={settings.security.whitelistedIPs.join('\n')}
                    ></textarea>
                    <p className="text-xs text-slate-400 mt-1">One IP address or range per line.</p>
                 </div>
              </div>
           )}

           {activeTab === 'INTEGRATIONS' && (
              <div className="space-y-6">
                 <div className="border-b border-slate-100 pb-4 mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Third-Party Integrations</h3>
                    <p className="text-sm text-slate-500">Manage API keys and connection status for external providers.</p>
                 </div>

                 <div className="space-y-4">
                    {settings.integrations.map((integration) => (
                       <div key={integration.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
                          <div className="flex items-center mb-4 sm:mb-0 w-full sm:w-auto">
                             <div className={`p-2 rounded-lg mr-4 ${
                                integration.status === 'CONNECTED' ? 'bg-green-100' :
                                integration.status === 'ERROR' ? 'bg-red-100' : 'bg-slate-100'
                             }`}>
                                <Zap className={`h-5 w-5 ${
                                   integration.status === 'CONNECTED' ? 'text-green-600' :
                                   integration.status === 'ERROR' ? 'text-red-600' : 'text-slate-500'
                                }`} />
                             </div>
                             <div>
                                <h4 className="text-sm font-bold text-slate-900">{integration.name}</h4>
                                <div className="flex items-center mt-1">
                                   <span className={`h-2 w-2 rounded-full mr-2 ${
                                      integration.status === 'CONNECTED' ? 'bg-green-500' :
                                      integration.status === 'ERROR' ? 'bg-red-500' : 'bg-slate-300'
                                   }`}></span>
                                   <span className="text-xs text-slate-500">{integration.status}</span>
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center w-full sm:w-auto space-x-4">
                             <div className="flex-1 sm:flex-none">
                                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">API Key</label>
                                <code className="block bg-slate-50 px-2 py-1 rounded border border-slate-200 text-xs font-mono text-slate-600">
                                   {integration.apiKeyMasked}
                                </code>
                             </div>
                             <button className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded hover:bg-slate-50">
                                Configure
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           )}
           
           {activeTab === 'NOTIFICATIONS' && (
             <div className="flex flex-col items-center justify-center h-64 text-center">
                <Bell className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">Notification Channels</h3>
                <p className="text-slate-500 max-w-sm">
                   Configure email templates, SMS gateways (Twilio), and Slack webhooks for system alerts.
                </p>
                <button className="mt-6 text-indigo-600 font-medium hover:underline">Coming Soon</button>
             </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default SettingsView;

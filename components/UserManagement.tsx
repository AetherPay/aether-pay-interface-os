
import React from 'react';
import { User, Role } from '../types';
// FIX: Imported MoreHorizontal icon and removed unused icons.
import { Shield, MoreHorizontal } from 'lucide-react';

// FIX: Updated component to accept callbacks (onAddUser, onAction) and simplified its structure.
const UserManagement: React.FC<{ users: User[], onAddUser: () => void, onAction: (action: string, userId: string) => void }> = ({ users, onAddUser, onAction }) => {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div><h2 className="text-xl font-bold text-slate-900">Enterprise Resource Access (RBAC)</h2><p className="text-sm text-slate-500">Manage departmental roles and secure access control.</p></div>
        <button onClick={onAddUser} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center"><Shield className="h-4 w-4 mr-2" />Provision New User</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Identity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold">{user.name.charAt(0)}</div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 inline-flex text-[10px] leading-5 font-black rounded border uppercase tracking-wider bg-slate-100 text-slate-600 border-slate-200`}>{user.role.replace(/_/g, ' ')}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : user.status === 'LOCKED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{user.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative inline-block text-left">
                    <div className="relative group">
                      <button className="p-2 text-slate-400 rounded-md hover:bg-slate-100">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 hidden group-hover:block">
                        <div className="py-1">
                          <button onClick={() => onAction('Lock', user.id)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left">Lock Account</button>
                          <button onClick={() => onAction('Reset PW', user.id)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left">Reset Password</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;

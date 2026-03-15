import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';

const statusStyles = {
  PENDING: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  AUTHORIZED: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  CAPTURED: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  SETTLED: 'bg-green-50 text-green-700 ring-green-600/20',
  FAILED: 'bg-red-50 text-red-700 ring-red-600/20',
  REFUNDED: 'bg-slate-50 text-slate-700 ring-slate-600/20',
};

const TransactionTable: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  // Sort by date desc
  const sorted = useMemo(() => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [transactions]);

  return (
    <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-900">Recent Transactions</h3>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Transaction ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Risk Score</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sorted.map((txn) => (
              <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`p-1.5 rounded-full mr-3 ${txn.type === 'PAYMENT' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                      {txn.type === 'PAYMENT' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                    </div>
                    <span className="text-sm font-medium text-indigo-600 font-mono">{txn.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">{txn.customerName}</div>
                  <div className="text-xs text-slate-500">{txn.provider}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-slate-900">
                    {txn.amount.toLocaleString()} {txn.currency}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[txn.status]}`}>
                    {txn.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`h-2 w-20 rounded-full bg-slate-200 overflow-hidden mr-2`}>
                      <div 
                        className={`h-full ${txn.riskScore > 80 ? 'bg-red-500' : txn.riskScore > 50 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                        style={{ width: `${txn.riskScore}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{txn.riskScore}/100</span>
                    {txn.riskScore > 80 && <AlertCircle className="ml-2 h-4 w-4 text-red-500" />}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500">
                  {new Date(txn.date).toLocaleDateString()} <span className="text-xs">{new Date(txn.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
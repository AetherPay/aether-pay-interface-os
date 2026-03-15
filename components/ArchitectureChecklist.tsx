import React from 'react';
import { ArchitectureItem } from '../types';
import { CheckCircle2, AlertTriangle, ListTodo, ServerOff } from 'lucide-react';

const Checklist: React.FC<{ items: ArchitectureItem[] }> = ({ items }) => {
  const allItems = items.flatMap(i => i.items);
  const total = allItems.length;
  const completed = allItems.filter(i => i.status === 'IMPLEMENTED').length;
  const partial = allItems.filter(i => i.status === 'PARTIAL').length;
  const backend = allItems.filter(i => i.status === 'BACKEND_REQUIRED').length;
  
  // Scoring: Implemented = 1, Partial = 0.5
  const score = completed + (partial * 0.5);
  const percentage = Math.round((score / total) * 100);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-indigo-900 rounded-xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ListTodo className="h-6 w-6 text-indigo-400" />
              Architecture Implementation Status
            </h2>
            <p className="text-indigo-200 mt-1">
              Verification of frontend deliverables against architectural requirements.
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold">{percentage}%</span>
            <p className="text-xs text-indigo-300 uppercase tracking-wider">Completion</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-indigo-800 rounded-full h-3 mb-6">
          <div 
            className="bg-green-400 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 border-t border-indigo-800 pt-6">
          <div className="text-center border-r border-indigo-800">
            <p className="text-2xl font-bold text-green-400">{completed}</p>
            <p className="text-xs text-indigo-300">Implemented</p>
          </div>
          <div className="text-center border-r border-indigo-800">
            <p className="text-2xl font-bold text-yellow-400">{partial}</p>
            <p className="text-xs text-indigo-300">Partial / Mock UI</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-400">{backend}</p>
            <p className="text-xs text-indigo-300">Backend Required</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((category, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">{category.category}</h3>
              <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                {category.items.filter(i => i.status === 'IMPLEMENTED').length}/{category.items.length} Ready
              </span>
            </div>
            <div className="divide-y divide-slate-100 flex-1">
              {category.items.map((item, itemIdx) => (
                <div key={itemIdx} className="px-6 py-4 flex items-start space-x-3 hover:bg-slate-50 transition-colors">
                  <div className="mt-0.5 flex-shrink-0">
                    {item.status === 'IMPLEMENTED' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : item.status === 'PARTIAL' ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <ServerOff className="h-5 w-5 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className={`text-sm font-medium truncate pr-2 ${
                        item.status === 'IMPLEMENTED' ? 'text-slate-900' : 
                        item.status === 'PARTIAL' ? 'text-yellow-700' : 'text-slate-500'
                      }`}>
                        {item.label}
                      </p>
                    </div>
                    {item.note && (
                      <p className="text-xs text-slate-500 mt-0.5">{item.note}</p>
                    )}
                  </div>
                  <span className={`flex-shrink-0 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide ${
                    item.status === 'IMPLEMENTED' ? 'bg-green-100 text-green-700' :
                    item.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {item.status === 'BACKEND_REQUIRED' ? 'Backend' : item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Checklist;
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { KPI } from '../types';

const StatCard: React.FC<{ data: KPI }> = ({ data }) => {
  return (
    <div className="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <p className="truncate text-sm font-medium text-slate-500">{data.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{data.value}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm">
            {data.trend === 'up' ? (
              <ArrowUpRight className="mr-1.5 h-4 w-4 flex-shrink-0 text-green-500" />
            ) : data.trend === 'down' ? (
              <ArrowDownRight className="mr-1.5 h-4 w-4 flex-shrink-0 text-red-500" />
            ) : (
              <Minus className="mr-1.5 h-4 w-4 flex-shrink-0 text-slate-500" />
            )}
            <span className={`font-medium ${
              data.trend === 'up' ? 'text-green-600' : 
              data.trend === 'down' ? 'text-red-600' : 'text-slate-600'
            }`}>
              {data.change}
            </span>
            <span className="ml-2 text-slate-400">vs last month</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
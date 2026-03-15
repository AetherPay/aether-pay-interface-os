
import React from 'react';
import { FeedItem } from '../types';
import { AlertCircle, CheckCircle2, Info, Zap, ShieldAlert, History } from 'lucide-react';

interface LiveFeedProps {
  feed: FeedItem[];
  onItemClick?: (item: FeedItem) => void;
}

const LiveFeed: React.FC<LiveFeedProps> = ({ feed, onItemClick }) => {
  const getIcon = (type: FeedItem['type'], severity: FeedItem['severity']) => {
    if (severity === 'CRITICAL') return <ShieldAlert className="h-4 w-4 text-red-500" />;
    switch (type) {
      case 'TRANSACTION': return <Zap className="h-4 w-4 text-indigo-500" />;
      case 'RISK': return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'KYC': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'SYSTEM': return <Info className="h-4 w-4 text-slate-500" />;
      case 'AUDIT': return <History className="h-4 w-4 text-indigo-400" />;
      default: return <Info className="h-4 w-4 text-slate-500" />;
    }
  };

  const getBgColor = (severity: FeedItem['severity']) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-50 border-red-100 hover:bg-red-100';
      case 'WARNING': return 'bg-amber-50 border-amber-100 hover:bg-amber-100';
      default: return 'bg-white border-slate-100 hover:bg-slate-50';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden transition-all hover:shadow-md">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-xs font-black text-slate-500 flex items-center uppercase tracking-widest">
          <History size={14} className="text-indigo-500 mr-2" />
          Live_Event_Feed
        </h3>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar max-h-[440px]">
        {feed.map((item) => (
          <button 
            key={item.id} 
            onClick={() => onItemClick?.(item)}
            className={`w-full text-left p-3.5 rounded-xl border ${getBgColor(item.severity)} transition-all group flex items-start space-x-4`}
          >
            <div className="mt-0.5 flex-shrink-0 bg-white rounded-lg p-1.5 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
              {getIcon(item.type, item.severity)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   {item.type} • {item.department || 'CORTEX'}
                 </p>
                 <span className="text-[10px] text-slate-400 font-bold">{item.time}</span>
              </div>
              <p className="text-xs font-bold text-slate-800 leading-snug">
                {item.message}
              </p>
            </div>
          </button>
        ))}
      </div>
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl text-center">
        <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">View Full Audit Trail</button>
      </div>
    </div>
  );
};

export default LiveFeed;

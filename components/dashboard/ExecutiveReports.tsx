import React from 'react';
import { Download } from 'lucide-react';

const ExecutiveReports: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-500">
    {['Q4 Financials', 'Compliance Audit', 'Operational SLA', 'Risk Exposure'].map((report) => (
      <div
        key={report}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center"
      >
        <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
          <Download size={20} />
        </div>
        <h3 className="text-xs font-black uppercase italic mb-1">{report}</h3>
        <p className="text-[9px] text-slate-400 font-bold mb-4">OCT 2025 · PDF</p>
        <button className="w-full py-2 bg-slate-950 text-white text-[9px] font-black uppercase rounded-lg">Download</button>
      </div>
    ))}
  </div>
);

export default ExecutiveReports;

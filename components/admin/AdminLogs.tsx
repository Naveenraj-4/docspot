
import React from 'react';
import { SystemLog } from '../../types';
import { ScrollText } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  logs: SystemLog[];
}

export const AdminLogs: React.FC<Props> = ({ logs }) => {
  return (
    <div className="space-y-6 animate-slide-up">
        <div className="bg-slate-900 text-slate-300 rounded-[2rem] shadow-xl border border-slate-800 overflow-hidden font-mono text-sm">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                <div className="flex items-center gap-2">
                     <ScrollText className="w-4 h-4 text-emerald-500" />
                     <span className="font-bold">SYSTEM_AUDIT_LOGS</span>
                </div>
                <span className="text-xs text-slate-500">{logs.length} entries</span>
            </div>
            <div className="max-h-[600px] overflow-y-auto p-4 space-y-2">
                {logs.map(log => (
                    <div key={log.id} className="flex gap-4 p-2 hover:bg-white/5 rounded border-b border-white/5 last:border-0">
                        <span className="text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</span>
                        <span className={clsx("font-bold uppercase w-32", 
                            log.type === 'LOGIN' ? "text-blue-400" :
                            log.type === 'BOOKING' ? "text-emerald-400" :
                            log.type === 'STATUS_CHANGE' ? "text-amber-400" :
                            "text-slate-300"
                        )}>{log.type}</span>
                        <span className="text-slate-400 w-40 truncate" title={log.userId}>{log.userName}</span>
                        <span className="text-slate-300 flex-1">{log.details}</span>
                    </div>
                ))}
                {logs.length === 0 && <div className="text-center py-8 text-slate-600">No system logs available.</div>}
            </div>
        </div>
    </div>
  );
};

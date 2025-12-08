
import React, { useState } from 'react';
import { CallRecord } from '../../types';
import { Video, Mic, PlayCircle, Trash2, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { PlaybackModal } from '../PlaybackModal';

interface Props {
  calls: CallRecord[];
  onDelete: (id: string) => void;
  actionLoading: string | null;
}

export const AdminRecordings: React.FC<Props> = ({ calls, onDelete, actionLoading }) => {
  const [playbackRecord, setPlaybackRecord] = useState<CallRecord | null>(null);

  return (
    <div className="space-y-6 animate-slide-up">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <tr>
                        <th className="p-6">Type</th>
                        <th className="p-6">Participants</th>
                        <th className="p-6">Duration</th>
                        <th className="p-6">Size</th>
                        <th className="p-6">Date</th>
                        <th className="p-6 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {calls.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-6">
                                <div className={clsx("inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold uppercase border", 
                                    c.type === 'video' ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200" : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200"
                                )}>
                                    {c.type === 'video' ? <Video className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                                    {c.type}
                                </div>
                            </td>
                            <td className="p-6">
                                <p className="font-bold text-slate-900 dark:text-white">{c.callerName}</p>
                                <p className="text-xs text-slate-500">to {c.receiverName}</p>
                            </td>
                            <td className="p-6 font-mono text-sm text-slate-600 dark:text-slate-400">{Math.floor(c.duration / 60)}m {c.duration % 60}s</td>
                            <td className="p-6 text-sm text-slate-500">{c.size}</td>
                            <td className="p-6 text-sm text-slate-500">{new Date(c.timestamp).toLocaleString()}</td>
                            <td className="p-6 text-right">
                                <div className="flex gap-2 justify-end">
                                    <button onClick={() => setPlaybackRecord(c)} className="p-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                                        <PlayCircle className="w-4 h-4" /> <span className="text-xs font-bold">Play</span>
                                    </button>
                                    <button 
                                        onClick={() => onDelete(c.id)} 
                                        disabled={actionLoading === c.id}
                                        className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading === c.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {calls.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                    <Video className="w-12 h-12 mb-3 opacity-20" />
                    <p>No recordings stored in secure vault.</p>
                </div>
            )}
        </div>
        
        {/* Playback Modal */}
        <PlaybackModal record={playbackRecord} onClose={() => setPlaybackRecord(null)} />
    </div>
  );
};

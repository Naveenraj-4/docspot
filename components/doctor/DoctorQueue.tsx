
import React from 'react';
import { Appointment, AppointmentStatus } from '../../types';
import { AlertCircle, Check, X, Clock, Users, Loader2 } from 'lucide-react';

interface Props {
  pendingRequests: Appointment[];
  queue: Appointment[];
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  processingId: string | null;
}

export const DoctorQueue: React.FC<Props> = ({ pendingRequests, queue, onStatusChange, processingId }) => {
  return (
    <div className="xl:col-span-4 space-y-6">
        {/* PENDING REQUESTS */}
        {pendingRequests.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] p-6 border border-amber-100 dark:border-amber-800/30">
                <h3 className="font-bold text-amber-700 dark:text-amber-500 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> New Requests ({pendingRequests.length})
                </h3>
                <div className="space-y-3">
                    {pendingRequests.map(req => (
                        <div key={req.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-amber-100 dark:border-amber-800/50 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{req.patientName}</p>
                                <p className="text-xs text-slate-500">{req.time} • {req.date}</p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => onStatusChange(req.id, AppointmentStatus.ACCEPTED)} 
                                    disabled={processingId === req.id}
                                    className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 disabled:opacity-50"
                                >
                                    {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4"/>}
                                </button>
                                <button 
                                    onClick={() => onStatusChange(req.id, AppointmentStatus.REJECTED)} 
                                    disabled={processingId === req.id}
                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50"
                                >
                                    <X className="w-4 h-4"/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* PATIENT QUEUE */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-full max-h-[600px] flex flex-col">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" /> Patient Queue
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {queue.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Queue is currently empty.</p>
                    </div>
                ) : (
                    queue.map((pt, idx) => (
                        <div key={pt.id} className="group p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{pt.patientName}</p>
                                        <p className="text-xs text-slate-500">{pt.time}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onStatusChange(pt.id, AppointmentStatus.IN_PROGRESS)}
                                    disabled={processingId === pt.id}
                                    className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                >
                                    {processingId === pt.id ? <Loader2 className="w-3 h-3 animate-spin"/> : 'Call In'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

    </div>
  );
};

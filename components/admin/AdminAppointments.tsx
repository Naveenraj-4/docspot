
import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '../../types';
import { Eye, Check, X, Loader2, RotateCcw, Calendar, Filter, Search } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  appointments: Appointment[];
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  onViewChat: (apt: Appointment) => void;
  actionLoading: string | null;
}

export const AdminAppointments: React.FC<Props> = ({ appointments, onStatusChange, onViewChat, actionLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'all'>('all');
  const [filterDate, setFilterDate] = useState('');
  
  const filteredAppointments = appointments.filter(a => {
      const matchSearch = a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = filterStatus === 'all' || a.status === filterStatus;
      const matchDate = !filterDate || a.date === filterDate;

      return matchSearch && matchStatus && matchDate;
  });

  const resetFilters = () => {
      setSearchTerm('');
      setFilterStatus('all');
      setFilterDate('');
  };

  return (
    <div className="space-y-6 animate-slide-up">
        {/* FILTERS TOOLBAR */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
             <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto flex-1">
                {/* Text Search */}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm min-w-[240px] flex-1">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                        className="bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white placeholder-slate-400 w-full outline-none"
                        placeholder="Search ID, Doctor, or Patient..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <Filter className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <select 
                        className="pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none min-w-[160px]"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value as AppointmentStatus | 'all')}
                    >
                        <option value="all">All Statuses</option>
                        <option value={AppointmentStatus.PENDING}>Pending</option>
                        <option value={AppointmentStatus.ACCEPTED}>Accepted</option>
                        <option value={AppointmentStatus.IN_PROGRESS}>In Progress</option>
                        <option value={AppointmentStatus.COMPLETED}>Completed</option>
                        <option value={AppointmentStatus.REJECTED}>Rejected</option>
                    </select>
                </div>

                {/* Date Filter */}
                <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input 
                        type="date"
                        className="pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[160px]"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                    />
                </div>

                {/* Reset Button */}
                {(searchTerm || filterStatus !== 'all' || filterDate) && (
                    <button onClick={resetFilters} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-red-500 transition-colors" title="Reset Filters">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                )}
             </div>
             
             <div className="text-sm font-bold text-slate-400 bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm whitespace-nowrap">
                 {filteredAppointments.length} Found
             </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <tr>
                            <th className="p-6">ID / Date</th>
                            <th className="p-6">Doctor</th>
                            <th className="p-6">Patient</th>
                            <th className="p-6">Status</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredAppointments.map(a => (
                            <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="p-6">
                                    <p className="text-xs font-mono text-slate-400 mb-1">{a.id.slice(0,8)}...</p>
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                        <Calendar className="w-3 h-3 text-emerald-500" /> {a.date}
                                    </div>
                                    <div className="text-xs text-slate-500 ml-5">{a.time}</div>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <img src={a.doctorAvatar} className="w-8 h-8 rounded-full object-cover" />
                                        <span className="font-bold text-slate-900 dark:text-white">{a.doctorName}</span>
                                    </div>
                                </td>
                                <td className="p-6 text-slate-600 dark:text-slate-300">{a.patientName}</td>
                                <td className="p-6">
                                    <span className={clsx("px-3 py-1.5 rounded-xl text-xs font-bold uppercase border tracking-wider", 
                                        a.status === AppointmentStatus.COMPLETED ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" :
                                        a.status === AppointmentStatus.PENDING ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" :
                                        a.status === AppointmentStatus.ACCEPTED ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" :
                                        a.status === AppointmentStatus.IN_PROGRESS ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800" :
                                        "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                                    )}>
                                        {a.status === AppointmentStatus.IN_PROGRESS ? 'Live' : a.status}
                                    </span>
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => onViewChat(a)} className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors" title="View Chat Logs">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        {a.status === AppointmentStatus.PENDING && (
                                            <>
                                                <button 
                                                    onClick={()=>onStatusChange(a.id, AppointmentStatus.ACCEPTED)} 
                                                    disabled={actionLoading === a.id}
                                                    className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-md disabled:opacity-50 transition-all hover:scale-105" 
                                                    title="Approve"
                                                >
                                                    {actionLoading === a.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4" />}
                                                </button>
                                                <button 
                                                    onClick={()=>onStatusChange(a.id, AppointmentStatus.REJECTED)} 
                                                    disabled={actionLoading === a.id}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md disabled:opacity-50 transition-all hover:scale-105" 
                                                    title="Reject"
                                                >
                                                    {actionLoading === a.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <X className="w-4 h-4" />}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredAppointments.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                        <Filter className="w-12 h-12 mb-3 opacity-20" />
                        <p>No appointments match your filters.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

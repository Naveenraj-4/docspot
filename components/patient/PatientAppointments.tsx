
import React, { useState } from 'react';
import { Appointment, CallRecord, AppointmentStatus, User } from '../../types';
import { Clock, Search, X, Video, PlayCircle, CalendarDays, FileText, Star, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

type TabType = 'all' | 'upcoming' | 'completed' | 'cancelled' | 'recordings';

interface Props {
  user: User;
  appointments: Appointment[];
  recordings: CallRecord[];
  loading: boolean;
  onOpenPlayback: (rec: CallRecord) => void;
  onOpenReview: (apt: Appointment) => void;
  onOpenPrescription: (apt: Appointment) => void;
}

export const PatientAppointments: React.FC<Props> = ({ user, appointments, recordings, loading, onOpenPlayback, onOpenReview, onOpenPrescription }) => {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.ACCEPTED: return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400';
      case AppointmentStatus.PENDING: return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400';
      case AppointmentStatus.REJECTED: return 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400';
      case AppointmentStatus.COMPLETED: return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const filteredAppointments = appointments.filter(apt => {
      // Tab Filter
      if (activeTab === 'upcoming') {
          if (![AppointmentStatus.ACCEPTED, AppointmentStatus.PENDING, AppointmentStatus.IN_PROGRESS].includes(apt.status)) return false;
      }
      if (activeTab === 'completed' && apt.status !== AppointmentStatus.COMPLETED) return false;
      if (activeTab === 'cancelled' && apt.status !== AppointmentStatus.REJECTED) return false;

      // Search Filter
      const searchMatch = 
        apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        apt.reason.toLowerCase().includes(searchTerm.toLowerCase());
      if (!searchMatch) return false;

      // Date Filter
      if (filterDate && apt.date !== filterDate) return false;

      return true;
  });

  return (
    <div className="lg:col-span-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-full min-h-[600px]">
              
        {/* TABS & FILTERS */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-4 bg-white/40 dark:bg-slate-900/40">
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" /> Records & Timeline
                </h2>
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto hide-scrollbar">
                    {(['all', 'upcoming', 'completed', 'cancelled', 'recordings'] as TabType[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap",
                                activeTab === tab 
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            
            {activeTab !== 'recordings' && (
                <div className="flex gap-2 animate-fade-in">
                    <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 flex items-center gap-2">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input 
                            className="bg-transparent border-none text-sm w-full focus:outline-none dark:text-white"
                            placeholder="Search doctor or reason..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <input 
                        type="date" 
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-500 dark:text-slate-400 focus:outline-none"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                    />
                    {(searchTerm || filterDate) && (
                        <button onClick={() => { setSearchTerm(''); setFilterDate(''); }} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}
        </div>

        {/* LIST CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
                <div className="text-center py-12 text-slate-400 animate-pulse">Loading records...</div>
            ) : activeTab === 'recordings' ? (
                /* RECORDINGS TAB */
                recordings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <Video className="w-12 h-12 mb-4 opacity-20" />
                        <p>No recording history available.</p>
                    </div>
                ) : (
                    recordings.map((rec, idx) => (
                        <div key={rec.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center", rec.type === 'video' ? "bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30" : "bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30")}>
                                    {rec.type === 'video' ? <Video className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">Call with {rec.callerId === user.id ? rec.receiverName : rec.callerName}</p>
                                    <p className="text-xs text-slate-500">{new Date(rec.timestamp).toLocaleString()} • {Math.floor(rec.duration / 60)}m {rec.duration % 60}s</p>
                                </div>
                            </div>
                            <button onClick={() => onOpenPlayback(rec)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-xs font-bold transition-colors">
                                Play Recording
                            </button>
                        </div>
                    ))
                )
            ) : filteredAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <CalendarDays className="w-12 h-12 mb-4 opacity-20" />
                    <p>No appointments found matching your filters.</p>
                </div>
            ) : (
                filteredAppointments.map((apt, idx) => (
                    <div 
                      key={apt.id} 
                      className="group bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <img src={apt.doctorAvatar} className="w-12 h-12 rounded-xl object-cover" />
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{apt.doctorName}</h4>
                                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        <span className="mr-3">{new Date(apt.date).toLocaleDateString()}</span>
                                        <span>{apt.time}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                <span className={clsx("px-3 py-1 rounded-full text-xs font-bold uppercase border", getStatusColor(apt.status))}>
                                    {apt.status === AppointmentStatus.IN_PROGRESS ? 'In Progress' : apt.status}
                                </span>

                                <div className="flex gap-2">
                                    {apt.status === AppointmentStatus.COMPLETED && (
                                        <>
                                            {apt.prescription && (
                                                <button onClick={() => onOpenPrescription(apt)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="View Prescription">
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                            )}
                                            {!apt.isReviewed && (
                                                <button onClick={() => onOpenReview(apt)} className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Review & Tip">
                                                    <Star className="w-4 h-4" />
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {[AppointmentStatus.ACCEPTED, AppointmentStatus.PENDING, AppointmentStatus.IN_PROGRESS].includes(apt.status) && (
                                        <Link to={`/chat/${apt.id}`} className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
                                            <MessageSquare className="w-4 h-4" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/50">
                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1"><span className="font-bold text-slate-400 text-xs uppercase mr-2">Reason:</span> {apt.reason}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

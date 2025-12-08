
import React from 'react';
import { Link } from 'react-router-dom';
import { Appointment, AppointmentStatus } from '../../types';
import { Calendar, MessageSquare, CheckCircle, FileText } from 'lucide-react';

interface Props {
  nextAppointment: Appointment | undefined;
  completedCount: number;
  prescriptionCount: number;
}

export const PatientStats: React.FC<Props> = ({ nextAppointment, completedCount, prescriptionCount }) => {
  return (
    <div className="space-y-8">
        {/* Next Appt Card */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" /> Next Visit
            </h2>
            
            {nextAppointment ? (
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <img src={nextAppointment.doctorAvatar} className="w-16 h-16 rounded-2xl object-cover bg-slate-200 border-2 border-white dark:border-slate-700 shadow-lg" />
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{nextAppointment.doctorName}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded text-xs font-bold">
                                    {nextAppointment.type}
                                </span>
                                <span>•</span>
                                <span>{nextAppointment.reason}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex justify-between items-center mb-6 border border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Date</p>
                            <p className="font-bold text-slate-700 dark:text-slate-200">{new Date(nextAppointment.date).toLocaleDateString()}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Time</p>
                            <p className="font-bold text-slate-700 dark:text-slate-200">{nextAppointment.time}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Status</p>
                            <p className="font-bold text-emerald-500">Confirmed</p>
                        </div>
                    </div>

                    <Link 
                    to={`/chat/${nextAppointment.id}`}
                    className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95"
                    >
                        <MessageSquare className="w-4 h-4" /> Open Secure Chat
                    </Link>
                </div>
            ) : (
                <div className="text-center py-8 text-slate-400">
                    <p>No upcoming appointments.</p>
                    <Link to="/book" className="text-emerald-500 font-bold hover:underline text-sm">Schedule one now</Link>
                </div>
            )}
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center mb-3">
                    <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{completedCount}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Completed Visits</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-500 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{prescriptionCount}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Prescriptions</p>
            </div>
        </div>
    </div>
  );
};


import React from 'react';
import { User, Doctor, AppointmentStatus, Appointment } from '../../types';
import { Shield, Users, Activity } from 'lucide-react';

interface Props {
  user: User;
  doctorDetails: Doctor | null;
  currentTime: Date;
  queueLength: number;
  completedTodayRevenue: number;
}

export const DoctorHeader: React.FC<Props> = ({ user, doctorDetails, currentTime, queueLength, completedTodayRevenue }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
        {/* Profile Hero */}
        <div className="lg:col-span-8 relative bg-slate-900 dark:bg-black rounded-[2rem] p-8 overflow-hidden shadow-2xl border border-slate-800 group">
             {/* Animated BG */}
             <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-emerald-500/20 via-blue-900/10 to-transparent rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 group-hover:scale-110 transition-transform duration-1000 pointer-events-none"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                 <div className="flex items-center gap-6">
                     <div className="relative">
                        <img src={user.avatar} className="w-20 h-20 rounded-2xl border-2 border-white/20 shadow-lg" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse"></div>
                     </div>
                     <div>
                         <div className="flex items-center gap-2 mb-1">
                             <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Dr. {user.name}</h1>
                             <Shield className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                         </div>
                         <p className="text-slate-400 text-sm flex items-center gap-2">
                             <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-xs font-bold border border-emerald-500/20">{doctorDetails?.specialization}</span> 
                             <span className="w-1 h-1 bg-slate-600 rounded-full"></span> 
                             <span className="text-xs font-medium uppercase tracking-wider">{doctorDetails?.hospital}</span>
                         </p>
                     </div>
                 </div>

                 <div className="text-right">
                     <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Current Session</p>
                     <p className="text-3xl font-mono text-white font-bold tabular-nums">
                        {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </p>
                     <p className="text-emerald-400 text-xs font-bold mt-1">Shift Active • On Duty</p>
                 </div>
             </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                 <div className="flex justify-between items-start mb-4">
                     <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                         <Users className="w-6 h-6" />
                     </div>
                     <span className="text-xs font-bold text-slate-400 uppercase">Total Queue</span>
                 </div>
                 <p className="text-3xl font-bold text-slate-900 dark:text-white">{queueLength}</p>
                 <p className="text-xs text-slate-500 mt-1">Patients waiting</p>
             </div>

             <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                 <div className="flex justify-between items-start mb-4">
                     <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                         <Activity className="w-6 h-6" />
                     </div>
                     <span className="text-xs font-bold text-slate-400 uppercase">Revenue</span>
                 </div>
                 <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">${completedTodayRevenue}</p>
                 <p className="text-xs text-slate-500 mt-1">Generated today</p>
             </div>
        </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Activity, Signal, TrendingUp, DollarSign, Users, UserPlus, Calendar, Shield, Database, Cloud, HardDrive, CreditCard } from 'lucide-react';
import { CallSession, CallRecord } from '../../types';
import { mockDb } from '../../services/mockDb';
import clsx from 'clsx';

interface Props {
  activeCall: CallSession | null;
  calls: CallRecord[];
  analytics: { users: any, finance: any };
}

export const AdminOverview: React.FC<Props> = ({ activeCall, calls, analytics }) => {
  const [dbStatus, setDbStatus] = useState(mockDb.getConnectionStatus());

  useEffect(() => {
     setDbStatus(mockDb.getConnectionStatus());
  }, []);

  return (
    <div className="space-y-8 animate-slide-up">
            
        {/* Live Operations Monitor */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-[2rem] border border-slate-700 shadow-xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 p-6 opacity-10">
                <Activity className="w-32 h-32" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Signal className={clsx("w-6 h-6", activeCall ? "text-emerald-400 animate-pulse" : "text-slate-500")} />
                        Live System Status
                    </h2>
                    <p className="text-slate-400 mt-1">Real-time infrastructure monitoring</p>
                </div>
                
                <div className="flex gap-4">
                    <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Active Calls</p>
                        <p className={clsx("text-2xl font-bold", activeCall ? "text-emerald-400" : "text-slate-500")}>
                            {activeCall ? "1 Active Session" : "System Idle"}
                        </p>
                    </div>
                    
                    {/* Database Status Widget */}
                    <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col min-w-[160px]">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                            {dbStatus.type === 'Cloud Synced' ? <Cloud className="w-3 h-3" /> : <HardDrive className="w-3 h-3" />}
                            Database Mode
                        </p>
                        <p className={clsx("text-lg font-bold", dbStatus.type === 'Cloud Synced' ? "text-blue-400" : "text-amber-400")}>
                            {dbStatus.type}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">Status: {dbStatus.status}</p>
                    </div>
                </div>
            </div>
            {activeCall && (
                <div className="mt-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-3 animate-fade-in">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-sm font-bold text-emerald-200">
                        Dr. {activeCall.caller.name} is currently in a {activeCall.isVideo ? 'Video' : 'Audio'} call.
                    </span>
                </div>
            )}
        </div>

        {/* REAL ANALYTICS BOARD */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" /> User Growth Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
                { label: 'New Today', val: `+${analytics.users.today}`, sub: 'Signups', icon: UserPlus, color: 'blue' },
                { label: 'This Week', val: `+${analytics.users.week}`, sub: 'Growth', icon: Users, color: 'indigo' },
                { label: 'This Month', val: `+${analytics.users.month}`, sub: 'Total', icon: Calendar, color: 'violet' },
                { label: 'Total Users', val: analytics.users.total, sub: 'Active', icon: Shield, color: 'emerald' },
            ].map((stat, i) => (
                <div key={i} className={`bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all group`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 group-hover:scale-105 transition-transform">{stat.val}</p>
                            <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
                        </div>
                        <div className={`p-3 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* FINANCIAL OVERVIEW */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-4">
            <DollarSign className="w-5 h-5 text-amber-500" /> Financial Overview (Revenue & Tips)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Total Revenue Card */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-[2rem] text-white shadow-lg relative overflow-hidden md:col-span-1">
                    <div className="relative z-10">
                        <p className="text-emerald-100 text-xs font-bold uppercase mb-1">Lifetime Revenue</p>
                        <h3 className="text-3xl font-bold">${analytics.finance.total.toLocaleString()}</h3>
                        <p className="text-xs text-emerald-200 mt-2">Completed appointments</p>
                    </div>
                    <DollarSign className="absolute -bottom-4 -right-4 w-32 h-32 text-emerald-500 opacity-20 rotate-12" />
                </div>

                {/* Daily Revenue */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                         <CreditCard className="w-16 h-16 text-emerald-500" />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Today</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">${analytics.finance.today.toLocaleString()}</h3>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
                    </p>
                </div>

                {/* Weekly Revenue */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                         <TrendingUp className="w-16 h-16 text-blue-500" />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">This Week</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">${(analytics.finance.week || 0).toLocaleString()}</h3>
                    <p className="text-xs text-slate-500 mt-2">Last 7 Days</p>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative group overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                         <Calendar className="w-16 h-16 text-violet-500" />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">This Month</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">${analytics.finance.month.toLocaleString()}</h3>
                    <p className="text-xs text-slate-500 mt-2">Last 30 Days</p>
                </div>
        </div>
    </div>
  );
};
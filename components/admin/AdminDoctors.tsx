import React, { useState, useEffect } from 'react';
import { Doctor, User } from '../../types';
import { Search, RotateCcw, Plus, Lock, Power, Edit2, Trash2, Loader2, MapPin, DollarSign, Clock, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { mockDb } from '../../services/mockDb';

interface Props {
  doctors: Doctor[];
  onCreate: () => void;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onDelete: (id: string) => void;
  actionLoading: string | null;
}

export const AdminDoctors: React.FC<Props> = ({ doctors, onCreate, onEdit, onToggleStatus, onDelete, actionLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpec, setFilterSpec] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'disabled'>('all');
  const [revenues, setRevenues] = useState<Record<string, number>>({});

  const specializations = ['General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'Orthopedic', 'Psychiatrist', 'Dentist', 'Surgeon', 'ENT Specialist'];

  useEffect(() => {
    const loadRevenues = async () => {
        const revMap: Record<string, number> = {};
        for (const doc of doctors) {
            revMap[doc.id] = await mockDb.getDoctorRevenue(doc.id);
        }
        setRevenues(revMap);
    };
    loadRevenues();
  }, [doctors]);

  const filteredDoctors = doctors.filter(d => {
      const matchSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'all' || d.accountStatus === filterStatus;
      const matchSpec = filterSpec === 'all' || d.specialization === filterSpec;
      return matchSearch && matchStatus && matchSpec;
  });

  const resetFilters = () => {
      setSearchTerm('');
      setFilterSpec('all');
      setFilterStatus('all');
  };

  return (
    <div className="space-y-6 animate-slide-up">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* FILTERS */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm min-w-[200px] flex-1">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                        className="bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white placeholder-slate-400 w-full"
                        placeholder="Search doctors..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <select 
                    className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={filterSpec}
                    onChange={e => setFilterSpec(e.target.value)}
                >
                    <option value="all">All Specialties</option>
                    {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select 
                    className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value as any)}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                </select>

                {(searchTerm || filterSpec !== 'all' || filterStatus !== 'all') && (
                    <button onClick={resetFilters} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-red-500 transition-colors" title="Reset Filters">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                )}
            </div>

            <button onClick={onCreate} className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all flex items-center shadow-lg whitespace-nowrap">
                <Plus className="w-5 h-5 mr-2" /> Add New Doctor
            </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <tr><th className="p-6">Doctor</th><th className="p-6">Status</th><th className="p-6">Specialty</th><th className="p-6">Earnings</th><th className="p-6 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredDoctors.map(d => (
                        <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={d.avatar} className="w-10 h-10 rounded-full bg-slate-200 object-cover shadow-sm" />
                                        <div className={clsx("absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white dark:border-slate-900 rounded-full", d.accountStatus === 'active' ? 'bg-emerald-500' : 'bg-red-500')}></div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{d.name}</p>
                                        <p className="text-xs text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                                            <MapPin className="w-3 h-3" /> {d.hospital || 'Private Clinic'}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-6">
                                <span className={clsx("px-2 py-1 rounded-lg text-xs font-bold uppercase border", 
                                    d.accountStatus === 'active' ? "bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                                )}>
                                    {d.accountStatus || 'active'}
                                </span>
                            </td>
                            <td className="p-6">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{d.specialization}</p>
                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {d.experience} Yrs Exp.
                                    </p>
                                </div>
                            </td>
                            <td className="p-6">
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                        <DollarSign className="w-4 h-4" /> {(revenues[d.id] || 0).toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">Total Revenue</span>
                                </div>
                            </td>
                            <td className="p-6 text-right">
                                <div className="flex gap-2 justify-end">
                                    <button 
                                        onClick={()=>onToggleStatus(d)} 
                                        disabled={actionLoading === d.id}
                                        className={clsx("p-2 rounded-lg transition-colors disabled:opacity-50", d.accountStatus === 'active' ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20" : "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20")}
                                        title={d.accountStatus === 'active' ? 'Disable Account' : 'Enable Account'}
                                    >
                                        {actionLoading === d.id ? <Loader2 className="w-4 h-4 animate-spin"/> : (d.accountStatus === 'active' ? <Lock className="w-4 h-4"/> : <Power className="w-4 h-4"/>)}
                                    </button>
                                    <button onClick={()=>onEdit(d)} className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors"><Edit2 className="w-4 h-4"/></button>
                                    <button 
                                        onClick={()=>onDelete(d.id)} 
                                        disabled={actionLoading === d.id}
                                        className="text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading === d.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4"/>}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredDoctors.length === 0 && <div className="p-8 text-center text-slate-400">No doctors found matching filters.</div>}
        </div>
    </div>
  );
};
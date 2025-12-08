
import React, { useState } from 'react';
import { User } from '../../types';
import { Search, RotateCcw, Plus, Lock, Power, Edit2, Trash2, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  patients: User[];
  onCreate: () => void;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onDelete: (id: string) => void;
  actionLoading: string | null;
}

export const AdminPatients: React.FC<Props> = ({ patients, onCreate, onEdit, onToggleStatus, onDelete, actionLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlood, setFilterBlood] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'disabled'>('all');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const filteredPatients = patients.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'all' || p.accountStatus === filterStatus;
      const matchBlood = filterBlood === 'all' || p.bloodGroup === filterBlood;
      const matchGender = filterGender === 'all' || p.gender === filterGender;
      return matchSearch && matchStatus && matchBlood && matchGender;
  });

  const resetFilters = () => {
      setSearchTerm('');
      setFilterBlood('all');
      setFilterGender('all');
      setFilterStatus('all');
  };

  return (
    <div className="space-y-6 animate-slide-up">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* FILTERS */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto flex-1">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm min-w-[200px] flex-1">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                        className="bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white placeholder-slate-400 w-full"
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <select 
                    className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={filterBlood}
                    onChange={e => setFilterBlood(e.target.value)}
                >
                    <option value="all">All Blood Groups</option>
                    {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>

                <select 
                    className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={filterGender}
                    onChange={e => setFilterGender(e.target.value)}
                >
                    <option value="all">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
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

                {(searchTerm || filterBlood !== 'all' || filterGender !== 'all' || filterStatus !== 'all') && (
                    <button onClick={resetFilters} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-red-500 transition-colors" title="Reset Filters">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                )}
            </div>

            <button onClick={onCreate} className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all flex items-center shadow-lg whitespace-nowrap">
                <Plus className="w-5 h-5 mr-2" /> Add New Patient
            </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <tr><th className="p-6">Patient</th><th className="p-6">Status</th><th className="p-6">Email</th><th className="p-6">Details</th><th className="p-6 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPatients.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-6 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                    {p.name.charAt(0)}
                                </div>
                                {p.name}
                            </td>
                            <td className="p-6">
                                <span className={clsx("px-2 py-1 rounded-lg text-xs font-bold uppercase border", 
                                    p.accountStatus === 'active' ? "bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                                )}>
                                    {p.accountStatus || 'active'}
                                </span>
                            </td>
                            <td className="p-6 text-slate-500 dark:text-slate-400">{p.email}</td>
                            <td className="p-6 text-sm text-slate-500 dark:text-slate-400">
                                {p.age} yrs • {p.gender} • <span className="text-red-500 font-bold">{p.bloodGroup}</span>
                            </td>
                            <td className="p-6 text-right">
                                    <div className="flex gap-2 justify-end">
                                    <button 
                                        onClick={()=>onToggleStatus(p)} 
                                        disabled={actionLoading === p.id}
                                        className="text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 p-2 rounded-lg transition-colors disabled:opacity-50" 
                                        title={p.accountStatus === 'active' ? 'Disable Account' : 'Enable Account'}
                                    >
                                        {actionLoading === p.id ? <Loader2 className="w-4 h-4 animate-spin"/> : (p.accountStatus === 'active' ? <Lock className="w-4 h-4"/> : <Power className="w-4 h-4"/>)}
                                    </button>
                                    <button onClick={()=>onEdit(p)} className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors"><Edit2 className="w-4 h-4"/></button>
                                    <button 
                                        onClick={()=>onDelete(p.id)} 
                                        disabled={actionLoading === p.id}
                                        className="text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading === p.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4"/>}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredPatients.length === 0 && <div className="p-8 text-center text-slate-400">No patients found matching filters.</div>}
        </div>
    </div>
  );
};

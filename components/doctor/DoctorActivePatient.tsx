
import React, { useState } from 'react';
import { Appointment, User, AppointmentStatus, MedicalStatus } from '../../types';
import { ChevronDown, HeartPulse, Wind, Thermometer, MessageSquare, Check, Activity, TrendingUp, Loader2, X, Plus, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { mockDb } from '../../services/mockDb';

interface Props {
  activePatient: Appointment | undefined;
  activePatientUser: User | null;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  onPatientStatusChange: (status: MedicalStatus) => void;
  chartData: any[];
  processingId: string | null;
}

const MEDICAL_STATUSES: MedicalStatus[] = ['Outpatient (OP)', 'Inpatient (IP)', 'Observation', 'Critical', 'Discharged', 'Healthy'];

export const DoctorActivePatient: React.FC<Props> = ({ activePatient, activePatientUser, onStatusChange, onPatientStatusChange, chartData, processingId }) => {
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'notes'>('overview');
  
  // Post-Consultation Update Modal State
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Update Fields
  const [newStatus, setNewStatus] = useState<MedicalStatus>('Outpatient (OP)');
  const [newConditions, setNewConditions] = useState<string[]>([]);
  const [newAllergies, setNewAllergies] = useState<string[]>([]);
  const [newItemInput, setNewItemInput] = useState('');
  const [newItemType, setNewItemType] = useState<'condition' | 'allergy' | null>(null);

  const openUpdateModal = () => {
      if (!activePatientUser) return;
      setNewStatus(activePatientUser.medicalStatus || 'Healthy');
      setNewConditions(activePatientUser.chronicConditions || []);
      setNewAllergies(activePatientUser.allergies || []);
      setShowUpdateModal(true);
  };

  const handleUpdateAndComplete = async () => {
      if (!activePatient || !activePatientUser) return;
      setUpdateLoading(true);
      
      // Update User Health Profile
      await mockDb.updateUser(activePatientUser.id, {
          medicalStatus: newStatus,
          chronicConditions: newConditions,
          allergies: newAllergies
      });
      
      // Complete Appointment
      await onStatusChange(activePatient.id, AppointmentStatus.COMPLETED);
      
      setUpdateLoading(false);
      setShowUpdateModal(false);
  };

  const addItem = () => {
      if (!newItemInput.trim()) return;
      if (newItemType === 'condition') setNewConditions(p => [...p, newItemInput]);
      if (newItemType === 'allergy') setNewAllergies(p => [...p, newItemInput]);
      setNewItemInput('');
      setNewItemType(null);
  };

  const removeItem = (item: string, type: 'condition' | 'allergy') => {
      if (type === 'condition') setNewConditions(p => p.filter(i => i !== item));
      if (type === 'allergy') setNewAllergies(p => p.filter(i => i !== item));
  };

  return (
    <div className="xl:col-span-8 flex flex-col gap-6">
                
        {/* ACTIVE PATIENT CARD */}
        <div className={clsx(
            "relative rounded-[2.5rem] p-1 transition-all duration-500 overflow-hidden min-h-[500px] flex flex-col", 
            activePatient ? "bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-2xl shadow-emerald-500/20" : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
        )}>
            <div className="flex-1 bg-white dark:bg-slate-950 rounded-[2.3rem] p-0 overflow-hidden relative flex flex-col">
                {activePatient ? (
                    <>
                        {/* Console Header */}
                        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                        {activePatient.patientName.charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {activePatient.patientName}
                                        <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 font-mono">ID: {activePatient.patientId.slice(-4)}</span>
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">{activePatient.reason}</p>
                                </div>
                            </div>

                            {/* STATUS CONTROLLER */}
                            <div className="relative z-20">
                                <button 
                                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                                    disabled={processingId === 'status-update'}
                                    className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-3 font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-all shadow-sm text-sm disabled:opacity-70"
                                >
                                    {processingId === 'status-update' ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                    ) : (
                                        <div className={clsx("w-2 h-2 rounded-full", activePatientUser?.medicalStatus === 'Critical' ? "bg-red-500 animate-ping" : "bg-emerald-500")}></div>
                                    )}
                                    {activePatientUser?.medicalStatus || 'Set Status'}
                                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                                </button>
                                
                                {statusDropdownOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-slide-up">
                                        {MEDICAL_STATUSES.map(status => (
                                            <button
                                                key={status}
                                                onClick={() => { onPatientStatusChange(status); setStatusDropdownOpen(false); }}
                                                className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Console Body */}
                        <div className="flex-1 flex flex-col md:flex-row">
                            {/* Left: Vitals & Actions */}
                            <div className="w-full md:w-1/3 p-6 border-r border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 space-y-6">
                                    
                                    {/* Simulated Vitals */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Live Vitals (Simulated)</h4>
                                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-lg"><HeartPulse className="w-5 h-5 animate-pulse" /></div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-bold uppercase">Heart Rate</p>
                                                    <p className="text-lg font-bold text-slate-900 dark:text-white">72 <span className="text-xs font-normal text-slate-400">bpm</span></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-lg"><Wind className="w-5 h-5" /></div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-bold uppercase">SpO2</p>
                                                    <p className="text-lg font-bold text-slate-900 dark:text-white">98 <span className="text-xs font-normal text-slate-400">%</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                            </div>

                            {/* Right: Smart Tabs */}
                            <div className="flex-1 p-6 flex flex-col">
                                    <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                                        {['overview', 'history', 'notes'].map((tab) => (
                                            <button 
                                            key={tab}
                                            onClick={() => setActiveTab(tab as any)}
                                            className={clsx(
                                                "px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all",
                                                activeTab === tab 
                                                    ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                            )}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex-1 animate-fade-in overflow-y-auto max-h-[300px]">
                                        {activeTab === 'overview' && (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                    <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Visit Reason</h5>
                                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{activePatient.reason}</p>
                                                    {activePatient.aiSummary && (
                                                        <div className="mt-3 p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-xl">
                                                            <p className="text-xs text-violet-600 dark:text-violet-300 italic">"AI Summary: {activePatient.aiSummary}"</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                        <p className="text-xs text-slate-400 font-bold uppercase">Age</p>
                                                        <p className="font-bold text-slate-800 dark:text-white">{activePatientUser?.age || '--'} Yrs</p>
                                                    </div>
                                                    <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                        <p className="text-xs text-slate-400 font-bold uppercase">Blood</p>
                                                        <p className="font-bold text-red-500">{activePatientUser?.bloodGroup || '--'}</p>
                                                    </div>
                                                    {/* NEW HEALTH FIELDS */}
                                                    <div className="col-span-2 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                        <p className="text-xs text-slate-400 font-bold uppercase mb-2">Health Profile</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {activePatientUser?.chronicConditions?.map(c => (
                                                                <span key={c} className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-medium border border-amber-100 dark:border-amber-800">{c}</span>
                                                            ))}
                                                            {activePatientUser?.allergies?.map(a => (
                                                                <span key={a} className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-100 dark:border-rose-800">{a}</span>
                                                            ))}
                                                            {(!activePatientUser?.chronicConditions?.length && !activePatientUser?.allergies?.length) && <span className="text-slate-400 text-sm italic">No conditions recorded</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {activeTab === 'history' && (
                                            <div className="text-center py-10 text-slate-400 text-sm italic">
                                                No previous medical history records found.
                                            </div>
                                        )}
                                        {activeTab === 'notes' && (
                                            <textarea 
                                            className="w-full h-40 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none dark:text-white"
                                            placeholder="Type clinical notes here..."
                                            />
                                        )}
                                    </div>

                                    {/* Action Bar */}
                                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                                        <Link 
                                        to={`/chat/${activePatient.id}`}
                                        className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                                        >
                                            <MessageSquare className="w-4 h-4" /> Open Chat Interface
                                        </Link>
                                        <button 
                                        onClick={openUpdateModal}
                                        disabled={processingId === activePatient.id}
                                        className="flex-1 py-4 bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-70 disabled:scale-100"
                                        >
                                            {processingId === activePatient.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4" />} Complete Session
                                        </button>
                                    </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                        <Activity className="w-24 h-24 text-slate-300 dark:text-slate-700 mb-6" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Station Offline</h3>
                        <p className="text-slate-500">Call a patient from the queue to start session.</p>
                    </div>
                )}
            </div>
        </div>

        {/* POST-CONSULTATION UPDATE MODAL */}
        {showUpdateModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-in">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-emerald-600 text-white">
                        <div className="flex items-center gap-3">
                            <Activity className="w-6 h-6" />
                            <div>
                                <h3 className="font-bold text-lg">Post-Consultation Update</h3>
                                <p className="text-emerald-100 text-xs">Update patient health status before closing.</p>
                            </div>
                        </div>
                        <button onClick={() => setShowUpdateModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                    </div>
                    
                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                        {/* Status Update */}
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Patient Status</label>
                            <select 
                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={newStatus}
                                onChange={e => setNewStatus(e.target.value as MedicalStatus)}
                            >
                                {MEDICAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Conditions */}
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Chronic Conditions</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {newConditions.map(c => (
                                    <div key={c} className="flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-100 dark:border-amber-800">
                                        {c} <button onClick={() => removeItem(c, 'condition')}><X className="w-3 h-3 hover:text-red-500"/></button>
                                    </div>
                                ))}
                                {newItemType === 'condition' ? (
                                    <div className="flex items-center gap-1">
                                        <input autoFocus className="w-32 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm dark:text-white" placeholder="Add condition..." value={newItemInput} onChange={e => setNewItemInput(e.target.value)} />
                                        <button onClick={addItem} className="p-1 bg-emerald-500 text-white rounded"><Check className="w-3 h-3"/></button>
                                        <button onClick={() => setNewItemType(null)} className="p-1 bg-slate-300 text-slate-600 rounded"><X className="w-3 h-3"/></button>
                                    </div>
                                ) : (
                                    <button onClick={() => setNewItemType('condition')} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-xs font-bold hover:bg-emerald-500 hover:text-white transition-colors flex items-center gap-1"><Plus className="w-3 h-3"/> Add</button>
                                )}
                            </div>
                        </div>

                        {/* Allergies */}
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Allergies</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {newAllergies.map(a => (
                                    <div key={a} className="flex items-center gap-1 px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full text-xs font-bold border border-rose-100 dark:border-rose-800">
                                        {a} <button onClick={() => removeItem(a, 'allergy')}><X className="w-3 h-3 hover:text-red-500"/></button>
                                    </div>
                                ))}
                                {newItemType === 'allergy' ? (
                                    <div className="flex items-center gap-1">
                                        <input autoFocus className="w-32 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm dark:text-white" placeholder="Add allergy..." value={newItemInput} onChange={e => setNewItemInput(e.target.value)} />
                                        <button onClick={addItem} className="p-1 bg-emerald-500 text-white rounded"><Check className="w-3 h-3"/></button>
                                        <button onClick={() => setNewItemType(null)} className="p-1 bg-slate-300 text-slate-600 rounded"><X className="w-3 h-3"/></button>
                                    </div>
                                ) : (
                                    <button onClick={() => setNewItemType('allergy')} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-xs font-bold hover:bg-emerald-500 hover:text-white transition-colors flex items-center gap-1"><Plus className="w-3 h-3"/> Add</button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                        <button onClick={() => setShowUpdateModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                        <button 
                            onClick={handleUpdateAndComplete} 
                            disabled={updateLoading}
                            className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                        >
                            {updateLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                            Save & Close Session
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* VISUAL ANALYTICS (Charts) */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm h-80">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" /> Weekly Performance
                </h3>
                <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.3} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: 'white'}}
                                itemStyle={{color: '#fff'}}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
        </div>
    </div>
  );
};

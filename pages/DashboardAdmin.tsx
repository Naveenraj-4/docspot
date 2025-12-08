import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, X, Key, Save, Stethoscope, Loader2, Search, RotateCcw, Clock, Calendar, MapPin, FileText, User as UserIcon, DollarSign, Briefcase } from 'lucide-react';
import { mockDb } from '../services/mockDb';
import { User, Doctor, Appointment, UserRole, AppointmentStatus, SystemLog, CallRecord, CallSession } from '../types';
import { PlaybackModal } from '../components/PlaybackModal';
import { ChatViewerModal } from '../components/ChatViewerModal';
import clsx from 'clsx';

// Components
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminDoctors } from '../components/admin/AdminDoctors';
import { AdminPatients } from '../components/admin/AdminPatients';
import { AdminAppointments } from '../components/admin/AdminAppointments';
import { AdminRecordings } from '../components/admin/AdminRecordings';
import { AdminLogs } from '../components/admin/AdminLogs';

type Tab = 'overview' | 'doctors' | 'patients' | 'appointments' | 'recordings' | 'logs';

export const DashboardAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  
  // Loading States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // ID of item being processed
  const [isSaving, setIsSaving] = useState(false); // For modal save
  
  const [analytics, setAnalytics] = useState<{users: any, finance: any}>({ 
      users: { total: 0, today: 0, week: 0, month: 0 }, 
      finance: { total: 0, today: 0, week: 0, month: 0 } 
  });

  // User Management State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User & Doctor> | null>(null);
  
  // Chat Audit State
  const [chatAuditApt, setChatAuditApt] = useState<Appointment | null>(null);
  
  // Playback State
  const [playbackRecord, setPlaybackRecord] = useState<CallRecord | null>(null);

  const [successMsg, setSuccessMsg] = useState('');
  
  const specializations = ['General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'Orthopedic', 'Psychiatrist', 'Dentist', 'Surgeon', 'ENT Specialist'];
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const refreshData = async () => {
    // We don't set global loading to true on refresh to avoid flashing, unless it's initial
    const allUsers = await mockDb.getAllUsers();
    const allApts = await mockDb.getAllAppointments();
    const allLogs = await mockDb.getSystemLogs();
    const allCalls = await mockDb.getCallRecords();
    const currentCall = mockDb.getActiveCall();
    const stats = await mockDb.getAnalytics();
    
    setUsers(allUsers);
    setDoctors(allUsers.filter(u => u.role === UserRole.DOCTOR) as Doctor[]);
    setPatients(allUsers.filter(u => u.role === UserRole.PATIENT));
    setAppointments(allApts);
    setLogs(allLogs);
    setCalls(allCalls);
    setActiveCall(currentCall);
    setAnalytics(stats);
    setLoading(false);
  };

  useEffect(() => { 
      refreshData();
      const interval = setInterval(() => {
          const call = mockDb.getActiveCall();
          setActiveCall(call);
      }, 5000);
      return () => clearInterval(interval);
  }, []);

  // --- CRUD HANDLERS ---
  const handleEditUser = (user: User) => {
      setEditingUser({ ...user }); 
      setShowUserModal(true);
  };

  const handleCreateDoctor = () => {
      setEditingUser({
          role: UserRole.DOCTOR,
          name: '', email: '', password: '',
          specialization: 'General Physician',
          hospital: 'DocSpot Clinic', fees: 150, experience: 5,
          availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          startTime: '09:00', endTime: '17:00',
          about: 'Committed to providing excellent medical care.',
          accountStatus: 'active'
      });
      setShowUserModal(true);
  };

  const handleCreatePatient = () => {
    setEditingUser({
        role: UserRole.PATIENT,
        name: '', email: '', password: '',
        age: 30, gender: 'Male', bloodGroup: 'O+',
        accountStatus: 'active'
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingUser) return;
      setIsSaving(true);
      
      // Simulate network delay
      await new Promise(r => setTimeout(r, 600));

      try {
          if (editingUser.id) {
              await mockDb.updateUser(editingUser.id, editingUser);
              setSuccessMsg(`Updated user: ${editingUser.name}`);
          } else {
              if (editingUser.role === UserRole.DOCTOR) {
                  await mockDb.createDoctor(editingUser as Doctor);
                  setSuccessMsg(`Created doctor: ${editingUser.name}`);
              } else if (editingUser.role === UserRole.PATIENT) {
                  await mockDb.createPatient(editingUser as User);
                  setSuccessMsg(`Created patient: ${editingUser.name}`);
              }
          }
          setShowUserModal(false);
          await refreshData();
          setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err: any) {
          alert(err.message);
      } finally {
          setIsSaving(false);
      }
  };

  const handleDeleteUser = async (id: string) => { 
      if(confirm('Are you sure you want to PERMANENTLY delete this user? This will also remove their appointments and chats. This cannot be undone.')) { 
          setActionLoading(id);
          await mockDb.deleteUser(id); 
          await refreshData(); 
          setSuccessMsg('User and associated data deleted successfully');
          setActionLoading(null);
          setTimeout(() => setSuccessMsg(''), 3000);
      }
  };
  
  const handleToggleStatus = async (user: User) => {
      setActionLoading(user.id);
      const newStatus = user.accountStatus === 'active' ? 'disabled' : 'active';
      await mockDb.updateUser(user.id, { accountStatus: newStatus });
      await refreshData();
      setSuccessMsg(`User ${newStatus === 'active' ? 'Activated' : 'Disabled'}`);
      setActionLoading(null);
      setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteCall = async (id: string) => { 
      if(confirm('Delete this recording permanently?')) { 
          setActionLoading(id);
          await mockDb.deleteCallRecord(id); 
          await refreshData();
          setActionLoading(null);
      }
  };
  
  const handleAptStatus = async (id: string, status: AppointmentStatus) => {
      setActionLoading(id);
      await mockDb.updateAppointmentStatus(id, status);
      await refreshData();
      setActionLoading(null);
  };

  const toggleDay = (day: string) => {
      if (!editingUser || !editingUser.availableDays) return;
      const days = editingUser.availableDays.includes(day)
        ? editingUser.availableDays.filter(d => d !== day)
        : [...editingUser.availableDays, day];
      setEditingUser({ ...editingUser, availableDays: days });
  };

  if (loading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              <p className="text-slate-500 font-medium">Initializing Command Center...</p>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative z-10">
           <div className="flex items-center gap-2 mb-2">
               <Shield className="w-5 h-5 text-emerald-400" />
               <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Administrator Access</span>
           </div>
           <h1 className="text-4xl font-bold">System Command</h1>
           <p className="text-slate-400">Monitoring {users.length} active users across the network.</p>
        </div>
        <div className="relative z-10 flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 overflow-x-auto max-w-full">
            {(['overview', 'doctors', 'patients', 'appointments', 'recordings', 'logs'] as Tab[]).map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={clsx(
                        "px-5 py-2.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap",
                        activeTab === tab 
                          ? "bg-white text-slate-900 shadow-lg" 
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                    )}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {successMsg && (
         <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/20 flex items-center justify-center font-bold animate-slide-up">
            <CheckCircle className="w-5 h-5 mr-2" /> {successMsg}
         </div>
      )}

      {/* --- CONTENT TABS --- */}
      {activeTab === 'overview' && <AdminOverview activeCall={activeCall} calls={calls} analytics={analytics} />}
      
      {activeTab === 'doctors' && (
        <AdminDoctors 
            doctors={doctors} 
            onCreate={handleCreateDoctor} 
            onEdit={handleEditUser} 
            onDelete={handleDeleteUser} 
            onToggleStatus={handleToggleStatus}
            actionLoading={actionLoading} 
        />
      )}

      {activeTab === 'patients' && (
        <AdminPatients 
            patients={patients} 
            onCreate={handleCreatePatient} 
            onEdit={handleEditUser} 
            onDelete={handleDeleteUser} 
            onToggleStatus={handleToggleStatus}
            actionLoading={actionLoading}
        />
      )}

      {activeTab === 'appointments' && (
          <AdminAppointments 
            appointments={appointments} 
            onStatusChange={handleAptStatus} 
            onViewChat={setChatAuditApt} 
            actionLoading={actionLoading}
          />
      )}

      {activeTab === 'recordings' && (
          <AdminRecordings 
            calls={calls} 
            onDelete={handleDeleteCall}
            actionLoading={actionLoading}
          />
      )}

      {activeTab === 'logs' && <AdminLogs logs={logs} />}


      {/* --- USER EDIT MODAL --- */}
      {showUserModal && editingUser && (
          <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
               <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-scale-in flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <div className={clsx("p-2 rounded-xl", editingUser.role === UserRole.DOCTOR ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600")}>
                                {editingUser.role === UserRole.DOCTOR ? <Stethoscope className="w-6 h-6"/> : <UserIcon className="w-6 h-6"/>}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {editingUser.id ? 'Edit User Profile' : `Create New ${editingUser.role === UserRole.DOCTOR ? 'Doctor' : 'Patient'}`}
                                </h3>
                                <p className="text-xs text-slate-500">Manage credentials and permissions</p>
                            </div>
                        </div>
                        <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                    </div>
                    
                    <form onSubmit={handleSaveUser} className="p-8 space-y-8 overflow-y-auto">
                        
                        {/* SECTION: CREDENTIALS */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider mb-2 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                <Key className="w-4 h-4" /> Account Credentials
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name</label>
                                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" value={editingUser.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})} required placeholder="e.g. Dr. John Doe" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email (Username)</label>
                                    <input className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} required placeholder="e.g. john@docspot.com" />
                                </div>
                                <div className="relative">
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Password</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 outline-none" 
                                        value={editingUser.password || ''} 
                                        onChange={e => setEditingUser({...editingUser, password: e.target.value})} 
                                        placeholder={editingUser.id ? "Leave unchanged to keep current" : "Set password"}
                                        required={!editingUser.id}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Account Status</label>
                                    <select 
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={editingUser.accountStatus || 'active'}
                                        onChange={e => setEditingUser({...editingUser, accountStatus: e.target.value as any})}
                                    >
                                        <option value="active">Active</option>
                                        <option value="disabled">Disabled</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* DOCTOR SPECIFIC FIELDS */}
                        {editingUser.role === UserRole.DOCTOR && (
                            <>
                                {/* SECTION: PROFESSIONAL */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider mb-2 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                        <Briefcase className="w-4 h-4" /> Professional Profile
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Specialization</label>
                                            <select className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" value={editingUser.specialization} onChange={e => setEditingUser({...editingUser, specialization: e.target.value})}>
                                                {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Hospital / Clinic</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                                <input className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" value={editingUser.hospital || ''} onChange={e => setEditingUser({...editingUser, hospital: e.target.value})} placeholder="e.g. City General Hospital" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Experience (Years)</label>
                                            <input type="number" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" value={editingUser.experience || 0} onChange={e => setEditingUser({...editingUser, experience: Number(e.target.value)})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Consultation Fees ($)</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                                <input type="number" className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" value={editingUser.fees} onChange={e => setEditingUser({...editingUser, fees: Number(e.target.value)})} />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Biography / About</label>
                                        <textarea 
                                            rows={3} 
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none" 
                                            value={editingUser.about || ''} 
                                            onChange={e => setEditingUser({...editingUser, about: e.target.value})} 
                                            placeholder="Doctor's professional summary..."
                                        />
                                    </div>
                                </div>

                                {/* SECTION: SCHEDULE */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider mb-2 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                        <Calendar className="w-4 h-4" /> Work Schedule
                                    </h4>
                                    
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Available Days</label>
                                        <div className="flex flex-wrap gap-2">
                                            {weekDays.map(day => {
                                                const isSelected = editingUser.availableDays?.includes(day);
                                                return (
                                                    <button
                                                        key={day}
                                                        type="button"
                                                        onClick={() => toggleDay(day)}
                                                        className={clsx(
                                                            "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                                                            isSelected 
                                                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105" 
                                                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                                                        )}
                                                    >
                                                        {day.charAt(0)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Shift Start</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                                <input 
                                                    type="time" 
                                                    className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                                                    value={editingUser.startTime || '09:00'} 
                                                    onChange={e => setEditingUser({...editingUser, startTime: e.target.value})} 
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Shift End</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                                <input 
                                                    type="time" 
                                                    className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                                                    value={editingUser.endTime || '17:00'} 
                                                    onChange={e => setEditingUser({...editingUser, endTime: e.target.value})} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {isSaving ? 'Saving Profile...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
               </div>
          </div>
      )}
      
      {/* PLAYBACK MODAL */}
      <PlaybackModal record={playbackRecord} onClose={() => setPlaybackRecord(null)} />
      
      {/* CHAT VIEWER */}
      {chatAuditApt && <ChatViewerModal appointment={chatAuditApt} onClose={() => setChatAuditApt(null)} />}

    </div>
  );
};
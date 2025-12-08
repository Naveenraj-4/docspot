
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDb } from '../services/mockDb';
import { User, UserRole } from '../types';
import { Loader2, ArrowRight, ShieldCheck, User as UserIcon, Lock, Stethoscope, HeartPulse, Command, Sparkles, Activity, Database, Cloud, HardDrive, Check, Plus, X } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  setUser: (user: User) => void;
  mode: 'login' | 'signup';
}

// Predefined options for quick selection
const COMMON_CONDITIONS = ["Diabetes", "Hypertension", "Asthma", "Thyroid", "None"];
const COMMON_ALLERGIES = ["Peanuts", "Dust", "Pollen", "Penicillin", "None"];

export const Auth: React.FC<Props> = ({ setUser, mode: initialMode }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [signupStep, setSignupStep] = useState(1); // 1: Basic, 2: Health
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Patient Signup State - Step 1
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');

  // Patient Signup State - Step 2 (Health)
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [customType, setCustomType] = useState<'condition' | 'allergy' | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState(mockDb.getConnectionStatus());

  const navigate = useNavigate();

  useEffect(() => {
      setDbStatus(mockDb.getConnectionStatus());
  }, []);

  // Helper to manage toggle selection
  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
      if (item === 'None') {
          setList(['None']);
          return;
      }
      let newList = list.filter(i => i !== 'None');
      if (newList.includes(item)) {
          newList = newList.filter(i => i !== item);
      } else {
          newList = [...newList, item];
      }
      setList(newList);
  };

  const addCustomItem = () => {
      if (!customInput.trim()) return;
      if (customType === 'condition') {
          setSelectedConditions(prev => [...prev.filter(i => i !== 'None'), customInput]);
      } else if (customType === 'allergy') {
          setSelectedAllergies(prev => [...prev.filter(i => i !== 'None'), customInput]);
      }
      setCustomInput('');
      setCustomType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'signup' && signupStep === 1) {
        setSignupStep(2);
        return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await mockDb.login(email, password, true);
        if (user) {
          setUser(user);
          if (user.role === UserRole.ADMIN) navigate('/admin-dashboard');
          else if (user.role === UserRole.DOCTOR) navigate('/doctor-dashboard');
          else navigate('/patient-dashboard');
        } else {
          setError('Invalid credentials. Please try again.');
        }
      } else {
        // REGISTER PATIENT WITH FULL PROFILE
        const user = await mockDb.registerPatient(name, email, password, Number(age), gender, bloodGroup);
        
        // Update with extended health data
        await mockDb.updateUser(user.id, {
            height,
            weight,
            chronicConditions: selectedConditions,
            allergies: selectedAllergies,
            medicalStatus: 'Healthy'
        });

        // Fetch fresh user obj
        const updatedUser = (await mockDb.getAllUsers()).find(u => u.id === user.id);
        if (updatedUser) setUser(updatedUser);
        
        navigate('/patient-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      if (mode === 'signup') setSignupStep(1); // Reset on error
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = async (role: 'admin' | 'doctor' | 'patient') => {
      setDemoLoading(role);
      setError('');
      
      // Reset fields
      setEmail(''); setPassword('');
      
      // Target Credentials
      let targetEmail = '';
      let targetPass = '';

      if (role === 'admin') { targetEmail = 'alex@docspot.com'; targetPass = 'admin'; } 
      else if (role === 'doctor') { targetEmail = 'sarah@docspot.com'; targetPass = 'pass'; } 
      else { targetEmail = 'john@example.com'; targetPass = 'pass'; }

      // Visual typing simulation
      setEmail(targetEmail);
      setPassword(targetPass);

      setTimeout(async () => {
          try {
             const user = await mockDb.login(targetEmail, targetPass, true);
             if(user) {
                 setUser(user);
                 if (role === 'admin') navigate('/admin-dashboard');
                 else if (role === 'doctor') navigate('/doctor-dashboard');
                 else navigate('/patient-dashboard');
             }
          } catch(e) {
              setError("Demo account not found. Resetting DB...");
              window.location.reload();
          }
      }, 800);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#020617] text-slate-100 font-sans selection:bg-emerald-500/30">
      
      {/* BACKGROUND FX */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] animate-float"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      </div>

      {/* LEFT PANEL: VISUALS */}
      <div className="hidden lg:flex w-1/2 relative z-10 flex-col justify-between p-12 border-r border-white/5">
          <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                  <Activity className="w-3 h-3 animate-pulse" />
                  DocSpot OS v2.0
              </div>
              <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
                  Healthcare. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Reimagined.</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-md leading-relaxed">
                  The world's most advanced secure medical ecosystem. AI scheduling, encrypted telemedicine, and real-time vitals monitoring.
              </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mb-3" />
                  <h3 className="font-bold text-white">Encrypted Vault</h3>
                  <p className="text-xs text-slate-500 mt-1">E2E Secure Patient Data</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <Sparkles className="w-8 h-8 text-violet-400 mb-3" />
                  <h3 className="font-bold text-white">Gemini AI Core</h3>
                  <p className="text-xs text-slate-500 mt-1">Smart Diagnosis Assistant</p>
              </div>
          </div>
      </div>

      {/* RIGHT PANEL: FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
          <div className="w-full max-w-md space-y-8 animate-slide-up">
              
              {/* Database Indicator */}
              <div className="flex justify-end">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                      {dbStatus.type === 'Cloud Synced' ? <Cloud className="w-3 h-3 text-blue-400" /> : <HardDrive className="w-3 h-3 text-amber-400" />}
                      <span className="uppercase">{dbStatus.type}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1"></span>
                  </div>
              </div>

              <div className="text-center lg:text-left">
                  <h2 className="text-3xl font-bold text-white mb-2">
                      {mode === 'login' ? 'Access Portal' : 'Patient Registration'}
                  </h2>
                  <p className="text-slate-500">
                      {mode === 'login' ? 'Authenticate to enter the secure network.' : signupStep === 1 ? 'Step 1: Create your digital health ID.' : 'Step 2: Build your Health Profile.'}
                  </p>
              </div>

              {/* MODE TOGGLE */}
              {mode === 'signup' && (
                  <div className="flex gap-2 mb-4">
                      <div className={clsx("h-1 flex-1 rounded-full transition-all", signupStep === 1 ? "bg-emerald-500" : "bg-emerald-500/30")}></div>
                      <div className={clsx("h-1 flex-1 rounded-full transition-all", signupStep === 2 ? "bg-emerald-500" : "bg-slate-800")}></div>
                  </div>
              )}

              {mode === 'login' && (
                <div className="grid grid-cols-2 p-1 bg-slate-900/50 rounded-xl border border-slate-800">
                    <button 
                        onClick={() => { setMode('login'); setError(''); }}
                        className="py-2.5 rounded-lg text-sm font-bold transition-all bg-emerald-600 text-white shadow-lg"
                    >
                        Sign In
                    </button>
                    <button 
                        onClick={() => { setMode('signup'); setSignupStep(1); setError(''); }}
                        className="py-2.5 rounded-lg text-sm font-bold transition-all text-slate-500 hover:text-white"
                    >
                        New Patient
                    </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                   
                   {/* LOGIN FORM */}
                   {mode === 'login' && (
                       <div className="space-y-4 animate-fade-in">
                            <div className="relative group">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                <input 
                                    type="email" required placeholder="Email Identity"
                                    className="w-full pl-12 pr-5 py-4 bg-slate-900/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-white placeholder-slate-600 transition-all shadow-sm"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                                <input 
                                    type="password" required placeholder="Secure Password"
                                    className="w-full pl-12 pr-5 py-4 bg-slate-900/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-white placeholder-slate-600 transition-all shadow-sm"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                       </div>
                   )}

                   {/* SIGNUP STEP 1: BASIC INFO */}
                   {mode === 'signup' && signupStep === 1 && (
                        <div className="space-y-4 animate-slide-in-right">
                            <input 
                                type="text" required placeholder="Full Legal Name"
                                className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-white placeholder-slate-600 transition-all"
                                value={name} onChange={(e) => setName(e.target.value)}
                            />
                             <input 
                                    type="email" required placeholder="Email Identity"
                                    className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-white placeholder-slate-600 transition-all shadow-sm"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                            />
                            <div className="relative group">
                                <input 
                                    type="password" required placeholder="Create Password"
                                    className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-white placeholder-slate-600 transition-all shadow-sm"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" required placeholder="Age" className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-white placeholder-slate-600" value={age} onChange={(e) => setAge(e.target.value)} />
                                <select className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-white appearance-none" value={gender} onChange={(e) => setGender(e.target.value)}>
                                    <option>Male</option><option>Female</option><option>Other</option>
                                </select>
                            </div>
                        </div>
                   )}

                   {/* SIGNUP STEP 2: HEALTH PROFILE */}
                   {mode === 'signup' && signupStep === 2 && (
                       <div className="space-y-6 animate-slide-in-right">
                           <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Height (e.g. 5'10)" className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-white placeholder-slate-600" value={height} onChange={(e) => setHeight(e.target.value)} />
                                <input type="text" placeholder="Weight (e.g. 75kg)" className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-white placeholder-slate-600" value={weight} onChange={(e) => setWeight(e.target.value)} />
                           </div>
                           <select className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-white appearance-none" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                           </select>

                           {/* Conditions Selection */}
                           <div>
                               <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Chronic Conditions</label>
                               <div className="flex flex-wrap gap-2">
                                   {COMMON_CONDITIONS.map(c => (
                                       <button 
                                        type="button" 
                                        key={c}
                                        onClick={() => toggleSelection(c, selectedConditions, setSelectedConditions)}
                                        className={clsx("px-3 py-1.5 rounded-lg text-xs font-bold border transition-all", selectedConditions.includes(c) ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700")}
                                       >
                                           {c}
                                       </button>
                                   ))}
                                   <button type="button" onClick={() => setCustomType('condition')} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-800 text-slate-500 hover:text-white hover:border-white transition-all"><Plus className="w-3 h-3"/></button>
                               </div>
                           </div>

                           {/* Allergies Selection */}
                           <div>
                               <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Allergies</label>
                               <div className="flex flex-wrap gap-2">
                                   {COMMON_ALLERGIES.map(c => (
                                       <button 
                                        type="button" 
                                        key={c}
                                        onClick={() => toggleSelection(c, selectedAllergies, setSelectedAllergies)}
                                        className={clsx("px-3 py-1.5 rounded-lg text-xs font-bold border transition-all", selectedAllergies.includes(c) ? "bg-rose-500/20 text-rose-400 border-rose-500/50" : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700")}
                                       >
                                           {c}
                                       </button>
                                   ))}
                                   <button type="button" onClick={() => setCustomType('allergy')} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-800 text-slate-500 hover:text-white hover:border-white transition-all"><Plus className="w-3 h-3"/></button>
                               </div>
                           </div>

                           {/* Custom Input Popover (Simple implementation) */}
                           {customType && (
                               <div className="flex gap-2 animate-fade-in">
                                   <input 
                                    autoFocus
                                    className="flex-1 px-3 py-2 bg-slate-800 rounded-lg text-sm outline-none text-white" 
                                    placeholder={`Type ${customType}...`}
                                    value={customInput}
                                    onChange={e => setCustomInput(e.target.value)}
                                   />
                                   <button type="button" onClick={addCustomItem} className="p-2 bg-emerald-600 text-white rounded-lg"><Check className="w-4 h-4"/></button>
                                   <button type="button" onClick={() => setCustomType(null)} className="p-2 bg-slate-700 text-white rounded-lg"><X className="w-4 h-4"/></button>
                               </div>
                           )}
                       </div>
                   )}

                   {error && (
                      <div className="p-4 rounded-xl bg-red-500/10 text-red-400 text-sm font-bold flex items-center justify-center border border-red-500/20 animate-shake">
                          <ShieldCheck className="w-4 h-4 mr-2" /> {error}
                      </div>
                   )}

                   <div className="flex gap-3">
                       {mode === 'signup' && signupStep === 2 && (
                           <button type="button" onClick={() => setSignupStep(1)} className="px-6 py-4 rounded-xl font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors">
                               Back
                           </button>
                       )}
                        <button 
                            type="submit" disabled={loading || !!demoLoading}
                            className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                <>
                                    {mode === 'login' ? 'Authenticate' : signupStep === 1 ? 'Next Step' : 'Complete Profile'}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                   </div>
                   
                   {mode === 'signup' && (
                       <button type="button" onClick={() => {setMode('login'); setSignupStep(1)}} className="w-full text-center text-xs font-bold text-slate-500 hover:text-emerald-500 uppercase tracking-widest mt-4">
                           Already have an account? Sign In
                       </button>
                   )}
              </form>

              {/* PASSCARDS / DEMO */}
              {mode === 'login' && (
                  <div className="pt-6 border-t border-slate-800">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center mb-4">Quick Access Passcards</p>
                      <div className="grid grid-cols-3 gap-3">
                          <button 
                            onClick={() => fillDemo('admin')} disabled={!!demoLoading}
                            className="p-3 rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-600 transition-all flex flex-col items-center gap-2 group"
                          >
                              <Command className="w-5 h-5 text-slate-400 group-hover:text-white" />
                              <span className="text-xs font-bold text-slate-400 group-hover:text-white">ADMIN</span>
                          </button>
                          <button 
                            onClick={() => fillDemo('doctor')} disabled={!!demoLoading}
                            className="p-3 rounded-xl border border-blue-900/30 bg-blue-900/10 hover:bg-blue-900/20 hover:border-blue-500/50 transition-all flex flex-col items-center gap-2 group"
                          >
                              <Stethoscope className="w-5 h-5 text-blue-500" />
                              <span className="text-xs font-bold text-blue-400">DOCTOR</span>
                          </button>
                          <button 
                            onClick={() => fillDemo('patient')} disabled={!!demoLoading}
                            className="p-3 rounded-xl border border-emerald-900/30 bg-emerald-900/10 hover:bg-emerald-900/20 hover:border-emerald-500/50 transition-all flex flex-col items-center gap-2 group"
                          >
                              <HeartPulse className="w-5 h-5 text-emerald-500" />
                              <span className="text-xs font-bold text-emerald-400">PATIENT</span>
                          </button>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
    
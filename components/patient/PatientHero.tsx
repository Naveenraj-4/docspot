
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';
import { Activity, Plus, TrendingUp } from 'lucide-react';

interface Props {
  user: User;
}

export const PatientHero: React.FC<Props> = ({ user }) => {
  const healthScore = 92; // Simulated
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (healthScore / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 dark:bg-[#080808] p-8 md:p-12 shadow-2xl border border-white/10 group">
        
        {/* Animated Backgrounds */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-emerald-500/20 to-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:opacity-100 opacity-60 transition-opacity duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-6">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-emerald-300 text-xs font-bold uppercase tracking-widest shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Patient Portal
             </div>
             
             <div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-tight leading-[1.1]">
                    Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{user.name}</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-xl font-light">
                    Your health vitals are looking stable. You have <span className="text-white font-bold">2 upcoming</span> actions today.
                </p>
             </div>

             <div className="flex gap-4">
                 <Link 
                    to="/book" 
                    className="group relative px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center gap-2"
                 >
                    <Plus className="w-5 h-5 text-emerald-600 group-hover:rotate-90 transition-transform" />
                    Book Appointment
                 </Link>
                 <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-colors">
                    View Reports
                 </button>
             </div>
          </div>
          
          {/* Health Score Visualizer */}
          <div className="relative flex items-center justify-center bg-white/5 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90">
                      <circle cx="64" cy="64" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                      <circle 
                        cx="64" cy="64" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        className="text-emerald-500 transition-all duration-1000 ease-out"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                      />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <span className="text-2xl font-bold">{healthScore}</span>
                      <span className="text-[10px] uppercase text-slate-400 font-bold">Health Score</span>
                  </div>
              </div>
              
              <div className="ml-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><Activity className="w-4 h-4"/></div>
                      <span>Vitals Normal</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><TrendingUp className="w-4 h-4"/></div>
                      <span>Trending Up</span>
                  </div>
              </div>
          </div>
        </div>
      </div>
  );
};

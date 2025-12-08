import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CallSession, User } from '../types';
import { mockDb } from '../services/mockDb';
import { Phone, PhoneOff, Video, User as UserIcon } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  currentUser: User | null;
}

export const IncomingCallOverlay: React.FC<Props> = ({ currentUser }) => {
  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const checkCall = () => {
        const active = mockDb.getActiveCall();
        // Check if I am the receiver and status is ringing
        if (active && active.receiverId === currentUser.id && active.status === 'ringing') {
            setIncomingCall(active);
        } else {
            setIncomingCall(null);
        }
    };

    // Check immediately
    checkCall();

    // Listen for storage changes (cross-tab signaling)
    const handleStorage = () => checkCall();
    window.addEventListener('storage', handleStorage);
    
    // Polling fallback for same-tab updates (optional but safer for local dev)
    const interval = setInterval(checkCall, 2000);

    return () => {
        window.removeEventListener('storage', handleStorage);
        clearInterval(interval);
    };
  }, [currentUser]);

  const handleAccept = async () => {
      if (!incomingCall) return;
      await mockDb.answerCall();
      setIncomingCall(null);
      navigate(`/chat/${incomingCall.appointmentId}`);
  };

  const handleReject = async () => {
      await mockDb.rejectCall();
      setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="bg-slate-900 border border-slate-700 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center w-full max-w-sm relative overflow-hidden animate-scale-in">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-800/50 to-slate-900/90 pointer-events-none"></div>
            
            {/* Caller Info */}
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-emerald-400 to-blue-500 mb-6 shadow-lg shadow-emerald-500/30 relative">
                     <img 
                        src={incomingCall.caller.avatar || `https://ui-avatars.com/api/?name=${incomingCall.caller.name}`} 
                        className="w-full h-full rounded-full object-cover border-4 border-slate-900"
                     />
                     <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping"></div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-1">{incomingCall.caller.name}</h3>
                <p className="text-emerald-400 text-sm font-medium tracking-widest uppercase mb-8 flex items-center gap-2">
                    {incomingCall.isVideo ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />} 
                    Incoming {incomingCall.isVideo ? 'Video' : 'Audio'} Call...
                </p>
            </div>

            {/* Actions */}
            <div className="relative z-10 flex items-center gap-8 w-full justify-center">
                <button 
                    onClick={handleReject}
                    className="flex flex-col items-center gap-2 group"
                >
                    <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30 transition-transform group-hover:scale-110 active:scale-95">
                        <PhoneOff className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Decline</span>
                </button>

                <button 
                    onClick={handleAccept}
                    className="flex flex-col items-center gap-2 group"
                >
                    <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 transition-transform group-hover:scale-110 active:scale-95 animate-bounce">
                        <Phone className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Accept</span>
                </button>
            </div>
        </div>
    </div>
  );
};
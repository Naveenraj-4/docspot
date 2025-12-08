import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Message, User, UserRole, Appointment, AppointmentStatus } from '../types';
import { mockDb } from '../services/mockDb';
import { Send, ArrowLeft, ShieldCheck, Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Paperclip, Gift, Star, DollarSign, X, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { RichMessage } from '../components/RichMessage';

// Tip Modal Component
const TipModal: React.FC<{ onClose: () => void, onConfirm: (amount: number, rating: number) => void }> = ({ onClose, onConfirm }) => {
    const [amount, setAmount] = useState(10);
    const [rating, setRating] = useState(5);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-in relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-colors"><X className="w-4 h-4"/></button>
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600 dark:text-emerald-400">
                        <Gift className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Show Gratitude</h3>
                    <p className="text-slate-500 text-sm">Tip your doctor for excellent service.</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Tip Amount</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[5, 10, 20].map(val => (
                                <button 
                                    key={val}
                                    onClick={() => setAmount(val)}
                                    className={clsx("py-3 rounded-xl font-bold border-2 transition-all", amount === val ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "border-slate-100 dark:border-slate-800 text-slate-500 hover:border-emerald-200")}
                                >
                                    ${val}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                         <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Rating</label>
                         <div className="flex justify-center gap-2">
                             {[1,2,3,4,5].map(star => (
                                 <button key={star} onClick={() => setRating(star)} className={clsx("transition-transform hover:scale-110", star <= rating ? "text-amber-400 fill-current" : "text-slate-200 dark:text-slate-700")}>
                                     <Star className="w-8 h-8" />
                                 </button>
                             ))}
                         </div>
                    </div>

                    <button onClick={() => onConfirm(amount, rating)} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all active:scale-95">
                        Confirm & Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ChatPage: React.FC<{ user: User }> = ({ user }) => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Call State
  const [callStatus, setCallStatus] = useState<'idle' | 'dialing' | 'connected' | 'ended'>('idle');
  const [isVideo, setIsVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>([20, 20, 20, 20, 20]);
  
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  
  // Tipping
  const [showTipModal, setShowTipModal] = useState(false);

  // Typing State
  const [isTypingRemote, setIsTypingRemote] = useState(false);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      if (!appointmentId) return;
      const allApts = await mockDb.getAllAppointments();
      const apt = allApts.find(a => a.id === appointmentId);
      if (apt) {
          setAppointment(apt);
          const history = await mockDb.getChatHistory(appointmentId);
          setMessages(history.length > 0 ? history : [{
              id: 'init', appointmentId, senderId: 'system', senderName: 'System', 
              text: `End-to-end encrypted channel established with ${apt.doctorName}.`, timestamp: Date.now(), isAi: false
          }]);
      }
    };
    loadData();

    // Polling for signaling (Calls and Typing)
    const checkStatus = () => {
        // Call Status
        const active = mockDb.getActiveCall();
        if (active && active.appointmentId === appointmentId) {
             if (active.status === 'connected' && callStatus !== 'connected') { 
                setCallStatus('connected'); 
                setIsVideo(active.isVideo); 
             }
             else if (active.status === 'ringing' && active.caller.id === user.id && callStatus !== 'dialing') { 
                setCallStatus('dialing'); 
                setIsVideo(active.isVideo); 
             }
             else if (active.status === 'ended' && callStatus !== 'idle') { 
                setCallStatus('ended'); 
                setTimeout(() => setCallStatus('idle'), 1000); 
             }
        }

        // Typing Status
        if(appointmentId) {
            const typingData = mockDb.getTyping(appointmentId);
            if (typingData && typingData.userId !== user.id) {
                const isRecent = Date.now() - typingData.timestamp < 3000; // 3 seconds threshold
                setIsTypingRemote(isRecent);
            } else {
                setIsTypingRemote(false);
            }
        }
    };
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, [appointmentId, user.id, callStatus]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages, isTypingRemote]);

  // Audio Visualizer Effect
  useEffect(() => {
    let interval: any;
    if (callStatus === 'connected' || callStatus === 'dialing') {
        interval = setInterval(() => {
            setAudioLevels(Array(5).fill(0).map(() => Math.floor(Math.random() * 80) + 10));
            setCallDuration(prev => prev + 1);
        }, 1000);
    } else {
        setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Media Stream Logic
  useEffect(() => {
      if (callStatus === 'connected' && isVideo) {
          navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                localStreamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            })
            .catch(err => console.error("Camera access denied:", err));
      } else {
          if (localStreamRef.current) {
              localStreamRef.current.getTracks().forEach(track => track.stop());
              localStreamRef.current = null;
          }
      }
  }, [callStatus, isVideo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
      if(appointmentId) mockDb.setTyping(appointmentId, user.id);
  };

  const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || !appointmentId) return;
      const userMsg: Message = { id: Date.now().toString(), appointmentId, senderId: user.id, senderName: user.name, text: input, timestamp: Date.now(), isAi: false };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      await mockDb.saveMessage(userMsg);
  };
  
  const handleTipConfirm = async (amount: number, rating: number) => {
      if (appointmentId && appointment) {
          await mockDb.addTip(appointmentId, amount);
          await mockDb.addReview(appointmentId, appointment.doctorId, rating);
          
          const sysMsg: Message = {
              id: Date.now().toString(), appointmentId, senderId: 'system', senderName: 'System', 
              text: `You sent a $${amount} tip and a ${rating}-star rating!`, timestamp: Date.now(), isAi: false
          };
          setMessages(prev => [...prev, sysMsg]);
          await mockDb.saveMessage(sysMsg);
          setShowTipModal(false);
      }
  };

  const startCall = async (video: boolean) => {
      if (!appointment) return;
      setIsVideo(video);
      setCallStatus('dialing');
      const receiverId = user.role === UserRole.PATIENT ? appointment.doctorId : appointment.patientId;
      await mockDb.initiateCall(user, receiverId, appointment.id, video);
  };
  
  const endCall = async () => {
      await mockDb.endCall();
      setCallStatus('ended');
      setTimeout(() => setCallStatus('idle'), 1000);
  };

  const toggleMute = () => {
      if (localStreamRef.current) {
          localStreamRef.current.getAudioTracks().forEach(t => t.enabled = !t.enabled);
          setIsMuted(!isMuted);
      }
  };

  const toggleCamera = () => {
      if (localStreamRef.current) {
          localStreamRef.current.getVideoTracks().forEach(t => t.enabled = !t.enabled);
          setIsCameraOff(!isCameraOff);
      }
  };

  if (!appointment) {
      return (
          <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
               <div className="flex flex-col items-center gap-4">
                   <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                   <p className="text-slate-500 font-medium">Connecting to secure line...</p>
               </div>
          </div>
      );
  }
  const isClosed = appointment.status === AppointmentStatus.COMPLETED || appointment.status === AppointmentStatus.REJECTED;

  return (
    <div className="h-[calc(100vh-theme(spacing.20))] md:h-full flex flex-col bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      
      {/* --- CALL OVERLAY --- */}
      {callStatus !== 'idle' && (
          <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center animate-fade-in">
              {/* Background Animation */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse"></div>

              {isVideo && callStatus === 'connected' ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                       {/* Remote Video Simulation */}
                       <div className="w-full h-full bg-slate-800 relative">
                           <img 
                                src={appointment.doctorAvatar} 
                                className="w-full h-full object-cover opacity-80" 
                           />
                           <div className="absolute bottom-32 left-8 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl text-white font-bold">
                               {user.role === UserRole.PATIENT ? appointment.doctorName : appointment.patientName}
                           </div>
                       </div>
                       
                       {/* Local Video */}
                       <div className="absolute top-8 right-8 w-32 h-48 md:w-48 md:h-72 bg-black rounded-2xl shadow-2xl overflow-hidden border-2 border-slate-700">
                           {!isCameraOff ? (
                               <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                           ) : (
                               <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                                   <VideoOff className="w-8 h-8" />
                               </div>
                           )}
                       </div>
                  </div>
              ) : (
                  <div className="relative z-10 flex flex-col items-center">
                      <div className="w-32 h-32 rounded-full border-4 border-slate-800 p-1 relative mb-8">
                          <img src={appointment.doctorAvatar} className="w-full h-full rounded-full object-cover" />
                          <div className={clsx("absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping", callStatus === 'connected' ? "opacity-20 duration-[2000ms]" : "opacity-100 duration-1000")}></div>
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">{user.role === UserRole.PATIENT ? appointment.doctorName : appointment.patientName}</h2>
                      <p className="text-emerald-400 font-medium tracking-widest uppercase mb-8">
                          {callStatus === 'dialing' ? 'Dialing...' : callStatus === 'connected' ? formatDuration(callDuration) : 'Call Ended'}
                      </p>
                      
                      {/* Audio Waveform */}
                      {callStatus === 'connected' && (
                          <div className="flex items-end gap-1 h-12 mb-12">
                              {audioLevels.map((h, i) => (
                                  <div key={i} className="w-2 bg-emerald-500 rounded-full transition-all duration-300" style={{ height: `${h}%` }}></div>
                              ))}
                          </div>
                      )}
                  </div>
              )}

              {/* Controls */}
              <div className="absolute bottom-10 left-0 w-full flex items-center justify-center gap-6 z-20">
                   {callStatus === 'connected' && (
                       <>
                           <button onClick={toggleMute} className={clsx("p-4 rounded-full transition-all hover:scale-110", isMuted ? "bg-white text-slate-900" : "bg-white/20 text-white backdrop-blur-md hover:bg-white/30")}>
                               {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                           </button>
                           {isVideo && (
                               <button onClick={toggleCamera} className={clsx("p-4 rounded-full transition-all hover:scale-110", isCameraOff ? "bg-white text-slate-900" : "bg-white/20 text-white backdrop-blur-md hover:bg-white/30")}>
                                   {isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                               </button>
                           )}
                       </>
                   )}
                   <button onClick={endCall} className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all hover:scale-110 shadow-lg shadow-red-500/50">
                       <PhoneOff className="w-8 h-8" />
                   </button>
              </div>
          </div>
      )}

      {/* --- HEADER --- */}
      <div className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
           <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ArrowLeft className="w-5 h-5" /></button>
           <img src={appointment.doctorAvatar} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700" />
           <div>
               <h2 className="font-bold text-slate-900 dark:text-white">{user.role === UserRole.PATIENT ? appointment.doctorName : appointment.patientName}</h2>
               <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold"><ShieldCheck className="w-3 h-3" /> Secure Chat</div>
           </div>
        </div>
        
        <div className="flex items-center gap-2">
            {!isClosed && user.role === UserRole.PATIENT && (
                 <button onClick={() => setShowTipModal(true)} className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full hover:scale-105 transition-transform" title="Tip & Rate">
                     <DollarSign className="w-5 h-5" />
                 </button>
            )}
            {!isClosed && (
                <>
                    <button onClick={() => startCall(false)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-emerald-500 hover:text-white transition-all"><Phone className="w-5 h-5" /></button>
                    <button onClick={() => startCall(true)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-indigo-500 hover:text-white transition-all"><Video className="w-5 h-5" /></button>
                </>
            )}
        </div>
      </div>

      {/* --- MESSAGES --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          {messages.map((msg, index) => {
             const isMe = msg.senderId === user.id;
             const isSystem = msg.senderId === 'system';
             if (isSystem) return <div key={msg.id} className="text-center text-xs text-slate-400 bg-slate-100 dark:bg-slate-900 py-1 px-3 rounded-full mx-auto w-fit">{msg.text}</div>;
             
             return (
                 <div key={msg.id} className={clsx("flex gap-2 max-w-[90%] md:max-w-[70%]", isMe ? "ml-auto flex-row-reverse" : "mr-auto")}>
                     <div className={clsx("p-3 rounded-2xl text-sm shadow-sm", isMe ? "bg-emerald-600 text-white rounded-tr-sm" : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-sm")}>
                         <RichMessage text={msg.text} isMe={isMe} />
                     </div>
                 </div>
             );
          })}
          
          {/* Typing Indicator */}
          {isTypingRemote && (
              <div className="flex gap-2 mr-auto max-w-[70%] animate-fade-in">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  </div>
              </div>
          )}

          <div ref={messagesEndRef} />
      </div>

      {/* --- INPUT --- */}
      {!isClosed && (
          <div className="p-4 bg-transparent sticky bottom-0">
             <form onSubmit={handleSend} className="flex gap-2 items-center bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
                 <button type="button" className="p-2 text-slate-400 hover:text-emerald-500"><Paperclip className="w-5 h-5"/></button>
                 <input 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white"
                    placeholder="Type a message..."
                    value={input} 
                    onChange={handleInputChange}
                 />
                 <button type="submit" className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors"><Send className="w-5 h-5"/></button>
             </form>
          </div>
      )}

      {showTipModal && <TipModal onClose={() => setShowTipModal(false)} onConfirm={handleTipConfirm} />}
    </div>
  );
};

const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
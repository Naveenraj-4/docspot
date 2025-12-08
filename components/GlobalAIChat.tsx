import React, { useState, useEffect, useRef } from 'react';
import { User, BookingAction } from '../types';
import { Bot, X, Send, Sparkles, Minimize2, Calendar, CheckCircle, AlertTriangle, Activity, Trash2, ArrowRight, Loader2, Maximize2 } from 'lucide-react';
import { startGlobalSession, sendGlobalMessage } from '../services/geminiService';
import { mockDb } from '../services/mockDb';
import clsx from 'clsx';

interface Props {
  user: User;
}

const ActionCard: React.FC<{ action: BookingAction; onConfirm: () => Promise<void>; isCancelled?: boolean }> = ({ action, onConfirm, isCancelled }) => {
    const [status, setStatus] = useState<'pending' | 'loading' | 'confirmed'>('pending');

    const handleConfirm = async () => {
        setStatus('loading');
        // Simulate network delay
        await new Promise(r => setTimeout(r, 800));
        await onConfirm();
        setStatus('confirmed');
    };

    if (status === 'confirmed') {
        return (
            <div className="mt-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold animate-scale-in">
                <CheckCircle className="w-5 h-5" /> 
                {action.type === 'CANCEL_PROPOSAL' ? 'Cancellation Processed' : 'Booking Confirmed!'}
            </div>
        );
    }

    const isCancel = action.type === 'CANCEL_PROPOSAL';
    const isLoading = status === 'loading';

    return (
        <div className="mt-3 p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl animate-slide-up transform transition-all hover:scale-[1.02]">
            <div className={clsx("flex items-center gap-2 mb-4 font-bold text-xs uppercase tracking-wider", isCancel ? "text-red-500" : "text-emerald-500")}>
                {isCancel ? <Trash2 className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                {isCancel ? 'Cancellation Proposal' : 'Booking Proposal'}
            </div>
            
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 mb-5 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Doctor</span>
                    <span className="font-bold text-slate-900 dark:text-white">{action.doctorName}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Date</span>
                    <span className="font-bold text-slate-900 dark:text-white">{action.date}</span>
                </div>
                {action.time && (
                    <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Time</span>
                        <span className="font-bold text-slate-900 dark:text-white">{action.time}</span>
                    </div>
                )}
                {isCancel && (
                    <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-red-400 flex gap-2 items-center">
                        <AlertTriangle className="w-3 h-3" /> Irreversible Action
                    </div>
                )}
            </div>

            <button 
                onClick={handleConfirm} 
                disabled={isLoading}
                className={clsx(
                    "w-full py-3 text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100",
                    isCancel ? "bg-red-500 hover:bg-red-600 shadow-red-500/30" : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30"
                )}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        {isCancel ? 'Confirm Cancellation' : 'Confirm Booking'} <ArrowRight className="w-4 h-4" />
                    </>
                )}
            </button>
        </div>
    );
};

export const GlobalAIChat: React.FC<Props> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: 'user' | 'ai', text: string, action?: BookingAction}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
        startGlobalSession(user).then(() => {
            const greeting = `Hello ${user.name}. I'm DocSpot AI. I can help you manage appointments, view your medical status, or find a specialist.`;
            setMessages([{ sender: 'ai', text: greeting }]);
        });
    }
  }, [isOpen, user]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;
      const userText = input; setInput('');
      setMessages(p => [...p, { sender: 'user', text: userText }]); setIsTyping(true);
      
      const rawResponse = await sendGlobalMessage(userText); setIsTyping(false);
      
      let displayText = rawResponse;
      let action: BookingAction | undefined;
      
      // Parse structured action if present
      if (rawResponse.includes('$$BOOKING_ACTION$$')) {
          const parts = rawResponse.split('$$BOOKING_ACTION$$');
          displayText = parts[0].trim();
          try { action = JSON.parse(parts[1].trim()); } catch (e) { console.error(e); }
      }
      
      setMessages(p => [...p, { sender: 'ai', text: displayText, action }]);
  };

  const handleActionConfirm = async (action: BookingAction) => {
      if (action.type === 'BOOKING_PROPOSAL') {
          await mockDb.createAppointment({ 
              patientId: user.id, 
              patientName: user.name, 
              doctorId: action.doctorId!, 
              doctorName: action.doctorName!, 
              date: action.date!, 
              time: action.time!, 
              reason: action.reason || 'AI Booking', 
              type: 'Online' 
          });
      } else if (action.type === 'CANCEL_PROPOSAL') {
          await mockDb.cancelAppointment(action.appointmentId!, 'User requested via AI');
      }
  };

  if (!isOpen) {
      return (
          <button 
            onClick={() => setIsOpen(true)} 
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 group flex items-center justify-center"
          >
              <div className="absolute inset-0 bg-emerald-500 rounded-full blur-lg opacity-40 group-hover:opacity-70 transition-opacity animate-pulse"></div>
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-12">
                  <Bot className="w-7 h-7 sm:w-8 sm:h-8" />
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
              </div>
          </button>
      );
  }

  return (
    <div className={clsx(
        "fixed z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-white/20 dark:border-slate-700 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden flex flex-col ring-1 ring-black/5", 
        // Positioning responsive
        "bottom-4 right-4 sm:bottom-6 sm:right-6",
        // Sizing responsive
        isMinimized 
            ? "w-[calc(100vw-2rem)] sm:w-80 h-16 sm:h-20 rounded-[1.5rem] sm:rounded-[2rem]" 
            : "w-[calc(100vw-2rem)] sm:w-[400px] h-[75vh] sm:h-[700px] max-h-[calc(100vh-2rem)] rounded-[2rem] sm:rounded-[2.5rem]"
    )}>
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center cursor-pointer select-none" onClick={() => setIsMinimized(!isMinimized)}>
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
                    <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">DocSpot AI</h3>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wide flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online
                    </p>
                </div>
            </div>
            <div className="flex gap-1">
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} 
                    className="p-2 sm:p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                    {isMinimized ? <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
                    className="p-2 sm:p-2.5 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors text-slate-500 dark:text-slate-400"
                >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>
        </div>

        {!isMinimized && (
            <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 scroll-smooth">
                    {messages.map((msg, i) => (
                        <div key={i} className={clsx("flex gap-2 sm:gap-3", msg.sender === 'user' ? "flex-row-reverse" : "flex-row")}>
                            {msg.sender === 'ai' && (
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-2 shadow-sm">
                                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-violet-500" />
                                </div>
                            )}
                            <div className="max-w-[85%]">
                                <div className={clsx(
                                    "p-3 sm:p-4 text-sm leading-relaxed shadow-sm transition-all duration-300", 
                                    msg.sender === 'user' 
                                        ? "bg-slate-900 text-white rounded-[1.5rem] rounded-tr-none animate-slide-in-right" 
                                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-[1.5rem] rounded-tl-none border border-slate-100 dark:border-slate-700 animate-slide-in-left"
                                )}>
                                    {msg.sender === 'ai' 
                                        ? <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} /> 
                                        : msg.text}
                                </div>
                                {msg.action && (
                                    <ActionCard 
                                        action={msg.action} 
                                        onConfirm={() => handleActionConfirm(msg.action!)} 
                                        isCancelled={msg.action.type === 'CANCEL_PROPOSAL'} 
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-2 items-center text-xs text-slate-400 pl-4 animate-pulse">
                            <Activity className="w-3 h-3" /> AI is thinking...
                        </div>
                    )}
                </div>

                <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <input 
                        className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 sm:px-5 text-sm focus:ring-2 focus:ring-violet-500 outline-none shadow-inner dark:text-white transition-all placeholder:text-slate-400" 
                        placeholder="Type a message..." 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim()} 
                        className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:scale-100 flex-shrink-0"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </>
        )}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Appointment, Message } from '../types';
import { mockDb } from '../services/mockDb';
import { X, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  appointment: Appointment | null;
  onClose: () => void;
}

export const ChatViewerModal: React.FC<Props> = ({ appointment, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    
    useEffect(() => {
        if(appointment) {
            mockDb.getChatHistory(appointment.id).then(setMessages);
        }
    }, [appointment]);

    if (!appointment) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-scale-in">
                 <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400">
                             <MessageSquare className="w-5 h-5" />
                         </div>
                         <div>
                             <h3 className="font-bold text-slate-900 dark:text-white">Secure Chat Log</h3>
                             <p className="text-xs text-slate-500">ID: {appointment.id} • {new Date(appointment.date).toLocaleDateString()}</p>
                         </div>
                     </div>
                     <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                 </div>
                 <div className="h-[400px] overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-950">
                     {messages.length === 0 ? (
                         <div className="text-center text-slate-400 py-10">No messages found in this session.</div>
                     ) : messages.map((msg, i) => (
                         <div key={i} className={clsx("flex flex-col gap-1 max-w-[80%]", msg.senderId === appointment.doctorId ? "ml-auto items-end" : "mr-auto items-start")}>
                             <div className={clsx("px-4 py-2 rounded-xl text-sm shadow-sm", 
                                 msg.senderId === appointment.doctorId 
                                 ? "bg-emerald-600 text-white rounded-tr-none" 
                                 : msg.senderId === 'system' 
                                    ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs mx-auto rounded-full px-6" 
                                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none"
                             )}>
                                 {msg.text}
                             </div>
                             {msg.senderId !== 'system' && (
                                 <span className="text-[10px] text-slate-400">
                                     {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString()}
                                 </span>
                             )}
                         </div>
                     ))}
                 </div>
                 <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                      <button onClick={onClose} className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg text-sm">Close Audit</button>
                 </div>
             </div>
        </div>
    );
};
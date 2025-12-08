import React from 'react';
import { CallRecord } from '../types';
import { X, Video, PlayCircle, Download, Mic } from 'lucide-react';

interface Props {
  record: CallRecord | null;
  onClose: () => void;
}

export const PlaybackModal: React.FC<Props> = ({ record, onClose }) => {
  if (!record) return null;

  const handleDownload = () => {
      // Simulate download
      const element = document.createElement("a");
      const file = new Blob(["Simulated recording content"], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `recording-${record.id}.${record.type === 'video' ? 'webm' : 'mp3'}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in">
        <div className="bg-slate-900 border border-slate-700 rounded-[2rem] overflow-hidden w-full max-w-3xl shadow-2xl animate-scale-in flex flex-col max-h-[90vh]">
            <div className="aspect-video bg-black flex items-center justify-center relative flex-shrink-0">
                {record.type === 'video' ? (
                    <div className="text-center">
                        <div className="relative inline-block">
                             <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900 mx-auto mb-6 relative z-10">
                                <Video className="w-10 h-10 text-slate-600"/>
                            </div>
                            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
                        </div>
                       
                        <p className="text-slate-500 font-medium">End-to-End Encrypted Video Playback</p>
                        <p className="text-xs text-slate-600 mt-2 font-mono">ID: {record.id}</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-6 w-2/3">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/30">
                            <Mic className="w-8 h-8" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden w-full">
                                <div className="w-1/3 h-full bg-emerald-500 animate-[shimmer_2s_infinite]"></div>
                            </div>
                             <div className="flex justify-between text-xs text-slate-500 font-mono">
                                <span>00:00</span>
                                <span>{Math.floor(record.duration / 60)}:{String(record.duration % 60).padStart(2, '0')}</span>
                             </div>
                        </div>
                    </div>
                )}
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                    <X className="w-5 h-5"/>
                </button>
            </div>
            
            <div className="p-6 bg-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] ${record.type === 'video' ? 'bg-indigo-500 text-indigo-500' : 'bg-emerald-500 text-emerald-500'}`}></span>
                        <p className="text-white font-bold text-lg">{record.callerName} <span className="text-slate-500 mx-2">➔</span> {record.receiverName}</p>
                    </div>
                    <p className="text-slate-400 text-sm flex items-center gap-2">
                        {new Date(record.timestamp).toLocaleString()} 
                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                        {record.size}
                    </p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={handleDownload}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors text-sm"
                    >
                        <Download className="w-4 h-4" /> Download
                    </button>
                    <span className="bg-emerald-500/10 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-emerald-500/20 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Secure
                    </span>
                </div>
            </div>
        </div>
    </div>
  );
};
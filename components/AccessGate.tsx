
import React, { useState, useEffect } from 'react';
import { Lock, Terminal, AlertTriangle } from 'lucide-react';

interface Props {
  onUnlock: () => void;
}

export const AccessGate: React.FC<Props> = ({ onUnlock }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matrixText, setMatrixText] = useState('');

  // Matrix Text Decoding Effect
  useEffect(() => {
    const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let interval: any;
    let iteration = 0;
    
    interval = setInterval(() => {
      setMatrixText(prev => {
         return "SYSTEM_LOCKED_//_SECURE_GATEWAY"
            .split("")
            .map((letter, index) => {
              if(index < iteration) return letter;
              return chars[Math.floor(Math.random() * chars.length)]
            })
            .join("");
      });
      
      if(iteration >= 30) clearInterval(interval);
      iteration += 1/3;
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Simulate cryptographic processing delay
    setTimeout(() => {
      if (passcode === 'alex@2004') {
        onUnlock();
      } else {
        setError(true);
        setLoading(false);
        setPasscode('');
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black text-emerald-500 font-mono flex flex-col items-center justify-center overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,100,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,100,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Scanline Animation */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-4 animate-[slideUp_2s_linear_infinite] pointer-events-none opacity-50"></div>

        <div className="relative z-10 w-full max-w-md p-10 border border-emerald-900/50 bg-black/90 shadow-[0_0_50px_rgba(16,185,129,0.1)] backdrop-blur-sm">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-emerald-500"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-emerald-500"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-emerald-500"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-emerald-500"></div>

            <div className="flex justify-center mb-8">
                <div className="relative">
                    <div className="w-20 h-20 border border-emerald-800 rounded-full flex items-center justify-center bg-black">
                        <Lock className="w-8 h-8 text-emerald-500 animate-pulse" />
                    </div>
                    <div className="absolute inset-0 border border-emerald-500 rounded-full animate-ping opacity-20"></div>
                </div>
            </div>

            <div className="text-center mb-8">
                <p className="text-[10px] tracking-[0.3em] text-emerald-700 mb-2 font-bold">RESTRICTED ACCESS</p>
                <h1 className="text-xl font-bold tracking-widest text-white drop-shadow-md">
                    {matrixText}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-emerald-500 rounded blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
                    <input 
                        type="password" 
                        autoFocus
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="relative w-full bg-emerald-950/10 border border-emerald-900 text-center text-xl py-4 text-white tracking-[0.5em] focus:outline-none focus:border-emerald-500 transition-colors placeholder-emerald-900/30"
                        placeholder="••••••••"
                    />
                </div>

                {error && (
                    <div className="flex items-center justify-center gap-2 text-red-500 text-xs font-bold animate-[shake_0.5s_ease-in-out] bg-red-950/20 p-2 border border-red-900/50">
                        <AlertTriangle className="w-3 h-3" /> ACCESS DENIED: INVALID CREDENTIALS
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-emerald-900/30 border border-emerald-700 text-emerald-400 py-4 text-xs font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                    {loading ? (
                        <span className="animate-pulse">DECRYPTING...</span>
                    ) : (
                        <>
                            <Terminal className="w-4 h-4" /> Authenticate
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 pt-4 border-t border-emerald-900/30 flex justify-between text-[10px] text-emerald-800 font-mono">
                <span>SECURE_GATE_V9.0</span>
                <span>ID: ALEX-2004</span>
            </div>
        </div>
    </div>
  );
};

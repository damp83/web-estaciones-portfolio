import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Square, RotateCcw, Clock, Timer, Hourglass } from 'lucide-react';
import { usePresentation } from '../../context/PresentationContext';

export default function PresentationOverlay() {
  const { 
    isPresenting, togglePresentation, 
    timerType, timeLeft, isActive, isFinished,
    startStation, startChange, stopTimer 
  } = usePresentation();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isPresenting) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeString = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden font-sans">
      {/* Visual Alert Flash */}
      <AnimatePresence>
        {isFinished && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className={`absolute inset-0 z-0 ${timerType === 'cambio' ? 'bg-amber-500' : 'bg-emerald-500'}`}
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col p-8 sm:p-12 pointer-events-none">
        
        {/* Top Header: Current Time & Exit */}
        <div className="flex justify-between items-center w-full z-10 pointer-events-auto">
          <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-4 border-white/10">
            <Clock className="w-6 h-6 text-indigo-400" />
            <span className="text-3xl font-black text-white tracking-widest tabular-nums">
              {getTimeString(currentTime)}
            </span>
          </div>
          <button 
            onClick={togglePresentation} 
            className="p-4 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 rounded-2xl transition-all border border-white/5 backdrop-blur-xl group"
          >
            <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Center: Main Timer */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 relative">
           <AnimatePresence mode="wait">
             {timerType ? (
               <motion.div 
                 key="active-timer"
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.8, opacity: 0 }}
                 className="flex flex-col items-center gap-4 text-center"
               >
                 <span className={`text-[10px] font-black uppercase tracking-[1em] mb-4 ${timerType === 'cambio' ? 'text-amber-400' : 'text-emerald-400'}`}>
                   {timerType === 'cambio' ? '¡Cambio de Estación!' : 'Estación en Proceso'}
                 </span>
                 <div className={`text-[12rem] sm:text-[16rem] font-black leading-none tabular-nums tracking-tighter drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] ${isFinished ? 'animate-bounce text-white' : (timerType === 'cambio' ? 'text-amber-400' : 'text-white')}`}>
                   {formatTime(timeLeft)}
                 </div>
                 <button onClick={stopTimer} className="pointer-events-auto mt-8 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all border border-white/10 backdrop-blur-lg">
                   <Square className="w-6 h-6 fill-white" /> Detener Tiempo
                 </button>
               </motion.div>
             ) : (
               <motion.div 
                 key="controls"
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 exit={{ y: -20, opacity: 0 }}
                 className="flex flex-col items-center gap-12 pointer-events-auto"
               >
                  <div className="text-center space-y-2">
                    <h2 className="text-5xl font-black text-white tracking-tight">Listo para la Sesión</h2>
                    <p className="text-slate-400 font-medium text-xl">Selecciona un tiempo para empezar</p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4">
                    {[15, 20, 25].map(min => (
                      <button 
                        key={min}
                        onClick={() => startStation(min)}
                        className="bg-indigo-600/80 hover:bg-indigo-600 text-white px-8 py-6 rounded-3xl font-black text-2xl transition-all hover:-translate-y-2 border border-indigo-400/20 shadow-xl shadow-indigo-600/20 flex flex-col items-center gap-2 group"
                      >
                        <Timer className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        {min} min
                      </button>
                    ))}
                    <button 
                      onClick={startChange}
                      className="bg-amber-500/80 hover:bg-amber-500 text-amber-950 px-8 py-6 rounded-3xl font-black text-2xl transition-all hover:-translate-y-2 border border-amber-400/20 shadow-xl shadow-amber-600/20 flex flex-col items-center gap-2 group"
                    >
                      <RotateCcw className="w-8 h-8 group-hover:rotate-180 transition-transform duration-500" />
                      Cambio (1m)
                    </button>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Bottom Bar: Instructions */}
        <div className="z-10 text-center">
           <p className="text-slate-500 font-bold tracking-widest text-xs uppercase flex items-center justify-center gap-3">
             <Hourglass className="w-4 h-4" /> Modo Presentación Inmersivo • Mi Aula Dinámica
           </p>
        </div>

      </div>
    </div>
  );
}

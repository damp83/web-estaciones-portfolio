import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Square, RotateCcw, Clock, Timer, Hourglass, Plus, Minus } from 'lucide-react';
import { usePresentation } from '../../context/PresentationContext';

export default function PresentationOverlay() {
  const { 
    isPresenting, togglePresentation, 
    timerType, timeLeft, isActive, isFinished,
    startStation, startChange, stopTimer 
  } = usePresentation();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [manualMinutes, setManualMinutes] = useState(20);

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

  const adjustMinutes = (amount) => {
    setManualMinutes(prev => Math.max(1, Math.min(60, prev + amount)));
  };

  return (
    <div className={`fixed inset-0 z-[9999] pointer-events-none overflow-hidden font-sans transition-colors duration-1000 ${isPresenting ? 'bg-slate-950/98' : ''} backdrop-blur-3xl`}>
      
      {/* Visual Alert Flash (More intense) */}
      <AnimatePresence>
        {isFinished && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0, 0.5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className={`absolute inset-0 z-0 ${timerType === 'cambio' ? 'bg-amber-500/30' : 'bg-emerald-500/30'}`}
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col p-8 sm:p-12 pointer-events-none">
        
        {/* Top Header: Current Time & Exit */}
        <div className="flex justify-between items-center w-full z-10 pointer-events-auto">
          <div className="bg-white/5 px-8 py-4 rounded-3xl flex items-center gap-4 border border-white/10 backdrop-blur-md">
            <Clock className="w-8 h-8 text-indigo-400" />
            <span className="text-4xl font-black text-white tracking-widest tabular-nums">
              {getTimeString(currentTime)}
            </span>
          </div>
          <button 
            onClick={togglePresentation} 
            className="p-5 bg-white/5 hover:bg-red-500/40 text-white hover:text-white rounded-3xl transition-all border border-white/10 backdrop-blur-xl group shadow-2xl"
            title="Cerrar Modo Aula"
          >
            <X className="w-10 h-10 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Center: Main Timer area */}
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
                 <span className={`text-base font-black uppercase tracking-[1em] mb-6 ${timerType === 'cambio' ? 'text-amber-400' : 'text-emerald-400'}`}>
                   {timerType === 'cambio' ? '¡Tiempo de Cambio!' : 'Actividad en Curso'}
                 </span>
                 <div className={`text-[15rem] sm:text-[20rem] font-black leading-none tabular-nums tracking-tighter drop-shadow-[0_0_80px_rgba(255,255,255,0.15)] ${isFinished ? 'animate-bounce text-white' : (timerType === 'cambio' ? 'text-amber-400' : 'text-white')}`}>
                   {formatTime(timeLeft)}
                 </div>
                 <button 
                   onClick={stopTimer} 
                   className="pointer-events-auto mt-12 bg-white/10 hover:bg-white/20 text-white px-10 py-5 rounded-3xl font-black text-xl flex items-center gap-4 transition-all border-2 border-white/20 backdrop-blur-lg shadow-2xl hover:scale-105 active:scale-95"
                 >
                   <Square className="w-8 h-8 fill-white" /> FINALIZAR AHORA
                 </button>
               </motion.div>
             ) : (
               <motion.div 
                 key="controls"
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 exit={{ y: -20, opacity: 0 }}
                 className="flex flex-col items-center gap-12 pointer-events-auto w-full max-w-4xl"
               >
                  <div className="text-center space-y-4">
                    <h2 className="text-6xl sm:text-7xl font-black text-white tracking-tight">Gestión de Tiempos</h2>
                    <p className="text-slate-400 font-bold text-2xl uppercase tracking-widest">Prepara la siguiente estación</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    
                    {/* Manual Custom Selector */}
                    <div className="bg-white/5 rounded-[3rem] p-10 border border-white/10 flex flex-col items-center gap-6 backdrop-blur-sm shadow-2xl">
                       <span className="text-indigo-400 font-black text-sm uppercase tracking-widest">Tiempo Personalizado</span>
                       <div className="flex items-center gap-8">
                         <button onClick={() => adjustMinutes(-1)} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all hover:scale-110 active:scale-90"><Minus className="w-10 h-10" /></button>
                         <span className="text-8xl font-black text-white tabular-nums w-32 text-center">{manualMinutes}</span>
                         <button onClick={() => adjustMinutes(1)} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all hover:scale-110 active:scale-90"><Plus className="w-10 h-10" /></button>
                       </div>
                       <button 
                        onClick={() => startStation(manualMinutes)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-2xl font-black text-2xl transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-4 group"
                       >
                         <Play className="w-8 h-8 fill-white" /> Iniciar Estación
                       </button>
                    </div>

                    {/* Quick & Change Actions */}
                    <div className="flex flex-col gap-6">
                       <div className="grid grid-cols-2 gap-4 flex-1">
                          {[15, 25].map(min => (
                            <button 
                              key={min}
                              onClick={() => startStation(min)}
                              className="bg-white/5 hover:bg-white/10 text-white rounded-[2rem] font-black text-3xl transition-all border border-white/10 flex flex-col items-center justify-center gap-2 group p-6"
                            >
                              <span className="text-xs text-slate-500 uppercase font-black">Rápido</span>
                              {min}m
                            </button>
                          ))}
                       </div>
                       <button 
                        onClick={startChange}
                        className="bg-amber-500 hover:bg-amber-400 text-amber-950 py-10 rounded-[2.5rem] font-black text-4xl transition-all border-4 border-amber-400/20 shadow-2xl flex items-center justify-center gap-6 group"
                       >
                        <RotateCcw className="w-12 h-12 group-hover:rotate-180 transition-transform duration-700" />
                        CAMBIO (1m)
                       </button>
                    </div>

                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Bottom Bar: High Contrast Label */}
        <div className="z-10 text-center pb-4">
           <p className="text-slate-300 font-black tracking-[0.6em] text-sm sm:text-base uppercase flex items-center justify-center gap-4 opacity-80 mt-8">
             <div className="h-px w-20 bg-slate-800"></div>
             <Hourglass className="w-6 h-6 text-indigo-500" /> 
             Modo Aula Dinámica • Inmersivo 
             <div className="h-px w-20 bg-slate-800"></div>
           </p>
        </div>

      </div>
    </div>
  );
}

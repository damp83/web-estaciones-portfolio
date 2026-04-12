import React from 'react';
import { Reveal } from '../components/Reveal';
import { Users, Heart, Puzzle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Inicio() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-16 lg:space-y-24 mb-16">
      <Reveal>
        <div className="relative pt-8 lg:pt-16 pb-12 lg:pb-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-blob"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
            {/* Texto Hero */}
            <div className="space-y-8 flex flex-col justify-center text-center lg:text-left order-2 lg:order-1 px-4 lg:px-0">
              {isAdmin ? (
                <div className="inline-flex py-1.5 px-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold tracking-widest uppercase border border-emerald-500/20 shadow-sm items-center w-fit gap-2 mx-auto lg:mx-0 backdrop-blur-md">
                  <span className="relative flex h-2 w-2 shadow-[0_0_8px_#10b981]"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                  Modo Administrador
                </div>
              ) : (
                <div className="inline-flex py-1.5 px-4 rounded-full bg-slate-900/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-bold tracking-widest uppercase border border-slate-900/10 dark:border-white/10 shadow-sm items-center w-fit gap-2 mx-auto lg:mx-0 backdrop-blur-md">
                  <Users className="w-4 h-4"/> Vista Pública
                </div>
              )}
              
              <h2 className="text-5xl sm:text-6xl xl:text-7xl font-black text-slate-800 dark:text-white leading-[1.1] tracking-tight">
                Aprender a través de <br className="hidden sm:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400 relative inline-block group">
                  Estaciones
                  <motion.span className="absolute -bottom-2 left-0 w-full h-2 bg-amber-400/80 rounded-full" layoutId="underline" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5, duration: 0.8 }} style={{ transformOrigin: "left" }}></motion.span>
                </span>
              </h2>
              
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed mx-auto lg:mx-0 font-medium">
                Bienvenidos al cuaderno de bitácora de mi aula. Un espacio donde transformamos el aprendizaje para que ningún niño se quede atrás y cada uno encuentre su camino al éxito en el Primer Ciclo.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 mx-auto lg:mx-0">
                <button onClick={() => navigate('/metodologia')} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center justify-center gap-3 group transform hover:-translate-y-1 text-lg">
                  <Sparkles className="w-5 h-5 text-indigo-200 group-hover:animate-pulse" /> Descubrir Proyecto
                </button>
                <button onClick={() => window.scrollTo({ top: document.getElementById('pilares').offsetTop - 100, behavior: 'smooth' })} className="w-full sm:w-auto bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-4 px-8 rounded-2xl transition-all border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center gap-2 group hover:-translate-y-1 text-lg backdrop-blur-md">
                  Ver pilares <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Imagen Hero 3D Generada */}
            <div className="relative order-1 lg:order-2 flex justify-center perspective-1000">
               <motion.div animate={{ y: [-10, 10, -10], rotate: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="relative w-full max-w-lg lg:max-w-xl xl:max-w-2xl px-4">
                 {/* Decorative elements behind image */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-purple-500/20 rounded-full blur-[80px] -z-10"></div>
                 <img src="/hero_3d.png" alt="Educación Dinámica 3D" className="w-full h-auto object-contain drop-shadow-2xl relative z-10 [filter:drop-shadow(0_30px_30px_rgba(0,0,0,0.15))]" />
               </motion.div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Pilares Section with Glassmorphism */}
      <Reveal delay={0.2}>
        <div id="pilares" className="pt-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-4">La Base de Nuestra Aula</h3>
            <p className="text-slate-500 text-lg font-medium mx-auto max-w-2xl">Tres pilares fundamentales sobre los que construimos la experiencia de aprendizaje diaria.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-20">
            <div className="glass-panel p-8 rounded-3xl flex flex-col items-center text-center gap-4 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/30 group">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-600 dark:text-blue-400 rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-xl">Inclusión Real</h3>
              <p className="text-slate-600 dark:text-slate-400">Materiales multinivel totalmente adaptados al Diseño Universal para el Aprendizaje (DUA) para acoger toda la diversidad.</p>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl flex flex-col items-center text-center gap-4 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/30 group">
              <div className="p-4 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-xl">Autonomía Total</h3>
              <p className="text-slate-600 dark:text-slate-400">El alumnado es el protagonista absoluto, fomentando la responsabilidad, la gestión del tiempo y la ayuda entre iguales.</p>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl flex flex-col items-center text-center gap-4 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-500/30 group">
              <div className="p-4 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 text-amber-600 dark:text-amber-400 rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Puzzle className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-xl">Naturaleza Manipulativa</h3>
              <p className="text-slate-600 dark:text-slate-400">Aprender tocando y experimentando de forma práctica, respetando la etapa evolutiva tan crucial del primer ciclo.</p>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

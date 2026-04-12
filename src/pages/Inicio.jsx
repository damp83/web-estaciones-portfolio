import React from 'react';
import { Reveal } from '../components/Reveal';
import { Users, Heart, Puzzle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Inicio() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <Reveal>
        <div className="relative mb-20 md:mb-12">
          <div className="blob blob-indigo top-0 -left-10 w-72 h-72"></div>
          <div className="blob blob-emerald top-40 -right-10 w-96 h-96"></div>
          <div className="bg-indigo-900 dark:bg-indigo-950 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/20 relative z-10 transition-colors border border-indigo-500/10 backdrop-blur-sm">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-300 via-transparent to-transparent"></div>
            <div className="px-8 py-10 sm:px-16 sm:py-16 relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                {isAdmin ? (
                  <span className="inline-block py-1 px-3 rounded-full bg-emerald-500 text-white text-sm font-semibold tracking-wide border border-emerald-400 shadow-sm flex items-center w-fit gap-1">
                    Modo Administrador Activo
                  </span>
                ) : (
                  <span className="inline-block py-1 px-3 rounded-full bg-slate-700 dark:bg-slate-800 text-slate-200 text-sm font-semibold tracking-wide border border-slate-600 shadow-sm flex items-center w-fit gap-1">
                    <Users className="w-4 h-4"/> Vista Pública
                  </span>
                )}
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">Aprender a tu propio ritmo a través de <span className="text-amber-400">Estaciones</span></h2>
                <p className="text-lg text-indigo-100 max-w-2xl leading-relaxed text-justify">Bienvenidos al cuaderno de bitácora de mi aula. Un espacio donde comparto cómo transformamos el aprendizaje para que ningún niño se quede atrás y cada uno encuentre su camino al éxito.</p>
                <button onClick={() => navigate('/metodologia')} className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold py-3 px-6 rounded-xl transition-colors shadow-lg flex items-center gap-2">
                  Conoce el proyecto <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.3}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-20">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-start gap-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/30">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"><Users className="w-6 h-6" /></div>
            <div><h3 className="font-bold text-slate-800 dark:text-white text-lg">Inclusión Real</h3><p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Materiales multinivel adaptados al Diseño Universal para el Aprendizaje (DUA).</p></div>
          </div>
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-start gap-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/30">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl"><Heart className="w-6 h-6" /></div>
            <div><h3 className="font-bold text-slate-800 dark:text-white text-lg">Autonomía</h3><p className="text-slate-500 dark:text-slate-400 text-sm mt-1">El alumnado es protagonista, fomentando la responsabilidad y la ayuda entre iguales.</p></div>
          </div>
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-start gap-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-500/30">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl"><Puzzle className="w-6 h-6" /></div>
            <div><h3 className="font-bold text-slate-800 dark:text-white text-lg">Manipulativo</h3><p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Aprender tocando y experimentando, respetando la etapa evolutiva del primer ciclo.</p></div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

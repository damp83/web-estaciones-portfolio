import React from 'react';
import { Reveal } from '../components/Reveal';
import { BookOpen } from 'lucide-react';

export default function Metodologia() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <Reveal>
        <div className="max-w-3xl">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">El Motor de Nuestra Aula</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">Trabajar por estaciones no es solo organizar mesas diferentes; es una profunda transformación metodológica basada en la equidad y el respeto a la diversidad.</p>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Reveal delay={0.1}>
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-xl hover:-translate-y-1 h-full">
            <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">¿En qué consiste?</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-justify mb-4">El proyecto consiste en la implementación de 'Estaciones de Aprendizaje' en el 1º ciclo de Primaria como respuesta inclusiva a la diversidad del aula.</p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-justify">Esta práctica transforma el aula tradicional en un ecosistema flexible que respeta los diferentes ritmos madurativos, garantizando la participación y el éxito de todo el grupo.</p>
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-xl hover:-translate-y-1 h-full">
            <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">¿Cómo funciona?</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-justify mb-4">El aula se organiza dinámicamente en 5 estaciones simultáneas con propuestas multinivel, diseñadas bajo el DUA:</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div><span className="text-slate-700 dark:text-slate-300 text-sm"><strong className="text-indigo-900 dark:text-indigo-400 block sm:inline">Juego simbólico:</strong> Desarrollo social, roles y lenguaje oral.</span></li>
              <li className="flex items-start gap-2"><div className="w-2 h-2 rounded-full bg-pink-500 mt-1.5 shrink-0"></div><span className="text-slate-700 dark:text-slate-300 text-sm"><strong className="text-pink-900 dark:text-pink-400 block sm:inline">Lecto-escritura:</strong> Conciencia fonológica, trazo, lectura y comprensión.</span></li>
              <li className="flex items-start gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div><span className="text-slate-700 dark:text-slate-300 text-sm"><strong className="text-blue-900 dark:text-blue-400 block sm:inline">Lógica-matemática:</strong> Numeración, cálculo manipulativo y problemas.</span></li>
              <li className="flex items-start gap-2"><div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div><span className="text-slate-700 dark:text-slate-300 text-sm"><strong className="text-amber-900 dark:text-amber-400 block sm:inline">Mentalandia:</strong> Funciones ejecutivas, atención, memoria y retos.</span></li>
              <li className="flex items-start gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div><span className="text-slate-700 dark:text-slate-300 text-sm"><strong className="text-emerald-900 dark:text-emerald-400 block sm:inline">Sabiómetro:</strong> Evaluación, refuerzo directo o ampliación.</span></li>
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-xl hover:-translate-y-1 h-full">
            <h3 className="text-xl font-bold text-amber-500 dark:text-amber-400 mb-4">Rutina y Organización</h3>
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-amber-700 dark:text-amber-400 block mb-1">Pre-Requisitos (20 min)</strong>Explicación previa al grupo clase de cada una de las 5 tareas de ese día. Todo el mundo debe saber qué y cómo se hace visualmente.</p>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-indigo-700 dark:text-indigo-400 block mb-1">Rotación (10 min + 1 min)</strong>Cada grupo pasa un tiempo máximo de 10 minutos por estación. Suena una alarma y cuentan con 1 minuto exacto para recoger el material y dejar la bandeja perfecta para el siguiente grupo.</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-700 dark:text-emerald-400 block mb-1">Apoyo Docente</strong>Para que el Sabiómetro no condene la autonomía del aula, se recomienda realizar las estaciones aprovechando los desdobles o el apoyo dentro del aula con un segundo docente ("Co-Teaching").</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
      
      <Reveal delay={0.4}>
        <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-md relative overflow-hidden mt-8">
            <div className="absolute top-0 right-0 p-8 opacity-10"><BookOpen className="w-64 h-64" /></div>
            <div className="relative z-10 max-w-4xl">
              <h3 className="text-3xl font-extrabold text-amber-400 mb-8">Fundamentación Pedagógica y Curricular</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h4 className="text-xl font-bold text-indigo-300 mb-4 border-b border-indigo-800/50 pb-2">Marco Pedagógico</h4>
                  <ul className="space-y-4 text-slate-300 text-base leading-relaxed">
                    <li><strong className="text-white block mb-1">Constructivismo y Vygotsky</strong> El aprendizaje es social. El trabajo cooperativo activa la <em>Zona de Desarrollo Próximo</em> mediante andamiaje y tutoría entre iguales.</li>
                    <li><strong className="text-white block mb-1">Diseño Universal para el Aprendizaje (DUA)</strong> Garantiza la inclusión desde la planificación, ofreciendo múltiples formas de representación, expresión e implicación.</li>
                    <li><strong className="text-white block mb-1">Neuroeducación</strong> El enfoque lúdico favorece la emoción y la memoria. La estación "Mentalandia" entrena directamente las funciones ejecutivas.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-emerald-300 mb-4 border-b border-emerald-800/50 pb-2">Marco Curricular (LOMLOE)</h4>
                  <ul className="space-y-4 text-slate-300 text-base leading-relaxed">
                    <li><strong className="text-white block mb-1">Enfoque Competencial</strong> Las estaciones plantean retos que movilizan <em>saberes básicos</em> en situaciones reales, contribuyendo al Perfil de Salida.</li>
                    <li><strong className="text-white block mb-1">Inclusión y Equidad (Art. 4)</strong> Medida ordinaria de atención a la diversidad que evita la segregación y enriquece el entorno del aula.</li>
                    <li><strong className="text-white block mb-1">Evaluación Formativa</strong> La estación "Sabiómetro" permite una evaluación continua, observacional y reguladora del proceso.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
    </div>
  );
}

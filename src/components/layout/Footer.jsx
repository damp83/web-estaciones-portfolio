import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-200/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 mt-12 py-8 relative z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 text-center">
        <p>&copy; {new Date().getFullYear()} Web creada por Diego Alberto Moya Puerta. Todos los derechos reservados.</p>
        <p className="font-bold text-slate-700 dark:text-slate-300 text-base">CEIP La Arboleda (Murcia)</p>
      </div>
    </footer>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DownloadCloud, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export default function InstallWebAppBanner() {
  const { isInstallable, isInstalled, promptInstall, dismissPrompt } = usePWAInstall();

  // Si no es instalable (ya instalada o dispositivo no compatible), no mostrar nada
  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 150, autoAlpha: 0 }}
        animate={{ y: 0, autoAlpha: 1 }}
        exit={{ y: 150, autoAlpha: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 2 }} // Esperamos 2s antes de que salte
        className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[999] pointer-events-none"
      >
        <div className="glass-panel p-4 rounded-3xl pointer-events-auto border border-indigo-500/20 shadow-2xl flex items-center gap-4 bg-white/80 dark:bg-slate-900/80">
          
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-2xl shadow-inner flex-shrink-0">
            <DownloadCloud className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1">
            <h4 className="font-bold text-slate-800 dark:text-white leading-tight">Instalar App</h4>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Acceso súper rápido, offline y sin navegador.</p>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={promptInstall}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-1.5 px-4 rounded-full transition-colors"
              >
                Instalar ahora
              </button>
              <button 
                onClick={dismissPrompt}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold py-1.5 px-4 rounded-full transition-colors flex items-center justify-center"
                aria-label="Cerrar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

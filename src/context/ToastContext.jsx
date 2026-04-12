import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, confirmDialog, setConfirmDialog }}>
      {children}
      
      {/* TOASTS RENDERING */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`p-4 rounded-xl shadow-lg text-white font-medium animate-in slide-in-from-bottom-5 pointer-events-auto flex items-center gap-2 max-w-sm ${t.type === 'error' ? 'bg-red-500' : 'bg-slate-900 dark:bg-indigo-600'}`}>
            <span className="leading-snug">{t.message}</span>
          </div>
        ))}
      </div>

      {/* CONFIRM MODAL RENDERING */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl max-w-sm w-full animate-in zoom-in-95 border border-slate-100 dark:border-slate-800 pointer-events-auto">
              <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Confirmar acción</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">{confirmDialog.message}</p>
              <div className="flex justify-end gap-3">
                 <button onClick={() => setConfirmDialog(null)} className="px-5 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-bold transition-colors">Cancelar</button>
                 <button onClick={confirmDialog.onConfirm} className="px-5 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-md">Eliminar</button>
              </div>
           </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginModal() {
  const { login, showLoginModal, setShowLoginModal } = useAuth();
  const [loginCreds, setLoginCreds] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  if (!showLoginModal) return null;

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setLoginError('');
    try {
      await login(loginCreds.email, loginCreds.password);
      setShowLoginModal(false); 
      setLoginCreds({ email: '', password: '' });
    } catch(e) { 
      setLoginError(e.message || 'Credenciales incorrectas. Verifica tu email y contraseña.'); 
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-8 relative animate-in fade-in zoom-in-95 border dark:border-slate-800 pointer-events-auto">
        <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X className="w-6 h-6" />
        </button>
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
            <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-6">Acceso Docente</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          {loginError && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center font-medium border border-red-100 dark:border-red-900/30">{loginError}</div>}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input type="email" required value={loginCreds.email} onChange={e => setLoginCreds({...loginCreds, email: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
            <input type="password" required value={loginCreds.password} onChange={e => setLoginCreds({...loginCreds, password: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors mt-2">Iniciar Sesión</button>
        </form>
      </div>
    </div>
  );
}

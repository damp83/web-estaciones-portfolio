import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Home, BookOpen, Shapes, LineChart, Calendar, MessageCircle, Camera, Briefcase,
  Star, Sun, Moon, Lock, Unlock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NavButton = ({ to, label, icon: Icon, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-300 font-bold group transform hover:-translate-y-1
      ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md'}`}
  >
    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" /><span>{label}</span>
  </NavLink>
);

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAdmin, logout, setShowLoginModal } = useAuth();
  const { darkMode, setDarkMode } = useTheme();

  const handleMobileClick = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-4 cursor-pointer group">
             <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-indigo-100 dark:shadow-none shadow-xl group-hover:scale-110 transition-transform"><Star className="w-8 h-8 text-white" /></div>
             <div>
               <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1 text-center md:text-left">Mi Aula Dinámica</h1>
               <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
                 1º Ciclo Primaria <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span> CEIP La Arboleda
               </p>
             </div>
          </Link>
          <div className="flex items-center gap-2">
             <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all border border-transparent flex items-center gap-2 text-sm font-bold group" title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}>
                {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
             </button>
             <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
             {isAdmin ? (
                <button onClick={logout} className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-sm">
                  <Unlock className="w-4 h-4" /> <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
             ) : (
                <button onClick={() => setShowLoginModal(true)} className="p-2.5 text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all border border-transparent flex items-center gap-2 text-sm font-bold group">
                  <Lock className="w-5 h-5 group-hover:rotate-12 transition-transform" /> <span className="hidden sm:inline">Acceso</span>
                </button>
             )}
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-x-auto scrollbar-hide transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between md:justify-center h-16 sm:h-20">
            <div className="hidden md:flex items-center gap-1 w-full justify-between">
               <NavButton to="/" label="Inicio" icon={Home} />
               <NavButton to="/trayectoria" label="Trayectoria" icon={Briefcase} />
               <NavButton to="/metodologia" label="Método" icon={BookOpen} />
               <NavButton to="/materiales" label="Materiales" icon={Shapes} />
               <NavButton to="/evaluacion" label="Evaluación" icon={LineChart} />
               <NavButton to="/calendario" label="Calendario" icon={Calendar} />
               <NavButton to="/familias" label="Familias" icon={MessageCircle} />
               <NavButton to="/galeria" label="Galería" icon={Camera} />
            </div>
            
            <div className="md:hidden flex items-center justify-between w-full py-4">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><Star className="w-5 h-5 text-white" /></div>
                 <span className="font-bold text-slate-800 dark:text-slate-100">Navegación</span>
               </div>
               <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
               </button>
            </div>
          </div>
        </div>
        
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top-4 transition-colors">
            <NavButton to="/" label="Inicio" icon={Home} onClick={handleMobileClick} />
            <NavButton to="/trayectoria" label="Trayectoria" icon={Briefcase} onClick={handleMobileClick} />
            <NavButton to="/metodologia" label="Método" icon={BookOpen} onClick={handleMobileClick} />
            <NavButton to="/materiales" label="Materiales" icon={Shapes} onClick={handleMobileClick} />
            <NavButton to="/evaluacion" label="Evaluación" icon={LineChart} onClick={handleMobileClick} />
            <NavButton to="/calendario" label="Calendario" icon={Calendar} onClick={handleMobileClick} />
            <NavButton to="/familias" label="Familias" icon={MessageCircle} onClick={handleMobileClick} />
            <NavButton to="/galeria" label="Galería" icon={Camera} onClick={handleMobileClick} />
          </div>
        )}
      </nav>
    </>
  );
}

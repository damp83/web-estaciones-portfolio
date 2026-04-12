import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, BookOpen, Shapes, LineChart, Calendar, MessageCircle, Camera, Briefcase,
  Star, Sun, Moon, Lock, Unlock, Menu, X, Monitor
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { usePresentation } from '../../context/PresentationContext';

const NavItem = ({ to, label, icon: Icon, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 font-bold group
      ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
  >
    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
    <span className="text-sm">{label}</span>
  </NavLink>
);

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAdmin, logout, setShowLoginModal } = useAuth();
  const { darkMode, setDarkMode } = useTheme();
  const { togglePresentation, isPresenting } = usePresentation();
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {!isPresenting && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="relative z-50 w-full"
        >
          {/* Top Header Layer (Brand + Settings) */}
          <header className="px-4 sm:px-6 lg:px-8 pt-6 pb-2">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <Link to="/" className="flex items-center gap-3 cursor-pointer group">
                 <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                   <Star className="w-6 h-6 text-white" />
                 </div>
                 <div>
                   <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-none mb-0.5">Mi Aula Dinámica</h1>
                   <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                     1º Ciclo <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span> La Arboleda
                   </p>
                 </div>
              </Link>

              <div className="flex items-center gap-2">
                 <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all border border-transparent flex items-center justify-center">
                    {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
                 </button>
                 <button onClick={togglePresentation} className="p-2 text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all border border-transparent flex items-center justify-center group" title="Modo Presentación">
                    <Monitor className="w-5 h-5 group-hover:scale-110 transition-transform" />
                 </button>
                 {isAdmin ? (
                    <button onClick={logout} className="p-2 sm:px-4 sm:py-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl font-bold transition-colors flex items-center gap-2">
                      <Unlock className="w-5 h-5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline text-sm">Cerrar</span>
                    </button>
                 ) : (
                    <button onClick={() => setShowLoginModal(true)} className="p-2 sm:px-4 sm:py-2 text-slate-500 hover:text-indigo-600 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl font-bold transition-all flex items-center gap-2">
                      <Lock className="w-5 h-5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline text-sm">Acceso</span>
                    </button>
                 )}
                 <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl ml-1 transition-colors">
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                 </button>
              </div>
            </div>
          </header>

          {/* Modern Floating Pill Navigation (Desktop) */}
          <div className="hidden md:flex justify-center sticky top-6 z-[60] px-4 transition-all duration-500 pointer-events-none mb-4">
            <nav className={`pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-2xl transition-all duration-300 ${scrolled ? 'glass-pill scale-95 origin-top' : 'bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-sm border border-slate-200/50 dark:border-slate-800/50'}`}>
               <NavItem to="/" label="Inicio" icon={Home} />
               <NavItem to="/trayectoria" label="Trayectoria" icon={Briefcase} />
               <NavItem to="/metodologia" label="Método" icon={BookOpen} />
               <NavItem to="/materiales" label="Materiales" icon={Shapes} />
               <NavItem to="/evaluacion" label="Evaluación" icon={LineChart} />
               <NavItem to="/calendario" label="Calendario" icon={Calendar} />
               <NavItem to="/familias" label="Familias" icon={MessageCircle} />
               <NavItem to="/galeria" label="Galería" icon={Camera} />
            </nav>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-sm dark:bg-black/40" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="absolute top-0 right-0 w-64 h-full bg-white dark:bg-slate-900 shadow-2xl p-6 transform transition-transform animate-in slide-in-from-right-8" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-8">
                  <span className="font-bold text-slate-800 dark:text-white">Menú</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X className="w-5 h-5"/></button>
                </div>
                <div className="flex flex-col gap-2">
                  <NavItem to="/" label="Inicio" icon={Home} />
                  <NavItem to="/trayectoria" label="Trayectoria" icon={Briefcase} />
                  <NavItem to="/metodologia" label="Método" icon={BookOpen} />
                  <NavItem to="/materiales" label="Materiales" icon={Shapes} />
                  <NavItem to="/evaluacion" label="Evaluación" icon={LineChart} />
                  <NavItem to="/calendario" label="Calendario" icon={Calendar} />
                  <NavItem to="/familias" label="Familias" icon={MessageCircle} />
                  <NavItem to="/galeria" label="Galería" icon={Camera} />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

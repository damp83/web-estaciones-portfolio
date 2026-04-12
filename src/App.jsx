import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Providers
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoginModal from './components/ui/LoginModal';

// Pages
import Inicio from './pages/Inicio';
import Trayectoria from './pages/Trayectoria';
import Metodologia from './pages/Metodologia';
import Materiales from './pages/Materiales';
import Evaluacion from './pages/Evaluacion';
import Calendario from './pages/Calendario';
import Familias from './pages/Familias';
import Galeria from './pages/Galeria';

// Animated Route Wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full relative z-10"
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Inicio />} />
          <Route path="/trayectoria" element={<Trayectoria />} />
          <Route path="/metodologia" element={<Metodologia />} />
          <Route path="/materiales" element={<Materiales />} />
          <Route path="/evaluacion" element={<Evaluacion />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/familias" element={<Familias />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function AppContent() {
  return (
    <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark font-sans transition-colors duration-500 antialiased selection:bg-indigo-500/30 overflow-x-hidden relative flex flex-col">
      <Navbar />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 flex flex-col">
        <AnimatedRoutes />
      </main>

      <Footer />
      <LoginModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <DataProvider>
            <Router>
               <AppContent />
            </Router>
          </DataProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

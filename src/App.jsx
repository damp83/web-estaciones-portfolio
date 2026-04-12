import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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

function AppContent() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 antialiased selection:bg-indigo-500/30">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10 w-full animate-in fade-in zoom-in-95 duration-500 slide-in-from-bottom-4">
        <Routes>
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

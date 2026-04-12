import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Providers
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { PresentationProvider, usePresentation } from './context/PresentationContext';

// Components Core
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoginModal from './components/ui/LoginModal';
import InstallWebAppBanner from './components/ui/InstallWebAppBanner';
import PresentationOverlay from './components/ui/PresentationOverlay';
import { Loader2 } from 'lucide-react';
import OneSignal from 'react-onesignal';

// Lazy Loaded Pages (Code Splitting)
const Inicio = lazy(() => import('./pages/Inicio'));
const Trayectoria = lazy(() => import('./pages/Trayectoria'));
const Metodologia = lazy(() => import('./pages/Metodologia'));
const Materiales = lazy(() => import('./pages/Materiales'));
const Evaluacion = lazy(() => import('./pages/Evaluacion'));
const Calendario = lazy(() => import('./pages/Calendario'));
const Familias = lazy(() => import('./pages/Familias'));
const Galeria = lazy(() => import('./pages/Galeria'));

// Elegant Lazy Loading Fallback
const LoadingFallback = () => (
  <div className="w-full flex items-center justify-center p-20 min-h-[50vh]">
    <div className="flex flex-col items-center gap-4 animate-pulse">
      <div className="p-4 bg-indigo-50 dark:bg-slate-800 rounded-full">
         <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
      </div>
      <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-sm">Cargando...</p>
    </div>
  </div>
);

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
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

function AppContent() {
  const { isPresenting } = usePresentation();

  useEffect(() => {
    const initOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: "9a560765-cebf-4a18-a541-005169a8e213",
          allowLocalhostAsSecureOrigin: true,
          notifyButton: {
            enable: true,
            displayPredicate: () => OneSignal.isPushNotificationsSupported(),
          },
        });
        OneSignal.Slidedown.promptPush();
      } catch (error) {
        console.error('OneSignal initialization failed:', error);
      }
    };
    initOneSignal();
  }, []);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 antialiased selection:bg-indigo-500/30 overflow-x-hidden relative flex flex-col ${isPresenting ? 'bg-[#05070A]' : 'bg-mesh-light'}`}>
      <Navbar />
      
      <main className={`flex-1 w-full transition-all duration-700 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col ${isPresenting ? 'py-0 max-w-none' : 'py-8 md:py-16 max-w-7xl'}`}>
        <AnimatedRoutes />
      </main>

      {!isPresenting && <Footer />}
      <LoginModal />
      {!isPresenting && <InstallWebAppBanner />}
      <PresentationOverlay />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <DataProvider>
            <PresentationProvider>
              <Router>
                 <AppContent />
              </Router>
            </PresentationProvider>
          </DataProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

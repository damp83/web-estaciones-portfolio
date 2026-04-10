import React, { useState, useEffect } from 'react';
import { Reveal } from './components/Reveal';
import {
  Home, BookOpen, Shapes, Heart, Star, ArrowRight,
  Puzzle, Pencil, Calculator, Users, Plus, X, Loader2, FileText, Upload,
  LineChart, MessageCircle, Camera, Edit, Trash2, Lock, Unlock,
  Briefcase, GraduationCap, Award, ChevronLeft, ChevronRight, Maximize2, Search,
  Sun, Moon, Calendar
} from 'lucide-react';
import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// --- CONFIGURACIÓN DE APPWRITE REAL ---
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT  = '69ce43a7000e02b746fd';
const APPWRITE_DB       = '69ce45120035f87b902c';
const COL_MATERIALES    = 'materiales';
const COL_EVALUACION    = 'evaluacion';
const COL_FAMILIAS      = 'familias';
const COL_GALERIA       = 'galeria';
const COL_TRAYECTORIA   = 'trayectoria';
const COL_EVENTOS       = 'eventos';
const APPWRITE_BUCKET   = '69ce487f0008996c21da';
const ADMIN_USER_ID     = '69ce54ed0035744a90ac';

const client    = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT);
const account   = new Account(client);
const databases = new Databases(client);
const storage   = new Storage(client);

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'clean']
  ],
};

const getOptimizedUrl = (url, w, h, q = 80) => {
  if (!url || !url.includes('storage/buckets')) return url;
  const params = [];
  if (w) params.push(`width=${w}`);
  if (h) params.push(`height=${h}`);
  if (q) params.push(`quality=${q}`);
  if (w && h) { params.push('gravity=center'); params.push('crop=fill'); }
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${params.join('&')}`;
};

const deleteFileFromUrl = async (url) => {
  if (!url) return;
  try {
    const match = url.match(/\/files\/([a-zA-Z0-9_-]+)\//);
    if (match && match[1]) {
      await storage.deleteFile(APPWRITE_BUCKET, match[1]);
      console.log('Archivo físico eliminado del Storage:', match[1]);
    }
  } catch (e) {
    console.warn('No se pudo eliminar el archivo físico (podría estar ya borrado):', e);
  }
};

const SkeletonMaterial = () => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-6 animate-pulse">
    <div className="bg-slate-200 dark:bg-slate-800 w-16 h-16 rounded-2xl shrink-0"></div>
    <div className="flex-1 w-full">
      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-3"></div>
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mb-1"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6 mb-4"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
    </div>
  </div>
);

const SkeletonEvaluacion = () => (
  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col relative animate-pulse h-48">
    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mb-1"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6 mb-4"></div>
    <div className="mt-auto h-8 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
  </div>
);

const SkeletonFamilia = () => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col relative animate-pulse h-56">
    <div className="flex justify-between mb-4">
      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
    </div>
    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mb-4"></div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/6"></div>
    </div>
  </div>
);

const SkeletonGaleria = () => (
  <div className="rounded-2xl aspect-square border border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
);

const SkeletonCalendario = () => (
  <div className="animate-pulse">
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-8">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48"></div>
        <div className="flex gap-2">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        </div>
      </div>
      <div className="h-[400px] w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
    </div>
  </div>
);

const SkeletonTrayectoria = () => (
  <div className="relative pl-8 sm:pl-32 py-6 border-l-2 border-slate-200 dark:border-slate-800 animate-pulse">
    <div className="absolute left-[-11px] sm:left-[-11px] top-8 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-white dark:border-slate-950"></div>
    <div className="hidden sm:block absolute left-4 top-8 w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
      </div>
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
    </div>
  </div>
);

export default function PortfolioDocente() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Auth
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [user, setUser] = useState(null);

  // Data
  const [materiales, setMateriales] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [comunicados, setComunicados] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [trayectoria, setTrayectoria] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form visibility
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [showEvaluacionForm, setShowEvaluacionForm] = useState(false);
  const [showFamiliasForm, setShowFamiliasForm] = useState(false);
  const [showGaleriaForm, setShowGaleriaForm] = useState(false);
  const [showTrayectoriaForm, setShowTrayectoriaForm] = useState(false);
  const [showEventoForm, setShowEventoForm] = useState(false);

  // Edit IDs
  const [editMaterialId, setEditMaterialId] = useState(null);
  const [editEvaluacionId, setEditEvaluacionId] = useState(null);
  const [editFamiliaId, setEditFamiliaId] = useState(null);
  const [editFotoId, setEditFotoId] = useState(null);
  const [editTrayectoriaId, setEditTrayectoriaId] = useState(null);
  const [editEventoId, setEditEventoId] = useState(null);

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // UI Polish
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [visibleMateriales, setVisibleMateriales] = useState(6);
  const [isSaving, setIsSaving] = useState(false);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // Search & filters
  const [searchTermMaterial, setSearchTermMaterial] = useState('');
  const [filterCategoriaMaterial, setFilterCategoriaMaterial] = useState('Todas');
  const [searchTermFamilia, setSearchTermFamilia] = useState('');
  const [filterTipoFamilia, setFilterTipoFamilia] = useState('Todos');

  // Form data
  const [newMaterial, setNewMaterial] = useState({ titulo: '', categoria: 'Juego simbólico', descripcion: '' });
  const [archivoPdf, setArchivoPdf] = useState(null);
  const [newEvaluacion, setNewEvaluacion] = useState({ titulo: '', descripcion: '' });
  const [archivoEvidencia, setArchivoEvidencia] = useState(null);
  const [newComunicado, setNewComunicado] = useState({ tipo: 'Importante', titulo: '', descripcion: '' });
  const [archivoFamilia, setArchivoFamilia] = useState(null);
  const [newFoto, setNewFoto] = useState({ titulo: '' });
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [newTrayectoria, setNewTrayectoria] = useState({ categoria: 'Experiencia', titulo: '', subtitulo: '', fecha: '', descripcion: '' });
  const [newEvento, setNewEvento] = useState({ titulo: '', descripcion: '', fecha: '', tipo: 'Reunión' });

  // --- AUTH ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentAccount = await account.get();
        if (currentAccount.$id === ADMIN_USER_ID) {
          setUser(currentAccount);
          setIsAdmin(true);
        }
      } catch { setIsAdmin(false); }
    };
    initAuth();
  }, []);

  // --- DATA FETCH + REALTIME ---
  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const [resMat, resEval, resFam, resGal, resTray, resEv] = await Promise.all([
          databases.listDocuments(APPWRITE_DB, COL_MATERIALES),
          databases.listDocuments(APPWRITE_DB, COL_EVALUACION),
          databases.listDocuments(APPWRITE_DB, COL_FAMILIAS),
          databases.listDocuments(APPWRITE_DB, COL_GALERIA),
          databases.listDocuments(APPWRITE_DB, COL_TRAYECTORIA),
          databases.listDocuments(APPWRITE_DB, COL_EVENTOS, [Query.orderAsc('fecha')]),
        ]);
        setMateriales(resMat.documents.reverse());
        setEvaluaciones(resEval.documents.reverse());
        setComunicados(resFam.documents.reverse());
        setFotos(resGal.documents.reverse());
        setTrayectoria(resTray.documents.reverse());
        setEventos(resEv.documents);
      } catch (e) {
        console.error('Error cargando datos:', e);
        if (e.message) alert('Error listando documentos: ' + e.message);
      }
      finally { setIsLoading(false); }
    };
    fetchData();
    
    // Realtime Subscriptions
    const unsub = client.subscribe([
      `databases.${APPWRITE_DB}.collections.${COL_MATERIALES}.documents`,
      `databases.${APPWRITE_DB}.collections.${COL_EVALUACION}.documents`,
      `databases.${APPWRITE_DB}.collections.${COL_FAMILIAS}.documents`,
      `databases.${APPWRITE_DB}.collections.${COL_GALERIA}.documents`,
      `databases.${APPWRITE_DB}.collections.${COL_TRAYECTORIA}.documents`,
      `databases.${APPWRITE_DB}.collections.${COL_EVENTOS}.documents`,
    ], (response) => {
      const { events, payload } = response;
      const event = events[0];
      const collId = event.split('.')[3]; // databases.db.collections.COLLID.documents...
      const type = event.split('.').pop(); // create, update, delete

      // Helper to update state if item isn't in state or needs update
      if (collId === COL_MATERIALES) {
        if (type === 'create') {
          setMateriales(prev => prev.some(x => x.$id === payload.$id) ? prev : [payload, ...prev]);
          if (!isAdmin) addToast('Nuevo recurso disponible');
        } else if (type === 'update') {
          setMateriales(prev => prev.map(x => x.$id === payload.$id ? payload : x));
        } else if (type === 'delete') {
          setMateriales(prev => prev.filter(x => x.$id !== payload.$id));
        }
      } else if (collId === COL_FAMILIAS) {
        if (type === 'create') {
          setComunicados(prev => prev.some(x => x.$id === payload.$id) ? prev : [payload, ...prev]);
          addToast('⚠️ Nuevo aviso a las familias');
        } else if (type === 'update') {
          setComunicados(prev => prev.map(x => x.$id === payload.$id ? payload : x));
        } else if (type === 'delete') {
          setComunicados(prev => prev.filter(x => x.$id !== payload.$id));
        }
      } else if (collId === COL_EVALUACION) {
        if (type === 'create') {
          setEvaluaciones(prev => prev.some(x => x.$id === payload.$id) ? prev : [payload, ...prev]);
        } else if (type === 'update') {
          setEvaluaciones(prev => prev.map(x => x.$id === payload.$id ? payload : x));
        } else if (type === 'delete') {
          setEvaluaciones(prev => prev.filter(x => x.$id !== payload.$id));
        }
      } else if (collId === COL_GALERIA) {
        if (type === 'create') {
          setFotos(prev => prev.some(x => x.$id === payload.$id) ? prev : [payload, ...prev]);
          if (!isAdmin) addToast('Nueva foto en la galería');
        } else if (type === 'update') {
          setFotos(prev => prev.map(x => x.$id === payload.$id ? payload : x));
        } else if (type === 'delete') {
          setFotos(prev => prev.filter(x => x.$id !== payload.$id));
        }
      } else if (collId === COL_TRAYECTORIA) {
        if (type === 'create') {
          setTrayectoria(prev => prev.some(x => x.$id === payload.$id) ? prev : [payload, ...prev]);
        } else if (type === 'update') {
          setTrayectoria(prev => prev.map(x => x.$id === payload.$id ? payload : x));
        } else if (type === 'delete') {
          setTrayectoria(prev => prev.filter(x => x.$id !== payload.$id));
        }
      } else if (collId === COL_EVENTOS) {
        if (type === 'create') {
          setEventos(prev => [...prev, payload].sort((a,b) => a.fecha.localeCompare(b.fecha)));
          if (!isAdmin) addToast('Nuevo evento en el calendario');
        } else if (type === 'update') {
          setEventos(prev => prev.map(x => x.$id === payload.$id ? payload : x).sort((a,b) => a.fecha.localeCompare(b.fecha)));
        } else if (type === 'delete') {
          setEventos(prev => prev.filter(x => x.$id !== payload.$id));
        }
      }
    });
    return () => unsub();
  }, []);

  // --- LOGIN / LOGOUT ---
  const handleLogin = async (e) => {
    e.preventDefault(); setLoginError('');
    try {
      await account.createEmailPasswordSession(loginCreds.email, loginCreds.password);
      const cu = await account.get();
      if (cu.$id !== ADMIN_USER_ID) {
        await account.deleteSession('current');
        setLoginError('Este usuario no tiene permisos de administrador.');
        return;
      }
      setUser(cu); setIsAdmin(true);
      setShowLoginModal(false); setLoginCreds({ email: '', password: '' });
    } catch { setLoginError('Credenciales incorrectas. Verifica tu email y contraseña.'); }
  };
  const handleLogout = async () => {
    try { await account.deleteSession('current'); } catch {}
    setIsAdmin(false); setUser(null);
  };

  // --- MATERIALES ---
  const triggerEditMaterial = (mat) => {
    setNewMaterial({ titulo: mat.titulo, categoria: mat.categoria, descripcion: mat.descripcion });
    setEditMaterialId(mat.$id); setShowMaterialForm(true);
  };
  const handleDeleteMaterial = async (id) => {
    setConfirmDialog({
      message: '¿Estás seguro de que quieres eliminar este material? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          const doc = materiales.find(m => m.$id === id);
          if (doc && doc.archivoUrl) await deleteFileFromUrl(doc.archivoUrl);
          await databases.deleteDocument(APPWRITE_DB, COL_MATERIALES, id);
          setMateriales(prev => prev.filter(m => m.$id !== id));
          addToast('Material eliminado', 'success');
        } catch (e) { addToast('Error al eliminar el material: ' + e.message, 'error'); }
        setConfirmDialog(null);
      }
    });
  };
  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterial.titulo || !newMaterial.descripcion) return;
    setIsSaving(true);
    let fileUrl = null, fileName = null;
    try {
      if (archivoPdf) {
        const uf = await storage.createFile(APPWRITE_BUCKET, ID.unique(), archivoPdf);
        fileUrl = `https://cloud.appwrite.io/v1/storage/buckets/${APPWRITE_BUCKET}/files/${uf.$id}/view?project=${APPWRITE_PROJECT}`;
        fileName = archivoPdf.name;
      }
      
      const data = {
        titulo: newMaterial.titulo,
        categoria: newMaterial.categoria,
        descripcion: newMaterial.descripcion,
        archivoUrl: fileUrl,
        archivoNombre: fileName
      };
      
      console.log('Enviando a Materiales:', data);

      if (editMaterialId) {
        const upd = await databases.updateDocument(APPWRITE_DB, COL_MATERIALES, editMaterialId, data);
        setMateriales(prev => prev.map(m => m.$id === editMaterialId ? upd : m));
      } else {
        const cre = await databases.createDocument(APPWRITE_DB, COL_MATERIALES, ID.unique(), data);
        setMateriales(prev => [cre, ...prev]);
      }
      cerrarFormularioMaterial();
      addToast('Material guardado correctamente');
    } catch (e) { addToast('Error al guardar material: ' + e.message, 'error'); }
    finally { setIsSaving(false); }
  };
  const cerrarFormularioMaterial = () => {
    setShowMaterialForm(false); setEditMaterialId(null);
    setNewMaterial({ titulo: '', categoria: 'Juego simbólico', descripcion: '' }); setArchivoPdf(null);
  };

  // --- EVALUACIÓN ---
  const triggerEditEvaluacion = (ev) => {
    setNewEvaluacion({ titulo: ev.titulo, descripcion: ev.descripcion });
    setEditEvaluacionId(ev.$id); setShowEvaluacionForm(true);
  };
  const handleDeleteEvaluacion = async (id) => {
    setConfirmDialog({
      message: '¿Estás seguro de que quieres eliminar esta evidencia?',
      onConfirm: async () => {
        try {
          const doc = evaluaciones.find(e => e.$id === id);
          if (doc && doc.archivoUrl) await deleteFileFromUrl(doc.archivoUrl);
          await databases.deleteDocument(APPWRITE_DB, COL_EVALUACION, id);
          setEvaluaciones(prev => prev.filter(e => e.$id !== id));
          addToast('Evidencia eliminada', 'success');
        } catch (e) { addToast('Error al eliminar la evidencia: ' + e.message, 'error'); }
        setConfirmDialog(null);
      }
    });
  };
  const handleSaveEvaluacion = async (e) => {
    e.preventDefault();
    if (!newEvaluacion.titulo) return;
    setIsSaving(true);
    let fileUrl = null, fileName = null;
    try {
      if (archivoEvidencia) {
        const uf = await storage.createFile(APPWRITE_BUCKET, ID.unique(), archivoEvidencia);
        fileUrl = `https://cloud.appwrite.io/v1/storage/buckets/${APPWRITE_BUCKET}/files/${uf.$id}/view?project=${APPWRITE_PROJECT}`;
        fileName = archivoEvidencia.name;
      }
      
      const data = {
        titulo: newEvaluacion.titulo,
        descripcion: newEvaluacion.descripcion,
        archivoUrl: fileUrl,
        archivoNombre: fileName
      };
      
      console.log('Enviando a Evaluacion:', data);

      if (editEvaluacionId) {
        const upd = await databases.updateDocument(APPWRITE_DB, COL_EVALUACION, editEvaluacionId, data);
        setEvaluaciones(prev => prev.map(ev => ev.$id === editEvaluacionId ? upd : ev));
      } else {
        const cre = await databases.createDocument(APPWRITE_DB, COL_EVALUACION, ID.unique(), data);
        setEvaluaciones(prev => [cre, ...prev]);
      }
      cerrarFormularioEvaluacion();
      addToast('Evidencia guardada correctamente');
    } catch (e) { addToast('Error al guardar evidencia: ' + e.message, 'error'); }
    finally { setIsSaving(false); }
  };
  const cerrarFormularioEvaluacion = () => {
    setShowEvaluacionForm(false); setEditEvaluacionId(null);
    setNewEvaluacion({ titulo: '', descripcion: '' }); setArchivoEvidencia(null);
  };

  // --- CALENDARIO ---
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const triggerEditEvento = (ev) => {
    setNewEvento({ titulo: ev.titulo, descripcion: ev.descripcion, fecha: ev.fecha, tipo: ev.tipo });
    setEditEventoId(ev.$id); setShowEventoForm(true);
  };
  const handleDeleteEvento = async (id) => {
    setConfirmDialog({
      message: '¿Estás seguro de que quieres eliminar este evento?',
      onConfirm: async () => {
        try {
          await databases.deleteDocument(APPWRITE_DB, COL_EVENTOS, id);
          setEventos(prev => prev.filter(e => e.$id !== id));
          addToast('Evento eliminado', 'success');
        } catch (e) { addToast('Error al eliminar el evento: ' + e.message, 'error'); }
        setConfirmDialog(null);
      }
    });
  };
  const handleSaveEvento = async (e) => {
    e.preventDefault();
    if (!newEvento.titulo || !newEvento.fecha) return;
    setIsSaving(true);
    try {
      const data = {
        titulo: newEvento.titulo,
        descripcion: newEvento.descripcion || '',
        fecha: newEvento.fecha,
        tipo: newEvento.tipo
      };
      if (editEventoId) {
        const upd = await databases.updateDocument(APPWRITE_DB, COL_EVENTOS, editEventoId, data);
        setEventos(prev => prev.map(e => e.$id === editEventoId ? upd : e).sort((a,b) => a.fecha.localeCompare(b.fecha)));
      } else {
        const cre = await databases.createDocument(APPWRITE_DB, COL_EVENTOS, ID.unique(), data);
        setEventos(prev => [...prev, cre].sort((a,b) => a.fecha.localeCompare(b.fecha)));
      }
      cerrarFormularioEvento();
      addToast('Evento guardado correctamente');
    } catch (e) { addToast('Error al guardar evento: ' + e.message, 'error'); }
    finally { setIsSaving(false); }
  };
  const cerrarFormularioEvento = () => {
    setShowEventoForm(false); setEditEventoId(null);
    setNewEvento({ titulo: '', descripcion: '', fecha: '', tipo: 'Reunión' });
  };

  const renderCalendario = () => {
    const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const firstDayOfMonth = (y, m) => {
      let d = new Date(y, m, 1).getDay();
      return d === 0 ? 6 : d - 1; // Lunes a Domingo
    };

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const startOffset = firstDayOfMonth(year, month);
    const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(currentMonth);

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

    const getTipoStyles = (tipo) => {
      switch(tipo) {
        case 'Examen':    return 'bg-red-500 text-white';
        case 'Excursión': return 'bg-emerald-500 text-white';
        case 'Reunión':  return 'bg-indigo-600 text-white';
        case 'Festivo':   return 'bg-amber-500 text-slate-900';
        default:          return 'bg-slate-500 text-white';
      }
    };

    const [viewEvento, setViewEvento] = useState(null);

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Calendario de Aula</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Próximos eventos, exámenes y actividades.</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowEventoForm(true)} className="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-md">
              <Plus className="w-5 h-5" /> Nuevo Evento
            </button>
          )}
        </div>

        {isAdmin && showEventoForm && (
          <form onSubmit={handleSaveEvento} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-indigo-100 dark:border-slate-800 mb-8 relative animate-in slide-in-from-top-4 transition-colors">
            <button type="button" onClick={cerrarFormularioEvento} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-6 h-6" /></button>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{editEventoId ? 'Editar Evento' : 'Añadir Evento'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Título</label>
                <input type="text" required value={newEvento.titulo} onChange={e => setNewEvento({...newEvento, titulo: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="Ej: Examen del Tema 3" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de evento</label>
                <select value={newEvento.tipo} onChange={e => setNewEvento({...newEvento, tipo: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 transition-colors">
                  <option>Examen</option><option>Excursión</option><option>Reunión</option><option>Festivo</option><option>Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Fecha</label>
                <input type="date" required value={newEvento.fecha} onChange={e => setNewEvento({...newEvento, fecha: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Descripción (opcional)</label>
                <input type="text" value={newEvento.descripcion} onChange={e => setNewEvento({...newEvento, descripcion: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="Ej: Traer estuche y regla" />
              </div>
            </div>
            <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
              {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</> : editEventoId ? 'Actualizar Evento' : 'Guardar Evento'}
            </button>
          </form>
        )}

        {isLoading ? (
          <SkeletonCalendario />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 transition-colors">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white capitalize">{monthName}</h3>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"><ChevronLeft className="w-6 h-6" /></button>
                <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"><ChevronRight className="w-6 h-6" /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-inner font-bold text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <div key={d} className="bg-slate-50 dark:bg-slate-950 py-3">{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 border-x border-b border-slate-200 dark:border-slate-800 rounded-b-xl overflow-hidden">
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-slate-50/50 dark:bg-slate-950/50 min-h-[100px] sm:min-h-[140px]"></div>
              ))}
              {Array.from({ length: totalDays }).map((_, i) => {
                const d = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const dayEvents = eventos.filter(e => e.fecha === dateStr);
                const isToday = new Date().toISOString().split('T')[0] === dateStr;

                return (
                  <div key={d} className={`bg-white dark:bg-slate-900 min-h-[100px] sm:min-h-[140px] p-2 sm:p-3 relative transition-colors ${isToday ? 'ring-2 ring-indigo-500 ring-inset' : ''}`}>
                    <span className={`text-sm font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>{d}</span>
                    <div className="mt-2 space-y-1">
                      {dayEvents.map(ev => (
                        <div key={ev.$id} onClick={() => setViewEvento(ev)} className={`text-[10px] sm:text-xs p-1.5 rounded-lg font-bold cursor-pointer ${getTipoStyles(ev.tipo)} hover:scale-105 transition-all truncate shadow-sm relative group`}>
                          {ev.titulo}
                          {isAdmin && (
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteEvento(ev.$id); }} className="absolute -top-1 -right-1 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 rounded-full shadow-md p-1 opacity-0 group-hover:opacity-100 transition-opacity border border-slate-200 dark:border-slate-700"><X className="w-3 h-3" /></button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-4">
               {['Examen', 'Excursión', 'Reunión', 'Festivo', 'Otro'].map(type => (
                 <div key={type} className="flex items-center gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg transition-colors">
                   <div className={`w-3 h-3 rounded-full ${getTipoStyles(type)} shadow-sm`}></div>
                   <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">{type}</span>
                 </div>
               ))}
            </div>

            {/* EVENT VIEWER MODAL */}
            {viewEvento && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 border border-slate-100 dark:border-slate-800">
                  <button onClick={() => setViewEvento(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-full p-1"><X className="w-6 h-6" /></button>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${getTipoStyles(viewEvento.tipo)}`}>
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{viewEvento.fecha.split('-').reverse().join('/')}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getTipoStyles(viewEvento.tipo)} opacity-90`}>{viewEvento.tipo}</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-4 leading-tight">{viewEvento.titulo}</h2>
                  {viewEvento.descripcion ? (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{viewEvento.descripcion}</p>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic font-medium">No hay detalles adicionales para este evento.</p>
                  )}
                  {isAdmin && (
                    <button onClick={() => { setViewEvento(null); triggerEditEvento(viewEvento); }} className="mt-6 w-full py-3 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center justify-center gap-2">
                      <Edit className="w-4 h-4" /> Editar Evento
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    );
  };


  // --- FAMILIAS ---
  const triggerEditFamilia = (com) => {
    setNewComunicado({ tipo: com.tipo, titulo: com.titulo, descripcion: com.descripcion });
    setEditFamiliaId(com.$id); setShowFamiliasForm(true);
  };
  const handleDeleteFamilia = async (id) => {
    setConfirmDialog({
      message: '¿Estás seguro de que quieres eliminar este comunicado a las familias?',
      onConfirm: async () => {
        try {
          const doc = comunicados.find(c => c.$id === id);
          if (doc && doc.archivoUrl) await deleteFileFromUrl(doc.archivoUrl);
          await databases.deleteDocument(APPWRITE_DB, COL_FAMILIAS, id);
          setComunicados(prev => prev.filter(c => c.$id !== id));
          addToast('Comunicado eliminado', 'success');
        } catch (e) { addToast('Error al eliminar el comunicado: ' + e.message, 'error'); }
        setConfirmDialog(null);
      }
    });
  };
  const handleSaveFamilia = async (e) => {
    e.preventDefault();
    if (!newComunicado.titulo) return;
    setIsSaving(true);
    let fileUrl = null, fileName = null;
    try {
      if (archivoFamilia) {
        const uf = await storage.createFile(APPWRITE_BUCKET, ID.unique(), archivoFamilia);
        fileUrl = `https://cloud.appwrite.io/v1/storage/buckets/${APPWRITE_BUCKET}/files/${uf.$id}/view?project=${APPWRITE_PROJECT}`;
        fileName = archivoFamilia.name;
      }
      
      const data = {
        tipo: newComunicado.tipo,
        titulo: newComunicado.titulo,
        descripcion: newComunicado.descripcion,
        archivoUrl: fileUrl,
        archivoNombre: fileName
      };
      
      console.log('Enviando a Familias:', data);

      if (editFamiliaId) {
        const upd = await databases.updateDocument(APPWRITE_DB, COL_FAMILIAS, editFamiliaId, data);
        setComunicados(prev => prev.map(c => c.$id === editFamiliaId ? upd : c));
      } else {
        const cre = await databases.createDocument(APPWRITE_DB, COL_FAMILIAS, ID.unique(), data);
        setComunicados(prev => [cre, ...prev]);
      }
      cerrarFormularioFamilia();
      addToast('Comunicado guardado correctamente');
    } catch (e) { addToast('Error al guardar comunicado: ' + e.message, 'error'); }
    finally { setIsSaving(false); }
  };
  const cerrarFormularioFamilia = () => {
    setShowFamiliasForm(false); setEditFamiliaId(null);
    setNewComunicado({ tipo: 'Importante', titulo: '', descripcion: '' }); setArchivoFamilia(null);
  };

  // --- GALERÍA ---
  const triggerEditFoto = (foto) => {
    setNewFoto({ titulo: foto.titulo });
    setEditFotoId(foto.$id); setShowGaleriaForm(true);
  };
  const handleDeleteFoto = async (id) => {
    setConfirmDialog({
      message: '¿Estás seguro de que quieres eliminar esta foto de la galería?',
      onConfirm: async () => {
        try {
          const doc = fotos.find(f => f.$id === id);
          if (doc && doc.imagenUrl) await deleteFileFromUrl(doc.imagenUrl);
          await databases.deleteDocument(APPWRITE_DB, COL_GALERIA, id);
          setFotos(prev => prev.filter(f => f.$id !== id));
          addToast('Foto eliminada', 'success');
        } catch (e) { addToast('Error al eliminar la foto: ' + e.message, 'error'); }
        setConfirmDialog(null);
      }
    });
  };
  const handleSaveFoto = async (e) => {
    e.preventDefault();
    if (!newFoto.titulo) return;
    setIsSaving(true);
    let fileUrl = null;
    try {
      if (archivoImagen) {
        const uf = await storage.createFile(APPWRITE_BUCKET, ID.unique(), archivoImagen);
        fileUrl = `https://cloud.appwrite.io/v1/storage/buckets/${APPWRITE_BUCKET}/files/${uf.$id}/view?project=${APPWRITE_PROJECT}`;
      }
      
      const data = { 
        titulo: newFoto.titulo, 
        imagenUrl: fileUrl
      };
      
      console.log('Enviando a Galeria:', data);
      
      if (editFotoId) {
        const upd = await databases.updateDocument(APPWRITE_DB, COL_GALERIA, editFotoId, data);
        setFotos(prev => prev.map(f => f.$id === editFotoId ? upd : f));
      } else {
        const cre = await databases.createDocument(APPWRITE_DB, COL_GALERIA, ID.unique(), data);
        setFotos(prev => [cre, ...prev]);
      }
      cerrarFormularioFoto();
      addToast('Foto subida correctamente');
    } catch (e) { addToast('Error al subir foto: ' + e.message, 'error'); }
    finally { setIsSaving(false); }
  };
  const cerrarFormularioFoto = () => {
    setShowGaleriaForm(false); setEditFotoId(null);
    setNewFoto({ titulo: '' }); setArchivoImagen(null);
  };

  // --- TRAYECTORIA ---
  const triggerEditTrayectoria = (item) => {
    setNewTrayectoria({ categoria: item.categoria, titulo: item.titulo, subtitulo: item.subtitulo, fecha: item.fecha, descripcion: item.descripcion });
    setEditTrayectoriaId(item.$id); setShowTrayectoriaForm(true);
  };
  const handleDeleteTrayectoria = async (id) => {
    setConfirmDialog({
      message: '¿Estás seguro de que quieres eliminar este hito de la trayectoria?',
      onConfirm: async () => {
        try {
          await databases.deleteDocument(APPWRITE_DB, COL_TRAYECTORIA, id);
          setTrayectoria(prev => prev.filter(t => t.$id !== id));
          addToast('Elemento eliminado', 'success');
        } catch (e) { addToast('Error al eliminar el elemento: ' + e.message, 'error'); }
        setConfirmDialog(null);
      }
    });
  };
  const handleSaveTrayectoria = async (e) => {
    e.preventDefault();
    if (!newTrayectoria.titulo) return;
    setIsSaving(true);
    try {
      const data = { 
        categoria: newTrayectoria.categoria,
        fecha: newTrayectoria.fecha,
        titulo: newTrayectoria.titulo,
        subtitulo: newTrayectoria.subtitulo,
        descripcion: newTrayectoria.descripcion
      };
      console.log('Enviando a Trayectoria:', data);

      if (editTrayectoriaId) {
        const upd = await databases.updateDocument(APPWRITE_DB, COL_TRAYECTORIA, editTrayectoriaId, data);
        setTrayectoria(prev => prev.map(t => t.$id === editTrayectoriaId ? upd : t));
      } else {
        const cre = await databases.createDocument(APPWRITE_DB, COL_TRAYECTORIA, ID.unique(), data);
        setTrayectoria(prev => [cre, ...prev]);
      }
      cerrarFormularioTrayectoria();
      addToast('Trayectoria guardada correctamente');
    } catch (e) { addToast('Error al guardar trayectoria: ' + e.message, 'error'); }
    finally { setIsSaving(false); }
  };
  const cerrarFormularioTrayectoria = () => {
    setShowTrayectoriaForm(false); setEditTrayectoriaId(null);
    setNewTrayectoria({ categoria: 'Experiencia', titulo: '', subtitulo: '', fecha: '', descripcion: '' });
  };

  // --- HELPERS VISUALES ---
  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'Juego simbólico':   return <Users className="w-6 h-6 text-indigo-500" />;
      case 'Lecto-escritura':   return <Pencil className="w-6 h-6 text-pink-500" />;
      case 'Lógico-matemática': return <Calculator className="w-6 h-6 text-blue-500" />;
      case 'Mentalandia':       return <Puzzle className="w-6 h-6 text-amber-500" />;
      case 'Sabiómetro':        return <LineChart className="w-6 h-6 text-emerald-500" />;
      default:                  return <Shapes className="w-6 h-6 text-slate-500" />;
    }
  };
  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'Juego simbólico':   return 'bg-indigo-100 border-indigo-200';
      case 'Lecto-escritura':   return 'bg-pink-100 border-pink-200';
      case 'Lógico-matemática': return 'bg-blue-100 border-blue-200';
      case 'Mentalandia':       return 'bg-amber-100 border-amber-200';
      case 'Sabiómetro':        return 'bg-emerald-100 border-emerald-200';
      default:                  return 'bg-slate-100 border-slate-200';
    }
  };

  // --- FILTROS ---
  const filteredMateriales = materiales.filter(m => {
    const s = m.titulo.toLowerCase().includes(searchTermMaterial.toLowerCase()) || m.descripcion.toLowerCase().includes(searchTermMaterial.toLowerCase());
    const c = filterCategoriaMaterial === 'Todas' || m.categoria === filterCategoriaMaterial;
    return s && c;
  });
  const filteredFamilias = comunicados.filter(c => {
    const s = c.titulo.toLowerCase().includes(searchTermFamilia.toLowerCase()) || c.descripcion.toLowerCase().includes(searchTermFamilia.toLowerCase());
    const t = filterTipoFamilia === 'Todos' || c.tipo === filterTipoFamilia;
    return s && t;
  });

  const NavButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-300 font-bold group transform hover:-translate-y-1
        ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md'}`}
    >
      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" /><span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300 pb-20 relative">
      <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 -z-20"></div>
      <div className="fixed inset-0 bg-grid-slate-200 dark:bg-grid-slate-800 -z-10 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-8 relative animate-in fade-in zoom-in-95 border dark:border-slate-800">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-6 h-6" /></button>
            <div className="flex justify-center mb-6"><div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full"><Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /></div></div>
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-6">Acceso Docente</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center font-medium border border-red-100 dark:border-red-900/30">{loginError}</div>}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input type="email" required value={loginCreds.email} onChange={e => setLoginCreds({...loginCreds, email: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
                <input type="password" required value={loginCreds.password} onChange={e => setLoginCreds({...loginCreds, password: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors mt-2">Iniciar Sesión</button>
            </form>
          </div>
        </div>
      )}

      {/* BRAND HEADER (TOP BAR) */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActiveTab('inicio')}>
             <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-indigo-100 dark:shadow-none shadow-xl group-hover:scale-110 transition-transform"><Star className="w-8 h-8 text-white" /></div>
             <div>
               <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1 text-center md:text-left">Mi Aula Dinámica</h1>
               <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
                 1º Ciclo Primaria <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span> CEIP La Arboleda
               </p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all border border-transparent flex items-center gap-2 text-sm font-bold group" title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}>
                {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
             </button>
             <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
             {isAdmin ? (
                <button onClick={handleLogout} className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-sm">
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

      {/* STICKY NAV BAR */}
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-x-auto scrollbar-hide transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between md:justify-center h-16 sm:h-20">
            <div className="hidden md:flex items-center gap-1 w-full justify-between">
               <NavButton id="inicio" label="Inicio" icon={Home} />
               <NavButton id="trayectoria" label="Trayectoria" icon={Briefcase} />
               <NavButton id="metodologia" label="Método" icon={BookOpen} />
               <NavButton id="materiales" label="Materiales" icon={Shapes} />
               <NavButton id="evaluacion" label="Evaluación" icon={LineChart} />
               <NavButton id="calendario" label="Calendario" icon={Calendar} />
               <NavButton id="familias" label="Familias" icon={MessageCircle} />
               <NavButton id="galeria" label="Galería" icon={Camera} />
            </div>
            
            {/* Mobile View Toggle */}
            <div className="md:hidden flex items-center justify-between w-full py-4">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><Star className="w-5 h-5 text-white" /></div>
                 <span className="font-bold text-slate-800">Navegación</span>
               </div>
               <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
               </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top-4">
            <NavButton id="inicio" label="Inicio" icon={Home} />
            <NavButton id="trayectoria" label="Trayectoria" icon={Briefcase} />
            <NavButton id="metodologia" label="Método" icon={BookOpen} />
            <NavButton id="materiales" label="Materiales" icon={Shapes} />
            <NavButton id="evaluacion" label="Evaluación" icon={LineChart} />
            <NavButton id="calendario" label="Calendario" icon={Calendar} />
            <NavButton id="familias" label="Familias" icon={MessageCircle} />
            <NavButton id="galeria" label="Galería" icon={Camera} />
          </div>
        )}
      </nav>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* INICIO */}
        {activeTab === 'inicio' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <Reveal>
              <div className="relative mb-20 md:mb-12">
                <div className="blob blob-indigo top-0 -left-10 w-72 h-72"></div>
                <div className="blob blob-emerald top-40 -right-10 w-96 h-96"></div>
                <div className="bg-indigo-900 dark:bg-indigo-950 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/20 relative z-10 transition-colors border border-indigo-500/10 backdrop-blur-sm">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-300 via-transparent to-transparent"></div>
              <div className="px-8 py-10 sm:px-16 sm:py-16 relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6">
                  {isAdmin ? (
                    <span className="inline-block py-1 px-3 rounded-full bg-emerald-500 text-white text-sm font-semibold tracking-wide border border-emerald-400 shadow-sm flex items-center w-fit gap-1">
                      <Unlock className="w-4 h-4"/> Modo Administrador Activo
                    </span>
                  ) : (
                    <span className="inline-block py-1 px-3 rounded-full bg-slate-700 dark:bg-slate-800 text-slate-200 text-sm font-semibold tracking-wide border border-slate-600 shadow-sm flex items-center w-fit gap-1">
                      <Users className="w-4 h-4"/> Vista Pública
                    </span>
                  )}
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">Aprender a tu propio ritmo a través de <span className="text-amber-400">Estaciones</span></h2>
                  <p className="text-lg text-indigo-100 max-w-2xl leading-relaxed text-justify">Bienvenidos al cuaderno de bitácora de mi aula. Un espacio donde comparto cómo transformamos el aprendizaje para que ningún niño se quede atrás y cada uno encuentre su camino al éxito.</p>
                  <button onClick={() => setActiveTab('metodologia')} className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold py-3 px-6 rounded-xl transition-colors shadow-lg flex items-center gap-2">
                    Conoce el proyecto <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              </div>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-20">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-start gap-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/30">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"><Users className="w-6 h-6" /></div>
                <div><h3 className="font-bold text-slate-800 dark:text-white text-lg">Inclusión Real</h3><p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Materiales multinivel adaptados al Diseño Universal para el Aprendizaje (DUA).</p></div>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-start gap-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/30">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl"><Heart className="w-6 h-6" /></div>
                <div><h3 className="font-bold text-slate-800 dark:text-white text-lg">Autonomía</h3><p className="text-slate-500 dark:text-slate-400 text-sm mt-1">El alumnado es protagonista, fomentando la responsabilidad y la ayuda entre iguales.</p></div>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-start gap-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-500/30">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl"><Puzzle className="w-6 h-6" /></div>
                <div><h3 className="font-bold text-slate-800 dark:text-white text-lg">Manipulativo</h3><p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Aprender tocando y experimentando, respetando la etapa evolutiva del primer ciclo.</p></div>
              </div>
            </div>
          </Reveal>
          </div>
        )}

        {/* CALENDARIO */}
        {activeTab === 'calendario' && renderCalendario()}


        {/* TRAYECTORIA */}
        {activeTab === 'trayectoria' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Trayectoria y Equipo</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2">Mi experiencia, formación y los docentes que hacen posible este proyecto.</p>
              </div>
              {isAdmin && (
                <button onClick={() => setShowTrayectoriaForm(true)} className="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-md shrink-0">
                  <Plus className="w-5 h-5" /> Añadir Hito / Miembro
                </button>
              )}
            </div>
            {isAdmin && showTrayectoriaForm && (
              <form onSubmit={handleSaveTrayectoria} className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 mb-8 relative animate-in slide-in-from-top-4">
                <button type="button" onClick={cerrarFormularioTrayectoria} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                <h3 className="text-xl font-bold text-slate-800 mb-4">{editTrayectoriaId ? 'Editar Elemento' : 'Añadir a Trayectoria / Equipo'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Categoría</label>
                    <select value={newTrayectoria.categoria} onChange={e => setNewTrayectoria({...newTrayectoria, categoria: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500">
                      <option>Experiencia</option><option>Formación</option><option>Reconocimientos</option><option>Equipo Docente</option><option>Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Periodo / Fecha / Curso</label>
                    <input type="text" required value={newTrayectoria.fecha} onChange={e => setNewTrayectoria({...newTrayectoria, fecha: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500" placeholder="Ej: 2020 - Actualidad" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Título / Nombre</label>
                    <input type="text" required value={newTrayectoria.titulo} onChange={e => setNewTrayectoria({...newTrayectoria, titulo: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Institución / Centro / Rol</label>
                    <input type="text" required value={newTrayectoria.subtitulo} onChange={e => setNewTrayectoria({...newTrayectoria, subtitulo: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción</label>
                    <textarea value={newTrayectoria.descripcion} onChange={e => setNewTrayectoria({...newTrayectoria, descripcion: e.target.value})} rows="3" className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"></textarea>
                  </div>
                </div>
                <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</> : editTrayectoriaId ? 'Actualizar Elemento' : 'Guardar Elemento'}
                </button>
              </form>
            )}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              {isLoading ? (
                <div className="space-y-4">
                  <SkeletonTrayectoria />
                  <SkeletonTrayectoria />
                  <SkeletonTrayectoria />
                </div>
              ) : trayectoria.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 italic text-center py-8">Aún no hay hitos ni equipo añadidos.</p>
              ) : (
                <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 pl-6 space-y-10 py-2">
                  {trayectoria.map(item => {
                    let Icono = Briefcase, colorConfig = 'text-indigo-600 bg-indigo-100 ring-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30 dark:ring-indigo-950';
                    if (item.categoria === 'Formación') { Icono = GraduationCap; colorConfig = 'text-emerald-600 bg-emerald-100 ring-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30 dark:ring-emerald-950'; }
                    else if (item.categoria === 'Reconocimientos') { Icono = Award; colorConfig = 'text-amber-600 bg-amber-100 ring-amber-50 dark:text-amber-400 dark:bg-amber-900/30 dark:ring-amber-950'; }
                    else if (item.categoria === 'Equipo Docente') { Icono = Users; colorConfig = 'text-pink-600 bg-pink-100 ring-pink-50 dark:text-pink-400 dark:bg-pink-900/30 dark:ring-pink-950'; }
                    else if (item.categoria === 'Otro') { Icono = Star; colorConfig = 'text-blue-600 bg-blue-100 ring-blue-50 dark:text-blue-400 dark:bg-blue-900/30 dark:ring-blue-950'; }
                    const [textColor, bgColor, ringColor] = colorConfig.split(' ');
                    return (
                      <Reveal key={item.$id} delay={0.1}>
                        <div className="relative group">
                          <div className={`absolute -left-[2.1rem] top-1 w-8 h-8 rounded-full ring-4 ring-white dark:ring-slate-900 flex items-center justify-center shadow-sm ${bgColor} ${ringColor} transition-colors`}>
                            <Icono className={`w-4 h-4 ${textColor}`} />
                          </div>
                          {isAdmin && (
                            <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-800/90 p-1 rounded-lg">
                              <button onClick={() => triggerEditTrayectoria(item)} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteTrayectoria(item.$id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          )}
                          <div className="pr-16">
                            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.fecha}</span>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-1">{item.titulo}</h3>
                            <h4 className="text-md font-semibold text-indigo-600 dark:text-indigo-400 mb-2">{item.subtitulo}</h4>
                            {item.descripcion && <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{item.descripcion}</p>}
                          </div>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* METODOLOGÍA */}
        {activeTab === 'metodologia' && (
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
        )}


        {/* MATERIALES */}
        {activeTab === 'materiales' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <Reveal>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Banco de Materiales</h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">Recursos organizados por categorías.</p>
                </div>
                {isAdmin && (
                  <button onClick={() => setShowMaterialForm(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md">
                    <Plus className="w-5 h-5" /> Subir Recurso
                  </button>
                )}
              </div>
            </Reveal>
            {!showMaterialForm && materiales.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col lg:flex-row gap-4 transition-colors">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input type="text" placeholder="Buscar materiales..." value={searchTermMaterial} onChange={e => setSearchTermMaterial(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                  {['Todas','Juego simbólico','Lecto-escritura','Lógico-matemática','Mentalandia','Sabiómetro'].map(cat => (
                    <button key={cat} onClick={() => setFilterCategoriaMaterial(cat)} className={`px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-semibold transition-all ${filterCategoriaMaterial === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{cat}</button>
                  ))}
                </div>
              </div>
            )}
            {isAdmin && showMaterialForm && (
              <form onSubmit={handleSaveMaterial} className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 mb-8 relative animate-in slide-in-from-top-4">
                <button type="button" onClick={cerrarFormularioMaterial} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                <h3 className="text-xl font-bold text-slate-800 mb-4">{editMaterialId ? 'Editar Material' : 'Añadir Material'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Título</label>
                    <input type="text" required value={newMaterial.titulo} onChange={e => setNewMaterial({...newMaterial, titulo: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Categoría</label>
                    <select value={newMaterial.categoria} onChange={e => setNewMaterial({...newMaterial, categoria: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500">
                      <option>Juego simbólico</option><option>Lecto-escritura</option><option>Lógico-matemática</option><option>Mentalandia</option><option>Sabiómetro</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción de uso</label>
                    <textarea required value={newMaterial.descripcion} onChange={e => setNewMaterial({...newMaterial, descripcion: e.target.value})} rows="3" className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Adjuntar Material (PDF)</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-300 cursor-pointer hover:bg-slate-200">
                        <Upload className="w-4 h-4" /><span className="text-sm font-medium">{archivoPdf ? 'Cambiar archivo' : 'Seleccionar PDF'}</span>
                        <input type="file" accept=".pdf" className="hidden" onChange={e => setArchivoPdf(e.target.files[0])} />
                      </label>
                      {archivoPdf && <span className="text-sm text-emerald-600 font-medium truncate max-w-[200px]">{archivoPdf.name}</span>}
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</> : editMaterialId ? 'Actualizar Material' : 'Guardar Material'}
                </button>
              </form>
            )}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonMaterial />
                <SkeletonMaterial />
                <SkeletonMaterial />
                <SkeletonMaterial />
              </div>
            ) : materiales.length === 0 && !showMaterialForm ? (
              <div className="text-center py-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                <Shapes className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500">Aún no hay materiales subidos.</p>
              </div>
            ) : filteredMateriales.length === 0 && !showMaterialForm ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No se encontraron materiales.</p>
                <button onClick={() => { setSearchTermMaterial(''); setFilterCategoriaMaterial('Todas'); }} className="mt-4 text-indigo-600 font-bold text-sm hover:underline">Limpiar filtros</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMateriales.slice(0, visibleMateriales).map((mat, idx) => (
                  <Reveal key={mat.$id} delay={0.1 * (idx % 6)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col sm:flex-row transition-all hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 hover:-translate-y-1 relative group h-full">
                      {isAdmin && (
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-800/90 p-1 rounded-lg shadow-sm">
                          <button onClick={() => triggerEditMaterial(mat)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteMaterial(mat.$id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}
                      <div className={`sm:w-32 flex-shrink-0 flex items-center justify-center p-6 ${getCategoryColor(mat.categoria)} dark:opacity-90 border-b sm:border-b-0 sm:border-r dark:border-slate-800 transition-colors`}>{getCategoryIcon(mat.categoria)}</div>
                      <div className="p-6 flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start gap-4 mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{mat.categoria}</span>
                          {mat.$createdAt && <span className="text-xs font-bold text-slate-400 dark:text-slate-500 shrink-0">{new Date(mat.$createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 pr-12 lg:pr-0">{mat.titulo}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-3">{mat.descripcion}</p>
                        {mat.archivoUrl && (
                          <a href={mat.archivoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 w-fit bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1.5 rounded-lg transition-colors mt-auto">
                            <FileText className="w-4 h-4" /> Ver {mat.archivoNombre || 'PDF'}
                          </a>
                        )}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
            {visibleMateriales < filteredMateriales.length && !showMaterialForm && (
              <div className="flex justify-center mt-8">
                <button onClick={() => setVisibleMateriales(prev => prev + 6)} className="bg-white border border-slate-200 text-indigo-600 font-bold py-3 px-8 rounded-xl hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 flex items-center gap-2 group">
                  Cargar más recursos <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* EVALUACIÓN */}
        {activeTab === 'evaluacion' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <Reveal>
              <div className="flex justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Evaluación y Evidencias</h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">Cómo medimos el progreso respetando los ritmos de cada alumno.</p>
                </div>
                {isAdmin && (
                  <button onClick={() => setShowEvaluacionForm(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md">
                    <Plus className="w-5 h-5" /> Nueva Evidencia
                  </button>
                )}
              </div>
            </Reveal>
            {isAdmin && showEvaluacionForm && (
              <form onSubmit={handleSaveEvaluacion} className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 relative animate-in slide-in-from-top-4">
                <button type="button" onClick={cerrarFormularioEvaluacion} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                <h3 className="text-xl font-bold text-slate-800 mb-4">{editEvaluacionId ? 'Editar Documento' : 'Subir Documento de Evaluación'}</h3>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Título de la evidencia</label>
                    <input type="text" required value={newEvaluacion.titulo} onChange={e => setNewEvaluacion({...newEvaluacion, titulo: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción</label>
                    <textarea value={newEvaluacion.descripcion} onChange={e => setNewEvaluacion({...newEvaluacion, descripcion: e.target.value})} rows="2" className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Adjuntar Rúbrica / Diana (PDF)</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-300 cursor-pointer hover:bg-slate-200">
                        <Upload className="w-4 h-4" /><span className="text-sm font-medium">{archivoEvidencia ? 'Cambiar archivo' : 'Seleccionar PDF'}</span>
                        <input type="file" accept=".pdf" className="hidden" onChange={e => setArchivoEvidencia(e.target.files[0])} />
                      </label>
                      {archivoEvidencia && <span className="text-sm text-emerald-600 font-medium truncate max-w-[200px]">{archivoEvidencia.name}</span>}
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</> : editEvaluacionId ? 'Actualizar Evidencia' : 'Guardar Evidencia'}
                </button>
              </form>
            )}
            {!showEvaluacionForm && evaluaciones.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 mt-2">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden group transition-colors">
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><LineChart className="w-32 h-32 text-indigo-900 dark:text-indigo-100" /></div>
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-xl text-indigo-600 dark:text-indigo-400 relative z-10"><LineChart className="w-8 h-8"/></div>
                  <div className="relative z-10"><p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Rúbricas</p><p className="text-3xl font-extrabold text-slate-800 dark:text-white">{evaluaciones.length}</p></div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden group transition-colors">
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><FileText className="w-32 h-32 text-emerald-900 dark:text-emerald-100" /></div>
                  <div className="bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-xl text-emerald-600 dark:text-emerald-400 relative z-10"><FileText className="w-8 h-8"/></div>
                  <div className="relative z-10"><p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Documentos</p><p className="text-3xl font-extrabold text-slate-800 dark:text-white">{evaluaciones.filter(e => e.archivoUrl).length}</p></div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden group transition-colors">
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><Award className="w-32 h-32 text-amber-900 dark:text-amber-100" /></div>
                  <div className="bg-amber-100 dark:bg-amber-900/50 p-4 rounded-xl text-amber-600 dark:text-amber-400 relative z-10"><Award className="w-8 h-8"/></div>
                  <div className="relative z-10"><p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Última Alta</p><p className="text-lg font-bold text-slate-800 dark:text-white">{evaluaciones[0]?.$createdAt ? new Date(evaluaciones[0].$createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric'}) : '-'}</p></div>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-800 border-b pb-2">Banco de Rúbricas y Registros</h3>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SkeletonEvaluacion />
                  <SkeletonEvaluacion />
                </div>
              ) : evaluaciones.length === 0 ? (
                <p className="text-slate-500 italic">No hay evidencias publicadas aún.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {evaluaciones.map((ev, idx) => (
                    <Reveal key={ev.$id} delay={0.1 * (idx % 6)}>
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col relative group hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/30 hover:-translate-y-1 transition-all h-full">
                      {isAdmin && (
                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => triggerEditEvaluacion(ev)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteEvaluacion(ev.$id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}
                      <h4 className="font-bold text-slate-800 dark:text-white mb-1 pr-16">{ev.titulo}</h4>
                      {ev.descripcion && <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{ev.descripcion}</p>}
                      {ev.archivoUrl && (
                        <a href={ev.archivoUrl} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 px-3 py-2 rounded-lg w-fit transition-colors">
                          <FileText className="w-4 h-4" /> Abrir {ev.archivoNombre || 'Documento'}
                        </a>
                      )}
                    </div>
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}


        {/* FAMILIAS */}
        {activeTab === 'familias' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/50 w-12 h-12 rounded-full flex items-center justify-center transition-colors"><MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" /></div>
                  <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Rincón de las Familias</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">Espacio de comunicación y recursos para casa.</p>
              </div>
              {isAdmin && (
                <button onClick={() => setShowFamiliasForm(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md shrink-0">
                  <Plus className="w-5 h-5" /> Publicar Aviso
                </button>
              )}
            </div>
            {!showFamiliasForm && comunicados.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col lg:flex-row gap-4 transition-colors">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input type="text" placeholder="Buscar comunicados..." value={searchTermFamilia} onChange={e => setSearchTermFamilia(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                  {['Todos','Importante','Recurso','Consejo'].map(tipo => (
                    <button key={tipo} onClick={() => setFilterTipoFamilia(tipo)} className={`px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-semibold transition-all ${filterTipoFamilia === tipo ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{tipo}</button>
                  ))}
                </div>
              </div>
            )}
            {isAdmin && showFamiliasForm && (
              <form onSubmit={handleSaveFamilia} className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 mb-8 relative animate-in slide-in-from-top-4">
                <button type="button" onClick={cerrarFormularioFamilia} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                <h3 className="text-xl font-bold text-slate-800 mb-4">{editFamiliaId ? 'Editar Comunicado' : 'Nuevo Comunicado'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Título</label>
                    <input type="text" required value={newComunicado.titulo} onChange={e => setNewComunicado({...newComunicado, titulo: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de aviso</label>
                    <select value={newComunicado.tipo} onChange={e => setNewComunicado({...newComunicado, tipo: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 transition-colors">
                      <option>Importante</option><option>Recurso</option><option>Consejo</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Mensaje / Descripción</label>
                    <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500 transition-colors">
                      <ReactQuill 
                        theme="snow" 
                        value={newComunicado.descripcion} 
                        onChange={val => setNewComunicado({...newComunicado, descripcion: val})}
                        modules={quillModules}
                        placeholder="Escribe aquí el aviso para las familias..."
                        className="quill-editor"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Archivo adjunto (PDF)</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-300 cursor-pointer hover:bg-slate-200">
                        <Upload className="w-4 h-4" /><span className="text-sm font-medium">{archivoFamilia ? 'Cambiar archivo' : 'Seleccionar PDF'}</span>
                        <input type="file" accept=".pdf" className="hidden" onChange={e => setArchivoFamilia(e.target.files[0])} />
                      </label>
                      {archivoFamilia && <span className="text-sm text-blue-600 font-medium truncate max-w-[200px]">{archivoFamilia.name}</span>}
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</> : editFamiliaId ? 'Actualizar Aviso' : 'Publicar en el Tablón'}
                </button>
              </form>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <>
                  <SkeletonFamilia />
                  <SkeletonFamilia />
                  <SkeletonFamilia />
                </>
              ) : comunicados.length === 0 ? (
                <p className="text-slate-500 italic col-span-full">No hay comunicados publicados.</p>
              ) : filteredFamilias.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No se encontraron avisos.</p>
                  <button onClick={() => { setSearchTermFamilia(''); setFilterTipoFamilia('Todos'); }} className="mt-4 text-blue-600 font-bold text-sm hover:underline">Limpiar filtros</button>
                </div>
              ) : filteredFamilias.map(com => {
                let badgeColor = 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
                if (com.tipo === 'Importante') badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
                if (com.tipo === 'Recurso') badgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
                if (com.tipo === 'Consejo') badgeColor = 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300';
                return (
                  <Reveal key={com.$id} delay={0.1}>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col transition-all hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/30 hover:-translate-y-1 relative group">
                      {isAdmin && (
                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-800/90 p-1 rounded-lg">
                          <button onClick={() => triggerEditFamilia(com)} className="p-1 text-slate-400 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteFamilia(com.$id)} className="p-1 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-2">
                         <span className={`w-fit text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${badgeColor}`}>{com.tipo}</span>
                         {com.$createdAt && <span className="text-xs font-bold text-slate-400 mt-1">{new Date(com.$createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-1 mb-2 pr-12">{com.titulo}</h3>
                      <div className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: com.descripcion }}></div>
                      {com.archivoUrl && (
                        <a href={com.archivoUrl} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                          <FileText className="w-4 h-4"/> Abrir Adjunto
                        </a>
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        )}

        {/* GALERÍA */}
        {activeTab === 'galeria' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <Reveal>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Galería de Espacios</h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">Un vistazo a nuestro día a día en el aula.</p>
                </div>
                {isAdmin && (
                  <button onClick={() => setShowGaleriaForm(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md shrink-0">
                    <Camera className="w-5 h-5" /> Subir Foto
                  </button>
                )}
              </div>
            </Reveal>
            {isAdmin && showGaleriaForm && (
              <form onSubmit={handleSaveFoto} className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 mb-8 relative animate-in slide-in-from-top-4">
                <button type="button" onClick={cerrarFormularioFoto} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                <h3 className="text-xl font-bold text-slate-800 mb-4">{editFotoId ? 'Editar Foto' : 'Añadir Foto a la Galería'}</h3>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Pie de foto</label>
                    <input type="text" required value={newFoto.titulo} onChange={e => setNewFoto({...newFoto, titulo: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Imagen (JPG, PNG)</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-300 cursor-pointer hover:bg-slate-200">
                        <Upload className="w-4 h-4" /><span className="text-sm font-medium">{archivoImagen ? 'Cambiar imagen' : 'Seleccionar archivo'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => setArchivoImagen(e.target.files[0])} />
                      </label>
                      {archivoImagen && <span className="text-sm text-emerald-600 font-medium truncate max-w-[200px]">{archivoImagen.name}</span>}
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Subiendo...</> : editFotoId ? 'Actualizar Foto' : 'Subir a Galería'}
                </button>
              </form>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <>
                  <SkeletonGaleria />
                  <SkeletonGaleria />
                  <SkeletonGaleria />
                  <SkeletonGaleria />
                  <SkeletonGaleria />
                  <SkeletonGaleria />
                </>
              ) : fotos.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 italic col-span-full">No hay fotos publicadas en la galería.</p>
              ) : fotos.map((foto, index) => (
                <Reveal key={foto.$id} delay={0.1 * (index % 6)}>
                  <div onClick={() => setLightboxIndex(index)} className="group relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 aspect-square bg-slate-100 dark:bg-slate-900 cursor-pointer transition-all hover:shadow-xl hover:shadow-indigo-500/20 hover:border-indigo-500/40 hover:-translate-y-1 h-full w-full">
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30 bg-white/80 p-1 rounded-lg backdrop-blur-sm">
                        <button onClick={e => { e.stopPropagation(); triggerEditFoto(foto); }} className="p-1.5 text-slate-700 hover:text-indigo-600 transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={e => { e.stopPropagation(); handleDeleteFoto(foto.$id); }} className="p-1.5 text-slate-700 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                    {foto.imagenUrl ? (
                      <img src={getOptimizedUrl(foto.imagenUrl, 600, 400)} alt={foto.titulo} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-sm text-center p-4 gap-2">
                        <Camera className="w-8 h-8 opacity-40" /><span className="italic">{foto.titulo}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                      <div className="bg-white/90 p-3 rounded-full transform scale-50 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                        <Maximize2 className="w-6 h-6 text-slate-800" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6 z-20 pointer-events-none">
                      <span className="text-white font-medium pr-8">{foto.titulo}</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-200/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 mt-12 py-8 relative z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 text-center">
          <p>&copy; {new Date().getFullYear()} Web creada por Diego Alberto Moya Puerta. Todos los derechos reservados.</p>
          <p className="font-bold text-slate-700 dark:text-slate-300 text-base">CEIP La Arboleda (Murcia)</p>
        </div>
      </footer>

      {/* CONFIRM MODAL */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl max-w-sm w-full animate-in zoom-in-95 border border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Confirmar acción</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">{confirmDialog.message}</p>
              <div className="flex justify-end gap-3">
                 <button onClick={() => setConfirmDialog(null)} className="px-5 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-bold transition-colors">Cancelar</button>
                 <button onClick={confirmDialog.onConfirm} className="px-5 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-md">Eliminar</button>
              </div>
           </div>
        </div>
      )}

      {/* TOASTS */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`p-4 rounded-xl shadow-lg text-white font-medium animate-in slide-in-from-bottom-5 pointer-events-auto flex items-center gap-2 max-w-sm ${t.type === 'error' ? 'bg-red-500' : 'bg-slate-900 dark:bg-indigo-600'}`}>
            <span className="leading-snug">{t.message}</span>
          </div>
        ))}
      </div>

      {/* LIGHTBOX */}
      {lightboxIndex !== null && fotos[lightboxIndex] && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-200">
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 sm:top-8 sm:right-8 text-slate-400 hover:text-white transition-colors p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full z-50"><X className="w-6 h-6 sm:w-8 sm:h-8" /></button>
          <button onClick={e => { e.stopPropagation(); setLightboxIndex(prev => (prev - 1 + fotos.length) % fotos.length); }} className="absolute left-2 sm:left-8 p-3 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full transition-all z-50"><ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" /></button>
          <div className="relative w-full max-w-5xl flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            {fotos[lightboxIndex].imagenUrl ? (
              <img src={getOptimizedUrl(fotos[lightboxIndex].imagenUrl, 1200, null, 90)} alt={fotos[lightboxIndex].titulo} className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" />
            ) : (
              <div className="w-full max-w-2xl aspect-video bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 italic shadow-2xl">
                {fotos[lightboxIndex]?.titulo}
              </div>
            )}
            <p className="text-white mt-6 text-lg sm:text-xl font-medium text-center px-12">{fotos[lightboxIndex].titulo}</p>
          </div>
          <button onClick={e => { e.stopPropagation(); setLightboxIndex(prev => (prev + 1) % fotos.length); }} className="absolute right-2 sm:right-8 p-3 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full transition-all z-50"><ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" /></button>
        </div>
      )}
    </div>
  );
}

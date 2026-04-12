import React, { createContext, useContext, useState, useEffect } from 'react';
import { databases, client, APPWRITE_DB, COL_MATERIALES, COL_EVALUACION, COL_FAMILIAS, COL_GALERIA, COL_TRAYECTORIA, COL_EVENTOS } from '../lib/appwrite';
import { Query } from 'appwrite';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { addToast } = useToast();
  const { isAdmin } = useAuth();
  
  const [materiales, setMateriales] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [comunicados, setComunicados] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [trayectoria, setTrayectoria] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Funciones centralizadas para actualizar estado tras agregar/eliminar, así no repetimos lógica
  const refreshMateriales    = (newList) => setMateriales(newList);
  const refreshEvaluaciones  = (newList) => setEvaluaciones(newList);
  const refreshComunicados   = (newList) => setComunicados(newList);
  const refreshFotos         = (newList) => setFotos(newList);
  const refreshTrayectoria   = (newList) => setTrayectoria(newList);
  const refreshEventos       = (newList) => setEventos(newList);

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
        if (e.message) addToast('Error listando documentos: ' + e.message, 'error');
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
      const collId = event.split('.')[3];
      const type = event.split('.').pop(); // create, update, delete

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
  }, [isAdmin]); 

  const value = {
    materiales, setMateriales: refreshMateriales,
    evaluaciones, setEvaluaciones: refreshEvaluaciones,
    comunicados, setComunicados: refreshComunicados,
    fotos, setFotos: refreshFotos,
    trayectoria, setTrayectoria: refreshTrayectoria,
    eventos, setEventos: refreshEventos,
    isLoading
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

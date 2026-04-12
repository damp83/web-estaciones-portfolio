import React, { useState } from 'react';
import { Reveal } from '../components/Reveal';
import { Plus, X, Loader2, LineChart, FileText, Award, Edit, Trash2, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { databases, storage, APPWRITE_DB, COL_EVALUACION, APPWRITE_BUCKET, APPWRITE_PROJECT, deleteFileFromUrl } from '../lib/appwrite';
import { ID } from 'appwrite';
import { SkeletonEvaluacion } from '../components/ui/Skeletons';

export default function Evaluacion() {
  const { isAdmin } = useAuth();
  const { evaluaciones, setEvaluaciones, isLoading } = useData();
  const { addToast, setConfirmDialog } = useToast();
  
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ titulo: '', descripcion: '' });
  const [archivoEvidencia, setArchivoEvidencia] = useState(null);

  const triggerEdit = (ev) => {
    setFormData({ titulo: ev.titulo, descripcion: ev.descripcion });
    setEditId(ev.$id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      message: '¿Estás seguro de que quieres eliminar esta evidencia?',
      onConfirm: async () => {
        try {
          const doc = evaluaciones.find(e => e.$id === id);
          if (doc && doc.archivoUrl) await deleteFileFromUrl(doc.archivoUrl);
          await databases.deleteDocument(APPWRITE_DB, COL_EVALUACION, id);
          setEvaluaciones(evaluaciones.filter(e => e.$id !== id));
          addToast('Evidencia eliminada', 'success');
        } catch (e) { addToast('Error al eliminar la evidencia: ' + e.message, 'error'); }
        setConfirmDialog(null);
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.titulo) return;
    setIsSaving(true);
    let fileUrl = null, fileName = null;
    try {
      if (archivoEvidencia) {
        const uf = await storage.createFile(APPWRITE_BUCKET, ID.unique(), archivoEvidencia);
        fileUrl = `https://cloud.appwrite.io/v1/storage/buckets/${APPWRITE_BUCKET}/files/${uf.$id}/view?project=${APPWRITE_PROJECT}`;
        fileName = archivoEvidencia.name;
      }
      
      const data = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        ...(fileUrl && { archivoUrl: fileUrl, archivoNombre: fileName })
      };
      
      if (editId) {
        const current = evaluaciones.find(e => e.$id === editId);
        if (!fileUrl && current) {
           data.archivoUrl = current.archivoUrl;
           data.archivoNombre = current.archivoNombre;
        }
        const upd = await databases.updateDocument(APPWRITE_DB, COL_EVALUACION, editId, data);
        setEvaluaciones(evaluaciones.map(ev => ev.$id === editId ? upd : ev));
      } else {
        const cre = await databases.createDocument(APPWRITE_DB, COL_EVALUACION, ID.unique(), data);
        setEvaluaciones([cre, ...evaluaciones]);
      }
      cerrarFormulario();
      addToast('Evidencia guardada correctamente');
    } catch (e) { addToast('Error al guardar evidencia: ' + e.message, 'error'); }
    finally { setIsSaving(false); }
  };

  const cerrarFormulario = () => {
    setShowForm(false); setEditId(null);
    setFormData({ titulo: '', descripcion: '' }); setArchivoEvidencia(null);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <Reveal>
        <div className="flex justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Evaluación y Evidencias</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">Cómo medimos el progreso respetando los ritmos de cada alumno.</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md">
              <Plus className="w-5 h-5" /> Nueva Evidencia
            </button>
          )}
        </div>
      </Reveal>

      {isAdmin && showForm && (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-indigo-100 dark:border-slate-800 relative animate-in slide-in-from-top-4">
          <button type="button" onClick={cerrarFormulario} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-slate-300"><X className="w-6 h-6" /></button>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{editId ? 'Editar Documento' : 'Subir Documento de Evaluación'}</h3>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Título de la evidencia</label>
              <input type="text" required value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
              <textarea value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} rows="2" className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Adjuntar Rúbrica / Diana (PDF)</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-200">
                  <Upload className="w-4 h-4" /><span className="text-sm font-medium">{archivoEvidencia ? 'Cambiar archivo' : 'Seleccionar PDF'}</span>
                  <input type="file" accept=".pdf" className="hidden" onChange={e => setArchivoEvidencia(e.target.files[0])} />
                </label>
                {archivoEvidencia && <span className="text-sm text-emerald-600 font-medium truncate max-w-[200px]">{archivoEvidencia.name}</span>}
              </div>
            </div>
          </div>
          <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</> : editId ? 'Actualizar Evidencia' : 'Guardar Evidencia'}
          </button>
        </form>
      )}

      {!showForm && evaluaciones.length > 0 && (
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
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Banco de Rúbricas y Registros</h3>
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
                    <button onClick={() => triggerEdit(ev)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(ev.$id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
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
  );
}

import React, { useState } from 'react';
import { Reveal } from '../components/Reveal';
import { Plus, X, Loader2, MessageCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { databases, APPWRITE_DB, COL_FAMILIAS } from '../lib/appwrite';
import { ID } from 'appwrite';
import { SkeletonFamilia } from '../components/ui/Skeletons';

export default function Familias() {
  const { isAdmin } = useAuth();
  const { comunicados, setComunicados, isLoading } = useData();
  const { addToast, setConfirmDialog } = useToast();
  
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ titulo: '', mensaje: '', esImportante: false });

  const triggerEdit = (com) => {
    setFormData({ titulo: com.titulo, mensaje: com.descripcion || '', esImportante: com.tipo === 'Importante' });
    setEditId(com.$id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      message: '¿Estás seguro de que quieres eliminar este comunicado?',
      onConfirm: async () => {
        try {
          await databases.deleteDocument(APPWRITE_DB, COL_FAMILIAS, id);
          setComunicados(comunicados.filter(c => c.$id !== id));
          addToast('Comunicado eliminado', 'success');
        } catch (e) { addToast('Error al eliminar el comunicado: ' + e.message, 'error'); }
        setConfirmDialog(null);
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.mensaje) return;
    setIsSaving(true);
    try {
      const data = {
        titulo: formData.titulo,
        descripcion: formData.mensaje,
        tipo: formData.esImportante ? 'Importante' : 'Consejo',
      };
      if (editId) {
        const upd = await databases.updateDocument(APPWRITE_DB, COL_FAMILIAS, editId, data);
        setComunicados(comunicados.map(c => c.$id === editId ? upd : c));
      } else {
        const cre = await databases.createDocument(APPWRITE_DB, COL_FAMILIAS, ID.unique(), data);
        setComunicados([cre, ...comunicados]);
      }
      cerrarFormulario();
      addToast('Comunicado guardado correctamente');
    } catch (e) { addToast('Error al guardar comunicado: ' + e.message, 'error'); }
    finally { setIsSaving(false); }
  };

  const cerrarFormulario = () => {
    setShowForm(false); setEditId(null);
    setFormData({ titulo: '', mensaje: '', esImportante: false });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Reveal>
        <div className="flex justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Comunicación Familias</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">Avisos y mensajes importantes para la colaboración familia-escuela.</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md">
              <Plus className="w-5 h-5" /> Nuevo Aviso
            </button>
          )}
        </div>
      </Reveal>

      {isAdmin && showForm && (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-indigo-100 dark:border-slate-800 relative animate-in slide-in-from-top-4 mb-8">
          <button type="button" onClick={cerrarFormulario} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-6 h-6" /></button>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{editId ? 'Editar Aviso' : 'Nuevo Aviso Importante'}</h3>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Título del Aviso</label>
              <input type="text" required value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Cuerpo del Mensaje</label>
              <textarea required value={formData.mensaje} onChange={e => setFormData({...formData, mensaje: e.target.value})} rows="4" className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"></textarea>
            </div>
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer w-fit">
              <input type="checkbox" checked={formData.esImportante} onChange={e => setFormData({...formData, esImportante: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
              Marcar como Muy Importante / Urgente
            </label>
          </div>
          <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Publicando...</> : editId ? 'Actualizar Aviso' : 'Publicar Aviso'}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonFamilia />
          <SkeletonFamilia />
        </div>
      ) : comunicados.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
          <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500">No hay avisos recientes para las familias.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comunicados.map((com, idx) => (
            <Reveal key={com.$id} delay={0.1 * (idx % 4)}>
              <div className={`p-6 rounded-2xl shadow-sm border flex flex-col relative group hover:-translate-y-1 transition-all h-full ${(com.tipo === 'Importante') ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:shadow-amber-500/10' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-indigo-500/5'}`}>
              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => triggerEdit(com)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(com.$id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
              <div className="flex items-start gap-3 mb-4 pr-16">
                {(com.tipo === 'Importante') ? <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" /> : <MessageCircle className="w-6 h-6 text-indigo-500 shrink-0" />}
                <div>
                  <h3 className={`font-bold text-lg ${(com.tipo === 'Importante') ? 'text-amber-900 dark:text-amber-400' : 'text-slate-800 dark:text-white'}`}>{com.titulo}</h3>
                  {com.$createdAt && <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(com.$createdAt).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>}
                </div>
              </div>
              <p className={`whitespace-pre-wrap flex-1 ${(com.tipo === 'Importante') ? 'text-amber-800 dark:text-amber-200 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>{com.descripcion}</p>
            </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

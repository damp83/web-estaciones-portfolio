import React, { useState } from 'react';
import { Reveal } from '../components/Reveal';
import { Plus, X, Loader2, Briefcase, GraduationCap, Award, Users, Star, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { databases, APPWRITE_DB, COL_TRAYECTORIA } from '../lib/appwrite';
import { ID } from 'appwrite';
import { SkeletonTrayectoria } from '../components/ui/Skeletons';

export default function Trayectoria() {
  const { isAdmin } = useAuth();
  const { trayectoria, setTrayectoria, isLoading } = useData();
  const { addToast, setConfirmDialog } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ categoria: 'Experiencia', titulo: '', subtitulo: '', fecha: '', descripcion: '' });

  const triggerEdit = (item) => {
    setFormData({ categoria: item.categoria, titulo: item.titulo, subtitulo: item.subtitulo, fecha: item.fecha, descripcion: item.descripcion });
    setEditId(item.$id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      message: '¿Estás seguro de que quieres eliminar este hito de la trayectoria?',
      onConfirm: async () => {
        try {
          await databases.deleteDocument(APPWRITE_DB, COL_TRAYECTORIA, id);
          setTrayectoria(trayectoria.filter(t => t.$id !== id));
          addToast('Elemento eliminado', 'success');
        } catch (e) { addToast('Error al eliminar el elemento: ' + e.message, 'error'); }
        setConfirmDialog(null);
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.titulo) return;
    setIsSaving(true);
    try {
      const data = { 
        categoria: formData.categoria,
        fecha: formData.fecha,
        titulo: formData.titulo,
        subtitulo: formData.subtitulo,
        descripcion: formData.descripcion
      };

      if (editId) {
        const upd = await databases.updateDocument(APPWRITE_DB, COL_TRAYECTORIA, editId, data);
        setTrayectoria(trayectoria.map(t => t.$id === editId ? upd : t));
      } else {
        const cre = await databases.createDocument(APPWRITE_DB, COL_TRAYECTORIA, ID.unique(), data);
        setTrayectoria([cre, ...trayectoria]);
      }
      cerrarFormulario();
      addToast('Trayectoria guardada correctamente');
    } catch (e) { addToast('Error al guardar trayectoria: ' + e.message, 'error'); }
    finally { setIsSaving(false); }
  };

  const cerrarFormulario = () => {
    setShowForm(false); setEditId(null);
    setFormData({ categoria: 'Experiencia', titulo: '', subtitulo: '', fecha: '', descripcion: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Trayectoria y Equipo</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Mi experiencia, formación y los docentes que hacen posible este proyecto.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(true)} className="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-md shrink-0">
            <Plus className="w-5 h-5" /> Añadir Hito / Miembro
          </button>
        )}
      </div>

      {isAdmin && showForm && (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-indigo-100 dark:border-slate-800 mb-8 relative animate-in slide-in-from-top-4">
          <button type="button" onClick={cerrarFormulario} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{editId ? 'Editar Elemento' : 'Añadir a Trayectoria / Equipo'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
              <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500">
                <option>Experiencia</option><option>Formación</option><option>Reconocimientos</option><option>Equipo Docente</option><option>Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Periodo / Fecha / Curso</label>
              <input type="text" required value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500" placeholder="Ej: 2020 - Actualidad" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Título / Nombre</label>
              <input type="text" required value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Institución / Centro / Rol</label>
              <input type="text" required value={formData.subtitulo} onChange={e => setFormData({...formData, subtitulo: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
              <textarea value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} rows="3" className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"></textarea>
            </div>
          </div>
          <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</> : editId ? 'Actualizar Elemento' : 'Guardar Elemento'}
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
                        <button onClick={() => triggerEdit(item)} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item.$id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
  );
}

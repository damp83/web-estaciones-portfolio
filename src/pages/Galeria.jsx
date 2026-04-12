import React, { useState } from 'react';
import { Reveal } from '../components/Reveal';
import { Plus, X, Loader2, Camera, Trash2, Edit, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { databases, storage, APPWRITE_DB, COL_GALERIA, APPWRITE_BUCKET, APPWRITE_PROJECT, getOptimizedUrl, deleteFileFromUrl } from '../lib/appwrite';
import { ID } from 'appwrite';
import { SkeletonGaleria } from '../components/ui/Skeletons';

export default function Galeria() {
  const { isAdmin } = useAuth();
  const { fotos, setFotos, isLoading } = useData();
  const { addToast, setConfirmDialog } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ titulo: '' });
  const [archivoFoto, setArchivoFoto] = useState(null);

  const [lightboxIndex, setLightboxIndex] = useState(null);

  const triggerEdit = (f) => {
    setFormData({ titulo: f.titulo });
    setEditId(f.$id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      message: 'Â¿Eliminar esta foto?',
      onConfirm: async () => {
        try {
          const doc = fotos.find(f => f.$id === id);
          if (doc && doc.imagenUrl) await deleteFileFromUrl(doc.imagenUrl);
          await databases.deleteDocument(APPWRITE_DB, COL_GALERIA, id);
          setFotos(fotos.filter(f => f.$id !== id));
          addToast('Foto eliminada', 'success');
        } catch (e) { addToast('Error al eliminar la foto: ' + e.message, 'error'); }
        setConfirmDialog(null);
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.titulo) return;
    setIsSaving(true);
    let fileUrl = null;
    try {
      if (archivoFoto) {
        const uf = await storage.createFile(APPWRITE_BUCKET, ID.unique(), archivoFoto);
        fileUrl = `https://cloud.appwrite.io/v1/storage/buckets/${APPWRITE_BUCKET}/files/${uf.$id}/view?project=${APPWRITE_PROJECT}`;
      }
      
      const data = {
        titulo: formData.titulo,
        ...(fileUrl && { imagenUrl: fileUrl })
      };
      
      if (editId) {
        if (!fileUrl) {
           const current = fotos.find(f => f.$id === editId);
           if(current) data.imagenUrl = current.imagenUrl;
        }
        const upd = await databases.updateDocument(APPWRITE_DB, COL_GALERIA, editId, data);
        setFotos(fotos.map(f => f.$id === editId ? upd : f));
      } else {
        if(!fileUrl) throw new Error("Debe seleccionar una foto para crear un nuevo registro.");
        const cre = await databases.createDocument(APPWRITE_DB, COL_GALERIA, ID.unique(), data);
        setFotos([cre, ...fotos]);
      }
      cerrarFormulario();
      addToast('Foto guardada correctamente');
    } catch (e) { addToast('Error al subir foto: ' + e.message, 'error'); }
    finally { setIsSaving(false); }
  };

  const cerrarFormulario = () => {
    setShowForm(false); setEditId(null);
    setFormData({ titulo: '' }); setArchivoFoto(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Reveal>
        <div className="flex justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">GalerÃ­a de ImÃ¡genes</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">Para que podÃ¡is ver un pedacito de nuestro dÃ­a a dÃ­a.</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md">
              <Plus className="w-5 h-5" /> Subir Foto
            </button>
          )}
        </div>
      </Reveal>

      {isAdmin && showForm && (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-indigo-100 dark:border-slate-800 relative animate-in slide-in-from-top-4 mb-8">
          <button type="button" onClick={cerrarFormulario} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-slate-300"><X className="w-6 h-6" /></button>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{editId ? 'Editar Foto' : 'Subir Nueva Foto'}</h3>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">TÃ­tulo / Pie de foto</label>
              <input type="text" required value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Seleccionar Imagen (JPG, PNG)</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-200">
                  <Camera className="w-4 h-4" /><span className="text-sm font-medium">{archivoFoto ? 'Cambiar imagen' : 'Seleccionar archivo'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setArchivoFoto(e.target.files[0])} />
                </label>
                {archivoFoto && <span className="text-sm text-emerald-600 font-medium truncate max-w-[200px]">{archivoFoto.name}</span>}
              </div>
            </div>
          </div>
          <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Subiendo...</> : editId ? 'Actualizar Foto' : 'Publicar Foto'}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <SkeletonGaleria/><SkeletonGaleria/><SkeletonGaleria/><SkeletonGaleria/>
        </div>
      ) : fotos.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500">AÃºn no hay fotos en la galerÃ­a.</p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {fotos.map((foto, index) => (
            <Reveal key={foto.$id} delay={0.05 * (index % 8)}>
              <div className="relative group rounded-2xl overflow-hidden cursor-zoom-in break-inside-avoid bg-slate-200 dark:bg-slate-800 mb-4 shadow-sm" onClick={() => setLightboxIndex(index)}>
                <img loading="lazy" src={getOptimizedUrl(foto.imagenUrl, 400)} alt={foto.titulo || "Foto"} className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-bold text-sm leading-tight drop-shadow-md">{foto.titulo}</p>
                    {foto.$createdAt && <p className="text-white/70 text-xs mt-1">{new Date(foto.$createdAt).toLocaleDateString()}</p>}
                  </div>
                </div>
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={(e) => { e.stopPropagation(); triggerEdit(foto); }} className="p-1.5 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:text-indigo-600 rounded-md shadow-sm"><Edit className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(foto.$id); }} className="p-1.5 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:text-red-600 rounded-md shadow-sm"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in">
           <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-2 sm:p-3 rounded-full transition-all z-10"><Minimize2 className="w-6 h-6 sm:w-8 sm:h-8" /></button>
           <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev > 0 ? prev - 1 : fotos.length - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-2 sm:p-4 rounded-full transition-all z-10"><ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" /></button>
           <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev < fotos.length - 1 ? prev + 1 : 0); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-2 sm:p-4 rounded-full transition-all z-10"><ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" /></button>
           <div className="w-full h-full p-4 sm:p-12 pb-24 flex items-center justify-center relative"><img src={getOptimizedUrl(fotos[lightboxIndex].imagenUrl, 1600)} alt="AmpliaciÃ³n" className="max-w-full max-h-full object-contain rounded-lg sm:rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300" /></div>
           <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-center">
             <h3 className="text-white text-lg sm:text-2xl font-bold mb-2 text-center max-w-3xl drop-shadow-lg">{fotos[lightboxIndex].titulo}</h3>
             <p className="text-white/50 text-xs sm:text-sm tracking-widest font-bold uppercase">{lightboxIndex + 1} de {fotos.length}</p>
           </div>
        </div>
      )}
    </div>
  );
}

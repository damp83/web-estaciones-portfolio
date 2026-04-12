import React, { useState } from 'react';
import { Reveal } from '../components/Reveal';
import { Plus, X, Loader2, Search, Shapes, Users, Pencil, Calculator, Puzzle, LineChart, FileText, ChevronRight, Edit, Trash2, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { databases, storage, APPWRITE_DB, COL_MATERIALES, APPWRITE_BUCKET, APPWRITE_PROJECT, deleteFileFromUrl } from '../lib/appwrite';
import { ID } from 'appwrite';
import { SkeletonMaterial } from '../components/ui/Skeletons';

export default function Materiales() {
  const { isAdmin } = useAuth();
  const { materiales, setMateriales, isLoading } = useData();
  const { addToast, setConfirmDialog } = useToast();

  const [searchTermMaterial, setSearchTermMaterial] = useState('');
  const [filterCategoriaMaterial, setFilterCategoriaMaterial] = useState('Todas');
  const [visibleMateriales, setVisibleMateriales] = useState(6);
  
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ titulo: '', categoria: 'Juego simbólico', descripcion: '' });
  const [archivoPdf, setArchivoPdf] = useState(null);

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

  const filteredMateriales = materiales.filter(m => {
    const s = m.titulo.toLowerCase().includes(searchTermMaterial.toLowerCase()) || m.descripcion.toLowerCase().includes(searchTermMaterial.toLowerCase());
    const c = filterCategoriaMaterial === 'Todas' || m.categoria === filterCategoriaMaterial;
    return s && c;
  });

  const triggerEdit = (mat) => {
    setFormData({ titulo: mat.titulo, categoria: mat.categoria, descripcion: mat.descripcion });
    setEditId(mat.$id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      message: '¿Estás seguro de que quieres eliminar este material? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          const doc = materiales.find(m => m.$id === id);
          if (doc && doc.archivoUrl) await deleteFileFromUrl(doc.archivoUrl);
          await databases.deleteDocument(APPWRITE_DB, COL_MATERIALES, id);
          setMateriales(materiales.filter(m => m.$id !== id));
          addToast('Material eliminado', 'success');
        } catch (e) { addToast('Error al eliminar el material: ' + e.message, 'error'); }
        setConfirmDialog(null);
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.descripcion) return;
    setIsSaving(true);
    let fileUrl = null, fileName = null;
    try {
      if (archivoPdf) {
        const uf = await storage.createFile(APPWRITE_BUCKET, ID.unique(), archivoPdf);
        fileUrl = `https://cloud.appwrite.io/v1/storage/buckets/${APPWRITE_BUCKET}/files/${uf.$id}/view?project=${APPWRITE_PROJECT}`;
        fileName = archivoPdf.name;
      }
      
      const data = {
        titulo: formData.titulo,
        categoria: formData.categoria,
        descripcion: formData.descripcion,
        ...(fileUrl && { archivoUrl: fileUrl, archivoNombre: fileName })
      };
      
      if (editId) {
        // fetch current to not lose file if not replacing
        const current = materiales.find(m => m.$id === editId);
        if (!fileUrl && current) {
           data.archivoUrl = current.archivoUrl;
           data.archivoNombre = current.archivoNombre;
        }
        const upd = await databases.updateDocument(APPWRITE_DB, COL_MATERIALES, editId, data);
        setMateriales(materiales.map(m => m.$id === editId ? upd : m));
      } else {
        const cre = await databases.createDocument(APPWRITE_DB, COL_MATERIALES, ID.unique(), data);
        setMateriales([cre, ...materiales]);
      }
      cerrarFormulario();
      addToast('Material guardado correctamente');
    } catch (e) { addToast('Error al guardar material: ' + e.message, 'error'); }
    finally { setIsSaving(false); }
  };

  const cerrarFormulario = () => {
    setShowForm(false); setEditId(null);
    setFormData({ titulo: '', categoria: 'Juego simbólico', descripcion: '' }); setArchivoPdf(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Reveal>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Banco de Materiales</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Recursos organizados por categorías.</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md">
              <Plus className="w-5 h-5" /> Subir Recurso
            </button>
          )}
        </div>
      </Reveal>

      {!showForm && materiales.length > 0 && (
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

      {isAdmin && showForm && (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-indigo-100 dark:border-slate-800 mb-8 relative animate-in slide-in-from-top-4">
          <button type="button" onClick={cerrarFormulario} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{editId ? 'Editar Material' : 'Añadir Material'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Título</label>
              <input type="text" required value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
              <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500">
                <option>Juego simbólico</option><option>Lecto-escritura</option><option>Lógico-matemática</option><option>Mentalandia</option><option>Sabiómetro</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Descripción de uso</label>
              <textarea required value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} rows="3" className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Adjuntar Material (PDF)</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700">
                  <Upload className="w-4 h-4" /><span className="text-sm font-medium">{archivoPdf ? 'Cambiar archivo' : 'Seleccionar PDF'}</span>
                  <input type="file" accept=".pdf" className="hidden" onChange={e => setArchivoPdf(e.target.files[0])} />
                </label>
                {archivoPdf && <span className="text-sm text-emerald-600 font-medium truncate max-w-[200px]">{archivoPdf.name}</span>}
              </div>
            </div>
          </div>
          <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</> : editId ? 'Actualizar Material' : 'Guardar Material'}
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
      ) : materiales.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
          <Shapes className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500">Aún no hay materiales subidos.</p>
        </div>
      ) : filteredMateriales.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
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
                    <button onClick={() => triggerEdit(mat)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-md transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(mat.$id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
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
      {visibleMateriales < filteredMateriales.length && !showForm && (
        <div className="flex justify-center mt-8">
          <button onClick={() => setVisibleMateriales(prev => prev + 6)} className="bg-white border border-slate-200 text-indigo-600 font-bold py-3 px-8 rounded-xl hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 flex items-center gap-2 group">
            Cargar más recursos <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}

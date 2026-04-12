import React, { useState } from 'react';
import { Plus, X, Loader2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { databases, APPWRITE_DB, COL_EVENTOS } from '../lib/appwrite';
import { ID } from 'appwrite';
import { SkeletonCalendario } from '../components/ui/Skeletons';

export default function Calendario() {
  const { isAdmin } = useAuth();
  const { eventos, setEventos, isLoading } = useData();
  const { addToast, setConfirmDialog } = useToast();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewEvento, setViewEvento] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ titulo: '', descripcion: '', fecha: '', tipo: 'Reunión' });

  const triggerEdit = (ev) => {
    setFormData({ titulo: ev.titulo, descripcion: ev.descripcion, fecha: ev.fecha, tipo: ev.tipo });
    setEditId(ev.$id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      message: '¿Estás seguro de que quieres eliminar este evento?',
      onConfirm: async () => {
        try {
          await databases.deleteDocument(APPWRITE_DB, COL_EVENTOS, id);
          setEventos(eventos.filter(e => e.$id !== id));
          addToast('Evento eliminado', 'success');
        } catch (e) { addToast('Error al eliminar el evento: ' + e.message, 'error'); }
        setConfirmDialog(null);
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.fecha) return;
    setIsSaving(true);
    try {
      const data = {
        titulo: formData.titulo,
        descripcion: formData.descripcion || '',
        fecha: formData.fecha,
        tipo: formData.tipo
      };
      if (editId) {
        const upd = await databases.updateDocument(APPWRITE_DB, COL_EVENTOS, editId, data);
        setEventos(eventos.map(e => e.$id === editId ? upd : e).sort((a,b) => a.fecha.localeCompare(b.fecha)));
      } else {
        const cre = await databases.createDocument(APPWRITE_DB, COL_EVENTOS, ID.unique(), data);
        setEventos([...eventos, cre].sort((a,b) => a.fecha.localeCompare(b.fecha)));
      }
      cerrarFormulario();
      addToast('Evento guardado correctamente');
    } catch (e) { addToast('Error al guardar evento: ' + e.message, 'error'); }
    finally { setIsSaving(false); }
  };

  const cerrarFormulario = () => {
    setShowForm(false); setEditId(null);
    setFormData({ titulo: '', descripcion: '', fecha: '', tipo: 'Reunión' });
  };

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y, m) => {
    let d = new Date(y, m, 1).getDay();
    return d === 0 ? 6 : d - 1; 
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Calendario de Aula</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Próximos eventos, exámenes y actividades.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(true)} className="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-md">
            <Plus className="w-5 h-5" /> Nuevo Evento
          </button>
        )}
      </div>

      {isAdmin && showForm && (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-indigo-100 dark:border-slate-800 mb-8 relative animate-in slide-in-from-top-4 transition-colors">
          <button type="button" onClick={cerrarFormulario} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-6 h-6" /></button>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{editId ? 'Editar Evento' : 'Añadir Evento'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Título</label>
              <input type="text" required value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="Ej: Examen del Tema 3" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de evento</label>
              <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 transition-colors">
                <option>Examen</option><option>Excursión</option><option>Reunión</option><option>Festivo</option><option>Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Fecha</label>
              <input type="date" required value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Descripción (opcional)</label>
              <input type="text" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="Ej: Traer estuche y regla" />
            </div>
          </div>
          <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
            {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</> : editId ? 'Actualizar Evento' : 'Guardar Evento'}
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
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(ev.$id); }} className="absolute -top-1 -right-1 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 rounded-full shadow-md p-1 opacity-0 group-hover:opacity-100 transition-opacity border border-slate-200 dark:border-slate-700"><X className="w-3 h-3" /></button>
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

          {viewEvento && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 border border-slate-100 dark:border-slate-800">
                <button onClick={() => setViewEvento(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-full p-1"><X className="w-6 h-6" /></button>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${getTipoStyles(viewEvento.tipo)}`}>
                  <CalendarIcon className="w-7 h-7 text-white" />
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
                  <button onClick={() => { setViewEvento(null); triggerEdit(viewEvento); }} className="mt-6 w-full py-3 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center justify-center gap-2">
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
}

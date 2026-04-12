import { Client, Account, Databases, Storage } from 'appwrite';

export const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
export const APPWRITE_PROJECT  = import.meta.env.VITE_APPWRITE_PROJECT;
export const APPWRITE_DB       = import.meta.env.VITE_APPWRITE_DB;
export const COL_MATERIALES    = import.meta.env.VITE_COL_MATERIALES;
export const COL_EVALUACION    = import.meta.env.VITE_COL_EVALUACION;
export const COL_FAMILIAS      = import.meta.env.VITE_COL_FAMILIAS;
export const COL_GALERIA       = import.meta.env.VITE_COL_GALERIA;
export const COL_TRAYECTORIA   = import.meta.env.VITE_COL_TRAYECTORIA;
export const COL_EVENTOS       = import.meta.env.VITE_COL_EVENTOS;
export const APPWRITE_BUCKET   = import.meta.env.VITE_APPWRITE_BUCKET;
export const ADMIN_USER_ID     = import.meta.env.VITE_ADMIN_USER_ID;

export const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT);

export const account   = new Account(client);
export const databases = new Databases(client);
export const storage   = new Storage(client);

export const deleteFileFromUrl = async (url) => {
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

export const getOptimizedUrl = (url, w, h, q = 80) => {
  if (!url || !url.includes('storage/buckets')) return url;
  const params = [];
  if (w) params.push(`width=${w}`);
  if (h) params.push(`height=${h}`);
  if (q) params.push(`quality=${q}`);
  if (w && h) { params.push('gravity=center'); params.push('crop=fill'); }
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${params.join('&')}`;
};

// Simple Service Worker for PWA
const CACHE_NAME = 'mi-aula-dinamica-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Fuerza a que el nuevo service worker tome el control inmediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Borra las cachés antiguas de la v1
          }
        })
      );
    }).then(() => self.clients.claim()) // Aplica el control de inmediato
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // NO interceptar peticiones a otros dominios (APIs externas como Appwrite)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Estrategia Network First para las peticiones de navegación (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache First para el resto de assets (imágenes, json, etc)
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

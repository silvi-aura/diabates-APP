// Diabetes sin Miedo — variante con sección Salud.
// Caché independiente para no interferir con otras instalaciones del mismo origen.
// Los registros personales se guardan en localStorage y este archivo no los modifica.
const K = 'diabetes-sin-miedo-salud-v1';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(K);
    await cache.addAll(['./', 'index.html', 'manifest.json']);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Borra solamente versiones anteriores de esta variante, no cachés de otras apps.
    const names = await caches.keys();
    await Promise.all(names.filter(name =>
      name.startsWith('diabetes-sin-miedo-salud-') && name !== K
    ).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

// Red primero; si no hay conexión, usa la caché de esta app únicamente.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(K).then(cache => cache.put(event.request, copy)).catch(() => {});
      }
      return response;
    }).catch(async () => {
      const cache = await caches.open(K);
      return await cache.match(event.request) || await cache.match('./');
    })
  );
});

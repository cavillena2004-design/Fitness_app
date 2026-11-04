// Guarda la app en el móvil para que funcione sin conexión.
// Con conexión siempre intenta la versión nueva primero (así se actualiza sola).
const CACHE = 'app-fitness-v3';
const ARCHIVOS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  // Si falta algún archivo (p. ej. un icono), el resto se guarda igualmente
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(ARCHIVOS.map(f => c.add(f)))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    // cache: 'no-cache' → pregunta siempre a GitHub si hay versión nueva (actualizaciones al momento)
    fetch(e.request, { cache: 'no-cache' })
      .then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});

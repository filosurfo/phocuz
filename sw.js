// PHO CUZ — Service Worker
const CACHE = 'phocuz-v4';
const PRECACHE = [
  '/phocuz/',
  '/phocuz/index.html',
  '/phocuz/PAGINAS/menu.html',
  '/phocuz/PAGINAS/nosotros.html',
  '/phocuz/PAGINAS/contacto.html',
  '/phocuz/CSS/styles.css',
  '/phocuz/JS/widgets.js',
  '/phocuz/IMAGENES/logo.svg',
  '/phocuz/IMAGENES/icon-192.png',
  '/phocuz/IMAGENES/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()) // No bloquear si falla el precache
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  // Para navegación (HTML), red primero, caché como respaldo
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(cache => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request).then(cached => cached || caches.match('/phocuz/')))
    );
    return;
  }

  // Para recursos (CSS, JS, imágenes), caché primero
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      });
    })
  );
});

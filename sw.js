// PHO CUZ — Service Worker
const CACHE = 'phocuz-v3';
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
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
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
  // Solo cachear GET del mismo origen
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      });
      return cached || network;
    })
  );
});

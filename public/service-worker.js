/* Simple offline-first service worker */
const CACHE_NAME = 'lingo-mingle-cache-v2';
// Derive base path when hosted under a subfolder (GitHub Pages)
const BASE_PATH = self.location.pathname.replace(/service-worker\.js$/, '');
const APP_SHELL = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'manifest.webmanifest',
  BASE_PATH + 'index.css',
  BASE_PATH + 'vite.svg',
  BASE_PATH + 'images/slide1.svg',
  BASE_PATH + 'images/slide2.svg',
  BASE_PATH + 'images/slide3.svg',
  BASE_PATH + 'images/slide4.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Navigation requests: serve index.html (SPA) from cache as fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET
  if (req.method !== 'GET') return;

  // App navigation: respond with cached index.html when offline
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const online = await fetch(req);
          return online;
        } catch (e) {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(BASE_PATH + 'index.html');
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // Same-origin assets: network-first, fallback to cache
  if (url.origin === self.location.origin) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const res = await fetch(req);
          cache.put(req, res.clone());
          return res;
        } catch (e) {
          const cached = await cache.match(req);
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // Cross-origin (e.g., images if any): cache-first
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req, { mode: 'no-cors' });
        cache.put(req, res.clone());
        return res;
      } catch (e) {
        return Response.error();
      }
    })()
  );
});

/* Simple offline-first service worker */
const CACHE_NAME = 'lingo-mingle-cache-v3';
// Derive base path when hosted under a subfolder (GitHub Pages)
const BASE_PATH = self.location.pathname.replace(/service-worker\.js$/, '');
const APP_SHELL = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'manifest.webmanifest',
  BASE_PATH + 'vite.svg'
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
  // For cross-origin requests (e.g., Unsplash images), let the network handle it.
  // This avoids issues with opaque responses and ensures images load normally.
  return;
});

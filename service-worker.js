const CACHE_VERSION = 'transporte-heuro-20260807-v1';
const CORE_ASSETS = [
  './', './index.html', './style.css?v=20260807-1', './app.js?v=20260807-1',
  './supabase-config.js?v=20260807-1', './manifest.json?v=20260807-1', './IMG_1774.webp',
  './AC1F8155-6FA3-4763-B069-50086DF91DD6.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name !== CACHE_VERSION).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request, { cache: 'no-store' });
        const cache = await caches.open(CACHE_VERSION);
        await cache.put('./index.html', response.clone());
        return response;
      } catch (_) {
        return (await caches.match(event.request)) || (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    const network = fetch(event.request).then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(CACHE_VERSION);
        await cache.put(event.request, response.clone());
      }
      return response;
    }).catch(() => null);
    return cached || (await network) || Response.error();
  })());
});

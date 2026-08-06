const CACHE_VERSION = 'transporte-heuro-cloud-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './welcome-screen-fix-v16.css',
  './fixed-datetime.css',
  './app.js',
  './register-flow.js',
  './whatsapp-routing.js',
  './supabase-config.js',
  './cloud-app.js',
  './cloud-auth.js',
  './cloud-runtime.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await Promise.allSettled(CORE_ASSETS.map((asset) => cache.add(asset)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name !== CACHE_VERSION)
        .map((name) => caches.delete(name))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request, { cache: 'no-cache' });
        const cache = await caches.open(CACHE_VERSION);
        cache.put('./index.html', response.clone());
        return response;
      } catch (_) {
        return (await caches.match(event.request)) ||
          (await caches.match('./index.html')) ||
          Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    const networkPromise = fetch(event.request, { cache: 'no-cache' }).then(async (response) => {
      if (response && response.ok) {
        const cache = await caches.open(CACHE_VERSION);
        cache.put(event.request, response.clone());
      }
      return response;
    });

    return networkPromise.catch(() => cached || Response.error());
  })());
});

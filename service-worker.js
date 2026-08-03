const CACHE_NAME = 'transporte-heuro-publish-reset-20260803-1246';
const APP_BUILD = '20260803-1246';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
    await self.clients.claim();

    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    await Promise.all(clients.map((client) => {
      try {
        const url = new URL(client.url);
        url.searchParams.set('build', APP_BUILD);
        url.searchParams.delete('appUpdate');
        return client.navigate(url.toString());
      } catch (_) {
        return Promise.resolve();
      }
    }));
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    try {
      return await fetch(event.request, { cache: 'reload' });
    } catch (_) {
      return fetch(event.request, { cache: 'no-store' });
    }
  })());
});

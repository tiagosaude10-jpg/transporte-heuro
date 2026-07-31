const CACHE_NAME='transporte-heuro-v23';
const APP_FILES=[
  './',
  './index.html',
  './style.css?v=15',
  './app.js?v=15',
  './register-flow.js?v=15',
  './whatsapp-routing.js?v=3',
  './home-layout-fix.js?v=3',
  './manifest.json',
  './IMG_1774.webp',
  './05394C12-F4A3-417B-9B83-534F29C9A87D.png?v=20260731-4'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(
    fetch(event.request,{cache:'no-store'})
      .then(response=>{
        if(response && response.ok){
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
        }
        return response;
      })
      .catch(()=>caches.match(event.request))
  );
});

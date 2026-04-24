const CACHE = 'tallymarket-v43';
const STATIC = [
  '/meal-prep-log/manifest.json',
  '/meal-prep-log/Tallymarket-Icon-192.png',
  '/meal-prep-log/Tallymarket-Icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if(url.pathname === '/meal-prep-log/' || url.pathname === '/meal-prep-log/index.html'){
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/meal-prep-log/'))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

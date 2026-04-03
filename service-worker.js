const CACHE = 'tallymarket-v10';
const ASSETS = [
  '/meal-prep-log/',
  '/meal-prep-log/index.html',
  '/meal-prep-log/manifest.json',
  '/meal-prep-log/Tallymarket-Icon-192.png',
  '/meal-prep-log/Tallymarket-Icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
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
  // Network first — always try to get fresh content
  // Fall back to cache only if offline
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Update the cache with the fresh response
        const copy = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});

const CACHE = 'tallymarket-v1';
const FILES = [
  './index.html',
  './manifest.json',
  './Tallymarket-Icon-192.png',
  './Tallymarket-Icon-512.png'
];

// Install: cache everything, activate immediately on next launch
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first for HTML (so updates are picked up), cache-first for static.
// Never intercept Anthropic API calls — let them go straight through.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Don't touch cross-origin API calls (Anthropic, fonts, etc.)
  if (url.origin !== self.location.origin) return;

  const isHTML = e.request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  if (isHTML) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return response;
        })
        .catch(() => caches.match(e.request) || caches.match('./index.html'))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});

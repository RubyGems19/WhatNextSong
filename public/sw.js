const CACHE = 'chord-picker-v1';
const ASSETS = ['/', '/manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Cache-first for static assets, network-first for pages
  if (url.origin === location.origin && (url.pathname.startsWith('/_next') || url.pathname.startsWith('/icons'))) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
    return;
  }

  if (e.request.method === 'GET') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  }
});

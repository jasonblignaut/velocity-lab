const CACHE_NAME = 'velocity-lab-v7';
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/profile.html',
  '/admin.html',
  '/login.html',
  '/register.html',
  '/offline.html',
  '/css/styles.css',
  '/js/main.js',
  '/assets/favicon.ico',
  '/assets/Velocity-Logo.png',
  '/assets/default-avatar.png'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. Bypass cache for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req).catch(() =>
        new Response(JSON.stringify({ error: 'API unreachable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // 2. For login/register, always go to network (redirects allowed)
  if (['/login.html', '/register.html'].includes(url.pathname)) {
    event.respondWith(
      fetch(req, { cache: 'no-store', redirect: 'follow' })
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // 3. Navigations (HTML)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req, { redirect: 'follow' })
        .then((res) => {
          if (!res || res.status !== 200) throw new Error('Bad response');
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('/offline.html')))
    );
    return;
  }

  // 4. Other (CSS, JS, images, etc.)
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).catch(() => {
        if (req.destination === 'image') return caches.match('/assets/default-avatar.png');
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

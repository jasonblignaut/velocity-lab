// sw.js - Velocity Lab Service Worker

const CACHE_NAME = 'velocity-lab-v6';
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

// Install: Pre-cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching static assets');
      return cache.addAll(urlsToCache);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Removing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  console.log(`Service Worker: Fetching ${url.href} [${request.method}]`);

  // 1. Always bypass cache for API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request, { cache: 'no-store', redirect: 'follow' })
        .then((res) => res)
        .catch(() =>
          new Response(JSON.stringify({ error: 'API unreachable' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          })
        )
    );
    return;
  }

  // 2. Login & register: no-cache + follow redirect safely
  if (['/login.html', '/register.html'].includes(url.pathname)) {
    event.respondWith(
      fetch(request, { redirect: 'manual', cache: 'no-store' })
        .then((res) => {
          if (res.type === 'opaqueredirect' || res.status === 302 || res.status === 301) {
            console.log('Service Worker: Following manual redirect to', res.headers.get('Location'));
            return fetch(res.url); // Safely follow
          }
          return res;
        })
        .catch((err) => {
          console.error('Service Worker: Login/Register fetch failed', err);
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // 3. Navigation requests: HTML pages
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { redirect: 'manual' })
        .then((res) => {
          if (res.type === 'opaqueredirect' || res.status === 301 || res.status === 302) {
            return fetch(res.url);
          }
          return res;
        })
        .catch(() => {
          console.warn('Service Worker: Offline, serving cached navigation page');
          return caches.match(request).then((cached) => cached || caches.match('/offline.html'));
        })
    );
    return;
  }

  // 4. Other assets: try cache first, then network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        console.log('Service Worker: Cache hit for', url.href);
        return cached;
      }
      return fetch(request, { redirect: 'follow' })
        .then((res) => res)
        .catch((err) => {
          console.error('Service Worker: Asset fetch failed', url.href, err);
          if (request.destination === 'image') {
            return caches.match('/assets/default-avatar.png');
          }
          return new Response('Offline - asset not cached', { status: 503 });
        });
    })
  );
});

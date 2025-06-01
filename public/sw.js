// sw.js - Service Worker for Velocity Lab

const CACHE_NAME = 'velocity-lab-v5';
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

// Install: cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installed');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('Service Worker: Installation failed', err);
      })
  );
});

// Activate: remove old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
      .catch((err) => {
        console.error('Service Worker: Activation failed', err);
      })
  );
});

// Fetch: decide how to respond
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const method = event.request.method;
  console.log(`Service Worker: Fetching ${url.href} Method: ${method}`);

  // 1) Bypass cache entirely for all API calls (always go to network)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store', redirect: 'follow' })
        .then((response) => {
          // If API is down, return a 503‐style JSON
          return response;
        })
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'API unavailable' }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
    );
    return;
  }

  // 2) Bypass cache for login.html & register.html (so redirects always come fresh)
  if (['/login.html', '/register.html'].includes(url.pathname)) {
    console.log('Service Worker: Bypassing cache for', url.pathname);
    event.respondWith(
      fetch(event.request, { redirect: 'follow', cache: 'no-store' })
        .then((response) => {
          // If the server responds with a redirect, the browser will follow it
          return response;
        })
        .catch((err) => {
          console.error(`Service Worker: Fetch failed for ${url.pathname}`, err);
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // 3) For navigations (HTML pages), serve cache first, then network
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request)
        .then((cached) => {
          if (cached) {
            console.log('Service Worker: Serving from cache:', url.href);
            return cached;
          }
          return fetch(event.request, { redirect: 'follow' })
            .then((response) => {
              return response;
            })
            .catch(() => {
              console.log('Service Worker: Network fetch failed, serving offline page');
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // 4) For everything else (CSS, JS, images, etc.), try cache first, fallback to network
  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        if (cached) {
          console.log('Service Worker: Serving from cache:', url.href);
          return cached;
        }
        return fetch(event.request, { redirect: 'follow' })
          .catch((err) => {
            console.error('Service Worker: Fetch failed for', url.href, err);
            if (event.request.destination === 'image') {
              // Deafult avatar when images fail
              return caches.match('/assets/default-avatar.png');
            }
            return new Response('Resource not available offline', { status: 503 });
          });
      })
  );
});

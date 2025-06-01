// sw.js - Service Worker for Velocity Lab
const CACHE_NAME = 'velocity-lab-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/profile.html',
  '/admin.html',
  '/offline.html',
  '/css/styles.css',
  '/js/main.js',
  '/assets/favicon.ico',
  '/assets/Velocity-Logo.png',
  '/assets/default-avatar.png'
];

// Install event: Cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: Caching files');
      return cache.addAll(urlsToCache);
    }).then(() => {
      console.log('Service Worker: Installed');
      return self.skipWaiting();
    }).catch(error => {
      console.error('Service Worker: Installation failed', error);
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();
    }).catch(error => {
      console.error('Service Worker: Activation failed', error);
    })
  );
});

// Fetch event: Serve cached assets or fetch from network
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  console.log('Service Worker: Fetching', url.href);

  // Bypass caching for login and register pages to handle redirects
  if (['/login.html', '/register.html'].includes(url.pathname)) {
    console.log('Service Worker: Bypassing cache for', url.pathname);
    event.respondWith(
      fetch(event.request, { redirect: 'follow' }).catch(() => {
        console.log('Service Worker: Network fetch failed for', url.pathname);
        return caches.match('/offline.html');
      })
    );
    return;
  }

  // Handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache:', url.href);
          return cachedResponse;
        }
        return fetch(event.request, { redirect: 'follow' }).catch(() => {
          console.log('Service Worker: Network fetch failed, serving offline page');
          return caches.match('/offline.html');
        });
      })
    );
    return;
  }

  // Handle other requests (CSS, JS, images, etc.)
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        console.log('Service Worker: Serving from cache:', url.href);
        return cachedResponse;
      }
      return fetch(event.request, { redirect: 'follow' }).catch(error => {
        console.error('Service Worker: Fetch failed for', url.href, error);
        if (event.request.destination === 'image') {
          return caches.match('/assets/default-avatar.png');
        }
        return new Response('Resource not available offline', { status: 503 });
      });
    })
  );
});
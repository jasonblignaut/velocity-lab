const CACHE_NAME = 'velocity-lab-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/register.html',
  '/dashboard.html',
  '/profile.html',
  '/admin.html',
  '/css/styles.css',
  '/js/main.js',
  '/assets/Velocity-Logo.png',
  '/assets/default-avatar.png',
  '/assets/favicon.ico',
  '/offline.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets:', STATIC_ASSETS);
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete, skipping waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete, claiming clients');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('Service Worker: Activation failed:', error);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  console.log('Service Worker: Fetching:', url.href, 'Method:', event.request.method);

  // Only handle GET requests
  if (event.request.method !== 'GET') {
    console.log('Service Worker: Skipping non-GET request:', event.request.method);
    return;
  }

  // Skip API calls and third-party requests
  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin || url.pathname.startsWith('/api/')) {
    console.log('Service Worker: Skipping third-party or API request:', url.href);
    return;
  }

  // Optionally skip caching for login.html to avoid redirect issues
  if (url.pathname === '/login.html') {
    console.log('Service Worker: Bypassing cache for /login.html');
    return event.respondWith(
      fetch(event.request, { redirect: 'follow' })
        .catch((error) => {
          console.error('Service Worker: Fetch failed for /login.html:', error);
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        })
    );
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache:', url.href);
          return cachedResponse;
        }

        console.log('Service Worker: Fetching from network:', url.href);
        return fetch(event.request, { redirect: 'follow' })
          .then((response) => {
            console.log('Service Worker: Network response:', url.href, 'Status:', response.status, 'Type:', response.type);

            // Return redirect responses without caching
            if (response.status >= 300 && response.status < 400) {
              console.log('Service Worker: Handling redirect:', url.href, 'Status:', response.status);
              return response;
            }

            // Only cache valid, non-error responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              console.log('Service Worker: Not caching response:', url.href, 'Status:', response.status);
              return response;
            }

            // Cache the response
            console.log('Service Worker: Caching response:', url.href);
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed:', url.href, error);
            if (event.request.destination === 'document') {
              console.log('Service Worker: Serving offline.html for:', url.href);
              return caches.match('/offline.html');
            }
          });
      })
  );
});
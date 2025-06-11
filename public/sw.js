// Velocity Lab PWA Service Worker
const CACHE_NAME = 'velocity-lab-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/Velocity-Logo.png',
  '/assets/VelocityBackground.jpg',
  '/assets/task-definitions.js',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/Appleios.png',
  '/assets/Android_512.png',
  '/assets/apple-touch-icon.png',
  '/assets/favicon.ico'
];

// Install SW
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 PWA Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.log('⚠️ PWA Cache install failed (non-critical):', error);
      })
  );
});

// Fetch
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ PWA Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// PWA Install prompt
self.addEventListener('beforeinstallprompt', function(event) {
  console.log('🚀 PWA Install prompt available');
  event.preventDefault();
  return event;
});
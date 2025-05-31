// Service Worker para Pet Care PWA

const CACHE_NAME = 'petcare-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/AppIcons/web/favicon.ico',
  '/AppIcons/web/icon-192.png',
  '/AppIcons/web/icon-512.png',
  '/AppIcons/web/icon-192-maskable.png',
  '/AppIcons/web/icon-512-maskable.png',
  '/AppIcons/web/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
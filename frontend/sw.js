const CACHE_NAME = 'duty-planner-v5';
const urlsToCache = [
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/config.js',
  './js/api.js',
  './js/store.js',
  './js/app.js',
  './js/views/setup.js',
  './js/views/manage.js',
  './js/views/roster.js',
  './js/views/calculator.js',
  './js/views/settings.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {});
    })
  );
});
const CACHE_NAME = 'omegaup-v1';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
  OFFLINE_URL,
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/css/dist/omegaup_styles.css',
  '/third_party/bootstrap-4.5.0/css/bootstrap.min.css',
  '/third_party/js/jquery-3.5.1.min.js',
  '/third_party/bootstrap-4.5.0/js/bootstrap.bundle.min.js',
  '/pwa-init.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Background Sync placeholder for submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-submissions') {
    event.waitUntil(syncSubmissions());
  }
});

async function syncSubmissions() {
  // Logic to send queued submissions when back online
  console.log('Syncing submissions...');
}

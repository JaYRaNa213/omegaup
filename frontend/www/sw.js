const CACHE_NAME = 'omegaup-v1.0.0';

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/css/dist/omegaup_styles.css',
  '/js/dist/omegaup.js',
  '/favicon.ico',
  '/manifest.json'
];

// ========================
// INSTALL
// ========================
self.addEventListener('install', (event) => {
  console.log('[SW] Install');

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Caching static assets');

      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (e) {
          console.warn('[SW] Failed to cache:', asset);
        }
      }
    })
  );

  self.skipWaiting();
});

// ========================
// ACTIVATE
// ========================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    })
  );

  self.clients.claim();
});

// ========================
// FETCH HANDLER
// ========================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ------------------------
  // 1. NAVIGATION (HTML)
  // ------------------------
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(async () => {
          const cached = await caches.match('/offline.html');
          return cached || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // ------------------------
  // 2. API REQUESTS
  // ------------------------
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'Offline' }), {
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  // ------------------------
  // 3. STATIC ASSETS
  // ------------------------
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();

          // ✅ Correct condition (fixed precedence)
          if (
            request.method === 'GET' &&
            (
              request.url.includes('/js/') ||
              request.url.includes('/css/') ||
              request.url.includes('/media/')
            )
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match('/offline.html');
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// ========================
// BACKGROUND SYNC
// ========================
self.addEventListener('sync', (event) => {
  if (event.tag === 'submission-sync') {
    console.log('[SW] Sync triggered: submission-sync');

    // Prototype only
    // Real implementation:
    // - Read IndexedDB queue
    // - Retry submissions
  }
});
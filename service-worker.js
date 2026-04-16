// ===== FitTracker Pro - Service Worker =====
// PWA offline support: cache all static assets

const CACHE_NAME = 'fittracker-v2';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/db.js',
  './js/exercises.js',
  './js/ai.js',
  './js/timer.js',
  './js/news.js',
  './js/achievements.js',
  './js/charts.js',
  './js/views/training.js',
  './js/views/record.js',
  './js/views/history.js',
  './js/views/profile.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
      .catch(e => console.log('[SW] Cache install failed:', e))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle http/https requests
  if (!event.request.url.startsWith('http')) return;
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  // Relative URL for cache lookup (matches install-time paths)
  const cacheKey = './' + url.pathname.replace(/^\//, '');

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(cacheKey).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.ok) {
            cache.put(cacheKey, response.clone());
          }
          return response;
        }).catch(() => {
          // Network failed and no cache
          return new Response('Offline', { status: 503 });
        });
      })
    )
  );
});

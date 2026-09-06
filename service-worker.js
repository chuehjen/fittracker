// ===== FitTracker PWA Service Worker =====
// Caches the app shell so core workout logging can open offline.

const CACHE_NAME = 'fittracker-shell-v10';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './css/style.css',
  './js/achievements.js',
  './js/ai.js',
  './js/app.js',
  './js/charts.js',
  './js/data.js',
  './js/db.js',
  './js/exercise_db.js',
  './js/exercise_detail.js',
  './js/exercise_catalog.js',
  './js/exercises.js',
  './js/helpers.js',
  './js/html.js',
  './js/news.js',
  './js/sync.js',
  './js/toast.js',
  './js/training_guidance.js',
  './js/views/history.js',
  './js/views/profile.js',
  './js/views/training.js',
  './data/exercise_catalog.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(cached => {
      const network = fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);

      return cached || network;
    })
  );
});

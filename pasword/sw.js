const CACHE_NAME = 'shortenit-v1.7'; // Versioni i ri për folderin 'pasword'
const urlsToCache = [
  '/',
  '/index.html',
  '/pasword/manifest.json', // RREGULLIMI: Tani te folderi pasword
  '/pasword/pasword.css',
  '/pasword/pasword.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

// Ikona e globit me versionim
const ICON_URL = 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png?v=4';

// Instalimi
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('ShortenIt SW: Duke krijuar cache-in v1.7 (folderi pasword)...');
        cache.addAll(urlsToCache);
        return cache.add(new Request(ICON_URL, { mode: 'no-cors' }));
      })
  );
});

// Aktivizimi dhe fshirja e cache-it të vjetër
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('ShortenIt SW: Duke fshirë versionin e vjetër:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});

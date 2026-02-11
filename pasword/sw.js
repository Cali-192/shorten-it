const CACHE_NAME = 'shortenit-v1.1'; // Version i ri për të detyruar përditësimin
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json', // E RËNDËSISHME: Duhet të jetë këtu për ikonën
  '/pasword/pasword.css',
  '/pasword/pasword.js',
  'https://cdn-icons-png.flaticon.com/512/1006/1006771.png', // Ikona e globit
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

// Instalimi: Ruajmë skedarët bazë
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('ShortenIt SW: Duke krijuar cache-in e ri...');
        return cache.addAll(urlsToCache);
      })
  );
});

// Aktivizimi: Pastrojmë versionet e vjetra që të mos mbetet ikona e vjetër
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

// Fetch: Shërbejmë skedarët nga cache ose rrjeti
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Kthejmë skedarin nga cache nëse ekziston, përndryshe e marrim nga interneti
        return response || fetch(event.request).then(fetchRes => {
          // Opsionale: Mund të ruajmë në cache skedarët e rinj që vizitohen
          return fetchRes;
        });
      }).catch(() => {
        // Fallback nëse jemi offline dhe kërkohet një faqe e re
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});

const CACHE_NAME = 'shortenit-v1.5'; // Versioni i ri për të detyruar rifreskimin e ikonës
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pasword/pasword.css',
  '/pasword/pasword.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

// Ikona e jashtme trajtohet veçmas me 'no-cors' për siguri
const ICON_URL = 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png?v=4';

// Instalimi: Ruajmë skedarët
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('ShortenIt SW: Duke krijuar cache-in e ri...');
        // Provon të shtojë të gjitha resurset lokale
        cache.addAll(urlsToCache);
        // Shton ikonën me Request specifik për të shmangur bllokimin CORS
        return cache.add(new Request(ICON_URL, { mode: 'no-cors' }));
      })
  );
});

// Aktivizimi: Fshijmë versionet e vjetra (Pastron ikonën e vjetër 'V')
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('ShortenIt SW: Duke pastruar cache-in e vjetër:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch: Shërbejmë skedarët
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Kthejmë nga cache ose marrim nga rrjeti
        return response || fetch(event.request).then(fetchRes => {
          return fetchRes;
        });
      }).catch(() => {
        // Nëse jemi offline dhe kërkohet navigim
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});

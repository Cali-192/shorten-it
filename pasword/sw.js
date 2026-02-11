const CACHE_NAME = 'shortenit-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/pasword/pasword.css',
  '/pasword/pasword.js',
  'https://cdn-icons-png.flaticon.com/512/1006/1006771.png', // Ikona e globit të zi
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

// Instalimi dhe ruajtja e skedarëve (Caching)
self.addEventListener('install', event => {
  self.skipWaiting(); // E detyron SW të aktivizohet menjëherë
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('ShortenIt: Duke ruajtur skedarët në Cache...');
        return cache.addAll(urlsToCache);
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
            console.log('ShortenIt: Duke fshirë Cache-in e vjetër...');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Merr kontrollin e faqes menjëherë
});

// Shërbimi i skedarëve nga Cache kur nuk ka internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Kthe response nga cache, nëse s'është, kërkoje në rrjet
        return response || fetch(event.request);
      }).catch(() => {
        // Nëse dështon rrjeti dhe nuk është në cache (p.sh. faqe tjetër)
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});

const CACHE_NAME = 'shortenit-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/pasword.css',
  '/pasword.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Instalimi dhe ruajtja e skedarëve (Caching)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Duke ruajtur skedarët në Cache...');
        return cache.addAll(urlsToCache);
      })
  );
});

// Aktivizimi dhe fshirja e cache-it të vjetër nëse bën ndryshime
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Shërbimi i skedarëve nga Cache kur nuk ka internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

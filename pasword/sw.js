self.addEventListener('install', (e) => {
  console.log('ShortenIt Service Worker Installed');
});

self.addEventListener('fetch', (e) => {
  // Kjo lejon që app të punojë edhe offline nëse dëshiron më vonë
});
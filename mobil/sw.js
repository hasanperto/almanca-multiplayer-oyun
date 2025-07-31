const CACHE_NAME = 'almanca-oyun-v1.0.0';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './sorular.json',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache açıldı');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  // Socket.IO isteklerini bypass et
  if (event.request.url.includes('socket.io')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache'den dön varsa, yoksa network'ten getir
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(error => {
        console.log('Fetch failed:', error);
        return new Response('Network error', { status: 503 });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eski cache siliniyor:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification support (opsiyonel)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Almanca öğrenme zamanı!',
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore', 
        title: 'Oyunu Aç',
        icon: './icon-192.png'
      },
      {
        action: 'close', 
        title: 'Kapat'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Almanca Oyun', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
}); 
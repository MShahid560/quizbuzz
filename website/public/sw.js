// public/sw.js  — Service Worker for PWA + Push Notifications

const CACHE_NAME = 'quizbuzz-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
];

// Install — cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📦 Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return; // Don't cache API

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(event.request, clone)
          );
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push Notifications
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || 'You have a new notification!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: data.tag || 'quizbuzz',
    data: { url: data.url || '/' },
    actions: data.actions || [
      { action: 'open', title: '🎮 Play Now' },
      { action: 'dismiss', title: 'Later' }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: false
  };
  event.waitUntil(
    self.registration.showNotification(
      data.title || '🐝 Quiz Buzz', options
    )
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client)
          return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
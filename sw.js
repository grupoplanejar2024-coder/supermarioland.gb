const CACHE_NAME = 'kubo-touch-mario-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './gb_supermarioland.jpg',
  './supermarioland.gb',
  './data/loader.js',
  'https://cdn.emulatorjs.org/stable/data/loader.js'
];

// Instalação do Service Worker e armazenamento em cache inicial
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Kubo Touch: Cache aberto com sucesso');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('Erro ao fazer cache dos recursos:', err))
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceção de requisições para funcionamento offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se encontrar, senão busca na rede
        if (response) {
          return response;
        }
        return fetch(event.request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            // Guarda dinamicamente novos ficheiros solicitados (como os cores do emulador)
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => {
          // Fallback caso esteja offline e o recurso não esteja no cache
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

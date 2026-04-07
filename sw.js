const CACHE_NAME = 'bali-virtual-guide-v1';
const urlsToCache = [
  './',
  'index.html',
  'manifest.json'
  // 画像や外部リソースはキャッシュしない（必要に応じて追加可）
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          networkResponse => {
            // 重要なファイルのみ追加キャッシュ（オプション）
            if (event.request.url.indexOf('index.html') !== -1 || event.request.url === self.location.origin + '/') {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
            }
            return networkResponse;
          }
        );
      })
      .catch(() => {
        // オフライン時のフォールバックページ（必要に応じて）
        return new Response("オフラインです。インターネット接続を確認してください。", { status: 404 });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});
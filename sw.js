const CACHE_NAME = 'dictation-app-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html', // Thay tên file HTML của bạn nếu khác 'index.html'
  'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=ZCOOL+XiaoWei&display=swap'
];

// Cài đặt Service Worker và lưu cache các file giao diện tĩnh
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Kích hoạt và dọn dẹp cache cũ khi có cập nhật
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Chiến lược Fetch: Ưu tiên lấy từ Mạng, nếu Offline sẽ tự động lấy từ Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Nếu kết nối mạng bình thường, tự động lưu bản mới nhất vào Cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Khi mất mạng (Offline), lấy dữ liệu đã lưu gần nhất trong Cache
        return caches.match(event.request);
      })
  );
});
// Service worker mínimo: cache estático básico para que la app funcione offline
// y se pueda instalar como PWA en móvil/tablet.

const CACHE = 'mates-v2';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './srs.js',
  './exercises.js',
  './storage.js',
  './handwrite.js',
  './manifest.json',
  './icon.svg',
];

// Patrones de URL externas que conviene cachear (TensorFlow.js + modelo MNIST)
// para que la app funcione offline tras la primera descarga.
const EXTERNAL_PATTERNS = [
  /cdn\.jsdelivr\.net\/npm\/@tensorflow\/tfjs/,
  /cdn\.jsdelivr\.net\/gh\/bensonruan\/Hand-Written-Digit-Recognition/,
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = req.url;
  // Cacheamos same-origin y los assets externos del reconocedor.
  const sameOrigin = url.startsWith(self.location.origin);
  const externalCachable = EXTERNAL_PATTERNS.some(p => p.test(url));
  if (!sameOrigin && !externalCachable) return; // dejar pasar el resto

  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      // Solo cacheamos respuestas válidas; los responses opacos (no-cors)
      // ocupan espacio pero se sirven correctamente desde caché.
      if (res && (res.ok || res.type === 'opaque')) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      }
      return res;
    }).catch(() => cached))
  );
});

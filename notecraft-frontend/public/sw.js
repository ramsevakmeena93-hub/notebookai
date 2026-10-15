// NoteCraft AI — Service Worker
const CACHE = 'notecraft-v1'

const PRECACHE = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Caveat:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap'
]

// Install — cache core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

// Activate — delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Fetch — network first, fallback to cache
self.addEventListener('fetch', e => {
  // Skip non-GET and chrome-extension
  if (e.request.method !== 'GET') return
  if (e.request.url.startsWith('chrome-extension')) return

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache successful responses
        if (res && res.status === 200) {
          const clone = res.clone()
          caches.open(CACHE).then(cache => cache.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request).then(cached => cached || caches.match('/index.html')))
  )
})

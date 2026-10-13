// Service worker: offline support that cannot pin users to an old build.
//
// WHAT WAS WRONG BEFORE
//
// 1. The fetch handler bailed on any URL containing "railway.app". The
//    backend is on railway.app, but so is the frontend, so the guard
//    matched every request and nothing was ever served from the cache.
//    The app shipped a service worker and had no offline support at all.
//
// 2. The handler was `cached || fetch(request)`, cache-first with no
//    revalidation, and index.html was precached. index.html is what names
//    the hashed JS bundle. So the moment caching actually worked, every
//    installed user would be pinned to the build they first installed and
//    would never see an update unless CACHE_NAME was bumped by hand on
//    every deploy. That is unfixable remotely once an app is on a store.
//
// THE STRATEGY
//
// Requests are split by what they are, because HTML and hashed assets
// have opposite correct answers:
//
//   navigations (HTML)  network-first, cache as fallback.
//                       A new deploy is always picked up when online;
//                       offline falls back to the last good shell.
//
//   /assets/*           cache-first. Vite fingerprints these filenames,
//                       so a given URL's contents never change. A new
//                       build means new filenames, which miss the cache
//                       and are fetched. Safe to keep forever.
//
//   other same-origin   stale-while-revalidate. Icons, images, manifest:
//                       serve instantly from cache, refresh in the
//                       background so a replaced icon lands next time.
//
//   cross-origin        not handled at all, so it goes straight to the
//                       network. That is the API and anything else off
//                       this origin. Comparing origins rather than
//                       matching on a domain substring is what fixes the
//                       original bug.
//
// Because HTML is network-first and assets are content-addressed,
// correctness no longer depends on remembering to bump the version below.
// It only controls when old caches are discarded.

const CACHE_NAME = 'catholic-companion-v15'

// The shell. Enough to render offline; hashed assets join the cache as
// they are requested, which happens on the first online load.
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  )
  self.clients.claim()
})

// Only store responses we can actually reuse. An opaque cross-origin
// response or an error page in the cache is worse than a cache miss.
function isCacheable(response) {
  return response && response.ok && response.type === 'basic'
}

async function putInCache(request, response) {
  const cache = await caches.open(CACHE_NAME)
  await cache.put(request, response)
}

// HTML: try the network, fall back to whatever shell we have.
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (isCacheable(response)) putInCache(request, response.clone())
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached

    // A deep link while offline: the requested path was never cached, but
    // the SPA shell can still boot and route client-side.
    const shell = await caches.match('/index.html')
    if (shell) return shell

    return new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    })
  }
}

// Fingerprinted assets: the URL identifies the contents, so a hit is
// always correct and never needs revalidating.
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (isCacheable(response)) putInCache(request, response.clone())
  return response
}

// Everything else same-origin: answer from cache immediately if we can,
// and refresh in the background either way.
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request)

  const network = fetch(request)
    .then(response => {
      if (isCacheable(response)) putInCache(request, response.clone())
      return response
    })
    .catch(() => null)

  if (cached) return cached

  const response = await network
  return response || new Response('Offline', { status: 503 })
}

self.addEventListener('fetch', event => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Cross-origin, the API included. Left entirely alone.
  if (url.origin !== self.location.origin) return

  const isNavigation =
    request.mode === 'navigate' || request.destination === 'document'

  if (isNavigation) {
    event.respondWith(networkFirst(request))
    return
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request))
    return
  }

  event.respondWith(staleWhileRevalidate(request))
})

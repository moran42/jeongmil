const CACHE = 'insp-shell-1790515596012'
const ASSETS = ["/jeongmil/assets/index-CFfmfrjc.css","/jeongmil/assets/index-TbO1suSH.js","/jeongmil/assets/xlsx-CNerDvZX.js","/jeongmil/index.html","/jeongmil/manifest.webmanifest"]
const INDEX = "/jeongmil/index.html"
const ROOT = "/jeongmil/"

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (!url.pathname.startsWith(ROOT)) return
  if (url.pathname === "/jeongmil/sw.js") return
  event.respondWith((async () => {
    const cache = await caches.open(CACHE)
    const documentRequest = request.mode === 'navigate' || url.pathname.endsWith('/index.html')
    if (documentRequest) {
      try {
        const fresh = await fetch(request, { cache: 'no-store' })
        if (fresh.ok) await cache.put(INDEX, fresh.clone())
        return fresh
      } catch {
        return (await cache.match(INDEX)) || Response.error()
      }
    }
    const cached = await cache.match(request)
    if (cached) return cached
    try {
      const fresh = await fetch(request)
      if (fresh.ok) await cache.put(request, fresh.clone())
      return fresh
    } catch {
      return cached || Response.error()
    }
  })())
})

// Service worker di Handy+: l'app si apre anche senza internet.
// Con la rete prende sempre i file nuovi (e ne salva una copia); senza rete usa l'ultima copia salvata.
// Non tocca Lumen (cartella lumen/), che ha il suo service worker.
const CACHE = "handy-v4.0";
const CORE = ["./", "index.html", "menu.js", "manifest.webmanifest", "icon-v2-180.png", "icon-v2-192.png", "icon-v2-512.png", "logo.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("handy-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (url.pathname.includes("/lumen/")) return;
    if (url.pathname.endsWith("version.json")) return; // il controllo aggiornamenti va sempre in rete
    e.respondWith(networkFirst(req));
  } else if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(cacheFirst(req));
  }
});

// Prima la rete (max 3 secondi), poi la copia salvata. index.html?v=… e menu.js?v=… condividono la stessa copia.
async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  const key = new URL(req.url); key.search = "";
  const net = fetch(req).then((res) => { if (res.ok) cache.put(key.href, res.clone()); return res; });
  net.catch(() => {});
  try {
    const res = await Promise.race([net, new Promise((r) => setTimeout(r, 3000))]);
    if (res) return res;
  } catch (err) { /* offline: si passa alla copia */ }
  const hit = (await cache.match(key.href)) || (req.mode === "navigate" ? await cache.match(new URL("./", location.href).href) : null);
  return hit || net;
}

// Caratteri di Google: una volta scaricati restano salvati.
async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  cache.put(req, res.clone());
  return res;
}

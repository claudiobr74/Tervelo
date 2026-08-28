const CACHE = "tervelo-app-shell-v1";

const PRECACHE = [
  "/app/today",
  "/brand/dumbbell-logo.svg",
  "/brand/logo.png",
  "/icons/pwa-192.png",
  "/icons/pwa-512.png",
  "/icons/nav/hoje.svg",
  "/icons/nav/treino.svg",
  "/icons/nav/evolucao.svg",
  "/icons/nav/coach.svg",
  "/icons/nav/mais.svg",
];

function isPrivateApi(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("nhost.run") ||
    url.pathname.includes("graphql") ||
    url.pathname.startsWith("/admin")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE).catch(() => undefined)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      ),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (isPrivateApi(url)) return;

  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font" ||
    request.destination === "image"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetched = fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              void caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || fetched;
      }),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/app/today"))),
    );
  }
});

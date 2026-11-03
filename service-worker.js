const CACHE_NAME = "kabaro-v8";

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",

    // KABARO Background
    "./assets/kabaro-background.png",

    // KABARO App Icons
    "./assets/kabaro-192.png",
    "./assets/kabaro-512.png",
    "./assets/apple-touch-icon.png",
    "./assets/kabaro-1024.png",
    "./assets/favicon-64.png"
];

// INSTALL: Cache the KABARO application files
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
            .then(() => self.skipWaiting())
    );
});

// ACTIVATE: Remove old caches
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// FETCH: Load cached files when offline
self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    const requestURL = new URL(event.request.url);

    if (requestURL.origin !== self.location.origin) return;

    // HTML: Try network first, then use cached version
    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put("./index.html", copy);
                        });
                    }
                    return response;
                })
                .catch(() => caches.match("./index.html"))
        );
        return;
    }

// Other app files: Network first, then cache if offline
event.respondWith(
    fetch(event.request)
        .then(response => {
            if (response.ok) {
                const copy = response.clone();

                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, copy);
                });
            }

            return response;
        })
        .catch(() => {
            return caches.match(event.request);
        })
);
});
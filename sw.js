const CACHE_NAME = 'novafolio-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/planos.css',
    '/script.js',
    '/planos.js',
    '/pwa.js',
    '/firebase-config.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
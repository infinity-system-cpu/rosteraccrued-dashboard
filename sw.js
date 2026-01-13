const CACHE_NAME = 'novafolio-v2'; // Incrementa esto al actualizar la app
const urlsToCache = [
    '/',
    'index.html',
    'style.css',
    'planos.css',
    'script.js',
    'planos.js',
    'pwa.js',
    'firebase-config.js'
];

// Instalación y Cacheo
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

// Limpieza de cachés antiguos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                          .map(name => caches.delete(name))
            );
        })
    );
});

// Estrategia: Network First (Red primero, si falla, usa el caché)
// Esto es mejor para apps de nómina donde los datos cambian seguido
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
// service-worker.js
// ============================================
// SERVICE WORKER - Sirve modelos desde caché
// ============================================

const NOMBRE_CACHE = 'modelos-3d';

// ============================================
// INSTALACIÓN
// ============================================

self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker instalándose...');
    // 🔑 Activar inmediatamente sin esperar
    self.skipWaiting();
});

// ============================================
// ACTIVACIÓN
// ============================================

self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activado');
    // 🔑 Tomar control de las pestañas abiertas
    event.waitUntil(self.clients.claim());
});

// ============================================
// INTERCEPTAR PETICIONES
// ============================================

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 🔑 Solo interceptar peticiones a /assets/modelos/
    if (!url.pathname.startsWith('/assets/modelos/')) {
        return;
    }

    event.respondWith(
        manejarPeticionDeModelo(event.request)
    );
});

async function manejarPeticionDeModelo(request) {
    try {
        const cache = await caches.open(NOMBRE_CACHE);
        const cached = await cache.match(request);

        if (cached) {
            console.log('📦 Servido desde caché:', request.url);
            return cached;
        }

        // 🔑 Si no está en caché, intentar descargar del servidor
        console.log('📥 No está en caché, descargando:', request.url);
        const respuesta = await fetch(request);

        // 🔑 Si la descarga va bien, guardarlo en caché
        if (respuesta.ok) {
            const clon = respuesta.clone();
            cache.put(request, clon);
        }

        return respuesta;

    } catch (error) {
        console.error('❌ Error cargando modelo:', request.url, error);
        return new Response('Modelo no disponible', { status: 404 });
    }
}
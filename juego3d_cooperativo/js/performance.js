// performance.js
// ============================================
// DETECTOR DE FPS Y CALIDAD ADAPTATIVA
// ============================================

// Niveles de calidad
export const CALIDAD = {
    BAJA: 0,    // para móviles lentos
    MEDIA: 1,   // por defecto
    ALTA: 2     // para móviles potentes
};

// Configuración
const FPS_OBJETIVO = 30;        // queremos 30 FPS mínimo
const FPS_BAJAR = 22;           // si bajamos de aquí, reducimos calidad
const FPS_SUBIR = 55;           // si subimos de aquí, aumentamos calidad
const SEGUNDOS_PARA_BAJAR = 3;  // 3 segundos consecutivos malos → bajar
const SEGUNDOS_PARA_SUBIR = 8;  // 8 segundos consecutivos buenos → subir

// Estado
let calidadActual = CALIDAD.MEDIA;
let contadorFrames = 0;
let tiempoUltimaMedicion = performance.now();
let fpsActual = 60;
let segundosBajos = 0;
let segundosAltos = 0;
let listeners = [];

// ============================================
// MEDIR FPS CADA FRAME
// ============================================

export function medirFPS() {
    contadorFrames++;
    const ahora = performance.now();
    const delta = ahora - tiempoUltimaMedicion;

    // Cada 1 segundo, calcular FPS
    if (delta >= 1000) {
        fpsActual = Math.round(contadorFrames * 1000 / delta);
        contadorFrames = 0;
        tiempoUltimaMedicion = ahora;

        evaluarCalidad();
    }
}

// ============================================
// EVALUAR SI HAY QUE CAMBIAR LA CALIDAD
// ============================================

function evaluarCalidad() {
    // Si los FPS son bajos
    if (fpsActual < FPS_BAJAR) {
        segundosBajos++;
        segundosAltos = 0;

        if (segundosBajos >= SEGUNDOS_PARA_BAJAR && calidadActual > CALIDAD.BAJA) {
            bajarCalidad();
            segundosBajos = 0;
        }
    }
    // Si los FPS son altos
    else if (fpsActual > FPS_SUBIR) {
        segundosAltos++;
        segundosBajos = 0;

        if (segundosAltos >= SEGUNDOS_PARA_SUBIR && calidadActual < CALIDAD.ALTA) {
            subirCalidad();
            segundosAltos = 0;
        }
    }
    // Si está en el rango medio, mantener
    else {
        segundosBajos = 0;
        segundosAltos = 0;
    }

    // Log de vez en cuando (cada 5 segundos)
    if (Math.random() < 0.2) {
        console.log(`📊 FPS: ${fpsActual} | Calidad: ${nombreCalidad(calidadActual)}`);
    }
}

// ============================================
// CAMBIAR DE NIVEL
// ============================================

function bajarCalidad() {
    if (calidadActual === CALIDAD.MEDIA) {
        calidadActual = CALIDAD.BAJA;
        console.log('📉 Bajando a calidad BAJA');
    } else if (calidadActual === CALIDAD.ALTA) {
        calidadActual = CALIDAD.MEDIA;
        console.log('📉 Bajando a calidad MEDIA');
    }

    notificarCambio();
}

function subirCalidad() {
    if (calidadActual === CALIDAD.BAJA) {
        calidadActual = CALIDAD.MEDIA;
        console.log('📈 Subiendo a calidad MEDIA');
    } else if (calidadActual === CALIDAD.MEDIA) {
        calidadActual = CALIDAD.ALTA;
        console.log('📈 Subiendo a calidad ALTA');
    }

    notificarCambio();
}

// ============================================
// LISTENERS (para que otros módulos reaccionen)
// ============================================

export function onCalidadCambia(callback) {
    listeners.push(callback);
    // Devolver función para cancelar
    return () => {
        listeners = listeners.filter(cb => cb !== callback);
    };
}

function notificarCambio() {
    listeners.forEach(cb => cb(calidadActual));
}

// ============================================
// CONSULTAS
// ============================================

export function getCalidad() {
    return calidadActual;
}

export function getFPS() {
    return fpsActual;
}

function nombreCalidad(c) {
    if (c === CALIDAD.BAJA) return 'BAJA';
    if (c === CALIDAD.MEDIA) return 'MEDIA';
    return 'ALTA';
}
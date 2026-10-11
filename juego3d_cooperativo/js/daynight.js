// daynight.js
import * as THREE from "../../assets/modulos/three.module.js";
import { scene } from './scene.js';  /*

Importa la escena para obtener el Sol y sus
propiedades y modificar las posiciones de esta
luz. Yo no se como entender un archivo JavaScript
como lo haria un profesional, que mal
*/

// ============================================
// CONFIGURACIÓN
// ============================================

const DURACION_DIA_SEG    = 240;   // 4 minutos de día
const DURACION_NOCHE_SEG  = 120;   // 2 minutos de noche
const DURACION_CICLO_SEG  = DURACION_DIA_SEG + DURACION_NOCHE_SEG;

// ============================================
// COLORES
// ============================================

const COLOR_DIA       = new THREE.Color(0x87CEEB);   // celeste
const COLOR_ATARDECER = new THREE.Color(0xFF8C42);   // naranja
const COLOR_NOCHE      = new THREE.Color(0x0a1628);   // azul oscuro

// ============================================
// ESTADO
// ============================================

let sunLight = null;
let lunaLight = null;
let tiempoActual = 0;    // segundos desde el inicio del ciclo
let horaDelDia = 0;      // 0 = amanecer, 0.25 = mediodía, 0.5 = atardecer, 0.75 = medianoche
let listeners = [];

// ============================================
// INICIALIZACIÓN
// ============================================

export function initDayNight() {
    // Buscar el sol que ya existe en scene.js
    scene.traverse((obj) => {
        if (obj.isDirectionalLight && !sunLight) {
            sunLight = obj;
        }
    });

    if (!sunLight) {
        // Si no hay sol, crearlo
        sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(20, 40, 20);
        scene.add(sunLight);
    }

    // Luz de luna (más suave, azulada)
    lunaLight = new THREE.DirectionalLight(0x8899cc, 0);
    lunaLight.position.set(-20, 30, -20);
    scene.add(lunaLight);

    console.log('🌅 Sistema día/noche inicializado');
    console.log(`   Día: ${DURACION_DIA_SEG}s · Noche: ${DURACION_NOCHE_SEG}s`);
}

// ============================================
// ACTUALIZACIÓN (llamada cada frame desde main.js)
// ============================================

export function updateDayNight(deltaSegundos) {
    tiempoActual += deltaSegundos;

    // Reiniciar el ciclo
    if (tiempoActual >= DURACION_CICLO_SEG) {
        tiempoActual = 0;
    }

    // Calcular hora del día (0 a 1)
    horaDelDia = tiempoActual / DURACION_CICLO_SEG;

    // Actualizar el sol/luna
    actualizarSolLuna();
    actualizarColores();
    actualizarIntensidad();

    // Avisar a quien escuche
    listeners.forEach(cb => cb({ horaDelDia, esDeNoche: esDeNoche() }));
}

// ============================================
// MOVER EL SOL Y LA LUNA
// ============================================

function actualizarSolLuna() {
    // Ángulo de 0 a 2π
    const angulo = horaDelDia * Math.PI * 2;

    // El sol sale por el este (-X), sube por arriba (+Y), se pone por el oeste (+X)
    const radio = 60;
    const x = Math.cos(angulo - Math.PI / 2) * radio;
    const y = Math.sin(angulo - Math.PI / 2) * radio;
    const z = 20;   // un poco inclinado

    sunLight.position.set(x, y, z);

    // La luna está en el lado opuesto
    lunaLight.position.set(-x, -y + 20, -z);
}

// ============================================
// COLORES DEL CIELO
// ============================================

function actualizarColores() {
    let color;
    const h = horaDelDia;

    // Amanecer (0.0 - 0.1): noche → atardecer → día
    // Mediodía (0.1 - 0.4): día puro
    // Atardecer (0.4 - 0.5): día → atardecer
    // Noche (0.5 - 1.0): noche pura

    if (h < 0.05) {
        // Amanecer: noche a atardecer
        const t = h / 0.05;
        color = COLOR_NOCHE.clone().lerp(COLOR_ATARDECER, t);
    } else if (h < 0.1) {
        // Amanecer: atardecer a día
        const t = (h - 0.05) / 0.05;
        color = COLOR_ATARDECER.clone().lerp(COLOR_DIA, t);
    } else if (h < 0.4) {
        // Mediodía
        color = COLOR_DIA.clone();
    } else if (h < 0.45) {
        // Atardecer: día a atardecer
        const t = (h - 0.4) / 0.05;
        color = COLOR_DIA.clone().lerp(COLOR_ATARDECER, t);
    } else if (h < 0.5) {
        // Atardecer: atardecer a noche
        const t = (h - 0.45) / 0.05;
        color = COLOR_ATARDECER.clone().lerp(COLOR_NOCHE, t);
    } else {
        // Noche pura
        color = COLOR_NOCHE.clone();
    }

    scene.background = color;
}

// ============================================
// INTENSIDAD DE LAS LUCES
// ============================================

function actualizarIntensidad() {
    const h = horaDelDia;

    // Sol: 1 en el día, 0 en la noche
    let intensidadSol = 0;
    if (h < 0.5) {
        // Día: sube al amanecer, baja al atardecer
        intensidadSol = Math.sin(h * Math.PI * 2) + 0.5;
        if (intensidadSol < 0) intensidadSol = 0;
        if (intensidadSol > 1) intensidadSol = 1;
    }

    sunLight.intensity = intensidadSol;

    // Luna: 0.15 en la noche, 0 en el día
    lunaLight.intensity = (h >= 0.5) ? 0.15 : 0;

    // Color del sol: más naranja al atardecer
    if (h > 0.35 && h < 0.5) {
        sunLight.color.setHex(0xffaa66);
    } else {
        sunLight.color.setHex(0xffffff);
    }
}

// ============================================
// CONSULTAS
// ============================================

export function esDeNoche() {
    return horaDelDia >= 0.5;
}

export function getHoraDelDia() {
    return horaDelDia;
}

export function getFaseDelDia() {
    const h = horaDelDia;
    if (h < 0.05) return 'amanecer';
    if (h < 0.4) return 'día';
    if (h < 0.5) return 'atardecer';
    return 'noche';
}

// ============================================
// SUSCRIPCIÓN A CAMBIOS
// ============================================

export function onDayNightChange(callback) {
    listeners.push(callback);
    // Devolver función para cancelar
    return () => {
        listeners = listeners.filter(cb => cb !== callback);
    };
}

// ============================================
// CONTROL MANUAL (debug)
// ============================================

export function setHoraDelDia(h) {
    tiempoActual = h * DURACION_CICLO_SEG;
    horaDelDia = h;
    actualizarSolLuna();
    actualizarColores();
    actualizarIntensidad();
}

export function getDuracionCiclo() {
    return DURACION_CICLO_SEG;
}

// daynight.js — al final
window.esDeNoche = esDeNoche;
window.getHoraDelDia = getHoraDelDia;
window.setHoraDelDia = setHoraDelDia;

console.log('🔧 Debug expuesto: window.esDeNoche, window.setHoraDelDia');
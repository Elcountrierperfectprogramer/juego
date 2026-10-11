// fogata.js
import * as THREE from "../../assets/modulos/three.module.js";
import { scene, camera } from './scene.js';
import { state } from './state.js';
import { getAlturaReal } from './utils.js';
import { playSonido } from './audio.js';
import { colocarFogataServidor } from './network.js';
import { quitarItemPorNombre } from './inventory.js';

// ============================================
// MODELO DE LA FOGATA (provisional con geometría)
// ============================================

function crearModeloFogata(opacidad = 1) {
    const grupo = new THREE.Group();

    // Base: círculo de piedras
    const geoBase = new THREE.CylinderGeometry(0.8, 1.0, 0.2, 12);
    const matBase = new THREE.MeshStandardMaterial({
        color: 0x555555,
        roughness: 0.9,
        transparent: opacidad < 1,
        opacity: opacidad
    });
    const base = new THREE.Mesh(geoBase, matBase);
    base.position.y = 0.1;
    grupo.add(base);

    // Troncos: 4 palos cruzados
    for (let i = 0; i < 4; i++) {
        const geoTronco = new THREE.CylinderGeometry(0.08, 0.08, 0.9, 6);
        const matTronco = new THREE.MeshStandardMaterial({
            color: 0x5a3a1a,
            roughness: 1,
            transparent: opacidad < 1,
            opacity: opacidad
        });
        const tronco = new THREE.Mesh(geoTronco, matTronco);
        tronco.rotation.z = Math.PI / 2;
        tronco.rotation.y = (i / 4) * Math.PI * 2;
        tronco.position.y = 0.25;
        grupo.add(tronco);
    }

    return grupo;
}

// ============================================
// COLOCAR LA FOGATA EN EL MUNDO
// ============================================

export function crearFogata(x, z, id = null, encendida = false) {
    const fogata = crearModeloFogata(1);

    const altura = getAlturaReal(x, z);
    fogata.position.set(x, altura, z);

    fogata.userData = {
        tipo: 'fogata',
        id: id || `fog_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        encendida: encendida,
        luz: null
    };

    // Si nace encendida, montar la luz
    if (encendida) encenderFogataMesh(fogata);

    scene.add(fogata);
    state.ListaFogatas.push(fogata);

    return fogata;
}

// ============================================
// MODO COLOCACIÓN: previsualización que sigue al jugador
// ============================================

export function activarModoColocacion() {
    if (state.modoColocacion) return;

    state.modoColocacion = 'fogata';
    state.previsualizacion = crearModeloFogata(0.4);   // 40% opaco
    scene.add(state.previsualizacion);

    console.log('🔨 Modo colocación: fogata');
}

export function desactivarModoColocacion() {
    if (!state.modoColocacion) return;

    if (state.previsualizacion) {
        scene.remove(state.previsualizacion);
        state.previsualizacion.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
        state.previsualizacion = null;
    }

    state.modoColocacion = null;
    console.log('🔨 Modo colocación: cancelado');
}

// ============================================
// ACTUALIZAR LA PREVISUALIZACIÓN CADA FRAME
// ============================================

export function updatePrevisualizacion() {
    if (!state.previsualizacion) return;

    // Colocar a 3 unidades delante del jugador
    const frente = new THREE.Vector3(0, 0, -3);
    frente.applyQuaternion(camera.quaternion);

    const x = camera.position.x + frente.x;
    const z = camera.position.z + frente.z;
    const y = getAlturaReal(x, z);

    state.previsualizacion.position.set(x, y, z);

    // Hacer que mire hacia el jugador
    state.previsualizacion.rotation.y = camera.rotation.y;
}

// ============================================
// CONFIRMAR COLOCACIÓN
// ============================================

export async function confirmarColocacion() {
    if (!state.modoColocacion || !state.previsualizacion) return false;

    const pos = state.previsualizacion.position.clone();

    // 1. Consumir el item del inventario
    const consumido = quitarItemPorNombre('Fogata');
    if (!consumido) {
        console.log('❌ No tienes fogata en el inventario');
        desactivarModoColocacion();
        return false;
    }

    // 2. Crear la fogata real (apagada por defecto)
    const nuevaFogata = crearFogata(pos.x, pos.z, null, false);

    // 3. Avisar al servidor
    colocarFogataServidor(nuevaFogata.userData.id, pos.x, pos.z).then(ok => {
        if (!ok) console.warn('⚠️ Servidor no confirmó la fogata');
    });

    // 4. Sonido
    playSonido('recolectar');

    // 5. Salir del modo colocación
    desactivarModoColocacion();

    console.log(`🔥 Fogata colocada en (${pos.x.toFixed(1)}, ${pos.z.toFixed(1)})`);
    return true;
}

// ============================================
// ENCENDER LA FOGATA
// ============================================

export function encenderFogataMesh(fogata) {
    if (!fogata || !fogata.userData) return;
    if (fogata.userData.encendida) return;

    // Luz naranja
    const luz = new THREE.PointLight(0xff8844, 1.5, 15, 2);
    luz.position.set(0, 0.8, 0);
    fogata.add(luz);

    fogata.userData.luz = luz;
    fogata.userData.encendida = true;
}

export function encenderFogataCercana() {
    // Buscar la fogata más cercana que esté apagada
    let masCercana = null;
    let minDist = Infinity;

    for (const f of state.ListaFogatas) {
        if (f.userData.encendida) continue;

        const dx = camera.position.x - f.position.x;
        const dz = camera.position.z - f.position.z;
        const dist = Math.hypot(dx, dz);

        if (dist < minDist && dist < 3) {
            minDist = dist;
            masCercana = f;
        }
    }

    if (!masCercana) return false;

    // Consumir un tronco
    if (!quitarItemPorNombre('Tronco')) {
        console.log('❌ Necesitas un tronco');
        return false;
    }

    encenderFogataMesh(masCercana);
    playSonido('craftear');
    console.log('🔥 Fogata encendida');

    return true;
}

// ============================================
// ACTUALIZAR FOGATAS (parpadeo de la luz)
// ============================================

let tiempoParpadeo = 0;

export function updateFogatas(deltaSegundos) {
    tiempoParpadeo += deltaSegundos;

    for (const fogata of state.ListaFogatas) {
        const luz = fogata.userData.luz;
        if (!luz) continue;

        // Parpadeo suave entre 1.2 y 1.8
        const ruido = Math.sin(tiempoParpadeo * 8 + fogata.position.x) * 0.15
                    + Math.sin(tiempoParpadeo * 13 + fogata.position.z) * 0.1;
        luz.intensity = 1.5 + ruido;
    }
}
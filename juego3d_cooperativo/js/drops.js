// drops.js
import * as THREE from "../../assets/modulos/three.module.js";
import { scene } from './scene.js';
import { state } from './state.js';
import { getAlturaReal } from './utils.js';

// ============================================
// CREAR UN DROP EN EL MUNDO
// ============================================

export function crearDrop(item, x, z, y = null) {
    // Geometría simple: una caja pequeña con textura
    const geo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const mat = new THREE.MeshStandardMaterial({
        map: null,                          // sin textura por ahora
        color: colorPorTipo(item.type),
        emissive: colorPorTipo(item.type),
        emissiveIntensity: 0.3
    });

    const mesh = new THREE.Mesh(geo, mat);

    // Posición: en el suelo + un poco flotando
    const alturaSuelo = (y !== null) ? y : getAlturaReal(x, z);
    mesh.position.set(x, alturaSuelo + 0.5, z);

    // Guardar los datos del item dentro del mesh
    mesh.userData = {
        tipo: 'drop',
        item: { ...item },                   // copia del item
        yBase: alturaSuelo + 0.5,
        fase: Math.random() * Math.PI * 2,   // para la animación de flotar
        creadoEn: performance.now()
    };

    scene.add(mesh);
    state.ListaDrops.push(mesh);

    return mesh;
}

// ============================================
// COLOR SEGÚN EL TIPO
// ============================================

function colorPorTipo(tipo) {
    switch (tipo) {
        case 'herramienta': return 0x9b59b6;   // morado
        case 'comida':      return 0xe74c3c;   // rojo
        case 'material':    return 0x3498db;   // azul
        case 'bloque':      return 0x95a5a6;   // gris
        default:            return 0xf1c40f;   // amarillo
    }
}

// ============================================
// ACTUALIZACIÓN (flotar y rotar)
// ============================================

export function updateDrops(deltaSegundos) {
    const ahora = performance.now() / 1000;

    for (const drop of state.ListaDrops) {
        if (!drop.userData || drop.userData.tipo !== 'drop') continue;

        // Rotar suavemente
        drop.rotation.y += deltaSegundos * 1.5;

        // Flotar arriba y abajo
        const offset = Math.sin(ahora * 2 + drop.userData.fase) * 0.15;
        drop.position.y = drop.userData.yBase + offset;
    }
}

// ============================================
// QUITAR UN DROP
// ============================================

export function quitarDrop(mesh) {
    scene.remove(mesh);
    if (mesh.parent) mesh.parent.remove(mesh);

    // Limpiar geometría
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
        if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.dispose());
        } else {
            mesh.material.dispose();
        }
    }

    const idx = state.ListaDrops.indexOf(mesh);
    if (idx !== -1) state.ListaDrops.splice(idx, 1);
}

// ============================================
// CREAR DROP CERCA DEL JUGADOR (al soltar)
// ============================================

export function soltarCercaDelJugador(item, camera) {
    // Colocar delante del jugador
    const frente = new THREE.Vector3(0, 0, -2);
    frente.applyQuaternion(camera.quaternion);

    const x = camera.position.x + frente.x;
    const z = camera.position.z + frente.z;

    return crearDrop(item, x, z);
}
// piso.js
import * as THREE from "../../assets/modulos/three.module.js";
import { scene, camera } from './scene.js';
import { state } from './state.js';
import { getAlturaReal } from './utils.js';
import { playSonido } from './audio.js';
import { colocarPisoServidor } from './network.js';
import { quitarItemPorNombre, tieneItem } from './inventory.js';

// ============================================
// CONFIGURACIÓN
// ============================================

const TAMANO_PISO = 4;   // 4x4 unidades por piso
const GROSOR_PISO = 0.1; // grosor visual (una losa fina)

// ============================================
// TEXTURA DE MADERA
// ============================================

const texturaMadera = new THREE.TextureLoader().load(
    '../assets/Texturas/madera.jpg'
);
texturaMadera.wrapS = THREE.RepeatWrapping;
texturaMadera.wrapT = THREE.RepeatWrapping;
texturaMadera.repeat.set(1, 1);   // 1 repetición por piso

// ============================================
// MODELO DEL PISO
// ============================================

function crearModeloPiso(opacidad = 1) {
    const grupo = new THREE.Group();

    // Geometría: plano delgado en horizontal
    // BoxGeometry con muy poco alto → parece una tabla/losa
    const geo = new THREE.BoxGeometry(TAMANO_PISO, GROSOR_PISO, TAMANO_PISO);

    // Material con textura de madera
    const mat = new THREE.MeshStandardMaterial({
        map: texturaMadera,
        roughness: 0.9,
        metalness: 0,
        transparent: opacidad < 1,
        opacity: opacidad
    });

    const tabla = new THREE.Mesh(geo, mat);
    tabla.position.y = 0;   // el grupo lo coloca al nivel del suelo
    grupo.add(tabla);

    return grupo;
}

// ============================================
// COLOCAR UN PISO EN EL MUNDO
// ============================================

export function crearPiso(x, z, id = null) {
    const piso = crearModeloPiso(1);

    // El piso se apoya ligeramente por encima del suelo para evitar z-fighting
    const altura = getAlturaReal(x, z);
    piso.position.set(x, altura + 0.05, z);

    // Rotar el piso según la cámara del jugador (opcional, ver nota abajo)
    piso.rotation.y = Math.round(camera.rotation.y / (Math.PI / 2)) * (Math.PI / 2);

    piso.userData = {
        tipo: 'piso',
        id: id || `piso_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        x: x,
        z: z
    };

    scene.add(piso);
    state.ListaPisos.push(piso);

    return piso;
}

// ============================================
// MODO COLOCACIÓN
// ============================================

export function activarModoColocacionPiso() {
    if (state.modoColocacion) return;

    state.modoColocacion = 'piso';
    state.previsualizacion = crearModeloPiso(0.5);   // 50% opaco
    scene.add(state.previsualizacion);

    console.log('🔨 Modo colocación: piso de madera');
}

export function desactivarModoColocacionPiso() {
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
    console.log('🔨 Modo colocación cancelado');
}

// ============================================
// ACTUALIZAR LA PREVISUALIZACIÓN CADA FRAME
// ============================================

export function updatePrevisualizacionPiso() {
    if (!state.previsualizacion) return;
    if (state.modoColocacion !== 'piso') return;

    // Colocar a 3 unidades delante del jugador
    const frente = new THREE.Vector3(0, 0, -3);
    frente.applyQuaternion(camera.quaternion);

    const x = camera.position.x + frente.x;
    const z = camera.position.z + frente.z;
    const y = getAlturaReal(x, z);

    state.previsualizacion.position.set(x, y + 0.05, z);

    // Encajar la rotación a múltiplos de 90°
    state.previsualizacion.rotation.y =
        Math.round(camera.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
}

// ============================================
// CONFIRMAR COLOCACIÓN
// ============================================

export async function confirmarColocacionPiso() {
    if (state.modoColocacion !== 'piso' || !state.previsualizacion) return false;

    const pos = state.previsualizacion.position.clone();
    const rot = state.previsualizacion.rotation.y;

    // 1. Consumir el item
    const consumido = quitarItemPorNombre('piso_madera');
    if (!consumido) {
        console.log('❌ No tienes piso de madera en el inventario');
        desactivarModoColocacionPiso();
        return false;
    }

    // 2. Crear el piso real
    const nuevoPiso = crearPiso(pos.x, pos.z);
    nuevoPiso.rotation.y = rot;   // mantener la rotación

    // 3. Avisar al servidor
    colocarPisoServidor(nuevoPiso.userData.id, pos.x, pos.z, rot).then(ok => {
        if (!ok) console.warn('⚠️ Servidor no confirmó el piso');
    });

    // 4. Sonido
    playSonido('recolectar');

    // 5. ¿Quedan más pisos? Si sí, no salir del modo colocación
    const quedanPisos = tieneItem('Piso de madera');
    if (!quedanPisos) {
        desactivarModoColocacionPiso();
    }

    console.log(`🪵 Piso colocado en (${pos.x.toFixed(1)}, ${pos.z.toFixed(1)})`);
    return true;
}
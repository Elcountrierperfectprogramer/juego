// players.js
import * as THREE from "../../assets/modulos/three.module.js";
import { GLTFLoader } from "../../assets/modulos/GLTFLoader.js";
import { getNetwork, sendMyPosition } from './network.js';
import { scene, camera } from './scene.js';
import { getAlturaReal } from './utils.js';

let modeloXbot = null;
let xbotCargado = false;
let jugadorLocal = null;
export const otrosJugadores = {};
export let mixer = null;

const netW = getNetwork();
const MyId = netW.myId;

// ---------- Carga del Xbot ----------
export function cargarXbot() {
    return new Promise((resolve, reject) => {
        if (modeloXbot && xbotCargado) {
            console.log("♻️ Xbot ya estaba cargado, reutilizando");
            modeloXbot.up.y = 0;
            console.log(modeloXbot.children[0].children);
            resolve(modeloXbot);
            return;
        }

        const loader = new GLTFLoader();
        const rutaXbot = '/assets/modelos/Xbot.glb';
        console.log("🔄 Cargando modelo Xbot desde:", rutaXbot);

        loader.load(
            rutaXbot,
            (gltf) => {
                console.log("✅ Xbot cargado correctamente");
                modeloXbot = gltf.scene;
                xbotCargado = true;
                modeloXbot.visible = true;
                modeloXbot.scale.set(1, 1, 1);

                setInterval(() => {
                    modeloXbot.position.x += 1;
                }, 1000);

                mixer = new THREE.AnimationMixer(modeloXbot);
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();

                resolve(modeloXbot);
            },
            (xhr) => {
                const progress = (xhr.loaded / xhr.total) * 100;
                console.log(`📥 Cargando Xbot: ${Math.round(progress)}%`);
            },
            (error) => {
                console.error("❌ Error al cargar Xbot:", error);
                reject(error);
            }
        );
    });
}

// ---------- Jugador local ----------
export async function crearJugadorLocal() {
    console.log("🎮 Creando jugador local...");
    try {
        if (!modeloXbot) {
            console.error("❌ No se pudo cargar Xbot para jugador local");
            return null;
        }
        jugadorLocal = modeloXbot.clone();
        jugadorLocal.scale.set(1, 1, 1);
        jugadorLocal.updateMatrixWorld(true);

        jugadorLocal.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                        mat.color.setHex(0x3498DB);
                        mat.needsUpdate = true;
                    });
                } else {
                    child.material.color.setHex(0x3498DB);
                    child.material.needsUpdate = true;
                }
            }
        });

        jugadorLocal.position.copy(camera.position);
        scene.add(jugadorLocal);
        return jugadorLocal;
    } catch (error) {
        console.error("❌ Error creando jugador local:", error);
        return null;
    }
}

export function actualizarJugadorLocal() {
    if (!jugadorLocal) return;
    jugadorLocal.position.copy(camera.position);
    jugadorLocal.position.y -= 0.5;
    jugadorLocal.rotation.y = camera.rotation.y;
}

// ---------- Jugador remoto ----------
export async function crearJugadorRemoto(id) {
    try {
        if (!modeloXbot) return crearJugadorSimple(id);

        const jugador = modeloXbot.clone();
        jugador.scale.set(0.5, 0.5, 0.5);

        const colores = [0xE74C3C, 0x2ECC71, 0xF39C12, 0x9B59B6, 0x1ABC9C, 0xE67E22];
        const colorIndex = parseInt(id) % colores.length;

        jugador.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                        mat.color.setHex(colores[colorIndex]);
                        mat.needsUpdate = true;
                    });
                } else {
                    child.material.color.setHex(colores[colorIndex]);
                    child.material.needsUpdate = true;
                }
            }
        });

        jugador.position.set(0, -100, 0);
        jugador.visible = false;
        scene.add(jugador);
        otrosJugadores[id] = jugador;
        return jugador;
    } catch (error) {
        console.error(`❌ Error creando jugador ${id}:`, error);
        return crearJugadorSimple(id);
    }
}

export function crearJugadorSimple(id) {
    console.log(`🔷 Creando jugador simple ${id}`);
    const grupo = new THREE.Group();
    const colores = [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0x96CEB4, 0xFFEAA7, 0xDDA0DD];
    const color = colores[parseInt(id) % colores.length];

    const cuerpo = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.8, 0.4),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.1 })
    );
    cuerpo.position.y = 0.4;
    grupo.add(cuerpo);

    const cabeza = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xFFD700 })
    );
    cabeza.position.y = 0.9;
    grupo.add(cabeza);

    grupo.position.set(0, -2, 0);
    scene.add(grupo);
    otrosJugadores[id] = grupo;
    return grupo;
}

// ---------- Callbacks globales (red) ----------
window.updatePlayerPosition = async function(id, position) {
    if (!otrosJugadores[id]) await crearJugadorRemoto(id);
    const mesh = otrosJugadores[id];
    if (!mesh) return;
    mesh.position.set(position.x, position.y, position.z);
    mesh.visible = true;
};

window.removePlayer = function(id) {
    console.log(`🗑️ Eliminando jugador ${id}`);
    if (otrosJugadores[id]) {
        scene.remove(otrosJugadores[id]);
        try {
            otrosJugadores[id].traverse((child) => {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
            });
        } catch (e) {
            console.warn("Error limpiando recursos:", e);
        }
        delete otrosJugadores[id];
    }
};

window.crearJugadorPrueba = async function() {
    await cargarXbot();
    const jugador = await crearJugadorRemoto('prueba');
    if (jugador) {
        const frente = new THREE.Vector3(0, 0, -3);
        frente.applyQuaternion(camera.quaternion);
        jugador.position.copy(camera.position).add(frente);
        jugador.position.y = getAlturaReal(jugador.position.x, jugador.position.z) + 0.5;
        jugador.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                        mat.color.setHex(0xFF0000);
                        mat.needsUpdate = true;
                    });
                } else {
                    child.material.color.setHex(0xFF0000);
                    child.material.needsUpdate = true;
                }
            }
        });
        return jugador;
    }
};

export async function precargarXbot() {
    try {
        console.log("🔧 Precargando Xbot...");
        await cargarXbot();
        console.log("✅ Xbot precargado exitosamente");
        return true;
    } catch (error) {
        console.error('❌ Error precargando Xbot:', error);
        return false;
    }
}
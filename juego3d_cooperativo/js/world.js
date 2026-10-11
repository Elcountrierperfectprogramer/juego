// world.js
import * as THREE from "../../assets/modulos/three.module.js";
import { scene, camera } from './scene.js';
import { state, ancho } from './state.js';
import { getAlturaReal } from './utils.js';
import { settings } from './settings.js';
import { CALIDAD, onCalidadCambia } from './performance.js';

// ============================================
// TEXTURA Y MATERIAL DEL TERRENO
// ============================================

const texturaPlano = new THREE.TextureLoader().load('../../assets/Texturas/pexels.jpg');
texturaPlano.repeat.set(8, 8);
texturaPlano.wrapS = THREE.RepeatWrapping;
texturaPlano.wrapT = THREE.RepeatWrapping;

const material = new THREE.MeshStandardMaterial({
    map: texturaPlano,
    roughness: 0.9,
    flatShading: false,
    side: THREE.DoubleSide
});

// ============================================
// ESTADO
// ============================================

let distanciaChunks = 2;
// world.js — al principio
const chunksEnEscena = new Map();   // clave → mesh

// ============================================
// CALIDAD ADAPTATIVA
// ============================================

onCalidadCambia((calidad) => {
    if (calidad === CALIDAD.BAJA) {
        distanciaChunks = 1;
        texturaPlano.repeat.set(4, 4);
    } else if (calidad === CALIDAD.MEDIA) {
        distanciaChunks = 2;
        texturaPlano.repeat.set(8, 8);
    } else {
        distanciaChunks = 3;
        texturaPlano.repeat.set(16, 16);
    }
    texturaPlano.needsUpdate = true;
    console.log(`🌍 Distancia de chunks ajustada a: ${distanciaChunks}`);
});

// ============================================
// CARGAR MUNDO DEL SERVIDOR
// ============================================

export async function cargarMundoDelServidor() {
    try {
        const serverIP = window.location.hostname || 'localhost';
        const response = await fetch('http://' + serverIP + ':3000/api/world');
        const data = await response.json();

        if (data && data.world) {
            state.mundoGenerado = data.world;
            if (data && data.chunks) {
                state.ChunksGenerados = data.chunks;
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ Error al cargar el mundo:', error);
        return false;
    }
}

// ============================================
// APLICAR CHUNKS
// ============================================

export function aplicarVerticesDelServidor() {
    if (!state.ChunksGenerados) {
        console.warn('⚠️ No hay chunks');
        return false;
    }

    const camaraChunkX = Math.floor(camera.position.x / ancho);
    const camaraChunkZ = Math.floor(camera.position.z / ancho);

    // 🔑 Calcular qué chunks DEBERÍAN estar en escena ahora
    const chunksDeseados = new Set();

    for (let key in state.ChunksGenerados) {
        const actual = state.ChunksGenerados[key];
        const distChunks = Math.max(
            Math.abs(actual.chunkX - camaraChunkX),
            Math.abs(actual.chunkZ - camaraChunkZ)
        );

        if (distChunks <= distanciaChunks) {
            chunksDeseados.add(key);
        }
    }

    // 🔑 1. Quitar los chunks que ya no están cerca
    for (const [key, mesh] of chunksEnEscena) {
        if (!chunksDeseados.has(key)) {
            scene.remove(mesh);
            mesh.geometry.dispose();
            // 🔑 Quitar de objetosColision
            const idx = state.objetosColision.indexOf(mesh);
            if (idx !== -1) state.objetosColision.splice(idx, 1);
            chunksEnEscena.delete(key);
        }
    }

    // 🔑 2. Crear los chunks nuevos
    for (const key of chunksDeseados) {
        if (chunksEnEscena.has(key)) continue;   // ya está

        const actual = state.ChunksGenerados[key];
        const Vertices = actual.vertices;

        const Geometry = new THREE.PlaneGeometry(ancho, ancho, 4, 4);
        Geometry.rotateX(-Math.PI / 2);
        const Positions = Geometry.attributes.position.array;

        for (let i = 0; i < Positions.length; i += 3) {
            Positions[i + 1] = Vertices[i + 1] ?? 0;
        }

        Geometry.attributes.position.needsUpdate = true;
        Geometry.computeVertexNormals();

        const Plane = new THREE.Mesh(Geometry, material);
        Plane.position.set(actual.chunkX * ancho, 0.5, actual.chunkZ * ancho);
        scene.add(Plane);
        state.objetosColision.push(Plane);

        chunksEnEscena.set(key, Plane);
    }

    return true;
}

// ---------- Terreno local de respaldo ----------
export function generarTerrenoLocal() {
    console.log('🌍 Generando terreno local...');

    class _RandomWraper {
        constructor() { this._values = {}; }
        _Rand(x, y) {
            const k = x + '.' + y;
            if (!(k in this._values)) this._values[k] = Math.random();
            return this._values[k] || 0;
        }
        noise2D(x, y) {
            const x1 = Math.floor(x), y1 = Math.floor(y);
            const x2 = x1 + 1, y2 = y1 + 1;
            const xp = x - x1, yp = y - y1;
            const p11 = this._Rand(x1, y1);
            const p21 = this._Rand(x2, y1);
            const p12 = this._Rand(x1, y2);
            const p22 = this._Rand(x2, y2);
            const px1 = lerp(p11, p21, xp);
            const px2 = lerp(p12, p22, xp);
            return lerp(px1, px2, yp);
        }
    }
    function lerp(a, b, t) { return a + (b - a) * t; }

    const ruido = new _RandomWraper();
    const positions = geometry.attributes.position.array;
    const verticesPorFila = 5;

    for (let row = 0; row < verticesPorFila; row++) {
        for (let col = 0; col < verticesPorFila; col++) {
            const index = (row * verticesPorFila + col) * 3;
            const x = positions[index];
            const z = positions[index + 2];
            const ruidoValor = ruido.noise2D(x * 0.5, z * 0.5);
            const altura = (ruidoValor - 0.5) * 3;
            positions[index + 2] = altura + 0.1;
        }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    console.log('✅ Terreno local generado');
}
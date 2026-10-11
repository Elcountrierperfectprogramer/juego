// objects.js
import * as THREE from "../../assets/modulos/three.module.js";
import { GLTFLoader } from "../../assets/modulos/GLTFLoader.js";
import { OBJLoader } from "../../assets/modulos/OBJLoader.js";
import { scene } from './scene.js';
import { state } from './state.js';
import { getAlturaReal, generateRandIsla } from './utils.js';
import { settings } from './settings.js';

const Textura = new THREE.TextureLoader().load(
    '../../assets/modelos/Rock1/rock-texture-surface.jpg'
);

function aplicarTextura(roca) {
    let mesh = null;
    roca.traverse((child) => {
        if (child.name === "Cube") mesh = child;
    });
    if (mesh) {
        mesh.material.map = Textura;
        mesh.material.color.set(1, 1, 1);
        mesh.material.emissive.set(0, 0, 0);
        mesh.material.needsUpdate = true;
    }
}

// ---------- Cargar objetos del servidor ----------
export function cargarObjetosDelServidor() {
    if (!state.mundoGenerado) return;

    // ── Árboles ──
    const loaderArbol = new GLTFLoader();
    loaderArbol.load('../../assets/modelos/arbol.glb', (gltf) => {
        for (const pos of state.mundoGenerado.trees) {
            const arbol = gltf.scene.clone();
            const altura = getAlturaReal(pos.x, pos.z);
            arbol.position.set(pos.x, altura, pos.z);
            arbol.scale.set(1, 1, 1);
            arbol.userData = { tipo: 'arbol', vida: 3, vidaMax: 3 };
            scene.add(arbol);
            state.ListaArboles.push(arbol);
        }
		
		// objects.js — dentro de cargarObjetosDelServidor, en el bloque de árboles
for (const key in state.ChunksGenerados) {
    const chunk = state.ChunksGenerados[key];
    if (!chunk.trees) continue;

    for (const pos of chunk.trees) {
        const arbol = gltf.scene.clone();
        const altura = getAlturaReal(pos.x, pos.z);
        arbol.position.set(pos.x, altura, pos.z);
        arbol.scale.set(1, 1, 1);
        arbol.userData = { tipo: 'arbol', vida: 3, vidaMax: 3 };
        scene.add(arbol);
        state.ListaArboles.push(arbol);
    }
}
    });

    // ── Rocas (todas) ──
    const loaderPiedra = new GLTFLoader();
    loaderPiedra.load('../assets/modelos/Rock1/Rock1.glb', (Piedra) => {
        const plano = Piedra.scene.children[0].children.find(c => c.name === "Plane");
        if (plano && plano.parent) plano.parent.remove(plano);

        // Rocas pequeñas del servidor → ListaRocas
        for (const pos of state.mundoGenerado.rocks) {
    const roca = Piedra.scene.clone();
    const altura = getAlturaReal(pos.x, pos.z);
    roca.position.set(pos.x, altura, pos.z);

    if (pos.esGrande) {
        roca.scale.set(1.5, 1.5, 1.5);
        roca.userData = { tipo: 'rocaGrande', vida: 5, vidaMax: 5 };
        state.ListaRocasGrandes.push(roca);
    } else {
        roca.scale.set(0.0625, 0.0625, 0.0625);
        state.ListaRocas.push(roca);
    }

    aplicarTextura(roca);
    scene.add(roca);
}

        // Rocas grandes del servidor → ListaRocasGrandes
        // (si quieres generarlas también desde el servidor)
        for (let i = 0; i < settings.Rocks; i++) {
            const roca = Piedra.scene.clone();
            const X = generateRandIsla();
            const Z = generateRandIsla();
            roca.position.set(X, getAlturaReal(X, Z), Z);
            roca.scale.set(1.5, 1.5, 1.5);
            aplicarTextura(roca);
            roca.userData = { tipo: 'rocaGrande', vida: 5, vidaMax: 5 };
            scene.add(roca);
            state.ListaRocasGrandes.push(roca);
        }
    });

    // ── Ramas ──
    const RamaLoader = new OBJLoader();
    RamaLoader.load(
        '../assets/modelos/Cherry_tree_branch_v2_L2.123c8ae81e46-89f9-402b-9451-7388109579dd/12975_Cherry_tree_branch_v2_l2.obj',
        (obj) => {
            for (const pos of state.mundoGenerado.branches) {
                const rama = obj.clone();
                const altura = getAlturaReal(pos.x, pos.z);
                rama.scale.set(0.125, 0.125, 0.125);
                rama.position.set(pos.x, altura, pos.z);
                state.ListaRamas.push(rama);
                scene.add(rama);
            }
        }
    );
}

// ---------- Carga de objetos locales (respaldo) ----------
export function cargarObjetosLocales() {
    // Árboles
    const loaderArbol = new GLTFLoader();
    loaderArbol.load('../../assets/modelos/arbol.glb', (gltf) => {
        for (let i = 0; i < settings.trees; i++) {          // ← settings, no mundoGenerado
            const arbol = gltf.scene.clone();
            const X = generateRandIsla();
            const Z = generateRandIsla();
            const altura = getAlturaReal(X, Z);
            arbol.position.set(X, altura, Z);
            arbol.scale.set(1, 1, 1);
            arbol.userData = { tipo: 'arbol', vida: 3, vidaMax: 3 };
            scene.add(arbol);
            state.ListaArboles.push(arbol);
        }
    });

    // Rocas
    const LoaderPiedra = new GLTFLoader();
    LoaderPiedra.load('../assets/modelos/Rock1/Rock1.glb', (Piedra) => {
        const plano = Piedra.scene.children[0].children.find(c => c.name === "Plane");
        if (plano && plano.parent) plano.parent.remove(plano);

        const piedraBase = Piedra.scene;
        aplicarTextura(piedraBase);

        for (let i = 0; i < settings.Rocks; i++) {
            const roca = Piedra.scene.clone();
            roca.position.set(generateRandIsla(), 1, generateRandIsla());
            aplicarTextura(roca);
            scene.add(roca);
            state.ListaRocas.push(roca);   // ← también a la lista
        }

        for (let i = 0; i < settings.SmallRocks; i++) {
            const roca = Piedra.scene.clone();
            const X = generateRandIsla();
            const Z = generateRandIsla();
            roca.scale.set(0.0625, 0.0625, 0.0625);
            roca.position.set(X, getAlturaReal(X, Z), Z);
            aplicarTextura(roca);
            state.ListaRocas.push(roca);
            scene.add(roca);
        }
    });

    // Ramas
    const RamaLoader = new OBJLoader();
    RamaLoader.load(
        '../assets/modelos/Cherry_tree_branch_v2_L2.123c8ae81e46-89f9-402b-9451-7388109579dd/12975_Cherry_tree_branch_v2_l2.obj',
        (obj) => {
            for (let i = 0; i < settings.CherryTreeBrands; i++) {
                const Rama = obj.clone();
                Rama.scale.set(0.125, 0.125, 0.125);
                Rama.position.set(generateRandIsla(), 1, generateRandIsla());
                Rama.position.y = getAlturaReal(Rama.position.x, Rama.position.z);
                state.ListaRamas.push(Rama);
                scene.add(Rama);
            }
        }
    );
}
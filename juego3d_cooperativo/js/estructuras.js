// estructuras.js
import * as THREE from "../../assets/modulos/three.module.js";
import { scene, camera } from './scene.js';
import { state } from './state.js';
import { getAlturaReal } from './utils.js';
import { playSonido } from './audio.js';

// ============================================
// CONFIGURACIÓN
// ============================================

const TAMANO_CASA = 8;      // ancho y largo (8x8)
const ALTURA_PARED = 3.5;   // alto de las paredes
const GROSOR_PARED = 0.4;   // grosor

// Colores
const COLOR_PARED = 0x6b6b6b;    // gris cemento
const COLOR_TECHO = 0x4a4a4a;    // gris oscuro
const COLOR_MADERA = 0x5a3a1a;   // marrón

// ============================================
// CREAR EL MODELO DE LA CASA
// ============================================

function crearModeloCasa() {
    const grupo = new THREE.Group();

    // Materiales
    const matPared = new THREE.MeshStandardMaterial({
        color: COLOR_PARED,
        roughness: 0.95,
        metalness: 0.05
    });
    const matTecho = new THREE.MeshStandardMaterial({
        color: COLOR_TECHO,
        roughness: 0.9
    });

    const mitad = TAMANO_CASA / 2;

    // ── Pared trasera (norte) ──
    const geoPared = new THREE.BoxGeometry(TAMANO_CASA, ALTURA_PARED, GROSOR_PARED);
    const paredNorte = new THREE.Mesh(geoPared, matPared);
    paredNorte.position.set(0, ALTURA_PARED / 2, -mitad);
    grupo.add(paredNorte);

    // ── Pared izquierda (oeste) ──
    const geoParedLado = new THREE.BoxGeometry(GROSOR_PARED, ALTURA_PARED, TAMANO_CASA);
    const paredOeste = new THREE.Mesh(geoParedLado, matPared);
    paredOeste.position.set(-mitad, ALTURA_PARED / 2, 0);
    grupo.add(paredOeste);

    // ── Pared derecha (este) ──
    const paredEste = new THREE.Mesh(geoParedLado, matPared);
    paredEste.position.set(mitad, ALTURA_PARED / 2, 0);
    grupo.add(paredEste);

    // ── Pared frontal (sur) con puerta ──
    // Hacemos 3 trozos: izquierdo + derecho + dintel (encima de la puerta)
    const anchoPuerta = 2.0;
    const altoPuerta = 2.5;
    const anchoLateral = (TAMANO_CASA - anchoPuerta) / 2;

    const geoParedFrente = new THREE.BoxGeometry(anchoLateral, ALTURA_PARED, GROSOR_PARED);

    const paredSurIzq = new THREE.Mesh(geoParedFrente, matPared);
    paredSurIzq.position.set(-mitad + anchoLateral / 2, ALTURA_PARED / 2, mitad);
    grupo.add(paredSurIzq);

    const paredSurDer = new THREE.Mesh(geoParedFrente, matPared);
    paredSurDer.position.set(mitad - anchoLateral / 2, ALTURA_PARED / 2, mitad);
    grupo.add(paredSurDer);

    // Dintel (encima de la puerta)
    const geoDintel = new THREE.BoxGeometry(anchoPuerta, ALTURA_PARED - altoPuerta, GROSOR_PARED);
    const dintel = new THREE.Mesh(geoDintel, matPared);
    dintel.position.set(0, altoPuerta + (ALTURA_PARED - altoPuerta) / 2, mitad);
    grupo.add(dintel);

    // ── Techo ──
    const geoTecho = new THREE.BoxGeometry(TAMANO_CASA + 0.6, GROSOR_PARED, TAMANO_CASA + 0.6);
    const techo = new THREE.Mesh(geoTecho, matTecho);
    techo.position.set(0, ALTURA_PARED + GROSOR_PARED / 2, 0);
    grupo.add(techo);

    return grupo;
}

// ============================================
// COLOCAR UNA CASA EN EL MUNDO
// ============================================

export function crearCasa(x, z, rotacionY = 0, id = null) {
    const casa = crearModeloCasa();

    const altura = getAlturaReal(x, z);
    casa.position.set(x, altura + 0.5, z);
    casa.rotation.y = rotacionY;

    casa.userData = {
        tipo: 'casa',
        id: id || `casa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        x: x,
        z: z
    };

    scene.add(casa);
    state.ListaCasas.push(casa);

    // 🔑 Añadir los pisos del interior a colisiones (para que el raycast funcione)
    state.objetosColision.push(casa);

    return casa;
}

// ============================================
// GENERAR VARIAS CASAS (para probar)
// ============================================

// estructuras.js
// estructuras.js
export function generarCasasDePrueba() {
    console.log('🏚️ Generando casas de prueba...');

    // Casa 1
    const casa1 = crearCasa(15, 10, 0);
    crearCofre(13, 8, 0);      // dentro, esquina noroeste
    crearCofre(17, 12, Math.PI); // dentro, esquina sureste

    // Casa 2
    const casa2 = crearCasa(-20, 15, Math.PI / 2);
    crearCofre(-22, 13, Math.PI / 2);

    // Casa 3
    const casa3 = crearCasa(10, -25, Math.PI);
    crearCofre(8, -27, Math.PI);
    crearCofre(12, -27, Math.PI);

    console.log(`✅ ${state.ListaCasas.length} casas y ${state.ListaCofres.length} cofres generados`);
}

// estructuras.js — al final del archivo

// ============================================
// COFRES
// ============================================

const COLOR_COFRE = 0x5a3a1a;
const COLOR_COFRE_ABIERTO = 0x2a1a0a;

function crearModeloCofre(abierto = false) {
    const grupo = new THREE.Group();

    const matMadera = new THREE.MeshStandardMaterial({
        color: abierto ? COLOR_COFRE_ABIERTO : COLOR_COFRE,
        roughness: 0.9
    });
    const matMetal = new THREE.MeshStandardMaterial({
        color: 0x8b7355,
        roughness: 0.6,
        metalness: 0.4
    });

    // Cuerpo del cofre
    const geoCuerpo = new THREE.BoxGeometry(1.0, 0.6, 0.7);
    const cuerpo = new THREE.Mesh(geoCuerpo, matMadera);
    cuerpo.position.y = 0.3;
    grupo.add(cuerpo);

    // Tapa (un poco más ancha)
    const geoTapa = new THREE.BoxGeometry(1.05, 0.15, 0.75);
    const tapa = new THREE.Mesh(geoTapa, matMadera);

    if (abierto) {
        // Tapa girada hacia atrás
        tapa.position.set(0, 0.65, -0.3);
        tapa.rotation.x = -Math.PI / 3;
    } else {
        // Tapa cerrada
        tapa.position.y = 0.65;
    }
    grupo.add(tapa);

    // Detalle metálico (cerradura)
    const geoCerradura = new THREE.BoxGeometry(0.15, 0.15, 0.05);
    const cerradura = new THREE.Mesh(geoCerradura, matMetal);
    cerradura.position.set(0, 0.35, 0.36);
    grupo.add(cerradura);

    return grupo;
}

export function crearCofre(x, z, rotacionY = 0, id = null) {
    const cofre = crearModeloCofre(false);

    const altura = getAlturaReal(x, z);
    cofre.position.set(x, altura, z);
    cofre.rotation.y = rotacionY;

    cofre.userData = {
        tipo: 'cofre',
        id: id || `cofre_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        abierto: false,
        x: x,
        z: z
    };

    scene.add(cofre);
    state.ListaCofres.push(cofre);

    return cofre;
}

// ============================================
// ABRIR UN COFRE
// ============================================

export function abrirCofre(cofre) {
    if (!cofre || !cofre.userData) return false;
    if (cofre.userData.abierto) return false;

    // 🔑 Marcar como abierto
    cofre.userData.abierto = true;

    // 🔑 Cambiar el modelo a "abierto"
    const pos = cofre.position.clone();
    const rot = cofre.rotation.y;
    const id = cofre.userData.id;

    // Quitar el modelo viejo
    scene.remove(cofre);
    const idx = state.ListaCofres.indexOf(cofre);
    if (idx !== -1) state.ListaCofres.splice(idx, 1);

    // Crear el nuevo modelo abierto
    const cofreAbierto = crearModeloCofre(true);
    cofreAbierto.position.copy(pos);
    cofreAbierto.rotation.y = rot;
    cofreAbierto.userData = {
        tipo: 'cofre',
        id: id,
        abierto: true,
        x: pos.x,
        z: pos.z
    };

    scene.add(cofreAbierto);
    state.ListaCofres.push(cofreAbierto);

    return true;
}

// estructuras.js — al final
export function crearCasasDeChunks() {
    if (!state.ChunksGenerados) return;

    let totalCasas = 0;
    let totalCofres = 0;

    for (const key in state.ChunksGenerados) {
        const chunk = state.ChunksGenerados[key];
        if (!chunk.casas || chunk.casas.length === 0) continue;

        for (const casaData of chunk.casas) {
            // Crear la casa
            const casa = crearCasa(casaData.x, casaData.z, casaData.rot);
            totalCasas++;

            // Crear sus cofres
            if (casaData.cofres) {
                for (const cofreData of casaData.cofres) {
                    // 🔑 Los cofres están DENTRO de la casa. Calculamos su posición
                    // en coordenadas del mundo a partir del offset relativo + rotación.
                    const offsetLocal = new THREE.Vector3(cofreData.offsetX, 0, cofreData.offsetZ);

                    // Rotar el offset según la rotación de la casa
                    offsetLocal.applyAxisAngle(new THREE.Vector3(0, 1, 0), casaData.rot);

                    const cofreX = casaData.x + offsetLocal.x;
                    const cofreZ = casaData.z + offsetLocal.z;

                    crearCofre(cofreX, cofreZ, cofreData.offsetRot);
                    totalCofres++;
                }
            }
        }
    }

    console.log(`🏚️ ${totalCasas} casas y ${totalCofres} cofres generados en chunks`);
}
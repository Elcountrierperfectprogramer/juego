// main.js
// main.js
if ('serviceWorker' in navigator) {
    // 🔑 Detectar la ruta base automáticamente
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    navigator.serviceWorker.register(basePath + 'service-worker.js')
        .then(() => console.log('✅ Service Worker registrado'))
        .catch(e => console.error('❌ Error registrando Service Worker:', e));
}

import * as THREE from "../../assets/modulos/three.module.js";
import { scene, camera, renderer, terreno } from './scene.js';
import { state } from './state.js';
import { getAlturaReal, generateRandIsla } from './utils.js';
import { cargarMundoDelServidor, aplicarVerticesDelServidor, generarTerrenoLocal } from './world.js';
import { cargarObjetosDelServidor, cargarObjetosLocales } from './objects.js';
import { VerifyDist } from './collection.js';
import { actualizarJugadorLocal, precargarXbot, mixer } from './players.js';
import { getNetwork, sendMyPosition } from './network.js';
import { gameState, hideStart, PosDiv } from './menu.js';
import { getJoydeltaX, getJoydeltaY, getRotationDelta } from './input.js';
import { settings } from './settings.js';
import { precargarSonidos } from './audio.js';
import { initDayNight, updateDayNight, getFaseDelDia } from './daynight.js';
import { updateDrops } from './drops.js';
// main.js
import {
    updatePrevisualizacion,
    updateFogatas,
    confirmarColocacion,
    activarModoColocacion
} from './fogata.js';
import {
    activarModoColocacionPiso,
    confirmarColocacionPiso,
    updatePrevisualizacionPiso
} from './piso.js';
import { generarCasasDePrueba, abrirCofre, crearCasasDeChunks } from './estructuras.js';
import { crearBotonDisparo, actualizarBotonDisparo } from './disparo.js';
// main.js
import { medirFPS } from './performance.js';
// main.js
import { updateBots, generarBotsDePrueba } from './bots.js';

// Exponer global para pruebas
window.activarModoColocacion = activarModoColocacion;
window.confirmarColocacion = confirmarColocacion;


const velocidad = settings.velocity;
let velocidadY = 0;
const gravedad = -0.5;
const clock = new THREE.Clock();

let frameContador = 0;

// ---------- INICIALIZACIÓN ----------
async function init() {
	precargarSonidos();   // 🔑 añade esto al principio
    console.log('🔧 Inicializando...');
	
// 🔑 Inicializar ciclo día/noche ANTES del mundo
    initDayNight();
	
    const mundoCargado = await cargarMundoDelServidor();
    console.log("El mundo Cargado es: " + mundoCargado);

    if (mundoCargado && state.mundoGenerado) {
        console.log('🌍 Usando mundo del servidor');
        aplicarVerticesDelServidor();

        settings.trees = state.mundoGenerado.settings.trees;
        settings.Rocks = state.mundoGenerado.settings.rocks;
        settings.SmallRocks = state.mundoGenerado.settings.smallRocks;
        settings.CherryTreeBrands = state.mundoGenerado.settings.cherryTreeBrands;

        cargarObjetosDelServidor();     // ← SOLO aquí
		
		// 🔑 Generar casas DESPUÉS de cargar objetos
        // 🔑 En lugar de casas de prueba, generar las de chunks
// main.js — dentro de init()
crearCasasDeChunks();
crearBotonDisparo();
generarBotsDePrueba();   // 🔑 nuevo

crearBotonDisparo();
    } else {
        console.log('🌍 Usando mundo local (sin servidor)');
        generarTerrenoLocal();
        cargarObjetosLocales();         // ← SOLO aquí
    }

    // ❌ BORRA la línea de cargarObjetosLocales() que tenías aquí suelta
}

// ---------- UPDATE ----------
export function update() {
    velocidadY += gravedad * 0.1;
    camera.position.y += velocidadY;

    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
	
	// 🔑 Actualizar ciclo día/noche
    updateDayNight(delta);
	updateDrops(delta);       // 🔑 animar los drops flotando
	updatePrevisualizacion();      // 🔑 mover la previsualización
	updatePrevisualizacionPiso();   // 🔑 nueva
    updateFogatas(delta);          // 🔑 parpadeo de las luces
	updateBots(delta);   // 🔑 nuevop
	
	// ============================================
// SISTEMA DE FRÍO — VERSIÓN 1 (con logs)
// ============================================

const FRIO_POR_SEGUNDO     = 0.4;
const CALOR_FOGATA         = 3.0;
const RADIO_FOGATA_CALOR   = 8;

let deltaFrio = 0;

// 1. ¿Es de noche?
const noche = window.esDeNoche ? window.esDeNoche() : false;
if (noche) {
    deltaFrio -= FRIO_POR_SEGUNDO;
}
// 1.5. De día, si NO estás en nieve, recuperas calor
if (!noche) {
    deltaFrio += 0.5;   // recuperas 0.5 por segundo de día
}

// 2. ¿Hay fogata cerca?
let cercaDeFogata = false;
for (const fogata of state.ListaFogatas) {
    if (!fogata.userData.encendida) continue;

    const dx = camera.position.x - fogata.position.x;
    const dz = camera.position.z - fogata.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist < RADIO_FOGATA_CALOR) {
        const intensidad = 1 - (dist / RADIO_FOGATA_CALOR);
        deltaFrio += CALOR_FOGATA * intensidad;
        cercaDeFogata = true;
    }
}

// 3. Aplicar
const frioAntes = settings.frio;
settings.frio = Math.max(0, Math.min(
    settings.frioMax,
    settings.frio + deltaFrio * delta
));

// 4. LOG cada vez que cambia el frío (solo si cambia de entero)

// 5. Daño si el frío llega a 0
if (settings.frio <= 0) {
    settings.health = Math.max(0, settings.health - 0.3 * delta);
}
	
	if (typeof updateDayNightHUD === 'function') updateDayNightHUD();

    const alturaSueloReal = getAlturaReal(camera.position.x, camera.position.z) + 1.25;

    if (camera.position.y < alturaSueloReal) {
        camera.position.y = alturaSueloReal;
        velocidadY = 0;
    }

    PosDiv.innerHTML = "X: " + Math.floor(camera.position.x) +
                       ", Y: " + Math.floor(camera.position.y) +
                       ", Z: " + Math.floor(camera.position.z);
					   
	
	frameContador++;
if (frameContador % 3 === 0) {   // 🔑 solo cada 3 frames
    VerifyDist();
}

    const network = getNetwork();
    if (network && network.isConnected) {
        sendMyPosition(camera.position.x, camera.position.y, camera.position.z);
    }

    actualizarJugadorLocal();
	actualizarBotonDisparo();
	
	medirFPS();   // 🔑 medir cada frame
}

// ---------- ANIMATE ----------
export function animate() {
    if (gameState.value === "jugando") {
        update();

        const joyX = getJoydeltaX();
        const joyY = getJoydeltaY();
        const { dx, dy } = getRotationDelta();

        camera.rotation.y -= dx * settings.sensibility;
        camera.rotation.x -= dy * settings.sensibility;
        camera.rotation.x = Math.min(Math.max(camera.rotation.x, -1.2), 1.2);

        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

        camera.position.x += (forward.x * joyY + right.x * -joyX) * velocidad;
        camera.position.z += (forward.z * joyY + right.z * -joyX) * velocidad;

        actualizarJugadorLocal();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
}

window.animate = animate;
window.state = state;
window.settings = settings;

// Exponer para el inventario
window.activarModoColocacionPiso = activarModoColocacionPiso;
window.confirmarColocacionPiso = confirmarColocacionPiso;

console.log('🔧 Debug expuesto: window.state, window.settings');

// ---------- ARRANQUE ----------
setTimeout(() => { init(); }, 1000);

setInterval(() => {
    cargarMundoDelServidor();
    aplicarVerticesDelServidor();
    terreno.position.set(camera.position.x, terreno.position.y, camera.position.z);
	
	// Contar cuántos objetos hay en la escena con material "brillante"
}, 2000);


// main.js — al final, después del otro setInterval

hideStart();
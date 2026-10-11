// collection.js
// collection.js
import { scene, camera } from './scene.js';
import { state } from './state.js';
import { Recolect, recolectarRama, recolectarRoca, recolectarPiedra, recolectarTronco, mostrarMensaje, recolectarChatarra, recolectarMetal } from './menu.js';
import { tieneItem, addItem, createItem, saveInventory, isFull, quitarItemPorNombre } from './inventory.js';   // 🔑 ampliado
import { talarArbol, minarRoca, encenderFogataServidor} from './network.js';
import { playSonido } from './audio.js';
import { quitarDrop } from './drops.js';
import { encenderFogataMesh } from './fogata.js';
import { abrirCofre } from './estructuras.js';                                            // 🔑 nuevo

function distanciaA(obj) {
    const dx = camera.position.x - obj.position.x;
    const dy = camera.position.y - obj.position.y;
    const dz = camera.position.z - obj.position.z;
    return Math.hypot(dx, dy, dz);
}

function quitarDeEscena(obj, lista) {
    scene.remove(obj);
    if (obj.parent) obj.parent.remove(obj);
    const idx = lista.indexOf(obj);
    if (idx !== -1) lista.splice(idx, 1);
}

function limpiarSeleccion() {
    state.ObjetoCercano = null;
    state.MinDist = Infinity;
    Recolect.style.display = 'none';
}

// Sacudida visual rápida
function sacudir(obj) {
    const originalX = obj.position.x;
    const originalZ = obj.position.z;

    let frames = 0;
    const anim = () => {
        frames++;
        const offset = Math.sin(frames * 0.8) * 0.05;
        obj.position.x = originalX + offset;
        obj.position.z = originalZ + offset;
        if (frames < 12) {
            requestAnimationFrame(anim);
        } else {
            obj.position.x = originalX;
            obj.position.z = originalZ;
        }
    };
    anim();
}

const DISTANCIA_MAX = 3;

function actualizarTextoRecolect() {
    const textos = {
        'arbol':      '🪓 Talar',
        'rocaGrande': '⛏️ Minar',
        'roca':       '🪨 Recoger roca',
        'rama':       '🌿 Recoger rama',
        'drop':       '📦 Recoger',
        'fogata':     '🔥 Encender',
		'cofre': '🪙 Registrar'
    };

    const texto = textos[state.TipoCercano] || '👋 Recolectar';

    if (Recolect.tagName === 'IMG') {
        Recolect.alt = texto;
        Recolect.title = texto;
        return;
    }

    if (Recolect.textContent !== texto) {
        Recolect.textContent = texto;
    }
}

// Verificar distancias de ramas Y rocas
export function VerifyDist() {
    state.MinDist = Infinity;
    state.ObjetoCercano = null;
    state.TipoCercano = null;

    // Ramas
    for (const rama of state.ListaRamas) {
        const dist = distanciaA(rama);
        if (dist < state.MinDist) {
            state.MinDist = dist;
            state.ObjetoCercano = rama;
            state.TipoCercano = 'rama';
        }
    }

    // Rocas
    for (const roca of state.ListaRocas) {
        const dist = distanciaA(roca);
        if (dist < state.MinDist) {
            state.MinDist = dist;
            state.ObjetoCercano = roca;
            state.TipoCercano = 'roca';
        }
    }
	
	// Rocas grandes
for (const roca of state.ListaRocasGrandes) {
    const dist = distanciaA(roca);
    if (dist < state.MinDist) {
        state.MinDist = dist;
        state.ObjetoCercano = roca;
        state.TipoCercano = 'rocaGrande';
    }
}
	
	// Árboles (radio más grande, son objetos grandes)
    for (const obj of state.ListaArboles) {
        const dist = distanciaA(obj);
        if (dist < state.MinDist) {
            state.MinDist = dist;
            state.ObjetoCercano = obj;
            state.TipoCercano = 'arbol';
        }
    }
	
	// collection.js — dentro de VerifyDist, añade un bloque más
// Drops en el suelo
for (const drop of state.ListaDrops) {
    const dist = distanciaA(drop);
    if (dist < state.MinDist) {
        state.MinDist = dist;
        state.ObjetoCercano = drop;
        state.TipoCercano = 'drop';
    }
}

// Fogatas apagadas
for (const fogata of state.ListaFogatas) {
    if (fogata.userData.encendida) continue;
    const dist = distanciaA(fogata);
    if (dist < state.MinDist) {
        state.MinDist = dist;
        state.ObjetoCercano = fogata;
        state.TipoCercano = 'fogata';
    }
}

// collection.js — dentro de VerifyDist
// Cofres
for (const cofre of state.ListaCofres) {
    if (cofre.userData.abierto) continue;   // saltar los ya abiertos
    const dist = distanciaA(cofre);
    if (dist < state.MinDist) {
        state.MinDist = dist;
        state.ObjetoCercano = cofre;
        state.TipoCercano = 'cofre';
    }
}

    // Radio según el tipo
// collection.js — al final de VerifyDist
let RADIO = 3;
if (state.TipoCercano === 'arbol')      RADIO = 4;
if (state.TipoCercano === 'rocaGrande') RADIO = 4;
if (state.TipoCercano === 'drop')       RADIO = 1.5;
if (state.TipoCercano === 'fogata')     RADIO = 3;   // 🔑 nuevo
if (state.TipoCercano === 'cofre') RADIO = 2.5;

Recolect.style.display =
    (state.ObjetoCercano && state.MinDist < RADIO) ? 'block' : 'none';

// 🔑 Cambiar el texto
actualizarTextoRecolect();
}

// Recolectar lo que esté más cerca
// collection.js — listener actualizado
Recolect.addEventListener('touchstart', (e) => {
    e.preventDefault();

    if (!state.ObjetoCercano) return;

    // ── RAMA ──
    if (state.TipoCercano === 'rama') {
		playSonido('recolectar');
        recolectarRama();
        quitarDeEscena(state.ObjetoCercano, state.ListaRamas);
        limpiarSeleccion();
        return;
    }

    // ── ROCA ──
    if (state.TipoCercano === 'roca') {
        // ¿Tiene pico?
        playSonido('recolectar');
        recolectarRoca();
        quitarDeEscena(state.ObjetoCercano, state.ListaRocas);
        limpiarSeleccion();
        return;
    }
	
	// ── ROCA GRANDE ──
if (state.TipoCercano === 'rocaGrande') {
    if (!tieneItem('Pico')) {
        mostrarMensaje('Necesitas un pico ⛏️');
        return;
    }

    const roca = state.ObjetoCercano;
    roca.userData.vida -= 1;
	playSonido('golpe');    // 🔑 cada golpe suena
    sacudir(roca);

    if (roca.userData.vida > 0) {
        return;
    }
	
	playSonido('caida');    // 🔑 cuando se rompe
    // ── La roca se rompe ──
    recolectarPiedra();
    recolectarPiedra();   // doble drop: 2 piedras por roca

    minarRoca(roca.position.x, roca.position.z).then(ok => {
        if (ok) console.log('✅ Servidor actualizó la roca');
    });

    quitarDeEscena(roca, state.ListaRocasGrandes);
    limpiarSeleccion();
    return;
}

    // ── ÁRBOL ──
    if (state.TipoCercano === 'arbol') {
        if (!tieneItem('Hacha')) {
            mostrarMensaje('Necesitas un hacha 🪓');
            return;
        }

        const arbol = state.ObjetoCercano;
        arbol.userData.vida -= 1;
		
		playSonido('golpe');    // 🔑 cada golpe suena
        // Feedback visual: sacudida
        sacudir(arbol);

        // Si aún no cae, actualizar UI y salir
        if (arbol.userData.vida > 0) {
            return;
        }

        // ── El árbol cae ──
		playSonido('caida');    // 🔑 cuando se rompe
        // Recolectar drops
recolectarTronco();
recolectarRama();

// Avisar al servidor
talarArbol(arbol.position.x, arbol.position.z).then(ok => {
    if (ok) {
        console.log('✅ Servidor actualizó el árbol');
    } else {
        console.warn('⚠️ El servidor no pudo eliminar el árbol');
    }
});
        quitarDeEscena(arbol, state.ListaArboles);
        limpiarSeleccion();
        return;
    }
	
	// ── FOGATA ──
if (state.TipoCercano === 'fogata') {
    if (!tieneItem('Tronco')) {
        mostrarMensaje('Necesitas un tronco 🪵');
        return;
    }

    const fogata = state.ObjetoCercano;
    quitarItemPorNombre('Tronco');
    encenderFogataMesh(fogata);
    playSonido('craftear');

    encenderFogataServidor(fogata.userData.id).then(ok => {
        if (ok) console.log('🔥 Fogata encendida y sincronizada');
    });

    limpiarSeleccion();
    return;
}

// ── COFRE ──
if (state.TipoCercano === 'cofre') {
    if (isFull()) {
        mostrarMensaje('Inventario lleno 📦');
        return;
    }

    const cofre = state.ObjetoCercano;

    // 🔑 Dar chatarra aleatoria (1-3)
    const cantidadChatarra = Math.floor(Math.random() * 3) + 1;
    recolectarChatarra(cantidadChatarra);

    // 🔑 20% de dar Metal
    if (Math.random() < 0.2) {
        recolectarMetal(1);
        mostrarMensaje(`+${cantidadChatarra} Chatarra, +1 Metal`);
    } else {
        mostrarMensaje(`+${cantidadChatarra} Chatarra`);
    }

    abrirCofre(cofre);
    playSonido('recolectar');
    limpiarSeleccion();
    return;
}
	
	// ── DROP ──
if (state.TipoCercano === 'drop') {
    if (isFull()) {
        mostrarMensaje('Inventario lleno 📦');
        return;
    }

    const drop = state.ObjetoCercano;
    const itemData = drop.userData.item;

    // Recrear el item en el inventario
    const item = createItem(itemData.name, itemData.icon, itemData.type, itemData.count || 1);
    if (addItem(item)) {
        saveInventory();
        playSonido('recolectar');
        quitarDrop(drop);
        limpiarSeleccion();
        console.log(`📥 Recogiste: ${item.name}`);
    }
    return;
}
});
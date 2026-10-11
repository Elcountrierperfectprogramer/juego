// network.js - Solo para tu servidor HTTP (sin PeerJS)

let myId = Math.random().toString(36).slice(2, 8);
let isConnected = false;
let players = {};
let onPositionUpdate = null;
let onPlayerJoined = null;
let onPlayerLeft = null;

// ============================================
// 🔑 URL DEL SERVIDOR
// ============================================

let serverURL = detectarServidor();

// network.js — al final
export function getServerURL() {
    return serverURL;
}

function detectarServidor() {
    const hostname = window.location.hostname;

    // 🔑 Local (localhost o IP local)
    if (hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        return 'http://' + hostname + ':3000';
    }

    // 🔑 GitHub Pages → servidor en OneCompiler
    /*
    if (hostname.endsWith('github.io')) {
        return 'https://3000-99f54fee2521-0af456a2.sandboxed.page';
    }
    */

    // 🔑 Cualquier otro caso → preguntar
    return prompt(
        '🌐 URL del servidor?:'
    );
}

console.log('🌐 Servidor:', serverURL);

// network.js
let dropCounter = 0;

// ============================================
// 1. CONECTAR AL SERVIDOR
// ============================================

export async function connectToServer() {
    console.log(`🔗 Conectando al servidor ${serverURL}...`);

    try {
        const response = await fetch(serverURL + '/api/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: myId,
                position: { x: 0, y: 0, z: 0 }
            })
        });

        const data = await response.json();
        if (data.success) {
            isConnected = true;
            console.log('✅ Conectado al servidor');
            console.log('🆔 Mi ID:', myId);
            await getPlayers();
            return true;
        }
    } catch (error) {
        console.error('❌ Error al conectar:', error);
        return false;
    }
}

// ============================================
// 2. ENVIAR POSICIÓN
// ============================================

export function sendMyPosition(x, y, z) {
    if (!isConnected) return;

    fetch(serverURL + '/api/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: myId,
            position: { x, y, z }
        })
    }).catch(e => console.error('Error al enviar posición:', e));
}

// ============================================
// 3. OBTENER JUGADORES
// ============================================

export async function getPlayers() {
    try {
        const response = await fetch(serverURL + '/api/players');
        const data = await response.json();

        if (data.players) {
            players = data.players;

            Object.keys(players).forEach(id => {
                if (id !== myId && onPositionUpdate) {
                    onPositionUpdate(id, players[id].position);
                }
            });
        }
    } catch (error) {
        console.error('Error al obtener jugadores:', error);
    }
}

// ============================================
// 4. ACCIONES DEL MUNDO
// ============================================

export async function talarArbol(x, z) {
    try {
        const response = await fetch(serverURL + '/api/talar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x, z })
        });
        const data = await response.json();
        return data.success === true;
    } catch (e) {
        console.error('❌ Error al talar:', e);
        return false;
    }
}

export async function minarRoca(x, z) {
    try {
        const response = await fetch(serverURL + '/api/minar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x, z })
        });
        const data = await response.json();
        return data.success === true;
    } catch (e) {
        console.error('❌ Error al minar:', e);
        return false;
    }
}

// ============================================
// 5. DROPS
// ============================================

export async function enviarDrop(item, x, z) {
    const id = myId + '_' + (dropCounter++);
    try {
        await fetch(serverURL + '/api/drop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, item, x, z })
        });
        return id;
    } catch (e) {
        console.error('❌ Error al enviar drop:', e);
        return null;
    }
}

export async function getDrops() {
    try {
        const r = await fetch(serverURL + '/api/drops');
        const data = await r.json();
        return data.drops || {};
    } catch (e) {
        return {};
    }
}

export async function eliminarDropRemoto(id) {
    try {
        await fetch(serverURL + '/api/drop-remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
    } catch (e) {}
}

// ============================================
// 6. FOGATAS
// ============================================

export async function colocarFogataServidor(id, x, z) {
    try {
        const response = await fetch(serverURL + '/api/colocar-fogata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, x, z })
        });
        const data = await response.json();
        return data.success === true;
    } catch (e) {
        console.error('❌ Error al colocar fogata:', e);
        return false;
    }
}

export async function getFogatas() {
    try {
        const r = await fetch(serverURL + '/api/fogatas');
        const data = await r.json();
        return data.fogatas || {};
    } catch (e) {
        return {};
    }
}

export async function encenderFogataServidor(id) {
    try {
        const response = await fetch(serverURL + '/api/encender-fogata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await response.json();
        return data.success === true;
    } catch (e) {
        console.error('❌ Error al encender fogata:', e);
        return false;
    }
}

// ============================================
// 7. PISOS
// ============================================

export async function colocarPisoServidor(id, x, z, rot = 0) {
    try {
        const response = await fetch(serverURL + '/api/colocar-piso', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, x, z, rot })
        });
        const data = await response.json();
        return data.success === true;
    } catch (e) {
        console.error('❌ Error al colocar piso:', e);
        return false;
    }
}

export async function getPisos() {
    try {
        const r = await fetch(serverURL + '/api/pisos');
        const data = await r.json();
        return data.pisos || {};
    } catch (e) {
        return {};
    }
}

// ============================================
// 8. CONFIGURAR CALLBACKS
// ============================================

export function setCallbacks(callbacks) {
    if (callbacks.onPositionUpdate) onPositionUpdate = callbacks.onPositionUpdate;
    if (callbacks.onPlayerJoined) onPlayerJoined = callbacks.onPlayerJoined;
    if (callbacks.onPlayerLeft) onPlayerLeft = callbacks.onPlayerLeft;
}

// ============================================
// 9. BUCLE DE ACTUALIZACIÓN
// ============================================

setInterval(() => {
    if (isConnected) {
        getPlayers();
    }
}, 1000);

// ============================================
// 10. FUNCIONES PARA script.js
// ============================================

export function getNetwork() {
    return {
        isConnected: isConnected,
        players: players,
        myId: myId,
        serverURL: serverURL
    };
}

// network.js - Solo para tu servidor HTTP (sin PeerJS)

let myId = Math.random().toString(36).slice(2, 8);
let isConnected = false;
let players = {};
let onPositionUpdate = null;
let onPlayerJoined = null;
let onPlayerLeft = null;

let serverIP = window.location.hostname;

// network.js
let dropCounter = 0;

// ============================================
// 1. CONECTAR AL SERVIDOR
// ============================================

export async function connectToServer() {
    console.log(`🔗 Conectando al servidor ${serverIP}...`);
    
    try {
        const response = await fetch('http://' + serverIP + ':3000/api/update', {
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
    
    fetch('http://' + serverIP + ':3000/api/update', {
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
        const response = await fetch('http://' + serverIP + ':3000/api/players');
        const data = await response.json();
        
        if (data.players) {
            players = data.players;
            
            // Actualizar cada jugador remoto
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

// network.js
export async function talarArbol(x, z) {
    try {
        const response = await fetch('http://' + serverIP + ':3000/api/talar', {
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

// network.js
export async function minarRoca(x, z) {
    try {
        const response = await fetch('http://' + serverIP + ':3000/api/minar', {
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

export async function enviarDrop(item, x, z) {
    const id = myId + '_' + (dropCounter++);
    try {
        await fetch('http://' + serverIP + ':3000/api/drop', {
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
        const r = await fetch('http://' + serverIP + ':3000/api/drops');
        const data = await r.json();
        return data.drops || {};
    } catch (e) {
        return {};
    }
}

export async function eliminarDropRemoto(id) {
    try {
        await fetch('http://' + serverIP + ':3000/api/drop-remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
    } catch (e) {}
}

// network.js
export async function colocarFogataServidor(id, x, z) {
    try {
        const response = await fetch('http://' + serverIP + ':3000/api/colocar-fogata', {
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
        const r = await fetch('http://' + serverIP + ':3000/api/fogatas');
        const data = await r.json();
        return data.fogatas || {};
    } catch (e) {
        return {};
    }
}

export async function encenderFogataServidor(id) {
    try {
        const response = await fetch('http://' + serverIP + ':3000/api/encender-fogata', {
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

// network.js
export async function colocarPisoServidor(id, x, z, rot = 0) {
    try {
        const response = await fetch('http://' + serverIP + ':3000/api/colocar-piso', {
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
        const r = await fetch('http://' + serverIP + ':3000/api/pisos');
        const data = await r.json();
        return data.pisos || {};
    } catch (e) {
        return {};
    }
}

// ============================================
// 4. CONFIGURAR CALLBACKS
// ============================================

export function setCallbacks(callbacks) {
    if (callbacks.onPositionUpdate) onPositionUpdate = callbacks.onPositionUpdate;
    if (callbacks.onPlayerJoined) onPlayerJoined = callbacks.onPlayerJoined;
    if (callbacks.onPlayerLeft) onPlayerLeft = callbacks.onPlayerLeft;
}

// ============================================
// 5. BUCLE DE ACTUALIZACIÓN
// ============================================

setInterval(() => {
    if (isConnected) {
        getPlayers();
    }
}, 1000);

// ============================================
// 6. FUNCIONES PARA script.js
// ============================================

export function getNetwork() {
    return {
        isConnected: isConnected,
        players: players,
        myId: myId
    };
}
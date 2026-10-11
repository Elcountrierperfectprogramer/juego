// ============================================
// Inventory.js - Módulo de inventario ESTABLE
// ============================================

// Importar el contador para el inventario
import { settings } from "./settings.js";
// inventory.js
// Importar arriba del archivo:
import { soltarCercaDelJugador } from './drops.js';
import { camera } from './scene.js';
import { playSonido } from './audio.js';
import { enviarDrop } from './network.js';


// Estado del inventario (4 slots)
export const MAX_SLOTS = 9;
let inventorySlots = new Array(MAX_SLOTS).fill(null);

// ============================================
// 1. GESTIONAR ITEMS
// ============================================

export function addItem(item) {
    for (let i = 0; i < MAX_SLOTS; i++) {
        if (inventorySlots[i] === null) {
            inventorySlots[i] = item;
			UnirItems(inventorySlots);
            updateUI();
            return true;
        }
    }
    return false;
}

export function soltarItemDesdeSlot(slotIndex) {
    const item = inventorySlots[slotIndex];
    if (!item) return;

    // 1. Quitar del inventario
    inventorySlots[slotIndex] = null;
    updateUI();
    saveInventory();

    // 2. Crear drop en la escena cerca del jugador
    const mesh = soltarCercaDelJugador(item, camera);

    // 3. Sonido (si tienes)
    try { playSonido('recolectar'); } catch (e) {}

    // 4. Sincronizar con el servidor (opcional, ver Paso 5)
    try {
        enviarDrop(item, mesh.position.x, mesh.position.z);
    } catch (e) {}

    console.log(`📤 Soltaste: ${item.name}`);
}

export function removeItem(slotIndex) {
    if (slotIndex >= 0 && slotIndex < MAX_SLOTS) {
        const item = inventorySlots[slotIndex];
        inventorySlots[slotIndex] = null;
        updateUI();
        return item;
    }
    return null;
}
localStorage.removeItem('inventario');

// inventory.js
export function quitarItemPorNombre(nombre) {
    for (let i = 0; i < MAX_SLOTS; i++) {
        const item = inventorySlots[i];
        if (item && item.name === nombre) {
            inventorySlots[i] = null;
            updateUI();
            saveInventory();
            return true;
        }
    }
    return false;
}

export function getItem(slotIndex) {
    if (slotIndex >= 0 && slotIndex < MAX_SLOTS) {
        return inventorySlots[slotIndex];
    }
    return null;
}

export function isFull() {
    return inventorySlots.every(slot => slot !== null);
}

export function getItemCount() {
    return inventorySlots.filter(slot => slot !== null).length;
}

// ============================================
// 2. UI DEL INVENTARIO
// ============================================

function updateUI() {
    const slots = document.querySelectorAll('.inventory-slot');
    if (slots.length === 0) return;

    slots.forEach((slot, index) => {
        const item = inventorySlots[index];

        if (item) {
            slot.innerHTML = `
                <img src="${item.icon}" alt="${item.name}" 
                     style="
                        width: 50px;
                        height: 50px;
                        object-fit: contain;
                        pointer-events: none;
                        filter: drop-shadow(0 3px 6px rgba(0,0,0,0.6)) 
                                drop-shadow(0 1px 1px rgba(0,0,0,0.4));
                     ">
                <span style="
                    position: absolute;
                    bottom: 6px;
                    right: 6px;
                    color: white;
                    font-size: 13px;
                    font-weight: bold;
                    background: linear-gradient(145deg, #2c3e50, #1a252f);
                    padding: 2px 8px;
                    border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.2);
                    box-shadow: 0 2px 6px rgba(0,0,0,0.5);
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    pointer-events: none;
                ">${item.count || 1}</span>
            `;
            slot.classList.add('filled');
            slot.style.borderColor = 'rgba(255, 215, 100, 0.3)';
        } else {
            slot.innerHTML = '';
            slot.classList.remove('filled');
            slot.style.borderColor = 'rgba(255,255,255,0.15)';
        }
    });
}

// inventory.js
let panelAbierto = false;
let panel = null;
let grid = null;
let botonMochila = null;

export function createInventoryUI() {
    if (document.getElementById('btn-mochila')) return;   // ya existe

    // ========================================
    // 1. BOTÓN MOCHILA (esquina inferior derecha)
    // ========================================
    botonMochila = document.createElement('button');
    botonMochila.id = 'btn-mochila';
    botonMochila.textContent = '🎒';
    botonMochila.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(145deg, #4a5a70, #2a3a50);
        color: white;
        font-size: 32px;
        border: 2px solid rgba(255,255,255,0.2);
        box-shadow: 0 6px 16px rgba(0,0,0,0.6),
                    inset 0 1px 2px rgba(255,255,255,0.15);
        z-index: 200;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s, box-shadow 0.15s;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
    `;

    botonMochila.addEventListener('touchstart', (e) => {
        e.preventDefault();
        botonMochila.style.transform = 'scale(0.92)';
    });

    botonMochila.addEventListener('touchend', (e) => {
        e.preventDefault();
        botonMochila.style.transform = 'scale(1)';
        togglePanelInventario();
    });

    document.body.appendChild(botonMochila);

    // ========================================
    // 2. PANEL DE INVENTARIO (oculto)
    // ========================================
    panel = document.createElement('div');
    panel.id = 'inventory-panel';
    panel.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 300;
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        gap: 24px;
        opacity: 0;
        transition: opacity 0.2s;
    `;

    // Título
    const titulo = document.createElement('div');
    titulo.textContent = '🎒 Inventario';
    titulo.style.cssText = `
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 24px;
        font-weight: bold;
        text-shadow: 0 2px 6px rgba(0,0,0,0.8);
        letter-spacing: 1px;
    `;
    panel.appendChild(titulo);

    // Grid de slots
    grid = document.createElement('div');
    grid.id = 'inventory-grid';
    grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(3, 90px);
        gap: 12px;
        padding: 20px;
        background: linear-gradient(145deg, rgba(50,60,80,0.5), rgba(30,40,60,0.7));
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.12);
        box-shadow: 0 12px 40px rgba(0,0,0,0.7),
                    inset 0 1px 1px rgba(255,255,255,0.05);
    `;

    // Crear los 9 slots
    for (let i = 0; i < MAX_SLOTS; i++) {
        const slot = crearSlot(i);
        grid.appendChild(slot);
    }

    panel.appendChild(grid);

    // Botón cerrar
    // X fija en la esquina superior derecha (fuera del panel, siempre visible)
const botonCerrarX = document.createElement('button');
botonCerrarX.id = 'btn-cerrar-inventario';
botonCerrarX.textContent = '✖';
botonCerrarX.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(145deg, #e74c3c, #c0392b);
    color: white;
    font-size: 22px;
    font-weight: bold;
    border: 2px solid rgba(255,255,255,0.25);
    box-shadow: 
        0 6px 16px rgba(231, 76, 60, 0.5),
        inset 0 1px 2px rgba(255,255,255,0.25);
    z-index: 400;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.15s;
`;
botonCerrarX.addEventListener('touchstart', (e) => {
    e.preventDefault();
    botonCerrarX.style.transform = 'scale(0.9)';
    cerrarPanelInventario();
});
botonCerrarX.addEventListener('touchend', (e) => {
    e.preventDefault();
    botonCerrarX.style.transform = 'scale(1)';
});
document.body.appendChild(botonCerrarX);

    document.body.appendChild(panel);

    // Actualizar al final
    updateUI();
}

// ========================================
// CREAR UN SLOT INDIVIDUAL (estilo Raft)
// ========================================
function crearSlot(indice) {
    const slot = document.createElement('div');
    slot.className = 'inventory-slot';
    slot.dataset.index = indice;
    slot.style.cssText = `
        width: 90px;
        height: 90px;
        background: linear-gradient(145deg, 
            rgba(80, 90, 110, 0.5), 
            rgba(40, 50, 70, 0.8));
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 16px;
        box-shadow: 
            inset 0 1px 2px rgba(255,255,255,0.1),
            inset 0 -2px 4px rgba(0,0,0,0.3),
            0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
        transition: all 0.15s;
        overflow: hidden;
    `;

    // Listener de toque corto (usar item) y long press (soltar)
    let touchStartTime = 0;
    let longPressTimer = null;
    let touchMoved = false;

    slot.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchStartTime = Date.now();
        touchMoved = false;

        slot.style.transform = 'scale(0.95)';
        slot.style.borderColor = 'rgba(255,255,255,0.4)';

        longPressTimer = setTimeout(() => {
            if (!touchMoved) {
                soltarItemDesdeSlot(indice);
                slot.style.transform = 'scale(1)';
                slot.style.borderColor = 'rgba(255,255,255,0.15)';
            }
        }, 1000);
    });

    slot.addEventListener('touchmove', () => {
        touchMoved = true;
        clearTimeout(longPressTimer);
        slot.style.transform = 'scale(1)';
        slot.style.borderColor = 'rgba(255,255,255,0.15)';
    });

    slot.addEventListener('touchend', (e) => {
        e.preventDefault();
        clearTimeout(longPressTimer);
        slot.style.transform = 'scale(1)';
        slot.style.borderColor = 'rgba(255,255,255,0.15)';

        const duracion = Date.now() - touchStartTime;
        if (!touchMoved && duracion < 1000) {
            const item = inventorySlots[indice];
            if (item) {
    if (item.type === 'bloque') {
        // Modo colocación según el nombre del item
        cerrarPanelInventario();

        if (item.name === 'Fogata') {
            window.activarModoColocacionFogata?.();
        } else if (item.name === 'piso_madera') {
            window.activarModoColocacionPiso?.();
        }
    } else if (item.use) {
        // Item normal (comida, herramienta) → usar
        item.use();
    }
}
        }
    });

    slot.addEventListener('touchcancel', () => {
        clearTimeout(longPressTimer);
        slot.style.transform = 'scale(1)';
        slot.style.borderColor = 'rgba(255,255,255,0.15)';
    });

    return slot;
}

// ========================================
// ABRIR / CERRAR PANEL
// ========================================
export function togglePanelInventario() {
    if (panelAbierto) {
        cerrarPanelInventario();
    } else {
        abrirPanelInventario();
    }
}

export function abrirPanelInventario() {
    if (!panel) return;
    panelAbierto = true;
    panel.style.display = 'flex';
	// 🔑 Mostrar la X
    const x = document.getElementById('btn-cerrar-inventario');
    if (x) x.style.display = 'flex';
	
    updateUI();
    // Forzar reflow para que la transición funcione
    requestAnimationFrame(() => {
        panel.style.opacity = '1';
    });
}

export function cerrarPanelInventario() {
    if (!panel) return;
    panelAbierto = false;
    panel.style.opacity = '0';
	// 🔑 Ocultar la X
    const x = document.getElementById('btn-cerrar-inventario');
    if (x) x.style.display = 'none';
	
    setTimeout(() => {
        if (!panelAbierto) panel.style.display = 'none';
    }, 200);
}

// ============================================
// 3. CREAR ITEMS
// ============================================

export function createItem(name, icon, type, count = 1) {
    return {
        id: Date.now() + Math.random(),
        name: name,
        icon: icon,
        type: type,
        count: count,
        use: function() {
            console.log(`🎯 Usando ${this.name}`);
            if (this.type === 'comida') {
                // Aquí la lógica de recuperar hambre
            } else if (this.type === 'material') {
                // Aquí la lógica de materiales
            }
        }
    };
}

// ============================================
// 4. Unir items
// ============================================

// inventory.js
export function UnirItems(slots) {
    // 1. Primero contamos cuántos hay de cada nombre
    const conteo = {};
    const items = [];

    for (let i = 0; i < slots.length; i++) {
        const item = slots[i];
        if (!item) continue;

        if (conteo[item.name]) {
            conteo[item.name].count += item.count || 1;
        } else {
            conteo[item.name] = {
                ...item,
                count: item.count || 1
            };
            items.push(conteo[item.name]);
        }
    }

    // 2. Reconstruimos el array: primero los agrupados, luego nulls
    for (let i = 0; i < slots.length; i++) {
        slots[i] = items[i] || null;
    }
	
    // 3. Avisamos a la UI
    updateUI();
}

// inventory.js — al final
export function actualizarGlobalInventario() {
    window.inventorySlots = inventorySlots;
}

// ============================================
// 4. PERSISTENCIA (localStorage)
// ============================================

export function saveInventory() {
    try {
        localStorage.setItem('inventario', JSON.stringify(inventorySlots));
        // console.log('💾 Inventario guardado');
    } catch (e) {
        console.warn('❌ No se pudo guardar:', e);
    }
}

export function loadInventory() {
    try {
        const data = localStorage.getItem('inventario');
        if (data) {
            
            inventorySlots = JSON.parse(data);
            updateUI();
            
            // Despues quitar esto
            UnirItems(inventorySlots);
            return true;
        }
    } catch (e) {
        console.warn('❌ No se pudo cargar:', e);
    }
    return false;
}

// inventory.js
export function tieneItem(nombre) {
    for (let i = 0; i < MAX_SLOTS; i++) {
        const item = inventorySlots[i];
        if (item && item.name === nombre) return true;
    }
    return false;
}

// ============================================
// 5. INICIALIZACIÓN
// ============================================

export function initInventory() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            createInventoryUI();
            loadInventory();
        });
    } else {
        createInventoryUI();
        loadInventory();
    }
}

// ============================================
// 6. DEPURACIÓN
// ============================================

export function debugInventory() {
    console.log('=== 📦 INVENTARIO ===');
    console.log('Slots:', inventorySlots);
    console.log('Items totales:', getItemCount());
    console.log('¿Lleno?', isFull());
    inventorySlots.forEach((item, i) => {
        console.log(`Slot ${i}:`, item ? `${item.name} (${item.count})` : 'VACÍO');
    });
    return inventorySlots;
}

// Exponer para depuración global
window.inventorySlots = inventorySlots;
window.debugInventory = debugInventory;
// menu.js - Parte del multijugador
import { connectToServer, sendMyPosition, setCallbacks, getNetwork } from './network.js';
import { setUIAbierta } from './input.js';
// Inicializar HUD de barras
import { initHUD } from './hud.js';   // arriba del archivo

let network = null;

// Botones de multijugador
const HostBtn = document.getElementById("HostGame");
const JoinBtn = document.getElementById("JoinGame");

// ============================================
// FUNCIONES DE MULTIJUGADOR
// ============================================

// menu.js - Añade esta función
export function mostrarMensaje(texto) {
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        z-index: 15;
        font-size: 16px;
    `;
    div.textContent = texto;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

async function crearSala() {
    mostrarMensaje("Creando Sala 👑");
	
    // ✅ Configurar callbacks para recibir posiciones
    setCallbacks({
        onPositionUpdate: (id, position) => {
            if (window.updatePlayerPosition) {
                window.updatePlayerPosition(id, position);
            }
        },
        onPlayerJoined: (id) => {
        },
        onPlayerLeft: (id) => {
            if (window.removePlayer) {
                window.removePlayer(id);
            }
        }
    });
    
    // ✅ Conectar al servidor
    const conectado = await connectToServer();
    if (conectado) {
        network = getNetwork();
        mostrarMensaje('👑 Sala creada. Espera a que otros se unan.');
    }
}

async function unirseASala() {
    mostrarMensaje("Uniendose a Sala 🔋")
	
    // ✅ Configurar callbacks
    setCallbacks({
        onPositionUpdate: (id, position) => {
            if (window.updatePlayerPosition) {
                window.updatePlayerPosition(id, position);
            }
        }
    });
    
    // ✅ Conectar al servidor
    const conectado = await connectToServer();
    if (conectado) {
        network = getNetwork();
        mostrarMensaje('✅ Conectado a la partida!');
    }
}

// ✅ Eventos
HostBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    crearSala();
});

JoinBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    unirseASala();
});

// Hasta aqui el multijugador

// Importar ajustes
import { state } from './state.js';
import { settings } from './settings.js';

// Importar animate() de script.js
// menu.js
import { initInventory, addItem, createItem, saveInventory, removeItem, UnirItems } from './inventory.js';
// menu.js — dentro de hideStart(), al final
import { RECETAS, puedeCraftear, craftear } from './crafting.js';
import { getItem, tieneItem } from './inventory.js';


/*
// NO ejecutes initInventory() aquí
document.addEventListener('DOMContentLoaded', (e) => {
    import { initInventory, addItem, createItem, saveInventory } from './inventory.js';
    alert("Hola");
});
*/

// initInventory(); ← ¡ELIMINA ESTA LÍNEA!

// La función de recolección puede estar aquí
export function recolectarRama() {
    const rama = createItem('Rama', '../assets/imagenes/rama.png', 'material');
    if (addItem(rama)) {
        saveInventory();
    }
}

export function recolectarRoca() {
    console.log('🪨 Creando item Roca...');
    const roca = createItem('Roca', '../assets/imagenes/roca.png', 'material');
    console.log('🪨 Item creado:', roca);
    const añadido = addItem(roca);
    console.log('🪨 ¿Añadido?', añadido);
    if (añadido) saveInventory();
}

export function recolectarPiedra() {
    const piedra = createItem('Piedra', '../assets/imagenes/piedra.png', 'material');
    if (addItem(piedra)) saveInventory();
}

// menu.js
export function recolectarTronco() {
    const tronco = createItem('Tronco', '../assets/imagenes/tronco.png', 'material');
    if (addItem(tronco)) saveInventory();
}

// menu.js — junto a las otras funciones de recolección
export function recolectarChatarra(cantidad = 1) {
    const chatarra = createItem('Chatarra', '../assets/imagenes/chatarra.png', 'material', cantidad);
    if (addItem(chatarra)) saveInventory();
}

export function recolectarMetal(cantidad = 1) {
    const metal = createItem('Metal', '../assets/imagenes/metal.png', 'material', cantidad);
    if (addItem(metal)) saveInventory();
}

// UnirItems(inventorySlots);

// Para cerrar el lugar de crear objetos
const Close_Craft = document.getElementById("Close_Craft");

// Definir vidas
const vidas = settings.health / 20;

// Definir barras de hambre
const amountHungry = settings.hambre / 20;

export const PlayDiv = document.getElementById("play");
export const MenuDiv = document.getElementById("menu");
export const JoyContain = document.getElementById("joystickContainer");
export const JoyBase = document.getElementById("joystickBase");
export const JoyTumb = document.getElementById("joystickThumb");

// Boton para mostrar el panel y seleccionar el ParrafoInImg
export const Panel = document.getElementById("settings");
const ParrafoInImg = document.getElementById("ParrafoInImg");

// Panel verdadero
export const PanelV = document.getElementById("settingsPanel");

// Boton de cerrar
export const CloseBtn = document.getElementById("Close_Craft");

// Seleccionar CreateNewWorld
const CreateNewWorld = document.getElementById("CreateNewWorld");
// Ocultar Creador de Mundo
    CreateNewWorld.style.display = "none";
    
// Seleccionar El creador de mundos XD 😂 boton
const CreateWorld = document.getElementById("NewWorld");
CreateWorld.style.display = "none";

// Seleccionar la posicion
export const PosDiv = document.getElementById("Pos");

// Seleccionar el creador de cosas Xd tmb
const Craft = document.getElementById("Craft");

// Ahora el Panel para crear cosas
const PanelCraft = document.getElementById("Recetas");
PanelCraft.style.display = "none";

// 🔑 Evitar que el contenido se salga
PanelCraft.style.overflowY = 'auto';
PanelCraft.style.maxHeight = '100vh';

// 🔑 X para cerrar crafteo (fija, esquina superior derecha)
const CerrarCraft = document.createElement('button');
CerrarCraft.id = 'btn-cerrar-craft';
CerrarCraft.textContent = '✖';
CerrarCraft.style.cssText = `
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
CerrarCraft.addEventListener('touchstart', (e) => {
    e.preventDefault();
    CerrarCraft.style.transform = 'scale(0.9)';
    PanelCraft.style.display = 'none';
    Craft.style.display = 'block';
    CerrarCraft.style.display = 'none';
    setUIAbierta(false);
});
CerrarCraft.addEventListener('touchend', (e) => {
    e.preventDefault();
    CerrarCraft.style.transform = 'scale(1)';
});
document.body.appendChild(CerrarCraft);

// Seleccionar corazón
const DivHearth = document.getElementById("hearth");

// Seleccionar Toggle-test
const ToggleExample = document.getElementById("Toggle-test");

// Estado del toggle
let Estado = false;

// Seleccionar el recolector
export const Recolect = document.getElementById("Recolect");
Recolect.style.display = "none";

// menu.js
export const gameState = { value: "menu" };

/*
// Definir canvas
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
*/

// Funcion para el toggle
function toggle() {
    Estado = !Estado;
    
    if (Estado) {
            ToggleExample.className = "toggle-on";
    } else {
            ToggleExample.className = "toggle-off";
    }
}

// Funcion para mostrar panel
function MostPanel() {
    // Ocultar menu
    MenuDiv.style.display = "none";
    
    // Mostrar menu y boton
    PanelV.style.display = "block";
    CloseBtn.style.display = "block";
    
    // Mostrar el boton de crear mundo
    CreateWorld.style.display = "block";
}

// funcion para empezar juego
function StartGame() {
    // Inicializar menu
    initInventory();
    
    // Ocultar menu y boton de crear world
    MenuDiv.style.display = "none";
    CreateWorld.style.display = "none";
    
    // Ocultar el panel para crear mundos
    CreateNewWorld.style.display = "none";
    PanelV.style.display = "none";
    
    // Quitar boton de cerrar
    CloseBtn.style.display = "none";
    
    // Aparacer Div de posicion
    PosDiv.style.display = "block";
	
	// Aparecer eso de las recetas
	Craft.style.display = "block";
	
	// menu.js — dentro de StartGame(), después de mostrar el Craft
const BtnColocar = document.createElement('button');
BtnColocar.id = 'BtnColocar';
BtnColocar.textContent = '📍 Colocar';
BtnColocar.style.cssText = `
    position: fixed;
    bottom: 160px;
    right: 20px;
    z-index: 200;
    padding: 12px 18px;
    border-radius: 12px;
    background: rgba(230, 126, 34, 0.9);
    color: white;
    border: none;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    display: none;
`;
document.body.appendChild(BtnColocar);

// Si el jugador tiene una fogata en el inventario, se ve el botón
setInterval(() => {
    const tieneFogata = tieneItem('Fogata');
    BtnColocar.style.display = tieneFogata ? 'block' : 'none';
}, 1000);

// Al pulsar, entra en modo colocación
BtnColocar.addEventListener('touchstart', (e) => {
    e.preventDefault();
    window.activarModoColocacion?.();
});

// Y un botón de confirmar
const BtnConfirmar = document.createElement('button');
BtnConfirmar.id = 'BtnConfirmarColocacion';
BtnConfirmar.textContent = '✅ Confirmar';
BtnConfirmar.style.cssText = `
    position: fixed;
    bottom: 220px;
    right: 20px;
    z-index: 200;
    padding: 12px 18px;
    border-radius: 12px;
    background: rgba(46, 204, 113, 0.9);
    color: white;
    border: none;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    display: none;
`;
document.body.appendChild(BtnConfirmar);

setInterval(() => {
    BtnConfirmar.style.display = state.modoColocacion ? 'block' : 'none';
}, 200);

BtnConfirmar.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (state.modoColocacion === 'fogata') {
        window.confirmarColocacion?.();
    } else if (state.modoColocacion === 'piso') {
        window.confirmarColocacionPiso?.();
	}
});
    
    // Aparecer Joystick
    JoyContain.style.display = "block";
    JoyBase.style.display = "block";
    JoyTumb.style.display = "block";
    // DivHearth.style.display = "block"; // Antes era importante
    
    gameState.value = "jugando";
    
    // Empezar juego
    window.animate();
}

// ============================================
// CONSTRUIR UI DE CRAFTEO
// ============================================

function construirUI_Craft() {
    // Vaciar el panel
    PanelCraft.innerHTML = '';

    // Título
    const titulo = document.createElement('h2');
    titulo.textContent = '🛠️ Crafteo';
    titulo.style.cssText = `
        color: white;
        margin: 0 0 20px 0;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 24px;
        font-weight: bold;
        text-shadow: 0 2px 6px rgba(0,0,0,0.8);
        letter-spacing: 1px;
    `;
    PanelCraft.appendChild(titulo);

    // Grid de slots
    const grid = document.createElement('div');
    grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
        max-width: 340px;
        padding: 20px;
        background: linear-gradient(145deg, rgba(50,60,80,0.5), rgba(30,40,60,0.7));
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.12);
        box-shadow: 0 12px 40px rgba(0,0,0,0.7),
                    inset 0 1px 1px rgba(255,255,255,0.05);
        margin: 0 auto;
    `;

    // Un slot cuadrado por cada receta
    for (const [key, receta] of Object.entries(RECETAS)) {
        const slot = document.createElement('div');
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

        // ¿Se puede craftear? Cambiar el color
        const disponible = puedeCraftear(key);

        if (disponible) {
            slot.style.borderColor = 'rgba(46, 204, 113, 0.6)';
            slot.style.background = 'linear-gradient(145deg, rgba(60, 130, 90, 0.5), rgba(30, 70, 50, 0.8))';
        } else {
            slot.style.opacity = '0.5';
        }

        // Icono
        const img = document.createElement('img');
        img.src = receta.icono;
        img.style.cssText = `
            width: 65%;
            height: 65%;
            object-fit: contain;
            pointer-events: none;
            filter: drop-shadow(0 3px 6px rgba(0,0,0,0.6));
        `;
        img.onerror = () => { img.style.display = 'none'; };
        slot.appendChild(img);

        // Contador de "cuántos puedes craftear" (opcional)
        if (disponible) {
            const badge = document.createElement('span');
            badge.textContent = '✓';
            badge.style.cssText = `
                position: absolute;
                top: 6px;
                right: 6px;
                font-size: 14px;
                color: #2ecc71;
                font-weight: bold;
                text-shadow: 0 1px 3px rgba(0,0,0,0.8);
                pointer-events: none;
            `;
            slot.appendChild(badge);
        }

        // Click para craftear
        slot.addEventListener('touchstart', (e) => {
            e.preventDefault();

            if (!disponible) return;   // no puedes craftear

            if (craftear(key)) {
                construirUI_Craft();
            }
        });

        // Efecto visual al pulsar
        slot.addEventListener('touchstart', () => {
            slot.style.transform = 'scale(0.92)';
        });
        slot.addEventListener('touchend', () => {
            slot.style.transform = 'scale(1)';
        });

        grid.appendChild(slot);
    }

    PanelCraft.appendChild(grid);

    // Texto de ayuda
    const ayuda = document.createElement('p');
    ayuda.textContent = 'Pulsa un slot para craftear';
    ayuda.style.cssText = `
        color: rgba(255,255,255,0.6);
        font-size: 12px;
        text-align: center;
        margin: 16px 0 0 0;
        font-family: sans-serif;
    `;
    PanelCraft.appendChild(ayuda);
}


export function hideStart() {
  
  /*
  // Agregar texto
  ctx.fillStyle = 'white';
  ctx.fillText("Hola", 50, 50);
  */
  
  // menu.js — dentro de hideStart()

const Close_Recetas = document.getElementById("Close_Recetas");

Close_Recetas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    PanelCraft.style.display = "none";      // cerrar el panel de crafteo
    Craft.style.display = "block";          // mostrar el botón ⚙️ de nuevo
    Close_Recetas.style.display = "none";   // ocultar el botón de cerrar
});
  
  // Tocar el Creador de cosas
  Craft.addEventListener('touchstart', (e) => {
    e.preventDefault();
    PanelCraft.style.display = "block";
    Craft.style.display = "none";
    Close_Recetas.style.display = "block";  	// 🔑 mostrar el botón de cerrar
	CerrarCraft.style.display = "flex";   // 🔑 mostrar la X
    construirUI_Craft();
	setUIAbierta(true);   // 🔑
});
  
  // Toque en el boton para cerrar el creador de cosas
  Close_Craft.addEventListener('touchstart', (e) => {
	  e.preventDefault();
	  
	  // Cerrar el panel de creacion
	  PanelCraft.style.display = "none";
	  
	  // aparecer el boton para entrar a el creador
	  Craft.style.display = "block";
  })
  
  // Tocar toggle
  ToggleExample.addEventListener('touchstart', (e) => {
        toggle();
  });
  
  // Tocar panel
  Panel.addEventListener('touchstart', (e) => {
        e.preventDefault();
        
           MostPanel();
           
           // Aparecer menu y quitar lo otro
        MenuDiv.style.display = "block";
        
        PanelV.style.display = "none";
    Close_Craft.style.display = "none";
  });
  
  // Tocar el texto
  ParrafoInImg.addEventListener('touchstart', (e) => {
        e.preventDefault();
        
        MostPanel();
  });
  
  // Tocar boton de cerrar
  Close_Craft.addEventListener('touchstart', (e) => {
    e.preventDefault();
    
      // Aparecer menu y quitar lo otro
        MenuDiv.style.display = "block";
        
        PanelV.style.display = "none";
    Close_Craft.style.display = "none";
    
    CreateNewWorld.style.display = "none";
  });
  
  CreateWorld.addEventListener('touchstart', (e) => {
        e.preventDefault();
        
        StartGame();
  });
  
  PlayDiv.addEventListener('touchstart', (e) => {
    e.preventDefault();
    
   // Ir a la seccion de mundos
   // Aparecer menu y quitar lo otro
        MenuDiv.style.display = "none";
   // Mostrar El menu
    CreateNewWorld.style.display = "block";
    
    MostPanel();
    Close_Craft.style.display = "block";
  });
  
// Refrescar cada vez que se abre el panel
Craft.addEventListener('touchstart', () => {
    construirUI_Craft();
});

// ...
initHUD();

// Exponer global para depurar
window.construirUI_Craft = construirUI_Craft;
}
// hud.js
import { settings } from './settings.js';

// ============================================
// ESTADO DEL HUD
// ============================================

let contenedor = null;
let barraVida = null;
let barraHambre = null;
let barraSed = null;
let textoVida = null;
let textoHambre = null;
let textoSed = null;
let barraFrio = null;           // 🔑 nueva
let textoFrio = null;           // 🔑 nueva

// ============================================
// CREAR HUD
// ============================================

export function initHUD() {
    if (contenedor) return;   // ya existe

    contenedor = document.createElement('div');
    contenedor.id = 'hud-barras';
    contenedor.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 11;
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 10px 14px;
        background: rgba(0, 0, 0, 0.55);
        border-radius: 14px;
        backdrop-filter: blur(6px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        font-family: sans-serif;
        min-width: 160px;
    `;
    document.body.appendChild(contenedor);

    const resultado = crearBarra('❤️', '#e74c3c', 'Vida');
    barraVida = resultado.barra;
    textoVida = resultado.texto;

    const resultadoH = crearBarra('🍗', '#e67e22', 'Hambre');
    barraHambre = resultadoH.barra;
    textoHambre = resultadoH.texto;

    const resultadoS = crearBarra('💧', '#3498db', 'Sed');
    barraSed = resultadoS.barra;
    textoSed = resultadoS.texto;
	
	const resultadoF = crearBarra('🥶', '#3498db', 'Frío');
barraFrio = resultadoF.barra;
textoFrio = resultadoF.texto;

// 🔑 Contador de balas
const contenedorBalas = document.createElement('div');
contenedorBalas.id = 'hud-balas';
contenedorBalas.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 20px;
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 8px 16px;
    border-radius: 12px;
    font-family: monospace;
    font-size: 18px;
    font-weight: bold;
    z-index: 12;
    border: 1px solid rgba(255,255,255,0.2);
    display: none;   /* oculto hasta que tengas pistola */
`;
document.body.appendChild(contenedorBalas);

window.actualizarHUDbalas = function() {
    const el = document.getElementById('hud-balas');
    if (!el) return;
    el.textContent = '🔫 ' + (settings.balas || 0);
    el.style.display = settings.balas > 0 ? 'block' : 'none';
};

    // Actualizar una vez al inicio
    actualizarHUD();
}

// ============================================
// CREAR UNA BARRA INDIVIDUAL
// ============================================

function crearBarra(icono, color, etiqueta) {
    const fila = document.createElement('div');
    fila.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
    `;

    // Icono
    const ic = document.createElement('span');
    ic.textContent = icono;
    ic.style.cssText = 'font-size: 16px; width: 20px; text-align: center;';
    fila.appendChild(ic);

    // Barra de fondo (contenedor)
    const barraFondo = document.createElement('div');
    barraFondo.style.cssText = `
        flex: 1;
        height: 12px;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 6px;
        overflow: hidden;
        position: relative;
    `;

    // Barra de relleno
    const barra = document.createElement('div');
    barra.style.cssText = `
        height: 100%;
        width: 100%;
        background: ${color};
        border-radius: 6px;
        transition: width 0.3s ease-out, background 0.3s;
    `;
    barraFondo.appendChild(barra);

    fila.appendChild(barraFondo);

    // Texto (por ejemplo "78/100")
    const texto = document.createElement('span');
    texto.style.cssText = `
        color: white;
        font-size: 11px;
        font-weight: bold;
        min-width: 44px;
        text-align: right;
        text-shadow: 0 1px 2px rgba(0,0,0,0.8);
    `;
    texto.textContent = '100/100';
    fila.appendChild(texto);

    contenedor.appendChild(fila);

    return { barra, texto };
}

// ============================================
// ACTUALIZAR BARRAS
// ============================================

export function actualizarHUD() {
    if (!barraVida) return;

    actualizarBarra(barraVida, textoVida, settings.health, settings.healthMax);
    actualizarBarra(barraHambre, textoHambre, settings.hambre, settings.hambreMax);
    actualizarBarra(barraSed, textoSed, settings.sed, settings.sedMax);
	actualizarBarra(barraFrio, textoFrio, settings.frio, settings.frioMax);   // 🔑 nueva
	
	if (window.actualizarHUDbalas) window.actualizarHUDbalas();
}

function actualizarBarra(barra, texto, valor, maximo) {
    const porcentaje = Math.max(0, Math.min(100, (valor / maximo) * 100));

    barra.style.width = porcentaje + '%';

    // Cambiar color según el porcentaje
    if (porcentaje <= 20) {
        barra.style.background = '#c0392b';   // rojo oscuro (crítico)
    } else if (porcentaje <= 50) {
        barra.style.background = '#e67e22';   // naranja (medio)
    } else {
        barra.style.background = '#27ae60';   // verde (bien)
    }

    texto.textContent = Math.round(valor) + '/' + maximo;
}
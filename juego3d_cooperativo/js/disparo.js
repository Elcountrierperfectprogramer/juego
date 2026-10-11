// disparo.js
import * as THREE from "../../assets/modulos/three.module.js";
import { scene, camera } from './scene.js';
import { state } from './state.js';
import { settings } from './settings.js';
import { playSonido } from './audio.js';
// disparo.js — importar tieneItem
import { tieneItem } from './inventory.js';

function tienePistolaEnInventario() {
    return tieneItem('Pistola');
}

// ============================================
// CONFIGURACIÓN
// ============================================

const ALCANCE = 100;        // distancia máxima de la bala
const CADENCIA = 200;       // milisegundos entre disparos (5 por segundo)
const DANIO = 25;           // daño por bala

let ultimoDisparo = 0;
let botonDisparo = null;
let tienePistola = false;

// ============================================
// CREAR EL BOTÓN DE DISPARO
// ============================================

export function crearBotonDisparo() {
    if (botonDisparo) return;

    botonDisparo = document.createElement('button');
    botonDisparo.id = 'btn-disparo';
    botonDisparo.textContent = '🔫';
    botonDisparo.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(145deg, #e74c3c, #a8231a);
        color: white;
        font-size: 36px;
        border: 3px solid rgba(255,255,255,0.3);
        box-shadow: 0 6px 20px rgba(231, 76, 60, 0.6),
                    inset 0 2px 4px rgba(255,255,255,0.2);
        z-index: 200;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
        transition: transform 0.1s;
    `;

    // 🔑 Disparar manteniendo pulsado (full auto)
    botonDisparo.addEventListener('touchstart', (e) => {
        e.preventDefault();
        botonDisparo.style.transform = 'scale(0.9)';
        disparar();
    });

    botonDisparo.addEventListener('touchend', (e) => {
        e.preventDefault();
        botonDisparo.style.transform = 'scale(1)';
    });

    botonDisparo.addEventListener('touchcancel', () => {
        botonDisparo.style.transform = 'scale(1)';
    });

    document.body.appendChild(botonDisparo);

    console.log('🔫 Botón de disparo creado');
}

// ============================================
// MOSTRAR / OCULTAR EL BOTÓN
// ============================================

export function actualizarBotonDisparo() {
    if (!botonDisparo) return;

    // 🔑 Comprobar si el jugador tiene pistola en el inventario
    const tienePistolaAhora = tienePistolaEnInventario();

    if (tienePistolaAhora !== tienePistola) {
        tienePistola = tienePistolaAhora;
        botonDisparo.style.display = tienePistola ? 'flex' : 'none';
    }
}

// ============================================
// DISPARAR
// ============================================

export function disparar() {
    // 1. Comprobar cadencia
    const ahora = Date.now();
    if (ahora - ultimoDisparo < CADENCIA) return;
    ultimoDisparo = ahora;

    // 2. Comprobar balas
    if (settings.balas <= 0) {
        console.log('❌ Sin balas');
        return;
    }

    // 3. Consumir bala
    settings.balas -= 1;

    // 4. Sonido
    playSonido('disparo');

    // 5. Raycast desde la cámara
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    raycaster.far = ALCANCE;

    // 6. Ver qué golpea
    const objetosGolpeables = [
        ...state.ListaArboles,
        ...state.ListaRocasGrandes,
        ...state.ListaCasas,
        ...state.ListaCofres,
		...state.ListaBots
        // Cuando tengas bots: ...state.ListaBots
    ];

    const impactos = raycaster.intersectObjects(objetosGolpeables, true);

    if (impactos.length > 0) {
        const impacto = impactos[0];
        // 🔑 Crear partícula en el punto de impacto
        crearImpacto(impacto.point);

        // 🔑 Aplicar daño si el objeto lo soporta
        const objeto = impacto.object;
        if (objeto.userData && objeto.userData.vida !== undefined) {
            objeto.userData.vida -= DANIO;
            console.log(`🎯 Impacto. Vida restante: ${objeto.userData.vida}`);
        }
    } else {
        // 🔑 Si no golpea nada, al menos la partícula vuela lejos
        const puntoLejano = raycaster.ray.at(ALCANCE, new THREE.Vector3());
        crearImpacto(puntoLejano);
    }

    // 7. Actualizar HUD de balas
    if (window.actualizarHUDbalas) window.actualizarHUDbalas();
}

// ============================================
// PARTÍCULA DE IMPACTO
// ============================================

function crearImpacto(posicion) {
    // 🔑 Un pequeño grupo de partículas que se desvanece
    const geo = new THREE.SphereGeometry(0.08, 8, 8);
    const mat = new THREE.MeshBasicMaterial({
        color: 0xffdd44,
        transparent: true,
        opacity: 1
    });
    const esfera = new THREE.Mesh(geo, mat);
    esfera.position.copy(posicion);
    scene.add(esfera);

    // 🔑 Animación: expandir y desvanecer
    let escala = 1;
    let opacidad = 1;

    const animar = () => {
        escala += 0.15;
        opacidad -= 0.06;
        esfera.scale.set(escala, escala, escala);
        esfera.material.opacity = opacidad;

        if (opacidad > 0) {
            requestAnimationFrame(animar);
        } else {
            scene.remove(esfera);
            esfera.geometry.dispose();
            esfera.material.dispose();
        }
    };
    animar();
}
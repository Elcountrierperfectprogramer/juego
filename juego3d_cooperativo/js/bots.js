// bots.js
import * as THREE from "../../assets/modulos/three.module.js";
import { scene } from './scene.js';
import { state } from './state.js';
import { getAlturaReal } from './utils.js';
import { recolectarChatarra } from './menu.js';

// ============================================
// CREAR UN BOT
// ============================================

export function crearBot(x, z) {
    // Modelo simple: un cilindro rojo
    const geo = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 8);
    const mat = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0x550000,
        emissiveIntensity: 0.3,
        roughness: 0.8
    });
    const bot = new THREE.Mesh(geo, mat);

    // Altura del suelo
    const altura = getAlturaReal(x, z);
    bot.position.set(x, altura + 0.75, z);

    // 🔑 Datos del bot
    bot.userData = {
        tipo: 'bot',
        vida: 50,
        vidaMax: 50,
        velocidad: 0.03,
        direccion: Math.random() * Math.PI * 2,   // dirección aleatoria
        tiempoVivo: 0
    };

    scene.add(bot);
    state.ListaBots.push(bot);

    console.log(`🤖 Bot creado en (${x.toFixed(1)}, ${z.toFixed(1)})`);
    return bot;
}

// ============================================
// ACTUALIZAR TODOS LOS BOTS (llamado cada frame)
// ============================================

export function updateBots(deltaSegundos) {
    for (let i = state.ListaBots.length - 1; i >= 0; i--) {
        const bot = state.ListaBots[i];

        // 🔑 1. Moverse en línea recta
        const dx = Math.cos(bot.userData.direccion) * bot.userData.velocidad;
        const dz = Math.sin(bot.userData.direccion) * bot.userData.velocidad;

        bot.position.x += dx;
        bot.position.z += dz;

        // 🔑 2. Ajustar altura al suelo
        bot.position.y = getAlturaReal(bot.position.x, bot.position.z) + 0.75;

        // 🔑 3. Cambiar dirección cada 3 segundos
        bot.userData.tiempoVivo += deltaSegundos;
        if (bot.userData.tiempoVivo > 3) {
            bot.userData.direccion = Math.random() * Math.PI * 2;
            bot.userData.tiempoVivo = 0;
        }

        // 🔑 4. Comprobar si ha muerto
        if (bot.userData.vida <= 0) {
            matarBot(bot, i);
        }
    }
}

// ============================================
// MATAR UN BOT (cuando su vida llega a 0)
// ============================================

function matarBot(bot, index) {
    // 🔑 Soltar chatarra
    recolectarChatarra(2);   // 2 Chatarra por bot

    // 🔑 Quitar de la escena
    scene.remove(bot);
    if (bot.geometry) bot.geometry.dispose();
    if (bot.material) bot.material.dispose();

    // 🔑 Quitar de la lista
    state.ListaBots.splice(index, 1);

    console.log('💀 Bot eliminado. +2 Chatarra');
}

// ============================================
// GENERAR BOTS DE PRUEBA (para testear)
// ============================================

export function generarBotsDePrueba() {
    console.log('🤖 Generando bots de prueba...');

    // 🔑 5 bots alrededor del spawn
    crearBot(10, 10);
    crearBot(-15, 8);
    crearBot(5, -12);
    crearBot(-8, -10);
    crearBot(20, -5);

    console.log(`✅ ${state.ListaBots.length} bots generados`);
}
// crafting.js
import { getItem, addItem, removeItem, createItem, saveInventory, MAX_SLOTS } from './inventory.js';

// ============================================
// RECETAS
// ============================================

export const RECETAS = {
    hacha: {
        nombre: 'Hacha',
        icono: '../assets/imagenes/hacha.png',
        tipo: 'herramienta',
        ingredientes: { 'Rama': 2, 'Roca': 1 },
        resultado: { nombre: 'Hacha', icono: '../assets/imagenes/hacha.png', tipo: 'herramienta' }
    },
    pico: {
        nombre: 'Pico',
        icono: '../assets/imagenes/pico.png',
        tipo: 'herramienta',
        ingredientes: { 'Rama': 2, 'Roca': 2 },
        resultado: { nombre: 'Pico', icono: '../assets/imagenes/pico.png', tipo: 'herramienta' }
    },
	// crafting.js — dentro del objeto RECETAS
fogata: {
    nombre: 'Fogata',
    icono: '../assets/imagenes/fogata.png',
    tipo: 'bloque',
    ingredientes: { 'Piedra': 3, 'Tronco': 2 },
    resultado: { nombre: 'Fogata', icono: '../assets/imagenes/fogata.png', tipo: 'bloque' },
},
piso_madera: {
		nombre: "piso_madera",
		icono: '../assets/imagenes/piso_madera.png',
		tipo: "bloque",
		ingredientes: { 'Rama': 5, 'Tronco': 4 },
		resultado: { nombre: "piso_madera", icono: '../assets/imagenes/piso_madera.png', tipo: "bloque"}
	},
	pistola: {
    nombre: 'Pistola',
    icono: '../assets/imagenes/pistola.png',
    tipo: 'herramienta',
    ingredientes: { 'Chatarra': 5, 'Metal': 2 },
    resultado: { nombre: 'Pistola', icono: '../assets/imagenes/pistola.png', tipo: 'herramienta' }
},
municion: {
    nombre: 'Munición',
    icono: '../assets/imagenes/municion.png',
    tipo: 'material',
    ingredientes: { 'Metal': 2 },
    resultado: { nombre: 'Munición', icono: '../assets/imagenes/municion.png', tipo: 'material' }
}
};

// ============================================
// COMPROBAR SI SE PUEDE CRAFTEAR
// ============================================

export function puedeCraftear(nombreReceta) {
    const receta = RECETAS[nombreReceta];
    if (!receta) return false;

    // Contamos cuánto tenemos de cada ingrediente
    const inventario = contarItems();

    for (const [ingrediente, cantidadNecesaria] of Object.entries(receta.ingredientes)) {
        const cantidadActual = inventario[ingrediente] || 0;
        if (cantidadActual < cantidadNecesaria) return false;
    }
    return true;
}

// ============================================
// CONTAR ITEMS EN EL INVENTARIO
// ============================================

function contarItems() {
    const conteo = {};
    // Recorremos los 4 slots
    for (let i = 0; i < MAX_SLOTS; i++) {
        const item = getItem(i);
        if (!item) continue;
        conteo[item.name] = (conteo[item.name] || 0) + (item.count || 1);
    }
    return conteo;
}

// ============================================
// EJECUTAR EL CRAFTEO
// ============================================

export function craftear(nombreReceta) {
    if (!puedeCraftear(nombreReceta)) {
        console.log(`❌ No tienes materiales para ${nombreReceta}`);
        return false;
    }

    const receta = RECETAS[nombreReceta];

    // 1. Consumir los ingredientes
    for (const [ingrediente, cantidadNecesaria] of Object.entries(receta.ingredientes)) {
        consumirItem(ingrediente, cantidadNecesaria);
    }

    // 2. Añadir el resultado
    const resultado = createItem(
        receta.resultado.nombre,
        receta.resultado.icono,
        receta.resultado.tipo
    );
    addItem(resultado);

    saveInventory();
    console.log(`✅ Crafteado: ${receta.nombre}`);
    return true;
}

// ============================================
// CONSUMIR N ITEMS POR NOMBRE
// ============================================

function consumirItem(nombre, cantidad) {
    let restante = cantidad;

    for (let i = 0; i < 4 && restante > 0; i++) {
        const item = getItem(i);
        if (!item || item.name !== nombre) continue;

        const enEsteSlot = item.count || 1;

        if (enEsteSlot <= restante) {
            // Consumimos todo este slot
            removeItem(i);
            restante -= enEsteSlot;
        } else {
            // Consumimos parcialmente
            item.count = enEsteSlot - restante;
            restante = 0;
        }
    }
}
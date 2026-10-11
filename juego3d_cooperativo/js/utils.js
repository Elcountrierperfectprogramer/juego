// utils.js
import * as THREE from "../../assets/modulos/three.module.js";
import { state, ancho } from './state.js';

export function log(texto) {
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed; bottom: 80px; left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8); color: white;
        padding: 10px 20px; border-radius: 8px;
        z-index: 15; font-size: 16px; top: 10px; height: 40px;
    `;
    div.textContent = texto;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

export function generateRandIsla() {
    const RandIsla = (Math.random() - 0.5) * (ancho / 2);
    return Math.floor(RandIsla);
}

const raycaster = new THREE.Raycaster();

export function getAlturaReal(x, z) {
    const origen = new THREE.Vector3(x, 100, z);
    const direccion = new THREE.Vector3(0, -1, 0);
    raycaster.set(origen, direccion);

    const intersecciones = raycaster.intersectObjects(state.objetosColision);
    if (intersecciones.length > 0) {
        return intersecciones[0].point.y - 0.25;
    }
    return -0.75;
}
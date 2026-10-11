// scene.js
import * as THREE from "../../assets/modulos/three.module.js";

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);
export const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 🔑 Esto evita que la luz "queme" los colores
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;   // ajusta entre 0.5 y 1.5 para calibrar
scene.background = new THREE.Color(0x87CEEB);

// Bloquear zoom táctil con 2 dedos
export const canvas = renderer.domElement;
canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) e.preventDefault();
});
canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

// Cámara
camera.position.set(0, 10, 0);
camera.lookAt(0, 1, 0);
camera.rotation.order = 'YXZ';

// Luz solar
// const sunLight = new THREE.DirectionalLight(0xffffff, 1);
// sunLight.position.set(20, 40, 20);
// scene.add(sunLight);

// Agua
const texturaAgua = new THREE.TextureLoader().load('../assets/Texturas/agua.avif');
const terrenoGeometry = new THREE.CircleGeometry(128, 32);
const terrenoMaterial = new THREE.MeshStandardMaterial({
    map: texturaAgua,
    opacity: 0.85,
    metalness: 0.3, // Antes 0.9
    roughness: 0.7 // antes 0.3
});
export const terreno = new THREE.Mesh(terrenoGeometry, terrenoMaterial);
terreno.rotation.x = -Math.PI / 2;
terreno.position.y = -0.4;
scene.add(terreno);
// ✅ IMPORTACIONES (funcionan gracias al importmap)
import * as THREE from 'three';
import { GLTFLoader } from 'https://unpkg.com/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';

// Escena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cargar personaje
async function init() {
// Personaje 3D
const loader = new GLTFLoader();
    
    // Usar CALLBACK en lugar de ASYNC/AWAIT
    loader.load('https://github.com/Elcountrierperfectprogramer/juego/raw/refs/heads/main/juego3d/models/avatar_completo_1000.glb',
        // Función de éxito
        (gltf) => {
            gltf.scene.position.set(0, 0, 0);
            scene.add(gltf.scene);
            console.log("✅ Personaje cargado");
        },
        // Función de progreso (opcional)
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% cargado');
        },
        // Función de error
        (error) => {
            console.error("❌ Error:", error);
            // Crear personaje de respaldo
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ color: 0xff6600 });
            const backup = new THREE.Mesh(geometry, material);
            scene.add(backup);
        }
    );
}

// Variables
const largo = 64;
let paredZ = -10;

// Fondo
scene.background = new THREE.Color(0x6666ff);

// Luz
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// SUELO (horizontal)
const sueloGeo = new THREE.BoxGeometry(20, 0.2, 20);
const sueloMat = new THREE.MeshStandardMaterial({ color: 0x44aa44 });
const suelo = new THREE.Mesh(sueloGeo, sueloMat);
suelo.position.set(0, -1, 0);
scene.add(suelo);

// PARED (vertical, al fondo)
const paredGeo = new THREE.BoxGeometry(20, 3, 0.5);
const paredMat = new THREE.MeshStandardMaterial({ color: 0xaa8866 });
const pared = new THREE.Mesh(paredGeo, paredMat);
pared.position.set(0, 0.5, paredZ);
scene.add(pared);

// Cámara (para ver el suelo y la pared)
camera.position.set(3, 5, 15);
camera.lookAt(0, 0, -5);

// Variables del joystick
const joystickBase = document.getElementById('joystickBase');
const joystickThumb = document.getElementById('joystickThumb');
let active = false;
let centerX = 0, centerY = 0;
let joydeltaX = 0, joydeltaY = 0;
const maxDistance = 35;  // radio del movimiento del pulgar

// Obtener centro de la base
function updateCenter() {
    const rect = joystickBase.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;
}

// Mover el pulgar visualmente
function setThumbPosition(x, y) {
    joystickThumb.style.transform = `translate(${x}px, ${y}px)`;
}

// Resetear joystick
function resetJoystick() {
    joydeltaX = 0;
    joydeltaY = 0;
    setThumbPosition(0, 0);
    // Aquí debes enviar los valores a Three.js
}

// Eventos táctiles
joystickBase.addEventListener('touchstart', (e) => {
    e.preventDefault();
    active = true;
    updateCenter();
    handleTouch(e);
});

document.addEventListener('touchmove', (e) => {
    if (!active) return;
    e.preventDefault();
    handleTouch(e);
});

document.addEventListener('touchend', () => {
    if (!active) return;
    active = false;
    resetJoystick();
});

function handleTouch(e) {
    const touch = e.touches[0];
    const rawX = touch.clientX - centerX;
    const rawY = touch.clientY - centerY;
    
    // Calcular distancia y limitar
    let distance = Math.hypot(rawX, rawY);
    let limitedX = rawX;
    let limitedY = rawY;
    
    if (distance > maxDistance) {
        limitedX = (rawX / distance) * maxDistance;
        limitedY = (rawY / distance) * maxDistance;
    }
    
    // Calcular delta (valor entre -1 y 1)
    joydeltaX = limitedX / maxDistance;
    joydeltaY = limitedY / maxDistance;
    
    // Mover el pulgar visualmente
    setThumbPosition(limitedX, limitedY);
    
    // ENVIAR DELTA A THREE.JS
    // pared.position.x = deltaX * 8;
}

let cameraRotationY = 0;
let cameraRotationX = 0;
let lastTouchX = 0;
let lastTouchY = 0;
let isLooking = false;
document.addEventListener('touchstart', (e) => {
   const touch = e.touches[0];
    if (isTouchOnJoystick(touch.clientX, touch.clientY)) return; // Si es joystick, no activar mirada
    
    isLooking = true;
    lastTouchX = touch.clientX;
    lastTouchY = touch.clientY;
});

document.addEventListener('touchmove', (e) => {
    if (!isLooking) return;
    
    const deltaX = e.touches[0].clientX - lastTouchX;
    const deltaY = e.touches[0].clientY - lastTouchY;
    
    // Acumular rotación
    cameraRotationY += deltaX * 0.01;
    cameraRotationX += deltaY * 0.01;
    
    // Limitar vertical (no girar 360° hacia arriba)
    cameraRotationX = Math.min(Math.max(cameraRotationX, -1.5), 1.5);
    
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
});

document.addEventListener('touchend', () => {
    isLooking = false;
});

function isTouchOnJoystick(touchX, touchY) {
    const rect = joystickBase.getBoundingClientRect();
    return touchX >= rect.left && touchX <= rect.right &&
           touchY >= rect.top && touchY <= rect.bottom;
}

const cameraGroup = new THREE.Group();
cameraGroup.add(camera);
scene.add(cameraGroup);
camera.position.set(0, 5, 15);
camera.lookAt(0, 0, 0);

// Animación
function animate() {
    cameraGroup.rotation.y = -cameraRotationY;
camera.rotation.x = -cameraRotationX;
    camera.position.y -= 1;
    camera.position.z += joydeltaY;
    camera.position.x += joydeltaX;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
// Poner personaje
init();
animate();

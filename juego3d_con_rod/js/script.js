import * as THREE from "https://unpkg.com/three@0.128.0/build/three.module.js";
import { gameState, hideStart } from "./menu.js";
import { getJoydeltaX, getJoydeltaY, getRotationDelta } from './input.js';

// Escena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Fondo (azul cielo)
scene.background = new THREE.Color(0x87CEEB);

// Luces
const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);

// Sol
const sunLight = new THREE.DirectionalLight(0xfff5d1, 1.2);
sunLight.position.set(10, 20, 5);
scene.add(sunLight);

const canvas = renderer.domElement;

canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
});

canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

const texturaPlano = new THREE.TextureLoader().load('../assets/Texturas/plano.jpg');

const texturaAgua = new THREE.TextureLoader().load('../assets/Texturas/agua.avif');

// Funcion de Ruido
function Ruido(x, z) {
    // Poner en X
    for (let i = 0; i < x; i++) {
        x = Math.random() * x
    }
    
    for (let i = 0; i < z; i++) {
            z = Math.random() * z
    }
    return Math.sin(x * 0.5) * Math.cos(z * 0.5);
}

// Tadio
const radioIsla = 6;

// Crear geometría de la isla
let geometry = new THREE.PlaneGeometry(64, 64, 64, 64);
const material = new THREE.MeshStandardMaterial({ 
    map: texturaPlano,
    // color: 0xff0000,  // Rojo brillante para depurar
    roughness: 0.7,
    metalness: 0.1
});

let plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -3;
scene.add(plane);

// Modificar vértices para hacer la isla
const positions = geometry.attributes.position.array;

for (let i = 0; i < positions.length; i += 3) {
    // const x = positions[i];
    // const z = positions[i];
    const x = Ruido(8, 0);
    const z = Ruido(0, 8);
    const distanciaOrg = Math.sqrt(x * x + z * z);
    
    let alturaOrg = 0;
    
    if (distanciaOrg < radioIsla) {
        // Fórmula de isla: centro alto, bordes bajos
        alturaOrg = Math.cos(distanciaOrg * (Math.PI / (radioIsla * 2)));
        
        // Pico central más alto
        if (distanciaOrg < 2) {
            alturaOrg = 3 - distanciaOrg * 0.5;
        }
    } else {
        alturaOrg = -0.5; // Agua alrededor
    }
    
    positions[i + 2] = alturaOrg;  // Y es altura
}

geometry.attributes.position.needsUpdate = true;

// Añadir agua alrededor
const terrenoGeometry = new THREE.CircleGeometry(128, 32);
const terrenoMaterial = new THREE.MeshStandardMaterial({
    map: texturaAgua,
    opacity: 0.85,
    metalness: 0.9,
    roughness: 0.3
});
const terreno = new THREE.Mesh(terrenoGeometry, terrenoMaterial);
terreno.rotation.x = -Math.PI / 2;
terreno.position.y = -0.4;
scene.add(terreno);

// Isla
const geometrySphere = new THREE.SphereGeometry( radioIsla, 16, 16 );
const materialSphere = new THREE.MeshBasicMaterial( { map: texturaPlano } );
const sphere = new THREE.Mesh( geometrySphere, materialSphere );
sphere.position.set(plane.position.x, -radioIsla + Math.cos(radioIsla) / 1.2, plane.position.z);
sphere.scale.set(8, 1, 8);
scene.add( sphere );

const alturaMax = geometrySphere.parameters.radius;

// Posiciones X y Z de montaña
const MontainX = (Math.random() - 0.5) * (radioIsla * sphere.scale.z);
const MontainZ = (Math.random() - 0.5) * (radioIsla * sphere.scale.z);

// Posiciones X y Z aleatorias de Suelo
const SueloZ = (Math.random() - 0.5) * (radioIsla * sphere.scale.z);
const SueloX = (Math.random() - 0.5) * (radioIsla * sphere.scale.x);

// Escala aleatoria
const ScaleMontainX = (Math.random() + 0.5) * 2;
const ScaleMontainZ = (Math.random() + 0.5) * 2;

// Montaña
const geometryMontain = new THREE.SphereGeometry( 6, 16, 16 );
const materialMontain = new THREE.MeshBasicMaterial( { map: texturaPlano } );
const Montain = new THREE.Mesh( geometryMontain, materialMontain );
Montain.position.set(MontainX, -3, MontainZ);
Montain.scale.set(ScaleMontainX, 2, ScaleMontainZ);
scene.add(Montain);

// Posicion del otro terreno(original)
plane.position.x = MontainX * 3;
plane.position.z = MontainZ * 3;

/*
const PltFormX = SueloX + Math.random() * 15;
const PltFormZ = SueloZ + Math.random() * 15;

// Lista con las posiciones
const cubos = [];
for (let i = 0; i < 6; i++) {
    cubos.push({
            x: PltFormX,
            y: 0.5,
            z: PltFormZ,
    });
}

const sueloGeo = new THREE.BoxGeometry(2, 0.2, 2);
const sueloMat = new THREE.MeshStandardMaterial({ color: 0x44aa44 });

// Agregar a la escena
for (let i = 0; i < 6; i++) {
    // Agregar Suelo
const suelo = new THREE.Mesh(sueloGeo, sueloMat);
suelo.position.set(cubos[i].x, 0.5, cubos[i].z);
scene.add(suelo);
}
*/

// Cámara
camera.position.set(sphere.position.x, 10, sphere.position.z);
camera.lookAt(0, 1, 0);
camera.rotation.order = 'YXZ';

// Velocidad de movimiento
const velocidad = 0.15;

// Gravedad
let velocidadY = 0;
const gravedad = -0.5;

// Crear un rayo
const raycaster = new THREE.Raycaster();

function getAlturaReal(x, z) {
    // Disparar rayo desde arriba hacia abajo
    const origen = new THREE.Vector3(x, 100, z);
    const direccion = new THREE.Vector3(0, -1, 0);
    
    raycaster.set(origen, direccion);
    
    // Verificar colisiones con el terreno
    const objetosColision = [plane, sphere, Montain]; // Todos los objetos del suelo
    const intersecciones = raycaster.intersectObjects(objetosColision);
    
    if (intersecciones.length > 0) {
        return intersecciones[0].point.y; // Altura del suelo
    }
    
    return -0.5; // Agua por defecto
}

function update() {
    velocidadY += gravedad * 0.1;
    camera.position.y += velocidadY;
    
    // Usar la altura REAL del terreno
    const alturaSueloReal = getAlturaReal(camera.position.x, camera.position.z) + 0.5;
    
    if (camera.position.y < alturaSueloReal) {
        camera.position.y = alturaSueloReal;
        velocidadY = 0;
    }
}

function animate() {
    if (gameState.value == "jugando") {
        update();
        
        const joyX = getJoydeltaX();
        const joyY = getJoydeltaY();
        const { dx, dy } = getRotationDelta();
        
        camera.rotation.y -= dx;
        camera.rotation.x -= dy;
        camera.rotation.x = Math.min(Math.max(camera.rotation.x, -1.2), 1.2);
        
        // Mover según dirección de la cámara
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        
        camera.position.x += (forward.x * joyY + right.x * -joyX) * velocidad;
        camera.position.z += (forward.z * joyY + right.z * -joyX) * velocidad;
        
        // Limitar movimiento dentro de la isla
        const distanciaCentro = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
        
        const radioMaximo = terrenoGeometry.parameters.radius;
        
        if (distanciaCentro > radioMaximo) {
            const angulo = Math.atan2(camera.position.z, camera.position.x);
            camera.position.x = Math.cos(angulo) * radioMaximo;
            camera.position.z = Math.sin(angulo) * radioMaximo;
        }
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// ejecutar Menu
hideStart();
// Empezar juego
animate();

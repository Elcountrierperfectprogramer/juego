
// Variables
const biomas = {
  desierto: { color: 0xc2b280, alturaMax: 5, textura: 'arena.jpg', arboles: false },
  bosque: { color: 0x5c9e5c, alturaMax: 10, textura: 'cesped.jpg', arboles: true },
  nieve: { color: 0xe0e0e0, alturaMax: 8, textura: 'nieve.jpg', arboles: false }
};
// Escena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Fondo
scene.background = new THREE.Color(0x6666ff);

// Luz
const light = new THREE.AmbientLight(0xff6666);
scene.add(light);

// Plano
const geometry = new THREE.PlaneGeometry( 10, 10 );
const material = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
const plane = new THREE.Mesh( geometry, material );
plane.rotation.x = Math.PI * 0.5;
scene.add( plane );


// Cámara (para ver el suelo y la pared)
camera.position.set(0, 5, 15);
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
    camera.position.z += joydeltaY;
    camera.position.x += joydeltaX;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

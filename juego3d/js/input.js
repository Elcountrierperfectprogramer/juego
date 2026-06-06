// input.js - Módulo de entrada con multitouch

const joystickBase = document.getElementById('joystickBase');
const joystickThumb = document.getElementById('joystickThumb');
let centerX = 0, centerY = 0;
let joydeltaX = 0, joydeltaY = 0;
const maxDistance = 35;

// IDs de los dedos activos
let joystickTouchId = null;
let lookTouchId = null;

// Para la rotación
let rotationDeltaX = 0;
let rotationDeltaY = 0;
let lastLookX = 0, lastLookY = 0;

function updateCenter() {
    const rect = joystickBase.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;
}

function setThumbPosition(x, y) {
    joystickThumb.style.transform = `translate(${x}px, ${y}px)`;
}

function resetJoystick() {
    joydeltaX = 0;
    joydeltaY = 0;
    setThumbPosition(0, 0);
}

function isTouchOnJoystick(touchX, touchY) {
    const rect = joystickBase.getBoundingClientRect();
    return touchX >= rect.left && touchX <= rect.right &&
           touchY >= rect.top && touchY <= rect.bottom;
}

function handleJoystickTouch(touch) {
    const rawX = touch.clientX - centerX;
    const rawY = touch.clientY - centerY;
    
    let distance = Math.hypot(rawX, rawY);
    let limitedX = rawX;
    let limitedY = rawY;
    
    if (distance > maxDistance) {
        limitedX = (rawX / distance) * maxDistance;
        limitedY = (rawY / distance) * maxDistance;
    }
    
    joydeltaX = -limitedX / maxDistance;
    joydeltaY = -limitedY / maxDistance;
    setThumbPosition(limitedX, limitedY);
}

// Eventos táctiles
document.addEventListener('touchstart', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const onJoystick = isTouchOnJoystick(touch.clientX, touch.clientY);
        
        if (onJoystick && joystickTouchId === null) {
            joystickTouchId = touch.identifier;
            updateCenter();
            handleJoystickTouch(touch);
        } 
        else if (!onJoystick && lookTouchId === null) {
            lookTouchId = touch.identifier;
            lastLookX = touch.clientX;
            lastLookY = touch.clientY;
        }
    }
});

document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        
        if (touch.identifier === joystickTouchId) {
            handleJoystickTouch(touch);
            e.preventDefault();
        }
        else if (touch.identifier === lookTouchId) {
            const deltaX = touch.clientX - lastLookX;
            const deltaY = touch.clientY - lastLookY;
            rotationDeltaX += deltaX * 0.01;
            rotationDeltaY += deltaY * 0.01;
            lastLookX = touch.clientX;
            lastLookY = touch.clientY;
            e.preventDefault();
        }
    }
});

document.addEventListener('touchend', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        
        if (touch.identifier === joystickTouchId) {
            joystickTouchId = null;
            resetJoystick();
        }
        if (touch.identifier === lookTouchId) {
            lookTouchId = null;
        }
    }
});

window.addEventListener('error', (e) => {
    console.log("Error real:", e.error);
});

// Exportar funciones
export function getJoydeltaX() { return joydeltaX; }
export function getJoydeltaY() { return joydeltaY; }
export function getRotationDelta() { 
    const dx = rotationDeltaX;
    const dy = rotationDeltaY;
    rotationDeltaX = 0;
    rotationDeltaY = 0;
    return { dx, dy };
}

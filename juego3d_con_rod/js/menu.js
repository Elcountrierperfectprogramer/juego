export const PlayDiv = document.getElementById("play");
export const MenuDiv = document.getElementById("menu");
export const JoyContain = document.getElementById("joystickContainer");
export const JoyBase = document.getElementById("joystickBase");
export const JoyTumb = document.getElementById("joystickThumb");

// menu.js
export const gameState = { value: "menu" };

export function hideStart() {
  PlayDiv.addEventListener('touchstart', (e) => {
    e.preventDefault();
    MenuDiv.style.display = "none";
    JoyContain.style.display = "block";
    JoyBase.style.display = "block";
    JoyTumb.style.display = "block";
    gameState.value = "jugando";
  });
}
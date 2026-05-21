// menu.js
// Variables importantes
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Variables extra
let touchX, touchY;

// Crear menú
function menu() {
imageObj = new Image();
imageObj.src = "https://raw.githubusercontent.com/Elcountrierperfectprogramer/juego/refs/heads/main/juego3d_con_rod/images/menu.jpg";
imageObj.onload = function() {
ctx.drawImage(imageObj, 100, 100);
};

document.addEventListener('touchstart', (e) => {
e.preventDefault();
touchX = e.touches[0].clientX;
touchY = e.touches[0].clientY;
});

if (touchX <= 100) {

} else if (touchX >= 200) {

}

menu();

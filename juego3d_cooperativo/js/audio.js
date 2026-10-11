// audio.js
// ============================================
// Sistema de audio centralizado
// ============================================

const VOLUMEN_DEFAULT = 0.5;

const sonidos = {
    golpe:      { src: '../assets/sonidos/golpe.mp3',      volumen: 0.6, cache: null },
    caida:      { src: '../assets/sonidos/caida.mp3',      volumen: 0.7, cache: null },
    recolectar: { src: '../assets/sonidos/recolectar.mp3', volumen: 0.5, cache: null },
    craftear:   { src: '../assets/sonidos/craftear.mp3',   volumen: 0.6, cache: null },
	// audio.js — dentro del objeto `sonidos`
disparo: { src: '../assets/sonidos/disparo.mp3', volumen: 0.7, cache: null }
};

let audioDesbloqueado = false;

// ============================================
// Precarga de audio
// ============================================

export function precargarSonidos() {
    for (const nombre in sonidos) {
        const a = new Audio();
        a.src = sonidos[nombre].src;
        a.preload = 'auto';
        a.volume = sonidos[nombre].volumen;
        sonidos[nombre].cache = a;
    }
    console.log('🔊 Sonidos precargados');
}

// ============================================
// Reproducir un sonido
// ============================================

export function playSonido(nombre) {
    if (!audioDesbloqueado) return;   // evita el bloqueo de Safari

    const s = sonidos[nombre];
    if (!s || !s.cache) return;

    // Clonamos el audio para permitir sonidos superpuestos
    const clon = s.cache.cloneNode();
    clon.volume = s.volumen;
    clon.play().catch(err => {
        // Silencioso: algunos navegadores pueden rechazar el play
    });
}

// ============================================
// Desbloquear audio (necesario en iOS/Safari)
// ============================================

export function desbloquearAudio() {
    if (audioDesbloqueado) return;

    // Reproducir un audio silencioso
    const silencio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v///////////////////////////////////////////8AAAAATGF2YzU4LjM1AAAAAAAAAAAAAAAAJAAAAAAAAAABhgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+0DEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/////////////////////////////////////////////AAAAAExhdmM1OC4zNQAAAAAAAAAAAAAAACQAAAAAAAAAAYYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    silencio.volume = 0.01;
    silencio.play()
        .then(() => {
            audioDesbloqueado = true;
            console.log('🔊 Audio desbloqueado');
        })
        .catch(() => {
            // Si falla, esperamos al siguiente intento
        });
}

// ============================================
// Activar desbloqueo con el primer toque
// ============================================

document.addEventListener('touchstart', desbloquearAudio, { once: false });
document.addEventListener('click', desbloquearAudio, { once: false });
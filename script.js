const canvas = document.getElementById("burnCanvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const uploadBtn = document.getElementById("uploadBtn");
const resetBtn = document.getElementById("resetBtn");
const btnMusica = document.getElementById("btnMusica"); // Asegúrate de que el botón en el HTML tenga este ID

// 1. Configuración del Audio
const musica = new Audio('cancion.mp3'); // Reemplaza por tu archivo real
musica.loop = true;
musica.volume = 0.6;

let originalImage = null;
let lastBurn = 0;

canvas.width = 700;
canvas.height = 450;

function drawImage() {
    if (!originalImage) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over"; // Resetear operación para redibujar
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
}

function burn(x, y) {
    // Activar música al primer toque si no está sonando (interacción de usuario)
    if (musica.paused) musica.play().catch(e => console.log("Esperando interacción..."));

    // --- BORRAR FOTO ---
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    const radius = 40;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, "rgba(0,0,0,1)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- BORDE DE FUEGO ---
    for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = radius - 5 + Math.random() * 10;
        const px = x + Math.cos(angle) * dist;
        const py = y + Math.sin(angle) * dist;
        const size = Math.random() * 10 + 4;

        const fire = ctx.createRadialGradient(px, py, 0, px, py, size);
        fire.addColorStop(0, "#fff7cc");
        fire.addColorStop(0.3, "#ffae00");
        fire.addColorStop(1, "rgba(255,80,0,0)");

        ctx.fillStyle = fire;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // --- CENIZAS ---
    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.arc(
            x + (Math.random() - 0.5) * 40,
            y + (Math.random() - 0.5) * 40,
            Math.random() * 2,
            0, Math.PI * 2
        );
        ctx.fill();
    }
}

// Eventos
canvas.addEventListener("mousemove", (e) => {
    const now = Date.now();
    if (now - lastBurn < 30) return;
    lastBurn = now;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (originalImage && e.buttons === 1) { // Solo quema si se mantiene el click apretado
        burn(x, y);
    }
});

// Control de Música Manual
btnMusica.addEventListener("click", () => {
    if (musica.paused) {
        musica.play();
        btnMusica.innerText = "⏸ PAUSAR";
    } else {
        musica.pause();
        btnMusica.innerText = "🎵 MÚSICA";
    }
});

uploadBtn.addEventListener("click", () => upload.click());

upload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        const image = new Image();
        image.onload = function() {
            originalImage = image;
            
            drawImage();
        };
        image.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

resetBtn.addEventListener("click", () => drawImage());
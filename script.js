const canvas = document.getElementById("constellation");
const ctx = canvas.getContext('2d');
let width, height, particles, mouse, audiocontext, analyzer, datarray;
const colors = ["rgba(19, 128, 225, ", "rgba(31, 28, 54, ", "rgba(17, 16, 31, "];

function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    mouse = { 'x': width / 2, 'y': height / 2 };
    const colSpacing = width / 20;
    const rowSpacing = height / 10;
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 20; col++) {
            const colorIndex = Math.floor(Math.random() * colors.length);
            const opacity = 0.4 + Math.random() * 0.2;
            const color = colors[colorIndex] + opacity + ')';
            particles.push({
                x: col * colSpacing + Math.random() * colSpacing * 0.5,
                y: row * rowSpacing + Math.random() * rowSpacing * 0.5,
                radius: Math.random() * 2 + 1,
                vx: Math.random() - 0.5,
                vy: Math.random() - 0.5,
                originalSpeed: Math.random() * 0.6 + 0.1,
                color: color
            });
        }
    }
}

function beatDetector(datarray) {
    let sum = 0;
    for (let i = 0; i < datarray.length; i++) {
        sum += datarray[i];
    }
    const average = sum / datarray.length;
    return Math.min(1, Math.max(0, (average - 80) / 50));
}

function setupAudio() {
    const audioPlayer = document.getElementById("audio-player");
    audiocontext = new (window.AudioContext || window.webkitAudioContext)();
    analyzer = audiocontext.createAnalyser();
    analyzer.fftSize = 256;
    datarray = new Uint8Array(analyzer.frequencyBinCount);
    const source = audiocontext.createMediaElementSource(audioPlayer);
    source.connect(analyzer);
    analyzer.connect(audiocontext.destination);
}

function updateParticles(beatStrength) {
    particles.forEach(particle => {
        const speed = particle.originalSpeed * (1 + beatStrength * 5);
        particle.x += particle.vx * speed;
        particle.y += particle.vy * speed;

        if (particle.x < 0 || particle.x > width) particle.vx = -particle.vx;
        if (particle.y < 0 || particle.y > height) particle
        particle.vy = -particle.vy;
    });
}

function drawConstellations() {
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    particles.forEach(particle => {
        particles.forEach(otherParticle => {
            const dist = Math.hypot(particle.x - otherParticle.x, particle.y - otherParticle.y);
            if (dist < 150) {
                ctx.strokeStyle = particle.color;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(otherParticle.x, otherParticle.y);
                ctx.stroke();
            }
        });
        const distToMouse = Math.hypot(mouse.x - particle.x, mouse.y - particle.y);
        if (distToMouse < 150) {
            ctx.strokeStyle = particle.color;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(particle.x, particle.y);
            ctx.stroke();
        }
    });
}

function animate() {
    if (audiocontext && analyzer) {
        analyzer.getByteFrequencyData(datarray);
        const beatStrength = beatDetector(datarray);
        updateParticles(beatStrength);
        const fishyIcon = document.getElementById("fish-icon");
        if (fishyIcon) {
            if (beatStrength > 0) {
                fishyIcon.style.filter = `drop-shadow(0 0 ${20 * beatStrength}px rgba(19, 128, 225, 1))`;
            } else {
                fishyIcon.style.filter = "none";
            }
        }
    } else {
        updateParticles(0);
    }
    drawConstellations();
    requestAnimationFrame(animate);
}

window.addEventListener("resize", init);
window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

document.addEventListener("DOMContentLoaded", () => {
    const audioPlayer = document.getElementById("audio-player");
    audioPlayer.play().catch(() => {});
    setupAudio();
});

window.addEventListener("load", () => {
    const loader = document.getElementById("cube-loader");
    const mainContent = document.getElementById("main-content");
    loader.style.transition = "opacity 2s ease-out";
    loader.style.opacity = "0";
    setTimeout(() => {
        loader.style.display = "none";
        mainContent.style.display = "block";
        setTimeout(() => {
            mainContent.classList.add("visible");
        }, 50);
        init();
        animate();
    }, 2000);
});

init();
animate();

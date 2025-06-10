const canvas = document.getElementById("constellation");
const ctx = canvas.getContext('2d');
let width, height, particles, mouse, audiocontext, analyzer, datarray;
const colors = ["rgba(19, 128, 225, ", "rgba(31, 28, 54, ", "rgba(17, 16, 31, "];
function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    mouse = { 'x': width / 2, 'y': height / 2 };
    const _0x1122b1 = width / 20;
    const _0x27c4fc = height / 10;
    for (let _0x1f2b47 = 0; _0x1f2b47 < 10; _0x1f2b47++) {
        for (let _0x3239c0 = 0; _0x3239c0 < 20; _0x3239c0++) {
            const _0x478d74 = Math.floor(Math.random() * colors.length);
            const _0x584459 = 0.4 + Math.random() * 0.2;
            const _0x1ac344 = colors[_0x478d74] + _0x584459 + ')';
            particles.push({
                'x': _0x3239c0 * _0x1122b1 + Math.random() * _0x1122b1 * 0.5,
                'y': _0x1f2b47 * _0x27c4fc + Math.random() * _0x27c4fc * 0.5,
                'radius': Math.random() * 2 + 1,
                'vx': Math.random() - 0.5,
                'vy': Math.random() - 0.5,
                'originalSpeed': Math.random() * 0.6 + 0.1,
                'color': _0x1ac344
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
        if (particle.x < 0 || particle.x > width) {
            particle.vx = -particle.vx;
        }
        if (particle.y < 0 || particle.y > height) {
            particle.vy = -particle.vy;
        }
    });
}

function drawConstellations() {
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    particles.forEach(particle => {
        particles.forEach(otherParticle => {
            const dist = Math.sqrt(Math.pow(particle.x - otherParticle.x, 2) + Math.pow(particle.y - otherParticle.y, 2));
            if (dist < 150) {
                ctx.strokeStyle = particle.color;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(otherParticle.x, otherParticle.y);
                ctx.stroke();
            }
        });

        const distToMouse = Math.sqrt(Math.pow(mouse.x - particle.x, 2) + Math.pow(mouse.y - particle.y, 2));
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
                fishyIcon.style.filter = drop-shadow(0 0 ${20 * beatStrength}px rgba(19, 128, 225, 1));
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
window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

document.addEventListener("DOMContentLoaded", () => {
    const audioPlayer = document.getElementById("audio-player");
    audioPlayer.play();
    setupAudio();
});


window.addEventListener('load', () => {
    const loader = document.getElementById('cube-loader');
    loader.style.transition = 'opacity 3s ease-out';
    loader.style.opacity = 0;
    setTimeout(() => {
        loader.style.display = 'none';
        const mainContent = document.getElementById('main-content');
        mainContent.style.display = 'block';
        init();
        animate();
    }, 5000);
});

init();
animate();

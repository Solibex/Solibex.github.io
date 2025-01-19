const canvas = document.getElementById('constellation');
const ctx = canvas.getContext('2d');

let width, height, particles, mouse;

let audiocontext, analyzer, datarray;

const colors = [
    'rgba(19, 128, 225, ',
    'rgba(31, 28, 54, ',
    'rgba(17, 16, 31, '
];

function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    mouse = { x: width / 2, y: height / 2 };

    const rows = 10;  // Number of rows for evenly distributed particles
    const cols = 20;  // Number of columns for evenly distributed particles
    const spacingX = width / cols;
    const spacingY = height / rows;

    // Create evenly distributed particles
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const colorIndex = Math.floor(Math.random() * colors.length);
            const transparency = 0.4 + Math.random() * 0.2;
            const color = colors[colorIndex] + transparency + ')';
            particles.push({
                x: j * spacingX + Math.random() * spacingX * 0.5,  // Add some randomness to spacing
                y: i * spacingY + Math.random() * spacingY * 0.5,  // Add some randomness to spacing
                radius: Math.random() * 2 + 1,
                vx: Math.random() - 0.5,
                vy: Math.random() - 0.5,
                originalSpeed: Math.random() * 0.6 + 0.1,
                color: color
            });
        }
    }
}

function constellation() {
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;

    particles.forEach(p => {
        particles.forEach(p2 => {
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                ctx.strokeStyle = p.color;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        });

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
            ctx.strokeStyle = p.color;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
        }
    });
}

function updateParticles(beatIntensity) {
    particles.forEach(p => {
        const speed = p.originalSpeed * (1 + beatIntensity * 5);
        p.x += p.vx * speed;
        p.y += p.vy * speed;

        if (p.x < 0 || p.x > width) p.vx = -p.vx;
        if (p.y < 0 || p.y > height) p.vy = -p.vy;
    });
}

function animate() {
    if (audiocontext && analyzer) {
        analyzer.getByteFrequencyData(datarray);
        const beatIntensity = beatDetector(datarray);
        updateParticles(beatIntensity);

        const icon = document.getElementById('icon').querySelector('img');
        if (beatIntensity > 0.5) {
            icon.style.filter = `drop-shadow(0 0 ${20 * beatIntensity}px rgba(19, 128, 225, 1))`;
        } else {
            icon.style.filter = 'none';
        }

        // Apply the pulsing effect to the fish image
        const fish = document.querySelector('.fish img');
        const scale = 1 + (beatIntensity * 0.2);  // Scale up slightly with beat intensity
        fish.style.transform = `scale(${scale})`;  // Apply the scale transformation
        fish.style.filter = `drop-shadow(0 0 ${5 + (beatIntensity * 10)}px rgba(19, 128, 225, 1))`; // Glow effect
    } else {
        updateParticles(0);
    }

    constellation();
    requestAnimationFrame(animate);
}

function beatDetector(data) {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        sum += data[i];
    }
    const average = sum / data.length;
    return Math.min(1, Math.max(0, (average - 80) / 50));
}

function setupAudio() {
    const audioElement = document.getElementById('audio-player');
    audiocontext = new (window.AudioContext || window.webkitAudioContext)();
    analyzer = audiocontext.createAnalyser();
    analyzer.fftSize = 256;
    datarray = new Uint8Array(analyzer.frequencyBinCount);

    const source = audiocontext.createMediaElementSource(audioElement);
    source.connect(analyzer);
    analyzer.connect(audiocontext.destination);
}

window.addEventListener('resize', init);
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

document.addEventListener('DOMContentLoaded', () => {
    const audioplayer = document.getElementById('audio-player');
    const playpause = document.getElementById('play-pause');
    const seekbar = document.getElementById('seek-bar');
    const volbar = document.getElementById('volume-bar');
    const currenttime = document.getElementById('current-time');
    const durationspan = document.getElementById('duration');
    const loadingScreen = document.getElementById('loading-screen');
    const audioLoading = document.getElementById('audio-loading');

    // Loading animation
    const progress = document.querySelector('.progress');
    const fish = document.querySelector('.fish img');
    const percentage = document.querySelector('.percentage');

    let width = 0;
    const duration = 2000;
    const interval = 20;
    const steps = duration / interval;
    const increment = 100 / steps;

    const animation = setInterval(() => {
        if (width >= 100) {
            clearInterval(animation);
            fish.style.right = '0';
            setTimeout(() => {
                loadingScreen.style.opacity = 0;
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    audioplayer.play().then(() => {
                        setupAudio();
                        audioplayer.muted = false;
                    }).catch(error => console.log('Playback prevented:', error));
                }, 1000);
            }, 500);
        } else {
            width += increment;
            progress.style.width = `${width}%`;
            fish.style.right = `${100 - width}%`;
            percentage.textContent = `${Math.round(width)}%`;
        }
    }, interval);

    audioplayer.addEventListener('loadstart', () => {
        audioLoading.style.display = 'block';
    });

    audioplayer.addEventListener('canplaythrough', () => {
        audioLoading.style.display = 'none';
    });

    playpause.addEventListener('click', () => {
        if (audioplayer.paused) {
            audioplayer.muted = false;
            audioplayer.play()
                .then(() => {
                    playpause.innerHTML = '<i class="fas fa-pause"></i>';
                })
                .catch(error => {
                    console.log('Playback prevented:', error);
                });
        } else {
            audioplayer.pause();
            playpause.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    audioplayer.addEventListener('loadedmetadata', () => {
        seekbar.max = audioplayer.duration;
        durationspan.textContent = formatTime(audioplayer.duration);
    });

    audioplayer.addEventListener('timeupdate', () => {
        seekbar.value = audioplayer.currentTime;
        currenttime.textContent = formatTime(audioplayer.currentTime);
    });

    seekbar.addEventListener('input', () => {
        audioplayer.currentTime = seekbar.value;
    });

    volbar.addEventListener('input', () => {
        audioplayer.volume = volbar.value;
    });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    audioplayer.volume = volbar.value;
});

init();
animate();

/**
 * AI LOUNGE AFTER DARK
 * Presented by DJ Smoke Stream
 * Immersive Audio-Visual Experience Platform
 */

// ============================================
// GLOBAL STATE & CONFIGURATION
// ============================================
const STATE = {
    audioContext: null,
    analyser: null,
    audioSource: null,
    isPlaying: false,
    currentTrack: 0,
    visualMode: 'waveform',
    threeScene: null,
    threeCamera: null,
    threeRenderer: null,
    composer: null,
    particles: [],
    audioData: new Uint8Array(256),
    mouseX: 0,
    mouseY: 0,
    time: 0
};

const MIXES = [
    { id: 1, title: 'Neural Frequencies Vol. 7', genre: 'techno', duration: '1:24:30', plays: '12.4K', image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 2, title: 'Midnight Protocol', genre: 'house', duration: '58:15', plays: '8.7K', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 3, title: 'Synthetic Dreams', genre: 'ambient', duration: '1:12:00', plays: '15.2K', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: 4, title: 'Digital Horizon', genre: 'techno', duration: '1:45:20', plays: '9.1K', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { id: 5, title: 'Cyber Pulse', genre: 'house', duration: '1:05:45', plays: '11.3K', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    { id: 6, title: 'Quantum State', genre: 'ambient', duration: '2:00:00', plays: '7.8K', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
    { id: 7, title: 'Neon Cascade', genre: 'techno', duration: '1:30:00', plays: '14.5K', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
    { id: 8, title: 'Binary Sunset', genre: 'house', duration: '1:15:30', plays: '10.2K', image: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=400', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' }
];

const CHAT_MESSAGES = [
    { user: 'NeonRider', msg: 'This drop is insane! 🔥' },
    { user: 'BassQueen', msg: 'DJ Smoke always delivers' },
    { user: 'CyberPunk2077', msg: 'Best stream of the week!' },
    { user: 'TechnoVibes', msg: 'Those visuals tho 👀' },
    { user: 'MidnightDancer', msg: 'Turn it up! 🎵' },
    { user: 'SynthWave', msg: 'Pure fire 🔥🔥🔥' },
    { user: 'DigitalNomad', msg: 'Greetings from Tokyo!' },
    { user: 'BeatMaster', msg: 'This is why I love AI Lounge' }
];

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initThreeJS();
    initAudioCanvas();
    initNavigation();
    initMixes();
    initVideoPlayer();
    initVisualizer();
    initChat();
    initCursor();
    initStats();
    initEventListeners();
});

function initLoader() {
    const loader = document.getElementById('loading-screen');
    setTimeout(() => {
        loader.classList.add('hidden');
        animateHeroEntrance();
    }, 2500);
}

// ============================================
// THREE.JS BACKGROUND
// ============================================
function initThreeJS() {
    const canvas = document.getElementById('three-canvas');
    
    // Scene
    STATE.threeScene = new THREE.Scene();
    STATE.threeScene.fog = new THREE.FogExp2(0x0a0a0f, 0.001);
    
    // Camera
    STATE.threeCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    STATE.threeCamera.position.z = 50;
    
    // Renderer
    STATE.threeRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    STATE.threeRenderer.setSize(window.innerWidth, window.innerHeight);
    STATE.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create particle system
    createParticleSystem();
    createWireframeSphere();
    createFloatingRings();
    createNeuralNetwork();
    
    // Post-processing
    initPostProcessing();
    
    // Animation loop
    animateThreeJS();
    
    // Resize handler
    window.addEventListener('resize', () => {
        STATE.threeCamera.aspect = window.innerWidth / window.innerHeight;
        STATE.threeCamera.updateProjectionMatrix();
        STATE.threeRenderer.setSize(window.innerWidth, window.innerHeight);
        if (STATE.composer) {
            STATE.composer.setSize(window.innerWidth, window.innerHeight);
        }
    });
}

function createParticleSystem() {
    const particleCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const colorPalette = [
        new THREE.Color(0x00f0ff),
        new THREE.Color(0xff00ff),
        new THREE.Color(0xffff00)
    ];
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
        
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        
        sizes[i] = Math.random() * 2 + 0.5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    STATE.threeScene.add(particles);
    STATE.particles.push(particles);
}

function createWireframeSphere() {
    const geometry = new THREE.IcosahedronGeometry(15, 2);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    sphere.name = 'mainSphere';
    STATE.threeScene.add(sphere);
}

function createFloatingRings() {
    const ringCount = 5;
    
    for (let i = 0; i < ringCount; i++) {
        const geometry = new THREE.TorusGeometry(20 + i * 8, 0.3, 16, 100);
        const material = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? 0x00f0ff : 0xff00ff,
            transparent: true,
            opacity: 0.2
        });
        
        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = Math.random() * Math.PI;
        ring.rotation.y = Math.random() * Math.PI;
        ring.name = `ring_${i}`;
        STATE.threeScene.add(ring);
    }
}

function createNeuralNetwork() {
    const nodeCount = 50;
    const nodes = [];
    const nodeGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    
    for (let i = 0; i < nodeCount; i++) {
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
        node.position.set(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100
        );
        nodes.push(node);
        STATE.threeScene.add(node);
    }
    
    // Create connections
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xff00ff,
        transparent: true,
        opacity: 0.1
    });
    
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const distance = nodes[i].position.distanceTo(nodes[j].position);
            if (distance < 30) {
                const geometry = new THREE.BufferGeometry().setFromPoints([
                    nodes[i].position,
                    nodes[j].position
                ]);
                const line = new THREE.Line(geometry, lineMaterial);
                STATE.threeScene.add(line);
            }
        }
    }
}

function initPostProcessing() {
    STATE.composer = new THREE.EffectComposer(STATE.threeRenderer);
    
    const renderPass = new THREE.RenderPass(STATE.threeScene, STATE.threeCamera);
    STATE.composer.addPass(renderPass);
    
    const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,
        0.4,
        0.85
    );
    bloomPass.threshold = 0;
    bloomPass.strength = 1.5;
    bloomPass.radius = 0.5;
    STATE.composer.addPass(bloomPass);
}

function animateThreeJS() {
    requestAnimationFrame(animateThreeJS);
    
    STATE.time += 0.01;
    
    // Rotate particles
    STATE.particles.forEach((p, i) => {
        p.rotation.y += 0.0005;
        p.rotation.x += 0.0002;
    });
    
    // Animate main sphere
    const sphere = STATE.threeScene.getObjectByName('mainSphere');
    if (sphere) {
        sphere.rotation.x += 0.002;
        sphere.rotation.y += 0.003;
        
        // Audio reactivity
        if (STATE.analyser) {
            STATE.analyser.getByteFrequencyData(STATE.audioData);
            const avg = STATE.audioData.reduce((a, b) => a + b) / STATE.audioData.length;
            sphere.scale.setScalar(1 + avg / 500);
        }
    }
    
    // Animate rings
    for (let i = 0; i < 5; i++) {
        const ring = STATE.threeScene.getObjectByName(`ring_${i}`);
        if (ring) {
            ring.rotation.x += 0.001 * (i + 1);
            ring.rotation.z += 0.002 * (i + 1);
        }
    }
    
    // Camera movement based on mouse
    STATE.threeCamera.position.x += (STATE.mouseX * 20 - STATE.threeCamera.position.x) * 0.02;
    STATE.threeCamera.position.y += (-STATE.mouseY * 20 - STATE.threeCamera.position.y) * 0.02;
    STATE.threeCamera.lookAt(STATE.threeScene.position);
    
    if (STATE.composer) {
        STATE.composer.render();
    } else {
        STATE.threeRenderer.render(STATE.threeScene, STATE.threeCamera);
    }
}

// ============================================
// AUDIO CANVAS VISUALIZER
// ============================================
function initAudioCanvas() {
    const canvas = document.getElementById('audio-canvas');
    const ctx = canvas.getContext('2d');
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    
    function draw() {
        requestAnimationFrame(draw);
        
        ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (STATE.analyser) {
            STATE.analyser.getByteFrequencyData(STATE.audioData);
            
            const barWidth = canvas.width / STATE.audioData.length * 2.5;
            let x = 0;
            
            for (let i = 0; i < STATE.audioData.length; i++) {
                const barHeight = STATE.audioData[i] * 2;
                
                const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
                gradient.addColorStop(0, '#00f0ff');
                gradient.addColorStop(0.5, '#ff00ff');
                gradient.addColorStop(1, '#ffff00');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
                
                x += barWidth;
            }
        }
    }
    draw();
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.dataset.section;
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            sections.forEach(s => {
                s.classList.remove('active');
                if (s.id === targetSection) {
                    s.classList.add('active');
                    gsap.fromTo(s, 
                        { opacity: 0, y: 30 },
                        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
                    );
                }
            });
        });
    });
    
    // Fullscreen button
    document.getElementById('fullscreen-btn').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
}

// ============================================
// MIXES GRID
// ============================================
function initMixes() {
    const grid = document.getElementById('mixes-grid');
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    function renderMixes(filter = 'all') {
        const filtered = filter === 'all' ? MIXES : MIXES.filter(m => m.genre === filter);
        
        grid.innerHTML = filtered.map(mix => `
            <div class="mix-card" data-id="${mix.id}" data-genre="${mix.genre}">
                <div class="mix-artwork">
                    <img src="${mix.image}" alt="${mix.title}">
                    <div class="mix-overlay">
                        <button class="mix-play-btn"><i class="fas fa-play"></i></button>
                    </div>
                </div>
                <div class="mix-info">
                    <span class="mix-genre">${mix.genre}</span>
                    <h3 class="mix-title">${mix.title}</h3>
                    <div class="mix-meta">
                        <span><i class="fas fa-clock"></i> ${mix.duration}</span>
                        <span><i class="fas fa-play"></i> ${mix.plays}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click handlers
        document.querySelectorAll('.mix-card').forEach(card => {
            card.addEventListener('click', () => {
                const mixId = parseInt(card.dataset.id);
                playMix(mixId);
            });
        });
    }
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderMixes(tab.dataset.filter);
        });
    });
    
    renderMixes();
}

function playMix(mixId) {
    const mix = MIXES.find(m => m.id === mixId);
    if (!mix) return;
    
    STATE.currentTrack = MIXES.indexOf(mix);
    
    // Update player UI
    document.getElementById('player-title').textContent = mix.title;
    document.getElementById('player-artwork').src = mix.image;
    document.getElementById('audio-player-container').classList.add('active');
    
    // Initialize audio if needed
    if (!STATE.audioContext) {
        initAudioContext();
    }
    
    // Create and play audio
    const audio = document.getElementById('main-audio') || createAudioElement();
    audio.src = mix.audio;
    audio.play();
    STATE.isPlaying = true;
    updatePlayButton();
}

function createAudioElement() {
    const audio = document.createElement('audio');
    audio.id = 'main-audio';
    audio.crossOrigin = 'anonymous';
    document.body.appendChild(audio);
    
    // Connect to audio context
    if (STATE.audioContext) {
        STATE.audioSource = STATE.audioContext.createMediaElementSource(audio);
        STATE.audioSource.connect(STATE.analyser);
        STATE.analyser.connect(STATE.audioContext.destination);
    }
    
    // Progress update
    audio.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        document.getElementById('audio-progress').style.width = `${progress}%`;
        document.getElementById('time-current').textContent = formatTime(audio.currentTime);
        document.getElementById('time-total').textContent = formatTime(audio.duration);
    });
    
    audio.addEventListener('ended', () => {
        nextTrack();
    });
    
    return audio;
}

function initAudioContext() {
    STATE.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    STATE.analyser = STATE.audioContext.createAnalyser();
    STATE.analyser.fftSize = 512;
    STATE.audioData = new Uint8Array(STATE.analyser.frequencyBinCount);
}

function updatePlayButton() {
    const btn = document.getElementById('play-pause');
    btn.innerHTML = STATE.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function nextTrack() {
    STATE.currentTrack = (STATE.currentTrack + 1) % MIXES.length;
    playMix(MIXES[STATE.currentTrack].id);
}

function prevTrack() {
    STATE.currentTrack = (STATE.currentTrack - 1 + MIXES.length) % MIXES.length;
    playMix(MIXES[STATE.currentTrack].id);
}

// ============================================
// VIDEO PLAYER
// ============================================
function initVideoPlayer() {
    const video = document.getElementById('main-video');
    const playBtn = document.getElementById('play-video');
    const overlay = document.querySelector('.video-overlay');
    const vidPlay = document.getElementById('vid-play');
    const vidStop = document.getElementById('vid-stop');
    const vidMute = document.getElementById('vid-mute');
    const vidFullscreen = document.getElementById('vid-fullscreen');
    const progressFill = document.querySelector('.video-controls .progress-fill');
    
    playBtn.addEventListener('click', () => {
        video.play();
        video.muted = false;
        overlay.classList.add('hidden');
    });
    
    vidPlay.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            vidPlay.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            video.pause();
            vidPlay.innerHTML = '<i class="fas fa-play"></i>';
        }
    });
    
    vidStop.addEventListener('click', () => {
        video.pause();
        video.currentTime = 0;
        vidPlay.innerHTML = '<i class="fas fa-play"></i>';
        overlay.classList.remove('hidden');
    });
    
    vidMute.addEventListener('click', () => {
        video.muted = !video.muted;
        vidMute.innerHTML = video.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    });
    
    vidFullscreen.addEventListener('click', () => {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        }
    });
    
    video.addEventListener('timeupdate', () => {
        const progress = (video.currentTime / video.duration) * 100;
        progressFill.style.width = `${progress}%`;
    });
}

// ============================================
// VISUAL CANVAS
// ============================================
function initVisualizer() {
    const canvas = document.getElementById('visual-canvas');
    const ctx = canvas.getContext('2d');
    const modeButtons = document.querySelectorAll('.visual-mode');
    
    function resize() {
        const wrapper = canvas.parentElement;
        canvas.width = wrapper.clientWidth;
        canvas.height = wrapper.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            STATE.visualMode = btn.dataset.mode;
        });
    });
    
    const intensitySlider = document.getElementById('intensity-slider');
    const colorSlider = document.getElementById('color-slider');
    const speedSlider = document.getElementById('speed-slider');
    
    let intensity = 50;
    let colorShift = 180;
    let speed = 50;
    
    intensitySlider.addEventListener('input', (e) => intensity = e.target.value);
    colorSlider.addEventListener('input', (e) => colorShift = e.target.value);
    speedSlider.addEventListener('input', (e) => speed = e.target.value);
    
    let time = 0;
    
    function draw() {
        requestAnimationFrame(draw);
        time += speed / 1000;
        
        ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const data = STATE.audioData;
        const avg = data.reduce((a, b) => a + b, 0) / data.length || 50;
        
        switch (STATE.visualMode) {
            case 'waveform':
                drawWaveform(ctx, canvas, data, intensity, colorShift, time);
                break;
            case 'particles':
                drawParticles(ctx, canvas, data, intensity, colorShift, time);
                break;
            case 'spectrum':
                drawSpectrum(ctx, canvas, data, intensity, colorShift);
                break;
            case 'tunnel':
                drawTunnel(ctx, canvas, data, intensity, colorShift, time);
                break;
            case 'matrix':
                drawMatrix(ctx, canvas, intensity, colorShift, time);
                break;
        }
    }
    draw();
}

function drawWaveform(ctx, canvas, data, intensity, colorShift, time) {
    const centerY = canvas.height / 2;
    const amplitude = intensity * 3;
    
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    
    for (let i = 0; i < canvas.width; i++) {
        const dataIndex = Math.floor((i / canvas.width) * data.length);
        const value = data[dataIndex] || 0;
        const y = centerY + Math.sin(i * 0.02 + time * 5) * (value / 255) * amplitude;
        ctx.lineTo(i, y);
    }
    
    ctx.strokeStyle = `hsl(${colorShift}, 100%, 50%)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Mirror
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    
    for (let i = 0; i < canvas.width; i++) {
        const dataIndex = Math.floor((i / canvas.width) * data.length);
        const value = data[dataIndex] || 0;
        const y = centerY - Math.sin(i * 0.02 + time * 5) * (value / 255) * amplitude;
        ctx.lineTo(i, y);
    }
    
    ctx.strokeStyle = `hsl(${(colorShift + 60) % 360}, 100%, 50%)`;
    ctx.stroke();
}

function drawParticles(ctx, canvas, data, intensity, colorShift, time) {
    const particleCount = intensity;
    const avg = data.reduce((a, b) => a + b, 0) / data.length || 50;
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + time;
        const radius = 100 + avg * 2;
        const x = canvas.width / 2 + Math.cos(angle) * radius;
        const y = canvas.height / 2 + Math.sin(angle) * radius;
        const size = (data[i % data.length] / 255) * 20 + 2;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${(colorShift + i * 3) % 360}, 100%, 50%, 0.8)`;
        ctx.fill();
    }
}

function drawSpectrum(ctx, canvas, data, intensity, colorShift) {
    const barCount = 64;
    const barWidth = canvas.width / barCount;
    const maxHeight = canvas.height * 0.8;
    
    for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * data.length);
        const value = data[dataIndex] || 0;
        const barHeight = (value / 255) * maxHeight * (intensity / 50);
        
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, `hsl(${(colorShift + i * 5) % 360}, 100%, 50%)`);
        gradient.addColorStop(1, `hsl(${(colorShift + i * 5 + 60) % 360}, 100%, 30%)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
        
        // Reflection
        ctx.fillStyle = `hsla(${(colorShift + i * 5) % 360}, 100%, 50%, 0.3)`;
        ctx.fillRect(i * barWidth, canvas.height, barWidth - 2, barHeight * 0.3);
    }
}

function drawTunnel(ctx, canvas, data, intensity, colorShift, time) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const rings = 20;
    const avg = data.reduce((a, b) => a + b, 0) / data.length || 50;
    
    for (let i = rings; i > 0; i--) {
        const radius = (i / rings) * Math.min(canvas.width, canvas.height) * 0.5 + time * 50 % 50;
        const distortion = Math.sin(time * 2 + i * 0.5) * (avg / 255) * intensity;
        
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius + distortion, radius * 0.6 + distortion, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${(colorShift + i * 15) % 360}, 100%, 50%, ${1 - i / rings})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function drawMatrix(ctx, canvas, intensity, colorShift, time) {
    const chars = 'AILOUNGE01アイラウンジ';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    
    if (!window.matrixDrops) {
        window.matrixDrops = Array(columns).fill(0);
    }
    
    ctx.fillStyle = `hsla(${colorShift}, 100%, 50%, 0.05)`;
    ctx.font = `${fontSize}px monospace`;
    
    for (let i = 0; i < columns; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = window.matrixDrops[i] * fontSize;
        
        ctx.fillStyle = `hsl(${colorShift}, 100%, ${50 + Math.random() * 50}%)`;
        ctx.fillText(char, x, y);
        
        if (y > canvas.height && Math.random() > 0.975) {
            window.matrixDrops[i] = 0;
        }
        window.matrixDrops[i] += intensity / 50;
    }
}

// ============================================
// CHAT SIMULATION
// ============================================
function initChat() {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat');
    const viewerCount = document.getElementById('viewer-count');
    
    // Simulate incoming messages
    setInterval(() => {
        const msg = CHAT_MESSAGES[Math.floor(Math.random() * CHAT_MESSAGES.length)];
        addChatMessage(msg.user, msg.msg);
    }, 5000);
    
    // Simulate viewer count changes
    setInterval(() => {
        const current = parseInt(viewerCount.textContent.replace(',', ''));
        const change = Math.floor(Math.random() * 20) - 10;
        viewerCount.textContent = (current + change).toLocaleString();
    }, 3000);
    
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    function sendMessage() {
        const text = chatInput.value.trim();
        if (text) {
            addChatMessage('You', text);
            chatInput.value = '';
        }
    }
    
    function addChatMessage(user, msg) {
        const div = document.createElement('div');
        div.className = 'chat-msg';
        div.innerHTML = `<span class="chat-user">${user}:</span> ${msg}`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Keep only last 50 messages
        while (chatMessages.children.length > 50) {
            chatMessages.removeChild(chatMessages.firstChild);
        }
    }
}

// ============================================
// CUSTOM CURSOR
// ============================================
function initCursor() {
    const cursor = document.getElementById('cursor-glow');
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 15 + 'px';
        cursor.style.top = e.clientY - 15 + 'px';
        
        STATE.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        STATE.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    });
    
    document.querySelectorAll('a, button, .mix-card, input').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// ============================================
// STATS COUNTER
// ============================================
function initStats() {
    const stats = document.querySelectorAll('.stat-value[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                animateCounter(el, target);
                observer.unobserve(el);
            }
        });
    });
    
    stats.forEach(stat => observer.observe(stat));
}

function animateCounter(el, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        el.textContent = Math.floor(current);
    }, 30);
}

// ============================================
// EVENT LISTENERS
// ============================================
function initEventListeners() {
    // Enter experience button
    document.getElementById('enter-experience').addEventListener('click', () => {
        document.querySelector('[data-section="live"]').click();
        if (!STATE.audioContext) {
            initAudioContext();
        }
    });
    
    // Watch live button
    document.getElementById('watch-live').addEventListener('click', () => {
        document.querySelector('[data-section="live"]').click();
    });
    
    // Player controls
    document.getElementById('play-pause').addEventListener('click', () => {
        const audio = document.getElementById('main-audio');
        if (audio) {
            if (audio.paused) {
                audio.play();
                STATE.isPlaying = true;
            } else {
                audio.pause();
                STATE.isPlaying = false;
            }
            updatePlayButton();
        }
    });
    
    document.getElementById('next-track').addEventListener('click', nextTrack);
    document.getElementById('prev-track').addEventListener('click', prevTrack);
    
    // Volume slider
    document.getElementById('volume-slider').addEventListener('input', (e) => {
        const audio = document.getElementById('main-audio');
        if (audio) {
            audio.volume = e.target.value / 100;
        }
    });
    
    // Progress track click
    document.getElementById('progress-track').addEventListener('click', (e) => {
        const audio = document.getElementById('main-audio');
        if (audio && audio.duration) {
            const rect = e.target.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audio.currentTime = percent * audio.duration;
        }
    });
}

// ============================================
// HERO ANIMATION
// ============================================
function animateHeroEntrance() {
    gsap.fromTo('.hero-title-wrapper', 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );
    
    gsap.fromTo('.hero-tagline',
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8, delay: 0.3, ease: 'power2.out' }
    );
    
    gsap.fromTo('.hero-cta',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: 'power2.out' }
    );
    
    gsap.fromTo('.hero-stats',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.7, ease: 'power2.out' }
    );
    
    gsap.fromTo('.scroll-indicator',
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 1.2 }
    );
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
    const audio = document.getElementById('main-audio');
    
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            if (audio) {
                if (audio.paused) {
                    audio.play();
                    STATE.isPlaying = true;
                } else {
                    audio.pause();
                    STATE.isPlaying = false;
                }
                updatePlayButton();
            }
            break;
        case 'ArrowRight':
            nextTrack();
            break;
        case 'ArrowLeft':
            prevTrack();
            break;
        case 'ArrowUp':
            if (audio) audio.volume = Math.min(1, audio.volume + 0.1);
            break;
        case 'ArrowDown':
            if (audio) audio.volume = Math.max(0, audio.volume - 0.1);
            break;
    }
});

console.log('%c AI LOUNGE AFTER DARK ', 'background: linear-gradient(90deg, #00f0ff, #ff00ff); color: #000; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c Presented by DJ Smoke Stream ', 'color: #00f0ff; font-size: 14px;');

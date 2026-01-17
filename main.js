/**
 * AI LOUNGE AFTER DARK - MEDIA VISUALIZER
 * Presented by DJ Smoke Stream
 * Upload ANY media and experience mind-blowing visuals
 */

class AILoungeVisualizer {
    constructor() {
        this.canvas = document.getElementById('visualizer-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.videoElement = document.getElementById('video-element');
        
        this.audioContext = null;
        this.analyser = null;
        this.audioSource = null;
        this.audioData = new Uint8Array(512);
        this.audioDataFloat = new Float32Array(512);
        
        this.playlist = [];
        this.currentIndex = -1;
        this.isPlaying = false;
        this.mediaType = null;
        
        this.settings = {
            mode: 'bars',
            colorScheme: 'cyber',
            intensity: 70,
            speed: 50,
            glow: 60,
            zoom: 50,
            mirror: true,
            rotate: false,
            pulseBg: true,
            bassShake: false
        };
        
        this.colorSchemes = {
            cyber: ['#00f0ff', '#ff00ff', '#ffff00', '#00ff88'],
            fire: ['#ff4500', '#ff6b6b', '#ffff00', '#ff8c00'],
            matrix: ['#00ff00', '#00cc00', '#009900', '#00ff66'],
            ocean: ['#0066ff', '#00ffff', '#0099ff', '#00ccff'],
            sunset: ['#ff6b6b', '#feca57', '#ff9ff3', '#ff6348'],
            purple: ['#a855f7', '#ec4899', '#8b5cf6', '#d946ef'],
            rainbow: ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#8800ff']
        };
        
        this.particles = [];
        this.time = 0;
        this.rotation = 0;
        this.bassLevel = 0;
        this.matrixDrops = [];
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupDragDrop();
        this.animate();
        
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
        }, 2500);
    }
    
    setupCanvas() {
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.initMatrixDrops();
        };
        resize();
        window.addEventListener('resize', resize);
    }
    
    initMatrixDrops() {
        const columns = Math.floor(this.canvas.width / 20);
        this.matrixDrops = Array(columns).fill(0).map(() => Math.random() * this.canvas.height);
    }
    
    setupEventListeners() {
        // File input
        document.getElementById('file-input').addEventListener('change', (e) => this.handleFiles(e.target.files));
        document.getElementById('add-files-input').addEventListener('change', (e) => this.handleFiles(e.target.files));
        
        // URL input
        document.getElementById('url-load-btn').addEventListener('click', () => this.loadFromURL());
        document.getElementById('url-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.loadFromURL();
        });
        
        // Demo button
        document.getElementById('demo-btn').addEventListener('click', () => this.loadDemo());
        
        // Playback controls
        document.getElementById('play-btn').addEventListener('click', () => this.togglePlay());
        document.getElementById('prev-btn').addEventListener('click', () => this.playPrev());
        document.getElementById('next-btn').addEventListener('click', () => this.playNext());
        document.getElementById('back-btn').addEventListener('click', () => this.showDropZone());
        
        // Volume
        document.getElementById('volume-slider').addEventListener('input', (e) => this.setVolume(e.target.value / 100));
        document.getElementById('mute-btn').addEventListener('click', () => this.toggleMute());
        
        // Progress bar
        document.getElementById('progress-bar').addEventListener('click', (e) => this.seekTo(e));
        
        // Visualizer modes
        document.querySelectorAll('.viz-mode').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.viz-mode').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.settings.mode = btn.dataset.mode;
            });
        });
        
        // Color schemes
        document.querySelectorAll('.color-scheme').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-scheme').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.settings.colorScheme = btn.dataset.scheme;
            });
        });
        
        // Sliders
        document.getElementById('intensity-slider').addEventListener('input', (e) => this.settings.intensity = parseInt(e.target.value));
        document.getElementById('speed-slider').addEventListener('input', (e) => this.settings.speed = parseInt(e.target.value));
        document.getElementById('glow-slider').addEventListener('input', (e) => this.settings.glow = parseInt(e.target.value));
        document.getElementById('zoom-slider').addEventListener('input', (e) => this.settings.zoom = parseInt(e.target.value));
        
        // Toggles
        document.getElementById('mirror-toggle').addEventListener('change', (e) => this.settings.mirror = e.target.checked);
        document.getElementById('rotate-toggle').addEventListener('change', (e) => this.settings.rotate = e.target.checked);
        document.getElementById('pulse-toggle').addEventListener('change', (e) => this.settings.pulseBg = e.target.checked);
        document.getElementById('shake-toggle').addEventListener('change', (e) => this.settings.bassShake = e.target.checked);
        
        // Panel toggles
        document.getElementById('toggle-playlist').addEventListener('click', () => {
            document.getElementById('playlist-panel').classList.toggle('active');
            document.getElementById('toggle-playlist').classList.toggle('active');
        });
        
        document.getElementById('toggle-controls').addEventListener('click', () => {
            document.getElementById('visualizer-controls').classList.toggle('active');
            document.getElementById('toggle-controls').classList.toggle('active');
        });
        
        // Clear playlist
        document.getElementById('clear-playlist').addEventListener('click', () => this.clearPlaylist());
        
        // Fullscreen
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Video events
        this.videoElement.addEventListener('timeupdate', () => this.updateProgress());
        this.videoElement.addEventListener('ended', () => this.playNext());
        this.videoElement.addEventListener('loadedmetadata', () => this.updateDuration());
    }
    
    setupDragDrop() {
        const dropZone = document.getElementById('drop-zone');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
            dropZone.addEventListener(event, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
            document.body.addEventListener(event, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        ['dragenter', 'dragover'].forEach(event => {
            dropZone.addEventListener(event, () => dropZone.classList.add('dragover'));
        });
        
        ['dragleave', 'drop'].forEach(event => {
            dropZone.addEventListener(event, () => dropZone.classList.remove('dragover'));
        });
        
        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length) this.handleFiles(files);
        });
    }
    
    handleFiles(files) {
        Array.from(files).forEach(file => {
            const type = this.getMediaType(file);
            if (type) {
                const url = URL.createObjectURL(file);
                this.addToPlaylist({
                    name: file.name,
                    url: url,
                    type: type,
                    file: file
                });
            }
        });
        
        if (this.playlist.length && this.currentIndex === -1) {
            this.playIndex(0);
        }
    }
    
    getMediaType(file) {
        if (file.type.startsWith('audio/')) return 'audio';
        if (file.type.startsWith('video/')) return 'video';
        if (file.type.startsWith('image/')) return 'image';
        return null;
    }
    
    addToPlaylist(item) {
        this.playlist.push(item);
        this.renderPlaylist();
    }
    
    renderPlaylist() {
        const container = document.getElementById('playlist-items');
        container.innerHTML = this.playlist.map((item, index) => `
            <div class="playlist-item ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="playlist-item-thumb">
                    ${item.type === 'image' ? `<img src="${item.url}" alt="">` : 
                      item.type === 'video' ? '<i class="fas fa-video"></i>' : 
                      '<i class="fas fa-music"></i>'}
                </div>
                <div class="playlist-item-info">
                    <div class="playlist-item-title">${item.name}</div>
                    <div class="playlist-item-type">${item.type}</div>
                </div>
                <button class="playlist-item-remove" data-index="${index}"><i class="fas fa-times"></i></button>
            </div>
        `).join('');
        
        container.querySelectorAll('.playlist-item').forEach(el => {
            el.addEventListener('click', (e) => {
                if (!e.target.closest('.playlist-item-remove')) {
                    this.playIndex(parseInt(el.dataset.index));
                }
            });
        });
        
        container.querySelectorAll('.playlist-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFromPlaylist(parseInt(btn.dataset.index));
            });
        });
    }
    
    removeFromPlaylist(index) {
        if (index === this.currentIndex) {
            this.stop();
        }
        this.playlist.splice(index, 1);
        if (this.currentIndex >= index && this.currentIndex > 0) {
            this.currentIndex--;
        }
        this.renderPlaylist();
        
        if (this.playlist.length === 0) {
            this.showDropZone();
        }
    }
    
    clearPlaylist() {
        this.stop();
        this.playlist = [];
        this.currentIndex = -1;
        this.renderPlaylist();
        this.showDropZone();
    }
    
    playIndex(index) {
        if (index < 0 || index >= this.playlist.length) return;
        
        this.currentIndex = index;
        const item = this.playlist[index];
        this.mediaType = item.type;
        
        document.getElementById('media-title').textContent = item.name;
        document.getElementById('media-type').textContent = item.type.toUpperCase();
        
        this.hideDropZone();
        this.renderPlaylist();
        
        if (item.type === 'audio') {
            this.playAudio(item.url);
        } else if (item.type === 'video') {
            this.playVideo(item.url);
        } else if (item.type === 'image') {
            this.displayImage(item.url);
        }
    }
    
    async playAudio(url) {
        this.videoElement.classList.remove('visible');
        
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 1024;
            this.analyser.smoothingTimeConstant = 0.8;
        }
        
        if (this.audioSource) {
            this.audioSource.disconnect();
        }
        
        this.videoElement.src = url;
        this.videoElement.load();
        
        try {
            this.audioSource = this.audioContext.createMediaElementSource(this.videoElement);
            this.audioSource.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
        } catch (e) {
            // Already connected
        }
        
        await this.videoElement.play();
        this.isPlaying = true;
        this.updatePlayButton();
    }
    
    async playVideo(url) {
        this.videoElement.classList.add('visible');
        this.videoElement.src = url;
        this.videoElement.load();
        
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 1024;
            this.analyser.smoothingTimeConstant = 0.8;
        }
        
        if (this.audioSource) {
            try { this.audioSource.disconnect(); } catch(e) {}
        }
        
        try {
            this.audioSource = this.audioContext.createMediaElementSource(this.videoElement);
            this.audioSource.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
        } catch (e) {
            // Already connected
        }
        
        await this.videoElement.play();
        this.isPlaying = true;
        this.updatePlayButton();
    }
    
    displayImage(url) {
        this.videoElement.classList.remove('visible');
        this.isPlaying = true;
        this.updatePlayButton();
        
        // Create image for visualization
        this.currentImage = new Image();
        this.currentImage.src = url;
        
        // Generate fake audio data for image visualization
        this.generateImageVisualization();
    }
    
    generateImageVisualization() {
        // Create oscillating data for images
        if (this.mediaType === 'image') {
            for (let i = 0; i < this.audioData.length; i++) {
                this.audioData[i] = 128 + Math.sin(this.time * 2 + i * 0.1) * 64 + Math.sin(this.time * 5 + i * 0.05) * 32;
            }
        }
    }
    
    loadFromURL() {
        const url = document.getElementById('url-input').value.trim();
        if (!url) return;
        
        // Determine type from URL
        let type = 'audio';
        if (url.match(/\.(mp4|webm|mov|avi|mkv)(\?|$)/i)) type = 'video';
        else if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i)) type = 'image';
        else if (url.includes('youtube.com') || url.includes('youtu.be')) {
            alert('YouTube URLs require a backend proxy. Please download the video and upload it directly.');
            return;
        }
        
        this.addToPlaylist({
            name: url.split('/').pop().split('?')[0] || 'Media from URL',
            url: url,
            type: type
        });
        
        document.getElementById('url-input').value = '';
        
        if (this.currentIndex === -1) {
            this.playIndex(0);
        }
    }
    
    loadDemo() {
        const demos = [
            { name: 'Synthwave Dreams', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', type: 'audio' },
            { name: 'Electronic Pulse', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', type: 'audio' },
            { name: 'Digital Horizon', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', type: 'audio' }
        ];
        
        demos.forEach(demo => this.addToPlaylist(demo));
        this.playIndex(0);
    }
    
    togglePlay() {
        if (this.isPlaying) {
            this.videoElement.pause();
            this.isPlaying = false;
        } else {
            this.videoElement.play();
            this.isPlaying = true;
        }
        this.updatePlayButton();
    }
    
    stop() {
        this.videoElement.pause();
        this.videoElement.currentTime = 0;
        this.isPlaying = false;
        this.updatePlayButton();
    }
    
    playNext() {
        if (this.currentIndex < this.playlist.length - 1) {
            this.playIndex(this.currentIndex + 1);
        } else if (this.playlist.length > 0) {
            this.playIndex(0);
        }
    }
    
    playPrev() {
        if (this.currentIndex > 0) {
            this.playIndex(this.currentIndex - 1);
        } else if (this.playlist.length > 0) {
            this.playIndex(this.playlist.length - 1);
        }
    }
    
    updatePlayButton() {
        const btn = document.getElementById('play-btn');
        btn.innerHTML = this.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }
    
    setVolume(value) {
        this.videoElement.volume = value;
        this.updateVolumeIcon();
    }
    
    toggleMute() {
        this.videoElement.muted = !this.videoElement.muted;
        this.updateVolumeIcon();
    }
    
    updateVolumeIcon() {
        const btn = document.getElementById('mute-btn');
        if (this.videoElement.muted || this.videoElement.volume === 0) {
            btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else if (this.videoElement.volume < 0.5) {
            btn.innerHTML = '<i class="fas fa-volume-down"></i>';
        } else {
            btn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    }
    
    seekTo(e) {
        const bar = document.getElementById('progress-bar');
        const rect = bar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.videoElement.currentTime = percent * this.videoElement.duration;
    }
    
    updateProgress() {
        if (!this.videoElement.duration) return;
        const percent = (this.videoElement.currentTime / this.videoElement.duration) * 100;
        document.getElementById('progress-fill').style.width = `${percent}%`;
        document.getElementById('progress-handle').style.left = `${percent}%`;
        document.getElementById('time-current').textContent = this.formatTime(this.videoElement.currentTime);
    }
    
    updateDuration() {
        document.getElementById('time-total').textContent = this.formatTime(this.videoElement.duration);
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    showDropZone() {
        document.getElementById('drop-zone').classList.add('active');
        document.getElementById('controls-panel').classList.remove('active');
        document.getElementById('toggle-playlist').style.display = 'none';
        document.getElementById('toggle-controls').style.display = 'none';
        this.videoElement.classList.remove('visible');
    }
    
    hideDropZone() {
        document.getElementById('drop-zone').classList.remove('active');
        document.getElementById('controls-panel').classList.add('active');
        document.getElementById('toggle-playlist').style.display = 'block';
        document.getElementById('toggle-controls').style.display = 'block';
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    handleKeyboard(e) {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowRight':
                this.playNext();
                break;
            case 'ArrowLeft':
                this.playPrev();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.setVolume(Math.min(1, this.videoElement.volume + 0.1));
                document.getElementById('volume-slider').value = this.videoElement.volume * 100;
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.setVolume(Math.max(0, this.videoElement.volume - 0.1));
                document.getElementById('volume-slider').value = this.videoElement.volume * 100;
                break;
            case 'KeyM':
                this.toggleMute();
                break;
            case 'KeyF':
                this.toggleFullscreen();
                break;
        }
    }
    
    getColors() {
        return this.colorSchemes[this.settings.colorScheme] || this.colorSchemes.cyber;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.016 * (this.settings.speed / 50);
        if (this.settings.rotate) {
            this.rotation += 0.005 * (this.settings.speed / 50);
        }
        
        // Get audio data
        if (this.analyser && this.isPlaying && this.mediaType !== 'image') {
            this.analyser.getByteFrequencyData(this.audioData);
            this.analyser.getFloatFrequencyData(this.audioDataFloat);
        } else if (this.mediaType === 'image') {
            this.generateImageVisualization();
        }
        
        // Calculate bass level
        let bassSum = 0;
        for (let i = 0; i < 10; i++) {
            bassSum += this.audioData[i];
        }
        this.bassLevel = bassSum / 10 / 255;
        
        // Bass shake effect
        if (this.settings.bassShake && this.bassLevel > 0.7) {
            document.body.classList.add('shake');
            setTimeout(() => document.body.classList.remove('shake'), 50);
        }
        
        this.draw();
    }
    
    draw() {
        const { width, height } = this.canvas;
        const colors = this.getColors();
        const intensity = this.settings.intensity / 50;
        const glow = this.settings.glow;
        const zoom = this.settings.zoom / 50;
        
        // Clear with fade effect
        this.ctx.fillStyle = this.settings.pulseBg 
            ? `rgba(5, 5, 8, ${0.1 + this.bassLevel * 0.1})`
            : 'rgba(5, 5, 8, 0.15)';
        this.ctx.fillRect(0, 0, width, height);
        
        // Apply rotation
        this.ctx.save();
        if (this.settings.rotate) {
            this.ctx.translate(width / 2, height / 2);
            this.ctx.rotate(this.rotation);
            this.ctx.translate(-width / 2, -height / 2);
        }
        
        // Set glow
        this.ctx.shadowBlur = glow;
        this.ctx.shadowColor = colors[0];
        
        // Draw based on mode
        switch (this.settings.mode) {
            case 'bars':
                this.drawBars(colors, intensity, zoom);
                break;
            case 'wave':
                this.drawWave(colors, intensity, zoom);
                break;
            case 'circular':
                this.drawCircular(colors, intensity, zoom);
                break;
            case 'particles':
                this.drawParticles(colors, intensity, zoom);
                break;
            case 'galaxy':
                this.drawGalaxy(colors, intensity, zoom);
                break;
            case 'dna':
                this.drawDNA(colors, intensity, zoom);
                break;
            case 'terrain':
                this.drawTerrain(colors, intensity, zoom);
                break;
            case 'matrix':
                this.drawMatrix(colors, intensity);
                break;
            case 'fire':
                this.drawFire(colors, intensity, zoom);
                break;
            case 'kaleidoscope':
                this.drawKaleidoscope(colors, intensity, zoom);
                break;
        }
        
        this.ctx.restore();
        
        // Draw image if present
        if (this.mediaType === 'image' && this.currentImage && this.currentImage.complete) {
            this.ctx.globalAlpha = 0.3 + this.bassLevel * 0.3;
            const scale = 0.5 + this.bassLevel * 0.2;
            const imgW = this.currentImage.width * scale;
            const imgH = this.currentImage.height * scale;
            this.ctx.drawImage(
                this.currentImage,
                (width - imgW) / 2,
                (height - imgH) / 2,
                imgW,
                imgH
            );
            this.ctx.globalAlpha = 1;
        }
    }
    
    drawBars(colors, intensity, zoom) {
        const { width, height } = this.canvas;
        const barCount = 128;
        const barWidth = (width / barCount) * zoom;
        const gap = 2;
        
        for (let i = 0; i < barCount; i++) {
            const value = this.audioData[i * 2] || 0;
            const barHeight = (value / 255) * height * 0.8 * intensity;
            const x = (width - barCount * barWidth) / 2 + i * barWidth;
            
            const gradient = this.ctx.createLinearGradient(0, height - barHeight, 0, height);
            gradient.addColorStop(0, colors[i % colors.length]);
            gradient.addColorStop(1, colors[(i + 1) % colors.length]);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, height - barHeight, barWidth - gap, barHeight);
            
            if (this.settings.mirror) {
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillRect(x, 0, barWidth - gap, barHeight * 0.5);
                this.ctx.globalAlpha = 1;
            }
        }
    }
    
    drawWave(colors, intensity, zoom) {
        const { width, height } = this.canvas;
        const centerY = height / 2;
        
        for (let w = 0; w < 3; w++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, centerY);
            
            for (let i = 0; i < width; i += 2) {
                const dataIndex = Math.floor((i / width) * this.audioData.length);
                const value = this.audioData[dataIndex] || 0;
                const amplitude = (value / 255) * height * 0.4 * intensity * zoom;
                const y = centerY + Math.sin(i * 0.01 + this.time * 3 + w) * amplitude;
                this.ctx.lineTo(i, y);
            }
            
            this.ctx.strokeStyle = colors[w % colors.length];
            this.ctx.lineWidth = 3 - w;
            this.ctx.stroke();
            
            if (this.settings.mirror) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, centerY);
                for (let i = 0; i < width; i += 2) {
                    const dataIndex = Math.floor((i / width) * this.audioData.length);
                    const value = this.audioData[dataIndex] || 0;
                    const amplitude = (value / 255) * height * 0.4 * intensity * zoom;
                    const y = centerY - Math.sin(i * 0.01 + this.time * 3 + w) * amplitude;
                    this.ctx.lineTo(i, y);
                }
                this.ctx.strokeStyle = colors[(w + 1) % colors.length];
                this.ctx.globalAlpha = 0.5;
                this.ctx.stroke();
                this.ctx.globalAlpha = 1;
            }
        }
    }
    
    drawCircular(colors, intensity, zoom) {
        const { width, height } = this.canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = Math.min(width, height) * 0.2 * zoom;
        
        const bars = 180;
        for (let i = 0; i < bars; i++) {
            const angle = (i / bars) * Math.PI * 2;
            const dataIndex = Math.floor((i / bars) * this.audioData.length);
            const value = this.audioData[dataIndex] || 0;
            const barLength = (value / 255) * baseRadius * intensity;
            
            const x1 = centerX + Math.cos(angle) * baseRadius;
            const y1 = centerY + Math.sin(angle) * baseRadius;
            const x2 = centerX + Math.cos(angle) * (baseRadius + barLength);
            const y2 = centerY + Math.sin(angle) * (baseRadius + barLength);
            
            const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, colors[i % colors.length]);
            gradient.addColorStop(1, colors[(i + 2) % colors.length]);
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            if (this.settings.mirror) {
                const x3 = centerX + Math.cos(angle) * (baseRadius - barLength * 0.5);
                const y3 = centerY + Math.sin(angle) * (baseRadius - barLength * 0.5);
                this.ctx.globalAlpha = 0.3;
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x3, y3);
                this.ctx.stroke();
                this.ctx.globalAlpha = 1;
            }
        }
        
        // Center circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, baseRadius * (0.8 + this.bassLevel * 0.2), 0, Math.PI * 2);
        this.ctx.strokeStyle = colors[0];
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    drawParticles(colors, intensity, zoom) {
        const { width, height } = this.canvas;
        const particleCount = 200 * intensity;
        
        for (let i = 0; i < particleCount; i++) {
            const dataIndex = i % this.audioData.length;
            const value = this.audioData[dataIndex] || 0;
            
            const angle = (i / particleCount) * Math.PI * 2 + this.time;
            const radius = 100 + (value / 255) * 300 * zoom;
            const x = width / 2 + Math.cos(angle) * radius;
            const y = height / 2 + Math.sin(angle) * radius;
            const size = (value / 255) * 8 + 2;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = colors[i % colors.length];
            this.ctx.fill();
        }
    }
    
    drawGalaxy(colors, intensity, zoom) {
        const { width, height } = this.canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        
        const arms = 5;
        const starsPerArm = 100;
        
        for (let arm = 0; arm < arms; arm++) {
            const armAngle = (arm / arms) * Math.PI * 2;
            
            for (let i = 0; i < starsPerArm; i++) {
                const dataIndex = (arm * starsPerArm + i) % this.audioData.length;
                const value = this.audioData[dataIndex] || 0;
                
                const distance = (i / starsPerArm) * Math.min(width, height) * 0.4 * zoom;
                const spiralAngle = armAngle + (i / starsPerArm) * Math.PI * 2 + this.time * 0.5;
                const wobble = Math.sin(this.time * 2 + i * 0.1) * 20;
                
                const x = centerX + Math.cos(spiralAngle) * (distance + wobble);
                const y = centerY + Math.sin(spiralAngle) * (distance + wobble);
                const size = (value / 255) * 6 * intensity + 1;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fillStyle = colors[arm % colors.length];
                this.ctx.fill();
            }
        }
        
        // Center glow
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100 * zoom);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(centerX - 100, centerY - 100, 200, 200);
    }
    
    drawDNA(colors, intensity, zoom) {
        const { width, height } = this.canvas;
        const centerY = height / 2;
        
        const segments = 50;
        const segmentWidth = width / segments;
        
        for (let i = 0; i < segments; i++) {
            const dataIndex = Math.floor((i / segments) * this.audioData.length);
            const value = this.audioData[dataIndex] || 0;
            
            const x = i * segmentWidth;
            const amplitude = 100 + (value / 255) * 150 * intensity * zoom;
            const phase = this.time * 3 + i * 0.3;
            
            const y1 = centerY + Math.sin(phase) * amplitude;
            const y2 = centerY - Math.sin(phase) * amplitude;
            
            // Helix strands
            this.ctx.beginPath();
            this.ctx.arc(x, y1, 8, 0, Math.PI * 2);
            this.ctx.fillStyle = colors[0];
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(x, y2, 8, 0, Math.PI * 2);
            this.ctx.fillStyle = colors[1];
            this.ctx.fill();
            
            // Connecting bars
            if (i % 3 === 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, y1);
                this.ctx.lineTo(x, y2);
                this.ctx.strokeStyle = colors[2] || colors[0];
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        }
    }
    
    drawTerrain(colors, intensity, zoom) {
        const { width, height } = this.canvas;
        const rows = 30;
        const cols = 60;
        const cellWidth = width / cols;
        const cellHeight = height / rows;
        
        for (let row = 0; row < rows; row++) {
            this.ctx.beginPath();
            
            for (let col = 0; col <= cols; col++) {
                const dataIndex = Math.floor((col / cols) * this.audioData.length);
                const value = this.audioData[dataIndex] || 0;
                
                const x = col * cellWidth;
                const baseY = row * cellHeight;
                const elevation = (value / 255) * 100 * intensity * zoom;
                const wave = Math.sin(col * 0.1 + this.time * 2 + row * 0.5) * 20;
                const y = baseY - elevation - wave;
                
                if (col === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            const colorIndex = Math.floor((row / rows) * colors.length);
            this.ctx.strokeStyle = colors[colorIndex % colors.length];
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
    
    drawMatrix(colors, intensity) {
        const { width, height } = this.canvas;
        const fontSize = 16;
        const chars = 'AILOUNGE01アイラウンジAFTERDARK';
        
        this.ctx.font = `${fontSize}px monospace`;
        
        for (let i = 0; i < this.matrixDrops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const x = i * 20;
            const y = this.matrixDrops[i];
            
            const dataIndex = i % this.audioData.length;
            const value = this.audioData[dataIndex] || 0;
            const brightness = 50 + (value / 255) * 50;
            
            this.ctx.fillStyle = colors[0].replace(')', `, ${brightness / 100})`).replace('rgb', 'rgba').replace('#', '');
            if (colors[0].startsWith('#')) {
                this.ctx.fillStyle = colors[0];
                this.ctx.globalAlpha = brightness / 100;
            }
            this.ctx.fillText(char, x, y);
            this.ctx.globalAlpha = 1;
            
            this.matrixDrops[i] += fontSize * intensity * 0.3;
            
            if (this.matrixDrops[i] > height && Math.random() > 0.98) {
                this.matrixDrops[i] = 0;
            }
        }
    }
    
    drawFire(colors, intensity, zoom) {
        const { width, height } = this.canvas;
        const particles = 150;
        
        for (let i = 0; i < particles; i++) {
            const dataIndex = i % this.audioData.length;
            const value = this.audioData[dataIndex] || 0;
            
            const x = (i / particles) * width + Math.sin(this.time * 5 + i) * 30;
            const baseY = height;
            const flameHeight = (value / 255) * height * 0.7 * intensity * zoom;
            const y = baseY - flameHeight - Math.random() * 50;
            
            const size = (value / 255) * 30 + 5;
            
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(0.5, colors[1] || colors[0]);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x - size, y - size, size * 2, size * 2);
        }
    }
    
    drawKaleidoscope(colors, intensity, zoom) {
        const { width, height } = this.canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        const segments = 12;
        
        for (let seg = 0; seg < segments; seg++) {
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate((seg / segments) * Math.PI * 2);
            
            const points = 30;
            this.ctx.beginPath();
            
            for (let i = 0; i < points; i++) {
                const dataIndex = (seg * points + i) % this.audioData.length;
                const value = this.audioData[dataIndex] || 0;
                
                const angle = (i / points) * (Math.PI / segments);
                const radius = 50 + (value / 255) * 300 * intensity * zoom;
                const x = Math.cos(angle + this.time) * radius;
                const y = Math.sin(angle + this.time) * radius;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.closePath();
            this.ctx.strokeStyle = colors[seg % colors.length];
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            if (this.settings.mirror) {
                this.ctx.scale(1, -1);
                this.ctx.globalAlpha = 0.3;
                this.ctx.stroke();
                this.ctx.globalAlpha = 1;
            }
            
            this.ctx.restore();
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.visualizer = new AILoungeVisualizer();
});

console.log('%c AI LOUNGE AFTER DARK ', 'background: linear-gradient(90deg, #00f0ff, #ff00ff, #ffff00); color: #000; font-size: 24px; font-weight: bold; padding: 15px; border-radius: 10px;');
console.log('%c MEDIA VISUALIZER - Presented by DJ Smoke Stream ', 'color: #00f0ff; font-size: 14px; text-shadow: 0 0 10px #00f0ff;');
console.log('%c Drop any audio, video, or image to experience the magic! ', 'color: #ff00ff; font-size: 12px;');

class Firework {
    constructor(x, y, color = null) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.color = color || this.getRandomColor();
        this.createParticles();
    }
    
    getRandomColor() {
        const colors = [
            '#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', 
            '#EF476F', '#9D4EDD', '#FF9E00', '#00BBF9',
            '#FF005C', '#00FFAA', '#FFAA00', '#AA00FF'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    createParticles() {
        const particleCount = 100;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 4,
                decay: 0.95 + Math.random() * 0.04,
                gravity: 0.05,
                alpha: 1,
                color: this.color
            });
        }
    }
    
    update() {
        for (let particle of this.particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += particle.gravity;
            particle.vx *= particle.decay;
            particle.vy *= particle.decay;
            particle.alpha *= 0.985;
            particle.size *= 0.99;
        }
        
        this.particles = this.particles.filter(p => p.alpha > 0.05 && p.size > 0.1);
    }
    
    draw(ctx) {
        for (let particle of this.particles) {
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    
    isFinished() {
        return this.particles.length === 0;
    }
}

class FireworksApp {
    constructor() {
        this.canvas = document.getElementById('fireworksCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.fireworks = [];
        this.autoFireInterval = null;
        this.isAutoFiring = false;
        this.animationId = null;
        this.stars = [];
        
        this.init();
    }
    
    init() {
        // Установка размеров canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Создаем звезды для фона
        this.createStars();
        
        // Обработчики событий
        document.addEventListener('click', (e) => {
            this.createFirework(e.clientX, e.clientY);
        });
        
        document.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.createFirework(touch.clientX, touch.clientY);
        });
        
        // Кнопки управления
        document.getElementById('autoFire').addEventListener('click', () => this.toggleAutoFire());
        document.getElementById('stopFire').addEventListener('click', () => this.stopAutoFire());
        document.getElementById('clearScreen').addEventListener('click', () => this.clearFireworks());
        
        // Начать анимацию
        this.startAnimation();
        
        // Запустить несколько салютов при старте
        setTimeout(() => this.startupFireworks(), 500);
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createStars(); // Пересоздаем звезды при изменении размера
    }
    
    createStars() {
        this.stars = [];
        const starCount = 150;
        
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 1.5,
                brightness: Math.random() * 0.5 + 0.3
            });
        }
    }
    
    createFirework(x, y, color = null) {
        // Создаем несколько салютов в одном месте для эффекта
        for (let i = 0; i < 1; i++) {
            const offsetX = (Math.random() - 0.5) * 30;
            const offsetY = (Math.random() - 0.5) * 30;
            this.fireworks.push(new Firework(x + offsetX, y + offsetY, color));
        }
        
        // Создаем звуковой эффект
        this.playFireworkSound();
    }
    
    playFireworkSound() {
        // Простой звуковой эффект через Web Audio API
        try {
            if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
                const audioContext = new (AudioContext || webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800;
                oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
                
                gainNode.gain.value = 0.1;
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.5);
            }
        } catch (e) {
            // Игнорируем ошибки аудио
            console.log("Audio not supported");
        }
    }
    
    startupFireworks() {
        // Несколько салютов при запуске
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const x = 100 + Math.random() * (this.canvas.width - 200);
                const y = 100 + Math.random() * (this.canvas.height - 200);
                this.createFirework(x, y);
            }, i * 400);
        }
    }
    
    toggleAutoFire() {
        if (this.isAutoFiring) {
            this.stopAutoFire();
        } else {
            this.startAutoFire();
        }
    }
    
    startAutoFire() {
        this.isAutoFiring = true;
        document.getElementById('autoFire').innerHTML = '<i class="fas fa-pause"></i> Пауза';
        document.getElementById('autoFire').style.background = 'linear-gradient(45deg, #ff9a00, #ff5e00)';
        
        this.autoFireInterval = setInterval(() => {
            const x = 100 + Math.random() * (this.canvas.width - 200);
            const y = 100 + Math.random() * (this.canvas.height - 200);
            this.createFirework(x, y);
        }, 800);
    }
    
    stopAutoFire() {
        this.isAutoFiring = false;
        document.getElementById('autoFire').innerHTML = '<i class="fas fa-play"></i> Автозапуск';
        document.getElementById('autoFire').style.background = 'linear-gradient(45deg, #6a11cb, #2575fc)';
        
        if (this.autoFireInterval) {
            clearInterval(this.autoFireInterval);
            this.autoFireInterval = null;
        }
    }
    
    clearFireworks() {
        this.fireworks = [];
    }
    
    drawBackground() {
        // Градиентный фон
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0f0c29');
        gradient.addColorStop(0.5, '#302b63');
        gradient.addColorStop(1, '#24243e');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем звезды
        for (let star of this.stars) {
            this.ctx.globalAlpha = star.brightness;
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
    }
    
    startAnimation() {
        const animate = () => {
            // Очищаем canvas с эффектом размытия
            this.ctx.fillStyle = 'rgba(15, 12, 41, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Обновляем и рисуем салюты
            for (let i = this.fireworks.length - 1; i >= 0; i--) {
                const firework = this.fireworks[i];
                firework.update();
                firework.draw(this.ctx);
                
                if (firework.isFinished()) {
                    this.fireworks.splice(i, 1);
                }
            }
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
}

// Запускаем приложение когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    console.log('Fireworks app starting...');
    try {
        new FireworksApp();
        console.log('Fireworks app started successfully!');
    } catch (error) {
        console.error('Error starting fireworks app:', error);
        alert('Произошла ошибка при запуске салюта. Проверьте консоль для подробностей.');
    }
});

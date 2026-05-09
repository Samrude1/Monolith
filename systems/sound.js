class SoundSystem {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    playTone(freq, type, duration, volume = 0.1) {
        if (!this.ctx || !this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playStep() {
        this.playTone(150, 'sine', 0.1, 0.05);
    }

    playHit() {
        // Player attacks monster
        this.playTone(200, 'square', 0.2, 0.1);
        this.playTone(100, 'sawtooth', 0.1, 0.1);
    }

    playMonsterHit() {
        // Monster attacks player
        this.playTone(80, 'sawtooth', 0.3, 0.15);
    }

    playTake() {
        this.playTone(880, 'sine', 0.2, 0.1);
        setTimeout(() => this.playTone(1320, 'sine', 0.1, 0.05), 50);
    }

    playMiss() {
        this.playTone(300, 'square', 0.1, 0.05);
        setTimeout(() => this.playTone(200, 'square', 0.15, 0.05), 100);
    }

    playOpen() {
        this.playTone(100, 'triangle', 0.5, 0.1);
    }

    playLevelUp() {
        const notes = [440, 554, 659, 880];
        notes.forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'sine', 0.4, 0.1), i * 150);
        });
    }

    playGameOver() {
        this.playTone(110, 'sawtooth', 1.0, 0.2);
        this.playTone(73, 'sawtooth', 1.5, 0.2);
    }
}

export const sounds = new SoundSystem();


import fs from 'fs';
import { createCanvas } from 'canvas';

function createTexture(name, type) {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;

    if (type === 'floor') {
        // Large stone tiles
        ctx.strokeRect(0, 0, 64, 64);
        ctx.beginPath();
        // Subtle cracks
        for(let i=0; i<10; i++) {
            ctx.moveTo(Math.random()*64, Math.random()*64);
            ctx.lineTo(Math.random()*64, Math.random()*64);
        }
        ctx.stroke();
        // Dots for grit
        ctx.fillStyle = '#333';
        for(let i=0; i<40; i++) {
            ctx.fillRect(Math.random()*64, Math.random()*64, 1, 1);
        }
    } else {
        // Ceiling - noise/dots for a cave feel
        ctx.fillStyle = '#444';
        for(let i=0; i<200; i++) {
            ctx.fillRect(Math.random()*64, Math.random()*64, 1, 1);
        }
        ctx.strokeStyle = '#222';
        ctx.beginPath();
        for(let i=0; i<5; i++) {
            ctx.moveTo(0, Math.random()*64);
            ctx.lineTo(64, Math.random()*64);
        }
        ctx.stroke();
    }

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./assets/textures/' + name + '.png', buffer);
    console.log(name + '.png created');
}

if (!fs.existsSync('./assets/textures')) {
    fs.mkdirSync('./assets/textures', { recursive: true });
}

createTexture('floor', 'floor');
createTexture('ceiling', 'ceiling');

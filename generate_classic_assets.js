
import fs from 'fs';
import { createCanvas } from 'canvas';

const BASE_PATH = './assets/textures/themes/classic/';

if (!fs.existsSync(BASE_PATH)) {
    fs.mkdirSync(BASE_PATH, { recursive: true });
}

function saveCanvas(canvas, name) {
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(BASE_PATH + name + '.png', buffer);
    console.log(`Generated: ${name}.png`);
}

function createWall() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Base dark grey
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 64, 64);
    
    // Bricks
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    
    // Row 1
    ctx.strokeRect(0, 0, 32, 16);
    ctx.strokeRect(32, 0, 32, 16);
    
    // Row 2 (offset)
    ctx.strokeRect(-16, 16, 32, 16);
    ctx.strokeRect(16, 16, 32, 16);
    ctx.strokeRect(48, 16, 32, 16);
    
    // Row 3
    ctx.strokeRect(0, 32, 32, 16);
    ctx.strokeRect(32, 32, 32, 16);
    
    // Row 4 (offset)
    ctx.strokeRect(-16, 48, 32, 16);
    ctx.strokeRect(16, 48, 32, 16);
    ctx.strokeRect(48, 48, 32, 16);
    
    // Noise / Texture
    ctx.fillStyle = '#222';
    for(let i=0; i<100; i++) {
        ctx.fillRect(Math.random()*64, Math.random()*64, 1, 1);
    }
    
    // Highlights
    ctx.fillStyle = '#333';
    for(let i=0; i<20; i++) {
        ctx.fillRect(Math.random()*64, Math.random()*64, 2, 1);
    }

    saveCanvas(canvas, 'wall');
}

function createFloor() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 64, 64);
    
    // Large tiles
    ctx.strokeStyle = '#333';
    ctx.strokeRect(0, 0, 64, 64);
    
    // Grit
    ctx.fillStyle = '#1a1a1a';
    for(let i=0; i<150; i++) {
        ctx.fillRect(Math.random()*64, Math.random()*64, 1, 1);
    }
    
    // Cracks
    ctx.strokeStyle = '#222';
    ctx.beginPath();
    for(let i=0; i<3; i++) {
        ctx.moveTo(Math.random()*64, Math.random()*64);
        ctx.lineTo(Math.random()*64, Math.random()*64);
    }
    ctx.stroke();

    saveCanvas(canvas, 'floor');
}

function createCeiling() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, 64, 64);
    
    // Rough cave texture
    ctx.fillStyle = '#111';
    for(let i=0; i<300; i++) {
        const x = Math.random()*64;
        const y = Math.random()*64;
        ctx.fillRect(x, y, 1, 1);
    }
    
    ctx.strokeStyle = '#0f0f0f';
    ctx.beginPath();
    for(let i=0; i<10; i++) {
        ctx.moveTo(0, Math.random()*64);
        ctx.lineTo(64, Math.random()*64);
    }
    ctx.stroke();

    saveCanvas(canvas, 'ceiling');
}

function createDoor() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    
    // Wood base
    ctx.fillStyle = '#211';
    ctx.fillRect(0, 0, 64, 64);
    
    // Planks
    ctx.strokeStyle = '#100';
    for(let x=0; x<=64; x+=16) {
        ctx.strokeRect(x, 0, 16, 64);
    }
    
    // Iron bands
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 12, 64, 8);
    ctx.fillRect(0, 44, 64, 8);
    
    // Rivets
    ctx.fillStyle = '#555';
    for(let y of [16, 48]) {
        for(let x of [8, 24, 40, 56]) {
            ctx.fillRect(x-1, y-1, 2, 2);
        }
    }

    saveCanvas(canvas, 'door');
}

createWall();
createFloor();
createCeiling();
createDoor();

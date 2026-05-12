
import fs from 'fs';
import { PNG } from 'pngjs';

const BASE_PATH = './assets/textures/themes/classic/';

if (!fs.existsSync(BASE_PATH)) {
    fs.mkdirSync(BASE_PATH, { recursive: true });
}

function savePng(png, name) {
    const buffer = PNG.sync.write(png);
    fs.writeFileSync(BASE_PATH + name + '.png', buffer);
    console.log(`Generated: ${name}.png`);
}

function createBitmap(w, h) {
    const png = new PNG({ width: w, height: h });
    for (let i = 0; i < png.data.length; i += 4) {
        png.data[i] = 0;
        png.data[i + 1] = 0;
        png.data[i + 2] = 0;
        png.data[i + 3] = 255;
    }
    return png;
}

function fillRect(png, x0, y0, w, h, r, g, b) {
    const x1 = Math.max(0, x0 | 0);
    const y1 = Math.max(0, y0 | 0);
    const x2 = Math.min(png.width, (x0 + w) | 0);
    const y2 = Math.min(png.height, (y0 + h) | 0);
    for (let y = y1; y < y2; y++) {
        for (let x = x1; x < x2; x++) {
            const i = (png.width * y + x) << 2;
            png.data[i] = r;
            png.data[i + 1] = g;
            png.data[i + 2] = b;
            png.data[i + 3] = 255;
        }
    }
}

function strokeRect(png, x0, y0, w, h, r, g, b) {
    const x = x0 | 0;
    const y = y0 | 0;
    const ww = w | 0;
    const hh = h | 0;
    for (let i = 0; i < ww; i++) {
        setPixel(png, x + i, y, r, g, b);
        setPixel(png, x + i, y + hh - 1, r, g, b);
    }
    for (let j = 0; j < hh; j++) {
        setPixel(png, x, y + j, r, g, b);
        setPixel(png, x + ww - 1, y + j, r, g, b);
    }
}

function setPixel(png, x, y, r, g, b) {
    if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
    const i = (png.width * y + x) << 2;
    png.data[i] = r;
    png.data[i + 1] = g;
    png.data[i + 2] = b;
    png.data[i + 3] = 255;
}

function strokeLine(png, x0, y0, x1, y1, r, g, b) {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let x = x0;
    let y = y0;
    for (;;) {
        setPixel(png, x, y, r, g, b);
        if (x === x1 && y === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }
}

/** Deterministic PRNG for stable assets across runs */
function detRand(seed) {
    let s = seed >>> 0;
    return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 0x100000000;
    };
}

function hexRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function createWall() {
    const png = createBitmap(64, 64);
    const rnd = detRand(0x57414c4c);
    const [bgR, bgG, bgB] = hexRgb('#0c0c0c');
    fillRect(png, 0, 0, 64, 64, bgR, bgG, bgB);

    const mortar = hexRgb('#1a1a1a');
    const stoneA = hexRgb('#151515');
    const stoneB = hexRgb('#121212');
    const edgeHi = hexRgb('#242424');
    const edgeLo = hexRgb('#0a0a0a');

    const courses = [
        { y: 0, h: 16, bricks: [{ x: 0, w: 32 }, { x: 32, w: 32 }] },
        { y: 16, h: 16, bricks: [{ x: -16, w: 32 }, { x: 16, w: 32 }, { x: 48, w: 32 }] },
        { y: 32, h: 16, bricks: [{ x: 0, w: 32 }, { x: 32, w: 32 }] },
        { y: 48, h: 16, bricks: [{ x: -16, w: 32 }, { x: 16, w: 32 }, { x: 48, w: 32 }] },
    ];

    function clipBrick(bx, bw) {
        const x0 = Math.max(0, bx);
        const x1 = Math.min(64, bx + bw);
        return { x0, drawW: x1 - x0 };
    }

    for (const row of courses) {
        for (const b of row.bricks) {
            const { x0, drawW } = clipBrick(b.x, b.w);
            if (drawW <= 1) continue;
            const shade = rnd() > 0.45 ? stoneA : stoneB;
            fillRect(png, x0 + 1, row.y + 1, drawW - 2, row.h - 2, shade[0], shade[1], shade[2]);
            fillRect(png, x0 + 1, row.y + 1, drawW - 2, 1, edgeHi[0], edgeHi[1], edgeHi[2]);
            fillRect(png, x0 + 1, row.y + 1, 1, row.h - 2, edgeHi[0], edgeHi[1], edgeHi[2]);
            fillRect(png, x0 + drawW - 2, row.y + 2, 1, row.h - 3, edgeLo[0], edgeLo[1], edgeLo[2]);
            fillRect(png, x0 + 2, row.y + row.h - 2, drawW - 4, 1, edgeLo[0], edgeLo[1], edgeLo[2]);
        }
    }

    for (const row of courses) {
        for (const b of row.bricks) {
            const { x0, drawW } = clipBrick(b.x, b.w);
            if (drawW <= 1) continue;
            strokeRect(png, x0, row.y, drawW, row.h, mortar[0], mortar[1], mortar[2]);
        }
    }

    for (let i = 0; i < 200; i++) {
        const gx = (rnd() * 64) | 0;
        const gy = (rnd() * 64) | 0;
        const v = 0x0a + ((rnd() * 8) | 0);
        setPixel(png, gx, gy, v, v, v);
    }

    for (let c = 0; c < 3; c++) {
        let cx = rnd() * 64;
        let cy = rnd() * 64;
        for (let s = 0; s < 5; s++) {
            const nx = cx + (rnd() - 0.5) * 12;
            const ny = cy + (rnd() - 0.5) * 10;
            strokeLine(png, cx | 0, cy | 0, nx | 0, ny | 0, 0x22, 0x22, 0x22);
            cx = nx;
            cy = ny;
        }
    }

    savePng(png, 'wall');
}

function createFloor() {
    const png = createBitmap(64, 64);
    const rnd = detRand(0x464c4f52);
    const base = hexRgb('#0a0a0a');
    fillRect(png, 0, 0, 64, 64, base[0], base[1], base[2]);
    const edge = hexRgb('#333');
    strokeRect(png, 0, 0, 64, 64, edge[0], edge[1], edge[2]);
    const grit = hexRgb('#1a1a1a');
    for (let i = 0; i < 150; i++) {
        const x = (rnd() * 64) | 0;
        const y = (rnd() * 64) | 0;
        setPixel(png, x, y, grit[0], grit[1], grit[2]);
    }
    const crack = hexRgb('#222');
    for (let i = 0; i < 3; i++) {
        const x0 = rnd() * 64;
        const y0 = rnd() * 64;
        const x1 = rnd() * 64;
        const y1 = rnd() * 64;
        strokeLine(png, x0 | 0, y0 | 0, x1 | 0, y1 | 0, crack[0], crack[1], crack[2]);
    }
    savePng(png, 'floor');
}

function createCeiling() {
    const png = createBitmap(64, 64);
    const rnd = detRand(0x4345494c);
    const base = hexRgb('#050505');
    fillRect(png, 0, 0, 64, 64, base[0], base[1], base[2]);
    const speck = hexRgb('#111');
    for (let i = 0; i < 300; i++) {
        const x = (rnd() * 64) | 0;
        const y = (rnd() * 64) | 0;
        setPixel(png, x, y, speck[0], speck[1], speck[2]);
    }
    const line = hexRgb('#0f0f0f');
    for (let i = 0; i < 10; i++) {
        const y = rnd() * 64;
        strokeLine(png, 0, y | 0, 63, y | 0, line[0], line[1], line[2]);
    }
    savePng(png, 'ceiling');
}

function createDoor() {
    const png = createBitmap(64, 64);
    const rnd = detRand(0x444f4f52);
    const wood = hexRgb('#141210');
    fillRect(png, 0, 0, 64, 64, wood[0], wood[1], wood[2]);
    const plank = hexRgb('#0a0a0a');
    for (let x = 0; x < 64; x += 16) {
        strokeRect(png, x, 0, 16, 64, plank[0], plank[1], plank[2]);
    }
    const band = hexRgb('#1f1f1f');
    fillRect(png, 0, 11, 64, 9, band[0], band[1], band[2]);
    fillRect(png, 0, 43, 64, 9, band[0], band[1], band[2]);
    const rivet = hexRgb('#3a3a3a');
    for (const y of [15, 47]) {
        for (const x of [8, 24, 40, 56]) {
            fillRect(png, x - 1, y - 1, 2, 2, rivet[0], rivet[1], rivet[2]);
        }
    }
    for (let i = 0; i < 80; i++) {
        const gx = (rnd() * 64) | 0;
        const gy = (rnd() * 64) | 0;
        const v = 0x12 + ((rnd() * 6) | 0);
        setPixel(png, gx, gy, v, v, Math.max(0, v - 1));
    }
    savePng(png, 'door');
}

createWall();
createFloor();
createCeiling();
createDoor();

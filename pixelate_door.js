import fs from 'fs';
import { PNG } from 'pngjs';

const doorPath = './assets/textures/themes/classic/door.png';
const entitiesDoorPath = './assets/textures/entities/door.png';

const buffer = fs.readFileSync(doorPath);
const original = PNG.sync.read(buffer);

const targetWidth = 64;
const targetHeight = 64;

const newPng = new PNG({ width: targetWidth, height: targetHeight });

for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
        const origX = Math.floor(x * (original.width / targetWidth));
        const origY = Math.floor(y * (original.height / targetHeight));
        const idx = (original.width * origY + origX) << 2;
        const newIdx = (targetWidth * y + x) << 2;
        
        newPng.data[newIdx] = original.data[idx];
        newPng.data[newIdx + 1] = original.data[idx + 1];
        newPng.data[newIdx + 2] = original.data[idx + 2];
        newPng.data[newIdx + 3] = original.data[idx + 3];
    }
}

const outBuffer = PNG.sync.write(newPng);
fs.writeFileSync(doorPath, outBuffer);
fs.writeFileSync(entitiesDoorPath, outBuffer);
console.log('Door pixelated down to ' + targetWidth + 'x' + targetHeight + ' successfully.');

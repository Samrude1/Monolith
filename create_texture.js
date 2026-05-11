import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, 'assets', 'textures');
const file = path.join(dir, 'stone_wall.png');

// A tiny 8x8 retro brick pattern (black and white) in base64
const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAAAAADhZOFXAAAAHklEQVQIW2P4//8/AxJgZGBgYGZAAgZ0YSQ+DBSDAQB0YwX9h/yGzQAAAABJRU5ErkJggg==";

// Ensure directory exists
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`[OK] Created directory: ${dir}`);
}

// Write the image file
fs.writeFileSync(file, Buffer.from(base64Data, 'base64'));
console.log(`[OK] Created texture: ${file}`);
console.log('You can now use this texture in your game!');

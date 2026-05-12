
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

const path = './assets/textures/menu_hero.png';

loadImage(path).then(img => {
    console.log(`Original dimensions: ${img.width}x${img.height}`);
    
    // Resize to 320x320 for true retro feel
    const targetSize = 320;
    const canvas = createCanvas(targetSize, targetSize);
    const ctx = canvas.getContext('2d');
    
    // Disable smoothing for sharp pixels
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, targetSize, targetSize);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./assets/textures/menu_hero_retro.png', buffer);
    console.log(`Saved as menu_hero_retro.png (${targetSize}x${targetSize})`);
});

import fs from 'fs';
import path from 'path';

// A tiny 32x32 red apple PNG base64
const appleBase64 = "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAB1MAAA6mAAADqYAAA7aGxA7AzAAAAA9SURBVHjaYmBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYAD/6wB/2H6mIAAAAABJRU5ErkJggg=="; // This is a solid red 32x32

const targetPath = path.join('assets', 'textures', 'entities', 'apple.png');

try {
    fs.writeFileSync(targetPath, Buffer.from(appleBase64, 'base64'));
    console.log(`[OK] Replaced apple with a low-res version at ${targetPath}`);
} catch (err) {
    console.error(`[ERROR] Failed to write apple: ${err.message}`);
}

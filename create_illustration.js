import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, 'assets', 'illustrations');
const file = path.join(dir, 'dungeon_gate.png');

// Ensure directory exists
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Copy the generated artifact (I know the path)
const artifactPath = "C:\\Users\\samru\\.gemini\\antigravity\\brain\\f0aa9c14-ae46-4d50-9bc6-17d5a7560286\\dungeon_gate_illustration_1778508649248.png";

try {
    fs.copyFileSync(artifactPath, file);
    console.log(`[OK] Created illustration: ${file}`);
} catch (err) {
    console.error(`[ERROR] Failed to copy artifact: ${err.message}`);
}

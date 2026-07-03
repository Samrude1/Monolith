import { EntityDefs } from './data/entities/registry.js';

const Entities = EntityDefs;

import { STORY_DATA } from './data/story.js';
import { VectorSprites } from './systems/vectorSprites.js';

export class GameEngine {
    constructor(canvas, ui) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false; // Keep pixel art sharp
        this.ui = ui;
        this.map = [];

        // --- Player state machine ---
        // We never mutate .x/.y/.dir mid-animation.
        // startX/Y/Dir = where we came FROM
        // targetX/Y/Dir = where we are going TO
        // animProgress: 0.0 (just started) → 1.0 (done)
        this.player = {
            startX: 0, startY: 0, startDir: 0,
            targetX: 0, targetY: 0, targetDir: 0,
            animProgress: 1.0   // 1.0 = idle / ready for input
        };

        this.entities = [];
        this.focalLength = 400;
        this.canvas.width = 800;
        this.canvas.height = 650;

        // Offscreen buffer for floor/ceiling rendering (Downsampled for retro look and speed)
        this.floorBuffer = document.createElement('canvas');
        this.floorBuffer.width = Math.floor(this.canvas.width / 4); 
        this.floorBuffer.height = Math.floor(this.canvas.height / 4);
        this.floorCtx = this.floorBuffer.getContext('2d');
        this.floorImageData = this.floorCtx.createImageData(this.floorBuffer.width, this.floorBuffer.height);




        // Default Theme
        this.theme = {
            wallColor: [255, 255, 255],
            dustColor: [100, 100, 100],
            dustSize: 0,
            fogDist: 12,
            waistLine: 0.7,
            showWaistLine: true
        };
    }

    async setTheme(config) {
        this.theme = { ...this.theme, ...config };
        
        const loadImg = (url) => new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.warn(`Theme image failed to load: ${url}`);
                resolve(null);
            };
            img.src = url;
        });

        const promises = [];
        if (config.wallTexture) promises.push(loadImg(config.wallTexture).then(img => this.theme.wallTextureImg = img));
        if (config.floorTexture) promises.push(loadImg(config.floorTexture).then(img => this.theme.floorTextureImg = img));
        if (config.ceilingTexture) promises.push(loadImg(config.ceilingTexture).then(img => this.theme.ceilingTextureImg = img));
        if (config.doorTexture) promises.push(loadImg(config.doorTexture).then(img => this.theme.doorTextureImg = img));

        await Promise.all(promises);
    }

    /**
     * Converts black pixels (0,0,0) to transparent alpha.
     * Useful for placeholder sprites that don't have an alpha channel.
     */
    removeBlackBackground(img) {
        if (!img || img.width === 0) return img;
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Sample top-left pixel as the background color
        const bgR = data[0];
        const bgG = data[1];
        const bgB = data[2];
        const tolerance = 20; // Allow slight JPEG compression noise
        
        for (let i = 0; i < data.length; i += 4) {
            if (Math.abs(data[i] - bgR) < tolerance && 
                Math.abs(data[i+1] - bgG) < tolerance && 
                Math.abs(data[i+2] - bgB) < tolerance) {
                data[i+3] = 0; // Make transparent
            }
        }
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    // Stable "random" for floor noise
    hash(x, y, i, seed) {
        const val = Math.sin(x * 12.9898 + y * 78.233 + i * 37.11 + seed) * 43758.5453;
        return val - Math.floor(val);
    }

    async loadMap(url) {
        const resp = await fetch(url);
        if (!resp.ok) {
            throw new Error(`Failed to load map: ${url} (${resp.status})`);
        }
        const text = (await resp.text()).replace(/\r/g, '');
        this.map = text.trim().split('\n').map(line => line.split(''));

        let foundSpawn = false;
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x] === 'S') {
                    this.player.startX = this.player.targetX = x + 0.5;
                    this.player.startY = this.player.targetY = y + 0.5;
                    this.player.startDir = this.player.targetDir = 0; // face North
                    this.map[y][x] = '.';
                    foundSpawn = true;
                }
            }
        }
        if (!foundSpawn) {
            console.warn(`Map has no spawn marker "S": ${url} — player stays at default (0.5, 0.5).`);
        }
    }

    // Returns cell char on success ('.', 'd', '<', '>'), false=blocked wall, null=busy anim,
    // 'MONSTER'=monster blocking tile.
    tryMove(dx, dy) {
        if (this.player.animProgress < 1.0) return null;

        const tx = Math.floor(this.player.targetX + dx);
        const ty = Math.floor(this.player.targetY + dy);

        const targetCell = this.map[ty] ? this.map[ty][tx] : null;

        // Check for monster blocking player
        const isMonsterBlocking = this.entities.some(e =>
            e.type === 'monster' && Math.floor(e.x) === tx && Math.floor(e.y) === ty
        );

        if (isMonsterBlocking) return 'MONSTER';

        // Allow walking through floor tiles (.) open doors (d) and stairs (<, >) and spawn point (S)
        if (targetCell === '.' || targetCell === 'd' || targetCell === '<' || targetCell === '>' || targetCell === 'S') {
            this.player.startX = this.player.targetX;
            this.player.startY = this.player.targetY;
            this.player.startDir = this.player.targetDir;
            this.player.targetX = tx + 0.5;
            this.player.targetY = ty + 0.5;
            this.player.animProgress = 0.0;
            return targetCell; 
        }
        return false;
    }

    moveForward() {
        const dir = this.player.targetDir;
        const dx = [0, 1, 0, -1][dir];
        const dy = [-1, 0, 1, 0][dir];
        return this.tryMove(dx, dy);
    }

    moveBackward() {
        const dir = this.player.targetDir;
        const dx = [0, -1, 0, 1][dir]; // Inverse of forward
        const dy = [1, 0, -1, 0][dir];
        return this.tryMove(dx, dy);
    }

    strafe(side) {
        const dir = this.player.targetDir;
        // Strafe Left: if facing North(0), move West(-1,0). if East(1), move North(0,-1). etc.
        // Rotation for side=-1 (Left): (dir - 1 + 4) % 4
        // Rotation for side=1 (Right): (dir + 1) % 4
        const strafeDir = (dir + (side === -1 ? 3 : 1)) % 4;
        const dx = [0, 1, 0, -1][strafeDir];
        const dy = [-1, 0, 1, 0][strafeDir];
        return this.tryMove(dx, dy);
    }

    // Returns true=rotated, false=busy
    rotate(val) {
        if (this.player.animProgress < 1.0) return false;
        // Sync position so it is NOT re-interpolated during turn
        this.player.startX = this.player.targetX;
        this.player.startY = this.player.targetY;
        this.player.startDir = this.player.targetDir;
        this.player.targetDir = (this.player.targetDir + val + 4) % 4;
        this.player.animProgress = 0.0;
        return true;
    }

    interact(playerState) {
        if (this.player.animProgress < 1) return null;

        const px = Math.floor(this.player.targetX);
        const py = Math.floor(this.player.targetY);
        const standingCell = this.map[py] ? this.map[py][px] : null;

        if (standingCell === '<') return "STAIRS_UP";
        if (standingCell === '>') return "STAIRS_DOWN";

        // Find target tile for doors
        const dir = this.player.targetDir;
        let tx = px;
        let ty = py;

        if (dir === 0) ty--; // N
        else if (dir === 1) tx++; // E
        else if (dir === 2) ty++; // S
        else if (dir === 3) tx--; // W

        // Check for interactive walls (Doors)
        if (this.map[ty] && this.map[ty][tx] === 'D') {
            this.map[ty][tx] = 'd'; // Open door (stays visible but walkable)
            return "You opened a door.";
        }
        
        // Locked Doors
        if (this.map[ty] && this.map[ty][tx] === 'L') {
            if (!playerState) return "The door is firmly locked. It needs a key.";
            const keyIndex = playerState.inventory.findIndex(item => item.id === 'key');
            if (keyIndex !== -1) {
                playerState.inventory.splice(keyIndex, 1); // Consume key
                this.map[ty][tx] = 'd'; // Open door
                return "You unlock the door with the Iron Key.";
            } else {
                return "The door is firmly locked. It needs a key.";
            }
        }

        // Check for interactive decals on the wall face
        const lookDirs = ['S', 'W', 'N', 'E'];
        const targetFacing = lookDirs[dir];
        const decal = this.entities.find(e => 
            e.type === 'decal' && 
            Math.floor(e.x) === tx && 
            Math.floor(e.y) === ty && 
            e.facing === targetFacing
        );

        if (decal) {
            if (decal.monsterType === 'lever') {
                decal.isPulled = !decal.isPulled;
                if (decal.targetX !== undefined && decal.targetY !== undefined) {
                    const targetCell = this.map[decal.targetY][decal.targetX];
                    if (targetCell === '#') {
                        this.map[decal.targetY][decal.targetX] = '.'; // Reveal hidden passage
                        return "You pull the lever. A hidden passage opens!";
                    } else if (targetCell === 'D' || targetCell === 'L') {
                        this.map[decal.targetY][decal.targetX] = 'd'; // Open door remotely
                        return "You pull the lever. You hear a door open in the distance.";
                    }
                }
                return "The lever clunks loudly, but nothing seems to happen.";
            }
            return `You examine the ${decal.monsterType.toUpperCase()}.`;
        }

        return null;
    }

    attack() {
        if (this.player.animProgress < 1) return null;

        const dir = this.player.targetDir;
        let tx = Math.floor(this.player.targetX);
        let ty = Math.floor(this.player.targetY);

        if (dir === 0) ty--; // N
        else if (dir === 1) tx++; // E
        else if (dir === 2) ty++; // S
        else if (dir === 3) tx--; // W

        // Find monster at target tile
        const monster = this.entities.find(e =>
            e.type === 'monster' && Math.floor(e.x) === tx && Math.floor(e.y) === ty
        );

        return monster || null;
    }

    update(dt) {
        if (this.player.animProgress < 1.0) {
            this.player.animProgress = Math.min(1.0, this.player.animProgress + dt * 6);
        }
        this.updateEntities(dt);
    }

    updateEntities(dt) {
        const px = this.player.targetX;
        const py = this.player.targetY;

        for (const ent of this.entities) {
            if (ent.hitTimer > 0) ent.hitTimer -= dt;
            if (ent.type !== 'monster') continue;

            // Initialize instance properties if missing
            if (ent.currentCooldown === undefined) {
                const def = Entities[ent.monsterType];
                if (!def) {
                    if (!ent._missingDefWarned) {
                        console.warn(`Missing monster definition for "${ent.monsterType}"`);
                        ent._missingDefWarned = true;
                    }
                    continue;
                }
                ent.cooldown = def.cooldown || 2000;
                ent.spd = def.spd || 0.5;
                ent.atk = def.atk || 5;
                ent.currentCooldown = 0;
            }

            // Update timers for animations
            ent.bobTime = (ent.bobTime || 0) + dt;
            if (ent.attackAnimTime > 0) ent.attackAnimTime -= dt;

            // Update cooldown
            if (ent.currentCooldown > 0) {
                ent.currentCooldown -= dt * 1000;
            }

            const dx = px - ent.x;
            const dy = py - ent.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // 1. Attack if close and cooldown is ready
            if (dist < 1.1 && ent.currentCooldown <= 0) {
                if (this.onEntityAttack) this.onEntityAttack(ent, ent.atk);
                ent.currentCooldown = ent.cooldown;
                ent.attackAnimTime = 0.3; // Trigger lunge animation
                continue;
            }

            // 2. Move AI (Wandering or Chasing)
            ent.moveTimer = (ent.moveTimer || 0) + dt;
            const moveDelay = (dist < 6) ? (0.7 / ent.spd) : (3.0 / ent.spd);

            if (ent.moveTimer > moveDelay) {
                ent.moveTimer = 0;

                let dx_move = 0;
                let dy_move = 0;

                if (dist < 6) {
                    // CHASING
                    if (Math.abs(dx) > Math.abs(dy)) dx_move = Math.sign(dx);
                    else dy_move = Math.sign(dy);
                } else {
                    // WANDERING
                    const dirs = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
                    const randDir = dirs[Math.floor(Math.random() * dirs.length)];
                    dx_move = randDir.x;
                    dy_move = randDir.y;
                }

                // Check first choice
                let nx = ent.x + dx_move;
                let ny = ent.y + dy_move;

                if (!this.isTileWalkable(nx, ny, ent)) {
                    // If blocked, and chasing, try the OTHER axis
                    if (dist < 6) {
                        if (dx_move !== 0) { // tried x, now try y
                            dx_move = 0;
                            dy_move = Math.sign(dy);
                        } else { // tried y, now try x
                            dy_move = 0;
                            dx_move = Math.sign(dx);
                        }
                        nx = ent.x + dx_move;
                        ny = ent.y + dy_move;
                    }
                }

                // Apply move if valid
                if (this.isTileWalkable(nx, ny, ent)) {
                    ent.x = Math.floor(nx) + 0.5;
                    ent.y = Math.floor(ny) + 0.5;
                }
            }
        }
    }

    isTileWalkable(nx, ny, self) {
        const gx = Math.floor(nx);
        const gy = Math.floor(ny);

        // Wall check - allow '.', 'd' (open door), '<', '>' (stairs)
        const cell = this.map[gy] ? this.map[gy][gx] : null;
        if (cell !== '.' && cell !== 'd' && cell !== '<' && cell !== '>') return false;

        // Monster collision (ignore items/objects)
        const occupied = this.entities.some(e =>
            e !== self &&
            e.type === 'monster' && // Only block if it's another monster
            Math.floor(e.x) === gx &&
            Math.floor(e.y) === gy
        );
        if (occupied) return false;

        // Player collision
        const atPlayer = (gx === Math.floor(this.player.targetX) && gy === Math.floor(this.player.targetY));
        if (atPlayer) return false;

        return true;
    }

    render() {
        const ctx = this.ctx;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const p = this.player;
        const t = p.animProgress;

        // Interpolated position — read-only, never written to player object
        // --- RENDERING PIPELINE ---
        // 1. Calculate interpolated position and rotation (for smooth movement/turning)
        const x = p.startX + (p.targetX - p.startX) * t;
        const y = p.startY + (p.targetY - p.startY) * t;

        // Interpolate rotation via shortest path to avoid 360 spins on wrap-around
        let sd = p.startDir;
        let td = p.targetDir;
        let diff = td - sd;
        if (diff > 2) diff -= 4;
        if (diff < -2) diff += 4;
        // angle: dir 0 = North = -PI/2 in standard math
        const angle = (sd + diff * t) * (Math.PI / 2) - Math.PI / 2;

        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // --- DRAW FLOOR AND CEILING (TEXTURED) ---
        this.renderFloorAndCeiling(x, y, angle, cosA, sinA);

        // 2. Collect visible wall faces and objects within view range

        const faces = [];
        const range = 8; // Render distance (fog limit)
        for (let dy = -range; dy <= range; dy++) {
            for (let dx = -range; dx <= range; dx++) {
                const gx = Math.floor(x + dx);
                const gy = Math.floor(y + dy);
                const cell = this.map[gy] ? this.map[gy][gx] : null;
                const isSolid = cell === '#' || cell === 'D' || cell === 'd' || cell === 'L';

                if (isSolid) {
                    const sides = [
                        { nx: gx, ny: gy - 1, face: 'N' },
                        { nx: gx + 1, ny: gy, face: 'E' },
                        { nx: gx, ny: gy + 1, face: 'S' },
                        { nx: gx - 1, ny: gy, face: 'W' },
                    ];
                    for (const s of sides) {
                        const neighbor = this.map[s.ny] ? this.map[s.ny][s.nx] : null;
                        // A face is visible if it separates a solid cell from a walkable one
                        const isWalkableNeighbor = neighbor === '.' || neighbor === 'S' || neighbor === 'd' || neighbor === '<' || neighbor === '>';

                        const isVisible = (cell === '#' && isWalkableNeighbor) ||
                            (cell === 'D' && isWalkableNeighbor) ||
                            (cell === 'L' && isWalkableNeighbor) ||
                            (cell === 'd' && isWalkableNeighbor);

                        if (!isVisible) continue;

                        const fd = this.getFace(gx, gy, s.face, x, y, cosA, sinA);
                        if (fd) {
                            fd.cell = cell; // Store the cell type (#, D, L, or d)
                            fd.isDoor = (cell === 'D' || cell === 'd' || cell === 'L');
                            faces.push(fd);
                        }
                    }
                }

                // --- Collect Floor Noise (Dust) ---
                // Disabled for performance
            }
        }

        // 2. Collect visible entities
        this.entities.forEach(ent => {
            const def = Entities[ent.monsterType];
            if (!def) return;

            if (ent.type === 'decal') {
                const faceDir = ent.facing || 'N';
                const width = def.width || 0.6; // fraction of wall width
                const gx = Math.floor(ent.x);
                const gy = Math.floor(ent.y);
                
                // Full wall segment
                let w1, w2, nx, ny;
                switch (faceDir) {
                    case 'N': w1 = { x: gx, y: gy }; w2 = { x: gx + 1, y: gy }; nx = 0; ny = -1; break;
                    case 'E': w1 = { x: gx + 1, y: gy }; w2 = { x: gx + 1, y: gy + 1 }; nx = 1; ny = 0; break;
                    case 'S': w1 = { x: gx + 1, y: gy + 1 }; w2 = { x: gx, y: gy + 1 }; nx = 0; ny = 1; break;
                    case 'W': w1 = { x: gx, y: gy + 1 }; w2 = { x: gx, y: gy }; nx = -1; ny = 0; break;
                }
                
                // Backface culling
                const vx = x - w1.x;
                const vy = y - w1.y;
                if (nx * vx + ny * vy < 0) return;
                
                // Scale width and center it
                const cx = (w1.x + w2.x) / 2;
                const cy = (w1.y + w2.y) / 2;
                const dx_w = w2.x - w1.x;
                const dy_w = w2.y - w1.y;
                
                w1 = { x: cx - dx_w * width / 2, y: cy - dy_w * width / 2 };
                w2 = { x: cx + dx_w * width / 2, y: cy + dy_w * width / 2 };
                
                // Project
                const cam = (w) => ({
                    rz: (w.x - x) * cosA + (w.y - y) * sinA,
                    rx: -(w.x - x) * sinA + (w.y - y) * cosA,
                });
                
                let c1 = cam(w1);
                let c2 = cam(w2);
                
                const NEAR = 0.1;
                let u1 = 0.0;
                let u2 = 1.0;
                
                if (c1.rz < NEAR && c2.rz < NEAR) return;
                
                if (c1.rz < NEAR) {
                    const t = (NEAR - c1.rz) / (c2.rz - c1.rz);
                    c1 = { rz: NEAR, rx: c1.rx + (c2.rx - c1.rx) * t };
                    u1 = t;
                } else if (c2.rz < NEAR) {
                    const t = (NEAR - c2.rz) / (c1.rz - c2.rz);
                    c2 = { rz: NEAR, rx: c2.rx + (c1.rx - c2.rx) * t };
                    u2 = 1.0 - t;
                }
                
                const proj = (c) => {
                    const f = this.focalLength / c.rz;
                    const c_sx = this.canvas.width / 2;
                    const c_sy = this.canvas.height / 2;
                    return { sx: c.rx * f + c_sx, yT: -0.5 * f + c_sy, yB: 0.5 * f + c_sy };
                };
                
                const s1 = proj(c1);
                const s2 = proj(c2);
                
                const typeKey = ent.monsterType.toUpperCase();
                const hasVector = !!VectorSprites[typeKey];

                if (def.sprite) {
                    if (s1.sx > s2.sx) {
                        faces.push({
                            type: 'wall-decal',
                            sprite: def.sprite,
                            x1: s2.sx, yT1: s2.yT, yB1: s2.yB,
                            x2: s1.sx, yT2: s1.yT, yB2: s1.yB,
                            dist: ((c1.rz + c2.rz) / 2) - 0.001,
                            u1: u2, u2: u1,
                            z1: c2.rz, z2: c1.rz,
                            vScale: def.scale || 1.0,
                            vOffset: def.yOffset || 0.0
                        });
                    } else {
                        faces.push({
                            type: 'wall-decal',
                            sprite: def.sprite,
                            x1: s1.sx, yT1: s1.yT, yB1: s1.yB,
                            x2: s2.sx, yT2: s2.yT, yB2: s2.yB,
                            dist: ((c1.rz + c2.rz) / 2) - 0.001, // Prevent Z-fighting with wall
                            u1: u1, u2: u2,
                            z1: c1.rz, z2: c2.rz,
                            vScale: def.scale || 1.0,
                            vOffset: def.yOffset || 0.0
                        });
                    }
                } else if (hasVector) {
                    faces.push({
                        type: 'vector-wall-decal',
                        monsterType: typeKey,
                        x1: s1.sx, yT1: s1.yT, yB1: s1.yB,
                        x2: s2.sx, yT2: s2.yT, yB2: s2.yB,
                        dist: ((c1.rz + c2.rz) / 2) - 0.001,
                        z1: c1.rz, z2: c2.rz,
                        vScale: def.scale || 1.0,
                        vOffset: def.yOffset || 0.0
                    });
                }
                return;
            }

            const dx = ent.x - x;
            const dy = ent.y - y;
            const rz = dx * cosA + dy * sinA;
            if (rz < 0.1 || rz > range) return;

            // ANIMATION OFFSETS (Discrete frames for retro feel)
            const bobFrame = Math.floor((ent.bobTime || 0) * 0.75) % 2; // Swaps every ~1.3s
            const bobOffset = bobFrame === 0 ? 0 : 6;

            // Stepped lunge: 0 = normal, 1 = lunged
            const lungeFrame = ent.attackAnimTime > 0 ? 1 : 0;
            const lunge = lungeFrame * 35;

            // Check if we have a vector sprite for this type (prioritize it)
            const typeKey = ent.monsterType.toUpperCase();
            const hasVector = !!VectorSprites[typeKey];

            const NEAR = 0.1;
            const distWithLunge = Math.max(NEAR, rz - (lunge * 0.01));

            if (def.sprite) {
                // Billboard Sprite Rendering (Legacy PNG)
                const rx = -dx * sinA + dy * cosA;
                const f = this.focalLength / distWithLunge;
                const sx = rx * f + (this.canvas.width / 2);
                
                // Automate floor placement if onFloor is true
                let sy = (this.canvas.height / 2) + bobOffset;
                const scale = def.scale || 1;
                const yOffset = def.yOffset || 0; // Fine-tune vertical position
                
                if (def.onFloor) {
                    // Formula to touch floor: horizon + (0.5*f) - (size/2)
                    sy += f * (0.5 - scale / 2 + yOffset);
                } else {
                    sy += ((def.anchorY ?? 0) + yOffset) * f;
                }
                const size = f * scale;
                
                faces.push({
                    type: 'sprite',
                    sprite: def.sprite,
                    sx, sy, size,
                    dist: rz - (lunge * 0.01),
                    hitTimer: ent.hitTimer || 0
                });
            } else if (hasVector) {
                // Billboard Vector Sprite
                const rx = -dx * sinA + dy * cosA;
                const f = this.focalLength / distWithLunge;
                const sx = rx * f + (this.canvas.width / 2);
                
                let sy = (this.canvas.height / 2) + bobOffset;
                const scale = def.scale || 1;
                const yOffset = def.yOffset || 0;
                
                if (def.onFloor) {
                    sy += f * (0.5 - scale / 2 + yOffset);
                } else {
                    sy += ((def.anchorY ?? 0) + yOffset) * f;
                }
                const size = f * scale;

                faces.push({
                    type: 'vector-sprite',
                    monsterType: typeKey,
                    sx, sy, size,
                    dist: distWithLunge,
                    hitTimer: ent.hitTimer || 0
                });
            }
        });

        // 3. Painter's algorithm: sort by distance descending to draw far objects first (Z-buffer alternative)
        faces.sort((a, b) => b.dist - a.dist);

        ctx.lineWidth = 2;
        for (const f of faces) {
            if (f.type === 'sprite') {
                // Draw PNG Sprite
                ctx.save();
                ctx.globalCompositeOperation = 'source-over'; // Opaque sprites
                const img = f.sprite;
                
                // Canvas elements don't have .complete, so we check if it's either a complete Image with dimensions or a Canvas
                const isReady = img && ((img instanceof HTMLCanvasElement) || (img.complete && img.naturalWidth > 0));
                if (!isReady) {
                    ctx.restore();
                    continue;
                }
                const aspect = img.width / img.height;
                const h = f.size;
                const w = h * aspect;
                
                // Distance darkening: full color up close, dark at distance
                // Min 0.10 so silhouette is always visible — no ghosting
                const distBrightness = Math.max(0.10, 1 - ((f.dist * 1.3) / this.theme.fogDist));
                ctx.globalAlpha = 1.0;

                // FLASH EFFECT (White hit flash overrides darkening)
                if (f.hitTimer > 0) {
                    ctx.filter = 'brightness(10)';
                } else {
                    ctx.filter = `brightness(${distBrightness})`;
                }

                // Draw image
                ctx.drawImage(img, f.sx - w / 2, f.sy - h / 2, w, h);
                ctx.filter = 'none'; // Reset for next objects

                ctx.restore();
            } else if (f.type === 'wall-decal') {
                const screenWidth = f.x2 - f.x1;
                const img = f.sprite;
                const isReady = img && ((img instanceof HTMLCanvasElement) || (img.complete && img.naturalWidth > 0));
                if (!isReady || screenWidth <= 0.5) continue;
                
                
                // Distance darkening: darken the decal color, stay fully opaque
                ctx.save();
                ctx.globalCompositeOperation = 'source-over';
                const distBrightness = Math.max(0.10, 1 - ((f.dist * 1.3) / this.theme.fogDist));
                ctx.globalAlpha = 1.0;
                ctx.filter = `brightness(${distBrightness})`;

                const sliceWidth = 1;
                for (let sx = 0; sx < screenWidth; sx += sliceWidth) {
                    const t = sx / screenWidth;
                    const z_inv = (1 / f.z1) * (1 - t) + (1 / f.z2) * t;
                    const u = ((f.u1 / f.z1) * (1 - t) + (f.u2 / f.z2) * t) / z_inv;
                    
                    const topY = f.yT1 + (f.yT2 - f.yT1) * t;
                    const bottomY = f.yB1 + (f.yB2 - f.yB1) * t;
                    const wallHeight = bottomY - topY;
                    
                    const dh = wallHeight * f.vScale;
                    const cy = (topY + bottomY) / 2;
                    const dy = cy + (f.vOffset * wallHeight) - (dh / 2);
                    
                    const sourceX = (u * img.width) | 0;
                    const clampedSx = Math.max(0, Math.min(img.width - 1, sourceX));
                    
                    ctx.drawImage(
                        img,
                        clampedSx, 0, 1, img.height,
                        f.x1 + sx, dy, 1.5, dh + 1
                    );
                }
                ctx.filter = 'none';
                ctx.restore();
            } else if (f.type === 'vector-wall-decal') {
                const drawFunc = VectorSprites[f.monsterType];
                if (!drawFunc) continue;

                ctx.save();
                const fog = Math.max(0, 1 - ((f.dist * 1.4) / this.theme.fogDist));
                ctx.strokeStyle = `rgba(255,255,255,${fog})`;
                ctx.lineWidth = 2;

                // Perspective Mapper: Maps normalized sprite coords (-s/2 to s/2) to wall trapezoid
                const map = (vx, vy) => {
                    // vx, vy are roughly -size/2 to size/2. Normalize to 0...1
                    const size = 100; // Reference size used in sprite functions
                    const u = (vx / size) + 0.5; 
                    const v = (vy / size) + 0.5;
                    
                    // Perspective-correct U interpolation
                    const z_inv = (1 / f.z1) * (1 - u) + (1 / f.z2) * u;
                    const z = 1 / z_inv;
                    
                    // X is linear in screen space after perspective projection? 
                    // Actually, for a small decal, let's just do bilinear on screen coords for simplicity
                    const sx = f.x1 + (f.x2 - f.x1) * u;
                    const yT = f.yT1 + (f.yT2 - f.yT1) * u;
                    const yB = f.yB1 + (f.yB2 - f.yB1) * u;
                    
                    // Vertical interpolation with scale and offset
                    const wallH = yB - yT;
                    const cy = (yT + yB) / 2 + (f.vOffset * wallH);
                    const sy = cy + (v - 0.5) * wallH * f.vScale;
                    
                    return { x: sx, y: sy };
                };

                // Create a Proxy context to intercept drawing calls and apply perspective
                const proxy = {
                    beginPath: () => ctx.beginPath(),
                    moveTo: (x, y) => { const p = map(x, y); ctx.moveTo(p.x, p.y); },
                    lineTo: (x, y) => { const p = map(x, y); ctx.lineTo(p.x, p.y); },
                    arc: (x, y, r, sa, ea) => {
                        const p = map(x, y);
                        const radiusScale = (f.yB1 - f.yT1) / 100;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, r * radiusScale, sa, ea);
                        ctx.stroke();
                    },
                    strokeRect: (x, y, w, h) => {
                        const p1 = map(x, y);
                        const p2 = map(x + w, y);
                        const p3 = map(x + w, y + h);
                        const p4 = map(x, y + h);
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
                        ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
                        ctx.closePath();
                        ctx.stroke();
                    },
                    stroke: () => ctx.stroke(),
                    closePath: () => ctx.closePath(),
                    ellipse: (x, y, rx, ry, rot, sa, ea) => {
                         const p = map(x, y);
                         ctx.ellipse(p.x, p.y, rx, ry, rot, sa, ea);
                    }
                };

                drawFunc(proxy, 100); // Call with fixed reference size 100
                ctx.restore();
            } else if (f.type === 'vector-sprite') {
                // Draw Geometric Vector Monster
                const s = f.size;
                // Distance darkening via color value — full white up close, dim far away
                const distBrightness = Math.max(0.10, 1 - ((f.dist * 1.3) / this.theme.fogDist));
                const colorVal = Math.floor(255 * distBrightness);
                // Vector sprites always at full brightness — no fog dimming
                ctx.save();
                ctx.translate(f.sx, f.sy);

                // FLASH EFFECT
                if (f.hitTimer > 0) {
                    ctx.strokeStyle = '#fff';
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#fff';
                    ctx.lineWidth = 4;
                } else {
                    ctx.strokeStyle = `rgb(${colorVal},${colorVal},${colorVal})`;
                    ctx.shadowBlur = 0;
                    ctx.lineWidth = 2;
                }

                // Call the specific drawing function for this monster type
                const drawFunc = VectorSprites[f.monsterType] || VectorSprites['DEFAULT'];
                drawFunc(ctx, s);
                
                ctx.restore();
            } else {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(0,0,0,0)'; // RESET to transparent to prevent any leaks
                ctx.moveTo(f.x1, f.yT1);
                ctx.lineTo(f.x2, f.yT2);
                ctx.lineTo(f.x2, f.yB2);
                ctx.lineTo(f.x1, f.yB1);
                ctx.closePath();
                ctx.fillStyle = '#000';
                ctx.fill();


                // --- TEXTURE RENDERING (The Retro Way) ---
                // Texture walls (#) and all door types (D, L, d)
                const isWall = f.cell === '#';
                const isDoor = f.cell === 'D' || f.cell === 'd' || f.cell === 'L';
                
                const activeTex = isDoor ? (this.theme.doorTextureImg || this.theme.wallTextureImg) : (isWall ? this.theme.wallTextureImg : null);
                
                const isReady = activeTex && ((activeTex instanceof HTMLCanvasElement) || (activeTex.complete && activeTex.naturalWidth > 0));
                if (isReady) {
                    ctx.beginPath(); 
                    const img = activeTex;
                    
                    let xL = f.x1, xR = f.x2;
                    let zL = f.z1, zR = f.z2;
                    let uL = f.u1, uR = f.u2;
                    let yTL = f.yT1, yTR = f.yT2;
                    let yBL = f.yB1, yBR = f.yB2;

                    if (xL > xR) {
                        [xL, xR] = [xR, xL];
                        [zL, zR] = [zR, zL];
                        [uL, uR] = [uR, uL];
                        [yTL, yTR] = [yTR, yTL];
                        [yBL, yBR] = [yBR, yBL];
                    }

                    const xL_int = xL | 0;
                    const xR_int = xR | 0;
                    const screenWidth = xR_int - xL_int;
                    
                    if (screenWidth > 0) {
                        const sliceWidth = 2; 
                        for (let sx = 0; sx < screenWidth; sx += sliceWidth) {
                            const t = sx / screenWidth;
                            const z_inv = (1 / zL) * (1 - t) + (1 / zR) * t;
                            const u = ((uL / zL) * (1 - t) + (uR / zR) * t) / z_inv;
                            const topY = yTL + (yTR - yTL) * t;
                            const bottomY = yBL + (yBR - yBL) * t;
                            
                            const texScale = isDoor ? 1 : (this.theme.textureScale || 1.0);
                            let scaledU = u * texScale;
                            scaledU = scaledU - Math.floor(scaledU);
                            const sourceX = (scaledU * img.width) | 0;
                            const clampedSx = Math.max(0, Math.min(img.width - 1, sourceX));
                            
                            // Draw wall texture behind the door if it's a door and has a distinct texture
                            if (f.isDoor && this.theme.wallTextureImg && img !== this.theme.wallTextureImg) {
                                const wallTexScale = this.theme.textureScale || 1.0;
                                let scaledWallU = u * wallTexScale;
                                scaledWallU = scaledWallU - Math.floor(scaledWallU);
                                const wallSourceX = (scaledWallU * this.theme.wallTextureImg.width) | 0;
                                const clampedWallSx = Math.max(0, Math.min(this.theme.wallTextureImg.width - 1, wallSourceX));
                                
                                const wallVertScale = Math.floor(wallTexScale);
                                const wallH = bottomY - topY;
                                const segmentH = wallH / wallVertScale;
                                for (let i = 0; i < wallVertScale; i++) {
                                    ctx.drawImage(
                                        this.theme.wallTextureImg,
                                        clampedWallSx, 0, 1, this.theme.wallTextureImg.height,
                                        xL_int + sx, topY + i * segmentH, sliceWidth + 0.5, segmentH + 1
                                    );
                                }
                            }

                            const vertScale = isDoor ? 1 : Math.floor(this.theme.textureScale || 1.0);
                            const wallH = bottomY - topY;
                            const segmentH = wallH / vertScale;
                            for (let i = 0; i < vertScale; i++) {
                                ctx.drawImage(
                                    img,
                                    clampedSx, 0, 1, img.height,
                                    xL_int + sx, topY + i * segmentH, sliceWidth + 0.5, segmentH + 1
                                );
                            }

                            
                            // SUBTLE TINT FOR WALLS
                            ctx.fillStyle = 'rgba(0, 50, 150, 0.05)';
                            ctx.fillRect(xL_int + sx, topY, sliceWidth + 0.5, (bottomY - topY) + 1);
                        }

                        // If using wall texture as a fallback for a door, darken it
                        if (f.isDoor && img === this.theme.wallTextureImg) {
                            ctx.fillStyle = 'rgba(0,0,0,0.4)';
                            ctx.beginPath();
                            ctx.moveTo(xL_int, yTL); ctx.lineTo(xR_int + 2, yTR);
                            ctx.lineTo(xR_int + 2, yBR); ctx.lineTo(xL_int, yBL);
                            ctx.fill();

                            // Add a subtle frame for the fallback door
                            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        }

                        // HIGH-FIDELITY MULTI-STOP FOG
                        const grad = ctx.createLinearGradient(xL_int, 0, xR_int + 2, 0);
                        const stopStep = 16; 
                        const stopCount = Math.max(2, (screenWidth / stopStep) | 0);
                        for (let i = 0; i <= stopCount; i++) {
                            const t = i / stopCount;
                            const z_inv = (1 / zL) * (1 - t) + (1 / zR) * t;
                            const actualZ = 1 / z_inv;
                            const sliceFog = Math.max(0, 1 - ((actualZ * 1.4) / this.theme.fogDist));
                            grad.addColorStop(t, `rgba(0,0,0,${1 - sliceFog})`);
                        }
                        ctx.fillStyle = grad;
                        ctx.beginPath();
                        ctx.moveTo(xL_int, yTL); ctx.lineTo(xR_int + 2, yTR);
                        ctx.lineTo(xR_int + 2, yBR); ctx.lineTo(xL_int, yBL);
                        ctx.fill();
                    }
                } else {
                    // Fallback to wireframe if no texture (Walls and Doors both get this now)
                    const fog = Math.max(0, 1 - ((f.dist * 1.4) / this.theme.fogDist));
                    const gray = Math.floor(255 * fog);
                    ctx.strokeStyle = `rgb(${gray},${gray},${gray})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(f.x1, f.yT1);
                    ctx.lineTo(f.x2, f.yT2);
                    ctx.lineTo(f.x2, f.yB2);
                    ctx.lineTo(f.x1, f.yB1);
                    ctx.closePath();
                    ctx.stroke();

                    // Perspective Waist-line (Skip for doors)
                    if (this.theme.showWaistLine && !isDoor) {
                        const h = this.theme.waistLine;
                        const wy1 = f.yT1 + (f.yB1 - f.yT1) * h;
                        const wy2 = f.yT2 + (f.yB2 - f.yT2) * h;
                        ctx.beginPath();
                        ctx.moveTo(f.x1, wy1);
                        ctx.lineTo(f.x2, wy2);
                        ctx.stroke();
                    }
                }

                // Door fallback (only if door texture is NOT available)
                const isDoorMissingTexture = (isDoor && !this.theme.doorTextureImg?.complete);

                if (isDoorMissingTexture) {
                    const marginW = 0.20; 
                    const marginTop = 0.12; 
                    const lerpX = (t) => f.x1 + (f.x2 - f.x1) * t;
                    const lerpYT = (t) => f.yT1 + (f.yT2 - f.yT1) * t;
                    const lerpYB = (t) => f.yB1 + (f.yB2 - f.yB1) * t;
                    const dxL = lerpX(marginW);
                    const dxR = lerpX(1 - marginW);
                    const dyTL = lerpYT(marginW) + (lerpYB(marginW) - lerpYT(marginW)) * marginTop;
                    const dyTR = lerpYT(1 - marginW) + (lerpYB(1 - marginW) - lerpYT(1 - marginW)) * marginTop;
                    const dyBL = lerpYB(marginW);
                    const dyBR = lerpYB(1 - marginW);

                    // 1. Draw Door Outline
                    const fog = Math.max(0, 1 - ((f.dist * 1.4) / this.theme.fogDist));
                    const gray = Math.floor(255 * fog);
                    ctx.strokeStyle = `rgb(${gray},${gray},${gray})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(dxL, dyBL);
                    ctx.lineTo(dxL, dyTL);
                    ctx.lineTo(dxR, dyTR);
                    ctx.lineTo(dxR, dyBR);
                    ctx.closePath();
                    ctx.stroke();

                    // 2. Draw Vector Details (Planks & X-brace)
                    // Vertical planks
                    for (let t = 0.25; t < 1.0; t += 0.25) {
                        const px = lerpX(marginW + (1 - 2 * marginW) * t);
                        const pyT = lerpYT(marginW + (1 - 2 * marginW) * t) + (lerpYB(marginW + (1 - 2 * marginW) * t) - lerpYT(marginW + (1 - 2 * marginW) * t)) * marginTop;
                        const pyB = lerpYB(marginW + (1 - 2 * marginW) * t);
                        ctx.beginPath();
                        ctx.moveTo(px, pyT);
                        ctx.lineTo(px, pyB);
                        ctx.stroke();
                    }

                    // Classic X-Brace
                    ctx.beginPath();
                    ctx.moveTo(dxL, dyTL); ctx.lineTo(dxR, dyBR);
                    ctx.moveTo(dxR, dyTR); ctx.lineTo(dxL, dyBL);
                    ctx.stroke();

                    // Simple handle/keyhole
                    const hx = lerpX(1 - marginW - 0.1);
                    const hy = (dyTL + dyBL) / 2;
                    ctx.strokeRect(hx - 2, hy - 4, 4, 8);
                }

            }
        }

        // UI
        this.ui.dir.innerText = ['N', 'E', 'S', 'W'][p.targetDir];
    }

    getFace(gx, gy, side, px, py, cosA, sinA) {
        // 1. Define world points and the face's outward normal
        let w1, w2, nx, ny;
        switch (side) {
            case 'N': w1 = { x: gx, y: gy }; w2 = { x: gx + 1, y: gy }; nx = 0; ny = -1; break;
            case 'E': w1 = { x: gx + 1, y: gy }; w2 = { x: gx + 1, y: gy + 1 }; nx = 1; ny = 0; break;
            case 'S': w1 = { x: gx + 1, y: gy + 1 }; w2 = { x: gx, y: gy + 1 }; nx = 0; ny = 1; break;
            case 'W': w1 = { x: gx, y: gy + 1 }; w2 = { x: gx, y: gy }; nx = -1; ny = 0; break;
        }

        // 2. Backface culling: only draw if the face is looking at the player
        // Dot product of (Face Normal) and (Vector from Face to Player)
        const vx = px - w1.x;
        const vy = py - w1.y;
        if (nx * vx + ny * vy < 0) return null;

        // 3. Transform to camera space
        const cam = (w) => ({
            rz: (w.x - px) * cosA + (w.y - py) * sinA,
            rx: -(w.x - px) * sinA + (w.y - py) * cosA,
        });

        let c1 = cam(w1);
        let c2 = cam(w2);

        // Near-plane clip
        const NEAR = 0.1;
        if (c1.rz < NEAR && c2.rz < NEAR) return null;

        let u1 = 0, u2 = 1;
        if (c1.rz < NEAR) {
            const t = (NEAR - c1.rz) / (c2.rz - c1.rz);
            c1 = { rz: NEAR, rx: c1.rx + (c2.rx - c1.rx) * t };
            u1 = t;
        } else if (c2.rz < NEAR) {
            const t = (NEAR - c2.rz) / (c1.rz - c2.rz);
            c2 = { rz: NEAR, rx: c2.rx + (c1.rx - c2.rx) * t };
            u2 = 1 - t;
        }

        const proj = (c) => {
            const f = this.focalLength / c.rz;
            const cx = this.canvas.width / 2;
            const cy = this.canvas.height / 2;
            return { sx: c.rx * f + cx, yT: -0.5 * f + cy, yB: 0.5 * f + cy };
        };

        const s1 = proj(c1);
        const s2 = proj(c2);

        return {
            x1: s1.sx, yT1: s1.yT, yB1: s1.yB, z1: c1.rz, u1: u1,
            x2: s2.sx, yT2: s2.yT, yB2: s2.yB, z2: c2.rz, u2: u2,
            dist: (c1.rz + c2.rz) / 2,
        };
    }

    /**
     * Renders textured floor and ceiling using horizontal scanlines.
     * Uses a low-res offscreen buffer for performance and retro look.
     */
    renderFloorAndCeiling(px, py, angle, cosA, sinA) {
        const floorImg = this.theme.floorTextureImg;
        const ceilImg = this.theme.ceilingTextureImg;
        const floorData = this.getTextureData(floorImg);
        const ceilData = this.getTextureData(ceilImg);

        if (!floorData && !ceilData) {
            // Fallback to simple fills if textures aren't ready
            this.ctx.fillStyle = this.theme.ceilingColor || '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height / 2);
            this.ctx.fillStyle = this.theme.floorColor || '#111';
            this.ctx.fillRect(0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2);
            return;
        }

        const bufW = this.floorBuffer.width;
        const bufH = this.floorBuffer.height;
        const pixels = new Uint32Array(this.floorImageData.data.buffer);
        
        const focal = this.focalLength / 4; // Adjusted for buffer scale
        const centerX = bufW / 2;
        const centerY = bufH / 2;

        for (let y = 0; y < bufH; y++) {
            const isFloor = y >= centerY;
            const dy = isFloor ? (y - centerY) : (centerY - y);
            if (dy === 0) continue;

            const dist = (focal * 0.5) / dy; // 0.5 = eye height
            
            // Step size in world space per screen pixel
            const worldStepX = (dist / focal) * sinA;
            const worldStepY = -(dist / focal) * cosA;
            
            // Starting world coordinates for the leftmost pixel of the row
            let worldX = px + dist * cosA - (bufW / 2) * worldStepX;
            let worldY = py + dist * sinA - (bufW / 2) * worldStepY;

            const tex = isFloor ? floorData : ceilData;
            if (!tex) {
                // Fallback: Floor is dark grey, Ceiling is slightly lighter grey
                const color = isFloor ? 0xFF111111 : 0xFF333333; 
                for (let x = 0; x < bufW; x++) pixels[y * bufW + x] = color;
                continue;
            }


            const tw = tex.width, th = tex.height, tp = tex.pixels;
            
            // Per-surface fog multipliers
            const fogMult = isFloor ? 1.4 : 0.8; 
            const fog = Math.max(0, 1 - ((dist * fogMult) / this.theme.fogDist));
            const fogVal = Math.floor(255 * (1 - fog));

            const texScale = this.theme.textureScale || 1.0;
            for (let x = 0; x < bufW; x++) {
                const tx = (((worldX * texScale) * tw) % tw + tw) % tw | 0;
                const ty = (((worldY * texScale) * th) % th + th) % th | 0;
                
                let c = tp[ty * tw + tx];
                
                if (fogVal > 0) {
                    let r = Math.max(0, (c & 0xFF) - fogVal);
                    let g = Math.max(0, ((c >> 8) & 0xFF) - fogVal);
                    let b = Math.max(0, ((c >> 16) & 0xFF) - fogVal);
                    c = (c & 0xFF000000) | r | (g << 8) | (b << 16);
                }

                // SUBTLE ATMOSPHERIC TINTING (Restored to light levels)
                if (isFloor) {
                    let r = Math.min(255, (c & 0xFF) + 6);
                    let g = Math.min(255, ((c >> 8) & 0xFF) + 3);
                    c = (c & 0xFFFF0000) | r | (g << 8);
                } else {
                    let r = Math.min(255, (c & 0xFF) + 3);
                    let b = Math.min(255, ((c >> 16) & 0xFF) + 6);
                    c = (c & 0xFF00FF00) | r | (b << 16);
                }

                pixels[y * bufW + x] = c;
                worldX += worldStepX;
                worldY += worldStepY;
            }

        }

        this.floorCtx.putImageData(this.floorImageData, 0, 0);
        this.ctx.drawImage(this.floorBuffer, 0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Extracts and caches pixel data from an image for fast software rendering.
     */
    getTextureData(img) {
        if (!img) return null;
        // Check if it's a Canvas or a loaded Image
        const isReady = (img instanceof HTMLCanvasElement) || (img.complete && img.naturalWidth > 0);
        if (!isReady) return null;
        
        if (img._cachedData) return img._cachedData;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(img, 0, 0);
        const data = tempCtx.getImageData(0, 0, img.width, img.height).data;
        
        img._cachedData = {
            pixels: new Uint32Array(data.buffer),
            width: img.width,
            height: img.height
        };
        return img._cachedData;
    }

}

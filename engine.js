import { EntityDefs } from './data/entities/registry.js';

const Entities = EntityDefs;

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
            startX: 0,  startY: 0,  startDir: 0,
            targetX: 0, targetY: 0, targetDir: 0,
            animProgress: 1.0   // 1.0 = idle / ready for input
        };

        this.focalLength = 400;
        this.canvas.width = 800;
        this.canvas.height = 650;
        this.entities = [];
    }

    async loadMap(url) {
        const resp = await fetch(url);
        const text = await resp.text();
        this.map = text.trim().split('\n').map(line => line.split(''));

        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x] === 'S') {
                    this.player.startX  = this.player.targetX = x + 0.5;
                    this.player.startY  = this.player.targetY = y + 0.5;
                    this.player.startDir = this.player.targetDir = 0; // face North
                    this.map[y][x] = '.';
                }
            }
        }
    }

    // Returns true=moved, false=wall, null=busy
    moveForward() {
        if (this.player.animProgress < 1.0) return null;

        const dir = this.player.targetDir;
        const dx = [0, 1, 0, -1][dir];
        const dy = [-1, 0, 1, 0][dir];
        const tx = Math.floor(this.player.targetX + dx);
        const ty = Math.floor(this.player.targetY + dy);

        const targetCell = this.map[ty] ? this.map[ty][tx] : null;

        // Check for monster blocking player
        const isMonsterBlocking = this.entities.some(e => 
            e.type === 'monster' && Math.floor(e.x) === tx && Math.floor(e.y) === ty
        );

        if (isMonsterBlocking) return false;

        // Allow walking through floor tiles (.) open doors (d) and stairs (<, >)
        if (targetCell === '.' || targetCell === 'd' || targetCell === '<' || targetCell === '>') {
            this.player.startX   = this.player.targetX;
            this.player.startY   = this.player.targetY;
            this.player.startDir = this.player.targetDir;
            this.player.targetX  = tx + 0.5;
            this.player.targetY  = ty + 0.5;
            this.player.animProgress = 0.0;
            return targetCell; // Return the cell we stepped onto
        }
        return false;
    }

    // Returns true=rotated, false=busy
    rotate(val) {
        if (this.player.animProgress < 1.0) return false;
        // Sync position so it is NOT re-interpolated during turn
        this.player.startX   = this.player.targetX;
        this.player.startY   = this.player.targetY;
        this.player.startDir = this.player.targetDir;
        this.player.targetDir = (this.player.targetDir + val + 4) % 4;
        this.player.animProgress = 0.0;
        return true;
    }

    interact() {
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
            if (ent.type !== 'monster') continue;

            // Initialize instance properties if missing
            if (ent.currentCooldown === undefined) {
                const def = Entities[ent.monsterType];
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
            const dist = Math.sqrt(dx*dx + dy*dy);

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
                    const dirs = [{x:0,y:-1}, {x:1,y:0}, {x:0,y:1}, {x:-1,y:0}];
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
        const x = p.startX + (p.targetX - p.startX) * t;
        const y = p.startY + (p.targetY - p.startY) * t;

        // Interpolate rotation via shortest path
        let sd = p.startDir;
        let td = p.targetDir;
        let diff = td - sd;
        if (diff >  2) diff -= 4;
        if (diff < -2) diff += 4;
        // angle: dir 0 = North = -PI/2 in standard math
        const angle = (sd + diff * t) * (Math.PI / 2) - Math.PI / 2;

        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // Collect visible wall faces
        const faces = [];
        const range = 8;
        for (let dy = -range; dy <= range; dy++) {
            for (let dx = -range; dx <= range; dx++) {
                const gx = Math.floor(x + dx);
                const gy = Math.floor(y + dy);
                const cell = this.map[gy] ? this.map[gy][gx] : null;
                const isSolid = cell === '#' || cell === 'D' || cell === 'd';

                if (isSolid) {
                    const sides = [
                        { nx: gx,     ny: gy - 1, face: 'N' },
                        { nx: gx + 1, ny: gy,     face: 'E' },
                        { nx: gx,     ny: gy + 1, face: 'S' },
                        { nx: gx - 1, ny: gy,     face: 'W' },
                    ];
                    for (const s of sides) {
                        const neighbor = this.map[s.ny] ? this.map[s.ny][s.nx] : null;
                        // A face is visible if it separates a solid cell from a walkable one
                        const isWalkableNeighbor = neighbor === '.' || neighbor === 'd' || neighbor === '<' || neighbor === '>';
                        
                        const isVisible = (cell === '#' && isWalkableNeighbor) ||
                                          (cell === 'D' && isWalkableNeighbor) ||
                                          (cell === 'd' && isWalkableNeighbor);
                        
                        if (!isVisible) continue;
                        
                        const fd = this.getFace(gx, gy, s.face, x, y, cosA, sinA);
                        if (fd) {
                            fd.isDoor = (cell === 'D' || cell === 'd');
                            faces.push(fd);
                        }
                    }
                }
            }
        }

        // 2. Collect visible entities
        this.entities.forEach(ent => {
            const def = Entities[ent.monsterType];
            if (!def) return;

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

            if (def.sprite) {
                // Billboard Sprite Rendering
                const rx = -dx * sinA + dy * cosA;
                const f = this.focalLength / (rz - (lunge * 0.01)); 
                const sx = rx * f + (this.canvas.width / 2);
                const sy = (this.canvas.height / 2) + bobOffset; 
                const size = f;

                faces.push({
                    type: 'sprite',
                    sprite: def.sprite,
                    sx, sy, size,
                    dist: rz - (lunge * 0.01)
                });
            } else {
                // Billboard Vector Box Fallback
                const rx = -dx * sinA + dy * cosA;
                const f = this.focalLength / (rz - (lunge * 0.01));
                const sx = rx * f + (this.canvas.width / 2);
                const sy = (this.canvas.height / 2) + bobOffset;
                const size = f * 0.6;

                faces.push({
                    type: 'vector-box',
                    name: def.name,
                    sx, sy, size,
                    dist: rz - (lunge * 0.01)
                });
            }
        });

        // 3. Painter's algorithm: draw far objects first
        faces.sort((a, b) => b.dist - a.dist);

        ctx.lineWidth = 2;
        for (const f of faces) {
            if (f.type === 'sprite') {
                // Draw PNG Sprite
                ctx.save();
                ctx.globalCompositeOperation = 'screen'; // Black becomes transparent
                const s = f.size;
                ctx.drawImage(f.sprite, f.sx - s/2, f.sy - s/2, s, s);
                ctx.restore();
            } else if (f.type === 'vector-box') {
                // Draw Billboarded Placeholder Box
                const s = f.size;
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.strokeRect(f.sx - s/2, f.sy - s/2, s, s);

                // Draw name centered in the box
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 16px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(f.name.toUpperCase(), f.sx, f.sy);
            } else {
                ctx.beginPath();
                ctx.moveTo(f.x1, f.yT1);
                ctx.lineTo(f.x2, f.yT2);
                ctx.lineTo(f.x2, f.yB2);
                ctx.lineTo(f.x1, f.yB1);
                ctx.closePath();
                ctx.fillStyle = '#000';
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.stroke();

                // If it's a door, draw a proper door frame (red)
                if (f.isDoor) {
                    // Interpolate coordinates along the face
                    // Door is 60% of wall width, centered; height goes from 15% top margin to floor
                    const marginW = 0.20; // 20% margin each side → 60% door width
                    const marginTop = 0.12; // 12% from ceiling → door top

                    // Helper to lerp between left and right edge at a given fraction
                    const lerpX = (t) => f.x1 + (f.x2 - f.x1) * t;
                    const lerpYT = (t) => f.yT1 + (f.yT2 - f.yT1) * t; // top edge at t
                    const lerpYB = (t) => f.yB1 + (f.yB2 - f.yB1) * t; // bottom edge at t

                    // Door frame corners in screen space
                    const dL = marginW;           // door left fraction
                    const dR = 1 - marginW;       // door right fraction

                    // X coords
                    const dxL = lerpX(dL);
                    const dxR = lerpX(dR);

                    // Top of door — lerped top edge + margin down
                    const dyTL = lerpYT(dL) + (lerpYB(dL) - lerpYT(dL)) * marginTop;
                    const dyTR = lerpYT(dR) + (lerpYB(dR) - lerpYT(dR)) * marginTop;

                    // Bottom of door — at the floor (yB)
                    const dyBL = lerpYB(dL);
                    const dyBR = lerpYB(dR);

                    ctx.save();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.lineJoin = 'round';

                    // Draw the door frame: left post, top bar, right post (U-shape, open at bottom)
                    ctx.beginPath();
                    ctx.moveTo(dxL, dyBL);  // bottom-left
                    ctx.lineTo(dxL, dyTL);  // up left post
                    ctx.lineTo(dxR, dyTR);  // across top bar
                    ctx.lineTo(dxR, dyBR);  // down right post
                    ctx.stroke();

                    ctx.restore();
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
            case 'N': w1={x:gx,   y:gy};   w2={x:gx+1, y:gy};   nx=0;  ny=-1; break;
            case 'E': w1={x:gx+1, y:gy};   w2={x:gx+1, y:gy+1}; nx=1;  ny=0;  break;
            case 'S': w1={x:gx+1, y:gy+1}; w2={x:gx,   y:gy+1}; nx=0;  ny=1;  break;
            case 'W': w1={x:gx,   y:gy+1}; w2={x:gx,   y:gy};   nx=-1; ny=0;  break;
        }

        // 2. Backface culling: only draw if the face is looking at the player
        // Dot product of (Face Normal) and (Vector from Face to Player)
        const vx = px - w1.x;
        const vy = py - w1.y;
        if (nx * vx + ny * vy < 0) return null;

        // 3. Transform to camera space
        const cam = (w) => ({
            rz:  (w.x - px) * cosA + (w.y - py) * sinA,
            rx: -(w.x - px) * sinA + (w.y - py) * cosA,
        });

        let c1 = cam(w1);
        let c2 = cam(w2);

        // Near-plane clip
        const NEAR = 0.1;
        if (c1.rz < NEAR && c2.rz < NEAR) return null;

        if (c1.rz < NEAR) {
            const t = (NEAR - c1.rz) / (c2.rz - c1.rz);
            c1 = { rz: NEAR, rx: c1.rx + (c2.rx - c1.rx) * t };
        } else if (c2.rz < NEAR) {
            const t = (NEAR - c2.rz) / (c1.rz - c2.rz);
            c2 = { rz: NEAR, rx: c2.rx + (c1.rx - c2.rx) * t };
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
            x1: s1.sx, yT1: s1.yT, yB1: s1.yB,
            x2: s2.sx, yT2: s2.yT, yB2: s2.yB,
            dist: (c1.rz + c2.rz) / 2,
        };
    }
}

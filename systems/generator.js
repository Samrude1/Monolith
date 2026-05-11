/**
 * Procedural Dungeon Generator for Retro Adventure.
 * Creates randomized room-and-corridor layouts.
 */

export class DungeonGenerator {
    /**
     * Generates a new map grid.
     * @param {number} width 
     * @param {number} height 
     * @param {number} seed - (Optional) To make levels reproducible
     */
    generate(width = 20, height = 20, seed = Math.random()) {
        // Simple seeded random helper
        const rng = () => {
            seed = (seed * 16807) % 2147483647;
            return (seed - 1) / 2147483646;
        };

        // 1. Initialize map with walls
        let map = Array(height).fill(null).map(() => Array(width).fill('#'));

        const rooms = [];
        const roomCount = 4 + Math.floor(rng() * 4);

        // 2. Place random rooms
        for (let i = 0; i < roomCount; i++) {
            const w = 3 + Math.floor(rng() * 5);
            const h = 3 + Math.floor(rng() * 5);
            const x = 1 + Math.floor(rng() * (width - w - 2));
            const y = 1 + Math.floor(rng() * (height - h - 2));

            // Carve room
            for (let ry = y; ry < y + h; ry++) {
                for (let rx = x; rx < x + w; rx++) {
                    map[ry][rx] = '.';
                }
            }
            rooms.push({ x: x + Math.floor(w/2), y: y + Math.floor(h/2) });
        }

        // 3. Connect rooms with corridors (L-shaped)
        for (let i = 0; i < rooms.length - 1; i++) {
            let cur = rooms[i];
            let next = rooms[i+1];

            // Horizontal
            for (let x = Math.min(cur.x, next.x); x <= Math.max(cur.x, next.x); x++) {
                map[cur.y][x] = '.';
            }
            // Vertical
            for (let y = Math.min(cur.y, next.y); y <= Math.max(cur.y, next.y); y++) {
                map[y][next.x] = '.';
            }
        }

        // 4. Place Doors ('D') at room entrances
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                if (map[y][x] === '.') {
                    // Check for horizontal or vertical doorway pattern
                    const isNS = map[y-1][x] === '#' && map[y+1][x] === '#' && map[y][x-1] === '.' && map[y][x+1] === '.';
                    const isEW = map[y][x-1] === '#' && map[y][x+1] === '#' && map[y-1][x] === '.' && map[y+1][x] === '.';
                    if ((isNS || isEW) && rng() > 0.4) {
                        map[y][x] = 'D'; 
                    }
                }
            }
        }

        // 5. Place Stairs
        const startRoom = rooms[0];
        const endRoom = rooms[rooms.length - 1];
        
        map[startRoom.y][startRoom.x] = 'S'; // Start
        map[endRoom.y][endRoom.x] = '>';     // Exit Down
        
        // Add some random Up stairs in another room if not floor 1
        if (rooms.length > 2) {
            map[rooms[1].y][rooms[1].x] = '<';
        }

        return map;
    }
}

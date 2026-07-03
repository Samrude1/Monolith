import { EntityDefs } from '../data/entities/registry.js';
import { LevelThemes } from '../data/themes.js';

/**
 * Manages dungeon levels, transitions, and state persistence.
 */
export class LevelManager {
    constructor(engine) {
        this.engine = engine;
        this.currentFloor = 1; 
        this.map = [];
        this.levelCache = {}; // Stores map and entities for visited levels
        this.isLoading = false;
    }

    /**
     * Saves the current floor's map and entities to the cache.
     */
    saveCurrentState() {
        if (!this.map || !this.map.length) return;
        
        this.levelCache[this.currentFloor] = {
            map: JSON.parse(JSON.stringify(this.engine.map)), 
            entities: [...this.engine.entities] 
        };
    }

    /**
     * Loads a dungeon floor from a file.
     * @param {number} floorNum - The floor number to load.
     * @param {string} entryChar - The character identifying the entry point ('S', '<', or '>').
     */
    async loadLevel(floorNum, entryChar = 'S') {
        if (this.isLoading) return false;

        try {
            this.isLoading = true;
            
            // Save current state before switching
            this.saveCurrentState();

            // Clear current engine state to prevent rendering artifacts
            this.engine.map = [];
            this.engine.entities = [];

            // Restore from cache if available
            if (this.levelCache[floorNum]) {
                this.currentFloor = floorNum;
                const cached = this.levelCache[floorNum];
                this.map = cached.map;
                
                this.engine.map = this.map;
                this.engine.entities = cached.entities;
                this.setPlayerPosition(entryChar);
                
                const theme = LevelThemes[this.currentFloor] || LevelThemes.default;
                await this.engine.setTheme(theme.atmosphere || theme);

                return true;
            }

            // Load level data from file
            const url = `./data/levels/Level${floorNum}.txt`;
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`Floor ${floorNum} not found`);
            
            const text = (await resp.text()).replace(/\r/g, ''); 
            this.currentFloor = floorNum;
            this.map = text.trim().split('\n').map(line => line.split(''));
            this.engine.map = this.map;

            const floorEntities = [];
            const emptyTiles = [];

            // Parse map for interactive features and empty spaces
            for (let y = 0; y < this.map.length; y++) {
                for (let x = 0; x < this.map[y].length; x++) {
                    const char = this.map[y][x];
                    if (char === '.') {
                        emptyTiles.push({ x, y });
                    } else if (char === '<' || char === '>') {
                        let decalX = x, decalY = y, facing = 'S';
                        if (this.map[y-1] && this.map[y-1][x] === '#') { decalX = x; decalY = y-1; facing = 'S'; }
                        else if (this.map[y+1] && this.map[y+1][x] === '#') { decalX = x; decalY = y+1; facing = 'N'; }
                        else if (this.map[y][x-1] === '#') { decalX = x-1; decalY = y; facing = 'E'; }
                        else if (this.map[y][x+1] === '#') { decalX = x+1; decalY = y; facing = 'W'; }

                        const type = char === '<' ? 'stairs_up' : 'stairs_down';
                        floorEntities.push({ type: 'decal', monsterType: type, x: decalX, y: decalY, facing: facing });
                        
                    } else if (char === 'D') {
                        // Door entities are now handled by the engine's wall rendering system
                    }
                }
            }
            
            this.setPlayerPosition(entryChar); 

            // Apply atmosphere settings
            const theme = LevelThemes[this.currentFloor] || LevelThemes.default;
            await this.engine.setTheme(theme.atmosphere || theme);
            const spawnConfig = theme.spawn || LevelThemes.default.spawn;

            // Randomize spawn locations
            for (let i = emptyTiles.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [emptyTiles[i], emptyTiles[j]] = [emptyTiles[j], emptyTiles[i]];
            }

            // Spawn Monsters based on theme pool (with safety zone)
            const monsterCount = spawnConfig.monsterCount;
            const monsterPool = spawnConfig.monsterPool;
            const px = this.engine.player.startX;
            const py = this.engine.player.startY;

            const safeTiles = emptyTiles.filter(tile => {
                const dist = Math.sqrt(Math.pow(tile.x + 0.5 - px, 2) + Math.pow(tile.y + 0.5 - py, 2));
                return dist > 6;
            });

            for (let i = 0; i < monsterCount && safeTiles.length > 0; i++) {
                const tileIndex = Math.floor(Math.random() * safeTiles.length);
                const tile = safeTiles.splice(tileIndex, 1)[0];
                const type = monsterPool[Math.floor(Math.random() * monsterPool.length)];
                const def = EntityDefs[type];
                if (!def) continue;

                floorEntities.push({
                    type: 'monster',
                    monsterType: type,
                    x: tile.x + 0.5,
                    y: tile.y + 0.5,
                    hp: def.hp || 20,
                    maxHp: def.maxHp || 20
                });
            }

            // Spawn Loot based on theme pool
            const lootCount = spawnConfig.lootCount;
            const lootPool = spawnConfig.lootPool;

            for (let i = 0; i < lootCount && emptyTiles.length > 0; i++) {
                const tile = emptyTiles.pop();
                const type = lootPool[Math.floor(Math.random() * lootPool.length)];
                
                floorEntities.push({
                    type: 'object',
                    monsterType: type,
                    x: tile.x + 0.5,
                    y: tile.y + 0.5
                });
            }
            
            this.engine.entities = floorEntities;

            // Add test wall decal on floor 1 (The Lever placeholder)
            if (floorNum === 1) {
                this.engine.entities.push({
                    type: 'decal',
                    monsterType: 'lever',
                    x: 3,
                    y: 2,
                    facing: 'W',
                    targetX: 3, // Coordinate of the secret passage
                    targetY: 3,
                    isPulled: false
                });

                // Add the key inside the secret room
                this.engine.entities.push({
                    type: 'object',
                    monsterType: 'key',
                    x: 7.5,
                    y: 3.5
                });
            }

            this.saveCurrentState(); 
            return true;

        } catch (e) {
            console.error("Failed to load level:", e);
            return false;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Positions the player on a specific tile based on the entry character.
     */
    setPlayerPosition(entryChar) {
        if (!this.map) return;
        let found = false;
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (!found && this.map[y][x] === entryChar) {
                    this.engine.player.startX = this.engine.player.targetX = x + 0.5;
                    this.engine.player.startY = this.engine.player.targetY = y + 0.5;
                    this.engine.player.startDir = this.engine.player.targetDir = 1; 
                    found = true;
                }
            }
        }
    }

    /**
     * Returns all entities at a specific grid coordinate.
     */
    getEntitiesAt(x, y) {
        return this.engine.entities.filter(e => Math.floor(e.x) === x && Math.floor(e.y) === y);
    }
}

import { EntityDefs } from '../data/entities/registry.js';

/**
 * Manages dungeon levels, transitions, and state persistence.
 */
export class LevelManager {
    constructor(engine) {
        this.engine = engine;
        this.currentFloor = 1; // Rename to match dungeon floor
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
     * Loads a dungeon floor, either from cache or from a file.
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
                return true;
            }

            // Load new level data
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
                    } else if (char === '<') {
                        floorEntities.push({ type: 'object', monsterType: 'stairs_up', x: x + 0.5, y: y + 0.5 });
                    } else if (char === '>') {
                        floorEntities.push({ type: 'object', monsterType: 'stairs_down', x: x + 0.5, y: y + 0.5 });
                    }
                }
            }
            
            this.setPlayerPosition(entryChar); 

            // Randomize spawn locations
            for (let i = emptyTiles.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [emptyTiles[i], emptyTiles[j]] = [emptyTiles[j], emptyTiles[i]];
            }

            // Spawn Monsters
            const monsterCount = floorNum === 1 ? 10 : 18; 
            const monsterPool = floorNum === 1 ? ['spider', 'spider', 'skeleton'] : ['skeleton', 'skeleton', 'spider'];
            
            for (let i = 0; i < monsterCount && emptyTiles.length > 0; i++) {
                const tile = emptyTiles.pop();
                const type = monsterPool[Math.floor(Math.random() * monsterPool.length)];
                const def = EntityDefs[type];

                floorEntities.push({
                    type: 'monster',
                    monsterType: type,
                    x: tile.x + 0.5,
                    y: tile.y + 0.5,
                    hp: def.hp || 20,
                    maxHp: def.maxHp || 20
                });
            }

            // Spawn Loot
            const lootCount = 12;
            const lootOptions = floorNum === 1 
                ? ['food', 'food', 'gold_pile', 'health_potion', 'sword', 'dagger', 'leather_armor']
                : ['food', 'gold_pile', 'health_potion', 'health_potion', 'sword', 'mace', 'leather_armor'];

            for (let i = 0; i < lootCount && emptyTiles.length > 0; i++) {
                const tile = emptyTiles.pop();
                const type = lootOptions[Math.floor(Math.random() * lootOptions.length)];
                
                floorEntities.push({
                    type: 'object',
                    monsterType: type,
                    x: tile.x + 0.5,
                    y: tile.y + 0.5
                });
            }
            
            this.engine.entities = floorEntities;
            this.saveCurrentState(); // Initial cache
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
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x] === entryChar) {
                    this.engine.player.startX = this.engine.player.targetX = x + 0.5;
                    this.engine.player.startY = this.engine.player.targetY = y + 0.5;
                    this.engine.player.startDir = this.engine.player.targetDir = 1; // Face East
                    
                    if (entryChar === 'S') this.map[y][x] = '.';
                    return;
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



/**
 * Monster registry — stats + pointer to ASCII art template file.
 * The vector data is loaded at startup from data/monsters/*.txt
 * by the monsterLoader system.
 */
export const MonsterDefs = {
    'skeleton': {
        name: 'Skeleton',
        hp: 30,
        attack: 8,
        speed: 0.5,
        scale: 0.85,
        spriteFile: './data/sprites/Skeleton.png',
        sprite: null,   // loaded at startup
        file: './data/monsters/Skeleton.txt',
        vector: []
    },
    'spider': {
        name: 'Spider',
        hp: 15,
        attack: 4,
        speed: 1.2,
        spriteFile: './data/sprites/Spider.png',
        sprite: null,   // loaded at startup
        file: './data/monsters/Spider.txt',
        vector: []
    }
};

// Keep backward-compatible alias used by engine.js
export const Monsters = MonsterDefs;

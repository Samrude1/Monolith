/**
 * Unified Entity Registry
 * -----------------------
 * This file contains the "Master Template" for everything in the game world:
 * Monsters, Items, Weapons, and Interactive Objects.
 * 
 * Fields are optional and can be used as needed by the systems.
 */

export const EntityDefs = {
    // --- MONSTERS ---
    'skeleton': {
        id: 'skeleton',
        name: 'Skeleton',
        type: 'monster',
        description: 'A shambling pile of bones, animated by dark magic.',
        
        // Stats
        hp: 30,
        maxHp: 30,
        atk: 8,
        def: 2,
        spd: 0.5,
        
        // Visuals
        spriteFile: './data/sprites/Skeleton.png',
        file: './data/monsters/Skeleton.txt',
        sprite: null,
        vector: []
    },
    'spider': {
        id: 'spider',
        name: 'Spider',
        type: 'monster',
        description: 'A giant arachnid with venomous fangs.',
        
        // Stats
        hp: 15,
        maxHp: 15,
        atk: 4,
        def: 0,
        spd: 1.2,
        
        // Visuals
        spriteFile: './data/sprites/Spider.png',
        file: './data/monsters/Spider.txt',
        sprite: null,
        vector: []
    },

    // --- ITEMS ---
    'key': {
        id: 'key',
        name: 'Iron Key',
        type: 'key',
        description: 'A rusty iron key. It might open a specific door.',
        
        // Item specific
        weight: 0.1,
        value: 10,
        keyId: 'gate_1', // Used to match with locked doors
        
        // Visuals
        spriteFile: './data/sprites/Key.png',
        file: './data/objects/Key.txt',
        sprite: null,
        vector: []
    },
    'food': {
        id: 'food',
        name: 'Apple',
        type: 'consumable',
        description: 'A crisp, red apple. Restores a small amount of HP.',
        
        // Item specific
        weight: 0.2,
        value: 5,
        healAmount: 10,
        
        // Visuals
        spriteFile: './data/sprites/Food.png',
        file: './data/objects/Food.txt',
        sprite: null,
        vector: []
    },
    'sword': {
        id: 'sword',
        name: 'Shortsword',
        type: 'weapon',
        description: 'A basic steel blade. Better than fighting with bare hands.',
        
        // Stats/Combat
        atk: 5,
        damage: 10,
        weight: 1.5,
        value: 50,
        
        // Visuals
        spriteFile: './data/sprites/Sword.png',
        file: './data/objects/Sword.txt',
        sprite: null,
        vector: []
    },
    'chest': {
        id: 'chest',
        name: 'Treasure Chest',
        type: 'container',
        description: 'A wooden chest bound with iron. Could contain loot.',
        
        // Container specific
        isLocked: false,
        lootTable: ['gold', 'food'],
        
        // Visuals
        spriteFile: './data/sprites/Chest.png',
        file: './data/objects/Chest.txt',
        sprite: null,
        vector: []
    }
};

// Aliases for compatibility
export const Monsters = EntityDefs;
export const ObjectDefs = EntityDefs;
export const MonsterDefs = EntityDefs;

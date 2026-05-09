/**
 * Object registry — items and interactive environmental objects.
 * Uses the same vector/sprite system as monsters.
 */
export const ObjectDefs = {
    'key': {
        name: 'Key',
        type: 'item',
        spriteFile: './data/sprites/Key.png',
        sprite: null,
        file: './data/objects/Key.txt',
        vector: []
    },
    'chest': {
        name: 'Chest',
        type: 'container',
        spriteFile: './data/sprites/Chest.png',
        sprite: null,
        file: './data/objects/Chest.txt',
        vector: []
    },
    'sword': {
        name: 'Sword',
        type: 'weapon',
        spriteFile: './data/sprites/Sword.png',
        sprite: null,
        file: './data/objects/Sword.txt',
        vector: []
    },
    'food': {
        name: 'Food',
        type: 'consumable',
        spriteFile: './data/sprites/Food.png',
        sprite: null,
        file: './data/objects/Food.txt',
        vector: []
    }
};

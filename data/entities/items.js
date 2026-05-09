/**
 * Item and Equipment Definitions
 */
export const ItemDefs = {
    'key': {
        id: 'key',
        name: 'Iron Key',
        type: 'key',
        description: 'A rusty iron key. It might open a specific door.',
        weight: 0.1, value: 10, keyId: 'gate_1',
        spriteFile: './data/sprites/Key.png',
        file: './data/objects/Key.txt',
        sprite: null, vector: []
    },
    'food': {
        id: 'food',
        name: 'Apple',
        type: 'consumable',
        description: 'A crisp, red apple. Restores a small amount of HP.',
        weight: 0.2, value: 5, healAmount: 10,
        spriteFile: './data/sprites/Food.png',
        file: './data/objects/Food.txt',
        sprite: null, vector: []
    },
    'sword': {
        id: 'sword',
        name: 'Shortsword',
        type: 'weapon',
        description: 'A basic steel blade. Better than fighting with bare hands.',
        atk: 5, def: 2, damage: 10, weight: 1.5, value: 50,
        cooldown: 4000, // 4 seconds cooldown
        spriteFile: './data/sprites/Sword.png',
        file: './data/objects/Sword.txt',
        sprite: null, vector: []
    },
    'dagger': {
        id: 'dagger',
        name: 'Dagger',
        type: 'weapon',
        description: 'Small but deadly. Very fast to use.',
        atk: 2, def: 1, damage: 6, weight: 0.5, value: 30,
        cooldown: 1500,
        spriteFile: './data/sprites/Dagger.png',
        file: './data/objects/Dagger.txt',
        sprite: null, vector: []
    },
    'mace': {
        id: 'mace',
        name: 'Iron Mace',
        type: 'weapon',
        description: 'A heavy bludgeoning weapon. Slow but hits like a truck.',
        atk: 12, def: 0, damage: 18, weight: 4.0, value: 120,
        cooldown: 7000,
        spriteFile: './data/sprites/Mace.png',
        file: './data/objects/Mace.txt',
        sprite: null, vector: []
    },
    'leather_armor': {
        id: 'leather_armor',
        name: 'Leather Armor',
        type: 'armor',
        description: 'Basic protection made from cured hide.',
        def: 5, weight: 5.0, value: 100,
        spriteFile: './data/sprites/Armor.png',
        file: './data/objects/Armor.txt',
        sprite: null, vector: []
    },
    'health_potion': {
        id: 'health_potion',
        name: 'Health Potion',
        type: 'consumable',
        description: 'A glowing red liquid. Restores 50 HP.',
        weight: 0.5, value: 25, healAmount: 50,
        spriteFile: './data/sprites/Potion.png',
        file: './data/objects/Potion.txt',
        sprite: null, vector: []
    },
    'gold_pile': {
        id: 'gold_pile',
        name: 'Gold Coins',
        type: 'treasure',
        description: 'A small pile of glinting gold coins.',
        goldValue: 30, weight: 0, value: 30,
        spriteFile: './data/sprites/Gold.png',
        file: './data/objects/Gold.txt',
        sprite: null, vector: []
    },
    'chest': {
        id: 'chest',
        name: 'Treasure Chest',
        type: 'container',
        description: 'A wooden chest bound with iron. Could contain loot.',
        isLocked: false, lootTable: ['gold', 'food'],
        spriteFile: './data/sprites/Chest.png',
        file: './data/objects/Chest.txt',
        sprite: null, vector: []
    },
    'stairs_up': {
        id: 'stairs_up',
        name: '^ STAIRS UP ^',
        type: 'object',
        sprite: null, vector: [] // Engine will fallback to vector box named 'stairs_up'
    },
    'stairs_down': {
        id: 'stairs_down',
        name: 'v STAIRS DOWN v',
        type: 'object',
        sprite: null, vector: []
    }
};

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
        spriteFile: 'assets/textures/entities/key.png',
        file: './data/objects/Key.txt',
        sprite: null, vector: [],
        scale: 0.2, onFloor: true
    },
    'food': {
        id: 'food',
        name: 'Apple',
        type: 'consumable',
        description: 'A crisp, red apple. Restores a small amount of HP.',
        weight: 0.2, value: 5, healAmount: 10,
        spriteFile: 'assets/textures/entities/apple.png',
        file: './data/objects/Food.txt',
        sprite: null, vector: [],
        scale: 0.18, onFloor: true
    },
    'sword': {
        id: 'sword',
        name: 'Shortsword',
        type: 'weapon',
        description: 'A basic steel blade. Better than fighting with bare hands.',
        atk: 5, def: 2, damage: 10, weight: 1.5, value: 50,
        cooldown: 4000, // 4 seconds cooldown
        spriteFile: 'assets/textures/entities/sword.png',
        file: './data/objects/Sword.txt',
        sprite: null, vector: [],
        scale: 0.5, onFloor: true
    },
    'dagger': {
        id: 'dagger',
        name: 'Dagger',
        type: 'weapon',
        description: 'Small but deadly. Very fast to use.',
        atk: 2, def: 1, damage: 6, weight: 0.5, value: 30,
        cooldown: 1500,
        spriteFile: 'assets/textures/entities/dagger.png',
        file: './data/objects/Dagger.txt',
        sprite: null, vector: [],
        scale: 0.3, onFloor: true
    },
    'mace': {
        id: 'mace',
        name: 'Iron Mace',
        type: 'weapon',
        description: 'A heavy bludgeoning weapon. Slow but hits like a truck.',
        atk: 12, def: 0, damage: 18, weight: 4.0, value: 120,
        cooldown: 7000,
        spriteFile: 'assets/textures/entities/mace.png',
        file: './data/objects/Mace.txt',
        sprite: null, vector: [],
        scale: 0.5, onFloor: true
    },
    'leather_armor': {
        id: 'leather_armor',
        name: 'Leather Armor',
        type: 'armor',
        description: 'Basic protection made from cured hide.',
        def: 5, weight: 5.0, value: 100,
        spriteFile: 'assets/textures/entities/armor.png',
        file: './data/objects/Armor.txt',
        sprite: null, vector: [],
        scale: 0.6, onFloor: true
    },
    'health_potion': {
        id: 'health_potion',
        name: 'Health Potion',
        type: 'consumable',
        description: 'A glowing red liquid. Restores 50 HP.',
        weight: 0.5, value: 25, healAmount: 50,
        spriteFile: 'assets/textures/entities/potion.png',
        file: './data/objects/Potion.txt',
        sprite: null, vector: [],
        scale: 0.27, onFloor: true
    },
    'door': {
        id: 'door',
        name: 'Wooden Door',
        type: 'object',
        spriteFile: 'assets/textures/entities/door.png',
        sprite: null, vector: []
    },
    'gold_pile': {
        id: 'gold_pile',
        name: 'Gold Coins',
        type: 'treasure',
        description: 'A small pile of glinting gold coins.',
        goldValue: 30, weight: 0, value: 30,
        spriteFile: 'assets/textures/entities/gold.png',
        file: './data/objects/Gold.txt',
        sprite: null, vector: [],
        scale: 0.2, onFloor: true
    },
    'chest': {
        id: 'chest',
        name: 'Treasure Chest',
        type: 'container',
        description: 'A wooden chest bound with iron. Could contain loot.',
        isLocked: false, lootTable: ['gold', 'food'],
        spriteFile: 'assets/textures/entities/chest.png',
        file: './data/objects/Chest.txt',
        sprite: null, vector: [],
        scale: 0.6, onFloor: true
    },
    'stairs_up': {
        id: 'stairs_up',
        name: '^ STAIRS UP ^',
        type: 'object',
        spriteFile: 'assets/textures/entities/stairs_up.png'
    },
    'stairs_down': {
        id: 'stairs_down',
        name: 'v STAIRS DOWN v',
        type: 'object',
        spriteFile: 'assets/textures/entities/stairs_down.png'
    },
    'lever': {
        id: 'lever',
        name: 'Iron Lever',
        type: 'interactive',
        description: 'A heavy iron lever. It seems to be connected to something.',
        width: 0.5,
        scale: 0.3,
        yOffset: 0.0, // Aligned towards waistline
        spriteFile: 'assets/textures/entities/lever.png',
        sprite: null
    }
};

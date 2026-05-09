/**
 * Monster Definitions
 */
export const MonsterDefs = {
    'skeleton': {
        id: 'skeleton',
        name: 'Skeleton',
        type: 'monster',
        description: 'A shambling pile of bones, animated by dark magic.',
        hp: 30, maxHp: 30, atk: 8, def: 2, spd: 0.5,
        cooldown: 5000,
        spriteFile: './images/skeleton.png',
        file: './data/monsters/Skeleton.txt',
        sprite: null, vector: []
    },
    'spider': {
        id: 'spider',
        name: 'Spider',
        type: 'monster',
        description: 'A giant arachnid with venomous fangs.',
        hp: 15, maxHp: 15, atk: 4, def: 0, spd: 1.2,
        cooldown: 3000,
        spriteFile: './images/spider.png',
        file: './data/monsters/Spider.txt',
        sprite: null, vector: []
    }
};

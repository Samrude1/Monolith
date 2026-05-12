/**
 * Atmospheric themes and Level definitions.
 * These control the feel of the level, what monsters spawn, and what loot is available.
 */

const THEMES = {
    CLASSIC: {
        atmosphere: {
            dustSize: 0,
            fogDist: 12,
            waistLine: 0.7,
            showWaistLine: true,
            wallTexture: 'assets/textures/themes/classic/wall.png',
            doorTexture: 'assets/textures/themes/classic/door.png',
            floorTexture: 'assets/textures/themes/classic/floor.png',
            ceilingTexture: 'assets/textures/themes/classic/ceiling.png',

        },
        spawn: {
            monsterCount: 6,
            monsterPool: ['spider', 'spider', 'skeleton'],
            lootCount: 8,
            lootPool: ['food', 'gold_pile', 'health_potion', 'dagger'],
            decalPool: ['potion_decal'] // We can add more like 'lever_decal' later
        }
    },
    DENSE_FOG: {
        atmosphere: {
            dustSize: 6,
            fogDist: 5,
            waistLine: 0.75,
            showWaistLine: true
        },
        spawn: {
            monsterCount: 15,
            monsterPool: ['skeleton', 'skeleton', 'spider'],
            lootCount: 10,
            lootPool: ['health_potion', 'gold_pile', 'sword', 'leather_armor']
        }
    },
    OPEN_VOID: {
        atmosphere: {
            dustSize: 2,
            fogDist: 15,
            waistLine: 0.5,
            showWaistLine: false
        },
        spawn: {
            monsterCount: 8,
            monsterPool: ['skeleton'],
            lootCount: 15,
            lootPool: ['gold_pile', 'gold_pile', 'mace']
        }
    },
    CRISP: {
        atmosphere: {
            dustSize: 1,
            fogDist: 12,
            waistLine: 0.8,
            showWaistLine: true
        },
        spawn: {
            monsterCount: 12,
            monsterPool: ['spider', 'skeleton'],
            lootCount: 12,
            lootPool: ['food', 'gold_pile', 'health_potion', 'leather_armor']
        }
    }
};

/**
 * Map floor numbers to atmospheres and spawn logic.
 */
export const LevelThemes = {
    1: THEMES.CLASSIC,
    2: THEMES.CLASSIC,
    3: THEMES.OPEN_VOID,
    4: THEMES.CRISP,

    // Level 13 - Final Challenge
    13: {
        ...THEMES.DENSE_FOG,
        spawn: {
            monsterCount: 20,
            monsterPool: ['skeleton'],
            lootCount: 5,
            lootPool: ['health_potion', 'gold_pile']
        }
    },

    default: THEMES.CLASSIC
};

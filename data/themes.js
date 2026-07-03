/**
 * Atmospheric themes and Level definitions.
 * These control the feel of the level, what monsters spawn, and what loot is available.
 */

const THEMES = {
    CLASSIC: {
        atmosphere: {
            dustSize: 6,
            fogDist: 12,
            waistLine: 0.7,
            showWaistLine: true,
            // Re-enabled textures for modern retro look
            wallTexture: 'assets/textures/themes/classic/wall.png',
            floorTexture: 'assets/textures/themes/classic/floor.png',
            ceilingTexture: 'assets/textures/themes/classic/ceiling.png',
            doorTexture: 'assets/textures/themes/classic/door.png',
            textureScale: 1.0
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
    1: { ...THEMES.CLASSIC, atmosphere: { ...THEMES.CLASSIC.atmosphere, tint: 'rgba(0, 50, 255, 0.3)' } },
    2: { ...THEMES.CLASSIC, atmosphere: { ...THEMES.CLASSIC.atmosphere, tint: 'rgba(0, 255, 50, 0.2)' } },
    3: { ...THEMES.OPEN_VOID, atmosphere: { ...THEMES.OPEN_VOID.atmosphere, tint: 'rgba(200, 0, 255, 0.2)' } },
    4: { ...THEMES.CRISP, atmosphere: { ...THEMES.CRISP.atmosphere, tint: 'rgba(0, 255, 255, 0.2)' } },
    5: { ...THEMES.CLASSIC, atmosphere: { ...THEMES.CLASSIC.atmosphere, tint: 'rgba(255, 100, 0, 0.2)' } },
    6: { ...THEMES.DENSE_FOG, atmosphere: { ...THEMES.DENSE_FOG.atmosphere, tint: 'rgba(100, 100, 100, 0.4)' } },
    7: { ...THEMES.OPEN_VOID, atmosphere: { ...THEMES.OPEN_VOID.atmosphere, tint: 'rgba(50, 0, 100, 0.4)' } },
    8: { ...THEMES.CRISP, atmosphere: { ...THEMES.CRISP.atmosphere, tint: 'rgba(255, 255, 0, 0.2)' } },
    9: { ...THEMES.DENSE_FOG, atmosphere: { ...THEMES.DENSE_FOG.atmosphere, tint: 'rgba(0, 100, 0, 0.4)' } },
    10: {
        ...THEMES.DENSE_FOG,
        atmosphere: { ...THEMES.DENSE_FOG.atmosphere, tint: 'rgba(255, 0, 0, 0.3)' },
        spawn: {
            monsterCount: 18,
            monsterPool: ['skeleton', 'spider'],
            lootCount: 8,
            lootPool: ['health_potion', 'gold_pile', 'sword']
        }
    },

    // Level 13 - Final Challenge
    13: {
        ...THEMES.DENSE_FOG,
        atmosphere: { ...THEMES.DENSE_FOG.atmosphere, tint: 'rgba(150, 0, 0, 0.4)' },
        spawn: {
            monsterCount: 20,
            monsterPool: ['skeleton'],
            lootCount: 5,
            lootPool: ['health_potion', 'gold_pile']
        }
    },

    default: THEMES.CLASSIC
};

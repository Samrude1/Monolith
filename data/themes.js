/**
 * Visual themes for different dungeon floors.
 */

// Define reusable theme templates
const THEMES = {
    CLASSIC: {
        wallColor: [255, 255, 255],
        dustColor: [100, 100, 100],
        dustSize: 4,
        fogDist: 8,
        waistLine: 0.7,
        showWaistLine: true
    },
    TOXIC: {
        wallColor: [50, 255, 50],
        dustColor: [20, 100, 20],
        dustSize: 6,
        fogDist: 6,
        waistLine: 0.75,
        showWaistLine: true
    },
    VOLCANIC: {
        wallColor: [255, 80, 0],
        dustColor: [100, 30, 0],
        dustSize: 3,
        fogDist: 10,
        waistLine: 0.6,
        showWaistLine: true
    }
};

/**
 * Map floor numbers to themes.
 * You can easily reuse themes by assigning the same template to different floors.
 */
export const LevelThemes = {
    1: THEMES.CLASSIC,
    2: THEMES.TOXIC,
    3: THEMES.VOLCANIC,
    
    // Examples of reusing themes:
    // 4: THEMES.CLASSIC,
    // 5: THEMES.TOXIC,

    default: THEMES.CLASSIC
};

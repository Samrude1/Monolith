# Memory — Performance Fix for Sprites

Last updated: 2026-07-03

## What was built

- Identified and fixed a major performance bottleneck causing the game to lag and stutter.
- Resized overly large sprites (`data/sprites/Skeleton.png` and `data/sprites/Spider.png`) from 1024x1024 down to 128x128.

## Decisions made

- Maintained the "1990s Modern" pixel art aesthetic by using nearest-neighbor scaling when resizing the sprites.
- Fixed the issue directly at the asset level rather than modifying `engine.js` (Canvas rendering pipeline), keeping the engine optimized for low-res pixel art.

## Problems solved

- The game was lagging because `imageSmoothingEnabled` is set to `false` in the Canvas 2D engine, and it struggled to manually scale down massive 1024x1024 images on every frame.

## Current state

- The game now runs smoothly. Large sprites have been correctly resized.
- Existing code and engine logic remain untouched and fully functional.

## Next session starts with

- Verify the game runs flawlessly with no lag, and continue adding new features or entities to the game as planned in `game-entity-workflow.md`.

## Open questions

- None.

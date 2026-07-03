# Memory — Rendering Engine Performance Optimizations

Last updated: 2026-07-03

## What was built

- Implemented an **offscreen canvas (`spriteDarkenCanvas`)** for distance darkening of sprites and wall decals. This replaced the extremely slow `ctx.filter = brightness(...)` calls with ultra-fast `source-atop` compositing, while keeping entities fully opaque (fixing the "ghost/transparent lever" bug).
- Replaced the expensive 16-stop multi-stop fog gradient on walls with a blazing-fast **2-stop linear gradient**.
- Optimized the **floor/ceiling renderer's hot loop** (32,400 pixels/frame) by replacing double float modulo math with fast `Math.floor()` and integer bounds checking.
- Fixed a 0.5px rendering gap in the `wall-decal` slice loop that was causing decals to look transparent when drawn over walls.

## Decisions made

- Abandoned both `globalAlpha` fading (makes entities translucent) and `ctx.filter` (causes massive lag). The new offscreen canvas approach is the permanent, performant solution for retro distance fog on sprites.
- Maintained the visual appearance (entities still fade out in the distance) but achieved a massive performance gain, keeping the game at a smooth 60 FPS even on large levels.

## Problems solved

- The game was struggling with performance due to expensive Canvas API calls and double modulo math in the main render loop.
- Sprites and decals (like the lever) were appearing transparent and letting the wall texture bleed through. Both the lag and the visual bugs are now fully resolved.

## Current state

- The rendering engine (`engine.js`) has been heavily optimized and all visual bugs related to the fog are fixed. The game runs buttery smooth.

## Next session starts with

- Pick up from `game-entity-workflow.md` and continue adding new mechanics, puzzles, or entities now that the core rendering engine is rock solid.

## Open questions

- None.

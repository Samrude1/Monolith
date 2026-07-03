# Memory — Rendering Engine Performance Optimizations

Last updated: 2026-07-03

## What was built

- Optimized distance darkening in `engine.js`. Replaced expensive `ctx.filter = brightness(...)` calls with `ctx.globalAlpha` fading for sprites, decals, and vector monsters.
- Optimized wall tinting in `engine.js` by rendering the subtle blue tint once per wall instead of once per vertical slice.
- Increased decal `sliceWidth` from 1 to 2 to halve draw calls during decal rendering.

## Decisions made

- Shifted from "brightness darkening" to "alpha fading into fog". Instead of darkening the image value, entities now become more transparent in the distance, blending with the dark background/fog. This is dramatically faster for the Canvas API to render.
- Maintained the visual appearance (entities still fade out in the distance) but achieved a significant performance gain.

## Problems solved

- The game was struggling with performance due to expensive Canvas API calls (`ctx.filter`) in the main render loop. By replacing `ctx.filter` with `ctx.globalAlpha` and moving the wall tint polygon out of the slice loop, the engine's frame rate and stability have been vastly improved.

## Current state

- The rendering engine (`engine.js`) has been optimized and the changes are committed to version control. The game now runs with lower overhead.

## Next session starts with

- Run the game (`npm run dev`) and test the visual fidelity of the new alpha-fade fog effect compared to the old brightness fog. Ensure there are no visual glitches or unintended ghosting with the alpha fade.

## Open questions

- Does the alpha fade introduce any visual issues if entities overlap?

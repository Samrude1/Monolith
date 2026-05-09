# Game Development Status: 2026-05-09 (Handover Edition)

## Current State
- **Core Engine**: Advanced pseudo-3D rendering using `1/Z` perspective-correct interpolation for decals and billboarding for sprites.
- **Entity System**: Centralized registry in `data/entities/`. All entities (monsters, items, decals) follow a unified schema.
- **Level Management**: `LevelManager` handles floor transitions, state caching (visited floors), and procedurally spawns monsters and loot based on map templates.
- **Rendering**: Optimized for pixel art (no smoothing). Supports "wireframe" themes with fog and floor particles.

## 🚀 Handover Briefing for the Next AI Developer
Welcome. You are taking over a high-quality, vanilla JS DRPG engine. The project is "Architect-ready".

### Key Architectures to Understand:
1.  **Player Movement**: In `engine.js`, the player move is a state machine. `animProgress` handles interpolation between tiles. Inputs are blocked until `animProgress >= 1.0`.
2.  **Rendering Pipeline**: The engine doesn't use Raycasting in the traditional sense; it projects wall faces and billboards. `engine.js:render()` is the heart.
3.  **Entity Spawning**: Logic is in `systems/level.js`. It parses `.txt` maps and places entities from `EntityDefs`.

### Critical Next Tasks:
- [ ] **Inventory System**: The player can stand on items, but there is no `this.player.inventory` array or UI to show it.
- [ ] **Combat Resolution**: The `attack()` method in `engine.js` finds the target, but doesn't yet reduce HP or trigger death states.
- [ ] **Level Triggers**: Implement the logic for stairs (`<` and `>`) in `main.js` to call `LevelManager.loadLevel()`.

## Project Structure
- `data/entities/`:
    - `monsters.js`: Enemy stats and sprites.
    - `items.js`: Gear, food, and quest items.
    - `registry.js`: The "Source of Truth" for all entity definitions.
- `systems/`:
    - `level.js`: Dungeon floor logic and spawning.
    - `sound.js`: WebAudio API (placeholders).
- `engine.js`: The main rendering and collision engine.

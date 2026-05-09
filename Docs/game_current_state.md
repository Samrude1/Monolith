# Game Development Status: 2026-05-08

## Current State
- **Core Engine**: Advanced 3D rendering with billboard support for both sprites and vector-boxes.
- **Entity System**: Unified, scalable RPG registry implemented in `data/entities/`.
- **Rendering**: Smooth 'screen' blend mode for PNG sprites. Sharp pixel-art rendering (smoothing disabled).
- **Entities**: Monsters and Items (Keys, Chests, Swords, Food) now share a common stats template.
- **Level Design**: Expanded map characters (K, C, W, F) for item spawning.

## Completed in this session
- [x] **Entity Registry Splitting**: Moved definitions to `data/entities/` (monsters, items, registry).
- [x] **Unified RPG Template**: Added stats like HP, ATK, Weight, Value, and HealAmount to all entities.
- [x] **Billboard Vector Boxes**: Fixed placeholder rendering to always face the player and center text.
- [x] **Pixel Art Optimization**: Disabled canvas image smoothing for sharp sprite rendering.
- [x] **Item Spawning**: LevelManager now spawns keys, chests, weapons, and food from map files.

## Immediate Next Steps
1. **Inventory System**: Logic to pick up items (K, C, W, F) and display them in a list.
2. **Combat System**: Basic attack logic and HP reduction for monsters.
3. **Locked Doors**: Implementation of 'L' tiles that require a specific `keyId`.

## Project Structure
- `data/entities/`:
    - `monsters.js`: Vihollisten määrittelyt.
    - `items.js`: Esineiden ja varusteiden määrittelyt.
    - `registry.js`: Keskitetty hakuportti kaikelle datalle.
- `data/monsters/` & `data/objects/`: Vektori-pohjaiset fallback-templatet.
- `data/sprites/`: PNG-grafiikat.

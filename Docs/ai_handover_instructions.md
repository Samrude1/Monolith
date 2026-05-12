# AI Agent Handover: Retro Adventure Project

This document serves as a briefing for any AI assistant or agent taking over the development of the **Retro Adventure** project. 

## Project Overview
Retro Adventure is a first-person pseudo-3D dungeon crawler built with vanilla JavaScript and HTML5 Canvas. It currently uses a "Software Renderer" style (raycasting-like) to create a 3D effect from 2D ASCII maps.

## Technical Stack
- **Language:** Vanilla JavaScript (ES Modules)
- **Rendering:** 2D Canvas API (Context 2D)
- **State Management:** Custom classes (`GameEngine`, `LevelManager`)
- **Data Format:** ASCII-based `.txt` files for levels, JSON/JS objects for entities and themes.

## Core Architecture
- **`engine.js`**: Handles the math for projecting 2D coordinates into a 3D view. It uses a range-based grid search to collect visible faces and sprites, sorting them (Painter's Algorithm) for rendering.
- **`systems/level.js`**: Manages map loading, entity spawning (monsters, items), and floor transitions.
- **`main.js`**: Entry point. Sets up the UI, handles input (keyboard/DPAD), and runs the game loop.
- **`data/`**: Contains the "DNA" of the game.
    - `levels/`: ASCII maps where `#` = Wall, `.` = Floor, `S` = Start, `D/d` = Door.
    - `entities/`: Definitions for monsters and items.

## Critical Instructions for the AI Agent
1.  **Performance Priority:** The USER prioritizes 60 FPS and scalability. When adding features, always consider the computational cost.
2.  **Code Style:** Keep the code modular and avoid external dependencies unless moving to Three.js (see `3d_transition_roadmap.md`).
3.  **Grid-Based Logic:** The engine relies on a strict grid. All coordinates (`x`, `y`) are based on grid units. When moving or checking collisions, use the `LevelManager` to query the grid state.
4.  **Transition to 3D:** The project is prepared for a migration to **Three.js**. Refer to `Docs/3d_transition_roadmap.md` for the technical strategy on how to replace the rendering layer while keeping the logic layer intact.
5.  **Aesthetics:** The game uses a "Retro Vector" look. Maintain high-contrast, vibrant colors and sharp pixel art (image-smoothing is disabled).

## Current Task Status
- [x] Basic rendering and movement.
- [x] Item and monster spawning.
- [x] Level transition system.
- [ ] Transition to Three.js (Pending/Future).
- [ ] Sound system.
- [ ] Advanced AI behaviors.

---
**Agent Instruction:** Read `engine.js` and `systems/level.js` first to understand the projection math and map parsing before suggesting changes.

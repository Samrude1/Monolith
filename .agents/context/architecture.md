# Architecture Context

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Engine | Vanilla ES6+ JavaScript | Core logic and rendering |
| Graphics | HTML5 Canvas | Geometric stroke and raster rendering |
| Build Tool | Vite | Fast development and bundling |
| Scripts | Node.js | Asset generation (pngjs) |

## System Boundaries

- `engine.js` — Core rendering engine and pseudo-3D perspective math.
- `main.js` — Initialization, game loop, and event handling.
- `assets/` / `images/` — Game textures, sprites, and static files.
- `systems/` — Modular game managers.
- `*.js` (root) — Various build/asset generation scripts (e.g. `create_texture.js`).

## Storage Model

- **Local Storage (Planned)**: For floor progress, character state, and save games.

## Rendering Pipeline

- **Pseudo-3D Rendering**: No WebGL/Three.js. Perspective-correct transformations on Canvas API.
- **Painter's Algorithm**: Depth management by drawing furthest objects first.
- **Level Loading**: Levels loaded from ASCII text files into a 2D grid.
- **Culling**: Only surfaces within the player's FOV are drawn.

## Invariants

1. No external 3D libraries (Three.js, Babylon.js) should be used.
2. Maintain zero-dependency frontend runtime (only vanilla JS).

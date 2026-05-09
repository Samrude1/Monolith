# Retro Vector Adventure: Architecture

## Core Engine (`engine.js`)
- **3D Projection**: Custom perspective projection using focal length and Z-distance.
- **Clipping**: Real-time linear interpolation for faces passing behind the camera.
- **Painter's Algorithm**: Z-sorting of all faces (walls, sprites, boxes) to ensure correct occlusion.
- **Backface Culling**: Normal-based culling for walls to optimize rendering.
- **Rendering Modes**:
    - **Wall Faces**: Solid filled polygons with outlines.
    - **PNG Sprites**: Billboarded 2D images with `screen` blend mode for transparency.
    - **Vector Boxes**: Billboarded wireframe boxes with text labels (fallback for missing sprites).

## Data Registry (`data/entities/`)
- **Scalable Registry**: Split into category-specific files (`monsters.js`, `items.js`).
- **Unified Registry (`registry.js`)**: Combines all categories into a single searchable `EntityDefs` object.
- **Entity Templates**: Comprehensive RPG stats (HP, ATK, DEF, Weight, Value, HealAmount) shared across all entity types.

## Systems (`systems/`)
- **LevelManager**: Handles floor loading from `data/levels/*.txt`, floor cache/restore, and floor-aware monster + loot spawning.
- **MonsterLoader**: Parser that converts ASCII-style `.txt` files into 3D vector line segments.
- **SoundManager**: Lightweight WebAudio wrapper for SFX toggling and playback.

## UI
- **Hybrid System**: High-performance Canvas for 3D world + DOM overlay for stats and message logs.

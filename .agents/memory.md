# Memory

## Ground Truth (2026-07-03)
- The project is **Monolith / Retro Adventure**, a vanilla JavaScript pseudo-3D dungeon crawler.
- **Engine**: Custom HTML5 Canvas rendering using perspective-correct transformations and Painter's algorithm. No WebGL or external 3D libraries.
- **Aesthetic**: "1990s Modern". Includes raster textures for walls/entities, CRT effects, and pixelated fonts.
- **Current Architecture**: Modular scripts loaded via Vite. ASCII files dictate level structures.
- **Current UI**: Documented in `ui-context.md`. Core styles reside in `style.css`.
- **Next Steps**:
  1. Implement procedural map generation capabilities.
  2. Integrate `localStorage` for state persistence (floors and character).
  3. Expand interactivity (puzzles, advanced levers).

## Active Context
- Project has been successfully onboarded into `.agents` context mapping. Ready for further feature development based on the roadmap.

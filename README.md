# MONOLITH 🏛️

A professional, high-performance pseudo-3D dungeon crawler engine built with Vanilla JavaScript and HTML5 Canvas.

![Monolith Screenshot](./images/screenshot.png)

## 🎮 Overview

**Monolith** is a technical showcase of first-person dungeon crawler (DRPG) mechanics. It features a custom rendering pipeline that simulates a 3D perspective using perspective-correct transformations, billboarding, and distance-based atmospheric effects—all without external libraries like Three.js.

### Key Features
- **Custom Pseudo-3D Engine**: Fast, software-based rendering with sub-pixel precision.
- **Advanced Sprite System**: High-quality billboard rendering for entities and wall decals with perspective-correct `1/Z` interpolation.
- **Dynamic Theme Architecture**: Configurable visuals per floor, including fog, wall colors, and dust particles.
- **Unified RPG Data Layer**: A centralized entity registry (`data/entities/`) for monsters and loot, using a standard template for HP, stats, and behavior.
- **Retro Aesthetic**: Sharp pixel-art rendering with disabled smoothing and classic "wireframe-ish" waist-line details.

## 🛠️ Technical Stack
- **Engine**: Vanilla ES6+ JavaScript.
- **Graphics**: HTML5 Canvas (Direct context manipulation).
- **Architecture**: Modular "Manager" pattern (Engine, LevelManager, SoundManager).
- **Data**: JSON/Registry-based entity system for easy balancing and expansion.

## 🚀 Handover Status (2026-05-09)
This project is currently in a "Solid Core" state. The rendering and entity systems are fully functional. The codebase is prepared for a transition to a new development environment (e.g., Cursor/Claude).

### Current Priorities for the New Model:
1.  **Combat & Inventory Logic**: Implementing the state changes for attacking and item management.
2.  **Map/Minimap**: Adding a navigation UI element.
3.  **Persistence**: Integrating `localStorage` for floor progress and player stats.

## 🕹️ Running Locally
1. Clone the repository.
2. Run `npm run dev` to start the local development server.
3. Open `http://localhost:3000` (or the port specified in the console).

---
*Architected for expansion. Optimized for performance.*

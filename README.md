# MONOLITH 🏛️

A professional, high-performance pseudo-3D dungeon crawler engine built with Vanilla JavaScript and HTML5 Canvas.

![Monolith Screenshot](./images/screenshot.png)

## 🎮 Overview

**Monolith** is a technical showcase of first-person dungeon crawler (DRPG) mechanics. It features a custom rendering pipeline that simulates a 3D perspective using perspective-correct transformations, billboarding, and distance-based atmospheric effects—all without external libraries like Three.js.

### Key Features
- **Custom Pseudo-3D Engine**: Fast, software-based rendering with sub-pixel precision.
- **Automated Texture System**: Dynamic theme-based texture mapping for walls, floors, ceilings, and doors.
- **Advanced Sprite System**: High-quality billboard rendering with automatic chromakey background removal.
- **Enhanced UI Layout**: Optimized sidebar panels with dedicated XP, Level, and Gold tracking.
- **Dynamic Theme Architecture**: Configurable visuals per floor (fog, textures, particles).
- **Unified RPG Data Layer**: Centralized entity registry for monsters and loot.
- **Retro Aesthetic**: Sharp pixel-art rendering with modern "wireframe-ish" details.

---

## 🚀 Getting Started

Follow these steps to get the game running on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [Git](https://git-scm.com/)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Samrude1/Retro_Adventure.git
   cd Retro_Adventure
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Play:**
   Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

---

## 🕹️ How to Play

Explore the depths of the Monolith, defeat monsters, and find your way to the deeper floors.

### Controls
| Action | Keyboard | UI Button |
| :--- | :--- | :--- |
| **Move Forward** | `W` / `↑` | `UP` |
| **Turn Left** | `A` / `←` | `LEFT` |
| **Turn Right** | `D` / `→` | `RIGHT` |
| **Interact / Open** | `Space` | `OPEN` |
| **Attack** | - | `ATTACK` |
| **Defend / Parry** | - | `DEFEND` |
| **Pick Up Item** | - | `TAKE` |
| **Inventory** | - | `INV` |

### Gameplay Mechanics
- **Exploration**: Use the movement keys to navigate the grid-based dungeon. Look for stairs to go up (`<`) or down (`>`).
- **Combat**: When facing a monster, use **ATTACK** to strike. Use **DEFEND** to raise your guard—timing it right can result in a **Perfect Parry**, dealing massive counter-damage!
- **Inventory**: Pick up items (gold, weapons, food) using **TAKE**. Open your **INV** to equip gear or consume items to restore health.
- **Leveling**: Gain XP by defeating monsters to increase your Max HP and stats.

---

## 🛠️ Technical Stack
- **Engine**: Vanilla ES6+ JavaScript.
- **Graphics**: HTML5 Canvas (Direct context manipulation).
- **Tooling**: [Vite](https://vitejs.dev/) for fast development and bundling.
- **Architecture**: Modular "Manager" pattern (Engine, LevelManager, SoundManager).

---

## 📅 Status (2026-05-11)
The engine has evolved into a "Textured Core" state. It now supports full texture mapping and refined UI layouts.

### Current Priorities:
1. **Procedural Elements**: Adding map generation capabilities for infinite dungeons.
2. **Persistence**: Integrating `localStorage` for floor progress and character state.
3. **Map/Minimap**: Adding a navigation UI element.

---
*Architected for expansion. Optimized for performance.*

# MONOLITH 🏛️

A minimalist, retro-styled 3D dungeon crawler built with pure JavaScript and HTML5 Canvas.

![Monolith Screenshot](./images/screenshot.png)

## 🎮 Overview

**Monolith** is a tribute to classic first-person dungeon crawlers (DRPGs) of the 8-bit and 16-bit era. It combines a custom pseudo-3D wireframe engine with pixel art sprites to create a unique, atmospheric exploration experience.

### Key Features
- **Custom Pseudo-3D Engine**: A lightweight raycasting-inspired engine optimized for a "True Vector" aesthetic.
- **Dynamic Theme System**: Each dungeon floor has its own visual identity, including custom wall colors, distance fog, and floor particles.
- **Classic DRPG Combat**: Turn-based interaction with monsters like Skeletons and Giant Spiders.
- **Inventory & Loot**: Find weapons (Daggers, Swords, Maces), armor, and consumables hidden in treasure chests.
- **Atmospheric Visuals**: Perspective-correct waist-lines, distance-scaled floor dust, and atmospheric fog.

## 🕹️ How to Play
- **WASD / Arrow Keys**: Move and turn.
- **Attack**: Strike the monster in front of you.
- **Take**: Pick up items found on the floor.
- **Inv**: Open your inventory to equip gear or use items.
- **Explore**: Find the stairs ( `>` ) to descend deeper into the Monolith.

## 🛠️ Technical Details
- **Logic**: Vanilla JavaScript (ES6 Modules).
- **Rendering**: HTML5 Canvas API (No external 3D libraries).
- **Themes**: Centrally managed via `data/themes.js`.
- **Level Design**: Maps are parsed from simple `.txt` files for easy modding.

## 🚀 Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/Samrude1/Monolith.git
   ```
2. Open `index.html` in any modern web browser.
3. (Optional) Use a local server (like `Live Server` or `npm run dev`) to ensure all modules load correctly.

## 📜 Roadmap
- [x] Theme-based Level System
- [x] Pixel Art Sprite Integration
- [x] Distance Fog & Floor Noise
- [ ] Save/Load System (localStorage)
- [ ] More enemy types and bosses
- [ ] Dungeon map/minimap

---
*Created with passion for retro gaming.*

# Game Entity Registry

This registry tracks the parameters of game entities to maintain balance and visual consistency.

### Gold Pile

File: data/entities/items.js
Last updated: 2026-07-05

| Property         | Value           |
| ---------------- | --------------- |
| Type             | Treasure        |
| Gold Value       | 30              |
| Weight           | 0               |
| Scale            | 0.2             |
| On Floor         | true            |
| Sprite Source    | assets/textures/entities/gold.png |

**Pattern notes:**
Items that rest on the floor use the `onFloor: true` flag and typically have a smaller scale (e.g., 0.2) to fit correctly in perspective on the dungeon floor. Treasure items usually have 0 weight to not encumber the player.

# UI Context

## Theme

1990s DRPG (Dungeon RPG) — Dark dungeon atmosphere with vibrant color-coded UI.
High contrast, CRT screen effects, pixelated font, and blocky visuals.
Inspired by classics like **Eye of the Beholder**, **Dungeon Master**, and **Ultima Underworld**.

## Colors

| Role | CSS Variable | Value |
| --- | --- | --- |
| Page background | `--bg-color` | `#08080f` (deep midnight black) |
| Panel background | `--panel-bg` | `#0c0c18` (dark blue-black) |
| Panel border | `--panel-border` | `#b8860b` (dark goldenrod) |
| Panel border lit | `--panel-border-lit` | `#ffd700` (bright gold) |
| Text (main) | `--color-text` | `#d4c89a` (aged parchment) |
| Text (dim) | `--color-text-dim` | `#887755` (dim label) |
| HP high | `--hp-high` | `#22cc44` (green) |
| HP mid | `--hp-mid` | `#ddaa00` (amber) |
| HP low | `--hp-low` | `#cc2222` (red) |
| Action buttons | `--btn-action-*` | Green theme (#2a7a2a border) |
| Movement buttons | `--btn-move-*` | Blue theme (#2244aa border) |
| XP / Progress | `--xp-*` | Purple theme (#6633aa border) |
| Log text default | `--log-text` | `#88cc88` (soft green) |
| Log text damage | `--log-text-damage` | `#ff5555` (red) |
| Log text loot | `--log-text-loot` | `#ffd700` (gold) |
| Log text warning | `--log-text-warning` | `#ffaa22` (amber) |
| Story border | `--story-border` | `#4455cc` (blue-purple) |

## Typography

| Role | Font |
| --- | --- |
| Main UI Text | 'Press Start 2P', cursive |

## Layout Patterns

- **Game Wrapper**: Central `1200x800` container, scaled to fit. Gold double-border.
- **Main Layout**: Split layout. The `view-container` is in the center. Sidebars (`ui-panel`) on the left (Stats) and right (Actions/Controls).
- **Overlays / Modals**: Absolute positioned flex containers centered on the screen (`.overlay`, `#inventory-overlay`, `.story-overlay`).
- **Effects**: Hit flashes, screen shake, CRT scanlines (via `::after` on game-wrapper).

## CSS Styles (Extracted)

The core styles reside in `style.css` and `style_crt.css`.
Key features:
- **No grayscale** — full color enabled (`filter: contrast(1.1) brightness(1.05)` only).
- Gold panel borders (`border: 3px solid var(--panel-border)`) on all UI frames.
- Action buttons: green theme. Movement buttons: blue theme. XP: purple theme.
- HP bar dynamically changes class (`hp-high`, `hp-mid`, `hp-low`) via JS in `updateStatsUI()`.
- Message log auto-classifies text by keyword in `addLog()` for color-coded combat feedback.
- Backdrop filters for UI panels (`backdrop-filter: blur(3px);`).
- Pixelated image rendering (`image-rendering: pixelated;`).
- CSS animations for visual feedback (`flashEffect`, `shake`, `storyFadeIn`, `titlePulse`, `deathPulse`).

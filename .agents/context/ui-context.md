# UI Context

## Theme

1990s Modern / Pure Black & White Retro Look. 
High contrast, CRT screen effects, pixelated font, and blocky visuals. The UI is heavily stylized as an old-school dungeon crawler.

## Colors

| Role | CSS Variable | Value |
| --- | --- | --- |
| Page background | `--bg-color` | `#000000` |
| Line/Border | `--line-color` | `#ffffff` |
| Glow | `--glow-color` | `rgba(255, 255, 255, 0.4)` |
| Panel Background | `--panel-bg` | `rgba(0, 0, 0, 0.9)` |

## Typography

| Role | Font |
| --- | --- |
| Main UI Text | 'Press Start 2P', cursive |

## Layout Patterns

- **Game Wrapper**: Central `1200x800` container, scaled to fit.
- **Main Layout**: Split layout. The `view-container` is in the center. Sidebars (`ui-panel`) on the left (Stats) and right (Actions/Controls).
- **Overlays / Modals**: Absolute positioned flex containers centered on the screen (`.overlay`, `#inventory-overlay`, `.story-overlay`).
- **Effects**: Hit flashes, screen shake, CRT scanlines (via `::after` on game-wrapper).

## CSS Styles (Extracted)

The core styles reside in `style.css` and `style_crt.css`. 
Key features:
- Grayscale filter applied on `#game-wrapper` (`filter: grayscale(100%) contrast(1.2) brightness(1.1);`).
- Backdrop filters for UI panels (`backdrop-filter: blur(5px);`).
- Pixelated image rendering (`image-rendering: pixelated;`).
- CSS animations for visual feedback (`flashEffect`, `shake`, `storyFadeIn`).

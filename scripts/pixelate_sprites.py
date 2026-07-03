"""
pixelate_sprites.py
-------------------
Pixelates sprites by downscaling to a low-resolution "pixel grid" size
and then upscaling back with NEAREST-NEIGHBOR (no smoothing).

This gives the classic 1990s DRPG look: visible square pixels,
limited color detail, no smooth gradients.

Usage:
    python scripts/pixelate_sprites.py

Adjust PIXEL_SIZE per image to control how coarse the pixelation is.
Bigger = more pixelated / fewer visible pixels.
"""

from PIL import Image
import shutil
import os

BASE_DIR = r"D:\Games\Retro_Adventure\assets\textures\entities"
BACKUP_DIR = r"D:\Games\Retro_Adventure\assets\textures\entities\originals_backup"

# ---------------------------------------------------------------
# Targets: (filename, pixel_block_size)
# pixel_block_size = how many final pixels each "pixel cell" covers.
# The image is scaled down to (w/block x h/block) then back up.
# Smaller block = more detail kept. Larger block = chunkier pixels.
#
# Third pass — apple done, spider and potion one step further
# Apple:   block=5  (keep as-is)
# Spider:  block=7  (more visible grid, legs still readable)
# Potion:  block=12 (kills the gloss/bubble detail, chunky 90s look)
# Lever:   block=10 (downgrades HD art to chunky 90s pixel art)
# Key:     block=8  (makes the key look retro)
# ---------------------------------------------------------------
TARGETS = [
    ("apple.png",   5),
    ("potion.png", 12),
    ("spider.png",  7),
    ("lever.png",  10),
    ("key.png",     8),
]

def backup_originals():
    os.makedirs(BACKUP_DIR, exist_ok=True)
    for fname, _ in TARGETS:
        src = os.path.join(BASE_DIR, fname)
        dst = os.path.join(BACKUP_DIR, fname)
        if not os.path.exists(dst):   # only backup once
            shutil.copy2(src, dst)
            print(f"  Backed up: {fname}")
        else:
            print(f"  Backup already exists: {fname}")

def pixelate(img_path, block_size):
    """
    Pixelate by: scale DOWN to (w/block, h/block) with NEAREST,
    then scale back UP to original size with NEAREST.
    Preserves transparency (RGBA).
    """
    img = Image.open(img_path).convert("RGBA")
    orig_w, orig_h = img.size

    # Step 1: scale DOWN
    small_w = max(1, orig_w // block_size)
    small_h = max(1, orig_h // block_size)
    small = img.resize((small_w, small_h), Image.Resampling.NEAREST)

    # Step 2: scale back UP to original size
    result = small.resize((orig_w, orig_h), Image.Resampling.NEAREST)

    result.save(img_path, "PNG")
    print(f"  Pixelated: {os.path.basename(img_path)}  "
          f"({orig_w}x{orig_h}) -> pixel grid {small_w}x{small_h} -> ({orig_w}x{orig_h})  block={block_size}")

def restore_originals():
    """Restore from backup if you want to try different settings."""
    for fname, _ in TARGETS:
        src = os.path.join(BACKUP_DIR, fname)
        dst = os.path.join(BASE_DIR, fname)
        if os.path.exists(src):
            shutil.copy2(src, dst)
            print(f"  Restored: {fname}")
        else:
            print(f"  No backup for: {fname}")

if __name__ == '__main__':
    import sys

    if "--restore" in sys.argv:
        print("Restoring originals from backup...")
        restore_originals()
        print("Done.")
        sys.exit(0)

    print("Backing up originals (first time only)...")
    backup_originals()

    print(f"\nPixelating with block sizes: { {f: b for f, b in TARGETS} }")
    for fname, block in TARGETS:
        path = os.path.join(BASE_DIR, fname)
        pixelate(path, block)

    print("\nDone! To restore originals: python scripts/pixelate_sprites.py --restore")
    print("To increase pixelation, edit TARGETS block sizes and run again.")

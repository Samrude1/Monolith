import glob, os, shutil
from PIL import Image

base = 'assets/textures/entities'
backup = os.path.join(base, 'originals_backup')

# Copy backups
if os.path.exists(backup):
    for f in glob.glob(os.path.join(backup, '*.png')):
        dest = os.path.join(base, os.path.basename(f))
        shutil.copy(f, dest)

# Resize all to max 128x128
for f in glob.glob(os.path.join(base, '*.png')):
    if 'originals_backup' in f:
        continue
    img = Image.open(f)
    w, h = img.size
    if w > 128 or h > 128:
        scale = min(128.0/w, 128.0/h)
        new_w, new_h = int(w * scale), int(h * scale)
        img = img.resize((new_w, new_h), resample=Image.Resampling.NEAREST)
        img.save(f)
        print(f"Resized {f} to {new_w}x{new_h}")

import sys
import glob
import os
from PIL import Image

def crop_tight(input_path):
    filename = os.path.basename(input_path)
    if filename in ["door.png", "stairs_up.png", "stairs_down.png"]:
        return
        
    try:
        img = Image.open(input_path).convert("RGBA")
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            img.save(input_path, "PNG")
            print(f"Tight cropped: {input_path}")
        else:
            print(f"Empty image: {input_path}")
    except Exception as e:
        print(f"Error: {e} - {input_path}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        for file in glob.glob(sys.argv[1]):
            crop_tight(file)

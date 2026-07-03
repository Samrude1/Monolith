import sys
from PIL import Image

def crop_door(input_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        # Crop out the bottom 150 pixels which contains the floor
        box = (0, 0, 1024, 850)
        img = img.crop(box)
        img = img.resize((1024, 1024), Image.Resampling.LANCZOS)
        img.save(input_path, "PNG")
        print(f"Cropped bottom floor from: {input_path}")
    except Exception as e:
        print(f"Error: {e} - {input_path}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        crop_door(sys.argv[1])

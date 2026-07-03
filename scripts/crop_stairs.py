import sys
from PIL import Image

def crop_image(input_path, output_path, box):
    try:
        img = Image.open(input_path)
        img = img.crop(box)
        img = img.resize((1024, 1024), Image.Resampling.LANCZOS)
        img.save(output_path, "PNG")
        print(f"Cropped and resized to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        # box is left, top, right, bottom
        box = (250, 300, 774, 850)
        crop_image(sys.argv[1], sys.argv[2], box)

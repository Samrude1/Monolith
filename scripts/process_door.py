import sys
from PIL import Image
from rembg import remove

def process_door(input_path, output_path, target_size=(1024, 1024)):
    try:
        # Load image
        img = Image.open(input_path)
        
        # Remove background
        img = remove(img)
        
        # Get bounding box of non-transparent pixels
        bbox = img.getbbox()
        if bbox:
            # Crop to the actual door
            img = img.crop(bbox)
        
        # Resize to exactly 1024x1024 (stretching it to fill the block, fixing narrowness)
        img = img.resize(target_size, Image.Resampling.LANCZOS)
        
        # Save as PNG
        img.save(output_path, "PNG")
        print(f"Processed: {input_path} -> {output_path}")
        
    except Exception as e:
        print(f"Error processing door: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        process_door(sys.argv[1], sys.argv[2])
    else:
        print("Usage: process_door.py <input> <output>")

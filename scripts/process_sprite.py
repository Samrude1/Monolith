import sys
from PIL import Image
from rembg import remove

def process_sprite(input_path, output_path, target_size=(1024, 1024)):
    try:
        # Load image
        img = Image.open(input_path)
        
        # Remove background
        img = remove(img)
        
        # Get bounding box of non-transparent pixels to crop tight first
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
        
        # Calculate aspect ratio preserving thumbnail
        img.thumbnail(target_size, Image.Resampling.LANCZOS)
        
        # Create a transparent 1024x1024 background
        new_img = Image.new("RGBA", target_size, (0, 0, 0, 0))
        
        # Calculate center position (for sprites, anchoring them at bottom might be better, 
        # but the engine scales from center. Let's just center it.)
        paste_pos = (
            (target_size[0] - img.width) // 2,
            (target_size[1] - img.height) // 2
        )
        
        # Paste the resized image onto the center of the transparent canvas
        new_img.paste(img, paste_pos)
        
        # Save as PNG
        new_img.save(output_path, "PNG")
        print(f"Processed sprite: {input_path} -> {output_path}")
        
    except Exception as e:
        print(f"Error processing sprite: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        process_sprite(sys.argv[1], sys.argv[2])
    else:
        print("Usage: process_sprite.py <input> <output>")

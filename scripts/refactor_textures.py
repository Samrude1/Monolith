import os
from pathlib import Path
from PIL import Image
from rembg import remove

def process_image(input_path, output_path, target_size=(1024, 1024)):
    try:
        # Load image
        img = Image.open(input_path)
        
        # Remove background
        img = remove(img)
        
        # Calculate aspect ratio
        img.thumbnail(target_size, Image.Resampling.LANCZOS)
        
        # Create a transparent 1024x1024 background
        new_img = Image.new("RGBA", target_size, (0, 0, 0, 0))
        
        # Calculate center position
        paste_pos = (
            (target_size[0] - img.width) // 2,
            (target_size[1] - img.height) // 2
        )
        
        # Paste the resized image onto the center of the transparent canvas
        new_img.paste(img, paste_pos)
        
        # Save as PNG
        new_img.save(output_path, "PNG")
        print(f"Processed: {input_path.name} -> {output_path.name}")
        
    except Exception as e:
        print(f"Error processing {input_path.name}: {e}")

def main():
    directory = Path(r"d:\Games\Retro_Adventure\assets\textures\entities")
    
    if not directory.exists():
        print(f"Directory not found: {directory}")
        return
        
    for filename in os.listdir(directory):
        if filename.endswith((".png", ".jpg", ".jpeg")):
            input_path = directory / filename
            output_path = directory / f"{input_path.stem}.png"
            
            # Process the image
            process_image(input_path, output_path)
            
            # If the original was a jpg, delete it after creating the png
            if input_path.suffix.lower() in [".jpg", ".jpeg"]:
                try:
                    os.remove(input_path)
                    print(f"Deleted original file: {input_path.name}")
                except OSError as e:
                    print(f"Error deleting {input_path.name}: {e}")

if __name__ == "__main__":
    main()

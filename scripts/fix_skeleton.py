from PIL import Image

def fix_skeleton(img_path, target_size=(128, 128)):
    img = Image.open(img_path).convert("RGBA")
    
    # Get bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        print(f"Cropped to bounding box: {bbox}")

    # Calculate new size preserving aspect ratio
    width, height = img.size
    aspect_ratio = width / height
    
    if width > height:
        new_width = target_size[0]
        new_height = int(new_width / aspect_ratio)
    else:
        new_height = target_size[1]
        new_width = int(new_height * aspect_ratio)
        
    # Resize preserving aspect ratio
    resized = img.resize((new_width, new_height), resample=Image.Resampling.NEAREST)
    
    # Create a new transparent image of target_size
    final_img = Image.new("RGBA", target_size, (255, 255, 255, 0))
    
    # Paste the resized image into the center
    paste_x = (target_size[0] - new_width) // 2
    # Paste it at the bottom so the skeleton stands on the ground
    paste_y = target_size[1] - new_height
    
    final_img.paste(resized, (paste_x, paste_y))
    
    final_img.save(img_path, "PNG")
    print(f"Fixed scaling for {img_path}")

if __name__ == '__main__':
    img_path = r"D:\Games\Retro_Adventure\assets\textures\entities\skeleton.png"
    fix_skeleton(img_path)

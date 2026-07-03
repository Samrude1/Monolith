from PIL import Image

def pixelate_image(img_path, target_size=(64, 64)):
    img = Image.open(img_path)
    
    # Resize down to target_size to get the pixelated look
    # We can just save it as target_size if the game engine expects 64x64 textures
    pixelated = img.resize(target_size, resample=Image.Resampling.NEAREST)
    
    pixelated.save(img_path, "PNG")
    print(f"Pixelated {img_path} to {target_size[0]}x{target_size[1]}")

if __name__ == '__main__':
    img_path = r"D:\Games\Retro_Adventure\assets\textures\entities\stairs_down.png"
    pixelate_image(img_path)

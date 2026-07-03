from PIL import Image

def resize_image(img_path, scale_factor, resample=Image.Resampling.NEAREST):
    img = Image.open(img_path)
    new_size = (int(img.width * scale_factor), int(img.height * scale_factor))
    img = img.resize(new_size, resample=resample)
    img.save(img_path, "PNG")
    print(f"Resized {img_path} by {scale_factor}x to {new_size}")

if __name__ == '__main__':
    base_dir = r"D:\Games\Retro_Adventure\assets\textures\entities"
    
    # Scale up skeleton (it was 128, making it 2.5x larger so it's ~320px tall)
    resize_image(f"{base_dir}\\skeleton.png", 2.5)
    
    # Scale down potion and apple by 10% (multiply by 0.9)
    resize_image(f"{base_dir}\\potion.png", 0.9)
    resize_image(f"{base_dir}\\apple.png", 0.9)

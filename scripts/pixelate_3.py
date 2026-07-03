from PIL import Image

def process_and_pixelate_wide(input_path, output_path, target_size=(128, 128)):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    # Make background transparent
    for item in datas:
        # white color tolerance
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    
    # Get bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        print(f"Cropped to bounding box: {bbox}")

    # Pixelate to target_size (this will stretch it to fill the square, making it wider)
    pixelated = img.resize(target_size, resample=Image.Resampling.NEAREST)
    
    pixelated.save(output_path, "PNG")
    print(f"Processed and pixelated {output_path} to {target_size[0]}x{target_size[1]}")

if __name__ == '__main__':
    input_path = r"C:\Users\samru\.gemini\antigravity-ide\brain\201bcddd-c78f-4ddc-aa72-0214d52ddc1f\media__1783094799983.jpg"
    output_path = r"D:\Games\Retro_Adventure\assets\textures\entities\stairs_down.png"
    process_and_pixelate_wide(input_path, output_path, (128, 128))

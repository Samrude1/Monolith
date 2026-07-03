from PIL import Image

def process_and_pixelate(input_path, output_path, target_size=(128, 128)):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    # Make background transparent
    for item in datas:
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    
    # Pixelate to target_size
    pixelated = img.resize(target_size, resample=Image.Resampling.NEAREST)
    
    pixelated.save(output_path, "PNG")
    print(f"Processed and pixelated {output_path} to {target_size[0]}x{target_size[1]}")

if __name__ == '__main__':
    input_path = r"C:\Users\samru\.gemini\antigravity-ide\brain\201bcddd-c78f-4ddc-aa72-0214d52ddc1f\media__1783094799983.jpg"
    output_path = r"D:\Games\Retro_Adventure\assets\textures\entities\stairs_down.png"
    process_and_pixelate(input_path, output_path, (128, 128))

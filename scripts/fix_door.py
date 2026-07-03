from PIL import Image

def process_door(img_path, threshold=25):
    img = Image.open(img_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # Check if the pixel is black or near-black
        if item[0] <= threshold and item[1] <= threshold and item[2] <= threshold:
            newData.append((0, 0, 0, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    
    # Get bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        print(f"Cropped to bounding box: {bbox}")
        
    img.save(img_path, "PNG")
    print(f"Fixed door image: {img_path}")

if __name__ == "__main__":
    door1 = r"D:\Games\Retro_Adventure\assets\textures\themes\classic\door.png"
    door2 = r"D:\Games\Retro_Adventure\assets\textures\entities\door.png"
    process_door(door1)
    try:
        process_door(door2)
    except Exception as e:
        print("Could not process second door path:", e)

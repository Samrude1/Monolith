from PIL import Image

def remove_black_background(img_path, threshold=15):
    img = Image.open(img_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # If the pixel is very dark (black or near-black) and not already transparent
        if item[0] <= threshold and item[1] <= threshold and item[2] <= threshold and item[3] > 0:
            newData.append((0, 0, 0, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(img_path, "PNG")
    print(f"Removed black regions from {img_path}")

if __name__ == "__main__":
    img_path = r"D:\Games\Retro_Adventure\assets\textures\entities\skeleton.png"
    remove_black_background(img_path, threshold=20)

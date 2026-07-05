from PIL import Image

def process_gold():
    input_path = r"C:\Users\samru\.gemini\antigravity-ide\brain\2bf2cfea-2151-4cf0-888b-a1ed54a4621f\gold_pile_1783182403410.png"
    output_path = r"d:\Games\Retro_Adventure\assets\textures\entities\gold.png"
    
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    # Make background transparent. Assuming solid white background.
    for item in datas:
        # Check if pixel is white-ish
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    
    # Crop to bounding box to remove excess transparent space
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")
    print("Gold pile processed and saved successfully.")

if __name__ == "__main__":
    process_gold()

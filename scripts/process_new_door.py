from PIL import Image

def process_new_door(input_path, output_paths):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    # We expect a solid green background (e.g. high G, low R and B)
    # Let's find the background color by checking the top-left pixel
    bg_color = datas[0]
    
    newData = []
    # If the image isn't perfectly flat-colored, we might need some tolerance
    # But usually AI images with solid background are fairly solid.
    # Let's just remove anything that is very green.
    for item in datas:
        # Check if the pixel is mostly green (G > R and G > B by a margin)
        # Or just use the bg_color distance
        r, g, b, a = item
        if g > 150 and r < 100 and b < 100:
            newData.append((0, 0, 0, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    
    # Get bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        print(f"Cropped to bounding box: {bbox}")
        
    for path in output_paths:
        img.save(path, "PNG")
        print(f"Saved new door to {path}")

if __name__ == "__main__":
    import glob
    import os
    
    # Find the generated image in the brain folder
    brain_dir = r"C:\Users\samru\.gemini\antigravity-ide\brain\201bcddd-c78f-4ddc-aa72-0214d52ddc1f"
    search_pattern = os.path.join(brain_dir, "new_door_*.png")
    files = glob.glob(search_pattern)
    
    if not files:
        print("No generated door image found!")
    else:
        # Get the latest one
        latest_file = max(files, key=os.path.getctime)
        print(f"Processing {latest_file}")
        
        out1 = r"D:\Games\Retro_Adventure\assets\textures\themes\classic\door.png"
        out2 = r"D:\Games\Retro_Adventure\assets\textures\entities\door.png"
        
        process_new_door(latest_file, [out1, out2])

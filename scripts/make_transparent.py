from PIL import Image
import sys

def make_transparent(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    # white color can be not exactly 255, 255, 255
    # tolerance for white
    for item in datas:
        # Check if the pixel is white-ish
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Saved {output_path} with transparent background.")

if __name__ == '__main__':
    input_path = r"C:\Users\samru\.gemini\antigravity-ide\brain\201bcddd-c78f-4ddc-aa72-0214d52ddc1f\media__1783094799983.jpg"
    output_path = r"D:\Games\Retro_Adventure\assets\textures\entities\stairs_down.png"
    make_transparent(input_path, output_path)

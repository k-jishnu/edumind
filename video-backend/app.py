import os
import traceback
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
app = Flask(__name__)
CORS(app)

def generate_real_image(prompt, scene_text, output_path):
    import requests
    import urllib.parse
    import time

    try:
        print("Sending request to Pollinations AI for image generation...")
        
        # Create a highly descriptive prompt for the AI
        full_prompt = f"{prompt}, {scene_text}, high quality educational illustration, realistic, detailed, 16:9"
        encoded_prompt = urllib.parse.quote(full_prompt)
        
        # Use Pollinations AI (free, no key required) with 1280x720 resolution
        url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1280&height=720&nologo=true"
        
        # Add a delay to avoid rate limiting
        time.sleep(1)
        
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0 EduMind'})
        response.raise_for_status()
        
        with open(output_path, 'wb') as f:
            f.write(response.content)
            
        print("Real image saved successfully:", output_path)
        return True

    except Exception as e:
        raise Exception(f"Image generation failed: {e}")


def generate_topic_visual(prompt, scene_text, scene_number, output_path):
    from PIL import Image, ImageDraw, ImageFont

    prompt_lower = prompt.lower()
    img = Image.new('RGB', (1280, 720))
    d = ImageDraw.Draw(img)

    for y in range(720):
        r = int(20 + (y / 720) * 30)
        g = int(30 + (y / 720) * 40)
        b = int(50 + (y / 720) * 70)
        d.line([(0, y), (1280, y)], fill=(r, g, b))

    try:
        font_title = ImageFont.truetype("arial.ttf", 60)
        font_text = ImageFont.truetype("arial.ttf", 40)
        font_small = ImageFont.truetype("arial.ttf", 30)
    except IOError:
        font_title = ImageFont.load_default()
        font_text = ImageFont.load_default()
        font_small = ImageFont.load_default()

    d.rectangle([(40, 40), (280, 110)], fill=(50, 100, 200))
    d.text((60, 50), f"Scene {scene_number}", fill=(255, 255, 255), font=font_title)

    if "tower of hanoi" in prompt_lower or "hanoi" in prompt_lower:
        d.text((310, 45), "|  Tower of Hanoi", fill=(200, 200, 255), font=font_title)
        d.rectangle([(100, 600), (1180, 640)], fill=(120, 80, 40))

        rod_x_positions = [300, 640, 980]
        labels = ["Source", "Auxiliary", "Destination"]

        for i, rx in enumerate(rod_x_positions):
            d.rectangle([(rx - 10, 250), (rx + 10, 600)], fill=(200, 200, 200))
            d.text((rx - 60, 660), labels[i], fill=(255, 255, 255), font=font_text)

        colors = [(255, 100, 100), (100, 255, 100), (100, 100, 255), (255, 255, 100)]
        widths = [200, 160, 120, 80]

        disk_count = max(1, 5 - scene_number)
        base_y = 560

        for i in range(disk_count):
            w = widths[i]
            rx = rod_x_positions[0]
            d.rectangle(
                [(rx - w / 2, base_y - 40), (rx + w / 2, base_y)],
                fill=colors[i],
                outline=(0, 0, 0),
                width=3
            )
            base_y -= 45

        if scene_number > 1:
            d.line([(300, 200), (980, 200)], fill=(255, 200, 50), width=5)
            d.polygon([(980, 200), (960, 180), (960, 220)], fill=(255, 200, 50))

    elif "photosynthesis" in prompt_lower:
        d.text((310, 45), "|  Photosynthesis", fill=(200, 200, 255), font=font_title)

        d.ellipse([(100, 150), (250, 300)], fill=(255, 220, 50))

        for r_x, r_y in [(175, 120), (175, 330), (70, 225), (280, 225), (100, 150), (250, 300)]:
            d.line([(r_x - 20, r_y - 20), (r_x + 20, r_y + 20)], fill=(255, 220, 50), width=5)

        d.rectangle([(400, 600), (900, 700)], fill=(100, 70, 40))
        d.line([(650, 600), (650, 300)], fill=(50, 200, 50), width=20)
        d.ellipse([(550, 400), (650, 450)], fill=(30, 220, 30))
        d.ellipse([(650, 350), (750, 400)], fill=(30, 220, 30))

        d.text((450, 630), "H2O (Water)", fill=(150, 200, 255), font=font_text)
        d.line([(250, 250), (550, 380)], fill=(255, 255, 100), width=4)
        d.text((320, 300), "Light Energy", fill=(255, 255, 100), font=font_small)

        d.line([(900, 250), (700, 380)], fill=(200, 200, 255), width=4)
        d.polygon([(700, 380), (720, 360), (730, 380)], fill=(200, 200, 255))
        d.text((850, 200), "CO2", fill=(200, 200, 255), font=font_text)

        d.line([(600, 420), (400, 300)], fill=(255, 100, 100), width=4)
        d.polygon([(400, 300), (420, 320), (410, 300)], fill=(255, 100, 100))
        d.text((330, 250), "O2", fill=(255, 100, 100), font=font_text)

        d.text((700, 500), "Glucose", fill=(255, 255, 255), font=font_text)

    elif "python list" in prompt_lower or "list" in prompt_lower:
        d.text((310, 45), "|  Python List", fill=(200, 200, 255), font=font_title)

        box_w, box_h = 150, 150
        start_x, start_y = 200, 350
        values = ['"apple"', '42', '3.14', 'True', '[1, 2]']

        d.text((start_x, start_y - 80), "my_list =", fill=(255, 255, 150), font=font_title)

        for i in range(5):
            bx = start_x + i * box_w
            d.rectangle(
                [(bx, start_y), (bx + box_w, start_y + box_h)],
                outline=(100, 200, 255),
                width=5,
                fill=(40, 50, 80)
            )
            d.text((bx + 20, start_y + 50), values[i], fill=(255, 255, 255), font=font_text)
            d.text((bx + 60, start_y + box_h + 20), str(i), fill=(150, 150, 150), font=font_title)

        if scene_number >= 2:
            d.line(
                [(start_x + box_w + 75, start_y + box_h + 120),
                 (start_x + box_w + 75, start_y + box_h + 20)],
                fill=(255, 100, 100),
                width=5
            )
            d.polygon(
                [(start_x + box_w + 75, start_y + box_h + 20),
                 (start_x + box_w + 60, start_y + box_h + 40),
                 (start_x + box_w + 90, start_y + box_h + 40)],
                fill=(255, 100, 100)
            )
            d.text(
                (start_x + box_w + 100, start_y + box_h + 100),
                "my_list[1] -> 42",
                fill=(255, 100, 100),
                font=font_title
            )

    else:
        d.text((310, 45), f"|  {prompt[:40].title()}", fill=(200, 200, 255), font=font_title)
        d.ellipse([(440, 250), (840, 450)], fill=(60, 80, 120), outline=(150, 150, 255), width=5)
        d.text((540, 330), "Main Concept", fill=(255, 255, 255), font=font_title)

        centers = [(200, 550), (640, 600), (1080, 550)]

        for i, (cx, cy) in enumerate(centers):
            d.rectangle(
                [(cx - 150, cy - 60), (cx + 150, cy + 60)],
                fill=(40, 60, 90),
                outline=(100, 255, 100),
                width=3
            )
            d.text((cx - 80, cy - 20), f"Detail {i + 1}", fill=(220, 220, 220), font=font_text)
            d.line([(cx, cy - 60), (640, 450)], fill=(200, 200, 200), width=3)

    d.text((1080, 660), "EduMind", fill=(150, 150, 200), font=font_text)
    d.line([(1080, 705), (1240, 705)], fill=(100, 150, 255), width=3)

    d.text(
        (60, 150),
        scene_text[:100] + ("..." if len(scene_text) > 100 else ""),
        fill=(255, 200, 100),
        font=font_small
    )

    img.save(output_path)



CORS(app)

OUTPUTS_DIR = os.path.join(os.path.dirname(__file__), 'outputs')
TEMP_DIR = os.path.join(os.path.dirname(__file__), 'temp')

os.makedirs(OUTPUTS_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")
HF_TOKEN = os.getenv("HF_TOKEN")


@app.route("/", methods=["GET"])
def home():
    return {
        "message": "EduMind Video Backend is running",
        "usage": "Send POST request to /generate with JSON { 'prompt': 'your text' }"
    }


@app.route("/test", methods=["GET"])
def test():
    return "Backend is working properly."


@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.get_json()

        if not data:
            return {"error": "No data provided"}, 400

        if 'prompt' not in data:
            return {"error": "Prompt is required"}, 400

        print("Received request:", data)
        prompt = data['prompt']

        print(f"Progress: received prompt: {prompt}")
        print("Progress: generating scenes...")
        print("Progress: generating images...")
        print("Progress: generating audio...")
        print("Progress: creating video with ffmpeg/moviepy...")

        IMAGES_DIR = os.path.join(TEMP_DIR, 'images')
        AUDIO_DIR = os.path.join(TEMP_DIR, 'audio')

        os.makedirs(IMAGES_DIR, exist_ok=True)
        os.makedirs(AUDIO_DIR, exist_ok=True)

        generated_images = []
        generated_audio = []

        import google.generativeai as genai
        from gtts import gTTS
        from PIL import Image
        import re

        try:
            sys_prompt = f"""You are a teacher creating a short educational video narration.

Explain the topic in a way that can be spoken in about 20 seconds.

Topic: {prompt}

Rules:

* Write 80 to 120 words
* Use simple and clear English
* Explain what it is, how it works, and key idea
* Sound like a teacher explaining to a student
* Do NOT say 'Scene 1', 'Core concept', or any template text
* Do NOT be too short
* Do NOT exceed 120 words
* Make it natural spoken narration

Example style:
The Tower of Hanoi is a classic puzzle where disks are moved between rods following simple rules. Only one disk can be moved at a time, and a larger disk cannot be placed on a smaller one. The goal is to move all disks from one rod to another, using a third rod as a helper. This problem teaches recursion and step-by-step thinking.

Now generate for the given topic."""
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-2.5-flash")
            response = model.generate_content(sys_prompt)

            if not response.text:
                raise ValueError("Empty response from Gemini")

            full_text = response.text.strip()

        except Exception as e:
            print("Gemini generation failed, falling back manually:", e)
            full_text = f"Today we will explore {prompt}. It is a very fascinating and important topic in its respective field. We will cover its definition, its underlying process, and its impact on the world around us. Let's delve deep to learn more about the details and core mechanics of {prompt}."

        print(f"Progress: generated narration: {full_text[:100]}...")

        sentences = re.split(r'(?<=[.!?]) +', full_text)
        scenes = []

        if len(sentences) >= 4:
            chunk_size = len(sentences) // 4
            for i in range(4):
                start = i * chunk_size
                end = (i + 1) * chunk_size if i < 3 else len(sentences)
                scenes.append(" ".join(sentences[start:end]))
        else:
            scenes = [
                f"Introduction to {prompt}",
                f"Details of {prompt}",
                f"Mechanics of {prompt}",
                f"Summary of {prompt}"
            ]

        try:
            tts = gTTS(text=full_text, lang='en')
            audio_path = os.path.join(AUDIO_DIR, 'narration.mp3')
            tts.save(audio_path)
            generated_audio.append(audio_path)

        except Exception as e:
            traceback.print_exc()
            return jsonify({
                "error": "Video generation failed",
                "details": f"gTTS failed: {str(e)}"
            }), 500

        print("HF_TOKEN LOADED:", bool(HF_TOKEN))

        import concurrent.futures

        def generate_scene_image(idx, scene):
            image_filename = f"scene_{idx + 1}.png"
            image_path = os.path.join(IMAGES_DIR, image_filename)
            success = False
            
            print(f"Sending request to Pollinations AI for scene {idx + 1}...")
            
            try:
                generate_real_image(prompt, scene, image_path)
                success = True
            except Exception as e:
                print(f"Pollinations AI image generation failed: {e}")
                
            if not success:
                print("Using fallback image because Pollinations AI failed.")
                try:
                    generate_topic_visual(prompt, scene, idx + 1, image_path)
                except Exception as e:
                    print(f"Failed to create fallback image: {e}")
                    traceback.print_exc()
                    return None
            return image_path

        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            futures = [executor.submit(generate_scene_image, idx, scene) for idx, scene in enumerate(scenes)]
            
            for future in concurrent.futures.as_completed(futures):
                img_path = future.result()
                if img_path is None:
                    return jsonify({
                        "error": "Video generation failed",
                        "details": "Image generation and fallback both failed"
                    }), 500
                    
        # Maintain order of images
        for idx in range(len(scenes)):
            generated_images.append(os.path.join(IMAGES_DIR, f"scene_{idx + 1}.png"))

        for img_path in generated_images:
            if not os.path.exists(img_path):
                return jsonify({
                    "error": "Video generation failed",
                    "details": f"Image missing: {img_path}"
                }), 500

            sz = os.path.getsize(img_path)

            if sz == 0:
                return jsonify({
                    "error": "Video generation failed",
                    "details": f"Image empty: {img_path}"
                }), 500

            try:
                with Image.open(img_path) as PIL_img:
                    temp_img = PIL_img.convert("RGB")
                    temp_img = temp_img.resized((1280, 720))
                    temp_img.save(img_path, format="PNG")
                    mode = temp_img.mode
                    dims = temp_img.size

            except Exception:
                return jsonify({
                    "error": "Video generation failed",
                    "details": f"PIL could not open image: {img_path}"
                }), 500

            print(f"Logs: image paths: {img_path}")
            print(f"Logs: image sizes: {sz}")
            print(f"Logs: image mode: {mode}")
            print(f"Logs: image dimensions: {dims}")

        for aud_path in generated_audio:
            if not os.path.exists(aud_path):
                return jsonify({
                    "error": "Video generation failed",
                    "details": f"Audio missing: {aud_path}"
                }), 500

            sz = os.path.getsize(aud_path)

            if sz == 0:
                return jsonify({
                    "error": "Video generation failed",
                    "details": f"Audio empty: {aud_path}"
                }), 500

            print(f"Verified audio: {aud_path} Size: {sz} bytes")

        print(f"Logs: found {len(generated_images)} images.")

        image_paths = generated_images
        print(f"Logs: image_paths list: {image_paths}")

        if generated_audio:
            print(f"Logs: audio file path: {generated_audio[0]}")
        else:
            print("Logs: no audio file path.")

        output_file_name = "generated_video.mp4"
        output_path = os.path.join(OUTPUTS_DIR, output_file_name)

        try:
            from moviepy import ImageClip, AudioFileClip, concatenate_videoclips

            print("Progress: building final video clip...")

            if not image_paths:
                return jsonify({
                    "error": "Video generation failed",
                    "details": "No images available for video."
                }), 400

            audio_path = generated_audio[0] if generated_audio else None

            if audio_path:
                audio_clip = AudioFileClip(audio_path)
                audio_duration = audio_clip.duration
            else:
                audio_duration = 20.0

            print(f"Logs: audio duration: {audio_duration}")

            scene_duration = audio_duration / len(image_paths)
            print(f"Logs: scene duration: {scene_duration}")

            clips = []

            for image_path in image_paths:
                clip = ImageClip(image_path).with_duration(scene_duration)
                clips.append(clip)

            print(f"Logs: number of clips: {len(clips)}")

            final_clip = concatenate_videoclips(clips, method="compose")

            if audio_path:
                final_clip = final_clip.with_audio(AudioFileClip(audio_path))

            print(f"Logs: final video duration: {final_clip.duration if hasattr(final_clip, 'duration') else audio_duration} seconds")

            final_clip.write_videofile(
                output_path,
                fps=24,
                codec="libx264",
                audio_codec="aac",
                temp_audiofile=os.path.join(TEMP_DIR, "temp-audio.m4a"),
                remove_temp=True
            )

        except Exception as e:
            print("MoviePy generation failed with exception:")
            traceback.print_exc()
            return jsonify({
                "error": "Video generation failed",
                "details": str(e)
            }), 500

        print(f"Progress: final output path: {output_path}")

        if not os.path.exists(output_path):
            return jsonify({
                "error": "Video generation failed",
                "details": "output file is missing"
            }), 500

        file_size = os.path.getsize(output_path)
        print(f"Logs: final file size: {file_size} bytes")

        if file_size == 0:
            return jsonify({
                "error": "Video generation failed",
                "details": "output file is empty 0 bytes"
            }), 500

        return send_file(output_path, mimetype='video/mp4', as_attachment=False)

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500


if __name__ == '__main__':
    import os

    port = int(os.environ.get("PORT", 5000))

    app.run(
        host='0.0.0.0',
        port=port
    )
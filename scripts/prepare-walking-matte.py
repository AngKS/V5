"""Build the walking clip's colour + silhouette MP4 for transparent compositing.

Run with Python (numpy, scipy, Pillow) and ffmpeg installed:
    python3 scripts/prepare-walking-matte.py
The right half stores a grayscale alpha matte; the left half retains the video.
Keeping both in one H.264 frame synchronizes them during forward/backward seeks
and avoids browser-specific transparent-video codec support.
"""
from pathlib import Path
import subprocess
import numpy as np
from scipy import ndimage as ndi
from PIL import Image

root = Path(__file__).resolve().parents[1]
folder = root / "public/video"
width, height = 1280, 720
decoder = subprocess.Popen([
    "ffmpeg", "-v", "error", "-i", str(folder / "kah-shin-walking.mp4"),
    "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1"
], stdout=subprocess.PIPE)
encoder = subprocess.Popen([
    "ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
    "-s", f"{width * 2}x{height}", "-r", "30", "-i", "pipe:0",
    "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-g", "1",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    str(folder / "kah-shin-walking-matted.mp4")
], stdin=subprocess.PIPE)
checks = []
frame = 0
while True:
    raw = decoder.stdout.read(width * height * 3)
    if not raw:
        break
    if len(raw) != width * height * 3:
        raise RuntimeError("Incomplete decoded frame")
    rgb = np.frombuffer(raw, dtype=np.uint8).reshape(height, width, 3)
    low = rgb.min(axis=2)
    saturation = rgb.max(axis=2).astype(float) - low
    foreground = (low < 215) | (saturation > 30)
    # Reject the neutral floor shadow, including the patch touching the shoes.
    foreground[650:] &= (low[650:] < 160) | (saturation[650:] > 22)
    foreground[:, :400] = False
    foreground[:, 900:] = False
    labels, _ = ndi.label(foreground)
    sizes = np.bincount(labels.ravel())
    sizes[0] = 0
    silhouette = ndi.binary_fill_holes(labels == sizes.argmax())
    silhouette = ndi.binary_closing(silhouette, iterations=1)
    # Recover the narrow light sole without retaining the floor shadow.
    expanded = ndi.binary_dilation(silhouette, iterations=2)
    silhouette[650:] = expanded[650:]
    alpha = np.clip(ndi.gaussian_filter(silhouette.astype(float), 0.5), 0, 1)
    matte = np.repeat((alpha * 255).astype(np.uint8)[:, :, None], 3, axis=2)
    encoder.stdin.write(np.concatenate((rgb, matte), axis=1).tobytes())
    if frame == 0:
        Image.fromarray(np.dstack((rgb, matte[:, :, 0]))).save(folder / "kah-shin-walking-cutout.png")
    if frame % 30 == 0:
        background = np.zeros_like(rgb) + [187, 213, 227]
        composite = (rgb * alpha[:, :, None] + background * (1-alpha[:, :, None])).astype(np.uint8)
        checks.append(Image.fromarray(composite).resize((384,216)))
    frame += 1
encoder.stdin.close()
if decoder.wait() or encoder.wait():
    raise RuntimeError("ffmpeg failed")
sheet = Image.new("RGB", (1536,432))
for i, check in enumerate(checks):
    sheet.paste(check, ((i%4)*384, (i//4)*216))
sheet.save('/tmp/v5-walking-matte-check.jpg')
print(f"Prepared {frame} frames and a transparent poster.")

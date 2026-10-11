"""Bake the curtain-parting reveal into an alpha layer for hyperframes/compositions/reveal.html.

The restored opening (1008x1600, 30 fps) is scaled to cover the hero's 9:16
frame (1008x1792). Its alpha opens a soft vertical gap from the centre seam
as the drapes part, wider at the floor where they pool outward, until the
couple video underneath fills the frame. The bow untying stays fully opaque.

usage: python build_reveal.py work/opening_restored hyperframes/assets/curtain_alpha.webm
"""
import glob, os, subprocess, sys, tempfile
import cv2
import numpy as np

W, H, FPS = 1008, 1792, 30
T0, T1 = 1.25, 3.5  # parting starts / the couple fills the frame (seconds)


def ss(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def couple_weight(t):
    p = ss(t, T0, T1)
    x = np.abs(np.linspace(-1, 1, W))[None, :]  # 0 at the seam, 1 at the edges
    y = np.linspace(0, 1, H)[:, None]
    half = -0.15 + 1.55 * p * (0.85 + 0.3 * y)  # half-width of the gap
    feather = 0.24 + 0.2 * (1 - p)
    return ss(half - x, -feather / 2, feather / 2) * ss(t, T0, T0 + 0.6)


def main(src, out):
    frames = sorted(glob.glob(os.path.join(src, "f_*.png")))
    sw = round(1008 * H / 1600)  # width once 1008x1600 is scaled to 1792 tall
    x0 = (sw - W) // 2
    with tempfile.TemporaryDirectory() as tmp:
        for i, f in enumerate(frames):
            bgr = cv2.resize(cv2.imread(f), (sw, H), interpolation=cv2.INTER_CUBIC)[:, x0:x0 + W]
            a = (1 - couple_weight(i / FPS)) * 255
            cv2.imwrite(f"{tmp}/a_{i:04d}.png", np.dstack([bgr, a.round().astype(np.uint8)]))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", f"{tmp}/a_%04d.png",
                        "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-crf", "10", "-b:v", "0",
                        "-auto-alt-ref", "0", out], check=True)


if __name__ == "__main__":
    main(*sys.argv[1:3])

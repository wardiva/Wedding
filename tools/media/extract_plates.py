"""Build clean background plates and clips from the reference recording.

The reference is a 504x804 screen recording of the invitation. Every frame
carries recording artefacts (the screen recorder's touch dot, the page's own
music / scroll buttons and, in places, falling petals and text cards). This
script removes those and upscales the result so the frames can serve as the
site's placeholder media until final photography/video is supplied.

usage: python extract_plates.py <reference.mp4> <work_dir> [--stills-model EDSR_x2.pb] [--video-model FSRCNN_x2.pb]
"""
import argparse, os, subprocess
import numpy as np
import cv2

W, H = 504, 804

# Recording artefacts (reference pixel coordinates)
TOUCH_DOT = ((238, 538), 19)
MUSIC_BTN = ((44, 765), 30)
SCROLL_BTN = ((251, 728), 38)
SCROLL_PILL = ((176, 763), (326, 795))
VENUE_CARD = ((-40, 30), (544, 386), 30)  # band under the venue glass card (full width, so no side edges)


def read_frames(src, start, dur=None, count=None):
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{start}", "-i", src]
    if dur is not None:
        cmd += ["-t", f"{dur}"]
    if count is not None:
        cmd += ["-frames:v", str(count)]
    cmd += ["-f", "rawvideo", "-pix_fmt", "bgr24", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).copy()


def artefact_mask(scroll_button=False, touch_dot=True):
    m = np.zeros((H, W), np.uint8)
    cv2.circle(m, *MUSIC_BTN, 255, -1)
    if touch_dot:
        cv2.circle(m, *TOUCH_DOT, 255, -1)
    if scroll_button:
        cv2.circle(m, *SCROLL_BTN, 255, -1)
        cv2.rectangle(m, *SCROLL_PILL, 255, -1)
    return m


def rounded_rect_mask(p0, p1, r, feather=8):
    m = np.zeros((H, W), np.float32)
    (x0, y0), (x1, y1) = p0, p1
    cv2.rectangle(m, (x0 + r, y0), (x1 - r, y1), 1, -1)
    cv2.rectangle(m, (x0, y0 + r), (x1, y1 - r), 1, -1)
    for cx, cy in [(x0 + r, y0 + r), (x1 - r, y0 + r), (x0 + r, y1 - r), (x1 - r, y1 - r)]:
        cv2.circle(m, (cx, cy), r, 1, -1)
    return cv2.GaussianBlur(m, (0, 0), feather)[..., None]


def patch_fill(img, center, r, prev=None, feather=5):
    """Fill a disc with texture copied from the best-matching nearby offset.

    Each candidate offset is scored by how well the ring just outside the disc
    matches the ring around the source position; the winner's pixels are
    feathered in. Keeping the previous offset when it is nearly as good stops
    the fill from flickering between frames."""
    cx, cy = center
    h, w = img.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
    ring = (d > r) & (d < r + 9)
    ys, xs = np.nonzero(ring)
    f = img.astype(np.float32)
    best, best_score = None, 1e18
    scores = {}
    for dy in range(-72, 73, 6):
        for dx in range(-72, 73, 6):
            if dx * dx + dy * dy < (2.2 * r) ** 2:
                continue
            sy, sx = ys + dy, xs + dx
            if sy.min() < 0 or sx.min() < 0 or sy.max() >= h or sx.max() >= w:
                continue
            sc = np.mean((f[ys, xs] - f[sy, sx]) ** 2)
            scores[(dx, dy)] = sc
            if sc < best_score:
                best, best_score = (dx, dy), sc
    if prev in scores and scores[prev] <= best_score * 1.15:
        best = prev
    dx, dy = best
    alpha = np.clip((r + feather - d) / feather, 0, 1)[..., None]
    shifted = np.roll(np.roll(f, -dy, axis=0), -dx, axis=1)
    out = f * (1 - alpha) + shifted * alpha
    return out.astype(np.uint8), best


def clean_artefacts(frames, spots):
    """Patch-fill each (center, radius) spot through a frame sequence."""
    prevs = [None] * len(spots)
    out = []
    for fr in frames:
        for k, (c, r) in enumerate(spots):
            fr, prevs[k] = patch_fill(fr, c, r, prevs[k])
        out.append(fr)
    return out


def match_colour(img, target, region):
    """In place: per-channel mean/std transfer so `img` matches `target` over a
    region both show uncovered (keeps contrast, unlike a least-squares fit)."""
    for c in range(3):
        a, b = img[region][..., c], target[region][..., c]
        k = b.std() / max(a.std(), 1e-3)
        img[..., c] = (img[..., c] - a.mean()) * k + b.mean()


def make_sr(model_path):
    sr = cv2.dnn_superres.DnnSuperResImpl_create()
    base = os.path.basename(model_path)
    sr.readModel(model_path)
    sr.setModel(base.split("_")[0].lower(), int(base.split("_x")[1][0]))
    return sr


def remove_petals(frames, k=7, passes=2):
    """Falling petals move much faster than the slow walking shot, so a short
    temporal median gives a petal-free estimate; only pixels that deviate
    (bright / pale-green blobs) are replaced by it."""
    f = frames.astype(np.float32)
    n = len(f)
    for _ in range(passes):
        out = f.copy()
        for i in range(n):
            a, b = max(0, i - k), min(n, i + k + 1)
            med = np.median(f[a:b], axis=0)
            diff = f[i] - med
            lum = diff.mean(axis=2)
            col = np.abs(diff).max(axis=2)
            m = ((lum > 18) | (col > 45)).astype(np.uint8)
            m = cv2.dilate(m, np.ones((5, 5), np.uint8))
            m = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 1.5)[..., None]
            out[i] = f[i] * (1 - m) + med * m
        f = out
    return np.clip(f, 0, 255).astype(np.uint8)


def write_pngs(frames, outdir, sr, mask=None, post=None):
    os.makedirs(outdir, exist_ok=True)
    for i, fr in enumerate(frames):
        if mask is not None:
            fr = cv2.inpaint(fr, mask, 7, cv2.INPAINT_TELEA)
        if post is not None:
            fr = post(fr)
        cv2.imwrite(f"{outdir}/f_{i:04d}.png", sr.upsample(fr))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("work")
    ap.add_argument("--stills-model", required=True)
    ap.add_argument("--video-model", required=True)
    ap.add_argument("--only", nargs="*", default=None)
    a = ap.parse_args()
    os.makedirs(a.work, exist_ok=True)
    vsr, ssr = make_sr(a.video_model), make_sr(a.stills_model)
    want = lambda k: a.only is None or k in a.only

    # 1. Curtain opening: bow unties, drapes part, venue revealed (1.65s -> 6.35s)
    if want("opening"):
        fr = read_frames(a.src, 1.65, dur=4.7)
        fr = clean_artefacts(fr, [TOUCH_DOT, MUSIC_BTN])
        write_pngs(fr, f"{a.work}/opening", vsr)
        print("opening frames:", len(fr))

    # 2. Stills
    def finish_plate(plate, name):
        """Remove the recorded music + scroll buttons, upscale, save."""
        plate = clean_artefacts([np.clip(plate, 0, 255).astype(np.uint8)], [MUSIC_BTN])[0]
        m = np.zeros((H, W), np.uint8)
        cv2.circle(m, *SCROLL_BTN, 255, -1)
        cv2.rectangle(m, *SCROLL_PILL, 255, -1)
        plate = cv2.inpaint(plate, m, 9, cv2.INPAINT_TELEA)
        cv2.imwrite(f"{a.work}/{name}.png", ssr.upsample(plate))
        print("still", name, flush=True)

    # 2. Section backdrops
    if want("tent-light"):
        # Light tent (behind the invitation, families and countdown). No single
        # frame is clean: at 9.5s the invitation text has scrolled above y≈185
        # and the families card hasn't appeared; the countdown at 15.0s has a
        # clean top band. Colour-match the top band and feather the seam.
        low = read_frames(a.src, 9.5, count=1)[0].astype(np.float32)
        top = read_frames(a.src, 15.0, count=1)[0].astype(np.float32)
        match_colour(top, low, (slice(560, 690), slice(0, 160)))
        wgt = np.clip((np.arange(H, dtype=np.float32) - 182) / 12, 0, 1)[:, None, None]
        finish_plate(top * (1 - wgt) + low * wgt, "tent-light")
    if want("floral-tent"):
        # Floral tent (letter + closing). The letter card fades in while the
        # section is still sliding up, so stitch rows from earlier slide frames
        # (shifted back by their measured offset) where the card hasn't appeared,
        # colour-matched to the settled frame on the uncovered left edge.
        settled = read_frames(a.src, 11.80, count=1)[0].astype(np.float32)
        ui = np.zeros((H, W), np.uint8)
        cv2.circle(ui, *SCROLL_BTN, 255, -1)
        cv2.rectangle(ui, *SCROLL_PILL, 255, -1)
        cv2.circle(ui, *MUSIC_BTN, 255, -1)
        # 11.533s is 169px short of settled; the UI is fixed to the screen,
        # so remove it before shifting the frame back into place.
        dy, seam = 169, 515
        early = cv2.inpaint(read_frames(a.src, 11.533, count=1)[0], ui, 9, cv2.INPAINT_TELEA).astype(np.float32)
        src = np.zeros_like(early)
        src[: H - dy] = early[dy:]
        match_colour(src, settled, (slice(20, seam), slice(0, 20)))
        wgt = np.clip((seam + 8 - np.arange(H, dtype=np.float32)) / 16, 0, 1)[:, None, None]
        plate = settled * (1 - wgt) + src * wgt
        finish_plate(plate, "floral-tent")

    # 3. Venue walk: petals removed, card area softened, buttons removed
    if want("venue"):
        fr = read_frames(a.src, 18.62, dur=5.43)
        fr = remove_petals(fr)
        card = rounded_rect_mask(*VENUE_CARD, feather=14)
        def soften_card(img):
            blur = cv2.GaussianBlur(img, (0, 0), 14).astype(np.float32)
            return (img * (1 - card) + blur * card).astype(np.uint8)
        write_pngs(fr, f"{a.work}/venue", vsr, artefact_mask(scroll_button=True, touch_dot=False), soften_card)
        print("venue frames:", len(fr))

    # 4. Portrait + illustrations (crops, upscaled)
    if want("crops"):
        couple = read_frames(a.src, 26.8, count=1)[0][200:636, 88:414]
        cv2.imwrite(f"{a.work}/couple-portrait.png", ssr.upsample(ssr.upsample(couple)))
        fam = read_frames(a.src, 10.8, count=1)[0]
        cv2.imwrite(f"{a.work}/groom-src.png", ssr.upsample(ssr.upsample(fam[312:496, 96:196])))
        cv2.imwrite(f"{a.work}/bride-src.png", ssr.upsample(ssr.upsample(fam[312:496, 296:420])))
        print("crops done")


if __name__ == "__main__":
    main()

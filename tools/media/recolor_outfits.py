"""Dress the walking couple in the venue clip in the reference outfits.

Groom: cream sherwani -> deep navy suit. Bride: ivory/gold lehenga and veil ->
pale ice-blue / mint-sage with silvery embroidery. The venue, lighting, motion
and the couple's hair/skin are untouched. Colour targets were measured from
the reference photos (navy Lab ≈ 9/3/-10, lehenga ≈ 64-68/-3..-8/-1) and nudged
for the venue's warm light.

Inputs
  frames/  f_0001.png …  source frames (1008x1600)
  alpha/   a_0001.png …  person alpha per frame, made with
           npx hyperframes remove-background venue.mp4 -o people.mov
           ffmpeg -i people.mov -vf alphaextract alpha/a_%04d.png

usage: python recolor_outfits.py <frames> <alpha> <out_dir> [--preview 1,82,162] [--debug dir]
"""
import argparse
import glob
import os

import cv2
import numpy as np

# ---- look (OpenCV float Lab: L 0..100) --------------------------------------
NAVY = np.array([13.0, 2.5, -13.0])   # deep navy suit under warm light
ICE_AB = np.array([-5.5, -1.0])       # pale ice-blue / mint-sage lehenga
GROOM_SHADE_GAMMA = 0.85              # <1 compresses the backlit shoulders
BRIDE_DARKEN = 0.95                   # pale blue-grey reads a touch darker than ivory
TEXTURE_KEEP = 0.25                   # fraction of original chroma variation kept


def load(path, flag=cv2.IMREAD_COLOR):
    im = cv2.imread(path, flag)
    if im is None:
        raise FileNotFoundError(path)
    return im


# ---- separating groom (left) from bride (right) ------------------------------
def runs(row):
    """Start/end indices of consecutive True runs in a 1-D bool array."""
    d = np.diff(np.concatenate([[0], row.astype(np.int8), [0]]))
    return np.flatnonzero(d == 1), np.flatnonzero(d == -1)


def _gap_mid(row):
    """Middle of the gap just left of the widest run after the first one.
    Her veil is the widest run; his arm can show as a separate narrow run."""
    s, e = runs(row)
    keep = (e - s) >= 6
    s, e = s[keep], e[keep]
    if len(s) < 2:
        return np.nan
    j = 1 + int(np.argmax((e - s)[1:]))
    return (e[j - 1] + s[j]) / 2.0


def texture_map(gray):
    """Local standard deviation: high on the embroidered gown, low on the suit."""
    g = gray.astype(np.float32)
    m = cv2.blur(g, (9, 9))
    v = cv2.blur(g * g, (9, 9)) - m * m
    return np.sqrt(np.clip(v, 0, None))


def split_curve(person, gray):
    """Per row, the x separating him (left) from her (right).

    Rows showing a gap split in its middle. Above the first gap row the split
    stays vertical (his head). Below the joined hands the boundary follows
    where his smooth suit meets her textured gown, as a continuous path.
    Returns (xs, top, (hand_row, body_width)); xs is NaN where he isn't."""
    h, w = person.shape
    xs = np.full(h, np.nan)
    rows = np.flatnonzero(person.any(1))
    if not len(rows):
        return xs, None, None
    left_edge = np.full(h, np.nan)
    for y in rows:
        s, e = runs(person[y])
        keep = (e - s) >= 6
        if keep.any():
            left_edge[y] = s[keep][0]
        xs[y] = _gap_mid(person[y])
    good = np.flatnonzero(~np.isnan(xs))
    if len(good) < 20:
        return np.full(h, np.nan), None, None
    # the continuous block of gap rows starting at the top is his torso
    blocks = np.split(good, np.flatnonzero(np.diff(good) > 25) + 1)
    torso = blocks[0] if len(blocks[0]) >= 15 else max(blocks, key=len)
    top, hand = torso.min(), torso.max()
    gaps = xs.copy()
    xs[:] = np.nan
    span = np.arange(top, hand + 1)
    xs[span] = np.interp(span, torso, gaps[torso])
    xs[rows.min():top] = xs[top]
    body_w = float(np.nanmedian(xs[torso] - left_edge[torso]))

    bottom = rows.max()
    if bottom > hand + 2:
        tex = cv2.GaussianBlur(texture_map(gray), (0, 0), 2.0)
        ys = np.arange(hand + 1, bottom + 1)
        win = 22
        cs = np.cumsum(np.pad(tex, ((0, 0), (1, 0))), axis=1)
        x = np.arange(w)
        lo, hi = np.clip(x - win, 0, w), np.clip(x + win, 0, w)
        score = np.zeros((len(ys), w), np.float32)
        for k, y in enumerate(ys):
            right = (cs[y, hi] - cs[y, x]) / np.maximum(hi - x, 1)
            left = (cs[y, x] - cs[y, lo]) / np.maximum(x - lo, 1)
            sc = right - left
            le = left_edge[y] if not np.isnan(left_edge[y]) else 0
            sc[(x < le + 0.55 * body_w) | (x > le + 1.2 * body_w) | ~person[y]] = -1e3
            score[k] = sc
        # dynamic programming, at most 2 px sideways per row
        acc = np.full_like(score, -1e6)
        back = np.zeros(score.shape, np.int16)
        x0 = int(round(xs[hand]))
        acc[0, max(0, x0 - 25):x0 + 26] = score[0, max(0, x0 - 25):x0 + 26]
        for k in range(1, len(ys)):
            stack = np.stack([np.roll(acc[k - 1], d) for d in (-2, -1, 0, 1, 2)])
            stack[:, :2] = -1e6
            stack[:, -2:] = -1e6
            arg = np.argmax(stack, 0)
            acc[k] = stack[arg, x] + score[k]
            back[k] = arg - 2
        path = np.zeros(len(ys), int)
        path[-1] = int(np.argmax(acc[-1]))
        for k in range(len(ys) - 1, 0, -1):
            path[k - 1] = path[k] - back[k, path[k]]
        xs[ys] = path
        # below his feet her gown spreads out left of where his legs were
        legs = slice(hand + 1, hand + 1 + max(10, int(0.5 * (bottom - hand))))
        leg_edge = np.nanmedian(left_edge[legs])
        out = np.flatnonzero(left_edge[hand + 1:] < leg_edge - 0.3 * body_w)
        if len(out):
            xs[hand + 1 + out[0]:] = np.nan
    return xs, top, (hand, body_w)


def groom_from_split(person, xs, top, gray, lower):
    h, w = person.shape
    lim = np.where(np.isnan(xs), -1, xs)[:, None]
    m = (np.arange(w)[None, :] < lim) & person
    if lower is not None:
        hand, _ = lower
        # below the hands keep his smooth suit, not her busy gown
        tex = cv2.GaussianBlur(texture_map(gray), (0, 0), 4)
        smooth = (tex < 8.0).astype(np.uint8)
        smooth = cv2.morphologyEx(smooth, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
        smooth = cv2.morphologyEx(smooth, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
        core = m & smooth.astype(bool)
        # grow back to his outline (edges read as texture) and take his shoes
        grown = cv2.dilate(core.astype(np.uint8), np.ones((21, 21), np.uint8)).astype(bool)
        near = cv2.dilate(core.astype(np.uint8), np.ones((45, 45), np.uint8)).astype(bool)
        keep = (grown | ((gray < 60) & near)) & m
        # from the knees down legs run straight: each row may extend ~1 px
        # beyond the row above, so the mask can't spill into her hem
        rows = np.flatnonzero(keep.any(1))
        if len(rows):
            knee = hand + int(0.55 * (rows.max() - hand))
            for y in range(knee + 1, h):
                above = cv2.dilate(keep[y - 1].astype(np.uint8)[None, :], np.ones((1, 3), np.uint8))[0]
                keep[y] &= above.astype(bool)
        m[hand:] = keep[hand:]
    n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8))
    if n > 1:
        m = lab == 1 + np.argmax(st[1:, 4])
    return m


def bride_body(mask):
    """Her gown and veil: the large connected shapes only (not his stray hand)."""
    n, lab, st, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8))
    if n <= 1:
        return mask.astype(np.float32)
    keep = np.zeros(n, bool)
    keep[1:] = st[1:, 4] > 0.05 * st[1:, 4].max()
    return cv2.dilate(keep[lab].astype(np.float32), np.ones((5, 5), np.uint8))


def skin_zones(groom, shape):
    """1 = keep original: his head/neck and the joined hands. Under the warm
    light skin and cream fabric share a colour, so these go by position."""
    h, w = shape
    keep = np.zeros(shape, np.float32)
    rows = np.flatnonzero(groom.any(1))
    if len(rows) < 40:
        return keep
    top, bot = rows.min(), rows.max()
    width = groom.sum(1).astype(float)
    head_w = np.median(width[top:top + max(8, (bot - top) // 14)])
    below = np.flatnonzero(width[top:] > 1.7 * head_w)
    shoulder = top + (below[0] if len(below) else (bot - top) // 8)
    yy = np.arange(h, dtype=np.float32)[:, None]
    keep = np.maximum(keep, np.clip((shoulder - 4 - yy) / 8.0, 0, 1) * np.ones((1, w), np.float32))
    band = slice(shoulder + (bot - shoulder) // 5, shoulder + (bot - shoulder) // 2)
    right = np.array([np.flatnonzero(r).max() if r.any() else -1 for r in groom[band]])
    if (right > 0).any():
        k = int(np.argmax(right))
        hy, hx, r = band.start + k, right[k], 0.022 * h
        gx, gy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
        d = np.hypot(gx - (hx + 0.4 * r), gy - hy)
        keep = np.maximum(keep, np.clip((r * 1.6 - d) / (r * 0.6), 0, 1))
    return keep


def grow_like(core, bgr, gray, reach=18, passes=3):
    """Extend a mask into adjacent pixels that look like its interior
    (close in Lab to the interior's median, and smooth)."""
    lab = to_lab(bgr)
    inner = cv2.erode(core.astype(np.uint8), np.ones((9, 9), np.uint8)).astype(bool)
    if inner.sum() < 200:
        return core.astype(np.float32)
    ref = np.median(lab[inner], 0)
    dist = np.sqrt(((lab - ref) * np.array([0.5, 1.0, 1.0])) ** 2).sum(-1)
    like = (dist < 9.0) & (cv2.GaussianBlur(texture_map(gray), (0, 0), 3) < 9.0)
    m = core.copy()
    for _ in range(passes):
        band = cv2.dilate(m.astype(np.uint8), np.ones((reach // passes * 2 + 1,) * 2, np.uint8)).astype(bool)
        m = m | (band & like)
    m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8)).astype(bool)
    return m.astype(np.float32)


def flow_warp(mask, src_gray, dst_gray):
    """Carry a mask from one frame to the next with dense optical flow."""
    flow = cv2.calcOpticalFlowFarneback(dst_gray, src_gray, None, 0.5, 4, 31, 5, 7, 1.5, 0)
    h, w = mask.shape
    gx, gy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    return cv2.remap(mask.astype(np.float32), gx + flow[..., 0], gy + flow[..., 1],
                     cv2.INTER_LINEAR, borderValue=0)


# ---- colour --------------------------------------------------------------------
def to_lab(bgr):
    return cv2.cvtColor(bgr.astype(np.float32) / 255.0, cv2.COLOR_BGR2LAB)


def from_lab(lab):
    out = cv2.cvtColor(lab.astype(np.float32), cv2.COLOR_LAB2BGR)
    return np.clip(out * 255.0 + 0.5, 0, 255).astype(np.uint8)


def fabric_weight(lab):
    """1 for fabric, falling to 0 for dark hair and shoes."""
    return np.clip((lab[..., 0] - 30.0) / 16.0, 0, 1)


def wmean(x, w):
    return float(np.average(x, weights=w + 1e-6)) if w.sum() > 50 else float(x.mean())


def recolour_groom(lab, w):
    L = lab[..., 0]
    ref = wmean(L, w) if w.sum() > 50 else 60.0
    shade = np.clip(L / max(ref, 1e-3), 0.3, 1.6) ** GROOM_SHADE_GAMMA
    out = lab.copy()
    out[..., 0] = NAVY[0] * shade + np.clip(L - ref - 15.0, 0, None) * 0.10  # faint sheen
    out[..., 1] = NAVY[1] + (lab[..., 1] - wmean(lab[..., 1], w)) * 0.12
    out[..., 2] = NAVY[2] + (lab[..., 2] - wmean(lab[..., 2], w)) * 0.12
    return out


def recolour_bride(lab, w):
    L = lab[..., 0]
    out = lab.copy()
    silver = np.clip((L - 88.0) / 8.0, 0, 1)              # sparkle -> silver
    tint = (1.0 - 0.65 * silver) * np.clip(L / 75.0, 0.35, 1.0)  # soft on sheer veil
    out[..., 0] = L * BRIDE_DARKEN
    # keep a little texture, but not the warm gold cast of the embroidery
    da = np.clip(lab[..., 1] - wmean(lab[..., 1], w), -20, 4)
    db = np.clip(lab[..., 2] - wmean(lab[..., 2], w), -20, 4)
    out[..., 1] = ICE_AB[0] * tint + da * TEXTURE_KEEP
    out[..., 2] = ICE_AB[1] * tint + db * TEXTURE_KEEP
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("frames")
    ap.add_argument("alpha")
    ap.add_argument("out")
    ap.add_argument("--preview", help="comma-separated 1-based frames to render only")
    ap.add_argument("--debug")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    fpaths = sorted(glob.glob(f"{a.frames}/f_*.png"))
    apaths = sorted(glob.glob(f"{a.alpha}/a_*.png"))
    assert len(fpaths) == len(apaths) > 0, (len(fpaths), len(apaths))
    n = len(fpaths)
    frames = [load(p) for p in fpaths]
    alphas = [load(p, cv2.IMREAD_GRAYSCALE).astype(np.float32) / 255.0 for p in apaths]
    grays = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]

    # 1. split him from her in every frame
    groom, areas = [None] * n, np.zeros(n)
    for i in range(n):
        person = alphas[i] > 0.5
        xs, top, lower = split_curve(person, grays[i])
        if top is not None:
            groom[i] = groom_from_split(person, xs, top, grays[i], lower)
            areas[i] = groom[i].sum()
    ok = areas > 0.75 * np.median(areas[areas > 0])
    print(f"groom mask ok in {ok.sum()}/{n} frames; propagating the rest", flush=True)

    # 2. frames where the segmenter lost his body: carry the nearest good mask
    gsoft = [g.astype(np.float32) if g is not None else None for g in groom]
    good = np.flatnonzero(ok)
    for i in np.flatnonzero(~ok):
        j = good[np.argmin(np.abs(good - i))]
        cur, src, step = gsoft[j], j, (1 if i > j else -1)
        for k in range(j + step, i + step, step):
            cur, src = flow_warp(cur, grays[src], grays[k]), k
        # chained warps blur and drift; re-threshold, then grow into the
        # neighbouring pixels that match his suit (colour + smoothness)
        gsoft[i] = grow_like(cur > 0.45, frames[i], grays[i])
        alphas[i] = np.maximum(alphas[i], gsoft[i])

    # 3. light temporal smoothing (motion is ~1-2 px/frame)
    def smooth(seq):
        return [0.5 * seq[i] + 0.25 * seq[max(i - 1, 0)] + 0.25 * seq[min(i + 1, n - 1)] for i in range(n)]
    gsoft, alphas_s = smooth(gsoft), smooth(alphas)

    only = {int(x) - 1 for x in a.preview.split(",")} if a.preview else None
    for i in range(n):
        if only is not None and i not in only:
            continue
        lab = to_lab(frames[i])
        fab = fabric_weight(lab)
        g = np.minimum(gsoft[i], alphas_s[i])
        b = np.clip(alphas_s[i] - g, 0, 1)
        b *= bride_body(b > 0.5)
        skin = skin_zones(g > 0.5, g.shape)
        g = cv2.GaussianBlur(g, (0, 0), 1.2)
        b = cv2.GaussianBlur(b, (0, 0), 1.2)
        wg = (g * fab * (1 - skin))[..., None]
        # her gown has no dark fabric, only darker gold embroidery: tint it all
        # (the sheer veil's own alpha already carries how much is background)
        fab_b = np.clip((lab[..., 0] - 10.0) / 12.0, 0, 1)
        wb = (b * fab_b * (1 - skin))[..., None]
        out = lab * (1 - wg) + recolour_groom(lab, wg[..., 0]) * wg
        out = out * (1 - wb) + recolour_bride(lab, wb[..., 0]) * wb
        cv2.imwrite(f"{a.out}/f_{i + 1:04d}.png", from_lab(out))
        if a.debug:
            os.makedirs(a.debug, exist_ok=True)
            vis = frames[i].copy()
            vis[..., 2] = np.clip(vis[..., 2] + 120 * wg[..., 0], 0, 255)
            vis[..., 0] = np.clip(vis[..., 0] + 120 * wb[..., 0], 0, 255)
            cv2.imwrite(f"{a.debug}/masks_{i + 1:04d}.png", vis)
    print("wrote frames to", a.out, flush=True)


if __name__ == "__main__":
    main()

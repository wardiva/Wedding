"""Restore the curtain-opening frames with Real-ESRGAN (SRVGGNetCompact).

Each cleaned 1008x1608 frame is reduced to the recording's 504x804, upscaled
4x, supersampled back to 1008x1608 and cropped to the site's 1008x1600.

usage: python restore_opening.py work/opening_clean work/opening_restored \
         --model realesr-general-x4v3.pth --wdn realesr-general-wdn-x4v3.pth
weights: github.com/xinntao/Real-ESRGAN/releases (v0.2.5.0); pip install torch opencv-python-headless
"""
import argparse, os, glob, cv2, numpy as np, torch, torch.nn as nn, torch.nn.functional as F
class SRVGGNetCompact(nn.Module):
    def __init__(s, nf=64, nc=32, up=4):
        super().__init__(); s.up=up
        b=[nn.Conv2d(3,nf,3,1,1), nn.PReLU(nf)]
        for _ in range(nc): b += [nn.Conv2d(nf,nf,3,1,1), nn.PReLU(nf)]
        b += [nn.Conv2d(nf,3*up*up,3,1,1)]
        s.body=nn.ModuleList(b); s.ps=nn.PixelShuffle(up)
    def forward(s,x):
        o=x
        for m in s.body: o=m(o)
        return s.ps(o)+F.interpolate(x,scale_factor=s.up,mode='nearest')
def load(path, wdn=None, strength=1.0):
    net=SRVGGNetCompact(); sd=torch.load(path,map_location='cpu'); sd=sd.get('params',sd.get('params_ema',sd))
    if wdn is not None and strength<1:  # denoise-strength blend, as in Real-ESRGAN
        sd2=torch.load(wdn,map_location='cpu'); sd2=sd2.get('params',sd2.get('params_ema',sd2))
        sd={k:strength*sd[k]+(1-strength)*sd2[k] for k in sd}
    net.load_state_dict(sd,strict=True); net.eval(); return net
torch.set_num_threads(4)
def run(net, bgr):
    x=torch.from_numpy(cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB).astype(np.float32)/255).permute(2,0,1)[None]
    with torch.no_grad(): y=net(x)[0].clamp(0,1).permute(1,2,0).numpy()
    return cv2.cvtColor((y*255+0.5).astype(np.uint8),cv2.COLOR_RGB2BGR)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("src"); ap.add_argument("out")
    ap.add_argument("--model", required=True); ap.add_argument("--wdn", required=True)
    ap.add_argument("--strength", type=float, default=0.8)  # 1 = full denoise
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    net = load(a.model, a.wdn, a.strength)
    for f in sorted(glob.glob(f"{a.src}/f_*.png")):
        o = os.path.join(a.out, os.path.basename(f))
        if os.path.exists(o):
            continue
        lo = cv2.resize(cv2.imread(f), (504, 804), interpolation=cv2.INTER_AREA)
        hi = cv2.resize(run(net, lo), (1008, 1608), interpolation=cv2.INTER_AREA)[8:1608]
        cv2.imwrite(o, hi)

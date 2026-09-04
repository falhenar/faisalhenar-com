"""Recolour the Sirimangalo prostration plates into the practice palette.

The plates are crops from the sheets Sirimangalo supplied, so the linework
and every posture must survive untouched. This only remaps colour: each
source colour is expressed as a blend of the two nearest source anchors,
and the same blend is rebuilt from the matching target anchors. Anti
aliased edges stay smooth and nothing moves by a pixel.

Usage:  python3 tools/figures/recolor_plates.py [--dry outdir]
"""
import sys, os, glob
from PIL import Image
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PLATES = os.path.join(HERE, '..', '..', 'practice', 'images', 'prostration')

# source anchor -> practice palette target
PAIRS = [
    ((0xDC, 0xE3, 0xEA), (0xE4, 0xE5, 0xDB)),  # panel ground -> paper, a shade down
    ((0xFF, 0xFF, 0xFF), (0xFA, 0xFA, 0xF5)),  # inset boxes  -> near white
    ((0xFE, 0xE4, 0xC5), (0xF0, 0xE8, 0xD6)),  # skin         -> warm pale
    ((0x78, 0xBB, 0xC2), (0x93, 0xA0, 0x88)),  # teal         -> light moss
    ((0x0E, 0x39, 0x66), (0x2B, 0x2B, 0x27)),  # navy         -> ink
]
SRC = np.array([p[0] for p in PAIRS], float)
DST = np.array([p[1] for p in PAIRS], float)

def remap(rgb):
    """rgb: (n,3) float -> recoloured (n,3) float"""
    d = np.linalg.norm(rgb[:, None, :] - SRC[None, :, :], axis=2)
    order = np.argsort(d, axis=1)
    i, j = order[:, 0], order[:, 1]
    a, b = SRC[i], SRC[j]
    ab = b - a
    denom = (ab * ab).sum(1)
    denom[denom == 0] = 1.0
    t = (((rgb - a) * ab).sum(1) / denom).clip(0, 1)[:, None]
    return DST[i] + t * (DST[j] - DST[i])

def convert(src, dst):
    im = Image.open(src).convert('RGB')
    a = np.asarray(im).astype(float).reshape(-1, 3)
    out = remap(a).round().clip(0, 255).astype(np.uint8).reshape(im.height, im.width, 3)
    o = Image.fromarray(out, 'RGB').quantize(colors=64, method=Image.MEDIANCUT)
    o.save(dst, optimize=True)

if __name__ == '__main__':
    outdir = None
    if len(sys.argv) > 2 and sys.argv[1] == '--dry':
        outdir = sys.argv[2]
        os.makedirs(outdir, exist_ok=True)
    files = sorted(glob.glob(os.path.join(PLATES, 'kneel-*.png'))) + \
            sorted(glob.glob(os.path.join(PLATES, 'step-*.png')))
    for f in files:
        dst = os.path.join(outdir, os.path.basename(f)) if outdir else f
        convert(f, dst)
        print(os.path.basename(f), os.path.getsize(dst))

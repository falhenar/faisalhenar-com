"""Set every plate in the same place inside its frame.

The plates were cut from panels where the figure sits wherever the sheet's
layout put it: some hard left, some right, some higher on the ground line than
others. With the pale panel behind them that was invisible, because the eye
read the panel edge as the frame. On the transparent line versions there is no
edge, so the drawings look randomly placed in their row.

This translates each drawing inside its own viewBox so that it is centred
horizontally and stands on a common baseline. It moves the whole drawing as one
piece: nothing is scaled, rotated or redrawn, so every posture is untouched.

Usage:  python3 tools/figures/place_plates.py [--dry]
"""
import glob, os, re, subprocess, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
PLATES = os.path.join(HERE, '..', '..', 'practice', 'images', 'prostration')
W, H = 352, 294          # the box the plates are drawn in, in CSS pixels
BASELINE = 274           # where the ground line sits, measured from the top
UNIT = 3.0               # viewBox units per CSS pixel (1056 / 352)

def measure(svg):
    """ink box, plus the ground line's own extent where the plate has one"""
    png = '/tmp/place-%s.png' % os.path.basename(svg)[:-4]
    subprocess.run(['rsvg-convert', '-w', str(W), '-h', str(H), '-o', png, svg], check=True)
    a = np.asarray(Image.open(png).convert('RGBA'))[:, :, 3] > 10
    ys, xs = np.where(a)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    band = a[max(0, y1 - 5):y1 + 1]
    cols = np.where(band.any(0))[0]
    runs = np.split(cols, np.where(np.diff(cols) > 3)[0] + 1)
    g = max(runs, key=len)
    return x0, x1, y0, y1, g[0], g[-1]

def place(svg, dry=False):
    s = open(svg).read()
    s = re.sub(r'<g class="place"[^>]*>\n?|</g><!--place-->\n?', '', s)  # idempotent
    x0, x1, y0, y1, g0, g1 = measure(svg)
    # Centre on the ground line where an inset box hangs off to one side, so the
    # standing figure lines up down the row rather than the whole composition.
    # Where the ground line runs the full width of the drawing the two are the
    # same measurement anyway.
    cx = (g0 + g1) / 2 if (g1 - g0) < 0.85 * (x1 - x0) else (x0 + x1) / 2
    dx = W / 2 - cx
    dx = min(max(dx, -x0), W - 1 - x1)     # never push content out of the frame
    dy = (BASELINE - y1)
    dx, dy = dx * UNIT, dy * UNIT
    if abs(dx) < 0.5 and abs(dy) < 0.5:
        return 0, 0
    body = re.search(r'(<svg[^>]*>)(.*)(</svg>)', s, re.S)
    head, inner, tail = body.groups()
    s = '%s\n<g class="place" transform="translate(%.1f,%.1f)">%s</g><!--place-->\n%s' % (
        head, dx, dy, inner, tail)
    if not dry:
        open(svg, 'w').write(s)
    return round(dx / UNIT, 1), round(dy / UNIT, 1)

if __name__ == '__main__':
    dry = '--dry' in sys.argv
    for f in sorted(glob.glob(os.path.join(PLATES, '*.svg'))):
        dx, dy = place(f, dry)
        print('%-10s dx %6s  dy %6s' % (os.path.basename(f)[:-4], dx, dy))

"""Build the 41 prostration plates from FH's own redrawn plates.

FH redrew the whole Sirimangalo sequence in October 2026 (kneeling A and B,
then positions 1 to 39). His files are the sources; they are large, so they
stay outside the repository, in `C:\\Dev\\faisalhenar.com\\Prostration redraws`
as `prostration-redrawn-A.png`, `-B.png`, `-01.png` ... `-39.png`.

Each drawing is used exactly as drawn. This only:
  - turns the paper transparent and sets the line in the site's ink, with the
    same level curve as proc.py (alpha from darkness, white above 236 gone);
  - scales every plate by ONE shared factor, so the plates keep the sizes they
    have relative to each other;
  - centres each drawing in the plate frame and stands it on a common
    baseline, as place_plates.py did for the earlier set, so a row of plates
    reads evenly.
Nothing is redrawn, cropped out, rotated or scaled per plate.

Output: practice/images/prostration/kneel-a.png, kneel-b.png, step-01.png ...
at 1056 x 882 (three times the 352 x 294 frame the pages use).

Usage:  python3 tools/figures/build-prostration-plates.py "<redraws folder>"
"""
import os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'practice', 'images', 'prostration')
W, H = 1056, 882          # 3 x the 352 x 294 frame
BASELINE = 822            # 3 x 274, where every drawing stands
TOP = 18                  # keep this much clear above the tallest drawing
SIDE = 12
INK = (0x2B, 0x2B, 0x27)  # the practice room's ink
LEVELS = 16

# A plate drawn in a lighter grey than the rest can have its tone deepened
# here: each line pixel's darkness against the paper is multiplied by the
# factor, the paper stays clear, nothing moves and no line changes width.
# Empty since FH redrew plates 1 and 2 darker (19 Oct 2026).
TONE = {}

NAMES = [('A', 'kneel-a'), ('B', 'kneel-b')] + [('%02d' % i, 'step-%02d' % i) for i in range(1, 40)]

def alpha_of(path, tone=1.0):
    im = Image.open(path).convert('RGBA')
    bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
    bg.alpha_composite(im)
    a = np.asarray(bg.convert('L')).astype(np.float32)
    al = (np.clip((236.0 - a) / (236.0 - 40.0), 0, 1) * 255).astype(np.uint8)
    if tone != 1.0:
        # darker, but only where there was already line: the paper stays clear
        paper = float(np.median(a))
        dark = np.clip(paper - (paper - a) * tone, 0, 255)
        toned = (np.clip((236.0 - dark) / (236.0 - 40.0), 0, 1) * 255).astype(np.uint8)
        al = np.where(al > 0, toned, 0).astype(np.uint8)
    l, t, r, b = Image.fromarray(al).getbbox()
    return Image.fromarray(al).crop((l, t, r, b))

def main(src):
    alphas = [(out, alpha_of(os.path.join(src, 'prostration-redrawn-%s.png' % n), TONE.get(n, 1.0))) for n, out in NAMES]
    f = min(min((BASELINE - TOP) / a.height, (W - 2 * SIDE) / a.width) for _, a in alphas)
    print('shared scale %.4f' % f)
    for out, a in alphas:
        a = a.resize((round(a.width * f), round(a.height * f)), Image.LANCZOS)
        canvas = Image.new('L', (W, H), 0)
        canvas.paste(a, ((W - a.width) // 2, BASELINE - a.height))
        # Saved as a 16-entry palette: one ink colour at 16 levels of opacity.
        # Line art loses nothing visible, and each file is a third the size.
        idx = np.round(np.asarray(canvas) / 255.0 * (LEVELS - 1)).astype(np.uint8)
        p = Image.fromarray(idx, 'P')
        p.putpalette(list(INK) * LEVELS)
        trns = bytes(round(i * 255 / (LEVELS - 1)) for i in range(LEVELS))
        dst = os.path.join(OUT, out + '.png')
        p.save(dst, optimize=True, transparency=trns)
        print('%-8s %4dx%-4d %6d bytes' % (out, a.width, a.height, os.path.getsize(dst)))

if __name__ == '__main__':
    main(sys.argv[1])

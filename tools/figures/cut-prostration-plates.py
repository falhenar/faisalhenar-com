# -*- coding: utf-8 -*-
"""Cut the three Sirimangalo prostration sheets into one image per position.

Input:  sources/prostration-sheet-1.jpg  (kneeling A and B, positions 1 to 12)
        sources/prostration-sheet-2.jpg  (13 to 27)
        sources/prostration-sheet-3.jpg  (28 to 39)
Output: practice/images/prostration/kneel-a.png, kneel-b.png, step-01.png ...

The panels sit on a pale blue ground on white, which is what finds them: the
ground is the mask, each connected region is one panel. The English caption
under each panel is outside the ground and so is left behind, which is the
point: the noting word is set as HTML text on the page instead, so one set of
images serves both the English and the Dutch page. Panels on sheet 2 also
carry a dark frame; strip_frame drops it so the set looks uniform. Nothing
inside the drawing is touched.

Run from this directory:  python3 cut-prostration-plates.py
"""
from PIL import Image
import numpy as np
from scipy import ndimage
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'sources')
OUT = os.path.join(HERE, '..', '..', 'practice', 'images', 'prostration')

ORDER = {'prostration-sheet-1.jpg': ['a', 'b'] + [str(i) for i in range(1, 13)],
         'prostration-sheet-2.jpg': [str(i) for i in range(13, 28)],
         'prostration-sheet-3.jpg': [str(i) for i in range(28, 40)]}


def panels(path):
    """Bounding boxes of the pale blue panel grounds, in reading order."""
    a = np.asarray(Image.open(path).convert('RGB')).astype(int)
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    mask = (b - r > 10) & (r > 140) & (r < 238) & (b < 248)
    mask = ndimage.binary_fill_holes(ndimage.binary_closing(mask, np.ones((7, 7), bool)))
    lab, _ = ndimage.label(mask)
    out = []
    for sl in ndimage.find_objects(lab):
        y, x = sl
        if x.stop - x.start > 150 and y.stop - y.start > 120:
            out.append((x.start, y.start, x.stop, y.stop))
    out.sort(key=lambda t: (round(t[1] / 50), t[0]))
    return out


def strip_frame(img, look=12, thresh=120):
    """Crop just inside the panel's own dark frame, where it has one."""
    a = np.asarray(img.convert('L')).astype(float)
    H, W = a.shape

    def edge(lines):
        last = None
        for i, v in enumerate(lines):
            if v < thresh:
                last = i
        return last

    t = edge([a[i, :].mean() for i in range(min(look, H // 4))])
    b = edge([a[H - 1 - i, :].mean() for i in range(min(look, H // 4))])
    l = edge([a[:, i].mean() for i in range(min(look, W // 4))])
    r = edge([a[:, W - 1 - i].mean() for i in range(min(look, W // 4))])
    return img.crop((0 if l is None else l + 1,
                     0 if t is None else t + 1,
                     W if r is None else W - r - 1,
                     H if b is None else H - b - 1))


def main():
    raw = {}
    for f, names in ORDER.items():
        im = Image.open(os.path.join(SRC, f)).convert('RGB')
        boxes = panels(os.path.join(SRC, f))
        assert len(boxes) == len(names), (f, len(boxes), len(names))
        for box, n in zip(boxes, names):
            raw[n] = strip_frame(im.crop(box))

    # One cell size for every numbered plate, so the page grid is even. The
    # padding takes each panel's own ground colour, so it does not show.
    num = [k for k in raw if k not in ('a', 'b')]
    W = max(raw[k].width for k in num)
    H = max(raw[k].height for k in num)
    os.makedirs(OUT, exist_ok=True)
    for n, img in raw.items():
        if n in ('a', 'b'):
            out = img
        else:
            out = Image.new('RGB', (W, H), img.getpixel((2, 2)))
            out.paste(img, ((W - img.width) // 2, (H - img.height) // 2))
        name = 'kneel-%s' % n if n in ('a', 'b') else 'step-%02d' % int(n)
        out.quantize(colors=64, method=Image.MEDIANCUT).save(
            os.path.join(OUT, name + '.png'), optimize=True)
    print('%d plates written to %s' % (len(raw), os.path.normpath(OUT)))


if __name__ == '__main__':
    main()

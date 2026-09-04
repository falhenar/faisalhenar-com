"""Turn a Sirimangalo plate into site-style line art.

Colour is discarded; the drawing is kept exactly. Every dark region of the
plate is either a line already (thin, kept as is) or a filled shape (thick,
reduced to its own outline), so the result is single-weight black line on
transparency with not one contour moved.
"""
import numpy as np, cv2, os, subprocess, tempfile
from PIL import Image
from skimage.morphology import skeletonize

SCALE = 3          # work above native resolution so the ring is smooth
RING  = 5          # width of the outline taken around a filled shape
SOLID = 11         # dark shapes thinner than this are lines already
WEIGHT = 2         # the one line weight every stroke ends up at, in worked pixels

def drop_number(dark):
    """Remove Sirimangalo's baked-in plate number from the top left corner.

    Only small marks wholly inside that corner go; the inset detail boxes are
    far too large to qualify."""
    h, w = dark.shape
    n, lab, stats, _ = cv2.connectedComponentsWithStats(dark, 8)
    for i in range(1, n):
        x, y, bw, bh, area = stats[i]
        if (x < 0.25 * w and y < 0.28 * h
                and bw < 0.10 * w and bh < 0.12 * h and area < 0.005 * w * h):
            dark[lab == i] = 0
    return dark


def lines(path, scale=SCALE, ring=RING, solid=SOLID, keep_number=False):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(float)
    lum = a @ [0.299, 0.587, 0.114]
    dark = (lum < 120).astype(np.uint8)
    if not keep_number:
        dark = drop_number(dark)
    big = cv2.resize(dark * 255, (im.width * scale, im.height * scale),
                     interpolation=cv2.INTER_CUBIC)
    big = (big > 127).astype(np.uint8)
    dt = cv2.distanceTransform(big, cv2.DIST_L2, 5)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * ring + 1, 2 * ring + 1))
    outline = cv2.subtract(big, cv2.erode(big, k))     # fills -> their own edge
    thin = (big & (dt <= solid).astype(np.uint8))      # already a line -> keep
    mask = (outline | thin).astype(bool)
    # The source drew its own lines at several widths, and the outlines above
    # come out at yet another. Reduce every stroke to its centre line, then give
    # them all the same weight, so the drawing reads as one hand.
    core = skeletonize(mask)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * WEIGHT + 1, 2 * WEIGHT + 1))
    even = cv2.dilate(core.astype(np.uint8), k)
    return (even * 255).astype(np.uint8)

def vectorise(mask, out_svg):
    """potrace the mask so the curves come out smooth rather than stair stepped."""
    with tempfile.NamedTemporaryFile(suffix='.pbm', delete=False) as t:
        Image.fromarray(255 - mask).convert('1').save(t.name)
        subprocess.run(['potrace', '-s', '-a', '1.0', '-O', '0.4', '-u', '10',
                        '--flat', '-o', out_svg, t.name], check=True)
    os.unlink(t.name)

def render(svg, png, size):
    subprocess.run(['rsvg-convert', '-w', str(size), '-h', str(size),
                    '-o', png, svg], check=True)

if __name__ == '__main__':
    import sys, glob
    os.makedirs('out', exist_ok=True); os.makedirs('svg', exist_ok=True)
    for f in sorted(glob.glob('src/*.png')):
        n = os.path.basename(f)[:-4]
        m = lines(f)
        vectorise(m, 'svg/%s.svg' % n)
        print(n, os.path.getsize('svg/%s.svg' % n))

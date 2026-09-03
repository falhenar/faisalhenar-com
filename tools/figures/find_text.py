from PIL import Image
import numpy as np, sys
from scipy import ndimage

def boxes(src):
    im = Image.open(src).convert('L')
    a = np.asarray(im)
    mask = a < 180
    # dilate horizontally to join letters into words/lines
    st = np.ones((9, 45), bool)
    d = ndimage.binary_dilation(mask, st)
    lab, n = ndimage.label(d)
    out = []
    for sl in ndimage.find_objects(lab):
        y, x = sl
        h = y.stop-y.start; w = x.stop-x.start
        px = mask[sl].sum()
        out.append((x.start, y.start, x.stop, y.stop, w, h, px))
    out.sort(key=lambda t: -(t[4]*t[5]))
    return out

if __name__=="__main__":
  for b in boxes(sys.argv[1]):
      print(b)

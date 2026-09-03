from PIL import Image
import numpy as np, sys

def process(src, dst, margin=12):
    im = Image.open(src).convert('L')
    a = np.asarray(im).astype(np.float32)
    alpha = np.clip((236.0 - a) / (236.0 - 40.0), 0, 1) * 255.0
    alpha = alpha.astype(np.uint8)
    ink = np.zeros_like(alpha)
    out = Image.fromarray(np.dstack([ink, alpha]), 'LA')
    bbox = Image.fromarray(alpha).getbbox()
    l, t, r, b = bbox
    l = max(0, l-margin); t = max(0, t-margin)
    r = min(out.width, r+margin); b = min(out.height, b+margin)
    out = out.crop((l, t, r, b))
    out.save(dst)
    return out.size

if __name__ == '__main__':
    print(process(sys.argv[1], sys.argv[2]))

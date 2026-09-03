from PIL import Image, ImageDraw, ImageFont
import numpy as np
import os
HERE=os.path.dirname(os.path.abspath(__file__))
FONT=os.path.join(HERE,'PatrickHand-Regular.ttf')

def tight_box(im, rect):
    a=np.asarray(im.convert('L').crop(rect))
    ys,xs=np.where(a<180)
    l,t,r,b=rect
    return (l+xs.min(), t+ys.min(), l+xs.max()+1, t+ys.min()+ (ys.max()-ys.min()+1))

def fit_by_height(en, h):
    best=None
    for s in range(12,140):
        f=ImageFont.truetype(FONT,s)
        bb=f.getbbox(en); hh=bb[3]-bb[1]
        if best is None or abs(hh-h)<best[0]: best=(abs(hh-h),s)
    return best[1]

def draw_caption(im, orig, spec):
    d=ImageDraw.Draw(im)
    rect=spec['clear']
    box=tight_box(orig, rect)
    l,t,r,b=box
    size=spec.get('size') or fit_by_height(spec['en'], b-t)
    maxw=spec.get('maxw',10**6)
    while True:
        f=ImageFont.truetype(FONT,size)
        bb=f.getbbox(spec['nl']); w=bb[2]-bb[0]
        if w<=maxw or size<12: break
        size-=1
    d.rectangle(rect, fill=(255,255,255))
    h=bb[3]-bb[1]
    y=(t+b)/2 - h/2 - bb[1]
    if 'lx' in spec: x=spec['lx']-bb[0]
    elif 'cx' in spec: x=spec['cx'] - w/2 - bb[0]
    else: x=(l+r)/2 - w/2 - bb[0]
    d.text((x,y), spec['nl'], font=f, fill=(0,0,0))
    return size, box, w

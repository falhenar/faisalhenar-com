from PIL import Image
from nl import draw_caption
import proc

S = {
 'pros-floor': [
   dict(clear=(500,60,1150,158), en='about 10 cm apart', nl='ongeveer 10 cm uit elkaar', maxw=750),
   dict(clear=(500,985,1150,1080), en='thumb tips touching', nl='duimtoppen tegen elkaar', maxw=750),
   dict(clear=(1305,520,1712,592), en='the forehead', nl='het voorhoofd', lx=1315, maxw=390),
   dict(clear=(1305,592,1712,675), en='comes down here', nl='komt hier neer', lx=1315, maxw=390),
 ],
 'sit-posture': [
   # Redrawn 2026-10-19 (sources/sit-posture.png); labels sit right of the figure.
   dict(clear=(930,620,1080,684), en='rising', nl='rijzen', maxw=180, size=56, cx=1000),
   dict(clear=(930,878,1095,955), en='falling', nl='vallen', maxw=180, size=56, cx=1000),
 ],
 'walk-stand': [
   # Redrawn 2026-10-19 (sources/walk-stand.png). The label sits at the right
   # edge, so the translation is right-aligned and grows to the left.
   dict(clear=(600,1400,975,1462), en='about 2 m ahead', nl='ongeveer 2 m vooruit', maxw=560, rx=957),
 ],
 'walk-feet': [
   dict(clear=(60,900,800,1010), en='side by side, almost touching', nl='naast elkaar, bijna rakend', maxw=780),
   dict(clear=(900,900,1650,1000), en='heel level with the other toes', nl='hiel gelijk met de andere tenen', maxw=780),
 ],
 'walk-path': [
   dict(clear=(40,775,380,875), en='3 to 5 m', nl='3 tot 5 m', maxw=330),
   dict(clear=(780,190,1110,272), en='turn and', nl='keren en', lx=793, maxw=340),
   dict(clear=(780,272,1110,350), en='walk back', nl='teruglopen', lx=793, maxw=340),
 ],
 # pros-kneel and pros-three are now composed from FH's redrawn plates, with
 # their labels in every language, by build-prostration-figures.py.
}

import os
HERE=os.path.dirname(os.path.abspath(__file__))
SRC=os.path.join(HERE,'sources')
def src_of(name):
    # Redrawn figures are supplied as PNG; the older ones are JPEG.
    png=os.path.join(SRC,name+'.png')
    return png if os.path.exists(png) else os.path.join(SRC,name+'.jpg')
OUT=os.path.join(HERE,'..','..','practice','images','meditation')
# The English figures come straight from the sources; only pros-floor is
# rebuilt here, the others already match byte for byte.
TARGET={'walk-feet':1034,'walk-path':690}
# The translated word can be narrower than the English one, which would trim
# the PNG tighter and draw the figure larger on the page. Pad these on the
# right to the English PNG's size so all languages show at the same scale.
PAD_TO_EN={'sit-posture','walk-stand'}

for name, specs in S.items():
    orig = Image.open(src_of(name)).convert('RGB')
    im = orig.copy()
    for sp in specs:
        print(name, '|', sp['nl'], draw_caption(im, orig, sp))
    tmp='/tmp/nl-src-%s.jpg'%name
    im.save(tmp, quality=95)
    out=os.path.join(OUT,'%s-nl.png'%name)
    proc.process(tmp, out)
    if name in TARGET:
        # match the English PNG's pixel dimensions
        png=Image.open(out); f=TARGET[name]/proc.process(src_of(name),'/tmp/en.png')[0]
        png.resize((round(png.width*f),round(png.height*f)), Image.LANCZOS).save(out)
    if name in PAD_TO_EN:
        en=proc.process(src_of(name),'/tmp/en.png')
        png=Image.open(out); canvas=Image.new('LA', en, (0,0))
        canvas.paste(png,(0,0)); canvas.save(out)
    print('  ->', out, Image.open(out).size)

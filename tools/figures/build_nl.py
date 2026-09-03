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
   dict(clear=(575,525,740,585), en='rising', nl='rijzen', maxw=200, cx=647),
   dict(clear=(575,692,745,768), en='falling', nl='vallen', maxw=200, size=44, cx=647),
 ],
 'walk-stand': [
   dict(clear=(600,1110,1140,1205), en='about 2 m ahead', nl='ongeveer 2 m vooruit', maxw=520),
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
 'pros-kneel': [
   dict(clear=(100,640,520,715), en='toes tucked under', nl='tenen onder u', maxw=470),
   dict(clear=(600,640,1080,720), en='or sitting on the feet', nl='of zittend op de voeten', maxw=470),
 ],
 'pros-three': [
   dict(clear=(30,865,500,960), en='palms at the chest', nl='handpalmen bij de borst', maxw=500),
   dict(clear=(510,865,1060,960), en='thumbs at the forehead', nl='duimen bij het voorhoofd', maxw=560),
   dict(clear=(1080,865,1660,960), en='forehead to the thumbs', nl='voorhoofd op de duimen', maxw=590),
 ],
}

import os
HERE=os.path.dirname(os.path.abspath(__file__))
SRC=os.path.join(HERE,'sources')
OUT=os.path.join(HERE,'..','..','practice','images','meditation')
# The English figures come straight from the sources; only pros-floor is
# rebuilt here, the others already match byte for byte.
TARGET={'walk-feet':1034,'walk-path':690,'walk-stand':598}

for name, specs in S.items():
    orig = Image.open(os.path.join(SRC,name+'.jpg')).convert('RGB')
    im = orig.copy()
    for sp in specs:
        print(name, '|', sp['nl'], draw_caption(im, orig, sp))
    tmp='/tmp/nl-src-%s.jpg'%name
    im.save(tmp, quality=95)
    out=os.path.join(OUT,'%s-nl.png'%name)
    proc.process(tmp, out)
    if name in TARGET:
        # match the English PNG's pixel dimensions
        png=Image.open(out); f=TARGET[name]/proc.process(os.path.join(SRC,name+'.jpg'),'/tmp/en.png')[0]
        png.resize((round(png.width*f),round(png.height*f)), Image.LANCZOS).save(out)
    print('  ->', out, Image.open(out).size)

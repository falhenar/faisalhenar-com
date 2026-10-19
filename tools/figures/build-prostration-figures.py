"""Build the two composite figures on the mindful prostration sheet from FH's
redrawn plates, in English, Dutch and Vietnamese.

  pros-kneel  = plates A and B          (the two ways of kneeling)
  pros-three  = plates 7, 9 and 20      (palms at the chest, thumbs at the
                                         forehead, forehead to the thumbs)

The drawings are used as drawn: paper to transparent and line to black with
proc.py's level curve, every drawing in a figure at the same scale, all
standing on one baseline. The labels under them are set in Patrick Hand,
the hand lettering the other figures use, so each language gets its own
wording without touching the drawings.

The redraws stay outside the repository (see build-prostration-plates.py).
Usage:  python3 tools/figures/build-prostration-figures.py "<redraws folder>"
"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'practice', 'images', 'meditation')
FONT = os.path.join(HERE, 'PatrickHand-Regular.ttf')

DRAW_H = 760        # the tallest drawing in a figure, in pixels
GAP = 70            # between drawings
LABEL_GAP = 34      # drawing baseline to the top of the label
# The wider figure is drawn smaller on the page, so its lettering is set larger
# to read at the same size as the two-drawing figure.
LABEL_SIZE = {'pros-kneel': 52, 'pros-three': 68}
MARGIN = 12

FIGURES = {
    'pros-kneel': [
        ('A', {'en': 'toes tucked under', 'nl': 'tenen onder u', 'vi': 'chống các ngón chân'}),
        ('B', {'en': 'or sitting on the feet', 'nl': 'of zittend op de voeten', 'vi': 'hoặc ngồi lên bàn chân'}),
    ],
    'pros-three': [
        ('07', {'en': 'palms at the chest', 'nl': 'handpalmen bij de borst', 'vi': 'lòng bàn tay ở ngực'}),
        ('09', {'en': 'thumbs at the forehead', 'nl': 'duimen bij het voorhoofd', 'vi': 'ngón cái ở trán'}),
        ('20', {'en': 'forehead to the thumbs', 'nl': 'voorhoofd op de duimen', 'vi': 'trán chạm ngón cái'}),
    ],
}
SUFFIX = {'en': '', 'nl': '-nl', 'vi': '-vi'}

def alpha_of(path):
    im = Image.open(path).convert('RGBA')
    bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
    bg.alpha_composite(im)
    a = np.asarray(bg.convert('L')).astype(np.float32)
    al = Image.fromarray((np.clip((236.0 - a) / 196.0, 0, 1) * 255).astype(np.uint8))
    return al.crop(al.getbbox())

def build(name, parts, src, lang):
    drawings = [alpha_of(os.path.join(src, 'prostration-redrawn-%s.png' % n)) for n, _ in parts]
    f = DRAW_H / max(d.height for d in drawings)          # one scale per figure
    drawings = [d.resize((round(d.width * f), round(d.height * f)), Image.LANCZOS) for d in drawings]
    labels = [words[lang] for _, words in parts]
    # each column is as wide as its drawing or its label, whichever is wider
    font = ImageFont.truetype(FONT, LABEL_SIZE[name])
    widths = [max(d.width, font.getbbox(t)[2] - font.getbbox(t)[0]) for d, t in zip(drawings, labels)]
    asc, desc = font.getmetrics()
    W = sum(widths) + GAP * (len(parts) - 1) + 2 * MARGIN
    H = MARGIN + DRAW_H + LABEL_GAP + asc + desc + MARGIN
    canvas = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(canvas)
    x = MARGIN
    for dr, w, t in zip(drawings, widths, labels):
        cx = x + w / 2
        canvas.paste(dr, (round(cx - dr.width / 2), MARGIN + DRAW_H - dr.height))
        bb = font.getbbox(t)
        d.text((cx - (bb[2] - bb[0]) / 2 - bb[0], MARGIN + DRAW_H + LABEL_GAP), t, font=font, fill=255)
        x += w + GAP
    out = Image.merge('LA', (Image.new('L', (W, H), 0), canvas))
    dst = os.path.join(OUT, '%s%s.png' % (name, SUFFIX[lang]))
    out.save(dst, optimize=True)
    print('%-16s %dx%d %d bytes' % (os.path.basename(dst), W, H, os.path.getsize(dst)))

if __name__ == '__main__':
    for name, parts in FIGURES.items():
        for lang in ('en', 'nl', 'vi'):
            build(name, parts, sys.argv[1], lang)

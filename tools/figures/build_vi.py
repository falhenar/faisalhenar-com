"""Make the Vietnamese figures (-vi.png), the same way build_nl.py makes the Dutch ones.

The caption rectangles, sizes and positions are taken from build_nl.py (its S table),
so the two stay in step if a drawing is ever re-measured. Only the wording differs.
Vietnamese wording follows the Vietnamese sheets and the Vietnamese translation of
Yuttadhammo Bhikkhu's manual: phồng / xẹp, quay lại, chạm. Patrick Hand covers Vietnamese.

Run from this directory: python3 build_vi.py
"""
import os, re, tempfile
from PIL import Image
from nl import draw_caption
import proc

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'build_nl.py'), encoding='utf-8').read()
ns = {}
exec(re.search(r'^S = \{.*?^\}', src, re.S | re.M).group(0), ns)
S = ns['S']

VI = {
    'about 10 cm apart': 'cách nhau khoảng 10 cm',
    'thumb tips touching': 'hai đầu ngón cái chạm nhau',
    'the forehead': 'trán',
    'comes down here': 'chạm xuống đây',
    'rising': 'phồng',
    'falling': 'xẹp',
    'about 2 m ahead': 'phía trước khoảng 2 m',
    'side by side, almost touching': 'sát nhau, gần chạm',
    'heel level with the other toes': 'gót thẳng hàng với ngón chân kia',
    '3 to 5 m': '3 đến 5 m',
    'turn and': 'quay lại',
    'walk back': 'rồi đi về',
    'toes tucked under': 'chống các ngón chân',
    'or sitting on the feet': 'hoặc ngồi lên bàn chân',
    'palms at the chest': 'lòng bàn tay ở ngực',
    'thumbs at the forehead': 'ngón cái ở trán',
    'forehead to the thumbs': 'trán chạm ngón cái',
}

SRC = os.path.join(HERE, 'sources')
OUT = os.path.join(HERE, '..', '..', 'practice', 'images', 'meditation')
TARGET = {'walk-feet': 1034, 'walk-path': 690, 'walk-stand': 598}
TMP = tempfile.mkdtemp(prefix='vi-figures-')

for name, specs in S.items():
    orig = Image.open(os.path.join(SRC, name + '.jpg')).convert('RGB')
    im = orig.copy()
    for sp in specs:
        sp = dict(sp, nl=VI[sp['en']])   # draw_caption writes spec['nl']
        print(name, '|', sp['nl'], draw_caption(im, orig, sp))
    tmp = os.path.join(TMP, 'vi-src-%s.jpg' % name)
    im.save(tmp, quality=95)
    out = os.path.join(OUT, '%s-vi.png' % name)
    proc.process(tmp, out)
    if name in TARGET:
        png = Image.open(out)
        f = TARGET[name] / proc.process(os.path.join(SRC, name + '.jpg'), os.path.join(TMP, 'en.png'))[0]
        png.resize((round(png.width * f), round(png.height * f)), Image.LANCZOS).save(out)
    print('  ->', os.path.basename(out), Image.open(out).size)

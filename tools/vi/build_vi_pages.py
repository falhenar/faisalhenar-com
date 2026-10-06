# -*- coding: utf-8 -*-
"""Write the Vietnamese drafts of the four meditation pages from the English pages.

    practice/sitting-meditation-vi.html
    practice/walking-meditation-vi.html
    practice/mindful-prostration-vi.html
    practice/mindful-prostration-steps-vi.html

The English page is the template: markup, figures and plates stay exactly as they are,
and only the words change. Sheet text comes from tools/vi/instructions-*.json (copies of
the Sati Timer app's assets); everything else from tools/vi/vi_data.py. The script stops
if a sheet block can't be found in the English page, and lists any English it left behind,
so a change to an English page can't slip through untranslated.

The drafts are unlisted: noindex, no hreflang, not linked from the English or Dutch pages
or the sitemap, and they say on the page that they are a draft under review.

Run from the repository root:  python3 tools/vi/build_vi_pages.py
"""
import html, importlib.util, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
PRACTICE = os.path.join(ROOT, 'practice')
spec = importlib.util.spec_from_file_location('vi_data', os.path.join(HERE, 'vi_data.py'))
D = importlib.util.module_from_spec(spec); spec.loader.exec_module(D)

EN = {s['id']: s for s in json.load(open(os.path.join(HERE, 'instructions-en.json'), encoding='utf-8'))}
VI = {s['id']: s for s in json.load(open(os.path.join(HERE, 'instructions-vi.json'), encoding='utf-8'))}


def runs_html(runs):
    out = ''
    for r in runs or []:
        t = html.escape(r['t'], quote=False)
        if r['s'] == 'noting':
            out += '<em class="noting">%s</em>' % t
        elif r['s'] == 'em':
            out += '<em>%s</em>' % t
        else:
            out += t
    return out


def sheet_pairs(e, v):
    """(english html, vietnamese html) for every piece of sheet text, wrapped in its tag."""
    yield '<span>%s</span>' % e['title'], '<span>%s</span>' % v['title']
    yield '<p class="room-dek">%s</p>' % runs_html(e['dek']), '<p class="room-dek">%s</p>' % runs_html(v['dek'])
    yield runs_html(e['credit']), runs_html(v['credit'])
    for se, sv in zip(e['sections'], v['sections']):
        yield '<h2 class="section-label">%s</h2>' % se['heading'], '<h2 class="section-label">%s</h2>' % sv['heading']
        for be, bv in zip(se['blocks'], sv['blocks']):
            t = be['type']
            if t == 'p':
                yield '<p>%s</p>' % runs_html(be['runs']), '<p>%s</p>' % runs_html(bv['runs'])
            elif t == 'sub':
                yield '<p class="sheet-sub">%s</p>' % runs_html(be['runs']), '<p class="sheet-sub">%s</p>' % runs_html(bv['runs'])
            elif t == 'figure':
                yield '<figcaption>%s</figcaption>' % runs_html(be['caption']), '<figcaption>%s</figcaption>' % runs_html(bv['caption'])
            elif t == 'aside':
                for pe, pv in zip(be['paragraphs'], bv['paragraphs']):
                    yield '<p>%s</p>' % runs_html(pe), '<p>%s</p>' % runs_html(pv)


def replace_once(s, old, new, what):
    for variant in (old, old.replace("'", '&#39;'), old.replace("'", '’')):
        if variant in s:
            return s.replace(variant, new, 1)
    sys.exit('Not found in the English page (%s): %s' % (what, old[:100]))


def head(s, page, P):
    url = 'https://faisalhenar.com/practice/%s-vi.html' % page
    s = s.replace('<html lang="en">', '<html lang="vi">', 1)
    s = re.sub(r'<title>.*?</title>', '<title>%s</title>' % P['title'], s, 1)
    for name in ('name="description"', 'property="og:description"', 'name="twitter:description"'):
        s = re.sub(r'(<meta %s content=")[^"]*(")' % name, r'\g<1>%s\2' % P['desc'], s)
    for name in ('property="og:title"', 'name="twitter:title"'):
        s = re.sub(r'(<meta %s content=")[^"]*(")' % name, r'\g<1>%s\2' % P['title'], s)
    s = re.sub(r'(<link rel="canonical" href=")[^"]*(")', r'\g<1>%s\2' % url, s)
    s = re.sub(r'(<meta property="og:url" content=")[^"]*(")', r'\g<1>%s\2' % url, s)
    s = re.sub(r'<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n', '', s)
    s = s.replace('<meta name="viewport" content="width=device-width, initial-scale=1.0">',
                  '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
                  '<meta name="robots" content="noindex">\n'
                  '<!-- Vietnamese DRAFT, written by tools/vi/build_vi_pages.py. Do not edit by hand. -->', 1)
    # Stylesheet versions stay as the English page has them: validate-site.py wants one
    # version per asset across the site.
    return s


def plates(s):
    def rep(m):
        img = m.group(2)
        if img.startswith('kneel'):
            alt, word = D.KNEEL[img]
        else:
            word, alt = D.STEPS[int(img[5:])]
        return m.group(1) + html.escape(alt) + m.group(4) + html.escape(word, quote=False) + m.group(6)
    return re.sub(r'(<img src="images/prostration/((step-\d\d)|kneel-[ab])\.svg" alt=")[^"]*("[^>]*>\s*<span class="step-word">)([^<]*)(</span>)',
                  rep, s)


def build(page):
    src = open(os.path.join(PRACTICE, page + '.html'), encoding='utf-8').read()
    P = D.PAGES[page]
    s = head(src, page, P)
    if page in EN:
        for old, new in sheet_pairs(EN[page], VI[page]):
            s = replace_once(s, old, new, page)
    s = plates(s)
    # links between the Vietnamese pages, then images with Vietnamese wording
    for p in ('mindful-prostration-steps', 'mindful-prostration'):
        s = s.replace('href="%s.html"' % p, 'href="%s-vi.html"' % p)
    for f in D.VI_FIGURES:
        s = s.replace('images/meditation/%s.png' % f, 'images/meditation/%s-vi.png' % f)
    for old in sorted(D.TEXT, key=len, reverse=True):
        s = s.replace(old, D.TEXT[old])
    s = re.sub(r'<p class="lang-note">.*?</p>',
               '<p class="lang-note">%s</p>' % D.DRAFT_NOTE.format(en=page + '.html'), s, 1)
    s = re.sub(r'<p class="sheet-meta mono">.*?</p>', '<p class="sheet-meta mono">%s</p>' % P['meta'], s, 1)
    return s


ENGLISH = set('the and of to is in on with for a an this that by are be as at from it not your you when'.split())
ALLOWED = {'Faisal Henar / Paramaribo', 'Menu', 'sirimangalo.org', 'tiếng Anh', 'Faisal Henar'}


def leftovers(s):
    body = s[s.index('<body'):]
    body = re.sub(r'<svg.*?</svg>', '', body, flags=re.S)
    body = re.sub(r'<script.*?</script>', '', body, flags=re.S)
    texts = [t.strip() for t in re.split(r'<[^>]+>', body)]
    attrs = re.findall(r'(?:alt|aria-label|title)="([^"]*)"', body)
    out = []
    for t in texts + attrs:
        t = html.unescape(t).strip()
        if not t or t in ALLOWED or not re.search(r'[A-Za-z]{3,}', t):
            continue
        if re.search(r'[À-ỹ]', t):   # has Vietnamese letters: translated
            continue
        if not ENGLISH & set(re.findall(r'[a-z]+', t.lower())):   # e.g. "vui", "xoay", "(PDF)"
            continue
        out.append(t)
    return out


if __name__ == '__main__':
    bad = False
    for page in D.PAGES:
        s = build(page)
        path = os.path.join(PRACTICE, page + '-vi.html')
        open(path, 'w', encoding='utf-8').write(s)
        left = leftovers(s)
        print('wrote', os.path.relpath(path, ROOT), '| untranslated:', left or 'none')
        bad = bad or bool(left)
    sys.exit(1 if bad else 0)

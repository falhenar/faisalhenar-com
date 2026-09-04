# -*- coding: utf-8 -*-
"""Write practice/mindful-prostration-steps.html and its Dutch mirror from
tools/prostration-steps-data.py.

The plates are the Sirimangalo instruction sheets, cut into one image per
position (tools/figures/cut-prostration-plates.py). The noting word under
each plate is HTML text rather than part of the artwork, which is what lets
one set of images serve both languages.

Run from the repository root:  python3 tools/build-prostration-steps.py
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
spec = importlib.util.spec_from_file_location('data', os.path.join(HERE, 'prostration-steps-data.py'))
D = importlib.util.module_from_spec(spec); spec.loader.exec_module(D)

T = {
 'en': dict(
   lang='en', file='mindful-prostration-steps.html', other='mindful-prostration-steps-nl.html',
   sheet='mindful-prostration.html', pdf='mindful-prostration-steps.pdf',
   otherpdf='mindful-prostration-steps-nl.pdf',
   title='The prostration step by step · Practice · Faisal Henar',
   desc='Every position in one mindful prostration, from kneeling to standing, with the noting word for each movement.',
   h1='The prostration, step by step',
   langnote='Also available in <a href="mindful-prostration-steps-nl.html">Dutch</a>',
   dek='Every position in one prostration, from kneeling to standing, with the word noted at each movement.',
   meta='Companion to sheet 3 &middot; <a href="mindful-prostration-steps.pdf">Download PDF</a> &middot; <a href="mindful-prostration-steps-nl.pdf">Download PDF (Nederlands)</a>',
   back='&larr; Mindful prostration',
   intro=['This is the same sequence as the <a href="mindful-prostration.html">mindful prostration sheet</a>, shown position by position. The sheet explains what the practice is for and how to note; this page is for checking the shape of a movement when the words are not enough.',
          'The word under each drawing is the note said silently while the movement is made, once as it begins, once in the middle, once as it ends. Numbers follow the sequence from the first kneeling to standing up again.'],
   sections=[('Kneeling', 'kneel', 'Either position is correct. Choose the one your knees and ankles allow.'),
             ('Going down', 'a', None),
             ('Coming up', 'b', 'Repeat 12 to 31 twice more, so there are three prostrations in all, then continue with 32.'),
             ('Finishing', 'c', None)],
   kneelcaps=['toes tucked under', 'or sitting on the feet'],
   credit='These instructions follow the meditation manual of Yuttadhammo Bhikkhu. The technique is the style of insight practice as taught by Ajahn Tong Sirimangalo, in which experience is noted silently and in plain language as it occurs. The drawings on this page are by the team at <a href="https://www.sirimangalo.org/">sirimangalo.org</a> and are used with their permission.',
   navcur='Practice',
 ),
 'nl': dict(
   lang='nl', file='mindful-prostration-steps-nl.html', other='mindful-prostration-steps.html',
   sheet='mindful-prostration-nl.html', pdf='mindful-prostration-steps-nl.pdf',
   otherpdf='mindful-prostration-steps.pdf',
   title='De prostratie stap voor stap · Beoefening · Faisal Henar',
   desc='Elke houding in een aandachtige prostratie, van knielen tot staan, met het genoteerde woord bij elke beweging.',
   h1='De prostratie, stap voor stap',
   langnote='Ook beschikbaar in het <a href="mindful-prostration-steps.html">Engels</a>',
   dek='Elke houding in een prostratie, van knielen tot staan, met het woord dat bij elke beweging wordt genoteerd.',
   meta='Bij blad 3 &middot; <a href="mindful-prostration-steps-nl.pdf">Download PDF</a> &middot; <a href="mindful-prostration-steps.pdf">Download PDF (Engels)</a>',
   back='&larr; Aandachtige prostratie',
   intro=['Dit is dezelfde volgorde als op het <a href="mindful-prostration-nl.html">blad over aandachtige prostratie</a>, houding voor houding getoond. Het blad legt uit waar de oefening voor dient en hoe u noteert; deze pagina is om de vorm van een beweging na te kijken wanneer woorden tekortschieten.',
          'Het woord onder elke tekening is de notitie die stil wordt gezegd terwijl de beweging wordt gemaakt, een keer bij het begin, een keer in het midden, een keer bij het eind. De nummers volgen de volgorde van het eerste knielen tot het weer opstaan.'],
   sections=[('Knielen', 'kneel', 'Beide houdingen zijn correct. Kies de houding die uw knieën en enkels toelaten.'),
             ('Naar beneden', 'a', None),
             ('Omhoog komen', 'b', 'Herhaal 12 tot 31 nog twee keer, zodat er in totaal drie prostraties zijn, en ga dan verder met 32.'),
             ('Afsluiten', 'c', None)],
   kneelcaps=['tenen onder u', 'of zittend op de voeten'],
   credit='Deze instructies volgen de meditatiehandleiding van Yuttadhammo Bhikkhu. De techniek is de stijl van inzichtmeditatie zoals onderwezen door Ajahn Tong Sirimangalo, waarbij de ervaring stil en in eenvoudige taal wordt genoteerd zoals ze zich voordoet. De tekeningen op deze pagina zijn van het team van <a href="https://www.sirimangalo.org/">sirimangalo.org</a> en worden gebruikt met hun toestemming.',
   navcur='Praktijk',
 ),
}

RANGES = {'a': range(1, 21), 'b': range(21, 32), 'c': range(32, 40)}

NAV = {'en': '''          <a href="../">Home</a>
          <a href="./" class="current" aria-current="true">Practice</a>
          <a href="../photography/">Photography</a>
          <a href="../elsewhere.html">Elsewhere</a>
          <a href="../note.html">A note from me</a>
          <a href="../contact.html">Contact</a>''',
       'nl': '''          <a href="../">Home</a>
          <a href="./" class="current" aria-current="true">Praktijk</a>
          <a href="../photography/">Fotografie</a>
          <a href="../elsewhere.html">Overig</a>
          <a href="../note.html">Een woord van mij</a>
          <a href="../contact.html">Contact</a>'''}

def plate(img, alt, word):
    return ('      <li class="step-plate">\n'
            '        <img src="images/prostration/%s.png" alt="%s" width="352" height="294" loading="lazy" decoding="async">\n'
            '        <span class="step-word">%s</span>\n'
            '      </li>\n' % (img, alt, word))

def build(t):
    nl = t['lang'] == 'nl'
    out = []
    A = out.append
    A('<!DOCTYPE html>\n<html lang="%s">\n<head>\n<meta charset="UTF-8">\n' % t['lang'])
    A('<meta name="viewport" content="width=device-width, initial-scale=1.0">\n')
    A('<link rel="icon" href="/favicon.ico" sizes="any">\n')
    A('<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png">\n')
    A('<link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png">\n')
    A('<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n')
    A('<title>%s</title>\n' % t['title'])
    A('<meta name="description" content="%s">\n' % t['desc'])
    A('<link rel="canonical" href="https://faisalhenar.com/practice/%s">\n' % t['file'])
    A('<link rel="alternate" hreflang="%s" href="https://faisalhenar.com/practice/%s">\n' % ('nl' if not nl else 'en', t['other']))
    A('<meta property="og:title" content="%s">\n' % t['title'])
    A('<meta property="og:description" content="%s">\n' % t['desc'])
    A('<meta property="og:type" content="website">\n')
    A('<meta property="og:url" content="https://faisalhenar.com/practice/%s">\n' % t['file'])
    A('<meta property="og:image" content="https://faisalhenar.com/images/og-image.png">\n')
    A('<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n')
    A('<meta name="twitter:card" content="summary_large_image">\n')
    A('<meta name="twitter:title" content="%s">\n' % t['title'])
    A('<meta name="twitter:description" content="%s">\n' % t['desc'])
    A('<meta name="twitter:image" content="https://faisalhenar.com/images/og-image.png">\n')
    A('<link rel="stylesheet" href="css/practice.css?v=42">\n')
    A("<!-- Cloudflare Web Analytics -->\n<script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{\"token\": \"68bb7041afa74c9ea4d36891d27ae977\"}'></script>\n<!-- End Cloudflare Web Analytics -->\n")
    A('</head>\n<body class="meditation-page sheet-page">\n\n')
    A('  <header class="room-header">\n    <a class="mark" href="../">Faisal Henar</a>\n')
    A('    <div class="room-header-right">\n      <span class="section-label">%s</span>\n' % t['navcur'])
    A('      <div class="menu" data-menu>\n        <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-menu-panel" data-menu-btn>Menu</button>\n')
    A('        <nav class="menu-panel" id="site-menu-panel" data-menu-panel aria-label="Site sections">\n%s\n        </nav>\n      </div>\n    </div>\n  </header>\n\n' % NAV[t['lang']])
    A('''  <svg class="room-header-icon" viewBox="0 0 120 170" aria-hidden="true">
    <rect x="16" y="12" width="88" height="146" rx="3"></rect>
    <circle cx="60" cy="58" r="9"></circle>
    <path d="M46 72 C40 84 38 100 38 116 C46 111 74 111 82 116 C82 100 80 84 74 72 C69 67 51 67 46 72 Z"></path>
    <circle class="fill-dot" cx="60" cy="99" r="2.5"></circle>
    <line x1="34" y1="122" x2="86" y2="122"></line>
  </svg>\n\n''')
    A('  <main>\n  <a class="back-link" href="%s">%s</a>\n' % (t['sheet'], t['back']))
    A('  <h1 class="room-title">%s</h1>\n' % t['h1'])
    A('  <p class="lang-note">%s</p>\n' % t['langnote'])
    A('  <p class="room-dek">%s</p>\n' % t['dek'])
    A('  <p class="sheet-meta mono">%s</p>\n\n' % t['meta'])
    A('  <div class="page-intro">\n')
    for p in t['intro']:
        A('    <p>%s</p>\n' % p)
    A('  </div>\n\n')

    for label, key, note in t['sections']:
        A('  <section class="section">\n    <h2 class="section-label">%s</h2>\n' % label)
        A('    <ul class="step-set">\n')
        if key == 'kneel':
            for (img, letter, _a, _b, alt_en, alt_nl), cap in zip(D.KNEEL, t['kneelcaps']):
                A(plate(img, alt_nl if nl else alt_en, cap))
        else:
            for n in RANGES[key]:
                s = D.STEPS[n - 1]
                A(plate('step-%02d' % n, s[4 if nl else 3], s[2] if nl else s[1]))
        A('    </ul>\n')
        if note:
            A('    <p class="step-note">%s</p>\n' % note)
        A('  </section>\n\n')

    A('  <p class="sheet-credit">%s</p>\n\n  </main>\n\n' % t['credit'])
    A('''  <footer class="site-footer">
    <nav class="footer-nav" aria-label="More">
      <a href="../note.html">A note from me</a>
      <a href="../contact.html">Contact</a>
      <a href="../elsewhere.html">Elsewhere</a>
    </nav>
    <span>&copy; <span id="year"></span> Faisal Henar</span>
    <noscript>
      <nav class="footer-nav" aria-label="Site sections">
        <a href="../">Home</a>
        <a href="./">Practice</a>
        <a href="../photography/">Photography</a>
      </nav>
    </noscript>
  </footer>

  <script>document.getElementById('year').textContent = new Date().getFullYear();</script>
  <script src="../js/menu.js?v=2"></script>
</body>
</html>\n''')
    return ''.join(out)

for key, t in T.items():
    path = os.path.join(ROOT, 'practice', t['file'])
    open(path, 'w', encoding='utf-8').write(build(t))
    print('wrote', path)

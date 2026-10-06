# -*- coding: utf-8 -*-
"""Vietnamese wording for the practice pages that is not in the instruction sheets themselves.

The sheet text (headings, paragraphs, captions, asides, credit) comes from
instructions-en.json / instructions-vi.json in this folder, which are copies of the
Sati Timer app's assets, so the app and the site say exactly the same thing.
Everything else lives here: page chrome, image descriptions, and the prostration plates.

Noting words follow the Vietnamese translation of Yuttadhammo Bhikkhu's manual,
"Thiền như thế nào" (static.sirimangalo.org/howto/vietnamese.pdf), chapter 5:
xoay / đưa lên / chạm / hạ xuống / cúi / úp / ngước lên / ngồi / đứng.

STATUS: draft, under review by native speakers (see the Sati Timer review page).
"""

MANUAL_PDF = 'https://static.sirimangalo.org/howto/vietnamese.pdf'

PAGES = {
    'sitting-meditation': dict(
        title='Ngồi thiền · Thực hành · Faisal Henar',
        desc='Hướng dẫn ngồi thiền: quan sát sự phồng xẹp của bụng, và ghi nhận bất cứ điều gì khác kéo tâm ra khỏi đó.',
        meta='Bản dịch tiếng Việt (bản nháp) &middot; bài 1 / 3',
    ),
    'walking-meditation': dict(
        title='Kinh hành · Thực hành · Faisal Henar',
        desc='Hướng dẫn kinh hành: một đoạn đường thẳng ngắn, đi thật chậm, với câu niệm đi cùng nhịp bàn chân.',
        meta='Bản dịch tiếng Việt (bản nháp) &middot; bài 2 / 3',
    ),
    'mindful-prostration': dict(
        title='Bái lạy trong chánh niệm · Thực hành · Faisal Henar',
        desc='Hướng dẫn bái lạy trong chánh niệm: ba lần lạy, thực hiện chậm rãi, ghi nhận từng chuyển động.',
        meta='Bản dịch tiếng Việt (bản nháp) &middot; bài 3 / 3 &middot; <a href="mindful-prostration-steps-vi.html">Từng bước</a>',
    ),
    'mindful-prostration-steps': dict(
        title='Bái lạy từng bước · Thực hành · Faisal Henar',
        desc='Từng tư thế trong một lần bái lạy trong chánh niệm, từ lúc quỳ đến lúc đứng dậy, với chữ niệm cho mỗi chuyển động.',
        meta='Bản dịch tiếng Việt (bản nháp) &middot; đi kèm bài 3',
    ),
}

# The draft note that replaces "Also available in Dutch". {en} is the English page.
DRAFT_NOTE = ('Bản nháp, đang được xem lại &middot; <a href="{en}">Bản gốc tiếng Anh</a> &middot; '
              '<a href="' + MANUAL_PDF + '">Sách “Thiền như thế nào” (PDF)</a>')

# Exact replacements, applied after the sheet text. Longest first is handled by the builder.
TEXT = {
    # chrome
    'Skip to content': 'Bỏ qua, đến nội dung',
    'I · Practice': 'I · Thực hành',
    '>Home<': '>Trang chủ<',
    'aria-current="true">Practice<': 'aria-current="true">Thực hành<',
    '<a href="./">Practice</a>': '<a href="./">Thực hành</a>',
    '>Photography<': '>Nhiếp ảnh<',
    '>Elsewhere<': '>Những nơi khác<',
    '>A note from me<': '>Đôi lời của tôi<',
    '>Contact<': '>Liên hệ<',
    'aria-label="Site sections"': 'aria-label="Các mục của trang"',
    'aria-label="More"': 'aria-label="Thêm"',
    'Built quietly, updated slowly': 'Làm lặng lẽ, cập nhật chậm rãi',
    '&larr; Meditation<': '&larr; Thiền (tiếng Anh)<',
    '&larr; Mindful prostration<': '&larr; Bái lạy trong chánh niệm<',

    # image descriptions
    'alt="Cross-legged sitting posture, with arrows marking the rise and fall of the abdomen"':
        'alt="Tư thế ngồi xếp bằng, mũi tên chỉ sự phồng và xẹp của bụng"',
    'alt="Sitting upright on the front edge of a chair, feet flat on the floor"':
        'alt="Ngồi thẳng ở phía trước mặt ghế, hai bàn chân đặt phẳng trên sàn"',
    'alt="Standing posture for walking meditation, hands clasped, gaze resting on the path ahead"':
        'alt="Tư thế đứng khi kinh hành, hai tay đan vào nhau, ánh mắt dừng trên đường đi phía trước"',
    'alt="A straight walking path three to five metres long, walked end to end and back"':
        'alt="Một đường đi thẳng dài ba đến năm mét, đi từ đầu này đến đầu kia rồi quay lại"',
    'alt="Foot placement: feet side by side almost touching, then the moving foot landing heel level with the other foot\'s toes"':
        'alt="Cách đặt chân: hai bàn chân sát nhau gần chạm, rồi gót của chân vừa bước thẳng hàng với các ngón của chân kia"',
    'alt="Foot placement: feet side by side almost touching, then the moving foot landing heel level with the other foot&#39;s toes"':
        'alt="Cách đặt chân: hai bàn chân sát nhau gần chạm, rồi gót của chân vừa bước thẳng hàng với các ngón của chân kia"',
    'alt="Two kneeling positions: toes tucked under, or sitting on the tops of the feet"':
        'alt="Hai tư thế quỳ: chống các ngón chân, hoặc ngồi lên mu bàn chân"',
    'alt="Three stages of prostration: palms at the chest, thumbs at the forehead, forehead lowered to the thumbs on the floor"':
        'alt="Ba giai đoạn của bái lạy: lòng bàn tay ở ngực, ngón cái ở trán, trán hạ xuống chạm hai ngón cái trên sàn"',
    'alt="Hands flat on the floor, thumb tips touching, about ten centimetres between the index fingers, forehead lowered to the thumbs"':
        'alt="Hai bàn tay úp trên sàn, hai đầu ngón cái chạm nhau, hai ngón trỏ cách nhau khoảng mười phân, trán hạ xuống chạm hai ngón cái"',

    # prostration sheet extras
    '>Every position, step by step<': '>Từng tư thế, từng bước<',
    'The numbered step drawings are by the team at <a href="https://www.sirimangalo.org/">sirimangalo.org</a> and are used with their permission.':
        'Các hình vẽ từng bước có đánh số là của nhóm <a href="https://www.sirimangalo.org/">sirimangalo.org</a> và được sử dụng với sự cho phép của họ.',

    # step-by-step page
    '>The prostration, step by step<': '>Bái lạy, từng bước<',
    'Every position in one prostration, from kneeling to standing, with the word noted at each movement.':
        'Từng tư thế trong một lần lạy, từ lúc quỳ đến lúc đứng dậy, với chữ niệm ở mỗi chuyển động.',
    'This is the same sequence as the <a href="mindful-prostration-vi.html">mindful prostration sheet</a>, shown position by position. The sheet explains what the practice is for and how to note; this page is for checking the shape of a movement when the words are not enough.':
        'Đây là cùng một trình tự như trong <a href="mindful-prostration-vi.html">bài Bái lạy trong chánh niệm</a>, được trình bày theo từng tư thế. Bài hướng dẫn giải thích mục đích của việc thực hành và cách niệm; trang này giúp xem lại hình dáng của một chuyển động khi lời giải thích chưa đủ.',
    'The word under each drawing is the note said silently while the movement is made, once as it begins, once in the middle, once as it ends. Numbers follow the sequence from the first kneeling to standing up again.':
        'Chữ dưới mỗi hình là câu niệm thầm trong khi thực hiện chuyển động: một lần khi bắt đầu, một lần ở giữa, một lần khi kết thúc. Các số theo thứ tự từ lần quỳ đầu tiên cho đến khi đứng dậy.',
    '<h2 class="section-label">Kneeling</h2>': '<h2 class="section-label">Quỳ</h2>',
    '<h2 class="section-label">Going down</h2>': '<h2 class="section-label">Lạy xuống</h2>',
    '<h2 class="section-label">Coming up</h2>': '<h2 class="section-label">Ngước lên</h2>',
    '<h2 class="section-label">Finishing</h2>': '<h2 class="section-label">Kết thúc</h2>',
    'Either position is correct. Choose the one your knees and ankles allow.':
        'Cả hai tư thế đều đúng. Hãy chọn tư thế mà đầu gối và cổ chân của bạn cho phép.',
    'Repeat 12 to 31 twice more, so there are three prostrations in all, then continue with 32.':
        'Lặp lại từ 12 đến 31 thêm hai lần nữa, để tổng cộng có ba lần lạy, rồi tiếp tục với 32.',
    'The drawings on this page are by the team at <a href="https://www.sirimangalo.org/">sirimangalo.org</a> and are used with their permission.':
        'Các hình vẽ trên trang này là của nhóm <a href="https://www.sirimangalo.org/">sirimangalo.org</a> và được sử dụng với sự cho phép của họ.',
}

# The two kneeling plates: (image, description, word under the plate)
KNEEL = {
    'kneel-a': ('Quỳ, chống các ngón chân, ngồi lên gót chân', 'chống các ngón chân'),
    'kneel-b': ('Quỳ, mu bàn chân nằm phẳng trên sàn, ngồi lên bàn chân', 'hoặc ngồi lên bàn chân'),
}

# The 39 plates: number -> (noting word, description)
STEPS = {
    1: ('ngồi', 'Quỳ thẳng lưng, hai bàn tay úp trên đùi'),
    2: ('xoay', 'Bàn tay phải xoay một phần tư vòng, dựng đứng trên đùi'),
    3: ('đưa lên', 'Bàn tay phải đưa lên từ đùi về phía ngực, vẫn dựng đứng'),
    4: ('chạm', 'Bàn tay phải ở ngực, ngón cái chạm ngực'),
    5: ('xoay', 'Bàn tay trái xoay dựng đứng trên đùi'),
    6: ('đưa lên', 'Bàn tay trái đưa lên gặp bàn tay phải ở ngực'),
    7: ('chạm', 'Hai lòng bàn tay áp vào nhau ở ngực, hai ngón cái chạm ngực'),
    8: ('đưa lên', 'Hai bàn tay cùng đưa lên từ ngực đến trán'),
    9: ('chạm', 'Móng hai ngón cái chạm trán, hai lòng bàn tay áp vào nhau'),
    10: ('hạ xuống', 'Hai bàn tay hạ từ trán về lại ngực'),
    11: ('chạm', 'Hai lòng bàn tay lại áp vào nhau ở ngực'),
    12: ('cúi', 'Lưng cúi về phía trước khoảng bốn mươi lăm độ, hai tay ở ngực'),
    13: ('hạ xuống', 'Bàn tay phải hạ xuống sàn trước đầu gối, vẫn dựng đứng'),
    14: ('chạm', 'Cạnh ngón út của bàn tay phải chạm sàn'),
    15: ('úp', 'Bàn tay phải úp xuống, lòng bàn tay áp sàn'),
    16: ('hạ xuống', 'Bàn tay trái hạ xuống sàn bên cạnh bàn tay phải'),
    17: ('chạm', 'Cạnh ngón út của bàn tay trái chạm sàn'),
    18: ('úp', 'Bàn tay trái úp xuống bên cạnh bàn tay phải'),
    19: ('cúi', 'Lưng cúi xuống thêm, trán hạ dần về phía hai ngón cái'),
    20: ('chạm', 'Trán đặt trên hai ngón cái, hai lòng bàn tay úp trên sàn'),
    21: ('ngước lên', 'Lưng nâng lên cho đến khi hai cánh tay duỗi thẳng, tay vẫn trên sàn'),
    22: ('xoay', 'Bàn tay phải xoay dựng lên trên cạnh của nó, trên sàn'),
    23: ('đưa lên', 'Bàn tay phải đưa lên từ sàn về phía ngực'),
    24: ('chạm', 'Bàn tay phải ở ngực, ngón cái chạm ngực'),
    25: ('xoay', 'Bàn tay trái xoay dựng lên trên cạnh của nó, trên sàn'),
    26: ('đưa lên', 'Bàn tay trái đưa lên từ sàn trong khi lưng thẳng dần lên'),
    27: ('chạm', 'Hai lòng bàn tay áp vào nhau ở ngực, lại quỳ thẳng lưng'),
    28: ('đưa lên', 'Hai bàn tay đưa lên từ ngực đến trán'),
    29: ('chạm', 'Móng hai ngón cái chạm trán'),
    30: ('hạ xuống', 'Hai bàn tay hạ từ trán xuống ngực'),
    31: ('chạm', 'Hai lòng bàn tay áp vào nhau ở ngực'),
    32: ('hạ xuống', 'Bàn tay phải hạ từ ngực xuống về phía đùi'),
    33: ('chạm', 'Bàn tay phải chạm đùi, vẫn dựng đứng'),
    34: ('úp', 'Nhìn từ phía trước: bàn tay phải úp trên đùi'),
    35: ('hạ xuống', 'Bàn tay trái hạ xuống đùi bên kia'),
    36: ('chạm', 'Bàn tay trái chạm đùi, vẫn dựng đứng'),
    37: ('úp', 'Nhìn từ phía trước: hai bàn tay úp trên hai đùi'),
    38: ('ngồi', 'Quỳ yên, hai bàn tay úp trên đùi'),
    39: ('đứng', 'Từ tư thế quỳ đứng dậy'),
}

# Figures that have a Vietnamese version (tools/figures/build_vi.py). sit-chair has no words.
VI_FIGURES = ['pros-floor', 'sit-posture', 'walk-stand', 'walk-feet', 'walk-path', 'pros-kneel', 'pros-three']

/*
  QUOTES CONFIG
  --------------
  Source pool for the quote block on the practice hub (practice/index.html).
  One shows per page load, walked in a shuffled cycle by render-quotes.js —
  every quote appears once before any of them repeats.

  Fields:
  text    -> the quotation itself, verbatim from the cited source
  author  -> the person the quote is attributed to
  source  -> book / sutta / talk it is drawn from, plus translator where
             relevant. Prefer something checkable over "teachings of X".
  themes  -> lowercase tags: impermanence, letting-go, mindfulness,
             compassion, simplicity, contentment, wisdom,
             suffering-liberation, silence, humility, gratitude,
             ordinary-life. Not used for rendering yet — kept for grouping
             or filtering later.

  Sourcing:
  - Dhammapada verses use Acharya Buddharakkhita's translation (Buddhist
    Publication Society, 1985) unless the entry says otherwise. A few
    sutta lines use Thanissaro Bhikkhu's (dhammatalks.org).
  - Ajahn Mun and Ajahn Lee are from Thanissaro Bhikkhu's translations on
    dhammatalks.org.
  - Sayadaw U Tejaniya is from his Tricycle interview "The Wise
    Investigator" (Winter 2007) and his book Awareness Alone Is Not Enough.
  - Some Ajahn Chah and Ajahn Sumedho lines are cross-checked against
    Abhayagiri's Ajahn Pasanno Archive, which transcribes from audio.
  - Quotes that couldn't be traced to a primary source were left out
    rather than carry a vague credit — including several widely-circulated
    lines that are almost certainly genuine but unplaceable. Better a
    shorter list than one that cites "teachings of X". "Food for the Heart"
    and "A Still Forest Pool" are the reliable Ajahn Chah anthologies to
    draw more from.
  - No Bhikkhu Bodhi Wheel/Bodhi Leaves essay used yet beyond The Noble
    Eightfold Path — worth expanding later.
  - Japanese Zen entries: Suzuki from Zen Mind, Beginner's Mind (1970) and
    Not Always So; Dogen from Moon in a Dewdrop and Fukanzazengi (trans.
    Waddell/Abe) and Tenzo Kyokun (trans. Foulk); Hakuin's Song of Zazen
    from D.T. Suzuki's Manual of Zen Buddhism translation (wording varies
    across translators — this is the most widely cited English version).
    A second Hakuin quote (from Wild Ivy) was attempted but the only
    candidate line had conflicting, unverifiable phrasing across sources,
    so it was left out.
  - Sam Harris quotes are both from Waking Up: A Guide to Spirituality
    Without Religion (2014), verified against multiple independent
    citations of the book's exact text. Could not verify specific
    guided-meditation wording from the Waking Up app itself — its audio
    sessions aren't publicly transcribed, so nothing from the app proper
    was added; see FH for how to proceed on that front.
  - Dilgo Khyentse Rinpoche and Sister Chan Khong were researched for this
    batch but dropped: every candidate quote traced only to aggregator
    sites (Goodreads/AZQuotes) with no accessible primary text to confirm
    exact wording. Worth revisiting with direct access to the printed
    books (The Heart of Compassion; Learning True Love).
  - Ajahn Amaro's Small Boat, Great Mountain quote and Seung Sahn's Only
    Don't Know quote were checked against OCR'd scans with some noise
    elsewhere in the file; the specific lines used fell in clean,
    legible stretches and were cross-confirmed against independent
    citations, but a print spot-check would be worth doing eventually.
*/

const QUOTES = [
  // ---- The Buddha (Pali Canon) ----------------------------------------
  {
    text: "Mind precedes all mental states. Mind is their chief; they are all mind-wrought.",
    author: "The Buddha",
    source: "Dhammapada, v. 1, trans. Acharya Buddharakkhita",
    themes: ["wisdom", "mindfulness"]
  },
  {
    text: "Hatred is never appeased by hatred in this world. By non-hatred alone is hatred appeased. This is a law eternal.",
    author: "The Buddha",
    source: "Dhammapada, v. 5, trans. Acharya Buddharakkhita",
    themes: ["compassion", "wisdom"]
  },
  {
    text: "Not to do any evil, to cultivate good, to purify one's mind — this is the teaching of the Buddhas.",
    author: "The Buddha",
    source: "Dhammapada, v. 183, trans. Acharya Buddharakkhita",
    themes: ["wisdom", "simplicity"]
  },
  {
    text: "All conditioned things are impermanent — when one sees this with wisdom, one turns away from suffering.",
    author: "The Buddha",
    source: "Dhammapada, v. 277, trans. Acharya Buddharakkhita",
    themes: ["impermanence", "wisdom", "suffering-liberation"]
  },
  {
    text: "Though one may conquer a thousand times a thousand men in battle, yet he indeed is the noblest victor who conquers himself.",
    author: "The Buddha",
    source: "Dhammapada, v. 103, trans. Acharya Buddharakkhita",
    themes: ["wisdom", "humility"]
  },
  {
    text: "Health is the most precious gain and contentment the greatest wealth. A trustworthy person is the best kinsman, Nibbana the highest bliss.",
    author: "The Buddha",
    source: "Dhammapada, v. 204, trans. Acharya Buddharakkhita",
    themes: ["contentment", "gratitude"]
  },
  {
    text: "Just as a solid rock is not shaken by the storm, even so the wise are not affected by praise or blame.",
    author: "The Buddha",
    source: "Dhammapada, v. 81, trans. Acharya Buddharakkhita",
    themes: ["wisdom", "humility"]
  },
  {
    text: "Irrigators regulate the waters, fletchers straighten arrow shafts, carpenters shape wood, and the wise control themselves.",
    author: "The Buddha",
    source: "Dhammapada, v. 80, trans. Acharya Buddharakkhita",
    themes: ["simplicity", "wisdom", "mindfulness"]
  },
  {
    text: "Overcome the angry by non-anger; overcome the wicked by goodness; overcome the miser by generosity; overcome the liar by truth.",
    author: "The Buddha",
    source: "Dhammapada, v. 223, trans. Acharya Buddharakkhita",
    themes: ["compassion", "wisdom"]
  },
  {
    text: "Both formerly and now, it is only stress that I describe, and the cessation of stress.",
    author: "The Buddha",
    source: "Anuradha Sutta (Saṃyutta Nikāya 22.86), trans. Thanissaro Bhikkhu",
    themes: ["suffering-liberation", "wisdom"]
  },
  {
    text: "Just as the great ocean has one taste, the taste of salt, so too this Dhamma and Discipline has one taste: the taste of liberation.",
    author: "The Buddha",
    source: "Udāna 5.5, trans. John D. Ireland",
    themes: ["wisdom", "suffering-liberation"]
  },
  {
    text: "Victory begets enmity; the defeated dwell in pain. Happily the peaceful live, discarding both victory and defeat.",
    author: "The Buddha",
    source: "Dhammapada, v. 201, trans. Acharya Buddharakkhita",
    themes: ["letting-go", "contentment"]
  },
  {
    text: "You yourselves must strive; the Buddhas only point the way. Those meditative ones who tread the path are released from the bonds of Mara.",
    author: "The Buddha",
    source: "Dhammapada, v. 276, trans. Acharya Buddharakkhita",
    themes: ["wisdom", "mindfulness"]
  },

  // ---- Ajahn Chah -------------------------------------------------------
  {
    text: "If you let go a little, you will have a little peace. If you let go a lot, you will have a lot of peace. And if you let go completely, you will have complete peace.",
    author: "Ajahn Chah",
    source: "No Ajahn Chah: Reflections",
    themes: ["letting-go", "contentment"]
  },
  {
    text: "Peace is within oneself to be found in the same place as agitation and suffering. It is not found in a forest or on a hilltop, nor is it given by a teacher. Where you experience suffering, you can also find freedom from suffering.",
    author: "Ajahn Chah",
    source: "No Ajahn Chah: Reflections",
    themes: ["suffering-liberation", "wisdom"]
  },
  {
    text: "If your mind is peaceful, you are peaceful, and then wherever you go, you will not have any problems.",
    author: "Ajahn Chah",
    source: "A Still Forest Pool",
    themes: ["contentment", "mindfulness"]
  },
  {
    text: "Do not try to become anything. Do not make yourself into anything. Do not be a meditator. Do not become enlightened.",
    author: "Ajahn Chah",
    source: "A Still Forest Pool",
    themes: ["simplicity", "letting-go", "humility"]
  },
  {
    text: "Your practice now is patience.",
    author: "Ajahn Chah",
    source: "Recorded talk, quoted in the Ajahn Pasanno Archive, Abhayagiri Monastery",
    themes: ["simplicity", "humility"]
  },
  {
    text: "It's the suffering that awakens you.",
    author: "Ajahn Chah",
    source: "Recorded talk, quoted in the Ajahn Pasanno Archive, Abhayagiri Monastery",
    themes: ["suffering-liberation", "wisdom"]
  },
  {
    text: "Enlightenment is not something you can find by searching. It's a matter of stopping.",
    author: "Ajahn Chah",
    source: "A Still Forest Pool",
    themes: ["wisdom", "letting-go", "silence"]
  },
  {
    text: "The heart of the path is so simple. No need for long explanations. Give up clinging to love and hate, just rest with things as they are.",
    author: "Ajahn Chah",
    source: "A Still Forest Pool, \"The Simple Path\"",
    themes: ["simplicity", "letting-go"]
  },
  {
    text: "There are two kinds of suffering: the suffering that leads to more suffering and the suffering that leads to the end of suffering.",
    author: "Ajahn Chah",
    source: "A Still Forest Pool, \"Happiness and Suffering\"",
    themes: ["suffering-liberation", "wisdom"]
  },

  // ---- Ajahn Sumedho ------------------------------------------------------
  {
    text: "To want something that's not present, something you don't have, is suffering.",
    author: "Ajahn Sumedho",
    source: "Remembering Ajahn Chah Weekend talk (2001), Ajahn Pasanno Archive, Abhayagiri Monastery",
    themes: ["suffering-liberation", "wisdom"]
  },
  {
    text: "When I saw Luang Por Chah when he had his stroke, I felt an almost unbearable sense of grief and loss. Then I remembered, 'This is the way it is.'",
    author: "Ajahn Sumedho",
    source: "Remembering Ajahn Chah Weekend talk (2001), Ajahn Pasanno Archive, Abhayagiri Monastery",
    themes: ["impermanence", "letting-go"]
  },
  {
    text: "The mind is like space, there's room in it for everything or nothing.",
    author: "Ajahn Sumedho",
    source: "Now Is the Knowing, \"Happiness, Unhappiness and Nibbana\" (Amaravati Publications)",
    themes: ["silence", "mindfulness"]
  },
  {
    text: "So recognize that it's the attachment that causes the suffering, attaching to conditions and expecting them to be more than what they are.",
    author: "Ajahn Sumedho",
    source: "Now Is the Knowing, \"Happiness, Unhappiness and Nibbana\" (Amaravati Publications)",
    themes: ["letting-go", "suffering-liberation"]
  },

  // ---- Ajahn Brahm --------------------------------------------------------
  {
    text: "Careful patience is the fastest way!",
    author: "Ajahn Brahm",
    source: "Mindfulness, Bliss, and Beyond: A Meditator's Handbook",
    themes: ["simplicity", "wisdom"]
  },
  {
    text: "Silence is so much more productive of wisdom and clarity than thinking.",
    author: "Ajahn Brahm",
    source: "Mindfulness, Bliss, and Beyond: A Meditator's Handbook, \"Silence Is Delightful\"",
    themes: ["silence", "wisdom"]
  },
  {
    text: "It is the high value that one gives to one's own thoughts that is the main obstacle to silent awareness.",
    author: "Ajahn Brahm",
    source: "Mindfulness, Bliss, and Beyond: A Meditator's Handbook",
    themes: ["silence", "mindfulness"]
  },

  // ---- Ajahn Mun Bhuridatta -------------------------------------------
  {
    text: "Virtue — normalcy — is like rock, which is solid and forms the basis of the ground. No matter how much the wind may buffet and blow, rock doesn't waver or flinch.",
    author: "Ajahn Mun Bhuridatta",
    source: "A Heart Released, § 2, trans. Thanissaro Bhikkhu",
    themes: ["wisdom", "simplicity"]
  },
  {
    text: "An unconfused person doesn't have to look for anything. Only a confused person has to go looking. The more he goes looking, the further he gets lost.",
    author: "Ajahn Mun Bhuridatta",
    source: "A Heart Released, § 1, trans. Thanissaro Bhikkhu",
    themes: ["wisdom", "contentment"]
  },
  {
    text: "When a leaf grows yellow and falls from the tree, for instance, it's showing you the truth of inconstancy.",
    author: "Ajahn Mun Bhuridatta",
    source: "A Heart Released, § 8, \"The Ever-present Truth,\" trans. Thanissaro Bhikkhu",
    themes: ["impermanence", "wisdom"]
  },

  // ---- Ajahn Lee Dhammadharo -------------------------------------------
  {
    text: "You have to make the Dhamma your life, and your life into Dhamma if you want to succeed.",
    author: "Ajahn Lee Dhammadharo",
    source: "Food for Thought: Eighteen Talks on the Training of the Heart, \"First Things First,\" trans. Thanissaro Bhikkhu",
    themes: ["wisdom", "simplicity"]
  },
  {
    text: "Stick to your duties as you always have. Don't let your goodness suffer because of these eight ways of the world.",
    author: "Ajahn Lee Dhammadharo",
    source: "Food for Thought: Eighteen Talks on the Training of the Heart, \"First Things First,\" trans. Thanissaro Bhikkhu",
    themes: ["humility", "wisdom"]
  },
  {
    text: "So no matter how good or bad other people may be, we don't store it up in our mind to give rise to feelings of like or dislike. Dismiss it completely as being their business and none of ours.",
    author: "Ajahn Lee Dhammadharo",
    source: "Inner Strength & Parting Gifts: Talks by Ajaan Lee Dhammadharo, \"The Last Sermon,\" trans. Thanissaro Bhikkhu",
    themes: ["letting-go", "wisdom"]
  },

  // ---- Mahasi Sayadaw -----------------------------------------------------
  {
    text: "As ultimate reality emerges, concepts submerge. As concepts emerge, ultimate reality submerges.",
    author: "Mahasi Sayadaw",
    source: "Manual of Insight",
    themes: ["wisdom", "mindfulness"]
  },
  {
    text: "The practice of Vipassana, or insight meditation, was described by the Buddha as the direct way for the overcoming of sorrow and grief and for realizing Nibbana, the state of perfect liberation from suffering.",
    author: "Mahasi Sayadaw",
    source: "Practical Insight Meditation: Basic and Progressive Stages",
    themes: ["suffering-liberation", "wisdom"]
  },
  {
    text: "Sufferings of this nature are not overcome by material means; they can be overcome only mind training and mental development.",
    author: "Mahasi Sayadaw",
    source: "Practical Insight Meditation: Basic and Progressive Stages, Preface",
    themes: ["suffering-liberation", "wisdom"]
  },

  // ---- Sayadaw U Tejaniya --------------------------------------------------
  {
    text: "Wanting to understand is wisdom, wanting a result is greed.",
    author: "Sayadaw U Tejaniya",
    source: "\"The Wise Investigator,\" interview in Tricycle magazine, Winter 2007",
    themes: ["wisdom", "mindfulness"]
  },
  {
    text: "It's not the posture that's meditating; it's the mind.",
    author: "Sayadaw U Tejaniya",
    source: "\"The Wise Investigator,\" interview in Tricycle magazine, Winter 2007",
    themes: ["mindfulness", "simplicity"]
  },
  {
    text: "Awareness alone is not enough! Having a desire to really understand what is going on is much more important than just trying to be aware.",
    author: "Sayadaw U Tejaniya",
    source: "Awareness Alone Is Not Enough",
    themes: ["wisdom", "mindfulness"]
  },

  // ---- Thanissaro Bhikkhu ---------------------------------------------------
  {
    text: "So the Buddhist attitude toward life cultivates samvega — a clear acceptance of the meaninglessness of the cycle of birth, aging, and death — and develops it into pasada: a confident path to the Deathless.",
    author: "Thanissaro Bhikkhu",
    source: "\"Affirming the Truths of the Heart: The Buddhist Teachings on Samvega & Pasada,\" in Noble Strategy: Essays on the Buddhist Path (1997)",
    themes: ["wisdom", "suffering-liberation"]
  },

  // ---- Bhikkhu Bodhi ---------------------------------------------------------
  {
    text: "For real security always lies on the side of truth, not on the side of comfort.",
    author: "Bhikkhu Bodhi",
    source: "The Noble Eightfold Path: The Way to the End of Suffering, Ch. III, \"Right Intention\"",
    themes: ["wisdom", "letting-go"]
  },

  // ---- Thich Nhat Hanh -----------------------------------------------------
  {
    text: "The present moment is the only moment available to us, and it is the door to all moments.",
    author: "Thich Nhat Hanh",
    source: "Peace Is Every Step",
    themes: ["mindfulness", "ordinary-life"]
  },
  {
    text: "Walk as if you are kissing the Earth with your feet.",
    author: "Thich Nhat Hanh",
    source: "Peace Is Every Step",
    themes: ["mindfulness", "ordinary-life", "gratitude"]
  },
  {
    text: "Because you are alive, everything is possible.",
    author: "Thich Nhat Hanh",
    source: "Being Peace",
    themes: ["gratitude", "contentment"]
  },
  {
    text: "The most precious gift we can offer others is our presence.",
    author: "Thich Nhat Hanh",
    source: "Peace Is Every Step",
    themes: ["compassion", "mindfulness"]
  },
  {
    text: "People have a hard time letting go of their suffering. Out of a fear of the unknown, they prefer suffering that is familiar.",
    author: "Thich Nhat Hanh",
    source: "Peace Is Every Step",
    themes: ["suffering-liberation", "letting-go"]
  },
  {
    text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
    author: "Thich Nhat Hanh",
    source: "Being Peace",
    themes: ["mindfulness", "impermanence"]
  },
  {
    text: "Every breath we take, every step we make, can be filled with peace, joy, and serenity.",
    author: "Thich Nhat Hanh",
    source: "Peace Is Every Step",
    themes: ["ordinary-life", "contentment"]
  },
  {
    text: "Breathing in, I calm body and mind. Breathing out, I smile.",
    author: "Thich Nhat Hanh",
    source: "Present Moment Wonderful Moment",
    themes: ["mindfulness", "simplicity"]
  },
  {
    text: "There are two ways to wash the dishes. The first is to wash the dishes in order to have clean dishes and the second is to wash the dishes in order to wash the dishes.",
    author: "Thich Nhat Hanh",
    source: "The Miracle of Mindfulness: An Introduction to the Practice of Meditation",
    themes: ["mindfulness", "ordinary-life"]
  },

  // ---- Ajahn Buddhadasa -------------------------------------------------------
  {
    text: "Things are more dangerous than fire because we can at least see a fire blazing away and so don't go too close to it, whereas all things are a fire we can't see.",
    author: "Ajahn Buddhadasa",
    source: "Handbook for Mankind, Ch. 2, \"The True Nature of Things,\" trans. Ariyananda Bhikkhu (Roderick S. Bucknell)",
    themes: ["wisdom", "letting-go"]
  },

  // ---- Ajahn Amaro -------------------------------------------------------------
  {
    text: "It is not like we need to become free. It is a matter of discovering that quality of being that is inherently unhindered and unbounded.",
    author: "Ajahn Amaro",
    source: "Small Boat, Great Mountain: Theravadan Reflections on the Natural Great Perfection, Ch. 1, \"The Search for Freedom\"",
    themes: ["wisdom", "letting-go"]
  },

  // ---- Ajahn Jayasaro -------------------------------------------------------
  {
    text: "It would be a sad thing to put all our hopes for happiness into a future that never arrives.",
    author: "Ajahn Jayasaro",
    source: "Without and Within: Questions and Answers on the Teachings of Theravāda Buddhism",
    themes: ["contentment", "wisdom"]
  },

  // ---- Ajahn Sucitto -------------------------------------------------------
  {
    text: "Letting go is about gaining ease and clarity – and because of these one consequently doesn't need a whole lot of stuff to lift the heart.",
    author: "Ajahn Sucitto",
    source: "Meditation: A Way of Awakening, \"Preliminaries — Three Basic Attitudes for Meditation,\" Cittaviveka",
    themes: ["letting-go", "simplicity", "contentment"]
  },

  // ---- Bhante Henepola Gunaratana ---------------------------------------------
  {
    text: "What we face every day is unpredictable. Things happen due to multiple causes and conditions, since we live in a conditional and impermanent world. Mindfulness is our emergency kit, readily available at any time.",
    author: "Bhante Henepola Gunaratana",
    source: "Mindfulness in Plain English, Ch. 5, \"The Practice\"",
    themes: ["impermanence", "mindfulness"]
  },

  // ---- Nyanaponika Thera ---------------------------------------------------
  {
    text: "Mind is the very element in and through which we live, yet it is what is most elusive and mysterious. Bare Attention, however, by first attending patiently to the basic facts of the mental processes, is capable of shedding light on mind's mysterious darkness, and of obtaining a firm hold on its elusive flow.",
    author: "Nyanaponika Thera",
    source: "The Heart of Buddhist Meditation, Ch. 2, \"Mindfulness and Clear Comprehension\" (Buddhist Publication Society)",
    themes: ["mindfulness", "wisdom"]
  },

  // ---- Bhikkhu Analayo ---------------------------------------------------
  {
    text: "In the end, however, all four satipaṭṭhānas partake of the same essence. Each of them leads to realisation, like different gateways leading to the same city.",
    author: "Bhikkhu Analayo",
    source: "Satipaṭṭhāna: The Direct Path to Realization",
    themes: ["mindfulness", "wisdom"]
  },

  // ---- Jetsunma Tenzin Palmo ---------------------------------------------
  {
    text: "Do you see? It's not what you own that is the problem. The problem is how much you are attached to it. The problem is not so much desire, but clinging. If you want to hold water, you have to hold it with cupped hands. If you make a tight fist, it runs away. Clinging and attachment bring us great suffering. We think attachment is love, but it is not.",
    author: "Jetsunma Tenzin Palmo",
    source: "Reflections on a Mountain Lake",
    themes: ["letting-go", "simplicity"]
  },

  // ---- Pema Chödrön ---------------------------------------------------------
  {
    text: "To stay with that shakiness—to stay with a broken heart, with a rumbling stomach, with the feeling of hopelessness and wanting to get revenge—that is the path of true awakening. Sticking with that uncertainty, getting the knack of relaxing in the midst of chaos, learning not to panic—this is the spiritual path.",
    author: "Pema Chödrön",
    source: "When Things Fall Apart: Heart Advice for Difficult Times",
    themes: ["suffering-liberation", "letting-go"]
  },
  {
    text: "Underneath our ordinary lives, underneath all the talking we do, all the moving we do, all the thoughts in our minds, there's a fundamental groundlessness.",
    author: "Pema Chödrön",
    source: "When Things Fall Apart: Heart Advice for Difficult Times",
    themes: ["wisdom", "impermanence"]
  },

  // ---- Yongey Mingyur Rinpoche -------------------------------------------
  {
    text: "Confusion, I was taught, is the beginning of understanding, the first stage of letting go of the neuronal gossip that used to keep you chained to very specific ideas about who you are and what you're capable of.",
    author: "Yongey Mingyur Rinpoche",
    source: "The Joy of Living: Unlocking the Secret and Science of Happiness",
    themes: ["letting-go", "wisdom"]
  },

  // ---- Patrul Rinpoche -----------------------------------------------------
  {
    text: "There is not a single being in samsara, this immense ocean of suffering, who in the course of time without beginning has never been our father or mother.",
    author: "Patrul Rinpoche",
    source: "The Words of My Perfect Teacher, trans. Padmakara Translation Group",
    themes: ["compassion"]
  },

  // ---- Japanese Zen Masters -----------------------------------------------
  {
    text: "In the beginner's mind there are many possibilities, but in the expert's there are few.",
    author: "Shunryu Suzuki",
    source: "Zen Mind, Beginner's Mind (1970)",
    themes: ["simplicity", "humility", "wisdom"]
  },
  {
    text: "Doing something is expressing our own nature. We do not exist for the sake of something else. We exist for the sake of ourselves.",
    author: "Shunryu Suzuki",
    source: "Zen Mind, Beginner's Mind (1970), \"Posture\"",
    themes: ["simplicity", "ordinary-life"]
  },
  {
    text: "Shikantaza, our zazen, is just to be ourselves. When we do not expect anything we can be ourselves.",
    author: "Shunryu Suzuki",
    source: "Not Always So: Practicing the True Spirit of Zen, \"Shikantaza: Living Fully in Each Moment\"",
    themes: ["mindfulness", "contentment"]
  },
  {
    text: "To study the buddha way is to study the self. To study the self is to forget the self. To forget the self is to be actualized by myriad things.",
    author: "Dogen",
    source: "Shobogenzo, \"Genjokoan,\" in Moon in a Dewdrop, trans. Robert Aitken and Kazuaki Tanahashi",
    themes: ["wisdom", "letting-go"]
  },
  {
    text: "You should therefore cease from practice based on intellectual understanding, pursuing words and following after speech, and learn the backward step that turns your light inward to illuminate your self. Body and mind will drop away of themselves, and your original face will manifest itself.",
    author: "Dogen",
    source: "Fukanzazengi (\"Universal Recommendation for Zazen\"), trans. Norman Waddell and Abe Masao, The Eastern Buddhist, New Series 6, no. 2 (1973)",
    themes: ["mindfulness", "letting-go"]
  },
  {
    text: "So-called great mind is, in its spirit, like a great mountain or a great sea: it has no partiality and no factionalism.",
    author: "Dogen",
    source: "Tenzo Kyokun (\"Instructions for the Cook\"), trans. Griffith Foulk, in Nothing Is Hidden: Essays on Zen Master Dogen's Instructions for the Cook (Weatherhill, 2001)",
    themes: ["wisdom", "contentment"]
  },
  {
    text: "All beings by nature are Buddha, as ice by nature is water. Apart from water there is no ice; apart from beings, no Buddha.",
    author: "Hakuin Ekaku",
    source: "Song of Zazen (Zazen Wasan), trans. D.T. Suzuki, Manual of Zen Buddhism",
    themes: ["wisdom", "suffering-liberation"]
  },
  {
    text: "Not a single one of you people at this meeting is unenlightened. Right now, you're all sitting before me as Buddhas. Each of you received the Buddha-mind from your mothers when you were born, and nothing else.",
    author: "Bankei Yōtaku",
    source: "The Unborn: The Life and Teachings of Zen Master Bankei, 1622–1693, trans. Norman Waddell, \"The Ryumon-ji Sermons\"",
    themes: ["wisdom", "ordinary-life"]
  },
  {
    text: "In the world, it's always about winning or losing, plus or minus. Yet in Zazen, it's about nothing. It's good for nothing. That's why it is the greatest and most all-inclusive thing there is.",
    author: "Kōdō Sawaki",
    source: "To You: Zen Sayings of Kodo Sawaki, trans. Jesse Haasch and Muhō Nölke",
    themes: ["letting-go", "simplicity"]
  },
  {
    text: "Left behind by the thief— / The moon / In the window.",
    author: "Ryōkan",
    source: "Dewdrops on a Lotus Leaf: Zen Poems of Ryokan, trans. John Stevens",
    themes: ["letting-go", "simplicity"]
  },

  // ---- Joseph Goldstein -----------------------------------------------------
  {
    text: "The practice has become that simple: not-clinging, and then moments of recognizing clinging, and then not-clinging, and so on.",
    author: "Joseph Goldstein",
    source: "\"One Dharma, The Emerging Western Buddhism,\" interview in Inquiring Mind, Vol. 18 No. 2, Spring 2002",
    themes: ["simplicity", "mindfulness"]
  },

  // ---- Jack Kornfield -----------------------------------------------------
  {
    text: "Nirvana appears when we let go, when we live in the reality of the present. Sorrow arises when the mind and heart are caught in greed, hatred, and delusion. Nirvana appears in their absence.",
    author: "Jack Kornfield",
    source: "\"The Wise Heart,\" interview in Tricycle magazine, Summer 2008",
    themes: ["letting-go", "suffering-liberation"]
  },

  // ---- Sharon Salzberg -----------------------------------------------------
  {
    text: "While we might think of love as a feeling, we can also think of it as an ability.",
    author: "Sharon Salzberg",
    source: "Real Love: The Art of Mindful Connection, as discussed in \"The Power of Real Love,\" Lion's Roar, Nov 4, 2017",
    themes: ["compassion", "wisdom"]
  },

  // ---- Taigen Dan Leighton -----------------------------------------------------
  {
    text: "The point is not to get rid of anger, nor to harbor ill will, but to own it, to pay attention to it patiently when it arises.",
    author: "Taigen Dan Leighton",
    source: "\"A Kind of Performance Art,\" interview in Inquiring Mind, Vol. 28 No. 1, Fall 2011",
    themes: ["compassion", "mindfulness"]
  },

  // ---- Norman Fischer -----------------------------------------------------
  {
    text: "Beyond any hurt, beyond any deed, this big forgiveness pervades all.",
    author: "Norman Fischer",
    source: "Sailing Home: Using the Wisdom of Homer's Odyssey to Navigate Life's Perils and Pitfalls",
    themes: ["compassion", "letting-go"]
  },

  // ---- Charlotte Joko Beck -----------------------------------------------------
  {
    text: "Attention or awareness is the secret of life and the heart of practice.",
    author: "Charlotte Joko Beck",
    source: "Nothing Special: Living Zen, excerpted as \"Attention Means Attention,\" Tricycle, Fall 1993",
    themes: ["mindfulness", "simplicity"]
  },

  // ---- Seung Sahn -----------------------------------------------------
  {
    text: "If you cut off all thinking and keep this mind, 'How can I help?' the correct action will appear. That is great love, great compassion, and great bodhisattva way.",
    author: "Seung Sahn",
    source: "Only Don't Know: Selected Teaching Letters of Zen Master Seung Sahn",
    themes: ["compassion", "wisdom"]
  },

  // ---- Gil Fronsdal -----------------------------------------------------
  {
    text: "When settled on the breath, the heart becomes clear, peaceful, and still. Then, like a mountain pool, the heart begins to reflect all that is around it.",
    author: "Gil Fronsdal",
    source: "\"How Mindfulness Works When Not Working,\" talk adapted for the Insight Meditation Center, Jan 1, 2001",
    themes: ["mindfulness", "contentment"]
  },

  // ---- B. Alan Wallace -----------------------------------------------------
  {
    text: "When attention is impaired, it detracts from everything we do, and when it is well focused, it enhances everything we do.",
    author: "B. Alan Wallace",
    source: "The Attention Revolution: Unlocking the Power of the Focused Mind, Preface",
    themes: ["mindfulness", "wisdom"]
  },

  // ---- Matthieu Ricard -----------------------------------------------------
  {
    text: "I think the best definition, according to the Buddhist view, is that well-being is not just a mere pleasurable sensation. It is a deep sense of serenity and fulfillment.",
    author: "Matthieu Ricard",
    source: "\"The Habits of Happiness,\" TED2004",
    themes: ["contentment", "wisdom"]
  },

  // ---- Khenpo Tsultrim Gyamtso Rinpoche -----------------------------------------------------
  {
    text: "See that thoughts of fear neither come nor go. See that thoughts of fear neither arise nor cease. Then look at the essence beyond coming and going, beyond arising and ceasing; look at this essence and let go and relax.",
    author: "Khenpo Tsultrim Gyamtso Rinpoche",
    source: "\"See the True Nature, then Let Go and Relax in That,\" interview with Melvin McLeod, Buddhadharma, 2004, trans. Ari Goldfield",
    themes: ["letting-go", "suffering-liberation"]
  },

  // ---- Marcus Aurelius -------------------------------------------------
  {
    text: "Waste no more time arguing about what a good man should be. Be one.",
    author: "Marcus Aurelius",
    source: "Meditations, Book 10.16, trans. Gregory Hays",
    themes: ["wisdom", "simplicity"]
  },
  {
    text: "Confine yourself to the present.",
    author: "Marcus Aurelius",
    source: "Meditations, Book 8.36",
    themes: ["mindfulness", "letting-go"]
  },
  {
    text: "Loss is nothing else but change, and change is Nature's delight.",
    author: "Marcus Aurelius",
    source: "Meditations, Book 9.35",
    themes: ["impermanence", "letting-go"]
  },
  {
    text: "Choose not to be harmed—and you won't feel harmed. Don't feel harmed—and you haven't been.",
    author: "Marcus Aurelius",
    source: "Meditations, Book 4.7, trans. Gregory Hays",
    themes: ["letting-go", "wisdom"]
  },
  {
    text: "Nowhere you can go is more peaceful—more free of interruptions—than your own soul.",
    author: "Marcus Aurelius",
    source: "Meditations, Book 4.3, trans. Gregory Hays",
    themes: ["mindfulness", "simplicity"]
  },

  // ---- Epictetus ---------------------------------------------------------
  {
    text: "Men are disturbed, not by things, but by the principles and notions which they form concerning things.",
    author: "Epictetus",
    source: "Enchiridion, Ch. 5, trans. Elizabeth Carter",
    themes: ["wisdom", "letting-go"]
  },
  {
    text: "Some things are within our power, while others are not.",
    author: "Epictetus",
    source: "Enchiridion, Ch. 1",
    themes: ["wisdom", "contentment"]
  },
  {
    text: "Seek not that the things which happen should happen as you wish; but wish the things which happen to be as they are, and you will have a tranquil flow of life.",
    author: "Epictetus",
    source: "Enchiridion, Ch. VIII, trans. George Long",
    themes: ["contentment", "letting-go"]
  },
  {
    text: "Be not elated at any advantage which belongs to another. What then is your own? The use of appearances.",
    author: "Epictetus",
    source: "Enchiridion, Ch. VI, trans. George Long",
    themes: ["humility", "wisdom"]
  },

  // ---- Mary Oliver ---------------------------------------------------------
  {
    text: "Tell me, what is it you plan to do with your one wild and precious life?",
    author: "Mary Oliver",
    source: "\"The Summer Day,\" House of Light (1990)",
    themes: ["ordinary-life", "gratitude"]
  },
  {
    text: "You do not have to be good. You do not have to walk on your knees for a hundred miles through the desert, repenting.",
    author: "Mary Oliver",
    source: "\"Wild Geese,\" Dream Work (1986)",
    themes: ["compassion", "letting-go", "humility"]
  },

  // ---- Simone Weil -------------------------------------------------------
  {
    text: "Attention is the rarest and purest form of generosity.",
    author: "Simone Weil",
    source: "Letter to Joë Bousquet, 13 April 1942",
    themes: ["compassion", "mindfulness"]
  },
  {
    text: "The love of our neighbor in all its fullness simply means being able to say to him: 'What are you going through?'",
    author: "Simone Weil",
    source: "Waiting for God",
    themes: ["compassion", "humility"]
  },
  {
    text: "Attention, taken to its highest degree, is the same thing as prayer. It presupposes faith and love.",
    author: "Simone Weil",
    source: "Gravity and Grace, \"Attention and Will,\" trans. Emma Crawford",
    themes: ["silence", "mindfulness"]
  },
  {
    text: "When I am in any place, I disturb the silence of heaven and earth by my breathing and the beating of my heart.",
    author: "Simone Weil",
    source: "Gravity and Grace, \"Decreation,\" trans. Emma Crawford",
    themes: ["humility", "silence"]
  },

  // ---- Viktor Frankl -----------------------------------------------------
  {
    text: "We who lived in concentration camps can remember the men who walked through the huts comforting others, giving away their last piece of bread. They may have been few in number, but they offer sufficient proof that everything can be taken from a man but one thing: the last of the human freedoms—to choose one's attitude in any given set of circumstances, to choose one's own way.",
    author: "Viktor Frankl",
    source: "Man's Search for Meaning, Part One, \"Experiences in a Concentration Camp\"",
    themes: ["suffering-liberation", "wisdom"]
  },

  // ---- Sam Harris ----------------------------------------------------------
  {
    text: "There is now little question that how one uses one's attention, moment to moment, largely determines what kind of person one becomes.",
    author: "Sam Harris",
    source: "Waking Up: A Guide to Spirituality Without Religion (2014)",
    themes: ["mindfulness", "wisdom"]
  },
  {
    text: "Consciousness is simply the light by which the contours of mind and body are known.",
    author: "Sam Harris",
    source: "Waking Up: A Guide to Spirituality Without Religion (2014)",
    themes: ["mindfulness", "wisdom"]
  }
];

// Belt-and-braces: `const` at the top level of a classic script is a global
// lexical binding and never lands on window. render-quotes.js reads QUOTES
// directly, so this is not required — it just makes the list reachable from
// the console when debugging.
if (typeof window !== "undefined") {
  window.QUOTES = QUOTES;
}

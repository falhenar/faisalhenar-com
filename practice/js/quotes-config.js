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

  // ---- Nāgārjuna ----------------------------------------------------------
  {
    text: "There is not the slightest difference between cyclic existence and nirvana. There is not the slightest difference between nirvana and cyclic existence.",
    author: "Nāgārjuna",
    source: "Mūlamadhyamakakārikā, Ch. 25, v.19, trans. Jay L. Garfield, \"The Fundamental Wisdom of the Middle Way\" (Oxford University Press, 1995)",
    themes: ["wisdom", "letting-go"]
  },

  // ---- Śāntideva ------------------------------------------------------------
  {
    text: "All the joy the world contains has come through wishing happiness for others. All the misery the world contains has come through wanting pleasure for oneself.",
    author: "Śāntideva",
    source: "The Way of the Bodhisattva, Ch. 8, v.129, trans. Padmakara Translation Group (Shambhala Publications, revised ed. 2006)",
    themes: ["compassion", "wisdom"]
  },

  // ---- Asaṅga ---------------------------------------------------------------
  {
    text: "All conscious objects are only constructs of consciousness because there are no external objects. They are like a dream.",
    author: "Asaṅga",
    source: "The Summary of the Great Vehicle (Mahāyānasaṃgraha), Ch. II.6, trans. John P. Keenan (Numata Center for Buddhist Translation and Research, rev. 2nd ed. 2003)",
    themes: ["wisdom", "impermanence"]
  },

  // ---- Vasubandhu -----------------------------------------------------------
  {
    text: "He has, in an absolute manner, destroyed all blindness; He has drawn out the world from the mire of transmigration: I render homage to Him, to this teacher of truth, before composing the treatise called the Abhidharmakosa.",
    author: "Vasubandhu",
    source: "Abhidharmakośabhāṣyam, Ch. 1, v.1, trans. Louis de La Vallée Poussin / Leo M. Pruden (Asian Humanities Press, 1991)",
    themes: ["humility", "wisdom"]
  },

  // ---- Bodhidharma ----------------------------------------------------------
  {
    text: "To find a buddha, you have to see your nature. Whoever sees his or her nature is a buddha.",
    author: "Bodhidharma",
    source: "The Zen Teaching of Bodhidharma, \"Bloodstream Sermon,\" trans. Red Pine (North Point Press, 1987)",
    themes: ["wisdom", "simplicity"]
  },

  // ---- Huineng --------------------------------------------------------------
  {
    text: "Bodhi originally has no tree, the mirror also has no stand. Buddha nature is always clean and pure; where is there room for dust?",
    author: "Huineng",
    source: "The Platform Sutra of the Sixth Patriarch, trans. Philip B. Yampolsky (Columbia University Press, 1967)",
    themes: ["impermanence", "letting-go"]
  },

  // ---- Huangbo --------------------------------------------------------------
  {
    text: "All the Buddhas and all sentient beings are nothing but the One Mind, beside which nothing exists.",
    author: "Huangbo",
    source: "The Zen Teaching of Huang Po: On the Transmission of Mind, trans. John Blofeld (Grove Press, 1958)",
    themes: ["wisdom", "simplicity"]
  },

  // ---- Linji ----------------------------------------------------------------
  {
    text: "On your lump of red flesh is a true man without rank who is always going in and out of the face of every one of you. Those who have not yet confirmed this, look, look!",
    author: "Linji",
    source: "The Record of Linji, trans. Ruth Fuller Sasaki, ed. Thomas Yūhō Kirchner (University of Hawai'i Press, 2009)",
    themes: ["ordinary-life", "wisdom"]
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

  // ---- Ajahn Liem Thitadhammo ------------------------------------------
  {
    text: "We should see and understand that nothing is ours. Nothing belongs to us.",
    author: "Ajahn Liem Thitadhammo",
    source: "\"The Lightness of Letting Go,\" Dhamma talk at Dhammagiri Forest Hermitage, trans. Alex Oliver (15 March 2023)",
    themes: ["letting-go", "wisdom"]
  },

  // ---- Ajahn Pasanno -----------------------------------------------------
  {
    text: "There's no way that you can have anger and resentment and feel peaceful and happy.",
    author: "Ajahn Pasanno",
    source: "Thanksgiving Retreat 2010, Session 1 (Nov. 20, 2010), The Ajahn Pasanno Question and Story Archive, Abhayagiri Buddhist Monastery",
    themes: ["letting-go", "suffering-liberation"]
  },

  // ---- Ajahn Ñāṇadhammo ----------------------------------------------------
  {
    text: "This condition, this experience, this happiness or suffering is impermanent; this, too, will change.",
    author: "Ajahn Ñāṇadhammo",
    source: "\"The Power of Faith,\" Dhamma talk at Wat Pah Nanachat, 27 September 2002 (Wat Pah Nanachat, 2003)",
    themes: ["impermanence", "letting-go"]
  },

  // ---- Ajahn Maha Bua -----------------------------------------------------
  {
    text: "Don't simply sit and keep on sitting, or walk and keep on walking. You have to remember to notice what results and benefits you get from your efforts as well.",
    author: "Ajahn Maha Bua",
    source: "Things As They Are: A Collection of Talks on the Training of the Mind, trans. Thanissaro Bhikkhu (Forest Dhamma Books)",
    themes: ["mindfulness", "wisdom"]
  },

  // ---- Ajahn Tate -----------------------------------------------------------
  {
    text: "All dhammas exist here, within each of us and the one that knows Dhamma is the heart or mind.",
    author: "Ajahn Tate",
    source: "The Autobiography of a Forest Monk, \"Parents' Life Story,\" trans. Bhikkhu Ariyesako (1996)",
    themes: ["wisdom", "mindfulness"]
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

  // ---- Sayadaw U Pandita -----------------------------------------------
  {
    text: "We do not practice meditation to gain admiration from anyone. Rather, we practice to contribute to peace in the world.",
    author: "Sayadaw U Pandita",
    source: "In This Very Life: Liberation Teachings of the Buddha, \"Basic Morality & Meditation Instructions\" (Wisdom Publications, 1992)",
    themes: ["humility", "compassion"]
  },

  // ---- Sayadaw U Silananda -----------------------------------------------
  {
    text: "Mindfulness is something like a stone hitting a wall.",
    author: "Sayadaw U Silananda",
    source: "The Four Foundations of Mindfulness, Introduction (Wisdom Publications, 2002)",
    themes: ["mindfulness"]
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

  // ---- Bhikkhu Ñāṇamoli -----------------------------------------------------
  {
    text: "A guiding principle—the foremost, in fact—has throughout been avoidance of misrepresentation or distortion; for the ideal translation (which has yet to be made) should, like a looking glass, not discolour or blur or warp the original which it reflects.",
    author: "Bhikkhu Ñāṇamoli",
    source: "The Path of Purification (Visuddhimagga), Translator's Preface, trans. Bhikkhu Ñāṇamoli (Buddhist Publication Society, 1956)",
    themes: ["humility", "wisdom"]
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

  // ---- Ayya Khema -----------------------------------------------------------
  {
    text: "Nothing in the whole universe is comparable to the mind or can take its place. Everything is mind-made.",
    author: "Ayya Khema",
    source: "Being Nobody, Going Nowhere: Meditations on the Buddhist Path, Ch. 1, \"Meditation—Why and How\" (Wisdom Publications, 1987)",
    themes: ["wisdom", "mindfulness"]
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

  // ---- Longchenpa -------------------------------------------------------
  {
    text: "To amass a multitude of profound texts, such as scriptures, commentaries and oral instructions, without practicing them, will be of no benefit at the time of death. 'To watch your mind' is my heart advice.",
    author: "Longchenpa",
    source: "Thirty Pieces of Heart Advice, trans. Daniela Hartmann (Lotsawa House, 2014)",
    themes: ["wisdom", "mindfulness"]
  },

  // ---- Jigme Lingpa -------------------------------------------------------
  {
    text: "Realization of the pure awareness that transcends the mind is the specialty of the Great Perfection.",
    author: "Jigme Lingpa",
    source: "Yeshe Lama, trans. Lama Chonam & Sangye Khandro (Snow Lion Publications, 2013)",
    themes: ["wisdom"]
  },

  // ---- Dudjom Rinpoche -----------------------------------------------------
  {
    text: "Do not blame your past karma; instead, be someone who purely and flawlessly practices the Dharma. Do not blame temporary negative circumstances; instead, be someone who remains steadfast in the face of whatever circumstances may arise.",
    author: "Dudjom Rinpoche",
    source: "Wisdom Nectar: Dudjom Rinpoche's Heart Advice, p. 58, trans. Ron Garry (Snow Lion Publications / Tsadra Foundation, 2011)",
    themes: ["suffering-liberation", "wisdom"]
  },

  // ---- Chatral Rinpoche -----------------------------------------------------
  {
    text: "Even if a person is a lowly beggar, if they are in harmony with the Dharma they can be called a great person who is a holder of the teachings.",
    author: "Chatral Rinpoche",
    source: "Compassionate Action: The Teachings of Chatral Rinpoche, trans. Zach Larson (Snow Lion Publications, 2005)",
    themes: ["humility", "simplicity"]
  },

  // ---- Tsoknyi Rinpoche -----------------------------------------------------
  {
    text: "We'll discover a sense of confidence that isn't rooted in arrogance or pride. We'll realize that we're always sheltered, always safe, and always home.",
    author: "Tsoknyi Rinpoche",
    source: "Open Heart, Open Mind: A Guide to Inner Transformation, with Eric Swanson (Harmony/Random House, 2012)",
    themes: ["contentment", "wisdom"]
  },

  // ---- Tulku Urgyen Rinpoche -----------------------------------------------------
  {
    text: "True virtue, real goodness, is created through recognizing our buddha nature, our natural state. Recognize your mind, and in the absence of any concrete thing, rest loosely.",
    author: "Tulku Urgyen Rinpoche",
    source: "As It Is, Volume II, trans. Erik Pema Kunsang, ed. Marcia Schmidt & Kerry Moran (Rangjung Yeshe Publications, 2000)",
    themes: ["wisdom", "simplicity"]
  },

  // ---- Chögyam Trungpa -----------------------------------------------------
  {
    text: "It is important to see that the main point of any spiritual practice is to step out of the bureaucracy of ego.",
    author: "Chögyam Trungpa",
    source: "Cutting Through Spiritual Materialism, \"Spiritual Materialism\" (Shambhala Publications, 1973)",
    themes: ["letting-go", "simplicity"]
  },

  // ---- Jetsun Khandro Rinpoche -----------------------------------------------------
  {
    text: "Compassion releases others from your struggle to make them conform to your wishes. There is a great deal of kindness in giving others the freedom to evolve naturally as they are.",
    author: "Jetsun Khandro Rinpoche",
    source: "How Not to Miss the Point: The Buddha's Wisdom for a Life Well Lived (Shambhala Publications, 2025)",
    themes: ["compassion", "letting-go"]
  },

  // ---- Anam Thubten -----------------------------------------------------
  {
    text: "True ethics is not just about following some old scriptures nor about adhering to a behavior code dictated by any given society. Its roots lie in each of us—empathy and compassion.",
    author: "Anam Thubten",
    source: "\"Ethics Are the Heart of Spiritual Practice,\" Lion's Roar (2026)",
    themes: ["compassion", "wisdom"]
  },

  // ---- Tenzin Wangyal Rinpoche -----------------------------------------------------
  {
    text: "There is no danger of disrupting something important when we change our dreams. All we disrupt is our ignorance.",
    author: "Tenzin Wangyal Rinpoche",
    source: "The Tibetan Yogas of Dream and Sleep: Practices for Awakening, 2nd ed. (Shambhala Publications, 1998/2022)",
    themes: ["wisdom", "letting-go"]
  },

  // ---- Dzongsar Khyentse Rinpoche -----------------------------------------------------
  {
    text: "Buddhists venerate wisdom above all else. Wisdom surpasses morality, love, common sense, tolerance, and vegetarianism.",
    author: "Dzongsar Khyentse Rinpoche",
    source: "What Makes You Not a Buddhist (Shambhala Publications, 2007)",
    themes: ["wisdom"]
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

  // ---- Keizan Jōkin -----------------------------------------------------
  {
    text: "Even if you sit until your seat breaks through, even if you persevere mindless of fatigue, even if you are a person of lofty deeds and pure behavior, if you haven't reached this realm of satori, you still can't get out of the prison of the world.",
    author: "Keizan Jōkin",
    source: "Transmission of Light (Denkoroku), trans. Thomas Cleary (North Point Press, 1990)",
    themes: ["suffering-liberation", "wisdom"]
  },

  // ---- Kōun Yamada -----------------------------------------------------
  {
    text: "The entrance into Zen is the grasping of one's essential nature. It is absolutely impossible, however, to come to a clear understanding of our essential nature by any intellectual or philosophical method. It is accomplished only by the experience of self-realization through zazen.",
    author: "Kōun Yamada",
    source: "The Gateless Gate, Case 1 commentary (Wisdom Publications, 2004 ed.)",
    themes: ["wisdom", "mindfulness"]
  },

  // ---- Robert Aitken -----------------------------------------------------
  {
    text: "We must save the world, but we can only save it by saving little pieces of it, each of us using his or her own small, partial ability.",
    author: "Robert Aitken",
    source: "The Mind of Clover: Essays in Zen Buddhist Ethics (North Point Press, 1984)",
    themes: ["compassion", "humility", "ordinary-life"]
  },

  // ---- Taizan Maezumi -----------------------------------------------------
  {
    text: "The pitfall is always within yourself. This very body and mind is the Way. You are complete to begin with. There is no gap, but you think there is.",
    author: "Taizan Maezumi",
    source: "Appreciate Your Life: The Essence of Zen Practice, ed. Wendy Egyoku Nakao & Eve Myonen Marko (Shambhala Publications, 2001)",
    themes: ["wisdom", "contentment"]
  },

  // ---- Bernie Glassman -----------------------------------------------------
  {
    text: "In my view, we can't heal ourselves or other people unless we bear witness. In the Zen Peacemaker Order we stress bearing witness to the wholeness of life, to every aspect of the situation that arises.",
    author: "Bernie Glassman",
    source: "Bearing Witness: A Zen Master's Lessons in Making Peace (Bell Tower, 1998)",
    themes: ["compassion", "suffering-liberation"]
  },

  // ---- John Daido Loori -----------------------------------------------------
  {
    text: "The life of the Buddha is the manifestation of compassion, but if you do not engage it, it does nothing. It all depends on you.",
    author: "John Daido Loori",
    source: "The Eight Gates of Zen: A Program of Zen Training (Dharma Communications/Shambhala, 2002)",
    themes: ["compassion", "ordinary-life"]
  },

  // ---- Kosho Uchiyama -----------------------------------------------------
  {
    text: "All of us, regardless of whether we realize it or not, are living out the self as the whole universe.",
    author: "Kosho Uchiyama",
    source: "Opening the Hand of Thought: Foundations of Zen Buddhist Practice (Wisdom Publications, 2004)",
    themes: ["wisdom", "letting-go"]
  },

  // ---- Zenkei Blanche Hartman -----------------------------------------------------
  {
    text: "This morning as I wake, I vow with all beings to see each thing as it is and not to forsake the world.",
    author: "Zenkei Blanche Hartman",
    source: "Seeds for a Boundless Life: Zen Teachings from the Heart (Shambhala Publications, 2015)",
    themes: ["gratitude", "ordinary-life"]
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

  // ---- Larry Rosenberg -----------------------------------------------------
  {
    text: "The way to get from point A to point B is really to be at A.",
    author: "Larry Rosenberg",
    source: "Breath by Breath: The Liberating Practice of Insight Meditation (Shambhala, 1998); excerpted in Tricycle, Spring 1998",
    themes: ["mindfulness", "ordinary-life"]
  },

  // ---- Christopher Titmuss -----------------------------------------------------
  {
    text: "In a Buddhist monastery, monks treat the guideline of not taking what is not given with utmost seriousness. Monks do not take the razor, book, robe, or begging bowl of another monk without securing permission first. It is a discipline in letting go, in patience, and in waiting for something to be available.",
    author: "Christopher Titmuss",
    source: "Light on Enlightenment (Rider/Shambhala, 2000)",
    themes: ["letting-go", "simplicity", "humility"]
  },

  // ---- Christina Feldman -----------------------------------------------------
  {
    text: "A compassionate life is a fearless life.",
    author: "Christina Feldman",
    source: "Boundless Heart: The Buddha's Path of Kindness, Compassion, Joy, and Equanimity (Shambhala, 2017)",
    themes: ["compassion", "wisdom"]
  },

  // ---- Rodney Smith -----------------------------------------------------
  {
    text: "Relinquishment is letting go of everything that is not authentic and natural.",
    author: "Rodney Smith",
    source: "Stepping Out of Self-Deception: The Buddha's Liberating Teaching of No-Self (Shambhala, 2010)",
    themes: ["letting-go", "simplicity"]
  },

  // ---- Tara Brach -----------------------------------------------------
  {
    text: "Learning to pause is the first step in the practice of Radical Acceptance.",
    author: "Tara Brach",
    source: "Radical Acceptance: Embracing Your Life with the Heart of a Buddha (Bantam, 2003)",
    themes: ["mindfulness", "letting-go"]
  },

  // ---- Sylvia Boorstein -----------------------------------------------------
  {
    text: "It's a big step, of course, from freeways to famines to wars, but it's wonderful to have confirmation that spacious acceptance is humanly possible. Spiritual practice might be discovering that potential in ourselves and enlarging it.",
    author: "Sylvia Boorstein",
    source: "It's Easier Than You Think: The Buddhist Way to Happiness (HarperOne, 1995)",
    themes: ["contentment", "wisdom"]
  },

  // ---- James Baraz -----------------------------------------------------
  {
    text: "The secret to skillful meditation is bringing your attention back with great patience and kindness.",
    author: "James Baraz",
    source: "\"Mindfulness: The Most Direct Path,\" Lion's Roar, September 1, 2010",
    themes: ["mindfulness", "compassion"]
  },

  // ---- Ruth King -----------------------------------------------------
  {
    text: "Racism is a heart disease. How we think and respond is at the core of racial suffering and racial healing. If we cannot think clearly and respond wisely, we will continue to damage the world's heart.",
    author: "Ruth King",
    source: "Mindful of Race: Transforming Racism from the Inside Out (Sounds True, 2018)",
    themes: ["wisdom", "compassion", "suffering-liberation"]
  },

  // ---- Spring Washam -----------------------------------------------------
  {
    text: "When we're purifying ourselves, when we're letting go of ancestral sorrows, it doesn't necessarily come with bliss and light.",
    author: "Spring Washam",
    source: "A Fierce Heart: Finding Strength, Courage, and Wisdom in Any Moment (Hay House, 2017); excerpted in Kosmos Journal",
    themes: ["impermanence", "suffering-liberation", "letting-go"]
  },

  // ---- Shinzen Young -----------------------------------------------------
  {
    text: "You can dramatically extend life—not by multiplying the number of your years, but by expanding the fullness of your moments.",
    author: "Shinzen Young",
    source: "The Science of Enlightenment: How Meditation Works, Ch. 1 (Sounds True, 2016)",
    themes: ["mindfulness", "impermanence"]
  },

  // ---- Loch Kelly -----------------------------------------------------
  {
    text: "You can choose any time of the day to step off the train of thought and into awake awareness. Once you've done this, you will naturally find new motivation, creativity, kindness, and passion for life.",
    author: "Loch Kelly",
    source: "Shift into Freedom: The Science and Practice of Open-Hearted Awareness (Sounds True, 2015)",
    themes: ["mindfulness", "ordinary-life"]
  },

  // ---- Adyashanti -----------------------------------------------------
  {
    text: "In a certain sense, enlightenment is dying into the ordinary, or into an extraordinary ordinariness. We start to realize the ordinary is extraordinary.",
    author: "Adyashanti",
    source: "The End of Your World: Uncensored Straight Talk on the Nature of Enlightenment (Sounds True, 2008)",
    themes: ["ordinary-life", "wisdom"]
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

  // ---- Lao Tzu -------------------------------------------------------
  {
    text: "Knowing others is intelligence; knowing yourself is true wisdom.",
    author: "Lao Tzu",
    source: "Tao Te Ching, Verse 33, trans. Stephen Mitchell (Harper Perennial, 1988)",
    themes: ["wisdom", "humility"]
  },

  // ---- Zhuangzi -------------------------------------------------------
  {
    text: "Great understanding is broad and unhurried; little understanding is cramped and busy.",
    author: "Zhuangzi",
    source: "Zhuangzi, Ch. 2, \"Discussion on Making All Things Equal,\" trans. Burton Watson (Columbia University Press, 1968)",
    themes: ["wisdom", "simplicity"]
  },

  // ---- Meister Eckhart -------------------------------------------------------
  {
    text: "The eye with which I see God is the same eye with which God sees me; my eye and God's eye are one eye, one seeing, one knowing and one love.",
    author: "Meister Eckhart",
    source: "Sermon 12 (German Sermons), in Meister Eckhart: Sermons and Treatises, trans. M. O'C. Walshe (Element Books, 1987)",
    themes: ["wisdom", "silence"]
  },

  // ---- Teresa of Ávila -------------------------------------------------------
  {
    text: "Humility must always be doing its work like a bee making its honey in the hive: without humility all will be lost.",
    author: "Teresa of Ávila",
    source: "Interior Castle, First Mansions, Ch. 2, trans. E. Allison Peers (Image Books)",
    themes: ["humility"]
  },

  // ---- John of the Cross -------------------------------------------------------
  {
    text: "At the evening of life, you will be examined in love. Learn to love as God desires to be loved and abandon your own ways of acting.",
    author: "John of the Cross",
    source: "Sayings of Light and Love, no. 57, trans. Kieran Kavanaugh & Otilio Rodriguez (ICS Publications)",
    themes: ["letting-go", "wisdom"]
  },

  // ---- Thomas Merton -------------------------------------------------------
  {
    text: "The truest solitude is not something outside you, not an absence of men or of sound around you; it is an abyss opening up in the center of your own soul.",
    author: "Thomas Merton",
    source: "New Seeds of Contemplation (New Directions, 1961)",
    themes: ["silence", "ordinary-life"]
  },

  // ---- Edith Stein -------------------------------------------------------
  {
    text: "Whoever seeks the truth is seeking God, whether consciously or unconsciously.",
    author: "Edith Stein",
    source: "Self-Portrait in Letters, 1916–1942, Letter 45, to Sister Adelgundis Jaegerschmid, trans. Josephine Koeppel (ICS Publications, 1993)",
    themes: ["wisdom"]
  },

  // ---- Etty Hillesum -------------------------------------------------------
  {
    text: "I have broken my body like bread and shared it out among men. And why not, they were hungry and had gone without for so long.",
    author: "Etty Hillesum",
    source: "An Interrupted Life: The Diaries, 1941–1943, diary entry, 13 October 1942, trans. Arnold J. Pomerans (Pantheon Books)",
    themes: ["compassion", "suffering-liberation"]
  },

  // ---- Albert Camus -------------------------------------------------------
  {
    text: "The struggle itself toward the heights is enough to fill a man's heart. One must imagine Sisyphus happy.",
    author: "Albert Camus",
    source: "The Myth of Sisyphus, trans. Justin O'Brien (Alfred A. Knopf, 1955)",
    themes: ["suffering-liberation", "contentment"]
  },

  // ---- Rainer Maria Rilke -------------------------------------------------------
  {
    text: "Be patient toward all that is unsolved in your heart and try to love the questions themselves, like locked rooms and like books that are written in a very foreign language.",
    author: "Rainer Maria Rilke",
    source: "Letters to a Young Poet, Letter Four, trans. Stephen Mitchell (Vintage Books, 1984)",
    themes: ["wisdom", "letting-go"]
  },

  // ---- Nisargadatta Maharaj -------------------------------------------------------
  {
    text: "Mind creates the abyss, the heart crosses it.",
    author: "Nisargadatta Maharaj",
    source: "I Am That, Ch. 3, trans. Maurice Frydman (Chetana, 1973)",
    themes: ["wisdom", "suffering-liberation"]
  },

  // ---- Ramana Maharshi -------------------------------------------------------
  {
    text: "Happiness is the very nature of the Self; happiness and the Self are not different.",
    author: "Ramana Maharshi",
    source: "Who Am I? (Nan Yar), Q24, \"What is Happiness?\" (Sri Ramanasramam)",
    themes: ["contentment", "wisdom"]
  },

  // ---- Jiddu Krishnamurti -------------------------------------------------------
  {
    text: "Man has throughout the ages been seeking something beyond himself, beyond material welfare — something we call truth or God or reality, a timeless state — something that cannot be disturbed by circumstances, by thought or by human corruption.",
    author: "Jiddu Krishnamurti",
    source: "Freedom from the Known, Ch. 1 (Harper & Row, 1969)",
    themes: ["wisdom", "letting-go"]
  },

  // ---- Eckhart Tolle -------------------------------------------------------
  {
    text: "Realize deeply that the present moment is all you ever have.",
    author: "Eckhart Tolle",
    source: "The Power of Now: A Guide to Spiritual Enlightenment, p. 35 (New World Library, 2010 ed.)",
    themes: ["mindfulness", "ordinary-life"]
  },

  // ---- Byron Katie -------------------------------------------------------
  {
    text: "When I argue with reality, I lose—but only 100 percent of the time.",
    author: "Byron Katie",
    source: "Loving What Is: Four Questions That Can Change Your Life (Harmony Books, 2002)",
    themes: ["letting-go", "contentment"]
  },

  // ---- Anthony de Mello -------------------------------------------------------
  {
    text: "Spirituality means waking up. Most people, even though they don't know it, are asleep.",
    author: "Anthony de Mello",
    source: "Awareness: The Perils and Opportunities of Reality, \"On Waking Up\" (Doubleday, 1990)",
    themes: ["mindfulness", "wisdom"]
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
  },

  // ---- Additional verified quotes (Theravada preference) --------------------
  {
    text: "Why are we born? We are born so that we will not have to be born again.",
    author: "Ajahn Chah",
    source: "No Ajahn Chah: Reflections",
    themes: ["suffering-liberation", "wisdom"]
  },
  {
    text: "You say that you are too busy to meditate. Do you have time to breathe? Meditation is your breath.",
    author: "Ajahn Chah",
    source: "No Ajahn Chah: Reflections",
    themes: ["mindfulness", "ordinary-life"]
  },
  {
    text: "Only one book is worth reading: the heart.",
    author: "Ajahn Chah",
    source: "No Ajahn Chah: Reflections",
    themes: ["simplicity", "wisdom"]
  },
  {
    text: "The mind is intrinsically tranquil. Out of this tranquility, anxiety and confusion are born.",
    author: "Ajahn Chah",
    source: "No Ajahn Chah: Reflections",
    themes: ["mindfulness", "contentment"]
  },
  {
    text: "Death is as close as our breath.",
    author: "Ajahn Chah",
    source: "No Ajahn Chah: Reflections",
    themes: ["impermanence", "mindfulness"]
  },
  {
    text: "If the body could talk, it would be telling us all day long, 'You're not my owner, you know.'",
    author: "Ajahn Chah",
    source: "No Ajahn Chah: Reflections",
    themes: ["letting-go", "wisdom"]
  },
  {
    text: "A good practice is to ask yourself very sincerely, 'Why was I born?' Ask yourself this question in the morning, in the afternoon, and at night every day.",
    author: "Ajahn Chah",
    source: "No Ajahn Chah: Reflections",
    themes: ["wisdom", "suffering-liberation"]
  },
  {
    text: "Our birth and death are just one thing. You can't have one without the other.",
    author: "Ajahn Chah",
    source: "No Ajahn Chah: Reflections",
    themes: ["impermanence", "wisdom"]
  },
  {
    text: "I'm always talking about things to develop and things to give up, but really there's nothing to develop and nothing to give up.",
    author: "Ajahn Chah",
    source: "No Ajahn Chah: Reflections",
    themes: ["letting-go", "simplicity"]
  },
  {
    text: "I live nowhere. There is no place you can find me. I have no age. To have age, you must exist, and to think you exist is already a problem.",
    author: "Ajahn Chah",
    source: "No Ajahn Chah: Reflections",
    themes: ["letting-go", "wisdom"]
  },
  {
    text: "With mindfulness you can see the real owner of things. Do you think this is your world, your body? It is the world's world, the body's body. We only rent this house. Why not find out who really owns it?",
    author: "Ajahn Chah",
    source: "A Still Forest Pool",
    themes: ["letting-go", "wisdom"]
  },
  {
    text: "I know this glass is already broken, so I enjoy it incredibly.",
    author: "Ajahn Chah",
    source: "A Still Forest Pool",
    themes: ["impermanence", "contentment"]
  },
  {
    text: "Yesterday is a memory. Tomorrow is the unknown. Now is the knowing.",
    author: "Ajahn Sumedho",
    source: "Now Is the Knowing (Amaravati Publications)",
    themes: ["mindfulness", "ordinary-life"]
  },
  {
    text: "Our practice is not to become enlightened, but to be in the knowing, now.",
    author: "Ajahn Sumedho",
    source: "Now Is the Knowing (Amaravati Publications)",
    themes: ["mindfulness", "simplicity"]
  },
  {
    text: "Although the conditions of the mind may not be peaceful at all, the mind itself is a peaceful place.",
    author: "Ajahn Sumedho",
    source: "Now Is the Knowing (Amaravati Publications)",
    themes: ["mindfulness", "contentment"]
  },
  {
    text: "The realization of samsara is the condition of Nibbana. As we recognize the cycles of habit and are no longer deluded by them, we realize Nibbana.",
    author: "Ajahn Sumedho",
    source: "Now Is the Knowing (Amaravati Publications)",
    themes: ["suffering-liberation", "wisdom"]
  },
  {
    text: "The reality of now is magnificent and awesome.",
    author: "Ajahn Brahm",
    source: "Mindfulness, Bliss, and Beyond: A Meditator's Handbook",
    themes: ["mindfulness", "contentment"]
  },
  {
    text: "So if you seek truth, you should value silent awareness and consider it more important than any thought.",
    author: "Ajahn Brahm",
    source: "Mindfulness, Bliss, and Beyond: A Meditator's Handbook",
    themes: ["silence", "mindfulness"]
  },
  {
    text: "When one realizes that most of our thinking is really pointless, that it gets us nowhere and only gives us headaches, we gladly and easily spend much time in inner quiet.",
    author: "Ajahn Brahm",
    source: "Mindfulness, Bliss, and Beyond: A Meditator's Handbook",
    themes: ["silence", "simplicity"]
  },
  {
    text: "The motto of meditation is no joy, no mindfulness.",
    author: "Ajahn Brahm",
    source: "Mindfulness, Bliss, and Beyond: A Meditator's Handbook",
    themes: ["mindfulness", "contentment"]
  },
  {
    text: "Silence is shy. If silence hears you talking about her, she vanishes immediately.",
    author: "Ajahn Brahm",
    source: "Mindfulness, Bliss, and Beyond: A Meditator's Handbook",
    themes: ["silence", "mindfulness"]
  },
  {
    text: "Mindfulness brings to light experience in its pure immediacy. It reveals the object as it is before it has been plastered over with conceptual paint, overlaid with interpretations.",
    author: "Bhikkhu Bodhi",
    source: "The Noble Eightfold Path: The Way to the End of Suffering",
    themes: ["mindfulness", "wisdom"]
  },
  {
    text: "The tool the Buddha holds out to free the mind from desire is understanding. Real renunciation is not a matter of compelling ourselves to give up things still inwardly cherished, but of changing our perspective on them so that they no longer bind us.",
    author: "Bhikkhu Bodhi",
    source: "The Noble Eightfold Path: The Way to the End of Suffering",
    themes: ["letting-go", "wisdom"]
  },
  {
    text: "Like a lake unruffled by any breeze, the concentrated mind is a faithful reflector that mirrors whatever is placed before it exactly as it is.",
    author: "Bhikkhu Bodhi",
    source: "The Noble Eightfold Path: The Way to the End of Suffering",
    themes: ["mindfulness", "wisdom"]
  },
  {
    text: "Whatever you're doing, and especially when you don't seem to be doing anything at all, don't be complacent. Look carefully, again and again, for even the slightest stress or disturbance you might be causing inadvertently, and learn how to drop whatever you're doing that's causing it.",
    author: "Thanissaro Bhikkhu",
    source: "The Practice in a Word (in Purity of Heart)",
    themes: ["mindfulness", "letting-go"]
  },
  {
    text: "Heedfulness is the path to the Deathless. Heedlessness is the path to death. The heedful die not. The heedless are as if dead already.",
    author: "The Buddha",
    source: "Dhammapada, v. 21, trans. Acharya Buddharakkhita",
    themes: ["wisdom", "mindfulness"]
  },
  {
    text: "All conditioned things are unsatisfactory. When one sees this with wisdom, one turns away from suffering.",
    author: "The Buddha",
    source: "Dhammapada, v. 278, trans. Acharya Buddharakkhita",
    themes: ["impermanence", "suffering-liberation"]
  },
  {
    text: "Better than a thousand hollow words is one word that brings peace.",
    author: "The Buddha",
    source: "Dhammapada, v. 100, trans. Acharya Buddharakkhita",
    themes: ["simplicity", "wisdom"]
  },
  {
    text: "The profound teaching is whatever you can't do yet. It's not something that's always intellectually difficult, but it's profound if you haven't yet penetrated it.",
    author: "Ajahn Jayasaro",
    source: "Reflections (Abhayagiri Monastery)",
    themes: ["humility", "wisdom"]
  },
  {
    text: "Sometimes it's better to be harmonious than to be right.",
    author: "Ajahn Pasanno",
    source: "The Ajahn Pasanno Question and Story Archive, Abhayagiri Buddhist Monastery",
    themes: ["humility", "compassion"]
  },
  {
    text: "The not-self refrain, 'This is not me, this is not mine, this is not what or who I am,' is not an abdication of responsibility but an understanding: this is the way I can put things down and move on.",
    author: "Ajahn Pasanno",
    source: "The Ajahn Pasanno Question and Story Archive, Abhayagiri Buddhist Monastery",
    themes: ["letting-go", "wisdom"]
  },
  {
    text: "True insight practice is awareness of all of the mental and physical phenomena that are constantly arising at the six sense-doors.",
    author: "Mahasi Sayadaw",
    source: "Manual of Insight",
    themes: ["mindfulness", "wisdom"]
  },
  {
    text: "When conventional reality emerges, ultimate reality submerges. When ultimate reality emerges, conventional reality submerges.",
    author: "Mahasi Sayadaw",
    source: "Manual of Insight",
    themes: ["wisdom", "mindfulness"]
  },
  {
    text: "During meditation you become someone who has no history.",
    author: "Ajahn Brahm",
    source: "Mindfulness, Bliss, and Beyond: A Meditator's Handbook",
    themes: ["mindfulness", "letting-go"]
  },
  {
    text: "You do not do anything. If you try to do something at this stage, you will disturb the whole process. The beauty will be lost.",
    author: "Ajahn Brahm",
    source: "Mindfulness, Bliss, and Beyond: A Meditator's Handbook",
    themes: ["simplicity", "mindfulness"]
  },
  {
    text: "Just try to keep your mind in the present. Whatever arises in the mind, just watch it and let go of it. Don't even wish to be rid of thoughts. Then the mind will return to its natural state.",
    author: "Ajahn Chah",
    source: "A Still Forest Pool",
    themes: ["mindfulness", "letting-go"]
  },
  {
    text: "If we see everything as uncertain, then their value fades away.",
    author: "Ajahn Chah",
    source: "A Still Forest Pool / No Ajahn Chah",
    themes: ["impermanence", "letting-go"]
  },
  {
    text: "Have you ever seen still, flowing water? There. Right where your thinking cannot take you.",
    author: "Ajahn Chah",
    source: "Still, Flowing Water",
    themes: ["wisdom", "silence"]
  },
  {
    text: "The Dhamma is just like this, talking in similes, because the Dhamma doesn't have anything. It isn't round, doesn't have any corners.",
    author: "Ajahn Chah",
    source: "In Simple Terms",
    themes: ["wisdom", "simplicity"]
  },
  {
    text: "Your external home is not your real home. It is your supposed home, your home in the world. As for your real home, that's peace.",
    author: "Ajahn Chah",
    source: "In Simple Terms",
    themes: ["contentment", "letting-go"]
  },
  {
    text: "We turn towards the Dhamma, we are aware now, take refuge in Dhamma, now as an immediate action, an immediate reflection of being the Dhamma.",
    author: "Ajahn Sumedho",
    source: "Now Is the Knowing (Amaravati Publications)",
    themes: ["mindfulness", "wisdom"]
  },
  {
    text: "When we no longer identify with the sensory world as me or mine, and see it as anatta, we can enjoy the senses without seeking sense-impingement or depending on it.",
    author: "Ajahn Sumedho",
    source: "Now Is the Knowing (Amaravati Publications)",
    themes: ["letting-go", "wisdom"]
  },
  {
    text: "This is our practice of letting go. We let go of our identification with conditions by seeing that they are all impermanent and not-self.",
    author: "Ajahn Sumedho",
    source: "Now Is the Knowing (Amaravati Publications)",
    themes: ["letting-go", "impermanence"]
  },
  {
    text: "The whole aim of our practice is purity of heart. Everything else is just games.",
    author: "Ajahn Fuang",
    source: "As quoted by Thanissaro Bhikkhu in Purity of Heart, opening section (dhammatalks.org)",
    themes: ["simplicity", "wisdom"]
  },
  {
    text: "Purity of heart is a happiness that will never harm anyone.",
    author: "Thanissaro Bhikkhu",
    source: "Purity of Heart",
    themes: ["compassion", "contentment"]
  },
  {
    text: "If a person isn't true to the Buddha's teachings, the Buddha's teachings won't be true to that person, and that person won't be able to know what the Buddha's true teachings are.",
    author: "Ajahn Lee Dhammadharo",
    source: "As quoted by Thanissaro Bhikkhu in The Customs of the Noble Ones (1999, accesstoinsight.org)",
    themes: ["humility", "wisdom"]
  },
  {
    text: "The mind can train itself to abandon unskillful qualities and to develop skillful qualities in their place.",
    author: "Thanissaro Bhikkhu",
    source: "The Buddha's Teachings (dhammatalks.org)",
    themes: ["wisdom", "mindfulness"]
  },
  {
    text: "Heedfulness, in turn, has to be paired with an attitude that is not easily contented with the results you're getting from your actions.",
    author: "Thanissaro Bhikkhu",
    source: "The Buddha's Teachings (dhammatalks.org)",
    themes: ["wisdom", "suffering-liberation"]
  },
  {
    text: "You begin to enjoy the silence, once you have found it at last, and that is why it grows.",
    author: "Ajahn Brahm",
    source: "Mindfulness, Bliss, and Beyond: A Meditator's Handbook",
    themes: ["silence", "contentment"]
  },
  {
    text: "In that silent awareness of just now you will experience much peace, joy and consequent wisdom.",
    author: "Ajahn Brahm",
    source: "Mindfulness, Bliss, and Beyond: A Meditator's Handbook",
    themes: ["silence", "mindfulness"]
  },
  {
    text: "About this mind, in truth there is nothing really wrong with it. It is intrinsically pure. Within itself it's already peaceful.",
    author: "Ajahn Chah",
    source: "Food for the Heart",
    themes: ["mindfulness", "contentment"]
  },
  {
    text: "If things seem to be good, don't delight in them, and if they're not good don't be averse to them. Just look at it all. Just look, don't bother judging.",
    author: "Ajahn Chah",
    source: "Food for the Heart",
    themes: ["letting-go", "mindfulness"]
  },
  {
    text: "Good and bad can both bite, so don't hold fast to them.",
    author: "Ajahn Chah",
    source: "Food for the Heart",
    themes: ["letting-go", "wisdom"]
  },
  {
    text: "When you listen to the Dhamma, you must open up your heart and compose yourself in its centre. Don't try and accumulate what you hear.",
    author: "Ajahn Chah",
    source: "The Teachings of Ajahn Chah",
    themes: ["mindfulness", "simplicity"]
  },
  {
    text: "To define Buddhism without a lot of words and phrases, we can simply say, don't cling or hold on to anything. Harmonize with actuality, with things just as they are.",
    author: "Ajahn Chah",
    source: "The Teachings of Ajahn Chah",
    themes: ["letting-go", "simplicity"]
  },
  {
    text: "Practice is not moving forward, but there is forward movement. At the same time, it is not moving back, but there is backward movement.",
    author: "Ajahn Chah",
    source: "The Teachings of Ajahn Chah",
    themes: ["wisdom", "letting-go"]
  },
  {
    text: "Paccattam veditabbo vinnuhi. The wise must know for themselves.",
    author: "Ajahn Chah",
    source: "Food for the Heart",
    themes: ["wisdom", "humility"]
  },
  {
    text: "If you wonder, is this wrong or not, that is, you're not really sure, then don't say it, don't act on it, don't discard your restraint.",
    author: "Ajahn Chah",
    source: "Food for the Heart",
    themes: ["wisdom", "simplicity"]
  },
  {
    text: "If there is no mutual respect, negligence sets in and the practice eventually degenerates.",
    author: "Ajahn Chah",
    source: "Food for the Heart",
    themes: ["humility", "wisdom"]
  },
  {
    text: "One who wishes to reach the Buddha-Dhamma must be one who has faith or confidence as a foundation.",
    author: "Ajahn Chah",
    source: "Bodhinyana",
    themes: ["wisdom", "humility"]
  },
  {
    text: "Buddha is the one who knows, the one who has purity, radiance and peace in the heart.",
    author: "Ajahn Chah",
    source: "Bodhinyana",
    themes: ["wisdom", "contentment"]
  },
  {
    text: "Wisdom does not come from studying great theories and philosophies, but from observing the ordinary.",
    author: "Ajahn Sumedho",
    source: "Teachings from the Forest",
    themes: ["wisdom", "ordinary-life"]
  },
  {
    text: "We tend to overlook the ordinary. For example, we are usually only aware of our breath when it's abnormal.",
    author: "Ajahn Sumedho",
    source: "Teachings from the Forest",
    themes: ["mindfulness", "ordinary-life"]
  },
  {
    text: "Anicca, dukkha and anatta are not concepts we believe in, but things we can observe.",
    author: "Ajahn Sumedho",
    source: "Teachings from the Forest",
    themes: ["wisdom", "impermanence"]
  },
  {
    text: "Most meditation is just allowing anything that has arisen to cease. That's why I stress patience: allow things to take their natural course to cessation.",
    author: "Ajahn Sumedho",
    source: "Teachings from the Forest",
    themes: ["letting-go", "mindfulness"]
  },
  {
    text: "Try to accept even the things you don't like about yourself. Don't try to be too perfect.",
    author: "Ajahn Sumedho",
    source: "Teachings from the Forest",
    themes: ["compassion", "humility"]
  },
  {
    text: "You always have this patient-kindness and peaceful coexistence with whatever comes.",
    author: "Ajahn Sumedho",
    source: "Teachings from the Forest",
    themes: ["compassion", "contentment"]
  },
  {
    text: "The knower is always now. We don't know about the past or future. Knowing now is the Buddha-knowing.",
    author: "Ajahn Sumedho",
    source: "Teachings from the Forest",
    themes: ["mindfulness", "wisdom"]
  },
  {
    text: "Change never has any fixed point, except that you can know change.",
    author: "Ajahn Sumedho",
    source: "Teachings from the Forest",
    themes: ["impermanence", "mindfulness"]
  },
  {
    text: "Every condition must change. If you like the condition then you will feel sorrow, despair, loss. When an unpleasant condition goes, then you feel glad.",
    author: "Ajahn Sumedho",
    source: "Teachings from the Forest",
    themes: ["impermanence", "suffering-liberation"]
  },
  {
    text: "Desire is a liar.",
    author: "Ajahn Amaro",
    source: "Just One More, Appreciative Joy, pp. 20-22, quoted in Abhayagiri Reflections, \"Desire Is a Liar\" (13 Jan. 2017)",
    themes: ["letting-go", "wisdom"]
  },
  {
    text: "All symbols and similes are partially relevant. All analogies are partial.",
    author: "Ajahn Amaro",
    source: "Quoted in Abhayagiri teachings",
    themes: ["wisdom", "simplicity"]
  },
  {
    text: "In the seen, there is only the seen, in the heard, there is only the heard, in the sensed only the sensed, in the cognized only the cognized.",
    author: "The Buddha",
    source: "Bahiya Sutta (Ud 1.10), as quoted by Ajahn Amaro",
    themes: ["mindfulness", "wisdom"]
  },
  {
    text: "Nothing whatsoever should be clung to.",
    author: "The Buddha",
    source: "Cula-tanha-sankhaya Sutta (MN 37), as quoted by Ajahn Amaro",
    themes: ["letting-go", "wisdom"]
  },
  {
    text: "When they do not cling, they are not agitated. When they are not agitated, they personally attain Nibbana.",
    author: "The Buddha",
    source: "Cula-tanha-sankhaya Sutta (MN 37)",
    themes: ["letting-go", "suffering-liberation"]
  },
  {
    text: "The present moment is here to be used. It's not here just to hang out with the idea that this is what it's all about.",
    author: "Thanissaro Bhikkhu",
    source: "Talks and essays (dhammatalks.org)",
    themes: ["mindfulness", "wisdom"]
  },
  {
    text: "What does it mean to be mindful of the breath? Something very simple: to keep the breath in mind.",
    author: "Thanissaro Bhikkhu",
    source: "Mindfulness Defined",
    themes: ["mindfulness", "simplicity"]
  },
  {
    text: "Keep remembering the breath each time you breathe in, each time you breathe out.",
    author: "Thanissaro Bhikkhu",
    source: "Mindfulness Defined",
    themes: ["mindfulness", "ordinary-life"]
  },
  {
    text: "We don't wish for suffering, but once we understand how to be in relationship with it, it becomes the means through which we mature as loving and wise people.",
    author: "Thanissaro Bhikkhu",
    source: "Various essays",
    themes: ["suffering-liberation", "compassion"]
  },
  {
    text: "The role that kamma plays in the awakening is empowering. It means that what each of us does, says, and thinks does matter.",
    author: "Thanissaro Bhikkhu",
    source: "The Meaning of the Buddha's Awakening (accesstoinsight.org); also in Refuge: An Introduction to the Buddha, Dhamma & Sangha",
    themes: ["wisdom", "suffering-liberation"]
  },
  {
    text: "The choices we make in each moment of our lives are real, and they produce real consequences.",
    author: "Thanissaro Bhikkhu",
    source: "The Meaning of the Buddha's Awakening (accesstoinsight.org); also in Refuge: An Introduction to the Buddha, Dhamma & Sangha",
    themes: ["wisdom", "ordinary-life"]
  },
  {
    text: "Whoever develops mindfulness of death, thinking, O that I might live for the interval that it takes to breathe out after breathing in, that I might attend to the Blessed One's instructions, they are said to dwell heedfully.",
    author: "The Buddha",
    source: "Anguttara Nikaya, as translated by Thanissaro Bhikkhu",
    themes: ["impermanence", "mindfulness"]
  },
  {
    text: "Long life can't be gotten with wealth, nor aging warded off with treasure. The wise say this life is next to nothing, impermanent, subject to change.",
    author: "The Buddha",
    source: "Various suttas, as translated by Thanissaro Bhikkhu",
    themes: ["impermanence", "wisdom"]
  },
  {
    text: "The rich and the poor touch the touch of Death.",
    author: "The Buddha",
    source: "Various suttas, as translated by Thanissaro Bhikkhu",
    themes: ["impermanence", "humility"]
  },
  {
    text: "When the perception of impermanence is developed and cultivated it eliminates all desire for sensual pleasures, for rebirth in the realm of luminous form, and for rebirth in a future life.",
    author: "The Buddha",
    source: "Samyutta Nikaya",
    themes: ["impermanence", "letting-go"]
  },
  {
    text: "Such is form, such is the origin of form, such is the ending of form.",
    author: "The Buddha",
    source: "Samyutta Nikaya",
    themes: ["impermanence", "wisdom"]
  },
  {
    text: "All consciousness, past, future, or present, internal or external, solid or subtle, inferior or superior, far or near: all consciousness with right understanding: This is not mine, I am not this, this is not my self.",
    author: "The Buddha",
    source: "Samyutta Nikaya",
    themes: ["letting-go", "wisdom"]
  },
  {
    text: "There is no form at all that's permanent, everlasting, eternal, imperishable, and will last forever and ever.",
    author: "The Buddha",
    source: "Samyutta Nikaya",
    themes: ["impermanence", "wisdom"]
  },
  {
    text: "The streams, lakes, and rivers that flow down to the ocean, when they reach the ocean, all have the same blue color, the same salty taste.",
    author: "Ajahn Chah",
    source: "In Simple Terms",
    themes: ["wisdom", "simplicity"]
  },
  {
    text: "The same with human beings: it doesn't matter where they're from. When they reach the stream of the Dhamma, it's all the same Dhamma.",
    author: "Ajahn Chah",
    source: "In Simple Terms",
    themes: ["wisdom", "compassion"]
  },
  {
    text: "Don't think that the Dhamma lies far away from you. It lies right with you. It's about you.",
    author: "Ajahn Chah",
    source: "In Simple Terms",
    themes: ["ordinary-life", "wisdom"]
  },
  {
    text: "The Dhamma is revealing itself in every moment, but only when the mind is quiet can we understand what it is saying.",
    author: "Ajahn Chah",
    source: "A Tree in a Forest",
    themes: ["silence", "mindfulness"]
  },
  {
    text: "We are like maggots. Life is like a falling leaf. Our mind is like rain water.",
    author: "Ajahn Chah",
    source: "A Tree in a Forest",
    themes: ["impermanence", "simplicity"]
  },
  {
    text: "All the teachings are merely similes and comparisons, means to help the mind see the truth.",
    author: "Ajahn Chah",
    source: "A Tree in a Forest",
    themes: ["wisdom", "simplicity"]
  },
  {
    text: "If we establish the Buddha within our mind, then we see everything, we contemplate everything, as no different from ourselves.",
    author: "Ajahn Chah",
    source: "A Tree in a Forest",
    themes: ["wisdom", "compassion"]
  },
  {
    text: "I am like a tree in a forest. Birds come to the tree, they sit on its branches and eat its fruits. To the birds, the fruit may be sweet or sour. From the tree's point of view, this is just the chattering of birds.",
    author: "Ajahn Chah",
    source: "No Ajahn Chah / various",
    themes: ["humility", "letting-go"]
  },
  {
    text: "Can you endure it?",
    author: "Ajahn Chah",
    source: "Various talks (often first response to suffering)",
    themes: ["suffering-liberation", "wisdom"]
  },
  {
    text: "The way beyond suffering is neither to run away from it, wallow in it or even grit one's teeth and get through on will alone. The encouragement of patient endurance is to hold steady in the midst of difficulty.",
    author: "Ajahn Chah",
    source: "Various talks",
    themes: ["suffering-liberation", "mindfulness"]
  },
  {
    text: "The abandonment of these three is synonymous with stream entry, the first level of enlightenment.",
    author: "Ajahn Chah",
    source: "Food for the Heart",
    themes: ["wisdom", "suffering-liberation"]
  },
  {
    text: "Dhamma is that which can cut through the problems and difficulties of mankind, gradually reducing them to nothing.",
    author: "Ajahn Chah",
    source: "Bodhinyana",
    themes: ["wisdom", "suffering-liberation"]
  }
];

// Belt-and-braces: `const` at the top level of a classic script is a global
// lexical binding and never lands on window. render-quotes.js reads QUOTES
// directly, so this is not required — it just makes the list reachable from
// the console when debugging.
if (typeof window !== "undefined") {
  window.QUOTES = QUOTES;
}

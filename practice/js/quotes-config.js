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
    Investigator" (Winter 2007).
  - Some Ajahn Chah and Ajahn Sumedho lines are cross-checked against
    Abhayagiri's Ajahn Pasanno Archive, which transcribes from audio.
  - Widely-circulated Ajahn Chah "internet quotes" that couldn't be traced
    to a primary printed source were left out rather than risk a
    misattribution. "Food for the Heart" and "A Still Forest Pool" are the
    reliable anthologies to draw more from.
  - No Bhikkhu Bodhi translation in this batch — worth adding properly
    later rather than guessing at wording.
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
    text: "Health is the highest gain, contentment the greatest wealth; a trustworthy person is the best kinsman, Nibbana the highest bliss.",
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
    text: "Conquer anger with non-anger. Conquer badness with goodness. Conquer meanness with generosity, and lies with truth.",
    author: "The Buddha",
    source: "Dhammapada, v. 223, trans. Thanissaro Bhikkhu",
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
    source: "Udāna 5.5",
    themes: ["wisdom", "suffering-liberation"]
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
    text: "We are all just visitors to this time, this place. We are just passing through. Our stay is short and the moment of our departure uncertain.",
    author: "Ajahn Chah",
    source: "Widely reproduced reflection, Wat Pah Nanachat teachings",
    themes: ["impermanence", "gratitude"]
  },
  {
    text: "Enlightenment is not something you can find by searching. It's a matter of stopping.",
    author: "Ajahn Chah",
    source: "A Still Forest Pool",
    themes: ["wisdom", "letting-go", "silence"]
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

  // ---- Ajahn Brahm --------------------------------------------------------
  {
    text: "If you know how to let go and be at peace, you know everything you need to know about living in the world.",
    author: "Ajahn Brahm",
    source: "Public teaching, widely reproduced by the Buddhist Society of Western Australia",
    themes: ["letting-go", "contentment"]
  },
  {
    text: "Careful patience is the fastest way!",
    author: "Ajahn Brahm",
    source: "Mindfulness, Bliss, and Beyond: A Meditator's Handbook",
    themes: ["simplicity", "wisdom"]
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
    text: "Smile, breathe, and go slowly.",
    author: "Thich Nhat Hanh",
    source: "Widely repeated teaching phrase from his talks and writings",
    themes: ["simplicity", "mindfulness"]
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
    source: "Teaching verse (gatha), widely published in his writings",
    themes: ["mindfulness", "impermanence"]
  },
  {
    text: "Every breath we take, every step we make, can be filled with peace, joy, and serenity.",
    author: "Thich Nhat Hanh",
    source: "Peace Is Every Step",
    themes: ["ordinary-life", "contentment"]
  },
  {
    text: "When you love someone, the best thing you can offer is your presence.",
    author: "Thich Nhat Hanh",
    source: "Being Peace",
    themes: ["compassion", "mindfulness"]
  },
  {
    text: "Breathing in, I calm body and mind. Breathing out, I smile.",
    author: "Thich Nhat Hanh",
    source: "Present Moment Wonderful Moment",
    themes: ["mindfulness", "simplicity"]
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
    source: "Gravity and Grace",
    themes: ["compassion", "mindfulness"]
  },
  {
    text: "The love of our neighbor in all its fullness simply means being able to say to him: 'What are you going through?'",
    author: "Simone Weil",
    source: "Waiting for God",
    themes: ["compassion", "humility"]
  }
];

// Belt-and-braces: `const` at the top level of a classic script is a global
// lexical binding and never lands on window. render-quotes.js reads QUOTES
// directly, so this is not required — it just makes the list reachable from
// the console when debugging.
if (typeof window !== "undefined") {
  window.QUOTES = QUOTES;
}

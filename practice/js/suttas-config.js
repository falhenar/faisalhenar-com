/*
  SUTTA READINGS CONFIG
  ----------------------
  Source pool for the "Reflections" feature in the Practice section.

  Selection and order follow Bhikkhu Bodhi's anthology "In the Buddha's
  Words" (Wisdom Publications), used as a structural spine rather than a
  random pick — Parts I through X, roughly foundational to advanced.
  Translations are Bhikkhu Sujato's (CC0, public domain) via SuttaCentral
  unless noted otherwise in `translator`.

  An entry is only "live" once `note` is filled in — that's what makes it
  eligible to appear on the practice hub and in the archive. Leaving `note`
  empty just means it's queued, not published. There's no calendar logic
  and no missed weeks: publish order is write order, not book order.

  Fields:
  id         -> stable identifier, part-section-item, e.g. "itbw-1-2-3"
  book       -> key into BOOKS below, groups entries into their block
  part       -> Roman numeral of the book's Part (I-X)
  section    -> the named subsection within that Part, for context
  label      -> Bodhi's own numbering, e.g. "I.2(3)"
  title      -> the reading's title as given in the book
  ref        -> sutta reference (e.g. "SN 3.3"), "from X" if an excerpt
  translator -> SuttaCentral translator slug (default: sujato)
  url        -> direct link, including segment anchor for excerpts
  excerpt    -> a few lines quoted directly from the sutta, your pick.
                Optional — leave "" if nothing feels quotable. Use \n for
                line breaks if quoting verse; rendered as a block-quote.
  note       -> your reflection, in your own words. Empty = not published.
  added      -> date you actually wrote the note (not the book's order)

  ---------------------------------------------------------------------

  BOOKS
  -----
  One entry per book/text being reflected on. The page renders one
  heading block per book, in the order listed here, followed by that
  book's published entries (most recent first). To start reflecting on
  a new book: add an entry here, then add SUTTAS entries with a
  matching `book` key.

  title  -> the book/text's title, shown as the block heading
  note   -> a short line of context: author, translator, why this text
*/

const BOOKS = {
  itbw: {
    title: "In the Buddha's Words",
    note: "Bhikkhu Bodhi's anthology (Wisdom Publications), used as a structural spine: Parts I through X, roughly foundational to advanced. Translations are Bhikkhu Sujato's via SuttaCentral, unless noted otherwise."
  },
  keepers: {
    title: "Reflections on Suttas That Stay With Me",
    note: "Suttas outside the anthology above — encountered elsewhere, and kept coming back to. No structural spine here, just the ones that stayed."
  }
};

const SUTTAS = [
  // Part I — The Human Condition
  // 1. Old Age, Illness, and Death
  {
    id: "itbw-1-1-1",
    book: "itbw",
    part: "I",
    section: "Old Age, Illness, and Death",
    label: "I.1(1)",
    title: "Aging and Death",
    ref: "SN 3.3",
    translator: "sujato",
    url: "https://suttacentral.net/sn3.3/en/sujato",
    excerpt: "Fancy chariots of kings wear out,\nand even this body gets old.\nBut the truth of the good never gets old—\nso the good proclaim to the good.",
    note: "We cannot escape old age and death, that is why we practice while we can. Let's not waste this life on frivolous things, and let's aim for the good.\n\nIt sounds so easy. But when we are not mindful we usually just act based on our desires and aversions. It is not for me to judge if those actions are necessarily “good” or “bad”, but it is helpful to observe which results we can observe from those actions. Do they lead to a more peaceful mind? Do they maybe cause harm to ourselves or others?\n\nSo what I have learned on this path, is that one is often best off to try to ground one's intentions in generosity, restraint and wisdom rather than in greed, aversion and delusion. This to me is what it means when we say “let's aim for the good.”",
    added: "2026-07-30"
  },
  {
    id: "itbw-1-1-2",
    book: "itbw",
    part: "I",
    section: "Old Age, Illness, and Death",
    label: "I.1(2)",
    title: "The Simile of the Mountain",
    ref: "SN 3.25",
    translator: "sujato",
    url: "https://suttacentral.net/sn3.25/en/sujato",
    excerpt: "“I tell you, Great King, I announce to you: old age and death are advancing upon you. Since old age and death are advancing upon you, what would you do?”\n“Sir, what can I do but practice the teachings, practice morality, doing skillful and good actions?”",
    note: "In our own way, we are all kings of our own little kingdoms. So often, we seem to believe that having the right friends, accumulating wealth, clinging to our possessions, or preserving our youth and beauty will somehow protect us from suffering. Yet we all know that we are subject to aging, sickness, and death. No mansion, no family, and no amount of money can protect us from these realities.\n\nEven though, on some level, we are all aware of these truths, we continue chasing our desires and running from our aversions. Yet no army can stop the forces of nature or alter the course that every human body is destined to follow.\n\nThen there is another trajectory, one that most of us cannot see: the unfolding of causes and conditions according to the natural law of kamma. These causes and conditions shape our past, present, and future experiences. Even if we have not yet developed the insight to perceive this directly, it already seems evident that wholesome actions can lead to beneficial results, even within this very lifetime.\n\nKnowing that this life is finite, why not devote ourselves to cultivating skillful qualities and living with integrity? Such efforts benefit both ourselves and those whose lives we touch.",
    added: "2026-08-02"
  },
  {
    id: "itbw-1-1-3",
    book: "itbw",
    part: "I",
    section: "Old Age, Illness, and Death",
    label: "I.1(3)",
    title: "The Divine Messengers",
    ref: "from AN 3.36",
    translator: "sujato",
    url: "https://suttacentral.net/an3.36/en/sujato",
    excerpt: "‘My man, because you were negligent, you didn’t do good by way of body, speech, and mind. Well, they’ll definitely punish you to fit your negligence. That bad deed wasn’t done by your mother, father, brother, or sister. It wasn’t done by friends and colleagues, by relatives and kin, by the deities, or by ascetics and brahmins. That bad deed was done by you alone, and you alone will experience the result.’",
    note: "Whenever we suffer, we're quick to blame something, or someone, for it. It's not easy to see how our own actions are often at the root of that same suffering. Of course, many causes and conditions shape our current reality. Yet in this moment, we all have the ability to either follow or abandon whatever craving or aversion arises in the mind. It's that simple.\n\nBut is it easy? No. Absolutely not. That same craving and aversion springs from causes and conditions formed by our own past.\n\nThat's where practice comes in: to be mindful in every moment. When standing, walking, sitting, or lying down, be mindful of whatever arises in the mind, and use discernment to separate the skillful from the unskillful, the wholesome from the unwholesome. We can each find our own way out of suffering.",
    added: "2026-08-09"
  },

  // 2. The Tribulations of Unreflective Living
  {
    id: "itbw-1-2-1",
    book: "itbw",
    part: "I",
    section: "The Tribulations of Unreflective Living",
    label: "I.2(1)",
    title: "The Dart of Painful Feeling",
    ref: "SN 36.6",
    translator: "sujato",
    url: "https://suttacentral.net/sn36.6/en/sujato",
    excerpt: "",
    note: "",
    added: null
  },
  {
    id: "itbw-1-2-2",
    book: "itbw",
    part: "I",
    section: "The Tribulations of Unreflective Living",
    label: "I.2(2)",
    title: "The Vicissitudes of Life",
    ref: "AN 8.6",
    translator: "sujato",
    url: "https://suttacentral.net/an8.6/en/sujato",
    excerpt: "",
    note: "",
    added: null
  },
  {
    id: "itbw-1-2-3",
    book: "itbw",
    part: "I",
    section: "The Tribulations of Unreflective Living",
    label: "I.2(3)",
    title: "Anxiety Due to Change",
    ref: "SN 22.7",
    translator: "sujato",
    url: "https://suttacentral.net/sn22.7/en/sujato",
    excerpt: "",
    note: "",
    added: null
  },

  // 3. A World in Turmoil
  {
    id: "itbw-1-3-1",
    book: "itbw",
    part: "I",
    section: "A World in Turmoil",
    label: "I.3(1)",
    title: "The Origin of Conflict",
    ref: "AN 2.37 (abridged)",
    translator: "sujato",
    url: "https://suttacentral.net/an2.32-41/en/sujato#sc37.1",
    excerpt: "",
    note: "",
    added: null
  },
  {
    id: "itbw-1-3-2",
    book: "itbw",
    part: "I",
    section: "A World in Turmoil",
    label: "I.3(2)",
    title: "Why Do Beings Live in Hate?",
    ref: "from DN 21",
    translator: "sujato",
    url: "https://suttacentral.net/dn21/en/sujato#sc51--59",
    excerpt: "",
    note: "",
    added: null
  },
  {
    id: "itbw-1-3-3",
    book: "itbw",
    part: "I",
    section: "A World in Turmoil",
    label: "I.3(3)",
    title: "The Dark Chain of Causation",
    ref: "from DN 15",
    translator: "sujato",
    url: "https://suttacentral.net/dn15/en/sujato#sc17",
    excerpt: "",
    note: "",
    added: null
  },
  {
    id: "itbw-1-3-4",
    book: "itbw",
    part: "I",
    section: "A World in Turmoil",
    label: "I.3(4)",
    title: "The Roots of Violence and Oppression",
    ref: "from AN 3.69",
    translator: "sujato",
    url: "https://suttacentral.net/an3.69/en/sujato#sc2--4",
    excerpt: "",
    note: "",
    added: null
  },

  // 4. Without Discoverable Beginning
  {
    id: "itbw-1-4-1",
    book: "itbw",
    part: "I",
    section: "Without Discoverable Beginning",
    label: "I.4(1)",
    title: "Grass and Sticks",
    ref: "SN 15.1",
    translator: "sujato",
    url: "https://suttacentral.net/sn15.1/en/sujato",
    excerpt: "",
    note: "",
    added: null
  },
  {
    id: "itbw-1-4-2",
    book: "itbw",
    part: "I",
    section: "Without Discoverable Beginning",
    label: "I.4(2)",
    title: "Balls of Clay",
    ref: "SN 15.2",
    translator: "sujato",
    url: "https://suttacentral.net/sn15.2/en/sujato",
    excerpt: "",
    note: "",
    added: null
  },
  {
    id: "itbw-1-4-3",
    book: "itbw",
    part: "I",
    section: "Without Discoverable Beginning",
    label: "I.4(3)",
    title: "The Mountain",
    ref: "SN 15.5",
    translator: "sujato",
    url: "https://suttacentral.net/sn15.5/en/sujato",
    excerpt: "",
    note: "",
    added: null
  },
  {
    id: "itbw-1-4-4",
    book: "itbw",
    part: "I",
    section: "Without Discoverable Beginning",
    label: "I.4(4)",
    title: "The River Ganges",
    ref: "SN 15.8",
    translator: "sujato",
    url: "https://suttacentral.net/sn15.8/en/sujato",
    excerpt: "",
    note: "",
    added: null
  },
  {
    id: "itbw-1-4-5",
    book: "itbw",
    part: "I",
    section: "Without Discoverable Beginning",
    label: "I.4(5)",
    title: "Dog on a Leash",
    ref: "SN 22.99",
    translator: "sujato",
    url: "https://suttacentral.net/sn22.99/en/sujato",
    excerpt: "",
    note: "",
    added: null
  },

  // --- Reflections on Suttas That Stay With Me ---
  {
    id: "keepers-1",
    book: "keepers",
    label: "1",
    title: "Let go of philosophy",
    ref: "SN 5.10",
    translator: "sujato",
    url: "https://suttacentral.net/sn5.10/en/sujato",
    excerpt: "Who created this sentient being?\nWhere is its maker?\nWhere has the being arisen?\nAnd where does it cease?",
    note: "Who doesn't love to philosophize about life. Probably a lot of people don't. But for most of my life, I enjoyed it to the fullest. Or maybe enjoyment is the wrong word to describe it, because at times I even took it too far. Always questioning everything. So much that my head would hurt.\n\nI wanted to know why and how the world worked, how and why us people move through it as we do, and sometimes I found it the most important thing to find out who was responsible. Who was responsible for this war, or that conspiracy, or even worse, who was responsible for my suffering. Because that surely could not be me, right?\n\nBut questioning the state of the world is like arguing with reality. Look deep inside and ask yourself, what would knowing the answers to all these questions actually solve? In fact, often asking the questions leads to the arising of desire, aversion, restlessness, sluggishness and doubts. Hindrances to achieving true peace of mind. And when we are not able to live in peace with the world as it is, how can we ever create peace in the world we live in.\n\nWhen we say “let it go”, it does not mean we do not care. It means that grasping at our ideas on how it should be, prevents us from actually caring for what is in front of us.",
    added: "2026-08-12"
  }
];

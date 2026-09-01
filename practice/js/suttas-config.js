/*
  SUTTA READINGS CONFIG
  ----------------------
  Authoritative page sections and source-ordered editing queue for the
  "Reflections" feature in the Practice section. The legacy BOOKS and SUTTAS
  declaration names remain for compatibility; a page section need not be a
  book, and a Reflection need not have an external source.

  Selection and order follow Bhikkhu Bodhi's anthology "In the Buddha's
  Words" (Wisdom Publications), used as a structural spine rather than a
  random pick — Parts I through X, roughly foundational to advanced.
  Translations are Bhikkhu Sujato's (CC0, public domain) via SuttaCentral
  unless noted otherwise in `translator`.

  An entry is only "live" once `note` is filled in and `added` contains the
  date it was published. Leaving `note` empty means it is queued. A note with
  no date is written but unpublished.

  Fields:
  id         -> stable lowercase identifier, e.g. "itbw-1-2-3"
  book       -> legacy field name for the BOOKS page-section key
  part       -> Roman numeral of the book's Part (I-X)
  section    -> the named subsection within that Part, for context
  label      -> Bodhi's own numbering, e.g. "I.2(3)"
  title      -> the Reflection title
  ref        -> optional sutta reference (e.g. "SN 3.3"), "from X" if an excerpt
  suttaTitle -> canonical Pali title, shown as part of a "ref · suttaTitle"
                subtitle once an entry is opened
  translator -> SuttaCentral translator slug (default: sujato)
  url        -> optional direct link, including segment anchor for excerpts
  sourceTitle, sourceAuthor, sourceLocation, sourceUrl
             -> optional generic source metadata for non-sutta Reflections
  excerpt    -> a few lines quoted directly from the source, your pick.
                Optional — leave "" if nothing feels quotable. Use \n for
                line breaks if quoting verse; rendered as a block-quote.
  note       -> your reflection, in your own words. Empty = not published.
  added      -> date you actually wrote the note (not the book's order)

  ---------------------------------------------------------------------

  BOOKS
  -----
  One entry per visible page section. A section may follow a book or group
  of texts, or collect source-free Reflections on a subject. The page renders
  section blocks in the order listed here and hides sections without a
  published entry. Add SUTTAS entries with a matching legacy `book` key.

  title  -> the page-section title, shown as the block heading
  note   -> a short introduction to the section
  order  -> "structural" for source order, "chronological" for newest first
*/

const BOOKS = {
  itbw: {
    title: "In the Buddha's Words",
    note: "Bhikkhu Bodhi's anthology (Wisdom Publications), used as a structural spine: Parts I through X, roughly foundational to advanced. Translations are Bhikkhu Sujato's via SuttaCentral, unless noted otherwise.",
    order: "structural"
  },
  keepers: {
    title: "Reflections on Suttas That Stay With Me",
    note: "Suttas outside the anthology above, encountered elsewhere, and kept coming back to. No structural spine here, just the ones that stayed.",
    order: "chronological"
  }};

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
    suttaTitle: "Jarāmaraṇasutta",
    translator: "sujato",
    url: "https://suttacentral.net/sn3.3/en/sujato",
    excerpt: "Fancy chariots of kings wear out,\nand even this body gets old.\nBut the truth of the good never gets old—\nso the good proclaim to the good.",
    note: "We cannot escape old age and death, that is why we practice while we can. Let's not waste this life on frivolous things, and let's aim for the good. How much time do I spend pursuing things I already know will not satisfy me very deeply, while neglecting things I genuinely consider important? Even fancy chariots of kings wear out, so why not use this chariot of mine for what I consider worthwhile. \n\nIt sounds so easy. But when we are not mindful we usually just act based on our desires and aversions. Rather than simply labeling myself or my actions good or bad, I can look at what my intentions lead to. Do they lead to a more peaceful mind? Do they maybe cause harm to myself or others? \n\nSo what I have learned on this path is that I am usually better off grounding my intentions in generosity, restraint and wisdom rather than in greed, aversion and delusion. In my own case, I can maybe find some causes I can donate to on a regular basis and I can decide to practice to gain a clearer understanding of what is actually worth pursuing. This is what 'aiming for the good' has come to mean to me.",
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
    suttaTitle: "Pabbatūpamasutta",
    translator: "sujato",
    url: "https://suttacentral.net/sn3.25/en/sujato",
    excerpt: "“I tell you, Great King, I announce to you: old age and death are advancing upon you. Since old age and death are advancing upon you, what would you do?”\n“Sir, what can I do but practice the teachings, practice morality, doing skillful and good actions?”",
    note: "In our own way, we are all kings of our own little kingdoms. So often, we seem to believe that having the right friends, accumulating wealth, clinging to our possessions, or behaving as if we're forever youthful can shield ourselves for what is coming. We all know that we are subject to aging, sickness, and death. No mansion, no family, and no amount of money can protect us from these realities. Even though, on some level, we are all aware of these truths, we continue chasing our desires and running from our aversions. Yet no army can stop the forces of nature or alter the course that every human body is destined to follow.\n\nFor many years I too seemed to be in denial about the inevitabilities of this life. I chased dreams of pleasure and happiness that I thought I could enjoy forever.  And in that pursuit I often took actions that might have led to some short-term results that seemed pleasurable at the time. But they never led to long-term happiness and fulfilment. I asked myself, what if there were another way? One that might be difficult to walk, not always fun, but that could lead to a life that feels worthy of living. \n\nBecoming aware of the impermanence of everything showed me another path. It freed me from constantly imagining a perfect future that never arrived and allowed me to meet life as it was actually unfolding. This present experience has been shaped by countless causes and conditions; the same will be true of whatever comes next. Knowing the life is finite, why not devote the present moment to cultivating skillful qualities and living with integrity? Such efforts benefit both myself and everyone whose path crosses mine.",
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
    suttaTitle: "Devadūtasutta",
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
    suttaTitle: "Sallasutta",
    translator: "sujato",
    url: "https://suttacentral.net/sn36.6/en/sujato",
    excerpt: "When an unlearned ordinary person experiences painful physical feelings they sorrow and wail and lament, beating their breast and falling into confusion. They experience two feelings: physical and mental.\n\nIt’s like a person who is struck with an arrow, only to be struck with a second arrow. That person experiences the feeling of two arrows.\n\nIn the same way, when an unlearned ordinary person experiences painful physical feelings they sorrow and wail and lament, beating their breast and falling into confusion. They experience two feelings: physical and mental.",
    note: "We will all experience suffering in our lives in one form or another. In that sense, getting struck by the \"first arrow\" is a given for all of us. We age, we get sick and at some point we will all die. All of this comes with uncomfortable feelings. \n\nThe \"second arrow\" took me a while to comprehend. It seems easy to tell ourselves not to wail and lament about the pain we are feeling, only to catch ourselves wailing and lamenting again a few minutes later. It is not about telling ourselves to \"toughen up\" or \"get over it already\". That is its own form of sorrowing over what we feel. It is no help telling someone else to \"get a grip\" or \"lighten up\". We can only get there by our own investigation. \n\nThe methods of investigation the Buddha taught us are mindfulness and vipassana. Mindfulness teaches us to know when we are walking, standing, sitting or lying down. These are the four postures to be mindful of. Yet this expands to all our experiences. Vipassana shows us to know every experience we are going through: to know when we are touching, when we are eating, when we are talking, when we are feeling. That knowing of everything that happens, at the moment it arises, that is the practice that will let us overcome our suffering. \n\nI am not saying that I am completely free from suffering. What I can say is life has become easier since I have been able to put down the second arrow sooner than I could before. \n\n\n\n",
    added: "2026-08-20"
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
    excerpt: "Gain and loss, fame and disgrace,\nblame and praise, and pleasure and pain.\nThese qualities among mankind are impermanent,\ntransient, and perishable.\n\nAn intelligent and mindful person knows these things,\nseeing that they’re perishable.\nDesirable things don’t disturb their mind,\nnor are they repelled by the undesirable.",
    note: "This sutta concerns the eight worldly conditions, sometimes called ‘the eight worldly winds’. The word <em>wind </em>immediately gives this image of being at risk to be swept away by it. And that is exactly what seems to happen to us when we get into contact with these eight worldly conditions of gain and loss, fame and disgrace, blame and praise, pleasure and pain.\n\nFor myself, I know I am always eager to receive praise of some kind for the things that I do. Whether it’s doing my job at the office or when I do something nice for my wife. Receiving praise in those instances can light up my day and make me feel good about myself. And it took me a while to see the other side of that coin. Being dependent on praise makes you correspondingly vulnerable to blame. \n\nRecently I have had a couple of incidents where I felt someone blamed me for doing, or even not doing something. And it stung. Not only that, I carried it with me for a couple of days. Thinking about it to myself and, even worse, debating with the other person. All inside this head of mine. Concocting different stories and scenarios to explain why I wasn’t really to blame, or why the other person might also have carried some. Not realizing I was being swept away by this worldly wind. \n\nI took me a few days to see for myself what was happening in this mind. And to notice that although the unpleasant feeling of blame and the pleasant feeling of praise feel very different, they share the same nature. Both arise and cease. Both are subject to change. And when I get caught up in either wanting one or resisting the other, both can become a source of suffering. \n",
    added: "2026-08-31"
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
    label: "",
    title: "Let Go of Philosophy",
    ref: "SN 5.10",
    suttaTitle: "Vajirāsutta",
    translator: "sujato",
    url: "https://suttacentral.net/sn5.10/en/sujato",
    excerpt: "Who created this sentient being?\nWhere is its maker?\nWhere has the being arisen?\nAnd where does it cease?",
    note: "Who doesn't love to philosophize about life? Probably a lot of people don't. But for most of my life, I enjoyed it. Or maybe enjoyment is the wrong word to describe it, because at times I even took it too far. Always questioning everything. So much that my head would hurt.\n\nI wanted to know why and how the world worked, how and why we move through it as we do, and sometimes the most important thing was to find out who was responsible. Who was responsible for this war, or that conspiracy, or even worse, who was responsible for my suffering. Because that surely could not be me, right?\n\nQuestioning the state of the world is like arguing with reality. But I had to ask myself: what would knowing the answers to all these questions actually solve? In fact, often asking the questions leads to the arising of desire, aversion, restlessness, sluggishness and doubts. <a href=\"https://suttacentral.net/sn46.40/en/sujato\" target=\"_blank\" rel=\"noopener\">Hindrances</a> to achieving peace of mind. And when we are not able to live in peace with our own minds, how can we ever create peace in the world we live in?\n\nWhen we say “let it go”, it does not mean we do not care. It means that grasping at our ideas on how it should be prevents us from actually caring for what is in front of us.",
    added: "2026-08-12"
  },
  {
    id: "keepers-2",
    book: "keepers",
    label: "",
    title: "Taking Care of Ourselves, We Take Care of Others",
    ref: "SN 47.19",
    suttaTitle: "Sedakasutta",
    translator: "sujato",
    url: "https://suttacentral.net/sn47.19/en/sujato",
    excerpt: "And how do you look after others by looking after yourself? By development, cultivation, and practice of meditation.\nAnd how do you look after yourself by looking after others? By acceptance, harmlessness, love, and sympathy.",
    note: "When my spouse and I were still in a so-called long distance relationship, we regularly talked about different suttas that piqued our interest. One of these suttas was the Sedakasutta. This sutta describes the story of how the pole acrobat Medakathālikā climbs up a bamboo pole standing above her teacher’s shoulders. When the teacher told Medakathālikā to look after him, and he shall look after her, Medakathālikā quickly corrected her teacher. She told him it wasn’t that simple. He should look after himself, and she’d look after herself.\n\nOften, when we are in a relationship with another, we expect the other to take care of us, and to be the person that will keep us balanced. Oh, how often this turns into disappointment. We get disappointed in the other for not being able to keep us stable and we get disappointed in ourselves for trusting another person with our sanity.\n\nThis sutta let me see this construct we have about relationships, in a different light. Because how can I ever keep another person balanced, when I myself am wobbling. And how can I ever expect another person to keep me straight when I cannot stop shaking and disrupting.\n\nNo, it should be the other way around, exactly as Medakathālikā says in this sutta. When I can cultivate mindfulness and steadiness of mind, I take care of myself. And by taking care of myself, I can now truly take care of others.\n\nThus the practice of meditation, where we spend time looking inside our own mind, is not a selfish act at all. We practice meditation for the benefit of all around us and ultimately, for the benefit of all beings.",
    added: "2026-08-19"
  }];

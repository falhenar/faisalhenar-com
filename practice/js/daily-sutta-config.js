/*
  DAILY SUTTA CONFIG
  -------------------
  Source pool for the "Sutta of the day" block on the practice hub
  (practice/index.html). One entry shows per calendar day — see
  render-daily-sutta.js for the rotation logic — and the quoted line
  links straight to its SuttaCentral page.

  Translations are Bhikkhu Sujato's (CC0) via SuttaCentral by default.
  Note anything else in `translator`.

  Fields:
  id         -> stable identifier, e.g. "sn3.3"
  title      -> the sutta's title as given on SuttaCentral
  ref        -> sutta reference, e.g. "SN 3.3", "AN 8.6", "from DN 21"
  translator -> "sujato" unless noted otherwise
  url        -> direct SuttaCentral link, including segment anchor if the
                quote is from partway through a longer sutta
  text       -> the quoted line(s), verbatim from the cited translation.
                Use \n for line breaks if quoting verse.

  Filled in ten at a time via the add-daily-sutta skill, as FH supplies
  the list of 100 suttas. Starts empty — render-daily-sutta.js removes
  the block from the page entirely until at least one entry exists.
*/

const DAILY_SUTTAS = [
  {
    id: "dn1",
    title: "The Divine Net",
    ref: "DN 1",
    translator: "sujato",
    url: "https://suttacentral.net/dn1/en/sujato",
    text: "Suppose a deft fisherman or his apprentice were to cast a fine-meshed net over a small pond. They’d think: ‘Any sizable creatures in this pond will be trapped in the net. Wherever they emerge they are caught and trapped in this very net.’\nIn the same way, all of these ascetics and brahmins who speculate and theorize about the first beginning or the final end are trapped in the net of these sixty-two grounds, so that wherever they emerge they are caught and trapped in this very net."
  },
  {
    id: "dn2",
    title: "The Fruits of the Ascetic Life",
    ref: "DN 2",
    translator: "sujato",
    url: "https://suttacentral.net/dn2/en/sujato",
    text: "Suppose there was a woman or man who was young, youthful, and fond of adornments, and they check their own reflection in a clean bright mirror or a clear bowl of water. If they had a spot they’d know ‘I have a spot,’ and if they had no spots they’d know ‘I have no spots.’"
  },
  {
    id: "dn3",
    title: "With Ambaṭha",
    ref: "DN 3",
    translator: "sujato",
    url: "https://suttacentral.net/dn3/en/sujato",
    text: "As if he were righting the overturned, or revealing the hidden, or pointing out the path to the lost, or lighting a lamp in the dark so people with clear eyes can see what’s there, just so has the worthy Gotama made the Teaching clear in many ways."
  },
  {
    id: "dn4",
    title: "With Soṇadaṇḍa",
    ref: "DN 4",
    translator: "sujato",
    url: "https://suttacentral.net/dn4/en/sujato",
    text: "For wisdom is cleansed by ethics, and ethics are cleansed by wisdom. Ethics and wisdom always go together. An ethical person is wise, and a wise person ethical. It’s just like when you clean one hand with the other, or clean one foot with the other."
  },
  {
    id: "dn6",
    title: "With Mahāli",
    ref: "DN 6",
    translator: "sujato",
    url: "https://suttacentral.net/dn6/en/sujato",
    text: "It is simply this noble eightfold path, that is: right view, right purpose, right speech, right action, right livelihood, right effort, right mindfulness, and right immersion. This is the path and the practice for realizing these things."
  },
  {
    id: "dn22",
    title: "The Longer Discourse on Mindfulness Meditation",
    ref: "DN 22",
    translator: "sujato",
    url: "https://suttacentral.net/dn22/en/sujato",
    text: "The four kinds of mindfulness meditation are the path to convergence. They are in order to purify sentient beings, to get past sorrow and crying, to make an end of pain and sadness, to discover the system, and to realize extinguishment."
  },
  {
    id: "dn26",
    title: "The Wheel-Turning Monarch",
    ref: "DN 26",
    translator: "sujato",
    url: "https://suttacentral.net/dn26/en/sujato",
    text: "And so, mendicants, from not providing money to the penniless, poverty became widespread. When poverty was widespread, theft became widespread. When theft was widespread, swords became widespread. When swords were widespread, killing living creatures became widespread. And for the sentient beings among whom killing was widespread, their lifespan and beauty declined."
  },
  {
    id: "dn27",
    title: "What Came First",
    ref: "DN 27",
    translator: "sujato",
    url: "https://suttacentral.net/dn27/en/sujato",
    text: "The aristocrat is best among people\nwho take clan as the standard.\nBut one accomplished in knowledge and conduct\nis first among gods and humans."
  },
  {
    id: "dn31",
    title: "Advice to Sigālaka",
    ref: "DN 31",
    translator: "sujato",
    url: "https://suttacentral.net/dn31/en/sujato",
    text: "If you act against the teaching out of favoritism, hostility, cowardice, or stupidity, your fame shrinks, like the moon in the waning fortnight.\nIf you don’t act against the teaching out of favoritism, hostility, cowardice, and stupidity, your fame swells, like the moon in the waxing fortnight."
  },
  {
    id: "dn33",
    title: "Reciting in Concert",
    ref: "DN 33",
    translator: "sujato",
    url: "https://suttacentral.net/dn33/en/sujato",
    text: "You should all recite this in concert, without disputing, so that this spiritual path may last for a long time. That would be for the welfare and happiness of the people, out of sympathy for the world, for the benefit, welfare, and happiness of gods and humans."
  },
  {
    id: "mn1",
    title: "The Root of All Things",
    ref: "MN 1",
    translator: "sujato",
    url: "https://suttacentral.net/mn1/en/sujato",
    text: "The Realized One, the perfected one, the fully awakened Buddha directly knows earth as earth. Having directly known earth as earth, he does not conceive it to be earth, he does not conceive it in earth, he does not conceive it as earth, he does not conceive that ‘earth is mine’, he does not approve earth. Because the Realized One has completely understood it to the end, I say."
  },
  {
    id: "mn2",
    title: "All the Defilements",
    ref: "MN 2",
    translator: "sujato",
    url: "https://suttacentral.net/mn2/en/sujato",
    text: "I say that the ending of defilements is for one who knows and sees, not for one who does not know or see. For one who knows and sees what? Rational application of mind and irrational application of mind. When you apply the mind irrationally, defilements arise, and once arisen they grow. When you apply the mind rationally, defilements don’t arise, and those that have already arisen are given up."
  },
  {
    id: "mn4",
    title: "Fear and Dread",
    ref: "MN 4",
    translator: "sujato",
    url: "https://suttacentral.net/mn4/en/sujato",
    text: "‘Why do I always meditate expecting that fear to come? Why don’t I get rid of that fear and dread just as it comes, while remaining just as I am?’ Then that fear and dread came upon me as I was walking. I didn’t stand still or sit down or lie down until I had got rid of that fear and dread while walking."
  },
  {
    id: "mn10",
    title: "Mindfulness Meditation",
    ref: "MN 10",
    translator: "sujato",
    url: "https://suttacentral.net/mn10/en/sujato",
    text: "Anyone who develops these four kinds of mindfulness meditation in this way for seven years can expect one of two results: enlightenment in this very life, or if there’s residue left behind, non-return. Let alone seven years — anyone who develops these four kinds of mindfulness meditation in this way for seven days can expect one of two results: enlightenment in this very life, or if there’s residue left behind, non-return."
  },
  {
    id: "mn19",
    title: "Two Kinds of Thought",
    ref: "MN 19",
    translator: "sujato",
    url: "https://suttacentral.net/mn19/en/sujato",
    text: "Whatever a mendicant frequently thinks about and considers becomes their heart’s inclination. If they often think about and consider sensual thoughts, they’ve given up the thought of renunciation to cultivate sensual thought. Their mind inclines to sensual thoughts."
  },
  {
    id: "mn20",
    title: "How to Stop Thinking",
    ref: "MN 20",
    translator: "sujato",
    url: "https://suttacentral.net/mn20/en/sujato",
    text: "Take a mendicant who is focusing on some subject that gives rise to bad, unskillful thoughts connected with desire, hate, and delusion. That mendicant should focus on some other subject connected with the skillful. As they do so, those bad thoughts are given up and come to an end. It’s like a deft mason or their apprentice who’d knock out or extract a large peg with a finer peg."
  },
  {
    id: "mn21",
    title: "The Simile of the Saw",
    ref: "MN 21",
    translator: "sujato",
    url: "https://suttacentral.net/mn21/en/sujato",
    text: "Even if low-down bandits were to sever you limb from limb with a two-handed saw, anyone who had a malevolent thought on that account would not be following my instructions.\n‘Our minds will not degenerate. We will blurt out no bad words. We will remain full of sympathy, with a heart of love and no secret hate.’"
  },
  {
    id: "mn22",
    title: "The Simile of the Cobra",
    ref: "MN 22",
    translator: "sujato",
    url: "https://suttacentral.net/mn22/en/sujato",
    text: "Mendicants, I will teach you a simile of the teaching as a raft: for crossing over, not for holding on. By understanding the simile of the raft, you will even give up the teachings, let alone what is not the teachings."
  },
  {
    id: "mn23",
    title: "The Termite Mound",
    ref: "MN 23",
    translator: "sujato",
    url: "https://suttacentral.net/mn23/en/sujato",
    text: "Monk, monk! This termite mound fumes by night and flames by day. The brahmin said, ‘Dig, clever one, having picked up the sword!’"
  },
  {
    id: "mn26",
    title: "The Noble Quest",
    ref: "MN 26",
    translator: "sujato",
    url: "https://suttacentral.net/mn26/en/sujato",
    text: "This principle I have discovered is deep, hard to see, hard to understand, peaceful, sublime, beyond the scope of logic, subtle, comprehensible to the astute. But people like clinging, they love it and enjoy it."
  },
  {
    id: "mn27",
    title: "The Shorter Simile of the Elephant’s Footprint",
    ref: "MN 27",
    translator: "sujato",
    url: "https://suttacentral.net/mn27/en/sujato",
    text: "A skilled bull elephant tracker does not yet come to the conclusion, ‘This must be a big bull elephant.’ Why not? Because in an elephant wood there are dwarf cow elephants with big footprints, and this footprint might be one of theirs."
  },
  {
    id: "mn28",
    title: "The Longer Simile of the Elephant’s Footprint",
    ref: "MN 28",
    translator: "sujato",
    url: "https://suttacentral.net/mn28/en/sujato",
    text: "One who sees dependent origination sees the teaching.\nOne who sees the teaching sees dependent origination."
  },
  {
    id: "mn29",
    title: "The Longer Simile of the Heartwood",
    ref: "MN 29",
    translator: "sujato",
    url: "https://suttacentral.net/mn29/en/sujato",
    text: "Suppose there was a person in need of heartwood. And while wandering in search of heartwood he’d come across a large tree standing with heartwood. He’d cut out just the heartwood and leave knowing it was heartwood."
  },
  {
    id: "mn30",
    title: "The Shorter Simile of the Heartwood",
    ref: "MN 30",
    translator: "sujato",
    url: "https://suttacentral.net/mn30/en/sujato",
    text: "This spiritual life is not lived for the sake of possessions, honor, and popularity, or for accomplishment in ethics, or for accomplishment in immersion, or for knowledge and vision. It is this unshakable freedom of heart that is the goal of the spiritual life, the core and the final end."
  },
  {
    id: "mn31",
    title: "The Shorter Discourse at Gosiṅga",
    ref: "MN 31",
    translator: "sujato",
    url: "https://suttacentral.net/mn31/en/sujato",
    text: "That’s how we live in harmony, appreciating each other, without quarreling, blending like milk and water, and regarding each other with kindly eyes."
  },
  {
    id: "mn32",
    title: "The Longer Discourse at Gosiṅga",
    ref: "MN 32",
    translator: "sujato",
    url: "https://suttacentral.net/mn32/en/sujato",
    text: "The sal forest park at Gosiṅga is lovely, the night is bright, the sal trees are in full blossom, and heavenly scents seem to float on the air. What kind of mendicant would grace this park?"
  },
  {
    id: "mn36",
    title: "The Longer Discourse With Saccaka",
    ref: "MN 36",
    translator: "sujato",
    url: "https://suttacentral.net/mn36/en/sujato",
    text: "Suppose there was a dried up, withered log, and it was lying on dry land far from the water.\nIn the same way, there are ascetics and brahmins who live withdrawn in body and mind from sensual pleasures. And they have internally given up and stilled desire, affection, infatuation, thirst, and passion for sensual pleasures. Regardless of whether or not they suffer painful, sharp, severe, acute feelings due to exertion, they are capable of knowledge and vision, of supreme awakening."
  },
  {
    id: "mn39",
    title: "The Longer Discourse at Assapura",
    ref: "MN 39",
    translator: "sujato",
    url: "https://suttacentral.net/mn39/en/sujato",
    text: "As long as these five hindrances are not given up inside themselves, a mendicant regards them as a debt, a disease, a prison, slavery, and a desert crossing. But when these five hindrances are given up inside themselves, a mendicant regards this as freedom from debt, good health, release from prison, emancipation, and a place of sanctuary at last."
  },
  {
    id: "mn44",
    title: "The Shorter Elaboration",
    ref: "MN 44",
    translator: "sujato",
    url: "https://suttacentral.net/mn44/en/sujato",
    text: "‘What is the counterpart of freedom?’ ‘Extinguishment.’ ‘What is the counterpart of extinguishment?’ ‘Your question goes too far, Visākha. You weren’t able to grasp the limit of questioning. For extinguishment is the objective, destination, and culmination of the spiritual life.’"
  },
  {
    id: "mn52",
    title: "The Wealthy Citizen",
    ref: "MN 52",
    translator: "sujato",
    url: "https://suttacentral.net/mn52/en/sujato",
    text: "‘Even this first absorption is produced by choices and intentions.’ They understand: ‘But whatever is produced by choices and intentions is impermanent and liable to cessation.’"
  },
  {
    id: "mn54",
    title: "With Potaliya the Householder",
    ref: "MN 54",
    translator: "sujato",
    url: "https://suttacentral.net/mn54/en/sujato",
    text: "Suppose a man had borrowed some goods—a gentleman’s carriage and fine jeweled earrings—and preceded and surrounded by these he proceeded through the middle of Āpaṇa. When people saw him they’d say: ‘This must be a wealthy man! For that’s how the wealthy enjoy their wealth.’ But when the owners saw him, they’d take back what was theirs."
  },
  {
    id: "mn61",
    title: "Advice to Rāhula at Ambalaṭṭhika",
    ref: "MN 61",
    translator: "sujato",
    url: "https://suttacentral.net/mn61/en/sujato",
    text: "‘What is the purpose of a mirror?’ ‘It’s for checking your reflection, sir.’ ‘In the same way, deeds of body, speech, and mind should be done only after repeated checking.’"
  },
  {
    id: "mn62",
    title: "The Longer Advice to Rāhula",
    ref: "MN 62",
    translator: "sujato",
    url: "https://suttacentral.net/mn62/en/sujato",
    text: "Rāhula, meditate like the earth. For when you meditate like the earth, pleasant and unpleasant contacts will not occupy your mind."
  },
  {
    id: "mn63",
    title: "The Shorter Discourse With Māluṅkyaputta",
    ref: "MN 63",
    translator: "sujato",
    url: "https://suttacentral.net/mn63/en/sujato",
    text: "Suppose a man was struck by an arrow thickly smeared with poison. His friends and colleagues, relatives and kin would get a surgeon to treat him. But the man would say: ‘I won’t extract this arrow as long as I don’t know whether the man who wounded me was an aristocrat, a brahmin, a peasant, or a menial.’\nThat man would still not have learned these things, and meanwhile they’d die."
  },
  {
    id: "mn85",
    title: "With Prince Bodhi",
    ref: "MN 85",
    translator: "sujato",
    url: "https://suttacentral.net/mn85/en/sujato",
    text: "‘That is the path to awakening!’\n‘Why am I afraid of that pleasure, for it has nothing to do with sensual pleasures or unskillful qualities? I’m not afraid of that pleasure, for it has nothing to do with sensual pleasures or unskillful qualities.’"
  },
  {
    id: "mn86",
    title: "With Aṅgulimāla",
    ref: "MN 86",
    translator: "sujato",
    url: "https://suttacentral.net/mn86/en/sujato",
    text: "“Aṅgulimāla, I have forever stopped— I’ve laid aside violence toward all creatures. But you can’t stop yourself from harming living creatures; that’s why I’ve stopped, but you have not.”"
  },
  {
    id: "mn95",
    title: "With Caṅkī",
    ref: "MN 95",
    translator: "sujato",
    url: "https://suttacentral.net/mn95/en/sujato",
    text: "If a person has faith, they preserve truth by saying, ‘Such is my faith.’ But they don’t yet come to the categorical conclusion: ‘This is the only truth, anything else is futile.’"
  },
  {
    id: "mn98",
    title: "With Vāseṭṭha",
    ref: "MN 98",
    translator: "sujato",
    url: "https://suttacentral.net/mn98/en/sujato",
    text: "You’re not a brahmin by birth,\nnor by birth a non-brahmin.\nYou’re a brahmin by your deeds,\nand by deeds a non-brahmin."
  },
  {
    id: "mn117",
    title: "The Great Forty",
    ref: "MN 117",
    translator: "sujato",
    url: "https://suttacentral.net/mn117/en/sujato",
    text: "In this context, right view comes first. And how does right view come first? When you understand wrong view as wrong view and right view as right view, that’s your right view."
  },
  {
    id: "mn118",
    title: "Mindfulness of Breathing",
    ref: "MN 118",
    translator: "sujato",
    url: "https://suttacentral.net/mn118/en/sujato",
    text: "It’s when a mendicant—gone to a wilderness, or to the root of a tree, or to an empty hut—sits down cross-legged, sets their body straight, and brings mindfulness to the present. Just mindful, they breathe in. Mindful, they breathe out. Breathing in heavily they know: ‘I’m breathing in heavily.’ Breathing out heavily they know: ‘I’m breathing out heavily.’"
  },
  {
    id: "mn119",
    title: "Mindfulness of the Body",
    ref: "MN 119",
    translator: "sujato",
    url: "https://suttacentral.net/mn119/en/sujato",
    text: "When a mendicant has developed and cultivated mindfulness of the body, Māra cannot find a vulnerability and doesn’t get an opportunity. Suppose a person were to throw a light ball of string at a door-panel made entirely of hardwood. Would that light ball of string find an entry into that door-panel made entirely of hardwood?"
  },
  {
    id: "mn121",
    title: "The Shorter Discourse on Emptiness",
    ref: "MN 121",
    translator: "sujato",
    url: "https://suttacentral.net/mn121/en/sujato",
    text: "This field of perception is empty of the perception of the village. It is empty of the perception of people. There is only this that is not emptiness, namely the oneness dependent on the perception of wilderness. And so they regard it as empty of what is not there, but as to what remains they understand that it is present. That’s how emptiness manifests in them—genuine, undistorted, and pure."
  },
  {
    id: "mn131",
    title: "One Fine Night",
    ref: "MN 131",
    translator: "sujato",
    url: "https://suttacentral.net/mn131/en/sujato",
    text: "Don’t run back to the past,\ndon’t anticipate the future.\nWhat’s past is left behind,\nthe future has not arrived;\nand any present phenomenon\nyou clearly discern in every case.\nThe unfaltering, the unshakable:\nhaving known that, foster it.\nToday’s the day to keenly work—\nwho knows, tomorrow may bring death!"
  },
  {
    id: "mn136",
    title: "The Longer Analysis of Deeds",
    ref: "MN 136",
    translator: "sujato",
    url: "https://suttacentral.net/mn136/en/sujato",
    text: "The wanderer Potaliputta’s question should have been answered after analyzing it, but this futile man answered categorically."
  },
  {
    id: "mn140",
    title: "The Analysis of the Elements",
    ref: "MN 140",
    translator: "sujato",
    url: "https://suttacentral.net/mn140/en/sujato",
    text: "There remains only equanimity, pure, bright, pliable, workable, and radiant. It’s like when a deft goldsmith or a goldsmith’s apprentice prepares a forge, fires the crucible, picks up some native gold with tongs and puts it in the crucible. From time to time they fan it, from time to time they sprinkle water on it, and from time to time they just watch over it. That native gold becomes pliable, workable, and radiant, not brittle, and is ready to be worked."
  },
  {
    id: "mn141",
    title: "The Analysis of the Truths",
    ref: "MN 141",
    translator: "sujato",
    url: "https://suttacentral.net/mn141/en/sujato",
    text: "Rebirth is suffering; old age is suffering; death is suffering; sorrow, lamentation, pain, sadness, and distress are suffering; not getting what you wish for is suffering. In brief, the five grasping aggregates are suffering."
  },
  {
    id: "mn148",
    title: "Six By Six",
    ref: "MN 148",
    translator: "sujato",
    url: "https://suttacentral.net/mn148/en/sujato",
    text: "After giving up the underlying tendency to greed for pleasant feeling, after dispelling the underlying tendency to aversion toward painful feeling, after eradicating ignorance in the case of neutral feeling, after giving up ignorance and giving rise to knowledge, it’s quite possible to make an end of suffering in this very life.\nBeing disillusioned, desire fades away. When desire fades away they’re freed. When it is freed, they know it is freed."
  },
  {
    id: "mn152",
    title: "The Development of the Faculties",
    ref: "MN 152",
    translator: "sujato",
    url: "https://suttacentral.net/mn152/en/sujato",
    text: "Then the agreeable, the disagreeable, and the both agreeable and disagreeable that arose in them cease, and equanimity becomes stabilized. It’s like how a strong person can effortlessly snap their fingers. Such is the speed, the swiftness, the ease with which anything agreeable, disagreeable, and both agreeable and disagreeable that arose in them cease, and equanimity becomes stabilized."
  },
  {
    id: "mn12",
    title: "The Longer Discourse on the Lion’s Roar",
    ref: "MN 12",
    translator: "sujato",
    url: "https://suttacentral.net/mn12/en/sujato",
    text: "There are these ten powers of a Realized One that the Realized One possesses. With these he claims the bull’s place, roars his lion’s roar in the assemblies, and turns the divine wheel."
  },
  {
    id: "sn12.1",
    title: "Dependent Origination",
    ref: "SN 12.1",
    translator: "sujato",
    url: "https://suttacentral.net/sn12.1/en/sujato",
    text: "Ignorance is a requirement for choices.\nChoices are a requirement for consciousness.\nConsciousness is a requirement for name and form.\nName and form are requirements for the six sense fields.\nThe six sense fields are requirements for contact.\nContact is a requirement for feeling.\nFeeling is a requirement for craving.\nCraving is a requirement for grasping.\nGrasping is a requirement for continued existence.\nContinued existence is a requirement for rebirth.\nRebirth is a requirement for old age and death, sorrow, lamentation, pain, sadness, and distress to come to be.\nThat is how this entire mass of suffering originates."
  },
  {
    id: "sn12.15",
    title: "Kaccānagotta",
    ref: "SN 12.15",
    translator: "sujato",
    url: "https://suttacentral.net/sn12.15/en/sujato",
    text: "‘All exists’: this is one extreme. ‘All does not exist’: this is the second extreme. Avoiding these two extremes, the Realized One teaches by the middle way."
  },
  {
    id: "sn12.17",
    title: "With Kassapa, the Naked Ascetic",
    ref: "SN 12.17",
    translator: "sujato",
    url: "https://suttacentral.net/sn12.17/en/sujato",
    text: "Suppose that he who does the deed and he who experiences the result are one and the same. Then for one who has existed since the beginning, suffering is made by oneself. In speaking like this, one implies this is eternal.\nSuppose that he who does the deed is one, and he who experiences the result is another. Then for one stricken by feeling, suffering is made by another. In speaking like this, one implies this is annihilated."
  },
  {
    id: "sn12.20",
    title: "Conditions",
    ref: "SN 12.20",
    translator: "sujato",
    url: "https://suttacentral.net/sn12.20/en/sujato",
    text: "Rebirth is a requirement for old age and death. Whether Realized Ones arise or not, this law of nature persists, this regularity of natural principles, this surety of natural principles, specific conditionality. A Realized One awakens to this and comprehends it, then he explains, teaches, asserts, establishes, clarifies, analyzes, and discloses it."
  },
  {
    id: "sn12.23",
    title: "Vital Conditions",
    ref: "SN 12.23",
    translator: "sujato",
    url: "https://suttacentral.net/sn12.23/en/sujato",
    text: "Suffering is the vital condition for faith.\nFaith is the vital condition for joy.\nJoy is the vital condition for rapture.\nRapture is the vital condition for tranquility.\nTranquility is the vital condition for bliss.\nBliss is the vital condition for immersion.\nImmersion is the vital condition for truly knowing and seeing.\nTruly knowing and seeing is the vital condition for disillusionment.\nDisillusionment is the vital condition for dispassion.\nDispassion is the vital condition for freedom.\nFreedom is the vital condition for the knowledge of ending."
  },
  {
    id: "sn12.46",
    title: "A Certain Brahmin",
    ref: "SN 12.46",
    translator: "sujato",
    url: "https://suttacentral.net/sn12.46/en/sujato",
    text: "‘Are he who does the deed and he who experiences the result one and the same?’ ‘He who does the deed and he who experiences the result are one and the same: this is one extreme, brahmin.’ ‘Then is he who does the deed one and he who experiences the result another?’ ‘He who does the deed is one and he who experiences the result is another: this is the second extreme. Avoiding these two extremes, the Realized One teaches by the middle way.’"
  },
  {
    id: "sn12.61",
    title: "Unlearned",
    ref: "SN 12.61",
    translator: "sujato",
    url: "https://suttacentral.net/sn12.61/en/sujato",
    text: "This body made up of the four principal states is seen to last for a year, or for two, three, four, five, ten, twenty, thirty, forty, fifty, or a hundred years, or even longer. But that which is called ‘mind’ and also ‘sentience’ and also ‘consciousness’ arises as one thing and ceases as another all day and all night."
  },
  {
    id: "sn22.59",
    title: "The Characteristic of Not-Self",
    ref: "SN 22.59",
    translator: "sujato",
    url: "https://suttacentral.net/sn22.59/en/sujato",
    text: "Mendicants, form is not-self. For if form were self, it wouldn’t lead to affliction. And you could compel form: ‘May my form be like this! May it not be like that!’ But because form is not-self, it leads to affliction. And you can’t compel form: ‘May my form be like this! May it not be like that!’"
  },
  {
    id: "sn22.48",
    title: "Aggregates",
    ref: "SN 22.48",
    translator: "sujato",
    url: "https://suttacentral.net/sn22.48/en/sujato",
    text: "Any kind of form at all—past, future, or present; internal or external; solid or subtle; inferior or superior; far or near: this is called the aggregate of form.\nAny kind of form at all—past, future, or present; internal or external; solid or subtle; inferior or superior; far or near, which is accompanied by defilements and fuels grasping: this is called the grasping aggregate of form."
  },
  {
    id: "sn22.95",
    title: "A Lump of Foam",
    ref: "SN 22.95",
    translator: "sujato",
    url: "https://suttacentral.net/sn22.95/en/sujato",
    text: "Form is like a lump of foam;\nfeeling is like a bubble;\nperception seems like a mirage;\nchoices like a banana plant;\nand consciousness like an illusion:\nso taught the Kinsman of the Sun.\nHowever you contemplate them,\nexamining them rationally,\nthey’re vacuous and hollow\nwhen you look at them closely."
  },
  {
    id: "sn22.85",
    title: "With Yamaka",
    ref: "SN 22.85",
    translator: "sujato",
    url: "https://suttacentral.net/sn22.85/en/sujato",
    text: "‘As I understand the Buddha’s teaching, a mendicant who has ended the defilements is annihilated and destroyed when their body breaks up, and doesn’t exist after death.’ ‘Don’t say that, Yamaka! Don’t misrepresent the Buddha, for misrepresentation of the Buddha is not good. And the Buddha would not say that.’"
  },
  {
    id: "sn5.10",
    title: "With Vajirā",
    ref: "SN 5.10",
    translator: "sujato",
    url: "https://suttacentral.net/sn5.10/en/sujato",
    text: "When the parts are assembled\nwe use the word ‘chariot’.\nSo too, when the aggregates are present\n‘sentient being’ is the convention we use."
  },
  {
    id: "sn22.1",
    title: "Nakula’s Father",
    ref: "SN 22.1",
    translator: "sujato",
    url: "https://suttacentral.net/sn22.1/en/sujato",
    text: "This body is ailing, swaddled in its shell. If anyone dragging around this body claimed to be healthy even for an hour, what is that but foolishness? So you should train like this: ‘Though my body is ailing, my mind will be healthy.’"
  },
  {
    id: "sn35.28",
    title: "Burning",
    ref: "SN 35.28",
    translator: "sujato",
    url: "https://suttacentral.net/sn35.28/en/sujato",
    text: "Mendicants, all is burning. And what is the all that is burning? The eye is burning. Sights are burning. Eye consciousness is burning. Eye contact is burning. The painful, pleasant, or neutral feeling that arises dependent on eye contact is also burning. Burning with what? Burning with the fires of greed, hate, and delusion. Burning with rebirth, old age, and death, with sorrow, lamentation, pain, sadness, and distress."
  },
  {
    id: "sn35.23",
    title: "All",
    ref: "SN 35.23",
    translator: "sujato",
    url: "https://suttacentral.net/sn35.23/en/sujato",
    text: "Mendicants, I will teach you the all. And what is the all? It’s just the eye and sights, the ear and sounds, the nose and smells, the tongue and tastes, the body and touches, and the mind and ideas. This is called the all."
  },
  {
    id: "sn35.95",
    title: "Māluṅkyaputta",
    ref: "SN 35.95",
    translator: "sujato",
    url: "https://suttacentral.net/sn35.95/en/sujato",
    text: "In that case, when it comes to things that ought be seen, heard, thought, and known: in the seen will be merely the seen; in the heard will be merely the heard; in the thought will be merely the thought; in the known will be merely the known.\nWhen this is the case, you won’t be ‘by that’. When you’re not ‘by that’, you won’t be ‘in that’. When you’re not ‘in that’, you won’t be in this life or the next or in between the two.\nJust this is the end of suffering."
  },
  {
    id: "sn35.82",
    title: "A Question On the World",
    ref: "SN 35.82",
    translator: "sujato",
    url: "https://suttacentral.net/sn35.82/en/sujato",
    text: "‘They speak of this thing called “the world”. How is the world defined?’ ‘It wears away, mendicant, that’s why it’s called “the world”. And what is wearing away? The eye is wearing away. Sights … eye consciousness … eye contact is wearing away. The painful, pleasant, or neutral feeling that arises dependent on eye contact is also wearing away.’"
  },
  {
    id: "sn35.121",
    title: "Advice to Rāhula",
    ref: "SN 35.121",
    translator: "sujato",
    url: "https://suttacentral.net/sn35.121/en/sujato",
    text: "Many thousands of deities followed the Buddha, thinking, ‘Today the Buddha will lead Rāhula further to the ending of defilements!’ Then the Buddha plunged deep into the Dark Forest and sat at the root of a tree.\n‘What do you think, Rāhula? Is the eye permanent or impermanent?’ ‘Impermanent, sir.’ ‘But if it’s impermanent, is it suffering or happiness?’ ‘Suffering, sir.’ ‘But if it’s impermanent, suffering, and perishable, is it fit to be regarded thus: “This is mine, I am this, this is my self”?’ ‘No, sir.’"
  },
  {
    id: "sn35.145",
    title: "Exterior and Cause Are Not-Self",
    ref: "SN 35.145",
    translator: "sujato",
    url: "https://suttacentral.net/sn35.145/en/sujato",
    text: "Sights are not-self. The cause and reason that gives rise to sights is also not-self. Since sights are produced by what is not-self, how could they be self?"
  },
  {
    id: "sn1.1",
    title: "Crossing the Flood",
    ref: "SN 1.1",
    translator: "sujato",
    url: "https://suttacentral.net/sn1.1/en/sujato",
    text: "‘Good fellow, how did you cross the flood?’ ‘Neither standing nor swimming, respectable sir, I crossed the flood.’ ‘But in what way did you cross the flood neither standing nor swimming?’ ‘When I stood, I sank under. When I swam, I was swept away. That’s how I crossed the flood neither standing nor swimming.’"
  },
  {
    id: "an3.65",
    title: "With the Kālāmas of Kesamutta",
    ref: "AN 3.65",
    translator: "sujato",
    url: "https://suttacentral.net/an3.65/en/sujato",
    text: "Please, Kālāmas, don’t go by oral transmission, don’t go by lineage, don’t go by testament, don’t go by canonical authority, don’t rely on logic, don’t rely on inference, don’t go by reasoned train of thought, don’t go by the acceptance of a view after deliberation, don’t go by the appearance of competence, and don’t think ‘The ascetic is our respected teacher.’ But when you know for yourselves: ‘These things are unskillful, blameworthy, criticized by sensible people, and when you undertake them, they lead to harm and suffering’, then you should give them up."
  },
  {
    id: "an10.1",
    title: "What’s the Goal?",
    ref: "AN 10.1",
    translator: "sujato",
    url: "https://suttacentral.net/an10.1/en/sujato",
    text: "So, Ānanda, the goal and benefit of skillful ethics is not having regrets. Joy is the goal and benefit of not having regrets. Rapture is the goal and benefit of joy. Tranquility is the goal and benefit of rapture. Bliss is the goal and benefit of tranquility. Immersion is the goal and benefit of bliss. Truly knowing and seeing is the goal and benefit of immersion. Disillusionment and dispassion is the goal and benefit of truly knowing and seeing. Knowledge and vision of freedom is the goal and benefit of disillusionment and dispassion. So, Ānanda, skillful ethics progressively lead up to the highest."
  },
  {
    id: "an6.55",
    title: "With Soṇa",
    ref: "AN 6.55",
    translator: "sujato",
    url: "https://suttacentral.net/an6.55/en/sujato",
    text: "‘But when your harp’s strings were tuned neither too tight nor too slack, but fixed at an even tension, was it resonant and playable?’ ‘Yes, sir.’ ‘In the same way, Soṇa, when energy is too forceful it leads to restlessness. When energy is too slack it leads to laziness. So, Soṇa, you should focus on energy and serenity, find a balance of the faculties, and learn the character of this situation.’"
  },
  {
    id: "an3.66",
    title: "With Sāḷha and His Friend",
    ref: "AN 3.66",
    translator: "sujato",
    url: "https://suttacentral.net/an3.66/en/sujato",
    text: "A person who is greedy and covetous kills living creatures, steals, commits adultery, lies, and encourages others to do the same. Is that for their lasting harm and suffering?"
  },
  {
    id: "an8.54",
    title: "With Dīghajāṇu",
    ref: "AN 8.54",
    translator: "sujato",
    url: "https://suttacentral.net/an8.54/en/sujato",
    text: "Byagghapajja, these four things lead to the welfare and happiness of a gentleman in this life. What four? Accomplishment in initiative, protection, good friendship, and balanced finances."
  },
  {
    id: "an8.53",
    title: "Brief Advice to Gotamī",
    ref: "AN 8.53",
    translator: "sujato",
    url: "https://suttacentral.net/an8.53/en/sujato",
    text: "You might know that certain things lead to dispassion, not passion; to unyoking, not to yoking; to dispersal, not accumulation; to fewer desires, not more; to contentment, not lack of contentment; to seclusion, not crowding; to energy, not laziness; to being unburdensome, not being burdensome. Categorically, you should remember these things as the teaching, the training, and the Teacher’s instructions."
  },
  {
    id: "an9.34",
    title: "Extinguishment is Bliss",
    ref: "AN 9.34",
    translator: "sujato",
    url: "https://suttacentral.net/an9.34/en/sujato",
    text: "‘Reverends, extinguishment is bliss! Extinguishment is bliss!’ ‘But Reverend Sāriputta, what’s blissful about it, since nothing is felt?’ ‘The fact that nothing is felt is precisely what’s blissful about it.’"
  },
  {
    id: "an10.60",
    title: "With Girimānanda",
    ref: "AN 10.60",
    translator: "sujato",
    url: "https://suttacentral.net/an10.60/en/sujato",
    text: "And what is the perception of impermanence? It’s when a mendicant has gone to a wilderness, or to the root of a tree, or to an empty hut, and reflects like this: ‘Form, feeling, perception, choices, and consciousness are impermanent.’ And so they meditate observing impermanence in the five grasping aggregates. This is called the perception of impermanence."
  },
  {
    id: "an10.61",
    title: "Ignorance",
    ref: "AN 10.61",
    translator: "sujato",
    url: "https://suttacentral.net/an10.61/en/sujato",
    text: "Mendicants, it is said that no prior point of ignorance is found, before which there was no ignorance, and afterwards it came to be. And yet it is evident that there is a specific condition for ignorance. I say that ignorance is fueled by something, it’s not unfueled. And what is the fuel for ignorance? You should say: ‘The five hindrances.’"
  },
  {
    id: "an10.102",
    title: "Awakening Factors",
    ref: "AN 10.102",
    translator: "sujato",
    url: "https://suttacentral.net/an10.102/en/sujato",
    text: "Mendicants, when the seven awakening factors are developed and cultivated they fulfill three knowledges. What seven? The awakening factors of mindfulness, investigation of principles, energy, rapture, tranquility, immersion, and equanimity."
  },
  {
    id: "an11.15",
    title: "The Benefits of Love",
    ref: "AN 11.15",
    translator: "sujato",
    url: "https://suttacentral.net/an11.15/en/sujato",
    text: "Mendicants, you can expect eleven benefits when the heart’s release by love has been cultivated, developed, and practiced, made a vehicle and a basis, kept up, consolidated, and properly implemented. What eleven? You sleep at ease. You wake happily. You don’t have bad dreams. Humans love you. Non-humans love you. Deities protect you. You can’t be harmed by fire, poison, or blade. Your mind quickly enters immersion. Your face is clear and bright. You don’t feel lost when you die. If you don’t penetrate any higher, you’ll be reborn in a realm of divinity."
  },
  {
    id: "an8.41",
    title: "The Sabbath With Eight Factors, In Brief",
    ref: "AN 8.41",
    translator: "sujato",
    url: "https://suttacentral.net/an8.41/en/sujato",
    text: "As long as they live, the perfected ones give up killing living creatures, renouncing the rod and the sword. They are scrupulous and kind, and live full of sympathy for all living beings. I, too, for this day and night will give up killing living creatures, renouncing the rod and the sword. I’ll be scrupulous and kind, and live full of sympathy for all living beings. I will observe the sabbath by doing as the perfected ones do in this respect."
  },
  {
    id: "an4.33",
    title: "The Lion",
    ref: "AN 4.33",
    translator: "sujato",
    url: "https://suttacentral.net/an4.33/en/sujato",
    text: "Toward evening the lion, king of beasts, emerges from his den, yawns, surveys the four quarters, and roars his lion’s roar three times. Then he sets out on the hunt. And the animals who hear the roar of the lion, king of beasts, are typically filled with fear, awe, and terror. They return to their lairs, be they in a hole, the water, or a wood; and the birds take to the air. Even the royal elephants, bound with strong harnesses in the villages, towns, and capital cities, break apart their bonds, and urinate and defecate in terror as they flee here and there."
  },
  {
    id: "snp1.8",
    title: "The Discourse on Love",
    ref: "Sn 1.8",
    translator: "sujato",
    url: "https://suttacentral.net/snp1.8/en/sujato",
    text: "Even as a mother would protect with her life\nher child, her only child,\nso too for all creatures\nunfold a boundless heart.\nWith love for the whole world,\nunfold a boundless heart:\nabove, below, all round,\nunconstricted, without enmity or foe."
  },
  {
    id: "snp2.4",
    title: "Blessings",
    ref: "Sn 2.4",
    translator: "sujato",
    url: "https://suttacentral.net/snp2.4/en/sujato",
    text: "‘Many gods and humans have thought about blessings desiring well-being: declare the highest blessing.’ ‘Not to fraternize with fools, but to fraternize with the wise, and honoring those worthy of honor: this is the highest blessing.’"
  },
  {
    id: "snp2.1",
    title: "Gems",
    ref: "Sn 2.1",
    translator: "sujato",
    url: "https://suttacentral.net/snp2.1/en/sujato",
    text: "There’s no wealth in this life or the next,\nno sublime gem in the heavens,\nthat equals the Realized One.\nThis sublime gem is in the Buddha:\nby this truth, may you be well!"
  },
  {
    id: "snp1.12",
    title: "The Sage",
    ref: "Sn 1.12",
    translator: "sujato",
    url: "https://suttacentral.net/snp1.12/en/sujato",
    text: "Peril stems from intimacy,\ndust comes from an abode.\nFreedom from abode and intimacy:\nthat is the sage’s vision.\nHaving cut down what’s grown, they wouldn’t replant,\nnor would they nurture what’s growing.\nThat’s who they call a sage wandering alone,\nthe great seer has seen the state of peace."
  },
  {
    id: "sn1.34",
    title: "There Are None",
    ref: "SN 1.34",
    translator: "sujato",
    url: "https://suttacentral.net/sn1.34/en/sujato",
    text: "Gloom is born of desire; suffering is born of desire; when desire is removed, gloom is removed; when gloom is removed, suffering is removed."
  },
  {
    id: "sn3.1",
    title: "Young",
    ref: "SN 3.1",
    translator: "sujato",
    url: "https://suttacentral.net/sn3.1/en/sujato",
    text: "Great king, these four things should not be looked down upon or disparaged because they are young. What four? An aristocrat, a serpent, a fire, and a mendicant. These four things should not be looked down upon or disparaged because they are young."
  },
  {
    id: "sn3.25",
    title: "The Simile of the Mountain",
    ref: "SN 3.25",
    translator: "sujato",
    url: "https://suttacentral.net/sn3.25/en/sujato",
    text: "‘I tell you, Great King, I announce to you: old age and death are advancing upon you. Since old age and death are advancing upon you, what would you do?’\n‘Sir, what can I do but practice the teachings, practice morality, doing skillful and good actions?’"
  },
  {
    id: "sn3.9",
    title: "Sacrifice",
    ref: "SN 3.9",
    translator: "sujato",
    url: "https://suttacentral.net/sn3.9/en/sujato",
    text: "Horse sacrifice, human sacrifice, the ‘casting of the yoke-pin’, the ‘royal soma drinking’, and the ‘unimpeded’—these grand, violent sacrifices yield no great fruit. The great sages of right comportment don’t attend sacrifices where goats, sheep, and cattle and various creatures are killed."
  },
  {
    id: "sn5.1",
    title: "With Āḷavikā",
    ref: "SN 5.1",
    translator: "sujato",
    url: "https://suttacentral.net/sn5.1/en/sujato",
    text: "‘There is an escape in the world, and I’ve personally experienced it with wisdom. O Wicked One, kinsman of the negligent, you don’t know that state.\nSensual pleasures are like swords and spears; the aggregates are their chopping block. What you call erotic delight is now no delight for me.’"
  },
  {
    id: "sn46.1",
    title: "The Himalaya",
    ref: "SN 46.1",
    translator: "sujato",
    url: "https://suttacentral.net/sn46.1/en/sujato",
    text: "Mendicants, dragons grow and wax strong supported by the Himalayas, the king of mountains. When they’re strong they dive into the pools. Then they dive into the lakes, the streams, the rivers, and finally the ocean. There they acquire a great and abundant body. In the same way, a mendicant develops and cultivates the seven awakening factors depending on and grounded on ethics, acquiring great and abundant good qualities."
  },
  {
    id: "sn46.54",
    title: "Full of Love",
    ref: "SN 46.54",
    translator: "sujato",
    url: "https://suttacentral.net/sn46.54/en/sujato",
    text: "Come, mendicants, give up these five hindrances, corruptions of the heart that weaken wisdom, and meditate spreading a heart full of love to one direction, and to the second, and to the third, and to the fourth. In the same way above, below, across, everywhere, all around, spread a heart full of love to the whole world—abundant, expansive, limitless, free of enmity and ill will."
  },
  {
    id: "sn47.10",
    title: "The Nuns’ Quarters",
    ref: "SN 47.10",
    translator: "sujato",
    url: "https://suttacentral.net/sn47.10/en/sujato",
    text: "That mendicant should direct their mind toward an inspiring subject as a basis for meditation. As they do so, joy springs up. Being joyful, rapture springs up. When the mind is full of rapture, the body becomes tranquil. When the body is tranquil, one feels bliss. And when blissful, the mind becomes immersed in samādhi."
  },
  {
    id: "sn47.13",
    title: "With Cunda",
    ref: "SN 47.13",
    translator: "sujato",
    url: "https://suttacentral.net/sn47.13/en/sujato",
    text: "Live as your own island, your own refuge, with no other refuge. Let the teaching be your island and your refuge, with no other refuge.\nWhether now or after I have passed, any who shall live as their own island, their own refuge, with no other refuge; with the teaching as their island and their refuge, with no other refuge—those mendicants of mine who want to train shall be among the best of the best."
  }
];

// Belt-and-braces: see the same note in quotes-config.js — `const` at the
// top level of a classic script never lands on window, so this just makes
// the list reachable from the console when debugging.
if (typeof window !== "undefined") {
  window.DAILY_SUTTAS = DAILY_SUTTAS;
}

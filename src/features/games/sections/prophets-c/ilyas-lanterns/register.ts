import { type GameDef, registerGame } from '@/core/games';
import type { BuildPart } from '@/core/games/kit';

import { type Episode, type EpisodeConfig, episodeArt, lessonFact } from '../../prophets-story/episode';
import { type Facts, gameTexts, lazyGame, quran, T } from '../shared';

/*
 * Ilyas – the Quran tells little about him (37:123–132, 6:85), so the three levels are the three parts of what it
 * tells, each with its lesson:
 * L1 his call (37:123–126) – light a lantern for each part of the call along the hill path (BuildScene);
 * L2 the answer of his people (37:127–128) – sort what most of them did and what the sincere servants of Allah were
 *    (episode: sort);
 * L3 how Allah honoured him (37:129–132, 6:85) – connect each honour with its words (episode: connect).
 */

export const ILYAS_ID = 'ilyas-lanterns';

export interface LanternsConfig {
  parts: BuildPart[];
  ghosts: boolean;
  hints: boolean;
  visible: number;
  prompt: string;
}

export type IlyasConfig = LanternsConfig | EpisodeConfig;

export const ilyasI18n = gameTexts(ILYAS_ID, {
  title: T('Lanterns of the Call', 'Laternen des Rufes', 'Fenjeri poziva'),
  description: T(
    'What the Quran tells of Ilyas: his call to Allah alone, the answer of his people and how Allah honoured him – each with its lesson.',
    'Was der Koran von Ilyas erzählt: sein Ruf zu Allah allein, die Antwort seines Volkes und wie Allah ihn ehrte – jedes mit seiner Lehre.',
    'Šta Kur’an kazuje o Ilijasu: njegov poziv jedino Allahu, odgovor njegovog naroda i kako ga je Allah počastio – svaki dio sa svojom poukom.',
  ),
  howTo: T(
    'Level 1: light the lanterns of the call in order. Level 2: sort what the people did. Level 3: connect each honour with its words.',
    'Stufe 1: Zünde die Laternen des Rufes der Reihe nach an. Stufe 2: Sortiere, was das Volk tat. Stufe 3: Verbinde jede Ehre mit ihren Worten.',
    'Nivo 1: upali fenjere poziva redom. Nivo 2: razvrstaj šta je narod činio. Nivo 3: spoji svaku počast s njenim riječima.',
  ),
  'prompt.guided': T(
    'Light the path: which words come next?',
    'Erleuchte den Weg: Welche Worte kommen als Nächstes?',
    'Osvijetli stazu: koje riječi dolaze sljedeće?',
  ),
  'reveal.title': T('The path is full of light', 'Der Weg ist voller Licht', 'Staza je puna svjetla'),
  'reveal.caption': T('"Allah, your Lord and the Lord of your forefathers." (37:126)', '„Allah, euer Herr und der Herr eurer Vorväter.“ (37:126)', '„Allah, Gospodar vaš i Gospodar vaših davnih predaka.“ (37:126)'),
});

const LANTERN = 'prophet.ilyas-lantern';
/** Base points of the path on the 400 × 240 scene (from the bottom left up to the hilltop). */
const BASES: [number, number][] = [
  [92, 226],
  [150, 212],
  [208, 202],
  [252, 182],
  [296, 162],
  [332, 142],
];
const slot = (i: number, scale = 1): BuildPart['slot'] => {
  const w = 0.085 * scale;
  const h = (w * 400 * (120 / 70)) / 240;
  return { x: BASES[i][0] / 400 - w * 0.35, y: BASES[i][1] / 240 - h, w, h };
};

const CALL = [
  {
    id: 'messenger',
    label: T('A messenger', 'Ein Gesandter', 'Poslanik'),
    caption: T('Ilyas was one of the messengers. (37:123)', 'Ilyas war einer der Gesandten. (37:123)', 'Ilijas je bio jedan od poslanika. (37:123)'),
  },
  {
    id: 'fear',
    label: T('Fear Allah', 'Fürchtet Allah', 'Bojte se Allaha'),
    caption: T('"Will you not fear Allah?" (37:124)', '„Wollt ihr denn nicht gottesfürchtig sein?“ (37:124)', '„Zar se nećete Allaha bojati?“ (37:124)'),
  },
  {
    id: 'baal',
    label: T('Not Baʿl', 'Nicht Baal', "Ne Ba'l"),
    caption: T('"Do you call upon Baʿl…" (37:125)', '„Ruft ihr Baal an…“ (37:125)', "„Zar se Ba'lu molite…“ (37:125)"),
  },
  {
    id: 'creator',
    label: T('Best of creators', 'Bester Schöpfer', 'Najljepši Stvoritelj'),
    caption: T('"…and leave the Best of creators?" (37:125)', '„…und lasst den besten Schöpfer?“ (37:125)', '„…a ostavljate Najljepšeg Stvoritelja?“ (37:125)'),
  },
  {
    id: 'lord',
    label: T('Your Lord', 'Euer Herr', 'Vaš Gospodar'),
    caption: T(
      '"Allah, your Lord and the Lord of your forefathers." (37:126)',
      '„Allah, euer Herr und der Herr eurer Vorväter.“ (37:126)',
      '„Allaha, Gospodara vašeg i Gospodara vaših davnih predaka.“ (37:126)',
    ),
  },
] as const;

const part = (id: (typeof CALL)[number]['id'], place: number): BuildPart => {
  const c = CALL.find((x) => x.id === id)!;
  return {
    id,
    label: c.label,
    art: LANTERN,
    sceneArt: LANTERN,
    caption: c.caption,
    slot: slot(place, 1 - place * 0.05),
  };
};

const PARTS = CALL.map((c, i) => part(c.id, i));

export const ILYAS_FACTS = {
  messenger: {
    id: 'ilyas-messenger',
    text: T(
      'Ilyas was one of the messengers. He said to his people: "Will you not fear Allah?"',
      'Ilyas war einer der Gesandten. Er sagte zu seinem Volk: „Wollt ihr denn nicht gottesfürchtig sein?“',
      'Ilijas je bio jedan od poslanika. Rekao je svom narodu: „Zar se nećete Allaha bojati?“',
    ),
    sources: [quran('37:123–124')],
    art: LANTERN,
  },
  creator: {
    id: 'best-of-creators',
    text: T(
      'Ilyas asked: "Do you call upon Baʿl and leave the Best of creators – Allah, your Lord and the Lord of your forefathers?"',
      'Ilyas fragte: „Ruft ihr Baal an und lasst den besten Schöpfer – Allah, euren Herrn und den Herrn eurer Vorväter?“',
      "Ilijas je upitao: „Zar se Ba'lu molite, a ostavljate Najljepšeg Stvoritelja – Allaha, Gospodara vašeg i Gospodara vaših davnih predaka?“",
    ),
    sources: [quran('37:125–126')],
    check: {
      type: 'choice',
      prompt: T('Whom did Ilyas call the Best of creators?', 'Wen nannte Ilyas den besten Schöpfer?', 'Koga je Ilijas nazvao Najljepšim Stvoriteljem?'),
      options: [T('Allah', 'Allah', 'Allaha'), T('Baʿl', 'Baal', "Ba'la"), T('The king', 'Den König', 'Vladara')],
      correctIndex: 0,
    },
  },
  peace: {
    id: 'peace-on-ilyas',
    text: T(
      'Allah kept a good mention of Ilyas among later generations: "Peace be upon Ilyas." This is how Allah rewards those who do good.',
      'Allah bewahrte Ilyas ein gutes Andenken bei den Späteren: „Friede sei auf Ilyas.“ So belohnt Allah die Gutes Tuenden.',
      'Allah je Ilijasu ostavio lijep spomen u kasnijim pokoljenjima: „Mir Ilijasu!“ Tako Allah nagrađuje one koji dobra djela čine.',
    ),
    sources: [quran('37:129–131')],
  },
  righteous: {
    id: 'ilyas-righteous',
    text: T(
      'Zakariyya, Yahya, Isa and Ilyas – each of them was among the righteous.',
      'Zakariyya, Yahya, Isa und Ilyas – jeder von ihnen gehörte zu den Rechtschaffenen.',
      'Zekerijja, Jahja, Isa i Ilijas – svaki od njih bio je od dobrih.',
    ),
    sources: [quran('6:85')],
    check: {
      type: 'trueFalse',
      statement: T('The Quran counts Ilyas among the righteous.', 'Der Koran zählt Ilyas zu den Rechtschaffenen.', "Kur'an ubraja Ilijasa među dobre."),
      correct: true,
    },
  },
  denied: {
    id: 'ilyas-denied',
    text: T(
      'The people of Ilyas called him a liar – except the sincere servants of Allah.',
      'Das Volk von Ilyas bezichtigte ihn der Lüge – außer den aufrichtigen Dienern Allahs.',
      'Ilijasov narod ga je smatrao lažljivcem – osim Allahovih iskrenih robova.',
    ),
    sources: [quran('37:127–128')],
  },
  oneCreator: lessonFact(
    'one-creator',
    T(
      'Worship Allah alone. Only the Creator deserves worship – an idol cannot create anything, but Allah created you and everything around you.',
      'Diene Allah allein. Nur der Schöpfer verdient Anbetung – ein Götze kann nichts erschaffen, Allah aber hat dich und alles um dich herum erschaffen.',
      'Robuj samo Allahu. Samo Stvoritelj zaslužuje ibadet – kip ne može ništa stvoriti, a Allah je stvorio tebe i sve oko tebe.',
    ),
    [quran('37:125–126')],
    { art: LANTERN },
  ),
  fewListen: lessonFact(
    'few-listen',
    T(
      'Stand for the truth, even when only a few are with you. Most of his people turned away, but Ilyas kept calling them to Allah.',
      'Steh zur Wahrheit, auch wenn nur wenige bei dir sind. Die meisten seines Volkes wandten sich ab, doch Ilyas rief sie weiter zu Allah.',
      'Stoj uz istinu, i kada je malo njih s tobom. Većina njegovog naroda okrenula se od njega, ali Ilijas ih je i dalje pozivao Allahu.',
    ),
    [quran('37:124–128')],
  ),
  goodName: lessonFact(
    'good-name',
    T(
      'Do good sincerely for Allah. Allah honoured Ilyas with a good name for all times: "Peace be upon Ilyas."',
      'Tu das Gute aufrichtig für Allah. Allah ehrte Ilyas mit einem guten Namen für alle Zeiten: „Friede sei auf Ilyas.“',
      'Čini dobro iskreno radi Allaha. Allah je Ilijasa počastio lijepim spomenom za sva vremena: „Mir Ilijasu!“',
    ),
    [quran('37:129–132')],
    { art: 'prophet.ilyas-hill-lanterns' },
  ),
} satisfies Facts;

/** L2 – the answer of his people (37:125–128). */
const ANSWER: Episode = {
  kind: 'sort',
  prompt: T(
    'Most of his people turned away. Sort: what did they do – and who were the sincere servants of Allah?',
    'Die meisten seines Volkes wandten sich ab. Sortiere: Was taten sie – und wer waren die aufrichtigen Diener Allahs?',
    'Većina njegovog naroda se okrenula. Razvrstaj: šta su oni činili – a ko su bili Allahovi iskreni robovi?',
  ),
  hints: false,
  bins: [
    { id: 'turned-away', art: 'scene.city', label: T('Most of his people', 'Die meisten seines Volkes', 'Većina njegovog naroda') },
    { id: 'sincere-ones', art: LANTERN, label: T('The sincere servants of Allah', 'Die aufrichtigen Diener Allahs', 'Allahovi iskreni robovi') },
  ],
  items: [
    { id: 'called-liar', bin: 'turned-away', label: T('Called Ilyas a liar', 'Nannten Ilyas einen Lügner', 'Smatrali Ilijasa lažljivcem'), sub: '37:127' },
    { id: 'prayed-to-idol', bin: 'turned-away', label: T('Called upon the idol Baʿl', 'Riefen den Götzen Baal an', 'Molili se kipu Ba’lu'), sub: '37:125' },
    { id: 'left-creator', bin: 'turned-away', label: T('Left the Best of creators', 'Verließen den besten Schöpfer', 'Ostavili Najljepšeg Stvoritelja'), sub: '37:125' },
    { id: 'believed', bin: 'sincere-ones', label: T('Believed his message', 'Glaubten seiner Botschaft', 'Povjerovali su njegovoj poruci'), sub: '37:128' },
    { id: 'saved', bin: 'sincere-ones', label: T('Were saved by Allah', 'Wurden von Allah gerettet', 'Allah ih je spasio'), sub: '37:127–128' },
  ],
  factMap: { 'called-liar': 'ilyas-denied', 'prayed-to-idol': 'lesson-few-listen', 'left-creator': 'lesson-few-listen', believed: 'ilyas-denied', saved: 'ilyas-denied' },
};

/** L3 – how Allah honoured Ilyas (37:129–132, 6:85). */
const HONOURED: Episode = {
  kind: 'connect',
  prompt: T('How did Allah honour Ilyas? Connect each honour with its words.', 'Wie ehrte Allah Ilyas? Verbinde jede Ehre mit ihren Worten.', 'Kako je Allah počastio Ilijasa? Spoji svaku počast s njenim riječima.'),
  hints: false,
  pairs: [
    {
      id: 'good-mention',
      left: { art: 'prophet.ilyas-hill-lanterns', label: T('A good mention', 'Ein gutes Andenken', 'Lijep spomen') },
      right: { label: T('among the later generations (37:129)', 'bei den späteren Generationen (37:129)', 'u kasnijim pokoljenjima (37:129)') },
    },
    {
      id: 'salam',
      left: { art: 'garden.dove', label: T('Peace', 'Friede', 'Mir') },
      right: { label: T('"Peace be upon Ilyas" (37:130)', '„Friede sei auf Ilyas“ (37:130)', '„Mir Ilijasu!“ (37:130)') },
    },
    {
      id: 'reward',
      left: { art: 'object.gift', label: T('A reward', 'Ein Lohn', 'Nagrada') },
      right: { label: T('for those who do good (37:131)', 'für die, die Gutes tun (37:131)', 'za one koji dobro čine (37:131)') },
    },
    {
      id: 'believing-servant',
      left: { art: LANTERN, label: T('His faith', 'Sein Glaube', 'Njegovo vjerovanje') },
      right: { label: T('one of Our believing servants (37:132)', 'einer Unserer gläubigen Diener (37:132)', 'jedan od Naših robova vjernika (37:132)') },
    },
    {
      id: 'among-righteous',
      left: { art: 'garden.sapling', label: T('With Zakariyya, Yahya and Isa', 'Mit Zakariyya, Yahya und Isa', 'Sa Zekerijjom, Jahjom i Isaom') },
      right: { label: T('among the righteous (6:85)', 'unter den Rechtschaffenen (6:85)', 'među dobrima (6:85)') },
    },
  ],
  factMap: { 'good-mention': 'peace-on-ilyas', salam: 'peace-on-ilyas', reward: 'lesson-good-name', 'believing-servant': 'lesson-good-name', 'among-righteous': 'ilyas-righteous' },
};

export const ILYAS_MISSED: Record<string, string> = {
  messenger: ILYAS_FACTS.messenger.id,
  fear: ILYAS_FACTS.messenger.id,
  baal: ILYAS_FACTS.creator.id,
  creator: ILYAS_FACTS.creator.id,
  lord: ILYAS_FACTS.creator.id,
};

export const ilyasGame: GameDef<IlyasConfig> = {
  id: ILYAS_ID,
  topicId: 'prophets',
  i18n: ilyasI18n,
  coverArt: 'prophet.ilyas-hill-lanterns',
  hintArt: LANTERN,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./IlyasGame') as typeof import('./IlyasGame')).IlyasGame),
  levels: [
    {
      level: 1,
      config: { parts: PARTS, ghosts: true, hints: true, visible: 2, prompt: 'prompt.guided' },
      facts: [ILYAS_FACTS.messenger, ILYAS_FACTS.creator, ILYAS_FACTS.oneCreator],
    },
    { level: 2, config: { mode: 'episode', episode: ANSWER }, facts: [ILYAS_FACTS.denied, ILYAS_FACTS.fewListen] },
    { level: 3, config: { mode: 'episode', episode: HONOURED }, facts: [ILYAS_FACTS.peace, ILYAS_FACTS.righteous, ILYAS_FACTS.goodName] },
  ],
  order: 19,
};

export const ILYAS_ART: string[] = ['prophet.ilyas-hills-map', 'prophet.ilyas-hill-lanterns', LANTERN, ...episodeArt(ANSWER), ...episodeArt(HONOURED)];

export function registerIlyasGame(): void {
  registerGame(ilyasGame);
}

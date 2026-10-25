import { type GameDef, registerGame } from '@/core/games';
import type { TimelineEvent, TimelineMark } from '@/core/games/kit';

import { type Episode, type EpisodeConfig, episodeArt, lessonFact } from '../../prophets-story/episode';
import { type Facts, gameTexts, lazyGame, quran, T } from '../shared';

/*
 * Muhammad ﷺ – three events of his life, each with its lesson:
 * L1 the first revelation in the cave of Hira: "Read in the name of your Lord" (96:1–5, Bukhari 3) – put the first
 *    ayahs in order (episode: sequence);
 * L2 the Hijrah: "Do not grieve, Allah is with us" (9:40) – connect the parts of the ayah (episode: connect);
 * L3 the Seal of the Prophets: the chain of the messengers and their scriptures (33:40, 4:163) – place each on the
 *    line of the messengers (TimelineSlider). Only an order the Quran states is used.
 */

export const MUHAMMAD_ID = 'muhammad-messengers-chain';

export type MuhammadConfig = { mode: 'timeline'; marks: TimelineMark[]; events: TimelineEvent[]; hints: boolean; prompt: string } | EpisodeConfig;

export const muhammadI18n = gameTexts(MUHAMMAD_ID, {
  title: T('The Chain of the Messengers', 'Die Kette der Gesandten', 'Lanac poslanika'),
  description: T(
    'Three events of the life of the Prophet ﷺ: the first revelation, the Hijrah and the Seal of the Prophets – each with its lesson.',
    'Drei Ereignisse aus dem Leben des Propheten ﷺ: die erste Offenbarung, die Hidschra und das Siegel der Propheten – jedes mit seiner Lehre.',
    'Tri događaja iz života Poslanika ﷺ: prva objava, Hidžra i pečat vjerovjesnika – svaki sa svojom poukom.',
  ),
  howTo: T(
    'Level 1: put the first ayahs in order. Level 2: connect the parts of the ayah. Level 3: slide the marker to the right messenger and place the card.',
    'Stufe 1: Bring die ersten Verse in die richtige Reihenfolge. Stufe 2: Verbinde die Teile des Verses. Stufe 3: Schieb den Marker zum richtigen Gesandten und lege die Karte ab.',
    'Nivo 1: poredaj prve ajete. Nivo 2: spoji dijelove ajeta. Nivo 3: pomjeri oznaku do pravog poslanika i postavi karticu.',
  ),
  'prompt.books': T(
    'Which messenger was given this? Place it on the chain.',
    'Welchem Gesandten wurde das gegeben? Leg es auf die Kette.',
    'Kojem poslaniku je ovo dato? Postavi ga na lanac.',
  ),
});

const N = {
  adam: T('Adam', 'Adam', 'Adem'),
  nuh: T('Nuh', 'Nuh', 'Nuh'),
  ibrahim: T('Ibrahim', 'Ibrahim', 'Ibrahim'),
  musa: T('Musa', 'Musa', 'Musa'),
  dawud: T('Dawud', 'Dawud', 'Davud'),
  isa: T('Isa', 'Isa', 'Isa'),
  muhammad: T('Muhammad ﷺ', 'Muhammad ﷺ', 'Muhammed ﷺ'),
};
const mark = (id: keyof typeof N): TimelineMark => ({ id, label: N[id] });

const L3_MARKS = (['adam', 'nuh', 'ibrahim', 'musa', 'dawud', 'isa', 'muhammad'] as const).map(mark);
const L3_EVENTS: TimelineEvent[] = [
  { id: 'names', mark: 'adam', art: 'garden.sapling', label: T('Taught the names', 'Die Namen gelehrt', 'Naučen imenima'), sub: '2:31' },
  { id: 'tawrah', mark: 'musa', art: 'object.scroll', label: T('The Tawrah', 'Die Thora', 'Tevrat'), sub: '2:53' },
  { id: 'zabur', mark: 'dawud', art: 'object.book', label: T('The Zabur', 'Der Zabur', 'Zebur'), sub: '4:163' },
  { id: 'injil', mark: 'isa', art: 'prophet.yahya-book', label: T('The Injil', 'Der Indschil', 'Indžil'), sub: '5:46' },
  { id: 'scrolls', mark: 'ibrahim', art: 'object.scroll', label: T('The scrolls of Ibrahim', 'Die Blätter Ibrahims', 'Ibrahimove listove'), sub: '87:19' },
  {
    id: 'seal',
    mark: 'muhammad',
    art: 'prophet.muhammad-star-chain',
    label: T('Seal of the prophets', 'Siegel der Propheten', 'Pečat vjerovjesnika'),
    sub: '33:40',
  },
];

export const MUHAMMAD_FACTS = {
  seal: {
    id: 'seal-of-prophets',
    text: T(
      'Muhammad ﷺ is the Messenger of Allah and the Seal of the Prophets.',
      'Muhammad ﷺ ist der Gesandte Allahs und das Siegel der Propheten.',
      'Muhammed ﷺ je Allahov Poslanik i pečat vjerovjesnika.',
    ),
    sources: [quran('33:40')],
    art: 'prophet.muhammad-star-chain',
    check: {
      type: 'trueFalse',
      statement: T('Muhammad ﷺ is the last prophet.', 'Muhammad ﷺ ist der letzte Prophet.', 'Muhammed ﷺ je posljednji vjerovjesnik.'),
      correct: true,
    },
  },
  books: {
    id: 'the-scriptures',
    text: T(
      'Allah sent down the Tawrah to Musa, gave Dawud the Zabur and Isa the Injil, and sent down the Quran to Muhammad ﷺ, confirming what came before it.',
      'Allah sandte Musa die Thora herab, gab Dawud den Zabur und Isa den Indschil und sandte Muhammad ﷺ den Koran herab, der bestätigt, was vor ihm kam.',
      "Allah je Musau objavio Tevrat, Davudu dao Zebur, a Isau Indžil, i Muhammedu ﷺ objavio Kur'an koji potvrđuje ono što je prije njega bilo.",
    ),
    sources: [quran('2:53; 3:3; 4:163; 5:44–46')],
    art: 'object.book',
    check: {
      type: 'choice',
      prompt: T('Which scripture was given to Dawud?', 'Welche Schrift wurde Dawud gegeben?', 'Koja Knjiga je data Davudu?'),
      options: [T('The Zabur', 'Der Zabur', 'Zebur'), T('The Injil', 'Der Indschil', 'Indžil'), T('The Tawrah', 'Die Thora', 'Tevrat')],
      correctIndex: 0,
    },
  },
  iqra: {
    id: 'first-revelation',
    text: T(
      'The first revelation began with "Read in the name of your Lord who created" – the first ayahs of Surah Al-Alaq.',
      'Die erste Offenbarung begann mit „Lies im Namen deines Herrn, der erschaffen hat“ – den ersten Versen der Sure Al-Alaq.',
      'Prva objava počela je riječima „Čitaj, u ime Gospodara tvoga koji stvara“ – prvim ajetima sure El-Alek.',
    ),
    sources: [quran('96:1–5'), { sourceName: 'Sahih al-Bukhari', sourceReference: '3' }],
    art: 'prophet.muhammad-hira',
  },
  hijrah: {
    id: 'hijrah-cave',
    text: T(
      'During the Hijrah, the Prophet ﷺ hid in a cave with his companion. He said to him: "Do not grieve, Allah is with us." Allah sent down His tranquillity upon him.',
      'Während der Hidschra versteckte sich der Prophet ﷺ mit seinem Gefährten in einer Höhle. Er sagte zu ihm: „Sei nicht traurig, Allah ist mit uns.“ Allah sandte Seine Ruhe auf ihn herab.',
      'Tokom Hidžre Poslanik ﷺ se sa svojim drugom sklonio u pećinu. Rekao mu je: „Ne brini se, Allah je s nama!“ I Allah je na njega spustio Svoj smiraj.',
    ),
    sources: [quran('9:40'), { sourceName: 'Sahih al-Bukhari', sourceReference: '3653' }],
    art: 'place.cave-thawr',
  },
  seekKnowledge: lessonFact(
    'seek-knowledge',
    T(
      'Love learning. The very first word Allah revealed to the Prophet ﷺ was "Read!" – and Allah taught by the pen what people did not know.',
      'Liebe das Lernen. Das allererste Wort, das Allah dem Propheten ﷺ offenbarte, war „Lies!“ – und Allah lehrte mit dem Schreibrohr, was die Menschen nicht wussten.',
      'Voli učenje. Prva riječ koju je Allah objavio Poslaniku ﷺ bila je „Čitaj!“ – a Allah je perom poučio ljude onome što nisu znali.',
    ),
    [quran('96:1–5')],
    { art: 'prophet.muhammad-pen' },
  ),
  allahWithUs: lessonFact(
    'allah-is-with-us',
    T(
      'When you are afraid, remember Allah and trust Him. In the cave the Prophet ﷺ said: "Do not grieve, Allah is with us."',
      'Wenn du Angst hast, denk an Allah und vertraue Ihm. In der Höhle sagte der Prophet ﷺ: „Sei nicht traurig, Allah ist mit uns.“',
      'Kada se bojiš, sjeti se Allaha i osloni se na Njega. U pećini je Poslanik ﷺ rekao: „Ne brini se, Allah je s nama!“',
    ),
    [quran('9:40')],
    { art: 'seerah.thawr-cave' },
  ),
  mercyLesson: lessonFact(
    'mercy-like-the-prophet',
    T(
      'Follow the last messenger ﷺ, who came with the message of all the prophets. Allah sent him as a mercy to the worlds – so be merciful to people and animals too.',
      'Folge dem letzten Gesandten ﷺ, der mit der Botschaft aller Propheten kam. Allah sandte ihn als Barmherzigkeit für die Welten – sei also auch du barmherzig zu Menschen und Tieren.',
      'Slijedi posljednjeg poslanika ﷺ, koji je došao s porukom svih vjerovjesnika. Allah ga je poslao kao milost svjetovima – zato i ti budi milostiv prema ljudima i životinjama.',
    ),
    [quran('21:107'), quran('33:40')],
    { art: 'prophet.muhammad-star-chain' },
  ),
} satisfies Facts;

/** L1 – the first revelation (96:1–5): the first ayahs in their order. */
const REVELATION: Episode = {
  kind: 'sequence',
  prompt: T(
    'In the cave of Hira the first revelation came. Put the first ayahs of Surah Al-Alaq in order, then check.',
    'In der Höhle Hira kam die erste Offenbarung. Bring die ersten Verse der Sure Al-Alaq in die richtige Reihenfolge und prüfe.',
    'U pećini Hira došla je prva objava. Poredaj prve ajete sure El-Alek, pa provjeri.',
  ),
  hints: true,
  items: [
    { id: 'in-hira', art: 'prophet.muhammad-hira', label: T('He reflects in the cave of Hira', 'Er sinnt in der Höhle Hira nach', 'Razmišlja u pećini Hira'), sub: T('Bukhari 3', 'Bukhari 3', 'Buhari 3') },
    { id: 'iqra-read', art: 'object.book', label: T('"Read in the name of your Lord who created"', '„Lies im Namen deines Herrn, der erschaffen hat“', '„Čitaj, u ime Gospodara tvoga koji stvara“'), sub: '96:1' },
    { id: 'clinging-clot', art: 'garden.seed', label: T('"created man from a clinging clot"', '„den Menschen aus einem Anhängsel erschuf“', '„stvara čovjeka od ugruška“'), sub: '96:2' },
    { id: 'by-the-pen', art: 'prophet.muhammad-pen', label: T('"who taught by the pen"', '„der mit dem Schreibrohr lehrte“', '„koji poučava peru“'), sub: '96:4' },
    { id: 'not-known', art: 'object.lamp', label: T('"taught man what he did not know"', '„den Menschen lehrte, was er nicht wusste“', '„koji čovjeka poučava onome što ne zna“'), sub: '96:5' },
  ],
  factMap: { 'in-hira': 'first-revelation', 'iqra-read': 'first-revelation', 'clinging-clot': 'first-revelation', 'by-the-pen': 'lesson-seek-knowledge', 'not-known': 'lesson-seek-knowledge' },
};

/** L2 – the Hijrah: the parts of 9:40. */
const HIJRAH: Episode = {
  kind: 'connect',
  prompt: T('On the Hijrah the Prophet ﷺ hid in a cave. Connect the parts of the ayah (9:40).', 'Auf der Hidschra versteckte sich der Prophet ﷺ in einer Höhle. Verbinde die Teile des Verses (9:40).', 'Na Hidžri se Poslanik ﷺ sklonio u pećinu. Spoji dijelove ajeta (9:40).'),
  hints: false,
  pairs: [
    { id: 'two-in-cave', left: { art: 'place.cave-thawr', label: T('Two in the cave', 'Zwei in der Höhle', 'Dvojica u pećini') }, right: { label: T('the Prophet ﷺ and his companion', 'der Prophet ﷺ und sein Gefährte', 'Poslanik ﷺ i njegov drug') } },
    { id: 'do-not-grieve', left: { art: 'ui.heart', label: T('He said to his companion', 'Er sagte zu seinem Gefährten', 'Rekao je svom drugu') }, right: { label: T('"Do not grieve, Allah is with us"', '„Sei nicht traurig, Allah ist mit uns“', '„Ne brini se, Allah je s nama“') } },
    { id: 'tranquillity', left: { art: 'sky.night', label: T('Allah sent down', 'Allah sandte herab', 'Allah je spustio') }, right: { label: T('His tranquillity upon him', 'Seine Ruhe auf ihn', 'Svoj smiraj na njega') } },
    { id: 'unseen-soldiers', left: { art: 'object.shield', label: T('Allah supported him', 'Allah stärkte ihn', 'Allah ga je pomogao') }, right: { label: T('with soldiers you did not see', 'mit Heerscharen, die ihr nicht saht', 'vojskama koje vi niste vidjeli') } },
    { id: 'word-highest', left: { art: 'object.star8', label: T('The word of Allah', 'Das Wort Allahs', 'Allahova riječ') }, right: { label: T('is the highest', 'ist das Höchste', 'je najviša') } },
  ],
  factMap: { 'two-in-cave': 'hijrah-cave', 'do-not-grieve': 'lesson-allah-is-with-us', tranquillity: 'hijrah-cave', 'unseen-soldiers': 'hijrah-cave', 'word-highest': 'hijrah-cave' },
};

export const MUHAMMAD_MISSED: Record<string, string> = {
  names: MUHAMMAD_FACTS.seal.id,
  tawrah: MUHAMMAD_FACTS.books.id,
  zabur: MUHAMMAD_FACTS.books.id,
  injil: MUHAMMAD_FACTS.books.id,
  scrolls: MUHAMMAD_FACTS.books.id,
  seal: MUHAMMAD_FACTS.seal.id,
};

export const muhammadGame: GameDef<MuhammadConfig> = {
  id: MUHAMMAD_ID,
  topicId: 'prophets',
  i18n: muhammadI18n,
  coverArt: 'prophet.muhammad-star-chain',
  hintArt: 'prophet.muhammad-pen',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./MuhammadGame') as typeof import('./MuhammadGame')).MuhammadGame),
  levels: [
    { level: 1, config: { mode: 'episode', episode: REVELATION }, facts: [MUHAMMAD_FACTS.iqra, MUHAMMAD_FACTS.seekKnowledge] },
    { level: 2, config: { mode: 'episode', episode: HIJRAH }, facts: [MUHAMMAD_FACTS.hijrah, MUHAMMAD_FACTS.allahWithUs] },
    {
      level: 3,
      config: { mode: 'timeline', marks: L3_MARKS, events: L3_EVENTS, hints: false, prompt: 'prompt.books' },
      facts: [MUHAMMAD_FACTS.seal, MUHAMMAD_FACTS.books, MUHAMMAD_FACTS.mercyLesson],
    },
  ],
  order: 25,
};

export const MUHAMMAD_ART: string[] = ['prophet.muhammad-night-band', ...L3_EVENTS.flatMap((e) => (e.art ? [e.art] : [])), ...episodeArt(REVELATION), ...episodeArt(HIJRAH)];

export function registerMuhammadGame(): void {
  registerGame(muhammadGame);
}

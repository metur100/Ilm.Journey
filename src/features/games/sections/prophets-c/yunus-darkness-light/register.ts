import { type GameDef, registerGame } from '@/core/games';
import type { KitItem } from '@/core/games/kit';

import { type Episode, type EpisodeConfig, episodeArt, lessonFact } from '../../prophets-story/episode';
import { type Facts, gameTexts, lazyGame, quran, T } from '../shared';

/*
 * Yunus – three events of his life (21:87–88, 37:139–148, 10:98), each with its lesson:
 * L1 he left his people in anger, the ship and the great fish (21:87, 37:139–142) – put the events in order
 *    (episode: sequence);
 * L2 the dua in the darknesses (21:87–88) – build the dua tile by tile; with every tile the darkness (of the night,
 *    the sea and inside the fish – Ibn Kathir on 21:87) gives way to light, and the gourd plant appears (WordTiles);
 * L3 cast on the shore, the gourd plant and his people who believed (37:145–148, 10:98) (episode: connect).
 */

export const YUNUS_ID = 'yunus-darkness-light';

export interface DuaConfig {
  target: KitItem[];
  distractors?: KitItem[];
  quran: boolean;
  hints: boolean;
  prompt: string;
}

export type YunusConfig = DuaConfig | EpisodeConfig;

export const yunusI18n = gameTexts(YUNUS_ID, {
  title: T('Light in the Darknesses', 'Licht in den Finsternissen', 'Svjetlo u tminama'),
  description: T(
    'Three events of the life of Yunus: the ship and the great fish, his dua in the darknesses and the shore where his people believed – each with its lesson.',
    'Drei Ereignisse aus dem Leben von Yunus: das Schiff und der große Fisch, sein Du’a in den Finsternissen und das Ufer, an dem sein Volk glaubte – jedes mit seiner Lehre.',
    'Tri događaja iz Junusova života: lađa i velika riba, njegova dova u tminama i obala na kojoj je njegov narod povjerovao – svaki sa svojom poukom.',
  ),
  howTo: T(
    'Level 1: put the events in order. Level 2: tap or drag the tiles of the dua into place. Level 3: connect each event with what happened.',
    'Stufe 1: Bring die Ereignisse in die richtige Reihenfolge. Stufe 2: Tippe oder zieh die Kacheln des Du’a an ihren Platz. Stufe 3: Verbinde jedes Ereignis mit dem, was geschah.',
    'Nivo 1: poredaj događaje. Nivo 2: dodirni ili prevuci pločice dove na mjesto. Nivo 3: spoji svaki događaj s onim što se desilo.',
  ),
  'prompt.meaning': T(
    'Build the dua of Yunus – what did he call out in the darkness?',
    'Bilde das Du’a von Yunus – was rief er in der Dunkelheit?',
    'Složi Junusovu dovu – šta je zavapio u tmini?',
  ),
  'scene.dark': T('Darkness of the night, the sea and the fish', 'Dunkelheit der Nacht, des Meeres und des Fisches', 'Tmina noći, mora i ribe'),
  'scene.light': T(
    'Allah answered him – the gourd plant grows on the shore.',
    'Allah erhörte ihn – am Ufer wächst die Kürbispflanze.',
    'Allah mu se odazvao – na obali raste tikva.',
  ),
});

const MEANING: KitItem[] = [
  { id: 'no-god', label: T('There is no god', 'Es gibt keinen Gott', 'Nema boga') },
  { id: 'but-you', label: T('but You.', 'außer Dir.', 'osim Tebe,') },
  { id: 'glory', label: T('Glory be to You!', 'Preis sei Dir!', 'hvaljen neka si!') },
  { id: 'wrong', label: T('I have been one of the wrongdoers.', 'Ich gehörte zu den Unrechttuenden.', 'ja sam se prema sebi ogriješio.') },
];
const MEANING_EXTRA: KitItem[] = [{ id: 'x-complain', label: T('I give up!', 'Ich gebe auf!', 'Odustajem!') }];

export const YUNUS_FACTS = {
  ship: {
    id: 'yunus-ship',
    text: T(
      'Yunus went away in anger and boarded a fully loaded ship. Lots were drawn, and he was the one who lost. A great fish swallowed him, while he blamed himself.',
      'Yunus ging im Zorn fort und bestieg ein voll beladenes Schiff. Es wurde gelost, und er war es, der verlor. Ein großer Fisch verschlang ihn, während er sich selbst tadelte.',
      'Junus je otišao srdit i ukrcao se na krcatu lađu. Bacan je kocka i on je izgubio. Progutala ga je velika riba, a on je sebe korio.',
    ),
    sources: [quran('21:87'), quran('37:139–142')],
    art: 'prophet.yunus-ship',
  },
  admit: lessonFact(
    'admit-mistakes',
    T(
      'When you make a mistake, admit it and turn to Allah. Yunus blamed himself – saying "I was wrong" is a strength, not a weakness.',
      'Wenn du einen Fehler machst, gib ihn zu und wende dich an Allah. Yunus tadelte sich selbst – „Ich lag falsch“ zu sagen ist eine Stärke, keine Schwäche.',
      'Kada pogriješiš, priznaj to i obrati se Allahu. Junus je sebe korio – reći „pogriješio sam“ je snaga, a ne slabost.',
    ),
    [quran('37:142'), quran('21:87')],
    { art: 'prophet.yunus-whale' },
  ),
  dua: {
    id: 'yunus-dua',
    text: T(
      'In the darknesses Yunus called out: "There is no god but You. Glory be to You! I have been one of the wrongdoers."',
      'In den Finsternissen rief Yunus: „Es gibt keinen Gott außer Dir. Preis sei Dir! Ich gehörte zu den Unrechttuenden.“',
      'U tminama je Junus zavapio: „Nema boga osim Tebe, hvaljen neka si! Ja sam se prema sebi ogriješio.“',
    ),
    sources: [quran('21:87')],
    art: 'prophet.yunus-light',
  },
  answered: {
    id: 'allah-answered',
    text: T(
      'Allah answered Yunus and saved him from distress – and this is how Allah saves the believers.',
      'Allah erhörte Yunus und rettete ihn aus der Not – und so rettet Allah die Gläubigen.',
      'Allah se odazvao Junusu i spasio ga iz nevolje – i tako Allah spašava vjernike.',
    ),
    sources: [quran('21:88')],
    check: {
      type: 'trueFalse',
      statement: T('Allah answered the call of Yunus.', 'Allah erhörte den Ruf von Yunus.', 'Allah se odazvao Junusovom vapaju.'),
      correct: true,
    },
  },
  hope: lessonFact(
    'never-lose-hope',
    T(
      'Never lose hope – make dua. Even in the deepest darkness Yunus turned to Allah, and Allah answered him.',
      'Verliere nie die Hoffnung – sprich Du’a. Selbst in der tiefsten Dunkelheit wandte sich Yunus an Allah, und Allah erhörte ihn.',
      'Nikad ne gubi nadu – uputi dovu. Čak i u najdubljoj tami Junus se obratio Allahu, i Allah mu se odazvao.',
    ),
    [quran('21:87–88')],
    { art: 'prophet.yunus-light' },
  ),
  gourd: {
    id: 'gourd-plant',
    text: T(
      'The fish cast Yunus onto an open shore while he was ill, and Allah caused a gourd plant to grow over him. Then his people – a hundred thousand or more – believed.',
      'Der Fisch warf Yunus krank an ein offenes Ufer, und Allah ließ eine Kürbispflanze über ihm wachsen. Dann glaubte sein Volk – hunderttausend oder mehr.',
      'Riba je izbacila bolesnog Junusa na golu obalu, a Allah je dao da nad njim izraste tikva. Zatim je njegov narod – sto hiljada ili više – povjerovao.',
    ),
    sources: [quran('37:145–148')],
    art: 'prophet.yunus-gourd',
    check: {
      type: 'choice',
      prompt: T('What grew over Yunus on the shore?', 'Was wuchs am Ufer über Yunus?', 'Šta je izraslo nad Junusom na obali?'),
      options: [T('A gourd plant', 'Eine Kürbispflanze', 'Tikva'), T('An apple tree', 'Ein Apfelbaum', 'Jabuka'), T('A palm tree', 'Eine Palme', 'Palma')],
      correctIndex: 0,
    },
  },
  mercy: lessonFact(
    'allah-accepts-return',
    T(
      'Allah’s mercy is near to everyone who returns to Him. He saved Yunus, and when his people believed, He took the disgrace away from them.',
      'Allahs Barmherzigkeit ist jedem nahe, der zu Ihm umkehrt. Er rettete Yunus, und als sein Volk glaubte, nahm Er die Schande von ihnen.',
      'Allahova milost je blizu svakome ko Mu se vrati. Spasio je Junusa, a kada je njegov narod povjerovao, otklonio je od njih sramotu.',
    ),
    [quran('37:145–148'), quran('10:98')],
    { art: 'prophet.yunus-gourd' },
  ),
} satisfies Facts;

/** L1 – leaving, the ship and the fish (21:87, 37:139–142). */
const SHIP: Episode = {
  kind: 'sequence',
  prompt: T('What happened to Yunus? Put the events in order, then check.', 'Was geschah mit Yunus? Bring die Ereignisse in die richtige Reihenfolge und prüfe.', 'Šta se desilo Junusu? Poredaj događaje, pa provjeri.'),
  hints: true,
  items: [
    { id: 'went-away', art: 'scene.city', label: T('Yunus goes away in anger', 'Yunus geht im Zorn fort', 'Junus odlazi srdit'), sub: '21:87' },
    { id: 'loaded-ship', art: 'prophet.yunus-ship', label: T('He boards a fully loaded ship', 'Er besteigt ein voll beladenes Schiff', 'Ukrcava se na krcatu lađu'), sub: '37:140' },
    { id: 'lots-drawn', art: 'prophet.yunus-sea-band', label: T('Lots are drawn – he loses', 'Es wird gelost – er verliert', 'Baca se kocka – on gubi'), sub: '37:141' },
    { id: 'great-fish', art: 'prophet.yunus-whale', label: T('A great fish swallows him', 'Ein großer Fisch verschlingt ihn', 'Proguta ga velika riba'), sub: '37:142' },
    { id: 'blamed-himself', art: 'prophet.yunus-darkness', label: T('He blames himself', 'Er tadelt sich selbst', 'On sebe kori'), sub: '37:142' },
  ],
  factMap: { 'went-away': 'yunus-ship', 'loaded-ship': 'yunus-ship', 'lots-drawn': 'yunus-ship', 'great-fish': 'yunus-ship', 'blamed-himself': 'lesson-admit-mistakes' },
};

/** L3 – the shore, the gourd plant and his people (37:145–148, 10:98). */
const SHORE: Episode = {
  kind: 'connect',
  prompt: T('Allah saved Yunus. Connect each event with what happened.', 'Allah rettete Yunus. Verbinde jedes Ereignis mit dem, was geschah.', 'Allah je spasio Junusa. Spoji svaki događaj s onim što se desilo.'),
  hints: false,
  pairs: [
    { id: 'open-shore', left: { art: 'scene.sea-coast', label: T('Cast onto an open shore', 'An ein offenes Ufer geworfen', 'Izbačen na golu obalu') }, right: { label: T('while he was weak and ill (37:145)', 'schwach und krank (37:145)', 'slab i bolestan (37:145)') } },
    { id: 'gourd', left: { art: 'prophet.yunus-gourd', label: T('A gourd plant', 'Eine Kürbispflanze', 'Tikva') }, right: { label: T('Allah made it grow over him (37:146)', 'Allah ließ sie über ihm wachsen (37:146)', 'Allah je dao da nad njim izraste (37:146)') } },
    { id: 'sent-again', left: { art: 'scene.city', label: T('Sent to his people', 'Zu seinem Volk gesandt', 'Poslan svom narodu') }, right: { label: T('a hundred thousand or more (37:147)', 'hunderttausend oder mehr (37:147)', 'sto hiljada ili više (37:147)') } },
    { id: 'they-believed', left: { art: 'garden.sapling', label: T('His people believed', 'Sein Volk glaubte', 'Njegov narod je povjerovao') }, right: { label: T('Allah let them enjoy life for a time (37:148)', 'Allah ließ sie eine Zeit lang das Leben genießen (37:148)', 'Allah im je dao da uživaju neko vrijeme (37:148)') } },
    { id: 'disgrace-removed', left: { art: 'sky.dawn', label: T('The people of Yunus', 'Das Volk von Yunus', 'Junusov narod') }, right: { label: T('Allah took the disgrace away from them (10:98)', 'Allah nahm die Schande von ihnen (10:98)', 'Allah je od njih otklonio sramotu (10:98)') } },
  ],
  factMap: { 'open-shore': 'gourd-plant', gourd: 'gourd-plant', 'sent-again': 'gourd-plant', 'they-believed': 'lesson-allah-accepts-return', 'disgrace-removed': 'lesson-allah-accepts-return' },
};

export const yunusGame: GameDef<YunusConfig> = {
  id: YUNUS_ID,
  topicId: 'prophets',
  i18n: yunusI18n,
  coverArt: 'prophet.yunus-whale',
  hintArt: 'prophet.yunus-light',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./YunusGame') as typeof import('./YunusGame')).YunusGame),
  levels: [
    { level: 1, config: { mode: 'episode', episode: SHIP }, facts: [YUNUS_FACTS.ship, YUNUS_FACTS.admit] },
    // One gentle distractor ("I give up!") – Yunus turned to Allah instead.
    {
      level: 2,
      config: { target: MEANING, distractors: MEANING_EXTRA, quran: false, hints: false, prompt: 'prompt.meaning' },
      facts: [YUNUS_FACTS.dua, YUNUS_FACTS.answered, YUNUS_FACTS.hope],
    },
    { level: 3, config: { mode: 'episode', episode: SHORE }, facts: [YUNUS_FACTS.gourd, YUNUS_FACTS.mercy] },
  ],
  order: 21,
};

/** Tile id → fact the learner practises when going wrong there (L2). */
export const YUNUS_MISSED: Record<string, string> = {
  'no-god': YUNUS_FACTS.dua.id,
  'but-you': YUNUS_FACTS.dua.id,
  glory: YUNUS_FACTS.dua.id,
  wrong: YUNUS_FACTS.dua.id,
  'x-complain': YUNUS_FACTS.hope.id,
};

export const YUNUS_ART: string[] = [
  'prophet.yunus-darkness',
  'prophet.yunus-light',
  'prophet.yunus-gourd',
  'prophet.yunus-whale',
  'prophet.yunus-gourd-sprout',
  ...episodeArt(SHIP),
  ...episodeArt(SHORE),
];

export function registerYunusGame(): void {
  registerGame(yunusGame);
}

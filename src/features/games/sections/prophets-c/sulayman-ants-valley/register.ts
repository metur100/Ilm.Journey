import { type GameDef, registerGame } from '@/core/games';
import type { PathStop } from '@/core/games/kit';

import { type Episode, type EpisodeConfig, episodeArt, lessonFact } from '../../prophets-story/episode';
import { type Facts, gameTexts, lazyGame, quran, T } from '../shared';

/*
 * Sulayman – three events of his life (27:15–44), each with its lesson:
 * L1 the valley of the ants (27:17–19) – trace the way around the anthills (PathTrace), nothing is harmed;
 * L2 the hoopoe's news from Saba' (27:20–28) – put the events in order (episode: sequence);
 * L3 the letter, the gift, the throne and the queen who submitted to Allah (27:29–44) – connect each event with what
 * was said (episode: connect). The throne is narrated, never played.
 */

export const SULAYMAN_ID = 'sulayman-ants-valley';

export interface ValleyConfig {
  map: string;
  stops: PathStop[];
  showRoute: boolean;
  hints: boolean;
  prompt: string;
}

export type SulaymanConfig = ValleyConfig | EpisodeConfig;

export const sulaymanI18n = gameTexts(SULAYMAN_ID, {
  title: T('The Valley of the Ants', 'Das Tal der Ameisen', 'Dolina mrava'),
  description: T(
    'Three events of Sulayman’s life: the valley of the ants, the hoopoe’s news from Saba’ and the queen who submitted to Allah – each with its lesson.',
    'Drei Ereignisse aus Sulaimans Leben: das Tal der Ameisen, die Nachricht des Wiedehopfs aus Saba’ und die Königin, die sich Allah ergab – jedes mit seiner Lehre.',
    'Tri događaja iz Sulejmanova života: dolina mrava, pupavčeva vijest iz Sebe i kraljica koja se predala Allahu – svaki sa svojom poukom.',
  ),
  howTo: T(
    'Level 1: trace the way around the anthills. Level 2: put the hoopoe’s news in order. Level 3: connect each event with what was said.',
    'Stufe 1: Fahre den Weg um die Ameisenhügel nach. Stufe 2: Bring die Nachricht des Wiedehopfs in die richtige Reihenfolge. Stufe 3: Verbinde jedes Ereignis mit dem, was gesagt wurde.',
    'Nivo 1: prati put oko mravinjaka. Nivo 2: poredaj pupavčevu vijest. Nivo 3: spoji svaki događaj s onim što je rečeno.',
  ),
  'prompt.valley': T(
    'Lead the way around the anthills – keep every ant safe.',
    'Führe den Weg um die Ameisenhügel – keine Ameise soll zu Schaden kommen.',
    'Vodi put oko mravinjaka – nijedan mrav da ne strada.',
  ),
});

const S = {
  start: T('Start', 'Start', 'Početak'),
  around: T('Around the hill', 'Um den Hügel', 'Oko brežuljka'),
  between: T('Between the hills', 'Zwischen den Hügeln', 'Između brežuljaka'),
  end: T('Safe!', 'Sicher!', 'Sigurno!'),
};

/** Stops through the valley (fractions of the 400 × 240 map): above each anthill, down between them. */
const VALLEY: PathStop[] = [
  { id: 'v-start', at: { x: 0.05, y: 0.9 }, label: S.start, art: 'prophet.sulayman-banner' },
  {
    id: 'v-hill-1',
    at: { x: 0.17, y: 0.64 },
    label: S.around,
    caption: T('The army marched in ordered ranks.', 'Das Heer zog in geordneten Reihen.', 'Vojska je išla u urednim redovima.'),
  },
  { id: 'v-gap-1', at: { x: 0.33, y: 0.88 }, label: S.between },
  {
    id: 'v-hill-2',
    at: { x: 0.49, y: 0.62 },
    label: S.around,
    caption: T(
      '"O ants, go into your homes!" – the ant warned her people.',
      '„Ihr Ameisen, geht in eure Wohnungen!“ – die Ameise warnte ihr Volk.',
      '„O mravi, uđite u svoja prebivališta!“ – mrav je upozorio svoj narod.',
    ),
  },
  { id: 'v-gap-2', at: { x: 0.66, y: 0.88 }, label: S.between },
  {
    id: 'v-hill-3',
    at: { x: 0.82, y: 0.63 },
    label: S.around,
    caption: T('Sulayman smiled at her words.', 'Sulaiman lächelte über ihre Worte.', 'Sulejman se nasmiješio njegovim riječima.'),
  },
  {
    id: 'v-end',
    at: { x: 0.95, y: 0.86 },
    label: S.end,
    art: 'prophet.sulayman-anthill',
    caption: T(
      'Every ant is safe. Sulayman thanked Allah for His favour.',
      'Jede Ameise ist sicher. Sulaiman dankte Allah für Seine Gunst.',
      'Svi mravi su sigurni. Sulejman je zahvalio Allahu na Njegovoj blagodati.',
    ),
  },
];

export const SULAYMAN_FACTS = {
  ants: {
    id: 'ant-warning',
    text: T(
      'When Sulayman’s army came to the valley of the ants, an ant said: "O ants, go into your homes, so that Sulayman and his soldiers do not crush you without noticing."',
      'Als Sulaimans Heer zum Tal der Ameisen kam, sagte eine Ameise: „Ihr Ameisen, geht in eure Wohnungen, damit Sulaiman und seine Heere euch nicht zertreten, ohne es zu merken.“',
      'Kada je Sulejmanova vojska stigla u dolinu mrava, jedan mrav je rekao: „O mravi, uđite u svoja prebivališta da vas ne izgaze Sulejman i vojske njegove, a da to i ne primijete.“',
    ),
    sources: [quran('27:18')],
    art: 'prophet.sulayman-anthill',
    check: {
      type: 'trueFalse',
      statement: T(
        'An ant warned the other ants to go into their homes.',
        'Eine Ameise warnte die anderen Ameisen, in ihre Wohnungen zu gehen.',
        'Jedan mrav je upozorio ostale mrave da uđu u svoja prebivališta.',
      ),
      correct: true,
    },
  },
  smile: {
    id: 'sulayman-dua',
    text: T(
      'Sulayman smiled at the ant’s words and prayed: "My Lord, help me to be grateful for Your favour on me and on my parents, and to do good that pleases You."',
      'Sulaiman lächelte über die Worte der Ameise und betete: „Mein Herr, hilf mir, dankbar zu sein für Deine Gunst an mir und an meinen Eltern, und Gutes zu tun, das Dir gefällt.“',
      'Sulejman se nasmiješio riječima mrava i zamolio: „Gospodaru moj, pomozi mi da budem zahvalan na Tvojoj blagodati kojom si obasuo mene i roditelje moje i da činim dobro kojim ćeš Ti zadovoljan biti.“',
    ),
    sources: [quran('27:19')],
  },
  smallCreatures: lessonFact(
    'small-creatures',
    T(
      'Care for the smallest creatures and thank Allah for His gifts. A great king stopped for a tiny ant and said: "My Lord, help me to be grateful."',
      'Achte auch auf die kleinsten Geschöpfe und danke Allah für Seine Gaben. Ein großer König hielt für eine winzige Ameise an und sagte: „Mein Herr, hilf mir, dankbar zu sein.“',
      'Pazi i na najmanja stvorenja i zahvaljuj Allahu na Njegovim darovima. Veliki vladar zastao je zbog malenog mrava i rekao: „Gospodaru moj, pomozi mi da budem zahvalan.“',
    ),
    [quran('27:18–19')],
    { art: 'prophet.sulayman-anthill' },
  ),
  hoopoe: {
    id: 'hoopoe-news',
    text: T(
      'The hoopoe brought Sulayman sure news from Saba’: a woman ruled them, and they bowed down to the sun instead of Allah. Sulayman said: "We will see whether you have told the truth," and sent it with his letter.',
      'Der Wiedehopf brachte Sulaiman sichere Nachricht aus Saba’: Eine Frau herrschte über sie, und sie warfen sich vor der Sonne nieder statt vor Allah. Sulaiman sagte: „Wir werden sehen, ob du die Wahrheit gesagt hast“, und schickte ihn mit seinem Brief.',
      'Pupavac je Sulejmanu donio pouzdanu vijest iz Sebe: vladala im je žena, a sedždu su činili Suncu umjesto Allahu. Sulejman je rekao: „Vidjet ćemo da li si istinu rekao“, i poslao ga sa svojim pismom.',
    ),
    sources: [quran('27:20–28')],
    art: 'prophet.sulayman-hoopoe-letter',
    check: {
      type: 'choice',
      prompt: T('From which land did the hoopoe bring news?', 'Aus welchem Land brachte der Wiedehopf Nachricht?', 'Iz koje je zemlje pupavac donio vijest?'),
      options: [T('Saba’', 'Saba’', 'Seba'), T('Egypt', 'Ägypten', 'Egipat'), T('Madyan', 'Madyan', 'Medjen')],
      correctIndex: 0,
    },
  },
  checkNews: lessonFact(
    'check-the-news',
    T(
      'Check news before you believe it or pass it on. Sulayman did not judge too fast: "We will see whether you have told the truth."',
      'Prüfe eine Nachricht, bevor du sie glaubst oder weitersagst. Sulaiman urteilte nicht vorschnell: „Wir werden sehen, ob du die Wahrheit gesagt hast.“',
      'Provjeri vijest prije nego što povjeruješ ili je preneseš. Sulejman nije presudio prebrzo: „Vidjet ćemo da li si istinu rekao.“',
    ),
    [quran('27:27')],
    { art: 'animal.hoopoe' },
  ),
  letter: {
    id: 'noble-letter',
    text: T(
      'Sulayman’s letter began with "In the name of Allah, the Most Merciful, the Most Kind." In the end the queen of Saba’ said: "I submit with Sulayman to Allah, the Lord of the worlds."',
      'Sulaimans Brief begann mit „Im Namen Allahs, des Allerbarmers, des Barmherzigen.“ Am Ende sagte die Königin von Saba’: „Ich ergebe mich mit Sulaiman Allah, dem Herrn der Welten.“',
      'Sulejmanovo pismo počinjalo je riječima „U ime Allaha, Milostivog, Samilosnog.“ Na kraju je kraljica Sebe rekla: „Predajem se, zajedno sa Sulejmanom, Allahu, Gospodaru svjetova.“',
    ),
    sources: [quran('27:30'), quran('27:44')],
    art: 'prophet.sulayman-letter',
  },
  grateful: lessonFact(
    'grateful',
    T(
      'Every gift is a test of thankfulness. When the throne was brought, Sulayman said: "This is from the favour of my Lord, to test me whether I am grateful." Say the same when you receive something good.',
      'Jede Gabe ist eine Prüfung der Dankbarkeit. Als der Thron gebracht wurde, sagte Sulaiman: „Dies ist von der Huld meines Herrn, um mich zu prüfen, ob ich dankbar bin.“ Sag dasselbe, wenn du etwas Gutes bekommst.',
      'Svaki dar je ispit zahvalnosti. Kada je donesen prijesto, Sulejman je rekao: „Ovo je od dobrote Gospodara moga, da me iskuša hoću li zahvalan biti.“ Reci i ti tako kada dobiješ nešto lijepo.',
    ),
    [quran('27:40')],
    { art: 'prophet.sulayman-throne' },
  ),
} satisfies Facts;

/** L2 – the hoopoe's news from Saba' (27:20–28). */
const HOOPOE: Episode = {
  kind: 'sequence',
  prompt: T(
    'The hoopoe brought news from Saba’. Put the events in order, then check.',
    'Der Wiedehopf brachte Nachricht aus Saba’. Bring die Ereignisse in die richtige Reihenfolge und prüfe.',
    'Pupavac je donio vijest iz Sebe. Poredaj događaje, pa provjeri.',
  ),
  hints: false,
  items: [
    { id: 'missing', art: 'animal.birds', label: T('Sulayman looks for the hoopoe among the birds', 'Sulaiman sucht den Wiedehopf unter den Vögeln', 'Sulejman traži pupavca među pticama'), sub: '27:20' },
    { id: 'sure-news', art: 'animal.hoopoe', label: T('"I bring you sure news from Saba’"', '„Ich bringe dir sichere Nachricht aus Saba’“', '„Donosim ti pouzdanu vijest iz Sebe“'), sub: '27:22' },
    { id: 'sun', art: 'garden.sun', label: T('They bow to the sun instead of Allah', 'Sie werfen sich vor der Sonne nieder statt vor Allah', 'Sedždu čine Suncu umjesto Allahu'), sub: '27:24' },
    { id: 'we-will-see', art: 'object.scales', label: T('"We will see whether you have told the truth"', '„Wir werden sehen, ob du die Wahrheit gesagt hast“', '„Vidjet ćemo da li si istinu rekao“'), sub: '27:27' },
    { id: 'take-letter', art: 'prophet.sulayman-hoopoe-letter', label: T('The hoopoe takes the letter to them', 'Der Wiedehopf bringt ihnen den Brief', 'Pupavac im nosi pismo'), sub: '27:28' },
  ],
  factMap: { missing: 'hoopoe-news', 'sure-news': 'hoopoe-news', sun: 'hoopoe-news', 'we-will-see': 'lesson-check-the-news', 'take-letter': 'hoopoe-news' },
};

/** L3 – the letter, the gift, the throne and the queen (27:29–44). */
const QUEEN: Episode = {
  kind: 'connect',
  prompt: T('Connect each event with what was said (27:29–44).', 'Verbinde jedes Ereignis mit dem, was gesagt wurde (27:29–44).', 'Spoji svaki događaj s onim što je rečeno (27:29–44).'),
  hints: false,
  pairs: [
    {
      id: 'letter-opens',
      left: { art: 'prophet.sulayman-letter', label: T('The letter begins', 'Der Brief beginnt', 'Pismo počinje') },
      right: { label: T('"In the name of Allah, the Most Merciful" (27:30)', '„Im Namen Allahs, des Allerbarmers“ (27:30)', '„U ime Allaha, Milostivog“ (27:30)') },
    },
    {
      id: 'gift',
      left: { art: 'object.gift', label: T('The queen sends a gift', 'Die Königin schickt ein Geschenk', 'Kraljica šalje dar') },
      right: { label: T('"What Allah has given me is better" (27:36)', '„Was Allah mir gegeben hat, ist besser“ (27:36)', '„Ono što je Allah meni dao bolje je“ (27:36)') },
    },
    {
      id: 'throne',
      left: { art: 'prophet.sulayman-throne', label: T('Her throne is brought', 'Ihr Thron wird gebracht', 'Donesen je njen prijesto') },
      right: { label: T('"This is from the favour of my Lord" (27:40)', '„Dies ist von der Huld meines Herrn“ (27:40)', '„Ovo je od dobrote Gospodara moga“ (27:40)') },
    },
    {
      id: 'palace',
      left: { art: 'prophet.sulayman-glass-palace', label: T('The palace of smooth glass', 'Der Palast aus glattem Glas', 'Dvorac od uglačanog stakla') },
      right: { label: T('"I submit to Allah, the Lord of the worlds" (27:44)', '„Ich ergebe mich Allah, dem Herrn der Welten“ (27:44)', '„Predajem se Allahu, Gospodaru svjetova“ (27:44)') },
    },
  ],
  factMap: { 'letter-opens': 'noble-letter', gift: 'lesson-grateful', throne: 'lesson-grateful', palace: 'noble-letter' },
};

/** Stop id → fact the learner practises when going wrong there. */
export const SULAYMAN_MISSED: Record<string, string> = Object.fromEntries(
  VALLEY.map((s) => [s.id, s.id.includes('hill-2') || s.id.includes('gap') ? SULAYMAN_FACTS.ants.id : SULAYMAN_FACTS.smallCreatures.id]),
);

export const sulaymanGame: GameDef<SulaymanConfig> = {
  id: SULAYMAN_ID,
  topicId: 'prophets',
  i18n: sulaymanI18n,
  coverArt: 'prophet.sulayman-ants-valley',
  hintArt: 'prophet.sulayman-anthill',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./SulaymanGame') as typeof import('./SulaymanGame')).SulaymanGame),
  levels: [
    {
      level: 1,
      config: { map: 'prophet.sulayman-valley-map', stops: VALLEY, showRoute: true, hints: true, prompt: 'prompt.valley' },
      facts: [SULAYMAN_FACTS.ants, SULAYMAN_FACTS.smile, SULAYMAN_FACTS.smallCreatures],
    },
    { level: 2, config: { mode: 'episode', episode: HOOPOE }, facts: [SULAYMAN_FACTS.hoopoe, SULAYMAN_FACTS.checkNews] },
    { level: 3, config: { mode: 'episode', episode: QUEEN }, facts: [SULAYMAN_FACTS.letter, SULAYMAN_FACTS.grateful] },
  ],
  order: 18,
};

export const SULAYMAN_ART: string[] = ['prophet.sulayman-valley-map', ...VALLEY.flatMap((s) => (s.art ? [s.art] : [])), ...episodeArt(HOOPOE), ...episodeArt(QUEEN)];

export function registerSulaymanGame(): void {
  registerGame(sulaymanGame);
}

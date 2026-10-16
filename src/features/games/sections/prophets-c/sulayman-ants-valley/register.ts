import { type GameDef, registerGame } from '@/core/games';
import type { PathStop } from '@/core/games/kit';

import { type Facts, gameTexts, lazyGame, quran, T } from '../shared';

/*
 * Sulayman – "The Valley of the Ants" (27:17–19, 27:20–28). Trace the way of Sulayman's army through the valley
 * around the anthills (the ant warned her people, 27:18), then the hoopoe's way to Saba' with the letter (27:28).
 * Nothing is "attacked": the learner keeps the ants safe and carries a message.
 */

export const SULAYMAN_ID = 'sulayman-ants-valley';

export interface SulaymanConfig {
  map: string;
  stops: PathStop[];
  showRoute: boolean;
  hints: boolean;
  prompt: string;
}

export const sulaymanI18n = gameTexts(SULAYMAN_ID, {
  title: T('The Valley of the Ants', 'Das Tal der Ameisen', 'Dolina mrava'),
  description: T(
    'Lead the way through the valley without harming a single ant – then fly the letter to Saba\' with the hoopoe.',
    'Führe den Zug durch das Tal, ohne einer einzigen Ameise zu schaden – dann flieg mit dem Wiedehopf den Brief nach Saba\'.',
    'Povedi povorku kroz dolinu a da ne povrijediš nijednog mrava – a zatim s pupavcem odnesi pismo u Sebu.',
  ),
  howTo: T(
    'Trace the way with your finger from stop to stop, around the anthills. You can also tap the stops in order.',
    'Fahre mit dem Finger den Weg von Halt zu Halt nach, um die Ameisenhügel herum. Du kannst die Halte auch der Reihe nach antippen.',
    'Prstom prati put od stanice do stanice, oko mravinjaka. Možeš i redom dodirivati stanice.',
  ),
  'prompt.valley': T('Lead the way around the anthills – keep every ant safe.', 'Führe den Weg um die Ameisenhügel – keine Ameise soll zu Schaden kommen.', 'Vodi put oko mravinjaka – nijedan mrav da ne strada.'),
  'prompt.valleyFree': T('No guide this time: find the safe way past the anthills.', 'Diesmal ohne Hilfslinie: Finde den sicheren Weg an den Ameisenhügeln vorbei.', 'Ovaj put bez vodilje: pronađi siguran put pored mravinjaka.'),
  'prompt.hoopoe': T('Fly with the hoopoe and the letter from the camp to Saba\'.', 'Flieg mit dem Wiedehopf und dem Brief vom Lager nach Saba\'.', 'Leti s pupavcem i pismom od tabora do Sebe.'),
});

const S = {
  start: T('Start', 'Start', 'Početak'),
  around: T('Around the hill', 'Um den Hügel', 'Oko brežuljka'),
  between: T('Between the hills', 'Zwischen den Hügeln', 'Između brežuljaka'),
  end: T('Safe!', 'Sicher!', 'Sigurno!'),
};

/** Stops through the valley (fractions of the 400 × 240 map): above each anthill, down between them. */
const VALLEY_ALL: PathStop[] = [
  { id: 'v-start', at: { x: 0.05, y: 0.9 }, label: S.start, art: 'prophet.sulayman-banner' },
  { id: 'v-hill-1', at: { x: 0.17, y: 0.64 }, label: S.around, caption: T('The army marched in ordered ranks.', 'Das Heer zog in geordneten Reihen.', 'Vojska je išla u urednim redovima.') },
  { id: 'v-gap-1', at: { x: 0.33, y: 0.88 }, label: S.between },
  { id: 'v-hill-2', at: { x: 0.49, y: 0.62 }, label: S.around, caption: T('"O ants, go into your homes!" – the ant warned her people.', '„Ihr Ameisen, geht in eure Wohnungen!“ – die Ameise warnte ihr Volk.', '„O mravi, uđite u svoja prebivališta!“ – mrav je upozorio svoj narod.') },
  { id: 'v-gap-2', at: { x: 0.66, y: 0.88 }, label: S.between },
  { id: 'v-hill-3', at: { x: 0.82, y: 0.63 }, label: S.around, caption: T('Sulayman smiled at her words.', 'Sulaiman lächelte über ihre Worte.', 'Sulejman se nasmiješio njegovim riječima.') },
  { id: 'v-end', at: { x: 0.95, y: 0.86 }, label: S.end, art: 'prophet.sulayman-anthill', caption: T('Every ant is safe. Sulayman thanked Allah for His favour.', 'Jede Ameise ist sicher. Sulaiman dankte Allah für Seine Gunst.', 'Svi mravi su sigurni. Sulejman je zahvalio Allahu na Njegovoj blagodati.') },
];

const VALLEY_EASY: PathStop[] = [VALLEY_ALL[0], VALLEY_ALL[1], VALLEY_ALL[3], VALLEY_ALL[5], VALLEY_ALL[6]];

const JOURNEY: PathStop[] = [
  { id: 'j-camp', at: { x: 0.12, y: 0.52 }, label: T('Camp', 'Lager', 'Tabor'), art: 'prophet.sulayman-letter' },
  { id: 'j-dunes', at: { x: 0.3, y: 0.7 }, label: T('Desert', 'Wüste', 'Pustinja') },
  { id: 'j-oasis', at: { x: 0.5, y: 0.62 }, label: T('Oasis', 'Oase', 'Oaza'), caption: T('The hoopoe carried Sulayman\'s letter.', 'Der Wiedehopf trug Sulaimans Brief.', 'Pupavac je nosio Sulejmanovo pismo.') },
  { id: 'j-dunes-2', at: { x: 0.68, y: 0.78 }, label: T('Desert', 'Wüste', 'Pustinja') },
  { id: 'j-saba', at: { x: 0.86, y: 0.5 }, label: T('Saba\'', 'Saba\'', 'Seba'), art: 'prophet.sulayman-hoopoe-letter', caption: T('"A noble letter has been delivered to me" – said the queen of Saba\'.', '„Mir ist ein edler Brief überbracht worden“ – sagte die Königin von Saba\'.', '„Meni je dostavljeno plemenito pismo“ – rekla je kraljica Sebe.') },
];

export const SULAYMAN_FACTS = {
  ants: {
    id: 'ant-warning',
    text: T(
      'When Sulayman\'s army came to the valley of the ants, an ant said: "O ants, go into your homes, so that Sulayman and his soldiers do not crush you without noticing."',
      'Als Sulaimans Heer zum Tal der Ameisen kam, sagte eine Ameise: „Ihr Ameisen, geht in eure Wohnungen, damit Sulaiman und seine Heere euch nicht zertreten, ohne es zu merken.“',
      'Kada je Sulejmanova vojska stigla u dolinu mrava, jedan mrav je rekao: „O mravi, uđite u svoja prebivališta da vas ne izgaze Sulejman i vojske njegove, a da to i ne primijete.“',
    ),
    sources: [quran('27:18')],
    art: 'prophet.sulayman-anthill',
    check: { type: 'trueFalse', statement: T('An ant warned the other ants to go into their homes.', 'Eine Ameise warnte die anderen Ameisen, in ihre Wohnungen zu gehen.', 'Jedan mrav je upozorio ostale mrave da uđu u svoja prebivališta.'), correct: true },
  },
  smile: {
    id: 'sulayman-dua',
    text: T(
      'Sulayman smiled at the ant\'s words and prayed: "My Lord, help me to be grateful for Your favour on me and on my parents, and to do good that pleases You."',
      'Sulaiman lächelte über die Worte der Ameise und betete: „Mein Herr, hilf mir, dankbar zu sein für Deine Gunst an mir und an meinen Eltern, und Gutes zu tun, das Dir gefällt.“',
      'Sulejman se nasmiješio riječima mrava i zamolio: „Gospodaru moj, pomozi mi da budem zahvalan na Tvojoj blagodati kojom si obasuo mene i roditelje moje i da činim dobro kojim ćeš Ti zadovoljan biti.“',
    ),
    sources: [quran('27:19')],
  },
  ranks: {
    id: 'army-ranks',
    text: T(
      'Sulayman\'s armies of jinn, people and birds were gathered and marched in ordered ranks.',
      'Sulaimans Heere aus Dschinn, Menschen und Vögeln wurden versammelt und zogen in geordneten Reihen.',
      'Sulejmanove vojske od džina, ljudi i ptica bile su sakupljene i išle su u urednim redovima.',
    ),
    sources: [quran('27:17')],
  },
  hoopoe: {
    id: 'hoopoe-news',
    text: T(
      'The hoopoe brought Sulayman sure news from Saba\'. Sulayman said: "We will see whether you have told the truth," and sent it with his letter.',
      'Der Wiedehopf brachte Sulaiman sichere Nachricht aus Saba\'. Sulaiman sagte: „Wir werden sehen, ob du die Wahrheit gesagt hast“, und schickte ihn mit seinem Brief.',
      'Pupavac je Sulejmanu donio pouzdanu vijest iz Sebe. Sulejman je rekao: „Vidjet ćemo da li si istinu rekao“, i poslao ga sa svojim pismom.',
    ),
    sources: [quran('27:22–28')],
    art: 'prophet.sulayman-hoopoe-letter',
    check: { type: 'choice', prompt: T('From which land did the hoopoe bring news?', 'Aus welchem Land brachte der Wiedehopf Nachricht?', 'Iz koje je zemlje pupavac donio vijest?'), options: [T('Saba\'', 'Saba\'', 'Seba'), T('Egypt', 'Ägypten', 'Egipat'), T('Madyan', 'Madyan', 'Medjen')], correctIndex: 0 },
  },
  letter: {
    id: 'noble-letter',
    text: T(
      'Sulayman\'s letter began with "In the name of Allah, the Most Merciful, the Most Kind."',
      'Sulaimans Brief begann mit „Im Namen Allahs, des Allerbarmers, des Barmherzigen.“',
      'Sulejmanovo pismo počinjalo je riječima „U ime Allaha, Milostivog, Samilosnog.“',
    ),
    sources: [quran('27:30')],
    art: 'prophet.sulayman-letter',
  },
} satisfies Facts;

/** Stop id → fact the learner practises when going wrong there. */
export const SULAYMAN_MISSED: Record<string, string> = Object.fromEntries([
  ...VALLEY_ALL.map((s) => [s.id, s.id.includes('hill-2') || s.id.includes('gap') ? SULAYMAN_FACTS.ants.id : SULAYMAN_FACTS.ranks.id]),
  ...JOURNEY.map((s) => [s.id, SULAYMAN_FACTS.hoopoe.id]),
]);

export const sulaymanGame: GameDef<SulaymanConfig> = {
  id: SULAYMAN_ID,
  topicId: 'prophets',
  i18n: sulaymanI18n,
  coverArt: 'prophet.sulayman-ants-valley',
  hintArt: 'prophet.sulayman-anthill',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./SulaymanGame') as typeof import('./SulaymanGame')).SulaymanGame),
  levels: [
    { level: 1, config: { map: 'prophet.sulayman-valley-map', stops: VALLEY_EASY, showRoute: true, hints: true, prompt: 'prompt.valley' }, facts: [SULAYMAN_FACTS.ants, SULAYMAN_FACTS.ranks] },
    { level: 2, config: { map: 'prophet.sulayman-valley-map', stops: VALLEY_ALL, showRoute: false, hints: false, prompt: 'prompt.valleyFree' }, facts: [SULAYMAN_FACTS.smile] },
    { level: 3, config: { map: 'prophet.sulayman-journey-map', stops: JOURNEY, showRoute: false, hints: false, prompt: 'prompt.hoopoe' }, facts: [SULAYMAN_FACTS.hoopoe, SULAYMAN_FACTS.letter] },
  ],
  order: 18,
};

export const SULAYMAN_ART: string[] = [
  'prophet.sulayman-valley-map',
  'prophet.sulayman-journey-map',
  ...[...VALLEY_ALL, ...JOURNEY].flatMap((s) => (s.art ? [s.art] : [])),
];

export function registerSulaymanGame(): void {
  registerGame(sulaymanGame);
}

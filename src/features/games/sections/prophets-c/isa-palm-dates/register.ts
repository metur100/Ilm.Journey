import { type GameDef, registerGame } from '@/core/games';
import type { CatchItem } from '@/core/games/kit';

import { type Episode, type EpisodeConfig, episodeArt, lessonFact } from '../../prophets-story/episode';
import { type Facts, gameTexts, lazyGame, quran, T } from '../shared';

/*
 * Isa – three events of his life, each with its lesson:
 * L1 his birth: Maryam under the palm tree, the stream and the dates (19:22–26) – gently gather the falling dates in a
 *    basket, leaves and pebbles are left alone (calm CatchGame: no lives, missed dates simply come again);
 * L2 the baby Isa speaks from the cradle: "I am the servant of Allah" (19:27–33) – connect the parts of his words
 *    (episode: connect);
 * L3 the signs by Allah's permission, the table spread and how Allah raised him (5:110–115, 4:157–158) – put them in
 *    order (episode: sequence). The miracles are narrated, never played.
 */

export const ISA_ID = 'isa-palm-dates';

export interface PalmConfig {
  items: CatchItem[];
  goal: number;
  lanes: 3 | 4;
  speed: 'calm' | 'normal';
  hints: boolean;
  prompt: string;
}

export type IsaConfig = PalmConfig | EpisodeConfig;

export const isaI18n = gameTexts(ISA_ID, {
  title: T('The Palm Tree and the Stream', 'Die Palme und der Bach', 'Palma i potočić'),
  description: T(
    'Three events of the life of Isa: his birth under the palm tree, his words from the cradle and the signs Allah gave him – each with its lesson.',
    'Drei Ereignisse aus dem Leben von Isa: seine Geburt unter der Palme, seine Worte aus der Wiege und die Zeichen, die Allah ihm gab – jedes mit seiner Lehre.',
    'Tri događaja iz Isaova života: rođenje pod palmom, njegove riječi iz kolijevke i znakovi koje mu je Allah dao – svaki sa svojom poukom.',
  ),
  howTo: T(
    'Level 1: move the basket under the falling dates. Level 2: connect the parts of his words. Level 3: put the events in order.',
    'Stufe 1: Schieb den Korb unter die fallenden Datteln. Stufe 2: Verbinde die Teile seiner Worte. Stufe 3: Bring die Ereignisse in die richtige Reihenfolge.',
    'Nivo 1: pomjeraj korpu ispod hurmi koje padaju. Nivo 2: spoji dijelove njegovih riječi. Nivo 3: poredaj događaje.',
  ),
  'prompt.dates': T(
    '"Shake the trunk of the palm – fresh ripe dates will fall for you." Catch only the dates!',
    '„Schüttle den Stamm der Palme – frische reife Datteln werden für dich herabfallen.“ Fang nur die Datteln!',
    '„Protresi stablo palme – past će ti svježe zrele hurme.“ Uhvati samo hurme!',
  ),
});

const DATE: CatchItem = { id: 'date', art: 'prophet.isa-date', label: T('Ripe date', 'Reife Dattel', 'Zrela hurma'), good: true };
const DATE_2: CatchItem = { id: 'date-2', art: 'prophet.isa-date', label: T('Fresh date', 'Frische Dattel', 'Svježa hurma'), good: true };
const LEAF: CatchItem = { id: 'leaf', art: 'prophet.isa-leaf', label: T('Palm leaf', 'Palmblatt', 'List palme'), good: false };
const PEBBLE: CatchItem = { id: 'pebble', art: 'prophet.isa-pebble', label: T('Pebble', 'Steinchen', 'Kamenčić'), good: false };

export const ISA_FACTS = {
  palm: {
    id: 'shake-the-palm',
    text: T(
      'Maryam was told: "Do not grieve. Your Lord has placed a stream beneath you. Shake the trunk of the palm towards you – it will drop fresh ripe dates on you. So eat, drink and be at ease."',
      'Maryam wurde gesagt: „Sei nicht traurig. Dein Herr hat unter dir einen Bach fließen lassen. Schüttle den Stamm der Palme zu dir – sie wird frische reife Datteln auf dich fallen lassen. So iss, trink und sei frohen Mutes.“',
      'Merjemi je rečeno: „Ne žalosti se! Gospodar tvoj je dao da pored tebe potočić teče. Protresi stablo palme – past će na tebe svježe zrele hurme. Pa jedi i pij i budi vesela srca.“',
    ),
    sources: [quran('19:24–26')],
    art: 'prophet.isa-palm-stream',
    check: {
      type: 'choice',
      prompt: T('What fell for Maryam from the palm tree?', 'Was fiel für Maryam von der Palme?', 'Šta je palo Merjemi s palme?'),
      options: [T('Fresh ripe dates', 'Frische reife Datteln', 'Svježe zrele hurme'), T('Apples', 'Äpfel', 'Jabuke'), T('Bread', 'Brot', 'Hljeb')],
      correctIndex: 0,
    },
  },
  cradle: {
    id: 'cradle',
    text: T(
      'The baby Isa spoke from the cradle: "I am the servant of Allah. He has given me the Scripture and made me a prophet."',
      'Das Baby Isa sprach aus der Wiege: „Ich bin der Diener Allahs. Er hat mir die Schrift gegeben und mich zum Propheten gemacht.“',
      'Beba Isa progovorio je iz kolijevke: „Ja sam Allahov rob; On mi je dao Knjigu i učinio me vjerovjesnikom.“',
    ),
    sources: [quran('19:29–30')],
    art: 'prophet.isa-cradle',
  },
  table: {
    id: 'table-spread',
    text: T(
      'Isa prayed: "O Allah, our Lord, send down to us a table spread from the sky… and provide for us, for You are the best of providers." Allah said: "I will send it down to you."',
      'Isa betete: „O Allah, unser Herr, sende uns einen gedeckten Tisch vom Himmel herab … und versorge uns, denn Du bist der beste Versorger.“ Allah sagte: „Ich werde ihn euch herabsenden.“',
      'Isa je molio: „O Allahu, Gospodaru naš, spusti nam s neba sofru … i opskrbi nas, jer Ti si najbolji opskrbitelj.“ Allah je rekao: „Ja ću vam je spustiti.“',
    ),
    sources: [quran('5:114–115')],
    art: 'prophet.isa-table',
  },
  raised: {
    id: 'raised',
    text: T(
      'Isa was not killed and not crucified – it was only made to appear so to them. Allah raised him up to Himself.',
      'Isa wurde weder getötet noch gekreuzigt – es erschien ihnen nur so. Allah hat ihn zu Sich erhoben.',
      'Isa nije ubijen niti razapet – samo im se tako pričinilo. Allah ga je uzdigao Sebi.',
    ),
    sources: [quran('4:157–158')],
  },
  allahCares: lessonFact(
    'allah-takes-care',
    T(
      'Trust Allah – He takes care of you. In a hard moment He gave Maryam water, dates and comfort: "Do not grieve."',
      'Vertraue Allah – Er sorgt für dich. In einem schweren Moment gab Er Maryam Wasser, Datteln und Trost: „Sei nicht traurig.“',
      'Pouzdaj se u Allaha – On se brine o tebi. U teškom trenutku dao je Merjemi vodu, hurme i utjehu: „Ne žalosti se!“',
    ),
    [quran('19:24–26')],
    { art: 'prophet.isa-palm-stream' },
  ),
  servant: lessonFact(
    'servant-of-allah',
    T(
      'Being a servant of Allah is an honour. The first words of the baby Isa were "I am the servant of Allah" – and he was told to pray, to give and to be dutiful to his mother.',
      'Ein Diener Allahs zu sein ist eine Ehre. Die ersten Worte des Babys Isa waren „Ich bin der Diener Allahs“ – und ihm wurde geboten zu beten, zu geben und gütig zu seiner Mutter zu sein.',
      'Biti Allahov rob je čast. Prve riječi bebe Isaa bile su „Ja sam Allahov rob“ – i naređeno mu je da klanja, daje zekat i bude dobar prema majci.',
    ),
    [quran('19:30–32')],
    { art: 'prophet.isa-cradle' },
  ),
  gifts: lessonFact(
    'gifts-from-allah',
    T(
      'Every gift comes from Allah. The signs of Isa happened "by Allah’s permission" – so thank Allah for your talents and use them for good.',
      'Jede Gabe kommt von Allah. Die Zeichen Isas geschahen „mit Allahs Erlaubnis“ – darum danke Allah für deine Talente und nutze sie für das Gute.',
      'Svaki dar dolazi od Allaha. Isaovi znakovi dešavali su se „Allahovom dozvolom“ – zato zahvaljuj Allahu na svojim darovima i koristi ih za dobro.',
    ),
    [quran('5:110'), quran('3:49')],
    { art: 'prophet.isa-table' },
  ),
} satisfies Facts;

/** L2 – the words of the baby Isa from the cradle (19:30–33). */
const CRADLE: Episode = {
  kind: 'connect',
  prompt: T(
    'Maryam pointed to the baby, and he spoke from the cradle. Connect the parts of his words.',
    'Maryam zeigte auf das Baby, und es sprach aus der Wiege. Verbinde die Teile seiner Worte.',
    'Merjema je pokazala na bebu, a on je progovorio iz kolijevke. Spoji dijelove njegovih riječi.',
  ),
  hints: false,
  pairs: [
    { id: 'i-am', left: { art: 'prophet.isa-cradle', label: T('"I am…', '„Ich bin…', '„Ja sam…') }, right: { label: T('…the servant of Allah" (19:30)', '…der Diener Allahs“ (19:30)', '…Allahov rob“ (19:30)') } },
    { id: 'gave-me', left: { art: 'object.book', label: T('"He has given me…', '„Er hat mir gegeben…', '„On mi je dao…') }, right: { label: T('…the Scripture and made me a prophet" (19:30)', '…die Schrift und mich zum Propheten gemacht“ (19:30)', '…Knjigu i učinio me vjerovjesnikom“ (19:30)') } },
    { id: 'enjoined', left: { art: 'object.prayer-mat', label: T('"He enjoined on me…', '„Er hat mir aufgetragen…', '„Naredio mi je…') }, right: { label: T('…prayer and zakah as long as I live" (19:31)', '…das Gebet und die Zakat, solange ich lebe“ (19:31)', '…namaz i zekat dok sam god živ“ (19:31)') } },
    { id: 'my-mother', left: { art: 'ui.heart', label: T('"He made me dutiful…', '„Er machte mich gütig…', '„Učinio me je dobrim…') }, right: { label: T('…to my mother" (19:32)', '…zu meiner Mutter“ (19:32)', '…prema majci mojoj“ (19:32)') } },
    { id: 'peace-on-me', left: { art: 'garden.dove', label: T('"Peace be upon me…', '„Friede sei auf mir…', '„Neka je mir meni…') }, right: { label: T('…the day I was born, die and am raised" (19:33)', '…am Tag meiner Geburt, meines Todes und meiner Auferweckung“ (19:33)', '…na dan rođenja, smrti i proživljenja“ (19:33)') } },
  ],
  factMap: { 'i-am': 'cradle', 'gave-me': 'cradle', enjoined: 'lesson-servant-of-allah', 'my-mother': 'lesson-servant-of-allah', 'peace-on-me': 'cradle' },
};

/** L3 – the signs, the table spread and how Allah raised Isa (5:110–115, 4:158). */
const SIGNS: Episode = {
  kind: 'sequence',
  prompt: T('Put the events in order, from the signs of Isa to how Allah raised him – then check.', 'Bring die Ereignisse in die richtige Reihenfolge – von den Zeichen Isas bis dazu, wie Allah ihn erhob – und prüfe.', 'Poredaj događaje – od Isaovih znakova do toga kako ga je Allah uzdigao – pa provjeri.'),
  hints: false,
  items: [
    { id: 'signs', art: 'prophet.isa-palm-small', label: T('Signs by Allah’s permission', 'Zeichen mit Allahs Erlaubnis', 'Znakovi Allahovom dozvolom'), sub: '5:110' },
    { id: 'table-asked', art: 'object.plate', label: T('The disciples ask for a table spread', 'Die Jünger bitten um einen gedeckten Tisch', 'Učenici traže sofru'), sub: '5:112' },
    { id: 'table-dua', art: 'object.prayer-mat', label: T('Isa prays: "You are the best of providers"', 'Isa betet: „Du bist der beste Versorger“', 'Isa moli: „Ti si najbolji opskrbitelj“'), sub: '5:114' },
    { id: 'table-answer', art: 'prophet.isa-table', label: T('Allah: "I will send it down to you"', 'Allah: „Ich werde ihn euch herabsenden“', 'Allah: „Ja ću vam je spustiti“'), sub: '5:115' },
    { id: 'raised-up', art: 'sky.night', label: T('Allah raises Isa up to Himself', 'Allah erhebt Isa zu Sich', 'Allah uzdiže Isaa Sebi'), sub: '4:158' },
  ],
  factMap: { signs: 'lesson-gifts-from-allah', 'table-asked': 'table-spread', 'table-dua': 'table-spread', 'table-answer': 'table-spread', 'raised-up': 'raised' },
};

export const ISA_MISSED: Record<string, string> = { leaf: ISA_FACTS.palm.id, pebble: ISA_FACTS.palm.id, date: ISA_FACTS.palm.id, 'date-2': ISA_FACTS.palm.id };

export const isaGame: GameDef<IsaConfig> = {
  id: ISA_ID,
  topicId: 'prophets',
  i18n: isaI18n,
  coverArt: 'prophet.isa-palm-stream',
  hintArt: 'prophet.isa-date-basket',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./IsaGame') as typeof import('./IsaGame')).IsaGame),
  levels: [
    {
      level: 1,
      config: { items: [DATE, LEAF, DATE_2, PEBBLE], goal: 6, lanes: 3, speed: 'calm', hints: true, prompt: 'prompt.dates' },
      facts: [ISA_FACTS.palm, ISA_FACTS.allahCares],
    },
    { level: 2, config: { mode: 'episode', episode: CRADLE }, facts: [ISA_FACTS.cradle, ISA_FACTS.servant] },
    { level: 3, config: { mode: 'episode', episode: SIGNS }, facts: [ISA_FACTS.table, ISA_FACTS.raised, ISA_FACTS.gifts] },
  ],
  order: 24,
};

export const ISA_ART: string[] = ['prophet.isa-palm-stream', 'prophet.isa-date-basket', 'prophet.isa-date', 'prophet.isa-leaf', 'prophet.isa-pebble', ...episodeArt(CRADLE), ...episodeArt(SIGNS)];

export function registerIsaGame(): void {
  registerGame(isaGame);
}

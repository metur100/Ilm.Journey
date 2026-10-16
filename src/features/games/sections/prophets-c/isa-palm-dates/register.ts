import { type GameDef, registerGame } from '@/core/games';
import type { CatchItem } from '@/core/games/kit';

import { type Facts, gameTexts, lazyGame, quran, T } from '../shared';

/*
 * Isa – "The Palm Tree and the Stream" (19:23–26). Maryam was told to shake the trunk of the palm so that fresh ripe
 * dates would fall for her, and to eat, drink and be at ease. The learner gently gathers the falling dates in a
 * basket (leaves and pebbles are left alone). Calm CatchGame: no lives, missed dates simply come again.
 * The miracles of Isa are narrated in the facts, never played.
 */

export const ISA_ID = 'isa-palm-dates';

export interface IsaConfig {
  items: CatchItem[];
  goal: number;
  lanes: 3 | 4;
  speed: 'calm' | 'normal';
  hints: boolean;
  prompt: string;
}

export const isaI18n = gameTexts(ISA_ID, {
  title: T('The Palm Tree and the Stream', 'Die Palme und der Bach', 'Palma i potočić'),
  description: T(
    'Fresh ripe dates fall from the palm – gather them gently in the basket, as in the story of Maryam.',
    'Frische reife Datteln fallen von der Palme – sammle sie behutsam im Korb, wie in der Geschichte von Maryam.',
    'Svježe zrele hurme padaju s palme – nježno ih skupi u korpu, kao u kazivanju o Merjemi.',
  ),
  howTo: T(
    'Move the basket under the falling dates, or tap a date to catch it.',
    'Schieb den Korb unter die fallenden Datteln oder tippe eine Dattel an.',
    'Pomjeraj korpu ispod hurmi koje padaju ili dodirni hurmu.',
  ),
  'prompt.dates': T(
    '"Shake the trunk of the palm – fresh ripe dates will fall for you." Catch them!',
    '„Schüttle den Stamm der Palme – frische reife Datteln werden für dich herabfallen.“ Fang sie!',
    '„Protresi stablo palme – past će ti svježe zrele hurme.“ Uhvati ih!',
  ),
  'prompt.only': T(
    'Only the dates go into the basket – let the leaves and pebbles fall.',
    'Nur die Datteln kommen in den Korb – lass Blätter und Steinchen fallen.',
    'U korpu idu samo hurme – pusti lišće i kamenčiće da padnu.',
  ),
  'prompt.more': T(
    'More dates, a wider palm – eat, drink and be at ease.',
    'Mehr Datteln, eine breitere Palme – iss, trink und sei froh.',
    'Više hurmi, šira palma – jedi, pij i budi vesela srca.',
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
  permission: {
    id: 'by-allahs-permission',
    text: T(
      "All the miracles of Isa – the bird of clay, healing the blind and the sick, bringing the dead to life – happened by Allah's permission.",
      'Alle Wunder Isas – der Vogel aus Lehm, die Heilung von Blinden und Kranken, die Erweckung von Toten – geschahen mit Allahs Erlaubnis.',
      'Sva Isaova čuda – ptica od ilovače, liječenje slijepih i bolesnih, oživljavanje mrtvih – bila su Allahovom dozvolom.',
    ),
    sources: [quran('3:49; 5:110')],
    check: {
      type: 'trueFalse',
      statement: T('Isa performed his miracles by his own power.', 'Isa vollbrachte seine Wunder aus eigener Kraft.', 'Isa je činio čuda svojom snagom.'),
      correct: false,
    },
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
} satisfies Facts;

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
    { level: 1, config: { items: [DATE, DATE_2], goal: 5, lanes: 3, speed: 'calm', hints: true, prompt: 'prompt.dates' }, facts: [ISA_FACTS.palm] },
    {
      level: 2,
      config: { items: [DATE, LEAF, DATE_2, PEBBLE], goal: 7, lanes: 3, speed: 'calm', hints: false, prompt: 'prompt.only' },
      facts: [ISA_FACTS.cradle, ISA_FACTS.permission],
    },
    {
      level: 3,
      config: { items: [DATE, LEAF, DATE_2, PEBBLE, LEAF], goal: 10, lanes: 4, speed: 'normal', hints: false, prompt: 'prompt.more' },
      facts: [ISA_FACTS.table, ISA_FACTS.raised],
    },
  ],
  order: 24,
};

export const ISA_ART: string[] = ['prophet.isa-palm-stream', 'prophet.isa-date-basket', 'prophet.isa-date', 'prophet.isa-leaf', 'prophet.isa-pebble'];

export function registerIsaGame(): void {
  registerGame(isaGame);
}

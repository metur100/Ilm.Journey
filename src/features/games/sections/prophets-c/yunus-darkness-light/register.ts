import { type GameDef, registerGame } from '@/core/games';
import type { KitItem } from '@/core/games/kit';
import { getDua } from '@/features/quran';

import { type Facts, gameTexts, ibnKathir, lazyGame, quran, T } from '../shared';

/*
 * Yunus – "Light in the Darknesses" (21:87–88, 37:139–148). Build the dua of Yunus tile by tile; with every tile the
 * darkness (of the night, the sea and inside the fish – Ibn Kathir on 21:87) gives way to light, and at the end the
 * gourd plant grows on the shore (37:146). L1 builds the meaning, L2 the transliteration, L3 the Arabic words – taken
 * only from the generated Quran data (dua `yunus-in-the-darkness`, 21:87), never typed by hand.
 */

export const YUNUS_ID = 'yunus-darkness-light';

export interface YunusConfig {
  target: KitItem[];
  distractors?: KitItem[];
  quran: boolean;
  hints: boolean;
  prompt: string;
}

export const yunusI18n = gameTexts(YUNUS_ID, {
  title: T('Light in the Darknesses', 'Licht in den Finsternissen', 'Svjetlo u tminama'),
  description: T(
    'Put together the dua of Yunus – with every word, the darkness gives way to light, and a gourd plant grows on the shore.',
    "Setze das Du'a von Yunus zusammen – mit jedem Wort weicht die Dunkelheit dem Licht, und am Ufer wächst eine Kürbispflanze.",
    'Složi Junusovu dovu – sa svakom riječi tama ustupa mjesto svjetlu, a na obali izraste tikva.',
  ),
  howTo: T(
    'Tap or drag the tiles into the places, in the order of the dua.',
    "Tippe oder zieh die Kacheln in die Plätze – in der Reihenfolge des Du'a.",
    'Dodirni ili prevuci pločice na mjesta, redom kako ide dova.',
  ),
  'prompt.meaning': T(
    'Build the dua of Yunus – what did he call out in the darkness?',
    "Bilde das Du'a von Yunus – was rief er in der Dunkelheit?",
    'Složi Junusovu dovu – šta je zavapio u tmini?',
  ),
  'prompt.translit': T(
    'Now the words as they sound – one darkness after another lifts.',
    'Jetzt die Worte, wie sie klingen – eine Dunkelheit nach der anderen weicht.',
    'Sada riječi kako se izgovaraju – tmina po tmina se razilazi.',
  ),
  'prompt.arabic': T(
    'The dua in the words of the Quran (21:87), from right to left.',
    "Das Du'a in den Worten des Korans (21:87), von rechts nach links.",
    "Dova riječima Kur'ana (21:87), s desna na lijevo.",
  ),
  'scene.dark': T('Darkness of the night, the sea and the fish', 'Dunkelheit der Nacht, des Meeres und des Fisches', 'Tmina noći, mora i ribe'),
  'scene.light': T(
    'Allah answered him – the gourd plant grows on the shore.',
    'Allah erhörte ihn – am Ufer wächst die Kürbispflanze.',
    'Allah mu se odazvao – na obali raste tikva.',
  ),
});

// ---- the dua from the generated data (21:87): the words after "fī ẓ-ẓulumāt" ----
const ayah = getDua('yunus-in-the-darkness')!.ayahs[0];
const arabicWords = ayah.arabic.split(/\s+/).filter(Boolean);
const arabicDua = arabicWords.slice(arabicWords.lastIndexOf(arabicWords[12]) + 1); // after ٱلظُّلُمَٰتِ
const translitWords = ayah.transliteration.split(/\s+/);
const translitDua = translitWords.slice(translitWords.lastIndexOf('zulumaati') + 1);

/** Groups words into tiles: [3, 2, 1, 2, 2] for both scripts (an lā ilāha · illā anta · subḥānaka · innī kuntu · mina ẓ-ẓālimīn). */
function group(words: string[], sizes: number[]): string[] {
  const out: string[] = [];
  let i = 0;
  for (const n of sizes) {
    out.push(words.slice(i, i + n).join(' '));
    i += n;
  }
  return out;
}
const ARABIC = group(arabicDua, [3, 2, 1, 2, 2]);
const TRANSLIT = group(translitDua, [3, 2, 1, 2, 2]);

const MEANING: KitItem[] = [
  { id: 'no-god', label: T('There is no god', 'Es gibt keinen Gott', 'Nema boga') },
  { id: 'but-you', label: T('but You.', 'außer Dir.', 'osim Tebe,') },
  { id: 'glory', label: T('Glory be to You!', 'Preis sei Dir!', 'hvaljen neka si!') },
  { id: 'wrong', label: T('I have been one of the wrongdoers.', 'Ich gehörte zu den Unrechttuenden.', 'ja sam se prema sebi ogriješio.') },
];
const MEANING_EXTRA: KitItem[] = [{ id: 'x-complain', label: T('I give up!', 'Ich gebe auf!', 'Odustajem!') }];

const IDS = ['w1', 'w2', 'w3', 'w4', 'w5'];
const TRANSLIT_TILES: KitItem[] = TRANSLIT.map((label, i) => ({ id: IDS[i], label }));
const ARABIC_TILES: KitItem[] = ARABIC.map((arabic, i) => ({ id: IDS[i], arabic, quran: true }));

export const YUNUS_FACTS = {
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
  darkness: {
    id: 'three-darknesses',
    text: T(
      'The darknesses around Yunus were the darkness of the night, of the sea and of the inside of the fish.',
      'Die Finsternisse um Yunus waren die Dunkelheit der Nacht, des Meeres und des Inneren des Fisches.',
      'Tmine oko Junusa bile su tmina noći, mora i utrobe ribe.',
    ),
    sources: [quran('21:87'), ibnKathir('21:87')],
    art: 'prophet.yunus-darkness',
  },
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
  arabic: {
    id: 'dua-arabic',
    text: T(
      'The dua of Yunus is part of ayah 21:87: "lā ilāha illā anta subḥānaka innī kuntu mina ẓ-ẓālimīn".',
      "Das Du'a von Yunus ist Teil des Verses 21:87: „lā ilāha illā anta subḥānaka innī kuntu mina ẓ-ẓālimīn“.",
      'Junusova dova dio je ajeta 21:87: „lā ilāha illā anta subḥāneke innī kuntu mine-ẓ-ẓālimīn“.',
    ),
    sources: [quran('21:87')],
  },
} satisfies Facts;

export const yunusGame: GameDef<YunusConfig> = {
  id: YUNUS_ID,
  topicId: 'prophets',
  i18n: yunusI18n,
  coverArt: 'prophet.yunus-whale',
  hintArt: 'prophet.yunus-light',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./YunusGame') as typeof import('./YunusGame')).YunusGame),
  levels: [
    { level: 1, config: { target: MEANING, quran: false, hints: true, prompt: 'prompt.meaning' }, facts: [YUNUS_FACTS.dua, YUNUS_FACTS.answered] },
    { level: 2, config: { target: TRANSLIT_TILES, quran: false, hints: false, prompt: 'prompt.translit' }, facts: [YUNUS_FACTS.darkness] },
    { level: 3, config: { target: ARABIC_TILES, quran: true, hints: false, prompt: 'prompt.arabic' }, facts: [YUNUS_FACTS.arabic, YUNUS_FACTS.gourd] },
  ],
  order: 21,
};
// Level 1 has one gentle distractor ("I give up!") – Yunus turned to Allah instead.
yunusGame.levels[0].config.distractors = MEANING_EXTRA;

export const YUNUS_MISSED: Record<string, string> = {
  'no-god': YUNUS_FACTS.dua.id,
  'but-you': YUNUS_FACTS.dua.id,
  glory: YUNUS_FACTS.dua.id,
  wrong: YUNUS_FACTS.dua.id,
  'x-complain': YUNUS_FACTS.answered.id,
  w1: YUNUS_FACTS.darkness.id,
  w2: YUNUS_FACTS.darkness.id,
  w3: YUNUS_FACTS.darkness.id,
  w4: YUNUS_FACTS.darkness.id,
  w5: YUNUS_FACTS.darkness.id,
};
/** Level 3 reports the Arabic fact instead of the darkness fact. */
export const missedFor = (level: number, id: string): string | undefined => (level === 3 && id.startsWith('w') ? YUNUS_FACTS.arabic.id : YUNUS_MISSED[id]);

export const YUNUS_ART: string[] = [
  'prophet.yunus-darkness',
  'prophet.yunus-light',
  'prophet.yunus-gourd',
  'prophet.yunus-whale',
  'prophet.yunus-gourd-sprout',
];

/** For tests: the Arabic tiles come from the data. */
export const YUNUS_ARABIC_TILES = ARABIC;

export function registerYunusGame(): void {
  registerGame(yunusGame);
}

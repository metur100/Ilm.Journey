import { type GameDef, registerGame } from '@/core/games';
import type { MemoryPair } from '@/core/games/kit';
import type { LocalizedText } from '@/core/models';

import { type Facts, gameTexts, lazyGame, quran, T } from '../shared';

/*
 * Al-Yasa – "Among the Best" (6:84–90, 38:45–48). The Quran tells little about his life, so the game keeps strictly to
 * what it says about him and the prophets named with him: guided, righteous, favoured above the worlds, chosen, given
 * the Book, wisdom and prophethood, and among the best. A MemoryPairs board: picture ↔ word ↔ the words of the ayah.
 */

export const ALYASA_ID = 'alyasa-among-best';

export interface AlyasaConfig {
  pairs: MemoryPair[];
  peekMs?: number;
  hints: boolean;
  prompt: string;
}

export const alyasaI18n = gameTexts(ALYASA_ID, {
  title: T('Among the Best', 'Unter den Besten', 'Među najboljima'),
  description: T(
    'Find the pairs of the good qualities the Quran gives Al-Yasa and the prophets named with him.',
    "Finde die Paare der guten Eigenschaften, die der Koran Al-Yasa' und den mit ihm genannten Propheten gibt.",
    "Pronađi parove lijepih osobina koje Kur'an pripisuje El-Jesa'u i poslanicima spomenutim s njim.",
  ),
  howTo: T(
    'Flip two cards. When they belong together, they stay open.',
    'Dreh zwei Karten um. Gehören sie zusammen, bleiben sie offen.',
    'Okreni dvije karte. Ako pripadaju jedna drugoj, ostaju otvorene.',
  ),
  'prompt.same': T(
    'Look closely, then find the matching pictures.',
    'Schau genau hin und finde dann die gleichen Bilder.',
    'Dobro pogledaj, pa pronađi iste slike.',
  ),
  'prompt.word': T('Match each picture with its word.', 'Ordne jedem Bild sein Wort zu.', 'Spoji svaku sliku s njenom riječi.'),
  'prompt.ayah': T(
    'Match each quality with the words of the Quran.',
    'Ordne jeder Eigenschaft die Worte des Korans zu.',
    "Spoji svaku osobinu s riječima Kur'ana.",
  ),
});

interface Quality {
  id: string;
  art: string;
  word: LocalizedText;
  ayah: LocalizedText;
  ref: string;
}

const Q: Quality[] = [
  {
    id: 'favoured',
    art: 'prophet.alyasa-star',
    word: T('Favoured', 'Bevorzugt', 'Odlikovani'),
    ayah: T('"We favoured above the worlds"', '„vor den Welten bevorzugt“', '„nad svjetovima odlikovali“'),
    ref: '6:86',
  },
  {
    id: 'best',
    art: 'ui.star-filled',
    word: T('The best', 'Die Besten', 'Najbolji'),
    ayah: T('"all are among the best"', '„alle gehören zu den Besten“', '„svi su od najboljih“'),
    ref: '38:48',
  },
  {
    id: 'guided',
    art: 'object.lantern',
    word: T('Guided', 'Rechtgeleitet', 'Upućeni'),
    ayah: T('"guided to a straight path"', '„zu einem geraden Weg geleitet“', '„na Pravi put upućeni“'),
    ref: '6:87',
  },
  {
    id: 'righteous',
    art: 'garden.olive',
    word: T('Righteous', 'Rechtschaffen', 'Dobri'),
    ayah: T('"each was among the righteous"', '„jeder gehörte zu den Rechtschaffenen“', '„svi su bili dobri“'),
    ref: '6:85',
  },
  {
    id: 'chosen',
    art: 'object.star8',
    word: T('Chosen', 'Erwählt', 'Odabrani'),
    ayah: T('"We chose them"', '„Wir haben sie erwählt“', '„Odabrali smo ih“'),
    ref: '6:87',
  },
  {
    id: 'book',
    art: 'object.book',
    word: T('The Book', 'Die Schrift', 'Knjiga'),
    ayah: T('"the Book, wisdom and prophethood"', '„die Schrift, Weisheit und Prophetentum“', '„Knjigu, mudrost i vjerovjesništvo“'),
    ref: '6:89',
  },
];

const q = (id: string) => Q.find((x) => x.id === id)!;
const same = (id: string): MemoryPair => ({ id, a: { art: q(id).art, label: q(id).word }, caption: q(id).ayah });
const word = (id: string): MemoryPair => ({ id, a: { art: q(id).art }, b: { label: q(id).word }, caption: q(id).ayah });
const ayah = (id: string): MemoryPair => ({
  id,
  a: { art: q(id).art, label: q(id).word },
  b: { label: q(id).ayah, sub: q(id).ref },
  caption: T(`Quran ${q(id).ref}`, `Koran ${q(id).ref}`, `Kur'an ${q(id).ref}`),
});

export const ALYASA_FACTS = {
  favoured: {
    id: 'alyasa-favoured',
    text: T(
      '"And Ismail, Al-Yasa, Yunus and Lut – each of them We favoured above the worlds."',
      "„Und Ismail, Al-Yasa', Yunus und Lut – jeden von ihnen haben Wir vor den Welten bevorzugt.“",
      "„I Ismaila, i El-Jesa'a, i Junusa, i Luta – i svakog od njih smo nad svjetovima odlikovali.“",
    ),
    sources: [quran('6:86')],
    art: 'prophet.alyasa-star',
  },
  best: {
    id: 'alyasa-best',
    text: T(
      '"And remember Ismail, Al-Yasa and Dhul-Kifl – all of them are among the best."',
      "„Und gedenke Ismails, Al-Yasa's und Dhul-Kifls – alle gehören zu den Besten.“",
      "„I sjeti se Ismaila, i El-Jesa'a, i Zul-Kifla – svi su oni od najboljih.“",
    ),
    sources: [quran('38:48')],
    check: {
      type: 'choice',
      prompt: T('In 38:48, Al-Yasa is named with…', "In 38:48 wird Al-Yasa' genannt mit…", "U 38:48 El-Jesa' je spomenut s…"),
      options: [
        T('Ismail and Dhul-Kifl', 'Ismail und Dhul-Kifl', 'Ismailom i Zul-Kiflom'),
        T('Musa and Harun', 'Musa und Harun', 'Musaom i Harunom'),
        T('Nuh and Hud', 'Nuh und Hud', 'Nuhom i Hudom'),
      ],
      correctIndex: 0,
    },
  },
  follow: {
    id: 'follow-guidance',
    text: T(
      'About these prophets Allah says: "We chose them and guided them to a straight path" – and: "Those are the ones whom Allah guided, so follow their guidance."',
      'Über diese Propheten sagt Allah: „Wir haben sie erwählt und zu einem geraden Weg geleitet“ – und: „Das sind diejenigen, die Allah rechtgeleitet hat; so folge ihrer Rechtleitung.“',
      'O tim poslanicima Allah kaže: „Odabrali smo ih i na Pravi put uputili“ – i: „To su oni kojima je Allah na Pravi put ukazao, zato ti slijedi njihov Pravi put.“',
    ),
    sources: [quran('6:87; 6:90')],
  },
  book: {
    id: 'book-wisdom',
    text: T(
      'Allah gave these prophets the Book, wisdom and prophethood.',
      'Allah gab diesen Propheten die Schrift, die Weisheit und das Prophetentum.',
      'Allah je tim poslanicima dao Knjigu, mudrost i vjerovjesništvo.',
    ),
    sources: [quran('6:89')],
    art: 'object.book',
  },
} satisfies Facts;

export const ALYASA_MISSED: Record<string, string> = {
  favoured: ALYASA_FACTS.favoured.id,
  best: ALYASA_FACTS.best.id,
  guided: ALYASA_FACTS.follow.id,
  chosen: ALYASA_FACTS.follow.id,
  righteous: ALYASA_FACTS.follow.id,
  book: ALYASA_FACTS.book.id,
};

export const alyasaGame: GameDef<AlyasaConfig> = {
  id: ALYASA_ID,
  topicId: 'prophets',
  i18n: alyasaI18n,
  coverArt: 'prophet.alyasa-star',
  hintArt: 'prophet.alyasa-lantern-chain',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./AlyasaGame') as typeof import('./AlyasaGame')).AlyasaGame),
  levels: [
    { level: 1, config: { pairs: ['favoured', 'best', 'guided'].map(same), peekMs: 2500, hints: true, prompt: 'prompt.same' }, facts: [ALYASA_FACTS.favoured] },
    { level: 2, config: { pairs: ['favoured', 'best', 'guided', 'righteous'].map(word), hints: false, prompt: 'prompt.word' }, facts: [ALYASA_FACTS.best] },
    { level: 3, config: { pairs: Q.map((x) => ayah(x.id)), hints: false, prompt: 'prompt.ayah' }, facts: [ALYASA_FACTS.follow, ALYASA_FACTS.book] },
  ],
  order: 20,
};

export const ALYASA_ART: string[] = ['prophet.alyasa-lantern-chain', ...Q.map((x) => x.art)];

export function registerAlyasaGame(): void {
  registerGame(alyasaGame);
}

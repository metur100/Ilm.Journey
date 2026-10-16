import { type GameDef, registerGame } from '@/core/games';
import type { SortBin, SortItem } from '@/core/games/kit';

import { type Facts, gameTexts, lazyGame, quran, T } from '../shared';

/*
 * Yahya – "What Yahya Was" (19:12–15, 3:39). Sort the qualities the Quran gives Yahya: what he was, and what the
 * Quran says he was NOT (19:14: not arrogant, not disobedient); level 3 adds what Allah gave him (19:12–13).
 * Every item is a word of the ayahs – nothing added. A SortBins board.
 */

export const YAHYA_ID = 'yahya-qualities';

export interface YahyaConfig {
  bins: SortBin[];
  items: SortItem[];
  hints: boolean;
  prompt: string;
}

export const yahyaI18n = gameTexts(YAHYA_ID, {
  title: T('What Yahya Was', 'Wie Yahya war', 'Kakav je bio Jahja'),
  description: T(
    'Sort the qualities the Quran gives Yahya – and the ones it says he never had.',
    'Sortiere die Eigenschaften, die der Koran Yahya gibt – und die, die er laut Koran nie hatte.',
    "Razvrstaj osobine koje Kur'an pripisuje Jahji – i one koje, kako Kur'an kaže, nikad nije imao.",
  ),
  howTo: T('Drag each card into the right basket.', 'Zieh jede Karte in den richtigen Korb.', 'Prevuci svaku karticu u pravu korpu.'),
  'prompt.two': T('Was Yahya like this – or was he not?', 'War Yahya so – oder nicht?', 'Je li Jahja bio takav – ili nije?'),
  'prompt.three': T(
    'Now three baskets: what Allah gave him, what he was, what he was not.',
    'Jetzt drei Körbe: was Allah ihm gab, wie er war, wie er nicht war.',
    'Sada tri korpe: šta mu je Allah dao, kakav je bio, kakav nije bio.',
  ),
});

const BIN = {
  was: { id: 'was', label: T('Yahya was…', 'Yahya war…', 'Jahja je bio…'), art: 'prophet.yahya-light' },
  not: { id: 'not', label: T('He was not…', 'Er war nicht…', 'Nije bio…'), art: 'kit.crate' },
  given: { id: 'given', label: T('Allah gave him…', 'Allah gab ihm…', 'Allah mu je dao…'), art: 'prophet.yahya-book' },
} satisfies Record<string, SortBin>;

const ITEM = {
  pious: { id: 'pious', bin: 'was', label: T('Mindful of Allah', 'Gottesfürchtig', 'Bogobojazan'), art: 'object.prayer-mat', sub: '19:13' },
  dutiful: {
    id: 'dutiful',
    bin: 'was',
    label: T('Kind to his parents', 'Gütig zu den Eltern', 'Poslušan roditeljima'),
    art: 'prophet.yahya-home-heart',
    sub: '19:14',
  },
  noble: { id: 'noble', bin: 'was', label: T('Noble', 'Edel', 'Ugledan'), sub: '3:39' },
  chaste: { id: 'chaste', bin: 'was', label: T('Chaste', 'Keusch', 'Čedan'), sub: '3:39' },
  prophet: { id: 'prophet', bin: 'was', label: T('A prophet', 'Ein Prophet', 'Vjerovjesnik'), art: 'garden.olive', sub: '3:39' },
  arrogant: { id: 'arrogant', bin: 'not', label: T('Arrogant', 'Hochmütig', 'Nasilnik'), sub: '19:14' },
  disobedient: { id: 'disobedient', bin: 'not', label: T('Disobedient', 'Ungehorsam', 'Buntovnik'), sub: '19:14' },
  book: { id: 'book', bin: 'given', label: T('The Scripture', 'Die Schrift', 'Knjiga'), art: 'object.book', sub: '19:12' },
  wisdom: {
    id: 'wisdom',
    bin: 'given',
    label: T('Wisdom as a child', 'Weisheit als Kind', 'Mudrost u djetinjstvu'),
    art: 'prophet.yahya-sapling',
    sub: '19:12',
  },
  tender: { id: 'tender', bin: 'given', label: T('Tenderness', 'Zärtlichkeit', 'Samilost'), art: 'prophet.yahya-peace', sub: '19:13' },
  purity: { id: 'purity', bin: 'given', label: T('Purity', 'Reinheit', 'Čistota'), art: 'object.water-jug', sub: '19:13' },
} satisfies Record<string, SortItem>;

export const YAHYA_FACTS = {
  qualities: {
    id: 'yahya-dutiful',
    text: T(
      'Yahya was mindful of Allah and dutiful to his parents, and he was not arrogant or disobedient.',
      'Yahya war gottesfürchtig und gütig zu seinen Eltern, und er war weder hochmütig noch ungehorsam.',
      'Jahja je bio bogobojazan i poslušan roditeljima svojim, i nije bio ni nasilnik ni buntovnik.',
    ),
    sources: [quran('19:13–14')],
    art: 'prophet.yahya-home-heart',
    check: {
      type: 'trueFalse',
      statement: T('Yahya was arrogant and disobedient.', 'Yahya war hochmütig und ungehorsam.', 'Jahja je bio nasilnik i buntovnik.'),
      correct: false,
    },
  },
  noble: {
    id: 'yahya-noble',
    text: T(
      'The angels gave Zakariyya the glad tidings of Yahya: he would confirm a word from Allah and be noble, chaste and a prophet among the righteous.',
      'Die Engel verkündeten Zakariyya Yahya: Er würde ein Wort von Allah bestätigen und edel, keusch und ein Prophet unter den Rechtschaffenen sein.',
      'Meleki su Zekerijji javili radosnu vijest o Jahji: on će potvrditi Riječ od Allaha i bit će ugledan, čedan i vjerovjesnik među dobrima.',
    ),
    sources: [quran('3:39')],
  },
  book: {
    id: 'take-the-book',
    text: T(
      '"O Yahya, take the Scripture with strength." And Allah gave him wisdom while he was still a child, and tenderness and purity from Him.',
      '„O Yahya, nimm die Schrift mit Kraft.“ Und Allah gab ihm Weisheit, als er noch ein Kind war, und Zärtlichkeit und Reinheit von Ihm.',
      '„O Jahja, prihvati Knjigu odlučno!“ I Allah mu je dao mudrost još dok je bio dječak, i samilost od Sebe i čistotu.',
    ),
    sources: [quran('19:12–13')],
    art: 'prophet.yahya-book',
    check: {
      type: 'choice',
      prompt: T(
        'What did Allah give Yahya while he was still a child?',
        'Was gab Allah Yahya, als er noch ein Kind war?',
        'Šta je Allah dao Jahji dok je još bio dječak?',
      ),
      options: [T('Wisdom', 'Weisheit', 'Mudrost'), T('A kingdom', 'Ein Königreich', 'Carstvo'), T('Riches', 'Reichtum', 'Bogatstvo')],
      correctIndex: 0,
    },
  },
  peace: {
    id: 'peace-on-yahya',
    text: T(
      '"Peace be upon him the day he was born, the day he dies, and the day he is raised alive."',
      '„Friede sei auf ihm am Tag, als er geboren wurde, am Tag, an dem er stirbt, und am Tag, an dem er wieder lebendig auferweckt wird.“',
      '„Neka je mir njemu na dan kad se rodio, i na dan kad bude umro, i na dan kad bude oživljen!“',
    ),
    sources: [quran('19:15')],
    art: 'prophet.yahya-peace',
  },
} satisfies Facts;

export const YAHYA_MISSED: Record<string, string> = {
  pious: YAHYA_FACTS.qualities.id,
  dutiful: YAHYA_FACTS.qualities.id,
  arrogant: YAHYA_FACTS.qualities.id,
  disobedient: YAHYA_FACTS.qualities.id,
  noble: YAHYA_FACTS.noble.id,
  chaste: YAHYA_FACTS.noble.id,
  prophet: YAHYA_FACTS.noble.id,
  book: YAHYA_FACTS.book.id,
  wisdom: YAHYA_FACTS.book.id,
  tender: YAHYA_FACTS.book.id,
  purity: YAHYA_FACTS.book.id,
};

export const yahyaGame: GameDef<YahyaConfig> = {
  id: YAHYA_ID,
  topicId: 'prophets',
  i18n: yahyaI18n,
  coverArt: 'prophet.yahya-book',
  hintArt: 'prophet.yahya-sapling',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./YahyaGame') as typeof import('./YahyaGame')).YahyaGame),
  levels: [
    {
      level: 1,
      config: { bins: [BIN.was, BIN.not], items: [ITEM.pious, ITEM.dutiful, ITEM.arrogant, ITEM.disobedient], hints: true, prompt: 'prompt.two' },
      facts: [YAHYA_FACTS.qualities],
    },
    {
      level: 2,
      config: {
        bins: [BIN.was, BIN.not],
        items: [ITEM.pious, ITEM.dutiful, ITEM.noble, ITEM.chaste, ITEM.prophet, ITEM.arrogant, ITEM.disobedient],
        hints: false,
        prompt: 'prompt.two',
      },
      facts: [YAHYA_FACTS.noble],
    },
    {
      level: 3,
      config: {
        bins: [BIN.given, BIN.was, BIN.not],
        items: [ITEM.book, ITEM.wisdom, ITEM.tender, ITEM.purity, ITEM.pious, ITEM.dutiful, ITEM.noble, ITEM.arrogant, ITEM.disobedient],
        hints: false,
        prompt: 'prompt.three',
      },
      facts: [YAHYA_FACTS.book, YAHYA_FACTS.peace],
    },
  ],
  order: 23,
};

export const YAHYA_ART: string[] = [...Object.values(BIN).map((b) => b.art), ...Object.values(ITEM).flatMap((i) => ('art' in i && i.art ? [i.art] : []))];

export function registerYahyaGame(): void {
  registerGame(yahyaGame);
}

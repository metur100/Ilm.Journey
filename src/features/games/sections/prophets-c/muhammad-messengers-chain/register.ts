import { type GameDef, registerGame } from '@/core/games';
import type { KitItem, TimelineEvent, TimelineMark } from '@/core/games/kit';

import { type Facts, gameTexts, lazyGame, quran, T } from '../shared';

/*
 * Muhammad ﷺ – "The Chain of the Messengers" (33:40, 4:163–164, 57:26–27). The prophets form one chain with one
 * message, sealed by the final messenger. L1 and L3 place signs and scriptures on the line of the messengers
 * (TimelineSlider); L2 lays the chain itself as a path of stones (SequenceBoard), ending with the final messenger.
 * Only an order the Quran states is used (Nuh before Ibrahim's line, Musa, then Dawud, then Isa, then the seal).
 */

export const MUHAMMAD_ID = 'muhammad-messengers-chain';

export type MuhammadConfig =
  | { mode: 'timeline'; marks: TimelineMark[]; events: TimelineEvent[]; hints: boolean; prompt: string }
  | { mode: 'path'; items: KitItem[]; hints: boolean; prompt: string };

export const muhammadI18n = gameTexts(MUHAMMAD_ID, {
  title: T('The Chain of the Messengers', 'Die Kette der Gesandten', 'Lanac poslanika'),
  description: T(
    'From Adam to the final messenger ﷺ: one chain, one message. Put the signs and scriptures in their place.',
    'Von Adam bis zum letzten Gesandten ﷺ: eine Kette, eine Botschaft. Bring die Zeichen und Schriften an ihren Platz.',
    'Od Adema do posljednjeg poslanika ﷺ: jedan lanac, jedna poruka. Stavi znakove i Knjige na njihovo mjesto.',
  ),
  howTo: T(
    'Slide the marker to the right messenger and place the card. On the path, drag each stone to its place.',
    'Schieb den Marker zum richtigen Gesandten und lege die Karte ab. Auf dem Pfad ziehst du jeden Stein an seinen Platz.',
    'Pomjeri oznaku do pravog poslanika i postavi karticu. Na stazi prevuci svaki kamen na njegovo mjesto.',
  ),
  'prompt.signs': T('Which messenger does this sign belong to?', 'Zu welchem Gesandten gehört dieses Zeichen?', 'Kojem poslaniku pripada ovaj znak?'),
  'prompt.path': T(
    'Lay the chain of the messengers – it ends with the final messenger ﷺ.',
    'Lege die Kette der Gesandten – sie endet mit dem letzten Gesandten ﷺ.',
    'Složi lanac poslanika – završava se posljednjim poslanikom ﷺ.',
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

const L1_MARKS = (['adam', 'nuh', 'ibrahim', 'musa', 'isa', 'muhammad'] as const).map(mark);
const L1_EVENTS: TimelineEvent[] = [
  { id: 'ark', mark: 'nuh', art: 'object.ark', label: T('The ark', 'Die Arche', 'Lađa'), sub: '11:37' },
  { id: 'kaaba', mark: 'ibrahim', art: 'place.kaaba', label: T('Raising the Kaaba', 'Die Kaaba errichten', 'Podizanje Kabe'), sub: '2:127' },
  { id: 'staff', mark: 'musa', art: 'object.staff', label: T('The staff', 'Der Stab', 'Štap'), sub: '20:17–21' },
  { id: 'palm', mark: 'isa', art: 'prophet.isa-palm-small', label: T('The palm tree', 'Die Palme', 'Palma'), sub: '19:25' },
  { id: 'iqra', mark: 'muhammad', art: 'prophet.muhammad-pen', label: T('"Read!"', '„Lies!“', '„Čitaj!“'), sub: '96:1' },
];

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

const PATH: KitItem[] = [
  { id: 'p-adam', art: 'garden.sapling', label: N.adam },
  { id: 'p-nuh', art: 'object.ark', label: N.nuh },
  { id: 'p-ibrahim', art: 'place.kaaba', label: N.ibrahim },
  { id: 'p-musa', art: 'object.staff', label: N.musa },
  { id: 'p-dawud', art: 'object.shield', label: N.dawud },
  { id: 'p-isa', art: 'prophet.isa-palm-small', label: N.isa },
  { id: 'p-muhammad', art: 'place.masjid-nabawi', label: N.muhammad },
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
  mercy: {
    id: 'mercy-to-worlds',
    text: T(
      'Allah says to the Prophet ﷺ: "We have not sent you except as a mercy to the worlds."',
      'Allah sagt zum Propheten ﷺ: „Wir haben dich nur als Barmherzigkeit für die Welten gesandt.“',
      'Allah kaže Poslaniku ﷺ: „A tebe smo samo kao milost svjetovima poslali.“',
    ),
    sources: [quran('21:107')],
  },
  chain: {
    id: 'one-chain',
    text: T(
      'Allah sent Nuh and Ibrahim and placed prophethood and the Scripture among their descendants; after them He sent more messengers, then Isa. And He sent revelation to Muhammad ﷺ as He sent it to Nuh and the prophets after him.',
      'Allah sandte Nuh und Ibrahim und legte unter ihre Nachkommen das Prophetentum und die Schrift; nach ihnen sandte Er weitere Gesandte, dann Isa. Und Er sandte Muhammad ﷺ Offenbarung, wie Er sie Nuh und den Propheten nach ihm sandte.',
      'Allah je poslao Nuha i Ibrahima i u njihovom potomstvu dao vjerovjesništvo i Knjigu; poslije njih slao je druge poslanike, zatim Isaa. I Muhammedu ﷺ je slao objavu kao što ju je slao Nuhu i vjerovjesnicima poslije njega.',
    ),
    sources: [quran('57:26–27; 4:163')],
    art: 'prophet.muhammad-star-chain',
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
} satisfies Facts;

export const MUHAMMAD_MISSED: Record<string, string> = {
  ark: MUHAMMAD_FACTS.chain.id,
  kaaba: MUHAMMAD_FACTS.chain.id,
  staff: MUHAMMAD_FACTS.chain.id,
  palm: MUHAMMAD_FACTS.chain.id,
  iqra: MUHAMMAD_FACTS.iqra.id,
  names: MUHAMMAD_FACTS.chain.id,
  tawrah: MUHAMMAD_FACTS.books.id,
  zabur: MUHAMMAD_FACTS.books.id,
  injil: MUHAMMAD_FACTS.books.id,
  scrolls: MUHAMMAD_FACTS.books.id,
  seal: MUHAMMAD_FACTS.seal.id,
  ...Object.fromEntries(PATH.map((p) => [p.id, p.id === 'p-muhammad' ? MUHAMMAD_FACTS.seal.id : MUHAMMAD_FACTS.chain.id])),
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
    {
      level: 1,
      config: { mode: 'timeline', marks: L1_MARKS, events: L1_EVENTS, hints: true, prompt: 'prompt.signs' },
      facts: [MUHAMMAD_FACTS.iqra, MUHAMMAD_FACTS.mercy],
    },
    { level: 2, config: { mode: 'path', items: PATH, hints: false, prompt: 'prompt.path' }, facts: [MUHAMMAD_FACTS.chain, MUHAMMAD_FACTS.seal] },
    { level: 3, config: { mode: 'timeline', marks: L3_MARKS, events: L3_EVENTS, hints: false, prompt: 'prompt.books' }, facts: [MUHAMMAD_FACTS.books] },
  ],
  order: 25,
};

export const MUHAMMAD_ART: string[] = ['prophet.muhammad-night-band', ...[...L1_EVENTS, ...L3_EVENTS, ...PATH].flatMap((e) => (e.art ? [e.art] : []))];

export function registerMuhammadGame(): void {
  registerGame(muhammadGame);
}

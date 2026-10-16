import type { GameFact } from '@/core/games';
import type { BuildPart, KitItem } from '@/core/games/kit';

import { bukhari, quran, T } from '../shared';

/* Ibrahim – Raising the House: the sky reasoning (6:76–79), the walls with Ismail (2:127; Bukhari 3364), the dua (2:127–129). */

export const IBRAHIM_FACTS = {
  sky: {
    id: 'ibrahim-things-that-set',
    text: T(
      'The star, the moon and the sun all set. Ibrahim said: "I turn my face to the One who created the heavens and the earth."',
      'Stern, Mond und Sonne gingen alle unter. Ibrahim sagte: „Ich wende mein Gesicht dem zu, der die Himmel und die Erde erschaffen hat.“',
      'Zvijezda, mjesec i sunce su zašli. Ibrahim je rekao: „Ja okrećem lice svoje Onome koji je stvorio nebesa i Zemlju.“',
    ),
    sources: [quran('6:76–79')],
    art: 'prophet.ibrahim-star',
    reviewKey: 'stories:ibrahim-sky',
  },
  fire: {
    id: 'ibrahim-fire-cool',
    text: T('Allah said: "O fire, be coolness and safety for Ibrahim."', 'Allah sprach: „O Feuer, sei Kühlung und Sicherheit für Ibrahim.“', 'Allah je rekao: „O vatro, budi hladna i spas Ibrahimu.“'),
    sources: [quran('21:69')],
    art: 'prophet.ibrahim-fire-cool',
    reviewKey: 'stories:ibrahim-fire',
  },
  walls: {
    id: 'ibrahim-raised-foundations',
    text: T(
      'Ibrahim and his son Ismail raised the foundations of the House – the Kaaba.',
      'Ibrahim und sein Sohn Ismail errichteten die Grundmauern des Hauses – der Kaaba.',
      'Ibrahim i njegov sin Ismail podigli su temelje Kuće – Kabe.',
    ),
    sources: [quran('2:127')],
    art: 'prophet.ibrahim-kaaba-rising',
    reviewKey: 'stories:ibrahim-ismail',
  },
  stone: {
    id: 'ibrahim-standing-stone',
    text: T(
      'When the walls grew high, Ismail brought a stone; Ibrahim stood on it and built while Ismail handed him the stones.',
      'Als die Mauern hoch wurden, brachte Ismail einen Stein; Ibrahim stand darauf und baute, während Ismail ihm die Steine reichte.',
      'Kad su zidovi postali visoki, Ismail je donio kamen; Ibrahim je stao na njega i gradio, a Ismail mu je dodavao kamenje.',
    ),
    sources: [bukhari('3364'), quran('2:125')],
    art: 'prophet.ibrahim-maqam',
  },
  dua: {
    id: 'ibrahim-dua-accept',
    text: T(
      'While building they prayed: "Our Lord, accept this from us. You are the All-Hearing, the All-Knowing."',
      'Beim Bauen beteten sie: „Unser Herr, nimm es von uns an. Du bist der Allhörende, der Allwissende.“',
      'Dok su gradili, molili su: „Gospodaru naš, primi od nas. Ti si Onaj koji sve čuje i sve zna.“',
    ),
    sources: [quran('2:127')],
    art: 'place.kaaba',
    reviewKey: 'stories:ibrahim-dua',
  },
  messenger: {
    id: 'ibrahim-dua-messenger',
    text: T(
      'They asked Allah to send a messenger from among their descendants – Allah answered with Muhammad ﷺ.',
      'Sie baten Allah, einen Gesandten aus ihren Nachkommen zu schicken – Allah erhörte es mit Muhammad ﷺ.',
      'Molili su Allaha da pošalje poslanika iz njihovog potomstva – Allah je uslišao Muhammedom, s.a.v.s.',
    ),
    sources: [quran('2:129'), quran('62:2')],
    art: 'object.book',
  },
} satisfies Record<string, GameFact>;

/** L1: what Ibrahim saw in the sky, in order (6:76–79). */
export const SKY: KitItem[] = [
  { id: 'star', art: 'prophet.ibrahim-star', label: T('A star – it set', 'Ein Stern – er ging unter', 'Zvijezda – zašla je'), sub: '6:76' },
  { id: 'moon', art: 'story.moon-full', label: T('The moon – it set', 'Der Mond – er ging unter', 'Mjesec – zašao je'), sub: '6:77' },
  { id: 'sun', art: 'story.sun', label: T('The sun – it set', 'Die Sonne – sie ging unter', 'Sunce – zašlo je'), sub: '6:78' },
  { id: 'creator', art: 'object.prayer-mat', label: T('I turn to the Creator', 'Ich wende mich dem Schöpfer zu', 'Okrećem se Stvoritelju'), sub: '6:79' },
];

/** L2: the walls on the building site (boxes match `prophet.ibrahim-building-site`, 400 × 300). */
const box = (x: number, y: number, w: number, h: number) => ({ x: x / 400, y: y / 300, w: w / 400, h: h / 300 });
export const WALLS: BuildPart[] = [
  { id: 'foundation', art: 'prophet.ibrahim-foundation', label: T('Foundation', 'Fundament', 'Temelj'), slot: box(110, 238, 180, 14), caption: T('First the foundations (2:127).', 'Zuerst die Grundmauern (2:127).', 'Prvo temelji (2:127).') },
  { id: 'row-1', art: 'prophet.ibrahim-course-a', label: T('Row 1', 'Reihe 1', 'Red 1'), slot: box(115, 212, 170, 26), caption: T('Ismail brings the stones, Ibrahim builds (Bukhari 3364).', 'Ismail bringt die Steine, Ibrahim baut (Bukhari 3364).', 'Ismail donosi kamenje, Ibrahim gradi (Buhari 3364).') },
  { id: 'row-2', art: 'prophet.ibrahim-course-b', label: T('Row 2', 'Reihe 2', 'Red 2'), slot: box(115, 186, 170, 26), caption: T('"Our Lord, accept this from us" (2:127).', '„Unser Herr, nimm es von uns an“ (2:127).', '„Gospodaru naš, primi od nas“ (2:127).') },
  { id: 'maqam', art: 'prophet.ibrahim-maqam', label: T('Standing stone', 'Standstein', 'Kamen za stajanje'), slot: box(300, 226, 40, 26), caption: T('The walls grow high – a stone to stand on (Bukhari 3364).', 'Die Mauern werden hoch – ein Stein zum Daraufstehen (Bukhari 3364).', 'Zidovi rastu – kamen za stajanje (Buhari 3364).') },
  { id: 'row-3', art: 'prophet.ibrahim-course-c', label: T('Row 3', 'Reihe 3', 'Red 3'), slot: box(115, 160, 170, 26), caption: T('"You are the All-Hearing, the All-Knowing" (2:127).', '„Du bist der Allhörende, der Allwissende“ (2:127).', '„Ti sve čuješ i sve znaš“ (2:127).') },
  { id: 'row-4', art: 'prophet.ibrahim-course-d', label: T('Row 4', 'Reihe 4', 'Red 4'), slot: box(115, 134, 170, 26), caption: T('The House of Allah stands (2:127).', 'Das Haus Allahs steht (2:127).', 'Allahova Kuća stoji (2:127).') },
];

/** L3: the dua while building, in order (2:127–129). */
export const DUA: KitItem[] = [
  { id: 'accept', label: T('Our Lord, accept this from us', 'Unser Herr, nimm es von uns an', 'Gospodaru naš, primi od nas'), sub: '2:127' },
  { id: 'hearing', label: T('You are the All-Hearing, the All-Knowing', 'Du bist der Allhörende, der Allwissende', 'Ti sve čuješ i sve znaš'), sub: '2:127' },
  { id: 'devoted', label: T('Make us devoted to You', 'Mach uns zu Dir Ergebenen', 'Učini nas Tebi predanim'), sub: '2:128' },
  { id: 'rites', label: T('Show us our rites', 'Zeige uns unsere Riten', 'Pokaži nam obrede naše'), sub: '2:128' },
  { id: 'messenger', label: T('Send them a messenger', 'Schick ihnen einen Gesandten', 'Pošalji im poslanika'), sub: '2:129' },
];

export const ITEM_FACT: Record<string, string> = {
  star: IBRAHIM_FACTS.sky.id,
  moon: IBRAHIM_FACTS.sky.id,
  sun: IBRAHIM_FACTS.sky.id,
  creator: IBRAHIM_FACTS.sky.id,
  foundation: IBRAHIM_FACTS.walls.id,
  'row-1': IBRAHIM_FACTS.walls.id,
  'row-2': IBRAHIM_FACTS.walls.id,
  'row-3': IBRAHIM_FACTS.walls.id,
  'row-4': IBRAHIM_FACTS.walls.id,
  maqam: IBRAHIM_FACTS.stone.id,
  accept: IBRAHIM_FACTS.dua.id,
  hearing: IBRAHIM_FACTS.dua.id,
  devoted: IBRAHIM_FACTS.dua.id,
  rites: IBRAHIM_FACTS.dua.id,
  messenger: IBRAHIM_FACTS.messenger.id,
};

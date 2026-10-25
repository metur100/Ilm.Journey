import type { GameFact } from '@/core/games';
import type { BuildPart, KitItem } from '@/core/games/kit';

import { lessonFact, type Episode } from '../../prophets-story/episode';
import { bukhari, quran, T } from '../shared';

/*
 * Ibrahim – three events (story ibrahim.json): L1 star, moon and sun set – only the Creator deserves worship
 * (6:76–79), L2 the statues and the fire made cool (21:52–70), L3 raising the Kaaba with Ismail (2:127; Bukhari 3364).
 */

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
  tawhid: lessonFact(
    'tawhid',
    T(
      'Only Allah, the Creator, deserves worship. Think clearly, like Ibrahim: things that set and fade cannot be God.',
      'Nur Allah, der Schöpfer, verdient Anbetung. Denk klar wie Ibrahim: Was untergeht und vergeht, kann nicht Gott sein.',
      'Samo Allah, Stvoritelj, zaslužuje ibadet. Razmišljaj jasno kao Ibrahim: ono što zalazi i nestaje ne može biti Bog.',
    ),
    [quran('6:76–79')],
    { art: 'story.sun' },
  ),
  idols: {
    id: 'ibrahim-statues',
    text: T(
      'Ibrahim broke the statues of his people, all but the biggest, and said: "Ask them, if they can speak." Do you worship, instead of Allah, what can neither help nor harm you?',
      'Ibrahim zerbrach die Statuen seines Volkes, alle außer der größten, und sagte: „Fragt sie doch, wenn sie sprechen können.“ Betet ihr statt Allah an, was euch weder nützt noch schadet?',
      'Ibrahim je razbio kipove svog naroda, sve osim najvećeg, i rekao: „Pitajte njih, ako umiju govoriti.“ Zar se, umjesto Allahu, klanjate onome što vam ne može ni koristiti ni nauditi?',
    ),
    sources: [quran('21:58'), quran('21:63–66')],
    art: 'object.fire',
    reviewKey: 'stories:ibrahim-speak',
  },
  fire: {
    id: 'ibrahim-fire-cool',
    text: T('Allah said: "O fire, be coolness and safety for Ibrahim."', 'Allah sprach: „O Feuer, sei Kühlung und Sicherheit für Ibrahim.“', 'Allah je rekao: „O vatro, budi hladna i spas Ibrahimu.“'),
    sources: [quran('21:69')],
    art: 'prophet.ibrahim-fire-cool',
    reviewKey: 'stories:ibrahim-fire',
  },
  courage: lessonFact(
    'courage',
    T(
      'Stand up for the truth wisely and bravely, and trust Allah completely – He protected Ibrahim even in the fire.',
      'Steh weise und mutig für die Wahrheit ein und vertraue Allah ganz – Er schützte Ibrahim sogar im Feuer.',
      'Zauzmi se za istinu mudro i hrabro i potpuno se pouzdaj u Allaha – On je Ibrahima zaštitio čak i u vatri.',
    ),
    [quran('21:68–70')],
    { art: 'prophet.ibrahim-fire-cool' },
  ),
  walls: {
    id: 'ibrahim-raised-foundations',
    text: T(
      'Ibrahim and his son Ismail raised the foundations of the House – the Kaaba. Ismail brought the stones and Ibrahim built.',
      'Ibrahim und sein Sohn Ismail errichteten die Grundmauern des Hauses – der Kaaba. Ismail brachte die Steine, und Ibrahim baute.',
      'Ibrahim i njegov sin Ismail podigli su temelje Kuće – Kabe. Ismail je donosio kamenje, a Ibrahim je gradio.',
    ),
    sources: [quran('2:127'), bukhari('3364')],
    art: 'prophet.ibrahim-kaaba-rising',
    reviewKey: 'stories:ibrahim-ismail',
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
  together: lessonFact(
    'together',
    T(
      'Do good work together and ask Allah to accept it – like a father and son who built the House of Allah side by side.',
      'Tut Gutes gemeinsam und bittet Allah, es anzunehmen – wie Vater und Sohn, die Seite an Seite das Haus Allahs bauten.',
      'Činite dobro zajedno i molite Allaha da ga primi – kao otac i sin koji su rame uz rame gradili Allahovu Kuću.',
    ),
    [quran('2:127')],
    { art: 'place.kaaba' },
  ),
} satisfies Record<string, GameFact>;

/** L1: what Ibrahim saw in the sky, in order (6:76–79). */
export const SKY: KitItem[] = [
  { id: 'star', art: 'prophet.ibrahim-star', label: T('A star – it set', 'Ein Stern – er ging unter', 'Zvijezda – zašla je'), sub: '6:76' },
  { id: 'moon', art: 'story.moon-full', label: T('The moon – it set', 'Der Mond – er ging unter', 'Mjesec – zašao je'), sub: '6:77' },
  { id: 'sun', art: 'story.sun', label: T('The sun – it set', 'Die Sonne – sie ging unter', 'Sunce – zašlo je'), sub: '6:78' },
  { id: 'creator', art: 'object.prayer-mat', label: T('I turn to the Creator', 'Ich wende mich dem Schöpfer zu', 'Okrećem se Stvoritelju'), sub: '6:79' },
];

/** L2 – the statues and the fire (21:52–70): connect what was said or done with the answer. */
export const FIRE_EPISODE: Episode = {
  kind: 'connect',
  prompt: T(
    'Ibrahim and the statues: connect each question or deed with what followed.',
    'Ibrahim und die Statuen: Verbinde jede Frage oder Tat mit dem, was folgte.',
    'Ibrahim i kipovi: spoji svako pitanje ili djelo s onim što je uslijedilo.',
  ),
  hints: false,
  pairs: [
    {
      id: 'what-statues',
      left: { label: T('"What are these statues you worship?"', '„Was sind das für Statuen, die ihr anbetet?“', '„Kakvi su to kipovi kojima se klanjate?“'), sub: '21:52' },
      right: { label: T('"We found our fathers worshipping them."', '„Wir fanden unsere Väter, wie sie sie anbeteten.“', '„Zatekli smo pretke naše kako im se klanjaju.“'), sub: '21:53' },
    },
    {
      id: 'who-did-this',
      left: { label: T('"Who has done this to our gods?"', '„Wer hat das unseren Göttern angetan?“', '„Ko je ovo uradio s našim božanstvima?“'), sub: '21:59' },
      right: { label: T('"Ask them, if they can speak."', '„Fragt sie doch, wenn sie sprechen können.“', '„Pitajte njih, ako umiju govoriti.“'), sub: '21:63' },
    },
    {
      id: 'burn-him',
      left: { label: T('"Burn him!" – a great fire', '„Verbrennt ihn!“ – ein großes Feuer', '„Spalite ga!“ – velika vatra'), art: 'object.fire', sub: '21:68' },
      right: { label: T('"O fire, be coolness and safety"', '„O Feuer, sei Kühlung und Sicherheit“', '„O vatro, budi hladna i spas“'), art: 'prophet.ibrahim-fire-cool', sub: '21:69' },
    },
    {
      id: 'their-plan',
      left: { label: T('They planned to harm him', 'Sie planten, ihm zu schaden', 'Htjeli su mu nauditi'), sub: '21:70' },
      right: { label: T('Allah made them the losers', 'Allah machte sie zu den Verlierern', 'Allah ih je učinio gubitnicima'), sub: '21:70' },
    },
  ],
  factMap: { 'what-statues': 'ibrahim-statues', 'who-did-this': 'ibrahim-statues', 'burn-him': 'ibrahim-fire-cool', 'their-plan': 'lesson-courage' },
};

/** L3: the walls on the building site (boxes match `prophet.ibrahim-building-site`, 400 × 300). */
const box = (x: number, y: number, w: number, h: number) => ({ x: x / 400, y: y / 300, w: w / 400, h: h / 300 });
export const WALLS: BuildPart[] = [
  { id: 'foundation', art: 'prophet.ibrahim-foundation', label: T('Foundation', 'Fundament', 'Temelj'), slot: box(110, 238, 180, 14), caption: T('First the foundations (2:127).', 'Zuerst die Grundmauern (2:127).', 'Prvo temelji (2:127).') },
  { id: 'row-1', art: 'prophet.ibrahim-course-a', label: T('Row 1', 'Reihe 1', 'Red 1'), slot: box(115, 212, 170, 26), caption: T('Ismail brings the stones, Ibrahim builds (Bukhari 3364).', 'Ismail bringt die Steine, Ibrahim baut (Bukhari 3364).', 'Ismail donosi kamenje, Ibrahim gradi (Buhari 3364).') },
  { id: 'row-2', art: 'prophet.ibrahim-course-b', label: T('Row 2', 'Reihe 2', 'Red 2'), slot: box(115, 186, 170, 26), caption: T('"Our Lord, accept this from us" (2:127).', '„Unser Herr, nimm es von uns an“ (2:127).', '„Gospodaru naš, primi od nas“ (2:127).') },
  { id: 'maqam', art: 'prophet.ibrahim-maqam', label: T('Standing stone', 'Standstein', 'Kamen za stajanje'), slot: box(300, 226, 40, 26), caption: T('The walls grow high – a stone to stand on (Bukhari 3364).', 'Die Mauern werden hoch – ein Stein zum Daraufstehen (Bukhari 3364).', 'Zidovi rastu – kamen za stajanje (Buhari 3364).') },
  { id: 'row-3', art: 'prophet.ibrahim-course-c', label: T('Row 3', 'Reihe 3', 'Red 3'), slot: box(115, 160, 170, 26), caption: T('"You are the All-Hearing, the All-Knowing" (2:127).', '„Du bist der Allhörende, der Allwissende“ (2:127).', '„Ti sve čuješ i sve znaš“ (2:127).') },
  { id: 'row-4', art: 'prophet.ibrahim-course-d', label: T('Row 4', 'Reihe 4', 'Red 4'), slot: box(115, 134, 170, 26), caption: T('The House of Allah stands (2:127).', 'Das Haus Allahs steht (2:127).', 'Allahova Kuća stoji (2:127).') },
];

export const ITEM_FACT: Record<string, string> = {
  star: IBRAHIM_FACTS.sky.id,
  moon: IBRAHIM_FACTS.sky.id,
  sun: IBRAHIM_FACTS.sky.id,
  creator: IBRAHIM_FACTS.tawhid.id,
  foundation: IBRAHIM_FACTS.walls.id,
  'row-1': IBRAHIM_FACTS.walls.id,
  'row-2': IBRAHIM_FACTS.dua.id,
  maqam: IBRAHIM_FACTS.walls.id,
  'row-3': IBRAHIM_FACTS.dua.id,
  'row-4': IBRAHIM_FACTS.together.id,
};

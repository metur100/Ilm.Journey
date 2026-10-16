import type { GameFact } from '@/core/games';
import { LANGUAGE_SOURCES, type LocalizedText } from '@/core/models';

import { quran, T } from '../shared';

/* Adam – Names in the Garden: "He taught Adam the names – all of them" (Quran 2:31). */

export interface NameThing {
  id: string;
  art: string;
  name: LocalizedText;
  /** Arabic word (basic vocabulary) and its transliteration. */
  arabic: string;
  translit: string;
}

export const THINGS: Record<string, NameThing> = {
  sun: { id: 'sun', art: 'garden.sun', name: T('Sun', 'Sonne', 'Sunce'), arabic: 'شَمْس', translit: 'shams' },
  moon: { id: 'moon', art: 'garden.moon', name: T('Moon', 'Mond', 'Mjesec'), arabic: 'قَمَر', translit: 'qamar' },
  water: { id: 'water', art: 'garden.water-drop', name: T('Water', 'Wasser', 'Voda'), arabic: 'مَاء', translit: 'māʾ' },
  palm: { id: 'palm', art: 'garden.palm', name: T('Palm tree', 'Palme', 'Palma'), arabic: 'نَخْلَة', translit: 'nakhla' },
  camel: { id: 'camel', art: 'animal.camel', name: T('Camel', 'Kamel', 'Deva'), arabic: 'جَمَل', translit: 'jamal' },
  bee: { id: 'bee', art: 'animal.bee', name: T('Bee', 'Biene', 'Pčela'), arabic: 'نَحْلَة', translit: 'naḥla' },
  fish: { id: 'fish', art: 'animal.fish', name: T('Fish', 'Fisch', 'Riba'), arabic: 'سَمَكَة', translit: 'samaka' },
  bird: { id: 'bird', art: 'garden.bird', name: T('Bird', 'Vogel', 'Ptica'), arabic: 'طَائِر', translit: 'ṭāʾir' },
  rose: { id: 'rose', art: 'garden.flower-rose', name: T('Rose', 'Rose', 'Ruža'), arabic: 'وَرْدَة', translit: 'warda' },
  fig: { id: 'fig', art: 'garden.fig', name: T('Fig tree', 'Feigenbaum', 'Smokva'), arabic: 'تِين', translit: 'tīn' },
  ant: { id: 'ant', art: 'animal.ant', name: T('Ant', 'Ameise', 'Mrav'), arabic: 'نَمْلَة', translit: 'namla' },
  olive: { id: 'olive', art: 'garden.olive', name: T('Olive tree', 'Olivenbaum', 'Maslina'), arabic: 'زَيْتُون', translit: 'zaytūn' },
  pomegranate: { id: 'pomegranate', art: 'garden.pomegranate', name: T('Pomegranate', 'Granatapfel', 'Nar'), arabic: 'رُمَّان', translit: 'rummān' },
  cloud: { id: 'cloud', art: 'garden.cloud', name: T('Cloud', 'Wolke', 'Oblak'), arabic: 'سَحَابَة', translit: 'saḥāba' },
};

export const LEVEL_THINGS = {
  1: ['sun', 'moon', 'water', 'palm'],
  2: ['camel', 'bee', 'fish', 'bird', 'rose', 'fig'],
  3: ['ant', 'olive', 'pomegranate', 'cloud', 'sun'],
} as const;

export const ADAM_FACTS = {
  names: {
    id: 'taught-the-names',
    text: T(
      'Allah taught Adam the names – all of them. Knowledge is an honour from Allah.',
      'Allah lehrte Adam die Namen – alle. Wissen ist eine Ehre von Allah.',
      'Allah je poučio Adema imenima – svim. Znanje je počast od Allaha.',
    ),
    sources: [quran('2:31')],
    art: 'prophet.adam-names',
    reviewKey: 'stories:adam-names',
  },
  angels: {
    id: 'angels-knowledge',
    text: T(
      'The angels said: "Glory be to You! We know nothing except what You have taught us."',
      'Die Engel sagten: „Preis sei Dir! Wir wissen nur, was Du uns gelehrt hast.“',
      'Meleki su rekli: „Hvaljen neka si! Mi znamo samo ono čemu si nas Ti poučio.“',
    ),
    sources: [quran('2:32')],
    art: 'prophet.adam-names',
    check: {
      type: 'trueFalse',
      statement: T(
        'The angels said that they knew the names without being taught.',
        'Die Engel sagten, sie kennten die Namen, ohne sie gelernt zu haben.',
        'Meleki su rekli da znaju imena i bez poučavanja.',
      ),
      correct: false,
    },
  },
  told: {
    id: 'adam-told-names',
    text: T('Then Adam told the angels the names of the things.', 'Dann nannte Adam den Engeln die Namen der Dinge.', 'Tada je Adem kazao melekima imena stvari.'),
    sources: [quran('2:33')],
    art: 'prophet.adam-tree',
  },
  honour: {
    id: 'knowledge-honour',
    text: T(
      'Allah honoured Adam with knowledge: he knew the names that the angels had not been taught.',
      'Allah ehrte Adam mit Wissen: Er kannte die Namen, die den Engeln nicht gelehrt worden waren.',
      'Allah je počastio Adema znanjem: znao je imena kojima meleki nisu bili poučeni.',
    ),
    sources: [quran('2:31–33')],
    art: 'prophet.adam-tree',
  },
  arabicWords: {
    id: 'arabic-nature-words',
    kind: 'language',
    text: T(
      'In Arabic, the sun is شَمْس (shams), the moon is قَمَر (qamar) and an ant is نَمْلَة (namla).',
      'Auf Arabisch heißt die Sonne شَمْس (schams), der Mond قَمَر (qamar) und eine Ameise نَمْلَة (namla).',
      'Na arapskom je sunce شَمْس (šems), mjesec قَمَر (kamer), a mrav نَمْلَة (nemla).',
    ),
    sources: [LANGUAGE_SOURCES.vocabulary],
    art: 'animal.ant',
  },
} satisfies Record<string, GameFact>;

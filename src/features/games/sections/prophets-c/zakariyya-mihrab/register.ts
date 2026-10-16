import { type GameDef, registerGame } from '@/core/games';
import type { SceneSpot } from '@/core/games/kit';

import { type Facts, gameTexts, lazyGame, quran, T } from '../shared';

/*
 * Zakariyya – "The Mihrab" (3:37–41, 19:2–11). Look around the room of the mihrab: find the provision Allah gave
 * Maryam (3:37), then the places of the story in order (the mihrab, the prayer place where the angels called him,
 * 3:39), and finally the signs of remembering Allah "in the evening and the morning" (3:41). A TapScene board.
 */

export const ZAKARIYYA_ID = 'zakariyya-mihrab';

export interface ZakariyyaConfig {
  spots: SceneSpot[];
  ordered: boolean;
  hints: boolean;
  prompt: string;
}

export const zakariyyaI18n = gameTexts(ZAKARIYYA_ID, {
  title: T('The Mihrab', 'Der Mihrab', 'Mihrab'),
  description: T(
    'Look around the mihrab where Zakariyya found provision from Allah and made his quiet dua.',
    "Schau dich im Mihrab um, wo Zakariyya Versorgung von Allah fand und sein leises Du'a sprach.",
    'Razgledaj mihrab u kojem je Zekerijja nalazio opskrbu od Allaha i upućivao svoju tihu dovu.',
  ),
  howTo: T(
    'Tap the things in the picture that the caption asks for.',
    'Tippe im Bild auf die Dinge, nach denen gefragt wird.',
    'Dodirni na slici ono što se traži.',
  ),
  'prompt.provision': T(
    'Every time Zakariyya came in, he found provision. Find all of it!',
    'Jedes Mal, wenn Zakariyya hereinkam, fand er Versorgung. Finde sie alle!',
    'Kad god bi Zekerijja ušao, nalazio je opskrbu. Pronađi je svu!',
  ),
  'prompt.story': T(
    'Find the places of the story, one after another.',
    'Finde die Orte der Geschichte, einen nach dem anderen.',
    'Pronađi mjesta iz kazivanja, jedno za drugim.',
  ),
  'prompt.remember': T(
    '"Remember your Lord much, evening and morning" – find the signs. Not everything belongs!',
    '„Gedenke deines Herrn viel, abends und morgens“ – finde die Zeichen. Nicht alles gehört dazu!',
    '„Spominji mnogo svoga Gospodara, navečer i ujutro“ – pronađi znakove. Ne pripada sve!',
  ),
});

const BOX = {
  ledge: { x: 0.41, y: 0.5, w: 0.18, h: 0.18 },
  shelfL: { x: 0.07, y: 0.56, w: 0.2, h: 0.17 },
  shelfR: { x: 0.73, y: 0.56, w: 0.2, h: 0.17 },
  lamp: { x: 0.44, y: 0.26, w: 0.12, h: 0.2 },
  mat: { x: 0.36, y: 0.86, w: 0.28, h: 0.13 },
  beads: { x: 0.06, y: 0.85, w: 0.14, h: 0.14 },
  floorR: { x: 0.8, y: 0.85, w: 0.14, h: 0.14 },
  morning: { x: 0.07, y: 0.15, w: 0.19, h: 0.42 },
  evening: { x: 0.74, y: 0.15, w: 0.19, h: 0.42 },
};

const SPOT: Record<string, SceneSpot> = {
  provision: {
    id: 'provision',
    at: BOX.ledge,
    spotArt: 'prophet.zakariyya-provision',
    label: T('Provision', 'Versorgung', 'Opskrba'),
    caption: T('"It is from Allah," said Maryam. (3:37)', '„Es ist von Allah“, sagte Maryam. (3:37)', '„Od Allaha je“, rekla je Merjema. (3:37)'),
  },
  fruit: {
    id: 'fruit',
    at: BOX.shelfL,
    spotArt: 'food.fruit-bowl',
    label: T('Fruit', 'Obst', 'Voće'),
    caption: T(
      'Allah provides for whom He wills without measure. (3:37)',
      'Allah versorgt, wen Er will, ohne zu rechnen. (3:37)',
      'Allah daje onome kome hoće bez računa. (3:37)',
    ),
  },
  dates: {
    id: 'dates',
    at: BOX.shelfR,
    spotArt: 'object.dates',
    label: T('Dates', 'Datteln', 'Hurme'),
    caption: T('Provision from Allah.', 'Versorgung von Allah.', 'Opskrba od Allaha.'),
  },
  lamp: {
    id: 'lamp',
    at: BOX.lamp,
    label: T('The mihrab', 'Der Mihrab', 'Mihrab'),
    caption: T(
      'Zakariyya took care of Maryam in the mihrab. (3:37)',
      'Zakariyya sorgte im Mihrab für Maryam. (3:37)',
      'Zekerijja se brinuo o Merjemi u mihrabu. (3:37)',
    ),
  },
  mat: {
    id: 'mat',
    at: BOX.mat,
    spotArt: 'object.prayer-mat',
    label: T('Prayer place', 'Gebetsplatz', 'Mjesto namaza'),
    caption: T(
      'The angels called him while he stood praying in the mihrab. (3:39)',
      'Die Engel riefen ihm zu, während er im Mihrab stand und betete. (3:39)',
      'Meleki su ga zovnuli dok je stajao u mihrabu i klanjao. (3:39)',
    ),
  },
  beads: {
    id: 'beads',
    at: BOX.beads,
    spotArt: 'object.prayer-beads',
    label: T('Remembering Allah', 'Allahs gedenken', 'Spominjanje Allaha'),
    caption: T('"Remember your Lord much." (3:41)', '„Gedenke deines Herrn viel.“ (3:41)', '„Spominji mnogo svoga Gospodara.“ (3:41)'),
  },
  morning: {
    id: 'morning',
    at: BOX.morning,
    label: T('Morning', 'Morgen', 'Jutro'),
    caption: T('Glorify Him in the morning… (3:41)', 'Preise Ihn am Morgen… (3:41)', 'Hvali Ga ujutro… (3:41)'),
  },
  evening: {
    id: 'evening',
    at: BOX.evening,
    label: T('Evening', 'Abend', 'Večer'),
    caption: T('…and in the evening. (3:41; 19:11)', '…und am Abend. (3:41; 19:11)', '…i navečer. (3:41; 19:11)'),
  },
  coins: { id: 'coins', at: BOX.shelfR, spotArt: 'object.coins', target: false, label: T('Coins', 'Münzen', 'Novčići') },
  key: { id: 'key', at: BOX.floorR, spotArt: 'object.key', target: false, label: T('Key', 'Schlüssel', 'Ključ') },
};

export const ZAKARIYYA_FACTS = {
  provision: {
    id: 'mihrab-provision',
    text: T(
      'Every time Zakariyya came to Maryam in the mihrab, he found provision with her. She said: "It is from Allah. Allah provides for whom He wills without measure."',
      'Jedes Mal, wenn Zakariyya zu Maryam in den Mihrab kam, fand er Versorgung bei ihr. Sie sagte: „Es ist von Allah. Allah versorgt, wen Er will, ohne zu rechnen.“',
      'Kad god bi Zekerijja ušao Merjemi u mihrab, kod nje bi našao hrane. Ona bi rekla: „Od Allaha je. Allah daje u izobilju onome kome hoće, bez računa.“',
    ),
    sources: [quran('3:37')],
    art: 'prophet.zakariyya-provision',
    check: {
      type: 'choice',
      prompt: T(
        'Where did Maryam say her provision came from?',
        'Woher kam Maryams Versorgung nach ihren Worten?',
        'Odakle je, po Merjeminim riječima, njena opskrba?',
      ),
      options: [T('From Allah', 'Von Allah', 'Od Allaha'), T('From the market', 'Vom Markt', 'S pijace'), T('From Zakariyya', 'Von Zakariyya', 'Od Zekerijje')],
      correctIndex: 0,
    },
  },
  dua: {
    id: 'quiet-dua',
    text: T(
      'There Zakariyya called upon his Lord in a quiet voice and asked for a good child. While he stood praying in the mihrab, the angels gave him the glad tidings of Yahya.',
      'Da rief Zakariyya seinen Herrn mit leiser Stimme an und bat um ein gutes Kind. Während er im Mihrab stand und betete, verkündeten ihm die Engel Yahya.',
      'Tada je Zekerijja tihim glasom zamolio svoga Gospodara za dobro potomstvo. Dok je stajao u mihrabu i klanjao, meleki su mu donijeli radosnu vijest o Jahji.',
    ),
    sources: [quran('3:38–39; 19:3–7')],
  },
  sign: {
    id: 'three-days',
    text: T(
      'His sign was that he would not speak to people for three days except by signs. "Remember your Lord much and glorify Him in the evening and the morning."',
      'Sein Zeichen war, dass er drei Tage lang nicht zu den Menschen sprechen würde, außer durch Zeichen. „Gedenke deines Herrn viel und preise Ihn am Abend und am Morgen.“',
      'Njegov znak je bio da tri dana neće govoriti s ljudima osim znakovima. „Spominji mnogo svoga Gospodara i hvali Ga navečer i ujutro.“',
    ),
    sources: [quran('3:41; 19:10–11')],
    check: {
      type: 'trueFalse',
      statement: T(
        'For three days Zakariyya spoke to people only by signs.',
        'Drei Tage lang sprach Zakariyya nur durch Zeichen zu den Menschen.',
        'Tri dana je Zekerijja s ljudima govorio samo znakovima.',
      ),
      correct: true,
    },
  },
} satisfies Facts;

export const ZAKARIYYA_MISSED: Record<string, string> = {
  provision: ZAKARIYYA_FACTS.provision.id,
  fruit: ZAKARIYYA_FACTS.provision.id,
  dates: ZAKARIYYA_FACTS.provision.id,
  lamp: ZAKARIYYA_FACTS.dua.id,
  mat: ZAKARIYYA_FACTS.dua.id,
  beads: ZAKARIYYA_FACTS.sign.id,
  morning: ZAKARIYYA_FACTS.sign.id,
  evening: ZAKARIYYA_FACTS.sign.id,
  coins: ZAKARIYYA_FACTS.provision.id,
  key: ZAKARIYYA_FACTS.sign.id,
};

export const zakariyyaGame: GameDef<ZakariyyaConfig> = {
  id: ZAKARIYYA_ID,
  topicId: 'prophets',
  i18n: zakariyyaI18n,
  coverArt: 'prophet.zakariyya-mihrab',
  hintArt: 'prophet.zakariyya-provision',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./ZakariyyaGame') as typeof import('./ZakariyyaGame')).ZakariyyaGame),
  levels: [
    {
      level: 1,
      config: { spots: [SPOT.provision, SPOT.fruit, SPOT.dates], ordered: false, hints: true, prompt: 'prompt.provision' },
      facts: [ZAKARIYYA_FACTS.provision],
    },
    {
      level: 2,
      config: { spots: [SPOT.lamp, SPOT.provision, SPOT.mat, SPOT.morning, SPOT.evening], ordered: true, hints: false, prompt: 'prompt.story' },
      facts: [ZAKARIYYA_FACTS.dua],
    },
    {
      level: 3,
      config: { spots: [SPOT.beads, SPOT.morning, SPOT.evening, SPOT.provision, SPOT.coins, SPOT.key], ordered: true, hints: false, prompt: 'prompt.remember' },
      facts: [ZAKARIYYA_FACTS.sign],
    },
  ],
  order: 22,
};

export const ZAKARIYYA_ART: string[] = ['prophet.zakariyya-room', ...Object.values(SPOT).flatMap((s) => (s.spotArt ? [s.spotArt] : []))];

export function registerZakariyyaGame(): void {
  registerGame(zakariyyaGame);
}

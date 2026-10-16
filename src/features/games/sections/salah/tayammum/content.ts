import type { GameFact } from '@/core/games';

import { BUKHARI, choice, fact, ILMIHAL, L, Q } from '../shared/content';

/*
 * Tejemmum (tayammum, dry purification) – Hanafi practice as taught in the Bosnian ilmihal (chapter "Tejemmum").
 * L1 find what you may use (things of the earth's kind) in a yard, L2 strike and wipe in order, L3 when it is allowed.
 */

/** L1 spots in `salah.basics-earth-yard` (400 × 300). Targets are of the earth's kind (Hanafi). */
export const YARD_SPOTS: { id: string; target: boolean; at: { x: number; y: number; w: number; h: number } }[] = [
  { id: 'sand', target: true, at: { x: 0.3, y: 0.69, w: 0.25, h: 0.15 } },
  { id: 'stones', target: true, at: { x: 0.04, y: 0.77, w: 0.21, h: 0.15 } },
  { id: 'brick', target: true, at: { x: 0.02, y: 0.22, w: 0.3, h: 0.42 } },
  { id: 'bench', target: false, at: { x: 0.61, y: 0.76, w: 0.18, h: 0.14 } },
  { id: 'bucket', target: false, at: { x: 0.83, y: 0.72, w: 0.12, h: 0.2 } },
  { id: 'window', target: false, at: { x: 0.72, y: 0.22, w: 0.18, h: 0.22 } },
  { id: 'jar', target: false, at: { x: 0.51, y: 0.54, w: 0.1, h: 0.14 } },
  { id: 'tree', target: false, at: { x: 0.4, y: 0.33, w: 0.14, h: 0.3 } },
];

/** L2: strike, wipe the face, strike again, wipe the arms (right, then left) up to and including the elbows. */
export const STEPS: { id: string; art: string }[] = [
  { id: 'strike-1', art: 'salah.basics-palms-sand' },
  { id: 'face', art: 'body.face' },
  { id: 'strike-2', art: 'salah.basics-palms-sand' },
  { id: 'right-arm', art: 'body.arms' },
  { id: 'left-arm', art: 'body.arms' },
];

/** L3: tejemmum allowed or wudu with water. */
export const WHEN_ITEMS: { id: string; bin: 'tayammum' | 'wudu'; art?: string }[] = [
  { id: 'no-water', bin: 'tayammum', art: 'salah.basics-earth-yard' },
  { id: 'illness', bin: 'tayammum', art: 'salah.basics-plaster' },
  { id: 'thirst', bin: 'tayammum', art: 'object.cup' },
  { id: 'near', bin: 'wudu', art: 'salah.basics-ibrik' },
  { id: 'cold', bin: 'wudu', art: 'ui.water-drop' },
  { id: 'found', bin: 'wudu', art: 'object.well' },
];

export const TAYAMMUM_FACTS = {
  quran: fact(
    'tayammum-quran',
    L(
      'The Quran says: if you find no water, then seek clean earth and wipe your faces and your hands with it.',
      'Der Koran sagt: Wenn ihr kein Wasser findet, dann sucht reine Erde und streicht euch damit über Gesicht und Hände.',
      "Kur'an kaže: ako ne nađete vode, onda potražite čistu zemlju i potarite njome lica svoja i ruke.",
    ),
    [Q('4:43'), Q('5:6')],
    'salah.basics-palms-sand',
  ),
  earth: fact(
    'tayammum-earth-kind',
    L(
      'Tejemmum is made with clean earth. In the Hanafi school anything of the earth’s kind may be used – sand, stone, clay, brick, dust – but not wood, metal or glass. Scholars of other schools differ: some allow only dust.',
      'Tayammum wird mit reiner Erde gemacht. In der hanafitischen Schule darf alles von der Art der Erde verwendet werden – Sand, Stein, Lehm, Ziegel, Staub –, aber nicht Holz, Metall oder Glas. Gelehrte anderer Rechtsschulen sind sich uneinig: Manche erlauben nur Staub.',
      'Tejemmum se uzima čistom zemljom. U hanefijskom mezhebu može se koristiti sve što je od vrste zemlje – pijesak, kamen, ilovača, cigla, prašina – ali ne drvo, metal ili staklo. Učenjaci drugih mezheba se razilaze: neki dozvoljavaju samo prašinu.',
    ),
    [Q('4:43'), ILMIHAL('Tejemmum')],
    'salah.basics-earth-yard',
  ),
  steps: fact(
    'tayammum-two-strikes',
    L(
      'Tejemmum: make the intention, strike the palms on clean earth and wipe the whole face; strike again and wipe the right arm, then the left arm, up to and including the elbows.',
      'Tayammum: die Absicht fassen, die Handflächen auf reine Erde schlagen und das ganze Gesicht bestreichen; noch einmal schlagen und den rechten, dann den linken Arm bis einschließlich der Ellenbogen bestreichen.',
      'Tejemmum: zanijetiti, udariti dlanovima o čistu zemlju i potrti cijelo lice; ponovo udariti i potrti desnu, pa lijevu ruku do iza laktova.',
    ),
    [ILMIHAL('Tejemmum'), Q('5:6')],
    'body.arms',
    choice(L('How many times are the palms struck on the earth?', 'Wie oft werden die Handflächen auf die Erde geschlagen?', 'Koliko puta se dlanovima udara o zemlju?'), [L('Once', 'Einmal', 'Jednom'), L('Twice', 'Zweimal', 'Dva puta'), L('Three times', 'Dreimal', 'Tri puta')], 1),
  ),
  schools: fact(
    'tayammum-schools-differ',
    L(
      'Scholars of other schools differ: following the hadith of ʿAmmar, some teach one strike and wiping the hands only up to the wrists.',
      'Gelehrte anderer Rechtsschulen sind sich uneinig: Nach dem Hadith von ʿAmmar lehren manche einen Schlag und das Bestreichen der Hände nur bis zu den Handgelenken.',
      'Učenjaci drugih mezheba se razilaze: prema hadisu od Ammara neki uče jedan udarac i potiranje šaka samo do zglobova.',
    ),
    [BUKHARI('338'), ILMIHAL('Tejemmum')],
    'salah.basics-palms-sand',
  ),
  when: fact(
    'tayammum-when',
    L(
      'Tejemmum is allowed when there is no water nearby, when water would harm you (for example in an illness), or when the water is needed for drinking. As soon as water is found and can be used, the tejemmum ends and wudu is made.',
      'Tayammum ist erlaubt, wenn kein Wasser in der Nähe ist, wenn Wasser schaden würde (zum Beispiel bei einer Krankheit) oder wenn das Wasser zum Trinken gebraucht wird. Sobald Wasser gefunden wird und benutzt werden kann, endet der Tayammum, und man macht die Gebetswaschung.',
      'Tejemmum je dozvoljen kada u blizini nema vode, kada bi voda naškodila (npr. kod bolesti) ili kada je voda potrebna za piće. Čim se nađe voda koja se može koristiti, tejemmum prestaje i uzima se abdest.',
    ),
    [Q('4:43'), ILMIHAL('Tejemmum')],
    'object.well',
  ),
  ease: fact(
    'tayammum-ease',
    L(
      'At the end of the verse of wudu and tejemmum Allah says that He does not want to make difficulty for you, but wants to purify you and complete His favour upon you.',
      'Am Ende des Verses über Wudu und Tayammum sagt Allah, dass Er euch keine Schwierigkeit auferlegen, sondern euch reinigen und Seine Gnade an euch vollenden will.',
      'Na kraju ajeta o abdestu i tejemmumu Allah kaže da vam ne želi poteškoću, nego želi da vas očisti i da vam upotpuni Svoju blagodat.',
    ),
    [Q('5:6')],
    'salah.basics-palms-sand',
  ),
} satisfies Record<string, GameFact>;

export const FACT_OF: Record<string, string> = {
  sand: TAYAMMUM_FACTS.earth.id,
  stones: TAYAMMUM_FACTS.earth.id,
  brick: TAYAMMUM_FACTS.earth.id,
  bench: TAYAMMUM_FACTS.earth.id,
  bucket: TAYAMMUM_FACTS.earth.id,
  window: TAYAMMUM_FACTS.earth.id,
  jar: TAYAMMUM_FACTS.earth.id,
  tree: TAYAMMUM_FACTS.earth.id,
  'strike-1': TAYAMMUM_FACTS.steps.id,
  face: TAYAMMUM_FACTS.steps.id,
  'strike-2': TAYAMMUM_FACTS.steps.id,
  'right-arm': TAYAMMUM_FACTS.steps.id,
  'left-arm': TAYAMMUM_FACTS.steps.id,
};

export const TAYAMMUM_ART = ['salah.basics-earth-yard', 'salah.basics-palms-sand', 'body.face', 'body.arms', 'salah.basics-plaster', 'object.cup', 'salah.basics-ibrik', 'ui.water-drop', 'object.well'];

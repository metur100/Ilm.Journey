import type { GameFact } from '@/core/games';
import type { LocalizedText } from '@/core/models';

import { BUKHARI, choice, fact, ILMIHAL, L, Q } from '../shared/content';

/*
 * Content of Wudu Flow (abdest). Texts marked "content" are copied from the Salah content of the Learn feature
 * (src/features/learn/content/quests/salah.json lesson "salah-wudu", questions "salah-wudu-order", "salah-wudu-feet",
 * "salah-wudu-surah"; src/features/learn/content/salah/salah-wudu.json). The farz and sunnahs follow the Hanafi school
 * as taught in the Bosnian ilmihal (chapter "Abdest"); other schools are noted where they differ visibly.
 */

/** Parts of the wudu in the common order (L1 pour, L3 repair). */
export const WUDU_ORDER = ['hands', 'mouth', 'nose', 'face', 'arms', 'head', 'ears', 'feet'] as const;
export type WuduPart = (typeof WUDU_ORDER)[number];

export const PART_ART: Record<WuduPart, string> = {
  hands: 'body.hands',
  mouth: 'body.mouth',
  nose: 'body.nose',
  face: 'body.face',
  arms: 'body.arms',
  head: 'body.head',
  ears: 'body.ears',
  feet: 'body.feet',
};

/** The four farz of wudu (Hanafi) – exactly the parts named in Quran 5:6. */
export const FARZ_PARTS: readonly WuduPart[] = ['face', 'arms', 'head', 'feet'];

/** How far the water rises on each card: the head is only wiped (at least a quarter), the ears are wiped too. */
export const PART_FILL: Partial<Record<WuduPart, number>> = { head: 0.25, ears: 0.35 };

/** L2: farz or sunnah (Hanafi). */
export const SORT_ITEMS: { id: string; bin: 'farz' | 'sunnah'; art?: string }[] = [
  { id: 'face', bin: 'farz', art: 'body.face' },
  { id: 'arms', bin: 'farz', art: 'body.arms' },
  { id: 'head-quarter', bin: 'farz', art: 'body.head' },
  { id: 'feet', bin: 'farz', art: 'body.feet' },
  { id: 'niyyah', bin: 'sunnah', art: 'salah.basics-niyyah' },
  { id: 'hands', bin: 'sunnah', art: 'body.hands' },
  { id: 'mouth', bin: 'sunnah', art: 'body.mouth' },
  { id: 'nose', bin: 'sunnah', art: 'body.nose' },
  { id: 'ears', bin: 'sunnah', art: 'body.ears' },
  { id: 'three', bin: 'sunnah', art: 'ui.water-drop' },
];

/** L3: the mixed-up sequence the learner repairs (a typical slip: face first, feet before the head). */
export const MIXED_START: WuduPart[] = ['face', 'hands', 'mouth', 'nose', 'arms', 'feet', 'head', 'ears'];

/** content: quests/salah.json › salah-wudu › differenceNote */
export const WUDU_DIFFERENCE_NOTE: LocalizedText = {
  en: 'The schools of Islamic law agree on the parts named in the Quran, but differ on some details – for example which steps are obligatory and which are sunnah, and what breaks wudu. Learn the details from your parents or a trusted teacher.',
  de: 'Die Rechtsschulen sind sich über die im Koran genannten Teile einig, unterscheiden sich aber in manchen Details – zum Beispiel, welche Schritte Pflicht und welche Sunna sind und was die Waschung ungültig macht. Lerne die Einzelheiten von deinen Eltern oder einer vertrauten Lehrperson.',
  bs: "Pravne škole se slažu oko dijelova spomenutih u Kur'anu, ali se razlikuju u nekim detaljima – npr. koji su koraci farz, a koji sunnet, i šta kvari abdest. Detalje nauči od roditelja ili učitelja kojem vjeruješ.",
};

const QURAN_5_6 = [Q('5:6')];

export const WUDU_FACTS = {
  farz: fact(
    'wudu-four-farz',
    L(
      'Wudu has four farz: washing the face, washing the arms up to and including the elbows, wiping at least a quarter of the head with a wet hand, and washing the feet up to and including the ankles. All four are named in the Quran.',
      'Die Gebetswaschung hat vier Pflichtteile (Fard): das Gesicht waschen, die Arme bis einschließlich der Ellenbogen waschen, mindestens ein Viertel des Kopfes mit nasser Hand bestreichen und die Füße bis einschließlich der Knöchel waschen. Alle vier nennt der Koran.',
      "Abdest ima četiri farza: oprati lice, oprati ruke do iza laktova, potrti mokrom rukom barem četvrtinu glave i oprati noge do iza članaka. Sva četiri spominje Kur'an.",
    ),
    [Q('5:6'), ILMIHAL('Abdest')],
    'body.face',
    choice(L('How many farz does wudu have?', 'Wie viele Pflichtteile hat die Gebetswaschung?', 'Koliko farzova ima abdest?'), [L('2', '2', '2'), L('4', '4', '4'), L('8', '8', '8')], 1),
  ),
  quranParts: fact(
    'wudu-quran-parts',
    // content: quests/salah.json › lessons › salah-wudu › sections[0]
    L(
      'Before Salah we make wudu (ablution). The Quran mentions washing the face, washing the arms up to the elbows, wiping the head and washing the feet up to the ankles.',
      'Vor dem Gebet machen wir Wudu (die Gebetswaschung). Der Koran erwähnt das Waschen des Gesichts, das Waschen der Arme bis zu den Ellenbogen, das Bestreichen des Kopfes und das Waschen der Füße bis zu den Knöcheln.',
      "Prije namaza uzimamo abdest. Kur'an spominje pranje lica, pranje ruku do iza laktova, potiranje glave i pranje nogu do iza članaka.",
    ),
    QURAN_5_6,
    'body.water-on-hands',
    // content: quests/salah.json › questions › salah-wudu-surah
    choice(
      L('In which surah does the Quran describe wudu?', 'In welcher Sure beschreibt der Koran die Gebetswaschung?', "U kojoj suri Kur'an opisuje abdest?"),
      [L('Al-Fatiha', 'Al-Fatiha', 'El-Fatiha'), L("Al-Ma'idah", "Al-Ma'ida", 'El-Maide'), L('Al-Ikhlas', 'Al-Ichlas', 'El-Ihlas')],
      1,
    ),
  ),
  sunnah: fact(
    'wudu-sunnahs',
    L(
      'Sunnahs of wudu are, among others: the intention (niyyah), saying Bismillah, washing the hands to the wrists, rinsing the mouth and the nose, washing each part three times, wiping the whole head and the ears, and keeping the order. The Prophet ﷺ made wudu this way.',
      'Zu den Sunna-Teilen der Gebetswaschung gehören unter anderem: die Absicht (Niyya), Bismillah sagen, die Hände bis zu den Handgelenken waschen, Mund und Nase spülen, jeden Teil dreimal waschen, den ganzen Kopf und die Ohren bestreichen und die Reihenfolge einhalten. So machte der Prophet ﷺ die Waschung.',
      'Sunneti abdesta su, između ostalog: nijjet, izgovoriti bismillu, oprati ruke do zglobova, isprati usta i nos, oprati svaki dio tri puta, potrti cijelu glavu i uši te držati se redoslijeda. Tako je abdest uzimao Poslanik ﷺ.',
    ),
    [BUKHARI('159'), ILMIHAL('Abdest')],
    'body.mouth',
  ),
  schools: fact(
    'wudu-schools-differ',
    L(
      'Scholars of other schools differ on some of these points: in the Shafi‘i school, for example, the intention and the order are farz as well.',
      'Gelehrte anderer Rechtsschulen sind sich in einigen Punkten uneinig: In der schafiitischen Schule zum Beispiel sind auch die Absicht und die Reihenfolge Pflicht.',
      'Učenjaci drugih mezheba se u nekim tačkama razilaze: u šafijskom mezhebu, na primjer, i nijjet i redoslijed su farz.',
    ),
    [ILMIHAL('Abdest'), Q('5:6')],
    'salah.basics-niyyah',
  ),
  commonOrder: {
    ...fact(
      'wudu-common-order',
      // content: quests/salah.json › questions › salah-wudu-order › explanation
      L(
        'Hands, mouth, nose, face, arms, head, then feet. The face, arms, head and feet are named in the Quran (5:6).',
        'Hände, Mund, Nase, Gesicht, Arme, Kopf, dann Füße. Gesicht, Arme, Kopf und Füße werden im Koran genannt (5:6).',
        "Šake, usta, nos, lice, ruke, glava, pa noge. Lice, ruke, glava i noge spomenuti su u Kur'anu (5:6).",
      ),
      QURAN_5_6,
      'body.hands',
    ),
    reviewKey: 'quest:salah-wudu-order',
  },
  feetAnkles: {
    ...fact(
      'wudu-feet-ankles',
      // content: quests/salah.json › questions › salah-wudu-feet
      L('In wudu, the feet are washed up to the ankles.', 'Bei der Gebetswaschung werden die Füße bis zu den Knöcheln gewaschen.', 'U abdestu se noge peru do iza članaka.'),
      QURAN_5_6,
      'body.feet',
    ),
    reviewKey: 'quest:salah-wudu-feet',
  },
} satisfies Record<string, GameFact>;

/** Which fact a wrong part / card points to. */
export const FACT_OF: Record<string, string> = {
  face: WUDU_FACTS.farz.id,
  arms: WUDU_FACTS.farz.id,
  head: WUDU_FACTS.farz.id,
  'head-quarter': WUDU_FACTS.farz.id,
  feet: WUDU_FACTS.feetAnkles.id,
  niyyah: WUDU_FACTS.sunnah.id,
  hands: WUDU_FACTS.sunnah.id,
  mouth: WUDU_FACTS.sunnah.id,
  nose: WUDU_FACTS.sunnah.id,
  ears: WUDU_FACTS.sunnah.id,
  three: WUDU_FACTS.sunnah.id,
};

export const WUDU_ART = [...Object.values(PART_ART), 'salah.basics-ibrik', 'salah.basics-niyyah', 'salah.basics-wudu-area', 'ui.water-drop', 'kit.basket', 'kit.jar'];

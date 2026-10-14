import type { GameFact } from '@/core/games';
import type { LocalizedText } from '@/core/models';

/*
 * Content of Wudu Flow – every text below is copied from the Salah content of the Learn feature (keep identical):
 * - src/features/learn/content/quests/salah.json  lesson "salah-wudu" (sections, differenceNote),
 *   questions "salah-wudu-order", "salah-wudu-feet", "salah-wudu-surah"
 * - src/features/learn/content/salah/salah-wudu.json  lesson body "Wudu", question "salah-wudu-2" (categories)
 */

export type WuduStepId = 'hands' | 'mouth' | 'nose' | 'face' | 'arms' | 'head' | 'feet';

/** Step labels of the quest question "salah-wudu-order". */
export const STEP_TEXT: Record<WuduStepId, LocalizedText> = {
  hands: { en: 'Wash the hands', de: 'Hände waschen', bs: 'Oprati šake' },
  mouth: { en: 'Rinse the mouth', de: 'Mund ausspülen', bs: 'Isprati usta' },
  nose: { en: 'Rinse the nose', de: 'Nase ausspülen', bs: 'Isprati nos' },
  face: { en: 'Wash the face', de: 'Gesicht waschen', bs: 'Oprati lice' },
  arms: { en: 'Wash the arms to the elbows', de: 'Arme bis zu den Ellenbogen waschen', bs: 'Oprati ruke do laktova' },
  head: { en: 'Wipe the head', de: 'Kopf bestreichen', bs: 'Potrti glavu' },
  feet: { en: 'Wash the feet to the ankles', de: 'Füße bis zu den Knöcheln waschen', bs: 'Oprati noge do članaka' },
};

/** Basket labels = categories of the unit question "salah-wudu-2". */
export const BASKET_TEXT: Record<'quran' | 'sunnah', LocalizedText> = {
  quran: { en: 'Named in 5:6', de: 'In 5:6 genannt', bs: 'Spomenuto u 5:6' },
  sunnah: { en: 'From the Sunnah', de: 'Aus der Sunna', bs: 'Iz sunneta' },
};

/** differenceNote of the quest lesson "salah-wudu". */
export const WUDU_DIFFERENCE_NOTE: LocalizedText = {
  en: 'The schools of Islamic law agree on the parts named in the Quran, but differ on some details – for example which steps are obligatory and which are sunnah, and what breaks wudu. Learn the details from your parents or a trusted teacher.',
  de: 'Die Rechtsschulen sind sich über die im Koran genannten Teile einig, unterscheiden sich aber in manchen Details – zum Beispiel, welche Schritte Pflicht und welche Sunna sind und was die Waschung ungültig macht. Lerne die Einzelheiten von deinen Eltern oder einer vertrauten Lehrperson.',
  bs: 'Pravne škole se slažu oko dijelova spomenutih u Kur\'anu, ali se razlikuju u nekim detaljima – npr. koji su koraci farz, a koji sunnet, i šta kvari abdest. Detalje nauči od roditelja ili učitelja kojem vjeruješ.',
};

const QURAN_5_6 = [{ sourceName: 'Quran', sourceReference: '5:6' }];

export const WUDU_FACTS = {
  quranParts: {
    id: 'wudu-quran-parts',
    // quests/salah.json › lessons › salah-wudu › sections[0]
    text: {
      en: 'Before Salah we make wudu (ablution). The Quran mentions washing the face, washing the arms up to the elbows, wiping the head and washing the feet up to the ankles.',
      de: 'Vor dem Gebet machen wir Wudu (die Gebetswaschung). Der Koran erwähnt das Waschen des Gesichts, das Waschen der Arme bis zu den Ellenbogen, das Bestreichen des Kopfes und das Waschen der Füße bis zu den Knöcheln.',
      bs: "Prije namaza uzimamo abdest. Kur'an spominje pranje lica, pranje ruku do iza laktova, potiranje glave i pranje nogu do iza članaka.",
    },
    sources: QURAN_5_6,
    art: 'body.face',
    // quests/salah.json › questions › salah-wudu-surah
    check: {
      type: 'choice',
      prompt: { en: 'In which surah does the Quran describe wudu?', de: 'In welcher Sure beschreibt der Koran die Gebetswaschung?', bs: "U kojoj suri Kur'an opisuje abdest?" },
      options: [
        { en: 'Al-Fatiha', de: 'Al-Fatiha', bs: 'El-Fatiha' },
        { en: "Al-Ma'idah", de: "Al-Ma'ida", bs: 'El-Maide' },
        { en: 'Al-Ikhlas', de: 'Al-Ichlas', bs: 'El-Ihlas' },
      ],
      correctIndex: 1,
    },
  },
  beforeSalah: {
    id: 'wudu-before-salah',
    // quests/salah.json › lessons › salah-wudu › summary
    text: {
      en: 'Wudu is the washing we do before Salah so that we are clean and ready.',
      de: 'Wudu ist die Waschung vor dem Gebet, damit wir rein und bereit sind.',
      bs: 'Abdest je pranje prije namaza kako bismo bili čisti i spremni.',
    },
    sources: QURAN_5_6,
    art: 'body.water-on-hands',
  },
  commonOrder: {
    id: 'wudu-common-order',
    // quests/salah.json › questions › salah-wudu-order › explanation
    text: {
      en: 'Hands, mouth, nose, face, arms, head, then feet. The face, arms, head and feet are named in the Quran (5:6).',
      de: 'Hände, Mund, Nase, Gesicht, Arme, Kopf, dann Füße. Gesicht, Arme, Kopf und Füße werden im Koran genannt (5:6).',
      bs: "Šake, usta, nos, lice, ruke, glava, pa noge. Lice, ruke, glava i noge spomenuti su u Kur'anu (5:6).",
    },
    sources: QURAN_5_6,
    art: 'body.hands',
    reviewKey: 'quest:salah-wudu-order',
  },
  quranSunnah: {
    id: 'wudu-quran-sunnah',
    // salah/salah-wudu.json › lesson › "Wudu"
    text: {
      en: 'Before Salah we make wudu. The Quran (5:6) names washing the face, washing the arms to the elbows, wiping the head and washing the feet to the ankles. From the Sunnah we also wash the hands at the start and rinse the mouth and nose.',
      de: 'Vor dem Gebet machen wir Wudu. Der Koran (5:6) nennt das Waschen des Gesichts, das Waschen der Arme bis zu den Ellenbogen, das Bestreichen des Kopfes und das Waschen der Füße bis zu den Knöcheln. Aus der Sunna waschen wir außerdem zu Beginn die Hände und spülen Mund und Nase.',
      bs: "Prije namaza uzimamo abdest. Kur'an (5:6) spominje pranje lica, pranje ruku do iza laktova, potiranje glave i pranje nogu do iza članaka. Iz sunneta također na početku peremo šake i ispiramo usta i nos.",
    },
    sources: QURAN_5_6,
    art: 'body.mouth',
    reviewKey: 'learn:salah-wudu-2',
  },
  schoolsDiffer: {
    id: 'wudu-schools-differ',
    text: WUDU_DIFFERENCE_NOTE,
    sources: QURAN_5_6,
    art: 'body.water-on-hands',
  },
  feetAnkles: {
    id: 'wudu-feet-ankles',
    // quests/salah.json › questions › salah-wudu-feet (prompt, true)
    text: {
      en: 'In wudu, the feet are washed up to the ankles.',
      de: 'Bei der Gebetswaschung werden die Füße bis zu den Knöcheln gewaschen.',
      bs: 'U abdestu se noge peru do iza članaka.',
    },
    sources: QURAN_5_6,
    art: 'body.feet',
    reviewKey: 'quest:salah-wudu-feet',
  },
} satisfies Record<string, GameFact>;

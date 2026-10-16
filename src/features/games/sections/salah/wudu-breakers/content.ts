import type { GameFact } from '@/core/games';

import { BUKHARI, choice, fact, ILMIHAL, L, MUSLIM, Q } from '../shared/content';

/*
 * What breaks wudu and what breaks the prayer – Hanafi, as in the Bosnian ilmihal (chapters "Šta kvari abdest" and
 * "Šta kvari namaz"); other schools are noted where they differ visibly.
 */

/** L1 (catch): things that break wudu (good = catch it) and things that do not. */
export const CATCH_ITEMS: { id: string; good: boolean; art: string }[] = [
  { id: 'toilet', good: true, art: 'salah.basics-wc' },
  { id: 'wind', good: true, art: 'salah.basics-wind' },
  { id: 'sleep', good: true, art: 'salah.basics-sleep' },
  { id: 'blood', good: true, art: 'salah.basics-plaster' },
  { id: 'eat', good: false, art: 'food.bread' },
  { id: 'drink', good: false, art: 'object.cup' },
  { id: 'nails', good: false, art: 'salah.basics-nails' },
  { id: 'comb', good: false, art: 'salah.basics-comb' },
];

/** L2: breaks the prayer or not. */
export const PRAYER_ITEMS: { id: string; bin: 'breaks' | 'fine'; art: string }[] = [
  { id: 'talk', bin: 'breaks', art: 'salah.basics-talk' },
  { id: 'eat', bin: 'breaks', art: 'food.bread' },
  { id: 'laugh', bin: 'breaks', art: 'salah.basics-laugh' },
  { id: 'turn', bin: 'breaks', art: 'salah.basics-turn-away' },
  { id: 'moves', bin: 'breaks', art: 'salah.basics-moves' },
  { id: 'gaze', bin: 'fine', art: 'salah.prayer-qiyam-gaze' },
  { id: 'calm', bin: 'fine', art: 'salah.prayer-qiyam' },
];

/** L3: breaks wudu (and so the prayer) / breaks only the prayer / breaks neither. */
export const MIXED_ITEMS: { id: string; bin: 'wudu' | 'prayer' | 'neither'; art: string }[] = [
  { id: 'sleep', bin: 'wudu', art: 'salah.basics-sleep' },
  { id: 'blood', bin: 'wudu', art: 'salah.basics-plaster' },
  { id: 'laugh', bin: 'wudu', art: 'salah.basics-laugh' },
  { id: 'talk', bin: 'prayer', art: 'salah.basics-talk' },
  { id: 'turn', bin: 'prayer', art: 'salah.basics-turn-away' },
  { id: 'eat', bin: 'prayer', art: 'food.bread' },
  { id: 'nails', bin: 'neither', art: 'salah.basics-nails' },
  { id: 'comb', bin: 'neither', art: 'salah.basics-comb' },
];

export const BREAKER_FACTS = {
  wudu: fact(
    'wudu-breakers',
    L(
      'Wudu is broken by the toilet and by wind, by blood or pus that flows out of the body, by vomiting a mouthful, by deep sleep lying down or leaning, by losing consciousness and by laughing aloud in the prayer. Eating, drinking or cutting the nails do not break it.',
      'Die Gebetswaschung wird ungültig durch die Toilette und durch Winde, durch Blut oder Eiter, das aus dem Körper fließt, durch Erbrechen eines Mundvolls, durch tiefen Schlaf im Liegen oder Anlehnen, durch Bewusstlosigkeit und durch lautes Lachen im Gebet. Essen, Trinken oder Nägelschneiden machen sie nicht ungültig.',
      'Abdest kvare nužda i vjetar, krv ili gnoj koji poteče iz tijela, povraćanje punih usta, dubok san ležeći ili naslonjen, gubitak svijesti i glasan smijeh u namazu. Jelo, piće ili rezanje noktiju ne kvare abdest.',
    ),
    [Q('5:6'), ILMIHAL('Šta kvari abdest')],
    'salah.basics-wc',
    choice(L('Does eating bread break wudu?', 'Macht Brot essen die Gebetswaschung ungültig?', 'Kvari li jedenje hljeba abdest?'), [L('Yes', 'Ja', 'Da'), L('No', 'Nein', 'Ne')], 1),
  ),
  doubt: fact(
    'wudu-certainty',
    L(
      'The Prophet ﷺ said that someone who is unsure whether his wudu broke should not leave the prayer unless he hears a sound or notices a smell. Certainty is not removed by doubt.',
      'Der Prophet ﷺ sagte, wer unsicher ist, ob seine Waschung ungültig wurde, soll das Gebet nicht verlassen, außer er hört ein Geräusch oder bemerkt einen Geruch. Gewissheit wird durch Zweifel nicht aufgehoben.',
      'Poslanik ﷺ je rekao da onaj ko nije siguran je li mu se abdest pokvario ne prekida namaz osim ako čuje zvuk ili osjeti miris. Sigurnost se ne poništava sumnjom.',
    ),
    [BUKHARI('137'), MUSLIM('361')],
    'salah.basics-wind',
  ),
  prayer: fact(
    'salah-breakers',
    L(
      'Talking, eating or drinking, laughing, turning the chest away from the qibla and many movements that are not part of the prayer break the prayer. Then it is prayed again.',
      'Sprechen, Essen oder Trinken, Lachen, das Abwenden der Brust von der Qibla und viele Bewegungen, die nicht zum Gebet gehören, machen das Gebet ungültig. Dann wird es neu gebetet.',
      'Govor, jelo ili piće, smijeh, okretanje prsa od kible i mnogo pokreta koji ne pripadaju namazu kvare namaz. Tada se namaz ponovo klanja.',
    ),
    [MUSLIM('537'), BUKHARI('1200'), ILMIHAL('Šta kvari namaz')],
    'salah.basics-talk',
  ),
  khushu: fact(
    'salah-humility',
    L('The Quran says: successful indeed are the believers who are humble in their prayers.', 'Der Koran sagt: Erfolgreich sind wahrlich die Gläubigen, die in ihrem Gebet demütig sind.', 'Kur‘an kaže: Uspjeli su vjernici koji su u namazima svojim ponizni.'),
    [Q('23:1-2')],
    'salah.prayer-qiyam-gaze',
  ),
  schools: fact(
    'breakers-hanafi',
    L(
      'In the Hanafi school flowing blood and vomiting a mouthful break wudu, and laughing aloud in the prayer breaks both the prayer and the wudu. Scholars of other schools differ on these points.',
      'In der hanafitischen Schule machen fließendes Blut und Erbrechen eines Mundvolls die Waschung ungültig, und lautes Lachen im Gebet macht Gebet und Waschung ungültig. Gelehrte anderer Rechtsschulen sind sich in diesen Punkten uneinig.',
      'U hanefijskom mezhebu krv koja poteče i povraćanje punih usta kvare abdest, a glasan smijeh u namazu kvari i namaz i abdest. Učenjaci drugih mezheba se u tome razilaze.',
    ),
    [ILMIHAL('Šta kvari abdest')],
    'salah.basics-laugh',
  ),
  accept: fact(
    'wudu-before-prayer-accepted',
    L(
      'The Prophet ﷺ said: Allah does not accept the prayer of one whose wudu has broken until he makes wudu again.',
      'Der Prophet ﷺ sagte: Allah nimmt das Gebet dessen nicht an, dessen Waschung ungültig wurde, bis er die Waschung erneuert.',
      'Poslanik ﷺ je rekao: Allah ne prima namaz onoga kome se pokvario abdest dok ponovo ne uzme abdest.',
    ),
    [BUKHARI('135'), MUSLIM('225')],
    'salah.basics-ibrik',
  ),
} satisfies Record<string, GameFact>;

export const FACT_OF: Record<string, string> = {
  toilet: BREAKER_FACTS.wudu.id,
  wind: BREAKER_FACTS.wudu.id,
  sleep: BREAKER_FACTS.wudu.id,
  blood: BREAKER_FACTS.schools.id,
  eat: BREAKER_FACTS.prayer.id,
  drink: BREAKER_FACTS.wudu.id,
  nails: BREAKER_FACTS.wudu.id,
  comb: BREAKER_FACTS.wudu.id,
  talk: BREAKER_FACTS.prayer.id,
  laugh: BREAKER_FACTS.schools.id,
  turn: BREAKER_FACTS.prayer.id,
  moves: BREAKER_FACTS.prayer.id,
  gaze: BREAKER_FACTS.khushu.id,
  calm: BREAKER_FACTS.khushu.id,
};

export const BREAKERS_ART = [...new Set([...CATCH_ITEMS, ...PRAYER_ITEMS, ...MIXED_ITEMS].map((i) => i.art)), 'salah.basics-ibrik', 'kit.basket', 'sky.morning'];

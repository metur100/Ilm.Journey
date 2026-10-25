import type { Episode } from '../../prophets-story/episode';
import { T } from '../shared/kit';

/*
 * Musa – three events of his life, each with its lesson:
 *  L1 The baby in the chest on the river, returned to his mother (28:7–13): put it in order (SequenceBoard list).
 *  L2 The sea parted – "My Lord is with me" (26:52–67): the stones of the path (SequenceBoard path).
 *  L3 Twelve springs from the rock, every tribe its own (2:60, 7:160): lead each camp to its spring (ConnectPairs).
 */

/** L1 – the baby on the river. */
export const RIVER_EPISODE: Episode = {
  kind: 'sequence',
  prompt: T(
    'Musa’s mother was afraid for her baby. Put what happened in order.',
    'Musas Mutter hatte Angst um ihr Baby. Bring das Geschehen in die richtige Reihenfolge.',
    'Musaova majka se bojala za svoje dijete. Poredaj šta se dogodilo.',
  ),
  hints: true,
  items: [
    { id: 'inspired', art: 'prophet.musa-chest', label: T('Allah inspires her: put him in a chest on the river', 'Allah gibt ihr ein: Leg ihn in eine Kiste auf den Fluss', 'Allah je nadahnjuje: stavi ga u sanduk na rijeku'), sub: '28:7' },
    { id: 'carried', art: 'place.nile', label: T('The river carries the chest to Fir’awn’s household', 'Der Fluss trägt die Kiste zum Haus des Pharao', 'Rijeka nosi sanduk do faraonove porodice'), sub: '28:8' },
    { id: 'nurses', art: 'food.milk', label: T('The baby refuses every nurse', 'Das Baby trinkt bei keiner Amme', 'Dijete ne prihvata nijednu dojilju'), sub: '28:12' },
    { id: 'returned', art: 'place.house', label: T('Allah returns him to his mother', 'Allah gibt ihn seiner Mutter zurück', 'Allah ga vraća majci'), sub: '28:13' },
  ],
  factMap: { inspired: 'lesson-musa-promise', carried: 'musa-on-the-river', nurses: 'musa-on-the-river', returned: 'lesson-musa-promise' },
};

/** L2 – the way through the sea. */
export const SEA_EPISODE: Episode = {
  kind: 'sequence',
  variant: 'path',
  endArt: 'prophet.musa-sea-path',
  prompt: T(
    'Fir’awn’s army followed the believers to the sea. Lay the path stone by stone.',
    'Das Heer des Pharao verfolgte die Gläubigen bis zum Meer. Lege den Weg Stein für Stein.',
    'Faraonova vojska slijedila je vjernike do mora. Složi put kamen po kamen.',
  ),
  hints: false,
  items: [
    { id: 'night', art: 'sky.night', label: T('They leave at night', 'Aufbruch bei Nacht', 'Polaze noću'), sub: '26:52' },
    { id: 'caught', art: 'story.sea', label: T('"We will be caught!"', '„Wir werden eingeholt!“', '„Stići će nas!“'), sub: '26:61' },
    { id: 'with-me', art: 'object.lantern', label: T('"My Lord is with me"', '„Mein Herr ist mit mir“', '„Sa mnom je moj Gospodar“'), sub: '26:62' },
    { id: 'staff', art: 'prophet.musa-staff', label: T('The staff strikes – the sea parts', 'Der Stab schlägt – das Meer teilt sich', 'Štap udara – more se razdvaja'), sub: '26:63' },
    { id: 'saved', art: 'story.shore', label: T('All with Musa are saved', 'Alle mit Musa werden gerettet', 'Svi s Musaom su spašeni'), sub: '26:65' },
  ],
  factMap: { night: 'my-lord-is-with-me', caught: 'lesson-musa-hope', 'with-me': 'lesson-musa-hope', staff: 'my-lord-is-with-me', saved: 'my-lord-is-with-me' },
};

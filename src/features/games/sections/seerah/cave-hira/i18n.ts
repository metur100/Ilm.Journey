import { defineNamespace } from '@/core/i18n';

/** Namespace `game.cave-hira`. The Arabic words come from the generated Quran data only. */
const en = {
  title: 'Cave Hira',
  description: 'The first revelation in the Cave of Hiraʾ: build the first ayahs of Surah al-ʿAlaq word by word.',
  howTo: 'Tap or drag the Arabic words into their places, from right to left. The meaning appears at the end.',
  'play.l1': 'Build the first ayah that was revealed: al-ʿAlaq 96:1. Start on the right with “Iqraʾ”.',
  'play.l2': 'Build al-ʿAlaq 96:3–4 – the ayahs about the pen, from right to left.',
  'play.l3': 'Build al-ʿAlaq 96:5 from memory – some words do not belong here.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Die Höhle Hira',
  description: 'Die erste Offenbarung in der Höhle Hira: Setze die ersten Verse der Sure al-ʿAlaq Wort für Wort zusammen.',
  howTo: 'Tippe oder zieh die arabischen Wörter an ihren Platz, von rechts nach links. Am Ende erscheint die Bedeutung.',
  'play.l1': 'Setze den ersten offenbarten Vers zusammen: al-ʿAlaq 96:1. Beginne rechts mit „Iqraʾ“.',
  'play.l2': 'Setze al-ʿAlaq 96:3–4 zusammen – die Verse über das Schreibrohr, von rechts nach links.',
  'play.l3': 'Setze al-ʿAlaq 96:5 aus dem Gedächtnis zusammen – einige Wörter gehören nicht dazu.',
};

const bs: Record<Key, string> = {
  title: 'Pećina Hira',
  description: 'Prva objava u pećini Hira: složi prve ajete sure el-Alek riječ po riječ.',
  howTo: 'Dodirni ili prevuci arapske riječi na njihovo mjesto, s desna na lijevo. Na kraju se pojavi značenje.',
  'play.l1': 'Složi prvi objavljeni ajet: el-Alek 96:1. Počni zdesna s „Ikre’“.',
  'play.l2': 'Složi el-Alek 96:3–4 – ajete o peru, s desna na lijevo.',
  'play.l3': 'Složi el-Alek 96:5 napamet – neke riječi ne pripadaju ovdje.',
};

export const hiraI18n = defineNamespace('game.cave-hira', { en, de, bs });

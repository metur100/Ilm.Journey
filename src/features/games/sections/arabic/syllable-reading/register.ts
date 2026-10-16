import { registerGame } from '@/core/games';
import { defineNamespace, localizedFrom } from '@/core/i18n';

import { arabicGame } from '../shared/define';
import { FACTS, MARK_FACTS } from '../shared/facts';
import { HARAKA_NAMES, type Haraka, longReading, longSyllable, syllable, syllableReading } from '../shared/letters';
import { getWord } from '../shared/words';
import type { ReadingChip, SyllableReadingConfig } from './SyllableReadingGame';

/*
 * Reading Line by Line (custom tap board): a sufara page. L1 read along lines of letters with fatha, kasra, damma
 * (karaoke, the next one glows) · L2 long syllables and short words of the lesson, without the glow · L3 hear one and
 * find it on the page.
 */

export const syllableReadingI18n = defineNamespace('game.syllable-reading', {
  en: {
    title: 'Reading Line by Line',
    description: 'Read a sufara page: syllables first, then short words – hear each one as you tap it.',
    howTo: 'Tap the syllables in reading order: from the right, line by line. Each one is read aloud.',
    'play.along': 'Read along: tap each one from the right, line by line.',
    'play.find': 'Listen and find it on the page.',
    'play.listenFind': 'Which one do you hear?',
    'play.listen': 'Listen again',
    'play.wrongAlong': 'Arabic is read from the right – find the next one.',
    'play.wrongFind': 'That one says "{reading}" – listen again.',
  },
  de: {
    title: 'Zeile für Zeile lesen',
    description: 'Lies eine Sufara-Seite: erst Silben, dann kurze Wörter – hör jedes, wenn du es antippst.',
    howTo: 'Tippe die Silben in Lesereihenfolge an: von rechts, Zeile für Zeile. Jede wird vorgelesen.',
    'play.along': 'Lies mit: Tippe jede von rechts an, Zeile für Zeile.',
    'play.find': 'Hör zu und finde sie auf der Seite.',
    'play.listenFind': 'Welche hörst du?',
    'play.listen': 'Noch einmal hören',
    'play.wrongAlong': 'Arabisch liest man von rechts – finde die nächste.',
    'play.wrongFind': 'Das heißt „{reading}“ – hör noch einmal hin.',
  },
  bs: {
    title: 'Čitanje red po red',
    description: 'Čitaj stranicu sufare: prvo slogove, pa kratke riječi – poslušaj svaku kad je dodirneš.',
    howTo: 'Dodiruj slogove redom čitanja: zdesna, red po red. Svaki se pročita naglas.',
    'play.along': 'Čitaj uz glas: dodirni svaki zdesna, red po red.',
    'play.find': 'Poslušaj i pronađi na stranici.',
    'play.listenFind': 'Koji čuješ?',
    'play.listen': 'Poslušaj ponovo',
    'play.wrongAlong': 'Arapski se čita zdesna – pronađi sljedeći.',
    'play.wrongFind': 'To se čita „{reading}“ – poslušaj ponovo.',
  },
});

const short = (letter: string, h: Haraka, id: string): ReadingChip => ({ id, arabic: syllable(letter, h), reading: localizedFrom((l) => syllableReading(letter, h, l)) });
const long = (letter: string, h: Haraka, id: string): ReadingChip => {
  const r = longReading(letter, h);
  return { id, arabic: longSyllable(letter, h), reading: { en: r, de: r, bs: r } };
};
const word = (id: string): ReadingChip => {
  const w = getWord(id);
  return { id: `w-${id}`, arabic: w.arabic, reading: localizedFrom((l) => `${w.translit} – ${w.meaning[l]}`) };
};
const line = (letter: string, key: string) => HARAKA_NAMES.map((h) => short(letter, h, `${key}-${h}`));

export const syllableReadingGame = arabicGame<SyllableReadingConfig>({
  id: 'syllable-reading',
  i18n: syllableReadingI18n,
  coverArt: 'arabic.sufara-book',
  hintArt: 'arabic.sufara-book',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  load: () => (require('./SyllableReadingGame') as typeof import('./SyllableReadingGame')).SyllableReadingGame,
  levels: [
    { config: { lines: [line('ب', 'b'), line('ت', 't'), line('ن', 'n'), line('م', 'm')], mode: 'along', hints: true }, facts: [FACTS.harakat] },
    {
      config: {
        lines: [HARAKA_NAMES.map((h) => long('ب', h, `bl-${h}`)), HARAKA_NAMES.map((h) => long('ك', h, `kl-${h}`)), ['nur', 'nar', 'bab'].map(word), ['ilm', 'sabr', 'qalam'].map(word)],
        mode: 'along',
        hints: false,
      },
      facts: [FACTS.madd, MARK_FACTS.sukun],
    },
    { config: { lines: [['kitab', 'salam', 'nur'].map(word), ['qamar', 'shams', 'jamal'].map(word)], mode: 'find', hints: false }, facts: [FACTS.joining] },
  ],
  teaches: { questionKeys: ['quest:arabic-fatha', 'quest:arabic-rtl'] },
  order: 120,
});

export function registerSyllableReadingGame(): void {
  registerGame(syllableReadingGame);
}

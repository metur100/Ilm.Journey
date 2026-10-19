import { registerGame, type GameFact } from '@/core/games';
import { defineNamespace } from '@/core/i18n';
import { LANGUAGE_SOURCES } from '@/core/models';

import { arabicGame, type LevelSpec } from '../shared/define';
import type { SequenceConfig } from '../shared/engineGames';
import { PRAYER_TIMES, T, timeItem, vocabFact, type Word } from './data';
import { loadSequenceGame } from './engines';

/*
 * Prayer Times (SequenceBoard, list variant): put the five prayer times in order. L1 Fajr, Zuhr, Asr with hints ·
 * L2 up to Maghrib · L3 all five. Each item shows the Arabic name with transliteration and its meaning.
 */

const COVER = 'garden.masjid-small';

export const timesI18n = defineNamespace('game.arabic-times', {
  en: {
    title: 'Prayer Times',
    description: 'Learn the Arabic names of the five prayer times and put them in order.',
    howTo: 'Put the prayer times in order, from dawn to night.',
    'play.order': 'Put the prayer times in the right order.',
  },
  de: {
    title: 'Arabische Gebetszeiten',
    description: 'Lerne die arabischen Namen der fünf Gebetszeiten und bring sie in die richtige Reihenfolge.',
    howTo: 'Bringe die Gebetszeiten von der Morgendämmerung bis zur Nacht in die richtige Reihenfolge.',
    'play.order': 'Bring die Gebetszeiten in die richtige Reihenfolge.',
  },
  bs: {
    title: 'Arapska vremena namaza',
    description: 'Nauči arapske nazive pet vremena namaza i poredaj ih redom.',
    howTo: 'Poredaj vremena namaza od zore do noći.',
    'play.order': 'Poredaj vremena namaza u ispravan redoslijed.',
  },
});

/** Kept as a vocabulary fact: it only lists the five names in their order. */
const orderFact: GameFact = {
  id: 'five-prayer-times',
  kind: 'language',
  text: T(
    'The five prayer times in order are Fajr, Zuhr, Asr, Maghrib and Isha.',
    'Die fünf Gebetszeiten sind in dieser Reihenfolge Fajr, Zuhr, Asr, Maghrib und Isha.',
    'Pet vremena namaza po redu su fajr, zuhr, asr, magrib i iša.',
  ),
  sources: [LANGUAGE_SOURCES.vocabulary],
  art: COVER,
};

const level = (words: readonly Word[], facts: readonly Word[], hints: boolean, extra: GameFact[] = []): LevelSpec<SequenceConfig> => ({
  config: { items: words.map(timeItem), variant: 'list', hints, prompt: 'play.order' },
  facts: [...facts.map((word) => vocabFact(word, COVER)), ...extra],
});

export const arabicTimesGame = arabicGame<SequenceConfig>({
  id: 'arabic-times',
  i18n: timesI18n,
  coverArt: COVER,
  hintArt: 'kit.timeline',
  load: loadSequenceGame,
  levels: [
    level(PRAYER_TIMES.slice(0, 3), PRAYER_TIMES.slice(0, 2), true),
    level(PRAYER_TIMES.slice(0, 4), PRAYER_TIMES.slice(2, 4), false),
    level(PRAYER_TIMES, PRAYER_TIMES.slice(4), false, [orderFact]),
  ],
  order: 156,
});

export function registerArabicTimesGame(): void {
  registerGame(arabicTimesGame);
}

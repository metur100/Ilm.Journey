import { registerGame, type GameFact } from '@/core/games';
import { defineNamespace } from '@/core/i18n';
import { LANGUAGE_SOURCES } from '@/core/models';

import { arabicGame, type LevelSpec } from '../shared/define';
import type { SequenceConfig } from '../shared/engineGames';
import { PRAYER_TIMES, T, TIME_SPANS, timeItem, vocabFact, WEEK_DAYS, type Word } from './data';
import { loadSequenceGame } from './engines';

/*
 * Times in Arabic (SequenceBoard, list variant): Arabic words of time put in order – each level has its own words.
 * L1 the five prayer times with hints · L2 the days of the week · L3 hour, day, week, month and year (short to long).
 * Each item shows the Arabic word with transliteration and its meaning.
 */

const COVER = 'garden.masjid-small';

export const timesI18n = defineNamespace('game.arabic-times', {
  en: {
    title: 'Times in Arabic',
    description: 'Learn Arabic words of time – the five prayer times, the days of the week and hour to year – and put them in order.',
    howTo: 'Put the words in order: the prayer times from dawn to night, the days from al-Ahad, and time from short to long.',
    'play.order': 'Put the prayer times in the right order.',
    'play.days': 'Put the days of the week in order, starting with al-Ahad (Sunday).',
    'play.spans': 'Put them in order, from the shortest time to the longest.',
  },
  de: {
    title: 'Zeiten auf Arabisch',
    description: 'Lerne arabische Zeitwörter – die fünf Gebetszeiten, die Wochentage und Stunde bis Jahr – und bring sie in die richtige Reihenfolge.',
    howTo: 'Bring die Wörter in die richtige Reihenfolge: die Gebetszeiten von der Morgendämmerung bis zur Nacht, die Tage ab al-Ahad und die Zeit von kurz bis lang.',
    'play.order': 'Bring die Gebetszeiten in die richtige Reihenfolge.',
    'play.days': 'Bring die Wochentage in die richtige Reihenfolge, beginnend mit al-Ahad (Sonntag).',
    'play.spans': 'Ordne sie von der kürzesten bis zur längsten Zeit.',
  },
  bs: {
    title: 'Vrijeme na arapskom',
    description: 'Nauči arapske riječi o vremenu – pet vremena namaza, dane u sedmici i od sata do godine – i poredaj ih.',
    howTo: 'Poredaj riječi: vremena namaza od zore do noći, dane od al-ahada i vrijeme od kraćeg do dužeg.',
    'play.order': 'Poredaj vremena namaza u ispravan redoslijed.',
    'play.days': 'Poredaj dane u sedmici, počevši od al-ahada (nedjelje).',
    'play.spans': 'Poredaj ih od najkraćeg do najdužeg vremena.',
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

const level = (words: readonly Word[], facts: readonly Word[], hints: boolean, prompt: string, extra: GameFact[] = []): LevelSpec<SequenceConfig> => ({
  config: { items: words.map(timeItem), variant: 'list', hints, prompt },
  facts: [...facts.map((word) => vocabFact(word, COVER)), ...extra],
});

export const arabicTimesGame = arabicGame<SequenceConfig>({
  id: 'arabic-times',
  i18n: timesI18n,
  coverArt: COVER,
  hintArt: 'kit.timeline',
  load: loadSequenceGame,
  levels: [
    level(PRAYER_TIMES, [PRAYER_TIMES[0], PRAYER_TIMES[3]], true, 'play.order', [orderFact]),
    level(WEEK_DAYS, [WEEK_DAYS[0], WEEK_DAYS[5]], false, 'play.days'),
    level(TIME_SPANS, [TIME_SPANS[2], TIME_SPANS[4]], false, 'play.spans'),
  ],
  order: 156,
});

export function registerArabicTimesGame(): void {
  registerGame(arabicTimesGame);
}

import type { LocalizedText } from '@/core/models';
import { ayahWords, getDua, getSurah } from '@/features/quran';

import { type Move, type PrayerStep, type Recite, SURAH_BY_RAKAT } from './data/prayers';
import { RABBENA, RECITATIONS, type RecitationId } from './data/recitations';

/*
 * What is said in each step, for the recite card: the Arabic, a transliteration and the meaning. The Quran parts
 * (Al-Fatiha, the surahs, Rabbena = 2:201) come from the generated Quran data; the other formulas of the prayer
 * (Subhaneke, the tasbihs, Ettehijjatu, Salavat, the kunut dua, the selam) from data/recitations.ts.
 */

export type CaptionKey = Recite | 'euzu' | 'moveTakbir' | 'tahmid';

export interface CaptionLine {
  key: CaptionKey;
  name: string;
  arabic?: string;
  /** `quran` = verified Quran text (Quran font). */
  script?: 'quran' | 'arabic';
  translit?: string;
  meaning?: string;
  /** How many times it is said. */
  times?: number;
  /** Quran / hadith reference, e.g. "1:1-7" or "Muslim 772". */
  ref?: string;
}

type T = (key: string, params?: Record<string, string | number>) => string;
type L = (text: LocalizedText | undefined) => string;

const fromData = (key: CaptionKey, id: RecitationId, name: string, l: L): CaptionLine => {
  const r = RECITATIONS[id];
  return { key, name, arabic: r.arabic, script: 'arabic', translit: l(r.translit), meaning: l(r.meaning), times: r.times, ref: r.ref };
};

/** A whole (short) surah from the Quran data: the ayahs joined with the end-of-ayah sign. */
function surahLine(key: CaptionKey, n: number, name: string, l: L): CaptionLine {
  const s = getSurah(n);
  if (!s) return { key, name };
  return {
    key,
    name,
    arabic: s.ayahs.map((a) => a.arabic).join(' ۝ '),
    script: 'quran',
    translit: s.ayahs.map((a) => a.transliteration).join(' · '),
    meaning: s.ayahs.map((a) => l(a.translation)).join(' '),
    ref: `${n}:1-${s.ayahs.length}`,
  };
}

export function captionLine(key: CaptionKey, step: Pick<PrayerStep, 'rakat'>, t: T, l: L): CaptionLine {
  switch (key) {
    case 'takbir':
    case 'moveTakbir':
      return fromData(key, 'moveTakbir', t(key === 'takbir' ? 'say.takbir' : 'say.moveTakbir'), l);
    case 'subhaneke':
      return fromData(key, 'subhaneke', t('say.subhaneke'), l);
    case 'euzu':
      return fromData(key, 'euzu', t('say.euzu'), l);
    case 'fatiha':
      return surahLine(key, 1, t('say.fatiha'), l);
    case 'surah': {
      const n = SURAH_BY_RAKAT[(step.rakat - 1) % SURAH_BY_RAKAT.length];
      return surahLine(key, n, t('say.surah', { name: getSurah(n)?.nameTransliterated ?? '' }), l);
    }
    case 'ruku':
      return fromData(key, 'ruku', t('say.ruku'), l);
    case 'itidal':
      return fromData(key, 'itidal', t('say.itidal'), l);
    case 'tahmid':
      return fromData(key, 'tahmid', t('say.tahmid'), l);
    case 'sajda':
      return fromData(key, 'sajda', t('say.sajda'), l);
    case 'jalsa':
      return fromData(key, 'jalsa', t('say.jalsa'), l);
    case 'tashahhud':
      return fromData(key, 'tashahhud', t('say.tashahhud'), l);
    case 'salavat':
      return fromData(key, 'salavat', t('say.salavat'), l);
    case 'kunut':
      return fromData(key, 'kunut', t('say.kunut'), l);
    case 'selam':
      return fromData(key, 'selam', t('say.selam'), l);
    case 'rabbena': {
      const d = getDua('good-in-both-worlds');
      const name = t('say.rabbena', { title: d ? l(d.title) : '' });
      if (!d) return { key, name };
      // the dua itself starts at "Rabbana" (the ayah begins with "and among them is he who says")
      const words = ayahWords(d.ayahs[0].arabic);
      const bare = (w: string) => w.replace(/[ً-ٰٟۖ-ۭ]/g, '');
      const start = Math.max(0, words.findIndex((w) => bare(w).startsWith('ربن')));
      return { key, name, arabic: words.slice(start).join(' '), script: 'quran', translit: l(RABBENA.translit), meaning: l(RABBENA.meaning), ref: d.ref };
    }
    case 'niyyah':
    case 'dua':
      return { key, name: t(`say.${key}`) };
  }
}

/** Movements that are made with "Allahu ekber" (rising from ruku' is made with "Semi'allahu limen hamideh"). */
const WITH_TAKBIR = new Set<Move>(['bow', 'prostrate', 'sit-up', 'stand-up', 'sit']);

export function stepCaption(step: PrayerStep, t: T, l: L): CaptionLine[] {
  const keys: CaptionKey[] = [];
  for (const r of step.recite) {
    keys.push(r);
    if (r === 'subhaneke') keys.push('euzu');
    if (r === 'itidal') keys.push('tahmid');
  }
  // said while moving into the position: listed last, so the recitation of the position comes first
  if (WITH_TAKBIR.has(step.move)) keys.push('moveTakbir');
  return keys.map((k) => captionLine(k, step, t, l));
}

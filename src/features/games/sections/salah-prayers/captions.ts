import type { LocalizedText } from '@/core/models';
import { getAyah, getDua, getSurah } from '@/features/quran';

import { POSITION_TEXT, SELAM_WORDS, TAKBIR_WORDS } from './data/facts';
import { type PrayerStep, type Recite, SURAH_BY_RAKAT } from './data/prayers';

/*
 * What is said in each step, for the inline captions. Arabic comes only from the generated Quran data (Fatiha, the
 * surahs) or from existing content (the takbir); recitations that are not in the app's content (Subhaneke,
 * Ettehijjatu, Salavat, the kunut dua) are shown by name only – their texts are never typed here.
 */

export interface CaptionLine {
  key: Recite;
  name: string;
  arabic?: string;
  /** `quran` = verified Quran text (Quran font). */
  script?: 'quran' | 'arabic';
  translit?: string;
  meaning?: string;
  /** Quran reference, e.g. "1:2". */
  ref?: string;
}

type T = (key: string, params?: Record<string, string | number>) => string;
type L = (text: LocalizedText | undefined) => string;

export function captionLine(key: Recite, step: Pick<PrayerStep, 'rakat'>, t: T, l: L): CaptionLine {
  switch (key) {
    case 'takbir':
      return { key, name: t('say.takbir'), arabic: TAKBIR_WORDS.arabic, script: 'arabic', translit: TAKBIR_WORDS.transliteration, meaning: l(POSITION_TEXT.takbir) };
    case 'fatiha': {
      const a = getAyah(1, 2);
      return { key, name: t('say.fatiha'), arabic: a?.arabic, script: 'quran', translit: a?.transliteration, meaning: a ? l(a.translation) : undefined, ref: '1:2' };
    }
    case 'surah': {
      const n = SURAH_BY_RAKAT[(step.rakat - 1) % SURAH_BY_RAKAT.length];
      const s = getSurah(n);
      const a = s?.ayahs[0];
      return { key, name: t('say.surah', { name: s?.nameTransliterated ?? '' }), arabic: a?.arabic, script: 'quran', translit: a?.transliteration, meaning: a ? l(a.translation) : undefined, ref: `${n}:1` };
    }
    case 'rabbena': {
      const d = getDua('good-in-both-worlds');
      return { key, name: t('say.rabbena', { title: d ? l(d.title) : '' }), ref: d?.ref };
    }
    case 'ruku':
      return { key, name: t('pos.ruku'), meaning: l(POSITION_TEXT.ruku) };
    case 'sajda':
      return { key, name: t('pos.sajda'), meaning: l(POSITION_TEXT.sajda) };
    case 'selam':
      return { key, name: l(SELAM_WORDS), meaning: l(POSITION_TEXT.selam) };
    case 'niyyah':
    case 'subhaneke':
    case 'itidal':
    case 'jalsa':
    case 'tashahhud':
    case 'salavat':
    case 'dua':
    case 'kunut':
      return { key, name: t(`say.${key}`) };
  }
}

export function stepCaption(step: PrayerStep, t: T, l: L): CaptionLine[] {
  return step.recite.map((r) => captionLine(r, step, t, l));
}

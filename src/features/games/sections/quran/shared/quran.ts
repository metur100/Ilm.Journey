import type { KitItem } from '@/core/games/kit';
import type { Language, LocalizedText } from '@/core/models';
import { type Ayah, getSurah, listSurahs, type Surah } from '@/features/quran';

/*
 * Access to the generated Quran data for the Quran section's games. The Arabic text and the translations are only
 * ever read from `@/features/quran` (Tanzil Uthmani text, Saheeh International, Bubenheim & Elyas, Besim Korkut) –
 * nothing here is typed by hand. Ayahs are split into word tiles at spaces only, so the tiles joined with a single
 * space always give back the exact text.
 */

export const LANGS: readonly Language[] = ['en', 'de', 'bs'];

/** The surah from the data (throws during registration when a number is missing – caught by the tests). */
export function surah(n: number): Surah {
  const s = getSurah(n);
  if (!s) throw new Error(`Surah ${n} is missing from the Quran data`);
  return s;
}

export function ayah(s: number, a: number): Ayah {
  const found = surah(s).ayahs.find((x) => x.numberInSurah === a);
  if (!found) throw new Error(`Ayah ${s}:${a} is missing from the Quran data`);
  return found;
}

/** Ayahs `from`..`to` (inclusive) of a surah. */
export function ayahRange(s: number, from: number, to = from): Ayah[] {
  return surah(s).ayahs.filter((x) => x.numberInSurah >= from && x.numberInSurah <= to);
}

/** "103:1–3" or "103:2". */
export function ayahRef(s: number, from: number, to = from): string {
  return from === to ? `${s}:${from}` : `${s}:${from}–${to}`;
}

/** The surah name as written in the data (e.g. "Al-Ikhlaas"). */
export const surahName = (n: number): string => surah(n).nameTransliterated;

/** Meaning of the surah name (German falls back to English in the data). */
export function surahMeaning(n: number): LocalizedText {
  const s = surah(n);
  return { en: s.nameMeaningLocalized?.en || s.nameMeaning, de: s.nameMeaningLocalized?.de || s.nameMeaning, bs: s.nameMeaningLocalized?.bs || s.nameMeaning };
}

/** Translation of one ayah in every language. */
export function ayahMeaning(s: number, a: number): LocalizedText {
  const t = ayah(s, a).translation;
  return { en: t.en, de: t.de, bs: t.bs };
}

/** Translations of several ayahs joined with a space. */
export function rangeMeaning(s: number, from: number, to = from): LocalizedText {
  const list = ayahRange(s, from, to);
  const join = (lang: Language) => list.map((x) => x.translation[lang].trim()).join(' ');
  return { en: join('en'), de: join('de'), bs: join('bs') };
}

/** An Arabic letter (same test as `ayahWords` in the Quran data). */
const ARABIC_LETTER = /[ء-يٱ-ۓ]/;

/**
 * Splits an ayah into word tiles at single spaces – nothing else. Tokens without an Arabic letter (waqf marks, the
 * sajda or hizb sign that stand alone in the data) stay attached to their word together with the space: to the word
 * before, or to the next word when the mark opens the ayah. Invariant: `ayahTiles(text).join(' ') === text`.
 */
export function ayahTiles(text: string): string[] {
  const tiles: string[] = [];
  let leading: string | null = null;
  for (const token of text.split(' ')) {
    if (ARABIC_LETTER.test(token)) {
      tiles.push(leading === null ? token : `${leading} ${token}`);
      leading = null;
    } else if (tiles.length > 0) {
      tiles[tiles.length - 1] += ` ${token}`;
    } else {
      leading = leading === null ? token : `${leading} ${token}`;
    }
  }
  if (leading !== null) tiles.push(leading);
  return tiles;
}

/** Word tiles of an ayah as kit items (reading order, Quran font); ids `<prefix>-<index>`. */
export function wordItems(s: number, a: number, prefix = `w${s}-${a}`): KitItem[] {
  return ayahTiles(ayah(s, a).arabic).map((w, i) => ({ id: `${prefix}-${i}`, arabic: w, quran: true }));
}

/** The surahs of Juz ʿAmma in mushaf order (78–114). */
export function juzAmma(): Surah[] {
  return listSurahs().filter((s) => s.juz === 30);
}

/** Verified Quran text of one ayah (for `quran: true` faces). */
export const ayahArabic = (s: number, a: number): string => ayah(s, a).arabic;

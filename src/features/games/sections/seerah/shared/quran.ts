import type { GameFact } from '@/core/games';
import type { LocalizedText } from '@/core/models';
import { ayahWords, getAyah, getSurah } from '@/features/quran';

/* Quran text only from the generated data (src/features/quran/data) – never typed by hand. */

export function ayahMeaning(surah: number, ayah: number): LocalizedText {
  const a = getAyah(surah, ayah);
  if (!a) throw new Error(`Missing ayah ${surah}:${ayah}`);
  return a.translation;
}

export function ayahArabicWords(surah: number, ayah: number): string[] {
  const a = getAyah(surah, ayah);
  if (!a) throw new Error(`Missing ayah ${surah}:${ayah}`);
  return ayahWords(a.arabic);
}

/** A fact whose text is the meaning of one or more ayahs (generated translation), source Quran surah:ayah. */
export function ayahFact(id: string, surah: number, from: number, to = from, art?: string): GameFact {
  const s = getSurah(surah);
  if (!s) throw new Error(`Missing surah ${surah}`);
  const parts = Array.from({ length: to - from + 1 }, (_, i) => ayahMeaning(surah, from + i));
  const join = (lang: 'en' | 'de' | 'bs') => parts.map((p) => p[lang].trim()).join(' ');
  return {
    id,
    text: { en: join('en'), de: join('de'), bs: join('bs') },
    sources: [{ sourceName: 'Quran', sourceReference: `${s.nameTransliterated} ${surah}:${from}${to > from ? `–${to}` : ''}` }],
    art,
  };
}

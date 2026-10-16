import type { FactCheck, GameFact } from '@/core/games';
import { type Namespace, type Params, translate, translateNs } from '@/core/i18n';
import type { Language, LocalizedText, SourceRef } from '@/core/models';
import { QURAN_SOURCE } from '@/features/quran';

import { ayahRef, LANGS, rangeMeaning, surah, surahMeaning, surahName } from './quran';

/*
 * "You learned" facts of the Quran games. Two kinds, both without new claims:
 * - quotes: the translation of the ayahs straight from the generated data, introduced by the surah name and the
 *   reference ("Al-Asr 103:1–3: “By time, …”");
 * - copied facts: text + sources copied from the Quran learn units / quest lessons (tests compare them).
 */

/** Source entries every quote cites: the ayahs, the Arabic text and the translations. */
export function quoteSources(s: number, from: number, to = from): SourceRef[] {
  return [
    { sourceName: 'Quran', sourceReference: ayahRef(s, from, to) },
    { sourceName: QURAN_SOURCE.text, sourceReference: '' },
    { sourceName: 'Translations', sourceReference: `${QURAN_SOURCE.translations.en}; ${QURAN_SOURCE.translations.de}; ${QURAN_SOURCE.translations.bs}` },
  ];
}

/** “Al-Asr 103:1–3: “…”” – the translated ayahs of the data. */
export function quoteText(s: number, from: number, to = from): LocalizedText {
  const meaning = rangeMeaning(s, from, to);
  const build = (lang: Language) => `${surahName(s)} ${ayahRef(s, from, to)}: “${meaning[lang]}”`;
  return { en: build('en'), de: build('de'), bs: build('bs') };
}

export interface QuoteFactSpec {
  id: string;
  surah: number;
  from: number;
  to?: number;
  art?: string;
  check?: FactCheck;
  reviewKey?: string;
}

export function quoteFact({ id, surah: s, from, to, art, check, reviewKey }: QuoteFactSpec): GameFact {
  return { id, text: quoteText(s, from, to ?? from), sources: quoteSources(s, from, to ?? from), art, check, reviewKey };
}

/** A namespace text in every language (for content that is written in the game's i18n namespace). */
export function nsText<K extends string>(ns: Namespace<K>, key: K, params?: Params): LocalizedText {
  const out = {} as Record<Language, string>;
  for (const lang of LANGS) out[lang] = translateNs(ns, lang, key, params);
  return out as LocalizedText;
}

/** Same text in every language (names, numbers). */
export const same = (text: string): LocalizedText => ({ en: text, de: text, bs: text });

/** Sources of a fact composed from the data fields of one surah (name meaning, ayah count, revelation place). */
export function surahSources(n: number): SourceRef[] {
  const s = surah(n);
  return [
    { sourceName: 'Quran', sourceReference: `${s.number}:1–${s.ayahCount}` },
    { sourceName: QURAN_SOURCE.text, sourceReference: '' },
  ];
}

/** "Surah X means “…”. It has N ayahs and was revealed in Makkah/Madinah." (core template of the collection). */
export function surahFactText(n: number): LocalizedText {
  const s = surah(n);
  const meaning = surahMeaning(n);
  const build = (lang: Language) =>
    translate(lang, 'collection.surahFact', {
      name: s.nameTransliterated,
      meaning: meaning[lang],
      count: s.ayahCount,
      place: translate(lang, s.revelationType === 'madani' ? 'collection.revelation.madani' : 'collection.revelation.makki'),
    });
  return { en: build('en'), de: build('de'), bs: build('bs') };
}

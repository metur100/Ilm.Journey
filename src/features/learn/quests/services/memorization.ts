import { ayahWords, getAyah, getSurah, listSurahs, type Surah } from '@/features/quran';

import type { QuestData, SurahMemorization } from '../models';

// ---------- Recite step (islam-quest ReciteView): repeat every ayah three times ----------

export const REPEATS = 3;

/** Adds one repetition of an ayah (capped at REPEATS). */
export function addRepetition(counts: Readonly<Record<number, number>>, ayah: number): Record<number, number> {
  return { ...counts, [ayah]: Math.min(REPEATS, (counts[ayah] ?? 0) + 1) };
}

/** True when every ayah has been repeated REPEATS times. */
export function allRepeated(counts: Readonly<Record<number, number>>, ayahNumbers: readonly number[]): boolean {
  return ayahNumbers.length > 0 && ayahNumbers.every((n) => (counts[n] ?? 0) >= REPEATS);
}

// ---------- Missing word puzzle (islam-quest `missingWordPuzzle`, now on `@/features/quran`) ----------

export interface MissingWordPuzzle {
  words: string[];
  answer: string;
  choices: string[];
}

/** Builds the missing-word puzzle: the hidden word plus up to 3 distractors from the same surah (deterministic). */
export function missingWordPuzzle(surahNumber: number, ayahNumber: number, missingIndex: number): MissingWordPuzzle | null {
  const surah = getSurah(surahNumber);
  const ayah = getAyah(surahNumber, ayahNumber);
  if (!surah || !ayah) return null;
  const words = ayahWords(ayah.arabic);
  const answer = words[missingIndex];
  if (!answer) return null;
  const distractors: string[] = [];
  for (const other of surah.ayahs) {
    for (const word of ayahWords(other.arabic)) {
      if (word !== answer && !distractors.includes(word)) distractors.push(word);
    }
  }
  // Same deterministic choice as islam-quest keeps the puzzle stable between renders.
  const picked = distractors
    .map((word, i) => ({ word, key: (i * 7919 + missingIndex * 31 + ayahNumber) % 97 }))
    .sort((a, b) => a.key - b.key)
    .slice(0, 3)
    .map((d) => d.word);
  return { words, answer, choices: [answer, ...picked] };
}

// ---------- Memorization tool ----------

export const EMPTY_MEMORIZATION: SurahMemorization = { learned: [], tests: 0, bestTest: 0 };

export function memorizationOf(data: Pick<QuestData, 'memorization'>, surahNumber: number): SurahMemorization {
  return data.memorization[String(surahNumber)] ?? EMPTY_MEMORIZATION;
}

/** Marks (or unmarks) ayahs of a surah as learned; ayah numbers outside the surah are ignored. */
export function setAyahsLearned(memo: SurahMemorization, surah: Pick<Surah, 'ayahCount'>, ayahs: readonly number[], learned: boolean, nowIso: string): SurahMemorization {
  const valid = ayahs.filter((n) => Number.isInteger(n) && n >= 1 && n <= surah.ayahCount);
  const set = new Set(memo.learned);
  for (const n of valid) {
    if (learned) set.add(n);
    else set.delete(n);
  }
  return { ...memo, learned: [...set].sort((a, b) => a - b), updatedAt: nowIso };
}

/** Records a "test myself" round: known ayahs become learned, the best percentage is kept. */
export function applyMemorizationTest(memo: SurahMemorization, surah: Pick<Surah, 'ayahCount'>, known: readonly number[], nowIso: string): SurahMemorization {
  const percent = surah.ayahCount > 0 ? Math.round((new Set(known).size / surah.ayahCount) * 100) : 0;
  const next = setAyahsLearned(memo, surah, known, true, nowIso);
  return { ...next, tests: memo.tests + 1, bestTest: Math.max(memo.bestTest, Math.min(100, percent)) };
}

export function learnedCount(data: Pick<QuestData, 'memorization'>, surah: Pick<Surah, 'number' | 'ayahCount'>): number {
  return memorizationOf(data, surah.number).learned.filter((n) => n <= surah.ayahCount).length;
}

/** Learned ayahs over all 38 surahs. */
export function memorizationSummary(data: Pick<QuestData, 'memorization'>): { learned: number; total: number; surahsComplete: number } {
  const surahs = listSurahs();
  let learned = 0;
  let surahsComplete = 0;
  for (const s of surahs) {
    const n = learnedCount(data, s);
    learned += n;
    if (n === s.ayahCount) surahsComplete++;
  }
  return { learned, total: surahs.reduce((sum, s) => sum + s.ayahCount, 0), surahsComplete };
}

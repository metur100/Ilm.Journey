import type { GameApi, GameFact } from '@/core/games';
import { kitResult, type KitDoneInfo } from '@/core/games/kit';
import type { LocalizedText, SourceRef } from '@/core/models';

/*
 * Shared helpers of the salah "basics" games (wudu, gusul, tejemmum, ezan, conditions, breakers, words, masjid).
 * Practical details follow the Hanafi school as taught in the Bosnian ilmihal (Islamska zajednica BiH); where other
 * schools differ visibly, the fact says so briefly. Hadith numbers are the standard (Dar-us-Salam / sunnah.com) ones.
 */

export const L = (en: string, de: string, bs: string): LocalizedText => ({ en, de, bs });

export const Q = (ref: string): SourceRef => ({ sourceName: 'Quran', sourceReference: ref });
export const BUKHARI = (n: string): SourceRef => ({ sourceName: 'Sahih al-Bukhari', sourceReference: n });
export const MUSLIM = (n: string): SourceRef => ({ sourceName: 'Sahih Muslim', sourceReference: n });
export const ABU_DAWUD = (n: string): SourceRef => ({ sourceName: 'Sunan Abi Dawud', sourceReference: n });
/** The Bosnian ilmihal of the Islamic Community in Bosnia and Herzegovina (Hanafi practice), by chapter. */
export const ILMIHAL = (chapter: string): SourceRef => ({ sourceName: 'Ilmihal (IZ BiH)', sourceReference: chapter });

export const fact = (id: string, text: LocalizedText, sources: SourceRef[], art?: string, check?: GameFact['check']): GameFact => ({
  id,
  text,
  sources,
  ...(art ? { art } : {}),
  ...(check ? { check } : {}),
});

export const choice = (prompt: LocalizedText, options: LocalizedText[], correctIndex: number): GameFact['check'] => ({ type: 'choice', prompt, options, correctIndex });

/** Fact ids for the item ids the learner got wrong (`factOf[itemId]`, else `fallback`). */
export function missedFacts(missed: readonly string[], factOf: Record<string, string>, fallback?: string): string[] {
  const out = missed.map((id) => factOf[id] ?? fallback).filter((x): x is string => !!x);
  return [...new Set(out)];
}

/** Standard `onDone` of a kit engine: score by moves and mistakes, missed items → fact ids. */
export function finishWith(api: GameApi<unknown>, moves: number, factOf: Record<string, string> = {}, fallback?: string) {
  const levelIds = api.facts.map((f) => f.id);
  const first = fallback ?? levelIds[0];
  // Only facts of the level being played are reported (a part may point to a fact taught in another level).
  const own = (id: string) => (levelIds.includes(id) ? id : first);
  return (info: KitDoneInfo) =>
    api.onComplete(kitResult({ moves, mistakes: info.mistakes, factsMissed: [...new Set(missedFacts(info.missed, factOf, first).map(own))] }));
}

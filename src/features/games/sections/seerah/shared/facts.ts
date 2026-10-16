import type { FactCheck, GameFact } from '@/core/games';
import type { LocalizedText, SourceRef } from '@/core/models';

import { SEERAH_BLOCKS, SEERAH_SOURCE_REFS } from './seerahContent';

/*
 * Facts of the Seerah games: every "You learned" text is a Seerah content block copied unchanged (seerahContent.ts),
 * shown with the block's own sources. Quran facts use the generated Quran data (`@/features/quran`).
 */

export const T = (en: string, de: string, bs: string): LocalizedText => ({ en, de, bs });

/** SourceRefs of Seerah source ids (throws on an unknown id – caught by the tests). */
export function seerahRefs(ids: readonly string[]): SourceRef[] {
  return ids.map((id) => {
    const ref = SEERAH_SOURCE_REFS[id];
    if (!ref) throw new Error(`Unknown Seerah source ${id}`);
    return ref;
  });
}

/** A fact made from a Seerah block (`e05.main1`, `ev.badr.0`, …), with its sources. */
export function blockFact(id: string, key: string, extra: { art?: string; check?: FactCheck; reviewKey?: string } = {}): GameFact {
  const block = SEERAH_BLOCKS[key];
  if (!block) throw new Error(`Unknown Seerah block ${key}`);
  return { id, text: block.text, sources: seerahRefs(block.sourceIds), ...extra };
}

/** The text of a block (for inline captions). */
export const blockText = (key: string): LocalizedText => {
  const block = SEERAH_BLOCKS[key];
  if (!block) throw new Error(`Unknown Seerah block ${key}`);
  return block.text;
};

/** Maps missed item ids to fact ids (unique, only known ones). */
export function missedFacts(missed: readonly string[], map: Record<string, string>): string[] {
  return [...new Set(missed.map((m) => map[m]).filter((f): f is string => !!f))];
}

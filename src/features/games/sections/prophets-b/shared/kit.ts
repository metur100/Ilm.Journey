/*
 * The kit internals the custom boards of this section use (engine bookkeeping, probes, measuring). They are not part
 * of the kit's public index yet, so they are imported in this one place (a request to export them is in the
 * prophets-b report).
 */
export { useEngineCore } from '@/core/games/kit/engine';
export { useKitProbe } from '@/core/games/kit/probe';
export { useMeasure } from '@/core/games/kit/layout';

import type { LocalizedText, SourceRef } from '@/core/models';

/** Localized text shorthand. */
export const T = (en: string, de: string, bs: string): LocalizedText => ({ en, de, bs });

/** Quran source reference(s). */
export const quran = (...refs: string[]): SourceRef[] => refs.map((sourceReference) => ({ sourceName: 'Quran', sourceReference }));

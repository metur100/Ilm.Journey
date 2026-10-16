import type { PrayerPosition } from '@/core/art/pieces/sections/salahFigure';
import type { SkyTime } from '@/core/art';

/*
 * How each prayer is performed – Hanafi school, as taught in the Bosnian ilmihal (Islamska zajednica BiH).
 * Pure data + rules; the games, the captions and the tests read everything from here.
 *
 * - Parts in order: e.g. podne = 4 sunnah + 4 fard + 2 sunnah.
 * - Per rakat: Subhaneke (1st rakat; also the 3rd of a 4-rakat non-emphasised sunnah), Fatiha, an additional surah
 *   (every rakat of sunnah / vitr; only the first two of a fard), aloud or quietly, kunut in the 3rd rakat of vitr,
 *   first sitting after the 2nd rakat of a 3- or 4-rakat prayer, last sitting with Ettehijjatu, Salavat and Rabbena,
 *   then selam to the right and to the left.
 */

export type PrayerId = 'sabah' | 'podne' | 'ikindija' | 'aksam' | 'jacija' | 'vitr' | 'dzuma';

export const PRAYER_IDS: readonly PrayerId[] = ['sabah', 'podne', 'ikindija', 'aksam', 'jacija', 'vitr', 'dzuma'];

/**
 * - `sunnah`: emphasised sunnah (sunnet muekkede)
 * - `sunnah-ghayr`: non-emphasised sunnah (sunnet gajri muekkede) – 4 before ikindija and jacija
 * - `fard`: obligatory (farz)
 * - `vitr`: vitr (vadžib in the Hanafi school)
 */
export type PartKind = 'sunnah' | 'sunnah-ghayr' | 'fard' | 'vitr';

/** Which rakats of a part are recited aloud by the imam (a man praying alone may recite aloud or quietly). */
export type AloudRule = 'quiet' | 'all' | 'first-two';

export interface PrayerPart {
  id: string;
  kind: PartKind;
  rakats: 2 | 3 | 4;
  aloud: AloudRule;
}

export interface PrayerDef {
  id: PrayerId | 'guide';
  /** Time-of-day sky of the game board. */
  sky: SkyTime;
  parts: PrayerPart[];
  /** Index of the main part (the one prayed along and led in the games). */
  main: number;
  /** Džuma: the khutbah comes before the part with this index. */
  khutbahBefore?: number;
}

const part = (id: string, kind: PartKind, rakats: 2 | 3 | 4, aloud: AloudRule = 'quiet'): PrayerPart => ({ id, kind, rakats, aloud });

export const PRAYERS: Record<PrayerId, PrayerDef> = {
  sabah: { id: 'sabah', sky: 'dawn', parts: [part('sunnah', 'sunnah', 2), part('fard', 'fard', 2, 'all')], main: 1 },
  podne: { id: 'podne', sky: 'noon', parts: [part('sunnah-before', 'sunnah', 4), part('fard', 'fard', 4), part('sunnah-after', 'sunnah', 2)], main: 1 },
  ikindija: { id: 'ikindija', sky: 'afternoon', parts: [part('sunnah', 'sunnah-ghayr', 4), part('fard', 'fard', 4)], main: 1 },
  aksam: { id: 'aksam', sky: 'sunset', parts: [part('fard', 'fard', 3, 'first-two'), part('sunnah', 'sunnah', 2)], main: 0 },
  jacija: {
    id: 'jacija',
    sky: 'night',
    parts: [part('sunnah-before', 'sunnah-ghayr', 4), part('fard', 'fard', 4, 'first-two'), part('sunnah-after', 'sunnah', 2), part('vitr', 'vitr', 3)],
    main: 1,
  },
  vitr: { id: 'vitr', sky: 'night', parts: [part('vitr', 'vitr', 3)], main: 0 },
  dzuma: { id: 'dzuma', sky: 'noon', parts: [part('sunnah-before', 'sunnah', 4), part('fard', 'fard', 2, 'all'), part('sunnah-after', 'sunnah', 4)], main: 1, khutbahBefore: 1 },
};

/** The step-by-step guide (salah-guide): a plain prayer of two rakats in the morning light. */
export const GUIDE: PrayerDef = { id: 'guide', sky: 'morning', parts: [part('two', 'sunnah', 2)], main: 0 };

export const prayerDef = (id: PrayerId | 'guide'): PrayerDef => (id === 'guide' ? GUIDE : PRAYERS[id]);

export function mainPart(id: PrayerId | 'guide'): PrayerPart {
  const p = prayerDef(id);
  return p.parts[p.main];
}

export function totalRakats(id: PrayerId): number {
  return PRAYERS[id].parts.reduce((n, p) => n + p.rakats, 0);
}

// ---------------------------------------------------------------------------------------------------------------
// Rakats

export type Sitting = 'none' | 'first' | 'last';

export interface RakatPlan {
  /** 1-based number of the rakat in its part. */
  n: number;
  /** Subhaneke before the Fatiha. */
  subhaneke: boolean;
  /** An additional surah (or ayahs) after the Fatiha. */
  surah: boolean;
  /** The imam recites the Fatiha and the surah aloud (a man alone may choose; women always quietly). */
  aloud: boolean;
  /** Vitr: takbir with raised hands and the kunut dua before the ruku'. */
  kunut: boolean;
  /** The sitting after this rakat. */
  sitting: Sitting;
  /** First sitting of a non-emphasised sunnah: Ettehijjatu, Salavat and the dua (not only Ettehijjatu). */
  fullFirstSitting: boolean;
}

export function rakatPlans(p: PrayerPart): RakatPlan[] {
  return Array.from({ length: p.rakats }, (_, i) => {
    const n = i + 1;
    const sitting: Sitting = n === p.rakats ? 'last' : n === 2 ? 'first' : 'none';
    return {
      n,
      subhaneke: n === 1 || (p.kind === 'sunnah-ghayr' && n === 3),
      surah: p.kind !== 'fard' || n <= 2,
      aloud: p.aloud === 'all' || (p.aloud === 'first-two' && n <= 2),
      kunut: p.kind === 'vitr' && n === 3,
      sitting,
      fullFirstSitting: p.kind === 'sunnah-ghayr' && sitting === 'first',
    };
  });
}

/** Number of sittings of a part: one (last) for 2 rakats, two (first + last) for 3 and 4. */
export const sittingsOf = (p: PrayerPart): number => rakatPlans(p).filter((r) => r.sitting !== 'none').length;

// ---------------------------------------------------------------------------------------------------------------
// Steps: the movements of a part in order (what the figure does and what is said)

/** The movement into a position (each has a gesture in "pray along"). */
export type Move =
  | 'takbir'
  | 'fold'
  | 'bow'
  | 'rise'
  | 'prostrate'
  | 'sit-up'
  | 'stand-up'
  | 'sit'
  | 'finger'
  | 'kunut-takbir'
  | 'selam-right'
  | 'selam-left';

/** What is said in a position. Texts: Arabic only from generated Quran data or existing content (see captions). */
export type Recite =
  | 'niyyah'
  | 'takbir'
  | 'subhaneke'
  | 'fatiha'
  | 'surah'
  | 'ruku'
  | 'itidal'
  | 'sajda'
  | 'jalsa'
  | 'tashahhud'
  | 'salavat'
  | 'dua'
  | 'rabbena'
  | 'kunut'
  | 'selam';

export interface PrayerStep {
  move: Move;
  position: PrayerPosition;
  rakat: number;
  recite: Recite[];
  /** Recitation aloud (imam) – only on standing steps with the Fatiha. */
  aloud?: boolean;
  sitting?: 'first' | 'last';
  /** First sajda of the part (pray along: tap the 7 points). */
  firstSajda?: boolean;
}

export function partSteps(p: PrayerPart): PrayerStep[] {
  const steps: PrayerStep[] = [];
  let sajdas = 0;
  for (const r of rakatPlans(p)) {
    const reading: Recite[] = [...(r.subhaneke ? (['subhaneke'] as const) : []), 'fatiha', ...(r.surah ? (['surah'] as const) : [])];
    if (r.n === 1) {
      steps.push({ move: 'takbir', position: 'takbir', rakat: 1, recite: ['niyyah', 'takbir'] });
      steps.push({ move: 'fold', position: 'folded', rakat: 1, recite: reading, aloud: r.aloud });
    } else {
      steps.push({ move: 'stand-up', position: 'folded', rakat: r.n, recite: reading, aloud: r.aloud });
    }
    if (r.kunut) {
      steps.push({ move: 'kunut-takbir', position: 'takbir', rakat: r.n, recite: ['takbir'] });
      steps.push({ move: 'fold', position: 'folded', rakat: r.n, recite: ['kunut'] });
    }
    steps.push({ move: 'bow', position: 'ruku', rakat: r.n, recite: ['ruku'] });
    steps.push({ move: 'rise', position: 'itidal', rakat: r.n, recite: ['itidal'] });
    steps.push({ move: 'prostrate', position: 'sajda', rakat: r.n, recite: ['sajda'], firstSajda: sajdas === 0 });
    sajdas += 1;
    steps.push({ move: 'sit-up', position: 'jalsa', rakat: r.n, recite: ['jalsa'] });
    steps.push({ move: 'prostrate', position: 'sajda', rakat: r.n, recite: ['sajda'] });
    if (r.sitting !== 'none') {
      steps.push({ move: 'sit', position: 'jalsa', rakat: r.n, recite: ['tashahhud'], sitting: r.sitting });
      const after: Recite[] = r.sitting === 'last' ? ['salavat', 'rabbena'] : r.fullFirstSitting ? ['salavat', 'dua'] : [];
      steps.push({ move: 'finger', position: 'tashahhud', rakat: r.n, recite: ['tashahhud', ...after], sitting: r.sitting });
    }
  }
  const last = p.rakats;
  steps.push({ move: 'selam-right', position: 'selam-right', rakat: last, recite: ['selam'], sitting: 'last' });
  steps.push({ move: 'selam-left', position: 'selam-left', rakat: last, recite: ['selam'], sitting: 'last' });
  return steps;
}

/** The six movements of every rakat, from standing to the second sajda. */
export const RAKAT_ORDER: { move: Move; position: PrayerPosition }[] = [
  { move: 'fold', position: 'folded' },
  { move: 'bow', position: 'ruku' },
  { move: 'rise', position: 'itidal' },
  { move: 'prostrate', position: 'sajda' },
  { move: 'sit-up', position: 'jalsa' },
  { move: 'prostrate', position: 'sajda' },
];

/** Outline of a part: takbir, the rakats with their sittings and the selam (L2 ordering). */
export type OutlineItem = { kind: 'takbir' } | { kind: 'rakat'; n: number } | { kind: 'sitting'; which: 'first' | 'last' } | { kind: 'kunut' } | { kind: 'selam' };

export function partOutline(p: PrayerPart): OutlineItem[] {
  const out: OutlineItem[] = [{ kind: 'takbir' }];
  for (const r of rakatPlans(p)) {
    out.push({ kind: 'rakat', n: r.n });
    if (r.kunut) out.push({ kind: 'kunut' });
    if (r.sitting !== 'none') out.push({ kind: 'sitting', which: r.sitting });
  }
  out.push({ kind: 'selam' });
  return out;
}

/** Short Quran surahs read after the Fatiha in the captions (from the generated data, by rakat). */
export const SURAH_BY_RAKAT = [108, 112, 113, 114] as const;

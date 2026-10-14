import type { GameResultInput } from '@/core/games';
import { shuffle } from '@/core/utils/random';

/*
 * Ark of Nuh – pure rules (unit-tested in __tests__/ark-of-nuh.test.ts).
 *
 * Memory: animal cards lie face down; two face-up cards of the same kind are a pair, which walks up the ramp into
 * the ark. L3 adds a sorting twist: loose animals are led to the ark gate two by two – only two of the same kind
 * may go in together ("load upon it of each kind two", Quran 11:40).
 */

/**
 * Land animals and birds of the art library that are clearly different kinds. Pieces that are the same kind as
 * another one (ram/sheep, ox/cow, she-camel/camel, wolf/dog, pigeon/dove), sea creatures and the dove (kept out of
 * the scene on purpose – the Quran's account has no dove) are not used.
 */
export const ANIMAL_KINDS = [
  'camel',
  'sheep',
  'goat',
  'horse',
  'donkey',
  'cow',
  'lion',
  'elephant',
  'hoopoe',
  'crow',
  'frog',
  'cat',
  'dog',
  'ant',
  'bee',
] as const;

export type AnimalKind = (typeof ANIMAL_KINDS)[number];

export const animalArt = (kind: AnimalKind) => `animal.${kind}` as const;

/** Couples of kinds that look alike – the sorting twist uses them so the learner has to look closely. */
export const LOOK_ALIKE: readonly (readonly [AnimalKind, AnimalKind])[] = [
  ['horse', 'donkey'],
  ['goat', 'sheep'],
  ['cat', 'lion'],
  ['crow', 'hoopoe'],
];

export interface ArkConfig {
  /** Pairs found in the memory grid. */
  pairs: number;
  /** L3: pairs led to the ark gate by sorting loose animals (0 = no sorting twist). */
  sortPairs: number;
}

export interface MemoryCard {
  /** Position in the grid (0-based). */
  index: number;
  kind: AnimalKind;
}

/** Picks the kinds of one play: `memory` kinds for the grid, `sort` other kinds (look-alikes first) for the gate. */
export function pickKinds(memory: number, sort: number, random: () => number): { memory: AnimalKind[]; sort: AnimalKind[] } {
  const sortKinds = shuffle(LOOK_ALIKE, random)
    .flatMap((couple) => [...couple])
    .slice(0, sort);
  const rest = shuffle(
    ANIMAL_KINDS.filter((k) => !sortKinds.includes(k)),
    random,
  );
  return { memory: rest.slice(0, memory), sort: sortKinds };
}

/** A shuffled deck with exactly two cards of every kind. */
export function makeDeck(kinds: readonly AnimalKind[], random: () => number): MemoryCard[] {
  const cards = shuffle(
    kinds.flatMap((k) => [k, k]),
    random,
  );
  return cards.map((kind, index) => ({ index, kind }));
}

// ---------- memory state ----------

export interface MemoryState {
  cards: MemoryCard[];
  /** Face-up cards that are not matched yet (0–2). */
  open: number[];
  /** Indexes of matched cards. */
  matched: number[];
  /** Matched kinds in the order they were found. */
  found: AnimalKind[];
  /** Turns where two different kinds were turned over. */
  mismatches: number;
}

export type FlipEvent = 'ignored' | 'flip' | 'match' | 'mismatch';

export const initialMemory = (cards: MemoryCard[]): MemoryState => ({ cards, open: [], matched: [], found: [], mismatches: 0 });

/**
 * Turns a card over. A third card while two different cards are still open first turns those back (the learner may
 * tap on instead of waiting). Matched or already open cards are ignored.
 */
export function flipCard(state: MemoryState, index: number): { state: MemoryState; event: FlipEvent } {
  const card = state.cards[index];
  if (!card || state.matched.includes(index) || state.open.includes(index)) return { state, event: 'ignored' };
  const base = state.open.length >= 2 ? closeOpen(state) : state;
  if (base.open.length === 0) return { state: { ...base, open: [index] }, event: 'flip' };
  const first = base.open[0];
  if (base.cards[first].kind === card.kind) {
    return {
      state: { ...base, open: [], matched: [...base.matched, first, index], found: [...base.found, card.kind] },
      event: 'match',
    };
  }
  return { state: { ...base, open: [first, index], mismatches: base.mismatches + 1 }, event: 'mismatch' };
}

/** Turns two different open cards face down again. */
export function closeOpen(state: MemoryState): MemoryState {
  return state.open.length ? { ...state, open: [] } : state;
}

export const isFaceUp = (state: MemoryState, index: number) => state.open.includes(index) || state.matched.includes(index);

export const memoryDone = (state: MemoryState) => state.matched.length === state.cards.length;

// ---------- the ark gate (L3 sorting) ----------

export interface LooseAnimal {
  id: string;
  kind: AnimalKind;
}

/** Two animals of every kind, shuffled, for the meadow of the sorting twist. */
export function makeMeadow(kinds: readonly AnimalKind[], random: () => number): LooseAnimal[] {
  return shuffle(
    kinds.flatMap((kind) => [
      { id: `${kind}-a`, kind },
      { id: `${kind}-b`, kind },
    ]),
    random,
  );
}

export interface GateState {
  /** The animal waiting at the gate for its partner. */
  waiting: LooseAnimal | null;
  /** Kinds that went aboard through the gate. */
  boarded: AnimalKind[];
  /** Animals brought to a waiting animal of another kind. */
  wrongDrops: number;
}

export const emptyGate: GateState = { waiting: null, boarded: [], wrongDrops: 0 };

export type GateEvent = 'waiting' | 'pair' | 'wrong';

/**
 * Brings an animal to the gate: the first one waits; a second of the same kind completes the pair (it goes aboard);
 * an animal of another kind is gently sent back (counts as a wrong drop).
 */
export function bringToGate(gate: GateState, animal: LooseAnimal): { gate: GateState; event: GateEvent } {
  if (!gate.waiting) return { gate: { ...gate, waiting: animal }, event: 'waiting' };
  if (gate.waiting.id === animal.id) return { gate, event: 'waiting' };
  if (gate.waiting.kind === animal.kind) {
    return { gate: { ...gate, waiting: null, boarded: [...gate.boarded, animal.kind] }, event: 'pair' };
  }
  return { gate: { ...gate, wrongDrops: gate.wrongDrops + 1 }, event: 'wrong' };
}

/** The waiting animal walks back to the meadow. */
export const leaveGate = (gate: GateState): GateState => ({ ...gate, waiting: null });

// ---------- the ark ----------

/** How full the ark is (0–1) after `boarded` of `total` pairs went aboard. */
export function arkFill(boarded: number, total: number): number {
  if (total <= 0) return 1;
  return Math.max(0, Math.min(1, boarded / total));
}

/** Storm strength of the sky while loading (0 calm – 1 heavy rain); calm again once the ark is full. */
export function stormLevel(boarded: number, total: number): number {
  const fill = arkFill(boarded, total);
  if (fill >= 1) return 0;
  return 0.25 + 0.75 * fill;
}

/** Number of rain drops drawn for a storm level. */
export const rainDrops = (storm: number) => Math.round(storm * 24);

// ---------- scoring ----------

/**
 * Memory always needs a few misses to discover the cards, so only misses beyond one per pair count as mistakes.
 * Stars: 3 without extra misses (and without wrong gate drops), 2 with up to one extra per pair, else 1.
 * 10 points per pair, −2 per mistake, at least 4 per pair. Two or more wrong gate drops send the "two of each kind"
 * fact to review.
 */
export function arkResult(input: { pairs: number; sortPairs: number; mismatches: number; wrongDrops: number; kindFactId: string }): GameResultInput {
  const total = input.pairs + input.sortPairs;
  const extra = Math.max(0, input.mismatches - input.pairs);
  const mistakes = extra + input.wrongDrops;
  const maxScore = total * 10;
  return {
    score: Math.max(total * 4, maxScore - mistakes * 2),
    maxScore,
    stars: mistakes === 0 ? 3 : mistakes <= total ? 2 : 1,
    mistakes,
    factsMissed: input.wrongDrops >= 2 ? [input.kindFactId] : [],
  };
}

import type { GameFact } from '@/core/games';

import { quran, T } from '../shared/kit';

/*
 * Rings of Armour (Dawud) – "make full coats of mail and measure the links well" (Quran 34:11). The learner links
 * ring after ring into a chain; every link must have the right size.
 *  L1: a short chain, the next place shows the size it needs (a faint ring) and glows.
 *  L2: a longer chain with three sizes; the outlines stay, no glow.
 *  L3: two rows of a mail panel without outlines – the first rings show a pattern; continue it.
 */

export type RingSize = 's' | 'm' | 'l';
export const RING_SCALE: Record<RingSize, number> = { s: 0.62, m: 0.8, l: 1 };

export interface ArmourConfig {
  /** Sizes of every link in building order. */
  links: RingSize[];
  /** Links already in place at the start (L3 pattern). */
  given: number;
  /** Links per row. */
  perRow: number;
  /** Faint outline of the needed size in every empty place. */
  ghosts: boolean;
  sizes: RingSize[];
  hints: boolean;
}

const repeat = <X>(xs: X[], n: number): X[] => Array.from({ length: n }, (_, i) => xs[i % xs.length]);

export const LEVEL_1: ArmourConfig = { links: ['m', 'l', 'm', 'l', 'm', 'l'], given: 0, perRow: 6, ghosts: true, sizes: ['m', 'l'], hints: true };
export const LEVEL_2: ArmourConfig = { links: ['s', 'm', 'l', 'l', 'm', 's', 'm', 'l'], given: 0, perRow: 4, ghosts: true, sizes: ['s', 'm', 'l'], hints: false };
export const LEVEL_3: ArmourConfig = { links: repeat<RingSize>(['s', 'm', 'l'], 12), given: 3, perRow: 6, ghosts: false, sizes: ['s', 'm', 'l'], hints: false };

export const DAWUD_FACTS = {
  iron: {
    id: 'iron-made-soft',
    text: T('Allah made iron soft for Dawud.', 'Allah machte das Eisen für Dawud weich.', 'Allah je Davudu omekšao željezo.'),
    sources: quran('34:10'),
    art: 'prophet.dawud-iron',
    reviewKey: 'stories:dawud-iron',
  },
  links: {
    id: 'measure-the-links',
    text: T(
      'Allah told Dawud: "Make full coats of mail and measure the links well, and do good."',
      'Allah sagte zu Dawud: „Fertige volle Panzerhemden an und miss die Ringe gut ab, und tut Gutes.“',
      'Allah je rekao Davudu: „Pravi široke oklope i pravilno spajaj karike, i dobra djela činite.“',
    ),
    sources: quran('34:11'),
    art: 'prophet.dawud-chain',
    check: {
      type: 'choice',
      prompt: T('What did Allah teach Dawud to make from iron?', 'Was lehrte Allah Dawud aus Eisen zu fertigen?', 'Šta je Allah naučio Davuda da pravi od željeza?'),
      options: [T('Coats of mail (armour)', 'Panzerhemden (Rüstungen)', 'Oklope'), T('Ships', 'Schiffe', 'Lađe'), T('Coins', 'Münzen', 'Novčiće')],
      correctIndex: 0,
    },
  },
  protect: {
    id: 'armour-protects',
    text: T(
      'Allah taught Dawud to make armour to protect people in times of danger.',
      'Allah lehrte Dawud, Rüstungen zu fertigen, um die Menschen in Zeiten der Gefahr zu schützen.',
      'Allah je naučio Davuda da izrađuje oklope da bi štitili ljude u vremenima opasnosti.',
    ),
    sources: quran('21:80'),
    art: 'prophet.dawud-armour',
  },
  mountains: {
    id: 'mountains-and-birds',
    text: T(
      'Allah said: "O mountains, glorify Allah with him – and you birds as well!"',
      'Allah sprach: „O ihr Berge, preist Allah mit ihm – und ihr Vögel ebenso!“',
      'Allah je rekao: „O planine, slavite Allaha zajedno s njim, i vi, ptice!“',
    ),
    sources: quran('34:10'),
    art: 'prophet.dawud-mountains-birds',
    reviewKey: 'stories:dawud-praise',
  },
} satisfies Record<string, GameFact>;

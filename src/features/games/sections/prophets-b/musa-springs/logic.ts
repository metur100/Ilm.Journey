import type { ConnectPair } from '@/core/games/kit';

import { T } from '../shared/kit';

/*
 * Twelve Springs – every tribe's camp (a tent with a banner) is led to its own spring (Quran 2:60: "each people knew
 * its drinking place"). The camp banner and the spring stone share a colour and a shape.
 */

export interface SpringsConfig {
  tribes: number;
  hints: boolean;
  shuffleLeft: boolean;
}

const NAMES = [
  T('Circle', 'Kreis', 'Krug'),
  T('Square', 'Quadrat', 'Kvadrat'),
  T('Triangle', 'Dreieck', 'Trokut'),
  T('Diamond', 'Raute', 'Romb'),
  T('Star', 'Stern', 'Zvijezda'),
  T('Eight-point star', 'Achtstern', 'Osmokraka zvijezda'),
  T('Crescent', 'Mondsichel', 'Polumjesec'),
  T('Drop', 'Tropfen', 'Kap'),
  T('Leaf', 'Blatt', 'List'),
  T('Hexagon', 'Sechseck', 'Šesterokut'),
  T('Heart', 'Herz', 'Srce'),
  T('Sun', 'Sonne', 'Sunce'),
];

/** Pairs camp ↔ spring for the first `n` tribes. */
export function springPairs(n: number): ConnectPair[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `tribe-${i + 1}`,
    left: { art: `prophet.musa-camp-${i + 1}`, a11y: T(`Camp: ${NAMES[i].en}`, `Lager: ${NAMES[i].de}`, `Tabor: ${NAMES[i].bs}`) },
    right: { art: `prophet.musa-spring-${i + 1}`, a11y: T(`Spring: ${NAMES[i].en}`, `Quelle: ${NAMES[i].de}`, `Izvor: ${NAMES[i].bs}`) },
  }));
}

export const LEVEL_1: SpringsConfig = { tribes: 4, hints: true, shuffleLeft: false };
export const LEVEL_2: SpringsConfig = { tribes: 8, hints: false, shuffleLeft: false };
export const LEVEL_3: SpringsConfig = { tribes: 12, hints: false, shuffleLeft: true };

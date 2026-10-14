/**
 * Colours of the art library. They extend the app palette (night / gold / teal / sand, see core/theme) with the
 * nature and material tones the illustrations need. Pieces never read the UI palette directly so that the art looks
 * the same in every theme; the `dark` flag only adjusts shadows, rims and glows.
 */
export const C = {
  // night / indigo (app icon, hero headers)
  night: '#14173A',
  nightSoft: '#232861',
  nightLine: '#343B7A',
  indigo: '#2E3380',
  dusk: '#4B3F8F',
  // gold
  gold: '#F2B544',
  goldLight: '#F7D774',
  goldPale: '#FFE9A8',
  goldDeep: '#D99A2B',
  amber: '#A86F00',
  // teal
  teal: '#0F7A6E',
  tealMid: '#2A9D8F',
  tealLight: '#3DBDAA',
  tealPale: '#B4E0D9',
  // sand / desert
  sand: '#E9C38A',
  sandDeep: '#DDAE6C',
  sandDark: '#C48E55',
  sandLight: '#F3DDB3',
  cream: '#FDF6E3',
  ivory: '#FBF5EA',
  // wood / earth
  wood: '#7A5230',
  woodLight: '#A06C40',
  woodPale: '#C89A68',
  woodDark: '#5A3A20',
  clay: '#B9784A',
  mud: '#C9A27A',
  // greens
  leaf: '#4E9A5B',
  leafLight: '#6DB36D',
  leafPale: '#A6D38D',
  leafDark: '#3E8A55',
  leafDeep: '#2F6B4C',
  olive: '#7E9A5C',
  oliveDark: '#5F7A45',
  domeGreen: '#2E9B5E',
  // water / sky
  sky: '#6FBFE0',
  skyPale: '#DDF2F8',
  water: '#4FA3D1',
  waterDeep: '#2F7EB0',
  waterDark: '#1E5C8C',
  waterLight: '#8CC8EA',
  waterPale: '#CDEAF7',
  // warm accents
  coral: '#E46B4F',
  rose: '#E2697A',
  pink: '#F7A1B5',
  pinkPale: '#FBD3DC',
  plum: '#9C3D54',
  berry: '#C2414B',
  terracotta: '#C8643B',
  orange: '#F28C28',
  lemon: '#F6D44C',
  purple: '#6E4AA0',
  lilac: '#B9A3E3',
  // stone
  stone: '#9C8B78',
  stoneLight: '#BFB09C',
  stonePale: '#E3D9C9',
  stoneDark: '#7D6E5E',
  granite: '#8A7F86',
  marble: '#F4F1EA',
  // neutrals
  white: '#FFFFFF',
  ink: '#1D1F33',
  black: '#17171C',
  grey: '#A9ABB8',
  greyLight: '#D6D7DF',
  greyDark: '#6F7286',
  /** Default tone of the neutral body pictograms and prayer silhouettes (override with `tint`). */
  figure: '#D9A577',
} as const;

function hex(h: string): [number, number, number] {
  const v = h.replace('#', '');
  const n = parseInt(v.length === 3 ? v.split('').map((x) => x + x).join('') : v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');

/** Linear mix of two hex colours (t = 0 → a, t = 1 → b). */
export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hex(a);
  const [r2, g2, b2] = hex(b);
  return `#${toHex(r1 + (r2 - r1) * t)}${toHex(g1 + (g2 - g1) * t)}${toHex(b1 + (b2 - b1) * t)}`.toUpperCase();
}

/** Darker shade (amount 0..1 toward the night ink). */
export const shade = (c: string, amount = 0.2) => mix(c, '#1A1630', amount);
/** Lighter tint (amount 0..1 toward white). */
export const light = (c: string, amount = 0.2) => mix(c, '#FFFFFF', amount);

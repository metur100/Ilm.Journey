import { Circle, Ellipse, G, Path } from 'react-native-svg';

import { Eye, type Ctx } from '../kit';
import { C } from '../palette';

/** Flying dove facing right in a 70 × 50 box (translate/scale to place). */
export function DoveShape({ c, x = 0, y = 0, s = 1, body = C.white, wing = '#E6EAF3', under = '#D3DAE8', beak = C.coral }: { c: Ctx; x?: number; y?: number; s?: number; body?: string; wing?: string; under?: string; beak?: string }) {
  const rim = c.dark ? 'none' : '#BCC6DA';
  const parts = (
    <>
      <Path d="M32 27C28 14 32 4 42 1 45 9 44 19 39 27Z" />
      <Path d="M19 29 4 22Q0 31 4 40L19 35Z" />
      <Path d="M14 31C20 23 36 22 46 24 54 25 59 30 57 35 53 41 40 43 28 41 20 40 15 36 14 31Z" />
      <Path d="M26 30C16 20 9 10 11 3 22 5 35 15 39 29Z" />
      <Circle cx={51} cy={22} r={7.5} />
    </>
  );
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <G fill={rim} stroke={rim} strokeWidth={2.4} strokeLinejoin="round">
        {parts}
      </G>
      <Path d="M32 27C28 14 32 4 42 1 45 9 44 19 39 27Z" fill={under} />
      <Path d="M19 29 4 22Q0 31 4 40L19 35Z" fill={wing} />
      <Path d="M14 31C20 23 36 22 46 24 54 25 59 30 57 35 53 41 40 43 28 41 20 40 15 36 14 31Z" fill={body} />
      <Path d="M18 35C28 39 42 40 55 36 50 41 38 43 28 41 22 40 19 38 18 35Z" fill={under} />
      <Path d="M26 30C16 20 9 10 11 3 22 5 35 15 39 29Z" fill={body} />
      <Path d="M24 26C18 20 14 14 13 8 18 12 22 18 26 22ZM30 27C26 21 24 16 23 11 27 15 30 20 32 25Z" fill={wing} />
      <Circle cx={51} cy={22} r={7.5} fill={body} />
      <Path d="M57.5 20.5 65 23 57.5 25.5Z" fill={beak} />
      <Eye x={53} y={20.5} r={1.5} />
    </G>
  );
}

/** Round bee facing right, centred at (x, y); s = 1 is ~50 dp wide. */
export function BeeShape({ c, x, y, s }: { c: Ctx; x: number; y: number; s: number }) {
  const dark = c.dark ? '#6B4A2E' : '#3B2A20';
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Ellipse cx={-4} cy={-12} rx={8} ry={10} fill={C.white} opacity={0.9} transform="rotate(-25 -4 -12)" />
      <Ellipse cx={6} cy={-12} rx={7} ry={9} fill={C.waterPale} opacity={0.95} transform="rotate(20 6 -12)" />
      <Ellipse cx={0} cy={2} rx={16} ry={11} fill={C.gold} />
      <Path d="M-6-8.5Q-9 2-6 12.5L-1 12.9Q-4 2-1-10.8Z" fill={dark} />
      <Path d="M4-10.5Q1 2 4 10.6L8.5 9Q6 2 8.5-8Z" fill={dark} />
      <Path d="M-16 2-21 0-16-1Z" fill={dark} />
      <Circle cx={15} cy={0} r={7} fill={dark} />
      <Circle cx={17} cy={-2} r={1.6} fill={C.white} />
      <Path d="M17-6Q20-12 24-12M14-6Q15-13 18-15" stroke={dark} strokeWidth={1.3} strokeLinecap="round" fill="none" />
    </G>
  );
}

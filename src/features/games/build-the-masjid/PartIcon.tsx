import Svg, { Ellipse, G, Path, Rect } from 'react-native-svg';

import { C } from '@/core/art/palette';

import type { PartId } from './logic';

/*
 * Small drawings of the parts for the tray and the caption (artwork – fixed art-library colours, 48 × 48).
 */

function Trunk({ x, top = 12, bottom = 42 }: { x: number; top?: number; bottom?: number }) {
  let rings = '';
  for (let y = top + 4; y < bottom; y += 4.5) rings += `M${x - 2.4} ${y}q2.4 -1.3 4.8 0`;
  return (
    <G>
      <Path d={`M${x - 3.2} ${bottom}L${x - 2.5} ${top}H${x + 2.5}L${x + 3.2} ${bottom}Z`} fill={C.wood} />
      <Path d={`M${x + 0.6} ${bottom}L${x + 0.6} ${top}H${x + 2.5}L${x + 3.2} ${bottom}Z`} fill={C.woodDark} opacity={0.35} />
      <Path d={rings} stroke={C.woodDark} strokeWidth={0.8} fill="none" opacity={0.7} />
    </G>
  );
}

function LeafRoof({ y, x0 = 4, x1 = 44 }: { y: number; x0?: number; x1?: number }) {
  let fronds = '';
  for (let x = x0 + 2; x < x1; x += 3) fronds += `M${x} ${y}l2 7`;
  let tips = '';
  for (let x = x0 + 1; x < x1 - 2; x += 3.2) tips += `M${x} ${y + 9}l1.6 3l1.6 -3`;
  return (
    <G>
      <Path d={`M${x0 + 3} ${y}H${x1 - 3}L${x1} ${y + 7}H${x0}Z`} fill="#BBAA63" />
      <Path d={fronds} stroke="#8F8446" strokeWidth={1} />
      <Rect x={x0} y={y + 7} width={x1 - x0} height={2.4} fill={C.woodDark} />
      <Path d={tips} stroke={C.oliveDark} strokeWidth={1} fill="none" />
    </G>
  );
}

export function PartIcon({ id, size = 44 }: { id: PartId; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {id === 'ground' && (
        <G>
          <Path d="M10 22H44L38 40H4Z" fill="#EFD3A1" stroke={C.sandDark} strokeWidth={1.2} />
          <Path d="M12 25H41L36 37H7Z" fill="none" stroke={C.woodLight} strokeWidth={1} strokeDasharray="2.5 2" />
          {[[10, 22], [44, 22], [4, 40], [38, 40]].map(([x, y]) => (
            <Rect key={`${x}`} x={x - 1.1} y={y - 7} width={2.2} height={8} rx={0.8} fill={C.wood} />
          ))}
          <Ellipse cx={24} cy={31} rx={6} ry={2.4} fill={C.clay} opacity={0.35} />
        </G>
      )}
      {id === 'walls' && (
        <G>
          <Rect x={5} y={14} width={38} height={26} rx={1.5} fill="#D2AC80" />
          <Rect x={4} y={11} width={40} height={4} rx={1} fill="#E4C69C" />
          <Path
            d="M5 20.5H43M5 27H43M5 33.5H43M12 15V20.5M24 15V20.5M36 15V20.5M18 20.5V27M30 20.5V27M12 27V33.5M24 27V33.5M36 27V33.5M18 33.5V40M30 33.5V40"
            stroke={C.clay}
            strokeWidth={0.9}
            opacity={0.7}
          />
        </G>
      )}
      {id === 'pillars' && (
        <G>
          <Ellipse cx={24} cy={42.5} rx={19} ry={2} fill={C.ink} opacity={0.12} />
          <Trunk x={11} />
          <Trunk x={24} top={9} />
          <Trunk x={37} />
        </G>
      )}
      {id === 'roof' && (
        <G>
          <LeafRoof y={17} />
          <Path d="M10 30V40M24 30V40M38 30V40" stroke={C.wood} strokeWidth={2.4} opacity={0.35} />
        </G>
      )}
      {id === 'shade-south' && (
        <G>
          <Ellipse cx={24} cy={43} rx={19} ry={2} fill={C.ink} opacity={0.12} />
          <Trunk x={10} top={18} bottom={42} />
          <Trunk x={24} top={18} bottom={42} />
          <Trunk x={38} top={18} bottom={42} />
          <LeafRoof y={9} />
        </G>
      )}
      {id === 'suffa' && (
        <G>
          <Path d="M6 26H42L40 32H4Z" fill="#E8CDA2" />
          <Path d="M4 32H40V39H4Z" fill="#C59B6E" />
          <Path d="M40 32L42 26V33L40 39Z" fill="#B38A5F" />
          <Path d="M9 27.5H19L18 30.5H8Z" fill={C.teal} />
          <Path d="M23 27.5H33L32 30.5H22Z" fill={C.terracotta} />
          <Ellipse cx={37} cy={24} rx={2.8} ry={3.4} fill={C.clay} />
          <Rect x={36} y={18.6} width={2} height={2.6} fill={C.clay} />
        </G>
      )}
    </Svg>
  );
}

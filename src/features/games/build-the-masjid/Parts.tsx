import { View } from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';

import { Art } from '@/core/art';
import { C, mix } from '@/core/art/palette';

import { PARTS, type PartId, type Rect as SiteRect } from './logic';

/*
 * Simple flat drawings of the masjid parts in the art library's palette (artwork – fixed colours). Each part is drawn
 * in site units (viewBox 300 × 190) inside its own slot rectangle, so a placed part lines up with the others.
 * No pillars, roof or suffa: the Seerah content does not describe them.
 */

/** Brick courses inside a wall rectangle. */
function Bricks({ x, y, w, h, color }: { x: number; y: number; w: number; h: number; color: string }) {
  const rows = Math.floor(h / 8);
  let d = '';
  for (let r = 1; r < rows + 1; r++) d += `M${x} ${y + r * 8}H${x + w}`;
  for (let r = 0; r < rows; r++) {
    for (let bx = x + (r % 2 ? 7 : 14); bx < x + w - 2; bx += 14) d += `M${bx} ${y + r * 8}V${y + r * 8 + 8}`;
  }
  return <Path d={d} stroke={color} strokeWidth={0.9} opacity={0.55} fill="none" />;
}

function Plot() {
  return (
    <G>
      <Path d="M30 150H270L284 182H16Z" fill={C.sandLight} stroke={C.sandDark} strokeWidth={1.5} />
      <Path d="M44 154H256L266 177H34Z" stroke={C.woodLight} strokeWidth={1.4} strokeDasharray="4 3" fill="none" />
      {[
        [42, 147],
        [255, 147],
        [31, 171],
        [266, 171],
      ].map(([x, y]) => (
        <Rect key={`${x}`} x={x} y={y} width={3.4} height={10} rx={1} fill={C.wood} />
      ))}
      <Path d="M120 168q10 -5 20 0t20 0" stroke={C.sandDark} strokeWidth={1.2} fill="none" opacity={0.6} />
    </G>
  );
}

function SideWall({ x }: { x: number }) {
  return (
    <G>
      <Rect x={x} y={72} width={26} height={88} fill={C.mud} />
      <Bricks x={x} y={72} w={26} h={88} color={C.clay} />
      <Rect x={x - 2} y={66} width={30} height={7} rx={1.5} fill={C.clay} />
      <Rect x={x + 18} y={72} width={8} height={88} fill={C.sandDark} opacity={0.35} />
    </G>
  );
}

function Walls() {
  return (
    <G>
      <SideWall x={36} />
      <SideWall x={238} />
    </G>
  );
}

function QiblaWall() {
  const face = mix(C.mud, '#FFFFFF', 0.18);
  return (
    <G>
      <Rect x={62} y={80} width={176} height={80} fill={face} />
      <Bricks x={62} y={80} w={176} h={80} color={C.clay} />
      <Rect x={62} y={76} width={176} height={5} fill={C.clay} opacity={0.85} />
      <Rect x={62} y={150} width={176} height={10} fill={C.sandDeep} opacity={0.45} />
      <Path d="M150 92l7 9h-4.5v10h-5v-10H143Z" fill={C.gold} stroke={C.goldDeep} strokeWidth={0.8} />
    </G>
  );
}

const box = (r: SiteRect) => `${r.x} ${r.y} ${r.w} ${r.h}`;

/** One palm drawn with the art library, placed in site units inside a part box scaled by `k`. */
function PalmAt({ x, bottom, width, k, top }: { x: number; bottom: number; width: number; k: number; top: number }) {
  const h = width / 0.75;
  return <Art name="garden.palm" size={width * k} style={{ position: 'absolute', left: x * k, top: (bottom - h - top) * k }} />;
}

/**
 * A part drawn in a box of `width` × `height` that shows its slot rectangle. `thumb` draws a compact version for the
 * tray (a single palm instead of the grove).
 */
export function PartArt({ id, width, height, thumb = false }: { id: PartId; width: number; height: number; thumb?: boolean }) {
  const slot = PARTS[id].slot;
  if (id === 'palms') {
    if (thumb) return <Art name="garden.palm" size={Math.min(width, height * 0.75)} />;
    const k = width / slot.w;
    return (
      <View style={{ width, height }} pointerEvents="none">
        <PalmAt x={0} bottom={164} width={64} k={k} top={slot.y} />
        <PalmAt x={242} bottom={166} width={56} k={k} top={slot.y} />
      </View>
    );
  }
  return (
    <Svg width={width} height={height} viewBox={box(slot)} pointerEvents="none">
      {id === 'plot' ? <Plot /> : id === 'walls' ? <Walls /> : <QiblaWall />}
    </Svg>
  );
}

/** Size of a part's thumbnail that fits into `max` × `max` with the slot's aspect. */
export function thumbSize(id: PartId, max: number): { w: number; h: number } {
  if (id === 'palms') return { w: max * 0.75, h: max };
  const s = PARTS[id].slot;
  const aspect = s.w / s.h;
  return aspect >= 1 ? { w: max, h: max / aspect } : { w: max * aspect, h: max };
}

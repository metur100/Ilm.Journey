import React from 'react';
import { Circle, ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

import { archPath, art, leafPath, star8Path, type ArtDef, type Ctx } from '../kit';
import { C } from '../palette';

/**
 * Geometric patterns. `star-tile`, `geometric-bg` (square) and `arabesque-border` (horizontal strip) tile seamlessly
 * when repeated at their intrinsic aspect.
 */

const line = (c: Ctx) => (c.dark ? '#FFFFFF' : C.goldDeep);

export const pattern = {
  'star-tile': art(100, 100, (c) => {
    const bg = c.dark ? C.nightSoft : C.teal;
    const star = C.gold;
    const inner = c.dark ? C.nightLine : C.tealMid;
    return (
      <>
        <Defs>
          <ClipPath id={c.id('clip')}>
            <Rect x={0} y={0} width={100} height={100} />
          </ClipPath>
        </Defs>
        <G clipPath={c.url('clip')}>
          <Rect x={0} y={0} width={100} height={100} fill={bg} />
          {[[0, 0], [100, 0], [0, 100], [100, 100]].map(([x, y]) => (
            <G key={`${x}-${y}`}>
              <Path d={star8Path(x, y, 24)} fill={star} />
              <Path d={star8Path(x, y, 15)} fill={inner} />
            </G>
          ))}
          <Path d={star8Path(50, 50, 30)} fill={star} />
          <Path d={star8Path(50, 50, 21)} fill={inner} />
          <Path d={star8Path(50, 50, 9, 22.5)} fill={C.goldLight} />
          {[[50, 0], [0, 50], [100, 50], [50, 100]].map(([x, y]) => (
            <Path key={`d${x}-${y}`} d={`M${x} ${y - 9}L${x + 9} ${y}L${x} ${y + 9}L${x - 9} ${y}Z`} fill={C.cream} opacity={0.85} />
          ))}
        </G>
      </>
    );
  }),

  'arabesque-border': art(200, 40, (c) => {
    const stroke = c.dark ? C.goldLight : C.goldDeep;
    const leaf = c.dark ? C.tealLight : C.teal;
    const wave = 'M0 20C25 4 25 4 50 20S75 36 100 20 125 4 150 20 175 36 200 20';
    return (
      <>
        <Path d="M0 2H200M0 38H200" stroke={stroke} strokeWidth={2} />
        <Path d={wave} stroke={stroke} strokeWidth={2.4} fill="none" />
        {[0, 100].map((o) => (
          <G key={o}>
            <Path d={leafPath(o + 25, 9, 12, 4, 200)} fill={leaf} />
            <Path d={leafPath(o + 75, 31, 12, 4, 20)} fill={leaf} />
            <Path d={leafPath(o + 32, 12, 10, 3.4, -60)} fill={leaf} opacity={0.8} />
            <Path d={leafPath(o + 68, 28, 10, 3.4, 120)} fill={leaf} opacity={0.8} />
            <Circle cx={o + 50} cy={20} r={4.4} fill={C.berry} />
            <Circle cx={o + 50} cy={20} r={1.8} fill={C.goldLight} />
            <Circle cx={o + 100} cy={20} r={3.4} fill={C.gold} />
          </G>
        ))}
        <Circle cx={0} cy={20} r={3.4} fill={C.gold} />
      </>
    );
  }),

  mashrabiya: art(100, 140, (c) => {
    const wood = C.woodLight;
    const dark = C.woodDark;
    const cells: React.ReactNode[] = [];
    for (let row = 0; row < 12; row++) {
      for (let col = 0; col < 7; col++) {
        const x = 14 + col * 12 + (row % 2 ? 6 : 0);
        const y = 24 + row * 10;
        cells.push(<Circle key={`${row}-${col}`} cx={x} cy={y} r={3.6} fill={wood} />);
      }
    }
    return (
      <>
        <Defs>
          <ClipPath id={c.id('clip')}>
            <Path d={archPath(50, 10, 80, 132)} />
          </ClipPath>
        </Defs>
        <Path d={archPath(50, 2, 96, 140)} fill={dark} />
        <Path d={archPath(50, 10, 80, 132)} fill={c.dark ? '#2A1E16' : '#4A3220'} />
        <G clipPath={c.url('clip')}>
          <G stroke={wood} strokeWidth={2.2}>
            {Array.from({ length: 16 }, (_, i) => (
              <Path key={`a${i}`} d={`M${-60 + i * 12} 140L${40 + i * 12} 0`} />
            ))}
            {Array.from({ length: 16 }, (_, i) => (
              <Path key={`b${i}`} d={`M${-60 + i * 12} 0L${40 + i * 12} 140`} />
            ))}
          </G>
          {cells}
          <Rect x={0} y={60} width={100} height={6} fill={wood} />
          <Path d={star8Path(50, 40, 12)} fill={C.gold} />
        </G>
      </>
    );
  }),

  'geometric-bg': art(100, 100, (c) => {
    const col = line(c);
    const op = c.dark ? 0.1 : 0.16;
    return (
      <G opacity={op} stroke={col} strokeWidth={1.4} fill="none">
        <Path d={star8Path(50, 50, 26)} />
        <Path d={star8Path(0, 0, 26)} />
        <Path d={star8Path(100, 0, 26)} />
        <Path d={star8Path(0, 100, 26)} />
        <Path d={star8Path(100, 100, 26)} />
        <Path d="M50 24V0M50 76V100M24 50H0M76 50H100" />
        <Path d="M50 0 76 24M100 50 76 76M50 100 24 76M0 50 24 24" />
        <Circle cx={50} cy={50} r={8} />
      </G>
    );
  }),
} satisfies Record<string, ArtDef>;

// Dev tool (not a test): RAMADAN_SCENE=<file.html> npx jest --testMatch "**/*.gen.tsx" -- sections/ramadan/__dev__ – a built scene preview
import * as fs from 'fs';

import { definitions } from '@/core/art/catalogue';
import { defToSvg } from '@/core/art/svgString';

import { bajramMorningGame } from '../bajram-morning/game';
import { iftarTableGame } from '../iftar-table/game';

it('writes the scene preview', () => {
  const out = process.env.RAMADAN_SCENE;
  if (!out) return;
  const W = 400;
  const H = 300;
  const eid = process.env.RAMADAN_WHICH === 'eid';
  const parts = eid ? bajramMorningGame.levels[2].config.spots.map((sp) => ({ art: sp.spotArt ?? 'kit.pin', slot: sp.at })) : iftarTableGame.levels[2].config.parts;
  const layers = parts
    .map((p) => {
      const def = definitions[p.art!];
      const bw = p.slot.w * W;
      const bh = p.slot.h * H;
      const s = Math.min(bw / def.w, bh / def.h);
      return `<div style="position:absolute;left:${p.slot.x * W}px;top:${p.slot.y * H}px;width:${bw}px;height:${bh}px;outline:1px dashed red;display:flex;align-items:center;justify-content:center">${defToSvg(def, { width: Math.round(def.w * s), height: Math.round(def.h * s) })}</div>`;
    })
    .join('');
  fs.writeFileSync(out, `<html><body style="margin:0"><div style="position:relative;width:${W}px;height:${H}px">${defToSvg(definitions[eid ? 'ramadan.eid-morning' : 'ramadan.iftar-table'], { width: W, height: H })}${layers}</div></body></html>`);
});

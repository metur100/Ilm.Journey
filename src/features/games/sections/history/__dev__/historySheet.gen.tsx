/**
 * Dev tool, not part of the test suite: writes HTML contact sheets of the history art (light + dark) for review.
 *
 *   HISTORY_SHEET_DIR=/some/dir npx jest --testMatch "**\/history/__dev__/historySheet.gen.tsx"
 *
 * Then screenshot the HTML (headless Edge/Chrome `--screenshot`).
 */
import * as fs from 'fs';
import * as path from 'path';

import { definitions } from '@/core/art/catalogue';
import { defToSvg } from '@/core/art/svgString';

const dir = process.env.HISTORY_SHEET_DIR;
const only = process.env.HISTORY_SHEET_ONLY?.split(',');
const BOX = Number(process.env.HISTORY_SHEET_BOX ?? 200);

(dir ? it : it.skip)('writes the history art sheet', () => {
  const names = Object.keys(definitions).filter((n) => n.startsWith('history.') && (!only || only.some((o) => n.includes(o))));
  for (const dark of [false, true]) {
    const cells = names
      .map((name) => {
        const def = definitions[name];
        const aspect = def.w / def.h;
        const w = aspect >= 1 ? BOX : Math.round(BOX * aspect);
        const h = aspect >= 1 ? Math.round(BOX / aspect) : BOX;
        return `<div class="cell"><div class="box">${defToSvg(def, { dark, width: w, height: h })}</div><div>${name}</div></div>`;
      })
      .join('');
    const bg = dark ? '#0E1128' : '#FBF5EA';
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:${bg};font:12px system-ui;color:${dark ? '#B4B8D6' : '#555A75'}}
.grid{display:grid;grid-template-columns:repeat(5,${BOX + 16}px);gap:6px;padding:8px}.cell{background:${dark ? '#181C3B' : '#fff'};border-radius:10px;padding:6px;text-align:center}
.box{height:${BOX}px;display:flex;align-items:center;justify-content:center}</style></head><body><div class="grid">${cells}</div></body></html>`;
    fs.writeFileSync(path.join(dir as string, `history-${dark ? 'dark' : 'light'}.html`), html);
  }
});

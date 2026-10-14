/**
 * Dev tool, not part of the test suite: writes HTML contact sheets of every art piece (light + dark background).
 *
 *   ART_SHEET_DIR=/some/dir npx jest --testMatch "**\/art/__dev__/contactSheet.gen.tsx"
 *
 * Then screenshot the HTML files (e.g. headless Edge/Chrome `--screenshot`). `shots.txt` lists file, width, height.
 */
import * as fs from 'fs';
import * as path from 'path';

import { definitions } from '../catalogue';
import { defToSvg } from '../svgString';

const ZOOM = Number(process.env.ART_SHEET_ZOOM ?? 1);
const COLS = ZOOM > 1 ? 4 : 7;
const CELL_W = Math.round(190 * ZOOM);
const CELL_H = Math.round(190 * ZOOM);
const BOX_W = Math.round(160 * ZOOM);
const BOX_H = Math.round(132 * ZOOM) + (ZOOM > 1 ? 20 : 0);

const BG = {
  light: { page: '#FBF5EA', cell: '#FFFFFF', text: '#555A75', border: '#E6DCCB' },
  dark: { page: '#0E1128', cell: '#181C3B', text: '#B4B8D6', border: '#2F3563' },
};

function sheet(names: string[], dark: boolean, title: string): string {
  const t = dark ? BG.dark : BG.light;
  const cells = names
    .map((name) => {
      const def = definitions[name];
      const aspect = def.w / def.h;
      let w = BOX_W;
      let h = w / aspect;
      if (h > BOX_H) {
        h = BOX_H;
        w = h * aspect;
      }
      const big = defToSvg(def, { dark, width: Math.round(w), height: Math.round(h) });
      const small = defToSvg(def, { dark, width: Math.round(aspect >= 1 ? 32 : 32 * aspect), height: Math.round(aspect >= 1 ? 32 / aspect : 32) });
      return `<div class="cell"><div class="box">${big}</div><div class="small">${small}</div><div class="name">${name}</div></div>`;
    })
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;background:${t.page};font:13px system-ui,sans-serif;color:${t.text}}
  h1{font-size:16px;margin:10px 14px}
  .grid{display:grid;grid-template-columns:repeat(${COLS},${CELL_W}px);gap:8px;padding:0 10px 10px}
  .cell{position:relative;width:${CELL_W}px;height:${CELL_H}px;background:${t.cell};border:1px solid ${t.border};border-radius:14px;box-sizing:border-box}
  .box{position:absolute;left:0;right:0;top:10px;height:${BOX_H}px;display:flex;align-items:center;justify-content:center}
  .small{position:absolute;right:8px;bottom:26px;width:32px;height:32px;display:flex;align-items:flex-end;justify-content:center}
  .name{position:absolute;left:8px;right:8px;bottom:6px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  </style></head><body><h1>${title} · ${dark ? 'dark' : 'light'} · ${names.length} pieces</h1><div class="grid">${cells}</div></body></html>`;
}

const outDir = process.env.ART_SHEET_DIR;

(outDir ? it : it.skip)('writes contact sheets', () => {
  const dir = outDir as string;
  fs.mkdirSync(dir, { recursive: true });
  const byCat = new Map<string, string[]>();
  for (const name of Object.keys(definitions)) {
    const cat = name.split('.')[0];
    byCat.set(cat, [...(byCat.get(cat) ?? []), name]);
  }
  // Pack small categories together so each sheet stays a readable size.
  const groups: { title: string; names: string[] }[] = [];
  for (const [cat, names] of byCat) {
    for (let i = 0; i < names.length; i += COLS * 5) {
      groups.push({ title: `${cat}${names.length > COLS * 5 ? ` ${i / (COLS * 5) + 1}` : ''}`, names: names.slice(i, i + COLS * 5) });
    }
  }
  const only = process.env.ART_SHEET_ONLY;
  const shots: string[] = [];
  for (const g of groups) {
    if (only && !g.title.startsWith(only)) continue;
    for (const dark of [false, true]) {
      const file = path.join(dir, `${ZOOM > 1 ? "zoom-" : ""}${g.title.replace(/\s+/g, '-')}-${dark ? 'dark' : 'light'}.html`);
      fs.writeFileSync(file, sheet(g.names, dark, g.title));
      const rows = Math.ceil(g.names.length / COLS);
      shots.push(`${file}\t${COLS * (CELL_W + 8) + 20}\t${44 + rows * (CELL_H + 8) + 10}`);
    }
  }
  fs.writeFileSync(path.join(dir, 'shots.txt'), shots.join('\n'));
});

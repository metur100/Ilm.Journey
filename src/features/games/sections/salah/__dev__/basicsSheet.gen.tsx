/**
 * Dev tool, not part of the test suite: writes an HTML contact sheet of the `salah.basics-*` art (light and dark).
 *
 *   SHEET_DIR=/some/dir npx jest --testMatch "**\/sections/salah/__dev__/basicsSheet.gen.tsx"
 *
 * Then screenshot the HTML (headless Chrome `--screenshot`).
 */
import * as fs from 'fs';
import * as path from 'path';

import { basics } from '@/core/art/pieces/sections/salahBasics';
import { defToSvg } from '@/core/art/svgString';

it('writes the basics art sheet', () => {
  const dir = process.env.SHEET_DIR ?? '.';
  const only = process.env.SHEET_ONLY?.split(',');
  for (const dark of [false, true]) {
    const cells = Object.entries(basics)
      .filter(([key]) => !only || only.includes(key))
      .map(([key, def]) => {
        const scale = Math.min(1.6, 240 / Math.max(def.w, def.h));
        const svg = defToSvg(def, { dark, width: Math.round(def.w * scale), height: Math.round(def.h * scale) });
        return `<div class="cell"><div>${svg}</div><div class="name">${key}</div></div>`;
      })
      .join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:${dark ? '#0E1128' : '#FBF5EA'};font:12px system-ui;color:${dark ? '#B4B8D6' : '#555A75'}}
.grid{display:flex;flex-wrap:wrap;gap:6px;padding:8px}.cell{background:${dark ? '#181C3B' : '#FFFFFF'};border-radius:10px;padding:4px}.name{text-align:center}</style></head><body><div class="grid">${cells}</div></body></html>`;
    fs.writeFileSync(path.join(dir, `basics-${dark ? 'dark' : 'light'}.html`), html);
  }
});

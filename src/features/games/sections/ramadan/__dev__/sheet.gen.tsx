// Dev tool (not a test): RAMADAN_SHEET=<file.html> npx jest --testMatch "**/*.gen.tsx" -- sections/ramadan/__dev__
import * as fs from 'fs';

import { definitions } from '@/core/art/catalogue';
import { defToSvg } from '@/core/art/svgString';

it('writes the ramadan art sheet', () => {
  const out = process.env.RAMADAN_SHEET;
  if (!out) return;
  const names = Object.keys(definitions).filter((n) => n.startsWith('ramadan.'));
  const cell = (dark: boolean) => names.map((n) => `<div style="display:inline-block;margin:6px;text-align:center;font:11px sans-serif;color:${dark ? '#ccc' : '#333'}">${defToSvg(definitions[n], { dark, width: definitions[n].w > 250 ? 260 : 150, height: Math.round((definitions[n].w > 250 ? 260 : 150) * definitions[n].h / definitions[n].w) })}<br>${n}</div>`).join('');
  fs.writeFileSync(out, `<html><body style="margin:0"><div style="background:#FBF5EA;padding:8px">${cell(false)}</div><div style="background:#0E1128;padding:8px">${cell(true)}</div></body></html>`);
});

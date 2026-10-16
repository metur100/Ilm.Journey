/**
 * Dev tool, not part of the test suite: writes an HTML contact sheet of every prayer figure position (male/female,
 * light/dark, with the cue overlays) for visual review.
 *
 *   FIG_SHEET_DIR=/some/dir npx jest --testMatch "**\/salah-prayers/__dev__/figureSheet.gen.tsx"
 *
 * Then screenshot the HTML (headless Chrome `--screenshot`).
 */
import * as fs from 'fs';
import * as path from 'path';

import { art } from '@/core/art/kit';
import { FIG_H, FIG_W, PRAYER_POSITIONS, PrayerFigureArt, type PrayerVariant } from '@/core/art/pieces/sections/salahFigure';
import { defToSvg } from '@/core/art/svgString';

const SCALE = Number(process.env.FIG_SHEET_SCALE ?? 1.25);

function cell(position: (typeof PRAYER_POSITIONS)[number], variant: PrayerVariant, dark: boolean): string {
  const def = art(FIG_W, FIG_H, (c) => <PrayerFigureArt c={c} position={position} variant={variant} cues={{ gaze: true, points: true, arrows: true, highlight: true }} />);
  const svg = defToSvg(def, { dark, width: Math.round(FIG_W * SCALE), height: Math.round(FIG_H * SCALE) });
  return `<div class="cell"><div>${svg}</div><div class="name">${variant} · ${position}</div></div>`;
}

it('writes the prayer figure sheet', () => {
  const dir = process.env.FIG_SHEET_DIR ?? '.';
  for (const dark of [false, true]) {
    const variants: PrayerVariant[] = (process.env.FIG_SHEET_VARIANTS ?? 'male,female').split(',') as PrayerVariant[];
    const only = process.env.FIG_SHEET_ONLY ? process.env.FIG_SHEET_ONLY.split(',') : undefined;
    const cells = variants.flatMap((v) => PRAYER_POSITIONS.filter((p) => !only || only.includes(p)).map((p) => cell(p, v, dark))).join('');
    const bg = dark ? '#0E1128' : '#FBF5EA';
    const fg = dark ? '#B4B8D6' : '#555A75';
    const cellBg = dark ? '#181C3B' : '#FFFFFF';
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:${bg};font:13px system-ui;color:${fg}}
.grid{display:grid;grid-template-columns:repeat(${process.env.FIG_SHEET_COLS ?? 4},${Math.round(FIG_W * SCALE) + 8}px);gap:6px;padding:8px}
.cell{background:${cellBg};border-radius:12px;padding:4px}.name{text-align:center}</style></head><body><div class="grid">${cells}</div></body></html>`;
    fs.writeFileSync(path.join(dir, `figure-${dark ? 'dark' : 'light'}.html`), html);
  }
});

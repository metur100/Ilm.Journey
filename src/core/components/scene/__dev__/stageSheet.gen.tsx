/**
 * Dev tool, not part of the test suite: writes HTML previews of the `story.*` art and of stage compositions
 * (layers only – effects are animated and not drawn here).
 *
 *   STAGE_SHEET_DIR=/some/dir npx jest --testMatch "**\/scene/__dev__/stageSheet.gen.tsx"
 *
 * Then screenshot the HTML files with headless Edge/Chrome (`--screenshot --window-size=…`).
 */
import * as fs from 'fs';
import * as path from 'path';

import { definitions } from '@/core/art/catalogue';
import { defToSvg } from '@/core/art/svgString';
import { STORIES } from '@/features/stories/content';

import { STAGE_H, STAGE_W, type StageSpec } from '../stage';
import { isDarkSky, STAGE_SKIES } from '../stageFallback';

let n = 0;
function stageSvg(stage: StageSpec, width: number): string {
  n += 1;
  const sky = stage.sky ?? 'day';
  const dark = isDarkSky(sky);
  const [a, b, c] = STAGE_SKIES[sky];
  const height = Math.round((width * STAGE_H) / STAGE_W);
  const layers = (stage.layers ?? [])
    .map((l, i) => ({ l, z: l.z ?? i * 10 + 10 }))
    .sort((x, y) => x.z - y.z)
    .map(({ l }) => {
      const def = definitions[l.art];
      if (!def) return `<rect x="0" y="0" width="40" height="20" fill="red"/>`;
      const w = l.fill ? STAGE_W : l.w ?? Math.min(def.w, STAGE_W);
      const h = l.fill ? STAGE_H : (w * def.h) / def.w;
      const x = l.fill ? 0 : (l.x ?? 200) - w / 2;
      const anchor = l.anchor ?? 'bottom';
      const y = l.fill ? 0 : anchor === 'bottom' ? (l.y ?? STAGE_H) - h : (l.y ?? STAGE_H / 2) - h / 2;
      const inner = defToSvg(def, { dark: l.dark ?? dark })
        .replace(/^<svg[^>]*>/, '')
        .replace(/<\/svg>$/, '');
      const flip = l.flip ? ` transform="translate(${2 * x + w} 0) scale(-1 1)"` : '';
      return `<g${flip} opacity="${l.opacity ?? 1}"><svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${def.w} ${def.h}" preserveAspectRatio="${l.fill ? 'xMidYMid slice' : 'xMidYMid meet'}">${inner}</svg></g>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${STAGE_W} ${STAGE_H}"><defs><linearGradient id="sky${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="0.6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs><rect width="${STAGE_W}" height="${STAGE_H}" fill="url(#sky${n})"/>${layers}</svg>`;
}

const page = (title: string, body: string, bg: string) =>
  `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{margin:0;padding:12px;background:${bg};font:12px sans-serif;color:#888}.g{display:flex;flex-wrap:wrap;gap:10px}.c{display:flex;flex-direction:column;gap:4px}.c svg{border-radius:10px;background:#9ac}</style></head><body><div class="g">${body}</div></body></html>`;

describe('stage sheet', () => {
  it('writes previews', () => {
    const dir = process.env.STAGE_SHEET_DIR;
    if (!dir) return;
    fs.mkdirSync(dir, { recursive: true });
    const names = Object.keys(definitions).filter((n) => n.startsWith(process.env.STAGE_SHEET_PREFIX ?? 'story.'));
    for (const dark of [false, true]) {
      const cells = names
        .map((n) => {
          const def = definitions[n];
          const wide = def.w >= 300;
          const w = wide ? 400 : 190;
          return `<div class="c">${defToSvg(def, { dark, width: w, height: Math.round((w * def.h) / def.w) })}<span>${n}</span></div>`;
        })
        .join('');
      fs.writeFileSync(path.join(dir, `art-${dark ? 'dark' : 'light'}.html`), page('art', cells, dark ? '#0E1128' : '#FBF5EA'));
    }
    const stages = STORIES.flatMap((s) => [
      { id: `${s.id} cover`, stage: s.coverStage },
      ...s.scenes.map((sc) => ({ id: sc.id, stage: sc.stage })),
    ]).filter((x): x is { id: string; stage: StageSpec } => !!x.stage);
    const cells = stages.map((x) => `<div class="c">${stageSvg(x.stage, 400)}<span>${x.id}</span></div>`).join('');
    fs.writeFileSync(path.join(dir, 'stages.html'), page('stages', cells, '#FBF5EA'));
  });
});

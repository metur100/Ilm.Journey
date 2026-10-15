import type { SceneSpec, SkyKind } from '@/core/models';

import type { StageEffect } from './stage';

/** Sky gradients of stages (top → bottom). Richer three-stop versions of SceneView's skies. */
export const STAGE_SKIES: Record<SkyKind, [string, string, string]> = {
  night: ['#0B0D24', '#1E2358', '#2C3274'],
  dawn: ['#2E3A78', '#9A6E9E', '#F2A07B'],
  day: ['#5FB2E0', '#A9DBF0', '#E6F5FA'],
  sunset: ['#4B2C6B', '#B7577A', '#F7A05F'],
  dusk: ['#14173A', '#3B3A80', '#7B5CA6'],
  storm: ['#1E242E', '#3A4552', '#66727F'],
  sea: ['#071B33', '#0E3A5E', '#1E6A8C'],
};

export const isDarkSky = (sky: SkyKind) => sky === 'night' || sky === 'dusk' || sky === 'storm' || sky === 'sea';

/**
 * Ambient effects for a plain SceneSpec (stories and episodes without a stage): the old symbolic picture comes to
 * life – rain falls, waves roll, lanterns glow. Positions follow SceneView's drawing scaled into the 400 × 240 stage.
 */
export function sceneEffects(scene: SceneSpec): StageEffect[] {
  const has = (el: string) => (scene.elements as string[]).includes(el);
  const dark = isDarkSky(scene.sky);
  const out: StageEffect[] = [];
  const Y = (y: number) => Math.round((y * 240) / 220);
  if (has('stars')) out.push({ type: 'stars', intensity: 1 });
  if (has('crescent')) out.push({ type: 'lanternGlow', x: 322, y: Y(48), intensity: 1, color: '#FFE9A8' });
  if (has('fullMoon')) out.push({ type: 'lanternGlow', x: 318, y: Y(50), intensity: 1, color: '#FFF3C4' });
  if (has('sun')) out.push({ type: 'sunrays', x: 310, y: Y(60), intensity: 1 });
  if (has('clouds') && !dark) out.push({ type: 'birds', intensity: 1 });
  if (has('rain')) out.push({ type: 'rain', intensity: scene.sky === 'storm' ? 3 : 2 });
  if (has('waves') || has('sea')) out.push({ type: 'waves', y: Y(has('sea') ? 172 : 188), intensity: 1 });
  if (has('river')) out.push({ type: 'ripples', x: 120, y: Y(205), w: 50, intensity: 1 });
  if (has('well')) out.push({ type: 'ripples', x: 200, y: Y(170), w: 40, intensity: 1 });
  if (has('fire')) out.push({ type: 'flameGlow', x: 200, y: Y(170), intensity: 2 });
  if (has('lanterns')) for (const [x, y] of [[48, 58], [118, 76], [236, 58]]) out.push({ type: 'lanternGlow', x, y: Y(y), intensity: 1 });
  if (has('whale')) out.push({ type: 'bubbles', intensity: 2 });
  if (has('dunes') || has('caravan')) out.push({ type: 'sand', intensity: 1 });
  if (has('garden') || has('tree') || has('palms')) out.push(dark ? { type: 'fireflies', intensity: 1 } : { type: 'leaves', intensity: 1 });
  if (has('cave')) out.push({ type: 'dust', x: 160, y: Y(140), w: 110, h: 80, intensity: 1 });
  if (has('book') || has('kaaba') || has('mosque')) out.push({ type: 'sparkle', x: 200, y: Y(has('book') ? 140 : 120), w: 140, h: 70, intensity: 1 });
  if (has('partedSea')) out.push({ type: 'mist', y: Y(110), h: 40, intensity: 1 });
  return out;
}

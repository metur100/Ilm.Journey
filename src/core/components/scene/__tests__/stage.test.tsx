import React from 'react';
import { act, create, type ReactTestRenderer, type ReactTestRendererJSON } from 'react-test-renderer';

import { artNames } from '@/core/art';
import type { SceneSpec } from '@/core/models';

import { LAYER_ANIMS, STAGE_EFFECTS, STAGE_ENTERS, stageArtNames, validateStage, type StageSpec } from '../stage';
import { sceneEffects } from '../stageFallback';
import { loopPeriod, seeded, STAGE_CYCLE } from '../stageMotion';
import { StoryStage } from '../StoryStage';

function render(el: React.ReactElement): ReactTestRenderer {
  let r: ReactTestRenderer | undefined;
  act(() => {
    r = create(el);
  });
  return r as ReactTestRenderer;
}

/** Host nodes of the rendered tree matching `test`. */
function findAll(r: ReactTestRenderer, test: (props: Record<string, unknown>) => boolean): ReactTestRendererJSON[] {
  const out: ReactTestRendererJSON[] = [];
  const walk = (n: ReactTestRendererJSON | string | null) => {
    if (!n || typeof n === 'string') return;
    if (test(n.props)) out.push(n);
    (n.children ?? []).forEach(walk);
  };
  const json = r.toJSON();
  (Array.isArray(json) ? json : [json]).forEach(walk);
  return out;
}

/** Fire onLayout on the stage root so it draws its canvas. */
function layout(r: ReactTestRenderer, width = 360) {
  const root = findAll(r, (p) => typeof p.onLayout === 'function')[0];
  act(() => (root.props.onLayout as (e: unknown) => void)({ nativeEvent: { layout: { width, height: 220, x: 0, y: 0 } } }));
}

const FULL: StageSpec = {
  sky: 'night',
  camera: 'drift',
  mood: 'cool',
  layers: [
    { art: 'story.dunes' },
    { art: 'story.underwater', fill: true, opacity: 0.5 },
    ...LAYER_ANIMS.map((anim, i) => ({ art: 'object.lantern', x: 40 + i * 40, y: 200, w: 30, anim })),
    ...STAGE_ENTERS.map((enter, i) => ({ art: 'place.kaaba', x: 40 + i * 50, y: 230, w: 40, enter, at: i * 100, exitAt: i === 2 ? 3000 : undefined, flip: i % 2 === 0 })),
    { art: 'body.hands', x: 200, y: 200 },
    { art: 'object.does-not-exist', x: 200, y: 200 },
  ],
  effects: STAGE_EFFECTS.map((type, i) => (i % 2 ? type : { type, intensity: 3 as const, at: 200, until: 4000 })),
};

describe('stage model', () => {
  it('validates names and numbers', () => {
    expect(validateStage({ layers: [{ art: 'story.dunes', anim: 'sway', enter: 'rise', at: 300 }], effects: ['rain', { type: 'ripples', x: 10 }] })).toEqual([]);
    const bad = validateStage({
      layers: [{ art: 'pose.standing' }, { art: 'nodot' }, { art: 'story.sea', anim: 'wobble' as never, enter: 'spin' as never, x: 'a' as never }],
      effects: [{ type: 'fireworks' as never }],
    });
    expect(bad.join('\n')).toMatch(/people are never drawn/);
    expect(bad.join('\n')).toMatch(/nodot/);
    expect(bad.join('\n')).toMatch(/anim "wobble"/);
    expect(bad.join('\n')).toMatch(/enter "spin"/);
    expect(bad.join('\n')).toMatch(/x must be a number/);
    expect(bad.join('\n')).toMatch(/fireworks/);
    expect(stageArtNames(FULL)).toContain('story.dunes');
  });

  it('turns old scenes into ambient effects', () => {
    const scene: SceneSpec = { sky: 'storm', elements: ['rain', 'waves', 'ark', 'stars', 'lanterns', 'fire', 'whale', 'dunes', 'garden', 'cave', 'book', 'river', 'well', 'sun', 'crescent', 'partedSea'] };
    const types = sceneEffects(scene).map((e) => e.type);
    for (const t of ['rain', 'waves', 'stars', 'lanternGlow', 'flameGlow', 'bubbles', 'sand', 'fireflies', 'dust', 'sparkle', 'ripples', 'sunrays', 'mist']) expect(types).toContain(t);
    expect(sceneEffects({ sky: 'day', elements: [] })).toEqual([]);
  });

  it('keeps loops inside the shared clock', () => {
    for (const ms of [500, 1234, 4000, 7777, 60000, 90000]) {
      const p = loopPeriod(ms);
      expect(Math.abs(STAGE_CYCLE / p - Math.round(STAGE_CYCLE / p))).toBeLessThan(1e-9);
    }
    const a = seeded(5);
    const b = seeded(5);
    expect([a(), a()]).toEqual([b(), b()]);
  });

  it('has the generic story backdrops', () => {
    for (const name of ['story.dunes', 'story.sea', 'story.underwater', 'story.mountains', 'story.nile', 'story.city-ancient', 'story.ruins', 'story.cave-mouth', 'story.garden', 'story.rain-clouds', 'story.moon-crescent', 'story.lamp', 'story.mihrab']) {
      expect(artNames).toContain(name);
    }
  });
});

describe('StoryStage', () => {
  it('renders every layer animation, entry and effect preset', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const r = render(<StoryStage stage={FULL} height={220} />);
    layout(r);
    const json = JSON.stringify(r.toJSON());
    expect(json.length).toBeGreaterThan(1000);
    // Art pieces are drawn (many SVGs), and the body.* layer is skipped: people are never drawn.
    expect(findAll(r, () => true).filter((n) => n.type === 'RNSVGSvgView').length).toBeGreaterThan(20);
    expect(json).not.toContain('Art(body.hands)');
    act(() => r.unmount());
    warn.mockRestore();
  });

  it('draws the old scene when there is no stage, and still pictures', () => {
    const r = render(<StoryStage scene={{ sky: 'sea', elements: ['waves', 'whale'] }} height={180} />);
    layout(r, 300);
    expect(r.toJSON()).toBeTruthy();
    act(() => r.unmount());
    const still = render(<StoryStage stage={FULL} height={96} still rounded={false} label="A night in the desert" />);
    layout(still, 200);
    expect(findAll(still, (p) => p.accessibilityLabel === 'A night in the desert').length).toBeGreaterThan(0);
    act(() => still.unmount());
  });
});

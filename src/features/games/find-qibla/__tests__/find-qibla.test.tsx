import type React from 'react';

import { hasArt } from '@/core/art';
import { findFact, getGame, validateGame } from '@/core/games';
import { getQuestionByKey } from '@/core/registry';
import { registerLearnFeature } from '@/features/learn/register';

import { fakeGameApi, namespaceProblems } from '../../wudu-flow/kit/testApi';
import { QIBLA_FACTS } from '../content';
import { FindQiblaGame } from '../FindQiblaGame';
import {
  angleDiff,
  CITIES,
  compassPoint,
  distanceKm,
  flatMapBearing,
  greatCirclePoints,
  initialBearing,
  KAABA,
  normalizeDeg,
  QIBLA_ART,
  qiblaBearing,
  qiblaResult,
  roundPoints,
  type CityId,
} from '../logic';
import { mapPath } from '../QiblaMap';
import { findQiblaGame, registerFindQiblaGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

const questsSalah = require('@/features/learn/content/quests/salah.json');

registerLearnFeature();
registerFindQiblaGame();

interface Node {
  type: unknown;
  props: Record<string, any>;
  findAll: (predicate: (node: Node) => boolean) => Node[];
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { act, create } = require('react-test-renderer') as {
  act: (callback: () => Promise<unknown>) => Promise<void>;
  create: (element: React.ReactElement) => { root: Node; unmount: () => void };
};
const button = (root: Node, label: string) => root.findAll((n) => typeof n.props.onPress === 'function' && n.props.accessibilityLabel === label)[0];
const press = async (root: Node, label: string, times = 1) => {
  for (let i = 0; i < times; i++) {
    const node = button(root, label);
    if (!node) throw new Error(`control not found: ${label}`);
    await act(async () => node.props.onPress());
  }
};
const texts = (root: Node) =>
  root
    .findAll((n) => typeof n.props.children === 'string')
    .map((n) => n.props.children as string)
    .join(' | ');

describe('Find the Qibla – registration', () => {
  it('registers a valid game', () => {
    expect(() => validateGame(getGame('find-qibla')!)).not.toThrow();
    expect(findQiblaGame.levels).toHaveLength(3);
  });

  it('has a complete i18n namespace in en/de/bs with every city and direction', () => {
    expect(namespaceProblems(findQiblaGame as never)).toEqual([]);
    const dicts = findQiblaGame.i18n.dictionaries as Record<'en' | 'de' | 'bs', Record<string, string>>;
    for (const lang of ['en', 'de', 'bs'] as const) {
      for (const city of Object.keys(CITIES)) expect(dicts[lang][`city.${city}`]).toBeTruthy();
      for (const p of ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']) {
        expect(dicts[lang][`dir.${p}`]).toBeTruthy();
        expect(dicts[lang][`dirAt.${p}`]).toBeTruthy();
      }
    }
  });

  it('uses only existing art', () => {
    for (const name of [...QIBLA_ART, findQiblaGame.coverArt]) expect(hasArt(name)).toBe(true);
    for (const level of findQiblaGame.levels) for (const fact of level.facts) if (fact.art) expect(hasArt(fact.art)).toBe(true);
  });

  it('copies religious facts from the content; the geometry is a labelled method note', () => {
    const lesson = questsSalah.lessons.find((l: { id: string }) => l.id === 'salah-qibla');
    expect(QIBLA_FACTS.kaaba.text).toEqual(lesson.sections[0].body);
    expect(QIBLA_FACTS.everywhere.text).toEqual(lesson.summary);
    expect(QIBLA_FACTS.firstQibla.text).toEqual(lesson.sections[1].body);
    expect(QIBLA_FACTS.firstQibla.sources).toEqual(lesson.sources);
    const mc = questsSalah.questions.find((q: { id: string }) => q.id === 'salah-qibla-mc');
    expect(QIBLA_FACTS.everywhere.check.prompt).toEqual(mc.prompt);
    expect(QIBLA_FACTS.everywhere.check.options).toEqual(mc.options.map((o: { text: unknown }) => o.text));
    expect(QIBLA_FACTS.kaaba.sources).toEqual(mc.sources);
    // Religious facts cite the Quran; the method note cites no religious source.
    expect(QIBLA_FACTS.shortestPath.sources.every((s) => s.sourceName.startsWith('Method note'))).toBe(true);
    expect(QIBLA_FACTS.shortestPath.text.en.startsWith('Method note')).toBe(true);
    expect(QIBLA_FACTS.everywhere.sources.map((s) => s.sourceReference)).toEqual(['2:144', '2:149–150']);
  });

  it('review keys point to existing questions and missed facts belong to the game', () => {
    for (const level of findQiblaGame.levels) for (const fact of level.facts) if (fact.reviewKey) expect(getQuestionByKey(fact.reviewKey)).toBeDefined();
    for (const id of qiblaResult([90, 5]).factsMissed) expect(findFact(getGame('find-qibla')!, id)).toBeDefined();
  });
});

describe('Find the Qibla – maths', () => {
  it('computes the great-circle initial bearing to the Kaaba (known values)', () => {
    const b = (city: CityId) => qiblaBearing(city);
    // Düsseldorf ≈ 127° (published qibla tables give 127°; the brief's 128–130° was approximate).
    expect(b('duesseldorf')).toBeGreaterThanOrEqual(126);
    expect(b('duesseldorf')).toBeLessThanOrEqual(130);
    expect(b('new-york')).toBeCloseTo(58.5, 0);
    expect(b('jakarta')).toBeCloseTo(295.2, 0);
    expect(b('cape-town')).toBeCloseTo(23.4, 0);
    expect(b('london')).toBeCloseTo(119, 0);
    expect(b('tokyo')).toBeCloseTo(293, 0);
    expect(b('istanbul')).toBeCloseTo(151.6, 0);
    for (const city of Object.keys(CITIES) as CityId[]) {
      const v = b(city);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(360);
    }
    // Simple sanity checks of the formula.
    expect(initialBearing({ lat: 0, lon: 0 }, { lat: 10, lon: 0 })).toBeCloseTo(0);
    expect(initialBearing({ lat: 0, lon: 0 }, { lat: 0, lon: 10 })).toBeCloseTo(90);
    expect(initialBearing({ lat: 10, lon: 0 }, { lat: 0, lon: 0 })).toBeCloseTo(180);
  });

  it('shows why New York faces north-east: the flat-map line points south-east', () => {
    expect(compassPoint(qiblaBearing('new-york'))).toBe('ne');
    // On the flat map the straight line points south of east (≈ 100°), the real qibla north of east (≈ 58°).
    expect(flatMapBearing(CITIES['new-york'], KAABA)).toBeGreaterThan(90);
    expect(qiblaBearing('new-york')).toBeLessThan(90);
    const path = greatCirclePoints(CITIES['new-york'], KAABA, 40);
    expect(path[0].lat).toBeCloseTo(CITIES['new-york'].lat);
    expect(path[40].lat).toBeCloseTo(KAABA.lat);
    expect(path[40].lon).toBeCloseTo(KAABA.lon);
    expect(Math.max(...path.map((p) => p.lat))).toBeGreaterThan(CITIES['new-york'].lat + 5); // arcs north first
    expect(mapPath(path).startsWith('M')).toBe(true);
    expect(distanceKm(CITIES['new-york'], KAABA)).toBeGreaterThan(10_000);
  });

  it('measures angular error with wrap-around and scores it', () => {
    expect(angleDiff(350, 10)).toBe(20);
    expect(angleDiff(10, 350)).toBe(20);
    expect(angleDiff(129, 129)).toBe(0);
    expect(angleDiff(0, 180)).toBe(180);
    expect(normalizeDeg(-30)).toBe(330);
    expect(normalizeDeg(725)).toBe(5);
    expect([0, 10, 10.5, 25, 26, 45, 46, 180].map(roundPoints)).toEqual([3, 3, 2, 2, 1, 1, 0, 0]);
    expect(compassPoint(129)).toBe('se');
    expect(compassPoint(350)).toBe('n');
  });

  it('turns errors into a level result', () => {
    expect(qiblaResult([2, 5, 8, 9])).toEqual({ score: 12, maxScore: 12, stars: 3, mistakes: 0, factsMissed: [] });
    expect(qiblaResult([5, 20, 30])).toMatchObject({ score: 6, stars: 2, mistakes: 1, factsMissed: [] });
    expect(qiblaResult([60, 50, 5])).toMatchObject({ score: 3, stars: 1, mistakes: 2, factsMissed: ['qibla-everywhere'] });
    expect(qiblaResult([5], { points: 10, max: 10 })).toMatchObject({ score: 13, maxScore: 13 });
  });
});

describe('Find the Qibla – play', () => {
  async function render(level: 1 | 2 | 3) {
    const { api, results } = fakeGameApi(findQiblaGame, level);
    let tree!: { root: Node; unmount: () => void };
    await act(async () => {
      tree = create(<FindQiblaGame {...api} />);
    });
    return { root: tree.root, results, unmount: () => act(async () => tree.unmount()) };
  }

  /** Turns the compass with the ±5° buttons from `current` to the nearest multiple of 5 of `target`. */
  async function turnTo(root: Node, current: number, target: number): Promise<number> {
    let delta = Math.round((normalizeDeg(target) - normalizeDeg(current)) / 5) * 5;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    await press(root, delta > 0 ? 'Turn right 5 degrees' : 'Turn left 5 degrees', Math.abs(delta) / 5);
    return current + delta;
  }

  it('level 1: European cities with a hint, path revealed after each check', async () => {
    const { root, results, unmount } = await render(1);
    expect(texts(root)).toContain('From Düsseldorf: turn the needle towards the Kaaba.');
    expect(texts(root)).toContain('Hint: the Kaaba lies roughly to the south-east.');
    let angle = 0;
    for (const city of ['duesseldorf', 'sarajevo', 'vienna', 'london'] as const) {
      angle = await turnTo(root, angle, qiblaBearing(city));
      await press(root, 'Face the Kaaba');
      expect(texts(root)).toContain('The gold line is the shortest path on the globe');
      await press(root, city === 'london' ? 'Finish' : 'Next city');
    }
    expect(results).toEqual([{ score: 12, maxScore: 12, stars: 3, mistakes: 0, factsMissed: [] }]);
    await unmount();
  });

  it('level 2: New York explains the north-east qibla; a far-off guess is reviewed', async () => {
    const { root, results, unmount } = await render(2);
    // Face south-east like the flat map suggests: 135° vs ≈ 58.5° → 0 points.
    await turnTo(root, 0, 135);
    await press(root, 'Face the Kaaba');
    expect(texts(root)).toContain('That’s why from New York the qibla is north-east, not south-east.');
    let angle = 135;
    await press(root, 'Next city');
    for (const city of ['istanbul', 'cairo', 'jakarta', 'cape-town'] as const) {
      angle = await turnTo(root, angle, qiblaBearing(city));
      await press(root, 'Face the Kaaba');
      await press(root, city === 'cape-town' ? 'Finish' : 'Next city');
    }
    expect(results[0]).toMatchObject({ score: 12, maxScore: 15, stars: 2, mistakes: 1, factsMissed: ['qibla-everywhere'] });
    await unmount();
  });

  it('level 3: no hint arrow', async () => {
    const { root, unmount } = await render(3);
    expect(texts(root)).toContain('No hint this time');
    await unmount();
  });
});

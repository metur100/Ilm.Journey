import type React from 'react';

import { hasArt, SKY_HORIZON } from '@/core/art';
import { findFact, getGame, validateGame } from '@/core/games';
import { getQuestionByKey } from '@/core/registry';
import { registerLearnFeature } from '@/features/learn/register';

import { fakeGameApi, namespaceProblems } from '../../wudu-flow/kit/testApi';
import { PRAYER_BODY, PRAYER_HEADING, PRAYER_NAME, SKY_FACTS, TIMES_DIFFERENCE_NOTE } from '../content';
import {
  dayResult,
  isDayOrder,
  layerOpacity,
  mixedPrayers,
  phaseAt,
  PRAYER_IDS,
  PRAYER_SPOT,
  prayerAt,
  RAKAHS,
  rakahFeedback,
  rakahResult,
  SKY_ART,
  SKY_KEYS,
  sunPoint,
  sunResult,
  SUNRISE,
  SUNSET,
} from '../logic';
import { PrayerSkyGame } from '../PrayerSkyGame';
import { prayerSkyGame, registerPrayerSkyGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

const questsSalah = require('@/features/learn/content/quests/salah.json');
const unitTimes = require('@/features/learn/content/salah/salah-times.json');

registerLearnFeature();
registerPrayerSkyGame();

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
const button = (root: Node, label: string | RegExp) =>
  root.findAll((n) => typeof n.props.onPress === 'function' && (typeof label === 'string' ? n.props.accessibilityLabel === label : label.test(String(n.props.accessibilityLabel ?? ''))))[0];
const press = async (root: Node, label: string | RegExp, times = 1) => {
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

async function render(level: 1 | 2 | 3) {
  const { api, results } = fakeGameApi(prayerSkyGame, level);
  let tree!: { root: Node; unmount: () => void };
  await act(async () => {
    tree = create(<PrayerSkyGame {...api} />);
  });
  return { root: tree.root, results, unmount: () => act(async () => tree.unmount()) };
}

describe('Prayer Sky – registration', () => {
  it('registers a valid game', () => {
    expect(() => validateGame(getGame('prayer-sky')!)).not.toThrow();
    expect(prayerSkyGame.levels).toHaveLength(3);
  });

  it('has a complete i18n namespace in en/de/bs (incl. every phase caption)', () => {
    expect(namespaceProblems(prayerSkyGame as never)).toEqual([]);
    const en = prayerSkyGame.i18n.dictionaries.en as Record<string, string>;
    for (let s = 0; s <= 1; s += 0.01) expect(en[`phase.${phaseAt(s)}`]).toBeTruthy();
  });

  it('uses only existing art', () => {
    for (const name of [...SKY_ART, prayerSkyGame.coverArt, prayerSkyGame.hintArt!]) expect(hasArt(name)).toBe(true);
    for (const level of prayerSkyGame.levels) for (const fact of level.facts) if (fact.art) expect(hasArt(fact.art)).toBe(true);
  });

  it('copies texts, rak’ahs and sources from the Salah content', () => {
    const lesson = questsSalah.lessons.find((l: { id: string }) => l.id === 'salah-five');
    expect(SKY_FACTS.fixedTimes.text).toEqual(lesson.sections[0].body);
    PRAYER_IDS.forEach((p, i) => {
      expect(PRAYER_HEADING[p]).toEqual(lesson.sections[i + 1].heading);
      expect(PRAYER_BODY[p]).toEqual(lesson.sections[i + 1].body);
      expect(PRAYER_BODY[p].en).toContain(`${RAKAHS[p]} obligatory`);
    });
    expect(TIMES_DIFFERENCE_NOTE).toEqual(lesson.differenceNote);
    expect(lesson.sources).toEqual([{ sourceName: 'Quran', sourceReference: '4:103' }]);
    const match = questsSalah.questions.find((q: { id: string }) => q.id === 'salah-rakahs-match');
    for (const pair of match.pairs) expect(String(RAKAHS[pair.id as keyof typeof RAKAHS])).toBe(pair.right.en);
    expect(SKY_FACTS.rakahs.text).toEqual(match.explanation);
    const order = questsSalah.questions.find((q: { id: string }) => q.id === 'salah-order');
    expect(order.items.map((i: { id: string }) => i.id)).toEqual([...PRAYER_IDS]);
    for (const item of order.items) expect(PRAYER_NAME[item.id as keyof typeof PRAYER_NAME]).toEqual(item.text);
    expect(SKY_FACTS.dayOrder.text).toEqual(order.explanation);
    expect(SKY_FACTS.timetables.text).toEqual(unitTimes.lesson[1].body);
  });

  it('review keys point to existing questions and missed facts belong to the game', () => {
    for (const level of prayerSkyGame.levels) for (const fact of level.facts) if (fact.reviewKey) expect(getQuestionByKey(fact.reviewKey)).toBeDefined();
    const all = [sunResult({ maghrib: 1, fajr: 2 }), rakahResult({ fajr: 1 }), dayResult(1, { maghrib: 1, asr: 1 })];
    for (const r of all) for (const id of r.factsMissed) expect(findFact(getGame('prayer-sky')!, id)).toBeDefined();
  });
});

describe('Prayer Sky – rules', () => {
  it('maps the sun position to the prayer of that moment', () => {
    expect(prayerAt(0.02)).toBe('isha');
    expect(prayerAt(0.09)).toBe('fajr');
    expect(prayerAt(0.16)).toBeNull(); // sunrise
    expect(prayerAt(0.3)).toBeNull(); // morning
    expect(prayerAt(0.5)).toBeNull(); // the sun at its very top
    expect(prayerAt(0.55)).toBe('dhuhr'); // just after the zenith
    expect(prayerAt(0.62)).toBeNull(); // the start of Asr is calculated differently
    expect(prayerAt(0.73)).toBe('asr');
    expect(prayerAt(0.85)).toBeNull(); // sunset itself
    expect(prayerAt(0.89)).toBe('maghrib');
    expect(prayerAt(0.96)).toBe('isha');
    for (const p of PRAYER_IDS) expect(prayerAt(PRAYER_SPOT[p])).toBe(p);
  });

  it('keeps the prayers in day order along the sun’s path', () => {
    const firstSeen = PRAYER_IDS.map((p) => {
      for (let i = 4; i <= 100; i++) if (prayerAt(i / 100) === p) return i;
      return -1;
    });
    expect([...firstSeen].sort((a, b) => a - b)).toEqual(firstSeen);
  });

  it('moves the sun along an arc: below the horizon at night, highest at the zenith', () => {
    expect(sunPoint(0.05).up).toBe(false);
    expect(sunPoint(0.05).y).toBeGreaterThan(SKY_HORIZON);
    expect(sunPoint(0.95).up).toBe(false);
    expect(sunPoint(0.5).up).toBe(true);
    expect(sunPoint(0.5).y).toBeLessThan(sunPoint(0.3).y);
    expect(sunPoint(0.5).y).toBeLessThan(sunPoint(0.7).y);
    expect(sunPoint(SUNRISE + 0.01).y).toBeLessThan(SKY_HORIZON);
    expect(sunPoint(SUNSET - 0.01).y).toBeLessThan(SKY_HORIZON);
    expect(sunPoint(0).x).toBeLessThan(sunPoint(1).x);
  });

  it('cross-fades the sky colours between keyframes', () => {
    expect(layerOpacity(0.5, 0)).toBe(1);
    const noon = SKY_KEYS.findIndex((k) => k.time === 'noon');
    expect(layerOpacity(0.5, noon)).toBe(1);
    expect(layerOpacity(0.5, noon + 1)).toBe(0);
    expect(layerOpacity(0.6, noon + 1)).toBeCloseTo(0.5);
  });

  it('gives rak’ah feedback and scores', () => {
    expect(rakahFeedback('fajr', 2)).toBe('right');
    expect(rakahFeedback('maghrib', 2)).toBe('more');
    expect(rakahFeedback('fajr', 4)).toBe('fewer');
    expect(PRAYER_IDS.reduce((a, p) => a + RAKAHS[p], 0)).toBe(17);
    expect(sunResult({})).toEqual({ score: 50, maxScore: 50, stars: 3, mistakes: 0, factsMissed: [] });
    expect(sunResult({ maghrib: 1 })).toMatchObject({ stars: 2, factsMissed: ['maghrib-after-sunset'] });
    expect(sunResult({ fajr: 1, asr: 2 })).toMatchObject({ stars: 1, factsMissed: ['prayer-fixed-times'] });
    expect(rakahResult({ fajr: 1 })).toMatchObject({ stars: 2, factsMissed: ['rakahs-seventeen', 'fajr-two-rakahs'] });
    expect(dayResult(0, {})).toMatchObject({ stars: 3, maxScore: 100, factsMissed: [] });
    expect(dayResult(1, { maghrib: 1 })).toMatchObject({ stars: 2, factsMissed: ['prayer-day-order', 'maghrib-after-sunset'] });
  });

  it('never starts level 3 already in order', () => {
    for (let i = 0; i < 30; i++) expect(isDayOrder(mixedPrayers())).toBe(false);
    expect(isDayOrder(PRAYER_IDS)).toBe(true);
  });
});

describe('Prayer Sky – play', () => {
  it('level 1: move the sun to each prayer (one early Fajr confirm)', async () => {
    const { root, results, unmount } = await render(1);
    expect(texts(root)).toContain('Move the sun to the time of Fajr');
    await press(root, 'Time for Fajr'); // s = 0.3, morning → mistake
    expect(texts(root)).toContain('Fajr – dawn');
    await press(root, 'Earlier', 9); // 0.12 → dawn
    await press(root, 'Time for Fajr');
    expect(texts(root)).toContain(PRAYER_BODY.fajr.en);
    await press(root, 'Next prayer');
    await press(root, 'Later', 22); // 0.56
    await press(root, 'Time for Dhuhr');
    await press(root, 'Next prayer');
    await press(root, 'Later', 5); // 0.66
    await press(root, 'Time for Asr');
    expect(texts(root)).toContain('SCHOLARS DIFFER');
    await press(root, 'Next prayer');
    await press(root, 'Later', 11); // 0.88
    await press(root, 'Time for Maghrib');
    await press(root, 'Next prayer');
    await press(root, 'Later', 3); // 0.94
    await press(root, 'Time for Isha');
    await press(root, 'Finish');
    expect(results).toEqual([{ score: 45, maxScore: 50, stars: 2, mistakes: 1, factsMissed: [] }]);
    await unmount();
  });

  it('level 2: stack the obligatory rak’ahs of each prayer', async () => {
    const { root, results, unmount } = await render(2);
    await press(root, 'Rak’ah block', 3);
    await press(root, 'That’s it'); // Fajr has 2 → "fewer"
    expect(texts(root)).toContain('Fajr has fewer');
    await press(root, 'Remove a rak’ah');
    await press(root, 'That’s it');
    for (const p of PRAYER_IDS.slice(1)) {
      await press(root, 'Next prayer');
      await press(root, 'Rak’ah block', RAKAHS[p]);
      await press(root, 'That’s it');
      expect(texts(root)).toContain(PRAYER_BODY[p].en);
    }
    await press(root, 'Finish');
    expect(results[0]).toMatchObject({ stars: 2, mistakes: 1, factsMissed: ['rakahs-seventeen', 'fajr-two-rakahs'] });
    await unmount();
  });

  it('level 3: order the day, then give each prayer its sky', async () => {
    const { root, results, unmount } = await render(3);
    const order = () =>
      root
        .findAll((n) => typeof n.type === 'string' && / position \d of 5$/.test(String(n.props.accessibilityLabel ?? '')))
        .map((n) => String(n.props.accessibilityLabel).replace(/, position \d of 5$/, ''));
    for (let target = 0; target < PRAYER_IDS.length; target++) {
      const name = PRAYER_NAME[PRAYER_IDS[target]].en;
      while (order().indexOf(name) > target) await press(root, `Move ${name} up`);
    }
    await press(root, 'Check the order');
    expect(texts(root)).toContain('Now give each prayer its sky.');
    await press(root, 'Fajr');
    await press(root, 'Sky at night'); // wrong sky
    expect(texts(root)).toContain('Not this sky');
    const sky: Record<string, string> = { fajr: 'Sky at dawn', dhuhr: 'Sky at midday', asr: 'Sky in the afternoon', maghrib: 'Sky at sunset', isha: 'Sky at night' };
    for (const p of PRAYER_IDS) {
      await press(root, PRAYER_NAME[p].en);
      await press(root, sky[p]);
    }
    expect(texts(root)).toContain('Every prayer has its sky!');
    await press(root, 'Finish');
    expect(results[0]).toMatchObject({ stars: 2, mistakes: 1, maxScore: 100, factsMissed: ['prayer-day-order'] });
    await unmount();
  });
});
